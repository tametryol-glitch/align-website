// ═══════════════════════════════════════════════════════════════════
// Build-A-Match — Golden Match Zone (§35) and Cosmic Build (§16) — web
//
// EXACT MIRROR of align-app/src/services/buildAMatch/goldenMatch.ts.
//
// PURE MODULE. No Supabase, no React Native.
//
// ─── Golden Match ──────────────────────────────────────────────────
// The overlap of everything Align knows: what you asked for, what your
// charts actually do, whether they want someone like you, and whether
// your stated preferences agree.
//
// §35 is explicit that these must be genuinely rare, and §44 forbids
// manufacturing results. So every gate is required — no weighted average
// that lets a spectacular score in one dimension carry a weak one. If a
// dimension is UNKNOWN rather than low, it also fails: a Golden Match
// asserted on missing data would be the exact thing both sections warn
// against.
//
// ─── Cosmic Build ──────────────────────────────────────────────────
// Align proposing a build from your own chart, using element and modality
// relationships that already govern the compatibility engine. No new
// astrology, and no AI — the user can edit every suggestion.
// ═══════════════════════════════════════════════════════════════════

import type { BuildCriterion, BuildMatchResult, StoredPriority } from './types';

// ─── Golden Match thresholds ────────────────────────────────────────

export const GOLDEN = {
  /** They closely match what you actually asked for. */
  buildFit: 80,
  /** Your charts genuinely interact well, by Align's own engine. */
  compatibility: 80,
  /** You also fit THEIR build. Not a coincidence in one direction. */
  reciprocal: 75,
  /** Your stated preferences agree, where both of you answered. */
  preference: 70,
} as const;

export interface GoldenVerdict {
  isGolden: boolean;
  /** Which gates passed, for an honest explanation of a near miss. */
  passed: string[];
  /** Which failed because the score was low. */
  failed: string[];
  /** Which failed because we simply do not know — different from low. */
  unknown: string[];
}

/**
 * Evaluate the Golden Match gates.
 *
 * Every gate must pass on real data. A missing preference score or a
 * missing reciprocal fit is not a pass and not a soft fail — it lands in
 * `unknown`, and the match is not Golden. Being unable to check is not
 * evidence of quality.
 */
export function evaluateGolden(r: {
  buildFit: number;
  cosmicCompatibility: number | null;
  reciprocalFit: number | null;
  preferenceMatch: number | null;
  hasPreferenceConflict: boolean;
}): GoldenVerdict {
  const passed: string[] = [];
  const failed: string[] = [];
  const unknown: string[] = [];

  const gate = (
    label: string, value: number | null, threshold: number,
  ) => {
    if (value === null) { unknown.push(label); return false; }
    if (value >= threshold) { passed.push(label); return true; }
    failed.push(label);
    return false;
  };

  const a = gate('What you asked for', r.buildFit, GOLDEN.buildFit);
  const b = gate('Your charts together', r.cosmicCompatibility, GOLDEN.compatibility);
  const c = gate('They want someone like you', r.reciprocalFit, GOLDEN.reciprocal);
  const d = gate('What you both said you want', r.preferenceMatch, GOLDEN.preference);

  // An explicit dealbreaker clash disqualifies regardless of the numbers.
  if (r.hasPreferenceConflict) failed.push('No dealbreaker clash');

  return {
    isGolden: a && b && c && d && !r.hasPreferenceConflict,
    passed,
    failed,
    unknown,
  };
}

export function isGoldenMatch(r: BuildMatchResult): boolean {
  return evaluateGolden(r).isGolden;
}

/**
 * How close a non-Golden result came, for the "almost" copy. Returns the
 * number of gates passed out of four.
 */
export function goldenProgress(r: BuildMatchResult): number {
  return evaluateGolden(r).passed.filter(p => p !== 'No dealbreaker clash').length;
}

// ─── Cosmic Build ───────────────────────────────────────────────────

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

/**
 * Signs that trine a given sign — same element, 120° apart. The
 * compatibility engine already treats trines as its strongest supportive
 * aspect, so this is the engine's own logic expressed as a suggestion
 * rather than a second opinion.
 */
export function trinesOf(sign: string): string[] {
  const i = SIGNS.indexOf(sign as typeof SIGNS[number]);
  if (i < 0) return [];
  return [SIGNS[(i + 4) % 12], SIGNS[(i + 8) % 12]];
}

/** Signs that sextile a given sign — 60° apart, supportive but milder. */
export function sextilesOf(sign: string): string[] {
  const i = SIGNS.indexOf(sign as typeof SIGNS[number]);
  if (i < 0) return [];
  return [SIGNS[(i + 2) % 12], SIGNS[(i + 10) % 12]];
}

/** The sign opposite — the classic complement, and the classic friction. */
export function oppositeOf(sign: string): string | null {
  const i = SIGNS.indexOf(sign as typeof SIGNS[number]);
  return i < 0 ? null : SIGNS[(i + 6) % 12];
}

export interface CosmicSuggestion extends BuildCriterion {
  /** Why Align proposed this, in the user's own terms. */
  reason: string;
}

/**
 * The bodies Cosmic Build proposes for, and how it reasons about each.
 *
 * Deliberately small. Suggesting all 22 would produce a build nobody can
 * evaluate, and §16 requires that the user stays in control of the final
 * build — which means they have to be able to read it.
 */
const COSMIC_RULES: Array<{
  body: string;
  mode: 'trine' | 'sextile' | 'same' | 'opposite';
  priority: StoredPriority;
  reason: (mySign: string, theirSign: string) => string;
}> = [
  {
    body: 'Sun', mode: 'trine', priority: 'preferred',
    reason: (mine, theirs) =>
      `Your ${mine} Sun runs easily with a ${theirs} Sun — same element, no translation needed.`,
  },
  {
    body: 'Moon', mode: 'trine', priority: 'preferred',
    reason: (mine, theirs) =>
      `A ${theirs} Moon feels what your ${mine} Moon feels, without being told.`,
  },
  {
    body: 'Venus', mode: 'trine', priority: 'preferred',
    reason: (mine, theirs) =>
      `Your ${mine} Venus and a ${theirs} Venus want the same things from love.`,
  },
  {
    body: 'Mars', mode: 'sextile', priority: 'preferred',
    reason: (mine, theirs) =>
      `A ${theirs} Mars sparks your ${mine} Mars without fighting it.`,
  },
  {
    body: 'Mercury', mode: 'trine', priority: 'preferred',
    reason: (mine, theirs) =>
      `A ${theirs} Mercury thinks the way your ${mine} Mercury thinks.`,
  },
  {
    body: 'Juno', mode: 'same', priority: 'preferred',
    reason: (mine) =>
      `A ${mine} Juno means you both picture commitment the same way.`,
  },
];

/**
 * Propose a build from the user's own chart (§16).
 *
 * Every suggestion is PREFERRED, never must-have — this is Align's
 * opinion, not a requirement, and the user overrides all of it. Returns
 * [] rather than guessing when the chart is not indexed.
 */
export function cosmicBuild(
  myPlacements: Record<string, string>,
): CosmicSuggestion[] {
  const out: CosmicSuggestion[] = [];

  for (const rule of COSMIC_RULES) {
    const mine = myPlacements[rule.body];
    if (!mine) continue;

    let theirs: string | null = null;
    if (rule.mode === 'same') theirs = mine;
    else if (rule.mode === 'opposite') theirs = oppositeOf(mine);
    else if (rule.mode === 'trine') theirs = trinesOf(mine)[0] ?? null;
    else theirs = sextilesOf(mine)[0] ?? null;

    if (!theirs) continue;

    out.push({
      body: rule.body,
      sign: theirs,
      priority: rule.priority,
      reason: rule.reason(mine, theirs),
    });
  }

  return out;
}

/**
 * Surprise Build (§16) — the less obvious one.
 *
 * Uses oppositions rather than trines. The opposite sign is the classic
 * complement AND the classic friction, which is exactly the point: this
 * is meant to propose someone the user would not have built.
 */
export function surpriseBuild(
  myPlacements: Record<string, string>,
): CosmicSuggestion[] {
  const out: CosmicSuggestion[] = [];

  for (const body of ['Sun', 'Moon', 'Venus', 'Mars']) {
    const mine = myPlacements[body];
    if (!mine) continue;
    const theirs = oppositeOf(mine);
    if (!theirs) continue;

    out.push({
      body,
      sign: theirs,
      priority: 'preferred',
      reason: `A ${theirs} ${body} is the opposite of your ${mine} — the thing you are missing, and the thing you will argue about.`,
    });
  }

  return out;
}
