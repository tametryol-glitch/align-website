'use client';

/**
 * Face-warp video — reshape the real face by liquifying it around the landmarks
 * (e.g. 'alien' = huge eyes, big cranium, tiny chin). Smooth radial warps, no
 * triangle mesh, so no seams. Runs in the Player preview and the CPU server
 * render (validated pipeline). Kept in sync with the renderer copy at
 * align-video-renderer/src/remotion/templates/FaceWarpVideo.tsx.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { OffthreadVideo, useVideoConfig, useCurrentFrame, delayRender, continueRender, staticFile } from 'remotion';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const WORK_CAP = 460; // warp resolution cap (long edge)

let landmarkerPromise: Promise<FaceLandmarker> | null = null;
function loadLandmarker(): Promise<FaceLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(staticFile('mp-wasm'));
      return FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: staticFile('face_landmarker.task'), delegate: 'CPU' },
        runningMode: 'IMAGE', numFaces: 1, outputFaceBlendshapes: false,
      });
    })();
  }
  return landmarkerPromise;
}

interface Brush { cx: number; cy: number; r: number; s: number; shrink?: boolean; }

// Warp recipes, in eye-width units, from landmark anchor points.
function brushesFor(warp: string, pts: { leftEye: [number, number]; rightEye: [number, number]; forehead: [number, number]; chin: [number, number]; eyeW: number }): Brush[] {
  const { leftEye, rightEye, forehead, chin, eyeW } = pts;
  const head: [number, number] = [forehead[0], forehead[1] - eyeW * 0.5];
  if (warp === 'bigEyes') {
    return [
      { cx: leftEye[0], cy: leftEye[1], r: eyeW * 0.9, s: 0.55 },
      { cx: rightEye[0], cy: rightEye[1], r: eyeW * 0.9, s: 0.55 },
    ];
  }
  if (warp === 'chipmunk') {
    return [
      { cx: leftEye[0] - eyeW * 0.2, cy: chin[1] - eyeW * 0.3, r: eyeW * 1.1, s: 0.45 },
      { cx: rightEye[0] + eyeW * 0.2, cy: chin[1] - eyeW * 0.3, r: eyeW * 1.1, s: 0.45 },
    ];
  }
  // alien (default): giant eyes, bulbous cranium, tiny pointed chin.
  return [
    { cx: leftEye[0], cy: leftEye[1], r: eyeW * 1.2, s: 0.82 },
    { cx: rightEye[0], cy: rightEye[1], r: eyeW * 1.2, s: 0.82 },
    { cx: head[0], cy: head[1] - eyeW * 0.2, r: eyeW * 3.1, s: 0.42 },
    { cx: chin[0], cy: chin[1], r: eyeW * 1.8, s: 0.62, shrink: true },
    { cx: (leftEye[0] + rightEye[0]) / 2, cy: (leftEye[1] + rightEye[1]) / 2 + eyeW * 1.15, r: eyeW * 0.85, s: 0.42, shrink: true },
  ];
}

export const FaceWarpVideo: React.FC<{
  src: string;
  startFrom?: number;
  playbackRate?: number;
  muted?: boolean;
  volume?: number;
  warp: string;
  objectFit?: 'cover' | 'contain';
}> = ({ src, startFrom, playbackRate, muted, volume, warp, objectFit = 'cover' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flRef = useRef<FaceLandmarker | null>(null);
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender('load-face-warp'));

  useEffect(() => {
    let cancelled = false;
    loadLandmarker().then((fl) => { flRef.current = fl; })
      .catch((e) => { console.error('[faceWarp] landmarker load failed', e); })
      .finally(() => { if (!cancelled) continueRender(handle); });
    return () => { cancelled = true; };
  }, [handle]);

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
      if (sw && sh) {
        const fit = objectFit === 'contain' ? Math.min(cw / sw, ch / sh) : Math.max(cw / sw, ch / sh);
        const dw = sw * fit, dh = sh * fit;
        ctx.drawImage(vf, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      } else {
        ctx.drawImage(vf, 0, 0, cw, ch);
      }
      const fl = flRef.current;
      if (!fl) return;
      const res = fl.detect(canvas);
      const lm = res.faceLandmarks?.[0];
      if (!lm) return; // no face → leave frame untouched
      const P = (i: number): [number, number] => [lm[i].x * cw, lm[i].y * ch];
      const mid = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const leftEye = mid(P(33), P(133)), rightEye = mid(P(263), P(362));
      const eyeW = Math.hypot(rightEye[0] - leftEye[0], rightEye[1] - leftEye[1]) || cw * 0.2;
      const brushes = brushesFor(warp, { leftEye, rightEye, forehead: P(10), chin: P(152), eyeW });

      const srcImg = ctx.getImageData(0, 0, cw, ch);
      const src = srcImg.data;
      const out = ctx.createImageData(cw, ch);
      const o = out.data;
      const sample = (sx: number, sy: number, p: number) => {
        if (sx < 0) sx = 0; else if (sx > cw - 1) sx = cw - 1;
        if (sy < 0) sy = 0; else if (sy > ch - 1) sy = ch - 1;
        const x0 = sx | 0, y0 = sy | 0, x1 = x0 + 1 < cw ? x0 + 1 : x0, y1 = y0 + 1 < ch ? y0 + 1 : y0;
        const fx = sx - x0, fy = sy - y0;
        const i00 = (y0 * cw + x0) * 4 + p, i10 = (y0 * cw + x1) * 4 + p, i01 = (y1 * cw + x0) * 4 + p, i11 = (y1 * cw + x1) * 4 + p;
        const top = src[i00] + (src[i10] - src[i00]) * fx;
        const bot = src[i01] + (src[i11] - src[i01]) * fx;
        return top + (bot - top) * fy;
      };
      for (let y = 0; y < ch; y++) {
        for (let x = 0; x < cw; x++) {
          let dispX = 0, dispY = 0;
          for (let b = 0; b < brushes.length; b++) {
            const br = brushes[b];
            const dx = x - br.cx, dy = y - br.cy;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < br.r && d > 0.001) {
              const pct = 1 - d / br.r;
              const k = br.shrink ? 1 + br.s * pct * pct : 1 - br.s * pct * pct;
              dispX += br.cx + dx * k - x;
              dispY += br.cy + dy * k - y;
            }
          }
          const p = (y * cw + x) * 4;
          if (dispX === 0 && dispY === 0) {
            o[p] = src[p]; o[p + 1] = src[p + 1]; o[p + 2] = src[p + 2]; o[p + 3] = 255;
          } else {
            const sx = x + dispX, sy = y + dispY;
            o[p] = sample(sx, sy, 0); o[p + 1] = sample(sx, sy, 1); o[p + 2] = sample(sx, sy, 2); o[p + 3] = 255;
          }
        }
      }
      ctx.putImageData(out, 0, 0);
    },
    [cw, ch, objectFit, warp, frame],
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
