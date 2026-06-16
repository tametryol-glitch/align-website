/**
 * Video filter presets — modern, TikTok-style color grades.
 *
 * Each preset has a CSS string (an APPROXIMATION for the live preview; CSS can't
 * split-tone) and a real FFmpeg filtergraph (the actual grade baked into export
 * via colorbalance / eq / hue / rgbashift / noise). The FFmpeg grade is what
 * makes each look genuinely distinct — split-toning, film mattes, chroma shifts.
 */

import type { FilterPresetId, FilterPreset } from '@/stores/videoEditorStore';

export const FILTER_PRESETS: FilterPreset[] = [
  { id: 'none', name: 'Original', css: 'none' },
  // Crisp & natural — the "no-filter filter".
  { id: 'clean', name: 'Clean', css: 'contrast(1.08) saturate(1.14)' },
  // Punchy, saturated — dance/transition videos.
  { id: 'vivid', name: 'Vivid', css: 'contrast(1.16) saturate(1.5) brightness(1.02)' },
  // Teal shadows + orange highlights — the blockbuster grade.
  { id: 'cinematic', name: 'Cinematic', css: 'contrast(1.12) saturate(1.12) sepia(0.08) hue-rotate(-6deg)' },
  // Golden-hour glow.
  { id: 'warm', name: 'Golden', css: 'sepia(0.28) saturate(1.25) brightness(1.04) contrast(1.03)' },
  // Warm pink/orange — aesthetic vlog.
  { id: 'sunset', name: 'Sunset', css: 'sepia(0.16) saturate(1.22) hue-rotate(-10deg) brightness(1.04)' },
  // Airy, clean, cool blue.
  { id: 'cool', name: 'Frost', css: 'saturate(0.96) brightness(1.04) contrast(1.05) hue-rotate(12deg)' },
  // Dark, desaturated, cool — moody/cinematic.
  { id: 'moody', name: 'Moody', css: 'contrast(1.12) saturate(0.78) brightness(0.95) hue-rotate(10deg)' },
  // Faded matte film.
  { id: 'vintage', name: 'Film', css: 'contrast(0.9) saturate(0.82) sepia(0.22) brightness(1.05)' },
  // Retro grain + chroma shift.
  { id: 'vhs', name: 'VHS', css: 'contrast(0.95) saturate(1.18) hue-rotate(-6deg) brightness(1.02)' },
  // Magenta–cyan neon — cyberpunk / night.
  { id: 'cosmic', name: 'Neon', css: 'contrast(1.2) saturate(1.35) hue-rotate(-14deg)' },
  // Soft pastel glow.
  { id: 'dreamy', name: 'Dreamy', css: 'contrast(0.9) saturate(1.06) brightness(1.08) blur(0.3px)' },
  // High-contrast mono film.
  { id: 'bw', name: 'Mono', css: 'grayscale(1) contrast(1.2) brightness(1.02)' },
];

/**
 * FFmpeg filter equivalents for export — the real grades. Multiple comma-joined
 * filters per entry are fine; they extend the export's filter chain.
 */
export const FFMPEG_FILTER_MAP: Record<FilterPresetId, string> = {
  none: '',
  clean: 'eq=contrast=1.08:saturation=1.14:gamma=0.98',
  vivid: 'eq=contrast=1.16:saturation=1.5:brightness=0.02',
  // Teal in shadows, orange in highlights.
  cinematic: 'colorbalance=rs=-0.10:bs=0.14:rh=0.14:bh=-0.10:gm=0.02,eq=contrast=1.12:saturation=1.12',
  warm: 'colorbalance=rs=0.14:gs=0.05:bs=-0.14:rh=0.08,eq=brightness=0.03:contrast=1.04:saturation=1.12',
  sunset: 'colorbalance=rs=0.13:bs=0.05:rh=0.10:bh=-0.06,eq=saturation=1.18:brightness=0.03:contrast=1.03',
  cool: 'colorbalance=rs=-0.12:gs=0.03:bs=0.14:bh=0.06,eq=brightness=0.03:contrast=1.05:saturation=0.96',
  moody: 'colorbalance=rs=-0.06:bs=0.10,eq=contrast=1.12:saturation=0.78:brightness=-0.04',
  // Lifted blacks (matte) + warm fade + light grain.
  vintage: 'colorbalance=rs=0.08:bs=-0.08:bm=-0.04,eq=contrast=0.90:saturation=0.82:brightness=0.05,noise=alls=7:allf=t',
  // Chroma fringe + grain + slight green push.
  vhs: 'rgbashift=rh=3:bh=-3,colorbalance=gs=0.05:bh=0.06:rh=-0.05,eq=contrast=0.95:saturation=1.18,noise=alls=16:allf=t',
  cosmic: 'colorbalance=rs=0.10:bs=0.14:gs=-0.06:rh=0.06:bh=0.12,eq=contrast=1.20:saturation=1.32',
  dreamy: 'colorbalance=rs=0.05:bs=0.04,eq=contrast=0.90:saturation=1.06:brightness=0.06',
  bw: 'hue=s=0,eq=contrast=1.20:brightness=0.02',
};

export function getFilterById(id: FilterPresetId): FilterPreset {
  return FILTER_PRESETS.find((f) => f.id === id) || FILTER_PRESETS[0];
}
