'use client';

/**
 * /affiliates/dashboard — Authenticated affiliate dashboard.
 *
 * Handles auth + data loading, then renders the shared <AffiliateDashboardView>.
 * The same view is reused by the admin panel so admins see EXACTLY what the
 * affiliate sees.
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { createClient } from '@/lib/supabase';
import {
  getMyAffiliate,
  getMyConversions,
  getMyClicks,
  getMyPayouts,
} from '@/lib/affiliateService';
import AffiliateDashboardView, {
  type AffiliateData,
  type Conversion,
  type Click,
  type Payout,
} from '@/components/AffiliateDashboardView';

export default function AffiliateDashboardPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [clicks, setClicks] = useState<Click[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-3 border-accent-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-text-muted text-sm">{t('affiliates.dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  if (error === 'not_authenticated') {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-text-primary mb-4">{t('affiliates.dashboard.signInTitle')}</h1>
          <p className="text-text-muted text-sm mb-6">
            {t('affiliates.dashboard.signInDesc')}
          </p>
          <Link href="/auth/login" className="btn-primary inline-block px-8 py-3">
            {t('affiliates.dashboard.signIn')}
          </Link>
          <p className="text-text-muted text-sm mt-4">
            {t('affiliates.dashboard.notAffiliateYet')} <Link href="/affiliates" className="text-accent-primary hover:underline">{t('affiliates.dashboard.applyHere')}</Link>
          </p>
        </div>
      </div>
    );
  }

  if (error || !affiliate) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-text-primary mb-4">{t('affiliates.dashboard.noAccountTitle')}</h1>
          <p className="text-text-muted text-sm mb-6">
            {error === 'Not an affiliate'
              ? t('affiliates.dashboard.noAccountDesc')
              : t('affiliates.dashboard.errorPrefix', { error })}
          </p>
          <Link href="/affiliates" className="btn-primary inline-block px-8 py-3">
            {t('affiliates.dashboard.applyCta')}
          </Link>
        </div>
      </div>
    );
  }

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
            {t(`affiliates.dashboard.statuses.${affiliate.status}`, { defaultValue: affiliate.status })}
          </span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <AffiliateDashboardView
          affiliate={affiliate}
          conversions={conversions}
          clicks={clicks}
          payouts={payouts}
        />
      </div>
    </div>
  );
}
