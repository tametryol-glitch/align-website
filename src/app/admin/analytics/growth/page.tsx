'use client';

// Growth depth: lifecycle states, the L28 power-user curve, activation quality
// and a weekly cohort retention grid.
//
// Aggregate D1/D7/D30 on the Overview tab hides whether RECENT cohorts retain
// better than old ones — which is the only way to know if shipping is working.

import {
  useAdminSection, AccessDenied, SectionHeader, Loading, Card, Stat, StatGrid,
  BarRow, MigrationNotice, fmt, pct,
} from '../_shared';

interface GrowthData {
  power: {
    error?: string;
    total_active?: number; casual_1_3?: number; regular_4_9?: number;
    core_10_20?: number; power_21_plus?: number; median_days?: number; avg_days?: number;
  };
  lifecycle: {
    active?: number; new?: number; resurrected?: number;
    dormant_7d?: number; dormant_30d?: number; churned_90d?: number;
  };
  activation: {
    members?: number; median_hours_to_first_chart?: number;
    has_avatar?: number; has_bio?: number; has_birth_date?: number; has_birth_time?: number;
    birth_time_known_pct?: number; profile_complete_pct?: number;
    email_confirmed?: number; email_unconfirmed?: number; email_confirmed_pct?: number;
    push_reachable?: number; push_reachable_pct?: number;
  };
  cohorts: {
    cohort_week: string; cohort_size: number; week_offset: number;
    retained: number; retained_pct: number;
  }[];
}

function CohortGrid({ rows }: { rows: GrowthData['cohorts'] }) {
  if (!rows.length) {
    return <p className="text-xs text-text-muted py-4 text-center">Cohort data builds forward from launch.</p>;
  }

  const weeks = Array.from(new Set(rows.map((r) => r.cohort_week))).sort().reverse();
  const maxOffset = Math.min(8, Math.max(...rows.map((r) => r.week_offset)));
  const byKey = new Map(rows.map((r) => [`${r.cohort_week}:${r.week_offset}`, r]));

  const shade = (p: number) => {
    if (p >= 60) return 'bg-emerald-500/45 text-emerald-50';
    if (p >= 40) return 'bg-emerald-500/30 text-emerald-100';
    if (p >= 25) return 'bg-amber-500/25 text-amber-100';
    if (p >= 10) return 'bg-amber-500/15 text-amber-200';
    if (p > 0) return 'bg-red-500/15 text-red-200';
    return 'bg-bg-primary text-text-muted';
  };

  return (
    <div className="overflow-x-auto">
      <table className="text-xs border-separate border-spacing-0.5">
        <thead>
          <tr className="text-text-muted text-[10px] uppercase tracking-wider">
            <th className="text-left font-medium pr-3 pb-1">Cohort</th>
            <th className="text-right font-medium pr-3 pb-1">Size</th>
            {Array.from({ length: maxOffset + 1 }, (_, i) => (
              <th key={i} className="font-medium px-1 pb-1 w-11">W{i}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((w) => {
            const size = rows.find((r) => r.cohort_week === w)?.cohort_size ?? 0;
            return (
              <tr key={w}>
                <td className="text-text-primary pr-3 whitespace-nowrap">
                  {new Date(w).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </td>
                <td className="text-text-muted text-right pr-3 tabular-nums">{fmt(size)}</td>
                {Array.from({ length: maxOffset + 1 }, (_, i) => {
                  const cell = byKey.get(`${w}:${i}`);
                  return (
                    <td
                      key={i}
                      className={`text-center tabular-nums rounded px-1 py-1 ${cell ? shade(cell.retained_pct) : 'bg-transparent'}`}
                    >
                      {cell ? `${Math.round(cell.retained_pct)}%` : ''}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function GrowthAnalyticsPage() {
  const { allowed, data, range, setRange, loading, refreshing, refresh } =
    useAdminSection<GrowthData>('growth');

  if (!allowed) return <AccessDenied />;

  const pw = data?.power || {};
  const lc = data?.lifecycle || {};
  const ac = data?.activation || {};
  const pwMax = Math.max(1, pw.casual_1_3 ?? 0, pw.regular_4_9 ?? 0, pw.core_10_20 ?? 0, pw.power_21_plus ?? 0);

  return (
    <div className="max-w-6xl mx-auto pb-16">
      <SectionHeader
        title="Growth depth"
        subtitle="Lifecycle states, the power-user curve, activation quality, and whether newer cohorts retain better than older ones."
        range={range} setRange={setRange} refresh={refresh} refreshing={refreshing}
      />

      {loading && !data ? <Loading /> : (
        <div className="space-y-4">
          {pw.error && <MigrationNotice file="supabase-migration-analytics-phase6-growth-money.sql" />}

          <Card
            title="Lifecycle"
            hint="Resurrected and dormant are the two states no other card shows, and they are where recoverable users sit."
          >
            <StatGrid>
              <Stat label="Active" value={fmt(lc.active)} tone="accent" />
              <Stat label="New" value={fmt(lc.new)} tone="good" />
              <Stat label="Resurrected" value={fmt(lc.resurrected)} sub="back after 30+ quiet days" tone="good" />
              <Stat label="Dormant 7d" value={fmt(lc.dormant_7d)} tone="warn" />
              <Stat label="Dormant 30d" value={fmt(lc.dormant_30d)} tone="warn" />
              <Stat label="Churned 90d+" value={fmt(lc.churned_90d)} tone="bad" />
            </StatGrid>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card
              title="Power-user curve (L28)"
              hint="Days active out of the last 28. Splits casual from core, and shows whether the core is thickening over time."
            >
              <div className="space-y-2.5">
                <BarRow label="Casual (1–3 days)" value={pw.casual_1_3 ?? 0} max={pwMax} />
                <BarRow label="Regular (4–9 days)" value={pw.regular_4_9 ?? 0} max={pwMax} />
                <BarRow label="Core (10–20 days)" value={pw.core_10_20 ?? 0} max={pwMax} />
                <BarRow label="Power (21+ days)" value={pw.power_21_plus ?? 0} max={pwMax} />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Stat label="Median days active" value={pw.median_days ?? '—'} />
                <Stat label="Total active (28d)" value={fmt(pw.total_active)} />
              </div>
            </Card>

            <Card
              title="Activation quality"
              hint="How fast people reach value and how complete their data is. Unconfirmed emails can never log back in — every one is a lost signup."
            >
              <StatGrid>
                <Stat
                  label="Median time to chart"
                  value={ac.median_hours_to_first_chart != null ? `${ac.median_hours_to_first_chart}h` : '—'}
                />
                <Stat
                  label="Email confirmed"
                  value={pct(ac.email_confirmed_pct)}
                  sub={`${fmt(ac.email_unconfirmed)} never confirmed`}
                  tone={(ac.email_confirmed_pct ?? 100) < 80 ? 'bad' : 'good'}
                />
                <Stat
                  label="Birth time known"
                  value={pct(ac.birth_time_known_pct)}
                  sub="drives interpretation accuracy"
                  tone={(ac.birth_time_known_pct ?? 0) < 50 ? 'warn' : 'good'}
                />
                <Stat label="Has avatar" value={pct(ac.profile_complete_pct)} />
                <Stat
                  label="Push reachable"
                  value={pct(ac.push_reachable_pct)}
                  sub={`${fmt(ac.push_reachable)} of ${fmt(ac.members)}`}
                  tone={(ac.push_reachable_pct ?? 0) < 40 ? 'warn' : 'good'}
                />
                <Stat label="Has birth date" value={fmt(ac.has_birth_date)} />
              </StatGrid>
            </Card>
          </div>

          <Card
            title="Weekly cohort retention"
            hint="Each row is a signup week; each column is weeks since. Read down a column to see whether newer cohorts hold better than older ones — that is the real test of whether the product is improving."
          >
            <CohortGrid rows={data?.cohorts || []} />
          </Card>
        </div>
      )}
    </div>
  );
}
