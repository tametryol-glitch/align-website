/**
 * Aura Mirror — Color Scoring Engine
 *
 * Blends ALL available data sources (picture scan, video scan, voice scan,
 * mood check-in, life area, natal chart, transits, moon, numerology) into
 * a weighted aura color result.
 *
 * Colors are NEVER random. Every score is traceable to a data input.
 * When data sources are missing, the engine gracefully reduces weight
 * on that dimension and redistributes to available sources.
 */

import {
  AURA_COLORS,
  MOOD_AURA_COLORS,
  LIFE_AREA_AURA_COLORS,
  PLANET_AURA_COLORS,
  CHAKRA_DEFS,
} from '@/lib/auraColors';
import { getDominantTransitColor } from './auraAstroContextService';
import type {
  AuraInput,
  AuraColorName,
  AuraColorScore,
  ChakraReading,
  ChakraName,
} from '@/types/aura';

// All possible aura colors
const ALL_COLORS: AuraColorName[] = [
  'red', 'orange', 'yellow', 'green', 'blue',
  'indigo', 'violet', 'white', 'gold', 'pink', 'gray', 'black',
];

/**
 * Initialize a zero-score map for all colors.
 */
function initScores(): Record<AuraColorName, number> {
  const scores: Partial<Record<AuraColorName, number>> = {};
  for (const c of ALL_COLORS) scores[c] = 0;
  return scores as Record<AuraColorName, number>;
}

/**
 * Add weighted score to a color.
 */
function addScore(
  scores: Record<AuraColorName, number>,
  color: AuraColorName | null | undefined,
  weight: number,
) {
  if (!color || !scores.hasOwnProperty(color)) return;
  scores[color] += weight;
}

/**
 * Core scoring function — takes all available inputs and produces
 * ranked color scores. Weights adapt based on which sources are present.
 */
export function calculateAuraScores(input: AuraInput): AuraColorScore[] {
  const scores = initScores();
  const ds = input.dataSources;

  // ── Weight Distribution ──
  // Base weights (out of 100) — redistributed if sources missing
  let moodWeight = 25;
  let lifeAreaWeight = 15;
  let pictureWeight = 20;
  let astroWeight = 25;
  let numerologyWeight = 5;
  let voiceWeight = 5;
  let videoWeight = 5;

  // Count available sources
  let totalWeight = 0;
  if (ds.mood_used) totalWeight += moodWeight; else moodWeight = 0;
  if (ds.life_area_used) totalWeight += lifeAreaWeight; else lifeAreaWeight = 0;
  if (ds.picture_used) totalWeight += pictureWeight; else pictureWeight = 0;
  if (ds.astrology_used) totalWeight += astroWeight; else astroWeight = 0;
  if (ds.numerology_used) totalWeight += numerologyWeight; else numerologyWeight = 0;
  if (ds.voice_used) totalWeight += voiceWeight; else voiceWeight = 0;
  if (ds.video_used) totalWeight += videoWeight; else videoWeight = 0;

  // If nothing is available, default to mood-based
  if (totalWeight === 0) {
    moodWeight = 100;
    totalWeight = 100;
  }

  // Normalize weights to sum to 100
  const scale = 100 / totalWeight;
  moodWeight *= scale;
  lifeAreaWeight *= scale;
  pictureWeight *= scale;
  astroWeight *= scale;
  numerologyWeight *= scale;
  voiceWeight *= scale;
  videoWeight *= scale;

  // ── 1. Mood Input ──
  if (input.mood && ds.mood_used) {
    const moodColor = MOOD_AURA_COLORS[input.mood];
    addScore(scores, moodColor, moodWeight * 0.7);
    // Secondary color bleed
    const secondaries = getMoodSecondaries(input.mood);
    for (const sc of secondaries) {
      addScore(scores, sc, moodWeight * 0.3 / secondaries.length);
    }
  }

  // ── 2. Life Area Input ──
  if (input.lifeArea && ds.life_area_used) {
    const areaColor = LIFE_AREA_AURA_COLORS[input.lifeArea];
    addScore(scores, areaColor, lifeAreaWeight * 0.8);
    // Slight bleed to related colors
    const related = getLifeAreaSecondaries(input.lifeArea);
    for (const rc of related) {
      addScore(scores, rc, lifeAreaWeight * 0.2 / related.length);
    }
  }

  // ── 3. Picture Scan ──
  if (input.pictureScan && ds.picture_used) {
    const ps = input.pictureScan;
    addScore(scores, ps.suggestedAuraInfluence, pictureWeight * 0.5);
    // Tension maps to gray/red
    if (ps.visibleTensionScore > 0.5) {
      addScore(scores, 'gray', pictureWeight * 0.2 * ps.visibleTensionScore);
      addScore(scores, 'red', pictureWeight * 0.1 * ps.visibleTensionScore);
    }
    // Energy maps to gold/orange
    if (ps.visibleEnergyScore > 0.5) {
      addScore(scores, 'gold', pictureWeight * 0.15 * ps.visibleEnergyScore);
      addScore(scores, 'orange', pictureWeight * 0.1 * ps.visibleEnergyScore);
    }
    // Low energy → blue/indigo
    if (ps.visibleEnergyScore < 0.3) {
      addScore(scores, 'blue', pictureWeight * 0.15);
      addScore(scores, 'indigo', pictureWeight * 0.1);
    }
  }

  // ── 4. Voice Scan ──
  if (input.voiceScan && ds.voice_used) {
    const vs = input.voiceScan;
    addScore(scores, vs.suggestedAuraInfluence, voiceWeight * 0.6);
    if (vs.intensityScore > 0.6) {
      addScore(scores, 'red', voiceWeight * 0.2);
    }
    if (vs.paceScore < 0.3) {
      addScore(scores, 'blue', voiceWeight * 0.2);
    }
  }

  // ── 5. Video Scan ──
  if (input.videoScan && ds.video_used) {
    const vd = input.videoScan;
    addScore(scores, vd.suggestedAuraInfluence, videoWeight * 0.5);
    if (vd.movementScore > 0.6) {
      addScore(scores, 'red', videoWeight * 0.2);
      addScore(scores, 'orange', videoWeight * 0.1);
    }
    if (vd.visibleFatigue > 0.5) {
      addScore(scores, 'gray', videoWeight * 0.2);
    }
  }

  // ── 6. Astrology Context ──
  if (input.astroContext && ds.astrology_used) {
    const ac = input.astroContext;

    // Sun sign influence
    if (ac.sunSign) {
      const sunRuler = getSunSignColor(ac.sunSign);
      addScore(scores, sunRuler, astroWeight * 0.15);
    }

    // Moon sign influence (emotional body)
    if (ac.moonSign) {
      const moonColor = getMoonSignColor(ac.moonSign);
      addScore(scores, moonColor, astroWeight * 0.15);
    }

    // Current Moon sign (emotional weather)
    if (ac.currentMoonSign) {
      const currentMoonColor = getMoonSignColor(ac.currentMoonSign);
      addScore(scores, currentMoonColor, astroWeight * 0.1);
    }

    // Moon phase influence
    if (ac.currentMoonPhase) {
      const phaseColor = getMoonPhaseColor(ac.currentMoonPhase);
      addScore(scores, phaseColor, astroWeight * 0.1);
    }

    // Dominant transit color
    const transitColor = getDominantTransitColor(ac);
    if (transitColor) {
      addScore(scores, transitColor, astroWeight * 0.2);
    }

    // Transit pressure details
    if ((ac.marsActivity || 0) > 0.5) addScore(scores, 'red', astroWeight * 0.05);
    if ((ac.saturnPressure || 0) > 0.5) addScore(scores, 'gray', astroWeight * 0.05);
    if ((ac.neptuneSensitivity || 0) > 0.5) addScore(scores, 'indigo', astroWeight * 0.05);
    if ((ac.venusInfluence || 0) > 0.5) addScore(scores, 'pink', astroWeight * 0.05);
    if ((ac.jupiterInfluence || 0) > 0.5) addScore(scores, 'green', astroWeight * 0.05);
    if ((ac.plutoTransformation || 0) > 0.5) addScore(scores, 'black', astroWeight * 0.05);
  }

  // ── 7. Numerology ──
  if (input.numerologyContext && ds.numerology_used) {
    const nc = input.numerologyContext;
    if (nc.personalYear) {
      const numColor = getNumerologyColor(nc.personalYear);
      addScore(scores, numColor, numerologyWeight * 0.6);
    }
    if (nc.lifePathNumber) {
      const lpColor = getNumerologyColor(nc.lifePathNumber);
      addScore(scores, lpColor, numerologyWeight * 0.4);
    }
  }

  // ── Build sorted results ──
  const results: AuraColorScore[] = ALL_COLORS
    .map((color) => ({
      color,
      score: Math.round(scores[color] * 10) / 10,
      hex: AURA_COLORS[color].hex,
      label: AURA_COLORS[color].label,
    }))
    .sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Get the top 3 aura colors (outer, inner, emotional core).
 */
export function getAuraTriad(scores: AuraColorScore[]): {
  outerAura: AuraColorScore;
  innerAura: AuraColorScore;
  emotionalCore: AuraColorScore;
} {
  // Ensure we have at least 3
  const padded = [...scores];
  while (padded.length < 3) {
    padded.push({ color: 'white', score: 0, hex: '#F7FAFC', label: 'White' });
  }
  return {
    outerAura: padded[0],
    innerAura: padded[1],
    emotionalCore: padded[2],
  };
}

/**
 * Determine the chakra focus based on the dominant aura colors.
 */
export function getChakraFocus(
  outerAura: AuraColorScore,
  innerAura: AuraColorScore,
  emotionalCore: AuraColorScore,
): ChakraReading {
  // Primary chakra from outer aura color
  const primaryChakra = AURA_COLORS[outerAura.color].chakra;
  const def = CHAKRA_DEFS[primaryChakra];

  // Determine status based on score spread
  const topScore = outerAura.score;
  const spread = topScore - emotionalCore.score;
  let status: 'open' | 'blocked' | 'overactive' | 'balanced';

  if (topScore > 40) {
    status = 'overactive';
  } else if (topScore < 10) {
    status = 'blocked';
  } else if (spread < 5) {
    status = 'balanced';
  } else {
    status = 'open';
  }

  return {
    chakra: primaryChakra,
    label: def.label,
    status,
    description: buildChakraDescription(primaryChakra, status),
  };
}

/**
 * Calculate overall scan confidence based on available data sources.
 */
export function calculateScanConfidence(input: AuraInput): number {
  const ds = input.dataSources;
  let confidence = 0;
  let maxPossible = 0;

  // Each source adds to confidence
  const sources: [boolean, number][] = [
    [ds.mood_used, 0.20],
    [ds.life_area_used, 0.10],
    [ds.picture_used, 0.20],
    [ds.video_used, 0.10],
    [ds.voice_used, 0.10],
    [ds.astrology_used, 0.20],
    [ds.numerology_used, 0.05],
    [ds.journal_history_used, 0.05],
  ];

  for (const [used, weight] of sources) {
    maxPossible += weight;
    if (used) confidence += weight;
  }

  // Normalize to 0–1, but floor at 0.3 (mood-only should still feel valid)
  return Math.max(0.3, confidence / maxPossible);
}

// ── Helper: mood secondary colors ───────────────────────────────────

function getMoodSecondaries(mood: string): AuraColorName[] {
  const map: Record<string, AuraColorName[]> = {
    calm: ['green', 'white'],
    heavy: ['black', 'blue'],
    excited: ['gold', 'yellow'],
    anxious: ['gray', 'orange'],
    drained: ['blue', 'black'],
    romantic: ['red', 'violet'],
    angry: ['orange', 'black'],
    confused: ['gray', 'violet'],
    inspired: ['violet', 'orange'],
    lonely: ['indigo', 'gray'],
    powerful: ['gold', 'orange'],
    spiritually_sensitive: ['indigo', 'white'],
    unknown: ['gray', 'indigo'],
  };
  return map[mood] || ['white'];
}

function getLifeAreaSecondaries(area: string): AuraColorName[] {
  const map: Record<string, AuraColorName[]> = {
    love: ['red', 'violet'],
    money: ['gold', 'yellow'],
    family: ['pink', 'blue'],
    career: ['yellow', 'red'],
    body: ['orange', 'green'],
    friendships: ['yellow', 'pink'],
    spirituality: ['indigo', 'white'],
    purpose: ['violet', 'red'],
    anxiety: ['gray', 'red'],
    sexual_energy: ['orange', 'black'],
    creativity: ['yellow', 'violet'],
    grief: ['blue', 'gray'],
    confidence: ['red', 'orange'],
  };
  return map[area] || ['white'];
}

// ── Helper: sign → color ────────────────────────────────────────────

function getSunSignColor(sign: string): AuraColorName {
  const map: Record<string, AuraColorName> = {
    Aries: 'red', Taurus: 'green', Gemini: 'yellow',
    Cancer: 'blue', Leo: 'gold', Virgo: 'green',
    Libra: 'pink', Scorpio: 'black', Sagittarius: 'orange',
    Capricorn: 'gray', Aquarius: 'violet', Pisces: 'indigo',
  };
  return map[sign] || 'white';
}

function getMoonSignColor(sign: string): AuraColorName {
  const map: Record<string, AuraColorName> = {
    Aries: 'red', Taurus: 'green', Gemini: 'yellow',
    Cancer: 'indigo', Leo: 'gold', Virgo: 'blue',
    Libra: 'pink', Scorpio: 'black', Sagittarius: 'orange',
    Capricorn: 'gray', Aquarius: 'violet', Pisces: 'indigo',
  };
  return map[sign] || 'indigo';
}

function getMoonPhaseColor(phase: string): AuraColorName {
  const map: Record<string, AuraColorName> = {
    'New Moon': 'black',
    'Waxing Crescent': 'green',
    'First Quarter': 'yellow',
    'Waxing Gibbous': 'gold',
    'Full Moon': 'white',
    'Waning Gibbous': 'violet',
    'Last Quarter': 'indigo',
    'Waning Crescent': 'blue',
  };
  return map[phase] || 'white';
}

function getNumerologyColor(num: number): AuraColorName {
  const map: Record<number, AuraColorName> = {
    1: 'red', 2: 'blue', 3: 'yellow', 4: 'green',
    5: 'orange', 6: 'pink', 7: 'violet', 8: 'gold',
    9: 'indigo', 11: 'white', 22: 'gold', 33: 'violet',
  };
  return map[num] || 'white';
}

function buildChakraDescription(chakra: ChakraName, status: string): string {
  const def = CHAKRA_DEFS[chakra];
  const themes = def.themes.join(', ');
  switch (status) {
    case 'overactive':
      return `Your ${def.label} is highly active right now. The energy around ${themes} may feel intense or overwhelming. Ground yourself and breathe into this center.`;
    case 'blocked':
      return `Your ${def.label} may need attention. The energy around ${themes} feels restricted. Gentle movement, rest, or reflection on what you are holding back can help.`;
    case 'balanced':
      return `Your ${def.label} feels centered. The energy around ${themes} is flowing with ease. Trust this alignment.`;
    default:
      return `Your ${def.label} is open and receiving. The energy around ${themes} is active and ready for expression. Follow where it leads you.`;
  }
}
