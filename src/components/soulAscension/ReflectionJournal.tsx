'use client';

/**
 * ReflectionJournal — post-choice text input for soul reflections (web).
 *
 * Appears on the resolution screen. The player can optionally write
 * a short reflection about their choice before continuing.
 */

import { useState } from 'react';

interface Props {
  onSave: (text: string) => void;
  existingReflection?: string;
}

export default function ReflectionJournal({ onSave, existingReflection }: Props) {
  const [text, setText] = useState(existingReflection ?? '');
  const [saved, setSaved] = useState(!!existingReflection);

  const handleSave = () => {
    if (!text.trim()) return;
    onSave(text.trim());
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="mt-3 rounded-md border border-emerald-400/20 bg-emerald-400/[0.06] p-3.5">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-400">Soul Reflection Saved</p>
        <p className="mt-1.5 text-sm italic leading-6 text-text-secondary">{text}</p>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-md border border-gold-primary/20 bg-white/[0.04] p-3.5">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gold-primary">Soul Reflection</p>
      <p className="mt-1 text-xs text-text-muted">What does this choice reveal about your soul?</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a reflection..."
        maxLength={500}
        rows={3}
        className="mt-2.5 w-full resize-none rounded border border-white/10 bg-black/30 px-3 py-2 text-sm leading-6 text-text-primary placeholder:text-white/25 focus:border-gold-primary/40 focus:outline-none"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-text-tertiary">{text.length}/500</span>
        <button
          type="button"
          disabled={!text.trim()}
          onClick={handleSave}
          className="rounded border border-emerald-400/40 bg-emerald-400/15 px-4 py-1.5 text-xs font-bold text-emerald-400 transition hover:bg-emerald-400/25 disabled:opacity-40"
        >
          Save Reflection
        </button>
      </div>
    </div>
  );
}
