'use client';

import Link from 'next/link';
import { useSubscriptionStore, type TierLevel } from '@/stores/subscriptionStore';
import { Lock, Sparkles, Zap, Crown } from 'lucide-react';

interface Props {
  feature: string;
  children: React.ReactNode;
  fallbackTier?: TierLevel;
}

const TIER_CONFIG: Record<string, { icon: React.ReactNode; color: string; price: string }> = {
  light: { icon: <Zap className="w-5 h-5" />, color: 'text-blue-400', price: '$9/mo' },
  premium: { icon: <Sparkles className="w-5 h-5" />, color: 'text-accent-primary', price: '$19/mo' },
  pro: { icon: <Crown className="w-5 h-5" />, color: 'text-gold-primary', price: '$29/mo' },
};

export function PaywallGate({ feature, children, fallbackTier }: Props) {
  const { hasAccess, tier, loading } = useSubscriptionStore();

  // Don't flash paywall while subscription loads
  if (loading) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-12 h-12 rounded-full bg-bg-tertiary animate-pulse mx-auto mb-4" />
        <div className="h-5 bg-bg-tertiary rounded animate-pulse w-40 mx-auto mb-2" />
        <div className="h-4 bg-bg-tertiary rounded animate-pulse w-56 mx-auto" />
      </div>
    );
  }

  if (hasAccess(feature)) return <>{children}</>;

  const required = fallbackTier || 'premium';
  const config = TIER_CONFIG[required] || TIER_CONFIG.premium;

  return (
    <div className="max-w-md mx-auto text-center py-12">
      {/* Blurred preview hint */}
      <div className="relative mb-6 mx-auto w-64 h-40 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-cosmic border border-accent-muted rounded-2xl" />
        <div className="absolute inset-0 backdrop-blur-md flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-bg-primary/80 flex items-center justify-center">
            <Lock className="w-7 h-7 text-accent-primary" />
          </div>
        </div>
      </div>

      <h2 className="text-xl font-display font-bold text-text-primary mb-2">
        Unlock This Reading
      </h2>
      <p className="text-text-tertiary text-sm mb-4">
        This feature is available on the{' '}
        <span className={`font-semibold capitalize ${config.color}`}>{required}</span> plan
        {tier !== 'free' && (
          <> &mdash; you&apos;re on <span className="capitalize">{tier}</span></>
        )}
      </p>

      {/* What you get */}
      <div className="bg-bg-card border border-border-primary rounded-xl p-4 mb-6 text-left">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">What you unlock</p>
        <ul className="space-y-2 text-sm text-text-secondary">
          <li className="flex items-center gap-2">
            <span className="text-accent-primary">✦</span> This reading + all {required}-tier features
          </li>
          <li className="flex items-center gap-2">
            <span className="text-accent-primary">✦</span> AI Astrologer with voice chat
          </li>
          <li className="flex items-center gap-2">
            <span className="text-accent-primary">✦</span> Full natal chart with aspects & patterns
          </li>
        </ul>
      </div>

      <Link href="/pricing" className="btn-primary inline-flex items-center gap-2 px-8">
        {config.icon} See Plans — from {config.price}
      </Link>
    </div>
  );
}
