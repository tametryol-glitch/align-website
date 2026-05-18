'use client';

/**
 * TextOverlayLayer — renders draggable text overlays on top of the video.
 *
 * Each text overlay is a positioned <div> that the user can drag to
 * reposition. Double-click to edit text inline.
 */

import { useCallback, useState, useRef, useEffect } from 'react';
import { useVideoEditorStore, type TextOverlay } from '@/stores/videoEditorStore';

interface TextOverlayLayerProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function TextOverlayLayer({ containerRef }: TextOverlayLayerProps) {
  const textOverlays = useVideoEditorStore((s) => s.textOverlays);
  const selectedOverlayId = useVideoEditorStore((s) => s.selectedOverlayId);
  const selectOverlay = useVideoEditorStore((s) => s.selectOverlay);
  const updateTextOverlay = useVideoEditorStore((s) => s.updateTextOverlay);
  const pushHistory = useVideoEditorStore((s) => s.pushHistory);
  const currentTime = useVideoEditorStore((s) => s.currentTime);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {textOverlays.map((overlay) => {
        const visible = currentTime >= overlay.startTime && currentTime <= overlay.endTime;
        if (!visible) return null;

        return (
          <DraggableText
            key={overlay.id}
            overlay={overlay}
            isSelected={selectedOverlayId === overlay.id}
            containerRef={containerRef}
            onSelect={() => selectOverlay(overlay.id)}
            onUpdate={(partial) => {
              updateTextOverlay(overlay.id, partial);
            }}
            onDragEnd={() => pushHistory()}
          />
        );
      })}
    </div>
  );
}

// ── Draggable single text overlay ──────────────────────────────

interface DraggableTextProps {
  overlay: TextOverlay;
  isSelected: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onSelect: () => void;
  onUpdate: (partial: Partial<TextOverlay>) => void;
  onDragEnd: () => void;
}

function DraggableText({
  overlay,
  isSelected,
  containerRef,
  onSelect,
  onUpdate,
  onDragEnd,
}: DraggableTextProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const textRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isEditing) return;
      e.stopPropagation();
      e.preventDefault();
      onSelect();

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        ox: overlay.x,
        oy: overlay.y,
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
    [isEditing, onSelect, containerRef, overlay.x, overlay.y, onUpdate, onDragEnd],
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsEditing(true);
      onSelect();
      // Focus the editable element after render
      setTimeout(() => textRef.current?.focus(), 0);
    },
    [onSelect],
  );

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    const newText = textRef.current?.innerText?.trim();
    if (newText && newText !== overlay.text) {
      onUpdate({ text: newText });
      onDragEnd(); // push history
    }
  }, [overlay.text, onUpdate, onDragEnd]);

  const animationClass =
    overlay.animation === 'fade' ? 'animate-fadeIn'
    : overlay.animation === 'scale' ? 'animate-scaleIn'
    : overlay.animation === 'slide' ? 'animate-slideIn'
    : overlay.animation === 'typewriter' ? 'animate-typewriter'
    : '';

  return (
    <div
      className={`absolute pointer-events-auto cursor-move ${animationClass}`}
      style={{
        left: `${overlay.x}%`,
        top: `${overlay.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
    >
      <div
        ref={textRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onBlur={handleBlur}
        className={`
          px-3 py-1.5 rounded-lg whitespace-nowrap
          ${isSelected ? 'ring-2 ring-accent-primary ring-offset-1 ring-offset-transparent' : ''}
          ${isEditing ? 'cursor-text bg-black/40' : ''}
          ${isDragging ? 'opacity-80' : ''}
        `}
        style={{
          fontSize: `${overlay.fontSize}px`,
          color: overlay.color,
          fontFamily: overlay.fontFamily,
          textAlign: overlay.textAlign || 'center',
          textShadow: '0 2px 8px rgba(0,0,0,0.8)',
          backgroundColor: overlay.bgColor || undefined,
          WebkitTextStroke: overlay.strokeWidth && overlay.strokeColor
            ? `${overlay.strokeWidth}px ${overlay.strokeColor}`
            : undefined,
          paintOrder: overlay.strokeWidth ? 'stroke fill' : undefined,
          outline: 'none',
        }}
      >
        {overlay.text}
      </div>
    </div>
  );
}
