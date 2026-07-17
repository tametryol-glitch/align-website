/**
 * Daily Cosmic Card Engine
 *
 * Generates a personalized daily card for each user based on:
 * 1. Current planetary transits to their natal chart
 * 2. Current moon phase and sign
 * 3. Day of week cosmic associations
 * 4. Seasonal/zodiacal timing
 *
 * Cards are deterministic for a given date + birth data combination,
 * so the same user gets the same card all day (no random flicker).
 *
 * The message is personalized past sun-sign level: when birth data (or an
 * explicit sun degree) is available, the exact natal Sun longitude is computed
 * locally (Meeus low-precision solar theory, ~0.01°) and the hidden sub-sign
 * layers at that degree are woven into the card — never named in the text.
 *
 * PURE function module -- no store imports, no supabase, no side effects.
 */

import { calculateDuad, calculateCompendium } from '@/lib/engines/duadCompendium';
import { DUAD_TEXTURE, COMPENDIUM_STYLE } from '@/lib/interpretations/hiddenLayers';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CosmicCard {
  /** Deterministic hash of date + userId */
  id: string;
  /** YYYY-MM-DD */
  date: string;
  /** e.g., "The Alchemist" */
  title: string;
  /** Card icon */
  emoji: string;
  /** Visual theme */
  theme: CardTheme;
  /** Personalized 2-3 sentence cosmic message */
  message: string;
  /** Daily micro-challenge */
  challenge: string;
  /** Cosmic affirmation */
  affirmation: string;
  /** e.g., "Fire energy is strong for you today" */
  luckyElement: string;
  /** Overall energy reading */
  cosmicWeather: CosmicWeather;
  /** Best hours of the day (e.g., ["10am-12pm", "8pm-9pm"]) */
  power_hours: string[];
}

export interface CardTheme {
  name: string;
  gradient: [string, string];
  textColor: string;
  accentColor: string;
}

export interface CosmicWeather {
  /** 1-10 */
  overall: number;
  /** 1-10 */
  love: number;
  /** 1-10 */
  career: number;
  /** 1-10 */
  growth: number;
  /** e.g., "Electrifying", "Contemplative", "Transformative" */
  label: string;
}

export interface UserCosmicProfile {
  sun_sign: string;
  moon_sign?: string;
  rising_sign?: string;
  /** 0-359 */
  sun_degree?: number;
  /** 0-359 */
  moon_degree?: number;
  /** YYYY-MM-DD — used to compute the exact natal Sun degree when sun_degree is absent */
  birth_date?: string;
  /** HH:MM — sharpens the computed Sun degree */
  birth_time?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** 22 cosmic-themed card archetypes */
const CARD_ARCHETYPES: readonly {
  title: string;
  emoji: string;
  keywords: [string, string, string];
}[] = [
  { title: 'The Starseed', emoji: '\u{1F31F}', keywords: ['awakening', 'purpose', 'origin'] },
  { title: 'The Alchemist', emoji: '\u{2697}\u{FE0F}', keywords: ['transformation', 'power', 'creation'] },
  { title: 'The Mirror', emoji: '\u{1FA9E}', keywords: ['reflection', 'truth', 'awareness'] },
  { title: 'The Eclipse', emoji: '\u{1F311}', keywords: ['shadow', 'release', 'rebirth'] },
  { title: 'The Compass', emoji: '\u{1F9ED}', keywords: ['direction', 'journey', 'choice'] },
  { title: 'The Phoenix', emoji: '\u{1F525}', keywords: ['renewal', 'strength', 'rising'] },
  { title: 'The Oracle', emoji: '\u{1F52E}', keywords: ['intuition', 'wisdom', 'foresight'] },
  { title: 'The Constellation', emoji: '\u{2728}', keywords: ['connection', 'pattern', 'destiny'] },
  { title: 'The Tide', emoji: '\u{1F30A}', keywords: ['emotion', 'flow', 'depth'] },
  { title: 'The Summit', emoji: '\u{26F0}\u{FE0F}', keywords: ['ambition', 'achievement', 'perspective'] },
  { title: 'The Garden', emoji: '\u{1F33A}', keywords: ['growth', 'nurture', 'patience'] },
  { title: 'The Lightning', emoji: '\u{26A1}', keywords: ['breakthrough', 'sudden change', 'clarity'] },
  { title: 'The Vessel', emoji: '\u{1F3FA}', keywords: ['receiving', 'openness', 'abundance'] },
  { title: 'The Bridge', emoji: '\u{1F309}', keywords: ['transition', 'connection', 'progress'] },
  { title: 'The Flame', emoji: '\u{1F56F}\u{FE0F}', keywords: ['passion', 'inspiration', 'warmth'] },
  { title: 'The Crystal', emoji: '\u{1F48E}', keywords: ['clarity', 'purity', 'focus'] },
  { title: 'The Wind', emoji: '\u{1F32C}\u{FE0F}', keywords: ['change', 'communication', 'freedom'] },
  { title: 'The Root', emoji: '\u{1F333}', keywords: ['stability', 'grounding', 'ancestry'] },
  { title: 'The Nebula', emoji: '\u{1F30C}', keywords: ['mystery', 'potential', 'expansion'] },
  { title: 'The Healer', emoji: '\u{1F49A}', keywords: ['restoration', 'compassion', 'wholeness'] },
  { title: 'The Voyager', emoji: '\u{1F680}', keywords: ['exploration', 'courage', 'discovery'] },
  { title: 'The Weaver', emoji: '\u{1F578}\u{FE0F}', keywords: ['fate', 'interconnection', 'creation'] },
] as const;

/** Element-based visual themes */
const ELEMENT_THEMES: Record<string, CardTheme> = {
  fire: {
    name: 'fire',
    gradient: ['#FF6B35', '#F72585'],
    textColor: '#FFF',
    accentColor: '#FFD700',
  },
  earth: {
    name: 'earth',
    gradient: ['#2D6A4F', '#40916C'],
    textColor: '#FFF',
    accentColor: '#95D5B2',
  },
  air: {
    name: 'air',
    gradient: ['#7209B7', '#3A0CA3'],
    textColor: '#FFF',
    accentColor: '#B8A0FA',
  },
  water: {
    name: 'water',
    gradient: ['#023E8A', '#0077B6'],
    textColor: '#FFF',
    accentColor: '#90E0EF',
  },
};

/** Zodiac sign to element mapping */
const SIGN_ELEMENT: Record<string, string> = {
  aries: 'fire',
  leo: 'fire',
  sagittarius: 'fire',
  taurus: 'earth',
  virgo: 'earth',
  capricorn: 'earth',
  gemini: 'air',
  libra: 'air',
  aquarius: 'air',
  cancer: 'water',
  scorpio: 'water',
  pisces: 'water',
};

/** Element display labels for luckyElement text */
const ELEMENT_LABELS: Record<string, string> = {
  fire: 'Fire',
  earth: 'Earth',
  air: 'Air',
  water: 'Water',
};

/** Power hours by element */
const POWER_HOURS: Record<string, string[]> = {
  fire: ['6am-9am', '12pm-1pm'],
  earth: ['10am-12pm', '2pm-4pm'],
  air: ['1pm-3pm', '7pm-9pm'],
  water: ['4pm-6pm', '9pm-11pm'],
};

/** Message templates per element (5 each) — bold, behavioral, second person. */
const MESSAGE_TEMPLATES: Record<string, string[]> = {
  fire: [
    'Today is a {keyword1} day, and you don\'t do slow burns — you do ignition. The thing you\'ve been circling all week is ready; touch it and it moves. Your only real risk today is waiting long enough to talk yourself out of it.',
    'There\'s a {keyword2} charge in today that most people will spend carefully. You\'re not most people. Say the direct thing, make the first move, send it before noon — momentum is your birthright, {sunSign}, and today pays it double.',
    'You\'ve been performing patience lately, and it doesn\'t fit you. Today\'s {keyword1} current hands you an exit: one bold, slightly-too-honest move gets you further than a month of being reasonable.',
    'The {archetypeTitle} is a fast card, and it landed on the right person. Your temper and your brilliance sit closer together than usual today — the same heat drives both. Point it at {keyword2}, not at bystanders.',
    'Today rewards the version of you that decides in the doorway, not the one who rehearses in the car. {keyword1} is the theme; speed is the method. Leave one bridge unburned — you\'ll want it next week.',
  ],
  earth: [
    'Today is a {keyword1} day, which means it belongs to you — the one who actually finishes things. While everyone else brainstorms, lay one real brick: the account opened, the appointment booked, the first hundred words.',
    'You\'ve been carrying more than you\'ve told anyone, {sunSign}, and today\'s steady {keyword2} current is your chance to set one load down. Pick the obligation that only exists because you never said no to it.',
    'The {archetypeTitle} favors the long game today. One unglamorous decision — the budget line, the boundary, the maintenance you\'ve been deferring — quietly outperforms every exciting option on the table.',
    'Today your body is the oracle: the tight shoulders, the appetite, the 3pm fade are all data about {keyword1}. Fix the physical thing first and watch the "emotional" problem shrink to half its size.',
    '{keyword3} builds slowly and then all at once — and you\'re closer to the "all at once" than you think. Resist the urge to renovate the plan today. Execute the boring next step of the existing one.',
  ],
  air: [
    'Today\'s {keyword1} current runs straight through your favorite territory: the unsaid thing. You already know the conversation you\'ve been drafting in your head for days. Have it out loud before sunset — your edit was finished on Tuesday.',
    'Your mind will run three tabs ahead of the room today, {sunSign}. Spend it on {keyword2} instead of escape: the pattern you spot by noon is the one everyone else discovers next month.',
    'The {archetypeTitle} deals in connections, and today one sentence — said, sent, or overheard — reroutes something. Talk to the person outside your usual loop; that\'s where the {keyword3} is hiding.',
    'You collect perspectives the way other people collect keys, and today {keyword1} asks you to actually open a door with one. Take the idea you\'ve already explained to three people and do the first irreversible thing about it.',
    'Curiosity is your engine, but today it\'s also your tell: notice which question you keep circling back to. That question isn\'t idle — it\'s {keyword2} announcing itself. Follow it one step past comfortable.',
  ],
  water: [
    'Today\'s {keyword1} tide runs high, and you\'ll feel the room before you enter it. Trust the first read — the one you get in the opening three seconds — and stop retroactively talking yourself out of it by lunchtime.',
    'Half of what you feel today won\'t be yours, {sunSign}. Before you spiral on someone else\'s weather, ask the only question that matters: was I feeling this before they walked in? Then act on {keyword2} — yours, not theirs.',
    'The {archetypeTitle} pulls from underneath today. The dream fragment, the song you can\'t shake, the name that keeps surfacing — that\'s {keyword3} speaking your native language. Write it down before it dissolves.',
    'You\'ve been holding a feeling at arm\'s length because naming it makes it real. Today\'s {keyword1} current is strong enough to carry it: say the true sentence to one safe person and feel the weight redistribute.',
    'Your softness is load-bearing, not decorative — people rebuild themselves in the space you hold. Today, {keyword2} asks you to take a turn: let one person all the way in on the thing you\'ve been managing alone.',
  ],
};

/** Pool of 30+ micro-challenges */
const CHALLENGES: string[] = [
  'Share one genuine compliment with a stranger.',
  'Write down 3 things you want to manifest this month.',
  'Spend 10 minutes in silence and listen to your inner voice.',
  'Send a heartfelt message to someone you haven\'t talked to in a while.',
  'Take a different route today and notice what catches your eye.',
  'Write a letter to your future self, one year from now.',
  'Perform one random act of kindness before sundown.',
  'Put your phone away for one hour and be fully present.',
  'Identify one fear and take a small step toward facing it.',
  'Spend 5 minutes gazing at the sky and contemplating your place in the cosmos.',
  'Declutter one small space in your environment.',
  'Try a food or drink you\'ve never had before.',
  'Speak your biggest dream out loud to the universe.',
  'Meditate for 5 minutes focusing on gratitude.',
  'Create something with your hands -- draw, cook, build, or craft.',
  'Forgive yourself for one past mistake, fully and completely.',
  'Take a walk in nature and collect something that speaks to your soul.',
  'Write down your top 3 values and reflect on how you honored them today.',
  'Smile at everyone you encounter for one hour.',
  'Journal about what cosmic lesson this season is teaching you.',
  'Drink a full glass of water mindfully, feeling each sip nourish you.',
  'Stand barefoot on the earth for 5 minutes and feel grounded.',
  'Tell someone exactly how much they mean to you.',
  'Identify a limiting belief and write its opposite as an affirmation.',
  'Observe the moon tonight and set one intention beneath it.',
  'Dance to one song like nobody is watching.',
  'Choose one worry and consciously release it to the cosmos.',
  'List 5 things that make you uniquely powerful.',
  'Read or listen to something that expands your worldview.',
  'End your day by naming 3 moments of beauty you witnessed.',
  'Practice deep breathing for 3 minutes: inhale for 4, hold for 4, exhale for 4.',
  'Look into a mirror, meet your own eyes, and say "I am enough."',
];

/** Pool of 30+ cosmic affirmations */
const AFFIRMATIONS: string[] = [
  'I am aligned with the cosmic flow of abundance.',
  'My intuition is my compass, and I trust where it leads.',
  'I am a radiant being of light, worthy of every blessing.',
  'The universe conspires in my favor with every breath I take.',
  'I release what no longer serves me and welcome transformation.',
  'My energy is magnetic, drawing in exactly what I need.',
  'I am rooted in my truth and unshakable in my purpose.',
  'The stars that forged me continue to light my path.',
  'I embrace the unknown with curiosity and courage.',
  'Every challenge is a cosmic invitation to grow stronger.',
  'I am connected to an infinite source of wisdom and love.',
  'My soul knows the way; I choose to listen and follow.',
  'I vibrate at the frequency of gratitude and joy.',
  'I am the author of my own cosmic story.',
  'The universe mirrors my inner light back to me in beautiful ways.',
  'I trust divine timing -- everything arrives when I am ready.',
  'My heart is open, my mind is clear, and my spirit is free.',
  'I honor the seasons of my life with grace and acceptance.',
  'Cosmic energy flows through me, empowering every intention.',
  'I am exactly where I need to be on my soul\'s journey.',
  'My potential is as vast as the universe itself.',
  'I attract relationships that nourish and elevate my spirit.',
  'I am a channel of creative cosmic energy.',
  'Every ending in my life makes space for a luminous new beginning.',
  'I walk my path with confidence, knowing the cosmos walks with me.',
  'My unique gifts are needed in this world, and I share them freely.',
  'I am resilient like the stars -- burning bright through any darkness.',
  'The cosmos celebrates my existence with every sunrise.',
  'I choose love over fear in every moment.',
  'My dreams are blueprints from the universe, and I build with faith.',
  'I am whole, I am worthy, I am cosmically supported.',
  'The rhythm of the universe beats in harmony with my heart.',
];

/** Labels for cosmic weather based on dominant dimension */
const WEATHER_LABELS: Record<string, string[]> = {
  overall: ['Radiant', 'Harmonious', 'Electrifying', 'Luminous', 'Transcendent'],
  love: ['Enchanting', 'Tender', 'Passionate', 'Magnetic', 'Heartfelt'],
  career: ['Ambitious', 'Commanding', 'Strategic', 'Industrious', 'Empowered'],
  growth: ['Transformative', 'Contemplative', 'Expansive', 'Awakening', 'Evolutionary'],
};

// ---------------------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------------------

/**
 * Deterministic hash from a string. Returns a non-negative integer.
 * Simple charCode-based hash -- not cryptographic, just stable.
 */
function deterministicHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0; // force 32-bit int
  }
  return Math.abs(hash);
}

/**
 * Pick an item from an array using a deterministic seed.
 */
function pickFromSeed<T>(items: readonly T[], seed: number): T {
  return items[seed % items.length];
}

/**
 * Format a Date as YYYY-MM-DD.
 */
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Normalize a sign string to lowercase trimmed form.
 */
function normalizeSign(sign: string): string {
  return sign.trim().toLowerCase();
}

/**
 * Get the element for a zodiac sign. Defaults to 'fire' if unknown.
 */
function getElement(sign: string): string {
  return SIGN_ELEMENT[normalizeSign(sign)] ?? 'fire';
}

/**
 * Capitalize the first letter of a string.
 */
function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Clamp a number between min and max (inclusive).
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

const ZODIAC_ORDER = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

/**
 * Compute the natal Sun's ecliptic longitude from birth date/time using the
 * Meeus low-precision solar theory (~0.01° accuracy — far finer than the 2.5°
 * layer resolution this feeds). Birth time sharpens the result; without it,
 * noon is assumed (worst case ±0.5°). Returns null when no date is available.
 */
function natalSunLongitude(birthDate?: string, birthTime?: string): number | null {
  if (!birthDate) return null;
  const parts = birthDate.split('-').map(Number);
  if (parts.length < 3 || parts.some((n) => !isFinite(n))) return null;
  const [y, m, d] = parts;

  let hours = 12;
  if (birthTime) {
    const [hh, mm] = birthTime.split(':').map(Number);
    if (isFinite(hh)) hours = hh + (isFinite(mm) ? mm / 60 : 0);
  }

  const ms = Date.UTC(y, m - 1, d) + hours * 3600000;
  const jd = ms / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525;

  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * (Math.PI / 180);
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
    0.000289 * Math.sin(3 * M);

  return (((L0 + C) % 360) + 360) % 360;
}

/** First sentence of a text (used to keep the daily layer line card-sized). */
function firstSentenceOf(text: string): string {
  const idx = text.indexOf('.');
  return idx === -1 ? text : text.slice(0, idx + 1);
}

/**
 * Build the hidden-layer line for the card from the exact natal Sun degree.
 * Alternates day by day between the undercurrent beneath the sun sign and the
 * observable daily style, so the card reads fresh without losing determinism.
 */
function buildDailyLayerLine(
  sunLon: number,
  sunSignDisplay: string,
  dateStr: string,
): string {
  const lon = ((sunLon % 360) + 360) % 360;
  const lonSign = ZODIAC_ORDER[Math.floor(lon / 30) % 12];
  const degInSign = lon % 30;

  const duadSign = calculateDuad(lonSign, degInSign);
  const compSign = calculateCompendium(duadSign, degInSign);

  const dayNumber = deterministicHash(dateStr);
  const useUndercurrent = dayNumber % 2 === 0 && duadSign !== lonSign;

  if (useUndercurrent) {
    const texture = DUAD_TEXTURE[duadSign];
    if (texture) {
      return `Today leans on the part of you most people miss: underneath the ${sunSignDisplay} everyone recognizes, ${firstSentenceOf(texture)} Run today on that channel — deliberately.`;
    }
  }

  const style = COMPENDIUM_STYLE[compSign];
  if (style) {
    return `And watch how it shows up in the small things today: ${style}`;
  }
  return '';
}

// ---------------------------------------------------------------------------
// Core Engine
// ---------------------------------------------------------------------------

/**
 * Build the deterministic seed string for a given date and profile.
 */
function buildSeedString(dateStr: string, profile: UserCosmicProfile): string {
  const sun = normalizeSign(profile.sun_sign);
  const moon = profile.moon_sign ? normalizeSign(profile.moon_sign) : 'unknown';
  return `${dateStr}:${sun}:${moon}`;
}

/**
 * Generate today's cosmic card for a user.
 * Deterministic: same date + same profile = same card.
 *
 * @param date    - The calendar date to generate the card for.
 * @param profile - The user's basic cosmic profile (sun, moon, rising signs).
 * @returns A fully populated CosmicCard.
 */
export function generateDailyCard(
  date: Date,
  profile: UserCosmicProfile,
): CosmicCard {
  const dateStr = formatDate(date);
  const seedStr = buildSeedString(dateStr, profile);
  const seed = deterministicHash(seedStr);

  // 1. Card archetype
  const archetype = pickFromSeed(CARD_ARCHETYPES, seed);

  // 2. Element + theme
  const element = getElement(profile.sun_sign);
  const theme = ELEMENT_THEMES[element] ?? ELEMENT_THEMES.fire;

  // 3. Message
  const templates = MESSAGE_TEMPLATES[element] ?? MESSAGE_TEMPLATES.fire;
  const templateSeed = deterministicHash(seedStr + ':msg');
  const template = pickFromSeed(templates, templateSeed);
  const sunSignDisplay = capitalize(normalizeSign(profile.sun_sign));
  let message = template
    .replace(/\{sunSign\}/g, sunSignDisplay)
    .replace(/\{archetypeTitle\}/g, archetype.title)
    .replace(/\{keyword1\}/g, archetype.keywords[0])
    .replace(/\{keyword2\}/g, archetype.keywords[1])
    .replace(/\{keyword3\}/g, archetype.keywords[2]);

  // 3b. Weave the hidden sub-sign layer from the exact natal Sun degree —
  // this is what makes the card about THIS person, not every {sunSign}.
  const sunLon = profile.sun_degree ?? natalSunLongitude(profile.birth_date, profile.birth_time);
  if (sunLon !== null && sunLon !== undefined && isFinite(sunLon)) {
    const layerLine = buildDailyLayerLine(sunLon, sunSignDisplay, dateStr);
    if (layerLine) message += `\n\n${layerLine}`;
  }

  // 4. Challenge
  const challengeSeed = deterministicHash(seedStr + ':challenge');
  const challenge = pickFromSeed(CHALLENGES, challengeSeed);

  // 5. Affirmation
  const affirmationSeed = deterministicHash(seedStr + ':affirmation');
  const affirmation = pickFromSeed(AFFIRMATIONS, affirmationSeed);

  // 6. Lucky element
  const luckyElements: Record<string, string> = {
    fire: `${ELEMENT_LABELS.fire} energy is strong for you today`,
    earth: `${ELEMENT_LABELS.earth} energy is grounding you today`,
    air: `${ELEMENT_LABELS.air} energy is inspiring you today`,
    water: `${ELEMENT_LABELS.water} energy is flowing through you today`,
  };
  const luckyElement = luckyElements[element] ?? luckyElements.fire;

  // 7. Cosmic weather (personalized -- base + day-of-week + element modifier)
  const baseWeather = getCosmicWeather(date);
  const elementBonuses: Record<string, Partial<CosmicWeather>> = {
    fire: { overall: 1, career: 1 },
    earth: { career: 1, growth: 1 },
    air: { growth: 1, overall: 1 },
    water: { love: 1, growth: 1 },
  };
  const bonus = elementBonuses[element] ?? {};
  const cosmicWeather: CosmicWeather = {
    overall: clamp(baseWeather.overall + (bonus.overall ?? 0), 1, 10),
    love: clamp(baseWeather.love + (bonus.love ?? 0), 1, 10),
    career: clamp(baseWeather.career + (bonus.career ?? 0), 1, 10),
    growth: clamp(baseWeather.growth + (bonus.growth ?? 0), 1, 10),
    label: '', // assigned below
  };

  // Determine label from highest dimension
  const dimensions: { key: string; value: number }[] = [
    { key: 'overall', value: cosmicWeather.overall },
    { key: 'love', value: cosmicWeather.love },
    { key: 'career', value: cosmicWeather.career },
    { key: 'growth', value: cosmicWeather.growth },
  ];
  dimensions.sort((a, b) => b.value - a.value);
  const topDimension = dimensions[0].key;
  const labelPool = WEATHER_LABELS[topDimension] ?? WEATHER_LABELS.overall;
  const labelSeed = deterministicHash(seedStr + ':label');
  cosmicWeather.label = pickFromSeed(labelPool, labelSeed);

  // 8. Power hours
  const power_hours = POWER_HOURS[element] ?? POWER_HOURS.fire;

  // 9. Deterministic ID
  const id = `card_${deterministicHash(seedStr + ':id').toString(36)}`;

  return {
    id,
    date: dateStr,
    title: archetype.title,
    emoji: archetype.emoji,
    theme,
    message,
    challenge,
    affirmation,
    luckyElement,
    cosmicWeather,
    power_hours,
  };
}

/**
 * Get the cosmic weather for a given date (not personalized).
 * Used for the "Cosmic Pulse" community feature.
 *
 * Base scores start at 5 and are modified by day-of-week associations:
 * - Monday (Moon): love +2
 * - Tuesday (Mars): career +2
 * - Wednesday (Mercury): growth +2
 * - Thursday (Jupiter): overall +2
 * - Friday (Venus): love +3
 * - Saturday (Saturn): career +1, growth +1
 * - Sunday (Sun): overall +3
 *
 * An additional small modifier from the day-of-month adds variety.
 *
 * @param date - The calendar date.
 * @returns A CosmicWeather object with overall, love, career, growth scores and a label.
 */
export function getCosmicWeather(date: Date): CosmicWeather {
  let overall = 5;
  let love = 5;
  let career = 5;
  let growth = 5;

  // Day-of-week bonuses (0 = Sunday, 6 = Saturday)
  const dayOfWeek = date.getDay();
  switch (dayOfWeek) {
    case 0: // Sunday -- Sun
      overall += 3;
      break;
    case 1: // Monday -- Moon
      love += 2;
      break;
    case 2: // Tuesday -- Mars
      career += 2;
      break;
    case 3: // Wednesday -- Mercury
      growth += 2;
      break;
    case 4: // Thursday -- Jupiter
      overall += 2;
      break;
    case 5: // Friday -- Venus
      love += 3;
      break;
    case 6: // Saturday -- Saturn
      career += 1;
      growth += 1;
      break;
  }

  // Day-of-month micro-variation (keeps the same day-of-month feel consistent)
  const dom = date.getDate();
  const domMod = dom % 4;
  switch (domMod) {
    case 0:
      overall += 1;
      break;
    case 1:
      love += 1;
      break;
    case 2:
      career += 1;
      break;
    case 3:
      growth += 1;
      break;
  }

  overall = clamp(overall, 1, 10);
  love = clamp(love, 1, 10);
  career = clamp(career, 1, 10);
  growth = clamp(growth, 1, 10);

  // Determine label from highest dimension
  const dimensions: { key: string; value: number }[] = [
    { key: 'overall', value: overall },
    { key: 'love', value: love },
    { key: 'career', value: career },
    { key: 'growth', value: growth },
  ];
  dimensions.sort((a, b) => b.value - a.value);
  const topDimension = dimensions[0].key;
  const labelPool = WEATHER_LABELS[topDimension] ?? WEATHER_LABELS.overall;
  const dateStr = formatDate(date);
  const labelSeed = deterministicHash(dateStr + ':weather:label');
  const label = pickFromSeed(labelPool, labelSeed);

  return { overall, love, career, growth, label };
}
