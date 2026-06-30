/**
 * Hidden Zodiac — supported planets & points registry.
 *
 * Extensible by design: add a row to SUPPORTED_OBJECTS to support a new
 * asteroid or Arabic Part. The `category` field drives the Mode-1 filter
 * (Personal / Social / Outer / Angles / Nodes / Asteroids / Points). Glyphs
 * carry an accessible text label (`name`) alongside them everywhere they render.
 *
 * This registry never invents positions — it only declares which objects the
 * feature understands. Whether an object actually HAS a position comes from the
 * chart engine at runtime.
 */

export type ObjectCategory =
  | 'personal'
  | 'social'
  | 'outer'
  | 'angle'
  | 'node'
  | 'asteroid'
  | 'point';

export interface SupportedObject {
  /** Canonical name — must match the name the chart engine returns. */
  name: string;
  /** Display glyph (always paired with `name` for accessibility). */
  glyph: string;
  category: ObjectCategory;
  /** Alternate names the chart engine might use. */
  aliases?: string[];
}

export const SUPPORTED_OBJECTS: readonly SupportedObject[] = [
  // Personal
  { name: 'Sun', glyph: '☉', category: 'personal' },
  { name: 'Moon', glyph: '☽', category: 'personal' },
  { name: 'Mercury', glyph: '☿', category: 'personal' },
  { name: 'Venus', glyph: '♀', category: 'personal' },
  { name: 'Mars', glyph: '♂', category: 'personal' },
  // Social
  { name: 'Jupiter', glyph: '♃', category: 'social' },
  { name: 'Saturn', glyph: '♄', category: 'social' },
  // Outer
  { name: 'Uranus', glyph: '♅', category: 'outer' },
  { name: 'Neptune', glyph: '♆', category: 'outer' },
  { name: 'Pluto', glyph: '♇', category: 'outer' },
  // Angles
  { name: 'Ascendant', glyph: 'Asc', category: 'angle', aliases: ['ASC', 'Rising'] },
  { name: 'Descendant', glyph: 'Dsc', category: 'angle', aliases: ['DSC'] },
  { name: 'Midheaven', glyph: 'MC', category: 'angle', aliases: ['MC', 'Medium Coeli'] },
  { name: 'Imum Coeli', glyph: 'IC', category: 'angle', aliases: ['IC'] },
  { name: 'Vertex', glyph: 'Vx', category: 'angle' },
  { name: 'Anti-Vertex', glyph: 'AVx', category: 'angle', aliases: ['Antivertex'] },
  // Nodes
  { name: 'North Node', glyph: '☊', category: 'node', aliases: ['True Node', 'Mean Node', 'NN'] },
  { name: 'South Node', glyph: '☋', category: 'node', aliases: ['SN'] },
  // Asteroids / bodies
  { name: 'Vesta', glyph: '⚶', category: 'asteroid' },
  { name: 'Juno', glyph: '⚵', category: 'asteroid' },
  { name: 'Chiron', glyph: '⚷', category: 'asteroid' },
  { name: 'Ceres', glyph: '⚳', category: 'asteroid' },
  { name: 'Pallas', glyph: '⚴', category: 'asteroid' },
  { name: 'Eros', glyph: '⚸', category: 'asteroid' },
  { name: 'Psyche', glyph: 'Ψ', category: 'asteroid' },
  { name: 'Amor', glyph: '♡', category: 'asteroid' },
  { name: 'Bacchus', glyph: '⚳', category: 'asteroid' },
  { name: 'DNA', glyph: '𓂀', category: 'asteroid' },
  // Points / Arabic Parts / Lilith
  // Earth is the exact opposite of the Sun (Sun longitude + 180°). In a saved
  // chart it is derived from the Sun; in the manual calculator it is entered
  // directly. It signifies the earthly purpose — what a person is here to
  // ground and accomplish in physical life.
  { name: 'Earth', glyph: '⊕', category: 'point', aliases: ['Earth Point', 'Anti-Sun'] },
  { name: 'Dark Moon Lilith', glyph: '⚸', category: 'point', aliases: ['Lilith', 'Black Moon Lilith'] },
  { name: 'Part of Fortune', glyph: '⊗', category: 'point', aliases: ['Fortune', 'Pars Fortunae'] },
  { name: 'Part of Spirit', glyph: '⊙', category: 'point', aliases: ['Spirit', 'Pars Spiritus'] },
];

export const OBJECT_CATEGORY_LABELS: Record<ObjectCategory | 'all', string> = {
  all: 'All placements',
  personal: 'Personal planets',
  social: 'Social planets',
  outer: 'Outer planets',
  angle: 'Angles',
  node: 'Nodes',
  asteroid: 'Asteroids',
  point: 'Points',
};

const BY_NAME: Record<string, SupportedObject> = (() => {
  const map: Record<string, SupportedObject> = {};
  for (const obj of SUPPORTED_OBJECTS) {
    map[obj.name.toLowerCase()] = obj;
    for (const a of obj.aliases ?? []) map[a.toLowerCase()] = obj;
  }
  return map;
})();

/** Resolve an object (by canonical name or alias). Null if unsupported. */
export function findSupportedObject(name: string): SupportedObject | null {
  return BY_NAME[(name ?? '').toLowerCase()] ?? null;
}

/** Glyph for a name, falling back to the first two characters of the name. */
export function glyphForObject(name: string): string {
  return findSupportedObject(name)?.glyph ?? (name ?? '?').slice(0, 2);
}

/** A compact curated set for the calculator picker (the most-used objects). */
export const CALCULATOR_QUICK_PICK: readonly string[] = [
  'Sun', 'Earth', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn',
  'Uranus', 'Neptune', 'Pluto', 'Vesta', 'Juno', 'Chiron',
  'Ascendant', 'Midheaven', 'North Node',
];
