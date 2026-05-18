'use client';

/**
 * Cosmic Video Editor — CapCut-lite editing page.
 *
 * Reads ?videoId=xxx&url=encodedVideoUrl from the query string,
 * OR lets the user import a video from their device via drag-and-drop / file picker.
 */

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useVideoEditorStore } from '@/stores/videoEditorStore';
import { EditorLayout } from '@/components/video-editor/EditorLayout';
import { Loader2, Upload, Film, Smartphone, HardDrive } from 'lucide-react';

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

/** Max file size: 500MB */
const MAX_FILE_SIZE = 500 * 1024 * 1024;
const ACCEPTED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska'];

function EditorPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoUrl = searchParams.get('url') || '';
  const videoId = searchParams.get('videoId') || '';
  const init = useVideoEditorStore((s) => s.init);
  const sourceVideoUrl = useVideoEditorStore((s) => s.sourceVideoUrl);

  const [loading, setLoading] = useState(!!videoUrl);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Load video from URL params ────────────────────────────────
  useEffect(() => {
    if (!videoUrl) return;

    let cancelled = false;

    async function probeDuration() {
      try {
        const paramDuration = searchParams.get('duration');
        if (paramDuration) {
          const d = parseFloat(paramDuration);
          if (d > 0 && isFinite(d)) {
            if (!cancelled) { init(videoUrl, d); setLoading(false); }
            return;
          }
        }

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

  // ── Handle file import ────────────────────────────────────────
  const handleFile = useCallback(
    (file: File) => {
      // Validate type
      if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(mp4|mov|webm|mkv)$/i)) {
        setError('Please select a video file (MP4, MOV, WebM, or MKV).');
        return;
      }
      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        setError(`File too large (${(file.size / 1024 / 1024).toFixed(0)}MB). Maximum is 500MB.`);
        return;
      }

      setError(null);
      setLoading(true);

      const blobUrl = URL.createObjectURL(file);

      // Probe duration using a hidden video element
      const vid = document.createElement('video');
      vid.preload = 'metadata';
      vid.muted = true;

      vid.onloadedmetadata = () => {
        const duration = vid.duration;
        if (duration && isFinite(duration) && duration > 0) {
          init(blobUrl, duration);
        } else {
          // Fallback: try MP4 header parse
          const reader = new FileReader();
          reader.onload = () => {
            const buf = new DataView(reader.result as ArrayBuffer);
            const parsed = parseMp4Duration(buf);
            init(blobUrl, parsed && parsed > 0 ? parsed : 30);
          };
          reader.onerror = () => init(blobUrl, 30);
          reader.readAsArrayBuffer(file.slice(0, 65536));
        }
        setLoading(false);
        vid.remove();
      };

      vid.onerror = () => {
        // Try MP4 header parse as fallback
        const reader = new FileReader();
        reader.onload = () => {
          const buf = new DataView(reader.result as ArrayBuffer);
          const parsed = parseMp4Duration(buf);
          init(blobUrl, parsed && parsed > 0 ? parsed : 30);
          setLoading(false);
        };
        reader.onerror = () => {
          init(blobUrl, 30);
          setLoading(false);
        };
        reader.readAsArrayBuffer(file.slice(0, 65536));
        vid.remove();
      };

      vid.src = blobUrl;
    },
    [init],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  // ── Error state (only for URL-based load failures) ────────────
  if (error && videoUrl) {
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

  // ── Loading state ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
        <p className="text-text-muted text-sm">Loading editor...</p>
      </div>
    );
  }

  // ── Editor loaded ─────────────────────────────────────────────
  if (sourceVideoUrl) {
    return <EditorLayout videoId={videoId} />;
  }

  // ── Import screen (no video loaded yet) ───────────────────────
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[80vh]">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent-primary/20 flex items-center justify-center mx-auto mb-4">
            <Film className="w-8 h-8 text-accent-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-text-primary mb-2">
            Edit Your Video
          </h1>
          <p className="text-text-muted text-sm">
            Import a video from your device to trim, add text, stickers, filters, and more.
          </p>
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all
            ${isDragOver
              ? 'border-accent-primary bg-accent-primary/10 scale-[1.02]'
              : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/8'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm,video/x-matroska,.mp4,.mov,.webm,.mkv"
            onChange={handleFileInput}
            className="hidden"
          />

          <Upload
            className={`w-10 h-10 mx-auto mb-4 transition-colors ${
              isDragOver ? 'text-accent-primary' : 'text-text-muted'
            }`}
          />
          <p className="text-text-primary font-medium mb-1">
            {isDragOver ? 'Drop your video here' : 'Drag & drop a video here'}
          </p>
          <p className="text-text-muted text-sm mb-4">
            or click to browse your files
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5" />
              MP4, MOV
            </span>
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5" />
              WebM, MKV
            </span>
            <span>Up to 500MB</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Back link */}
        <button
          onClick={() => router.push('/cosmic-video')}
          className="mt-6 w-full text-center text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          ← Back to Cosmic Video Creator
        </button>
      </div>
    </div>
  );
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
