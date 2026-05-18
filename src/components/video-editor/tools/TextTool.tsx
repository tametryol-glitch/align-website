'use client';

/**
 * TextTool — add and edit text overlays with full styling controls.
 * Controls: text input, font size, color (presets + custom picker),
 * font family, animation, text alignment, background, outline, timing.
 */

import { useState } from 'react';
import { useVideoEditorStore, type TextOverlay } from '@/stores/videoEditorStore';
import { Plus, Trash2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

const FONT_FAMILIES = [
  'Inter',
  'Playfair Display',
  'Georgia',
  'Courier New',
  'Arial Black',
  'Trebuchet MS',
  'Impact',
  'Comic Sans MS',
  'Verdana',
  'Lucida Console',
];

const COLORS = [
  '#FFFFFF', '#FFD700', '#FF6B6B', '#A78BFA', '#34D399',
  '#60A5FA', '#F472B6', '#FBBF24', '#000000', '#FF4500',
  '#00CED1', '#9370DB',
];

const BG_COLORS = [
  '', '#000000CC', '#FFFFFFCC', '#FF6B6BCC',
  '#A78BFACC', '#34D399CC', '#60A5FACC',
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
      bgColor: '',
      strokeColor: '',
      strokeWidth: 0,
      textAlign: 'center',
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

          {/* Color picker: presets + custom */}
          <div>
            <label className="text-xs text-text-muted block mb-1">Color</label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => { update({ color: c }); pushHistory(); }}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    selected.color === c ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              {/* Custom color picker */}
              <label className="relative w-6 h-6 rounded-full overflow-hidden cursor-pointer border-2 border-dashed border-white/30 hover:border-white/60 transition-colors">
                <input
                  type="color"
                  value={selected.color}
                  onChange={(e) => { update({ color: e.target.value }); }}
                  onBlur={() => pushHistory()}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="w-full h-full bg-gradient-to-br from-red-500 via-green-500 to-blue-500 rounded-full" />
              </label>
            </div>
          </div>

          {/* Text alignment */}
          <div>
            <label className="text-xs text-text-muted block mb-1">Alignment</label>
            <div className="flex items-center gap-1">
              {(['left', 'center', 'right'] as const).map((align) => {
                const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : AlignRight;
                return (
                  <button
                    key={align}
                    onClick={() => { update({ textAlign: align }); pushHistory(); }}
                    className={`p-1.5 rounded-md transition-colors ${
                      selected.textAlign === align
                        ? 'bg-accent-primary/20 text-accent-primary'
                        : 'bg-white/5 text-text-muted hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
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

          {/* Background color */}
          <div>
            <label className="text-xs text-text-muted block mb-1">Background</label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {BG_COLORS.map((c, i) => (
                <button
                  key={i}
                  onClick={() => { update({ bgColor: c }); pushHistory(); }}
                  className={`w-6 h-6 rounded-md border-2 transition-transform ${
                    selected.bgColor === c ? 'border-white scale-110' : 'border-white/20'
                  } ${!c ? 'bg-transparent' : ''}`}
                  style={{ backgroundColor: c || undefined }}
                  title={!c ? 'None' : c}
                >
                  {!c && <span className="text-[10px] text-text-muted leading-none">x</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Outline / Stroke */}
          <div>
            <label className="text-xs text-text-muted block mb-1">
              Outline: {selected.strokeWidth}px
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={4}
                step={0.5}
                value={selected.strokeWidth}
                onChange={(e) => update({ strokeWidth: parseFloat(e.target.value) })}
                onMouseUp={() => pushHistory()}
                className="flex-1 accent-accent-primary"
              />
              {selected.strokeWidth > 0 && (
                <input
                  type="color"
                  value={selected.strokeColor || '#000000'}
                  onChange={(e) => { update({ strokeColor: e.target.value }); }}
                  onBlur={() => pushHistory()}
                  className="w-7 h-7 rounded cursor-pointer border border-white/20"
                />
              )}
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
