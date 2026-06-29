import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { UserAvatarMenu } from '../components/NavAuthSection.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { supabase } from '../supabaseClient.js'

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function normalizeDate(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/** Local calendar date as YYYY-MM-DD (avoids UTC shifts when passing between routes). */
function toLocalDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** True if `d` is strictly before calendar today (local date). */
function isBeforeToday(d) {
  const today = normalizeDate(new Date())
  return normalizeDate(d).getTime() < today.getTime()
}

/** 6-row (42 cell) grid: leading/trailing days from adjacent months use `inCurrentMonth: false`. */
function getCalendarCells(viewMonthStart) {
  const year = viewMonthStart.getFullYear()
  const month = viewMonthStart.getMonth()
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevMonthLast = new Date(year, month, 0).getDate()

  const cells = []
  for (let i = 0; i < firstDow; i++) {
    const day = prevMonthLast - firstDow + i + 1
    cells.push({ date: new Date(year, month - 1, day), inCurrentMonth: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inCurrentMonth: true })
  }
  let nextDay = 1
  while (cells.length < 42) {
    cells.push({ date: new Date(year, month + 1, nextDay), inCurrentMonth: false })
    nextDay++
  }
  return cells
}

function formatSidebarDate(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** The 4th of each month shows the limited-slots dot (only used for bookable days). */
function showLimitedSlotDot(date, inCurrentMonth) {
  return inCurrentMonth && date.getDate() === 4
}

const RESIDENCY_COURSES = [
  'Architecture & Urbanism',
  'Economics & Public Policy',
  'Government & International Law',
  'Computer Science & AI Ethics',
]

const COLLEGE_RESIDENCY_SEP = ' — '

function parseStoredCollegeName(stored) {
  if (typeof stored !== 'string' || !stored.trim()) {
    return { base: 'Harvard University Residency Tour', course: RESIDENCY_COURSES[0] }
  }
  const full = stored.trim()
  const idx = full.lastIndexOf(COLLEGE_RESIDENCY_SEP)
  if (idx === -1) {
    return { base: full, course: RESIDENCY_COURSES[0] }
  }
  const base = full.slice(0, idx).trim()
  const courseRaw = full.slice(idx + COLLEGE_RESIDENCY_SEP.length).trim()
  const course = RESIDENCY_COURSES.includes(courseRaw) ? courseRaw : RESIDENCY_COURSES[0]
  return { base, course }
}

function parseTourDateToLocalDate(tourDateStr) {
  if (!tourDateStr || typeof tourDateStr !== 'string') return normalizeDate(new Date())
  const trimmed = tourDateStr.trim()
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (ymd) {
    const d = new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]))
    return Number.isNaN(d.getTime()) ? normalizeDate(new Date()) : normalizeDate(d)
  }
  const d = new Date(trimmed)
  return Number.isNaN(d.getTime()) ? normalizeDate(new Date()) : normalizeDate(d)
}

function normalizeTimeSlot(slot) {
  const s = slot != null ? String(slot).toLowerCase() : ''
  return s === 'afternoon' ? 'afternoon' : 'morning'
}

export default function BookTour() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { session } = useAuth()
  const [groupSize, setGroupSize] = useState(4)
  const [timeSlot, setTimeSlot] = useState('morning')
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(() => normalizeDate(new Date()))
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDuplicateDetected, setIsDuplicateDetected] = useState(false)
  const [bookingError, setBookingError] = useState(null)
  const [tourCollegeBaseOverride, setTourCollegeBaseOverride] = useState(null)
  const [isLoadingEditBooking, setIsLoadingEditBooking] = useState(false)
  const [editBookingError, setEditBookingError] = useState(null)

  const editIdParam = searchParams.get('editId')
  const editId = useMemo(() => {
    if (editIdParam == null || editIdParam === '') return null
    const n = Number(editIdParam)
    return Number.isFinite(n) ? n : null
  }, [editIdParam])

  const tourIdParam = searchParams.get('tourId')
  const tourIdFromUrl = useMemo(() => {
    if (tourIdParam == null || tourIdParam === '') return null
    const t = tourIdParam.trim()
    return t.length > 0 ? t : null
  }, [tourIdParam])

  const isEditMode = editId != null

  const resolvedCollegeName = useMemo(() => {
    if (tourCollegeBaseOverride != null) return tourCollegeBaseOverride
    const collegeFromState = location.state?.collegeName ?? location.state?.college_name
    return typeof collegeFromState === 'string' && collegeFromState.trim()
      ? collegeFromState.trim()
      : 'Harvard University Residency Tour'
  }, [tourCollegeBaseOverride, location.state?.collegeName, location.state?.college_name])

  const [residencyCourse, setResidencyCourse] = useState('Architecture & Urbanism')

  const collegeName = useMemo(
    () => `${resolvedCollegeName}${COLLEGE_RESIDENCY_SEP}${residencyCourse}`,
    [resolvedCollegeName, residencyCourse],
  )

  useEffect(() => {
    let cancelled = false

    async function loadBookingForEdit() {
      if (editId == null) {
        if (!cancelled) {
          setIsLoadingEditBooking(false)
          setEditBookingError(null)
        }
        return
      }

      if (!cancelled) {
        setIsLoadingEditBooking(true)
        setEditBookingError(null)
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (cancelled) return
      if (!user) {
        setEditBookingError('You must be signed in to edit a booking.')
        setIsLoadingEditBooking(false)
        return
      }

      const { data: row, error } = await supabase
        .from('bookings')
        .select('college_name, group_size, phone_number, time_slot, tour_date, user_id')
        .eq('id', editId)
        .maybeSingle()

      if (cancelled) return
      if (error || !row) {
        setEditBookingError(error?.message ?? 'Booking not found.')
        setIsLoadingEditBooking(false)
        return
      }
      if (row.user_id !== user.id) {
        setEditBookingError('You can only edit your own bookings.')
        setIsLoadingEditBooking(false)
        return
      }

      const { base, course } = parseStoredCollegeName(row.college_name)
      const parsedDate = parseTourDateToLocalDate(row.tour_date)
      setTourCollegeBaseOverride(base)
      setResidencyCourse(course)
      setSelectedDate(parsedDate)
      setViewMonth(startOfMonth(parsedDate))
      setTimeSlot(normalizeTimeSlot(row.time_slot))
      const gs = row.group_size
      setGroupSize(
        typeof gs === 'number' && Number.isFinite(gs) && gs >= 1 ? Math.min(15, Math.floor(gs)) : 4,
      )
      if (typeof row.phone_number === 'string' && row.phone_number.trim()) {
        setPhoneNumber(row.phone_number.trim())
      }
      setIsLoadingEditBooking(false)
    }

    loadBookingForEdit()
    return () => {
      cancelled = true
    }
  }, [editId])

  useEffect(() => {
    let cancelled = false

    async function loadTourFromUrl() {
      if (editId != null) return

      if (tourIdFromUrl == null) {
        if (!cancelled) setTourCollegeBaseOverride(null)
        return
      }

      const { data, error } = await supabase
        .from('tours')
        .select('university_name, title')
        .eq('id', tourIdFromUrl)
        .maybeSingle()

      if (cancelled) return
      if (error || !data) {
        setTourCollegeBaseOverride(null)
        return
      }
      const name =
        typeof data.university_name === 'string' && data.university_name.trim()
          ? data.university_name.trim()
          : typeof data.title === 'string' && data.title.trim()
            ? data.title.trim()
            : null
      setTourCollegeBaseOverride(name)
    }

    loadTourFromUrl()
    return () => {
      cancelled = true
    }
  }, [editId, tourIdFromUrl])

  useEffect(() => {
    let cancelled = false

    async function checkExistingBooking() {
      const user = session?.user
      if (!user) {
        if (!cancelled) setIsDuplicateDetected(false)
        return
      }

      const tour_date = toLocalDateKey(selectedDate)

      let q = supabase
        .from('bookings')
        .select('id')
        .eq('user_id', user.id)
        .eq('college_name', collegeName)
        .eq('tour_date', tour_date)
        .eq('time_slot', timeSlot)
        .limit(1)

      if (editId != null) {
        q = q.neq('id', editId)
      }

      const { data: rows, error } = await q

      if (cancelled) return
      if (error) {
        setIsDuplicateDetected(false)
        return
      }
      setIsDuplicateDetected(Array.isArray(rows) && rows.length > 0)
    }

    checkExistingBooking()
    return () => {
      cancelled = true
    }
  }, [selectedDate, timeSlot, session, collegeName, editId])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const fromMeta = session?.user?.user_metadata?.phone
      if (typeof fromMeta === 'string' && fromMeta.trim()) {
        setPhoneNumber(fromMeta.trim())
      }
    })
  }, [])

  const calendarCells = useMemo(() => getCalendarCells(viewMonth), [viewMonth])

  const monthYearLabel = useMemo(() => {
    const y = viewMonth.getFullYear()
    const m = viewMonth.getMonth()
    return new Date(y, m, 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
  }, [viewMonth])

  function goPrevMonth() {
    setViewMonth((m) => {
      const y = m.getFullYear()
      const mo = m.getMonth()
      return new Date(y, mo - 1, 1)
    })
  }

  function goNextMonth() {
    setViewMonth((m) => {
      const y = m.getFullYear()
      const mo = m.getMonth()
      return new Date(y, mo + 1, 1)
    })
  }

  async function handleConfirmBooking() {
    setBookingError(null)
    setIsLoading(true)
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        setBookingError('You must be signed in to book.')
        return
      }

      const tour_date = toLocalDateKey(selectedDate)

      if (isEditMode) {
        const payload = {
          college_name: collegeName,
          phone_number: phoneNumber.trim(),
          tour_date,
          time_slot: timeSlot,
          group_size: groupSize,
        }
        const { error } = await supabase
          .from('bookings')
          .update(payload)
          .eq('id', editId)
          .eq('user_id', user.id)
        if (error) {
          setBookingError(error.message)
          return
        }
        navigate('/bookings?tab=upcoming')
        return
      }

      const row = {
        user_id: user.id,
        user_email: user.email,
        college_name: collegeName,
        phone_number: phoneNumber.trim(),
        tour_date,
        time_slot: timeSlot,
        group_size: groupSize,
        status: 'upcoming',
      }
      const { error } = await supabase.from('bookings').insert(row)
      if (error) {
        setBookingError(error.message)
        return
      }
      navigate('/success', {
        state: {
          selectedDate: tour_date,
          timeSlot,
          tourName: collegeName,
          meetingLocation: 'Harvard Square Information Center, Cambridge, MA',
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="selection:bg-secondary-container bg-background font-body text-on-surface">
      <header className="fixed top-0 z-50 w-full bg-white/80 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-full p-2 transition-colors duration-200 hover:bg-surface-container active:scale-95"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </button>
            <Link
              to="/"
              className="text-xl font-extrabold tracking-tight text-[#002045]"
            >
              The Academic Curator
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined cursor-pointer text-slate-500 transition-colors hover:text-primary">
              notifications
            </span>
            <UserAvatarMenu />
          </div>
        </div>
        <div className="h-px w-full bg-slate-100" />
      </header>

      <main className="mx-auto max-w-7xl px-6 pt-24 pb-32">
        {editBookingError && (
          <div
            className="mb-8 rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-900"
            role="alert"
          >
            <p className="font-semibold">{editBookingError}</p>
            <Link to="/bookings" className="mt-2 inline-block font-bold text-primary underline">
              Back to My Bookings
            </Link>
          </div>
        )}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-10 lg:col-span-8">
            <section>
              <h1 className="font-headline mb-2 text-3xl font-extrabold tracking-tight text-primary">
                {isEditMode ? 'Edit Your Tour Booking' : 'Book Tour - Harvard Residency'}
              </h1>
              <p className="font-body text-secondary">
                {isEditMode
                  ? 'Update your date, time, group size, or residency track. Save when you are ready.'
                  : 'Secure your spot for the Harvard University Residency Tour. Select your preferred schedule and residency track below.'}
              </p>
            </section>

            <div className="relative rounded-xl bg-surface-container-lowest p-8 shadow-[0_12px_32px_rgba(24,28,30,0.06)]">
              {isLoadingEditBooking && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-sm">
                  <p className="font-headline text-sm font-semibold text-primary">Loading booking…</p>
                </div>
              )}
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  1
                </span>
                <h2 className="font-headline text-xl font-bold text-primary">Select Date</h2>
              </div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={goPrevMonth}
                  className="rounded-full p-2 text-primary transition-colors hover:bg-surface-container"
                  aria-label="Previous month"
                >
                  <span className="material-symbols-outlined text-2xl">chevron_left</span>
                </button>
                <p className="font-headline min-w-0 flex-1 text-center text-lg font-bold tracking-tight text-primary">
                  {monthYearLabel}
                </p>
                <button
                  type="button"
                  onClick={goNextMonth}
                  className="rounded-full p-2 text-primary transition-colors hover:bg-surface-container"
                  aria-label="Next month"
                >
                  <span className="material-symbols-outlined text-2xl">chevron_right</span>
                </button>
              </div>
              <div className="mb-4 grid grid-cols-7 gap-2 text-center font-label text-xs font-bold uppercase tracking-wider text-secondary">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {calendarCells.map((cell, index) => {
                  const key = `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}-${index}`
                  if (!cell.inCurrentMonth) {
                    return (
                      <div key={key} className="p-3 text-slate-300">
                        {cell.date.getDate()}
                      </div>
                    )
                  }
                  const past = isBeforeToday(cell.date)
                  if (past) {
                    return (
                      <button
                        key={key}
                        type="button"
                        disabled
                        className="cursor-not-allowed rounded-lg p-3 text-gray-300 opacity-50"
                        aria-label={`${cell.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} — not available`}
                      >
                        {cell.date.getDate()}
                      </button>
                    )
                  }
                  const isSelected = isSameDay(selectedDate, cell.date)
                  const limited = showLimitedSlotDot(cell.date, cell.inCurrentMonth)
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedDate(normalizeDate(cell.date))}
                      aria-pressed={isSelected}
                      aria-label={`Select ${cell.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`}
                      className={`rounded-lg p-3 transition-colors ${
                        isSelected
                          ? 'bg-primary font-bold text-white ring-2 ring-primary ring-offset-2'
                          : 'font-medium hover:bg-surface-container'
                      } ${limited ? 'relative' : ''}`}
                    >
                      {cell.date.getDate()}
                      {limited && (
                        <span
                          className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-tertiary"
                          aria-hidden
                        />
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-secondary">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-primary" />
                  Selected
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-tertiary" />
                  Limited Slots
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-surface-container" />
                  Available
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-surface-container-low p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  2
                </span>
                <h2 className="font-headline text-xl font-bold text-primary">Time Slot</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="group relative flex cursor-pointer items-center rounded-xl bg-white p-4 transition-all hover:ring-2 hover:ring-primary/20">
                  <input
                    checked={timeSlot === 'morning'}
                    className="sr-only"
                    name="timeslot"
                    type="radio"
                    value="morning"
                    onChange={() => setTimeSlot('morning')}
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-primary">Morning Session</span>
                    <span className="text-sm text-secondary">09:00 AM - 12:30 PM</span>
                  </div>
                  <span
                    className={`material-symbols-outlined ml-auto text-primary transition-opacity ${timeSlot === 'morning' ? 'opacity-100' : 'opacity-0'}`}
                  >
                    check_circle
                  </span>
                </label>
                <label className="group relative flex cursor-pointer items-center rounded-xl bg-white p-4 transition-all hover:ring-2 hover:ring-primary/20">
                  <input
                    checked={timeSlot === 'afternoon'}
                    className="sr-only"
                    name="timeslot"
                    type="radio"
                    value="afternoon"
                    onChange={() => setTimeSlot('afternoon')}
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-primary">Afternoon Session</span>
                    <span className="text-sm text-secondary">01:30 PM - 05:00 PM</span>
                  </div>
                  <span
                    className={`material-symbols-outlined ml-auto text-primary transition-opacity ${timeSlot === 'afternoon' ? 'opacity-100' : 'opacity-0'}`}
                  >
                    check_circle
                  </span>
                </label>
              </div>
            </div>

            <div className="rounded-xl bg-surface-container-lowest p-8 shadow-[0_12px_32px_rgba(24,28,30,0.06)]">
              <div className="mb-8 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  3
                </span>
                <h2 className="font-headline text-xl font-bold text-primary">Curriculum Details</h2>
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="font-label block text-sm uppercase tracking-widest text-secondary">
                    Group Size
                  </label>
                  <div className="flex w-fit items-center gap-4 rounded-full bg-surface-container-high p-2">
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary transition-colors hover:bg-primary hover:text-white"
                      onClick={() => setGroupSize((n) => Math.max(1, n - 1))}
                      aria-label="Decrease group size"
                    >
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <span className="w-8 text-center text-lg font-bold">{groupSize}</span>
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary transition-colors hover:bg-primary hover:text-white"
                      onClick={() => setGroupSize((n) => Math.min(15, n + 1))}
                      aria-label="Increase group size"
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                  <p className="mt-2 text-xs italic text-secondary">Max 15 students per residency guide.</p>
                </div>
                <div className="space-y-3">
                  <label className="font-label block text-sm uppercase tracking-widest text-secondary">
                    Residency Course
                  </label>
                  <select
                    value={residencyCourse}
                    onChange={(e) => setResidencyCourse(e.target.value)}
                    className="w-full rounded-xl border-none bg-surface-container-high px-6 py-4 font-medium text-primary focus:ring-1 focus:ring-primary"
                  >
                    {RESIDENCY_COURSES.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="overflow-hidden rounded-xl bg-primary text-white shadow-xl">
                <div className="relative h-48">
                  <img
                    alt="Harvard Campus"
                    className="h-full w-full object-cover opacity-80"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBvAM85cVlgMt_JGereQMJojTE4GAL1vx3aGKQQCT-5O5SLyw51JKkpvdIDFynjvRuKNGbz2MjA3BBFbuQBPgLQFXxDftOaULNrnc7V5mMVMYxat-b6dK7QQkdKSV1aWeeu0vzTL9DsW5-GLueoQQrJ9IMSGFf4RCIczFKIgUXjwjguaE1nIfbsG16jeOMosLjcRqvZM-gdu6v-RGpdjAX1rdGeoHsq4Xet-LXLnac_KEMLio8DQLd7912w-aajHGtD8GkKqe0FHfS"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-6">
                    <span className="rounded-full bg-tertiary px-3 py-1 font-label text-[10px] uppercase tracking-widest text-on-tertiary-fixed">
                      Residency Program
                    </span>
                  </div>
                </div>
                <div className="space-y-4 p-6">
                  <div>
                    <h3 className="font-headline text-xl font-bold leading-tight">
                      Harvard University Residency Tour
                    </h3>
                    <div className="mt-1 flex items-center gap-1 text-on-primary-container">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      <span className="text-sm">Cambridge, MA</span>
                    </div>
                  </div>
                  <div className="space-y-3 border-t border-white/10 pt-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-on-primary-container">Date</span>
                      <span className="font-medium">{formatSidebarDate(selectedDate)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-on-primary-container">Time</span>
                      <span className="font-medium">
                        {timeSlot === 'morning' ? '09:00 AM (Morning)' : '01:30 PM (Afternoon)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-on-primary-container">Attendees</span>
                      <span className="font-medium">{groupSize} Students</span>
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <label className="mb-2 block font-label text-[10px] uppercase tracking-widest text-on-primary-container/80">
                      Phone
                    </label>
                    <input
                      type="tel"
                      autoComplete="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="mb-4 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30"
                      placeholder="Your phone number"
                    />
                    <div className="mb-6 flex items-end justify-between">
                      <span className="text-sm text-on-primary-container">Estimated Total</span>
                      <span className="text-2xl font-bold tracking-tight text-tertiary-fixed">
                        ${(149 * groupSize).toFixed(2)}
                      </span>
                    </div>
                    {bookingError && (
                      <p className="mb-3 text-center text-sm text-red-200" role="alert">
                        {bookingError}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={handleConfirmBooking}
                      disabled={
                        isLoading ||
                        isLoadingEditBooking ||
                        !!editBookingError ||
                        (isDuplicateDetected && !isEditMode)
                      }
                      className="block w-full rounded-xl bg-white py-4 text-center font-bold text-primary shadow-lg transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-60"
                    >
                      {isLoading
                        ? 'Processing...'
                        : isLoadingEditBooking
                          ? 'Loading…'
                          : isEditMode
                            ? 'Update Booking'
                            : isDuplicateDetected
                              ? 'Booked'
                              : 'Confirm Booking'}
                    </button>
                    <p className="mt-4 text-center font-label text-[10px] uppercase tracking-widest text-on-primary-container/60">
                      Secure transaction via Scholar Trail
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-white p-6">
                <span className="material-symbols-outlined text-tertiary">verified_user</span>
                <div>
                  <p className="text-sm font-bold text-primary">Academic Guarantee</p>
                  <p className="mt-1 text-xs leading-relaxed text-secondary">
                    Free cancellation up to 48 hours before the tour. All tours are led by verified
                    Senior Ambassadors.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-slate-100 bg-white px-4 pt-2 pb-6 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] md:hidden">
        <Link
          to="/explore"
          className="flex flex-col items-center justify-center text-slate-400"
        >
          <span className="material-symbols-outlined">explore</span>
          <span className="font-inter mt-1 text-[10px] font-medium tracking-wide uppercase">
            Explore
          </span>
        </Link>
        <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 px-3 py-1 text-[#002045]">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            event_available
          </span>
          <span className="font-inter mt-1 text-[10px] font-medium tracking-wide uppercase">
            My Tours
          </span>
        </div>
        <div className="flex flex-col items-center justify-center text-slate-400">
          <span className="material-symbols-outlined">school</span>
          <span className="font-inter mt-1 text-[10px] font-medium tracking-wide uppercase">
            Curators
          </span>
        </div>
        <div className="flex flex-col items-center justify-center text-slate-400">
          <span className="material-symbols-outlined">person</span>
          <span className="font-inter mt-1 text-[10px] font-medium tracking-wide uppercase">
            Profile
          </span>
        </div>
      </nav>
    </div>
  )
}
