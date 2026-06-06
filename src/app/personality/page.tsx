import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  ALL_SIGN_KEYS,
  SIGNS,
  getSunMoonContent,
  getElementColor,
  type ZodiacSign,
} from '@/data/sunMoonContent';

/* ── Metadata ─────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: 'Sun-Moon Personality Combinations — All 144 Profiles',
  description:
    'Explore all 144 Sun-Moon sign personality combinations. Discover how your Sun sign identity and Moon sign emotions interact to create your unique cosmic blueprint.',
  keywords: [
    'sun moon combinations',
    'sun moon personality',
    'sun moon astrology',
    'sun sign moon sign',
    'natal chart personality',
    'astrology personality',
    'zodiac personality',
    'moon sign meaning',
    'sun moon compatibility',
    'aries sun', 'taurus sun', 'gemini sun', 'cancer sun',
    'leo sun', 'virgo sun', 'libra sun', 'scorpio sun',
    'sagittarius sun', 'capricorn sun', 'aquarius sun', 'pisces sun',
  ],
  openGraph: {
    title: 'Sun-Moon Personality Combinations — All 144 Profiles | Align',
    description:
      'All 144 Sun-Moon sign combinations analyzed. Discover how your Sun and Moon signs shape your personality, emotions, and relationships.',
    url: 'https://aligncosmic.com/personality',
    siteName: 'Align',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All 144 Sun-Moon Personality Profiles | Align',
    description:
      'Explore every Sun-Moon sign combination. Find your cosmic personality blueprint.',
  },
  alternates: {
    canonical: 'https://aligncosmic.com/personality',
  },
};

/* ── Page ──────────────────────────────────────────────────────── */

export default function PersonalityIndexPage() {
  /* JSON-LD structured data */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Sun-Moon Personality Combinations',
    description:
      'Complete guide to all 144 Sun-Moon sign personality combinations.',
    url: 'https://aligncosmic.com/personality',
    publisher: {
      '@type': 'Organization',
      name: 'Align',
      url: 'https://aligncosmic.com',
    },
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link
          href="/"
          className="text-xl font-display font-bold text-text-primary flex items-center gap-2"
        >
          <Image
            src="/logo.png"
            alt="Align logo"
            width={32}
            height={32}
            className="w-8 h-8 rounded-lg"
          />
          Align
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Home
          </Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <header className="max-w-4xl mx-auto text-center px-6 pt-12 pb-10">
        <div className="flex items-center justify-center gap-2 text-4xl mb-6">
          {ALL_SIGN_KEYS.map((key) => (
            <span
              key={key}
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              {SIGNS[key].glyph}
            </span>
          ))}
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-text-primary leading-tight mb-4">
          Sun-Moon{' '}
          <span className="bg-gradient-to-r from-[#9B6FF6] to-[#EC4899] bg-clip-text text-transparent">
            Personality
          </span>{' '}
          Profiles
        </h1>
        <p className="text-text-tertiary max-w-2xl mx-auto text-base sm:text-lg">
          Your Sun sign is who you are. Your Moon sign is how you feel. Together, they
          create your unique cosmic personality. Explore all 144 combinations below.
        </p>
      </header>

      {/* ── Quick jump nav ───────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-10">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {ALL_SIGN_KEYS.map((key) => {
            const sign = SIGNS[key];
            return (
              <a
                key={key}
                href={`#${key}`}
                className="bg-bg-card border border-border-primary rounded-lg px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:border-accent-primary/30 transition-colors flex items-center gap-1.5"
              >
                <span
                  className="text-base"
                  style={{ color: getElementColor(sign.element) }}
                >
                  {sign.glyph}
                </span>
                <span>{sign.name} Sun</span>
              </a>
            );
          })}
        </div>
      </section>

      {/* ── Sign-by-sign sections ────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 pb-20">
        {ALL_SIGN_KEYS.map((sunKey) => (
          <SunSignSection key={sunKey} sunKey={sunKey} />
        ))}
      </main>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gradient-cosmic rounded-3xl p-8 sm:p-12 border border-accent-muted text-center">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-4">
            Discover Your Full Cosmic Blueprint
          </h2>
          <p className="text-text-tertiary max-w-lg mx-auto mb-8">
            Sun and Moon are just the beginning. Your Rising sign, Venus, Mars, and
            every planetary placement add layers of depth. Get your complete natal chart
            with Align and understand the full picture.
          </p>
          <Link
            href="/onboarding"
            className="btn-primary text-base px-10 py-3.5 inline-block"
          >
            Get Your Full Chart
          </Link>
          <p className="text-text-muted text-xs mt-4">
            Free to start. No credit card required.
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-border-primary py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Align. All rights reserved.
          </span>
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href="/" className="hover:text-text-secondary">
              Home
            </Link>
            <Link href="/compatibility" className="hover:text-text-secondary">
              Compatibility
            </Link>
            <Link href="/settings/terms" className="hover:text-text-secondary">
              Terms
            </Link>
            <Link href="/settings/privacy" className="hover:text-text-secondary">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────── */

function SunSignSection({ sunKey }: { sunKey: ZodiacSign }) {
  const sunSign = SIGNS[sunKey];

  return (
    <section className="mb-14" id={sunKey}>
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center border"
          style={{
            borderColor: getElementColor(sunSign.element),
            background: `radial-gradient(circle, ${getElementColor(sunSign.element)}15 0%, transparent 70%)`,
          }}
        >
          <span className="text-2xl">{sunSign.glyph}</span>
        </div>
        <div>
          <h2 className="text-xl font-display font-semibold text-text-primary">
            {sunSign.name} Sun
          </h2>
          <p className="text-xs text-text-muted">
            {sunSign.dates} &middot;{' '}
            <span style={{ color: getElementColor(sunSign.element) }}>
              {sunSign.element.charAt(0).toUpperCase() + sunSign.element.slice(1)}
            </span>{' '}
            &middot;{' '}
            {sunSign.modality.charAt(0).toUpperCase() + sunSign.modality.slice(1)}{' '}
            &middot; Ruled by {sunSign.ruler}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {ALL_SIGN_KEYS.map((moonKey) => {
          const moonSign = SIGNS[moonKey];
          const content = getSunMoonContent(sunKey, moonKey);
          return (
            <Link
              key={`${sunKey}-${moonKey}`}
              href={`/personality/${content.slug}`}
              className="bg-bg-card border border-border-primary rounded-xl p-3 text-center hover:border-accent-primary/30 hover:bg-bg-card-hover transition-colors group"
            >
              <div className="flex items-center justify-center gap-1.5 mb-1.5">
                <span className="text-xl">{sunSign.glyph}</span>
                <span className="text-text-muted text-[10px]">&#9790;</span>
                <span className="text-xl">{moonSign.glyph}</span>
              </div>
              <p className="text-xs font-medium text-text-primary group-hover:text-accent-primary transition-colors leading-tight">
                {moonSign.name} Moon
              </p>
              <p className="text-[10px] text-text-muted mt-1 line-clamp-2 leading-snug italic">
                {content.soulTagline}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 h-px bg-border-primary" />
    </section>
  );
}
