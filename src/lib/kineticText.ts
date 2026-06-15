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
  maxWidth: number;        // wrap width (px) — long captions wrap to multiple lines
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
  const { color, font, fontSize, xc, yc, maxWidth, t0, t1, enableInner, extras, escape } = a;
  const xcI = Math.round(xc);
  const t0s = t0.toFixed(2);
  const t1s = t1.toFixed(2);

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

  // ── Word-wrap into lines that fit maxWidth ───────────────────
  const words = a.text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const { widths, space } = measure(words, fontSize);
  const lines: { idxs: number[]; width: number }[] = [];
  let cur: { idxs: number[]; width: number } = { idxs: [], width: 0 };
  for (let i = 0; i < words.length; i++) {
    const add = cur.idxs.length === 0 ? widths[i] : cur.width + space + widths[i];
    if (cur.idxs.length > 0 && add > maxWidth) {
      lines.push(cur);
      cur = { idxs: [i], width: widths[i] };
    } else {
      cur.idxs.push(i);
      cur.width = add;
    }
  }
  if (cur.idxs.length) lines.push(cur);

  const lineHeight = fontSize * 1.25;
  // Vertical center of the FIRST line so the whole block is centered on yc.
  const firstLineYc = yc - ((lines.length - 1) * lineHeight) / 2;
  const lineYcI = (li: number) => Math.round(firstLineYc + li * lineHeight);

  // ── Word-level presets (per-word drawtext) ──────────────────
  if (a.animation === 'word-pop' || a.animation === 'typewriter' || a.animation === 'karaoke') {
    const out: string[] = [];
    const hi: string[] = [];
    const slice = Math.max(0.15, (t1 - t0) / words.length);
    let g = 0; // global word index (reading order) for stagger / karaoke timing
    lines.forEach((ln, li) => {
      const yC = `${lineYcI(li)}-(th/2)`;
      let cursor = xc - ln.width / 2;
      ln.idxs.forEach((wi) => {
        const left = Math.round(cursor);
        cursor += widths[wi] + space;
        const wEsc = escape(words[wi]);
        if (a.animation === 'karaoke') {
          out.push(draw(wEsc, { x: `${left}`, y: yC, alpha: `min(1,(t-${t0s})/0.25)` }));
          const ws = (t0 + g * slice).toFixed(2);
          const we = (t0 + (g + 1) * slice).toFixed(2);
          hi.push(draw(wEsc, { x: `${left}`, y: `${lineYcI(li)}-(th/2)-6`, color: HIGHLIGHT, enable: `between(t,${ws},${we})` }));
        } else {
          const at = (t0 + g * (a.animation === 'typewriter' ? 0.16 : 0.12)).toFixed(2);
          const alpha = a.animation === 'typewriter'
            ? `if(lt(t,${at}),0,1)`
            : `if(lt(t,${at}),0,min(1,(t-${at})/0.18))`;
          const y = a.animation === 'typewriter'
            ? yC
            : `${lineYcI(li)}-(th/2)-14*max(0,1-(t-${at})/0.18)`;
          out.push(draw(wEsc, { x: `${left}`, y, alpha }));
        }
        g++;
      });
    });
    return [...out, ...hi]; // highlights drawn last (on top)
  }

  // ── Line-level presets (per-line drawtext, block animates together) ──
  const xLine = `${xcI}-(tw/2)`;
  const lineAlpha = (): string | undefined => {
    switch (a.animation) {
      case 'fade': return `max(0,min(1,min((t-${t0s})/0.3,(${t1s}-t)/0.3)))`;
      case 'slide': return `min(1,(t-${t0s})/0.4)`;
      case 'scale': return `min(1,(t-${t0s})/0.25)`;
      case 'bounce': return `min(1,(t-${t0s})/0.2)`;
      default: return undefined;
    }
  };
  const lineY = (li: number): string => {
    const base = `${lineYcI(li)}-(th/2)`;
    switch (a.animation) {
      case 'slide': return `${base}+45*max(0,1-(t-${t0s})/0.4)`;
      case 'scale': return `${base}-10*max(0,1-(t-${t0s})/0.25)`;
      case 'bounce': return `${base}-40*exp(-4*(t-${t0s}))*sin(9*(t-${t0s}))`;
      default: return base;
    }
  };
  const alpha = lineAlpha();
  return lines.map((ln, li) => {
    const lineText = escape(ln.idxs.map((wi) => words[wi]).join(' '));
    return draw(lineText, { x: xLine, y: lineY(li), alpha });
  });
}
