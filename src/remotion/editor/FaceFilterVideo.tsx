'use client';

/**
 * Face-tracking AR filter video. Per frame: draw the video to a canvas, run
 * MediaPipe FaceLandmarker, then draw the chosen filter's pieces anchored to the
 * 468 face landmarks. Works in the Player preview and the server render
 * (validated ~27ms/frame CPU under gl:angle). Kept in sync with the renderer
 * copy at align-video-renderer/src/remotion/templates/FaceFilterVideo.tsx.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { OffthreadVideo, useVideoConfig, useCurrentFrame, delayRender, continueRender, staticFile } from 'remotion';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { FACE_FILTERS, drawFaceFilter } from '@/lib/editor/faceFilters';

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

export const FaceFilterVideo: React.FC<{
  src: string;
  startFrom?: number;
  playbackRate?: number;
  muted?: boolean;
  volume?: number;
  filterId: string;
  objectFit?: 'cover' | 'contain';
}> = ({ src, startFrom, playbackRate, muted, volume, filterId, objectFit = 'cover' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flRef = useRef<FaceLandmarker | null>(null);
  const prevLmRef = useRef<Array<{ x: number; y: number }> | null>(null);
  const imgMapRef = useRef<Map<string, CanvasImageSource>>(new Map());
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender('load-face-landmarker'));
  const filter = FACE_FILTERS.find((f) => f.id === filterId) || FACE_FILTERS[0];

  // Preload any PNG assets the filter uses (transparent art in public/filters/).
  useEffect(() => {
    for (const p of filter.pieces) {
      if (p.kind !== 'image' || imgMapRef.current.has(p.asset)) continue;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => imgMapRef.current.set(p.asset, img);
      img.src = staticFile(`filters/${p.asset}`);
    }
  }, [filter]);

  useEffect(() => {
    let cancelled = false;
    loadLandmarker()
      .then((fl) => { flRef.current = fl; })
      .catch((e) => { console.error('[faceFilter] landmarker load failed', e); })
      .finally(() => { if (!cancelled) continueRender(handle); });
    return () => { cancelled = true; };
  }, [handle]);

  const onVideoFrame = useCallback(
    (vf: CanvasImageSource) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      // cover-fit the frame
      const f = vf as unknown as Record<string, number>;
      const sw = f.videoWidth || f.displayWidth || f.width || 0;
      const sh = f.videoHeight || f.displayHeight || f.height || 0;
      if (sw && sh) {
        const fit = objectFit === 'contain' ? Math.min(W / sw, H / sh) : Math.max(W / sw, H / sh);
        const dw = sw * fit, dh = sh * fit;
        ctx.drawImage(vf, (W - dw) / 2, (H - dh) / 2, dw, dh);
      } else {
        ctx.drawImage(vf, 0, 0, W, H);
      }
      const fl = flRef.current;
      if (!fl) return;
      const res = fl.detect(canvas);
      const raw = res.faceLandmarks?.[0];
      if (!raw) { prevLmRef.current = null; return; }
      // Temporal smoothing: blend with the previous frame's points to stop the
      // accessories jittering when the detector wobbles a pixel or two.
      const prev = prevLmRef.current;
      const a = 0.55;
      const lm = prev && prev.length === raw.length
        ? raw.map((p, i) => ({ x: p.x * a + prev[i].x * (1 - a), y: p.y * a + prev[i].y * (1 - a) }))
        : raw.map((p) => ({ x: p.x, y: p.y }));
      prevLmRef.current = lm;
      drawFaceFilter(ctx, lm, W, H, filter, imgMapRef.current);
    },
    [filter, objectFit, frame],
  );

  // Full composition resolution keeps the tracking sharp; face detection is the
  // cost, not the canvas size, so no down-scaling here.
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
        width={width}
        height={height}
        style={{ width: '100%', height: '100%', display: 'block', objectFit }}
      />
    </>
  );
};
