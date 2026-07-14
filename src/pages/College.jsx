import { useEffect, useState } from 'react'
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

  const primaryText = theme?.primaryColor ? { color: theme.primaryColor } : {}

  return (
    <section>
      <h2
        className="font-headline mb-8 text-2xl font-extrabold tracking-tight text-primary"
        style={primaryText}
      >
        Campus Gallery
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {gallery.map((item, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-xl bg-surface-container-low"
          >
            <img
              alt={item.caption || 'Campus view'}
              className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={item.url}
              loading="lazy"
            />
            {item.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="text-sm font-medium">{item.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>
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
}

// Main Page Controller
export default function College() {
  const [searchParams] = useSearchParams()
  const tourId = searchParams.get('tourId')
  const [tourData, setTourData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)

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
    </div>
  )
}
