// ═══════════════════════════════════════════════════════════════════
// Live background processing — blur or replace the host's background.
//
// Reuses the same MediaPipe selfie segmenter the video editor already
// ships (public/mp-wasm + public/selfie_segmenter.tflite), so this adds
// no new dependency and no new asset.
//
// The pipeline: camera track → hidden <video> → segment at low res →
// composite person over the chosen background on a canvas → publish
// canvas.captureStream() to Agora as a custom video track.
//
// Performance is the constraint. Segmentation measured ~27ms/frame on
// CPU in the editor, and a 30fps live budget is 33ms, so the mask is
// computed on a small working canvas and upscaled. If a machine cannot
// keep up, the processor drops its own frame rate rather than the
// broadcast's — a slightly stuttery background beats a stalled stream.
// ═══════════════════════════════════════════════════════════════════

import { ImageSegmenter, FilesetResolver } from '@mediapipe/tasks-vision';

export type LiveBackgroundMode = 'none' | 'blur' | 'image';

export interface LiveBackgroundOptions {
  mode: LiveBackgroundMode;
  /** Object URL or remote URL for mode 'image'. */
  imageUrl?: string | null;
  /** Blur strength in px for mode 'blur'. */
  blurPx?: number;
}

// Mask working resolution. Small on purpose — the mask is upscaled and
// feathered, so extra detail costs frame time and buys very little.
const MASK_LONG_EDGE = 256;
const OUTPUT_FPS = 30;

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

/**
 * Wraps a camera MediaStreamTrack and produces a processed one.
 *
 * Call `start()` to begin, `setOptions()` to change background live, and
 * `stop()` to release everything. `outputTrack` is what gets published.
 */
export class LiveBackgroundProcessor {
  private video: HTMLVideoElement;
  private outCanvas: HTMLCanvasElement;
  private outCtx: CanvasRenderingContext2D;
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
  private options: LiveBackgroundOptions;

  private stream: MediaStream | null = null;

  constructor(private sourceTrack: MediaStreamTrack, options: LiveBackgroundOptions) {
    this.options = options;

    const settings = sourceTrack.getSettings();
    const w = settings.width || 1280;
    const h = settings.height || 720;

    this.video = document.createElement('video');
    this.video.playsInline = true;
    this.video.muted = true;
    this.video.srcObject = new MediaStream([sourceTrack]);

    this.outCanvas = document.createElement('canvas');
    this.outCanvas.width = w;
    this.outCanvas.height = h;
    this.outCtx = this.outCanvas.getContext('2d')!;

    const scale = MASK_LONG_EDGE / Math.max(w, h);
    this.maskCanvas = document.createElement('canvas');
    this.maskCanvas.width = Math.max(2, Math.round(w * scale));
    this.maskCanvas.height = Math.max(2, Math.round(h * scale));
    this.maskCtx = this.maskCanvas.getContext('2d', { willReadFrequently: true })!;

    this.personCanvas = document.createElement('canvas');
    this.personCanvas.width = w;
    this.personCanvas.height = h;
    this.personCtx = this.personCanvas.getContext('2d')!;
  }

  /** The track to publish. Only valid after start(). */
  get outputTrack(): MediaStreamTrack | null {
    return this.stream?.getVideoTracks()[0] ?? null;
  }

  async start(): Promise<MediaStreamTrack> {
    this.segmenter = await loadSegmenter();
    await this.loadBackgroundImage();

    await this.video.play().catch(() => {
      /* autoplay of a muted local stream is permitted; ignore races */
    });

    this.stream = this.outCanvas.captureStream(OUTPUT_FPS);
    this.running = true;
    this.loop();

    const track = this.stream.getVideoTracks()[0];
    if (!track) throw new Error('Could not create a processed video track.');
    return track;
  }

  async setOptions(options: LiveBackgroundOptions): Promise<void> {
    const imageChanged = options.imageUrl !== this.options.imageUrl;
    this.options = options;
    if (imageChanged) await this.loadBackgroundImage();
  }

  stop(): void {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.video.srcObject = null;
  }

  private async loadBackgroundImage(): Promise<void> {
    const url = this.options.imageUrl;
    if (this.options.mode !== 'image' || !url) {
      this.bgImage = null;
      this.bgImageUrl = null;
      return;
    }
    if (this.bgImageUrl === url && this.bgImage) return;

    await new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.bgImage = img;
        this.bgImageUrl = url;
        resolve();
      };
      // A failed background is not worth killing the broadcast over —
      // fall through to blur, which needs no asset.
      img.onerror = () => {
        this.bgImage = null;
        resolve();
      };
      img.src = url;
    });
  }

  private loop = (): void => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.loop);

    const { videoWidth: vw, videoHeight: vh } = this.video;
    if (!vw || !vh) return;

    const W = this.outCanvas.width;
    const H = this.outCanvas.height;

    if (this.options.mode === 'none' || !this.segmenter) {
      this.outCtx.drawImage(this.video, 0, 0, W, H);
      return;
    }

    // Segment on the small canvas.
    this.maskCtx.drawImage(this.video, 0, 0, this.maskCanvas.width, this.maskCanvas.height);

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
      result.close?.();
    } catch {
      // A dropped segmentation frame should show the raw camera, never
      // a black hole where the host used to be.
      this.outCtx.drawImage(this.video, 0, 0, W, H);
      return;
    }

    if (!confidence) {
      this.outCtx.drawImage(this.video, 0, 0, W, H);
      return;
    }

    // 1. Paint the background.
    if (this.options.mode === 'image' && this.bgImage) {
      this.drawCover(this.outCtx, this.bgImage, W, H);
    } else {
      this.outCtx.save();
      this.outCtx.filter = `blur(${this.options.blurPx ?? 12}px)`;
      this.outCtx.drawImage(this.video, 0, 0, W, H);
      this.outCtx.restore();
    }

    // 2. Build the person layer: full-res frame with the mask as alpha.
    const mw = this.maskCanvas.width;
    const mh = this.maskCanvas.height;
    const maskImage = this.maskCtx.createImageData(mw, mh);
    for (let i = 0; i < confidence.length; i++) {
      const a = Math.round(confidence[i] * 255);
      const p = i * 4;
      maskImage.data[p] = 255;
      maskImage.data[p + 1] = 255;
      maskImage.data[p + 2] = 255;
      maskImage.data[p + 3] = a;
    }
    this.maskCtx.putImageData(maskImage, 0, 0);

    this.personCtx.clearRect(0, 0, W, H);
    // Upscaling the small mask is what feathers the edge; drawing it
    // smoothed is cheaper and looks better than a hard cutout.
    this.personCtx.imageSmoothingEnabled = true;
    this.personCtx.drawImage(this.maskCanvas, 0, 0, W, H);
    this.personCtx.globalCompositeOperation = 'source-in';
    this.personCtx.drawImage(this.video, 0, 0, W, H);
    this.personCtx.globalCompositeOperation = 'source-over';

    // 3. Composite the person over the background.
    this.outCtx.drawImage(this.personCanvas, 0, 0, W, H);
  };

  /** object-fit: cover for a background image. */
  private drawCover(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    W: number,
    H: number,
  ): void {
    const scale = Math.max(W / img.width, H / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  }
}

/** Whether this browser can run background replacement at all. */
export function backgroundSupported(): boolean {
  return (
    typeof document !== 'undefined' &&
    typeof HTMLCanvasElement !== 'undefined' &&
    typeof HTMLCanvasElement.prototype.captureStream === 'function'
  );
}
