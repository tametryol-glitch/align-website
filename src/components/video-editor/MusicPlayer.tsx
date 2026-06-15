'use client';

/**
 * MusicPlayer — hidden <audio> element that plays the selected background music
 * under the preview, synced to the main playhead and at the chosen volume.
 */

import { useRef, useEffect } from 'react';
import { useVideoEditorStore } from '@/stores/videoEditorStore';

export function MusicPlayer() {
  const ref = useRef<HTMLAudioElement>(null);
  const url = useVideoEditorStore((s) => s.musicTrackUrl);
  const volume = useVideoEditorStore((s) => s.musicVolume);
  const isPlaying = useVideoEditorStore((s) => s.isPlaying);
  const currentTime = useVideoEditorStore((s) => s.currentTime);
  const musicTrimStart = useVideoEditorStore((s) => s.musicTrimStart);

  useEffect(() => {
    const a = ref.current;
    if (a) a.volume = Math.max(0, Math.min(1, volume));
  }, [volume]);

  useEffect(() => {
    const a = ref.current;
    if (!a || !url) return;
    const target = musicTrimStart + currentTime;
    if (Math.abs(a.currentTime - target) > 0.3) {
      try { a.currentTime = target; } catch { /* not seekable yet */ }
    }
    if (isPlaying && a.paused) a.play().catch(() => {});
    if (!isPlaying && !a.paused) a.pause();
  }, [isPlaying, currentTime, url, musicTrimStart]);

  if (!url) return null;
  return <audio ref={ref} src={url} preload="auto" crossOrigin="anonymous" />;
}
