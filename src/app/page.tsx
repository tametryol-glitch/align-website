import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { PLANS } from '@/lib/plans';
import { StoreBadges } from '@/components/marketing/StoreBadges';
import { HeroChartPreview } from '@/components/marketing/HeroChartPreview';

export const metadata: Metadata = {
  title: 'Align — AI Astrology, Natal Charts & Cosmic Compatibility',
  description: 'Professional-grade astrology powered by AI. Get your natal chart, check compatibility, explore 26+ readings, and join a cosmic community. Free to start.',
};

const FAQS = [
  {
    q: 'Is Align really free?',
    a: 'Yes. The free plan is free forever: a natal chart overview (Sun, Moon, Rising), a daily horoscope, 3 AI-powered readings per month, a tarot card draw, and the planetary hours calculator. No credit card is required to sign up.',
  },
  {
    q: 'What do the paid plans add?',
    a: 'Paid plans raise your monthly AI reading volume and unlock advanced systems — the full natal chart with aspects and patterns, synastry and composite compatibility, progressed and solar return charts, Starseed and Human Design, astro-cartography, and more. Plans start at $4.99/month, and annual billing saves up to 30%.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Subscriptions can be cancelled at any time, and you keep access to your plan until the end of the period you already paid for.',
  },
  {
    q: 'Do I need to know my exact birth time?',
    a: "No. You can calculate your chart with an unknown birth time — Align uses noon as a fallback, and marks your Rising sign and houses as approximate. Everything based on planet-in-sign placements stays accurate.",
  },
  {
    q: 'What makes Align different from other astrology apps?',
    a: 'Align was built by one astrologer with a single coherent system: Whole-Sign houses, a published rulership scheme, and arc-second precision down to the Duad and Compendium layers. It combines 26+ reading systems, an AI astrologer that answers from your real placements, and a cosmic community — in 20+ languages.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="text-xl font-display font-bold text-text-primary flex items-center gap-2">
          <Image src="/logo.png" alt="Align logo" width={32} height={32} className="w-8 h-8 rounded-lg" />
          Align
        </span>
        <div className="flex items-center gap-3">
          <Link href="/blog" className="text-sm text-text-secondary hover:text-text-primary transition-colors hidden sm:inline">
            Blog
          </Link>
          <Link href="/zodiac" className="text-sm text-text-secondary hover:text-text-primary transition-colors hidden sm:inline">
            Zodiac
          </Link>
          <Link href="/compatibility" className="text-sm text-text-secondary hover:text-text-primary transition-colors hidden sm:inline">
            Compatibility
          </Link>
          <Link href="/soul-age" className="text-sm text-text-secondary hover:text-text-primary transition-colors hidden sm:inline">
            Soul Age
          </Link>
          <Link href="/hidden-zodiac" className="text-sm text-text-secondary hover:text-text-primary transition-colors hidden sm:inline">
            Hidden Zodiac
          </Link>
          <Link href="/pricing" className="text-sm text-text-secondary hover:text-text-primary transition-colors hidden sm:inline">
            Pricing
          </Link>
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
        <Image src="/logo.png" alt="Align logo" width={96} height={96} className="w-24 h-24 rounded-2xl mx-auto mb-6" />
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
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-x-6 gap-y-2">
          <Link
            href="/soul-age"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent-secondary hover:text-accent-primary transition-colors"
          >
            ∞ Soul Age Calculator — free, no signup →
          </Link>
          <Link
            href="/hidden-zodiac"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent-secondary hover:text-accent-primary transition-colors"
          >
            ☉ Try the Hidden Zodiac — free, no signup →
          </Link>
        </div>
        <StoreBadges className="mt-8" />
        <div className="mt-12">
          <HeroChartPreview />
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
            glyph="∞"
            href="/soul-age"
            title="Soul Age Calculator"
            description="How many lifetimes your soul has lived across the universe — and how many were on Earth. Free."
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

      {/* AI Astrologer demo */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-display font-bold text-text-primary text-center mb-3">
          An astrologer that actually knows your chart
        </h2>
        <p className="text-sm text-text-tertiary text-center max-w-xl mx-auto mb-8">
          Ask anything. The AI Astrologer answers from your real placements — not your Sun sign alone.
          Here&apos;s an example of its voice:
        </p>
        <div className="bg-bg-card border border-border-primary rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex justify-end">
            <div className="bg-gradient-to-r from-[#9B6FF6] to-[#EC4899] text-white text-sm rounded-2xl rounded-br-sm px-4 py-3 max-w-[85%]">
              Why do I start everything strong and lose interest halfway through?
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-bg-tertiary text-text-primary text-sm leading-relaxed rounded-2xl rounded-bl-sm px-4 py-3 max-w-[90%]">
              Your Mars in Sagittarius lights the fuse instantly — you commit in a burst of vision, not a plan.
              But it squares your Saturn in Pisces, so the moment a project stops feeling meaningful, your
              discipline dissolves instead of tightening. You don&apos;t lose interest — you lose the <em>why</em>.
              Anchor every routine to the bigger picture it serves, and you&apos;ll finish what you start.
            </div>
          </div>
          <p className="text-[11px] text-text-muted text-center pt-1">
            Example conversation. Your answers are generated from your own natal chart.
          </p>
        </div>
      </section>

      {/* Social Proof Stats Bar */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-gradient-cosmic rounded-2xl p-8 border border-accent-muted">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-display font-bold bg-gradient-to-r from-[#9B6FF6] to-[#EC4899] bg-clip-text text-transparent">26+</p>
              <p className="text-sm text-text-secondary mt-1">Readings</p>
            </div>
            <div>
              <p className="text-4xl font-display font-bold bg-gradient-to-r from-[#9B6FF6] to-[#EC4899] bg-clip-text text-transparent">55+</p>
              <p className="text-sm text-text-secondary mt-1">Asteroids</p>
            </div>
            <div>
              <p className="text-4xl font-display font-bold bg-gradient-to-r from-[#9B6FF6] to-[#EC4899] bg-clip-text text-transparent">8</p>
              <p className="text-sm text-text-secondary mt-1">Dimension Matching</p>
            </div>
            <div>
              <p className="text-4xl font-display font-bold bg-gradient-to-r from-[#9B6FF6] to-[#EC4899] bg-clip-text text-transparent">20+</p>
              <p className="text-sm text-text-secondary mt-1">Languages</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / methodology */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-display font-bold text-text-primary text-center mb-3">
          Built by a real astrologer — not a content farm
        </h2>
        <p className="text-sm text-text-tertiary text-center max-w-2xl mx-auto mb-10">
          Align was designed and built by Astro Einstein, a Bahamian astrologer and clinical hypnotherapist
          with decades of experience. One person&apos;s coherent system — applied consistently across every reading.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-bg-card border border-border-primary rounded-2xl p-6">
            <span className="text-3xl block mb-3">°</span>
            <h3 className="text-base font-semibold text-text-primary mb-1">Arc-second precision</h3>
            <p className="text-sm text-text-tertiary">
              Placements are read to the exact degree, minute, and second — down to the Duad and Compendium
              layers most apps round away.
            </p>
          </div>
          <div className="bg-bg-card border border-border-primary rounded-2xl p-6">
            <span className="text-3xl block mb-3">⚖</span>
            <h3 className="text-base font-semibold text-text-primary mb-1">One coherent system</h3>
            <p className="text-sm text-text-tertiary">
              Whole-Sign houses and a published rulership system, applied the same way in all 26+ readings —
              no mix-and-match horoscope filler.
            </p>
          </div>
          <div className="bg-bg-card border border-border-primary rounded-2xl p-6">
            <span className="text-3xl block mb-3">✦</span>
            <h3 className="text-base font-semibold text-text-primary mb-1">Free core, forever</h3>
            <p className="text-sm text-text-tertiary">
              Your natal chart overview, tarot draw, and planetary hours stay free forever. No credit card
              to start, no paywall surprise.
            </p>
          </div>
        </div>
        <div className="bg-gradient-cosmic border border-accent-muted rounded-2xl p-8 text-center">
          <p className="text-text-primary italic max-w-2xl mx-auto mb-4">
            &ldquo;I created Align to give people a trustworthy space where they can explore who they are,
            understand the patterns shaping their lives, and receive guidance that feels personal, respectful,
            and meaningful.&rdquo;
          </p>
          <p className="text-sm text-text-secondary mb-4">— Astro Einstein, founder of Align</p>
          <Link href="/founder" className="text-sm font-medium text-accent-secondary hover:text-accent-primary transition-colors">
            Meet the Founder →
          </Link>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-display font-bold text-text-primary text-center mb-3">
          Start free. Upgrade when ready.
        </h2>
        <p className="text-text-tertiary text-center max-w-xl mx-auto mb-10">
          Natal charts, planetary hours, tarot, and more are free forever. Paid plans add AI reading volume
          and advanced systems, from ${PLANS.starter.price}/month.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {(Object.keys(PLANS) as Array<keyof typeof PLANS>).map((key) => {
            const plan = PLANS[key];
            const highlighted = key === 'starter';
            return (
              <Link
                key={key}
                href="/pricing"
                className={`rounded-2xl p-5 border transition-colors block ${
                  highlighted
                    ? 'border-accent-primary ring-2 ring-accent-primary/30 bg-bg-card'
                    : 'border-border-primary bg-bg-card hover:border-accent-primary/30'
                }`}
              >
                {highlighted && (
                  <span className="text-[10px] font-semibold text-accent-primary uppercase tracking-wide block mb-1">
                    Best value
                  </span>
                )}
                <h3 className="text-sm font-semibold text-text-primary">{plan.name}</h3>
                <p className="text-2xl font-display font-bold text-text-primary mt-1">
                  {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  {plan.price !== 0 && <span className="text-xs font-normal text-text-muted">/mo</span>}
                </p>
                <p className="text-xs text-text-tertiary mt-2">
                  {plan.aiReadings} AI readings/month
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {plan.features.find((f) => !f.includes('AI-powered readings'))}
                </p>
              </Link>
            );
          })}
        </div>
        <div className="text-center">
          <Link href="/pricing" className="btn-secondary inline-block px-8 py-3">
            See Full Plan Comparison
          </Link>
          <p className="text-xs text-text-muted mt-3">Annual billing saves up to 30%. Cancel anytime.</p>
        </div>
      </section>

      {/* Earn with Align */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-display font-bold text-text-primary text-center mb-3">
          Earn with Align
        </h2>
        <p className="text-sm text-text-tertiary text-center max-w-2xl mx-auto mb-10">
          Love Align? Get paid to share it. Two ways to turn your cosmic passion into income.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl p-6 border border-border-primary bg-bg-card hover:border-accent-primary/30 transition-colors flex flex-col">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-muted text-accent-primary text-xs font-medium mb-4 self-start">
              20% Recurring Commission
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Affiliate Program</h3>
            <p className="text-sm text-text-tertiary mb-5 flex-1">
              Share your link and earn 20% of every subscription you refer — month after month, for as
              long as they stay subscribed. 30-day tracking, monthly payouts, and no follower minimum.
              Anyone can apply.
            </p>
            <Link href="/affiliates" className="btn-primary text-sm px-6 py-2.5 self-start">
              Become an Affiliate →
            </Link>
          </div>
          <div className="rounded-2xl p-6 border border-border-primary bg-bg-card hover:border-accent-primary/30 transition-colors flex flex-col">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-muted text-accent-primary text-xs font-medium mb-4 self-start">
              For Astro Creators
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Creator Program</h3>
            <p className="text-sm text-text-tertiary mb-5 flex-1">
              Share readings and videos on Align, build your cosmic community, and earn from your
              content — including commissions when your audience joins through you. Apply from
              Creator Studio inside the app.
            </p>
            <Link href="/creator-studio" className="btn-secondary text-sm px-6 py-2.5 self-start">
              Open Creator Studio →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: FAQS.map((f) => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
              })),
            }),
          }}
        />
        <h2 className="text-2xl font-display font-bold text-text-primary text-center mb-10">
          Questions, answered
        </h2>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="bg-bg-card border border-border-primary rounded-xl px-5 group">
              <summary className="py-4 cursor-pointer list-none flex items-center justify-between text-sm font-semibold text-text-primary">
                {f.q}
                <span className="text-text-muted group-open:rotate-90 transition-transform ml-4">›</span>
              </summary>
              <p className="text-sm text-text-secondary leading-relaxed pb-4">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-24 text-center">
        <div className="bg-gradient-cosmic rounded-3xl p-10 border border-accent-muted">
          <Image src="/logo.png" alt="Align logo" width={56} height={56} className="w-14 h-14 rounded-xl mx-auto mb-4" />
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
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-6">
          <StoreBadges />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <span className="text-sm text-text-muted">
              &copy; {new Date().getFullYear()} Align. All rights reserved.
            </span>
            <div className="flex gap-6 text-sm text-text-muted flex-wrap justify-center">
              <Link href="/blog" className="hover:text-text-secondary">Blog</Link>
              <Link href="/events" className="hover:text-text-secondary">Events</Link>
              <Link href="/zodiac" className="hover:text-text-secondary">Zodiac</Link>
              <Link href="/compatibility" className="hover:text-text-secondary">Compatibility</Link>
              <Link href="/hidden-zodiac" className="hover:text-text-secondary">Hidden Zodiac</Link>
              <Link href="/pricing" className="hover:text-text-secondary">Pricing</Link>
              <Link href="/founder" className="hover:text-text-secondary">Founder</Link>
              <Link href="/settings/terms" className="hover:text-text-secondary">Terms</Link>
              <Link href="/settings/privacy" className="hover:text-text-secondary">Privacy</Link>
              <Link href="/settings/community-guidelines" className="hover:text-text-secondary">Guidelines</Link>
              <Link href="/affiliates" className="hover:text-text-secondary">Affiliates</Link>
              <Link href="/creator-studio" className="hover:text-text-secondary">Creators</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * A feature tile. Pass `href` to make the whole card a link — cards without one
 * stay plain <div>s, so existing tiles are unchanged.
 */
function FeatureCard({ glyph, title, description, href }: {
  glyph: string;
  title: string;
  description: string;
  href?: string;
}) {
  const className = 'block rounded-2xl p-6 border border-border-primary bg-bg-card hover:border-accent-primary/30 transition-colors';
  const inner = (
    <>
      <span className="text-3xl block mb-3">{glyph}</span>
      <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-tertiary">{description}</p>
    </>
  );
  return href
    ? <Link href={href} className={className}>{inner}</Link>
    : <div className={className}>{inner}</div>;
}
