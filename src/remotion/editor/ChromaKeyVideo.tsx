'use client';

/**
 * Chroma-key (green screen) video — identical in the Player preview and the
 * server render via <OffthreadVideo onVideoFrame>. Each decoded frame is drawn
 * to a canvas, the key colour is made transparent (with feather + spill
 * suppression), and only the processed canvas is shown so lower tracks read
 * through where the background was. Kept in sync with the renderer copy at
 * align-video-renderer/src/remotion/templates/ChromaKeyVideo.tsx.
 */

import React, { useCallback, useRef } from 'react';
import { OffthreadVideo, useVideoConfig, useCurrentFrame } from 'remotion';
import type { ChromaOptions } from '@/lib/editor/timelineModel';

// Cap the keying canvas so a 1080x1920 clip doesn't run a 2M-pixel JS loop per
// frame. Keying at ≤720px on the long edge looks identical once scaled up.
const WORK_CAP = 720;

function hexToRgb(hex: string | undefined): [number, number, number] {
  const h = (hex || '#00FF00').replace('#', '');
  const s = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(s, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function sourceSize(frame: CanvasImageSource): [number, number] {
  const f = frame as unknown as Record<string, number>;
  const w = f.videoWidth || f.displayWidth || f.codedWidth || f.width || f.naturalWidth || 0;
  const h = f.videoHeight || f.displayHeight || f.codedHeight || f.height || f.naturalHeight || 0;
  return [w, h];
}

export const ChromaKeyVideo: React.FC<{
  src: string;
  startFrom?: number;
  playbackRate?: number;
  muted?: boolean;
  volume?: number;
  chroma: ChromaOptions;
  objectFit?: 'cover' | 'contain';
}> = ({ src, startFrom, playbackRate, muted, volume, chroma, objectFit = 'cover' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width, height } = useVideoConfig();
  // In the Player, onVideoFrame only re-fires during playback (requestVideoFrame
  // Callback). Tying it to the current frame changes its identity every frame,
  // forcing a redraw while scrubbing/paused so the preview stays WYSIWYG.
  const frame = useCurrentFrame();
  const [kr, kg, kb] = hexToRgb(chroma.keyColor);
  const similarity = chroma.similarity ?? 0.4;
  const smoothness = chroma.smoothness ?? 0.1;
  const spill = chroma.spill ?? 0.1;

  const longEdge = Math.max(width, height);
  const scale = longEdge > WORK_CAP ? WORK_CAP / longEdge : 1;
  const cw = Math.max(2, Math.round(width * scale));
  const ch = Math.max(2, Math.round(height * scale));

  const onVideoFrame = useCallback(
    (frame: CanvasImageSource) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.clearRect(0, 0, cw, ch);
      const [sw, sh] = sourceSize(frame);
      if (sw && sh) {
        const fit = objectFit === 'contain' ? Math.min(cw / sw, ch / sh) : Math.max(cw / sw, ch / sh);
        const dw = sw * fit, dh = sh * fit;
        ctx.drawImage(frame, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      } else {
        ctx.drawImage(frame, 0, 0, cw, ch);
      }

      const img = ctx.getImageData(0, 0, cw, ch);
      const d = img.data;
      const MAX = 441.6729559; // 255 * sqrt(3)
      const simDist = similarity * MAX;
      const smoothDist = Math.max(1, smoothness * MAX);
      for (let i = 0; i < d.length; i += 4) {
        const dr = d[i] - kr, dg = d[i + 1] - kg, db = d[i + 2] - kb;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);
        if (dist < simDist) {
          d[i + 3] = 0;
          continue;
        }
        if (dist < simDist + smoothDist) {
          d[i + 3] = Math.round((d[i + 3] * (dist - simDist)) / smoothDist);
        }
        if (spill > 0) {
          const g = d[i + 1];
          const avgRB = (d[i] + d[i + 2]) / 2;
          if (g > avgRB) d[i + 1] = Math.round(g - (g - avgRB) * spill);
        }
      }
      ctx.putImageData(img, 0, 0);
    },
    // `frame` is intentionally a dependency: it re-creates this callback each
    // frame so Remotion re-runs the draw while the Player is paused/scrubbing.
    [kr, kg, kb, similarity, smoothness, spill, cw, ch, objectFit, frame],
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
