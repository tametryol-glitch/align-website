'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { Sparkles, X, Send, ArrowRight } from 'lucide-react';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

const STORAGE_KEY = 'align_guide_thread';

/** Shown on an empty thread — one tap instead of thinking of a question. */
const STARTERS = [
  "I don't know my birth time",
  'What can I do on my plan?',
  'Where do I change my settings?',
  'What should I try first?',
];

export function AlignGuide() {
  const router = useRouter();
  const pathname = usePathname();
  const { i18n } = useTranslation();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [streaming, setStreaming] = useState('');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pendingNav, setPendingNav] = useState<{ route: string; reason: string } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, streaming, open]);

  // Restore the thread so the guide remembers across page moves.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (Array.isArray(d.messages)) setMessages(d.messages);
        if (d.sessionId) setSessionId(d.sessionId);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!messages.length) return;
    try {
      // Cap what we persist — this is a help thread, not an archive.
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ messages: messages.slice(-20), sessionId }),
      );
    } catch {}
  }, [messages, sessionId]);

  const send = useCallback(
    async (text: string) => {
      if (busy || !text.trim()) return;
      setBusy(true);
      setError(null);
      setPendingNav(null);

      const history = messages.map(({ role, content }) => ({ role, content }));
      setMessages((m) => [...m, { role: 'user', content: text }]);

      let acc = '';
      let nav: { route: string; reason: string } | null = null;
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await api.streamGuideAgent(
          {
            message: text,
            messages: history,
            current_route: pathname || '',
            language: i18n.language || 'en',
            session_id: sessionId,
          },
          {
            onText: (d) => {
              acc += d;
              setStreaming(acc);
            },
            onNavigate: (n) => {
              nav = n;
            },
            onSession: (id) => setSessionId(id),
            onError: (m) => setError(m),
          },
          controller.signal,
        );
      } catch (e: any) {
        if (e?.name !== 'AbortError') setError(e?.message || 'Something went wrong.');
      } finally {
        if (acc.trim()) setMessages((m) => [...m, { role: 'assistant', content: acc }]);
        setStreaming('');
        setBusy(false);
        abortRef.current = null;
        // Surface navigation as a button rather than yanking the page away
        // mid-read. The user decides when to move.
        if (nav) setPendingNav(nav);
      }
    },
    [busy, messages, pathname, sessionId, i18n.language],
  );

  const go = (route: string) => {
    setPendingNav(null);
    setOpen(false);
    router.push(route);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = input.trim();
    if (!t) return;
    setInput('');
    send(t);
  };

  return (
    <>
      {/* Launcher — sits above the mobile tab bar, out of the way on desktop */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open the Align Guide"
          className="fixed z-30 bottom-20 right-4 md:bottom-6 md:right-6 flex items-center gap-2 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary px-4 py-3 shadow-lg shadow-accent-primary/20 hover:scale-105 transition-transform"
        >
          <Sparkles className="w-5 h-5 text-white" />
          <span className="hidden sm:inline text-sm font-medium text-white">Ask</span>
        </button>
      )}

      {open && (
        <div className="fixed z-[60] inset-x-0 bottom-0 md:inset-auto md:bottom-6 md:right-6 md:w-[24rem]">
          <div className="mx-2 mb-2 md:mx-0 md:mb-0 rounded-2xl bg-bg-card border border-border-primary shadow-2xl overflow-hidden flex flex-col max-h-[75vh] md:max-h-[32rem]">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border-primary">
              <Sparkles className="w-4 h-4 text-accent-primary" />
              <span className="text-sm font-medium text-text-primary flex-1">Align Guide</span>
              {messages.length > 0 && (
                <button
                  onClick={() => {
                    abortRef.current?.abort();
                    setMessages([]);
                    setStreaming('');
                    setSessionId(null);
                    setPendingNav(null);
                    setError(null);
                    try {
                      localStorage.removeItem(STORAGE_KEY);
                    } catch {}
                  }}
                  className="text-xs text-text-muted hover:text-text-primary"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thread */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[12rem]">
              {messages.length === 0 && !streaming && (
                <div className="space-y-3">
                  <p className="text-sm text-text-tertiary">
                    Ask me anything about Align — where something lives, what it does, or
                    what&apos;s on your plan.
                  </p>
                  <div className="flex flex-col gap-2">
                    {STARTERS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-left text-xs rounded-lg bg-white/5 px-3 py-2 text-text-secondary hover:bg-white/10 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <div
                    className={
                      m.role === 'user'
                        ? 'max-w-[85%] rounded-2xl rounded-br-sm bg-accent-primary/20 px-3 py-2'
                        : 'max-w-[85%] rounded-2xl rounded-bl-sm bg-white/5 px-3 py-2'
                    }
                  >
                    <p className="text-sm text-text-primary whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ))}

              {streaming && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white/5 px-3 py-2">
                    <p className="text-sm text-text-primary whitespace-pre-wrap">{streaming}</p>
                  </div>
                </div>
              )}

              {busy && !streaming && (
                <div className="flex items-center gap-2">
                  <span className="text-accent-primary animate-spin text-sm">{'✦'}</span>
                  <span className="text-xs text-text-tertiary">Thinking…</span>
                </div>
              )}

              {pendingNav && (
                <button
                  onClick={() => go(pendingNav.route)}
                  className="w-full flex items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 px-3 py-2.5 hover:from-accent-primary/30 hover:to-accent-secondary/30 transition-colors"
                >
                  <span className="text-sm text-text-primary text-left">
                    {pendingNav.reason || `Go to ${pendingNav.route}`}
                  </span>
                  <ArrowRight className="w-4 h-4 text-accent-primary shrink-0" />
                </button>
              )}

              {error && (
                <div className="rounded-lg bg-red-500/10 px-3 py-2">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}
            </div>

            {/* Composer */}
            <form onSubmit={onSubmit} className="flex items-center gap-2 px-3 py-3 border-t border-border-primary">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={busy ? 'Please wait…' : 'Ask about Align…'}
                disabled={busy}
                className="flex-1 rounded-full bg-white/5 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-1 focus:ring-accent-primary/50 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send"
                className="rounded-full bg-accent-primary/20 p-2 text-accent-primary disabled:opacity-40 hover:bg-accent-primary/30 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
