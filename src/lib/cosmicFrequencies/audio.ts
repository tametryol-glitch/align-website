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
