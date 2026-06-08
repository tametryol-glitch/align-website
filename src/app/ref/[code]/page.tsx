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
import {
  trackAffiliateClick,
  setAffiliateCookie,
  verifyAffiliateCode,
} from '@/lib/affiliateService';

export default function AffiliateRefPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [affiliateName, setAffiliateName] = useState<string>('');

  useEffect(() => {
    async function handleAffiliateClick() {
      // 1. Verify the code
      const verification = await verifyAffiliateCode(code);
      if (!verification.valid) {
        setStatus('invalid');
        // Redirect to homepage after brief delay
        setTimeout(() => router.replace('/'), 2000);
        return;
      }

      setAffiliateName(verification.name || '');
      setStatus('valid');

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
    }

    if (code) handleAffiliateClick();
  }, [code, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-3 border-accent-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-text-muted text-sm">Setting up your referral...</p>
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
            Invalid Referral Link
          </h1>
          <p className="text-text-muted text-sm mb-4">
            This affiliate link is no longer active. Redirecting you to Align...
          </p>
          <Link href="/" className="btn-primary inline-block px-6 py-2">
            Go to Align
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
          alt="Align logo"
          width={80}
          height={80}
          className="w-20 h-20 rounded-2xl mx-auto mb-6"
        />
        <h1 className="text-2xl font-display font-bold text-text-primary mb-3">
          Welcome to Align
        </h1>
        {affiliateName && (
          <p className="text-accent-primary text-sm mb-2">
            Referred by {affiliateName}
          </p>
        )}
        <p className="text-text-tertiary text-sm mb-6">
          Discover your cosmic blueprint with AI-powered astrology,
          natal charts, and 26+ readings.
        </p>

        {/* Redirect indicator */}
        <div className="flex items-center justify-center gap-2 text-text-muted text-xs mb-6">
          <div className="animate-spin w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full" />
          Taking you to sign up...
        </div>

        {/* Manual link if redirect fails */}
        <Link
          href={`/auth/signup?ref=${encodeURIComponent(code)}&source=affiliate`}
          className="btn-primary inline-block w-full py-3 text-base"
        >
          Sign Up Free
        </Link>
        <p className="text-text-muted text-xs mt-3">
          Free forever. No credit card needed.
        </p>
      </div>
    </div>
  );
}
