import { supabase } from '../supabaseClient.js'

export async function getDashboardStats() {
  const stats = {
    totalTours: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalQueries: 0
  }

  // Get total tours
  const { count: toursCount } = await supabase
    .from('tours')
    .select('*', { count: 'exact', head: true })
  if (toursCount) stats.totalTours = toursCount

  // Get total queries
  const { count: queriesCount } = await supabase
    .from('queries')
    .select('*', { count: 'exact', head: true })
  if (queriesCount) stats.totalQueries = queriesCount

  // Get total bookings and revenue
  const { data: bookingsData } = await supabase
    .from('bookings')
    .select('total_price')
    .eq('status', 'completed')

  if (bookingsData) {
    stats.totalBookings = bookingsData.length
    stats.totalRevenue = bookingsData.reduce((acc, curr) => acc + (curr.total_price || 0), 0)
  }

  return stats
}

export async function getAdminQueries(page = 1, pageSize = 20, status = 'all') {
  let query = supabase.from('queries').select('*', { count: 'exact' })

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  query = query
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  const { data, error, count } = await query
  if (error) throw error

  return { data, count }
}

export async function updateQueryStatus(queryId, status, adminNotes = '') {
  const { data, error } = await supabase
    .from('queries')
    .update({ status, admin_notes: adminNotes })
    .eq('id', queryId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getAdminDashboardData() {
  const { data: bookingsData, error: bookingsErr } = await supabase
    .from('bookings')
    .select('*, tours(university_name, title, image_url)')
    .order('created_at', { ascending: false })
  
  if (bookingsErr) throw bookingsErr

  const { data: profilesData, error: profilesErr } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: toursData, error: toursErr } = await supabase
    .from('tours')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (toursErr) throw toursErr

  return {
    bookings: bookingsData || [],
    profiles: profilesData || [],
    tours: toursData || []
  }
}

export async function updateBookingStatus(bookingId, newStatus) {
  const { error } = await supabase
    .from('bookings')
    .update({ status: newStatus })
    .eq('id', bookingId)

  if (error) throw error
}

export async function getAllAdminQueries() {
  const { data, error } = await supabase
    .from('queries')
    .select(`
      *,
      tours ( university_name, title )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
