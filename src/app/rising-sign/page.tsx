import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ALL_SIGN_KEYS, SIGNS, getElementColor, type ZodiacSign } from '@/data/risingSignContent';

/* ── Metadata ─────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: 'Rising Signs — What Your Ascendant Reveals About You',
  description:
    'Explore all 12 rising signs (ascendants) with in-depth guides on first impressions, appearance, and life approach. Discover how your rising sign shapes the way the world sees you.',
  keywords: [
    'rising sign', 'ascendant sign', 'rising sign meaning', 'what is my rising sign',
    'aries rising', 'taurus rising', 'gemini rising', 'cancer rising',
    'leo rising', 'virgo rising', 'libra rising', 'scorpio rising',
    'sagittarius rising', 'capricorn rising', 'aquarius rising', 'pisces rising',
    'ascendant astrology', 'rising sign calculator',
  ],
  openGraph: {
    title: 'Rising Signs — What Your Ascendant Reveals About You | Align',
    description: 'In-depth guides for every rising sign. First impressions, appearance, and life approach.',
    url: 'https://aligncosmic.com/rising-sign',
    siteName: 'Align',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rising Signs — What Your Ascendant Reveals About You | Align',
    description: 'Explore all 12 rising signs with in-depth guides on first impressions, appearance, and life approach.',
  },
  alternates: { canonical: 'https://aligncosmic.com/rising-sign' },
};

/* ── Element grouping ─────────────────────────────────────────── */

const ELEMENT_GROUPS: { element: 'fire' | 'earth' | 'air' | 'water'; label: string; signs: ZodiacSign[] }[] = [
  { element: 'fire', label: 'Fire Rising Signs', signs: ['aries', 'leo', 'sagittarius'] },
  { element: 'earth', label: 'Earth Rising Signs', signs: ['taurus', 'virgo', 'capricorn'] },
  { element: 'air', label: 'Air Rising Signs', signs: ['gemini', 'libra', 'aquarius'] },
  { element: 'water', label: 'Water Rising Signs', signs: ['cancer', 'scorpio', 'pisces'] },
];

/* ── Page ──────────────────────────────────────────────────────── */

export default function RisingSignIndexPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Rising Signs — All 12 Ascendants',
    description: 'Complete guide to all 12 rising signs.',
    publisher: { '@type': 'Organization', name: 'Align', url: 'https://aligncosmic.com' },
    mainEntityOfPage: 'https://aligncosmic.com/rising-sign',
  };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-display font-bold text-text-primary flex items-center gap-2">
          <Image src="/logo.png" alt="Align logo" width={32} height={32} className="w-8 h-8 rounded-lg" />
          Align
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/zodiac" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Zodiac Signs</Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">Get Started Free</Link>
        </div>
      </nav>

      {/* ── Breadcrumbs ────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 pt-2 pb-4">
        <nav className="text-sm text-text-muted" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-text-secondary transition-colors">Home</Link></li>
            <li className="text-text-muted">/</li>
            <li className="text-text-tertiary">Rising Signs</li>
          </ol>
        </nav>
      </div>

      {/* ── Hero ───────────────────────────────────────────── */}
      <header className="max-w-5xl mx-auto px-6 pt-8 pb-16 text-center">
        <div className="flex items-center justify-center gap-2 mb-6 text-3xl">
          {ALL_SIGN_KEYS.map((sk) => (
            <span key={sk} className="opacity-60">{SIGNS[sk].glyph}</span>
          ))}
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-text-primary leading-tight mb-4">
          Rising Signs
        </h1>
        <p className="text-xl sm:text-2xl font-display text-text-secondary mb-2">
          Your Ascendant, Decoded
        </p>
        <p className="text-text-tertiary max-w-2xl mx-auto text-base sm:text-lg">
          Your rising sign shapes first impressions, physical appearance, and how you navigate the world.
          Explore all 12 ascendants to discover what your rising sign reveals about you.
        </p>
      </header>

      {/* ── Sign grid by element ───────────────────────────── */}
      <main className="max-w-5xl mx-auto px-6 pb-20 space-y-16">
        {ELEMENT_GROUPS.map((group) => {
          const color = getElementColor(group.element);
          return (
            <section key={group.element}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary">{group.label}</h2>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {group.signs.map((signKey) => {
                  const sd = SIGNS[signKey];
                  return (
                    <Link
                      key={signKey}
                      href={`/rising-sign/${signKey}`}
                      className="bg-bg-card border border-border-primary rounded-2xl p-6 hover:border-accent-primary/30 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 opacity-50 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: color }} />
                      <div className="flex items-start gap-4">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 border"
                          style={{ borderColor: `${color}40`, background: `radial-gradient(circle, ${color}12 0%, transparent 70%)` }}
                        >
                          <span className="text-3xl">{sd.glyph}</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-display font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
                            {sd.name} Rising
                          </h3>
                          <p className="text-xs text-text-muted mb-2">Ruled by {sd.ruler}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 flex-wrap">
                        <span className="text-[11px] px-2.5 py-1 rounded-full border" style={{ borderColor: `${color}35`, color }}>
                          {sd.element.charAt(0).toUpperCase() + sd.element.slice(1)}
                        </span>
                        <span className="text-[11px] px-2.5 py-1 rounded-full border border-border-primary text-text-muted">
                          {sd.modality.charAt(0).toUpperCase() + sd.modality.slice(1)}
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
            Discover Your Rising Sign
          </h2>
          <p className="text-text-tertiary max-w-lg mx-auto mb-8">
            Your rising sign requires your exact birth time. Align calculates your complete natal chart
            with AI-powered interpretations for every placement.
          </p>
          <Link href="/onboarding" className="btn-primary text-base px-10 py-3.5 inline-block">
            Get Your Full Birth Chart
          </Link>
          <p className="text-text-muted text-xs mt-4">Free to start. No credit card required.</p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-border-primary py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-text-muted">&copy; {new Date().getFullYear()} Align. All rights reserved.</span>
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href="/zodiac" className="hover:text-text-secondary">Zodiac Signs</Link>
            <Link href="/compatibility" className="hover:text-text-secondary">Compatibility</Link>
            <Link href="/settings/terms" className="hover:text-text-secondary">Terms</Link>
            <Link href="/settings/privacy" className="hover:text-text-secondary">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
