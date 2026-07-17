import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { NavAuthSection } from '../components/NavAuthSection.jsx'
import Navbar from '../components/Navbar.jsx'
import { supabase } from '../supabaseClient.js'

const INSTITUTIONS = [
  'Harvard University',
  'Stanford University',
  'Princeton University',
  'UC Berkeley',
]

const TOURS = [
  {
    id: '1',
    school: 'Harvard University',
    title: 'Historic Yard Walk & Library Access',
    location: 'Cambridge, MA',
    city: 'Cambridge',
    dateLine: 'Oct 24, 2024 • 10:00 AM',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSZcVLZN6b_hAYTROpuBEgADA9Nq1OB9viFLOb2jsYp3c0qkfu3drxWDdrQKuB6a1Ww3r2E0QtKOkNd10NKZlBH5-22NOLKxTK8Nijq8nF2I1_u24fn7dqGAKxOd4dz7t-uS8hK-ZSwW2iOSPE21CosOhAxq3KNGmQbJ2RCkQd4taqlv6VrWMIxYWzICLjKyCP4hgx6YrwozeT6kCenAQlcI3QbmCxgEr_e7PZI4qMEfpBhKf2Qt3DIIOSQ0IYDoTwFA0SYhMEVj9v',
    alt: 'Harvard University Campus',
    badge: '8 SLOTS LEFT',
    badgeVariant: 'slots',
    cta: 'view',
    course: 'B.Tech',
    major: 'Computer Science',
    courses: [
      {
        name: 'B.Tech',
        branches: [
          { name: 'Computer Science', seats: 60 },
          { name: 'Electronics Engineering', seats: 30 }
        ]
      },
      {
        name: 'MBA',
        branches: [
          { name: 'Finance', seats: 20 },
          { name: 'Marketing', seats: 25 }
        ]
      }
    ]
  },
  {
    id: '2',
    school: 'Stanford University',
    title: 'Tech Innovation Path: Engineering Hub',
    location: 'Stanford, CA',
    city: 'Stanford',
    dateLine: 'Oct 26, 2024 • 2:30 PM',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDdkxzuYbabAdYMtbx8uYqlw02ArEWTLSO-QsLO_zbzVwvHZqTtSIIiz-g8onZypX7H2qZjIL4RmqbnycVgFWsUKqDAboTbF1uv7x6nhOiQzhypNRnJ8iT4uTMp60yD3iEXF_ekiCtreyGmFDK4fFBrVM79_FYE9z5kjaPOuNSBPR0_ipfL_95_9NJ3P3sLwCmvisEoPpHCeZ8vH9UCQi8UIkRO5vg2dHivVtZFkeQKGNtYgA041F-ou_YncTysrv-WnI0mo9sI-EyU',
    alt: 'Stanford University Campus',
    badge: 'LAST SLOT',
    badgeVariant: 'last',
    cta: 'book',
    course: 'B.Tech',
    major: 'Electronics Engineering',
    courses: [
      {
        name: 'B.Tech',
        branches: [
          { name: 'Electronics Engineering', seats: 45 },
          { name: 'Computer Science', seats: 60 }
        ]
      }
    ]
  },
  {
    id: '3',
    school: 'Princeton University',
    title: 'Ivy Gothic: Architecture & Arts Tour',
    location: 'Princeton, NJ',
    city: 'Princeton',
    dateLine: 'Nov 02, 2024 • 11:00 AM',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBK6x8sbhDVSD7He5hXlI73tLQbKm0vnx0s94_Z5X2a0gczJbs4MkulOuryw6cNhaPnYXU1SWupjClh9POzK-ZAKZrVHiIrMN28UudVWY-7mkyxIUuccgL_gozubMca0maTTbNl1qvN79R7wq8RaDsdlaoMRUX1ITdfDYkSo47DxrttCi5rWeY7a38e5998yY9I5YZseFSiPte1HExr6GJv96JZvi_u_-h4X8UDvCCwvCT7Wfmk1N9s8Ng_xb4vAhLnDFxZ5Mmmg36U',
    alt: 'Princeton University',
    badge: '12 SLOTS LEFT',
    badgeVariant: 'slots',
    cta: 'view',
    course: 'MBA',
    major: 'Finance',
    courses: [
      {
        name: 'MBA',
        branches: [
          { name: 'Finance', seats: 30 },
          { name: 'Marketing', seats: 20 }
        ]
      }
    ]
  },
  {
    id: '4',
    school: 'UC Berkeley',
    title: 'The Activist Spirit: Campus Roots',
    location: 'Berkeley, CA',
    city: 'Berkeley',
    dateLine: 'Nov 05, 2024 • 1:00 PM',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCtfg0JuLEbIaYFTRTwFask08s9w3sNZQol0FWYFzuUXCjWJWpOAKr8CE8FOAGTzsX_FdOJbpDztRvuyM67PBdPAME8XLaIyjTfmHzLg6_wXSUKkZtucAsPAlSaYu4TpboheKLvnv1pfuT6hx3Z6xGNlgOzetjPlUwxMoUofyk29rr2Xi1G-a0U3dXp9o2Vtd6m9Tp-fTdh6qKSRuBjTHpA5FYbLnoz3PwxmhnV2ZOEYw7k5QPiVwL2aazfiIS7iBE5m8biOPnHu1kw',
    alt: 'UC Berkeley',
    badge: '5 SLOTS LEFT',
    badgeVariant: 'slots',
    cta: 'view',
    course: 'B.Tech',
    major: 'Computer Science',
    courses: [
      {
        name: 'B.Tech',
        branches: [
          { name: 'Computer Science', seats: 60 },
          { name: 'Data Science', seats: 30 }
        ]
      }
    ]
  },
  {
    id: '5',
    school: 'Columbia University',
    title: 'Morningside Heights: Urban Excellence',
    location: 'New York, NY',
    city: 'New York',
    dateLine: 'Nov 10, 2024 • 10:30 AM',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCHNcmuHPQEnHR2K9kjxsxfRc5f1Ct1a8wtQM_bPU8PyiZDbZ-gbARSYunwV_MxWchI3Ttwvt1foLq9r-OGw1MENgJZPbcQPLyAiDbA8E8xFeibi17pU5p4NYK5EN1gDDitJQSf1ATx2FVmaXeZLOvht1qPyjez7xwCr8Yj4P81VXfPS87XXPdAgLz3LDZdcOviinKMlPEAEiAkB69oHqv_u5w6TlqcJNQ7PH5Dqt1Gfgmk5rTDUKBmgQpFswMdqgbi6V_Cwb5-uH4l',
    alt: 'Columbia University',
    badge: '15 SLOTS LEFT',
    badgeVariant: 'slots',
    cta: 'view',
    course: 'MBA',
    major: 'Marketing',
    courses: [
      {
        name: 'MBA',
        branches: [
          { name: 'Marketing', seats: 45 },
          { name: 'Finance', seats: 30 }
        ]
      }
    ]
  },
  {
    id: '6',
    school: 'Univ. of Washington',
    title: 'Pacific Northwest: Research & Nature',
    location: 'Seattle, WA',
    city: 'Seattle',
    dateLine: 'Nov 12, 2024 • 9:00 AM',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC5MSBeXVczwSZzaMEU7V0BIeqcoRQoqHLpz6qDlZci3KgLpMdbx_PlcjwBdFcFnfhYLUdSxNLOeuKQRmD-Glz6Lt_vFegbPksK1uBgJRSI-kigijr9nAHQr2H7oPor5XgS_2L7neqLEEDkFrReuW1Vg1sQtcegybuHQn-myh_GJzfHT6ZWe5ZVmr5ztmtpQFkRQKXx3G4d_5fQ_LoVjPRvmq9Di4dHDhoUfAaMJ5jCs2gYlJf1Rx6DhanZaPxyezBE_9LVPgK3qrm4',
    alt: 'University of Washington',
    badge: '2 SLOTS LEFT',
    badgeVariant: 'slots',
    cta: 'view',
    course: 'B.Sc',
    major: 'Data Science',
    courses: [
      {
        name: 'B.Sc',
        branches: [
          { name: 'Data Science', seats: 30 }
        ]
      }
    ]
  },
]

function badgeClass(variant) {
  if (variant === 'last') return 'bg-error-container text-on-error-container'
  return 'bg-tertiary-fixed text-on-tertiary-fixed'
}

function TourCardLink({ tour }) {
  const navigate = useNavigate()
  const tourIdParam = encodeURIComponent(tour.id)

  function handleCardClick() {
    navigate(`/college?tourId=${tourIdParam}`)
  }

  function handleBookClick(e) {
    e.stopPropagation()
    navigate(`/book-tour?tourId=${tourIdParam}`)
  }

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0px_12px_32px_rgba(24,28,30,0.06)] transition-all duration-300 hover:-translate-y-2"
    >
      <div className="relative h-64 overflow-hidden">
        <img
          alt={tour.alt}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={tour.image}
        />
        <div className="absolute top-4 left-4">
          <span
            className={`font-label rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase ${badgeClass(tour.badgeVariant)}`}
          >
            {tour.badge}
          </span>
        </div>
      </div>
      <div className="p-6">
        <p className="font-label mb-1 text-[10px] font-bold tracking-widest text-tertiary uppercase">
          {tour.school}
        </p>
        <h3 className="font-headline mb-4 text-xl leading-tight font-extrabold text-primary">{tour.title}</h3>
        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-2 text-sm text-secondary">
            <span className="material-symbols-outlined text-sm">location_on</span>
            <span>{tour.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-secondary">
            <span className="material-symbols-outlined text-sm">calendar_month</span>
            <span>{tour.dateLine}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleBookClick}
          className="font-headline w-full rounded-full bg-primary py-3 text-center text-sm font-bold text-on-primary transition-all hover:bg-primary-container"
        >
          Book Tour
        </button>
      </div>
    </div>
  )
}

const DEFAULT_TOUR_IMAGE = TOURS[0]?.image ?? ''

function escapeIlikePattern(raw) {
  return raw
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
    .replace(/,/g, ' ')
}

function mapTourRow(row) {
  const city = row.city?.trim()
  const loc = row.location?.trim()
  
  let detailsObj = null
  if (row.details) {
    if (typeof row.details === 'string') {
      try {
        detailsObj = JSON.parse(row.details)
      } catch (e) {
        detailsObj = null
      }
    } else if (typeof row.details === 'object') {
      detailsObj = row.details
    }
  }

  return {
    id: String(row.id),
    school: row.university_name ?? 'University',
    title: row.title ?? 'Campus Tour',
    location: loc && loc.length > 0 ? loc : city && city.length > 0 ? city : '—',
    city: city && city.length > 0 ? city : null,
    dateLine: row.date_line ?? 'Schedule TBD',
    image: row.image_url && row.image_url.trim() !== '' ? row.image_url : DEFAULT_TOUR_IMAGE,
    alt: row.university_name ?? 'Campus tour',
    badge: row.badge && row.badge.trim() !== '' ? row.badge : 'OPEN',
    badgeVariant: row.badge_variant === 'last' ? 'last' : 'slots',
    cta: row.cta === 'book' ? 'book' : 'view',
    course: row.course ?? null,
    major: row.major ?? null,
    courses: detailsObj?.courses ?? null,
  }
}

function filterStaticTours(searchTerm) {
  const t = searchTerm.trim().toLowerCase()
  if (!t) return [...TOURS]
  return TOURS.filter(
    (tour) =>
      tour.school.toLowerCase().includes(t) ||
      tour.title.toLowerCase().includes(t) ||
      tour.location.toLowerCase().includes(t),
  )
}

const PAGE_SIZE = 6

function applySearchFilterToQuery(query, term) {
  if (!term) return query
  const escaped = escapeIlikePattern(term)
  const pattern = `%${escaped}%`
  return query.or(
    `university_name.ilike.${pattern},city.ilike.${pattern},major.ilike.${pattern},course.ilike.${pattern},title.ilike.${pattern}`,
  )
}

export default function ExploreTours() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchFromUrl = searchParams.get('search') ?? ''
  const [searchInput, setSearchInput] = useState(searchFromUrl)
  const [tourCards, setTourCards] = useState([])
  const [toursLoading, setToursLoading] = useState(true)
  const [loadMoreLoading, setLoadMoreLoading] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)
  const [totalMatchingCount, setTotalMatchingCount] = useState(0)
  const [fetchMode, setFetchMode] = useState('supabase')
  const [supabaseListExhausted, setSupabaseListExhausted] = useState(false)
  const [emptyDbSearch, setEmptyDbSearch] = useState(false)

  useEffect(() => {
    document.title = 'Explore Residency Tours | The Academic Curator'
  }, [])
  const [recommendedTours, setRecommendedTours] = useState([])
  const [institutionOpen, setInstitutionOpen] = useState(false)
  const [selectedInstitution, setSelectedInstitution] = useState(null)
  const [selectedCity, setSelectedCity] = useState('All Cities')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedMajor, setSelectedMajor] = useState(null)
  const [courseOpen, setCourseOpen] = useState(false)
  const [majorOpen, setMajorOpen] = useState(false)
  const dropdownRef = useRef(null)
  const [allToursForFilters, setAllToursForFilters] = useState([])

  useEffect(() => {
    setSearchInput(searchFromUrl)
  }, [searchFromUrl])

  useEffect(() => {
    let cancelled = false
    async function loadAllToursForFilters() {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
      if (cancelled) return
      if (data && !error) {
        setAllToursForFilters(data.map(mapTourRow))
      } else {
        setAllToursForFilters([...TOURS])
      }
    }
    loadAllToursForFilters()
    return () => {
      cancelled = true
    }
  }, [])



  useEffect(() => {
    let cancelled = false

    async function loadTours() {
      setToursLoading(true)
      setLoadMoreLoading(false)
      setPageIndex(0)
      setSupabaseListExhausted(false)

      const term = searchFromUrl.trim()

      // Reset active filters first when performing a new search
      setSelectedInstitution(null)
      setSelectedCourse(null)
      setSelectedMajor(null)
      setSelectedCity('All Cities')

      function autoSelectFilters(termText, cards) {
        if (!termText) return

        const normalized = termText.trim().toLowerCase()
        const words = normalized.split(/\s+/).filter((w) => w.length > 2)

        const uniqueInstitutions = Array.from(new Set(cards.map((c) => c.school).filter(Boolean)))
        const uniqueCities = Array.from(new Set(cards.map((c) => c.city).filter(Boolean)))

        const uniqueCourses = new Set()
        const uniqueMajors = new Set()

        cards.forEach((c) => {
          if (c.courses && Array.isArray(c.courses)) {
            c.courses.forEach((course) => {
              if (course.name) uniqueCourses.add(course.name)
              if (course.branches && Array.isArray(course.branches)) {
                course.branches.forEach((b) => {
                  if (b.name) uniqueMajors.add(b.name)
                })
              }
            })
          }
          if (c.course) uniqueCourses.add(c.course)
          if (c.major) uniqueMajors.add(c.major)
        })

        const coursesList = Array.from(uniqueCourses)
        const majorsList = Array.from(uniqueMajors)

        const matchesTermOrWords = (val) => {
          if (!val) return false
          const lowerVal = val.toLowerCase()
          if (lowerVal.includes(normalized) || normalized.includes(lowerVal)) return true
          return words.some((word) => lowerVal.includes(word))
        }

        const matchedInst = uniqueInstitutions.find(matchesTermOrWords)
        const matchedCourse = coursesList.find(matchesTermOrWords)
        const matchedMajor = majorsList.find(matchesTermOrWords)
        const matchedCity = uniqueCities.find(matchesTermOrWords)

        if (matchedInst) setSelectedInstitution(matchedInst)
        if (matchedCourse) setSelectedCourse(matchedCourse)
        if (matchedMajor) setSelectedMajor(matchedMajor)
        if (matchedCity) setSelectedCity(matchedCity)
      }

      let sourceList = allToursForFilters
      if (sourceList.length === 0) {
        const { data: dbData, error: dbErr } = await supabase
          .from('tours')
          .select('*')
        if (cancelled) return
        if (dbData && !dbErr) {
          sourceList = dbData.map(mapTourRow)
        } else {
          sourceList = [...TOURS]
        }
      }

      if (term) {
        const normalized = term.toLowerCase()
        const words = normalized.split(/\s+/).filter((w) => w.length > 2)

        const matched = sourceList.filter((t) => {
          if (t.school && t.school.toLowerCase().includes(normalized)) return true
          if (t.title && t.title.toLowerCase().includes(normalized)) return true
          if (t.location && t.location.toLowerCase().includes(normalized)) return true
          if (t.courses && Array.isArray(t.courses)) {
            return t.courses.some((c) => {
              if (c.name && c.name.toLowerCase().includes(normalized)) return true
              if (c.branches && Array.isArray(c.branches)) {
                return c.branches.some((b) => b.name && b.name.toLowerCase().includes(normalized))
              }
              return false
            })
          }
          if (t.course && t.course.toLowerCase().includes(normalized)) return true
          if (t.major && t.major.toLowerCase().includes(normalized)) return true
          return false
        })

        if (matched.length > 0) {
          setEmptyDbSearch(false)
          setRecommendedTours([])
          setFetchMode('supabase')
          setTourCards(matched)
          autoSelectFilters(term, matched)
          setTotalMatchingCount(matched.length)
          setToursLoading(false)
          return
        } else {
          const recCards = sourceList.slice(0, 3)
          setTourCards([])
          setRecommendedTours(recCards)
          setEmptyDbSearch(true)
          setTotalMatchingCount(0)
          setSupabaseListExhausted(true)
          setFetchMode('supabase')
          setToursLoading(false)
          return
        }
      }

      setEmptyDbSearch(false)
      setRecommendedTours([])
      setFetchMode('supabase')
      setTourCards(sourceList)
      setTotalMatchingCount(sourceList.length)
      setToursLoading(false)
    }

    loadTours()
    return () => {
      cancelled = true
    }
  }, [searchFromUrl])

  const loadMoreTours = useCallback(async () => {
    if (emptyDbSearch || loadMoreLoading || toursLoading) return
    const term = searchFromUrl.trim()

    if (fetchMode === 'static') {
      const full = filterStaticTours(term)
      const nextPage = pageIndex + 1
      const start = nextPage * PAGE_SIZE
      if (start >= full.length) return

      setLoadMoreLoading(true)
      const chunk = full.slice(start, start + PAGE_SIZE)
      setTourCards((prev) => [...prev, ...chunk])
      setPageIndex(nextPage)
      setLoadMoreLoading(false)
      return
    }

    setLoadMoreLoading(true)
    const nextPage = pageIndex + 1
    const rangeFrom = nextPage * PAGE_SIZE
    const rangeTo = rangeFrom + PAGE_SIZE - 1

    let query = supabase.from('tours').select('*').order('created_at', { ascending: false })
    query = applySearchFilterToQuery(query, term)

    const { data, error } = await query.range(rangeFrom, rangeTo)

    if (error) {
      setLoadMoreLoading(false)
      return
    }

    const rows = Array.isArray(data) ? data : []
    if (rows.length === 0) {
      setSupabaseListExhausted(true)
      setLoadMoreLoading(false)
      return
    }

    const mapped = rows.map(mapTourRow)
    setTourCards((prev) => [...prev, ...mapped])
    setPageIndex(nextPage)
    setLoadMoreLoading(false)
  }, [
    emptyDbSearch,
    loadMoreLoading,
    toursLoading,
    fetchMode,
    pageIndex,
    searchFromUrl,
  ])

  function submitExploreSearch() {
    const q = searchInput.trim()
    if (q === '') {
      setSearchParams({})
    } else {
      setSearchParams({ search: q })
    }
  }

  function handleExploreSearchKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      submitExploreSearch()
    }
  }

  function clearSearch() {
    setSearchInput('')
    setSearchParams({})
  }

  // Dynamic available options calculated from ALL loaded tours to ensure full selectability
  const availableInstitutions = useMemo(() => {
    const set = new Set()
    allToursForFilters.forEach((t) => {
      if (t.school) set.add(t.school)
    })
    return Array.from(set).sort()
  }, [allToursForFilters])

  const availableCities = useMemo(() => {
    const set = new Set()
    allToursForFilters.forEach((t) => {
      if (t.city) {
        set.add(t.city)
      } else if (t.location && t.location.includes(',')) {
        const parts = t.location.split(',')
        if (parts[0]) set.add(parts[0].trim())
      } else if (t.location && t.location !== '—') {
        set.add(t.location.trim())
      }
    })
    return ['All Cities', ...Array.from(set).sort()]
  }, [allToursForFilters])

  const availableCourses = useMemo(() => {
    const set = new Set()
    allToursForFilters.forEach((t) => {
      if (t.courses && Array.isArray(t.courses)) {
        t.courses.forEach((c) => {
          if (c.name) set.add(c.name)
        })
      }
    })
    return Array.from(set).sort()
  }, [allToursForFilters])

  const availableMajors = useMemo(() => {
    const set = new Set()
    allToursForFilters.forEach((t) => {
      if (t.courses && Array.isArray(t.courses)) {
        t.courses.forEach((c) => {
          if (c.branches && Array.isArray(c.branches)) {
            c.branches.forEach((b) => {
              if (b.name) set.add(b.name)
            })
          }
        })
      }
    })
    return Array.from(set).sort()
  }, [allToursForFilters])

  const filteredTours = useMemo(() => {
    let list = tourCards
    if (selectedInstitution) {
      list = list.filter((t) => t.school === selectedInstitution)
    }
    if (selectedCity !== 'All Cities') {
      list = list.filter((t) => t.city === selectedCity || t.location.includes(selectedCity))
    }

    // Compound course + major filtration
    if (selectedCourse && selectedMajor) {
      list = list.filter((t) => {
        // 1. If it has dynamic JSON courses
        if (t.courses && Array.isArray(t.courses)) {
          const matchedCourse = t.courses.find((c) => c.name === selectedCourse)
          if (matchedCourse && matchedCourse.branches && Array.isArray(matchedCourse.branches)) {
            return matchedCourse.branches.some((b) => b.name === selectedMajor)
          }
          return false
        }
        // 2. Fallback to main columns
        return t.course === selectedCourse && t.major === selectedMajor
      })
    } else {
      // Independent filtration
      if (selectedCourse) {
        list = list.filter((t) => {
          if (t.courses && Array.isArray(t.courses)) {
            return t.courses.some((c) => c.name === selectedCourse)
          }
          return t.course === selectedCourse
        })
      }
      if (selectedMajor) {
        list = list.filter((t) => {
          if (t.courses && Array.isArray(t.courses)) {
            return t.courses.some(
              (c) => c.branches && Array.isArray(c.branches) && c.branches.some((b) => b.name === selectedMajor)
            )
          }
          return t.major === selectedMajor
        })
      }
    }
    return list
  }, [tourCards, selectedInstitution, selectedCity, selectedCourse, selectedMajor])

  const hasMoreTours = useMemo(
    () =>
      !emptyDbSearch &&
      !toursLoading &&
      !supabaseListExhausted &&
      tourCards.length < totalMatchingCount,
    [emptyDbSearch, toursLoading, supabaseListExhausted, tourCards.length, totalMatchingCount],
  )

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setInstitutionOpen(false)
        setCourseOpen(false)
        setMajorOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayInstitution = selectedInstitution ?? 'Select College'
  const displayCourse = selectedCourse ?? 'Select Course'
  const displayMajor = selectedMajor ?? 'Select Branch'

  return (
    <div className="bg-surface font-body text-on-surface">
      <Navbar active="explore" />

      <main className="mx-auto max-w-7xl px-6 pb-20 pt-12">
        <header className="mb-16 pt-24 text-center">
          <h1 className="font-headline mb-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-primary md:text-6xl">
            Explore Our Campus Tours
          </h1>
          <p className="font-body mx-auto max-w-2xl text-lg text-secondary">
            Curated academic journeys led by student ambassadors. Discover your
            future home through the lens of those who live it every day.
          </p>
        </header>

        <section className="mb-12">
          <div className="mx-auto mb-12 flex max-w-3xl items-center rounded-full bg-surface-container-lowest p-1 sm:p-2 shadow-[0px_12px_32px_rgba(24,28,30,0.06)]">
            <div className="flex grow items-center gap-2 sm:gap-3 pl-3 sm:pl-6 text-outline">
              <span className="material-symbols-outlined text-sm sm:text-base">search</span>
              <input
                className="font-body w-full border-none bg-transparent text-xs sm:text-sm md:text-base text-on-surface placeholder:text-outline/60 focus:ring-0 focus:outline-none outline-none"
                placeholder="Search universities, locations, or majors..."
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleExploreSearchKeyDown}
                aria-label="Search tours"
              />
            </div>
            <button
              className="font-headline flex items-center gap-1 sm:gap-2 rounded-full bg-primary px-4 py-2.5 sm:px-8 sm:py-3 text-xs sm:text-sm font-bold text-on-primary transition-colors hover:bg-primary-container whitespace-nowrap"
              type="button"
              onClick={submitExploreSearch}
            >
              Discover
            </button>
          </div>

          <div className="mx-auto max-w-5xl rounded-3xl border border-outline-variant/30 bg-white/50 p-8 backdrop-blur-sm relative z-30">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end" ref={dropdownRef}>
              <div className="grow space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  {/* By Institution */}
                  <div className="space-y-3">
                    <label className="font-headline block px-1 text-sm font-extrabold text-primary">
                      By Institution
                    </label>
                    <div className="relative w-full">
                      <button
                        type="button"
                        onClick={() => {
                          setInstitutionOpen((o) => !o)
                          setCourseOpen(false)
                          setMajorOpen(false)
                        }}
                        className="flex w-full cursor-pointer items-center justify-between rounded-full border-2 border-primary bg-surface-container-lowest px-6 py-2.5 font-headline text-sm font-bold text-primary shadow-sm transition-all"
                      >
                        <span className="truncate">{displayInstitution}</span>
                        <span
                          className={`material-symbols-outlined transition-transform ${
                            institutionOpen ? 'rotate-180' : ''
                          }`}
                        >
                          expand_more
                        </span>
                      </button>
                      {institutionOpen && (
                        <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-xl">
                          <div className="py-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedInstitution(null)
                                setInstitutionOpen(false)
                              }}
                              className="font-headline block w-full px-6 py-3 text-left text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-on-primary"
                            >
                              All Colleges
                            </button>
                            {availableInstitutions.map((name) => (
                              <button
                                key={name}
                                type="button"
                                onClick={() => {
                                  setSelectedInstitution(name)
                                  setInstitutionOpen(false)
                                }}
                                className="font-headline block w-full px-6 py-3 text-left text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-on-primary"
                              >
                                {name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* By Course */}
                  <div className="space-y-3">
                    <label className="font-headline block px-1 text-sm font-extrabold text-primary">
                      By Course
                    </label>
                    <div className="relative w-full">
                      <button
                        type="button"
                        onClick={() => {
                          setCourseOpen((o) => !o)
                          setInstitutionOpen(false)
                          setMajorOpen(false)
                        }}
                        className="flex w-full cursor-pointer items-center justify-between rounded-full border-2 border-primary bg-surface-container-lowest px-6 py-2.5 font-headline text-sm font-bold text-primary shadow-sm transition-all"
                      >
                        <span className="truncate">{displayCourse}</span>
                        <span
                          className={`material-symbols-outlined transition-transform ${
                            courseOpen ? 'rotate-180' : ''
                          }`}
                        >
                          expand_more
                        </span>
                      </button>
                      {courseOpen && (
                        <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-xl">
                          <div className="py-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCourse(null)
                                setCourseOpen(false)
                              }}
                              className="font-headline block w-full px-6 py-3 text-left text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-on-primary"
                            >
                              All Courses
                            </button>
                            {availableCourses.map((course) => (
                              <button
                                key={course}
                                type="button"
                                onClick={() => {
                                  setSelectedCourse(course)
                                  setCourseOpen(false)
                                }}
                                className="font-headline block w-full px-6 py-3 text-left text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-on-primary"
                              >
                                {course}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* By Branch/Major */}
                  <div className="space-y-3">
                    <label className="font-headline block px-1 text-sm font-extrabold text-primary">
                      By Branch
                    </label>
                    <div className="relative w-full">
                      <button
                        type="button"
                        onClick={() => {
                          setMajorOpen((o) => !o)
                          setInstitutionOpen(false)
                          setCourseOpen(false)
                        }}
                        className="flex w-full cursor-pointer items-center justify-between rounded-full border-2 border-primary bg-surface-container-lowest px-6 py-2.5 font-headline text-sm font-bold text-primary shadow-sm transition-all"
                      >
                        <span className="truncate">{displayMajor}</span>
                        <span
                          className={`material-symbols-outlined transition-transform ${
                            majorOpen ? 'rotate-180' : ''
                          }`}
                        >
                          expand_more
                        </span>
                      </button>
                      {majorOpen && (
                        <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-xl">
                          <div className="py-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMajor(null)
                                setMajorOpen(false)
                              }}
                              className="font-headline block w-full px-6 py-3 text-left text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-on-primary"
                            >
                              All Branches
                            </button>
                            {availableMajors.map((major) => (
                              <button
                                key={major}
                                type="button"
                                onClick={() => {
                                  setSelectedMajor(major)
                                  setMajorOpen(false)
                                }}
                                className="font-headline block w-full px-6 py-3 text-left text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-on-primary"
                              >
                                {major}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="font-headline block px-1 text-sm font-extrabold text-primary">
                    Select City
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableCities.map((city) => {
                      const active = selectedCity === city
                      return (
                        <button
                          key={city}
                          type="button"
                          onClick={() => setSelectedCity(city)}
                          className={`font-label rounded-full px-5 py-2 text-xs font-semibold tracking-wider uppercase transition-colors ${
                            active
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface-container-high text-secondary hover:bg-surface-container-highest'
                          }`}
                        >
                          {city}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedInstitution(null)
                    setSelectedCity('All Cities')
                    setSelectedCourse(null)
                    setSelectedMajor(null)
                    setSearchInput('')
                    setSearchParams({})
                  }}
                  className="font-headline flex items-center gap-2 rounded-full border-2 border-outline px-6 py-2.5 text-sm font-bold text-outline transition-all hover:border-primary hover:bg-surface-variant hover:text-primary whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-16">
          {toursLoading ? (
            <p className="text-center text-secondary">Loading tours…</p>
          ) : null}

          {!toursLoading && emptyDbSearch ? (
            <div className="mb-12 flex flex-col items-center rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-6 py-12 text-center md:px-10">
              <span
                className="material-symbols-outlined mb-4 text-7xl text-primary/40"
                aria-hidden
              >
                travel_explore
              </span>
              <p className="font-headline mb-6 max-w-lg text-lg font-semibold text-primary md:text-xl">
                No exact matches found for &apos;{searchFromUrl}&apos;.
              </p>
              <button
                type="button"
                onClick={clearSearch}
                className="font-headline rounded-full border-2 border-primary bg-primary px-8 py-3 text-sm font-bold text-on-primary shadow-sm transition-all hover:opacity-95 active:scale-[0.99]"
              >
                Clear Search
              </button>
            </div>
          ) : null}

          {!toursLoading && emptyDbSearch && recommendedTours.length > 0 ? (
            <section className="mb-8">
              <h2 className="font-headline mb-8 text-2xl font-extrabold text-primary md:text-3xl">
                Recommended Tours
              </h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {recommendedTours.map((tour) => (
                  <TourCardLink key={tour.id} tour={tour} />
                ))}
              </div>
            </section>
          ) : null}

          {!toursLoading && !emptyDbSearch ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredTours.length === 0 ? (
                <p className="col-span-full text-center font-medium text-secondary">
                  No tours match your filters. Try a different institution or city, or clear filters.
                </p>
              ) : (
                filteredTours.map((tour) => <TourCardLink key={tour.id} tour={tour} />)
              )}
            </div>
          ) : null}
        </div>

        {hasMoreTours ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={loadMoreTours}
              disabled={loadMoreLoading}
              className="font-headline group mb-24 flex items-center gap-3 rounded-full bg-surface-container-high px-10 py-4 text-sm font-bold text-primary transition-all hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadMoreLoading ? 'Loading…' : 'Load More Tours'}
              <span className="material-symbols-outlined transition-transform group-hover:translate-y-1">
                expand_more
              </span>
            </button>
          </div>
        ) : null}
      </main>

      <footer className="w-full border-t border-slate-200/90 bg-[#F8FAFF] pt-16 pb-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-8">
          <Link
            to="/"
            className="font-manrope text-2xl font-bold tracking-tighter text-[#002045]"
          >
            The Academic Curator
          </Link>
          <div className="flex flex-wrap justify-center gap-10">
            <a
              className="font-inter text-xs tracking-wide text-[#5c6578] uppercase transition-colors hover:text-[#002045]"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="font-inter text-xs tracking-wide text-[#5c6578] uppercase transition-colors hover:text-[#002045]"
              href="#"
            >
              Terms of Service
            </a>
            <a
              className="font-inter text-xs tracking-wide text-[#5c6578] uppercase transition-colors hover:text-[#002045]"
              href="#"
            >
              Campus Safety
            </a>
            <Link
              to="/contact"
              className="font-inter text-xs tracking-wide text-[#5c6578] uppercase transition-colors hover:text-[#002045]"
            >
              Contact Support
            </Link>
          </div>
          <div className="font-inter mt-4 text-xs tracking-wide text-slate-500 uppercase">
            © 2024 The Academic Curator. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
