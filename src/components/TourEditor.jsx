import { useState } from 'react'
import { saveTour } from '../services/tourService.js'
import { generateDefaultTemplate, sanitizeTourJson, validateTourJson, generateSlug } from '../utils/tourJsonUtils.js'



export default function TourEditor({ tour, onSave, onCancel }) {
  const isEditMode = !!tour

  // Top level fields
  const [universityName, setUniversityName] = useState(tour?.university_name || '')
  const [title, setTitle] = useState(tour?.title || '')
  const [city, setCity] = useState(tour?.city || '')
  const [location, setLocation] = useState(tour?.location || '')
  const [imageUrl, setImageUrl] = useState(tour?.image_url || '')
  const [price, setPrice] = useState(tour?.price || 499)
  const [discountPrice, setDiscountPrice] = useState(tour?.discount_price || '')
  const [currency, setCurrency] = useState(tour?.currency || 'INR')
  const [currencySymbol, setCurrencySymbol] = useState(tour?.currency_symbol || '₹')
  const [status, setStatus] = useState(tour?.status || 'draft')

  // JSON Details
  const [details, setDetails] = useState(() => {
    return sanitizeTourJson(tour?.details);
  })

  const [activeSubTab, setActiveSubTab] = useState('basic') // 'basic', 'courses', 'story', 'guide', 'faq', 'json', 'preview'
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [jsonError, setJsonError] = useState(null)

  // Course Helpers
  const addCourse = () => {
    setDetails(prev => ({
      ...prev,
      courses: [...(prev.courses || []), { name: '', branches: [] }]
    }))
  }

  const removeCourse = (cIdx) => {
    setDetails(prev => ({
      ...prev,
      courses: prev.courses.filter((_, idx) => idx !== cIdx)
    }))
  }

  const updateCourseName = (cIdx, val) => {
    setDetails(prev => {
      const courses = [...prev.courses]
      courses[cIdx] = { ...courses[cIdx], name: val }
      return { ...prev, courses }
    })
  }

  const addBranch = (cIdx) => {
    setDetails(prev => {
      const courses = [...prev.courses]
      courses[cIdx] = {
        ...courses[cIdx],
        branches: [...(courses[cIdx].branches || []), { name: '', seats: 30 }]
      }
      return { ...prev, courses }
    })
  }

  const removeBranch = (cIdx, bIdx) => {
    setDetails(prev => {
      const courses = [...prev.courses]
      courses[cIdx] = {
        ...courses[cIdx],
        branches: courses[cIdx].branches.filter((_, idx) => idx !== bIdx)
      }
      return { ...prev, courses }
    })
  }

  const updateBranchField = (cIdx, bIdx, field, val) => {
    setDetails(prev => {
      const courses = [...prev.courses]
      courses[cIdx] = { ...courses[cIdx] }
      courses[cIdx].branches = [...courses[cIdx].branches]
      courses[cIdx].branches[bIdx] = {
        ...courses[cIdx].branches[bIdx],
        [field]: field === 'seats' ? (Number(val) || 0) : val
      }
      return { ...prev, courses }
    })
  }

  // FAQ Helpers
  const addFaq = () => {
    setDetails(prev => ({
      ...prev,
      faq: [...(prev.faq || []), { question: '', answer: '' }]
    }))
  }

  const removeFaq = (fIdx) => {
    setDetails(prev => ({
      ...prev,
      faq: prev.faq.filter((_, idx) => idx !== fIdx)
    }))
  }

  const updateFaqField = (fIdx, field, val) => {
    setDetails(prev => {
      const faq = [...prev.faq]
      faq[fIdx] = { ...faq[fIdx], [field]: val }
      return { ...prev, faq }
    })
  }

  // Highlight Helpers
  const updateHighlightField = (hIdx, field, val) => {
    setDetails(prev => {
      const highlights = [...prev.highlights]
      highlights[hIdx] = { ...highlights[hIdx], [field]: val }
      return { ...prev, highlights }
    })
  }

  const addHighlight = () => {
    setDetails(prev => ({
      ...prev,
      highlights: [...(prev.highlights || []), { icon: 'star', title: '', description: '' }]
    }))
  }

  const removeHighlight = (hIdx) => {
    setDetails(prev => {
      const highlights = [...prev.highlights]
      highlights.splice(hIdx, 1)
      return { ...prev, highlights }
    })
  }

  // Gallery Helpers
  const addGalleryImage = () => {
    setDetails(prev => ({
      ...prev,
      gallery: [...(prev.gallery || []), { url: '', caption: '' }]
    }))
  }

  const removeGalleryImage = (gIdx) => {
    setDetails(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, idx) => idx !== gIdx)
    }))
  }

  const updateGalleryField = (gIdx, field, val) => {
    setDetails(prev => {
      const gallery = [...prev.gallery]
      gallery[gIdx] = { ...gallery[gIdx], [field]: val }
      return { ...prev, gallery }
    })
  }

  // Guide Helpers
  const updateGuideField = (field, val) => {
    setDetails(prev => ({
      ...prev,
      guide: { ...prev.guide, [field]: val }
    }))
  }

  const updateGuideTag = (tIdx, val) => {
    setDetails(prev => {
      const tags = [...prev.guide.tags]
      tags[tIdx] = val
      return { ...prev, guide: { ...prev.guide, tags } }
    })
  }

  // Story Helpers
  const updateStoryField = (field, val) => {
    setDetails(prev => ({
      ...prev,
      story: { ...prev.story, [field]: val }
    }))
  }

  const updateStoryParagraph = (pIdx, val) => {
    setDetails(prev => {
      const paragraphs = [...prev.story.paragraphs]
      paragraphs[pIdx] = val
      return { ...prev, story: { ...prev.story, paragraphs } }
    })
  }

  const addStoryParagraph = () => {
    setDetails(prev => ({
      ...prev,
      story: { ...prev.story, paragraphs: [...(prev.story.paragraphs || []), ''] }
    }))
  }

  const removeStoryParagraph = (pIdx) => {
    setDetails(prev => {
      const paragraphs = [...prev.story.paragraphs]
      paragraphs.splice(pIdx, 1)
      return { ...prev, story: { ...prev.story, paragraphs } }
    })
  }

  // SEO Helpers
  const updateSeoField = (field, val) => {
    setDetails(prev => ({
      ...prev,
      seo: { ...prev.seo, [field]: val }
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!universityName.trim()) return setErrorMsg('University Name is required')
    if (!title.trim()) return setErrorMsg('Tour Title is required')
    if (!city.trim()) return setErrorMsg('City is required')
    if (!location.trim()) return setErrorMsg('Location label is required')
    if (!imageUrl.trim()) return setErrorMsg('Image URL is required')

    setSaving(true)
    setErrorMsg('')

    try {
      // Build details payload
      const detailsPayload = {
        ...details,
        pricing: {
          discountLabel: discountPrice ? (details.pricing?.discountLabel || 'Special Discount') : null,
          originalPrice: Number(price),
          currencySymbol: currencySymbol,
          discountedPrice: discountPrice ? Number(discountPrice) : 0
        }
      }

      const tourPayload = {
        university_name: universityName.trim(),
        title: title.trim(),
        city: city.trim(),
        location: location.trim(),
        image_url: imageUrl.trim(),
        price: Number(price),
        discount_price: discountPrice ? Number(discountPrice) : null,
        currency,
        currency_symbol: currencySymbol,
        status: status,
        slug: isEditMode ? tour.slug : generateSlug(universityName, title),
        details: detailsPayload,
        updated_at: new Date().toISOString()
      }

      if (isEditMode) {
        tourPayload.id = tour.id
      }

      const savedData = await saveTour(tourPayload)
      onSave(savedData)
    } catch (err) {
      console.error(err)
      setErrorMsg(err.message || 'Failed to save college listing.')
    } finally {
      setSaving(false)
    }
  }

  const handleJsonChange = (rawJsonStr) => {
    try {
      const parsed = JSON.parse(rawJsonStr)
      const validation = validateTourJson(parsed)
      if (!validation.isValid) {
        setJsonError(validation.error)
      } else {
        setJsonError(null)
        setDetails(parsed)
      }
    } catch (err) {
      setJsonError('Invalid JSON format: ' + err.message)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0px_12px_32px_rgba(24,28,30,0.06)] border border-slate-100 overflow-hidden max-w-5xl mx-auto">
      <div className="bg-[#002045] text-white px-8 py-5 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold font-headline">{isEditMode ? `Edit College: ${tour.university_name}` : 'List New College / Residency'}</h2>
          <p className="text-xs text-blue-200">Fill standard listings and operate JSON details in a modular interface.</p>
        </div>
        <button 
          onClick={onCancel}
          className="text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Back to List</span>
        </button>
      </div>

      <div className="bg-slate-50 border-b border-slate-100 px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</label>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 outline-none"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="border-b border-slate-100 bg-slate-50 px-8 py-3 flex gap-4 overflow-x-auto no-scrollbar">
        {[
          { id: 'basic', label: 'Basic & Pricing' },
          { id: 'courses', label: 'Courses & Branches' },
          { id: 'story', label: 'Story & Highlights' },
          { id: 'guide', label: 'Campus Guide' },
          { id: 'faq', label: 'FAQ & SEO' },
          { id: 'json', label: 'Advanced: Raw JSON' },
          { id: 'preview', label: 'Preview' }
        ].map(sub => (
          <button
            key={sub.id}
            onClick={() => setActiveSubTab(sub.id)}
            className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === sub.id ? 'bg-[#002045] text-white' : 'text-slate-500 hover:bg-slate-200/55'
            }`}
          >
            {sub.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="p-8 space-y-6">
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab 1: Basic details */}
        {activeSubTab === 'basic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">University Name</label>
              <input 
                type="text" 
                value={universityName}
                onChange={e => setUniversityName(e.target.value)}
                placeholder="e.g. APJ Abdul Kalam Technological University" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-900/10"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Tour Title / College Name</label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. ITS Engineering College" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-900/10"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">City</label>
              <input 
                type="text" 
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g. Greater Noida" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-900/10"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Location Label (eg. city, State)</label>
              <input 
                type="text" 
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Greater Noida, UP" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-900/10"
                required
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Main Campus Image URL</label>
              <input 
                type="url" 
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..." 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-900/10"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4 md:col-span-2 border-t border-slate-100 pt-6">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Base Price (INR)</label>
                <input 
                  type="number" 
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="499" 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-900/10"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Discounted Price (Optional, 0 = Free)</label>
                <input 
                  type="number" 
                  value={discountPrice}
                  onChange={e => setDiscountPrice(e.target.value)}
                  placeholder="0" 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-900/10"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Currency Code</label>
                <input 
                  type="text" 
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-900/10"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Currency Symbol</label>
                <input 
                  type="text" 
                  value={currencySymbol}
                  onChange={e => setCurrencySymbol(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-900/10"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Courses & Branches */}
        {activeSubTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-[#002045] uppercase tracking-wider">Academic Offerings</h3>
              <button 
                type="button" 
                onClick={addCourse}
                className="px-3 py-1.5 bg-slate-100 text-[#002045] text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-slate-200"
              >
                <span className="material-symbols-outlined text-xs">add</span>
                <span>Add Course</span>
              </button>
            </div>

            <div className="space-y-4">
              {(details.courses || []).map((course, cIdx) => (
                <div key={cIdx} className="p-6 bg-slate-50/50 border border-slate-100 rounded-2xl relative space-y-4">
                  <button 
                    type="button" 
                    onClick={() => removeCourse(cIdx)}
                    className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-1 rounded-lg"
                    title="Remove Course"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>

                  <div className="max-w-md space-y-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Course Name</label>
                    <input 
                      type="text" 
                      value={course.name}
                      onChange={e => updateCourseName(cIdx, e.target.value)}
                      placeholder="e.g. B.Tech, MBA" 
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-1 focus:ring-blue-900/10"
                    />
                  </div>

                  {/* Branches nested list */}
                  <div className="space-y-3 pl-4 border-l-2 border-slate-200">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Branches / Specialties</h4>
                      <button 
                        type="button" 
                        onClick={() => addBranch(cIdx)}
                        className="text-xs text-[#002045] font-bold flex items-center gap-1 hover:underline"
                      >
                        <span className="material-symbols-outlined text-xs">add</span>
                        <span>Add Branch</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(course.branches || []).map((branch, bIdx) => (
                        <div key={bIdx} className="flex gap-4 items-center">
                          <input 
                            type="text" 
                            value={branch.name}
                            onChange={e => updateBranchField(cIdx, bIdx, 'name', e.target.value)}
                            placeholder="Branch Name (e.g. Computer Science)" 
                            className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-900/10"
                          />
                          <input 
                            type="number" 
                            value={branch.seats}
                            onChange={e => updateBranchField(cIdx, bIdx, 'seats', e.target.value)}
                            placeholder="Seats" 
                            className="w-24 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-900/10"
                          />
                          <button 
                            type="button" 
                            onClick={() => removeBranch(cIdx, bIdx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <span className="material-symbols-outlined text-lg">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Story & Highlights */}
        {activeSubTab === 'story' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#002045] uppercase tracking-wider">Campus Story</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Story Title</label>
                  <input 
                    type="text" 
                    value={details.story?.title || ''}
                    onChange={e => updateStoryField('title', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Paragraphs</label>
                    <button 
                      type="button" 
                      onClick={addStoryParagraph}
                      className="text-xs text-[#002045] font-bold flex items-center gap-1 hover:underline"
                    >
                      <span className="material-symbols-outlined text-xs">add</span>
                      <span>Add Paragraph</span>
                    </button>
                  </div>
                  {(details.story?.paragraphs || []).map((p, pIdx) => (
                    <div key={pIdx} className="relative">
                      <textarea 
                        value={p}
                        rows={3}
                        onChange={e => updateStoryParagraph(pIdx, e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none pr-10"
                        placeholder={`Paragraph ${pIdx + 1}`}
                      />
                      <button 
                        type="button" 
                        onClick={() => removeStoryParagraph(pIdx)}
                        className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded-lg"
                        title="Remove Paragraph"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Story Highlight Quote</label>
                  <input 
                    type="text" 
                    value={details.story?.quote || ''}
                    onChange={e => updateStoryField('quote', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-[#002045] uppercase tracking-wider">Tour Highlights</h3>
                <button 
                  type="button" 
                  onClick={addHighlight}
                  className="text-xs text-[#002045] font-bold flex items-center gap-1 hover:underline"
                >
                  <span className="material-symbols-outlined text-xs">add</span>
                  <span>Add Highlight</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(details.highlights || []).map((hl, hIdx) => (
                  <div key={hIdx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 relative">
                    <button 
                      type="button" 
                      onClick={() => removeHighlight(hIdx)}
                      className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded-lg"
                      title="Remove Highlight"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Icon Name</label>
                      <input 
                        type="text" 
                        value={hl.icon}
                        onChange={e => updateHighlightField(hIdx, 'icon', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Title</label>
                      <input 
                        type="text" 
                        value={hl.title}
                        onChange={e => updateHighlightField(hIdx, 'title', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
                      <textarea 
                        value={hl.description}
                        rows={2}
                        onChange={e => updateHighlightField(hIdx, 'description', e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Campus Guide & Gallery */}
        {activeSubTab === 'guide' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#002045] uppercase tracking-wider">Academic Lead / Guide</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Guide Name</label>
                  <input 
                    type="text" 
                    value={details.guide?.name || ''}
                    onChange={e => updateGuideField('name', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Guide Role</label>
                  <input 
                    type="text" 
                    value={details.guide?.role || ''}
                    onChange={e => updateGuideField('role', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Guide Image URL</label>
                  <input 
                    type="url" 
                    value={details.guide?.image || ''}
                    onChange={e => updateGuideField('image', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Guide Quote</label>
                  <textarea 
                    value={details.guide?.quote || ''}
                    rows={2}
                    onChange={e => updateGuideField('quote', e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Tags / Certifications</label>
                  <div className="flex gap-4">
                    {(details.guide?.tags || []).map((tag, tIdx) => (
                      <input 
                        key={tIdx}
                        type="text" 
                        value={tag}
                        onChange={e => updateGuideTag(tIdx, e.target.value)}
                        className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery images */}
            <div className="space-y-4 border-t border-slate-100 pt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-[#002045] uppercase tracking-wider">Campus Gallery</h3>
                <button 
                  type="button" 
                  onClick={addGalleryImage}
                  className="px-3 py-1.5 bg-slate-100 text-[#002045] text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-slate-200"
                >
                  <span className="material-symbols-outlined text-xs">add</span>
                  <span>Add Image</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(details.gallery || []).map((img, gIdx) => (
                  <div key={gIdx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl relative space-y-3">
                    <button 
                      type="button" 
                      onClick={() => removeGalleryImage(gIdx)}
                      className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded-lg"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Image URL</label>
                      <input 
                        type="url" 
                        value={img.url}
                        onChange={e => updateGalleryField(gIdx, 'url', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Caption</label>
                      <input 
                        type="text" 
                        value={img.caption}
                        onChange={e => updateGalleryField(gIdx, 'caption', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: FAQ & SEO */}
        {activeSubTab === 'faq' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-[#002045] uppercase tracking-wider">FAQs</h3>
                <button 
                  type="button" 
                  onClick={addFaq}
                  className="px-3 py-1.5 bg-slate-100 text-[#002045] text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-slate-200"
                >
                  <span className="material-symbols-outlined text-xs">add</span>
                  <span>Add FAQ</span>
                </button>
              </div>
              <div className="space-y-4">
                {(details.faq || []).map((item, fIdx) => (
                  <div key={fIdx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl relative space-y-3">
                    <button 
                      type="button" 
                      onClick={() => removeFaq(fIdx)}
                      className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded-lg"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Question</label>
                      <input 
                        type="text" 
                        value={item.question}
                        onChange={e => updateFaqField(fIdx, 'question', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Answer</label>
                      <textarea 
                        value={item.answer}
                        rows={2}
                        onChange={e => updateFaqField(fIdx, 'answer', e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-6">
              <h3 className="text-sm font-bold text-[#002045] uppercase tracking-wider">SEO Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">SEO Title</label>
                  <input 
                    type="text" 
                    value={details.seo?.title || ''}
                    onChange={e => updateSeoField('title', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">SEO Keywords (comma separated)</label>
                  <input 
                    type="text" 
                    value={details.seo?.keywords ? details.seo.keywords.join(', ') : ''}
                    onChange={e => {
                      const list = e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                      updateSeoField('keywords', list)
                    }}
                    placeholder="keyword1, keyword2"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">SEO Description</label>
                  <textarea 
                    value={details.seo?.description || ''}
                    rows={2}
                    onChange={e => updateSeoField('description', e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Advanced Raw JSON */}
        {activeSubTab === 'json' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-[#002045] uppercase tracking-wider">Advanced: Raw JSON Editor</h3>
            </div>
            {jsonError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-bold border border-red-200 rounded-lg">
                {jsonError}
              </div>
            )}
            <p className="text-xs text-slate-500">Edit the underlying JSON directly. Proceed with caution. Invalid JSON will block saving.</p>
            <textarea
              defaultValue={JSON.stringify(details, null, 2)}
              onChange={(e) => handleJsonChange(e.target.value)}
              className="w-full h-[500px] p-6 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl outline-none focus:ring-2 focus:ring-[#cba72f]"
            />
          </div>
        )}

        {/* Tab 7: Raw JSON Preview */}
        {activeSubTab === 'preview' && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#002045] uppercase tracking-wider">JSON Data Structure</h3>
            <p className="text-xs text-slate-400">This JSON contains all the options that are generated and operated inside details column.</p>
            <pre className="bg-slate-900 text-emerald-400 p-6 rounded-2xl text-xs font-mono overflow-auto max-h-[400px]">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        )}

        <div className="border-t border-slate-100 pt-6 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={saving || !!jsonError}
            className="px-8 py-3 bg-[#002045] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save College Listing'}
          </button>
        </div>
      </form>
    </div>
  )
}
