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
  Table2, Search, Calculator, AlertTriangle, Lock, Database, Play, Plus, FileText,
  Layers, Upload, Shuffle,
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

type Tab = 'dashboard' | 'datasets' | 'experiments' | 'clusters' | 'bodies' | 'midpoints' | 'inspector';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: FlaskConical },
  { id: 'datasets', label: 'Datasets', icon: Database },
  { id: 'experiments', label: 'Experiments', icon: Play },
  { id: 'clusters', label: 'Cluster Lab', icon: Layers },
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
      {tab === 'clusters' && <ClusterLab />}
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
  const [profile, setProfile] = useState<any>(null);
  const [profileBusy, setProfileBusy] = useState(false);

  const run = async () => {
    setBusy(true); setErr(null); setReport(null); setProfile(null);
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

  const loadProfile = async () => {
    setProfileBusy(true); setErr(null); setProfile(null);
    try {
      const r = await researchFetch('/chart-profile', {
        method: 'POST',
        body: JSON.stringify({ birth_date: date, axis_mode: axis, timezone_uncertain: true }),
      });
      setProfile(r.profile);
    } catch (e: any) { setErr(e.message || 'Failed'); } finally { setProfileBusy(false); }
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
                className="px-4 py-2 rounded-lg border border-accent-primary text-accent-primary text-sm disabled:opacity-50 flex items-center gap-2">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
          Inspect
        </button>
        <button onClick={loadProfile} disabled={!date || profileBusy}
                className="px-4 py-2 rounded-lg bg-accent-primary text-white text-sm disabled:opacity-50 flex items-center gap-2">
          {profileBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          Research profile
        </button>
      </div>

      {err && <p className="text-elements-fire text-sm">{err}</p>}

      {profile && (
        <div className="space-y-4">
          {profile.cohort_lean?.length > 0 && (
            <div className="bg-bg-card border border-border-primary rounded-xl p-4">
              <div className="text-text-muted text-xs mb-2">This chart's signatures are over-represented in (from your experiments):</div>
              <div className="flex flex-wrap gap-2">
                {profile.cohort_lean.map((c: any) => (
                  <span key={c.cohort} className="text-xs bg-accent-muted text-accent-primary rounded-lg px-2.5 py-1">
                    {c.cohort} · {c.signatures_overrepresented} signature{c.signatures_overrepresented === 1 ? '' : 's'}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="text-text-tertiary text-sm">
            <span className="text-text-primary font-medium">{profile.signature_count}</span> research signature{profile.signature_count === 1 ? '' : 's'} present, ranked by research strength.
          </div>

          {profile.signatures.map((s: any) => (
            <div key={s.signature_id} className="bg-bg-card border border-border-primary rounded-xl p-4">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="font-mono text-xs text-text-primary">{s.signature_id}</span>
                <span className="text-[10px] uppercase text-text-muted">{s.band} · {s.stability}</span>
                <span className="ml-auto text-xs text-text-muted">orb {s.orb}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[['Theoretical', s.t_score], ['Empirical', s.e_score], ['Replication', s.r_score], ['Strength', s.research_strength]].map(([lbl, val]: any) => (
                  <div key={lbl}>
                    <div className="text-[10px] uppercase text-text-muted mb-1">{lbl}</div>
                    <div className="text-text-primary font-semibold text-sm tabular-nums">{val ?? '—'}<span className="text-text-muted text-xs">/10</span></div>
                    <div className="h-1 bg-border-primary rounded mt-1 overflow-hidden"><div className="h-full bg-accent-primary" style={{ width: `${Math.min(100, (val || 0) * 10)}%` }} /></div>
                  </div>
                ))}
              </div>
              {s.associations.length === 0 ? (
                <p className="text-text-muted text-xs">No measured associations yet — run experiments containing this signature to populate its evidence.</p>
              ) : (
                <div className="space-y-1">
                  {s.associations.map((a: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-text-secondary flex-1">{a.cohort}</span>
                      <span className="text-text-muted tabular-nums">{(a.case_prevalence * 100).toFixed(0)}% vs {(a.control_prevalence * 100).toFixed(0)}%</span>
                      <span className="text-text-primary tabular-nums">OR {a.odds_ratio?.toFixed(2)}</span>
                      {a.significant
                        ? <span className="text-elements-earth">✓</span>
                        : <span className="text-text-muted">ns</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="bg-gold-muted border border-gold-primary/40 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-gold-primary shrink-0 mt-0.5" />
            <p className="text-text-secondary text-xs leading-relaxed">{profile.disclaimer}</p>
          </div>
        </div>
      )}

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

// Column-mapped subject CSV import (header row → subject fields).
const SUBJECT_COLMAP: Record<string, string> = {
  name: 'subject_name', 'subject name': 'subject_name', subject_name: 'subject_name',
  date: 'birth_date', 'birth date': 'birth_date', birth_date: 'birth_date', dob: 'birth_date',
  time: 'birth_time', 'birth time': 'birth_time', birth_time: 'birth_time',
  place: 'birthplace', birthplace: 'birthplace', 'birth place': 'birthplace',
  country: 'birth_country', birth_country: 'birth_country',
  region: 'birth_region', state: 'birth_region', birth_region: 'birth_region',
  category: 'case_category', crime: 'case_category', case_category: 'case_category',
  source: 'source_reference', source_reference: 'source_reference',
  quality: 'data_quality', data_quality: 'data_quality', notes: 'notes',
};

function parseCsvLine(line: string): string[] {
  const out: string[] = []; let cur = ''; let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) { if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',') { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function parseSubjectCsv(text: string): any[] | null {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return null;
  const mapped = parseCsvLine(lines[0]).map((h) => SUBJECT_COLMAP[h.toLowerCase()]);
  if (!mapped.includes('birth_date')) return null;   // not a mapped file → treat as date list
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line); const obj: any = {};
    mapped.forEach((key, i) => { if (key && cells[i]) obj[key] = cells[i]; });
    return obj;
  }).filter((o) => o.birth_date);
}

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

  const handleCsv = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const mapped = parseSubjectCsv(text);
      if (mapped && mapped.length) {
        // Structured CSV (has a birth_date header) → import names/time/place directly.
        if (!selDs) { setMsg('Choose a dataset first, then upload the CSV.'); return; }
        act(async () => {
          const r = await researchFetch(`/datasets/${selDs}/subjects`, { method: 'POST', body: JSON.stringify({ subjects: mapped }) });
          setMsg(`Imported ${r.written} subjects (with names/times/places where present).`);
        }, `Imported ${mapped.length} rows.`);
        return;
      }
      // Plain date list → drop a non-date header, fill the textarea.
      let lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines[0] && !/^\d{4}/.test(lines[0])) lines = lines.slice(1);
      setDates(lines.join('\n'));
    };
    reader.readAsText(file);
  };

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
          <span className="text-text-muted text-xs">Paste dates: <code>1975-04-12</code> or <code>1975-04-12,category</code></span>
          <label className="ml-auto text-xs text-accent-primary cursor-pointer flex items-center gap-1.5 hover:underline">
            <Upload className="w-3.5 h-3.5" /> Upload CSV
            <input type="file" accept=".csv,text/csv" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleCsv(e.target.files[0])} />
          </label>
        </div>
        <p className="text-text-muted text-[11px] mb-2">
          CSV with a header row imports full records — columns: <code>name, birth_date, birth_time, birthplace, birth_country, category, source, quality, notes</code> (only <code>birth_date</code> is required). Select the dataset first.
        </p>
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
  const [f, setF] = useState({ name: '', caseId: '', ctrlId: '', maxDefs: 120, minOR: 1.5, axis: false, featureSet: 'midpoints' });
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [job, setJob] = useState<{ jobId: string; expId: string } | null>(null);
  const [jobStatus, setJobStatus] = useState('');
  const [jobProg, setJobProg] = useState<any>(null);
  const [expId, setExpId] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);
  const [blind, setBlind] = useState(false);
  const [perm, setPerm] = useState<any>(null);
  const [permBusy, setPermBusy] = useState(false);
  const [drill, setDrill] = useState<any>(null);
  const [drillBusy, setDrillBusy] = useState(false);

  useEffect(() => { researchFetch('/datasets').then((r) => setDs(r.datasets || [])).catch(() => {}); }, []);

  const drillSignature = async (signature: string) => {
    if (!f.caseId) return;
    setDrillBusy(true); setDrill({ signature, subjects: null }); setErr(null);
    try {
      const r = await researchFetch(`/datasets/${f.caseId}/subjects-with-signature`, {
        method: 'POST', body: JSON.stringify({ signature, axis_mode: f.axis }),
      });
      setDrill({ signature, subjects: r.subjects, count: r.count });
    } catch (e: any) { setErr(e.message); setDrill(null); } finally { setDrillBusy(false); }
  };

  const runPermutation = async () => {
    const sigs = (out?.results || []).filter((r: any) => r.significant).map((r: any) => r.signature_id).slice(0, 20);
    if (!sigs.length) { setErr('No significant signatures to permutation-test.'); return; }
    setPermBusy(true); setErr(null);
    try {
      const r = await researchFetch('/experiments/permutation', {
        method: 'POST',
        body: JSON.stringify({ case_dataset_id: f.caseId, control_dataset_id: f.ctrlId, signatures: sigs, n_perm: 1000, axis_mode: f.axis }),
      });
      setPerm(r.results);
    } catch (e: any) { setErr(e.message); } finally { setPermBusy(false); }
  };

  const loadReport = async () => {
    if (!expId) return;
    try { setReport(await researchFetch(`/experiments/${expId}/report`)); } catch (e: any) { setErr(e.message); }
  };

  const downloadExport = async (fmt: string) => {
    if (!expId) return;
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const res = await fetch(`${API_BASE}/research/experiments/${expId}/export?format=${fmt}`, {
      headers: { Authorization: `Bearer ${data.session?.access_token}` },
    });
    if (!res.ok) { setErr(`Export failed (${res.status})`); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `experiment.${fmt}`; a.click();
    URL.revokeObjectURL(url);
  };

  const run = async () => {
    setBusy(true); setErr(null); setOut(null); setJob(null); setReport(null); setExpId(null);
    try {
      const timed = f.featureSet === 'houses';
      const r = await researchFetch(timed ? '/experiments/run-timed' : '/experiments/run', {
        method: 'POST',
        body: JSON.stringify(timed ? {
          name: f.name || 'Untitled', case_dataset_id: f.caseId, control_dataset_id: f.ctrlId,
          house_system: 'P', min_odds_ratio: Number(f.minOR),
        } : {
          name: f.name || 'Untitled', case_dataset_id: f.caseId, control_dataset_id: f.ctrlId,
          max_definitions: Number(f.maxDefs), min_odds_ratio: Number(f.minOR), axis_mode: f.axis,
          feature_set: f.featureSet,
        }),
      });
      setOut(r); setExpId(r.experiment_id);
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
          min_odds_ratio: Number(f.minOR), axis_mode: f.axis, feature_set: f.featureSet,
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
          setOut({ summary: s.progress, results: res.results });
          setExpId(job.expId); setReport(null); setJob(null);
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
          <label className="text-xs text-text-muted">Feature set
            <select value={f.featureSet} onChange={(e) => setF({ ...f, featureSet: e.target.value })} className={`${INPUT} w-full mt-1`}>
              <option value="midpoints">Midpoints</option>
              <option value="duads">Duads (2.5° micro-signs)</option>
              <option value="both">Midpoints + duads</option>
              <option value="houses">Houses / angles (timed only)</option>
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
              [blind ? 'Group A' : 'Cases', out.summary.case_total],
              [blind ? 'Group B' : 'Controls', out.summary.control_total],
              ['Tested', out.summary.signatures_tested],
              ['Survive FDR', out.summary.signatures_significant],
            ].map(([label, val]) => (
              <div key={label} className="bg-bg-card border border-border-primary rounded-xl p-4">
                <div className="text-text-muted text-xs mb-1">{label}</div>
                <div className="text-lg font-semibold text-text-primary">{val}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {expId && (
              <>
                <button onClick={loadReport} className="px-3 py-1.5 text-sm rounded-lg border border-accent-primary text-accent-primary flex items-center gap-1.5"><FileText className="w-4 h-4" />View report</button>
                <span className="text-text-muted text-xs">Export:</span>
                {['csv', 'json', 'xlsx'].map((fmt) => (
                  <button key={fmt} onClick={() => downloadExport(fmt)} className="px-2.5 py-1.5 text-xs rounded-lg border border-border-primary text-text-secondary uppercase hover:border-accent-primary">{fmt}</button>
                ))}
              </>
            )}
            <button onClick={runPermutation} disabled={permBusy} className="px-3 py-1.5 text-sm rounded-lg border border-border-primary text-text-secondary flex items-center gap-1.5 hover:border-accent-primary disabled:opacity-50">
              {permBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shuffle className="w-4 h-4" />}Permutation test
            </button>
            <label className="ml-auto flex items-center gap-2 text-xs text-text-tertiary">
              <input type="checkbox" checked={blind} onChange={(e) => setBlind(e.target.checked)} /> Blind labels
            </label>
          </div>

          {perm && (
            <div className="bg-bg-card border border-border-primary rounded-xl p-4">
              <h4 className="text-text-primary text-sm font-medium mb-2 flex items-center gap-2"><Shuffle className="w-4 h-4" />Permutation null test (1,000 shuffles)</h4>
              <div className="space-y-1">
                {Object.values(perm).map((p: any) => (
                  <div key={p.signature_id} className="flex items-center gap-3 text-xs">
                    <span className="font-mono text-text-secondary flex-1">{p.signature_id}</span>
                    <span className="text-text-muted">null≈{p.null_mean}</span>
                    <span className={p.p_value < 0.05 ? 'text-elements-earth' : 'text-text-muted'}>p={p.p_value < 0.001 ? '<0.001' : p.p_value.toFixed(3)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report && (
            <div className="bg-bg-card border border-border-primary rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-text-primary font-medium">Research Report</h3>
                <button onClick={() => setReport(null)} className="text-text-muted text-xs hover:text-text-secondary">close</button>
              </div>
              <pre className="whitespace-pre-wrap text-text-secondary text-xs font-mono leading-relaxed max-h-[420px] overflow-y-auto">{report.markdown}</pre>
            </div>
          )}

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
                    <td className="px-4 py-2 font-mono text-xs">
                      <button onClick={() => drillSignature(r.signature_id)} className="text-accent-primary hover:underline text-left" title="Show cohort members who carry this signature">{r.signature_id}</button>
                    </td>
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
            Click any signature to see which cohort members carry it.
          </p>

          {drill && (
            <div className="bg-bg-card border border-border-primary rounded-xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-text-primary text-sm font-medium">Case-file review</h4>
                <button onClick={() => setDrill(null)} className="ml-auto text-text-muted text-xs hover:text-text-secondary">close</button>
              </div>
              <p className="text-text-muted text-xs mb-3">
                Case-cohort members whose birth date carries <span className="font-mono text-accent-primary">{drill.signature}</span>. Documented history for review — not a prediction.
              </p>
              {drillBusy || drill.subjects === null ? (
                <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
              ) : drill.subjects.length === 0 ? (
                <p className="text-text-muted text-sm">No named case-cohort members carry this signature.</p>
              ) : (
                <div className="overflow-x-auto">
                  <div className="text-text-tertiary text-xs mb-2">{drill.count} member{drill.count === 1 ? '' : 's'}</div>
                  <table className="w-full text-sm min-w-[520px]">
                    <thead>
                      <tr className="text-text-muted text-xs border-b border-border-primary">
                        <th className="text-left font-medium px-3 py-2">Name</th>
                        <th className="text-left font-medium px-3 py-2">Birth date</th>
                        <th className="text-left font-medium px-3 py-2">Place</th>
                        <th className="text-left font-medium px-3 py-2">Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drill.subjects.map((s: any) => (
                        <tr key={s.id} className="border-b border-border-primary/40 last:border-0">
                          <td className="px-3 py-2 text-text-primary">{s.subject_name || <span className="text-text-muted">(unnamed)</span>}</td>
                          <td className="px-3 py-2 text-text-secondary font-mono text-xs">{s.birth_date}{s.birth_time ? ` ${s.birth_time}` : ''}</td>
                          <td className="px-3 py-2 text-text-tertiary text-xs">{s.birthplace || s.birth_country || '—'}</td>
                          <td className="px-3 py-2 text-text-tertiary text-xs">{s.case_category || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Cluster Lab
// ═══════════════════════════════════════════════════════════════════

function ClusterLab() {
  const [ds, setDs] = useState<any[]>([]);
  const [caseId, setCaseId] = useState('');
  const [ctrlId, setCtrlId] = useState('');
  const [minCount, setMinCount] = useState(50);
  const [maxSize, setMaxSize] = useState(3);
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<any[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { researchFetch('/datasets').then((r) => setDs(r.datasets || [])).catch(() => {}); }, []);

  const run = async () => {
    setBusy(true); setErr(null); setRows(null);
    try {
      const r = await researchFetch('/experiments/clusters', {
        method: 'POST',
        body: JSON.stringify({ case_dataset_id: caseId, control_dataset_id: ctrlId, min_case_count: Number(minCount), max_cluster_size: Number(maxSize) }),
      });
      setRows(r.clusters);
    } catch (e: any) { setErr(e.message || 'Failed'); } finally { setBusy(false); }
  };

  const cases = ds.filter((d) => d.cohort_type === 'case');
  const controls = ds.filter((d) => d.cohort_type === 'control');

  return (
    <div className="space-y-5">
      <Card title="Mine multi-signature clusters">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-xs text-text-muted">Case dataset
            <select value={caseId} onChange={(e) => setCaseId(e.target.value)} className={`${INPUT} w-full mt-1`}>
              <option value="">—</option>{cases.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.record_count})</option>)}
            </select>
          </label>
          <label className="text-xs text-text-muted">Control dataset
            <select value={ctrlId} onChange={(e) => setCtrlId(e.target.value)} className={`${INPUT} w-full mt-1`}>
              <option value="">—</option>{controls.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.record_count})</option>)}
            </select>
          </label>
          <label className="text-xs text-text-muted">Min support (case count)
            <input type="number" value={minCount} onChange={(e) => setMinCount(+e.target.value)} className={`${INPUT} w-full mt-1`} />
          </label>
          <label className="text-xs text-text-muted">Max cluster size
            <input type="number" value={maxSize} min={2} max={4} onChange={(e) => setMaxSize(+e.target.value)} className={`${INPUT} w-full mt-1`} />
          </label>
        </div>
        <button onClick={run} disabled={!caseId || !ctrlId || busy} className="mt-3 px-4 py-2 rounded-lg bg-accent-primary text-white text-sm disabled:opacity-50 flex items-center gap-2">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />} Mine clusters
        </button>
        <p className="text-text-muted text-xs mt-3">
          Frequent co-occurring signature sets, FDR-corrected. Clusters whose members share bodies are
          flagged as statistically dependent (not independent evidence).
        </p>
      </Card>

      {err && <p className="text-elements-fire text-sm">{err}</p>}

      {rows && (rows.length === 0 ? <p className="text-text-muted text-sm">No clusters met the support threshold.</p> : (
        <div className="space-y-2">
          {rows.map((c, i) => (
            <div key={i} className="bg-bg-card border border-border-primary rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                {c.significant ? <span className="text-elements-earth text-xs">✓ significant</span> : <span className="text-text-muted text-xs">ns</span>}
                <span className="text-text-muted text-xs ml-auto">OR {c.odds_ratio?.toFixed(2)} · q {c.fdr_q < 0.001 ? c.fdr_q.toExponential(1) : c.fdr_q?.toFixed(3)}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {c.signatures.map((s: string) => <span key={s} className="font-mono text-xs bg-bg-primary border border-border-primary rounded px-2 py-0.5 text-text-secondary">{s}</span>)}
              </div>
              <div className="text-xs text-text-tertiary">
                Case {c.case_count}/{c.case_total} ({(c.case_prevalence * 100).toFixed(1)}%) vs Control {c.control_count}/{c.control_total} ({(c.control_prevalence * 100).toFixed(1)}%)
              </div>
              {(c.warnings || []).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.warnings.map((w: string, j: number) => (
                    <span key={j} className="text-[10px] bg-gold-muted text-gold-primary rounded px-1.5 py-0.5">{w}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
