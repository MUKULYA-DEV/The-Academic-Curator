import { useEffect, useState } from 'react'
import { motion, MotionConfig } from 'motion/react'
import { Link, useLocation } from 'react-router-dom'
import { NavAuthSection } from './NavAuthSection.jsx'

const MotionSpan = motion.span
const MotionDiv = motion.div
const SPRING = { type: 'spring', stiffness: 420, damping: 34 }

// The name folds down to its initials, "TAC", once the page is scrolled.
const LOGO_PARTS = [
  ['T', 'he '],
  ['A', 'cademic '],
  ['C', 'urator'],
]

/**
 * Global pill nav. Full width at the top of a page; on scroll it tightens into a
 * smaller pill and the name folds to its initials. A soft highlight follows the
 * pointer across the links and the gold underline slides between pages.
 */
export default function Navbar() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    // Two thresholds so the pill does not flicker when the page sits near the top.
    const onScroll = () => setScrolled((was) => (was ? window.scrollY > 24 : window.scrollY > 72))
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const compact = scrolled && !mobileMenuOpen

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false
    return location.pathname.startsWith(path)
  }

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore Tours', path: '/explore' },
    { name: 'Find College', path: '/find' },
    { name: 'Scorecard', path: '/scorecard' },
    { name: 'Ambassadors', path: '/ambassadors' },
    { name: 'About Us', path: '/about' },
  ]

  return (
    <MotionConfig reducedMotion="user">
    <div
      className={`fixed right-0 left-0 z-50 flex justify-center px-4 transition-[top] duration-500 ease-out ${
        compact ? 'top-3' : 'top-6'
      }`}
    >
      <nav
        className={`glass-nav premium-nav-shadow w-full rounded-full border border-white/40 transition-[max-width,padding,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          compact
            ? 'max-w-[58rem] bg-white/85 px-4 py-2 sm:px-5'
            : 'max-w-6xl bg-white/70 px-6 py-3 sm:px-8'
        }`}
      >
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center">
            <Link
              to="/"
              aria-label="The Academic Curator, home"
              className="text-sm font-extrabold tracking-tighter whitespace-pre text-[#002045] sm:text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span aria-hidden="true" className="flex">
                {LOGO_PARTS.map(([initial, rest]) => (
                  <span key={initial} className="flex">
                    {initial}
                    <span
                      className={`inline-block overflow-hidden transition-[max-width,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        compact ? 'max-w-0 opacity-0' : 'max-w-[6rem] opacity-100'
                      }`}
                    >
                      {rest}
                    </span>
                  </span>
                ))}
              </span>
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <div
            className="hidden items-center whitespace-nowrap lg:flex xl:gap-1"
            onMouseLeave={() => setHovered(null)}
          >
            {navLinks.map((link) => {
              const active = isActive(link.path)
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onMouseEnter={() => setHovered(link.path)}
                  onFocus={() => setHovered(link.path)}
                  onBlur={() => setHovered(null)}
                  className={`relative rounded-full px-2 py-1.5 text-sm transition-colors xl:px-3.5 ${
                    active ? 'font-bold text-[#002045]' : 'font-semibold text-[#545F72] hover:text-[#002045]'
                  }`}
                >
                  {hovered === link.path && (
                    <MotionSpan
                      layoutId="nav-hover"
                      transition={SPRING}
                      className="absolute inset-0 rounded-full bg-[#002045]/[0.07]"
                    />
                  )}
                  <span className="relative">{link.name}</span>
                  {active && (
                    <MotionSpan
                      layoutId="nav-active"
                      transition={SPRING}
                      className="absolute right-2 -bottom-0.5 left-2 h-0.5 rounded-full bg-[#735C00] xl:right-3.5 xl:left-3.5"
                    />
                  )}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <NavAuthSection variant="dual" />
            
            {/* Mobile menu button */}
            <button
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full text-primary hover:bg-surface-container"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <span className="material-symbols-outlined">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <MotionDiv
          initial={{ opacity: 0, y: -12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-20 left-4 right-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-xl p-4 flex flex-col gap-2 lg:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`p-3 rounded-xl text-center text-sm font-bold ${
                isActive(link.path)
                  ? 'bg-primary/10 text-primary'
                  : 'text-secondary hover:bg-surface-container'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </MotionDiv>
      )}
    </div>
    </MotionConfig>
  )
}
