// ── Galactic Clock Interpretation Engine ──
// Generates meaning from the current Galactic Signature

import type { RulerName, RulerMeaning, GalacticSignature, InterpretationResult } from './types';

// ── Full Ruler Meanings ──

export const RULER_FULL_MEANINGS: Record<RulerName, RulerMeaning> = {
  Mars: {
    keywords: ['action', 'force', 'courage', 'initiation', 'drive'],
    expression: 'move, act, push forward',
    use: 'Good for decisive action, starting projects, physical exertion, and confronting obstacles head-on',
    caution: 'Avoid impulsiveness, aggression, and reckless decisions',
    color: '#EF4444',
    glyph: '♂',
  },
  Venus: {
    keywords: ['attraction', 'beauty', 'love', 'harmony', 'value'],
    expression: 'attract, create, beautify',
    use: 'Good for relationships, creative pursuits, financial decisions, and cultivating pleasure',
    caution: 'Avoid overindulgence, vanity, and passive complacency',
    color: '#F472B6',
    glyph: '♀',
  },
  Mercury: {
    keywords: ['thought', 'language', 'trade', 'analysis', 'communication'],
    expression: 'think, speak, analyze',
    use: 'Good for writing, learning, negotiations, and data-driven tasks',
    caution: 'Avoid overthinking, gossip, and scattered attention',
    color: '#6EE7B7',
    glyph: '☿',
  },
  Moon: {
    keywords: ['emotion', 'instinct', 'memory', 'receptivity', 'care'],
    expression: 'feel, nurture, remember',
    use: 'Good for self-care, emotional processing, family matters, and intuitive decisions',
    caution: 'Avoid emotional reactivity, clinginess, and avoidance of logic',
    color: '#C4B5FD',
    glyph: '☽',
  },
  Sun: {
    keywords: ['vitality', 'identity', 'visibility', 'leadership', 'creative force'],
    expression: 'shine, lead, express',
    use: 'Good for public appearances, leadership tasks, creative expression, and confidence-building',
    caution: 'Avoid ego inflation, arrogance, and dominating others',
    color: '#F59E0B',
    glyph: '☉',
  },
  Vesta: {
    keywords: ['devotion', 'focus', 'purification', 'sacred work', 'discipline'],
    expression: 'dedicate, purify, focus',
    use: 'Good for deep work, rituals, cleaning, and single-pointed concentration',
    caution: 'Avoid workaholism, rigidity, and isolation from others',
    color: '#FB923C',
    glyph: '\u26B6',
  },
  Juno: {
    keywords: ['union', 'commitment', 'partnership', 'balance', 'contracts'],
    expression: 'bond, commit, balance',
    use: 'Good for partnerships, contracts, relationship talks, and collaborative work',
    caution: 'Avoid codependency, jealousy, and power struggles in relationships',
    color: '#A78BFA',
    glyph: '⚵',
  },
  Pluto: {
    keywords: ['power', 'transformation', 'depth', 'hidden force', 'rebirth'],
    expression: 'transform, uncover, regenerate',
    use: 'Good for shadow work, therapy, strategic planning, and ending what no longer serves',
    caution: 'Avoid manipulation, obsession, and destructive power games',
    color: '#991B1B',
    glyph: '♇',
  },
  Jupiter: {
    keywords: ['growth', 'wisdom', 'expansion', 'opportunity', 'blessing'],
    expression: 'expand, bless, teach',
    use: 'Good for big-picture planning, teaching, travel, and generous gestures',
    caution: 'Avoid overextension, blind optimism, and excess',
    color: '#818CF8',
    glyph: '♃',
  },
  Saturn: {
    keywords: ['structure', 'maturity', 'discipline', 'responsibility', 'time'],
    expression: 'build, endure, master',
    use: 'Good for long-term planning, setting boundaries, and disciplined effort',
    caution: 'Avoid rigidity, pessimism, and fear-based restriction',
    color: '#9CA3AF',
    glyph: '♄',
  },
  Uranus: {
    keywords: ['innovation', 'awakening', 'disruption', 'freedom', 'rebellion'],
    expression: 'liberate, innovate, disrupt',
    use: 'Good for brainstorming, breaking patterns, tech work, and unconventional approaches',
    caution: 'Avoid reckless rebellion, instability, and detachment from reality',
    color: '#38BDF8',
    glyph: '♅',
  },
  Neptune: {
    keywords: ['spirit', 'dreams', 'transcendence', 'intuition', 'dissolution'],
    expression: 'dream, dissolve, transcend',
    use: 'Good for meditation, prayer, creative inspiration, and compassionate service',
    caution: 'Avoid escapism, delusion, and blurred boundaries',
    color: '#2DD4BF',
    glyph: '♆',
  },
};

// ── Best Use Tag Map ──
// Maps ruler pairs (hourLord + minuteLord) to activity tags

type RulerPairKey = string;

const BEST_USE_TAG_MAP: Record<RulerPairKey, string[]> = {
  'Mars+Vesta':    ['Action', 'Discipline', 'Deep Work'],
  'Mars+Mars':     ['Action', 'Initiative', 'Courage'],
  'Mars+Jupiter':  ['Action', 'Expansion', 'Bold Moves'],
  'Venus+Juno':    ['Love', 'Partnership', 'Harmony'],
  'Venus+Moon':    ['Love', 'Nurturing', 'Rest'],
  'Venus+Neptune': ['Creativity', 'Prayer', 'Romance'],
  'Mercury+Jupiter': ['Study', 'Teaching', 'Planning'],
  'Mercury+Saturn':  ['Planning', 'Strategy', 'Study'],
  'Mercury+Uranus':  ['Breakthrough', 'Innovation', 'Study'],
  'Moon+Neptune':  ['Prayer', 'Rest', 'Intuition'],
  'Moon+Vesta':    ['Ritual', 'Healing', 'Rest'],
  'Sun+Jupiter':   ['Visibility', 'Leadership', 'Creativity'],
  'Sun+Mars':      ['Action', 'Leadership', 'Courage'],
  'Sun+Sun':       ['Creativity', 'Visibility', 'Expression'],
  'Pluto+Saturn':  ['Strategy', 'Healing', 'Transformation'],
  'Pluto+Vesta':   ['Deep Work', 'Transformation', 'Ritual'],
  'Jupiter+Venus': ['Money', 'Abundance', 'Love'],
  'Saturn+Vesta':  ['Discipline', 'Deep Work', 'Strategy'],
  'Uranus+Mercury': ['Breakthrough', 'Innovation', 'Communication'],
  'Neptune+Moon':  ['Prayer', 'Rest', 'Intuition'],
};

/**
 * Build a pair key for the tag map lookup.
 */
function pairKey(hourLord: RulerName, minuteLord: RulerName): RulerPairKey {
  return `${hourLord}+${minuteLord}`;
}

/**
 * Get best-use activity tags for a given Hour Lord + Minute Lord pair.
 * Falls back to combining the first keyword of each ruler if no explicit mapping exists.
 */
export function getBestUseTags(hourLord: RulerName, minuteLord: RulerName): string[] {
  const key = pairKey(hourLord, minuteLord);
  const mapped = BEST_USE_TAG_MAP[key];
  if (mapped) return mapped;

  // Fallback: capitalize first keyword of each ruler
  const hourKeyword = RULER_FULL_MEANINGS[hourLord].keywords[0];
  const minuteKeyword = RULER_FULL_MEANINGS[minuteLord].keywords[0];
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return [capitalize(hourKeyword), capitalize(minuteKeyword)];
}

/**
 * Generate the full interpretation for the current Galactic Signature.
 *
 * Day Lord   = background field / atmosphere
 * Hour Lord  = dominant active force (most weight)
 * Minute Lord = operational method / immediate tone
 * Pulse Lord = quick spark / trigger energy
 */
export function getSignatureInterpretation(signature: GalacticSignature): InterpretationResult {
  const dayMeaning = RULER_FULL_MEANINGS[signature.dayLord];
  const hourMeaning = RULER_FULL_MEANINGS[signature.hourLord];
  const minuteMeaning = RULER_FULL_MEANINGS[signature.minuteLord];
  const pulseMeaning = RULER_FULL_MEANINGS[signature.pulseLord];

  // Title
  const title = 'Current Galactic Signature';

  // Signature line
  const signatureLine = `${signature.cycleDay} / ${signature.hourLord} Hour / ${signature.minuteLord} Minute / ${signature.pulseLord} Pulse`;

  // Summary: synthesize all four lords
  const dayAtmosphere = `The day vibrates with ${dayMeaning.keywords.slice(0, 2).join(' and ')} energy`;
  const hourForce = `This hour channels the force to ${hourMeaning.expression}`;
  const minuteMethod = `The current approach favors ${minuteMeaning.use.replace(/^Good for /, '').split(',').slice(0, 2).join(' and').trim()}`;
  const pulseSpark = `The pulse sparks ${pulseMeaning.keywords.slice(0, 2).join(' and ')}`;

  const summary = `${dayAtmosphere}. ${hourForce}. ${minuteMethod}. ${pulseSpark}.`;

  // Focus: built from Hour Lord (dominant) + Minute Lord (method)
  const focus = `Focus on ${hourMeaning.keywords[0]} through ${minuteMeaning.keywords[0]} — ${hourMeaning.use.replace(/^Good for /, '').split(',')[0].trim()}.`;

  // Caution: combine Hour Lord and Pulse Lord cautions
  const caution = `${hourMeaning.caution}. Also ${pulseMeaning.caution.charAt(0).toLowerCase()}${pulseMeaning.caution.slice(1)}.`;

  // Best use tags
  const bestUseTags = getBestUseTags(signature.hourLord, signature.minuteLord);

  return {
    title,
    signatureLine,
    summary,
    focus,
    caution,
    bestUseTags,
  };
}
