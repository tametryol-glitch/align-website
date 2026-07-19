'use client';

/**
 * /ref/[code] — Affiliate referral landing page.
 *
 * When someone clicks an affiliate link:
 * 1. Verify the affiliate code is valid
 * 2. Track the click via the API
 * 3. Set a 30-day attribution cookie
 * 4. Redirect to signup with ?ref= param
 *
 * If the affiliate is invalid, redirect to the homepage.
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  trackAffiliateClick,
  setAffiliateCookie,
  verifyAffiliateCode,
} from '@/lib/affiliateService';

export default function AffiliateRefPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [affiliateName, setAffiliateName] = useState<string>('');

  useEffect(() => {
    let completed = false;

    async function handleAffiliateClick() {
      try {
        // 1. Verify the code
        const verification = await verifyAffiliateCode(code);
        if (!verification.valid) {
          completed = true;
          setStatus('invalid');
          // Redirect to homepage after brief delay
          setTimeout(() => router.replace('/'), 2000);
          return;
        }

        setAffiliateName(verification.name || '');
        setStatus('valid');
        completed = true;

        // 2. Track the click
        const result = await trackAffiliateClick(code);
        if (result.ok && result.affiliate_id) {
          // 3. Set attribution cookie
          setAffiliateCookie(
            result.affiliate_id,
            result.cookie_days || 30,
            result.click_id,
          );
        }

        // 4. Redirect to signup after a brief branded splash
        setTimeout(() => {
          router.push(`/auth/signup?ref=${encodeURIComponent(code)}&source=affiliate`);
        }, 2500);
      } catch {
        // Catch-all: if anything unexpected throws, go to invalid
        if (!completed) {
          setStatus('invalid');
          setTimeout(() => router.replace('/'), 2000);
        }
      }
    }

    if (code) {
      handleAffiliateClick();
      // Safety net: if API hangs or something unexpected happens,
      // don't leave the user on a loading spinner forever
      const safetyTimer = setTimeout(() => {
        if (!completed) {
          setStatus('invalid');
          router.replace('/');
        }
      }, 10000);
      return () => clearTimeout(safetyTimer);
    }
  }, [code, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-3 border-accent-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-text-muted text-sm">{t('affiliates.refLanding.settingUp')}</p>
        </div>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">&#x26A0;&#xFE0F;</div>
          <h1 className="text-xl font-bold text-text-primary mb-2">
            {t('affiliates.refLanding.invalidTitle')}
          </h1>
          <p className="text-text-muted text-sm mb-4">
            {t('affiliates.refLanding.invalidDesc')}
          </p>
          <Link href="/" className="btn-primary inline-block px-6 py-2">
            {t('affiliates.refLanding.goToAlign')}
          </Link>
        </div>
      </div>
    );
  }

  // Valid — show branded splash before redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="text-center max-w-md">
        <Image
          src="/logo.png"
          alt={t('affiliates.refLanding.logoAlt')}
          width={80}
          height={80}
          className="w-20 h-20 rounded-2xl mx-auto mb-6"
        />
        <h1 className="text-2xl font-display font-bold text-text-primary mb-3">
          {t('affiliates.refLanding.welcomeTitle')}
        </h1>
        {affiliateName && (
          <p className="text-accent-primary text-sm mb-2">
            {t('affiliates.refLanding.referredBy', { name: affiliateName })}
          </p>
        )}
        <p className="text-text-tertiary text-sm mb-4">
          {t('affiliates.refLanding.description')}
        </p>

        {/* Affiliate discount callout */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl px-4 py-3 mb-6">
          <p className="text-sm font-semibold text-white">
            {t('affiliates.refLanding.discountTitle')}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {t('affiliates.refLanding.discountSub')}
          </p>
        </div>

        {/* Redirect indicator */}
        <div className="flex items-center justify-center gap-2 text-text-muted text-xs mb-6">
          <div className="animate-spin w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full" />
          {t('affiliates.refLanding.redirecting')}
        </div>

        {/* Manual link if redirect fails */}
        <Link
          href={`/auth/signup?ref=${encodeURIComponent(code)}&source=affiliate`}
          className="btn-primary inline-block w-full py-3 text-base"
        >
          {t('affiliates.refLanding.signUpFree')}
        </Link>
        <p className="text-text-muted text-xs mt-3">
          {t('affiliates.refLanding.freeForever')}
        </p>
      </div>
    </div>
  );
}
