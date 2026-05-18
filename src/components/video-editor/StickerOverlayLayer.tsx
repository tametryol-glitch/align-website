'use client';

/**
 * StickerOverlayLayer — renders draggable + resizable emoji/sticker
 * overlays on top of the video preview.
 */

import { useCallback, useState, useRef } from 'react';
import { useVideoEditorStore, type StickerOverlay } from '@/stores/videoEditorStore';

interface StickerOverlayLayerProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function StickerOverlayLayer({ containerRef }: StickerOverlayLayerProps) {
  const stickerOverlays = useVideoEditorStore((s) => s.stickerOverlays);
  const selectedOverlayId = useVideoEditorStore((s) => s.selectedOverlayId);
  const selectOverlay = useVideoEditorStore((s) => s.selectOverlay);
  const updateStickerOverlay = useVideoEditorStore((s) => s.updateStickerOverlay);
  const pushHistory = useVideoEditorStore((s) => s.pushHistory);
  const currentTime = useVideoEditorStore((s) => s.currentTime);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {stickerOverlays.map((sticker) => {
        const visible = currentTime >= sticker.startTime && currentTime <= sticker.endTime;
        if (!visible) return null;

        return (
          <DraggableSticker
            key={sticker.id}
            sticker={sticker}
            isSelected={selectedOverlayId === sticker.id}
            containerRef={containerRef}
            onSelect={() => selectOverlay(sticker.id)}
            onUpdate={(partial) => updateStickerOverlay(sticker.id, partial)}
            onDragEnd={() => pushHistory()}
          />
        );
      })}
    </div>
  );
}

// ── Draggable single sticker ───────────────────────────────────

interface DraggableStickerProps {
  sticker: StickerOverlay;
  isSelected: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onSelect: () => void;
  onUpdate: (partial: Partial<StickerOverlay>) => void;
  onDragEnd: () => void;
}

function DraggableSticker({
  sticker,
  isSelected,
  containerRef,
  onSelect,
  onUpdate,
  onDragEnd,
}: DraggableStickerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onSelect();

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        ox: sticker.x,
        oy: sticker.y,
      };
      setIsDragging(true);

      const handleMove = (ev: PointerEvent) => {
        const dx = ((ev.clientX - dragStart.current.x) / rect.width) * 100;
        const dy = ((ev.clientY - dragStart.current.y) / rect.height) * 100;
        const newX = Math.max(0, Math.min(100, dragStart.current.ox + dx));
        const newY = Math.max(0, Math.min(100, dragStart.current.oy + dy));
        onUpdate({ x: newX, y: newY });
      };

      const handleUp = () => {
        setIsDragging(false);
        onDragEnd();
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
      };

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    },
    [onSelect, containerRef, sticker.x, sticker.y, onUpdate, onDragEnd],
  );

  // Scroll wheel to resize
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.max(0.3, Math.min(5, sticker.scale + delta));
      onUpdate({ scale: newScale });
    },
    [sticker.scale, onUpdate],
  );

  return (
    <div
      className={`absolute pointer-events-auto cursor-move ${isDragging ? 'opacity-80' : ''}`}
      style={{
        left: `${sticker.x}%`,
        top: `${sticker.y}%`,
        transform: `translate(-50%, -50%) scale(${sticker.scale}) rotate(${sticker.rotation ?? 0}deg)`,
      }}
      onPointerDown={handlePointerDown}
      onWheel={handleWheel}
    >
      <div
        className={`
          select-none p-1 rounded-lg
          ${isSelected ? 'ring-2 ring-accent-primary ring-offset-1 ring-offset-transparent' : ''}
        `}
      >
        {sticker.imageUrl ? (
          <img
            src={sticker.imageUrl}
            alt="sticker"
            className="w-16 h-16 object-contain pointer-events-none"
            draggable={false}
          />
        ) : (
          <span className="text-4xl">{sticker.emoji}</span>
        )}
      </div>
    </div>
  );
}
