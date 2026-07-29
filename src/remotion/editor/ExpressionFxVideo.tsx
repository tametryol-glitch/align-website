'use client';

/**
 * Expression-triggered FX — draw the video, read the FaceLandmarker blendshapes
 * (smile / jawOpen / blink), and emit particles that react to them (hearts on a
 * smile, fire on an open mouth, stars on a blink). Deterministic per frame, so
 * preview matches export. Kept in sync with the renderer copy at
 * align-video-renderer/src/remotion/templates/ExpressionFxVideo.tsx.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { OffthreadVideo, useVideoConfig, useCurrentFrame, delayRender, continueRender, staticFile } from 'remotion';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { drawExpressionFx } from '@/lib/editor/expressionFx';

let landmarkerPromise: Promise<FaceLandmarker> | null = null;
function loadLandmarker(): Promise<FaceLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(staticFile('mp-wasm'));
      return FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: staticFile('face_landmarker.task'), delegate: 'CPU' },
        runningMode: 'IMAGE', numFaces: 1, outputFaceBlendshapes: true,
      });
    })();
  }
  return landmarkerPromise;
}

export const ExpressionFxVideo: React.FC<{
  src: string;
  startFrom?: number;
  playbackRate?: number;
  muted?: boolean;
  volume?: number;
  effectId: string;
  objectFit?: 'cover' | 'contain';
}> = ({ src, startFrom, playbackRate, muted, volume, effectId, objectFit = 'cover' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flRef = useRef<FaceLandmarker | null>(null);
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender('load-expression-fx'));

  useEffect(() => {
    let cancelled = false;
    loadLandmarker().then((fl) => { flRef.current = fl; })
      .catch((e) => { console.error('[expressionFx] landmarker load failed', e); })
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
      const lm = res.faceLandmarks?.[0];
      if (!lm) return;
      const blend: Record<string, number> = {};
      const cats = res.faceBlendshapes?.[0]?.categories;
      if (cats) for (const c of cats) blend[c.categoryName] = c.score;
      drawExpressionFx(ctx, lm, blend, W, H, effectId, frame);
    },
    [effectId, objectFit, frame],
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
        width={width}
        height={height}
        style={{ width: '100%', height: '100%', display: 'block', objectFit }}
      />
    </>
  );
};
