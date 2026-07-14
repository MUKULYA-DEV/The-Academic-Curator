import { Link } from 'react-router-dom'
import { NavAuthSection } from './NavAuthSection.jsx'

/**
 * Global pill nav (same as Home). Optional `active` highlights the current route in the main links.
 * @param {'home' | 'explore' | 'about' | undefined} [active]
 */
export default function Navbar({ active }) {
  return (
    <div className="fixed top-6 right-0 left-0 z-50 flex justify-center px-4">
      <nav className="glass-nav premium-nav-shadow w-full max-w-6xl rounded-full border border-white/40 bg-white/70 px-8 py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center">
            <Link
              to="/"
              className="text-sm font-extrabold tracking-tighter whitespace-nowrap text-[#002045] sm:text-lg"
            >
              The Academic Curator
            </Link>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            {active === 'home' ? (
              <Link
                to="/"
                className="relative text-sm font-bold text-[#002045] after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-[#735C00] after:content-['']"
              >
                Home
              </Link>
            ) : (
              <Link
                to="/"
                className="text-sm font-semibold text-[#545F72] transition-colors hover:text-[#002045]"
              >
                Home
              </Link>
            )}
            {active === 'explore' ? (
              <Link
                to="/explore"
                className="relative text-sm font-bold text-[#002045] after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-[#735C00] after:content-['']"
              >
                Explore Tours
              </Link>
            ) : (
              <Link
                to="/explore"
                className="text-sm font-semibold text-[#545F72] transition-colors hover:text-[#002045]"
              >
                Explore Tours
              </Link>
            )}
            <a
              className="text-sm font-semibold text-[#545F72] transition-colors hover:text-[#002045]"
              href="#"
            >
              Ambassadors
            </a>
            {active === 'about' ? (
              <Link
                to="/about"
                className="relative text-sm font-bold text-[#002045] after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-[#735C00] after:content-['']"
              >
                About Us
              </Link>
            ) : (
              <Link
                to="/about"
                className="text-sm font-semibold text-[#545F72] transition-colors hover:text-[#002045]"
              >
                About Us
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3">
            <NavAuthSection variant="dual" />
          </div>
        </div>
      </nav>
    </div>
  )
}
