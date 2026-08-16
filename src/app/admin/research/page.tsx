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
  Table2, Search, Calculator, AlertTriangle, Lock, Database, Play, Plus,
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

type Tab = 'dashboard' | 'datasets' | 'experiments' | 'bodies' | 'midpoints' | 'inspector';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: FlaskConical },
  { id: 'datasets', label: 'Datasets', icon: Database },
  { id: 'experiments', label: 'Experiments', icon: Play },
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
      {tab === 'datasets' && <Datasets />}
      {tab === 'experiments' && <Experiments />}
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

// ═══════════════════════════════════════════════════════════════════
// Datasets
// ═══════════════════════════════════════════════════════════════════

const INPUT = 'bg-bg-card border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary';

function Card({ title, children }: { title: string; children: any }) {
  return (
    <div className="bg-bg-card border border-border-primary rounded-xl p-5">
      <h3 className="text-text-primary font-medium mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Datasets() {
  const [list, setList] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [ctype, setCtype] = useState('case');
  const [selDs, setSelDs] = useState('');
  const [dates, setDates] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ctrl, setCtrl] = useState({ name: '', mode: 'uniform', n: 500, seed: 1, start: '1950-01-01', end: '2000-12-31', caseId: '' });

  const load = useCallback(async () => {
    try { const r = await researchFetch('/datasets'); setList(r.datasets || []); } catch {}
  }, []);
  useEffect(() => { load(); }, [load]);

  const act = async (fn: () => Promise<any>, ok: string) => {
    setBusy(true); setMsg(null);
    try { await fn(); setMsg(ok); await load(); }
    catch (e: any) { setMsg(e.message || 'Failed'); }
    finally { setBusy(false); }
  };

  const createDs = () => act(async () => {
    await researchFetch('/datasets', { method: 'POST', body: JSON.stringify({ name, cohort_type: ctype }) });
    setName('');
  }, 'Dataset created.');

  const addSubjects = () => act(async () => {
    const subjects = dates.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
      const [d, cat] = l.split(',').map((x) => x.trim());
      return cat ? { birth_date: d, case_category: cat } : { birth_date: d };
    });
    const r = await researchFetch(`/datasets/${selDs}/subjects`, { method: 'POST', body: JSON.stringify({ subjects }) });
    setDates(''); setMsg(`Added ${r.written} subjects.`);
  }, 'Subjects added.');

  const genControls = () => act(async () => {
    await researchFetch('/datasets/generate-controls', {
      method: 'POST',
      body: JSON.stringify({
        name: ctrl.name, mode: ctrl.mode, n: Number(ctrl.n), seed: Number(ctrl.seed),
        date_start: ctrl.start, date_end: ctrl.end,
        case_dataset_id: ctrl.caseId || undefined,
      }),
    });
  }, 'Controls generated.');

  return (
    <div className="space-y-5">
      {msg && <div className="text-sm text-accent-secondary">{msg}</div>}

      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="Create dataset">
          <div className="flex flex-wrap gap-2 items-end">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dataset name" className={INPUT} />
            <select value={ctype} onChange={(e) => setCtype(e.target.value)} className={INPUT}>
              <option value="case">case</option>
              <option value="control">control</option>
            </select>
            <button onClick={createDs} disabled={!name || busy} className="px-3 py-2 rounded-lg bg-accent-primary text-white text-sm disabled:opacity-50 flex items-center gap-1.5"><Plus className="w-4 h-4" />Create</button>
          </div>
        </Card>

        <Card title="Generate synthetic controls">
          <div className="grid grid-cols-2 gap-2">
            <input value={ctrl.name} onChange={(e) => setCtrl({ ...ctrl, name: e.target.value })} placeholder="Control set name" className={INPUT} />
            <select value={ctrl.mode} onChange={(e) => setCtrl({ ...ctrl, mode: e.target.value })} className={INPUT}>
              <option value="uniform">uniform</option>
              <option value="matched_year">matched_year</option>
              <option value="matched_decade">matched_decade</option>
              <option value="matched_range">matched_range</option>
            </select>
            <input type="number" value={ctrl.n} onChange={(e) => setCtrl({ ...ctrl, n: +e.target.value })} placeholder="count" className={INPUT} />
            <input type="number" value={ctrl.seed} onChange={(e) => setCtrl({ ...ctrl, seed: +e.target.value })} placeholder="seed" className={INPUT} />
            {ctrl.mode === 'uniform' ? (
              <>
                <input type="date" value={ctrl.start} onChange={(e) => setCtrl({ ...ctrl, start: e.target.value })} className={INPUT} />
                <input type="date" value={ctrl.end} onChange={(e) => setCtrl({ ...ctrl, end: e.target.value })} className={INPUT} />
              </>
            ) : (
              <select value={ctrl.caseId} onChange={(e) => setCtrl({ ...ctrl, caseId: e.target.value })} className={`${INPUT} col-span-2`}>
                <option value="">— match to case dataset —</option>
                {list.filter((d) => d.cohort_type === 'case').map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            )}
          </div>
          <button onClick={genControls} disabled={!ctrl.name || busy} className="mt-3 px-3 py-2 rounded-lg bg-accent-primary text-white text-sm disabled:opacity-50">Generate</button>
        </Card>
      </div>

      <Card title="Add subjects (birth dates)">
        <div className="flex flex-wrap gap-2 items-center mb-2">
          <select value={selDs} onChange={(e) => setSelDs(e.target.value)} className={INPUT}>
            <option value="">— choose dataset —</option>
            {list.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.cohort_type})</option>)}
          </select>
          <span className="text-text-muted text-xs">One per line: <code>1975-04-12</code> or <code>1975-04-12,category</code></span>
        </div>
        <textarea value={dates} onChange={(e) => setDates(e.target.value)} rows={5}
          placeholder={"1975-04-12\n1968-11-03,homicide"} className={`${INPUT} w-full font-mono`} />
        <button onClick={addSubjects} disabled={!selDs || !dates.trim() || busy} className="mt-2 px-3 py-2 rounded-lg bg-accent-primary text-white text-sm disabled:opacity-50">Add subjects</button>
      </Card>

      <Card title="Datasets">
        {list.length === 0 ? <p className="text-text-muted text-sm">No datasets yet.</p> : (
          <div className="space-y-1.5">
            {list.map((d) => (
              <div key={d.id} className="flex items-center gap-3 text-sm py-1.5 border-b border-border-primary/40 last:border-0">
                <span className={`text-[10px] uppercase px-2 py-0.5 rounded ${d.cohort_type === 'case' ? 'bg-accent-muted text-accent-primary' : 'bg-gold-muted text-gold-primary'}`}>{d.cohort_type}</span>
                <span className="text-text-primary flex-1">{d.name}</span>
                <span className="text-text-muted">{d.record_count} subjects</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Experiments
// ═══════════════════════════════════════════════════════════════════

function Experiments() {
  const [ds, setDs] = useState<any[]>([]);
  const [f, setF] = useState({ name: '', caseId: '', ctrlId: '', maxDefs: 120, minOR: 1.5, axis: false });
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [job, setJob] = useState<{ jobId: string; expId: string } | null>(null);
  const [jobStatus, setJobStatus] = useState('');
  const [jobProg, setJobProg] = useState<any>(null);

  useEffect(() => { researchFetch('/datasets').then((r) => setDs(r.datasets || [])).catch(() => {}); }, []);

  const run = async () => {
    setBusy(true); setErr(null); setOut(null); setJob(null);
    try {
      const r = await researchFetch('/experiments/run', {
        method: 'POST',
        body: JSON.stringify({
          name: f.name || 'Untitled', case_dataset_id: f.caseId, control_dataset_id: f.ctrlId,
          max_definitions: Number(f.maxDefs), min_odds_ratio: Number(f.minOR), axis_mode: f.axis,
        }),
      });
      setOut(r);
    } catch (e: any) { setErr(e.message || 'Failed'); }
    finally { setBusy(false); }
  };

  const runFull = async () => {
    setErr(null); setOut(null);
    try {
      const r = await researchFetch('/experiments/run-full', {
        method: 'POST',
        body: JSON.stringify({
          name: f.name || 'Untitled', case_dataset_id: f.caseId, control_dataset_id: f.ctrlId,
          min_odds_ratio: Number(f.minOR), axis_mode: f.axis,
        }),
      });
      setJob({ jobId: r.job_id, expId: r.experiment_id }); setJobStatus('QUEUED'); setJobProg(null);
    } catch (e: any) { setErr(e.message || 'Failed'); }
  };

  // Poll a running background job until it completes, then load its results.
  useEffect(() => {
    if (!job || jobStatus === 'COMPLETED' || jobStatus === 'FAILED') return;
    const t = setTimeout(async () => {
      try {
        const s = await researchFetch(`/experiments/jobs/${job.jobId}`);
        setJobStatus(s.status); setJobProg(s.progress);
        if (s.status === 'COMPLETED') {
          const res = await researchFetch(`/experiments/${job.expId}/results?limit=300`);
          setOut({ summary: s.progress, results: res.results }); setJob(null);
        } else if (s.status === 'FAILED') {
          setErr(s.error || 'Job failed'); setJob(null);
        }
      } catch (e: any) { setErr(e.message || 'Poll failed'); setJob(null); }
    }, 2000);
    return () => clearTimeout(t);
  }, [job, jobStatus]);

  const cases = ds.filter((d) => d.cohort_type === 'case');
  const controls = ds.filter((d) => d.cohort_type === 'control');

  return (
    <div className="space-y-5">
      <Card title="Run case-vs-control study">
        <div className="grid sm:grid-cols-2 gap-3">
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Experiment name" className={INPUT} />
          <div />
          <label className="text-xs text-text-muted">Case dataset
            <select value={f.caseId} onChange={(e) => setF({ ...f, caseId: e.target.value })} className={`${INPUT} w-full mt-1`}>
              <option value="">—</option>
              {cases.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.record_count})</option>)}
            </select>
          </label>
          <label className="text-xs text-text-muted">Control dataset
            <select value={f.ctrlId} onChange={(e) => setF({ ...f, ctrlId: e.target.value })} className={`${INPUT} w-full mt-1`}>
              <option value="">—</option>
              {controls.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.record_count})</option>)}
            </select>
          </label>
          <label className="text-xs text-text-muted">Midpoints scanned (top-N by rank)
            <input type="number" value={f.maxDefs} onChange={(e) => setF({ ...f, maxDefs: +e.target.value })} className={`${INPUT} w-full mt-1`} />
          </label>
          <label className="text-xs text-text-muted">Min odds ratio
            <input type="number" step="0.1" value={f.minOR} onChange={(e) => setF({ ...f, minOR: +e.target.value })} className={`${INPUT} w-full mt-1`} />
          </label>
        </div>
        <div className="flex items-center gap-4 mt-3">
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input type="checkbox" checked={f.axis} onChange={(e) => setF({ ...f, axis: e.target.checked })} /> Axis mode
          </label>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={run} disabled={!f.caseId || !f.ctrlId || busy || !!job} className="px-4 py-2 rounded-lg border border-accent-primary text-accent-primary text-sm disabled:opacity-50 flex items-center gap-2">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Quick run
            </button>
            <button onClick={runFull} disabled={!f.caseId || !f.ctrlId || busy || !!job} className="px-4 py-2 rounded-lg bg-accent-primary text-white text-sm disabled:opacity-50 flex items-center gap-2">
              <Play className="w-4 h-4" /> Run full study
            </button>
          </div>
        </div>
        <p className="text-text-muted text-xs mt-3">
          <strong>Quick run</strong>: bounded, synchronous, top-N midpoints — instant.
          <strong> Run full study</strong>: all enabled midpoints across the whole cohort, in the
          background. Both apply Benjamini–Hochberg FDR + an effect-size gate before marking significance.
        </p>

        {job && (
          <div className="mt-4 bg-bg-primary border border-border-primary rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
              <Loader2 className="w-4 h-4 animate-spin text-accent-primary" />
              Background run — <span className="text-accent-secondary">{jobStatus}</span>
              {jobProg?.total_dates ? (
                <span className="text-text-muted ml-auto">
                  {jobProg.processed_dates}/{jobProg.total_dates} dates ({jobProg.pct ?? 0}%)
                </span>
              ) : null}
            </div>
            <div className="h-1.5 bg-border-primary rounded-full overflow-hidden">
              <div className="h-full bg-accent-primary transition-all" style={{ width: `${jobProg?.pct ?? 3}%` }} />
            </div>
          </div>
        )}
      </Card>

      {err && <p className="text-elements-fire text-sm">{err}</p>}

      {out && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ['Cases', out.summary.case_total],
              ['Controls', out.summary.control_total],
              ['Tested', out.summary.signatures_tested],
              ['Survive FDR', out.summary.signatures_significant],
            ].map(([label, val]) => (
              <div key={label} className="bg-bg-card border border-border-primary rounded-xl p-4">
                <div className="text-text-muted text-xs mb-1">{label}</div>
                <div className="text-lg font-semibold text-text-primary">{val}</div>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto bg-bg-card border border-border-primary rounded-xl">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-text-muted text-xs border-b border-border-primary">
                  <th className="text-left font-medium px-4 py-2.5">Signature</th>
                  <th className="text-right font-medium px-4 py-2.5">Case %</th>
                  <th className="text-right font-medium px-4 py-2.5">Ctrl %</th>
                  <th className="text-right font-medium px-4 py-2.5">OR</th>
                  <th className="text-right font-medium px-4 py-2.5">FDR q</th>
                  <th className="text-left font-medium px-4 py-2.5">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {out.results.map((r: any) => (
                  <tr key={r.signature_id} className="border-b border-border-primary/40 last:border-0">
                    <td className="px-4 py-2 text-text-primary font-mono text-xs">{r.signature_id}</td>
                    <td className="px-4 py-2 text-right text-text-secondary">{(r.case_prevalence * 100).toFixed(1)}</td>
                    <td className="px-4 py-2 text-right text-text-secondary">{(r.control_prevalence * 100).toFixed(1)}</td>
                    <td className="px-4 py-2 text-right text-text-secondary">{r.odds_ratio?.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right text-text-tertiary">{r.fdr_q < 0.001 ? r.fdr_q.toExponential(1) : r.fdr_q.toFixed(3)}</td>
                    <td className="px-4 py-2">
                      {r.significant
                        ? <span className="text-elements-earth text-xs">✓ significant</span>
                        : <span className="text-text-muted text-xs">{(r.warnings || [])[0] || 'ns'}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-text-muted text-xs">
            Population-level statistical association only — never an individual risk or prediction.
          </p>
        </>
      )}
    </div>
  );
}
