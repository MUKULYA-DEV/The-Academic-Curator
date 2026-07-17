import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

/** Get initials from first name and last name, fallback to email local part first letter. */
function getInitials(user) {
  if (!user) return '?'
  const metadata = user.user_metadata || {}
  const googleName = metadata.name || metadata.full_name || ''
  
  const fName = (metadata.first_name || (googleName ? googleName.split(' ')[0] : '')).trim()
  const lName = (metadata.last_name || (googleName ? googleName.split(' ').slice(1).join(' ') : '')).trim()

  if (fName && lName) {
    return (fName[0] + lName[0]).toUpperCase()
  } else if (fName) {
    return fName[0].toUpperCase()
  } else if (lName) {
    return lName[0].toUpperCase()
  }

  const email = user.email
  if (!email || typeof email !== 'string') return '?'
  const local = email.split('@')[0]?.trim() ?? ''
  const ch = local[0] ?? email.trim()[0]
  return ch ? ch.toUpperCase() : '?'
}

export function UserAvatarMenu({ className = '' }) {
  const { session, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initial = getInitials(session?.user)

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary shadow-md transition-all hover:opacity-90 active:scale-95 md:h-10 md:w-10 md:text-base"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        {initial}
      </button>
      {open && (
        <div
          className="absolute right-0 z-[60] mt-2 min-w-[160px] rounded-xl border border-outline-variant/30 bg-surface-container-lowest py-1 shadow-lg"
          role="menu"
        >
          <Link
            to="/profile"
            role="menuitem"
            className="block px-4 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>
          <Link
            to="/bookings"
            role="menuitem"
            className="block px-4 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
            onClick={() => setOpen(false)}
          >
            My Bookings
          </Link>
          <button
            type="button"
            role="menuitem"
            className="w-full px-4 py-2.5 text-left text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
            onClick={async () => {
              await signOut()
              setOpen(false)
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * @param {'dual' | 'cta'} variant — `dual`: Login + Sign Up; `cta`: Explore-style “Book a Tour”
 */
export function NavAuthSection({ variant = 'dual' }) {
  const { session } = useAuth()

  if (session) {
    return <UserAvatarMenu />
  }

  if (variant === 'cta') {
    return (
      <Link
        to="/login"
        className="font-headline whitespace-nowrap rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-on-primary transition-all duration-200 active:scale-95 sm:px-5 sm:py-2 sm:text-sm"
      >
        Book a Tour
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      <Link
        to="/login"
        className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold text-[#545F72] transition-all hover:bg-white/50 active:scale-95 sm:px-5 sm:py-2 sm:text-sm"
      >
        Login
      </Link>
      <Link
        to="/login?tab=signup"
        className="whitespace-nowrap rounded-full bg-[#002045] px-4 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:opacity-95 hover:shadow-lg active:scale-95 sm:px-6 sm:py-2 sm:text-sm"
      >
        Sign Up
      </Link>
    </div>
  )
}

