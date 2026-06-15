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
  const segments = useVideoEditorStore((s) => s.segments);
  const selectedSegmentId = useVideoEditorStore((s) => s.selectedSegmentId);
  const reorderSegments = useVideoEditorStore((s) => s.reorderSegments);
  const removeSegment = useVideoEditorStore((s) => s.removeSegment);
  const selectSegment = useVideoEditorStore((s) => s.selectSegment);
  const brollClips = useVideoEditorStore((s) => s.brollClips);
  const selectedBrollId = useVideoEditorStore((s) => s.selectedBrollId);
  const selectBroll = useVideoEditorStore((s) => s.selectBroll);
  const removeBroll = useVideoEditorStore((s) => s.removeBroll);
  const updateBroll = useVideoEditorStore((s) => s.updateBroll);

  const thumbs = useFilmstrip(sourceVideoUrl, videoDuration);
  const [dragSeg, setDragSeg] = useState<number | null>(null);

  const totalWidth = videoDuration * timelineZoom;
  const TRACK_HEIGHT = 32;
  const VID_H = 54; // taller video track to show the frame filmstrip
  const SEG_H = 44; // segments (cut/rearrange) row
  const BROLL_H = 38; // b-roll / overlay row
  const RULER_HEIGHT = 24;
  const PADDING_LEFT = 8;

  // Drag a b-roll block horizontally to move when it appears on the timeline.
  const handleBrollDrag = useCallback(
    (clipId: string, e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const clip = useVideoEditorStore.getState().brollClips.find((b) => b.id === clipId);
      const len = clip ? clip.sourceEnd - clip.sourceStart : 0;
      const onMove = (ev: PointerEvent) => {
        const x = ev.clientX - rect.left + container.scrollLeft - PADDING_LEFT;
        const t = Math.max(0, Math.min(videoDuration - len, x / timelineZoom));
        updateBroll(clipId, { timelineStart: t });
      };
      const onUp = () => {
        useVideoEditorStore.getState().pushHistory();
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [videoDuration, timelineZoom, updateBroll],
  );

  // Drag a b-roll block's left/right edge to change its start time / length.
  const handleBrollTrim = useCallback(
    (clipId: string, edge: 'start' | 'end', e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const onMove = (ev: PointerEvent) => {
        const x = ev.clientX - rect.left + container.scrollLeft - PADDING_LEFT;
        const t = Math.max(0, Math.min(videoDuration, x / timelineZoom));
        const clip = useVideoEditorStore.getState().brollClips.find((b) => b.id === clipId);
        if (!clip) return;
        if (edge === 'start') {
          // Trim the front: shift timelineStart + in-point together (right edge fixed).
          const delta = t - clip.timelineStart;
          const newSourceStart = Math.max(0, Math.min(clip.sourceEnd - 0.3, clip.sourceStart + delta));
          const applied = newSourceStart - clip.sourceStart;
          updateBroll(clipId, { sourceStart: newSourceStart, timelineStart: Math.max(0, clip.timelineStart + applied) });
        } else {
          const newLen = Math.max(0.3, t - clip.timelineStart);
          updateBroll(clipId, { sourceEnd: Math.min(clip.duration, clip.sourceStart + newLen) });
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
    [videoDuration, timelineZoom, updateBroll],
  );

  // Thumbnails whose source time falls inside [a,b] — for per-segment previews.
  const thumbsInRange = (a: number, b: number): string[] => {
    if (thumbs.length === 0 || !videoDuration) return [];
    return thumbs.filter((_, i) => {
      const t = ((i + 0.5) / thumbs.length) * videoDuration;
      return t >= a && t <= b;
    });
  };

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
      style={{ height: RULER_HEIGHT + VID_H + (segments.length > 0 ? SEG_H + 6 : 0) + (brollClips.length > 0 ? BROLL_H + 6 : 0) + allOverlays.length * (TRACK_HEIGHT + 2) + 16 }}
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

        {/* ── Segments row (cut / rearrange) — output order ── */}
        {segments.length > 0 && (() => {
          let acc = 0;
          return (
            <div className="relative" style={{ height: SEG_H + 6, paddingLeft: PADDING_LEFT, marginTop: 4 }}>
              {segments.map((g, i) => {
                const len = Math.max(0.1, g.sourceEnd - g.sourceStart);
                const left = acc * timelineZoom + PADDING_LEFT;
                const width = Math.max(30, len * timelineZoom);
                acc += len;
                const segThumbs = thumbsInRange(g.sourceStart, g.sourceEnd);
                const selected = selectedSegmentId === g.id;
                return (
                  <div
                    key={g.id}
                    draggable
                    onDragStart={() => setDragSeg(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragSeg !== null && dragSeg !== i) {
                        reorderSegments(dragSeg, i);
                        useVideoEditorStore.getState().pushHistory();
                      }
                      setDragSeg(null);
                    }}
                    onClick={(e) => { e.stopPropagation(); selectSegment(g.id); setCurrentTime(g.sourceStart); }}
                    className={`absolute top-1 rounded-md overflow-hidden cursor-grab border ${selected ? 'border-accent-primary ring-1 ring-accent-primary' : 'border-white/15'} ${dragSeg === i ? 'opacity-50' : ''}`}
                    style={{ left, width, height: SEG_H }}
                  >
                    <div className="absolute inset-0 flex">
                      {segThumbs.length > 0
                        ? segThumbs.map((src, k) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={k} src={src} alt="" draggable={false} className="h-full object-cover" style={{ width: `${100 / segThumbs.length}%` }} />
                          ))
                        : <div className="w-full h-full bg-accent-primary/20" />}
                    </div>
                    <div className="absolute inset-0 bg-black/25" />
                    <span className="absolute top-0.5 left-1 text-[9px] font-medium text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>Clip {i + 1}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeSegment(g.id); useVideoEditorStore.getState().pushHistory(); }}
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded bg-black/50 text-red-300 text-[10px] leading-none flex items-center justify-center hover:bg-black/70"
                      title="Remove clip"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* ── B-roll / overlay row ───────────────────────── */}
        {brollClips.length > 0 && (
          <div className="relative" style={{ height: BROLL_H + 6, paddingLeft: PADDING_LEFT, marginTop: 4 }}>
            {brollClips.map((b, i) => {
              const len = Math.max(0.1, b.sourceEnd - b.sourceStart);
              const left = b.timelineStart * timelineZoom + PADDING_LEFT;
              const width = Math.max(30, len * timelineZoom);
              const selected = selectedBrollId === b.id;
              return (
                <div
                  key={b.id}
                  onPointerDown={(e) => handleBrollDrag(b.id, e)}
                  onClick={(e) => { e.stopPropagation(); selectBroll(b.id); }}
                  className={`absolute top-1 rounded-md overflow-hidden cursor-grab border flex items-center px-2 bg-teal-500/25 ${selected ? 'border-accent-primary ring-1 ring-accent-primary' : 'border-teal-400/40'}`}
                  style={{ left, width, height: BROLL_H }}
                >
                  {/* trim-start handle */}
                  <div
                    onPointerDown={(e) => handleBrollTrim(b.id, 'start', e)}
                    className="absolute left-0 top-0 bottom-0 w-2.5 cursor-col-resize z-10 flex items-center justify-center hover:bg-white/25"
                    title="Drag to trim the start"
                  >
                    <div className="w-0.5 h-4 rounded-full bg-teal-100" />
                  </div>
                  {/* trim-end handle */}
                  <div
                    onPointerDown={(e) => handleBrollTrim(b.id, 'end', e)}
                    className="absolute right-0 top-0 bottom-0 w-2.5 cursor-col-resize z-10 flex items-center justify-center hover:bg-white/25"
                    title="Drag to change the length"
                  >
                    <div className="w-0.5 h-4 rounded-full bg-teal-100" />
                  </div>
                  <span className="text-[10px] font-medium text-teal-100 truncate flex-1 px-2.5 pointer-events-none">{'▶'} B-roll {i + 1}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeBroll(b.id); useVideoEditorStore.getState().pushHistory(); }}
                    className="text-red-300 text-[10px] ml-1 hover:text-red-200"
                    title="Remove overlay"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}

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
