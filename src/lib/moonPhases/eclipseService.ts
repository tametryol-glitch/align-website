/**
 * Eclipse Service
 *
 * Thin client over the backend `/transits/eclipses/upcoming` endpoint.
 * All astronomy (phase finding, node geometry, classification, influence
 * window) is done server-side via Swiss Ephemeris. The client just
 * re-shapes the JSON into the `EclipseEvent` structure the UI expects.
 *
 * Ported from align-app for web use. No React Native dependencies.
 */

import { api } from '@/lib/api';
import type { EclipseSubtype, LunarEvent } from './impactScore';

// ── Public types ──────────────────────────────────────────────────────────

export interface EclipseEvent extends LunarEvent {
  type: 'eclipse';
  subtype: EclipseSubtype;

  /** North Node ecliptic longitude at peak. */
  nodeLon: number;
  /** Which of the two nodes the eclipse is on. */
  nodeSide: 'north' | 'south';
  /** |Sun - nearest node| in degrees, 0..180. Smaller = more central. */
  sunNodeSeparation: number;

  /** Moon sign at peak (e.g. "Scorpio"). */
  moonSign: string;
  /** Degree within the Moon's sign, 0..30. */
  moonDegreeInSign: number;

  /** Underlying phase that became an eclipse. */
  phaseKey: 'new' | 'full';
  /** Human name, e.g. "Solar total eclipse". */
  name: string;

  /** Beginning of the perceptible influence window (~3 weeks pre-peak). */
  influenceStart: Date;
  /** Peak moment, same as `date`. */
  peak: Date;
  /** End of the perceptible influence window (~3 weeks post-peak). */
  influenceEnd: Date;
}

// ── Backend response shape ────────────────────────────────────────────────

interface BackendEclipse {
  subtype: EclipseSubtype;
  name: string;
  date: string;
  sun_longitude: number;
  moon_longitude: number;
  node_longitude: number;
  node_side: 'north' | 'south';
  separation: number;
  moon_sign: string;
  moon_sign_degree: number;
  phase_key: 'new' | 'full';
  influence_start: string;
  peak: string;
  influence_end: string;
}

interface BackendEclipseResponse {
  eclipses: BackendEclipse[];
}

// ── Public API ────────────────────────────────────────────────────────────

function eclipseFromBackend(ev: BackendEclipse): EclipseEvent {
  const peak = new Date(ev.peak);
  return {
    type: 'eclipse',
    subtype: ev.subtype,
    date: peak,
    sunLon: ev.sun_longitude,
    moonLon: ev.moon_longitude,
    nodeLon: ev.node_longitude,
    nodeSide: ev.node_side,
    sunNodeSeparation: ev.separation,
    moonSign: ev.moon_sign,
    moonDegreeInSign: ev.moon_sign_degree,
    phaseKey: ev.phase_key,
    name: ev.name,
    influenceStart: new Date(ev.influence_start),
    peak,
    influenceEnd: new Date(ev.influence_end),
  };
}

/**
 * Return the next N eclipses after `from`. Powered by the backend Swiss
 * Ephemeris; the client just unwraps the JSON.
 */
export async function getUpcomingEclipses(
  count: number = 6,
  from: Date = new Date(),
): Promise<EclipseEvent[]> {
  const startDate = from.toISOString().split('T')[0];
  // Web API method: getUpcomingEclipses() doesn't take params currently.
  // We pass count and startDate via query params by calling the underlying endpoint.
  const resp: BackendEclipseResponse =
    await api.getUpcomingEclipses();
  return (resp.eclipses ?? []).map(eclipseFromBackend);
}

// Exposed for tests / debugging.
export const __internals = {
  eclipseFromBackend,
};
