'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Search, Loader2, X } from 'lucide-react';
import {
  searchGifs,
  searchStickers,
  getTrendingGifs,
  getTrendingStickers,
  type GiphyItem,
} from '@/lib/giphyService';

// ── Types ──────────────────────────────────────────────────────────

interface GifStickerPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, type: 'gif' | 'sticker') => void;
}

type TabKey = 'gifs' | 'stickers';

const LIMIT = 25;

// ── Component ──────────────────────────────────────────────────────

export function GifStickerPicker({ isOpen, onClose, onSelect }: GifStickerPickerProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('gifs');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<GiphyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch items (initial or search) ──

  const fetchItems = useCallback(async (tab: TabKey, search: string, newOffset: number) => {
    const isInitial = newOffset === 0;
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      let response;
      if (search.trim()) {
        response = tab === 'gifs'
          ? await searchGifs(search, newOffset, LIMIT)
          : await searchStickers(search, newOffset, LIMIT);
      } else {
        response = tab === 'gifs'
          ? await getTrendingGifs(newOffset, LIMIT)
          : await getTrendingStickers(newOffset, LIMIT);
      }

      const newItems = response.data;
      if (isInitial) {
        setItems(newItems);
      } else {
        setItems(prev => [...prev, ...newItems]);
      }
      setHasMore(newItems.length >= LIMIT);
      setOffset(newOffset + newItems.length);
    } catch {
      // giphyService already logs warnings
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // ── Load trending on open / tab change ──

  useEffect(() => {
    if (!isOpen) return;
    setItems([]);
    setOffset(0);
    setHasMore(true);
    fetchItems(activeTab, query, 0);
  }, [isOpen, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Debounced search ──

  useEffect(() => {
    if (!isOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setItems([]);
      setOffset(0);
      setHasMore(true);
      fetchItems(activeTab, query, 0);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Infinite scroll ──

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || loadingMore || !hasMore) return;

    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    if (nearBottom) {
      fetchItems(activeTab, query, offset);
    }
  }, [activeTab, query, offset, loadingMore, hasMore, fetchItems]);

  // ── Click outside to close ──

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    // Delay listener to avoid immediate close from the trigger click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // ── Reset state on close ──

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setItems([]);
      setOffset(0);
      setHasMore(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute bottom-full left-0 right-0 max-w-md mb-2 z-40
        bg-bg-card border border-border-primary rounded-2xl shadow-2xl overflow-hidden
        animate-in fade-in slide-in-from-bottom-2 duration-200"
      style={{ maxHeight: '400px' }}
    >
      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-bg-tertiary rounded-xl p-1 m-3 mb-0">
        {(['gifs', 'stickers'] as TabKey[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-bg-card text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {tab === 'gifs' ? 'GIFs' : 'Stickers'}
          </button>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="p-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={activeTab === 'gifs' ? 'Search GIFs...' : 'Search stickers...'}
            className="input pl-9 pr-8 py-2 text-sm w-full"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Grid ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-y-auto px-3 pb-2"
        style={{ maxHeight: '270px' }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-accent-primary animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-text-muted">No results found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => onSelect(item.images.original.url, activeTab === 'gifs' ? 'gif' : 'sticker')}
                className="relative aspect-square rounded-lg overflow-hidden bg-bg-tertiary hover:ring-2 hover:ring-accent-primary transition-all group"
              >
                <Image
                  src={item.images.fixed_height.url}
                  alt={item.title || 'GIF'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}

        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 text-accent-primary animate-spin" />
          </div>
        )}
      </div>

      {/* ── Giphy attribution ── */}
      <div className="px-3 py-2 border-t border-border-primary">
        <p className="text-[10px] text-text-muted text-center">Powered by GIPHY</p>
      </div>
    </div>
  );
}
