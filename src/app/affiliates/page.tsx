'use client';

/**
 * /affiliates — Public affiliate program landing page.
 *
 * Shows program benefits, commission structure, and an application form.
 * Anyone can apply; admin approves.
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { createClient } from '@/lib/supabase';
import { applyAsAffiliate } from '@/lib/affiliateService';

export default function AffiliateProgramPage() {
  const { t } = useTranslation();
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [affiliateCode, setAffiliateCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [social, setSocial] = useState('');
  const [promoMethod, setPromoMethod] = useState('');

  // Auto-detect logged-in user so we link the affiliate to their account
  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
          // Pre-fill email if available
          if (session.user.email && !email) setEmail(session.user.email);
        }
      } catch {}
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState('submitting');
    setErrorMsg('');

    const result = await applyAsAffiliate({
      name,
      email,
      website: website || undefined,
      social_handle: social || undefined,
      promo_method: promoMethod || undefined,
      user_id: userId || undefined,
    });

    if (result.ok && result.affiliate_code) {
      setAffiliateCode(result.affiliate_code);
      setFormState('success');
    } else {
      setErrorMsg(result.detail || t('affiliates.form.errorGeneric'));
      setFormState('error');
    }
  }

  const perfectForTags = [
    t('affiliates.perfectFor.tag1'), t('affiliates.perfectFor.tag2'),
    t('affiliates.perfectFor.tag3'), t('affiliates.perfectFor.tag4'),
    t('affiliates.perfectFor.tag5'), t('affiliates.perfectFor.tag6'),
    t('affiliates.perfectFor.tag7'), t('affiliates.perfectFor.tag8'),
    t('affiliates.perfectFor.tag9'), t('affiliates.perfectFor.tag10'),
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Align" width={32} height={32} className="w-8 h-8 rounded-lg" />
          <span className="text-xl font-display font-bold text-text-primary">Align</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/affiliates/dashboard" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            {t('affiliates.nav.login')}
          </Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">
            {t('affiliates.nav.getStarted')}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center px-6 pt-16 pb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium mb-6">
          {t('affiliates.hero.badge')}
        </div>
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-text-primary leading-tight mb-6">
          {t('affiliates.hero.titlePre')}{' '}
          <span className="bg-gradient-to-r from-[#9B6FF6] to-[#EC4899] bg-clip-text text-transparent">
            {t('affiliates.hero.titleHighlight')}
          </span>
        </h1>
        <p className="text-lg text-text-tertiary max-w-2xl mx-auto mb-10">
          {t('affiliates.hero.subtitle')}
        </p>
        <a href="#apply" className="btn-primary text-base px-10 py-3">
          {t('affiliates.hero.applyNow')}
        </a>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-display font-bold text-text-primary text-center mb-10">
          {t('affiliates.how.title')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StepCard
            number="1"
            title={t('affiliates.how.step1Title')}
            description={t('affiliates.how.step1Desc')}
          />
          <StepCard
            number="2"
            title={t('affiliates.how.step2Title')}
            description={t('affiliates.how.step2Desc')}
          />
          <StepCard
            number="3"
            title={t('affiliates.how.step3Title')}
            description={t('affiliates.how.step3Desc')}
          />
        </div>
      </section>

      {/* Commission details */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-gradient-cosmic rounded-2xl p-8 border border-accent-muted">
          <h2 className="text-2xl font-display font-bold text-text-primary text-center mb-8">
            {t('affiliates.commission.title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label={t('affiliates.commission.rateLabel')} value="20%" sublabel={t('affiliates.commission.rateSub')} />
            <StatCard label={t('affiliates.commission.cookieLabel')} value={t('affiliates.commission.cookieValue')} sublabel={t('affiliates.commission.cookieSub')} />
            <StatCard label={t('affiliates.commission.payoutLabel')} value="$50" sublabel={t('affiliates.commission.payoutSub')} />
            <StatCard label={t('affiliates.commission.paymentLabel')} value={t('affiliates.commission.paymentValue')} sublabel={t('affiliates.commission.paymentSub')} />
          </div>
          <div className="mt-8 bg-white/5 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-accent-primary uppercase tracking-wider mb-3">
              {t('affiliates.commission.exampleTitle')}
            </h3>
            <div className="space-y-2 text-sm text-text-secondary">
              <p>
                {t('affiliates.commission.exampleIntro')}{' '}
                <strong className="text-green-400">{t('affiliates.commission.examplePerUser')}</strong>
              </p>
              <p>{t('affiliates.commission.exampleRefer', { count: 50 })} <strong className="text-green-400">{t('affiliates.commission.exampleAmount', { amount: '$90' })}</strong>.</p>
              <p>{t('affiliates.commission.exampleRefer', { count: 200 })} <strong className="text-green-400">{t('affiliates.commission.exampleAmount', { amount: '$360' })}</strong>.</p>
              <p>{t('affiliates.commission.exampleRefer', { count: 1000 })} <strong className="text-green-400">{t('affiliates.commission.exampleAmount', { amount: '$1,800' })}</strong>.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-display font-bold text-text-primary text-center mb-10">
          {t('affiliates.benefits.title')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BenefitCard
            icon="&#x1F517;"
            title={t('affiliates.benefits.b1Title')}
            description={t('affiliates.benefits.b1Desc')}
          />
          <BenefitCard
            icon="&#x1F4CA;"
            title={t('affiliates.benefits.b2Title')}
            description={t('affiliates.benefits.b2Desc')}
          />
          <BenefitCard
            icon="&#x1F4B0;"
            title={t('affiliates.benefits.b3Title')}
            description={t('affiliates.benefits.b3Desc')}
          />
          <BenefitCard
            icon="&#x1F3AF;"
            title={t('affiliates.benefits.b4Title')}
            description={t('affiliates.benefits.b4Desc')}
          />
          <BenefitCard
            icon="&#x1F4F1;"
            title={t('affiliates.benefits.b5Title')}
            description={t('affiliates.benefits.b5Desc')}
          />
          <BenefitCard
            icon="&#x1F4E7;"
            title={t('affiliates.benefits.b6Title')}
            description={t('affiliates.benefits.b6Desc')}
          />
        </div>
      </section>

      {/* Who should apply */}
      <section className="max-w-4xl mx-auto px-6 pb-20 text-center">
        <h2 className="text-2xl font-display font-bold text-text-primary mb-4">
          {t('affiliates.perfectFor.title')}
        </h2>
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {perfectForTags.map(tag => (
            <span key={tag} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-text-secondary">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="max-w-xl mx-auto px-6 pb-24">
        <div className="bg-bg-card border border-border-primary rounded-2xl p-8">
          <h2 className="text-2xl font-display font-bold text-text-primary text-center mb-2">
            {t('affiliates.form.title')}
          </h2>
          <p className="text-text-muted text-sm text-center mb-8">
            {t('affiliates.form.reviewNote')}
          </p>

          {formState === 'success' ? (
            <div className="text-center">
              <div className="text-5xl mb-4">&#x1F389;</div>
              <h3 className="text-xl font-bold text-text-primary mb-2">{t('affiliates.success.title')}</h3>
              <p className="text-text-secondary text-sm mb-4">
                {t('affiliates.success.codeIs')} <strong className="text-accent-primary">{affiliateCode}</strong>
              </p>
              <p className="text-text-muted text-sm">
                {t('affiliates.success.reviewEmail', { email })}
              </p>
              <p className="text-accent-primary text-sm font-mono mt-2 break-all">
                https://aligncosmic.com/ref/{affiliateCode}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">{t('affiliates.form.nameLabel')} *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  minLength={2}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder={t('affiliates.form.namePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">{t('affiliates.form.emailLabel')} *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">{t('affiliates.form.websiteLabel')}</label>
                <input
                  type="url"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="https://yourblog.com"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">{t('affiliates.form.socialLabel')}</label>
                <input
                  type="text"
                  value={social}
                  onChange={e => setSocial(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="@yourhandle"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">{t('affiliates.form.promoLabel')}</label>
                <textarea
                  value={promoMethod}
                  onChange={e => setPromoMethod(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-primary transition-colors resize-none"
                  placeholder={t('affiliates.form.promoPlaceholder')}
                />
              </div>

              {formState === 'error' && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={formState === 'submitting'}
                className="w-full btn-primary py-3 text-base disabled:opacity-50"
              >
                {formState === 'submitting' ? t('affiliates.form.submitting') : t('affiliates.form.submit')}
              </button>

              <p className="text-text-muted text-xs text-center">
                {t('affiliates.form.disclaimer')}
              </p>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-primary py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Align. {t('affiliates.footer.rights')}
          </span>
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href="/" className="hover:text-text-secondary">{t('affiliates.footer.home')}</Link>
            <Link href="/pricing" className="hover:text-text-secondary">{t('affiliates.footer.pricing')}</Link>
            <Link href="/settings/terms" className="hover:text-text-secondary">{t('affiliates.footer.terms')}</Link>
            <Link href="/settings/privacy" className="hover:text-text-secondary">{t('affiliates.footer.privacy')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center p-6 rounded-2xl border border-border-primary bg-bg-card">
      <div className="w-12 h-12 rounded-full bg-accent-primary/20 flex items-center justify-center mx-auto mb-4">
        <span className="text-lg font-bold text-accent-primary">{number}</span>
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-tertiary">{description}</p>
    </div>
  );
}

function StatCard({ label, value, sublabel }: { label: string; value: string; sublabel: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-display font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
        {value}
      </p>
      <p className="text-sm text-text-primary mt-1">{label}</p>
      <p className="text-xs text-text-muted">{sublabel}</p>
    </div>
  );
}

function BenefitCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex gap-4 p-5 rounded-2xl border border-border-primary bg-bg-card">
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>
        <p className="text-sm text-text-tertiary">{description}</p>
      </div>
    </div>
  );
}
