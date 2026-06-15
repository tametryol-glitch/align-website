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

// Extract evenly-spaced frame thumbnails from the source video for a filmstrip.
// Best-effort: if the canvas is tainted (CORS) it bails and the track falls
// back to a plain bar.
function useFilmstrip(url: string, duration: number, count = 12): string[] {
  const [thumbs, setThumbs] = useState<string[]>([]);
  useEffect(() => {
    if (!url || !duration) return;
    let cancelled = false;
    const v = document.createElement('video');
    v.crossOrigin = 'anonymous';
    v.muted = true;
    v.preload = 'auto';
    v.src = url;
    const canvas = document.createElement('canvas');
    const seek = (t: number) =>
      new Promise<void>((res) => {
        const on = () => { v.removeEventListener('seeked', on); res(); };
        v.addEventListener('seeked', on);
        v.currentTime = t;
      });
    const run = async () => {
      const w = 60;
      const h = v.videoHeight && v.videoWidth ? Math.round(w * (v.videoHeight / v.videoWidth)) : 106;
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const out: string[] = [];
      for (let i = 0; i < count; i++) {
        if (cancelled) return;
        await seek(((i + 0.5) / count) * duration);
        try { ctx.drawImage(v, 0, 0, w, h); out.push(canvas.toDataURL('image/jpeg', 0.55)); }
        catch { return; } // tainted → graceful fallback
      }
      if (!cancelled) setThumbs(out);
    };
    const onReady = () => { run(); };
    v.addEventListener('loadeddata', onReady);
    return () => { cancelled = true; v.removeEventListener('loadeddata', onReady); v.src = ''; };
  }, [url, duration, count]);
  return thumbs;
}

export function TimelinePanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoDuration = useVideoEditorStore((s) => s.videoDuration);
  const sourceVideoUrl = useVideoEditorStore((s) => s.sourceVideoUrl);
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
  const updateTextOverlay = useVideoEditorStore((s) => s.updateTextOverlay);
  const updateStickerOverlay = useVideoEditorStore((s) => s.updateStickerOverlay);

  const thumbs = useFilmstrip(sourceVideoUrl, videoDuration);

  const totalWidth = videoDuration * timelineZoom;
  const TRACK_HEIGHT = 32;
  const VID_H = 54; // taller video track to show the frame filmstrip
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

  // ── Overlay edge drag (resize start/end on timeline) ──────────

  const handleOverlayEdgeDrag = useCallback(
    (overlayId: string, kind: 'text' | 'sticker', edge: 'start' | 'end', e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const updateFn = kind === 'text' ? updateTextOverlay : updateStickerOverlay;

      const onMove = (ev: PointerEvent) => {
        const scrollLeft = container.scrollLeft;
        const x = ev.clientX - rect.left + scrollLeft - PADDING_LEFT;
        const t = Math.max(0, Math.min(videoDuration, x / timelineZoom));

        // Get current overlay times from store
        const state = useVideoEditorStore.getState();
        const overlays = kind === 'text' ? state.textOverlays : state.stickerOverlays;
        const overlay = overlays.find((o: any) => o.id === overlayId);
        if (!overlay) return;

        if (edge === 'start') {
          updateFn(overlayId, { startTime: Math.min(t, overlay.endTime - 0.2) });
        } else {
          updateFn(overlayId, { endTime: Math.max(t, overlay.startTime + 0.2) });
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
    [videoDuration, timelineZoom, updateTextOverlay, updateStickerOverlay],
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

  // ── Playhead drag (grab the head and scrub) ──────────────────

  const handlePlayheadDrag = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const onMove = (ev: PointerEvent) => {
        const x = ev.clientX - rect.left + container.scrollLeft - PADDING_LEFT;
        setCurrentTime(Math.max(0, Math.min(videoDuration, x / timelineZoom)));
      };
      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [videoDuration, timelineZoom, setCurrentTime],
  );

  // ── Auto-scroll: keep the playhead in view as it plays/seeks ──

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const px = currentTime * timelineZoom + PADDING_LEFT;
    if (px < c.scrollLeft + 40 || px > c.scrollLeft + c.clientWidth - 40) {
      c.scrollLeft = Math.max(0, px - c.clientWidth / 2);
    }
  }, [currentTime, timelineZoom]);

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
      style={{ height: RULER_HEIGHT + VID_H + allOverlays.length * (TRACK_HEIGHT + 2) + 16 }}
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

        {/* ── Video Track (filmstrip) ────────────────────── */}
        <div
          className="relative"
          style={{ height: VID_H, paddingLeft: PADDING_LEFT }}
        >
          {/* Full duration: frame filmstrip if extracted, else a plain bar */}
          <div
            className="absolute top-1 rounded-md overflow-hidden bg-white/5"
            style={{
              left: PADDING_LEFT,
              width: videoDuration * timelineZoom,
              height: VID_H - 2,
            }}
          >
            {thumbs.length > 0 && (
              <div className="flex w-full h-full">
                {thumbs.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt=""
                    draggable={false}
                    className="h-full object-cover"
                    style={{ width: `${100 / thumbs.length}%` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Active trim region */}
          <div
            className="absolute top-1 rounded-md border-2 border-accent-primary pointer-events-none"
            style={{
              left: trimStart * timelineZoom + PADDING_LEFT,
              width: (trimEnd - trimStart) * timelineZoom,
              height: VID_H - 2,
            }}
          />

          {/* Dimmed regions outside trim */}
          <div
            className="absolute top-1 bg-black/60 rounded-l-md"
            style={{
              left: PADDING_LEFT,
              width: trimStart * timelineZoom,
              height: VID_H - 2,
            }}
          />
          <div
            className="absolute top-1 bg-black/60 rounded-r-md"
            style={{
              left: trimEnd * timelineZoom + PADDING_LEFT,
              width: (videoDuration - trimEnd) * timelineZoom,
              height: VID_H - 2,
            }}
          />

          {/* Trim handle — start */}
          <div
            className="absolute top-0 w-4 cursor-col-resize z-10 flex items-center justify-center"
            style={{
              left: trimStart * timelineZoom + PADDING_LEFT - 8,
              height: VID_H,
            }}
            onPointerDown={(e) => handleTrimDrag('start', e)}
          >
            <div className="w-1.5 h-6 rounded-full bg-accent-primary" />
          </div>

          {/* Trim handle — end */}
          <div
            className="absolute top-0 w-4 cursor-col-resize z-10 flex items-center justify-center"
            style={{
              left: trimEnd * timelineZoom + PADDING_LEFT - 8,
              height: VID_H,
            }}
            onPointerDown={(e) => handleTrimDrag('end', e)}
          >
            <div className="w-1.5 h-6 rounded-full bg-accent-primary" />
          </div>
        </div>

        {/* ── Overlay Tracks ─────────────────────────────── */}
        {allOverlays.map((overlay, idx) => {
          const barWidth = Math.max(20, (overlay.endTime - overlay.startTime) * timelineZoom);
          const barLeft = overlay.startTime * timelineZoom + PADDING_LEFT;
          const isText = overlay.kind === 'text';
          const isSelected = selectedOverlayId === overlay.id;

          return (
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
                  flex items-center px-3 truncate
                  ${isText ? 'bg-purple-500/30 border border-purple-500/50 text-purple-200' : 'bg-yellow-500/30 border border-yellow-500/50 text-yellow-200'}
                  ${isSelected ? 'ring-1 ring-white/50' : ''}
                `}
                style={{
                  left: barLeft,
                  width: barWidth,
                  height: TRACK_HEIGHT - 4,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  selectOverlay(overlay.id);
                }}
              >
                {overlay.kind === 'sticker' ? overlay.emoji : overlay.text}
              </div>

              {/* Left edge drag handle */}
              <div
                className="absolute top-1 w-2 cursor-col-resize z-10 flex items-center justify-center hover:bg-white/20 rounded-l-md"
                style={{
                  left: barLeft - 1,
                  height: TRACK_HEIGHT - 4,
                }}
                onPointerDown={(e) => handleOverlayEdgeDrag(overlay.id, overlay.kind, 'start', e)}
              >
                <div className={`w-0.5 h-3 rounded-full ${isText ? 'bg-purple-400' : 'bg-yellow-400'}`} />
              </div>

              {/* Right edge drag handle */}
              <div
                className="absolute top-1 w-2 cursor-col-resize z-10 flex items-center justify-center hover:bg-white/20 rounded-r-md"
                style={{
                  left: barLeft + barWidth - 3,
                  height: TRACK_HEIGHT - 4,
                }}
                onPointerDown={(e) => handleOverlayEdgeDrag(overlay.id, overlay.kind, 'end', e)}
              >
                <div className={`w-0.5 h-3 rounded-full ${isText ? 'bg-purple-400' : 'bg-yellow-400'}`} />
              </div>
            </div>
          );
        })}

        {/* ── Playhead (live position indicator, draggable) ── */}
        <div
          className="absolute top-0 bottom-0 z-20"
          style={{ left: currentTime * timelineZoom + PADDING_LEFT }}
        >
          {/* Vertical line — non-interactive so track clicks still seek */}
          <div className="absolute top-0 bottom-0 w-0.5 -translate-x-1/2 bg-accent-primary pointer-events-none" />
          {/* Draggable head */}
          <div
            className="absolute -top-1 -translate-x-1/2 cursor-col-resize z-30 px-1.5 py-0.5"
            onPointerDown={handlePlayheadDrag}
          >
            <div
              className="w-0 h-0"
              style={{
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '8px solid var(--color-accent-primary, #8b5cf6)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
