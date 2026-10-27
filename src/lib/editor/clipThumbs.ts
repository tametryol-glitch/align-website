/**
 * Filmstrip thumbnails for timeline video clips: seek a hidden <video> to a
 * handful of moments and snapshot each to a tiny JPEG. Runs one clip at a time
 * (decoding several videos at once stalls the editor), caches by source+range,
 * and fails quietly — a clip without thumbnails just keeps its gradient.
 */

const cache = new Map<string, string[]>();
let queue: Promise<unknown> = Promise.resolve();

const TILE_W = 64;
const TILE_H = 112;
const SEEK_TIMEOUT_MS = 2500;

function seekTo(video: HTMLVideoElement, t: number): Promise<void> {
  return new Promise((resolve) => {
    const done = () => { video.removeEventListener('seeked', done); clearTimeout(timer); resolve(); };
    const timer = setTimeout(done, SEEK_TIMEOUT_MS);
    video.addEventListener('seeked', done);
    video.currentTime = t;
  });
}

async function build(url: string, count: number, from: number, to: number): Promise<string[]> {
  const video = document.createElement('video');
  video.muted = true;
  video.preload = 'auto';
  video.playsInline = true;
  video.crossOrigin = 'anonymous';
  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error('load'));
      video.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = TILE_W;
    canvas.height = TILE_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];
    const span = Math.max(0.1, to - from);
    const out: string[] = [];
    for (let i = 0; i < count; i++) {
      await seekTo(video, from + ((i + 0.5) * span) / count);
      const vw = video.videoWidth || TILE_W;
      const vh = video.videoHeight || TILE_H;
      // Cover-crop to the tile.
      const s = Math.max(TILE_W / vw, TILE_H / vh);
      const dw = vw * s;
      const dh = vh * s;
      ctx.drawImage(video, (TILE_W - dw) / 2, (TILE_H - dh) / 2, dw, dh);
      out.push(canvas.toDataURL('image/jpeg', 0.5));
    }
    return out;
  } catch {
    return [];
  } finally {
    video.removeAttribute('src');
    video.load();
  }
}

/** Thumbnails for [from, to] of a video source (count evenly spaced frames). */
export function getClipThumbs(url: string, count: number, from: number, to: number): Promise<string[]> {
  const n = Math.max(1, Math.min(24, Math.round(count)));
  const key = `${url}|${n}|${from.toFixed(1)}|${to.toFixed(1)}`;
  const hit = cache.get(key);
  if (hit) return Promise.resolve(hit);
  const job = queue.then(() => build(url, n, from, to)).then((thumbs) => {
    if (thumbs.length) {
      if (cache.size > 60) cache.delete(cache.keys().next().value as string);
      cache.set(key, thumbs);
    }
    return thumbs;
  });
  queue = job.catch(() => undefined);
  return job;
}

/** Cached result, if any, without starting work. */
export function getCachedThumbs(url: string, count: number, from: number, to: number): string[] | undefined {
  const n = Math.max(1, Math.min(24, Math.round(count)));
  return cache.get(`${url}|${n}|${from.toFixed(1)}|${to.toFixed(1)}`);
}
