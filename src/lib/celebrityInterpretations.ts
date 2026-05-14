/**
 * Celebrity Interpretations Engine (Web)
 *
 * Ported from mobile celebrityInterpretations.ts.
 * Rich, vivid, psychologically revealing interpretations for celebrity profiles.
 */

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════

interface PlanetData {
  name: string;
  longitude: number;
  house?: number;
  retrograde?: boolean;
}

interface AspectData {
  planet1: string;
  planet2: string;
  type: string;
  orb?: number;
}

interface ChartSignature {
  dominant_element?: string;
  dominant_modality?: string;
  dominant_planet?: string;
  stellium_sign?: string;
  stellium_house?: number;
  sun_sign: string;
  moon_sign?: string;
  rising_sign?: string;
  key_aspects: string[];
}

export interface InterpretationInput {
  name: string;
  planets: PlanetData[];
  aspects: AspectData[];
  signature?: ChartSignature;
  ascendant?: number;
  midheaven?: number;
}

function lonToSign(lon: number): string {
  const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  return signs[Math.floor(((lon % 360) + 360) % 360 / 30)];
}

function getSign(planets: PlanetData[], name: string): string | null {
  const p = planets.find(pl => pl.name === name);
  return p ? lonToSign(p.longitude) : null;
}

function hasAspect(aspects: AspectData[], p1: string, p2: string, type?: string): AspectData | undefined {
  return aspects.find(a =>
    ((a.planet1 === p1 && a.planet2 === p2) || (a.planet1 === p2 && a.planet2 === p1))
    && (!type || a.type === type)
  );
}

function hasAnyAspect(aspects: AspectData[], planet: string, targets: string[]): AspectData | undefined {
  return aspects.find(a =>
    (a.planet1 === planet && targets.includes(a.planet2)) ||
    (a.planet2 === planet && targets.includes(a.planet1))
  );
}

function getElement(sign: string): string {
  const fire = ['Aries', 'Leo', 'Sagittarius'];
  const earth = ['Taurus', 'Virgo', 'Capricorn'];
  const air = ['Gemini', 'Libra', 'Aquarius'];
  if (fire.includes(sign)) return 'fire';
  if (earth.includes(sign)) return 'earth';
  if (air.includes(sign)) return 'air';
  return 'water';
}

// ═══════════════════════════════════════════════════════════════════
// MAGNETIC PRESENCE
// ═══════════════════════════════════════════════════════════════════

const MAGNETIC_SUN: Record<string, string[]> = {
  Aries: [
    'Their presence hits you like a pulse of electricity — instant, undeniable, alive.',
    'People notice them before they speak. There\'s a raw boldness that dares you to look away.',
    'Their magnetism is confrontational in the best way — they walk into a room and the energy rearranges around them.',
  ],
  Taurus: [
    'Their magnetism is slow, heavy, and intoxicating — the kind that makes people lean in without knowing why.',
    'There\'s a gravitational stillness about them. They don\'t chase attention; it settles on them like light.',
    'People feel grounded just being near them. It\'s the calm of someone who knows exactly who they are.',
  ],
  Gemini: [
    'They sparkle. There\'s no other word for it — a quicksilver charm that keeps you guessing.',
    'Their magnetism comes from their mind. One conversation and you realize they see angles nobody else does.',
    'They shapeshift between moods and ideas so fluidly that you never quite feel you\'ve caught all of them.',
  ],
  Cancer: [
    'Their magnetism is emotional gravity — you feel pulled into their world before you realize it.',
    'There\'s something about them that makes people want to confess, to open up, to be seen.',
    'They draw you in with warmth that feels ancient and familiar, like you\'ve known them in another life.',
  ],
  Leo: [
    'When they enter, the room tilts. Not because they demand it — because their light is simply that bright.',
    'Their magnetism is solar. People orbit them instinctively, drawn to their warmth, their confidence, their glow.',
    'They make you feel like the main character just by paying attention to you — and that generosity is addictive.',
  ],
  Virgo: [
    'Their magnetism is subtle and devastating — a quiet precision that reveals itself slowly, then all at once.',
    'They don\'t dazzle. They disarm. One perceptive comment and you realize they\'ve already read the room.',
    'There\'s an understated brilliance that pulls you in — the less they try, the more impossible they are to ignore.',
  ],
  Libra: [
    'Their magnetism is aesthetic — a curated elegance that makes everything around them feel more beautiful.',
    'People are drawn to their ease. They move through social spaces like water, never forcing, always flowing.',
    'There\'s a seductive harmony about them. They make you feel balanced just by being in their presence.',
  ],
  Scorpio: [
    'Their magnetism is a locked room you\'d give anything to enter. Intensity this controlled is impossible to ignore.',
    'They don\'t charm — they penetrate. One look and you feel like they\'ve read your entire history.',
    'Their presence is a dare. Something in them says "I know things you\'re not ready to hear" — and that\'s exactly why people can\'t look away.',
  ],
  Sagittarius: [
    'Their magnetism is freedom itself — wild, expansive, and impossible to contain.',
    'People are drawn to their fire because it feels like permission. Permission to dream bigger, laugh louder, want more.',
    'They make the world feel wider just by existing. There\'s an untamed joy in them that\'s genuinely contagious.',
  ],
  Capricorn: [
    'Their magnetism is authority distilled — the quiet power of someone who has already mapped their own rise.',
    'People are drawn to their composure. In a world of chaos, they feel like a mountain: solid, unmoved, eternal.',
    'Their allure isn\'t loud. It\'s the gravity of competence — watching someone who knows exactly what they\'re doing.',
  ],
  Aquarius: [
    'Their magnetism comes from being genuinely, unapologetically different — and completely at peace with it.',
    'People are drawn to them because they don\'t follow the script. They\'re writing a new one.',
    'There\'s an electric detachment about them that makes people lean in harder, trying to crack the code.',
  ],
  Pisces: [
    'Their magnetism is otherworldly — a dream you can almost touch but never fully hold.',
    'People are drawn to the softness in them, the depth, the sense that they\'re tuned into frequencies no one else can hear.',
    'They blur the line between real and imagined so beautifully that being near them feels like entering another dimension.',
  ],
};

const MAGNETIC_VENUS_FLAIR: Record<string, string> = {
  Aries: 'Their charm runs hot — impulsive, direct, and completely unfiltered.',
  Taurus: 'Sensuality radiates from them like heat from skin. Everything they touch feels elevated.',
  Gemini: 'They flirt with words, ideas, and timing. Their charm is intellectual and dangerously witty.',
  Cancer: 'Their warmth wraps around people like a blanket — protective, tender, impossibly comforting.',
  Leo: 'Generosity is their love language. They make people feel chosen, celebrated, adored.',
  Virgo: 'Their charm hides in the details — the perfect gesture, the thing nobody else would notice.',
  Libra: 'Grace personified. They make everyone feel like the most interesting person in the room.',
  Scorpio: 'Their allure is magnetic and consuming. One look can feel more intimate than a conversation.',
  Sagittarius: 'Their charm is wild, open, and infectiously optimistic. Being near them feels like an adventure.',
  Capricorn: 'Their appeal is earned, not performed. There\'s something deeply attractive about their self-control.',
  Aquarius: 'They charm through difference. Their coolness, their edge, their refusal to blend in — it fascinates.',
  Pisces: 'They cast a spell without trying. Soft-spoken, enchanting, and deeply emotionally attuned.',
};

const MAGNETIC_PLUTO_BOOST = 'There\'s a Plutonian undercurrent running beneath the surface — an intensity that people feel before they understand it. It gives them a transformative quality. Meeting them can change you.';
const MAGNETIC_NEPTUNE_BOOST = 'Neptune weaves a dreamlike quality into their presence. They shimmer. People project fantasies onto them because they seem to exist half in this world and half somewhere more beautiful.';

export function generateMagneticPresence(input: InterpretationInput): string {
  const { name, planets, aspects, signature } = input;
  const sunSign = getSign(planets, 'Sun') || signature?.sun_sign || 'Leo';
  const venusSign = getSign(planets, 'Venus');

  const sunLines = MAGNETIC_SUN[sunSign] || MAGNETIC_SUN['Leo'];
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const mainLine = sunLines[hash % sunLines.length];
  const secondLine = sunLines[(hash + 1) % sunLines.length];

  const parts: string[] = [mainLine, secondLine];

  if (venusSign && MAGNETIC_VENUS_FLAIR[venusSign]) {
    parts.push(MAGNETIC_VENUS_FLAIR[venusSign]);
  }

  const plutoAspect = hasAnyAspect(aspects, 'Pluto', ['Sun', 'Moon', 'Venus', 'Mars']);
  if (plutoAspect) {
    parts.push(MAGNETIC_PLUTO_BOOST);
  }

  const neptuneAspect = hasAnyAspect(aspects, 'Neptune', ['Sun', 'Moon', 'Venus']);
  if (neptuneAspect && !plutoAspect) {
    parts.push(MAGNETIC_NEPTUNE_BOOST);
  }

  if (signature?.stellium_sign) {
    parts.push(`A stellium in ${signature.stellium_sign} concentrates their energy into one powerful frequency — making them feel almost larger than life in that domain.`);
  }

  return parts.join('\n\n');
}

// ═══════════════════════════════════════════════════════════════════
// PUBLIC IMAGE & STYLE
// ═══════════════════════════════════════════════════════════════════

const PUBLIC_IMAGE_SUN: Record<string, string[]> = {
  Aries: [
    'The world sees a leader who doesn\'t wait for permission. Bold, unapologetic, and always first through the door.',
    'Their public persona is built on action. They\'re the one who moves while everyone else is still deciding.',
    'They project a warrior energy — scrappy, fearless, and thrillingly direct. People either follow or get out of the way.',
  ],
  Taurus: [
    'Their public image radiates luxury and substance. Nothing about them feels rushed or cheap.',
    'They project an earthy, grounded glamour — the kind of elegance that comes from truly knowing their own worth.',
    'The world reads them as unshakeable. They\'ve built a brand that feels like old money even when it\'s entirely self-made.',
  ],
  Gemini: [
    'Their public persona is kaleidoscopic — just when you think you have them figured out, they reveal another face.',
    'The world sees a brilliant communicator who makes complexity feel effortless and ideas feel electric.',
    'They project versatility as power. Their brand is never being boxed in — and somehow making that consistency.',
  ],
  Cancer: [
    'Their public image carries emotional weight. People see them and feel something — that\'s the strategy, even when it\'s not intentional.',
    'The world reads them as nurturing and powerful in equal measure. They protect their people fiercely and the public senses it.',
    'There\'s a nostalgic quality to how they present — they make people miss things they haven\'t even lost yet.',
  ],
  Leo: [
    'Their public image IS the performance — and the performance is flawless. Drama, warmth, and undeniable star quality.',
    'The world sees royalty. Not the inherited kind — the kind you earn by refusing to be anything less.',
    'They project an almost mythic confidence. Every red carpet, every interview, every appearance feels like a coronation.',
  ],
  Virgo: [
    'Their public image is precision crafted — nothing wasted, nothing accidental, every detail considered.',
    'The world sees someone who makes excellence look easy, but make no mistake: nothing about their image is left to chance.',
    'They project intelligence and quiet mastery. Their brand is competence elevated to an art form.',
  ],
  Libra: [
    'Their public image is a masterclass in beauty and balance. They make the world look better just by showing up.',
    'The world sees harmony personified — someone who can walk the line between accessible and aspirational without breaking a sweat.',
    'They project effortless style, social intelligence, and a diplomatic grace that makes even their critics pause.',
  ],
  Scorpio: [
    'Their public image is a carefully controlled revelation — they show you exactly what they want you to see, never more.',
    'The world sees mystery and depth. Every appearance feels like a chapter in a story they\'ll never fully tell.',
    'They project power through restraint. In a world of oversharing, their silence is their loudest statement.',
  ],
  Sagittarius: [
    'Their public image is expansion itself — global, uncontainable, and refreshingly honest.',
    'The world sees an adventurer who makes big moves look spontaneous. Their brand is freedom on fire.',
    'They project a philosophical confidence that makes people trust them instinctively — the vibe of someone who\'s seen the world and still believes in it.',
  ],
  Capricorn: [
    'Their public image is a monument. Structured, commanding, and built to last centuries.',
    'The world sees an empire builder — someone whose ambition is so disciplined it reads as destiny.',
    'They project the rare combination of authority and patience. Their brand says: I\'m playing a longer game than you.',
  ],
  Aquarius: [
    'Their public image is disruption wrapped in cool. They make rebellion feel intellectual and inevitable.',
    'The world sees a visionary who doesn\'t just break rules — they make old rules feel embarrassing.',
    'They project detached brilliance. Their brand lives in the future, and they dare the world to catch up.',
  ],
  Pisces: [
    'Their public image floats between ethereal and enigmatic. The world can\'t quite pin them down — and that\'s the magic.',
    'People see a dreamer who somehow makes their fantasies real. Their image is art before it\'s anything else.',
    'They project a soft power that disarms. In a world of sharp angles, they\'re the blur that everyone remembers.',
  ],
};

const PUBLIC_IMAGE_RISING: Record<string, string> = {
  Aries: 'With Aries rising, their first impression hits hard — athletic, urgent, alive. People sense a fighter before they hear a word.',
  Taurus: 'Taurus rising gives them a physical gravitas. They look expensive. They feel permanent. Their aesthetic whispers "I\'m not going anywhere."',
  Gemini: 'Gemini rising makes them chameleonic in public — quick-talking, bright-eyed, endlessly adaptable. You never see the same version twice.',
  Cancer: 'Cancer rising softens their public face with a maternal warmth that makes strangers feel safe. Approachable but private.',
  Leo: 'Leo rising gives them main-character energy at all times. They glow. Cameras love them because the light genuinely does.',
  Virgo: 'Virgo rising sharpens their public edge into something clean and deliberate. Everything curated. Nothing accidental.',
  Libra: 'Libra rising gives them symmetrical, beautiful energy in public. They look harmonious even in chaos. Born for the lens.',
  Scorpio: 'Scorpio rising gives them smoldering, piercing energy in every public appearance. Eyes you can\'t forget.',
  Sagittarius: 'Sagittarius rising makes them look like they just got off a plane from somewhere incredible. Worldly, open, magnetic.',
  Capricorn: 'Capricorn rising gives them CEO energy on sight. Structured jaw, sharp lines, the posture of someone who expects to be taken seriously.',
  Aquarius: 'Aquarius rising makes them look like they\'re from the future. Unusual style, striking features, an edge that can\'t be copied.',
  Pisces: 'Pisces rising wraps them in a dreamy haze. They photograph like magic — always slightly more beautiful than reality should allow.',
};

export function generatePublicImage(input: InterpretationInput): string {
  const { name, planets, aspects, signature } = input;
  const sunSign = getSign(planets, 'Sun') || signature?.sun_sign || 'Leo';
  const risingSign = signature?.rising_sign || (input.ascendant ? lonToSign(input.ascendant) : null);
  const venusSign = getSign(planets, 'Venus');

  const sunLines = PUBLIC_IMAGE_SUN[sunSign] || PUBLIC_IMAGE_SUN['Leo'];
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const primary = sunLines[hash % sunLines.length];
  const secondary = sunLines[(hash + 2) % sunLines.length];

  const parts: string[] = [primary, secondary];

  if (risingSign && PUBLIC_IMAGE_RISING[risingSign]) {
    parts.push(PUBLIC_IMAGE_RISING[risingSign]);
  }

  if (input.midheaven) {
    const mcSign = lonToSign(input.midheaven);
    const mcElement = getElement(mcSign);
    const mcNotes: Record<string, string> = {
      fire: `Their Midheaven in ${mcSign} places their career legacy in the fire element — their reputation is built on bold moves, creative risk, and being impossible to ignore.`,
      earth: `Their Midheaven in ${mcSign} grounds their legacy in something tangible — empires, institutions, products. They build things that outlast trends.`,
      air: `Their Midheaven in ${mcSign} ties their legacy to ideas, communication, and cultural influence. They change how people think.`,
      water: `Their Midheaven in ${mcSign} gives their public legacy an emotional undertone. People don't just admire them — they feel connected to them.`,
    };
    parts.push(mcNotes[mcElement] || '');
  }

  if (venusSign) {
    const venusElement = getElement(venusSign);
    const venusStyleNotes: Record<string, string> = {
      fire: 'Their aesthetic runs bold — statement pieces, unapologetic color, fashion that says "notice me."',
      earth: 'Their style is luxurious but grounded. Clean lines, quality fabrics, pieces that age like wine.',
      air: 'Their style is cerebral and avant-garde. They dress like a concept — always interesting, never boring.',
      water: 'Their style carries emotion. Flowing fabrics, mood-driven palettes, looks that tell a story without words.',
    };
    if (venusStyleNotes[venusElement]) parts.push(venusStyleNotes[venusElement]);
  }

  return parts.filter(Boolean).join('\n\n');
}

// ═══════════════════════════════════════════════════════════════════
// EMOTIONAL STYLE
// ═══════════════════════════════════════════════════════════════════

const EMOTIONAL_MOON: Record<string, string[]> = {
  Aries: [
    'Emotions hit them fast and burn bright. They don\'t sit with feelings — they act on them. Anger comes quick, forgiveness comes quicker.',
    'Underneath the bravery is someone who processes emotions through motion. Stillness makes them restless. They need to fight, run, or create to feel okay.',
    'They protect themselves by attacking first. Not out of cruelty — out of a deep fear of vulnerability. Getting them to slow down emotionally is like asking fire to cool.',
  ],
  Taurus: [
    'Emotionally, they\'re a vault — deep, secure, and incredibly slow to open. But once they let you in, the loyalty is absolute and unshakeable.',
    'They process feelings through the body. Comfort food, physical touch, music that hits the chest. They don\'t intellectualize pain — they feel it in their bones.',
    'Under stress, they dig in. Stubbornness becomes their armor. The more threatened they feel, the more immovable they become.',
  ],
  Gemini: [
    'Their emotional life moves at the speed of thought. Feelings are data to be processed, shared, discussed, and sometimes talked away before they\'re actually felt.',
    'They protect themselves through deflection — humor, subject changes, a perfectly timed joke when things get too heavy.',
    'Beneath the lightness is someone who fears being emotionally trapped. They need room to breathe, space to think, and a partner who won\'t demand they stay in one feeling too long.',
  ],
  Cancer: [
    'Their emotional depth is oceanic. They feel everything — their pain, your pain, the pain of strangers in the next room. It\'s exhausting and it\'s their superpower.',
    'Home is their emotional anchor. When the world gets loud, they retreat into their shell — not to hide, but to regenerate.',
    'They remember everything. Every slight, every kindness, every moment of tenderness. Their emotional memory is a library with no expiration dates.',
  ],
  Leo: [
    'Their emotional style is grand — big feelings, big reactions, big love. They don\'t do anything small, especially not feelings.',
    'Pride is their emotional bodyguard. They\'d rather perform happiness than admit to heartbreak, and they need to be adored to feel emotionally safe.',
    'When they love you, you feel like the sun chose you specifically. When they\'re hurt, the temperature drops in the entire room.',
  ],
  Virgo: [
    'They process emotions through analysis. Feelings are puzzles to be solved, and they won\'t rest until they understand exactly why they feel the way they do.',
    'Anxiety is their emotional baseline. They worry deeply, quietly, and constantly — usually about the people they love most.',
    'They show love through service, not spectacle. Fixing your problem IS their love language. If they\'re helping you, they\'re saying "I care" in the only dialect they fully trust.',
  ],
  Libra: [
    'Emotional harmony is their oxygen. Conflict disrupts their entire nervous system — they\'ll bend themselves into impossible shapes to keep the peace.',
    'They process feelings through partnership. Alone with their emotions, they feel unmoored. With someone to reflect against, they find clarity.',
    'They hide dark feelings behind a beautiful smile. The world sees composure; inside, they\'re running elaborate emotional calculations about whether everyone around them is okay.',
  ],
  Scorpio: [
    'Their emotional intensity is a force of nature. They feel at depths most people will never access — and they wouldn\'t have it any other way.',
    'Trust is earned in blood. They test the people they love — not consciously, but compulsively — because betrayal is the wound they carry everywhere.',
    'Under stress, they transform or destroy. There\'s no neutral gear. Emotional stagnation is death to them — they\'d rather burn it all down than stay stuck.',
  ],
  Sagittarius: [
    'Emotionally, they run. Not from feelings themselves, but from the cage that intense feelings can build. Freedom is their emotional survival strategy.',
    'They process pain through philosophy — turning every heartbreak into a lesson, every loss into a story, every crisis into an adventure narrative.',
    'Their optimism is both genuine and defensive. The smile is real, but it\'s also their shield against a darkness they rarely let anyone see.',
  ],
  Capricorn: [
    'Their emotional life runs underground. On the surface — composure. Beneath — a tightly controlled intensity that reveals itself only to the inner circle.',
    'They process feelings through accomplishment. Sad? Work harder. Heartbroken? Build something. Their emotional coping mechanism is productivity.',
    'Vulnerability terrifies them because it feels like weakness, and weakness is the one thing they\'ve spent their entire life refusing to be.',
  ],
  Aquarius: [
    'They intellectualize feelings to survive them. Emotions are treated as abstract concepts to be understood rather than experiences to be surrendered to.',
    'Emotional detachment is their superpower and their prison. They can observe their own feelings with scientific clarity — but sometimes they observe when they should just feel.',
    'They need emotional freedom the way most people need air. Possessiveness, clinginess, emotional demands — these trigger their disappearing act.',
  ],
  Pisces: [
    'Their emotional boundaries don\'t exist in any traditional sense. They absorb the moods of everyone around them like a sponge dropped in the ocean.',
    'They feel the world\'s pain as their own — and that empathy is both a gift and a weight that never fully lifts.',
    'Under stress, they dissolve. Escapism — music, fantasy, sleep, substances, art — is how they survive a world that feels too sharp for their soft emotional skin.',
  ],
};

const EMOTIONAL_SATURN_NOTE = 'Saturn touches their emotional core, adding a layer of heaviness and emotional self-discipline. They grew up fast inside. There\'s a seriousness beneath the surface that comes from learning early that feelings need to be managed, not just felt.';
const EMOTIONAL_PLUTO_NOTE = 'Pluto deepens their emotional landscape into something volcanic. They\'ve likely survived emotional experiences that would break most people — and that survival gave them a power and perceptiveness that borders on psychic.';

export function generateEmotionalStyle(input: InterpretationInput): string {
  const { name, planets, aspects, signature } = input;
  const moonSign = getSign(planets, 'Moon') || signature?.moon_sign;

  if (!moonSign) {
    const sunSign = getSign(planets, 'Sun') || signature?.sun_sign || 'Leo';
    const element = getElement(sunSign);
    const fallbacks: Record<string, string> = {
      fire: `Without a confirmed birth time, the Moon's exact sign is unknown — but ${name}'s fire-dominant chart suggests emotions run hot, reactive, and fearless. They likely process feelings through action, expression, and creative output rather than quiet reflection.`,
      earth: `The Moon's exact position is unconfirmed, but ${name}'s earth-heavy chart suggests emotional steadiness and a need for tangible security. They likely process feelings slowly, deeply, and through the physical world.`,
      air: `Without a confirmed Moon placement, ${name}'s air-dominant energy suggests they intellectualize emotions — processing through conversation, analysis, and social reflection rather than sitting in raw feeling.`,
      water: `Even without a confirmed Moon sign, ${name}'s water-influenced chart hints at profound emotional depth. They likely absorb everything, feel everything, and carry emotional memories that never truly fade.`,
    };
    return fallbacks[element] || `${name}'s emotional world runs deep — though without a confirmed birth time, the full picture of their inner landscape remains private.`;
  }

  const moonLines = EMOTIONAL_MOON[moonSign] || EMOTIONAL_MOON['Leo'];
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const parts: string[] = [
    moonLines[hash % moonLines.length],
    moonLines[(hash + 1) % moonLines.length],
  ];

  const saturnMoon = hasAspect(aspects, 'Saturn', 'Moon');
  if (saturnMoon) parts.push(EMOTIONAL_SATURN_NOTE);

  const plutoMoon = hasAspect(aspects, 'Pluto', 'Moon');
  if (plutoMoon) parts.push(EMOTIONAL_PLUTO_NOTE);

  const sunSign = getSign(planets, 'Sun');
  if (sunSign) {
    const sunEl = getElement(sunSign);
    const moonEl = getElement(moonSign);
    if (sunEl !== moonEl) {
      const tensions: Record<string, Record<string, string>> = {
        fire: {
          earth: 'There\'s a tension between their fiery public self and a private need for stability. The world sees confidence; inside, they crave security.',
          air: 'Their emotional nature craves connection and movement, while their outer self burns with independent drive. They oscillate between togetherness and solo missions.',
          water: 'Fire and water create steam. Their outer boldness masks a deeply sensitive interior — and managing that contradiction is their lifelong emotional work.',
        },
        earth: {
          fire: 'Inside, they\'re steadier than their public persona suggests. The world sees fire; their heart wants roots.',
          air: 'Their emotions seek permanence, but their mind seeks stimulation. That internal push-pull makes them more complex than most realize.',
          water: 'Earth and water together create something lush and deep. Their emotional life is rich, grounded, and quietly intense.',
        },
        air: {
          fire: 'Their social charm masks a more restless emotional interior. Intellectually nimble outside, emotionally searching within.',
          earth: 'Their thinking is breezy but their feelings are heavy. That dissonance makes them fascinating and sometimes exhausting to understand.',
          water: 'Air meets water — thoughts meets feelings. They analyze their emotions until the feelings dissolve into ideas, then wonder why they feel numb.',
        },
        water: {
          fire: 'Beneath a sensitive exterior lives something fiercer. They feel softly but react boldly when pushed.',
          earth: 'Their emotional depth is anchored by practical instincts. They feel everything, then quietly build something from the wreckage.',
          air: 'They feel oceanic depths but communicate in cool, detached waves. The gap between what they feel and what they say is where their mystery lives.',
        },
      };
      const note = tensions[sunEl]?.[moonEl];
      if (note) parts.push(note);
    }
  }

  return parts.join('\n\n');
}

// ═══════════════════════════════════════════════════════════════════
// RELATIONSHIP STYLE
// ═══════════════════════════════════════════════════════════════════

const RELATIONSHIP_VENUS: Record<string, string[]> = {
  Aries: [
    'In love, they\'re a blaze. Pursuit is everything — the chase, the spark, the moment of capture. They fall fast and love fiercely.',
    'They flirt like they fight: directly, boldly, and without apology. If they want you, you\'ll know. Subtlety is not in their romantic vocabulary.',
    'They need a partner who can match their intensity without trying to tame it. The moment love feels like a leash, they\'re gone.',
  ],
  Taurus: [
    'Love for them is physical, devotional, and built to last. They want the real thing — not the situationship, not the almost, not the maybe.',
    'They express affection through presence, touch, and consistency. A home-cooked meal is worth more than a hundred love poems.',
    'Possessiveness is their shadow side. They love deeply, but they love with a grip — and learning to hold loosely is their relationship evolution.',
  ],
  Gemini: [
    'They need a lover who is also a best friend, a debate partner, and an intellectual equal. Bore them and you\'ve already lost them.',
    'Flirting is their native language. Texting, banter, inside jokes — their love life reads like the most entertaining group chat you\'ve ever been in.',
    'Commitment can feel like a cage to them. They need a relationship that breathes — one with enough space for curiosity and enough depth for real connection.',
  ],
  Cancer: [
    'They love with their whole body, their whole memory, their whole history. When they let you in, you become part of their inner world — and that\'s sacred.',
    'They need emotional safety above everything. Show them you won\'t leave, and they\'ll give you a loyalty so deep it becomes your foundation.',
    'Their shadow in love is emotional manipulation — not from malice, but from fear. When they feel insecure, they pull strings. When they feel safe, they\'re the most nurturing partner alive.',
  ],
  Leo: [
    'Love is their stage and their partner is the audience they chose. They love grandly — declarations, surprises, the full cinematic experience.',
    'They need to be adored. Not admired from afar — truly, actively worshipped. Attention is not a want; it\'s how they know they\'re loved.',
    'Their generosity in love is legendary, but so is their pride. Wound their ego in a relationship and the warmth turns to ice without warning.',
  ],
  Virgo: [
    'They show love by making your life work better. Fixing things, remembering details, anticipating your needs before you voice them.',
    'They\'re harder on themselves in love than on anyone else. The inner critic runs loudest in relationships, making them second-guess their worthiness.',
    'They need a partner who can see the tenderness beneath the perfectionism — someone who says "you\'re enough" and actually makes them believe it.',
  ],
  Libra: [
    'Relationships are where they come alive. They were built for partnership — the dance of two people becoming more beautiful together.',
    'They\'re devastatingly charming in the pursuit phase. The courtship is elegant, thoughtful, and designed to make you feel like the only person who exists.',
    'Their shadow is codependency. They can lose themselves in love so completely that they forget who they were before the relationship started.',
  ],
  Scorpio: [
    'Love isn\'t a game for them — it\'s an excavation. They want to know you at the molecular level, and anything less feels like a waste of time.',
    'They love with terrifying intensity. Passion, jealousy, devotion, obsession — it\'s all part of the package, and they won\'t apologize for any of it.',
    'Trust is the currency. Break it once and the door closes with a sound you\'ll never forget. Earn it, and you\'ll have a love that outlasts everything.',
  ],
  Sagittarius: [
    'They fall in love with possibility. The partner who makes life feel like an open highway with no destination wins their heart every time.',
    'They\'re wildly romantic — but on their terms. Lock them down too tight and the wanderlust kicks in. Love them loosely and they\'ll always come back.',
    'Their honesty in relationships is both refreshing and brutal. They\'ll tell you the truth even when it hurts, because pretending feels worse to them than conflict.',
  ],
  Capricorn: [
    'Love is a commitment they take as seriously as their career. They don\'t date for fun — they evaluate for potential. Casual is not in their code.',
    'They show love through reliability, protection, and long-term planning. Not the most poetic — but the most dependable partner you\'ll ever have.',
    'Their emotional walls are legendary. Getting past them requires patience, consistency, and the understanding that their coldness is just fear wearing a suit.',
  ],
  Aquarius: [
    'They love from a distance that most people find confusing. It\'s not coldness — it\'s a different language. They need intellectual intimacy before anything else.',
    'Traditional romance bores them. They want the unconventional partnership — the one that doesn\'t follow rules and doesn\'t look like anyone else\'s.',
    'Freedom is non-negotiable. A partner who tries to own them emotionally will trigger their most spectacular vanishing act.',
  ],
  Pisces: [
    'They love like a movie. Soulmate energy, fated encounters, love that transcends the rational. For them, romance is spiritual.',
    'They merge with their partners so completely that they can lose themselves. Learning where they end and the other person begins is their relationship homework.',
    'Their capacity for forgiveness is almost supernatural. They\'ll love you through things that would make anyone else leave — which is both beautiful and dangerous.',
  ],
};

const RELATIONSHIP_MARS_FLAIR: Record<string, string> = {
  Aries: 'Their Mars adds pure combustion to intimacy — they want passion that feels dangerous and excitement that never dims.',
  Taurus: 'Mars in Taurus brings a slow-burning sensuality to relationships. Physical connection is everything, and they take their time.',
  Gemini: 'Mars in Gemini makes them verbally seductive. Dirty talk, love letters, pillow talk — words are foreplay.',
  Cancer: 'Mars in Cancer makes them protectively passionate. They fight for their loved ones with maternal ferocity.',
  Leo: 'Mars in Leo brings theatrical passion. Love with them is an event. Intimacy is a performance. And they expect a standing ovation.',
  Virgo: 'Mars in Virgo channels desire into devotion. They\'re attentive lovers who study what works and perfect it.',
  Libra: 'Mars in Libra softens aggression into seduction. They pursue through charm, not force — and they\'re devastatingly good at it.',
  Scorpio: 'Mars in Scorpio makes intimacy volcanic. They want all-consuming, transformative physical connection — nothing surface-level survives.',
  Sagittarius: 'Mars in Sagittarius makes love feel like a road trip. Spontaneous, physical, free, and always heading somewhere new.',
  Capricorn: 'Mars in Capricorn brings stamina and control to intimacy. They\'re disciplined in desire — patient, strategic, and deeply satisfying.',
  Aquarius: 'Mars in Aquarius brings an experimental edge to physical connection. They want novelty, surprise, and intellectual foreplay.',
  Pisces: 'Mars in Pisces makes physical intimacy feel spiritual. Connection through the body is transcendence for them.',
};

export function generateRelationshipStyle(input: InterpretationInput): string {
  const { name, planets, aspects, signature } = input;
  const venusSign = getSign(planets, 'Venus');
  const marsSign = getSign(planets, 'Mars');

  const vSign = venusSign || signature?.sun_sign || 'Leo';
  const venusLines = RELATIONSHIP_VENUS[vSign] || RELATIONSHIP_VENUS['Leo'];
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const parts: string[] = [
    venusLines[hash % venusLines.length],
    venusLines[(hash + 1) % venusLines.length],
  ];

  if (marsSign && RELATIONSHIP_MARS_FLAIR[marsSign]) {
    parts.push(RELATIONSHIP_MARS_FLAIR[marsSign]);
  }

  const venusPluto = hasAspect(aspects, 'Venus', 'Pluto');
  if (venusPluto) {
    parts.push('Venus-Pluto in their chart adds obsessive depth to love. Relationships become all-or-nothing transformations. They don\'t do light connections — every bond is a soul contract.');
  }

  const venusNeptune = hasAspect(aspects, 'Venus', 'Neptune');
  if (venusNeptune) {
    parts.push('Venus-Neptune gives them a romantic idealism that\'s both enchanting and heartbreaking. They see the highest potential in partners — sometimes at the cost of seeing reality.');
  }

  const venusSaturn = hasAspect(aspects, 'Venus', 'Saturn');
  if (venusSaturn) {
    parts.push('Venus-Saturn creates emotional walls in love. They\'ve learned the hard way that affection costs something — and they don\'t give it freely until trust is fully earned.');
  }

  return parts.join('\n\n');
}

// ═══════════════════════════════════════════════════════════════════
// AMBITION STYLE
// ═══════════════════════════════════════════════════════════════════

const AMBITION_MARS: Record<string, string[]> = {
  Aries: [
    'Their ambition is a missile. No deliberation, no committee meeting, no waiting for the perfect moment. They see the target and they move.',
    'Competition is oxygen. They don\'t just want to succeed — they want to win, and they want you to know they won.',
    'Speed is their weapon. While others are still analyzing risks, they\'ve already launched, failed, adjusted, and launched again.',
  ],
  Taurus: [
    'Their ambition operates on geological time. Slow, relentless, and quietly devastating. By the time you notice their progress, they already own the mountain.',
    'They don\'t chase — they build. Brick by brick, asset by asset, day by day. Their empire is patience made visible.',
    'Stability isn\'t boring to them — it\'s the point. Their vision of success looks like an unshakeable foundation, not a flashy headline.',
  ],
  Gemini: [
    'Their ambition runs through networks, ideas, and information. They don\'t climb a ladder — they build a web of connections that lifts them from every angle.',
    'They pursue multiple goals simultaneously and somehow make it work. Their talent is making complexity look like genius multitasking.',
    'Their weapon is adaptability. While others are married to one strategy, they\'ve already pivoted three times and landed on something better.',
  ],
  Cancer: [
    'Their ambition is protective. They don\'t climb for ego — they climb to create security for the people they love.',
    'Emotional intelligence is their business strategy. They read rooms, sense power dynamics, and position themselves with maternal cunning.',
    'Their drive intensifies when someone tells them they can\'t. Underneath the softness is a crab with claws that don\'t let go.',
  ],
  Leo: [
    'Their ambition is performance. They want to be seen, recognized, and remembered — not as a participant, but as the star.',
    'They lead through inspiration, not intimidation. People follow them because their confidence is genuinely magnetic and their vision is genuinely bold.',
    'Legacy matters more than money. They want a name that echoes. An impact that outlasts their physical presence. An empire of influence.',
  ],
  Virgo: [
    'Their ambition hides in plain sight. While others are bragging about goals, they\'re quietly executing a plan so detailed it would make a general weep.',
    'Excellence is their competitive edge. They don\'t need to be the loudest — they just need to be the best. And usually, they are.',
    'They improve systems, eliminate waste, and optimize everything they touch. Their ambition looks like perfection and feels like relentless self-improvement.',
  ],
  Libra: [
    'Their ambition moves through relationships. They advance through alliances, partnerships, and an almost supernatural ability to make the right people feel important.',
    'They strategize with elegance. No burned bridges, no public feuds, no unnecessary enemies. Their rise looks effortless because the diplomacy is masterful.',
    'Fairness drives them more than power. They want success, but they want it to look good — ethically, aesthetically, and socially.',
  ],
  Scorpio: [
    'Their ambition is volcanic — dormant for years, then devastating when it erupts. They don\'t announce their moves; you discover them after the fact.',
    'They play the long game with an intensity that borders on obsessive. Every setback is fuel. Every enemy becomes motivation. Nothing is wasted.',
    'Power is the goal — not fame, not praise. Real, structural power. The kind that operates behind the scenes and controls outcomes.',
  ],
  Sagittarius: [
    'Their ambition thinks in continents, not neighborhoods. Small goals bore them. They want global impact, boundary-breaking work, and projects that expand human experience.',
    'They bet big. Where others see risk, they see potential. And their optimism — reckless as it sometimes appears — is backed by genuine vision.',
    'Freedom is baked into their ambition. They\'ll never stay in a role that cages them. Success has to feel like expansion, or it\'s not worth pursuing.',
  ],
  Capricorn: [
    'Their ambition is architectural. Strategic, structured, and designed to compound over decades. Every move is a brick in a building only they can see.',
    'They respect the grind in a way that confuses people who want shortcuts. The long road isn\'t a burden — it\'s a proving ground.',
    'They want the corner office, the title, the legacy — and they\'ll outwork, outplan, and outlast every single person who stands in their way.',
  ],
  Aquarius: [
    'Their ambition is systemic. They don\'t want to climb the ladder — they want to redesign it so everyone can use the elevator.',
    'They\'re drawn to innovation over tradition. If it\'s been done before, they\'re already bored. Their greatest work comes from breaking formats.',
    'Group impact matters more than personal glory. They want to change things — structures, systems, the way the world works. Individual fame is a side effect.',
  ],
  Pisces: [
    'Their ambition is spiritual. Success isn\'t measured in numbers — it\'s measured in impact, beauty, and the emotional residue they leave behind.',
    'They create from a place so deep that it sometimes confuses industries built on logic. Their genius is feeling what the world needs before it knows.',
    'Their path is never linear. They drift, dream, dissolve, and then emerge with something transcendent. The chaos is part of the process.',
  ],
};

const AMBITION_SATURN_SIGN: Record<string, string> = {
  Aries: 'Saturn in Aries teaches them to discipline their impulses. The lesson: patience doesn\'t kill fire — it sharpens it into a blade.',
  Taurus: 'Saturn in Taurus demands they build real wealth — not just material, but emotional and spiritual. The slow road is the only road.',
  Gemini: 'Saturn in Gemini forces mental discipline. Their challenge: stop scattering and commit to mastering one voice, one message, one mission.',
  Cancer: 'Saturn in Cancer hardens the emotional shell. They carry family burdens as fuel — turning inherited pain into professional steel.',
  Leo: 'Saturn in Leo tests their need for recognition. The lesson: true authority doesn\'t need applause. It just needs to be undeniable.',
  Virgo: 'Saturn in Virgo amplifies perfectionism to crushing levels. Their challenge: learn that "done" beats "perfect" every time.',
  Libra: 'Saturn in Libra demands they master partnerships and collaboration. Solo glory comes second to institutional power.',
  Scorpio: 'Saturn in Scorpio turns intensity into structured power. They don\'t just feel deeply — they weaponize that depth into lasting achievement.',
  Sagittarius: 'Saturn in Sagittarius constrains the wanderlust into focused expansion. The challenge: pursue one vision far rather than many visions wide.',
  Capricorn: 'Saturn in Capricorn is ambition in its purest form. They were built for this — the climb, the pressure, the eventual summit.',
  Aquarius: 'Saturn in Aquarius gives their radical thinking a structural backbone. They don\'t just dream of change — they engineer it.',
  Pisces: 'Saturn in Pisces demands they ground their dreams in reality. The lesson: compassion becomes powerful only when it\'s organized.',
};

const AMBITION_JUPITER_SIGN: Record<string, string> = {
  Aries: 'Jupiter in Aries expands their courage. When they bet on themselves, the universe tends to match.',
  Taurus: 'Jupiter in Taurus amplifies financial luck and material growth. Abundance follows their patience.',
  Gemini: 'Jupiter in Gemini multiplies their ideas into opportunities. Communication is where their biggest breaks come from.',
  Cancer: 'Jupiter in Cancer blesses their home life and emotional instincts. Their gut feeling is their best business advisor.',
  Leo: 'Jupiter in Leo amplifies their star power. Luck finds them when they dare to be visible.',
  Virgo: 'Jupiter in Virgo rewards their attention to detail. The universe pays them back for every hour of quiet work.',
  Libra: 'Jupiter in Libra expands their social power. Their network IS their net worth.',
  Scorpio: 'Jupiter in Scorpio deepens their resourcefulness. They find opportunity where others see crisis.',
  Sagittarius: 'Jupiter in Sagittarius is pure expansion. Their optimism is justified — doors genuinely open when they walk toward them.',
  Capricorn: 'Jupiter in Capricorn rewards their discipline. Success arrives on schedule, never early, never unearned.',
  Aquarius: 'Jupiter in Aquarius expands their reach through innovation. Their biggest wins come from their strangest ideas.',
  Pisces: 'Jupiter in Pisces amplifies creative and spiritual gifts. Their art, their empathy, their vision — that\'s where abundance lives.',
};

export function generateAmbitionStyle(input: InterpretationInput): string {
  const { name, planets, aspects, signature } = input;
  const marsSign = getSign(planets, 'Mars');
  const saturnSign = getSign(planets, 'Saturn');
  const jupiterSign = getSign(planets, 'Jupiter');
  const sunSign = getSign(planets, 'Sun') || signature?.sun_sign || 'Leo';

  const primarySign = marsSign || sunSign;
  const marsLines = AMBITION_MARS[primarySign] || AMBITION_MARS['Leo'];
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const parts: string[] = [
    marsLines[hash % marsLines.length],
    marsLines[(hash + 1) % marsLines.length],
  ];

  if (saturnSign && AMBITION_SATURN_SIGN[saturnSign]) {
    parts.push(AMBITION_SATURN_SIGN[saturnSign]);
  }

  if (jupiterSign && AMBITION_JUPITER_SIGN[jupiterSign]) {
    parts.push(AMBITION_JUPITER_SIGN[jupiterSign]);
  }

  const sunMars = hasAspect(aspects, 'Sun', 'Mars');
  if (sunMars) {
    parts.push('The Sun-Mars connection in their chart supercharges their will. Identity and action are fused — they don\'t dream about doing, they DO. Sitting still is physically uncomfortable.');
  }

  const marsPluto = hasAspect(aspects, 'Mars', 'Pluto');
  if (marsPluto) {
    parts.push('Mars-Pluto gives them an almost frightening intensity of purpose. When they decide something will happen, it happens. Opposition doesn\'t slow them — it hardens their resolve into something unbreakable.');
  }

  return parts.join('\n\n');
}
