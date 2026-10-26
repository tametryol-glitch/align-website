'use client';

import { useEffect } from 'react';
import type { AttachedMusic } from '@/lib/postMusic';

/**
 * Plays the chosen song while the camera records, from its start point. Pair
 * with useVideoRecorder({ muteMic: true }) so the song isn't picked up twice.
 */
export function useRecordingSong(recording: boolean, music: AttachedMusic | null) {
  useEffect(() => {
    if (!recording || !music) return;
    const a = new Audio(music.url);
    a.onloadedmetadata = () => { a.currentTime = music.startSec || 0; a.play().catch(() => {}); };
    return () => { a.onloadedmetadata = null; a.pause(); };
  }, [recording, music]);
}

/** Query params that hand a song to /cosmic-video/edit (empty when no song). */
export function musicEditParams(music: AttachedMusic | null): string {
  return music ? `&musicTrack=${encodeURIComponent(music.trackId)}&musicStart=${Math.max(0, Math.round((music.startSec || 0) * 100) / 100)}` : '';
}
