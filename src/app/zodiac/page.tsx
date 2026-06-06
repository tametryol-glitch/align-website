import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  ALL_SIGN_KEYS,
  getZodiacSignProfile,
  getSignBriefDescription,
  getElementColor,
  type ZodiacSign,
  type Element,
} from '@/data/zodiacSignContent';

/* ── Metadata ─────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: 'The 12 Zodiac Signs — Your Complete Guide',
  description:
    'Explore all 12 zodiac signs with in-depth personality profiles, love styles, career strengths, and compatibility guides. Discover what makes each Sun sign unique.',
  keywords: [
    'zodiac signs',
    '12 zodiac signs',
    'zodiac sign meanings',
    'astrology signs',
    'sun signs',
    'zodiac personality',
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
    'fire signs', 'earth signs', 'air signs', 'water signs',
  ],
  openGraph: {
    title: 'The 12 Zodiac Signs — Your Complete Guide | Align',
    description:
      'In-depth profiles for every zodiac sign. Personality, love, career, compatibility, and growth.',
    url: 'https://aligncosmic.com/zodiac',
    siteName: 'Align',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The 12 Zodiac Signs — Your Complete Guide | Align',
    description:
      'Explore all 12 zodiac signs with in-depth personality profiles, love styles, and compatibility.',
  },
  alternates: {
    canonical: 'https://aligncosmic.com/zodiac',
  },
};

/* ── Element grouping ─────────────────────────────────────────── */

const ELEMENT_GROUPS: { element: Element; label: string; description: string; signs: ZodiacSign[] }[] = [
  {
    element: 'fire',
    label: 'Fire Signs',
    description: 'Passionate, energetic, and driven by bold action.',
    signs: ['aries', 'leo', 'sagittarius'],
  },
  {
    element: 'earth',
    label: 'Earth Signs',
    description: 'Grounded, practical, and devoted to building lasting value.',
    signs: ['taurus', 'virgo', 'capricorn'],
  },
  {
    element: 'air',
    label: 'Air Signs',
    description: 'Intellectual, communicative, and fueled by ideas and connection.',
    signs: ['gemini', 'libra', 'aquarius'],
  },
  {
    element: 'water',
    label: 'Water Signs',
    description: 'Intuitive, emotional, and connected to the depths of feeling.',
    signs: ['cancer', 'scorpio', 'pisces'],
  },
];

/* ── Page ──────────────────────────────────────────────────────── */

export default function ZodiacIndexPage() {
  /* JSON-LD */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'The 12 Zodiac Signs',
    description: 'Complete guide to all 12 zodiac signs.',
    publisher: {
      '@type': 'Organization',
      name: 'Align',
      url: 'https://aligncosmic.com',
    },
    mainEntityOfPage: 'https://aligncosmic.com/zodiac',
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Nav ─────────────────────────────────────────────── */}
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
            href="/compatibility"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Compatibility
          </Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ── Breadcrumbs ────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 pt-2 pb-4">
        <nav className="text-sm text-text-muted" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-text-secondary transition-colors">
                Home
              </Link>
            </li>
            <li className="text-text-muted">/</li>
            <li className="text-text-tertiary">Zodiac</li>
          </ol>
        </nav>
      </div>

      {/* ── Hero ───────────────────────────────────────────── */}
      <header className="max-w-5xl mx-auto px-6 pt-8 pb-16 text-center">
        <div className="flex items-center justify-center gap-2 mb-6 text-3xl">
          {ALL_SIGN_KEYS.map((s) => (
            <span key={s} className="opacity-60">
              {getZodiacSignProfile(s).glyph}
            </span>
          ))}
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-text-primary leading-tight mb-4">
          The 12 Zodiac Signs
        </h1>
        <p className="text-xl sm:text-2xl font-display text-text-secondary mb-2">
          Your Complete Guide
        </p>
        <p className="text-text-tertiary max-w-2xl mx-auto text-base sm:text-lg">
          Explore every Sun sign with in-depth personality profiles, love styles, career strengths,
          and compatibility insights. Discover what the stars reveal about you.
        </p>
      </header>

      {/* ── Sign grid by element ───────────────────────────── */}
      <main className="max-w-5xl mx-auto px-6 pb-20 space-y-16">
        {ELEMENT_GROUPS.map((group) => {
          const color = getElementColor(group.element);
          return (
            <section key={group.element}>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary">
                  {group.label}
                </h2>
              </div>
              <p className="text-text-muted text-sm mb-6 ml-6">{group.description}</p>

              <div className="grid sm:grid-cols-3 gap-4">
                {group.signs.map((signKey) => {
                  const profile = getZodiacSignProfile(signKey);
                  const brief = getSignBriefDescription(signKey);
                  return (
                    <Link
                      key={signKey}
                      href={`/zodiac/${signKey}`}
                      className="bg-bg-card border border-border-primary rounded-2xl p-6 hover:border-accent-primary/30 transition-all group relative overflow-hidden"
                    >
                      {/* Element accent bar */}
                      <div
                        className="absolute top-0 left-0 right-0 h-1 opacity-50 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: color }}
                      />

                      <div className="flex items-start gap-4">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 border"
                          style={{
                            borderColor: `${color}40`,
                            background: `radial-gradient(circle, ${color}12 0%, transparent 70%)`,
                          }}
                        >
                          <span className="text-3xl">{profile.glyph}</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-display font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
                            {profile.name}
                          </h3>
                          <p className="text-xs text-text-muted mb-2">{profile.dates}</p>
                        </div>
                      </div>

                      <p className="text-text-tertiary text-sm leading-relaxed mt-3">
                        {brief}
                      </p>

                      <div className="flex items-center gap-2 mt-4 flex-wrap">
                        <span
                          className="text-[11px] px-2.5 py-1 rounded-full border"
                          style={{
                            borderColor: `${color}35`,
                            color,
                          }}
                        >
                          {profile.element.charAt(0).toUpperCase() + profile.element.slice(1)}
                        </span>
                        <span className="text-[11px] px-2.5 py-1 rounded-full border border-border-primary text-text-muted">
                          {profile.modality.charAt(0).toUpperCase() + profile.modality.slice(1)}
                        </span>
                        <span className="text-[11px] px-2.5 py-1 rounded-full border border-border-primary text-text-muted">
                          {profile.ruler}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gradient-cosmic rounded-3xl p-8 sm:p-12 border border-accent-muted text-center">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-4">
            Go Beyond Your Sun Sign
          </h2>
          <p className="text-text-tertiary max-w-lg mx-auto mb-8">
            Your Sun sign is just the beginning. Align generates your complete natal chart with
            Moon, Rising, Venus, Mars, and all planetary placements, plus AI-powered interpretations
            and 26+ readings.
          </p>
          <Link href="/onboarding" className="btn-primary text-base px-10 py-3.5 inline-block">
            Get Your Full Birth Chart
          </Link>
          <p className="text-text-muted text-xs mt-4">
            Free to start. No credit card required.
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-border-primary py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Align. All rights reserved.
          </span>
          <div className="flex gap-6 text-sm text-text-muted">
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
