'use client';

// ═══════════════════════════════════════════════════════════════════
// Guests on stage — the pieces both sides of the stream need.
//
//   VideoFrame        plays an Agora track into a corner of the stage
//   StageRequestSheet the viewer choosing how to appear
//   StagePanel        the host's queue and on-stage controls
//
// Kept in step with align-app/src/components/social/StagePieces.tsx.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useRef } from 'react';
import { Mic, Video, X, Check, UserMinus, Loader2 } from 'lucide-react';
import type { StageEntry } from '@/lib/liveService';

/**
 * Plays an Agora video track into a fixed frame.
 *
 * The track has to be attached after the container is in the DOM —
 * calling play() against a ref that is still null silently does
 * nothing, which is the exact bug that made the host preview black
 * earlier in this build.
 */
export function VideoFrame({
  track,
  label,
  muted,
  className = '',
}: {
  track: any | null;
  label?: string;
  /** Shown when a guest is on audio only, so the frame is not just black. */
  muted?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!track || !ref.current) return;
    track.play(ref.current);
    return () => {
      try {
        track.stop();
      } catch {
        /* already stopped */
      }
    };
  }, [track]);

  return (
    <div
      className={`relative rounded-xl overflow-hidden bg-neutral-800 border border-white/15
                  shadow-lg ${className}`}
    >
      <div ref={ref} className="absolute inset-0 [&>video]:object-cover" />

      {!track && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Mic className="w-6 h-6 text-white/45" />
        </div>
      )}

      {label && (
        <span
          className="absolute bottom-1 left-1 right-1 truncate text-[10px] text-white
                     bg-black/55 rounded px-1.5 py-0.5"
        >
          {label}
        </span>
      )}

      {muted && (
        <span className="absolute top-1 right-1 bg-black/60 rounded-full p-1">
          <Mic className="w-3 h-3 text-rose-400" />
        </span>
      )}
    </div>
  );
}

/**
 * The viewer choosing how to come on stage.
 *
 * Audio-only and video are separate choices, not a toggle the host
 * controls: putting your face on someone else's broadcast is a
 * materially different thing to agree to than your voice.
 */
export function StageRequestSheet({
  open,
  busy,
  onClose,
  onRequest,
}: {
  open: boolean;
  busy?: boolean;
  onClose: () => void;
  onRequest: (withVideo: boolean) => void;
}) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center" role="dialog" aria-modal="true">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-md bg-neutral-900 border-t border-white/10 rounded-t-2xl p-5 pb-7">
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-base font-medium text-white">Join the stream</h2>
          <button onClick={onClose} aria-label="Close" className="text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-white/50 mb-5">
          The host decides whether to bring you on. You can leave the stage at any time.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            disabled={busy}
            onClick={() => onRequest(false)}
            className="flex flex-col items-center gap-2 rounded-xl border border-white/12 py-5
                       hover:border-white/30 hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <Mic className="w-6 h-6 text-white/80" />
            <span className="text-sm text-white">Voice only</span>
            <span className="text-[11px] text-white/40">Camera stays off</span>
          </button>

          <button
            disabled={busy}
            onClick={() => onRequest(true)}
            className="flex flex-col items-center gap-2 rounded-xl border border-white/12 py-5
                       hover:border-white/30 hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <Video className="w-6 h-6 text-white/80" />
            <span className="text-sm text-white">Voice &amp; video</span>
            <span className="text-[11px] text-white/40">You&rsquo;ll be on screen</span>
          </button>
        </div>

        {busy && (
          <p className="flex items-center justify-center gap-2 text-xs text-white/50 mt-4">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Asking the host&hellip;
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * The host's side: who is waiting, and who is on.
 *
 * Renders nothing when the stage is empty and nobody is asking, so an
 * ordinary broadcast carries none of this furniture.
 */
export function StagePanel({
  stage,
  busy,
  onAccept,
  onDecline,
  onRemove,
}: {
  stage: StageEntry[];
  busy?: boolean;
  onAccept: (e: StageEntry) => void;
  onDecline: (e: StageEntry) => void;
  onRemove: (e: StageEntry) => void;
}) {
  const live = stage.find((e) => e.status === 'live');
  const waiting = stage.filter((e) => e.status === 'pending');

  if (!live && waiting.length === 0) return null;

  return (
    <div className="absolute top-16 inset-x-4 z-20 flex flex-col gap-1.5 items-start">
      {live && (
        <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30
                        backdrop-blur rounded-full pl-3 pr-1.5 py-1">
          <span className="text-xs text-white">
            {live.display_name || 'Someone'} is on stage
          </span>
          <span className="text-[10px] text-white/50">
            {live.with_video ? 'video' : 'voice'}
          </span>
          <button
            disabled={busy}
            onClick={() => onRemove(live)}
            title="Take them off stage"
            className="ml-1 rounded-full bg-black/30 hover:bg-black/50 p-1 disabled:opacity-50"
          >
            <UserMinus className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      )}

      {waiting.map((e) => (
        <div
          key={e.request_id}
          className="flex items-center gap-2 bg-black/55 backdrop-blur rounded-full pl-3 pr-1.5 py-1"
        >
          <span className="text-xs text-white truncate max-w-[9rem]">
            {e.display_name || 'Someone'}
          </span>
          <span className="text-[10px] text-white/45">
            wants to join &middot; {e.with_video ? 'video' : 'voice'}
          </span>
          <button
            disabled={busy || !!live}
            onClick={() => onAccept(e)}
            title={live ? 'Someone is already on stage' : 'Bring them on'}
            className="rounded-full bg-emerald-500/25 hover:bg-emerald-500/40 p-1 disabled:opacity-40"
          >
            <Check className="w-3.5 h-3.5 text-white" />
          </button>
          <button
            disabled={busy}
            onClick={() => onDecline(e)}
            title="Decline"
            className="rounded-full bg-black/30 hover:bg-black/50 p-1 disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      ))}
    </div>
  );
}
