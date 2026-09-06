'use client';

// ═══════════════════════════════════════════════════════════════════
// Live chat composer.
//
// The feed's MentionInput binds the raw @[Name](uuid) markup straight to
// the field, so picking someone shows a wall of UUID mid-sentence. That
// is survivable in a post editor you stare at; in fast chat it is
// alarming. This keeps the visible text as plain "@Name" and converts to
// markup only on send.
//
// Names are mapped to ids rather than character ranges tracked through
// every edit. Ranges have to be rewritten on every keystroke and drift
// the moment someone edits mid-string; a name→id map degrades honestly
// instead — delete the "@Name" text and the mention simply stops
// existing, which is what the user just expressed by deleting it.
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import {
  getMentionQuery,
  searchMentionUsers,
  mentionMarkup,
  type MentionUser,
} from '@/lib/mentions';

export interface LiveComposerHandle {
  /** Seed "@Name " for a reply, and remember who it points at. */
  addMention: (user: MentionUser) => void;
}

export function LiveComposer({
  value,
  onChange,
  onSubmit,
  placeholder = 'Say something, or @ someone…',
  excludeUserId,
  maxLength = 500,
  registerRef,
}: {
  value: string;
  onChange: (next: string) => void;
  /** Receives the text with mention markup applied. */
  onSubmit: (markup: string) => void;
  placeholder?: string;
  excludeUserId?: string | null;
  maxLength?: number;
  registerRef?: (handle: LiveComposerHandle | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const caretRef = useRef(0);
  // Display name → user id, for everyone tagged in the message so far.
  const mentionsRef = useRef<Map<string, string>>(new Map());

  const [query, setQuery] = useState<{ query: string; start: number } | null>(null);
  const [results, setResults] = useState<MentionUser[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      const users = await searchMentionUsers(query.query, excludeUserId ?? undefined);
      if (!cancelled) {
        setResults(users);
        setActive(0);
      }
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, excludeUserId]);

  const insertMention = useCallback(
    (user: MentionUser, start?: number, caret?: number) => {
      const name = user.displayName.replace(/[\][()]/g, '').trim() || 'User';
      mentionsRef.current.set(name.toLowerCase(), user.id);

      const from = start ?? value.length;
      const to = caret ?? value.length;
      const next = `${value.slice(0, from)}@${name} ${value.slice(to)}`;
      onChange(next);
      setQuery(null);
      setResults([]);

      const pos = from + name.length + 2;
      requestAnimationFrame(() => {
        const el = inputRef.current;
        if (!el) return;
        el.focus();
        el.setSelectionRange(pos, pos);
      });
    },
    [value, onChange],
  );

  useEffect(() => {
    registerRef?.({
      addMention: (user) => {
        const name = user.displayName.replace(/[\][()]/g, '').trim() || 'User';
        mentionsRef.current.set(name.toLowerCase(), user.id);
        onChange(value ? value : `@${name} `);
      },
    });
    return () => registerRef?.(null);
  }, [registerRef, onChange, value]);

  /** Turn "@Name" back into markup for everyone still tagged. */
  const toMarkup = useCallback((text: string): string => {
    let out = text;
    for (const [lower, id] of Array.from(mentionsRef.current.entries())) {
      // Rebuild the display name from the text so its original casing
      // survives; the map key is lowercased only for lookup.
      const re = new RegExp(`@(${lower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');
      out = out.replace(re, (_m, matched) => mentionMarkup({ id, displayName: matched }));
    }
    return out;
  }, []);

  const submit = useCallback(() => {
    const text = value.trim();
    if (!text) return;
    onSubmit(toMarkup(text));
    mentionsRef.current.clear();
  }, [value, onSubmit, toMarkup]);

  function sync(next: string, caret: number) {
    caretRef.current = caret;
    setQuery(getMentionQuery(next, caret));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    const menuOpen = !!query && results.length > 0;
    if (menuOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((i) => (i + 1) % results.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((i) => (i - 1 + results.length) % results.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(results[active], query!.start, caretRef.current);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setQuery(null);
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="relative flex-1">
      {query && results.length > 0 && (
        <div className="absolute bottom-full mb-2 left-0 right-0 max-h-52 overflow-y-auto
                        bg-neutral-900 border border-white/15 rounded-lg z-20 py-1">
          {results.map((u, i) => (
            <button
              key={u.id}
              // onMouseDown, not onClick: the input's blur would close
              // the menu before a click ever lands.
              onMouseDown={(e) => {
                e.preventDefault();
                insertMention(u, query.start, caretRef.current);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm ${
                i === active ? 'bg-white/10 text-white' : 'text-white/75 hover:bg-white/5'
              }`}
            >
              {u.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={u.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center text-[10px]">
                  {u.displayName.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="truncate">{u.displayName}</span>
              {u.username && (
                <span className="text-white/35 text-xs truncate">@{u.username}</span>
              )}
            </button>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          sync(e.target.value, e.target.selectionStart ?? e.target.value.length);
        }}
        onKeyUp={(e: any) => sync(e.target.value, e.target.selectionStart ?? 0)}
        onClick={(e: any) => sync(e.target.value, e.target.selectionStart ?? 0)}
        onBlur={() => setTimeout(() => setQuery(null), 150)}
        onKeyDown={handleKeyDown}
        maxLength={maxLength}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm
                   text-white placeholder-white/30 focus:outline-none focus:border-white/25"
      />
    </div>
  );
}
