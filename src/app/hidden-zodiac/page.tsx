import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { HiddenZodiacClient } from './HiddenZodiacClient';

export const metadata: Metadata = {
  title: 'The Hidden Zodiac — Duad & Compendium Calculator',
  description:
    'Reveal the Duad and Compendium hidden inside any planetary degree. Enter your birth details — or an exact degree, minute, and second — to see the deeper signs, the Whole-Sign houses they activate, and the full ruler chain.',
  keywords: [
    'hidden zodiac', 'duad calculator', 'compendium astrology', 'dwad',
    'whole sign houses', 'ruler chain', 'astrology degree calculator',
  ],
  alternates: { canonical: 'https://aligncosmic.com/hidden-zodiac' },
  openGraph: {
    title: 'The Hidden Zodiac — Duad & Compendium Calculator',
    description:
      'Discover the signs, houses, and deeper psychological architecture hidden inside every planetary degree.',
    url: 'https://aligncosmic.com/hidden-zodiac',
    type: 'website',
  },
};

const STEPS = [
  { glyph: '°', title: 'Exact degree', text: 'Every placement is read to the arc-second — degree, minute, and second — never rounded away.' },
  { glyph: '♏', title: 'The Duad', text: 'Each 30° sign splits into 12 × 2°30′ Duads that modify the visible expression of the sign.' },
  { glyph: '✦', title: 'The Compendium', text: 'Each Duad splits again into 12 × 0°12′30″ Compendiums — the deeper internal mechanism.' },
  { glyph: '⌂', title: 'Activated houses', text: 'The Duad and Compendium signs activate the Whole-Sign houses they occupy in your chart.' },
];

export default function HiddenZodiacPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'The Hidden Zodiac',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description:
      'Calculate the Duad and Compendium hidden inside any planetary degree, with activated Whole-Sign houses and the full ruler chain.',
  };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-display font-bold text-text-primary flex items-center gap-2">
          <Image src="/logo.png" alt="Align logo" width={32} height={32} className="w-8 h-8 rounded-lg" />
          Align
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/birth-chart-calculator" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Birth Chart</Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">Get Started Free</Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-6 pt-2 pb-4">
        <nav className="text-sm text-text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-text-secondary">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-text-tertiary">The Hidden Zodiac</span>
        </nav>
      </div>

      {/* Hero */}
      <header className="max-w-3xl mx-auto px-6 pt-6 pb-8 text-center">
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-text-primary leading-tight mb-4">
          The Hidden Zodiac
        </h1>
        <p className="text-text-secondary max-w-2xl mx-auto text-[15px] leading-relaxed">
          Discover the signs, houses, and deeper psychological architecture hidden inside every planetary degree —
          the Duad and the Compendium that explain why two people with the same placement can operate so differently.
        </p>
      </header>

      {/* Calculator */}
      <section className="max-w-2xl mx-auto px-6 pb-14">
        <HiddenZodiacClient />
      </section>

      {/* How it works */}
      <main className="max-w-4xl mx-auto px-6 pb-16 space-y-12">
        <article>
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary mb-5">How the Hidden Zodiac works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {STEPS.map((s) => (
              <div key={s.title} className="bg-bg-card border border-border-primary rounded-2xl p-5">
                <span className="text-2xl block mb-2">{s.glyph}</span>
                <h3 className="text-sm font-semibold text-text-primary mb-1">{s.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
          <p className="text-text-tertiary text-sm leading-relaxed mt-5">
            The Duad and Compendium never replace your natal sign or house — they are deeper layers operating through
            the primary placement. Align uses Whole-Sign houses and its own rulership system throughout
            (Vesta rules Virgo, Juno rules Libra, Pluto Scorpio, Uranus Aquarius, Neptune Pisces).
          </p>
        </article>
      </main>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gradient-cosmic rounded-3xl p-8 sm:p-12 border border-accent-muted text-center">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-4">Read your whole chart this way</h2>
          <p className="text-text-tertiary max-w-lg mx-auto mb-8">
            In the Align app, My Hidden Zodiac reads the Duad and Compendium of every placement in your natal chart
            automatically — with full interpretations and ruler analysis.
          </p>
          <Link href="/auth/signup" className="btn-primary text-base px-10 py-3.5 inline-block">Create My Free Account</Link>
        </div>
      </section>

      <footer className="border-t border-border-primary py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-sm text-text-muted">
          © {new Date().getFullYear()} Align · <Link href="/birth-chart-calculator" className="hover:text-text-secondary">Birth Chart Calculator</Link>
        </div>
      </footer>
    </div>
  );
}
