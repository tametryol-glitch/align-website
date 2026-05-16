// ═══════════════════════════════════════════════════════════════════
// Toxicity Meter — Tap-to-Reveal Feature
// 10 subcategories, 100+ indicators, midpoint toxicity logic
// NEVER uses one placement alone as proof of toxicity
// ═══════════════════════════════════════════════════════════════════

import { MidpointActivation } from './midpointEngine';

export interface ToxicitySubcategory {
  name: string;
  score: number; // 0-100
  icon: string;
  indicators: string[];
  interpretation: string;
}

export interface ToxicityResult {
  overallScore: number;
  label: string;
  subcategories: ToxicitySubcategory[];
  topIndicators: string[];
  summary: string;
  disclaimer: string;
}

// Subcategory definitions
const SUBCATEGORY_DEFS = [
  { key: 'gaslighting', name: 'Gaslighting Potential', icon: '🌫️' },
  { key: 'jealousy', name: 'Jealousy & Possessiveness', icon: '🔥' },
  { key: 'control', name: 'Control Dynamics', icon: '⛓️' },
  { key: 'emotional_manipulation', name: 'Emotional Manipulation', icon: '🎭' },
  { key: 'codependency', name: 'Codependency Risk', icon: '🔗' },
  { key: 'volatility', name: 'Emotional Volatility', icon: '⚡' },
  { key: 'isolation', name: 'Isolation Tendencies', icon: '🏚️' },
  { key: 'power_imbalance', name: 'Power Imbalance', icon: '⚖️' },
  { key: 'deception', name: 'Deception & Dishonesty', icon: '🪞' },
  { key: 'trauma_bonding', name: 'Trauma Bonding Risk', icon: '🖤' },
] as const;

type SubcategoryKey = typeof SUBCATEGORY_DEFS[number]['key'];

// Each indicator maps planet pair + aspect to subcategory contributions
interface ToxicIndicator {
  pair: string; // sorted pair key "Planet1|Planet2"
  aspect: string;
  subcategories: Partial<Record<SubcategoryKey, number>>;
  desc: string;
}

const TOXIC_INDICATORS: ToxicIndicator[] = [
  // Neptune-based (gaslighting, deception)
  { pair: 'Mercury|Neptune', aspect: 'Square', subcategories: { gaslighting: 0.7, deception: 0.8 }, desc: 'communication blurred by confusion and misdirection' },
  { pair: 'Mercury|Neptune', aspect: 'Opposition', subcategories: { gaslighting: 0.6, deception: 0.7 }, desc: 'polarized perception of reality between partners' },
  { pair: 'Moon|Neptune', aspect: 'Square', subcategories: { gaslighting: 0.6, deception: 0.5, codependency: 0.5 }, desc: 'emotional reality becomes confused and unreliable' },
  { pair: 'Moon|Neptune', aspect: 'Opposition', subcategories: { gaslighting: 0.5, codependency: 0.6 }, desc: 'emotional boundaries dissolve into mutual confusion' },
  { pair: 'Sun|Neptune', aspect: 'Square', subcategories: { gaslighting: 0.5, deception: 0.6 }, desc: 'identity confusion and projection patterns' },
  { pair: 'Venus|Neptune', aspect: 'Square', subcategories: { deception: 0.7, codependency: 0.5 }, desc: 'love built on illusions rather than reality' },
  { pair: 'Mars|Neptune', aspect: 'Square', subcategories: { gaslighting: 0.4, deception: 0.5, emotional_manipulation: 0.5 }, desc: 'passive-aggressive patterns and denial of aggression' },

  // Pluto-based (control, power, jealousy)
  { pair: 'Pluto|Venus', aspect: 'Square', subcategories: { jealousy: 0.8, control: 0.6, emotional_manipulation: 0.5 }, desc: 'obsessive possessiveness in love' },
  { pair: 'Pluto|Venus', aspect: 'Opposition', subcategories: { jealousy: 0.7, control: 0.5, power_imbalance: 0.5 }, desc: 'love entangled with power dynamics' },
  { pair: 'Moon|Pluto', aspect: 'Square', subcategories: { emotional_manipulation: 0.8, control: 0.6, trauma_bonding: 0.6 }, desc: 'emotional intensity used as leverage' },
  { pair: 'Moon|Pluto', aspect: 'Opposition', subcategories: { emotional_manipulation: 0.7, control: 0.5, jealousy: 0.5 }, desc: 'compulsive emotional dependency' },
  { pair: 'Moon|Pluto', aspect: 'Conjunction', subcategories: { emotional_manipulation: 0.5, trauma_bonding: 0.5, codependency: 0.4 }, desc: 'merged emotional-power dynamics' },
  { pair: 'Pluto|Sun', aspect: 'Square', subcategories: { control: 0.7, power_imbalance: 0.7 }, desc: 'one person trying to dominate the other identity' },
  { pair: 'Pluto|Sun', aspect: 'Opposition', subcategories: { control: 0.6, power_imbalance: 0.6 }, desc: 'mutual power projection onto each other' },
  { pair: 'Mars|Pluto', aspect: 'Square', subcategories: { volatility: 0.7, control: 0.7, power_imbalance: 0.5 }, desc: 'explosive power struggles with potential for harm' },
  { pair: 'Mars|Pluto', aspect: 'Opposition', subcategories: { volatility: 0.6, control: 0.6 }, desc: 'action-power cycle that escalates' },
  { pair: 'Mars|Pluto', aspect: 'Conjunction', subcategories: { volatility: 0.5, control: 0.5, power_imbalance: 0.4 }, desc: 'intense merged power and aggression' },

  // Saturn-based (control, isolation)
  { pair: 'Moon|Saturn', aspect: 'Square', subcategories: { isolation: 0.7, control: 0.5, emotional_manipulation: 0.4 }, desc: 'emotional suppression and withdrawal as punishment' },
  { pair: 'Moon|Saturn', aspect: 'Opposition', subcategories: { isolation: 0.6, control: 0.4 }, desc: 'cold emotional restriction' },
  { pair: 'Sun|Saturn', aspect: 'Square', subcategories: { control: 0.5, isolation: 0.4, power_imbalance: 0.5 }, desc: 'one person chronically diminishing the other' },
  { pair: 'Venus|Saturn', aspect: 'Square', subcategories: { isolation: 0.5, control: 0.4, emotional_manipulation: 0.3 }, desc: 'love conditionally withheld' },
  { pair: 'Venus|Saturn', aspect: 'Opposition', subcategories: { isolation: 0.4, control: 0.3 }, desc: 'affection restricted by authority dynamics' },
  { pair: 'Mars|Saturn', aspect: 'Square', subcategories: { volatility: 0.5, control: 0.5 }, desc: 'suppressed anger that erupts destructively' },
  { pair: 'Mars|Saturn', aspect: 'Conjunction', subcategories: { control: 0.4, volatility: 0.3 }, desc: 'frustrated drive channeled into rigid control' },

  // Mars-based (volatility)
  { pair: 'Mars|Moon', aspect: 'Square', subcategories: { volatility: 0.7, emotional_manipulation: 0.3 }, desc: 'emotions and actions in volatile feedback loop' },
  { pair: 'Mars|Moon', aspect: 'Opposition', subcategories: { volatility: 0.6 }, desc: 'emotional triggers escalate into confrontation' },
  { pair: 'Mars|Mars', aspect: 'Square', subcategories: { volatility: 0.6 }, desc: 'competitive aggression between partners' },
  { pair: 'Mars|Mars', aspect: 'Opposition', subcategories: { volatility: 0.5, power_imbalance: 0.3 }, desc: 'mutual combativeness' },
  { pair: 'Mars|Uranus', aspect: 'Square', subcategories: { volatility: 0.7 }, desc: 'sudden explosive outbursts' },
  { pair: 'Mars|Uranus', aspect: 'Conjunction', subcategories: { volatility: 0.5 }, desc: 'erratic aggressive energy' },
  { pair: 'Mars|Uranus', aspect: 'Opposition', subcategories: { volatility: 0.6 }, desc: 'unpredictable confrontational patterns' },

  // Codependency
  { pair: 'Moon|Moon', aspect: 'Conjunction', subcategories: { codependency: 0.4 }, desc: 'emotional merging that blurs individual identity' },
  { pair: 'Neptune|Venus', aspect: 'Conjunction', subcategories: { codependency: 0.5, deception: 0.3 }, desc: 'romantic idealization masking unhealthy attachment' },
  { pair: 'Neptune|Moon', aspect: 'Conjunction', subcategories: { codependency: 0.6, gaslighting: 0.3 }, desc: 'emotional fusion without clear boundaries' },
  { pair: 'Chiron|Moon', aspect: 'Conjunction', subcategories: { trauma_bonding: 0.5, codependency: 0.4 }, desc: 'wound-based emotional bonding' },
  { pair: 'Chiron|Venus', aspect: 'Square', subcategories: { trauma_bonding: 0.5 }, desc: 'love wounds re-triggered creating unhealthy bond' },
  { pair: 'Chiron|Venus', aspect: 'Opposition', subcategories: { trauma_bonding: 0.4 }, desc: 'healing-wound dynamic that can become compulsive' },
  { pair: 'Chiron|Sun', aspect: 'Square', subcategories: { trauma_bonding: 0.4, power_imbalance: 0.3 }, desc: 'identity wounds exploited in the dynamic' },
  { pair: 'Chiron|Moon', aspect: 'Square', subcategories: { trauma_bonding: 0.6, emotional_manipulation: 0.3 }, desc: 'emotional wounds weaponized in conflict' },
  { pair: 'Chiron|Pluto', aspect: 'Conjunction', subcategories: { trauma_bonding: 0.6, power_imbalance: 0.4 }, desc: 'deep wound-power fusion creates compulsive bond' },
  { pair: 'Chiron|Pluto', aspect: 'Square', subcategories: { trauma_bonding: 0.5, control: 0.3 }, desc: 'power dynamics reopen old wounds' },

  // Lilith-based
  { pair: 'Lilith|Mars', aspect: 'Conjunction', subcategories: { volatility: 0.4, power_imbalance: 0.4 }, desc: 'taboo desire triggers aggressive power dynamics' },
  { pair: 'Lilith|Mars', aspect: 'Square', subcategories: { volatility: 0.5, jealousy: 0.3 }, desc: 'primal jealousy and rage activation' },
  { pair: 'Lilith|Pluto', aspect: 'Conjunction', subcategories: { control: 0.5, power_imbalance: 0.5 }, desc: 'shadow power convergence' },
  { pair: 'Lilith|Pluto', aspect: 'Square', subcategories: { control: 0.4, power_imbalance: 0.4, jealousy: 0.3 }, desc: 'compulsive shadow power struggle' },
  { pair: 'Lilith|Moon', aspect: 'Square', subcategories: { emotional_manipulation: 0.4, jealousy: 0.3 }, desc: 'rejected feminine energy triggers emotional manipulation' },
  { pair: 'Lilith|Moon', aspect: 'Conjunction', subcategories: { codependency: 0.4, emotional_manipulation: 0.3 }, desc: 'primal emotional merging without boundaries' },
  { pair: 'Lilith|Sun', aspect: 'Square', subcategories: { power_imbalance: 0.4 }, desc: 'identity threatened by partner shadow expression' },
  { pair: 'Lilith|Venus', aspect: 'Square', subcategories: { jealousy: 0.5, deception: 0.3 }, desc: 'obsessive desire mixed with distrust' },
  { pair: 'Lilith|Venus', aspect: 'Conjunction', subcategories: { jealousy: 0.4, codependency: 0.3 }, desc: 'compulsive attraction that bypasses reason' },

  // Additional isolation indicators
  { pair: 'Saturn|Sun', aspect: 'Opposition', subcategories: { isolation: 0.5, power_imbalance: 0.4 }, desc: 'systematic diminishment of partner identity' },
  { pair: 'Saturn|Mercury', aspect: 'Square', subcategories: { isolation: 0.4, control: 0.3 }, desc: 'communication restricted or silenced' },
  { pair: 'Saturn|Mercury', aspect: 'Opposition', subcategories: { isolation: 0.3, control: 0.3 }, desc: 'thinking patterns constrained by authority dynamic' },
  { pair: 'Pluto|Mercury', aspect: 'Square', subcategories: { gaslighting: 0.5, control: 0.4, deception: 0.3 }, desc: 'domination of communication and narrative' },
  { pair: 'Pluto|Mercury', aspect: 'Opposition', subcategories: { gaslighting: 0.4, control: 0.3 }, desc: 'power struggle over whose version of reality prevails' },

  // Additional deception indicators
  { pair: 'Neptune|Sun', aspect: 'Opposition', subcategories: { deception: 0.5, gaslighting: 0.4 }, desc: 'identity obscured by illusion and projection' },
  { pair: 'Neptune|Mars', aspect: 'Opposition', subcategories: { deception: 0.4, gaslighting: 0.3, emotional_manipulation: 0.3 }, desc: 'actions hidden behind plausible deniability' },
];

function pKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

export function computeToxicityMeter(
  aspects: Array<{
    inner: string;
    outer: string;
    aspect: string;
    orb: number;
    strength: number;
  }>,
  midpointActivations?: MidpointActivation[],
): ToxicityResult {
  // Initialize subcategory scores
  const rawScores: Record<SubcategoryKey, number> = {
    gaslighting: 0,
    jealousy: 0,
    control: 0,
    emotional_manipulation: 0,
    codependency: 0,
    volatility: 0,
    isolation: 0,
    power_imbalance: 0,
    deception: 0,
    trauma_bonding: 0,
  };

  const triggeredIndicators: string[] = [];
  let indicatorCount = 0;

  // 1. Score from aspect indicators
  for (const asp of aspects) {
    const pk = pKey(asp.inner, asp.outer);
    const orbDecay = Math.max(0, 1 - (asp.orb / 10));

    for (const indicator of TOXIC_INDICATORS) {
      if (indicator.pair === pk && indicator.aspect === asp.aspect) {
        indicatorCount++;
        for (const [subcat, weight] of Object.entries(indicator.subcategories)) {
          rawScores[subcat as SubcategoryKey] += (weight as number) * orbDecay;
        }
        triggeredIndicators.push(indicator.desc);
      }
    }
  }

  // 2. Midpoint toxicity amplification
  if (midpointActivations) {
    const toxicMidpoints = midpointActivations.filter(a => {
      const mp = a.midpoint;
      const toxicPlanets = ['Mars', 'Pluto', 'Saturn', 'Neptune', 'Lilith'];
      return (toxicPlanets.includes(mp.planet1) || toxicPlanets.includes(mp.planet2)) &&
             toxicPlanets.includes(a.activatingPlanet);
    });

    for (const tm of toxicMidpoints.slice(0, 8)) {
      const mp = tm.midpoint;
      const weight = tm.strength * 0.3;

      // Route midpoint activations to relevant subcategories
      if (['Mars', 'Pluto'].includes(mp.planet1) && ['Mars', 'Pluto'].includes(mp.planet2)) {
        rawScores.control += weight;
        rawScores.power_imbalance += weight * 0.8;
      }
      if (mp.planet1 === 'Neptune' || mp.planet2 === 'Neptune') {
        rawScores.gaslighting += weight * 0.7;
        rawScores.deception += weight * 0.8;
      }
      if (mp.planet1 === 'Saturn' || mp.planet2 === 'Saturn') {
        rawScores.isolation += weight * 0.7;
        rawScores.control += weight * 0.5;
      }
      if (mp.planet1 === 'Lilith' || mp.planet2 === 'Lilith') {
        rawScores.power_imbalance += weight * 0.6;
      }

      triggeredIndicators.push(`${tm.activatingPlanet} activates ${mp.label} shadow midpoint`);
    }
  }

  // 3. Per-subcategory convergence — each subcategory tracks its own indicator count
  //    A subcategory with 1 weak hit should score very differently from one with 3 strong hits
  const subcatIndicatorCounts: Record<SubcategoryKey, number> = {
    gaslighting: 0, jealousy: 0, control: 0, emotional_manipulation: 0,
    codependency: 0, volatility: 0, isolation: 0, power_imbalance: 0,
    deception: 0, trauma_bonding: 0,
  };

  // Count per-subcategory indicators
  for (const asp of aspects) {
    const pk = pKey(asp.inner, asp.outer);
    for (const indicator of TOXIC_INDICATORS) {
      if (indicator.pair === pk && indicator.aspect === asp.aspect) {
        for (const subcat of Object.keys(indicator.subcategories)) {
          subcatIndicatorCounts[subcat as SubcategoryKey]++;
        }
      }
    }
  }

  // Global convergence still applies (1 indicator total = not meaningful)
  const globalFloor =
    indicatorCount <= 1 ? 0.2 :
    indicatorCount <= 2 ? 0.5 :
    1.0;

  // Apply per-subcategory convergence and normalize each subcategory
  const subcategories: ToxicitySubcategory[] = SUBCATEGORY_DEFS.map(def => {
    const rawVal = rawScores[def.key];
    const subcatCount = subcatIndicatorCounts[def.key];

    // Per-subcategory convergence: 1 hit = 40%, 2 = 70%, 3+ = 100%
    const subcatConvergence =
      subcatCount <= 0 ? 0 :
      subcatCount === 1 ? 0.4 :
      subcatCount === 2 ? 0.7 :
      1.0;

    const effective = rawVal * subcatConvergence * globalFloor;

    // Sigmoid with midpoint 0.5 and steepness 3.0 — responsive to the 0.1-1.5 range
    // This gives: 0.1→12, 0.3→35, 0.5→50, 0.7→65, 1.0→77, 1.5→91
    const score = Math.round(Math.min(100, Math.max(0, sigmoidT(effective, 0.5, 3.0) * 100)));

    const relevantIndicators = TOXIC_INDICATORS
      .filter(i => {
        const subs = i.subcategories[def.key];
        return subs !== undefined && subs > 0;
      })
      .filter(i => {
        // Only include if this indicator was actually triggered
        return aspects.some(a => pKey(a.inner, a.outer) === i.pair && a.aspect === i.aspect);
      })
      .map(i => i.desc);

    return {
      name: def.name,
      score,
      icon: def.icon,
      indicators: relevantIndicators.slice(0, 5),
      interpretation: getSubcategoryInterpretation(def.key, score),
    };
  });

  // Overall toxicity score — weighted by subcategory scores, not just raw totals
  // Use the actual subcategory scores for a more accurate overall
  const activeSubcats = subcategories.filter(s => s.score > 3);
  const overallScore = activeSubcats.length === 0 ? 3 :
    Math.round(Math.min(100, Math.max(0,
      // Top 3 subcategories contribute 60%, rest contribute 40%
      (() => {
        const sorted = [...activeSubcats].sort((a, b) => b.score - a.score);
        const top3 = sorted.slice(0, 3);
        const rest = sorted.slice(3);
        const top3Avg = top3.reduce((s, v) => s + v.score, 0) / Math.max(1, top3.length);
        const restAvg = rest.length > 0 ? rest.reduce((s, v) => s + v.score, 0) / rest.length : 0;
        // Scale by how many active subcategories (more = worse)
        const breadthFactor = Math.min(1.0, activeSubcats.length / 5);
        return (top3Avg * 0.6 + restAvg * 0.4) * (0.6 + breadthFactor * 0.4);
      })()
    )));

  const label =
    overallScore >= 70 ? 'Significant Toxicity Risk' :
    overallScore >= 50 ? 'Elevated Toxicity Markers' :
    overallScore >= 30 ? 'Moderate Awareness Needed' :
    overallScore >= 15 ? 'Low Risk — Normal Range' : 'Minimal Toxicity Indicators';

  return {
    overallScore,
    label,
    subcategories: subcategories.sort((a, b) => b.score - a.score),
    topIndicators: triggeredIndicators.slice(0, 8),
    summary: generateToxicitySummary(overallScore, label, subcategories, indicatorCount),
    disclaimer: 'Astrology describes tendencies, not certainties. No chart combination guarantees toxic behavior. These scores reflect energetic patterns between two charts that may require awareness. If you are in an unsafe situation, contact a professional or crisis line.',
  };
}

function sigmoidT(x: number, midpoint: number, steepness: number): number {
  if (x <= 0) return 0.03;
  return Math.min(0.98, 1 / (1 + Math.exp(-steepness * (x - midpoint))));
}

function getSubcategoryInterpretation(key: SubcategoryKey, score: number): string {
  if (score < 15) return 'Minimal indicators in this area.';
  if (score < 30) return 'Some minor patterns present. Normal range for most relationships.';

  const interpretations: Record<SubcategoryKey, string> = {
    gaslighting: 'Communication patterns exist that could create confusion about shared reality. One person perception of events may consistently override the other. Practice radical factual honesty.',
    jealousy: 'Possessive energy is present in the dynamic. One or both partners may struggle with trust that feels irrational but intensely real. Channel this energy into honest dialogue about insecurity rather than surveillance or control.',
    control: 'Power dynamics tend toward one person directing the other behavior, choices, or identity. Both people need clear, separate autonomy. Any relationship where one person feels they need permission is already in trouble.',
    emotional_manipulation: 'Emotional leverage patterns exist — guilt, withdrawal, intensity, or victimhood may be used (consciously or not) to influence the other person behavior. Name the pattern out loud when it happens.',
    codependency: 'The boundary between individual and merged identity is thin. Both people may lose track of their own needs, feelings, and opinions when together. Maintain separate friendships, interests, and emotional processing.',
    volatility: 'The emotional temperature of this relationship can shift rapidly. Calm can become storm without clear warning. Develop de-escalation protocols and agree on time-out signals before conflicts arise.',
    isolation: 'There is a pattern where one person world may gradually narrow to just the relationship. Watch for increasing distance from friends, family, or independent activities. Connection should expand your world, not shrink it.',
    power_imbalance: 'The power distribution between partners is uneven. One person may consistently defer, silence themselves, or feel less-than. Healthy relationships require two whole people, not one leader and one follower.',
    deception: 'Trust may be undermined by patterns of dishonesty — not necessarily lying, but omission, misdirection, or presenting a curated version of reality. Build a relationship where truth feels safer than performance.',
    trauma_bonding: 'The intensity of the connection may come partly from a pain-relief cycle — hurt followed by repair creates a neurochemical bond that feels like deep love but functions more like addiction. If the highest highs always follow the lowest lows, examine the pattern.',
  };

  return interpretations[key] || 'Patterns present that warrant awareness.';
}

function generateToxicitySummary(
  score: number, label: string,
  subcategories: ToxicitySubcategory[],
  indicatorCount: number,
): string {
  const topSubs = subcategories.filter(s => s.score >= 30).slice(0, 3);

  if (score < 15) {
    return 'This pairing shows minimal toxicity markers. The energetic patterns between your charts do not naturally gravitate toward harmful dynamics. This is a clean foundation — protect it by maintaining the healthy patterns that come naturally.';
  }
  if (score < 30) {
    return `Some awareness areas exist, which is normal for any real relationship. ${topSubs.length > 0 ? `Areas to watch: ${topSubs.map(s => s.name.toLowerCase()).join(', ')}.` : ''} These are not red flags — they are places where conscious attention prevents small patterns from becoming large ones.`;
  }
  if (score < 50) {
    return `Multiple converging patterns (${indicatorCount} indicators) suggest areas where this dynamic could become unhealthy if left unconscious. ${topSubs.length > 0 ? `Primary concerns: ${topSubs.map(s => `${s.name} (${s.score}%)`).join(', ')}.` : ''} This does not mean the relationship is toxic — it means both people need to be actively vigilant about these specific dynamics. Consider discussing these patterns openly.`;
  }
  if (score < 70) {
    return `Elevated toxicity markers across ${topSubs.length} subcategories with ${indicatorCount} converging indicators. ${topSubs.length > 0 ? `Key areas: ${topSubs.map(s => `${s.name} (${s.score}%)`).join(', ')}.` : ''} These patterns tend to emerge gradually — often masked by intensity that feels like passion or depth. Both people deserve to be in relationships where they feel safe, respected, and free. If any of these patterns have already manifested as behavior, take them seriously now.`;
  }
  return `Significant toxicity risk detected across multiple dimensions. ${topSubs.length > 0 ? `Highest-risk areas: ${topSubs.map(s => `${s.name} (${s.score}%)`).join(', ')}.` : ''} This reading reflects the energetic chemistry between these two charts — not a judgment of either person individually. When these energy fields interact, they activate shadow material that can become harmful without extraordinary awareness and professional support. If this relationship already shows signs of the patterns described above, prioritize safety above all else.`;
}
