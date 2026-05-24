'use client';

/**
 * /r/[id] — Shared reel deep-link page.
 *
 * - Authenticated users are redirected to /reels (the web reels page).
 * - Unauthenticated users see a sign-up CTA with a reel preview.
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/authStore';

export default function ReelDeepLinkPage() {
  const { t } = useTranslation();
  const params = useParams();
  const reelId = params?.id as string;
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  // Authenticated → go straight to reels
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/reels');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isAuthenticated) {
    // Will redirect above; show loading in the meantime
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Unauthenticated → sign up CTA
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Top bar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border-primary">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Align" width={32} height={32} className="w-8 h-8 rounded-lg" />
          <span className="text-lg font-bold text-text-primary">Align</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            {t('auth.login')}
          </Link>
          <Link href="/auth/signup" className="bg-accent-primary hover:bg-accent-primary/90 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors">
            {t('auth.signup')}
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Reel preview placeholder */}
          <div className="bg-black rounded-2xl overflow-hidden mx-auto" style={{ maxWidth: 320, aspectRatio: '9/16' }}>
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <span className="text-5xl">&#x1F3AC;</span>
              <span className="text-white/70 text-sm">Reel shared on Align</span>
              <span className="text-3xl text-accent-primary">&#x25B6;</span>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-text-primary">
              Sign up to watch this reel
            </h2>
            <p className="text-sm text-text-muted">
              Align is the cosmic social app. Astrology, charts, compatibility, and community.
            </p>
            <Link
              href="/auth/signup"
              className="block w-full bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold py-3 rounded-xl transition-colors text-center"
            >
              {t('auth.signup')}
            </Link>
            <Link
              href="/auth/login"
              className="block w-full bg-bg-tertiary hover:bg-bg-elevated text-text-secondary font-medium py-3 rounded-xl transition-colors text-center"
            >
              {t('auth.hasAccount')} {t('auth.login')}
            </Link>
            <a
              href="https://play.google.com/store/apps/details?id=com.align.astrology"
              className="block text-sm text-accent-secondary hover:underline mt-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Or download the app on Google Play
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
