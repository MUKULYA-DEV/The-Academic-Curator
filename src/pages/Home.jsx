import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getPublishedTours } from '../services/tourService.js'
import { settingsService } from '../services/settingsService.js'
import { getPublicUrl } from '../services/mediaService.js'
import { getTourBadgeDetails } from '../utils/badgeUtils.js'
import { useRequireAuth } from '../hooks/useRequireAuth.js'
import SEO from '../components/SEO.jsx'

const HOW_IT_WORKS = [
  {
    title: 'Pick a college and a date',
    body: 'Choose the course you are considering and bring your parents along. Groups stay small.',
  },
  {
    title: 'Walk the campus with a student',
    body: 'Classrooms, labs, hostels, the mess and the library, with someone who uses them every day.',
  },
  {
    title: 'Decide with the full picture',
    body: 'Ask about fees, placements and hostel life. If you apply through us, any admission benefit listed on the tour page is yours.',
  },
]

const DEFAULT_TOUR_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCuDm1Xs8-yfNQIWtphJyldlMKUbOtXZUQwyJZsnN2t0fUxQNwBkyTUCXQ5cyL2-2NqS32rRk0wx0i_FPJ7oaYzlqs8FEH-6s_8MFkAH_nIa4DS06HBv4h1tkH4C3fzPLiAhSUY6X_5owFH4C85n2we51d_-nXExnCyrrar9MsWUJ9Z6z6bIpcsM0jEJzmXjZiioVAxEL0WBD4YPdvN9RppZYgKcLKi0Pul4Svc8mrHszcGWxG2fPQQR5LyXac-O8ldRpMNEO7Vi44D'

function mapSupabaseTourToHomeTour(row) {
  const city = row.city?.trim()
  const loc = row.location?.trim()
  const locationText = loc && loc.length > 0 ? loc : city && city.length > 0 ? city : '—'

  const { badgeClass, dotClass: badgeDotClass, text: badgeText } = getTourBadgeDetails(row, 3)

  let dateLine = row.date_line ?? 'Schedule TBD'
  let timeLine = ''
  if (dateLine.includes('•')) {
    const parts = dateLine.split('•')
    dateLine = parts[0].trim()
    timeLine = parts[1].trim()
  }

  let detailsObj = null
  if (row.details) {
    if (typeof row.details === 'string') {
      try { detailsObj = JSON.parse(row.details) } catch (e) { detailsObj = null }
    } else {
      detailsObj = row.details
    }
  }

  return {
    id: String(row.id),
    image: row.image_url && row.image_url.trim() !== '' ? row.image_url : DEFAULT_TOUR_IMAGE,
    imageAlt: row.title ?? row.university_name ?? 'Campus tour',
    badgeClass,
    badgeDotClass,
    badgeText,
    location: locationText,
    title: row.title ?? `${row.university_name} Campus Tour`,
    dateLine,
    timeLine,
    benefitsEnabled: detailsObj?.benefits?.enabled ?? false,
  }
}

function HomeFeaturedTourCard({ tour }) {
  const navigate = useNavigate()
  const { requireAuth } = useRequireAuth()
  const idParam = encodeURIComponent(tour.id)

  function handleCardClick() {
    navigate(`/college?tourId=${idParam}`)
  }

  function handleBookClick(e) {
    e.stopPropagation()
    requireAuth(() => navigate(`/book-tour?tourId=${idParam}`))
  }

  return (
    <div
      onClick={handleCardClick}
      className="group ghost-shadow flex h-full cursor-pointer flex-col overflow-hidden rounded-[2rem] bg-surface-container-lowest transition-all duration-500 hover:shadow-2xl"
    >
      <div className="relative h-64 shrink-0 overflow-hidden">
        <img
          alt={tour.imageAlt}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          src={tour.image}
        />
        <div className={tour.badgeClass}>
          <span className={tour.badgeDotClass} /> {tour.badgeText}
        </div>
        {tour.benefitsEnabled && (
          <div className="absolute bottom-4 left-4">
            <span className="font-label rounded-full bg-primary px-3 py-1 text-[10px] font-bold tracking-widest text-on-primary uppercase shadow-lg">
              🎓 Exclusive Benefit
            </span>
          </div>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-secondary">location_on</span>
          <p className="font-label text-[10px] font-bold tracking-[0.2em] text-secondary uppercase">
            {tour.location}
          </p>
        </div>
        <h3 className="text-2xl leading-snug font-extrabold text-primary transition-colors group-hover:text-tertiary">
          {tour.title}
        </h3>
        <div className="mt-auto flex flex-col gap-8">
          <div className="flex flex-col gap-4 border-t border-surface-container-high pt-6">
            <div className="flex items-center gap-4 text-sm font-medium text-secondary/80">
              <span className="material-symbols-outlined text-xl opacity-60">calendar_today</span>
              <span>{tour.dateLine}</span>
            </div>
            {tour.timeLine && (
              <div className="flex items-center gap-4 text-sm font-medium text-secondary/80">
                <span className="material-symbols-outlined text-xl opacity-60">schedule</span>
                <span>{tour.timeLine}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleBookClick}
            className="font-headline w-full rounded-full bg-primary py-3 text-center text-sm font-bold text-on-primary transition-opacity hover:opacity-90 active:scale-[0.98]"
          >
            Book Tour
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [heroSearch, setHeroSearch] = useState('')
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [heroImage, setHeroImage] = useState(null)
  const [trustSection, setTrustSection] = useState(null)

  useEffect(() => {
    
    
    // Fetch dynamic hero image
    settingsService.getSetting('hero_media').then(storagePath => {
      if (storagePath) {
        setHeroImage(getPublicUrl(storagePath))
      }
    }).catch(err => console.error('Failed to load hero image:', err))

    // Fetch trust section from site settings
    settingsService.getSetting('benefits_config').then(config => {
      if (config && config.home_trust_section) {
        setTrustSection(config.home_trust_section)
      } else {
        // Fallback default if not seeded yet
        setTrustSection({
          title: "Why Book Through Us",
          items: [
            { icon: "verified", title: "Official Campus Visit" },
            { icon: "school", title: "Admission Guidance" },
            { icon: "support_agent", title: "Dedicated Counselor" },
            { icon: "payments", title: "Application Fee Benefit" }
          ]
        })
      }
    }).catch(err => console.error('Failed to load benefits config:', err))
  }, [])

  useEffect(() => {
    async function fetchFeaturedTours() {
      try {
        const publishedTours = await getPublishedTours()
        const featured = publishedTours.slice(0, 3)

        setTours(featured.map(mapSupabaseTourToHomeTour))
      } catch (err) {
        console.error('Error fetching tours:', err)
        setTours([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedTours()
  }, [])

  function runHeroSearch() {
    const q = heroSearch.trim()
    if (q === '') {
      navigate('/explore-tours')
      return
    }
    navigate(`/explore-tours?search=${encodeURIComponent(q)}`)
  }

  function handleHeroSearchKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      runHeroSearch()
    }
  }

  return (
    <>
      <SEO title="Campus tours in Delhi NCR and Dehradun" description="Visit colleges in Delhi NCR and Dehradun with a current student. See classrooms, labs and hostels before you apply." />
      <main className="pt-24">
        <section className="relative overflow-hidden bg-surface-container-low px-8 py-20 lg:py-32">
          <div className="mx-auto grid max-w-screen-2xl items-center gap-12 lg:grid-cols-2">
            <div className="z-10">
              <h1 className="mb-6 text-3xl sm:text-5xl font-extrabold leading-[1.1] tracking-tight text-primary lg:text-7xl">
                See the campus <br />
                <span className="text-tertiary">before you decide</span>
              </h1>
              <p className="mb-10 max-w-xl text-base sm:text-lg leading-relaxed text-secondary lg:text-xl">
                Walk through colleges in Delhi NCR and Dehradun with a current
                student. See the classrooms, labs and hostels, and ask anything
                before you apply.
              </p>
              <div className="relative max-w-2xl">
                <div className="ghost-shadow group flex items-center rounded-full p-1 sm:p-1.5 ring-primary/20 transition-all focus-within:ring-1 bg-white">
                  <span className="material-symbols-outlined pl-3 sm:pl-6 text-secondary">
                    search
                  </span>
                  <input
                    className="font-body w-full border-none bg-transparent py-2.5 sm:py-4 text-sm sm:text-base text-on-surface placeholder:text-outline-variant focus:border-transparent focus:outline-none focus:ring-0"
                    placeholder="Search by college, city or course"
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    onKeyDown={handleHeroSearchKeyDown}
                    aria-label="Search colleges, cities or courses"
                  />
                  <button
                    className="rounded-full bg-primary px-5 py-2.5 sm:px-10 sm:py-4 text-sm sm:text-base font-semibold text-on-primary transition-colors hover:bg-primary-container whitespace-nowrap"
                    type="button"
                    onClick={runHeroSearch}
                  >
                    Find tours
                  </button>
                </div>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="ghost-shadow relative z-10 -rotate-2 transform overflow-hidden rounded-xl">
                <img
                  alt="College campus"
                  className="h-[500px] w-full object-cover transition-opacity duration-700"
                  src={heroImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuDV5-UmBceAZWTUMwBXAlffid7KmcIlnwYaFoOsIIccWW6YwwKv5mYBdqTudsNpqIGcSdvfNWw1e5dAJAEYbbiKFzKjhDn7Ptk2UdxuAGFeruarW3-9uyX18qpEO-4ifP-3kP_LlxdHg5vdhO0mDd04Nrz4da43nmPnyWL77faR1RdZLp4Xz41kl6XiAHFLFPcsKFXa4Znxm3FQEbh7-vhlf-iNDpYvvqM9bZuzS0Opd1KQJ90fVxHt6DKtwN0Autjfp_HfDhvGYCRd"}
                />
              </div>
              <div className="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-tertiary-fixed opacity-20 blur-3xl" />
            </div>
          </div>
        </section>

        {trustSection && trustSection.items && (
          <section className="bg-surface-container-lowest py-16">
            <div className="mx-auto max-w-screen-2xl px-4 sm:px-8">
              <div className="mb-12 text-center">
                <h2 className="font-headline text-3xl font-extrabold text-primary">
                  {trustSection.title || 'Why Book Through Us'}
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-8">
                {trustSection.items.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-outline-variant/30 shadow-sm transition-all hover:shadow-md">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/5 text-primary">
                      <span className="material-symbols-outlined text-2xl">{item.icon || 'star'}</span>
                    </div>
                    <h3 className="font-headline font-bold text-primary">{item.title}</h3>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="mx-auto max-w-screen-2xl px-4 sm:px-8 py-16 md:py-24">
          <div className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between items-start gap-6">
            <div>
              <div className="flex flex-col items-start gap-3 sm:gap-4">
                <div className="inline-block rounded-2xl md:rounded-full bg-primary px-6 py-3 md:px-8 text-on-primary shadow-md">
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight md:text-3xl">
                    Upcoming Campus Tours
                  </h2>
                </div>
                <div className="inline-block rounded-2xl md:rounded-full border border-secondary-container bg-secondary-container/50 px-4 py-2 sm:px-6 text-on-secondary-container">
                  <p className="text-xs sm:text-sm font-medium md:text-base">
                    Small groups, so every question gets answered
                  </p>
                </div>
              </div>
            </div>
            <Link
              to="/explore-tours"
              className="group flex items-center gap-2 rounded-full border border-outline-variant bg-white px-6 py-3 font-bold text-primary shadow-sm transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-md whitespace-nowrap self-stretch md:self-auto justify-center"
            >
              View All
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-10 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="ghost-shadow flex h-[500px] animate-pulse flex-col overflow-hidden rounded-[2rem] bg-surface-container-low"
                >
                  <div className="h-64 bg-surface-container-high shrink-0" />
                  <div className="flex-1 p-8 space-y-6 flex flex-col">
                    <div className="space-y-3">
                      <div className="h-4 w-1/3 rounded bg-surface-container-high" />
                      <div className="h-8 w-3/4 rounded bg-surface-container-high" />
                    </div>
                    <div className="mt-auto space-y-4 pt-6">
                      <div className="h-4 w-1/2 rounded bg-surface-container-high" />
                      <div className="h-4 w-1/3 rounded bg-surface-container-high" />
                      <div className="h-10 w-full rounded-full bg-surface-container-high" />
                    </div>
                  </div>
                </div>
              ))
            ) : tours.length === 0 ? (
              <div className="col-span-full rounded-[2rem] border border-outline-variant/40 bg-surface-container-lowest p-10 text-center">
                <h3 className="font-headline text-xl font-bold text-primary">
                  New tour dates are being added
                </h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-secondary">
                  Tell us which college you want to visit and we will message you
                  when a date opens.
                </p>
                <Link
                  to="/contact"
                  className="mt-6 inline-block rounded-full bg-primary px-8 py-3 text-sm font-bold text-on-primary transition-opacity hover:opacity-90"
                >
                  Request a tour
                </Link>
              </div>
            ) : (
              tours.map((tour) => (
                <HomeFeaturedTourCard key={tour.id} tour={tour} />
              ))
            )}
          </div>
        </section>

        <section className="bg-primary px-4 py-16 text-on-primary sm:px-8 md:py-24">
          <div className="mx-auto max-w-screen-2xl">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl">
                How a tour works
              </h2>
              <p className="mt-5 text-base leading-relaxed text-on-primary-container sm:text-lg">
                A brochure shows a college at its best. A student who studies
                there shows you an ordinary day.
              </p>
            </div>
            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {HOW_IT_WORKS.map((step, idx) => (
                <li
                  key={step.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-8"
                >
                  <span className="font-headline text-sm font-bold tracking-widest text-tertiary-fixed-dim">
                    STEP {idx + 1}
                  </span>
                  <h3 className="font-headline mt-3 text-xl font-bold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-on-primary-container">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
            <div className="mt-12 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/explore"
                className="rounded-full bg-white px-8 py-4 text-center font-bold text-primary transition-colors hover:bg-primary-fixed"
              >
                See all tours
              </Link>
              <Link
                to="/contact"
                className="rounded-full border border-white/30 px-8 py-4 text-center font-bold text-on-primary transition-colors hover:bg-white/10"
              >
                Talk to us first
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
