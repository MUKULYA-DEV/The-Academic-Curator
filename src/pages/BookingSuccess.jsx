import { Link, useLocation } from 'react-router-dom'

const FALLBACK_DATE_LINE = 'Monday, Oct 14, 2024'
const FALLBACK_TIME_RANGE = '09:00 AM — 12:30 PM'
const FALLBACK_SESSION_LABEL = 'Morning Session'
const DEFAULT_TOUR_NAME = 'Harvard University Residency Tour'
const DEFAULT_MEETING_LOCATION = 'Harvard Square Information Center, Cambridge, MA'

/** Format a Date as Google Calendar `YYYYMMDDTHHMMSSZ` (UTC). */
function formatGcalUtcTimestamp(d) {
  const s = d.toISOString()
  const datePart = s.slice(0, 10).replace(/-/g, '')
  const timePart = s.slice(11, 19).replace(/:/g, '')
  return `${datePart}T${timePart}Z`
}

/**
 * Find the UTC instant when clocks in America/New_York show `ymd` at hour:minute (24h).
 */
function nyWallClockToUtcDate(ymd, hour24, minute) {
  const [y, mon, day] = ymd.split('-').map(Number)
  if (!Number.isFinite(y) || !Number.isFinite(mon) || !Number.isFinite(day)) {
    return new Date()
  }

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const readParts = (dt) => {
    const entries = Object.fromEntries(
      formatter.formatToParts(dt).filter((x) => x.type !== 'literal').map((x) => [x.type, x.value]),
    )
    return {
      y: Number(entries.year),
      m: Number(entries.month),
      d: Number(entries.day),
      h: Number(entries.hour),
      mi: Number(entries.minute),
    }
  }

  const start = Date.UTC(y, mon - 1, day - 1, 8, 0, 0)
  for (let i = 0; i < 60 * 48; i++) {
    const dt = new Date(start + i * 60 * 1000)
    const p = readParts(dt)
    if (p.y === y && p.m === mon && p.d === day && p.h === hour24 && p.mi === minute) {
      return dt
    }
  }

  return new Date(Date.UTC(y, mon - 1, day, 14, 0, 0))
}

function buildGoogleCalendarUrl({ title, location, details, start, end }) {
  const dates = `${formatGcalUtcTimestamp(start)}/${formatGcalUtcTimestamp(end)}`
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates,
    details,
    location,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function parseBookingState(state) {
  const base = {
    dateLine: FALLBACK_DATE_LINE,
    timeRange: FALLBACK_TIME_RANGE,
    sessionLabel: FALLBACK_SESSION_LABEL,
    ymd: null,
    timeSlot: 'morning',
    tourName: DEFAULT_TOUR_NAME,
    meetingLocation: DEFAULT_MEETING_LOCATION,
  }

  if (!state || typeof state !== 'object') {
    return base
  }

  const { selectedDate: raw, timeSlot, tourName, meetingLocation } = state
  let dateLine = FALLBACK_DATE_LINE
  let ymd = null

  if (typeof raw === 'string' && raw.length > 0) {
    const trimmed = raw.trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      ymd = trimmed
    }
    const ymdMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
    if (ymdMatch) {
      const y = Number(ymdMatch[1])
      const m = Number(ymdMatch[2])
      const day = Number(ymdMatch[3])
      const d = new Date(y, m - 1, day)
      if (!Number.isNaN(d.getTime())) {
        dateLine = d.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      }
    } else {
      const d = new Date(raw)
      if (!Number.isNaN(d.getTime())) {
        dateLine = d.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
        ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      }
    }
  }

  const slot = timeSlot === 'afternoon' ? 'afternoon' : 'morning'
  const slotInfo =
    slot === 'afternoon'
      ? {
          dateLine,
          timeRange: '01:30 PM — 05:00 PM',
          sessionLabel: 'Afternoon Session',
        }
      : {
          dateLine,
          timeRange: '09:00 AM — 12:30 PM',
          sessionLabel: 'Morning Session',
        }

  return {
    ...slotInfo,
    ymd,
    timeSlot: slot,
    tourName:
      typeof tourName === 'string' && tourName.trim() ? tourName.trim() : DEFAULT_TOUR_NAME,
    meetingLocation:
      typeof meetingLocation === 'string' && meetingLocation.trim()
        ? meetingLocation.trim()
        : DEFAULT_MEETING_LOCATION,
  }
}

export default function BookingSuccess() {
  const location = useLocation()
  const parsed = parseBookingState(location.state)
  const { dateLine, timeRange, sessionLabel, ymd, timeSlot, tourName, meetingLocation } = parsed

  function handleAddToCalendar() {
    const dateKey = ymd ?? '2024-10-14'
    const startHm =
      timeSlot === 'afternoon'
        ? { h: 13, m: 30 }
        : { h: 9, m: 0 }
    const endHm =
      timeSlot === 'afternoon'
        ? { h: 17, m: 0 }
        : { h: 12, m: 30 }

    const start = nyWallClockToUtcDate(dateKey, startHm.h, startHm.m)
    const end = nyWallClockToUtcDate(dateKey, endHm.h, endHm.m)

    const details = `Time: ${timeRange} (${sessionLabel}). Meet at ${meetingLocation}.`

    const url = buildGoogleCalendarUrl({
      title: tourName,
      location: meetingLocation,
      details,
      start,
      end,
    })

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="font-body bg-surface text-on-surface antialiased">
      <main className="flex min-h-screen flex-col items-center justify-center px-6 py-20 lg:py-32">
        <div className="w-full max-w-3xl space-y-12 text-center">
          <section className="space-y-6">
            <div className="mb-4 inline-flex h-24 w-24 items-center justify-center rounded-full bg-primary shadow-lg">
              <span
                className="material-symbols-outlined text-5xl text-on-primary"
                style={{ fontVariationSettings: "'wght' 600" }}
              >
                check_circle
              </span>
            </div>
            <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-primary md:text-5xl">
              Tour Confirmed!
            </h1>
            <p className="mx-auto max-w-md text-lg leading-relaxed text-secondary">
              We&apos;ve sent a confirmation email to{' '}
              <span className="font-semibold text-on-surface">julian.vance@example.com.</span>
            </p>
          </section>

          <section className="ghost-shadow relative overflow-hidden rounded-xl bg-surface-container-lowest p-8 text-left md:p-12">
            <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-primary/5" />
            <h2 className="font-label mb-6 text-xs font-bold tracking-[0.05em] text-tertiary uppercase">
              Booking Details
            </h2>
            <div className="space-y-8">
              <div>
                <h3 className="font-headline mb-2 text-2xl font-bold text-primary">{tourName}</h3>
                <div className="h-1 w-12 rounded-full bg-tertiary" />
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-secondary">calendar_today</span>
                  <div className="space-y-1">
                    <p className="font-label text-xs uppercase tracking-wider text-slate-400">Date</p>
                    <p className="font-semibold text-on-surface">{dateLine}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-secondary">schedule</span>
                  <div className="space-y-1">
                    <p className="font-label text-xs uppercase tracking-wider text-slate-400">Time</p>
                    <p className="font-semibold text-on-surface">
                      {timeRange}{' '}
                      <span className="font-normal text-secondary">({sessionLabel})</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 md:col-span-2">
                  <span className="material-symbols-outlined text-secondary">location_on</span>
                  <div className="space-y-1">
                    <p className="font-label text-xs uppercase tracking-wider text-slate-400">
                      Meeting Point
                    </p>
                    <p className="font-semibold text-on-surface">{meetingLocation}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-8 px-4 text-left">
            <h2 className="font-headline border-l-4 border-tertiary pl-4 text-xl font-bold text-primary">
              What&apos;s Next?
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="group">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container-high text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <p className="text-sm leading-relaxed text-secondary">
                  Check your email for your digital ticket and campus map.
                </p>
              </div>
              <div className="group">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container-high text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                  <span className="material-symbols-outlined">timer</span>
                </div>
                <p className="text-sm leading-relaxed text-secondary">
                  Arrive 15 minutes early at the Information Center.
                </p>
              </div>
              <div className="group">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container-high text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <p className="text-sm leading-relaxed text-secondary">
                  Meet your ambassador, Julian, at the entrance.
                </p>
              </div>
            </div>
          </section>

          <section className="flex flex-col items-center justify-center gap-4 pt-6 md:flex-row">
            <Link
              to="/bookings"
              className="w-full rounded-md bg-primary px-10 py-4 font-semibold text-on-primary shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95 md:w-auto"
            >
              View My Bookings
            </Link>
            <button
              type="button"
              onClick={handleAddToCalendar}
              className="w-full rounded-md bg-surface-container-highest px-10 py-4 font-semibold text-primary transition-all hover:bg-surface-variant active:scale-95 md:w-auto"
            >
              Add to Calendar
            </button>
          </section>
        </div>
      </main>

      <footer className="w-full border-t border-slate-200/15 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-8 py-12 md:flex-row">
          <Link
            to="/"
            className="font-headline text-lg font-bold tracking-tighter text-blue-900 dark:text-blue-100"
          >
            The Academic Curator
          </Link>
          <div className="flex flex-wrap justify-center gap-8">
            <a
              className="font-inter text-sm tracking-wide text-slate-500 uppercase transition-colors hover:text-blue-900"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="font-inter text-sm tracking-wide text-slate-500 uppercase transition-colors hover:text-blue-900"
              href="#"
            >
              Terms of Service
            </a>
            <Link
              to="/contact"
              className="font-inter text-sm tracking-wide text-slate-500 uppercase transition-colors hover:text-blue-900"
            >
              Contact Support
            </Link>
            <a
              className="font-inter text-sm tracking-wide text-slate-500 uppercase transition-colors hover:text-blue-900"
              href="#"
            >
              University Partners
            </a>
          </div>
          <div className="font-inter text-sm tracking-wide text-slate-500 uppercase">
            © 2024 The Academic Curator. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
