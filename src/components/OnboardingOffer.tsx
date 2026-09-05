'use client';

/**
 * OnboardingOffer — the plan step at the end of onboarding.
 *
 * Why this exists: a user who arrived through an affiliate link used to go
 * signup → onboarding → /feed and was never once shown a plan or told what it
 * includes. The 10% affiliate discount is real (applied in
 * /api/stripe/checkout from the align_aff cookie) but nobody was ever told it
 * existed, so it expired unused with the cookie — no subscription for Align,
 * no commission for the affiliate.
 *
 * It renders straight after the Big Three reveal + share card, which is the
 * highest-intent moment in the whole funnel: they have just seen their own
 * chart for the first time and want more of it.
 *
 * Only the three Stripe-backed plans are offered here. Starter has no Stripe
 * price, so it cannot carry the affiliate coupon or the commission metadata —
 * offering it at this moment would quietly break the discount promised on the
 * /ref landing page. Starter and Free stay one tap away under "See all plans".
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { PLANS } from '@/lib/plans';
import { cn } from '@/lib/utils';
import { trackPaywallShown, trackCheckoutStarted } from '@/lib/firstPartyAnalytics';
import { getAffiliateName } from '@/lib/affiliateService';

/** Plans that go through Stripe Checkout, so the affiliate coupon + the
 *  commission metadata both attach. Order = cheapest first. */
const OFFER_PLANS = [
  { key: 'light', icon: Sparkles },
  { key: 'premium', icon: Zap, highlighted: true },
  { key: 'pro', icon: Crown },
] as const;

export default function OnboardingOffer({ firstName }: { firstName?: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [referredBy, setReferredBy] = useState<string | null>(null);
  const [isAffiliate, setIsAffiliate] = useState(false);

  useEffect(() => {
    // The affiliate cookie is set on /ref/[code] and at signup. Its presence
    // is what makes the 10% coupon attach at checkout, so it's also what
    // decides whether we promise the discount here.
    if (/(?:^|; )align_aff=/.test(document.cookie)) setIsAffiliate(true);
    setReferredBy(getAffiliateName());
    trackPaywallShown('onboarding_offer');
  }, []);

  function subscribe(planKey: string) {
    setLoading(planKey);
    trackCheckoutStarted(planKey, 'onboarding_offer');
    // GET redirect — the route reads the align_aff cookie server-side and
    // attaches both the coupon and the affiliate_id subscription metadata.
    window.location.href = `/api/stripe/checkout?plan=${planKey}`;
  }

  return (
    <div className="py-6">
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">&#x2728;</div>
        <h2 className="text-2xl font-display font-bold text-text-primary mb-2">
          {firstName
            ? t('onboarding.offer.titleNamed', { name: firstName, defaultValue: `{{name}}, this is only the surface` })
            : t('onboarding.offer.title', 'This is only the surface')}
        </h2>
        <p className="text-sm text-text-tertiary max-w-md mx-auto">
          {t(
            'onboarding.offer.subtitle',
            'You just saw your Big Three. Your full chart has ten more bodies, every aspect between them, and what they say about the next twelve months.',
          )}
        </p>
      </div>

      {/* Referral discount — only promised when the cookie that actually
          applies it is present. */}
      {isAffiliate && (
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl px-5 py-4 mb-6 text-center max-w-lg mx-auto">
          <p className="text-base font-semibold text-white">
            {referredBy
              ? t('onboarding.offer.referredByName', { name: referredBy, defaultValue: `🎁 {{name}} sent you 10% off your first 2 months` })
              : t('onboarding.offer.referred', '🎁 You were referred — 10% off your first 2 months')}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {t('onboarding.offer.referredSub', 'Applied automatically at checkout.')}
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {OFFER_PLANS.map((meta) => {
          const plan = PLANS[meta.key];
          const Icon = meta.icon;
          const highlighted = 'highlighted' in meta && meta.highlighted;

          return (
            <div
              key={meta.key}
              className={cn(
                'card relative flex flex-col text-left',
                highlighted && 'border-accent-primary/60 shadow-lg shadow-accent-primary/10',
              )}
            >
              {highlighted && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-wide bg-accent-primary text-white px-2.5 py-0.5 rounded-full">
                  {t('onboarding.offer.mostPopular', 'Most popular')}
                </span>
              )}

              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-accent-primary" />
                <h3 className="font-display font-bold text-text-primary">{plan.name}</h3>
              </div>

              <p className="mb-3">
                <span className="text-2xl font-bold text-text-primary">${plan.price}</span>
                <span className="text-xs text-text-muted">
                  {' '}{t('onboarding.offer.perMonth', '/month')}
                </span>
              </p>

              <ul className="space-y-1.5 mb-4 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-text-secondary">
                    <Check className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => subscribe(meta.key)}
                disabled={loading !== null}
                className={cn(
                  'w-full py-2.5 text-sm disabled:opacity-50',
                  highlighted ? 'btn-primary' : 'btn-secondary',
                )}
              >
                {loading === meta.key
                  ? t('onboarding.offer.opening', 'Opening checkout…')
                  : t('onboarding.offer.choose', { name: plan.name, defaultValue: `Get {{name}}` })}
              </button>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <button
          onClick={() => router.push('/pricing')}
          className="text-sm text-accent-primary hover:underline"
        >
          {t('onboarding.offer.seeAllPlans', 'See all plans, including the free one →')}
        </button>
        <button
          onClick={() => router.push('/feed')}
          className="btn-ghost w-full text-sm text-text-muted mt-3"
        >
          {t('onboarding.offer.later', 'Maybe later — take me to my feed')}
        </button>
        <p className="text-[10px] text-text-muted mt-2">
          {t('onboarding.offer.cancelAnytime', 'Cancel anytime. Your free account keeps working either way.')}
        </p>
      </div>
    </div>
  );
}
