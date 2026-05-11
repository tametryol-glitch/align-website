'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

interface Props {
  message?: string;
}

export function BirthDataPrompt({ message }: Props) {
  const { isLoading } = useAuthStore();

  // While auth/profile is still loading, show a spinner instead of the prompt
  // This prevents a flash of "Birth Data Required" before profile loads
  if (isLoading) {
    return (
      <div className="max-w-md mx-auto flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center py-16">
      <span className="text-5xl block mb-4">🌌</span>
      <h2 className="text-xl font-display font-bold text-text-primary mb-2">
        Birth Data Required
      </h2>
      <p className="text-text-tertiary text-sm mb-6">
        {message || 'Add your birth date, time, and location to unlock this feature.'}
      </p>
      <Link href="/profile" className="btn-primary inline-block">
        Complete Profile
      </Link>
    </div>
  );
}
