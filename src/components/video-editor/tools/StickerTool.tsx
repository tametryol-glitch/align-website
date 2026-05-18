'use client';

/**
 * StickerTool — emoji/sticker picker. Tap to add a sticker overlay
 * at the center of the video at the current playhead position.
 */

import { useVideoEditorStore, type StickerOverlay } from '@/stores/videoEditorStore';
import { Trash2 } from 'lucide-react';

const STICKER_CATEGORIES = [
  {
    label: 'Zodiac',
    items: ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'],
  },
  {
    label: 'Cosmic',
    items: ['✨', '🌟', '💫', '🌙', '☀️', '🌍', '🪐', '🌌', '🔮', '💎', '🌈', '⚡'],
  },
  {
    label: 'Hearts',
    items: ['❤️', '💜', '💙', '💚', '💛', '🧡', '🤍', '🖤', '💖', '💗', '💕', '💞'],
  },
  {
    label: 'Fun',
    items: ['🎉', '🎊', '🎵', '🎶', '🔥', '👑', '🦋', '🌸', '🍀', '🎭', '🎪', '🚀'],
  },
  {
    label: 'Faces',
    items: ['😍', '🥰', '😎', '🤩', '😇', '🧐', '🤔', '😏', '🥺', '😤', '🤯', '🫠'],
  },
];

export function StickerTool() {
  const currentTime = useVideoEditorStore((s) => s.currentTime);
  const trimEnd = useVideoEditorStore((s) => s.trimEnd);
  const addStickerOverlay = useVideoEditorStore((s) => s.addStickerOverlay);
  const stickerOverlays = useVideoEditorStore((s) => s.stickerOverlays);
  const selectedOverlayId = useVideoEditorStore((s) => s.selectedOverlayId);
  const removeStickerOverlay = useVideoEditorStore((s) => s.removeStickerOverlay);
  const updateStickerOverlay = useVideoEditorStore((s) => s.updateStickerOverlay);
  const selectOverlay = useVideoEditorStore((s) => s.selectOverlay);
  const pushHistory = useVideoEditorStore((s) => s.pushHistory);
  const videoDuration = useVideoEditorStore((s) => s.videoDuration);

  const selected = stickerOverlays.find((s) => s.id === selectedOverlayId);

  const handleAddSticker = (emoji: string) => {
    const id = `sticker_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newSticker: StickerOverlay = {
      id,
      emoji,
      x: 50,
      y: 50,
      scale: 1,
      startTime: currentTime,
      endTime: Math.min(currentTime + 5, trimEnd),
    };
    addStickerOverlay(newSticker);
    selectOverlay(id);
    pushHistory();
  };

  const handleDelete = () => {
    if (selectedOverlayId) {
      removeStickerOverlay(selectedOverlayId);
      pushHistory();
    }
  };

  return (
    <div className="space-y-4">
      {/* Emoji grid by category */}
      {STICKER_CATEGORIES.map((cat) => (
        <div key={cat.label}>
          <p className="text-xs text-text-muted mb-1.5">{cat.label}</p>
          <div className="flex flex-wrap gap-1.5">
            {cat.items.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleAddSticker(emoji)}
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center text-xl"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Selected sticker controls */}
      {selected && (
        <div className="space-y-3 border-t border-white/10 pt-3">
          <p className="text-xs text-text-muted">
            Selected: {selected.emoji}
          </p>

          {/* Scale */}
          <div>
            <label className="text-xs text-text-muted block mb-1">
              Size: {selected.scale.toFixed(1)}x
            </label>
            <input
              type="range"
              min={0.3}
              max={5}
              step={0.1}
              value={selected.scale}
              onChange={(e) => updateStickerOverlay(selected.id, { scale: parseFloat(e.target.value) })}
              onMouseUp={() => pushHistory()}
              className="w-full accent-accent-primary"
            />
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
                onChange={(e) => updateStickerOverlay(selected.id, { startTime: parseFloat(e.target.value) || 0 })}
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
                onChange={(e) => updateStickerOverlay(selected.id, { endTime: parseFloat(e.target.value) || videoDuration })}
                onBlur={() => pushHistory()}
                className="w-full px-2 py-1.5 rounded-md bg-white/5 border border-white/10 text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-accent-primary"
              />
            </div>
          </div>

          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete sticker
          </button>
        </div>
      )}

      <p className="text-xs text-text-muted">
        Tip: Drag stickers on the video to reposition. Scroll wheel to resize.
      </p>
    </div>
  );
}
