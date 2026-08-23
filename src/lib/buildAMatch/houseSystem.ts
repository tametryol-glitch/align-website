// ═══════════════════════════════════════════════════════════════════
// Build-A-Match — House Overlay System (web)
//
// EXACT MIRROR of align-app/src/services/buildAMatch/houseSystem.ts.
// The Whole Sign offset must stay identical or the two platforms would
// place the same planet in different houses.
//
// "What do you want this person to DO in your life?"
//
// PURE MODULE. No Supabase, no React Native, no network — so it stays
// unit-testable in plain Node.
//
// ─── The arithmetic that makes this free ───────────────────────────
//
// Align indexes every chart in WHOLE SIGN, where a house IS a sign. If
// Leo rises for you, your 5th house is Sagittarius — exactly, with no
// cusp ambiguity. So:
//
//     "their Venus in my 5th house"  ≡  "their Venus in Sagittarius"
//
// ...for you specifically. A house criterion is a sign criterion with a
// personal offset. That means house search needs no new astrology, no
// new columns, no new indexes, and no new RPC — it translates into the
// criteria the existing search already takes.
//
// ─── Provenance ────────────────────────────────────────────────────
//
// House semantics come from BUILD_A_MATCH_HOUSE_SYSTEM.md. Houses 2, 5,
// 6 and 8 are the founder's own chart findings and OVERRIDE published
// convention:
//   • 2nd = YOUR assets and self-worth
//   • 8th = another person's money reaching you (bills), and passionate,
//           consuming sex
//   • 5th = romantic, playful, FUN sex
//   • 6th = healing, the body, daily repair
// Do not "correct" these toward textbook readings.
// ═══════════════════════════════════════════════════════════════════

import type { BuildCriterion, Priority, StoredPriority } from './types';

/** Zodiac order. Index 0 = Aries, matching planet_placement_index.sign_number. */
export const SIGN_ORDER = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

export type HouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// ─── The arithmetic ─────────────────────────────────────────────────

/**
 * Which sign occupies house N for someone with this rising sign?
 * Whole Sign: house 1 IS the rising sign, and each house after it is the
 * next sign. Exact, not an approximation.
 */
export function signForHouse(house: HouseNumber, risingSign: string): string | null {
  const rise = SIGN_ORDER.indexOf(risingSign as typeof SIGN_ORDER[number]);
  if (rise < 0) return null;
  if (house < 1 || house > 12) return null;
  return SIGN_ORDER[(rise + house - 1) % 12];
}

/**
 * The reverse: a planet sits in this sign — which of MY houses does it
 * land in? This is what turns a candidate's raw placement into "lands in
 * your 8th".
 */
export function houseOfSign(signName: string, risingSign: string): HouseNumber | null {
  const sign = SIGN_ORDER.indexOf(signName as typeof SIGN_ORDER[number]);
  const rise = SIGN_ORDER.indexOf(risingSign as typeof SIGN_ORDER[number]);
  if (sign < 0 || rise < 0) return null;
  return (((sign - rise + 12) % 12) + 1) as HouseNumber;
}

// ─── House definitions ──────────────────────────────────────────────

export interface HouseDefinition {
  house: HouseNumber;
  /** Short label for the UI. */
  title: string;
  /** What this house governs, in Align's system. */
  domains: string;
  /** True when the founder specified this house directly. */
  founderDefined?: boolean;
}

export const HOUSES: Record<HouseNumber, HouseDefinition> = {
  1:  { house: 1,  title: 'Self, body, presence',
        domains: 'identity, appearance, vitality, how you come across, the edge you lead with' },
  2:  { house: 2,  title: 'Your worth, your assets', founderDefined: true,
        domains: 'what you earn, own and value; self-worth; what is yours' },
  3:  { house: 3,  title: 'Daily mind, conversation',
        domains: 'communication, thinking out loud, siblings, short journeys, everyday talk' },
  4:  { house: 4,  title: 'Home, roots, safety',
        domains: 'home, family, private life, emotional foundation, being unguarded' },
  5:  { house: 5,  title: 'Romance, play, children', founderDefined: true,
        domains: 'delight, flirtation, courtship, creativity, children; sex as joy — light and playful' },
  6:  { house: 6,  title: 'Healing, body, daily repair', founderDefined: true,
        domains: 'health, healing, routine, work habits, service, small daily improvement' },
  7:  { house: 7,  title: 'Partnership, commitment',
        domains: 'the committed other, marriage, contracts, one-to-one relating, open enemies' },
  8:  { house: 8,  title: 'Shared resources, transformation', founderDefined: true,
        domains: "other people's money and help with your bills, debt, inheritance, merging, crisis; sex as consuming — the kind that changes you" },
  9:  { house: 9,  title: 'Meaning, expansion, belief',
        domains: 'philosophy, higher learning, travel, foreign worlds, the search for truth' },
  10: { house: 10, title: 'Career, standing, legacy',
        domains: 'public reputation, authority, ambition, what you are known for' },
  11: { house: 11, title: 'Friendship, community, the future',
        domains: 'friends, networks, chosen family, hopes, collective belonging' },
  12: { house: 12, title: 'The hidden, the buried, the fated',
        domains: 'the unconscious, solitude, endings, dreams, secrets, what you cannot see about yourself' },
};

// ─── Searchable outcomes ────────────────────────────────────────────

export interface Outcome {
  id: string;
  /** What the user reads and picks. Plain language, no astrology. */
  label: string;
  /** One line of context under the label. */
  hint: string;
  /** The house(s) this outcome activates. Several outcomes span more than one. */
  houses: HouseNumber[];
  /**
   * The bodies that carry this outcome, most telling first. The first is
   * promoted to MUST when the user marks the whole outcome as a must-have;
   * the rest stay preferred so the pool does not collapse.
   */
  bodies: string[];
}

/**
 * The outcome catalogue. This is the front door — someone with no
 * astrological vocabulary can answer every one of these.
 */
export const OUTCOMES: Outcome[] = [
  // ── 1st ──
  { id: 'chemistry_on_sight', label: 'Instant chemistry on sight',
    hint: 'They react to your face and your body before they know anything about you',
    houses: [1], bodies: ['Venus', 'Mars', 'Lilith', 'Sun'] },
  { id: 'feel_like_myself', label: 'Someone who makes me feel like myself',
    hint: 'You stop performing around them',
    houses: [1], bodies: ['Sun', 'Jupiter', 'Venus'] },

  // ── 2nd (founder-defined) ──
  { id: 'raises_my_worth', label: 'Someone who raises my worth',
    hint: 'They change what you believe you are worth — and often what you charge',
    houses: [2], bodies: ['Jupiter', 'Venus', 'Sun', 'Vesta'] },
  { id: 'build_whats_mine', label: "Someone who helps me build what's mine",
    hint: 'Your assets, your earning, your own name on it',
    houses: [2], bodies: ['Saturn', 'Jupiter', 'Vesta', 'Ceres'] },

  // ── 3rd ──
  { id: 'talk_endlessly', label: 'Someone I can talk to endlessly',
    hint: 'The conversation never runs out',
    houses: [3], bodies: ['Mercury', 'Uranus', 'Moon', 'Jupiter'] },
  { id: 'teaches_me', label: 'Someone who teaches me',
    hint: 'You leave every conversation knowing something you did not',
    houses: [3], bodies: ['Mercury', 'Jupiter', 'Pallas'] },

  // ── 4th ──
  { id: 'build_a_home', label: 'Someone to build a home with',
    hint: 'Not a date — an address',
    houses: [4], bodies: ['Moon', 'Saturn', 'Ceres', 'Venus'] },
  { id: 'feels_like_family', label: 'Someone who feels like family',
    hint: 'Recognition, not introduction',
    houses: [4], bodies: ['Moon', 'Ceres', 'Jupiter'] },
  { id: 'unguarded', label: 'Someone I can be unguarded with',
    hint: 'You do not manage yourself around them',
    houses: [4], bodies: ['Moon', 'Ceres', 'Venus'] },

  // ── 5th (founder-defined) ──
  { id: 'fun_in_bed', label: "Someone who's fun in bed",
    hint: 'Playful, light, laughing — sex as delight',
    houses: [5], bodies: ['Eros', 'Venus', 'Mars', 'Sun'] },
  { id: 'makes_me_playful', label: 'Someone who makes me playful',
    hint: 'You are less serious with them than you are with anyone',
    houses: [5], bodies: ['Sun', 'Venus', 'Jupiter', 'Eros'] },
  { id: 'romance_courtship', label: 'Romance and courtship',
    hint: 'Being pursued, being delighted in',
    houses: [5], bodies: ['Venus', 'Sun', 'Mars'] },

  // ── 6th (founder-defined) ──
  { id: 'helps_me_heal', label: 'Someone who helps me heal',
    hint: 'They find the old thing and work on it with you',
    houses: [6, 12, 8], bodies: ['Chiron', 'Ceres', 'Moon', 'Vesta'] },
  { id: 'takes_care_of_my_body', label: 'Someone who takes care of my body',
    hint: 'Food, rest, the physical facts of you',
    houses: [6], bodies: ['Ceres', 'Vesta', 'Moon', 'Saturn'] },
  { id: 'order_to_my_chaos', label: 'Someone who brings order to my chaos',
    hint: 'Your days start working',
    houses: [6], bodies: ['Saturn', 'Mercury', 'Vesta', 'Pallas'] },

  // ── 7th ──
  { id: 'someone_who_commits', label: 'Someone who commits',
    hint: 'They stay, and they say so',
    houses: [7], bodies: ['Juno', 'Saturn', 'Sun', 'Venus'] },
  { id: 'marriage_material', label: 'Marriage material',
    hint: 'Built to last, not built to thrill',
    houses: [7], bodies: ['Juno', 'Saturn', 'Moon', 'Venus'] },
  { id: 'balances_me', label: 'Someone who balances me',
    hint: 'They are what you are not, and it works',
    houses: [7], bodies: ['Venus', 'Sun', 'Moon'] },

  // ── 8th (founder-defined) ──
  { id: 'helps_with_bills', label: 'Someone who helps carry my bills',
    hint: "Their money reaching your life — real, material support",
    houses: [8], bodies: ['Jupiter', 'Venus', 'Pluto', 'Saturn'] },
  { id: 'supports_me_materially', label: 'Someone who supports me materially',
    hint: 'Shared resources, not separate accounts',
    houses: [8], bodies: ['Jupiter', 'Venus', 'Ceres'] },
  { id: 'passionate_sex', label: 'Passionate, consuming sex',
    hint: 'The kind that changes you — heavy, not light',
    houses: [8], bodies: ['Pluto', 'Mars', 'Eros', 'Lilith'] },
  { id: 'transforms_me', label: 'Someone who transforms me',
    hint: 'You will not be the same person afterward',
    houses: [8], bodies: ['Pluto', 'Mars', 'Moon'] },

  // ── 9th ──
  { id: 'expands_my_world', label: 'Someone who expands my world',
    hint: 'Your life gets bigger, not just fuller',
    houses: [9], bodies: ['Jupiter', 'Uranus', 'Sun', 'Mercury'] },
  { id: 'travel_with', label: 'Someone to travel with',
    hint: 'Movement, distance, elsewhere',
    houses: [9], bodies: ['Jupiter', 'Uranus', 'North Node'] },

  // ── 10th ──
  { id: 'elevates_my_career', label: 'Someone who elevates my career',
    hint: 'Doors, introductions, standing',
    houses: [10], bodies: ['Jupiter', 'Sun', 'Saturn', 'Pallas'] },
  { id: 'power_couple', label: 'A power couple',
    hint: 'Visible together, ambitious together',
    houses: [10], bodies: ['Sun', 'Mars', 'Jupiter', 'Saturn'] },

  // ── 11th ──
  { id: 'best_friend', label: 'Someone who becomes my best friend',
    hint: 'Lover second, friend first',
    houses: [11], bodies: ['Uranus', 'Venus', 'Sun', 'Jupiter'] },
  { id: 'brings_me_community', label: 'Someone who brings me into a community',
    hint: 'You gain their people',
    houses: [11], bodies: ['Jupiter', 'Sun', 'Uranus'] },

  // ── 12th ──
  { id: 'sees_what_i_hide', label: 'Someone who sees what I hide',
    hint: 'They notice the thing you have never said out loud',
    houses: [12], bodies: ['Psyche', 'Neptune', 'Moon', 'Chiron'] },
  { id: 'feels_fated', label: 'Someone who feels fated',
    hint: 'Recognition you cannot explain',
    houses: [12], bodies: ['South Node', 'Psyche', 'Neptune', 'North Node'] },

  // ── Cross-house ──
  { id: 'raise_children_together', label: 'Someone to raise children with',
    hint: 'The children, the home, and whether the partnership survives both',
    houses: [5, 4, 7], bodies: ['Ceres', 'Moon', 'Jupiter', 'Juno', 'Saturn'] },
  { id: 'financial_partnership', label: 'A real financial partnership',
    hint: 'They raise your worth and they carry weight with you',
    houses: [2, 8], bodies: ['Jupiter', 'Saturn', 'Venus'] },
];

export function outcomeById(id: string): Outcome | undefined {
  return OUTCOMES.find(o => o.id === id);
}

/** Outcomes grouped for the picker, in house order. */
export function outcomesForHouse(house: HouseNumber): Outcome[] {
  return OUTCOMES.filter(o => o.houses[0] === house);
}

// ─── Translation: outcomes → the criteria the existing search takes ──

/**
 * Expand a chosen outcome into ordinary sign criteria for this viewer.
 *
 * The bodies all land on the SAME house, so they all translate to the
 * same sign — the outcome becomes "several of their bodies in one sign
 * of mine". Build Fit then ranks by how many of them actually landed,
 * which is exactly the right behaviour: four healing bodies in your 6th
 * outranks one.
 *
 * Only the FIRST body is promoted to must-have, and only when the user
 * marked the whole outcome as a must. Making every body a must would
 * drive almost every search to zero.
 */
export function outcomeToCriteria(
  outcome: Outcome,
  risingSign: string,
  priority: Priority,
): BuildCriterion[] {
  if (priority === 'any') return [];

  const out: BuildCriterion[] = [];
  outcome.houses.forEach((house, houseIdx) => {
    const sign = signForHouse(house, risingSign);
    if (!sign) return;

    outcome.bodies.forEach((body, bodyIdx) => {
      // Promote only the primary body of the primary house.
      const isPrimary = houseIdx === 0 && bodyIdx === 0;
      const p: StoredPriority =
        priority === 'avoid' ? 'avoid'
        : priority === 'must' && isPrimary ? 'must'
        : 'preferred';
      out.push({ body, sign, priority: p });
    });
  });

  return dedupeCriteria(out);
}

/**
 * The same body can appear in two selected outcomes. Keep the strongest
 * priority for each body+sign pair — must beats preferred beats avoid's
 * separate lane — so a body is never both required and merely liked.
 */
export function dedupeCriteria(criteria: BuildCriterion[]): BuildCriterion[] {
  const rank: Record<StoredPriority, number> = { must: 3, preferred: 2, avoid: 1 };
  const map = new Map<string, BuildCriterion>();
  for (const c of criteria) {
    const key = `${c.body}|${c.sign}|${c.priority === 'avoid' ? 'avoid' : 'positive'}`;
    const existing = map.get(key);
    if (!existing || rank[c.priority] > rank[existing.priority]) map.set(key, c);
  }
  return Array.from(map.values());
}

/** A direct house pick, for users who do know the astrology. */
export interface HouseCriterion {
  body: string;
  house: HouseNumber;
  priority: StoredPriority;
}

export function houseCriterionToSign(
  c: HouseCriterion,
  risingSign: string,
): BuildCriterion | null {
  const sign = signForHouse(c.house, risingSign);
  if (!sign) return null;
  return { body: c.body, sign, priority: c.priority };
}

// ─── Reading the result back ────────────────────────────────────────

/**
 * Given a candidate's placements and the viewer's rising sign, report
 * which of the viewer's houses each body lands in. This is what turns
 * "their Venus in Sagittarius" back into "their Venus lands in your 5th".
 */
export function overlaysFor(
  candidatePlacements: Record<string, string>,
  risingSign: string,
): Array<{ body: string; sign: string; house: HouseNumber }> {
  const out: Array<{ body: string; sign: string; house: HouseNumber }> = [];
  for (const [body, sign] of Object.entries(candidatePlacements)) {
    const house = houseOfSign(sign, risingSign);
    if (house) out.push({ body, sign, house });
  }
  return out;
}

/** Which of the picked outcomes did this candidate actually deliver? */
export function outcomeHits(
  outcome: Outcome,
  candidatePlacements: Record<string, string>,
  risingSign: string,
): { hit: string[]; missed: string[] } {
  const hit: string[] = [];
  const missed: string[] = [];
  for (const body of outcome.bodies) {
    const sign = candidatePlacements[body];
    const house = sign ? houseOfSign(sign, risingSign) : null;
    if (house && outcome.houses.includes(house)) hit.push(body);
    else missed.push(body);
  }
  return { hit, missed };
}
