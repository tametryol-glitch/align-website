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
    quality: 'You get seen, for good and for ill',
    bestFor: ['Leadership decisions', 'Public appearances', 'Starting important projects', 'Asking for recognition or promotion', 'Creative self-expression', 'Signing contracts that showcase your authority'],
    avoid: ['Being passive or invisible', 'Hiding from responsibility', 'Ego-driven arguments'],
    energy: 'Yang: you act and people watch',
    guidance: 'Do the thing people will see: pitch it, present it, ask for the raise, post it. What you start now carries your name, so skip anything you would rather hide, and do not turn the meeting into a contest over who is right.',
    color: '#F59E0B',
    dayType: 'Action',
  },
  Moon: {
    ruler: 'Moon',
    sign: 'Cancer',
    quality: 'You feel everything and you remember it',
    bestFor: ['Family conversations', 'Home-related decisions', 'Cooking and nourishing', 'Journaling and reflection', 'Connecting with women', 'Real estate matters', 'Emotional healing'],
    avoid: ['Making permanent decisions from emotion', 'Confrontation', 'Signing binding contracts'],
    energy: 'Yin: you take things in',
    guidance: 'Check how you actually feel before you decide anything. Call someone at home, cook, journal, deal with the family thing. Hold off on signing or sending anything final, because tonight\'s mood will not be Thursday\'s.',
    color: '#C4B5FD',
    dayType: 'Reflection',
  },
  Mars: {
    ruler: 'Mars',
    sign: 'Aries',
    quality: 'You have nerve and a short fuse',
    bestFor: ['Physical exercise', 'Starting battles you intend to win', 'Surgery', 'Mechanical work', 'Competitive activities', 'Cutting ties', 'Confronting problems head-on'],
    avoid: ['Passive activities', 'Negotiations requiring diplomacy', 'Starting relationships', 'Signing peace agreements'],
    energy: 'Yang: you push, fast and hot',
    guidance: 'Do the thing you keep putting off that takes nerve: the hard workout, the confrontation, the cut. Say it once and plainly. The cost is the sharp reply you will wish you had held back, so do not start a fight you would not finish tomorrow.',
    color: '#EF4444',
    dayType: 'Action',
  },
  Mercury: {
    ruler: 'Mercury',
    sign: 'Gemini',
    quality: 'You think fast and talk faster',
    bestFor: ['Writing and editing', 'Sending important emails', 'Studying and learning', 'Business negotiations', 'Short trips', 'Signing documents', 'Making phone calls', 'Trading and commerce'],
    avoid: ['Physical labor without thinking', 'Emotional confrontation', 'Mindless activities'],
    energy: 'Neutral: you switch from one thing to the next',
    guidance: 'Write the message, make the call, send the proposal, read the contract line by line. Words stick right now. The cost is scatter: pick one thread, because five open tabs means nothing gets finished.',
    color: '#6EE7B7',
    dayType: 'Communication',
  },
  Jupiter: {
    ruler: 'Jupiter',
    sign: 'Sagittarius',
    quality: 'You say yes to more and you feel lucky',
    bestFor: ['Asking for favors or funding', 'Legal matters', 'Publishing', 'Teaching', 'Long-distance travel planning', 'Spiritual study', 'Starting a business', 'Applying for opportunities'],
    avoid: ['Being stingy or small-minded', 'Over-promising', 'Excess and overindulgence'],
    energy: 'Yang: you reach out and give',
    guidance: 'Ask for the thing: the funding, the favor, the intro, the yes. Apply, publish, book the trip. The cost is that everything looks doable, so promise only what you could still deliver on a bad day.',
    color: '#818CF8',
    dayType: 'Opportunity',
  },
  Venus: {
    ruler: 'Venus',
    sign: 'Taurus',
    quality: 'You want company, comfort and nice things',
    bestFor: ['Date nights and romance', 'Beauty treatments', 'Art and music', 'Shopping for luxury', 'Reconciliation', 'Decorating', 'Financial negotiations', 'Social gatherings'],
    avoid: ['Aggressive confrontation', 'Harsh criticism', 'Demanding or forceful behavior'],
    energy: 'Yin: you draw people in rather than chase',
    guidance: 'Make the date, patch up the quarrel, fix up your space, settle a price on friendly terms. Let people come to you. The cost is that you will agree just to keep the mood nice, so do not spend money or promise anything to avoid friction.',
    color: '#F472B6',
    dayType: 'Attraction',
  },
  Saturn: {
    ruler: 'Saturn',
    sign: 'Capricorn',
    quality: 'You are serious and slow, and you can feel it',
    bestFor: ['Long-term planning', 'Boundary setting', 'Organizational work', 'Dealing with authorities', 'Real estate closings', 'Ending bad habits', 'Serious conversations', 'Retirement planning'],
    avoid: ['Starting new creative projects', 'Asking for favors', 'Expecting quick results', 'Being impatient'],
    energy: 'Yin: you tighten up and hold',
    guidance: 'Do the dull job that holds everything else up: the budget, the boundary talk, the filing, the plan for next year. Nothing is quick and it feels heavy. Do not ask anyone for a favor or start anything playful now.',
    color: '#9CA3AF',
    dayType: 'Structure',
  },
  Vesta: {
    ruler: 'Vesta',
    sign: 'Virgo',
    quality: 'You can only do one thing, and you do it well',
    bestFor: ['Ritual work and devotion', 'Deep focused study', 'Purification and cleansing', 'Concentrated creative effort', 'Setting sacred intentions', 'Organizing sacred spaces', 'Precise craft work', 'Healing ceremonies'],
    avoid: ['Scattered multitasking', 'Social distractions', 'Superficial activities'],
    energy: 'Yin: you pull in and narrow down',
    guidance: 'Pick one task and give it the whole hour. Phone away, door shut, no meetings. Clean the desk, study the hard chapter, do the ritual. Anyone who interrupts gets a short answer, and the rest of your list waits.',
    color: '#FB923C',
    dayType: 'Devotion',
  },
  Juno: {
    ruler: 'Juno',
    sign: 'Libra',
    quality: 'You keep track of what you owe and are owed',
    bestFor: ['Partnership agreements', 'Contract signing', 'Fairness discussions', 'Commitment conversations', 'Marriage planning', 'Mediating disputes', 'Legal negotiations', 'Diplomatic meetings'],
    avoid: ['Going it alone', 'Ignoring partner needs', 'One-sided decisions'],
    energy: 'Neutral: you weigh both sides',
    guidance: 'Have the talk about what you each expect: the contract, the split, the plan to move in together. Get it in writing. The cost is scorekeeping, so if you catch yourself counting who did more, say it out loud instead of sulking.',
    color: '#E879F9',
    dayType: 'Partnership',
  },
  Pluto: {
    ruler: 'Pluto',
    sign: 'Scorpio',
    quality: 'You see what everyone else avoids',
    bestFor: ['Transformation work', 'Deep research', 'Power moves', 'Shadow work', 'Releasing what no longer serves', 'Investigating hidden truths', 'Intimate conversations', 'Inheritance matters'],
    avoid: ['Surface-level interactions', 'Avoiding difficult truths', 'Manipulation for selfish gain'],
    energy: 'Yang: you dig and do not let go',
    guidance: 'Look at what you have been avoiding: the debt, the message you will not answer, the habit you keep excusing. Research it, end it, or say what nobody else will say. Do not use what you find to control someone.',
    color: '#991B1B',
    dayType: 'Transformation',
  },
  Uranus: {
    ruler: 'Uranus',
    sign: 'Aquarius',
    quality: 'You are restless and want out of the routine',
    bestFor: ['Innovation and invention', 'Technology projects', 'Breaking old patterns', 'Sudden insights', 'Embracing change', 'Unconventional solutions', 'Networking with visionaries', 'Launching new ideas'],
    avoid: ['Rigid thinking', 'Following the crowd', 'Resisting necessary change'],
    energy: 'Yang: you jolt things loose',
    guidance: 'Break one routine on purpose: take the odd route, try the tool you keep ignoring, say yes to the strange invitation. Write down any sudden idea before it leaves. Plans get dropped this way, so do not quit something just because it bores you.',
    color: '#22D3EE',
    dayType: 'Innovation',
  },
  Neptune: {
    ruler: 'Neptune',
    sign: 'Pisces',
    quality: 'You are dreamy and you drift',
    bestFor: ['Meditation and prayer', 'Artistic creation', 'Spiritual work', 'Music and poetry', 'Healing practices', 'Visualization and manifesting', 'Dream work', 'Connecting with the divine'],
    avoid: ['Precise logical tasks', 'Signing legal documents', 'Making binding commitments', 'Financial decisions'],
    energy: 'Yin: you soften and blur',
    guidance: 'Meditate, pray, make music, walk without your phone, sleep on the question. Do not sign, pay or promise anything this hour, because the details look softer than they are. You will lose time, so set a timer before you drift.',
    color: '#7DD3FC',
    dayType: 'Spiritual',
  },
};

// ── Ruler Meanings (from galacticClockConstants.ts - used for clock interpretation) ──
export const RULER_MEANINGS: Record<RulerName, { keywords: string; essence: string; color: string; glyph: string }> = {
  Mars:    { keywords: 'starting things, fights, training, nerve', essence: 'the push to start things, and the temper that comes with it', color: '#EF4444', glyph: '♂' },
  Venus:   { keywords: 'dates, art, spending, making up', essence: 'the pull toward people, pleasure and money', color: '#F472B6', glyph: '♀' },
  Mercury: { keywords: 'emails, calls, deals, studying', essence: 'talking, writing and deciding fast', color: '#6EE7B7', glyph: '☿' },
  Moon:    { keywords: 'moods, home, family, gut reads', essence: 'mood, memory and who you need close', color: '#C4B5FD', glyph: '☽' },
  Sun:     { keywords: 'being seen, leading, pitching, creating', essence: 'being seen and taking the lead', color: '#F59E0B', glyph: '☉' },
  Vesta:   { keywords: 'focus, ritual, tidying up, craft', essence: 'one task done fully, with no distractions', color: '#FB923C', glyph: '⚶' },
  Juno:    { keywords: 'commitments, contracts, partners, fairness', essence: 'what you owe each other and what you agreed to', color: '#A78BFA', glyph: '⚵' },
  Pluto:   { keywords: 'hard truths, endings, power, research', essence: 'what you avoid looking at and what has to end', color: '#991B1B', glyph: '♇' },
  Jupiter: { keywords: 'asking, teaching, travel, generosity', essence: 'saying yes to more, for better and worse', color: '#818CF8', glyph: '♃' },
  Saturn:  { keywords: 'deadlines, boundaries, planning, duty', essence: 'the slow work and the limits you set', color: '#9CA3AF', glyph: '♄' },
  Uranus:  { keywords: 'new ideas, tech, breaking routine, surprises', essence: 'the urge to break the routine', color: '#38BDF8', glyph: '♅' },
  Neptune: { keywords: 'rest, music, prayer, dreams', essence: 'fog, imagination and the wish to escape', color: '#2DD4BF', glyph: '♆' },
};
