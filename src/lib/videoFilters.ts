/**
 * Video filter presets — CSS values for live preview + FFmpeg
 * filter strings for export-time compositing.
 */

import type { FilterPresetId, FilterPreset } from '@/stores/videoEditorStore';

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'none',
    name: 'Original',
    css: 'none',
  },
  {
    id: 'warm',
    name: 'Warm',
    css: 'brightness(1.05) saturate(1.2) sepia(0.15)',
  },
  {
    id: 'cool',
    name: 'Cool',
    css: 'brightness(1.02) saturate(0.9) hue-rotate(10deg)',
  },
  {
    id: 'vintage',
    name: 'Vintage',
    css: 'sepia(0.4) contrast(1.1) brightness(0.95)',
  },
  {
    id: 'cosmic',
    name: 'Cosmic',
    css: 'saturate(1.4) contrast(1.15) hue-rotate(-10deg)',
  },
  {
    id: 'bw',
    name: 'B&W',
    css: 'grayscale(1) contrast(1.2)',
  },
  {
    id: 'dreamy',
    name: 'Dreamy',
    css: 'brightness(1.1) blur(0.5px) saturate(1.3)',
  },
];

/** FFmpeg filter equivalents for export. */
export const FFMPEG_FILTER_MAP: Record<FilterPresetId, string> = {
  none: '',
  warm: 'eq=brightness=0.05:saturation=1.2,colorbalance=rs=0.05:gs=0.02:bs=-0.05',
  cool: 'colorbalance=rs=-0.05:gs=0:bs=0.08',
  vintage: 'curves=vintage',
  cosmic: 'eq=contrast=1.15:saturation=1.4,hue=h=-10',
  bw: 'hue=s=0,eq=contrast=1.2',
  dreamy: 'gblur=sigma=0.5,eq=brightness=0.1:saturation=1.3',
};

export function getFilterById(id: FilterPresetId): FilterPreset {
  return FILTER_PRESETS.find((f) => f.id === id) || FILTER_PRESETS[0];
}
