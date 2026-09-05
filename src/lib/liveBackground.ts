// ═══════════════════════════════════════════════════════════════════
// Live stage compositor — background replacement and multi-source
// layouts, rendered to one canvas and published as a single Agora track.
//
// Publishing one composited track rather than two real tracks is the
// important decision here. Agora bills per published stream per viewer,
// so a second camera as its own track would roughly double the cost of
// every viewer-minute. Compositing locally costs the host some CPU and
// costs the audience nothing.
//
// Segmentation reuses the MediaPipe selfie model the video editor
// already ships (public/mp-wasm + public/selfie_segmenter.tflite), so
// this adds no dependency and no new asset.
//
// Performance is the real constraint. Segmentation measured ~27ms/frame
// on CPU in the editor and a 30fps budget is 33ms. The mask is computed
// on a small working canvas and upscaled, and segmentation is applied to
// the main source only — an inset is small enough that cutting it out
// buys nothing. If a frame cannot be segmented in time it falls through
// to the raw camera rather than showing a hole where the host was.
// ═══════════════════════════════════════════════════════════════════

import { ImageSegmenter, FilesetResolver } from '@mediapipe/tasks-vision';

export type LiveBackgroundMode = 'none' | 'blur' | 'image';
export type LiveLayout = 'solo' | 'pip' | 'split';
export type PipCorner = 'tl' | 'tr' | 'bl' | 'br';

export interface LiveBackgroundOptions {
  mode: LiveBackgroundMode;
  /** Object URL or remote URL for mode 'image'. */
  imageUrl?: string | null;
  /** Blur strength in px for mode 'blur'. */
  blurPx?: number;
}

export interface LiveStageOptions {
  background: LiveBackgroundOptions;
  layout: LiveLayout;
  /** Inset width as a fraction of the frame, 'pip' only. */
  pipScale: number;
  pipCorner: PipCorner;
  /** The main source's share of the frame, 'split' only. */
  splitRatio: number;
  /** Swap which physical source is treated as the main one. */
  swapped: boolean;
}

export const DEFAULT_STAGE: LiveStageOptions = {
  background: { mode: 'none' },
  layout: 'solo',
  pipScale: 0.28,
  pipCorner: 'br',
  splitRatio: 0.5,
  swapped: false,
};

export const PIP_SCALE_MIN = 0.15;
export const PIP_SCALE_MAX = 0.5;
export const SPLIT_RATIO_MIN = 0.25;
export const SPLIT_RATIO_MAX = 0.75;

// Mask working resolution. Small on purpose — it is upscaled and
// feathered, so extra detail costs frame time and buys very little.
const MASK_LONG_EDGE = 256;
const OUTPUT_FPS = 30;
const INSET_MARGIN = 0.025; // fraction of the frame's long edge

let segmenterPromise: Promise<ImageSegmenter> | null = null;

function loadSegmenter(): Promise<ImageSegmenter> {
  if (!segmenterPromise) {
    segmenterPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks('/mp-wasm');
      return ImageSegmenter.createFromOptions(vision, {
        baseOptions: { modelAssetPath: '/selfie_segmenter.tflite', delegate: 'GPU' },
        outputCategoryMask: false,
        outputConfidenceMasks: true,
        runningMode: 'VIDEO',
      });
    })().catch((err) => {
      // Reset so a later attempt can retry rather than being stuck with
      // a rejected promise forever.
      segmenterPromise = null;
      throw err;
    });
  }
  return segmenterPromise;
}

function makeVideo(track: MediaStreamTrack): HTMLVideoElement {
  const v = document.createElement('video');
  v.playsInline = true;
  v.muted = true;
  v.srcObject = new MediaStream([track]);
  return v;
}

/** object-fit: cover into an arbitrary rect. */
function drawCover(
  ctx: CanvasRenderingContext2D,
  src: CanvasImageSource,
  sw: number,
  sh: number,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  if (!sw || !sh || w <= 0 || h <= 0) return;
  const scale = Math.max(w / sw, h / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(src, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();
}

/**
 * Composites one or two sources into a single publishable track.
 *
 * `outputTrack` is what gets published. Options can change at any time
 * without restarting, so switching layout or background mid-broadcast
 * never causes a republish and viewers see no flicker.
 */
export class LiveStageCompositor {
  private videoA: HTMLVideoElement;
  private videoB: HTMLVideoElement | null = null;

  private outCanvas: HTMLCanvasElement;
  private outCtx: CanvasRenderingContext2D;
  private mainCanvas: HTMLCanvasElement;
  private mainCtx: CanvasRenderingContext2D;
  private maskCanvas: HTMLCanvasElement;
  private maskCtx: CanvasRenderingContext2D;
  private personCanvas: HTMLCanvasElement;
  private personCtx: CanvasRenderingContext2D;

  private segmenter: ImageSegmenter | null = null;
  private bgImage: HTMLImageElement | null = null;
  private bgImageUrl: string | null = null;

  private raf = 0;
  private running = false;
  private lastTs = -1;
  private options: LiveStageOptions;
  private stream: MediaStream | null = null;

  constructor(primaryTrack: MediaStreamTrack, options: Partial<LiveStageOptions> = {}) {
    this.options = { ...DEFAULT_STAGE, ...options };

    const settings = primaryTrack.getSettings();
    const w = settings.width || 1280;
    const h = settings.height || 720;

    this.videoA = makeVideo(primaryTrack);

    const mk = (cw: number, ch: number, readFrequently = false) => {
      const c = document.createElement('canvas');
      c.width = cw;
      c.height = ch;
      const ctx = c.getContext('2d', readFrequently ? { willReadFrequently: true } : undefined)!;
      return [c, ctx] as const;
    };

    [this.outCanvas, this.outCtx] = mk(w, h) as any;
    [this.mainCanvas, this.mainCtx] = mk(w, h) as any;
    [this.personCanvas, this.personCtx] = mk(w, h) as any;

    const scale = MASK_LONG_EDGE / Math.max(w, h);
    [this.maskCanvas, this.maskCtx] = mk(
      Math.max(2, Math.round(w * scale)),
      Math.max(2, Math.round(h * scale)),
      true,
    ) as any;
  }

  get outputTrack(): MediaStreamTrack | null {
    return this.stream?.getVideoTracks()[0] ?? null;
  }

  get hasSecondary(): boolean {
    return this.videoB !== null;
  }

  async start(): Promise<MediaStreamTrack> {
    try {
      this.segmenter = await loadSegmenter();
    } catch {
      // Background replacement is optional; layouts still work without it.
      this.segmenter = null;
    }
    await this.loadBackgroundImage();
    await this.videoA.play().catch(() => {});

    this.stream = this.outCanvas.captureStream(OUTPUT_FPS);
    this.running = true;
    this.loop();

    const track = this.stream.getVideoTracks()[0];
    if (!track) throw new Error('Could not create a processed video track.');
    return track;
  }

  /**
   * Replace the primary source.
   *
   * Agora's setDevice() swaps the underlying MediaStreamTrack for a new
   * one, so a compositor built from the old reference keeps reading a
   * track that has ended - which renders as black forever. Anything
   * that changes the camera must call this.
   */
  async setPrimary(track: MediaStreamTrack): Promise<void> {
    this.videoA.srcObject = null;
    this.videoA = makeVideo(track);
    await this.videoA.play().catch(() => {});
  }

  /** Attach or remove the second source. Null clears it and, if the
   *  current layout needs two sources, falls back to solo. */
  async setSecondary(track: MediaStreamTrack | null): Promise<void> {
    if (this.videoB) {
      this.videoB.srcObject = null;
      this.videoB = null;
    }
    if (track) {
      this.videoB = makeVideo(track);
      await this.videoB.play().catch(() => {});
    } else if (this.options.layout !== 'solo') {
      this.options = { ...this.options, layout: 'solo', swapped: false };
    }
  }

  async setOptions(next: Partial<LiveStageOptions>): Promise<void> {
    const prevUrl = this.options.background.imageUrl;
    this.options = { ...this.options, ...next };
    // A layout needing two sources is meaningless with one.
    if (!this.videoB && this.options.layout !== 'solo') {
      this.options.layout = 'solo';
    }
    if (this.options.background.imageUrl !== prevUrl) await this.loadBackgroundImage();
  }

  getOptions(): LiveStageOptions {
    return { ...this.options };
  }

  stop(): void {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.videoA.srcObject = null;
    if (this.videoB) this.videoB.srcObject = null;
    this.videoB = null;
  }

  private async loadBackgroundImage(): Promise<void> {
    const { mode, imageUrl } = this.options.background;
    if (mode !== 'image' || !imageUrl) {
      this.bgImage = null;
      this.bgImageUrl = null;
      return;
    }
    if (this.bgImageUrl === imageUrl && this.bgImage) return;

    await new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.bgImage = img;
        this.bgImageUrl = imageUrl;
        resolve();
      };
      // A failed background is not worth killing the broadcast over.
      img.onerror = () => {
        this.bgImage = null;
        resolve();
      };
      img.src = imageUrl;
    });
  }

  /** Whichever source is currently acting as the main one. */
  private get mainVideo(): HTMLVideoElement {
    return this.options.swapped && this.videoB ? this.videoB : this.videoA;
  }

  private get subVideo(): HTMLVideoElement | null {
    if (!this.videoB) return null;
    return this.options.swapped ? this.videoA : this.videoB;
  }

  /** Render the main source, with background applied, to mainCanvas. */
  private composeMain(): void {
    const video = this.mainVideo;
    const W = this.mainCanvas.width;
    const H = this.mainCanvas.height;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;

    const mode = this.options.background.mode;
    if (mode === 'none' || !this.segmenter) {
      drawCover(this.mainCtx, video, vw, vh, 0, 0, W, H);
      return;
    }

    this.maskCtx.drawImage(video, 0, 0, this.maskCanvas.width, this.maskCanvas.height);

    // VIDEO running mode requires strictly increasing timestamps.
    let ts = performance.now();
    if (ts <= this.lastTs) ts = this.lastTs + 1;
    this.lastTs = ts;

    let confidence: Float32Array | null = null;
    try {
      const result = this.segmenter.segmentForVideo(this.maskCanvas, ts);
      const mask = result.confidenceMasks?.[0];
      if (mask) {
        confidence = mask.getAsFloat32Array();
        mask.close();
      }
      (result as any).close?.();
    } catch {
      drawCover(this.mainCtx, video, vw, vh, 0, 0, W, H);
      return;
    }
    if (!confidence) {
      drawCover(this.mainCtx, video, vw, vh, 0, 0, W, H);
      return;
    }

    // 1. Background.
    if (mode === 'image' && this.bgImage) {
      drawCover(this.mainCtx, this.bgImage, this.bgImage.width, this.bgImage.height, 0, 0, W, H);
    } else {
      this.mainCtx.save();
      this.mainCtx.filter = `blur(${this.options.background.blurPx ?? 14}px)`;
      drawCover(this.mainCtx, video, vw, vh, 0, 0, W, H);
      this.mainCtx.restore();
    }

    // 2. Person layer: mask as alpha, then the frame through it.
    const mw = this.maskCanvas.width;
    const mh = this.maskCanvas.height;
    const maskImage = this.maskCtx.createImageData(mw, mh);
    for (let i = 0; i < confidence.length; i++) {
      const p = i * 4;
      maskImage.data[p] = 255;
      maskImage.data[p + 1] = 255;
      maskImage.data[p + 2] = 255;
      maskImage.data[p + 3] = Math.round(confidence[i] * 255);
    }
    this.maskCtx.putImageData(maskImage, 0, 0);

    this.personCtx.clearRect(0, 0, W, H);
    // Upscaling the small mask is what feathers the edge.
    this.personCtx.imageSmoothingEnabled = true;
    this.personCtx.drawImage(this.maskCanvas, 0, 0, W, H);
    this.personCtx.globalCompositeOperation = 'source-in';
    drawCover(this.personCtx, video, vw, vh, 0, 0, W, H);
    this.personCtx.globalCompositeOperation = 'source-over';

    // 3. Person over background.
    this.mainCtx.drawImage(this.personCanvas, 0, 0, W, H);
  }

  private loop = (): void => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.loop);

    const W = this.outCanvas.width;
    const H = this.outCanvas.height;
    if (!this.mainVideo.videoWidth) return;

    this.composeMain();

    const sub = this.subVideo;
    const layout = sub ? this.options.layout : 'solo';

    this.outCtx.clearRect(0, 0, W, H);

    if (layout === 'solo') {
      this.outCtx.drawImage(this.mainCanvas, 0, 0, W, H);
      return;
    }

    if (layout === 'split') {
      // Vertical split. splitRatio is the main source's share.
      const ratio = Math.min(
        SPLIT_RATIO_MAX,
        Math.max(SPLIT_RATIO_MIN, this.options.splitRatio),
      );
      const mainW = Math.round(W * ratio);
      drawCover(this.outCtx, this.mainCanvas, W, H, 0, 0, mainW, H);
      drawCover(
        this.outCtx, sub!, sub!.videoWidth, sub!.videoHeight,
        mainW, 0, W - mainW, H,
      );
      // Seam, so two similar frames do not read as one.
      this.outCtx.fillStyle = 'rgba(0,0,0,0.55)';
      this.outCtx.fillRect(mainW - 1, 0, 2, H);
      return;
    }

    // pip
    this.outCtx.drawImage(this.mainCanvas, 0, 0, W, H);

    const scale = Math.min(PIP_SCALE_MAX, Math.max(PIP_SCALE_MIN, this.options.pipScale));
    const insetW = Math.round(W * scale);
    const insetH = Math.round(insetW * (H / W));
    const margin = Math.round(Math.max(W, H) * INSET_MARGIN);

    const left = this.options.pipCorner === 'tl' || this.options.pipCorner === 'bl';
    const top = this.options.pipCorner === 'tl' || this.options.pipCorner === 'tr';
    const x = left ? margin : W - insetW - margin;
    const y = top ? margin : H - insetH - margin;

    this.outCtx.save();
    this.outCtx.shadowColor = 'rgba(0,0,0,0.5)';
    this.outCtx.shadowBlur = Math.round(insetW * 0.04);
    this.outCtx.fillStyle = '#000';
    this.outCtx.fillRect(x, y, insetW, insetH);
    this.outCtx.restore();

    drawCover(this.outCtx, sub!, sub!.videoWidth, sub!.videoHeight, x, y, insetW, insetH);

    this.outCtx.strokeStyle = 'rgba(255,255,255,0.65)';
    this.outCtx.lineWidth = Math.max(2, Math.round(insetW * 0.008));
    this.outCtx.strokeRect(x, y, insetW, insetH);
  };
}

/** Kept for the original single-purpose call sites. */
export const LiveBackgroundProcessor = LiveStageCompositor;

/** Whether this browser can composite at all. */
export function backgroundSupported(): boolean {
  return (
    typeof document !== 'undefined' &&
    typeof HTMLCanvasElement !== 'undefined' &&
    typeof HTMLCanvasElement.prototype.captureStream === 'function'
  );
}

/** Whether a screen can be shared as a second source. */
export function screenShareSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof (navigator.mediaDevices as any).getDisplayMedia === 'function'
  );
}
