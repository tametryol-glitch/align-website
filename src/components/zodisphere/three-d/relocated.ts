/**
 * Relocated chart geometry (Zodisphere · Relocated mode).
 *
 * A relocated chart keeps the SKY of the birth moment (every planet's ecliptic
 * longitude is unchanged) and re-casts the ANGLES for a new place: same GMST,
 * new longitude/latitude. That moves the Ascendant and Midheaven, which re-houses
 * every planet. Houses are WHOLE SIGN (the app default): the sign that rises is
 * house 1.
 *
 * Pure functions only, so the geometry is unit-testable without the network.
 */

import { SIGNS, ACG_OBLIQUITY_DEG } from '@/lib/engines/derivedAstroMath';

const D2R = Math.PI / 180;
const OBLIQUITY = ACG_OBLIQUITY_DEG;
const norm360 = (x: number) => ((x % 360) + 360) % 360;

export interface AnglesAt { asc: number; mc: number; }

/**
 * Ascendant and Midheaven (ecliptic longitudes, degrees) for a place at a given
 * Greenwich sidereal time. RAMC = GMST + east longitude.
 */
export function ascMcAt(gmstDeg: number, lonDeg: number, latDeg: number): AnglesAt {
  const ramc = (gmstDeg + lonDeg) * D2R;
  const eps = OBLIQUITY * D2R;
  const phi = Math.max(-89, Math.min(89, latDeg)) * D2R;
  const mc = Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps)) / D2R;
  const asc = Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps))) / D2R;
  return { asc: norm360(asc), mc: norm360(mc) };
}

const signIndex = (lon: number) => Math.floor(norm360(lon) / 30) % 12;
export const signName = (lon: number): string => SIGNS[signIndex(lon)] as unknown as string;

/** Whole-sign house (1-12) of a longitude given the rising longitude. */
export function wholeSignHouse(lon: number, ascLon: number): number {
  return ((signIndex(lon) - signIndex(ascLon) + 12) % 12) + 1;
}

export type AngleName = 'ASC' | 'DSC' | 'MC' | 'IC';

export interface RelocatedChart {
  asc: number;
  mc: number;
  ascSign: string;
  mcSign: string;
  natalAscSign: string;
  placements: Array<{ body: string; sign: string; house: number; natalHouse: number }>;
  /** Bodies within `orb` degrees of one of the four relocated angles. */
  angular: Array<{ body: string; angle: AngleName; orbDeg: number }>;
}

const sep = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

export function relocateChart(
  bodies: Array<{ name: string; longitude: number }>,
  gmstDeg: number,
  place: { lat: number; lon: number },
  birth: { lat: number; lon: number },
  orbDeg = 8,
): RelocatedChart {
  const here = ascMcAt(gmstDeg, place.lon, place.lat);
  const home = ascMcAt(gmstDeg, birth.lon, birth.lat);
  const placements = bodies.map((b) => ({
    body: b.name,
    sign: signName(b.longitude),
    house: wholeSignHouse(b.longitude, here.asc),
    natalHouse: wholeSignHouse(b.longitude, home.asc),
  }));
  const angles: Array<[AngleName, number]> = [
    ['ASC', here.asc], ['DSC', norm360(here.asc + 180)], ['MC', here.mc], ['IC', norm360(here.mc + 180)],
  ];
  const angular: RelocatedChart['angular'] = [];
  for (const b of bodies) {
    for (const [angle, lon] of angles) {
      const d = sep(b.longitude, lon);
      if (d <= orbDeg) angular.push({ body: b.name, angle, orbDeg: d });
    }
  }
  angular.sort((a, b) => a.orbDeg - b.orbDeg);
  return {
    asc: here.asc, mc: here.mc,
    ascSign: signName(here.asc), mcSign: signName(here.mc),
    natalAscSign: signName(home.asc),
    placements, angular,
  };
}
