'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useAuthStore } from '@/stores/authStore';
import { ArrowLeft, Check, Crown, Sparkles, Star, Zap, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    icon: Star,
    color: 'text-text-muted',
    borderColor: 'border-border-primary',
    features: [
      'Full natal chart',
      'Basic transits',
      'Community feed',
      '3 AI questions/month',
    ],
  },
  {
    id: 'light',
    name: 'Light',
    price: '$9',
    period: '/mo',
    icon: Sparkles,
    color: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    features: [
      'Everything in Free',
      'Angel numbers',
      'Arabic parts',
      'Cosmic journal',
      'Saved charts',
      '30 AI questions/month',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$19',
    period: '/mo',
    icon: Crown,
    color: 'text-yellow-400',
    borderColor: 'border-yellow-500/50',
    highlighted: true,
    features: [
      'Everything in Light',
      'AI personal readings',
      'Midpoints',
      'World Echo',
      'Progressed charts',
      'Solar/Lunar returns',
      '100 AI questions/month',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: '/mo',
    icon: Zap,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    features: [
      'Everything in Premium',
      'Financial astrology',
      'Athletes engine',
      'Priority support',
      '300 AI questions/month',
    ],
  },
];

const faqItems = [
  {
    question: 'Can I switch plans at any time?',
    answer:
      'Yes, you can upgrade or downgrade your plan at any time. When upgrading, you get immediate access to new features. When downgrading, your current plan remains active until the end of the billing period.',
  },
  {
    question: 'Can I try before I subscribe?',
    answer:
      'Free users have access to basic charts, planetary hours, and limited readings. Upgrade anytime to unlock the full experience — no commitment required.',
  },
  {
    question: 'Do unused AI questions roll over?',
    answer:
      'AI question limits reset monthly. Unused questions do not roll over to the next month. This ensures fair resource allocation for all users.',
  },
  {
    question: 'Is my payment information secure?',
    answer:
      'All payments are processed securely through Stripe. We never store your credit card details on our servers. Stripe is PCI DSS Level 1 certified, the highest level of security certification.',
  },
];

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-primary" />}>
      <SubscriptionContent />
    </Suspense>
  );
}

function SubscriptionContent() {
  const { tier } = useSubscriptionStore();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Handle URL params from Stripe redirects
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setBanner({ type: 'success', message: t('subscription.paymentSuccess') });
      // Clean URL params
      window.history.replaceState({}, '', '/settings/subscription');
    } else if (searchParams.get('canceled') === 'true') {
      setBanner({ type: 'info', message: t('subscription.paymentCanceled') });
      window.history.replaceState({}, '', '/settings/subscription');
    } else if (searchParams.get('no_subscription') === 'true') {
      setBanner({ type: 'info', message: t('subscription.noStripeSubscription') });
      window.history.replaceState({}, '', '/settings/subscription');
    } else if (searchParams.get('error')) {
      setBanner({ type: 'error', message: t('subscription.portalError') });
      window.history.replaceState({}, '', '/settings/subscription');
    }
  }, [searchParams, t]);

  function handleSelectPlan(planId: string) {
    if (planId === tier) return;
    if (planId === 'free') {
      window.location.href = '/api/stripe/portal';
      return;
    }
    const checkoutUrl = `/api/stripe/checkout?plan=${planId}&email=${encodeURIComponent(user?.email || '')}`;
    window.location.href = checkoutUrl;
  }

  function handleManageSubscription() {
    window.location.href = '/api/stripe/portal';
  }

  function handleRestorePurchases() {
    window.location.href = '/api/stripe/portal';
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/settings"
            className="p-2 rounded-lg bg-bg-secondary hover:bg-bg-tertiary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t('settings.subscription')}</h1>
            <p className="text-sm text-text-muted">{t('subscription.subtitle')}</p>
          </div>
        </div>

        {/* Status banner from Stripe redirects */}
        {banner && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              banner.type === 'success'
                ? 'bg-green-500/10 border border-green-500/30'
                : banner.type === 'error'
                  ? 'bg-red-500/10 border border-red-500/30'
                  : 'bg-blue-500/10 border border-blue-500/30'
            }`}
          >
            {banner.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            ) : banner.type === 'error' ? (
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            ) : null}
            <p className={`text-sm ${
              banner.type === 'success' ? 'text-green-300' :
              banner.type === 'error' ? 'text-red-300' : 'text-blue-300'
            }`}>
              {banner.message}
            </p>
            <button
              onClick={() => setBanner(null)}
              className="ml-auto text-text-muted hover:text-text-primary text-lg"
            >
              ×
            </button>
          </div>
        )}

        {tier !== 'free' && (
          <div className="mb-6 p-4 rounded-xl bg-bg-secondary border border-border-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-primary font-medium">
                  You&apos;re on the <span className="text-accent-primary capitalize">{tier}</span> plan
                </p>
                <p className="text-sm text-text-muted mt-1">
                  Manage billing, update payment method, or cancel
                </p>
              </div>
              <button
                onClick={handleManageSubscription}
                className="px-4 py-2 rounded-lg bg-accent-primary text-white font-medium hover:opacity-90 transition-opacity"
              >
                {t('subscription.manageButton')}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = plan.id === tier;
            const isHighlighted = plan.highlighted;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 border-2 transition-all ${
                  isHighlighted
                    ? 'border-yellow-500/50 bg-bg-secondary shadow-lg shadow-yellow-500/5'
                    : `${plan.borderColor} bg-bg-secondary`
                } ${isCurrent ? 'ring-2 ring-accent-primary' : ''}`}
              >
                {isHighlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-yellow-500 text-black text-xs font-bold">
                    {t('subscription.mostPopular')}
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-accent-primary text-white text-xs font-bold">
                    Current Plan
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg bg-bg-tertiary`}>
                    <Icon className={`w-5 h-5 ${plan.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">{plan.name}</h3>
                    <p className="text-text-muted text-sm">
                      <span className="text-xl font-bold text-text-primary">{plan.price}</span>
                      {plan.period !== 'forever' && (
                        <span className="text-text-muted">{plan.period}</span>
                      )}
                      {plan.period === 'forever' && (
                        <span className="text-text-muted ml-1">forever</span>
                      )}
                    </p>
                  </div>
                </div>

                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.color}`} />
                      <span className="text-sm text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isCurrent}
                  className={`w-full py-3 rounded-xl font-medium text-sm transition-all ${
                    isCurrent
                      ? 'bg-bg-tertiary text-text-muted cursor-not-allowed'
                      : isHighlighted
                        ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                        : 'bg-accent-primary text-white hover:opacity-90'
                  }`}
                >
                  {isCurrent
                    ? 'Current Plan'
                    : plan.id === 'free'
                      ? 'Downgrade'
                      : `Upgrade to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-bold text-text-primary mb-6">{t('subscription.faqTitle')}</h2>
          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-border-primary bg-bg-secondary overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left"
                >
                  <span className="text-sm font-medium text-text-primary">{item.question}</span>
                  <span
                    className={`text-text-muted transition-transform ${
                      expandedFaq === index ? 'rotate-180' : ''
                    }`}
                  >
                    ▾
                  </span>
                </button>
                {expandedFaq === index && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-text-muted leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center pb-8">
          <button
            onClick={handleRestorePurchases}
            className="text-sm text-text-muted hover:text-accent-primary transition-colors underline"
          >
            Restore Purchases
          </button>
          <p className="text-xs text-text-muted mt-3">
            Subscriptions are billed monthly. Cancel anytime from your account settings.
          </p>
        </div>
      </div>
    </div>
  );
}
