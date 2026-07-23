import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
// Use the service role key for admin privileges in the cleanup script
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase URL or Key. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const BUCKET = 'tour-media'

/**
 * Background Cleanup Strategy:
 * 1. Fetch all tours from the database.
 * 2. Extract all valid `storage_path` references from the cover, guide, and gallery.
 * 3. List all files in the `tour-media` bucket.
 * 4. Delete any files in the bucket that do not exist in the valid references list.
 */
async function cleanupOrphanedMedia() {
  console.log("Starting Orphaned Media Cleanup...")

  try {
    // 1 & 2. Get valid references
    const { data: tours, error: dbError } = await supabase.from('tours').select('image_url, details')
    if (dbError) throw dbError

    const validPaths = new Set()

    tours.forEach(tour => {
      // It's possible we only store URLs right now in image_url, but if we stored storage_path:
      // Note: In our current schema, main image might still be a full URL. We'll extract the path if it contains our bucket.
      if (tour.image_url && tour.image_url.includes(`${BUCKET}/`)) {
        const path = tour.image_url.split(`${BUCKET}/`)[1]
        if (path) validPaths.add(path)
      }

      if (tour.details) {
        if (tour.details.guide?.storage_path) {
          validPaths.add(tour.details.guide.storage_path)
        }
        if (tour.details.gallery) {
          tour.details.gallery.forEach(img => {
            if (img.storage_path) validPaths.add(img.storage_path)
          })
        }
      }
    })

    console.log(`Found ${validPaths.size} valid media references in the database.`)

    // 3. List all files in bucket
    // Note: Supabase storage list() only lists one folder deep by default. 
    // We have to recursively list folders (which correspond to tour UUIDs).
    const { data: folders, error: folderError } = await supabase.storage.from(BUCKET).list('', { limit: 1000 })
    if (folderError) throw folderError

    let orphanedCount = 0

    for (const folder of folders) {
      if (!folder.id) continue // Skip non-folders
      
      const tourId = folder.name
      // Check subfolders (cover, guide, gallery)
      const subfolders = ['cover', 'guide', 'gallery', 'videos', 'brochures']
      
      for (const sub of subfolders) {
        const prefix = `${tourId}/${sub}`
        const { data: files } = await supabase.storage.from(BUCKET).list(prefix, { limit: 1000 })
        
        if (files) {
          for (const file of files) {
            if (!file.id) continue // Skip `.emptyFolderPlaceholder` etc.
            
            const fullPath = `${prefix}/${file.name}`
            if (!validPaths.has(fullPath)) {
              console.log(`ORPHAN DETECTED: ${fullPath}`)
              // 4. Delete the orphan
              const { error: delError } = await supabase.storage.from(BUCKET).remove([fullPath])
              if (delError) {
                console.error(`Failed to delete orphan ${fullPath}:`, delError)
              } else {
                console.log(`DELETED ORPHAN: ${fullPath}`)
                orphanedCount++
              }
            }
          }
        }
      }
    }

    console.log(`Cleanup complete. Deleted ${orphanedCount} orphaned files.`)

  } catch (err) {
    console.error("Cleanup failed:", err)
  }
}

cleanupOrphanedMedia()
