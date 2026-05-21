import type { RelationshipProfile } from '@/lib/relationshipProfileService';

export interface PreferenceBreakdown {
  category: string;
  score: number;
  maxScore: number;
  alignment: 'strong' | 'moderate' | 'weak' | 'conflict';
  label: string;
}

export interface PreferenceMatchResult {
  score: number;
  breakdown: PreferenceBreakdown[];
}

// ── Intent grouping ──

const INTENT_GROUP: Record<string, string> = {
  'Long-term relationship': 'A',
  'Life partner / marriage-minded': 'A',
  'Serious but open to pace': 'A',
  'Dating with intention': 'B',
  'Friends first': 'B',
  'Spiritual connection': 'B',
  'Open to seeing where it goes': 'C',
  'Short-term dating': 'C',
  'Casual connection': 'C',
  'Ethical non-monogamy': 'D',
  'Open relationship': 'D',
  'Polyamorous': 'D',
  'Still figuring it out': 'C',
};

const GROUP_DISTANCE: Record<string, Record<string, number>> = {
  A: { A: 0, B: 1, C: 2, D: 2 },
  B: { A: 1, B: 0, C: 1, D: 2 },
  C: { A: 2, B: 1, C: 0, D: 1 },
  D: { A: 2, B: 2, C: 1, D: 0 },
};

// ── Pace / spirituality ordinals ──

const PACE_ORDER = ['Slow and intentional', 'Moderate', 'Fast chemistry', 'Let it unfold naturally'];
const SPIRITUAL_ORDER = ['Very spiritual', 'Somewhat spiritual', 'Open but unsure', 'Not a focus', 'Prefer not to say'];

// ── Connection type relatedness ──

const RELATED_CONNECTIONS: Record<string, string[]> = {
  'Romance': ['Marriage', 'Sacred union'],
  'Marriage': ['Romance', 'Sacred union'],
  'Sacred union': ['Romance', 'Marriage', 'Spiritual partnership'],
  'Casual chemistry': ['Friendship', 'Creative partner'],
  'Friendship': ['Casual chemistry', 'Creative partner'],
  'Creative partner': ['Friendship', 'Casual chemistry'],
  'Healing connection': ['Spiritual partnership', 'Sacred union'],
  'Spiritual partnership': ['Healing connection', 'Sacred union'],
};

// ── Dealbreaker conflicts ──

const DEALBREAKER_CONFLICTS: [string, string][] = [
  ['Wants children', 'Does not want children'],
  ['Monogamy only', 'Open to ENM'],
  ['Local only', 'Open to long-distance'],
  ['Serious only', 'Casual connection'],
];

const DEALBREAKER_ALIGNMENTS: [string, string][] = [
  ['Wants children', 'Wants children'],
  ['Wants children', 'Open to children'],
  ['Does not want children', 'Does not want children'],
  ['Monogamy only', 'Monogamy only'],
  ['Open to ENM', 'Open to ENM'],
  ['Spiritual partner preferred', 'Spiritual partner preferred'],
  ['Friendship first', 'Friendship first'],
  ['Slow burn', 'Slow burn'],
  ['Serious only', 'Serious only'],
  ['Open to long-distance', 'Open to long-distance'],
  ['Local only', 'Local only'],
];

// ── Helpers ──

function neutralScore(maxPts: number): number {
  return Math.round(maxPts * 0.6);
}

function alignmentFromRatio(score: number, max: number): 'strong' | 'moderate' | 'weak' | 'conflict' {
  const ratio = max > 0 ? score / max : 0.5;
  if (ratio >= 0.8) return 'strong';
  if (ratio >= 0.55) return 'moderate';
  if (ratio >= 0.3) return 'weak';
  return 'conflict';
}

function ordinalDistance(list: string[], a: string | null | undefined, b: string | null | undefined): number | null {
  if (!a || !b) return null;
  const idxA = list.indexOf(a);
  const idxB = list.indexOf(b);
  if (idxA === -1 || idxB === -1) return null;
  return Math.abs(idxA - idxB);
}

function ordinalScore(maxPts: number, dist: number | null, maxDist: number): number {
  if (dist === null) return neutralScore(maxPts);
  if (dist === 0) return maxPts;
  if (dist === 1) return Math.round(maxPts * 0.7);
  if (dist === 2) return Math.round(maxPts * 0.4);
  return Math.round(maxPts * 0.2);
}

// ── Main engine ──

export function computePreferenceMatch(
  userA: Partial<RelationshipProfile>,
  userB: Partial<RelationshipProfile>,
): PreferenceMatchResult {
  const breakdown: PreferenceBreakdown[] = [];

  // 1. Relationship Style (20 pts)
  const styleA = userA.relationship_style;
  const styleB = userB.relationship_style;
  let styleScore: number;
  let styleLabel: string;

  if (!styleA || !styleB || styleA === 'Prefer not to say' || styleB === 'Prefer not to say') {
    styleScore = neutralScore(20);
    styleLabel = 'Style not specified';
  } else if (styleA === styleB) {
    styleScore = 20;
    styleLabel = `Both ${styleA.toLowerCase()}`;
  } else {
    const isAdjacentA = styleA === 'Open to non-monogamy' || styleB === 'Open to non-monogamy';
    const monoSet = new Set(['Monogamous']);
    const hardNonMono = new Set(['Ethical non-monogamy', 'Polyamorous']);
    if ((monoSet.has(styleA) && hardNonMono.has(styleB)) || (monoSet.has(styleB) && hardNonMono.has(styleA))) {
      styleScore = 3;
      styleLabel = 'Different relationship styles';
    } else if (isAdjacentA) {
      styleScore = 14;
      styleLabel = 'Compatible styles';
    } else {
      styleScore = 8;
      styleLabel = 'Different styles';
    }
  }
  breakdown.push({ category: 'Style', score: styleScore, maxScore: 20, alignment: alignmentFromRatio(styleScore, 20), label: styleLabel });

  // 2. Primary Intent (20 pts)
  const intentA = userA.relationship_primary_intent;
  const intentB = userB.relationship_primary_intent;
  let intentScore: number;
  let intentLabel: string;

  if (!intentA || !intentB) {
    intentScore = neutralScore(20);
    intentLabel = 'Intent not specified';
  } else {
    const gA = INTENT_GROUP[intentA] || 'C';
    const gB = INTENT_GROUP[intentB] || 'C';
    const dist = GROUP_DISTANCE[gA]?.[gB] ?? 2;
    if (dist === 0) {
      intentScore = 20;
      intentLabel = intentA === intentB ? `Both ${intentA.toLowerCase()}` : 'Same relationship goals';
    } else if (dist === 1) {
      intentScore = 12;
      intentLabel = 'Similar intentions';
    } else {
      intentScore = 5;
      intentLabel = 'Different intentions';
    }
  }
  breakdown.push({ category: 'Intent', score: intentScore, maxScore: 20, alignment: alignmentFromRatio(intentScore, 20), label: intentLabel });

  // 3. Dealbreakers (15 pts)
  const prefsA = userA.relationship_preferences || [];
  const prefsB = userB.relationship_preferences || [];
  let dealScore: number;
  let dealLabel: string;

  if (prefsA.length === 0 && prefsB.length === 0) {
    dealScore = neutralScore(15);
    dealLabel = 'No dealbreakers set';
  } else {
    dealScore = 7;
    let conflicts = 0;
    let alignments = 0;

    for (const [a, b] of DEALBREAKER_CONFLICTS) {
      if ((prefsA.includes(a) && prefsB.includes(b)) || (prefsA.includes(b) && prefsB.includes(a))) {
        conflicts++;
      }
    }

    for (const [a, b] of DEALBREAKER_ALIGNMENTS) {
      if (prefsA.includes(a) && prefsB.includes(b)) {
        alignments++;
      }
    }

    dealScore = Math.max(0, Math.min(15, 7 - conflicts * 5 + alignments * 3));

    if (conflicts > 0) dealLabel = `${conflicts} potential dealbreaker${conflicts > 1 ? 's' : ''}`;
    else if (alignments >= 2) dealLabel = 'Aligned lifestyle goals';
    else dealLabel = 'Compatible lifestyle';
  }
  breakdown.push({ category: 'Dealbreakers', score: dealScore, maxScore: 15, alignment: alignmentFromRatio(dealScore, 15), label: dealLabel });

  // 4. Connection Type (10 pts)
  const connA = userA.connection_type_wanted;
  const connB = userB.connection_type_wanted;
  let connScore: number;
  let connLabel: string;

  if (!connA || !connB) {
    connScore = neutralScore(10);
    connLabel = 'Connection type not set';
  } else if (connA === connB) {
    connScore = 10;
    connLabel = `Both seeking ${connA.toLowerCase()}`;
  } else if (RELATED_CONNECTIONS[connA]?.includes(connB)) {
    connScore = 7;
    connLabel = 'Related connection goals';
  } else {
    connScore = 3;
    connLabel = 'Different connection types';
  }
  breakdown.push({ category: 'Connection', score: connScore, maxScore: 10, alignment: alignmentFromRatio(connScore, 10), label: connLabel });

  // 5. Energetic Pace (10 pts)
  const paceDist = ordinalDistance(PACE_ORDER, userA.energetic_pace, userB.energetic_pace);
  const paceScore = ordinalScore(10, paceDist, 3);
  const paceLabel = paceDist === null ? 'Pace not set' : paceDist === 0 ? 'Same pace' : paceDist === 1 ? 'Similar pace' : 'Different pace';
  breakdown.push({ category: 'Pace', score: paceScore, maxScore: 10, alignment: alignmentFromRatio(paceScore, 10), label: paceLabel });

  // 6. Spiritual Openness (10 pts)
  const spiritDist = ordinalDistance(SPIRITUAL_ORDER, userA.spiritual_openness, userB.spiritual_openness);
  const spiritScore = ordinalScore(10, spiritDist, 4);
  const spiritLabel = spiritDist === null ? 'Spirituality not set' : spiritDist === 0 ? 'Spiritually aligned' : spiritDist === 1 ? 'Similar spirituality' : 'Different spiritual views';
  breakdown.push({ category: 'Spirituality', score: spiritScore, maxScore: 10, alignment: alignmentFromRatio(spiritScore, 10), label: spiritLabel });

  // 7. Secondary Intent Overlap (10 pts)
  const secA = userA.relationship_secondary_intents || [];
  const secB = userB.relationship_secondary_intents || [];
  let overlapScore: number;
  let overlapLabel: string;

  if (secA.length === 0 && secB.length === 0) {
    overlapScore = neutralScore(10);
    overlapLabel = 'Secondary intents not set';
  } else {
    const shared = secA.filter(s => secB.includes(s)).length;
    if (shared >= 3) { overlapScore = 10; overlapLabel = 'Shared goals'; }
    else if (shared === 2) { overlapScore = 8; overlapLabel = 'Shared goals'; }
    else if (shared === 1) { overlapScore = 5; overlapLabel = 'Some shared goals'; }
    else { overlapScore = 2; overlapLabel = 'Different secondary goals'; }
  }
  breakdown.push({ category: 'Shared Goals', score: overlapScore, maxScore: 10, alignment: alignmentFromRatio(overlapScore, 10), label: overlapLabel });

  // 8. Orientation Alignment (5 pts)
  const oriA = userA.sexual_orientation || [];
  const oriB = userB.sexual_orientation || [];
  let oriScore: number;
  let oriLabel: string;

  if (oriA.length === 0 && oriB.length === 0) {
    oriScore = neutralScore(5);
    oriLabel = 'Orientation not set';
  } else {
    const shared = oriA.filter(o => oriB.includes(o)).length;
    oriScore = shared > 0 ? 5 : 3;
    oriLabel = shared > 0 ? 'Compatible orientation' : 'Orientation noted';
  }
  breakdown.push({ category: 'Orientation', score: oriScore, maxScore: 5, alignment: alignmentFromRatio(oriScore, 5), label: oriLabel });

  const total = breakdown.reduce((sum, b) => sum + b.score, 0);

  return { score: total, breakdown };
}
