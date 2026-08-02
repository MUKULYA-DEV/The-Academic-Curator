import { supabase } from '../supabaseClient.js'

/**
 * Submits a new query.
 * @param {Object} queryData 
 */
export async function submitQuery(queryData) {
  const { data, error } = await supabase
    .from('queries')
    .insert(queryData)
    .select()
    .single()
    
  if (error) throw error
  return data
}
