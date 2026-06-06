import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ALL_SYNASTRY_ASPECTS } from '@/data/synastryContent';

export const metadata: Metadata = {
  title: 'Synastry Aspects — Relationship Astrology Guide',
  description: 'Explore 35 key synastry aspects between planets. Understand the cosmic chemistry in your relationships.',
  keywords: ['synastry aspects', 'relationship astrology', 'synastry chart', 'compatibility aspects', 'planet aspects synastry'],
  openGraph: { title: 'Synastry Aspects | Align', description: 'Complete guide to 35 synastry aspects.', url: 'https://aligncosmic.com/synastry-aspects', siteName: 'Align', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Synastry Aspects | Align', description: 'Complete guide to 35 synastry aspects.' },
  alternates: { canonical: 'https://aligncosmic.com/synastry-aspects' },
};

const PAIRS = [
  { p1: 'Sun', p2: 'Moon', label: 'Sun-Moon Aspects' },
  { p1: 'Sun', p2: 'Venus', label: 'Sun-Venus Aspects' },
  { p1: 'Sun', p2: 'Mars', label: 'Sun-Mars Aspects' },
  { p1: 'Moon', p2: 'Venus', label: 'Moon-Venus Aspects' },
  { p1: 'Moon', p2: 'Mars', label: 'Moon-Mars Aspects' },
  { p1: 'Venus', p2: 'Mars', label: 'Venus-Mars Aspects' },
  { p1: 'Venus', p2: 'Jupiter', label: 'Venus-Jupiter Aspects' },
];

const ASPECT_ORDER = ['conjunct', 'sextile', 'square', 'trine', 'opposition'];
const ASPECT_SYMBOLS: Record<string, string> = { conjunct: '\u260C', sextile: '\u26B9', square: '\u25A1', trine: '\u25B3', opposition: '\u260D' };

export default function SynastryIndex() {
  const jsonLd = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Synastry Aspects', description: 'Complete guide to 35 synastry aspects in relationship astrology.', publisher: { '@type': 'Organization', name: 'Align', url: 'https://aligncosmic.com' }, mainEntityOfPage: 'https://aligncosmic.com/synastry-aspects' };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-display font-bold text-text-primary flex items-center gap-2"><Image src="/logo.png" alt="Align logo" width={32} height={32} className="w-8 h-8 rounded-lg" />Align</Link>
        <div className="flex items-center gap-3">
          <Link href="/compatibility" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Compatibility</Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">Get Started Free</Link>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto px-6 pt-2 pb-4">
        <nav className="text-sm text-text-muted" aria-label="Breadcrumb"><ol className="flex items-center gap-1.5"><li><Link href="/" className="hover:text-text-secondary transition-colors">Home</Link></li><li className="text-text-muted">/</li><li className="text-text-tertiary">Synastry Aspects</li></ol></nav>
      </div>
      <header className="max-w-5xl mx-auto px-6 pt-8 pb-16 text-center">
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-text-primary leading-tight mb-4">Synastry Aspects</h1>
        <p className="text-xl sm:text-2xl font-display text-text-secondary mb-2">The Cosmic Chemistry Between You</p>
        <p className="text-text-tertiary max-w-2xl mx-auto text-base sm:text-lg">Synastry compares two birth charts to reveal the energetic connections between partners. Explore the most important planet-to-planet aspects.</p>
      </header>
      <main className="max-w-5xl mx-auto px-6 pb-20 space-y-16">
        {PAIRS.map((pair) => (
          <section key={pair.label}>
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary mb-6">{pair.label}</h2>
            <div className="grid sm:grid-cols-5 gap-3">
              {ASPECT_ORDER.map((asp) => {
                const slug = `${pair.p1.toLowerCase()}-${asp}-${pair.p2.toLowerCase()}`;
                return (
                  <Link key={slug} href={`/synastry-aspects/${slug}`} className="bg-bg-card border border-border-primary rounded-xl p-4 text-center hover:border-accent-primary/30 transition-colors group">
                    <p className="text-2xl mb-1">{ASPECT_SYMBOLS[asp]}</p>
                    <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors capitalize">{asp}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </main>
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gradient-cosmic rounded-3xl p-8 sm:p-12 border border-accent-muted text-center">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-4">Check Your Synastry</h2>
          <p className="text-text-tertiary max-w-lg mx-auto mb-8">Compare your birth chart with a partner to see your synastry aspects and compatibility score.</p>
          <Link href="/onboarding" className="btn-primary text-base px-10 py-3.5 inline-block">Get Your Full Birth Chart</Link>
          <p className="text-text-muted text-xs mt-4">Free to start. No credit card required.</p>
        </div>
      </section>
      <footer className="border-t border-border-primary py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-text-muted">&copy; {new Date().getFullYear()} Align. All rights reserved.</span>
          <div className="flex gap-6 text-sm text-text-muted"><Link href="/zodiac" className="hover:text-text-secondary">Zodiac Signs</Link><Link href="/compatibility" className="hover:text-text-secondary">Compatibility</Link><Link href="/settings/terms" className="hover:text-text-secondary">Terms</Link><Link href="/settings/privacy" className="hover:text-text-secondary">Privacy</Link></div>
        </div>
      </footer>
    </div>
  );
}
