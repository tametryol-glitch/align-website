'use client';

import Link from 'next/link';
import { ArrowLeft, Gift } from 'lucide-react';
import ReferralCard from '@/components/ui/ReferralCard';

export default function ReferralsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/settings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" />
        Settings
      </Link>

      <h1 className="text-2xl font-display font-bold text-text-primary mb-6 flex items-center gap-3">
        <Gift className="w-7 h-7 text-accent-primary" />
        Referrals
      </h1>

      <ReferralCard />

      <div className="card mt-4">
        <h3 className="font-semibold text-text-primary mb-3">How it works</h3>
        <ol className="space-y-2 text-sm text-text-secondary list-decimal list-inside">
          <li>Share your unique referral link with friends</li>
          <li>When they sign up using your link, you both get <strong className="text-accent-primary">5 bonus readings</strong></li>
          <li>There&apos;s no limit &mdash; invite as many friends as you like!</li>
        </ol>
      </div>
    </div>
  );
}
