'use client';

// Shared building blocks for the Analytics tabs (Phases 5–7).
// The original overview page keeps its own local components; everything added
// after it uses these so the tabs stay visually consistent and each new page
// stays short.

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { createClient } from '@/lib/supabase';
import { Shield, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';

// ── Formatting ───────────────────────────────────────────────────────────────

export const fmt = (n: number | null | undefined) =>
  n === null || n === undefined ? '—' : n.toLocaleString();

export const pct = (n: number | null | undefined) =>
  n === null || n === undefined ? '—' : `${n}%`;

export const money = (cents: number | null | undefined) =>
  cents === null || cents === undefined
    ? '—'
    : `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const duration = (mins: number | null | undefined) => {
  if (mins === null || mins === undefined) return '—';
  if (mins < 60) return `${Math.round(mins)}m`;
  if (mins < 1440) return `${Math.round(mins / 60)}h`;
  return `${Math.round(mins / 1440)}d`;
};

// ── Admin gate + sectioned data loading ──────────────────────────────────────

export function useAdminSection<T = Record<string, unknown>>(section: string) {
  const { profile } = useAuthStore();
  const [verified, setVerified] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [range, setRange] = useState<7 | 30>(7);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    async function verify() {
      if (!profile?.is_admin) return;
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: row } = await supabase
        .from('profiles').select('is_admin').eq('id', user.id).single();
      if (row?.is_admin) setVerified(true);
    }
    verify();
  }, [profile]);

  const load = useCallback(async (r: number) => {
    try {
      const res = await fetch(`/api/admin/analytics?section=${section}&range=${r}`);
      if (res.ok) setData(await res.json());
    } catch {
      /* leave previous data in place */
    }
    setLoading(false);
  }, [section]);

  useEffect(() => {
    if (!verified) return;
    setLoading(true);
    load(range);
  }, [verified, range, load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load(range);
    setRefreshing(false);
  }, [load, range]);

  const allowed = !!profile?.is_admin && verified;
  return { allowed, data, range, setRange, loading, refreshing, refresh };
}

// ── Chrome ───────────────────────────────────────────────────────────────────

const TABS = [
  { href: '/admin/analytics',              label: 'Overview' },
  { href: '/admin/analytics/growth',       label: 'Growth' },
  { href: '/admin/analytics/content',      label: 'Content' },
  { href: '/admin/analytics/social',       label: 'Social' },
  { href: '/admin/analytics/money',        label: 'Money' },
  { href: '/admin/analytics/safety',       label: 'Safety' },
  { href: '/admin/analytics/tech',         label: 'Tech' },
  { href: '/admin/analytics/systems',      label: 'Systems' },
];

export function AnalyticsTabs() {
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              active
                ? 'bg-accent-primary/15 text-accent-primary border border-accent-primary/30'
                : 'text-text-muted hover:text-text-primary border border-transparent'
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

export function AccessDenied() {
  return (
    <div className="max-w-3xl mx-auto text-center py-20">
      <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <h1 className="text-xl font-bold text-text-primary">Access Denied</h1>
      <p className="text-text-muted text-sm mt-2">Admin privileges required.</p>
    </div>
  );
}

export function SectionHeader({
  title, subtitle, range, setRange, refresh, refreshing,
}: {
  title: string;
  subtitle: string;
  range: 7 | 30;
  setRange: (r: 7 | 30) => void;
  refresh: () => void;
  refreshing: boolean;
}) {
  return (
    <div className="space-y-3 mb-6">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary">
        <ArrowLeft className="w-3.5 h-3.5" /> Admin
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">{title}</h1>
          <p className="text-xs text-text-muted mt-0.5 max-w-2xl">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {([7, 30] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                range === r
                  ? 'bg-accent-primary/15 text-accent-primary border border-accent-primary/30'
                  : 'text-text-muted border border-border-primary hover:text-text-primary'
              }`}
            >
              {r}d
            </button>
          ))}
          <button
            onClick={refresh}
            className="p-1.5 rounded-lg border border-border-primary text-text-muted hover:text-text-primary transition-colors"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      <AnalyticsTabs />
    </div>
  );
}

export function Loading() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-6 h-6 text-accent-primary animate-spin" />
    </div>
  );
}

// ── Primitives ───────────────────────────────────────────────────────────────

export function Card({
  title, hint, children, className = '',
}: {
  title?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-border-primary bg-bg-secondary p-4 ${className}`}>
      {title && (
        <div className="mb-3">
          <h2 className="text-sm font-bold text-text-primary">{title}</h2>
          {hint && <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">{hint}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

export function Stat({
  label, value, sub, tone = 'default',
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: 'default' | 'good' | 'warn' | 'bad' | 'accent';
}) {
  const toneClass = {
    default: 'text-text-primary',
    good: 'text-emerald-400',
    warn: 'text-amber-400',
    bad: 'text-red-400',
    accent: 'text-accent-primary',
  }[tone];
  return (
    <div className="rounded-lg border border-border-primary bg-bg-primary px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-text-muted">{label}</div>
      <div className={`text-lg font-bold tabular-nums mt-0.5 ${toneClass}`}>{value}</div>
      {sub && <div className="text-[10px] text-text-muted mt-0.5">{sub}</div>}
    </div>
  );
}

export function StatGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 md:grid-cols-4 gap-2">{children}</div>;
}

export function BarRow({
  label, value, max, suffix,
}: {
  label: string;
  value: number;
  max: number;
  suffix?: string;
}) {
  const w = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-primary truncate pr-2">{label}</span>
        <span className="text-text-muted tabular-nums flex-shrink-0">
          {fmt(value)}{suffix || ''}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-bg-primary overflow-hidden">
        <div className="h-full bg-accent-primary/70 rounded-full" style={{ width: `${w}%` }} />
      </div>
    </div>
  );
}

export function Table({
  headers, rows, empty = 'Nothing to show yet.',
}: {
  headers: string[];
  rows: (string | number | React.ReactNode)[][];
  empty?: string;
}) {
  if (!rows.length) {
    return <p className="text-xs text-text-muted py-4 text-center">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-text-muted">
            {headers.map((h) => (
              <th key={h} className="font-medium uppercase tracking-wider text-[10px] pb-2 pr-3 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-text-primary">
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border-primary/60">
              {r.map((c, j) => (
                <td key={j} className="py-2 pr-3 tabular-nums whitespace-nowrap">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Shown when a section's SQL functions have not been applied yet. */
export function MigrationNotice({ file }: { file: string }) {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
      <h2 className="text-sm font-bold text-amber-300">Migration not applied yet</h2>
      <p className="text-xs text-text-muted mt-1 leading-relaxed">
        This tab needs <code className="text-amber-300">{file}</code> to be run in the
        Supabase SQL editor. Until then the numbers below stay empty.
      </p>
    </div>
  );
}
