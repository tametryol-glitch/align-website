/**
 * Photo editing for feed posts and stories: filters, adjustments, rotation,
 * text, stickers and drawing — previewed live with CSS and baked into a JPEG
 * with a canvas when the person taps Done.
 *
 * Canvas `ctx.filter` isn't supported in Safari, so the export applies the
 * colour work pixel by pixel using the same formulas as the CSS filter
 * functions (Filter Effects spec), in the same order. Tints are a solid
 * colour layer blended with `soft-light`, which CSS (mix-blend-mode) and
 * canvas (globalCompositeOperation) both implement identically.
 */

export interface ColorOps {
  brightness: number; // 1 = unchanged
  contrast: number;
  saturate: number;
  sepia: number;      // 0..1
  grayscale: number;  // 0..1
  tint?: { color: string; alpha: number };
}

export interface FilterPreset {
  id: string;
  label: string;
  ops: ColorOps;
}

const BASE: ColorOps = { brightness: 1, contrast: 1, saturate: 1, sepia: 0, grayscale: 0 };

export const FILTER_PRESETS: FilterPreset[] = [
  { id: 'original', label: 'Original', ops: { ...BASE } },
  { id: 'vivid',    label: 'Vivid',    ops: { ...BASE, saturate: 1.35, contrast: 1.1 } },
  { id: 'warm',     label: 'Warm',     ops: { ...BASE, saturate: 1.1, tint: { color: '#FF9A3C', alpha: 0.35 } } },
  { id: 'cool',     label: 'Cool',     ops: { ...BASE, tint: { color: '#3C8CFF', alpha: 0.35 } } },
  { id: 'cosmic',   label: 'Cosmic',   ops: { ...BASE, contrast: 1.05, tint: { color: '#8B5CF6', alpha: 0.45 } } },
  { id: 'rose',     label: 'Rose',     ops: { ...BASE, tint: { color: '#FF5FA2', alpha: 0.35 } } },
  { id: 'golden',   label: 'Golden',   ops: { ...BASE, sepia: 0.25, tint: { color: '#FFC857', alpha: 0.3 } } },
  { id: 'dusk',     label: 'Dusk',     ops: { ...BASE, brightness: 0.92, contrast: 1.05, tint: { color: '#FF6B6B', alpha: 0.3 } } },
  { id: 'fade',     label: 'Fade',     ops: { ...BASE, brightness: 1.08, contrast: 0.85, saturate: 0.8 } },
  { id: 'noir',     label: 'Noir',     ops: { ...BASE, grayscale: 1, contrast: 1.2 } },
];

export interface Adjustments {
  brightness: number; // -50..50
  contrast: number;
  saturation: number;
}

export const NO_ADJUST: Adjustments = { brightness: 0, contrast: 0, saturation: 0 };

/** Preset + sliders → one set of colour operations. */
export function combineOps(preset: ColorOps, adj: Adjustments): ColorOps {
  return {
    ...preset,
    brightness: preset.brightness * (1 + adj.brightness / 100),
    contrast: preset.contrast * (1 + adj.contrast / 100),
    saturate: preset.saturate * (1 + adj.saturation / 100),
  };
}

/** CSS `filter` string for the live preview (same order as applyColorOps). */
export function cssFilter(ops: ColorOps): string {
  const parts: string[] = [];
  if (ops.brightness !== 1) parts.push(`brightness(${ops.brightness})`);
  if (ops.contrast !== 1) parts.push(`contrast(${ops.contrast})`);
  if (ops.saturate !== 1) parts.push(`saturate(${ops.saturate})`);
  if (ops.sepia > 0) parts.push(`sepia(${ops.sepia})`);
  if (ops.grayscale > 0) parts.push(`grayscale(${ops.grayscale})`);
  return parts.join(' ') || 'none';
}

export function isIdentity(ops: ColorOps): boolean {
  return ops.brightness === 1 && ops.contrast === 1 && ops.saturate === 1 && !ops.sepia && !ops.grayscale && !ops.tint;
}

type M3 = [number, number, number, number, number, number, number, number, number];

function saturateMatrix(s: number): M3 {
  return [
    0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s,
    0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s,
    0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s,
  ];
}

function sepiaMatrix(a: number): M3 {
  const k = 1 - a;
  return [
    0.393 + 0.607 * k, 0.769 - 0.769 * k, 0.189 - 0.189 * k,
    0.349 - 0.349 * k, 0.686 + 0.314 * k, 0.168 - 0.168 * k,
    0.272 - 0.272 * k, 0.534 - 0.534 * k, 0.131 + 0.869 * k,
  ];
}

function grayscaleMatrix(a: number): M3 {
  const k = 1 - a;
  return [
    0.2126 + 0.7874 * k, 0.7152 - 0.7152 * k, 0.0722 - 0.0722 * k,
    0.2126 - 0.2126 * k, 0.7152 + 0.2848 * k, 0.0722 - 0.0722 * k,
    0.2126 - 0.2126 * k, 0.7152 - 0.7152 * k, 0.0722 + 0.9278 * k,
  ];
}

/** Apply brightness → contrast → saturate → sepia → grayscale in place. */
export function applyColorOps(data: Uint8ClampedArray, ops: ColorOps): void {
  const b = ops.brightness;
  const c = ops.contrast;
  const mats: M3[] = [];
  if (ops.saturate !== 1) mats.push(saturateMatrix(ops.saturate));
  if (ops.sepia > 0) mats.push(sepiaMatrix(ops.sepia));
  if (ops.grayscale > 0) mats.push(grayscaleMatrix(ops.grayscale));
  const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i] / 255, g = data[i + 1] / 255, bl = data[i + 2] / 255;
    if (b !== 1) { r = clamp(r * b); g = clamp(g * b); bl = clamp(bl * b); }
    if (c !== 1) {
      r = clamp((r - 0.5) * c + 0.5);
      g = clamp((g - 0.5) * c + 0.5);
      bl = clamp((bl - 0.5) * c + 0.5);
    }
    for (const m of mats) {
      const nr = m[0] * r + m[1] * g + m[2] * bl;
      const ng = m[3] * r + m[4] * g + m[5] * bl;
      const nb = m[6] * r + m[7] * g + m[8] * bl;
      r = clamp(nr); g = clamp(ng); bl = clamp(nb);
    }
    data[i] = r * 255; data[i + 1] = g * 255; data[i + 2] = bl * 255;
  }
}

// ── Overlays ────────────────────────────────────────────────────────────────
// Positions are fractions of the (rotated) picture, so the same numbers work
// on the small preview and the full-size export.

export interface TextOverlay {
  id: string;
  kind: 'text';
  text: string;
  x: number;
  y: number;
  scale: number;
  color: string;
  /** Solid pill behind the text (TikTok "background" style). */
  pill: boolean;
}

export interface StickerOverlay {
  id: string;
  kind: 'sticker';
  emoji: string;
  x: number;
  y: number;
  scale: number;
}

export type Overlay = TextOverlay | StickerOverlay;

export interface Stroke {
  color: string;
  /** Line width as a fraction of the picture width. */
  width: number;
  points: [number, number][];
}

/** Font size as a fraction of the picture width. */
export const TEXT_SIZE = 0.065;
export const STICKER_SIZE = 0.14;

export const EDIT_COLORS = ['#FFFFFF', '#000000', '#F43F5E', '#F59E0B', '#FACC15', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899'];

export const STICKERS = [
  '✨', '🌙', '⭐', '🌟', '☀️', '🪐', '🔮', '💫', '🌌', '☄️',
  '❤️', '💜', '🔥', '😍', '🥰', '😂', '😎', '🙌', '👏', '💯',
  '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓',
  '🌸', '🌈', '🦋', '🌊', '🍀', '🎉', '👑', '💎',
];

/** Readable text colour on a pill of the given colour. */
export function pillTextColor(bg: string): string {
  const h = bg.replace('#', '');
  if (h.length !== 6) return '#000000';
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) > 160 ? '#000000' : '#FFFFFF';
}

// ── Export ──────────────────────────────────────────────────────────────────

export interface EditState {
  rotation: 0 | 90 | 180 | 270;
  ops: ColorOps;
  overlays: Overlay[];
  strokes: Stroke[];
}

export function hasEdits(s: EditState): boolean {
  return s.rotation !== 0 || !isIdentity(s.ops) || s.overlays.length > 0 || s.strokes.length > 0;
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Draw a text overlay centred on (cx, cy); used by the export only. */
function drawText(ctx: CanvasRenderingContext2D, o: TextOverlay, W: number, cx: number, cy: number, fontFamily: string) {
  const size = TEXT_SIZE * W * o.scale;
  ctx.font = `700 ${size}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = o.text.split('\n');
  const lineH = size * 1.25;
  const widths = lines.map((l) => ctx.measureText(l).width);
  const boxW = Math.max(...widths) + size * 0.8;
  const boxH = lineH * lines.length + size * 0.35;
  const top = cy - boxH / 2;

  if (o.pill) {
    ctx.fillStyle = o.color;
    roundRectPath(ctx, cx - boxW / 2, top, boxW, boxH, size * 0.35);
    ctx.fill();
  }
  ctx.fillStyle = o.pill ? pillTextColor(o.color) : o.color;
  if (!o.pill) {
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = size * 0.12;
  }
  lines.forEach((l, i) => {
    ctx.fillText(l, cx, top + size * 0.175 + lineH * (i + 0.5));
  });
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

/**
 * Render the finished photo. Long side is capped (default 2160px) to keep
 * uploads quick; returns a JPEG File named after the original.
 */
export async function exportEditedImage(
  source: HTMLImageElement,
  state: EditState,
  fileName: string,
  maxSide = 2160,
): Promise<File> {
  const nw = source.naturalWidth, nh = source.naturalHeight;
  const sideways = state.rotation === 90 || state.rotation === 270;
  const rw = sideways ? nh : nw, rh = sideways ? nw : nh;
  const k = Math.min(1, maxSide / Math.max(rw, rh));
  const W = Math.round(rw * k), H = Math.round(rh * k);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  // 1. Photo, rotated.
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate((state.rotation * Math.PI) / 180);
  const dw = nw * k, dh = nh * k;
  ctx.drawImage(source, -dw / 2, -dh / 2, dw, dh);
  ctx.restore();

  // 2. Colour work, then the tint layer.
  if (!isIdentity({ ...state.ops, tint: undefined })) {
    const img = ctx.getImageData(0, 0, W, H);
    applyColorOps(img.data, state.ops);
    ctx.putImageData(img, 0, 0);
  }
  if (state.ops.tint) {
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = state.ops.tint.alpha;
    ctx.fillStyle = state.ops.tint.color;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // 3. Drawing.
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const s of state.strokes) {
    if (s.points.length === 0) continue;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.width * W;
    ctx.beginPath();
    ctx.moveTo(s.points[0][0] * W, s.points[0][1] * H);
    for (const [x, y] of s.points.slice(1)) ctx.lineTo(x * W, y * H);
    if (s.points.length === 1) ctx.lineTo(s.points[0][0] * W + 0.1, s.points[0][1] * H);
    ctx.stroke();
  }

  // 4. Text and stickers, in stacking order.
  const fontFamily = getComputedStyle(document.body).fontFamily || 'sans-serif';
  for (const o of state.overlays) {
    const cx = o.x * W, cy = o.y * H;
    if (o.kind === 'text') {
      drawText(ctx, o, W, cx, cy, fontFamily);
    } else {
      const size = STICKER_SIZE * W * o.scale;
      ctx.font = `${size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(o.emoji, cx, cy);
    }
  }

  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not save the photo'))), 'image/jpeg', 0.9),
  );
  const base = fileName.replace(/\.[^.]+$/, '') || 'photo';
  return new File([blob], `${base}-edited.jpg`, { type: 'image/jpeg' });
}
