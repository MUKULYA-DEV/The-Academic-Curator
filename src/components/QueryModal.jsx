import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function QueryModal({ isOpen, onClose, tour }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course_interested: '',
    message: ''
  })
  
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        course_interested: '',
        message: ''
      })
      setErrors({})
      setIsSuccess(false)
      setIsSubmitting(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors = {}
    
    // Name validation
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    else if (formData.name.length < 2) newErrors.name = 'Name is too short'

    // Email validation (regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Please enter a valid email address'

    // Phone validation (regex: basic international format support)
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = 'Please enter a valid phone number'

    // Message validation
    if (!formData.message.trim()) newErrors.message = 'Message is required'
    else if (formData.message.length < 10) newErrors.message = 'Message must be at least 10 characters long'
    else if (formData.message.length > 1000) newErrors.message = 'Message must be less than 1000 characters'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const checkRateLimit = () => {
    const lastSubmission = localStorage.getItem('last_query_submission')
    if (lastSubmission) {
      const timeSince = Date.now() - parseInt(lastSubmission, 10)
      // 60 seconds rate limit
      if (timeSince < 60000) {
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    if (!checkRateLimit()) {
      setErrors({ submit: 'Please wait a minute before submitting another query.' })
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const { error } = await supabase
        .from('queries')
        .insert([{
          tour_id: tour.id,
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          course_interested: formData.course_interested.trim(),
          message: formData.message.trim(),
          status: 'open' // Explicitly set scalable workflow default
        }])

      if (error) throw error

      // Success
      localStorage.setItem('last_query_submission', Date.now().toString())
      setIsSuccess(true)
      
      // Future-proofing: here is where we would trigger an Edge Function for email notifications
      // e.g. await supabase.functions.invoke('send-query-notification', { body: { queryId: data[0].id } })
      
    } catch (err) {
      console.error('Error submitting query:', err)
      setErrors({ submit: 'Failed to submit query. Please try again later.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#002045]/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#002045] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white font-headline">Ask a Query</h2>
            {tour && <p className="text-white/70 text-sm">{tour.title || tour.university_name}</p>}
          </div>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-green-600">check_circle</span>
              </div>
              <h3 className="text-2xl font-bold text-[#002045] mb-2 font-headline">Query Submitted!</h3>
              <p className="text-slate-500 mb-6">Our academic counselors will get back to you shortly regarding your inquiry.</p>
              <button 
                onClick={onClose}
                className="w-full py-3 bg-[#002045] text-white rounded-xl font-bold hover:bg-blue-900 transition-colors shadow-lg"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">error</span>
                  {errors.submit}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-slate-50 border ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-900/20'} rounded-xl text-sm outline-none focus:ring-4 transition-all`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-slate-50 border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-900/20'} rounded-xl text-sm outline-none focus:ring-4 transition-all`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Phone <span className="text-red-500">*</span></label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-slate-50 border ${errors.phone ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-900/20'} rounded-xl text-sm outline-none focus:ring-4 transition-all`}
                    placeholder="+91 98765 43210"
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Course Interested In</label>
                <input 
                  type="text" 
                  name="course_interested"
                  value={formData.course_interested}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-900/20 transition-all"
                  placeholder="e.g. B.Tech Computer Science"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Your Message <span className="text-red-500">*</span></label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-4 py-3 bg-slate-50 border ${errors.message ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-900/20'} rounded-xl text-sm outline-none focus:ring-4 transition-all resize-none`}
                  placeholder="What would you like to know?"
                />
                {errors.message ? (
                  <p className="text-xs text-red-500 mt-1">{errors.message}</p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1 text-right">{formData.message.length}/1000</p>
                )}
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#002045] text-white rounded-xl font-bold hover:bg-blue-900 transition-colors shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Query</span>
                      <span className="material-symbols-outlined text-sm">send</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
