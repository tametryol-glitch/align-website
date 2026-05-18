'use client';

/**
 * TimelinePanel — horizontal scrollable timeline with:
 *  - Time ruler
 *  - Playhead (draggable)
 *  - Video track with trim handles
 *  - Overlay tracks for text/stickers
 *
 * Coordinate system: time (seconds) → pixels via timelineZoom (px/sec).
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import { useVideoEditorStore } from '@/stores/videoEditorStore';

export function TimelinePanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoDuration = useVideoEditorStore((s) => s.videoDuration);
  const trimStart = useVideoEditorStore((s) => s.trimStart);
  const trimEnd = useVideoEditorStore((s) => s.trimEnd);
  const currentTime = useVideoEditorStore((s) => s.currentTime);
  const timelineZoom = useVideoEditorStore((s) => s.timelineZoom);
  const textOverlays = useVideoEditorStore((s) => s.textOverlays);
  const stickerOverlays = useVideoEditorStore((s) => s.stickerOverlays);
  const setCurrentTime = useVideoEditorStore((s) => s.setCurrentTime);
  const setTrimStart = useVideoEditorStore((s) => s.setTrimStart);
  const setTrimEnd = useVideoEditorStore((s) => s.setTrimEnd);
  const selectedOverlayId = useVideoEditorStore((s) => s.selectedOverlayId);
  const selectOverlay = useVideoEditorStore((s) => s.selectOverlay);
  const setTimelineZoom = useVideoEditorStore((s) => s.setTimelineZoom);

  const totalWidth = videoDuration * timelineZoom;
  const TRACK_HEIGHT = 32;
  const RULER_HEIGHT = 24;
  const PADDING_LEFT = 8;

  // ── Ruler tick generation ────────────────────────────────────

  const ticks = [];
  // Pick interval based on zoom level
  const interval = timelineZoom >= 80 ? 1 : timelineZoom >= 40 ? 2 : 5;
  for (let t = 0; t <= videoDuration; t += interval) {
    ticks.push(t);
  }

  // ── Playhead drag ────────────────────────────────────────────

  const handleTimelineClick = useCallback(
    (e: React.MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const scrollLeft = container.scrollLeft;
      const x = e.clientX - rect.left + scrollLeft - PADDING_LEFT;
      const t = Math.max(0, Math.min(videoDuration, x / timelineZoom));
      setCurrentTime(t);
    },
    [videoDuration, timelineZoom, setCurrentTime],
  );

  // ── Trim handle drag ─────────────────────────────────────────

  const handleTrimDrag = useCallback(
    (edge: 'start' | 'end', e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();

      const onMove = (ev: PointerEvent) => {
        const scrollLeft = container.scrollLeft;
        const x = ev.clientX - rect.left + scrollLeft - PADDING_LEFT;
        const t = Math.max(0, Math.min(videoDuration, x / timelineZoom));
        if (edge === 'start') {
          setTrimStart(Math.min(t, trimEnd - 0.5));
        } else {
          setTrimEnd(Math.max(t, trimStart + 0.5));
        }
      };

      const onUp = () => {
        useVideoEditorStore.getState().pushHistory();
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [videoDuration, timelineZoom, trimStart, trimEnd, setTrimStart, setTrimEnd],
  );

  // ── Pinch-to-zoom (mouse wheel) ──────────────────────────────

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -5 : 5;
        setTimelineZoom(timelineZoom + delta);
      }
    },
    [timelineZoom, setTimelineZoom],
  );

  // ── Format time label ────────────────────────────────────────

  const formatTick = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ── Overlay track click ──────────────────────────────────────

  const allOverlays = [
    ...textOverlays.map((o) => ({ ...o, kind: 'text' as const })),
    ...stickerOverlays.map((o) => ({ ...o, kind: 'sticker' as const, text: o.emoji })),
  ];

  return (
    <div
      ref={containerRef}
      className="relative overflow-x-auto overflow-y-hidden border-t border-white/10 bg-black/40 shrink-0"
      style={{ height: RULER_HEIGHT + TRACK_HEIGHT + allOverlays.length * (TRACK_HEIGHT + 2) + 16 }}
      onClick={handleTimelineClick}
      onWheel={handleWheel}
    >
      <div
        className="relative"
        style={{ width: totalWidth + PADDING_LEFT * 2, minWidth: '100%' }}
      >
        {/* ── Ruler ──────────────────────────────────────── */}
        <div
          className="relative border-b border-white/5"
          style={{ height: RULER_HEIGHT, paddingLeft: PADDING_LEFT }}
        >
          {ticks.map((t) => (
            <div
              key={t}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: t * timelineZoom + PADDING_LEFT }}
            >
              <div className="w-px h-2 bg-white/20" />
              <span className="text-[9px] text-text-muted font-mono mt-0.5">
                {formatTick(t)}
              </span>
            </div>
          ))}
        </div>

        {/* ── Video Track ────────────────────────────────── */}
        <div
          className="relative"
          style={{ height: TRACK_HEIGHT, paddingLeft: PADDING_LEFT }}
        >
          {/* Full duration bar */}
          <div
            className="absolute top-1 rounded-md bg-white/5"
            style={{
              left: PADDING_LEFT,
              width: videoDuration * timelineZoom,
              height: TRACK_HEIGHT - 2,
            }}
          />

          {/* Active trim region */}
          <div
            className="absolute top-1 rounded-md bg-accent-primary/20 border border-accent-primary/40"
            style={{
              left: trimStart * timelineZoom + PADDING_LEFT,
              width: (trimEnd - trimStart) * timelineZoom,
              height: TRACK_HEIGHT - 2,
            }}
          />

          {/* Dimmed regions outside trim */}
          <div
            className="absolute top-1 bg-black/50 rounded-l-md"
            style={{
              left: PADDING_LEFT,
              width: trimStart * timelineZoom,
              height: TRACK_HEIGHT - 2,
            }}
          />
          <div
            className="absolute top-1 bg-black/50 rounded-r-md"
            style={{
              left: trimEnd * timelineZoom + PADDING_LEFT,
              width: (videoDuration - trimEnd) * timelineZoom,
              height: TRACK_HEIGHT - 2,
            }}
          />

          {/* Trim handle — start */}
          <div
            className="absolute top-0 w-3 cursor-col-resize z-10 flex items-center justify-center"
            style={{
              left: trimStart * timelineZoom + PADDING_LEFT - 6,
              height: TRACK_HEIGHT,
            }}
            onPointerDown={(e) => handleTrimDrag('start', e)}
          >
            <div className="w-1 h-4 rounded-full bg-accent-primary" />
          </div>

          {/* Trim handle — end */}
          <div
            className="absolute top-0 w-3 cursor-col-resize z-10 flex items-center justify-center"
            style={{
              left: trimEnd * timelineZoom + PADDING_LEFT - 6,
              height: TRACK_HEIGHT,
            }}
            onPointerDown={(e) => handleTrimDrag('end', e)}
          >
            <div className="w-1 h-4 rounded-full bg-accent-primary" />
          </div>
        </div>

        {/* ── Overlay Tracks ─────────────────────────────── */}
        {allOverlays.map((overlay, idx) => (
          <div
            key={overlay.id}
            className="relative"
            style={{
              height: TRACK_HEIGHT,
              paddingLeft: PADDING_LEFT,
              marginTop: 2,
            }}
          >
            <div
              className={`
                absolute top-1 rounded-md cursor-pointer text-[10px] font-medium
                flex items-center px-2 truncate
                ${overlay.kind === 'text' ? 'bg-purple-500/30 border border-purple-500/50 text-purple-200' : 'bg-yellow-500/30 border border-yellow-500/50 text-yellow-200'}
                ${selectedOverlayId === overlay.id ? 'ring-1 ring-white/50' : ''}
              `}
              style={{
                left: overlay.startTime * timelineZoom + PADDING_LEFT,
                width: Math.max(20, (overlay.endTime - overlay.startTime) * timelineZoom),
                height: TRACK_HEIGHT - 4,
              }}
              onClick={(e) => {
                e.stopPropagation();
                selectOverlay(overlay.id);
              }}
            >
              {overlay.kind === 'sticker' ? overlay.emoji : overlay.text}
            </div>
          </div>
        ))}

        {/* ── Playhead ───────────────────────────────────── */}
        <div
          className="absolute top-0 bottom-0 w-px bg-white/80 z-20 pointer-events-none"
          style={{ left: currentTime * timelineZoom + PADDING_LEFT }}
        >
          {/* Playhead triangle */}
          <div
            className="absolute -top-0.5 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '6px solid rgba(255,255,255,0.9)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
