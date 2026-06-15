'use client';

/**
 * useVideoPlayback — syncs the <video> element with the Zustand store.
 *
 * - Updates store.currentTime via rAF during playback
 * - Enforces trim range (pauses at trimEnd, resets to trimStart)
 * - Responds to store.isPlaying changes from external controls
 */

import { useEffect, useRef } from 'react';
import { useVideoEditorStore } from '@/stores/videoEditorStore';

export function useVideoPlayback(
  videoRef: React.RefObject<HTMLVideoElement | null>,
) {
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const tick = () => {
      if (!vid.paused && !vid.ended) {
        const state = useVideoEditorStore.getState();
        const t = vid.currentTime;

        // Enforce trim boundary
        if (t >= state.trimEnd) {
          if (state.loopPlayback) {
            // Loop: jump back to trim start and keep playing
            vid.currentTime = state.trimStart;
            useVideoEditorStore.getState().setCurrentTime(state.trimStart);
          } else {
            vid.pause();
            vid.currentTime = state.trimStart;
            useVideoEditorStore.getState().setIsPlaying(false);
            useVideoEditorStore.getState().setCurrentTime(state.trimStart);
          }
          return;
        }

        // Only update if changed (avoid unnecessary re-renders)
        if (Math.abs(t - lastTimeRef.current) > 0.03) {
          lastTimeRef.current = t;
          useVideoEditorStore.getState().setCurrentTime(t);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [videoRef]);

  // Seek the <video> when currentTime is changed EXTERNALLY (timeline click /
  // playhead drag). During playback the rAF tick keeps store≈video within
  // ~0.03s, so a larger gap means a real seek the user asked for — apply it.
  useEffect(() => {
    const unsubscribe = useVideoEditorStore.subscribe((state, prev) => {
      const vid = videoRef.current;
      if (!vid) return;
      if (state.currentTime !== prev.currentTime &&
          Math.abs(vid.currentTime - state.currentTime) > 0.2) {
        vid.currentTime = state.currentTime;
      }
    });
    return unsubscribe;
  }, [videoRef]);

  // Sync volume and playback speed with store
  useEffect(() => {
    const unsubscribe = useVideoEditorStore.subscribe(
      (state) => {
        const vid = videoRef.current;
        if (vid) {
          vid.volume = state.originalAudioVolume;
          if (vid.playbackRate !== state.playbackSpeed) {
            vid.playbackRate = state.playbackSpeed;
          }
        }
      },
    );
    return unsubscribe;
  }, [videoRef]);
}
