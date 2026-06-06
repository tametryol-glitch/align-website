import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  ALL_SIGN_KEYS,
  SIGNS,
  getElementColor,
  getRisingSignContent,
  RISING_SYMBOL,
  type ZodiacSign,
} from '@/data/risingSignContent';

/* ── Static params (12 signs) ────────────────────────────────── */

export function generateStaticParams() {
  return ALL_SIGN_KEYS.map((sign) => ({ sign }));
}

/* ── Metadata ─────────────────────────────────────────────────── */

type PageProps = { params: Promise<{ sign: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sign } = await params;
  if (!ALL_SIGN_KEYS.includes(sign as ZodiacSign)) return {};

  const s = SIGNS[sign as ZodiacSign];
  const title = `${s.name} Rising Sign — First Impressions, Appearance & Life Approach`;
  const description = `Discover what ${s.name} rising (${s.glyph} ascendant) means for your first impressions, physical appearance, and approach to life. Ruled by ${s.ruler}, ${s.element} element.`;

  return {
    title,
    description,
    keywords: [
      `${s.name.toLowerCase()} rising`,
      `${s.name.toLowerCase()} ascendant`,
      `${s.name.toLowerCase()} rising sign`,
      `${s.name.toLowerCase()} rising appearance`,
      `${s.name.toLowerCase()} rising personality`,
      'rising sign',
      'ascendant sign',
      'astrology',
      `${s.element} rising`,
    ],
    openGraph: {
      title: `${title} | Align`,
      description,
      url: `https://aligncosmic.com/rising-sign/${sign}`,
      siteName: 'Align',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Align`,
      description,
    },
    alternates: {
      canonical: `https://aligncosmic.com/rising-sign/${sign}`,
    },
  };
}

/* ── Page ──────────────────────────────────────────────────────── */

export default async function RisingSignPage({ params }: PageProps) {
  const { sign } = await params;
  if (!ALL_SIGN_KEYS.includes(sign as ZodiacSign)) notFound();

  const content = getRisingSignContent(sign as ZodiacSign);
  const s = SIGNS[sign as ZodiacSign];
  const elementColor = getElementColor(s.element);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: content.headline,
    description: content.intro.slice(0, 160),
    publisher: {
      '@type': 'Organization',
      name: 'Align',
      url: 'https://aligncosmic.com',
    },
    mainEntityOfPage: `https://aligncosmic.com/rising-sign/${sign}`,
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
          <Image src="/logo.png" alt="Align logo" width={32} height={32} className="w-8 h-8 rounded-lg" />
          Align
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/rising-sign" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            All Rising Signs
          </Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ── Breadcrumbs ────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 pt-2 pb-4">
        <nav className="text-sm text-text-muted" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-text-secondary transition-colors">Home</Link></li>
            <li className="text-text-muted">/</li>
            <li><Link href="/rising-sign" className="hover:text-text-secondary transition-colors">Rising Signs</Link></li>
            <li className="text-text-muted">/</li>
            <li className="text-text-tertiary">{s.name} Rising</li>
          </ol>
        </nav>
      </div>

      {/* ── Hero ───────────────────────────────────────────── */}
      <header className="max-w-4xl mx-auto px-6 pt-8 pb-16 text-center">
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <div
              className="w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center border-2"
              style={{
                borderColor: elementColor,
                background: `radial-gradient(circle, ${elementColor}15 0%, transparent 70%)`,
              }}
            >
              <span className="text-6xl sm:text-7xl">{s.glyph}</span>
            </div>
            <span
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium px-3 py-1 rounded-full border"
              style={{ borderColor: elementColor, color: elementColor, backgroundColor: `${elementColor}18` }}
            >
              {RISING_SYMBOL}
            </span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-display font-bold text-text-primary leading-tight mb-4">
          {s.name} Rising
          <br />
          <span className="text-2xl sm:text-3xl text-text-secondary font-normal">Your Ascendant Sign</span>
        </h1>

        <div className="flex items-center justify-center gap-4 flex-wrap mt-4">
          <span
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border"
            style={{ borderColor: elementColor, color: elementColor, backgroundColor: `${elementColor}18` }}
          >
            {s.element.charAt(0).toUpperCase() + s.element.slice(1)} Sign
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-border-primary text-text-secondary bg-bg-card">
            Ruled by {s.ruler}
          </span>
        </div>
      </header>

      {/* ── Intro ──────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="bg-bg-card border border-border-primary rounded-2xl p-6 sm:p-8">
          <p className="text-text-secondary leading-relaxed text-[15px]">{content.intro}</p>
        </div>
      </section>

      {/* ── Content sections ───────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-6 pb-16 space-y-12">
        {content.sections.map((section) => (
          <article key={section.title} className="scroll-mt-24" id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">{section.icon}</span>
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary">{section.title}</h2>
            </div>
            <div className="space-y-4">
              {section.paragraphs.map((p, i) => (
                <p key={i} className="text-text-secondary leading-relaxed text-[15px]">{p}</p>
              ))}
            </div>
            <div className="mt-10 flex items-center gap-4">
              <div className="flex-1 h-px bg-border-primary" />
              <span className="text-text-muted text-xs">&#10022;</span>
              <div className="flex-1 h-px bg-border-primary" />
            </div>
          </article>
        ))}
      </main>

      {/* ── Related pages ──────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <h2 className="text-xl font-display font-semibold text-text-primary mb-6">Explore {s.name} Placements</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href={`/zodiac/${sign}`} className="bg-bg-card border border-border-primary rounded-xl p-4 text-center hover:border-accent-primary/30 transition-colors group">
            <p className="text-xs text-text-muted mb-1">Sun Sign</p>
            <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">{s.name}</p>
          </Link>
          <Link href={`/moon-sign/${sign}`} className="bg-bg-card border border-border-primary rounded-xl p-4 text-center hover:border-accent-primary/30 transition-colors group">
            <p className="text-xs text-text-muted mb-1">Moon Sign</p>
            <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">Moon in {s.name}</p>
          </Link>
          <Link href={`/venus-in/${sign}`} className="bg-bg-card border border-border-primary rounded-xl p-4 text-center hover:border-accent-primary/30 transition-colors group">
            <p className="text-xs text-text-muted mb-1">Venus Sign</p>
            <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">Venus in {s.name}</p>
          </Link>
          <Link href={`/mars-in/${sign}`} className="bg-bg-card border border-border-primary rounded-xl p-4 text-center hover:border-accent-primary/30 transition-colors group">
            <p className="text-xs text-text-muted mb-1">Mars Sign</p>
            <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">Mars in {s.name}</p>
          </Link>
          <Link href={`/mercury-in/${sign}`} className="bg-bg-card border border-border-primary rounded-xl p-4 text-center hover:border-accent-primary/30 transition-colors group">
            <p className="text-xs text-text-muted mb-1">Mercury Sign</p>
            <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">Mercury in {s.name}</p>
          </Link>
          <Link href={`/compatibility`} className="bg-bg-card border border-border-primary rounded-xl p-4 text-center hover:border-accent-primary/30 transition-colors group">
            <p className="text-xs text-text-muted mb-1">Compatibility</p>
            <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">{s.name} Matches</p>
          </Link>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gradient-cosmic rounded-3xl p-8 sm:p-12 border border-accent-muted text-center">
          <span className="text-5xl block mb-4">{s.glyph}</span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-4">
            Get Your Full Chart
          </h2>
          <p className="text-text-tertiary max-w-lg mx-auto mb-8">
            Your rising sign is just one piece of your cosmic blueprint. Discover your Moon, Venus, Mars,
            and all planetary placements with Align.
          </p>
          <Link href="/onboarding" className="btn-primary text-base px-10 py-3.5 inline-block">
            Get Your Full Chart
          </Link>
          <p className="text-text-muted text-xs mt-4">Free to start. No credit card required.</p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-border-primary py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-text-muted">&copy; {new Date().getFullYear()} Align. All rights reserved.</span>
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href="/rising-sign" className="hover:text-text-secondary">All Rising Signs</Link>
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
