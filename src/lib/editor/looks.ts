/**
 * One-tap Looks — TikTok/CapCut-style templates that apply a whole style combo
 * (colour grade + Ken Burns motion + entrance transition + effect overlays) to
 * every video clip at once. Pure preset data consumed by MultiTrackEditor.
 */

export interface Look {
  id: string;
  name: string;
  emoji: string;
  filter: string;
  filterIntensity: number;
  motion: string;
  transition: string;
  effects: string[];
}

export const LOOKS: Look[] = [
  { id: 'aesthetic', name: 'Aesthetic', emoji: '🌸', filter: 'dreamy', filterIntensity: 1, motion: 'ken-burns', transition: 'fade', effects: ['glow', 'grain'] },
  { id: 'hype', name: 'Hype', emoji: '🔥', filter: 'vivid', filterIntensity: 1, motion: 'zoom-in', transition: 'zoom', effects: ['zoompulse', 'rgbsplit'] },
  { id: 'cinematic', name: 'Cinematic', emoji: '🎬', filter: 'cinematic', filterIntensity: 1, motion: 'zoom-in', transition: 'fade-black', effects: ['vignette', 'grain'] },
  { id: 'vlog', name: 'Vlog', emoji: '📷', filter: 'clean', filterIntensity: 1, motion: 'none', transition: 'fade', effects: [] },
  { id: 'retro', name: 'Retro', emoji: '📼', filter: 'vhs', filterIntensity: 1, motion: 'pan-right', transition: 'glitch', effects: ['grain', 'dust'] },
  { id: 'night', name: 'Night', emoji: '🌌', filter: 'cosmic', filterIntensity: 1, motion: 'zoom-in', transition: 'fade', effects: ['glow', 'vignette'] },
  { id: 'golden', name: 'Golden', emoji: '☀️', filter: 'warm', filterIntensity: 1, motion: 'ken-burns', transition: 'fade', effects: ['lightleak'] },
  { id: 'mono', name: 'Mono', emoji: '🖤', filter: 'bw', filterIntensity: 1, motion: 'zoom-in', transition: 'fade-black', effects: ['grain', 'vignette'] },
];
