/**
 * DRACONIC BLUEPRINTS DATA
 * --------------------------------------------------------------
 * Soul-level interpretation tables for the Draconic chart layer.
 *
 * Three datasets:
 *   1. SOUL_SUN          — 12 sign-by-sign Draconic Sun blueprints
 *                          ("who the soul has been across many lifetimes")
 *   2. SOUL_MOON         — 12 Draconic Moon blueprints
 *                          ("the recurring emotional pattern of the soul")
 *   3. SOUL_ASC          — 12 Draconic Ascendant blueprints
 *                          ("the soul's ancient face, before this body")
 *   4. SOUL_RULER        — 12 chart-ruler interpretations
 *                          (the Draconic ASC ruler reveals the soul's vehicle)
 *   5. LIFETIME_PATTERNS — recurring soul-behavior templates triggered
 *                          when specific Draconic + natal patterns cluster
 *
 * Tone: cinematic, soul-deep, premium. Per spec §12, never "Draconic Sun
 * means your soul is…" — always "Beneath the personality of this lifetime,
 * your soul carries…"
 *
 * Per-user output is composed by combining the sign-level template with:
 *   - the natal house the draconic body falls into
 *   - the duad and compendium of the draconic position
 *   - matching natal contacts (handled in draconicChart.ts)
 *   - archetype confirmation status
 *
 * This file holds the static template content only.
 * --------------------------------------------------------------
 */

// ─── Soul Sun (Draconic Sun by sign) ────────────────────────────

export const SOUL_SUN: Record<string, string> = {
  Aries:
    'Beneath the personality of this lifetime, your soul carries the original spark of action. Lifetime after lifetime this soul has incarnated to begin things — to break ground others were too cautious to disturb, to take the first arrow, to test what could be done.',
  Taurus:
    'Your soul has returned many times through embodied, sensual, and grounded lifetimes — building, holding, sustaining. This soul knows the slow rhythm of seasons and trusts what it can touch. Across many incarnations it has been the one who anchors.',
  Gemini:
    'This soul has carried words across worlds for many lifetimes. Translator, messenger, scribe, neighbor, sibling, traveler — your soul keeps returning into bodies that connect what was separated.',
  Cancer:
    'Your soul comes back through lifetimes of nurturance, kinship, and emotional memory. Many of those lives were given to family, lineage, mothering — feeding, holding, protecting people you may or may not have chosen.',
  Leo:
    'Lifetime after lifetime this soul has returned to the center of attention — performer, monarch, captain, parent, teacher with disciples watching. Your soul knows what it is to be witnessed and to be the one who makes others feel seen.',
  Virgo:
    'Your soul carries an ancient apprenticeship. Many lifetimes were given to refinement — herbalism, scribal precision, devotion, healing arts, the patient mastery of small useful things. This soul knows that excellence is built one detail at a time.',
  Libra:
    'This soul has returned many times through partnership, art, diplomacy, and the calibration of beauty. Lifetime after lifetime it has been the one who finds the third option, holds the middle ground, restores proportion where harshness lived.',
  Scorpio:
    'Your soul has returned many times through intense lifetimes involving survival, secrecy, death, power, sexuality, healing, and transformation. Lifetime after lifetime, this soul has been forced to understand what power does to people.',
  Sagittarius:
    'Lifetime after lifetime this soul has been the seeker — pilgrim, professor, foreigner, prophet, philosopher. Your soul carries the long-distance restlessness of a being that returns again and again to widen what is known.',
  Capricorn:
    'Your soul comes back through lifetimes of structure, authority, and long-arc building. Many of those lives were given to institutions, mountains, slow consolidation. This soul knows that legacy is what survives the lifetime that built it.',
  Aquarius:
    'This soul has returned many times as the outsider with vision — the one who saw what could be when nobody else did. Your soul carries the long memory of being ahead of its time and the discipline of returning anyway.',
  Pisces:
    'Lifetime after lifetime this soul has lived close to the veil — mystic, monastic, artist, seer, refugee, child of the sea. Your soul knows that the world we see is not the only world, and many of its incarnations were spent translating between them.',
};

// ─── Soul Moon (Draconic Moon by sign) ──────────────────────────

export const SOUL_MOON: Record<string, string> = {
  Aries:
    'The soul\'s recurring emotional pattern is fire-on-fire — needing to act before it has been fully felt, finding safety in motion rather than stillness.',
  Taurus:
    'The soul\'s emotional thread across lifetimes is sensory and slow. Comfort lives in body, not in story. The soul has spent many lives finding peace through what could be touched and held.',
  Gemini:
    'The soul\'s emotional pattern is plural across lifetimes — multiple loves, multiple homes, multiple voices in the inner room. The soul has rarely settled emotionally, and it has rarely needed to.',
  Cancer:
    'The soul\'s recurring emotional pattern is deep memory and protective instinct. Across many lifetimes this soul has remembered what others have forgotten and held space for what others abandoned.',
  Leo:
    'The soul\'s emotional pattern is bright and visible across many lives — needing to be seen, needing to give heart in a way the room can feel. Hidden emotion has rarely suited this soul.',
  Virgo:
    'The soul\'s recurring emotional pattern is service and analysis — calming itself through usefulness, healing itself through detail. Many lifetimes were given to bodies that worked carefully and steadily.',
  Libra:
    'The soul\'s emotional pattern is relational across lifetimes — finding self through other, calibrating its inner weather to whoever it is with. Many lifetimes were given to partnership.',
  Scorpio:
    'The soul\'s recurring emotional pattern is depth and intensity — emotion that refuses the surface. Across many lifetimes this soul has felt what most people will not, and survived it.',
  Sagittarius:
    'The soul\'s emotional thread is faith-based across lifetimes — needing to believe in something bigger than the room it is in. The soul has rarely tolerated despair as a permanent address.',
  Capricorn:
    'The soul\'s recurring emotional pattern is reserve and endurance. Many lifetimes were spent holding emotional weight without speaking of it, building inner fortresses no one else saw.',
  Aquarius:
    'The soul\'s emotional pattern is independent and detached across lives — finding warmth in friendship, in causes, in the wider human family rather than in possession.',
  Pisces:
    'The soul\'s recurring emotional pattern is permeable and oceanic — feeling everything, sometimes drowning in it, returning each time more able to tell which currents are its own.',
};

// ─── Soul ASC (Draconic Ascendant by sign) ──────────────────────

export const SOUL_ASC: Record<string, string> = {
  Aries:
    'Before this body, your soul has worn the warrior\'s face many times. The first impression you have made across lives has been forward, vivid, immediate.',
  Taurus:
    'Before this body, your soul has worn calm earth across lifetimes. The first impression you have made has been steadiness, sensual presence, and a refusal to hurry.',
  Gemini:
    'Before this body, your soul has worn many faces — the messenger, the curious one, the doubled self. First impressions across lives have been quickness and the willingness to talk to anyone.',
  Cancer:
    'Before this body, your soul has worn the protector\'s face many times. The first impression has been kinship — even strangers have read you as family.',
  Leo:
    'Before this body, your soul has worn the visible self many lives running. First impressions have been radiant, theatrical, large. The soul has rarely entered a room small.',
  Virgo:
    'Before this body, your soul has worn the careful, observant face across lifetimes. First impressions have been precision, watchfulness, and the unmistakable sense that you were paying attention.',
  Libra:
    'Before this body, your soul has worn beauty and grace across many lives. The first impression has been harmony — even adversaries have softened upon meeting you.',
  Scorpio:
    'Before this body, your soul has worn intensity. The first impression across lifetimes has been gravity — strangers have either leaned in instantly or turned away.',
  Sagittarius:
    'Before this body, your soul has worn the foreigner\'s face — the traveler from somewhere else, even when at home. First impressions across lives have been openness, optimism, and the wind of distance.',
  Capricorn:
    'Before this body, your soul has worn authority. The first impression across lifetimes has been composure, age beyond age, the unmistakable mark of someone who has carried weight before.',
  Aquarius:
    'Before this body, your soul has worn the outsider\'s face — different by nature, not by performance. First impressions across lives have been a quiet refusal to fit easily.',
  Pisces:
    'Before this body, your soul has worn the mystic\'s face — soft, oceanic, slightly elsewhere. First impressions across lifetimes have been a sense that part of you was always somewhere else.',
};

// ─── Soul Ruler (Draconic chart ruler by which planet) ──────────
// The ruler of the Draconic Ascendant sign is the soul's "vehicle" —
// the planetary archetype the soul has consistently used to express
// itself across incarnations.

export const SOUL_RULER: Record<string, string> = {
  Sun:
    'Your soul\'s vehicle across lifetimes has been the Sun itself — visibility, sovereignty, the impulse to be seen and to lead. This soul has rarely been content to work in the shadows.',
  Moon:
    'Your soul\'s vehicle across lifetimes has been the Moon — emotion, memory, the maternal current. This soul has carried protective instinct as a primary tool.',
  Mercury:
    'Your soul\'s vehicle across lifetimes has been Mercury — the messenger function. This soul keeps returning to roles that translate, teach, write, deliver, or connect.',
  Venus:
    'Your soul\'s vehicle across lifetimes has been Venus — the artist, the lover, the one who tunes harmony where dissonance lived.',
  Mars:
    'Your soul\'s vehicle across lifetimes has been Mars — the will to act. This soul has come back many times into bodies that fight, defend, build through force, or hunt.',
  Jupiter:
    'Your soul\'s vehicle across lifetimes has been Jupiter — the seeker and teacher. This soul has been priest, philosopher, professor, foreign traveler, judge.',
  Saturn:
    'Your soul\'s vehicle across lifetimes has been Saturn — structure, mastery, slow accumulation. This soul has been the architect and the long-distance discipline.',
  Vesta:
    'Your soul\'s vehicle across lifetimes has been Vesta — sacred service. This soul keeps returning as the tender of the inner flame, devoted to a single purpose.',
  Juno:
    'Your soul\'s vehicle across lifetimes has been Juno — committed partnership. This soul has come back many times into the contracts of marriage and bonded loyalty.',
  Uranus:
    'Your soul\'s vehicle across lifetimes has been Uranus — innovation and rupture. This soul keeps returning as the reformer, the inventor, the one who breaks the inherited form.',
  Neptune:
    'Your soul\'s vehicle across lifetimes has been Neptune — the dissolving boundary. This soul has worked through dream, vision, music, devotion, and the porous places between worlds.',
  Pluto:
    'Your soul\'s vehicle across lifetimes has been Pluto — transformation through death and return. This soul keeps incarnating into lives that demand reinvention from the bones.',
};

// ─── Lifetime Patterns ──────────────────────────────────────────
// Triggered when specific Draconic + natal clusters align. Each pattern
// has a trigger function (evaluated by the engine against the chart) and
// a narrative line. Engine returns 2–4 of these to populate the
// "What Your Soul Keeps Returning To" card.

export interface LifetimePattern {
  id: string;
  /** Cinematic narrative line shown in the UI. */
  narrative: string;
  /**
   * Trigger description — engine implements the actual matching logic
   * via a switch on `id`. This is documentation, not data.
   */
  triggerDoc: string;
}

export const LIFETIME_PATTERNS: LifetimePattern[] = [
  {
    id: 'guideOthers',
    narrative:
      'This soul repeatedly returns to positions where it must guide others — through wisdom, through visibility, through standing at the front of a room of people who need direction.',
    triggerDoc:
      'Draconic Sun in fire OR Sagittarius/Aquarius emphasis OR Draconic 9th/10th/11th house emphasis',
  },
  {
    id: 'intenseRelationship',
    narrative:
      'This soul repeatedly returns to intense relationship contracts — bonds that arrive as recognition, not introduction; loves that test the soul more than they comfort it.',
    triggerDoc:
      'Draconic Venus in Scorpio OR Draconic Juno tight to natal Venus/Mars/Sun OR Draconic Eros to natal Pluto',
  },
  {
    id: 'hiddenSpiritualWork',
    narrative:
      'This soul repeatedly returns to hidden spiritual work — the practice that happens behind closed doors, in cells, in caves, in the corners of institutions that did not name their mystics.',
    triggerDoc:
      'Draconic 12th house emphasis OR Draconic Neptune to natal Sun/Moon/SN OR Draconic Vesta prominent',
  },
  {
    id: 'powerStruggles',
    narrative:
      'This soul repeatedly returns to power struggles — sometimes wielding power, sometimes resisting it, returning each lifetime closer to learning what clean power requires.',
    triggerDoc:
      'Draconic Pluto to natal Sun/Mars/MC/SN OR Draconic Mars in fixed signs OR Draconic 8th house emphasis',
  },
  {
    id: 'exileDifference',
    narrative:
      'This soul repeatedly returns to exile, difference, or outsiderhood — until it learns to own its uniqueness rather than apologize for it.',
    triggerDoc:
      'Draconic Sun/Moon/ASC in Aquarius OR Draconic Uranus to natal Sun/Moon OR Draconic SN sign in air',
  },
  {
    id: 'craftMastery',
    narrative:
      'This soul repeatedly returns to the slow craft of mastery — the same instrument, the same form, the same work refined across many lifetimes until what was technique becomes essence.',
    triggerDoc:
      'Draconic Sun/Moon in earth OR Draconic Saturn to natal Sun/Mercury/MC OR Draconic Vesta tight to natal Sun',
  },
  {
    id: 'translationBetweenWorlds',
    narrative:
      'This soul repeatedly returns to translate between worlds — between cultures, between languages, between the seen and the unseen. Many of its lifetimes have been spent at thresholds.',
    triggerDoc:
      'Draconic Mercury to natal Neptune/Pluto/SN OR Draconic 9th house emphasis OR Draconic Sun in mutable signs',
  },
  {
    id: 'sacrificialService',
    narrative:
      'This soul repeatedly returns to lives of service — feeding, healing, attending, holding the room while others received credit. The soul is now learning to serve without disappearing.',
    triggerDoc:
      'Draconic Ceres to natal Sun/Moon OR Draconic 6th house emphasis OR Draconic Vesta hard contact to natal Saturn',
  },
  {
    id: 'creativeTransmission',
    narrative:
      'This soul repeatedly returns to make beauty — through paint, through voice, through architecture, through the body. The making is not decoration; it is the soul\'s native language.',
    triggerDoc:
      'Draconic Venus to natal Sun/MC/ASC OR Draconic Apollo prominent OR Draconic 5th house emphasis',
  },
  {
    id: 'karmicHealing',
    narrative:
      'This soul repeatedly returns to wounds — its own and others\'. Many of its lives have been given to closing what was opened by harm done to or by those who came before.',
    triggerDoc:
      'Draconic Chiron to natal Sun/Moon/SN OR Draconic Pluto to natal Moon OR Draconic 8th house emphasis',
  },
  {
    id: 'institutionalAuthority',
    narrative:
      'This soul repeatedly returns to institutional roles — court, temple, court of law, hospital, council, board. The structure is the medium; the soul keeps coming back to work inside form.',
    triggerDoc:
      'Draconic Saturn to natal Sun/MC OR Draconic 10th house emphasis OR Draconic Capricorn emphasis',
  },
  {
    id: 'visionaryRupture',
    narrative:
      'This soul repeatedly returns at moments of rupture — it incarnates into eras when something must break, and it carries the gift of seeing through the break to what comes after.',
    triggerDoc:
      'Draconic Uranus to natal Sun/Mercury/MC OR Draconic 11th house emphasis OR Draconic Aquarius emphasis',
  },
  {
    id: 'erosTransformation',
    narrative:
      'This soul repeatedly returns through erotic and emotional intensity — encounters that rewrite the self, partners that arrive as recognition, sex that operates as initiation more than recreation.',
    triggerDoc:
      'Draconic Eros to natal Sun/Moon/Venus/Pluto OR Draconic Lilith to natal Venus OR Draconic 8th house emphasis',
  },
  {
    id: 'mysticPerception',
    narrative:
      'This soul repeatedly returns with thinned veil — visions, premonitions, contact with what most people cannot see. Many of its lives were spent learning when to speak of it and when to keep silent.',
    triggerDoc:
      'Draconic Neptune to natal Moon/Mercury/Urania OR Draconic 12th house emphasis OR Draconic Pisces Sun/Moon/ASC',
  },
];
