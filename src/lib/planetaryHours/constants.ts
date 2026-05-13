// ── Planetary Hours Constants ──
// Custom 12-ruler planetary time system (ported from mobile galacticClockConstants.ts + screen data)

// The master sequence of 12 planetary rulers (NEVER change order)
export const RULERS = [
  'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Vesta',
  'Juno', 'Pluto', 'Jupiter', 'Saturn', 'Uranus', 'Neptune',
] as const;

export type RulerName = typeof RULERS[number];

// Custom 12-day cycle names
export const CYCLE_DAYS = [
  'Marsday', 'Venusday', 'Mercuryday', 'Moonday', 'Sunday', 'Vestaday',
  'Junoday', 'Plutoday', 'Jupiterday', 'Saturnday', 'Uraniday', 'Neptiday',
] as const;

export type CycleDayName = typeof CYCLE_DAYS[number];

// Epoch: the date when the cycle starts at Marsday (day index 0)
// March 20, 2026 = Spring Equinox = Marsday (day 0)
export const CUSTOM_CYCLE_EPOCH = new Date(2026, 2, 20); // Mar 20, 2026

export const TOTAL_RULERS = 12;

// ── Planet Colors (from Planetary Hours screen) ──
export const PLANET_COLORS: Record<RulerName, string> = {
  Sun: '#F59E0B',
  Moon: '#C4B5FD',
  Mars: '#EF4444',
  Mercury: '#6EE7B7',
  Jupiter: '#818CF8',
  Venus: '#F472B6',
  Saturn: '#9CA3AF',
  Vesta: '#FB923C',
  Juno: '#E879F9',
  Pluto: '#991B1B',
  Uranus: '#22D3EE',
  Neptune: '#7DD3FC',
};

// ── Planet Signs ──
export const PLANET_SIGNS: Record<RulerName, string> = {
  Sun: 'Leo',
  Moon: 'Cancer',
  Mars: 'Aries',
  Mercury: 'Gemini',
  Jupiter: 'Sagittarius',
  Venus: 'Taurus',
  Saturn: 'Capricorn',
  Vesta: 'Virgo',
  Juno: 'Libra',
  Pluto: 'Scorpio',
  Uranus: 'Aquarius',
  Neptune: 'Pisces',
};

// ── Planet Glyphs (Unicode astronomical symbols) ──
export const PLANET_GLYPHS: Record<RulerName, string> = {
  Sun: '☉',     // ☉
  Moon: '☽',    // ☽
  Mars: '♂',    // ♂
  Mercury: '☿', // ☿
  Jupiter: '♃', // ♃
  Venus: '♀',   // ♀
  Saturn: '♄',  // ♄
  Vesta: '⚶',   // ⚶
  Juno: '⚵',    // ⚵
  Pluto: '♇',   // ♇
  Uranus: '♅',  // ♅
  Neptune: '♆', // ♆
};

// ── Planet Meanings / Qualities ──
export interface PlanetMeaning {
  ruler: RulerName;
  sign: string;
  quality: string;
  bestFor: string[];
  avoid: string[];
  energy: string;
  guidance: string;
  color: string;
  dayType: string;
}

export const PLANET_MEANINGS: Record<RulerName, PlanetMeaning> = {
  Sun: {
    ruler: 'Sun',
    sign: 'Leo',
    quality: 'Radiant, confident, authoritative',
    bestFor: ['Leadership decisions', 'Public appearances', 'Starting important projects', 'Asking for recognition or promotion', 'Creative self-expression', 'Signing contracts that showcase your authority'],
    avoid: ['Being passive or invisible', 'Hiding from responsibility', 'Ego-driven arguments'],
    energy: 'Yang — active, outward, visible',
    guidance: 'Step into the spotlight. This hour favors bold, visible action. What you begin now carries the energy of authority and purpose.',
    color: '#F59E0B',
    dayType: 'Action',
  },
  Moon: {
    ruler: 'Moon',
    sign: 'Cancer',
    quality: 'Emotional, intuitive, nurturing',
    bestFor: ['Family conversations', 'Home-related decisions', 'Cooking and nourishing', 'Journaling and reflection', 'Connecting with women', 'Real estate matters', 'Emotional healing'],
    avoid: ['Making permanent decisions from emotion', 'Confrontation', 'Signing binding contracts'],
    energy: 'Yin — receptive, inward, feeling',
    guidance: 'Trust your gut. This hour is for listening, feeling, and nurturing. What needs care in your life? Attend to it now.',
    color: '#C4B5FD',
    dayType: 'Reflection',
  },
  Mars: {
    ruler: 'Mars',
    sign: 'Aries',
    quality: 'Assertive, competitive, courageous',
    bestFor: ['Physical exercise', 'Starting battles you intend to win', 'Surgery', 'Mechanical work', 'Competitive activities', 'Cutting ties', 'Confronting problems head-on'],
    avoid: ['Passive activities', 'Negotiations requiring diplomacy', 'Starting relationships', 'Signing peace agreements'],
    energy: 'Yang — forceful, direct, explosive',
    guidance: 'Act decisively. This hour rewards courage and initiative. If something needs to be confronted, do it now — but control the fire.',
    color: '#EF4444',
    dayType: 'Action',
  },
  Mercury: {
    ruler: 'Mercury',
    sign: 'Gemini',
    quality: 'Mental, communicative, quick-witted',
    bestFor: ['Writing and editing', 'Sending important emails', 'Studying and learning', 'Business negotiations', 'Short trips', 'Signing documents', 'Making phone calls', 'Trading and commerce'],
    avoid: ['Physical labor without thinking', 'Emotional confrontation', 'Mindless activities'],
    energy: 'Neutral — adaptable, quick, versatile',
    guidance: 'Use your mind. This hour is for words, ideas, and connections. Write the message, make the call, send the proposal.',
    color: '#6EE7B7',
    dayType: 'Communication',
  },
  Jupiter: {
    ruler: 'Jupiter',
    sign: 'Sagittarius',
    quality: 'Expansive, generous, fortunate',
    bestFor: ['Asking for favors or funding', 'Legal matters', 'Publishing', 'Teaching', 'Long-distance travel planning', 'Spiritual study', 'Starting a business', 'Applying for opportunities'],
    avoid: ['Being stingy or small-minded', 'Over-promising', 'Excess and overindulgence'],
    energy: 'Yang — expansive, optimistic, generous',
    guidance: 'Think big. This is the most fortunate hour of the day. Whatever you ask for, apply to, or begin now has Jupiter\'s blessing behind it.',
    color: '#818CF8',
    dayType: 'Opportunity',
  },
  Venus: {
    ruler: 'Venus',
    sign: 'Taurus',
    quality: 'Harmonious, sensual, magnetic',
    bestFor: ['Date nights and romance', 'Beauty treatments', 'Art and music', 'Shopping for luxury', 'Reconciliation', 'Decorating', 'Financial negotiations', 'Social gatherings'],
    avoid: ['Aggressive confrontation', 'Harsh criticism', 'Demanding or forceful behavior'],
    energy: 'Yin — attractive, soft, pleasurable',
    guidance: 'Attract, don\'t chase. This hour favors beauty, pleasure, and connection. If you want something to come to you, make yourself magnetic.',
    color: '#F472B6',
    dayType: 'Attraction',
  },
  Saturn: {
    ruler: 'Saturn',
    sign: 'Capricorn',
    quality: 'Disciplined, serious, structured',
    bestFor: ['Long-term planning', 'Boundary setting', 'Organizational work', 'Dealing with authorities', 'Real estate closings', 'Ending bad habits', 'Serious conversations', 'Retirement planning'],
    avoid: ['Starting new creative projects', 'Asking for favors', 'Expecting quick results', 'Being impatient'],
    energy: 'Yin — contractive, heavy, enduring',
    guidance: 'Build something that lasts. This hour is serious but powerful for anything requiring discipline, structure, or long-term commitment.',
    color: '#9CA3AF',
    dayType: 'Structure',
  },
  Vesta: {
    ruler: 'Vesta',
    sign: 'Virgo',
    quality: 'Sacred, focused, purifying',
    bestFor: ['Ritual work and devotion', 'Deep focused study', 'Purification and cleansing', 'Concentrated creative effort', 'Setting sacred intentions', 'Organizing sacred spaces', 'Precise craft work', 'Healing ceremonies'],
    avoid: ['Scattered multitasking', 'Social distractions', 'Superficial activities'],
    energy: 'Yin — inward, concentrated, devotional',
    guidance: 'Light your inner flame. This hour calls for sacred focus and undivided attention. Dedicate yourself fully to one meaningful task.',
    color: '#FB923C',
    dayType: 'Devotion',
  },
  Juno: {
    ruler: 'Juno',
    sign: 'Libra',
    quality: 'Committed, fair, partnership-oriented',
    bestFor: ['Partnership agreements', 'Contract signing', 'Fairness discussions', 'Commitment conversations', 'Marriage planning', 'Mediating disputes', 'Legal negotiations', 'Diplomatic meetings'],
    avoid: ['Going it alone', 'Ignoring partner needs', 'One-sided decisions'],
    energy: 'Neutral — balanced, reciprocal, binding',
    guidance: 'Honor your partnerships. This hour is ideal for any matter involving mutual commitment, fairness, and the sacred bond between equals.',
    color: '#E879F9',
    dayType: 'Partnership',
  },
  Pluto: {
    ruler: 'Pluto',
    sign: 'Scorpio',
    quality: 'Transformative, intense, powerful',
    bestFor: ['Transformation work', 'Deep research', 'Power moves', 'Shadow work', 'Releasing what no longer serves', 'Investigating hidden truths', 'Intimate conversations', 'Inheritance matters'],
    avoid: ['Surface-level interactions', 'Avoiding difficult truths', 'Manipulation for selfish gain'],
    energy: 'Yang — penetrating, regenerative, volcanic',
    guidance: 'Go deep. This hour holds immense power for transformation. Face what you have been avoiding — on the other side is rebirth.',
    color: '#991B1B',
    dayType: 'Transformation',
  },
  Uranus: {
    ruler: 'Uranus',
    sign: 'Aquarius',
    quality: 'Innovative, electric, revolutionary',
    bestFor: ['Innovation and invention', 'Technology projects', 'Breaking old patterns', 'Sudden insights', 'Embracing change', 'Unconventional solutions', 'Networking with visionaries', 'Launching new ideas'],
    avoid: ['Rigid thinking', 'Following the crowd', 'Resisting necessary change'],
    energy: 'Yang — electric, sudden, liberating',
    guidance: 'Expect the unexpected. This hour crackles with innovation and breakthroughs. Be open to radical new ideas and sudden flashes of genius.',
    color: '#22D3EE',
    dayType: 'Innovation',
  },
  Neptune: {
    ruler: 'Neptune',
    sign: 'Pisces',
    quality: 'Mystical, dreamy, transcendent',
    bestFor: ['Meditation and prayer', 'Artistic creation', 'Spiritual work', 'Music and poetry', 'Healing practices', 'Visualization and manifesting', 'Dream work', 'Connecting with the divine'],
    avoid: ['Precise logical tasks', 'Signing legal documents', 'Making binding commitments', 'Financial decisions'],
    energy: 'Yin — dissolving, ethereal, transcendent',
    guidance: 'Dissolve boundaries. This hour is pure spirit. Meditate, create art, pray, or simply let your imagination wander into the divine.',
    color: '#7DD3FC',
    dayType: 'Spiritual',
  },
};

// ── Ruler Meanings (from galacticClockConstants.ts - used for clock interpretation) ──
export const RULER_MEANINGS: Record<RulerName, { keywords: string; essence: string; color: string; glyph: string }> = {
  Mars:    { keywords: 'action, force, courage, initiation', essence: 'raw initiating power', color: '#EF4444', glyph: '♂' },
  Venus:   { keywords: 'attraction, beauty, love, harmony, value', essence: 'magnetic creative grace', color: '#F472B6', glyph: '♀' },
  Mercury: { keywords: 'thought, language, trade, analysis, communication', essence: 'swift mental precision', color: '#6EE7B7', glyph: '☿' },
  Moon:    { keywords: 'emotion, instinct, memory, receptivity, care', essence: 'deep feeling intelligence', color: '#C4B5FD', glyph: '☽' },
  Sun:     { keywords: 'vitality, identity, visibility, leadership, creative force', essence: 'radiant sovereign presence', color: '#F59E0B', glyph: '☉' },
  Vesta:   { keywords: 'devotion, focus, purification, sacred work, discipline', essence: 'sacred concentrated flame', color: '#FB923C', glyph: '⚶' },
  Juno:    { keywords: 'union, commitment, partnership, balance, contracts', essence: 'bonded relational power', color: '#A78BFA', glyph: '⚵' },
  Pluto:   { keywords: 'power, death-rebirth, depth, transformation, hidden force', essence: 'absolute transformative depth', color: '#991B1B', glyph: '♇' },
  Jupiter: { keywords: 'growth, wisdom, expansion, opportunity, blessing', essence: 'expansive abundant wisdom', color: '#818CF8', glyph: '♃' },
  Saturn:  { keywords: 'structure, maturity, discipline, responsibility, time', essence: 'enduring masterful structure', color: '#9CA3AF', glyph: '♄' },
  Uranus:  { keywords: 'innovation, awakening, disruption, freedom, rebellion', essence: 'electric liberating vision', color: '#38BDF8', glyph: '♅' },
  Neptune: { keywords: 'spirit, dreams, transcendence, intuition, dissolution', essence: 'transcendent mystical flow', color: '#2DD4BF', glyph: '♆' },
};
