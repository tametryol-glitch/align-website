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
  // Glossy, hyper-saturated cyan/magenta — Y2K aesthetic.
  { id: 'y2k', name: 'Y2K', css: 'contrast(1.18) saturate(1.4) hue-rotate(-8deg) brightness(1.03)' },
  // Teal shadows + orange highlights — the blockbuster grade.
  { id: 'cinematic', name: 'Cinematic', css: 'contrast(1.12) saturate(1.12) sepia(0.08) hue-rotate(-6deg)' },
  // Desaturated, silvery, high-contrast — bleach bypass.
  { id: 'bleach', name: 'Bleach', css: 'saturate(0.55) contrast(1.35) brightness(1.02)' },
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
  // Earthy muted green — faded "moss" look.
  { id: 'moss', name: 'Moss', css: 'saturate(0.85) contrast(0.95) sepia(0.12) hue-rotate(25deg) brightness(1.02)' },
  // Magenta–cyan neon — cyberpunk / night.
  { id: 'cosmic', name: 'Neon', css: 'contrast(1.2) saturate(1.35) hue-rotate(-14deg)' },
  // Surreal pink foliage — aerochrome / infrared.
  { id: 'infrared', name: 'Infrared', css: 'saturate(1.3) hue-rotate(-25deg) contrast(1.08)' },
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
  // Glossy hyper-sat with a cyan/magenta push.
  y2k: 'colorbalance=rs=0.04:bs=0.08:rh=-0.04:bh=0.06,eq=contrast=1.18:saturation=1.40:brightness=0.02',
  // Teal in shadows, orange in highlights.
  cinematic: 'colorbalance=rs=-0.10:bs=0.14:rh=0.14:bh=-0.10:gm=0.02,eq=contrast=1.12:saturation=1.12',
  // Desaturated + high contrast + cool — silvery.
  bleach: 'eq=saturation=0.55:contrast=1.35:brightness=0.02,colorbalance=bs=0.04',
  warm: 'colorbalance=rs=0.14:gs=0.05:bs=-0.14:rh=0.08,eq=brightness=0.03:contrast=1.04:saturation=1.12',
  sunset: 'colorbalance=rs=0.13:bs=0.05:rh=0.10:bh=-0.06,eq=saturation=1.18:brightness=0.03:contrast=1.03',
  cool: 'colorbalance=rs=-0.12:gs=0.03:bs=0.14:bh=0.06,eq=brightness=0.03:contrast=1.05:saturation=0.96',
  moody: 'colorbalance=rs=-0.06:bs=0.10,eq=contrast=1.12:saturation=0.78:brightness=-0.04',
  // Lifted blacks (matte) + warm fade + light grain.
  vintage: 'colorbalance=rs=0.08:bs=-0.08:bm=-0.04,eq=contrast=0.90:saturation=0.82:brightness=0.05,noise=alls=7:allf=t',
  // Chroma fringe + grain + slight green push.
  vhs: 'rgbashift=rh=3:bh=-3,colorbalance=gs=0.05:bh=0.06:rh=-0.05,eq=contrast=0.95:saturation=1.18,noise=alls=16:allf=t',
  // Earthy green-yellow push + faded.
  moss: 'colorbalance=gs=0.08:rs=-0.04:bs=-0.05:gm=0.05,eq=contrast=0.95:saturation=0.85:brightness=0.03',
  cosmic: 'colorbalance=rs=0.10:bs=0.14:gs=-0.06:rh=0.06:bh=0.12,eq=contrast=1.20:saturation=1.32',
  // Strong pink/magenta push — aerochrome.
  infrared: 'colorbalance=rs=0.18:bs=0.10:gs=-0.10:rh=0.12:gh=-0.06,eq=saturation=1.30:contrast=1.08',
  dreamy: 'colorbalance=rs=0.05:bs=0.04,eq=contrast=0.90:saturation=1.06:brightness=0.06',
  bw: 'hue=s=0,eq=contrast=1.20:brightness=0.02',
};

export function getFilterById(id: FilterPresetId): FilterPreset {
  return FILTER_PRESETS.find((f) => f.id === id) || FILTER_PRESETS[0];
}

// ── Intensity scaling ─────────────────────────────────────────
// "Intensity" lerps every grade parameter toward its no-op identity, so the
// slider genuinely dials a look up/down (preview + export stay in sync).

function trimNum(n: number): string {
  return (n.toFixed(3).replace(/\.?0+$/, '') || '0');
}

const CSS_IDENTITY: Record<string, number> = {
  contrast: 1, saturate: 1, brightness: 1, opacity: 1,
  sepia: 0, grayscale: 0, invert: 0, 'hue-rotate': 0, blur: 0,
};

/** Scale a CSS filter string toward identity by intensity (0–1). */
export function scaleCssFilter(css: string, intensity: number): string {
  if (!css || css === 'none') return '';
  const i = Math.max(0, Math.min(1, intensity));
  if (i >= 0.999) return css;
  return css.replace(/([\w-]+)\(([^)]+)\)/g, (m, fn: string, val: string) => {
    const num = parseFloat(val);
    if (Number.isNaN(num)) return m;
    const unit = val.trim().replace(/^-?[\d.]+/, ''); // deg | px | ''
    const id = CSS_IDENTITY[fn] ?? 1;
    return `${fn}(${trimNum(id + (num - id) * i)}${unit})`;
  });
}

// Per-filter parameter identities (the value at which the param does nothing).
const FF_IDENTITY: Record<string, Record<string, number>> = {
  eq: { contrast: 1, saturation: 1, gamma: 1, brightness: 0 },
  colorbalance: { rs: 0, gs: 0, bs: 0, rm: 0, gm: 0, bm: 0, rh: 0, gh: 0, bh: 0 },
  hue: { s: 1, h: 0, H: 0, b: 0 },
  noise: { alls: 0, c0s: 0, c1s: 0, c2s: 0, c3s: 0 },
  rgbashift: { rh: 0, gh: 0, bh: 0, rv: 0, gv: 0, bv: 0 },
};

/** Scale an FFmpeg grade (comma-joined filters) toward identity by intensity. */
export function scaleFfmpegGrade(grade: string, intensity: number): string {
  const i = Math.max(0, Math.min(1, intensity));
  if (!grade || i >= 0.999) return grade;
  return grade.split(',').map((f) => {
    const eq = f.indexOf('=');
    if (eq < 0) return f;
    const name = f.slice(0, eq);
    const idmap = FF_IDENTITY[name];
    if (!idmap) return f;
    const scaled = f.slice(eq + 1).split(':').map((kv) => {
      const e = kv.indexOf('=');
      if (e < 0) return kv;
      const k = kv.slice(0, e);
      const id = idmap[k];
      const v = parseFloat(kv.slice(e + 1));
      if (id === undefined || Number.isNaN(v)) return kv; // unknown key or flag
      const s = id + (v - id) * i;
      return `${k}=${name === 'rgbashift' || name === 'noise' ? String(Math.round(s)) : trimNum(s)}`;
    });
    return `${name}=${scaled.join(':')}`;
  }).join(',');
}
