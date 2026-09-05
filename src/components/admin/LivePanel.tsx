'use client';

// ═══════════════════════════════════════════════════════════════════
// Admin live panel — every stream currently broadcasting, and the
// controls to stop one.
//
// "End" stops the broadcast and flags it for review. "Remove" also
// hides it from every listing and blocks re-entry, for content that
// should not stand. Remove is destructive and irreversible from this
// screen, so it asks first.
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Radio, Users, Clock, Loader2, RefreshCw } from 'lucide-react';

interface AdminLiveSession {
  id: string;
  host_id: string;
  title: string;
  status: string;
  visibility: string;
  started_at: string | null;
  peak_viewers: number;
  total_viewers: number;
  viewer_minutes: number;
  moderation_status: string;
  profiles?: { display_name: string | null; username: string | null } | null;
}

export function LivePanel() {
  const [sessions, setSessions] = useState<AdminLiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch('/api/admin/live');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load');
      setSessions(json.sessions || []);
    } catch (err: any) {
      setError(err?.message || 'Could not load live streams.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Streams start and end constantly; a stale list here is worse than
    // a slightly chatty poll.
    const id = setInterval(load, 20_000);
    return () => clearInterval(id);
  }, [load]);

  const act = useCallback(
    async (sessionId: string, action: 'end' | 'remove') => {
      if (action === 'remove') {
        const ok = window.confirm(
          'Remove this stream? It stops immediately, disappears from every listing, and cannot be rejoined.',
        );
        if (!ok) return;
      }
      setBusyId(sessionId);
      setError(null);
      try {
        const res = await fetch('/api/admin/live', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, action }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed');
        await load();
      } catch (err: any) {
        setError(err?.message || 'Could not stop the stream.');
      } finally {
        setBusyId(null);
      }
    },
    [load],
  );

  const runningFor = (startedAt: string | null) => {
    if (!startedAt) return '—';
    const secs = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-text-muted py-8">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading live streams…
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-red-500" />
          <h2 className="text-lg font-semibold text-text-primary">
            Live now
            <span className="ml-2 text-sm font-normal text-text-muted tabular-nums">
              {sessions.length}
            </span>
          </h2>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2">{error}</div>
      )}

      {sessions.length === 0 ? (
        <p className="text-text-muted text-sm py-6">Nobody is broadcasting right now.</p>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-4 bg-bg-card border border-border-primary rounded-xl px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                  <p className="font-medium text-text-primary truncate">{s.title || 'Untitled'}</p>
                  {s.visibility !== 'public' && (
                    <span className="text-[10px] uppercase tracking-wide text-text-muted border border-border-primary rounded px-1.5 py-0.5">
                      {s.visibility}
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-0.5 truncate">
                  {s.profiles?.display_name || s.profiles?.username || s.host_id.slice(0, 8)}
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-4 text-xs text-text-muted shrink-0">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="tabular-nums">{runningFor(s.started_at)}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span className="tabular-nums">{s.peak_viewers}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/live/${s.id}`}
                  className="text-sm px-3 py-1.5 rounded-lg bg-bg-secondary hover:bg-bg-tertiary text-text-primary"
                >
                  Watch
                </Link>
                <button
                  onClick={() => act(s.id, 'end')}
                  disabled={busyId === s.id}
                  className="text-sm px-3 py-1.5 rounded-lg bg-bg-secondary hover:bg-bg-tertiary text-text-primary disabled:opacity-50"
                >
                  {busyId === s.id ? '…' : 'End'}
                </button>
                <button
                  onClick={() => act(s.id, 'remove')}
                  disabled={busyId === s.id}
                  className="text-sm px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
