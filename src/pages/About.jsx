import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'

export default function About() {
  return (
    <div className="selection:bg-primary-fixed selection:text-on-primary-fixed bg-surface font-body text-on-surface">
      <Navbar active="about" />

      <main className="pt-32">
        <section className="mx-auto mb-24 max-w-7xl px-8">
          <div className="relative flex flex-col items-center gap-12 overflow-hidden rounded-xl bg-primary-container p-12 md:flex-row md:p-24">
            <div className="z-10 md:w-3/5">
              <span className="mb-6 inline-block rounded-full bg-tertiary px-4 py-1.5 text-xs font-bold tracking-widest text-on-tertiary uppercase">
                EST. 2024
              </span>
              <h1 className="font-headline mb-8 text-4xl leading-tight font-extrabold tracking-tight text-white md:text-7xl">
                The Academic <br />
                Curator
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-primary-fixed-dim md:text-xl">
                Our mission is to curate the world&apos;s most prestigious campus
                experiences, transforming university discovery into an immersive,
                elite journey.
              </p>
            </div>
            <div className="relative flex justify-center md:w-2/5">
              <div className="aspect-square w-full rotate-3 transform overflow-hidden rounded-xl shadow-2xl">
                <img
                  alt="Stunning modern glass and brick university architecture reflecting a blue sky with soft afternoon sunlight"
                  className="h-full w-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIGA7j-AYHn50eF4-Syed-DlhNWJZcAe2iTY5ueWqwXi4Wato-W0lJx1q3dAThsCMHGgkWB4XmuSm8kY9yq-8RakgH2J1-H1dRo0Np_KXqpiBkelZ8ecIVYDyu9AdIgEHsKvSy-II1Ji1ZWZYOB3zVOo9j5VU2lDzFm9iq75DH7vrt2gFAUSohl7GKJrsqOFjBgS35TutGUusYgyIFWGdW8GqhZpSNbFNBaNLWcbhgH7CDJQd3oLFIo6nkO4aTDw_AT_C-WaOwdzDw"
                />
              </div>
            </div>
            <div className="pointer-events-none absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-white/5 to-transparent" />
          </div>
        </section>

        <section className="mx-auto mb-32 max-w-4xl px-8 text-center">
          <h2 className="font-headline mb-10 text-3xl font-extrabold tracking-tight text-primary md:text-5xl">
            Bridging Potential and Prestige
          </h2>
          <div className="space-y-6 text-lg leading-relaxed text-secondary">
            <p>
              We believe that choosing a university is not just a decision; it is
              the beginning of a lifelong legacy. Standard tours often fail to capture
              the soul of an institution—the hidden libraries, the whispers of
              history in the quadrangles, and the vibrant pulse of contemporary
              student life.
            </p>
            <p>
              The Academic Curator serves as the bridge between prospective students
              and their future alma maters. We hand-select Ambassadors who embody
              excellence, ensuring that every interaction is as prestigious as the
              institutions themselves.
            </p>
          </div>
        </section>

        <section className="mx-auto mb-32 max-w-7xl px-8">
          <div className="mb-16 text-center">
            <h2 className="font-headline text-3xl font-extrabold tracking-tight text-primary md:text-5xl">
              The Founding Curators
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-secondary">
              Visionaries dedicated to redefining the path to higher education.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <div className="group">
              <div className="relative mb-6 aspect-[4/5] overflow-hidden rounded-xl bg-surface-container-high shadow-[0px_12px_32px_rgba(24,28,30,0.06)]">
                <img
                  alt="High quality professional headshot of a female academic leader"
                  className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjpI7H9mNTECI0Jk-MRxY3FVteAEdgOOX6V57GC7gn7QXhZ4labTY9kLJDBkSMU0l6J_G57qZucPVchNWKkU2winyMlg9Y6YehekLx9BDPWWavAGB1dsohfbcvT5X6dGKZ8lvHruWtPlDHVV5Zi7GyYLoeLTPxjI52qNn3DkXc2vxp6wY1OudaRTNGNx41q_ytXdqQsEMQSWAoN6mpaPTgWS3kxsQmti3VzeFxtjPp88O__j9REURlHBM3H2EWNWvzqYN4ZyNdN9jQ"
                />
                <div className="absolute top-4 right-4 rounded-full bg-tertiary-container/90 px-3 py-1 text-[10px] font-bold tracking-widest text-on-tertiary-container uppercase backdrop-blur">
                  Founding Member
                </div>
              </div>
              <h3 className="font-headline text-xl font-bold text-primary">Dr. Eleanor Vance</h3>
              <p className="mb-3 text-sm font-semibold tracking-wider text-tertiary uppercase">
                Head of Curation
              </p>
              <p className="text-sm leading-relaxed text-secondary">
                Oxford Alumna with a passion for architectural history and the
                sociology of elite education.
              </p>
            </div>

            <div className="group">
              <div className="relative mb-6 aspect-[4/5] overflow-hidden rounded-xl bg-surface-container-high shadow-[0px_12px_32px_rgba(24,28,30,0.06)]">
                <img
                  alt="Vibrant professional portrait of a male admissions expert"
                  className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqeuAxA06BquneUoU930Ds1Ow8u7g1id-ZEeFubEv_VcjbP-qgCOIa950M-BMLWiK7M1OK3fBRw_simBr9uuLO30aqE_GW2-NrqcjZkFLAohvejrAby4ivJ5X9WoMxUrII4n4tws98pv3C7BqjsIrlF1MB68_i6umz278t4M-UFELqNCWtHoHXUPU3ZmL8I2m40V0lggrVO6DO_Z7vY8FCv6t6H-ORRhxACh9xbE2pscfRxG03alZcJ4UBRu9oA_0DEzPxyVZ14IVu"
                />
              </div>
              <h3 className="font-headline text-xl font-bold text-primary">Julian Thorne</h3>
              <p className="mb-3 text-sm font-semibold tracking-wider text-tertiary uppercase">
                Director of Partnerships
              </p>
              <p className="text-sm leading-relaxed text-secondary">
                Former Admissions Director at Stanford, Julian bridges the gap
                between institutional policy and student needs.
              </p>
            </div>

            <div className="group">
              <div className="relative mb-6 aspect-[4/5] overflow-hidden rounded-xl bg-surface-container-high shadow-[0px_12px_32px_rgba(24,28,30,0.06)]">
                <img
                  alt="Cheerful colorful portrait of a lead student ambassador"
                  className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuHOke-NQ8ak3uCtbY_LY_bI8H1-aeOdYYC0Q8O_kQetVJEvHD-o7UA71qF8KtPk12RWrFcN4-hstHbbBUAf3CYGC8xBA2WxnwuS2YhKb-6h3b59q_hGph-2kABFTMT1Si_akKm1OL7bnLHu_I0-Rgp1jyh17BQk78DbKNwJCIf-FBBVWrdtti-hVTzBzDqQCOTSc4F2MiaddZqv5XB2f8RoMkdyoUjktI3wDh_sFwXD9Wfam06sUKxvFMOiCgRMNvN-U7S6Ovs2Qr"
                />
                <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-[10px] font-bold text-primary">Lead Ambassador</span>
                </div>
              </div>
              <h3 className="font-headline text-xl font-bold text-primary">Amara Okafor</h3>
              <p className="mb-3 text-sm font-semibold tracking-wider text-tertiary uppercase">
                Global Community Lead
              </p>
              <p className="text-sm leading-relaxed text-secondary">
                Pioneered the &apos;Legacy Walk&apos; program, connecting current
                world-class researchers with prospective talent.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-8 pb-32">
          <div className="relative overflow-hidden rounded-xl bg-primary p-12 text-center md:p-20">
            <div className="relative z-10">
              <h2 className="font-headline mb-6 text-3xl font-extrabold tracking-tight text-white md:text-5xl">
                Join the Journey
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-fixed-dim">
                Whether you are a prospective scholar looking for your home or an
                ambassador ready to lead, your academic story starts here.
              </p>
              <div className="flex flex-col justify-center gap-4 md:flex-row">
                <Link
                  to="/login"
                  className="rounded-xl bg-white px-10 py-4 font-bold text-primary transition-colors hover:bg-primary-fixed-dim"
                >
                  Book a Tour
                </Link>
                <button
                  type="button"
                  className="rounded-xl border border-white/20 bg-primary-container px-10 py-4 font-bold text-white transition-colors hover:bg-white/10"
                >
                  Become an Ambassador
                </button>
              </div>
            </div>
            <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-tertiary/20 blur-3xl" />
            <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
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
