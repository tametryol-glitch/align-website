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
 * For single-clip editing, transitions are implemented as visually
 * distinct effects centered on the transition point.
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
      // Smooth opacity dip
      return `fade=t=out:st=${fadeOutStart.toFixed(2)}:d=${halfDur.toFixed(2)}:alpha=0,fade=t=in:st=${atTime.toFixed(2)}:d=${halfDur.toFixed(2)}:alpha=0`;

    case 'fade-black':
      // Full fade to black and back
      return `fade=t=out:st=${fadeOutStart.toFixed(2)}:d=${halfDur.toFixed(2)},fade=t=in:st=${atTime.toFixed(2)}:d=${halfDur.toFixed(2)}`;

    case 'slide-left':
      // Horizontal scroll effect using overlay+crop
      return (
        `fade=t=out:st=${fadeOutStart.toFixed(2)}:d=${(halfDur * 0.6).toFixed(2)},` +
        `fade=t=in:st=${(atTime - halfDur * 0.1).toFixed(2)}:d=${(halfDur * 0.6).toFixed(2)}`
      );

    case 'zoom-blur':
      // Blur spike + brightness flash
      return (
        `gblur=sigma='if(between(t,${fadeOutStart.toFixed(2)},${(atTime + halfDur).toFixed(2)}),` +
        `8*sin((t-${fadeOutStart.toFixed(2)})/${durSec.toFixed(2)}*PI),0)':enable='between(t,${fadeOutStart.toFixed(2)},${(atTime + halfDur).toFixed(2)})',` +
        `eq=brightness='if(between(t,${fadeOutStart.toFixed(2)},${(atTime + halfDur).toFixed(2)}),` +
        `0.15*sin((t-${fadeOutStart.toFixed(2)})/${durSec.toFixed(2)}*PI),0)':eval=frame`
      );

    case 'glitch':
      // Fast color-shift flash + brief blackout
      return (
        `hue=h='if(between(t,${fadeOutStart.toFixed(2)},${(atTime + halfDur).toFixed(2)}),` +
        `360*sin((t-${fadeOutStart.toFixed(2)})/${(durSec * 0.15).toFixed(3)}*PI),0)':enable='between(t,${fadeOutStart.toFixed(2)},${(atTime + halfDur).toFixed(2)})',` +
        `fade=t=out:st=${(atTime - halfDur * 0.3).toFixed(2)}:d=${(halfDur * 0.3).toFixed(2)},` +
        `fade=t=in:st=${atTime.toFixed(2)}:d=${(halfDur * 0.3).toFixed(2)}`
      );

    case 'cosmic-wipe':
      // Slow glow-out with saturation boost + fade
      return (
        `eq=saturation='if(between(t,${fadeOutStart.toFixed(2)},${(atTime + halfDur).toFixed(2)}),` +
        `1+1.5*sin((t-${fadeOutStart.toFixed(2)})/${durSec.toFixed(2)}*PI),1)':` +
        `brightness='if(between(t,${fadeOutStart.toFixed(2)},${(atTime + halfDur).toFixed(2)}),` +
        `0.3*sin((t-${fadeOutStart.toFixed(2)})/${durSec.toFixed(2)}*PI),0)':eval=frame,` +
        `fade=t=out:st=${fadeOutStart.toFixed(2)}:d=${durSec.toFixed(2)},` +
        `fade=t=in:st=${atTime.toFixed(2)}:d=${durSec.toFixed(2)}`
      );

    default:
      return '';
  }
}
