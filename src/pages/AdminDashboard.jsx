import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient.js'
import TourEditor from '../components/TourEditor.jsx'

export default function AdminDashboard() {
  const navigate = useNavigate()
  
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard', 'bookings', 'ambassadors', 'reports', 'settings'
  
  // Real DB Data
  const [bookings, setBookings] = useState([])
  const [profiles, setProfiles] = useState([])
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Actions loading
  const [actionLoadingId, setActionLoadingId] = useState(null)
  
  // Search query
  const [searchQuery, setSearchQuery] = useState('')
  
  // Feedback messages
  const [notification, setNotification] = useState(null)

  // Selected tour for dynamic creation/edit
  const [selectedTourForEdit, setSelectedTourForEdit] = useState(null)

  // Fetch all necessary admin stats
  async function fetchAdminData() {
    setLoading(true)
    try {
      // 1. Fetch bookings with tour details
      const { data: bookingsData, error: bookingsErr } = await supabase
        .from('bookings')
        .select('*, tours(university_name, title, image_url)')
        .order('created_at', { ascending: false })
      
      if (bookingsErr) throw bookingsErr
      setBookings(bookingsData || [])

      // 2. Fetch profiles
      const { data: profilesData, error: profilesErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (profilesErr) {
        console.warn('Profiles table not found or query error, defaulting to empty list:', profilesErr.message)
      } else {
        setProfiles(profilesData || [])
      }

      // 3. Fetch tours
      const { data: toursData, error: toursErr } = await supabase
        .from('tours')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (toursErr) throw toursErr
      setTours(toursData || [])

    } catch (err) {
      console.error('Error fetching admin dashboard data:', err)
      showNotification('Error loading dashboard data. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdminData()
  }, [])

  function showNotification(message, type = 'success') {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(null)
    }, 4000)
  }

  // Update booking status (Accept / Cancel)
  async function handleUpdateStatus(bookingId, newStatus) {
    setActionLoadingId(bookingId)
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)

      if (error) throw error

      showNotification(`Booking status updated to ${newStatus}!`)
      // Refresh local data
      fetchAdminData()
    } catch (err) {
      console.error('Error updating booking status:', err)
      showNotification('Failed to update booking status.', 'error')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Calculate dynamic stats
  const totalBookingsCount = bookings.length
  const liveToursCount = tours.length
  
  // Pending bookings: status is 'upcoming' (i.e. not completed/cancelled)
  const pendingBookings = bookings.filter(b => b.status === 'upcoming')
  const pendingCount = pendingBookings.length
  
  // Total Revenue: sum of total_price of non-cancelled bookings
  const activeBookings = bookings.filter(b => b.status !== 'cancelled')
  const totalRevenue = activeBookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0)

  // Map user names for display in lists
  function getUserDisplayName(userId, fallbackEmail = '') {
    const profile = profiles.find(p => p.id === userId)
    if (profile && (profile.first_name || profile.last_name)) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    }
    return fallbackEmail || 'Prospective Student'
  }

  // Filter bookings based on search
  const filteredBookings = bookings.filter(booking => {
    const query = searchQuery.toLowerCase()
    const tourTitle = (booking.tours?.title || booking.tours?.university_name || '').toLowerCase()
    const studentName = getUserDisplayName(booking.user_id, booking.phone_number).toLowerCase()
    const course = (booking.course || '').toLowerCase()
    const branch = (booking.branch || '').toLowerCase()
    const status = (booking.status || '').toLowerCase()
    return tourTitle.includes(query) || studentName.includes(query) || course.includes(query) || branch.includes(query) || status.includes(query)
  })

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen flex font-body antialiased">
      {/* SideNavBar Component */}
      <aside className="fixed left-0 top-0 h-full w-[280px] z-50 bg-[#002045] flex flex-col py-8 px-4 gap-y-2 font-headline text-sm tracking-wide text-white shadow-2xl">
        <div className="px-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tighter">Admin Portal</h1>
              <p className="text-xs text-slate-300 opacity-80 uppercase tracking-widest">Campus Curator</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left rounded-lg font-bold flex items-center gap-3 px-4 py-3 transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'dashboard' ? "'FILL' 1" : undefined }}>dashboard</span>
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`w-full text-left rounded-lg font-bold flex items-center gap-3 px-4 py-3 transition-all duration-200 ${activeTab === 'bookings' ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'bookings' ? "'FILL' 1" : undefined }}>calendar_today</span>
            <span>Bookings</span>
          </button>
          <button 
            onClick={() => setActiveTab('tours')}
            className={`w-full text-left rounded-lg font-bold flex items-center gap-3 px-4 py-3 transition-all duration-200 ${activeTab === 'tours' || activeTab === 'edit_tour' ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'tours' || activeTab === 'edit_tour' ? "'FILL' 1" : undefined }}>domain</span>
            <span>Manage Colleges</span>
          </button>
          <button 
            onClick={() => setActiveTab('ambassadors')}
            className={`w-full text-left rounded-lg font-bold flex items-center gap-3 px-4 py-3 transition-all duration-200 ${activeTab === 'ambassadors' ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'ambassadors' ? "'FILL' 1" : undefined }}>school</span>
            <span>Ambassadors</span>
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`w-full text-left rounded-lg font-bold flex items-center gap-3 px-4 py-3 transition-all duration-200 ${activeTab === 'reports' ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'reports' ? "'FILL' 1" : undefined }}>analytics</span>
            <span>Reports</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left rounded-lg font-bold flex items-center gap-3 px-4 py-3 transition-all duration-200 ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'settings' ? "'FILL' 1" : undefined }}>settings</span>
            <span>Settings</span>
          </button>
        </nav>
        
        <div className="mt-auto space-y-1">
          <button 
            onClick={() => navigate('/explore')}
            className="w-full bg-[#cba72f] text-[#4e3d00] font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 mb-4 hover:brightness-110 transition-all active:scale-95 text-xs uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-sm">home</span>
            <span>Client Site</span>
          </button>
          <button 
            onClick={() => fetchAdminData()}
            className="w-full text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200 flex items-center gap-3 px-4 py-3 rounded-lg text-left"
          >
            <span className="material-symbols-outlined">sync</span>
            <span>Refresh Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-[280px] min-h-screen relative pb-16">
        
        {/* TopAppBar Component */}
        <header className="fixed top-0 right-0 w-[calc(100%-280px)] z-40 bg-white/80 backdrop-blur-md shadow-sm flex justify-between items-center px-8 h-16">
          <div className="flex items-center flex-1">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input 
                className="w-full pl-12 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-900/20 transition-all outline-none text-[#181c1e]" 
                placeholder="Search bookings, courses, or users..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative scale-95 active:scale-90">
                <span className="material-symbols-outlined">notifications</span>
                {pendingCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#735c00] rounded-full"></span>
                )}
              </button>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/profile')}>
              <div className="text-right hidden sm:block">
                <p className="font-headline text-sm font-semibold text-[#002045] leading-tight">Admin Curator</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">University Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#002045] text-white flex items-center justify-center font-bold text-sm ring-2 ring-slate-100">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Global Toast Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transition-all transform duration-300 ${notification.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
            <span className="material-symbols-outlined">{notification.type === 'error' ? 'error' : 'check_circle'}</span>
            <span className="text-sm font-semibold">{notification.message}</span>
          </div>
        )}

        {/* Tab 1: Overview Dashboard */}
        {activeTab === 'dashboard' && (
          <section className="pt-24 pb-12 px-8 max-w-7xl mx-auto space-y-10">
            {/* Welcome Header */}
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-extrabold text-[#002045] tracking-tight font-headline">Institutional Overview</h2>
                <p className="text-[#545f72] text-sm mt-1">Real-time engagement metrics for the current academic cycle.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => window.print()} className="px-4 py-2 bg-white text-[#002045] text-xs font-bold rounded-lg shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors">Print Page</button>
                <button onClick={() => fetchAdminData()} className="px-4 py-2 bg-[#002045] text-white text-xs font-bold rounded-lg shadow-sm hover:opacity-90 transition-opacity">Refresh Stats</button>
              </div>
            </div>

            {/* Bento Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stat Card 1 */}
              <div className="bg-white p-6 rounded-xl shadow-[0px_12px_32px_rgba(24,28,30,0.06)] group hover:-translate-y-1 transition-transform duration-300 border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <span className="material-symbols-outlined text-[#002045]" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
                  </div>
                  <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">Total</span>
                </div>
                <p className="text-[#545f72] text-xs font-bold uppercase tracking-widest mb-1">Total Bookings</p>
                <h3 className="text-3xl font-extrabold text-[#002045] font-headline">{loading ? '...' : totalBookingsCount}</h3>
                <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#002045]" style={{ width: `${Math.min(100, (totalBookingsCount / 50) * 100)}%` }}></div>
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="bg-white p-6 rounded-xl shadow-[0px_12px_32px_rgba(24,28,30,0.06)] group hover:-translate-y-1 transition-transform duration-300 border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-[#ffe088]/20 rounded-lg">
                    <span className="material-symbols-outlined text-[#735c00]" style={{ fontVariationSettings: "'FILL' 1" }}>tour</span>
                  </div>
                  <span className="text-[#735c00] text-xs font-bold bg-[#ffe088]/30 px-2 py-1 rounded-full">Active</span>
                </div>
                <p className="text-[#545f72] text-xs font-bold uppercase tracking-widest mb-1">Live Tours</p>
                <h3 className="text-3xl font-extrabold text-[#002045] font-headline">{loading ? '...' : liveToursCount}</h3>
                <div className="mt-4 flex gap-1 items-end h-8">
                  <div className="h-4 w-1.5 bg-[#735c00] rounded-full opacity-40"></div>
                  <div className="h-6 w-1.5 bg-[#735c00] rounded-full opacity-60"></div>
                  <div className="h-3 w-1.5 bg-[#735c00] rounded-full opacity-30"></div>
                  <div className="h-8 w-1.5 bg-[#735c00] rounded-full"></div>
                  <div className="h-5 w-1.5 bg-[#735c00] rounded-full opacity-50"></div>
                </div>
              </div>

              {/* Stat Card 3 */}
              <div className="bg-white p-6 rounded-xl shadow-[0px_12px_32px_rgba(24,28,30,0.06)] group hover:-translate-y-1 transition-transform duration-300 border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <span className="material-symbols-outlined text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>pending_actions</span>
                  </div>
                  <span className="text-amber-700 text-xs font-bold bg-amber-50 px-2 py-1 rounded-full">Action Needed</span>
                </div>
                <p className="text-[#545f72] text-xs font-bold uppercase tracking-widest mb-1">Pending Confirmations</p>
                <h3 className="text-3xl font-extrabold text-[#002045] font-headline">{loading ? '...' : pendingCount}</h3>
                <p className="text-[10px] text-[#545f72] mt-4 italic">Newly booked campus residencies</p>
              </div>

              {/* Stat Card 4 */}
              <div className="bg-[#002045] text-white p-6 rounded-xl shadow-[0px_12px_32px_rgba(24,28,30,0.06)] group hover:-translate-y-1 transition-transform duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white/10 rounded-lg">
                    <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                  </div>
                  <span className="text-white/80 text-xs font-medium">All-time</span>
                </div>
                <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Total Revenue</p>
                <h3 className="text-3xl font-extrabold text-white font-headline">
                  {loading ? '...' : `₹${totalRevenue.toLocaleString('en-IN')}`}
                </h3>
                <div className="mt-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  <span className="text-xs">Based on completed/upcoming bookings</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Enrollment Requests (2/3 width) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center px-2">
                  <h3 className="text-xl font-bold text-[#002045] font-headline">Recent Enrollment Queue</h3>
                  <button onClick={() => setActiveTab('bookings')} className="text-xs font-bold text-[#002045] underline underline-offset-4 decoration-2">
                    View All Queue ({totalBookingsCount})
                  </button>
                </div>

                <div className="bg-white rounded-2xl shadow-[0px_12px_32px_rgba(24,28,30,0.06)] overflow-hidden border border-slate-100">
                  {loading ? (
                    <div className="p-12 text-center text-slate-500">Loading bookings...</div>
                  ) : pendingBookings.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                      <span className="material-symbols-outlined text-4xl block mb-2 text-slate-300">task_alt</span>
                      No pending requests in queue!
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[#545f72] text-[10px] font-bold uppercase tracking-widest">
                          <th className="px-6 py-4">Prospective Student</th>
                          <th className="px-6 py-4">Tour / College</th>
                          <th className="px-6 py-4">Tour Date</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pendingBookings.slice(0, 5).map((booking) => (
                          <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#002045] font-bold text-xs">
                                  {getUserDisplayName(booking.user_id, booking.phone_number).slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-[#002045]">
                                    {getUserDisplayName(booking.user_id, booking.phone_number)}
                                  </p>
                                  <p className="text-[10px] text-[#545f72]">{booking.phone_number || 'No phone'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="max-w-[200px] truncate">
                                <span className="text-xs font-medium px-2 py-1 bg-[#d5e0f7]/40 text-[#002045] rounded-md">
                                  {booking.tours?.title || booking.tours?.university_name || 'Campus Residency'}
                                </span>
                                <p className="text-[10px] text-slate-500 mt-1 truncate">{booking.course} {booking.branch ? `— ${booking.branch}` : ''}</p>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-sm text-[#545f72]">
                              {new Date(booking.tour_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              <p className="text-[10px] uppercase text-slate-400 font-semibold">{booking.time_slot}</p>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex justify-end gap-2">
                                <button 
                                  disabled={actionLoadingId !== null}
                                  onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                                  title="Cancel Booking"
                                >
                                  <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                                <button 
                                  disabled={actionLoadingId !== null}
                                  onClick={() => handleUpdateStatus(booking.id, 'completed')}
                                  className="px-4 py-1.5 bg-[#002045] text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
                                >
                                  Complete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Daily Schedule (1/3 width) */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <h3 className="text-xl font-bold text-[#002045] font-headline">Residency Schedule</h3>
                </div>
                
                <div className="space-y-4">
                  {loading ? (
                    <div className="p-6 text-center text-slate-400">Loading schedule...</div>
                  ) : bookings.filter(b => b.status === 'upcoming').length === 0 ? (
                    <div className="p-6 bg-white border border-slate-100 rounded-2xl text-center text-slate-500">
                      No upcoming sessions scheduled today.
                    </div>
                  ) : (
                    bookings.filter(b => b.status === 'upcoming').slice(0, 4).map((booking, idx) => {
                      // Alternate border colors
                      const borders = ['border-l-[#735c00]', 'border-l-[#002045]', 'border-l-[#adc7f7]', 'border-l-[#cba72f]']
                      const borderClass = borders[idx % borders.length]
                      
                      return (
                        <div key={booking.id} className={`bg-white p-5 rounded-2xl shadow-[0px_12px_32px_rgba(24,28,30,0.06)] border-l-4 ${borderClass} border border-slate-100`}>
                          <div className="flex justify-between mb-3">
                            <span className="text-[10px] font-bold text-[#545f72] uppercase tracking-widest">
                              {booking.time_slot === 'morning' ? '09:00 AM' : '01:30 PM'} - {new Date(booking.tour_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                          </div>
                          <h4 className="text-sm font-bold text-[#002045] mb-3 truncate">
                            {booking.tours?.title || booking.tours?.university_name || 'Campus Tour'}
                          </h4>
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-[#002045] font-bold">
                              {getUserDisplayName(booking.user_id, '').slice(0, 1).toUpperCase() || 'S'}
                            </div>
                            <span className="text-xs text-[#545f72] font-medium truncate">
                              Student: {getUserDisplayName(booking.user_id, booking.phone_number)}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
                
                <button onClick={() => setActiveTab('bookings')} className="w-full py-4 bg-slate-100 text-[#002045] text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors">
                  Expand Queue Calendar
                </button>
              </div>
            </div>

            {/* Bottom Section: Monthly Admissions Graph */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-6">
              <div className="lg:col-span-3 bg-[#002045] text-white p-8 rounded-3xl relative overflow-hidden flex flex-col items-stretch gap-6">
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold font-headline mb-1">Monthly Bookings Distribution</h3>
                    <p className="text-blue-200 text-sm max-w-md leading-relaxed">Year-over-year enrollment trends and seasonal growth peaks.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-blue-200 uppercase tracking-wider"><span class="w-2 h-2 rounded-full bg-white"></span> Current Year</span>
                  </div>
                </div>
                
                <div className="relative z-10 flex-1 min-h-[160px] flex items-end gap-2 sm:gap-4 px-2">
                  {/* CSS-based Bar Graph */}
                  {[
                    { m: 'JAN', h: '45%' },
                    { m: 'FEB', h: '35%' },
                    { m: 'MAR', h: '55%' },
                    { m: 'APR', h: '70%' },
                    { m: 'MAY', h: '85%' },
                    { m: 'JUN', h: '100%', peak: true },
                    { m: 'JUL', h: '90%' },
                    { m: 'AUG', h: '65%' },
                    { m: 'SEP', h: '75%' },
                    { m: 'OCT', h: '60%' },
                    { m: 'NOV', h: '40%' },
                    { m: 'DEC', h: '30%' }
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end items-center group h-full relative">
                      {bar.peak && (
                        <div className="absolute -top-8 bg-[#735c00] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">Peak Cycle</div>
                      )}
                      <div 
                        className={`w-full rounded-t-lg transition-all duration-500 ${bar.peak ? 'bg-[#cba72f] hover:brightness-110' : 'bg-white/20 hover:bg-white/40'}`} 
                        style={{ height: bar.h }}
                      ></div>
                      <p className="mt-2 text-[10px] font-bold text-blue-300">{bar.m}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-[#e0e3e5]/20 p-8 rounded-3xl flex flex-col justify-center border-2 border-dashed border-slate-200 text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-primary shadow-sm">
                  <span className="material-symbols-outlined">add_business</span>
                </div>
                <h4 className="text-sm font-bold text-[#002045] font-headline mb-1">Expand Platform</h4>
                <p className="text-[10px] text-[#545f72]">Add a new college or university to the platform.</p>
                <button 
                  onClick={() => {
                    setSelectedTourForEdit(null)
                    setActiveTab('edit_tour')
                  }}
                  className="mt-4 px-4 py-2 bg-[#002045] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity self-center"
                >
                  Add New College
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Tab 2: Bookings Management */}
        {activeTab === 'bookings' && (
          <section className="pt-24 pb-12 px-8 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-extrabold text-[#002045] font-headline">Manage Tour Bookings</h2>
                <p className="text-slate-500 text-sm">View, update status, and cancel bookings across all university tours.</p>
              </div>
              <button 
                onClick={() => navigate('/book-tour')}
                className="px-4 py-2.5 bg-[#002045] text-white text-xs font-bold rounded-xl shadow hover:opacity-95 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Add Booking</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center gap-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Showing {filteredBookings.length} bookings
                </span>
                <div className="flex gap-2">
                  {/* Simple helper filters */}
                  <select 
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-xs border-slate-200 rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-900/10"
                  >
                    <option value="">All Statuses</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center text-slate-500">Loading bookings...</div>
              ) : filteredBookings.length === 0 ? (
                <div className="p-12 text-center text-slate-500">No bookings match your criteria.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 text-[#545f72] text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                        <th className="px-6 py-4">Booking ID</th>
                        <th className="px-6 py-4">Student Info</th>
                        <th className="px-6 py-4">Tour / College</th>
                        <th className="px-6 py-4">Date & Time</th>
                        <th className="px-6 py-4">Price paid</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/20 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-xs text-[#002045]">
                            #BK-{String(b.id).slice(0, 5).toUpperCase()}
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-[#002045]">{getUserDisplayName(b.user_id, b.phone_number)}</p>
                            <p className="text-xs text-slate-500">{b.phone_number || 'No phone'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-[#002045]">{b.tours?.title || b.tours?.university_name || 'Campus Tour'}</p>
                            <p className="text-xs text-slate-400">{b.course} {b.branch ? `— ${b.branch}` : ''}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium">{new Date(b.tour_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
                            <p className="text-xs text-slate-400 capitalize">{b.time_slot}</p>
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-700">
                            ₹{(b.total_price || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                              b.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              b.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-200' :
                              'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {b.status || 'upcoming'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1">
                              {b.status !== 'completed' && b.status !== 'cancelled' && (
                                <>
                                  <button 
                                    disabled={actionLoadingId !== null}
                                    onClick={() => handleUpdateStatus(b.id, 'completed')}
                                    className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-40"
                                  >
                                    Accept
                                  </button>
                                  <button 
                                    disabled={actionLoadingId !== null}
                                    onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                                    className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors disabled:opacity-40"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                              <button 
                                onClick={() => navigate(`/book-tour?editId=${b.id}`)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
                                title="Edit details"
                              >
                                <span className="material-symbols-outlined text-base">edit</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tab 3: Ambassadors Management (Mocked/Static view connected to user profiles) */}
        {activeTab === 'ambassadors' && (
          <section className="pt-24 pb-12 px-8 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-extrabold text-[#002045] font-headline">Campus Ambassadors</h2>
                <p className="text-slate-500 text-sm">View registered student guides representing departments and programs.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {profiles.slice(0, 6).map((profile, index) => {
                const names = ['Sarah Jenkins', 'David Chen', 'Robert Blake', 'Emily Watson']
                const depts = ['Liberal Arts & Design', 'Computer Science & STEM', 'Fine Arts', 'Economics & Policy']
                const rating = [4.9, 4.8, 4.9, 4.7]
                
                return (
                  <div key={profile.id || index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center font-bold text-lg text-[#002045] ring-4 ring-slate-50">
                      {profile.first_name ? profile.first_name[0].toUpperCase() : 'A'}
                      {profile.last_name ? profile.last_name[0].toUpperCase() : 'B'}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#002045] text-lg">
                        {profile.first_name ? `${profile.first_name} ${profile.last_name || ''}` : names[index % names.length]}
                      </h4>
                      <p className="text-xs text-[#545f72] font-semibold tracking-wide uppercase mt-1">
                        {depts[index % depts.length]}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{profile.email}</p>
                    </div>
                    <div className="flex gap-1.5 items-center bg-[#ffe088]/20 px-3 py-1 rounded-full text-xs font-bold text-[#735c00]">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span>{rating[index % rating.length]} Score</span>
                    </div>
                    <div className="w-full border-t border-slate-100 pt-4 mt-2 flex justify-between text-xs text-slate-500">
                      <span>Tours: <b>{5 + index * 3}</b></span>
                      <span>Status: <b className="text-emerald-600">Active</b></span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Tab 4: Reports */}
        {activeTab === 'reports' && (
          <section className="pt-24 pb-12 px-8 max-w-7xl mx-auto space-y-8">
            <div>
              <h2 className="text-2xl font-extrabold text-[#002045] font-headline">Admissions &amp; Engagement Reports</h2>
              <p className="text-slate-500 text-sm">Downloadable summaries and performance metrics for campus discovery.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-[#002045]">Revenue Performance Summary</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Detailed billing and transaction history aggregated across all successful residencies.</p>
                <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-700">Total Bookings Revenue</span>
                  <span className="text-lg font-extrabold text-[#002045]">₹{totalRevenue.toLocaleString('en-IN')}</span>
                </div>
                <button 
                  onClick={() => alert('Downloading Excel report...')}
                  className="w-full py-3 bg-[#002045] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  Generate Billing Report
                </button>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-[#002045]">Residency Tour Popularity</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Breakdown of student applications categorised by campus and course track.</p>
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Engineering / B.Tech</span>
                    <span>42%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-[#002045]" style={{ width: '42%' }}></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-slate-600 pt-2">
                    <span>Management / MBA</span>
                    <span>35%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-[#735c00]" style={{ width: '35%' }}></div>
                  </div>
                </div>
                <button 
                  onClick={() => alert('Downloading PDF report...')}
                  className="w-full py-3 bg-slate-100 text-[#002045] rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  Generate Academic Analytics
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Tab 5: Settings */}
        {activeTab === 'settings' && (
          <section className="pt-24 pb-12 px-8 max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-[#002045] font-headline">Portal Settings</h2>
              <p className="text-slate-500 text-sm">Configure system parameters and default values.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#545f72] uppercase tracking-wider">Institution Name</label>
                <input 
                  type="text" 
                  defaultValue="The Academic Curator" 
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-900/10 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#545f72] uppercase tracking-wider">Contact Email (for Support Queries)</label>
                <input 
                  type="email" 
                  defaultValue="concierge@academiccurator.com" 
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-900/10 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#545f72] uppercase tracking-wider">Notification Frequency</label>
                <select className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-900/10 outline-none">
                  <option>Real-Time alerts</option>
                  <option>Daily Digest</option>
                  <option>Weekly summary</option>
                </select>
              </div>

              <button 
                onClick={() => showNotification('Settings updated successfully!')}
                className="w-full py-4 bg-[#002045] text-white rounded-xl font-bold text-sm hover:opacity-90"
              >
                Save Configuration
              </button>
            </div>
          </section>
        )}

        {/* Tab: Tours Listing */}
        {activeTab === 'tours' && (
          <section className="pt-24 pb-12 px-8 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-extrabold text-[#002045] font-headline">Explore College Listings</h2>
                <p className="text-[#545f72] text-sm mt-1">Manage and edit your institution listings, courses, templates and metadata.</p>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setSelectedTourForEdit(null)
                  setActiveTab('edit_tour')
                }}
                className="px-4 py-2.5 bg-[#002045] text-white text-xs font-bold rounded-xl shadow hover:opacity-95 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>List New College</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-slate-500">Loading colleges...</div>
              ) : tours.length === 0 ? (
                <div className="p-12 text-center text-slate-500">No colleges listed yet. Click "List New College" to start.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[#545f72] text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                        <th className="px-6 py-4">College Details</th>
                        <th className="px-6 py-4">University Affiliate</th>
                        <th className="px-6 py-4">Location</th>
                        <th className="px-6 py-4">Pricing</th>
                        <th className="px-6 py-4">Courses Offered</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {tours.map((t) => {
                        const coursesCount = t.details?.courses?.length || 0
                        return (
                          <tr key={t.id} className="hover:bg-slate-50/20 transition-colors">
                            <td className="px-6 py-4 flex items-center gap-3">
                              {t.image_url ? (
                                <img src={t.image_url} alt={t.title} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#002045]">
                                  <span className="material-symbols-outlined text-lg">school</span>
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-[#002045]">{t.title}</p>
                                <p className="text-[10px] text-slate-400 font-mono">#{String(t.id).slice(0, 8)}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-700">
                              {t.university_name}
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                              {t.location}
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-semibold">{t.currency_symbol}{t.price}</p>
                              {t.discount_price !== null && (
                                <p className="text-xs text-emerald-600 font-bold">Discount: {t.currency_symbol}{t.discount_price}</p>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-medium px-2.5 py-1 bg-blue-50 text-[#002045] rounded-full font-bold">
                                {coursesCount} Courses
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                type="button"
                                onClick={() => {
                                  setSelectedTourForEdit(t)
                                  setActiveTab('edit_tour')
                                }}
                                className="px-3 py-1.5 bg-slate-100 text-[#002045] text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
                              >
                                Edit / Operate Details
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tab: Tour Editor Component Integration */}
        {activeTab === 'edit_tour' && (
          <section className="pt-24 pb-12 px-8 max-w-7xl mx-auto">
            <TourEditor 
              tour={selectedTourForEdit}
              onSave={(savedTour) => {
                showNotification(`College ${selectedTourForEdit ? 'updated' : 'listed'} successfully!`)
                fetchAdminData()
                setActiveTab('tours')
              }}
              onCancel={() => {
                setActiveTab('tours')
              }}
            />
          </section>
        )}
      </main>
    </div>
  )
}
