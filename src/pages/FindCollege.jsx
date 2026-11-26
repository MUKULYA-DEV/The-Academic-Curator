import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SEO from '../components/SEO.jsx'
import Reveal from '../components/Reveal.jsx'
import FindHeroBackdrop from '../components/FindHeroBackdrop.jsx'
import { getPublishedTours } from '../services/tourService.js'
import { describeBudget, formatRupees, matchTours, parseRequirement } from '../utils/requirement.js'

const EXAMPLES = [
  'BTech CSE in Dehradun under 2 lakh a year with hostel',
  'MBA in Delhi NCR, 6 lakh for the whole course',
  'BCA near Noida, 8000 a month, no hostel',
]

const MAX_PROGRAMMES = 3

/** Types the examples into the empty search box, one after another. */
function useTypedExample(active) {
  const [typed, setTyped] = useState('')

  useEffect(() => {
    if (!active) return undefined
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined

    let example = 0
    let length = 0
    let deleting = false
    let timer

    function tick() {
      const full = EXAMPLES[example]
      if (!deleting && length < full.length) {
        length += 1
        timer = setTimeout(tick, 45)
      } else if (!deleting) {
        deleting = true
        timer = setTimeout(tick, 2200)
      } else if (length > 0) {
        length -= 2
        if (length < 0) length = 0
        timer = setTimeout(tick, 18)
      } else {
        deleting = false
        example = (example + 1) % EXAMPLES.length
        timer = setTimeout(tick, 350)
      }
      setTyped(full.slice(0, length))
    }

    timer = setTimeout(tick, 900)
    return () => clearTimeout(timer)
  }, [active])

  return active && typed ? typed : `e.g. ${EXAMPLES[0]}`
}

function tourLink(tour) {
  return tour.slug ? `/college/${encodeURIComponent(tour.slug)}` : `/college?tourId=${tour.id}`
}

function Chip({ icon, tone, children }) {
  const tones = {
    met: 'bg-emerald-50 text-emerald-800',
    missed: 'bg-amber-50 text-amber-900',
    unknown: 'bg-surface-container text-secondary',
    info: 'bg-primary/5 text-primary',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${tones[tone]}`}>
      <span className="material-symbols-outlined text-base">{icon}</span>
      {children}
    </span>
  )
}

/** One course row: the fee per year, converted to per month and the full course. */
function ProgrammeRow({ programme, withHostel }) {
  const { cost, budgetFit } = programme
  const name = [programme.course, programme.branch].filter(Boolean).join(' · ') || 'Course'

  return (
    <li className="rounded-2xl bg-surface-container-low p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-headline font-bold text-primary">{name}</p>
        {budgetFit === 'within' && <Chip icon="check_circle" tone="met">Within budget</Chip>}
        {budgetFit === 'over' && (
          <Chip icon="trending_up" tone="missed">{formatRupees(programme.overBy)} a year over</Chip>
        )}
      </div>

      {cost ? (
        <>
          <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              ['Per year', formatRupees(cost.perYear)],
              ['Per month', formatRupees(cost.perMonth)],
              [cost.years ? `All ${cost.years} years` : 'Full course', cost.total ? formatRupees(cost.total) : 'Ask on tour'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-white px-2 py-3">
                <dt className="text-[11px] font-semibold tracking-wide text-secondary uppercase">{label}</dt>
                <dd className="font-headline mt-1 text-sm font-extrabold text-primary sm:text-base">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-xs text-secondary">
            {withHostel
              ? `Tuition ${formatRupees(cost.tuitionPerYear)} + hostel ${formatRupees(cost.hostelPerYear)} a year.`
              : 'Tuition only. Type "with hostel" to add the hostel fee.'}
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm text-secondary">
          {programme.annualFee !== null && withHostel
            ? `Tuition is ${formatRupees(programme.annualFee)} a year. The hostel fee has not been shared with us yet.`
            : 'The fee for this course has not been shared with us yet. Ask for the full break-up on the tour.'}
        </p>
      )}
    </li>
  )
}

function ResultCard({ result, withHostel, delay }) {
  const { tour, programmes, met, missed, unknown } = result
  const name = tour.university_name || tour.title || 'College'
  const shown = programmes.slice(0, MAX_PROGRAMMES)

  return (
    <Reveal delay={delay} className="ghost-shadow overflow-hidden rounded-3xl border border-outline-variant/30 bg-white">
      <div className="flex flex-col gap-5 p-5 sm:p-7">
        <div className="flex items-start gap-4">
          {tour.image_url ? (
            <img
              src={tour.image_url}
              alt=""
              loading="lazy"
              className="h-16 w-16 shrink-0 rounded-2xl object-cover sm:h-20 sm:w-20"
            />
          ) : (
            <span className="material-symbols-outlined flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/5 text-3xl text-primary sm:h-20 sm:w-20">
              school
            </span>
          )}
          <div className="min-w-0">
            <h3 className="font-headline text-lg leading-snug font-extrabold text-primary sm:text-xl">{name}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-secondary">
              <span className="material-symbols-outlined text-base">location_on</span>
              {tour.city || tour.location || 'Location on the tour page'}
            </p>
          </div>
        </div>

        {(met.length > 0 || missed.length > 0 || unknown.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {met.map((t) => <Chip key={t} icon="check" tone="met">{t}</Chip>)}
            {missed.map((t) => <Chip key={t} icon="priority_high" tone="missed">{t}</Chip>)}
            {unknown.map((t) => <Chip key={t} icon="help" tone="unknown">{t}</Chip>)}
          </div>
        )}

        {shown.length > 0 && (
          <ul className="space-y-3">
            {shown.map((p) => (
              <ProgrammeRow key={`${p.course}|${p.branch}`} programme={p} withHostel={withHostel} />
            ))}
          </ul>
        )}
        {programmes.length > shown.length && (
          <p className="-mt-2 text-xs text-secondary">
            +{programmes.length - shown.length} more on the college page.
          </p>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            to={tourLink(tour)}
            className="rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.98]"
          >
            See the campus tour
          </Link>
          <Link
            to={`/scorecard?college=${encodeURIComponent(name)}&tourId=${tour.id}`}
            className="rounded-full border border-outline-variant px-6 py-3 text-center text-sm font-semibold text-primary transition-colors hover:bg-surface-container"
          >
            Add to my scorecard
          </Link>
        </div>
      </div>
    </Reveal>
  )
}

export default function FindCollege() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const [text, setText] = useState(query)
  const [tours, setTours] = useState(null)
  const [failed, setFailed] = useState(false)
  const placeholder = useTypedExample(text === '')

  useEffect(() => {
    let cancelled = false
    getPublishedTours()
      .then((rows) => !cancelled && setTours(rows))
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
    }
  }, [])

  const cities = useMemo(() => [...new Set((tours ?? []).map((t) => t.city).filter(Boolean))], [tours])
  const req = useMemo(() => parseRequirement(query, cities), [query, cities])
  const results = useMemo(() => (tours && !req.empty ? matchTours(tours, req) : []), [tours, req])

  const fits = results.filter((r) => r.missed.length === 0 && r.unknown.length === 0)
  const maybe = results.filter((r) => r.missed.length === 0 && r.unknown.length > 0)
  const others = results.filter((r) => r.missed.length > 0)
  const withHostel = req.hostel === true

  function search(value) {
    const q = value.trim().slice(0, 300)
    setText(q)
    setSearchParams(q ? { q } : {})
  }

  return (
    <>
      <SEO
        title="Find my college: type your course, city and budget"
        description="Tell us the course you want, the city and what your family can spend. See which colleges on our campus tours fit, with fees shown per year, per month and for the full course."
      />
      <main className="pt-24">
        <section className="relative overflow-hidden bg-primary px-4 py-14 text-on-primary sm:px-8 md:py-20">
          <FindHeroBackdrop />
          <div className="relative mx-auto max-w-3xl">
            <Reveal as="p" y={16} className="font-label text-xs font-bold tracking-[0.2em] text-tertiary-fixed-dim uppercase">
              Find my college
            </Reveal>
            <Reveal as="h1" delay={0.08} className="mt-4 text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-5xl">
              Tell us what you need.
              <span className="block text-tertiary-fixed-dim">In your own words.</span>
            </Reveal>
            <Reveal as="p" delay={0.16} className="mt-5 max-w-2xl text-base leading-relaxed text-on-primary-container sm:text-lg">
              Type the course, the city and what your family can spend. We show which
              colleges fit and what the fee comes to per year, per month and in total.
            </Reveal>

            <Reveal delay={0.26} className="relative mt-8">
            <div aria-hidden="true" className="absolute -inset-3 overflow-hidden rounded-[2.2rem] opacity-50 blur-xl">
              <div className="find-glow absolute top-1/2 left-1/2 aspect-square w-[130%] -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div aria-hidden="true" className="absolute -inset-[2px] overflow-hidden rounded-[1.65rem]">
              <div className="find-glow absolute top-1/2 left-1/2 aspect-square w-[130%] -translate-x-1/2 -translate-y-1/2" />
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                search(text)
              }}
              className="relative rounded-3xl bg-white p-2 shadow-xl"
            >
              <label htmlFor="requirement" className="sr-only">Your requirement</label>
              <textarea
                id="requirement"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    search(text)
                  }
                }}
                rows={2}
                maxLength={300}
                placeholder={placeholder}
                className="font-body block w-full resize-none border-none bg-transparent px-4 pt-3 pb-1 text-base text-on-surface placeholder:text-outline focus:ring-0 focus:outline-none"
              />
              <div className="flex justify-end p-1">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-on-primary transition-all hover:bg-primary-container active:scale-[0.97]"
                >
                  <span className="material-symbols-outlined text-lg">search</span>
                  Find colleges
                </button>
              </div>
            </form>
            </Reveal>

            <Reveal delay={0.36} y={12} className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-on-primary-container">Try:</span>
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => search(example)}
                  className="rounded-full border border-white/25 px-3 py-1.5 text-left text-xs font-medium text-on-primary transition-colors hover:bg-white/10"
                >
                  {example}
                </button>
              ))}
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-10 sm:px-8 md:py-14" aria-live="polite">
          {failed && (
            <p className="rounded-2xl bg-amber-50 p-5 text-sm text-amber-900">
              We could not load the colleges just now. Check your connection and try again.
            </p>
          )}

          {!failed && !query && (
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ['edit_note', 'Type it your way', 'Course, city, budget, hostel. English or Hinglish, in any order.'],
                ['currency_rupee', 'See the real cost', 'Each fee is shown per year, per month and for the whole course.'],
                ['directions_walk', 'Then go and see it', 'Book a tour of the colleges that fit and check them yourself.'],
              ].map(([icon, title, body], idx) => (
                <Reveal key={title} delay={idx * 0.08} className="rounded-2xl border border-outline-variant/30 bg-white p-6">
                  <span className="material-symbols-outlined flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 text-primary">
                    {icon}
                  </span>
                  <h2 className="font-headline mt-4 font-bold text-primary">{title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-secondary">{body}</p>
                </Reveal>
              ))}
            </div>
          )}

          {!failed && query && tours === null && (
            <p className="text-center text-sm text-secondary">Looking through the colleges…</p>
          )}

          {!failed && query && tours !== null && req.empty && (
            <div className="rounded-2xl border border-outline-variant/30 bg-white p-6">
              <h2 className="font-headline font-bold text-primary">We could not pick out a course, city or budget</h2>
              <p className="mt-2 text-sm leading-relaxed text-secondary">
                Try something like &ldquo;{EXAMPLES[0]}&rdquo;, or{' '}
                <Link to="/explore-tours" className="font-semibold text-primary underline underline-offset-4">
                  browse all campus tours
                </Link>
                .
              </p>
            </div>
          )}

          {!failed && tours !== null && !req.empty && (
            <>
              <div>
                <p className="text-xs font-bold tracking-[0.15em] text-secondary uppercase">What we understood</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {req.courses.length > 0 && (
                    <Chip icon="school" tone="info">{req.courses.map((c) => c.label).join(' · ')}</Chip>
                  )}
                  {req.cityLabel && <Chip icon="location_on" tone="info">{req.cityLabel}</Chip>}
                  {req.budget && <Chip icon="currency_rupee" tone="info">{describeBudget(req.budget)}</Chip>}
                  {req.hostel !== null && (
                    <Chip icon="bed" tone="info">{req.hostel ? 'With hostel' : 'No hostel'}</Chip>
                  )}
                </div>
                <p className="mt-3 text-xs text-secondary">
                  Not what you meant? Change the words above and search again.
                </p>
              </div>

              <h2 className="font-headline mt-10 text-2xl font-extrabold tracking-tight text-primary">
                {fits.length > 0
                  ? `${fits.length} ${fits.length === 1 ? 'college fits' : 'colleges fit'} what you asked`
                  : maybe.length > 0
                    ? 'No confirmed match yet'
                    : 'No college on our tours fits all of this yet'}
              </h2>
              {fits.length === 0 && (
                <p className="mt-2 text-sm leading-relaxed text-secondary">
                  {maybe.length > 0
                    ? 'Nothing below rules these colleges out, but some of their fees or courses have not been shared with us yet.'
                    : 'We only list colleges we run campus tours at, in Delhi NCR and Dehradun.'}
                </p>
              )}

              <div className="mt-6 space-y-5">
                {fits.map((r, idx) => (
                  <ResultCard key={r.tour.id} result={r} withHostel={withHostel} delay={Math.min(idx, 4) * 0.06} />
                ))}
              </div>

              {maybe.length > 0 && (
                <>
                  {fits.length > 0 && (
                    <h2 className="font-headline mt-12 text-xl font-extrabold tracking-tight text-primary">
                      Might fit, details missing
                    </h2>
                  )}
                  <div className="mt-6 space-y-5">
                    {maybe.map((r, idx) => (
                      <ResultCard key={r.tour.id} result={r} withHostel={withHostel} delay={Math.min(idx, 4) * 0.06} />
                    ))}
                  </div>
                </>
              )}

              {others.length > 0 && (
                <>
                  <h2 className="font-headline mt-12 text-xl font-extrabold tracking-tight text-primary">
                    Close, but not everything matches
                  </h2>
                  <div className="mt-6 space-y-5">
                    {others.map((r, idx) => (
                      <ResultCard key={r.tour.id} result={r} withHostel={withHostel} delay={Math.min(idx, 4) * 0.06} />
                    ))}
                  </div>
                </>
              )}

              <p className="mt-10 rounded-2xl bg-surface-container-low p-5 text-xs leading-relaxed text-secondary">
                Fees are what each college has shared with us and can change. They leave out
                one-time charges such as the admission fee and security deposit. Ask for the
                full written break-up on your tour before you decide.
              </p>
            </>
          )}
        </section>
      </main>
    </>
  )
}
