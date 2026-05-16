// ═══════════════════════════════════════════════════════════════════
// Violence / Control Risk Scoring — SEPARATE Category
// Measures potential for coercive control, volatility, abuse patterns
// Uses multiple placements — NEVER one placement alone
// ═══════════════════════════════════════════════════════════════════

import { MidpointActivation } from './midpointEngine';

export interface ViolenceIndicator {
  description: string;
  weight: number;
  category: 'control' | 'volatility' | 'manipulation' | 'isolation' | 'rage';
  planets: string[];
}

export interface ViolenceRiskResult {
  score: number; // 0-100
  level: 'Low' | 'Moderate' | 'Elevated' | 'High';
  indicators: ViolenceIndicator[];
  controlScore: number;
  volatilityScore: number;
  manipulationScore: number;
  interpretation: string;
}

// Aspect combinations that indicate control/violence risk
// IMPORTANT: No single aspect = violence. Requires MULTIPLE converging indicators.
const RISK_ASPECT_PAIRS: Record<string, {
  aspects: Record<string, { weight: number; category: ViolenceIndicator['category']; desc: string }>;
}> = {
  'Mars|Pluto': {
    aspects: {
      Conjunction: { weight: 0.6, category: 'control', desc: 'intense power dynamics with potential for domination' },
      Square: { weight: 0.7, category: 'rage', desc: 'explosive power struggles that can turn destructive' },
      Opposition: { weight: 0.65, category: 'control', desc: 'polarized power dynamic with projection' },
    },
  },
  'Mars|Saturn': {
    aspects: {
      Conjunction: { weight: 0.45, category: 'control', desc: 'frustrated action channeled into rigid control' },
      Square: { weight: 0.55, category: 'rage', desc: 'suppressed anger that builds to eruption' },
      Opposition: { weight: 0.5, category: 'control', desc: 'authority conflicts with simmering resentment' },
    },
  },
  'Moon|Pluto': {
    aspects: {
      Square: { weight: 0.55, category: 'manipulation', desc: 'emotional manipulation through fear or intensity' },
      Opposition: { weight: 0.5, category: 'manipulation', desc: 'emotional power struggles with compulsive quality' },
      Conjunction: { weight: 0.4, category: 'manipulation', desc: 'emotionally consuming bond that can become controlling' },
    },
  },
  'Moon|Saturn': {
    aspects: {
      Square: { weight: 0.5, category: 'isolation', desc: 'emotional withdrawal used as punishment' },
      Opposition: { weight: 0.45, category: 'isolation', desc: 'emotional coldness and restriction' },
      Conjunction: { weight: 0.35, category: 'control', desc: 'parenting dynamic that suppresses emotional expression' },
    },
  },
  'Sun|Pluto': {
    aspects: {
      Square: { weight: 0.55, category: 'control', desc: 'identity domination and ego-based power games' },
      Opposition: { weight: 0.5, category: 'control', desc: 'intense mutual need to control the other person' },
    },
  },
  'Venus|Pluto': {
    aspects: {
      Square: { weight: 0.5, category: 'manipulation', desc: 'possessive obsession disguised as devotion' },
      Opposition: { weight: 0.45, category: 'manipulation', desc: 'jealousy and power struggles over affection' },
    },
  },
  'Mars|Uranus': {
    aspects: {
      Conjunction: { weight: 0.4, category: 'volatility', desc: 'unpredictable outbursts of anger' },
      Square: { weight: 0.5, category: 'volatility', desc: 'sudden explosive conflicts without warning' },
      Opposition: { weight: 0.45, category: 'volatility', desc: 'erratic confrontational patterns' },
    },
  },
  'Sun|Saturn': {
    aspects: {
      Square: { weight: 0.4, category: 'control', desc: 'one person chronically diminishing the other identity' },
      Opposition: { weight: 0.35, category: 'isolation', desc: 'authority dynamics that restrict self-expression' },
    },
  },
  'Mars|Neptune': {
    aspects: {
      Square: { weight: 0.35, category: 'manipulation', desc: 'passive-aggressive patterns and gaslighting potential' },
      Opposition: { weight: 0.3, category: 'manipulation', desc: 'confusing anger dynamics and victim-playing' },
    },
  },
  'Venus|Saturn': {
    aspects: {
      Square: { weight: 0.35, category: 'isolation', desc: 'love withheld as punishment or control mechanism' },
      Opposition: { weight: 0.3, category: 'control', desc: 'conditional love that demands conformity' },
    },
  },
  'Moon|Mars': {
    aspects: {
      Square: { weight: 0.45, category: 'volatility', desc: 'emotions quickly escalate to hostile action' },
      Opposition: { weight: 0.4, category: 'volatility', desc: 'emotional reactivity that triggers aggressive responses' },
    },
  },
};

function pKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

export function computeViolenceRiskScore(
  aspects: Array<{
    inner: string;
    outer: string;
    aspect: string;
    orb: number;
    strength: number;
  }>,
  midpointActivations?: MidpointActivation[],
): ViolenceRiskResult {
  const indicators: ViolenceIndicator[] = [];
  let controlRaw = 0;
  let volatilityRaw = 0;
  let manipulationRaw = 0;

  // 1. Aspect-based risk scoring
  for (const asp of aspects) {
    const pk = pKey(asp.inner, asp.outer);
    const riskDef = RISK_ASPECT_PAIRS[pk];
    if (!riskDef) continue;

    const aspDef = riskDef.aspects[asp.aspect];
    if (!aspDef) continue;

    const orbDecay = Math.max(0, 1 - (asp.orb / 10));
    const weight = aspDef.weight * orbDecay;

    indicators.push({
      description: aspDef.desc,
      weight,
      category: aspDef.category,
      planets: [asp.inner, asp.outer],
    });

    if (aspDef.category === 'control' || aspDef.category === 'isolation') {
      controlRaw += weight;
    } else if (aspDef.category === 'volatility' || aspDef.category === 'rage') {
      volatilityRaw += weight;
    } else if (aspDef.category === 'manipulation') {
      manipulationRaw += weight;
    }
  }

  // 2. Shadow midpoint activations
  if (midpointActivations) {
    const shadowActivations = midpointActivations.filter(
      a => {
        const mp = a.midpoint;
        const shadowPlanets = ['Mars', 'Pluto', 'Saturn'];
        return (
          (shadowPlanets.includes(mp.planet1) && shadowPlanets.includes(mp.planet2)) ||
          (shadowPlanets.includes(a.activatingPlanet) &&
           (shadowPlanets.includes(mp.planet1) || shadowPlanets.includes(mp.planet2)))
        );
      }
    );

    for (const sa of shadowActivations.slice(0, 5)) {
      const weight = sa.strength * 0.4;
      indicators.push({
        description: `${sa.activatingPlanet} activates ${sa.midpoint.label} shadow midpoint — intensifies control/power dynamics`,
        weight,
        category: 'control',
        planets: [sa.activatingPlanet, sa.midpoint.planet1, sa.midpoint.planet2],
      });
      controlRaw += weight;
    }
  }

  // 3. Convergence multiplier — risk is exponential with multiple indicators
  const indicatorCount = indicators.length;
  const convergenceMultiplier =
    indicatorCount <= 1 ? 0.3 : // Single indicator = almost no risk
    indicatorCount <= 2 ? 0.5 :
    indicatorCount <= 3 ? 0.7 :
    indicatorCount <= 4 ? 0.85 :
    1.0;

  const totalRaw = (controlRaw + volatilityRaw + manipulationRaw) * convergenceMultiplier;

  // Normalize — intentionally conservative, high scores should be rare
  const score = Math.round(Math.min(100, Math.max(0, sigmoidRisk(totalRaw, 3.5, 0.6) * 100)));

  const controlScore = Math.round(Math.min(100, sigmoidRisk(controlRaw * convergenceMultiplier, 2, 0.7) * 100));
  const volatilityScore = Math.round(Math.min(100, sigmoidRisk(volatilityRaw * convergenceMultiplier, 2, 0.7) * 100));
  const manipulationScore = Math.round(Math.min(100, sigmoidRisk(manipulationRaw * convergenceMultiplier, 2, 0.7) * 100));

  const level: ViolenceRiskResult['level'] =
    score >= 70 ? 'High' :
    score >= 50 ? 'Elevated' :
    score >= 30 ? 'Moderate' : 'Low';

  indicators.sort((a, b) => b.weight - a.weight);

  return {
    score,
    level,
    indicators: indicators.slice(0, 10),
    controlScore,
    volatilityScore,
    manipulationScore,
    interpretation: generateViolenceInterpretation(score, level, indicators, controlScore, volatilityScore, manipulationScore),
  };
}

function sigmoidRisk(x: number, midpoint: number, steepness: number): number {
  if (x <= 0) return 0.05;
  return Math.min(0.98, 1 / (1 + Math.exp(-steepness * (x - midpoint))));
}

function generateViolenceInterpretation(
  score: number,
  level: string,
  indicators: ViolenceIndicator[],
  control: number,
  volatility: number,
  manipulation: number,
): string {
  if (score < 20) {
    return 'This pairing shows minimal markers for coercive or controlling dynamics. The energetic patterns between you do not naturally gravitate toward power imbalance. This does not guarantee a conflict-free relationship — but the cosmic wiring does not predispose this bond toward harmful patterns. Maintain the mutual respect that comes naturally here.';
  }

  if (score < 40) {
    return `Some tension points exist that could escalate under stress, but they are within normal range for any real relationship. ${indicators.length > 0 ? `The primary area to watch: ${indicators[0].description}.` : ''} With self-awareness and communication, these energies can be directed constructively. The key is recognizing early signs of frustration before they compound.`;
  }

  if (score < 60) {
    const dominant = control >= volatility && control >= manipulation ? 'control dynamics' :
                     volatility >= manipulation ? 'volatility patterns' : 'manipulation tendencies';
    return `Multiple converging indicators suggest this relationship has a meaningful pattern toward ${dominant}. This does not mean harm is inevitable — it means both people need to be extraordinarily conscious about power dynamics. ${indicators.length >= 2 ? `Watch specifically for: ${indicators[0].description}, and ${indicators[1].description}.` : ''} Couples therapy or honest dialogue about boundaries is strongly recommended. These patterns tend to surface gradually, not all at once.`;
  }

  if (score < 80) {
    return `This pairing shows elevated risk markers across multiple dimensions — control (${control}%), volatility (${volatility}%), manipulation (${manipulation}%). ${indicators.length >= 3 ? `Key dynamics include: ${indicators.slice(0, 3).map(i => i.description).join('; ')}.` : ''} This does not mean either person is inherently harmful. It means the chemistry between you activates shadow material that requires professional-level awareness. If either person has unresolved trauma around power, anger, or control, this relationship will surface it — whether they are ready or not. Proceed with eyes wide open.`;
  }

  return `Significant converging risk patterns are present. Control: ${control}%, Volatility: ${volatility}%, Manipulation: ${manipulation}%. Multiple independent indicators point toward a dynamic where power imbalance can become entrenched. ${indicators.length >= 3 ? `Primary patterns: ${indicators.slice(0, 3).map(i => i.description).join('; ')}.` : ''} This is not a judgment of either person — it is a reading of what happens when these two energy fields interact. Both people deserve to be in relationships where they feel safe. If this dynamic has already shown signs of harm, take them seriously. If it has not yet, build strong boundaries now — before the patterns have a chance to crystallize.`;
}
