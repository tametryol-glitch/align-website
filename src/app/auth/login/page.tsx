'use client';

import { useState, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Sparkles, Gift, CheckCircle } from 'lucide-react';
import { verifyAffiliateCode, trackAffiliateClick, setAffiliateCookie } from '@/lib/affiliateService';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const refParam = searchParams.get('ref');

  // Manual affiliate code entry state
  const [showAffiliateInput, setShowAffiliateInput] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState('');
  const [affiliateVerified, setAffiliateVerified] = useState(false);
  const [affiliateVerifying, setAffiliateVerifying] = useState(false);
  const [affiliateName, setAffiliateName] = useState('');
  const [affiliateError, setAffiliateError] = useState('');

  const effectiveRef = refParam || (affiliateVerified ? affiliateCode.trim() : null);

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

    const result = await trackAffiliateClick(trimmed);
    if (result.ok && result.affiliate_id) {
      setAffiliateCookie(result.affiliate_id, result.cookie_days || 30, result.click_id);
    }

    setAffiliateVerified(true);
    setAffiliateVerifying(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    const redirectUrl = effectiveRef
      ? `${window.location.origin}/auth/callback?ref=${effectiveRef}`
      : `${window.location.origin}/auth/callback`;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="Align logo" width={64} height={64} className="w-16 h-16 rounded-2xl mx-auto mb-4" />
          <h1 className="text-3xl font-display font-bold text-text-primary">{t('auth.welcome')}</h1>
          <p className="text-text-tertiary mt-2">{t('auth.subtitle')}</p>
        </div>

        <div className="card">
          <form onSubmit={handleLogin} className="space-y-4">
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
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Affiliate referral code */}
            {refParam ? (
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
              {loading ? t('common.loading') : t('auth.login')}
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

          <button onClick={handleGoogleLogin} className="btn-secondary w-full flex items-center justify-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('auth.google')}
          </button>

          <p className="text-center text-sm text-text-muted mt-6">
            {t('auth.noAccount')}{' '}
            <Link href="/auth/signup" className="text-accent-primary hover:text-accent-secondary">
              {t('auth.signup')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
