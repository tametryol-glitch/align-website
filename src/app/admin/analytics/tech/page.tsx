'use client';

// Technical health + notifications.
// app_version has been collected on every session since Phase 1 and never
// displayed, so "what percent of users are on the latest build" has been one
// query away and unanswerable at a glance. Push has been sent and never measured.

import {
  useAdminSection, AccessDenied, SectionHeader, Loading, Card, Stat, StatGrid,
  BarRow, Table, fmt, pct,
} from '../_shared';

interface TechData {
  health: {
    error?: string;
    sessions?: number; client_errors?: number; crashes?: number;
    crash_free_session_pct?: number; errors_per_session?: number;
    uploads_ok?: number; uploads_failed?: number; upload_success_pct?: number;
    renders_ok?: number; renders_failed?: number; render_success_pct?: number;
    perf?: { operation: string; samples: number; p50_ms: number; p95_ms: number; p99_ms: number }[];
    top_errors?: { message: string; count: number }[];
  };
  versions: { platform: string; app_version: string; users: number; sessions: number; share_pct: number }[];
  push: {
    sent?: number; failed?: number; recipients?: number; opened?: number; open_rate_pct?: number;
    active_devices?: number; stale_devices?: number; members?: number; reach_pct?: number;
    sends_per_user_per_day?: number;
    opens_by_type?: { type: string; opens: number }[];
  };
}

export default function TechAnalyticsPage() {
  const { allowed, data, range, setRange, loading, refreshing, refresh } =
    useAdminSection<TechData>('tech');

  if (!allowed) return <AccessDenied />;

  const h = data?.health || {};
  const p = data?.push || {};
  const typeMax = Math.max(1, ...(p.opens_by_type || []).map((t) => t.opens));

  return (
    <div className="max-w-6xl mx-auto pb-16">
      <SectionHeader
        title="Technical health & notifications"
        subtitle="Errors, latency percentiles, upload and render success, version adoption, and how push actually performs."
        range={range} setRange={setRange} refresh={refresh} refreshing={refreshing}
      />

      {loading && !data ? <Loading /> : (
        <div className="space-y-4">
          <Card title="Reliability" hint="Fatal crashes still go to Sentry; these are the client-reported signals.">
            <StatGrid>
              <Stat
                label="Crash-free sessions"
                value={pct(h.crash_free_session_pct)}
                tone={(h.crash_free_session_pct ?? 100) < 99 ? 'bad' : 'good'}
              />
              <Stat label="Client errors" value={fmt(h.client_errors)} />
              <Stat label="Errors per session" value={h.errors_per_session ?? '—'} />
              <Stat label="Sessions" value={fmt(h.sessions)} />
              <Stat
                label="Upload success"
                value={pct(h.upload_success_pct)}
                sub={`${fmt(h.uploads_failed)} failed`}
                tone={(h.upload_success_pct ?? 100) < 95 ? 'bad' : 'good'}
              />
              <Stat
                label="Render success"
                value={pct(h.render_success_pct)}
                sub={`${fmt(h.renders_failed)} failed`}
                tone={(h.render_success_pct ?? 100) < 95 ? 'warn' : 'good'}
              />
            </StatGrid>
          </Card>

          <Card
            title="Latency"
            hint="p50 / p95 / p99 per traced operation. Averages hide the users who are actually suffering — watch p95. Web vitals (LCP, INP, CLS) appear here too."
          >
            <Table
              headers={['Operation', 'Samples', 'p50', 'p95', 'p99']}
              rows={(h.perf || []).map((r) => [
                r.operation,
                fmt(r.samples),
                `${fmt(r.p50_ms)}ms`,
                <span key="p95" className={r.p95_ms > 2500 ? 'text-amber-400' : ''}>{fmt(r.p95_ms)}ms</span>,
                <span key="p99" className={r.p99_ms > 5000 ? 'text-red-400' : ''}>{fmt(r.p99_ms)}ms</span>,
              ])}
              empty="No timing samples in range."
            />
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card title="Top errors" hint="Grouped by message. Fix from the top down.">
              <Table
                headers={['Message', 'Count']}
                rows={(h.top_errors || []).map((e) => [
                  <span key="m" className="text-text-muted">{e.message}</span>,
                  fmt(e.count),
                ])}
                empty="No errors reported. "
              />
            </Card>

            <Card
              title="Version adoption"
              hint="Who is on which build. A stuck old version means a fix you shipped is not actually reaching people."
            >
              <Table
                headers={['Platform', 'Version', 'Users', 'Share']}
                rows={(data?.versions || []).slice(0, 15).map((v) => [
                  v.platform,
                  v.app_version,
                  fmt(v.users),
                  `${v.share_pct}%`,
                ])}
                empty="No sessions in range."
              />
            </Card>
          </div>

          <Card
            title="Push notifications"
            hint="Sends come from push_notification_log, which has been written all along. Opens come from the push_opened event added in this pass — they populate with the next mobile build."
          >
            <StatGrid>
              <Stat label="Sent" value={fmt(p.sent)} />
              <Stat label="Failed" value={fmt(p.failed)} tone={(p.failed ?? 0) > 0 ? 'warn' : 'default'} />
              <Stat label="Opened" value={fmt(p.opened)} />
              <Stat
                label="Open rate"
                value={pct(p.open_rate_pct)}
                tone={(p.open_rate_pct ?? 0) < 5 ? 'warn' : 'good'}
              />
              <Stat label="Recipients" value={fmt(p.recipients)} />
              <Stat
                label="Reachable"
                value={pct(p.reach_pct)}
                sub={`${fmt(p.active_devices)} devices`}
              />
              <Stat
                label="Stale tokens"
                value={fmt(p.stale_devices)}
                sub="unseen 60+ days"
                tone={(p.stale_devices ?? 0) > 0 ? 'warn' : 'default'}
              />
              <Stat
                label="Sends per user/day"
                value={p.sends_per_user_per_day ?? '—'}
                sub="watch for fatigue"
                tone={(p.sends_per_user_per_day ?? 0) > 3 ? 'bad' : 'default'}
              />
            </StatGrid>
            {!!(p.opens_by_type || []).length && (
              <div className="mt-4 space-y-2.5">
                {(p.opens_by_type || []).map((t) => (
                  <BarRow key={t.type} label={t.type} value={t.opens} max={typeMax} />
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
