'use client';

import Link from 'next/link';
import { useSubscriptionStore, type TierLevel } from '@/stores/subscriptionStore';
import { Lock } from 'lucide-react';

interface Props {
  feature: string;
  children: React.ReactNode;
  fallbackTier?: TierLevel;
}

export function PaywallGate({ feature, children, fallbackTier }: Props) {
  const { hasAccess, tier } = useSubscriptionStore();

  if (hasAccess(feature)) return <>{children}</>;

  const required = fallbackTier || 'premium';

  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-accent-muted flex items-center justify-center mx-auto mb-4">
        <Lock className="w-8 h-8 text-accent-primary" />
      </div>
      <h2 className="text-xl font-display font-bold text-text-primary mb-2">
        Upgrade to Unlock
      </h2>
      <p className="text-text-tertiary text-sm mb-6">
        This feature requires the <span className="text-accent-primary font-semibold capitalize">{required}</span> plan
        {tier !== 'free' && (
          <> (you&apos;re on <span className="capitalize">{tier}</span>)</>
        )}
        .
      </p>
      <Link href="/pricing" className="btn-primary inline-block">
        View Plans
      </Link>
    </div>
  );
}
