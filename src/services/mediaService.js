import { supabase } from '../supabaseClient'

// Constants
const BUCKET_NAME = 'tour-media'
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'application/pdf']

/**
 * Validates a file against allowed MIME types and size limits
 */
export function validateMediaFile(file) {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}. Allowed types: JPEG, PNG, WebP, GIF, MP4, PDF.`)
  }

  if (file.type.startsWith('video/')) {
    if (file.size > MAX_VIDEO_SIZE) throw new Error('Video exceeds maximum size of 50MB')
  } else {
    if (file.size > MAX_IMAGE_SIZE) throw new Error('Image exceeds maximum size of 5MB')
  }
}

/**
 * Converts images (JPEG/PNG) to WebP format for better CDN performance
 */
export async function convertToWebP(file) {
  // Only convert jpeg/png. Keep gifs, pdfs, and videos as-is.
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    return file
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Canvas to Blob failed'))
        // Generate new filename with .webp
        const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp"
        const webpFile = new File([blob], newName, { type: "image/webp" })
        resolve(webpFile)
      }, 'image/webp', 0.85) // 85% quality
    }
    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image for conversion'))
    }
    img.src = objectUrl
  })
}

/**
 * Helper to upload a file with automatic retries for transient network failures.
 */
async function uploadWithRetry(path, file, options, retries = 3) {
  let attempt = 0
  while (attempt < retries) {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, file, options)
        
      if (error) throw error
      return data
    } catch (err) {
      attempt++
      if (attempt >= retries) throw err
      // Exponential backoff: wait 1s, 2s, 4s...
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)))
    }
  }
}

/**
 * Uploads a media file for a specific tour and subfolder (type)
 * @returns {Promise<{ storage_path: string, public_url: string }>}
 */
export async function uploadTourMedia(tourId, folderType, file) {
  try {
    // 1. Validation
    validateMediaFile(file)

    // 2. Client-side processing (WebP conversion)
    const processedFile = await convertToWebP(file)

    // 3. Generate structured path: tour-media/<tour-id>/<folderType>/<uuid>.ext
    const ext = processedFile.name.split('.').pop()
    const uniqueId = crypto.randomUUID()
    const storagePath = `${tourId}/${folderType}/${uniqueId}.${ext}`

    // 4. Upload with resilience
    await uploadWithRetry(storagePath, processedFile, {
      cacheControl: '31536000', // Cache for 1 year
      upsert: false
    })

    // 5. Post-Upload Verification
    // Verify the object exists and has non-zero size before confirming success
    const { data: listData, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(`${tourId}/${folderType}/`, {
        search: `${uniqueId}.${ext}`
      })

    if (listError || !listData || listData.length === 0) {
      throw new Error('Post-upload verification failed: Object not found in storage.')
    }
    
    const uploadedObject = listData[0]
    if (!uploadedObject.metadata || uploadedObject.metadata.size === 0) {
      // It's a zero-byte file, delete it
      await deleteTourMedia(storagePath)
      throw new Error('Post-upload verification failed: Uploaded file is 0 bytes.')
    }

    // 6. Generate Public URL dynamically
    const publicUrl = getPublicUrl(storagePath)

    return { storage_path: storagePath, public_url: publicUrl }
  } catch (error) {
    console.error('Media upload failed:', error)
    throw error
  }
}

/**
 * Deletes a media file from Storage. 
 * Used for orphaned files or Compensating Rollbacks.
 */
export async function deleteTourMedia(storagePath) {
  if (!storagePath) return
  
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath])
      
    if (error) throw error
  } catch (error) {
    console.error('Failed to delete media:', error)
    // In a production environment, you might log this to a dead-letter queue
    // or rely on the background cleanup cron job to catch it later.
  }
}

/**
 * Utility to generate public URL dynamically from storage path
 */
export function getPublicUrl(storagePath) {
  if (!storagePath) return null
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath)
  return data.publicUrl
}
