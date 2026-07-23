/**
 * tourJsonUtils.js
 * Utility functions for managing the details JSON structure of tours.
 */

export const CURRENT_JSON_VERSION = 1;

/**
 * Validates the schema of a tour's details JSON.
 * @param {Object} json 
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export function validateTourJson(json) {
  if (!json || typeof json !== 'object') {
    return { isValid: false, error: 'JSON must be an object' };
  }

  // Allow basic empty object to be valid if it's completely empty? No, we require standard fields.
  if (!json.version) {
    return { isValid: false, error: 'Missing version field in JSON schema' };
  }

  if (json.courses && !Array.isArray(json.courses)) {
    return { isValid: false, error: '"courses" must be an array' };
  }

  if (json.gallery && !Array.isArray(json.gallery)) {
    return { isValid: false, error: '"gallery" must be an array' };
  }
  
  if (json.gallery) {
    for (let i = 0; i < json.gallery.length; i++) {
      const item = json.gallery[i];
      if (!item.url) {
        return { isValid: false, error: `Gallery item at index ${i} is missing a "url"` };
      }
    }
  }

  if (json.faq && !Array.isArray(json.faq)) {
    return { isValid: false, error: '"faq" must be an array' };
  }

  return { isValid: true, error: null };
}

/**
 * Generates a complete default details JSON template for new colleges.
 */
export function generateDefaultTemplate() {
  return {
    version: CURRENT_JSON_VERSION,
    faq: [],
    seo: {
      title: "",
      keywords: [],
      description: ""
    },
    guide: {
      name: "",
      role: "",
      tags: [],
      image: "",
      quote: ""
    },
    story: {
      quote: "",
      title: "",
      paragraphs: []
    },
    theme: {
      accentColor: "#735C00",
      primaryColor: "#002045"
    },
    badges: [],
    courses: [],
    highlights: [],
    gallery: [],
    pricing: {
      discountLabel: null,
      originalPrice: 0,
      currencySymbol: "₹",
      discountedPrice: 0
    }
  };
}

/**
 * Sanitizes and automatically migrates older JSON versions to the latest schema.
 * @param {Object} json 
 */
export function sanitizeTourJson(json) {
  if (!json || typeof json !== 'object') return generateDefaultTemplate();

  let migrated = { ...json };

  // If no version or version 0, migrate to v1
  if (!migrated.version || migrated.version < 1) {
    migrated.version = CURRENT_JSON_VERSION;
    
    // Ensure gallery items are objects
    if (Array.isArray(migrated.gallery)) {
      migrated.gallery = migrated.gallery.map(item => {
        if (typeof item === 'string') {
          return { url: item, caption: "", alt: "", type: "image" };
        }
        return {
          url: item.url || "",
          caption: item.caption || "",
          alt: item.alt || "",
          type: item.type || "image"
        };
      });
    } else {
      migrated.gallery = [];
    }

    // Ensure all standard keys exist
    const defaultTemplate = generateDefaultTemplate();
    for (const key of Object.keys(defaultTemplate)) {
      if (migrated[key] === undefined) {
        migrated[key] = defaultTemplate[key];
      }
    }
  }

  return migrated;
}

/**
 * Helper to generate a unique SEO-friendly slug
 */
export function generateSlug(universityName, title) {
  const baseString = `${universityName} ${title}`.toLowerCase();
  return baseString
    .replace(/[^a-z0-9\s-]/g, '') // Remove invalid chars
    .replace(/\s+/g, '-')         // Replace spaces with dashes
    .replace(/-+/g, '-')          // Collapse dashes
    .trim();
}
