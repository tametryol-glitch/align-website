// ═══════════════════════════════════════════════════════════════════
// Marriage / Long-Term Commitment Scoring — SEPARATE Category
// 50+ indicators measuring long-term potential, not just attraction
// ═══════════════════════════════════════════════════════════════════

import { MidpointActivation } from './midpointEngine';
import { SIGN_FOR_LONGITUDE, getRulerOf, isMutualReception } from './customRulerships';

export interface MarriageIndicator {
  description: string;
  weight: number;
  type: 'strong' | 'moderate' | 'minor';
}

export interface MarriageResult {
  score: number; // 0-100
  level: 'Unlikely' | 'Possible' | 'Promising' | 'Strong' | 'Exceptional';
  indicators: MarriageIndicator[];
  domesticScore: number;
  loyaltyScore: number;
  growthTogetherScore: number;
  interpretation: string;
}

// Marriage indicator definitions
interface MarriageAspectDef {
  weight: number;
  type: MarriageIndicator['type'];
  desc: string;
  subcategory: 'domestic' | 'loyalty' | 'growth';
}

const MARRIAGE_ASPECT_PAIRS: Record<string, Record<string, MarriageAspectDef>> = {
  // Juno aspects — THE marriage asteroid
  'Juno|Sun': {
    Conjunction: { weight: 0.9, type: 'strong', desc: 'Juno conjunct Sun — your ideal partner archetype matches their core identity', subcategory: 'loyalty' },
    Trine: { weight: 0.7, type: 'moderate', desc: 'Juno trine Sun — natural alignment with commitment expectations', subcategory: 'loyalty' },
    Sextile: { weight: 0.5, type: 'moderate', desc: 'Juno sextile Sun — supportive commitment energy', subcategory: 'loyalty' },
    Opposition: { weight: 0.6, type: 'moderate', desc: 'Juno opposite Sun — magnetic pull toward formal partnership', subcategory: 'loyalty' },
  },
  'Juno|Moon': {
    Conjunction: { weight: 0.85, type: 'strong', desc: 'Juno conjunct Moon — emotional needs perfectly aligned with partnership expectations', subcategory: 'domestic' },
    Trine: { weight: 0.65, type: 'moderate', desc: 'Juno trine Moon — emotionally nurturing commitment', subcategory: 'domestic' },
    Opposition: { weight: 0.55, type: 'moderate', desc: 'Juno opposite Moon — emotional polarity that drives commitment', subcategory: 'domestic' },
  },
  'Juno|Venus': {
    Conjunction: { weight: 0.95, type: 'strong', desc: 'Juno conjunct Venus — love language and commitment style deeply aligned', subcategory: 'loyalty' },
    Trine: { weight: 0.75, type: 'moderate', desc: 'Juno trine Venus — love naturally flows into lasting commitment', subcategory: 'loyalty' },
    Sextile: { weight: 0.55, type: 'moderate', desc: 'Juno sextile Venus — gentle path toward partnership', subcategory: 'loyalty' },
  },
  'Juno|Mars': {
    Conjunction: { weight: 0.7, type: 'moderate', desc: 'Juno conjunct Mars — passion drives toward formal commitment', subcategory: 'loyalty' },
    Trine: { weight: 0.55, type: 'moderate', desc: 'Juno trine Mars — desire supports long-term bonding', subcategory: 'loyalty' },
  },
  'Juno|Juno': {
    Conjunction: { weight: 0.85, type: 'strong', desc: 'Juno conjunct Juno — identical partnership expectations', subcategory: 'loyalty' },
    Trine: { weight: 0.65, type: 'moderate', desc: 'Juno trine Juno — compatible commitment styles', subcategory: 'loyalty' },
    Opposition: { weight: 0.5, type: 'moderate', desc: 'Juno opposite Juno — complementary partnership needs', subcategory: 'loyalty' },
  },
  // Saturn aspects — commitment planet
  'Venus|Saturn': {
    Conjunction: { weight: 0.75, type: 'strong', desc: 'Venus conjunct Saturn — love that takes commitment seriously', subcategory: 'loyalty' },
    Trine: { weight: 0.7, type: 'strong', desc: 'Venus trine Saturn — enduring love with mature foundations', subcategory: 'loyalty' },
    Sextile: { weight: 0.55, type: 'moderate', desc: 'Venus sextile Saturn — steady, reliable affection', subcategory: 'loyalty' },
  },
  'Sun|Saturn': {
    Trine: { weight: 0.6, type: 'moderate', desc: 'Sun trine Saturn — mutual respect and structured support', subcategory: 'growth' },
    Sextile: { weight: 0.45, type: 'minor', desc: 'Sun sextile Saturn — supportive growth dynamic', subcategory: 'growth' },
    Conjunction: { weight: 0.5, type: 'moderate', desc: 'Sun conjunct Saturn — serious bond with staying power', subcategory: 'loyalty' },
  },
  'Moon|Saturn': {
    Trine: { weight: 0.65, type: 'moderate', desc: 'Moon trine Saturn — emotional security within commitment', subcategory: 'domestic' },
    Sextile: { weight: 0.5, type: 'moderate', desc: 'Moon sextile Saturn — stable emotional foundation', subcategory: 'domestic' },
  },
  // Sun-Moon — fundamental compatibility
  'Sun|Moon': {
    Conjunction: { weight: 0.8, type: 'strong', desc: 'Sun conjunct Moon — fundamental identity-emotion harmony', subcategory: 'domestic' },
    Trine: { weight: 0.7, type: 'strong', desc: 'Sun trine Moon — natural understanding and emotional support', subcategory: 'domestic' },
    Sextile: { weight: 0.55, type: 'moderate', desc: 'Sun sextile Moon — compatible core needs', subcategory: 'domestic' },
  },
  // Moon-Moon
  'Moon|Moon': {
    Conjunction: { weight: 0.7, type: 'strong', desc: 'Moon conjunct Moon — identical emotional needs and rhythms', subcategory: 'domestic' },
    Trine: { weight: 0.6, type: 'moderate', desc: 'Moon trine Moon — emotionally synchronized', subcategory: 'domestic' },
    Sextile: { weight: 0.45, type: 'moderate', desc: 'Moon sextile Moon — compatible emotional processing', subcategory: 'domestic' },
  },
  // Venus-Venus
  'Venus|Venus': {
    Conjunction: { weight: 0.6, type: 'moderate', desc: 'Venus conjunct Venus — shared values and love language', subcategory: 'domestic' },
    Trine: { weight: 0.5, type: 'moderate', desc: 'Venus trine Venus — naturally harmonious affection', subcategory: 'domestic' },
  },
  // Descendant contacts
  'Sun|Descendant': {
    Conjunction: { weight: 0.75, type: 'strong', desc: 'Sun conjunct Descendant — you embody their ideal partner', subcategory: 'loyalty' },
  },
  'Venus|Descendant': {
    Conjunction: { weight: 0.8, type: 'strong', desc: 'Venus conjunct Descendant — love itself conjunct the marriage point', subcategory: 'loyalty' },
  },
  'Moon|Descendant': {
    Conjunction: { weight: 0.65, type: 'moderate', desc: 'Moon conjunct Descendant — emotional nature fits their partnership needs', subcategory: 'domestic' },
  },
  // North Node — fated partnership
  'North Node|Venus': {
    Conjunction: { weight: 0.7, type: 'strong', desc: 'North Node conjunct Venus — love aligned with soul destiny', subcategory: 'growth' },
    Trine: { weight: 0.5, type: 'moderate', desc: 'North Node trine Venus — destiny supports the love connection', subcategory: 'growth' },
  },
  'North Node|Sun': {
    Conjunction: { weight: 0.65, type: 'moderate', desc: 'North Node conjunct Sun — identity growth through partnership', subcategory: 'growth' },
  },
  'North Node|Moon': {
    Conjunction: { weight: 0.6, type: 'moderate', desc: 'North Node conjunct Moon — emotional growth through this bond', subcategory: 'growth' },
  },
  // Vertex — fated marriage indicator
  'Vertex|Venus': {
    Conjunction: { weight: 0.75, type: 'strong', desc: 'Vertex conjunct Venus — fated love encounter', subcategory: 'loyalty' },
  },
  'Vertex|Sun': {
    Conjunction: { weight: 0.65, type: 'moderate', desc: 'Vertex conjunct Sun — destined meeting point', subcategory: 'growth' },
  },
  'Vertex|Juno': {
    Conjunction: { weight: 0.8, type: 'strong', desc: 'Vertex conjunct Juno — fate and commitment converge', subcategory: 'loyalty' },
  },
  // IC contacts — home and family
  'Moon|IC': {
    Conjunction: { weight: 0.7, type: 'strong', desc: 'Moon conjunct IC — feels like coming home', subcategory: 'domestic' },
    Trine: { weight: 0.5, type: 'moderate', desc: 'Moon trine IC — natural domestic harmony', subcategory: 'domestic' },
  },
  'Venus|IC': {
    Conjunction: { weight: 0.6, type: 'moderate', desc: 'Venus conjunct IC — love roots into the foundation of home', subcategory: 'domestic' },
  },
  // Jupiter — expansion and growth together
  'Jupiter|Venus': {
    Conjunction: { weight: 0.6, type: 'moderate', desc: 'Jupiter conjunct Venus — abundant love and shared generosity', subcategory: 'growth' },
    Trine: { weight: 0.5, type: 'moderate', desc: 'Jupiter trine Venus — love that grows and expands over time', subcategory: 'growth' },
  },
  'Jupiter|Sun': {
    Conjunction: { weight: 0.5, type: 'moderate', desc: 'Jupiter conjunct Sun — mutual encouragement and expansion', subcategory: 'growth' },
    Trine: { weight: 0.4, type: 'minor', desc: 'Jupiter trine Sun — supportive growth dynamic', subcategory: 'growth' },
  },
  // Chiron — healing through partnership
  'Chiron|Venus': {
    Conjunction: { weight: 0.45, type: 'moderate', desc: 'Chiron conjunct Venus — love that heals old wounds', subcategory: 'growth' },
    Trine: { weight: 0.35, type: 'minor', desc: 'Chiron trine Venus — gentle healing through affection', subcategory: 'growth' },
  },
  // Vesta — devotion
  'Vesta|Sun': {
    Conjunction: { weight: 0.5, type: 'moderate', desc: 'Vesta conjunct Sun — devoted to each other at core level', subcategory: 'loyalty' },
  },
  'Vesta|Moon': {
    Conjunction: { weight: 0.5, type: 'moderate', desc: 'Vesta conjunct Moon — devotion to emotional wellbeing', subcategory: 'domestic' },
  },
  'Vesta|Venus': {
    Conjunction: { weight: 0.55, type: 'moderate', desc: 'Vesta conjunct Venus — sacred devotion in love', subcategory: 'loyalty' },
  },
};

function pKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

// House overlays for marriage potential
const MARRIAGE_HOUSE_WEIGHTS: Record<number, { weight: number; subcategory: 'domestic' | 'loyalty' | 'growth' }> = {
  1: { weight: 0.3, subcategory: 'loyalty' },
  4: { weight: 0.8, subcategory: 'domestic' },
  7: { weight: 1.0, subcategory: 'loyalty' },
  10: { weight: 0.4, subcategory: 'growth' },
};

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

export function computeMarriageScore(
  aspects: Array<{
    inner: string;
    outer: string;
    aspect: string;
    orb: number;
    strength: number;
  }>,
  person1Positions: Array<{ name: string; longitude: number }>,
  person2Positions: Array<{ name: string; longitude: number }>,
  person1HouseCusps: number[],
  person2HouseCusps: number[],
  midpointActivations?: MidpointActivation[],
): MarriageResult {
  const indicators: MarriageIndicator[] = [];
  let domesticRaw = 0;
  let loyaltyRaw = 0;
  let growthRaw = 0;

  // 1. Aspect-based marriage scoring
  for (const asp of aspects) {
    const pk = pKey(asp.inner, asp.outer);
    const pairDef = MARRIAGE_ASPECT_PAIRS[pk];
    if (!pairDef) continue;

    const aspDef = pairDef[asp.aspect];
    if (!aspDef) continue;

    const orbDecay = Math.max(0, 1 - (asp.orb / 10));
    const weight = aspDef.weight * orbDecay;

    indicators.push({
      description: aspDef.desc,
      weight,
      type: aspDef.type,
    });

    if (aspDef.subcategory === 'domestic') domesticRaw += weight;
    else if (aspDef.subcategory === 'loyalty') loyaltyRaw += weight;
    else growthRaw += weight;
  }

  // 2. House overlay scoring for marriage
  function scoreMarriageOverlays(
    planets: Array<{ name: string; longitude: number }>,
    targetCusps: number[],
  ) {
    if (!targetCusps || targetCusps.length < 12) return;
    const marriagePlanets = ['Sun', 'Moon', 'Venus', 'Mars', 'Jupiter', 'Juno', 'Vesta'];
    for (const p of planets) {
      if (!marriagePlanets.includes(p.name)) continue;
      const house = getHouseForLon(p.longitude, targetCusps);
      if (house === null) continue;
      const hDef = MARRIAGE_HOUSE_WEIGHTS[house];
      if (!hDef) continue;

      const weight = hDef.weight * 0.6;
      indicators.push({
        description: `${p.name} in partner's ${house}th house — ${getMarriageHouseMeaning(house, p.name)}`,
        weight,
        type: weight >= 0.5 ? 'moderate' : 'minor',
      });
      if (hDef.subcategory === 'domestic') domesticRaw += weight;
      else if (hDef.subcategory === 'loyalty') loyaltyRaw += weight;
      else growthRaw += weight;
    }
  }

  scoreMarriageOverlays(person1Positions, person2HouseCusps);
  scoreMarriageOverlays(person2Positions, person1HouseCusps);

  // 3. Mutual reception bonus
  const posMap1 = new Map(person1Positions.map(p => [p.name, p.longitude]));
  const posMap2 = new Map(person2Positions.map(p => [p.name, p.longitude]));
  const receptionPairs = [['Venus', 'Mars'], ['Sun', 'Moon'], ['Venus', 'Saturn']];
  for (const [p1, p2] of receptionPairs) {
    const lon1a = posMap1.get(p1);
    const lon2a = posMap2.get(p2);
    if (lon1a !== undefined && lon2a !== undefined && isMutualReception(p1, lon1a, p2, lon2a)) {
      const weight = 0.6;
      indicators.push({
        description: `${p1}-${p2} mutual reception across charts — deep natural reciprocity`,
        weight,
        type: 'moderate',
      });
      loyaltyRaw += weight;
    }
  }

  // 4. Ruler of 7th house contacts
  for (const [cusps, otherPositions, label] of [
    [person1HouseCusps, person2Positions, 'Person 1'],
    [person2HouseCusps, person1Positions, 'Person 2'],
  ] as [number[], Array<{ name: string; longitude: number }>, string][]) {
    if (cusps && cusps.length >= 12) {
      const desc7Sign = SIGN_FOR_LONGITUDE(cusps[6]);
      const ruler7 = getRulerOf(desc7Sign);
      // Check if partner has planets aspecting this ruler
      for (const pos of otherPositions) {
        if (['Sun', 'Moon', 'Venus', 'Mars'].includes(pos.name)) {
          const rulerPos = label === 'Person 1'
            ? person1Positions.find(p => p.name === ruler7)
            : person2Positions.find(p => p.name === ruler7);
          if (rulerPos) {
            let diff = Math.abs(pos.longitude - rulerPos.longitude);
            diff = Math.min(diff, 360 - diff);
            if (diff <= 8) {
              const weight = 0.5 * Math.max(0, 1 - (diff / 8));
              indicators.push({
                description: `${pos.name} conjuncts ${label}'s 7th house ruler (${ruler7}) — strong marriage signature`,
                weight,
                type: 'moderate',
              });
              loyaltyRaw += weight;
            }
          }
        }
      }
    }
  }

  // 5. Midpoint marriage indicators
  if (midpointActivations) {
    const marriageMidpoints = midpointActivations.filter(
      a => ['Juno', 'Venus', 'Saturn'].includes(a.midpoint.planet1) ||
           ['Juno', 'Venus', 'Saturn'].includes(a.midpoint.planet2) ||
           ['Juno', 'Vertex'].includes(a.activatingPlanet)
    );
    for (const mp of marriageMidpoints.slice(0, 8)) {
      const weight = mp.strength * 0.5;
      indicators.push({
        description: `${mp.activatingPlanet} activates ${mp.midpoint.label} — commitment energy amplified`,
        weight,
        type: weight >= 0.3 ? 'moderate' : 'minor',
      });
      loyaltyRaw += weight;
    }
  }

  const totalRaw = domesticRaw + loyaltyRaw + growthRaw;
  const score = Math.round(Math.min(100, Math.max(0, sigmoidM(totalRaw, 6, 0.35) * 100)));
  const domesticScore = Math.round(Math.min(100, sigmoidM(domesticRaw, 2.5, 0.5) * 100));
  const loyaltyScore = Math.round(Math.min(100, sigmoidM(loyaltyRaw, 3, 0.45) * 100));
  const growthTogetherScore = Math.round(Math.min(100, sigmoidM(growthRaw, 2, 0.5) * 100));

  const level: MarriageResult['level'] =
    score >= 80 ? 'Exceptional' :
    score >= 65 ? 'Strong' :
    score >= 50 ? 'Promising' :
    score >= 35 ? 'Possible' : 'Unlikely';

  indicators.sort((a, b) => b.weight - a.weight);

  return {
    score,
    level,
    indicators: indicators.slice(0, 15),
    domesticScore,
    loyaltyScore,
    growthTogetherScore,
    interpretation: generateMarriageInterpretation(score, level, indicators, domesticScore, loyaltyScore, growthTogetherScore),
  };
}

function sigmoidM(x: number, midpoint: number, steepness: number): number {
  if (x <= 0) return Math.max(0.05, 0.5 * (1 + Math.tanh(x * steepness / 2)));
  return Math.min(0.98, 1 / (1 + Math.exp(-steepness * (x - midpoint))));
}

function getMarriageHouseMeaning(house: number, planet: string): string {
  const meanings: Record<number, string> = {
    1: `${planet} naturally fits into their life presentation`,
    4: `${planet} touches the deepest foundation of home and family`,
    7: `${planet} lands directly on the marriage axis`,
    10: `${planet} supports shared public life and legacy`,
  };
  return meanings[house] || `${planet} adds commitment energy`;
}

function generateMarriageInterpretation(
  score: number, level: string, indicators: MarriageIndicator[],
  domestic: number, loyalty: number, growth: number,
): string {
  const strongCount = indicators.filter(i => i.type === 'strong').length;

  if (score >= 80) {
    return `This pairing carries exceptional markers for lasting commitment. Domestic harmony (${domestic}%), loyalty foundations (${loyalty}%), mutual growth (${growth}%). ${strongCount >= 3 ? `With ${strongCount} strong marriage indicators, this is the kind of chart overlay that professional astrologers flag as marriage potential.` : ''} ${indicators.length > 0 ? `Key signatures: ${indicators.slice(0, 2).map(i => i.description).join('; ')}.` : ''} These scores describe potential, not fate. The strongest marriage charts still require two people choosing each other daily.`;
  }
  if (score >= 65) {
    return `Strong long-term potential is present. Domestic harmony (${domestic}%), loyalty (${loyalty}%), growth together (${growth}%). ${indicators.length > 0 ? `Notable indicators: ${indicators.slice(0, 2).map(i => i.description).join('; ')}.` : ''} This combination suggests a relationship that can naturally evolve into lasting partnership when both people are ready. The energy supports commitment — the timing and readiness are up to you.`;
  }
  if (score >= 50) {
    return `Marriage potential is present but requires conscious building. Domestic (${domestic}%), loyalty (${loyalty}%), growth (${growth}%). The foundations exist but may need active cultivation. ${indicators.length > 0 ? `Areas to develop: ${indicators[0].description}.` : ''} Some of the most devoted marriages have modest cosmic indicators but extraordinary human commitment. The stars provide the material — you build the house.`;
  }
  if (score >= 35) {
    return `Long-term commitment markers are moderate. The connection may be powerful in other dimensions (passion, karma, intellectual rapport) without having the classic marriage signatures. This does not mean marriage is impossible — it means the relationship may need to find its own form rather than following a traditional template. Focus on what this bond naturally does well.`;
  }
  return `Classic marriage indicators are minimal in this overlay. This often means the connection serves a different purpose — growth, healing, passion, or karmic resolution — rather than conventional long-term partnership. Honor what the connection actually is rather than forcing it into a form it does not naturally take. Some of the most important relationships in a life are not the ones that last the longest.`;
}
