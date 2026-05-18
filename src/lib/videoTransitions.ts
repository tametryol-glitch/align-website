/**
 * Video transition definitions — CSS animations for preview +
 * FFmpeg filter strings for export.
 */

export interface TransitionDef {
  id: string;
  name: string;
  emoji: string;
  /** Default duration in ms */
  defaultDurationMs: number;
}

export const TRANSITION_TYPES: TransitionDef[] = [
  { id: 'crossfade', name: 'Crossfade', emoji: '🔄', defaultDurationMs: 800 },
  { id: 'fade-black', name: 'Fade to Black', emoji: '🌑', defaultDurationMs: 600 },
  { id: 'slide-left', name: 'Slide Left', emoji: '👈', defaultDurationMs: 500 },
  { id: 'zoom-blur', name: 'Zoom Blur', emoji: '🔍', defaultDurationMs: 700 },
  { id: 'glitch', name: 'Glitch Flash', emoji: '📺', defaultDurationMs: 400 },
  { id: 'cosmic-wipe', name: 'Cosmic Wipe', emoji: '✨', defaultDurationMs: 1000 },
];

/**
 * Build an FFmpeg filter expression for a transition at a given time.
 * For single-clip editing, transitions are implemented as fade-out + fade-in
 * centered on the transition point.
 */
export function buildTransitionFFmpegFilter(
  type: string,
  atTime: number,
  durationMs: number,
): string {
  const durSec = durationMs / 1000;
  const halfDur = durSec / 2;
  const fadeOutStart = atTime - halfDur;

  switch (type) {
    case 'crossfade':
    case 'fade-black':
      return `fade=t=out:st=${fadeOutStart.toFixed(2)}:d=${halfDur.toFixed(2)},fade=t=in:st=${atTime.toFixed(2)}:d=${halfDur.toFixed(2)}`;
    case 'slide-left':
      // Approximate with a quick fade
      return `fade=t=out:st=${fadeOutStart.toFixed(2)}:d=${halfDur.toFixed(2)},fade=t=in:st=${atTime.toFixed(2)}:d=${halfDur.toFixed(2)}`;
    case 'zoom-blur':
      return `fade=t=out:st=${fadeOutStart.toFixed(2)}:d=${halfDur.toFixed(2)},fade=t=in:st=${atTime.toFixed(2)}:d=${halfDur.toFixed(2)}`;
    case 'glitch':
      return `fade=t=out:st=${fadeOutStart.toFixed(2)}:d=${(halfDur * 0.5).toFixed(2)},fade=t=in:st=${atTime.toFixed(2)}:d=${(halfDur * 0.5).toFixed(2)}`;
    case 'cosmic-wipe':
      return `fade=t=out:st=${fadeOutStart.toFixed(2)}:d=${durSec.toFixed(2)},fade=t=in:st=${atTime.toFixed(2)}:d=${durSec.toFixed(2)}`;
    default:
      return '';
  }
}
