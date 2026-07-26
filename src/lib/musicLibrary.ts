/**
 * Audio library for the video editor.
 *
 * Tracks are managed by admins in /admin/audio and stored in the
 * `audio_tracks` table; the actual audio files live in the public
 * `cosmic-videos` bucket (music/ and sfx/ prefixes). This module fetches the
 * active catalog and exposes helpers for the editor UI.
 *
 * A small hardcoded FALLBACK list (the six original tracks) is used only if the
 * table can't be reached, so the editor never renders an empty music picker.
 */

import { createClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export interface MusicTrack {
  id: string;
  name: string;
  mood: string;
  kind: 'music' | 'sfx';
  storagePath: string;
  durationSeconds: number;
}

/** Original six tracks — fallback only, kept in sync with the DB seed. */
export const FALLBACK_TRACKS: MusicTrack[] = [
  { id: 'celestial_drift', name: 'Celestial Drift', mood: 'Ethereal', kind: 'music', storagePath: 'music/celestial_drift.mp3', durationSeconds: 60 },
  { id: 'cosmic_pulse', name: 'Cosmic Pulse', mood: 'Energetic', kind: 'music', storagePath: 'music/cosmic_pulse.mp3', durationSeconds: 60 },
  { id: 'lunar_whisper', name: 'Lunar Whisper', mood: 'Calm', kind: 'music', storagePath: 'music/lunar_whisper.mp3', durationSeconds: 60 },
  { id: 'starfire', name: 'Starfire', mood: 'Dramatic', kind: 'music', storagePath: 'music/starfire.mp3', durationSeconds: 60 },
  { id: 'nebula_flow', name: 'Nebula Flow', mood: 'Chill', kind: 'music', storagePath: 'music/nebula_flow.mp3', durationSeconds: 60 },
  { id: 'zodiac_beat', name: 'Zodiac Beat', mood: 'Upbeat', kind: 'music', storagePath: 'music/zodiac_beat.mp3', durationSeconds: 60 },
];

/** @deprecated Prefer useAudioLibrary(); kept so old imports don't break. */
export const MUSIC_TRACKS = FALLBACK_TRACKS;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

/** Public URL for a track (cosmic-videos bucket). */
export function trackUrl(track: Pick<MusicTrack, 'storagePath'>): string {
  return `${SUPABASE_URL}/storage/v1/object/public/cosmic-videos/${track.storagePath}`;
}

/** Find a track in a given list by its public URL (matches on storage path). */
export function trackByUrl(url: string | null, list: MusicTrack[] = FALLBACK_TRACKS): MusicTrack | undefined {
  if (!url) return undefined;
  return list.find((t) => url.includes(t.storagePath));
}

interface AudioRow {
  id: string;
  name: string;
  mood: string;
  kind: 'music' | 'sfx';
  storage_path: string;
  duration_seconds: number | null;
}

/** Fetch the active audio catalog from the DB (falls back to the six seeds). */
export async function fetchAudioTracks(): Promise<MusicTrack[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('audio_tracks')
      .select('id, name, mood, kind, storage_path, duration_seconds')
      .eq('is_active', true)
      .order('kind', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) return FALLBACK_TRACKS;

    return (data as AudioRow[]).map((r) => ({
      id: r.id,
      name: r.name,
      mood: r.mood || '',
      kind: r.kind,
      storagePath: r.storage_path,
      durationSeconds: r.duration_seconds || 0,
    }));
  } catch {
    return FALLBACK_TRACKS;
  }
}

/**
 * React hook: load the audio library once, split into songs and sound bites.
 * Returns the fallback list immediately so the UI never flashes empty.
 */
export function useAudioLibrary() {
  const [tracks, setTracks] = useState<MusicTrack[]>(FALLBACK_TRACKS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchAudioTracks().then((t) => {
      if (!cancelled) { setTracks(t); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, []);

  return {
    tracks,
    music: tracks.filter((t) => t.kind === 'music'),
    sfx: tracks.filter((t) => t.kind === 'sfx'),
    loading,
  };
}
