import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { CalculatorClient } from './CalculatorClient';

const TITLE = 'Free Birth Chart Calculator — Natal Chart with Interpretations';
const DESCRIPTION =
  'Calculate your free birth chart instantly. Get your Sun, Moon, and Rising signs, a full natal wheel, planetary positions, houses, and aspects — no signup required.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'birth chart calculator', 'free birth chart', 'natal chart calculator',
    'natal chart free', 'astrology chart calculator', 'sun moon rising calculator',
    'big three calculator', 'free natal chart with interpretations',
  ],
  openGraph: {
    title: `${TITLE} | Align`,
    description: DESCRIPTION,
    url: 'https://aligncosmic.com/birth-chart-calculator',
    siteName: 'Align',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: `${TITLE} | Align`, description: DESCRIPTION },
  alternates: { canonical: 'https://aligncosmic.com/birth-chart-calculator' },
};

const FAQS = [
  {
    q: 'What is a birth chart?',
    a: 'A birth chart (also called a natal chart) is a snapshot of the sky at the exact moment and place you were born. It maps the positions of the Sun, Moon, and planets across the twelve zodiac signs and twelve houses, forming a unique cosmic blueprint of your personality, relationships, and life patterns.',
  },
  {
    q: 'What do I need to calculate my birth chart?',
    a: 'Three things: your birth date, your birth time (as exact as possible — it is usually on your birth certificate), and your birth city. If you do not know your birth time, you can still calculate your chart; your planet signs will be accurate, but your Rising sign and houses will be approximate.',
  },
  {
    q: 'What are the Big Three in astrology?',
    a: 'Your Big Three are your Sun sign (your core identity), your Moon sign (your emotional inner world), and your Rising sign or Ascendant (how you come across to others). Together they give a far more accurate picture of your personality than your Sun sign alone.',
  },
  {
    q: 'Is this birth chart calculator really free?',
    a: 'Yes. The calculator, your natal wheel, planetary positions, houses, and placement interpretations are completely free with no signup required. Creating a free account lets you save your chart and unlock daily transits, AI readings, and compatibility tools.',
  },
  {
    q: 'How accurate is the calculation?',
    a: 'Align uses the Swiss Ephemeris — the same professional-grade astronomical data used by research astrologers — so planetary positions are accurate to a fraction of a degree for any birth date and location.',
  },
  {
    q: 'What if I don’t know my birth time?',
    a: 'Check the "I don’t know my birth time" option and we will calculate your chart for 12:00 noon. Your Sun, Moon (usually), and planet signs will still be correct, but treat your Rising sign and house placements as approximate.',
  },
];

export default function BirthChartCalculatorPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'Align Birth Chart Calculator',
        url: 'https://aligncosmic.com/birth-chart-calculator',
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        publisher: { '@type': 'Organization', name: 'Align', url: 'https://aligncosmic.com' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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

      <header className="max-w-4xl mx-auto px-6 pt-10 pb-8 text-center">
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-text-primary leading-tight mb-4">
          Free Birth Chart Calculator
        </h1>
        <p className="text-text-secondary max-w-2xl mx-auto text-[15px] leading-relaxed">
          Enter your birth details below to get your complete natal chart — your Sun, Moon, and
          Rising signs, a full chart wheel, planetary positions, houses, and aspects. Free, instant,
          and no signup required.
        </p>
      </header>

      <section className="max-w-2xl mx-auto px-6 pb-16">
        <CalculatorClient />
      </section>

      <main className="max-w-4xl mx-auto px-6 pb-16 space-y-12">
        <article>
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary mb-5">
            What Your Birth Chart Reveals
          </h2>
          <div className="space-y-4">
            <p className="text-text-secondary leading-relaxed text-[15px]">
              Your birth chart is a map of the sky frozen at the moment you took your first breath.
              Every planet occupied a precise position in one of the twelve zodiac signs and one of the
              twelve houses — and that unique configuration never repeats. It shapes how you love, how
              you communicate, what drives you, and the lessons your life keeps circling back to.
            </p>
            <p className="text-text-secondary leading-relaxed text-[15px]">
              Most people only know their Sun sign — the sign the Sun occupied on their birthday. But
              the Sun is one of twelve placements. Your Moon sign governs your emotional world, Venus
              shapes how you love, Mercury how you think and speak, Mars what you fight for. Reading
              them together is the difference between a horoscope and real astrology.
            </p>
          </div>
        </article>

        <article>
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary mb-5">
            The Big Three: Sun, Moon &amp; Rising
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: '☉', name: 'Sun Sign', text: 'Your core identity, vitality, and the essence of who you are becoming. The hero of your story.' },
              { icon: '☽', name: 'Moon Sign', text: 'Your inner emotional world — what you need to feel safe, how you process feelings, your instinctive reactions.' },
              { icon: '↑', name: 'Rising Sign', text: 'Your Ascendant — the mask you wear, first impressions you give, and the lens through which you approach life.' },
            ].map((item) => (
              <div key={item.name} className="bg-bg-card border border-border-primary rounded-2xl p-5">
                <span className="text-2xl block mb-2">{item.icon}</span>
                <h3 className="text-sm font-semibold text-text-primary mb-2">{item.name}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </article>

        <article>
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary mb-5">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <div key={f.q} className="bg-bg-card border border-border-primary rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-text-primary mb-2">{f.q}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </article>

        <section>
          <h2 className="text-xl font-display font-semibold text-text-primary mb-6">Go Deeper Into Your Chart</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { href: '/zodiac', label: 'Sun Signs', text: 'All 12 Zodiac Signs' },
              { href: '/moon-sign', label: 'Moon Signs', text: 'Your Emotional World' },
              { href: '/rising-sign', label: 'Rising Signs', text: 'Your Ascendant' },
              { href: '/venus-in', label: 'Venus Signs', text: 'Your Love Language' },
              { href: '/mars-in', label: 'Mars Signs', text: 'Your Drive & Desire' },
              { href: '/personality', label: 'Personality', text: 'Sun-Moon Combinations' },
              { href: '/planets-in-houses', label: 'Houses', text: 'Planets in Houses' },
              { href: '/compatibility', label: 'Compatibility', text: 'Sign Matches' },
              { href: '/synastry-aspects', label: 'Synastry', text: 'Relationship Aspects' },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="bg-bg-card border border-border-primary rounded-xl p-4 text-center hover:border-accent-primary/30 transition-colors group">
                <p className="text-xs text-text-muted mb-1">{link.label}</p>
                <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">{link.text}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gradient-cosmic rounded-3xl p-8 sm:p-12 border border-accent-muted text-center">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-4">
            Your Chart Is Just the Beginning
          </h2>
          <p className="text-text-tertiary max-w-lg mx-auto mb-8">
            Save your chart, get AI-powered readings, daily transit forecasts, and compatibility
            analysis with Align — free to start, available in 20 languages.
          </p>
          <Link href="/onboarding" className="btn-primary text-base px-10 py-3.5 inline-block">
            Create My Free Account
          </Link>
          <p className="text-text-muted text-xs mt-4">Free to start. No credit card required.</p>
        </div>
      </section>

      <footer className="border-t border-border-primary py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-text-muted">&copy; {new Date().getFullYear()} Align. All rights reserved.</span>
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href="/zodiac" className="hover:text-text-secondary">Zodiac Signs</Link>
            <Link href="/compatibility" className="hover:text-text-secondary">Compatibility</Link>
            <Link href="/blog" className="hover:text-text-secondary">Blog</Link>
            <Link href="/settings/terms" className="hover:text-text-secondary">Terms</Link>
            <Link href="/settings/privacy" className="hover:text-text-secondary">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
