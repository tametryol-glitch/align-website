'use client';

/**
 * AffiliateDashboardView — the presentational body of the affiliate dashboard.
 *
 * Rendered in two places so both show EXACTLY the same thing:
 *  - /affiliates/dashboard  (the affiliate, viewing their own data)
 *  - /admin (Affiliates tab) (an admin, viewing a specific affiliate's data)
 *
 * It is purely presentational: it takes the affiliate record + conversions +
 * clicks + payouts as props and renders them. All data loading / auth lives in
 * the parent. Copy buttons still work (harmless for an admin previewing).
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface AffiliateData {
  id: string;
  name: string;
  email: string;
  affiliate_code: string;
  affiliate_link: string;
  status: string;
  commission_rate_bps: number;
  total_clicks: number;
  total_signups: number;
  total_conversions: number;
  total_earnings_cents: number;
  total_paid_cents: number;
  unpaid_cents: number;
  recent_clicks_30d: number;
  recent_conversions_30d: number;
  conversion_rate: number;
  created_at: string;
  // Derived metrics (optional — dashboard degrades gracefully if absent)
  epc_cents?: number;
  payout_threshold_cents?: number;
  reached_threshold?: boolean;
  next_payout_date?: string;
  pending_cents?: number;
  reversed_cents?: number;
  reversed_count?: number;
  active_referrals?: number;
  lifetime_customers?: number;
  churned_customers?: number;
  est_mrr_cents?: number;
}

export interface Conversion {
  id: string;
  conversion_type: string;
  revenue_cents: number;
  commission_cents: number;
  source: string;
  status: string;
  created_at: string;
}

export interface Click {
  id: string;
  clicked_at: string;
  country: string | null;
  referrer_url: string | null;
  landing_page: string | null;
  converted: boolean;
}

export interface Payout {
  id: string;
  amount_cents: number;
  method: string;
  status: string;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
  completed_at: string | null;
}

export default function AffiliateDashboardView({
  affiliate,
  conversions,
  clicks,
  payouts,
}: {
  affiliate: AffiliateData;
  conversions: Conversion[];
  clicks: Click[];
  payouts: Payout[];
}) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'overview' | 'conversions' | 'clicks' | 'payouts' | 'promote'>('overview');
  const [copied, setCopied] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  function copyLink() {
    if (affiliate?.affiliate_link) {
      navigator.clipboard.writeText(affiliate.affiliate_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function centsToUSD(cents: number): string {
    return `$${((cents || 0) / 100).toFixed(2)}`;
  }

  function copyText(text: string, idx: number) {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  // Build a 30-day daily count series from a list of items keyed by a date field.
  function build30dSeries(items: Array<Record<string, any>>, dateField: string): number[] {
    const days = 30;
    const buckets = new Array(days).fill(0);
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1)).getTime();
    for (const it of items) {
      const raw = it[dateField];
      if (!raw) continue;
      const t2 = new Date(raw).getTime();
      if (isNaN(t2) || t2 < start) continue;
      const idx = Math.floor((t2 - start) / 86400000);
      if (idx >= 0 && idx < days) buckets[idx] += 1;
    }
    return buckets;
  }

  const isPending = affiliate.status === 'pending';
  const isRejected = affiliate.status === 'rejected';
  const isSuspended = affiliate.status === 'suspended';

  return (
    <div>
      {/* Status banners */}
      {isPending && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 text-yellow-300 text-sm">
          {t('affiliates.dashboard.pendingBanner')}
        </div>
      )}
      {isRejected && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-300 text-sm">
          {t('affiliates.dashboard.rejectedBanner')}
        </div>
      )}
      {isSuspended && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-300 text-sm">
          {t('affiliates.dashboard.suspendedBanner')}
        </div>
      )}

      {/* Referral Link Card */}
      {affiliate.status === 'approved' && (
        <div className="bg-gradient-cosmic rounded-2xl p-6 border border-accent-muted mb-8">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">
            {t('affiliates.dashboard.referralLinkTitle')}
          </h2>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-sm text-accent-primary bg-black/30 rounded-xl px-4 py-3 truncate">
              {affiliate.affiliate_link}
            </code>
            <button
              onClick={copyLink}
              className="btn-primary px-5 py-3 text-sm whitespace-nowrap"
            >
              {copied ? t('common.copied') : t('affiliates.dashboard.copyLink')}
            </button>
          </div>
          <p className="text-text-muted text-xs mt-2">
            {t('affiliates.dashboard.shareHint')}
          </p>
          {/* Social share buttons */}
          <div className="flex items-center gap-3 mt-4">
            <span className="text-text-muted text-xs">{t('affiliates.dashboard.shareOn')}</span>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(t('affiliates.dashboard.tweetText'))}&url=${encodeURIComponent(affiliate.affiliate_link)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-black/30 hover:bg-black/50 text-text-secondary hover:text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Twitter / X
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(t('affiliates.dashboard.whatsappText', { link: affiliate.affiliate_link }))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-black/30 hover:bg-[#25D366]/20 text-text-secondary hover:text-[#25D366] px-3 py-1.5 rounded-lg text-xs transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(affiliate.affiliate_link)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-black/30 hover:bg-[#1877F2]/20 text-text-secondary hover:text-[#1877F2] px-3 py-1.5 rounded-lg text-xs transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </a>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label={t('affiliates.dashboard.stats.totalClicks')} value={affiliate.total_clicks.toLocaleString()} />
        <StatCard label={t('affiliates.dashboard.stats.signups')} value={affiliate.total_signups.toLocaleString()} />
        <StatCard label={t('affiliates.dashboard.stats.conversions')} value={affiliate.total_conversions.toLocaleString()} />
        <StatCard label={t('affiliates.dashboard.stats.conversionRate')} value={`${affiliate.conversion_rate}%`} />
        <StatCard label={t('affiliates.dashboard.stats.epc')} value={centsToUSD(affiliate.epc_cents ?? 0)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <EarningsCard
          label={t('affiliates.dashboard.earnings.totalEarned')}
          value={centsToUSD(affiliate.total_earnings_cents)}
          color="text-green-400"
        />
        <EarningsCard
          label={t('affiliates.dashboard.earnings.paidOut')}
          value={centsToUSD(affiliate.total_paid_cents)}
          color="text-blue-400"
        />
        <EarningsCard
          label={t('affiliates.dashboard.earnings.unpaidBalance')}
          value={centsToUSD(affiliate.unpaid_cents)}
          color="text-accent-primary"
          highlight
        />
      </div>

      {/* Payout progress + Referrals health */}
      {affiliate.status === 'approved' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* Payout progress */}
          <div className="bg-bg-card border border-border-primary rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-3">{t('affiliates.dashboard.payout.title')}</h3>
            {(() => {
              const threshold = affiliate.payout_threshold_cents ?? 5000;
              const unpaid = affiliate.unpaid_cents ?? 0;
              const pct = Math.max(0, Math.min(100, Math.round((unpaid / threshold) * 100)));
              const reached = affiliate.reached_threshold ?? (unpaid >= threshold);
              const toGo = Math.max(0, threshold - unpaid);
              const nextDate = affiliate.next_payout_date
                ? new Date(affiliate.next_payout_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                : '—';
              return (
                <>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-2xl font-bold text-accent-primary">{centsToUSD(unpaid)}</span>
                    <span className="text-xs text-text-muted">/ {centsToUSD(threshold)}</span>
                  </div>
                  <div className="h-2.5 w-full bg-black/30 rounded-full overflow-hidden mb-2">
                    <div className={`h-full rounded-full ${reached ? 'bg-green-400' : 'bg-accent-primary'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-text-muted mb-3">
                    {reached
                      ? t('affiliates.dashboard.payout.ready', { threshold: centsToUSD(threshold), date: nextDate })
                      : t('affiliates.dashboard.payout.toGo', { amount: centsToUSD(toGo), threshold: centsToUSD(threshold) })}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <MiniStat label={t('affiliates.dashboard.payout.nextPayout')} value={nextDate} />
                    <MiniStat label={t('affiliates.dashboard.payout.estimatedNext')} value={reached ? centsToUSD(unpaid) : centsToUSD(0)} />
                    {(affiliate.pending_cents ?? 0) > 0 && (
                      <MiniStat label={t('affiliates.dashboard.payout.pending')} value={centsToUSD(affiliate.pending_cents ?? 0)} color="text-yellow-400" />
                    )}
                    {(affiliate.reversed_cents ?? 0) > 0 && (
                      <MiniStat label={t('affiliates.dashboard.payout.reversed')} value={`-${centsToUSD(affiliate.reversed_cents ?? 0)}`} color="text-red-400" />
                    )}
                  </div>
                  {(affiliate.reversed_cents ?? 0) > 0 && (
                    <p className="text-[11px] text-text-muted mt-2">{t('affiliates.dashboard.payout.reversedNote')}</p>
                  )}
                </>
              );
            })()}
          </div>

          {/* Referrals health */}
          <div className="bg-bg-card border border-border-primary rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-3">{t('affiliates.dashboard.referrals.title')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <MiniStat label={t('affiliates.dashboard.referrals.active')} value={(affiliate.active_referrals ?? 0).toLocaleString()} big />
              <MiniStat label={t('affiliates.dashboard.referrals.mrr')} value={centsToUSD(affiliate.est_mrr_cents ?? 0)} color="text-green-400" big />
              <MiniStat label={t('affiliates.dashboard.referrals.lifetime')} value={(affiliate.lifetime_customers ?? 0).toLocaleString()} big />
              <MiniStat label={t('affiliates.dashboard.referrals.churned')} value={(affiliate.churned_customers ?? 0).toLocaleString()} color="text-text-muted" big />
            </div>
            <p className="text-[11px] text-text-muted mt-3">{t('affiliates.dashboard.referrals.note')}</p>
          </div>
        </div>
      )}

      {/* 30-day trend */}
      <div className="bg-bg-card border border-border-primary rounded-xl p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-text-primary">{t('affiliates.dashboard.trend.title')}</span>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-text-primary"><strong>{affiliate.recent_clicks_30d}</strong> {t('affiliates.dashboard.clicksWord')}</span>
            <span className="text-text-primary"><strong>{affiliate.recent_conversions_30d}</strong> {t('affiliates.dashboard.conversionsWord')}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Sparkline label={t('affiliates.dashboard.trend.clicks')} data={build30dSeries(clicks, 'clicked_at')} color="var(--accent-primary, #a78bfa)" />
          <Sparkline label={t('affiliates.dashboard.trend.conversions')} data={build30dSeries(conversions, 'created_at')} color="#4ade80" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-bg-card rounded-xl p-1 border border-border-primary overflow-x-auto">
        {(['overview', 'conversions', 'clicks', 'payouts', 'promote'] as const).map(tabKey => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={`flex-1 min-w-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              tab === tabKey
                ? 'bg-accent-primary/20 text-accent-primary'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {t(`affiliates.dashboard.tabs.${tabKey}`)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">{t('affiliates.dashboard.recentConversions')}</h3>
          {conversions.length === 0 ? (
            <p className="text-text-muted text-sm py-8 text-center">{t('affiliates.dashboard.noConversionsShare')}</p>
          ) : (
            <div className="bg-bg-card border border-border-primary rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-primary text-text-muted">
                    <th className="text-left px-4 py-3 font-medium">{t('affiliates.dashboard.table.date')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('affiliates.dashboard.table.type')}</th>
                    <th className="text-right px-4 py-3 font-medium">{t('affiliates.dashboard.table.revenue')}</th>
                    <th className="text-right px-4 py-3 font-medium">{t('affiliates.dashboard.table.commission')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('affiliates.dashboard.table.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {conversions.slice(0, 10).map(c => (
                    <tr key={c.id} className="border-b border-border-primary/50 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-text-secondary">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          c.conversion_type === 'signup' ? 'bg-blue-500/10 text-blue-400' :
                          c.conversion_type === 'purchase' ? 'bg-green-500/10 text-green-400' :
                          'bg-purple-500/10 text-purple-400'
                        }`}>
                          {t(`affiliates.dashboard.types.${c.conversion_type}`, { defaultValue: c.conversion_type })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-text-primary">
                        {c.revenue_cents > 0 ? centsToUSD(c.revenue_cents) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-green-400 font-medium">
                        {c.commission_cents > 0 ? centsToUSD(c.commission_cents) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs ${
                          c.status === 'approved' ? 'text-green-400' :
                          c.status === 'paid' ? 'text-blue-400' :
                          'text-yellow-400'
                        }`}>
                          {t(`affiliates.dashboard.statuses.${c.status}`, { defaultValue: c.status })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'conversions' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">{t('affiliates.dashboard.allConversions')}</h3>
          <div className="bg-bg-card border border-border-primary rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-primary text-text-muted">
                  <th className="text-left px-4 py-3 font-medium">{t('affiliates.dashboard.table.date')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('affiliates.dashboard.table.type')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('affiliates.dashboard.table.source')}</th>
                  <th className="text-right px-4 py-3 font-medium">{t('affiliates.dashboard.table.revenue')}</th>
                  <th className="text-right px-4 py-3 font-medium">{t('affiliates.dashboard.table.commission')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('affiliates.dashboard.table.status')}</th>
                </tr>
              </thead>
              <tbody>
                {conversions.map(c => (
                  <tr key={c.id} className="border-b border-border-primary/50 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-text-secondary">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 capitalize text-text-primary">{t(`affiliates.dashboard.types.${c.conversion_type}`, { defaultValue: c.conversion_type })}</td>
                    <td className="px-4 py-3 text-text-muted">{c.source}</td>
                    <td className="px-4 py-3 text-right text-text-primary">{c.revenue_cents > 0 ? centsToUSD(c.revenue_cents) : '-'}</td>
                    <td className="px-4 py-3 text-right text-green-400">{c.commission_cents > 0 ? centsToUSD(c.commission_cents) : '-'}</td>
                    <td className="px-4 py-3 capitalize text-text-muted">{t(`affiliates.dashboard.statuses.${c.status}`, { defaultValue: c.status })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {conversions.length === 0 && (
              <p className="text-text-muted text-sm py-8 text-center">{t('affiliates.dashboard.noConversions')}</p>
            )}
          </div>
        </div>
      )}

      {tab === 'clicks' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">{t('affiliates.dashboard.clickHistory')}</h3>
          <div className="bg-bg-card border border-border-primary rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-primary text-text-muted">
                  <th className="text-left px-4 py-3 font-medium">{t('affiliates.dashboard.table.date')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('affiliates.dashboard.table.country')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('affiliates.dashboard.table.referrer')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('affiliates.dashboard.table.converted')}</th>
                </tr>
              </thead>
              <tbody>
                {clicks.map(c => (
                  <tr key={c.id} className="border-b border-border-primary/50 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-text-secondary">{new Date(c.clicked_at).toLocaleString()}</td>
                    <td className="px-4 py-3 text-text-primary">{c.country || '-'}</td>
                    <td className="px-4 py-3 text-text-muted text-xs truncate max-w-[200px]">{c.referrer_url || t('affiliates.dashboard.direct')}</td>
                    <td className="px-4 py-3">
                      {c.converted ? (
                        <span className="text-green-400 text-xs">{t('common.yes')}</span>
                      ) : (
                        <span className="text-text-muted text-xs">{t('common.no')}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {clicks.length === 0 && (
              <p className="text-text-muted text-sm py-8 text-center">{t('affiliates.dashboard.noClicks')}</p>
            )}
          </div>
        </div>
      )}

      {tab === 'payouts' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">{t('affiliates.dashboard.payoutHistory')}</h3>
          <div className="bg-bg-card border border-border-primary rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-primary text-text-muted">
                  <th className="text-left px-4 py-3 font-medium">{t('affiliates.dashboard.table.date')}</th>
                  <th className="text-right px-4 py-3 font-medium">{t('affiliates.dashboard.table.amount')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('affiliates.dashboard.table.method')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('affiliates.dashboard.table.period')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('affiliates.dashboard.table.status')}</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map(p => (
                  <tr key={p.id} className="border-b border-border-primary/50 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-text-secondary">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right text-text-primary font-medium">{centsToUSD(p.amount_cents)}</td>
                    <td className="px-4 py-3 text-text-muted capitalize">{p.method}</td>
                    <td className="px-4 py-3 text-text-muted text-xs">
                      {p.period_start && p.period_end ? `${p.period_start} - ${p.period_end}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${
                        p.status === 'completed' ? 'text-green-400' :
                        p.status === 'processing' ? 'text-yellow-400' :
                        'text-text-muted'
                      }`}>
                        {t(`affiliates.dashboard.statuses.${p.status}`, { defaultValue: p.status })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payouts.length === 0 && (
              <p className="text-text-muted text-sm py-8 text-center">{t('affiliates.dashboard.noPayouts')}</p>
            )}
          </div>
        </div>
      )}

      {tab === 'promote' && (
        <div className="space-y-6">
          {/* Referral code */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">{t('affiliates.dashboard.promote.codeTitle')}</h3>
            <p className="text-text-muted text-sm mb-3">{t('affiliates.dashboard.promote.codeHint')}</p>
            <div className="flex items-center gap-3">
              <code className="flex-1 text-lg font-bold tracking-wider text-accent-primary bg-bg-card border border-border-primary rounded-xl px-4 py-3">
                {affiliate.affiliate_code}
              </code>
              <button
                onClick={() => copyText(affiliate.affiliate_code, -1)}
                className="btn-primary px-5 py-3 text-sm whitespace-nowrap"
              >
                {copiedIdx === -1 ? t('common.copied') : t('affiliates.dashboard.copyLink')}
              </button>
            </div>
          </div>

          {/* Swipe copy */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">{t('affiliates.dashboard.promote.swipeTitle')}</h3>
            <p className="text-text-muted text-sm mb-3">{t('affiliates.dashboard.promote.swipeHint')}</p>
            <div className="space-y-3">
              {[1, 2, 3].map((n, idx) => {
                const text = t(`affiliates.dashboard.promote.swipe${n}`, { link: affiliate.affiliate_link });
                return (
                  <button
                    key={n}
                    onClick={() => copyText(text, idx)}
                    className="w-full text-left bg-bg-card border border-border-primary hover:border-accent-primary/50 rounded-xl p-4 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
                      <span className={`text-xs whitespace-nowrap px-2 py-1 rounded-lg ${copiedIdx === idx ? 'bg-green-500/10 text-green-400' : 'bg-accent-primary/10 text-accent-primary'}`}>
                        {copiedIdx === idx ? t('common.copied') : '📋'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-card border border-border-primary rounded-xl p-4 text-center">
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-muted mt-1">{label}</p>
    </div>
  );
}

function EarningsCard({ label, value, color, highlight }: { label: string; value: string; color: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-5 text-center ${highlight ? 'bg-accent-primary/10 border border-accent-primary/30' : 'bg-bg-card border border-border-primary'}`}>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-text-muted mt-1">{label}</p>
    </div>
  );
}

function MiniStat({ label, value, color, big }: { label: string; value: string; color?: string; big?: boolean }) {
  return (
    <div>
      <p className={`${big ? 'text-xl' : 'text-sm'} font-bold ${color || 'text-text-primary'}`}>{value}</p>
      <p className="text-xs text-text-muted mt-0.5">{label}</p>
    </div>
  );
}

function Sparkline({ label, data, color }: { label: string; data: number[]; color: string }) {
  const max = Math.max(1, ...data);
  const total = data.reduce((a, b) => a + b, 0);
  const W = 100;
  const H = 32;
  const gap = 1;
  const barW = (W - gap * (data.length - 1)) / data.length;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-text-muted">{label}</span>
        <span className="text-xs font-semibold text-text-secondary">{total}</span>
      </div>
      {total === 0 ? (
        <div className="h-8 flex items-end">
          <div className="w-full border-b border-dashed border-border-primary" />
        </div>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-8" role="img" aria-label={label}>
          {data.map((v, i) => {
            const h = v > 0 ? Math.max(1.5, (v / max) * H) : 0;
            return (
              <rect
                key={i}
                x={i * (barW + gap)}
                y={H - h}
                width={barW}
                height={h}
                rx={0.6}
                fill={color}
                opacity={v > 0 ? 0.9 : 0.15}
              />
            );
          })}
        </svg>
      )}
    </div>
  );
}
