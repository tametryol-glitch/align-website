// ═══════════════════════════════════════════════════════════════════
// Build-A-Match — Aspect Readings (web)
//
// EXACT MIRROR of align-app/src/services/buildAMatch/aspectInterpretations.ts.
// The inner/outer direction must stay identical or the two platforms would
// attribute the same aspect to opposite people.
//
// Not a list of aspects. What the aspect BRINGS.
//
//   "Venus conjunct Ascendant"  →  Instant Attraction
//
// Same dual-naming rule as the midpoints: the technical name teaches over
// time, the plain name communicates immediately. Both are shown.
//
// PURE MODULE. No Supabase, no React Native.
//
// ─── Where the data comes from ─────────────────────────────────────
// computeSynastryCompatibility already computes the full cross-aspect
// grid for every shortlist candidate and returns it as `aspects`. Until
// now Build-A-Match kept only the overall score and threw the grid away.
// This module costs nothing extra — it names what was already there.
//
// ─── Provenance ────────────────────────────────────────────────────
// STRAWMAN. Drafted from convention for the founder to cut and add to,
// the same way the twelve houses were. Where a name is overwritten, that
// becomes Align's and must not drift back.
// ═══════════════════════════════════════════════════════════════════

/** One aspect between the viewer's body and a candidate's body. */
export interface SynastryAspect {
  /** The VIEWER's body (person 1 in the engine call). */
  inner: string;
  /** The CANDIDATE's body (person 2). */
  outer: string;
  aspect: string;
  orb: number;
  strength: number;
  supportive: boolean;
}

/**
 * Aspects collapse into three families. Naming every pair against all
 * nine aspects would be ~4,000 entries and most would say the same thing
 * three ways.
 */
export type AspectFamily = 'union' | 'flow' | 'friction';

export function aspectFamily(aspect: string): AspectFamily {
  switch (aspect) {
    case 'Conjunction':
      return 'union';
    case 'Trine':
    case 'Sextile':
    case 'Semi-Sextile':
      return 'flow';
    default:
      // Square, Opposition, Quincunx, Semi-Square, Sesquiquadrate
      return 'friction';
  }
}

export interface AspectReading {
  /** The plain-language name. "Instant Attraction". */
  name: string;
  /** What it brings. */
  light: string;
  /** What it costs. Never omitted. */
  shadow: string;
}

/** Pair key, order-independent — Venus/Mars and Mars/Venus are one entry. */
function pairKey(a: string, b: string, family: AspectFamily): string {
  return [a, b].sort().join('|') + '|' + family;
}

/**
 * Readings for the pairs that actually carry a relationship. Not every
 * combination is written — an unwritten pair falls back to a plain
 * statement rather than inventing significance.
 */
const READINGS: Record<string, AspectReading> = {
  // ─── Venus: attraction, affection, taste ───
  [pairKey('Venus', 'Ascendant', 'union')]: {
    name: 'Instant Attraction',
    light: 'They find you attractive before they have a reason to. This is the one that makes someone look twice across a room.',
    shadow: 'Attraction this immediate can carry a whole relationship past the point where it should have been questioned.',
  },
  [pairKey('Venus', 'Ascendant', 'flow')]: {
    name: 'Easy Appeal',
    light: 'You are pleasant to each other on sight. Nothing has to be worked at.',
    shadow: 'Easy can stay shallow. There is no friction here to force anything deeper.',
  },
  [pairKey('Venus', 'Ascendant', 'friction')]: {
    name: 'Attracted And Irritated',
    light: 'You want them and they get on your nerves. That combination is not nothing.',
    shadow: 'The irritation does not resolve. It becomes the texture of the whole thing.',
  },
  [pairKey('Venus', 'Mars', 'union')]: {
    name: 'Raw Chemistry',
    light: 'Physical want, mutual and obvious. Neither of you has to explain it.',
    shadow: 'Chemistry is not compatibility. This can hold two people together who agree on nothing else.',
  },
  [pairKey('Venus', 'Mars', 'flow')]: {
    name: 'Natural Desire',
    light: 'Wanting each other is uncomplicated. The pursuit and the yielding fit.',
    shadow: 'Uncomplicated desire is easy to take for granted.',
  },
  [pairKey('Venus', 'Mars', 'friction')]: {
    name: 'Wanting What Fights You',
    light: 'The tension is the attraction. You will not be bored.',
    shadow: 'Fighting and wanting fuse. You may not be able to have one without the other.',
  },
  [pairKey('Venus', 'Venus', 'union')]: {
    name: 'Same Taste',
    light: 'You love the same way. What one finds beautiful, the other does too.',
    shadow: 'Two people with the same blind spots reinforce them.',
  },
  [pairKey('Venus', 'Saturn', 'union')]: {
    name: 'Love That Commits',
    light: 'Affection with weight behind it. This one shows up and keeps showing up.',
    shadow: 'The same weight becomes obligation. Love that is a duty is still a duty.',
  },
  [pairKey('Venus', 'Saturn', 'friction')]: {
    name: 'Love With A Cost',
    light: 'Real, tested affection. Nothing here is casual and nothing is free.',
    shadow: 'Withholding. One of you is always slightly not enough, and it is rarely said out loud.',
  },
  [pairKey('Venus', 'Pluto', 'union')]: {
    name: 'Obsessive Attraction',
    light: 'You will think about them when you are trying not to. Magnetic in the literal sense.',
    shadow: 'Obsession and love are not the same and this aspect does not distinguish. Jealousy lives here.',
  },
  [pairKey('Venus', 'Pluto', 'friction')]: {
    name: 'Attraction As Power',
    light: 'Intense, total, impossible to be casual about.',
    shadow: 'Desire becomes leverage. Watch who is using the wanting to get something else.',
  },
  [pairKey('Venus', 'Neptune', 'union')]: {
    name: 'Romantic Idealisation',
    light: 'They look like the answer. Genuinely enchanting, and it feels like recognition.',
    shadow: 'You are in love with an image. The real person is behind it and may disappoint you later.',
  },
  [pairKey('Venus', 'Jupiter', 'union')]: {
    name: 'Generous Affection',
    light: 'Warmth without accounting. They give and enjoy giving.',
    shadow: 'Excess. Generosity with no brakes is still no brakes.',
  },
  [pairKey('Venus', 'Uranus', 'union')]: {
    name: 'Electric Attraction',
    light: 'Sudden, exciting, unlike your usual. It arrives fast.',
    shadow: 'What arrives fast leaves fast. This aspect is not known for staying.',
  },

  // ─── Moon: feeling, safety, home ───
  [pairKey('Moon', 'Moon', 'union')]: {
    name: 'Same Emotional Language',
    light: 'You do not have to translate. They already know what the silence means.',
    shadow: 'Two people who react identically have no one steady when it goes wrong.',
  },
  [pairKey('Moon', 'Venus', 'union')]: {
    name: 'Tender Regard',
    light: 'Genuine fondness. They are gentle with you and it is not performance.',
    shadow: 'Gentleness can avoid the hard conversation indefinitely.',
  },
  [pairKey('Moon', 'Saturn', 'union')]: {
    name: 'Steady But Cool',
    light: 'They are reliable when you are not okay. Present, unshaken.',
    shadow: 'Emotionally cold, and you will make excuses for it. This is the classic aspect of feeling unmet.',
  },
  [pairKey('Moon', 'Saturn', 'friction')]: {
    name: 'Feeling Not Enough',
    light: 'They hold a boundary your feelings need to meet. It matures you.',
    shadow: 'You will feel like a burden. Not once — as a baseline.',
  },
  [pairKey('Moon', 'Pluto', 'union')]: {
    name: 'Emotional Depth Charge',
    light: 'They reach the feeling under the feeling. Nothing stays polite.',
    shadow: 'Emotional control, and it is very hard to see from inside. Ask someone outside it.',
  },
  [pairKey('Moon', 'Mars', 'friction')]: {
    name: 'Quick To Hurt',
    light: 'Passionate reactions, nothing suppressed. You know where you stand.',
    shadow: 'Things get said in heat that do not get unsaid.',
  },
  [pairKey('Moon', 'Neptune', 'union')]: {
    name: 'Unspoken Understanding',
    light: 'You feel each other without asking. Rare and real.',
    shadow: 'You assume you were understood. Often you were not, and neither of you checks.',
  },
  [pairKey('Moon', 'Jupiter', 'union')]: {
    name: 'Emotional Generosity',
    light: 'They make you feel more, and better. Space to be big.',
    shadow: 'Optimism used to skip past what actually hurts.',
  },
  [pairKey('Moon', 'Ascendant', 'union')]: {
    name: 'Immediate Comfort',
    light: 'They feel familiar within minutes. Your guard drops early.',
    shadow: 'Familiar is not the same as safe. Early comfort skips the part where you find out.',
  },

  // ─── Sun: identity, recognition ───
  [pairKey('Sun', 'Moon', 'union')]: {
    name: 'Classic Fit',
    light: 'One of you is the day, one the night, and it works. The oldest good sign in synastry.',
    shadow: 'Complementary roles harden. Someone ends up always the strong one.',
  },
  [pairKey('Sun', 'Sun', 'union')]: {
    name: 'Same Wavelength',
    light: 'You understand what drives them because it drives you.',
    shadow: 'Two suns compete for the same sky. Watch whose plans keep winning.',
  },
  [pairKey('Sun', 'Venus', 'union')]: {
    name: 'Delighted In',
    light: 'They enjoy you openly. You are the good part of their day.',
    shadow: 'Being someone\'s delight is a role, and roles get tiring to hold.',
  },
  [pairKey('Sun', 'Saturn', 'union')]: {
    name: 'Taken Seriously',
    light: 'They respect you and they will not flatter you. That is worth a great deal.',
    shadow: 'Respect curdles into judgment. You will start seeking approval you used not to need.',
  },
  [pairKey('Sun', 'Pluto', 'union')]: {
    name: 'Transformative Recognition',
    light: 'They see you completely and it changes you.',
    shadow: 'Being seen completely by someone who wants control is not safety.',
  },
  [pairKey('Sun', 'Ascendant', 'union')]: {
    name: 'Seen As You Are',
    light: 'How you present and who you are line up for them. No translation needed.',
    shadow: 'Their view of you becomes the mirror you use. That is a lot of power to hand over.',
  },
  [pairKey('Sun', 'Jupiter', 'union')]: {
    name: 'They Make You Bigger',
    light: 'Confidence, opportunity, room. You are more around them.',
    shadow: 'Borrowed largeness. Test whether it survives their absence.',
  },

  // ─── Mars: drive, conflict, desire ───
  [pairKey('Mars', 'Pluto', 'union')]: {
    name: 'Intense Passion',
    light: 'Total physical and psychological force. Nothing about this is casual.',
    shadow: 'The first entry on Align\'s shadow list. Control, obsession and volatility live at exactly this point.',
  },
  [pairKey('Mars', 'Pluto', 'friction')]: {
    name: 'Power Struggle',
    light: 'Neither of you backs down. There is real force in it.',
    shadow: 'This is where conflict stops being an argument. Take it seriously.',
  },
  [pairKey('Mars', 'Mars', 'friction')]: {
    name: 'Two Wills',
    light: 'You push each other. Competitive in a way that can sharpen both.',
    shadow: 'Everything becomes a contest, including things that should not be.',
  },
  [pairKey('Mars', 'Saturn', 'friction')]: {
    name: 'Blocked Drive',
    light: 'They slow you down, and sometimes you needed slowing.',
    shadow: 'Frustration with nowhere to go. Resentment builds quietly and surfaces badly.',
  },
  [pairKey('Mars', 'Ascendant', 'union')]: {
    name: 'Physical Charge',
    light: 'Your body reacts to them being in the room.',
    shadow: 'The same charge is why you fight so easily.',
  },
  [pairKey('Mars', 'Eros', 'union')]: {
    name: 'Direct Desire',
    light: 'Wanting without negotiation. Explicit and mutual.',
    shadow: 'Desire that does not wait for the rest of the relationship to catch up.',
  },

  // ─── Commitment, devotion, care ───
  [pairKey('Juno', 'Sun', 'union')]: {
    name: 'Marriage Recognition',
    light: 'They read as a spouse rather than a partner. The distinction is real.',
    shadow: 'Commitment to the idea can outlast commitment to the person.',
  },
  [pairKey('Juno', 'Venus', 'union')]: {
    name: 'Committed Affection',
    light: 'Love that intends to stay and says so.',
    shadow: 'The intention can be sincere and still not survive contact.',
  },
  [pairKey('Juno', 'Moon', 'union')]: {
    name: 'Home And Vow',
    light: 'Emotional safety and commitment arrive together.',
    shadow: 'Staying because leaving would break the home, long after the feeling went.',
  },
  [pairKey('Ceres', 'Moon', 'union')]: {
    name: 'Real Caretaking',
    light: 'They look after you in practice, not sentiment. Fed, warm, noticed.',
    shadow: 'Care becomes control. It rarely announces the change.',
  },
  [pairKey('Chiron', 'Moon', 'union')]: {
    name: 'The Wound Meets The Feeling',
    light: 'They reach the old hurt. It can genuinely heal here.',
    shadow: 'Or it reopens on a schedule neither of you chose.',
  },
  [pairKey('Chiron', 'Venus', 'union')]: {
    name: 'Loved At The Wound',
    light: 'They love the part you are least proud of.',
    shadow: 'Being loved there can make the wound something you keep, because it is what they love.',
  },
  [pairKey('Psyche', 'Sun', 'union')]: {
    name: 'Deeply Known',
    light: 'They see the part you have never narrated to anyone.',
    shadow: 'Being known is not being held. They may see all of it and do nothing.',
  },
  [pairKey('Vesta', 'Sun', 'union')]: {
    name: 'Devoted Focus',
    light: 'They centre on you with a seriousness most people never receive.',
    shadow: 'Devotion narrows. Both of your worlds get smaller.',
  },
  [pairKey('Lilith', 'Mars', 'union')]: {
    name: 'The Forbidden Charge',
    light: 'They meet the part of you that does not ask permission.',
    shadow: 'This aspect does not care about your self-image or your plans.',
  },
  [pairKey('Eros', 'Venus', 'union')]: {
    name: 'Erotic Recognition',
    light: 'Desire and affection point the same direction. Not always the case.',
    shadow: 'When the erotic charge fades, check whether anything else was holding it.',
  },

  // ─── Mind ───
  [pairKey('Mercury', 'Mercury', 'union')]: {
    name: 'Same Mind',
    light: 'You think alike. Conversation is effortless.',
    shadow: 'Nobody in the room disagrees with you. That is not always a gift.',
  },
  [pairKey('Mercury', 'Mercury', 'friction')]: {
    name: 'Talking Past Each Other',
    light: 'Different thinking styles, which is genuinely useful when it lands.',
    shadow: 'The same conversation, misfiring, for years.',
  },
  [pairKey('Mercury', 'Uranus', 'union')]: {
    name: 'Mind Opened',
    light: 'They say the thing that reorganises how you think.',
    shadow: 'Stimulation mistaken for depth.',
  },
  [pairKey('Mercury', 'Neptune', 'friction')]: {
    name: 'Chronic Misunderstanding',
    light: 'Imagination in the conversation. Poetic rather than literal.',
    shadow: 'You do not actually understand each other and both of you believe you do.',
  },

  // ─── Karmic / fated ───
  [pairKey('North Node', 'Sun', 'union')]: {
    name: 'Pulled Forward',
    light: 'They belong to where you are going rather than where you have been.',
    shadow: 'A direction that is genuinely yours can still cost everything else.',
  },
  [pairKey('South Node', 'Sun', 'union')]: {
    name: 'Already Known',
    light: 'Recognition with no origin. Immediate, unearned familiarity.',
    shadow: 'Familiar because it is old. Old patterns feel like home for exactly that reason.',
  },
  [pairKey('South Node', 'Venus', 'union')]: {
    name: 'The Love You Have Had Before',
    light: 'Instant ease, as if resuming rather than starting.',
    shadow: 'You may be repeating something rather than beginning it.',
  },
};

/** The reading for an aspect, if one is written. */
export function readingForAspect(a: SynastryAspect): AspectReading | null {
  return READINGS[pairKey(a.inner, a.outer, aspectFamily(a.aspect))] ?? null;
}

/** How to phrase it: the inner body is the VIEWER's, the outer is theirs. */
export function describeAspect(a: SynastryAspect): string {
  return `Their ${a.outer} ${a.aspect.toLowerCase()} your ${a.inner}`;
}

/**
 * The aspects worth showing, strongest first.
 *
 * Preference goes to aspects that have a written reading — a named aspect
 * says something, an unnamed one is a technical fact the reader cannot use.
 * Tight orbs win ties, since a 1° contact means far more than a 7° one.
 */
export function rankAspects(aspects: SynastryAspect[], limit = 3): SynastryAspect[] {
  return [...aspects]
    .filter(a => a.inner && a.outer)
    .sort((x, y) => {
      const nx = readingForAspect(x) ? 1 : 0;
      const ny = readingForAspect(y) ? 1 : 0;
      if (nx !== ny) return ny - nx;
      if (y.strength !== x.strength) return y.strength - x.strength;
      return Math.abs(x.orb) - Math.abs(y.orb);
    })
    .slice(0, limit);
}

/** Bodies whose aspects deserve a warning whatever the user asked for. */
export const HEAVY_ASPECT_BODIES = new Set(['Pluto', 'Saturn', 'Neptune', 'Lilith', 'Mars']);

export function aspectIsHeavy(a: SynastryAspect): boolean {
  return HEAVY_ASPECT_BODIES.has(a.inner) || HEAVY_ASPECT_BODIES.has(a.outer);
}
