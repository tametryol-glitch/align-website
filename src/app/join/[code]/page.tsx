'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { processReferral } from '@/lib/referralService';

export default function ReferralPage() {
  const params = useParams();
  const code = params.code as string;
  const [referralProcessed, setReferralProcessed] = useState(false);

  // If user lands here already authenticated (e.g. OAuth redirect),
  // try to process the referral automatically
  useEffect(() => {
    async function tryProcessReferral() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user && code) {
        const success = await processReferral(code, user.id);
        if (success) {
          setReferralProcessed(true);
        }
      }
    }
    tryProcessReferral();
  }, [code]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="text-center">
          <Image src="/logo.png" alt="Align logo" width={80} height={80} className="w-20 h-20 rounded-2xl mx-auto mb-6" />
          <h1 className="text-3xl font-display font-bold text-text-primary mb-3">
            You&apos;ve been invited to Align
          </h1>
          <p className="text-text-tertiary mb-8">
            Discover your cosmic blueprint with AI-powered astrology, natal charts, compatibility readings, and a thriving community.
          </p>

          {/* Referral bonus banner */}
          {referralProcessed ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-300 text-left">
                You and your friend each got <strong>5 bonus readings!</strong>
              </p>
            </div>
          ) : (
            <div className="bg-accent-primary/10 border border-accent-primary/30 rounded-xl p-4 mb-6 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-accent-primary flex-shrink-0" />
              <p className="text-sm text-text-secondary text-left">
                Sign up now and you <strong className="text-accent-primary">both</strong> get 5 bonus readings!
              </p>
            </div>
          )}

          <div className="bg-bg-card border border-border-primary rounded-xl p-5 mb-6 text-left">
            <p className="text-xs font-semibold text-accent-primary uppercase tracking-wider mb-3">What you get free</p>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-center gap-2"><span className="text-accent-primary">&#10022;</span> Full natal chart with planets &amp; houses</li>
              <li className="flex items-center gap-2"><span className="text-accent-primary">&#10022;</span> Tarot, angel numbers &amp; planetary hours</li>
              <li className="flex items-center gap-2"><span className="text-accent-primary">&#10022;</span> Cosmic feed &amp; community access</li>
              <li className="flex items-center gap-2"><span className="text-accent-primary">&#10022;</span> AI Astrologer questions</li>
            </ul>
          </div>

          <Link
            href={`/auth/signup?ref=${code}`}
            className="btn-primary inline-block w-full text-base py-3 mb-3"
          >
            Join Free
          </Link>
          <Link href="/auth/login" className="text-sm text-text-muted hover:text-text-secondary transition-colors">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
