'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Send, Sparkles, RotateCcw } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  /** The opening kickoff is sent to the model but not shown to the user. */
  hidden?: boolean;
}

interface ToolActivity {
  name: string;
  status: 'running' | 'done';
  summary?: string;
  total_remaining?: number | null;
}

const STORAGE_KEY = 'rectification_agent_session';

/** Friendly labels for the tool-activity chip. */
const TOOL_LABELS: Record<string, string> = {
  search_birth_city: 'Looking up your birth city',
  set_birth_details: 'Locking in your birth details',
  record_answer: 'Narrowing possible birth times',
  record_life_event: 'Recording that event',
  finalize_birth_time: 'Running the full analysis',
};

export function RectificationAgentChat() {
  const { i18n } = useTranslation();
  const profile = useAuthStore((s) => s.profile);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState('');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [activity, setActivity] = useState<ToolActivity | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [state, setState] = useState<any>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const startedRef = useRef(false);

  // Keep the transcript pinned to the newest content.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, streaming, activity]);

  // Restore an in-progress conversation.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (Array.isArray(data.messages) && data.messages.length) {
          setMessages(data.messages);
          setState(data.state || {});
          setSessionId(data.sessionId || null);
          setResult(data.result || null);
          startedRef.current = true;
        }
      }
    } catch {}
  }, []);

  // Persist after every settled turn.
  useEffect(() => {
    if (!messages.length) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ messages, state, sessionId, result }),
      );
    } catch {}
  }, [messages, state, sessionId, result]);

  /**
   * Seed the agent with the birth data we already hold, so it never has to
   * look up a city. The profile is guaranteed present — the page gates on it.
   */
  const seededState = useCallback(() => {
    if (state?.birth_data?.date) return state;
    if (!profile?.birth_date || profile?.latitude == null) return state;
    return {
      ...state,
      birth_data: {
        date: profile.birth_date,
        location: profile.birth_location || '',
        lat: profile.latitude,
        lon: profile.longitude,
        timezone: profile.timezone || 'UTC',
        tz_offset: null,
      },
    };
  }, [state, profile]);

  const send = useCallback(
    async (text: string, isAuto = false) => {
      if (busy) return;
      setBusy(true);
      setError(null);
      setActivity(null);

      // Send the full history including the hidden kickoff — the API requires
      // the first turn to be `user`, and dropping it would break turn two.
      const history = messages.map(({ role, content }) => ({ role, content }));
      setMessages((m) => [...m, { role: 'user', content: text, hidden: isAuto }]);

      let acc = '';
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await api.streamRectificationAgent(
          {
            message: text,
            messages: history,
            state: seededState(),
            session_id: sessionId,
            language: i18n.language || 'en',
          },
          {
            onText: (delta) => {
              acc += delta;
              setStreaming(acc);
            },
            onTool: (tool) => {
              setActivity(tool);
              if (tool.status === 'done' && typeof tool.total_remaining === 'number') {
                setRemaining(tool.total_remaining);
              }
            },
            onResult: (r) => setResult(r),
            onState: (s) => setState(s),
            onSession: (id) => setSessionId(id),
            onError: (m) => setError(m),
          },
          controller.signal,
        );
      } catch (e: any) {
        if (e?.name !== 'AbortError') setError(e?.message || 'Something went wrong.');
      } finally {
        if (acc.trim()) {
          setMessages((m) => [...m, { role: 'assistant', content: acc }]);
        }
        setStreaming('');
        setActivity(null);
        setBusy(false);
        abortRef.current = null;
      }
    },
    [busy, messages, sessionId, seededState, i18n.language],
  );

  // Kick off the conversation once.
  useEffect(() => {
    if (startedRef.current || !profile) return;
    startedRef.current = true;
    send("I don't know my birth time — can you help me work it out?", true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const reset = () => {
    abortRef.current?.abort();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setMessages([]);
    setStreaming('');
    setState({});
    setSessionId(null);
    setResult(null);
    setRemaining(null);
    setError(null);
    setActivity(null);
    startedRef.current = false;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    send(text);
  };

  const answered = Object.keys(state?.answers || {}).length;

  return (
    <div className="flex flex-col h-[calc(100vh-13rem)] min-h-[28rem]">
      {/* Progress strip */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        {remaining !== null && (
          <div className="inline-block bg-accent-primary/15 rounded-full px-3 py-1">
            <span className="text-xs font-medium text-accent-primary">
              {remaining} candidate time{remaining !== 1 ? 's' : ''} remaining
            </span>
          </div>
        )}
        {answered > 0 && (
          <div className="inline-block bg-accent-secondary/10 rounded-full px-3 py-1">
            <span className="text-xs text-accent-secondary">{answered} answered</span>
          </div>
        )}
        {messages.length > 0 && (
          <button
            onClick={reset}
            className="ml-auto inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary"
          >
            <RotateCcw className="w-3 h-3" />
            Start over
          </button>
        )}
      </div>

      {/* Transcript */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.filter((m) => !m.hidden).map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={
                m.role === 'user'
                  ? 'max-w-[85%] rounded-2xl rounded-br-sm bg-accent-primary/20 px-4 py-2.5'
                  : 'max-w-[85%] rounded-2xl rounded-bl-sm bg-white/5 px-4 py-2.5'
              }
            >
              <p className="text-sm text-text-primary whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}

        {streaming && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white/5 px-4 py-2.5">
              <p className="text-sm text-text-primary whitespace-pre-wrap">{streaming}</p>
            </div>
          </div>
        )}

        {activity && (
          <div className="flex items-center gap-2 px-1 animate-fadeIn">
            <span className="text-accent-primary animate-spin text-sm">{'✦'}</span>
            <span className="text-xs text-text-tertiary">
              {TOOL_LABELS[activity.name] || activity.name}
              {activity.status === 'done' && activity.summary ? ` — ${activity.summary}` : '…'}
            </span>
          </div>
        )}

        {busy && !streaming && !activity && (
          <div className="flex items-center gap-2 px-1">
            <span className="text-accent-primary animate-spin text-sm">{'✦'}</span>
            <span className="text-xs text-text-tertiary">Thinking…</span>
          </div>
        )}

        {result && (
          <div className="rounded-xl bg-gradient-to-r from-accent-primary/15 to-accent-secondary/15 p-4 animate-fadeIn">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-accent-primary" />
              <span className="text-sm font-medium text-accent-primary">Rectified birth time</span>
            </div>
            <p className="text-2xl font-display font-bold text-text-primary">
              {result?.final_result?.best_rectified_time || '—'}
            </p>
            {result?.final_result?.best_rectified_rising_sign && (
              <p className="text-sm text-text-tertiary mt-1">
                {result.final_result.best_rectified_rising_sign} rising
                {typeof result.final_result.best_rectified_rising_degree === 'number'
                  ? ` at ${result.final_result.best_rectified_rising_degree.toFixed(1)}°`
                  : ''}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-500/10 px-3 py-2">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* Composer */}
      <form onSubmit={onSubmit} className="mt-3 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={busy ? 'Please wait…' : 'Type your answer…'}
          disabled={busy}
          className="flex-1 rounded-full bg-white/5 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-1 focus:ring-accent-primary/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-full bg-accent-primary/20 p-2.5 text-accent-primary disabled:opacity-40 hover:bg-accent-primary/30 transition-colors"
          aria-label="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
