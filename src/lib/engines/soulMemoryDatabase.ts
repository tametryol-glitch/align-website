/**
 * SOUL MEMORY DATABASE (Past Lives Decoder)
 * --------------------------------------------------------------
 * Source data for the Soul Memory Engine. Five interlocking
 * datasets:
 *
 *   1. ARCHETYPES   — 16 past-life signatures (Temple Astrologer,
 *                     Warrior Commander, Sacred Healer, etc.) with
 *                     hero / shadow descriptions, soul gifts, karma
 *                     themes, current-life mission, and weighted
 *                     astrological indicators.
 *   2. ERAS         — 7 historical eras with planetary signatures.
 *   3. REGIONS      — 13 world regions with sign + element + fixed
 *                     star symbolism.
 *   4. STAR MEMORY  — 7 off-world signatures (Pleiadian, Sirian, …)
 *                     scored conservatively; high threshold to surface.
 *   5. FIXED STARS  — 15 karmically-loaded fixed stars used by the
 *                     archetype scorer; J2000 ecliptic longitudes.
 *
 * Tone rule: cinematic, specific, premium. Never "you may have been
 * a teacher." Always "you carry unmistakable echoes of …".
 * --------------------------------------------------------------
 */

// ─── Indicator DSL ──────────────────────────────────────────────

export type AspectKind = 'conj' | 'opp' | 'trine' | 'square' | 'sextile' | 'quincunx';
export type AngleKind = 'ASC' | 'MC' | 'IC' | 'DSC';
export type ElementKind = 'fire' | 'earth' | 'air' | 'water';

/**
 * Soul Memory indicator. Engine evaluates each against the chart and
 * sums weighted matches. Tight orb (≤1°) on Sun/Moon/ASC/MC/IC/DSC
 * gets a ×1.5 anchor boost; midpoint indicators max at 3° orb per
 * spec ("Tier 2 Midpoint Engine — only conjunctions and oppositions,
 * max 3°").
 */
export type SMIndicator =
  // Tier 1 — direct natal placements
  | { k: 'snSign'; s: string; w: number }
  | { k: 'snHouse'; h: number; w: number }
  | { k: 'snAspect'; target: string; a: AspectKind; w: number }
  | { k: 'planetInSign'; p: string; s: string; w: number }
  | { k: 'planetInHouse'; p: string; h: number; w: number }
  | { k: 'aspect'; p1: string; p2: string; a: AspectKind; w: number }
  | { k: 'onAngle'; body: string; angle: AngleKind; w: number }
  | { k: 'asteroid'; aster: string; target: string; asp?: AspectKind; w: number }
  | { k: 'houseFocus'; h: number; min: number; w: number }
  | { k: 'signFocus'; s: string; min: number; w: number }
  | { k: 'elementBalance'; element: ElementKind; min: number; w: number }
  | { k: 'retro'; p: string; w: number }
  // Tier 2 — Midpoint engine: SN/X = target, conj or opp only, ≤3°
  | { k: 'snMidpt'; x: string; target: string; a: 'conj' | 'opp'; w: number }
  // Custom Align layers
  | { k: 'duadSign'; body: string; s: string; w: number }
  | { k: 'compendiumSign'; body: string; s: string; w: number }
  // Fixed star contact (orb default 1°)
  | { k: 'fixedStar'; body: string; star: string; w: number; orb?: number };

// ─── Archetype shape ────────────────────────────────────────────

export interface RelationshipKarma {
  theme: string;          // e.g. "Returning Spouses", "Unfinished Family Contracts"
  description: string;    // 1-2 sentences, specific
}

export interface Archetype {
  id: string;
  name: string;          // public display name
  shadowName: string;    // shadow-lifetime variant name
  /** Cinematic hero-narrative for the past life. 3-4 sentences. */
  heroDescription: string;
  /** Where this lifetime went wrong / shadow expression. 2-3 sentences. */
  shadowDescription: string;
  /** Soul gifts carried forward. 4-6 specific items. */
  soulGifts: string[];
  /** Returning karma pattern. */
  relationshipKarma: RelationshipKarma;
  /** Current life mission — how to evolve beyond the old pattern. */
  currentMission: string;
  /** Indicators that contribute to score. */
  indicators: SMIndicator[];
}

// ─── 16 Archetypes ──────────────────────────────────────────────

export const ARCHETYPES: Archetype[] = [

  {
    id: 'templeAstrologer',
    name: 'Temple Astrologer / Sacred Advisor',
    shadowName: 'The Court Soothsayer Who Sold Truth',
    heroDescription:
      'You carry unmistakable echoes of a former life centered on wisdom, timing, and guiding others through hidden knowledge. ' +
      'You worked within a spiritual, royal, or ceremonial setting where insight carried status — reading stars, interpreting omens, and counseling those who held power. ' +
      'Knowing what others could not see was your currency, and discretion was the price of your position.',
    shadowDescription:
      'In the shadow turn of this lifetime you may have used knowledge to manipulate, withholding truth from those who needed it or telling rulers what they wanted to hear instead of what was so. ' +
      'The temple may have demanded silence about prophecies that could have changed the course of nations.',
    soulGifts: ['Pattern recognition', 'Prophetic intuition', 'Symbolic literacy', 'Counsel under pressure', 'Discretion', 'Astrology talent'],
    relationshipKarma: {
      theme: 'Returning Students and Skeptics',
      description:
        'Souls you once advised, taught, or hid truth from arrive in this life as students, clients, or doubters who challenge you to either teach openly now or repeat the old pattern of hoarding insight.',
    },
    currentMission:
      'Use wisdom openly. What was once hidden behind temple walls must become visible — write, teach, publish. The discretion that protected you then now isolates you. Speak.',
    indicators: [
      // South Node markers (past-life astrologer placements)
      { k: 'snSign', s: 'Aquarius', w: 16 },
      { k: 'snSign', s: 'Sagittarius', w: 12 },
      { k: 'snHouse', h: 9, w: 18 },
      { k: 'snHouse', h: 11, w: 14 },
      // Direct Mercury–Uranus contact (the classical astrologer mind)
      { k: 'aspect', p1: 'Mercury', p2: 'Uranus', a: 'conj', w: 14 },
      { k: 'aspect', p1: 'Mercury', p2: 'Uranus', a: 'opp', w: 10 },
      { k: 'aspect', p1: 'Mercury', p2: 'Uranus', a: 'trine', w: 10 },
      { k: 'aspect', p1: 'Mercury', p2: 'Uranus', a: 'sextile', w: 8 },
      { k: 'aspect', p1: 'Mercury', p2: 'Neptune', a: 'trine', w: 10 },
      // Sun–Uranus also produces astrological mind
      { k: 'aspect', p1: 'Sun', p2: 'Uranus', a: 'conj', w: 12 },
      { k: 'aspect', p1: 'Sun', p2: 'Uranus', a: 'trine', w: 8 },
      // Urania (Angel #11911) — the astrology asteroid
      { k: 'asteroid', aster: 'Urania', target: 'Mercury', w: 18 },
      { k: 'asteroid', aster: 'Urania', target: 'Sun', w: 16 },
      { k: 'asteroid', aster: 'Urania', target: 'Moon', w: 12 },
      { k: 'asteroid', aster: 'Urania', target: 'ASC', w: 16 },
      { k: 'asteroid', aster: 'Urania', target: 'MC', w: 14 },
      { k: 'asteroid', aster: 'Urania', target: 'Jupiter', w: 16 },  // philosophical astrologer
      { k: 'asteroid', aster: 'Urania', target: 'Saturn', w: 12 },   // disciplined astrologer
      // Pallas — pattern recognition, key astrologer signature
      { k: 'asteroid', aster: 'Pallas', target: 'Mercury', w: 12 },
      { k: 'asteroid', aster: 'Pallas', target: 'Sun', w: 10 },
      // Aquarius emphasis (the sign of astrology itself)
      { k: 'planetInSign', p: 'Mercury', s: 'Aquarius', w: 12 },
      { k: 'planetInSign', p: 'Sun', s: 'Aquarius', w: 8 },
      { k: 'planetInSign', p: 'Mercury', s: 'Sagittarius', w: 8 },
      // signOnAngle isn't in the Soul Memory DSL — use planetInSign on
      // ASC/MC bodies instead. The "Ascendant" body's longitude IS its
      // sign by definition, so this fires when Aquarius rises.
      { k: 'planetInSign', p: 'Ascendant', s: 'Aquarius', w: 10 },
      { k: 'planetInSign', p: 'MC', s: 'Aquarius', w: 10 },
      // 9th and 11th house emphasis (esoteric knowledge / community wisdom)
      { k: 'planetInHouse', p: 'Mercury', h: 9, w: 12 },
      { k: 'planetInHouse', p: 'Mercury', h: 11, w: 10 },
      { k: 'planetInHouse', p: 'Saturn', h: 9, w: 10 },
      { k: 'planetInHouse', p: 'Uranus', h: 9, w: 12 },
      { k: 'planetInHouse', p: 'Jupiter', h: 9, w: 10 },
      { k: 'planetInHouse', p: 'Sun', h: 9, w: 8 },
      // Tightened to min:3 — a genuine astrologer chart typically has a
      // 9th/11th-house stellium, not just any 2 bodies. With min:2 the
      // indicator fired on charts with random Pluto+Uranus in 9th
      // (warrior/depth signature, not astrologer).
      { k: 'houseFocus', h: 9, min: 3, w: 10 },
      { k: 'houseFocus', h: 11, min: 3, w: 8 },
      // SN-midpoint engine — key signatures from past-life astrologer config
      { k: 'snMidpt', x: 'Mercury', target: 'Uranus', a: 'conj', w: 16 },
      { k: 'snMidpt', x: 'Saturn', target: 'Neptune', a: 'conj', w: 12 },
      { k: 'snMidpt', x: 'Mercury', target: 'Sun', a: 'conj', w: 10 },
      // Fixed-star contacts (astrologer-relevant stars)
      { k: 'fixedStar', body: 'Mercury', star: 'Spica', w: 12 },
      { k: 'fixedStar', body: 'Sun', star: 'Spica', w: 10 },
      // Custom Align layers — duad/compendium signatures
      { k: 'duadSign', body: 'Sun', s: 'Aquarius', w: 6 },
      { k: 'duadSign', body: 'Mercury', s: 'Aquarius', w: 6 },
    ],
  },

  {
    id: 'warriorCommander',
    name: 'Warrior Commander',
    shadowName: 'The General Who Fed His Men to the Field',
    heroDescription:
      'Your soul remembers command in armor. You led troops, decided who lived and who advanced first into the breach, and carried the weight of those decisions on the long ride home. ' +
      'Discipline, courage, and tactical reading of terrain and enemy were not learned — they were native. Other soldiers obeyed you because your authority was earned in blood, not granted by birth.',
    shadowDescription:
      'In the shadow expression of this lifetime you may have spent men recklessly, sacrificed loyalty to ambition, or carried out orders you knew were wrong. ' +
      'The trauma of those choices echoes as a deep mistrust of authority — your own and others\'.',
    soulGifts: ['Crisis leadership', 'Tactical patience', 'Physical courage', 'Strategic reading of opponents', 'Loyalty architecture', 'Combat readiness'],
    relationshipKarma: {
      theme: 'Returning Comrades and Adversaries',
      description:
        'Brothers-in-arms, betrayers, and enemies from old battles return as colleagues, business partners, and rivals. The instant familiarity — or instant aversion — is the chart settling old accounts.',
    },
    currentMission:
      'Lead without spending others. The same authority that won wars must now build, mentor, and protect rather than command and consume. Take responsibility for outcomes, not casualties.',
    indicators: [
      { k: 'snSign', s: 'Aries', w: 16 },
      { k: 'snSign', s: 'Scorpio', w: 14 },
      { k: 'snSign', s: 'Capricorn', w: 12 },
      { k: 'snHouse', h: 1, w: 14 },
      { k: 'snHouse', h: 10, w: 16 },
      { k: 'aspect', p1: 'Mars', p2: 'Saturn', a: 'conj', w: 14 },
      { k: 'aspect', p1: 'Mars', p2: 'Pluto', a: 'conj', w: 16 },
      { k: 'snAspect', target: 'Mars', a: 'conj', w: 14 },
      { k: 'snMidpt', x: 'Mars', target: 'Saturn', a: 'conj', w: 14 },
      { k: 'snMidpt', x: 'Mars', target: 'Pluto', a: 'opp', w: 12 },
      { k: 'retro', p: 'Mars', w: 8 },
      { k: 'fixedStar', body: 'Mars', star: 'Antares', w: 14 },
      { k: 'fixedStar', body: 'ASC', star: 'Aldebaran', w: 12 },
      { k: 'duadSign', body: 'Mars', s: 'Capricorn', w: 6 },
    ],
  },

  {
    id: 'sacredHealer',
    name: 'Sacred Healer',
    shadowName: 'The Healer Who Could Not Save the Last One',
    heroDescription:
      'Your soul remembers laying hands on suffering bodies. Wounds closed under your touch, fevers broke at your bedside, women survived births that should have killed them. ' +
      'You worked outside cities, often outside the law of the dominant religion — wise woman, monastic herbalist, village physician — and people walked days to find you.',
    shadowDescription:
      'In the shadow expression you may have been hunted for that gift. Burned, drowned, exiled, or forced to watch your people suffer for your knowledge. ' +
      'Or — equally possible — you took payment from those who could afford it and turned away those who could not.',
    soulGifts: ['Healing hands', 'Herbal intuition', 'Trauma-holding', 'Empathic regulation', 'Birth and death-bed steadiness', 'Diagnostic knowing'],
    relationshipKarma: {
      theme: 'Souls You Saved and Could Not Save',
      description:
        'Patients you healed return as friends and family who orbit you for steadiness. Those you lost return as the people you cannot save no matter what you do — the lesson is to release the contract, not repeat it.',
    },
    currentMission:
      'Practice the healing arts openly and at fair price. Your gift is not sin and the protection is professional — license, supervision, tradition. Stop apologizing for the medicine in your hands.',
    indicators: [
      { k: 'snSign', s: 'Pisces', w: 14 },
      { k: 'snSign', s: 'Cancer', w: 12 },
      { k: 'snSign', s: 'Virgo', w: 12 },
      { k: 'snHouse', h: 6, w: 16 },
      { k: 'snHouse', h: 12, w: 16 },
      { k: 'asteroid', aster: 'Chiron', target: 'Sun', w: 16 },
      { k: 'asteroid', aster: 'Chiron', target: 'Moon', w: 16 },
      { k: 'asteroid', aster: 'Ceres', target: 'Moon', w: 12 },
      { k: 'snMidpt', x: 'Chiron', target: 'Moon', a: 'conj', w: 14 },
      { k: 'snMidpt', x: 'Neptune', target: 'Chiron', a: 'conj', w: 12 },
      { k: 'planetInHouse', p: 'Chiron', h: 6, w: 12 },
      { k: 'planetInHouse', p: 'Chiron', h: 12, w: 12 },
      { k: 'aspect', p1: 'Moon', p2: 'Neptune', a: 'conj', w: 10 },
      { k: 'compendiumSign', body: 'Moon', s: 'Pisces', w: 6 },
    ],
  },

  {
    id: 'nobleRoyal',
    name: 'Noble / Royal Figure',
    shadowName: 'The Tyrant Whose Throne Was Built on Famine',
    heroDescription:
      'You carry the bearing of one who held rank. Court, lineage, formal authority — your soul remembers banquet halls, the weight of inherited duty, the lonely calculation of statecraft. ' +
      'You knew which servants were loyal and which had been planted, which marriages would secure peace and which alliances would collapse within a generation.',
    shadowDescription:
      'The shadow turn: you may have held power while subjects starved, signed warrants for executions you did not personally witness, or married for politics and condemned someone else to your bedroom. ' +
      'The privilege came with a price you continue to pay.',
    soulGifts: ['Command presence', 'Strategic foresight', 'Political reading', 'Formal composure', 'Bearing under pressure', 'Long-game patience'],
    relationshipKarma: {
      theme: 'Court Returners',
      description:
        'Allies, rivals, servants, and the spouse you did not choose return as colleagues, employees, and partners. The hierarchies you wielded then cluster around you again — the test is whether you wield them differently this time.',
    },
    currentMission:
      'Use your authority for the people who actually need it. Build organizations, lead teams, hold space for the marginalized — not to redeem yourself but to channel the bearing into service rather than dominion.',
    indicators: [
      { k: 'snSign', s: 'Leo', w: 16 },
      { k: 'snSign', s: 'Capricorn', w: 14 },
      { k: 'snHouse', h: 10, w: 18 },
      { k: 'onAngle', body: 'Sun', angle: 'MC', w: 16 },
      { k: 'aspect', p1: 'Sun', p2: 'Saturn', a: 'conj', w: 12 },
      { k: 'snMidpt', x: 'Sun', target: 'Saturn', a: 'conj', w: 14 },
      { k: 'snMidpt', x: 'Sun', target: 'MC', a: 'conj', w: 16 },
      { k: 'fixedStar', body: 'Sun', star: 'Regulus', w: 18 },
      { k: 'fixedStar', body: 'MC', star: 'Regulus', w: 16 },
      { k: 'planetInHouse', p: 'Saturn', h: 10, w: 10 },
      { k: 'duadSign', body: 'MC', s: 'Capricorn', w: 6 },
    ],
  },

  {
    id: 'exiledMystic',
    name: 'Exiled Mystic',
    shadowName: 'The Hermit Who Forgot the World Existed',
    heroDescription:
      'You remember solitude that was not punishment but vocation. A cave, a desert cell, a forest hermitage, a monastery on a windswept island — you withdrew from the world to seek what could not be found inside it. ' +
      'Visions came. Languages of unseen beings became fluent. The veil between worlds thinned around your discipline.',
    shadowDescription:
      'In the shadow expression you may have been driven to that solitude — exiled by inquisition, fled from a marriage, hunted for what you knew. ' +
      'Or you became so dissolved into the unseen that the human world lost its claim on you, and you abandoned obligations to the living who needed you.',
    soulGifts: ['Mystical perception', 'Sustained meditation', 'Channeling clarity', 'Dream literacy', 'Solitude tolerance', 'Threshold work'],
    relationshipKarma: {
      theme: 'The Ones You Left Behind',
      description:
        'Family members and lovers you abandoned for the inner work return as people who pull on your time, demand your attention, and make withdrawal feel selfish. Integration — not refusal — is the lesson.',
    },
    currentMission:
      'Bring the visions back into the world. The mystic who hides her gift commits a kind of theft. Translate, write, embody — and stay in relationship while doing it.',
    indicators: [
      { k: 'snSign', s: 'Pisces', w: 16 },
      { k: 'snHouse', h: 12, w: 18 },
      { k: 'snAspect', target: 'Neptune', a: 'conj', w: 14 },
      { k: 'aspect', p1: 'Saturn', p2: 'Neptune', a: 'conj', w: 14 },
      { k: 'aspect', p1: 'Sun', p2: 'Neptune', a: 'square', w: 10 },
      { k: 'snMidpt', x: 'Saturn', target: 'Neptune', a: 'conj', w: 14 },
      { k: 'snMidpt', x: 'Neptune', target: 'Pluto', a: 'opp', w: 12 },
      { k: 'planetInHouse', p: 'Neptune', h: 12, w: 14 },
      { k: 'houseFocus', h: 12, min: 2, w: 12 },
      { k: 'fixedStar', body: 'Sun', star: 'Fomalhaut', w: 12 },
      { k: 'duadSign', body: 'SN', s: 'Pisces', w: 6 },
    ],
  },

  {
    id: 'merchantTraveler',
    name: 'Merchant Traveler',
    shadowName: 'The Trader Who Ran from Every Home',
    heroDescription:
      'Your soul remembers caravans, port cities, and languages picked up across the sea. Spice routes, silk roads, harbor markets — you moved goods between worlds and learned each world\'s names for the same things. ' +
      'You knew exchange rates, the etiquette of three courts, and the specific bribes that opened the right gates. Home was a series of inns.',
    shadowDescription:
      'In the shadow you may have run from settled life because settling required vulnerability you could not afford. ' +
      'Or you cheated those who trusted you in foreign markets, knowing they could not pursue you across the next border.',
    soulGifts: ['Adaptive intelligence', 'Cross-cultural fluency', 'Negotiation instinct', 'Pricing sense', 'Linguistic acquisition speed', 'Travel readiness'],
    relationshipKarma: {
      theme: 'Friends in Every Port',
      description:
        'Easy connections form anywhere you go — and dissolve when you leave. The lesson is to choose one or two and let depth replace breadth.',
    },
    currentMission:
      'Stop running. Build something rooted. The lateral mobility is the gift; the inability to commit is the wound. Pick one place, one work, one community — and stay long enough that depth happens.',
    indicators: [
      { k: 'snSign', s: 'Gemini', w: 14 },
      { k: 'snSign', s: 'Sagittarius', w: 14 },
      { k: 'snHouse', h: 3, w: 12 },
      { k: 'snHouse', h: 9, w: 14 },
      { k: 'aspect', p1: 'Mercury', p2: 'Jupiter', a: 'conj', w: 12 },
      { k: 'snMidpt', x: 'Mercury', target: 'Jupiter', a: 'conj', w: 12 },
      { k: 'snMidpt', x: 'Mercury', target: 'Venus', a: 'conj', w: 10 },
      { k: 'planetInHouse', p: 'Jupiter', h: 9, w: 8 },
      { k: 'planetInHouse', p: 'Mercury', h: 3, w: 8 },
      { k: 'duadSign', body: 'Mercury', s: 'Gemini', w: 6 },
    ],
  },

  {
    id: 'scholarScribe',
    name: 'Scholar / Scribe',
    shadowName: 'The Archivist Who Burned the Wrong Records',
    heroDescription:
      'Your soul remembers stylus, parchment, and the silence of libraries. You copied, translated, indexed, glossed — preserving what would otherwise have been lost. ' +
      'You may have served a court, an abbey, an academy of stargazers. The smell of vellum and oil-lamp smoke remains familiar in this lifetime.',
    shadowDescription:
      'In the shadow you may have edited what you transcribed, chose which texts survived and which were destroyed, or hoarded knowledge from those who needed it for political reasons. ' +
      'The pen wrote history, and you knew it.',
    soulGifts: ['Encyclopedic memory', 'Linguistic precision', 'Research methodology', 'Indexing instinct', 'Historical perspective', 'Mental endurance'],
    relationshipKarma: {
      theme: 'Returning Students',
      description:
        'Those who relied on what you preserved — or were denied what you destroyed — return as readers, students, and collaborators. The library is now public; the discrimination is gone.',
    },
    currentMission:
      'Write your own work, not only annotate others\'. The scribe who never authored is the one most haunted now. Publish.',
    indicators: [
      { k: 'snSign', s: 'Virgo', w: 14 },
      { k: 'snSign', s: 'Gemini', w: 12 },
      { k: 'snHouse', h: 3, w: 14 },
      { k: 'snHouse', h: 9, w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Saturn', a: 'conj', w: 14 },
      { k: 'snAspect', target: 'Mercury', a: 'conj', w: 12 },
      { k: 'snMidpt', x: 'Mercury', target: 'Saturn', a: 'conj', w: 14 },
      { k: 'asteroid', aster: 'Pallas', target: 'Mercury', w: 12 },
      { k: 'planetInHouse', p: 'Mercury', h: 9, w: 8 },
      { k: 'compendiumSign', body: 'Mercury', s: 'Virgo', w: 6 },
    ],
  },

  {
    id: 'forbiddenLover',
    name: 'Forbidden Lover',
    shadowName: 'The One Who Burned Their Own House Down',
    heroDescription:
      'Your soul remembers a love that crossed a line — class, religion, marriage already in place, gender forbidden in that century, family feud. ' +
      'The intensity of it bent the course of two lives, and possibly the lives of children, allies, and rivals around you. You did not survive it cleanly. Either of you.',
    shadowDescription:
      'In the shadow expression the secrecy curdled into possessiveness, jealousy, or cruelty. ' +
      'You may have ended the affair by destroying the lover, or been destroyed yourself when discovered. Honor killings, duels, exile, suicide — the shape of the ending lives in the chart.',
    soulGifts: ['Erotic depth', 'Loyal intensity', 'Sensual presence', 'Capacity for grand emotion', 'Magnetic physicality', 'Survival of betrayal'],
    relationshipKarma: {
      theme: 'The Beloved Who Returns',
      description:
        'A specific soul — recognizable on first meeting, instantly intense — returns. The lesson is whether you can love them in daylight this time or repeat the pattern of secrecy and ruin.',
    },
    currentMission:
      'Choose a love that you can stand in publicly. The forbidden-ness was the era\'s problem, not your soul\'s requirement. Boring, public, devotional, daylight love is the evolution.',
    indicators: [
      { k: 'snSign', s: 'Scorpio', w: 14 },
      { k: 'snSign', s: 'Taurus', w: 12 },
      { k: 'snHouse', h: 8, w: 16 },
      { k: 'snHouse', h: 5, w: 12 },
      { k: 'aspect', p1: 'Venus', p2: 'Pluto', a: 'conj', w: 14 },
      { k: 'asteroid', aster: 'Eros', target: 'Sun', w: 14 },
      { k: 'asteroid', aster: 'Eros', target: 'Moon', w: 12 },
      { k: 'asteroid', aster: 'Lilith', target: 'Venus', w: 12 },
      { k: 'snMidpt', x: 'Venus', target: 'Pluto', a: 'conj', w: 14 },
      { k: 'snMidpt', x: 'Venus', target: 'Mars', a: 'conj', w: 10 },
      { k: 'planetInHouse', p: 'Pluto', h: 8, w: 10 },
      { k: 'compendiumSign', body: 'Venus', s: 'Scorpio', w: 6 },
    ],
  },

  {
    id: 'midwifeCaretaker',
    name: 'Midwife / Caretaker',
    shadowName: 'The One Who Lost Too Many to Continue',
    heroDescription:
      'Your soul remembers candles, hot water, and the sounds of pain that announce new life. You attended births, sat with the dying, fed the orphaned, kept the house running through plagues. ' +
      'The work was constant and unglamorous, but the village knew that you were the one who came when something was wrong.',
    shadowDescription:
      'In the shadow you may have lost a birth or a child whose death you blamed on yourself for the rest of that life. ' +
      'Or you took on so much that nothing remained for your own children, who grew up resenting your obligations to others.',
    soulGifts: ['Emotional steadiness in crisis', 'Body literacy', 'Nurturance without resentment', 'Threshold composure', 'Practical herbal knowing', 'Sustained service'],
    relationshipKarma: {
      theme: 'The Children You Carried Through',
      description:
        'Souls you delivered, fed, raised, or buried return as the people who keep showing up needing you. The lesson now is whether you can give without disappearing into the giving.',
    },
    currentMission:
      'Take care of your own life with the same diligence you give others. The caretaker who never receives care is finishing an old contract — that contract is over now.',
    indicators: [
      { k: 'snSign', s: 'Cancer', w: 14 },
      { k: 'snSign', s: 'Virgo', w: 12 },
      { k: 'snHouse', h: 4, w: 14 },
      { k: 'snHouse', h: 6, w: 14 },
      { k: 'asteroid', aster: 'Ceres', target: 'Moon', w: 16 },
      { k: 'asteroid', aster: 'Ceres', target: 'Sun', w: 12 },
      { k: 'snMidpt', x: 'Ceres', target: 'Moon', a: 'conj', w: 12 },
      { k: 'aspect', p1: 'Moon', p2: 'Saturn', a: 'sextile', w: 8 },
      { k: 'planetInHouse', p: 'Moon', h: 4, w: 10 },
      { k: 'planetInHouse', p: 'Moon', h: 6, w: 10 },
      { k: 'duadSign', body: 'Moon', s: 'Cancer', w: 6 },
    ],
  },

  {
    id: 'priestPriestess',
    name: 'Priest / Priestess',
    shadowName: 'The Celibate Who Despised the Body',
    heroDescription:
      'You served at altar, shrine, or temple. Vows shaped your days — silence, fasting, sexual abstention or sacred sexuality, isolation, devotion. ' +
      'Ordinary people brought their dead, their unborn, their unspeakable to you, and you held the space because the work required someone whose life was given to it.',
    shadowDescription:
      'In the shadow expression the discipline became hatred of the body, of pleasure, of the ordinary. ' +
      'Or — equally common — you used spiritual authority to extract what could not be freely given: confessions, wealth, sexual access. The robes hid much.',
    soulGifts: ['Ritual coherence', 'Sacred presence', 'Disciplined devotion', 'Threshold-tending', 'Liturgical fluency', 'Sustained focus'],
    relationshipKarma: {
      theme: 'Souls Who Confessed to You',
      description:
        'Those who entrusted their inner lives to you return as friends and clients who arrive with disproportionate vulnerability — sometimes with debts of trust still unsettled.',
    },
    currentMission:
      'Reclaim the body as sacred. The priest in you knows ritual; the human now must learn pleasure, food, sex, ordinary love. The integration is the work, not the renunciation.',
    indicators: [
      { k: 'snSign', s: 'Pisces', w: 14 },
      { k: 'snSign', s: 'Virgo', w: 10 },
      { k: 'snHouse', h: 9, w: 14 },
      { k: 'snHouse', h: 12, w: 14 },
      { k: 'asteroid', aster: 'Vesta', target: 'Sun', w: 16 },
      { k: 'asteroid', aster: 'Vesta', target: 'Moon', w: 12 },
      { k: 'snMidpt', x: 'Vesta', target: 'Sun', a: 'conj', w: 14 },
      { k: 'snMidpt', x: 'Saturn', target: 'Vesta', a: 'conj', w: 10 },
      { k: 'planetInHouse', p: 'Neptune', h: 9, w: 10 },
      { k: 'aspect', p1: 'Sun', p2: 'Neptune', a: 'sextile', w: 8 },
    ],
  },

  {
    id: 'revolutionaryInventor',
    name: 'Revolutionary Inventor',
    shadowName: 'The One Whose Invention Killed the Wrong People',
    heroDescription:
      'Your soul remembers the shock of seeing something nobody else could see — a mechanism, a political possibility, a re-arrangement of how humans organize. ' +
      'You may have invented, sketched, drafted, manifestoed, conspired. The work threatened established interests, and you were either celebrated or persecuted, sometimes both within the same decade.',
    shadowDescription:
      'In the shadow expression the invention had consequences you could not control — weapon, doctrine, machine, or movement that turned against the people you meant to free. ' +
      'You may have been forced to watch your work weaponized.',
    soulGifts: ['Original vision', 'System thinking', 'Risk tolerance', 'Engineering instinct', 'Movement-organizing', 'Disruptive courage'],
    relationshipKarma: {
      theme: 'Comrades and Saboteurs',
      description:
        'Co-conspirators and those who later turned on you return as collaborators, employees, and rivals. The chart is sorting who can be trusted with what scope this time.',
    },
    currentMission:
      'Build the next thing. The visionary instinct is real; the lesson is to build with safeguards this time — ethics frameworks, peer review, allies who will tell you no.',
    indicators: [
      { k: 'snSign', s: 'Aquarius', w: 16 },
      { k: 'snHouse', h: 11, w: 16 },
      { k: 'snAspect', target: 'Uranus', a: 'conj', w: 14 },
      { k: 'aspect', p1: 'Mercury', p2: 'Uranus', a: 'conj', w: 12 },
      { k: 'aspect', p1: 'Sun', p2: 'Uranus', a: 'conj', w: 12 },
      { k: 'snMidpt', x: 'Uranus', target: 'Pluto', a: 'conj', w: 14 },
      { k: 'snMidpt', x: 'Mercury', target: 'Uranus', a: 'opp', w: 10 },
      { k: 'planetInHouse', p: 'Uranus', h: 11, w: 10 },
      { k: 'planetInHouse', p: 'Uranus', h: 1, w: 8 },
    ],
  },

  {
    id: 'occultInitiate',
    name: 'Occult Initiate',
    shadowName: 'The Adept Who Bargained with Things That Should Not Be Bargained With',
    heroDescription:
      'You stood in circles drawn in salt or chalk, pronounced names that the dominant religion considered illegal, and crossed thresholds most people do not return from. ' +
      'You worked esoteric tradition — Hermetic, Tantric, alchemical, shamanic, qabalistic — at a depth that required teachers, lineage, and decades of practice.',
    shadowDescription:
      'In the shadow turn you may have used the work for personal power, harmed others through curse work, or made commitments to forces you did not fully understand. ' +
      'Some of those contracts may still be running.',
    soulGifts: ['Depth perception', 'Ritual technology', 'Symbol fluency', 'Energetic boundary work', 'Shadow integration', 'Threshold authority'],
    relationshipKarma: {
      theme: 'Initiates and Adversaries',
      description:
        'Those you taught and those you fought in the unseen return as students who seek you out and rivals who feel inexplicably antagonistic. Old contracts in the subtle realm clear in this incarnation.',
    },
    currentMission:
      'Practice with ethics, lineage, and supervision. The work is real; freelance occultism in this life is the trap. Find the tradition, do the years, and serve.',
    indicators: [
      { k: 'snSign', s: 'Scorpio', w: 16 },
      { k: 'snHouse', h: 8, w: 16 },
      { k: 'snHouse', h: 12, w: 12 },
      { k: 'snAspect', target: 'Pluto', a: 'conj', w: 14 },
      { k: 'asteroid', aster: 'Lilith', target: 'Sun', w: 14 },
      { k: 'asteroid', aster: 'Lilith', target: 'Moon', w: 12 },
      { k: 'snMidpt', x: 'Pluto', target: 'Neptune', a: 'conj', w: 12 },
      { k: 'snMidpt', x: 'Saturn', target: 'Pluto', a: 'conj', w: 12 },
      { k: 'planetInHouse', p: 'Pluto', h: 8, w: 10 },
      { k: 'planetInHouse', p: 'Pluto', h: 12, w: 10 },
      { k: 'compendiumSign', body: 'SN', s: 'Scorpio', w: 6 },
    ],
  },

  {
    id: 'seaTraveler',
    name: 'Sea Traveler / Navigator',
    shadowName: 'The Captain Who Lost the Crew',
    heroDescription:
      'Your soul knows decks, sails, the way constellations rotate over a long ocean voyage, and the discipline of a ship\'s rationing. ' +
      'You navigated by stars, currents, and instinct refined across years. Coastal cultures, port cities, and island nations are familiar in your bones.',
    shadowDescription:
      'In the shadow expression you may have lost a ship or a fleet, or trafficked in cargoes that included human beings, or fled responsibility on land by going to sea each time it caught up to you.',
    soulGifts: ['Spatial / navigational sense', 'Long-arc patience', 'Weather-reading instinct', 'Crisis composure at sea', 'Multilingual practical fluency', 'Adventure tolerance'],
    relationshipKarma: {
      theme: 'Crew and Ports',
      description:
        'Old crewmates and lovers in distant ports return as colleagues who feel like family on first meeting. The lesson is to choose one harbor and stay docked.',
    },
    currentMission:
      'Anchor. The ocean is metaphorical now; the discipline of staying with one project, one partner, one body is the new voyage.',
    indicators: [
      { k: 'snSign', s: 'Pisces', w: 14 },
      { k: 'snSign', s: 'Cancer', w: 12 },
      { k: 'snHouse', h: 9, w: 12 },
      { k: 'snHouse', h: 12, w: 10 },
      { k: 'aspect', p1: 'Moon', p2: 'Neptune', a: 'conj', w: 12 },
      { k: 'snMidpt', x: 'Moon', target: 'Neptune', a: 'conj', w: 12 },
      { k: 'snMidpt', x: 'Mercury', target: 'Neptune', a: 'conj', w: 10 },
      { k: 'planetInHouse', p: 'Neptune', h: 9, w: 10 },
      { k: 'fixedStar', body: 'Mercury', star: 'Canopus', w: 12 },
      { k: 'elementBalance', element: 'water', min: 4, w: 8 },
    ],
  },

  {
    id: 'judgeLaw',
    name: 'Judge / Law Figure',
    shadowName: 'The Judge Who Sold a Verdict',
    heroDescription:
      'You sat on benches, signed decrees, mediated feuds, presided over inheritance disputes that determined who would eat for the next generation. ' +
      'Your soul remembers the weight of decisions that affected people who would never know your name.',
    shadowDescription:
      'In the shadow expression you traded justice for influence, ruled in favor of those who paid, or convicted the innocent because the alternative threatened your standing.',
    soulGifts: ['Discernment under pressure', 'Procedural rigor', 'Argument structure', 'Pattern-detection in deception', 'Composure', 'Ethics as muscle memory'],
    relationshipKarma: {
      theme: 'Petitioners and the Wrongly Judged',
      description:
        'Those whose cases you decided — fairly or otherwise — return as people who arrive in your life with disputes, decisions, and conflicts that put your judgment to the test again.',
    },
    currentMission:
      'Use your discernment for collective benefit, not personal advancement. Lawyer, mediator, ethics committee — the structures exist; serve them.',
    indicators: [
      { k: 'snSign', s: 'Libra', w: 14 },
      { k: 'snSign', s: 'Sagittarius', w: 12 },
      { k: 'snSign', s: 'Capricorn', w: 10 },
      { k: 'snHouse', h: 7, w: 12 },
      { k: 'snHouse', h: 9, w: 14 },
      { k: 'snHouse', h: 10, w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Jupiter', a: 'conj', w: 10 },
      { k: 'aspect', p1: 'Jupiter', p2: 'Saturn', a: 'conj', w: 10 },
      { k: 'snMidpt', x: 'Jupiter', target: 'Saturn', a: 'conj', w: 12 },
      { k: 'asteroid', aster: 'Pallas', target: 'Jupiter', w: 10 },
      { k: 'planetInHouse', p: 'Jupiter', h: 9, w: 8 },
    ],
  },

  {
    id: 'artistPerformer',
    name: 'Artist / Performer',
    shadowName: 'The Genius Who Burned Through Lovers and Patrons',
    heroDescription:
      'Your soul remembers stage, easel, instrument, page. You were paid to make beauty and you knew you were good. Patrons fought to associate with you; rivals studied your technique. ' +
      'The work was play and discipline simultaneously, and you found the ordinary world flat by comparison.',
    shadowDescription:
      'In the shadow expression the gift consumed the rest of your life. You burned through patrons, lovers, family, your own health — addicted to the highs of creation and incapable of the ordinary maintenance of a life.',
    soulGifts: ['Sensory acuity', 'Compositional instinct', 'Stage-presence', 'Original voice', 'Aesthetic discrimination', 'Performative endurance'],
    relationshipKarma: {
      theme: 'Muses and Patrons',
      description:
        'Lovers, sponsors, and collaborators from past creative lives return as the people who fund, inspire, or compete with your work now. The pattern of consuming them or being consumed is the test.',
    },
    currentMission:
      'Make the work AND maintain the life. Talent is not exemption from the ordinary contracts of love, money, and care. Make and live.',
    indicators: [
      { k: 'snSign', s: 'Leo', w: 14 },
      { k: 'snSign', s: 'Pisces', w: 12 },
      { k: 'snHouse', h: 5, w: 16 },
      { k: 'aspect', p1: 'Venus', p2: 'Neptune', a: 'conj', w: 12 },
      { k: 'asteroid', aster: 'Apollo', target: 'Sun', w: 14 },
      { k: 'asteroid', aster: 'Apollo', target: 'Venus', w: 12 },
      { k: 'snMidpt', x: 'Venus', target: 'Neptune', a: 'conj', w: 12 },
      { k: 'snMidpt', x: 'Sun', target: 'Apollo', a: 'conj', w: 12 },
      { k: 'planetInHouse', p: 'Venus', h: 5, w: 10 },
      { k: 'fixedStar', body: 'Venus', star: 'Vega', w: 10 },
    ],
  },

  {
    id: 'courtIntriguer',
    name: 'Court Intriguer / Spy',
    shadowName: 'The One Who Betrayed the Throne They Served',
    heroDescription:
      'Your soul remembers passing notes through servants, learning to read what people did not say, and planting words in the ears of decision-makers. ' +
      'You moved through corridors of power without holding the public position — invisible engineering of outcomes was your craft.',
    shadowDescription:
      'In the shadow expression you may have manipulated good people into harm, sold information to the highest bidder, or brought down rulers whose only failing was that they trusted the wrong adviser.',
    soulGifts: ['Reading rooms', 'Information triangulation', 'Subtle influence', 'Cover-identity composure', 'Lie detection', 'Strategic patience'],
    relationshipKarma: {
      theme: 'Those You Misled',
      description:
        'People you used or betrayed return as colleagues and friends whose trust feels disproportionately consequential. The lesson is whether you can be useful without being deceptive this time.',
    },
    currentMission:
      'Use your reading of people for protection, not predation. Therapy, intelligence-adjacent legal work, journalism, diplomacy — channels exist for the gift without the old shadow.',
    indicators: [
      { k: 'snSign', s: 'Scorpio', w: 14 },
      { k: 'snSign', s: 'Capricorn', w: 10 },
      { k: 'snHouse', h: 12, w: 14 },
      { k: 'snHouse', h: 8, w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Pluto', a: 'conj', w: 12 },
      { k: 'snMidpt', x: 'Mercury', target: 'Pluto', a: 'conj', w: 14 },
      { k: 'snMidpt', x: 'Mercury', target: 'Saturn', a: 'opp', w: 10 },
      { k: 'asteroid', aster: 'Pallas', target: 'Pluto', w: 10 },
      { k: 'asteroid', aster: 'Nemesis', target: 'Mercury', w: 10 },
      { k: 'planetInHouse', p: 'Pluto', h: 12, w: 10 },
    ],
  },

];

// ─── Eras ───────────────────────────────────────────────────────

export interface Era {
  id: string;
  name: string;             // public display
  range: string;            // e.g. "300 BC – 1200 AD"
  description: string;      // 1-2 sentences cinematic
  indicators: SMIndicator[];
}

export const ERAS: Era[] = [

  {
    id: 'ancient',
    name: 'Ancient Era',
    range: '3000 BC – 500 BC',
    description:
      'Bronze and early iron civilizations — Sumer, Egypt, Mycenae, Indus, Vedic, Yellow River. Temple-state structures, oral tradition shifting to written record, hard hierarchical roles, monumental architecture.',
    indicators: [
      { k: 'snSign', s: 'Capricorn', w: 8 },
      { k: 'snSign', s: 'Taurus', w: 6 },
      { k: 'snHouse', h: 4, w: 6 },
      { k: 'snHouse', h: 10, w: 8 },
      { k: 'snAspect', target: 'Saturn', a: 'conj', w: 12 },
      { k: 'snAspect', target: 'Pluto', a: 'conj', w: 12 },
      { k: 'aspect', p1: 'Saturn', p2: 'Pluto', a: 'conj', w: 8 },
      { k: 'fixedStar', body: 'Sun', star: 'Aldebaran', w: 10 },
      { k: 'fixedStar', body: 'Sun', star: 'Algol', w: 8 },
    ],
  },

  {
    id: 'classical',
    name: 'Classical Era',
    range: '500 BC – 500 AD',
    description:
      'Greek, Roman, Persian, Han, classical Maya. Philosophy formalized, codified law, slavery as institution, the rise of organized religion alongside imperial bureaucracy.',
    indicators: [
      { k: 'snSign', s: 'Leo', w: 8 },
      { k: 'snSign', s: 'Sagittarius', w: 8 },
      { k: 'snHouse', h: 9, w: 8 },
      { k: 'snHouse', h: 10, w: 8 },
      { k: 'snAspect', target: 'Jupiter', a: 'conj', w: 10 },
      { k: 'snAspect', target: 'Saturn', a: 'conj', w: 8 },
      { k: 'aspect', p1: 'Jupiter', p2: 'Saturn', a: 'conj', w: 8 },
      { k: 'fixedStar', body: 'Sun', star: 'Regulus', w: 12 },
      { k: 'fixedStar', body: 'MC', star: 'Spica', w: 8 },
    ],
  },

  {
    id: 'medieval',
    name: 'Medieval Era',
    range: '500 – 1450 AD',
    description:
      'Feudal Europe, Islamic golden age, Tang/Song China, the great medieval South Asian and African kingdoms. Monasticism, knighthood, plague, cathedral building, mystic and scholastic traditions.',
    indicators: [
      { k: 'snSign', s: 'Pisces', w: 6 },
      { k: 'snSign', s: 'Virgo', w: 6 },
      { k: 'snHouse', h: 12, w: 10 },
      { k: 'snHouse', h: 9, w: 8 },
      { k: 'snAspect', target: 'Saturn', a: 'conj', w: 10 },
      { k: 'snAspect', target: 'Jupiter', a: 'conj', w: 8 },
      { k: 'aspect', p1: 'Saturn', p2: 'Neptune', a: 'conj', w: 8 },
      { k: 'planetInHouse', p: 'Saturn', h: 12, w: 6 },
    ],
  },

  {
    id: 'renaissance',
    name: 'Renaissance Era',
    range: '1450 – 1700',
    description:
      'European rediscovery of classical texts, the printing press, exploration and colonization, scientific revolution, Mughal flowering, Ottoman peak. Beauty, brutality, and breakneck change.',
    indicators: [
      { k: 'snSign', s: 'Gemini', w: 8 },
      { k: 'snSign', s: 'Libra', w: 6 },
      { k: 'snHouse', h: 5, w: 8 },
      { k: 'snHouse', h: 3, w: 6 },
      { k: 'snAspect', target: 'Mercury', a: 'conj', w: 8 },
      { k: 'snAspect', target: 'Venus', a: 'conj', w: 6 },
      { k: 'aspect', p1: 'Mercury', p2: 'Uranus', a: 'sextile', w: 6 },
      { k: 'aspect', p1: 'Venus', p2: 'Jupiter', a: 'sextile', w: 6 },
    ],
  },

  {
    id: 'colonial',
    name: 'Colonial Era',
    range: '1700 – 1900',
    description:
      'Atlantic slave economy, Enlightenment, revolutions in America and France, Qing decline, imperial consolidation across Africa, India, the Americas, and the Pacific.',
    indicators: [
      { k: 'snSign', s: 'Sagittarius', w: 8 },
      { k: 'snSign', s: 'Aries', w: 6 },
      { k: 'snHouse', h: 9, w: 8 },
      { k: 'snAspect', target: 'Jupiter', a: 'conj', w: 8 },
      { k: 'snAspect', target: 'Mars', a: 'conj', w: 6 },
      { k: 'aspect', p1: 'Mars', p2: 'Jupiter', a: 'conj', w: 6 },
      { k: 'fixedStar', body: 'Sun', star: 'Arcturus', w: 8 },
    ],
  },

  {
    id: 'industrial',
    name: 'Industrial Era',
    range: '1850 – 1945',
    description:
      'Factories, steel, telegraph, world wars, suffrage, the rise of mass media, global migration, the brutal modernization of every traditional society in turn.',
    indicators: [
      { k: 'snSign', s: 'Aquarius', w: 8 },
      { k: 'snSign', s: 'Capricorn', w: 6 },
      { k: 'snHouse', h: 11, w: 8 },
      { k: 'snHouse', h: 6, w: 6 },
      { k: 'snAspect', target: 'Uranus', a: 'conj', w: 10 },
      { k: 'snAspect', target: 'Pluto', a: 'square', w: 8 },
      { k: 'aspect', p1: 'Uranus', p2: 'Pluto', a: 'conj', w: 8 },
    ],
  },

  {
    id: 'modern',
    name: 'Modern Era',
    range: '1945 – present',
    description:
      'Post-war reconstruction, decolonization, the information age, globalization, climate awakening, the long unfinished work of pluralism and rights.',
    indicators: [
      { k: 'snSign', s: 'Aquarius', w: 8 },
      { k: 'snSign', s: 'Pisces', w: 6 },
      { k: 'snAspect', target: 'Uranus', a: 'conj', w: 10 },
      { k: 'snAspect', target: 'Neptune', a: 'conj', w: 8 },
      { k: 'aspect', p1: 'Uranus', p2: 'Neptune', a: 'conj', w: 8 },
      { k: 'planetInHouse', p: 'Uranus', h: 11, w: 6 },
    ],
  },

];

// ─── Regions ────────────────────────────────────────────────────

export interface Region {
  id: string;
  name: string;
  description: string;
  indicators: SMIndicator[];
}

export const REGIONS: Region[] = [

  {
    id: 'mediterranean',
    name: 'Mediterranean',
    description: 'Sun-warmed coasts and olive groves — Greek, Roman, Phoenician, Sicilian, Maltese, Cypriot soul-memory. Marketplace, amphitheatre, harbor.',
    indicators: [
      { k: 'snSign', s: 'Leo', w: 6 },
      { k: 'snSign', s: 'Libra', w: 6 },
      { k: 'planetInSign', p: 'Sun', s: 'Leo', w: 6 },
      { k: 'planetInSign', p: 'Venus', s: 'Libra', w: 6 },
      { k: 'fixedStar', body: 'Sun', star: 'Regulus', w: 6 },
      { k: 'elementBalance', element: 'fire', min: 3, w: 6 },
    ],
  },

  {
    id: 'northAfrica',
    name: 'North Africa',
    description: 'Egypt, the Maghreb, Berber and Tuareg lineages, Saharan trade routes. Temple priest-craft, desert mysticism, sun-cult.',
    indicators: [
      { k: 'snSign', s: 'Capricorn', w: 6 },
      { k: 'snSign', s: 'Scorpio', w: 6 },
      { k: 'snHouse', h: 12, w: 6 },
      { k: 'planetInHouse', p: 'Pluto', h: 8, w: 6 },
      { k: 'fixedStar', body: 'Sun', star: 'Sirius', w: 8 },
      { k: 'fixedStar', body: 'MC', star: 'Sirius', w: 8 },
    ],
  },

  {
    id: 'caribbean',
    name: 'Caribbean / Atlantic Islands',
    description: 'Trade-wind nations and plantation hauntings — Cuba, Hispaniola, Jamaica, the lesser Antilles. African diasporic spiritual lineages, syncretic ritual.',
    indicators: [
      { k: 'snSign', s: 'Pisces', w: 6 },
      { k: 'snSign', s: 'Cancer', w: 6 },
      { k: 'snHouse', h: 12, w: 6 },
      { k: 'snHouse', h: 4, w: 6 },
      { k: 'elementBalance', element: 'water', min: 4, w: 8 },
      { k: 'aspect', p1: 'Moon', p2: 'Pluto', a: 'conj', w: 6 },
    ],
  },

  {
    id: 'westernEurope',
    name: 'Western Europe',
    description: 'British Isles, Frankish lands, Iberia, Italian peninsula. Cathedral, manor, court, monastery, university — the layered medieval-to-modern arc.',
    indicators: [
      { k: 'snSign', s: 'Capricorn', w: 6 },
      { k: 'snSign', s: 'Virgo', w: 4 },
      { k: 'snHouse', h: 9, w: 6 },
      { k: 'snHouse', h: 10, w: 6 },
      { k: 'planetInHouse', p: 'Saturn', h: 10, w: 6 },
    ],
  },

  {
    id: 'easternEurope',
    name: 'Eastern Europe / Slavic Lands',
    description: 'Steppe edges, Orthodox icon-tradition, Russian, Polish, Balkan, Baltic memory. Long winters, dense folkloric magic, traumatic history.',
    indicators: [
      { k: 'snSign', s: 'Capricorn', w: 6 },
      { k: 'snSign', s: 'Scorpio', w: 6 },
      { k: 'aspect', p1: 'Saturn', p2: 'Pluto', a: 'conj', w: 8 },
      { k: 'fixedStar', body: 'Sun', star: 'Polaris', w: 6 },
      { k: 'elementBalance', element: 'earth', min: 3, w: 6 },
    ],
  },

  {
    id: 'middleEast',
    name: 'Middle East / Levant',
    description: 'Mesopotamia, Persia, the Levantine corridor, Anatolia, Arabia. Trade, warfare, prophecy, three monotheisms layered on older mysteries.',
    indicators: [
      { k: 'snSign', s: 'Aries', w: 6 },
      { k: 'snSign', s: 'Scorpio', w: 6 },
      { k: 'snAspect', target: 'Mars', a: 'conj', w: 8 },
      { k: 'fixedStar', body: 'Mars', star: 'Antares', w: 8 },
      { k: 'planetInHouse', p: 'Mars', h: 9, w: 6 },
    ],
  },

  {
    id: 'southAsia',
    name: 'South Asia',
    description: 'Indian subcontinent — Vedic and post-Vedic civilizations, Mughal courts, Tibetan and Nepalese highlands. Tantra, dharma, devotion, immense philosophical sophistication.',
    indicators: [
      { k: 'snSign', s: 'Sagittarius', w: 6 },
      { k: 'snSign', s: 'Pisces', w: 6 },
      { k: 'snHouse', h: 9, w: 6 },
      { k: 'aspect', p1: 'Jupiter', p2: 'Neptune', a: 'conj', w: 8 },
      { k: 'asteroid', aster: 'Vesta', target: 'Sun', w: 6 },
    ],
  },

  {
    id: 'eastAsia',
    name: 'East Asia',
    description: 'Sinosphere — China, Korea, Japan, Vietnam. Imperial bureaucracy, calligraphic and ceramic refinement, Daoist and Buddhist lineages, samurai and scholar traditions.',
    indicators: [
      { k: 'snSign', s: 'Virgo', w: 6 },
      { k: 'snSign', s: 'Capricorn', w: 4 },
      { k: 'snHouse', h: 6, w: 6 },
      { k: 'planetInSign', p: 'Mercury', s: 'Virgo', w: 6 },
      { k: 'aspect', p1: 'Saturn', p2: 'Mercury', a: 'sextile', w: 6 },
    ],
  },

  {
    id: 'islandNations',
    name: 'Island Nations / Pacific',
    description: 'Polynesian voyaging cultures, Japanese archipelago, Indonesian and Philippine kingdoms, Hawai\'i, Aotearoa. Long-distance navigation, oceanic spiritualities.',
    indicators: [
      { k: 'snSign', s: 'Pisces', w: 6 },
      { k: 'snSign', s: 'Cancer', w: 6 },
      { k: 'elementBalance', element: 'water', min: 4, w: 8 },
      { k: 'aspect', p1: 'Moon', p2: 'Neptune', a: 'conj', w: 6 },
      { k: 'fixedStar', body: 'Mercury', star: 'Canopus', w: 6 },
    ],
  },

  {
    id: 'coastalCivilization',
    name: 'Coastal Civilization',
    description: 'Port-city memory — Alexandria, Carthage, Venice, Lisbon, Macau, Boston. Trade, multilingualism, the cosmopolitan harbor character.',
    indicators: [
      { k: 'snSign', s: 'Cancer', w: 6 },
      { k: 'snSign', s: 'Gemini', w: 6 },
      { k: 'snHouse', h: 3, w: 6 },
      { k: 'aspect', p1: 'Mercury', p2: 'Jupiter', a: 'conj', w: 6 },
      { k: 'elementBalance', element: 'water', min: 3, w: 6 },
    ],
  },

  {
    id: 'mountainKingdom',
    name: 'Mountain Kingdom',
    description: 'Andes, Tibet, Himalaya, Caucasus, Atlas, Carpathian — high-altitude civilizations with intense spiritual traditions and isolated political continuity.',
    indicators: [
      { k: 'snSign', s: 'Capricorn', w: 8 },
      { k: 'snHouse', h: 10, w: 6 },
      { k: 'planetInSign', p: 'Saturn', s: 'Capricorn', w: 6 },
      { k: 'elementBalance', element: 'earth', min: 4, w: 8 },
    ],
  },

  {
    id: 'desertTradeRoute',
    name: 'Desert Trade Route',
    description: 'Silk Road oases, Saharan caravan routes, Arabian and Sinai pilgrimage paths. Multi-cultural exchange, Sufi and ascetic traditions, harsh apprenticeships in survival.',
    indicators: [
      { k: 'snSign', s: 'Sagittarius', w: 6 },
      { k: 'snSign', s: 'Gemini', w: 4 },
      { k: 'snHouse', h: 9, w: 6 },
      { k: 'aspect', p1: 'Mercury', p2: 'Jupiter', a: 'conj', w: 6 },
      { k: 'asteroid', aster: 'Pallas', target: 'Mercury', w: 6 },
    ],
  },

  {
    id: 'northernCold',
    name: 'Northern Cold Region',
    description: 'Norse, Sami, Finnic, Inuit, Russian-North, Scottish-Highland memory. Long winters, hunter and seafarer traditions, sagas, shamanic survival cultures.',
    indicators: [
      { k: 'snSign', s: 'Capricorn', w: 6 },
      { k: 'snSign', s: 'Aquarius', w: 4 },
      { k: 'aspect', p1: 'Saturn', p2: 'Uranus', a: 'sextile', w: 6 },
      { k: 'fixedStar', body: 'Sun', star: 'Polaris', w: 8 },
      { k: 'elementBalance', element: 'water', min: 3, w: 4 },
    ],
  },

];

// ─── Star Memory (off-world signatures) ─────────────────────────

export interface StarMemory {
  id: string;
  name: string;
  description: string;       // narrative, framed as symbolic
  qualities: string[];       // 3-5 traits associated
  indicators: SMIndicator[];
}

export const STAR_MEMORIES: StarMemory[] = [

  {
    id: 'pleiadian',
    name: 'Pleiadian Resonance',
    description:
      'Your chart carries a symbolic star-memory signature associated with the Pleiades — soft, healing, emotionally attuned, vibrationally sensitive, and oriented toward collective awakening through love and beauty.',
    qualities: ['Empathic resonance', 'Aesthetic sensitivity', 'Healing presence', 'Collective consciousness orientation', 'Devotional capacity'],
    indicators: [
      { k: 'fixedStar', body: 'Sun', star: 'Alcyone', w: 14 },
      { k: 'fixedStar', body: 'Moon', star: 'Alcyone', w: 14 },
      { k: 'fixedStar', body: 'ASC', star: 'Alcyone', w: 14 },
      { k: 'snSign', s: 'Pisces', w: 6 },
      { k: 'snSign', s: 'Taurus', w: 6 },
      { k: 'snAspect', target: 'Neptune', a: 'conj', w: 8 },
    ],
  },

  {
    id: 'sirian',
    name: 'Sirian Resonance',
    description:
      'A symbolic star-memory associated with Sirius surfaces in your chart — temple-builder, wisdom-keeper, civilizational architect, devoted to high-discipline esoteric work and the transmission of structured spiritual knowledge.',
    qualities: ['Temple-keeping discipline', 'Esoteric scholarship', 'Civilizational vision', 'Custodial loyalty', 'Sacred geometry instinct'],
    indicators: [
      { k: 'fixedStar', body: 'Sun', star: 'Sirius', w: 14 },
      { k: 'fixedStar', body: 'Moon', star: 'Sirius', w: 12 },
      { k: 'fixedStar', body: 'MC', star: 'Sirius', w: 14 },
      { k: 'snHouse', h: 9, w: 6 },
      { k: 'snAspect', target: 'Saturn', a: 'conj', w: 8 },
      { k: 'asteroid', aster: 'Urania', target: 'Sun', w: 6 },
    ],
  },

  {
    id: 'arcturian',
    name: 'Arcturian Resonance',
    description:
      'A symbolic star-memory associated with Arcturus surfaces — pioneer of consciousness, technologist of subtle energy, oriented toward service through advanced healing and visionary innovation rather than recognition.',
    qualities: ['Visionary practicality', 'Healing technology instinct', 'Pioneering courage', 'Service orientation', 'High-frequency curiosity'],
    indicators: [
      { k: 'fixedStar', body: 'Sun', star: 'Arcturus', w: 14 },
      { k: 'fixedStar', body: 'MC', star: 'Arcturus', w: 14 },
      { k: 'fixedStar', body: 'ASC', star: 'Arcturus', w: 12 },
      { k: 'snSign', s: 'Aquarius', w: 6 },
      { k: 'snAspect', target: 'Uranus', a: 'conj', w: 8 },
    ],
  },

  {
    id: 'orion',
    name: 'Orion Resonance',
    description:
      'A symbolic star-memory associated with Orion surfaces — the polarized lifetime: sovereignty and servitude, light and shadow, the long arc of consciousness learning to wield power without devouring itself.',
    qualities: ['Power-and-shadow polarity', 'Initiation through challenge', 'Sovereign discipline', 'Karmic clearing capacity', 'Will-forging'],
    indicators: [
      { k: 'fixedStar', body: 'Sun', star: 'Rigel', w: 12 },
      { k: 'fixedStar', body: 'Sun', star: 'Betelgeuse', w: 12 },
      { k: 'fixedStar', body: 'Mars', star: 'Bellatrix', w: 10 },
      { k: 'snSign', s: 'Scorpio', w: 6 },
      { k: 'snAspect', target: 'Pluto', a: 'conj', w: 8 },
    ],
  },

  {
    id: 'andromedan',
    name: 'Andromedan Resonance',
    description:
      'A symbolic star-memory associated with Andromeda surfaces — exiled freedom-seeker, quiet luminosity, the soul that holds liberation as a non-negotiable value across lifetimes of confinement.',
    qualities: ['Freedom imperative', 'Quiet refusal of tyranny', 'Subtle persuasion', 'Long-arc patience', 'Liberatory wisdom'],
    indicators: [
      { k: 'snSign', s: 'Aquarius', w: 8 },
      { k: 'snHouse', h: 11, w: 8 },
      { k: 'snAspect', target: 'Uranus', a: 'opp', w: 8 },
      { k: 'snAspect', target: 'Neptune', a: 'sextile', w: 6 },
      { k: 'aspect', p1: 'Uranus', p2: 'Neptune', a: 'conj', w: 8 },
    ],
  },

  {
    id: 'lyran',
    name: 'Lyran Resonance',
    description:
      'A symbolic star-memory associated with Lyra surfaces — feline grace and warrior pride, ancestral founder energy, the lineage-keeper who carries the original cultural blueprint.',
    qualities: ['Lineage-carrier presence', 'Sovereign warrior bearing', 'Ancestral memory', 'Cultural founder instinct', 'Quiet pride'],
    indicators: [
      { k: 'fixedStar', body: 'Sun', star: 'Vega', w: 14 },
      { k: 'fixedStar', body: 'MC', star: 'Vega', w: 12 },
      { k: 'snSign', s: 'Leo', w: 6 },
      { k: 'snAspect', target: 'Sun', a: 'conj', w: 6 },
    ],
  },

  {
    id: 'vegan',
    name: 'Vegan Resonance',
    description:
      'A symbolic star-memory associated with the Vega system surfaces — the artist-ambassador, the harmony-bringer, the soul whose work is to translate beauty into peace negotiations across difference.',
    qualities: ['Aesthetic diplomacy', 'Harmonizing instinct', 'Cross-cultural translation', 'Beauty-as-medicine', 'Light-touch leadership'],
    indicators: [
      { k: 'fixedStar', body: 'Venus', star: 'Vega', w: 14 },
      { k: 'fixedStar', body: 'Sun', star: 'Vega', w: 12 },
      { k: 'snSign', s: 'Libra', w: 6 },
      { k: 'snAspect', target: 'Venus', a: 'conj', w: 8 },
    ],
  },

];

// ─── Fixed Stars catalog (15 karmic stars, J2000 ecliptic) ──────
// Subset of the full 100-star catalog in fixed-stars.tsx, curated
// for past-life resonance significance. Engine references these
// by name in `fixedStar` indicators.

export interface FixedStarEntry {
  name: string;
  longitude: number;        // J2000 ecliptic, 0–360°
  nature: 'royal' | 'benefic' | 'malefic' | 'mixed';
  meaning: string;
}

export const FIXED_STARS: Record<string, FixedStarEntry> = {
  Regulus:      { name: 'Regulus',      longitude: 150.1, nature: 'royal',   meaning: 'Heart of the Lion — past-life sovereignty, courtly authority, royal lineage echo.' },
  Aldebaran:    { name: 'Aldebaran',    longitude: 69.9,  nature: 'royal',   meaning: 'Eye of the Bull — past-life integrity tested through martial honor and reputation.' },
  Antares:      { name: 'Antares',      longitude: 249.9, nature: 'royal',   meaning: 'Heart of the Scorpion — past-life warrior intensity, strategic command, possible self-destructive arc.' },
  Fomalhaut:    { name: 'Fomalhaut',    longitude: 333.9, nature: 'royal',   meaning: 'Mouth of the Southern Fish — past-life mystic vocation tested by purity.' },
  Sirius:       { name: 'Sirius',       longitude: 104.1, nature: 'benefic', meaning: 'Dog Star — past-life custodianship of sacred knowledge, immortal devotion.' },
  Vega:         { name: 'Vega',         longitude: 285.4, nature: 'benefic', meaning: 'Harp Star — past-life as artist, performer, charismatic ambassador.' },
  Spica:        { name: 'Spica',        longitude: 203.9, nature: 'benefic', meaning: 'Wheat Sheaf — past-life intellectual brilliance, refined research, benevolent harvest.' },
  Arcturus:     { name: 'Arcturus',     longitude: 204.2, nature: 'benefic', meaning: 'Bear-Watcher — past-life pioneer, pathfinder, innovator favored by fortune.' },
  Canopus:      { name: 'Canopus',      longitude: 104.9, nature: 'benefic', meaning: 'Celestial Navigator — past-life as far-traveling wisdom-bearer, voyaging master.' },
  Algol:        { name: 'Algol',        longitude: 56.2,  nature: 'malefic', meaning: 'Demon Star — past-life violent rupture, beheading, intense passion that destroyed something.' },
  Alcyone:      { name: 'Alcyone',      longitude: 60.0,  nature: 'mixed',   meaning: 'Central Pleiad — past-life mystical ambition, weeping eminence, collective tears.' },
  Bellatrix:    { name: 'Bellatrix',    longitude: 80.9,  nature: 'malefic', meaning: 'Female Warrior — past-life martial leadership followed by sudden dishonor or fall.' },
  Polaris:      { name: 'Polaris',      longitude: 28.3,  nature: 'mixed',   meaning: 'Pole Star — past-life as fixed reference point for others; burden of being someone\'s constant.' },
  Procyon:      { name: 'Procyon',      longitude: 115.7, nature: 'mixed',   meaning: 'Lesser Dog — past-life rapid rise and brief fame, restlessness and regret.' },
  Betelgeuse:   { name: 'Betelgeuse',   longitude: 88.8,  nature: 'benefic', meaning: 'Orion\'s Shoulder — past-life athletic, martial, or bold-achievement renown.' },
  Rigel:        { name: 'Rigel',        longitude: 76.9,  nature: 'benefic', meaning: 'Orion\'s Foot — past-life inventiveness, mechanical genius, civilizing impulse.' },
  Hadar:        { name: 'Hadar',        longitude: 203.7, nature: 'benefic', meaning: 'Beta Centauri — past-life institutional honor through powerful associations.' },
};

// ─── Cluster bonus theme map ────────────────────────────────────
// When ≥3 indicators within an archetype's cluster all match, +10
// raw score per spec ("Repeated theme 3+ times = +10 cluster bonus").

export const CLUSTER_THEMES = {
  spiritual: ['snSign:Pisces', 'snHouse:9', 'snHouse:12', 'snAspect:Neptune'],
  warrior:   ['snSign:Aries', 'snSign:Scorpio', 'snHouse:1', 'snHouse:8', 'snAspect:Mars', 'snAspect:Pluto'],
  scholar:   ['snSign:Virgo', 'snSign:Gemini', 'snHouse:3', 'snHouse:9', 'snAspect:Mercury', 'snAspect:Saturn'],
  royal:     ['snSign:Leo', 'snSign:Capricorn', 'snHouse:10'],
  lover:     ['snSign:Scorpio', 'snSign:Taurus', 'snHouse:5', 'snHouse:8', 'snAspect:Venus'],
};
