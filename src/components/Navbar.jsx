import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { NavAuthSection } from './NavAuthSection.jsx'

/**
 * Global pill nav.
 */
export default function Navbar() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false
    return location.pathname.startsWith(path)
  }

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore Tours', path: '/explore' },
    { name: 'Ambassadors', path: '/ambassadors' },
    { name: 'About Us', path: '/about' },
  ]

  return (
    <div className="fixed top-6 right-0 left-0 z-50 flex justify-center px-4">
      <nav className="glass-nav premium-nav-shadow w-full max-w-6xl rounded-full border border-white/40 bg-white/70 px-6 py-3 sm:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center">
            <Link
              to="/"
              className="text-sm font-extrabold tracking-tighter whitespace-nowrap text-[#002045] sm:text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              The Academic Curator
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={
                  isActive(link.path)
                    ? "relative text-sm font-bold text-[#002045] after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-[#735C00] after:content-['']"
                    : "text-sm font-semibold text-[#545F72] transition-colors hover:text-[#002045]"
                }
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <NavAuthSection variant="dual" />
            
            {/* Mobile menu button */}
            <button
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-full text-primary hover:bg-surface-container"
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
        <div className="absolute top-20 left-4 right-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-xl p-4 flex flex-col gap-2 md:hidden">
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
        </div>
      )}
    </div>
  )
}
