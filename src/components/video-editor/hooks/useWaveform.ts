'use client';

/**
 * useWaveform — decodes an audio URL into normalized amplitude peaks for drawing
 * a waveform on the timeline. Results are cached per URL so re-selecting a track
 * (or mounting the hook in two places) decodes only once. Fails gracefully to an
 * empty array (the caller falls back to a plain bar).
 */

import { useEffect, useState } from 'react';

export interface WaveformData {
  peaks: number[];
  duration: number; // seconds
}

const cache = new Map<string, WaveformData>();
let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  return audioCtx;
}

export function useWaveform(url: string | null, buckets = 240): WaveformData {
  const [data, setData] = useState<WaveformData>(() => (url && cache.get(url)) || { peaks: [], duration: 0 });

  useEffect(() => {
    if (!url) { setData({ peaks: [], duration: 0 }); return; }
    const cached = cache.get(url);
    if (cached) { setData(cached); return; }

    let cancelled = false;
    (async () => {
      try {
        const ctx = getCtx();
        if (!ctx) return;
        const res = await fetch(url);
        const buf = await res.arrayBuffer();
        const audio = await ctx.decodeAudioData(buf);
        const channel = audio.getChannelData(0);
        const block = Math.floor(channel.length / buckets) || 1;
        const peaks: number[] = [];
        for (let i = 0; i < buckets; i++) {
          let sum = 0;
          const start = i * block;
          for (let j = 0; j < block; j++) sum += Math.abs(channel[start + j] || 0);
          peaks.push(sum / block);
        }
        const max = Math.max(...peaks, 0.0001);
        const result: WaveformData = { peaks: peaks.map((p) => p / max), duration: audio.duration };
        cache.set(url, result);
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) setData({ peaks: [], duration: 0 });
      }
    })();

    return () => { cancelled = true; };
  }, [url, buckets]);

  return data;
}
