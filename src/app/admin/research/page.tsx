'use client';

/**
 * Midpoint Pattern Research Laboratory — private, owner-only admin UI (Phase 13).
 *
 * Backed entirely by the /api/v1/research/* endpoints, which enforce
 * owner-only access server-side. This page also gates the UI: a non-owner
 * gets an access-denied screen instead of the panel. Nothing here produces or
 * displays any individual risk/probability output — the Chart Inspector shows
 * "Research Signature Presence" only.
 */

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import {
  FlaskConical, ShieldCheck, Loader2, CheckCircle2, XCircle, Orbit,
  Table2, Search, Calculator, AlertTriangle, Lock,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  || 'https://align-api-v2-production.up.railway.app/api/v1';

// ── tiny research API client (token from the Supabase session) ─────────
async function researchFetch(path: string, options: RequestInit = {}) {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch(`${API_BASE}/research${path}`, {
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
    throw new Error(body?.detail?.message || body?.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

type Tab = 'dashboard' | 'bodies' | 'midpoints' | 'inspector';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: FlaskConical },
  { id: 'bodies', label: 'Research Bodies', icon: Orbit },
  { id: 'midpoints', label: 'Midpoint Definitions', icon: Table2 },
  { id: 'inspector', label: 'Chart Inspector', icon: Calculator },
];

export default function ResearchLabPage() {
  const [access, setAccess] = useState<'checking' | 'granted' | 'denied'>('checking');
  const [tab, setTab] = useState<Tab>('dashboard');
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    researchFetch('/health')
      .then((h) => { setHealth(h); setAccess('granted'); })
      .catch(() => setAccess('denied'));
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
            The Midpoint Pattern Research Laboratory is private and limited to research
            owners. Your account is not on the owner allowlist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-accent-muted grid place-items-center">
          <FlaskConical className="w-5 h-5 text-accent-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Midpoint Pattern Research Laboratory</h1>
          <p className="text-text-muted text-xs flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Private research console · owner-only
          </p>
        </div>
      </div>

      {/* Tabs */}
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

      {tab === 'dashboard' && <Dashboard health={health} />}
      {tab === 'bodies' && <Bodies />}
      {tab === 'midpoints' && <Midpoints />}
      {tab === 'inspector' && <Inspector />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Dashboard
// ═══════════════════════════════════════════════════════════════════

function Dashboard({ health }: { health: any }) {
  const [setup, setSetup] = useState<any>(null);
  const [verify, setVerify] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { researchFetch('/setup').then(setSetup).catch(() => {}); }, []);

  const runVerify = async () => {
    setBusy(true);
    try { setVerify(await researchFetch('/verify')); } finally { setBusy(false); }
  };

  const cards = [
    { label: 'Research bodies', value: `${health?.research_bodies_resolvable}/${health?.research_bodies_expected}` },
    { label: 'Midpoint definitions', value: setup ? setup.midpoint_definitions : '—' },
    { label: 'Calculation self-test', value: health?.calc_verification, ok: health?.calc_verification === 'PASS' },
    { label: 'Engine version', value: health?.versions?.midpoint_engine },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-bg-card border border-border-primary rounded-xl p-4">
            <div className="text-text-muted text-xs mb-1">{c.label}</div>
            <div className={`text-lg font-semibold ${c.ok === false ? 'text-elements-fire' : 'text-text-primary'}`}>
              {c.value ?? '—'}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-bg-card border border-border-primary rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-text-primary font-medium">Calculation Verification</h2>
          <button
            onClick={runVerify}
            disabled={busy}
            className="text-sm px-3 py-1.5 rounded-lg bg-accent-primary text-white disabled:opacity-50 flex items-center gap-2"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
            Run self-test
          </button>
        </div>
        {verify ? (
          <div className="space-y-1.5">
            <div className={`text-sm font-medium ${verify.overall === 'PASS' ? 'text-elements-earth' : 'text-elements-fire'}`}>
              {verify.overall} — {verify.passed}/{verify.total} checks
            </div>
            {verify.checks.map((c: any) => (
              <div key={c.name} className="flex items-center gap-2 text-xs text-text-tertiary">
                {c.pass ? <CheckCircle2 className="w-3.5 h-3.5 text-elements-earth" />
                        : <XCircle className="w-3.5 h-3.5 text-elements-fire" />}
                {c.name}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-sm">Run the self-test to verify the math + statistics core at runtime.</p>
        )}
      </div>

      <p className="text-text-muted text-xs leading-relaxed">
        This engine reports population-level statistical association only. It does not, and must not,
        produce individual risk, probability, or prediction of any behavior.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Research Bodies
// ═══════════════════════════════════════════════════════════════════

function Bodies() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { researchFetch('/bodies').then(setData).catch(() => {}); }, []);
  if (!data) return <Loader2 className="w-5 h-5 animate-spin text-text-muted" />;
  return (
    <div>
      <p className="text-text-tertiary text-sm mb-4">
        {data.resolvable}/{data.expected} bodies resolvable on the current ephemeris.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {data.bodies.map((b: any) => (
          <div key={b.name}
               className="bg-bg-card border border-border-primary rounded-lg px-3 py-2.5 flex items-center gap-2"
               title={b.note || ''}>
            {b.resolvable
              ? <CheckCircle2 className="w-4 h-4 text-elements-earth shrink-0" />
              : <AlertTriangle className="w-4 h-4 text-gold-primary shrink-0" />}
            <div className="min-w-0">
              <div className="text-text-primary text-sm truncate">{b.name}</div>
              <div className="text-text-muted text-[10px] uppercase tracking-wide">{b.category}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Midpoint Definitions
// ═══════════════════════════════════════════════════════════════════

function Midpoints() {
  const [rows, setRows] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const limit = 50;

  const load = useCallback(async (off: number) => {
    setLoading(true);
    try {
      const res = await researchFetch(`/midpoints?limit=${limit}&offset=${off}`);
      setRows(res.definitions || []);
      setOffset(off);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(0); }, [load]);

  const shown = filter
    ? rows.filter((r) => `${r.midpoint_name} ${r.canonical_pair} ${r.primary_symbolic_theme}`
        .toLowerCase().includes(filter.toLowerCase()))
    : rows;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter this page…"
            className="w-full bg-bg-card border border-border-primary rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={() => load(Math.max(0, offset - limit))}
                  disabled={offset === 0 || loading}
                  className="px-3 py-1.5 text-sm rounded-lg border border-border-primary text-text-secondary disabled:opacity-40">Prev</button>
          <span className="text-text-muted text-xs">{offset + 1}–{offset + rows.length}</span>
          <button onClick={() => load(offset + limit)}
                  disabled={rows.length < limit || loading}
                  className="px-3 py-1.5 text-sm rounded-lg border border-border-primary text-text-secondary disabled:opacity-40">Next</button>
        </div>
      </div>

      <div className="overflow-x-auto bg-bg-card border border-border-primary rounded-xl">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-text-muted text-xs border-b border-border-primary">
              <th className="text-left font-medium px-4 py-2.5 w-14">#</th>
              <th className="text-left font-medium px-4 py-2.5">Midpoint</th>
              <th className="text-left font-medium px-4 py-2.5 w-20">Grade<span className="text-accent-primary">*</span></th>
              <th className="text-left font-medium px-4 py-2.5 w-20">Score<span className="text-accent-primary">*</span></th>
              <th className="text-left font-medium px-4 py-2.5">Theme</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                <Loader2 className="w-5 h-5 animate-spin inline" /></td></tr>
            ) : shown.map((r) => (
              <tr key={r.canonical_pair} className="border-b border-border-primary/40 last:border-0">
                <td className="px-4 py-2.5 text-text-muted">{r.rank}</td>
                <td className="px-4 py-2.5 text-text-primary">{r.midpoint_name}</td>
                <td className="px-4 py-2.5 text-text-secondary">{r.theoretical_grade}</td>
                <td className="px-4 py-2.5 text-text-secondary">{r.theoretical_score}</td>
                <td className="px-4 py-2.5 text-text-tertiary text-xs">{r.primary_symbolic_theme}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-text-muted text-xs mt-3">
        <span className="text-accent-primary">*</span> Theoretical (symbolic) grade &amp; score only — these are the
        starting hypotheses, <em>not</em> empirical results. Data is allowed to override this ranking.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Chart Inspector
// ═══════════════════════════════════════════════════════════════════

const BAND_COLOR: Record<string, string> = {
  Exceptional: 'text-accent-primary',
  'Very Strong': 'text-accent-secondary',
  Strong: 'text-gold-primary',
  Secondary: 'text-text-secondary',
  Exploratory: 'text-text-tertiary',
};

function Inspector() {
  const [date, setDate] = useState('');
  const [axis, setAxis] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    setBusy(true); setErr(null); setReport(null);
    try {
      const r = await researchFetch('/chart-inspector', {
        method: 'POST',
        body: JSON.stringify({ birth_date: date, axis_mode: axis, timezone_uncertain: true }),
      });
      setReport(r);
    } catch (e: any) {
      setErr(e.message || 'Failed');
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <div className="bg-gold-muted border border-gold-primary/40 rounded-xl p-3 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-gold-primary shrink-0 mt-0.5" />
        <p className="text-text-secondary text-xs leading-relaxed">
          Shows <strong>Research Signature Presence</strong> for a birth date to verify the calculation
          engine. This is <strong>not</strong> a risk, probability, or prediction of any behavior.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-text-muted text-xs mb-1">Birth date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                 className="bg-bg-card border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary" />
        </div>
        <label className="flex items-center gap-2 text-sm text-text-secondary pb-2">
          <input type="checkbox" checked={axis} onChange={(e) => setAxis(e.target.checked)} />
          Midpoint-axis mode
        </label>
        <button onClick={run} disabled={!date || busy}
                className="px-4 py-2 rounded-lg bg-accent-primary text-white text-sm disabled:opacity-50 flex items-center gap-2">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
          Inspect
        </button>
      </div>

      {err && <p className="text-elements-fire text-sm">{err}</p>}

      {report && (
        <div className="space-y-4">
          <div className="text-text-tertiary text-sm">
            <span className="text-text-primary font-medium">{report.signature_count}</span> research
            signature{report.signature_count === 1 ? '' : 's'} present
            {report.axis_mode ? ' (axis mode)' : ''}.
          </div>

          {report.signatures_present.length > 0 && (
            <div className="overflow-x-auto bg-bg-card border border-border-primary rounded-xl">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="text-text-muted text-xs border-b border-border-primary">
                    <th className="text-left font-medium px-4 py-2.5">Signature</th>
                    <th className="text-left font-medium px-4 py-2.5">Orb</th>
                    <th className="text-left font-medium px-4 py-2.5">Band</th>
                    <th className="text-left font-medium px-4 py-2.5">Stability</th>
                  </tr>
                </thead>
                <tbody>
                  {report.signatures_present.map((s: any) => (
                    <tr key={s.signature_id} className="border-b border-border-primary/40 last:border-0">
                      <td className="px-4 py-2.5 text-text-primary font-mono text-xs">{s.signature_id}</td>
                      <td className="px-4 py-2.5 text-text-secondary">{s.orb}</td>
                      <td className={`px-4 py-2.5 ${BAND_COLOR[s.band] || 'text-text-tertiary'}`}>{s.band}</td>
                      <td className="px-4 py-2.5 text-text-tertiary text-xs">{s.stability}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
