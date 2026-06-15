/**
 * Music library for the video editor — the royalty-free tracks already hosted
 * in the project's Supabase `cosmic-videos` bucket (mirrors the renderer's
 * align-video-renderer/src/lib/music.ts catalog). We only reference existing
 * tracks here; no audio is bundled in the app.
 */

export interface MusicTrack {
  id: string;
  name: string;
  mood: string;
  storagePath: string;
}

export const MUSIC_TRACKS: MusicTrack[] = [
  { id: 'celestial_drift', name: 'Celestial Drift', mood: 'Ethereal', storagePath: 'music/celestial_drift.mp3' },
  { id: 'cosmic_pulse', name: 'Cosmic Pulse', mood: 'Energetic', storagePath: 'music/cosmic_pulse.mp3' },
  { id: 'lunar_whisper', name: 'Lunar Whisper', mood: 'Calm', storagePath: 'music/lunar_whisper.mp3' },
  { id: 'starfire', name: 'Starfire', mood: 'Dramatic', storagePath: 'music/starfire.mp3' },
  { id: 'nebula_flow', name: 'Nebula Flow', mood: 'Chill', storagePath: 'music/nebula_flow.mp3' },
  { id: 'zodiac_beat', name: 'Zodiac Beat', mood: 'Upbeat', storagePath: 'music/zodiac_beat.mp3' },
];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

/** Public URL for a track (cosmic-videos bucket). */
export function trackUrl(track: MusicTrack): string {
  return `${SUPABASE_URL}/storage/v1/object/public/cosmic-videos/${track.storagePath}`;
}

export function trackByUrl(url: string | null): MusicTrack | undefined {
  if (!url) return undefined;
  return MUSIC_TRACKS.find((t) => url.includes(t.storagePath));
}
