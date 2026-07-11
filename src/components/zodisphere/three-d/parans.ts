/**
 * Parans for the 3D globe. A paran is a LATITUDE at which two bodies are
 * simultaneously angular. This REUSES Align's existing, production paran
 * algorithm (calculateParanLines from app/readings/acg) verbatim — same model
 * the classic ACG reading already shows users, so results are consistent — with
 * the interpretation composed from the shared BODY_INFO essences instead of
 * copying the large prose tables. No new/unvalidated astronomy is introduced.
 */

import { ACG_OBLIQUITY_DEG } from '@/lib/engines/derivedAstroMath';
import { bodyInfoOf } from '@/lib/zodisphereMidpoints';

const DEG = Math.PI / 180;
const OBLIQUITY = ACG_OBLIQUITY_DEG;
const ACG_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
type Angle = 'ASC' | 'DSC' | 'MC' | 'IC';

export interface ParanLine {
  planet1: string;
  angle1: Angle;
  planet2: string;
  angle2: Angle;
  latitude: number;
  interpretation: string;
}

function paranInterpretation(p1: string, p2: string, a1: Angle, a2: Angle): string {
  return `Where your **${bodyInfoOf(p1).essence}** and your **${bodyInfoOf(p2).essence}** cross the horizon together — ` +
    `${bodyInfoOf(p1).keywords} meets ${bodyInfoOf(p2).keywords}. (${p1} ${a1}, ${p2} ${a2})`;
}

/**
 * Compute paran latitudes for a chart. Verbatim reuse of the production
 * calculateParanLines geometry (canBeOnAngle at each latitude), deduped per
 * body-pair × angle-pair.
 */
export function calculateParanLines(
  planets: { name: string; longitude: number }[],
  _birthDate: Date,
): ParanLine[] {
  const eps = OBLIQUITY * DEG;
  const seenKeys = new Set<string>();
  const parans: ParanLine[] = [];

  const planetDecs: Record<string, number> = {};
  for (const planet of planets) {
    if (!ACG_PLANETS.includes(planet.name)) continue;
    const lonRad = planet.longitude * DEG;
    planetDecs[planet.name] = Math.asin(Math.sin(lonRad) * Math.sin(eps)) / DEG;
  }

  const allAngles: Angle[] = ['ASC', 'DSC', 'MC', 'IC'];
  const canBeOnAngle = (dec: number, lat: number, angle: Angle): boolean => {
    if (angle === 'MC' || angle === 'IC') return true;
    const cosH = -Math.tan(lat * DEG) * Math.tan(dec * DEG);
    return cosH >= -1 && cosH <= 1;
  };

  const planetNames = Object.keys(planetDecs);
  for (let i = 0; i < planetNames.length; i++) {
    for (let j = i + 1; j < planetNames.length; j++) {
      const p1 = planetNames[i], p2 = planetNames[j];
      const dec1 = planetDecs[p1], dec2 = planetDecs[p2];
      for (const angle1 of allAngles) {
        for (const angle2 of allAngles) {
          if ((angle1 === 'MC' || angle1 === 'IC') && (angle2 === 'MC' || angle2 === 'IC')) continue;
          const sortedKey = [`${p1}-${angle1}`, `${p2}-${angle2}`].sort().join('|');
          if (seenKeys.has(sortedKey)) continue;
          for (let lat = -60; lat <= 60; lat += 1) {
            if (canBeOnAngle(dec1, lat, angle1) && canBeOnAngle(dec2, lat, angle2) && lat % 5 === 0) {
              seenKeys.add(sortedKey + '|' + lat);
              parans.push({ planet1: p1, angle1, planet2: p2, angle2, latitude: lat, interpretation: paranInterpretation(p1, p2, angle1, angle2) });
              break;
            }
          }
        }
      }
    }
  }

  const uniqueParans: ParanLine[] = [];
  const seen = new Set<string>();
  for (const p of parans) {
    const key = `${p.planet1}-${p.planet2}-${p.angle1}-${p.angle2}`;
    if (!seen.has(key)) { seen.add(key); uniqueParans.push(p); }
  }
  return uniqueParans;
}

/** Parans whose latitude is within `orbDeg` of a given latitude, nearest first. */
export function paransNearLatitude(parans: ParanLine[], lat: number, orbDeg = 2.5, max = 4): ParanLine[] {
  return parans
    .filter((p) => Math.abs(p.latitude - lat) <= orbDeg)
    .sort((a, b) => Math.abs(a.latitude - lat) - Math.abs(b.latitude - lat))
    .slice(0, max);
}
