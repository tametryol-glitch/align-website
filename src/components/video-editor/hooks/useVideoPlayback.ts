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
  // Which ordered segment is currently playing (segment/cut mode only).
  const segIdxRef = useRef<number>(0);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const tick = () => {
      if (!vid.paused && !vid.ended) {
        const store = useVideoEditorStore.getState();
        const t = vid.currentTime;
        const segs = store.segments;

        if (segs.length > 0) {
          // ── Segment (cut / rearrange) mode: play pieces in array order ──
          let idx = segIdxRef.current;
          if (idx >= segs.length) idx = segs.length - 1;
          const seg = segs[idx];
          if (seg && t >= seg.sourceEnd - 0.02) {
            const next = idx + 1;
            if (next < segs.length) {
              segIdxRef.current = next;
              vid.currentTime = segs[next].sourceStart;
            } else if (store.loopPlayback) {
              segIdxRef.current = 0;
              vid.currentTime = segs[0].sourceStart;
            } else {
              vid.pause();
              segIdxRef.current = 0;
              vid.currentTime = segs[0].sourceStart;
              useVideoEditorStore.getState().setIsPlaying(false);
              useVideoEditorStore.getState().setCurrentTime(segs[0].sourceStart);
            }
            rafRef.current = requestAnimationFrame(tick);
            return;
          }
          if (Math.abs(t - lastTimeRef.current) > 0.03) {
            lastTimeRef.current = t;
            useVideoEditorStore.getState().setCurrentTime(t);
          }
        } else {
          // ── Legacy single-clip mode (unchanged) ──
          if (t >= store.trimEnd) {
            if (store.loopPlayback) {
              vid.currentTime = store.trimStart;
              useVideoEditorStore.getState().setCurrentTime(store.trimStart);
            } else {
              vid.pause();
              vid.currentTime = store.trimStart;
              useVideoEditorStore.getState().setIsPlaying(false);
              useVideoEditorStore.getState().setCurrentTime(store.trimStart);
            }
            return;
          }
          if (Math.abs(t - lastTimeRef.current) > 0.03) {
            lastTimeRef.current = t;
            useVideoEditorStore.getState().setCurrentTime(t);
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [videoRef]);

  // On play-start in segment mode, lock onto the segment under the playhead so
  // playback continues from there in timeline order.
  useEffect(() => {
    const unsubscribe = useVideoEditorStore.subscribe((state, prev) => {
      if (state.isPlaying && !prev.isPlaying && state.segments.length > 0) {
        const vid = videoRef.current;
        if (!vid) return;
        const tt = vid.currentTime;
        let idx = state.segments.findIndex((g) => tt >= g.sourceStart - 0.05 && tt < g.sourceEnd);
        if (idx === -1) { idx = 0; vid.currentTime = state.segments[0].sourceStart; }
        segIdxRef.current = idx;
      }
    });
    return unsubscribe;
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
