'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, DollarSign } from 'lucide-react';

const DISMISS_KEY = 'align_earn_promo_dismissed_v1';

export function EarnPromoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(DISMISS_KEY)) setVisible(true);
    } catch {
      // localStorage unavailable — keep banner hidden
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {}
  };

  if (!visible) return null;

  return (
    <div
      className="relative rounded-xl border border-purple-500/30 p-4 mb-4 flex items-center gap-3"
      style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(168,85,247,0.08))' }}
    >
      <DollarSign className="w-5 h-5 text-purple-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-purple-200">
          New: Earn with Align — get 20% recurring commissions as an affiliate, or monetize your
          content with the Creator Program.
        </p>
      </div>
      <Link
        href="/affiliates"
        onClick={dismiss}
        className="shrink-0 px-4 py-2 rounded-lg bg-accent-primary hover:bg-accent-primary/90 text-white text-sm font-medium transition-colors"
      >
        Learn More
      </Link>
      <button
        onClick={dismiss}
        className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-text-muted" />
      </button>
    </div>
  );
}
