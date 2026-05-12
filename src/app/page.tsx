import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Align — AI Astrology, Natal Charts & Cosmic Compatibility',
  description: 'Professional-grade astrology powered by AI. Get your natal chart, check compatibility, explore 26+ readings, and join a cosmic community. Free to start.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="text-xl font-display font-bold text-text-primary flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Align" className="w-8 h-8 rounded-lg" />
          Align
        </span>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Sign In
          </Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center px-6 pt-16 pb-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Align" className="w-24 h-24 rounded-2xl mx-auto mb-6" />
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-muted text-accent-primary text-xs font-medium mb-6">
          26+ AI-Powered Readings
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-bold text-text-primary leading-tight mb-6">
          Discover your<br />
          <span className="bg-gradient-to-r from-[#9B6FF6] to-[#EC4899] bg-clip-text text-transparent">
            cosmic blueprint
          </span>
        </h1>
        <p className="text-lg text-text-tertiary max-w-2xl mx-auto mb-10">
          Professional-grade astrology meets AI. Get your natal chart, check compatibility with anyone, explore soul gifts, and join a thriving cosmic community.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/signup" className="btn-primary text-base px-8 py-3">
            Start Free — No Card Needed
          </Link>
          <Link href="/auth/login" className="btn-ghost text-base px-8 py-3">
            I have an account
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-display font-bold text-text-primary text-center mb-10">
          Everything you need, written in the stars
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            glyph="☉"
            title="Natal Chart"
            description="Full birth chart with planets, houses, aspects, patterns, and asteroid placements."
          />
          <FeatureCard
            glyph="♥"
            title="Compatibility"
            description="Deep synastry analysis across 8 dimensions: emotional, passion, karmic, and more."
          />
          <FeatureCard
            glyph="🤖"
            title="AI Astrologer"
            description="Ask anything about your chart. Voice-enabled AI that knows your placements."
          />
          <FeatureCard
            glyph="🔮"
            title="26+ Readings"
            description="Tarot, numerology, soul gifts, starseed origins, human design, and beyond."
          />
          <FeatureCard
            glyph="🌍"
            title="World Echo"
            description="Discover historical events that share today's planetary alignments."
          />
          <FeatureCard
            glyph="👥"
            title="Cosmic Community"
            description="Feed, communities, friends, compatibility matches, and real-time messaging."
          />
        </div>
      </section>

      {/* Social Proof */}
      <section className="max-w-4xl mx-auto px-6 pb-20 text-center">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-3xl font-bold text-accent-primary">26+</p>
            <p className="text-xs text-text-muted mt-1">Reading Types</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-accent-primary">55+</p>
            <p className="text-xs text-text-muted mt-1">Asteroids Tracked</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-accent-primary">6</p>
            <p className="text-xs text-text-muted mt-1">Chart Types</p>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="max-w-3xl mx-auto px-6 pb-20 text-center">
        <h2 className="text-2xl font-display font-bold text-text-primary mb-3">
          Start free. Upgrade when ready.
        </h2>
        <p className="text-text-tertiary mb-6">
          Natal charts, planetary hours, angel numbers, tarot, and more are free forever. Unlock the full cosmos from $9/month.
        </p>
        <Link href="/pricing" className="btn-secondary inline-block px-8 py-3">
          See Plans
        </Link>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-24 text-center">
        <div className="bg-gradient-cosmic rounded-3xl p-10 border border-accent-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Align" className="w-14 h-14 rounded-xl mx-auto mb-4" />
          <h2 className="text-3xl font-display font-bold text-text-primary mb-4">
            Ready to align with the cosmos?
          </h2>
          <p className="text-text-tertiary mb-8 max-w-lg mx-auto">
            Create your free account in seconds. No credit card required.
          </p>
          <Link href="/auth/signup" className="btn-primary text-base px-10 py-3">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-primary py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Align. All rights reserved.
          </span>
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href="/settings/terms" className="hover:text-text-secondary">Terms</Link>
            <Link href="/settings/privacy" className="hover:text-text-secondary">Privacy</Link>
            <Link href="/settings/community-guidelines" className="hover:text-text-secondary">Guidelines</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ glyph, title, description }: { glyph: string; title: string; description: string }) {
  return (
    <div className="rounded-2xl p-6 border border-border-primary bg-bg-card hover:border-accent-primary/30 transition-colors">
      <span className="text-3xl block mb-3">{glyph}</span>
      <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-tertiary">{description}</p>
    </div>
  );
}
