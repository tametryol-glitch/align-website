'use client';

/**
 * Decode an audio (or video) file to amplitude peaks for a timeline waveform,
 * plus the TRUE decoded duration. Slicing the waveform by the real duration
 * (not the clip's stored metadata) keeps the wave aligned with the audio you
 * actually hear. Results are cached per URL; concurrent calls share one decode.
 */

const PEAKS = 2400; // resolution of the cached peak array (whole source)

export interface WaveData {
  peaks: number[];    // 0..1, normalized, whole source
  duration: number;   // real decoded length in seconds
}

const cache = new Map<string, WaveData>();
const inflight = new Map<string, Promise<WaveData>>();

export function getCachedPeaks(url: string): WaveData | undefined {
  return cache.get(url);
}

export async function getPeaks(url: string): Promise<WaveData> {
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
      for (let i = 0; i < PEAKS; i++) peaks[i] = peaks[i] / globalMax;
      const data: WaveData = { peaks, duration: audio.duration };
      cache.set(url, data);
      return data;
    } finally {
      ctx.close();
      inflight.delete(url);
    }
  })();

  inflight.set(url, job);
  return job;
}
