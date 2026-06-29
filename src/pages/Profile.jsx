import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { supabase } from '../supabaseClient.js'

function formatBookingDateLabel(tourDateStr) {
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

function formatBookingIdDisplay(id) {
  return `#BK-${String(id).slice(0, 5).toUpperCase()}`
}

function getBookingStatusBadge(status) {
  const raw = status != null && String(status).trim() !== '' ? String(status).trim().toLowerCase() : ''
  if (raw === 'completed') {
    return {
      label: 'Completed',
      className: 'bg-white/25 text-white border border-white/20',
    }
  }
  if (raw === 'cancelled') {
    return {
      label: 'Cancelled',
      className: 'bg-red-500/35 text-red-50 border border-red-300/40',
    }
  }
  return {
    label: 'Upcoming',
    className: 'bg-tertiary-container text-on-tertiary-container',
  }
}

function RecentBookingsSkeleton() {
  return (
    <div className="space-y-6">
      {[0, 1].map((i) => (
        <div key={i} className="animate-pulse space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="h-5 flex-1 rounded bg-white/20" />
            <div className="h-5 w-16 shrink-0 rounded-full bg-white/15" />
          </div>
          <div className="h-4 w-32 rounded bg-white/10" />
          <div className="border-t border-white/10 pt-4">
            <div className="h-3 w-28 rounded bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Profile() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailNotif, setEmailNotif] = useState(true)
  const [smsNotif, setSmsNotif] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('')
  const [passwordLastUpdated, setPasswordLastUpdated] = useState('3 months ago')
  const passwordSuccessTimeoutRef = useRef(null)
  const [recentBookings, setRecentBookings] = useState([])
  const [recentBookingsLoading, setRecentBookingsLoading] = useState(true)

  async function handleSaveProfile() {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
        },
      })
      if (error) {
        alert(error.message)
        return
      }
      alert('Profile updated successfully!')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleToggle(type) {
    const newEmailState = type === 'email' ? !emailNotif : emailNotif
    const newSmsState = type === 'sms' ? !smsNotif : smsNotif
    if (type === 'email') setEmailNotif(newEmailState)
    if (type === 'sms') setSmsNotif(newSmsState)

    const { error } = await supabase.auth.updateUser({
      data: {
        email_notifications: newEmailState,
        sms_alerts: newSmsState,
      },
    })
    if (error) {
      alert(error.message)
      if (type === 'email') setEmailNotif(!newEmailState)
      if (type === 'sms') setSmsNotif(!newSmsState)
    }
  }

  async function handleChangePassword() {
    const pwd = newPassword.trim()
    if (!pwd) {
      alert('Please enter a new password.')
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: pwd,
      data: {
        password_updated_at: new Date().toISOString(),
      },
    })
    if (error) {
      alert(error.message)
      return
    }
    setNewPassword('')
    setShowPassword(false)
    setIsEditingPassword(false)
    setPasswordLastUpdated('Just now')
    setPasswordSuccessMsg('Password updated successfully!')
    if (passwordSuccessTimeoutRef.current) {
      clearTimeout(passwordSuccessTimeoutRef.current)
    }
    passwordSuccessTimeoutRef.current = setTimeout(() => {
      setPasswordSuccessMsg('')
      passwordSuccessTimeoutRef.current = null
    }, 3000)
  }

  useEffect(() => {
    return () => {
      if (passwordSuccessTimeoutRef.current) {
        clearTimeout(passwordSuccessTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (cancelled || !user) return

      setEmail(user.email ?? '')
      setPhone(typeof user.user_metadata?.phone === 'string' ? user.user_metadata.phone : '')

      const metadata = user.user_metadata || {}

      const googleName = metadata.name || metadata.full_name || ''
      const fName = metadata.first_name || (googleName ? googleName.split(' ')[0] : '')
      const lName = metadata.last_name || (googleName ? googleName.split(' ').slice(1).join(' ') : '')

      setFirstName(String(fName ?? '').trim())
      setLastName(String(lName ?? '').trim())

      setEmailNotif(metadata.email_notifications ?? true)
      setSmsNotif(metadata.sms_alerts ?? false)

      if (metadata.password_updated_at) {
        const date = new Date(metadata.password_updated_at)
        if (!Number.isNaN(date.getTime())) {
          setPasswordLastUpdated(date.toLocaleDateString())
        } else {
          setPasswordLastUpdated('a while ago')
        }
      } else {
        setPasswordLastUpdated('a while ago')
      }
    }

    loadUser()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadRecentBookings() {
      setRecentBookingsLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        if (!cancelled) {
          setRecentBookings([])
          setRecentBookingsLoading(false)
        }
        return
      }

      const primary = await supabase
        .from('bookings')
        .select('id, college_name, tour_date, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(2)

      if (cancelled) return

      let rows = primary.data ?? []
      if (primary.error) {
        const fallback = await supabase
          .from('bookings')
          .select('id, college_name, tour_date, status, created_at')
          .eq('user_id', user.id)
          .order('tour_date', { ascending: false })
          .limit(2)
        if (cancelled) return
        rows = fallback.error ? [] : (fallback.data ?? [])
      }

      setRecentBookings(rows)
      setRecentBookingsLoading(false)
    }

    loadRecentBookings()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="bg-background font-body text-on-surface">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pt-24 pb-20">
        <header className="mb-12">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
            Profile Management
          </h1>
        </header>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-10 lg:col-span-8">
            <section className="ghost-shadow rounded-xl bg-surface-container-lowest p-8">
              <div className="mb-8">
                <h2 className="font-headline text-2xl font-bold text-primary">Personal Information</h2>
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    className="font-label text-xs font-bold tracking-widest text-secondary uppercase"
                    htmlFor="profile-first-name"
                  >
                    First Name
                  </label>
                  <input
                    id="profile-first-name"
                    type="text"
                    autoComplete="given-name"
                    value={firstName || ''}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-surface-container-low text-on-surface w-full rounded-lg border-none px-4 py-3 font-medium focus:ring-2 focus:ring-primary/15 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="font-label text-xs font-bold tracking-widest text-secondary uppercase"
                    htmlFor="profile-last-name"
                  >
                    Last Name
                  </label>
                  <input
                    id="profile-last-name"
                    type="text"
                    autoComplete="family-name"
                    value={lastName || ''}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-surface-container-low text-on-surface w-full rounded-lg border-none px-4 py-3 font-medium focus:ring-2 focus:ring-primary/15 focus:outline-none"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label
                    className="font-label text-xs font-bold tracking-widest text-secondary uppercase"
                    htmlFor="profile-email"
                  >
                    Email Address
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    readOnly
                    autoComplete="email"
                    value={email}
                    className="bg-surface-container-low text-on-surface w-full rounded-lg border-none px-4 py-3 font-medium read-only:cursor-default focus:ring-1 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label
                    className="font-label text-xs font-bold tracking-widest text-secondary uppercase"
                    htmlFor="profile-phone"
                  >
                    Phone Number
                  </label>
                  <input
                    id="profile-phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone || ''}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-surface-container-low text-on-surface w-full rounded-lg border-none px-4 py-3 font-medium focus:ring-2 focus:ring-primary/15 focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="font-headline mt-8 block w-full rounded-lg border border-primary/20 bg-primary py-3 text-center text-sm font-bold text-on-primary shadow-sm transition-all hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Saving…' : 'Save Changes'}
              </button>
            </section>

            <section className="ghost-shadow rounded-xl bg-surface-container-lowest p-8">
              <h2 className="font-headline mb-8 text-2xl font-bold text-primary">Account Settings</h2>
              <div className="space-y-8">
                <div className="flex flex-col gap-4 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary-fixed-dim/20 flex h-12 w-12 items-center justify-center rounded-xl text-primary">
                      <span className="material-symbols-outlined">lock</span>
                    </div>
                    <div>
                      <p className="font-headline font-bold text-primary">Password</p>
                      <p className="text-sm text-secondary">
                        Last updated {passwordLastUpdated}
                      </p>
                    </div>
                  </div>
                  {!isEditingPassword ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingPassword(true)
                        setShowPassword(false)
                      }}
                      className="bg-surface-container-highest text-primary hover:bg-surface-dim shrink-0 self-start rounded-lg px-6 py-2 text-sm font-bold transition-all active:scale-95 sm:self-auto"
                    >
                      Change Password
                    </button>
                  ) : (
                    <div className="flex w-full min-w-0 flex-col gap-3 sm:max-w-2xl sm:flex-row sm:items-center sm:gap-3">
                      <div className="relative min-w-0 flex-1">
                        <input
                          id="profile-new-password"
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          autoComplete="new-password"
                          className="bg-surface-container-low text-on-surface w-full rounded-lg border-none py-3 pr-10 pl-4 font-medium focus:ring-2 focus:ring-primary/15 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-gray-500 hover:bg-surface-container-high hover:text-gray-700"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="h-5 w-5"
                              aria-hidden
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="h-5 w-5"
                              aria-hidden
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={handleChangePassword}
                          className="rounded-lg bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingPassword(false)
                            setNewPassword('')
                            setShowPassword(false)
                          }}
                          className="rounded-lg bg-transparent px-4 py-3 text-sm font-medium text-secondary transition-colors hover:bg-surface-container-high"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
                    passwordSuccessMsg ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                  aria-live="polite"
                >
                  {passwordSuccessMsg ? (
                    <p className="mt-1 text-sm text-green-600">{passwordSuccessMsg}</p>
                  ) : null}
                </div>

                <div className="border-outline-variant/20 border-t pt-8">
                  <h3 className="font-label mb-6 text-xs font-bold tracking-widest text-secondary uppercase">
                    Notification Preferences
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-secondary">mail</span>
                        <p className="font-medium text-on-surface">Email Notifications</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggle('email')}
                        className={`relative h-6 w-12 rounded-full transition-colors ${emailNotif ? 'bg-primary' : 'bg-surface-container-highest'}`}
                        aria-pressed={emailNotif}
                        aria-label="Toggle email notifications"
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${emailNotif ? 'right-1' : 'left-1'}`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-secondary">sms</span>
                        <p className="font-medium text-on-surface">SMS Alerts</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggle('sms')}
                        className={`relative h-6 w-12 rounded-full transition-colors ${smsNotif ? 'bg-primary' : 'bg-surface-container-highest'}`}
                        aria-pressed={smsNotif}
                        aria-label="Toggle SMS alerts"
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${smsNotif ? 'right-1' : 'left-1'}`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <section className="ghost-shadow text-on-primary relative overflow-hidden rounded-xl bg-primary p-8">
              <div className="relative z-10">
                <div className="mb-6 flex items-center gap-2">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    calendar_month
                  </span>
                  <h2 className="font-headline text-xl font-bold">Recent Bookings</h2>
                </div>
                {recentBookingsLoading ? (
                  <RecentBookingsSkeleton />
                ) : recentBookings.length === 0 ? (
                  <p className="text-on-primary-container text-sm leading-relaxed">
                    No recent bookings found.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {recentBookings.map((booking, index) => {
                      const badge = getBookingStatusBadge(booking.status)
                      return (
                        <Link
                          key={booking.id}
                          to="/bookings"
                          className={`group block cursor-pointer ${index > 0 ? 'opacity-80' : ''}`}
                        >
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <h3 className="font-headline text-lg leading-tight font-bold transition-colors group-hover:text-primary-fixed-dim">
                              {booking.college_name ?? 'Campus tour'}
                            </h3>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-tighter uppercase ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                          </div>
                          <div className="text-on-primary-container flex items-center gap-2 text-sm">
                            <span className="material-symbols-outlined text-sm">event</span>
                            <span>{formatBookingDateLabel(booking.tour_date)}</span>
                          </div>
                          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                            <span className="text-xs opacity-70">
                              Booking ID: {formatBookingIdDisplay(booking.id)}
                            </span>
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
                <Link
                  to="/bookings"
                  className="mt-8 block w-full rounded-lg border border-white/10 bg-white/10 py-3 text-center text-sm font-bold transition-all hover:bg-white/20"
                >
                  View All Bookings
                </Link>
              </div>
              <div className="bg-primary-fixed-dim/10 absolute -right-10 -bottom-10 h-40 w-40 rounded-full blur-3xl" />
            </section>

            <section className="bg-surface-container-high rounded-xl p-8">
              <h3 className="font-headline mb-2 font-bold text-primary">Need Assistance?</h3>
              <p className="mb-6 text-sm text-secondary">
                Our concierge team is available for Scholar Track members 24/7.
              </p>
              <Link
                to="/contact"
                className="text-primary flex items-center gap-2 text-sm font-bold underline underline-offset-4"
              >
                Contact Support
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </Link>
            </section>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-8 py-12 md:flex-row">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <span className="font-headline text-lg font-semibold text-blue-900 dark:text-blue-100">
              The Academic Curator
            </span>
            <p className="font-body text-sm text-slate-600 dark:text-slate-400">
              © 2024 The Academic Curator. All academic rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a
              className="font-body text-sm text-slate-500 underline underline-offset-4 transition-opacity duration-300 hover:text-blue-700 dark:text-slate-500 dark:hover:text-blue-300"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="font-body text-sm text-slate-500 underline underline-offset-4 transition-opacity duration-300 hover:text-blue-700 dark:text-slate-500 dark:hover:text-blue-300"
              href="#"
            >
              Terms of Service
            </a>
            <a
              className="font-body text-sm text-slate-500 underline underline-offset-4 transition-opacity duration-300 hover:text-blue-700 dark:text-slate-500 dark:hover:text-blue-300"
              href="#"
            >
              Campus Safety
            </a>
            <Link
              to="/contact"
              className="font-body text-sm text-slate-500 underline underline-offset-4 transition-opacity duration-300 hover:text-blue-700 dark:text-slate-500 dark:hover:text-blue-300"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
