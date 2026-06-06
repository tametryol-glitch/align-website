/**
 * Soul Lines — emotionally resonant one-liners based on Sun + Moon sign.
 *
 * These are the "screenshot moment" — the line that makes someone
 * text their friend "this app GETS me." Designed for shareability.
 *
 * Coverage: 12 Sun signs × 4 Moon elements = 48 unique lines.
 * Each line captures the tension between the Sun (identity) and
 * Moon (emotional needs) — that's what makes them feel personal.
 */

type MoonElement = 'fire' | 'earth' | 'air' | 'water';

function getMoonElement(moonSign: string): MoonElement {
  const fire = ['Aries', 'Leo', 'Sagittarius'];
  const earth = ['Taurus', 'Virgo', 'Capricorn'];
  const air = ['Gemini', 'Libra', 'Aquarius'];
  if (fire.includes(moonSign)) return 'fire';
  if (earth.includes(moonSign)) return 'earth';
  if (air.includes(moonSign)) return 'air';
  return 'water';
}

const SOUL_LINES: Record<string, Record<MoonElement, string>> = {
  Aries: {
    fire: 'You burn twice as bright and wonder why the world moves so slow.',
    earth: 'You charge ahead but your heart keeps checking the foundation.',
    air: 'You start revolutions in your head before breakfast.',
    water: 'You lead with fire but your soul needs a quiet place to land.',
  },
  Taurus: {
    fire: 'You crave stability but something in you keeps striking matches.',
    earth: 'You are the calm that other people build their lives around.',
    air: 'You hold on tight but your mind is always exploring the edges.',
    water: 'You love deeply and quietly, and most people never see the half of it.',
  },
  Gemini: {
    fire: 'You contain multitudes and every single one of them is restless.',
    earth: 'You talk fast but your heart moves carefully — not everyone notices.',
    air: 'You process the world in conversations that never stop, even when you sleep.',
    water: 'You laugh to keep people close but feel everything at a depth they never guess.',
  },
  Cancer: {
    fire: 'You protect everyone else but forget to guard your own fire.',
    earth: 'You build a home wherever you go and remember every crack in every wall.',
    air: 'You feel first, think second, and somehow end up right both times.',
    water: 'You carry other people\'s feelings like luggage you forgot to put down.',
  },
  Leo: {
    fire: 'You were born knowing you were meant for something — and you were right.',
    earth: 'You shine effortlessly but the work you put in behind the scenes is enormous.',
    air: 'You perform for the room but what you really want is one person who truly sees you.',
    water: 'You light up every room but your deepest fear is being loved for the wrong reasons.',
  },
  Virgo: {
    fire: 'You fix everything around you and wonder why no one fixes you back.',
    earth: 'You notice what everyone else misses — and carry the weight of all of it.',
    air: 'Your mind never stops organizing a world that refuses to stay organized.',
    water: 'You serve others so well that they forget you have needs too.',
  },
  Libra: {
    fire: 'You keep the peace but inside you there is a war for your own wants.',
    earth: 'You weigh every choice twice and still worry you picked wrong.',
    air: 'You understand everyone else\'s perspective and sometimes lose your own.',
    water: 'You make harmony look effortless but the effort is everything.',
  },
  Scorpio: {
    fire: 'You feel everything twice and show it once — if at all.',
    earth: 'You trust slowly and love completely, and very few earn either.',
    air: 'You see through everyone but let them believe they fooled you.',
    water: 'You live at a depth most people are afraid to visit, even in themselves.',
  },
  Sagittarius: {
    fire: 'You run toward the horizon and somehow make freedom feel like home.',
    earth: 'You chase meaning but secretly want something solid to come back to.',
    air: 'You collect truths like souvenirs from lives you haven\'t finished living.',
    water: 'You laugh the loudest in the room and cry when no one\'s watching.',
  },
  Capricorn: {
    fire: 'You climb mountains that other people don\'t even see — and you never stop.',
    earth: 'You were old when you were young and you will be young when you are old.',
    air: 'You build empires in silence while everyone else is still making plans.',
    water: 'You carry the weight like it\'s nothing, but your heart keeps score of every ounce.',
  },
  Aquarius: {
    fire: 'You belong to everyone and no one, and that is exactly how you designed it.',
    earth: 'You see the future clearly but your feet are planted in the real.',
    air: 'You think three steps ahead of every conversation you\'re already bored with.',
    water: 'You care about humanity so much that individual hearts sometimes confuse you.',
  },
  Pisces: {
    fire: 'You dream in color and wake up ready to make it all real.',
    earth: 'You feel the whole ocean but somehow keep your feet on the ground.',
    air: 'You absorb every room you walk into and wonder why you\'re so tired.',
    water: 'You live between worlds and neither one has figured out how to keep you.',
  },
};

/**
 * Get a soul line for a Sun + Moon sign combination.
 * Returns a punchy, emotionally resonant one-liner.
 */
export function getSoulLine(sunSign: string, moonSign: string): string {
  const sun = sunSign?.charAt(0).toUpperCase() + sunSign?.slice(1).toLowerCase();
  const moonElement = getMoonElement(moonSign?.charAt(0).toUpperCase() + moonSign?.slice(1).toLowerCase());
  return SOUL_LINES[sun]?.[moonElement] || 'You contain more than any chart can hold.';
}

// ── Compatibility Soul Lines ─────────────────────────────────────

type ElementPair = 'fire-fire' | 'fire-earth' | 'fire-air' | 'fire-water'
  | 'earth-earth' | 'earth-air' | 'earth-water'
  | 'air-air' | 'air-water'
  | 'water-water';

function getSignElement(sign: string): 'fire' | 'earth' | 'air' | 'water' {
  const fire = ['Aries', 'Leo', 'Sagittarius'];
  const earth = ['Taurus', 'Virgo', 'Capricorn'];
  const air = ['Gemini', 'Libra', 'Aquarius'];
  if (fire.includes(sign)) return 'fire';
  if (earth.includes(sign)) return 'earth';
  if (air.includes(sign)) return 'air';
  return 'water';
}

const COMPAT_LINES: Record<ElementPair, string[]> = {
  'fire-fire': [
    'Two flames that make each other burn brighter — or burn the house down.',
    'You match each other\'s energy and dare each other to go further.',
  ],
  'fire-earth': [
    'One of you builds it, the other sets it on fire — somehow the thing still stands.',
    'You move at different speeds but arrive at the same place, amazed.',
  ],
  'fire-air': [
    'You feed each other\'s wildest ideas and call it Tuesday.',
    'Together you are either the best plan ever made or beautiful chaos — usually both.',
  ],
  'fire-water': [
    'Steam. That is what happens when your worlds collide — and neither of you can look away.',
    'You feel too much and move too fast, and somehow that is exactly right.',
  ],
  'earth-earth': [
    'You build something real and neither of you needs to explain why it matters.',
    'Two people who finally found someone who means what they say.',
  ],
  'earth-air': [
    'One of you lives in the plan, the other lives in the moment — you need both.',
    'You confuse each other in the best way and learn things no one else could teach.',
  ],
  'earth-water': [
    'A garden that waters itself — you grow together without trying.',
    'You give each other the one thing the world never does: patience.',
  ],
  'air-air': [
    'Two minds that never stop talking and never get bored.',
    'You understand each other at a frequency other people can\'t even hear.',
  ],
  'air-water': [
    'You speak different languages but somehow finish each other\'s sentences.',
    'One of you thinks it, the other feels it — together you know everything.',
  ],
  'water-water': [
    'Two oceans pretending to be separate waves.',
    'You feel each other before you speak, and the silence says more than words.',
  ],
};

/**
 * Get a compatibility soul line for two Sun signs.
 * Returns a punchy line about the pair's dynamic.
 */
export function getCompatSoulLine(sign1: string, sign2: string): string {
  const s1 = sign1?.charAt(0).toUpperCase() + sign1?.slice(1).toLowerCase();
  const s2 = sign2?.charAt(0).toUpperCase() + sign2?.slice(1).toLowerCase();
  const e1 = getSignElement(s1);
  const e2 = getSignElement(s2);
  // Normalize element pair order
  const pair = [e1, e2].sort().join('-') as ElementPair;
  const lines = COMPAT_LINES[pair];
  if (!lines?.length) return 'The stars wrote your names in the same sentence.';
  // Use a deterministic pick based on the sign names
  const hash = (s1.charCodeAt(0) + s2.charCodeAt(0)) % lines.length;
  return lines[hash];
}
