import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  getAllCompatibilityPairs,
  parseCompatibilitySlug,
  getCompatibilityContent,
  getElementColor,
  type ZodiacSign,
  type CompatibilitySection,
} from '@/data/compatibilityContent';

/* ── Static params (78 pairs) ─────────────────────────────────── */

export function generateStaticParams() {
  return getAllCompatibilityPairs().map((p) => ({ signs: p.signs }));
}

/* ── Metadata ──────────────────────────────────────────────────── */

type PageProps = { params: Promise<{ signs: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { signs } = await params;
  const parsed = parseCompatibilitySlug(signs);
  if (!parsed) return {};

  const content = getCompatibilityContent(parsed.sign1, parsed.sign2);
  const { sign1, sign2 } = content;
  const title = `${sign1.name} and ${sign2.name} Compatibility`;
  const description = `Discover the cosmic chemistry between ${sign1.name} (${sign1.glyph}) and ${sign2.name} (${sign2.glyph}). In-depth analysis of emotional, intellectual, physical, and romantic compatibility. ${content.elementAffinity.label} energy — ${content.overallScore}% match.`;

  return {
    title,
    description,
    keywords: [
      `${sign1.name.toLowerCase()} ${sign2.name.toLowerCase()} compatibility`,
      `${sign1.name.toLowerCase()} and ${sign2.name.toLowerCase()}`,
      `${sign2.name.toLowerCase()} and ${sign1.name.toLowerCase()} compatibility`,
      'zodiac compatibility',
      'astrology compatibility',
      'sign compatibility',
      `${sign1.name.toLowerCase()} love match`,
      `${sign2.name.toLowerCase()} love match`,
      'synastry',
    ],
    openGraph: {
      title: `${title} | Align`,
      description,
      url: `https://aligncosmic.com/compatibility/${signs}`,
      siteName: 'Align',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Align`,
      description,
    },
    alternates: {
      canonical: `https://aligncosmic.com/compatibility/${signs}`,
    },
  };
}

/* ── Page ───────────────────────────────────────────────────────── */

export default async function CompatibilityPage({ params }: PageProps) {
  const { signs } = await params;
  const parsed = parseCompatibilitySlug(signs);
  if (!parsed) notFound();

  const content = getCompatibilityContent(parsed.sign1, parsed.sign2);
  const { sign1, sign2, overallScore, elementAffinity, sections, quickFacts } = content;

  const isSameSign = parsed.sign1 === parsed.sign2;

  /* JSON-LD structured data for SEO */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${sign1.name} and ${sign2.name} Compatibility`,
    description: `In-depth zodiac compatibility analysis between ${sign1.name} and ${sign2.name}.`,
    publisher: {
      '@type': 'Organization',
      name: 'Align',
      url: 'https://aligncosmic.com',
    },
    mainEntityOfPage: `https://aligncosmic.com/compatibility/${signs}`,
  };

  return (
    <div className="min-h-screen">
      {/* Structured data */}
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
            All Pairings
          </Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ── Breadcrumbs ─────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 pt-2 pb-4">
        <nav className="text-sm text-text-muted" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-text-secondary transition-colors">
                Home
              </Link>
            </li>
            <li className="text-text-muted">/</li>
            <li>
              <Link href="/compatibility" className="hover:text-text-secondary transition-colors">
                Compatibility
              </Link>
            </li>
            <li className="text-text-muted">/</li>
            <li className="text-text-tertiary">
              {sign1.name} &amp; {sign2.name}
            </li>
          </ol>
        </nav>
      </div>

      {/* ── Hero ────────────────────────────────────────────── */}
      <header className="max-w-4xl mx-auto px-6 pt-8 pb-16 text-center">
        {/* Glyphs */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="relative">
            <div
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center border-2"
              style={{
                borderColor: getElementColor(sign1.element),
                background: `radial-gradient(circle, ${getElementColor(sign1.element)}15 0%, transparent 70%)`,
              }}
            >
              <span className="text-5xl sm:text-6xl">{sign1.glyph}</span>
            </div>
            <span
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium px-3 py-1 rounded-full border"
              style={{
                borderColor: getElementColor(sign1.element),
                color: getElementColor(sign1.element),
                backgroundColor: `${getElementColor(sign1.element)}18`,
              }}
            >
              {sign1.element}
            </span>
          </div>

          {/* Heart / connector */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-accent flex items-center justify-center shadow-lg shadow-accent-primary/25">
              <span className="text-2xl sm:text-3xl font-display font-bold text-white">
                {overallScore}%
              </span>
            </div>
            <span className="text-[10px] text-text-muted uppercase tracking-widest mt-1">
              Match
            </span>
          </div>

          <div className="relative">
            <div
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center border-2"
              style={{
                borderColor: getElementColor(sign2.element),
                background: `radial-gradient(circle, ${getElementColor(sign2.element)}15 0%, transparent 70%)`,
              }}
            >
              <span className="text-5xl sm:text-6xl">{sign2.glyph}</span>
            </div>
            <span
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium px-3 py-1 rounded-full border"
              style={{
                borderColor: getElementColor(sign2.element),
                color: getElementColor(sign2.element),
                backgroundColor: `${getElementColor(sign2.element)}18`,
              }}
            >
              {sign2.element}
            </span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-display font-bold text-text-primary leading-tight mb-4">
          {sign1.name}{' '}
          <span className="bg-gradient-to-r from-[#9B6FF6] to-[#EC4899] bg-clip-text text-transparent">
            &amp;
          </span>{' '}
          {sign2.name}
          <br />
          <span className="text-2xl sm:text-3xl text-text-secondary font-normal">
            Compatibility
          </span>
        </h1>

        <p className="text-text-tertiary max-w-2xl mx-auto text-base sm:text-lg mb-2">
          {elementAffinity.description}
        </p>

        <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-accent-muted text-accent-primary text-sm font-medium">
          {elementAffinity.label}
        </div>
      </header>

      {/* ── Quick facts card ────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="bg-bg-card border border-border-primary rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-display font-semibold text-text-primary mb-5">
            At a Glance
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {quickFacts.map((fact) => (
              <div key={fact.label} className="text-center">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                  {fact.label}
                </p>
                <p className="text-sm font-semibold text-text-primary">{fact.value}</p>
              </div>
            ))}
            <div className="text-center">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                Overall Score
              </p>
              <p className="text-sm font-semibold text-accent-primary">{overallScore}%</p>
            </div>
          </div>
          {/* Score bar */}
          <div className="mt-6">
            <div className="w-full h-2 bg-bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-accent transition-all duration-700"
                style={{ width: `${overallScore}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Content sections ────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-6 pb-16 space-y-12">
        {sections.map((section, idx) => (
          <ContentSection key={section.title} section={section} index={idx} />
        ))}
      </main>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gradient-cosmic rounded-3xl p-8 sm:p-12 border border-accent-muted text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">{sign1.glyph}</span>
            <span className="text-2xl text-accent-primary">+</span>
            <span className="text-4xl">{sign2.glyph}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-4">
            Get Your Full Compatibility Reading
          </h2>
          <p className="text-text-tertiary max-w-lg mx-auto mb-8">
            This page covers Sun sign compatibility. For a complete picture, Align analyzes
            your Moon, Venus, Mars, and all planetary connections using your full birth charts.
            Discover your true cosmic chemistry.
          </p>
          <Link href="/onboarding" className="btn-primary text-base px-10 py-3.5 inline-block">
            Get Your Full Compatibility Reading
          </Link>
          <p className="text-text-muted text-xs mt-4">
            Free to start. No credit card required.
          </p>
        </div>
      </section>

      {/* ── Related pairings ────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-xl font-display font-semibold text-text-primary mb-6">
          Explore More Pairings
        </h2>
        <RelatedPairings currentSign1={parsed.sign1} currentSign2={parsed.sign2} />
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-border-primary py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Align. All rights reserved.
          </span>
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href="/compatibility" className="hover:text-text-secondary">
              All Compatibility
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

function ContentSection({
  section,
  index,
}: {
  section: CompatibilitySection;
  index: number;
}) {
  return (
    <article className="scroll-mt-24" id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">{section.icon}</span>
        <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary">
          {section.title}
        </h2>
      </div>
      <div className="space-y-4">
        {section.paragraphs.map((p, i) => (
          <p key={i} className="text-text-secondary leading-relaxed text-[15px]">
            {p}
          </p>
        ))}
      </div>
      {/* Subtle divider */}
      <div className="mt-10 flex items-center gap-4">
        <div className="flex-1 h-px bg-border-primary" />
        <span className="text-text-muted text-xs">&#10022;</span>
        <div className="flex-1 h-px bg-border-primary" />
      </div>
    </article>
  );
}

function RelatedPairings({
  currentSign1,
  currentSign2,
}: {
  currentSign1: ZodiacSign;
  currentSign2: ZodiacSign;
}) {
  const allPairs = getAllCompatibilityPairs();
  const currentSlug =
    currentSign1 === currentSign2
      ? `${currentSign1}-${currentSign2}`
      : [currentSign1, currentSign2].sort().join('-');

  const related = allPairs
    .filter(
      (p) =>
        p.signs !== currentSlug &&
        (p.sign1 === currentSign1 ||
          p.sign2 === currentSign1 ||
          p.sign1 === currentSign2 ||
          p.sign2 === currentSign2)
    )
    .slice(0, 6);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {related.map((pair) => {
        const c = getCompatibilityContent(pair.sign1, pair.sign2);
        return (
          <Link
            key={pair.signs}
            href={`/compatibility/${pair.signs}`}
            className="bg-bg-card border border-border-primary rounded-xl p-4 text-center hover:border-accent-primary/30 transition-colors group"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">{c.sign1.glyph}</span>
              <span className="text-text-muted text-xs">+</span>
              <span className="text-2xl">{c.sign2.glyph}</span>
            </div>
            <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">
              {c.sign1.name} &amp; {c.sign2.name}
            </p>
            <p className="text-xs text-text-muted mt-1">{c.overallScore}% match</p>
          </Link>
        );
      })}
    </div>
  );
}
