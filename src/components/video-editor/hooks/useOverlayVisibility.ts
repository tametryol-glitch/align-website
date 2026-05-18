'use client';

/**
 * useOverlayVisibility — drives a `visibleOverlayIds` set
 * that TextOverlayLayer and StickerOverlayLayer read to
 * show/hide overlays based on currentTime.
 *
 * Runs via rAF so it doesn't cause store churn — components
 * subscribe to the exported ref directly.
 */

import { useEffect, useRef } from 'react';
import { useVideoEditorStore } from '@/stores/videoEditorStore';

/** Global set of currently visible overlay IDs (read by overlay layers). */
export const visibleOverlayIds = new Set<string>();

export function useOverlayVisibility() {
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const tick = () => {
      const state = useVideoEditorStore.getState();
      const t = state.currentTime;

      visibleOverlayIds.clear();

      for (const overlay of state.textOverlays) {
        if (t >= overlay.startTime && t <= overlay.endTime) {
          visibleOverlayIds.add(overlay.id);
        }
      }

      for (const sticker of state.stickerOverlays) {
        if (t >= sticker.startTime && t <= sticker.endTime) {
          visibleOverlayIds.add(sticker.id);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
}
