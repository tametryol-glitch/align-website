// ═══════════════════════════════════════════════════════════════════
// Build-A-Match — Share My Build (web)
//
// EXACT MIRROR of align-app/src/services/buildAMatch/buildShareCode.ts.
// SHARE_BODIES and SHARE_SIGNS must stay byte-identical across platforms —
// a link shared from the app is decoded here.
//
// "MY BUILD-A-MATCH — Moon Pisces, Venus Scorpio, Mars Capricorn.
//  How close are you?"
//
// ─── Why the build travels IN the link ─────────────────────────────
//
// The alternative is sharing a build id and letting the recipient fetch
// it, which means opening saved builds to strangers and trusting an RLS
// policy to hold the line forever.
//
// Encoding the criteria into the URL removes that risk structurally: the
// only thing that can leave is a list of bodies, signs and priorities.
// There is no birth time, no location, no profile data and no preference
// setting in the payload, because there is nowhere to put one. §29 asks
// for a privacy-safe card; this makes it privacy-safe by construction
// rather than by policy.
//
// It also means a shared link works for a logged-out stranger with no
// database read at all, which is the point of sharing it.
//
// PURE MODULE. No Supabase, no React Native.
// ═══════════════════════════════════════════════════════════════════

import type { BuildCriterion, StoredPriority } from './types';

/**
 * Fixed body order. **Append only.** Inserting or reordering would
 * silently repoint every link ever shared at different placements.
 */
export const SHARE_BODIES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus',
  'Neptune', 'Pluto', 'North Node', 'South Node', 'Ascendant', 'MC', 'Chiron',
  'Juno', 'Vesta', 'Pallas', 'Lilith', 'Eros', 'Psyche', 'Ceres',
] as const;

/** Fixed sign order. Append-only for the same reason. */
export const SHARE_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

const PRIORITY_CHAR: Record<StoredPriority, string> = {
  must: 'm',
  preferred: 'p',
  avoid: 'a',
};

const CHAR_PRIORITY: Record<string, StoredPriority> = {
  m: 'must',
  p: 'preferred',
  a: 'avoid',
};

/** Keeps a link short enough to survive SMS and message previews. */
export const MAX_SHARED_CRITERIA = 12;

/**
 * Encode a build as a compact URL-safe code.
 *
 * Three characters per criterion: body index, sign index (both base-36),
 * and one priority letter. A six-placement build is 18 characters.
 *
 * Returns '' for a build with nothing shareable in it, so callers can
 * refuse to produce a link that would open to an empty card.
 */
export function encodeBuild(criteria: BuildCriterion[]): string {
  const parts: string[] = [];

  for (const c of criteria.slice(0, MAX_SHARED_CRITERIA)) {
    const bodyIdx = SHARE_BODIES.indexOf(c.body as typeof SHARE_BODIES[number]);
    const signIdx = SHARE_SIGNS.indexOf(c.sign as typeof SHARE_SIGNS[number]);
    const priority = PRIORITY_CHAR[c.priority];
    // Skip anything we cannot represent rather than emitting a code that
    // decodes to something the sender did not build.
    if (bodyIdx < 0 || signIdx < 0 || !priority) continue;
    parts.push(bodyIdx.toString(36) + signIdx.toString(36) + priority);
  }

  return parts.join('');
}

/**
 * Decode a shared code. Returns [] for anything malformed — a shared
 * link is untrusted input and must never throw into a page render.
 */
export function decodeBuild(code: string): BuildCriterion[] {
  if (!code || typeof code !== 'string') return [];

  const clean = code.trim();
  if (clean.length % 3 !== 0) return [];
  if (clean.length > MAX_SHARED_CRITERIA * 3) return [];

  const out: BuildCriterion[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < clean.length; i += 3) {
    const bodyIdx = parseInt(clean[i], 36);
    const signIdx = parseInt(clean[i + 1], 36);
    const priority = CHAR_PRIORITY[clean[i + 2]];

    if (!Number.isInteger(bodyIdx) || !Number.isInteger(signIdx) || !priority) return [];
    const body = SHARE_BODIES[bodyIdx];
    const sign = SHARE_SIGNS[signIdx];
    if (!body || !sign) return [];

    // A duplicated body+sign would render twice on the card.
    const key = `${body}|${sign}|${priority}`;
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({ body, sign, priority });
  }

  return out;
}

/** Human summary for the share message and the card headline. */
export function describeBuild(criteria: BuildCriterion[], limit = 4): string {
  const positive = criteria.filter(c => c.priority !== 'avoid');
  const shown = positive.slice(0, limit)
    .map(c => `${c.sign} ${c.body}`)
    .join(' · ');
  const extra = positive.length - Math.min(limit, positive.length);
  return extra > 0 ? `${shown} +${extra} more` : shown;
}

/**
 * How closely one person's placements satisfy a shared build.
 *
 * This is the recipient side of "How close are you?" — deliberately the
 * same shape the sender's own results use, so the number a friend sees
 * means the same thing as the number in the app.
 */
export function scoreAgainstSharedBuild(
  criteria: BuildCriterion[],
  placements: Record<string, string>,
): { hit: BuildCriterion[]; missed: BuildCriterion[]; percent: number } {
  const hit: BuildCriterion[] = [];
  const missed: BuildCriterion[] = [];

  for (const c of criteria) {
    const actual = placements[c.body];
    const present = actual === c.sign;
    // AVOID inverts: not having it is the hit.
    const good = c.priority === 'avoid' ? !present : present;
    (good ? hit : missed).push(c);
  }

  const total = criteria.length;
  const percent = total === 0 ? 0 : Math.round((hit.length / total) * 100);
  return { hit, missed, percent };
}
