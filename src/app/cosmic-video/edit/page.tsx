'use client';

/**
 * Cosmic Video Editor — CapCut-lite editing page.
 *
 * Reads ?videoId=xxx&url=encodedVideoUrl from the query string,
 * loads the source video, and renders the full editor UI.
 */

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useVideoEditorStore } from '@/stores/videoEditorStore';
import { EditorLayout } from '@/components/video-editor/EditorLayout';
import { Loader2 } from 'lucide-react';

/**
 * Parse MP4 moov/mvhd atom to extract video duration.
 * Works with the first chunk of the file (faststart MP4s).
 */
function parseMp4Duration(data: DataView): number | null {
  const len = data.byteLength;

  // Walk top-level boxes to find 'moov'
  function findBox(start: number, end: number, target: string): { offset: number; size: number } | null {
    let pos = start;
    while (pos + 8 <= end) {
      const size = data.getUint32(pos);
      const type = String.fromCharCode(
        data.getUint8(pos + 4), data.getUint8(pos + 5),
        data.getUint8(pos + 6), data.getUint8(pos + 7),
      );
      if (size < 8) return null; // invalid box
      if (type === target) return { offset: pos, size };
      pos += size;
    }
    return null;
  }

  const moov = findBox(0, len, 'moov');
  if (!moov) return null;

  const mvhd = findBox(moov.offset + 8, Math.min(moov.offset + moov.size, len), 'mvhd');
  if (!mvhd) return null;

  const headerStart = mvhd.offset + 8; // skip box size + type
  if (headerStart + 4 > len) return null;

  const version = data.getUint8(headerStart);
  // version 0: 4-byte fields; version 1: 8-byte fields
  if (version === 0) {
    // creation(4) + modification(4) + timescale(4) + duration(4)
    const tsOff = headerStart + 4 + 4 + 4; // skip version(1)+flags(3)+creation(4)+modification(4)
    if (tsOff + 8 > len) return null;
    const timescale = data.getUint32(tsOff);
    const duration = data.getUint32(tsOff + 4);
    return timescale > 0 ? duration / timescale : null;
  } else if (version === 1) {
    // creation(8) + modification(8) + timescale(4) + duration(8)
    const tsOff = headerStart + 4 + 8 + 8; // skip version(1)+flags(3)+creation(8)+modification(8)
    if (tsOff + 12 > len) return null;
    const timescale = data.getUint32(tsOff);
    // Read 64-bit duration (only lower 32 bits for videos < ~49k hours)
    const durationHi = data.getUint32(tsOff + 4);
    const durationLo = data.getUint32(tsOff + 8);
    const duration = durationHi * 0x100000000 + durationLo;
    return timescale > 0 ? duration / timescale : null;
  }
  return null;
}

function EditorPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoUrl = searchParams.get('url') || '';
  const videoId = searchParams.get('videoId') || '';
  const init = useVideoEditorStore((s) => s.init);
  const sourceVideoUrl = useVideoEditorStore((s) => s.sourceVideoUrl);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoUrl) {
      setError('No video URL provided.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    // Parse MP4 duration from file headers via fetch.
    // This avoids Chrome's <video> element preload issues under COEP/COOP.
    async function probeDuration() {
      try {
        // If duration was passed as a URL param, use it directly
        const paramDuration = searchParams.get('duration');
        if (paramDuration) {
          const d = parseFloat(paramDuration);
          if (d > 0 && isFinite(d)) {
            if (!cancelled) { init(videoUrl, d); setLoading(false); }
            return;
          }
        }

        // Fetch first 64KB to find moov/mvhd atoms (faststart MP4s have moov at the start)
        const resp = await fetch(videoUrl, {
          mode: 'cors',
          headers: { Range: 'bytes=0-65535' },
        });
        if (!resp.ok && resp.status !== 206) throw new Error('Fetch failed: ' + resp.status);
        const buf = new DataView(await (await resp.blob()).arrayBuffer());

        const duration = parseMp4Duration(buf);
        if (duration && duration > 0 && isFinite(duration)) {
          if (!cancelled) { init(videoUrl, duration); setLoading(false); }
          return;
        }

        // Fallback: if moov wasn't in the first 64KB (not faststart),
        // use a default duration and let the video element update it later
        if (!cancelled) { init(videoUrl, 30); setLoading(false); }
      } catch (e) {
        if (!cancelled) {
          setError('Failed to load video. The URL may be invalid or expired.');
          setLoading(false);
        }
      }
    }

    probeDuration();
    return () => { cancelled = true; };
  }, [videoUrl, searchParams, init]);

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
        <div className="text-red-400 text-center max-w-md">
          <p className="text-lg font-medium mb-2">Could not load video</p>
          <p className="text-sm text-text-muted">{error}</p>
        </div>
        <button
          onClick={() => router.push('/cosmic-video')}
          className="px-6 py-2 rounded-xl bg-accent-primary text-white text-sm font-medium hover:bg-accent-primary/90 transition-colors"
        >
          Back to Videos
        </button>
      </div>
    );
  }

  if (loading || !sourceVideoUrl) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
        <p className="text-text-muted text-sm">Loading editor...</p>
      </div>
    );
  }

  return <EditorLayout videoId={videoId} />;
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
        </div>
      }
    >
      <EditorPageInner />
    </Suspense>
  );
}
