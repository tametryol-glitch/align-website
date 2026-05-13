// ── Planetary Hours Types ──
// TypeScript types and interfaces for the planetary hours system

export type RulerName =
  | 'Mars' | 'Venus' | 'Mercury' | 'Moon' | 'Sun' | 'Vesta'
  | 'Juno' | 'Pluto' | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune';

export type GalacticDayName =
  | 'Marsday' | 'Venusday' | 'Mercuryday' | 'Moonday' | 'Sunday' | 'Vestaday'
  | 'Junoday' | 'Plutoday' | 'Jupiterday' | 'Saturnday' | 'Uraniday' | 'Neptiday';

// ── Ruler interface ──
export interface Ruler {
  name: RulerName;
  sign: string;
  glyph: string;
  color: string;
  index: number;
}

// ── Hour segment (single planetary hour) ──
export interface HourSegment {
  hourNumber: number;       // 1-12 within day or night
  ruler: RulerName;
  start: Date;
  end: Date;
  isCurrent: boolean;
  durationMinutes: number;
  period: 'day' | 'night';
}

// ── Sun times ──
export interface SunTimes {
  sunrise: Date;
  sunset: Date;
  nextSunrise: Date;
}

// ── Full planetary hours result ──
export interface PlanetaryHoursResult {
  date: Date;
  dayLord: RulerName;
  galacticDayName: GalacticDayName;
  galacticDayIndex: number;
  sunrise: Date;
  sunset: Date;
  nextSunrise: Date;
  dayHours: HourSegment[];
  nightHours: HourSegment[];
  currentHour: HourSegment | null;
}

// ── Planet hour slot (compatibility alias for mobile PlanetaryHourSlot) ──
export interface PlanetaryHourSlot {
  hourNumber: number;
  planet: RulerName;
  startTime: Date;
  endTime: Date;
  isDayHour: boolean;
  isCurrent: boolean;
  durationMinutes: number;
}
