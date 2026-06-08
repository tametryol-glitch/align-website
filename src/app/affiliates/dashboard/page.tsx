'use client';

/**
 * /affiliates/dashboard — Authenticated affiliate dashboard.
 *
 * Shows: stats cards, earnings chart, recent conversions, click history,
 * payout history, and the affiliate's referral link.
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import {
  getMyAffiliate,
  getMyConversions,
  getMyClicks,
  getMyPayouts,
} from '@/lib/affiliateService';

interface AffiliateData {
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
}

interface Conversion {
  id: string;
  conversion_type: string;
  revenue_cents: number;
  commission_cents: number;
  source: string;
  status: string;
  created_at: string;
}

interface Click {
  id: string;
  clicked_at: string;
  country: string | null;
  referrer_url: string | null;
  landing_page: string | null;
  converted: boolean;
}

interface Payout {
  id: string;
  amount_cents: number;
  method: string;
  status: string;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
  completed_at: string | null;
}

export default function AffiliateDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [clicks, setClicks] = useState<Click[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [tab, setTab] = useState<'overview' | 'conversions' | 'clicks' | 'payouts'>('overview');
  const [copied, setCopied] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError('not_authenticated');
        setLoading(false);
        return;
      }

      const token = session.access_token;
      const [affData, convData, clickData, payoutData] = await Promise.all([
        getMyAffiliate(token),
        getMyConversions(token),
        getMyClicks(token),
        getMyPayouts(token),
      ]);

      setAffiliate(affData);
      setConversions(convData.conversions || []);
      setClicks(clickData.clicks || []);
      setPayouts(payoutData.payouts || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  function copyLink() {
    if (affiliate?.affiliate_link) {
      navigator.clipboard.writeText(affiliate.affiliate_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function centsToUSD(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-3 border-accent-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-text-muted text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error === 'not_authenticated') {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Sign in to access your dashboard</h1>
          <p className="text-text-muted text-sm mb-6">
            You need to be logged in with the same account you used to apply.
          </p>
          <Link href="/auth/login" className="btn-primary inline-block px-8 py-3">
            Sign In
          </Link>
          <p className="text-text-muted text-sm mt-4">
            Not an affiliate yet? <Link href="/affiliates" className="text-accent-primary hover:underline">Apply here</Link>
          </p>
        </div>
      </div>
    );
  }

  if (error || !affiliate) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-text-primary mb-4">No Affiliate Account Found</h1>
          <p className="text-text-muted text-sm mb-6">
            {error === 'Not an affiliate'
              ? 'You don\'t have an affiliate account linked to this login.'
              : `Error: ${error}`}
          </p>
          <Link href="/affiliates" className="btn-primary inline-block px-8 py-3">
            Apply to Affiliate Program
          </Link>
        </div>
      </div>
    );
  }

  const isPending = affiliate.status === 'pending';
  const isRejected = affiliate.status === 'rejected';
  const isSuspended = affiliate.status === 'suspended';

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto border-b border-border-primary">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Align" width={32} height={32} className="w-8 h-8 rounded-lg" />
          <span className="text-lg font-display font-bold text-text-primary">Align</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-muted">
            {affiliate.name}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            affiliate.status === 'approved' ? 'bg-green-500/10 text-green-400' :
            affiliate.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
            'bg-red-500/10 text-red-400'
          }`}>
            {affiliate.status}
          </span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Status banners */}
        {isPending && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 text-yellow-300 text-sm">
            Your application is being reviewed. You will receive an email once approved.
          </div>
        )}
        {isRejected && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-300 text-sm">
            Your application was not approved. Please contact support for more info.
          </div>
        )}
        {isSuspended && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-300 text-sm">
            Your affiliate account has been suspended. Contact support for details.
          </div>
        )}

        {/* Referral Link Card */}
        {affiliate.status === 'approved' && (
          <div className="bg-gradient-cosmic rounded-2xl p-6 border border-accent-muted mb-8">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">
              Your Referral Link
            </h2>
            <div className="flex items-center gap-3">
              <code className="flex-1 text-sm text-accent-primary bg-black/30 rounded-xl px-4 py-3 truncate">
                {affiliate.affiliate_link}
              </code>
              <button
                onClick={copyLink}
                className="btn-primary px-5 py-3 text-sm whitespace-nowrap"
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
            <p className="text-text-muted text-xs mt-2">
              Share this link anywhere. 30-day cookie attribution.
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Clicks" value={affiliate.total_clicks.toLocaleString()} />
          <StatCard label="Signups" value={affiliate.total_signups.toLocaleString()} />
          <StatCard label="Conversions" value={affiliate.total_conversions.toLocaleString()} />
          <StatCard label="Conversion Rate" value={`${affiliate.conversion_rate}%`} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <EarningsCard
            label="Total Earned"
            value={centsToUSD(affiliate.total_earnings_cents)}
            color="text-green-400"
          />
          <EarningsCard
            label="Paid Out"
            value={centsToUSD(affiliate.total_paid_cents)}
            color="text-blue-400"
          />
          <EarningsCard
            label="Unpaid Balance"
            value={centsToUSD(affiliate.unpaid_cents)}
            color="text-accent-primary"
            highlight
          />
        </div>

        {/* 30-day summary */}
        <div className="bg-bg-card border border-border-primary rounded-xl p-4 mb-8 flex items-center gap-6 text-sm">
          <span className="text-text-muted">Last 30 days:</span>
          <span className="text-text-primary">
            <strong>{affiliate.recent_clicks_30d}</strong> clicks
          </span>
          <span className="text-text-primary">
            <strong>{affiliate.recent_conversions_30d}</strong> conversions
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-bg-card rounded-xl p-1 border border-border-primary overflow-x-auto">
          {(['overview', 'conversions', 'clicks', 'payouts'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 min-w-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                tab === t
                  ? 'bg-accent-primary/20 text-accent-primary'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'overview' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">Recent Conversions</h3>
            {conversions.length === 0 ? (
              <p className="text-text-muted text-sm py-8 text-center">No conversions yet. Share your link to get started!</p>
            ) : (
              <div className="bg-bg-card border border-border-primary rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-primary text-text-muted">
                      <th className="text-left px-4 py-3 font-medium">Date</th>
                      <th className="text-left px-4 py-3 font-medium">Type</th>
                      <th className="text-right px-4 py-3 font-medium">Revenue</th>
                      <th className="text-right px-4 py-3 font-medium">Commission</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
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
                            {c.conversion_type}
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
                            {c.status}
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
            <h3 className="text-lg font-semibold text-text-primary">All Conversions</h3>
            <div className="bg-bg-card border border-border-primary rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-primary text-text-muted">
                    <th className="text-left px-4 py-3 font-medium">Date</th>
                    <th className="text-left px-4 py-3 font-medium">Type</th>
                    <th className="text-left px-4 py-3 font-medium">Source</th>
                    <th className="text-right px-4 py-3 font-medium">Revenue</th>
                    <th className="text-right px-4 py-3 font-medium">Commission</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {conversions.map(c => (
                    <tr key={c.id} className="border-b border-border-primary/50 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-text-secondary">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 capitalize text-text-primary">{c.conversion_type}</td>
                      <td className="px-4 py-3 text-text-muted">{c.source}</td>
                      <td className="px-4 py-3 text-right text-text-primary">{c.revenue_cents > 0 ? centsToUSD(c.revenue_cents) : '-'}</td>
                      <td className="px-4 py-3 text-right text-green-400">{c.commission_cents > 0 ? centsToUSD(c.commission_cents) : '-'}</td>
                      <td className="px-4 py-3 capitalize text-text-muted">{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {conversions.length === 0 && (
                <p className="text-text-muted text-sm py-8 text-center">No conversions yet</p>
              )}
            </div>
          </div>
        )}

        {tab === 'clicks' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">Click History</h3>
            <div className="bg-bg-card border border-border-primary rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-primary text-text-muted">
                    <th className="text-left px-4 py-3 font-medium">Date</th>
                    <th className="text-left px-4 py-3 font-medium">Country</th>
                    <th className="text-left px-4 py-3 font-medium">Referrer</th>
                    <th className="text-left px-4 py-3 font-medium">Converted</th>
                  </tr>
                </thead>
                <tbody>
                  {clicks.map(c => (
                    <tr key={c.id} className="border-b border-border-primary/50 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-text-secondary">{new Date(c.clicked_at).toLocaleString()}</td>
                      <td className="px-4 py-3 text-text-primary">{c.country || '-'}</td>
                      <td className="px-4 py-3 text-text-muted text-xs truncate max-w-[200px]">{c.referrer_url || 'Direct'}</td>
                      <td className="px-4 py-3">
                        {c.converted ? (
                          <span className="text-green-400 text-xs">Yes</span>
                        ) : (
                          <span className="text-text-muted text-xs">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {clicks.length === 0 && (
                <p className="text-text-muted text-sm py-8 text-center">No clicks yet. Share your link to get started!</p>
              )}
            </div>
          </div>
        )}

        {tab === 'payouts' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">Payout History</h3>
            <div className="bg-bg-card border border-border-primary rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-primary text-text-muted">
                    <th className="text-left px-4 py-3 font-medium">Date</th>
                    <th className="text-right px-4 py-3 font-medium">Amount</th>
                    <th className="text-left px-4 py-3 font-medium">Method</th>
                    <th className="text-left px-4 py-3 font-medium">Period</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
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
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {payouts.length === 0 && (
                <p className="text-text-muted text-sm py-8 text-center">No payouts yet. Minimum payout threshold is $50.</p>
              )}
            </div>
          </div>
        )}
      </div>
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
