import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { supabase } from '../supabaseClient.js'
import { formatBookingName } from '../services/tourService.js'

const DEFAULT_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuADGPVyubLAEce1GpEB-MMRIvZInCObU1KnFgpPxnWvHboWHAoMej6-W28W3o34kbbFrYv_q2SpeVer3XuIcaVlgNrBl8dDpK4PgA93zK8FhuniY_luhNmrJ-9appk1PyVCXxNXVM0cD42ntefaXfkyeffe3I7Tiec8CL6a6rwavUEwDXAjszN5FAd8HDlNZkMU1bvidRioOjB2DZIgFQKugyi03FMJxVwXex219sF2CEaPhOPb55IN2xL_9AbjK3VnELuMOw_dLOuR',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDOkaglmwGjC9CUk14d2_HK8tQhj2C8p-7crm031LMgBkvT8rzXWkKzJLvLmXPgBr9c7gyx0d3UUt5ExR6A-j-rlc1bKtxWXcUOFrQwR07OXzT49jUCCDX3eQokVYTn0KYXchLNO4_twD1rtNcZUH1R-JlhBF0mp19qqX3cHgkPMCBR8MwgEkNES1eHBbd83inZcZwZZ2M5rmcTtn23kpjOKlDAbnZF-C7R4RRE3Nf6j_RnQuZWSUWlX9ffRVYBG7GLFQmoL9cLmxa-',
]

function formatTourId(id) {
  return `#BK-${String(id).slice(0, 5).toUpperCase()}`
}

function formatTourDate(tourDateStr) {
  if (!tourDateStr || typeof tourDateStr !== 'string') return '—'
  const trimmed = tourDateStr.trim()
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (ymd) {
    const d = new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]))
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  }
  const d = new Date(trimmed)
  return Number.isNaN(d.getTime()) ? trimmed : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTimeSlot(slot) {
  if (slot === 'afternoon') return '01:30 PM'
  if (slot === 'morning') return '09:00 AM'
  return slot != null && slot !== '' ? String(slot) : '—'
}

/** Lowercase status for styling; missing/empty → `upcoming` (matches bookings tab filter). */
function normalizeBookingStatusKey(booking) {
  const raw = booking?.status
  if (raw == null || (typeof raw === 'string' && raw.trim() === '')) return 'upcoming'
  return String(raw).trim().toLowerCase()
}

function getBookingCardStatusBadgeLabel(booking) {
  const raw = booking?.status
  if (raw == null || (typeof raw === 'string' && raw.trim() === '')) return 'UPCOMING'
  return String(raw).trim().toUpperCase()
}

function getBookingCardStatusBadgeClass(statusKey) {
  if (statusKey === 'completed') {
    return 'bg-emerald-600 text-white shadow-lg'
  }
  if (statusKey === 'cancelled') {
    return 'bg-red-600 text-white shadow-lg'
  }
  return 'bg-amber-400 text-amber-950 shadow-lg'
}

/** Only `upcoming` (after normalize) may use Mark complete + Cancel; not completed/cancelled. */
function isUpcomingStatusForActions(booking) {
  return normalizeBookingStatusKey(booking) === 'upcoming'
}

function BookingMenu({ booking, onShareTour, onCancelRequest }) {
  const editHref = `/book-tour?editId=${encodeURIComponent(String(booking.id))}`
  return (
    <div className="font-headline invisible absolute top-full right-0 z-20 mt-2 w-48 rounded-xl border border-outline-variant/10 bg-white py-2 opacity-0 shadow-xl transition-all duration-200 group-hover/dropdown:visible group-hover/dropdown:opacity-100">
      <Link
        to={editHref}
        className="text-primary hover:bg-surface-container-low flex items-center gap-3 px-4 py-2 text-sm transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="material-symbols-outlined text-lg">edit</span>
        <span className="font-bold">Edit Booking</span>
      </Link>
      <button
        type="button"
        className="text-primary hover:bg-surface-container-low flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onShareTour(booking)
        }}
      >
        <span className="material-symbols-outlined text-lg">share</span>
        <span className="font-bold">Share Tour</span>
      </button>
      <div className="border-outline-variant/5 my-1 border-t" />
      <button
        type="button"
        className="text-error hover:bg-error-container/10 flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onCancelRequest(booking.id)
        }}
      >
        <span className="material-symbols-outlined text-lg">delete</span>
        <span className="font-bold">Cancel Request</span>
      </button>
    </div>
  )
}

function CompletedBookingMenu({ showFeedback }) {
  return (
    <div className="font-headline invisible absolute top-full right-0 z-20 mt-2 w-48 rounded-xl border border-outline-variant/10 bg-white py-2 opacity-0 shadow-xl transition-all duration-200 group-hover/dropdown:visible group-hover/dropdown:opacity-100">
      <a
        className="text-primary hover:bg-surface-container-low flex items-center gap-3 px-4 py-2 text-sm transition-colors"
        href="#"
      >
        <span className="material-symbols-outlined text-lg">receipt_long</span>
        <span className="font-bold">View Receipt</span>
      </a>
      <a
        className="text-primary hover:bg-surface-container-low flex items-center gap-3 px-4 py-2 text-sm transition-colors"
        href="#"
      >
        <span className="material-symbols-outlined text-lg">history</span>
        <span className="font-bold">Rebook Tour</span>
      </a>
      {showFeedback ? (
        <>
          <div className="border-outline-variant/5 my-1 border-t" />
          <a
            className="text-primary hover:bg-surface-container-low flex items-center gap-3 px-4 py-2 text-sm transition-colors"
            href="#"
          >
            <span className="material-symbols-outlined text-lg">reviews</span>
            <span className="font-bold">Leave Feedback</span>
          </a>
        </>
      ) : null}
    </div>
  )
}

function CancelledBookingMenu() {
  return (
    <div className="font-headline invisible absolute top-full right-0 z-20 mt-2 w-48 rounded-xl border border-outline-variant/10 bg-white py-2 opacity-0 shadow-xl transition-all duration-200 group-hover/dropdown:visible group-hover/dropdown:opacity-100">
      <a
        className="text-primary hover:bg-surface-container-low flex items-center gap-3 px-4 py-2 text-sm transition-colors"
        href="#"
      >
        <span className="material-symbols-outlined text-lg">info</span>
        <span className="font-bold">Reason for Cancellation</span>
      </a>
      <a
        className="text-primary hover:bg-surface-container-low flex items-center gap-3 px-4 py-2 text-sm transition-colors"
        href="#"
      >
        <span className="material-symbols-outlined text-lg">history</span>
        <span className="font-bold">Rebook Tour</span>
      </a>
    </div>
  )
}

function CompletedBookingCard({ booking, imageSrc, showFeedbackInMenu, hideFooterActions }) {
  const ambassador =
    booking.ambassador_name != null && String(booking.ambassador_name).trim() !== ''
      ? String(booking.ambassador_name).trim()
      : '—'
  const displayName = booking.tours
    ? formatBookingName(booking.tours.university_name || booking.tours.title, booking.course, booking.branch)
    : (booking.college_name ?? 'Campus tour')
  const imageToUse = booking.tours?.image_url || imageSrc

  return (
    <div className="border-outline-variant/10 group flex flex-col overflow-hidden rounded-2xl border bg-white opacity-90 shadow-[0px_8px_24px_rgba(26,54,93,0.04)] transition-opacity hover:opacity-100 md:flex-row">
      <div className="relative h-64 w-full shrink-0 md:h-auto md:w-[320px]">
        <img
          alt={displayName}
          className="h-full w-full object-cover grayscale-[40%]"
          src={imageToUse}
        />
        <div className="absolute top-4 left-4">
          <span className="border-secondary/20 bg-secondary/20 text-secondary rounded-full border px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase shadow-sm backdrop-blur-sm">
            COMPLETED
          </span>
        </div>
      </div>
      <div className="flex flex-grow flex-col justify-between p-8">
        <div>
          <div className="group/dropdown relative mb-1 flex items-start justify-between">
            <span className="font-headline text-[10px] font-bold tracking-widest text-outline uppercase">
              TOUR ID: {formatTourId(booking.id)}
            </span>
            {!hideFooterActions ? (
              <>
                <button
                  type="button"
                  className="text-outline-variant hover:text-primary transition-colors"
                  aria-label="Booking actions"
                >
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
                <CompletedBookingMenu showFeedback={showFeedbackInMenu} />
              </>
            ) : (
              <span className="w-10 shrink-0" aria-hidden />
            )}
          </div>
          <h3 className="headline mb-6 text-2xl font-bold text-primary/80">{displayName}</h3>
          <div className="mb-8 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="bg-surface-container-low flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <span className="material-symbols-outlined text-outline text-xl">calendar_today</span>
              </div>
              <div>
                <p className="text-outline-variant mb-0.5 text-[10px] font-bold tracking-wider uppercase">DATE</p>
                <p className="text-secondary text-sm font-semibold">{formatTourDate(booking.tour_date)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-surface-container-low flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <span className="material-symbols-outlined text-outline text-xl">history_edu</span>
              </div>
              <div>
                <p className="text-outline-variant mb-0.5 text-[10px] font-bold tracking-wider uppercase">AMBASSADOR</p>
                <p className="text-secondary text-sm font-semibold">{ambassador}</p>
              </div>
            </div>
          </div>
        </div>
        {!hideFooterActions ? (
          <div className="border-outline-variant/5 mt-auto flex flex-wrap gap-3 border-t pt-4">
            <button
              type="button"
              className="border-primary/20 text-primary hover:bg-primary/5 rounded-full border px-6 py-2 text-sm font-bold transition-all"
            >
              View Receipt
            </button>
            <button
              type="button"
              className="bg-surface-container-highest text-primary hover:bg-surface-container-high rounded-full px-6 py-2 text-sm font-bold transition-all"
            >
              Rebook Tour
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function CancelledBookingCard({ booking, imageSrc, hideFooterActions }) {
  const ambassador =
    booking.ambassador_name != null && String(booking.ambassador_name).trim() !== ''
      ? String(booking.ambassador_name).trim()
      : '—'
  const displayName = booking.tours
    ? formatBookingName(booking.tours.university_name || booking.tours.title, booking.course, booking.branch)
    : (booking.college_name ?? 'Campus tour')
  const imageToUse = booking.tours?.image_url || imageSrc

  return (
    <div className="border-outline-variant/10 group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-[0px_8px_24px_rgba(26,54,93,0.04)] transition-all hover:shadow-lg md:flex-row">
      <div className="relative h-64 w-full shrink-0 md:h-auto md:w-[320px]">
        <img
          alt={displayName}
          className="h-full w-full object-cover grayscale-[80%] brightness-[0.9]"
          src={imageToUse}
        />
        <div className="absolute top-4 left-4">
          <span className="rounded-full border border-red-100 bg-red-50/90 px-4 py-1.5 text-[10px] font-bold tracking-widest text-red-700 uppercase shadow-sm backdrop-blur-sm">
            CANCELLED
          </span>
        </div>
      </div>
      <div className="flex flex-grow flex-col justify-between p-8">
        <div>
          <div className="group/dropdown relative mb-1 flex items-start justify-between">
            <span className="font-headline text-[10px] font-bold tracking-widest text-outline uppercase">
              TOUR ID: {formatTourId(booking.id)}
            </span>
            {!hideFooterActions ? (
              <>
                <button
                  type="button"
                  className="text-outline-variant hover:text-primary transition-colors"
                  aria-label="Booking actions"
                >
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
                <CancelledBookingMenu />
              </>
            ) : (
              <span className="w-10 shrink-0" aria-hidden />
            )}
          </div>
          <h3 className="headline mb-6 text-2xl font-bold text-primary/60">{displayName}</h3>
          <div className="mb-8 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="bg-surface-container-low flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <span className="material-symbols-outlined text-outline text-xl">calendar_today</span>
              </div>
              <div>
                <p className="text-outline-variant mb-0.5 text-[10px] font-bold tracking-wider uppercase">
                  ORIGINAL DATE
                </p>
                <p className="text-secondary text-sm font-semibold">{formatTourDate(booking.tour_date)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-surface-container-low flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <span className="material-symbols-outlined text-outline text-xl">history_edu</span>
              </div>
              <div>
                <p className="text-outline-variant mb-0.5 text-[10px] font-bold tracking-wider uppercase">AMBASSADOR</p>
                <p className="text-secondary text-sm font-semibold">{ambassador}</p>
              </div>
            </div>
          </div>
        </div>
        {!hideFooterActions ? (
          <div className="border-outline-variant/5 mt-auto flex flex-wrap gap-3 border-t pt-4">
            <button
              type="button"
              className="border-primary/20 text-primary hover:bg-primary/5 rounded-full border px-6 py-2 text-sm font-bold transition-all"
            >
              View Details
            </button>
            <button
              type="button"
              className="bg-surface-container-highest text-primary hover:bg-surface-container-high rounded-full px-6 py-2 text-sm font-bold transition-all"
            >
              Rebook Tour
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function BookingsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="border-outline-variant/10 flex animate-pulse flex-col overflow-hidden rounded-2xl border bg-white md:flex-row"
        >
          <div className="h-64 w-full shrink-0 bg-surface-container-high md:w-[320px]" />
          <div className="flex flex-grow flex-col gap-4 p-8">
            <div className="h-4 w-32 rounded bg-surface-container-high" />
            <div className="h-8 w-3/4 max-w-md rounded bg-surface-container-high" />
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="h-14 rounded-xl bg-surface-container-high" />
              <div className="h-14 rounded-xl bg-surface-container-high" />
              <div className="h-14 rounded-xl bg-surface-container-high" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AllBookings() {
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [searchParams] = useSearchParams()
  const [toastMessage, setToastMessage] = useState(null)

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'upcoming' || tab === 'completed' || tab === 'cancelled') {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    if (!toastMessage) return undefined
    const t = setTimeout(() => setToastMessage(null), 4000)
    return () => clearTimeout(t)
  }, [toastMessage])

  useEffect(() => {
    let cancelled = false

    async function loadBookings() {
      setIsLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        if (!cancelled) {
          const data = []
          setBookings(data)
          console.log('All Bookings from DB:', data)
          setIsLoading(false)
        }
        return
      }

      let primary = await supabase
        .from('bookings')
        .select('*, tours(university_name, title, image_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (cancelled) return

      let rows = primary.data ?? []
      if (primary.error) {
        primary = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        if (cancelled) return
        rows = primary.data ?? []
      }

      if (!rows.length) {
        const fallback = await supabase
          .from('bookings')
          .select('*, tours(university_name, title, image_url)')
          .eq('user_id', user.id)
          .order('tour_date', { ascending: false })
        if (cancelled) return
        rows = fallback.data ?? []
        if (fallback.error) {
          const fallbackSimple = await supabase
            .from('bookings')
            .select('*')
            .eq('user_id', user.id)
            .order('tour_date', { ascending: false })
          if (cancelled) return
          rows = fallbackSimple.data ?? []
        }
      }


      const data = rows
      setBookings(data)
      console.log('All Bookings from DB:', data)
      setIsLoading(false)
    }

    loadBookings()
    return () => {
      cancelled = true
    }
  }, [])

  const upcomingBookings = useMemo(
    () =>
      bookings.filter(
        (b) => b.status?.toLowerCase() === 'upcoming' || !b.status,
      ),
    [bookings],
  )

  const completedBookings = useMemo(
    () => bookings.filter((b) => b.status?.toLowerCase() === 'completed'),
    [bookings],
  )

  const cancelledBookings = useMemo(
    () => bookings.filter((b) => b.status?.toLowerCase() === 'cancelled'),
    [bookings],
  )

  async function handleUpdateStatus(bookingId, newStatus) {
    let previousStatus
    setBookings((prev) => {
      const target = prev.find((b) => b.id === bookingId)
      previousStatus = target?.status
      return prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    })

    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId)

    if (error) {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: previousStatus } : b)),
      )
    }
  }

  async function handleCancelRequestFromMenu(bookingId) {
    if (!window.confirm('Are you sure you want to cancel this tour?')) return

    let previousStatus
    setBookings((prev) => {
      const target = prev.find((b) => b.id === bookingId)
      previousStatus = target?.status
      return prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    })

    const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId)

    if (error) {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: previousStatus } : b)),
      )
      setToastMessage({ type: 'error', text: error.message })
      return
    }

    setToastMessage({ type: 'success', text: 'Tour cancelled successfully.' })
  }

  async function handleShareTour(booking) {
    const universityName = booking.college_name ?? 'Campus tour'
    const dateLabel = formatTourDate(booking.tour_date)
    const text = `Check out my upcoming campus tour at ${universityName} on ${dateLabel}!`
    const url = `${window.location.origin}/explore`

    const shareSupported =
      typeof navigator !== 'undefined' && typeof navigator.share === 'function'

    if (shareSupported) {
      try {
        await navigator.share({
          title: universityName,
          text,
          url,
        })
      } catch (err) {
        if (err?.name === 'AbortError') return
        try {
          await navigator.clipboard.writeText(`${text} ${url}`)
          setToastMessage({ type: 'success', text: 'Link copied to clipboard!' })
        } catch {
          setToastMessage({
            type: 'error',
            text: 'Could not share or copy. Please try again.',
          })
        }
      }
      return
    }

    try {
      await navigator.clipboard.writeText(`${text} ${url}`)
      setToastMessage({ type: 'success', text: 'Link copied to clipboard!' })
    } catch {
      setToastMessage({ type: 'error', text: 'Could not copy to clipboard.' })
    }
  }

  const statSecondRow = useMemo(() => {
    if (activeTab === 'upcoming') {
      return {
        label: 'Upcoming',
        value: upcomingBookings.length,
        icon: 'event_available',
      }
    }
    if (activeTab === 'completed') {
      return {
        label: 'Completed',
        value: completedBookings.length,
        icon: 'verified',
      }
    }
    return {
      label: 'Cancelled',
      value: cancelledBookings.length,
      icon: 'event_busy',
    }
  }, [activeTab, upcomingBookings.length, completedBookings.length, cancelledBookings.length])

  const tabActiveClass =
    'rounded-full bg-primary px-6 py-2 text-sm font-semibold text-on-primary shadow-md transition-all'
  const tabInactiveClass =
    'rounded-full bg-surface-container-highest px-6 py-2 text-sm font-medium text-on-secondary-container transition-all hover:bg-surface-container-high'

  return (
    <div className="bg-surface text-on-surface">
      {toastMessage ? (
        <div
          role="status"
          className={`font-headline fixed bottom-6 left-1/2 z-[100] max-w-md -translate-x-1/2 rounded-full px-6 py-3 text-center text-sm font-semibold shadow-lg ${
            toastMessage.type === 'error'
              ? 'border border-red-200 bg-red-50 text-red-900'
              : 'border border-primary/20 bg-primary text-on-primary'
          }`}
        >
          {toastMessage.text}
        </div>
      ) : null}

      <Navbar />

      <main className="mx-auto min-h-screen max-w-7xl px-6 pt-24 pb-20">
        <header className="mb-12">
          <h1 className="font-headline mb-4 text-4xl font-extrabold tracking-tighter text-primary md:text-5xl">
            My Academic Journey: Tour Bookings
          </h1>
          <p className="text-secondary body-md max-w-2xl">
            Manage your campus experiences, connect with ambassadors, and prepare for your next academic
            chapter.
          </p>
        </header>

        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="flex-grow space-y-8">
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('upcoming')}
                className={activeTab === 'upcoming' ? tabActiveClass : tabInactiveClass}
              >
                Upcoming Tours
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('completed')}
                className={activeTab === 'completed' ? tabActiveClass : tabInactiveClass}
              >
                Completed Tours
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cancelled')}
                className={activeTab === 'cancelled' ? tabActiveClass : tabInactiveClass}
              >
                Cancelled
              </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {activeTab === 'upcoming' &&
                (isLoading ? (
                  <BookingsLoadingSkeleton />
                ) : upcomingBookings.length === 0 ? (
                  <div className="border-outline-variant/10 rounded-2xl border bg-surface-container-lowest px-8 py-16 text-center">
                    <p className="font-headline mb-6 text-lg font-semibold text-primary">No bookings found</p>
                    <Link
                      to="/explore"
                      className="font-headline inline-flex rounded-full bg-primary px-8 py-3 text-sm font-bold text-on-primary shadow-md transition-all hover:opacity-95"
                    >
                      Explore Tours
                    </Link>
                  </div>
                ) : (
                  upcomingBookings.map((booking, index) => {
                    const statusKey = normalizeBookingStatusKey(booking)
                    const statusBadgeLabel = getBookingCardStatusBadgeLabel(booking)
                    const statusBadgeClass = getBookingCardStatusBadgeClass(statusKey)
                    const showUpcomingActions = isUpcomingStatusForActions(booking)
                    const imageSrc = DEFAULT_IMAGES[index % DEFAULT_IMAGES.length]

                    const displayName = booking.tours
                      ? formatBookingName(booking.tours.university_name || booking.tours.title, booking.course, booking.branch)
                      : (booking.college_name ?? 'Campus tour')
                    const imageToUse = booking.tours?.image_url || imageSrc

                    return (
                      <div
                        key={booking.id}
                        className="border-outline-variant/10 group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-[0px_8px_24px_rgba(26,54,93,0.06)] md:flex-row"
                      >
                        <div className="relative h-64 w-full shrink-0 md:h-auto md:w-[320px]">
                          <img
                            alt={displayName}
                            className="h-full w-full object-cover"
                            src={imageToUse}
                          />
                          <div className="absolute top-4 left-4">
                            <span
                              className={`rounded-full px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase ${statusBadgeClass}`}
                            >
                              {statusBadgeLabel}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-grow flex-col justify-between p-8">
                          <div>
                            <div className="group/dropdown relative mb-1 flex items-start justify-between">
                              <span className="font-headline text-[10px] font-bold tracking-widest text-outline uppercase">
                                TOUR ID: {formatTourId(booking.id)}
                              </span>
                              <button
                                type="button"
                                className="text-outline-variant hover:text-primary transition-colors"
                                aria-label="Booking actions"
                              >
                                <span className="material-symbols-outlined">more_vert</span>
                              </button>
                              <BookingMenu
                                booking={booking}
                                onShareTour={handleShareTour}
                                onCancelRequest={handleCancelRequestFromMenu}
                              />
                            </div>
                            <h3 className="headline mb-6 text-2xl font-bold text-primary">
                              {displayName}
                            </h3>
                            <div className="mb-8 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                              <div className="flex items-start gap-3">
                                <div className="bg-surface-container-low flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                                  <span className="material-symbols-outlined text-primary text-xl">
                                    calendar_today
                                  </span>
                                </div>
                                <div>
                                  <p className="text-outline-variant mb-0.5 text-[10px] font-bold tracking-wider uppercase">
                                    DATE
                                  </p>
                                  <p className="text-primary text-sm font-semibold">
                                    {formatTourDate(booking.tour_date)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="bg-surface-container-low flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                                  <span className="material-symbols-outlined text-primary text-xl">schedule</span>
                                </div>
                                <div>
                                  <p className="text-outline-variant mb-0.5 text-[10px] font-bold tracking-wider uppercase">
                                    TIME
                                  </p>
                                  <p className="text-primary text-sm font-semibold">
                                    {formatTimeSlot(booking.time_slot)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="bg-surface-container-low flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                                  <span className="material-symbols-outlined text-primary text-xl">group</span>
                                </div>
                                <div>
                                  <p className="text-outline-variant mb-0.5 text-[10px] font-bold tracking-wider uppercase">
                                    GROUP SIZE
                                  </p>
                                  <p className="text-primary text-sm font-semibold">
                                    {booking.group_size ?? '—'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="border-outline-variant/5 mt-auto flex flex-wrap gap-3 border-t pt-4">
                            {showUpcomingActions ? (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(booking.id, 'completed')}
                                className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90"
                              >
                                Mark as Completed
                              </button>
                            ) : (
                              <span className="rounded-full bg-surface-container-high px-6 py-2 text-sm font-bold text-secondary">
                                {statusBadgeLabel}
                              </span>
                            )}
                            {showUpcomingActions ? (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                className="border-error/20 bg-error-container/10 text-error hover:bg-error-container/20 rounded-full border px-6 py-2 text-sm font-bold transition-all"
                              >
                                Cancel Request
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    )
                  })
                ))}

              {activeTab === 'completed' &&
                (isLoading ? (
                  <BookingsLoadingSkeleton />
                ) : completedBookings.length === 0 ? (
                  <div className="border-outline-variant/10 rounded-2xl border bg-surface-container-lowest px-8 py-16 text-center">
                    <p className="font-headline mb-6 text-lg font-semibold text-primary">No bookings found</p>
                    <Link
                      to="/explore"
                      className="font-headline inline-flex rounded-full bg-primary px-8 py-3 text-sm font-bold text-on-primary shadow-md transition-all hover:opacity-95"
                    >
                      Explore Tours
                    </Link>
                  </div>
                ) : (
                  completedBookings.map((booking, index) => (
                    <CompletedBookingCard
                      key={booking.id}
                      booking={booking}
                      imageSrc={DEFAULT_IMAGES[index % DEFAULT_IMAGES.length]}
                      showFeedbackInMenu={index === 0}
                      hideFooterActions
                    />
                  ))
                ))}

              {activeTab === 'cancelled' &&
                (isLoading ? (
                  <BookingsLoadingSkeleton />
                ) : cancelledBookings.length === 0 ? (
                  <div className="border-outline-variant/10 rounded-2xl border bg-surface-container-lowest px-8 py-16 text-center">
                    <p className="font-headline mb-6 text-lg font-semibold text-primary">No bookings found</p>
                    <Link
                      to="/explore"
                      className="font-headline inline-flex rounded-full bg-primary px-8 py-3 text-sm font-bold text-on-primary shadow-md transition-all hover:opacity-95"
                    >
                      Explore Tours
                    </Link>
                  </div>
                ) : (
                  cancelledBookings.map((booking, index) => (
                    <CancelledBookingCard
                      key={booking.id}
                      booking={booking}
                      imageSrc={DEFAULT_IMAGES[index % DEFAULT_IMAGES.length]}
                      hideFooterActions
                    />
                  ))
                ))}
            </div>
          </div>

          <aside className="w-full space-y-6 lg:w-80">
            <div className="border-outline-variant/10 rounded-[2rem] border bg-surface-container-low p-8">
              <h3 className="headline mb-6 flex items-center gap-2 text-xl font-extrabold text-primary">
                <span className="material-symbols-outlined">analytics</span> Booking Statistics
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between rounded-2xl bg-white/60 p-4">
                  <div>
                    <p className="font-label text-xs font-bold tracking-wider text-secondary uppercase">
                      Total Tours
                    </p>
                    <p className="text-primary text-3xl font-extrabold">{isLoading ? '—' : bookings.length}</p>
                  </div>
                  <span className="material-symbols-outlined text-tertiary text-4xl opacity-50">school</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/60 p-4">
                  <div>
                    <p className="font-label text-xs font-bold tracking-wider text-secondary uppercase">
                      {statSecondRow.label}
                    </p>
                    <p className="text-primary text-3xl font-extrabold">
                      {isLoading ? '—' : statSecondRow.value}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-tertiary text-4xl opacity-50">
                    {statSecondRow.icon}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-primary p-8 text-on-primary">
              <h3 className="headline mb-4 text-xl font-bold">Quick Help</h3>
              <p className="text-on-primary-container mb-6 text-sm leading-relaxed">
                {activeTab === 'upcoming' &&
                  'Need to reschedule? Our support team is here to ensure your academic journey is seamless.'}
                {activeTab === 'completed' &&
                  'Want to revisit a campus? Use the Rebook option to schedule another tour with the same ambassador.'}
                {activeTab === 'cancelled' &&
                  'Had a tour cancelled? You can easily rebook with the same ambassador or browse other available sessions.'}
              </p>
              <Link
                to="/contact"
                className="bg-tertiary text-on-tertiary flex w-full items-center justify-center gap-2 rounded-full py-4 font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-lg">support_agent</span>
                Contact Support
              </Link>
            </div>

            <div className="border-outline-variant/30 flex items-start gap-4 rounded-[2rem] border-2 border-dashed p-6">
              <span className="material-symbols-outlined text-tertiary">lightbulb</span>
              <div>
                <p className="mb-1 text-xs font-bold tracking-widest text-secondary uppercase">Scholar Tip</p>
                <p className="text-on-surface-variant text-sm italic">
                  {activeTab === 'upcoming' && (
                    <>
                      &quot;Prepare 3 specific questions for your ambassador to get the most out of your Research
                      Symposium tour.&quot;
                    </>
                  )}
                  {activeTab === 'completed' && (
                    <>
                      &quot;Your feedback helps ambassadors improve! Don&apos;t forget to leave a review for your
                      past tours.&quot;
                    </>
                  )}
                  {activeTab === 'cancelled' && (
                    <>
                      &quot;Cancelled tours are sometimes due to emergency university events. Rebooking is usually
                      immediate!&quot;
                    </>
                  )}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-outline-variant/10 border-t bg-[#F7FAFC] dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-8 py-12 md:flex-row">
          <div className="flex flex-col items-center md:items-start">
            <span className="mb-2 font-headline text-lg font-bold text-[#002045] dark:text-slate-200">
              The Academic Curator
            </span>
            <p className="text-center font-body text-sm tracking-wide text-[#545F72] md:text-left dark:text-slate-400">
              © 2024 The Academic Curator. Empowering the next generation of scholars.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 font-body text-sm tracking-wide text-[#545F72] dark:text-slate-400">
            <a
              className="opacity-80 transition-colors hover:text-[#735C00] hover:underline hover:opacity-100"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="opacity-80 transition-colors hover:text-[#735C00] hover:underline hover:opacity-100"
              href="#"
            >
              Terms of Service
            </a>
            <a
              className="opacity-80 transition-colors hover:text-[#735C00] hover:underline hover:opacity-100"
              href="#"
            >
              Campus Safety
            </a>
            <Link
              to="/contact"
              className="opacity-80 transition-colors hover:text-[#735C00] hover:underline hover:opacity-100"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
