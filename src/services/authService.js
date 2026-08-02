import { supabase } from '../supabaseClient'

/**
 * Checks if the currently authenticated user has the 'admin' role.
 * @returns {Promise<{isAuthorized: boolean, reason: string}>}
 */
export async function isAdmin() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { isAuthorized: false, reason: 'No active session or user found.' }
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      return { isAuthorized: false, reason: `Database query failed: ${error?.message || 'No role found for this user ID in user_roles table.'} (User ID: ${user.id})` }
    }

    if (data.role !== 'admin') {
       return { isAuthorized: false, reason: `User found, but role is '${data.role}', not 'admin'.` }
    }

    return { isAuthorized: true, reason: 'Success' }
  } catch (error) {
    console.error('Error checking admin status:', error)
    return { isAuthorized: false, reason: `Exception: ${error.message}` }
  }
}

/**
 * Updates the user's profile information.
 * @param {Object} attributes - The attributes to update (e.g., data: { display_name, phone }).
 */
export async function updateUserProfile(attributes) {
  const { data, error } = await supabase.auth.updateUser(attributes)
  if (error) throw error
  return data
}

/**
 * Updates the user's password.
 * @param {string} newPassword - The new password.
 */
export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({ 
    password: newPassword,
    data: {
      password_updated_at: new Date().toISOString(),
    }
  })
  if (error) throw error
  return data
}

/**
 * Upserts the user's profile in the profiles table.
 * @param {Object} profileData 
 */
export async function upsertUserProfileDb(profileData) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profileData)
  if (error) throw error
  return data
}
