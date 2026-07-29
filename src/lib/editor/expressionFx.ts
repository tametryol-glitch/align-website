// Expression-triggered effects: particles that fire off what your face is doing,
// read from MediaPipe FaceLandmarker blendshapes (smile / jawOpen / blink). The
// particle field is a deterministic function of the frame + the live expression
// intensity — no stored state — so it's identical in preview, scrubbing, and the
// server render. Shared by web + renderer copies of ExpressionFxVideo.

export interface ExpressionFx { id: string; name: string; icon: string; }

export const EXPRESSION_FX: ExpressionFx[] = [
  { id: 'hearts', name: 'Smile Hearts', icon: '😍' },
  { id: 'fire', name: 'Fire Breath', icon: '🔥' },
  { id: 'stars', name: 'Blink Stars', icon: '✨' },
  { id: 'party', name: 'Smile Party', icon: '🥳' },
];

const L = { leftEyeOut: 33, leftEyeIn: 133, rightEyeOut: 263, rightEyeIn: 362, noseTip: 1, topLip: 13, botLip: 14 };

type Blend = Record<string, number>;
interface Pt { x: number; y: number; }

function drawEmoji(ctx: CanvasRenderingContext2D, e: string, x: number, y: number, size: number, alpha: number) {
  if (alpha <= 0.02 || size < 4) return;
  ctx.save();
  ctx.globalAlpha = alpha > 1 ? 1 : alpha;
  ctx.font = `${Math.round(size)}px "Noto Color Emoji","Apple Color Emoji",serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(e, x, y);
  ctx.restore();
}

/** Draw the active expression effect. `blend` maps blendshape name → 0..1. */
export function drawExpressionFx(
  ctx: CanvasRenderingContext2D,
  lm: Array<{ x: number; y: number }>,
  blend: Blend,
  W: number, H: number,
  id: string, frame: number,
): void {
  const P = (i: number): Pt => ({ x: lm[i].x * W, y: lm[i].y * H });
  const mid = (a: Pt, b: Pt): Pt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const leftEye = mid(P(L.leftEyeOut), P(L.leftEyeIn));
  const rightEye = mid(P(L.rightEyeOut), P(L.rightEyeIn));
  const eyeW = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y) || W * 0.2;
  const nose = P(L.noseTip);
  const mouth = mid(P(L.topLip), P(L.botLip));

  const smile = Math.min(1, ((blend.mouthSmileLeft || 0) + (blend.mouthSmileRight || 0)) / 1.4);
  const jaw = blend.jawOpen || 0;
  const blink = Math.max(blend.eyeBlinkLeft || 0, blend.eyeBlinkRight || 0);

  if (id === 'hearts' || id === 'party') {
    if (smile <= 0.22) return;
    const emo = id === 'party' ? ['🎉', '🎊', '💖', '⭐'] : ['💖', '💕', '❤️', '💗'];
    const N = 9;
    for (let i = 0; i < N; i++) {
      const phase = ((frame * 0.017 + i / N) % 1);
      const sway = Math.sin(frame * 0.05 + i * 1.9);
      const x = nose.x + sway * eyeW * 2.6 + (i - N / 2) * eyeW * 0.28;
      const y = mouth.y - phase * eyeW * 5.2;
      const a = Math.sin(phase * Math.PI) * Math.min(1, smile * 1.6);
      const size = eyeW * (1.2 + 0.6 * Math.sin(phase * Math.PI));
      drawEmoji(ctx, emo[i % emo.length], x, y, size, a);
    }
    return;
  }

  if (id === 'fire') {
    if (jaw <= 0.28) return;
    const N = 11;
    for (let i = 0; i < N; i++) {
      const phase = ((frame * 0.045 + i / N) % 1);
      const x = mouth.x + Math.sin(frame * 0.11 + i * 2.1) * eyeW * 0.55 + (i - N / 2) * eyeW * 0.12;
      const y = mouth.y + eyeW * 0.3 + phase * eyeW * 3.6;
      const a = (1 - phase) * Math.min(1, jaw * 1.4);
      const size = eyeW * (1.3 + 0.7 * (1 - phase)) * (0.6 + jaw * 0.6);
      drawEmoji(ctx, i % 5 === 0 ? '💨' : '🔥', x, y, size, a);
    }
    return;
  }

  if (id === 'stars') {
    if (blink <= 0.4) return;
    for (const eye of [leftEye, rightEye]) {
      const M = 7;
      for (let i = 0; i < M; i++) {
        const ang = (i / M) * Math.PI * 2 + frame * 0.12;
        const rad = eyeW * (0.4 + 0.5 * Math.abs(Math.sin(frame * 0.25 + i)));
        drawEmoji(ctx, i % 2 ? '⭐' : '✨', eye.x + Math.cos(ang) * rad, eye.y + Math.sin(ang) * rad, eyeW * 0.75, blink * 0.9);
      }
    }
    return;
  }
}
