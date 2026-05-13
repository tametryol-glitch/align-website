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
  new:            'plants a seed',
  first_quarter:  'demands decisive action',
  full:           'brings a theme to a head',
  last_quarter:   'asks for release and review',
  eclipse:        'accelerates a hidden storyline',
};

const PHASE_FLAVOR: Record<string, string> = {
  new:            'a quiet beginning that you may not fully see yet',
  first_quarter:  'pressure to move from intention into action',
  full:           'a climax of clarity, visibility, and emotional truth',
  last_quarter:   'the wisdom phase — integrating, releasing, preparing the next seed',
  eclipse:        'a fated acceleration that bypasses your usual pacing',
};

const BODY_THEME: Record<string, string> = {
  Sun:                 'your core identity and direction',
  Moon:                'your inner emotional world',
  Mercury:             'how you think, learn, and communicate',
  Venus:               'love, values, and what you find beautiful',
  Mars:                'your drive, courage, and the things you fight for',
  Jupiter:             'expansion, faith, and the bigger story you are living',
  Saturn:              'structure, responsibility, and the long game',
  Uranus:              'freedom, breakthrough, and how you break pattern',
  Neptune:             'dreams, spirituality, and what dissolves boundaries',
  Pluto:               'deep transformation and the parts of you that want power',
  Vesta:               'sacred focus and the work you are devoted to',
  Juno:                'commitment and how you partner with others',
  Ascendant:           'how you show up and the face you meet the world with',
  MC:                  'your public life, reputation, and direction in career',
  Descendant:          'the qualities you draw to yourself through others',
  IC:                  'your home, roots, and private emotional foundation',
  'North Node':        'your soul growth edge and future direction',
  'South Node':        'comfort patterns you are asked to release',
};

const ASPECT_VERB: Record<string, string> = {
  Conjunction: 'merges with',
  Opposition:  'challenges you to balance',
  Square:      'puts pressure on',
  Quincunx:    'asks for an awkward adjustment to',
};

const ASPECT_LEAN: Record<string, string> = {
  Conjunction: 'a clean fresh start in this area — commit to it without overthinking',
  Opposition:  'honest dialogue with the people or forces on the other side of this',
  Square:      'taking one concrete action, even a small one, to relieve the pressure',
  Quincunx:    'adjusting the angle, not the goal — the route needs to change',
};
const ASPECT_WATCH: Record<string, string> = {
  Conjunction: 'acting so fast you merge with the first idea and miss the better one',
  Opposition:  'forcing a resolution instead of letting the tension surface truth',
  Square:      'numbing the pressure with busywork or distraction',
  Quincunx:    'forcing a square peg round — the discomfort is data, not failure',
};

const HOUSE_THEME: Record<number, string> = {
  1:  'how you show up and the version of you people meet',
  2:  'money, self-worth, and what you truly value',
  3:  'your daily mind — how you communicate, learn, and move locally',
  4:  'home, roots, and the private emotional ground you return to',
  5:  'creativity, romance, play, and what makes you feel alive',
  6:  'daily routines, health, work habits, and service',
  7:  'close partnerships and the mirrors other people hold up to you',
  8:  'intimacy, shared resources, and what you share in the dark',
  9:  'beliefs, meaning, travel, and the story you are telling yourself',
  10: 'career, reputation, and how you are known in the world',
  11: 'friendships, community, and the future you are building toward',
  12: 'the subconscious — dreams, endings, and what you cannot yet name',
};

const PHASE_LEAN_DEFAULT: Record<string, string> = {
  new:            'naming an intention clearly enough that a friend could repeat it back',
  first_quarter:  'one concrete, uncomfortable action on the thing you started',
  full:           'receiving what is being shown to you — even the parts you were avoiding',
  last_quarter:   'closing a loop, finishing a sentence, letting the old chapter end',
  eclipse:        'stepping into the story that is trying to begin — do not argue with it',
};
const PHASE_WATCH_DEFAULT: Record<string, string> = {
  new:            'over-committing to a vague idea before it has the right shape',
  first_quarter:  'stalling by polishing the plan when the plan is already good enough',
  full:           'overreacting in the 24-hour window around peak — sleep on big decisions',
  last_quarter:   'clinging to what is clearly on its way out',
  eclipse:        'trying to control an outcome that is being redrawn bigger than you',
};

const BAND_INTRO: Record<string, string> = {
  transformative: 'This is a once-in-years event for you. ',
  high:           'This one lands squarely on your chart. ',
  moderate:       'Moderate personal activation. ',
  low:            'A light touch on your chart. ',
  negligible:     'A quiet lunation in your personal weather. ',
};

const NODE_FRAME: Record<'north' | 'south', string> = {
  north: 'opens a door toward your growth edge — what you are being called to become',
  south: 'closes a loop on a comfort pattern — what is ready to be released',
};
const NODE_LEAN: Record<'north' | 'south', string> = {
  north: 'stepping into the version of you this eclipse is asking for',
  south: 'letting go cleanly of what no longer fits, without over-narrating the ending',
};
const NODE_WATCH: Record<'north' | 'south', string> = {
  north: 'pulling back toward the familiar out of fear of the unknown',
  south: 'clinging to the story of what you are losing instead of noticing what is freeing up',
};

const ECLIPSE_QUALITY_TAG: Record<string, string> = {
  total:     'total eclipse — a full reset of this theme',
  annular:   'annular eclipse — a ring of light around a hidden center',
  partial:   'partial eclipse — a clear but incomplete turn of the page',
  penumbral: 'penumbral eclipse — a subtle, dream-like shift under the surface',
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
      (houseTheme ? `, activating ${houseTheme}.` : '.');
  } else {
    summary = `${bandIntro}This ${phaseName} in ${moonSign} ${PHASE_FRAME[event.type] ?? 'moves the cycle forward'}` +
      (houseTheme ? ` in the house of ${houseTheme}.` : ` — ${PHASE_FLAVOR[event.type] ?? ''}.`);
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
