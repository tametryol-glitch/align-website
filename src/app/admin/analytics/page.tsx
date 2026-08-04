'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import {
  Shield, BarChart3, Loader2, RefreshCw, Globe2, Languages,
  Users, Radio, TrendingUp, MousePointerClick, ArrowLeft,
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
  geo: { country: string; users: number; sessions: number }[];
  locale: { locale: string; users: number }[];
  platforms: { web: number; ios: number; android: number };
  kAnon: number;
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
  if (cc === 'Other') return 'Other (small groups)';
  try {
    const dn = new Intl.DisplayNames(['en'], { type: 'region' });
    return dn.of(cc.toUpperCase()) || cc;
  } catch { return cc; }
}

function langName(code: string): string {
  if (code === 'other') return 'Other (small groups)';
  try {
    const dn = new Intl.DisplayNames(['en'], { type: 'language' });
    return dn.of(code) || code;
  } catch { return code; }
}

function fmt(n: number | undefined): string {
  if (n == null) return '—';
  return n.toLocaleString();
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-bg-secondary rounded-xl p-4 border border-border-primary">
      <p className={`text-2xl font-extrabold ${accent || 'text-text-primary'}`}>{value}</p>
      <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}

function BarRow({ label, sub, value, max, hint }: { label: React.ReactNode; sub?: string; value: number; max: number; hint?: string }) {
  const pct = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return (
    <div className="py-1.5">
      <div className="flex items-center justify-between gap-3 mb-1">
        <span className="text-sm text-text-secondary truncate flex items-center gap-2">{label}{sub && <span className="text-text-muted text-xs">{sub}</span>}</span>
        <span className="text-sm font-semibold text-text-primary flex-shrink-0">{fmt(value)}{hint && <span className="text-text-muted text-xs font-normal ml-1">{hint}</span>}</span>
      </div>
      <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-accent-primary to-purple-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  if (data.length === 0) return null;
  const max = Math.max(...data, 1);
  const W = 100, H = 32;
  const step = data.length > 1 ? W / (data.length - 1) : W;
  const pts = data.map((v, i) => `${(i * step).toFixed(1)},${(H - (v / max) * H).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-10">
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-primary" vectorEffect="non-scaling-stroke" />
    </svg>
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

  // On mount: recompute today's rollups then load.
  useEffect(() => {
    if (!verified) return;
    (async () => {
      setLoading(true);
      await fetch('/api/admin/analytics', { method: 'POST' }).catch(() => {});
      await load(range);
    })();
    // Live numbers refresh every 30s.
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
  const newUsers = trend.reduce((s, r) => s + (r.new_users || 0), 0);
  const sessions = trend.reduce((s, r) => s + (r.sessions || 0), 0);
  const avgSession = trend.length ? Math.round(trend.reduce((s, r) => s + (r.avg_session_sec || 0), 0) / trend.length) : 0;
  const pagesMax = Math.max(1, ...(data?.pages || []).map(p => p.views));
  const geoMax = Math.max(1, ...(data?.geo || []).map(g => g.users));
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

          {/* Headline stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Active today (DAU)" value={fmt(live.dau)} accent="text-accent-primary" />
            <Stat label="This week (WAU)" value={fmt(live.wau)} />
            <Stat label="This month (MAU)" value={fmt(live.mau)} />
            <Stat label="Total members" value={fmt(live.total_members)} />
            <Stat label={`New (${range}d)`} value={fmt(newUsers)} accent="text-green-400" />
            <Stat label={`Sessions (${range}d)`} value={fmt(sessions)} />
            <Stat label="Avg session" value={avgSession ? `${Math.floor(avgSession / 60)}m ${avgSession % 60}s` : '—'} />
            <Stat label="Stickiness (DAU/MAU)" value={live.mau ? `${Math.round(((live.dau || 0) / live.mau) * 100)}%` : '—'} />
          </div>

          {/* DAU trend */}
          <div className="bg-bg-secondary rounded-xl p-5 border border-border-primary">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-accent-primary" />
              <h2 className="text-sm font-bold text-text-primary">Daily active users — last {range} days</h2>
            </div>
            <Sparkline data={trend.map(t => t.dau)} />
            <div className="flex justify-between text-[10px] text-text-muted mt-1">
              <span>{trend[0]?.day || ''}</span>
              <span>{trend[trend.length - 1]?.day || ''}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Top pages */}
            <div className="bg-bg-secondary rounded-xl p-5 border border-border-primary">
              <div className="flex items-center gap-2 mb-3">
                <MousePointerClick className="w-4 h-4 text-accent-primary" />
                <h2 className="text-sm font-bold text-text-primary">Top pages & screens</h2>
              </div>
              {(data?.pages || []).length === 0 ? (
                <p className="text-xs text-text-muted py-4">No page views recorded yet.</p>
              ) : (
                <div>
                  {(data?.pages || []).slice(0, 12).map(p => (
                    <BarRow key={p.path} label={<span className="font-mono text-xs">{p.path}</span>} value={p.views} max={pagesMax} hint="views" />
                  ))}
                </div>
              )}
            </div>

            {/* Countries */}
            <div className="bg-bg-secondary rounded-xl p-5 border border-border-primary">
              <div className="flex items-center gap-2 mb-3">
                <Globe2 className="w-4 h-4 text-accent-primary" />
                <h2 className="text-sm font-bold text-text-primary">Countries</h2>
              </div>
              {(data?.geo || []).length === 0 ? (
                <p className="text-xs text-text-muted py-4">No geography recorded yet.</p>
              ) : (
                <div>
                  {(data?.geo || []).slice(0, 12).map(g => (
                    <BarRow key={g.country} label={<span>{flagEmoji(g.country)} {countryName(g.country)}</span>} value={g.users} max={geoMax} hint="users" />
                  ))}
                </div>
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
                <div>
                  {(data?.locale || []).slice(0, 12).map(l => (
                    <BarRow key={l.locale} label={langName(l.locale)} value={l.users} max={locMax} hint="users" />
                  ))}
                </div>
              )}
            </div>

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
                  <BarRow label="🌐 Web" value={data!.platforms.web} max={platTotal} />
                  <BarRow label="📱 iOS" value={data!.platforms.ios} max={platTotal} />
                  <BarRow label="🤖 Android" value={data!.platforms.android} max={platTotal} />
                </div>
              )}
            </div>
          </div>

          <p className="text-[11px] text-text-muted text-center">
            Country from IP (never stored) · groups under {data?.kAnon ?? 10} folded into “Other” · live = active in last 5 min
          </p>
        </div>
      )}
    </div>
  );
}
