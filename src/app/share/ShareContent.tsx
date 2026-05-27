'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { BigThreeCard, CompatibilityCard } from '@/components/share';

// ── Valid zodiac signs for validation ──

const VALID_SIGNS = new Set([
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
]);

function normalizeSign(raw: string | null): string {
  if (!raw) return 'Aries';
  const s = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  return VALID_SIGNS.has(s) ? s : 'Aries';
}

// ── Inner component that reads searchParams ──

function ShareInner() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'big-three';

  if (type === 'big-three') {
    const sun = normalizeSign(searchParams.get('sun'));
    const moon = normalizeSign(searchParams.get('moon'));
    const rising = normalizeSign(searchParams.get('rising'));
    const name = searchParams.get('name') || 'A Fellow Stargazer';

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
        style={{ background: 'linear-gradient(160deg, #0a0618 0%, #110d2b 40%, #1a1040 70%, #0a0618 100%)' }}
      >
        <div className="mb-8 transform hover:scale-[1.02] transition-transform duration-300">
          <BigThreeCard
            displayName={name}
            sunSign={sun}
            moonSign={moon}
            risingSign={rising}
            aspect="story"
          />
        </div>

        <div className="text-center max-w-sm">
          <h2 className="text-xl font-bold text-white mb-2">
            Discover Your Big Three
          </h2>
          <p className="text-sm text-white/50 mb-6">
            Find out your Sun, Moon, and Rising signs with AI-powered natal chart analysis on Align.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #9B6FF6)' }}
            >
              Get Your Free Chart
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white/60 hover:text-white transition-colors text-sm"
            >
              I already have an account
            </Link>
          </div>
        </div>

        <p className="mt-12 text-xs text-white/20">
          aligncosmic.com
        </p>
      </div>
    );
  }

  if (type === 'compatibility') {
    const u1 = searchParams.get('u1') || 'Person 1';
    const s1 = normalizeSign(searchParams.get('s1'));
    const u2 = searchParams.get('u2') || 'Person 2';
    const s2 = normalizeSign(searchParams.get('s2'));
    const pct = Math.min(100, Math.max(0, Number(searchParams.get('pct')) || 75));

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
        style={{ background: 'linear-gradient(160deg, #0a0618 0%, #110d2b 40%, #1a1040 70%, #0a0618 100%)' }}
      >
        <div className="mb-8 transform hover:scale-[1.02] transition-transform duration-300">
          <CompatibilityCard
            user1Name={u1}
            user1Sign={s1}
            user2Name={u2}
            user2Sign={s2}
            percentage={pct}
            aspect="story"
          />
        </div>

        <div className="text-center max-w-sm">
          <h2 className="text-xl font-bold text-white mb-2">
            Check Your Compatibility
          </h2>
          <p className="text-sm text-white/50 mb-6">
            See how your stars align with anyone using AI-powered synastry analysis on Align.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #9B6FF6)' }}
            >
              Try It Free
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white/60 hover:text-white transition-colors text-sm"
            >
              I already have an account
            </Link>
          </div>
        </div>

        <p className="mt-12 text-xs text-white/20">
          aligncosmic.com
        </p>
      </div>
    );
  }

  // Unknown type — show generic
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(160deg, #0a0618 0%, #110d2b 40%, #1a1040 70%, #0a0618 100%)' }}
    >
      <div className="text-center max-w-sm">
        <span className="text-5xl block mb-4">✦</span>
        <h1 className="text-2xl font-bold text-white mb-2">Align</h1>
        <p className="text-sm text-white/50 mb-6">
          AI-powered astrology, natal charts, and cosmic compatibility.
        </p>
        <Link
          href="/onboarding"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #9B6FF6)' }}
        >
          Get Started Free
        </Link>
      </div>
    </div>
  );
}

// ── Exported client wrapper with Suspense (required for useSearchParams) ──

export default function ShareContent() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center"
          style={{ background: 'linear-gradient(160deg, #0a0618 0%, #110d2b 40%, #1a1040 70%, #0a0618 100%)' }}
        >
          <div className="animate-pulse text-white/30 text-lg">Loading...</div>
        </div>
      }
    >
      <ShareInner />
    </Suspense>
  );
}
