'use client';

/**
 * Decode an audio (or video) file to a set of amplitude peaks for drawing a
 * timeline waveform. Results are cached per URL so each song is only decoded
 * once, and concurrent requests share one in-flight decode.
 */

const PEAKS = 600; // resolution of the cached peak array (whole source)
const cache = new Map<string, number[]>();
const inflight = new Map<string, Promise<number[]>>();

export function getCachedPeaks(url: string): number[] | undefined {
  return cache.get(url);
}

export async function getPeaks(url: string): Promise<number[]> {
  const hit = cache.get(url);
  if (hit) return hit;
  const running = inflight.get(url);
  if (running) return running;

  const job = (async () => {
    const res = await fetch(url);
    const arr = await res.arrayBuffer();
    const Ctx: typeof AudioContext =
      (window as unknown as { AudioContext: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    try {
      const audio = await ctx.decodeAudioData(arr);
      const ch = audio.getChannelData(0);
      const block = Math.max(1, Math.floor(ch.length / PEAKS));
      const peaks: number[] = new Array(PEAKS);
      let globalMax = 0.0001;
      for (let i = 0; i < PEAKS; i++) {
        let max = 0;
        const base = i * block;
        for (let j = 0; j < block; j++) {
          const v = Math.abs(ch[base + j] || 0);
          if (v > max) max = v;
        }
        peaks[i] = max;
        if (max > globalMax) globalMax = max;
      }
      // Normalise to 0..1 so quiet tracks still show a readable waveform.
      for (let i = 0; i < PEAKS; i++) peaks[i] = peaks[i] / globalMax;
      cache.set(url, peaks);
      return peaks;
    } finally {
      ctx.close();
      inflight.delete(url);
    }
  })();

  inflight.set(url, job);
  return job;
}
