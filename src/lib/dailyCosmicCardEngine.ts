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
 * PURE function module -- no store imports, no supabase, no side effects.
 */

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

/** Message templates per element (5+ each) */
const MESSAGE_TEMPLATES: Record<string, string[]> = {
  fire: [
    'As a {sunSign}, today\'s {archetypeTitle} energy amplifies your natural {keyword1}. The cosmos invites you to lean into {keyword2} and let your inner fire guide the way.',
    'The {archetypeTitle} ignites your {sunSign} spirit with waves of {keyword1}. Channel this cosmic spark toward bold {keyword2} -- the universe is backing your boldest moves.',
    'Your {sunSign} flame meets the {archetypeTitle}\'s call for {keyword1} today. Trust the heat of your convictions and let {keyword3} carry you forward with purpose.',
    'Cosmic currents stoke your {sunSign} fires through {archetypeTitle} energy. Embrace {keyword1} without hesitation and watch {keyword2} unfold like wildfire.',
    'The {archetypeTitle} speaks directly to your {sunSign} courage today. A moment of pure {keyword1} awaits -- step toward {keyword3} with confidence and passion.',
  ],
  earth: [
    'As a {sunSign}, the {archetypeTitle} grounds you in {keyword1}. This steady cosmic rhythm invites practical {keyword2} -- plant seeds that will bear fruit for seasons to come.',
    'Your {sunSign} nature finds deep resonance with today\'s {archetypeTitle}. Focus on {keyword1} and allow {keyword3} to emerge from patient, deliberate action.',
    'The {archetypeTitle} anchors your {sunSign} energy in {keyword2} today. Build on solid foundations and let {keyword1} guide your hands to meaningful work.',
    'Cosmic soil is rich for your {sunSign} roots today as the {archetypeTitle} nurtures {keyword1}. Cultivate {keyword3} with the care and patience only you can bring.',
    'The {archetypeTitle} aligns with your {sunSign} steadfastness, amplifying {keyword1}. Today\'s cosmic geometry favors {keyword2} and tangible progress.',
  ],
  air: [
    'As a {sunSign}, today\'s {archetypeTitle} fills your mind with currents of {keyword1}. Let your thoughts dance toward {keyword2} -- brilliant ideas are on the wind.',
    'The {archetypeTitle} electrifies your {sunSign} intellect with {keyword1}. Communication flows freely; share your vision of {keyword3} with those who matter.',
    'Your {sunSign} curiosity meets the {archetypeTitle}\'s gift of {keyword2}. Follow the threads of {keyword1} wherever they lead -- cosmic insights await at every turn.',
    'Breezes of {keyword1} sweep through your {sunSign} world as the {archetypeTitle} opens new channels of {keyword3}. Let your ideas take flight without reservation.',
    'The {archetypeTitle} sharpens your {sunSign} perception today. Waves of {keyword1} bring clarity to questions about {keyword2} -- trust the cosmic dialogue.',
  ],
  water: [
    'As a {sunSign}, the {archetypeTitle} deepens your natural {keyword1}. Dive into the emotional currents of {keyword2} -- hidden treasures surface for those who look within.',
    'The {archetypeTitle} stirs the waters of your {sunSign} soul with {keyword1}. Let {keyword3} flow through you like a healing tide, washing away what no longer serves.',
    'Your {sunSign} intuition is amplified by today\'s {archetypeTitle} energy. Sense the undercurrents of {keyword1} and allow {keyword2} to guide your heart\'s navigation.',
    'Cosmic tides carry your {sunSign} spirit toward {keyword1} today. The {archetypeTitle} invites you to float in the mystery of {keyword3} and trust the depths.',
    'The {archetypeTitle} opens portals of {keyword2} within your {sunSign} depths. Embrace {keyword1} with open arms -- emotional alchemy is your superpower today.',
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
  const message = template
    .replace(/\{sunSign\}/g, sunSignDisplay)
    .replace(/\{archetypeTitle\}/g, archetype.title)
    .replace(/\{keyword1\}/g, archetype.keywords[0])
    .replace(/\{keyword2\}/g, archetype.keywords[1])
    .replace(/\{keyword3\}/g, archetype.keywords[2]);

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
