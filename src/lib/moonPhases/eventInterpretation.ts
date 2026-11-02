/**
 * Event Interpretation -- turns a scored lunar event into predictive prose.
 *
 * Deterministic, pure function. Composes from four signal sources:
 *   - event type (new / first quarter / full / last quarter / eclipse)
 *   - top natal contact (which body is being aspected, by what aspect)
 *   - natal house activated (where in the life the event lands)
 *   - impact band (how loud the signal is)
 *
 * Produces three short blocks:
 *   - summary: one-sentence predictive interpretation
 *   - leanInto: what to do with this energy
 *   - watchFor: what to be careful of
 *
 * Ported from align-app for web use. No React Native dependencies.
 */

import type { LunarEvent, ImpactScore, ImpactContribution } from './impactScore';

export interface EventInterpretation {
  summary: string;
  leanInto: string;
  watchFor: string;
}

// ── Building blocks ───────────────────────────────────────────────────────

const PHASE_FRAME: Record<string, string> = {
  new: 'is the day to start the thing you have been circling',
  first_quarter: 'forces the decision you have been putting off',
  full: 'brings to a head what has been building for two weeks',
  last_quarter: 'asks you to drop something and look at what it cost you',
  eclipse: 'moves a storyline you could not see forward faster than you would choose',
};

const PHASE_FLAVOR: Record<string, string> = {
  new: 'Nothing looks different yet, so write the intention down before you talk yourself out of it',
  first_quarter: 'Something stalls, and you have to choose between acting and giving up',
  full: 'What was hidden is visible now, including how you really feel about it',
  last_quarter: 'You finish, drop or forgive something and clear room for the next start',
  eclipse: 'Events move faster than your plans, so expect the news instead of arranging it',
};

const BODY_THEME: Record<string, string> = {
  Sun: 'who you are and where you are headed',
  Moon: 'your moods and what you need to feel safe',
  Mercury: 'how you talk, think and decide',
  Venus: 'who you love and what you will pay for',
  Mars: 'your temper, your drive and what you will fight for',
  Jupiter: 'where you are taking a chance and what you are hoping for',
  Saturn: 'your obligations and the long project you are holding up',
  Uranus: 'the part of you that wants out of the routine',
  Neptune: 'what you dream about and where you fool yourself',
  Pluto: 'what you are gripping and what you will not admit you want',
  Vesta: 'the work you give your days to',
  Juno: 'your closest commitment',
  Ascendant: 'the first impression you give',
  MC: 'your work and your reputation',
  Descendant: 'the people you attract and what they mirror back',
  IC: 'your home and your family',
  'North Node': 'the next version of you',
  'South Node': 'the old habit you keep falling back on',
};

const ASPECT_VERB: Record<string, string> = {
  Conjunction: 'sits right on',
  Opposition: 'pulls against',
  Square: 'puts pressure on',
  Quincunx: 'knocks sideways',
};

const ASPECT_LEAN: Record<string, string> = {
  Conjunction: 'starting fresh here and committing before you overthink it',
  Opposition: 'a straight talk with the person or the demand pulling the other way',
  Square: 'one concrete step this week, even a small one, that takes the pressure off',
  Quincunx: 'changing the route and keeping the goal',
};
const ASPECT_WATCH: Record<string, string> = {
  Conjunction: 'grabbing the first idea and missing the better one',
  Opposition: 'forcing a verdict before the tension has shown you what it is about',
  Square: 'burying the pressure in busywork or scrolling',
  Quincunx: 'jamming it into a shape that does not fit; the discomfort is information, not failure',
};

const HOUSE_THEME: Record<number, string> = {
  1: 'how people first meet you',
  2: 'money and what you think you are worth',
  3: 'your daily talk, texts and short trips',
  4: 'your home and your family',
  5: 'romance, creative work and play',
  6: 'your routines, health and workload',
  7: 'your closest partner and the people who push back',
  8: 'shared money, sex and what you keep hidden',
  9: 'what you believe and where you want to go',
  10: 'your career and how people see you',
  11: 'your friends and the group you belong to',
  12: 'what you do alone, your dreams and the endings you have not named',
};

const PHASE_LEAN_DEFAULT: Record<string, string> = {
  new: 'saying your intention aloud so clearly that a friend could repeat it back',
  first_quarter: 'one uncomfortable step on the thing you started',
  full: 'looking at what is shown, including the part you were avoiding',
  last_quarter: 'finishing the sentence, closing the loop, letting the old chapter end',
  eclipse: 'walking into the story that is starting instead of arguing with it',
};
const PHASE_WATCH_DEFAULT: Record<string, string> = {
  new: 'promising everything to an idea that has no shape yet',
  first_quarter: 'revising a plan that is already good enough so you do not have to start',
  full: 'blowing up at someone in the day either side of the peak; sleep on big decisions',
  last_quarter: 'holding on to what has already left',
  eclipse: 'trying to steer an outcome that is being redrawn bigger than you',
};

const BAND_INTRO: Record<string, string> = {
  transformative: 'You will remember this one. ',
  high: 'This one lands hard on your chart. ',
  moderate: 'You will notice this one in a few places. ',
  low: 'A light touch on your chart. ',
  negligible: 'A quiet one for you. ',
};

const NODE_FRAME: Record<'north' | 'south', string> = {
  north: 'pulls you toward the person you are becoming',
  south: 'closes out a habit you fall back on for comfort',
};
const NODE_LEAN: Record<'north' | 'south', string> = {
  north: 'acting like the person this eclipse is pointing you toward',
  south: 'letting go cleanly of what no longer fits, without retelling the ending to everyone',
};
const NODE_WATCH: Record<'north' | 'south', string> = {
  north: 'retreating to what you know because the new thing scares you',
  south: 'retelling the story of what you are losing and missing what is opening up',
};

const ECLIPSE_QUALITY_TAG: Record<string, string> = {
  total: 'total eclipse, so expect a full reset of this area',
  annular: 'annular eclipse, so the center stays hidden while the edges light up',
  partial: 'partial eclipse, so the page turns but not all the way',
  penumbral: 'penumbral eclipse, so the shift is subtle and you notice it later',
};

// ── Helpers ───────────────────────────────────────────────────────────────

function topNatalContact(impact: ImpactScore): ImpactContribution | null {
  const aspect = impact.contributions.find(c => c.kind === 'aspect' && c.target);
  if (aspect) return aspect;
  const prog = impact.contributions.find(c => c.kind === 'progressed' && c.target);
  return prog ?? null;
}

function parseContactDetail(detail: string): { aspect: string | null; bodyKey: string | null } {
  const m = detail.match(/^(Conjunction|Opposition|Square|Quincunx)\s+to\s+(?:natal\s+)?(.+?)\s+\(orb\s/);
  if (!m) return { aspect: null, bodyKey: null };
  const aspect = m[1];
  let body = m[2].trim();
  const rulerMatch = body.match(/^Chart Ruler \(([^)]+)\)$/);
  if (rulerMatch) body = rulerMatch[1];
  return { aspect, bodyKey: body };
}

function phaseNameOf(event: LunarEvent): string {
  if (event.type === 'eclipse') {
    if (!event.subtype) return 'Eclipse';
    const parts = event.subtype.split('_');
    return `${parts[0].charAt(0).toUpperCase()}${parts[0].slice(1)} ${parts[1]} eclipse`;
  }
  switch (event.type) {
    case 'new':           return 'New Moon';
    case 'first_quarter': return 'First Quarter';
    case 'full':          return 'Full Moon';
    case 'last_quarter':  return 'Last Quarter';
    default:              return 'Lunar event';
  }
}

// ── Main generator ────────────────────────────────────────────────────────

export function buildEventInterpretation(
  event: LunarEvent,
  impact: ImpactScore,
  moonSign: string,
): EventInterpretation {
  const phaseName = phaseNameOf(event);
  const contact = topNatalContact(impact);
  const parsed = contact ? parseContactDetail(contact.detail) : { aspect: null, bodyKey: null };
  const bodyTheme = parsed.bodyKey ? BODY_THEME[parsed.bodyKey] : null;
  const aspectVerb = parsed.aspect ? ASPECT_VERB[parsed.aspect] : null;
  const houseTheme = impact.eventHouse ? HOUSE_THEME[impact.eventHouse] : null;
  const bandIntro = BAND_INTRO[impact.band] ?? '';
  const isEclipse = event.type === 'eclipse';
  const nodeFrame = isEclipse && event.nodeSide ? NODE_FRAME[event.nodeSide] : null;

  let summary: string;
  if (bodyTheme && aspectVerb) {
    summary =
      `${bandIntro}This ${phaseName} in ${moonSign} ${aspectVerb} ${bodyTheme}` +
      (houseTheme ? `, and the part of your life it hits is ${houseTheme}.` : '.');
  } else {
    summary = `${bandIntro}This ${phaseName} in ${moonSign} ${PHASE_FRAME[event.type] ?? 'moves the cycle forward'}` +
      (houseTheme ? `, and the part of your life it hits is ${houseTheme}.` : `. ${PHASE_FLAVOR[event.type] ?? ''}.`);
  }
  if (nodeFrame) {
    const quality = event.subtype?.split('_')[1];
    const qualityTag = quality && ECLIPSE_QUALITY_TAG[quality];
    summary += ` On the ${event.nodeSide === 'north' ? 'North' : 'South'} Node axis, it ${nodeFrame}.`;
    if (qualityTag) {
      summary += ` A ${qualityTag}.`;
    }
  }

  let leanInto: string;
  let watchFor: string;
  if (isEclipse && event.nodeSide) {
    leanInto = NODE_LEAN[event.nodeSide];
    watchFor = NODE_WATCH[event.nodeSide];
  } else if (parsed.aspect && ASPECT_LEAN[parsed.aspect]) {
    leanInto = ASPECT_LEAN[parsed.aspect];
    watchFor = ASPECT_WATCH[parsed.aspect];
  } else {
    leanInto = PHASE_LEAN_DEFAULT[event.type] ?? PHASE_LEAN_DEFAULT.new;
    watchFor = PHASE_WATCH_DEFAULT[event.type] ?? PHASE_WATCH_DEFAULT.new;
  }

  return { summary, leanInto, watchFor };
}

// Exposed for tests and debugging.
export const __internals = {
  topNatalContact,
  parseContactDetail,
  phaseNameOf,
  PHASE_FRAME,
  PHASE_FLAVOR,
  BODY_THEME,
  ASPECT_VERB,
  ASPECT_LEAN,
  ASPECT_WATCH,
  HOUSE_THEME,
  BAND_INTRO,
  NODE_FRAME,
  NODE_LEAN,
  NODE_WATCH,
  ECLIPSE_QUALITY_TAG,
};
