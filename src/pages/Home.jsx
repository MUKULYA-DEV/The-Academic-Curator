import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { supabase } from '../supabaseClient.js'

const UPCOMING_TOURS = [
  {
    id: '1',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCuDm1Xs8-yfNQIWtphJyldlMKUbOtXZUQwyJZsnN2t0fUxQNwBkyTUCXQ5cyL2-2NqS32rRk0wx0i_FPJ7oaYzlqs8FEH-6s_8MFkAH_nIa4DS06HBv4h1tkH4C3fzPLiAhSUY6X_5owFH4C85n2we51d_-nXExnCyrrar9MsWUJ9Z6z6bIpcsM0jEJzmXjZiioVAxEL0WBD4YPdvN9RppZYgKcLKi0Pul4Svc8mrHszcGWxG2fPQQR5LyXac-O8ldRpMNEO7Vi44D',
    imageAlt: 'Modern university library interior with large windows',
    badgeClass:
      'pill-badge absolute top-5 left-5 flex items-center gap-2 rounded-full border border-white/50 bg-white/90 px-5 py-2 font-label text-[11px] font-extrabold tracking-[0.1em] text-tertiary uppercase shadow-sm',
    badgeDotClass: 'h-2 w-2 animate-pulse rounded-full bg-tertiary',
    badgeText: '3 Slots Left',
    location: 'Cambridge, MA',
    title: 'Harvard University Residency Tour',
    dateLine: 'October 24, 2024',
    timeLine: '10:00 AM - 1:00 PM EST',
  },
  {
    id: '2',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDNbeXyixoBQmu1pKU-o2HHHm3nD_YFFFY_veZSgJSqb13rsz0hUCJVrUoKd1JadXWJrUE_3otq4otXN_MMD9ZtPmtJftuCbXgH75NS2ck1a8RcZ1TmLARgfMVCOs0jrQoA509Khg_KNKTAHQSriS15mPVtQMm7Ypj2sVNkszZXo7gd8SGs-qNFX_8gry0bxeHRju3j25IJQpk6Uvwl-FbcsBXRu-0J7LQmy0NquU07xBbM-O4fjpaWiudHX-iSr82XQyEzKx5g10xH',
    imageAlt: 'Traditional stone gothic architecture university courtyard',
    badgeClass:
      'pill-badge absolute top-5 left-5 flex items-center gap-2 rounded-full border border-white/50 bg-white/90 px-5 py-2 font-label text-[11px] font-extrabold tracking-[0.1em] text-orange-700 uppercase shadow-sm',
    badgeDotClass: 'h-2 w-2 rounded-full bg-orange-400',
    badgeText: '8 Slots Left',
    location: 'Stanford, CA',
    title: 'Stanford Engineering Innovation Path',
    dateLine: 'October 26, 2024',
    timeLine: '02:00 PM - 4:30 PM PST',
  },
  {
    id: '3',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCR8TeRY0yBQgGsVuRRnkU7Kr4C43QqQ7Zrrsu_SnUX_XIOhBGCK-BSXAtKvgJmQgZamoO_KdpepKtu138adHH4ZWzn-wCvIScxxgQ4zBIs8LkLGi_O1vMpGEBK4fjEn_fmziDwmCk_iyRO2rAa_WRuZGxq-kEhcA40-tF9YqOdn38ES-kokpB0PLhvbKxJQpsuKUu66E68zfFDIqjmO-czXSR4UCru3goEklpwEXNd7jSWfh5rImL7Xm5PwE64FnhnapY7DNySnBcu',
    imageAlt: 'Oxford style historical college buildings with green lawn',
    badgeClass:
      'pill-badge absolute top-5 left-5 flex items-center gap-2 rounded-full border border-error-container/50 bg-error/90 px-5 py-2 font-label text-[11px] font-extrabold tracking-[0.1em] text-white uppercase shadow-sm',
    badgeDotClass: 'h-2 w-2 animate-ping rounded-full bg-white',
    badgeText: 'LAST SLOT',
    location: 'New Haven, CT',
    title: 'Yale University Historic Arts Walk',
    dateLine: 'October 29, 2024',
    timeLine: '09:00 AM - 12:00 PM EST',
  },
]

const DEFAULT_TOUR_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCuDm1Xs8-yfNQIWtphJyldlMKUbOtXZUQwyJZsnN2t0fUxQNwBkyTUCXQ5cyL2-2NqS32rRk0wx0i_FPJ7oaYzlqs8FEH-6s_8MFkAH_nIa4DS06HBv4h1tkH4C3fzPLiAhSUY6X_5owFH4C85n2we51d_-nXExnCyrrar9MsWUJ9Z6z6bIpcsM0jEJzmXjZiioVAxEL0WBD4YPdvN9RppZYgKcLKi0Pul4Svc8mrHszcGWxG2fPQQR5LyXac-O8ldRpMNEO7Vi44D'

function mapSupabaseTourToHomeTour(row) {
  const city = row.city?.trim()
  const loc = row.location?.trim()
  const locationText = loc && loc.length > 0 ? loc : city && city.length > 0 ? city : '—'

  const badgeText = row.badge && row.badge.trim() !== '' ? row.badge : 'OPEN'
  const isLast = row.badge_variant === 'last'

  let badgeClass = ''
  let badgeDotClass = ''

  if (isLast) {
    badgeClass =
      'pill-badge absolute top-5 left-5 flex items-center gap-2 rounded-full border border-error-container/50 bg-error/90 px-5 py-2 font-label text-[11px] font-extrabold tracking-[0.1em] text-white uppercase shadow-sm'
    badgeDotClass = 'h-2 w-2 animate-ping rounded-full bg-white'
  } else if (badgeText.toLowerCase().includes('slots left')) {
    const slots = parseInt(badgeText)
    if (!isNaN(slots) && slots <= 3) {
      badgeClass =
        'pill-badge absolute top-5 left-5 flex items-center gap-2 rounded-full border border-white/50 bg-white/90 px-5 py-2 font-label text-[11px] font-extrabold tracking-[0.1em] text-tertiary uppercase shadow-sm'
      badgeDotClass = 'h-2 w-2 animate-pulse rounded-full bg-tertiary'
    } else {
      badgeClass =
        'pill-badge absolute top-5 left-5 flex items-center gap-2 rounded-full border border-white/50 bg-white/90 px-5 py-2 font-label text-[11px] font-extrabold tracking-[0.1em] text-orange-700 uppercase shadow-sm'
      badgeDotClass = 'h-2 w-2 rounded-full bg-orange-400'
    }
  } else {
    badgeClass =
      'pill-badge absolute top-5 left-5 flex items-center gap-2 rounded-full border border-white/50 bg-white/90 px-5 py-2 font-label text-[11px] font-extrabold tracking-[0.1em] text-blue-700 uppercase shadow-sm'
    badgeDotClass = 'h-2 w-2 rounded-full bg-blue-400'
  }

  let dateLine = row.date_line ?? 'Schedule TBD'
  let timeLine = ''
  if (dateLine.includes('•')) {
    const parts = dateLine.split('•')
    dateLine = parts[0].trim()
    timeLine = parts[1].trim()
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
  }
}

function HomeFeaturedTourCard({ tour }) {
  const navigate = useNavigate()
  const idParam = encodeURIComponent(tour.id)

  function handleCardClick() {
    navigate(`/college?tourId=${idParam}`)
  }

  function handleBookClick(e) {
    e.stopPropagation()
    navigate(`/book-tour?tourId=${idParam}`)
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

  useEffect(() => {
    async function fetchFeaturedTours() {
      try {
        const { data, error } = await supabase
          .from('tours')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3)

        if (error) throw error

        if (data && data.length > 0) {
          setTours(data.map(mapSupabaseTourToHomeTour))
        } else {
          setTours(UPCOMING_TOURS)
        }
      } catch (err) {
        console.error('Error fetching tours:', err)
        setTours(UPCOMING_TOURS)
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
      <Navbar active="home" />

      <main className="pt-24">
        <section className="relative overflow-hidden bg-surface-container-low px-8 py-20 lg:py-32">
          <div className="mx-auto grid max-w-screen-2xl items-center gap-12 lg:grid-cols-2">
            <div className="z-10">
              <h1 className="mb-6 text-3xl sm:text-5xl font-extrabold leading-[1.1] tracking-tight text-primary lg:text-7xl">
                Find Your Future <br />
                <span className="text-tertiary">University</span>
              </h1>
              <p className="mb-10 max-w-xl text-base sm:text-lg leading-relaxed text-secondary lg:text-xl">
                Curated campus experiences led by top-tier student ambassadors.
                Don&apos;t just visit—immerse yourself in the academic legacy.
              </p>
              <div className="relative max-w-2xl">
                <div className="ghost-shadow group flex items-center rounded-full p-1 sm:p-1.5 ring-primary/20 transition-all focus-within:ring-1">
                  <span className="material-symbols-outlined pl-3 sm:pl-6 text-secondary">
                    search
                  </span>
                  <input
                    className="font-body w-full border-none bg-transparent py-2.5 sm:py-4 text-sm sm:text-base text-on-surface placeholder:text-outline-variant focus:border-transparent focus:outline-none focus:ring-0"
                    placeholder="Search by University, City, or Major..."
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    onKeyDown={handleHeroSearchKeyDown}
                    aria-label="Search universities, cities, or majors"
                  />
                  <button
                    className="rounded-full bg-primary px-5 py-2.5 sm:px-10 sm:py-4 text-sm sm:text-base font-semibold text-on-primary transition-colors hover:bg-primary-container whitespace-nowrap"
                    type="button"
                    onClick={runHeroSearch}
                  >
                    Discover
                  </button>
                </div>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="ghost-shadow relative z-10 -rotate-2 transform overflow-hidden rounded-xl">
                <img
                  alt="Stately red brick university campus building with clock tower"
                  className="h-[500px] w-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDV5-UmBceAZWTUMwBXAlffid7KmcIlnwYaFoOsIIccWW6YwwKv5mYBdqTudsNpqIGcSdvfNWw1e5dAJAEYbbiKFzKjhDn7Ptk2UdxuAGFeruarW3-9uyX18qpEO-4ifP-3kP_LlxdHg5vdhO0mDd04Nrz4da43nmPnyWL77faR1RdZLp4Xz41kl6XiAHFLFPcsKFXa4Znxm3FQEbh7-vhlf-iNDpYvvqM9bZuzS0Opd1KQJ90fVxHt6DKtwN0Autjfp_HfDhvGYCRd"
                />
              </div>
              <div className="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-tertiary-fixed opacity-20 blur-3xl" />
              <div className="ghost-shadow animate-[bounce-slow_3s_ease-in-out_infinite] absolute -bottom-10 -left-10 z-20 flex items-center gap-4 rounded-xl bg-surface-container-lowest p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    workspace_premium
                  </span>
                </div>
                <div>
                  <p className="font-label text-xs uppercase tracking-widest text-secondary">
                    The Academic Curator
                  </p>
                  <p className="font-bold text-primary">Official Curator</p>
                </div>
              </div>
            </div>
          </div>
        </section>

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
                    Limited availability for private and curated group sessions
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
            ) : (
              tours.map((tour) => (
                <HomeFeaturedTourCard key={tour.id} tour={tour} />
              ))
            )}
          </div>
        </section>

        <section className="bg-primary px-8 py-24 text-on-primary">
          <div className="mx-auto flex max-w-screen-2xl flex-col items-center gap-16 lg:flex-row">
            <div className="flex-1">
              <h2 className="mb-6 text-4xl font-extrabold lg:text-5xl">
                Learn from those who live it.
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-on-primary-container">
                Our ambassadors are more than just guides. They are researchers,
                athletes, and leaders who provide an unfiltered look into campus
                life and academic rigor.
              </p>
              <div className="flex gap-4">
                <button
                  className="rounded-lg bg-tertiary px-8 py-4 font-semibold text-on-tertiary transition-colors hover:bg-tertiary-container"
                  type="button"
                >
                  Meet Ambassadors
                </button>
                <button
                  className="rounded-lg border border-outline-variant bg-transparent px-8 py-4 font-semibold text-on-primary transition-colors hover:bg-white/10"
                  type="button"
                >
                  The Curriculum
                </button>
              </div>
            </div>
            <div className="grid flex-1 grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <div className="rounded-xl border border-white/5 bg-surface-container-lowest/10 p-4 backdrop-blur-sm">
                  <img
                    alt="Smiling female university student portrait"
                    className="mb-4 aspect-square w-full rounded-lg object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjpI7H9mNTECI0Jk-MRxY3FVteAEdgOOX6V57GC7gn7QXhZ4labTY9kLJDBkSMU0l6J_G57qZucPVchNWKkU2winyMlg9Y6YehekLx9BDPWWavAGB1dsohfbcvT5X6dGKZ8lvHruWtPlDHVV5Zi7GyYLoeLTPxjI52qNn3DkXc2vxp6wY1OudaRTNGNx41q_ytXdqQsEMQSWAoN6mpaPTgWS3kxsQmti3VzeFxtjPp88O__j9REURlHBM3H2EWNWvzqYN4ZyNdN9jQ"
                  />
                  <p className="font-bold">Elena R.</p>
                  <p className="text-xs uppercase tracking-widest text-on-primary-container">
                    Physics @ MIT
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-white/5 bg-surface-container-lowest/10 p-4 backdrop-blur-sm">
                  <img
                    alt="Smiling male university student portrait"
                    className="mb-4 aspect-square w-full rounded-lg object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqeuAxA06BquneUoU930Ds1Ow8u7g1id-ZEeFubEv_VcjbP-qgCOIa950M-BMLWiK7M1OK3fBRw_simBr9uuLO30aqE_GW2-NrqcjZkFLAohvejrAby4ivJ5X9WoMxUrII4n4tws98pv3C7BqjsIrlF1MB68_i6umz278t4M-UFELqNCWtHoHXUPU3ZmL8I2m40V0lggrVO6DO_Z7vY8FCv6t6H-ORRhxACh9xbE2pscfRxG03alZcJ4UBRu9oA_0DEzPxyVZ14IVu"
                  />
                  <p className="font-bold">Marcus T.</p>
                  <p className="text-xs uppercase tracking-widest text-on-primary-container">
                    Law @ Columbia
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-slate-200/90 bg-[#F8FAFF]">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-6 px-12 py-10 md:flex-row">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Link
              to="/"
              className="font-manrope text-lg font-bold text-[#002045]"
            >
              The Academic Curator
            </Link>
            <p className="font-inter text-sm leading-relaxed text-[#5c6578]">
              © 2024 The Academic Curator. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a
              className="font-inter text-sm text-[#5c6578] transition-colors hover:text-[#002045]"
              href="#"
            >
              University Partners
            </a>
            <a
              className="font-inter text-sm text-[#5c6578] transition-colors hover:text-[#002045]"
              href="#"
            >
              Admissions Office
            </a>
            <a
              className="font-inter text-sm text-[#5c6578] transition-colors hover:text-[#002045]"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="font-inter text-sm text-[#5c6578] transition-colors hover:text-[#002045]"
              href="#"
            >
              Accessibility
            </a>
            <Link
              to="/contact"
              className="font-inter text-sm text-[#5c6578] transition-colors hover:text-[#002045]"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </footer>
    </>
  )
}
