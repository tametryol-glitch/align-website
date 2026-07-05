/**
 * Zodisphere sky — the "cosmos over a place, right now" reading.
 *
 * Composes existing, proven Align engines (no new astro math, no user
 * chart, no network): the current Moon state and the location-specific
 * planetary hour. This is what makes the globe valuable to a SOLO user
 * with zero community around them — tap anywhere and read the live sky.
 */

import { getCurrentMoonState } from './moonPhases/currentMoonService';
import { getLiveCurrentHour, RULER_MEANINGS } from './planetaryHours';

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const SIGN_GLYPH: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

function signFromLon(lon: number): string {
  const n = ((lon % 360) + 360) % 360;
  return SIGNS[Math.floor(n / 30)] ?? 'Aries';
}

export function signGlyph(sign: string): string {
  return SIGN_GLYPH[sign] ?? '';
}

export interface SkyReading {
  moon: { phase: string; emoji: string; illumination: number; waxing: boolean; sign: string };
  sun: { sign: string };
  /** Planetary hour is LOCATION-SPECIFIC — this is the per-place hook. */
  hour: { planet: string; glyph: string; essence: string; keywords: string; color: string } | null;
}

/** Global sky (moon + sun) — same everywhere; safe to show without a place. */
export function getGlobalSky(): Pick<SkyReading, 'moon' | 'sun'> {
  const m = getCurrentMoonState();
  return {
    moon: {
      phase: m.phase.name,
      emoji: m.phase.emoji,
      illumination: Math.round(m.illumination * 100),
      waxing: m.waxing,
      sign: m.moonSign,
    },
    sun: { sign: signFromLon(m.sunLon) },
  };
}

/** Full reading for a specific place — adds the local planetary hour. */
export function getSkyOverPlace(lat: number, lng: number): SkyReading {
  const base = getGlobalSky();
  let hour: SkyReading['hour'] = null;
  try {
    const slot = getLiveCurrentHour(lat, lng);
    if (slot) {
      const meaning = RULER_MEANINGS[slot.planet];
      if (meaning) {
        hour = {
          planet: slot.planet,
          glyph: meaning.glyph,
          essence: meaning.essence,
          keywords: meaning.keywords,
          color: meaning.color,
        };
      }
    }
  } catch {
    hour = null; // never let an astro edge-case break the panel
  }
  return { ...base, hour };
}
