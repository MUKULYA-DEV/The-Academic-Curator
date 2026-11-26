/**
 * "Find my college": turns a requirement typed in plain words
 * ("BTech CSE in Dehradun under 2 lakh a year with hostel") into filters,
 * then ranks published tours against them. Runs on the device, no server.
 */

const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const squash = (s) => norm(s).replace(/ /g, '')

/** A typed region covers several listed cities. */
const REGIONS = [
  {
    label: 'Delhi NCR',
    query: ['delhi ncr', 'ncr', 'delhi', 'new delhi'],
    cities: ['delhi', 'new delhi', 'noida', 'greater noida', 'gurgaon', 'gurugram', 'ghaziabad', 'faridabad'],
  },
]

/** `query` is what a student types; `match` is what a listed course or branch name contains. */
const COURSE_ALIASES = [
  { label: 'B.Tech', query: ['btech', 'b tech', 'b e', 'engineering'], match: ['btech', 'be', 'engineering'] },
  { label: 'M.Tech', query: ['mtech', 'm tech'], match: ['mtech'] },
  { label: 'MBA', query: ['mba', 'pgdm'], match: ['mba', 'pgdm', 'businessadministration'] },
  { label: 'BBA', query: ['bba'], match: ['bba'] },
  { label: 'BCA', query: ['bca'], match: ['bca'] },
  { label: 'MCA', query: ['mca'], match: ['mca'] },
  { label: 'B.Com', query: ['bcom', 'b com', 'commerce'], match: ['bcom', 'commerce'] },
  { label: 'B.Sc', query: ['bsc', 'b sc'], match: ['bsc'] },
  { label: 'BA', query: ['ba'], match: ['ba'] },
  { label: 'Law', query: ['law', 'llb', 'ba llb', 'bba llb'], match: ['law', 'llb'] },
  { label: 'Pharmacy', query: ['pharmacy', 'bpharm', 'b pharm', 'dpharm', 'd pharm'], match: ['pharm'] },
  { label: 'Nursing', query: ['nursing'], match: ['nursing'] },
  { label: 'Design', query: ['design', 'bdes', 'b des'], match: ['design', 'bdes'] },
  { label: 'Hotel Management', query: ['hotel management', 'bhm', 'hospitality'], match: ['hotel', 'hospitality', 'bhm'] },
  { label: 'Computer Science', query: ['cse', 'cs', 'computer science', 'computer', 'computers', 'software'], match: ['computer', 'cse', 'informationtechnology', 'software'] },
  { label: 'AI and Data Science', query: ['ai', 'aiml', 'artificial intelligence', 'machine learning', 'data science'], match: ['artificial', 'machinelearning', 'datascience', 'aiml'] },
  { label: 'Electronics', query: ['ece', 'electronics'], match: ['electronics', 'ece'] },
  { label: 'Mechanical', query: ['mechanical', 'mech'], match: ['mechanical'] },
  { label: 'Civil', query: ['civil'], match: ['civil'] },
  { label: 'Electrical', query: ['electrical', 'eee'], match: ['electrical'] },
  { label: 'Biotechnology', query: ['biotech', 'biotechnology'], match: ['biotech'] },
  { label: 'Agriculture', query: ['agriculture', 'agri'], match: ['agricultur'] },
  { label: 'Physics', query: ['physics'], match: ['physics'] },
  { label: 'Economics', query: ['economics', 'eco'], match: ['economics'] },
  { label: 'Psychology', query: ['psychology'], match: ['psychology'] },
  { label: 'Journalism', query: ['journalism', 'mass communication', 'mass comm', 'bjmc'], match: ['journalism', 'masscomm', 'bjmc'] },
]

const UNIT_VALUE = {
  crore: 1e7, crores: 1e7, cr: 1e7,
  lakh: 1e5, lakhs: 1e5, lac: 1e5, lacs: 1e5, l: 1e5,
  thousand: 1e3, k: 1e3, hazar: 1e3, hazaar: 1e3,
}

const hasPhrase = (haystack, phrase) => ` ${haystack} `.includes(` ${phrase} `)

function parseBudget(text) {
  const lower = text.toLowerCase().replace(/,/g, '')
  const re = /(₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(crores?|cr|lakhs?|lacs?|thousand|hazaa?r|k|l)?\b/g
  let amount = null
  let m
  while ((m = re.exec(lower)) !== null) {
    const value = Number(m[2])
    const unit = m[3]
    const rupees = unit ? value * UNIT_VALUE[unit] : value
    // A bare number counts only if it is clearly money, so "4 years", "90%" and "2027" are skipped.
    if (unit || m[1] || rupees >= 3000) {
      amount = rupees
      break
    }
  }
  if (!amount || amount < 1000) return null

  let period = 'year'
  if (/per year|a year|yearly|per annum|annual|\/ ?year|saal/.test(lower)) period = 'year'
  else if (/per month|a month|monthly|\/ ?month|mahin/.test(lower)) period = 'month'
  else if (/per sem|a sem|semester|\/ ?sem/.test(lower)) period = 'semester'
  else if (/total|whole course|full course|entire course|complete course|overall|all \d years|for \d years|poora|pura/.test(lower)) period = 'total'

  return { amount, period }
}

/**
 * @param {string} text what the student typed
 * @param {string[]} knownCities cities of published tours
 */
export function parseRequirement(text, knownCities = []) {
  const clean = norm(text)
  const req = { budget: null, cityLabel: null, cities: [], courses: [], hostel: null, empty: true }
  if (!clean) return req

  req.budget = parseBudget(text)

  const region = REGIONS.find((r) => r.query.some((q) => hasPhrase(clean, q)))
  const typedCities = [...new Set(knownCities.map(norm).filter(Boolean))]
    .filter((c) => hasPhrase(clean, c))
    // "noida" is inside "greater noida": keep the longer one only.
    .filter((c, _, all) => !all.some((other) => other !== c && other.includes(c)))
  if (typedCities.length) {
    req.cities = typedCities
    req.cityLabel = knownCities.find((c) => norm(c) === typedCities[0]) ?? typedCities[0]
  } else if (region) {
    req.cities = region.cities
    req.cityLabel = region.label
  }

  req.courses = COURSE_ALIASES.filter((a) => a.query.some((q) => hasPhrase(clean, q)))

  if (/no hostel|without hostel|day scholar|dayscholar|from home|ghar se/.test(text.toLowerCase())) req.hostel = false
  else if (/hostel|pg\b|stay on campus|accommodation|accomodation/.test(text.toLowerCase())) req.hostel = true

  req.empty = !req.budget && !req.cities.length && !req.courses.length && req.hostel === null
  return req
}

const toNumber = (v) => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
}

/** Every course and branch a tour lists, with whatever fee data the college has shared. */
function programmesOf(tour) {
  const details = tour.details && typeof tour.details === 'object' ? tour.details : {}
  const list = []
  ;(details.courses ?? []).forEach((course) => {
    const years = toNumber(course.durationYears)
    const branches = course.branches?.length ? course.branches : [{ name: '' }]
    branches.forEach((branch) => {
      list.push({
        course: course.name ?? '',
        branch: branch.name ?? '',
        years,
        annualFee: toNumber(branch.annualFee),
      })
    })
  })
  // Older listings carry one course in the top-level columns instead.
  if (!list.length && (tour.course || tour.major)) {
    list.push({ course: tour.course ?? '', branch: tour.major ?? '', years: null, annualFee: null })
  }
  return list
}

function programmeMatches(programme, alias) {
  // Dots are dropped first so "B.E." reads as "be" and "B.Tech" as "btech".
  const name = `${programme.course} ${programme.branch}`.replace(/\./g, '')
  const hay = squash(name)
  const words = norm(name).split(' ')
  return alias.match.some((needle) => (needle.length <= 3 ? words.includes(needle) : hay.includes(needle)))
}

/** The budget the student typed, expressed per year for a given programme. */
function yearlyBudget(budget, years) {
  if (budget.period === 'month') return budget.amount * 12
  if (budget.period === 'semester') return budget.amount * 2
  if (budget.period === 'total') return years ? budget.amount / years : null
  return budget.amount
}

function costOf(programme, hostelPerYear, withHostel) {
  if (programme.annualFee === null) return null
  if (withHostel && hostelPerYear === null) return null
  const perYear = programme.annualFee + (withHostel ? hostelPerYear : 0)
  return {
    tuitionPerYear: programme.annualFee,
    hostelPerYear: withHostel ? hostelPerYear : 0,
    perYear,
    perMonth: Math.round(perYear / 12),
    total: programme.years ? perYear * programme.years : null,
    years: programme.years,
  }
}

/**
 * Ranks tours against a parsed requirement.
 * Each result: { tour, programmes: [{...programme, cost, budgetFit}], met: [], missed: [], unknown: [], score }
 * budgetFit is 'within' | 'over' | 'unknown' | null (no budget typed).
 */
export function matchTours(tours, req) {
  const results = tours.map((tour) => {
    const met = []
    const missed = []
    const unknown = []
    const details = tour.details && typeof tour.details === 'object' ? tour.details : {}
    const hostelPerYear = toNumber(details.fees?.hostelPerYear)
    const withHostel = req.hostel === true

    if (req.cities.length) {
      const where = norm(`${tour.city ?? ''} ${tour.location ?? ''}`)
      if (req.cities.some((c) => hasPhrase(where, c))) met.push(`In ${tour.city || req.cityLabel}`)
      else missed.push(`Not in ${req.cityLabel}${tour.city ? ` (it is in ${tour.city})` : ''}`)
    }

    const all = programmesOf(tour)
    let programmes = all
    if (req.courses.length) {
      const wanted = all.filter((p) => req.courses.every((a) => programmeMatches(p, a)))
      const partial = all.filter((p) => req.courses.some((a) => programmeMatches(p, a)))
      const label = req.courses.map((a) => a.label).join(' ')
      if (wanted.length) {
        programmes = wanted
        met.push(`Offers ${label}`)
      } else if (partial.length) {
        programmes = partial
        missed.push(`No exact ${label}, but a related course is listed`)
      } else if (all.length) {
        programmes = []
        missed.push(`${label} is not in its listed courses`)
      } else {
        programmes = []
        unknown.push('Course list not added yet')
      }
    }

    programmes = programmes.map((p) => {
      const cost = costOf(p, hostelPerYear, withHostel)
      let budgetFit = null
      if (req.budget) {
        const limit = yearlyBudget(req.budget, p.years)
        if (!cost || limit === null) budgetFit = 'unknown'
        else budgetFit = cost.perYear <= limit ? 'within' : 'over'
      }
      return { ...p, cost, budgetFit, overBy: cost && budgetFit === 'over' ? cost.perYear - yearlyBudget(req.budget, p.years) : 0 }
    })

    if (req.budget && (programmes.length || !req.courses.length)) {
      if (programmes.some((p) => p.budgetFit === 'within')) met.push('Within your budget')
      else if (programmes.some((p) => p.budgetFit === 'over')) missed.push('Above your budget')
      else unknown.push('Fees not shared with us yet')
    }

    if (req.hostel === true && hostelPerYear === null) unknown.push('Hostel fee not shared with us yet')

    const rank = { within: 0, null: 1, unknown: 2, over: 3 }
    programmes.sort(
      (a, b) =>
        rank[String(a.budgetFit)] - rank[String(b.budgetFit)] ||
        (a.cost?.perYear ?? Infinity) - (b.cost?.perYear ?? Infinity),
    )

    return { tour, programmes, met, missed, unknown, score: met.length * 3 - missed.length * 4 - unknown.length }
  })

  return results.sort((a, b) => b.score - a.score)
}

/** ₹1,60,000 -> "₹1.6 lakh"; ₹85,000 -> "₹85,000". */
export function formatRupees(n) {
  if (n === null || n === undefined) return ''
  if (n >= 1e7) return `₹${+(n / 1e7).toFixed(2)} crore`
  if (n >= 1e5) return `₹${+(n / 1e5).toFixed(2)} lakh`
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

export function describeBudget(budget) {
  const per = { year: 'a year', month: 'a month', semester: 'a semester', total: 'for the whole course' }[budget.period]
  return `Up to ${formatRupees(budget.amount)} ${per}`
}
