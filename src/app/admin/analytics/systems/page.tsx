'use client';

// Control systems: feature flags with percentage rollout and kill switches,
// experiments, and the alert rules that make the dashboard tell YOU instead of
// waiting to be visited.

import { useState } from 'react';
import {
  useAdminSection, AccessDenied, SectionHeader, Loading, Card, Stat, StatGrid,
  Table, MigrationNotice, fmt,
} from '../_shared';
import { Power, Plus, AlertTriangle, Trash2 } from 'lucide-react';

interface Flag {
  key: string;
  description: string;
  enabled: boolean;
  rollout_pct: number;
  is_kill_switch: boolean;
  updated_at: string;
}
interface Experiment {
  key: string; description: string; status: string;
  variants: string[]; traffic_pct: number; primary_metric: string | null;
  started_at: string | null;
}
interface AlertRule {
  id: string; name: string; metric: string; condition: string;
  threshold: number; baseline_days: number; enabled: boolean; last_fired_at: string | null;
}
interface AlertEvent {
  id: string; rule_name: string; metric: string; message: string; created_at: string;
}
interface SystemsData {
  flags: Flag[];
  experiments: Experiment[];
  alertRules: AlertRule[];
  alertEvents: AlertEvent[];
}

const input =
  'w-full px-2.5 py-1.5 rounded-lg bg-bg-primary border border-border-primary text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50';

export default function SystemsPage() {
  const { allowed, data, range, setRange, loading, refreshing, refresh } =
    useAdminSection<SystemsData>('systems');

  const [newKey, setNewKey] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  if (!allowed) return <AccessDenied />;

  async function saveFlag(patch: Partial<Flag> & { key: string }) {
    setBusy(patch.key);
    try {
      await fetch('/api/admin/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      await refresh();
    } finally {
      setBusy(null);
    }
  }

  async function removeFlag(key: string) {
    setBusy(key);
    try {
      await fetch(`/api/admin/flags?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
      await refresh();
    } finally {
      setBusy(null);
    }
  }

  async function createFlag() {
    const key = newKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (!key) return;
    await saveFlag({ key, description: newDesc, enabled: false, rollout_pct: 100 });
    setNewKey('');
    setNewDesc('');
  }

  const flags = data?.flags || [];
  const migrationMissing = !loading && data && !Array.isArray(data.flags);

  return (
    <div className="max-w-6xl mx-auto pb-16">
      <SectionHeader
        title="Control systems"
        subtitle="Feature flags, staged rollouts, experiments and alerting — the difference between watching the app and controlling it."
        range={range} setRange={setRange} refresh={refresh} refreshing={refreshing}
      />

      {loading && !data ? <Loading /> : (
        <div className="space-y-4">
          {migrationMissing && <MigrationNotice file="supabase-migration-analytics-phase7-systems.sql" />}

          <Card
            title="Feature flags"
            hint="Toggle a feature off without shipping a build. Rollout percentage is deterministic per user, so raising it only ever adds people — it never reshuffles who is already in."
          >
            <div className="space-y-2">
              {flags.map((f) => (
                <div
                  key={f.key}
                  className={`flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2.5 ${
                    f.is_kill_switch
                      ? 'border-red-500/30 bg-red-500/5'
                      : 'border-border-primary bg-bg-primary'
                  }`}
                >
                  <button
                    onClick={() => saveFlag({ ...f, enabled: !f.enabled })}
                    disabled={busy === f.key}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors disabled:opacity-40 ${
                      f.enabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-bg-secondary text-text-muted border border-border-primary'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    {f.enabled ? 'ON' : 'OFF'}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <code className="text-xs text-text-primary font-medium">{f.key}</code>
                      {f.is_kill_switch && (
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-red-300">
                          <AlertTriangle className="w-2.5 h-2.5" /> kill switch
                        </span>
                      )}
                    </div>
                    {f.description && (
                      <p className="text-[11px] text-text-muted truncate">{f.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={f.rollout_pct}
                      onChange={(e) => saveFlag({ ...f, rollout_pct: Number(e.target.value) })}
                      disabled={busy === f.key}
                      className="w-24 accent-current text-accent-primary"
                      aria-label={`${f.key} rollout percentage`}
                    />
                    <span className="text-[11px] text-text-muted tabular-nums w-9 text-right">
                      {f.rollout_pct}%
                    </span>
                    <button
                      onClick={() => removeFlag(f.key)}
                      disabled={busy === f.key}
                      className="p-1 text-text-muted hover:text-red-400 transition-colors"
                      aria-label={`Delete ${f.key}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {!flags.length && (
                <p className="text-xs text-text-muted py-3 text-center">
                  No flags yet. Create one below, then read it in the app with
                  {' '}<code className="text-accent-primary">feature_flags_for(identity)</code>.
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-end gap-2 mt-4 pt-4 border-t border-border-primary">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Key</label>
                <input className={input} value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="new_feed_ranking" />
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Description</label>
                <input className={input} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="What this controls" />
              </div>
              <button
                onClick={createFlag}
                disabled={!newKey.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-primary/15 border border-accent-primary/30 text-accent-primary text-xs font-medium hover:bg-accent-primary/25 transition-colors disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" /> Create
              </button>
            </div>
          </Card>

          <Card
            title="Experiments"
            hint="Deterministic A/B assignment with exposure logging and guardrails. Without this, every product decision is an opinion."
          >
            <Table
              headers={['Key', 'Status', 'Variants', 'Traffic', 'Primary metric', 'Started']}
              rows={(data?.experiments || []).map((x) => [
                <code key="k" className="text-text-primary">{x.key}</code>,
                <span
                  key="s"
                  className={
                    x.status === 'running' ? 'text-emerald-400'
                      : x.status === 'paused' ? 'text-amber-400' : 'text-text-muted'
                  }
                >
                  {x.status}
                </span>,
                (x.variants || []).join(' / '),
                `${x.traffic_pct}%`,
                x.primary_metric || '—',
                x.started_at ? new Date(x.started_at).toLocaleDateString() : '—',
              ])}
              empty="No experiments yet. Insert one with the snippet at the bottom of the Phase 7 migration."
            />
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card
              title="Alert rules"
              hint="Evaluated hourly by pg_cron. A total outage used to be detected only by someone happening to look."
            >
              <Table
                headers={['Rule', 'Metric', 'Condition', 'Last fired']}
                rows={(data?.alertRules || []).map((r) => [
                  <span key="n" className={r.enabled ? '' : 'text-text-muted line-through'}>{r.name}</span>,
                  r.metric,
                  `${r.condition} ${r.threshold}`,
                  r.last_fired_at ? new Date(r.last_fired_at).toLocaleString() : 'never',
                ])}
                empty="No rules configured."
              />
            </Card>

            <Card title="Recent alerts" hint="Everything that fired, newest first.">
              <Table
                headers={['When', 'Rule', 'What happened']}
                rows={(data?.alertEvents || []).map((a) => [
                  new Date(a.created_at).toLocaleString(),
                  a.rule_name,
                  <span key="m" className="text-amber-300">{a.message}</span>,
                ])}
                empty="Nothing has fired. Quiet is good."
              />
            </Card>
          </div>

          <Card title="Coverage">
            <StatGrid>
              <Stat label="Flags" value={fmt(flags.length)} />
              <Stat label="Kill switches" value={fmt(flags.filter((f) => f.is_kill_switch).length)} />
              <Stat label="Experiments running" value={fmt((data?.experiments || []).filter((x) => x.status === 'running').length)} />
              <Stat label="Alert rules active" value={fmt((data?.alertRules || []).filter((r) => r.enabled).length)} />
            </StatGrid>
          </Card>
        </div>
      )}
    </div>
  );
}
