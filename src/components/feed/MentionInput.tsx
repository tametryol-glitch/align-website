'use client';

/**
 * MentionInput — text field with an inline "@" people picker.
 *
 * Typing "@" followed by a name searches every Align user and inserting a
 * result writes mention markup (see src/lib/mentions.tsx) into the value.
 * Used by the post composer and the comment box.
 */

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import {
  applyMention, getMentionQuery, searchMentionUsers, stripMentionMarkup,
  type MentionUser,
} from '@/lib/mentions';

export function MentionInput({
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 4,
  maxLength,
  className,
  wrapperClassName,
  style,
  disabled,
  autoFocus,
  excludeUserId,
  menuPlacement = 'below',
  onEnterSubmit,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
  /** Sizing for the positioned wrapper (e.g. "flex-1" inside a flex row). */
  wrapperClassName?: string;
  style?: CSSProperties;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Usually the current user — you can't tag yourself. */
  excludeUserId?: string;
  menuPlacement?: 'above' | 'below';
  /** Enter (without Shift) submits — skipped while the picker is open. */
  onEnterSubmit?: () => void;
}) {
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [query, setQuery] = useState<{ query: string; start: number } | null>(null);
  const [results, setResults] = useState<MentionUser[]>([]);
  const [active, setActive] = useState(0);
  // Caret at the moment the query was captured — where the markup goes.
  const caretRef = useRef(0);

  // Debounced people search for the active "@query"
  useEffect(() => {
    if (!query) { setResults([]); return; }
    let cancelled = false;
    const timer = setTimeout(async () => {
      const users = await searchMentionUsers(query.query, excludeUserId);
      if (!cancelled) { setResults(users); setActive(0); }
    }, 180);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query, excludeUserId]);

  function syncQuery(next: string, caret: number) {
    caretRef.current = caret;
    setQuery(getMentionQuery(next, caret));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const next = e.target.value;
    onChange(next);
    syncQuery(next, e.target.selectionStart ?? next.length);
  }

  function pick(user: MentionUser) {
    if (!query) return;
    const { text, caret } = applyMention(value, query.start, caretRef.current, user);
    onChange(text);
    setQuery(null);
    setResults([]);
    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const menuOpen = !!query && results.length > 0;
    if (menuOpen) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (i + 1) % results.length); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => (i - 1 + results.length) % results.length); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); pick(results[active]); return; }
      if (e.key === 'Escape') { e.preventDefault(); setQuery(null); return; }
    }
    if (e.key === 'Enter' && !e.shiftKey && onEnterSubmit) {
      e.preventDefault();
      onEnterSubmit();
    }
  }

  const shared = {
    ref: ref as any,
    value,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    onKeyUp: (e: any) => syncQuery(e.target.value, e.target.selectionStart ?? 0),
    onClick: (e: any) => syncQuery(e.target.value, e.target.selectionStart ?? 0),
    onBlur: () => setTimeout(() => setQuery(null), 150),
    placeholder,
    maxLength,
    disabled,
    autoFocus,
    className,
    style,
  };

  return (
    <div className={cn('relative', wrapperClassName || 'w-full')}>
      {multiline ? <textarea {...shared} rows={rows} /> : <input {...shared} />}

      {query && results.length > 0 && (
        <div
          className={cn(
            'absolute left-0 right-0 z-[70] max-h-56 overflow-y-auto rounded-xl border border-border-primary bg-bg-secondary shadow-xl',
            menuPlacement === 'above' ? 'bottom-full mb-2' : 'top-full mt-2'
          )}
        >
          {results.map((u, i) => (
            <button
              key={u.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(u)}
              onMouseEnter={() => setActive(i)}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-left transition-colors',
                i === active ? 'bg-accent-primary/15' : 'hover:bg-accent-muted'
              )}
            >
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-muted">
                {u.avatarUrl ? (
                  <img src={u.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[10px] font-bold text-accent-primary">
                    {u.displayName[0]?.toUpperCase()}
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-text-primary">{u.displayName}</span>
                {u.username && (
                  <span className="block truncate text-xs text-text-muted">@{u.username}</span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Plain-text length of a body (mention markup counts as "@Name"). */
export function visibleLength(text: string): number {
  return stripMentionMarkup(text).length;
}
