// ── Galactic Clock Types ──
// TypeScript types and interfaces for the Galactic Clock system

export type RulerName = 'Mars' | 'Venus' | 'Mercury' | 'Moon' | 'Sun' | 'Vesta' | 'Juno' | 'Pluto' | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune';
export type GalacticDayName = 'Marsday' | 'Venusday' | 'Mercuryday' | 'Moonday' | 'Sunday' | 'Vestaday' | 'Junoday' | 'Plutoday' | 'Jupiterday' | 'Saturnday' | 'Uraniday' | 'Neptiday';

export interface GalacticSignature {
  currentTime: string;
  dayIndex: number;
  cycleDay: GalacticDayName;
  dayLord: RulerName;
  hourLordIndex: number;
  hourLord: RulerName;
  minuteLordIndex: number;
  minuteLord: RulerName;
  pulseLordIndex: number;
  pulseLord: RulerName;
  hourProgress: number;
  minuteBlockProgress: number;
  pulseBlockProgress: number;
}

export interface GalacticAngles {
  hour: number;
  minute: number;
  pulse: number;
}

export interface RulerMeaning {
  keywords: string[];
  expression: string;
  use: string;
  caution: string;
  color: string;
  glyph: string;
}

export interface InterpretationResult {
  title: string;
  signatureLine: string;
  summary: string;
  focus: string;
  caution: string;
  bestUseTags: string[];
}

export interface WheelSegment {
  index: number;
  ruler: RulerName;
  startAngle: number;
  endAngle: number;
  isActive: boolean;
  color: string;
  glyph: string;
}

export interface CountdownData {
  nextPulseSeconds: number;
  nextMinuteLordSeconds: number;
  nextHourLordSeconds: number;
  nextPulseFormatted: string;
  nextMinuteLordFormatted: string;
  nextHourLordFormatted: string;
}

// ── Astronomical Mode Types ──

export type ClockMode = 'standard' | 'astronomical';

export interface SunTimes {
  sunrise: Date;
  sunset: Date;
  nextSunrise: Date; // sunrise of the next day
}

export interface AstronomicalSegment {
  startTime: Date;
  endTime: Date;
  durationSeconds: number;
  rulerIndex: number;
  ruler: RulerName;
  isDaytime: boolean;
}
