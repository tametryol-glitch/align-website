'use client';

import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from 'react-i18next';
import { Sidebar } from './Sidebar';
import { BottomTabBar } from './BottomTabBar';
import { useEffect } from 'react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/auth/login';
    }
  }, [isLoading, isAuthenticated]);

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

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
        {children}
      </main>
      {/* Mobile bottom tab bar */}
      <BottomTabBar />
    </div>
  );
}
