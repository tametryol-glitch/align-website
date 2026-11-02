// ── Galactic Clock Constants ──
// Custom 12-ruler planetary time system

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
// Configurable — change this to align the cycle to any real calendar date
// March 20, 2026 = Spring Equinox = Marsday (day 0)
// This makes March 23, 2026 = Moonday (day 3)
export const CUSTOM_CYCLE_EPOCH = new Date(2026, 2, 20); // Mar 20, 2026 = Marsday

// Ruler meanings for interpretation
export const RULER_MEANINGS: Record<RulerName, { keywords: string; essence: string; color: string; glyph: string }> = {
  Mars:    { keywords: 'starting things, fights, training, nerve', essence: 'the push to start things and the temper that comes with it', color: '#EF4444', glyph: '♂' },
  Venus:   { keywords: 'dates, art, spending, making up', essence: 'the pull toward people, pleasure and money', color: '#F472B6', glyph: '♀' },
  Mercury: { keywords: 'emails, calls, deals, studying', essence: 'talking, writing and deciding fast', color: '#6EE7B7', glyph: '☿' },
  Moon:    { keywords: 'moods, home, family, gut reads', essence: 'mood, memory and who you need close', color: '#C4B5FD', glyph: '☽' },
  Sun:     { keywords: 'being seen, leading, pitching, creating', essence: 'being seen and taking the lead', color: '#F59E0B', glyph: '☉' },
  Vesta:   { keywords: 'focus, ritual, tidying up, craft', essence: 'one task done fully, with no distractions', color: '#FB923C', glyph: '\u26B6' },
  Juno:    { keywords: 'commitments, contracts, partners, fairness', essence: 'what you owe each other and what you agreed to', color: '#A78BFA', glyph: '⚵' },
  Pluto:   { keywords: 'hard truths, endings, power, research', essence: 'what you avoid looking at and what has to end', color: '#991B1B', glyph: '♇' },
  Jupiter: { keywords: 'asking, teaching, travel, generosity', essence: 'saying yes to more, for better and worse', color: '#818CF8', glyph: '♃' },
  Saturn:  { keywords: 'deadlines, boundaries, planning, duty', essence: 'the slow work and the limits you set', color: '#9CA3AF', glyph: '♄' },
  Uranus:  { keywords: 'new ideas, tech, breaking routine, surprises', essence: 'the urge to break the routine', color: '#38BDF8', glyph: '♅' },
  Neptune: { keywords: 'rest, music, prayer, dreams', essence: 'fog, imagination and the wish to escape', color: '#2DD4BF', glyph: '♆' },
};

// Segment angle: 360° / 12 = 30° per segment
export const SEGMENT_ANGLE = 30;
export const TOTAL_RULERS = 12;

// Timing constants
export const MINUTES_PER_MINUTE_LORD = 5;     // 60 min / 12 = 5 min each
export const SECONDS_PER_PULSE_LORD = 25;      // 300 sec / 12 = 25 sec each
export const HOURS_PER_CYCLE = 24;
export const HOUR_LORD_REPEATS = 2;            // 12 rulers repeat twice in 24 hours
