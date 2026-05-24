'use client';

import Link from 'next/link';
import { ArrowLeft, Gift } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ReferralCard from '@/components/ui/ReferralCard';

export default function ReferralsPage() {
  const { t } = useTranslation();
  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/settings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" />
        {t('settings.title')}
      </Link>

      <h1 className="text-2xl font-display font-bold text-text-primary mb-6 flex items-center gap-3">
        <Gift className="w-7 h-7 text-accent-primary" />
        {t('settings.referrals.title')}
      </h1>

      <ReferralCard />

      <div className="card mt-4">
        <h3 className="font-semibold text-text-primary mb-3">{t('settings.referrals.howItWorks')}</h3>
        <ol className="space-y-2 text-sm text-text-secondary list-decimal list-inside">
          <li>{t('settings.referrals.step1')}</li>
          <li>{t('settings.referrals.step2')}</li>
          <li>{t('settings.referrals.step3')}</li>
        </ol>
      </div>
    </div>
  );
}
