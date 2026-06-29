import { Link } from 'react-router-dom'
import { NavAuthSection } from '../components/NavAuthSection.jsx'

export default function College() {
  return (
    <div className="selection:bg-tertiary-container selection:text-on-tertiary-container bg-background font-body text-on-background">
      <div className="fixed top-6 right-0 left-0 z-50 flex justify-center px-4">
        <nav className="glass-nav premium-nav-shadow w-full max-w-6xl rounded-full border border-white/40 bg-white/70 px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center">
              <Link
                to="/"
                className="text-lg font-extrabold tracking-tighter whitespace-nowrap text-[#002045]"
              >
                The Academic Curator
              </Link>
            </div>
            <div className="hidden items-center gap-8 md:flex">
              <Link
                to="/"
                className="text-sm font-semibold text-[#545F72] transition-colors hover:text-[#002045]"
              >
                Home
              </Link>
              <Link
                to="/explore"
                className="relative text-sm font-bold text-[#002045] after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-[#735C00] after:content-['']"
              >
                Explore Tours
              </Link>
              <a
                className="text-sm font-semibold text-[#545F72] transition-colors hover:text-[#002045]"
                href="#"
              >
                Ambassadors
              </a>
              <Link
                to="/about"
                className="text-sm font-semibold text-[#545F72] transition-colors hover:text-[#002045]"
              >
                About Us
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <NavAuthSection variant="dual" />
            </div>
          </div>
        </nav>
      </div>

      <main className="pt-0">
        <section className="relative h-[716px] w-full overflow-hidden">
          <img
            alt="Stately brick facade of Harvard Memorial Hall with gothic architecture details under a clear blue academic sky"
            className="h-full w-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuClVLI7CZDoWgn3-LoUxbNb-1L0tO4TA-F-9pRmAKJVzSv_QcPXyKTgF30mAQ8ZaWQzh2Btjzi4R6kGlRgenPxri37EyZj3bA1eJEBkeOVrlw5UwJKiWc2jo8PSrJrll6Cuf07AH7L3povvwTRUx_5mCGMSj1rQV73AoAfDM3rCyPbAnfZGgLcJfnlBLxtOzbO7tMkYE_eD04uBx8RM53m1MZWfvcFvphSUDrut6lvvR2Ur3heOJEzs5eir_9GIWumikAvQ1ExdUWnR"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
          <div className="absolute bottom-0 left-0 mx-auto flex w-full max-w-7xl flex-col items-start p-8 text-on-primary md:p-16">
            <div className="font-label mb-6 flex items-center gap-2 text-sm tracking-widest uppercase opacity-80">
              <span>Cambridge, MA</span>
              <span className="material-symbols-outlined text-[10px]">fiber_manual_record</span>
              <span>Ivy League Series</span>
            </div>
            <h1 className="font-headline mb-6 text-4xl leading-none font-extrabold tracking-tighter md:text-7xl">
              Harvard University
              <br />
              Residency Tour
            </h1>
            <div className="font-headline flex flex-wrap gap-8 text-lg font-bold md:text-xl">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-tertiary-fixed">calendar_today</span>
                <span>October 24, 2024</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-tertiary-fixed">schedule</span>
                <span>10:00 AM - 1:00 PM EST</span>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-8 py-16 lg:grid-cols-12">
          <div className="space-y-16 lg:col-span-8">
            <section>
              <h2 className="font-headline mb-8 text-2xl font-extrabold tracking-tight text-primary">
                Tour Highlights
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="group rounded-xl border-l-4 border-tertiary bg-surface-container-low p-8 transition-all duration-300 hover:bg-surface-container-lowest">
                  <span className="material-symbols-outlined mb-4 block text-3xl text-primary">
                    menu_book
                  </span>
                  <h3 className="font-headline mb-2 text-lg font-bold text-primary">Library Access</h3>
                  <p className="text-sm leading-relaxed text-secondary">
                    Exclusive entry into restricted research wings and the historic stacks.
                  </p>
                </div>
                <div className="group rounded-xl border-l-4 border-tertiary bg-surface-container-low p-8 transition-all duration-300 hover:bg-surface-container-lowest">
                  <span className="material-symbols-outlined mb-4 block text-3xl text-primary">bed</span>
                  <h3 className="font-headline mb-2 text-lg font-bold text-primary">Dormitory Visit</h3>
                  <p className="text-sm leading-relaxed text-secondary">
                    Walk through freshman housing in the Yard, seeing the architectural heritage.
                  </p>
                </div>
                <div className="group rounded-xl border-l-4 border-tertiary bg-surface-container-low p-8 transition-all duration-300 hover:bg-surface-container-lowest">
                  <span className="material-symbols-outlined mb-4 block text-3xl text-primary">
                    restaurant
                  </span>
                  <h3 className="font-headline mb-2 text-lg font-bold text-primary">Dining Experience</h3>
                  <p className="text-sm leading-relaxed text-secondary">
                    Lunch at Annenberg Hall, experiencing the iconic communal atmosphere.
                  </p>
                </div>
              </div>
            </section>

            <section className="max-w-none">
              <h2 className="font-headline mb-8 text-3xl font-extrabold tracking-tight text-primary">
                A Scholarly Journey
              </h2>
              <div className="font-body space-y-6 text-lg leading-relaxed text-on-surface-variant">
                <p>
                  Our residency tour begins at the legendary{' '}
                  <span className="font-semibold text-primary">John Harvard Statue</span>, where we
                  unravel the myths and realities of the university&apos;s founding. Unlike standard
                  public tours, we move beyond the gate to explore the intellectual heartbeat of the
                  campus.
                </p>
                <div className="relative my-12 border-l-2 border-outline-variant pl-8">
                  <p className="text-xl font-medium italic text-primary">
                    &quot;The air here is thick with history, but the focus is entirely on the
                    future. This tour bridges that gap.&quot;
                  </p>
                </div>
                <p>
                  We proceed to the{' '}
                  <span className="font-semibold text-primary">Widener Library</span>, the crown
                  jewel of the world&apos;s largest academic library system. Here, participants gain
                  insight into the rigorous research culture that defines the Harvard experience. The
                  morning concludes with a private walkthrough of the{' '}
                  <span className="font-semibold text-primary">Faculty Club</span>, offering a glimpse
                  into the elite social fabric of the university&apos;s brightest minds.
                </p>
              </div>
            </section>

            <section className="flex flex-col overflow-hidden rounded-xl bg-primary text-on-primary shadow-xl md:flex-row">
              <div className="md:w-1/3">
                <img
                  alt="Portrait of Dr. Julian Vance, a professional academic in a navy blazer standing in front of a classical library background"
                  className="h-full w-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVsjFJ7DUs2DQ3v_OAR65AmNgECYW1uS-3hgCJBjH2Tlvh5QnJADQ0WULcItrCGywL5lbJOc_M3Pw9f6BesIsbFEfc0qGHY95PIDJRtTpCPmc-bGSflNDsLzljI8ZWHTHM2vaDB5MMk-pVU4MLqsCY6-y9m7u9Lvsij540hBxfBbcg_1xiO_UrZTSrXRcdU0qqxauDAJM-oXquWln2k2NuLDENb-tFg7w10e6M4dSdfEt83lTWR-PjYVAspJvZKefYHF2b-9x-2gDP"
                />
              </div>
              <div className="flex flex-col justify-center p-8 md:w-2/3 md:p-12">
                <span className="font-label mb-2 text-xs font-bold tracking-widest text-tertiary-fixed uppercase">
                  Your Academic Lead
                </span>
                <h3 className="font-headline mb-4 text-3xl font-extrabold">Dr. Julian Vance</h3>
                <p className="mb-6 text-lg leading-relaxed text-primary-fixed-dim italic">
                  &quot;Welcome to the yard. My goal is to show you not just where students live,
                  but how they think, lead, and evolve within these historic walls.&quot;
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="rounded-full bg-white/10 px-4 py-1 font-label text-xs">
                    PH.D. ARCHITECTURAL HISTORY
                  </span>
                  <span className="rounded-full bg-white/10 px-4 py-1 font-label text-xs">
                    12 YEARS RESIDENCY
                  </span>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-8 lg:col-span-4">
            <div className="sticky top-28 space-y-6 rounded-xl bg-surface-container-high p-8">
              <div className="flex items-end justify-between">
                <div>
                  <span className="font-label mb-1 block text-sm uppercase tracking-wider text-secondary">
                    Price per person
                  </span>
                  <span className="font-headline text-3xl font-extrabold text-primary">$149.00</span>
                </div>
                <span className="font-label flex items-center gap-1 rounded-full bg-tertiary-container px-3 py-1 text-xs font-bold text-on-tertiary-container">
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  3 Slots Left
                </span>
              </div>
              <div className="space-y-4 border-t border-outline-variant pt-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-white p-2 shadow-sm">
                    <span className="material-symbols-outlined text-primary">groups</span>
                  </div>
                  <div>
                    <span className="font-label block text-xs uppercase text-secondary">
                      Group Size
                    </span>
                    <span className="font-bold text-primary">Small (Max 8)</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-white p-2 shadow-sm">
                    <span className="material-symbols-outlined text-primary">directions_walk</span>
                  </div>
                  <div>
                    <span className="font-label block text-xs uppercase text-secondary">
                      Activity Level
                    </span>
                    <span className="font-bold text-primary">Moderate</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-white p-2 shadow-sm">
                    <span className="material-symbols-outlined text-primary">accessible</span>
                  </div>
                  <div>
                    <span className="font-label block text-xs uppercase text-secondary">
                      Accessibility
                    </span>
                    <span className="font-bold text-primary">Fully Accessible</span>
                  </div>
                </div>
              </div>
              <Link
                to="/book-tour"
                className="font-headline block w-full rounded-full bg-primary py-4 text-center text-lg font-extrabold text-on-primary shadow-lg transition-all hover:shadow-primary/20 active:scale-95"
              >
                Book This Tour
              </Link>
              <p className="text-center text-xs font-medium text-secondary">
                Free cancellation up to 48 hours before.
              </p>
            </div>

            <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-6">
              <h4 className="font-headline mb-4 font-bold text-primary">Recommended for you</h4>
              <div className="space-y-4">
                <Link
                  to="/college"
                  className="group flex cursor-pointer items-center gap-4"
                >
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                    <img
                      alt="Close up of old brick university building with ivy"
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJn2RYNFlh7o5sFYp8XxpS7UjwhbEDc6-u0XcVaaf_KNleOZ1FWsdOqSPkqD2uv2e-CSyqBliVQfjvSc-IoXOTPnNEFvPpmXkr-Wh_vfIMBXWOby4Bn63fMUmoKU_YQFBOaTtrRnLPyNfmQZj0q1tyOPhniEZCwD8LJES2WcFIYPW-QEh0hPWOifclTy50FU82EJrBBPYlKZDomEySkMlabOZ8fbh7pSLoACDmcfS5C15oLLFOmQVuMmeGNJPuTcnIGg_4F9UpQV4P"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-tertiary uppercase">IVY SERIES</span>
                    <h5 className="text-sm leading-tight font-bold text-primary">
                      Yale Campus Secrets Tour
                    </h5>
                  </div>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="mt-12 w-full border-t border-slate-200/90 bg-[#F8FAFF] px-8 py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link
              to="/"
              className="font-headline text-lg font-bold text-[#002045]"
            >
              The Academic Curator
            </Link>
            <p className="text-sm leading-relaxed text-[#5c6578]">
              Defining the prestigious academic journey through immersive curations and insider
              access.
            </p>
          </div>
          <div>
            <h4 className="font-headline mb-4 font-bold text-[#002045]">Explore</h4>
            <ul className="space-y-2">
              <li>
                <a
                  className="text-sm text-[#5c6578] underline-offset-4 transition-colors hover:text-[#002045] hover:underline"
                  href="#"
                >
                  Tour Destinations
                </a>
              </li>
              <li>
                <a
                  className="text-sm text-[#5c6578] underline-offset-4 transition-colors hover:text-[#002045] hover:underline"
                  href="#"
                >
                  Campus Partners
                </a>
              </li>
              <li>
                <a
                  className="text-sm text-[#5c6578] underline-offset-4 transition-colors hover:text-[#002045] hover:underline"
                  href="#"
                >
                  Curator Application
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline mb-4 font-bold text-[#002045]">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-[#5c6578] underline-offset-4 transition-colors hover:text-[#002045] hover:underline"
                >
                  Contact Support
                </Link>
              </li>
              <li>
                <a
                  className="text-sm text-[#5c6578] underline-offset-4 transition-colors hover:text-[#002045] hover:underline"
                  href="#"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  className="text-sm text-[#5c6578] underline-offset-4 transition-colors hover:text-[#002045] hover:underline"
                  href="#"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline mb-4 font-bold text-[#002045]">Newsletter</h4>
            <div className="flex gap-2">
              <input
                className="w-full rounded-lg border border-slate-200/90 bg-white px-3 py-2 text-sm text-[#002045] shadow-sm placeholder:text-slate-400 focus:border-[#002045] focus:ring-1 focus:ring-[#002045] focus:outline-none"
                placeholder="Your email"
                type="email"
              />
              <button
                type="button"
                className="shrink-0 rounded-lg bg-[#002045] p-2.5 text-white shadow-sm transition-opacity hover:opacity-90"
                aria-label="Subscribe"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-slate-200/90 pt-8 md:flex-row">
          <span className="font-inter text-sm tracking-normal text-slate-500">
            © 2024 The Academic Curator. All rights reserved.
          </span>
          <div className="flex gap-6 text-slate-500">
            <span className="material-symbols-outlined">public</span>
            <span className="material-symbols-outlined">share</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
