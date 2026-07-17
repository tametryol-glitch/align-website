// ── Galactic Clock Interpretation Engine ──
// Generates meaning from the current Galactic Signature

import type { RulerName, RulerMeaning, GalacticSignature, InterpretationResult } from './types';

// ── Full Ruler Meanings ──

export const RULER_FULL_MEANINGS: Record<RulerName, RulerMeaning> = {
  Mars: {
    keywords: ['action', 'force', 'courage', 'initiation', 'drive'],
    expression: 'move, act, push forward',
    use: 'make the decisive call, start what you\'ve been circling, push your body, and face the obstacle head-on',
    caution: 'Don\'t let impulse make your decisions — no rage moves, no torched bridges',
    color: '#EF4444',
    glyph: '♂',
  },
  Venus: {
    keywords: ['attraction', 'beauty', 'love', 'harmony', 'value'],
    expression: 'attract, create, beautify',
    use: 'make the romantic move, create something beautiful, settle the money question, and enjoy what you\'ve built',
    caution: 'Don\'t overindulge or coast on charm — pleasure that dodges real life costs you double',
    color: '#F472B6',
    glyph: '♀',
  },
  Mercury: {
    keywords: ['thought', 'language', 'trade', 'analysis', 'communication'],
    expression: 'think, speak, analyze',
    use: 'write the thing, learn the thing, negotiate the deal, and let the data decide',
    caution: 'Don\'t overthink or scatter — pick one thread and follow it all the way',
    color: '#6EE7B7',
    glyph: '☿',
  },
  Moon: {
    keywords: ['emotion', 'instinct', 'memory', 'receptivity', 'care'],
    expression: 'feel, nurture, remember',
    use: 'take care of yourself, process the feeling, call your people, and trust your gut read',
    caution: 'Don\'t let the mood drive — react to what\'s real, not to the wave carrying you',
    color: '#C4B5FD',
    glyph: '☽',
  },
  Sun: {
    keywords: ['vitality', 'identity', 'visibility', 'leadership', 'creative force'],
    expression: 'shine, lead, express',
    use: 'step into the spotlight, take the lead, make your creative move, and back yourself out loud',
    caution: 'Don\'t let the spotlight go to your head — dominating the room dims your own light',
    color: '#F59E0B',
    glyph: '☉',
  },
  Vesta: {
    keywords: ['devotion', 'focus', 'purification', 'sacred work', 'discipline'],
    expression: 'dedicate, purify, focus',
    use: 'go deep on the one task, run your ritual, clear your space, and hold single-pointed focus',
    caution: 'Don\'t disappear into the work — rigidity and isolation undo the devotion',
    color: '#FB923C',
    glyph: '\u26B6',
  },
  Juno: {
    keywords: ['union', 'commitment', 'partnership', 'balance', 'contracts'],
    expression: 'bond, commit, balance',
    use: 'have the partnership talk, review the contract, balance the ledger between you, and build together',
    caution: 'Don\'t slide into codependency or scorekeeping — jealousy poisons the bond you\'re building',
    color: '#A78BFA',
    glyph: '⚵',
  },
  Pluto: {
    keywords: ['power', 'transformation', 'depth', 'hidden force', 'rebirth'],
    expression: 'transform, uncover, regenerate',
    use: 'face your shadow, book the hard conversation, plan the strategy, and end what no longer serves you',
    caution: 'Don\'t manipulate or obsess — power games cost more than whatever they win you',
    color: '#991B1B',
    glyph: '♇',
  },
  Jupiter: {
    keywords: ['growth', 'wisdom', 'expansion', 'opportunity', 'blessing'],
    expression: 'expand, bless, teach',
    use: 'plan the big picture, teach what you know, book the trip, and make the generous gesture',
    caution: 'Don\'t overextend on optimism — a blessing taken to excess becomes a debt',
    color: '#818CF8',
    glyph: '♃',
  },
  Saturn: {
    keywords: ['structure', 'maturity', 'discipline', 'responsibility', 'time'],
    expression: 'build, endure, master',
    use: 'plan the long game, set the boundary, and do the disciplined work you committed to',
    caution: 'Don\'t let discipline harden into fear — rigidity and pessimism waste this hour\'s strength',
    color: '#9CA3AF',
    glyph: '♄',
  },
  Uranus: {
    keywords: ['innovation', 'awakening', 'disruption', 'freedom', 'rebellion'],
    expression: 'liberate, innovate, disrupt',
    use: 'brainstorm wild, break the stale pattern, push the tech work, and try the unconventional route',
    caution: 'Don\'t rebel just to rebel — instability without direction detaches you from what\'s real',
    color: '#38BDF8',
    glyph: '♅',
  },
  Neptune: {
    keywords: ['spirit', 'dreams', 'transcendence', 'intuition', 'dissolution'],
    expression: 'dream, dissolve, transcend',
    use: 'meditate, pray, chase the creative vision, and serve someone with compassion',
    caution: 'Don\'t escape into the fog — blurred boundaries and pretty delusions cost you real ground',
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
  const dayAtmosphere = `Your whole day is running on ${dayMeaning.keywords.slice(0, 2).join(' and ')}`;
  const hourForce = `This hour hands you one job: ${hourMeaning.expression}`;
  const minuteMethod = `The next few minutes are built for this: ${minuteMeaning.use.replace(/^Good for /, '').split(',').slice(0, 2).join(' and').trim()}`;
  const pulseSpark = `The pulse is firing ${pulseMeaning.keywords.slice(0, 2).join(' and ')} through you right now`;

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
