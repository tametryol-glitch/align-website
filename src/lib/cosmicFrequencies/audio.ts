/* ──────────────────────────────────────────────────────────────
   Cosmic Frequencies — audio asset locations and session options.

   Clips are pre-rendered (Kokoro) and served from a public Supabase
   bucket. Each clip is ONE recitation with no trailing silence, so
   pacing is set here by the gap between loops rather than baked into
   the file — changing tempo never means re-rendering 259 clips.
   ────────────────────────────────────────────────────────────── */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const BUCKET = 'frequency-audio';

export const AUDIO_BASE = SUPABASE_URL
  ? `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`
  : '';

/** Public URL for a frequency's recitation, or null if storage is unconfigured. */
export function getClipUrl(frequencyId: string): string | null {
  if (!AUDIO_BASE) return null;
  return `${AUDIO_BASE}/clips/${frequencyId}.mp3`;
}

/* ── Ambient beds ────────────────────────────────────────────────
   One bed plays under any frequency — never per-code, which is what
   keeps the music budget at five files instead of 259.

   Descriptive names only. No "432 Hz", no "binaural": that wording
   turns an ambient track into a therapeutic claim.
   ────────────────────────────────────────────────────────────── */

export interface AmbientBed {
  id: string;
  file: string;
  /** English fallback; the UI prefers the i18n key cosmicFrequencies.beds.<id>. */
  label: string;
}

export const BEDS: AmbientBed[] = [
  { id: 'cosmic-hum', file: 'ambient_cosmic_hum.mp3', label: 'Cosmic hum' },
  { id: 'soft-strings', file: 'ambient_soft_strings.mp3', label: 'Soft strings' },
  { id: 'choir-pad', file: 'ambient_choir_pad.mp3', label: 'Choir' },
  { id: 'crystal-bells', file: 'ambient_crystal_bells.mp3', label: 'Bells' },
  { id: 'rain', file: 'ambient_rain_light.mp3', label: 'Rain' },
];

export function getBedUrl(file: string): string | null {
  if (!AUDIO_BASE) return null;
  return `${AUDIO_BASE}/beds/${file}`;
}

/**
 * Bed sits well under the voice. The beds measure -14.8 to -17.0 dB mean, a
 * ~3 dB spread, so a single value works for all of them.
 */
export const BED_VOLUME = 0.35;

/** Default is silence: some people want dry digits, and forcing music loses them. */
export const DEFAULT_BED: string | null = null;

export type Tempo = 'slow' | 'medium' | 'fast';

/** Milliseconds of silence between recitations. */
export const TEMPO_GAP_MS: Record<Tempo, number> = {
  slow: 3000,
  medium: 1500,
  fast: 500,
};

export const TEMPO_ORDER: Tempo[] = ['slow', 'medium', 'fast'];

/** Session lengths in minutes. A practice with a finish line, not an endless loop. */
export const SESSION_MINUTES = [3, 5, 10, 15] as const;
export type SessionMinutes = (typeof SESSION_MINUTES)[number];

export const DEFAULT_TEMPO: Tempo = 'medium';
export const DEFAULT_MINUTES: SessionMinutes = 5;

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}
