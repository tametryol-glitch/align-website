/* ──────────────────────────────────────────────────────────────
   Zodiac Compatibility Content Generator
   Produces SEO-rich, astrologically-accurate content for every
   possible sign pair (78 unique combinations).
   ────────────────────────────────────────────────────────────── */

// ── Core sign data ───────────────────────────────────────────

export type ZodiacSign =
  | 'aries' | 'taurus' | 'gemini' | 'cancer'
  | 'leo' | 'virgo' | 'libra' | 'scorpio'
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export type Element = 'fire' | 'earth' | 'air' | 'water';
export type Modality = 'cardinal' | 'fixed' | 'mutable';

export interface SignData {
  name: string;
  glyph: string;
  element: Element;
  modality: Modality;
  ruler: string;
  dates: string;
  traits: string[];
  loveStyle: string;
  shadow: string;
}

export const SIGNS: Record<ZodiacSign, SignData> = {
  aries: {
    name: 'Aries',
    glyph: '♈',
    element: 'fire',
    modality: 'cardinal',
    ruler: 'Mars',
    dates: 'Mar 21 – Apr 19',
    traits: ['bold', 'passionate', 'competitive', 'direct', 'courageous'],
    loveStyle: 'Aries loves with fierce intensity. They pursue their partner with unmatched enthusiasm and need a relationship that keeps their fire burning bright.',
    shadow: 'impatience and a tendency to prioritize their own needs',
  },
  taurus: {
    name: 'Taurus',
    glyph: '♉',
    element: 'earth',
    modality: 'fixed',
    ruler: 'Venus',
    dates: 'Apr 20 – May 20',
    traits: ['steadfast', 'sensual', 'loyal', 'patient', 'grounded'],
    loveStyle: 'Taurus builds love slowly and deliberately. They express devotion through touch, quality time, and creating a beautiful shared life.',
    shadow: 'stubbornness and possessiveness when feeling insecure',
  },
  gemini: {
    name: 'Gemini',
    glyph: '♊',
    element: 'air',
    modality: 'mutable',
    ruler: 'Mercury',
    dates: 'May 21 – Jun 20',
    traits: ['curious', 'witty', 'adaptable', 'social', 'intellectual'],
    loveStyle: 'Gemini connects through conversation and mental stimulation. They need a partner who can match their intellectual curiosity and keep things fresh.',
    shadow: 'inconsistency and difficulty committing to one direction',
  },
  cancer: {
    name: 'Cancer',
    glyph: '♋',
    element: 'water',
    modality: 'cardinal',
    ruler: 'Moon',
    dates: 'Jun 21 – Jul 22',
    traits: ['nurturing', 'intuitive', 'protective', 'emotional', 'devoted'],
    loveStyle: 'Cancer loves with their whole heart. They create emotional sanctuaries and express care through nurturing acts that make their partner feel deeply held.',
    shadow: 'moodiness and a tendency to withdraw into their shell when hurt',
  },
  leo: {
    name: 'Leo',
    glyph: '♌',
    element: 'fire',
    modality: 'fixed',
    ruler: 'Sun',
    dates: 'Jul 23 – Aug 22',
    traits: ['charismatic', 'generous', 'dramatic', 'warm', 'creative'],
    loveStyle: 'Leo loves grandly and generously. They pour warmth and adoration into their relationships and thrive when their partner celebrates them in return.',
    shadow: 'need for constant admiration and difficulty sharing the spotlight',
  },
  virgo: {
    name: 'Virgo',
    glyph: '♍',
    element: 'earth',
    modality: 'mutable',
    ruler: 'Mercury',
    dates: 'Aug 23 – Sep 22',
    traits: ['analytical', 'helpful', 'modest', 'precise', 'devoted'],
    loveStyle: 'Virgo shows love through acts of service and attention to detail. They notice what their partner needs before being asked and work tirelessly to improve the relationship.',
    shadow: 'over-criticism and anxiety about imperfection',
  },
  libra: {
    name: 'Libra',
    glyph: '♎',
    element: 'air',
    modality: 'cardinal',
    ruler: 'Venus',
    dates: 'Sep 23 – Oct 22',
    traits: ['harmonious', 'charming', 'diplomatic', 'romantic', 'fair-minded'],
    loveStyle: 'Libra is the sign of partnership itself. They seek balance, beauty, and genuine connection, and they invest deeply in creating a relationship that feels harmonious and equal.',
    shadow: 'indecisiveness and conflict avoidance that can breed resentment',
  },
  scorpio: {
    name: 'Scorpio',
    glyph: '♏',
    element: 'water',
    modality: 'fixed',
    ruler: 'Pluto',
    dates: 'Oct 23 – Nov 21',
    traits: ['intense', 'perceptive', 'transformative', 'loyal', 'magnetic'],
    loveStyle: 'Scorpio loves with soul-deep intensity. They seek total emotional and physical merging and will go to extraordinary lengths to protect the bond they build.',
    shadow: 'jealousy and a need for control rooted in fear of betrayal',
  },
  sagittarius: {
    name: 'Sagittarius',
    glyph: '♐',
    element: 'fire',
    modality: 'mutable',
    ruler: 'Jupiter',
    dates: 'Nov 22 – Dec 21',
    traits: ['adventurous', 'optimistic', 'philosophical', 'free-spirited', 'honest'],
    loveStyle: 'Sagittarius loves through shared adventures and expanding horizons together. They need freedom within partnership and a mate who shares their hunger for growth.',
    shadow: 'restlessness and bluntness that can unintentionally wound',
  },
  capricorn: {
    name: 'Capricorn',
    glyph: '♑',
    element: 'earth',
    modality: 'cardinal',
    ruler: 'Saturn',
    dates: 'Dec 22 – Jan 19',
    traits: ['ambitious', 'disciplined', 'responsible', 'strategic', 'dry-witted'],
    loveStyle: 'Capricorn approaches love with the same dedication they bring to their ambitions. They build relationships meant to last and show devotion through reliability and long-term planning.',
    shadow: 'emotional guardedness and workaholism that can starve a relationship of warmth',
  },
  aquarius: {
    name: 'Aquarius',
    glyph: '♒',
    element: 'air',
    modality: 'fixed',
    ruler: 'Uranus',
    dates: 'Jan 20 – Feb 18',
    traits: ['visionary', 'independent', 'humanitarian', 'unconventional', 'intellectual'],
    loveStyle: 'Aquarius loves through intellectual kinship and shared ideals. They need a partner who respects their independence and joins them in reimagining what a relationship can be.',
    shadow: 'emotional detachment and stubbornness disguised as principle',
  },
  pisces: {
    name: 'Pisces',
    glyph: '♓',
    element: 'water',
    modality: 'mutable',
    ruler: 'Neptune',
    dates: 'Feb 19 – Mar 20',
    traits: ['empathic', 'imaginative', 'spiritual', 'compassionate', 'dreamy'],
    loveStyle: 'Pisces loves without boundaries. They merge emotionally with their partner, offering unconditional compassion and a rich inner world to share.',
    shadow: 'escapism and difficulty maintaining healthy boundaries',
  },
};

export const ALL_SIGN_KEYS: ZodiacSign[] = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

// ── Element / modality compatibility rules ────────────────────

type ElementPair = string; // e.g. "fire+air"

interface ElementAffinity {
  score: number;       // 1-10
  label: string;
  description: string;
}

function elementPairKey(a: Element, b: Element): ElementPair {
  return [a, b].sort().join('+');
}

const ELEMENT_AFFINITIES: Record<ElementPair, ElementAffinity> = {
  'fire+fire': {
    score: 8,
    label: 'Blazing Mirror',
    description: 'Two fire signs together create a bonfire of energy, passion, and creative ambition. The warmth is genuine and the enthusiasm contagious, though both need to manage ego and competition.',
  },
  'earth+earth': {
    score: 8,
    label: 'Bedrock Bond',
    description: 'Earth meeting earth builds something enduring. These partners share values of security, loyalty, and tangible results, creating a relationship that grows richer with time.',
  },
  'air+air': {
    score: 7,
    label: 'Intellectual Breeze',
    description: 'Two air signs spark endless conversation, ideas, and social connection. Their mental rapport is electric, though they may need to consciously cultivate emotional depth.',
  },
  'water+water': {
    score: 9,
    label: 'Deep Current',
    description: 'Water meeting water creates profound emotional intimacy. These partners understand each other\'s feelings intuitively, building a bond that transcends words.',
  },
  'air+fire': {
    score: 8,
    label: 'Exciting Energy',
    description: 'Air feeds fire, creating a dynamic of inspiration and action. The air sign provides ideas and perspective while the fire sign brings passion and drive to manifest them.',
  },
  'earth+water': {
    score: 9,
    label: 'Deep Connection',
    description: 'Earth and water together create fertile ground for lasting love. The earth sign provides stability and structure while the water sign brings emotional depth and nourishment.',
  },
  'fire+water': {
    score: 5,
    label: 'Steam & Passion',
    description: 'Fire and water create steam — intensely passionate but potentially volatile. The fire sign\'s directness can overwhelm the water sign\'s sensitivity, yet their chemistry is undeniable.',
  },
  'earth+fire': {
    score: 5,
    label: 'Friction & Growth',
    description: 'Earth and fire operate at different speeds — one deliberate, the other impulsive. The tension can be frustrating, but it also teaches both partners invaluable lessons about patience and action.',
  },
  'air+water': {
    score: 5,
    label: 'Mist & Mystery',
    description: 'Air and water can create beautiful mist or confusing fog. The air sign\'s logic meets the water sign\'s intuition, and bridging head and heart requires conscious effort from both.',
  },
  'air+earth': {
    score: 6,
    label: 'Theory Meets Practice',
    description: 'Air and earth pair vision with pragmatism. The air sign dreams and conceptualizes while the earth sign grounds those ideas in reality, though they may frustrate each other\'s pace.',
  },
};

interface ModalityAffinity {
  score: number;
  description: string;
}

function modalityPairKey(a: Modality, b: Modality): string {
  return [a, b].sort().join('+');
}

const MODALITY_AFFINITIES: Record<string, ModalityAffinity> = {
  'cardinal+cardinal': {
    score: 6,
    description: 'Two cardinal signs are both natural leaders, which creates dynamic energy but also power struggles. When they learn to take turns leading, they become an unstoppable force.',
  },
  'fixed+fixed': {
    score: 7,
    description: 'Two fixed signs share deep loyalty and determination. They build something unshakable together, though their mutual stubbornness can create intense standoffs.',
  },
  'mutable+mutable': {
    score: 7,
    description: 'Two mutable signs are incredibly adaptable together, flowing through changes with ease. They need to watch for scattered energy and ensure someone takes the lead on big decisions.',
  },
  'cardinal+fixed': {
    score: 8,
    description: 'Cardinal initiative meets fixed determination — a powerful combination. The cardinal sign starts things while the fixed sign sees them through to completion.',
  },
  'cardinal+mutable': {
    score: 7,
    description: 'Cardinal direction meets mutable flexibility. The cardinal sign provides vision and leadership while the mutable sign adapts and supports, creating smooth collaboration.',
  },
  'fixed+mutable': {
    score: 7,
    description: 'Fixed depth meets mutable variety. The fixed sign provides emotional anchoring while the mutable sign prevents stagnation by introducing new perspectives.',
  },
};

// ── Content section types ─────────────────────────────────────

export interface CompatibilitySection {
  title: string;
  icon: string;
  paragraphs: string[];
}

export interface CompatibilityContent {
  sign1: SignData;
  sign2: SignData;
  slug: string;
  overallScore: number;
  elementAffinity: ElementAffinity;
  modalityAffinity: ModalityAffinity;
  sections: CompatibilitySection[];
  quickFacts: { label: string; value: string }[];
}

// ── Content generators for each section ───────────────────────

function generateOverviewSection(s1: SignData, s2: SignData, elemAffinity: ElementAffinity, modAffinity: ModalityAffinity, isSameSign: boolean): CompatibilitySection {
  const paragraphs: string[] = [];

  if (isSameSign) {
    paragraphs.push(
      `When two ${s1.name} individuals come together, they encounter the cosmic mirror — a partner who reflects their deepest desires, strengths, and vulnerabilities back at them with startling clarity. This is ${s1.element} meeting ${s1.element}, ${s1.modality} energy doubled, and all the gifts and challenges of ${s1.name} amplified. The result is a relationship of extraordinary understanding and, at times, extraordinary intensity.`
    );
    paragraphs.push(
      `Both partners are ruled by ${s1.ruler}, which means they share the same fundamental approach to life, love, and growth. ${s1.loveStyle} When two people love in exactly the same way, the connection can feel almost telepathic — but it also means neither partner naturally balances the other\'s blind spots. The ${s1.shadow} that ${s1.name} carries becomes something both partners must consciously manage rather than unconsciously compensate for.`
    );
    paragraphs.push(
      `The element of ${s1.element} doubled creates ${elemAffinity.label.toLowerCase()} energy in this pairing. ${elemAffinity.description} As a same-sign couple, you intuitively understand each other\'s rhythms, motivations, and emotional needs in a way that can feel almost uncanny to outsiders.`
    );
    paragraphs.push(
      `The ${s1.modality} modality shared by both partners means ${modAffinity.description.charAt(0).toLowerCase()}${modAffinity.description.slice(1)} This shared mode of operating can be both your greatest comfort and your greatest friction point — you move through life at the same speed and with the same style, which feels wonderful until you both dig in at the same time.`
    );
    paragraphs.push(
      `At its best, a ${s1.name}-${s1.name} pairing becomes a relationship of profound mutual understanding, shared passion, and genuine acceptance. At its most challenging, it can become an echo chamber that amplifies weaknesses. The key lies in celebrating your similarities while actively cultivating individual growth and bringing fresh energy into the relationship.`
    );
  } else {
    paragraphs.push(
      `The union of ${s1.name} and ${s2.name} brings together ${s1.element} and ${s2.element} in a dance of ${elemAffinity.label.toLowerCase()}. ${s1.name}, ruled by ${s1.ruler}, is ${s1.traits.slice(0, 3).join(', ')}, and ${s1.traits[3]}. ${s2.name}, governed by ${s2.ruler}, brings ${s2.traits.slice(0, 3).join(', ')}, and ${s2.traits[3]} energy to the table. When these two meet, the connection often feels significant from the very first encounter.`
    );
    paragraphs.push(
      `${elemAffinity.description} This elemental dynamic forms the foundation of their compatibility, shaping how they communicate, resolve conflict, and experience intimacy. The ${elemAffinity.label.toLowerCase()} quality of their connection means that ${s1.name} and ${s2.name} will find certain aspects of their relationship flow naturally while others require deliberate attention and care.`
    );
    paragraphs.push(
      `From a modal perspective, this ${s1.modality}-${s2.modality} pairing has its own distinct rhythm. ${modAffinity.description} This dynamic plays out in how they make decisions, handle change, and navigate the everyday logistics of partnership.`
    );
    paragraphs.push(
      `${s1.loveStyle} Meanwhile, ${s2.loveStyle.charAt(0).toLowerCase()}${s2.loveStyle.slice(1)} Understanding these different love languages is essential for ${s1.name} and ${s2.name} to truly flourish together.`
    );
    paragraphs.push(
      `Overall, the ${s1.name}-${s2.name} bond carries an elemental compatibility score that reflects both the natural chemistry and the growth opportunities present in this pairing. With self-awareness and mutual respect, these two can build a relationship that brings out the best in both signs while transforming their individual weaknesses into shared strengths.`
    );
  }

  return { title: 'Overview', icon: '✨', paragraphs };
}

function generateEmotionalSection(s1: SignData, s2: SignData, elemAffinity: ElementAffinity, isSameSign: boolean): CompatibilitySection {
  const paragraphs: string[] = [];

  const waterCount = [s1.element, s2.element].filter(e => e === 'water').length;
  const fireCount = [s1.element, s2.element].filter(e => e === 'fire').length;
  const earthCount = [s1.element, s2.element].filter(e => e === 'earth').length;
  const airCount = [s1.element, s2.element].filter(e => e === 'air').length;

  if (isSameSign) {
    paragraphs.push(
      `Emotionally, two ${s1.name} individuals understand each other on an almost cellular level. Both process feelings through the lens of ${s1.element}, which means they share an emotional vocabulary that few outside their bond can fully grasp. When one partner is going through something, the other doesn\'t just sympathize — they viscerally understand, because they would experience the same situation in a remarkably similar way.`
    );
    paragraphs.push(
      `The danger in this emotional mirroring is that both partners share the same ${s1.shadow}. When ${s1.name} is at their worst, having a partner who defaults to the same shadow patterns means there\'s no one to pull the relationship out of a downward spiral. Emotional maturity from both individuals is essential for this pairing to thrive.`
    );
  } else if (waterCount === 2) {
    paragraphs.push(
      `The emotional bond between ${s1.name} and ${s2.name} runs extraordinarily deep. As two water signs, they share an intuitive emotional intelligence that allows them to sense each other\'s moods, needs, and unspoken feelings with remarkable accuracy. Their home together becomes an emotional sanctuary where both feel safe enough to be completely vulnerable.`
    );
    paragraphs.push(
      `However, this depth of emotional connection requires careful stewardship. When both partners are highly sensitive, conflicts can spiral into deep emotional wounds if not handled with care. ${s1.name}\'s tendency toward ${s1.shadow} combined with ${s2.name}\'s ${s2.shadow} means both need to practice clear communication rather than relying solely on emotional intuition.`
    );
  } else if (waterCount === 1 && fireCount === 1) {
    paragraphs.push(
      `The emotional dynamic between ${s1.name} and ${s2.name} is one of the most complex in the zodiac. ${s1.element === 'water' ? s1.name : s2.name} processes emotions deeply and internally, riding waves of feeling that can be overwhelming in their intensity. ${s1.element === 'fire' ? s1.name : s2.name} experiences emotions as fuel for action — quick to ignite, quick to express, and sometimes quick to move past. This fundamental difference in emotional processing creates both their greatest friction and their greatest potential for growth.`
    );
    paragraphs.push(
      `The fire sign can learn invaluable lessons about emotional depth and patience from their water partner, while the water sign can learn to express feelings directly and let go of emotional weight more readily. When this exchange is mutual and respectful, the relationship develops extraordinary emotional range — the passion of fire tempered by the depth of water.`
    );
  } else if (waterCount === 1 && earthCount === 1) {
    paragraphs.push(
      `${s1.name} and ${s2.name} create a beautifully grounded emotional connection. ${s1.element === 'earth' ? s1.name : s2.name} provides a stable, reliable emotional presence that makes ${s1.element === 'water' ? s1.name : s2.name} feel safe enough to open up fully. In return, the water sign brings emotional depth and intuition that softens the earth sign\'s more pragmatic approach to feelings, teaching them that vulnerability is a form of strength.`
    );
    paragraphs.push(
      `This is one of the most naturally nurturing emotional pairings in astrology. The earth sign\'s consistency prevents the water sign from feeling abandoned or insecure, while the water sign\'s emotional attentiveness ensures the earth sign never feels taken for granted. Together, they create an emotional ecosystem that sustains and nourishes both partners.`
    );
  } else if (fireCount === 2) {
    paragraphs.push(
      `Two fire signs create an emotionally vibrant and expressive relationship. ${s1.name} and ${s2.name} both wear their hearts on their sleeves, which means there\'s rarely any guessing about where they stand. Arguments can be explosive but they burn fast — both partners prefer to clear the air immediately rather than letting resentment build. The emotional atmosphere is warm, dynamic, and never boring.`
    );
    paragraphs.push(
      `The challenge comes from their shared intensity. When both partners are emotionally charged, there\'s no cooling presence to de-escalate. They must learn that not every emotional impulse needs to be acted on immediately, and that sometimes the most loving response is to pause rather than react.`
    );
  } else if (airCount >= 1 && waterCount >= 1) {
    paragraphs.push(
      `The emotional connection between ${s1.name} and ${s2.name} requires bridge-building. ${s1.element === 'air' ? s1.name : s2.name} processes feelings through logic and conversation, wanting to understand and articulate emotions clearly. ${s1.element === 'water' ? s1.name : s2.name} experiences emotions as an ocean of feeling that defies easy categorization. The air sign may inadvertently intellectualize the water sign\'s feelings, while the water sign may feel their partner is emotionally distant.`
    );
    paragraphs.push(
      `When they learn each other\'s emotional language, however, something beautiful emerges. The air sign helps the water sign find words and frameworks for their overwhelming feelings, while the water sign teaches the air sign to trust intuition and sit with emotions rather than analyzing them away. This mutual translation creates a richer emotional vocabulary than either could develop alone.`
    );
  } else if (earthCount >= 1 && fireCount >= 1) {
    paragraphs.push(
      `The emotional rhythm between ${s1.name} and ${s2.name} reflects their elemental differences. ${s1.element === 'fire' ? s1.name : s2.name} experiences emotions as sudden, powerful surges that demand immediate expression. ${s1.element === 'earth' ? s1.name : s2.name} feels just as deeply but processes slowly, needing time and space to understand what they\'re feeling before they can articulate it. This mismatch in emotional timing can lead to frustration on both sides.`
    );
    paragraphs.push(
      `The gift in this dynamic is mutual growth. The fire sign learns that emotions don\'t expire if they\'re not acted on immediately, developing patience and depth. The earth sign learns that spontaneous emotional expression can be liberating rather than threatening, developing openness and warmth. Over time, they calibrate to each other\'s pace and create a uniquely balanced emotional landscape.`
    );
  } else if (airCount === 2) {
    paragraphs.push(
      `Two air signs create an emotionally articulate partnership. ${s1.name} and ${s2.name} both process feelings through conversation, making them unusually skilled at discussing relationship dynamics, needs, and concerns. They can talk through almost anything, which gives their relationship exceptional problem-solving capacity.`
    );
    paragraphs.push(
      `The challenge is ensuring their emotional connection goes beyond words. Both partners can default to intellectualizing feelings rather than truly sitting with them, creating a relationship that sounds emotionally healthy but may lack visceral depth. Making space for silence, physical affection, and unprocessed emotional rawness strengthens their bond immeasurably.`
    );
  } else if (earthCount === 2) {
    paragraphs.push(
      `Two earth signs build a deeply stable emotional connection. ${s1.name} and ${s2.name} both value consistency, reliability, and actions over words. Their emotional bond is expressed through showing up — day after day, through routine and ritual, building a shared life that speaks louder than any declaration of love.`
    );
    paragraphs.push(
      `The risk for this pairing is emotional stagnation. Both partners may become so comfortable in their routines that they stop checking in emotionally, assuming everything is fine because nothing has visibly changed. Scheduling dedicated time for emotional vulnerability — even when it feels unnecessary — keeps the connection vital and prevents drifting apart while standing side by side.`
    );
  } else {
    paragraphs.push(
      `Emotionally, ${s1.name} and ${s2.name} bring different but complementary qualities to their relationship. ${s1.name}\'s ${s1.traits[0]} nature meets ${s2.name}\'s ${s2.traits[0]} approach, creating a dynamic where both partners are challenged to expand their emotional range. The initial adjustment period may feel uncomfortable, but it leads to genuine growth.`
    );
    paragraphs.push(
      `The key to emotional harmony in this pairing is recognizing that different doesn\'t mean wrong. ${s1.name} isn\'t being cold when they need space, and ${s2.name} isn\'t being needy when they seek closeness. When both partners learn to honor each other\'s emotional style rather than trying to change it, the relationship becomes a place of profound acceptance.`
    );
  }

  paragraphs.push(
    `In moments of stress, ${s1.name} tends toward ${s1.shadow}, while ${s2.name} may struggle with ${s2.shadow}. Recognizing these patterns in each other — and choosing compassion over criticism — is what separates ${s1.name}-${s2.name} relationships that merely survive from those that truly flourish. The couples who thrive are the ones who learn to see their partner\'s shadow as a call for love, not a reason for judgment.`
  );

  paragraphs.push(
    `Building emotional rituals together — whether it\'s a weekly check-in, a shared journaling practice, or simply a nightly debrief — gives this pair a framework for emotional maintenance. ${s1.name} and ${s2.name} don\'t need to feel the same way at the same time; they need to create enough safety for both partners to feel whatever they feel without fear.`
  );

  return { title: 'Emotional Compatibility', icon: '💖', paragraphs };
}

function generateIntellectualSection(s1: SignData, s2: SignData, isSameSign: boolean): CompatibilitySection {
  const paragraphs: string[] = [];
  const rulers = `${s1.ruler} and ${s2.ruler}`;

  if (isSameSign) {
    paragraphs.push(
      `Intellectually, two ${s1.name} individuals are perfectly matched in curiosity and communication style. Both are governed by ${s1.ruler}, which means they approach learning, problem-solving, and conversation through the same planetary lens. Dinner conversations, travel plans, and life philosophy all align naturally. The meeting of minds feels effortless.`
    );
    paragraphs.push(
      `The potential pitfall is intellectual echo chambers. Because they think alike, they may reinforce each other\'s biases rather than challenging assumptions. The healthiest ${s1.name}-${s1.name} couples actively seek out new ideas, travel to unfamiliar places, and befriend people unlike themselves to keep their shared intellectual world expanding.`
    );
  } else {
    const mercuryRuled = [s1, s2].filter(s => s.ruler === 'Mercury');
    const jupiterRuled = [s1, s2].filter(s => s.ruler === 'Jupiter');

    if (mercuryRuled.length > 0) {
      paragraphs.push(
        `With ${mercuryRuled[0].name}\'s Mercury rulership bringing sharp analytical skills and communication prowess, the intellectual dynamic in this pairing is lively. ${mercuryRuled[0].name} processes information quickly and articulates ideas with precision, which can either delight or overwhelm their ${mercuryRuled[0] === s1 ? s2.name : s1.name} partner depending on the moment.`
      );
    }

    if (jupiterRuled.length > 0) {
      paragraphs.push(
        `${jupiterRuled[0].name}\'s Jupiter rulership brings expansive thinking, philosophical depth, and a natural love of big ideas. They think in terms of meaning, purpose, and possibility. This philosophical streak adds a layer of depth to conversations that their partner may find either inspiring or overwhelming.`
      );
    }

    paragraphs.push(
      `The intellectual connection between ${s1.name} (${s1.element}) and ${s2.name} (${s2.element}) reflects their elemental natures. ${s1.element === 'air' || s1.element === 'fire' ? s1.name + ' tends to think quickly and express ideas enthusiastically' : s1.name + ' tends toward thoughtful, measured analysis'}. ${s2.element === 'air' || s2.element === 'fire' ? s2.name + ' matches with rapid-fire thinking and bold opinions' : s2.name + ' brings careful consideration and practical grounding to discussions'}. Their conversations may look different from the outside, but the mutual respect for each other\'s mind is the foundation.`
    );
    paragraphs.push(
      `When it comes to decision-making, the ${s1.modality} nature of ${s1.name} and the ${s2.modality} nature of ${s2.name} create a particular dynamic. ${s1.modality === 'cardinal' ? s1.name + ' initiates decisions and drives the agenda' : s1.modality === 'fixed' ? s1.name + ' considers all angles before committing fully' : s1.name + ' weighs multiple options and adapts the approach as new information arrives'}. ${s2.modality === 'cardinal' ? s2.name + ' also likes to lead, which can spark productive debate' : s2.modality === 'fixed' ? s2.name + ' provides stability and thoroughness in decision-making' : s2.name + ' offers flexibility that keeps plans adaptable'}. Learning to appreciate these different cognitive styles turns potential friction into complementary strength.`
    );
  }

  paragraphs.push(
    `Shared intellectual pursuits strengthen the ${s1.name}-${s2.name} bond significantly. Whether it\'s reading the same book, debating current events, taking a class together, or simply exploring a new city, activities that engage both minds keep the relationship stimulating. This pair does well with regular intellectual "dates" that go beyond routine conversation.`
  );

  paragraphs.push(
    `Communication repair is especially important for ${s1.name} and ${s2.name}. When misunderstandings arise — and they will, given the influence of ${rulers} — the ability to pause, clarify intent, and assume goodwill transforms potential arguments into moments of deeper connection. The couples who master this skill find that their intellectual bond only strengthens over time.`
  );

  return { title: 'Intellectual & Communication', icon: '🧠', paragraphs };
}

function generatePhysicalSection(s1: SignData, s2: SignData, elemAffinity: ElementAffinity, isSameSign: boolean): CompatibilitySection {
  const paragraphs: string[] = [];

  if (isSameSign) {
    paragraphs.push(
      `The physical chemistry between two ${s1.name} individuals is often immediate and intense. Because both partners share the same ${s1.element} element and are ruled by ${s1.ruler}, their physical rhythms, preferences, and desires tend to align naturally. There\'s an intuitive understanding of what the other needs, a shared language of touch that feels like coming home.`
    );
    paragraphs.push(
      `${s1.element === 'fire' ? 'As a fire sign pair, their physical connection burns hot and passionate. They match each other\'s intensity and enthusiasm, creating a dynamic physical relationship that stays exciting because both partners crave the same level of energy and spontaneity.' : s1.element === 'earth' ? 'As an earth sign pair, their physical connection is deeply sensual. They share an appreciation for comfort, touch, and the slow build of desire. Quality matters far more than novelty, and they create a physical relationship rich in texture and presence.' : s1.element === 'water' ? 'As a water sign pair, their physical connection transcends the purely physical. There\'s an emotional and almost spiritual quality to their intimacy that makes every encounter feel meaningful. They merge completely, boundaries dissolving in ways that can be transcendent.' : 'As an air sign pair, their physical connection begins in the mind. Flirtation, fantasy, and verbal play are essential foreplay. They keep things interesting through variety, experimentation, and the intellectual framing of desire.'}`
    );
  } else {
    const pairKey = elementPairKey(s1.element, s2.element);

    if (pairKey === 'fire+water') {
      paragraphs.push(
        `The physical chemistry between ${s1.name} and ${s2.name} is literally what happens when fire meets water: steam. Their attraction often has an almost magnetic quality — they are drawn to each other with an intensity that can be both exhilarating and bewildering. The fire sign\'s boldness and the water sign\'s depth create a physical dynamic of extraordinary range and passion.`
      );
      paragraphs.push(
        `The challenge is that their physical needs differ. The fire sign craves excitement, spontaneity, and visible enthusiasm, while the water sign needs emotional safety, connection, and vulnerability. When both partners learn to speak each other\'s physical language, the result is chemistry that rivals any pairing in the zodiac.`
      );
    } else if (pairKey === 'earth+water') {
      paragraphs.push(
        `The physical connection between ${s1.name} and ${s2.name} is one of the most naturally harmonious in astrology. Earth and water together create a sensual, nurturing physical bond. The earth sign grounds the experience in the body — in touch, taste, and texture — while the water sign infuses it with emotional depth and intuitive responsiveness. Together, they create intimacy that is both deeply physical and profoundly emotional.`
      );
      paragraphs.push(
        `This pairing rarely struggles with physical compatibility. Both value quality over quantity, depth over novelty, and connection over performance. Their physical relationship tends to deepen over time rather than fading, as trust builds and both partners become more attuned to the other\'s needs and desires.`
      );
    } else if (pairKey === 'air+fire') {
      paragraphs.push(
        `${s1.name} and ${s2.name} bring playful, electric physical chemistry to their connection. Air and fire together create a dynamic where desire is ignited through flirtation, spontaneity, and a sense of adventure. The fire sign\'s passion and the air sign\'s creativity make for a physical relationship that stays exciting and inventive.`
      );
      paragraphs.push(
        `Their physical connection thrives on variety and surprise. Routine is the enemy of this pairing\'s physical chemistry, so both partners benefit from keeping things fresh — new experiences, unexpected gestures, and a willingness to be playful and experimental keep the flame burning bright.`
      );
    } else if (pairKey === 'earth+fire') {
      paragraphs.push(
        `The physical dynamic between ${s1.name} and ${s2.name} brings together earth\'s sensuality with fire\'s passion. The fire sign brings heat, urgency, and boldness, while the earth sign grounds the experience in the senses and in the present moment. The contrast can be incredibly appealing — the earth sign is drawn to the fire sign\'s confidence, and the fire sign is captivated by the earth sign\'s depth.`
      );
      paragraphs.push(
        `Finding a shared physical rhythm requires patience and communication. The fire sign may need to slow down, while the earth sign may need to embrace more spontaneity. When they meet in the middle, they discover a physical connection that combines intensity with presence in a deeply satisfying way.`
      );
    } else {
      paragraphs.push(
        `The physical chemistry between ${s1.name} and ${s2.name} reflects the ${elemAffinity.label.toLowerCase()} quality of their elemental connection. Both bring distinct energy to the physical realm — ${s1.name} with their ${s1.traits[1]} nature and ${s2.name} with their ${s2.traits[1]} approach. Together, they create a physical connection that grows richer as they learn to appreciate each other\'s unique way of expressing desire.`
      );
      paragraphs.push(
        `Physical compatibility in this pairing improves dramatically with communication. ${s1.name} needs their partner to understand that ${s1.element === 'fire' ? 'passion and spontaneity are love languages' : s1.element === 'earth' ? 'sensory richness and unhurried presence matter deeply' : s1.element === 'air' ? 'mental stimulation and verbal connection heighten desire' : 'emotional safety and vulnerability are prerequisites for true intimacy'}. ${s2.name}, in turn, needs ${s2.element === 'fire' ? 'enthusiasm and directness' : s2.element === 'earth' ? 'consistency and tangible affection' : s2.element === 'air' ? 'conversation and intellectual engagement' : 'deep emotional attunement'} to feel fully alive in the relationship.`
      );
    }
  }

  paragraphs.push(
    `Beyond initial attraction, the long-term physical compatibility of ${s1.name} and ${s2.name} depends on their willingness to stay curious about each other. Bodies change, desires evolve, and the couples who maintain a strong physical connection are those who treat this dimension of their relationship as a living, evolving conversation rather than a fixed script.`
  );

  paragraphs.push(
    `Shared physical activities outside the bedroom — cooking together, hiking, dancing, or any pursuit that engages the body — keep the physical dimension of this relationship vibrant. ${s1.name} and ${s2.name} benefit from creating a lifestyle that celebrates physicality in all its forms, building a foundation of physical comfort and joy that naturally extends into their intimate life.`
  );

  return { title: 'Physical & Romantic Chemistry', icon: '🔥', paragraphs };
}

function generateChallengesSection(s1: SignData, s2: SignData, elemAffinity: ElementAffinity, modAffinity: ModalityAffinity, isSameSign: boolean): CompatibilitySection {
  const paragraphs: string[] = [];

  if (isSameSign) {
    paragraphs.push(
      `The primary challenge of the ${s1.name}-${s1.name} pairing is the amplification of shared weaknesses. Every sign has a shadow side, and when both partners share the same one — in this case, ${s1.shadow} — there\'s no natural counterbalance. During difficult times, both partners may default to the same unhelpful patterns simultaneously, creating a feedback loop that can be hard to break.`
    );
    paragraphs.push(
      `Competition is another common challenge in same-sign relationships. Because both partners have similar ambitions, values, and approaches, they may unconsciously compete rather than collaborate. Whether it\'s career success, social recognition, or simply being "right" in an argument, the tendency to measure themselves against each other can erode the partnership. The healthiest same-sign couples celebrate each other\'s wins as their own.`
    );
    paragraphs.push(
      `Boredom and stagnation represent a subtler but equally real risk. When two people are very similar, the relationship can become predictable. Both partners must actively invest in individual growth and bring new experiences, perspectives, and interests into the relationship to keep it dynamic.`
    );
  } else {
    paragraphs.push(
      `Every relationship has its friction points, and for ${s1.name} and ${s2.name}, many of these stem from the elemental tension between ${s1.element} and ${s2.element}. ${s1.name}\'s ${s1.shadow} can collide with ${s2.name}\'s ${s2.shadow}, creating conflict patterns that become painfully predictable if not addressed consciously.`
    );

    if (s1.modality === s2.modality && s1.modality === 'fixed') {
      paragraphs.push(
        `As two fixed signs, stubbornness is perhaps their most defining challenge. Neither ${s1.name} nor ${s2.name} gives ground easily, and arguments can become protracted battles of will where being right feels more important than being happy. Learning the art of compromise — and recognizing that flexibility is not weakness — is essential for this pair.`
      );
    } else if (s1.modality === s2.modality && s1.modality === 'cardinal') {
      paragraphs.push(
        `Both ${s1.name} and ${s2.name} are cardinal signs, which means both want to lead. Power dynamics can become a significant source of tension, with each partner feeling that their vision or approach should take priority. Establishing clear domains where each partner leads — and genuinely respecting each other\'s authority in those areas — transforms this challenge into a strength.`
      );
    } else if (s1.modality === s2.modality && s1.modality === 'mutable') {
      paragraphs.push(
        `Both being mutable signs, ${s1.name} and ${s2.name} can struggle with decision-making and follow-through. Their adaptability is a gift, but it can also mean that important decisions get deferred, commitments feel tentative, and the relationship lacks a clear sense of direction. Establishing shared goals and holding each other accountable brings the structure this pair needs.`
      );
    } else {
      paragraphs.push(
        `The ${s1.modality}-${s2.modality} dynamic creates its own challenges. ${s1.modality === 'cardinal' ? s1.name + ' may push for change before ' + s2.name + ' is ready' : s1.modality === 'fixed' ? s1.name + ' may resist change that ' + s2.name + ' finds necessary' : s1.name + ' may seem inconsistent to the more structured ' + s2.name}. Respecting each other\'s natural rhythm while finding a shared pace is an ongoing negotiation in this relationship.`
      );
    }

    paragraphs.push(
      `Communication style differences are another common friction point. ${s1.element === 'fire' || s1.element === 'air' ? s1.name + ' tends to be direct and verbal, processing thoughts aloud' : s1.name + ' tends to process internally before speaking'}. ${s2.element === 'fire' || s2.element === 'air' ? s2.name + ' shares this outward processing style, which can make conflicts feel louder but also resolves them faster' : s2.name + ' prefers time to reflect before responding, which the more expressive partner can misinterpret as stonewalling or disinterest'}. Agreeing on conflict protocols — when to talk, when to take space, how to signal readiness to reconnect — prevents communication differences from escalating into relationship crises.`
    );
  }

  paragraphs.push(
    `External stressors such as career pressure, family dynamics, and financial strain will test this pairing\'s fault lines. ${s1.name} and ${s2.name} should proactively discuss how they handle stress, what support looks like to each of them, and how they can be a team rather than adversaries when life gets hard. The couples who navigate external challenges together emerge stronger; those who let stress drive wedges between them do not.`
  );

  return { title: 'Challenges & Growth Areas', icon: '⚡', paragraphs };
}

function generateStrengthsSection(s1: SignData, s2: SignData, elemAffinity: ElementAffinity, isSameSign: boolean): CompatibilitySection {
  const paragraphs: string[] = [];

  if (isSameSign) {
    paragraphs.push(
      `The greatest strength of the ${s1.name}-${s1.name} relationship is profound mutual understanding. No one will ever "get" a ${s1.name} the way another ${s1.name} does. The shared rhythms, values, and ways of seeing the world create an ease of connection that other pairings spend years trying to build. This intuitive understanding becomes the bedrock upon which everything else rests.`
    );
    paragraphs.push(
      `Shared passion is another defining strength. Whether it\'s a mutual love of ${s1.element === 'fire' ? 'adventure, creativity, and bold living' : s1.element === 'earth' ? 'building wealth, creating beauty, and enjoying life\'s sensory pleasures' : s1.element === 'air' ? 'ideas, social connection, and intellectual exploration' : 'emotional depth, spiritual practice, and creative expression'}, two ${s1.name} individuals dive into their shared interests with doubled enthusiasm. They push each other further than either would go alone.`
    );
    paragraphs.push(
      `Their shared ${s1.modality} modality, while sometimes a source of friction, also means they approach life with the same energy. ${s1.modality === 'cardinal' ? 'Both are initiators, meaning their life together is full of new beginnings, projects, and adventures.' : s1.modality === 'fixed' ? 'Both are committed and loyal to the core, meaning once they choose each other, the bond is remarkably durable.' : 'Both are adaptable and growth-oriented, meaning their relationship evolves gracefully with the seasons of life.'}`
    );
  } else {
    paragraphs.push(
      `The ${elemAffinity.label.toLowerCase()} quality of ${s1.name} and ${s2.name}\'s connection brings unique gifts. ${s1.name} offers ${s1.traits.slice(0, 2).join(' and ')} energy to the partnership, while ${s2.name} brings ${s2.traits.slice(0, 2).join(' and ')} qualities. Together, they create a relationship that is greater than the sum of its parts — more complete, more capable, and more resilient than either partner would be alone.`
    );

    if (elemAffinity.score >= 8) {
      paragraphs.push(
        `Their high elemental compatibility means that many aspects of their relationship flow naturally. They don\'t have to work hard at basic understanding — their energies naturally harmonize, creating a sense of ease and "rightness" that is one of this pairing\'s greatest gifts. This natural harmony frees up energy for growth, adventure, and deepening their connection rather than spending it on basic compatibility.`
      );
    } else if (elemAffinity.score >= 6) {
      paragraphs.push(
        `While their elements create some natural tension, this friction is actually one of their greatest strengths in disguise. ${s1.name} and ${s2.name} challenge each other to grow in ways that more comfortable pairings never would. The ${s1.element} sign learns from the ${s2.element} sign, and vice versa, creating a partnership of continuous evolution.`
      );
    } else {
      paragraphs.push(
        `The tension between ${s1.element} and ${s2.element} is, paradoxically, this couple\'s superpower. They cover each other\'s blind spots completely. Where ${s1.name} is weak, ${s2.name} is strong, and the reverse is equally true. This complementary dynamic means that as a team, they can handle virtually anything life throws at them.`
      );
    }

    paragraphs.push(
      `The planetary influence of ${s1.ruler} (${s1.name}) and ${s2.ruler} (${s2.name}) creates a unique alchemical blend. ${s1.ruler}\'s energy combines with ${s2.ruler}\'s influence to produce a relationship that embodies the best qualities of both planetary archetypes. This planetary synergy is something that can\'t be manufactured — it\'s a gift of their particular combination.`
    );
  }

  paragraphs.push(
    `When ${s1.name} and ${s2.name} are at their best, they bring out qualities in each other that no one else can access. ${s1.name} becomes more ${s2.traits[2]} through ${s2.name}\'s influence, while ${s2.name} develops greater ${s1.traits[2]} energy through ${s1.name}\'s partnership. This mutual elevation is the hallmark of a truly great compatibility.`
  );

  paragraphs.push(
    `Their relationship also benefits from the natural creativity that arises when different energies combine. Whether it\'s building a home, raising children, pursuing shared goals, or simply designing a life together, ${s1.name} and ${s2.name} bring complementary perspectives that lead to richer, more innovative solutions than either would create alone.`
  );

  return { title: 'Strengths & Gifts', icon: '🌟', paragraphs };
}

function generateAdviceSection(s1: SignData, s2: SignData, isSameSign: boolean): CompatibilitySection {
  const paragraphs: string[] = [];

  if (isSameSign) {
    paragraphs.push(
      `For the ${s1.name}-${s1.name} couple, the most important piece of advice is to cultivate individuality within the partnership. It\'s tempting to merge completely when you\'re with someone so similar, but maintaining separate friendships, hobbies, and personal growth paths ensures that you always bring something fresh to the relationship. You are mirrors, but you should also be windows into different worlds.`
    );
  } else {
    paragraphs.push(
      `For ${s1.name} and ${s2.name}, the foundation of lasting love is curiosity about each other\'s inner world. You are different people shaped by different cosmic forces — ${s1.ruler} and ${s2.ruler}, ${s1.element} and ${s2.element}. Rather than trying to make each other more like yourself, celebrate the alien beauty of who your partner is. The things that perplex you about them are the things that make them irreplaceable.`
    );
  }

  paragraphs.push(
    `Develop a shared ritual vocabulary. ${s1.name} and ${s2.name} thrive when they have consistent ways of showing love, resolving conflict, and celebrating wins. Whether it\'s a weekly date night, a morning coffee ritual, or a specific way of saying "I\'m sorry," these rituals become the architecture of your relationship — the structure that holds you steady when emotions are turbulent.`
  );

  paragraphs.push(
    `When conflict arises, and it will, remember that you are on the same team. The goal of any disagreement should be understanding, not victory. ${s1.name} should resist the urge toward ${s1.shadow.split(' and ')[0]}, and ${s2.name} should watch for ${s2.shadow.split(' and ')[0]}. Replace blame with curiosity: "Help me understand why this matters to you" is more powerful than any argument.`
  );

  paragraphs.push(
    `Finally, never stop dating each other. The most successful ${s1.name}-${s2.name} couples are those who maintain the energy of courtship long into the relationship. Surprise each other. Be generous with compliments and affection. Invest in shared experiences that create new memories. The cosmos brought you together for a reason — honor that gift by never taking each other for granted.`
  );

  paragraphs.push(
    `For a deeper, personalized analysis of your specific compatibility based on your complete birth charts, consider getting a full synastry reading with Align. Sun sign compatibility provides the broad strokes, but your Moon signs, Venus placements, Mars connections, and house overlays tell the full story of your unique cosmic chemistry.`
  );

  return { title: 'Advice for This Pair', icon: '💡', paragraphs };
}

// ── Score calculation ──────────────────────────────────────────

function calculateScore(elemAffinity: ElementAffinity, modAffinity: ModalityAffinity): number {
  // Weighted: element 60%, modality 40%
  const raw = elemAffinity.score * 0.6 + modAffinity.score * 0.4;
  // Normalize to 0-100 range from the 1-10 raw range
  return Math.round(raw * 10);
}

// ── Public API ─────────────────────────────────────────────────

/**
 * Generate the full compatibility content for any two zodiac signs.
 * Signs are automatically alphabetized for consistent slugs.
 */
export function getCompatibilityContent(signA: ZodiacSign, signB: ZodiacSign): CompatibilityContent {
  const s1 = SIGNS[signA];
  const s2 = SIGNS[signB];
  const isSameSign = signA === signB;

  const elemAffinity = ELEMENT_AFFINITIES[elementPairKey(s1.element, s2.element)];
  const modAffinity = MODALITY_AFFINITIES[modalityPairKey(s1.modality, s2.modality)];
  const overallScore = calculateScore(elemAffinity, modAffinity);

  const slug = isSameSign
    ? `${signA}-${signB}`
    : [signA, signB].sort().join('-');

  const sections: CompatibilitySection[] = [
    generateOverviewSection(s1, s2, elemAffinity, modAffinity, isSameSign),
    generateEmotionalSection(s1, s2, elemAffinity, isSameSign),
    generateIntellectualSection(s1, s2, isSameSign),
    generatePhysicalSection(s1, s2, elemAffinity, isSameSign),
    generateStrengthsSection(s1, s2, elemAffinity, isSameSign),
    generateChallengesSection(s1, s2, elemAffinity, modAffinity, isSameSign),
    generateAdviceSection(s1, s2, isSameSign),
  ];

  const quickFacts = [
    { label: 'Element Match', value: elemAffinity.label },
    { label: `${s1.name} Element`, value: s1.element.charAt(0).toUpperCase() + s1.element.slice(1) },
    { label: `${s2.name} Element`, value: s2.element.charAt(0).toUpperCase() + s2.element.slice(1) },
    { label: `${s1.name} Modality`, value: s1.modality.charAt(0).toUpperCase() + s1.modality.slice(1) },
    { label: `${s2.name} Modality`, value: s2.modality.charAt(0).toUpperCase() + s2.modality.slice(1) },
    { label: `${s1.name} Ruler`, value: s1.ruler },
    { label: `${s2.name} Ruler`, value: s2.ruler },
  ];

  return {
    sign1: s1,
    sign2: s2,
    slug,
    overallScore,
    elementAffinity: elemAffinity,
    modalityAffinity: modAffinity,
    sections,
    quickFacts,
  };
}

/**
 * Get all 78 unique sign pair slugs for static param generation.
 */
export function getAllCompatibilityPairs(): { signs: string; sign1: ZodiacSign; sign2: ZodiacSign }[] {
  const pairs: { signs: string; sign1: ZodiacSign; sign2: ZodiacSign }[] = [];

  for (let i = 0; i < ALL_SIGN_KEYS.length; i++) {
    // Same-sign pair
    pairs.push({
      signs: `${ALL_SIGN_KEYS[i]}-${ALL_SIGN_KEYS[i]}`,
      sign1: ALL_SIGN_KEYS[i],
      sign2: ALL_SIGN_KEYS[i],
    });
    // Cross-sign pairs (only once, alphabetized)
    for (let j = i + 1; j < ALL_SIGN_KEYS.length; j++) {
      const [a, b] = [ALL_SIGN_KEYS[i], ALL_SIGN_KEYS[j]].sort() as [ZodiacSign, ZodiacSign];
      pairs.push({ signs: `${a}-${b}`, sign1: a, sign2: b });
    }
  }

  return pairs;
}

/**
 * Parse a slug like "scorpio-pisces" into its two sign keys.
 * Returns null if the slug is invalid.
 */
export function parseCompatibilitySlug(slug: string): { sign1: ZodiacSign; sign2: ZodiacSign } | null {
  const parts = slug.toLowerCase().split('-');
  if (parts.length !== 2) return null;

  const [a, b] = parts;
  if (!ALL_SIGN_KEYS.includes(a as ZodiacSign) || !ALL_SIGN_KEYS.includes(b as ZodiacSign)) {
    return null;
  }

  return { sign1: a as ZodiacSign, sign2: b as ZodiacSign };
}

/**
 * Get element color for UI theming.
 */
export function getElementColor(element: Element): string {
  const colors: Record<Element, string> = {
    fire: '#EF4444',
    earth: '#22C55E',
    air: '#3B82F6',
    water: '#06B6D4',
  };
  return colors[element];
}

/**
 * Get element gradient for UI backgrounds.
 */
export function getElementGradient(element: Element): string {
  const gradients: Record<Element, string> = {
    fire: 'from-red-500/20 to-orange-500/20',
    earth: 'from-green-500/20 to-emerald-500/20',
    air: 'from-blue-500/20 to-sky-500/20',
    water: 'from-cyan-500/20 to-teal-500/20',
  };
  return gradients[element];
}
