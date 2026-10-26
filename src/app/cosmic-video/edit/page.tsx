'use client';

/**
 * Cosmic Video Editor — CapCut-lite editing page.
 *
 * Reads ?videoId=xxx&url=encodedVideoUrl from the query string,
 * OR lets the user import a video from their device via drag-and-drop / file picker.
 */

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useVideoEditorStore } from '@/stores/videoEditorStore';
import { EditorLayout } from '@/components/video-editor/EditorLayout';
import { MultiTrackEditor } from '@/components/video-editor/multitrack/MultiTrackEditor';
import { useVideoRecorder } from '@/hooks/useVideoRecorder';
import { Loader2, Upload, Film, Smartphone, HardDrive, Circle, Square } from 'lucide-react';

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
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoUrl = searchParams.get('url') || '';
  const videoId = searchParams.get('videoId') || '';
  // New multi-track editor is the default; ?classic=1 (or ?mt=0) loads the old one.
  const classic = searchParams.get('classic') === '1' || searchParams.get('mt') === '0';
  const init = useVideoEditorStore((s) => s.init);
  const sourceVideoUrl = useVideoEditorStore((s) => s.sourceVideoUrl);
  const videoDuration = useVideoEditorStore((s) => s.videoDuration);

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
    (file: File, knownSeconds?: number) => {
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

      const useProbedDuration = () => {
        const duration = vid.duration;
        if (duration && isFinite(duration) && duration > 0) {
          init(blobUrl, duration);
        } else {
          // Fallback: try MP4 header parse (recorded clips: the recorder's own timer)
          const reader = new FileReader();
          const fallback = knownSeconds && knownSeconds > 0 ? knownSeconds : 30;
          reader.onload = () => {
            const buf = new DataView(reader.result as ArrayBuffer);
            const parsed = parseMp4Duration(buf);
            init(blobUrl, parsed && parsed > 0 ? parsed : fallback);
          };
          reader.onerror = () => init(blobUrl, fallback);
          reader.readAsArrayBuffer(file.slice(0, 65536));
        }
        setLoading(false);
        vid.remove();
      };

      vid.onloadedmetadata = () => {
        if (vid.duration === Infinity) {
          // Browser-recorded WebM has no duration header; seeking far past the
          // end makes the browser work it out. Don't hang if it never does.
          vid.onloadedmetadata = null;
          let settled = false;
          const settle = () => { if (!settled) { settled = true; vid.ontimeupdate = null; useProbedDuration(); } };
          vid.ontimeupdate = settle;
          setTimeout(settle, 2500);
          vid.currentTime = 1e101;
          return;
        }
        useProbedDuration();
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

  // ── Record from the camera (same recorder as Reels / Feed) ────────
  const elapsedRef = useRef(0);
  const { canRecord, recording, elapsed, error: recorderError, liveVideoRef, start: startRecording, stop: stopRecording, maxSeconds } =
    useVideoRecorder({ maxSeconds: 60, onClip: (file) => handleFile(file, elapsedRef.current) });
  useEffect(() => { elapsedRef.current = elapsed; }, [elapsed]);

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
        <p className="text-text-muted text-sm">{t('common.loading')}</p>
      </div>
    );
  }

  // ── Editor loaded ─────────────────────────────────────────────
  if (sourceVideoUrl) {
    if (classic) {
      return <EditorLayout videoId={videoId} />;
    }
    return <MultiTrackEditor sourceUrl={sourceVideoUrl} sourceDuration={videoDuration} />;
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
            Record or import a video to trim, add text, stickers, filters, and more.
          </p>
        </div>

        {recording ? (
          <div className="relative rounded-2xl overflow-hidden bg-black border border-red-500/50">
            <video ref={liveVideoRef} className="w-full max-h-[480px] object-contain bg-black" muted playsInline />
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded bg-black/70">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white text-xs font-semibold">{elapsed}s / {maxSeconds}s</span>
            </div>
            <button
              onClick={stopRecording}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 rounded-full bg-red-500 text-white text-sm font-bold"
            >
              <Square className="w-4 h-4" /> Stop &amp; edit
            </button>
          </div>
        ) : (
        <>
        {/* Record from the camera */}
        {canRecord && (
          <button
            onClick={startRecording}
            className="w-full mb-3 flex items-center justify-center gap-2 py-4 rounded-2xl bg-accent-primary text-white font-semibold hover:bg-accent-primary/90 transition-colors"
          >
            <Circle className="w-5 h-5" /> Record with camera
          </button>
        )}

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

        </>
        )}

        {/* Error */}
        {(error || recorderError) && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
            <p className="text-sm text-red-300">{error || recorderError}</p>
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
