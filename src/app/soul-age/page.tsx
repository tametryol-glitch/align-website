import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SoulAgeClient } from './SoulAgeClient';

export const metadata: Metadata = {
  title: 'Soul Age Calculator — How Many Lifetimes Has Your Soul Lived?',
  description:
    'Free Soul Age Calculator. Discover how many lifetimes your soul has experienced across the universe — and how many were lived on Earth. Calculated from your Draconic and natal charts to the arc-second.',
  keywords: [
    'soul age calculator', 'how many past lives', 'past life calculator',
    'draconic chart', 'universal lifetimes', 'earth lifetimes', 'old soul test',
    'transcendental soul', 'soul age astrology',
  ],
  alternates: { canonical: 'https://aligncosmic.com/soul-age' },
  openGraph: {
    title: 'Soul Age Calculator — How Many Lifetimes Has Your Soul Lived?',
    description:
      'Discover how many lifetimes your soul has experienced across the universe — and how many were lived on Earth. Free, no signup.',
    url: 'https://aligncosmic.com/soul-age',
    type: 'website',
  },
};

const STEPS = [
  {
    glyph: '☊',
    title: 'Your Draconic chart',
    text: 'Every placement is rotated so your True North Node sits at exactly 0°00′00″ Aries — the soul-level layer beneath the natal chart.',
  },
  {
    glyph: '⊕',
    title: 'The Earth point',
    text: 'Earth sits exactly opposite your Sun. Its sign, house, duad and compendium decide how much of your experience was terrestrial.',
  },
  {
    glyph: '✧',
    title: 'Closure seals',
    text: 'Completion structures across your natal and Draconic charts validate how many universal cycles you have actually finished.',
  },
  {
    glyph: '∞',
    title: 'Two totals',
    text: 'One number for every incarnation anywhere in the universe, and one for the subset lived here on Earth.',
  },
];

const AGES = [
  { name: 'Infant Soul', range: '0–12 lifetimes' },
  { name: 'Baby Soul', range: '13–144 lifetimes' },
  { name: 'Young Soul', range: '145–1,728 lifetimes' },
  { name: 'Mature Soul', range: '1,729–20,736 lifetimes' },
  { name: 'Old Soul', range: '20,737–248,832 lifetimes' },
  { name: 'Transcendental Soul', range: '248,833–2,985,984 lifetimes' },
  { name: 'Universal Soul', range: '2,985,985 and beyond' },
];

export default function SoulAgePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Soul Age Calculator',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description:
      'Calculate how many lifetimes your soul has experienced across the universe, and how many of those were lived on Earth, from your natal and Draconic charts.',
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
          <Link href="/hidden-zodiac" className="text-sm text-text-secondary hover:text-text-primary transition-colors hidden sm:inline">
            Hidden Zodiac
          </Link>
          <Link href="/birth-chart-calculator" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Birth Chart
          </Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">Get Started Free</Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-6 pt-2 pb-4">
        <nav className="text-sm text-text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-text-secondary">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-text-tertiary">Soul Age Calculator</span>
        </nav>
      </div>

      {/* Hero */}
      <header className="max-w-3xl mx-auto px-6 pt-6 pb-8 text-center">
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-text-primary leading-tight mb-4">
          Soul Age Calculator
        </h1>
        <p className="text-text-secondary max-w-2xl mx-auto text-[15px] leading-relaxed">
          Discover how many lifetimes your soul has experienced across the universe — and how many were lived on Earth.
        </p>
      </header>

      {/* Calculator */}
      <section className="max-w-2xl mx-auto px-6 pb-14">
        <SoulAgeClient />
      </section>

      {/* How it works */}
      <main className="max-w-4xl mx-auto px-6 pb-16 space-y-12">
        <article>
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary mb-5">
            How the Soul Age Calculator works
          </h2>
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
            A complete Universal Incarnation Cycle holds 248,832 incarnation positions — twelve signs, twelve houses,
            twelve duads, twelve compendiums and twelve planetary carriers. Align uses Whole-Sign houses and its own
            rulership system throughout (Vesta rules Virgo, Juno rules Libra, Pluto Scorpio, Uranus Aquarius,
            Neptune Pisces). An accurate birth time is required, because the Draconic Ascendant, IC and MC depend on it.
          </p>
        </article>

        <article>
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary mb-5">The seven Soul Ages</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AGES.map((a) => (
              <div key={a.name} className="bg-bg-card border border-border-primary rounded-xl px-5 py-3.5 flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold text-text-primary">{a.name}</span>
                <span className="text-xs text-text-muted whitespace-nowrap">{a.range}</span>
              </div>
            ))}
          </div>
          <p className="text-text-tertiary text-sm leading-relaxed mt-5">
            No Soul Age is better than another. Soul Age measures accumulated experience — not worth, intelligence,
            kindness, spiritual attainment or status. An Infant Soul and a Universal Soul are equally whole; they are
            simply at different points in a very long journey.
          </p>
        </article>
      </main>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gradient-cosmic rounded-3xl p-8 sm:p-12 border border-accent-muted text-center">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-4">
            Save your reading and compare charts
          </h2>
          <p className="text-text-tertiary max-w-lg mx-auto mb-8">
            Create a free Align account to save your Soul Age to your chart, recalculate it after edits, and compare
            Universal and Earth Soul Ages between the people you have saved.
          </p>
          <Link href="/auth/signup" className="btn-primary text-base px-10 py-3.5 inline-block">Create My Free Account</Link>
        </div>
      </section>

      <footer className="border-t border-border-primary py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-sm text-text-muted space-y-2">
          <p>
            The Soul Age Calculator is an experimental metaphysical interpretation system. Its results are intended for
            spiritual reflection and are not scientifically verifiable measurements.
          </p>
          <p className="opacity-70">Soul Age Calculator methodology created by Astro for AlignCosmic.</p>
          <p>
            © {new Date().getFullYear()} Align ·{' '}
            <Link href="/hidden-zodiac" className="hover:text-text-secondary">The Hidden Zodiac</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
