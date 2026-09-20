/**
 * Purpose Signature (web) — client for the backend Soul / Earthly Purpose
 * engine (`POST /charts/purpose-signature`).
 *
 * The backend does all the astrology: the North Node / Earth sign and
 * Whole-Sign house, every conjunction to it (planets, points, asteroids,
 * Uranian hypotheticals), the conjunctions between those bodies, the full
 * dispositor chain, and every midpoint pair within 0°–1°30′. It also returns
 * the AI system prompt and a deterministic fallback reading, so web and mobile
 * never drift apart. This file only fetches, streams and falls back.
 */

import { api } from '@/lib/api';
import { resolveTimezoneOffset } from '@/lib/timezoneOffset';

export type PurposeTarget = 'north_node' | 'earth';

export interface PurposeSignature {
  engine_version: string;
  kind: 'soul' | 'earthly';
  ai_prompt: { system: string; user: string };
  fallback_text: string;
  points_header: string;
  closer: string;
  [key: string]: any;
}

/**
 * Client fallback only. The real cache key uses the `engine_version` the
 * backend returns, so an engine change (new orbs, new voice) refreshes every
 * reading without a client release.
 */
export const PURPOSE_SIGNATURE_VERSION = 'purpose-signature-v2';

// One request per birth chart serves both cards (they mount together).
const inflight = new Map<string, Promise<Record<PurposeTarget, PurposeSignature>>>();

export function purposeBirthKey(profile: any): string {
  return `${profile.birth_date}:${profile.birth_time || '12:00'}:${profile.latitude}:${profile.longitude}`;
}

export function fetchPurposeSignatures(profile: any): Promise<Record<PurposeTarget, PurposeSignature>> {
  const key = purposeBirthKey(profile);
  const existing = inflight.get(key);
  if (existing) return existing;
  const time = profile.birth_time || '12:00';
  const { offset, label } = resolveTimezoneOffset(profile.timezone, profile.longitude, profile.birth_date, time, profile.latitude);
  const p = api.getPurposeSignature({
    name: '', date: profile.birth_date, time,
    latitude: profile.latitude, longitude: profile.longitude,
    timezone: label, tz_offset: offset, location: profile.birth_location || '',
    house_system: 'Whole Sign',
    targets: ['north_node', 'earth'],
  }) as Promise<Record<PurposeTarget, PurposeSignature>>;
  inflight.set(key, p);
  p.catch(() => inflight.delete(key));
  return p;
}

/**
 * Stream the AI reading for one signature (paid users). Free users get a 429
 * from the AI route and receive the deterministic reading instead. If the AI
 * reading lost its ten-item list (cut off or non-compliant), the fallback's
 * list is appended so the reader always gets the ten possibilities.
 */
export async function generatePurposeReading(
  sig: PurposeSignature,
  onChunk: (text: string) => void,
): Promise<string> {
  let full = '';
  try {
    await new Promise<void>((resolve, reject) => {
      api.streamAIInterpretation(
        {
          type: 'astrologer_chat',
          chart_data_text: sig.ai_prompt.system,
          messages: [{ role: 'user', content: sig.ai_prompt.user }],
          language: 'en',
        },
        (chunk: string) => { full += chunk; onChunk(full); },
        () => resolve(),
      ).catch(reject);
    });
  } catch {
    full = '';
  }
  const reading = full.trim();
  if (!reading || reading.startsWith('Error:')) return sig.fallback_text;
  if (!reading.includes(sig.points_header)) {
    const idx = sig.fallback_text.indexOf(sig.points_header);
    if (idx >= 0) return `${reading}\n\n${sig.fallback_text.slice(idx)}`;
  }
  return reading;
}
