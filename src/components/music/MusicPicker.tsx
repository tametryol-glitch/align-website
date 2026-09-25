'use client';

// Song picker for photo posts and stories. Lists the music library (songs
// only, not sound bites), with search, genre chips and a Trending row built
// from what people used this week. Tap a row to preview; "Use" attaches it,
// with an optional start point so people can pick the best part of the song.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Search, Play, Pause, Music2, Flame, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAudioLibrary, trackUrl, type MusicTrack } from '@/lib/musicLibrary';
import { attachTrack, fetchTrendingTrackIds, type AttachedMusic } from '@/lib/postMusic';

function fmtTime(s: number): string {
  const t = Math.max(0, Math.floor(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}

export function MusicPicker({
  value,
  onChange,
  onClose,
}: {
  value: AttachedMusic | null;
  onChange: (m: AttachedMusic | null) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { music, loading } = useAudioLibrary();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('');
  const [trendingIds, setTrendingIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(value?.trackId || null);
  const [startSec, setStartSec] = useState<number>(value?.startSec || 0);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { fetchTrendingTrackIds(20).then(setTrendingIds); }, []);

  // Stop the preview when the picker closes.
  useEffect(() => () => { audioRef.current?.pause(); audioRef.current = null; }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const categories = useMemo(
    () => Array.from(new Set(music.map((m) => m.category).filter(Boolean))).sort(),
    [music],
  );

  const trending = useMemo(
    () => trendingIds.map((id) => music.find((m) => m.id === id)).filter((m): m is MusicTrack => !!m),
    [trendingIds, music],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return music.filter((m) =>
      (!category || m.category === category) &&
      (!q || m.name.toLowerCase().includes(q) || m.mood.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)),
    );
  }, [music, query, category]);

  const selected = music.find((m) => m.id === selectedId) || null;
  const maxStart = selected ? Math.max(0, (selected.durationSeconds || 0) - 10) : 0;

  function preview(track: MusicTrack, from = 0) {
    const a = audioRef.current || new Audio();
    audioRef.current = a;
    if (previewId === track.id && !a.paused && from === 0) {
      a.pause();
      setPreviewId(null);
      return;
    }
    const url = trackUrl(track);
    if (!a.src.endsWith(track.storagePath)) a.src = url;
    a.currentTime = from;
    a.loop = true;
    a.play().catch(() => {});
    setPreviewId(track.id);
  }

  function choose(track: MusicTrack) {
    if (selectedId !== track.id) setStartSec(0);
    setSelectedId(track.id);
    preview(track, selectedId === track.id ? startSec : 0);
  }

  function confirm() {
    if (!selected) return;
    onChange(attachTrack(selected, startSec));
    onClose();
  }

  const row = (m: MusicTrack, rank?: number) => (
    <li key={`${rank ?? 'a'}-${m.id}`}>
      <button
        type="button"
        onClick={() => choose(m)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors',
          selectedId === m.id ? 'bg-accent-primary/15 ring-1 ring-accent-primary' : 'hover:bg-bg-tertiary',
        )}
      >
        <span className="w-9 h-9 rounded-lg bg-gradient-accent flex items-center justify-center text-white shrink-0">
          {previewId === m.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-text-primary truncate">
            {rank != null && <span className="text-orange-400 mr-1">#{rank}</span>}
            {m.name}
          </span>
          <span className="block text-[11px] text-text-muted truncate">
            {[m.category, m.mood].filter(Boolean).join(' · ')}
            {m.durationSeconds ? ` · ${fmtTime(m.durationSeconds)}` : ''}
          </span>
        </span>
        {selectedId === m.id && <Check className="w-4 h-4 text-accent-primary shrink-0" />}
      </button>
    </li>
  );

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="w-full sm:max-w-md max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-2xl border border-border-primary bg-bg-secondary"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary">
          <h3 className="flex items-center gap-2 text-base font-semibold text-text-primary">
            <Music2 className="w-4 h-4 text-accent-primary" /> {t('music.picker.title', 'Add music')}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-text-muted hover:text-text-primary" aria-label={t('common.close', 'Close')}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 pt-3 space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('music.picker.search', 'Search songs')}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-bg-tertiary border border-border-primary text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary"
            />
          </div>
          {categories.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {['', ...categories].map((c) => (
                <button
                  key={c || 'all'}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap border',
                    category === c ? 'border-accent-primary bg-accent-primary/15 text-text-primary' : 'border-border-primary text-text-muted hover:text-text-primary',
                  )}
                >
                  {c || t('music.picker.all', 'All')}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {!query && !category && trending.length > 0 && (
            <>
              <p className="flex items-center gap-1 px-2 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-orange-400">
                <Flame className="w-3.5 h-3.5" /> {t('music.picker.trending', 'Trending this week')}
              </p>
              <ul className="space-y-0.5 mb-2">{trending.slice(0, 5).map((m, i) => row(m, i + 1))}</ul>
              <p className="px-2 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                {t('music.picker.library', 'All songs')}
              </p>
            </>
          )}
          {loading && music.length === 0 ? (
            <p className="text-center text-sm text-text-muted py-8">{t('common.loading', 'Loading…')}</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-text-muted py-8">{t('music.picker.empty', 'No songs found')}</p>
          ) : (
            <ul className="space-y-0.5">{filtered.map((m) => row(m))}</ul>
          )}
        </div>

        <div className="border-t border-border-primary px-4 py-3 space-y-2">
          {selected && maxStart > 0 && (
            <label className="block">
              <span className="flex justify-between text-[11px] text-text-muted mb-1">
                <span>{t('music.picker.startAt', 'Start from')}</span>
                <span>{fmtTime(startSec)}</span>
              </span>
              <input
                type="range"
                min={0}
                max={maxStart}
                step={1}
                value={startSec}
                onChange={(e) => setStartSec(Number(e.target.value))}
                onMouseUp={() => preview(selected, startSec)}
                onTouchEnd={() => preview(selected, startSec)}
                className="w-full accent-accent-primary"
              />
            </label>
          )}
          <div className="flex gap-2">
            {value && (
              <button
                type="button"
                onClick={() => { onChange(null); onClose(); }}
                className="flex-1 py-2 rounded-xl border border-border-primary text-sm text-text-secondary hover:text-text-primary"
              >
                {t('music.picker.remove', 'No music')}
              </button>
            )}
            <button
              type="button"
              onClick={confirm}
              disabled={!selected}
              className="flex-1 py-2 rounded-xl bg-gradient-accent text-white text-sm font-semibold disabled:opacity-50"
            >
              {t('music.picker.use', 'Use this song')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
