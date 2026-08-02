import { useEffect } from 'react'

export default function SEO({ title, description, image, url }) {
  useEffect(() => {
    // 1. Update Title
    if (title) {
      document.title = `${title} | The Academic Curator`
    } else {
      document.title = 'The Academic Curator | Book Your Campus Tour'
    }

    // 2. Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.name = 'description'
      document.head.appendChild(metaDescription)
    }
    metaDescription.content = description || 'Book authentic campus tours led by current students.'

    // 3. Open Graph Tags
    const updateOGTag = (property, content) => {
      let tag = document.querySelector(`meta[property="og:${property}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('property', `og:${property}`)
        document.head.appendChild(tag)
      }
      tag.content = content
    }

    updateOGTag('title', title ? `${title} | The Academic Curator` : 'The Academic Curator')
    updateOGTag('description', description || 'Book authentic campus tours led by current students.')
    if (image) updateOGTag('image', image)
    if (url) updateOGTag('url', url)

    // Cleanup function (optional, but good for SPA to revert to defaults)
    return () => {
      document.title = 'The Academic Curator | Book Your Campus Tour'
    }
  }, [title, description, image, url])

  return null // SEO component doesn't render anything
}
