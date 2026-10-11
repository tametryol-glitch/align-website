'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EMOJI_CATEGORIES, SKIN_TONES, applyTone } from '@/data/emojiData';

const RECENT_KEY = 'align_recent_emojis';
const TONE_KEY = 'align_emoji_skin_tone';
const RECENT_MAX = 24;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeValue(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* private mode: not remembered */ }
}

interface Props {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ onSelect, onClose }: Props) {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState('smileys');
  const [tone, setTone] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setTone(Math.min(5, Math.max(0, Number(readJson<number>(TONE_KEY, 0)) || 0)));
    setRecent(readJson<string[]>(RECENT_KEY, []));
  }, []);

  // Close on click outside / Escape.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  function pick(emoji: string) {
    onSelect(emoji);
    const next = [emoji, ...recent.filter((x) => x !== emoji)].slice(0, RECENT_MAX);
    setRecent(next);
    writeValue(RECENT_KEY, JSON.stringify(next));
  }

  function chooseTone(id: number) {
    setTone(id);
    writeValue(TONE_KEY, String(id));
  }

  const list = category === 'recent'
    ? recent
    : (EMOJI_CATEGORIES.find((c) => c.id === category)?.emojis ?? []).map((e) => applyTone(e, tone));

  return (
    <div
      ref={rootRef}
      className="absolute bottom-2 left-3 z-30 w-[22rem] max-w-[calc(100%-1.5rem)] rounded-2xl border border-border-primary bg-bg-card shadow-xl"
    >
      {/* Categories */}
      <div className="flex gap-1 p-2 border-b border-border-primary overflow-x-auto">
        {recent.length > 0 && (
          <button
            type="button"
            onClick={() => setCategory('recent')}
            className={`shrink-0 w-9 h-8 rounded-lg text-lg ${category === 'recent' ? 'bg-accent-primary/20' : 'hover:bg-bg-tertiary'}`}
            title={t('messages.emoji.recent', 'Recent')}
          >
            🕒
          </button>
        )}
        {EMOJI_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={`shrink-0 w-9 h-8 rounded-lg text-lg ${category === c.id ? 'bg-accent-primary/20' : 'hover:bg-bg-tertiary'}`}
            title={c.label}
          >
            {c.icon}
          </button>
        ))}
      </div>

      {/* Skin tone: applies to hand and people emoji */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border-primary">
        <span className="text-[11px] text-text-muted mr-1">{t('messages.emoji.skinTone', 'Skin tone')}</span>
        {SKIN_TONES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => chooseTone(s.id)}
            title={`${s.label} skin tone`}
            aria-label={`${s.label} skin tone`}
            className={`w-5 h-5 rounded-full border-2 transition-transform ${tone === s.id ? 'border-accent-primary scale-110' : 'border-transparent'}`}
            style={{ backgroundColor: s.swatch }}
          />
        ))}
      </div>

      {/* Emoji grid */}
      <div className="h-56 overflow-y-auto p-2 grid grid-cols-8 gap-0.5">
        {list.map((e, i) => (
          <button
            key={`${e}-${i}`}
            type="button"
            onClick={() => pick(e)}
            className="h-9 rounded-md text-2xl leading-none hover:bg-bg-tertiary"
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}
