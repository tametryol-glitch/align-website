'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getTrialStatus, TrialStatus } from '@/lib/trialService';
import Link from 'next/link';
import { X, Sparkles, AlertTriangle } from 'lucide-react';

export function TrialBanner() {
  const { user } = useAuthStore();
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getTrialStatus(user.id).then((status) => {
      setTrialStatus(status);
      setLoading(false);
    });
  }, [user]);

  if (loading || dismissed || !trialStatus) return null;

  // Trial has expired
  if (!trialStatus.isOnTrial && trialStatus.daysRemaining === 0) {
    return (
      <div className="relative rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-300">
            Your trial has ended. Upgrade to unlock Premium again.
          </p>
        </div>
        <Link
          href="/pricing"
          className="shrink-0 px-4 py-2 rounded-lg bg-accent-primary hover:bg-accent-primary/90 text-white text-sm font-medium transition-colors"
        >
          Upgrade Now
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-text-muted" />
        </button>
      </div>
    );
  }

  // Trial is expiring soon (1-2 days)
  if (trialStatus.isOnTrial && trialStatus.daysRemaining <= 2) {
    return (
      <div className="relative rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-300">
            {trialStatus.daysRemaining === 1
              ? 'Your trial ends tomorrow! Upgrade to keep Premium features.'
              : `Your trial ends in ${trialStatus.daysRemaining} days! Upgrade to keep Premium features.`}
          </p>
        </div>
        <Link
          href="/pricing"
          className="shrink-0 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors"
        >
          Upgrade Now
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-text-muted" />
        </button>
      </div>
    );
  }

  // Active trial with 3+ days remaining
  if (trialStatus.isOnTrial) {
    return (
      <div
        className="relative rounded-xl border border-purple-500/30 p-4 flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(168,85,247,0.08))' }}
      >
        <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-purple-200">
            Premium Trial: {trialStatus.daysRemaining} day{trialStatus.daysRemaining !== 1 ? 's' : ''} remaining
          </p>
        </div>
        <Link
          href="/pricing"
          className="shrink-0 px-4 py-2 rounded-lg bg-accent-primary hover:bg-accent-primary/90 text-white text-sm font-medium transition-colors"
        >
          Upgrade Now
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-text-muted" />
        </button>
      </div>
    );
  }

  return null;
}
