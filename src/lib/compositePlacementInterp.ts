// Composite Placement Interpretations (web)
// What each planet in each sign means for the relationship entity (composite chart)
// Fully local — no API calls needed

// Web app is English-only; no jargon translation needed
const translateText = (s: string) => s;

// ── Planet meanings in composite context ──
const COMPOSITE_PLANET_MEANINGS: Record<string, string> = {
  Sun: 'the relationship\'s core identity — the fundamental purpose of this partnership and the energy that defines what you are together',
  Moon: 'the relationship\'s emotional foundation — how you nurture each other, what the partnership needs to feel safe, and the instinctive emotional tone between you',
  Mercury: 'how the relationship communicates — the mental wavelength you share, how you make decisions together, and the rhythm of your conversations',
  Venus: 'how the relationship expresses love — the shared aesthetic, the way affection flows between you, and what you value together',
  Mars: 'the relationship\'s drive and desire — how you take action together, handle conflict as a unit, and express shared passion',
  Jupiter: 'where the relationship grows — the shared beliefs, adventures, and sense of meaning that expand both of you beyond what you were alone',
  Saturn: 'the relationship\'s structure and challenges — the commitments you build together, the tests you face, and the long-term foundation of the bond',
  Uranus: 'what makes this relationship unique — the unconventional qualities, the need for freedom within the bond, and where you break the rules together',
  Neptune: 'the relationship\'s spiritual dimension — the dreams you share, the ideals you project onto each other, and where illusion may cloud the connection',
  Pluto: 'the relationship\'s transformative power — the depth you reach together, the power dynamics at play, and how the partnership fundamentally changes both of you',
  'North Node': 'the relationship\'s growth direction — the karmic purpose of this connection and what it is meant to teach both of you',
  'South Node': 'the relationship\'s familiar ground — the past-life comfort zone and the patterns you must outgrow together',
  Chiron: 'the relationship\'s shared wound — the vulnerability you hold for each other and the healing that becomes possible only through this specific bond',
  Ascendant: 'how the relationship presents itself to the world — the energy others feel when they see you together and the first impression you make as a couple',
  MC: 'the relationship\'s public purpose — how you function together in the world, shared career ambitions, and the legacy you build as a unit',
  Vesta: 'what the relationship is devoted to — the sacred focus you share and the purpose that keeps you both committed',
  Juno: 'the partnership contract — the commitments you implicitly or explicitly made to each other and the loyalty this bond demands',
  Lilith: 'the relationship\'s raw, untamed energy — the desires you are afraid to name, the power you unlock together, and the parts of the bond that defy social convention',
  Eros: 'the relationship\'s passionate core — the erotic and creative intensity that pulses through the connection',
  Psyche: 'the relationship\'s emotional depth — the soul-level understanding that allows this bond to touch places other connections cannot reach',
  'Part of Fortune': 'where the relationship finds its greatest joy and material success — the sweet spot where being together genuinely pays off',
  Vertex: 'the fated quality of this meeting — the sense that this connection was scripted by something larger than either person\'s conscious choice',
};

// ── Sign expressions in composite context ──
const COMPOSITE_SIGN_EXPRESSIONS: Record<string, string> = {
  Aries: 'This relationship runs on raw energy — it is direct, pioneering, and refuses to wait for permission. Together you are bold, competitive, and at your best when you are starting something new. The challenge is impulsiveness and a tendency to fight for dominance. The gift is courage: this bond does not do anything halfway.',

  Taurus: 'This relationship is built to last. Together you create stability, sensuality, and a shared world that feels physically grounded and real. You show love through presence, loyalty, and the tangible — shared meals, comfortable spaces, consistent effort. The challenge is stubbornness. The gift is endurance: what you build together does not break easily.',

  Gemini: 'This relationship thrives on conversation, variety, and intellectual stimulation. Together you are curious, playful, and constantly exchanging ideas. Boredom is the enemy. The challenge is inconsistency — you may have two versions of the relationship depending on the day. The gift is adaptability: this bond stays interesting because it never stops evolving.',

  Cancer: 'This relationship creates a world of emotional safety that feels like home. Together you nurture, protect, and hold space for each other\'s vulnerabilities. Family and belonging are central themes. The challenge is moodiness and emotional reactivity. The gift is depth: this bond reaches places that most relationships are too afraid to go.',

  Leo: 'This relationship shines. Together you are warm, generous, and genuinely proud of what you have built. You bring out each other\'s confidence and creativity. The challenge is ego — both of you may compete for attention or validation. The gift is joy: this bond reminds both of you what it feels like to be fully, unapologetically alive.',

  Virgo: 'This relationship expresses love through service, attention to detail, and quiet devotion. Together you improve each other — you see what needs fixing and you fix it. The challenge is criticism: the same precision that makes you excellent partners can make you harsh judges. The gift is reliability: this bond shows up when it matters most.',

  Libra: 'This relationship is built on partnership itself — fairness, beauty, and the belief that two people can create something more harmonious than either could alone. Together you are diplomatic, aesthetic, and genuinely committed to balance. The challenge is conflict avoidance. The gift is grace: this bond makes both people better versions of themselves.',

  Scorpio: 'This relationship operates at a depth that most connections never reach. Together you demand total honesty, confront taboos, and transform each other at the soul level. The bond is intense, magnetic, and all-consuming. The challenge is control and jealousy. The gift is power: what you forge together in the fire cannot be broken by anything surface-level.',

  Sagittarius: 'This relationship is an adventure. Together you expand each other\'s horizons, chase meaning, and refuse to settle for a small life. Shared beliefs and a mutual hunger for growth keep the bond alive. The challenge is restlessness — you may struggle with commitment when the horizon calls. The gift is freedom: this bond makes both people bigger.',

  Capricorn: 'This relationship means business. Together you build something tangible — a career, a family, a legacy that outlasts the initial spark. You take the bond seriously and invest in its long-term structure. The challenge is emotional coldness — duty can replace tenderness. The gift is endurance: what you build together stands the test of time.',

  Aquarius: 'This relationship breaks the mold. Together you are unconventional, intellectually connected, and committed to a shared vision of the future. You give each other space to be individuals within the partnership. The challenge is emotional detachment — ideas may replace feelings. The gift is authenticity: this bond allows both people to be exactly who they are.',

  Pisces: 'This relationship dissolves the boundary between two people. Together you create a spiritual, almost telepathic connection — you feel what the other feels, sometimes before they do. The bond is compassionate, creative, and deeply romantic. The challenge is escapism and losing yourselves in each other. The gift is transcendence: this connection touches something sacred.',
};

// ── House context for composite placements ──
const COMPOSITE_HOUSE_CONTEXT: Record<number, string> = {
  1: 'Placed in the 1st house, this energy defines the relationship\'s identity — it is the first thing others notice about you as a couple and the way you instinctively show up together.',
  2: 'In the 2nd house, this energy shapes what the relationship values — shared resources, financial dynamics, and the material foundation you build together.',
  3: 'In the 3rd house, this energy lives in your daily communication — the conversations, the shared neighborhood of ideas, and how you process the world together in real time.',
  4: 'In the 4th house, this energy forms the emotional bedrock of the relationship — the private world you share, the sense of home you create, and the family patterns you carry together.',
  5: 'In the 5th house, this energy fuels the relationship\'s joy — romance, play, creativity, and the spark that keeps the connection alive and exciting.',
  6: 'In the 6th house, this energy shapes the daily life of the partnership — shared routines, mutual care, and the practical ways you serve and support each other.',
  7: 'In the 7th house, this energy sits at the heart of the partnership itself — it defines how you relate one-on-one and what commitment looks like between you.',
  8: 'In the 8th house, this energy operates in the relationship\'s deepest spaces — shared intimacy, psychological transformation, and the merging of your inner worlds.',
  9: 'In the 9th house, this energy drives the relationship\'s search for meaning — shared philosophies, spiritual growth, and the adventures that give the bond its sense of purpose.',
  10: 'In the 10th house, this energy shapes the relationship\'s public face — how you are seen as a couple, shared ambitions, and the legacy you are building together in the world.',
  11: 'In the 11th house, this energy connects the relationship to a larger vision — shared dreams, community involvement, and the future you are co-creating.',
  12: 'In the 12th house, this energy operates beneath the surface — the subconscious dynamics, spiritual bonds, and hidden patterns that shape the relationship in ways you may not fully understand.',
};

/**
 * Get a composite placement interpretation for a planet in a sign,
 * optionally with house context.
 */
export function getCompositePlacementInterpretation(
  planet: string,
  sign: string,
  house?: number
): string {
  if (!planet || !sign) return '';

  const planetMeaning = COMPOSITE_PLANET_MEANINGS[planet];
  const signExpression = COMPOSITE_SIGN_EXPRESSIONS[sign];

  if (!planetMeaning && !signExpression) return '';

  let text = '';

  if (planetMeaning && signExpression) {
    text = `The composite ${planet} represents ${planetMeaning}. In ${sign}: ${signExpression}`;
  } else if (planetMeaning) {
    text = `The composite ${planet} represents ${planetMeaning}.`;
  } else if (signExpression) {
    text = `Composite ${planet} in ${sign}: ${signExpression}`;
  }

  if (house && COMPOSITE_HOUSE_CONTEXT[house]) {
    text += ` ${COMPOSITE_HOUSE_CONTEXT[house]}`;
  }

  return translateText(text);
}
