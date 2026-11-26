import { supabase } from '../supabaseClient'

let settingsCache = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 1000 * 60 * 5 // 5 minutes

export const settingsService = {
  /**
   * Fetch all site settings, utilizing an in-memory cache.
   * @param {boolean} forceRefresh - If true, bypasses the cache and forces a DB fetch.
   * @returns {Promise<Record<string, any>>} A dictionary of key-value settings.
   */
  async getAllSettings(forceRefresh = false) {
    const now = Date.now()
    if (!forceRefresh && settingsCache && now - cacheTimestamp < CACHE_TTL_MS) {
      return settingsCache
    }

    const { data, error } = await supabase.from('site_settings').select('key, value')
    
    if (error) {
      console.error('Error fetching site settings:', error)
      return settingsCache || {} // Fallback to stale cache or empty if failed
    }

    const settingsMap = {}
    if (data) {
      data.forEach((row) => {
        settingsMap[row.key] = row.value
      })
    }

    settingsCache = settingsMap
    cacheTimestamp = now
    return settingsCache
  },

  /**
   * Fetch a specific setting by key.
   * @param {string} key - The setting key.
   * @param {any} defaultValue - Value to return if the setting doesn't exist.
   * @returns {Promise<any>}
   */
  async getSetting(key, defaultValue = null) {
    const allSettings = await this.getAllSettings()
    return Object.hasOwn(allSettings, key) ? allSettings[key] : defaultValue
  },

  /**
   * Create or update a site setting. 
   * Requires admin privileges (enforced by RLS).
   * @param {string} key - The setting key.
   * @param {any} value - The setting value (must be JSON serializable).
   * @returns {Promise<{success: boolean, error: any}>}
   */
  async setSetting(key, value) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const payload = {
        key,
        value,
        updated_at: new Date().toISOString(),
        updated_by: user.id
      }

      const { error } = await supabase
        .from('site_settings')
        .upsert(payload, { onConflict: 'key' })

      if (error) throw error

      // Update local cache optimistically
      if (settingsCache) {
        settingsCache[key] = value
      }
      
      return { success: true, error: null }
    } catch (error) {
      console.error(`Failed to set setting '${key}':`, error)
      return { success: false, error }
    }
  },

  /**
   * Manually invalidate the local cache.
   */
  invalidateCache() {
    settingsCache = null
    cacheTimestamp = 0
  }
}
