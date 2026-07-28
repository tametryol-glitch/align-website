/**
 * Beat detection — energy-onset analysis of an audio file (Web Audio, client
 * side). Returns onset times in seconds, used to cut the video to the beat
 * (the CapCut "auto-cut to beat" move). Approximate but musically useful for
 * montage cuts; no server or ML needed.
 */

export async function detectBeats(url: string, opts?: { minGapSec?: number; sensitivity?: number }): Promise<number[]> {
  const minGap = opts?.minGapSec ?? 0.28;
  const sensitivity = opts?.sensitivity ?? 1.4;

  const resp = await fetch(url);
  const arrayBuf = await resp.arrayBuffer();
  const AudioCtx: typeof AudioContext =
    (window as unknown as { AudioContext: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  try {
    const buf = await ctx.decodeAudioData(arrayBuf);
    const data = buf.getChannelData(0);
    const sr = buf.sampleRate;
    const win = Math.max(256, Math.floor(sr * 0.03)); // ~30ms energy windows

    // Per-window RMS energy.
    const energies: number[] = [];
    for (let i = 0; i < data.length; i += win) {
      let e = 0;
      const end = Math.min(i + win, data.length);
      for (let j = i; j < end; j++) e += data[j] * data[j];
      energies.push(e / (end - i));
    }

    // Onset = window whose energy jumps above the recent local average.
    const beats: number[] = [];
    const historyN = 24;
    let last = -Infinity;
    for (let k = 1; k < energies.length; k++) {
      const start = Math.max(0, k - historyN);
      let avg = 0;
      for (let m = start; m < k; m++) avg += energies[m];
      avg /= Math.max(1, k - start);
      if (energies[k] > avg * sensitivity && energies[k] > 1e-5) {
        const t = (k * win) / sr;
        if (t - last > minGap) { beats.push(Math.round(t * 100) / 100); last = t; }
      }
    }
    return beats;
  } finally {
    ctx.close();
  }
}
