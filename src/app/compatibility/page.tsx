import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  ALL_SIGN_KEYS,
  SIGNS,
  getAllCompatibilityPairs,
  getCompatibilityContent,
  getElementColor,
  type ZodiacSign,
} from '@/data/compatibilityContent';

/* ── Metadata ──────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: 'Zodiac Compatibility Guide — All 78 Sign Pairings',
  description:
    'Explore compatibility between every zodiac sign pair. 78 in-depth analyses covering emotional, intellectual, and physical chemistry. Find your perfect cosmic match.',
  keywords: [
    'zodiac compatibility',
    'astrology compatibility chart',
    'sign compatibility',
    'love compatibility',
    'zodiac love matches',
    'synastry',
    'aries compatibility',
    'taurus compatibility',
    'gemini compatibility',
    'cancer compatibility',
    'leo compatibility',
    'virgo compatibility',
    'libra compatibility',
    'scorpio compatibility',
    'sagittarius compatibility',
    'capricorn compatibility',
    'aquarius compatibility',
    'pisces compatibility',
  ],
  openGraph: {
    title: 'Zodiac Compatibility Guide — All 78 Sign Pairings | Align',
    description:
      'In-depth compatibility analysis for every zodiac sign combination. Explore emotional, intellectual, and romantic chemistry.',
    url: 'https://aligncosmic.com/compatibility',
    siteName: 'Align',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zodiac Compatibility Guide | Align',
    description:
      'All 78 zodiac sign pairings analyzed. Find your cosmic match.',
  },
  alternates: {
    canonical: 'https://aligncosmic.com/compatibility',
  },
};

/* ── Page ───────────────────────────────────────────────────────── */

export default function CompatibilityIndexPage() {
  const allPairs = getAllCompatibilityPairs();

  /* JSON-LD structured data */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Zodiac Compatibility Guide',
    description:
      'Complete zodiac compatibility guide with all 78 unique sign pairings analyzed.',
    url: 'https://aligncosmic.com/compatibility',
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
      <header className="max-w-4xl mx-auto text-center px-6 pt-12 pb-14">
        <div className="flex items-center justify-center gap-2 text-4xl mb-6">
          {ALL_SIGN_KEYS.map((key) => (
            <span key={key} className="opacity-60 hover:opacity-100 transition-opacity">
              {SIGNS[key].glyph}
            </span>
          ))}
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-text-primary leading-tight mb-4">
          Zodiac{' '}
          <span className="bg-gradient-to-r from-[#9B6FF6] to-[#EC4899] bg-clip-text text-transparent">
            Compatibility
          </span>{' '}
          Guide
        </h1>
        <p className="text-text-tertiary max-w-2xl mx-auto text-base sm:text-lg">
          Explore the cosmic chemistry between every zodiac sign pair. 78 in-depth analyses
          covering emotional, intellectual, physical, and romantic compatibility.
        </p>
      </header>

      {/* ── Sign-by-sign sections ────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 pb-20">
        {ALL_SIGN_KEYS.map((signKey) => (
          <SignSection key={signKey} signKey={signKey} allPairs={allPairs} />
        ))}
      </main>

      {/* ── Full grid ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-display font-bold text-text-primary text-center mb-8">
          All 78 Pairings
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {allPairs.map((pair) => {
            const c = getCompatibilityContent(pair.sign1, pair.sign2);
            return (
              <Link
                key={pair.signs}
                href={`/compatibility/${pair.signs}`}
                className="bg-bg-card border border-border-primary rounded-xl p-3 text-center hover:border-accent-primary/30 hover:bg-bg-card-hover transition-colors group"
              >
                <div className="flex items-center justify-center gap-1.5 mb-1.5">
                  <span className="text-xl">{c.sign1.glyph}</span>
                  <span className="text-text-muted text-[10px]">+</span>
                  <span className="text-xl">{c.sign2.glyph}</span>
                </div>
                <p className="text-xs font-medium text-text-primary group-hover:text-accent-primary transition-colors leading-tight">
                  {c.sign1.name} &amp; {c.sign2.name}
                </p>
                <div className="mt-1.5 w-full h-1 bg-bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-accent"
                    style={{ width: `${c.overallScore}%` }}
                  />
                </div>
                <p className="text-[10px] text-text-muted mt-1">{c.overallScore}%</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gradient-cosmic rounded-3xl p-8 sm:p-12 border border-accent-muted text-center">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-4">
            Go Beyond Sun Signs
          </h2>
          <p className="text-text-tertiary max-w-lg mx-auto mb-8">
            Sun sign compatibility is just the start. Align analyzes your full natal charts —
            Moon, Venus, Mars, and every planetary aspect — to reveal the complete picture
            of your cosmic chemistry.
          </p>
          <Link href="/onboarding" className="btn-primary text-base px-10 py-3.5 inline-block">
            Get Your Full Compatibility Reading
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

function SignSection({
  signKey,
  allPairs,
}: {
  signKey: ZodiacSign;
  allPairs: ReturnType<typeof getAllCompatibilityPairs>;
}) {
  const sign = SIGNS[signKey];
  const pairsForSign = allPairs.filter(
    (p) => p.sign1 === signKey || p.sign2 === signKey
  );

  return (
    <section className="mb-14" id={signKey}>
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center border"
          style={{
            borderColor: getElementColor(sign.element),
            background: `radial-gradient(circle, ${getElementColor(sign.element)}15 0%, transparent 70%)`,
          }}
        >
          <span className="text-2xl">{sign.glyph}</span>
        </div>
        <div>
          <h2 className="text-xl font-display font-semibold text-text-primary">
            {sign.name} Compatibility
          </h2>
          <p className="text-xs text-text-muted">
            {sign.dates} &middot;{' '}
            <span style={{ color: getElementColor(sign.element) }}>
              {sign.element.charAt(0).toUpperCase() + sign.element.slice(1)}
            </span>{' '}
            &middot; {sign.modality.charAt(0).toUpperCase() + sign.modality.slice(1)} &middot;
            Ruled by {sign.ruler}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {pairsForSign.map((pair) => {
          const c = getCompatibilityContent(pair.sign1, pair.sign2);
          const otherSign = pair.sign1 === signKey ? c.sign2 : c.sign1;
          return (
            <Link
              key={pair.signs}
              href={`/compatibility/${pair.signs}`}
              className="bg-bg-card border border-border-primary rounded-xl p-3 text-center hover:border-accent-primary/30 hover:bg-bg-card-hover transition-colors group"
            >
              <span className="text-2xl block mb-1">{otherSign.glyph}</span>
              <p className="text-xs font-medium text-text-primary group-hover:text-accent-primary transition-colors">
                {otherSign.name}
              </p>
              <div className="mt-1.5 w-full h-1 bg-bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-accent"
                  style={{ width: `${c.overallScore}%` }}
                />
              </div>
              <p className="text-[10px] text-text-muted mt-1">{c.overallScore}%</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 h-px bg-border-primary" />
    </section>
  );
}
