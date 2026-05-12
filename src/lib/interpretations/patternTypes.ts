/**
 * Pattern Types — Shared interfaces for pattern detection, chart shapes,
 * and interpretation engines.
 */

export interface ChartPlanet {
  name: string;
  sign: string;
  house: number;
  longitude: number;
  is_retrograde?: boolean;
  sign_degree?: number;
}

export interface ChartAspect {
  body1: string;
  body2: string;
  aspect_name: string;
  orb: number;
}

export const PATTERN_ALLOWED_BODIES = new Set([
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'Juno', 'Vesta', 'Chiron', 'Pallas', 'Pallas Athena', 'Ceres',
  'North Node', 'South Node',
  'Vertex', 'Lilith', 'Dark Moon Lilith',
]);

export function canonicalBodyName(name: string): string {
  if (name === 'Pallas Athena') return 'Pallas';
  if (name === 'Dark Moon Lilith') return 'Lilith';
  return name;
}

export function isAllowedBody(name: string): boolean {
  return PATTERN_ALLOWED_BODIES.has(name) || PATTERN_ALLOWED_BODIES.has(canonicalBodyName(name));
}

export type AspectPatternType =
  | 'Grand Trine' | 'Kite' | 'T-Square' | 'Grand Cross'
  | 'Yod' | 'Boomerang Yod' | 'Mystic Rectangle'
  | 'Minor Grand Trine' | 'Stellium';

export interface PatternMember {
  name: string; sign: string; house: number; longitude: number;
  role: 'member' | 'apex' | 'focal' | 'handle' | 'release' | 'leading';
}

export interface DetectedPattern {
  type: AspectPatternType; members: PatternMember[];
  focalPoint?: PatternMember;
  missingLeg?: { sign: string; house: number; longitude: number };
  score: number; dedupeKey: string; geometry: string;
}

export type ChartShapeType = 'Bowl' | 'Bucket' | 'Bundle' | 'Locomotive' | 'Seesaw' | 'Splash' | 'Splay' | 'Fan';

export interface DetectedChartShape {
  type: ChartShapeType; confidence: number;
  handlePlanet?: PatternMember; leadingPlanet?: PatternMember;
  emptySpan?: number; occupiedSpan?: number; description: string;
}

export interface InterpretedPattern {
  type: AspectPatternType | ChartShapeType; title: string;
  involvedBodies: string[]; geometrySummary: string;
  interpretation: string; lifeManifest: string; growthLesson: string;
  focalLabel?: string;
  category: 'chart-shape' | 'major-pattern' | 'secondary-pattern';
  score: number;
}

export const SIGN_ELEMENTS: Record<string, string> = {
  Aries: 'Fire', Taurus: 'Earth', Gemini: 'Air', Cancer: 'Water',
  Leo: 'Fire', Virgo: 'Earth', Libra: 'Air', Scorpio: 'Water',
  Sagittarius: 'Fire', Capricorn: 'Earth', Aquarius: 'Air', Pisces: 'Water',
};

export const SIGN_MODALITIES: Record<string, string> = {
  Aries: 'Cardinal', Taurus: 'Fixed', Gemini: 'Mutable', Cancer: 'Cardinal',
  Leo: 'Fixed', Virgo: 'Mutable', Libra: 'Cardinal', Scorpio: 'Fixed',
  Sagittarius: 'Mutable', Capricorn: 'Cardinal', Aquarius: 'Fixed', Pisces: 'Mutable',
};

export const HOUSE_THEMES: Record<number, string> = {
  1: 'identity and self-expression', 2: 'resources, money, and self-worth',
  3: 'communication, siblings, and daily learning', 4: 'home, family, and emotional roots',
  5: 'creativity, romance, and self-expression', 6: 'health, work routines, and service',
  7: 'partnerships and one-on-one relationships', 8: 'transformation, shared resources, and intimacy',
  9: 'higher learning, travel, and belief systems', 10: 'career, public reputation, and life direction',
  11: 'community, friendships, and future vision', 12: 'the unconscious, spirituality, and hidden patterns',
};

export function normLon(deg: number): number { const n = deg % 360; return n < 0 ? n + 360 : n; }
export function angularDist(a: number, b: number): number { const d = Math.abs(normLon(a) - normLon(b)); return d > 180 ? 360 - d : d; }
export function isAspect(a: number, b: number, target: number, orb: number): boolean { return Math.abs(angularDist(a, b) - target) <= orb; }
export function buildDedupeKey(type: string, memberNames: string[], focalName?: string): string {
  const sorted = [...memberNames].sort().join('|');
  return focalName ? `${type}::${sorted}::${focalName}` : `${type}::${sorted}`;
}
export function orbScore(orbs: number[], maxOrb: number): number {
  if (orbs.length === 0) return 50;
  const avgOrb = orbs.reduce((s, o) => s + o, 0) / orbs.length;
  return Math.round(Math.max(0, Math.min(100, 100 * (1 - avgOrb / maxOrb))));
}
