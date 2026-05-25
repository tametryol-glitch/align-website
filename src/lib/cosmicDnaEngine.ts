/**
 * Cosmic DNA Embeddings Engine
 *
 * Pure function module for converting natal chart data into a 48-dimensional
 * numeric vector ("Cosmic DNA") for fast similarity matching. No side effects,
 * no imports from stores, no UI dependencies.
 *
 * Vector dimensions (48 total):
 *   [0-11]  Sign positions: planet sign index normalized to 0-1
 *   [12-23] House positions: planet house normalized to 0-1
 *   [24-27] Element balance: Fire, Earth, Air, Water ratios
 *   [28-30] Modality balance: Cardinal, Fixed, Mutable ratios
 *   [31-42] Aspect pattern counts: normalized frequency of each aspect type
 *   [43-47] Special patterns: Grand Trine, T-Square, Grand Cross, Stellium, Retrogrades
 *
 * All values are normalized to the 0-1 range for consistent distance calculations.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A 48-dimensional numeric vector representing a natal chart's cosmic signature. */
export type CosmicDNA = number[];

/** Planetary body identifier. */
export type Planet =
  | 'sun'
  | 'moon'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto'
  | 'northNode'
  | 'rising';

/** Zodiac sign identifier (0-indexed). */
export type ZodiacSign =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';

/** Aspect type between two planets. */
export type AspectType =
  | 'conjunction'
  | 'sextile'
  | 'square'
  | 'trine'
  | 'opposition'
  | 'quincunx'
  | 'semisextile'
  | 'semisquare'
  | 'sesquisquare'
  | 'quintile'
  | 'biquintile'
  | 'parallel';

/** Input chart data required for DNA generation. */
export interface ChartData {
  /** Planet sign placements (0-11 sign index). */
  signs: Record<Planet, number>;
  /** Planet house placements (1-12). */
  houses: Record<Planet, number>;
  /** Aspects detected between planets. */
  aspects: Array<{ planet1: Planet; planet2: Planet; type: AspectType }>;
  /** Which planets are retrograde. */
  retrogrades?: Planet[];
}

/** A match result from similarity search. */
export interface DNAMatch {
  /** Identifier of the matched entity. */
  id: string;
  /** Cosine similarity score (0-1). */
  similarity: number;
  /** The matched entity's Cosmic DNA vector. */
  dna: CosmicDNA;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Total dimensions in the Cosmic DNA vector. */
const DNA_DIMENSIONS = 48;

/** Number of planets tracked in sign/house positions. */
const PLANET_COUNT = 12;

/** Ordered list of planets matching the vector dimension layout. */
const PLANETS: Planet[] = [
  'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter',
  'saturn', 'uranus', 'neptune', 'pluto', 'northNode', 'rising',
];

/** Element for each sign index (0-11). */
const SIGN_ELEMENTS: Array<'fire' | 'earth' | 'air' | 'water'> = [
  'fire', 'earth', 'air', 'water',
  'fire', 'earth', 'air', 'water',
  'fire', 'earth', 'air', 'water',
];

/** Modality for each sign index (0-11). */
const SIGN_MODALITIES: Array<'cardinal' | 'fixed' | 'mutable'> = [
  'cardinal', 'fixed', 'mutable',
  'cardinal', 'fixed', 'mutable',
  'cardinal', 'fixed', 'mutable',
  'cardinal', 'fixed', 'mutable',
];

/** Ordered list of aspect types matching vector dimensions [31-42]. */
const ASPECT_TYPES: AspectType[] = [
  'conjunction', 'sextile', 'square', 'trine', 'opposition', 'quincunx',
  'semisextile', 'semisquare', 'sesquisquare', 'quintile', 'biquintile', 'parallel',
];

/** Element names for fingerprint generation. */
const ELEMENT_NAMES = ['Fire', 'Earth', 'Air', 'Water'] as const;

/** Modality names for fingerprint generation. */
const MODALITY_NAMES = ['Cardinal', 'Fixed', 'Mutable'] as const;

/**
 * Maximum possible aspect count between major planets (10 classical planets,
 * choose 2 = 45 pairs). Used for normalization.
 */
const MAX_ASPECT_COUNT = 45;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Clamp a value into the [0, 1] range.
 */
function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Detect whether the chart contains a Grand Trine (3 planets in trine).
 */
function hasGrandTrine(aspects: ChartData['aspects']): boolean {
  const trines = aspects.filter((a) => a.type === 'trine');
  if (trines.length < 3) return false;

  // Check if any 3 planets form a closed trine loop.
  for (let i = 0; i < trines.length - 2; i++) {
    for (let j = i + 1; j < trines.length - 1; j++) {
      for (let k = j + 1; k < trines.length; k++) {
        const planets = new Set([
          trines[i].planet1, trines[i].planet2,
          trines[j].planet1, trines[j].planet2,
          trines[k].planet1, trines[k].planet2,
        ]);
        if (planets.size === 3) return true;
      }
    }
  }
  return false;
}

/**
 * Detect whether the chart contains a T-Square (2 squares + 1 opposition).
 */
function hasTSquare(aspects: ChartData['aspects']): boolean {
  const squares = aspects.filter((a) => a.type === 'square');
  const oppositions = aspects.filter((a) => a.type === 'opposition');

  for (const opp of oppositions) {
    const oppPlanets = [opp.planet1, opp.planet2];
    // A T-Square apex planet squares both ends of the opposition.
    for (const sq1 of squares) {
      for (const sq2 of squares) {
        if (sq1 === sq2) continue;
        const sq1Planets = [sq1.planet1, sq1.planet2];
        const sq2Planets = [sq2.planet1, sq2.planet2];
        // Find if a single planet squares both opposition endpoints.
        const apex1 = sq1Planets.find((p) => !oppPlanets.includes(p));
        const apex2 = sq2Planets.find((p) => !oppPlanets.includes(p));
        if (apex1 && apex1 === apex2) {
          const sq1Connects = sq1Planets.some((p) => oppPlanets.includes(p));
          const sq2Connects = sq2Planets.some((p) => oppPlanets.includes(p));
          if (sq1Connects && sq2Connects) return true;
        }
      }
    }
  }
  return false;
}

/**
 * Detect whether the chart contains a Grand Cross (4 squares + 2 oppositions).
 */
function hasGrandCross(aspects: ChartData['aspects']): boolean {
  const squares = aspects.filter((a) => a.type === 'square');
  const oppositions = aspects.filter((a) => a.type === 'opposition');
  return squares.length >= 4 && oppositions.length >= 2;
}

/**
 * Count stelliums (3+ planets in the same sign).
 */
function countStelliums(signs: Record<Planet, number>): number {
  const signCounts: Record<number, number> = {};
  for (const planet of PLANETS) {
    const sign = signs[planet] ?? 0;
    signCounts[sign] = (signCounts[sign] ?? 0) + 1;
  }
  return Object.values(signCounts).filter((count) => count >= 3).length;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a 48-dimensional Cosmic DNA vector from natal chart data.
 *
 * The vector encodes sign positions, house positions, element/modality balance,
 * aspect patterns, and special configurations. All values are normalized to 0-1.
 *
 * @param chartData - Complete natal chart data with signs, houses, and aspects.
 * @returns A 48-dimensional numeric vector (CosmicDNA).
 */
export function generateCosmicDNA(chartData: ChartData): CosmicDNA {
  const dna: number[] = new Array(DNA_DIMENSIONS).fill(0);

  // --- Dimensions 0-11: Sign positions (normalized 0-1) ---
  for (let i = 0; i < PLANET_COUNT; i++) {
    const planet = PLANETS[i];
    const signIndex = chartData.signs[planet] ?? 0;
    dna[i] = clamp01(signIndex / 11);
  }

  // --- Dimensions 12-23: House positions (normalized 0-1) ---
  for (let i = 0; i < PLANET_COUNT; i++) {
    const planet = PLANETS[i];
    const house = chartData.houses[planet] ?? 1;
    dna[12 + i] = clamp01((house - 1) / 11);
  }

  // --- Dimensions 24-27: Element balance ---
  const elementCounts = { fire: 0, earth: 0, air: 0, water: 0 };
  for (const planet of PLANETS) {
    const signIndex = chartData.signs[planet] ?? 0;
    const element = SIGN_ELEMENTS[signIndex];
    elementCounts[element]++;
  }
  dna[24] = elementCounts.fire / PLANET_COUNT;
  dna[25] = elementCounts.earth / PLANET_COUNT;
  dna[26] = elementCounts.air / PLANET_COUNT;
  dna[27] = elementCounts.water / PLANET_COUNT;

  // --- Dimensions 28-30: Modality balance ---
  const modalityCounts = { cardinal: 0, fixed: 0, mutable: 0 };
  for (const planet of PLANETS) {
    const signIndex = chartData.signs[planet] ?? 0;
    const modality = SIGN_MODALITIES[signIndex];
    modalityCounts[modality]++;
  }
  dna[28] = modalityCounts.cardinal / PLANET_COUNT;
  dna[29] = modalityCounts.fixed / PLANET_COUNT;
  dna[30] = modalityCounts.mutable / PLANET_COUNT;

  // --- Dimensions 31-42: Aspect pattern counts (normalized) ---
  const aspectCounts: Record<string, number> = {};
  for (const type of ASPECT_TYPES) {
    aspectCounts[type] = 0;
  }
  for (const aspect of chartData.aspects) {
    if (aspectCounts[aspect.type] !== undefined) {
      aspectCounts[aspect.type]++;
    }
  }
  for (let i = 0; i < ASPECT_TYPES.length; i++) {
    dna[31 + i] = clamp01(aspectCounts[ASPECT_TYPES[i]] / MAX_ASPECT_COUNT);
  }

  // --- Dimensions 43-47: Special patterns ---
  dna[43] = hasGrandTrine(chartData.aspects) ? 1 : 0;
  dna[44] = hasTSquare(chartData.aspects) ? 1 : 0;
  dna[45] = hasGrandCross(chartData.aspects) ? 1 : 0;
  dna[46] = clamp01(countStelliums(chartData.signs) / 4); // max 4 stelliums
  dna[47] = clamp01((chartData.retrogrades?.length ?? 0) / PLANET_COUNT);

  return dna;
}

/**
 * Calculate cosine similarity between two Cosmic DNA vectors.
 *
 * Returns a value between 0 and 1 where 1 means identical orientation
 * and 0 means completely orthogonal.
 *
 * @param dnaA - First Cosmic DNA vector.
 * @param dnaB - Second Cosmic DNA vector.
 * @returns Similarity score (0-1).
 */
export function cosineSimilarity(dnaA: CosmicDNA, dnaB: CosmicDNA): number {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < DNA_DIMENSIONS; i++) {
    dotProduct += (dnaA[i] ?? 0) * (dnaB[i] ?? 0);
    magnitudeA += (dnaA[i] ?? 0) ** 2;
    magnitudeB += (dnaB[i] ?? 0) ** 2;
  }

  const denominator = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  if (denominator === 0) return 0;

  return clamp01(dotProduct / denominator);
}

/**
 * Calculate Euclidean distance between two Cosmic DNA vectors.
 *
 * Lower values indicate more similar charts. The theoretical maximum
 * distance for two 48-dim unit vectors is sqrt(48) ~ 6.93.
 *
 * @param dnaA - First Cosmic DNA vector.
 * @param dnaB - Second Cosmic DNA vector.
 * @returns Euclidean distance (non-negative).
 */
export function euclideanDistance(dnaA: CosmicDNA, dnaB: CosmicDNA): number {
  let sum = 0;
  for (let i = 0; i < DNA_DIMENSIONS; i++) {
    sum += ((dnaA[i] ?? 0) - (dnaB[i] ?? 0)) ** 2;
  }
  return Math.sqrt(sum);
}

/**
 * Find the top K most similar Cosmic DNA vectors to a target.
 *
 * Uses cosine similarity for ranking. Returns results sorted by
 * descending similarity score.
 *
 * @param targetDNA  - The DNA vector to compare against.
 * @param candidates - Array of candidates with id and dna fields.
 * @param topK       - Number of top matches to return (default: 10).
 * @returns Array of DNAMatch objects sorted by similarity (descending).
 */
export function findMostSimilar(
  targetDNA: CosmicDNA,
  candidates: Array<{ id: string; dna: CosmicDNA }>,
  topK: number = 10,
): DNAMatch[] {
  const scored = candidates.map((candidate) => ({
    id: candidate.id,
    similarity: cosineSimilarity(targetDNA, candidate.dna),
    dna: candidate.dna,
  }));

  scored.sort((a, b) => b.similarity - a.similarity);

  return scored.slice(0, topK);
}

/**
 * Generate a human-readable fingerprint string from a Cosmic DNA vector.
 *
 * Returns a summary like "Fire-Cardinal-Stellium" that captures the
 * dominant element, modality, and any notable special patterns.
 *
 * @param dna - A Cosmic DNA vector.
 * @returns A hyphenated fingerprint string.
 */
export function getCosmicDNAFingerprint(dna: CosmicDNA): string {
  const parts: string[] = [];

  // Dominant element (dims 24-27)
  const elements = [dna[24] ?? 0, dna[25] ?? 0, dna[26] ?? 0, dna[27] ?? 0];
  const maxElementIdx = elements.indexOf(Math.max(...elements));
  parts.push(ELEMENT_NAMES[maxElementIdx]);

  // Dominant modality (dims 28-30)
  const modalities = [dna[28] ?? 0, dna[29] ?? 0, dna[30] ?? 0];
  const maxModalityIdx = modalities.indexOf(Math.max(...modalities));
  parts.push(MODALITY_NAMES[maxModalityIdx]);

  // Special patterns (dims 43-47)
  if ((dna[43] ?? 0) > 0.5) parts.push('GrandTrine');
  if ((dna[44] ?? 0) > 0.5) parts.push('TSquare');
  if ((dna[45] ?? 0) > 0.5) parts.push('GrandCross');
  if ((dna[46] ?? 0) > 0.25) parts.push('Stellium');
  if ((dna[47] ?? 0) > 0.4) parts.push('Retrograde');

  // Fallback if no special patterns
  if (parts.length === 2) {
    // Add the strongest aspect type as a descriptor
    const aspectDims = ASPECT_TYPES.map((_, i) => dna[31 + i] ?? 0);
    const maxAspectIdx = aspectDims.indexOf(Math.max(...aspectDims));
    if (aspectDims[maxAspectIdx] > 0) {
      const aspectName = ASPECT_TYPES[maxAspectIdx];
      parts.push(aspectName.charAt(0).toUpperCase() + aspectName.slice(1));
    }
  }

  return parts.join('-');
}
