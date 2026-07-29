// Data-driven face-filter framework. Each filter is a list of "pieces" anchored
// to face landmarks — add a filter by adding a config entry (+ an emoji, a drawn
// shape, or a transparent PNG asset). Shared by web preview and server renderer.
//
// Design rule: filters AUGMENT the face (hats, glasses, ears), they never cover
// it with a whole-face graphic. Every piece gets a soft drop-shadow so it reads
// as sitting ON the person, not floating.

export type Anchor =
  | 'eyes' | 'leftEye' | 'rightEye' | 'nose' | 'forehead' | 'aboveHead'
  | 'headLeft' | 'headRight' | 'mouth' | 'chin' | 'leftCheek' | 'rightCheek';

export type FilterPiece =
  | { kind: 'emoji'; emoji: string; anchor: Anchor; scale: number; dx?: number; dy?: number; rotate?: boolean }
  | { kind: 'shape'; shape: ShapeId }
  // Transparent PNG asset (put files in public/filters/, src = staticFile path).
  | { kind: 'image'; src: string; anchor: Anchor; scale: number; dx?: number; dy?: number; rotate?: boolean };

export type ShapeId = 'sunglasses' | 'halo' | 'dogEars' | 'bunnyEars' | 'devilHorns' | 'blush' | 'cowboyHat' | 'crown';

export interface FaceFilter { id: string; name: string; icon: string; pieces: FilterPiece[]; }

export const FACE_FILTERS: FaceFilter[] = [
  { id: 'sunglasses', name: 'Shades', icon: '🕶️', pieces: [{ kind: 'shape', shape: 'sunglasses' }] },
  { id: 'crown', name: 'Crown', icon: '👑', pieces: [{ kind: 'shape', shape: 'crown' }] },
  { id: 'halo', name: 'Halo', icon: '😇', pieces: [{ kind: 'shape', shape: 'halo' }] },
  { id: 'dogEars', name: 'Puppy', icon: '🐶', pieces: [{ kind: 'shape', shape: 'dogEars' }, { kind: 'emoji', emoji: '🐽', anchor: 'nose', scale: 0.55, rotate: true }] },
  { id: 'bunny', name: 'Bunny', icon: '🐰', pieces: [{ kind: 'shape', shape: 'bunnyEars' }] },
  { id: 'devil', name: 'Devil', icon: '😈', pieces: [{ kind: 'shape', shape: 'devilHorns' }] },
  { id: 'cowboy', name: 'Cowboy', icon: '🤠', pieces: [{ kind: 'shape', shape: 'cowboyHat' }] },
  { id: 'blush', name: 'Cute', icon: '🥰', pieces: [{ kind: 'shape', shape: 'blush' }, { kind: 'emoji', emoji: '✨', anchor: 'rightEye', scale: 0.5, dx: 1.1, dy: -0.9 }] },
  { id: 'hearts', name: 'In Love', icon: '😍', pieces: [{ kind: 'emoji', emoji: '💕', anchor: 'leftCheek', scale: 0.7, dx: -0.6 }, { kind: 'emoji', emoji: '💕', anchor: 'rightCheek', scale: 0.7, dx: 0.6 }, { kind: 'emoji', emoji: '💖', anchor: 'aboveHead', scale: 0.8, dy: -0.2 }] },
  { id: 'flowerCrown', name: 'Flowers', icon: '🌸', pieces: [{ kind: 'emoji', emoji: '🌸', anchor: 'forehead', scale: 0.65, dx: -1.4, dy: -0.9, rotate: true }, { kind: 'emoji', emoji: '🌷', anchor: 'forehead', scale: 0.65, dx: -0.7, dy: -1.05, rotate: true }, { kind: 'emoji', emoji: '🌼', anchor: 'forehead', scale: 0.65, dy: -1.1, rotate: true }, { kind: 'emoji', emoji: '🌷', anchor: 'forehead', scale: 0.65, dx: 0.7, dy: -1.05, rotate: true }, { kind: 'emoji', emoji: '🌸', anchor: 'forehead', scale: 0.65, dx: 1.4, dy: -0.9, rotate: true }] },
  { id: 'party', name: 'Party', icon: '🥳', pieces: [{ kind: 'emoji', emoji: '🎉', anchor: 'headLeft', scale: 0.95, rotate: true }, { kind: 'emoji', emoji: '🎊', anchor: 'headRight', scale: 0.95, rotate: true }] },
  { id: 'stars', name: 'Stars', icon: '🤩', pieces: [{ kind: 'emoji', emoji: '⭐', anchor: 'aboveHead', scale: 0.7, dx: -1.3, dy: 0.1 }, { kind: 'emoji', emoji: '🌟', anchor: 'aboveHead', scale: 0.95 }, { kind: 'emoji', emoji: '⭐', anchor: 'aboveHead', scale: 0.7, dx: 1.3, dy: 0.1 }] },
];

// MediaPipe FaceLandmarker indices (468-point mesh).
const L = { leftEyeOut: 33, leftEyeIn: 133, rightEyeOut: 263, rightEyeIn: 362, noseTip: 1, forehead: 10, chin: 152, topLip: 13, botLip: 14, faceLeft: 234, faceRight: 454, leftCheek: 205, rightCheek: 425 };

interface Pt { x: number; y: number; }

/** Draw a filter's pieces onto ctx, anchored to normalized landmarks. `images`
 *  holds any preloaded PNG assets keyed by src (empty if the filter uses none). */
export function drawFaceFilter(
  ctx: CanvasRenderingContext2D,
  lm: Array<{ x: number; y: number }>,
  W: number, H: number,
  filter: FaceFilter,
  images?: Map<string, CanvasImageSource>,
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

  // Soft drop-shadow so accessories sit ON the person, not floating.
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.32)';
  ctx.shadowBlur = eyeW * 0.22;
  ctx.shadowOffsetX = eyeW * 0.03;
  ctx.shadowOffsetY = eyeW * 0.10;

  for (const piece of filter.pieces) {
    if (piece.kind === 'shape') { drawShape(ctx, piece.shape, { leftEye, rightEye, eyeW, angle, anchors }); continue; }
    const a = anchors[piece.anchor];
    const cx = a.x + (piece.dx || 0) * eyeW;
    const cy = a.y + (piece.dy || 0) * eyeW;
    ctx.save();
    ctx.translate(cx, cy);
    if (piece.rotate) ctx.rotate(angle);
    if (piece.kind === 'emoji') {
      const size = eyeW * piece.scale * 2.2;
      ctx.font = `${Math.max(8, Math.round(size))}px "Noto Color Emoji", "Apple Color Emoji", serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(piece.emoji, 0, 0);
    } else {
      const img = images?.get(piece.src);
      if (img) {
        const iw = (img as { width?: number }).width || eyeW * 2;
        const ih = (img as { height?: number }).height || eyeW * 2;
        const w = eyeW * piece.scale * 2.4;
        const h = (ih / iw) * w;
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      }
    }
    ctx.restore();
  }
  ctx.restore();
}

function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: ShapeId,
  g: { leftEye: Pt; rightEye: Pt; eyeW: number; angle: number; anchors: Record<Anchor, Pt> },
): void {
  const { leftEye, rightEye, eyeW, angle, anchors } = g;
  if (shape === 'sunglasses') {
    const lens = eyeW * 0.36;
    for (const e of [leftEye, rightEye]) {
      ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(angle);
      const grd = ctx.createLinearGradient(0, -lens, 0, lens);
      grd.addColorStop(0, 'rgba(30,30,36,0.95)'); grd.addColorStop(1, 'rgba(6,6,8,0.96)');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.ellipse(0, 0, lens, lens * 0.72, 0, 0, Math.PI * 2); ctx.fill();
      // highlight glint
      ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.beginPath(); ctx.ellipse(-lens * 0.35, -lens * 0.3, lens * 0.22, lens * 0.13, -0.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = '#0a0a0c'; ctx.lineWidth = eyeW * 0.07;
    ctx.beginPath(); ctx.moveTo(leftEye.x + lens * Math.cos(angle), leftEye.y + lens * Math.sin(angle));
    ctx.lineTo(rightEye.x - lens * Math.cos(angle), rightEye.y - lens * Math.sin(angle)); ctx.stroke();
  } else if (shape === 'crown') {
    const c = anchors.aboveHead;
    ctx.save(); ctx.translate(c.x, c.y + eyeW * 0.2); ctx.rotate(angle);
    const w = eyeW * 1.7, h = eyeW * 0.9;
    const grd = ctx.createLinearGradient(0, -h, 0, h * 0.4);
    grd.addColorStop(0, '#ffe27a'); grd.addColorStop(1, '#e6a919');
    ctx.fillStyle = grd; ctx.strokeStyle = '#b9860b'; ctx.lineWidth = eyeW * 0.03;
    ctx.beginPath();
    ctx.moveTo(-w / 2, h * 0.35);
    ctx.lineTo(-w / 2, -h * 0.1); ctx.lineTo(-w / 4, h * 0.05); ctx.lineTo(0, -h * 0.55);
    ctx.lineTo(w / 4, h * 0.05); ctx.lineTo(w / 2, -h * 0.1); ctx.lineTo(w / 2, h * 0.35);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // jewels
    for (const [jx, col] of [[-w / 2, '#e23b6d'], [0, '#3ba0e2'], [w / 2, '#e23b6d']] as Array<[number, string]>) {
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(jx, -h * 0.1, eyeW * 0.09, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  } else if (shape === 'halo') {
    const c = anchors.aboveHead;
    ctx.save(); ctx.translate(c.x, c.y - eyeW * 0.2); ctx.rotate(angle);
    ctx.strokeStyle = 'rgba(255,225,120,0.98)'; ctx.lineWidth = eyeW * 0.15;
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
  } else if (shape === 'bunnyEars') {
    for (const side of [-1, 1]) {
      const base = side < 0 ? anchors.headLeft : anchors.headRight;
      ctx.save(); ctx.translate((anchors.aboveHead.x + base.x) / 2, base.y - eyeW * 0.1); ctx.rotate(angle + side * 0.12);
      ctx.fillStyle = '#f7f2f4';
      ctx.beginPath(); ctx.ellipse(0, -eyeW * 0.9, eyeW * 0.28, eyeW * 1.0, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f4b8c6';
      ctx.beginPath(); ctx.ellipse(0, -eyeW * 0.9, eyeW * 0.14, eyeW * 0.72, 0, 0, Math.PI * 2); ctx.fill();
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
    const c = anchors.forehead;
    ctx.save(); ctx.translate(c.x, c.y - eyeW * 0.3); ctx.rotate(angle);
    const brim = ctx.createLinearGradient(0, -eyeW * 0.4, 0, eyeW * 0.4);
    brim.addColorStop(0, '#c79a5c'); brim.addColorStop(1, '#a97c3f');
    ctx.fillStyle = brim; ctx.beginPath(); ctx.ellipse(0, 0, eyeW * 1.55, eyeW * 0.42, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#b1843f';
    ctx.beginPath();
    ctx.moveTo(-eyeW * 0.78, eyeW * 0.05);
    ctx.quadraticCurveTo(-eyeW * 0.5, -eyeW * 1.2, 0, -eyeW * 1.25);
    ctx.quadraticCurveTo(eyeW * 0.5, -eyeW * 1.2, eyeW * 0.78, eyeW * 0.05);
    ctx.closePath(); ctx.fill();
    // crease down the crown
    ctx.strokeStyle = 'rgba(90,60,25,0.5)'; ctx.lineWidth = eyeW * 0.06;
    ctx.beginPath(); ctx.moveTo(0, -eyeW * 1.15); ctx.lineTo(0, -eyeW * 0.1); ctx.stroke();
    ctx.fillStyle = '#6f4a22';
    ctx.beginPath(); ctx.ellipse(0, -eyeW * 0.02, eyeW * 0.8, eyeW * 0.16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  } else if (shape === 'blush') {
    ctx.save(); ctx.shadowColor = 'transparent';
    for (const c of [anchors.leftCheek, anchors.rightCheek]) {
      const grd = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, eyeW * 0.5);
      grd.addColorStop(0, 'rgba(255,110,130,0.5)'); grd.addColorStop(1, 'rgba(255,110,130,0)');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(c.x, c.y, eyeW * 0.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}
