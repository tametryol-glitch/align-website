'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Video, Square, Loader2 } from 'lucide-react';
import { useVideoRecorder } from '@/hooks/useVideoRecorder';

// ── Types ──────────────────────────────────────────────────────────

interface VideoNoteRecorderModalProps {
  /** Starts with the one-time toggle on when the composer toggle is armed. */
  defaultOnce: boolean;
  /** Resolves true when sent (modal closes); false keeps the take for a retry. */
  onSend: (file: File, duration: number, once: boolean) => Promise<boolean>;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ── Component ──────────────────────────────────────────────────────

export function VideoNoteRecorderModal({ defaultOnce, onSend, onClose }: VideoNoteRecorderModalProps) {
  const [clip, setClip] = useState<{ file: File; url: string; duration: number } | null>(null);
  const [once, setOnce] = useState(defaultOnce);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const elapsedRef = useRef(0);

  const { canRecord, recording, elapsed, error, liveVideoRef, start, stop, maxSeconds } = useVideoRecorder({
    maxSeconds: 60,
    onClip: (file) => {
      setClip({ file, url: URL.createObjectURL(file), duration: Math.max(1, elapsedRef.current) });
    },
  });
  elapsedRef.current = elapsed;

  // Release the object URL when the take is replaced or the modal goes away.
  useEffect(() => {
    return () => { if (clip) URL.revokeObjectURL(clip.url); };
  }, [clip]);

  // The hook stops the camera tracks on unmount; also stop an in-flight take.
  useEffect(() => () => { stop(); }, [stop]);

  async function handleSend() {
    if (!clip || sending) return;
    setSending(true);
    setSendError('');
    const ok = await onSend(clip.file, clip.duration, once);
    setSending(false);
    if (!ok) setSendError('Could not send the video. Try again.');
  }

  function handleRetake() {
    setClip(null);
    setSendError('');
  }

  function handleClose() {
    if (sending) return;
    stop();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4" onClick={handleClose}>
      <div
        className="bg-bg-card border border-border-primary rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border-primary">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-accent-primary" />
            <h2 className="text-base font-semibold text-text-primary">Video message</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Stage: live camera while recording, the take afterwards */}
          <div className="relative aspect-[3/4] bg-black rounded-xl overflow-hidden flex items-center justify-center">
            {clip ? (
              <video src={clip.url} controls playsInline className="w-full h-full object-cover" />
            ) : recording ? (
              <>
                <video ref={liveVideoRef} muted playsInline className="w-full h-full object-cover -scale-x-100" />
                <span className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 text-white text-xs">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {formatTime(elapsed)} / {formatTime(maxSeconds)}
                </span>
              </>
            ) : (
              <p className="text-xs text-white/60 px-6 text-center">
                {canRecord ? 'Tap record to start. Up to 60 seconds.' : 'Video recording is not supported in this browser.'}
              </p>
            )}
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
          {sendError && <p className="text-xs text-red-400">{sendError}</p>}

          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer select-none">
            <input
              type="checkbox"
              checked={once}
              onChange={(e) => setOnce(e.target.checked)}
              disabled={recording || sending}
              className="accent-accent-primary"
            />
            <span className="w-4 h-4 rounded-full border-2 border-current text-[8px] font-bold leading-none flex items-center justify-center">1</span>
            One-time view
          </label>

          {/* Actions */}
          {clip ? (
            <div className="flex gap-2">
              <button type="button" onClick={handleRetake} disabled={sending} className="flex-1 px-3 py-2 text-sm rounded-lg bg-bg-tertiary text-text-secondary hover:text-text-primary">
                Retake
              </button>
              <button type="button" onClick={handleClose} disabled={sending} className="flex-1 px-3 py-2 text-sm rounded-lg bg-bg-tertiary text-text-secondary hover:text-text-primary">
                Cancel
              </button>
              <button type="button" onClick={handleSend} disabled={sending} className="flex-1 btn-primary px-3 py-2 text-sm flex items-center justify-center gap-1.5">
                {sending && <Loader2 className="w-4 h-4 animate-spin" />}
                Send
              </button>
            </div>
          ) : recording ? (
            <button type="button" onClick={stop} className="w-full px-3 py-2 text-sm rounded-lg bg-red-500 text-white flex items-center justify-center gap-2">
              <Square className="w-4 h-4" /> Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={start}
              disabled={!canRecord}
              className="w-full btn-primary px-3 py-2 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Video className="w-4 h-4" /> Record
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
