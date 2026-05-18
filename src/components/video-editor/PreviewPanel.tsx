'use client';

/**
 * PreviewPanel — video player + overlay layers + playback controls.
 *
 * Overlays are CSS-positioned divs on top of the <video> element,
 * not canvas-rendered. This keeps playback hardware-accelerated.
 */

import { useRef, useCallback, useEffect } from 'react';
import { useVideoEditorStore } from '@/stores/videoEditorStore';
import { useVideoPlayback } from './hooks/useVideoPlayback';
import { useOverlayVisibility } from './hooks/useOverlayVisibility';
import { TextOverlayLayer } from './TextOverlayLayer';
import { StickerOverlayLayer } from './StickerOverlayLayer';
import { getFilterById } from '@/lib/videoFilters';
import { Play, Pause } from 'lucide-react';

export function PreviewPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const sourceVideoUrl = useVideoEditorStore((s) => s.sourceVideoUrl);
  const activeFilter = useVideoEditorStore((s) => s.activeFilter);
  const isPlaying = useVideoEditorStore((s) => s.isPlaying);
  const currentTime = useVideoEditorStore((s) => s.currentTime);
  const videoDuration = useVideoEditorStore((s) => s.videoDuration);
  const trimStart = useVideoEditorStore((s) => s.trimStart);
  const trimEnd = useVideoEditorStore((s) => s.trimEnd);
  const setIsPlaying = useVideoEditorStore((s) => s.setIsPlaying);
  const selectOverlay = useVideoEditorStore((s) => s.selectOverlay);

  // Sync video element with store
  useVideoPlayback(videoRef);

  // Drive overlay visibility based on currentTime
  useOverlayVisibility();

  const filter = getFilterById(activeFilter);

  const togglePlay = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (isPlaying) {
      vid.pause();
      setIsPlaying(false);
    } else {
      // Clamp to trim range
      if (vid.currentTime < trimStart || vid.currentTime >= trimEnd) {
        vid.currentTime = trimStart;
      }
      vid.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying, setIsPlaying, trimStart, trimEnd]);

  // Space bar to play/pause
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }
      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
      // Arrow key seek
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const vid = videoRef.current;
        if (vid) vid.currentTime = Math.max(trimStart, vid.currentTime - 1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const vid = videoRef.current;
        if (vid) vid.currentTime = Math.min(trimEnd, vid.currentTime + 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlay, trimStart, trimEnd]);

  const formatTime = (t: number) => {
    const mins = Math.floor(t / 60);
    const secs = Math.floor(t % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Deselect overlay when clicking background
  const handleBackgroundClick = useCallback(() => {
    selectOverlay(null);
  }, [selectOverlay]);

  return (
    <div className="flex flex-col items-center w-full h-full p-2 gap-2">
      {/* Video container — maintains 9:16 aspect ratio */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full max-w-[360px] aspect-[9/16] max-h-full rounded-xl overflow-hidden bg-black"
        onClick={handleBackgroundClick}
      >
        {/* Video element */}
        <video
          ref={videoRef}
          src={sourceVideoUrl}
          className="absolute inset-0 w-full h-full object-contain"
          style={{
            filter: filter.css !== 'none' ? filter.css : undefined,
          }}
          playsInline
          crossOrigin="anonymous"
        />

        {/* Text overlay layer */}
        <TextOverlayLayer containerRef={containerRef} />

        {/* Sticker overlay layer */}
        <StickerOverlayLayer containerRef={containerRef} />

        {/* Play button overlay (when paused) */}
        {!isPlaying && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity hover:bg-black/30"
          >
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-7 h-7 text-white ml-1" />
            </div>
          </button>
        )}
      </div>

      {/* Playback controls */}
      <div className="flex items-center gap-3 w-full max-w-[360px] shrink-0">
        <button
          onClick={togglePlay}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>
        <span className="text-xs text-text-muted font-mono tabular-nums">
          {formatTime(currentTime)}
        </span>
        <div className="flex-1 h-1 rounded-full bg-white/10 relative">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-accent-primary transition-[width] duration-75"
            style={{
              width: videoDuration > 0
                ? `${((currentTime - trimStart) / (trimEnd - trimStart)) * 100}%`
                : '0%',
            }}
          />
        </div>
        <span className="text-xs text-text-muted font-mono tabular-nums">
          {formatTime(trimEnd - trimStart)}
        </span>
      </div>
    </div>
  );
}
