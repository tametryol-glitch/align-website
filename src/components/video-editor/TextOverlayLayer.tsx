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
            now={currentTime}
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
  now: number;
  isSelected: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onSelect: () => void;
  onUpdate: (partial: Partial<TextOverlay>) => void;
  onDragEnd: () => void;
}

const WORD_ANIMS = ['word-pop', 'karaoke', 'typewriter'] as const;
type WordAnim = (typeof WORD_ANIMS)[number];
function isWordAnim(a: TextOverlay['animation']): a is WordAnim {
  return (WORD_ANIMS as readonly string[]).includes(a);
}

function DraggableText({
  overlay,
  now,
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

  const wordLevel = isWordAnim(overlay.animation);
  const animationClass = wordLevel ? ''
    : overlay.animation === 'fade' ? 'animate-fadeIn'
    : overlay.animation === 'scale' ? 'animate-scaleIn'
    : overlay.animation === 'slide' ? 'animate-slideIn'
    : overlay.animation === 'bounce' ? 'animate-bounceIn'
    : '';

  return (
    <div
      className={`absolute pointer-events-auto cursor-move ${animationClass}`}
      style={{
        left: `${overlay.x}%`,
        top: `${overlay.y}%`,
        transform: `translate(-50%, -50%) rotate(${overlay.rotation ?? 0}deg)`,
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
        {isEditing || !wordLevel
          ? overlay.text
          : <WordAnimatedText overlay={overlay} now={now} />}
      </div>
    </div>
  );
}

// ── Word-by-word kinetic text (preview) ────────────────────────
// Time-driven so scrubbing shows the exact state, mirroring the export.

function WordAnimatedText({ overlay, now }: { overlay: TextOverlay; now: number }) {
  const words = overlay.text.split(/\s+/).filter(Boolean);
  const rel = Math.max(0, now - overlay.startTime);
  const anim = overlay.animation;
  const slice = words.length > 0 ? Math.max(0.15, (overlay.endTime - overlay.startTime) / words.length) : 0.3;
  const activeIdx = Math.floor(rel / slice);

  return (
    <span className="inline-flex flex-wrap gap-[0.25em] justify-center">
      {words.map((w, i) => {
        let style: React.CSSProperties = {};
        if (anim === 'word-pop') {
          const at = i * 0.12;
          const p = Math.max(0, Math.min(1, (rel - at) / 0.18));
          style = {
            opacity: p,
            transform: `translateY(${(1 - p) * -14}px) scale(${0.7 + 0.3 * p})`,
            display: 'inline-block',
          };
        } else if (anim === 'typewriter') {
          const at = i * 0.16;
          style = { opacity: rel >= at ? 1 : 0, display: 'inline-block' };
        } else if (anim === 'karaoke') {
          const active = i === activeIdx;
          style = {
            display: 'inline-block',
            color: active ? '#FFD60A' : undefined,
            transform: active ? 'scale(1.08)' : 'scale(1)',
            transition: 'transform 0.1s, color 0.1s',
          };
        }
        return (
          <span key={i} style={style}>
            {w}
          </span>
        );
      })}
    </span>
  );
}
