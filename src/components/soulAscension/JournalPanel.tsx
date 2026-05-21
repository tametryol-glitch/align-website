'use client';

/**
 * JournalPanel — scrollable list of past reflections (web).
 */

import type { JournalEntry, ChoicePath } from '@/lib/soulAscension/types';
import { BookOpen } from 'lucide-react';

const PATH_COLORS: Record<ChoicePath, string> = {
  comfort: '#F5A623',
  shadow: '#E05D5D',
  purpose: '#5EE6A8',
  neutral: '#A8B0C0',
  risk: '#4ECBD6',
};

interface Props {
  entries: JournalEntry[];
}

export default function JournalPanel({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <section className="mx-auto max-w-2xl rounded-lg border border-white/10 bg-white/[0.045] p-8 text-center">
        <BookOpen className="mx-auto mb-4 h-8 w-8 text-text-muted" />
        <h2 className="font-display text-2xl font-bold text-text-primary">No reflections yet</h2>
        <p className="mt-2 text-sm leading-6 text-text-muted">Complete a mission and write a soul reflection to see it here.</p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-gold-primary">Soul Journal</p>
        <p className="text-xs text-text-tertiary">{entries.length} reflection{entries.length !== 1 ? 's' : ''}</p>
      </div>
      {[...entries].reverse().map((entry) => (
        <div key={entry.id} className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PATH_COLORS[entry.choicePath] }} />
            <span className="text-xs font-bold text-text-tertiary">Chapter {entry.chapterNumber}</span>
            <span className="ml-auto text-xs text-text-tertiary">{new Date(entry.timestamp).toLocaleDateString()}</span>
          </div>
          <h3 className="text-sm font-bold text-text-primary">{entry.chapterTitle}</h3>
          <p className="mt-2 text-sm italic leading-6 text-text-secondary">{entry.reflection}</p>
        </div>
      ))}
    </div>
  );
}
