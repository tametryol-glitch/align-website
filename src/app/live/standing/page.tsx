'use client';

// ═══════════════════════════════════════════════════════════════════
// Live standing — what your hearts have earned you.
//
// Deliberately explicit that hearts are not money. A creator who
// believes a heart is worth a cent will be angry later; one who
// understands hearts buy reach and gifts buy income will chase the
// right thing.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { getLiveStanding, type LiveStanding } from '@/lib/liveRewards';
import { StandingCard, TierLadder } from '@/components/live/TierBadge';
import { ArrowLeft, Loader2, Radio } from 'lucide-react';

export default function LiveStandingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [standing, setStanding] = useState<LiveStanding | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/auth/login?next=/live/standing');
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!user?.id) return;
    getLiveStanding(user.id)
      .then(setStanding)
      .catch(() => setStanding(null))
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-lg mx-auto px-5 py-8">
        <div className="flex items-center gap-3 mb-7">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-2xl font-semibold">Live standing</h1>
        </div>

        <StandingCard standing={standing} />

        <h2 className="text-sm font-medium text-white/70 mt-8 mb-3">Tiers</h2>
        <TierLadder current={standing?.tier} />

        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-medium text-white/80 mb-2">How hearts count</h2>
          <ul className="text-xs text-white/50 space-y-1.5 leading-relaxed list-disc pl-4">
            <li>Only distinct people count. One person tapping five thousand times is one person.</li>
            <li>Up to 50 hearts per person, per stream, count toward your tier.</li>
            <li>They have to have watched for at least a minute.</li>
            <li>Your own hearts on your own stream do not count.</li>
          </ul>
          <p className="text-xs text-white/40 mt-3 leading-relaxed">
            Tiers buy reach — placement in the live rail, a badge, and priority when you go live.
            They are not paid out as money. Paid gifting is a separate system and is not live yet.
          </p>
        </div>

        {!standing && (
          <div className="mt-8 text-center">
            <p className="text-sm text-white/45 mb-4">You haven&rsquo;t streamed yet.</p>
            <Link
              href="/live/go"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 rounded-lg px-5 py-2.5 text-sm font-medium"
            >
              <Radio className="w-4 h-4" /> Go live
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
