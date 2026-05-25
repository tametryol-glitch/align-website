/**
 * Cosmic Timing Engine
 *
 * Pure function module for calculating optimal contact windows between
 * dating matches based on astrological transits. No side effects, no
 * imports from stores, no UI dependencies.
 *
 * Algorithm overview:
 *
 * WINDOW SCORE = (moonTransitScore * 0.30) + (venusAspectScore * 0.25)
 *              + (mercuryAspectScore * 0.20) + (marsEnergyScore * 0.15)
 *              + (elementCompatibility * 0.10)
 *
 * All sub-scores are normalized to the 0-100 range before weighting.
 *
 * Planetary positions are approximated using day-of-year modular arithmetic
 * for deterministic results (same date = same output).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A user's natal chart summary needed for timing calculations. */
export interface ChartSummary {
  sunSign: ZodiacSign;
  moonSign: ZodiacSign;
  risingSign: ZodiacSign;
  venusSign: ZodiacSign;
  mercurySign: ZodiacSign;
  marsSign: ZodiacSign;
}

/** A ranked time window with its favorability score. */
export interface ContactWindow {
  /** Time window label */
  window: TimeWindow;
  /** Start hour (0-23) */
  startHour: number;
  /** End hour (0-23, may wrap past midnight) */
  endHour: number;
  /** Favorability score 0-100 */
  score: number;
  /** Breakdown of contributing factors */
  factors: TimingFactors;
  /** Human-readable recommendation */
  recommendation: string;
}

/** Current cosmic mood based on sun sign and moon transit. */
export interface CosmicMood {
  /** Overall energy label */
  mood: 'electric' | 'flowing' | 'grounded' | 'introspective' | 'passionate';
  /** Intensity 0-100 */
  intensity: number;
  /** Short description of the cosmic energy */
  description: string;
  /** Current transiting moon sign */
  transitMoonSign: ZodiacSign;
}

/** Breakdown of timing factors contributing to a window score. */
export interface TimingFactors {
  moonTransit: number;
  venusAspect: number;
  mercuryAspect: number;
  marsEnergy: number;
  elementBonus: number;
}

export type TimeWindow = 'morning' | 'midday' | 'afternoon' | 'evening' | 'night';

export type ZodiacSign =
  | 'aries' | 'taurus' | 'gemini' | 'cancer'
  | 'leo' | 'virgo' | 'libra' | 'scorpio'
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export type Element = 'fire' | 'earth' | 'air' | 'water';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Time window definitions: [startHour, endHour] */
const TIME_WINDOWS: Record<TimeWindow, [number, number]> = {
  morning: [6, 10],
  midday: [10, 14],
  afternoon: [14, 18],
  evening: [18, 22],
  night: [22, 2],
} as const;

/** Map each zodiac sign to its element. */
const SIGN_ELEMENTS: Record<ZodiacSign, Element> = {
  aries: 'fire', taurus: 'earth', gemini: 'air', cancer: 'water',
  leo: 'fire', virgo: 'earth', libra: 'air', scorpio: 'water',
  sagittarius: 'fire', capricorn: 'earth', aquarius: 'air', pisces: 'water',
} as const;

/** Ordered sign list for index-based lookups. */
const SIGNS: ZodiacSign[] = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

/** Moon spends ~2.5 days per sign; ~12.2 signs per lunar month (~29.5 days). */
const MOON_CYCLE_DAYS = 29.5;

/** Venus orbital period approximation in days. */
const VENUS_CYCLE_DAYS = 225;

/** Mercury orbital period approximation in days. */
const MERCURY_CYCLE_DAYS = 88;

/** Mars orbital period approximation in days. */
const MARS_CYCLE_DAYS = 687;

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
 * Get the day-of-year (1-366) for a given date.
 */
function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Approximate which zodiac sign a celestial body is transiting on a given date.
 * Uses modular arithmetic on the day-of-year scaled by the body's cycle period.
 *
 * @param date       - The date to calculate for.
 * @param cycleDays  - The body's approximate orbital period in days.
 * @param offset     - Phase offset to differentiate bodies (0-11).
 */
function getTransitSign(date: Date, cycleDays: number, offset: number): ZodiacSign {
  const doy = dayOfYear(date);
  const yearFraction = doy / cycleDays;
  const signIndex = Math.floor((yearFraction * 12 + offset) % 12);
  return SIGNS[signIndex];
}

/**
 * Calculate the aspect angle between two signs (0 = conjunction, 6 = opposition).
 * Returns a value 0-6 representing sign distance.
 */
function signDistance(sign1: ZodiacSign, sign2: ZodiacSign): number {
  const i1 = SIGNS.indexOf(sign1);
  const i2 = SIGNS.indexOf(sign2);
  const raw = Math.abs(i1 - i2);
  return Math.min(raw, 12 - raw);
}

/**
 * Score an aspect based on sign distance.
 * Conjunctions (0) and trines (4) are harmonious; squares (3) and oppositions (6) are tense.
 */
function aspectScore(distance: number): number {
  switch (distance) {
    case 0: return 90;  // conjunction — strong alignment
    case 1: return 60;  // semi-sextile — mild
    case 2: return 75;  // sextile — harmonious
    case 3: return 30;  // square — tension
    case 4: return 85;  // trine — very harmonious
    case 5: return 45;  // quincunx — adjustment needed
    case 6: return 50;  // opposition — polarizing but magnetic
    default: return 50;
  }
}

/**
 * Check if two signs share the same element.
 */
function sameElement(sign1: ZodiacSign, sign2: ZodiacSign): boolean {
  return SIGN_ELEMENTS[sign1] === SIGN_ELEMENTS[sign2];
}

/**
 * Generate a time-window-specific modifier based on planetary energy.
 * Morning favors Mercury, evening favors Venus, night favors Moon.
 */
function windowModifier(window: TimeWindow, moonScore: number, venusScore: number, mercuryScore: number): number {
  switch (window) {
    case 'morning': return mercuryScore * 0.15;
    case 'midday': return 0;
    case 'afternoon': return (mercuryScore + venusScore) * 0.05;
    case 'evening': return venusScore * 0.15;
    case 'night': return moonScore * 0.10;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Calculate ranked optimal contact windows for a given date.
 *
 * Returns 5 time windows sorted by score (highest first). Each window
 * includes a 0-100 favorability score and a breakdown of contributing
 * astrological factors.
 *
 * Results are deterministic: same inputs always produce the same output.
 *
 * @param userChart    - The current user's natal chart summary.
 * @param partnerChart - The dating match's natal chart summary.
 * @param date         - The date to calculate timing for.
 * @returns Ranked array of ContactWindow objects.
 */
export function getOptimalContactWindows(
  userChart: ChartSummary,
  partnerChart: ChartSummary,
  date: Date,
): ContactWindow[] {
  const transitMoon = getTransitSign(date, MOON_CYCLE_DAYS, 0);
  const transitVenus = getTransitSign(date, VENUS_CYCLE_DAYS, 3);
  const transitMercury = getTransitSign(date, MERCURY_CYCLE_DAYS, 7);
  const transitMars = getTransitSign(date, MARS_CYCLE_DAYS, 5);

  // Moon transit score: how well the transiting moon aspects both charts
  const userMoonAspect = aspectScore(signDistance(transitMoon, userChart.moonSign));
  const partnerMoonAspect = aspectScore(signDistance(transitMoon, partnerChart.moonSign));
  const moonTransit = (userMoonAspect + partnerMoonAspect) / 2;

  // Venus aspect score: transiting Venus to both natal Venus signs
  const userVenusAspect = aspectScore(signDistance(transitVenus, userChart.venusSign));
  const partnerVenusAspect = aspectScore(signDistance(transitVenus, partnerChart.venusSign));
  const venusAspect = (userVenusAspect + partnerVenusAspect) / 2;

  // Mercury aspect score: transiting Mercury to both natal Mercury signs
  const userMercuryAspect = aspectScore(signDistance(transitMercury, userChart.mercurySign));
  const partnerMercuryAspect = aspectScore(signDistance(transitMercury, partnerChart.mercurySign));
  const mercuryAspect = (userMercuryAspect + partnerMercuryAspect) / 2;

  // Mars energy score: transiting Mars to both natal Mars signs
  const userMarsAspect = aspectScore(signDistance(transitMars, userChart.marsSign));
  const partnerMarsAspect = aspectScore(signDistance(transitMars, partnerChart.marsSign));
  const marsEnergy = (userMarsAspect + partnerMarsAspect) / 2;

  // Element compatibility bonus: +15 if sun signs share the same element
  const elementBonus = sameElement(userChart.sunSign, partnerChart.sunSign) ? 15 : 0;

  const windows: ContactWindow[] = (Object.keys(TIME_WINDOWS) as TimeWindow[]).map((window) => {
    const [startHour, endHour] = TIME_WINDOWS[window];
    const modifier = windowModifier(window, moonTransit, venusAspect, mercuryAspect);

    const factors: TimingFactors = {
      moonTransit: clamp100(moonTransit),
      venusAspect: clamp100(venusAspect),
      mercuryAspect: clamp100(mercuryAspect),
      marsEnergy: clamp100(marsEnergy),
      elementBonus,
    };

    const score = clamp100(
      moonTransit * 0.30 +
      venusAspect * 0.25 +
      mercuryAspect * 0.20 +
      marsEnergy * 0.15 +
      elementBonus * 0.10 +
      modifier,
    );

    const recommendation = generateRecommendation(score, window, transitMoon);

    return { window, startHour, endHour, score, factors, recommendation };
  });

  // Sort by score descending
  windows.sort((a, b) => b.score - a.score);

  return windows;
}

/**
 * Get the current cosmic mood based on sun sign and the transiting moon.
 *
 * Provides a quick snapshot of the day's emotional/energetic tone for
 * a given sun sign. Useful for UI mood indicators and quick widgets.
 *
 * @param sunSign      - The user's natal sun sign.
 * @param moonTransit  - The current transiting moon sign (or pass a date to auto-calculate).
 * @returns CosmicMood object with mood label, intensity, and description.
 */
export function getCosmicMood(sunSign: ZodiacSign, moonTransit: ZodiacSign | Date): CosmicMood {
  const transitMoonSign: ZodiacSign = moonTransit instanceof Date
    ? getTransitSign(moonTransit, MOON_CYCLE_DAYS, 0)
    : moonTransit;

  const distance = signDistance(sunSign, transitMoonSign);
  const sunElement = SIGN_ELEMENTS[sunSign];
  const moonElement = SIGN_ELEMENTS[transitMoonSign];
  const elementsMatch = sunElement === moonElement;

  // Determine mood based on element interactions and aspect distance
  let mood: CosmicMood['mood'];
  let description: string;

  if (distance === 0 || distance === 4) {
    mood = 'electric';
    description = 'Moon harmonizes with your Sun — heightened magnetism and clarity.';
  } else if (elementsMatch) {
    mood = 'flowing';
    description = 'Elemental resonance creates easy emotional flow today.';
  } else if (sunElement === 'fire' || moonElement === 'fire') {
    mood = 'passionate';
    description = 'Fire energy sparks boldness — great for initiating contact.';
  } else if (sunElement === 'earth' || moonElement === 'earth') {
    mood = 'grounded';
    description = 'Earth energy favors steady, sincere communication.';
  } else {
    mood = 'introspective';
    description = 'Reflective energy today — depth over breadth in conversations.';
  }

  // Intensity based on aspect harmony
  const baseIntensity = aspectScore(distance);
  const intensity = clamp100(elementsMatch ? baseIntensity + 10 : baseIntensity);

  return { mood, intensity, description, transitMoonSign };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Generate a human-readable recommendation string for a contact window.
 */
function generateRecommendation(score: number, window: TimeWindow, transitMoon: ZodiacSign): string {
  const moonElement = SIGN_ELEMENTS[transitMoon];

  if (score >= 80) {
    return `Excellent window! The ${moonElement} moon energy makes ${window} ideal for meaningful connection.`;
  } else if (score >= 60) {
    return `Good timing. ${window.charAt(0).toUpperCase() + window.slice(1)} carries favorable energy for reaching out.`;
  } else if (score >= 40) {
    return `Neutral window. Communication is fine but may lack sparkle during ${window}.`;
  } else {
    return `Consider waiting. Cosmic energy during ${window} may create misunderstandings.`;
  }
}
