'use client';

// Monetization: exact revenue from the RevenueCat webhook feed, the paywall
// funnel, churn split by voluntary vs involuntary, and unit economics.
//
// The Overview tab's MRR is an ESTIMATE (paid × $9). Everything here is real,
// sourced from public.revenue_events.

import {
  useAdminSection, AccessDenied, SectionHeader, Loading, Card, Stat, StatGrid,
  BarRow, Table, fmt, pct, money,
} from '../_shared';

interface MoneyData {
  exact: {
    error?: string; hint?: string;
    events?: number; gross_cents?: number; refund_cents?: number; net_cents?: number;
    new_purchases?: number; renewals?: number; cancellations?: number; expirations?: number;
    billing_issues?: number; refunds?: number; product_changes?: number;
    paying_users?: number; unprocessed?: number; processing_errors?: number;
    voluntary_churn?: number; involuntary_churn?: number;
    plan_mix?: { product_id: string; purchases: number; revenue_cents: number }[];
  };
  mrrTrend: {
    month: string; new_cents: number; renewal_cents: number; refund_cents: number;
    net_cents: number; new_customers: number; churned_customers: number;
  }[];
  paywall: {
    paywall_shown?: number; unique_viewers?: number; checkout_started?: number; purchased?: number;
    shown_to_checkout_pct?: number; checkout_to_paid_pct?: number; overall_pct?: number;
    by_feature?: { feature: string; shown: number; purchased: number; conversion_pct: number | null }[];
  };
  unitEconomics: {
    revenue_cents?: number; infra_cost_cents?: number; creator_payout_cents?: number;
    gross_margin_cents?: number; gross_margin_pct?: number; active_users?: number;
    cost_per_active_cents?: number; revenue_per_active_cents?: number;
    cost_by_service?: { service: string; cost_cents: number }[];
    cost_by_operation?: { operation: string; cost_cents: number; calls: number }[];
  };
  churnRisk: {
    user_id: string; display_name: string; email: string;
    last_seen: string | null; days_quiet: number | null;
  }[];
}

export default function MoneyAnalyticsPage() {
  const { allowed, data, range, setRange, loading, refreshing, refresh } =
    useAdminSection<MoneyData>('money');

  if (!allowed) return <AccessDenied />;

  const e = data?.exact || {};
  const p = data?.paywall || {};
  const u = data?.unitEconomics || {};
  const featMax = Math.max(1, ...(p.by_feature || []).map((f) => f.shown));
  const svcMax = Math.max(1, ...(u.cost_by_service || []).map((s) => s.cost_cents));
  const webhookMissing = e.error === 'revenue_events_missing';

  return (
    <div className="max-w-6xl mx-auto pb-16">
      <SectionHeader
        title="Money"
        subtitle="Exact revenue from the RevenueCat webhook, the paywall funnel, churn split by cause, and what it actually costs to serve a user."
        range={range} setRange={setRange} refresh={refresh} refreshing={refreshing}
      />

      {loading && !data ? <Loading /> : (
        <div className="space-y-4">
          {webhookMissing && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <h2 className="text-sm font-bold text-amber-300">No revenue events yet</h2>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                The webhook handler exists at <code className="text-amber-300">align-api-v2/app/routers/revenuecat_webhook.py</code>,
                but no events have arrived. Point the RevenueCat dashboard&apos;s webhook at that endpoint
                and these numbers become exact instead of estimated.
              </p>
            </div>
          )}

          <Card title="Revenue" hint="Real money, from the event stream — not the paid-count estimate on the Overview tab.">
            <StatGrid>
              <Stat label="Net revenue" value={money(e.net_cents)} tone="good" />
              <Stat label="Gross" value={money(e.gross_cents)} />
              <Stat label="Refunds" value={money(e.refund_cents)} tone={(e.refund_cents ?? 0) > 0 ? 'warn' : 'default'} />
              <Stat label="Paying users" value={fmt(e.paying_users)} />
              <Stat label="New purchases" value={fmt(e.new_purchases)} tone="accent" />
              <Stat label="Renewals" value={fmt(e.renewals)} />
              <Stat label="Plan changes" value={fmt(e.product_changes)} />
              <Stat label="Events processed" value={fmt(e.events)} sub={`${fmt(e.unprocessed)} pending`} />
            </StatGrid>
          </Card>

          <Card
            title="Churn, split by cause"
            hint="Voluntary churn (cancelled, expired) and involuntary churn (billing failure) need completely different fixes. Involuntary is usually 20–40% of all churn and the easiest to win back."
          >
            <StatGrid>
              <Stat
                label="Voluntary churn"
                value={fmt(e.voluntary_churn)}
                sub="cancelled + expired"
                tone={(e.voluntary_churn ?? 0) > 0 ? 'warn' : 'default'}
              />
              <Stat
                label="Involuntary churn"
                value={fmt(e.involuntary_churn)}
                sub="billing failure — recoverable"
                tone={(e.involuntary_churn ?? 0) > 0 ? 'bad' : 'default'}
              />
              <Stat label="Cancellations" value={fmt(e.cancellations)} />
              <Stat label="Refund events" value={fmt(e.refunds)} />
            </StatGrid>
          </Card>

          <Card title="Monthly trend" hint="Six months of new versus renewal revenue and customer churn.">
            <Table
              headers={['Month', 'New', 'Renewals', 'Refunds', 'Net', 'New customers', 'Churned']}
              rows={(data?.mrrTrend || []).map((r) => [
                new Date(r.month).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }),
                money(r.new_cents),
                money(r.renewal_cents),
                money(r.refund_cents),
                money(r.net_cents),
                fmt(r.new_customers),
                fmt(r.churned_customers),
              ])}
              empty="No revenue events recorded yet."
            />
          </Card>

          <Card
            title="Paywall funnel"
            hint="Shown → checkout → purchased. The by-feature split answers the question that decides your roadmap: what were people actually trying to do when they hit the wall?"
          >
            <StatGrid>
              <Stat label="Paywall shown" value={fmt(p.paywall_shown)} />
              <Stat label="Checkout started" value={fmt(p.checkout_started)} sub={pct(p.shown_to_checkout_pct)} />
              <Stat label="Purchased" value={fmt(p.purchased)} sub={pct(p.checkout_to_paid_pct)} tone="good" />
              <Stat label="Overall conversion" value={pct(p.overall_pct)} tone="accent" />
            </StatGrid>
            <div className="mt-4 space-y-2.5">
              {(p.by_feature || []).slice(0, 12).map((f) => (
                <BarRow
                  key={f.feature}
                  label={`${f.feature} — ${f.purchased} of ${f.shown}${f.conversion_pct != null ? ` (${f.conversion_pct}%)` : ''}`}
                  value={f.shown}
                  max={featMax}
                />
              ))}
              {!(p.by_feature || []).length && (
                <p className="text-xs text-text-muted py-3 text-center">
                  Populates once a build with paywall instrumentation ships.
                </p>
              )}
            </div>
          </Card>

          <Card
            title="Unit economics"
            hint="Revenue in, cost of goods out. Infra cost fills in once producers write to analytics_cost_events — Claude API calls, TTS minutes, render minutes, storage egress."
          >
            <StatGrid>
              <Stat label="Revenue" value={money(u.revenue_cents)} />
              <Stat label="Infra cost" value={money(u.infra_cost_cents)} />
              <Stat label="Creator payouts" value={money(u.creator_payout_cents)} />
              <Stat
                label="Gross margin"
                value={money(u.gross_margin_cents)}
                sub={pct(u.gross_margin_pct)}
                tone={(u.gross_margin_pct ?? 100) < 50 ? 'bad' : 'good'}
              />
              <Stat label="Cost per active user" value={money(u.cost_per_active_cents)} />
              <Stat label="Revenue per active user" value={money(u.revenue_per_active_cents)} />
              <Stat label="Active users" value={fmt(u.active_users)} />
            </StatGrid>
            {!!(u.cost_by_service || []).length && (
              <div className="mt-4 space-y-2.5">
                {(u.cost_by_service || []).map((s) => (
                  <BarRow key={s.service} label={s.service} value={s.cost_cents} max={svcMax} suffix="¢" />
                ))}
              </div>
            )}
          </Card>

          <Card
            title="Churn risk"
            hint="Paying subscribers who have not opened the app in 14+ days. The highest-value list in the product: they are still being charged and are about to notice."
          >
            <Table
              headers={['Member', 'Email', 'Last seen', 'Days quiet']}
              rows={(data?.churnRisk || []).map((r) => [
                r.display_name || '—',
                <span key="e" className="text-text-muted">{r.email || '—'}</span>,
                r.last_seen ? new Date(r.last_seen).toLocaleDateString() : 'never',
                <span key="d" className={(r.days_quiet ?? 0) > 30 ? 'text-red-400' : 'text-amber-400'}>
                  {r.days_quiet ?? '—'}
                </span>,
              ])}
              empty="No quiet subscribers. Good sign."
            />
          </Card>
        </div>
      )}
    </div>
  );
}
