'use client';

import { useState, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Sparkles, Gift, CheckCircle, Check } from 'lucide-react';
import { verifyAffiliateCode, trackAffiliateClick, setAffiliateCookie } from '@/lib/affiliateService';
import { PLANS } from '@/lib/plans';

const FREE_PERKS = [
  'Natal chart overview (Sun, Moon, Rising)',
  '3 AI-powered readings every month',
  'Daily horoscope & tarot card draw',
  'Planetary hours calculator',
];

export default function SignupPage() {
  return (
    <Suspense>
      <SignupPageInner />
    </Suspense>
  );
}

function validatePassword(pw: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (pw.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(pw)) errors.push('Password must contain at least 1 uppercase letter');
  if (!/[a-z]/.test(pw)) errors.push('Password must contain at least 1 lowercase letter');
  if (!/[0-9]/.test(pw)) errors.push('Password must contain at least 1 number');
  return { valid: errors.length === 0, errors };
}

function SignupPageInner() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref');
  const sourceParam = searchParams.get('source');
  const hasAffiliateLink = referralCode && sourceParam === 'affiliate';
  // Plan intent carried over from the pricing page ("Get Premium" while logged out)
  const planParam = searchParams.get('plan');
  const intendedPlan = planParam && planParam !== 'free' && planParam in PLANS
    ? PLANS[planParam as keyof typeof PLANS]
    : null;

  // Manual affiliate code entry state
  const [showAffiliateInput, setShowAffiliateInput] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState('');
  const [affiliateVerified, setAffiliateVerified] = useState(false);
  const [affiliateVerifying, setAffiliateVerifying] = useState(false);
  const [affiliateName, setAffiliateName] = useState('');
  const [affiliateError, setAffiliateError] = useState('');

  // Effective referral code: URL param takes priority, then manually entered code
  const effectiveRef = referralCode || (affiliateVerified ? affiliateCode.trim() : null);

  async function verifyAndTrackCode(code: string) {
    const trimmed = code.trim();
    if (!trimmed) return;
    setAffiliateVerifying(true);
    setAffiliateError('');

    const verification = await verifyAffiliateCode(trimmed);
    if (!verification.valid) {
      setAffiliateError('Invalid referral code');
      setAffiliateVerified(false);
      setAffiliateVerifying(false);
      return;
    }

    setAffiliateName(verification.name || '');

    // Track click and set attribution cookie (enables 10% discount at checkout)
    const result = await trackAffiliateClick(trimmed);
    if (result.ok && result.affiliate_id) {
      setAffiliateCookie(result.affiliate_id, result.cookie_days || 30, result.click_id);
    }

    setAffiliateVerified(true);
    setAffiliateVerifying(false);
  }

  async function handleGoogleSignup() {
    const supabase = createClient();
    const redirectUrl = effectiveRef
      ? `${window.location.origin}/auth/callback?ref=${effectiveRef}`
      : `${window.location.origin}/auth/callback`;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl },
    });
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const pwResult = validatePassword(password);
    if (!pwResult.valid) {
      setPasswordErrors(pwResult.errors);
      return;
    }
    setPasswordErrors([]);
    setLoading(true);

    const supabase = createClient();
    const emailRedirectUrl = effectiveRef
      ? `${window.location.origin}/auth/callback?ref=${effectiveRef}`
      : `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, referral_code: effectiveRef || undefined },
        emailRedirectTo: emailRedirectUrl,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
      setResent(true);
    } catch {
      setResendError('Could not resend. Please wait a minute and try again.');
    } finally {
      setResending(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/20 mb-4">
            <Sparkles className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-display font-bold text-text-primary mb-2">{t('auth.emailSent')}</h1>
          <p className="text-text-tertiary">
            We sent a confirmation link to <strong className="text-text-secondary">{email}</strong>
          </p>
          <p className="text-text-muted text-sm mt-3">
            Don&apos;t see it? Check your <strong className="text-text-secondary">spam or junk folder</strong> — it can take a minute to arrive.
          </p>
          <div className="mt-5">
            {resent ? (
              <p className="text-green-400 text-sm">Confirmation email resent!</p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-sm text-accent-primary hover:text-accent-secondary underline underline-offset-2"
              >
                {resending ? 'Resending...' : 'Resend confirmation email'}
              </button>
            )}
            {resendError && <p className="text-red-400 text-xs mt-2">{resendError}</p>}
          </div>
          <Link href="/auth/login" className="btn-ghost mt-6 inline-block">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="Align logo" width={64} height={64} className="w-16 h-16 rounded-2xl mx-auto mb-4" />
          <h1 className="text-3xl font-display font-bold text-text-primary">{t('auth.signup')}</h1>
          <p className="text-text-tertiary mt-2">{t('auth.subtitle')}</p>
        </div>

        <div className="card">
          {intendedPlan && (
            <div className="flex items-center gap-2 bg-accent-muted border border-accent-primary/30 rounded-lg px-3 py-2.5 mb-4">
              <Sparkles className="w-4 h-4 text-accent-primary shrink-0" />
              <p className="text-xs text-text-secondary">
                Create your free account first — then unlock <span className="font-semibold text-text-primary">{intendedPlan.name}</span> (${intendedPlan.price}/mo) from the Plans page.
              </p>
            </div>
          )}

          <div className="mb-5">
            <p className="text-xs font-semibold tracking-wide uppercase text-text-tertiary mb-2">
              Your free account includes
            </p>
            <ul className="space-y-1.5">
              {FREE_PERKS.map((perk) => (
                <li key={perk} className="flex items-start gap-2 text-xs text-text-secondary">
                  <Check className="w-3.5 h-3.5 text-green-400 mt-px shrink-0" />
                  {perk}
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-text-muted mt-2">Free forever. No credit card required.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('auth.displayName')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder={t('auth.yourName')}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('auth.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('auth.password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (passwordErrors.length) setPasswordErrors([]); }}
                className="input"
                placeholder="•••••••���"
                minLength={8}
                required
              />
              {passwordErrors.length > 0 && (
                <ul className="mt-1.5 space-y-0.5">
                  {passwordErrors.map((err, i) => (
                    <li key={i} className="text-xs text-red-400">{err}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Affiliate referral code */}
            {hasAffiliateLink ? (
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/20 rounded-lg px-3 py-2.5">
                <Gift className="w-4 h-4 text-purple-400 shrink-0" />
                <p className="text-xs text-purple-300">
                  Referral code applied &mdash; <span className="font-semibold text-white">10% off</span> your first 2 months!
                </p>
              </div>
            ) : !showAffiliateInput ? (
              <button
                type="button"
                onClick={() => setShowAffiliateInput(true)}
                className="text-sm text-text-muted hover:text-accent-primary transition-colors"
              >
                Have a referral code?
              </button>
            ) : (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Referral Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={affiliateCode}
                    onChange={(e) => {
                      setAffiliateCode(e.target.value);
                      if (affiliateVerified) { setAffiliateVerified(false); setAffiliateName(''); }
                      if (affiliateError) setAffiliateError('');
                    }}
                    className="input flex-1"
                    placeholder="e.g. COSMICJANE"
                    autoCapitalize="none"
                  />
                  <button
                    type="button"
                    onClick={() => verifyAndTrackCode(affiliateCode)}
                    disabled={affiliateVerifying || !affiliateCode.trim()}
                    className="btn-secondary px-4 text-sm shrink-0"
                  >
                    {affiliateVerifying ? 'Checking...' : 'Apply'}
                  </button>
                </div>
                {affiliateVerified && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                    <p className="text-green-400 text-xs">
                      Referred by {affiliateName || 'affiliate'} &mdash; 10% off your first 2 months!
                    </p>
                  </div>
                )}
                {affiliateError && (
                  <p className="text-red-400 text-xs mt-1.5">{affiliateError}</p>
                )}
              </div>
            )}

            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? t('common.loading') : t('auth.signup')}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-primary" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-bg-card text-text-muted">{t('auth.orContinueWith')}</span>
            </div>
          </div>

          <button onClick={handleGoogleSignup} className="btn-secondary w-full flex items-center justify-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('auth.google')}
          </button>

          <p className="text-center text-sm text-text-muted mt-6">
            {t('auth.hasAccount')}{' '}
            <Link href="/auth/login" className="text-accent-primary hover:text-accent-secondary">
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
