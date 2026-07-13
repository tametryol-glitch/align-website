'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from 'react-i18next';
import { AppShell } from './AppShell';

/**
 * Shell for pages that are public but also live inside the app (e.g. /pricing).
 * Authenticated users get the normal AppShell (sidebar + tabs); logged-out
 * visitors get a marketing header and footer instead of a login redirect.
 */
export function PublicOrAppShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-accent opacity-60" />
          <p className="text-text-muted text-sm">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) return <AppShell>{children}</AppShell>;

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <Link href="/" className="text-xl font-display font-bold text-text-primary flex items-center gap-2">
          <Image src="/logo.png" alt="Align logo" width={32} height={32} className="w-8 h-8 rounded-lg" />
          Align
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Sign In
          </Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">
            Get Started Free
          </Link>
        </div>
      </nav>
      <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      <footer className="border-t border-border-primary py-6 px-6 text-center text-sm text-text-muted">
        © {new Date().getFullYear()} Align · <Link href="/" className="hover:text-text-secondary">Home</Link>
      </footer>
    </div>
  );
}
