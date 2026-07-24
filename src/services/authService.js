import { supabase } from '../supabaseClient'

/**
 * Checks if the currently authenticated user has the 'admin' role.
 * @returns {Promise<boolean>} True if the user is an admin, false otherwise.
 */
export async function isAdmin() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return false
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      return false
    }

    return data.role === 'admin'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}
