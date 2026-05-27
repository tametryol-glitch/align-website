'use client';

import { useState, useEffect } from 'react';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { getRevenueCatInstance, PLANS } from '@/lib/revenuecat';
import { Check, Sparkles, Star, Zap, Crown, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

type BillingPeriod = 'monthly' | 'annual';

const PLAN_META = [
  { key: 'free', icon: Star },
  { key: 'starter', icon: Flame, highlighted: true },
  { key: 'light', icon: Sparkles },
  { key: 'premium', icon: Zap },
  { key: 'pro', icon: Crown },
] as const;

export default function PricingPage() {
  const { t } = useTranslation();
  const { tier } = useSubscriptionStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [offerings, setOfferings] = useState<any>(null);
  const [error, setError] = useState('');
  const [billing, setBilling] = useState<BillingPeriod>('monthly');

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

      // Find the matching package by identifier, including billing period
      const suffix = billing === 'annual' ? '_annual' : '';
      const pkg = currentOffering.availablePackages?.find(
        (p: any) => p.identifier?.toLowerCase().includes(planKey + suffix)
      ) || currentOffering.availablePackages?.find(
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
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold text-text-primary mb-3">
          {t('pricing.title')}
        </h1>
        <p className="text-text-tertiary max-w-xl mx-auto">
          {t('pricing.subtitle')}
        </p>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <span
          className={cn(
            'text-sm font-medium transition-colors cursor-pointer',
            billing === 'monthly' ? 'text-text-primary' : 'text-text-muted'
          )}
          onClick={() => setBilling('monthly')}
        >
          {t('pricing.monthly', 'Monthly')}
        </span>
        <button
          onClick={() => setBilling(billing === 'monthly' ? 'annual' : 'monthly')}
          className={cn(
            'relative w-14 h-7 rounded-full transition-colors',
            billing === 'annual' ? 'bg-accent-primary' : 'bg-bg-tertiary'
          )}
          aria-label="Toggle billing period"
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform',
              billing === 'annual' && 'translate-x-7'
            )}
          />
        </button>
        <span
          className={cn(
            'text-sm font-medium transition-colors cursor-pointer',
            billing === 'annual' ? 'text-text-primary' : 'text-text-muted'
          )}
          onClick={() => setBilling('annual')}
        >
          {t('pricing.annual', 'Annual')}
        </span>
        {billing === 'annual' && (
          <span className="text-xs font-semibold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
            {t('pricing.saveUpTo', 'Save up to 40%')}
          </span>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 px-4 py-3 rounded-xl mb-6 text-center">{error}</p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        {PLAN_META.map((meta) => {
          const plan = PLANS[meta.key as keyof typeof PLANS];
          const Icon = meta.icon;
          const isCurrent = meta.key === tier;
          const isHighlighted = 'highlighted' in meta && meta.highlighted;
          const hasAnnual = 'annualPrice' in plan;
          const isAnnual = billing === 'annual' && hasAnnual;
          const displayPrice = isAnnual
            ? (plan as any).annualPrice
            : plan.price;
          const annualSavings = isAnnual ? (plan as any).annualSavings : 0;
          const annualSavingsPercent = isAnnual ? (plan as any).annualSavingsPercent : 0;
          const annualTotal = isAnnual ? (plan as any).annualTotal : 0;

          return (
            <div
              key={meta.key}
              className={cn(
                'card relative flex flex-col',
                isHighlighted && 'border-accent-primary ring-2 ring-accent-primary/30 scale-[1.02]'
              )}
            >
              {/* Badges */}
              {isHighlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-accent text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                    {t('pricing.bestValue', 'Best Value')}
                  </span>
                </div>
              )}

              {isAnnual && annualSavingsPercent > 0 && (
                <div className="absolute -top-2 -right-2">
                  <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    -{annualSavingsPercent}%
                  </span>
                </div>
              )}

              <div className="mb-4">
                <Icon className="w-8 h-8 text-accent-primary mb-3" />
                <h3 className="text-lg font-semibold text-text-primary">{plan.name}</h3>
              </div>

              <div className="mb-1">
                {meta.key === 'free' ? (
                  <span className="text-4xl font-bold text-text-primary">{t('subscription.priceFree', 'Free')}</span>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-text-primary">${displayPrice}</span>
                    <span className="text-text-muted">{t('subscription.perMonth')}</span>
                  </>
                )}
              </div>

              {/* Annual billing detail */}
              {isAnnual && hasAnnual ? (
                <div className="mb-4 space-y-0.5">
                  <p className="text-xs text-text-muted">
                    ${annualTotal}{t('pricing.perYear', '/year')}
                  </p>
                  <p className="text-xs font-semibold text-green-400">
                    {t('pricing.saveMoney', 'Save ${{amount}}', { amount: annualSavings })}
                  </p>
                </div>
              ) : (
                <div className="mb-4">
                  {meta.key === 'free' ? (
                    <p className="text-xs text-text-muted">{t('pricing.foreverFree', 'Free forever')}</p>
                  ) : (
                    <p className="text-xs text-text-muted">{t('pricing.billedMonthly', 'Billed monthly')}</p>
                  )}
                </div>
              )}

              {/* Coffee comparison for Starter */}
              {meta.key === 'starter' && (
                <p className="text-xs text-text-muted mb-3 italic">
                  {t('pricing.lessThanCoffee', 'Less than a coffee per month')}
                </p>
              )}

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
                    : isHighlighted
                    ? 'btn-primary'
                    : 'btn-secondary'
                )}
              >
                {loading === meta.key
                  ? t('common.loading')
                  : isCurrent
                  ? t('pricing.currentPlan', 'Current Plan')
                  : meta.key === 'free'
                  ? t('subscription.free.cta')
                  : t('pricing.getPlan', 'Get {{name}}', { name: plan.name })}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
