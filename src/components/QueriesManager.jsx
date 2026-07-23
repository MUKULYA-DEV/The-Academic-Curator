import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function QueriesManager() {
  const [queries, setQueries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Filtering & Pagination
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'open', 'in_progress', 'resolved', 'closed'
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Details Modal
  const [selectedQuery, setSelectedQuery] = useState(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  // Fetch queries
  const fetchQueries = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('queries')
        .select(`
          *,
          tours ( university_name, title )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setQueries(data || [])
    } catch (err) {
      console.error('Error fetching queries:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQueries()
  }, [])

  // KPI Calculations
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const totalQueries = queries.length
  const openQueries = queries.filter(q => q.status === 'open' || q.status === 'in_progress').length
  const resolvedToday = queries.filter(q => 
    q.status === 'resolved' && 
    q.resolved_at && 
    new Date(q.resolved_at) >= today
  ).length

  // Filter Logic
  const filteredQueries = queries.filter(q => {
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter
    const searchString = searchTerm.toLowerCase()
    const matchesSearch = 
      (q.first_name || '').toLowerCase().includes(searchString) ||
      (q.last_name || '').toLowerCase().includes(searchString) ||
      (q.email || '').toLowerCase().includes(searchString) ||
      (q.college_name || '').toLowerCase().includes(searchString) ||
      (q.tours?.title || '').toLowerCase().includes(searchString)
      
    return matchesStatus && matchesSearch
  })

  // Pagination Logic
  const totalPages = Math.ceil(filteredQueries.length / itemsPerPage)
  const paginatedQueries = filteredQueries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleStatusChange = async (queryId, newStatus) => {
    try {
      const updatePayload = {
        status: newStatus,
        updated_at: new Date().toISOString()
      }
      
      if (newStatus === 'resolved') {
        updatePayload.resolved_at = new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('queries')
        .update(updatePayload)
        .eq('id', queryId)
        
      if (error) throw error
      
      // Update local state
      setQueries(prev => prev.map(q => 
        q.id === queryId ? { ...q, ...updatePayload } : q
      ))
      
      if (selectedQuery && selectedQuery.id === queryId) {
        setSelectedQuery(prev => ({ ...prev, ...updatePayload }))
      }
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Failed to update status.')
    }
  }

  const handleSaveNotes = async () => {
    if (!selectedQuery) return
    setSavingNotes(true)
    try {
      const { error } = await supabase
        .from('queries')
        .update({
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedQuery.id)
        
      if (error) throw error
      
      // Update local state
      setQueries(prev => prev.map(q => 
        q.id === selectedQuery.id ? { ...q, admin_notes: adminNotes } : q
      ))
      setSelectedQuery(prev => ({ ...prev, admin_notes: adminNotes }))
      alert('Notes saved successfully!')
    } catch (err) {
      console.error('Error saving notes:', err)
      alert('Failed to save notes.')
    } finally {
      setSavingNotes(false)
    }
  }

  const openDetails = (query) => {
    setSelectedQuery(query)
    setAdminNotes(query.admin_notes || '')
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Open</span>
      case 'in_progress':
        return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">In Progress</span>
      case 'resolved':
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Resolved</span>
      case 'closed':
        return <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Closed</span>
      default:
        return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{status || 'Open'}</span>
    }
  }

  if (loading) return <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full mx-auto"></div></div>
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-xl">Error loading queries: {error}</div>

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">forum</span>
          </div>
          <div>
            <p className="text-[#545f72] text-xs font-bold uppercase tracking-widest mb-1">Total Queries</p>
            <h3 className="text-3xl font-extrabold text-[#002045] font-headline">{totalQueries}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">assignment_late</span>
          </div>
          <div>
            <p className="text-[#545f72] text-xs font-bold uppercase tracking-widest mb-1">Active Queries</p>
            <h3 className="text-3xl font-extrabold text-[#002045] font-headline">{openQueries}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">check_circle</span>
          </div>
          <div>
            <p className="text-[#545f72] text-xs font-bold uppercase tracking-widest mb-1">Resolved Today</p>
            <h3 className="text-3xl font-extrabold text-[#002045] font-headline">{resolvedToday}</h3>
          </div>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex-1 w-full relative">
          <span className="material-symbols-outlined absolute left-4 top-3 text-slate-400">search</span>
          <input 
            type="text" 
            placeholder="Search by name, email, or college..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Status:</span>
          <select 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-50 border border-slate-200 text-[#002045] px-4 py-3 rounded-xl font-bold outline-none cursor-pointer"
          >
            <option value="all">All Queries</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#002045] text-white">
              <tr>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider">User</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider">College / Tour</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider">Date</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedQueries.length > 0 ? (
                paginatedQueries.map(q => (
                  <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-[#002045]">{q.first_name} {q.last_name}</p>
                      <p className="text-sm text-slate-500">{q.email}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-[#002045]">{q.tours?.title || q.tours?.university_name || q.college_name}</p>
                      {q.course_interested && <p className="text-xs text-slate-500 mt-0.5">Course: {q.course_interested}</p>}
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-slate-600">{new Date(q.created_at).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-400">{new Date(q.created_at).toLocaleTimeString()}</p>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(q.status)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => openDetails(q)}
                        className="text-blue-600 hover:text-blue-800 font-bold text-sm px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500">
                    No queries found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing <span className="font-bold">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-bold">{Math.min(currentPage * itemsPerPage, filteredQueries.length)}</span> of <span className="font-bold">{filteredQueries.length}</span> queries
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center disabled:opacity-50 hover:bg-slate-50"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center disabled:opacity-50 hover:bg-slate-50"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Query Details Modal */}
      {selectedQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#002045]/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="bg-[#002045] px-8 py-5 flex items-center justify-between shrink-0">
              <h2 className="text-2xl font-bold text-white font-headline">Query Details</h2>
              <button 
                onClick={() => setSelectedQuery(null)}
                className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* User Info */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-[#002045] border-b pb-2">User Information</h3>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Name</p>
                    <p className="font-medium text-slate-800">{selectedQuery.first_name} {selectedQuery.last_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Email</p>
                    <a href={`mailto:${selectedQuery.email}`} className="font-medium text-blue-600 hover:underline">{selectedQuery.email}</a>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Phone</p>
                    <a href={`tel:${selectedQuery.phone}`} className="font-medium text-blue-600 hover:underline">{selectedQuery.phone}</a>
                  </div>
                </div>

                {/* Query Context */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-[#002045] border-b pb-2">Inquiry Context</h3>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Target College/Tour</p>
                    <p className="font-medium text-slate-800">{selectedQuery.tours?.title || selectedQuery.tours?.university_name || selectedQuery.college_name}</p>
                  </div>
                  {selectedQuery.course_interested && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase">Course Interested In</p>
                      <p className="font-medium text-slate-800">{selectedQuery.course_interested}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Submitted On</p>
                    <p className="font-medium text-slate-800">{new Date(selectedQuery.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="mb-8">
                <h3 className="font-bold text-lg text-[#002045] border-b pb-2 mb-4">Message</h3>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedQuery.message}</p>
                </div>
              </div>

              {/* Status Management */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="space-y-4">
                  <h3 className="font-bold text-[#002045] uppercase tracking-wider text-xs">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {['open', 'in_progress', 'resolved', 'closed'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(selectedQuery.id, status)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-all border ${
                          selectedQuery.status === status 
                            ? 'bg-[#002045] text-white border-[#002045]' 
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {status.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                  {selectedQuery.resolved_at && (
                    <p className="text-xs text-slate-500 mt-2">
                      Resolved on: {new Date(selectedQuery.resolved_at).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-[#002045] uppercase tracking-wider text-xs">Admin Notes</h3>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes about this query..."
                    className="w-full bg-white p-3 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#002045] resize-none h-24"
                  />
                  <div className="text-right">
                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="px-6 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {savingNotes ? 'Saving...' : 'Save Notes'}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}
