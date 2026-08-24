'use client';

// Trust & safety. Reports were being collected into three separate tables with
// no way to act on them — the oldest open report was 34 days old and nothing
// had ever been resolved, because no button existed that could.

import { useState } from 'react';
import {
  useAdminSection, AccessDenied, SectionHeader, Loading, Card, Stat, StatGrid,
  BarRow, Table, MigrationNotice, fmt, pct,
} from '../_shared';
import { Check, X, Eye, Loader2 } from 'lucide-react';

interface SafetyData {
  metrics: {
    error?: string;
    reports_open?: number; reports_new?: number; reports_resolved?: number;
    oldest_open_hours?: number; median_resolution_hours?: number;
    reports_by_category?: { category: string; count: number }[];
    repeat_offenders?: number; blocks_new?: number; bans_new?: number;
    photo_verifications_pending?: number; photo_verification_approval_pct?: number;
    accounts_under_18?: number; accounts_under_13?: number;
  };
  queue: {
    source: string; report_id: string; category: string; status: string;
    created_at: string; age_hours: number; target_name: string;
  }[];
  suspectBirthDates?: {
    user_id: string; display_name: string; birth_date: string; reason: string;
  }[];
}

export default function SafetyAnalyticsPage() {
  const { allowed, data, range, setRange, loading, refreshing, refresh } =
    useAdminSection<SafetyData>('safety');
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());

  if (!allowed) return <AccessDenied />;

  const m = data?.metrics || {};
  const catMax = Math.max(1, ...(m.reports_by_category || []).map((c) => c.count));

  async function act(source: string, reportId: string, action: 'resolve' | 'dismiss' | 'reviewing') {
    setBusy(reportId);
    try {
      const res = await fetch('/api/admin/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, report_id: reportId, action }),
      });
      if (res.ok && action !== 'reviewing') {
        setDone((prev) => new Set(prev).add(reportId));
      }
      await refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto pb-16">
      <SectionHeader
        title="Trust & safety"
        subtitle="Queue depth, resolution SLA and the integrity signals a platform with messaging and dating is expected to watch."
        range={range} setRange={setRange} refresh={refresh} refreshing={refreshing}
      />

      {loading && !data ? <Loading /> : (
        <div className="space-y-4">
          {m.error && <MigrationNotice file="supabase-migration-analytics-phase5-product.sql" />}

          <Card
            title="Moderation queue"
            hint="Open reports across reports, reel_reports and community_reports. If nobody watches this, reports silently rot."
          >
            <StatGrid>
              <Stat
                label="Open reports"
                value={fmt(m.reports_open)}
                tone={(m.reports_open ?? 0) > 25 ? 'bad' : (m.reports_open ?? 0) > 5 ? 'warn' : 'good'}
              />
              <Stat
                label="Oldest unhandled"
                value={m.oldest_open_hours != null ? `${Math.round(m.oldest_open_hours)}h` : '—'}
                tone={(m.oldest_open_hours ?? 0) > 48 ? 'bad' : (m.oldest_open_hours ?? 0) > 24 ? 'warn' : 'good'}
              />
              <Stat
                label="Median resolution"
                value={m.median_resolution_hours != null ? `${Math.round(m.median_resolution_hours)}h` : '—'}
              />
              <Stat label="New in range" value={fmt(m.reports_new)} />
              <Stat label="Resolved in range" value={fmt(m.reports_resolved)} />
              <Stat
                label="Repeat offenders"
                value={fmt(m.repeat_offenders)}
                sub="reported 2+ times"
                tone={(m.repeat_offenders ?? 0) > 0 ? 'warn' : 'default'}
              />
              <Stat label="New blocks" value={fmt(m.blocks_new)} />
              <Stat label="New bans" value={fmt(m.bans_new)} />
            </StatGrid>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card title="Reports by category" hint="What people are actually reporting.">
              <div className="space-y-2.5">
                {(m.reports_by_category || []).map((c) => (
                  <BarRow key={c.category} label={c.category} value={c.count} max={catMax} />
                ))}
                {!(m.reports_by_category || []).length && (
                  <p className="text-xs text-text-muted py-3 text-center">No reports in range.</p>
                )}
              </div>
            </Card>

            <Card
              title="Age signals"
              hint="Birth dates are collected, so this is exact. Note that a birth year in the future is a data-entry artifact, not a real minor — the review list below separates the two."
            >
              <StatGrid>
                <Stat
                  label="Accounts under 18"
                  value={fmt(m.accounts_under_18)}
                  tone={(m.accounts_under_18 ?? 0) > 0 ? 'warn' : 'good'}
                />
                <Stat
                  label="Accounts under 13"
                  value={fmt(m.accounts_under_13)}
                  sub="COPPA threshold"
                  tone={(m.accounts_under_13 ?? 0) > 0 ? 'bad' : 'good'}
                />
                <Stat label="Verifications pending" value={fmt(m.photo_verifications_pending)} />
                <Stat label="Verification approval" value={pct(m.photo_verification_approval_pct)} />
              </StatGrid>
            </Card>
          </div>

          <Card
            title="Work queue"
            hint="Oldest unhandled reports first. Resolve marks it handled; dismiss marks it not actionable. Both are recorded in the admin audit log."
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-text-muted">
                    {['Age', 'Source', 'Category', 'Status', 'Reported user', 'Action'].map((h) => (
                      <th key={h} className="font-medium uppercase tracking-wider text-[10px] pb-2 pr-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-text-primary">
                  {(data?.queue || []).map((r) => {
                    const handled = done.has(r.report_id);
                    return (
                      <tr key={r.report_id} className={`border-t border-border-primary/60 ${handled ? 'opacity-40' : ''}`}>
                        <td className={`py-2 pr-3 tabular-nums whitespace-nowrap ${r.age_hours > 48 ? 'text-red-400' : r.age_hours > 24 ? 'text-amber-400' : ''}`}>
                          {Math.round(r.age_hours)}h
                        </td>
                        <td className="py-2 pr-3 whitespace-nowrap">{r.source}</td>
                        <td className="py-2 pr-3 whitespace-nowrap">{r.category || '—'}</td>
                        <td className="py-2 pr-3 whitespace-nowrap">{handled ? 'resolved' : r.status}</td>
                        <td className="py-2 pr-3 whitespace-nowrap">{r.target_name || '—'}</td>
                        <td className="py-2 pr-3 whitespace-nowrap">
                          {handled ? (
                            <span className="text-emerald-400">done</span>
                          ) : busy === r.report_id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-text-muted" />
                          ) : (
                            <span className="flex items-center gap-1">
                              <button
                                onClick={() => act(r.source, r.report_id, 'reviewing')}
                                className="p-1 rounded text-text-muted hover:text-accent-primary transition-colors"
                                title="Mark as under review"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => act(r.source, r.report_id, 'resolve')}
                                className="p-1 rounded text-text-muted hover:text-emerald-400 transition-colors"
                                title="Resolve — action taken"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => act(r.source, r.report_id, 'dismiss')}
                                className="p-1 rounded text-text-muted hover:text-red-400 transition-colors"
                                title="Dismiss — not actionable"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!(data?.queue || []).length && (
                <p className="text-xs text-text-muted py-4 text-center">Queue is clear.</p>
              )}
            </div>
          </Card>

          <Card
            title="Birth dates to review"
            hint="Accounts whose birth date implies a minor, or is impossible. A future birth year is bad data, not a child — new signups can no longer save one."
          >
            <Table
              headers={['Member', 'Birth date', 'Why flagged']}
              rows={(data?.suspectBirthDates || []).map((s) => [
                s.display_name || '—',
                s.birth_date,
                <span
                  key="r"
                  className={
                    s.reason === 'future date' ? 'text-text-muted'
                      : s.reason === 'implies under 13' ? 'text-red-400' : 'text-amber-400'
                  }
                >
                  {s.reason}
                </span>,
              ])}
              empty="Nothing to review."
            />
          </Card>
        </div>
      )}
    </div>
  );
}
