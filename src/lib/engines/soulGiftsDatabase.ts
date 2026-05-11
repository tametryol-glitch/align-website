/**
 * SOUL GIFTS DATABASE
 * --------------------------------------------------------------
 * 210+ specific natural gifts, each defined by an array of
 * astrological indicators. The engine in services/soulGiftsEngine.ts
 * walks every gift, scores it against the user's natal chart, and
 * returns ranked sections.
 *
 * Design rules:
 * 1. Every gift must be SPECIFIC. No "creative", no "intuitive".
 * 2. Every indicator must be astrologically defensible — not vibes.
 * 3. Indicator weights sum into a 0–100 score with cap + repetition
 *    bonus + tight-orb boost handled in the engine.
 * 4. Description tells the user what the gift IS. The engine builds
 *    the personalized "why YOU have it" from matched indicators.
 *
 * Indicator weight scale (informal):
 *   30  = anchor (planet on angle <1°, asteroid conj luminary <1°)
 *   18–22 = strong (planet in own sign + house, key conjunction)
 *   12–16 = supporting (sign or house alone, mid-strength aspect)
 *   6–10  = light (secondary signature, house emphasis fallback)
 *
 * Aspects use base 5° orb except as noted; "tight" orb (<1°) gets
 * a 1.5× weight boost in the engine.
 * --------------------------------------------------------------
 */

// ─── Types ──────────────────────────────────────────────────────

export type GiftCategory =
  | 'performance'
  | 'spiritual'
  | 'power'
  | 'money'
  | 'intelligence'
  | 'healing'
  | 'physical'
  | 'love'
  | 'shadow';

export type AspectKind = 'conj' | 'opp' | 'trine' | 'square' | 'sextile' | 'quincunx';
export type AngleKind = 'ASC' | 'MC' | 'IC' | 'DSC';

/** Discriminated indicator union — engine consumes these. */
export type Indicator =
  | { k: 'pSign'; p: string; s: string; w: number }                    // planet in sign
  | { k: 'pHouse'; p: string; h: number; w: number }                   // planet in house
  | { k: 'aspect'; p1: string; p2: string; a: AspectKind; w: number }  // body-to-body aspect
  | { k: 'onAngle'; body: string; angle: AngleKind; w: number }        // body within 5° of angle (conj)
  | { k: 'signOnAngle'; s: string; angle: AngleKind; w: number }       // sign on the angle's cusp
  | { k: 'asteroid'; aster: string; target: string; asp?: AspectKind; w: number } // asteroid aspect to body (default conj)
  | { k: 'midpt'; m1: string; m2: string; target: string; w: number }  // midpoint-of-(m1,m2) conj target
  | { k: 'houseFocus'; h: number; min: number; w: number }             // ≥min bodies in this house
  | { k: 'signFocus'; s: string; min: number; w: number }              // ≥min bodies in this sign
  | { k: 'retro'; p: string; w: number }                               // planet retrograde
  /**
   * Dispositor chain indicator. Checks where the SIGN-RULER of a given
   * body lands in the chart — uses CUSTOM_RULERS (spec-defined) so Virgo
   * resolves to Vesta, Libra to Juno, Scorpio to Pluto, Aquarius to Uranus,
   * Pisces to Neptune. Match conditions can be by house (toHouse) or by
   * sign (toSign). When both supplied, both must match. Captures patterns
   * like "Jupiter in Virgo whose ruler Vesta sits in the 10th house" —
   * the textbook career-astrologer dispositor signature.
   */
  | { k: 'dispositor'; from: string; toHouse?: number; toSign?: string; w: number };

/** Custom sign rulers per spec — overrides classical rulers where noted. */
export const CUSTOM_RULERS: Record<string, string> = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Vesta',         // custom (classical: Mercury)
  Libra: 'Juno',          // custom (classical: Venus)
  Scorpio: 'Pluto',       // custom (classical: Mars)
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Uranus',     // custom (classical: Saturn)
  Pisces: 'Neptune',      // custom (classical: Jupiter)
};

export interface SoulGift {
  id: string;
  name: string;
  category: GiftCategory;
  /** Optional secondary categories — gift can also surface in money/love/shadow lanes. */
  alsoIn?: GiftCategory[];
  /** What this gift IS (1–2 vivid sentences, never vague). */
  description: string;
  /** Practical action to activate it. */
  unlock: string;
  /**
   * Optional one-sentence interpretive frame the engine surfaces when this gift
   * scores. Explains the astrological LOGIC of the gift in plain language —
   * what the indicators collectively mean. Shown above the matched-indicator
   * reasons in the card's WHY YOU HAVE THIS section. Falls back to gift
   * description when not set.
   */
  whyExpression?: string;
  indicators: Indicator[];
}

// ─── Helpers (compact gift constructors used inline) ────────────

const G = (
  id: string,
  name: string,
  category: GiftCategory,
  description: string,
  unlock: string,
  indicators: Indicator[],
  alsoIn?: GiftCategory[],
  whyExpression?: string,
): SoulGift => ({ id, name, category, alsoIn, description, unlock, whyExpression, indicators });

// ─── 210+ GIFTS ─────────────────────────────────────────────────
// Organized by primary category. Cross-category gifts use `alsoIn`.

export const SOUL_GIFTS: SoulGift[] = [

  // ════════════════════════════════════════════════════════════
  // PERFORMANCE GIFTS (28)
  // ════════════════════════════════════════════════════════════

  G('acting', 'Acting', 'performance',
    'You can fully inhabit another self on demand. Audiences forget they are watching a performance.',
    'Take an on-camera scene-study class for 8 weeks. Film yourself daily and watch it back without flinching.',
    [
      { k: 'pHouse', p: 'Sun', h: 5, w: 16 },
      { k: 'pSign', p: 'Sun', s: 'Leo', w: 14 },
      { k: 'aspect', p1: 'Sun', p2: 'Neptune', a: 'conj', w: 18 },
      { k: 'aspect', p1: 'Sun', p2: 'Neptune', a: 'trine', w: 12 },
      { k: 'asteroid', aster: 'Apollo', target: 'Sun', w: 18 },
      { k: 'houseFocus', h: 5, min: 2, w: 12 },
      { k: 'pHouse', p: 'Neptune', h: 5, w: 12 },
    ]),

  G('dancing', 'Dancing', 'performance',
    'Your body interprets rhythm as language. You think in motion before you think in words.',
    'Pick one style (salsa, ballet, hip-hop) and commit to two classes per week for three months. Filming optional but recommended.',
    [
      { k: 'aspect', p1: 'Venus', p2: 'Mars', a: 'conj', w: 18 },
      { k: 'aspect', p1: 'Venus', p2: 'Mars', a: 'trine', w: 14 },
      { k: 'aspect', p1: 'Venus', p2: 'Neptune', a: 'conj', w: 14 },
      { k: 'pSign', p: 'Venus', s: 'Pisces', w: 12 },
      { k: 'pSign', p: 'Mars', s: 'Leo', w: 10 },
      { k: 'midpt', m1: 'Venus', m2: 'Mars', target: 'ASC', w: 18 },
      { k: 'pHouse', p: 'Mars', h: 5, w: 12 },
    ]),

  G('singing', 'Singing', 'performance',
    'Your voice carries emotional information that bypasses words. Listeners feel something shift when you sing.',
    'Work weekly with a vocal coach. Record demos monthly — the goal is documentation, not perfection.',
    [
      { k: 'pSign', p: 'Venus', s: 'Taurus', w: 16 },
      { k: 'pSign', p: 'Venus', s: 'Libra', w: 12 },
      { k: 'pHouse', p: 'Venus', h: 2, w: 12 },
      { k: 'pHouse', p: 'Venus', h: 5, w: 14 },
      { k: 'aspect', p1: 'Mercury', p2: 'Venus', a: 'conj', w: 14 },
      { k: 'asteroid', aster: 'Apollo', target: 'Venus', w: 16 },
      { k: 'asteroid', aster: 'Apollo', target: 'Mercury', w: 14 },
    ]),

  G('comedyTiming', 'Comedy Timing', 'performance',
    'You read a room in real time and land lines on the exact beat that produces laughter. This is a measurable skill, not a personality trait.',
    'Do one open-mic per week for six months. Record every set and study where the laughs land vs where you thought they would.',
    [
      { k: 'aspect', p1: 'Mercury', p2: 'Uranus', a: 'conj', w: 20 },
      { k: 'aspect', p1: 'Mercury', p2: 'Uranus', a: 'trine', w: 14 },
      { k: 'aspect', p1: 'Mercury', p2: 'Mars', a: 'conj', w: 14 },
      { k: 'pSign', p: 'Mercury', s: 'Gemini', w: 12 },
      { k: 'pSign', p: 'Sun', s: 'Sagittarius', w: 10 },
      { k: 'pHouse', p: 'Uranus', h: 5, w: 14 },
    ]),

  G('voiceTalent', 'Voice Talent', 'performance',
    'Your voice itself — separate from what you say — has texture and authority that holds attention. Voiceover, podcasting, and audiobook work fit you.',
    'Demo-reel a 90-second sample for commercial, narration, and character work. Submit to three voice agencies in the next 30 days.',
    [
      { k: 'pSign', p: 'Mercury', s: 'Taurus', w: 14 },
      { k: 'pSign', p: 'Venus', s: 'Taurus', w: 14 },
      { k: 'pHouse', p: 'Mercury', h: 2, w: 14 },
      { k: 'aspect', p1: 'Mercury', p2: 'Venus', a: 'conj', w: 14 },
      { k: 'aspect', p1: 'Mercury', p2: 'Pluto', a: 'conj', w: 14 },
      { k: 'asteroid', aster: 'Apollo', target: 'Mercury', w: 14 },
    ]),

  G('stagePresence', 'Stage Presence', 'performance',
    'You walk onto any platform and the energy in the room shifts to you without you doing anything. Pure command.',
    'Take an on-camera interview workshop. Practice entering a room without speaking and notice how attention moves.',
    [
      { k: 'onAngle', body: 'Sun', angle: 'ASC', w: 24 },
      { k: 'onAngle', body: 'Sun', angle: 'MC', w: 22 },
      { k: 'signOnAngle', s: 'Leo', angle: 'ASC', w: 18 },
      { k: 'aspect', p1: 'Sun', p2: 'Pluto', a: 'conj', w: 16 },
      { k: 'pHouse', p: 'Sun', h: 1, w: 14 },
      { k: 'pHouse', p: 'Sun', h: 10, w: 12 },
    ]),

  G('filmTalent', 'Film Talent', 'performance',
    'Your face holds story. Camera lenses register depth and ambiguity in you that live audiences miss.',
    'Take a screen-acting class focused on the close-up. Get headshots that show range, not just one mood.',
    [
      { k: 'aspect', p1: 'Sun', p2: 'Neptune', a: 'conj', w: 20 },
      { k: 'aspect', p1: 'Venus', p2: 'Neptune', a: 'conj', w: 16 },
      { k: 'pSign', p: 'Sun', s: 'Pisces', w: 12 },
      { k: 'pHouse', p: 'Neptune', h: 5, w: 14 },
      { k: 'pHouse', p: 'Neptune', h: 1, w: 14 },
      { k: 'asteroid', aster: 'Apollo', target: 'ASC', w: 16 },
      { k: 'midpt', m1: 'Sun', m2: 'Neptune', target: 'ASC', w: 14 },
      { k: 'midpt', m1: 'Venus', m2: 'Neptune', target: 'ASC', w: 12 },
    ], undefined,
    'Sun or Venus contacting Neptune places dreamlike ambiguity on your visible self — the same quality close-up cinema lenses amplify. Neptune in the 5th or rising adds the photogenic veil that translates onto film. This signature does not require ambition for film; it only requires that a camera ever see you.'),

  G('storytelling', 'Storytelling', 'performance',
    'You arrange events into meaning. People listen even when the story is about laundry.',
    'Write 500 words a day for 90 days, no exceptions. Read three from The Moth podcast each week and analyze the structure.',
    [
      { k: 'pSign', p: 'Sun', s: 'Sagittarius', w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Jupiter', a: 'conj', w: 16 },
      { k: 'aspect', p1: 'Mercury', p2: 'Jupiter', a: 'trine', w: 14 },
      { k: 'pHouse', p: 'Mercury', h: 9, w: 14 },
      { k: 'pHouse', p: 'Mercury', h: 3, w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Neptune', a: 'trine', w: 12 },
    ]),

  G('modeling', 'Modeling', 'performance',
    'Your features photograph differently than they look in person — the camera elongates and stylizes you. This is structural, not opinion.',
    'Get test shots from two different photographers. Submit to two agencies. Track responses; the data is the answer.',
    [
      { k: 'onAngle', body: 'Venus', angle: 'ASC', w: 22 },
      { k: 'aspect', p1: 'Venus', p2: 'Neptune', a: 'conj', w: 14 },
      { k: 'signOnAngle', s: 'Libra', angle: 'ASC', w: 14 },
      { k: 'pHouse', p: 'Venus', h: 1, w: 14 },
      { k: 'pSign', p: 'ASC', s: 'Libra', w: 12 },
      { k: 'pSign', p: 'ASC', s: 'Pisces', w: 10 },
    ]),

  G('rhythm', 'Rhythm', 'performance',
    'Internal metronome locked. You can feel a half-beat off in music others don\'t notice.',
    'Drum or beat-box exercises 10 min/day. Try odd time signatures (5/4, 7/8) — they\'ll click for you faster than they should.',
    [
      { k: 'aspect', p1: 'Mars', p2: 'Saturn', a: 'sextile', w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Mars', a: 'conj', w: 12 },
      { k: 'pSign', p: 'Mars', s: 'Capricorn', w: 10 },
      { k: 'pSign', p: 'Mercury', s: 'Virgo', w: 10 },
      { k: 'aspect', p1: 'Venus', p2: 'Saturn', a: 'sextile', w: 10 },
    ]),

  G('publicSpeaking', 'Public Speaking', 'performance',
    'You stay regulated under crowd attention. Your voice doesn\'t shake when 500 eyes turn.',
    'Toastmasters or local speaker meetups, weekly. Record yourself. The goal is to watch yourself comfortably, not to be flawless.',
    [
      { k: 'pSign', p: 'Sun', s: 'Sagittarius', w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Jupiter', a: 'conj', w: 16 },
      { k: 'onAngle', body: 'Mercury', angle: 'MC', w: 18 },
      { k: 'pHouse', p: 'Mercury', h: 10, w: 14 },
      { k: 'pHouse', p: 'Mercury', h: 9, w: 12 },
      { k: 'pHouse', p: 'Jupiter', h: 1, w: 12 },
    ]),

  G('standUpComedy', 'Stand-Up Comedy', 'performance',
    'You convert your trauma and observations into laugh lines. The pain stops being yours and becomes the room\'s.',
    'Open mic once per week, hard rule. Year one is data collection: which jokes work, which die, why.',
    [
      { k: 'aspect', p1: 'Mercury', p2: 'Uranus', a: 'conj', w: 18 },
      { k: 'aspect', p1: 'Mars', p2: 'Mercury', a: 'conj', w: 14 },
      { k: 'pSign', p: 'Sun', s: 'Aquarius', w: 10 },
      { k: 'pSign', p: 'Mercury', s: 'Sagittarius', w: 10 },
      { k: 'pHouse', p: 'Uranus', h: 5, w: 14 },
      { k: 'pHouse', p: 'Mercury', h: 5, w: 12 },
    ], ['shadow']),

  G('improv', 'Improv', 'performance',
    'You generate plot in real time and accept whatever your scene partner offers. Yes-and is your default brain mode.',
    'Take a Level 1 improv class (UCB, Second City, IO, or local). Six weeks. Show up nervous; show up anyway.',
    [
      { k: 'aspect', p1: 'Mercury', p2: 'Uranus', a: 'conj', w: 16 },
      { k: 'aspect', p1: 'Mercury', p2: 'Uranus', a: 'trine', w: 12 },
      { k: 'pSign', p: 'Mercury', s: 'Gemini', w: 14 },
      { k: 'pSign', p: 'Sun', s: 'Gemini', w: 12 },
      { k: 'pHouse', p: 'Uranus', h: 3, w: 10 },
    ]),

  G('drama', 'Dramatic Range', 'performance',
    'You can hold tragedy and comedy in the same scene. Casting directors call this "range".',
    'Learn one Shakespeare monologue and one contemporary comedy bit. Perform both for a coach. The contrast reveals your edges.',
    [
      { k: 'aspect', p1: 'Sun', p2: 'Pluto', a: 'square', w: 14 },
      { k: 'aspect', p1: 'Sun', p2: 'Pluto', a: 'opp', w: 14 },
      { k: 'aspect', p1: 'Moon', p2: 'Pluto', a: 'conj', w: 14 },
      { k: 'pSign', p: 'Moon', s: 'Scorpio', w: 12 },
      { k: 'pHouse', p: 'Pluto', h: 5, w: 14 },
    ]),

  G('songwriting', 'Songwriting', 'performance',
    'Words and melody arrive together for you. Other writers struggle to fuse them; you separate them only to refine.',
    'Write one song per week for 12 weeks. Quality is irrelevant; volume is the lesson.',
    [
      { k: 'aspect', p1: 'Mercury', p2: 'Venus', a: 'conj', w: 18 },
      { k: 'aspect', p1: 'Mercury', p2: 'Neptune', a: 'sextile', w: 12 },
      { k: 'pSign', p: 'Mercury', s: 'Pisces', w: 12 },
      { k: 'pSign', p: 'Venus', s: 'Pisces', w: 12 },
      { k: 'asteroid', aster: 'Apollo', target: 'Mercury', w: 14 },
    ]),

  G('musicProduction', 'Music Production', 'performance',
    'You hear the finished mix in your head before you record. The tools are an interface to a sound you already know.',
    'Pick one DAW (Ableton, Logic, FL) and finish 10 short tracks. Don\'t learn five at once.',
    [
      { k: 'aspect', p1: 'Mercury', p2: 'Uranus', a: 'conj', w: 16 },
      { k: 'aspect', p1: 'Venus', p2: 'Uranus', a: 'conj', w: 14 },
      { k: 'pSign', p: 'Mercury', s: 'Aquarius', w: 12 },
      { k: 'pHouse', p: 'Uranus', h: 5, w: 12 },
      { k: 'pHouse', p: 'Venus', h: 11, w: 10 },
    ]),

  G('hosting', 'Hosting / Emcee', 'performance',
    'You hold a room\'s attention and direct its emotion at will. Live events, podcasts, and panels fit you naturally.',
    'Host one event per month — a friend\'s podcast, a community panel, a fundraiser. The reps are the credential.',
    [
      { k: 'pSign', p: 'Mercury', s: 'Leo', w: 12 },
      { k: 'pSign', p: 'Sun', s: 'Leo', w: 12 },
      { k: 'aspect', p1: 'Sun', p2: 'Mercury', a: 'conj', w: 14 },
      { k: 'pHouse', p: 'Mercury', h: 5, w: 12 },
      { k: 'onAngle', body: 'Mercury', angle: 'MC', w: 16 },
    ]),

  G('mimicry', 'Mimicry', 'performance',
    'You absorb accents, postures, and verbal tics by listening once and reproducing them. Your nervous system records other humans automatically.',
    'Pick a speaker and shadow-speak for 5 min/day. Build a deck of three reliable impressions before going public.',
    [
      { k: 'pSign', p: 'Mercury', s: 'Gemini', w: 14 },
      { k: 'pSign', p: 'Moon', s: 'Pisces', w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Neptune', a: 'conj', w: 14 },
      { k: 'pHouse', p: 'Mercury', h: 3, w: 10 },
    ]),

  G('fashionSense', 'Fashion Sense', 'performance',
    'You read texture, silhouette, and color combinations as a visual language. You know why an outfit works before others articulate it.',
    'Build a personal-style inspiration board (75 references). Identify three repeating elements; that is your signature.',
    [
      { k: 'pSign', p: 'Venus', s: 'Libra', w: 14 },
      { k: 'pSign', p: 'Venus', s: 'Taurus', w: 12 },
      { k: 'pHouse', p: 'Venus', h: 1, w: 12 },
      { k: 'aspect', p1: 'Venus', p2: 'Uranus', a: 'conj', w: 14 },
      { k: 'asteroid', aster: 'Pallas', target: 'Venus', w: 12 },
    ]),

  G('costumeDesign', 'Costume / Wardrobe Design', 'performance',
    'You understand how cloth tells character. You can dress a fictional person and the audience knows them in 3 seconds.',
    'Sketch wardrobe for three characters from a film or novel. Take one to actual fabric and pattern stage.',
    [
      { k: 'aspect', p1: 'Venus', p2: 'Uranus', a: 'conj', w: 14 },
      { k: 'pSign', p: 'Venus', s: 'Libra', w: 12 },
      { k: 'asteroid', aster: 'Pallas', target: 'Venus', w: 14 },
      { k: 'pHouse', p: 'Venus', h: 5, w: 10 },
    ]),

  G('choreography', 'Choreography', 'performance',
    'You can compose movement for other bodies. You see formations and patterns, not just steps.',
    'Choreograph a 30-second piece for two dancers. Stage it. The choreography exists when bodies execute it, not when you think it.',
    [
      { k: 'aspect', p1: 'Venus', p2: 'Mars', a: 'conj', w: 14 },
      { k: 'asteroid', aster: 'Pallas', target: 'Mars', w: 14 },
      { k: 'pSign', p: 'Mars', s: 'Leo', w: 10 },
      { k: 'pHouse', p: 'Mars', h: 5, w: 12 },
    ]),

  G('voiceActing', 'Voice Acting', 'performance',
    'You can split your voice from your face. Characters live in your throat without your body involved.',
    'Record three different character demos (animation hero, gritty noir, warm narrator). Submit to one casting platform.',
    [
      { k: 'aspect', p1: 'Mercury', p2: 'Neptune', a: 'conj', w: 16 },
      { k: 'pSign', p: 'Mercury', s: 'Pisces', w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 5, w: 12 },
      { k: 'asteroid', aster: 'Apollo', target: 'Mercury', w: 14 },
    ]),

  G('comicPersona', 'Comic Persona', 'performance',
    'You have a heightened self that audiences accept as real. Larry David\'s "Larry," Tig Notaro\'s "Tig" — that level of crafted self.',
    'Define your comic persona in one sentence. Everything you write should sound like that character, not generic-you.',
    [
      { k: 'aspect', p1: 'Sun', p2: 'Uranus', a: 'conj', w: 14 },
      { k: 'pSign', p: 'Sun', s: 'Aquarius', w: 12 },
      { k: 'pHouse', p: 'Uranus', h: 1, w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 5, w: 10 },
    ]),

  G('hostingPodcast', 'Podcast Hosting', 'performance',
    'You can carry a 60-minute conversation without filler. You ask follow-ups, not script-questions.',
    'Launch a 6-episode test podcast. Don\'t commit to 100 episodes; commit to finishing 6.',
    [
      { k: 'pSign', p: 'Mercury', s: 'Gemini', w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Jupiter', a: 'conj', w: 14 },
      { k: 'pHouse', p: 'Mercury', h: 3, w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 11, w: 10 },
    ]),

  G('rapping', 'Rap / Spoken Word', 'performance',
    'You compress meaning into beats. Internal rhyme, multisyllabic structure, and rhythmic phrasing come pre-loaded.',
    'Write 16 bars a week to a beat. Performance optional in year one; the writing is the muscle.',
    [
      { k: 'aspect', p1: 'Mercury', p2: 'Mars', a: 'conj', w: 16 },
      { k: 'aspect', p1: 'Mercury', p2: 'Pluto', a: 'conj', w: 14 },
      { k: 'pSign', p: 'Mercury', s: 'Scorpio', w: 12 },
      { k: 'pSign', p: 'Mars', s: 'Gemini', w: 10 },
      { k: 'pHouse', p: 'Mercury', h: 3, w: 10 },
    ]),

  G('musicalInstrument', 'Instrumental / Musical Mastery', 'performance',
    'Repetitive practice doesn\'t bore you. Your hands learn faster than your conscious mind tracks. You hear the right note before you play it.',
    'Pick one instrument and commit to 60 days of 30-minute practice. Track adherence, not progress.',
    [
      // Mars–Saturn / Mercury–Saturn = the disciplined practitioner
      { k: 'aspect', p1: 'Mars', p2: 'Saturn', a: 'sextile', w: 12 },
      { k: 'aspect', p1: 'Mars', p2: 'Saturn', a: 'trine', w: 10 },
      { k: 'aspect', p1: 'Mercury', p2: 'Saturn', a: 'sextile', w: 12 },
      // Venus–Mars = the rhythmic/sensual coupling musicians need
      { k: 'aspect', p1: 'Venus', p2: 'Mars', a: 'conj', w: 14 },
      { k: 'aspect', p1: 'Venus', p2: 'Mars', a: 'trine', w: 12 },
      { k: 'aspect', p1: 'Venus', p2: 'Mars', a: 'sextile', w: 10 },
      // Venus–Neptune = the inspired ear, the dreamy melodicist
      { k: 'aspect', p1: 'Venus', p2: 'Neptune', a: 'conj', w: 14 },
      { k: 'aspect', p1: 'Venus', p2: 'Neptune', a: 'trine', w: 12 },
      { k: 'aspect', p1: 'Venus', p2: 'Neptune', a: 'sextile', w: 10 },
      // Venus–Uranus = original, unconventional musician
      { k: 'aspect', p1: 'Venus', p2: 'Uranus', a: 'conj', w: 12 },
      { k: 'aspect', p1: 'Venus', p2: 'Uranus', a: 'trine', w: 10 },
      // Sign emphasis
      { k: 'pSign', p: 'Venus', s: 'Taurus', w: 12 },   // throat / resonance
      { k: 'pSign', p: 'Venus', s: 'Pisces', w: 12 },   // sublime / poetic
      { k: 'pSign', p: 'Venus', s: 'Libra', w: 10 },    // aesthetic balance
      { k: 'pSign', p: 'Venus', s: 'Leo', w: 10 },      // performative
      { k: 'pSign', p: 'Mercury', s: 'Pisces', w: 8 },  // poetic phrasing
      // Houses
      { k: 'pHouse', p: 'Venus', h: 5, w: 12 },
      { k: 'pHouse', p: 'Venus', h: 3, w: 8 },          // articulation
      { k: 'pHouse', p: 'Neptune', h: 5, w: 10 },
      { k: 'pHouse', p: 'Neptune', h: 3, w: 8 },
      { k: 'houseFocus', h: 5, min: 2, w: 10 },
      // Apollo (the muse / fame asteroid) — strong musician signature
      { k: 'asteroid', aster: 'Apollo', target: 'Venus', w: 16 },
      { k: 'asteroid', aster: 'Apollo', target: 'Sun', w: 14 },
      { k: 'asteroid', aster: 'Apollo', target: 'Mercury', w: 12 },
      { k: 'asteroid', aster: 'Apollo', target: 'ASC', w: 14 },
      // Midpoint engine
      { k: 'midpt', m1: 'Venus', m2: 'Neptune', target: 'Sun', w: 14 },
      { k: 'midpt', m1: 'Venus', m2: 'Neptune', target: 'Mercury', w: 14 },
      { k: 'midpt', m1: 'Venus', m2: 'Mars', target: 'Neptune', w: 12 },
      { k: 'midpt', m1: 'Venus', m2: 'Apollo', target: 'Sun', w: 14 },
      { k: 'midpt', m1: 'Sun', m2: 'Venus', target: 'Neptune', w: 12 },
      { k: 'midpt', m1: 'Mercury', m2: 'Neptune', target: 'Venus', w: 12 },
    ], undefined,
    'Venus contacts Neptune and/or Mars in your chart — the rhythmic/sensual ear that produces musicians. Apollo (the muse asteroid) anchors to a personal point or angle, marking the soul that came here to make sound.'),

  G('directing', 'Film / Theater Directing', 'performance',
    'You see the whole frame at once and direct it without losing the actor in front of you. Macro and micro at the same time.',
    'Direct a 5-minute short. The constraint is the lesson — limited budget forces visual decision-making.',
    [
      { k: 'aspect', p1: 'Sun', p2: 'Saturn', a: 'sextile', w: 12 },
      { k: 'pSign', p: 'Sun', s: 'Capricorn', w: 12 },
      { k: 'asteroid', aster: 'Pallas', target: 'Sun', w: 14 },
      { k: 'pHouse', p: 'Sun', h: 5, w: 10 },
      { k: 'pHouse', p: 'Sun', h: 10, w: 12 },
    ]),

  G('crowdMagnetism', 'Crowd Magnetism', 'performance',
    'Strangers feel the gravity of you across a room. You don\'t pursue attention; it arrives.',
    'Practice entering and not selling — be in the room without performing. The magnetism deepens when you\'re not chasing it.',
    [
      { k: 'onAngle', body: 'Sun', angle: 'ASC', w: 22 },
      { k: 'onAngle', body: 'Pluto', angle: 'ASC', w: 22 },
      { k: 'aspect', p1: 'Sun', p2: 'Pluto', a: 'conj', w: 16 },
      { k: 'pSign', p: 'ASC', s: 'Leo', w: 12 },
      { k: 'pSign', p: 'ASC', s: 'Scorpio', w: 12 },
    ], ['power']),

  // ════════════════════════════════════════════════════════════
  // SPIRITUAL GIFTS (32)
  // ════════════════════════════════════════════════════════════

  G('telepathy', 'Telepathy', 'spiritual',
    'You receive thoughts and emotions from people who haven\'t spoken yet. The phone rings and you already know who.',
    'Track receptions for 30 days. Note the time, the sender, and the verification. Pattern recognition will calibrate you.',
    [
      { k: 'aspect', p1: 'Mercury', p2: 'Neptune', a: 'conj', w: 18 },
      { k: 'aspect', p1: 'Mercury', p2: 'Pluto', a: 'conj', w: 14 },
      { k: 'pSign', p: 'Mercury', s: 'Pisces', w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 12, w: 14 },
      { k: 'asteroid', aster: 'Psyche', target: 'Mercury', w: 14 },
    ]),

  G('mediumship', 'Mediumship', 'spiritual',
    'The dead reach you specifically. You\'ve had verifiable transmissions — names, dates, or details you couldn\'t have known.',
    'Train with a vetted teacher (Lily Dale, Arthur Findlay College tradition) — untrained mediumship causes harm. Two-year arc minimum.',
    [
      { k: 'pHouse', p: 'Pluto', h: 8, w: 16 },
      { k: 'pHouse', p: 'Pluto', h: 12, w: 16 },
      { k: 'pHouse', p: 'Moon', h: 8, w: 12 },
      { k: 'aspect', p1: 'Moon', p2: 'Neptune', a: 'conj', w: 14 },
      { k: 'aspect', p1: 'Moon', p2: 'Pluto', a: 'conj', w: 14 },
      { k: 'pSign', p: 'Moon', s: 'Scorpio', w: 12 },
    ]),

  G('clairvoyance', 'Clairvoyance', 'spiritual',
    'You see in images. Closed-eye visuals come unbidden and turn out to be accurate later.',
    'Keep a vision journal. Date every image; check verification 1, 7, 30, and 90 days later.',
    [
      { k: 'aspect', p1: 'Moon', p2: 'Neptune', a: 'conj', w: 18 },
      { k: 'pHouse', p: 'Moon', h: 12, w: 14 },
      { k: 'pSign', p: 'Moon', s: 'Pisces', w: 14 },
      { k: 'pSign', p: 'Moon', s: 'Cancer', w: 12 },
      { k: 'asteroid', aster: 'Urania', target: 'Moon', w: 14 },
    ]),

  G('propheticDreams', 'Prophetic Dreams', 'spiritual',
    'Your dreams contain advance information. You wake with a name, a number, an event — and it shows up later.',
    'Dream journal at the bedside. Write before fully waking. Tag dreams with date stamps; check accuracy quarterly.',
    [
      { k: 'aspect', p1: 'Moon', p2: 'Neptune', a: 'conj', w: 18 },
      { k: 'aspect', p1: 'Moon', p2: 'Neptune', a: 'trine', w: 14 },
      { k: 'pSign', p: 'Moon', s: 'Pisces', w: 14 },
      { k: 'pHouse', p: 'Moon', h: 12, w: 14 },
      { k: 'pHouse', p: 'Neptune', h: 12, w: 14 },
    ]),

  G('auraReading', 'Aura / Energy Reading', 'spiritual',
    'You see or feel a person\'s energy field as distinct from their body. You read mood without facial cues.',
    'Practice in low-light by gazing softly past someone at a blank wall. Note color and texture; verify with the person.',
    [
      { k: 'aspect', p1: 'Sun', p2: 'Neptune', a: 'conj', w: 14 },
      { k: 'asteroid', aster: 'Psyche', target: 'Sun', w: 14 },
      { k: 'pSign', p: 'Sun', s: 'Pisces', w: 12 },
      { k: 'pHouse', p: 'Neptune', h: 1, w: 12 },
      { k: 'pHouse', p: 'Neptune', h: 12, w: 12 },
    ]),

  G('energyHealing', 'Energy Healing', 'spiritual',
    'Your hands or presence regulate other people\'s nervous systems. They sleep better after sessions; pain dials down without explanation.',
    'Train in one modality (Reiki, Pranic, Polarity). Document outcomes with consenting friends — your evidence is your credential.',
    [
      { k: 'aspect', p1: 'Moon', p2: 'Neptune', a: 'trine', w: 14 },
      { k: 'pHouse', p: 'Neptune', h: 6, w: 14 },
      { k: 'pHouse', p: 'Chiron', h: 6, w: 14 },
      { k: 'asteroid', aster: 'Hygiea', target: 'Sun', w: 16 },
      { k: 'asteroid', aster: 'Hygiea', target: 'ASC', w: 16 },
      { k: 'asteroid', aster: 'Chiron', target: 'Moon', w: 14 },
    ], ['healing']),

  G('hypnosis', 'Hypnotic Voice / Hypnosis', 'spiritual',
    'Your voice can drop another person into trance. Subjects describe feeling held, slowed, opened.',
    'Train in clinical or Ericksonian hypnosis. The skill is responsibility, not party trick.',
    [
      // Mercury–Pluto = penetrating, depth-inducing speech
      { k: 'aspect', p1: 'Mercury', p2: 'Pluto', a: 'conj', w: 18 },
      { k: 'aspect', p1: 'Mercury', p2: 'Pluto', a: 'trine', w: 14 },
      { k: 'aspect', p1: 'Mercury', p2: 'Pluto', a: 'sextile', w: 12 },
      // Mercury–Neptune = trance-inducing, dreamlike voice
      { k: 'aspect', p1: 'Mercury', p2: 'Neptune', a: 'conj', w: 14 },
      { k: 'aspect', p1: 'Mercury', p2: 'Neptune', a: 'trine', w: 12 },
      // Voice signatures
      { k: 'pSign', p: 'Mercury', s: 'Scorpio', w: 14 },
      { k: 'pSign', p: 'Mercury', s: 'Pisces', w: 12 },
      { k: 'pSign', p: 'Mercury', s: 'Taurus', w: 10 },  // resonant throat sign
      // Scorpio rising / 8th house emphasis
      { k: 'signOnAngle', s: 'Scorpio', angle: 'ASC', w: 14 },
      { k: 'signOnAngle', s: 'Pisces', angle: 'ASC', w: 10 },
      { k: 'pHouse', p: 'Pluto', h: 1, w: 12 },
      { k: 'pHouse', p: 'Pluto', h: 8, w: 10 },
      { k: 'pHouse', p: 'Mercury', h: 8, w: 10 },
      { k: 'pHouse', p: 'Mercury', h: 12, w: 10 },
      // Pluto on angles = magnetic presence
      { k: 'onAngle', body: 'Pluto', angle: 'ASC', w: 16 },
      { k: 'onAngle', body: 'Pluto', angle: 'MC', w: 12 },
      // Midpoint engine — Mercury/Pluto midpoint at Moon = subconscious
      // access through speech (the textbook hypnotist signature)
      { k: 'midpt', m1: 'Mercury', m2: 'Pluto', target: 'Moon', w: 18 },
      { k: 'midpt', m1: 'Mercury', m2: 'Pluto', target: 'ASC', w: 18 },
      { k: 'midpt', m1: 'Mercury', m2: 'Pluto', target: 'Sun', w: 14 },
      { k: 'midpt', m1: 'Mercury', m2: 'Neptune', target: 'Pluto', w: 14 },
      { k: 'midpt', m1: 'Neptune', m2: 'Pluto', target: 'Mercury', w: 12 },
    ], ['power'],
    'Mercury contacts Pluto and/or Neptune in your chart — the depth-induction signature of voices that drop people into trance. The Mercury/Pluto midpoint at the Moon or angles is the textbook hypnotist marker.'),

  G('tarotSkill', 'Tarot Intuition', 'spiritual',
    'The cards talk to you specifically. Spread layouts produce sentences, not symbol-by-symbol translations.',
    'Pull one card daily for 90 days. Write the day\'s thesis before the day starts; review nightly.',
    [
      { k: 'aspect', p1: 'Mercury', p2: 'Neptune', a: 'conj', w: 14 },
      { k: 'aspect', p1: 'Mercury', p2: 'Pluto', a: 'sextile', w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 8, w: 14 },
      { k: 'asteroid', aster: 'Urania', target: 'Mercury', w: 16 },
      { k: 'pSign', p: 'Sun', s: 'Scorpio', w: 10 },
    ]),

  G('spiritCommunication', 'Spirit Communication', 'spiritual',
    'You receive guidance from non-physical sources — guides, ancestors, or higher selves — distinct from your own thinking.',
    'Schedule a 20-minute weekly session. Same time, same chair. Consistency builds the channel.',
    [
      { k: 'pHouse', p: 'Neptune', h: 12, w: 16 },
      { k: 'pHouse', p: 'Pluto', h: 12, w: 14 },
      { k: 'aspect', p1: 'Moon', p2: 'Pluto', a: 'trine', w: 12 },
      { k: 'asteroid', aster: 'Karma', target: 'Moon', w: 12 },
      { k: 'asteroid', aster: 'Psyche', target: 'Moon', w: 12 },
    ]),

  G('soulReading', 'Soul Reading', 'spiritual',
    'You see a person\'s lifetime arc — what they\'re here to do — within minutes of meeting them.',
    'Practice on close friends first with their consent. Write three sentences about their core arc; ask for accuracy feedback.',
    [
      { k: 'asteroid', aster: 'Psyche', target: 'Sun', w: 16 },
      { k: 'asteroid', aster: 'Psyche', target: 'Moon', w: 14 },
      { k: 'pHouse', p: 'Pluto', h: 9, w: 12 },
      { k: 'aspect', p1: 'Sun', p2: 'Neptune', a: 'trine', w: 12 },
      { k: 'pSign', p: 'Sun', s: 'Pisces', w: 10 },
    ]),

  G('astrologyTalent', 'Astrology Talent', 'spiritual',
    'Charts speak to you. You see structure, story, and timing in glyphs faster than most learn the meanings.',
    'Take one well-taught course (Demetra George, Steven Forrest, or equivalent). Cast 50 charts before opining publicly.',
    [
      // ── Direct Mercury–Uranus contact (the classical signature) ──
      { k: 'aspect', p1: 'Mercury', p2: 'Uranus', a: 'conj', w: 18 },
      { k: 'aspect', p1: 'Mercury', p2: 'Uranus', a: 'trine', w: 14 },
      { k: 'aspect', p1: 'Mercury', p2: 'Uranus', a: 'opp', w: 12 },
      // Sun–Uranus also produces astrological mind
      { k: 'aspect', p1: 'Sun', p2: 'Uranus', a: 'conj', w: 14 },
      // ── Urania (Angel #11911) — the asteroid of astrology itself ──
      // Trimmed from 8 conjunction targets to 5: only luminaries, angles,
      // Mercury, Jupiter, Vesta. Saturn/Pallas/Moon/Sun-of-Sun were too
      // numerous — Urania orbits ~3.7 yr so with 8+ targets at 2-3° orb
      // some conjunction fires on most charts.
      { k: 'asteroid', aster: 'Urania', target: 'Mercury', w: 22 },
      { k: 'asteroid', aster: 'Urania', target: 'Sun', w: 18 },
      { k: 'asteroid', aster: 'Urania', target: 'ASC', w: 18 },
      { k: 'asteroid', aster: 'Urania', target: 'MC', w: 16 },
      { k: 'asteroid', aster: 'Urania', target: 'Jupiter', w: 24 },  // philosophical-cosmic intelligence fusion — top-tier astrologer
      { k: 'asteroid', aster: 'Urania', target: 'Vesta', w: 16 },    // sacred-devoted astrologer
      // ── Aquarius emphasis (the sign of astrology) ──
      // Trimmed: dropped Sun-in-Aqu and Moon-in-Aqu (each 1/12 charts);
      // Mercury-Aqu is the actual signature, Aqu rising amplifies it.
      { k: 'pSign', p: 'Mercury', s: 'Aquarius', w: 14 },
      { k: 'signOnAngle', s: 'Aquarius', angle: 'ASC', w: 12 },
      // ── 9th house emphasis (esoteric knowledge) ──
      // Trimmed: dropped 11th-house variants (community wisdom is too
      // generic) and Sun/Saturn 9th (any wisdom-seeker fires these).
      { k: 'pHouse', p: 'Uranus', h: 9, w: 14 },
      { k: 'pHouse', p: 'Mercury', h: 9, w: 12 },
      { k: 'houseFocus', h: 9, min: 3, w: 10 },  // tightened min:2 → min:3
      // ── Jupiter–Mercury teaching signature ──
      // Trimmed all generic Jupiter-in-{Sag,Pisces,Virgo,Aquarius} rules
      // (each fires on 1/12 of all charts for free) and Jupiter-in-house
      // bloat. Only the genuine teaching/9th-house chart marker remains.
      { k: 'aspect', p1: 'Mercury', p2: 'Jupiter', a: 'conj', w: 12 },
      { k: 'pHouse', p: 'Jupiter', h: 9, w: 14 },
      // ── Pallas — pattern recognition asteroid ──
      { k: 'asteroid', aster: 'Pallas', target: 'Mercury', w: 10 },
      // ── Midpoint engine — keep only the textbook fingerprints ──
      // Trimmed from 12 midpoint rules to 3: the three highest-signal
      // pictures (Mercury/Uranus on Sun, ASC, MC). The other 9 were
      // duplicates and reverse pictures of the same geometry.
      { k: 'midpt', m1: 'Mercury', m2: 'Uranus', target: 'Sun', w: 18 },
      { k: 'midpt', m1: 'Mercury', m2: 'Uranus', target: 'ASC', w: 18 },
      { k: 'midpt', m1: 'Mercury', m2: 'Uranus', target: 'MC', w: 16 },
      // ── Dispositor chains REMOVED ──
      // The 11 dispositor rules fired on virtually any chart with a
      // career stellium (banker, CEO, builder, scientist all hit them).
      // They added 60-80 raw points of structural noise to Astrology
      // Talent without indicating astrological aptitude specifically.
    ], ['intelligence'],
    'Mercury–Uranus contact, Urania asteroid, Aquarius emphasis, and 9th/11th house weight all converge in your chart — the classical fingerprint of natural astrological aptitude. The midpoint of Mercury and Uranus landing on a luminary or angle is the rarest variant and marks chart-readers who become known for it. When the dispositor chain of Jupiter or Mercury lands in your career or 9th house, the astrology becomes vocational, not hobby.'),

  G('numerologyInsight', 'Numerology', 'spiritual',
    'Numbers hold meaning to you beyond arithmetic. You spot date patterns, name vibrations, and life-cycle math intuitively.',
    'Calculate your own life path, expression, soul urge. Check three patterns against actual life events.',
    [
      { k: 'pSign', p: 'Mercury', s: 'Virgo', w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Saturn', a: 'sextile', w: 12 },
      { k: 'asteroid', aster: 'Pallas', target: 'Mercury', w: 14 },
      { k: 'asteroid', aster: 'Urania', target: 'Mercury', w: 12 },
    ]),

  G('pastLifeRecall', 'Past-Life Recall', 'spiritual',
    'You remember without prompting. Specific eras, languages, deaths, places — they arrive as memory, not fantasy.',
    'Past-life regression with a credentialed therapist (BSCH, IBRT). Skip the carnival hypnotists.',
    [
      { k: 'pHouse', p: 'South Node', h: 12, w: 14 },
      { k: 'pHouse', p: 'Pluto', h: 12, w: 14 },
      { k: 'asteroid', aster: 'Karma', target: 'Sun', w: 16 },
      { k: 'asteroid', aster: 'Karma', target: 'Moon', w: 14 },
      { k: 'pSign', p: 'Moon', s: 'Pisces', w: 10 },
    ]),

  G('akashicAccess', 'Akashic Records Access', 'spiritual',
    'You can pull life-arc information for yourself or others through directed inquiry. The "library" metaphor is literal for you.',
    'Linda Howe\'s pathway prayer and 40-day commitment is the cleanest entry point.',
    [
      { k: 'aspect', p1: 'Sun', p2: 'Neptune', a: 'conj', w: 14 },
      { k: 'pHouse', p: 'Neptune', h: 9, w: 12 },
      { k: 'pHouse', p: 'Jupiter', h: 12, w: 12 },
      { k: 'asteroid', aster: 'Karma', target: 'Mercury', w: 14 },
    ]),

  G('channeling', 'Channeling', 'spiritual',
    'You can step aside and let language flow that isn\'t your usual thinking. The output startles you on review.',
    'Voice-record sessions. Transcribe later. Review monthly for patterns and verifiability.',
    [
      { k: 'aspect', p1: 'Mercury', p2: 'Neptune', a: 'conj', w: 16 },
      { k: 'pHouse', p: 'Neptune', h: 3, w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 12, w: 12 },
      { k: 'asteroid', aster: 'Apollo', target: 'Mercury', w: 12 },
      { k: 'asteroid', aster: 'Urania', target: 'Mercury', w: 12 },
    ]),

  G('reikiAffinity', 'Reiki Affinity', 'spiritual',
    'Reiki attunements take quickly with you. Your hands warm and clients report sensation without prompt.',
    'Reiki I, then 3 months of practice before II. Skip lineage-shopping; pick one teacher and finish.',
    [
      { k: 'aspect', p1: 'Moon', p2: 'Neptune', a: 'trine', w: 14 },
      { k: 'asteroid', aster: 'Hygiea', target: 'Moon', w: 14 },
      { k: 'pHouse', p: 'Neptune', h: 6, w: 12 },
      { k: 'pHouse', p: 'Moon', h: 6, w: 10 },
    ], ['healing']),

  G('crystalSensitivity', 'Crystal Sensitivity', 'spiritual',
    'You feel tangible energetic differences between stones. Quartz vs amethyst is not metaphor for you.',
    'Build a working set of 5 stones, not 50. Track which you reach for in which moods for 60 days.',
    [
      { k: 'aspect', p1: 'Venus', p2: 'Neptune', a: 'sextile', w: 12 },
      { k: 'pHouse', p: 'Venus', h: 12, w: 10 },
      { k: 'pSign', p: 'Venus', s: 'Taurus', w: 10 },
      { k: 'pSign', p: 'Moon', s: 'Pisces', w: 10 },
    ]),

  G('plantMedicine', 'Plant Medicine Sensitivity', 'spiritual',
    'You receive teaching from plant intelligences. Mushrooms, ayahuasca, peyote arrive as tutors with specific lessons.',
    'Only with vetted facilitators in legal contexts. Integration matters more than ceremony.',
    [
      { k: 'pHouse', p: 'Neptune', h: 8, w: 14 },
      { k: 'pHouse', p: 'Pluto', h: 12, w: 14 },
      { k: 'pSign', p: 'Moon', s: 'Pisces', w: 10 },
      { k: 'pSign', p: 'Moon', s: 'Scorpio', w: 12 },
    ]),

  G('lucidDreaming', 'Lucid Dreaming', 'spiritual',
    'You wake inside the dream and direct it. Reality checks during day stick because you\'re already half-trained.',
    'Reality-check 10× per day. Keep a dream journal. The Stephen LaBerge protocols work for you.',
    [
      { k: 'aspect', p1: 'Moon', p2: 'Uranus', a: 'conj', w: 12 },
      { k: 'pHouse', p: 'Moon', h: 12, w: 14 },
      { k: 'aspect', p1: 'Moon', p2: 'Neptune', a: 'conj', w: 14 },
      { k: 'pSign', p: 'Moon', s: 'Pisces', w: 10 },
    ]),

  G('astralProjection', 'Astral Projection', 'spiritual',
    'Conscious out-of-body experience is reproducible for you. The vibrational state arrives without panic.',
    'Robert Monroe\'s Hemi-Sync protocols. 90-day commitment, 3 sessions per week.',
    [
      { k: 'pHouse', p: 'Uranus', h: 12, w: 14 },
      { k: 'pHouse', p: 'Neptune', h: 12, w: 12 },
      { k: 'aspect', p1: 'Moon', p2: 'Uranus', a: 'conj', w: 12 },
      { k: 'pSign', p: 'Sun', s: 'Aquarius', w: 10 },
    ]),

  G('shamanicJourney', 'Shamanic Journey', 'spiritual',
    'The drum drops you into non-ordinary reality reliably. You meet allies and bring back tangible information.',
    'Train with FSS (Foundation for Shamanic Studies) or a recognized indigenous teacher. Beware appropriation.',
    [
      { k: 'pSign', p: 'Moon', s: 'Scorpio', w: 12 },
      { k: 'pHouse', p: 'Pluto', h: 12, w: 12 },
      { k: 'aspect', p1: 'Moon', p2: 'Pluto', a: 'trine', w: 12 },
      { k: 'asteroid', aster: 'Karma', target: 'Sun', w: 12 },
    ]),

  G('meditationMastery', 'Meditation Mastery', 'spiritual',
    'You can hold sustained attention without effort. 60 minutes is short for you.',
    'Vipassana 10-day if you haven\'t. Or daily 45-min sittings for a year. Both produce the same result.',
    [
      { k: 'pSign', p: 'Saturn', s: 'Capricorn', w: 10 },
      { k: 'aspect', p1: 'Sun', p2: 'Saturn', a: 'sextile', w: 12 },
      { k: 'pSign', p: 'Sun', s: 'Virgo', w: 10 },
      { k: 'pHouse', p: 'Saturn', h: 12, w: 12 },
      { k: 'asteroid', aster: 'Vesta', target: 'Sun', w: 14 },
    ]),

  G('manifestationPower', 'Manifestation Power', 'spiritual',
    'What you focus on materializes within months. Other people manifest in years; you compress the cycle.',
    'Track 3 manifestation targets quarterly with date stamps. The data over a year is the proof.',
    [
      { k: 'aspect', p1: 'Sun', p2: 'Jupiter', a: 'trine', w: 12 },
      { k: 'aspect', p1: 'Jupiter', p2: 'Pluto', a: 'conj', w: 14 },
      { k: 'asteroid', aster: 'Fortuna', target: 'Sun', w: 14 },
      { k: 'asteroid', aster: 'Fortuna', target: 'Moon', w: 12 },
      { k: 'pHouse', p: 'Jupiter', h: 1, w: 10 },
    ], ['money']),

  G('synchronicityMagnet', 'Synchronicity Magnet', 'spiritual',
    'Improbable connections cluster around you. Right person, right book, right dollar amount — repeatedly, not coincidentally.',
    'Log every synchronicity for 60 days. Pattern reveals which life areas the universe is amplifying.',
    [
      { k: 'aspect', p1: 'Sun', p2: 'Uranus', a: 'trine', w: 12 },
      { k: 'asteroid', aster: 'Fortuna', target: 'ASC', w: 14 },
      { k: 'asteroid', aster: 'Fortuna', target: 'MC', w: 12 },
      { k: 'pHouse', p: 'Uranus', h: 9, w: 10 },
    ]),

  G('animalCommunication', 'Animal Communication', 'spiritual',
    'Animals approach you. You receive emotional information from them — what hurts, what they want, what they remember.',
    'Practice with a friend\'s pet you don\'t know. Send 3 specific questions, write the answers, verify.',
    [
      { k: 'pSign', p: 'Moon', s: 'Cancer', w: 12 },
      { k: 'asteroid', aster: 'Ceres', target: 'Moon', w: 14 },
      { k: 'pHouse', p: 'Moon', h: 6, w: 10 },
      { k: 'pHouse', p: 'Neptune', h: 6, w: 10 },
    ], ['healing']),

  G('moonMagic', 'Lunar Magic', 'spiritual',
    'You time things to lunar cycles and they work. New moon launches, full moon releases — the physics holds for you.',
    'For 6 cycles, set one new-moon intention and one full-moon release. Document outcomes month over month.',
    [
      { k: 'pSign', p: 'Moon', s: 'Cancer', w: 14 },
      { k: 'pHouse', p: 'Moon', h: 4, w: 12 },
      { k: 'aspect', p1: 'Moon', p2: 'Neptune', a: 'trine', w: 12 },
      { k: 'pHouse', p: 'Moon', h: 12, w: 10 },
    ]),

  G('witchEnergy', 'Witch Energy', 'spiritual',
    'You hold ritual technology — candles, herbs, intention — and it actually moves outcomes. Spell-craft is engineering for you, not LARP.',
    'Pick one tradition (folk, hereditary, hedge, chaos) and study seriously for two years. Eclectic shopping doesn\'t build skill.',
    [
      { k: 'asteroid', aster: 'Lilith', target: 'Sun', w: 16 },
      { k: 'asteroid', aster: 'Lilith', target: 'Moon', w: 16 },
      { k: 'pSign', p: 'Sun', s: 'Scorpio', w: 12 },
      { k: 'pSign', p: 'Moon', s: 'Scorpio', w: 12 },
      { k: 'pHouse', p: 'Pluto', h: 12, w: 12 },
    ], ['shadow']),

  G('starseedMemory', 'Starseed Memory', 'spiritual',
    'You feel non-Earth origin distinctly. Pleiadian, Sirian, Arcturian frameworks resonate with specific memories, not just metaphor.',
    'Read three reputable accounts (Lyssa Royal, Barbara Marciniak). Discriminate between memory and fantasy ruthlessly.',
    [
      { k: 'pSign', p: 'Sun', s: 'Aquarius', w: 14 },
      { k: 'pSign', p: 'Moon', s: 'Aquarius', w: 12 },
      { k: 'pHouse', p: 'Uranus', h: 11, w: 14 },
      { k: 'pHouse', p: 'Uranus', h: 12, w: 12 },
      { k: 'aspect', p1: 'Sun', p2: 'Uranus', a: 'conj', w: 12 },
    ]),

  G('galacticChanneling', 'Galactic Channeling', 'spiritual',
    'You translate signal from collective/cosmic intelligence. The information has scope larger than personal.',
    'Voice-record. Don\'t broadcast year one. The job is calibration before audience.',
    [
      { k: 'midpt', m1: 'Uranus', m2: 'Neptune', target: 'Sun', w: 16 },
      { k: 'midpt', m1: 'Uranus', m2: 'Neptune', target: 'Mercury', w: 14 },
      { k: 'aspect', p1: 'Mercury', p2: 'Uranus', a: 'conj', w: 12 },
      { k: 'pSign', p: 'Mercury', s: 'Aquarius', w: 10 },
    ]),

  G('ancestralHealing', 'Ancestral Healing', 'spiritual',
    'You move grief and pattern that isn\'t yours individually. Lineage shifts when you do the work.',
    'Daniel Foor\'s ancestral lineage healing protocol. 12-week arc. The dead want this work done.',
    [
      { k: 'pHouse', p: 'Moon', h: 4, w: 14 },
      { k: 'pHouse', p: 'Pluto', h: 4, w: 12 },
      { k: 'asteroid', aster: 'Karma', target: 'Moon', w: 14 },
      { k: 'asteroid', aster: 'Ceres', target: 'Moon', w: 10 },
    ]),

  G('ritualDesigner', 'Ritual Designer', 'spiritual',
    'You can construct ceremony that produces psychological state-change reliably. The container holds.',
    'Design and run one ritual per quarter for friends. Debrief afterward. The feedback is the curriculum.',
    [
      { k: 'asteroid', aster: 'Vesta', target: 'Sun', w: 14 },
      { k: 'asteroid', aster: 'Vesta', target: 'Moon', w: 12 },
      { k: 'asteroid', aster: 'Pallas', target: 'Sun', w: 12 },
      { k: 'pHouse', p: 'Neptune', h: 9, w: 10 },
    ]),

  G('mysticVoice', 'Mystic Voice', 'spiritual',
    'When you speak about the sacred, listeners go quiet. You translate non-ordinary into ordinary language.',
    'Write one mystical essay per month for a year. Share publicly only after the 12th.',
    [
      { k: 'aspect', p1: 'Mercury', p2: 'Neptune', a: 'trine', w: 14 },
      { k: 'pHouse', p: 'Mercury', h: 12, w: 12 },
      { k: 'asteroid', aster: 'Apollo', target: 'Mercury', w: 12 },
      { k: 'pSign', p: 'Mercury', s: 'Pisces', w: 12 },
    ]),

  // ════════════════════════════════════════════════════════════
  // POWER GIFTS (24)
  // ════════════════════════════════════════════════════════════

  G('leadership', 'Leadership', 'power',
    'You make the call. Others wait for permission; you decide and they follow without resistance.',
    'Take a real leadership role — team lead, board chair, captain — within 90 days. The skill atrophies without reps.',
    [
      { k: 'onAngle', body: 'Sun', angle: 'MC', w: 22 },
      { k: 'aspect', p1: 'Sun', p2: 'Saturn', a: 'sextile', w: 14 },
      { k: 'pSign', p: 'Sun', s: 'Aries', w: 12 },
      { k: 'pSign', p: 'Sun', s: 'Capricorn', w: 14 },
      { k: 'pSign', p: 'Sun', s: 'Leo', w: 12 },
      { k: 'pHouse', p: 'Sun', h: 10, w: 16 },
      { k: 'pHouse', p: 'Sun', h: 1, w: 12 },
    ]),

  G('commandPresence', 'Command Presence', 'power',
    'You walk in and adults adjust. No raised voice; the room re-orients.',
    'Voice-coaching for resonance + posture work (Alexander Technique). Subtle, structural, durable.',
    [
      { k: 'onAngle', body: 'Pluto', angle: 'ASC', w: 22 },
      { k: 'onAngle', body: 'Saturn', angle: 'ASC', w: 18 },
      { k: 'aspect', p1: 'Sun', p2: 'Pluto', a: 'conj', w: 16 },
      { k: 'signOnAngle', s: 'Scorpio', angle: 'ASC', w: 14 },
      { k: 'signOnAngle', s: 'Capricorn', angle: 'ASC', w: 14 },
    ]),

  G('politicalSkill', 'Political Skill', 'power',
    'You read coalitions, factions, and unspoken alliances. You know who actually decides.',
    'Volunteer for a campaign or run for HOA/local board. The lab work matters more than theory.',
    [
      { k: 'pSign', p: 'Mercury', s: 'Libra', w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Pluto', a: 'sextile', w: 14 },
      { k: 'asteroid', aster: 'Pallas', target: 'Mercury', w: 14 },
      { k: 'pHouse', p: 'Mercury', h: 11, w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 7, w: 10 },
    ]),

  G('seductionPower', 'Seductive Magnetism', 'power',
    'You can pull attention with stillness. Other people work for the same effect; you arrive with it.',
    'Stop performing for it. The trap is overuse — the magnetism erodes when wielded constantly.',
    [
      { k: 'aspect', p1: 'Venus', p2: 'Pluto', a: 'conj', w: 18 },
      { k: 'aspect', p1: 'Venus', p2: 'Pluto', a: 'trine', w: 14 },
      { k: 'asteroid', aster: 'Eros', target: 'Venus', w: 18 },
      { k: 'asteroid', aster: 'Eros', target: 'ASC', w: 18 },
      { k: 'asteroid', aster: 'Lilith', target: 'Venus', w: 16 },
      { k: 'pSign', p: 'Venus', s: 'Scorpio', w: 12 },
    ], ['love']),

  G('psychDominance', 'Psychological Dominance', 'power',
    'You read what someone wants and what they fear inside two minutes. You choose whether to use it.',
    'Read Cialdini, Voss, and one volume of Jung. The line between influence and manipulation is your responsibility to hold.',
    [
      { k: 'aspect', p1: 'Mars', p2: 'Pluto', a: 'conj', w: 18 },
      { k: 'aspect', p1: 'Mars', p2: 'Pluto', a: 'trine', w: 14 },
      { k: 'pSign', p: 'Mars', s: 'Scorpio', w: 14 },
      { k: 'pHouse', p: 'Pluto', h: 8, w: 12 },
      { k: 'asteroid', aster: 'Pallas', target: 'Pluto', w: 12 },
    ], ['shadow']),

  G('negotiation', 'Negotiation', 'power',
    'You find the third option neither party brought to the table.',
    'Read Chris Voss\'s "Never Split the Difference". Practice on small stakes — phone bills, salaries, leases — before large.',
    [
      { k: 'pSign', p: 'Mercury', s: 'Libra', w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Venus', a: 'conj', w: 12 },
      { k: 'asteroid', aster: 'Pallas', target: 'Mercury', w: 14 },
      { k: 'pHouse', p: 'Mercury', h: 7, w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Pluto', a: 'sextile', w: 12 },
    ]),

  G('crowdInfluence', 'Crowd Influence', 'power',
    'You can move 200 people\'s emotional state with words. Group dynamics respond to your input disproportionately.',
    'Speak to groups of 30 monthly. Year one: you\'re building tolerance for the energy.',
    [
      { k: 'aspect', p1: 'Sun', p2: 'Jupiter', a: 'conj', w: 14 },
      { k: 'pHouse', p: 'Jupiter', h: 11, w: 14 },
      { k: 'pSign', p: 'Sun', s: 'Sagittarius', w: 12 },
      { k: 'pHouse', p: 'Sun', h: 11, w: 12 },
      { k: 'onAngle', body: 'Jupiter', angle: 'MC', w: 14 },
    ]),

  G('warriorSpirit', 'Warrior Spirit', 'power',
    'Conflict doesn\'t scare you. You hold ground others abandon.',
    'Combat sport — boxing, BJJ, MMA — for at least one year. The body remembers what the mind forgets.',
    [
      { k: 'pSign', p: 'Mars', s: 'Aries', w: 16 },
      { k: 'pSign', p: 'Mars', s: 'Scorpio', w: 14 },
      { k: 'pSign', p: 'Mars', s: 'Capricorn', w: 12 },
      { k: 'aspect', p1: 'Mars', p2: 'Pluto', a: 'conj', w: 14 },
      { k: 'asteroid', aster: 'Nike', target: 'Mars', w: 16 },
      { k: 'pHouse', p: 'Mars', h: 1, w: 10 },
    ], ['physical']),

  G('strategicAuthority', 'Strategic Authority', 'power',
    'You see five moves ahead and you don\'t signal which.',
    'Play long-form strategy games (Go, chess, Civ VI on long settings). Train the patience musculature.',
    [
      { k: 'asteroid', aster: 'Pallas', target: 'Sun', w: 16 },
      { k: 'asteroid', aster: 'Pallas', target: 'Mercury', w: 16 },
      { k: 'aspect', p1: 'Mercury', p2: 'Saturn', a: 'sextile', w: 12 },
      { k: 'pSign', p: 'Sun', s: 'Capricorn', w: 12 },
      { k: 'pHouse', p: 'Saturn', h: 10, w: 12 },
    ]),

  G('empireBuilding', 'Empire Building', 'power',
    'You hold scope. You can keep 12 fronts in the air without dropping one.',
    'Choose one vertical and 10× it before adding a second. Most empires die from premature diversification.',
    [
      { k: 'pSign', p: 'Sun', s: 'Capricorn', w: 14 },
      { k: 'aspect', p1: 'Saturn', p2: 'Jupiter', a: 'sextile', w: 12 },
      { k: 'aspect', p1: 'Pluto', p2: 'MC', a: 'conj', w: 14 },
      { k: 'pHouse', p: 'Pluto', h: 10, w: 14 },
      { k: 'pHouse', p: 'Saturn', h: 10, w: 12 },
    ], ['money']),

  G('crisisLeadership', 'Crisis Leadership', 'power',
    'When everyone else freezes you start delegating. Pressure clarifies you.',
    'Volunteer with disaster response (Red Cross, Team Rubicon). Real crises teach what tabletop never can.',
    [
      { k: 'aspect', p1: 'Sun', p2: 'Pluto', a: 'square', w: 14 },
      { k: 'aspect', p1: 'Mars', p2: 'Saturn', a: 'sextile', w: 12 },
      { k: 'pSign', p: 'Mars', s: 'Capricorn', w: 12 },
      { k: 'pHouse', p: 'Mars', h: 10, w: 10 },
    ]),

  G('persuasiveVoice', 'Persuasive Voice', 'power',
    'You change minds with sentences. The other person doesn\'t feel pushed; they arrive at the conclusion thinking it was theirs.',
    'Study rhetoric (Aristotle, Cicero, "Thank You for Arguing" by Heinrichs). Then practice.',
    [
      { k: 'aspect', p1: 'Mercury', p2: 'Jupiter', a: 'conj', w: 14 },
      { k: 'aspect', p1: 'Mercury', p2: 'Pluto', a: 'trine', w: 14 },
      { k: 'asteroid', aster: 'Apollo', target: 'Mercury', w: 14 },
      { k: 'pSign', p: 'Mercury', s: 'Sagittarius', w: 10 },
    ]),

  G('tacticalPatience', 'Tactical Patience', 'power',
    'You can wait. While others act on impulse you read the developing situation and intervene at the precise moment.',
    'Train delay. Pick a stake (a purchase, a reply, a confrontation) and wait 24 hours longer than your impulse says.',
    [
      { k: 'pSign', p: 'Saturn', s: 'Capricorn', w: 12 },
      { k: 'aspect', p1: 'Mars', p2: 'Saturn', a: 'conj', w: 12 },
      { k: 'asteroid', aster: 'Vesta', target: 'Mars', w: 12 },
      { k: 'pHouse', p: 'Saturn', h: 8, w: 10 },
    ]),

  G('boardroomDominance', 'Boardroom Dominance', 'power',
    'You walk into corporate rooms as if you already own them. Status hierarchies adjust to your reading.',
    'Take an MBA-level negotiation course. The vocabulary plus your instinct compounds.',
    [
      { k: 'pHouse', p: 'Saturn', h: 10, w: 14 },
      { k: 'aspect', p1: 'Sun', p2: 'Saturn', a: 'conj', w: 14 },
      { k: 'onAngle', body: 'Saturn', angle: 'MC', w: 16 },
      { k: 'pSign', p: 'MC', s: 'Capricorn', w: 12 },
    ], ['money']),

  G('powerBroker', 'Power Broker', 'power',
    'You connect people who otherwise wouldn\'t meet, and you take a position in the connection.',
    'Build a list of 50 high-leverage contacts and introduce two pairs per month. Track outcomes.',
    [
      { k: 'pHouse', p: 'Pluto', h: 11, w: 14 },
      { k: 'pHouse', p: 'Pluto', h: 7, w: 12 },
      { k: 'aspect', p1: 'Jupiter', p2: 'Pluto', a: 'trine', w: 12 },
      { k: 'asteroid', aster: 'Pallas', target: 'Pluto', w: 12 },
    ]),

  G('kingQueenEnergy', 'Sovereign Energy', 'power',
    'You carry inherent rank. Even strangers default to deferring before they decide why.',
    'Robert Moore\'s "King, Warrior, Magician, Lover" archetype work. The maturity arc protects you from tyrant shadow.',
    [
      { k: 'pSign', p: 'Sun', s: 'Leo', w: 14 },
      { k: 'pSign', p: 'Sun', s: 'Capricorn', w: 12 },
      { k: 'onAngle', body: 'Sun', angle: 'MC', w: 16 },
      { k: 'pHouse', p: 'Sun', h: 10, w: 12 },
      { k: 'pHouse', p: 'Saturn', h: 1, w: 10 },
    ]),

  G('subtleManipulation', 'Subtle Manipulation', 'power',
    'You can move outcomes through suggestion alone. Whether to is the question.',
    'Therapy or men\'s/women\'s circle work to keep this aimed at integrity. Untreated, the gift mutates.',
    [
      { k: 'aspect', p1: 'Mercury', p2: 'Pluto', a: 'square', w: 14 },
      { k: 'aspect', p1: 'Venus', p2: 'Pluto', a: 'square', w: 12 },
      { k: 'asteroid', aster: 'Lilith', target: 'Mercury', w: 12 },
      { k: 'pSign', p: 'Mercury', s: 'Scorpio', w: 12 },
    ], ['shadow']),

  G('corporateClimber', 'Corporate Climber', 'power',
    'You decode org charts and unwritten promotion rules quickly. You play the game without losing yourself.',
    'Document promotion criteria in your org. Beat each by 30% before requesting the next step.',
    [
      { k: 'pSign', p: 'MC', s: 'Capricorn', w: 14 },
      { k: 'aspect', p1: 'Saturn', p2: 'MC', a: 'conj', w: 12 },
      { k: 'pHouse', p: 'Saturn', h: 10, w: 12 },
      { k: 'pHouse', p: 'Pluto', h: 6, w: 10 },
    ], ['money']),

  G('militaryMind', 'Military / Tactical Mind', 'power',
    'You think in operations, logistics, and chains of command. The structure feels natural.',
    'Read Sun Tzu, Clausewitz, and Boyd\'s OODA loop. Apply to civilian projects.',
    [
      { k: 'aspect', p1: 'Mars', p2: 'Saturn', a: 'conj', w: 14 },
      { k: 'pSign', p: 'Mars', s: 'Capricorn', w: 12 },
      { k: 'asteroid', aster: 'Pallas', target: 'Mars', w: 14 },
      { k: 'pHouse', p: 'Mars', h: 6, w: 10 },
    ]),

  G('loyaltyDemanding', 'Loyalty Architecture', 'power',
    'You build inner circles that don\'t leak. People die loyal to you because you\'ve been loyal first.',
    'Audit your circle annually. Keep the 5 you\'d call at 3am; release strategic-only ties.',
    [
      { k: 'pSign', p: 'Sun', s: 'Scorpio', w: 12 },
      { k: 'pSign', p: 'Moon', s: 'Scorpio', w: 12 },
      { k: 'aspect', p1: 'Sun', p2: 'Pluto', a: 'trine', w: 12 },
      { k: 'pHouse', p: 'Pluto', h: 11, w: 10 },
    ]),

  G('throneHolding', 'Throne Holding', 'power',
    'You hold a position once won. You don\'t lose ground through inattention.',
    'Build defensive moats around what you\'ve achieved before pursuing the next conquest.',
    [
      { k: 'pSign', p: 'Sun', s: 'Taurus', w: 12 },
      { k: 'aspect', p1: 'Saturn', p2: 'Pluto', a: 'sextile', w: 12 },
      { k: 'pHouse', p: 'Saturn', h: 4, w: 10 },
      { k: 'pHouse', p: 'Saturn', h: 10, w: 14 },
    ]),

  G('powerBehindThrone', 'Power Behind the Throne', 'power',
    'You don\'t need the spotlight to wield decisive influence. Advisors, chiefs of staff, consigliere — your seat is to the right of the chair.',
    'Pick one principal you respect deeply. Make yourself indispensable to them for two years.',
    [
      { k: 'pHouse', p: 'Pluto', h: 8, w: 14 },
      { k: 'pHouse', p: 'Pluto', h: 12, w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Pluto', a: 'conj', w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 12, w: 10 },
    ]),

  G('factionBuilder', 'Faction Builder', 'power',
    'You can assemble a movement. Members feel chosen rather than recruited.',
    'Define your faction\'s creed in one paragraph. Recruit your first 7 hand-picked.',
    [
      { k: 'pHouse', p: 'Sun', h: 11, w: 14 },
      { k: 'pSign', p: 'Sun', s: 'Aquarius', w: 12 },
      { k: 'aspect', p1: 'Sun', p2: 'Uranus', a: 'conj', w: 12 },
      { k: 'pHouse', p: 'Uranus', h: 11, w: 12 },
    ]),

  G('disciplineMastery', 'Discipline Mastery', 'power',
    'You can choose hard things daily for years without external pressure.',
    'Pick one practice and protect it like a sacred contract. Three years minimum.',
    [
      { k: 'aspect', p1: 'Sun', p2: 'Saturn', a: 'conj', w: 16 },
      { k: 'pSign', p: 'Saturn', s: 'Capricorn', w: 14 },
      { k: 'asteroid', aster: 'Vesta', target: 'Sun', w: 14 },
      { k: 'pHouse', p: 'Saturn', h: 1, w: 10 },
      { k: 'pHouse', p: 'Saturn', h: 6, w: 10 },
    ]),

  // ════════════════════════════════════════════════════════════
  // MONEY GIFTS (24)
  // ════════════════════════════════════════════════════════════

  G('salesGenius', 'Sales Genius', 'money',
    'You can close. You read objections as data, not rejection, and you ask for the order without flinching.',
    'Cold-call 100 prospects. Track every conversation. The data trains the instinct.',
    [
      { k: 'aspect', p1: 'Mercury', p2: 'Jupiter', a: 'conj', w: 16 },
      { k: 'aspect', p1: 'Mercury', p2: 'Mars', a: 'sextile', w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 2, w: 14 },
      { k: 'pSign', p: 'Mercury', s: 'Sagittarius', w: 12 },
      { k: 'pSign', p: 'Mercury', s: 'Gemini', w: 10 },
      { k: 'asteroid', aster: 'Fortuna', target: 'Mercury', w: 14 },
    ]),

  G('businessBuilder', 'Business Builder', 'money',
    'You can take an idea from napkin to revenue. The unsexy steps don\'t exhaust you.',
    'Ship a v1 in 30 days. Charge for it. The first dollar is the credential.',
    [
      { k: 'pHouse', p: 'Saturn', h: 2, w: 14 },
      { k: 'pHouse', p: 'Saturn', h: 10, w: 14 },
      { k: 'aspect', p1: 'Saturn', p2: 'Jupiter', a: 'conj', w: 16 },
      { k: 'pSign', p: 'Sun', s: 'Capricorn', w: 12 },
      { k: 'pHouse', p: 'Jupiter', h: 2, w: 12 },
    ]),

  G('luxuryBranding', 'Luxury Branding', 'money',
    'You understand why one bottle costs $40 and another $4,000. You can construct the perceptual gap.',
    'Study 3 luxury brand bibles (Hermès, Chanel, Patek). Identify the codes; apply one to your offer.',
    [
      { k: 'pSign', p: 'Venus', s: 'Taurus', w: 14 },
      { k: 'pSign', p: 'Venus', s: 'Libra', w: 12 },
      { k: 'aspect', p1: 'Venus', p2: 'Jupiter', a: 'conj', w: 14 },
      { k: 'pHouse', p: 'Venus', h: 2, w: 12 },
      { k: 'pHouse', p: 'Venus', h: 10, w: 14 },
    ]),

  G('investmentInstinct', 'Investment Instinct', 'money',
    'You feel asymmetric upside before the spreadsheet confirms it.',
    'Paper-trade for 12 months before risking real capital. Track every thesis.',
    [
      { k: 'pHouse', p: 'Pluto', h: 2, w: 14 },
      { k: 'pHouse', p: 'Pluto', h: 8, w: 16 },
      { k: 'pSign', p: 'Sun', s: 'Scorpio', w: 12 },
      { k: 'aspect', p1: 'Jupiter', p2: 'Pluto', a: 'trine', w: 14 },
      { k: 'pHouse', p: 'Jupiter', h: 8, w: 12 },
    ]),

  G('fastMoneySkill', 'Fast Money Skill', 'money',
    'You can spin up cash quickly when needed. Hustle gear engages without panic.',
    'Pick 3 services you can sell in 7 days (writing, dog-walking, ad campaigns). Test each by selling one to a stranger.',
    [
      { k: 'aspect', p1: 'Mars', p2: 'Jupiter', a: 'conj', w: 14 },
      { k: 'pHouse', p: 'Mars', h: 2, w: 14 },
      { k: 'pSign', p: 'Mars', s: 'Aries', w: 12 },
      { k: 'asteroid', aster: 'Fortuna', target: 'Mars', w: 12 },
    ]),

  G('marketingTalent', 'Marketing Talent', 'money',
    'You see the bridge between a product and the human who needs it. You write the headline that converts.',
    'Run a $500 ad test against your own offer. The CAC tells you whether the instinct is calibrated.',
    [
      { k: 'aspect', p1: 'Mercury', p2: 'Venus', a: 'conj', w: 14 },
      { k: 'aspect', p1: 'Mercury', p2: 'Jupiter', a: 'sextile', w: 12 },
      { k: 'pSign', p: 'Mercury', s: 'Gemini', w: 12 },
      { k: 'pSign', p: 'Mercury', s: 'Libra', w: 10 },
      { k: 'asteroid', aster: 'Pallas', target: 'Mercury', w: 12 },
    ]),

  G('networkingWealth', 'Networking Wealth', 'money',
    'Your relationships compound into income. Doors open through warm introductions, not cold applications.',
    'Build a 100-person CRM with quarterly check-ins. Genuine reciprocity, not transactional.',
    [
      { k: 'pHouse', p: 'Jupiter', h: 11, w: 14 },
      { k: 'aspect', p1: 'Sun', p2: 'Jupiter', a: 'conj', w: 12 },
      { k: 'pSign', p: 'Sun', s: 'Aquarius', w: 10 },
      { k: 'pHouse', p: 'Venus', h: 11, w: 12 },
    ]),

  G('entrepreneurship', 'Entrepreneurship', 'money',
    'Building something from zero where nothing existed feels normal to you. Risk doesn\'t paralyze.',
    'Ship something that makes one dollar from a stranger within 60 days. Repeat until it makes $10K/month.',
    [
      { k: 'aspect', p1: 'Sun', p2: 'Uranus', a: 'conj', w: 14 },
      { k: 'aspect', p1: 'Mars', p2: 'Jupiter', a: 'conj', w: 14 },
      { k: 'pSign', p: 'Sun', s: 'Aries', w: 12 },
      { k: 'pHouse', p: 'Mars', h: 10, w: 12 },
      { k: 'pHouse', p: 'Uranus', h: 2, w: 12 },
    ]),

  G('realEstateEye', 'Real Estate Eye', 'money',
    'You read property like other people read books. Bones, location, pre-trend neighborhoods.',
    'Tour 50 properties in 90 days. Build a comp database. The pattern recognition unlocks at #30.',
    [
      { k: 'pHouse', p: 'Moon', h: 4, w: 14 },
      { k: 'pSign', p: 'Sun', s: 'Cancer', w: 10 },
      { k: 'pSign', p: 'Sun', s: 'Taurus', w: 10 },
      { k: 'pHouse', p: 'Jupiter', h: 4, w: 14 },
      { k: 'aspect', p1: 'Venus', p2: 'Jupiter', a: 'sextile', w: 10 },
    ]),

  G('stockMarketIntuition', 'Stock Market Intuition', 'money',
    'You feel market psychology shifts before they show up on charts.',
    'Run a 100-trade paper portfolio with written theses. Compare your gut against a benchmark.',
    [
      { k: 'pHouse', p: 'Pluto', h: 8, w: 14 },
      { k: 'aspect', p1: 'Mercury', p2: 'Pluto', a: 'conj', w: 12 },
      { k: 'aspect', p1: 'Jupiter', p2: 'Pluto', a: 'sextile', w: 12 },
      { k: 'pSign', p: 'Mercury', s: 'Scorpio', w: 12 },
    ]),

  G('hustlerEnergy', 'Hustler Energy', 'money',
    'You see opportunity in chaos. While others wait for permission you sell the umbrella in the rain.',
    'Three side hustles per quarter. Kill the bottom two. Compound the winner.',
    [
      { k: 'aspect', p1: 'Mars', p2: 'Mercury', a: 'conj', w: 12 },
      { k: 'pSign', p: 'Mars', s: 'Aries', w: 12 },
      { k: 'pHouse', p: 'Mars', h: 2, w: 12 },
      { k: 'asteroid', aster: 'Fortuna', target: 'Mars', w: 12 },
    ]),

  G('sideHustleMind', 'Side Hustle Mind', 'money',
    'You can hold a 9-to-5 and run two parallel income streams without dropping any.',
    'Start with one — affiliate, freelance, or product — and hit $1K/month before adding a second.',
    [
      { k: 'pSign', p: 'Mercury', s: 'Gemini', w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 6, w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Jupiter', a: 'sextile', w: 12 },
      { k: 'asteroid', aster: 'Fortuna', target: 'Mercury', w: 10 },
    ]),

  G('inheritanceMagnet', 'Inheritance / Other-People-Money Magnet', 'money',
    'Money flows to you through wills, partners, investors, and grants. Other people\'s capital reaches you.',
    'Get serious with estate planning, partnership terms, and grant applications. The flow is real; the paperwork unlocks it.',
    [
      { k: 'pHouse', p: 'Jupiter', h: 8, w: 16 },
      { k: 'pHouse', p: 'Pluto', h: 8, w: 14 },
      { k: 'pSign', p: 'Jupiter', s: 'Scorpio', w: 12 },
      { k: 'asteroid', aster: 'Fortuna', target: 'Jupiter', w: 12 },
    ]),

  G('resourceManager', 'Resource Manager', 'money',
    'You know exactly what\'s in the budget, the pipeline, and the inventory at all times.',
    'Run a real P&L for any project, even small. The discipline compounds.',
    [
      { k: 'pSign', p: 'Sun', s: 'Virgo', w: 12 },
      { k: 'pHouse', p: 'Saturn', h: 2, w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Saturn', a: 'sextile', w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 2, w: 10 },
    ]),

  G('pricingGenius', 'Pricing Genius', 'money',
    'You know what to charge. You sense what the market will bear and where to anchor.',
    'A/B test pricing on a real offer. The data plus your instinct produces conviction.',
    [
      { k: 'aspect', p1: 'Venus', p2: 'Saturn', a: 'sextile', w: 14 },
      { k: 'asteroid', aster: 'Pallas', target: 'Venus', w: 12 },
      { k: 'pHouse', p: 'Venus', h: 2, w: 14 },
      { k: 'pSign', p: 'Venus', s: 'Capricorn', w: 12 },
    ]),

  G('brandArchitect', 'Brand Architect', 'money',
    'You build identities people pay premiums to be associated with.',
    'Brand a friend\'s offer end-to-end. Live case study beats portfolio fillers.',
    [
      { k: 'aspect', p1: 'Venus', p2: 'Saturn', a: 'conj', w: 12 },
      { k: 'pHouse', p: 'Venus', h: 10, w: 14 },
      { k: 'asteroid', aster: 'Pallas', target: 'Venus', w: 14 },
      { k: 'pSign', p: 'MC', s: 'Libra', w: 12 },
    ]),

  G('affiliateMastery', 'Affiliate / Partnership Income', 'money',
    'You build leverage through other people\'s products. You earn on someone else\'s shipping.',
    'Promote 3 products you\'d buy yourself. Reach $500/month before adding new offers.',
    [
      { k: 'pHouse', p: 'Mercury', h: 11, w: 12 },
      { k: 'pSign', p: 'Mercury', s: 'Aquarius', w: 10 },
      { k: 'aspect', p1: 'Venus', p2: 'Jupiter', a: 'sextile', w: 12 },
      { k: 'pHouse', p: 'Venus', h: 11, w: 12 },
    ]),

  G('luxuryTaste', 'Luxury Taste-Maker', 'money',
    'Your aesthetic dictates what wealthy people buy. Curators with your eye charge fees others can\'t.',
    'Document your aesthetic publicly (Instagram, Substack, newsletter). The audience is the asset.',
    [
      { k: 'pSign', p: 'Venus', s: 'Libra', w: 14 },
      { k: 'pHouse', p: 'Venus', h: 10, w: 12 },
      { k: 'asteroid', aster: 'Pallas', target: 'Venus', w: 12 },
      { k: 'aspect', p1: 'Venus', p2: 'Neptune', a: 'sextile', w: 10 },
    ]),

  G('cashFlowGenius', 'Cash Flow Genius', 'money',
    'You feel money\'s rhythm — when to invoice, when to delay, when to collect. Liquidity stays liquid.',
    'Run weekly cash flow forecasts for 6 months. The discipline plus instinct compounds.',
    [
      { k: 'pSign', p: 'Sun', s: 'Virgo', w: 10 },
      { k: 'pHouse', p: 'Mercury', h: 2, w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Saturn', a: 'sextile', w: 10 },
      { k: 'pHouse', p: 'Saturn', h: 2, w: 10 },
    ]),

  G('wealthThroughBeauty', 'Wealth Through Beauty', 'money',
    'You earn from aesthetics. Modeling, design, hospitality, beauty, fashion — your income comes through what is beautiful.',
    'Pick one beauty-adjacent vertical and go deep for 2 years before pivoting.',
    [
      { k: 'pHouse', p: 'Venus', h: 10, w: 14 },
      { k: 'aspect', p1: 'Venus', p2: 'MC', a: 'conj', w: 14 },
      { k: 'pSign', p: 'Venus', s: 'Libra', w: 12 },
      { k: 'pSign', p: 'MC', s: 'Taurus', w: 12 },
    ]),

  G('venturePartner', 'Venture / Co-Founder Partner', 'money',
    'You build well with one other founder. Solo doesn\'t suit you; complementary partnership does.',
    'Find your complement: opposite element + complementary skill set. Do small projects before equity.',
    [
      { k: 'pHouse', p: 'Jupiter', h: 7, w: 14 },
      { k: 'pSign', p: 'DSC', s: 'Capricorn', w: 10 },
      { k: 'aspect', p1: 'Sun', p2: 'Jupiter', a: 'sextile', w: 10 },
      { k: 'pHouse', p: 'Sun', h: 7, w: 12 },
    ]),

  G('marginCalculator', 'Margin Calculator', 'money',
    'You calculate unit economics in your head while others use spreadsheets. You know which deals print.',
    'Do unit-economics breakdowns for 30 businesses you encounter. The arithmetic becomes intuition.',
    [
      { k: 'pSign', p: 'Mercury', s: 'Virgo', w: 14 },
      { k: 'pSign', p: 'Mercury', s: 'Capricorn', w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Saturn', a: 'conj', w: 12 },
      { k: 'asteroid', aster: 'Pallas', target: 'Mercury', w: 12 },
    ]),

  G('taxLegalMind', 'Tax / Legal Mind', 'money',
    'Structures, entities, and tax code are puzzles you enjoy. You save 5–7 figures by reading the rules.',
    'CPA + business attorney consultations. The fees pay themselves back many times over.',
    [
      { k: 'pSign', p: 'Mercury', s: 'Capricorn', w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Saturn', a: 'conj', w: 14 },
      { k: 'asteroid', aster: 'Pallas', target: 'Saturn', w: 12 },
      { k: 'pHouse', p: 'Saturn', h: 2, w: 10 },
    ]),

  G('vcMind', 'Venture Capital Mind', 'money',
    'You see the pattern of asymmetric upside before others. You can structure 10× bets.',
    'Angel-invest small ($1K–$5K) with 10 founders before going large. The thesis development matters.',
    [
      { k: 'aspect', p1: 'Jupiter', p2: 'Pluto', a: 'conj', w: 14 },
      { k: 'aspect', p1: 'Jupiter', p2: 'Uranus', a: 'sextile', w: 12 },
      { k: 'pHouse', p: 'Jupiter', h: 8, w: 14 },
      { k: 'pHouse', p: 'Uranus', h: 11, w: 10 },
    ]),

  // ════════════════════════════════════════════════════════════
  // INTELLIGENCE GIFTS (28)
  // ════════════════════════════════════════════════════════════

  G('codingGenius', 'Coding Genius', 'intelligence',
    'You think in algorithms naturally. You see compositional structure in problems and you build elegant systems.',
    'Build one substantial project end-to-end. GitHub commits over years are the credential.',
    [
      { k: 'aspect', p1: 'Mercury', p2: 'Uranus', a: 'conj', w: 18 },
      { k: 'aspect', p1: 'Mercury', p2: 'Saturn', a: 'sextile', w: 12 },
      { k: 'pSign', p: 'Mercury', s: 'Aquarius', w: 14 },
      { k: 'pSign', p: 'Mercury', s: 'Virgo', w: 12 },
      { k: 'pHouse', p: 'Uranus', h: 3, w: 12 },
      { k: 'asteroid', aster: 'Pallas', target: 'Mercury', w: 12 },
    ]),

  G('patternRecognition', 'Pattern Recognition', 'intelligence',
    'You see structure in noise faster than colleagues. The discrepancy in 1,000 numbers jumps at you.',
    'Practice with chess puzzles or Codewars katas. Volume builds the channel.',
    [
      { k: 'asteroid', aster: 'Pallas', target: 'Mercury', w: 18 },
      { k: 'asteroid', aster: 'Pallas', target: 'Sun', w: 14 },
      { k: 'pSign', p: 'Mercury', s: 'Virgo', w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Saturn', a: 'sextile', w: 12 },
    ]),

  G('detectiveMind', 'Detective Mind', 'intelligence',
    'You ask the question others avoid. Inconsistencies in stories light up for you.',
    'Investigate one thing seriously — a corporate filing, a historical event, a family mystery. Document the method.',
    [
      { k: 'pSign', p: 'Sun', s: 'Scorpio', w: 14 },
      { k: 'pHouse', p: 'Pluto', h: 8, w: 14 },
      { k: 'aspect', p1: 'Mars', p2: 'Mercury', a: 'sextile', w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Pluto', a: 'conj', w: 14 },
      { k: 'pHouse', p: 'Mercury', h: 8, w: 12 },
    ], ['shadow']),

  G('researchMastery', 'Research Mastery', 'intelligence',
    'You can dive into a domain you\'ve never seen and become functional inside 30 days.',
    'Pick a domain alien to you, give yourself 30 days, produce a written brief. Repeat quarterly.',
    [
      { k: 'pSign', p: 'Mercury', s: 'Virgo', w: 14 },
      { k: 'aspect', p1: 'Mercury', p2: 'Saturn', a: 'conj', w: 14 },
      { k: 'pHouse', p: 'Mercury', h: 9, w: 12 },
      { k: 'pHouse', p: 'Saturn', h: 9, w: 10 },
      { k: 'pHouse', p: 'Mercury', h: 8, w: 10 },
    ]),

  G('inventorMind', 'Inventor Mind', 'intelligence',
    'You see what doesn\'t exist yet and how it could. Your prototypes work because the underlying idea is solid.',
    'Build one functional prototype this quarter. Documentation > polish.',
    [
      { k: 'aspect', p1: 'Mercury', p2: 'Uranus', a: 'conj', w: 16 },
      { k: 'aspect', p1: 'Sun', p2: 'Uranus', a: 'sextile', w: 12 },
      { k: 'pHouse', p: 'Uranus', h: 3, w: 14 },
      { k: 'pHouse', p: 'Uranus', h: 5, w: 10 },
      { k: 'pSign', p: 'Mercury', s: 'Aquarius', w: 12 },
    ]),

  G('strategicThinking', 'Strategic Thinking', 'intelligence',
    'You compose plans across time horizons. You reason about causality at scale.',
    'Write quarterly strategy memos for your life or business. The act of writing forces precision.',
    [
      { k: 'asteroid', aster: 'Pallas', target: 'Mercury', w: 16 },
      { k: 'asteroid', aster: 'Pallas', target: 'Sun', w: 14 },
      { k: 'aspect', p1: 'Mercury', p2: 'Saturn', a: 'conj', w: 12 },
      { k: 'pSign', p: 'Mercury', s: 'Capricorn', w: 12 },
      { k: 'pHouse', p: 'Saturn', h: 9, w: 10 },
    ]),

  G('memoryPower', 'Memory Power', 'intelligence',
    'You retain detail others lose. Names, faces, conversations from years ago are accessible.',
    'Memory Palace technique (Joshua Foer\'s "Moonwalking with Einstein"). The skill scales without limit.',
    [
      { k: 'pSign', p: 'Mercury', s: 'Cancer', w: 12 },
      { k: 'pSign', p: 'Moon', s: 'Cancer', w: 12 },
      { k: 'aspect', p1: 'Moon', p2: 'Mercury', a: 'conj', w: 14 },
      { k: 'aspect', p1: 'Mercury', p2: 'Saturn', a: 'conj', w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 4, w: 10 },
    ]),

  G('lieDetection', 'Lie Detection', 'intelligence',
    'You read micro-expressions, vocal shifts, and verbal evasions automatically. Truth has a shape you recognize.',
    'Read Paul Ekman + practice on documentary interviews. The training calibrates the instinct.',
    [
      { k: 'pSign', p: 'Mercury', s: 'Scorpio', w: 16 },
      { k: 'aspect', p1: 'Mercury', p2: 'Pluto', a: 'conj', w: 16 },
      { k: 'aspect', p1: 'Moon', p2: 'Pluto', a: 'sextile', w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 8, w: 12 },
      { k: 'pHouse', p: 'Pluto', h: 3, w: 10 },
    ], ['shadow']),

  G('mathematicalMind', 'Mathematical Mind', 'intelligence',
    'You see proofs and structures, not numbers. Abstract math is a native language.',
    'Rebuild calculus from scratch through Apostol or Spivak. Then choose your specialty.',
    [
      { k: 'pSign', p: 'Mercury', s: 'Virgo', w: 14 },
      { k: 'pSign', p: 'Mercury', s: 'Aquarius', w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Saturn', a: 'conj', w: 14 },
      { k: 'pHouse', p: 'Mercury', h: 9, w: 10 },
      { k: 'asteroid', aster: 'Pallas', target: 'Mercury', w: 12 },
    ]),

  G('linguisticMind', 'Linguistic Mind', 'intelligence',
    'Languages stick to you. Grammar you don\'t consciously study auto-installs through immersion.',
    'Pick one language plus a third you don\'t expect. Daily 20 min via Anki + reading. 12 months to functional.',
    [
      { k: 'pSign', p: 'Mercury', s: 'Gemini', w: 14 },
      { k: 'pHouse', p: 'Mercury', h: 3, w: 14 },
      { k: 'aspect', p1: 'Mercury', p2: 'Jupiter', a: 'conj', w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 9, w: 12 },
    ]),

  G('philosophyMind', 'Philosophical Mind', 'intelligence',
    'You hold abstract distinctions clearly. Metaphysics, ethics, epistemology — you reason inside the discipline.',
    'Read a tradition end-to-end (Stoicism, German Idealism, Phenomenology). Take notes; teach a friend.',
    [
      { k: 'pSign', p: 'Mercury', s: 'Sagittarius', w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 9, w: 14 },
      { k: 'aspect', p1: 'Mercury', p2: 'Jupiter', a: 'conj', w: 12 },
      { k: 'pHouse', p: 'Jupiter', h: 9, w: 12 },
    ]),

  G('scientificMind', 'Scientific Mind', 'intelligence',
    'You hypothesize, test, and revise. You change beliefs based on evidence — most can\'t.',
    'Run one mini-experiment per quarter. Pre-register predictions. The discipline is the gift.',
    [
      { k: 'pSign', p: 'Mercury', s: 'Aquarius', w: 14 },
      { k: 'aspect', p1: 'Mercury', p2: 'Uranus', a: 'sextile', w: 12 },
      { k: 'pHouse', p: 'Uranus', h: 9, w: 12 },
      { k: 'asteroid', aster: 'Pallas', target: 'Mercury', w: 12 },
    ]),

  G('engineeringMind', 'Engineering Mind', 'intelligence',
    'You constrain problems and ship solutions. Theory is interesting only when it deploys.',
    'Pick a problem and solve it physically — hardware, code, or process. Constraint forces clarity.',
    [
      { k: 'pSign', p: 'Sun', s: 'Capricorn', w: 12 },
      { k: 'pSign', p: 'Mercury', s: 'Virgo', w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Saturn', a: 'sextile', w: 12 },
      { k: 'asteroid', aster: 'Pallas', target: 'Saturn', w: 12 },
      { k: 'pHouse', p: 'Saturn', h: 6, w: 10 },
    ]),

  G('legalMind', 'Legal Mind', 'intelligence',
    'You read statutes, contracts, and case law fluidly. Logic plus procedure clicks for you.',
    'Read one legal classic per quarter (Posner, Holmes, Llewellyn). The vocabulary plus your structure compounds.',
    [
      { k: 'pSign', p: 'Mercury', s: 'Libra', w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 9, w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Jupiter', a: 'conj', w: 12 },
      { k: 'pHouse', p: 'Jupiter', h: 9, w: 10 },
      { k: 'asteroid', aster: 'Pallas', target: 'Jupiter', w: 12 },
    ]),

  G('forensicMind', 'Forensic Mind', 'intelligence',
    'You reconstruct what happened from fragments. Physical scene, financial records, or relational dynamics — all readable.',
    'Read forensic memoirs (Bass, Maples). Train on cold cases as cognitive exercise.',
    [
      { k: 'pSign', p: 'Sun', s: 'Scorpio', w: 12 },
      { k: 'pHouse', p: 'Pluto', h: 8, w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Pluto', a: 'sextile', w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 8, w: 12 },
    ]),

  G('chessMind', 'Chess / Game Theory Mind', 'intelligence',
    'You hold multi-move trees in working memory and prune for optimal lines.',
    'Play 100 rated games online + study one master\'s collected games. Rating climbs with structure.',
    [
      { k: 'asteroid', aster: 'Pallas', target: 'Mercury', w: 16 },
      { k: 'aspect', p1: 'Mercury', p2: 'Saturn', a: 'conj', w: 12 },
      { k: 'pSign', p: 'Mercury', s: 'Capricorn', w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 5, w: 10 },
    ]),

  G('rapidLearning', 'Rapid Learning', 'intelligence',
    'You acquire skills 3–5× faster than peers. The compression is real, not bragging.',
    'Pick a skill you don\'t have and document a 30-day learning sprint publicly.',
    [
      { k: 'pSign', p: 'Mercury', s: 'Gemini', w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Jupiter', a: 'conj', w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Uranus', a: 'sextile', w: 12 },
      { k: 'pHouse', p: 'Jupiter', h: 3, w: 12 },
    ]),

  G('speedReading', 'Speed Reading', 'intelligence',
    'You take in pages 4–6× normal pace without losing comprehension.',
    'Tony Buzan or PX Project method, 15 minutes/day for 90 days.',
    [
      { k: 'pSign', p: 'Mercury', s: 'Gemini', w: 14 },
      { k: 'aspect', p1: 'Mercury', p2: 'Uranus', a: 'sextile', w: 10 },
      { k: 'pHouse', p: 'Mercury', h: 3, w: 10 },
    ]),

  G('polyglotTalent', 'Polyglot Talent', 'intelligence',
    'You move between 4+ languages without slipping. Cognitive switching costs are low for you.',
    'Maintain weekly exposure to all your languages — read, watch, speak. Atrophy is the enemy.',
    [
      { k: 'pSign', p: 'Mercury', s: 'Gemini', w: 16 },
      { k: 'pSign', p: 'Mercury', s: 'Sagittarius', w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 3, w: 14 },
      { k: 'pHouse', p: 'Mercury', h: 9, w: 14 },
    ]),

  G('cryptography', 'Cryptography / Code-Breaking', 'intelligence',
    'Cipher work absorbs you. You see the structural weakness in the encryption others trust.',
    'Cryptopals challenges. Earlier sets are the foundation; later ones are research-grade.',
    [
      { k: 'pSign', p: 'Mercury', s: 'Scorpio', w: 14 },
      { k: 'asteroid', aster: 'Pallas', target: 'Mercury', w: 14 },
      { k: 'aspect', p1: 'Mercury', p2: 'Pluto', a: 'sextile', w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 8, w: 10 },
    ]),

  G('investigativeJournalism', 'Investigative Journalism', 'intelligence',
    'You can build a case from public records, sourcing, and timing. You publish what others were paid to bury.',
    'Pick a local injustice. Document. File FOIA requests. Publish on Substack.',
    [
      { k: 'pSign', p: 'Mercury', s: 'Scorpio', w: 12 },
      { k: 'pSign', p: 'Mercury', s: 'Sagittarius', w: 10 },
      { k: 'pHouse', p: 'Mercury', h: 9, w: 12 },
      { k: 'pHouse', p: 'Pluto', h: 9, w: 12 },
      { k: 'asteroid', aster: 'Nemesis', target: 'Mercury', w: 12 },
    ]),

  G('dataScience', 'Data Science', 'intelligence',
    'You interrogate datasets like witnesses. You spot the leakage and the lurking variable.',
    'One Kaggle competition end-to-end. Document your reasoning. Iteration matters more than rank.',
    [
      { k: 'pSign', p: 'Mercury', s: 'Virgo', w: 12 },
      { k: 'pSign', p: 'Mercury', s: 'Aquarius', w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Uranus', a: 'sextile', w: 12 },
      { k: 'asteroid', aster: 'Pallas', target: 'Mercury', w: 12 },
    ]),

  G('algorithmicThinking', 'Algorithmic Thinking', 'intelligence',
    'You break problems into atomic operations. Recursion and dynamic programming feel natural.',
    'Solve 200 LeetCode problems over 6 months — focus on patterns, not memorization.',
    [
      { k: 'aspect', p1: 'Mercury', p2: 'Saturn', a: 'sextile', w: 12 },
      { k: 'pSign', p: 'Mercury', s: 'Virgo', w: 12 },
      { k: 'asteroid', aster: 'Pallas', target: 'Mercury', w: 14 },
      { k: 'pHouse', p: 'Saturn', h: 3, w: 10 },
    ]),

  G('systemsThinking', 'Systems Thinking', 'intelligence',
    'You see feedback loops, leverage points, and emergent behavior in complex systems.',
    'Donella Meadows\'s "Thinking in Systems" + map one system in your life as a causal loop diagram.',
    [
      { k: 'pSign', p: 'Sun', s: 'Aquarius', w: 12 },
      { k: 'pHouse', p: 'Uranus', h: 11, w: 12 },
      { k: 'asteroid', aster: 'Pallas', target: 'Sun', w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Uranus', a: 'trine', w: 12 },
    ]),

  G('conspiracySpotter', 'Conspiracy Spotter', 'intelligence',
    'You see networks of motive and means others miss. You can also avoid the paranoia trap.',
    'Practice on documented cases (Watergate, Enron). The skill is signal-to-noise discrimination.',
    [
      { k: 'pSign', p: 'Sun', s: 'Aquarius', w: 12 },
      { k: 'pHouse', p: 'Pluto', h: 11, w: 14 },
      { k: 'aspect', p1: 'Mars', p2: 'Mercury', a: 'square', w: 10 },
      { k: 'aspect', p1: 'Mercury', p2: 'Pluto', a: 'square', w: 12 },
      { k: 'asteroid', aster: 'Nemesis', target: 'Mercury', w: 12 },
    ], ['shadow']),

  G('encyclopedicMemory', 'Encyclopedic Memory', 'intelligence',
    'You retain disparate facts and synthesize them on demand.',
    'Anki deck for the domain you care about most. 20 cards/day for 2 years compounds astonishingly.',
    [
      { k: 'pSign', p: 'Mercury', s: 'Cancer', w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Saturn', a: 'conj', w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Jupiter', a: 'conj', w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 9, w: 10 },
    ]),

  G('translationGenius', 'Translation Genius', 'intelligence',
    'You move meaning across languages without losing the texture. Word-for-word is amateur; you preserve effect.',
    'Translate 1,000 lines of poetry both directions. The discipline produces ear.',
    [
      { k: 'pSign', p: 'Mercury', s: 'Gemini', w: 14 },
      { k: 'pSign', p: 'Mercury', s: 'Pisces', w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Neptune', a: 'sextile', w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 9, w: 10 },
    ]),

  G('quantumMind', 'Quantum / Theoretical Mind', 'intelligence',
    'Counterintuitive structures click for you. Quantum, topology, set theory — you accept the strangeness.',
    'Read Susskind\'s "Theoretical Minimum" series. Three years to functional.',
    [
      { k: 'pSign', p: 'Sun', s: 'Aquarius', w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Uranus', a: 'conj', w: 14 },
      { k: 'aspect', p1: 'Mercury', p2: 'Neptune', a: 'sextile', w: 10 },
      { k: 'pHouse', p: 'Uranus', h: 9, w: 12 },
    ]),

  // ════════════════════════════════════════════════════════════
  // HEALING GIFTS (22)
  // ════════════════════════════════════════════════════════════

  G('traumaHealing', 'Trauma Healing', 'healing',
    'You can sit with someone\'s worst night and not flinch. Your nervous system co-regulates theirs back online.',
    'Train in one trauma modality (Somatic Experiencing, EMDR, IFS). Personal therapy is non-negotiable.',
    [
      { k: 'asteroid', aster: 'Chiron', target: 'Sun', w: 18 },
      { k: 'asteroid', aster: 'Chiron', target: 'Moon', w: 18 },
      { k: 'pHouse', p: 'Chiron', h: 6, w: 14 },
      { k: 'pHouse', p: 'Chiron', h: 12, w: 14 },
      { k: 'pHouse', p: 'Pluto', h: 12, w: 12 },
      { k: 'aspect', p1: 'Moon', p2: 'Pluto', a: 'sextile', w: 10 },
    ]),

  G('relationshipCounseling', 'Relationship Counseling', 'healing',
    'You see the dance between two people. You can name what each is doing and offer a third option.',
    'Train in Gottman or EFT (Emotionally Focused Therapy). The frameworks pair with your instinct.',
    [
      { k: 'pSign', p: 'Sun', s: 'Libra', w: 12 },
      { k: 'asteroid', aster: 'Juno', target: 'Sun', w: 14 },
      { k: 'asteroid', aster: 'Juno', target: 'Mercury', w: 12 },
      { k: 'pHouse', p: 'Venus', h: 7, w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 7, w: 10 },
    ]),

  G('therapistEnergy', 'Therapist Energy', 'healing',
    'People tell you things they\'ve never told anyone. You hold without leaking.',
    'Get supervision and your own therapy before practicing. The container needs reinforcement.',
    [
      { k: 'pSign', p: 'Moon', s: 'Cancer', w: 12 },
      { k: 'pSign', p: 'Moon', s: 'Pisces', w: 12 },
      { k: 'pHouse', p: 'Moon', h: 6, w: 14 },
      { k: 'pHouse', p: 'Moon', h: 12, w: 14 },
      { k: 'asteroid', aster: 'Chiron', target: 'Moon', w: 14 },
    ]),

  G('emotionalRepair', 'Emotional Repair', 'healing',
    'You restore people after relational injury. They re-stabilize in your presence.',
    'IFS (Internal Family Systems) training. The "Self" energy is your default state already.',
    [
      { k: 'pSign', p: 'Moon', s: 'Pisces', w: 14 },
      { k: 'pHouse', p: 'Moon', h: 12, w: 14 },
      { k: 'asteroid', aster: 'Ceres', target: 'Moon', w: 14 },
      { k: 'asteroid', aster: 'Chiron', target: 'Venus', w: 12 },
    ]),

  G('motivationalHealing', 'Motivational Healing', 'healing',
    'You light a fire. People come away from you ready to act on what they\'ve avoided for years.',
    'Speak weekly to small groups. The reps build the muscle.',
    [
      { k: 'pSign', p: 'Sun', s: 'Sagittarius', w: 12 },
      { k: 'pSign', p: 'Sun', s: 'Leo', w: 12 },
      { k: 'aspect', p1: 'Sun', p2: 'Jupiter', a: 'conj', w: 12 },
      { k: 'pHouse', p: 'Jupiter', h: 9, w: 12 },
      { k: 'pHouse', p: 'Sun', h: 9, w: 10 },
    ]),

  G('crisisStabilizer', 'Crisis Stabilizer', 'healing',
    'When someone calls in crisis you de-escalate without panicking. Your voice itself slows the moment.',
    'Volunteer with crisis hotlines (Trans Lifeline, Trevor Project). The training plus your instinct compounds.',
    [
      { k: 'aspect', p1: 'Moon', p2: 'Saturn', a: 'sextile', w: 12 },
      { k: 'aspect', p1: 'Moon', p2: 'Pluto', a: 'trine', w: 12 },
      { k: 'pSign', p: 'Moon', s: 'Capricorn', w: 12 },
      { k: 'pHouse', p: 'Saturn', h: 12, w: 10 },
    ]),

  G('nutritionHealing', 'Nutrition Healing', 'healing',
    'Food is medicine in your hands. You can match a body\'s exact deficiency to the precise food.',
    'Functional medicine certification or IIN. Personal n=1 experiments first.',
    [
      { k: 'asteroid', aster: 'Hygiea', target: 'Sun', w: 16 },
      { k: 'asteroid', aster: 'Ceres', target: 'Sun', w: 14 },
      { k: 'pHouse', p: 'Mercury', h: 6, w: 12 },
      { k: 'pSign', p: 'Sun', s: 'Virgo', w: 12 },
    ]),

  G('massageHands', 'Healing Hands / Massage', 'healing',
    'Your touch resets people. Where you place pressure pain dissolves.',
    'LMT certification (500–1,000 hours depending on state). The license unlocks the gift commercially.',
    [
      { k: 'pSign', p: 'Venus', s: 'Taurus', w: 12 },
      { k: 'aspect', p1: 'Venus', p2: 'Mars', a: 'sextile', w: 10 },
      { k: 'pHouse', p: 'Venus', h: 6, w: 14 },
      { k: 'pHouse', p: 'Mars', h: 6, w: 12 },
      { k: 'asteroid', aster: 'Hygiea', target: 'Mars', w: 12 },
    ]),

  G('innerChildWork', 'Inner Child Work', 'healing',
    'You can speak to younger parts of someone\'s psyche. They feel met.',
    'IFS training; combine with Hakomi or Sensorimotor for embodied access.',
    [
      { k: 'pHouse', p: 'Moon', h: 4, w: 14 },
      { k: 'asteroid', aster: 'Ceres', target: 'Moon', w: 14 },
      { k: 'asteroid', aster: 'Chiron', target: 'Moon', w: 12 },
      { k: 'pSign', p: 'Moon', s: 'Cancer', w: 12 },
    ]),

  G('griefCompanion', 'Grief Companion', 'healing',
    'You sit beside grief without trying to fix it. Your willingness to be present is the medicine.',
    'Grief literacy training (Francis Weller, Megan Devine). Less doing, more accompanying.',
    [
      { k: 'pSign', p: 'Moon', s: 'Pisces', w: 14 },
      { k: 'pHouse', p: 'Moon', h: 8, w: 12 },
      { k: 'pHouse', p: 'Moon', h: 12, w: 14 },
      { k: 'asteroid', aster: 'Chiron', target: 'Moon', w: 12 },
    ]),

  G('coachEnergy', 'Coaching Energy', 'healing',
    'You ask the question that breaks open the stuck place.',
    'ICF-credentialed program. The framework + your instinct produces certified competence.',
    [
      { k: 'aspect', p1: 'Sun', p2: 'Jupiter', a: 'conj', w: 12 },
      { k: 'pSign', p: 'Sun', s: 'Sagittarius', w: 12 },
      { k: 'pHouse', p: 'Jupiter', h: 9, w: 12 },
      { k: 'pHouse', p: 'Sun', h: 6, w: 10 },
    ]),

  G('lifeCoaching', 'Life Coaching', 'healing',
    'You hold space for transformation arcs over months. Clients commit to themselves with you watching.',
    'Three pro-bono client cycles before charging. Build evidence and testimonials.',
    [
      { k: 'pSign', p: 'Sun', s: 'Sagittarius', w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 9, w: 12 },
      { k: 'aspect', p1: 'Sun', p2: 'Jupiter', a: 'sextile', w: 10 },
      { k: 'pHouse', p: 'Jupiter', h: 6, w: 12 },
    ]),

  G('spiritualDirection', 'Spiritual Direction', 'healing',
    'You guide souls. The discipline is older than psychology and asks different questions.',
    'Two-year MA-level program (Jesuit, Sufi, or interfaith). The lineage matters.',
    [
      { k: 'pHouse', p: 'Neptune', h: 9, w: 14 },
      { k: 'pHouse', p: 'Jupiter', h: 12, w: 12 },
      { k: 'asteroid', aster: 'Vesta', target: 'Sun', w: 12 },
      { k: 'aspect', p1: 'Sun', p2: 'Neptune', a: 'sextile', w: 12 },
    ]),

  G('intimacyCoaching', 'Sex / Intimacy Coaching', 'healing',
    'You hold the conversation about desire, blockage, and pleasure without flinching.',
    'Train in somatic sex education (SCSE) or Tantric lineages with proper credentialing.',
    [
      { k: 'aspect', p1: 'Venus', p2: 'Pluto', a: 'sextile', w: 14 },
      { k: 'asteroid', aster: 'Eros', target: 'Mercury', w: 14 },
      { k: 'pHouse', p: 'Venus', h: 8, w: 14 },
      { k: 'pHouse', p: 'Pluto', h: 5, w: 12 },
    ], ['love']),

  G('familyMediator', 'Family Mediator', 'healing',
    'You get the warring branches into the same room. People do hard work because you said it was time.',
    'Train with Bowen Family Systems Theory. The framework pairs with your instinct.',
    [
      { k: 'pSign', p: 'Sun', s: 'Libra', w: 12 },
      { k: 'pHouse', p: 'Moon', h: 4, w: 12 },
      { k: 'aspect', p1: 'Sun', p2: 'Moon', a: 'sextile', w: 10 },
      { k: 'pHouse', p: 'Mercury', h: 4, w: 12 },
    ]),

  G('empathicListener', 'Empathic Listener', 'healing',
    'You hear what they couldn\'t finish saying. Reflection back lands with surgical accuracy.',
    'Practice nonviolent communication (Marshall Rosenberg). Pair with your instinct for verifiable outcomes.',
    [
      { k: 'pSign', p: 'Moon', s: 'Pisces', w: 12 },
      { k: 'pSign', p: 'Moon', s: 'Cancer', w: 12 },
      { k: 'aspect', p1: 'Moon', p2: 'Mercury', a: 'sextile', w: 12 },
      { k: 'pHouse', p: 'Moon', h: 3, w: 10 },
    ]),

  G('nervousSystemRegulator', 'Nervous System Regulator', 'healing',
    'Your presence drops other people\'s heart rate. Co-regulation is your superpower.',
    'Polyvagal training (Stephen Porges, Deb Dana). The science explains what your body already does.',
    [
      { k: 'aspect', p1: 'Moon', p2: 'Saturn', a: 'sextile', w: 12 },
      { k: 'pSign', p: 'Moon', s: 'Capricorn', w: 10 },
      { k: 'asteroid', aster: 'Hygiea', target: 'Moon', w: 14 },
      { k: 'pHouse', p: 'Saturn', h: 6, w: 10 },
    ]),

  G('somaticHealer', 'Somatic Healer', 'healing',
    'You read the body as text. Where someone holds tension tells you what they\'ve buried.',
    'Train in Somatic Experiencing or Hakomi. The body informs the work directly.',
    [
      { k: 'pHouse', p: 'Mars', h: 6, w: 14 },
      { k: 'aspect', p1: 'Venus', p2: 'Mars', a: 'sextile', w: 10 },
      { k: 'asteroid', aster: 'Chiron', target: 'Mars', w: 12 },
      { k: 'pSign', p: 'Sun', s: 'Virgo', w: 10 },
    ]),

  G('soundHealing', 'Sound Healing', 'healing',
    'Frequencies you produce — voice, gong, bowls — entrain other nervous systems.',
    'Train with one tradition seriously. Sound is more powerful than the casual scene suggests.',
    [
      { k: 'aspect', p1: 'Venus', p2: 'Neptune', a: 'sextile', w: 14 },
      { k: 'asteroid', aster: 'Apollo', target: 'Venus', w: 14 },
      { k: 'pSign', p: 'Venus', s: 'Pisces', w: 10 },
      { k: 'pHouse', p: 'Venus', h: 12, w: 12 },
    ]),

  G('breathworkMaster', 'Breathwork Master', 'healing',
    'You can lead a room into altered states through breath. Holotropic, Wim Hof, pranayama — all native to you.',
    'Train in one tradition; integrate before teaching others.',
    [
      { k: 'pHouse', p: 'Neptune', h: 6, w: 12 },
      { k: 'asteroid', aster: 'Hygiea', target: 'Sun', w: 12 },
      { k: 'pSign', p: 'Sun', s: 'Pisces', w: 10 },
      { k: 'pHouse', p: 'Mars', h: 12, w: 10 },
    ]),

  G('doulaEnergy', 'Doula / Birth Worker', 'healing',
    'You can hold a labor room. Birth — beginning or ending — feels sacred and tractable to you.',
    'DONA or CAPPA certification. Apprenticeship births before going solo.',
    [
      { k: 'pSign', p: 'Moon', s: 'Cancer', w: 14 },
      { k: 'pHouse', p: 'Moon', h: 4, w: 14 },
      { k: 'asteroid', aster: 'Ceres', target: 'Moon', w: 16 },
      { k: 'pHouse', p: 'Ceres' as any, h: 8, w: 8 },
    ]),

  G('deathDoula', 'Death Doula', 'healing',
    'You can sit with the dying without flinching. The threshold work calls you.',
    'INELDA training. Grief integration first, then practice.',
    [
      { k: 'pHouse', p: 'Pluto', h: 8, w: 16 },
      { k: 'pSign', p: 'Sun', s: 'Scorpio', w: 12 },
      { k: 'asteroid', aster: 'Chiron', target: 'Pluto', w: 12 },
      { k: 'pHouse', p: 'Moon', h: 8, w: 12 },
    ]),

  // ════════════════════════════════════════════════════════════
  // PHYSICAL GIFTS (14)
  // ════════════════════════════════════════════════════════════

  G('athleticism', 'Athleticism', 'physical',
    'Your body responds to training faster than peers. Coaches notice you within weeks.',
    'Pick one sport. Train under a coach for two years before judging your ceiling.',
    [
      { k: 'pSign', p: 'Mars', s: 'Aries', w: 14 },
      { k: 'pSign', p: 'Mars', s: 'Capricorn', w: 12 },
      { k: 'pSign', p: 'Mars', s: 'Scorpio', w: 12 },
      { k: 'aspect', p1: 'Sun', p2: 'Mars', a: 'conj', w: 14 },
      { k: 'asteroid', aster: 'Nike', target: 'Mars', w: 14 },
      { k: 'pHouse', p: 'Mars', h: 1, w: 12 },
    ]),

  G('martialSkill', 'Martial Skill', 'physical',
    'Combat technique sticks fast. You read other fighters\' movement intent.',
    'BJJ + striking (Muay Thai or boxing). Year one is white-belt humility; year three is real.',
    [
      { k: 'aspect', p1: 'Mars', p2: 'Saturn', a: 'sextile', w: 14 },
      { k: 'aspect', p1: 'Mars', p2: 'Pluto', a: 'conj', w: 14 },
      { k: 'pSign', p: 'Mars', s: 'Scorpio', w: 14 },
      { k: 'pHouse', p: 'Mars', h: 6, w: 12 },
      { k: 'asteroid', aster: 'Nike', target: 'Mars', w: 12 },
    ], ['power']),

  G('reflexSpeed', 'Reflex Speed', 'physical',
    'Your reaction time is in the top decile. Hand-eye coupling is unusually tight.',
    'Train with reaction-ball drills, Y-coordinate touch tests, or fighting games. Track milliseconds.',
    [
      { k: 'aspect', p1: 'Mars', p2: 'Mercury', a: 'conj', w: 14 },
      { k: 'pSign', p: 'Mars', s: 'Aries', w: 12 },
      { k: 'pSign', p: 'Mars', s: 'Gemini', w: 12 },
      { k: 'pSign', p: 'Mercury', s: 'Aries', w: 10 },
    ]),

  G('endurance', 'Endurance', 'physical',
    'Long durations don\'t break you. Marathon, ultra, 24-hour — you reach hour 6 calmer than hour 2.',
    'Build a base for one year before racing. Volume + zone-2 work.',
    [
      { k: 'pSign', p: 'Mars', s: 'Capricorn', w: 14 },
      { k: 'pSign', p: 'Mars', s: 'Taurus', w: 12 },
      { k: 'aspect', p1: 'Mars', p2: 'Saturn', a: 'conj', w: 12 },
      { k: 'pHouse', p: 'Mars', h: 6, w: 10 },
    ]),

  G('bodyCoordination', 'Body Coordination', 'physical',
    'Complex movements stack. You can learn five-step combinations in a class hour.',
    'Dance, capoeira, parkour, or martial-art forms. Quality over volume.',
    [
      { k: 'aspect', p1: 'Venus', p2: 'Mars', a: 'conj', w: 14 },
      { k: 'aspect', p1: 'Venus', p2: 'Mars', a: 'trine', w: 12 },
      { k: 'pSign', p: 'Venus', s: 'Taurus', w: 10 },
      { k: 'pHouse', p: 'Mars', h: 5, w: 10 },
    ]),

  G('combatSports', 'Combat Sports', 'physical',
    'You compete clean and ferocious. Pre-fight nerves don\'t derail you.',
    'Amateur record before pro. The losses in amateur teach what wins can\'t.',
    [
      { k: 'pSign', p: 'Mars', s: 'Scorpio', w: 14 },
      { k: 'pSign', p: 'Mars', s: 'Aries', w: 14 },
      { k: 'asteroid', aster: 'Nike', target: 'Sun', w: 14 },
      { k: 'aspect', p1: 'Sun', p2: 'Mars', a: 'conj', w: 12 },
    ]),

  G('climbingAdventure', 'Climbing / Adventure Sports', 'physical',
    'Heights, walls, big mountains — the fear instinct calibrates rather than freezes.',
    'Indoor first, outdoor with mentor, then alpine. The progression matters.',
    [
      { k: 'pSign', p: 'Sun', s: 'Sagittarius', w: 12 },
      { k: 'pSign', p: 'Mars', s: 'Sagittarius', w: 12 },
      { k: 'aspect', p1: 'Mars', p2: 'Jupiter', a: 'sextile', w: 12 },
      { k: 'pHouse', p: 'Jupiter', h: 9, w: 10 },
    ]),

  G('flexibility', 'Flexibility / Yoga Mastery', 'physical',
    'Range of motion increases unusually fast for you. Joints open with consistent practice.',
    'Daily 30-min mobility for 6 months. Track ROM. The data convinces you.',
    [
      { k: 'pSign', p: 'Venus', s: 'Pisces', w: 12 },
      { k: 'pSign', p: 'Sun', s: 'Pisces', w: 10 },
      { k: 'pHouse', p: 'Venus', h: 6, w: 12 },
      { k: 'asteroid', aster: 'Hygiea', target: 'Mars', w: 10 },
    ]),

  G('strengthSport', 'Strength Sport', 'physical',
    'You add weight to lifts faster than expected. Your tendons handle load.',
    'Linear progression program (Starting Strength, 5/3/1) for 12 months. Then specialize.',
    [
      { k: 'pSign', p: 'Mars', s: 'Capricorn', w: 14 },
      { k: 'pSign', p: 'Mars', s: 'Taurus', w: 14 },
      { k: 'aspect', p1: 'Mars', p2: 'Saturn', a: 'conj', w: 12 },
      { k: 'pHouse', p: 'Mars', h: 1, w: 10 },
    ]),

  G('waterSport', 'Water Sport / Diving', 'physical',
    'You read water — current, swell, break, depth — like terrain. Scuba, surfing, kiteboarding, or open-water swimming fit your body in ways land sports never quite do.',
    'Apprentice to local watermen for a year before going beyond your depth. Water doesn\'t negotiate.',
    [
      // Water-sign emphasis
      { k: 'pSign', p: 'Sun', s: 'Pisces', w: 14 },
      { k: 'pSign', p: 'Sun', s: 'Cancer', w: 12 },
      { k: 'pSign', p: 'Sun', s: 'Scorpio', w: 12 },
      { k: 'pSign', p: 'Moon', s: 'Pisces', w: 12 },
      { k: 'pSign', p: 'Moon', s: 'Cancer', w: 10 },
      { k: 'pSign', p: 'Moon', s: 'Scorpio', w: 10 },
      // Element balance — multiple bodies in water
      { k: 'signFocus', s: 'Pisces', min: 2, w: 14 },
      { k: 'signFocus', s: 'Cancer', min: 2, w: 12 },
      { k: 'signFocus', s: 'Scorpio', min: 2, w: 12 },
      // Mars in water (the body moves through water as native medium)
      { k: 'pSign', p: 'Mars', s: 'Pisces', w: 12 },
      { k: 'pSign', p: 'Mars', s: 'Scorpio', w: 12 },
      { k: 'pSign', p: 'Mars', s: 'Cancer', w: 10 },
      // 12th house = ocean / hidden depths / submersion
      { k: 'pHouse', p: 'Mars', h: 12, w: 12 },
      { k: 'pHouse', p: 'Sun', h: 12, w: 10 },
      { k: 'pHouse', p: 'Moon', h: 12, w: 10 },
      { k: 'pHouse', p: 'Neptune', h: 1, w: 10 },
      // Mars–Neptune = movement through dissolution; water sport signature
      { k: 'aspect', p1: 'Mars', p2: 'Neptune', a: 'conj', w: 14 },
      { k: 'aspect', p1: 'Mars', p2: 'Neptune', a: 'trine', w: 12 },
      { k: 'aspect', p1: 'Mars', p2: 'Neptune', a: 'sextile', w: 10 },
      // Diving specifically — Pluto contact (depth) + Mars (action)
      { k: 'aspect', p1: 'Mars', p2: 'Pluto', a: 'trine', w: 10 },
      // Midpoint engine
      { k: 'midpt', m1: 'Mars', m2: 'Neptune', target: 'Sun', w: 14 },
      { k: 'midpt', m1: 'Mars', m2: 'Neptune', target: 'ASC', w: 14 },
      { k: 'midpt', m1: 'Sun', m2: 'Neptune', target: 'Mars', w: 12 },
      { k: 'midpt', m1: 'Mars', m2: 'Pluto', target: 'Neptune', w: 12 },  // depth + survival
    ], undefined,
    'Water-sign emphasis with Mars in or aspecting Neptune places your body fluently in water. The 12th house Mars or Mars/Neptune midpoint contacts mark divers, swimmers, and surfers — the soul comfortable in the medium that drowns most people.'),

  G('acrobat', 'Acrobat / Gymnast', 'physical',
    'You can flip your body and land. Spatial inversion doesn\'t panic the inner ear.',
    'Adult gymnastics or aerial classes (silks, lyra). Insurance, mats, coaching — non-negotiable.',
    [
      { k: 'aspect', p1: 'Mars', p2: 'Uranus', a: 'sextile', w: 12 },
      { k: 'pSign', p: 'Mars', s: 'Sagittarius', w: 10 },
      { k: 'pHouse', p: 'Mars', h: 5, w: 12 },
      { k: 'aspect', p1: 'Venus', p2: 'Mars', a: 'sextile', w: 10 },
    ]),

  G('huntingInstinct', 'Hunting / Tracking Instinct', 'physical',
    'You can track. Sign, sound, and patience compose into successful pursuit.',
    'Bow-hunting first; firearms second. The bow forces stillness the gun lets you skip.',
    [
      { k: 'pSign', p: 'Sun', s: 'Scorpio', w: 12 },
      { k: 'pSign', p: 'Mars', s: 'Scorpio', w: 14 },
      { k: 'aspect', p1: 'Mars', p2: 'Pluto', a: 'sextile', w: 10 },
      { k: 'pHouse', p: 'Mars', h: 6, w: 10 },
    ]),

  G('handsCraft', 'Hand-Craft Mastery', 'physical',
    'Your hands learn fine work — luthiery, carving, stitching, smithing — fast.',
    'Pick one craft; complete 12 finished pieces over a year.',
    [
      { k: 'pSign', p: 'Sun', s: 'Virgo', w: 12 },
      { k: 'pSign', p: 'Venus', s: 'Taurus', w: 12 },
      { k: 'pHouse', p: 'Venus', h: 6, w: 12 },
      { k: 'aspect', p1: 'Venus', p2: 'Saturn', a: 'sextile', w: 10 },
    ]),

  G('horsemanship', 'Horsemanship / Animal Mastery', 'physical',
    'Large animals listen to you. Body language across species is intelligible.',
    'Volunteer at a horse-rescue or working stable. Hours with animals build the channel.',
    [
      { k: 'pSign', p: 'Sun', s: 'Sagittarius', w: 12 },
      { k: 'pHouse', p: 'Moon', h: 6, w: 12 },
      { k: 'asteroid', aster: 'Ceres', target: 'Moon', w: 10 },
      { k: 'aspect', p1: 'Mars', p2: 'Jupiter', a: 'sextile', w: 10 },
    ]),

  // ════════════════════════════════════════════════════════════
  // LOVE GIFTS (14)
  // ════════════════════════════════════════════════════════════

  G('soulmateMagnet', 'Soulmate Magnet', 'love',
    'You attract karmically resonant partners. Recognition happens fast and unmistakably.',
    'Stop dating to fill space. The next one walks in when you\'re fully occupied with your own life.',
    [
      { k: 'asteroid', aster: 'Juno', target: 'Sun', w: 18 },
      { k: 'asteroid', aster: 'Juno', target: 'Moon', w: 16 },
      { k: 'asteroid', aster: 'Juno', target: 'Venus', w: 14 },
      { k: 'aspect', p1: 'Venus', p2: 'Pluto', a: 'trine', w: 12 },
      { k: 'pHouse', p: 'Venus', h: 7, w: 14 },
    ]),

  G('eroticMagnetism', 'Erotic Magnetism', 'love',
    'You generate charge in proximity. Sexual presence travels through cloth and screens.',
    'Own it without performing. The trap is overuse; the practice is integration.',
    [
      { k: 'asteroid', aster: 'Eros', target: 'Sun', w: 18 },
      { k: 'asteroid', aster: 'Eros', target: 'Moon', w: 16 },
      { k: 'asteroid', aster: 'Eros', target: 'ASC', w: 18 },
      { k: 'aspect', p1: 'Venus', p2: 'Pluto', a: 'conj', w: 14 },
      { k: 'asteroid', aster: 'Lilith', target: 'Venus', w: 14 },
      { k: 'pSign', p: 'Venus', s: 'Scorpio', w: 12 },
    ], ['power', 'shadow']),

  G('twinFlameRecognition', 'Twin Flame Recognition', 'love',
    'You meet your mirror and recognize them inside the first conversation.',
    'Distinguish between twin and karmic. Twins push you to wholeness; karmic teach a lesson and exit.',
    [
      { k: 'aspect', p1: 'Sun', p2: 'Moon', a: 'opp', w: 12 },
      { k: 'pSign', p: 'Sun', s: 'Pisces', w: 10 },
      { k: 'aspect', p1: 'Venus', p2: 'Neptune', a: 'conj', w: 14 },
      { k: 'asteroid', aster: 'Karma', target: 'Venus', w: 12 },
    ]),

  G('devotionalLove', 'Devotional Love', 'love',
    'You can love one person across decades without losing the spark. Loyalty is your default, not your discipline.',
    'Marriage or long-form partnership; you suit it. Skip the hookup decade if you can.',
    [
      { k: 'aspect', p1: 'Venus', p2: 'Saturn', a: 'conj', w: 14 },
      { k: 'aspect', p1: 'Venus', p2: 'Saturn', a: 'trine', w: 12 },
      { k: 'asteroid', aster: 'Vesta', target: 'Venus', w: 14 },
      { k: 'asteroid', aster: 'Juno', target: 'Saturn', w: 12 },
      { k: 'pSign', p: 'Venus', s: 'Taurus', w: 10 },
    ]),

  G('tantricSensitivity', 'Tantric / Sacred Sexuality', 'love',
    'You feel sexual energy as more than physical. The merge becomes a practice, not a destination.',
    'Train with vetted teachers (Margot Anand, Charles Muir lineage). Quality matters; sketchy lineages exist.',
    [
      { k: 'aspect', p1: 'Venus', p2: 'Pluto', a: 'sextile', w: 14 },
      { k: 'asteroid', aster: 'Eros', target: 'Pluto', w: 14 },
      { k: 'pHouse', p: 'Venus', h: 8, w: 12 },
      { k: 'pSign', p: 'Sun', s: 'Scorpio', w: 12 },
    ]),

  G('romanticStoryteller', 'Romantic Storyteller', 'love',
    'You can write a love letter that lands. Your voice carries longing into language.',
    'Hand-write 12 letters this year — to lovers past, present, and future. The discipline reveals patterns.',
    [
      { k: 'pSign', p: 'Venus', s: 'Pisces', w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Venus', a: 'conj', w: 12 },
      { k: 'aspect', p1: 'Venus', p2: 'Neptune', a: 'sextile', w: 12 },
      { k: 'pHouse', p: 'Venus', h: 5, w: 12 },
    ]),

  G('conflictResolution', 'Conflict Resolution in Love', 'love',
    'You can navigate the worst fight without losing the relationship. Repair after rupture is your strength.',
    'Gottman or EFT for couples. The frameworks pair with your instinct.',
    [
      { k: 'pSign', p: 'Venus', s: 'Libra', w: 12 },
      { k: 'asteroid', aster: 'Juno', target: 'Mercury', w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Venus', a: 'sextile', w: 12 },
      { k: 'pHouse', p: 'Venus', h: 7, w: 14 },
    ]),

  G('familyBuilder', 'Family Builder', 'love',
    'You build hearth. Children, partner, and extended kin orbit your home as the center.',
    'Choose your ground (literal house, location, or chosen family). Settle. The roots do the work.',
    [
      { k: 'pHouse', p: 'Moon', h: 4, w: 14 },
      { k: 'pSign', p: 'Sun', s: 'Cancer', w: 12 },
      { k: 'asteroid', aster: 'Ceres', target: 'Moon', w: 12 },
      { k: 'pHouse', p: 'Venus', h: 4, w: 12 },
    ]),

  G('friendFirstLover', 'Friend-First Lover', 'love',
    'Your best partnerships start as friendships. Heat builds slowly and lasts.',
    'Don\'t collapse the friendship into romance fast. The slow burn is your structural advantage.',
    [
      { k: 'pSign', p: 'Venus', s: 'Aquarius', w: 14 },
      { k: 'pHouse', p: 'Venus', h: 11, w: 14 },
      { k: 'aspect', p1: 'Venus', p2: 'Uranus', a: 'sextile', w: 10 },
      { k: 'pSign', p: 'DSC', s: 'Aquarius', w: 10 },
    ]),

  G('openCommunication', 'Open-Hearted Communication', 'love',
    'You can name what you feel mid-conversation. Most people retrofit; you live in real time.',
    'NVC (Marshall Rosenberg) + somatic check-ins. The combination is rare and powerful.',
    [
      { k: 'aspect', p1: 'Mercury', p2: 'Venus', a: 'conj', w: 12 },
      { k: 'aspect', p1: 'Moon', p2: 'Mercury', a: 'sextile', w: 12 },
      { k: 'pSign', p: 'Mercury', s: 'Cancer', w: 10 },
      { k: 'pHouse', p: 'Mercury', h: 7, w: 12 },
    ]),

  G('bodyLanguageReader', 'Body Language Reader', 'love',
    'You read interest, hesitation, attraction, and exit before words confirm.',
    'Practice in coffee shops. People-watching trains the channel; verifying with friends sharpens it.',
    [
      { k: 'aspect', p1: 'Mercury', p2: 'Neptune', a: 'sextile', w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 12, w: 10 },
      { k: 'asteroid', aster: 'Psyche', target: 'Mercury', w: 12 },
      { k: 'pSign', p: 'Moon', s: 'Pisces', w: 10 },
    ]),

  G('sacredSexuality', 'Sacred Sexuality', 'love',
    'You hold sex as sacrament. Encounters become rituals; partners become co-celebrants.',
    'Read Margo Anand + Mantak Chia. Practice with one consenting partner over a year.',
    [
      { k: 'asteroid', aster: 'Eros', target: 'Vesta', w: 14 },
      { k: 'aspect', p1: 'Venus', p2: 'Pluto', a: 'trine', w: 12 },
      { k: 'pHouse', p: 'Venus', h: 8, w: 14 },
      { k: 'pHouse', p: 'Pluto', h: 5, w: 10 },
    ]),

  G('charismaInRomance', 'Charisma in Romance', 'love',
    'You\'re effortless on dates. Conversation flows; second dates happen.',
    'Don\'t over-rely. The skill atrophies if you don\'t deepen past charm.',
    [
      { k: 'aspect', p1: 'Venus', p2: 'Jupiter', a: 'conj', w: 12 },
      { k: 'pSign', p: 'Venus', s: 'Leo', w: 12 },
      { k: 'pHouse', p: 'Venus', h: 5, w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Venus', a: 'sextile', w: 10 },
    ]),

  G('dateNightMagic', 'Date Night Magic', 'love',
    'You design experiences. Your dates feel intentional, not transactional.',
    'Plan 10 themed dates. Document each. The artistry compounds; partners remember.',
    [
      { k: 'pSign', p: 'Venus', s: 'Leo', w: 12 },
      { k: 'pHouse', p: 'Venus', h: 5, w: 14 },
      { k: 'aspect', p1: 'Venus', p2: 'Neptune', a: 'sextile', w: 12 },
      { k: 'asteroid', aster: 'Eros', target: 'Venus', w: 12 },
    ]),

  // ════════════════════════════════════════════════════════════
  // SHADOW GIFTS (12)
  // ════════════════════════════════════════════════════════════

  G('emotionalEndurance', 'Emotional Endurance', 'shadow',
    'You absorb storms others would fold under. Resilience is structural for you.',
    'Track what costs you and what doesn\'t. Endurance becomes martyrdom if you don\'t differentiate.',
    [
      { k: 'pSign', p: 'Moon', s: 'Capricorn', w: 14 },
      { k: 'pSign', p: 'Moon', s: 'Scorpio', w: 14 },
      { k: 'aspect', p1: 'Moon', p2: 'Saturn', a: 'conj', w: 14 },
      { k: 'aspect', p1: 'Moon', p2: 'Pluto', a: 'square', w: 12 },
      { k: 'asteroid', aster: 'Vesta', target: 'Moon', w: 12 },
    ]),

  G('psychologicalWarfare', 'Psychological Warfare', 'shadow',
    'You can disassemble an opponent\'s position with surgical precision. The skill is real; ethics is the question.',
    'Use only when defending boundaries that matter. Otherwise it metastasizes into cruelty.',
    [
      { k: 'aspect', p1: 'Mars', p2: 'Pluto', a: 'conj', w: 16 },
      { k: 'aspect', p1: 'Mercury', p2: 'Pluto', a: 'square', w: 14 },
      { k: 'pSign', p: 'Mars', s: 'Scorpio', w: 14 },
      { k: 'asteroid', aster: 'Lilith', target: 'Mars', w: 12 },
      { k: 'asteroid', aster: 'Nemesis', target: 'Mars', w: 12 },
    ]),

  G('survivalInstinct', 'Survival Instinct', 'shadow',
    'When the wheels come off you don\'t freeze. You assess and act.',
    'Test it small — solo backpacking, fasting, or financial cliff-edges chosen on purpose. The reps build.',
    [
      { k: 'pSign', p: 'Mars', s: 'Capricorn', w: 12 },
      { k: 'pSign', p: 'Sun', s: 'Scorpio', w: 12 },
      { k: 'aspect', p1: 'Mars', p2: 'Saturn', a: 'conj', w: 12 },
      { k: 'aspect', p1: 'Mars', p2: 'Pluto', a: 'sextile', w: 12 },
      { k: 'pHouse', p: 'Pluto', h: 1, w: 10 },
    ]),

  G('coldStrategy', 'Cold-Blooded Strategy', 'shadow',
    'You can detach from outcome and execute. Sentiment doesn\'t corrupt your decision tree.',
    'Use for high-stakes decisions only. Cold strategy applied to relationships becomes machinery.',
    [
      { k: 'aspect', p1: 'Mars', p2: 'Saturn', a: 'conj', w: 14 },
      { k: 'pSign', p: 'Mars', s: 'Capricorn', w: 14 },
      { k: 'aspect', p1: 'Mercury', p2: 'Pluto', a: 'conj', w: 12 },
      { k: 'asteroid', aster: 'Pallas', target: 'Saturn', w: 12 },
    ]),

  G('boundaryEnforcer', 'Boundary Enforcer', 'shadow',
    'You can say no without justification, repetition, or apology.',
    'Practice the one-sentence "no" with low stakes. Build to high stakes over a year.',
    [
      { k: 'pSign', p: 'Saturn', s: 'Capricorn', w: 14 },
      { k: 'aspect', p1: 'Mars', p2: 'Saturn', a: 'sextile', w: 12 },
      { k: 'pHouse', p: 'Saturn', h: 1, w: 12 },
      { k: 'pSign', p: 'Mars', s: 'Capricorn', w: 12 },
    ]),

  G('truthBomber', 'Truth Bomber', 'shadow',
    'You say what nobody else will. Rooms re-orient around your honesty.',
    'Truth without timing is cruelty. Develop the art of when, not just what.',
    [
      { k: 'aspect', p1: 'Mars', p2: 'Mercury', a: 'conj', w: 14 },
      { k: 'pSign', p: 'Mercury', s: 'Sagittarius', w: 12 },
      { k: 'aspect', p1: 'Sun', p2: 'Uranus', a: 'square', w: 12 },
      { k: 'asteroid', aster: 'Nemesis', target: 'Mercury', w: 12 },
    ]),

  G('predatorSpotter', 'Predator Spotter', 'shadow',
    'You see the bad actor before consequences arrive. People who hurt others read clearly to you.',
    'Trust the read. Your instinct is uncomfortable but accurate.',
    [
      { k: 'pSign', p: 'Sun', s: 'Scorpio', w: 14 },
      { k: 'pSign', p: 'Moon', s: 'Scorpio', w: 12 },
      { k: 'pHouse', p: 'Pluto', h: 8, w: 12 },
      { k: 'asteroid', aster: 'Nemesis', target: 'Pluto', w: 14 },
    ]),

  G('shadowWorker', 'Shadow Worker', 'shadow',
    'You go into your own basement willingly. The integration work that breaks others is your normal Tuesday.',
    'Jungian analyst, somatic IFS, or men\'s/women\'s circle work. Two-year commitment minimum.',
    [
      { k: 'pHouse', p: 'Pluto', h: 12, w: 14 },
      { k: 'aspect', p1: 'Sun', p2: 'Pluto', a: 'square', w: 12 },
      { k: 'asteroid', aster: 'Lilith', target: 'Sun', w: 12 },
      { k: 'asteroid', aster: 'Karma', target: 'Pluto', w: 12 },
    ]),

  G('hiddenCardsPlayer', 'Hidden-Cards Player', 'shadow',
    'You don\'t reveal what you know. Information asymmetry is your default mode.',
    'Choose contexts. Hidden-cards in poker is craft; hidden-cards with intimates is wreckage.',
    [
      { k: 'pSign', p: 'Sun', s: 'Scorpio', w: 12 },
      { k: 'pHouse', p: 'Pluto', h: 12, w: 14 },
      { k: 'pHouse', p: 'Mercury', h: 12, w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Pluto', a: 'square', w: 10 },
    ]),

  G('loyaltyTester', 'Loyalty Tester', 'shadow',
    'You set traps to verify allegiance. The skill protects; overused, it isolates.',
    'Test only when stakes warrant. Your closest people deserve your trust pre-loaded.',
    [
      { k: 'pSign', p: 'Sun', s: 'Scorpio', w: 12 },
      { k: 'aspect', p1: 'Mars', p2: 'Pluto', a: 'square', w: 10 },
      { k: 'asteroid', aster: 'Nemesis', target: 'Sun', w: 12 },
      { k: 'pHouse', p: 'Pluto', h: 11, w: 10 },
    ]),

  G('cuttingWords', 'Cutting Words', 'shadow',
    'You can verbally end someone in three sentences.',
    'Wield surgically. The same skill mis-aimed becomes a permanent reputation.',
    [
      { k: 'aspect', p1: 'Mercury', p2: 'Mars', a: 'conj', w: 14 },
      { k: 'aspect', p1: 'Mercury', p2: 'Pluto', a: 'square', w: 12 },
      { k: 'pSign', p: 'Mercury', s: 'Scorpio', w: 12 },
      { k: 'asteroid', aster: 'Nemesis', target: 'Mercury', w: 12 },
    ]),

  G('nightWalker', 'Nightwalker', 'shadow',
    'You\'re alive at 3am when the world quiets. Your gifts come online in the dark.',
    'Honor it. Don\'t force a 9-to-5 if your nature is night-shifted; build a life around your real circadian.',
    [
      { k: 'pHouse', p: 'Moon', h: 12, w: 12 },
      { k: 'pHouse', p: 'Sun', h: 12, w: 10 },
      { k: 'pSign', p: 'Moon', s: 'Scorpio', w: 10 },
      { k: 'asteroid', aster: 'Lilith', target: 'Moon', w: 12 },
    ]),

  // ════════════════════════════════════════════════════════════
  // CROSS-CATEGORY EXTENSIONS (14)
  // ════════════════════════════════════════════════════════════

  G('charisma', 'Pure Charisma', 'performance',
    'You walk into a room and people orient. There\'s no formula — your presence is the message.',
    'Don\'t over-analyze it. The skill is to not lose it through self-consciousness.',
    [
      { k: 'onAngle', body: 'Sun', angle: 'ASC', w: 22 },
      { k: 'aspect', p1: 'Sun', p2: 'Jupiter', a: 'conj', w: 14 },
      { k: 'pSign', p: 'ASC', s: 'Leo', w: 14 },
      { k: 'pSign', p: 'ASC', s: 'Sagittarius', w: 12 },
    ], ['power', 'love']),

  G('comedicWriting', 'Comedic Writing', 'performance',
    'You can construct a joke on the page. Set up, misdirect, payoff — the architecture is automatic.',
    'Write 1 joke per day for 365 days. The Anne Lamott law applies: bad first drafts are mandatory.',
    [
      { k: 'aspect', p1: 'Mercury', p2: 'Uranus', a: 'sextile', w: 12 },
      { k: 'aspect', p1: 'Mercury', p2: 'Mars', a: 'sextile', w: 12 },
      { k: 'pSign', p: 'Mercury', s: 'Aquarius', w: 12 },
      { k: 'pHouse', p: 'Uranus', h: 3, w: 10 },
    ]),

  G('teachingGenius', 'Teaching Genius', 'intelligence',
    'You compress complex material into accessible explanation. Students arrive lost and leave fluent.',
    'Teach one course you know cold. Recording yourself reveals what you assume listeners know that they don\'t.',
    [
      { k: 'aspect', p1: 'Mercury', p2: 'Jupiter', a: 'conj', w: 14 },
      { k: 'pHouse', p: 'Mercury', h: 9, w: 14 },
      { k: 'pHouse', p: 'Jupiter', h: 9, w: 12 },
      { k: 'pSign', p: 'Sun', s: 'Sagittarius', w: 10 },
    ], ['healing']),

  G('writingGenius', 'Writing Genius', 'intelligence',
    'Your sentences hold tension and rhythm. The reader doesn\'t put it down because the next sentence is earned.',
    'Write 1,000 words a day. Read three writers obsessively whose voice you envy. Imitate, then break free.',
    [
      { k: 'aspect', p1: 'Mercury', p2: 'Neptune', a: 'sextile', w: 14 },
      { k: 'aspect', p1: 'Mercury', p2: 'Saturn', a: 'sextile', w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 3, w: 12 },
      { k: 'pSign', p: 'Mercury', s: 'Pisces', w: 12 },
      { k: 'pSign', p: 'Mercury', s: 'Sagittarius', w: 10 },
    ]),

  G('photographicEye', 'Photographic Eye', 'performance',
    'You frame light and meaning instinctively. Composition is something you see, not calculate.',
    'Carry one camera daily for 90 days. Shoot 30 frames; keep the best. Volume is the curriculum.',
    [
      { k: 'aspect', p1: 'Venus', p2: 'Uranus', a: 'sextile', w: 12 },
      { k: 'pHouse', p: 'Venus', h: 5, w: 12 },
      { k: 'asteroid', aster: 'Pallas', target: 'Venus', w: 12 },
      { k: 'pSign', p: 'Venus', s: 'Aquarius', w: 10 },
    ]),

  G('visualArtist', 'Visual Artist (Painting / Drawing / Sculpture)', 'performance',
    'You see what isn\'t on the page yet. Color, line, form, and negative space all speak to you as a single language. Hands and eye work together at speeds you don\'t fully track.',
    'Daily practice — 30 minutes of drawing or painting from observation, no exceptions, for 90 days. The habit compounds; the talent doesn\'t.',
    [
      // Venus–Neptune = the painter\'s eye, dreamlike vision
      { k: 'aspect', p1: 'Venus', p2: 'Neptune', a: 'conj', w: 16 },
      { k: 'aspect', p1: 'Venus', p2: 'Neptune', a: 'trine', w: 14 },
      { k: 'aspect', p1: 'Venus', p2: 'Neptune', a: 'sextile', w: 12 },
      // Sun–Neptune = visual imagination at the core of identity
      { k: 'aspect', p1: 'Sun', p2: 'Neptune', a: 'conj', w: 14 },
      { k: 'aspect', p1: 'Sun', p2: 'Neptune', a: 'trine', w: 12 },
      // Moon–Neptune = emotional imagery, the colorist
      { k: 'aspect', p1: 'Moon', p2: 'Neptune', a: 'conj', w: 12 },
      { k: 'aspect', p1: 'Moon', p2: 'Neptune', a: 'trine', w: 10 },
      // Venus signs that produce visual artistry
      { k: 'pSign', p: 'Venus', s: 'Pisces', w: 14 },
      { k: 'pSign', p: 'Venus', s: 'Libra', w: 12 },
      { k: 'pSign', p: 'Venus', s: 'Taurus', w: 12 },
      { k: 'pSign', p: 'Sun', s: 'Pisces', w: 10 },
      // Houses
      { k: 'pHouse', p: 'Venus', h: 5, w: 14 },
      { k: 'pHouse', p: 'Venus', h: 12, w: 10 },
      { k: 'pHouse', p: 'Neptune', h: 5, w: 12 },
      { k: 'pHouse', p: 'Neptune', h: 1, w: 10 },
      { k: 'pHouse', p: 'Sun', h: 5, w: 10 },
      { k: 'houseFocus', h: 5, min: 2, w: 12 },
      // Apollo (creative brilliance) + Pallas (compositional intelligence)
      { k: 'asteroid', aster: 'Apollo', target: 'Venus', w: 14 },
      { k: 'asteroid', aster: 'Apollo', target: 'Sun', w: 12 },
      { k: 'asteroid', aster: 'Pallas', target: 'Venus', w: 12 },
      { k: 'asteroid', aster: 'Pallas', target: 'Mercury', w: 10 },
      // Midpoint engine — the painter / sculptor signatures
      { k: 'midpt', m1: 'Venus', m2: 'Neptune', target: 'Sun', w: 16 },
      { k: 'midpt', m1: 'Venus', m2: 'Neptune', target: 'Mercury', w: 14 },
      { k: 'midpt', m1: 'Venus', m2: 'Neptune', target: 'ASC', w: 16 },
      { k: 'midpt', m1: 'Sun', m2: 'Venus', target: 'Neptune', w: 12 },
      { k: 'midpt', m1: 'Sun', m2: 'Neptune', target: 'Venus', w: 12 },
      { k: 'midpt', m1: 'Venus', m2: 'Apollo', target: 'Sun', w: 12 },
    ], undefined,
    'Venus–Neptune contact and 5th house emphasis produce the visual artist signature in your chart. Apollo or Pallas anchoring to Venus or Sun marks the soul that came here to render the visible world into image.'),

  G('hospitality', 'Hospitality Mastery', 'love',
    'Your home or restaurant or hotel becomes the place people don\'t want to leave. Care is in every detail.',
    'Host one dinner a month for 12 months. Document menus, guest lists, and what worked. The craft compounds.',
    [
      { k: 'pSign', p: 'Sun', s: 'Cancer', w: 12 },
      { k: 'pHouse', p: 'Venus', h: 4, w: 14 },
      { k: 'asteroid', aster: 'Ceres', target: 'Venus', w: 12 },
      { k: 'pHouse', p: 'Moon', h: 4, w: 10 },
    ], ['money']),

  G('culinaryGenius', 'Culinary Genius', 'physical',
    'You taste a dish and know what\'s missing. You compose flavors the way musicians compose chords.',
    'Cook one new recipe per week for 52 weeks. Then design 12 of your own.',
    [
      { k: 'pSign', p: 'Venus', s: 'Taurus', w: 14 },
      { k: 'pSign', p: 'Sun', s: 'Cancer', w: 12 },
      { k: 'pHouse', p: 'Venus', h: 6, w: 12 },
      { k: 'asteroid', aster: 'Ceres', target: 'Venus', w: 12 },
      { k: 'pHouse', p: 'Sun', h: 6, w: 10 },
    ], ['healing']),

  G('mentorEnergy', 'Mentor Energy', 'healing',
    'Younger versions of yourself find you. They hand you their problems and you hand back better versions of themselves.',
    'Mentor one person seriously over a year. The reciprocity is the teaching.',
    [
      { k: 'aspect', p1: 'Sun', p2: 'Jupiter', a: 'conj', w: 12 },
      { k: 'pHouse', p: 'Jupiter', h: 11, w: 12 },
      { k: 'pSign', p: 'Sun', s: 'Sagittarius', w: 12 },
      { k: 'asteroid', aster: 'Chiron', target: 'Jupiter', w: 12 },
    ]),

  G('paranormalSensitivity', 'Paranormal Sensitivity', 'spiritual',
    'You sense presence in rooms others find empty. The veil is thin where you stand.',
    'Document encounters with date, location, and corroboration. Pattern reveals geography of your sensitivity.',
    [
      { k: 'pHouse', p: 'Pluto', h: 12, w: 14 },
      { k: 'pHouse', p: 'Moon', h: 12, w: 12 },
      { k: 'aspect', p1: 'Moon', p2: 'Pluto', a: 'conj', w: 12 },
      { k: 'pSign', p: 'Sun', s: 'Pisces', w: 10 },
    ]),

  G('sigilcraft', 'Sigil Craft / Symbol Magic', 'spiritual',
    'Symbols you create carry charge. Other people feel them without knowing why.',
    'Austin Osman Spare\'s sigil method, then chaos magic primers. Practice with low-stakes intentions before high.',
    [
      { k: 'aspect', p1: 'Mercury', p2: 'Pluto', a: 'sextile', w: 12 },
      { k: 'asteroid', aster: 'Pallas', target: 'Mercury', w: 12 },
      { k: 'asteroid', aster: 'Urania', target: 'Mercury', w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 12, w: 10 },
    ]),

  G('craftsmanship', 'Master Craftsmanship', 'physical',
    'Your hands know what your mind hasn\'t learned yet. Wood, metal, leather, clay — the material teaches you.',
    'Apprentice with a master for one year. Five thousand hours separates beginner from craftsman.',
    [
      { k: 'pSign', p: 'Sun', s: 'Capricorn', w: 12 },
      { k: 'pSign', p: 'Sun', s: 'Virgo', w: 12 },
      { k: 'pHouse', p: 'Saturn', h: 6, w: 14 },
      { k: 'aspect', p1: 'Saturn', p2: 'Mars', a: 'sextile', w: 10 },
      { k: 'asteroid', aster: 'Vesta', target: 'Mars', w: 10 },
    ]),

  G('genealogist', 'Genealogist / Family Historian', 'intelligence',
    'You can reconstruct lineage from fragments. Census records, parish books, and oral history compose into proof.',
    'Subscribe to one genealogical service. Trace one branch to 1700. The hunt is addicting.',
    [
      { k: 'pHouse', p: 'Saturn', h: 4, w: 12 },
      { k: 'pHouse', p: 'Mercury', h: 4, w: 12 },
      { k: 'pSign', p: 'Moon', s: 'Cancer', w: 10 },
      { k: 'asteroid', aster: 'Karma', target: 'Moon', w: 10 },
    ]),

  G('boldnessGenius', 'Boldness Under Pressure', 'power',
    'You make the call others avoid. The pressure that paralyzes peers focuses you.',
    'Test it small — public speaking, asking for raises, walking into rooms. The reps build.',
    [
      { k: 'aspect', p1: 'Mars', p2: 'Jupiter', a: 'conj', w: 14 },
      { k: 'pSign', p: 'Mars', s: 'Aries', w: 12 },
      { k: 'asteroid', aster: 'Nike', target: 'Sun', w: 14 },
      { k: 'pSign', p: 'Sun', s: 'Aries', w: 10 },
    ]),

  G('justiceFighter', 'Justice / Whistleblower', 'shadow',
    'You can\'t look away from corruption. The compass needle points toward consequence regardless of cost to you.',
    'Get legal counsel before publishing. The gift is real; the protection matters.',
    [
      { k: 'asteroid', aster: 'Nemesis', target: 'Sun', w: 16 },
      { k: 'asteroid', aster: 'Nemesis', target: 'Mars', w: 14 },
      { k: 'pSign', p: 'Sun', s: 'Sagittarius', w: 10 },
      { k: 'pSign', p: 'Sun', s: 'Aquarius', w: 10 },
      { k: 'pHouse', p: 'Pluto', h: 9, w: 12 },
    ]),

];

// ─── Category metadata for UI ──────────────────────────────────

export const CATEGORY_LABELS: Record<GiftCategory, string> = {
  performance: 'Performance',
  spiritual: 'Spiritual',
  power: 'Power',
  money: 'Money',
  intelligence: 'Intelligence',
  healing: 'Healing',
  physical: 'Physical',
  love: 'Love',
  shadow: 'Shadow',
};

export const CATEGORY_GLYPHS: Record<GiftCategory, string> = {
  performance: '★',
  spiritual: '✦',
  power: '⚜',
  money: '$',
  intelligence: '◈',
  healing: '✚',
  physical: '⚡',
  love: '♥',
  shadow: '☾',
};
