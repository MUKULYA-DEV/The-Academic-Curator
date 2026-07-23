import React, { useState, useRef } from 'react'
import { uploadTourMedia, getPublicUrl } from '../services/mediaService'

export default function MediaPicker({ 
  tourId, 
  folderType, 
  label, 
  currentStoragePath, 
  currentUrl, 
  onUploadSuccess, 
  onClear 
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)
  const [localPreview, setLocalPreview] = useState(null)
  
  const fileInputRef = useRef(null)

  // Use the canonical URL from storage path if available, fallback to currentUrl (for legacy data), or localPreview
  const displayUrl = localPreview || (currentStoragePath ? getPublicUrl(currentStoragePath) : currentUrl)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFileSelection(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFileSelection(e.target.files[0])
    }
  }

  const handleFileSelection = async (file) => {
    if (!tourId) {
      setError('Please set the University Name and Tour Title first to generate a Tour ID before uploading media.')
      return
    }

    try {
      setError(null)
      setIsUploading(true)

      // 1. Show immediate local preview
      const objectUrl = URL.createObjectURL(file)
      setLocalPreview(objectUrl)

      // 2. Upload to Supabase Storage via Media Service
      const { storage_path, public_url } = await uploadTourMedia(tourId, folderType, file)
      
      // 3. Callback with the successful data
      if (onUploadSuccess) {
        onUploadSuccess({ storage_path, public_url })
      }

    } catch (err) {
      console.error(err)
      setError(err.message || 'Upload failed. Please try again.')
      setLocalPreview(null) // Revert preview on failure
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = '' // Reset input
      }
    }
  }

  const handleClear = () => {
    setLocalPreview(null)
    setError(null)
    if (onClear) onClear()
  }

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>}
      
      <div 
        className={`relative w-full rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden flex flex-col items-center justify-center
          ${isDragging ? 'border-[#002045] bg-[#002045]/5' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}
          ${displayUrl ? 'p-2' : 'p-8'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        
        {/* Hidden file input */}
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept="image/jpeg, image/png, image/webp, image/gif"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        {displayUrl ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden group">
            <img 
              src={displayUrl} 
              alt="Media Preview" 
              className={`w-full h-full object-cover transition-opacity ${isUploading ? 'opacity-50' : 'opacity-100'}`}
            />
            
            {/* Loading Overlay */}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="bg-white px-4 py-2 rounded-full font-bold text-xs text-[#002045] shadow-lg flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#002045] border-t-transparent rounded-full animate-spin"></div>
                  Uploading & Optimizing...
                </div>
              </div>
            )}

            {/* Hover Actions (when not uploading) */}
            {!isUploading && (
              <div className="absolute inset-0 bg-[#002045]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white text-[#002045] px-4 py-2 rounded-lg font-bold text-xs hover:scale-105 transition-transform shadow-lg"
                >
                  Replace
                </button>
                <button 
                  type="button"
                  onClick={handleClear}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-xs hover:scale-105 transition-transform shadow-lg"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors ${isDragging ? 'bg-[#002045] text-white' : 'bg-white text-slate-400 shadow-sm'}`}>
              <span className="material-symbols-outlined">cloud_upload</span>
            </div>
            <h4 className="text-sm font-bold text-[#002045]">
              {isUploading ? 'Uploading...' : 'Drag & Drop Media'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">
              or click to browse from your computer
            </p>
            <button 
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 px-6 py-2 bg-white border border-slate-200 text-[#002045] rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            >
              Select File
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-2">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
    </div>
  )
}
