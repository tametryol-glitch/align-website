'use client';

// Trust & safety. Reports were being collected into three separate tables with
// no queue view, no SLA and no time-to-resolution anywhere in the admin panel.
// With a dating surface and 20 locales this is an obligation, not a nice-to-have.

import {
  useAdminSection, AccessDenied, SectionHeader, Loading, Card, Stat, StatGrid,
  BarRow, Table, MigrationNotice, fmt, pct,
} from '../_shared';

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
}

export default function SafetyAnalyticsPage() {
  const { allowed, data, range, setRange, loading, refreshing, refresh } =
    useAdminSection<SafetyData>('safety');

  if (!allowed) return <AccessDenied />;

  const m = data?.metrics || {};
  const catMax = Math.max(1, ...(m.reports_by_category || []).map((c) => c.count));

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
              hint="Birth dates are collected, so this is exact rather than inferred. With dating and messaging in the product, minors on the platform are a regulatory issue — not a metric footnote."
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
            hint="Oldest unhandled reports first. This is the actual list to work through."
          >
            <Table
              headers={['Age', 'Source', 'Category', 'Status', 'Reported user', 'Filed']}
              rows={(data?.queue || []).map((r) => [
                <span key="a" className={r.age_hours > 48 ? 'text-red-400' : r.age_hours > 24 ? 'text-amber-400' : ''}>
                  {Math.round(r.age_hours)}h
                </span>,
                r.source,
                r.category || '—',
                r.status,
                r.target_name || '—',
                new Date(r.created_at).toLocaleDateString(),
              ])}
              empty="Queue is clear."
            />
          </Card>
        </div>
      )}
    </div>
  );
}
