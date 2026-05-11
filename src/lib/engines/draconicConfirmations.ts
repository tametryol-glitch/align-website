/**
 * DRACONIC CONFIRMATION PROFILES
 * --------------------------------------------------------------
 * Per-archetype map of which Draconic-to-natal contacts CONFIRM that
 * archetype. The Draconic layer never overrides the natal scoring —
 * it RAISES confidence when the soul-level chart agrees with what the
 * natal chart already pointed at (per spec §10).
 *
 * Each profile lists which Draconic bodies, when contacting which natal
 * points, count as confirmation. Engine looks up the user's primary /
 * secondary / shadow archetypes and walks each profile's contact list,
 * scoring confirmations.
 *
 * Score weights from spec §10:
 *   Draconic luminary/angle confirms:                 +12
 *   Draconic chart ruler confirms:                    +10
 *   Draconic planet conj/opp natal SN:                +10
 *   Draconic planet confirms SN midpoint result:       +9
 *   Draconic asteroid confirms gift/wound archetype:   +5
 *   Draconic theme repeats duad/compendium theme:      +3
 *   Draconic theme appears 3+ times:                  +10 (cluster bonus)
 *
 * Orb policy (spec §3): conjunctions and oppositions only.
 *   0°–1° = extremely strong (×1.6)
 *   1°–2° = strong            (×1.3)
 *   2°–3° = supportive        (×1.0)
 *   3°+   = no contact
 * --------------------------------------------------------------
 */

/**
 * Single confirmation rule. Engine walks each rule against the user's
 * computed Draconic chart and natal chart, evaluates whether the
 * contact fires within the 3° max orb, and adds the resulting weight
 * to the matching archetype's confidence.
 */
export interface DraconicConfirmationRule {
  /** Draconic body whose position is rotated into the soul-level chart. */
  draconic: string;
  /** Natal body or angle the draconic body must contact. */
  natalTarget: string;
  /**
   * Confirmation weight category — maps to spec §10 scoring tiers.
   * Engine multiplies by orb-tier and applies cluster bonuses.
   */
  weight: 'luminary' | 'ruler' | 'sn' | 'snMidpt' | 'asteroid';
  /** Plain-language fragment used in the WHY confirmation block. */
  narrative: string;
}

/**
 * Per-archetype map. Key = archetype id from soulMemoryDatabase.ts.
 * Value = list of Draconic confirmation rules that strengthen that
 * archetype when matched.
 *
 * Coverage philosophy: every archetype has 5–8 confirmation rules
 * spanning its dominant draconic markers. Multiple matches in the
 * same archetype trigger the cluster bonus.
 */
export const DRACONIC_CONFIRMATIONS: Record<string, DraconicConfirmationRule[]> = {

  // ─── Temple Astrologer / Sacred Advisor ─────────────────────
  templeAstrologer: [
    { draconic: 'Urania', natalTarget: 'Sun', weight: 'asteroid',
      narrative: 'Draconic Urania confirming natal Sun marks a soul that has read the sky for many lifetimes.' },
    { draconic: 'Urania', natalTarget: 'MC', weight: 'asteroid',
      narrative: 'Draconic Urania on natal MC names this soul publicly as a chart-reader across incarnations.' },
    { draconic: 'Urania', natalTarget: 'Mercury', weight: 'asteroid',
      narrative: 'Draconic Urania to natal Mercury confirms the soul-level astrologer mind.' },
    { draconic: 'Urania', natalTarget: 'South Node', weight: 'sn',
      narrative: 'Draconic Urania directly contacting natal South Node — past lives spent decoding symbol and timing.' },
    { draconic: 'Mercury', natalTarget: 'Sun', weight: 'luminary',
      narrative: 'Draconic Mercury confirming natal Sun roots the messenger function in soul identity.' },
    { draconic: 'Jupiter', natalTarget: 'Sun', weight: 'luminary',
      narrative: 'Draconic Jupiter to natal Sun marks a soul that has taught and counseled across many lives.' },
    { draconic: 'Saturn', natalTarget: 'Mercury', weight: 'asteroid',
      narrative: 'Draconic Saturn to natal Mercury confirms the disciplined-astrologer thread — technique earned across lifetimes.' },
  ],

  // ─── Warrior Commander ──────────────────────────────────────
  warriorCommander: [
    { draconic: 'Mars', natalTarget: 'Sun', weight: 'luminary',
      narrative: 'Draconic Mars confirming natal Sun marks the soul whose identity has been forged through combat across lives.' },
    { draconic: 'Mars', natalTarget: 'MC', weight: 'luminary',
      narrative: 'Draconic Mars on natal MC names this soul publicly as a warrior across many incarnations.' },
    { draconic: 'Mars', natalTarget: 'South Node', weight: 'sn',
      narrative: 'Draconic Mars to natal South Node — past lives consistently spent in martial roles.' },
    { draconic: 'Pluto', natalTarget: 'Mars', weight: 'asteroid',
      narrative: 'Draconic Pluto to natal Mars confirms the survivor-commander thread that runs deeper than this lifetime.' },
    { draconic: 'Saturn', natalTarget: 'Mars', weight: 'asteroid',
      narrative: 'Draconic Saturn to natal Mars confirms the disciplined warrior — campaigns won through endurance across lives.' },
    { draconic: 'Pluto', natalTarget: 'ASC', weight: 'luminary',
      narrative: 'Draconic Pluto to natal ASC marks bodies that have attracted survival tests across multiple lifetimes.' },
    { draconic: 'Nike', natalTarget: 'Sun', weight: 'asteroid',
      narrative: 'Draconic Nike (victory) to natal Sun confirms the soul-level champion archetype.' },
  ],

  // ─── Sacred Healer ──────────────────────────────────────────
  sacredHealer: [
    { draconic: 'Chiron', natalTarget: 'Sun', weight: 'luminary',
      narrative: 'Draconic Chiron confirming natal Sun marks a soul that has worn the wounded-healer identity many times.' },
    { draconic: 'Chiron', natalTarget: 'Moon', weight: 'luminary',
      narrative: 'Draconic Chiron to natal Moon confirms emotional healing as the soul\'s repeating work.' },
    { draconic: 'Chiron', natalTarget: 'South Node', weight: 'sn',
      narrative: 'Draconic Chiron to natal South Node — past lives spent at sickbeds, in monasteries of healing, in places where pain was held.' },
    { draconic: 'Vesta', natalTarget: 'Moon', weight: 'asteroid',
      narrative: 'Draconic Vesta to natal Moon confirms the sacred-tender soul — the keeper of others\' health.' },
    { draconic: 'Ceres', natalTarget: 'Sun', weight: 'asteroid',
      narrative: 'Draconic Ceres to natal Sun confirms the nurturer archetype rooted in soul identity.' },
    { draconic: 'Neptune', natalTarget: 'Moon', weight: 'luminary',
      narrative: 'Draconic Neptune to natal Moon confirms intuitive emotional healing as a soul-level function.' },
    { draconic: 'Hygiea', natalTarget: 'Sun', weight: 'asteroid',
      narrative: 'Draconic Hygiea to natal Sun confirms the soul that has been a tender of bodies across many incarnations.' },
  ],

  // ─── Noble / Royal Figure ───────────────────────────────────
  nobleRoyal: [
    { draconic: 'Sun', natalTarget: 'MC', weight: 'luminary',
      narrative: 'Draconic Sun on natal MC marks a soul that has held formal rank across many lifetimes.' },
    { draconic: 'Saturn', natalTarget: 'Sun', weight: 'luminary',
      narrative: 'Draconic Saturn to natal Sun confirms inherited authority and the weight of position carried across lives.' },
    { draconic: 'Sun', natalTarget: 'South Node', weight: 'sn',
      narrative: 'Draconic Sun to natal South Node — past lives lived at the center of attention.' },
    { draconic: 'Saturn', natalTarget: 'MC', weight: 'asteroid',
      narrative: 'Draconic Saturn to natal MC confirms the soul that has held public position before.' },
    { draconic: 'Jupiter', natalTarget: 'MC', weight: 'asteroid',
      narrative: 'Draconic Jupiter to natal MC confirms the noble-patron thread — past lives of influence and largesse.' },
  ],

  // ─── Exiled Mystic ──────────────────────────────────────────
  exiledMystic: [
    { draconic: 'Neptune', natalTarget: 'Sun', weight: 'luminary',
      narrative: 'Draconic Neptune confirming natal Sun roots the mystic identity in soul memory, not personality.' },
    { draconic: 'Neptune', natalTarget: 'Moon', weight: 'luminary',
      narrative: 'Draconic Neptune to natal Moon confirms the soul that has walked between worlds across many lives.' },
    { draconic: 'Neptune', natalTarget: 'South Node', weight: 'sn',
      narrative: 'Draconic Neptune to natal South Node — past lives spent in cells, caves, monasteries, and the long silences of devotion.' },
    { draconic: 'Saturn', natalTarget: 'Neptune', weight: 'asteroid',
      narrative: 'Draconic Saturn to natal Neptune confirms the disciplined mystic — the practice held over years and lifetimes.' },
    { draconic: 'Pluto', natalTarget: 'Neptune', weight: 'asteroid',
      narrative: 'Draconic Pluto to natal Neptune confirms initiation as the soul\'s recurring spiritual path.' },
  ],

  // ─── Merchant Traveler ──────────────────────────────────────
  merchantTraveler: [
    { draconic: 'Mercury', natalTarget: 'Jupiter', weight: 'asteroid',
      narrative: 'Draconic Mercury to natal Jupiter confirms the cross-cultural merchant thread.' },
    { draconic: 'Jupiter', natalTarget: 'South Node', weight: 'sn',
      narrative: 'Draconic Jupiter to natal South Node — past lives spent in motion, between ports.' },
    { draconic: 'Mercury', natalTarget: 'South Node', weight: 'sn',
      narrative: 'Draconic Mercury to natal South Node — past lives carrying news, goods, and language between worlds.' },
    { draconic: 'Jupiter', natalTarget: 'ASC', weight: 'luminary',
      narrative: 'Draconic Jupiter to natal ASC confirms the foreigner-trader face the soul has worn.' },
  ],

  // ─── Scholar / Scribe ───────────────────────────────────────
  scholarScribe: [
    { draconic: 'Mercury', natalTarget: 'Sun', weight: 'luminary',
      narrative: 'Draconic Mercury confirming natal Sun marks the soul whose identity is words — copyist, translator, archivist.' },
    { draconic: 'Mercury', natalTarget: 'Saturn', weight: 'asteroid',
      narrative: 'Draconic Mercury to natal Saturn confirms the disciplined-scribe thread — accuracy as devotion.' },
    { draconic: 'Mercury', natalTarget: 'South Node', weight: 'sn',
      narrative: 'Draconic Mercury to natal South Node — past lives in scriptoria, libraries, archives.' },
    { draconic: 'Pallas', natalTarget: 'Mercury', weight: 'asteroid',
      narrative: 'Draconic Pallas to natal Mercury confirms the pattern-recognition mind across lives.' },
    { draconic: 'Saturn', natalTarget: 'Mercury', weight: 'asteroid',
      narrative: 'Draconic Saturn to natal Mercury confirms the patient mental endurance the soul has refined.' },
  ],

  // ─── Forbidden Lover ────────────────────────────────────────
  forbiddenLover: [
    { draconic: 'Venus', natalTarget: 'Pluto', weight: 'asteroid',
      narrative: 'Draconic Venus to natal Pluto confirms the love-as-transformation thread that runs older than this lifetime.' },
    { draconic: 'Eros', natalTarget: 'Sun', weight: 'asteroid',
      narrative: 'Draconic Eros to natal Sun confirms erotic intensity as core soul identity.' },
    { draconic: 'Eros', natalTarget: 'Moon', weight: 'asteroid',
      narrative: 'Draconic Eros to natal Moon confirms the soul that has loved with full body and full risk.' },
    { draconic: 'Lilith', natalTarget: 'Venus', weight: 'asteroid',
      narrative: 'Draconic Lilith to natal Venus confirms past lives where love was punished, hidden, or made dangerous.' },
    { draconic: 'Venus', natalTarget: 'South Node', weight: 'sn',
      narrative: 'Draconic Venus to natal South Node — past lives spent in love that crossed lines.' },
    { draconic: 'Pluto', natalTarget: 'Venus', weight: 'asteroid',
      narrative: 'Draconic Pluto to natal Venus confirms transformative-love karma carried forward.' },
  ],

  // ─── Midwife / Caretaker ────────────────────────────────────
  midwifeCaretaker: [
    { draconic: 'Ceres', natalTarget: 'Moon', weight: 'asteroid',
      narrative: 'Draconic Ceres to natal Moon confirms the soul that has fed and held others across many lifetimes.' },
    { draconic: 'Ceres', natalTarget: 'Sun', weight: 'asteroid',
      narrative: 'Draconic Ceres to natal Sun confirms nurturance as core soul identity.' },
    { draconic: 'Moon', natalTarget: 'South Node', weight: 'sn',
      narrative: 'Draconic Moon to natal South Node — past lives at sickbeds, birthing rooms, and the kitchens of communities.' },
    { draconic: 'Vesta', natalTarget: 'Moon', weight: 'asteroid',
      narrative: 'Draconic Vesta to natal Moon confirms the sacred caretaker — the steady tending that holds a household together.' },
  ],

  // ─── Priest / Priestess ─────────────────────────────────────
  priestPriestess: [
    { draconic: 'Vesta', natalTarget: 'Sun', weight: 'asteroid',
      narrative: 'Draconic Vesta to natal Sun confirms the soul whose identity is sacred service.' },
    { draconic: 'Vesta', natalTarget: 'Moon', weight: 'asteroid',
      narrative: 'Draconic Vesta to natal Moon confirms the inner flame the soul has kept across many lifetimes.' },
    { draconic: 'Vesta', natalTarget: 'South Node', weight: 'sn',
      narrative: 'Draconic Vesta to natal South Node — past lives spent at altar, shrine, or temple.' },
    { draconic: 'Neptune', natalTarget: 'Sun', weight: 'luminary',
      narrative: 'Draconic Neptune to natal Sun confirms the consecrated identity carried across incarnations.' },
    { draconic: 'Saturn', natalTarget: 'Vesta', weight: 'asteroid',
      narrative: 'Draconic Saturn to natal Vesta confirms the discipline of sacred orders the soul has known.' },
  ],

  // ─── Revolutionary Inventor ─────────────────────────────────
  revolutionaryInventor: [
    { draconic: 'Uranus', natalTarget: 'Sun', weight: 'luminary',
      narrative: 'Draconic Uranus to natal Sun confirms the visionary-rupture identity at soul level.' },
    { draconic: 'Uranus', natalTarget: 'Mercury', weight: 'asteroid',
      narrative: 'Draconic Uranus to natal Mercury confirms the inventive mind across many lives.' },
    { draconic: 'Uranus', natalTarget: 'MC', weight: 'luminary',
      narrative: 'Draconic Uranus to natal MC names this soul publicly as the one who breaks the inherited form.' },
    { draconic: 'Uranus', natalTarget: 'South Node', weight: 'sn',
      narrative: 'Draconic Uranus to natal South Node — past lives at the edge of legal reform, scientific revolution, or conspiracy.' },
  ],

  // ─── Occult Initiate ────────────────────────────────────────
  occultInitiate: [
    { draconic: 'Pluto', natalTarget: 'Sun', weight: 'luminary',
      narrative: 'Draconic Pluto to natal Sun confirms the initiate identity — death, rebirth, and the deep work as soul vocation.' },
    { draconic: 'Pluto', natalTarget: 'South Node', weight: 'sn',
      narrative: 'Draconic Pluto to natal South Node — past lives spent in underworld practice, initiatory traditions, the long descent.' },
    { draconic: 'Lilith', natalTarget: 'Sun', weight: 'asteroid',
      narrative: 'Draconic Lilith to natal Sun confirms the taboo-knowledge thread carried across lives.' },
    { draconic: 'Pluto', natalTarget: 'ASC', weight: 'luminary',
      narrative: 'Draconic Pluto to natal ASC confirms the body that has attracted occult depth for many incarnations.' },
    { draconic: 'Neptune', natalTarget: 'Pluto', weight: 'asteroid',
      narrative: 'Draconic Neptune to natal Pluto confirms the dissolution-and-power signature of advanced esoteric work.' },
  ],

  // ─── Sea Traveler / Navigator ───────────────────────────────
  seaTraveler: [
    { draconic: 'Neptune', natalTarget: 'Mercury', weight: 'asteroid',
      narrative: 'Draconic Neptune to natal Mercury confirms the navigator mind that reads water and stars together.' },
    { draconic: 'Moon', natalTarget: 'Neptune', weight: 'asteroid',
      narrative: 'Draconic Moon to natal Neptune confirms emotional fluency in oceanic conditions across many lives.' },
    { draconic: 'Neptune', natalTarget: 'South Node', weight: 'sn',
      narrative: 'Draconic Neptune to natal South Node — past lives spent on open water.' },
  ],

  // ─── Judge / Law Figure ─────────────────────────────────────
  judgeLaw: [
    { draconic: 'Jupiter', natalTarget: 'Saturn', weight: 'asteroid',
      narrative: 'Draconic Jupiter to natal Saturn confirms the long-trained legal-philosophical mind.' },
    { draconic: 'Jupiter', natalTarget: 'MC', weight: 'asteroid',
      narrative: 'Draconic Jupiter to natal MC confirms the public-arbiter role the soul has held.' },
    { draconic: 'Saturn', natalTarget: 'South Node', weight: 'sn',
      narrative: 'Draconic Saturn to natal South Node — past lives weighing matters of consequence on a bench.' },
    { draconic: 'Pallas', natalTarget: 'Jupiter', weight: 'asteroid',
      narrative: 'Draconic Pallas to natal Jupiter confirms the strategic-legal mind across incarnations.' },
  ],

  // ─── Artist / Performer ─────────────────────────────────────
  artistPerformer: [
    { draconic: 'Venus', natalTarget: 'Sun', weight: 'luminary',
      narrative: 'Draconic Venus to natal Sun confirms the artist identity at soul level.' },
    { draconic: 'Venus', natalTarget: 'MC', weight: 'asteroid',
      narrative: 'Draconic Venus to natal MC names the soul publicly as a maker of beauty.' },
    { draconic: 'Apollo', natalTarget: 'Sun', weight: 'asteroid',
      narrative: 'Draconic Apollo to natal Sun confirms the creative-fame thread the soul has known before.' },
    { draconic: 'Venus', natalTarget: 'South Node', weight: 'sn',
      narrative: 'Draconic Venus to natal South Node — past lives spent making things people came to see.' },
    { draconic: 'Neptune', natalTarget: 'Venus', weight: 'asteroid',
      narrative: 'Draconic Neptune to natal Venus confirms inspired creation as recurring soul function.' },
  ],

  // ─── Court Intriguer / Spy ──────────────────────────────────
  courtIntriguer: [
    { draconic: 'Mercury', natalTarget: 'Pluto', weight: 'asteroid',
      narrative: 'Draconic Mercury to natal Pluto confirms the information-as-power thread the soul has worked.' },
    { draconic: 'Pluto', natalTarget: 'Mercury', weight: 'asteroid',
      narrative: 'Draconic Pluto to natal Mercury confirms the hidden-cards player across lifetimes.' },
    { draconic: 'Pallas', natalTarget: 'Pluto', weight: 'asteroid',
      narrative: 'Draconic Pallas to natal Pluto confirms strategic intelligence applied to power dynamics.' },
    { draconic: 'Nemesis', natalTarget: 'Mercury', weight: 'asteroid',
      narrative: 'Draconic Nemesis to natal Mercury confirms the soul that has spoken — or withheld — the words that ended careers.' },
  ],

};

/** All Draconic bodies the engine evaluates for confirmation contacts. */
export const DRACONIC_BODIES_TO_EVALUATE = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'Chiron', 'Vesta', 'Pallas', 'Juno', 'Ceres',
  'Eros', 'Psyche', 'Lilith', 'Urania', 'Apollo',
  'Hygiea', 'Nemesis', 'Karma', 'Nike',
];

/** Natal targets the engine checks for Draconic-to-natal contact. */
export const NATAL_TARGETS_FOR_CONFIRMATION = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'Chiron', 'Vesta', 'Pallas', 'Juno', 'Urania',
  'ASC', 'MC', 'IC', 'DSC',
  'South Node', 'North Node',
];
