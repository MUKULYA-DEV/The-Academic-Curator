import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SEO from '../components/SEO.jsx'
import Reveal from '../components/Reveal.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { getPublishedTours } from '../services/tourService.js'
import {
  deleteRemoteScorecard,
  fetchRemoteScorecards,
  mergeScorecards,
  upsertRemoteScorecards,
} from '../services/scorecardService.js'
import {
  RATING_LABELS,
  SCORECARD_CATEGORIES,
  TOTAL_CHECKS,
  buildShareText,
  checkKey,
  checkedCount,
  createScorecard,
  loadScorecards,
  overallScore,
  ratedCount,
  saveScorecards,
} from '../utils/scorecard.js'

const sameName = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase()

/** Device cards, plus a fresh card when the page is opened for a specific college. */
function initialState(searchParams) {
  const cards = loadScorecards()
  const college = searchParams.get('college')?.trim()
  if (!college) return { cards, activeId: cards[0]?.id ?? null }

  const tourId = searchParams.get('tourId') || null
  const existing = cards.find((c) => (tourId && c.tourId === tourId) || sameName(c.collegeName, college))
  if (existing) return { cards, activeId: existing.id }

  const card = createScorecard({ collegeName: college, tourId })
  return { cards: [...cards, card], activeId: card.id }
}

function RatingInput({ value, onChange, label }) {
  return (
    <div role="radiogroup" aria-label={`Rate ${label}`} className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} out of 5, ${RATING_LABELS[n]}`}
          onClick={() => onChange(value === n ? 0 : n)}
          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all active:scale-90 ${
            value >= n
              ? 'bg-tertiary-container text-on-tertiary-fixed shadow-sm'
              : 'bg-surface-container text-secondary hover:bg-surface-container-highest'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

function ScoreRing({ score, size = 'lg' }) {
  const dims = size === 'lg' ? 'h-24 w-24 text-3xl' : 'h-14 w-14 text-lg'
  const angle = score === null ? 0 : score * 3.6
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-full ${dims}`}
      style={{ background: `conic-gradient(#cba72f ${angle}deg, rgba(255,255,255,0.14) 0deg)` }}
    >
      <div className="font-headline absolute inset-1.5 flex items-center justify-center rounded-full bg-primary font-extrabold text-on-primary">
        {score === null ? '–' : score}
      </div>
    </div>
  )
}

export default function Scorecard() {
  const [searchParams] = useSearchParams()
  const { session } = useAuth()
  const userId = session?.user?.id ?? null

  const [{ cards, activeId }, setState] = useState(() => initialState(searchParams))
  const [newCollege, setNewCollege] = useState('')
  const [tours, setTours] = useState([])
  const [openCategory, setOpenCategory] = useState(SCORECARD_CATEGORIES[0].id)
  const [copied, setCopied] = useState(false)

  const cardsRef = useRef(cards)
  const dirtyRef = useRef(new Set())

  const active = cards.find((c) => c.id === activeId) ?? null

  // The device copy is written on every change.
  useEffect(() => {
    cardsRef.current = cards
    saveScorecards(cards)
  }, [cards])

  useEffect(() => {
    let cancelled = false
    getPublishedTours()
      .then((rows) => {
        if (!cancelled) setTours(rows)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  // On sign-in, merge the cloud copy with this device and push what the cloud lacks.
  useEffect(() => {
    if (!userId) return undefined
    let cancelled = false
    fetchRemoteScorecards().then((remote) => {
      if (cancelled || remote === null) return
      const local = cardsRef.current
      const merged = mergeScorecards(local, remote)
      const remoteById = new Map(remote.map((c) => [c.id, c]))
      const toPush = merged.filter((c) => {
        const r = remoteById.get(c.id)
        return !r || new Date(c.updatedAt) > new Date(r.updatedAt)
      })
      setState((prev) => ({
        cards: merged,
        activeId: merged.some((c) => c.id === prev.activeId) ? prev.activeId : (merged[0]?.id ?? null),
      }))
      upsertRemoteScorecards(toPush)
    })
    return () => {
      cancelled = true
    }
  }, [userId])

  // Push edits a moment after the student stops tapping.
  useEffect(() => {
    if (!userId || dirtyRef.current.size === 0) return undefined
    const timer = setTimeout(() => {
      const ids = dirtyRef.current
      dirtyRef.current = new Set()
      upsertRemoteScorecards(cardsRef.current.filter((c) => ids.has(c.id)))
    }, 1200)
    return () => clearTimeout(timer)
  }, [cards, userId])

  function updateActive(patch) {
    if (!active) return
    dirtyRef.current.add(active.id)
    setState((prev) => ({
      ...prev,
      cards: prev.cards.map((c) =>
        c.id === prev.activeId ? { ...c, ...patch(c), updatedAt: new Date().toISOString() } : c,
      ),
    }))
  }

  function findTour(name) {
    return tours.find(
      (t) => sameName(t.university_name ?? '', name) || sameName(t.title ?? '', name),
    )
  }

  function addCollege(e) {
    e.preventDefault()
    const name = newCollege.trim()
    if (!name) return
    const existing = cards.find((c) => sameName(c.collegeName, name))
    if (existing) {
      setState((prev) => ({ ...prev, activeId: existing.id }))
    } else {
      const card = createScorecard({ collegeName: name, tourId: findTour(name)?.id ?? null })
      dirtyRef.current.add(card.id)
      setState((prev) => ({ cards: [...prev.cards, card], activeId: card.id }))
      setOpenCategory(SCORECARD_CATEGORIES[0].id)
    }
    setNewCollege('')
  }

  function removeActive() {
    if (!active) return
    const id = active.id
    dirtyRef.current.delete(id)
    setState((prev) => {
      const rest = prev.cards.filter((c) => c.id !== id)
      return { cards: rest, activeId: rest[0]?.id ?? null }
    })
    if (userId) deleteRemoteScorecard(id)
  }

  const shareText = useMemo(
    () => buildShareText(cards, typeof window === 'undefined' ? '' : window.location.origin),
    [cards],
  )
  const hasAnyRating = cards.some((c) => ratedCount(c) > 0)
  const activeTour = active
    ? (tours.find((t) => t.id === active.tourId) ?? findTour(active.collegeName))
    : null
  const tourNames = useMemo(
    () => [...new Set(tours.map((t) => t.university_name || t.title).filter(Boolean))],
    [tours],
  )

  async function copyShareText() {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <SEO
        title="Campus Scorecard: rate a college on what you see"
        description="A free checklist and scorecard for college visits. Rate the hostel, mess, labs, placements and fees yourself, compare colleges side by side and share it with your parents."
      />
      <main className="pt-24">
        <section className="relative overflow-hidden bg-primary px-4 py-14 text-on-primary sm:px-8 md:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-48 right-0 h-[32rem] w-[32rem] rounded-full bg-surface-tint opacity-40 blur-3xl"
          />
          <div className="relative mx-auto max-w-4xl">
            <p className="font-label text-xs font-bold tracking-[0.2em] text-tertiary-fixed-dim uppercase">
              Free, no sign-up needed
            </p>
            <h1 className="mt-4 text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              The brochure is written by the college.
              <span className="block text-tertiary-fixed-dim">This one is written by you.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-on-primary-container sm:text-lg">
              Take the Campus Scorecard on your visit. It tells you what to check and what
              to ask, you rate what you actually see, and your parents get a clear
              comparison on WhatsApp.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-8 md:py-14">
          <form
            onSubmit={addCollege}
            className="ghost-shadow flex items-center rounded-full bg-white p-1.5 ring-primary/20 focus-within:ring-2"
          >
            <span className="material-symbols-outlined pl-3 text-secondary sm:pl-5">school</span>
            <input
              list="scorecard-colleges"
              value={newCollege}
              onChange={(e) => setNewCollege(e.target.value)}
              maxLength={160}
              placeholder={cards.length ? 'Add another college' : 'Which college are you visiting?'}
              aria-label="College name"
              className="font-body w-full min-w-0 border-none bg-transparent px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:ring-0 focus:outline-none sm:py-3.5 sm:text-base"
            />
            <datalist id="scorecard-colleges">
              {tourNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold whitespace-nowrap text-on-primary transition-all hover:bg-primary-container active:scale-[0.97] sm:px-8 sm:py-3.5 sm:text-base"
            >
              {cards.length ? 'Add' : 'Start scorecard'}
            </button>
          </form>

          {cards.length === 0 && (
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ['checklist', 'Know what to check', `${TOTAL_CHECKS} things to see and ask, from the real hostel room to the median package.`],
                ['star_half', 'Rate what you see', 'Score each area out of 5 while you are standing in it, with your own notes.'],
                ['family_restroom', 'Decide as a family', 'Compare colleges side by side and send the result to your parents.'],
              ].map(([icon, title, body], idx) => (
                <Reveal
                  key={title}
                  delay={idx * 0.08}
                  className="rounded-2xl border border-outline-variant/30 bg-white p-6"
                >
                  <span className="material-symbols-outlined flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 text-primary">
                    {icon}
                  </span>
                  <h2 className="font-headline mt-4 font-bold text-primary">{title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-secondary">{body}</p>
                </Reveal>
              ))}
            </div>
          )}

          {cards.length > 0 && (
            <div className="mt-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Your colleges">
              {cards.map((card) => {
                const score = overallScore(card)
                const selected = card.id === activeId
                return (
                  <button
                    key={card.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setState((prev) => ({ ...prev, activeId: card.id }))}
                    className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
                      selected
                        ? 'border-primary bg-primary text-on-primary'
                        : 'border-outline-variant/60 bg-white text-primary hover:bg-surface-container'
                    }`}
                  >
                    {card.collegeName}
                    {score !== null && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          selected ? 'bg-white/15' : 'bg-tertiary-fixed text-on-tertiary-fixed'
                        }`}
                      >
                        {score}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {active && (
            <div className="mt-6">
              <div className="scholar-gradient flex items-center gap-5 rounded-[2rem] p-6 text-on-primary sm:p-8">
                <ScoreRing score={overallScore(active)} />
                <div className="min-w-0 flex-1">
                  <h2 className="font-headline truncate text-xl font-extrabold sm:text-2xl">
                    {active.collegeName}
                  </h2>
                  <p className="mt-1 text-sm text-on-primary-container">
                    {ratedCount(active)} of {SCORECARD_CATEGORIES.length} areas rated ·{' '}
                    {checkedCount(active)} of {TOTAL_CHECKS} checked in person
                  </p>
                  <label className="mt-3 flex items-center gap-2 text-xs text-on-primary-container">
                    Visited on
                    <input
                      type="date"
                      value={active.visitedOn ?? ''}
                      onChange={(e) => updateActive(() => ({ visitedOn: e.target.value || null }))}
                      className="rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xs text-on-primary [color-scheme:dark]"
                    />
                  </label>
                </div>
              </div>

              {activeTour && (
                <Link
                  to={`/college?tourId=${encodeURIComponent(activeTour.id)}`}
                  className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-tertiary-container/50 bg-tertiary-fixed/30 px-5 py-4 text-sm font-semibold text-on-tertiary-fixed transition-colors hover:bg-tertiary-fixed/50"
                >
                  <span>Not visited yet? Walk this campus with a current student.</span>
                  <span className="material-symbols-outlined shrink-0">arrow_forward</span>
                </Link>
              )}

              <div className="mt-4 space-y-3">
                {SCORECARD_CATEGORIES.map((cat) => {
                  const open = openCategory === cat.id
                  const rating = active.ratings?.[cat.id] ?? 0
                  const done = cat.checks.filter((c) => active.checks?.[checkKey(cat.id, c.id)]).length
                  return (
                    <div
                      key={cat.id}
                      className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-white"
                    >
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setOpenCategory(open ? null : cat.id)}
                        className="flex w-full items-center gap-3 px-5 py-4 text-left"
                      >
                        <span className="material-symbols-outlined flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary">
                          {cat.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="font-headline block font-bold text-primary">{cat.title}</span>
                          <span className="block text-xs text-secondary">
                            {done} of {cat.checks.length} checked
                            {rating ? ` · ${RATING_LABELS[rating]}` : ''}
                          </span>
                        </span>
                        {rating > 0 && (
                          <span className="rounded-full bg-tertiary-fixed px-2.5 py-1 text-xs font-bold text-on-tertiary-fixed">
                            {rating}/5
                          </span>
                        )}
                        <span
                          className={`material-symbols-outlined text-secondary transition-transform ${open ? 'rotate-180' : ''}`}
                        >
                          expand_more
                        </span>
                      </button>
                      {open && (
                        <div className="space-y-5 border-t border-surface-container-high px-5 py-5">
                          <ul className="space-y-1">
                            {cat.checks.map((check) => {
                              const key = checkKey(cat.id, check.id)
                              const checked = Boolean(active.checks?.[key])
                              return (
                                <li key={check.id}>
                                  <label className="flex cursor-pointer items-start gap-3 rounded-xl px-2 py-2.5 hover:bg-surface-container-low">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={(e) =>
                                        updateActive((c) => ({
                                          checks: { ...c.checks, [key]: e.target.checked },
                                        }))
                                      }
                                      className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
                                    />
                                    <span
                                      className={`text-sm leading-relaxed ${checked ? 'text-secondary line-through' : 'text-on-surface'}`}
                                    >
                                      {check.text}
                                    </span>
                                  </label>
                                </li>
                              )
                            })}
                          </ul>
                          <div>
                            <p className="mb-2 text-xs font-bold tracking-widest text-secondary uppercase">
                              Your rating
                            </p>
                            <RatingInput
                              label={cat.title}
                              value={rating}
                              onChange={(n) =>
                                updateActive((c) => ({ ratings: { ...c.ratings, [cat.id]: n } }))
                              }
                            />
                          </div>
                          <textarea
                            value={active.notes?.[cat.id] ?? ''}
                            onChange={(e) =>
                              updateActive((c) => ({ notes: { ...c.notes, [cat.id]: e.target.value } }))
                            }
                            maxLength={400}
                            rows={2}
                            placeholder="What did you notice? (optional)"
                            aria-label={`Notes on ${cat.title}`}
                            className="w-full resize-none rounded-xl border border-outline-variant/50 bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-xs leading-relaxed text-secondary">
                  {userId ? (
                    'Saved to your account.'
                  ) : (
                    <>
                      Saved on this phone.{' '}
                      <Link to="/login?redirect=%2Fscorecard" className="font-bold text-primary underline">
                        Log in
                      </Link>{' '}
                      to keep it on every device.
                    </>
                  )}
                </p>
                <button
                  type="button"
                  onClick={removeActive}
                  className="shrink-0 text-xs font-semibold text-error hover:underline"
                >
                  Remove this college
                </button>
              </div>
            </div>
          )}

          {cards.length >= 2 && (
            <div className="mt-12">
              <h2 className="font-headline text-2xl font-extrabold tracking-tight text-primary">
                Side by side
              </h2>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-outline-variant/30 bg-white">
                <table className="w-full min-w-max text-sm">
                  <thead>
                    <tr className="bg-surface-container-low text-left">
                      <th className="sticky left-0 bg-surface-container-low px-4 py-3 font-semibold text-secondary">
                        Area
                      </th>
                      {cards.map((card) => (
                        <th key={card.id} className="max-w-40 px-4 py-3 font-bold text-primary">
                          {card.collegeName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SCORECARD_CATEGORIES.map((cat) => {
                      const best = Math.max(...cards.map((c) => c.ratings?.[cat.id] ?? 0))
                      return (
                        <tr key={cat.id} className="border-t border-surface-container-high">
                          <th className="sticky left-0 bg-white px-4 py-3 text-left font-medium text-on-surface">
                            {cat.title}
                          </th>
                          {cards.map((card) => {
                            const r = card.ratings?.[cat.id] ?? 0
                            return (
                              <td key={card.id} className="px-4 py-3">
                                {r ? (
                                  <span
                                    className={`rounded-full px-2.5 py-1 font-bold ${
                                      r === best
                                        ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                                        : 'text-secondary'
                                    }`}
                                  >
                                    {r}/5
                                  </span>
                                ) : (
                                  <span className="text-outline">–</span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                    <tr className="border-t-2 border-primary/20 bg-surface-container-low">
                      <th className="sticky left-0 bg-surface-container-low px-4 py-3 text-left font-bold text-primary">
                        Overall
                      </th>
                      {cards.map((card) => {
                        const score = overallScore(card)
                        return (
                          <td key={card.id} className="font-headline px-4 py-3 text-lg font-extrabold text-primary">
                            {score === null ? '–' : `${score}/100`}
                          </td>
                        )
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {hasAnyRating && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-8 py-4 text-center font-bold text-[#0b3d1f] transition-opacity hover:opacity-90"
              >
                <span className="material-symbols-outlined">share</span>
                Send to parents on WhatsApp
              </a>
              <button
                type="button"
                onClick={copyShareText}
                className="rounded-full border border-outline-variant bg-white px-8 py-4 font-bold text-primary transition-colors hover:bg-surface-container"
              >
                {copied ? 'Copied' : 'Copy summary'}
              </button>
            </div>
          )}

          <div className="mt-14 rounded-[2rem] bg-surface-container-low p-8 text-center">
            <h2 className="font-headline text-2xl font-extrabold tracking-tight text-primary">
              Easier with someone who studies there
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-secondary">
              On our tours a current student walks you through the real classrooms, hostel
              and mess, so you can tick off this whole list in one visit.
            </p>
            <Link
              to="/explore-tours"
              className="mt-6 inline-block rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-on-primary transition-opacity hover:opacity-90"
            >
              See upcoming tours
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
