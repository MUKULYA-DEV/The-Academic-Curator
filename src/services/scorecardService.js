import { supabase } from '../supabaseClient.js'

/**
 * Cloud copy of a signed-in student's scorecards. Every call fails soft:
 * the device copy is the source of truth, so a network or permission error
 * must never interrupt someone filling the card in on campus.
 */

function toRow(card) {
  return {
    id: card.id,
    tour_id: card.tourId || null,
    college_name: card.collegeName,
    visited_on: card.visitedOn || null,
    ratings: card.ratings ?? {},
    checks: card.checks ?? {},
    notes: card.notes ?? {},
    created_at: card.createdAt,
    updated_at: card.updatedAt,
  }
}

function fromRow(row) {
  return {
    id: row.id,
    tourId: row.tour_id,
    collegeName: row.college_name,
    visitedOn: row.visited_on,
    ratings: row.ratings ?? {},
    checks: row.checks ?? {},
    notes: row.notes ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function fetchRemoteScorecards() {
  try {
    const { data, error } = await supabase
      .from('visit_scorecards')
      .select('id, tour_id, college_name, visited_on, ratings, checks, notes, created_at, updated_at')
      .order('created_at', { ascending: true })
    if (error) return null
    return (data ?? []).map(fromRow)
  } catch {
    return null
  }
}

export async function upsertRemoteScorecards(cards) {
  if (!cards.length) return true
  try {
    const { error } = await supabase.from('visit_scorecards').upsert(cards.map(toRow))
    return !error
  } catch {
    return false
  }
}

export async function deleteRemoteScorecard(id) {
  try {
    const { error } = await supabase.from('visit_scorecards').delete().eq('id', id)
    return !error
  } catch {
    return false
  }
}

/** Union of device and cloud cards; when both have one, the newer edit wins. */
export function mergeScorecards(local, remote) {
  const byId = new Map()
  ;[...remote, ...local].forEach((card) => {
    const existing = byId.get(card.id)
    if (!existing || new Date(card.updatedAt) > new Date(existing.updatedAt)) {
      byId.set(card.id, card)
    }
  })
  return [...byId.values()].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
}
