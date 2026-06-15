'use client';

/**
 * BrollLayer — renders B-roll / overlay clips as picture-in-picture <video>
 * elements over the main preview. Each is shown during its window, seeked to
 * follow the playhead, and — like stickers — can be dragged to reposition
 * (with snap-to-center/edge guides), scroll-wheel resized, and corner resized.
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { useVideoEditorStore, type BrollClip } from '@/stores/videoEditorStore';

interface BrollLayerProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const SNAP_POINTS = [0, 50, 100];
const SNAP_THRESHOLD = 2.8; // %

function snapValue(v: number): { value: number; guide: number | null } {
  for (const p of SNAP_POINTS) {
    if (Math.abs(v - p) < SNAP_THRESHOLD) return { value: p, guide: p };
  }
  return { value: v, guide: null };
}

export function BrollLayer({ containerRef }: BrollLayerProps) {
  const brollClips = useVideoEditorStore((s) => s.brollClips);
  // Active snap guide positions (% of frame), shown while dragging.
  const [guideX, setGuideX] = useState<number | null>(null);
  const [guideY, setGuideY] = useState<number | null>(null);

  return (
    <>
      {brollClips.map((clip) => (
        <BrollClipView
          key={clip.id}
          clip={clip}
          containerRef={containerRef}
          onGuide={(gx, gy) => { setGuideX(gx); setGuideY(gy); }}
        />
      ))}
      {guideX !== null && (
        <div style={{ position: 'absolute', left: `${guideX}%`, top: 0, bottom: 0, width: 1, background: 'rgba(139,92,246,0.9)', pointerEvents: 'none', zIndex: 7 }} />
      )}
      {guideY !== null && (
        <div style={{ position: 'absolute', top: `${guideY}%`, left: 0, right: 0, height: 1, background: 'rgba(139,92,246,0.9)', pointerEvents: 'none', zIndex: 7 }} />
      )}
    </>
  );
}

function BrollClipView({ clip, containerRef, onGuide }: {
  clip: BrollClip;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onGuide: (gx: number | null, gy: number | null) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const currentTime = useVideoEditorStore((s) => s.currentTime);
  const isPlaying = useVideoEditorStore((s) => s.isPlaying);
  const selectedBrollId = useVideoEditorStore((s) => s.selectedBrollId);
  const selectBroll = useVideoEditorStore((s) => s.selectBroll);
  const updateBroll = useVideoEditorStore((s) => s.updateBroll);
  const pushHistory = useVideoEditorStore((s) => s.pushHistory);

  const [dragging, setDragging] = useState(false);
  const start = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  const len = Math.max(0.1, clip.sourceEnd - clip.sourceStart);
  const visible = currentTime >= clip.timelineStart && currentTime <= clip.timelineStart + len;
  const localTarget = clip.sourceStart + (currentTime - clip.timelineStart);
  const selected = selectedBrollId === clip.id;

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (visible) {
      if (Math.abs(v.currentTime - localTarget) > 0.3) {
        v.currentTime = Math.max(0, Math.min(clip.duration, localTarget));
      }
      if (isPlaying && v.paused) v.play().catch(() => {});
      if (!isPlaying && !v.paused) v.pause();
    } else if (!v.paused) {
      v.pause();
    }
  }, [visible, isPlaying, localTarget, clip.duration]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      selectBroll(clip.id);
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      start.current = { x: e.clientX, y: e.clientY, ox: clip.x, oy: clip.y };
      setDragging(true);
      const move = (ev: PointerEvent) => {
        const dx = ((ev.clientX - start.current.x) / rect.width) * 100;
        const dy = ((ev.clientY - start.current.y) / rect.height) * 100;
        const sx = snapValue(Math.max(0, Math.min(100, start.current.ox + dx)));
        const sy = snapValue(Math.max(0, Math.min(100, start.current.oy + dy)));
        updateBroll(clip.id, { x: sx.value, y: sy.value });
        onGuide(sx.guide, sy.guide);
      };
      const up = () => {
        setDragging(false);
        onGuide(null, null);
        pushHistory();
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    },
    [clip.id, clip.x, clip.y, containerRef, selectBroll, updateBroll, pushHistory, onGuide],
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -0.04 : 0.04;
      updateBroll(clip.id, { scale: Math.max(0.15, Math.min(1, clip.scale + delta)) });
    },
    [clip.id, clip.scale, updateBroll],
  );

  const handleResize = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + (clip.x / 100) * rect.width;
      const move = (ev: PointerEvent) => {
        const half = Math.abs(ev.clientX - centerX);
        updateBroll(clip.id, { scale: Math.max(0.15, Math.min(1, (2 * half) / rect.width)) });
      };
      const up = () => {
        pushHistory();
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    },
    [clip.id, clip.x, containerRef, updateBroll, pushHistory],
  );

  return (
    <div
      onPointerDown={handlePointerDown}
      onWheel={handleWheel}
      style={{
        position: 'absolute',
        left: `${clip.x}%`,
        top: `${clip.y}%`,
        width: `${clip.scale * 100}%`,
        transform: 'translate(-50%, -50%)',
        opacity: visible ? clip.opacity : 0,
        display: visible ? 'block' : 'none',
        borderRadius: 8,
        outline: selected ? '2px solid var(--color-accent-primary, #8b5cf6)' : 'none',
        boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
        cursor: dragging ? 'grabbing' : 'move',
        zIndex: 5,
      }}
    >
      <video ref={ref} src={clip.sourceUrl} muted playsInline className="w-full h-auto block rounded-lg pointer-events-none" />
      {selected && (
        <div
          onPointerDown={handleResize}
          title="Drag to resize"
          style={{
            position: 'absolute', right: -7, bottom: -7, width: 16, height: 16,
            borderRadius: '50%', background: 'var(--color-accent-primary, #8b5cf6)',
            border: '2px solid #fff', cursor: 'nwse-resize', zIndex: 6,
          }}
        />
      )}
    </div>
  );
}
