'use client';

import Link from 'next/link';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { PaywallGate } from '@/components/ui/PaywallGate';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { RectificationAgentChat } from '@/components/rectification/RectificationAgentChat';

export default function GuidedRectificationPage() {
  const profile = useAuthStore((s) => s.profile);

  if (!profile?.birth_date || profile?.latitude == null) {
    return (
      <PaywallGate feature="rectification" fallbackTier="pro">
        <BirthDataPrompt message="Add your birth date and place to start guided rectification." />
      </PaywallGate>
    );
  }

  return (
    <PaywallGate feature="rectification" fallbackTier="pro">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/readings/rectification"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to the full questionnaire
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="w-8 h-8 text-accent-primary" />
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">
              Guided Birth Time
            </h1>
            <p className="text-text-tertiary text-sm">
              A conversation instead of a form — answer in your own words
            </p>
          </div>
        </div>

        <RectificationAgentChat />
      </div>
    </PaywallGate>
  );
}
