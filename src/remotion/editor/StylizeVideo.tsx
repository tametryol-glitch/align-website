'use client';

/**
 * Stylize a video clip with a non-AI "cartoon" look — colour posterization +
 * Sobel edge outlines + a saturation lift, all on a canvas. Cheap enough to run
 * in the Player preview AND the CPU server render (no GPU / no neural net), so
 * it stays free and preview matches export. Kept in sync with the renderer copy
 * at align-video-renderer/src/remotion/templates/StylizeVideo.tsx.
 */

import React, { useCallback, useRef } from 'react';
import { OffthreadVideo, useVideoConfig, useCurrentFrame } from 'remotion';

const WORK_CAP = 640; // processing resolution cap (long edge)

export const StylizeVideo: React.FC<{
  src: string;
  startFrom?: number;
  playbackRate?: number;
  muted?: boolean;
  volume?: number;
  style: string; // 'toon' for now
  objectFit?: 'cover' | 'contain';
}> = ({ src, startFrom, playbackRate, muted, volume, objectFit = 'cover' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();

  const longEdge = Math.max(width, height);
  const scale = longEdge > WORK_CAP ? WORK_CAP / longEdge : 1;
  const cw = Math.max(2, Math.round(width * scale));
  const ch = Math.max(2, Math.round(height * scale));

  const onVideoFrame = useCallback(
    (vf: CanvasImageSource) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const f = vf as unknown as Record<string, number>;
      const sw = f.videoWidth || f.displayWidth || f.width || 0;
      const sh = f.videoHeight || f.displayHeight || f.height || 0;
      ctx.clearRect(0, 0, cw, ch);
      // Blur first so we flatten skin/fabric/background into clean flats and
      // edge-detection catches real contours, not texture noise — the
      // difference between a clean "cartoon" and a mottled "photocopy".
      ctx.filter = `blur(${Math.max(1.6, cw / 200).toFixed(2)}px)`;
      if (sw && sh) {
        const fit = objectFit === 'contain' ? Math.min(cw / sw, ch / sh) : Math.max(cw / sw, ch / sh);
        const dw = sw * fit, dh = sh * fit;
        ctx.drawImage(vf, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      } else {
        ctx.drawImage(vf, 0, 0, cw, ch);
      }
      ctx.filter = 'none';

      const img = ctx.getImageData(0, 0, cw, ch);
      const d = img.data;
      const n = cw * ch;
      // luminance (for edges), from the original frame
      const lum = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const p = i * 4;
        lum[i] = 0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2];
      }
      const LEVELS = 4;
      const q = 255 / (LEVELS - 1);
      const EDGE = 48;
      const SAT = 1.5;
      for (let y = 0; y < ch; y++) {
        for (let x = 0; x < cw; x++) {
          const i = y * cw + x;
          const p = i * 4;
          // Sobel edge on luminance
          let edge = 0;
          if (x > 0 && x < cw - 1 && y > 0 && y < ch - 1) {
            const l = (xx: number, yy: number) => lum[yy * cw + xx];
            const gx = -l(x - 1, y - 1) - 2 * l(x - 1, y) - l(x - 1, y + 1) + l(x + 1, y - 1) + 2 * l(x + 1, y) + l(x + 1, y + 1);
            const gy = -l(x - 1, y - 1) - 2 * l(x, y - 1) - l(x + 1, y - 1) + l(x - 1, y + 1) + 2 * l(x, y + 1) + l(x + 1, y + 1);
            edge = Math.sqrt(gx * gx + gy * gy);
          }
          if (edge > EDGE) {
            d[p] = 22; d[p + 1] = 20; d[p + 2] = 28; // ink outline
          } else {
            // Hue-preserving cel shading: quantize BRIGHTNESS into bands, then
            // shade the real colour to that band (ratio) instead of posterizing
            // each channel on its own — that per-channel banding is what mottled
            // the flats. Saturation is punched around the band centre.
            const li = lum[i] < 1 ? 1 : lum[i];
            const band = Math.round(li / q) * q;
            const ratio = band / li;
            for (let ch2 = 0; ch2 < 3; ch2++) {
              let v = d[p + ch2] * ratio;                   // shade to band, keep hue
              v = band + (v - band) * SAT;                  // punch saturation
              d[p + ch2] = v < 0 ? 0 : v > 255 ? 255 : v;
            }
          }
        }
      }
      ctx.putImageData(img, 0, 0);
    },
    [cw, ch, objectFit, frame],
  );

  return (
    <>
      <OffthreadVideo
        src={src}
        startFrom={startFrom}
        playbackRate={playbackRate}
        muted={muted}
        volume={volume}
        onVideoFrame={onVideoFrame}
        style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      />
      <canvas
        ref={canvasRef}
        width={cw}
        height={ch}
        style={{ width: '100%', height: '100%', display: 'block', objectFit }}
      />
    </>
  );
};
