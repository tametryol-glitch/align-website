// ═══════════════════════════════════════════════════════════════════
// Build-A-Match — Build Fit engine (web)
//
// EXACT MIRROR of align-app/src/services/buildAMatch/buildFitEngine.ts.
// Weights must stay identical across mobile, web and bam_fit_score() in SQL,
// or the same candidate would score differently depending on the device.
//
// PURE FUNCTIONS ONLY. No Supabase, no React Native, no network. This is
// the one place preference weighting lives, and it is unit-tested.
//
// This module contains ZERO astrology math. Every astrological value it
// reasons about was produced by an engine that already exists in Align
// (natalCalc → planet_placement_index, compatibilityEngine, duadCompendium).
// What it computes is *preference weighting*, which is product logic.
//
// ⚠ The weights below are mirrored by bam_fit_score() in
// supabase-migration-build-a-match.sql. SQL ranks with them; this module
// displays with them. Change one, change both, and update the tests.
// ═══════════════════════════════════════════════════════════════════

import type {
  BuildCriterion, CriterionOutcome, FitCounts, Priority,
  RelaxationOption, BuildRarity, SearchMode,
} from './types';

// ─── Configuration (§12A: weights live in config, not scattered) ────

export const FIT_WEIGHTS = {
  /** A MUST-HAVE is worth three PREFERREDs. */
  must: 3,
  preferred: 1,
  /** Hitting an AVOID costs twice a preferred. */
  avoidPenalty: 2,
} as const;

/** Pools smaller than this never reveal an exact number (§8). */
export const MIN_POOL_FOR_EXACT_COUNT = 5;

/** Below this, a rarity percentage is statistically meaningless (§15). */
export const MIN_POOL_FOR_RARITY = 50;

/** A candidate is "cosmically strong" at or above this compatibility. */
export const COSMICALLY_STRONG_THRESHOLD = 80;

/** Wild Card: low build fit but exceptional actual compatibility (§33). */
export const WILD_CARD_MAX_FIT = 65;
export const WILD_CARD_MIN_COMPATIBILITY = 85;

/** Mutual Build needs both directions to be genuinely strong (§31). */
export const MUTUAL_BUILD_MIN_FIT = 70;
export const MUTUAL_BUILD_MIN_RECIPROCAL = 70;

// ─── Core scoring ───────────────────────────────────────────────────

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * The canonical Build Fit score, 0–100.
 *
 * Mirrors bam_fit_score() exactly. A build made only of AVOID criteria
 * scores 100 when none are hit and 0 when any is — there is nothing
 * positive to earn, so the score becomes pass/fail.
 */
export function scoreBuildFit(counts: FitCounts): number {
  const possible =
    FIT_WEIGHTS.must * counts.must_total +
    FIT_WEIGHTS.preferred * counts.pref_total;

  if (possible <= 0) {
    return counts.avoid_hits > 0 ? 0 : 100;
  }

  const earned =
    FIT_WEIGHTS.must * counts.must_hits +
    FIT_WEIGHTS.preferred * counts.pref_hits -
    FIT_WEIGHTS.avoidPenalty * counts.avoid_hits;

  return clamp(Math.round((earned / possible) * 100), 0, 100);
}

/**
 * Resolve each criterion against a candidate's actual placements so the
 * result card can show ✓ / ✕ per line (§11, §45).
 *
 * `placements` maps body name → sign name.
 */
export function explainFit(
  criteria: BuildCriterion[],
  placements: Record<string, string>,
): CriterionOutcome[] {
  return criteria.map(c => {
    const actual = placements[c.body] ?? null;
    // An AVOID is "matched" when the unwanted placement is present — that
    // is a hit against the user, and the card must show it as a miss.
    const present = actual === c.sign;
    return {
      ...c,
      actualSign: actual,
      matched: c.priority === 'avoid' ? !present : present,
    };
  });
}

/** Recompute hit counts from resolved outcomes (used for local re-scoring). */
export function countsFromOutcomes(outcomes: CriterionOutcome[]): FitCounts {
  let must_hits = 0, pref_hits = 0, avoid_hits = 0, must_total = 0, pref_total = 0;
  for (const o of outcomes) {
    if (o.priority === 'must') {
      must_total++;
      if (o.matched) must_hits++;
    } else if (o.priority === 'preferred') {
      pref_total++;
      if (o.matched) pref_hits++;
    } else if (o.priority === 'avoid') {
      // matched === true means the avoided sign is ABSENT (good)
      if (!o.matched) avoid_hits++;
    }
  }
  return { must_hits, pref_hits, avoid_hits, must_total, pref_total };
}

// ─── Category labelling ─────────────────────────────────────────────

/**
 * A Perfect Build satisfies EVERY must-have and trips no avoid (§32).
 * Deliberately strict: the phrase must never appear when something the
 * user marked as required was missed.
 */
export function isPerfectBuild(counts: FitCounts): boolean {
  if (counts.must_total === 0) return false; // nothing was required — not "perfect"
  return counts.must_hits === counts.must_total && counts.avoid_hits === 0;
}

/** Missing only one or two selected criteria (§10 "Close Builds"). */
export function isCloseBuild(counts: FitCounts): boolean {
  if (isPerfectBuild(counts)) return false;
  const missed =
    (counts.must_total - counts.must_hits) +
    (counts.pref_total - counts.pref_hits) +
    counts.avoid_hits;
  return missed > 0 && missed <= 2;
}

/**
 * Not what you built — but worth discovering (§33). Requires a real
 * compatibility number; a Wild Card can never be manufactured from
 * absence of data.
 */
export function isWildCard(fit: number, compatibility: number | null): boolean {
  if (compatibility === null) return false;
  return fit <= WILD_CARD_MAX_FIT && compatibility >= WILD_CARD_MIN_COMPATIBILITY;
}

/** Both people independently built something close to each other (§31). */
export function isMutualBuild(fit: number, reciprocalFit: number | null): boolean {
  if (reciprocalFit === null) return false;
  return fit >= MUTUAL_BUILD_MIN_FIT && reciprocalFit >= MUTUAL_BUILD_MIN_RECIPROCAL;
}

export function isCosmicallyStrong(compatibility: number | null): boolean {
  return compatibility !== null && compatibility >= COSMICALLY_STRONG_THRESHOLD;
}

// ─── Search-mode gating ─────────────────────────────────────────────

/** Does this candidate survive the chosen search mode? Mirrors the SQL. */
export function passesSearchMode(counts: FitCounts, mode: SearchMode): boolean {
  if (mode === 'cosmic') return true;
  if (counts.avoid_hits > 0) return false;
  if (mode === 'exact') return counts.must_hits === counts.must_total;
  // 'close' tolerates exactly one missing must-have
  return counts.must_hits >= Math.max(0, counts.must_total - 1);
}

// ─── Privacy-aware presentation ─────────────────────────────────────

/**
 * Never reveal that exactly one person matches a highly specific build —
 * that is an identification vector (§8).
 */
export function formatPoolCount(count: number, minPool = MIN_POOL_FOR_EXACT_COUNT): string {
  if (count <= 0) return '0';
  if (count < minPool) return `Fewer than ${minPool} matches`;
  return count.toLocaleString();
}

/**
 * Build rarity within the eligible population (§15).
 *
 * Returns `percent: null` when the denominator is too small for a
 * percentage to mean anything — a "0.7% of members" claim over 40 people
 * is both noise and a privacy leak.
 */
export function computeBuildRarity(
  matchCount: number,
  eligiblePool: number,
): BuildRarity {
  if (eligiblePool < MIN_POOL_FOR_RARITY) {
    return {
      percent: null,
      matchCount,
      eligiblePool,
      label: 'Not enough members indexed yet to measure rarity',
    };
  }

  const percent = (matchCount / eligiblePool) * 100;
  let label: string;
  if (matchCount === 0) label = 'No one matches this build yet';
  else if (percent < 0.5) label = 'Your build is extremely rare';
  else if (percent < 2) label = 'Your build is rare';
  else if (percent < 10) label = 'Your build is uncommon';
  else if (percent < 30) label = 'Your build is fairly common';
  else label = 'Your build is common';

  return {
    percent: Math.round(percent * 10) / 10,
    matchCount,
    eligiblePool,
    label,
  };
}

/**
 * Order relaxation options by how much pool each one unlocks — the single
 * most restrictive requirement first (§14).
 */
export function rankRelaxationOptions(options: RelaxationOption[]): RelaxationOption[] {
  return [...options].sort((a, b) => b.poolIfRelaxed - a.poolIfRelaxed);
}

// ─── Criteria helpers ───────────────────────────────────────────────

/**
 * Turn the UI's per-body selection map into the criteria array the API
 * takes. `any` and blank signs are dropped, which is what makes ANY (§6)
 * genuinely non-restrictive rather than a filter for "any sign".
 */
export function toCriteria(
  selections: Record<string, { sign: string | null; priority: Priority }>,
): BuildCriterion[] {
  const out: BuildCriterion[] = [];
  for (const [body, sel] of Object.entries(selections)) {
    if (!sel || !sel.sign) continue;
    if (sel.priority === 'any') continue;
    out.push({ body, sign: sel.sign, priority: sel.priority });
  }
  return out;
}

/** How many criteria actually constrain the search. */
export function activeCriteriaCount(criteria: BuildCriterion[]): number {
  return criteria.filter(c => c.priority !== 'avoid').length;
}

/**
 * How many of the preference questions a profile actually answered.
 *
 * The preference engine substitutes a neutral 60% for anything unset, so a
 * profile that answered nothing still produces a confident-looking ~60.
 * That number would be describing our own defaults, not two people. Count
 * the real answers so the caller can decide whether the score means
 * anything at all.
 */
export function answeredPreferenceCount(p: {
  relationship_style?: string | null;
  relationship_primary_intent?: string | null;
  relationship_secondary_intents?: string[] | null;
  relationship_preferences?: string[] | null;
  connection_type_wanted?: string | null;
  energetic_pace?: string | null;
  spiritual_openness?: string | null;
} | null | undefined): number {
  if (!p) return 0;
  let n = 0;
  if (p.relationship_style) n++;
  if (p.relationship_primary_intent) n++;
  if (p.connection_type_wanted) n++;
  if (p.energetic_pace) n++;
  if (p.spiritual_openness) n++;
  if (p.relationship_secondary_intents?.length) n++;
  if (p.relationship_preferences?.length) n++;
  return n;
}

/**
 * Below this many answers on EITHER side, the preference score is padding
 * rather than signal and must be reported as unknown instead of a number.
 */
export const MIN_PREFERENCE_ANSWERS = 2;

/**
 * Time-dependent points are only meaningful with a reliable birth time
 * (§38). The list matches what the Whole-Sign indexer can and cannot
 * stand behind when birth_time is NULL.
 */
export const TIME_DEPENDENT_BODIES = new Set(['Ascendant', 'MC', 'Vertex']);

export function requiresBirthTime(body: string): boolean {
  return TIME_DEPENDENT_BODIES.has(body);
}

/** Criteria the viewer selected that need a birth time the candidate lacks. */
export function unreliableCriteria(
  criteria: BuildCriterion[],
  candidateBirthTimeKnown: boolean,
): BuildCriterion[] {
  if (candidateBirthTimeKnown) return [];
  return criteria.filter(c => requiresBirthTime(c.body));
}

// ─── New members (§10) ──────────────────────────────────────────────

/** Members who joined within this window count as "new" (§10). */
export const NEW_MEMBER_WINDOW_DAYS = 30;

/**
 * Did this person join recently? Returns false for an unknown join date —
 * a missing timestamp is not evidence of anything, and calling someone new
 * because we don't know would make the section meaningless.
 */
export function isNewMember(joinedAt: string | null, now = Date.now()): boolean {
  if (!joinedAt) return false;
  const t = Date.parse(joinedAt);
  if (Number.isNaN(t)) return false;
  const ageDays = (now - t) / 86_400_000;
  return ageDays >= 0 && ageDays <= NEW_MEMBER_WINDOW_DAYS;
}
