import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { seasonalPages } from '@/data/seasonalContent';

export const metadata: Metadata = {
  title: 'Cosmic Events & Transits — Mercury Retrograde, Eclipses & More',
  description: 'Stay informed about major astrological events: Mercury retrograde dates, eclipse seasons, Venus retrograde, and other significant transits. Your 2026 cosmic calendar.',
  keywords: ['astrology events', 'mercury retrograde 2026', 'eclipse 2026', 'venus retrograde', 'astrological transits', 'cosmic calendar'],
  openGraph: {
    title: 'Cosmic Events & Transits | Align',
    description: 'Mercury retrograde dates, eclipse seasons, and major astrological transits for 2026.',
    url: 'https://aligncosmic.com/events',
    siteName: 'Align',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cosmic Events & Transits | Align',
    description: 'Your 2026 cosmic calendar: retrogrades, eclipses, and major transits.',
  },
  alternates: { canonical: 'https://aligncosmic.com/events' },
};

export default function EventsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Cosmic Events & Transits',
    description: 'Major astrological events for 2026.',
    url: 'https://aligncosmic.com/events',
    publisher: { '@type': 'Organization', name: 'Align', url: 'https://aligncosmic.com' },
  };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-display font-bold text-text-primary flex items-center gap-2">
          <Image src="/logo.png" alt="Align logo" width={32} height={32} className="w-8 h-8 rounded-lg" />
          Align
        </Link>
        <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">Get Started Free</Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-2 pb-4">
        <nav className="text-sm text-text-muted" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-text-secondary transition-colors">Home</Link></li>
            <li className="text-text-muted">/</li>
            <li className="text-text-tertiary">Events</li>
          </ol>
        </nav>
      </div>

      <header className="max-w-4xl mx-auto px-6 pt-8 pb-12 text-center">
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-text-primary mb-4">
          Cosmic Events 2026
        </h1>
        <p className="text-text-tertiary max-w-2xl mx-auto text-base sm:text-lg">
          Major astrological transits, retrograde dates, and eclipse seasons. Know what&apos;s coming and how to prepare.
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid gap-6">
          {seasonalPages.map((page) => (
            <Link
              key={page.slug}
              href={`/events/${page.slug}`}
              className="bg-bg-card border border-border-primary rounded-2xl p-6 sm:p-8 hover:border-accent-primary/30 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">{page.heroEmoji}</span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary group-hover:text-accent-primary transition-colors mb-2">
                    {page.title}
                  </h2>
                  <p className="text-text-secondary text-[15px] leading-relaxed">
                    {page.description}
                  </p>
                  <p className="text-sm text-accent-primary mt-3 font-medium">Read guide →</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-border-primary py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-text-muted">&copy; {new Date().getFullYear()} Align. All rights reserved.</span>
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href="/blog" className="hover:text-text-secondary">Blog</Link>
            <Link href="/zodiac" className="hover:text-text-secondary">Zodiac Signs</Link>
            <Link href="/compatibility" className="hover:text-text-secondary">Compatibility</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
