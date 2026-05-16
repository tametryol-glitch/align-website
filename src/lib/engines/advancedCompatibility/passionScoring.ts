// ═══════════════════════════════════════════════════════════════════
// Passion Scoring — SEPARATE Category
// Measures raw physical/sexual chemistry, erotic magnetism, desire
// Not folded into Attraction — this is its own dimension
// ═══════════════════════════════════════════════════════════════════

import { MidpointActivation } from './midpointEngine';

export interface PassionIndicator {
  description: string;
  score: number;
  planets: string[];
}

export interface PassionResult {
  score: number; // 0-100
  intensity: 'Low' | 'Moderate' | 'High' | 'Volcanic';
  indicators: PassionIndicator[];
  interpretation: string;
}

// Planet pairs that contribute to passion score
const PASSION_ASPECT_WEIGHTS: Record<string, Record<string, number>> = {
  // planet pair key -> aspect -> weight
  'Mars|Venus': { Conjunction: 1.0, Trine: 0.8, Sextile: 0.6, Square: 0.9, Opposition: 0.95 },
  'Mars|Mars': { Conjunction: 0.85, Trine: 0.7, Sextile: 0.5, Square: 0.8, Opposition: 0.85 },
  'Mars|Pluto': { Conjunction: 0.95, Trine: 0.7, Sextile: 0.5, Square: 0.9, Opposition: 0.9 },
  'Venus|Pluto': { Conjunction: 0.9, Trine: 0.7, Sextile: 0.5, Square: 0.85, Opposition: 0.88 },
  'Sun|Mars': { Conjunction: 0.7, Trine: 0.5, Sextile: 0.35, Square: 0.65, Opposition: 0.7 },
  'Moon|Mars': { Conjunction: 0.75, Trine: 0.55, Sextile: 0.4, Square: 0.7, Opposition: 0.72 },
  'Moon|Pluto': { Conjunction: 0.8, Trine: 0.6, Sextile: 0.4, Square: 0.75, Opposition: 0.78 },
  'Venus|Mars': { Conjunction: 1.0, Trine: 0.8, Sextile: 0.6, Square: 0.9, Opposition: 0.95 },
  'Sun|Pluto': { Conjunction: 0.7, Trine: 0.5, Sextile: 0.35, Square: 0.65, Opposition: 0.68 },
  'Venus|Uranus': { Conjunction: 0.65, Trine: 0.45, Sextile: 0.3, Square: 0.6, Opposition: 0.62 },
  'Mars|Uranus': { Conjunction: 0.7, Trine: 0.5, Sextile: 0.35, Square: 0.65, Opposition: 0.68 },
  'Mars|Neptune': { Conjunction: 0.55, Trine: 0.4, Sextile: 0.3, Square: 0.5, Opposition: 0.52 },
  'Venus|Neptune': { Conjunction: 0.5, Trine: 0.4, Sextile: 0.3, Square: 0.45, Opposition: 0.48 },
};

// Eros, Lilith, Psyche, Sappho, Cupido aspect weights
const PASSION_ASTEROID_WEIGHTS: Record<string, number> = {
  Eros: 0.85,
  Lilith: 0.8,
  Psyche: 0.5,
  Sappho: 0.6,
  Cupido: 0.7,
};

// Passion-relevant planets for house overlays
const PASSION_HOUSE_WEIGHTS: Record<number, number> = {
  1: 0.4,  // physical presence
  5: 0.9,  // romance, pleasure, creativity
  7: 0.3,  // partnership
  8: 1.0,  // sex, intimacy, shared intensity
  12: 0.5, // hidden desires, fantasy
};

function pKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

export function computePassionScore(
  aspects: Array<{
    inner: string;
    outer: string;
    aspect: string;
    orb: number;
    strength: number;
  }>,
  person1HouseCusps: number[],
  person2HouseCusps: number[],
  person1Positions: Array<{ name: string; longitude: number }>,
  person2Positions: Array<{ name: string; longitude: number }>,
  midpointActivations?: MidpointActivation[],
): PassionResult {
  let rawScore = 0;
  const indicators: PassionIndicator[] = [];

  // 1. Aspect-based passion scoring
  for (const asp of aspects) {
    const pk = pKey(asp.inner, asp.outer);
    const weights = PASSION_ASPECT_WEIGHTS[pk];
    if (weights) {
      const w = weights[asp.aspect] || 0;
      if (w > 0) {
        const orbDecay = Math.max(0, 1 - (asp.orb / 10));
        const contribution = w * orbDecay * 3.5;
        rawScore += contribution;
        if (contribution > 0.5) {
          indicators.push({
            description: `${asp.inner}-${asp.outer} ${asp.aspect} — ${getPassionDescription(asp.inner, asp.outer, asp.aspect)}`,
            score: Math.round(contribution * 10),
            planets: [asp.inner, asp.outer],
          });
        }
      }
    }

    // Asteroid passion scoring
    const astWeight1 = PASSION_ASTEROID_WEIGHTS[asp.inner];
    const astWeight2 = PASSION_ASTEROID_WEIGHTS[asp.outer];
    if (astWeight1 || astWeight2) {
      const w = Math.max(astWeight1 || 0, astWeight2 || 0);
      const isHard = ['Square', 'Opposition'].includes(asp.aspect);
      const contribution = w * (isHard ? 0.8 : 1.0) * Math.max(0, 1 - (asp.orb / 6)) * 2.0;
      rawScore += contribution;
      if (contribution > 0.3) {
        const asteroid = astWeight1 ? asp.inner : asp.outer;
        const partner = astWeight1 ? asp.outer : asp.inner;
        indicators.push({
          description: `${asteroid} ${asp.aspect} ${partner} — ${asteroid === 'Eros' ? 'raw erotic magnetism' : asteroid === 'Lilith' ? 'taboo desire awakened' : 'deep soul-level desire'}`,
          score: Math.round(contribution * 10),
          planets: [asp.inner, asp.outer],
        });
      }
    }
  }

  // 2. House overlay passion scoring
  function scorePassionOverlays(
    planets: Array<{ name: string; longitude: number }>,
    targetCusps: number[],
  ) {
    if (!targetCusps || targetCusps.length < 12) return;
    const passionPlanets = ['Venus', 'Mars', 'Pluto', 'Eros', 'Lilith'];
    for (const p of planets) {
      if (!passionPlanets.includes(p.name)) continue;
      const house = getHouseForLon(p.longitude, targetCusps);
      if (house === null) continue;
      const hw = PASSION_HOUSE_WEIGHTS[house] || 0;
      if (hw > 0) {
        const contribution = hw * 1.5;
        rawScore += contribution;
        if (contribution > 0.3) {
          indicators.push({
            description: `${p.name} in partner's ${house}${getOrdinal(house)} house — ${getHousePassionMeaning(house, p.name)}`,
            score: Math.round(contribution * 10),
            planets: [p.name],
          });
        }
      }
    }
  }

  scorePassionOverlays(person1Positions, person2HouseCusps);
  scorePassionOverlays(person2Positions, person1HouseCusps);

  // 3. Midpoint activations for passion
  if (midpointActivations) {
    const passionMidpoints = midpointActivations.filter(
      a => ['Venus', 'Mars', 'Pluto', 'Eros', 'Lilith'].includes(a.midpoint.planet1) ||
           ['Venus', 'Mars', 'Pluto', 'Eros', 'Lilith'].includes(a.midpoint.planet2) ||
           ['Venus', 'Mars', 'Pluto', 'Eros', 'Lilith'].includes(a.activatingPlanet)
    );
    for (const mp of passionMidpoints.slice(0, 10)) {
      const contribution = mp.strength * 2.0;
      rawScore += contribution;
      if (contribution > 0.3) {
        indicators.push({
          description: `${mp.activatingPlanet} activates ${mp.midpoint.label} midpoint — desire amplified`,
          score: Math.round(contribution * 10),
          planets: [mp.activatingPlanet, mp.midpoint.planet1, mp.midpoint.planet2],
        });
      }
    }
  }

  // Normalize to 0-100
  const score = Math.round(Math.min(100, Math.max(0, sigmoid(rawScore, 12, 0.25) * 100)));

  const intensity: PassionResult['intensity'] =
    score >= 80 ? 'Volcanic' :
    score >= 60 ? 'High' :
    score >= 40 ? 'Moderate' : 'Low';

  // Sort indicators by score descending
  indicators.sort((a, b) => b.score - a.score);

  return {
    score,
    intensity,
    indicators: indicators.slice(0, 12),
    interpretation: generatePassionInterpretation(score, intensity, indicators),
  };
}

function sigmoid(x: number, midpoint: number, steepness: number): number {
  if (x <= 0) return Math.max(0.05, 0.5 * (1 + Math.tanh(x * steepness / 2)));
  return Math.min(0.98, 1 / (1 + Math.exp(-steepness * (x - midpoint))));
}

function getHouseForLon(lon: number, cusps: number[]): number | null {
  if (!cusps || cusps.length < 12) return null;
  for (let i = 0; i < 12; i++) {
    const start = cusps[i] % 360;
    const end = cusps[(i + 1) % 12] % 360;
    const l = lon % 360;
    if (start < end) { if (l >= start && l < end) return i + 1; }
    else { if (l >= start || l < end) return i + 1; }
  }
  return 1;
}

function getOrdinal(n: number): string {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}

function getPassionDescription(p1: string, p2: string, aspect: string): string {
  const isHard = ['Square', 'Opposition'].includes(aspect);
  const pk = [p1, p2].sort().join('|');
  const descriptions: Record<string, [string, string]> = {
    'Mars|Venus': ['classic desire chemistry that flows naturally', 'friction-fueled passion that creates explosive attraction'],
    'Mars|Mars': ['mutual drive and physical energy alignment', 'competitive sexual energy that needs conscious channeling'],
    'Mars|Pluto': ['primal transformative desire', 'intense power dynamics in physical intimacy'],
    'Pluto|Venus': ['magnetic soul-level attraction', 'obsessive desire that borders on consuming'],
    'Mars|Sun': ['energizing physical magnetism', 'ego-driven desire competition'],
    'Mars|Moon': ['emotionally charged physical connection', 'volatile blend of feelings and desire'],
    'Moon|Pluto': ['emotionally transformative intimacy', 'compulsive emotional-sexual bonding'],
    'Pluto|Sun': ['deeply empowering attraction', 'power-charged desire dynamics'],
    'Uranus|Venus': ['electrifying unexpected attraction', 'unstable but thrilling desire'],
    'Mars|Uranus': ['sudden intense physical chemistry', 'unpredictable passionate episodes'],
  };
  const pair = descriptions[pk];
  if (pair) return isHard ? pair[1] : pair[0];
  return isHard ? 'challenging but activating desire' : 'naturally flowing passion';
}

function getHousePassionMeaning(house: number, planet: string): string {
  const meanings: Record<number, string> = {
    1: `${planet} awakens immediate physical attraction`,
    5: `${planet} ignites romantic play and creative desire`,
    7: `${planet} activates partnership-level desire`,
    8: `${planet} touches the deepest intimate spaces`,
    12: `${planet} unlocks hidden fantasy and spiritual desire`,
  };
  return meanings[house] || `${planet} adds subtle passion energy`;
}

function generatePassionInterpretation(score: number, intensity: string, indicators: PassionIndicator[]): string {
  if (score >= 80) {
    return `The physical chemistry between you is extraordinary — ${intensity.toLowerCase()} intensity that most people only read about. ${indicators.length > 0 ? `Driven primarily by ${indicators[0].description.split(' — ')[1] || 'multiple activating contacts'}.` : ''} This level of desire is a gift, but it can also blind you to other dimensions of the relationship. Do not mistake passion for compatibility. The body knows what it wants, but it does not always know what is good for it. Channel this fire consciously.`;
  }
  if (score >= 60) {
    return `There is genuine, strong physical chemistry here. The desire between you is real and sustained — not a passing spark but a steady flame. ${indicators.length > 0 ? `Key drivers include ${indicators[0].description.split(' — ')[1] || 'multiple contacts'}.` : ''} This level of passion can deepen over time if both people stay present with each other rather than chasing the initial intensity. The work is keeping desire alive through vulnerability, not just novelty.`;
  }
  if (score >= 40) {
    return `Physical chemistry is present but not the defining feature of this connection. The desire exists — it may simply express through quieter channels or need more time and trust to fully emerge. This is not a weakness. Relationships with moderate passion often sustain longer because they are not built on the addictive highs that volcanic chemistry can create. Cultivate the desire that is there rather than mourning what is not.`;
  }
  return `Physical chemistry is not the primary bond here. This does not mean desire is absent — it may express more subtly or need specific conditions to emerge. Some of the most devoted partnerships have quieter passion. If this concerns you, consider that desire can be cultivated through emotional safety, novelty, and direct communication about needs. Passion is a skill as much as a spark.`;
}
