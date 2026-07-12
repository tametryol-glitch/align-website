/**
 * Central Duad & Compendium System
 *
 * The Duad divides each 30° sign into 12 × 2.5° micro-signs.
 * The Compendium (sub-duad) further divides each 2.5° duad into 12 sub-slices.
 *
 * These hidden layers reveal the psychological undertone (duad) and
 * the externalized lived expression (compendium) beneath every placement.
 *
 * Used across ALL systems: natal, transits, synastry, returns, firdaria,
 * zodiacal releasing, starseed, human design, financial, pathway, midpoints, etc.
 */

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

// Custom rulership: Vesta rules Virgo, Juno rules Libra
const RULERS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Vesta', Libra: 'Juno', Scorpio: 'Pluto',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune',
};

export interface DuadCompendiumResult {
  sign: string;
  degree: number;
  duadSign: string;
  duadHouse: number | null;
  duadRuler: string;
  compendiumSign: string;
  compendiumHouse: number | null;
  compendiumRuler: string;
  /** 4th level: each Compendium ÷ 12 = 12 Matrices of 0°01′02.5″ each. */
  matrixSign: string;
  matrixHouse: number | null;
  matrixRuler: string;
  surfaceTheme: string;
  hiddenTheme: string;
  deepestTheme: string;
  /** The Matrix layer's theme — the finest psychological wiring. */
  matrixTheme: string;
}

// ─── Sign Themes (surface / hidden / deepest) ─────────────────────────────

const SIGN_THEMES: Record<string, { surface: string; hidden: string; deepest: string; psych: string; drive: string; shadow: string; gift: string }> = {
  Aries: {
    surface: 'Bold initiative and raw courage — action leads, words follow',
    hidden: 'A restless fire that must assert itself outward or corrode inward as frustration',
    deepest: 'The primal spark of individuation — existence claimed on its own terms',
    psych: 'fight-or-flight wiring set high and a low threshold for boredom',
    drive: 'to initiate and lead',
    shadow: 'impatience and aggression',
    gift: 'courage and pioneering vision',
  },
  Taurus: {
    surface: 'Steady reliability and sensory grounding — builds, holds, endures',
    hidden: 'A quiet fear of loss that powers the need for permanence and possession',
    deepest: 'Matter as sacred — the body treated as ground, not vehicle',
    psych: 'slow to start and harder to stop, with an instinct for what lasts',
    drive: 'to build and possess',
    shadow: 'stubbornness and material attachment',
    gift: 'patience and enduring loyalty',
  },
  Gemini: {
    surface: 'Quick wit and intellectual curiosity — connects, names, translates',
    hidden: 'A nervous duality reaching for integration through endless information-gathering',
    deepest: 'Language and its limits — the recognition that naming a thing is not the same as knowing it',
    psych: 'a fast-switching mind that thinks by talking, even in silence',
    drive: 'to connect and understand',
    shadow: 'scattered energy and superficiality',
    gift: 'adaptability and quick intelligence',
  },
  Cancer: {
    surface: 'Protective warmth and emotional attunement — feels first, analyzes later',
    hidden: 'An old ache around belonging that drives the need to make rooms feel safe',
    deepest: 'The pull toward origin — every real bond carries a whisper of where we first came from',
    psych: 'emotional memory encoded long before language, felt as weather before thought',
    drive: 'to nurture and belong',
    shadow: 'emotional manipulation and clinginess',
    gift: 'intuitive care and emotional intelligence',
  },
  Leo: {
    surface: 'Radiant confidence and creative self-expression — the room brightens on entry',
    hidden: 'A deep need for recognition that sits on top of a quiet fear of being invisible',
    deepest: 'Light generated from within — warmth that is not borrowed from applause',
    psych: 'self-worth negotiated through visibility; the stage and the mirror run the same circuit',
    drive: 'to be seen and celebrated',
    shadow: 'ego and need for validation',
    gift: 'warmth, generosity, and natural authority',
  },
  Virgo: {
    surface: 'Analytical precision and devotion to improvement — refines everything it touches',
    hidden: 'A perfectionism that grew out of an early sense of not being enough on arrival',
    deepest: 'Sacred service — refinement that accepts imperfection as part of the pattern, not an insult to it',
    psych: 'a running internal editor that catches the flaw before the beauty registers',
    drive: 'to serve and perfect',
    shadow: 'critical perfectionism and self-doubt',
    gift: 'mastery of detail and sacred service',
  },
  Libra: {
    surface: 'Relational grace and aesthetic sensitivity — balance-seeking in every room',
    hidden: 'A fear of conflict that quietly trades self for peace',
    deepest: 'Real harmony as the kind that survives honest confrontation rather than avoiding it',
    psych: 'a decision-engine calibrated to other people\'s reactions before its own preferences',
    drive: 'to harmonize and partner',
    shadow: 'people-pleasing and indecision',
    gift: 'diplomacy and natural justice',
  },
  Scorpio: {
    surface: 'Intense depth and magnetic power — sees through the surface of everything',
    hidden: 'A survival instinct shaped by early betrayal, demanding either total control or total surrender',
    deepest: 'Power as the willingness to be dismantled and rebuilt from underneath',
    psych: 'trust calculated in layers, each one reviewed separately, all of them tested',
    drive: 'to penetrate truth and merge',
    shadow: 'control, jealousy, and obsession',
    gift: 'fearless depth and regenerative strength',
  },
  Sagittarius: {
    surface: 'Expansive optimism and philosophical hunger — horizon-oriented by default',
    hidden: 'A restlessness with the present that keeps insisting the real thing is somewhere else',
    deepest: 'The journey as the destination — meaning made along the way, not discovered at the end',
    psych: 'belief-systems built fast, revised often, held like working hypotheses',
    drive: 'to explore and teach',
    shadow: 'restlessness and dogmatic certainty',
    gift: 'inspiring optimism and truth-seeking',
  },
  Capricorn: {
    surface: 'Strategic discipline and quiet authority — builds brick by brick, year by year',
    hidden: 'An early encounter with limitation that forged an iron promise to never be powerless again',
    deepest: 'Mastery as earned inner authority — not dominion over the world, but ownership of the self',
    psych: 'a long time horizon and a cold-clear read on cost versus value',
    drive: 'to master and build legacy',
    shadow: 'cold calculation and emotional suppression',
    gift: 'endurance, authority, and wisdom through time',
  },
  Aquarius: {
    surface: 'Innovative detachment and future-oriented vision — sees systems before individuals',
    hidden: 'A felt separation from the group that quietly powers the urge to repair it',
    deepest: 'Belonging without conformity — the possibility of loving humanity without disappearing into it',
    psych: 'a pattern-reading intellect with a reflex toward contrarian positions on principle',
    drive: 'to liberate and revolutionize',
    shadow: 'emotional disconnection and contrarian rebellion',
    gift: 'original thinking and collective awareness',
  },
  Pisces: {
    surface: 'Oceanic sensitivity and spiritual absorption — dissolves into whatever is nearby',
    hidden: 'A longing for transcendence that can tilt into escape when the material world feels rough',
    deepest: 'The final passage through matter — the recognition that the boundaries were always provisional',
    psych: 'porous emotional edges; other people\'s weather registers as one\'s own until untangled',
    drive: 'to dissolve boundaries and transcend',
    shadow: 'escapism, confusion, and victimhood',
    gift: 'compassion, artistic vision, and psychic receptivity',
  },
};

// ─── House Themes ──────────────────────────────────────────────────────────

const HOUSE_THEMES: Record<number, string> = {
  1: 'identity, self-image, and how you present to the world',
  2: 'money, possessions, self-worth, and personal resources',
  3: 'communication, siblings, learning, and local connections',
  4: 'home, family, roots, and emotional foundations',
  5: 'creativity, romance, children, pleasure, and self-expression',
  6: 'daily work, health, routines, and acts of service',
  7: 'partnerships, marriage, open enemies, and one-on-one bonds',
  8: 'transformation, shared resources, sexuality, and deep intimacy',
  9: 'higher education, travel, philosophy, and spiritual seeking',
  10: 'career, public reputation, authority, and life direction',
  11: 'community, friendships, networks, and future vision',
  12: 'spirituality, solitude, hidden patterns, and self-undoing',
};

// ─── Core Calculations ─────────────────────────────────────────────────────

/**
 * Calculate the Duad sign from a zodiac sign and degree within that sign.
 * Each sign is divided into 12 × 2.5° segments cycling through the zodiac
 * starting from the sign itself.
 */
export function calculateDuad(sign: string, degreeInSign: number): string {
  const deg = Math.max(0, Math.min(29.999, degreeInSign));
  const idx = Math.min(11, Math.floor(deg / 2.5));
  const signIdx = (SIGNS.indexOf(sign) + idx) % 12;
  return SIGNS[signIdx];
}

/**
 * Calculate the Compendium (sub-duad) sign from the duad sign and degree.
 * Further subdivides the 2.5° duad into 12 micro-segments.
 */
export function calculateCompendium(duadSign: string, degreeInSign: number): string {
  const deg = Math.max(0, Math.min(29.999, degreeInSign));
  const withinDuad = deg % 2.5;
  const subSize = 2.5 / 12;
  const idx = Math.min(11, Math.floor(withinDuad / subSize));
  const signIdx = (SIGNS.indexOf(duadSign) + idx) % 12;
  return SIGNS[signIdx];
}

/**
 * Calculate the Matrix sign — the 4th level. Each 12′30″ compendium is divided
 * into 12 micro-segments of 0°01′02.5″ (62.5″), cycling the signs forward from
 * the compendium sign. Same method as duad → compendium, one level deeper.
 */
export function calculateMatrix(compSign: string, degreeInSign: number): string {
  const deg = Math.max(0, Math.min(29.999, degreeInSign));
  const withinComp = (deg % 2.5) % (2.5 / 12);
  const matrixSize = 2.5 / 144; // (2.5/12)/12 = 0°01′02.5″
  const idx = Math.min(11, Math.floor(withinComp / matrixSize));
  const signIdx = (SIGNS.indexOf(compSign) + idx) % 12;
  return SIGNS[signIdx];
}

/**
 * Get the whole-sign duad house for a given duad sign, relative to the ASC sign.
 */
export function getDuadHouse(duadSign: string, ascSign: string): number {
  const ascIdx = SIGNS.indexOf(ascSign);
  const signIdx = SIGNS.indexOf(duadSign);
  if (ascIdx < 0 || signIdx < 0) return 1;
  return ((signIdx - ascIdx + 12) % 12) + 1;
}

/**
 * Get the whole-sign compendium house for a given compendium sign, relative to ASC.
 */
export function getCompendiumHouse(compSign: string, ascSign: string): number {
  return getDuadHouse(compSign, ascSign);
}

/**
 * Get the whole-sign house for any sign relative to ASC.
 */
export function getHouseForSign(sign: string, ascSign: string): number {
  return getDuadHouse(sign, ascSign);
}

/**
 * Full Duad/Compendium analysis for any ecliptic longitude.
 */
export function getFullDuadCompendium(
  longitude: number,
  ascSign?: string,
): DuadCompendiumResult {
  const lon = ((longitude % 360) + 360) % 360;
  const signIdx = Math.floor(lon / 30) % 12;
  const sign = SIGNS[signIdx];
  const degreeInSign = lon % 30;

  const duadSign = calculateDuad(sign, degreeInSign);
  const compSign = calculateCompendium(duadSign, degreeInSign);
  const matrixSign = calculateMatrix(compSign, degreeInSign);

  const duadRuler = RULERS[duadSign] || duadSign;
  const compRuler = RULERS[compSign] || compSign;
  const matrixRuler = RULERS[matrixSign] || matrixSign;

  const duadHouse = ascSign ? getDuadHouse(duadSign, ascSign) : null;
  const compHouse = ascSign ? getCompendiumHouse(compSign, ascSign) : null;
  const matrixHouse = ascSign ? getDuadHouse(matrixSign, ascSign) : null;

  const surfaceTheme = SIGN_THEMES[sign]?.surface || '';
  const hiddenTheme = SIGN_THEMES[duadSign]?.hidden || '';
  const deepestTheme = SIGN_THEMES[compSign]?.deepest || '';
  const matrixTheme = SIGN_THEMES[matrixSign]?.psych || '';

  return {
    sign,
    degree: degreeInSign,
    duadSign,
    duadHouse,
    duadRuler,
    compendiumSign: compSign,
    compendiumHouse: compHouse,
    compendiumRuler: compRuler,
    matrixSign,
    matrixHouse,
    matrixRuler,
    surfaceTheme,
    hiddenTheme,
    deepestTheme,
    matrixTheme,
  };
}

// ─── Backward-compatible alias ─────────────────────────────────────────────

export function analyzeDuadCompendium(
  longitude: number,
  ascSign?: string,
): DuadCompendiumResult & { degreeInSign: number } {
  const result = getFullDuadCompendium(longitude, ascSign);
  return { ...result, degreeInSign: result.degree };
}

// ─── Rich Interpretation Generators ────────────────────────────────────────

/**
 * Generate a rich natural-language interpretation weaving all three layers.
 * NEVER uses the words "duad" or "compendium".
 * Uses: "the deeper layer", "the hidden current", "the finest thread",
 *       "beneath the surface", "the lived expression".
 */
export function getDuadInterpretation(
  planetName: string,
  sign: string,
  duadSign: string,
  compSign: string,
  house?: number,
  duadHouse?: number,
  compHouse?: number,
): string {
  const signTheme = SIGN_THEMES[sign];
  const duadTheme = SIGN_THEMES[duadSign];
  const compTheme = SIGN_THEMES[compSign];

  if (!signTheme || !duadTheme || !compTheme) return '';

  const ruler = RULERS[sign] || sign;
  const duadRuler = RULERS[duadSign] || duadSign;
  const compRuler = RULERS[compSign] || compSign;

  let text = '';

  // Surface layer
  text += `**${planetName} in ${sign}** — ${signTheme.surface}. `;
  text += `This is the visible expression, the part the world sees first. `;
  if (house) {
    text += `It plays out most actively in the arena of ${HOUSE_THEMES[house] || 'life'}, shaped by the influence of ${ruler}. `;
  } else {
    text += `Its energy is shaped by the influence of ${ruler}. `;
  }

  text += '\n\n';

  // Hidden layer (the deeper layer)
  if (sign === duadSign) {
    text += `Beneath the surface, the deeper layer is also ${duadSign} — a **pure, concentrated** expression with no conflicting undertone. `;
    text += `What you see is what you get, amplified and undiluted. `;
  } else {
    text += `Beneath the surface, the deeper layer runs through **${duadSign}** energy. `;
    text += `${duadTheme.hidden}. `;
    text += `This hidden current means that ${planetName} is not purely ${sign} — it carries a ${duadSign} coloring that only emerges in close relationships, under stress, or in private moments. `;
  }
  if (duadHouse) {
    text += `This deeper layer activates most strongly in matters of ${HOUSE_THEMES[duadHouse] || 'life'}, guided by ${duadRuler}. `;
  }

  text += '\n\n';

  // Deepest layer (the finest thread)
  if (duadSign === compSign && sign === compSign) {
    text += `The finest thread at the very core is also ${compSign} — every layer resonates with the same frequency. `;
    text += `This is an extraordinarily concentrated placement with no internal contradiction. The gift of ${compTheme.gift} runs through every fiber.`;
  } else if (duadSign === compSign) {
    text += `The finest thread at the core also flows through ${compSign}, reinforcing the deeper layer. `;
    text += `${compTheme.deepest}. `;
    text += `Together, the hidden current and the lived expression speak with one voice, making the ${compSign} influence powerfully felt even when the ${sign} surface seems dominant.`;
  } else {
    text += `At the very deepest level, the finest thread connects to **${compSign}** — ${compTheme.deepest}. `;
    text += `This is the part that only surfaces in moments of intensity, vulnerability, or complete authenticity. `;
    text += `It is the lived expression that emerges when all masks are removed.`;
  }
  if (compHouse) {
    text += ` It expresses most clearly through ${HOUSE_THEMES[compHouse] || 'life'}, under the guidance of ${compRuler}.`;
  }

  text += '\n\n';

  // Summary
  text += `**The full picture:** ${sign} on the surface (ruled by ${ruler}), ${duadSign} as the hidden current (ruled by ${duadRuler}), and ${compSign} as the finest thread (ruled by ${compRuler}).`;

  return text;
}

/**
 * Full interpretation from a longitude — convenience wrapper.
 */
export function interpretDuadCompendium(
  planetName: string,
  longitude: number,
  ascSign?: string,
  firstName?: string,
): string {
  const dc = getFullDuadCompendium(longitude, ascSign);
  return getDuadInterpretation(
    planetName,
    dc.sign,
    dc.duadSign,
    dc.compendiumSign,
    ascSign ? getHouseForSign(dc.sign, ascSign) : undefined,
    dc.duadHouse ?? undefined,
    dc.compendiumHouse ?? undefined,
  );
}

/**
 * Short version for use in transit readings, synastry, etc.
 * Returns 1-2 sentences weaving in the deeper layers.
 */
export function shortDuadInsight(
  planetName: string,
  longitude: number,
  ascSign?: string,
): string {
  const dc = getFullDuadCompendium(longitude, ascSign);

  if (dc.sign === dc.duadSign && dc.sign === dc.compendiumSign) {
    return `${planetName} is powerfully concentrated in ${dc.sign} energy at every layer — surface, hidden current, and finest thread. This is a pure, undiluted expression.`;
  }

  let text = `${planetName} in ${dc.sign} carries a hidden ${dc.duadSign} undertone`;
  if (dc.duadHouse) text += ` (activating ${HOUSE_THEMES[dc.duadHouse]})`;
  text += ` and a core ${dc.compendiumSign} thread`;
  if (dc.compendiumHouse) text += ` (touching ${HOUSE_THEMES[dc.compendiumHouse]})`;
  text += '.';

  return text;
}

/**
 * Get the deeper-layer insight for a transit interaction.
 */
export function transitDuadInsight(
  transitPlanet: string,
  transitLon: number,
  natalPlanet: string,
  natalLon: number,
  ascSign?: string,
): string {
  const tdc = getFullDuadCompendium(transitLon, ascSign);
  const ndc = getFullDuadCompendium(natalLon, ascSign);

  let text = `The transiting ${transitPlanet} in ${tdc.sign} carries a hidden ${tdc.duadSign} frequency that is interacting with your natal ${natalPlanet}'s deeper ${ndc.duadSign} layer. `;

  if (tdc.duadSign === ndc.sign || tdc.sign === ndc.duadSign) {
    text += `There is a deep resonance here — the hidden current of the transit directly echoes your natal placement, making this transit feel more personal and fated than it appears on the surface. `;
  }

  if (tdc.compendiumSign === ndc.compendiumSign) {
    text += `At the deepest level, both the transit and your natal placement share the same finest thread (${tdc.compendiumSign}), which means this cycle touches something fundamental in your psyche. `;
  }

  return text;
}

/**
 * Synastry deeper-layer insight — how two people's hidden layers interact.
 */
export function synastryDuadInsight(
  planet1: string,
  lon1: number,
  planet2: string,
  lon2: number,
  person1Name?: string,
  person2Name?: string,
): string {
  const dc1 = getFullDuadCompendium(lon1);
  const dc2 = getFullDuadCompendium(lon2);
  const name1 = person1Name || 'Person 1';
  const name2 = person2Name || 'Person 2';

  let text = '';

  if (dc1.duadSign === dc2.sign || dc2.duadSign === dc1.sign) {
    text += `There is a hidden magnetic pull between ${name1}'s ${planet1} and ${name2}'s ${planet2} — the deeper layer of one directly resonates with the surface of the other. This creates an unconscious attraction that neither person can fully explain but both can feel. `;
  }

  if (dc1.duadSign === dc2.duadSign) {
    text += `${name1} and ${name2} share the same hidden psychological undertone (${dc1.duadSign}) in these placements, which means they understand each other at a level that goes beyond what is visible. `;
  }

  if (dc1.compendiumSign === dc2.compendiumSign) {
    text += `At the very deepest layer, both ${name1}'s ${planet1} and ${name2}'s ${planet2} share a ${dc1.compendiumSign} core thread — this is a soul-level connection that surfaces during the most intimate or vulnerable moments. `;
  }

  if (!text) {
    text += `${name1}'s ${planet1} in ${dc1.sign} (with a hidden ${dc1.duadSign} layer) interacts with ${name2}'s ${planet2} in ${dc2.sign} (with a hidden ${dc2.duadSign} layer). The surface connection is what brought them together, but the deeper layers determine whether the bond deepens or fades over time. `;
  }

  return text;
}

// Export everything
export {
  SIGNS,
  RULERS,
  SIGN_THEMES,
  HOUSE_THEMES,
};
