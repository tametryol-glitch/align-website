'use client';

// ═══════════════════════════════════════════════════════════════════
// Admin calls panel — who is using voice/video, for how long, and what
// it costs. Plus the levers: kill a call in progress, cap or block an
// account, change the tier limits.
//
// Two units appear here and they are not the same number:
//   • leg-minutes      — what one person consumed, what their quota spends
//   • participant-min. — both sides of a connected call, what Agora bills
// The cost estimate uses participant-minutes; the per-user table uses
// leg-minutes.
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from 'react';
import {
  Phone, PhoneOff, Clock, Loader2, RefreshCw, DollarSign,
  Ban, ShieldAlert, Video, Save,
} from 'lucide-react';

interface UserRow {
  user_id: string;
  username: string | null;
  display_name: string | null;
  email: string | null;
  subscription_tier: string | null;
  minutes: number;
  video_minutes: number;
  calls: number;
  connected: number;
  longest: number;
  last_at: string | null;
  blocked: boolean;
  override_monthly_minutes: number | null;
  override_max_call_seconds: number | null;
  note: string | null;
}

interface ActiveRow {
  id: string;
  caller_id: string | null;
  receiver_id: string | null;
  call_type: string;
  status: string;
  started_at: string;
  connected_at: string | null;
  duration_seconds: number;
  platform: string | null;
}

interface LimitRow {
  tier: string;
  monthly_minutes: number;
  max_call_seconds: number;
  enabled: boolean;
}

interface Payload {
  range_days: number;
  totals: {
    calls: number;
    connected_calls: number;
    leg_minutes: number;
    participant_minutes: number;
    est_cost_usd: number;
    unauthenticated_calls: number;
    unique_users: number;
  };
  users: UserRow[];
  active: ActiveRow[];
  daily: { day: string; calls: number; minutes: number; cost: number }[];
  limits: LimitRow[];
}

function hms(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0
    ? `${h}h ${m}m`
    : m > 0
      ? `${m}m ${s}s`
      : `${s}s`;
}

function name(u: UserRow): string {
  return u.display_name || u.username || u.email || u.user_id.slice(0, 8);
}

export function CallsPanel() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<UserRow | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/calls?days=${days}`);
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load');
      setData(await res.json());
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load call usage');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { load(); }, [load]);

  // Calls in progress go stale fast — a 30s refresh keeps the kill
  // button honest without hammering the endpoint.
  useEffect(() => {
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [load]);

  async function act(body: Record<string, unknown>, key: string) {
    setBusy(key);
    setError(null);
    try {
      const res = await fetch('/api/admin/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Action failed');
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Action failed');
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-text-muted">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading call usage…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + range */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => { setLoading(true); setDays(d); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                days === d
                  ? 'bg-accent-primary/15 text-accent-primary border border-accent-primary/30'
                  : 'bg-bg-card border border-border-primary text-text-muted hover:text-text-primary'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-bg-card border border-border-primary text-text-secondary hover:text-text-primary"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          icon={<DollarSign className="w-4 h-4" />}
          label={`Est. Agora cost (${days}d)`}
          value={`$${data?.totals.est_cost_usd.toFixed(2) ?? '0.00'}`}
          hint={`${data?.totals.participant_minutes ?? 0} participant-min`}
        />
        <Stat
          icon={<Clock className="w-4 h-4" />}
          label="Talk time"
          value={`${data?.totals.leg_minutes ?? 0} min`}
          hint={`${data?.totals.connected_calls ?? 0} connected calls`}
        />
        <Stat
          icon={<Phone className="w-4 h-4" />}
          label="Callers"
          value={String(data?.totals.unique_users ?? 0)}
          hint={`${data?.totals.calls ?? 0} attempts`}
        />
        <Stat
          icon={<ShieldAlert className="w-4 h-4" />}
          label="Unauthenticated"
          value={String(data?.totals.unauthenticated_calls ?? 0)}
          hint={
            (data?.totals.unauthenticated_calls ?? 0) > 0
              ? 'legacy clients — keep AGORA_REQUIRE_AUTH off'
              : 'safe to set AGORA_REQUIRE_AUTH=true'
          }
          warn={(data?.totals.unauthenticated_calls ?? 0) > 0}
        />
      </div>

      {/* Daily cost trend */}
      {!!data?.daily.length && (
        <section>
          <h3 className="text-sm font-semibold text-text-primary mb-2">
            Daily estimated cost
          </h3>
          <div className="flex items-end gap-1 h-24 p-3 rounded-lg bg-bg-card border border-border-primary overflow-x-auto">
            {data.daily.map((d) => {
              const max = Math.max(...data.daily.map((x) => x.cost), 0.01);
              return (
                <div
                  key={d.day}
                  title={`${d.day} — $${d.cost.toFixed(2)} · ${d.minutes} participant-min · ${d.calls} calls`}
                  className="flex-1 min-w-[6px] bg-accent-primary/60 hover:bg-accent-primary rounded-sm transition-colors"
                  // Floor at 2% so a day with a little traffic is still
                  // visibly different from a day with none.
                  style={{ height: `${Math.max(2, (d.cost / max) * 100)}%` }}
                />
              );
            })}
          </div>
          <p className="text-xs text-text-muted mt-1">
            {data.daily[0]?.day} → {data.daily[data.daily.length - 1]?.day} · hover a bar for detail
          </p>
        </section>
      )}

      {/* In progress */}
      <section>
        <h3 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
          <Phone className="w-4 h-4 text-green-400" />
          In progress ({data?.active.length ?? 0})
        </h3>
        {data?.active.length ? (
          <div className="space-y-2">
            {data.active.map((c) => {
              const started = c.connected_at ?? c.started_at;
              const elapsed = Math.floor((Date.now() - new Date(started).getTime()) / 1000);
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-bg-card border border-border-primary"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm text-text-primary">
                      {c.call_type === 'video'
                        ? <Video className="w-3.5 h-3.5 text-accent-primary" />
                        : <Phone className="w-3.5 h-3.5 text-accent-primary" />}
                      <span className="font-medium capitalize">{c.status}</span>
                      <span className="text-text-muted">· {hms(Math.max(0, elapsed))}</span>
                      {c.platform && <span className="text-text-muted">· {c.platform}</span>}
                    </div>
                    <p className="text-xs text-text-muted truncate mt-0.5">
                      {c.caller_id?.slice(0, 8)} → {c.receiver_id?.slice(0, 8)}
                    </p>
                  </div>
                  <button
                    onClick={() => act({ action: 'kill', session_id: c.id }, c.id)}
                    disabled={busy === c.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {busy === c.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <PhoneOff className="w-3.5 h-3.5" />}
                    End call
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-text-muted">No calls in progress.</p>
        )}
      </section>

      {/* Per-user usage — the abuse list */}
      <section>
        <h3 className="text-sm font-semibold text-text-primary mb-2">
          Usage by account — highest first
        </h3>
        <div className="overflow-x-auto rounded-lg border border-border-primary">
          <table className="w-full text-sm">
            <thead className="bg-bg-elevated text-text-muted text-xs">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Account</th>
                <th className="text-right px-3 py-2 font-medium">Minutes</th>
                <th className="text-right px-3 py-2 font-medium">Video</th>
                <th className="text-right px-3 py-2 font-medium">Calls</th>
                <th className="text-right px-3 py-2 font-medium">Longest</th>
                <th className="text-right px-3 py-2 font-medium">Last call</th>
                <th className="text-right px-3 py-2 font-medium">Limit</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {data?.users.map((u) => (
                <tr key={u.user_id} className="border-t border-border-primary">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {u.blocked && <Ban className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                      <div className="min-w-0">
                        <p className="text-text-primary truncate">{name(u)}</p>
                        <p className="text-xs text-text-muted truncate">
                          {u.email ?? u.user_id.slice(0, 8)}
                          {u.subscription_tier ? ` · ${u.subscription_tier}` : ' · free'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-text-primary">{u.minutes}</td>
                  <td className="px-3 py-2 text-right text-text-muted">{u.video_minutes}</td>
                  <td className="px-3 py-2 text-right text-text-muted">{u.connected}/{u.calls}</td>
                  <td className="px-3 py-2 text-right text-text-muted">{hms(u.longest)}</td>
                  <td className="px-3 py-2 text-right text-text-muted text-xs">
                    {u.last_at ? new Date(u.last_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-3 py-2 text-right text-xs text-text-muted">
                    {u.blocked
                      ? <span className="text-red-400">Blocked</span>
                      : u.override_monthly_minutes != null
                        ? `${u.override_monthly_minutes} min`
                        : 'tier default'}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => setEditing(u)}
                      className="px-2.5 py-1 text-xs rounded-md bg-bg-card border border-border-primary text-text-secondary hover:text-text-primary"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
              {!data?.users.length && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-text-muted">
                    No calls in this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Tier limits */}
      <section>
        <h3 className="text-sm font-semibold text-text-primary mb-2">Limits</h3>
        <p className="text-xs text-text-muted mb-3">
          Applied live — no deploy needed. &ldquo;free&rdquo; covers accounts with no
          subscription tier set; &ldquo;paid&rdquo; covers everything else.
        </p>
        <div className="space-y-2">
          {data?.limits.map((l) => (
            <LimitEditor
              key={l.tier}
              limit={l}
              busy={busy === `limit:${l.tier}`}
              onSave={(monthly, maxSec, enabled) =>
                act(
                  {
                    action: 'set_limits',
                    tier: l.tier,
                    monthly_minutes: monthly,
                    max_call_seconds: maxSec,
                    enabled,
                  },
                  `limit:${l.tier}`,
                )
              }
            />
          ))}
        </div>
      </section>

      {editing && (
        <UserLimitModal
          user={editing}
          busy={busy === `user:${editing.user_id}`}
          onClose={() => setEditing(null)}
          onSave={async (patch) => {
            await act({ action: 'set_user', user_id: editing.user_id, ...patch }, `user:${editing.user_id}`);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function Stat({
  icon, label, value, hint, warn,
}: {
  icon: React.ReactNode; label: string; value: string; hint?: string; warn?: boolean;
}) {
  return (
    <div className={`p-3 rounded-lg border ${warn ? 'bg-amber-500/5 border-amber-500/30' : 'bg-bg-card border-border-primary'}`}>
      <div className="flex items-center gap-1.5 text-text-muted text-xs mb-1">
        {icon} {label}
      </div>
      <p className="text-xl font-semibold text-text-primary">{value}</p>
      {hint && <p className="text-xs text-text-muted mt-0.5">{hint}</p>}
    </div>
  );
}

function LimitEditor({
  limit, busy, onSave,
}: {
  limit: LimitRow;
  busy: boolean;
  onSave: (monthly: number, maxSec: number, enabled: boolean) => void;
}) {
  const [monthly, setMonthly] = useState(limit.monthly_minutes);
  const [maxMin, setMaxMin] = useState(Math.round(limit.max_call_seconds / 60));
  const [enabled, setEnabled] = useState(limit.enabled);

  return (
    <div className="flex items-center gap-3 flex-wrap p-3 rounded-lg bg-bg-card border border-border-primary">
      <span className="text-sm font-medium text-text-primary w-20 capitalize">{limit.tier}</span>
      <label className="flex items-center gap-1.5 text-xs text-text-muted">
        Monthly
        <input
          type="number"
          value={monthly}
          onChange={(e) => setMonthly(Number(e.target.value))}
          className="w-24 px-2 py-1 rounded-md bg-bg-elevated border border-border-primary text-text-primary text-sm"
        />
        min
      </label>
      <label className="flex items-center gap-1.5 text-xs text-text-muted">
        Max call
        <input
          type="number"
          value={maxMin}
          onChange={(e) => setMaxMin(Number(e.target.value))}
          className="w-20 px-2 py-1 rounded-md bg-bg-elevated border border-border-primary text-text-primary text-sm"
        />
        min
      </label>
      <label className="flex items-center gap-1.5 text-xs text-text-muted">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        Calling enabled
      </label>
      <button
        onClick={() => onSave(monthly, maxMin * 60, enabled)}
        disabled={busy}
        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-primary/10 border border-accent-primary/30 text-accent-primary hover:bg-accent-primary/20 disabled:opacity-50"
      >
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
        Save
      </button>
    </div>
  );
}

function UserLimitModal({
  user, busy, onClose, onSave,
}: {
  user: UserRow;
  busy: boolean;
  onClose: () => void;
  onSave: (patch: Record<string, unknown>) => void;
}) {
  const [blocked, setBlocked] = useState(user.blocked);
  const [monthly, setMonthly] = useState<string>(
    user.override_monthly_minutes != null ? String(user.override_monthly_minutes) : '',
  );
  const [maxMin, setMaxMin] = useState<string>(
    user.override_max_call_seconds != null ? String(Math.round(user.override_max_call_seconds / 60)) : '',
  );
  const [note, setNote] = useState(user.note ?? '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md p-5 rounded-xl bg-bg-card border border-border-primary space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h4 className="text-base font-semibold text-text-primary">{name(user)}</h4>
          <p className="text-xs text-text-muted">{user.email ?? user.user_id}</p>
        </div>

        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input type="checkbox" checked={blocked} onChange={(e) => setBlocked(e.target.checked)} />
          Block this account from calling
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-text-muted">
            Monthly minutes
            <input
              type="number"
              value={monthly}
              placeholder="tier default"
              onChange={(e) => setMonthly(e.target.value)}
              className="mt-1 w-full px-2 py-1.5 rounded-md bg-bg-elevated border border-border-primary text-text-primary text-sm"
            />
          </label>
          <label className="text-xs text-text-muted">
            Max call (min)
            <input
              type="number"
              value={maxMin}
              placeholder="tier default"
              onChange={(e) => setMaxMin(e.target.value)}
              className="mt-1 w-full px-2 py-1.5 rounded-md bg-bg-elevated border border-border-primary text-text-primary text-sm"
            />
          </label>
        </div>
        <p className="text-xs text-text-muted -mt-1">Leave blank to inherit the tier limit.</p>

        <label className="text-xs text-text-muted block">
          Note
          <input
            value={note}
            placeholder="why this override exists"
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 w-full px-2 py-1.5 rounded-md bg-bg-elevated border border-border-primary text-text-primary text-sm"
          />
        </label>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-lg text-text-muted hover:text-text-primary">
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({
                blocked,
                // Empty string clears the override back to the tier
                // default, which is why null is sent rather than 0.
                monthly_minutes: monthly === '' ? null : Number(monthly),
                max_call_seconds: maxMin === '' ? null : Number(maxMin) * 60,
                note: note || null,
              })
            }
            disabled={busy}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-lg bg-accent-primary/10 border border-accent-primary/30 text-accent-primary hover:bg-accent-primary/20 disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
