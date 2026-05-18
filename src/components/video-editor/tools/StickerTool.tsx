'use client';

/**
 * StickerTool — emoji/sticker picker + GIPHY GIF search.
 * Tap to add a sticker overlay at the center of the video.
 */

import { useState, useCallback, useRef } from 'react';
import { useVideoEditorStore, type StickerOverlay } from '@/stores/videoEditorStore';
import { Trash2, Search, RotateCw, Loader2 } from 'lucide-react';

const GIPHY_API_KEY = 'eAQjSICFiM1x64bkd8k6nqxc6Bv9U8jT';

interface GiphyGif {
  id: string;
  title: string;
  images: {
    fixed_height_small: { url: string; width: string; height: string };
    preview_gif: { url: string };
    original: { url: string };
  };
}

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

  const [giphyQuery, setGiphyQuery] = useState('');
  const [giphyResults, setGiphyResults] = useState<GiphyGif[]>([]);
  const [giphyLoading, setGiphyLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'emoji' | 'gif'>('emoji');
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      rotation: 0,
    };
    addStickerOverlay(newSticker);
    selectOverlay(id);
    pushHistory();
  };

  const handleAddGif = (gif: GiphyGif) => {
    const id = `sticker_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newSticker: StickerOverlay = {
      id,
      emoji: '🎬',
      imageUrl: gif.images.fixed_height_small.url,
      x: 50,
      y: 50,
      scale: 1,
      startTime: currentTime,
      endTime: Math.min(currentTime + 5, trimEnd),
      rotation: 0,
    };
    addStickerOverlay(newSticker);
    selectOverlay(id);
    pushHistory();
  };

  const searchGiphy = useCallback(async (query: string) => {
    if (!query.trim()) {
      // Show trending when empty
      setGiphyLoading(true);
      try {
        const res = await fetch(
          `https://api.giphy.com/v1/stickers/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=g`,
        );
        const data = await res.json();
        setGiphyResults(data.data || []);
      } catch (err) {
        console.error('[GIPHY] Trending fetch failed:', err);
      }
      setGiphyLoading(false);
      return;
    }

    setGiphyLoading(true);
    try {
      const res = await fetch(
        `https://api.giphy.com/v1/stickers/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=20&rating=g`,
      );
      const data = await res.json();
      setGiphyResults(data.data || []);
    } catch (err) {
      console.error('[GIPHY] Search failed:', err);
    }
    setGiphyLoading(false);
  }, []);

  const handleGiphySearch = useCallback(
    (value: string) => {
      setGiphyQuery(value);
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(() => searchGiphy(value), 400);
    },
    [searchGiphy],
  );

  const handleDelete = () => {
    if (selectedOverlayId) {
      removeStickerOverlay(selectedOverlayId);
      pushHistory();
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-1 p-0.5 rounded-lg bg-white/5">
        <button
          onClick={() => setActiveTab('emoji')}
          className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'emoji' ? 'bg-accent-primary/20 text-accent-primary' : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          Emoji
        </button>
        <button
          onClick={() => {
            setActiveTab('gif');
            if (giphyResults.length === 0) searchGiphy('');
          }}
          className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'gif' ? 'bg-accent-primary/20 text-accent-primary' : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          GIF Stickers
        </button>
      </div>

      {/* Emoji grid */}
      {activeTab === 'emoji' && (
        <>
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
        </>
      )}

      {/* GIPHY search */}
      {activeTab === 'gif' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              type="text"
              value={giphyQuery}
              onChange={(e) => handleGiphySearch(e.target.value)}
              placeholder="Search GIF stickers..."
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-primary"
            />
          </div>

          {giphyLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 text-text-muted animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5 max-h-[200px] overflow-y-auto scrollbar-thin">
              {giphyResults.map((gif) => (
                <button
                  key={gif.id}
                  onClick={() => handleAddGif(gif)}
                  className="rounded-lg overflow-hidden bg-white/5 hover:ring-2 hover:ring-accent-primary transition-all aspect-square"
                >
                  <img
                    src={gif.images.fixed_height_small.url}
                    alt={gif.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <p className="text-[9px] text-text-muted text-center opacity-50">Powered by GIPHY</p>
        </div>
      )}

      {/* Selected sticker controls */}
      {selected && (
        <div className="space-y-3 border-t border-white/10 pt-3">
          <p className="text-xs text-text-muted">
            Selected: {selected.imageUrl ? '🎬 GIF Sticker' : selected.emoji}
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

          {/* Rotation */}
          <div>
            <label className="text-xs text-text-muted block mb-1">
              <RotateCw className="w-3 h-3 inline mr-1" />
              Rotation: {selected.rotation ?? 0}°
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={selected.rotation ?? 0}
                onChange={(e) => updateStickerOverlay(selected.id, { rotation: parseInt(e.target.value) })}
                onMouseUp={() => pushHistory()}
                className="flex-1 accent-accent-primary"
              />
              <button
                onClick={() => { updateStickerOverlay(selected.id, { rotation: 0 }); pushHistory(); }}
                className="px-2 py-1 text-[10px] rounded bg-white/5 text-text-muted hover:bg-white/10"
              >
                Reset
              </button>
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
