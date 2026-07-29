'use client';

/**
 * AI background removal for Remotion — on-device person segmentation via
 * MediaPipe ImageSegmenter (selfie model). Each decoded frame is drawn to a
 * canvas, segmented, and the person's confidence becomes the alpha so the
 * background reads through to lower tracks. Works in the Player preview and the
 * server render (validated: ~27ms/frame CPU under gl:'angle'). Kept in sync
 * with the renderer copy at align-video-renderer/src/remotion/templates/.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { OffthreadVideo, useVideoConfig, useCurrentFrame, delayRender, continueRender, staticFile } from 'remotion';
import { ImageSegmenter, FilesetResolver } from '@mediapipe/tasks-vision';
import type { BgRemoveOptions } from '@/lib/editor/timelineModel';

const WORK_CAP = 480; // segmentation canvas long-edge cap (perf)

// Load the segmenter once for the whole app/render.
let segmenterPromise: Promise<ImageSegmenter> | null = null;
function loadSegmenter(): Promise<ImageSegmenter> {
  if (!segmenterPromise) {
    segmenterPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(staticFile('mp-wasm'));
      return ImageSegmenter.createFromOptions(vision, {
        baseOptions: { modelAssetPath: staticFile('selfie_segmenter.tflite'), delegate: 'CPU' },
        outputCategoryMask: false,
        outputConfidenceMasks: true,
        runningMode: 'IMAGE',
      });
    })();
  }
  return segmenterPromise;
}

function sourceSize(frame: CanvasImageSource): [number, number] {
  const f = frame as unknown as Record<string, number>;
  const w = f.videoWidth || f.displayWidth || f.codedWidth || f.width || f.naturalWidth || 0;
  const h = f.videoHeight || f.displayHeight || f.codedHeight || f.height || f.naturalHeight || 0;
  return [w, h];
}

export const SegmentedVideo: React.FC<{
  src: string;
  startFrom?: number;
  playbackRate?: number;
  muted?: boolean;
  volume?: number;
  options: BgRemoveOptions;
  objectFit?: 'cover' | 'contain';
}> = ({ src, startFrom, playbackRate, muted, volume, options, objectFit = 'cover' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const segRef = useRef<ImageSegmenter | null>(null);
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender('load-bg-segmenter'));
  const feather = options.feather ?? 0.15;

  useEffect(() => {
    let cancelled = false;
    loadSegmenter()
      .then((s) => { segRef.current = s; })
      .catch((e) => { console.error('[bgRemove] segmenter load failed', e); })
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

      ctx.clearRect(0, 0, cw, ch);
      const [sw, sh] = sourceSize(vf);
      if (sw && sh) {
        const fit = objectFit === 'contain' ? Math.min(cw / sw, ch / sh) : Math.max(cw / sw, ch / sh);
        const dw = sw * fit, dh = sh * fit;
        ctx.drawImage(vf, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      } else {
        ctx.drawImage(vf, 0, 0, cw, ch);
      }

      const seg = segRef.current;
      if (!seg) return; // until the model loads, show the raw frame
      const result = seg.segment(canvas);
      const mask = result.confidenceMasks?.[0];
      if (mask) {
        const conf = mask.getAsFloat32Array();
        const mw = mask.width, mh = mask.height;
        const lo = 0.5 - feather * 0.5;
        const span = Math.max(0.02, feather);
        const img = ctx.getImageData(0, 0, cw, ch);
        const d = img.data;
        for (let y = 0; y < ch; y++) {
          const my = Math.floor((y / ch) * mh);
          for (let x = 0; x < cw; x++) {
            const mx = Math.floor((x / cw) * mw);
            const c = conf[my * mw + mx];
            const a = c <= lo ? 0 : c >= lo + span ? 1 : (c - lo) / span;
            const idx = (y * cw + x) * 4 + 3;
            d[idx] = Math.round(d[idx] * a);
          }
        }
        ctx.putImageData(img, 0, 0);
        mask.close();
      }
      result.close();
    },
    [cw, ch, objectFit, feather, frame],
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
