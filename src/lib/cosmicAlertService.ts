/**
 * Cosmic Alert Service
 * Transforms raw transit event data from the API into enriched, mobile-style cosmic alerts
 * with importance scoring, categories, interpretive text, and timing windows.
 */

// ---------------------------------------------------------------------------
// Input type (raw API shape)
// ---------------------------------------------------------------------------

export interface TransitEvent {
  date: string;            // "2026-05-15"
  transiting_planet: string;
  natal_planet: string;
  aspect_name: string;     // "conjunction", "opposition", "trine", "square", "sextile"
  orb: number;
  is_retrograde: boolean;
  transit_sign: string;
  natal_sign: string;
}

// ---------------------------------------------------------------------------
// Alert types
// ---------------------------------------------------------------------------

export type AlertCategory =
  | 'love'
  | 'career'
  | 'money'
  | 'identity'
  | 'healing'
  | 'spiritual'
  | 'communication'
  | 'general';

export type AlertStatus = 'active' | 'upcoming' | 'past';

export interface CosmicAlert {
  id: string;
  event_type: string;
  category: AlertCategory;
  importance_score: number;
  status: AlertStatus;
  start_time: string;
  peak_time: string;
  end_time: string;
  title: string;
  short_body: string;
  long_body: string;
  action_advice: string;
  transiting_planet: string;
  natal_planet: string;
  aspect_name: string;
  transit_sign: string;
  natal_sign: string;
  orb: number;
  is_retrograde: boolean;
  is_read: boolean;
  // Backward-compat fields consumed by detail page / Supabase rows
  user_id?: string;
  deep_link_target?: string;
  metadata?: Record<string, any>;
  description?: string;
  interpretation?: string;
  timing_window_start?: string;
  timing_window_end?: string;
  practical_advice?: string;
  emotional_meaning?: string;
  intensity?: number;
  planets_involved?: string[];
  created_at?: string;
}

// ---------------------------------------------------------------------------
// Category Config
// ---------------------------------------------------------------------------

export const CATEGORY_CONFIG: Record<
  AlertCategory,
  {
    emoji: string;
    color: string;
    bgColor: string;
    label: string;
    gradient: string;
    borderColor: string;
  }
> = {
  love: {
    emoji: '\u{1F49E}',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    label: 'Love & Relationships',
    gradient: 'from-pink-600 to-pink-900',
    borderColor: 'border-pink-500/30',
  },
  career: {
    emoji: '\u{1F3DB}️',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    label: 'Career & Ambition',
    gradient: 'from-blue-600 to-blue-900',
    borderColor: 'border-blue-500/30',
  },
  money: {
    emoji: '\u{1F4B0}',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    label: 'Money & Values',
    gradient: 'from-amber-600 to-amber-900',
    borderColor: 'border-amber-500/30',
  },
  identity: {
    emoji: '✨',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    label: 'Identity & Self',
    gradient: 'from-purple-600 to-purple-900',
    borderColor: 'border-purple-500/30',
  },
  healing: {
    emoji: '\u{1F33F}',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    label: 'Healing & Growth',
    gradient: 'from-green-600 to-green-900',
    borderColor: 'border-green-500/30',
  },
  spiritual: {
    emoji: '\u{1F52E}',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    label: 'Spiritual Path',
    gradient: 'from-violet-600 to-violet-900',
    borderColor: 'border-violet-500/30',
  },
  communication: {
    emoji: '\u{1F4AC}',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    label: 'Communication',
    gradient: 'from-cyan-600 to-cyan-900',
    borderColor: 'border-cyan-500/30',
  },
  general: {
    emoji: '\u{1F30C}',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    label: 'Cosmic Shift',
    gradient: 'from-indigo-600 to-indigo-900',
    borderColor: 'border-indigo-500/30',
  },
};

// ---------------------------------------------------------------------------
// Scoring Weights
// ---------------------------------------------------------------------------

const PLANET_WEIGHT: Record<string, number> = {
  Jupiter: 7,
  Saturn: 8,
  Uranus: 8,
  Neptune: 7,
  Pluto: 9,
  Mars: 5,
  Venus: 4,
  Mercury: 3,
  Sun: 6,
  Moon: 5,
};

const NATAL_WEIGHT: Record<string, number> = {
  Sun: 4,
  Moon: 3,
  Ascendant: 3,
  MC: 2,
  Midheaven: 2,
  Venus: 2,
  Mars: 2,
};

const ASPECT_WEIGHT: Record<string, number> = {
  conjunction: 3,
  opposition: 2,
  square: 2,
  trine: 1,
  sextile: 1,
};

function computeImportance(event: TransitEvent): number {
  const planetW = PLANET_WEIGHT[event.transiting_planet] ?? 4;
  const natalW = NATAL_WEIGHT[event.natal_planet] ?? 1;
  const aspectW = ASPECT_WEIGHT[event.aspect_name] ?? 1;
  let exactnessBonus = 0;
  if (event.orb < 0.5) exactnessBonus = 2;
  else if (event.orb < 1) exactnessBonus = 1;
  return Math.min(10, Math.round((planetW + natalW + aspectW + exactnessBonus) / 2));
}

// ---------------------------------------------------------------------------
// Category Assignment
// ---------------------------------------------------------------------------

function assignCategory(event: TransitEvent): AlertCategory {
  const natal = event.natal_planet;
  const transiting = event.transiting_planet;

  if (natal === 'Venus') return 'love';
  if (natal === 'Saturn' || natal === 'MC' || natal === 'Midheaven') return 'career';
  if (natal === 'Jupiter') return 'money';
  if (natal === 'Sun' || natal === 'Ascendant') return 'identity';
  if (natal === 'Chiron') return 'healing';
  if (natal === 'Neptune') return 'spiritual';
  if (natal === 'Mercury') return 'communication';
  if (natal === 'Moon') {
    if (transiting === 'Neptune' || transiting === 'Pluto') return 'healing';
    return 'general';
  }
  if (natal === 'Mars') return 'career';
  return 'general';
}

// ---------------------------------------------------------------------------
// Timing & Status
// ---------------------------------------------------------------------------

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function computeTimingWindow(event: TransitEvent): {
  start_time: string;
  peak_time: string;
  end_time: string;
} {
  const orbDays = Math.max(1, Math.round(event.orb * 3));
  return {
    start_time: addDays(event.date, -orbDays),
    peak_time: event.date,
    end_time: addDays(event.date, orbDays),
  };
}

function computeStatus(start: string, end: string): AlertStatus {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  if (now >= s && now <= e) return 'active';
  if (s > now) return 'upcoming';
  return 'past';
}

// ---------------------------------------------------------------------------
// Public Helpers
// ---------------------------------------------------------------------------

export function getImportanceLabel(score: number): string {
  if (score >= 9) return 'Critical';
  if (score >= 7) return 'Important';
  if (score >= 5) return 'Notable';
  return 'Minor';
}

export function getImportanceColor(score: number): string {
  if (score >= 9) return 'border-l-red-500';
  if (score >= 7) return 'border-l-orange-500';
  if (score >= 5) return 'border-l-yellow-500';
  return 'border-l-slate-400';
}

export function timeRelativeLabel(dateStr: string): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Now';
  if (diffDays === 1) return 'In 1d';
  if (diffDays > 1) return `In ${diffDays}d`;
  if (diffDays === -1) return '1d ago';
  return `${Math.abs(diffDays)}d ago`;
}

// ---------------------------------------------------------------------------
// Title Generation
// ---------------------------------------------------------------------------

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function aspectVerb(aspect: string): string {
  switch (aspect) {
    case 'conjunction':
      return 'Conjuncts';
    case 'opposition':
      return 'Opposes';
    case 'square':
      return 'Squares';
    case 'trine':
      return 'Trines';
    case 'sextile':
      return 'Sextiles';
    default:
      return capitalizeFirst(aspect);
  }
}

function generateTitle(event: TransitEvent): string {
  return `${event.transiting_planet} ${aspectVerb(event.aspect_name)} Your ${event.natal_planet}`;
}

// ---------------------------------------------------------------------------
// Interpretation Lookup (60+ entries)
// ---------------------------------------------------------------------------

interface InterpEntry {
  short: string;
  long: string;
}

// Key = "TransitingPlanet-NatalPlanet-aspect"
const INTERP_TABLE: Record<string, InterpEntry> = {
  // ═══════════════════════════════════════════════════════════════════════
  // JUPITER transits
  // ═══════════════════════════════════════════════════════════════════════

  // Jupiter - Sun
  'Jupiter-Sun-conjunction': {
    short: 'A rare expansion of your core identity and purpose. Big opportunities arise.',
    long: 'Jupiter aligning with your natal Sun marks one of the most fortunate transits in astrology. Your confidence surges and doors open that were previously closed. This is a time to dream big and take bold steps toward your true calling. Projects launched now carry an inherent blessing of growth and optimism.',
  },
  'Jupiter-Sun-opposition': {
    short: 'Your ambitions are tested by over-extension. Balance enthusiasm with realism.',
    long: 'Jupiter opposing your Sun can inflate expectations beyond what is practical. While your desire for growth is strong, others may push back or commitments can stretch too thin. Use this transit to calibrate your vision, ensuring your goals are grounded in reality rather than wishful thinking.',
  },
  'Jupiter-Sun-square': {
    short: 'Restless desire for more clashes with current limitations. Growth requires friction.',
    long: 'Jupiter squaring your Sun creates inner tension between what you have and what you want. You may feel frustrated by rules or restrictions, yet this friction is the catalyst for genuine expansion. Channel the urgency into focused effort rather than scattering your energy across too many fronts.',
  },
  'Jupiter-Sun-trine': {
    short: 'Ease and good fortune flow into your life naturally. Accept gifts gracefully.',
    long: 'Jupiter trining your Sun brings a harmonious period of luck, confidence, and well-being. Opportunities seem to arrive without effort, and your optimism is contagious. Make the most of this gentle tailwind by initiating projects that benefit from momentum and goodwill.',
  },

  // Jupiter - Moon
  'Jupiter-Moon-conjunction': {
    short: 'Emotional abundance and generosity fill your inner world. Nurture yourself fully.',
    long: 'Jupiter conjunct your Moon expands your emotional capacity and deepens feelings of security. You may feel more generous, more hopeful, and more at peace with your needs. Family matters and home life benefit greatly, and your intuition is especially reliable during this transit.',
  },
  'Jupiter-Moon-opposition': {
    short: 'Emotional excess pulls you between comfort and adventure. Find your middle ground.',
    long: 'Jupiter opposing your Moon can amplify emotional reactions and create a tug-of-war between staying safe and venturing out. Over-indulgence in food, spending, or sentimentality is possible. Awareness of this pattern allows you to enjoy the expansion without losing your center.',
  },
  'Jupiter-Moon-square': {
    short: 'Restless emotions push for change. Distinguish genuine needs from passing whims.',
    long: 'Jupiter squaring your Moon stirs up discontent with emotional routines. You may crave more from relationships or living situations. The challenge is separating true inner growth from escapism. Sit with feelings before acting on them for the best outcomes.',
  },
  'Jupiter-Moon-trine': {
    short: 'Emotional well-being peaks. Relationships feel warm and supportive.',
    long: 'Jupiter trining your Moon creates an effortless sense of emotional abundance. You feel cared for and caring, and domestic life flows smoothly. Trust your instincts now, as they are guided by both wisdom and optimism. This is an ideal time for family gatherings and emotional healing.',
  },

  // Jupiter - Mercury
  'Jupiter-Mercury-conjunction': {
    short: 'Your mind expands with big ideas and powerful learning opportunities.',
    long: 'Jupiter conjunct your Mercury supercharges intellectual curiosity and communication. You may encounter a teacher, a book, or an idea that reshapes your worldview. Writing, teaching, and negotiations benefit enormously. Let your mind explore widely but commit your best ideas to paper.',
  },
  'Jupiter-Mercury-opposition': {
    short: 'Grand ideas meet communication challenges. Verify promises before committing.',
    long: 'Jupiter opposing your Mercury can lead to exaggerated promises, information overload, or misunderstandings born from over-optimism. Double-check details in contracts or agreements. The impulse to say yes to everything is strong but selectivity serves you better now.',
  },
  'Jupiter-Mercury-square': {
    short: 'Mental restlessness and scattered focus. Prioritize depth over breadth.',
    long: 'Jupiter squaring your Mercury fills your mind with more possibilities than you can process. The danger is starting many projects and finishing none. Discipline your thinking, choose the most promising thread, and follow it through to completion.',
  },
  'Jupiter-Mercury-trine': {
    short: 'Clear thinking and persuasive communication. Excellent for study and negotiation.',
    long: 'Jupiter trining your Mercury gifts you with mental clarity, eloquence, and fortunate timing in conversations. This is a prime transit for signing agreements, giving presentations, or absorbing new knowledge. Your words carry weight and inspire others naturally.',
  },

  // Jupiter - Venus
  'Jupiter-Venus-conjunction': {
    short: 'Love, beauty, and pleasure expand. One of the most delightful transits possible.',
    long: 'Jupiter conjunct your Venus is a signature of romantic and social abundance. Existing relationships deepen with joy, new connections carry a sense of destiny, and creative projects flourish. Financial windfalls or gifts are possible. Allow yourself to receive fully.',
  },
  'Jupiter-Venus-opposition': {
    short: 'Social excess or indulgence pulls at you. Enjoy but maintain your boundaries.',
    long: 'Jupiter opposing your Venus can inflate desires for luxury, pleasure, or romantic attention beyond what is sustainable. While the mood is festive, watch for overspending or attaching to people who reflect idealized fantasies rather than genuine compatibility.',
  },
  'Jupiter-Venus-square': {
    short: 'Desire for love and pleasure creates tension with practical realities.',
    long: 'Jupiter squaring your Venus stokes longing for more romance, beauty, or comfort than circumstances easily permit. The friction can motivate positive change in your love life or finances, but only if you channel the discontent into clear intentions rather than impulsive splurges.',
  },
  'Jupiter-Venus-trine': {
    short: 'Harmony in love and finances flows easily. Enjoy the sweetness of life.',
    long: 'Jupiter trining your Venus brings a grace period for relationships and money. Social events go well, partnerships feel rewarding, and creative endeavors carry a natural charm. This is a wonderful time to beautify your surroundings and express appreciation.',
  },

  // Jupiter - Mars
  'Jupiter-Mars-conjunction': {
    short: 'Bold energy surges. Ambition and courage reach a peak.',
    long: 'Jupiter conjunct your Mars ignites your drive and competitive spirit in a powerful way. Physical energy is high, and calculated risks tend to pay off. Athletic pursuits, entrepreneurial ventures, and assertive negotiations all benefit from this confident, fiery combination.',
  },
  'Jupiter-Mars-opposition': {
    short: 'Over-confidence or reckless action may backfire. Channel intensity wisely.',
    long: 'Jupiter opposing your Mars amplifies aggression and risk-taking beyond prudent levels. Conflicts can escalate quickly, and bravado may lead to overcommitment. Temper your impulse to charge ahead by consulting trusted advisors before making major moves.',
  },
  'Jupiter-Mars-square': {
    short: 'Frustrated ambition demands an outlet. Direct energy toward constructive goals.',
    long: 'Jupiter squaring your Mars builds internal pressure to act, compete, or conquer. The danger is impatience leading to hasty decisions or conflicts. Physical exercise and well-planned initiatives channel this potent energy productively.',
  },
  'Jupiter-Mars-trine': {
    short: 'Confident action leads to success. Initiative flows effortlessly.',
    long: 'Jupiter trining your Mars grants you natural courage, stamina, and good timing in competitive or physical pursuits. Leadership opportunities arise and your enthusiasm inspires others. This is one of the best transits for launching bold ventures.',
  },

  // Jupiter - Ascendant
  'Jupiter-Ascendant-conjunction': {
    short: 'Your personal magnetism and visibility soar. Others see you as larger than life.',
    long: 'Jupiter conjunct your Ascendant projects confidence, warmth, and charisma. People are drawn to you, and first impressions are unusually favorable. This is an ideal time for public appearances, personal branding, and stepping into a bigger version of yourself.',
  },
  'Jupiter-Ascendant-opposition': {
    short: 'Partnership opportunities expand but demand balance with your independence.',
    long: 'Jupiter opposing your Ascendant highlights growth through relationships. A significant partner, mentor, or collaborator may enter your life. The challenge is to expand through connection without losing your individual identity in the process.',
  },
  'Jupiter-Ascendant-square': {
    short: 'Social overcommitment or excess visibility creates growing pains.',
    long: 'Jupiter squaring your Ascendant may push you into too many social obligations or public roles. While the attention is flattering, your personal needs can get buried. Set boundaries around your time and energy to avoid burnout from overextension.',
  },
  'Jupiter-Ascendant-trine': {
    short: 'Social confidence grows quietly. Opportunities come through personal connections.',
    long: 'Jupiter trining your Ascendant gently boosts your social presence and self-assurance. You attract beneficial people and situations without needing to push. Let your natural warmth shine and doors will open organically.',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SATURN transits
  // ═══════════════════════════════════════════════════════════════════════

  // Saturn - Sun
  'Saturn-Sun-conjunction': {
    short: 'A defining test of maturity and responsibility. Build structures that last.',
    long: 'Saturn conjunct your Sun is one of the most significant maturity transits. Authority figures or circumstances demand that you prove your worth through discipline and perseverance. What you build now, though challenging, forms a foundation that endures for decades.',
  },
  'Saturn-Sun-opposition': {
    short: 'External pressures reveal where your foundations are weak. Strengthen or release.',
    long: 'Saturn opposing your Sun brings confrontations with authority, career demands, or relationship responsibilities. You are asked to demonstrate what you have built over the past 14 years. Where the work was solid, rewards come; where it was not, restructuring is needed.',
  },
  'Saturn-Sun-square': {
    short: 'Frustration and delays test your resolve. Persistence is your greatest ally.',
    long: 'Saturn squaring your Sun creates friction between your ambitions and the realities of time, effort, and limitation. Progress feels slow and obstacles abound, but every challenge overcome now strengthens your character and your long-term position.',
  },
  'Saturn-Sun-trine': {
    short: 'Steady discipline pays off. Hard work produces tangible, lasting results.',
    long: 'Saturn trining your Sun lends structure and stability to your efforts. Goals that require patience and methodical planning are favored. This is an excellent time for professional advancement, building habits, and earning respect through consistent performance.',
  },

  // Saturn - Moon
  'Saturn-Moon-conjunction': {
    short: 'Emotional sobriety deepens. Confront what truly makes you feel secure.',
    long: 'Saturn conjunct your Moon strips away emotional illusions and asks you to face your deepest needs with honesty. You may feel isolated or melancholic, but this period builds profound inner resilience. Relationships that survive this transit are the real ones.',
  },
  'Saturn-Moon-opposition': {
    short: 'Emotional walls between you and others become visible. Address them honestly.',
    long: 'Saturn opposing your Moon highlights tensions between personal needs and external responsibilities. You may feel emotionally unsupported or overburdened. Honest conversations about your limits and needs, while difficult, prevent resentment from building.',
  },
  'Saturn-Moon-square': {
    short: 'Emotional maturity is tested. Old patterns surface for healing.',
    long: 'Saturn squaring your Moon brings up deep-seated emotional patterns, often rooted in childhood or family conditioning. Feelings of inadequacy or loneliness may arise, but facing them squarely leads to genuine emotional growth and stronger boundaries.',
  },
  'Saturn-Moon-trine': {
    short: 'Emotional stability and practical wisdom guide your inner life.',
    long: 'Saturn trining your Moon provides a calm, grounded emotional baseline. You make wise decisions about home, family, and personal needs. This is a time for building domestic stability and nurturing yourself with healthy, sustainable routines.',
  },

  // Saturn - Mercury
  'Saturn-Mercury-conjunction': {
    short: 'Serious thinking replaces casual chatter. Commit ideas to concrete plans.',
    long: 'Saturn conjunct your Mercury sharpens your mental focus and demands precision in communication. Frivolous ideas fall away, leaving only those worth pursuing. This is excellent for writing, studying, or planning anything that requires meticulous attention to detail.',
  },
  'Saturn-Mercury-opposition': {
    short: 'Others challenge your ideas and plans. Refine your message under pressure.',
    long: 'Saturn opposing your Mercury brings critical feedback or communication obstacles from the outside world. Contracts may stall, negotiations toughen, or authorities demand proof. Use the pushback to strengthen your position and sharpen your arguments.',
  },
  'Saturn-Mercury-square': {
    short: 'Mental blocks or communication delays frustrate progress. Patience clarifies thought.',
    long: 'Saturn squaring your Mercury may slow your thinking or create obstacles in negotiations and learning. The lesson is to refine your message, double-check your work, and accept that some ideas need more time to mature before they are ready.',
  },
  'Saturn-Mercury-trine': {
    short: 'Disciplined thinking yields practical results. An ideal time for focused study.',
    long: 'Saturn trining your Mercury creates a productive union of structure and intellect. Complex subjects become easier to grasp, and your communication carries authority. Long-term planning, academic work, and detailed writing projects thrive under this influence.',
  },

  // Saturn - Venus
  'Saturn-Venus-conjunction': {
    short: 'Love and relationships face a reality check. Commitment deepens or weakens.',
    long: 'Saturn conjunct your Venus tests the foundations of your closest relationships and your sense of self-worth. Superficial connections may end while meaningful bonds grow stronger through honest assessment. Financial discipline is also highlighted.',
  },
  'Saturn-Venus-opposition': {
    short: 'Relationship commitments demand renegotiation. Face what is not working.',
    long: 'Saturn opposing your Venus puts partnerships and finances under the spotlight. One-sided dynamics, unmet needs, or outdated values become impossible to ignore. Addressing these honestly, though uncomfortable, clears the way for more authentic bonds.',
  },
  'Saturn-Venus-square': {
    short: 'Relationship tensions or financial restrictions demand attention. Prioritize what truly matters.',
    long: 'Saturn squaring your Venus brings friction in love or money. You may feel unloved, undervalued, or financially squeezed. Rather than reacting from scarcity, use this period to clarify your genuine values and invest only in what is truly worthy of your devotion.',
  },
  'Saturn-Venus-trine': {
    short: 'Loyal, enduring love strengthens. Financial stability grows through discipline.',
    long: 'Saturn trining your Venus rewards commitment and patience in relationships. Existing bonds deepen with trust, and financial planning yields steady gains. Beauty found in simplicity and reliability is more satisfying than fleeting excitement.',
  },

  // Saturn - Mars
  'Saturn-Mars-conjunction': {
    short: 'Controlled, disciplined effort achieves what brute force cannot.',
    long: 'Saturn conjunct your Mars channels your drive into a narrow, powerful focus. Frustrations with pace or authority push you to refine your approach. The energy is best used for endurance tasks, structured physical training, and long-term strategic goals.',
  },
  'Saturn-Mars-opposition': {
    short: 'External obstacles block your drive. Strategic patience outperforms force.',
    long: 'Saturn opposing your Mars pits your will against immovable external forces. Authority figures, regulations, or physical limitations may thwart your plans. The wisdom here is to work within constraints rather than against them, building endurance for the long game.',
  },
  'Saturn-Mars-square': {
    short: 'Blocked energy and frustration build. Find constructive outlets for anger.',
    long: 'Saturn squaring your Mars creates a pressure cooker of thwarted ambition. Direct confrontation with obstacles is rarely effective now. Instead, channel the intensity into disciplined work, physical exercise, and strategic patience.',
  },
  'Saturn-Mars-trine': {
    short: 'Disciplined action and stamina combine for steady achievement.',
    long: 'Saturn trining your Mars gives you controlled power and exceptional endurance. Hard physical or professional work feels manageable and even satisfying. This is the transit of the marathon runner, rewarding those who pace themselves wisely.',
  },

  // Saturn - Ascendant
  'Saturn-Ascendant-conjunction': {
    short: 'A period of serious self-definition. You become more real and more responsible.',
    long: 'Saturn conjunct your Ascendant marks a turning point in how you present yourself to the world. You may take on new responsibilities, appear more mature, or feel the weight of expectations. Authenticity is key: become who you truly are, not who others want you to be.',
  },
  'Saturn-Ascendant-opposition': {
    short: 'Partnerships test your boundaries. Define what you need from others.',
    long: 'Saturn opposing your Ascendant focuses the reality check on close partnerships. Others may place demands on your time and energy, or a key relationship reaches a point where its structure must be redefined. Clarity about mutual expectations is essential.',
  },
  'Saturn-Ascendant-square': {
    short: 'Self-doubt or external criticism challenges your self-image. Rebuild from truth.',
    long: 'Saturn squaring your Ascendant creates tension between how you see yourself and how the world responds. Criticism may sting, but it contains useful data. Use this transit to discard false personas and build a more authentic public presence.',
  },
  'Saturn-Ascendant-trine': {
    short: 'Quiet authority and maturity earn you lasting respect.',
    long: 'Saturn trining your Ascendant lends gravitas and credibility to your public image. Others see you as reliable and competent. This is an ideal time to take on leadership roles, formalize commitments, or earn credentials that reflect your true capabilities.',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // URANUS transits
  // ═══════════════════════════════════════════════════════════════════════

  // Uranus - Sun
  'Uranus-Sun-conjunction': {
    short: 'A radical awakening transforms your sense of self. Expect the unexpected.',
    long: 'Uranus conjunct your Sun shatters stale identities and forces authentic self-expression. Life circumstances may change suddenly, liberating you from old roles. Embrace the disruption as an invitation to become who you were always meant to be.',
  },
  'Uranus-Sun-opposition': {
    short: 'Others trigger sudden changes in your path. Freedom and relationship tension collide.',
    long: 'Uranus opposing your Sun brings external shocks that challenge your life direction. Partnerships or authority figures may act unpredictably, forcing you to assert your individuality. The key is balancing independence with the needs of important relationships.',
  },
  'Uranus-Sun-square': {
    short: 'Inner restlessness demands radical change. Break free mindfully, not impulsively.',
    long: 'Uranus squaring your Sun generates intense pressure to liberate yourself from confining situations. The urge to rebel is powerful but acting rashly can create chaos. Identify what genuinely needs to change and pursue freedom with a plan.',
  },
  'Uranus-Sun-trine': {
    short: 'Exciting breakthroughs arrive without upheaval. Innovation flows naturally.',
    long: 'Uranus trining your Sun introduces welcome change and creative breakthroughs in a harmonious way. You feel more open to experimentation, and unconventional approaches yield positive results. Technology, new friendships, and progressive ideas all thrive.',
  },

  // Uranus - Moon
  'Uranus-Moon-conjunction': {
    short: 'Emotional life is electrified. Old emotional habits shatter to make room for authenticity.',
    long: 'Uranus conjunct your Moon disrupts emotional security in ways that ultimately free you. Living situations, family dynamics, or deep-seated feelings may shift dramatically. The discomfort is temporary; the emotional liberation it brings is permanent.',
  },
  'Uranus-Moon-opposition': {
    short: 'Sudden emotional upheavals from others demand flexibility and inner freedom.',
    long: 'Uranus opposing your Moon brings unexpected changes through family members, partners, or living situations. Your emotional foundations are shaken by forces outside your control. Developing internal stability independent of circumstances is the deeper invitation.',
  },
  'Uranus-Moon-square': {
    short: 'Emotional volatility and sudden domestic changes unsettle your foundations.',
    long: 'Uranus squaring your Moon creates unpredictable mood swings and disruptions in home or family life. Resisting change only increases tension. Accept that your emotional needs are evolving and give yourself permission to outgrow old comfort zones.',
  },
  'Uranus-Moon-trine': {
    short: 'Fresh emotional insights arrive with ease. Intuition sharpens and frees you.',
    long: 'Uranus trining your Moon gently updates your emotional programming. New perspectives on family, home, and inner security emerge naturally. You may be drawn to unconventional living arrangements or find that intuitive flashes guide you to exactly where you need to be.',
  },

  // Uranus - Mercury
  'Uranus-Mercury-conjunction': {
    short: 'Genius-level insights flash through your mind. Revolutionary ideas emerge.',
    long: 'Uranus conjunct your Mercury accelerates your thinking to an extraordinary degree. Breakthroughs in understanding, sudden insights, and unconventional communication styles emerge. This is a prime time for innovation, technology work, and speaking your truth fearlessly.',
  },
  'Uranus-Mercury-opposition': {
    short: 'Others challenge your thinking with radical new perspectives. Stay open but discerning.',
    long: 'Uranus opposing your Mercury brings disruptive new information or communication shocks from the outside world. Your usual mental frameworks may prove inadequate. The gift is a forced expansion of perspective, but discernment prevents you from latching onto every new idea.',
  },
  'Uranus-Mercury-square': {
    short: 'Scattered, electric thinking needs grounding. Brilliant ideas need disciplined follow-through.',
    long: 'Uranus squaring your Mercury overloads your nervous system with mental stimulation. Ideas arrive faster than you can process them, and communication may be erratic. Grounding practices and focused effort help you harness the creative lightning without burning out.',
  },
  'Uranus-Mercury-trine': {
    short: 'Innovative thinking and communication flow with ease. Technology serves you well.',
    long: 'Uranus trining your Mercury opens channels of original thought without the usual disruption. Learning new technologies, exploring unconventional subjects, and making surprising connections between ideas all come naturally. Your communication style refreshes and inspires.',
  },

  // Uranus - Venus
  'Uranus-Venus-conjunction': {
    short: 'Love electrifies. Sudden attractions or relationship upheavals transform your heart.',
    long: 'Uranus conjunct your Venus brings lightning-bolt encounters in love and dramatic shifts in what you value. Existing relationships that lack authenticity may end suddenly, while exciting new connections appear out of nowhere. Financial surprises are also possible.',
  },
  'Uranus-Venus-opposition': {
    short: 'Relationship instability peaks. Others demand freedom or you crave it.',
    long: 'Uranus opposing your Venus tests relationships through unexpected changes initiated by partners or circumstances. The desire for novelty and excitement is strong. Relationships that adapt and grow can survive; those built on routine may not.',
  },
  'Uranus-Venus-square': {
    short: 'Tension between stability and excitement disrupts love and finances.',
    long: 'Uranus squaring your Venus creates restlessness in relationships and financial life. The craving for something new can lead to impulsive romantic or spending decisions. Finding excitement within existing structures, or consciously restructuring them, is the healthier path.',
  },
  'Uranus-Venus-trine': {
    short: 'Exciting new connections and creative inspiration arrive effortlessly.',
    long: 'Uranus trining your Venus brings delightful surprises in love, art, and money without the usual chaos. You may meet fascinating people, discover new aesthetic pleasures, or find unexpected financial opportunities. Openness to the unconventional is rewarded.',
  },

  // Uranus - Mars
  'Uranus-Mars-conjunction': {
    short: 'Explosive energy demands liberation. Act on impulse with awareness.',
    long: 'Uranus conjunct your Mars combines revolutionary drive with raw physical energy. The desire to break free from restrictions is overwhelming. Channel this electric force into bold but strategic action to avoid accidents or reckless confrontations.',
  },
  'Uranus-Mars-opposition': {
    short: 'Others provoke sudden action or conflict. Maintain your center amid disruption.',
    long: 'Uranus opposing your Mars brings unpredictable challenges from other people or external events that demand immediate action. The risk of reactive, impulsive behavior is high. Staying centered while remaining flexible allows you to respond rather than react.',
  },
  'Uranus-Mars-square': {
    short: 'Rebellious energy builds to a breaking point. Direct it before it directs you.',
    long: 'Uranus squaring your Mars creates volatile energy that demands release. The combination of impatience and desire for freedom can lead to reckless action or sudden conflicts. Physical outlets and calculated risk-taking prevent destructive blow-ups.',
  },
  'Uranus-Mars-trine': {
    short: 'Bold innovation and dynamic action combine for exciting breakthroughs.',
    long: 'Uranus trining your Mars channels revolutionary energy into confident, effective action. You can take risks that pay off, try new approaches to old problems, and assert your independence without alienating others. Athletic and entrepreneurial ventures thrive.',
  },

  // Uranus - Ascendant
  'Uranus-Ascendant-conjunction': {
    short: 'Your entire persona undergoes radical reinvention. Others may not recognize you.',
    long: 'Uranus conjunct your Ascendant transforms your outward identity in startling ways. Changes in appearance, lifestyle, or social role are common. You are becoming a freer, more authentic version of yourself, even if the process feels destabilizing.',
  },
  'Uranus-Ascendant-opposition': {
    short: 'Relationships bring unexpected transformation to your self-image.',
    long: 'Uranus opposing your Ascendant channels disruption through partnerships and close relationships. A partner may change dramatically, or you may attract unusual people who alter your self-perception. The growth comes from integrating these new perspectives into your identity.',
  },
  'Uranus-Ascendant-square': {
    short: 'Tension between who you are and who you are becoming creates friction.',
    long: 'Uranus squaring your Ascendant generates internal restlessness about your public identity. You want to break free from how others see you but the path forward is unclear. Experiment with small changes rather than dramatic reinventions.',
  },
  'Uranus-Ascendant-trine': {
    short: 'Your authentic uniqueness shines through naturally, attracting like-minded people.',
    long: 'Uranus trining your Ascendant brings a gentle but unmistakable shift toward greater authenticity. You feel freer to express your individuality, and the right people notice. This is an excellent transit for personal rebranding and embracing what makes you unique.',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // NEPTUNE transits
  // ═══════════════════════════════════════════════════════════════════════

  // Neptune - Sun
  'Neptune-Sun-conjunction': {
    short: 'Ego boundaries dissolve. Spiritual awakening and creative inspiration deepen.',
    long: 'Neptune conjunct your Sun blurs the line between self and the infinite. While creativity and spiritual sensitivity reach extraordinary heights, you may also struggle with confusion about your identity or direction. Stay grounded through daily practices while honoring the mystical call.',
  },
  'Neptune-Sun-opposition': {
    short: 'Idealism meets disillusionment. See people and situations clearly.',
    long: 'Neptune opposing your Sun can bring deception, confusion, or loss of direction through others. Relationships may involve projection or idealization. The remedy is radical honesty with yourself about what is real versus what you wish were true.',
  },
  'Neptune-Sun-square': {
    short: 'Identity confusion and escapist tendencies challenge your sense of purpose.',
    long: 'Neptune squaring your Sun erodes certainty about who you are and what you want. The temptation to escape through fantasy, substances, or avoidance is strong. Creative or spiritual pursuits provide healthy outlets while the fog of this transit gradually lifts.',
  },
  'Neptune-Sun-trine': {
    short: 'Spiritual sensitivity and creative flow enhance your life with grace.',
    long: 'Neptune trining your Sun infuses your identity with compassion, imagination, and spiritual depth. Creative projects feel divinely inspired, and your empathy deepens. This gentle transit invites you to explore meditation, art, or service without the confusion of harder Neptune aspects.',
  },

  // Neptune - Moon
  'Neptune-Moon-conjunction': {
    short: 'Emotional sensitivity and psychic openness reach their peak.',
    long: 'Neptune conjunct your Moon dissolves emotional defenses and heightens empathic sensitivity to an extraordinary degree. You may feel everything around you more deeply. While this opens doors to compassion and creativity, firm boundaries protect you from absorbing the pain of others.',
  },
  'Neptune-Moon-opposition': {
    short: 'Emotional boundaries blur in relationships. Guard against manipulation or self-deception.',
    long: 'Neptune opposing your Moon creates vulnerability to emotional manipulation, codependency, or self-deception in close relationships. Others may not be what they seem, or you may project fantasies onto them. Clarity comes from honest self-reflection and trusted outside perspectives.',
  },
  'Neptune-Moon-square': {
    short: 'Emotional confusion and boundary issues surface. Discern feelings from fantasies.',
    long: 'Neptune squaring your Moon creates a fog around your emotional life. You may feel drained by others, confused about your needs, or prone to nostalgic longing. Strengthening personal boundaries and distinguishing genuine intuition from wishful thinking is essential.',
  },
  'Neptune-Moon-trine': {
    short: 'Emotional intuition deepens. Creative and spiritual feelings flow beautifully.',
    long: 'Neptune trining your Moon opens your heart to deeper compassion and artistic sensitivity without the usual confusion. Dreams may carry meaningful messages, and your capacity to nurture others from a place of genuine empathy expands. Music, art, and meditation bring profound peace.',
  },

  // Neptune - Mercury
  'Neptune-Mercury-conjunction': {
    short: 'Thinking becomes intuitive and imaginative but less precise. Trust hunches, verify facts.',
    long: 'Neptune conjunct your Mercury floods your mind with imagery, symbolism, and creative inspiration. Logical precision suffers while poetic and psychic perception flourishes. Writing, music, and anything involving imagination benefit enormously. Double-check details in practical matters.',
  },
  'Neptune-Mercury-opposition': {
    short: 'Others may deceive or confuse you through words. Verify everything.',
    long: 'Neptune opposing your Mercury increases susceptibility to misinformation, deceptive communication, or confusion from others. Contracts, promises, and instructions should be verified multiple times. The creative flip side is that artistic collaboration can reach inspired heights.',
  },
  'Neptune-Mercury-square': {
    short: 'Mental fog and communication mishaps require extra care with details.',
    long: 'Neptune squaring your Mercury scatters your concentration and makes clear communication difficult. Misunderstandings, lost items, and confused plans are common. Slow down, write things down, and allow extra time for anything requiring precision.',
  },
  'Neptune-Mercury-trine': {
    short: 'Imagination and logic blend harmoniously. Creative writing and inspired thinking thrive.',
    long: 'Neptune trining your Mercury creates a beautiful fusion of intuition and intellect. Poetry, music, storytelling, and visionary thinking all benefit. You can communicate abstract concepts with unusual clarity and may receive flashes of insight that prove remarkably accurate.',
  },

  // Neptune - Venus
  'Neptune-Venus-conjunction': {
    short: 'Romantic idealism peaks. Soul-level love and creative ecstasy are possible.',
    long: 'Neptune conjunct your Venus dissolves boundaries in love, bringing either transcendent connection or painful disillusion. Art and beauty captivate you at a soul level. The challenge is loving what is real rather than a projection. When grounded, this transit births extraordinary creative works.',
  },
  'Neptune-Venus-opposition': {
    short: 'Romantic idealism clashes with reality. Distinguish soul connections from illusions.',
    long: 'Neptune opposing your Venus may bring deeply compelling but potentially deceptive romantic or financial situations. Someone may seem like a soulmate but prove to be a projection. Art and beauty soothe the disappointment while teaching you to love with open eyes.',
  },
  'Neptune-Venus-square': {
    short: 'Romantic confusion or financial deception requires vigilance. Love consciously.',
    long: 'Neptune squaring your Venus creates longing for an ideal love or lifestyle that may not match reality. Financial schemes that seem too good to be true probably are. Channel the longing into creative expression and stay grounded in your actual relationships.',
  },
  'Neptune-Venus-trine': {
    short: 'Divine love and artistic inspiration flow gracefully into your life.',
    long: 'Neptune trining your Venus wraps your heart in a gentle mist of beauty, compassion, and romantic possibility. Art, music, and spiritual connection in relationships deepen without drama. This is one of the most beautiful transits for creative work and unconditional love.',
  },

  // Neptune - Mars
  'Neptune-Mars-conjunction': {
    short: 'Willpower softens. Action becomes inspired but unfocused.',
    long: 'Neptune conjunct your Mars dissolves aggressive drive and replaces it with spiritual motivation. Physical energy may fluctuate mysteriously. The best use of this transit is for artistic creation, healing work, or compassionate service rather than competitive pursuits.',
  },
  'Neptune-Mars-square': {
    short: 'Misdirected energy and confusing motivations. Act from clarity, not impulse.',
    long: 'Neptune squaring your Mars creates confusion about what you want and how to get it. Energy may be wasted on unclear goals or deceptive situations. Before taking action, ensure your motivations are honest and your targets are real.',
  },

  // Neptune - Ascendant
  'Neptune-Ascendant-conjunction': {
    short: 'Your aura becomes ethereal and magnetic. Others project their ideals onto you.',
    long: 'Neptune conjunct your Ascendant makes you appear more mysterious, glamorous, and spiritually attuned. While this magnetic quality attracts many, it can also invite confusion about who you really are. Maintain your identity while enjoying the enchantment.',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // PLUTO transits
  // ═══════════════════════════════════════════════════════════════════════

  // Pluto - Sun
  'Pluto-Sun-conjunction': {
    short: 'Total transformation of identity. You are reborn from the inside out.',
    long: 'Pluto conjunct your Sun is one of the most powerful transits a person can experience. Deep psychological transformation, encounters with power, and the death and rebirth of your identity are all on the table. What emerges from this crucible is your most authentic, empowered self.',
  },
  'Pluto-Sun-opposition': {
    short: 'Power struggles with others force you to claim your deepest strength.',
    long: 'Pluto opposing your Sun brings intense confrontations with controlling people or situations that demand you stand in your power. Manipulation, jealousy, or obsession may surface. The lesson is to transform power dynamics by first transforming yourself.',
  },
  'Pluto-Sun-square': {
    short: 'Intense inner conflict drives profound personal evolution. Surrender control.',
    long: 'Pluto squaring your Sun creates a relentless pressure to evolve. Old power structures in your life crumble, and you are forced to confront shadow material. Resistance amplifies the intensity. Surrender to the process and allow a more powerful version of yourself to emerge.',
  },
  'Pluto-Sun-trine': {
    short: 'Deep personal power flows constructively. Transformation happens gracefully.',
    long: 'Pluto trining your Sun grants access to tremendous reserves of inner power and resilience. You can accomplish feats of transformation with relative ease, whether in your career, personal development, or creative work. Influence and magnetism increase naturally.',
  },

  // Pluto - Moon
  'Pluto-Moon-conjunction': {
    short: 'Emotional depths are plumbed completely. Profound psychological healing begins.',
    long: 'Pluto conjunct your Moon brings your deepest emotional patterns to the surface for transformation. Intense feelings, family secrets, or buried trauma may emerge. While the process can be overwhelming, the healing potential is unmatched. Therapy or deep inner work is highly recommended.',
  },
  'Pluto-Moon-opposition': {
    short: 'Emotional power struggles demand honest confrontation with hidden feelings.',
    long: 'Pluto opposing your Moon intensifies emotional dynamics in close relationships. Manipulation, possessiveness, or control issues surface. The path forward requires radical emotional honesty and willingness to release patterns that no longer serve your growth.',
  },
  'Pluto-Moon-square': {
    short: 'Deep emotional upheaval transforms your inner landscape. Let go of what is dead.',
    long: 'Pluto squaring your Moon forces confrontation with emotional compulsions and attachments. Family dynamics, living situations, or deeply ingrained habits undergo intense pressure to change. The discomfort is a sign that genuine transformation is underway.',
  },
  'Pluto-Moon-trine': {
    short: 'Emotional resilience and psychological insight deepen effortlessly.',
    long: 'Pluto trining your Moon empowers you to process deep emotions with courage and clarity. Therapeutic breakthroughs come easily, and your capacity to support others through their dark nights grows. Intuitive power and emotional authenticity become your greatest strengths.',
  },

  // Pluto - Mercury
  'Pluto-Mercury-conjunction': {
    short: 'Mind penetrates to the core of any subject. Thoughts have transformative power.',
    long: 'Pluto conjunct your Mercury gives you X-ray perception and the ability to see through surface appearances. Research, investigation, psychology, and persuasive communication are supercharged. Your words carry unusual intensity and the power to transform minds.',
  },
  'Pluto-Mercury-opposition': {
    short: 'Others challenge your deepest convictions. Power dynamics infiltrate communication.',
    long: 'Pluto opposing your Mercury brings intense intellectual confrontations and the potential for mind games or manipulation through words. The key is to speak your truth without trying to control what others think, while guarding against those who would manipulate your beliefs.',
  },
  'Pluto-Mercury-square': {
    short: 'Obsessive thinking or communication power struggles demand transformation.',
    long: 'Pluto squaring your Mercury can create mental obsessions, paranoia, or conflicts driven by information and power. The mind becomes a pressure cooker. Channel the intensity into deep research, therapy, or creative writing rather than circular rumination.',
  },
  'Pluto-Mercury-trine': {
    short: 'Penetrating insight and powerful communication drive meaningful change.',
    long: 'Pluto trining your Mercury empowers your words with depth and transformative force. You naturally grasp hidden dynamics, excel at research and investigation, and can persuade others at a profound level. This is an excellent transit for psychology, writing, and strategic thinking.',
  },

  // Pluto - Venus
  'Pluto-Venus-conjunction': {
    short: 'Love becomes obsessive and transformative. Relationships reach ultimate intensity.',
    long: 'Pluto conjunct your Venus transforms your experience of love, beauty, and values at the deepest level. Relationships become all-or-nothing affairs with themes of power, obsession, and rebirth. What you desire and value undergoes a complete metamorphosis.',
  },
  'Pluto-Venus-opposition': {
    short: 'Intense relationship dynamics force transformation of how you give and receive love.',
    long: 'Pluto opposing your Venus brings power struggles, jealousy, or obsession into partnerships. Financial matters may involve hidden agendas. The transformation required is in how you relate to love, money, and personal values at the deepest level.',
  },
  'Pluto-Venus-square': {
    short: 'Jealousy, possessiveness, or financial upheaval demand transformation of values.',
    long: 'Pluto squaring your Venus exposes shadow dynamics in relationships and finances. Themes of control, jealousy, and compulsive desire surface for transformation. The path to freedom lies in releasing attachments to what no longer aligns with your evolving values.',
  },
  'Pluto-Venus-trine': {
    short: 'Deep, transformative love and creative power flow with magnetic intensity.',
    long: 'Pluto trining your Venus grants magnetic charisma and the capacity for profoundly transformative relationships. Art created now carries raw emotional power. Financial strategies driven by deep insight can be remarkably successful. Love that heals rather than destroys is available.',
  },

  // Pluto - Mars
  'Pluto-Mars-conjunction': {
    short: 'Willpower reaches superhuman levels. Channel this force with extreme care.',
    long: 'Pluto conjunct your Mars grants almost unstoppable drive and determination. The desire to dominate or control is immense, and conflicts can become dangerously intense. When channeled constructively, this transit fuels achievements that seemed impossible.',
  },
  'Pluto-Mars-opposition': {
    short: 'Power confrontations test your will. Transform how you assert yourself.',
    long: 'Pluto opposing your Mars brings confrontations with powerful adversaries or situations that demand you fight for what matters. The stakes feel enormous, and the temptation to use force is strong. True victory comes from transforming your relationship with power itself.',
  },
  'Pluto-Mars-square': {
    short: 'Power conflicts intensify. Transform aggression into strategic determination.',
    long: 'Pluto squaring your Mars creates explosive tension between your will and external forces. The temptation to force outcomes is strong but counterproductive. True power comes from strategic patience and the willingness to transform your approach to conflict.',
  },
  'Pluto-Mars-trine': {
    short: 'Extraordinary willpower and strategic drive combine for powerful achievements.',
    long: 'Pluto trining your Mars channels immense transformative energy into effective action. You can pursue goals with relentless focus and overcome obstacles that would stop others. Physical endurance, competitive drive, and strategic brilliance are at their peak.',
  },

  // Pluto - Ascendant
  'Pluto-Ascendant-conjunction': {
    short: 'Complete identity transformation. You emerge as a fundamentally different person.',
    long: 'Pluto conjunct your Ascendant is a once-in-a-lifetime transit that completely overhauls your persona and how you engage with the world. Old identities die and new ones emerge from the ashes. The process can be intense, but the person who emerges is more powerful and authentic than before.',
  },
  'Pluto-Ascendant-opposition': {
    short: 'Partnerships become the vehicle for deep personal transformation.',
    long: 'Pluto opposing your Ascendant channels transformative power through close relationships. A partner may undergo dramatic changes, or power dynamics in partnerships demand total honesty. The transformation ultimately reshapes how you relate to yourself through others.',
  },
  'Pluto-Ascendant-square': {
    short: 'Power struggles with the world force you to reinvent how you show up.',
    long: 'Pluto squaring your Ascendant creates friction between your inner transformation and your public persona. Others may resist the changes you are undergoing, or power dynamics at work and in community challenge you. The only way forward is through authentic self-expression.',
  },
  'Pluto-Ascendant-trine': {
    short: 'Personal magnetism and transformative presence grow naturally.',
    long: 'Pluto trining your Ascendant quietly amplifies your personal power and charisma. You emanate an intensity that others find compelling. Leadership roles, deep therapeutic work, and any activity requiring presence and authority benefit from this potent but harmonious influence.',
  },
};

// ---------------------------------------------------------------------------
// Generic Fallback Copy
// ---------------------------------------------------------------------------

function genericShortBody(event: TransitEvent): string {
  const aspectFlavor: Record<string, string> = {
    conjunction: 'merges its energy with',
    opposition: 'creates tension with',
    square: 'challenges',
    trine: 'harmonizes with',
    sextile: 'offers gentle support to',
  };
  const flavor = aspectFlavor[event.aspect_name] ?? aspectVerb(event.aspect_name).toLowerCase();
  return `${event.transiting_planet} ${flavor} your ${event.natal_planet}. Pay attention to shifts in this area of life.`;
}

function genericLongBody(event: TransitEvent): string {
  const retro = event.is_retrograde
    ? ` Because ${event.transiting_planet} is retrograde, its influence turns inward, revisiting past themes.`
    : '';
  const aspectDesc: Record<string, string> = {
    conjunction: 'amplifies and merges',
    opposition: 'creates a polarizing tension between',
    square: 'introduces friction and growth pressure between',
    trine: 'creates a flowing harmony between',
    sextile: 'opens a doorway of gentle opportunity between',
  };
  const desc = aspectDesc[event.aspect_name] ?? 'connects';
  return (
    `${event.transiting_planet} in ${event.transit_sign} ${desc} its themes and those of your natal ${event.natal_planet} in ${event.natal_sign}. ` +
    `This transit invites you to examine how these planetary energies interact in your life. ` +
    `Be mindful of both the challenges and gifts this aspect brings.${retro}`
  );
}

// ---------------------------------------------------------------------------
// Action Advice by Category
// ---------------------------------------------------------------------------

const ACTION_ADVICE: Record<AlertCategory, string> = {
  love: 'Open your heart to genuine connection. Express your feelings honestly.',
  career: 'Focus on long-term goals. Take strategic action toward your professional vision.',
  money: 'Review your financial plans. Look for growth opportunities while staying grounded.',
  identity: 'Reflect on who you are becoming. Align your actions with your authentic self.',
  healing: 'Give yourself space for emotional processing. Journaling or therapy can help.',
  spiritual: 'Meditate, create, or spend time in nature. Trust the unseen process unfolding.',
  communication: 'Choose your words carefully. Listen as much as you speak.',
  general: 'Stay present and aware. This transit invites conscious engagement with life.',
};

// ---------------------------------------------------------------------------
// Copy Generation
// ---------------------------------------------------------------------------

function getInterpretation(event: TransitEvent): {
  short_body: string;
  long_body: string;
  action_advice: string;
} {
  const key = `${event.transiting_planet}-${event.natal_planet}-${event.aspect_name}`;
  const entry = INTERP_TABLE[key];

  let short_body: string;
  let long_body: string;

  if (entry) {
    short_body = entry.short;
    long_body = entry.long;
    if (event.is_retrograde) {
      long_body += ` With ${event.transiting_planet} retrograde in ${event.transit_sign}, these themes revisit past lessons for deeper integration.`;
    }
  } else {
    short_body = genericShortBody(event);
    long_body = genericLongBody(event);
  }

  const category = assignCategory(event);
  const action_advice = ACTION_ADVICE[category];

  return { short_body, long_body, action_advice };
}

// ---------------------------------------------------------------------------
// Main Enrichment Function
// ---------------------------------------------------------------------------

export function enrichTransitEvents(events: TransitEvent[]): CosmicAlert[] {
  const alerts: CosmicAlert[] = events.map((event) => {
    const id = `${event.transiting_planet}-${event.natal_planet}-${event.aspect_name}-${event.date}`;
    const category = assignCategory(event);
    const importance_score = computeImportance(event);
    const timing = computeTimingWindow(event);
    const status = computeStatus(timing.start_time, timing.end_time);
    const title = generateTitle(event);
    const { short_body, long_body, action_advice } = getInterpretation(event);

    return {
      id,
      event_type: 'transit_aspect',
      category,
      importance_score,
      status,
      start_time: timing.start_time,
      peak_time: timing.peak_time,
      end_time: timing.end_time,
      title,
      short_body,
      long_body,
      action_advice,
      transiting_planet: event.transiting_planet,
      natal_planet: event.natal_planet,
      aspect_name: event.aspect_name,
      transit_sign: event.transit_sign,
      natal_sign: event.natal_sign,
      orb: event.orb,
      is_retrograde: event.is_retrograde,
      is_read: false,
    };
  });

  // Sort: active first, then upcoming, then past; within each group by importance descending
  const statusOrder: Record<AlertStatus, number> = {
    active: 0,
    upcoming: 1,
    past: 2,
  };

  alerts.sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    return b.importance_score - a.importance_score;
  });

  return alerts;
}
