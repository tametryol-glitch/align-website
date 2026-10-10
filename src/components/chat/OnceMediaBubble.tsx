'use client';

import { useState, useEffect, useRef } from 'react';
import { Lock, CheckCircle2, X } from 'lucide-react';
import {
  openOnceMedia, removeOnceFile, onceLabel, isOnceOpened,
} from '@/lib/onceMediaService';
import type { Message } from '@/lib/messagingService';

// ── Types ──────────────────────────────────────────────────────────

interface OnceMediaBubbleProps {
  message: Message;
  isMine: boolean;
}

interface Viewing {
  url: string;
  path: string;
  type: string;
}

const NOUN: Record<string, string> = {
  image: 'Photo',
  voice_note: 'Voice message',
  video_note: 'Video',
};

// ── Component ──────────────────────────────────────────────────────

export function OnceMediaBubble({ message: msg, isMine }: OnceMediaBubbleProps) {
  const [opening, setOpening] = useState(false);
  const [viewing, setViewing] = useState<Viewing | null>(null);
  // Set locally when open_once_media says already_opened, or after this
  // viewer closes it, before the realtime UPDATE stamps opened_at.
  const [openedLocal, setOpenedLocal] = useState(false);
  const [error, setError] = useState('');
  // Path to delete — guards against a double delete (end + close).
  const pathRef = useRef<string | null>(null);

  const opened = openedLocal || isOnceOpened(msg);
  const noun = NOUN[msg.type] || 'Photo';

  function finish() {
    const path = pathRef.current;
    pathRef.current = null;
    if (path) removeOnceFile(path);
    setViewing(null);
    setOpenedLocal(true);
  }

  // Closing the tab mid-view should still burn the file.
  useEffect(() => {
    return () => {
      const path = pathRef.current;
      pathRef.current = null;
      if (path) removeOnceFile(path);
    };
  }, []);

  async function handleOpen() {
    if (opening || viewing) return;
    setOpening(true);
    setError('');
    const res = await openOnceMedia(msg.id);
    setOpening(false);
    if (res.status === 'ok') {
      pathRef.current = res.path;
      setViewing({ url: res.url, path: res.path, type: msg.type });
    } else if (res.status === 'already_opened') {
      setOpenedLocal(true);
    } else if (res.status === 'error') {
      setError('Could not open. Check your connection and try again.');
    } else {
      setError('This can no longer be opened.');
    }
  }

  const base = 'flex items-center gap-2 text-sm py-1';

  // The realtime UPDATE flips `opened` while the viewer is still open, so the
  // viewer is rendered independently of which bubble state is showing.
  const viewer = (
    <>
      {viewing && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 select-none"
          onClick={finish}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            type="button"
            onClick={finish}
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center bg-white/10 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <p className="absolute top-5 left-1/2 -translate-x-1/2 text-xs text-white/60">
            One-time view · closes for good
          </p>
          <div className="max-w-[92vw] max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {viewing.type === 'image' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={viewing.url}
                alt=""
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                onContextMenu={(e) => e.preventDefault()}
                className="max-w-[92vw] max-h-[85vh] object-contain rounded-lg pointer-events-auto"
              />
            )}
            {viewing.type === 'voice_note' && (
              <audio
                src={viewing.url}
                controls
                autoPlay
                controlsList="nodownload noplaybackrate"
                onContextMenu={(e) => e.preventDefault()}
                onEnded={finish}
                className="w-[min(90vw,360px)]"
              />
            )}
            {viewing.type === 'video_note' && (
              <video
                src={viewing.url}
                controls
                autoPlay
                playsInline
                disablePictureInPicture
                controlsList="nodownload noremoteplayback"
                onContextMenu={(e) => e.preventDefault()}
                onEnded={finish}
                className="max-w-[92vw] max-h-[85vh] rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </>
  );

  // Opened — muted, not clickable.
  if (opened) {
    return (
      <>
        <div className={`${base} opacity-60`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>Opened</span>
        </div>
        {viewer}
      </>
    );
  }

  // Sent by me, not yet opened — nothing to tap.
  if (isMine) {
    return (
      <div className={`${base} opacity-80`}>
        <Lock className="w-4 h-4" />
        <span>{noun} · Not opened yet</span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        disabled={opening}
        className={`${base} font-medium hover:opacity-80 transition-opacity disabled:opacity-60`}
        title={onceLabel(msg.type)}
      >
        <Lock className="w-4 h-4" />
        <span>{opening ? 'Opening…' : `${noun} · Tap to view`}</span>
      </button>
      {error && <p className="text-[10px] text-red-400">{error}</p>}
      {viewer}
    </>
  );
}
