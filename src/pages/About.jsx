import { Link } from 'react-router-dom'
import SEO from '../components/SEO.jsx'

const PROMISES = [
  {
    icon: 'school',
    title: 'Guided by current students',
    body: 'Your guide studies at the college you are visiting. They know which labs are used, what the hostel is like in winter and how placements went last year.',
  },
  {
    icon: 'family_restroom',
    title: 'Built for families',
    body: 'Parents are welcome on every tour. Bring your questions about fees, safety, food and travel, and get answers on the spot.',
  },
  {
    icon: 'handshake',
    title: 'Clear about how we earn',
    body: 'We work with partner colleges. When a student takes admission through us, the college pays us a fee. It never adds to what you pay the college.',
  },
]

export default function About() {
  return (
    <>
      <SEO
        title="About us"
        description="The Academic Curator runs student-led campus tours of colleges in Delhi NCR and Dehradun, so families can see a college before they choose it."
      />

      <main className="pt-32">
        <section className="mx-auto mb-20 max-w-7xl px-4 sm:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-primary-container p-8 sm:p-12 md:p-20">
            <div className="relative z-10 max-w-3xl">
              <span className="mb-6 inline-block rounded-full bg-tertiary px-4 py-1.5 text-xs font-bold tracking-widest text-on-tertiary uppercase">
                Delhi NCR · Dehradun
              </span>
              <h1 className="font-headline mb-6 text-4xl leading-tight font-extrabold tracking-tight text-white md:text-6xl">
                Choosing a college is a big decision. See it first.
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-primary-fixed-dim md:text-xl">
                The Academic Curator arranges campus tours led by students who
                study there, so you can judge a college by what you see and hear
                for yourself.
              </p>
            </div>
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-tertiary/20 blur-3xl" />
          </div>
        </section>

        <section className="mx-auto mb-24 max-w-3xl px-4 sm:px-8">
          <h2 className="font-headline mb-8 text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
            Why we started
          </h2>
          <div className="space-y-6 text-lg leading-relaxed text-secondary">
            <p>
              Most families choose a college from a brochure, a website and a
              phone call with a counsellor. The fees run into lakhs and the
              decision lasts three or four years, yet few students see the
              campus before the first day of class.
            </p>
            <p>
              A visit changes that. You see the classrooms and the hostel rooms,
              you eat in the mess, and you talk to someone a year or two ahead of
              you. We organise that visit and make sure there is a student
              there to show you around.
            </p>
          </div>
        </section>

        <section className="mx-auto mb-24 max-w-7xl px-4 sm:px-8">
          <h2 className="font-headline mb-10 text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
            What you can expect
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PROMISES.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-8 shadow-sm"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 text-primary">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <h3 className="font-headline text-xl font-bold text-primary">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-secondary">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-primary p-10 text-center md:p-20">
            <div className="relative z-10">
              <h2 className="font-headline mb-6 text-3xl font-extrabold tracking-tight text-white md:text-5xl">
                Visit before you apply
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-fixed-dim">
                Pick a college, choose a date and bring your family.
              </p>
              <div className="flex flex-col justify-center gap-4 md:flex-row">
                <Link
                  to="/explore"
                  className="rounded-full bg-white px-10 py-4 font-bold text-primary transition-colors hover:bg-primary-fixed-dim"
                >
                  Browse tours
                </Link>
                <Link
                  to="/contact"
                  className="rounded-full border border-white/30 px-10 py-4 font-bold text-white transition-colors hover:bg-white/10"
                >
                  Become a student guide
                </Link>
              </div>
            </div>
            <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
          </div>
        </section>
      </main>
    </>
  )
}
