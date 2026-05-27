/**
 * Aura Mirror — Forecast Engine (Phase 4)
 *
 * Predicts aura shifts over the next 24–72 hours based on:
 *   - Current aura triad (from latest scan)
 *   - Transit movements (from existing transitCalc)
 *   - Moon phase progression
 *   - Personal numerology cycle
 *
 * Uses ONLY existing services — no new APIs or dependencies.
 * Pro-tier feature gated by 'aura_mirror_forecast'.
 */

import { getAuraAstroContext, getAuraNumerologyContext } from '@/lib/auraAstroContextService';
import { AURA_COLORS, PLANET_AURA_COLORS } from '@/lib/auraColors';
import type { AuraColorName, AuraColorScore } from '@/types/aura';

// ── Inline Planetary Longitude Calculator ─────────────────────────────
// Ported from align-app/src/services/transitCalc.ts.
// Uses mean-longitude approximation from J2000 epoch data. Accurate to
// within ~1° for sign-level display — sufficient for the 24-72h forecast.

// Accurate J2000 epoch positions from Swiss Ephemeris (Jan 1, 2000 12:00 UT)
const PLANET_DATA: Record<string, { epoch_lon: number; daily_motion: number }> = {
  Sun:     { epoch_lon: 280.368166, daily_motion: 0.985600 },
  Moon:    { epoch_lon: 223.314870, daily_motion: 13.176358 },
  Mercury: { epoch_lon: 271.888127, daily_motion: 1.383300 },
  Venus:   { epoch_lon: 241.564895, daily_motion: 1.209042 },
  Mars:    { epoch_lon: 327.962730, daily_motion: 0.524023 },
  Jupiter: { epoch_lon: 25.253058,  daily_motion: 0.083091 },
  Saturn:  { epoch_lon: 40.395678,  daily_motion: 0.033490 },
  Uranus:  { epoch_lon: 314.809150, daily_motion: 0.011690 },
  Neptune: { epoch_lon: 303.192986, daily_motion: 0.005980 },
  Pluto:   { epoch_lon: 251.454751, daily_motion: 0.003970 },
};

// Lunar nodes — mean longitude formula from Meeus, Astronomical Algorithms, Ch. 47.
// Precession: -0.0529539°/day (always retrograde). South Node is 180° from North Node.
const NODE_DATA: Record<string, { epoch_lon: number; daily_motion: number }> = {
  'North Node': { epoch_lon: 125.04455501, daily_motion: -0.0529539 },
  'South Node': { epoch_lon: 305.04455501, daily_motion: -0.0529539 },
};

/**
 * Return the ecliptic longitude (0..360°) of `planet` on `date`.
 *
 * Uses mean-element formula for all bodies. Accurate to within ~1° for
 * sign-level display — sufficient for the forecast engine.
 */
function getApproxLongitude(planet: string, date: Date): number {
  const data = PLANET_DATA[planet] || NODE_DATA[planet];
  if (!data) return 0;
  const j2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const daysSinceEpoch = (date.getTime() - j2000.getTime()) / 86400000;
  let lon = (data.epoch_lon + data.daily_motion * daysSinceEpoch) % 360;
  if (lon < 0) lon += 360;
  return ((lon % 360) + 360) % 360;
}

// ── Forecast Result ────────────────────────────────────────────────

export interface AuraForecastResult {
  /** Current outer aura color */
  currentOuter: AuraColorName;
  /** Predicted shift direction */
  shiftDirection: 'intensifying' | 'softening' | 'transforming' | 'stable';
  /** Predicted color the aura is moving toward */
  movingToward: AuraColorName;
  /** How strong the shift signal is (0–1) */
  shiftStrength: number;
  /** Forecast windows */
  windows: AuraForecastWindow[];
  /** Dominant planetary influence on the shift */
  drivingPlanet: string;
  /** Moon phase context */
  moonPhaseNote: string;
  /** Numerology cycle note */
  numerologyNote: string;
  /** Overall forecast narrative */
  narrative: string;
}

export interface AuraForecastWindow {
  label: string;        // "Next 12h", "24h", "48–72h"
  emoji: string;
  prediction: string;   // short narrative
  colorTrend: AuraColorName;
  intensity: 'rising' | 'stable' | 'fading';
}

// ── Planetary Speed Approximations (degrees/day) ───────────────────
// Used to predict where planets will be in 24–72h

const PLANET_SPEEDS: Record<string, number> = {
  Sun: 0.986,
  Moon: 13.18,
  Mercury: 1.38,
  Venus: 1.20,
  Mars: 0.52,
  Jupiter: 0.083,
  Saturn: 0.034,
  Uranus: 0.012,
  Neptune: 0.006,
  Pluto: 0.004,
};

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

function lonToSign(lon: number): string {
  const idx = Math.floor(((lon % 360) + 360) % 360 / 30);
  return SIGNS[idx] || 'Aries';
}

// ── Sign → Color Mapping (reused from auraColorEngine) ─────────────

const SIGN_COLORS: Record<string, AuraColorName> = {
  Aries: 'red', Taurus: 'green', Gemini: 'yellow', Cancer: 'blue',
  Leo: 'gold', Virgo: 'green', Libra: 'pink', Scorpio: 'black',
  Sagittarius: 'orange', Capricorn: 'gray', Aquarius: 'violet', Pisces: 'indigo',
};

// ── Moon Phase Progression ─────────────────────────────────────────

function getMoonPhaseAt(hoursAhead: number): { phase: string; sign: string } {
  const future = new Date(Date.now() + hoursAhead * 3600 * 1000);
  const sunLon = getApproxLongitude('Sun', future);
  const moonLon = getApproxLongitude('Moon', future);
  const angle = ((moonLon - sunLon) % 360 + 360) % 360;

  let phase: string;
  if (angle < 45) phase = 'New Moon';
  else if (angle < 90) phase = 'Waxing Crescent';
  else if (angle < 135) phase = 'First Quarter';
  else if (angle < 180) phase = 'Waxing Gibbous';
  else if (angle < 225) phase = 'Full Moon';
  else if (angle < 270) phase = 'Waning Gibbous';
  else if (angle < 315) phase = 'Last Quarter';
  else phase = 'Waning Crescent';

  return { phase, sign: lonToSign(moonLon) };
}

// ── Core Forecast Computation ──────────────────────────────────────

/**
 * Generate a 72-hour aura forecast based on current aura + sky state.
 */
export function generateAuraForecast(
  currentOuter: AuraColorName,
  currentInner: AuraColorName,
  currentCore: AuraColorName,
): AuraForecastResult {
  const now = new Date();
  const astro = getAuraAstroContext();
  const numCtx = getAuraNumerologyContext();

  // Current and future moon data
  const moonNow = getMoonPhaseAt(0);
  const moon12h = getMoonPhaseAt(12);
  const moon24h = getMoonPhaseAt(24);
  const moon48h = getMoonPhaseAt(48);
  const moon72h = getMoonPhaseAt(72);

  // Track strongest planetary mover over next 72h
  const planetInfluences: Array<{ planet: string; color: AuraColorName; strength: number }> = [];

  for (const planet of ['Mars', 'Venus', 'Jupiter', 'Saturn', 'Neptune', 'Pluto']) {
    const nowLon = getApproxLongitude(planet, now);
    const futureLon = getApproxLongitude(planet, new Date(now.getTime() + 72 * 3600 * 1000));
    const signNow = lonToSign(nowLon);
    const signFuture = lonToSign(futureLon);
    const signChanged = signNow !== signFuture;
    const color = PLANET_AURA_COLORS[planet] || 'white';

    // Strength based on speed × relevance
    const speed = PLANET_SPEEDS[planet] || 0.01;
    let strength = speed * 0.1;
    if (signChanged) strength += 0.3; // sign ingress is a big deal
    if (color === currentOuter) strength += 0.2; // resonance with current aura

    // Check activity scores from existing context
    const activityKey = planet.toLowerCase() + 'Activity';
    const pressureKey = planet.toLowerCase() + 'Pressure';
    const currentActivity = (astro as any)[activityKey] ?? (astro as any)[pressureKey] ?? 0;
    if (currentActivity > 0.5) strength += 0.15;

    planetInfluences.push({ planet, color, strength });
  }

  // Moon is always a strong short-term mover
  const moonColor = SIGN_COLORS[moon24h.sign] || 'indigo';
  planetInfluences.push({
    planet: 'Moon',
    color: moonColor,
    strength: 0.4 + (moonNow.sign !== moon24h.sign ? 0.2 : 0),
  });

  // Sort by strength
  planetInfluences.sort((a, b) => b.strength - a.strength);
  const drivingPlanet = planetInfluences[0]?.planet || 'Moon';
  const movingToward = planetInfluences[0]?.color || currentOuter;
  const shiftStrength = Math.min(1, planetInfluences[0]?.strength || 0);

  // Determine shift direction
  let shiftDirection: AuraForecastResult['shiftDirection'] = 'stable';
  if (movingToward === currentOuter) {
    shiftDirection = shiftStrength > 0.3 ? 'intensifying' : 'stable';
  } else if (isOppositeElement(currentOuter, movingToward)) {
    shiftDirection = 'transforming';
  } else {
    shiftDirection = 'softening';
  }

  // Build forecast windows
  const windows: AuraForecastWindow[] = [
    buildWindow('Next 12 hours', '🕐', moon12h, currentOuter, planetInfluences, 12),
    buildWindow('24 hours', '🌅', moon24h, currentOuter, planetInfluences, 24),
    buildWindow('48–72 hours', '🌙', moon72h, currentOuter, planetInfluences, 72),
  ];

  // Moon phase note
  const phaseProgression = moonNow.phase !== moon72h.phase
    ? `The Moon moves from ${moonNow.phase} in ${moonNow.sign} to ${moon72h.phase} in ${moon72h.sign}`
    : `The Moon stays in ${moonNow.phase}, shifting from ${moonNow.sign} to ${moon72h.sign}`;
  const moonPhaseNote = `${phaseProgression}. ${getMoonPhaseEnergyNote(moon24h.phase)}`;

  // Numerology note
  let numerologyNote = '';
  if (numCtx.personalYear) {
    const py = numCtx.personalYear;
    numerologyNote = `You are in a ${py} Personal Year. ${getPersonalYearForecastNote(py)}`;
  }

  // Overall narrative
  const narrative = buildForecastNarrative(
    currentOuter, movingToward, shiftDirection, shiftStrength,
    drivingPlanet, moonNow, moon72h,
  );

  return {
    currentOuter,
    shiftDirection,
    movingToward,
    shiftStrength,
    windows,
    drivingPlanet,
    moonPhaseNote,
    numerologyNote,
    narrative,
  };
}

// ── Helpers ────────────────────────────────────────────────────────

type ColorElement = 'fire' | 'water' | 'earth' | 'air' | 'spirit';

const COLOR_ELEMENTS: Record<AuraColorName, ColorElement> = {
  red: 'fire', orange: 'fire', yellow: 'air', green: 'earth',
  blue: 'water', indigo: 'water', violet: 'spirit', white: 'spirit',
  gold: 'fire', pink: 'water', gray: 'earth', black: 'spirit',
};

function isOppositeElement(a: AuraColorName, b: AuraColorName): boolean {
  const ea = COLOR_ELEMENTS[a];
  const eb = COLOR_ELEMENTS[b];
  return (ea === 'fire' && eb === 'water') || (ea === 'water' && eb === 'fire') ||
         (ea === 'earth' && eb === 'air') || (ea === 'air' && eb === 'earth');
}

function buildWindow(
  label: string,
  emoji: string,
  moonData: { phase: string; sign: string },
  currentOuter: AuraColorName,
  influences: Array<{ planet: string; color: AuraColorName; strength: number }>,
  hoursAhead: number,
): AuraForecastWindow {
  // Blend the strongest influence with time decay
  const timeFactor = hoursAhead <= 12 ? 1.0 : hoursAhead <= 24 ? 0.8 : 0.6;
  const moonColor = SIGN_COLORS[moonData.sign] || 'indigo';
  const topInfluence = influences[0];

  // Short-term: Moon dominates. Long-term: outer planets dominate.
  const colorTrend = hoursAhead <= 12 ? moonColor : (topInfluence?.color || currentOuter);

  const intensity: AuraForecastWindow['intensity'] =
    (topInfluence?.strength || 0) * timeFactor > 0.4 ? 'rising' :
    (topInfluence?.strength || 0) * timeFactor < 0.2 ? 'fading' : 'stable';

  const moonNote = `Moon in ${moonData.sign} (${moonData.phase})`;
  const colorDef = AURA_COLORS[colorTrend];
  const prediction = hoursAhead <= 12
    ? `${moonNote} brings ${colorDef.keywords[0]} energy. Your aura may ${intensity === 'rising' ? 'intensify' : intensity === 'fading' ? 'soften' : 'hold steady'} in the ${colorDef.label.toLowerCase()} spectrum.`
    : `${topInfluence?.planet || 'The cosmos'} drives a ${intensity === 'rising' ? 'building' : intensity === 'fading' ? 'releasing' : 'steady'} ${colorDef.label.toLowerCase()} influence. ${moonNote}.`;

  return { label, emoji, prediction, colorTrend, intensity };
}

function getMoonPhaseEnergyNote(phase: string): string {
  const notes: Record<string, string> = {
    'New Moon': 'New Moon energy favors reset, intention-setting, and planting seeds. Your aura may feel quieter, more inward.',
    'Waxing Crescent': 'Waxing energy builds momentum. Your aura will likely intensify over the coming days.',
    'First Quarter': 'First Quarter pushes for action. Expect your aura to sharpen and become more directive.',
    'Waxing Gibbous': 'Energy is approaching its peak. Your aura is amplifying whatever you carry.',
    'Full Moon': 'Full Moon illuminates everything. Emotions peak, your aura will be at its most visible and intense.',
    'Waning Gibbous': 'Release energy begins. Your aura starts to process and integrate what the Full Moon revealed.',
    'Last Quarter': 'Clearing phase. Old patterns in your aura may dissolve or transform.',
    'Waning Crescent': 'Rest and release. Your aura is preparing for a reset. Honor stillness.',
  };
  return notes[phase] || 'The lunar cycle is shaping your energy in subtle ways.';
}

function getPersonalYearForecastNote(year: number): string {
  const notes: Record<number, string> = {
    1: 'This is a year of new beginnings — your aura may shift more dramatically than usual.',
    2: 'Partnership and patience define this year. Expect gentle, gradual aura shifts.',
    3: 'Creative expression is heightened. Your aura may lean toward warm, vibrant colors.',
    4: 'Structure and discipline year. Your aura may stabilize around earth tones.',
    5: 'Change and freedom year. Expect more aura volatility and color shifts.',
    6: 'Love and responsibility year. Heart-centered colors may dominate.',
    7: 'Introspection year. Deep, cool-spectrum aura colors are common.',
    8: 'Power and achievement year. Gold and confident aura tones are favored.',
    9: 'Completion year. Your aura may cycle through many colors as old chapters close.',
    11: 'Master intuition year. Expect heightened spiritual sensitivity in your aura.',
    22: 'Master builder year. Your aura may carry unusually strong and stable energy.',
    33: 'Master healer year. Heart and crown colors may be especially active.',
  };
  return notes[year] || 'Your personal numerology cycle is subtly influencing your energetic pattern.';
}

function buildForecastNarrative(
  currentOuter: AuraColorName,
  movingToward: AuraColorName,
  shiftDirection: AuraForecastResult['shiftDirection'],
  shiftStrength: number,
  drivingPlanet: string,
  moonNow: { phase: string; sign: string },
  moon72h: { phase: string; sign: string },
): string {
  const currentDef = AURA_COLORS[currentOuter];
  const targetDef = AURA_COLORS[movingToward];

  if (shiftDirection === 'stable') {
    return `Your ${currentDef.label.toLowerCase()} aura is likely to hold steady over the next 72 hours. ${drivingPlanet} reinforces your current energy pattern. The Moon moving through ${moonNow.sign} to ${moon72h.sign} keeps the emotional atmosphere consistent with what you are carrying now.`;
  }

  if (shiftDirection === 'intensifying') {
    return `Your ${currentDef.label.toLowerCase()} aura is building in strength. ${drivingPlanet} is amplifying this energy over the next 72 hours. By ${moon72h.phase}, you may feel this color's themes — ${currentDef.keywords.slice(0, 3).join(', ')} — more powerfully than you do right now.`;
  }

  if (shiftDirection === 'transforming') {
    return `A significant shift is forming. Your ${currentDef.label.toLowerCase()} energy is being pulled toward ${targetDef.label.toLowerCase()} territory by ${drivingPlanet}. This is an elemental transformation — ${currentDef.keywords[0]} is making way for ${targetDef.keywords[0]}. Expect this to unfold gradually, peaking around the ${moon72h.phase}.`;
  }

  // softening
  return `Your ${currentDef.label.toLowerCase()} aura is beginning to soften. ${drivingPlanet} is introducing ${targetDef.label.toLowerCase()} undertones that may become more visible over the next 48–72 hours. The Moon's journey from ${moonNow.sign} to ${moon72h.sign} supports this gentle transition.`;
}
