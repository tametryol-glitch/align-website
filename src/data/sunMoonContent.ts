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
    stressResponse: 'retreats into comfort — food, sleep, familiar routines',
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
    emotionalNeed: 'to feel useful and that their efforts are noticed',
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
    emotionalNeed: 'to feel respected and that their sacrifices matter',
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
    emotionalNeed: 'to feel accepted for their weirdness without having to conform',
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
    return `${sunTheme.archetype} doubled — everything ${sunData.name} is, amplified to its fullest expression.`;
  }

  if (harmony === 'Mirror Energy') {
    const templates = [
      `${sunData.element.charAt(0).toUpperCase() + sunData.element.slice(1)} on fire: ${sunData.traits[0]} on the outside, ${moonData.traits[0]} at the core.`,
      `Two expressions of ${sunData.element} — ${sunData.name}'s ${sunData.traits[0]} drive powered by ${moonData.name}'s ${moonData.traits[0]} instincts.`,
    ];
    return templates[(sun.length + moon.length) % templates.length];
  }

  if (harmony === 'Harmonious Blend') {
    return `${sunData.name}'s ${sunData.traits[0]} ambition flows naturally into ${moonData.name}'s ${moonData.traits[0]} inner world.`;
  }

  if (harmony === 'Dynamic Tension') {
    return `The tension between ${sunData.name}'s ${sunData.traits[0]} exterior and ${moonData.name}'s ${moonData.traits[0]} depths creates something extraordinary.`;
  }

  // Creative Friction
  return `${sunTheme.archetype} meets ${moonTheme.archetype} — what you show the world and what you feel are beautifully at odds.`;
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
      `People assume they know you because your outside matches your inside — but the ${sunData.name} version and the ${moonData.name} version of ${sunData.element} are not the same thing at all`
    );
  } else if (sun === moon) {
    bullets.push(
      `People either love your intensity or find you overwhelming, and you secretly know exactly which one they are`
    );
  } else {
    bullets.push(
      `Your ${sunData.name} confidence comes naturally in public, but alone you default to ${moonData.name}'s need for ${moonData.traits[0]} spaces`
    );
  }

  // Bullet 2: Emotional processing style
  if (moonData.element === 'water') {
    bullets.push(
      'You absorb emotions from every room you walk into and sometimes can\'t tell which feelings are yours'
    );
  } else if (moonData.element === 'fire') {
    bullets.push(
      'You process emotions by doing something — cleaning, running, starting a project at midnight — because sitting with feelings feels like drowning'
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
    water: 'When you\'re overwhelmed, you don\'t want advice — you want someone to sit in the dark with you and say nothing',
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
      water: 'The bravest thing you do isn\'t charging forward — it\'s letting someone see you cry',
    },
    earth: {
      fire: 'You pretend to be practical but your secret fantasy life would shock everyone who thinks they know you',
      earth: 'Your greatest fear isn\'t failure — it\'s that you\'ll build everything perfectly and still feel empty',
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
      fire: 'You feel everything but you\'ve learned to turn pain into fuel — and you\'re not sure if that\'s strength or self-destruction',
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

// Section 1: The Inner Landscape
function generateInnerLandscape(
  sun: ZodiacSign,
  moon: ZodiacSign,
  sunData: SignData,
  moonData: SignData,
  sunTheme: SignTheme,
  moonTheme: SignTheme,
  harmony: ElementHarmony
): PersonalitySection {
  const paragraphs: string[] = [];

  if (sun === moon) {
    paragraphs.push(
      `With both your Sun and Moon in ${sunData.name}, you are ${sunData.name} through and through — what the world sees and what you feel privately are cut from the same cosmic cloth. Your ${sunData.element} nature is undiluted, your ${sunData.modality} energy doubled. There is a purity to this placement that gives you remarkable internal consistency. You don't wear masks because you don't need to — your inner world and outer expression speak the same language. People always know where they stand with you, because there is no hidden layer contradicting what's on the surface.`
    );
    paragraphs.push(
      `This self-coherence is both your greatest strength and a potential blind spot. You move through life with a singular focus that others find either deeply impressive or slightly intimidating. ${sunTheme.archetype} energy defines every dimension of your experience: how you love, how you work, how you fight, how you rest. The challenge is that without an internal counterpoint, you may struggle to understand perspectives that don't align with your own ${sunData.element} way of processing the world. Growth comes from deliberately seeking out the elements you lack — the ${sunData.element === 'fire' ? 'patience of earth, the depth of water, the perspective of air' : sunData.element === 'earth' ? 'spontaneity of fire, the intuition of water, the flexibility of air' : sunData.element === 'air' ? 'groundedness of earth, the passion of fire, the emotional depth of water' : 'direction of fire, the stability of earth, the detachment of air'}.`
    );
    paragraphs.push(
      `At your best, you embody everything ${sunData.name} is meant to be: ${sunData.traits.join(', ')}. You are the purest expression of ${sunData.ruler}'s influence, and when you're aligned with your purpose, you move through the world with an authenticity that is truly rare. The key is ensuring that your doubled ${sunData.name} energy has enough outlets — without them, even the most beautiful qualities can become their own shadow.`
    );
  } else if (harmony === 'Mirror Energy') {
    paragraphs.push(
      `Your ${sunData.name} Sun and ${moonData.name} Moon share the element of ${sunData.element}, creating an inner landscape where identity and emotion flow in the same current. You are ${sunData.element} through and through, but expressed in two distinct frequencies. Your ${sunData.name} Sun — ${sunData.modality}, ruled by ${sunData.ruler} — ${sunTheme.innerVerb} with ${sunData.traits[0]} conviction. Your ${moonData.name} Moon — ${moonData.modality}, ruled by ${moonData.ruler} — processes feelings through ${moonData.traits[0]} instincts. Same element, different dialects.`
    );
    paragraphs.push(
      `This shared elemental ground gives you a sense of inner coherence that others notice. You don't feel at war with yourself the way some Sun-Moon combinations do. Your public face and private needs align naturally, which creates a grounded confidence. Where ${sunData.name} drives you to ${sunTheme.identityDrive}, your ${moonData.name} Moon ensures your emotional needs — ${moonTheme.emotionalNeed} — are never too far from your conscious awareness.`
    );
    paragraphs.push(
      `The nuance lies in the modality difference. Your ${sunData.modality} Sun and ${moonData.modality} Moon create a rhythm of ${sunData.modality === moonData.modality ? 'doubled intensity — you approach everything with the same energetic style, for better or worse' : `complementary motion — your Sun ${sunData.modality === 'cardinal' ? 'initiates' : sunData.modality === 'fixed' ? 'sustains' : 'adapts'} while your Moon ${moonData.modality === 'cardinal' ? 'initiates' : moonData.modality === 'fixed' ? 'sustains' : 'adapts'}, giving you a broader range than a single modality alone`}.`
    );
  } else if (harmony === 'Harmonious Blend') {
    paragraphs.push(
      `Your ${sunData.name} Sun and ${moonData.name} Moon form one of astrology's naturally compatible combinations. ${sunData.element.charAt(0).toUpperCase() + sunData.element.slice(1)} and ${moonData.element} ${sunData.element === 'fire' ? 'feed each other — air fans the flame, making your fire burn brighter and reach further' : 'nourish each other — water feeds the earth, creating fertile ground where both your identity and emotions can flourish'}. What you project to the world (${sunData.traits[0]}, ${sunData.traits[1]}) and what you need privately (${moonTheme.emotionalNeed}) exist in natural dialogue rather than conflict.`
    );
    paragraphs.push(
      `This doesn't mean your inner life is simple. Your ${sunData.name} Sun pursues ${sunTheme.identityDrive}, while your ${moonData.name} Moon requires ${moonTheme.emotionalNeed}. These drives are compatible but not identical. Think of it as two instruments in the same key — they harmonize naturally, but each plays its own melody. Your Sun's ruler ${sunData.ruler} and your Moon's ruler ${moonData.ruler} work in concert, giving you an internal support system that many people spend a lifetime trying to build.`
    );
    paragraphs.push(
      `The gift of this blend is emotional fluidity. You can move between your public self and your private self without feeling like you're shapeshifting. The risk is complacency — because things come relatively easily to you internally, you may not develop the resilience that comes from navigating true inner tension. Your growth edge is pushing beyond comfort into the elements you don't carry: ${sunData.element === 'fire' ? 'earth and water' : 'fire and air'}.`
    );
  } else if (harmony === 'Dynamic Tension') {
    paragraphs.push(
      `Your ${sunData.name} Sun and ${moonData.name} Moon create a dynamic tension between ${sunData.element} and ${moonData.element} that shapes everything about how you move through the world. On the surface, you project ${sunData.name}'s ${sunData.traits.slice(0, 3).join(', ')} energy. But beneath that exterior, your ${moonData.name} Moon craves something fundamentally different: ${moonTheme.emotionalNeed}. This gap between who you appear to be and what you actually need is the central drama of your inner life.`
    );
    paragraphs.push(
      `${sunData.element === 'air' ? `Your ${sunData.name} Sun lives in the realm of ideas, concepts, and social connection. Your ${moonData.name} Moon lives in the realm of tangible reality, material security, and physical sensation.` : `Your ${sunData.name} Sun is grounded in the practical, material world. Your ${moonData.name} Moon floats in the realm of ideas, connection, and abstract possibility.`} You are always negotiating between these two modes of being, and people who only see one side of you are seeing half the picture. The ones who love you best are the ones who understand that your ${sunData.traits[0]} exterior and your ${moonData.traits[0]} interior are not contradictions — they are complements.`
    );
    paragraphs.push(
      `The creative potential in this tension is enormous. ${sunData.element === 'air' ? 'Air conceptualizes, earth materializes' : 'Earth stabilizes, air innovates'} — together, they build things that are both visionary and real. When you learn to honor both sides instead of favoring one, you become someone who can dream practically and execute creatively. This is your superpower, and it comes directly from the productive friction between your Sun and Moon.`
    );
  } else {
    // Creative Friction
    paragraphs.push(
      `Your ${sunData.name} Sun and ${moonData.name} Moon are locked in one of astrology's most creatively charged tensions. ${sunData.element.charAt(0).toUpperCase() + sunData.element.slice(1)} and ${moonData.element} don't naturally understand each other — ${sunData.element === 'fire' && moonData.element === 'water' ? 'fire evaporates water, water extinguishes fire' : sunData.element === 'water' && moonData.element === 'fire' ? 'water and fire create steam — powerful but volatile' : sunData.element === 'fire' && moonData.element === 'earth' ? 'fire scorches earth, earth smothers fire' : sunData.element === 'earth' && moonData.element === 'fire' ? 'earth and fire exist at fundamentally different speeds' : `${sunData.element} and ${moonData.element} operate on different wavelengths entirely`}. What you show the world as a ${sunData.name} (${sunData.traits.slice(0, 2).join(', ')}) often feels at odds with what your ${moonData.name} Moon actually needs (${moonTheme.emotionalNeed}).`
    );
    paragraphs.push(
      `This internal friction means you are rarely boring — to yourself or to others. There is a complexity to your personality that people find magnetic precisely because it doesn't resolve into a simple story. Your ${sunData.name} Sun, ruled by ${sunData.ruler}, drives you toward ${sunTheme.identityDrive}. Your ${moonData.name} Moon, ruled by ${moonData.ruler}, pulls you toward ${moonTheme.emotionalNeed}. These are not the same destination, and the journey between them is where your most profound growth happens.`
    );
    paragraphs.push(
      `People who grow up with this Sun-Moon combination often feel like they contain multitudes — because they do. You've spent your life learning to integrate parts of yourself that don't come with an instruction manual. The result, when you do the inner work, is a person of extraordinary depth, range, and empathy. You understand contradiction because you live it. You forgive complexity in others because you know it intimately in yourself.`
    );
  }

  return { title: 'The Inner Landscape', icon: '🌌', paragraphs };
}

// Section 2: Emotional World
function generateEmotionalWorld(
  sun: ZodiacSign,
  moon: ZodiacSign,
  sunData: SignData,
  moonData: SignData,
  sunTheme: SignTheme,
  moonTheme: SignTheme,
  harmony: ElementHarmony
): PersonalitySection {
  const paragraphs: string[] = [];

  // Moon sign is the primary driver here
  paragraphs.push(
    `Your emotional world is fundamentally shaped by your ${moonData.name} Moon. Regardless of how your ${sunData.name} Sun presents to the world, the Moon is where you retreat when life gets real. ${moonData.name} Moon people need ${moonTheme.emotionalNeed}. This isn't a preference — it's a requirement for your psychological well-being. When this need goes unmet, ${moonTheme.stressResponse.charAt(0).toLowerCase()}${moonTheme.stressResponse.slice(1)}.`
  );

  // How the Sun sign modifies emotional expression
  if (harmony === 'Creative Friction' || harmony === 'Dynamic Tension') {
    paragraphs.push(
      `Here's where it gets complicated: your ${sunData.name} Sun doesn't always let your Moon's needs be visible. ${sunData.name} projects ${sunData.traits[0]} energy, which can mask the ${moonData.traits[0]} emotional undercurrent running beneath. You might tell people you're fine when your Moon is screaming for ${moonData.element === 'water' ? 'emotional connection' : moonData.element === 'fire' ? 'action and release' : moonData.element === 'earth' ? 'stability and reassurance' : 'space to process'}. Over time, this disconnect between your presented self and your emotional reality can create a low-grade exhaustion that is hard to name but impossible to ignore.`
    );
    paragraphs.push(
      `The healing path for this combination is learning to let your Moon's needs be seen — even when they don't match your Sun's brand. Your ${sunData.name} identity doesn't have to perform 24/7. In safe relationships, with trusted people, practice leading with your ${moonData.name} Moon. Say what you actually need instead of what ${sunData.name} thinks you should need. The relief will be immediate and profound.`
    );
  } else if (harmony === 'Mirror Energy' && sun !== moon) {
    paragraphs.push(
      `Because both your Sun and Moon live in ${sunData.element}, your emotional processing and your identity expression share the same elemental language. This makes you emotionally consistent — what you feel and what you show are usually in the same register. ${sunData.element === 'fire' ? 'Your emotions burn hot, express fast, and move through you like weather. You don\'t hold grudges because you don\'t hold anything — it combusts and clears.' : sunData.element === 'earth' ? 'Your emotions are steady, deep, and slow-moving. You don\'t react to every stimulus because you know that most things resolve themselves if you wait.' : sunData.element === 'air' ? 'You process emotions intellectually first and physically second. You need to understand what you\'re feeling before you can feel it fully, which sometimes means there\'s a delay between the event and the emotional response.' : 'Your emotions are oceanic — vast, shifting, and deeply responsive to everything around you. You feel the world so intensely that you need regular time alone to decompress and separate your feelings from everyone else\'s.'}`
    );
    paragraphs.push(
      `The risk of this same-element emotional style is that you may not develop the emotional muscles that come from having to translate between different elements. You process ${sunData.element} emotions beautifully, but ${sunData.element === 'fire' ? 'the slow, deep feelings of water or the patient processing of earth' : sunData.element === 'earth' ? 'the quick intensity of fire or the abstract processing of air' : sunData.element === 'air' ? 'the raw intensity of fire or the wordless depth of water' : 'the directness of fire or the practical grounding of earth'} may feel foreign. Relationships with people who process differently will be your greatest emotional teachers.`
    );
  } else if (sun === moon) {
    paragraphs.push(
      `With your Moon also in ${sunData.name}, your emotional life is an intensified version of everything this sign represents. ${moonTheme.emotionalNeed} — this isn't just important to you, it is the baseline requirement for your entire sense of self. When you're in an environment that supports this need, you are ${sunData.traits.slice(0, 3).join(', ')} in their purest form. When this need is denied, every shadow quality of ${sunData.name} emerges: ${sunData.shadow}.`
    );
    paragraphs.push(
      `Your emotional body language tells the truth even when your words don't: ${moonTheme.bodyLanguage}. People who pay attention to your physical presence can read you like a book, even when you think you're hiding. Your emotional inner child wants ${moonTheme.innerChild}. Understanding this primal need — and learning to give it to yourself before asking others to provide it — is the deepest emotional work this placement offers.`
    );
  } else {
    paragraphs.push(
      `Your ${sunData.name} Sun gives you a public emotional style: you appear ${sunData.traits[0]} and ${sunData.traits[1]} in how you handle things. But your ${moonData.name} Moon tells a different story in private. When the door closes and the performance ends, you need ${moonTheme.emotionalNeed}. Your closest people know this, even if the rest of the world doesn't. The partners and friends who last in your life are the ones who see past the ${sunData.name} exterior to the ${moonData.name} heart underneath.`
    );
    paragraphs.push(
      `Emotionally, your ${moonData.name} Moon processes feelings through ${moonData.element}. ${moonData.element === 'water' ? 'You feel everything deeply, absorb the emotions of those around you, and need time to process before you can articulate what you\'re experiencing.' : moonData.element === 'fire' ? 'Your emotions arrive fast and hot. You need to move, act, or express them immediately — holding feelings in makes you feel like you\'re going to explode.' : moonData.element === 'earth' ? 'You process feelings slowly and practically. An emotion isn\'t real to you until you can name it and figure out what to do about it.' : 'You process feelings intellectually, sometimes at the expense of actually feeling them. You can describe your emotions with perfect clarity while remaining strangely disconnected from their intensity.'} This emotional processing style shapes everything — how you fight, how you love, and how you heal.`
    );
  }

  return { title: 'Emotional World', icon: '💫', paragraphs };
}

// Section 3: In Relationships
function generateRelationships(
  sun: ZodiacSign,
  moon: ZodiacSign,
  sunData: SignData,
  moonData: SignData,
  sunTheme: SignTheme,
  moonTheme: SignTheme,
  harmony: ElementHarmony
): PersonalitySection {
  const paragraphs: string[] = [];

  paragraphs.push(
    `In love, your ${sunData.name} Sun is what attracts people to you. They fall for your ${sunData.traits[0]}, ${sunData.traits[1]} energy — the way you ${sunTheme.innerVerb} and move through the world with ${sunData.name}'s signature style. ${sunData.loveStyle} But what keeps a relationship alive long-term is your ${moonData.name} Moon, and that's where things get interesting.`
  );

  if (harmony === 'Creative Friction') {
    paragraphs.push(
      `Your Sun and Moon want different things from love, and your partner has to navigate both. Your ${sunData.name} Sun needs a relationship that ${sunData.element === 'fire' ? 'keeps the excitement alive, with passion, adventure, and a partner who can match your energy' : sunData.element === 'earth' ? 'builds toward something tangible — a home, a future, a life you can point to and say "we built this"' : sunData.element === 'air' ? 'stays intellectually stimulating, with conversation that never grows stale and freedom to grow as individuals' : 'goes deep — surface-level connections bore you and eventually drive you away'}. But your ${moonData.name} Moon privately craves ${moonTheme.emotionalNeed}. The partner who figures out how to feed both your Sun and Moon is the one you'll never let go of.`
    );
    paragraphs.push(
      `You struggle in relationships when a partner only sees one half. If they love your ${sunData.name} fire but can't hold space for your ${moonData.name} needs, you'll eventually feel unseen. If they nurture your Moon but don't engage your Sun, you'll grow restless. The relationship that works is the one flexible enough to dance between both — to adventure with you and also hold you still, to give you freedom and also give you roots.`
    );
  } else if (harmony === 'Harmonious Blend') {
    paragraphs.push(
      `The good news is that your Sun and Moon want compatible things from love. Your ${sunData.name} Sun's desire for ${sunTheme.identityDrive} and your ${moonData.name} Moon's need for ${moonTheme.emotionalNeed} don't conflict — they support each other. This makes you relatively straightforward in relationships, which your partners appreciate. You know what you want, you communicate it naturally, and you don't send mixed signals (at least not as many as some Sun-Moon combos).`
    );
    paragraphs.push(
      `Where you might struggle is recognizing when a relationship has become too comfortable. Because your inner needs are easily met, you may stay in relationships past their expiration date simply because nothing feels dramatically wrong. Your growth edge in love is learning to want more than just compatibility — to seek the kind of partnership that challenges you to become who you haven't been yet, not just validates who you already are.`
    );
  } else if (sun === moon) {
    paragraphs.push(
      `As a double ${sunData.name}, what you want in love is clear and unambiguous. You need ${moonTheme.emotionalNeed}, and you need a partner who can handle ${sunData.name}'s full intensity without flinching. Half-measures don't work for you. You'd rather be alone than in a relationship that only engages part of who you are. This all-or-nothing quality can scare off casual partners, but it magnetizes the ones who are ready for something real.`
    );
    paragraphs.push(
      `The challenge in your relationships is that you may unconsciously seek a partner who provides the balance you don't carry internally. You're attracted to people who embody the elements and qualities you lack, which creates intense chemistry but also intense friction. Learning to provide your own balance — rather than outsourcing it to a partner — makes you healthier in love and stops you from overwhelming the people who get close to you.`
    );
  } else {
    paragraphs.push(
      `Your ${moonData.name} Moon shapes what you actually need from a partner, even when your ${sunData.name} Sun is busy projecting something different. Privately, you need someone who understands that ${moonTheme.emotionalNeed}. Your Moon's body language in intimacy — ${moonTheme.bodyLanguage} — tells your partner more about your real needs than anything you say out loud. The partners who read you best are the ones who watch what you do, not just what you say.`
    );
    paragraphs.push(
      `In conflict, your ${sunData.name} Sun and ${moonData.name} Moon can pull in different directions. Your Sun wants to ${sunData.modality === 'cardinal' ? 'take charge and resolve things immediately' : sunData.modality === 'fixed' ? 'hold your ground until the other person sees your point' : 'adapt and find a compromise'}. Your Moon wants to ${moonData.modality === 'cardinal' ? 'initiate the conversation and set the terms' : moonData.modality === 'fixed' ? 'wait it out because changing your feelings is not an option' : 'go with the flow and avoid confrontation'}. The tension between these approaches is what makes your conflict style unique — and what makes a patient, perceptive partner essential for your long-term happiness.`
    );
  }

  paragraphs.push(
    `The relationship pattern to watch for: ${sunData.name} Sun with ${moonData.name} Moon tends to ${harmony === 'Creative Friction' ? 'attract partners who represent one half of their nature but not the other, leading to a pattern of intense connections that feel incomplete' : harmony === 'Dynamic Tension' ? 'test partners early on, sometimes unconsciously, to see if they can handle the complexity before fully opening up' : harmony === 'Mirror Energy' ? 'choose partners who feel immediately familiar, which can mean repeating the same relationship dynamics — for better or worse' : 'attract stable relationships but may need to actively inject excitement and growth to prevent the comfort from becoming stagnation'}.`
  );

  return { title: 'In Relationships', icon: '💞', paragraphs };
}

// Section 4: Hidden Strengths
function generateHiddenStrengths(
  sun: ZodiacSign,
  moon: ZodiacSign,
  sunData: SignData,
  moonData: SignData,
  sunTheme: SignTheme,
  moonTheme: SignTheme,
  harmony: ElementHarmony
): PersonalitySection {
  const paragraphs: string[] = [];

  paragraphs.push(
    `The hidden superpower of ${sunData.name} Sun with ${moonData.name} Moon is ${sun === moon ? sunTheme.superpower : `the alchemy that happens when ${sunTheme.superpower} meets ${moonTheme.superpower}`}. This isn't something you put on a resume or brag about at parties — it's the quiet capability that emerges when life demands everything you have and you discover you have more than you thought.`
  );

  if (harmony === 'Creative Friction') {
    paragraphs.push(
      `Because your Sun and Moon don't naturally agree, you've developed an extraordinary ability to hold paradox. While other people see the world in binaries — strong or sensitive, practical or creative, independent or devoted — you've learned to be both simultaneously. This capacity for contradiction makes you uniquely suited for roles that require ${sunData.element === 'fire' || sunData.element === 'air' ? 'both vision and emotional intelligence' : 'both groundedness and creative intuition'}. You can translate between worlds that don't usually speak to each other.`
    );
    paragraphs.push(
      `Another hidden strength: resilience. You've spent your life navigating the tension between ${sunData.element} and ${moonData.element}, which means you're practiced at sitting with discomfort. Where other people might crumble under internal conflict, you've developed shock absorbers. This makes you extraordinarily steady in crises — not because you don't feel the chaos, but because you've been managing internal chaos since birth and you've gotten remarkably good at it.`
    );
  } else if (harmony === 'Harmonious Blend' || harmony === 'Mirror Energy') {
    paragraphs.push(
      `Your inner coherence gives you a strength that is easy to underestimate: consistency. People can count on you to be the same person in public and in private, in crisis and in calm. This reliability is rarer than you think, and it builds the kind of deep trust that others spend years trying to earn. You are who you appear to be, and in a world full of performance, that authenticity is magnetic.`
    );
    paragraphs.push(
      `Your ${sunData.element}${sun !== moon && sunData.element === moonData.element ? '' : `-${moonData.element}`} nature, undiluted, gives you depth in your element that mixed-element people simply cannot match. ${sunData.element === 'fire' || moonData.element === 'fire' ? 'Your courage, passion, and ability to inspire others is amplified to a rare degree.' : sunData.element === 'earth' || moonData.element === 'earth' ? 'Your capacity to build, sustain, and see things through is extraordinary.' : sunData.element === 'air' || moonData.element === 'air' ? 'Your intellectual range, communication skills, and ability to connect people is exceptional.' : 'Your emotional intelligence, intuition, and ability to read situations is almost supernatural.'} You have mastered the domain of your element in a way that makes you a natural authority in everything it governs.`
    );
  } else {
    paragraphs.push(
      `The tension between your ${sunData.element} Sun and ${moonData.element} Moon gives you range. You can operate in the ${sunData.element} world — ${sunData.element === 'fire' ? 'action, leadership, boldness' : sunData.element === 'earth' ? 'structure, planning, execution' : sunData.element === 'air' ? 'ideas, connection, communication' : 'intuition, empathy, emotional depth'} — and then switch to the ${moonData.element} register when the situation demands it. Most people only have one gear; you have two, and the ability to shift between them gives you a strategic advantage in virtually every area of life.`
    );
    paragraphs.push(
      `Your hidden empathy is another gift. Because you've navigated the distance between your Sun and Moon your whole life, you instinctively understand what it means to contain contradictions. This makes you a natural counselor, mediator, or confidant. People open up to you because they sense — correctly — that you won't judge them for being complicated. You know what it's like to be more than one thing, and that knowledge makes you a safe harbor for everyone who feels too complex for the world to understand.`
    );
  }

  paragraphs.push(
    `Don't overlook the strength that comes from your ${moonData.name} Moon's decision-making style: ${moonTheme.decisionStyle}. While your ${sunData.name} Sun gets the public credit, your Moon's instincts have quietly saved you from bad choices and guided you toward good ones more often than you realize. Learn to trust this inner compass — it's been calibrated by every experience you've ever had, and it rarely leads you wrong when you listen to it.`
  );

  return { title: 'Hidden Strengths', icon: '🔮', paragraphs };
}

// Section 5: Growth Edge
function generateGrowthEdge(
  sun: ZodiacSign,
  moon: ZodiacSign,
  sunData: SignData,
  moonData: SignData,
  sunTheme: SignTheme,
  moonTheme: SignTheme,
  harmony: ElementHarmony
): PersonalitySection {
  const paragraphs: string[] = [];

  if (sun === moon) {
    paragraphs.push(
      `Your primary growth edge as a double ${sunData.name} is developing the qualities you don't naturally carry. You are a masterclass in ${sunData.element}, but the other three elements hold lessons you need. ${sunData.element === 'fire' ? 'You need earth\'s patience, water\'s emotional depth, and air\'s ability to see things from a distance.' : sunData.element === 'earth' ? 'You need fire\'s willingness to take risks, water\'s emotional vulnerability, and air\'s openness to change.' : sunData.element === 'air' ? 'You need earth\'s follow-through, fire\'s passion and conviction, and water\'s capacity for raw emotional presence.' : 'You need fire\'s courage to act, earth\'s ability to set boundaries, and air\'s objectivity when emotions threaten to overwhelm.'} This isn't about becoming less ${sunData.name} — it's about becoming more complete.`
    );
    paragraphs.push(
      `Watch for the tendency to mistake intensity for depth. Because you experience ${sunData.name} energy at double strength, you may assume that more of the same equals growth. It doesn't. Real growth for you looks like going against your grain — doing the thing that feels uncomfortable, not the thing that comes naturally. If ${sunData.name}'s reflex is to ${sunTheme.stressResponse}, your growth edge is learning to do the opposite: ${sunData.element === 'fire' ? 'sit still, be patient, and let things unfold without forcing them' : sunData.element === 'earth' ? 'take a leap without having every detail figured out' : sunData.element === 'air' ? 'stop analyzing and let yourself feel without understanding why' : 'set a boundary, hold your ground, and resist the urge to merge with everyone else\'s reality'}.`
    );
  } else if (harmony === 'Creative Friction') {
    paragraphs.push(
      `Your growth edge lives in the space between your ${sunData.name} Sun and ${moonData.name} Moon — in learning to stop treating them as opposing forces and start treating them as collaborative ones. For most of your life, you may have unconsciously favored one over the other: leading with your Sun in public and suppressing your Moon, or privately resenting your Sun for not letting you be who your Moon needs to be. The integration of these two energies is the central developmental task of your life.`
    );
    paragraphs.push(
      `Practically, this means creating space for both. Your ${sunData.name} Sun needs ${sunTheme.identityDrive} — don't deny it. Your ${moonData.name} Moon needs ${moonTheme.emotionalNeed} — don't ignore it. Build a life that has room for both the ${sunData.traits[0]} ambition and the ${moonData.traits[0]} inner world. Schedule time for your Sun's agenda and equally sacred time for your Moon's needs. The people who love you best will learn to do the same.`
    );
    paragraphs.push(
      `The shadow to watch: ${sunTheme.shadowTrigger}. When your ${sunData.name} Sun is triggered, it will try to override your ${moonData.name} Moon, and vice versa when ${moonTheme.shadowTrigger}. Notice these moments. They are not failures — they are invitations to integrate more deeply. Every time you catch yourself suppressing one half to appease the other, you have an opportunity to choose wholeness instead.`
    );
  } else {
    paragraphs.push(
      `Your growth edge is learning to leverage the ${harmony === 'Harmonious Blend' ? 'ease' : harmony === 'Mirror Energy' ? 'consistency' : 'tension'} of your Sun-Moon combination without becoming complacent. Because your ${sunData.name} Sun and ${moonData.name} Moon ${harmony === 'Harmonious Blend' || harmony === 'Mirror Energy' ? 'work together naturally, the temptation is to stay in your comfort zone' : 'create productive friction, the temptation is to let the tension paralyze you instead of using it as fuel'}. Growth looks like deliberately choosing challenges that stretch the parts of you that don't get exercised daily.`
    );
    paragraphs.push(
      `Your ${sunData.name} Sun's shadow — ${sunData.shadow} — is the pattern to watch in your public life. Your ${moonData.name} Moon's shadow trigger — ${moonTheme.shadowTrigger} — is the vulnerability to protect in your private life. When both shadows activate simultaneously, you may find yourself ${sunData.element === moonData.element ? 'doubling down on your default coping mechanisms instead of trying something new' : 'pulled between your Sun\'s instinct and your Moon\'s need, unsure which voice to trust'}. The answer is almost always to slow down and ask: "What would I do if I weren't afraid?"`
    );
    paragraphs.push(
      `The deepest growth for ${sunData.name} Sun, ${moonData.name} Moon comes from relationship. Not just romantic relationship, but every relationship that mirrors back the parts of yourself you can't see alone. Seek out people whose elements complement yours — ${sunData.element === 'fire' ? 'water and earth' : sunData.element === 'earth' ? 'fire and air' : sunData.element === 'air' ? 'water and earth' : 'fire and air'} people in particular will challenge you in exactly the ways you need. The friction is the lesson. The discomfort is the invitation.`
    );
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
