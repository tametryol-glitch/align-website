/**
 * Relationship Aura Service (Web)
 *
 * Computes aura chemistry between two users based on their latest
 * aura scan data. Ported from mobile align-app/src/services/relationshipAuraService.ts.
 *
 * Uses color element theory (warm/cool/neutral), complementary color
 * dynamics, and chakra alignment. Data comes from aura_sessions table.
 */

import { createClient } from '@/lib/supabase';
import { AURA_COLORS } from '@/lib/auraColors';
import type {
  AuraColorName,
  AuraColorScore,
  RelationshipAuraResult,
  ChakraName,
} from '@/types/aura';

// ── Get User Aura Triad ────────────────────────────────────────────

export async function getUserAuraTriad(
  userId: string,
): Promise<{
  outerAura: AuraColorScore;
  innerAura: AuraColorScore;
  emotionalCore: AuraColorScore;
} | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('aura_sessions')
      .select('outer_aura_color, outer_aura_hex, inner_aura_color, inner_aura_hex, emotional_core_color, emotional_core_hex')
      .eq('user_id', userId)
      .order('scan_date', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

    const makeScore = (color: AuraColorName, hex: string): AuraColorScore => {
      const def = AURA_COLORS[color];
      return {
        color,
        score: 50,
        hex: hex || def?.hex || '#F7FAFC',
        label: def?.label || color,
      };
    };

    return {
      outerAura: makeScore(data.outer_aura_color, data.outer_aura_hex),
      innerAura: makeScore(data.inner_aura_color, data.inner_aura_hex),
      emotionalCore: makeScore(data.emotional_core_color, data.emotional_core_hex),
    };
  } catch {
    return null;
  }
}

// ── Color Element Theory ───────────────────────────────────────────

type ColorElement = 'fire' | 'water' | 'earth' | 'air' | 'spirit';

const COLOR_ELEMENTS: Record<AuraColorName, ColorElement> = {
  red:    'fire',
  orange: 'fire',
  yellow: 'air',
  green:  'earth',
  blue:   'water',
  indigo: 'water',
  violet: 'spirit',
  white:  'spirit',
  gold:   'fire',
  pink:   'water',
  gray:   'earth',
  black:  'spirit',
};

const ELEMENT_HARMONY: Record<string, number> = {
  'fire-fire':     0.75,
  'fire-water':    0.40,
  'fire-earth':    0.55,
  'fire-air':      0.85,
  'fire-spirit':   0.65,
  'water-water':   0.80,
  'water-earth':   0.75,
  'water-air':     0.50,
  'water-spirit':  0.70,
  'earth-earth':   0.70,
  'earth-air':     0.55,
  'earth-spirit':  0.60,
  'air-air':       0.75,
  'air-spirit':    0.70,
  'spirit-spirit': 0.85,
};

function getElementHarmony(a: ColorElement, b: ColorElement): number {
  return ELEMENT_HARMONY[`${a}-${b}`] ?? ELEMENT_HARMONY[`${b}-${a}`] ?? 0.5;
}

// ── Complementary / Opposite Color Pairs ───────────────────────────

const COMPLEMENTARY_PAIRS: [AuraColorName, AuraColorName][] = [
  ['red', 'green'],
  ['orange', 'blue'],
  ['yellow', 'violet'],
  ['gold', 'indigo'],
  ['pink', 'green'],
  ['black', 'white'],
];

function isComplementary(a: AuraColorName, b: AuraColorName): boolean {
  return COMPLEMENTARY_PAIRS.some(
    ([x, y]) => (a === x && b === y) || (a === y && b === x),
  );
}

// ── Same / Similar Color Logic ─────────────────────────────────────

const SIMILAR_GROUPS: AuraColorName[][] = [
  ['red', 'orange', 'gold'],
  ['blue', 'indigo'],
  ['violet', 'white'],
  ['green', 'pink'],
  ['gray', 'black'],
];

function isSimilar(a: AuraColorName, b: AuraColorName): boolean {
  if (a === b) return true;
  return SIMILAR_GROUPS.some(g => g.includes(a) && g.includes(b));
}

// ── Chakra Alignment ───────────────────────────────────────────────

const CHAKRA_ORDER: ChakraName[] = [
  'root', 'sacral', 'solar_plexus', 'heart', 'throat', 'third_eye', 'crown',
];

function chakraDistance(a: AuraColorName, b: AuraColorName): number {
  const ca = AURA_COLORS[a]?.chakra;
  const cb = AURA_COLORS[b]?.chakra;
  if (!ca || !cb) return 3;
  const ia = CHAKRA_ORDER.indexOf(ca);
  const ib = CHAKRA_ORDER.indexOf(cb);
  return Math.abs(ia - ib);
}

// ── Core Computation ───────────────────────────────────────────────

export async function computeRelationshipAura(
  userAId: string,
  userBId: string,
): Promise<RelationshipAuraResult | null> {
  const [aData, bData] = await Promise.all([
    getUserAuraTriad(userAId),
    getUserAuraTriad(userBId),
  ]);
  if (!aData || !bData) return null;
  return computeFromTriads(aData, bData);
}

export function computeFromTriads(
  aData: { outerAura: AuraColorScore; innerAura: AuraColorScore; emotionalCore: AuraColorScore },
  bData: { outerAura: AuraColorScore; innerAura: AuraColorScore; emotionalCore: AuraColorScore },
): RelationshipAuraResult {
  const aOuter = aData.outerAura.color;
  const bOuter = bData.outerAura.color;
  const aInner = aData.innerAura.color;
  const bInner = bData.innerAura.color;
  const aCore = aData.emotionalCore.color;
  const bCore = bData.emotionalCore.color;

  // 1. Aura Chemistry Score
  const outerHarmony = getElementHarmony(COLOR_ELEMENTS[aOuter], COLOR_ELEMENTS[bOuter]);
  const innerHarmony = getElementHarmony(COLOR_ELEMENTS[aInner], COLOR_ELEMENTS[bInner]);
  const coreHarmony = getElementHarmony(COLOR_ELEMENTS[aCore], COLOR_ELEMENTS[bCore]);

  const compBonus = isComplementary(aOuter, bOuter) ? 0.10 :
                    isComplementary(aInner, bInner) ? 0.07 : 0;
  const sameBonus = (aOuter === bOuter ? 0.05 : 0) +
                    (aInner === bInner ? 0.05 : 0) +
                    (aCore === bCore ? 0.08 : 0);

  const auraChemistryRaw = (outerHarmony * 0.4 + innerHarmony * 0.3 + coreHarmony * 0.3) + compBonus + sameBonus;
  const auraChemistryScore = Math.round(Math.min(1, Math.max(0, auraChemistryRaw)) * 100);

  // 2. Emotional Safety Score
  const emotionalSafetyRaw =
    innerHarmony * 0.5 +
    coreHarmony * 0.3 +
    (isSimilar(aCore, bCore) ? 0.15 : 0) +
    (chakraDistance(aCore, bCore) <= 1 ? 0.05 : 0);
  const emotionalSafetyScore = Math.round(Math.min(1, Math.max(0, emotionalSafetyRaw)) * 100);

  // 3. Attraction Heat
  const fireCount = [aOuter, bOuter].filter(c => COLOR_ELEMENTS[c] === 'fire').length;
  const passionColors: AuraColorName[] = ['red', 'orange', 'pink', 'gold'];
  const passionCount = [aOuter, bOuter].filter(c => passionColors.includes(c)).length;

  const attractionRaw =
    outerHarmony * 0.4 +
    (fireCount * 0.12) +
    (passionCount * 0.08) +
    (isComplementary(aOuter, bOuter) ? 0.15 : 0) +
    (isSimilar(aOuter, bOuter) ? 0.1 : 0);
  const attractionHeat = Math.round(Math.min(1, Math.max(0, attractionRaw)) * 100);

  // 4. Communication Field
  const commColors: AuraColorName[] = ['blue', 'yellow', 'orange'];
  const commPresence = [aOuter, bOuter, aInner, bInner].filter(c => commColors.includes(c)).length;
  const airPresence = [aOuter, bOuter, aInner, bInner].filter(c => COLOR_ELEMENTS[c] === 'air').length;
  const throatAlignment = chakraDistance(aOuter, bOuter) <= 2 ? 0.15 : 0;

  const communicationRaw =
    outerHarmony * 0.25 +
    innerHarmony * 0.25 +
    (commPresence * 0.06) +
    (airPresence * 0.06) +
    throatAlignment;
  const communicationField = Math.round(Math.min(1, Math.max(0, communicationRaw)) * 100);

  // 5. Conflict Weather
  const conflictingElements = (
    (COLOR_ELEMENTS[aOuter] === 'fire' && COLOR_ELEMENTS[bOuter] === 'water') ||
    (COLOR_ELEMENTS[aOuter] === 'water' && COLOR_ELEMENTS[bOuter] === 'fire')
  );
  const bothGuarded = [aOuter, bOuter].every(c => ['gray', 'black'].includes(c));
  const bothIntense = [aOuter, bOuter].every(c => ['red', 'black'].includes(c));

  let conflictRaw = outerHarmony * 0.35 + innerHarmony * 0.25 + coreHarmony * 0.2;
  if (conflictingElements) conflictRaw -= 0.15;
  if (bothGuarded) conflictRaw -= 0.10;
  if (bothIntense) conflictRaw -= 0.10;
  if (isComplementary(aOuter, bOuter)) conflictRaw += 0.05;
  const conflictWeather = Math.round(Math.min(1, Math.max(0, conflictRaw)) * 100);

  // 6. Best Approach
  const bestApproach = generateBestApproach(
    aData.outerAura, bData.outerAura,
    aData.emotionalCore, bData.emotionalCore,
    auraChemistryScore,
  );

  return {
    personAOuterAura: aData.outerAura,
    personBOuterAura: bData.outerAura,
    auraChemistryScore,
    emotionalSafetyScore,
    attractionHeat,
    communicationField,
    conflictWeather,
    bestApproach,
  };
}

// ── Best Approach Generator ────────────────────────────────────────

function generateBestApproach(
  aOuter: AuraColorScore,
  bOuter: AuraColorScore,
  aCore: AuraColorScore,
  bCore: AuraColorScore,
  chemistry: number,
): string {
  const aEl = COLOR_ELEMENTS[aOuter.color];
  const bEl = COLOR_ELEMENTS[bOuter.color];

  if (chemistry >= 80) {
    return `Your energies are naturally aligned. The ${aOuter.label.toLowerCase()}-${bOuter.label.toLowerCase()} combination creates effortless flow. Lead with authenticity.`;
  }
  if (chemistry >= 60) {
    if (isComplementary(aOuter.color, bOuter.color)) {
      return `You are energetic opposites — and that is your strength. Your ${aOuter.label.toLowerCase()} energy balances their ${bOuter.label.toLowerCase()} energy. Approach with curiosity about your differences.`;
    }
    return `There is warmth here. Your ${aOuter.label.toLowerCase()} energy meets their ${bOuter.label.toLowerCase()} energy with moderate ease. Show up gently and give space for the connection to deepen.`;
  }
  if (chemistry >= 40) {
    if (aEl === 'fire' && bEl === 'water') {
      return `Fire and water create steam — intensity is likely. Move slowly, communicate clearly, and avoid assuming you know what they feel.`;
    }
    if (aEl === bEl) {
      return `You share the same elemental energy (${aEl}), which creates understanding but may lack polarity. Introduce variety to keep the energy dynamic.`;
    }
    return `This connection will require patience. Your ${aOuter.label.toLowerCase()} field and their ${bOuter.label.toLowerCase()} field may need time to attune. Focus on listening more than projecting.`;
  }
  return `Your energies are very different right now. This does not mean incompatibility — it means the connection requires conscious effort. Meet each other where you are, not where you want each other to be.`;
}

// ── Template Reading Generator ─────────────────────────────────────

export function generateTemplateRelationshipReading(
  result: RelationshipAuraResult,
  partnerName: string,
): Array<{ title: string; icon: string; content: string }> {
  const aColor = AURA_COLORS[result.personAOuterAura.color];
  const bColor = AURA_COLORS[result.personBOuterAura.color];

  return [
    {
      icon: '\u{1F4AB}',
      title: 'Aura Chemistry Overview',
      content: `Your ${aColor.label.toLowerCase()} energy meets ${partnerName}'s ${bColor.label.toLowerCase()} energy with a chemistry score of ${result.auraChemistryScore}/100. ${result.auraChemistryScore >= 70 ? 'This is a naturally resonant combination.' : result.auraChemistryScore >= 45 ? 'There is genuine potential here with conscious effort.' : 'Your energies are different — this may require patience and curiosity.'}`,
    },
    {
      icon: '\u{1F525}',
      title: 'Attraction & Magnetism',
      content: `The attraction field between your auras reads at ${result.attractionHeat}/100. ${result.attractionHeat >= 70 ? 'There is strong magnetic pull between your energy fields.' : result.attractionHeat >= 45 ? 'There is a steady warmth — attraction builds over time here.' : 'The magnetism is subtle. Connection may grow through shared experiences rather than instant spark.'}`,
    },
    {
      icon: '\u{1F49A}',
      title: 'Emotional Safety',
      content: `Emotional safety between your fields scores ${result.emotionalSafetyScore}/100. ${result.emotionalSafetyScore >= 70 ? 'Your emotional cores are aligned — vulnerability comes naturally here.' : result.emotionalSafetyScore >= 45 ? 'There is safety here, but both of you may need reassurance before fully opening up.' : 'Emotional trust will take time. Go slowly and build safety through consistency.'}`,
    },
    {
      icon: '\u{1F4AC}',
      title: 'Communication Energy',
      content: `Your communication field reads ${result.communicationField}/100. ${result.communicationField >= 70 ? 'Words flow easily between you. Honest conversation is your superpower.' : result.communicationField >= 45 ? 'Communication works but may need conscious effort to avoid assumptions.' : 'Be intentional with words. What feels clear to you may land differently with them.'}`,
    },
    {
      icon: '⚡',
      title: 'Conflict Weather',
      content: `Conflict weather: ${result.conflictWeather >= 70 ? 'Mostly clear skies' : result.conflictWeather >= 45 ? 'Occasional storms possible' : 'Turbulent periods likely'} (${result.conflictWeather}/100). ${result.conflictWeather >= 70 ? 'Disagreements resolve quickly with this combination.' : 'When tensions rise, return to the emotional safety you have built.'}`,
    },
    {
      icon: '\u{1F31F}',
      title: 'Best Approach',
      content: result.bestApproach,
    },
  ];
}
