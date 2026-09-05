'use client';

/**
 * World Echo Method Audit — private, owner-only admin console (Layer D).
 *
 * Backed by /api/v1/world-echo-admin/*, which enforces owner-only access
 * server-side; this page also gates the UI so a non-owner sees a denial rather
 * than an empty console.
 *
 * Two halves, matching the two things the engine can now be asked:
 *
 *   Efficacy   — the retrodictive study. Which methods are associated with
 *                events that already happened, measured against two control
 *                designs so neither corpus recency nor seasonality can pass
 *                itself off as astrology.
 *
 *   Ledger     — the forward loop. Forecasts pre-registered before their
 *                outcome was known, and the queue of those now past their
 *                resolution date and waiting to be scored. Scoring is a
 *                deliberate human act and it is write-once, which is why it
 *                lives behind a confirmation here rather than a one-click
 *                button that could be fat-fingered.
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import {
  Telescope, ShieldCheck, Loader2, Lock, AlertTriangle, CheckCircle2,
  XCircle, CircleSlash, MinusCircle, ClipboardList, FlaskConical,
  ArrowLeft, RefreshCw, Clock,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  || 'https://align-api-v2-production.up.railway.app/api/v1';

async function auditFetch(path: string, options: RequestInit = {}) {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch(`${API_BASE}/world-echo-admin${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (res.status === 401 || res.status === 403) {
    const e: any = new Error('unauthorized');
    e.status = res.status;
    throw e;
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err: any = new Error(body?.detail?.message || body?.detail || `HTTP ${res.status}`);
    err.status = res.status;
    err.code = body?.detail?.code;
    throw err;
  }
  return res.json();
}

type Tab = 'efficacy' | 'ledger' | 'scorecard';
const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'efficacy', label: 'Method efficacy', icon: FlaskConical },
  { id: 'ledger', label: 'Forecast ledger', icon: ClipboardList },
  { id: 'scorecard', label: 'Forward skill', icon: Telescope },
];

const pct = (n: number | null | undefined, d = 1) =>
  n == null ? '—' : `${(n * 100).toFixed(d)}%`;
const num = (n: number | null | undefined) =>
  n == null ? '—' : n.toLocaleString('en-US');

function Stat({ label, value, hint, tone }: {
  label: string; value: React.ReactNode; hint?: string;
  tone?: 'good' | 'warn' | 'bad';
}) {
  const toneClass = tone === 'good' ? 'text-emerald-500'
    : tone === 'warn' ? 'text-amber-500'
    : tone === 'bad' ? 'text-red-500' : 'text-text-primary';
  return (
    <div className="bg-bg-card border border-border-primary rounded-xl p-4">
      <div className="text-[11px] uppercase tracking-wider text-text-muted font-medium">{label}</div>
      <div className={`text-2xl font-semibold mt-1.5 tabular-nums ${toneClass}`}>{value}</div>
      {hint && <div className="text-xs text-text-tertiary mt-1">{hint}</div>}
    </div>
  );
}

export default function WorldEchoAuditPage() {
  const [access, setAccess] = useState<'checking' | 'granted' | 'denied'>('checking');
  const [tab, setTab] = useState<Tab>('efficacy');
  const [noStudy, setNoStudy] = useState(false);
  const [study, setStudy] = useState<any>(null);

  useEffect(() => {
    auditFetch('/efficacy/latest')
      .then((s) => { setStudy(s); setAccess('granted'); })
      .catch((e) => {
        if (e.status === 401 || e.status === 403) { setAccess('denied'); return; }
        // Reachable and authorized, just nothing stored yet.
        setAccess('granted');
        setNoStudy(true);
      });
  }, []);

  if (access === 'checking') {
    return (
      <div className="min-h-[60vh] grid place-items-center text-text-muted">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }
  if (access === 'denied') {
    return (
      <div className="min-h-[60vh] grid place-items-center px-6">
        <div className="max-w-md text-center">
          <Lock className="w-10 h-10 text-text-muted mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-text-primary mb-2">Access restricted</h1>
          <p className="text-text-tertiary text-sm">
            The World Echo method audit shows which of our techniques carry signal and
            which do not. It is limited to research owners, and your account is not on
            the allowlist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-primary mb-5">
        <ArrowLeft className="w-4 h-4" /> Admin
      </Link>

      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-accent-muted grid place-items-center">
          <Telescope className="w-5 h-5 text-accent-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">World Echo Method Audit</h1>
          <p className="text-text-muted text-xs flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Owner-only
            {study?.engine_version && <> · engine {study.engine_version}</>}
            {study?.generated_at && <> · study {String(study.generated_at).slice(0, 10)}</>}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-border-primary mt-6 mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-t-lg transition-colors ${
              tab === id
                ? 'text-accent-primary border-b-2 border-accent-primary -mb-px bg-bg-card'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {tab === 'efficacy' && <EfficacyPanel study={study} noStudy={noStudy} />}
      {tab === 'ledger' && <LedgerPanel />}
      {tab === 'scorecard' && <ScorecardPanel />}
    </div>
  );
}

// ── Efficacy ───────────────────────────────────────────────────────────

function EfficacyPanel({ study, noStudy }: { study: any; noStudy: boolean }) {
  if (noStudy || !study) {
    return (
      <div className="bg-bg-card border border-border-primary rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold text-text-primary mb-1">No study stored yet</h2>
            <p className="text-sm text-text-tertiary">
              Run the audit from align-api-v2, then publish it:
            </p>
            <pre className="mt-3 text-xs bg-bg-secondary border border-border-primary rounded-lg p-3 overflow-x-auto text-text-secondary">
{`python -u scripts/run_world_echo_efficacy.py --stage controls
python -u scripts/run_world_echo_efficacy.py --stage controls --design dayofyear
python -u scripts/run_world_echo_efficacy.py --stage ablation
python -u scripts/run_world_echo_efficacy.py --stage analyze
python -u scripts/run_world_echo_efficacy.py --stage publish`}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  const r = study.report_json || {};
  const fe = r.study_feature_efficacy || {};
  const rb = r.study_cross_design_robustness;
  const pa = r.study_paired_ablation;
  const ht = r.study_headline_test;
  const recs = r.recommendations || [];
  const fams: Record<string, any> = {};
  (fe.families || []).forEach((f: any) => { fams[f.family] = f; });

  const ablation = pa?.results
    ? Object.entries(pa.results).map(([k, v]: any) => ({ key: k, ...v }))
        .sort((a, b) => (b.marginal_value || 0) - (a.marginal_value || 0))
    : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Configurations tested" value={num(fe.n_tested)}
          hint={`${num(study.n_events)} events vs ${num(study.n_controls)} controls`} />
        <Stat label="Significant (FDR)" value={num(fe.n_significant)}
          hint="year-matched controls" tone={fe.n_significant ? 'good' : 'bad'} />
        <Stat label="Robust under both designs" value={rb ? num(rb.n_robust) : '—'}
          hint="survived recency AND seasonality"
          tone={rb ? (rb.n_robust ? 'good' : 'bad') : undefined} />
        <Stat label="Beats chance by"
          value={ht ? `${(ht.mean_paired_difference * 100).toFixed(2)}pp` : '—'}
          hint={ht ? `p = ${ht.p_value < 0.001 ? ht.p_value.toExponential(1) : ht.p_value.toFixed(3)}` : undefined}
          tone={ht && ht.p_value < 0.05 ? 'good' : 'warn'} />
      </div>

      {rb && (
        <div className="bg-bg-card border border-border-primary rounded-xl p-5">
          <h2 className="font-semibold text-text-primary mb-2">Robustness</h2>
          <p className="text-sm text-text-tertiary leading-relaxed">
            <span className="text-text-secondary font-medium">{num(rb.n_seasonality_candidates)}</span> configurations
            were significant only while the calendar could vary — the Sun&apos;s position is a restatement of the
            date, and the corpus clusters events in particular months, so those measure our collection schedule.
            <span className="text-text-secondary font-medium"> {num(rb.n_era_candidates)}</span> were significant
            only while the era could vary, which is the slow planets tracking corpus recency.
            <span className="text-text-secondary font-medium"> {num(rb.n_robust)}</span> cleared both.
          </p>
        </div>
      )}

      {ablation.length > 0 && (
        <div className="bg-bg-card border border-border-primary rounded-xl p-5">
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="font-semibold text-text-primary">What each method contributes</h2>
            <span className="text-xs text-text-muted tabular-nums">
              paired, n = {num(pa.n_queries)}
            </span>
          </div>
          <p className="text-xs text-text-tertiary mb-4">
            Change in precision@20 when the family is removed. Positive means removing it hurt, so
            the method was earning its place. Effects below{' '}
            {(pa.minimum_detectable_effect_80pct_power * 100).toFixed(2)}pp are under this test&apos;s resolution.
          </p>
          <div className="space-y-1.5">
            {ablation.map((a) => {
              const mv = (a.marginal_value || 0) * 100;
              const width = Math.min(50, Math.abs(mv) / 2 * 100);
              return (
                <div key={a.key} className="flex items-center gap-3 text-sm">
                  <div className="w-40 shrink-0 text-right text-text-secondary text-xs">
                    {fams[a.key]?.label || a.key.replace(/_/g, ' ')}
                  </div>
                  <div className="flex-1 h-4 relative">
                    <div className="absolute inset-y-0 left-1/2 w-px bg-border-primary" />
                    <div
                      className={`absolute inset-y-0 rounded-sm ${
                        !a.significant ? 'bg-text-muted/30'
                          : mv > 0 ? 'bg-emerald-500/70' : 'bg-red-500/70'
                      }`}
                      style={mv >= 0
                        ? { left: '50%', width: `${width}%` }
                        : { right: `${50 - width}%`, width: `${width}%` }}
                    />
                  </div>
                  <div className="w-20 shrink-0 text-right tabular-nums text-xs text-text-secondary">
                    {mv >= 0 ? '+' : ''}{mv.toFixed(2)}pp
                  </div>
                  <div className="w-12 shrink-0 text-xs">
                    {a.significant
                      ? <span className="text-accent-primary font-medium">p&lt;.05</span>
                      : <span className="text-text-muted">ns</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {recs.length > 0 && (
        <div className="bg-bg-card border border-border-primary rounded-xl p-5 overflow-x-auto">
          <h2 className="font-semibold text-text-primary mb-1">Weight vs evidence</h2>
          <p className="text-xs text-text-tertiary mb-4">
            What each family is paid in score against the share of evidence it earns. Advisory —
            nothing here re-tunes the engine automatically.
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-text-muted border-b border-border-primary">
                <th className="text-left font-medium py-2">Family</th>
                <th className="text-right font-medium py-2">Verdict</th>
                <th className="text-right font-medium py-2">Evidence</th>
                <th className="text-right font-medium py-2">Score share</th>
                <th className="text-right font-medium py-2">Significant</th>
              </tr>
            </thead>
            <tbody>
              {recs.map((x: any) => (
                <tr key={x.family} className="border-b border-border-primary/50">
                  <td className="py-2 text-text-primary">{x.label}</td>
                  <td className="py-2 text-right">
                    <span className={`text-xs px-2 py-0.5 rounded border ${
                      x.verdict === 'over_weighted' ? 'text-red-500 border-red-500/30'
                        : x.verdict === 'under_weighted' ? 'text-accent-primary border-accent-primary/30'
                        : x.verdict === 'proportionate' ? 'text-emerald-500 border-emerald-500/30'
                        : 'text-text-muted border-border-primary'}`}>
                      {x.verdict.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-2 text-right text-xs text-text-muted">{x.evidence_strength}</td>
                  <td className="py-2 text-right tabular-nums text-text-secondary">
                    {x.current_score_share == null ? 'not scored' : pct(x.current_score_share)}
                  </td>
                  <td className="py-2 text-right tabular-nums text-text-secondary">
                    {num(x.n_significant)} / {num(x.n_tested)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Ledger ─────────────────────────────────────────────────────────────

const OUTCOMES: { id: string; label: string; icon: any; cls: string; help: string }[] = [
  { id: 'hit', label: 'Hit', icon: CheckCircle2, cls: 'text-emerald-500 border-emerald-500/40 hover:bg-emerald-500/10',
    help: 'The named outcome happened in the window.' },
  { id: 'partial', label: 'Partial', icon: MinusCircle, cls: 'text-amber-500 border-amber-500/40 hover:bg-amber-500/10',
    help: 'Right pressure and place, wrong specifics. Scores as half credit.' },
  { id: 'miss', label: 'Miss', icon: XCircle, cls: 'text-red-500 border-red-500/40 hover:bg-red-500/10',
    help: 'Nothing matching occurred.' },
  { id: 'unresolvable', label: 'Unresolvable', icon: CircleSlash, cls: 'text-text-muted border-border-primary hover:bg-bg-secondary',
    help: 'Too vague to check. Excluded from the hit rate and counted separately.' },
];

function LedgerPanel() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Defaults to everything on record. The due-for-scoring queue is empty for
  // most of a forecast's life, so opening on it makes a populated ledger look
  // like an empty one.
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<{ id: string; outcome: string } | null>(null);
  const [notes, setNotes] = useState('');
  const [counts, setCounts] = useState({ all: 0, due: 0 });

  const load = useCallback(() => {
    setLoading(true);
    setErr(null);
    // Both lists every time, so the counts on the filter are always real and a
    // reader can see at a glance that "0 due" does not mean "0 recorded".
    Promise.all([
      auditFetch('/ledger?limit=200'),
      auditFetch('/ledger?limit=200&overdue_only=true'),
    ])
      .then(([all, due]) => {
        setEntries(overdueOnly ? (due.entries || []) : (all.entries || []));
        setCounts({ all: (all.entries || []).length, due: (due.entries || []).length });
      })
      .catch((e) => setErr(e.status ? `${e.message} (HTTP ${e.status})` : e.message))
      .finally(() => setLoading(false));
  }, [overdueOnly]);

  useEffect(() => { load(); }, [load]);

  const resolve = async (id: string, outcome: string) => {
    setBusy(id);
    try {
      await auditFetch(`/ledger/${id}/resolve`, {
        method: 'PATCH',
        body: JSON.stringify({ outcome_status: outcome, outcome_notes: notes || null }),
      });
      setConfirming(null);
      setNotes('');
      load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Two explicit options rather than one toggle whose label showed the
            current state — that read as "there is nothing here" when the due
            queue was empty. */}
        <div className="inline-flex rounded-lg border border-border-primary overflow-hidden">
          <button
            onClick={() => setOverdueOnly(false)}
            className={`text-sm px-3 py-1.5 transition-colors ${
              !overdueOnly
                ? 'bg-accent-primary/10 text-accent-primary'
                : 'bg-bg-card text-text-tertiary hover:text-text-primary'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5 inline mr-1.5" />
            All on record <span className="tabular-nums">({num(counts.all)})</span>
          </button>
          <button
            onClick={() => setOverdueOnly(true)}
            className={`text-sm px-3 py-1.5 border-l border-border-primary transition-colors ${
              overdueOnly
                ? 'bg-accent-primary/10 text-accent-primary'
                : 'bg-bg-card text-text-tertiary hover:text-text-primary'
            }`}
          >
            <Clock className="w-3.5 h-3.5 inline mr-1.5" />
            Due for scoring <span className="tabular-nums">({num(counts.due)})</span>
          </button>
        </div>
        <button onClick={load} className="text-sm px-3 py-1.5 rounded-lg border border-border-primary text-text-tertiary hover:text-text-primary">
          <RefreshCw className="w-3.5 h-3.5 inline mr-1.5" /> Refresh
        </button>
      </div>

      {err && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-500">{err}</div>
      )}

      {loading ? (
        <div className="grid place-items-center py-16 text-text-muted"><Loader2 className="w-5 h-5 animate-spin" /></div>
      ) : entries.length === 0 ? (
        <div className="bg-bg-card border border-border-primary rounded-xl p-8 text-center">
          <Clock className="w-8 h-8 text-text-muted mx-auto mb-3" />
          <p className="text-sm text-text-tertiary max-w-md mx-auto">
            {overdueOnly
              ? counts.all > 0
                ? <>Nothing is due yet — but <button onClick={() => setOverdueOnly(false)}
                    className="text-accent-primary underline underline-offset-2">{num(counts.all)} forecasts are on
                    record</button>. They become scorable once their resolution date passes.</>
                : 'Nothing is past its resolution date yet.'
              : 'No forecasts recorded. They are pre-registered automatically after each daily global scan.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <div key={e.id} className="bg-bg-card border border-border-primary rounded-xl p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-text-muted mb-1.5 flex-wrap">
                    <span className="font-semibold text-text-primary text-sm">{e.country_iso || 'GLOBAL'}</span>
                    <span>scanned {e.scan_date}</span>
                    <span>· resolves {e.resolves_on}</span>
                    <span className={`px-1.5 py-0.5 rounded border ${
                      e.prediction_source === 'ai'
                        ? 'text-accent-primary border-accent-primary/30'
                        : 'text-text-muted border-border-primary'}`}>{e.prediction_source}</span>
                    {e.confidence != null && (
                      <span className="tabular-nums">confidence {pct(e.confidence, 0)}</span>
                    )}
                    {e.outcome_status !== 'pending' && (
                      <span className="text-text-secondary">· scored {e.outcome_status}</span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">{e.forecast_text}</p>
                </div>
              </div>

              {e.outcome_status === 'pending' && (
                <div className="mt-3 pt-3 border-t border-border-primary">
                  {confirming && confirming.id === e.id ? (
                    <div className="space-y-2">
                      <p className="text-xs text-text-tertiary">
                        Recording <span className="font-medium text-text-secondary">{confirming.outcome}</span>.
                        This is written once and cannot be changed afterwards.
                      </p>
                      <input
                        value={notes}
                        onChange={(ev) => setNotes(ev.target.value)}
                        placeholder="What actually happened (optional, but worth it)"
                        className="w-full text-sm bg-bg-secondary border border-border-primary rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted"
                      />
                      <div className="flex gap-2">
                        <button
                          disabled={busy === e.id}
                          onClick={() => resolve(e.id, confirming.outcome)}
                          className="text-sm px-3 py-1.5 rounded-lg bg-accent-primary text-white disabled:opacity-50"
                        >
                          {busy === e.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                        </button>
                        <button
                          onClick={() => { setConfirming(null); setNotes(''); }}
                          className="text-sm px-3 py-1.5 rounded-lg border border-border-primary text-text-tertiary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      {OUTCOMES.map(({ id, label, icon: Icon, cls, help }) => (
                        <button
                          key={id}
                          title={help}
                          onClick={() => setConfirming({ id: e.id, outcome: id })}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${cls}`}
                        >
                          <Icon className="w-3.5 h-3.5 inline mr-1" /> {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Scorecard ──────────────────────────────────────────────────────────

function ScorecardPanel() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    auditFetch('/ledger/scorecard').then(setData).catch((e) => setErr(e.message));
  }, []);

  if (err) return <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-500">{err}</div>;
  if (!data) return <div className="grid place-items-center py-16 text-text-muted"><Loader2 className="w-5 h-5 animate-spin" /></div>;

  if (data.status === 'no_forward_evidence') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="On record" value={num(data.n_recorded)} hint="pre-registered forecasts"
            tone={data.n_recorded ? 'good' : 'warn'} />
          <Stat label="Resolved" value={num(0)} hint="none have reached their deadline" />
          <Stat label="Awaiting scoring" value={num(data.n_overdue_for_scoring)}
            tone={data.n_overdue_for_scoring ? 'warn' : undefined} hint="past deadline, unjudged" />
          <Stat label="Forward skill" value="unmeasured" hint="not zero, not good — unknown" />
        </div>
        <div className="bg-bg-card border-l-2 border-amber-500 rounded-r-xl p-5">
          <h2 className="font-semibold text-text-primary mb-1.5">Not yet answerable</h2>
          <p className="text-sm text-text-tertiary leading-relaxed">
            {data.n_recorded > 0 ? (
              <>
                {num(data.n_recorded)} forecasts are on the record, the earliest resolving{' '}
                <span className="text-text-secondary font-medium">{data.earliest_resolution}</span>. Until those
                dates pass and outcomes are scored, forward skill is unmeasured. Anyone quoting a predictive hit
                rate for this engine today is quoting something no data supports.
              </>
            ) : (
              <>The ledger is live but empty. Forecasts are pre-registered automatically after each daily global scan.</>
            )}
          </p>
        </div>
      </div>
    );
  }

  const counts = data.outcome_counts || {};
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Hit rate" value={pct(data.hit_rate_partial_credit)}
          hint={`partial credit, n = ${num(data.n_resolved)}`} />
        <Stat label="Brier score" value={data.brier_score == null ? '—' : data.brier_score.toFixed(3)}
          hint="lower is better; 0.25 = uninformative" />
        <Stat label="Awaiting scoring" value={num(data.n_overdue_for_scoring)}
          tone={data.n_overdue_for_scoring ? 'warn' : undefined} hint="past deadline" />
        <Stat label="Unresolvable" value={pct(data.unresolvable_share)}
          tone={data.unresolvable_share > 0.2 ? 'bad' : undefined}
          hint="too vague to check — a finding in itself" />
      </div>

      <div className="bg-bg-card border border-border-primary rounded-xl p-5">
        <h2 className="font-semibold text-text-primary mb-3">Outcomes</h2>
        <div className="flex gap-4 text-sm flex-wrap">
          <span className="text-emerald-500">{num(counts.hit)} hit</span>
          <span className="text-amber-500">{num(counts.partial)} partial</span>
          <span className="text-red-500">{num(counts.miss)} miss</span>
        </div>
      </div>

      {(data.calibration || []).length > 0 && (
        <div className="bg-bg-card border border-border-primary rounded-xl p-5">
          <h2 className="font-semibold text-text-primary mb-1">Calibration</h2>
          <p className="text-xs text-text-tertiary mb-4">
            Of everything asserted at a given confidence, how much actually happened. Matching numbers
            mean the confidence score means something.
          </p>
          <div className="space-y-2">
            {data.calibration.map((c: any) => (
              <div key={c.bucket} className="flex items-center gap-3 text-sm">
                <div className="w-20 text-xs text-text-muted tabular-nums">{c.bucket}</div>
                <div className="flex-1 h-5 bg-bg-secondary rounded relative overflow-hidden">
                  <div className="absolute inset-y-0 bg-accent-primary/60"
                    style={{ width: `${Math.min(100, c.observed_rate * 100)}%` }} />
                  <div className="absolute inset-y-0 w-0.5 bg-text-primary/60"
                    style={{ left: `${Math.min(100, c.mean_stated_confidence * 100)}%` }} />
                </div>
                <div className="w-28 text-right text-xs tabular-nums text-text-secondary">
                  {pct(c.observed_rate, 0)} vs {pct(c.mean_stated_confidence, 0)}
                </div>
                <div className="w-10 text-right text-xs text-text-muted tabular-nums">n={c.n}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(data.by_prediction_source || []).length > 0 && (
        <div className="bg-bg-card border border-border-primary rounded-xl p-5">
          <h2 className="font-semibold text-text-primary mb-1">AI forecasts vs template</h2>
          <p className="text-xs text-text-tertiary mb-3">
            Whether replacing the templated forecasts with Claude actually improved accuracy.
          </p>
          <div className="flex gap-6 text-sm">
            {data.by_prediction_source.map((s: any) => (
              <div key={s.source}>
                <div className="text-text-muted text-xs uppercase tracking-wide">{s.source}</div>
                <div className="text-lg font-semibold text-text-primary tabular-nums">{pct(s.rate)}</div>
                <div className="text-xs text-text-tertiary">n = {num(s.n)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
