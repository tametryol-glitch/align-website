/**
 * Zodisphere astrocartography — the signed-in user's natal planetary lines,
 * projected for the globe.
 *
 * CORRECTNESS: this does NOT invent any astro math. It reuses the exact,
 * unit-tested engine (generateAcgLinesCompat in lib/engines/derivedAcgLines)
 * and the SAME chart fetch + birth-moment construction the production ACG
 * reading page uses, so the lines are identical to /readings/acg.
 */

import { api, buildBirthData } from '@/lib/api';
import {
  generateAcgLinesCompat,
  ACG_BODIES,
  type ACGLineType,
  type ACGLinePoint,
} from '@/lib/engines/derivedAcgLines';

export interface AcgGlobeLine {
  planet: string;
  lineType: ACGLineType;
  color: string;
  points: ACGLinePoint[];
}

/**
 * Build the user's natal ACG lines (Sun…Pluto × ASC/DSC/MC/IC) from their
 * profile. Returns [] if the user has no birth data. Never throws.
 */
export async function getMyAcgLines(profile: any): Promise<AcgGlobeLine[]> {
  if (!profile?.birth_date || profile?.latitude == null) return [];

  try {
    const birthData = buildBirthData(profile);
    const chartData = await api.getNatalChart(birthData);
    const allPlanets = (chartData?.planets || chartData?.positions || []) as Array<{ name: string; longitude: number }>;
    const planets = allPlanets.filter((p) => (ACG_BODIES as readonly string[]).includes(p.name));
    if (planets.length === 0) return [];

    // Birth moment in UTC — identical construction to app/readings/acg/page.tsx.
    const dateStr = String(profile.birth_date || '');
    const parts = dateStr.split('-').map(Number);
    let yr: number, mo: number, dy: number;
    if (parts[0] > 31) { [yr, mo, dy] = parts; } else { [dy, mo, yr] = parts; }
    const [h, min] = String(profile.birth_time || '12:00').split(':').map(Number);
    const tzOff = Math.round((profile.longitude || 0) / 15);
    const utH = (h || 12) + (min || 0) / 60 - tzOff;
    const date = new Date(Date.UTC(yr, mo - 1, dy, Math.floor(utH), Math.round((utH % 1) * 60)));

    return generateAcgLinesCompat(planets, date) as AcgGlobeLine[];
  } catch (e: any) {
    console.error('[zodisphere] ACG lines failed:', e?.message);
    return [];
  }
}
