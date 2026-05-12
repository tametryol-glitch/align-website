import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Join Align — You\'ve Been Invited',
  description: 'Someone shared their cosmic connection with you. Join Align to discover your natal chart, check compatibility, and explore 26+ AI readings.',
};

export default function ReferralPage({ params }: { params: { code: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Align" className="w-20 h-20 rounded-2xl mx-auto mb-6" />
        <h1 className="text-3xl font-display font-bold text-text-primary mb-3">
          You&apos;ve been invited to Align
        </h1>
        <p className="text-text-tertiary mb-8">
          Discover your cosmic blueprint with AI-powered astrology, natal charts, compatibility readings, and a thriving community.
        </p>

        <div className="bg-bg-card border border-border-primary rounded-xl p-5 mb-6 text-left">
          <p className="text-xs font-semibold text-accent-primary uppercase tracking-wider mb-3">What you get free</p>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-center gap-2"><span className="text-accent-primary">✦</span> Full natal chart with planets &amp; houses</li>
            <li className="flex items-center gap-2"><span className="text-accent-primary">✦</span> Tarot, angel numbers &amp; planetary hours</li>
            <li className="flex items-center gap-2"><span className="text-accent-primary">✦</span> Cosmic feed &amp; community access</li>
            <li className="flex items-center gap-2"><span className="text-accent-primary">✦</span> AI Astrologer questions</li>
          </ul>
        </div>

        <Link
          href={`/auth/signup?ref=${params.code}`}
          className="btn-primary inline-block w-full text-base py-3 mb-3"
        >
          Join Free
        </Link>
        <Link href="/auth/login" className="text-sm text-text-muted hover:text-text-secondary transition-colors">
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}
