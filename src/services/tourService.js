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

