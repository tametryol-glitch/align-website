/**
 * Real astrology payloads for the server-rendered Cosmic Video templates.
 *
 * The creator used to send `planets: []` / `aspects: []` with no moon phase, so
 * every data-driven scene (chart wheel, key transit, planetary positions) was
 * empty or fell back to a generic line. This builds the payload from the same
 * Swiss-Ephemeris endpoints the rest of Align uses:
 *
 *   chart_reveal   → natal planets + natal aspects (Big Three comes from profile)
 *   daily_forecast → today's sky, moon phase/sign, strongest transit-to-natal hit
 *   transit_alert  → strongest transit-to-natal hits + active retrogrades
 *
 * Every field is computed from real positions — nothing is invented. If a
 * fetch fails the field is simply left empty and the renderer shows its honest
 * "quiet skies" fallbacks.
 */
import { api, buildBirthData } from '@/lib/api';
import type { TemplateId } from '@/lib/cosmicVideoService';

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const MAIN_BODY = /^(sun|moon|mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto|chiron|(true |north |mean )?node)$/i;
const PERSONAL = /^(sun|moon|mercury|venus|mars)$/i;

interface Body {
  name: string;
  longitude: number;
  sign: string;
  degree: number;
  retrograde: boolean;
}

export interface VideoAspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
}

export interface VideoAstroPayload {
  planets: Body[];
  aspects: VideoAspect[];
  houseCusps?: number[];
  ascendantDegree?: number;
  activeRetrogrades?: string[];
  moonPhase?: string;
  moonSign_current?: string;
}

const norm360 = (n: number) => ((n % 360) + 360) % 360;

function toBodies(raw: unknown): Body[] {
  if (!Array.isArray(raw)) return [];
  const out: Body[] = [];
  for (const p of raw as Array<Record<string, unknown>>) {
    const name = String(p?.name ?? p?.planet ?? '');
    const lonRaw = typeof p?.longitude === 'number' ? p.longitude : typeof p?.lon === 'number' ? p.lon : null;
    if (!name || lonRaw == null) continue;
    const longitude = norm360(lonRaw);
    out.push({
      name: /node/i.test(name) ? 'North Node' : name,
      longitude,
      sign: (typeof p.sign === 'string' && p.sign) || SIGNS[Math.floor(longitude / 30)],
      degree: longitude % 30,
      retrograde: !!(p.is_retrograde ?? p.retrograde),
    });
  }
  return out;
}

const ASPECT_DEFS: Array<{ type: string; angle: number }> = [
  { type: 'conjunction', angle: 0 },
  { type: 'sextile', angle: 60 },
  { type: 'square', angle: 90 },
  { type: 'trine', angle: 120 },
  { type: 'opposition', angle: 180 },
];

/** How much a transit means: slow outer planets over personal points matter most. */
const TRANSIT_WEIGHT: Record<string, number> = {
  pluto: 6, neptune: 5, uranus: 5, saturn: 5, jupiter: 4, chiron: 3, mars: 3, sun: 2.5, venus: 2.5, mercury: 2, moon: 1.5,
};

function transitHits(transit: Body[], natal: Body[], ascendant?: number): VideoAspect[] {
  const targets: Body[] = natal.filter((n) => MAIN_BODY.test(n.name));
  if (typeof ascendant === 'number') {
    targets.push({ name: 'Ascendant', longitude: ascendant, sign: SIGNS[Math.floor(ascendant / 30)], degree: ascendant % 30, retrograde: false });
  }
  const scored: Array<VideoAspect & { score: number }> = [];
  for (const t of transit) {
    const key = t.name.toLowerCase();
    if (!(key in TRANSIT_WEIGHT)) continue;
    const limit = key === 'moon' ? 4 : 3;
    for (const n of targets) {
      let sep = Math.abs(t.longitude - n.longitude) % 360;
      if (sep > 180) sep = 360 - sep;
      for (const a of ASPECT_DEFS) {
        const orb = Math.abs(sep - a.angle);
        const max = a.type === 'sextile' ? limit - 1 : limit;
        if (orb > max) continue;
        const natalW = /sun|moon|ascendant/i.test(n.name) ? 1.4 : PERSONAL.test(n.name) ? 1.1 : 1;
        scored.push({
          planet1: t.name,
          planet2: n.name,
          type: a.type,
          orb: Math.round(orb * 10) / 10,
          score: TRANSIT_WEIGHT[key] * natalW * (1 - orb / (max + 0.5)),
        });
      }
    }
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ score: _s, ...rest }) => rest);
}

function phaseName(elongation: number): string {
  const e = norm360(elongation);
  if (e < 22.5 || e >= 337.5) return 'New Moon';
  if (e < 67.5) return 'Waxing Crescent';
  if (e < 112.5) return 'First Quarter';
  if (e < 157.5) return 'Waxing Gibbous';
  if (e < 202.5) return 'Full Moon';
  if (e < 247.5) return 'Waning Gibbous';
  if (e < 292.5) return 'Last Quarter';
  return 'Waning Crescent';
}

function natalAspects(raw: unknown): VideoAspect[] {
  if (!Array.isArray(raw)) return [];
  const out: VideoAspect[] = [];
  for (const a of raw as Array<Record<string, unknown>>) {
    const p1 = String(a.planet1 ?? a.body1 ?? '');
    const p2 = String(a.planet2 ?? a.body2 ?? '');
    const type = String(a.aspect ?? a.aspect_name ?? a.type ?? '').toLowerCase();
    if (!MAIN_BODY.test(p1) || !MAIN_BODY.test(p2)) continue;
    if (!ASPECT_DEFS.some((d) => type.includes(d.type))) continue;
    out.push({ planet1: p1, planet2: p2, type, orb: typeof a.orb === 'number' ? Math.abs(a.orb) : 9 });
  }
  return out.sort((x, y) => x.orb - y.orb).slice(0, 6);
}

export async function loadVideoAstroPayload(
  profile: Record<string, unknown>,
  templateId: TemplateId,
): Promise<VideoAstroPayload> {
  if (templateId === 'zodiac_personality' || templateId === 'compatibility_check') return { planets: [], aspects: [] };

  const birthData = buildBirthData(profile);
  const needsTransits = templateId === 'daily_forecast' || templateId === 'transit_alert';

  const [natalRaw, transitsRaw] = await Promise.all([
    api.getNatalChart(birthData).catch(() => null),
    needsTransits ? api.getCurrentTransits(birthData).catch(() => null) : Promise.resolve(null),
  ]);

  const natalBodies = toBodies(natalRaw?.positions ?? natalRaw?.planets);
  const asc = natalBodies.find((b) => b.name === 'Ascendant')?.longitude
    ?? (Array.isArray(natalRaw?.house_cusps) && Number.isFinite(natalRaw.house_cusps[0]) ? norm360(natalRaw.house_cusps[0]) : undefined);
  const payload: VideoAstroPayload = { planets: [], aspects: [], ascendantDegree: asc };

  if (templateId === 'chart_reveal') {
    payload.planets = natalBodies.filter((b) => MAIN_BODY.test(b.name));
    payload.aspects = natalAspects(natalRaw?.aspects);
    if (Array.isArray(natalRaw?.house_cusps)) payload.houseCusps = natalRaw.house_cusps;
    return payload;
  }

  const transitBodies = toBodies(transitsRaw?.transit_positions ?? transitsRaw?.transits ?? transitsRaw?.positions).filter((b) => MAIN_BODY.test(b.name));
  const sun = transitBodies.find((b) => b.name === 'Sun');
  const moon = transitBodies.find((b) => b.name === 'Moon');
  const mp = transitsRaw?.moon_phase as { elongation?: number } | undefined;
  const elong = typeof mp?.elongation === 'number' ? mp.elongation : sun && moon ? moon.longitude - sun.longitude : null;

  payload.planets = transitBodies;
  payload.aspects = transitHits(transitBodies, natalBodies, asc);
  payload.activeRetrogrades = transitBodies
    .filter((b) => b.retrograde && /^(mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto)$/i.test(b.name))
    .map((b) => b.name);
  if (elong != null) payload.moonPhase = phaseName(elong);
  if (moon) payload.moonSign_current = moon.sign;
  return payload;
}
