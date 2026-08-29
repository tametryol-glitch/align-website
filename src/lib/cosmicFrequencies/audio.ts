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

/* ── Voices ──────────────────────────────────────────────────────
   Every voice carries the whole catalog, so adding one costs a render
   and a verification pass but nothing at request time — a listener
   only ever downloads their own voice's clip.
   ────────────────────────────────────────────────────────────── */

export interface FrequencyVoice {
  id: string;
  /** English fallback; the UI prefers cosmicFrequencies.voices.<id>. */
  label: string;
}

// TEMPORARY: only af_heart is uploaded. The other seven are mid-render, and
// offering a voice whose clips 404 is worse than offering one voice. Restore
// the full list the moment the render finishes and uploads.
export const VOICES: FrequencyVoice[] = [
  { id: 'af_heart', label: 'Heart' },
];

export const DEFAULT_VOICE = 'af_heart';

const VOICE_KEY = 'align_cf_voice';

/** Remembered voice, falling back to the default when storage is unavailable. */
export function getPreferredVoice(): string {
  if (typeof window === 'undefined') return DEFAULT_VOICE;
  try {
    const v = window.localStorage.getItem(VOICE_KEY);
    return v && VOICES.some((x) => x.id === v) ? v : DEFAULT_VOICE;
  } catch {
    return DEFAULT_VOICE;
  }
}

export function setPreferredVoice(voiceId: string): void {
  try {
    window.localStorage.setItem(VOICE_KEY, voiceId);
  } catch {
    /* private mode — the choice just does not persist */
  }
}

/** Public URL for a frequency's recitation, or null if storage is unconfigured. */
export function getClipUrl(frequencyId: string, voiceId: string = DEFAULT_VOICE): string | null {
  if (!AUDIO_BASE) return null;
  return `${AUDIO_BASE}/clips/${voiceId}/${frequencyId}.mp3`;
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
  /**
   * Measured tempo, present only on beds trimmed to a whole number of bars.
   * A bed with a bpm can drive beat-synced recitation; one without is a plain
   * ambient wash. Measured with scripts/analyze-bed.py, never assumed from
   * what Suno was asked for — this track was requested at 60 and came back at
   * 59.956, which is 0.66s of drift across a 15-minute session.
   */
  bpm?: number;
  /** Bars the trimmed file contains, so the loop point is on a bar line. */
  bars?: number;
  /**
   * Voices this bed may be paired with. Omitted means any voice.
   *
   * Still Waters is reserved to Heart: it is the beat-aligned track, and the
   * pairing was chosen and checked as a pair. Every other bed is open to
   * every voice, Heart included.
   */
  voices?: string[];
}

export const BEDS: AmbientBed[] = [
  { id: 'cosmic-hum', file: 'ambient_cosmic_hum.mp3', label: 'Cosmic hum' },
  { id: 'soft-strings', file: 'ambient_soft_strings.mp3', label: 'Soft strings' },
  { id: 'choir-pad', file: 'ambient_choir_pad.mp3', label: 'Choir' },
  { id: 'crystal-bells', file: 'ambient_crystal_bells.mp3', label: 'Bells' },
  { id: 'rain', file: 'ambient_rain_light.mp3', label: 'Rain' },
  {
    id: 'still-waters',
    file: 'ambient_still_waters.mp3',
    label: 'Still waters',
    bpm: 59.956,
    bars: 36,
    voices: ['af_heart'],
  },
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

/** Beds a given voice is allowed to play under. */
export function bedsForVoice(voiceId: string): AmbientBed[] {
  return BEDS.filter((b) => !b.voices || b.voices.includes(voiceId));
}

/** Whether a bed choice is still valid after switching voice. */
export function isBedAllowed(bedId: string | null, voiceId: string): boolean {
  if (!bedId) return true; // silence is always allowed
  const bed = BEDS.find((b) => b.id === bedId);
  return !!bed && (!bed.voices || bed.voices.includes(voiceId));
}

/** Seconds per 4/4 bar for a bed's measured tempo. */
export function barSeconds(bpm: number): number {
  return (4 * 60) / bpm;
}

/**
 * When the next bar line falls, given where the bed actually is right now.
 *
 * Reading the bed's own playback position each repetition is what makes the
 * sync hold: any tempo-estimate error is corrected on the next bar instead of
 * accumulating. It only has to be right over ~4 seconds, where a 0.07% error
 * is 3ms — inaudible. Scheduling against a wall clock instead would compound
 * that same error into most of a second over a long session.
 *
 * `minLeadSeconds` skips a boundary that is too close to hit cleanly.
 */
export function secondsToNextBar(
  bedPosition: number,
  bpm: number,
  minLeadSeconds = 0.12,
): number {
  const bar = barSeconds(bpm);
  const intoBar = bedPosition % bar;
  let wait = bar - intoBar;
  if (wait < minLeadSeconds) wait += bar;
  return wait;
}

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
