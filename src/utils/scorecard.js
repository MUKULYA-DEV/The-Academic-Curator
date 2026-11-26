/**
 * Campus Scorecard: what a student checks and rates on a campus visit.
 * Stored on the device first so it works without an account.
 */

export const SCORECARD_CATEGORIES = [
  {
    id: 'classrooms',
    icon: 'science',
    title: 'Classrooms and labs',
    checks: [
      { id: 'real_class', text: 'Sat in a regular classroom, not only the showcase hall' },
      { id: 'labs', text: 'Saw lab equipment that students were actually using' },
      { id: 'class_size', text: 'Asked how many students are in one section of my course' },
    ],
  },
  {
    id: 'hostel',
    icon: 'bed',
    title: 'Hostel',
    checks: [
      { id: 'real_room', text: 'Saw a room someone lives in, not the sample room' },
      { id: 'washrooms', text: 'Checked the washrooms and asked about water supply' },
      { id: 'rules', text: 'Asked about curfew, room sharing and the warden' },
    ],
  },
  {
    id: 'mess',
    icon: 'restaurant',
    title: 'Mess and food',
    checks: [
      { id: 'meal', text: 'Saw or ate an ordinary meal being served' },
      { id: 'menu', text: 'Asked students how often the menu repeats' },
      { id: 'hygiene', text: 'Looked at the dining hall and where plates are washed' },
    ],
  },
  {
    id: 'placements',
    icon: 'work',
    title: 'Placements',
    checks: [
      { id: 'median', text: 'Asked for the median package, not the highest' },
      { id: 'branch', text: 'Asked how many students from my branch were placed last year' },
      { id: 'companies', text: 'Asked which companies came to campus last year' },
    ],
  },
  {
    id: 'fees',
    icon: 'payments',
    title: 'Fees and extra costs',
    checks: [
      { id: 'breakup', text: 'Got the full fee break-up: tuition, hostel, exam fee, deposit' },
      { id: 'refund', text: 'Asked what is refunded if I withdraw' },
      { id: 'hike', text: 'Asked whether fees go up every year' },
    ],
  },
  {
    id: 'life',
    icon: 'groups',
    title: 'Campus life and safety',
    checks: [
      { id: 'other_student', text: 'Talked to a student who was not part of the tour' },
      { id: 'clubs', text: 'Asked which clubs, sports and fests ran this year' },
      { id: 'safety', text: 'Asked about anti-ragging rules, security and the medical room' },
    ],
  },
  {
    id: 'commute',
    icon: 'directions_bus',
    title: 'Location and commute',
    checks: [
      { id: 'travel_time', text: 'Timed the trip from home or the nearest station' },
      { id: 'evening', text: 'Checked transport after evening classes' },
      { id: 'nearby', text: 'Looked at what is nearby: market, hospital, PGs' },
    ],
  },
]

export const TOTAL_CHECKS = SCORECARD_CATEGORIES.reduce((n, c) => n + c.checks.length, 0)

export const RATING_LABELS = ['', 'Poor', 'Below average', 'Okay', 'Good', 'Excellent']

const STORAGE_KEY = 'tac_scorecards_v1'

export function checkKey(categoryId, checkId) {
  return `${categoryId}.${checkId}`
}

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  // RFC 4122 v4 fallback for older in-app browsers.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export function createScorecard({ collegeName, tourId = null }) {
  const now = new Date().toISOString()
  return {
    id: newId(),
    collegeName: collegeName.trim().slice(0, 160),
    tourId,
    visitedOn: now.slice(0, 10),
    ratings: {},
    checks: {},
    notes: {},
    createdAt: now,
    updatedAt: now,
  }
}

export function loadScorecards() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((c) => c && c.id && c.collegeName) : []
  } catch {
    return []
  }
}

export function saveScorecards(cards) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
  } catch {
    // Private mode or full storage: the scorecard still works for this session.
  }
}

/** Overall score out of 100 from the categories rated so far, or null if none. */
export function overallScore(card) {
  const values = SCORECARD_CATEGORIES.map((c) => card.ratings?.[c.id]).filter((v) => v >= 1)
  if (values.length === 0) return null
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 20)
}

export function ratedCount(card) {
  return SCORECARD_CATEGORIES.filter((c) => card.ratings?.[c.id] >= 1).length
}

export function checkedCount(card) {
  return Object.values(card.checks ?? {}).filter(Boolean).length
}

/** Plain-text summary for WhatsApp, written so a parent can read it cold. */
export function buildShareText(cards, siteUrl) {
  const lines = ['*Campus Scorecard*', 'What I saw on my college visits:', '']
  cards.forEach((card) => {
    const score = overallScore(card)
    lines.push(`*${card.collegeName}*${score === null ? '' : ` — ${score}/100`}`)
    SCORECARD_CATEGORIES.forEach((cat) => {
      const rating = card.ratings?.[cat.id]
      if (!rating) return
      const note = card.notes?.[cat.id]?.trim()
      lines.push(`• ${cat.title}: ${rating}/5${note ? ` (${note})` : ''}`)
    })
    lines.push(`Checked ${checkedCount(card)} of ${TOTAL_CHECKS} things in person`, '')
  })
  if (siteUrl) lines.push(`Made with the Campus Scorecard: ${siteUrl}/scorecard`)
  return lines.join('\n')
}
