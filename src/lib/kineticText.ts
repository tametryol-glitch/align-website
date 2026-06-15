/**
 * kineticText — builds FFmpeg `drawtext` filter strings that animate text over
 * time (fade, slide, scale, bounce, word-by-word pop, typewriter, karaoke).
 *
 * Motion is expressed with drawtext's time-aware `alpha`/`x`/`y` expressions, so
 * it renders into the exported MP4 — not just the live preview. The filtergraph
 * sees SOURCE time `t` in single-clip export (output-side -ss keeps timestamps),
 * so windows/timings use the overlay's raw start/end seconds. Callers must only
 * use this in non-segment mode; segment (concat) mode re-bases time and should
 * fall back to a static draw.
 *
 * Word-level presets measure each word's pixel width on a canvas (sans-serif,
 * matching FFmpeg's default Sans closely enough for a centered single line) to
 * lay the words out, then emit one drawtext per word.
 */

import type { TextOverlay } from '@/stores/videoEditorStore';

export interface KineticTextArgs {
  animation: TextOverlay['animation'];
  text: string;            // raw text (unescaped)
  color: string;           // #RRGGBB
  font: string;            // mapped FFmpeg font name (Sans/Serif/Mono)
  fontSize: number;        // already scaled to video height (px)
  xc: number;              // horizontal center (px)
  yc: number;              // vertical center (px)
  t0: number;              // start time (s)
  t1: number;              // end time (s)
  enableInner: string;     // e.g. between(t,2.00,5.00) — no surrounding quotes
  extras: string;          // ':shadow…:box…:border…' suffix appended to each draw
  escape: (s: string) => string;
}

const HIGHLIGHT = '#FFD60A'; // karaoke active-word color

let measureCanvas: HTMLCanvasElement | null = null;

function measure(words: string[], fontPx: number): { widths: number[]; space: number } {
  if (typeof document === 'undefined') {
    // SSR fallback — rough estimate (export always runs client-side anyway).
    return { widths: words.map((w) => w.length * fontPx * 0.55), space: fontPx * 0.3 };
  }
  if (!measureCanvas) measureCanvas = document.createElement('canvas');
  const ctx = measureCanvas.getContext('2d');
  if (!ctx) return { widths: words.map((w) => w.length * fontPx * 0.55), space: fontPx * 0.3 };
  ctx.font = `${fontPx}px sans-serif`;
  return { widths: words.map((w) => ctx.measureText(w).width), space: ctx.measureText(' ').width };
}

/** Returns one or more drawtext filter strings implementing the animation. */
export function buildKineticTextFilters(a: KineticTextArgs): string[] {
  const { color, font, fontSize, xc, yc, t0, t1, enableInner, extras, escape } = a;
  const xcI = Math.round(xc);
  const ycI = Math.round(yc);

  const draw = (
    textEsc: string,
    opts: { x: string; y: string; alpha?: string; color?: string; enable?: string },
  ): string =>
    `drawtext=text='${textEsc}'` +
    `:fontsize=${fontSize}` +
    `:fontcolor=${opts.color ?? color}` +
    `:font=${font}` +
    // x/y are single-quoted because the motion expressions contain commas
    // (max/min/if), which would otherwise be read as filter separators.
    `:x='${opts.x}'` +
    `:y='${opts.y}'` +
    (opts.alpha ? `:alpha='${opts.alpha}'` : '') +
    `:enable='${opts.enable ?? enableInner}'` +
    extras;

  // ── Word-level presets ──────────────────────────────────────
  if (a.animation === 'word-pop' || a.animation === 'typewriter' || a.animation === 'karaoke') {
    const words = a.text.split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];
    const { widths, space } = measure(words, fontSize);
    const total = widths.reduce((s, w) => s + w, 0) + space * (words.length - 1);
    let cursor = xc - total / 2;
    const lefts = widths.map((w) => { const l = cursor; cursor += w + space; return Math.round(l); });
    const yCenter = `${ycI}-(th/2)`;

    if (a.animation === 'karaoke') {
      const slice = Math.max(0.15, (t1 - t0) / words.length);
      const base = words.map((w, i) =>
        draw(escape(w), {
          x: `${lefts[i]}`,
          y: yCenter,
          alpha: `min(1,(t-${t0.toFixed(2)})/0.25)`,
        }),
      );
      const hi = words.map((w, i) => {
        const ws = (t0 + i * slice).toFixed(2);
        const we = (t0 + (i + 1) * slice).toFixed(2);
        return draw(escape(w), {
          x: `${lefts[i]}`,
          y: `${ycI}-(th/2)-6`,
          color: HIGHLIGHT,
          enable: `between(t,${ws},${we})`,
        });
      });
      return [...base, ...hi];
    }

    // word-pop & typewriter — words appear in sequence
    const stagger = a.animation === 'typewriter' ? 0.16 : 0.12;
    return words.map((w, i) => {
      const at = (t0 + i * stagger).toFixed(2);
      const alpha =
        a.animation === 'typewriter'
          ? `if(lt(t,${at}),0,1)`
          : `if(lt(t,${at}),0,min(1,(t-${at})/0.18))`;
      const y =
        a.animation === 'typewriter'
          ? yCenter
          : `${ycI}-(th/2)-14*max(0,1-(t-${at})/0.18)`;
      return draw(escape(w), { x: `${lefts[i]}`, y, alpha });
    });
  }

  // ── Line-level presets ──────────────────────────────────────
  const textEsc = escape(a.text);
  const xLine = `${xcI}-(tw/2)`;
  const t0s = t0.toFixed(2);
  const t1s = t1.toFixed(2);

  switch (a.animation) {
    case 'fade':
      return [draw(textEsc, {
        x: xLine,
        y: `${ycI}-(th/2)`,
        alpha: `max(0,min(1,min((t-${t0s})/0.3,(${t1s}-t)/0.3)))`,
      })];
    case 'slide':
      return [draw(textEsc, {
        x: xLine,
        y: `${ycI}-(th/2)+45*max(0,1-(t-${t0s})/0.4)`,
        alpha: `min(1,(t-${t0s})/0.4)`,
      })];
    case 'scale':
      // drawtext can't animate fontsize; approximate the pop with a quick rise + fade.
      return [draw(textEsc, {
        x: xLine,
        y: `${ycI}-(th/2)-10*max(0,1-(t-${t0s})/0.25)`,
        alpha: `min(1,(t-${t0s})/0.25)`,
      })];
    case 'bounce':
      return [draw(textEsc, {
        x: xLine,
        y: `${ycI}-(th/2)-40*exp(-4*(t-${t0s}))*sin(9*(t-${t0s}))`,
        alpha: `min(1,(t-${t0s})/0.2)`,
      })];
    default:
      return [draw(textEsc, { x: xLine, y: `${ycI}-(th/2)` })];
  }
}
