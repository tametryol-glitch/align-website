'use client';

import { useState, useEffect } from 'react';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { getRevenueCatInstance, PLANS } from '@/lib/revenuecat';
import { Check, Sparkles, Star, Zap, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

const PLAN_META = [
  { key: 'free', icon: Star },
  { key: 'light', icon: Sparkles },
  { key: 'premium', icon: Zap, popular: true },
  { key: 'pro', icon: Crown },
] as const;

export default function PricingPage() {
  const { tier } = useSubscriptionStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [offerings, setOfferings] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const purchases = getRevenueCatInstance();
    if (purchases) {
      purchases.getOfferings()
        .then((off) => setOfferings(off))
        .catch((err) => console.warn('[RevenueCat] Offerings fetch failed:', err));
    }
  }, []);

  async function handleSubscribe(planKey: string) {
    if (planKey === 'free' || planKey === tier) return;

    const purchases = getRevenueCatInstance();
    if (!purchases) {
      setError('Subscription service not initialized. Please try again.');
      return;
    }

    setLoading(planKey);
    setError('');

    try {
      const currentOffering = offerings?.current;
      if (!currentOffering) {
        setError('No offerings available. Please try again later.');
        return;
      }

      // Find the matching package by identifier
      const pkg = currentOffering.availablePackages?.find(
        (p: any) => p.identifier?.toLowerCase().includes(planKey)
      );

      if (!pkg) {
        setError(`Package "${planKey}" not found in offerings.`);
        return;
      }

      const { customerInfo } = await purchases.purchase({ rcPackage: pkg });
      if (customerInfo.entitlements.active) {
        window.location.reload();
      }
    } catch (err: any) {
      if (err?.userCancelled) return;
      setError(err?.message || 'Purchase failed. Please try again.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-display font-bold text-text-primary mb-3">
          Your chart. Your clarity. Your plan.
        </h1>
        <p className="text-text-tertiary max-w-xl mx-auto">
          Choose the depth of insight that fits your life. Every plan includes professional-grade astrology — upgrade anytime.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 px-4 py-3 rounded-xl mb-6 text-center">{error}</p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLAN_META.map((meta) => {
          const plan = PLANS[meta.key as keyof typeof PLANS];
          const Icon = meta.icon;
          const isCurrent = meta.key === tier;
          const isPopular = 'popular' in meta && meta.popular;
          return (
            <div
              key={meta.key}
              className={cn(
                'card relative flex flex-col',
                isPopular && 'border-accent-primary ring-1 ring-accent-primary/20'
              )}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-4">
                <Icon className="w-8 h-8 text-accent-primary mb-3" />
                <h3 className="text-lg font-semibold text-text-primary">{plan.name}</h3>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-text-primary">${plan.price}</span>
                <span className="text-text-muted">/month</span>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(meta.key)}
                disabled={isCurrent || loading === meta.key}
                className={cn(
                  'w-full py-3 rounded-xl font-semibold transition-all',
                  isCurrent
                    ? 'bg-bg-tertiary text-text-muted cursor-default'
                    : isPopular
                    ? 'btn-primary'
                    : 'btn-secondary'
                )}
              >
                {loading === meta.key
                  ? 'Loading...'
                  : isCurrent
                  ? 'Current Plan'
                  : meta.key === 'free'
                  ? 'Get Started Free'
                  : `Get ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
