import { supabase } from '../supabaseClient.js'

/**
 * Shared service layer containing all reusable business logic for tours.
 * Isolated from React components to ensure testability, reusability, and future integration with tools like TanStack Query.
 */

/**
 * Fetches a single tour record by its UUID.
 * @param {string} tourId - The UUID of the tour.
 * @returns {Promise<Object>} - The tour record.
 */
export async function fetchTourById(tourId) {
  if (!tourId) throw new Error('Tour ID is required')

  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .eq('id', tourId)
    .single()

  if (error) throw error
  if (!data) throw new Error('Tour not found')

  return data
}

export async function fetchTourBySlug(slug) {
  if (!slug) throw new Error('Slug is required')

  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  if (!data) throw new Error('Tour not found')

  return data
}

/**
 * Fetches a tour by legacy college name for backward compatibility.
 * @param {string} baseName 
 */
export async function fetchTourByLegacyName(baseName) {
  const { data } = await supabase
    .from('tours')
    .select('*')
    .or(`university_name.eq."${baseName}",title.eq."${baseName}"`)
    .limit(1)
    .maybeSingle()
  return data
}

/**
 * Fetches published tours, ordered by created_at descending.
 * @param {Object} [options]
 * @param {number} [options.limit] - Maximum number of tours to return.
 * @returns {Promise<Array<Object>>} - Array of tour records.
 */
export async function getPublishedTours({ limit } = {}) {
  let query = supabase
    .from('tours')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

function escapeIlikePattern(raw) {
  return raw
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
    .replace(/,/g, ' ')
}

/**
 * Searches published tours, ordered by created_at descending.
 * @param {string} searchTerm - The search keyword.
 * @param {number} [rangeFrom] - Pagination start index.
 * @param {number} [rangeTo] - Pagination end index.
 * @returns {Promise<Array<Object>>} - Array of tour records.
 */
export async function searchPublishedTours(searchTerm, rangeFrom, rangeTo) {
  let query = supabase
    .from('tours')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (searchTerm) {
    const escaped = escapeIlikePattern(searchTerm)
    const pattern = `%${escaped}%`
    query = query.or(
      `university_name.ilike.${pattern},city.ilike.${pattern},major.ilike.${pattern},course.ilike.${pattern},title.ilike.${pattern}`
    )
  }

  if (typeof rangeFrom === 'number' && typeof rangeTo === 'number') {
    query = query.range(rangeFrom, rangeTo)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Safely extracts courses and branches from the tour details JSON.
 * @param {Object} tourData - The tour record.
 * @returns {Array<Object>} - Array of course objects.
 */
export function getCourses(tourData) {
  if (!tourData || !tourData.details) return []
  return tourData.details.courses || []
}

/**
 * Returns normalized pricing details from dedicated columns.
 * Fallbacks to default values if pricing fields are missing.
 * @param {Object} tourData - The tour record.
 * @returns {Object} - Pricing state object.
 */
export function getPricing(tourData) {
  if (!tourData) {
    return {
      price: 149.00,
      discountPrice: null,
      currency: 'INR',
      currencySymbol: '₹',
      hasDiscount: false,
      savings: 0,
      discountLabel: null,
    }
  }

  const price = typeof tourData.price === 'number' ? tourData.price : 149.00
  
  // A discount exists only if discount_price is less than base price
  let discountPrice = typeof tourData.discount_price === 'number' ? tourData.discount_price : null
  if (discountPrice !== null && discountPrice >= price) {
    discountPrice = null
  }

  const currency = tourData.currency || 'INR'
  const currencySymbol = tourData.currency_symbol || '₹'
  const hasDiscount = discountPrice !== null && discountPrice !== undefined && discountPrice < price
  const savings = hasDiscount ? price - discountPrice : 0
  const discountLabel = hasDiscount 
    ? (tourData.details?.pricing?.discountLabel || 'Special Discount') 
    : null

  return {
    price,
    discountPrice,
    currency,
    currencySymbol,
    hasDiscount,
    savings,
    discountLabel,
  }
}

/**
 * Dynamically calculates the estimated total price.
 * @param {number} price - The original price.
 * @param {number|null} discountPrice - The discounted price if any.
 * @param {number} groupSize - The number of people in the group.
 * @returns {number} - The total price.
 */
export function calculateTotal(price, discountPrice, groupSize) {
  const effectivePrice = (discountPrice !== null && discountPrice !== undefined && discountPrice < price)
    ? discountPrice
    : price
  return effectivePrice * groupSize
}

/**
 * Generates a formatted booking name for display purposes in the UI.
 * @param {string} universityName - Base university name.
 * @param {string} course - Selected course.
 * @param {string} branch - Selected branch (optional).
 * @returns {string} - Formatted display string.
 */
export function formatBookingName(universityName, course, branch) {
  let name = universityName || 'Campus Tour'
  if (course) {
    name += ` — ${course}`
  }
  if (branch) {
    name += ` — ${branch}`
  }
  return name
}

/**
 * Saves (inserts or updates) a tour record in the database.
 * @param {Object} tour - The tour data object to save.
 * @returns {Promise<Object>} - The saved tour record.
 */
export async function saveTour(tour) {
  let finalSlug = tour.slug;
  
  // If this is a new tour (no id), check for slug collisions
  if (!tour.id && finalSlug) {
    const { data: existing } = await supabase
      .from('tours')
      .select('slug')
      .ilike('slug', `${finalSlug}%`);
      
    if (existing && existing.length > 0) {
      // Find the highest suffix number
      let maxSuffix = 0;
      for (const row of existing) {
        if (row.slug === finalSlug) {
          maxSuffix = Math.max(maxSuffix, 1);
        } else {
          const match = row.slug.match(new RegExp(`^${finalSlug}-(\\d+)$`));
          if (match) {
            maxSuffix = Math.max(maxSuffix, parseInt(match[1], 10));
          }
        }
      }
      
      if (maxSuffix > 0) {
        finalSlug = `${finalSlug}-${maxSuffix + 1}`;
        tour.slug = finalSlug;
      }
    }
  }

  const { data, error } = await supabase
    .from('tours')
    .upsert(tour)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Fetches a single booking by ID.
 */
export async function getBookingById(bookingId) {
  if (!bookingId) throw new Error('Booking ID is required')
  
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .maybeSingle()
    
  if (error) throw error
  return data
}

/**
 * Checks if a booking already exists for the user at the exact time.
 */
export async function checkDuplicateBooking(userId, tourId, tourDate, timeSlot, editId = null) {
  let q = supabase
    .from('bookings')
    .select('id')
    .eq('user_id', userId)
    .eq('tour_id', tourId)
    .eq('tour_date', tourDate)
    .eq('time_slot', timeSlot)
    .limit(1)

  if (editId != null) {
    q = q.neq('id', editId)
  }

  const { data, error } = await q
  if (error) {
    console.error('Error checking duplicate booking:', error)
    return false
  }
  return Array.isArray(data) && data.length > 0
}

/**
 * Creates a new booking using the secure RPC.
 */
export async function createBooking(payload) {
  const { error, data } = await supabase.rpc('create_booking', { payload })
  if (error) {
    throw new Error(error.message || 'Failed to create booking.')
  }
  return data
}

/**
 * Updates an existing booking.
 */
export async function updateBooking(editId, userId, payload) {
  const { error, data } = await supabase
    .from('bookings')
    .update(payload)
    .eq('id', editId)
    .eq('user_id', userId)
    .select()
    .single()
    
  if (error) throw error
  return data
}

/**
 * Gets all bookings for a user.
 */
export async function getUserBookings(userId) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, tours(university_name, title, image_url)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    
  if (error) {
    // Fallback if tours relation fails
    const fallback = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (fallback.error) throw fallback.error
    return fallback.data || []
  }
  return data || []
}

/**
 * Deletes/Cancels a booking.
 */
export async function cancelBooking(bookingId, userId) {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId)
    .eq('user_id', userId)
    
  if (error) throw error
  return true
}
