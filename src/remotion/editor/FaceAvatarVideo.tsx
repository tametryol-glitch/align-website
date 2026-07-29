'use client';

/**
 * 3D avatar — replace the head with a code-built character (alien/cosmic/robot)
 * that tracks the head position, size and tilt, and mimics expressions (blink,
 * mouth-open, smile) from the FaceLandmarker blendshapes. Three.js renders the
 * avatar to an offscreen canvas; it's composited over the head on the 2D canvas.
 * Runs in the Player preview and the headless render (validated). Kept in sync
 * with the renderer copy at .../templates/FaceAvatarVideo.tsx.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { OffthreadVideo, useVideoConfig, useCurrentFrame, delayRender, continueRender, staticFile } from 'remotion';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import * as THREE from 'three';
import { buildAvatar, driveAvatar, type BuiltAvatar } from '@/lib/editor/avatar3d';

const AV = 480; // offscreen avatar render size (square)

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

export const FaceAvatarVideo: React.FC<{
  src: string;
  startFrom?: number;
  playbackRate?: number;
  muted?: boolean;
  volume?: number;
  avatarId: string;
  objectFit?: 'cover' | 'contain';
}> = ({ src, startFrom, playbackRate, muted, volume, avatarId, objectFit = 'cover' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flRef = useRef<FaceLandmarker | null>(null);
  const three = useRef<{ renderer: THREE.WebGLRenderer; scene: THREE.Scene; cam: THREE.PerspectiveCamera; canvas: HTMLCanvasElement; avatar: BuiltAvatar } | null>(null);
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender('load-avatar'));

  useEffect(() => {
    let cancelled = false;
    loadLandmarker().then((fl) => { flRef.current = fl; })
      .catch((e) => { console.error('[avatar] landmarker load failed', e); })
      .finally(() => { if (!cancelled) continueRender(handle); });
    return () => { cancelled = true; };
  }, [handle]);

  // Build the Three scene + avatar (rebuild if the style changes).
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = AV; canvas.height = AV;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(AV, AV, false);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    cam.position.set(0, 0, 6);
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const key = new THREE.DirectionalLight(0xffffff, 1.15); key.position.set(1.5, 2.5, 4); scene.add(key);
    const rim = new THREE.DirectionalLight(0x88aaff, 0.5); rim.position.set(-2, 0, -2); scene.add(rim);
    const avatar = buildAvatar(avatarId);
    scene.add(avatar.group);
    three.current = { renderer, scene, cam, canvas, avatar };
    return () => { scene.remove(avatar.group); avatar.dispose(); renderer.dispose(); three.current = null; };
  }, [avatarId]);

  const onVideoFrame = useCallback(
    (vf: CanvasImageSource) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
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
      const fl = flRef.current, t = three.current;
      if (!fl || !t) return;
      const res = fl.detect(canvas);
      const lm = res.faceLandmarks?.[0];
      if (!lm) return;
      const blend: Record<string, number> = {};
      const cats = res.faceBlendshapes?.[0]?.categories;
      if (cats) for (const c of cats) blend[c.categoryName] = c.score;

      const P = (i: number) => ({ x: lm[i].x * W, y: lm[i].y * H });
      const le = P(33), lin = P(133), re = P(263), rin = P(362);
      const leftEye = { x: (le.x + lin.x) / 2, y: (le.y + lin.y) / 2 };
      const rightEye = { x: (re.x + rin.x) / 2, y: (re.y + rin.y) / 2 };
      const fore = P(10), chin = P(152), nose = P(1), fLeft = P(234), fRight = P(454);
      const headCX = (fLeft.x + fRight.x) / 2;
      const headCY = (fore.y + chin.y) / 2;
      const headH = Math.hypot(chin.x - fore.x, chin.y - fore.y) || H * 0.2;
      const faceW = Math.hypot(fRight.x - fLeft.x, fRight.y - fLeft.y) || W * 0.2;
      const roll = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
      const yaw = Math.max(-0.7, Math.min(0.7, ((nose.x - headCX) / (faceW * 0.5)) * 0.9));
      const pitch = Math.max(-0.5, Math.min(0.5, ((nose.y - headCY) / (headH * 0.5)) * 0.7));

      driveAvatar(t.avatar, blend, yaw, pitch);
      t.renderer.render(t.scene, t.cam);

      const box = headH * 2.2;
      // Centre on the whole HEAD, not the face midpoint. The crown/hair sits
      // well above the forehead landmark, so shift the avatar up along the head
      // axis (chin→forehead direction, so it's correct even when tilted) — else
      // the top of the real head shows above the avatar.
      const upX = fore.x - chin.x, upY = fore.y - chin.y;
      const ul = Math.hypot(upX, upY) || 1;
      const shift = headH * 0.30;
      const cx = headCX + (upX / ul) * shift;
      const cy = headCY + (upY / ul) * shift;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(roll);
      ctx.drawImage(t.canvas, -box / 2, -box / 2, box, box);
      ctx.restore();
    },
    [objectFit, frame],
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
