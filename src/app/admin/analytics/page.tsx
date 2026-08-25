'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { AnalyticsTabs } from './_shared';
import {
  Shield, BarChart3, Loader2, RefreshCw, Globe2, Languages,
  Users, Radio, TrendingUp, MousePointerClick, ArrowLeft, Sparkles,
  ArrowUpRight, ArrowDownRight, Minus, Filter, Repeat, UserPlus,
  DollarSign, Share2, Megaphone, Link2, Copy, Check,
} from 'lucide-react';

interface TrendRow {
  day: string;
  dau: number;
  new_users: number;
  sessions: number;
  avg_session_sec: number;
  platform_web: number;
  platform_ios: number;
  platform_android: number;
}
interface AnalyticsData {
  live: { live?: number; live_web?: number; live_ios?: number; live_android?: number; dau?: number; wau?: number; mau?: number; total_members?: number };
  range: number;
  trend: TrendRow[];
  pages: { path: string; views: number; users: number }[];
  features: { feature: string; opens: number; users: number }[];
  geo: { country: string; users: number; sessions: number }[];
  locale: { locale: string; users: number }[];
  platforms: { web: number; ios: number; android: number };
  deltas: { newUsers: number; sessions: number; dauAvg: number; dauToday: number };
  retention: { d1: number | null; d7: number | null; d30: number | null; cohort: { d1: number; d7: number; d30: number } };
  engagement: { active?: number; new?: number; returning?: number; sessions?: number; bounces?: number };
  funnel: { signups?: number; birth?: number; charted?: number };
  revenue: { total: number; paid: number; free: number; mrr: number; arpu: number; conversionPct: number; price: number };
  traffic: { source: string; sessions: number; users: number }[];
  affiliates: { signups: number; conversions: number };
  campaigns: { source: string; medium: string; campaign: string; sessions: number; users: number; signups: number; subscribers: number }[];
  generatedAt: string;
}

function flagEmoji(cc: string): string {
  if (!cc || cc.length !== 2 || cc === 'ZZ') return '🌐';
  const A = 0x1f1e6;
  const c0 = cc.toUpperCase().charCodeAt(0) - 65;
  const c1 = cc.toUpperCase().charCodeAt(1) - 65;
  if (c0 < 0 || c0 > 25 || c1 < 0 || c1 > 25) return '🌐';
  return String.fromCodePoint(A + c0) + String.fromCodePoint(A + c1);
}

function countryName(cc: string): string {
  try {
    const dn = new Intl.DisplayNames(['en'], { type: 'region' });
    return dn.of(cc.toUpperCase()) || cc;
  } catch { return cc; }
}

function langName(code: string): string {
  if (code === 'other') return 'Other';
  try {
    const dn = new Intl.DisplayNames(['en'], { type: 'language' });
    return dn.of(code) || code;
  } catch { return code; }
}

function fmt(n: number | undefined): string {
  if (n == null) return '—';
  return n.toLocaleString();
}

function timeAgo(iso?: string): string {
  if (!iso) return '';
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function Delta({ pct }: { pct?: number }) {
  if (pct == null) return null;
  if (pct === 0) return <span className="inline-flex items-center gap-0.5 text-[11px] text-text-muted"><Minus className="w-3 h-3" />0%</span>;
  const up = pct > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${up ? 'text-green-400' : 'text-red-400'}`}>
      {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{Math.abs(pct)}%
    </span>
  );
}

function Stat({ label, value, accent, delta, deltaHint }: { label: string; value: string; accent?: string; delta?: number; deltaHint?: string }) {
  return (
    <div className="bg-bg-secondary rounded-xl p-4 border border-border-primary">
      <div className="flex items-baseline justify-between gap-2">
        <p className={`text-2xl font-extrabold ${accent || 'text-text-primary'}`}>{value}</p>
        <Delta pct={delta} />
      </div>
      <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">{label}</p>
      {delta != null && deltaHint && <p className="text-[9px] text-text-muted mt-0.5">{deltaHint}</p>}
    </div>
  );
}

function BarRow({ label, value, max, hint, share }: { label: React.ReactNode; value: number; max: number; hint?: string; share?: number }) {
  const pct = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return (
    <div className="py-1.5">
      <div className="flex items-center justify-between gap-3 mb-1">
        <span className="text-sm text-text-secondary truncate flex items-center gap-2 min-w-0">{label}</span>
        <span className="text-sm font-semibold text-text-primary flex-shrink-0 flex items-baseline gap-1.5">
          {fmt(value)}{hint && <span className="text-text-muted text-xs font-normal">{hint}</span>}
          {share != null && <span className="text-accent-primary/80 text-[11px] font-medium w-9 text-right">{share}%</span>}
        </span>
      </div>
      <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-accent-primary to-purple-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// DAU chart with area fill, hover points (native tooltip) and value labels.
function DauChart({ rows }: { rows: TrendRow[] }) {
  if (rows.length === 0) return <p className="text-xs text-text-muted py-6 text-center">No activity yet.</p>;
  const data = rows.map(r => r.dau);
  const max = Math.max(...data, 1);
  const W = 100, H = 44;
  const step = data.length > 1 ? W / (data.length - 1) : W;
  const xy = (v: number, i: number) => [i * step, H - (v / max) * (H - 6) - 3] as [number, number];
  const pts = data.map((v, i) => xy(v, i));
  const line = pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `0,${H} ${line} ${W},${H}`;
  const last = data[data.length - 1];
  const peak = Math.max(...data);

  return (
    <div className="relative">
      <div className="flex items-end justify-between mb-1">
        <div>
          <span className="text-3xl font-extrabold text-text-primary">{fmt(last)}</span>
          <span className="text-xs text-text-muted ml-2">today</span>
        </div>
        <span className="text-[11px] text-text-muted">peak {fmt(peak)}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-24">
        <defs>
          <linearGradient id="dauFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" className="text-accent-primary" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" className="text-accent-primary" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#dauFill)" className="text-accent-primary" />
        <polyline points={line} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-primary" vectorEffect="non-scaling-stroke" />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="1.6" className="text-accent-primary" fill="currentColor" vectorEffect="non-scaling-stroke">
            <title>{rows[i].day}: {rows[i].dau} active</title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-text-muted mt-1">
        <span>{rows[0]?.day || ''}</span>
        <span>{rows[rows.length - 1]?.day || ''}</span>
      </div>
    </div>
  );
}

function FunnelCard({ funnel }: { funnel: AnalyticsData['funnel'] }) {
  const steps = [
    { label: 'Signed up', value: funnel.signups ?? 0, color: 'from-accent-primary to-purple-500' },
    { label: 'Added birth info', value: funnel.birth ?? 0, color: 'from-blue-500 to-cyan-500' },
    { label: 'Got their chart', value: funnel.charted ?? 0, color: 'from-green-500 to-emerald-500' },
  ];
  const top = Math.max(1, steps[0].value);
  const overall = steps[0].value > 0 ? Math.round((steps[2].value / steps[0].value) * 100) : 0;
  return (
    <div className="bg-bg-secondary rounded-xl p-5 border border-border-primary">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-accent-primary" />
        <h2 className="text-sm font-bold text-text-primary">Signup → activation funnel</h2>
      </div>
      <div className="space-y-3">
        {steps.map((s, i) => {
          const pctOfTop = Math.round((s.value / top) * 100);
          const conv = i === 0 ? null : steps[i - 1].value ? Math.round((s.value / steps[i - 1].value) * 100) : 0;
          return (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-text-secondary">{s.label}</span>
                <span className="text-sm font-semibold text-text-primary">
                  {fmt(s.value)}
                  {conv != null && <span className="text-text-muted text-xs font-normal ml-1.5">{conv}% of prev</span>}
                </span>
              </div>
              <div className="h-3 bg-bg-tertiary rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${s.color} rounded-full`} style={{ width: `${Math.max(3, pctOfTop)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-text-muted mt-3">All-time · {overall}% of signups reach their chart. The biggest drop is where to focus.</p>
    </div>
  );
}

function RetentionCard({ retention }: { retention: AnalyticsData['retention'] }) {
  const items = [
    { k: 'Day 1', v: retention?.d1, n: retention?.cohort?.d1 ?? 0 },
    { k: 'Day 7', v: retention?.d7, n: retention?.cohort?.d7 ?? 0 },
    { k: 'Day 30', v: retention?.d30, n: retention?.cohort?.d30 ?? 0 },
  ];
  return (
    <div className="bg-bg-secondary rounded-xl p-5 border border-border-primary">
      <div className="flex items-center gap-2 mb-3">
        <Repeat className="w-4 h-4 text-accent-primary" />
        <h2 className="text-sm font-bold text-text-primary">Retention</h2>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {items.map(it => (
          <div key={it.k} className="text-center bg-bg-tertiary/40 rounded-lg py-3">
            <p className="text-2xl font-extrabold text-text-primary">{it.v == null ? '—' : `${it.v}%`}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">{it.k}</p>
            <p className="text-[9px] text-text-muted mt-0.5">{it.n > 0 ? `${it.n} in cohort` : 'collecting…'}</p>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-text-muted mt-3">% of new users who returned on that day. Fills in as data matures (D7 needs 7 days, D30 needs 30).</p>
    </div>
  );
}

function EngagementCard({ eng }: { eng: AnalyticsData['engagement'] }) {
  const nu = eng?.new ?? 0, ret = eng?.returning ?? 0, tot = nu + ret;
  const bounce = eng?.sessions ? Math.round(((eng.bounces || 0) / eng.sessions) * 100) : null;
  return (
    <div className="bg-bg-secondary rounded-xl p-5 border border-border-primary">
      <div className="flex items-center gap-2 mb-3">
        <UserPlus className="w-4 h-4 text-accent-primary" />
        <h2 className="text-sm font-bold text-text-primary">Engagement quality</h2>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden bg-bg-tertiary">
        <div className="bg-green-500" style={{ width: `${tot ? (nu / tot) * 100 : 0}%` }} />
        <div className="bg-accent-primary" style={{ width: `${tot ? (ret / tot) * 100 : 0}%` }} />
      </div>
      <div className="flex justify-between text-[11px] mt-1.5 mb-3">
        <span className="text-green-400">New {fmt(nu)}</span>
        <span className="text-accent-primary">Returning {fmt(ret)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-text-secondary">Bounce rate</span>
        <span className="font-semibold text-text-primary">{bounce == null ? '—' : `${bounce}%`}</span>
      </div>
      <p className="text-[10px] text-text-muted mt-1">Bounce = sessions with no real interaction. Lower is better.</p>
    </div>
  );
}

function RevenueCard({ rev }: { rev: AnalyticsData['revenue'] }) {
  const total = Math.max(1, rev.total);
  const paidPct = Math.round((rev.paid / total) * 100);
  return (
    <div className="bg-bg-secondary rounded-xl p-5 border border-border-primary">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="w-4 h-4 text-green-400" />
        <h2 className="text-sm font-bold text-text-primary">Revenue</h2>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-2xl font-extrabold text-green-400">${fmt(rev.mrr)}</p>
          <p className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">MRR (est.)</p>
        </div>
        <div>
          <p className="text-2xl font-extrabold text-text-primary">{fmt(rev.paid)}</p>
          <p className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">Subscribers</p>
        </div>
        <div>
          <p className="text-2xl font-extrabold text-text-primary">{rev.conversionPct}%</p>
          <p className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">Paid rate</p>
        </div>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden bg-bg-tertiary">
        <div className="bg-green-500" style={{ width: `${paidPct}%` }} />
      </div>
      <div className="flex justify-between text-[11px] mt-1.5">
        <span className="text-green-400">Paid {fmt(rev.paid)}</span>
        <span className="text-text-muted">Free {fmt(rev.free)}</span>
      </div>
      <p className="text-[10px] text-text-muted mt-3">
        MRR estimated at ${rev.price}/mo × subscribers · ARPU ${rev.arpu}. Connect Stripe for exact MRR, trials &amp; churn.
      </p>
    </div>
  );
}

function TrafficCard({ traffic, affiliates }: { traffic: AnalyticsData['traffic']; affiliates: AnalyticsData['affiliates'] }) {
  const max = Math.max(1, ...(traffic || []).map(t => t.sessions));
  return (
    <div className="bg-bg-secondary rounded-xl p-5 border border-border-primary">
      <div className="flex items-center gap-2 mb-3">
        <Share2 className="w-4 h-4 text-accent-primary" />
        <h2 className="text-sm font-bold text-text-primary">Traffic sources</h2>
      </div>
      {(traffic || []).length === 0 ? (
        <p className="text-xs text-text-muted py-3">No sessions in this range yet.</p>
      ) : (
        <div>{(traffic || []).slice(0, 8).map(t => (
          <BarRow key={t.source} label={<span className="truncate">{t.source}</span>} value={t.sessions} max={max} hint="sessions" />
        ))}</div>
      )}
      <div className="mt-3 pt-3 border-t border-border-primary flex justify-between text-xs">
        <span className="text-text-secondary">Affiliate-driven</span>
        <span className="text-text-primary font-medium">{fmt(affiliates?.signups)} signups · {fmt(affiliates?.conversions)} conversions</span>
      </div>
    </div>
  );
}

function CampaignsCard({ campaigns }: { campaigns: AnalyticsData['campaigns'] }) {
  return (
    <div className="bg-bg-secondary rounded-xl p-5 border border-border-primary">
      <div className="flex items-center gap-2 mb-3">
        <Megaphone className="w-4 h-4 text-accent-primary" />
        <h2 className="text-sm font-bold text-text-primary">Campaigns (UTM)</h2>
      </div>
      {(campaigns || []).length === 0 ? (
        <p className="text-xs text-text-muted py-3">
          No tagged links yet. Build one below, share it, and traffic + signups from it will show here.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="text-[10px] text-text-muted uppercase tracking-wider text-left border-b border-border-primary">
                <th className="py-2 pr-3 font-medium">Source / Medium / Campaign</th>
                <th className="py-2 px-2 font-medium text-right">Sessions</th>
                <th className="py-2 px-2 font-medium text-right">Signups</th>
                <th className="py-2 pl-2 font-medium text-right">Subs</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.slice(0, 15).map((c, i) => (
                <tr key={i} className="border-b border-border-primary/50">
                  <td className="py-2 pr-3">
                    <span className="text-text-primary font-medium">{c.source}</span>
                    <span className="text-text-muted"> · {c.medium} · {c.campaign}</span>
                  </td>
                  <td className="py-2 px-2 text-right text-text-secondary">{fmt(c.sessions)}</td>
                  <td className="py-2 px-2 text-right text-text-secondary">{fmt(c.signups)}</td>
                  <td className="py-2 pl-2 text-right font-semibold text-green-400">{fmt(c.subscribers)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-[10px] text-text-muted mt-3">Sessions = this range · signups &amp; subscribers = all-time, first-touch attributed.</p>
    </div>
  );
}

function UtmBuilder() {
  const [source, setSource] = useState('');
  const [medium, setMedium] = useState('');
  const [campaign, setCampaign] = useState('');
  const [copied, setCopied] = useState(false);

  const base = 'https://aligncosmic.com';
  const params = new URLSearchParams();
  if (source) params.set('utm_source', source.trim().toLowerCase().replace(/\s+/g, '_'));
  if (medium) params.set('utm_medium', medium.trim().toLowerCase().replace(/\s+/g, '_'));
  if (campaign) params.set('utm_campaign', campaign.trim().toLowerCase().replace(/\s+/g, '_'));
  const url = source ? `${base}/?${params.toString()}` : base;

  function copy() {
    try {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  const field = 'w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-primary transition-colors';

  return (
    <div className="bg-bg-secondary rounded-xl p-5 border border-border-primary">
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="w-4 h-4 text-accent-primary" />
        <h2 className="text-sm font-bold text-text-primary">Campaign link builder</h2>
      </div>
      <p className="text-[11px] text-text-muted mb-3">Tag a link before you post it, so the campaign shows up in the table above.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
        <div>
          <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Source *</label>
          <input className={field} value={source} onChange={e => setSource(e.target.value)} placeholder="tiktok" />
        </div>
        <div>
          <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Medium</label>
          <input className={field} value={medium} onChange={e => setMedium(e.target.value)} placeholder="video" />
        </div>
        <div>
          <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Campaign</label>
          <input className={field} value={campaign} onChange={e => setCampaign(e.target.value)} placeholder="july_launch" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 px-3 py-2 rounded-lg bg-bg-primary border border-border-primary text-xs text-accent-primary break-all">{url}</code>
        <button onClick={copy} disabled={!source}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-primary/15 border border-accent-primary/30 text-accent-primary text-xs font-medium hover:bg-accent-primary/25 transition-colors disabled:opacity-40 flex-shrink-0">
          {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
        </button>
      </div>
    </div>
  );
}

export default function AnalyticsAdminPage() {
  const { profile } = useAuthStore();
  const [verified, setVerified] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [range, setRange] = useState<7 | 30>(7);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    async function verifyAdmin() {
      if (!profile?.is_admin) return;
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
      if (data?.is_admin) setVerified(true);
    }
    verifyAdmin();
  }, [profile]);

  const load = useCallback(async (r: number) => {
    const res = await fetch(`/api/admin/analytics?range=${r}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!verified) return;
    (async () => {
      setLoading(true);
      await fetch('/api/admin/analytics', { method: 'POST' }).catch(() => {});
      await load(range);
    })();
    const t = setInterval(() => load(range), 30000);
    return () => clearInterval(t);
  }, [verified, range, load]);

  async function refresh() {
    setRefreshing(true);
    await fetch('/api/admin/analytics', { method: 'POST' }).catch(() => {});
    await load(range);
    setRefreshing(false);
  }

  if (!profile || !profile.is_admin || !verified) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-text-primary">Access Denied</h1>
        <p className="text-text-muted text-sm mt-2">Admin privileges required.</p>
      </div>
    );
  }

  const live = data?.live || {};
  const trend = data?.trend || [];
  const deltas = data?.deltas;
  const newUsers = trend.reduce((s, r) => s + (r.new_users || 0), 0);
  const sessions = trend.reduce((s, r) => s + (r.sessions || 0), 0);
  const avgSession = trend.length ? Math.round(trend.reduce((s, r) => s + (r.avg_session_sec || 0), 0) / trend.length) : 0;
  const pagesMax = Math.max(1, ...(data?.pages || []).map(p => p.views));
  const featMax = Math.max(1, ...(data?.features || []).map(f => f.opens));
  const geoTotal = (data?.geo || []).reduce((s, g) => s + g.users, 0) || 1;
  const geoMax = Math.max(1, ...(data?.geo || []).map(g => g.users));
  const locTotal = (data?.locale || []).reduce((s, l) => s + l.users, 0) || 1;
  const locMax = Math.max(1, ...(data?.locale || []).map(l => l.users));
  const platTotal = (data?.platforms.web || 0) + (data?.platforms.ios || 0) + (data?.platforms.android || 0);

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-accent-primary" />
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">Analytics</h1>
            <Link href="/admin" className="text-xs text-text-muted hover:text-text-secondary flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Back to admin
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-bg-tertiary rounded-lg p-1">
            {[7, 30].map(r => (
              <button key={r} onClick={() => setRange(r as 7 | 30)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${range === r ? 'bg-bg-card text-text-primary shadow-sm' : 'text-text-muted'}`}>
                {r}d
              </button>
            ))}
          </div>
          <button onClick={refresh} disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-text-secondary text-xs font-medium hover:bg-white/10 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Tabs — Overview is this page; the rest are the Phase 5-7 sections.
          These were previously only rendered by SectionHeader, which this
          page does not use, so the new tabs were unreachable from here. */}
      <div className="mb-6">
        <AnalyticsTabs />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-20 justify-center">
          <Loader2 className="w-5 h-5 text-accent-primary animate-spin" />
          <span className="text-text-muted text-sm">Loading analytics…</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Live banner */}
          <div className="rounded-2xl p-5 bg-gradient-to-r from-accent-primary/15 to-purple-600/10 border border-accent-primary/20 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Radio className="w-8 h-8 text-green-400" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full animate-ping" />
              </div>
              <div>
                <p className="text-4xl font-extrabold text-text-primary leading-none">{fmt(live.live)}</p>
                <p className="text-xs text-text-muted uppercase tracking-wider mt-1">Online right now</p>
              </div>
            </div>
            <div className="flex gap-5 text-sm">
              <span className="text-text-secondary">🌐 Web <strong className="text-text-primary">{fmt(live.live_web)}</strong></span>
              <span className="text-text-secondary">📱 iOS <strong className="text-text-primary">{fmt(live.live_ios)}</strong></span>
              <span className="text-text-secondary">🤖 Android <strong className="text-text-primary">{fmt(live.live_android)}</strong></span>
            </div>
          </div>

          {/* Headline stats with deltas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Active today (DAU)" value={fmt(live.dau)} accent="text-accent-primary" delta={deltas?.dauToday} deltaHint="vs yesterday" />
            <Stat label="This week (WAU)" value={fmt(live.wau)} />
            <Stat label="This month (MAU)" value={fmt(live.mau)} />
            <Stat label="Total members" value={fmt(live.total_members)} />
            <Stat label={`New (${range}d)`} value={fmt(newUsers)} accent="text-green-400" delta={deltas?.newUsers} deltaHint={`vs prior ${range}d`} />
            <Stat label={`Sessions (${range}d)`} value={fmt(sessions)} delta={deltas?.sessions} deltaHint={`vs prior ${range}d`} />
            <Stat label="Avg session" value={avgSession ? `${Math.floor(avgSession / 60)}m ${avgSession % 60}s` : '—'} />
            <Stat label="Stickiness (DAU/MAU)" value={live.mau ? `${Math.round(((live.dau || 0) / live.mau) * 100)}%` : '—'} />
          </div>

          {/* DAU trend */}
          <div className="bg-bg-secondary rounded-xl p-5 border border-border-primary">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-accent-primary" />
              <h2 className="text-sm font-bold text-text-primary">Daily active users — last {range} days</h2>
              <Delta pct={deltas?.dauAvg} />
            </div>
            <DauChart rows={trend} />
          </div>

          {/* Money & growth: revenue + traffic */}
          <div className="grid md:grid-cols-2 gap-6">
            {data?.revenue && <RevenueCard rev={data.revenue} />}
            {data?.traffic && <TrafficCard traffic={data.traffic} affiliates={data.affiliates} />}
          </div>

          {/* Campaigns + link builder */}
          {data?.campaigns && <CampaignsCard campaigns={data.campaigns} />}
          <UtmBuilder />

          {/* Growth: funnel + retention */}
          <div className="grid md:grid-cols-2 gap-6">
            {data?.funnel && <FunnelCard funnel={data.funnel} />}
            {data?.retention && <RetentionCard retention={data.retention} />}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Top pages */}
            <div className="bg-bg-secondary rounded-xl p-5 border border-border-primary">
              <div className="flex items-center gap-2 mb-3">
                <MousePointerClick className="w-4 h-4 text-accent-primary" />
                <h2 className="text-sm font-bold text-text-primary">Top pages & screens</h2>
              </div>
              {(data?.pages || []).length === 0 ? (
                <p className="text-xs text-text-muted py-4">No page views in this range yet — they’ll appear as people browse.</p>
              ) : (
                <div>{(data?.pages || []).slice(0, 12).map(p => (
                  <BarRow key={p.path} label={<span className="font-mono text-xs truncate">{p.path}</span>} value={p.views} max={pagesMax} hint="views" />
                ))}</div>
              )}
            </div>

            {/* Top features */}
            <div className="bg-bg-secondary rounded-xl p-5 border border-border-primary">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-accent-primary" />
                <h2 className="text-sm font-bold text-text-primary">Top features used</h2>
              </div>
              {(data?.features || []).length === 0 ? (
                <p className="text-xs text-text-muted py-4">No feature events yet. Features tracked as users open charts, readings, chat, etc.</p>
              ) : (
                <div>{(data?.features || []).slice(0, 12).map(f => (
                  <BarRow key={f.feature} label={<span className="capitalize truncate">{f.feature.replace(/[-_]/g, ' ')}</span>} value={f.opens} max={featMax} hint="opens" />
                ))}</div>
              )}
            </div>

            {/* Countries */}
            <div className="bg-bg-secondary rounded-xl p-5 border border-border-primary">
              <div className="flex items-center gap-2 mb-3">
                <Globe2 className="w-4 h-4 text-accent-primary" />
                <h2 className="text-sm font-bold text-text-primary">Countries</h2>
              </div>
              {(data?.geo || []).length === 0 ? (
                <p className="text-xs text-text-muted py-4">No geography yet — country is read from IP (never stored).</p>
              ) : (
                <div>{(data?.geo || []).slice(0, 12).map(g => (
                  <BarRow key={g.country} label={<span className="truncate">{flagEmoji(g.country)} {countryName(g.country)}</span>} value={g.users} max={geoMax} hint="users" share={Math.round((g.users / geoTotal) * 100)} />
                ))}</div>
              )}
            </div>

            {/* Languages */}
            <div className="bg-bg-secondary rounded-xl p-5 border border-border-primary">
              <div className="flex items-center gap-2 mb-3">
                <Languages className="w-4 h-4 text-accent-primary" />
                <h2 className="text-sm font-bold text-text-primary">Languages</h2>
              </div>
              {(data?.locale || []).length === 0 ? (
                <p className="text-xs text-text-muted py-4">No language data yet.</p>
              ) : (
                <div>{(data?.locale || []).slice(0, 12).map(l => (
                  <BarRow key={l.locale} label={<span className="capitalize truncate">{langName(l.locale)}</span>} value={l.users} max={locMax} hint="users" share={Math.round((l.users / locTotal) * 100)} />
                ))}</div>
              )}
            </div>

            {/* Engagement quality */}
            {data?.engagement && <EngagementCard eng={data.engagement} />}

            {/* Platform split */}
            <div className="bg-bg-secondary rounded-xl p-5 border border-border-primary">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-accent-primary" />
                <h2 className="text-sm font-bold text-text-primary">Platform ({range}d sessions)</h2>
              </div>
              {platTotal === 0 ? (
                <p className="text-xs text-text-muted py-4">No sessions recorded yet.</p>
              ) : (
                <div>
                  <BarRow label="🌐 Web" value={data!.platforms.web} max={platTotal} share={Math.round((data!.platforms.web / platTotal) * 100)} />
                  <BarRow label="📱 iOS" value={data!.platforms.ios} max={platTotal} share={Math.round((data!.platforms.ios / platTotal) * 100)} />
                  <BarRow label="🤖 Android" value={data!.platforms.android} max={platTotal} share={Math.round((data!.platforms.android / platTotal) * 100)} />
                </div>
              )}
            </div>
          </div>

          <p className="text-[11px] text-text-muted text-center">
            Updated {timeAgo(data?.generatedAt)} · auto-refreshes every 30s · country from IP (never stored) · live = active in last 5 min
          </p>
        </div>
      )}
    </div>
  );
}
