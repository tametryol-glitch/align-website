// Data-driven face-filter framework. Each filter is a list of "pieces" anchored
// to face landmarks — add a new filter by adding a config entry (+ an emoji or a
// named shape), no new code. Shared by the web preview and the server renderer.

export type Anchor =
  | 'eyes' | 'leftEye' | 'rightEye' | 'nose' | 'forehead' | 'aboveHead'
  | 'headLeft' | 'headRight' | 'mouth' | 'chin' | 'leftCheek' | 'rightCheek';

export type FilterPiece =
  | { kind: 'emoji'; emoji: string; anchor: Anchor; scale: number; dx?: number; dy?: number; rotate?: boolean }
  | { kind: 'shape'; shape: 'sunglasses' | 'halo' | 'dogEars' | 'devilHorns' | 'blush' | 'cowboyHat' };

export interface FaceFilter { id: string; name: string; icon: string; pieces: FilterPiece[]; }

export const FACE_FILTERS: FaceFilter[] = [
  { id: 'crown', name: 'Crown', icon: '👑', pieces: [{ kind: 'emoji', emoji: '👑', anchor: 'aboveHead', scale: 1.5, rotate: true }] },
  { id: 'sunglasses', name: 'Shades', icon: '🕶️', pieces: [{ kind: 'shape', shape: 'sunglasses' }] },
  { id: 'halo', name: 'Halo', icon: '😇', pieces: [{ kind: 'shape', shape: 'halo' }] },
  { id: 'dogEars', name: 'Puppy', icon: '🐶', pieces: [{ kind: 'shape', shape: 'dogEars' }, { kind: 'emoji', emoji: '🐽', anchor: 'nose', scale: 0.6, rotate: true }] },
  { id: 'devil', name: 'Devil', icon: '😈', pieces: [{ kind: 'shape', shape: 'devilHorns' }] },
  { id: 'sparkleEyes', name: 'Sparkle', icon: '✨', pieces: [{ kind: 'emoji', emoji: '✨', anchor: 'leftEye', scale: 0.9 }, { kind: 'emoji', emoji: '✨', anchor: 'rightEye', scale: 0.9 }] },
  { id: 'hearts', name: 'In Love', icon: '😍', pieces: [{ kind: 'emoji', emoji: '💕', anchor: 'leftCheek', scale: 0.8 }, { kind: 'emoji', emoji: '💕', anchor: 'rightCheek', scale: 0.8 }, { kind: 'emoji', emoji: '💖', anchor: 'aboveHead', scale: 0.9 }] },
  { id: 'party', name: 'Party', icon: '🥳', pieces: [{ kind: 'emoji', emoji: '🎉', anchor: 'headLeft', scale: 1.0, rotate: true }, { kind: 'emoji', emoji: '🎊', anchor: 'headRight', scale: 1.0, rotate: true }] },
  { id: 'flowerCrown', name: 'Flowers', icon: '🌸', pieces: [{ kind: 'emoji', emoji: '🌸', anchor: 'forehead', scale: 0.7, dx: -1.0, dy: -0.5, rotate: true }, { kind: 'emoji', emoji: '🌷', anchor: 'forehead', scale: 0.7, dy: -0.65, rotate: true }, { kind: 'emoji', emoji: '🌼', anchor: 'forehead', scale: 0.7, dx: 1.0, dy: -0.5, rotate: true }] },
  { id: 'blush', name: 'Blush', icon: '🥰', pieces: [{ kind: 'shape', shape: 'blush' }] },
  { id: 'cowboy', name: 'Howdy', icon: '🤠', pieces: [{ kind: 'shape', shape: 'cowboyHat' }] },
  { id: 'starEyes', name: 'Star', icon: '🤩', pieces: [{ kind: 'emoji', emoji: '⭐', anchor: 'aboveHead', scale: 0.8, dx: -1.2 }, { kind: 'emoji', emoji: '🌟', anchor: 'aboveHead', scale: 1.0 }, { kind: 'emoji', emoji: '⭐', anchor: 'aboveHead', scale: 0.8, dx: 1.2 }] },
];

// MediaPipe FaceLandmarker indices (468-point mesh).
const L = { leftEyeOut: 33, leftEyeIn: 133, rightEyeOut: 263, rightEyeIn: 362, noseTip: 1, forehead: 10, chin: 152, topLip: 13, botLip: 14, faceLeft: 234, faceRight: 454, leftCheek: 205, rightCheek: 425 };

interface Pt { x: number; y: number; }

/** Draw a face filter's pieces onto ctx, anchored to normalized landmarks. */
export function drawFaceFilter(
  ctx: CanvasRenderingContext2D,
  lm: Array<{ x: number; y: number }>,
  W: number, H: number,
  filter: FaceFilter,
): void {
  const P = (i: number): Pt => ({ x: lm[i].x * W, y: lm[i].y * H });
  const mid = (a: Pt, b: Pt): Pt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const leftEye = mid(P(L.leftEyeOut), P(L.leftEyeIn));
  const rightEye = mid(P(L.rightEyeOut), P(L.rightEyeIn));
  const eyeW = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y) || W * 0.2;
  const angle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
  const forehead = P(L.forehead);
  const anchors: Record<Anchor, Pt> = {
    leftEye, rightEye,
    eyes: mid(leftEye, rightEye),
    nose: P(L.noseTip),
    forehead,
    aboveHead: { x: forehead.x, y: forehead.y - eyeW * 1.0 },
    headLeft: { x: P(L.faceLeft).x, y: P(L.faceLeft).y - eyeW * 1.35 },
    headRight: { x: P(L.faceRight).x, y: P(L.faceRight).y - eyeW * 1.35 },
    mouth: mid(P(L.topLip), P(L.botLip)),
    chin: P(L.chin),
    leftCheek: P(L.leftCheek),
    rightCheek: P(L.rightCheek),
  };

  for (const piece of filter.pieces) {
    if (piece.kind === 'emoji') {
      const a = anchors[piece.anchor];
      const size = eyeW * piece.scale * 2.2;
      ctx.save();
      ctx.translate(a.x + (piece.dx || 0) * eyeW, a.y + (piece.dy || 0) * eyeW);
      if (piece.rotate) ctx.rotate(angle);
      ctx.font = `${Math.max(8, Math.round(size))}px "Noto Color Emoji", "Apple Color Emoji", serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(piece.emoji, 0, 0);
      ctx.restore();
    } else {
      drawShape(ctx, piece.shape, { leftEye, rightEye, eyeW, angle, anchors });
    }
  }
}

function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: 'sunglasses' | 'halo' | 'dogEars' | 'devilHorns' | 'blush' | 'cowboyHat',
  g: { leftEye: Pt; rightEye: Pt; eyeW: number; angle: number; anchors: Record<Anchor, Pt> },
): void {
  const { leftEye, rightEye, eyeW, angle, anchors } = g;
  if (shape === 'sunglasses') {
    const lens = eyeW * 0.36;
    ctx.fillStyle = 'rgba(8,8,10,0.92)';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = eyeW * 0.06;
    for (const e of [leftEye, rightEye]) {
      ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(angle);
      ctx.beginPath(); ctx.ellipse(0, 0, lens, lens * 0.72, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.beginPath(); ctx.moveTo(leftEye.x + lens * Math.cos(angle), leftEye.y + lens * Math.sin(angle));
    ctx.lineTo(rightEye.x - lens * Math.cos(angle), rightEye.y - lens * Math.sin(angle)); ctx.stroke();
  } else if (shape === 'halo') {
    const c = anchors.aboveHead;
    ctx.save(); ctx.translate(c.x, c.y - eyeW * 0.2); ctx.rotate(angle);
    ctx.strokeStyle = 'rgba(255,215,0,0.95)'; ctx.lineWidth = eyeW * 0.14;
    ctx.beginPath(); ctx.ellipse(0, 0, eyeW * 1.1, eyeW * 0.34, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  } else if (shape === 'dogEars') {
    for (const [side, base] of [[-1, anchors.headLeft], [1, anchors.headRight]] as Array<[number, Pt]>) {
      ctx.save(); ctx.translate(base.x, base.y); ctx.rotate(angle);
      ctx.fillStyle = '#8a5a2b';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(side * eyeW * 0.5, -eyeW * 1.1, side * eyeW * 0.1, eyeW * 0.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#c98a4b';
      ctx.beginPath(); ctx.moveTo(side * eyeW * 0.08, 0); ctx.quadraticCurveTo(side * eyeW * 0.35, -eyeW * 0.7, side * eyeW * 0.1, eyeW * 0.35); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  } else if (shape === 'devilHorns') {
    for (const [side, base] of [[-1, anchors.headLeft], [1, anchors.headRight]] as Array<[number, Pt]>) {
      ctx.save(); ctx.translate(base.x + side * eyeW * 0.2, base.y + eyeW * 0.2); ctx.rotate(angle);
      ctx.fillStyle = '#c0202a';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(side * eyeW * 0.1, -eyeW * 0.9, side * eyeW * 0.55, -eyeW * 0.95);
      ctx.quadraticCurveTo(side * eyeW * 0.2, -eyeW * 0.55, 0, 0); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  } else if (shape === 'cowboyHat') {
    // Sits on the head: wide brim at the hairline, domed crown above, band.
    const c = anchors.forehead;
    ctx.save(); ctx.translate(c.x, c.y - eyeW * 0.25); ctx.rotate(angle);
    // brim
    ctx.fillStyle = '#b98a4e';
    ctx.beginPath(); ctx.ellipse(0, 0, eyeW * 1.55, eyeW * 0.42, 0, 0, Math.PI * 2); ctx.fill();
    // crown (dome)
    ctx.fillStyle = '#a9793f';
    ctx.beginPath();
    ctx.moveTo(-eyeW * 0.78, eyeW * 0.05);
    ctx.quadraticCurveTo(-eyeW * 0.72, -eyeW * 1.15, 0, -eyeW * 1.2);
    ctx.quadraticCurveTo(eyeW * 0.72, -eyeW * 1.15, eyeW * 0.78, eyeW * 0.05);
    ctx.closePath(); ctx.fill();
    // band
    ctx.fillStyle = '#6f4a22';
    ctx.beginPath(); ctx.ellipse(0, -eyeW * 0.02, eyeW * 0.8, eyeW * 0.16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  } else if (shape === 'blush') {
    for (const c of [anchors.leftCheek, anchors.rightCheek]) {
      const grd = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, eyeW * 0.5);
      grd.addColorStop(0, 'rgba(255,110,130,0.45)'); grd.addColorStop(1, 'rgba(255,110,130,0)');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(c.x, c.y, eyeW * 0.5, 0, Math.PI * 2); ctx.fill();
    }
  }
}
