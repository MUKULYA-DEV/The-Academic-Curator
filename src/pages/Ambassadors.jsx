import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'

export default function Ambassadors() {
  return (
    <div className="selection:bg-primary-fixed selection:text-on-primary-fixed bg-surface font-body text-on-surface">
      <Navbar active="ambassadors" />

      <main className="pt-32 min-h-[70vh] flex flex-col justify-center items-center">
        <section className="mx-auto mb-24 max-w-7xl px-8 w-full">
          <div className="relative flex flex-col items-center gap-12 overflow-hidden rounded-[2rem] bg-primary-container p-16 md:p-24 text-center">
            <div className="z-10 max-w-2xl mx-auto">
              <span className="mb-6 inline-block rounded-full bg-tertiary px-4 py-1.5 text-xs font-bold tracking-widest text-on-tertiary uppercase animate-pulse">
                Launching Soon
              </span>
              <h1 className="font-headline mb-8 text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Meet Our prestigous Ambassadors
              </h1>
              <p className="max-w-xl mx-auto text-lg leading-relaxed text-primary-fixed-dim md:text-xl">
                We are carefully hand-selecting and onboarding elite student guides from the world's top institutions. Check back soon to connect with leaders who will guide your academic journey.
              </p>
              <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/"
                  className="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-primary transition-all duration-200 hover:bg-primary-fixed-dim active:scale-95 shadow-md"
                >
                  Return Home
                </Link>
                <Link
                  to="/explore"
                  className="rounded-full border border-white/20 bg-primary-container px-8 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:bg-white/10 active:scale-95"
                >
                  Explore Campus Tours
                </Link>
              </div>
            </div>
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-tertiary/20 blur-3xl" />
            <div className="pointer-events-none absolute -top-20 -left-20 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />
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
              © 2024 The Academic Curator. Excellence in Campus Discovery.
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
    </div>
  )
}
