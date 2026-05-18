'use client';

/**
 * useTransitionPreview — returns a CSS style object when the playhead
 * is within a transition's time window, so the PreviewPanel can show
 * a live preview of the effect.
 */

import { useMemo } from 'react';
import { useVideoEditorStore } from '@/stores/videoEditorStore';

const TRANSITION_ANIMATIONS: Record<string, React.CSSProperties> = {
  crossfade: {
    background: 'black',
    animation: 'transitionFadeBlack var(--trans-dur) ease-in-out forwards',
  },
  'fade-black': {
    background: 'black',
    animation: 'transitionFadeBlack var(--trans-dur) ease-in-out forwards',
  },
  'slide-left': {
    background: 'black',
    animation: 'transitionSlideLeft var(--trans-dur) ease-in-out forwards',
  },
  'zoom-blur': {
    animation: 'transitionZoomBlur var(--trans-dur) ease-in-out forwards',
  },
  glitch: {
    animation: 'transitionGlitch var(--trans-dur) linear forwards',
  },
  'cosmic-wipe': {
    background: 'black',
    animation: 'transitionCosmicWipe var(--trans-dur) ease-in-out forwards',
  },
};

export function useTransitionPreview(): React.CSSProperties | null {
  const currentTime = useVideoEditorStore((s) => s.currentTime);
  const transitions = useVideoEditorStore((s) => s.transitions);

  return useMemo(() => {
    for (const trans of transitions) {
      const durSec = trans.durationMs / 1000;
      const halfDur = durSec / 2;
      const start = trans.atTime - halfDur;
      const end = trans.atTime + halfDur;

      if (currentTime >= start && currentTime <= end) {
        const baseStyle = TRANSITION_ANIMATIONS[trans.type];
        if (!baseStyle) return null;

        return {
          ...baseStyle,
          // CSS custom property for dynamic duration
          ['--trans-dur' as string]: `${durSec}s`,
        } as React.CSSProperties;
      }
    }
    return null;
  }, [currentTime, transitions]);
}
