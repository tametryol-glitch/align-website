'use client';

/**
 * useVideoThumbnail — grabs a single representative frame from the source video
 * as a data URL, for previewing filters on the user's ACTUAL footage (like
 * TikTok). Cached per URL; bails to null on CORS taint so callers can fall back
 * to a gradient swatch.
 */

import { useEffect, useState } from 'react';

const cache = new Map<string, string>();

export function useVideoThumbnail(url: string, atFraction = 0.4): string | null {
  const [thumb, setThumb] = useState<string | null>(() => (url && cache.get(url)) || null);

  useEffect(() => {
    if (!url) { setThumb(null); return; }
    const cached = cache.get(url);
    if (cached) { setThumb(cached); return; }

    let cancelled = false;
    const v = document.createElement('video');
    v.crossOrigin = 'anonymous';
    v.muted = true;
    v.preload = 'auto';
    v.src = url;
    const canvas = document.createElement('canvas');

    const cleanup = () => {
      v.removeEventListener('loadeddata', onLoaded);
      v.removeEventListener('seeked', onSeeked);
      v.src = '';
    };
    const onSeeked = () => {
      if (cancelled) return;
      try {
        const w = 96;
        const h = v.videoHeight && v.videoWidth ? Math.round(w * (v.videoHeight / v.videoWidth)) : 170;
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { cleanup(); return; }
        ctx.drawImage(v, 0, 0, w, h);
        const data = canvas.toDataURL('image/jpeg', 0.6); // throws if tainted
        cache.set(url, data);
        if (!cancelled) setThumb(data);
      } catch { /* CORS taint → leave null, caller falls back */ }
      cleanup();
    };
    const onLoaded = () => {
      try {
        const d = v.duration && isFinite(v.duration) ? v.duration : 1;
        v.currentTime = Math.min(d * atFraction, Math.max(0, d - 0.05));
      } catch { /* seek not ready */ }
    };

    v.addEventListener('loadeddata', onLoaded);
    v.addEventListener('seeked', onSeeked);
    return () => { cancelled = true; cleanup(); };
  }, [url, atFraction]);

  return thumb;
}
