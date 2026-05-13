'use client';

import { useState, useRef } from 'react';
import { Play } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────

interface VideoMessageBubbleProps {
  metadata: {
    url: string;
    duration?: number;
    thumbnail_url?: string;
  } | null | undefined;
  isMine: boolean;
}

// ── Helpers ─────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Component ──────────────────────────────────────────────────────

export function VideoMessageBubble({ metadata, isMine }: VideoMessageBubbleProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  if (!metadata?.url) return null;

  const { url, duration, thumbnail_url } = metadata;

  function handlePlay() {
    setShowPlayer(true);
    // Auto-play once player mounts
    setTimeout(() => {
      videoRef.current?.play().catch(() => {});
    }, 100);
  }

  return (
    <div className="relative rounded-xl overflow-hidden max-h-60 min-w-[180px]">
      {!showPlayer ? (
        /* ── Thumbnail / preview state ── */
        <button
          onClick={handlePlay}
          className="relative block w-full cursor-pointer group"
          type="button"
        >
          {thumbnail_url ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnail_url}
                alt="Video thumbnail"
                className="w-full max-h-60 object-cover rounded-xl"
              />
            </>
          ) : (
            /* Placeholder when no thumbnail */
            <div className={`w-full h-36 flex items-center justify-center rounded-xl ${
              isMine ? 'bg-white/10' : 'bg-bg-secondary'
            }`}>
              <Play className={`w-8 h-8 ${isMine ? 'text-white/50' : 'text-text-muted'}`} />
            </div>
          )}

          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors rounded-xl">
            <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
            </div>
          </div>

          {/* Duration badge */}
          {duration != null && duration > 0 && (
            <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm">
              {formatDuration(duration)}
            </span>
          )}
        </button>
      ) : (
        /* ── Video player state ── */
        <video
          ref={videoRef}
          src={url}
          controls
          className="w-full max-h-60 rounded-xl"
          playsInline
        />
      )}
    </div>
  );
}
