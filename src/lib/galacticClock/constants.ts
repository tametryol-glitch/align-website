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
  Mars:    { keywords: 'action, force, courage, initiation', essence: 'raw initiating power', color: '#EF4444', glyph: '♂' },
  Venus:   { keywords: 'attraction, beauty, love, harmony, value', essence: 'magnetic creative grace', color: '#F472B6', glyph: '♀' },
  Mercury: { keywords: 'thought, language, trade, analysis, communication', essence: 'swift mental precision', color: '#6EE7B7', glyph: '☿' },
  Moon:    { keywords: 'emotion, instinct, memory, receptivity, care', essence: 'deep feeling intelligence', color: '#C4B5FD', glyph: '☽' },
  Sun:     { keywords: 'vitality, identity, visibility, leadership, creative force', essence: 'radiant sovereign presence', color: '#F59E0B', glyph: '☉' },
  Vesta:   { keywords: 'devotion, focus, purification, sacred work, discipline', essence: 'sacred concentrated flame', color: '#FB923C', glyph: '\u26B6' },
  Juno:    { keywords: 'union, commitment, partnership, balance, contracts', essence: 'bonded relational power', color: '#A78BFA', glyph: '⚵' },
  Pluto:   { keywords: 'power, death-rebirth, depth, transformation, hidden force', essence: 'absolute transformative depth', color: '#991B1B', glyph: '♇' },
  Jupiter: { keywords: 'growth, wisdom, expansion, opportunity, blessing', essence: 'expansive abundant wisdom', color: '#818CF8', glyph: '♃' },
  Saturn:  { keywords: 'structure, maturity, discipline, responsibility, time', essence: 'enduring masterful structure', color: '#9CA3AF', glyph: '♄' },
  Uranus:  { keywords: 'innovation, awakening, disruption, freedom, rebellion', essence: 'electric liberating vision', color: '#38BDF8', glyph: '♅' },
  Neptune: { keywords: 'spirit, dreams, transcendence, intuition, dissolution', essence: 'transcendent mystical flow', color: '#2DD4BF', glyph: '♆' },
};

// Segment angle: 360° / 12 = 30° per segment
export const SEGMENT_ANGLE = 30;
export const TOTAL_RULERS = 12;

// Timing constants
export const MINUTES_PER_MINUTE_LORD = 5;     // 60 min / 12 = 5 min each
export const SECONDS_PER_PULSE_LORD = 25;      // 300 sec / 12 = 25 sec each
export const HOURS_PER_CYCLE = 24;
export const HOUR_LORD_REPEATS = 2;            // 12 rulers repeat twice in 24 hours
