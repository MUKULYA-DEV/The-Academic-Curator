import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.js'

export default function RecommendationsEditor({ value, onChange, excludeTourId }) {
  const [tours, setTours] = useState([])
  const [search, setSearch] = useState('')
  const [draggedIdx, setDraggedIdx] = useState(null)

  const mode = value?.mode || 'automatic'
  const limit = typeof value?.limit === 'number' ? value.limit : 3
  const tourIds = Array.isArray(value?.tour_ids) ? value.tour_ids : []

  useEffect(() => {
    async function fetchTours() {
      const { data } = await supabase
        .from('tours')
        .select('id, title, university_name, image_url')
        .eq('status', 'published')
      if (data) {
        setTours(data)
      }
    }
    fetchTours()
  }, [])

  const updateValue = (updates) => {
    onChange({ mode, limit, tour_ids: tourIds, ...updates })
  }

  const handleAdd = (id) => {
    if (!tourIds.includes(id)) {
      updateValue({ tour_ids: [...tourIds, id] })
    }
    setSearch('')
  }

  const handleRemove = (id) => {
    updateValue({ tour_ids: tourIds.filter(tid => tid !== id) })
  }

  // Drag and drop ordering
  const handleDragStart = (e, index) => {
    setDraggedIdx(index)
    e.dataTransfer.effectAllowed = "move"
    // Small delay to allow the drag image to generate before adding opacity
    setTimeout(() => {
      e.target.style.opacity = '0.5'
    }, 0)
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
    setDraggedIdx(null)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedIdx === null || draggedIdx === index) return

    const newOrder = [...tourIds]
    const draggedItem = newOrder[draggedIdx]
    newOrder.splice(draggedIdx, 1)
    newOrder.splice(index, 0, draggedItem)

    setDraggedIdx(index)
    updateValue({ tour_ids: newOrder })
  }

  const filteredTours = tours.filter(t => 
    t.id !== excludeTourId && 
    !tourIds.includes(t.id) &&
    (t.title?.toLowerCase().includes(search.toLowerCase()) || 
     t.university_name?.toLowerCase().includes(search.toLowerCase()))
  ).slice(0, 5)

  const selectedTours = tourIds.map(id => tours.find(t => t.id === id) || { id, title: 'Loading...', university_name: '' })

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Recommendation Mode</label>
          <div className="flex rounded-lg bg-slate-100 p-1">
            {['manual', 'automatic', 'disabled'].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => updateValue({ mode: m })}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-bold capitalize transition-colors ${
                  mode === m ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        
        <div className="w-24">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Limit</label>
          <input
            type="number"
            min="1"
            max="10"
            value={limit}
            onChange={(e) => updateValue({ limit: parseInt(e.target.value) || 3 })}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      {mode === 'manual' && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Selected Tours</label>
          
          <div className="mb-4 relative">
            <input
              type="text"
              placeholder="Search colleges to recommend..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
            />
            {search && filteredTours.length > 0 && (
              <div className="mt-1 rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden absolute z-10 w-full max-w-md">
                {filteredTours.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleAdd(t.id)}
                    className="flex w-full items-center gap-3 border-b border-slate-50 p-2 text-left hover:bg-slate-50"
                  >
                    <div className="h-8 w-8 shrink-0 rounded bg-slate-100 overflow-hidden">
                      {t.image_url && <img loading="lazy" decoding="async" src={t.image_url} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{t.title}</p>
                      <p className="text-xs text-slate-500">{t.university_name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 relative z-0">
            {selectedTours.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No tours selected. Automatic fallback will be used.</p>
            ) : (
              selectedTours.map((t, index) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2 shadow-sm cursor-move hover:border-slate-300 transition-colors"
                >
                  <div className="flex h-6 w-6 items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined text-sm">drag_indicator</span>
                  </div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-100 overflow-hidden font-bold text-slate-400 text-xs">
                    {t.image_url ? <img loading="lazy" decoding="async" src={t.image_url} alt="" className="h-full w-full object-cover" /> : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800">{t.title}</p>
                    <p className="truncate text-xs text-slate-500">{t.university_name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(t.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-red-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))
            )}
          </div>
          <p className="mt-2 text-[10px] text-slate-400">Drag items up and down to change recommendation priority.</p>
        </div>
      )}
    </div>
  )
}
