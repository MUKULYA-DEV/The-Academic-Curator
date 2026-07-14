import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { supabase } from '../supabaseClient.js'

// Pure, async fetching function compatible with TanStack Query's queryFn
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

// 1. HeroSection Component
function HeroSection({
  title,
  universityName,
  location,
  dateLine,
  imageUrl,
  badges,
  theme,
}) {
  const accentColor = theme?.accentColor || ''
  const badgesList = badges || []

  return (
    <section className="relative h-[716px] w-full overflow-hidden">
      <img
        alt={`${universityName} cover`}
        className="h-full w-full object-cover"
        src={imageUrl}
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
      <div className="absolute bottom-0 left-0 mx-auto flex w-full max-w-7xl flex-col items-start p-8 text-on-primary md:p-16">
        <div className="font-label mb-6 flex flex-wrap items-center gap-2 text-sm tracking-widest uppercase opacity-80">
          <span>{location}</span>
          {badgesList.map((badge, index) => (
            <span key={index} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[10px]">
                fiber_manual_record
              </span>
              <span>{badge}</span>
            </span>
          ))}
        </div>
        <h1 className="font-headline mb-6 text-4xl leading-none font-extrabold tracking-tighter md:text-7xl">
          {universityName}
          <br />
          {title}
        </h1>
        <div className="font-headline flex flex-wrap gap-8 text-lg font-bold md:text-xl">
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-tertiary-fixed"
              style={accentColor ? { color: accentColor } : {}}
            >
              calendar_today
            </span>
            <span>{dateLine || 'Schedule TBD'}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

// 2. HighlightsSection Component
function HighlightsSection({ highlights, theme }) {
  if (!highlights || highlights.length === 0) return null

  const primaryText = theme?.primaryColor ? { color: theme.primaryColor } : {}
  const accentBorder = theme?.accentColor
    ? { borderColor: theme.accentColor }
    : {}

  return (
    <section>
      <h2
        className="font-headline mb-8 text-2xl font-extrabold tracking-tight text-primary"
        style={primaryText}
      >
        Tour Highlights
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {highlights.map((highlight, index) => (
          <div
            key={index}
            style={accentBorder}
            className="group rounded-xl border-l-4 border-tertiary bg-surface-container-low p-8 transition-all duration-300 hover:bg-surface-container-lowest"
          >
            {highlight.icon && (
              <span
                className="material-symbols-outlined mb-4 block text-3xl text-primary"
                style={primaryText}
              >
                {highlight.icon}
              </span>
            )}
            <h3
              className="font-headline mb-2 text-lg font-bold text-primary"
              style={primaryText}
            >
              {highlight.title}
            </h3>
            <p className="text-sm leading-relaxed text-secondary">
              {highlight.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

// 3. StorySection Component
function StorySection({ story, theme }) {
  if (!story || (!story.paragraphs && !story.quote)) return null

  const primaryText = theme?.primaryColor ? { color: theme.primaryColor } : {}
  const accentBorder = theme?.accentColor
    ? { borderColor: theme.accentColor }
    : {}

  return (
    <section className="max-w-none">
      <h2
        className="font-headline mb-8 text-3xl font-extrabold tracking-tight text-primary"
        style={primaryText}
      >
        {story.title || 'A Scholarly Journey'}
      </h2>
      <div className="font-body space-y-6 text-lg leading-relaxed text-on-surface-variant">
        {story.paragraphs &&
          story.paragraphs.map((p, index) => (
            <p key={index} dangerouslySetInnerHTML={{ __html: p }} />
          ))}
        {story.quote && (
          <div
            style={accentBorder}
            className="relative my-12 border-l-2 border-outline-variant pl-8"
          >
            <p
              className="text-xl font-medium italic text-primary"
              style={primaryText}
            >
              &quot;{story.quote}&quot;
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

// 3.5. CoursesSection Component
function CoursesSection({ courses, theme }) {
  if (!courses || courses.length === 0) return null

  const primaryTextColor = theme?.primaryColor ? { color: theme.primaryColor } : {}
  const [openCourseIndex, setOpenCourseIndex] = useState(null)

  function toggleCourse(index) {
    setOpenCourseIndex(openCourseIndex === index ? null : index)
  }

  return (
    <section className="space-y-6">
      <h2
        className="font-headline mb-4 text-2xl font-extrabold tracking-tight text-primary"
        style={primaryTextColor}
      >
        Courses & Programs Offered
      </h2>
      <div className="space-y-4">
        {courses.map((course, index) => {
          const isOpen = openCourseIndex === index
          return (
            <div
              key={course.name}
              className="group rounded-2xl border border-outline-variant bg-surface-container-low transition-all duration-300 hover:border-primary/40 hover:shadow-sm"
              style={isOpen ? { borderColor: theme?.primaryColor || 'inherit' } : {}}
            >
              <button
                type="button"
                onClick={() => toggleCourse(index)}
                className="flex w-full items-center justify-between px-6 py-5 text-left font-headline text-lg font-bold text-primary"
                style={primaryTextColor}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary">school</span>
                  <span>{course.name}</span>
                </div>
                <span
                  className={`material-symbols-outlined transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  style={primaryTextColor}
                >
                  expand_more
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-outline-variant/60 px-6 py-5 bg-white/40 rounded-b-2xl animate-fade-in">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-outline-variant text-xs uppercase tracking-wider text-secondary">
                          <th className="pb-3 font-bold">Branch / Specialization</th>
                          <th className="pb-3 text-right font-bold">Available Seats</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/40">
                        {course.branches && course.branches.length > 0 ? (
                          course.branches.map((branch) => (
                            <tr key={branch.name} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                              <td className="py-3 font-semibold text-primary">{branch.name}</td>
                              <td className="py-3 text-right font-bold text-secondary">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-2.5 py-1 text-xs font-bold text-on-secondary-container">
                                  {branch.seats} Seats
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="2" className="py-4 text-center text-secondary">
                              No specializations listed.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

// 4. GuideSection Component
function GuideSection({ guide, theme }) {
  if (!guide) return null

  const primaryBg = theme?.primaryColor
    ? { backgroundColor: theme.primaryColor }
    : {}
  const accentText = theme?.accentColor ? { color: theme.accentColor } : {}

  return (
    <section
      className="flex flex-col overflow-hidden rounded-xl bg-primary text-on-primary shadow-xl md:flex-row"
      style={primaryBg}
    >
      {guide.image && (
        <div className="md:w-1/3">
          <img
            alt={`Portrait of ${guide.name}`}
            className="h-full w-full object-cover animate-fade-in"
            src={guide.image}
            loading="lazy"
          />
        </div>
      )}
      <div className="flex flex-col justify-center p-8 md:w-2/3 md:p-12">
        <span
          className="font-label mb-2 text-xs font-bold tracking-widest text-tertiary-fixed uppercase"
          style={accentText}
        >
          {guide.role || 'Your Guide'}
        </span>
        <h3 className="font-headline mb-4 text-3xl font-extrabold">
          {guide.name}
        </h3>
        {guide.quote && (
          <p className="mb-6 text-lg leading-relaxed text-primary-fixed-dim italic">
            &quot;{guide.quote}&quot;
          </p>
        )}
        {guide.tags && guide.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-4">
            {guide.tags.map((tag, index) => (
              <span
                key={index}
                className="rounded-full bg-white/10 px-4 py-1 font-label text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// 5. GallerySection Component
function GallerySection({ gallery, theme }) {
  if (!gallery || gallery.length === 0) return null

  const scrollRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(null)
  const primaryText = theme?.primaryColor ? { color: theme.primaryColor } : {}

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      const scrollTo =
        direction === 'left'
          ? scrollLeft - clientWidth * 0.75
          : scrollLeft + clientWidth * 0.75
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
    }
  }

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (activeIndex === null) return

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1))
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1))
      } else if (e.key === 'Escape') {
        setActiveIndex(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, gallery])

  const activeImage = activeIndex !== null ? gallery[activeIndex] : null

  return (
    <section className="relative">
      <div className="flex items-center justify-between mb-8">
        <h2
          className="font-headline text-2xl font-extrabold tracking-tight text-primary"
          style={primaryText}
        >
          Campus Gallery
        </h2>
        {gallery.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-surface-container-low hover:bg-surface-container-high transition-colors text-primary active:scale-95 shadow-sm"
              aria-label="Previous image"
              style={primaryText}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              onClick={() => scroll('right')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-surface-container-low hover:bg-surface-container-high transition-colors text-primary active:scale-95 shadow-sm"
              aria-label="Next image"
              style={primaryText}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-none snap-x snap-mandatory pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {gallery.map((item, index) => (
          <div
            key={index}
            onClick={() => setActiveIndex(index)}
            className="group relative min-w-[280px] sm:min-w-[400px] md:min-w-[480px] aspect-[16/10] overflow-hidden rounded-2xl bg-surface-container-low snap-start shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
          >
            <img
              alt={item.caption || 'Campus view'}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={item.url}
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop';
              }}
            />
            {item.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-6 text-white pt-12">
                <p className="text-sm md:text-base font-semibold tracking-wide leading-snug drop-shadow-sm">
                  {item.caption}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox / Fullscreen Overlay */}
      {activeImage && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-sm cursor-zoom-out animate-fade-in"
          onClick={() => setActiveIndex(null)}
        >
          <button
            onClick={() => setActiveIndex(null)}
            className="absolute top-6 right-6 text-white hover:text-slate-300 transition-colors flex items-center justify-center p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 z-50"
            aria-label="Close fullscreen view"
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>

          {gallery.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1))
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/25 p-3 rounded-full transition-colors active:scale-95 z-50 flex items-center justify-center"
                aria-label="Previous image"
              >
                <span className="material-symbols-outlined text-3xl">chevron_left</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1))
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/25 p-3 rounded-full transition-colors active:scale-95 z-50 flex items-center justify-center"
                aria-label="Next image"
              >
                <span className="material-symbols-outlined text-3xl">chevron_right</span>
              </button>
            </>
          )}

          <img
            alt={activeImage.caption || 'Campus view fullscreen'}
            className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl transition-transform duration-300 scale-100"
            src={activeImage.url}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop';
            }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
          />

          {activeImage.caption && (
            <p className="mt-6 max-w-2xl px-4 text-center text-base md:text-lg font-medium text-white tracking-wide">
              {activeImage.caption}
            </p>
          )}
        </div>
      )}
    </section>
  )
}

// 6. FAQSection Component
function FAQSection({ faq, theme }) {
  if (!faq || faq.length === 0) return null

  const primaryText = theme?.primaryColor ? { color: theme.primaryColor } : {}

  return (
    <section>
      <h2
        className="font-headline mb-8 text-2xl font-extrabold tracking-tight text-primary"
        style={primaryText}
      >
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faq.map((item, index) => (
          <details
            key={index}
            className="group rounded-xl border border-outline-variant bg-surface-container-low p-6 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary
              className="flex cursor-pointer items-center justify-between gap-1.5 text-primary"
              style={primaryText}
            >
              <h3 className="font-headline text-lg font-bold">
                {item.question}
              </h3>
              <span className="material-symbols-outlined shrink-0 transition-transform group-open:-rotate-180">
                expand_more
              </span>
            </summary>
            <p className="mt-4 text-sm leading-relaxed text-secondary">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}

// 7. LoadingSkeleton Component
function LoadingSkeleton() {
  return (
    <div className="bg-background min-h-screen animate-pulse">
      <div className="relative h-[600px] w-full bg-surface-container-high" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-8 py-16 lg:grid-cols-12">
        <div className="space-y-12 lg:col-span-8">
          <div className="space-y-4">
            <div className="h-8 w-1/3 rounded bg-surface-container-high" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="h-40 rounded-xl bg-surface-container-low" />
              <div className="h-40 rounded-xl bg-surface-container-low" />
              <div className="h-40 rounded-xl bg-surface-container-low" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-10 w-1/2 rounded bg-surface-container-high" />
            <div className="h-4 w-full rounded bg-surface-container-low" />
            <div className="h-4 w-5/6 rounded bg-surface-container-low" />
            <div className="h-4 w-4/5 rounded bg-surface-container-low" />
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="h-96 rounded-xl bg-surface-container-high" />
        </div>
      </div>
    </div>
  )
}

// 8. ErrorPage Component
function ErrorPage({ message }) {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="material-symbols-outlined text-error mb-4 text-7xl">
        error
      </span>
      <h1 className="font-headline text-primary mb-2 text-3xl font-extrabold">
        Tour Not Found
      </h1>
      <p className="text-secondary mb-8 max-w-md">
        {message ||
          "We couldn't find the college tour details you are looking for."}
      </p>
      <Link
        to="/explore-tours"
        className="font-headline rounded-full bg-primary px-8 py-3 text-sm font-bold text-on-primary transition-opacity hover:opacity-90"
      >
        Back to Explore
      </Link>
    </div>
  )
}

// Default static content fallback templates for schema properties
const defaultDetails = {
  version: 1,
  theme: {},
  seo: {
    title: 'University Residency Tour | The Academic Curator',
    description:
      'Book an immersive residency tour guided by official student ambassadors.',
  },
  badges: ['Prestige Series'],
  story: {
    title: 'A Scholarly Journey',
    paragraphs: [
      'Welcome to our premium university residency tour. This curated experience offers a deep look into the academic traditions, research centers, and student legacy of the campus.',
      'Explore historical libraries, modern student hubs, and communal spaces while learning firsthand about admissions, campus culture, and research opportunities from our expert guides.',
    ],
    quote:
      'This campus is built on a legacy of excellence, and this tour bridges the past with the future.',
  },
  highlights: [
    {
      icon: 'menu_book',
      title: 'Academic Access',
      description:
        'Insight into historical libraries, laboratories, and lecture halls.',
    },
    {
      icon: 'directions_walk',
      title: 'Campus Walk',
      description:
        'Guided walking tour highlighting key architectural landmarks.',
    },
    {
      icon: 'groups',
      title: 'Student Q&A',
      description: 'Direct conversation with current student ambassadors.',
    },
  ],
  faq: [
    {
      question: 'Can I cancel my tour?',
      answer:
        'Yes, free cancellation is available up to 48 hours before the tour start time.',
    },
  ],
  courses: [
    {
      name: 'B.Tech',
      branches: [
        { name: 'Computer Science & Engineering', seats: 60 },
        { name: 'Information Technology', seats: 45 },
        { name: 'Electronics & Communication Engineering', seats: 30 },
        { name: 'Mechanical Engineering', seats: 30 },
      ],
    },
    {
      name: 'MBA',
      branches: [
        { name: 'Finance', seats: 20 },
        { name: 'Marketing', seats: 25 },
        { name: 'Human Resource Management', seats: 15 },
      ],
    },
  ],
}

// Main Page Controller
export default function College() {
  const [searchParams] = useSearchParams()
  const tourId = searchParams.get('tourId')
  const [tourData, setTourData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)

  // Floating Query modal states
  const [isQueryOpen, setIsQueryOpen] = useState(false)
  const [queryFirstName, setQueryFirstName] = useState('')
  const [queryLastName, setQueryLastName] = useState('')
  const [queryEmail, setQueryEmail] = useState('')
  const [queryPhone, setQueryPhone] = useState('')
  const [queryMessage, setQueryMessage] = useState('')
  const [submittingQuery, setSubmittingQuery] = useState(false)
  const [querySuccess, setQuerySuccess] = useState(false)

  // Load user details for query pre-fill
  useEffect(() => {
    async function loadUserDetails() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setQueryEmail(user.email ?? '')
        setQueryPhone(user.user_metadata?.phone ?? '')
        
        const metadata = user.user_metadata || {}
        const googleName = metadata.name || metadata.full_name || ''
        const fName = metadata.first_name || (googleName ? googleName.split(' ')[0] : '')
        const lName = metadata.last_name || (googleName ? googleName.split(' ').slice(1).join(' ') : '')
        
        setQueryFirstName(String(fName ?? '').trim())
        setQueryLastName(String(lName ?? '').trim())
      }
    }
    loadUserDetails()
  }, [])

  const handleQuerySubmit = async (e) => {
    e.preventDefault()
    setSubmittingQuery(true)
    
    // Simulate submission latency
    setTimeout(() => {
      setSubmittingQuery(false)
      setQuerySuccess(true)
      setQueryMessage('')
      
      setTimeout(() => {
        setQuerySuccess(false)
        setIsQueryOpen(false)
      }, 2000)
    }, 800)
  }

  useEffect(() => {
    if (!tourId) {
      setErrorMsg('No Tour ID provided in the URL.')
      setLoading(false)
      return
    }

    async function loadData() {
      try {
        setLoading(true)
        setErrorMsg(null)
        const data = await fetchTourById(tourId)
        setTourData(data)
      } catch (err) {
        console.error('Error loading tour details:', err)
        setErrorMsg('The requested tour could not be loaded or does not exist.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [tourId])

  // SEO updates based on dynamic JSON fields
  useEffect(() => {
    if (!tourData) return

    const details = tourData.details || {}
    const seoTitle =
      details.seo?.title ||
      `${tourData.university_name || 'University'} Tour | The Academic Curator`
    const seoDesc =
      details.seo?.description ||
      `Explore ${tourData.university_name || 'campus'} with our student-led guide.`

    document.title = seoTitle

    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', seoDesc)
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = seoDesc
      document.getElementsByTagName('head')[0].appendChild(meta)
    }
  }, [tourData])

  if (loading) {
    return <LoadingSkeleton />
  }

  if (errorMsg || !tourData) {
    return <ErrorPage message={errorMsg} />
  }

  // Parse details jsonb with safety fallbacks
  const details =
    tourData.details && Object.keys(tourData.details).length > 0
      ? tourData.details
      : defaultDetails

  const theme = details.theme || {}
  const story = details.story || defaultDetails.story
  const highlights = details.highlights || defaultDetails.highlights
  const guide = details.guide || null
  const gallery = details.gallery || []
  const faq = details.faq || defaultDetails.faq
  const badges = details.badges || defaultDetails.badges
  const pricing = details.pricing || null
  const courses = details.courses || defaultDetails.courses || []

  // Dynamic Theme Styling Object
  const primaryTextColor = theme.primaryColor ? { color: theme.primaryColor } : {}
  const primaryBgColor = theme.primaryColor
    ? { backgroundColor: theme.primaryColor }
    : {}

  // Determine dynamic price rendering elements (Default to INR ₹)
  let originalPriceElement = null
  let currentPriceElement = null

  if (pricing) {
    const orig = pricing.originalPrice
    const disc = pricing.discountedPrice
    const curSymbol = pricing.currencySymbol || '₹'

    if (orig !== undefined && orig !== null && orig !== disc) {
      originalPriceElement = (
        <span className="text-secondary line-through mr-2 text-lg">
          {curSymbol}{orig}
        </span>
      )
    }

    currentPriceElement = (
      <span
        className="font-headline text-3xl font-extrabold text-primary"
        style={primaryTextColor}
      >
        {curSymbol}{disc !== undefined ? disc : '0.00'}
      </span>
    )
  } else {
    // Fallback to normal database column or hardcoded price
    const curSymbol = '₹'
    const basePrice =
      tourData.price !== undefined && tourData.price !== null
        ? tourData.price
        : '149.00'
    currentPriceElement = (
      <span
        className="font-headline text-3xl font-extrabold text-primary"
        style={primaryTextColor}
      >
        {curSymbol}{basePrice}
      </span>
    )
  }

  const bookLink = `/book-tour?tourId=${encodeURIComponent(tourData.id)}`

  return (
    <div className="selection:bg-tertiary-container selection:text-on-tertiary-container bg-background font-body text-on-background">
      <Navbar active="explore" />

      <main className="pt-0">
        <HeroSection
          title={tourData.title}
          universityName={tourData.university_name}
          location={tourData.location || tourData.city || 'Campus'}
          dateLine={tourData.date_line}
          imageUrl={tourData.image_url}
          badges={badges}
          theme={theme}
        />

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-8 py-16 lg:grid-cols-12">
          <div className="space-y-16 lg:col-span-8">
            <HighlightsSection highlights={highlights} theme={theme} />
            <StorySection story={story} theme={theme} />
            <CoursesSection courses={courses} theme={theme} />
            <GuideSection guide={guide} theme={theme} />
            <GallerySection gallery={gallery} theme={theme} />
            <FAQSection faq={faq} theme={theme} />
          </div>

          <aside className="space-y-8 lg:col-span-4">
            <div className="sticky top-28 space-y-6 rounded-xl bg-surface-container-high p-8">
              <div className="flex items-end justify-between flex-wrap gap-2">
                <div>
                  <span className="font-label mb-1 block text-sm uppercase tracking-wider text-secondary">
                    Price per person
                  </span>
                  <div className="flex items-baseline flex-wrap">
                    {originalPriceElement}
                    {currentPriceElement}
                  </div>
                  {pricing?.discountLabel && (
                    <span className="block text-xs font-bold text-green-600 mt-1 uppercase tracking-wide">
                      {pricing.discountLabel}
                    </span>
                  )}
                </div>
                {tourData.badge && (
                  <span className="font-label flex items-center gap-1 rounded-full bg-tertiary-container px-3 py-1 text-xs font-bold text-on-tertiary-container">
                    <span className="material-symbols-outlined text-[14px]">
                      bolt
                    </span>
                    {tourData.badge}
                  </span>
                )}
              </div>
              <div className="space-y-4 border-t border-outline-variant pt-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-white p-2 shadow-sm">
                    <span
                      className="material-symbols-outlined text-primary"
                      style={primaryTextColor}
                    >
                      groups
                    </span>
                  </div>
                  <div>
                    <span className="font-label block text-xs uppercase text-secondary">
                      Group Size
                    </span>
                    <span
                      className="font-bold text-primary"
                      style={primaryTextColor}
                    >
                      Small (Max 8)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-white p-2 shadow-sm">
                    <span
                      className="material-symbols-outlined text-primary"
                      style={primaryTextColor}
                    >
                      directions_walk
                    </span>
                  </div>
                  <div>
                    <span className="font-label block text-xs uppercase text-secondary">
                      Activity Level
                    </span>
                    <span
                      className="font-bold text-primary"
                      style={primaryTextColor}
                    >
                      Moderate
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-white p-2 shadow-sm">
                    <span
                      className="material-symbols-outlined text-primary"
                      style={primaryTextColor}
                    >
                      accessible
                    </span>
                  </div>
                  <div>
                    <span className="font-label block text-xs uppercase text-secondary">
                      Accessibility
                    </span>
                    <span
                      className="font-bold text-primary"
                      style={primaryTextColor}
                    >
                      Fully Accessible
                    </span>
                  </div>
                </div>
              </div>
              <Link
                to={bookLink}
                style={primaryBgColor}
                className="font-headline block w-full rounded-full bg-primary py-4 text-center text-lg font-extrabold text-on-primary shadow-lg transition-all hover:shadow-primary/20 active:scale-95"
              >
                Book Tour
              </Link>
              <button
                type="button"
                onClick={() => setIsQueryOpen(true)}
                className="font-headline block w-full rounded-full border border-primary/25 bg-transparent py-3.5 text-center text-base font-bold text-primary transition-all duration-200 hover:bg-primary/5 active:scale-95"
                style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}
              >
                Ask a Query
              </button>
              <p className="text-center text-xs font-medium text-secondary">
                Free cancellation up to 48 hours before.
              </p>
            </div>

            <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-6">
              <h4 className="font-headline mb-4 font-bold text-primary">
                Recommended for you
              </h4>
              <div className="space-y-4">
                <Link
                  to="/explore-tours"
                  className="group flex cursor-pointer items-center gap-4"
                >
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                    <img
                      alt="Close up of old brick university building with ivy"
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJn2RYNFlh7o5sFYp8XxpS7UjwhbEDc6-u0XcVaaf_KNleOZ1FWsdOqSPkqD2uv2e-CSyqBliVQfjvSc-IoXOTPnNEFvPpmXkr-Wh_vfIMBXWOby4Bn63fMUmoKU_YQFBOaTtrRnLPyNfmQZj0q1tyOPhniEZCwD8LJES2WcFIYPW-QEh0hPWOifclTy50FU82EJrBBPYlKZDomEySkMlabOZ8fbh7pSLoACDmcfS5C15oLLFOmQVuMmeGNJPuTcnIGg_4F9UpQV4P"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-tertiary uppercase">
                      PRESTIGE SERIES
                    </span>
                    <h5 className="text-sm leading-tight font-bold text-primary">
                      Explore Other Tours
                    </h5>
                  </div>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="mt-12 w-full border-t border-slate-200/90 bg-[#F8FAFF] px-8 py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link
              to="/"
              className="font-headline text-lg font-bold text-[#002045]"
            >
              The Academic Curator
            </Link>
            <p className="text-sm leading-relaxed text-[#5c6578]">
              Defining the prestigious academic journey through immersive
              curations and insider access.
            </p>
          </div>
          <div>
            <h4 className="font-headline mb-4 font-bold text-[#002045]">
              Explore
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  className="text-sm text-[#5c6578] underline-offset-4 transition-colors hover:text-[#002045] hover:underline"
                  href="#"
                >
                  Tour Destinations
                </a>
              </li>
              <li>
                <a
                  className="text-sm text-[#5c6578] underline-offset-4 transition-colors hover:text-[#002045] hover:underline"
                  href="#"
                >
                  Campus Partners
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline mb-4 font-bold text-[#002045]">
              Support
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-[#5c6578] underline-offset-4 transition-colors hover:text-[#002045] hover:underline"
                >
                  Contact Support
                </Link>
              </li>
              <li>
                <a
                  className="text-sm text-[#5c6578] underline-offset-4 transition-colors hover:text-[#002045] hover:underline"
                  href="#"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  className="text-sm text-[#5c6578] underline-offset-4 transition-colors hover:text-[#002045] hover:underline"
                  href="#"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline mb-4 font-bold text-[#002045]">
              Newsletter
            </h4>
            <div className="flex gap-2">
              <input
                className="w-full rounded-lg border border-slate-200/90 bg-white px-3 py-2 text-sm text-[#002045] shadow-sm placeholder:text-slate-400 focus:border-[#002045] focus:ring-1 focus:ring-[#002045] focus:outline-none"
                placeholder="Your email"
                type="email"
              />
              <button
                type="button"
                className="shrink-0 rounded-lg bg-[#002045] p-2.5 text-white shadow-sm transition-opacity hover:opacity-90"
                aria-label="Subscribe"
              >
                <span className="material-symbols-outlined text-[20px]">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-slate-200/90 pt-8 md:flex-row">
          <span className="font-inter text-sm tracking-normal text-slate-500">
            © 2024 The Academic Curator. All rights reserved.
          </span>
          <div className="flex gap-6 text-slate-500">
            <span className="material-symbols-outlined">public</span>
            <span className="material-symbols-outlined">share</span>
          </div>
        </div>
      </footer>

      {isQueryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
          <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-outline-variant/30 bg-white p-8 shadow-[0px_24px_64px_rgba(24,28,30,0.15)] text-slate-800">
            <button
              type="button"
              onClick={() => setIsQueryOpen(false)}
              className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            {querySuccess ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <span className="material-symbols-outlined text-3xl font-bold">check</span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-primary mb-2">Query Submitted!</h3>
                <p className="text-secondary text-sm">
                  Thank you for reaching out. Our ambassadors will contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleQuerySubmit} className="space-y-6">
                <div>
                  <h3 className="font-headline text-2xl font-bold text-primary">Ask a Query</h3>
                  <p className="text-secondary text-xs mt-1">
                    Have questions about {tourData.university_name}? Ask our student guides!
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="space-y-2">
                    <label className="font-label text-[10px] font-bold tracking-widest text-secondary uppercase" htmlFor="query-first-name">
                      First Name
                    </label>
                    <input
                      id="query-first-name"
                      type="text"
                      required
                      value={queryFirstName}
                      onChange={(e) => setQueryFirstName(e.target.value)}
                      className="bg-surface-container-low text-on-surface w-full rounded-lg border-none px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/15 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-[10px] font-bold tracking-widest text-secondary uppercase" htmlFor="query-last-name">
                      Last Name
                    </label>
                    <input
                      id="query-last-name"
                      type="text"
                      required
                      value={queryLastName}
                      onChange={(e) => setQueryLastName(e.target.value)}
                      className="bg-surface-container-low text-on-surface w-full rounded-lg border-none px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/15 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="font-label text-[10px] font-bold tracking-widest text-secondary uppercase" htmlFor="query-email">
                    Email Address
                  </label>
                  <input
                    id="query-email"
                    type="email"
                    required
                    value={queryEmail}
                    onChange={(e) => setQueryEmail(e.target.value)}
                    className="bg-surface-container-low text-on-surface w-full rounded-lg border-none px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/15 focus:outline-none"
                  />
                </div>

                <div className="space-y-2 text-left">
                  <label className="font-label text-[10px] font-bold tracking-widest text-secondary uppercase" htmlFor="query-phone">
                    Phone Number
                  </label>
                  <input
                    id="query-phone"
                    type="tel"
                    value={queryPhone}
                    onChange={(e) => setQueryPhone(e.target.value)}
                    className="bg-surface-container-low text-on-surface w-full rounded-lg border-none px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/15 focus:outline-none"
                  />
                </div>

                <div className="space-y-2 text-left">
                  <label className="font-label text-[10px] font-bold tracking-widest text-secondary uppercase" htmlFor="query-message">
                    Your Specific Query
                  </label>
                  <textarea
                    id="query-message"
                    required
                    rows={4}
                    value={queryMessage}
                    onChange={(e) => setQueryMessage(e.target.value)}
                    placeholder="Ask about courses, branches, campus life, admissions..."
                    className="bg-surface-container-low text-on-surface w-full rounded-lg border-none px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/15 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsQueryOpen(false)}
                    className="flex-1 rounded-full border border-outline-variant bg-transparent py-3 text-center text-sm font-bold text-secondary transition-colors hover:bg-slate-50 active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingQuery}
                    className="flex-1 rounded-full bg-primary py-3 text-center text-sm font-bold text-on-primary transition-opacity hover:opacity-90 active:scale-95 disabled:opacity-60"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {submittingQuery ? 'Submitting…' : 'Submit Query'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
