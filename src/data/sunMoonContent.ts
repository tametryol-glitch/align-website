/* ──────────────────────────────────────────────────────────────
   Sun-Moon Personality Content Generator
   Produces SEO-rich, astrologically-accurate content for every
   possible Sun-Moon combination (144 unique combos).
   ────────────────────────────────────────────────────────────── */

import {
  SIGNS,
  ALL_SIGN_KEYS,
  getElementColor,
  type ZodiacSign,
  type Element,
  type Modality,
  type SignData,
} from './compatibilityContent';
import { SUN_MOON_VOICE } from './sunMoonVoice';

// Re-export for convenience
export { SIGNS, ALL_SIGN_KEYS, getElementColor, type ZodiacSign, type Element, type SignData };

// ── Element relationship types ──────────────────────────────

export type ElementHarmony =
  | 'Mirror Energy'
  | 'Harmonious Blend'
  | 'Dynamic Tension'
  | 'Creative Friction';

function getElementHarmony(sunEl: Element, moonEl: Element): ElementHarmony {
  if (sunEl === moonEl) return 'Mirror Energy';
  const compatible: Record<Element, Element> = {
    fire: 'air',
    air: 'fire',
    earth: 'water',
    water: 'earth',
  };
  if (compatible[sunEl] === moonEl) return 'Harmonious Blend';
  // Remaining combos: fire+water, fire+earth, air+earth, air+water
  const semiTense = new Set(['air+earth', 'earth+air']);
  const key = `${sunEl}+${moonEl}`;
  if (semiTense.has(key)) return 'Dynamic Tension';
  return 'Creative Friction';
}

// ── Sign-specific thematic data ─────────────────────────────

interface SignTheme {
  archetype: string;
  innerVerb: string;        // what this sign DOES at its core
  emotionalNeed: string;    // what the Moon in this sign craves
  identityDrive: string;    // what the Sun in this sign pursues
  shadowTrigger: string;    // what triggers the shadow
  superpower: string;       // unique gift
  bodyLanguage: string;     // how they express physically
  innerChild: string;       // what their inner child wants
  decisionStyle: string;    // how they make choices
  stressResponse: string;   // what they do under pressure
}

const SIGN_THEMES: Record<ZodiacSign, SignTheme> = {
  aries: {
    archetype: 'The Warrior',
    innerVerb: 'initiates',
    emotionalNeed: 'to feel free to act on impulse without judgment',
    identityDrive: 'to be first, to pioneer, to prove courage',
    shadowTrigger: 'feeling controlled or dismissed',
    superpower: 'turning raw courage into momentum that moves mountains',
    bodyLanguage: 'restless energy, quick movements, direct eye contact',
    innerChild: 'to be cheered on while charging fearlessly into the unknown',
    decisionStyle: 'instant gut reactions, decide now and adjust later',
    stressResponse: 'picks a fight or throws themselves into physical activity',
  },
  taurus: {
    archetype: 'The Builder',
    innerVerb: 'stabilizes',
    emotionalNeed: 'to feel physically safe, comfortable, and unhurried',
    identityDrive: 'to build something lasting and beautiful',
    shadowTrigger: 'being rushed or having security threatened',
    superpower: 'turning patience into an almost supernatural endurance',
    bodyLanguage: 'grounded stillness, warm touch, unhurried presence',
    innerChild: 'to be held, fed, and told everything will be okay',
    decisionStyle: 'slow deliberation, weighing sensory and practical factors',
    stressResponse: 'retreats into comfort: food, sleep, familiar routines',
  },
  gemini: {
    archetype: 'The Messenger',
    innerVerb: 'connects',
    emotionalNeed: 'to feel mentally stimulated and free to explore ideas',
    identityDrive: 'to know, to communicate, to bridge worlds',
    shadowTrigger: 'boredom or being pinned to a single narrative',
    superpower: 'seeing every side of a situation simultaneously',
    bodyLanguage: 'animated hands, shifting posture, quick wit in the eyes',
    innerChild: 'to be listened to with fascination and never told to be quiet',
    decisionStyle: 'gathers data from multiple sources, changes mind freely',
    stressResponse: 'overthinks, talks it out compulsively, or goes silent',
  },
  cancer: {
    archetype: 'The Nurturer',
    innerVerb: 'protects',
    emotionalNeed: 'to feel emotionally held and deeply needed',
    identityDrive: 'to create belonging, to nurture, to preserve memory',
    shadowTrigger: 'feeling emotionally unsafe or abandoned',
    superpower: 'reading the emotional temperature of any room instantly',
    bodyLanguage: 'protective posture, soft eyes, gravitates toward closeness',
    innerChild: 'to be someone\'s whole world and never fear being left',
    decisionStyle: 'guided by emotional intuition and gut feelings',
    stressResponse: 'withdraws into their shell, becomes moody or passive-aggressive',
  },
  leo: {
    archetype: 'The Sovereign',
    innerVerb: 'radiates',
    emotionalNeed: 'to feel genuinely admired and creatively expressed',
    identityDrive: 'to shine, to create, to be remembered',
    shadowTrigger: 'feeling invisible or unappreciated',
    superpower: 'making everyone around them feel like the main character too',
    bodyLanguage: 'commanding presence, warm gestures, takes up space joyfully',
    innerChild: 'to be applauded, adored, and told their light is not too much',
    decisionStyle: 'follows their heart with dramatic conviction',
    stressResponse: 'becomes theatrical, domineering, or withdraws wounded pride',
  },
  virgo: {
    archetype: 'The Analyst',
    innerVerb: 'refines',
    emotionalNeed: 'to feel useful and that your efforts are noticed',
    identityDrive: 'to improve, to serve, to make things right',
    shadowTrigger: 'chaos, incompetence, or being criticized for trying to help',
    superpower: 'finding the one thread that unravels the entire problem',
    bodyLanguage: 'contained movements, observant eyes, quiet attentiveness',
    innerChild: 'to be told they are enough exactly as they are, flaws and all',
    decisionStyle: 'analyzes every variable, worries about making mistakes',
    stressResponse: 'spirals into anxiety, over-organizes, or becomes hypercritical',
  },
  libra: {
    archetype: 'The Diplomat',
    innerVerb: 'harmonizes',
    emotionalNeed: 'to feel surrounded by beauty, peace, and genuine partnership',
    identityDrive: 'to create balance, to connect, to make things fair',
    shadowTrigger: 'conflict, ugliness, or being forced to choose sides',
    superpower: 'seeing the validity in every perspective simultaneously',
    bodyLanguage: 'graceful movements, mirroring others, charming smile',
    innerChild: 'to be chosen, to never be alone, to live in a world without fighting',
    decisionStyle: 'weighs every angle endlessly, seeks consensus before committing',
    stressResponse: 'becomes passive-aggressive, people-pleases, or emotionally shuts down',
  },
  scorpio: {
    archetype: 'The Alchemist',
    innerVerb: 'transforms',
    emotionalNeed: 'to feel trusted with someone\'s deepest truth',
    identityDrive: 'to penetrate beneath the surface, to transform, to survive',
    shadowTrigger: 'betrayal, superficiality, or loss of control',
    superpower: 'seeing through every mask and loving what they find beneath',
    bodyLanguage: 'intense stillness, penetrating gaze, magnetic presence',
    innerChild: 'to be fully known and loved anyway, without fear of abandonment',
    decisionStyle: 'trusts deep instinct over logic, commits with total intensity',
    stressResponse: 'becomes controlling, obsessive, or emotionally scorched-earth',
  },
  sagittarius: {
    archetype: 'The Explorer',
    innerVerb: 'expands',
    emotionalNeed: 'to feel that life is an adventure with unlimited possibility',
    identityDrive: 'to find meaning, to explore, to teach what they discover',
    shadowTrigger: 'being caged, micromanaged, or told to be realistic',
    superpower: 'finding the lesson and the humor in absolutely everything',
    bodyLanguage: 'expansive gestures, restless legs, infectious laughter',
    innerChild: 'to run wild, ask every question, and never be told the world is small',
    decisionStyle: 'leaps first, philosophizes mid-air, adjusts on landing',
    stressResponse: 'over-commits, escapes into travel or philosophy, or becomes preachy',
  },
  capricorn: {
    archetype: 'The Architect',
    innerVerb: 'structures',
    emotionalNeed: 'to feel respected and that your sacrifices matter',
    identityDrive: 'to achieve mastery, to build legacy, to earn authority',
    shadowTrigger: 'failure, disrespect, or feeling like their effort was wasted',
    superpower: 'turning long-term discipline into achievements others call impossible',
    bodyLanguage: 'restrained posture, deliberate movements, dry humor in the eyes',
    innerChild: 'to be told they don\'t have to earn love, that they can rest',
    decisionStyle: 'strategic, long-term, weighs cost-benefit with ruthless clarity',
    stressResponse: 'works harder, shuts down emotionally, or becomes coldly dismissive',
  },
  aquarius: {
    archetype: 'The Visionary',
    innerVerb: 'disrupts',
    emotionalNeed: 'to feel accepted for your weirdness without having to conform',
    identityDrive: 'to innovate, to liberate, to reimagine what\'s possible',
    shadowTrigger: 'conformity pressure, emotional demands, or being called ordinary',
    superpower: 'seeing the future that nobody else believes in yet',
    bodyLanguage: 'unpredictable energy, detached warmth, eyes always scanning the horizon',
    innerChild: 'to be celebrated as brilliant rather than strange',
    decisionStyle: 'rational analysis filtered through idealistic principles',
    stressResponse: 'detaches emotionally, intellectualizes feelings, or rebels against everything',
  },
  pisces: {
    archetype: 'The Mystic',
    innerVerb: 'dissolves',
    emotionalNeed: 'to feel spiritually connected and safe enough to be boundaryless',
    identityDrive: 'to transcend, to imagine, to feel everything and make art from it',
    shadowTrigger: 'harsh reality, emotional coldness, or feeling spiritually abandoned',
    superpower: 'absorbing the emotional truth of any situation and reflecting it back as beauty',
    bodyLanguage: 'dreamy eyes, fluid movements, seems slightly not-of-this-world',
    innerChild: 'to live in a world as beautiful as their imagination, surrounded by unconditional love',
    decisionStyle: 'follows intuition and signs, struggles with practical choices',
    stressResponse: 'escapes into fantasy, self-medicates, or dissolves into others\' problems',
  },
};

// ── Soul tagline generator ──────────────────────────────────

interface TaglineOverride {
  sun: ZodiacSign;
  moon: ZodiacSign;
  tagline: string;
}

const TAGLINE_OVERRIDES: TaglineOverride[] = [
  { sun: 'scorpio', moon: 'pisces', tagline: 'An ocean of feeling hidden behind a fortress of steel.' },
  { sun: 'aries', moon: 'cancer', tagline: 'A warrior\'s armor protecting the softest heart in the zodiac.' },
  { sun: 'leo', moon: 'aquarius', tagline: 'Born to stand out, wired to stand apart.' },
  { sun: 'capricorn', moon: 'pisces', tagline: 'Building empires by day, dissolving into dreams by night.' },
  { sun: 'gemini', moon: 'scorpio', tagline: 'A butterfly with a detective\'s instincts.' },
  { sun: 'taurus', moon: 'aquarius', tagline: 'Roots planted deep, eyes fixed on the future no one else can see.' },
  { sun: 'virgo', moon: 'pisces', tagline: 'The saint who organizes miracles on a spreadsheet.' },
  { sun: 'libra', moon: 'scorpio', tagline: 'Velvet diplomacy wrapped around obsidian intensity.' },
  { sun: 'sagittarius', moon: 'cancer', tagline: 'An explorer who carries home like a compass in their chest.' },
  { sun: 'cancer', moon: 'aries', tagline: 'Fierce protector of everything soft and sacred.' },
  { sun: 'aquarius', moon: 'cancer', tagline: 'The revolutionary who secretly just wants to be held.' },
  { sun: 'pisces', moon: 'capricorn', tagline: 'A dreamer who wakes up and makes it happen.' },
  { sun: 'aries', moon: 'pisces', tagline: 'Lightning bolts with a poet\'s soul.' },
  { sun: 'leo', moon: 'scorpio', tagline: 'A throne room with a trapdoor to the underworld.' },
  { sun: 'scorpio', moon: 'leo', tagline: 'The power behind the throne who secretly wants the crown.' },
  { sun: 'gemini', moon: 'cancer', tagline: 'A mind that never stops racing, guarding a heart that never stops feeling.' },
  { sun: 'taurus', moon: 'scorpio', tagline: 'Still waters over volcanic depths.' },
  { sun: 'capricorn', moon: 'cancer', tagline: 'The CEO who cries at commercials.' },
  { sun: 'virgo', moon: 'aries', tagline: 'Precision engineering powered by rocket fuel.' },
  { sun: 'libra', moon: 'aries', tagline: 'Charming everyone while secretly wanting to burn it all down and start fresh.' },
  { sun: 'sagittarius', moon: 'scorpio', tagline: 'A philosopher carrying a torch through the underworld.' },
  { sun: 'cancer', moon: 'aquarius', tagline: 'Nurturing the future while mourning the past.' },
  { sun: 'pisces', moon: 'aries', tagline: 'A dreamer with a war cry.' },
  { sun: 'aquarius', moon: 'scorpio', tagline: 'The detached genius with a secret obsessive streak.' },
  { sun: 'leo', moon: 'cancer', tagline: 'A lion who roars at the world and purrs at home.' },
  { sun: 'scorpio', moon: 'aries', tagline: 'Relentless intensity meets unstoppable force.' },
  { sun: 'gemini', moon: 'pisces', tagline: 'A thousand stories told by someone who feels every word.' },
  { sun: 'taurus', moon: 'aries', tagline: 'Patient until provoked, then a force of nature.' },
  { sun: 'capricorn', moon: 'aries', tagline: 'Strategic patience armed with a warrior\'s restlessness.' },
  { sun: 'virgo', moon: 'scorpio', tagline: 'The quiet one who noticed everything you tried to hide.' },
  { sun: 'sagittarius', moon: 'capricorn', tagline: 'Wild dreams anchored by iron discipline.' },
  { sun: 'libra', moon: 'pisces', tagline: 'An aesthete drowning beautifully in their own empathy.' },
];

function generateSoulTagline(sun: ZodiacSign, moon: ZodiacSign): string {
  const override = TAGLINE_OVERRIDES.find(
    (t) => t.sun === sun && t.moon === moon
  );
  if (override) return override.tagline;

  const sunData = SIGNS[sun];
  const moonData = SIGNS[moon];
  const sunTheme = SIGN_THEMES[sun];
  const moonTheme = SIGN_THEMES[moon];
  const harmony = getElementHarmony(sunData.element, moonData.element);

  if (sun === moon) {
    return `${sunData.name} all the way through: what people see is what you feel, with nobody inside to argue.`;
  }

  if (harmony === 'Mirror Energy') {
    const templates = [
      `${sunData.name} out front, ${moonData.name} underneath, and both halves pull the same way.`,
      `Your ${sunData.name} Sun and ${moonData.name} Moon want the same things, so you rarely have to explain yourself to yourself.`,
    ];
    return templates[(sun.length + moon.length) % templates.length];
  }

  if (harmony === 'Harmonious Blend') {
    return `${sunData.name} in public, ${moonData.name} at home, and the two of them get along better than most.`;
  }

  if (harmony === 'Dynamic Tension') {
    return `${sunData.name} out front, ${moonData.name} underneath, and you spend years deciding which one gets to drive.`;
  }

  // Creative Friction
  return `${sunData.name} in public, ${moonData.name} in private, and the two of them barely want the same things.`;
}

// ── "You might relate to this if..." generator ──────────────

interface RelatableEntry {
  sun: ZodiacSign;
  moon: ZodiacSign;
  bullets: string[];
}

const RELATABLE_OVERRIDES: RelatableEntry[] = [
  {
    sun: 'scorpio', moon: 'pisces', bullets: [
      'You feel other people\'s pain so deeply it sometimes takes days to recover from a single conversation',
      'You can read someone\'s true intentions within seconds of meeting them, and you\'re almost never wrong',
      'You have an entire inner universe of feelings you\'ve never told anyone about',
      'You love fiercely but test people before you let them see who you really are',
      'You\'re drawn to the dark, the mystical, and the things people are afraid to talk about',
    ],
  },
  {
    sun: 'aries', moon: 'cancer', bullets: [
      'You start fights to protect people you love and then cry about it afterwards',
      'You project confidence but secretly need reassurance more than anyone knows',
      'You\'re the friend who will drive across town at 2 AM but won\'t ask for help yourself',
      'You alternate between wanting to conquer the world and wanting to stay in bed with someone who makes you feel safe',
      'Your anger is actually just fear that someone you love is going to leave',
    ],
  },
  {
    sun: 'leo', moon: 'aquarius', bullets: [
      'You crave attention but feel uncomfortable when you actually get it',
      'You want to be special but also hate the idea of being mainstream',
      'You\'re the life of the party who goes home and reads about quantum physics',
      'You attract people effortlessly but keep almost everyone at arm\'s length',
      'You have strong opinions about how the world should work but struggle to fit into any one group',
    ],
  },
  {
    sun: 'capricorn', moon: 'pisces', bullets: [
      'You have a five-year plan and a recurring dream you can\'t explain',
      'People think you\'re cold but you cry at movies when nobody\'s watching',
      'You feel guilty relaxing because your mind immediately starts planning the next goal',
      'You\'re drawn to both spreadsheets and spirituality and see no contradiction',
      'You carry other people\'s sadness like it\'s your job, then wonder why you\'re exhausted',
    ],
  },
];

function generateRelatableBullets(sun: ZodiacSign, moon: ZodiacSign): string[] {
  const override = RELATABLE_OVERRIDES.find(
    (r) => r.sun === sun && r.moon === moon
  );
  if (override) return override.bullets;

  const sunData = SIGNS[sun];
  const moonData = SIGNS[moon];
  const sunTheme = SIGN_THEMES[sun];
  const moonTheme = SIGN_THEMES[moon];
  const harmony = getElementHarmony(sunData.element, moonData.element);

  const bullets: string[] = [];

  // Bullet 1: The inner contradiction
  if (harmony === 'Creative Friction' || harmony === 'Dynamic Tension') {
    bullets.push(
      `You show the world ${sunData.traits[0]} energy but privately need ${moonTheme.emotionalNeed}`
    );
  } else if (harmony === 'Mirror Energy' && sun !== moon) {
    bullets.push(
      `People assume they know you because your outside matches your inside, but your ${sunData.name} side and your ${moonData.name} side want different things when it counts`
    );
  } else if (sun === moon) {
    bullets.push(
      `People either love your intensity or find you overwhelming, and you secretly know exactly which one they are`
    );
  } else {
    bullets.push(
      `Your ${sunData.name} Sun leads in public and your ${moonData.name} Moon takes over when you are alone, and the handover is smoother than most people get`
    );
  }

  // Bullet 2: Emotional processing style
  if (moonData.element === 'water') {
    bullets.push(
      'You absorb emotions from every room you walk into and sometimes can\'t tell which feelings are yours'
    );
  } else if (moonData.element === 'fire') {
    bullets.push(
      'You process emotions by doing something, like cleaning, running or starting a project at midnight, because sitting with feelings feels like drowning'
    );
  } else if (moonData.element === 'earth') {
    bullets.push(
      'You don\'t trust an emotion until you can name it, explain it, and figure out what to do about it'
    );
  } else {
    bullets.push(
      'You rehearse conversations in your head for hours but freeze when it\'s time to speak from the heart'
    );
  }

  // Bullet 3: Relationship pattern
  if (sunData.element === 'fire' && moonData.element === 'water') {
    bullets.push(
      'You fall in love fast and hard, then immediately start building walls because the vulnerability terrifies you'
    );
  } else if (sunData.element === 'earth' && moonData.element === 'fire') {
    bullets.push(
      'You plan your life meticulously but secretly fantasize about burning it all down and starting something wild'
    );
  } else if (sunData.element === 'air' && moonData.element === 'earth') {
    bullets.push(
      'You talk about freedom and possibilities but what you actually crave is someone who shows up reliably, every single day'
    );
  } else if (sunData.element === 'water' && moonData.element === 'air') {
    bullets.push(
      'You feel everything deeply but explain it all away with logic because vulnerability feels like losing control'
    );
  } else if (sunData.element === 'fire' && moonData.element === 'earth') {
    bullets.push(
      'Your ambition is huge but your need for security makes you hesitate at the exact moment you should leap'
    );
  } else if (sunData.element === 'earth' && moonData.element === 'water') {
    bullets.push(
      'You appear unshakable but the wrong word from someone you love can hollow you out for days'
    );
  } else if (sunData.element === 'water' && moonData.element === 'fire') {
    bullets.push(
      'You feel everything but express it as anger because that\'s the only emotion that doesn\'t make you feel exposed'
    );
  } else if (sunData.element === 'air' && moonData.element === 'water') {
    bullets.push(
      'You intellectualize your emotions until someone catches you off guard and everything floods out at once'
    );
  } else if (sunData.element === 'fire' && moonData.element === 'air') {
    bullets.push(
      'You\'re the person who inspires everyone in the room but secretly wonders if anyone actually knows the real you'
    );
  } else if (sunData.element === 'air' && moonData.element === 'fire') {
    bullets.push(
      'You think you want intellectual connection but you actually crave someone who matches your hidden intensity'
    );
  } else if (sunData.element === 'earth' && moonData.element === 'earth') {
    bullets.push(
      'People mistake your patience for not caring, but you\'re actually just waiting to see if they\'re worth the investment'
    );
  } else if (sunData.element === 'water' && moonData.element === 'water') {
    bullets.push(
      'You need 48 hours alone after any social event to feel like yourself again'
    );
  } else if (sunData.element === 'fire' && moonData.element === 'fire') {
    bullets.push(
      'You have to be careful not to set your own life on fire just because you\'re bored'
    );
  } else {
    bullets.push(
      'You fall in love with potential and then get disappointed by reality'
    );
  }

  // Bullet 4: Stress / coping pattern
  const moonStressMap: Record<Element, string> = {
    water: 'When you\'re overwhelmed, you don\'t want advice. You want someone to sit in the dark with you and say nothing',
    fire: 'Your coping mechanism for sadness is anger, and your coping mechanism for anger is doing something reckless',
    earth: 'When life feels chaotic, you reorganize your entire physical space as if cleaning your room can clean your mind',
    air: 'You deal with pain by detaching from it so completely that people think you don\'t care, when really you care too much to function',
  };
  bullets.push(moonStressMap[moonData.element]);

  // Bullet 5: The secret they'd never admit
  const secretMap: Record<Element, Record<Element, string>> = {
    fire: {
      fire: 'You secretly fear that your confidence is just performance and one day everyone will see through it',
      earth: 'You project wild independence but secretly dream about a life so stable it would bore your friends to tears',
      air: 'You act on instinct and then lie awake at 3 AM wondering if you made the right choice',
      water: 'The bravest thing you do isn\'t charging forward, it\'s letting someone see you cry',
    },
    earth: {
      fire: 'You pretend to be practical but your secret fantasy life would shock everyone who thinks they know you',
      earth: 'Your greatest fear isn\'t failure, it\'s that you\'ll build everything perfectly and still feel empty',
      air: 'You build walls that look like boundaries, but really you\'re just terrified of being known',
      water: 'You keep your emotions locked in a vault, and the person who gets the combination has you for life',
    },
    air: {
      fire: 'You analyze everything except the one feeling that actually matters, and you know exactly which one it is',
      earth: 'You talk about ideas to avoid talking about needs, and the loneliest you\'ve ever felt was in a room full of people who adore you',
      air: 'You\'re terrified that if you stop being interesting, everyone will leave',
      water: 'You have an entire emotional life you\'ve never let anyone see because showing it would mean giving up control',
    },
    water: {
      fire: 'You feel everything but you\'ve learned to turn pain into fuel, and you\'re not sure if that\'s strength or self-destruction',
      earth: 'You sense things about people that would scare them if you said it out loud, so you never do',
      air: 'You understand everyone else\'s emotions perfectly but your own feelings are a mystery you\'ve been avoiding',
      water: 'You\'ve been told you\'re too sensitive your whole life and you\'ve almost started to believe it',
    },
  };
  bullets.push(secretMap[sunData.element][moonData.element]);

  return bullets;
}

// ── Content section generators ──────────────────────────────

export interface PersonalitySection {
  title: string;
  icon: string;
  paragraphs: string[];
}

export interface SunMoonContent {
  sunSign: SignData;
  moonSign: SignData;
  sunKey: ZodiacSign;
  moonKey: ZodiacSign;
  slug: string;
  soulTagline: string;
  elementHarmony: ElementHarmony;
  sections: PersonalitySection[];
  relatableBullets: string[];
}

// The five sections below are written from SUN_MOON_VOICE (per-sign behaviour
// lines in the reader's voice). They never define a sign or its element: the
// element relationship only decides which framing sentence is used.

type Relation = 'same' | 'easy' | 'tension' | 'friction';

function getRelation(sun: ZodiacSign, moon: ZodiacSign, harmony: ElementHarmony): Relation {
  if (sun === moon) return 'same';
  if (harmony === 'Mirror Energy' || harmony === 'Harmonious Blend') return 'easy';
  return harmony === 'Dynamic Tension' ? 'tension' : 'friction';
}

/** "Your quiet strength is X" -> "Your private strength is X" so a second
 *  strength can follow the first without repeating the same words. */
function privateStrength(line: string): string {
  return line.replace(/^Your quiet strength is/, 'Your private strength is');
}

/** 'a' or 'an' for a sign name (Aries and Aquarius take 'an'). */
function an(name: string): string {
  return /^[AEIOU]/.test(name) ? 'an' : 'a';
}

function privateEdge(line: string): string {
  return line.replace(/^Your growth move is/, 'On the private side, your move is');
}

// Section 1: The Inner Landscape
function generateInnerLandscape(
  sun: ZodiacSign,
  moon: ZodiacSign,
  sunData: SignData,
  moonData: SignData,
  _sunTheme: SignTheme,
  _moonTheme: SignTheme,
  harmony: ElementHarmony
): PersonalitySection {
  const s = SUN_MOON_VOICE[sun];
  const m = SUN_MOON_VOICE[moon];
  const rel = getRelation(sun, moon, harmony);
  const paragraphs: string[] = [];

  const intro: Record<Relation, string> = {
    same: `As ${an(sunData.name)} ${sunData.name} with your Sun and Moon both in the same sign, there is no second person hiding behind the first. What people see is what you feel, and that is both your charm and your blind spot.`,
    easy: `As ${an(sunData.name)} ${sunData.name} Sun with ${an(moonData.name)} ${moonData.name} Moon, the person people meet and the person who goes home are close to the same, with one difference worth knowing.`,
    tension: `As ${an(sunData.name)} ${sunData.name} Sun with ${an(moonData.name)} ${moonData.name} Moon, the person people meet and the person who goes home want different things, and you have gotten used to keeping the second one quiet.`,
    friction: `As ${an(sunData.name)} ${sunData.name} Sun with ${an(moonData.name)} ${moonData.name} Moon, the person people meet and the person who goes home barely want the same things, and you have spent years making that look like a personality.`,
  };
  paragraphs.push(`${intro[rel]} ${s.sunShow} What you chase is ${s.sunChase}.`);

  const trapTail: Record<Relation, string> = {
    same: 'Because nothing inside you argues back, that habit can run unchallenged for decades.',
    easy: 'Because little in you resists it, that habit can run for years before anyone, including you, calls it out.',
    tension: `The more you perform the ${sunData.name} side, the quieter your ${moonData.name} side gets, and then it gets loud at a bad moment.`,
    friction: `The harder you lean on the ${sunData.name} side, the more your ${moonData.name} side goes underground, and it comes back as a mood you cannot explain.`,
  };
  paragraphs.push(`${s.sunTrap} ${trapTail[rel]}`);

  const settle: Record<Relation, string> = {
    same: 'Your Sun and Moon agree, so you decide fast and rarely second-guess. The cost is that nobody in your head ever says wait.',
    easy: 'Your Sun and Moon rarely fight, so big decisions feel simple. The risk is never being pushed past what is comfortable.',
    tension: 'Your Sun and Moon want different things, so most big decisions are an argument between them. You tend to settle it by picking the same winner every time.',
    friction: 'Your Sun and Moon do not speak the same language, so you win one argument by ignoring the other for years, until it sends you the bill.',
  };
  paragraphs.push(settle[rel]);

  return { title: 'The Inner Landscape', icon: '🌌', paragraphs };
}

// Section 2: Emotional World
function generateEmotionalWorld(
  sun: ZodiacSign,
  moon: ZodiacSign,
  sunData: SignData,
  moonData: SignData,
  _sunTheme: SignTheme,
  _moonTheme: SignTheme,
  harmony: ElementHarmony
): PersonalitySection {
  const m = SUN_MOON_VOICE[moon];
  const rel = getRelation(sun, moon, harmony);
  const paragraphs: string[] = [];

  paragraphs.push(`Your ${moonData.name} Moon is the part of you that does not negotiate. ${m.moonNeed} ${m.moonUpset}`);
  paragraphs.push(m.moonComfort);

  const ask: Record<Relation, string> = {
    same: 'Because both halves of you want the same thing, you do not hide it, which is why partners who cannot give it find out fast.',
    easy: `Your ${sunData.name} Sun does not get in the way of this, so asking for it feels natural. The trap is assuming people can already tell.`,
    tension: `Your ${sunData.name} Sun makes this hard to ask for, because the version of you people count on does not look like someone who needs it. So you say you are fine, and then resent that they believed you.`,
    friction: `Your ${sunData.name} Sun actively hides this: everything you show the world says you do not need it, so the people closest to you get your performance instead of your need. Say it once out loud to one person you trust, and notice how much lighter the week gets.`,
  };
  paragraphs.push(ask[rel]);

  return { title: 'Emotional World', icon: '💫', paragraphs };
}

// Section 3: In Relationships
function generateRelationships(
  sun: ZodiacSign,
  moon: ZodiacSign,
  sunData: SignData,
  moonData: SignData,
  _sunTheme: SignTheme,
  _moonTheme: SignTheme,
  harmony: ElementHarmony
): PersonalitySection {
  const s = SUN_MOON_VOICE[sun];
  const m = SUN_MOON_VOICE[moon];
  const rel = getRelation(sun, moon, harmony);
  const paragraphs: string[] = [];

  paragraphs.push(`${s.loveSun} ${m.loveMoon}`);

  const want: Record<Relation, string> = {
    same: 'Both halves of you want the same thing from a partner, which makes you easy to read and hard to satisfy halfway. You would rather be alone than half-met.',
    easy: 'The two halves of you want compatible things from love, so partners rarely have to decode you. The risk is staying with someone comfortable who never asks you to become more.',
    tension: 'The two halves of you want different things from the same person, so partners keep getting half of you. The ones who last are the ones who notice both.',
    friction: 'The two halves of you want almost opposite things from love, so you can choose someone who delights one side and starves the other, and the relationship feels incomplete without either of you knowing why.',
  };
  paragraphs.push(want[rel]);

  const watch: Record<Relation, string> = {
    same: 'Watch for attracting people who offer the balance you do not carry, then resenting them for the friction it creates.',
    easy: 'Watch for choosing someone who feels immediately familiar and repeating a dynamic you already know by heart.',
    tension: 'Watch for testing new partners without telling them, to see whether they can handle all of you before you open up.',
    friction: 'Watch for intense connections that feel enormous for six months and never feel complete.',
  };
  paragraphs.push(`The pattern to watch: ${watch[rel].replace(/^Watch for /, '')}`);

  return { title: 'In Relationships', icon: '💞', paragraphs };
}

// Section 4: Hidden Strengths
function generateHiddenStrengths(
  sun: ZodiacSign,
  moon: ZodiacSign,
  sunData: SignData,
  moonData: SignData,
  _sunTheme: SignTheme,
  _moonTheme: SignTheme,
  harmony: ElementHarmony
): PersonalitySection {
  const s = SUN_MOON_VOICE[sun];
  const m = SUN_MOON_VOICE[moon];
  const rel = getRelation(sun, moon, harmony);
  const paragraphs: string[] = [];

  paragraphs.push(s.strength);
  if (sun !== moon) paragraphs.push(privateStrength(m.strength));

  const range: Record<Relation, string> = {
    same: 'You are the same person in public and private, in a crisis and in calm. That is rarer than you think, and people build their trust in you on it.',
    easy: 'You are close to the same person in public and private, in a crisis and in calm. That consistency is rarer than you think, and trust forms around it.',
    tension: 'Because your two halves disagree, you read people well. You have managed two points of view in your own head for years, so nothing in someone else\'s contradiction surprises you.',
    friction: 'Because your two halves barely agree, you can hold a contradiction without flinching. You are the person people bring their messiest, most mixed-up situation to, because you will not tell them to pick a side.',
  };
  paragraphs.push(range[rel]);
  if (sun === moon) {
    paragraphs.push('You never have to keep one version of yourself for work and another for home. That saves you the energy other people spend managing two personas, and it is why you recover faster than they expect.');
  }

  return { title: 'Hidden Strengths', icon: '🔮', paragraphs };
}

// Section 5: Growth Edge
function generateGrowthEdge(
  sun: ZodiacSign,
  moon: ZodiacSign,
  sunData: SignData,
  moonData: SignData,
  _sunTheme: SignTheme,
  _moonTheme: SignTheme,
  harmony: ElementHarmony
): PersonalitySection {
  const s = SUN_MOON_VOICE[sun];
  const m = SUN_MOON_VOICE[moon];
  const rel = getRelation(sun, moon, harmony);
  const paragraphs: string[] = [];

  paragraphs.push(s.edge);
  if (sun !== moon) paragraphs.push(privateEdge(m.edge));

  const close: Record<Relation, string> = {
    same: 'Your danger is that nothing in you objects. Ask someone very different from you what they see, and take the answer seriously for a full week before you argue with it.',
    easy: 'Because this combination comes easily, the danger is coasting. Pick one thing a year that is hard on purpose, and do not let comfort choose it for you.',
    tension: `Do not settle the argument between your ${sunData.name} Sun and your ${moonData.name} Moon by always picking the same winner. Alternate on purpose, and tell the people around you which side is driving.`,
    friction: `Stop treating your ${sunData.name} Sun and your ${moonData.name} Moon as enemies. Give each one a real slot in the week: one evening that is entirely for the ${moonData.name} side, one project that is entirely for the ${sunData.name} side, and nobody apologizing for either.`,
  };
  paragraphs.push(close[rel]);
  if (sun === moon) {
    paragraphs.push('Both halves of you share the same blind spot, so it never feels like one. Ask someone who knows you well which of your habits you have stopped noticing, and write the answer down before you explain it away.');
  }

  return { title: 'Growth Edge', icon: '🌱', paragraphs };
}

// ── Main content generator ──────────────────────────────────

export function getSunMoonContent(sun: ZodiacSign, moon: ZodiacSign): SunMoonContent {
  const sunData = SIGNS[sun];
  const moonData = SIGNS[moon];
  const sunTheme = SIGN_THEMES[sun];
  const moonTheme = SIGN_THEMES[moon];
  const harmony = getElementHarmony(sunData.element, moonData.element);

  const slug = `${sun}-sun-${moon}-moon`;

  return {
    sunSign: sunData,
    moonSign: moonData,
    sunKey: sun,
    moonKey: moon,
    slug,
    soulTagline: generateSoulTagline(sun, moon),
    elementHarmony: harmony,
    sections: [
      generateInnerLandscape(sun, moon, sunData, moonData, sunTheme, moonTheme, harmony),
      generateEmotionalWorld(sun, moon, sunData, moonData, sunTheme, moonTheme, harmony),
      generateRelationships(sun, moon, sunData, moonData, sunTheme, moonTheme, harmony),
      generateHiddenStrengths(sun, moon, sunData, moonData, sunTheme, moonTheme, harmony),
      generateGrowthEdge(sun, moon, sunData, moonData, sunTheme, moonTheme, harmony),
    ],
    relatableBullets: generateRelatableBullets(sun, moon),
  };
}

/**
 * Get all 144 Sun-Moon combination slugs for static param generation.
 */
export function getAllSunMoonCombos(): { combo: string; sun: ZodiacSign; moon: ZodiacSign }[] {
  const combos: { combo: string; sun: ZodiacSign; moon: ZodiacSign }[] = [];
  for (const sun of ALL_SIGN_KEYS) {
    for (const moon of ALL_SIGN_KEYS) {
      combos.push({
        combo: `${sun}-sun-${moon}-moon`,
        sun,
        moon,
      });
    }
  }
  return combos;
}

/**
 * Parse a slug like "scorpio-sun-pisces-moon" into its Sun and Moon sign keys.
 * Returns null if the slug is invalid.
 */
export function parseSunMoonSlug(slug: string): { sun: ZodiacSign; moon: ZodiacSign } | null {
  const match = slug.match(/^([a-z]+)-sun-([a-z]+)-moon$/);
  if (!match) return null;

  const [, sunStr, moonStr] = match;
  if (
    !ALL_SIGN_KEYS.includes(sunStr as ZodiacSign) ||
    !ALL_SIGN_KEYS.includes(moonStr as ZodiacSign)
  ) {
    return null;
  }

  return { sun: sunStr as ZodiacSign, moon: moonStr as ZodiacSign };
}

/**
 * Get related Sun-Moon combos for a given Sun or Moon sign.
 * Returns combos that share the same Sun sign.
 */
export function getRelatedCombos(
  currentSun: ZodiacSign,
  currentMoon: ZodiacSign,
  limit = 6
): { combo: string; sun: ZodiacSign; moon: ZodiacSign }[] {
  return getAllSunMoonCombos()
    .filter(
      (c) => c.sun === currentSun && c.moon !== currentMoon
    )
    .slice(0, limit);
}
