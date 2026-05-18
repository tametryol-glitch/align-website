'use client';

/**
 * PreviewPanel — video player + overlay layers + playback controls.
 *
 * Overlays are CSS-positioned divs on top of the <video> element,
 * not canvas-rendered. This keeps playback hardware-accelerated.
 */

import { useRef, useCallback, useEffect, useMemo, useState } from 'react';
import { useVideoEditorStore } from '@/stores/videoEditorStore';
import { useVideoPlayback } from './hooks/useVideoPlayback';
import { useTransitionPreview } from './hooks/useTransitionPreview';
import { TextOverlayLayer } from './TextOverlayLayer';
import { StickerOverlayLayer } from './StickerOverlayLayer';
import { getFilterById } from '@/lib/videoFilters';
import { Play, Pause, Repeat, Gauge } from 'lucide-react';

export function PreviewPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrubRef = useRef<HTMLDivElement>(null);

  const sourceVideoUrl = useVideoEditorStore((s) => s.sourceVideoUrl);
  const activeFilter = useVideoEditorStore((s) => s.activeFilter);
  const filterIntensity = useVideoEditorStore((s) => s.filterIntensity);
  const adjustBrightness = useVideoEditorStore((s) => s.adjustBrightness);
  const adjustContrast = useVideoEditorStore((s) => s.adjustContrast);
  const adjustSaturation = useVideoEditorStore((s) => s.adjustSaturation);
  const adjustWarmth = useVideoEditorStore((s) => s.adjustWarmth);
  const isPlaying = useVideoEditorStore((s) => s.isPlaying);
  const currentTime = useVideoEditorStore((s) => s.currentTime);
  const videoDuration = useVideoEditorStore((s) => s.videoDuration);
  const trimStart = useVideoEditorStore((s) => s.trimStart);
  const trimEnd = useVideoEditorStore((s) => s.trimEnd);
  const setIsPlaying = useVideoEditorStore((s) => s.setIsPlaying);
  const setCurrentTime = useVideoEditorStore((s) => s.setCurrentTime);
  const selectOverlay = useVideoEditorStore((s) => s.selectOverlay);
  const playbackSpeed = useVideoEditorStore((s) => s.playbackSpeed);
  const setPlaybackSpeed = useVideoEditorStore((s) => s.setPlaybackSpeed);
  const loopPlayback = useVideoEditorStore((s) => s.loopPlayback);
  const setLoopPlayback = useVideoEditorStore((s) => s.setLoopPlayback);

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Sync video element with store
  useVideoPlayback(videoRef);

  // Drive transition preview overlay
  const activeTransitionStyle = useTransitionPreview();

  const filter = getFilterById(activeFilter);

  // Build combined CSS filter string: preset filter (with intensity) + manual adjustments
  const combinedCssFilter = useMemo(() => {
    const parts: string[] = [];

    // Preset filter with intensity blending
    if (filter.css !== 'none' && filterIntensity > 0) {
      // We can't easily lerp CSS filter strings, so we apply at full intensity
      // when > 0.5, and skip when intensity is very low
      if (filterIntensity > 0.1) {
        parts.push(filter.css);
      }
    }

    // Manual adjustments — convert -1..+1 range to CSS filter values
    const brightness = 1 + adjustBrightness * 0.5; // 0.5 → 1.5
    const contrast = 1 + adjustContrast * 0.5;
    const saturate = 1 + adjustSaturation * 0.8;

    if (Math.abs(adjustBrightness) > 0.01) parts.push(`brightness(${brightness.toFixed(2)})`);
    if (Math.abs(adjustContrast) > 0.01) parts.push(`contrast(${contrast.toFixed(2)})`);
    if (Math.abs(adjustSaturation) > 0.01) parts.push(`saturate(${saturate.toFixed(2)})`);
    if (Math.abs(adjustWarmth) > 0.01) {
      // Warmth via hue-rotate + sepia blend
      const hue = adjustWarmth * 15; // -15 to +15 degrees
      const sepia = Math.max(0, adjustWarmth) * 0.2;
      parts.push(`hue-rotate(${hue.toFixed(1)}deg)`);
      if (sepia > 0.01) parts.push(`sepia(${sepia.toFixed(2)})`);
    }

    return parts.length > 0 ? parts.join(' ') : undefined;
  }, [filter.css, filterIntensity, adjustBrightness, adjustContrast, adjustSaturation, adjustWarmth]);

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

  // ── Progress bar scrubbing ──────────────────────────────────
  const handleScrub = useCallback(
    (clientX: number) => {
      const bar = scrubRef.current;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const t = trimStart + pct * (trimEnd - trimStart);
      const vid = videoRef.current;
      if (vid) vid.currentTime = t;
      setCurrentTime(t);
    },
    [trimStart, trimEnd, setCurrentTime],
  );

  const handleScrubDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      handleScrub(e.clientX);

      const onMove = (ev: PointerEvent) => handleScrub(ev.clientX);
      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [handleScrub],
  );

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
          style={{ filter: combinedCssFilter }}
          playsInline
        />

        {/* Transition preview overlay */}
        {activeTransitionStyle && (
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={activeTransitionStyle}
          />
        )}

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

      {/* Playback controls with scrubbing */}
      <div className="flex items-center gap-2 w-full max-w-[360px] shrink-0">
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
        {/* Scrubable progress bar */}
        <div
          ref={scrubRef}
          className="flex-1 h-3 rounded-full bg-white/10 relative cursor-pointer group"
          onPointerDown={handleScrubDown}
        >
          <div
            className="absolute left-0 top-1 h-1 rounded-full bg-accent-primary transition-[width] duration-75 group-hover:top-0 group-hover:h-3"
            style={{
              width: trimEnd > trimStart
                ? `${((currentTime - trimStart) / (trimEnd - trimStart)) * 100}%`
                : '0%',
            }}
          />
          {/* Scrub handle dot */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent-primary opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            style={{
              left: trimEnd > trimStart
                ? `calc(${((currentTime - trimStart) / (trimEnd - trimStart)) * 100}% - 6px)`
                : '0%',
            }}
          />
        </div>
        <span className="text-xs text-text-muted font-mono tabular-nums">
          {formatTime(trimEnd - trimStart)}
        </span>

        {/* Speed control */}
        <div className="relative">
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className={`px-1.5 py-1 rounded-md text-[10px] font-medium transition-colors ${
              playbackSpeed !== 1
                ? 'bg-accent-primary/20 text-accent-primary'
                : 'text-text-muted hover:bg-white/10'
            }`}
          >
            {playbackSpeed}x
          </button>
          {showSpeedMenu && (
            <div className="absolute bottom-full right-0 mb-1 bg-surface-secondary border border-white/10 rounded-lg shadow-xl overflow-hidden z-30">
              {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    setPlaybackSpeed(speed);
                    setShowSpeedMenu(false);
                    const vid = videoRef.current;
                    if (vid) vid.playbackRate = speed;
                  }}
                  className={`block w-full px-4 py-1.5 text-xs text-left transition-colors ${
                    playbackSpeed === speed
                      ? 'bg-accent-primary/20 text-accent-primary'
                      : 'text-text-secondary hover:bg-white/10'
                  }`}
                >
                  {speed}x{speed === 1 ? ' (Normal)' : speed < 1 ? ' Slow' : ' Fast'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loop toggle */}
        <button
          onClick={() => setLoopPlayback(!loopPlayback)}
          className={`p-1.5 rounded-lg transition-colors ${
            loopPlayback
              ? 'bg-accent-primary/20 text-accent-primary'
              : 'text-text-muted hover:bg-white/10'
          }`}
          title={loopPlayback ? 'Loop on' : 'Loop off'}
        >
          <Repeat className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
