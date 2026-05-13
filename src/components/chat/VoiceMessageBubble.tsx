'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────

interface VoiceMessageBubbleProps {
  metadata: { url: string; duration: number } | null | undefined;
  isMine: boolean;
}

// ── Helpers ─────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Generate deterministic bar heights from a seed string (url). */
function generateWaveformBars(seed: string, count: number): number[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    hash = (hash * 16807 + 7) | 0;
    const val = ((hash & 0x7fffffff) % 80) + 20; // 20–100 range
    bars.push(val);
  }
  return bars;
}

// ── Component ──────────────────────────────────────────────────────

export function VoiceMessageBubble({ metadata, isMine }: VoiceMessageBubbleProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const animRef = useRef<number | null>(null);

  const url = metadata?.url;
  const duration = metadata?.duration ?? 0;
  const BAR_COUNT = 28;
  const bars = generateWaveformBars(url ?? 'default', BAR_COUNT);

  const textColor = isMine ? 'text-white' : 'text-text-primary';
  const mutedColor = isMine ? 'text-white/60' : 'text-text-muted';
  const barBg = isMine ? 'bg-white/30' : 'bg-text-muted/30';
  const barFill = isMine ? 'bg-white' : 'bg-accent-primary';

  // ── Playback tick ──

  const tick = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.duration && audio.duration > 0) {
      setProgress(audio.currentTime / audio.duration);
      setCurrentTime(audio.currentTime);
    }
    animRef.current = requestAnimationFrame(tick);
  }, []);

  // ── Toggle play/pause ──

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      if (animRef.current) cancelAnimationFrame(animRef.current);
      setPlaying(false);
    } else {
      audio.play().catch(() => {});
      animRef.current = requestAnimationFrame(tick);
      setPlaying(true);
    }
  }, [playing, tick]);

  // ── Audio ended ──

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    function handleEnded() {
      setPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    }
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  if (!metadata?.url) return null;

  return (
    <div className="min-w-[200px] flex items-center gap-2">
      {/* Hidden audio element */}
      <audio ref={audioRef} src={url} preload="metadata" />

      {/* Play / Pause button */}
      <button
        onClick={togglePlay}
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
          isMine
            ? 'bg-white/20 hover:bg-white/30'
            : 'bg-accent-primary/20 hover:bg-accent-primary/30'
        }`}
      >
        {playing ? (
          <Pause className={`w-4 h-4 ${textColor}`} />
        ) : (
          <Play className={`w-4 h-4 ${textColor} ml-0.5`} />
        )}
      </button>

      {/* Waveform + duration */}
      <div className="flex-1 flex flex-col gap-1">
        {/* Waveform bars */}
        <div className="flex items-end gap-[2px] h-6">
          {bars.map((height, i) => {
            const fillFrac = progress * BAR_COUNT;
            const filled = i < fillFrac;
            return (
              <div
                key={i}
                className="flex-1 rounded-full transition-colors duration-100"
                style={{
                  height: `${height}%`,
                  minWidth: 2,
                }}
              >
                <div
                  className={`w-full h-full rounded-full ${filled ? barFill : barBg}`}
                />
              </div>
            );
          })}
        </div>

        {/* Duration text */}
        <span className={`text-[10px] ${mutedColor}`}>
          {formatDuration(playing ? currentTime : 0)} / {formatDuration(duration)}
        </span>
      </div>
    </div>
  );
}
