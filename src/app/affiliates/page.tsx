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
import { createClient } from '@/lib/supabase';
import { applyAsAffiliate } from '@/lib/affiliateService';

export default function AffiliateProgramPage() {
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
      setErrorMsg(result.detail || 'Something went wrong. Please try again.');
      setFormState('error');
    }
  }

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
            Affiliate Login
          </Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center px-6 pt-16 pb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium mb-6">
          20% Recurring Commission
        </div>
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-text-primary leading-tight mb-6">
          Earn money sharing{' '}
          <span className="bg-gradient-to-r from-[#9B6FF6] to-[#EC4899] bg-clip-text text-transparent">
            cosmic wisdom
          </span>
        </h1>
        <p className="text-lg text-text-tertiary max-w-2xl mx-auto mb-10">
          Join the Align Affiliate Program and earn 20% recurring commission
          on every subscription you refer. Your audience gets professional-grade
          astrology; you get paid every month they stay.
        </p>
        <a href="#apply" className="btn-primary text-base px-10 py-3">
          Apply Now
        </a>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-display font-bold text-text-primary text-center mb-10">
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StepCard
            number="1"
            title="Apply"
            description="Fill out the form below. We review applications within 24-48 hours and notify you by email."
          />
          <StepCard
            number="2"
            title="Share"
            description="Get your unique referral link. Share it on your blog, YouTube, social media, podcast, or newsletter."
          />
          <StepCard
            number="3"
            title="Earn"
            description="Earn 20% of every subscription payment from users you refer. Commissions are recurring — you earn as long as they stay subscribed."
          />
        </div>
      </section>

      {/* Commission details */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-gradient-cosmic rounded-2xl p-8 border border-accent-muted">
          <h2 className="text-2xl font-display font-bold text-text-primary text-center mb-8">
            Commission Structure
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Commission Rate" value="20%" sublabel="Recurring" />
            <StatCard label="Cookie Duration" value="30 days" sublabel="Attribution window" />
            <StatCard label="Payout Threshold" value="$50" sublabel="Minimum payout" />
            <StatCard label="Payment" value="Monthly" sublabel="PayPal or bank transfer" />
          </div>
          <div className="mt-8 bg-white/5 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-accent-primary uppercase tracking-wider mb-3">
              Example Earnings
            </h3>
            <div className="space-y-2 text-sm text-text-secondary">
              <p>Align Pro costs <strong className="text-text-primary">$9/month</strong>. Your 20% commission = <strong className="text-green-400">$1.80/month per user</strong>.</p>
              <p>Refer 50 users = <strong className="text-green-400">$90/month recurring</strong>.</p>
              <p>Refer 200 users = <strong className="text-green-400">$360/month recurring</strong>.</p>
              <p>Refer 1,000 users = <strong className="text-green-400">$1,800/month recurring</strong>.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-display font-bold text-text-primary text-center mb-10">
          What you get as an affiliate
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BenefitCard
            icon="&#x1F517;"
            title="Unique Referral Link"
            description="Your own link that tracks every click, signup, and conversion with 30-day cookie attribution."
          />
          <BenefitCard
            icon="&#x1F4CA;"
            title="Real-Time Dashboard"
            description="Track your clicks, signups, conversions, and earnings in real time from your affiliate dashboard."
          />
          <BenefitCard
            icon="&#x1F4B0;"
            title="20% Recurring Commission"
            description="Earn on every monthly payment, not just the first. Your income grows as your referrals stay subscribed."
          />
          <BenefitCard
            icon="&#x1F3AF;"
            title="High Conversion Rate"
            description="Align converts well because it offers real value: 26+ readings, AI astrologer, and a cosmic community."
          />
          <BenefitCard
            icon="&#x1F4F1;"
            title="Works on Web & Mobile"
            description="Your link works for both the website and the Google Play Store app. Attribution carries across platforms."
          />
          <BenefitCard
            icon="&#x1F4E7;"
            title="Dedicated Support"
            description="Get help from our affiliate team. We want you to succeed because when you earn, we grow."
          />
        </div>
      </section>

      {/* Who should apply */}
      <section className="max-w-4xl mx-auto px-6 pb-20 text-center">
        <h2 className="text-2xl font-display font-bold text-text-primary mb-4">
          Perfect for
        </h2>
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {['Astrology bloggers', 'YouTube creators', 'TikTok astrologers', 'Podcast hosts',
            'Newsletter writers', 'Instagram influencers', 'Tarot readers', 'Spiritual coaches',
            'App reviewers', 'Astrology teachers',
          ].map(tag => (
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
            Apply to the Affiliate Program
          </h2>
          <p className="text-text-muted text-sm text-center mb-8">
            We review applications within 24-48 hours.
          </p>

          {formState === 'success' ? (
            <div className="text-center">
              <div className="text-5xl mb-4">&#x1F389;</div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Application Submitted!</h3>
              <p className="text-text-secondary text-sm mb-4">
                Your affiliate code is: <strong className="text-accent-primary">{affiliateCode}</strong>
              </p>
              <p className="text-text-muted text-sm">
                We will review your application and email you at <strong>{email}</strong> once approved.
                Your referral link will be:
              </p>
              <p className="text-accent-primary text-sm font-mono mt-2 break-all">
                https://aligncosmic.com/ref/{affiliateCode}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  minLength={2}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">Email *</label>
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
                <label className="block text-sm text-text-secondary mb-1">Website / Blog</label>
                <input
                  type="url"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="https://yourblog.com"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">Social Media Handle</label>
                <input
                  type="text"
                  value={social}
                  onChange={e => setSocial(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="@yourhandle"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">How will you promote Align?</label>
                <textarea
                  value={promoMethod}
                  onChange={e => setPromoMethod(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-border-primary text-text-primary text-sm focus:outline-none focus:border-accent-primary transition-colors resize-none"
                  placeholder="Blog posts, YouTube videos, social media, newsletter..."
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
                {formState === 'submitting' ? 'Submitting...' : 'Submit Application'}
              </button>

              <p className="text-text-muted text-xs text-center">
                By applying, you agree to our affiliate terms. Commission is 20% recurring
                on all subscription payments from referred users.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-primary py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Align. All rights reserved.
          </span>
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href="/" className="hover:text-text-secondary">Home</Link>
            <Link href="/pricing" className="hover:text-text-secondary">Pricing</Link>
            <Link href="/settings/terms" className="hover:text-text-secondary">Terms</Link>
            <Link href="/settings/privacy" className="hover:text-text-secondary">Privacy</Link>
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
