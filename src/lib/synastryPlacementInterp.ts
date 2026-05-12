// Synastry Placement Interpretations (web)
// What each planet in each sign means when comparing two charts
// Fully local — no API calls needed

// Web app is English-only; no jargon translation needed
const translateText = (s: string) => s;

// ── Planet meanings in synastry context ──
const SYNASTRY_PLANET_MEANINGS: Record<string, string> = {
  Sun: 'their core identity — the energy they radiate into the relationship and the way they need to be seen by their partner',
  Moon: 'their emotional baseline — the way they instinctively respond to intimacy, the comfort they need, and how they nurture the bond',
  Mercury: 'how they communicate in relationships — the way they process shared experiences, resolve conflict through words, and mentally connect with a partner',
  Venus: 'how they express love — what they find beautiful in a partner, their attachment style, and the specific way affection flows from them',
  Mars: 'how they pursue what they desire in a partner — their sexual energy, their approach to conflict, and what ignites their passion',
  Jupiter: 'where they bring growth and generosity to the relationship — the shared beliefs, adventures, and expansion they offer a partner',
  Saturn: 'the commitment and structure they bring — the boundaries they draw, the lessons they teach, and the long-term stability they offer or withhold',
  Uranus: 'the unpredictability they introduce — the ways they need freedom, surprise their partner, and resist conventional relationship rules',
  Neptune: 'the dreams and illusions they bring — where they idealize a partner, where spiritual connection lives, and where deception can enter',
  Pluto: 'the transformative intensity they carry — the power dynamics they create, the depth they demand, and the parts of a partner they expose',
  'North Node': 'the growth direction they bring into partnership — the karmic lessons the relationship is meant to activate',
  'South Node': 'the familiar comfort they offer — past-life patterns and the easy but potentially stagnant energy they bring',
  Chiron: 'the wound they carry into intimacy — the vulnerability that makes them either a healer or a trigger for their partner',
  Ascendant: 'the first impression they make — the energy a partner encounters before knowing the deeper layers',
  MC: 'their public ambitions and how a partner fits into their life direction — shared goals and mutual support in the world',
  Vesta: 'what they devote themselves to — the sacred focus that may compete with or complement partnership',
  Juno: 'their partnership expectations — the non-negotiable commitments they require and the loyalty they demand',
  Lilith: 'the raw, unfiltered power they bring — the taboo desires, the parts of themselves society told them to hide that emerge in intimate connection',
  Eros: 'the specific quality of desire they carry — the intensity and focus of their sexual and passionate energy directed toward a partner',
  Psyche: 'the emotional depth forged through past wounds — the sensitivity that allows them to feel their partner at levels most people cannot reach',
};

// ── Sign expressions in synastry context ──
const SYNASTRY_SIGN_EXPRESSIONS: Record<string, string> = {
  Aries: 'This energy enters the relationship like a match striking — immediate, direct, and impossible to ignore. They lead with instinct, act before thinking, and bring a boldness that can either electrify a partner or overwhelm them. The attraction is primal. The challenge is patience. They love like they fight: all in, right now, no hesitation.',

  Taurus: 'This energy moves through the relationship with a slow, deliberate sensuality that builds over time. They show love through consistency, physical presence, and the tangible world — meals cooked, bodies held, promises kept. The attraction is earthy and grounding. The challenge is possessiveness. They love like they build: one brick at a time, meant to last forever.',

  Gemini: 'This energy enters the relationship through conversation — the texts that never stop, the inside jokes, the mental connection that makes the physical one possible. They need intellectual stimulation from a partner or they lose interest entirely. The attraction is mental before anything else. The challenge is inconsistency. They love like they think: in multiple directions at once.',

  Cancer: 'This energy wraps around the relationship like a protective shell. They love by nurturing, remembering, and creating emotional safety that most people only dream about. The attraction is rooted in belonging — they make a partner feel like home. The challenge is emotional volatility and the tendency to retreat when hurt. They love like they feel: deeply, protectively, with their entire history present in every moment.',

  Leo: 'This energy lights up the relationship with warmth, generosity, and an unmistakable need to be adored. They love with their whole heart visible, making a partner feel like the most important person in the room. The attraction is magnetic — they radiate confidence and vitality. The challenge is ego. They love like they perform: grandly, passionately, needing the applause to keep going.',

  Virgo: 'This energy shows love through service — the small acts of devotion that most people overlook but that hold a relationship together. They pay attention to the details a partner did not even know mattered. The attraction is quiet but precise. The challenge is criticism — the same eye that notices what needs fixing can make a partner feel like a project. They love like they work: meticulously, devotedly, always trying to make things better.',

  Libra: 'This energy seeks harmony in the relationship above all else — partnership is not just desired, it is required for them to feel complete. They bring grace, diplomacy, and a genuine commitment to fairness. The attraction is aesthetic and intellectual. The challenge is conflict avoidance — they may sacrifice honesty for peace. They love like they relate: through balance, beauty, and the belief that two is always better than one.',

  Scorpio: 'This energy penetrates to the core of the relationship — there is no surface-level version of this connection. They demand total honesty, absolute loyalty, and the kind of intimacy that leaves both people permanently changed. The attraction is magnetic and almost compulsive. The challenge is control. They love like they transform: intensely, completely, with the understanding that real love requires destruction of everything false.',

  Sagittarius: 'This energy expands the relationship into something larger than two people — shared adventures, philosophical debates, and a mutual belief that life is meant to be explored together. They bring optimism, humor, and an infectious enthusiasm. The attraction is aspirational. The challenge is commitment — they need freedom even inside partnership. They love like they explore: with one eye on the horizon and a heart that refuses to be caged.',

  Capricorn: 'This energy brings structure, ambition, and a long-term vision to the relationship. They love through reliability, through showing up when it matters, through building something that will endure. The attraction is earned — it grows with trust. The challenge is emotional unavailability — duty can replace tenderness. They love like they achieve: slowly, deliberately, with the understanding that anything worth having is worth working for.',

  Aquarius: 'This energy brings an unconventional quality to the relationship — they connect through ideas, shared causes, and a mutual refusal to follow the script society handed them. They need intellectual freedom and a partner who respects their individuality. The attraction is cerebral and quirky. The challenge is emotional detachment — they may intellectualize feelings instead of feeling them. They love like they think: independently, progressively, in ways that most people do not understand until later.',

  Pisces: 'This energy dissolves boundaries in the relationship — they merge with a partner emotionally, spiritually, sometimes to the point of losing themselves entirely. They bring a compassion and sensitivity that can feel like a psychic connection. The attraction is soul-level. The challenge is escapism and the tendency to idealize a partner beyond reality. They love like they dream: without limits, without conditions, in a world where the line between devotion and dissolution is dangerously thin.',
};

// ── House context for synastry placements ──
const SYNASTRY_HOUSE_CONTEXT: Record<number, string> = {
  1: 'This energy is immediately visible — it shapes the first impression they make on a partner and the physical chemistry between them.',
  2: 'This energy connects to shared values, financial dynamics, and what each person brings (materially and emotionally) to the relationship.',
  3: 'This energy lives in daily communication — the way they talk, text, and process the ordinary moments of partnership together.',
  4: 'This energy touches the deepest emotional foundation — home, family patterns, and the private world they build with a partner.',
  5: 'This energy fuels romance, playfulness, and creative expression — the joy and passion they bring to the relationship.',
  6: 'This energy shapes the daily routines of the relationship — how they care for each other in practical, unglamorous ways that matter most.',
  7: 'This energy sits directly in the house of partnership — it defines what they seek in committed relationship and how they show up for a partner.',
  8: 'This energy operates in the realm of deep intimacy, shared resources, and psychological transformation within the relationship.',
  9: 'This energy connects to shared beliefs, adventures, and the philosophical framework that gives the relationship meaning.',
  10: 'This energy influences the public face of the relationship — how they support each other\'s ambitions and how the world sees them together.',
  11: 'This energy connects to shared dreams, social circles, and the future vision they build together as a couple.',
  12: 'This energy operates in the hidden spaces — the subconscious dynamics, unspoken needs, and spiritual connection that exists beneath the surface of the relationship.',
};

/**
 * Get a synastry placement interpretation for a planet in a sign,
 * optionally with house context.
 */
export function getSynastryPlacementInterpretation(
  planet: string,
  sign: string,
  house?: number
): string {
  if (!planet || !sign) return '';

  const planetMeaning = SYNASTRY_PLANET_MEANINGS[planet];
  const signExpression = SYNASTRY_SIGN_EXPRESSIONS[sign];

  if (!planetMeaning && !signExpression) return '';

  let text = '';

  if (planetMeaning && signExpression) {
    text = `Their ${planet} represents ${planetMeaning}. With this placed in ${sign}: ${signExpression}`;
  } else if (planetMeaning) {
    text = `Their ${planet} represents ${planetMeaning}.`;
  } else if (signExpression) {
    text = `${planet} in ${sign}: ${signExpression}`;
  }

  if (house && SYNASTRY_HOUSE_CONTEXT[house]) {
    text += ` ${SYNASTRY_HOUSE_CONTEXT[house]}`;
  }

  return translateText(text);
}
