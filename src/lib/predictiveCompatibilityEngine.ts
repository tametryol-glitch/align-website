/**
 * Predictive Compatibility Engine
 *
 * Pure function module for ML-style compatibility scoring that goes beyond
 * basic synastry by incorporating behavioral signals. No side effects,
 * no imports from stores, no UI dependencies.
 *
 * Scoring formula (weighted blend):
 *   SCORE = (synastryBase * 0.40) + (cosmicDnaSimilarity * 0.20)
 *         + (communicationMatch * 0.15) + (emotionalCompat * 0.15)
 *         + (valuesAlignment * 0.10)
 *
 * When behavioral data is unavailable, the score uses only the first
 * three astrological components (re-weighted to sum to 1.0).
 */

import { cosineSimilarity } from './cosmicDnaEngine';
import type { CosmicDNA } from './cosmicDnaEngine';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Behavioral signals from app usage patterns. */
export interface BehavioralSignals {
  /** Average message response time in minutes. */
  avgResponseTime?: number;
  /** Messages sent per day average. */
  messagesPerDay?: number;
  /** Ratio of reactions sent to messages received (0-1). */
  reactionRate?: number;
  /** How often they initiate conversations (0-1). */
  initiationRate?: number;
  /** Average message length in characters. */
  avgMessageLength?: number;
  /** Emoji usage frequency (0-1). */
  emojiRate?: number;
}

/** User profile data needed for compatibility scoring. */
export interface UserProfile {
  /** Sun sign index (0-11). */
  sunSign: number;
  /** Moon sign index (0-11). */
  moonSign: number;
  /** Mercury sign index (0-11). */
  mercurySign: number;
  /** Venus sign index (0-11). */
  venusSign: number;
  /** Mars sign index (0-11). */
  marsSign: number;
  /** Jupiter sign index (0-11). */
  jupiterSign: number;
  /** Saturn sign index (0-11). */
  saturnSign: number;
  /** Rising/Ascendant sign index (0-11). */
  risingSign: number;
  /** Pre-computed Cosmic DNA vector. */
  cosmicDNA: CosmicDNA;
  /** Optional behavioral signals from app usage. */
  behavioral?: BehavioralSignals;
}

/** Detailed score breakdown by category. */
export interface CompatibilityBreakdown {
  /** Overall composite score (0-100). */
  overall: number;
  /** Astrological synastry base score (0-100). */
  synastryBase: number;
  /** Cosmic DNA cosine similarity score (0-100). */
  cosmicDnaSimilarity: number;
  /** Communication style compatibility (0-100). */
  communicationMatch: number;
  /** Emotional compatibility (0-100). */
  emotionalCompat: number;
  /** Values and life philosophy alignment (0-100). */
  valuesAlignment: number;
}

/** Predicted relationship trend direction. */
export type RelationshipTrend = 'rising' | 'stable' | 'challenging';

/** Complete predictive compatibility result. */
export interface PredictiveScore {
  /** Overall compatibility score (0-100). */
  score: number;
  /** Per-category breakdown. */
  breakdown: CompatibilityBreakdown;
  /** Predicted trend based on current transits. */
  trend?: RelationshipTrend;
  /** Top relationship strengths. */
  strengths: string[];
  /** Areas that may need attention. */
  challenges: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Component weights when behavioral data is available. */
const WEIGHTS_FULL = {
  synastry: 0.40,
  cosmicDna: 0.20,
  communication: 0.15,
  emotional: 0.15,
  values: 0.10,
} as const;

/** Component weights when behavioral data is absent. */
const WEIGHTS_ASTRO_ONLY = {
  synastry: 0.50,
  cosmicDna: 0.30,
  communication: 0.00,
  emotional: 0.20,
  values: 0.00,
} as const;

/**
 * Sign compatibility matrix.
 * Key: element relationship. Value: base harmony score.
 */
const ELEMENT_COMPATIBILITY: Record<string, number> = {
  same_sign: 0.70,
  same_element: 0.85,
  compatible: 0.75,  // Fire<->Air, Earth<->Water
  square: 0.50,      // Adjacent incompatible elements
  opposition: 0.65,  // Tension but attraction
};

/** Element for each sign index (0-11). */
const SIGN_ELEMENTS: Array<'fire' | 'earth' | 'air' | 'water'> = [
  'fire', 'earth', 'air', 'water',
  'fire', 'earth', 'air', 'water',
  'fire', 'earth', 'air', 'water',
];

/** Compatible element pairings. */
const COMPATIBLE_ELEMENTS: Record<string, string> = {
  fire: 'air',
  air: 'fire',
  earth: 'water',
  water: 'earth',
};

/** Square element pairings (challenging). */
const SQUARE_ELEMENTS: Record<string, string[]> = {
  fire: ['earth', 'water'],
  earth: ['fire', 'air'],
  air: ['earth', 'water'],
  water: ['fire', 'air'],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Clamp a value into the [0, 100] range.
 */
function clamp100(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * Get the element-based compatibility between two sign indices.
 *
 * @param signA - First sign index (0-11).
 * @param signB - Second sign index (0-11).
 * @returns Harmony score (0-1).
 */
function signHarmony(signA: number, signB: number): number {
  // Same sign
  if (signA === signB) return ELEMENT_COMPATIBILITY.same_sign;

  // Opposite signs (6 signs apart)
  if (Math.abs(signA - signB) === 6) return ELEMENT_COMPATIBILITY.opposition;

  const elementA = SIGN_ELEMENTS[signA % 12];
  const elementB = SIGN_ELEMENTS[signB % 12];

  // Same element
  if (elementA === elementB) return ELEMENT_COMPATIBILITY.same_element;

  // Compatible elements (Fire<->Air, Earth<->Water)
  if (COMPATIBLE_ELEMENTS[elementA] === elementB) {
    return ELEMENT_COMPATIBILITY.compatible;
  }

  // Square elements
  if (SQUARE_ELEMENTS[elementA]?.includes(elementB)) {
    return ELEMENT_COMPATIBILITY.square;
  }

  // Default moderate compatibility
  return 0.60;
}

/**
 * Calculate communication style similarity from Mercury signs and behavior.
 */
function communicationScore(
  userA: UserProfile,
  userB: UserProfile,
): number {
  // Mercury sign harmony (base)
  const mercuryHarmony = signHarmony(userA.mercurySign, userB.mercurySign);
  let score = mercuryHarmony * 100;

  // If both have behavioral data, factor in communication patterns.
  if (userA.behavioral && userB.behavioral) {
    const behaviorScore = computeBehavioralCommunication(
      userA.behavioral,
      userB.behavioral,
    );
    // Blend: 60% astrology, 40% behavioral
    score = score * 0.6 + behaviorScore * 0.4;
  }

  return clamp100(score);
}

/**
 * Compute behavioral communication compatibility.
 */
function computeBehavioralCommunication(
  a: BehavioralSignals,
  b: BehavioralSignals,
): number {
  let totalWeight = 0;
  let weightedSum = 0;

  // Response time similarity (closer = better)
  if (a.avgResponseTime !== undefined && b.avgResponseTime !== undefined) {
    const maxRT = Math.max(a.avgResponseTime, b.avgResponseTime, 1);
    const rtSimilarity = 1 - Math.abs(a.avgResponseTime - b.avgResponseTime) / maxRT;
    weightedSum += rtSimilarity * 100 * 2;
    totalWeight += 2;
  }

  // Message frequency similarity
  if (a.messagesPerDay !== undefined && b.messagesPerDay !== undefined) {
    const maxMPD = Math.max(a.messagesPerDay, b.messagesPerDay, 1);
    const mpdSimilarity = 1 - Math.abs(a.messagesPerDay - b.messagesPerDay) / maxMPD;
    weightedSum += mpdSimilarity * 100 * 1.5;
    totalWeight += 1.5;
  }

  // Message length similarity
  if (a.avgMessageLength !== undefined && b.avgMessageLength !== undefined) {
    const maxLen = Math.max(a.avgMessageLength, b.avgMessageLength, 1);
    const lenSimilarity = 1 - Math.abs(a.avgMessageLength - b.avgMessageLength) / maxLen;
    weightedSum += lenSimilarity * 100;
    totalWeight += 1;
  }

  // Emoji rate similarity
  if (a.emojiRate !== undefined && b.emojiRate !== undefined) {
    const emojiSimilarity = 1 - Math.abs(a.emojiRate - b.emojiRate);
    weightedSum += emojiSimilarity * 100 * 0.5;
    totalWeight += 0.5;
  }

  if (totalWeight === 0) return 50; // neutral fallback
  return clamp100(weightedSum / totalWeight);
}

/**
 * Calculate emotional compatibility from Moon signs and reaction patterns.
 */
function emotionalScore(
  userA: UserProfile,
  userB: UserProfile,
): number {
  // Moon sign harmony (primary indicator of emotional needs)
  const moonHarmony = signHarmony(userA.moonSign, userB.moonSign);

  // Sun-Moon cross harmony (emotional understanding)
  const sunMoonCross =
    (signHarmony(userA.sunSign, userB.moonSign) +
      signHarmony(userB.sunSign, userA.moonSign)) / 2;

  // Blend: 60% Moon-Moon, 40% Sun-Moon cross
  let score = (moonHarmony * 0.6 + sunMoonCross * 0.4) * 100;

  // Behavioral adjustment for reaction patterns
  if (userA.behavioral?.reactionRate !== undefined && userB.behavioral?.reactionRate !== undefined) {
    const reactionSimilarity = 1 - Math.abs(
      userA.behavioral.reactionRate - userB.behavioral.reactionRate,
    );
    score = score * 0.75 + reactionSimilarity * 100 * 0.25;
  }

  return clamp100(score);
}

/**
 * Calculate values alignment from Jupiter and Saturn positions.
 */
function valuesScore(userA: UserProfile, userB: UserProfile): number {
  // Jupiter: expansion, beliefs, philosophy
  const jupiterHarmony = signHarmony(userA.jupiterSign, userB.jupiterSign);

  // Saturn: structure, discipline, long-term goals
  const saturnHarmony = signHarmony(userA.saturnSign, userB.saturnSign);

  // Jupiter-Saturn cross (shared growth direction)
  const crossHarmony =
    (signHarmony(userA.jupiterSign, userB.saturnSign) +
      signHarmony(userB.jupiterSign, userA.saturnSign)) / 2;

  // Weight: Jupiter (beliefs) 40%, Saturn (structure) 35%, Cross 25%
  const score =
    jupiterHarmony * 40 + saturnHarmony * 35 + crossHarmony * 25;

  return clamp100(score);
}

/**
 * Compute the astrological synastry base score.
 *
 * Considers: Sun-Moon harmony, Venus-Mars aspects, Rising compatibility.
 */
function synastryBaseScore(userA: UserProfile, userB: UserProfile): number {
  // Sun-Moon harmony (emotional bond foundation)
  const sunMoon =
    (signHarmony(userA.sunSign, userB.moonSign) +
      signHarmony(userB.sunSign, userA.moonSign)) / 2;

  // Venus-Mars aspects (romantic/physical chemistry)
  const venusMars =
    (signHarmony(userA.venusSign, userB.marsSign) +
      signHarmony(userB.venusSign, userA.marsSign)) / 2;

  // Rising compatibility (first impression, public persona)
  const rising = signHarmony(userA.risingSign, userB.risingSign);

  // Sun-Sun (core identity alignment)
  const sunSun = signHarmony(userA.sunSign, userB.sunSign);

  // Venus-Venus (love language alignment)
  const venusVenus = signHarmony(userA.venusSign, userB.venusSign);

  // Weighted blend
  const score =
    sunMoon * 25 + venusMars * 30 + rising * 15 + sunSun * 15 + venusVenus * 15;

  return clamp100(score);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Predict compatibility between two users with an enhanced ML-style score.
 *
 * Blends astrological synastry with Cosmic DNA similarity and optional
 * behavioral signals for a holistic compatibility assessment.
 *
 * @param userA          - First user's profile data.
 * @param userB          - Second user's profile data.
 * @param behavioralData - Optional override behavioral signals (merged with profile).
 * @returns Overall compatibility score (0-100).
 */
export function predictCompatibility(
  userA: UserProfile,
  userB: UserProfile,
  behavioralData?: { a?: BehavioralSignals; b?: BehavioralSignals },
): number {
  // Merge behavioral data if provided as override.
  const profileA = behavioralData?.a
    ? { ...userA, behavioral: { ...userA.behavioral, ...behavioralData.a } }
    : userA;
  const profileB = behavioralData?.b
    ? { ...userB, behavioral: { ...userB.behavioral, ...behavioralData.b } }
    : userB;

  const breakdown = getCompatibilityBreakdown(profileA, profileB);
  return breakdown.overall;
}

/**
 * Get a detailed breakdown of compatibility scores by category.
 *
 * When behavioral data is present on both users, uses full weights.
 * Otherwise, re-weights to use only astrological components.
 *
 * @param userA - First user's profile data.
 * @param userB - Second user's profile data.
 * @returns CompatibilityBreakdown with per-category and overall scores.
 */
export function getCompatibilityBreakdown(
  userA: UserProfile,
  userB: UserProfile,
): CompatibilityBreakdown {
  const synastry = synastryBaseScore(userA, userB);
  const cosmicDna = cosineSimilarity(userA.cosmicDNA, userB.cosmicDNA) * 100;
  const communication = communicationScore(userA, userB);
  const emotional = emotionalScore(userA, userB);
  const values = valuesScore(userA, userB);

  // Determine which weights to use based on behavioral data availability.
  const hasBehavioral = !!(userA.behavioral && userB.behavioral);
  const weights = hasBehavioral ? WEIGHTS_FULL : WEIGHTS_ASTRO_ONLY;

  const overall = clamp100(
    synastry * weights.synastry +
    cosmicDna * weights.cosmicDna +
    communication * weights.communication +
    emotional * weights.emotional +
    values * weights.values,
  );

  return {
    overall,
    synastryBase: Math.round(synastry),
    cosmicDnaSimilarity: Math.round(cosmicDna),
    communicationMatch: Math.round(communication),
    emotionalCompat: Math.round(emotional),
    valuesAlignment: Math.round(values),
  };
}

/**
 * Predict the relationship trend based on compatibility and current transits.
 *
 * Uses the overall compatibility score combined with transit energy to
 * determine whether the relationship is currently in a rising, stable,
 * or challenging phase.
 *
 * @param compatibility - Overall compatibility score (0-100).
 * @param currentTransits - Object with transit indicators (optional keys).
 * @returns The predicted trend: 'rising', 'stable', or 'challenging'.
 */
export function predictRelationshipTrend(
  compatibility: number,
  currentTransits?: {
    /** Venus transit harmony (0-1). */
    venusHarmony?: number;
    /** Mars transit intensity (0-1). */
    marsIntensity?: number;
    /** Saturn transit pressure (0-1). */
    saturnPressure?: number;
    /** Jupiter transit expansion (0-1). */
    jupiterExpansion?: number;
  },
): RelationshipTrend {
  if (!currentTransits) {
    // Without transit data, base purely on compatibility strength.
    if (compatibility >= 70) return 'rising';
    if (compatibility >= 45) return 'stable';
    return 'challenging';
  }

  const {
    venusHarmony = 0.5,
    marsIntensity = 0.5,
    saturnPressure = 0.3,
    jupiterExpansion = 0.5,
  } = currentTransits;

  // Positive forces: Venus harmony + Jupiter expansion
  const positiveForce = (venusHarmony + jupiterExpansion) / 2;

  // Challenging forces: Saturn pressure + excessive Mars
  const challengeForce = (saturnPressure + Math.max(0, marsIntensity - 0.6)) / 2;

  // Net momentum
  const momentum = positiveForce - challengeForce;

  // Combine with base compatibility
  const trendScore = compatibility / 100 * 0.6 + (momentum + 0.5) * 0.4;

  if (trendScore >= 0.65) return 'rising';
  if (trendScore >= 0.40) return 'stable';
  return 'challenging';
}

/**
 * Extract the top 3 relationship strengths from a compatibility breakdown.
 *
 * Returns human-readable strings describing what the pair excels at.
 *
 * @param breakdown - A CompatibilityBreakdown from getCompatibilityBreakdown.
 * @returns Array of up to 3 strength descriptions.
 */
export function getStrengths(breakdown: CompatibilityBreakdown): string[] {
  const categories: Array<{ key: string; score: number; label: string }> = [
    { key: 'synastry', score: breakdown.synastryBase, label: 'Natural astrological chemistry and attraction' },
    { key: 'cosmicDna', score: breakdown.cosmicDnaSimilarity, label: 'Deep cosmic resonance and soul-level alignment' },
    { key: 'communication', score: breakdown.communicationMatch, label: 'Effortless communication and mental stimulation' },
    { key: 'emotional', score: breakdown.emotionalCompat, label: 'Emotional depth and intuitive understanding' },
    { key: 'values', score: breakdown.valuesAlignment, label: 'Shared life philosophy and long-term vision' },
  ];

  // Sort by score descending and take top 3.
  categories.sort((a, b) => b.score - a.score);

  return categories
    .slice(0, 3)
    .filter((c) => c.score >= 50) // Only include genuinely strong areas
    .map((c) => c.label);
}

/**
 * Extract the top 2 areas that may need attention from a compatibility breakdown.
 *
 * Returns human-readable strings describing growth areas.
 *
 * @param breakdown - A CompatibilityBreakdown from getCompatibilityBreakdown.
 * @returns Array of up to 2 challenge descriptions.
 */
export function getChallenges(breakdown: CompatibilityBreakdown): string[] {
  const categories: Array<{ key: string; score: number; label: string }> = [
    { key: 'synastry', score: breakdown.synastryBase, label: 'Building initial spark may require conscious effort' },
    { key: 'cosmicDna', score: breakdown.cosmicDnaSimilarity, label: 'Different cosmic blueprints call for patience and acceptance' },
    { key: 'communication', score: breakdown.communicationMatch, label: 'Communication styles differ — practice active listening' },
    { key: 'emotional', score: breakdown.emotionalCompat, label: 'Emotional needs may not always align — express them clearly' },
    { key: 'values', score: breakdown.valuesAlignment, label: 'Life goals may diverge — find shared anchors early' },
  ];

  // Sort by score ascending (lowest = most challenging) and take top 2.
  categories.sort((a, b) => a.score - b.score);

  return categories
    .slice(0, 2)
    .filter((c) => c.score < 65) // Only flag genuinely weak areas
    .map((c) => c.label);
}
