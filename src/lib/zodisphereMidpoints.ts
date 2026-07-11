/**
 * Zodisphere midpoints — tappable midpoint astrocartography.
 *
 * A midpoint is an action/event point: the fusion of two bodies. Its DIRECT
 * midpoint longitude is projected to ACG lines (ASC/DSC/MC/IC) via the SAME
 * unit-tested engine used for natal lines, so the geometry is validated.
 *
 * Interpretation is HYBRID + globally cacheable: a deterministic composition
 * from each body's essence × the angle's life-domain gives a grounded,
 * angle-specific meaning for ANY pair (planets, asteroids, points) — the
 * "classic" base. A `MIDPOINT_OVERRIDES` table can supply hand-written or
 * (later) AI-generated prose for marquee pairs, keyed identically. The
 * meaning for a pair is the same for every user; only the LINE is personal.
 */

import { api, buildBirthData } from '@/lib/api';
import {
  gmstAtMoment,
  ACG_BODY_COLORS,
  type ACGLineType,
  type ACGLinePoint,
} from '@/lib/engines/derivedAcgLines';
import { eclipticToEquatorial, ACG_OBLIQUITY_DEG } from '@/lib/engines/derivedAstroMath';

const DEG_RAD = Math.PI / 180;

/**
 * Full-globe projection of one ecliptic longitude to ACG lines. Uses the SAME
 * validated eclipticToEquatorial transform and the SAME MC/ASC/DSC geometry as
 * the engine's projectLongitudeToLines — no new astro math. The difference is
 * PARAMETRIZATION, chosen so every line closes with no gap:
 *
 *  • MC/IC are meridians of constant longitude → swept pole to pole (±90) so
 *    each reaches the poles; MC and IC share the poles → together a seamless
 *    great circle.
 *  • ASC/DSC together form ONE horizon great circle (locus where the body is on
 *    the horizon at the birth instant). The engine solves it per-latitude via
 *    cosH = −tan(lat)·tan(dec), which hits |cosH|=1 and STOPS short of the
 *    junction latitudes → the visible gap between the ASC and DSC arcs. Here we
 *    instead sweep the hour angle H = 0…360°, with the identical relations
 *      lat(H) = atan(−cos H / tan dec),  lon(H) = raAdj + H − gmst,
 *    which is the exact same circle fully traced: the ASC half (H 0→180) and
 *    the DSC half (H 180→360) meet at their shared junction points, so the loop
 *    closes with no gap. Point positions are unchanged where both forms overlap.
 */
export function projectWide(longitudeDeg: number, gmst: number): Array<{ lineType: ACGLineType; points: ACGLinePoint[] }> {
  const { rightAscension: raAdj, declination: dec } = eclipticToEquatorial(longitudeDeg, ACG_OBLIQUITY_DEG);
  const out: Array<{ lineType: ACGLineType; points: ACGLinePoint[] }> = [];
  const wrap180 = (x: number) => ((x % 360) + 360 + 180) % 360 - 180;

  // MC / IC — full meridian great circle, pole to pole (±90 closes the gap).
  const mcLon = wrap180(raAdj - gmst);
  const mc: ACGLinePoint[] = [];
  for (let lat = -90; lat <= 90; lat += 1) mc.push({ lat, lon: mcLon });
  out.push({ lineType: 'MC', points: mc });

  const icLon = mcLon > 0 ? mcLon - 180 : mcLon + 180;
  const ic: ACGLinePoint[] = [];
  for (let lat = -90; lat <= 90; lat += 1) ic.push({ lat, lon: icLon });
  out.push({ lineType: 'IC', points: ic });

  // ASC / DSC — two halves of the horizon circle, swept by hour angle so each
  // half is continuous and reaches the shared junctions where they connect.
  const tanDec = Math.tan(dec * DEG_RAD) || 1e-9; // guard the dec≈0 singularity
  const arc = (h0: number, h1: number): ACGLinePoint[] => {
    const pts: ACGLinePoint[] = [];
    for (let h = h0; h <= h1; h += 1) {
      const lat = Math.atan(-Math.cos(h * DEG_RAD) / tanDec) / DEG_RAD;
      pts.push({ lat, lon: wrap180(raAdj + h - gmst) });
    }
    return pts;
  };
  out.push({ lineType: 'ASC', points: arc(0, 180) });
  out.push({ lineType: 'DSC', points: arc(180, 360) });

  return out;
}

// ── Body essences (planets + asteroids + points). Aliases cover the chart
//    API's naming variants. Any body present in the chart AND here is
//    offerable in the picker. ──────────────────────────────────────────────
export interface BodyInfo { essence: string; keywords: string; color: string; }

export const BODY_INFO: Record<string, BodyInfo> = {
  Sun:     { essence: 'radiant identity and will', keywords: 'vitality, visibility, purpose', color: ACG_BODY_COLORS.Sun },
  Moon:    { essence: 'feeling, instinct and need', keywords: 'emotion, care, belonging', color: ACG_BODY_COLORS.Moon },
  Mercury: { essence: 'mind and message', keywords: 'thinking, speaking, connecting', color: ACG_BODY_COLORS.Mercury },
  Venus:   { essence: 'love, value and attraction', keywords: 'romance, beauty, worth', color: ACG_BODY_COLORS.Venus },
  Mars:    { essence: 'drive, desire and force', keywords: 'action, courage, conflict', color: ACG_BODY_COLORS.Mars },
  Jupiter: { essence: 'expansion and opportunity', keywords: 'growth, luck, faith', color: ACG_BODY_COLORS.Jupiter },
  Saturn:  { essence: 'structure, limit and mastery', keywords: 'discipline, weight, time', color: ACG_BODY_COLORS.Saturn },
  Uranus:  { essence: 'awakening and disruption', keywords: 'freedom, shock, breakthrough', color: ACG_BODY_COLORS.Uranus },
  Neptune: { essence: 'dream, dissolution and longing', keywords: 'imagination, illusion, spirit', color: ACG_BODY_COLORS.Neptune },
  Pluto:   { essence: 'power and transformation', keywords: 'depth, obsession, rebirth', color: ACG_BODY_COLORS.Pluto },
  // Asteroids — curated essences (more available via search)
  Chiron:  { essence: 'the wound that becomes wisdom', keywords: 'healing, teaching, the tender place', color: '#84CC16' },
  Ceres:   { essence: 'nurture and the cycle of return', keywords: 'sustenance, loss, mothering', color: '#34D399' },
  Pallas:  { essence: 'strategy and pattern-sight', keywords: 'cleverness, craft, justice', color: '#FBBF24' },
  Juno:    { essence: 'the sacred contract of union', keywords: 'commitment, loyalty, partnership', color: '#A78BFA' },
  Vesta:   { essence: 'devotion and the tended flame', keywords: 'focus, sacredness, service', color: '#FB923C' },
  Eros:    { essence: 'erotic passion and what you crave', keywords: 'desire, magnetism, wanting', color: '#FB7185' },
  Psyche:  { essence: 'the soul’s deep sensitivity', keywords: 'soul, wounding, deep knowing', color: '#C4B5FD' },
  Hygiea:  { essence: 'health, purity and wholeness', keywords: 'well-being, cleansing, healing', color: '#6EE7B7' },
  Sappho:  { essence: 'artistic and romantic devotion', keywords: 'art, longing, the muse', color: '#F0ABFC' },
  Amor:    { essence: 'unconditional, tender love', keywords: 'compassion, care, acceptance', color: '#FDA4AF' },
  Astraea: { essence: 'justice, innocence and discernment', keywords: 'fairness, purity, judgment', color: '#93C5FD' },
  Fortuna: { essence: 'fortune and fate’s turning wheel', keywords: 'luck, chance, destiny', color: '#FDE047' },
  Pholus:  { essence: 'a small cause with vast effect', keywords: 'catalyst, floodgates, release', color: '#F59E0B' },
  Nessus:  { essence: 'the reckoning of harm and boundary', keywords: 'accountability, karma, cycles', color: '#B91C1C' },
  Hecate:  { essence: 'the crossroads and the liminal', keywords: 'thresholds, magic, choice', color: '#A78BFA' },
  Cupido:  { essence: 'charm, family and attraction', keywords: 'allure, art, kinship', color: '#F472B6' },
  Eris:    { essence: 'the disruptor of false peace', keywords: 'discord, exclusion, reckoning', color: '#E879F9' },
  Sedna:   { essence: 'endurance through the abyss', keywords: 'exile, survival, the deep', color: '#38BDF8' },
  // Points
  'North Node': { essence: 'your soul’s growth edge', keywords: 'destiny, the unfamiliar, becoming', color: '#E5E7EB' },
  'South Node': { essence: 'the familiar gift to release', keywords: 'the past, comfort, letting go', color: '#94A3B8' },
  Ascendant:    { essence: 'the self you meet the world with', keywords: 'body, presence, first impression', color: '#FDA4AF' },
  Midheaven:    { essence: 'your public destiny', keywords: 'vocation, reputation, the summit', color: '#67E8F9' },
  'Part of Fortune': { essence: 'where ease and joy flow', keywords: 'fortune, flow, delight', color: '#FDE047' },
  Lilith:       { essence: 'the untamed instinct that won’t be owned', keywords: 'rawness, taboo, power', color: '#C084FC' },
  Vertex:       { essence: 'fated encounters and turning points', keywords: 'destiny, meetings, thresholds', color: '#F0ABFC' },
};

// Alias → canonical body name (the chart API varies its labels).
const BODY_ALIASES: Record<string, string> = {
  'ASC': 'Ascendant', 'Asc': 'Ascendant', 'Rising': 'Ascendant',
  'MC': 'Midheaven', 'Mc': 'Midheaven',
  'True Node': 'North Node', 'Mean Node': 'North Node', 'Node': 'North Node',
  'Fortune': 'Part of Fortune', 'PoF': 'Part of Fortune',
  'Black Moon Lilith': 'Lilith', 'Black Moon': 'Lilith',
};

export function canonicalBody(name: string): string {
  return BODY_ALIASES[name] ?? name;
}

// Full asteroid catalog (mirrors align-api-v2 charts.py ASTEROID_CATALOG).
// The backend computes any of these on request via extra_asteroids and
// returns each with its catalog_number, which we match on (name-agnostic).
// 'Lilith' is intentionally omitted here — it collides with the Black-Moon
// Lilith point already in BODY_INFO.
export const ASTEROID_CATALOG: Record<string, number> = {
  Ceres: 1, Pallas: 2, Juno: 3, Vesta: 4, Astraea: 5,
  Hygiea: 10, Psyche: 16, Fortuna: 19, Isis: 42, Sappho: 80,
  Hecate: 100, Nemesis: 128, Nike: 307, Eros: 433,
  Amor: 1221, Valentine: 1585, Union: 1691, Apollo: 1862,
  Osiris: 1923, Horus: 1924, Karma: 3811, Child: 4580, Pholus: 5145,
  Nessus: 7066, Chariklo: 10199, Angel: 11911, DNA: 55555,
  Eris: 136199, Sedna: 90377, Haumea: 136108, Makemake: 136472,
  Narcissus: 37117, Echo: 60, Pandora: 55, Icarus: 1566,
  Daedalus: 1864, Orpheus: 3361, Eurydike: 75, Persephone: 399,
  Diana: 78, Minerva: 93, Bacchus: 2063, Circe: 34,
  Medea: 212, Kassandra: 114, Achilles: 588, Sphinx: 896,
  Atlantis: 1198, Tantalus: 2102, Sisyphus: 1866, Damocles: 5335,
  Lucifer: 1930, Magdalena: 318, Cupido: 763, Destinn: 6583,
  Abundantia: 151, Industria: 389, Proserpina: 26,
};

const CATALOG_BY_NUM: Record<number, string> = Object.fromEntries(
  Object.entries(ASTEROID_CATALOG).map(([n, num]) => [num, n]),
);

/** Sorted catalog names for the search UI. */
export const ASTEROID_CATALOG_NAMES = Object.keys(ASTEROID_CATALOG).sort();

/** Popular asteroids preloaded into every chart fetch (curated essences).
 *  Uncomputable ones are silently skipped by the backend — never an error. */
const DEFAULT_EXTRA_ASTEROIDS = [
  'Ceres', 'Pallas', 'Juno', 'Vesta', 'Eros', 'Psyche', 'Hygiea', 'Sappho',
  'Amor', 'Astraea', 'Fortuna', 'Pholus', 'Nessus', 'Hecate', 'Cupido', 'Eris', 'Sedna',
];

/** Essence for any body, with a graceful fallback for uncurated catalog
 *  asteroids so every midpoint still produces a readable meaning. */
export function bodyInfoOf(name: string): BodyInfo {
  return BODY_INFO[name] ?? { essence: `the ${name} archetype`, keywords: `${name}'s themes`, color: '#B0B7D0' };
}

// ── Chart fetch: the bodies we can offer (present in chart AND known here) ──
export interface ChartBody { name: string; longitude: number; }
export interface ChartData { bodies: ChartBody[]; birthDate: Date; }

export async function getMyChartBodies(profile: any, extraAsteroids: string[] = []): Promise<ChartData | null> {
  if (!profile?.birth_date || profile?.latitude == null) return null;
  try {
    // Ask the backend to also compute the popular + any searched asteroids.
    // Only catalog-known names are sent; unknown/uncomputable ones are
    // skipped server-side (per-asteroid try/except) — never an error.
    const extra = Array.from(new Set([...DEFAULT_EXTRA_ASTEROIDS, ...extraAsteroids]))
      .filter((n) => n in ASTEROID_CATALOG);
    const chart = await api.getNatalChart({ ...buildBirthData(profile), extra_asteroids: extra });
    const raw = (chart?.planets || chart?.positions || []) as Array<{ name: string; longitude: number; catalog_number?: number }>;
    const bodies: ChartBody[] = [];
    const seen = new Set<string>();
    for (const r of raw) {
      // Extra asteroids carry a catalog_number → match by number (name-agnostic);
      // everything else matches by (aliased) name.
      const name = (r.catalog_number != null && CATALOG_BY_NUM[r.catalog_number])
        ? CATALOG_BY_NUM[r.catalog_number]
        : canonicalBody(r.name);
      const known = !!BODY_INFO[name] || name in ASTEROID_CATALOG;
      if (!known || seen.has(name) || !Number.isFinite(r.longitude)) continue;
      seen.add(name);
      bodies.push({ name, longitude: r.longitude });
    }

    // Birth moment in UTC. ACCURACY: GMST (Earth's rotation at birth) is
    // extremely time-sensitive — ~15°/hour of line-longitude shift — so we use
    // the REAL historical timezone/DST offset (resolveTimezoneOffset), not a
    // crude longitude/15 estimate. This is the same offset the backend chart
    // uses, keeping the client line projection consistent and accurate.
    const parts = String(profile.birth_date).split('-').map(Number);
    let yr: number, mo: number, dy: number;
    if (parts[0] > 31) { [yr, mo, dy] = parts; } else { [dy, mo, yr] = parts; }
    const [h, min] = String(profile.birth_time || '12:00').split(':').map(Number);
    let tzOff = Math.round((profile.longitude || 0) / 15); // fallback
    try {
      const { resolveTimezoneOffset } = require('@/lib/timezoneOffset');
      const r = resolveTimezoneOffset(profile.timezone, profile.longitude, profile.birth_date, profile.birth_time, profile.latitude);
      if (r && Number.isFinite(r.offset)) tzOff = r.offset;
    } catch { /* keep the longitude-based fallback */ }
    const utMinutes = Math.round(((h || 12) + (min || 0) / 60 - tzOff) * 60);
    const birthDate = new Date(Date.UTC(yr, mo - 1, dy, 0, utMinutes));

    return { bodies, birthDate };
  } catch (e: any) {
    console.error('[zodisphere] chart fetch for midpoints failed:', e?.message);
    return null;
  }
}

// ── Angle life-domains ─────────────────────────────────────────────────────
const ANGLE_DOMAIN: Record<ACGLineType, { label: string; phrase: string }> = {
  MC: { label: 'at its peak', phrase: 'career, reputation, and public life — where the world sees it' },
  IC: { label: 'at its roots', phrase: 'home, family, and your private foundations — where it lives quietly' },
  ASC: { label: 'on the rise', phrase: 'your identity, body, and how you show up — it becomes part of who you are here' },
  DSC: { label: 'on the horizon of others', phrase: 'relationships and encounters — it arrives through other people' },
};

export const ANGLE_ORDER: ACGLineType[] = ['MC', 'ASC', 'DSC', 'IC'];

// ── Midpoint math ───────────────────────────────────────────────────────────
const norm360 = (x: number) => ((x % 360) + 360) % 360;

/** Direct (short-arc) midpoint of two ecliptic longitudes. */
export function directMidpoint(lonA: number, lonB: number): number {
  let d = ((lonB - lonA + 540) % 360) - 180; // signed shortest delta
  return norm360(lonA + d / 2);
}

/** Average two hex colors (the midpoint line's blended color). */
export function blendColors(a: string, b: string): string {
  const p = (h: string) => {
    const m = /^#?([0-9a-fA-F]{6})$/.exec(h);
    return m ? [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)) : [200, 200, 200];
  };
  const [r1, g1, b1] = p(a); const [r2, g2, b2] = p(b);
  const mix = (x: number, y: number) => Math.round((x + y) / 2);
  return `rgb(${mix(r1, r2)},${mix(g1, g2)},${mix(b1, b2)})`;
}

export interface MidpointLine {
  key: string;            // "A|B" (canonical, ordered)
  bodyA: string;
  bodyB: string;
  lineType: ACGLineType;
  color: string;
  points: ACGLinePoint[];
}

/** Build the four ACG lines for one body-pair's direct midpoint. */
export function buildMidpointLines(
  bodyA: string,
  bodyB: string,
  lonA: number,
  lonB: number,
  birthDate: Date,
): MidpointLine[] {
  const mid = directMidpoint(lonA, lonB);
  const gmst = gmstAtMoment(birthDate);
  const color = blendColors(bodyInfoOf(bodyA).color, bodyInfoOf(bodyB).color);
  const key = pairKey(bodyA, bodyB);
  return projectWide(mid, gmst).map((raw) => ({
    key, bodyA, bodyB, lineType: raw.lineType, color, points: raw.points,
  }));
}

/** Canonical, order-independent key for a pair. */
export function pairKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

// ── Interpretation (hybrid: overrides → composition) ───────────────────────
/** Hand-written / AI-cached prose for marquee pairs, keyed `A|B|ANGLE`
 *  (A|B sorted). Seed a few; the composition covers everything else. */
export const MIDPOINT_OVERRIDES: Record<string, string> = {
  'Moon|Sun|MC': 'Here your **core self and your heart pull in the same direction** — and the world gets to see it. On this line your public life and your private needs stop fighting each other; what you do out loud finally feels like *you*. A place to be recognized for who you actually are.',
  'Mars|Venus|DSC': 'This is the **magnetism line**. Desire and attraction fuse and arrive through other people — relationships here run hot, fast, and physical. Expect chemistry, and expect it to demand something of you. Beautiful for passion; watch the line between spark and combustion.',
  'Jupiter|Sun|MC': 'Your **identity meets opportunity at its peak**. This is a classic success-and-visibility line — confidence expands, doors open, and people back your vision. One of the best places to be seen and to grow into a bigger version of yourself.',
  'Pluto|Sun|ASC': 'Here you are **remade**. Identity and raw transformative power fuse and become part of how you show up — you arrive intense, magnetic, unignorable. Nothing stays surface-level. A place of profound personal power and total reinvention; not a place to hide.',
  'Moon|Saturn|IC': 'Emotion meets structure at your **roots**. Home here feels serious, weighty, sometimes lonely — but also solid, enduring, real. Good for building a foundation that lasts; hard if you need lightness. Old family patterns surface to be reckoned with.',
};

/** Angle-specific meaning for a pair. Override first, else composed. */
export function midpointMeaning(bodyA: string, bodyB: string, angle: ACGLineType): string {
  const k = `${[bodyA, bodyB].sort().join('|')}|${angle}`;
  if (MIDPOINT_OVERRIDES[k]) return MIDPOINT_OVERRIDES[k];

  const A = bodyInfoOf(bodyA);
  const B = bodyInfoOf(bodyB);
  const dom = ANGLE_DOMAIN[angle];
  if (!dom) return '';

  return `Here your **${A.essence}** and your **${B.essence}** fuse into one charged point — and ${dom.label}, it moves through ${dom.phrase}. Standing on or near this line tends to activate ${A.keywords} meeting ${B.keywords}. It's an **action point**: things happen here that combine both energies, for better and for more.`;
}

// ── Probe: what's near a tapped/hovered globe point ─────────────────────────
const D2R = Math.PI / 180;

/** Angular distance in degrees between two lat/lng points (great circle). */
export function angularDistanceDeg(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const s = Math.sin((lat2 - lat1) * D2R / 2) ** 2 +
    Math.cos(lat1 * D2R) * Math.cos(lat2 * D2R) * Math.sin((lon2 - lon1) * D2R / 2) ** 2;
  return (2 * Math.asin(Math.min(1, Math.sqrt(s)))) / D2R;
}

export interface ProbeHit {
  line: MidpointLine;
  distanceDeg: number;
  meaning: string;
}

/** Midpoint lines within `orbDeg` of (lat,lng), closest first, capped. */
export function probeMidpoints(
  lat: number,
  lng: number,
  lines: MidpointLine[],
  orbDeg = 1.5,
  max = 3,
): ProbeHit[] {
  const hits: ProbeHit[] = [];
  for (const line of lines) {
    let best = Infinity;
    for (const p of line.points) {
      const d = angularDistanceDeg(lat, lng, p.lat, p.lon);
      if (d < best) best = d;
    }
    if (best <= orbDeg) {
      hits.push({ line, distanceDeg: best, meaning: midpointMeaning(line.bodyA, line.bodyB, line.lineType) });
    }
  }
  return hits.sort((x, y) => x.distanceDeg - y.distanceDeg).slice(0, max);
}
