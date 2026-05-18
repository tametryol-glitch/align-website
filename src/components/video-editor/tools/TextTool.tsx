'use client';

/**
 * TextTool — add and edit text overlays.
 * Controls: text input, font size, color, animation, timing.
 */

import { useState } from 'react';
import { useVideoEditorStore, type TextOverlay } from '@/stores/videoEditorStore';
import { Plus, Trash2 } from 'lucide-react';

const FONT_FAMILIES = [
  'Inter',
  'Playfair Display',
  'Georgia',
  'Courier New',
  'Arial Black',
];

const COLORS = [
  '#FFFFFF', '#FFD700', '#FF6B6B', '#A78BFA', '#34D399',
  '#60A5FA', '#F472B6', '#FBBF24', '#000000',
];

const ANIMATIONS: TextOverlay['animation'][] = [
  'none', 'fade', 'slide', 'scale', 'typewriter',
];

export function TextTool() {
  const textOverlays = useVideoEditorStore((s) => s.textOverlays);
  const selectedOverlayId = useVideoEditorStore((s) => s.selectedOverlayId);
  const addTextOverlay = useVideoEditorStore((s) => s.addTextOverlay);
  const updateTextOverlay = useVideoEditorStore((s) => s.updateTextOverlay);
  const removeTextOverlay = useVideoEditorStore((s) => s.removeTextOverlay);
  const selectOverlay = useVideoEditorStore((s) => s.selectOverlay);
  const pushHistory = useVideoEditorStore((s) => s.pushHistory);
  const currentTime = useVideoEditorStore((s) => s.currentTime);
  const videoDuration = useVideoEditorStore((s) => s.videoDuration);
  const trimEnd = useVideoEditorStore((s) => s.trimEnd);

  const selected = textOverlays.find((o) => o.id === selectedOverlayId);

  const handleAdd = () => {
    const id = `text_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newOverlay: TextOverlay = {
      id,
      text: 'Your text here',
      x: 50,
      y: 50,
      fontSize: 28,
      color: '#FFFFFF',
      fontFamily: 'Inter',
      startTime: currentTime,
      endTime: Math.min(currentTime + 5, trimEnd),
      animation: 'fade',
    };
    addTextOverlay(newOverlay);
    selectOverlay(id);
    pushHistory();
  };

  const handleDelete = () => {
    if (selectedOverlayId) {
      removeTextOverlay(selectedOverlayId);
      pushHistory();
    }
  };

  const update = (partial: Partial<TextOverlay>) => {
    if (selectedOverlayId) {
      updateTextOverlay(selectedOverlayId, partial);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add button */}
      <button
        onClick={handleAdd}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent-primary/20 text-accent-primary text-sm font-medium hover:bg-accent-primary/30 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Text Overlay
      </button>

      {/* List of overlays */}
      {textOverlays.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-text-muted">Overlays ({textOverlays.length})</p>
          {textOverlays.map((o) => (
            <button
              key={o.id}
              onClick={() => selectOverlay(o.id)}
              className={`
                w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors
                ${selectedOverlayId === o.id
                  ? 'bg-accent-primary/20 text-accent-primary'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10'}
              `}
            >
              {o.text}
            </button>
          ))}
        </div>
      )}

      {/* Edit selected overlay */}
      {selected && (
        <div className="space-y-3 border-t border-white/10 pt-3">
          {/* Text input */}
          <div>
            <label className="text-xs text-text-muted block mb-1">Text</label>
            <input
              type="text"
              value={selected.text}
              onChange={(e) => update({ text: e.target.value })}
              onBlur={() => pushHistory()}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-accent-primary"
            />
          </div>

          {/* Font size */}
          <div>
            <label className="text-xs text-text-muted block mb-1">
              Size: {selected.fontSize}px
            </label>
            <input
              type="range"
              min={12}
              max={72}
              value={selected.fontSize}
              onChange={(e) => update({ fontSize: parseInt(e.target.value) })}
              onMouseUp={() => pushHistory()}
              className="w-full accent-accent-primary"
            />
          </div>

          {/* Color picker */}
          <div>
            <label className="text-xs text-text-muted block mb-1">Color</label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => { update({ color: c }); pushHistory(); }}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    selected.color === c ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Font family */}
          <div>
            <label className="text-xs text-text-muted block mb-1">Font</label>
            <div className="flex items-center gap-1 flex-wrap">
              {FONT_FAMILIES.map((f) => (
                <button
                  key={f}
                  onClick={() => { update({ fontFamily: f }); pushHistory(); }}
                  className={`px-2 py-1 rounded-md text-xs transition-colors ${
                    selected.fontFamily === f
                      ? 'bg-accent-primary/20 text-accent-primary'
                      : 'bg-white/5 text-text-muted hover:bg-white/10'
                  }`}
                  style={{ fontFamily: f }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Animation */}
          <div>
            <label className="text-xs text-text-muted block mb-1">Animation</label>
            <div className="flex items-center gap-1 flex-wrap">
              {ANIMATIONS.map((a) => (
                <button
                  key={a}
                  onClick={() => { update({ animation: a }); pushHistory(); }}
                  className={`px-2 py-1 rounded-md text-xs capitalize transition-colors ${
                    selected.animation === a
                      ? 'bg-accent-primary/20 text-accent-primary'
                      : 'bg-white/5 text-text-muted hover:bg-white/10'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Timing */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-text-muted block mb-1">Start (s)</label>
              <input
                type="number"
                min={0}
                max={selected.endTime - 0.1}
                step={0.1}
                value={selected.startTime}
                onChange={(e) => update({ startTime: parseFloat(e.target.value) || 0 })}
                onBlur={() => pushHistory()}
                className="w-full px-2 py-1.5 rounded-md bg-white/5 border border-white/10 text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-accent-primary"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">End (s)</label>
              <input
                type="number"
                min={selected.startTime + 0.1}
                max={videoDuration}
                step={0.1}
                value={selected.endTime}
                onChange={(e) => update({ endTime: parseFloat(e.target.value) || videoDuration })}
                onBlur={() => pushHistory()}
                className="w-full px-2 py-1.5 rounded-md bg-white/5 border border-white/10 text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-accent-primary"
              />
            </div>
          </div>

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete overlay
          </button>
        </div>
      )}
    </div>
  );
}
