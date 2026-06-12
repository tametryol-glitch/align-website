import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  getAllSunMoonCombos,
  parseSunMoonSlug,
  getSunMoonContent,
  getRelatedCombos,
  getElementColor,
  SIGNS,
  type ZodiacSign,
  type PersonalitySection,
  type ElementHarmony,
} from '@/data/sunMoonContent';
import { FaqSchema } from '@/components/seo/FaqSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';

/* ── Static params (144 combos) ──────────────────────────────── */

export function generateStaticParams() {
  return getAllSunMoonCombos().map((c) => ({ combo: c.combo }));
}

/* ── Metadata ─────────────────────────────────────────────────── */

type PageProps = { params: Promise<{ combo: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { combo } = await params;
  const parsed = parseSunMoonSlug(combo);
  if (!parsed) return {};

  const content = getSunMoonContent(parsed.sun, parsed.moon);
  const { sunSign, moonSign } = content;
  const title = `${sunSign.name} Sun ${moonSign.name} Moon Personality`;
  const description = `Discover the ${sunSign.name} Sun ${moonSign.name} Moon personality. ${content.elementHarmony} energy — ${content.soulTagline} Explore emotional patterns, relationship style, hidden strengths, and growth edges for this Sun-Moon combination.`;

  return {
    title,
    description,
    keywords: [
      `${sunSign.name.toLowerCase()} sun ${moonSign.name.toLowerCase()} moon`,
      `${sunSign.name.toLowerCase()} sun ${moonSign.name.toLowerCase()} moon personality`,
      `${sunSign.name.toLowerCase()} sun ${moonSign.name.toLowerCase()} moon compatibility`,
      `sun moon combination ${sunSign.name.toLowerCase()}`,
      'sun moon personality',
      'sun moon astrology',
      'natal chart personality',
      `${sunSign.name.toLowerCase()} personality`,
      `${moonSign.name.toLowerCase()} moon sign`,
    ],
    openGraph: {
      title: `${title} | Align`,
      description,
      url: `https://aligncosmic.com/personality/${combo}`,
      siteName: 'Align',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Align`,
      description,
    },
    alternates: {
      canonical: `https://aligncosmic.com/personality/${combo}`,
    },
  };
}

/* ── Harmony badge colors ─────────────────────────────────────── */

function getHarmonyStyle(harmony: ElementHarmony): { bg: string; text: string; border: string } {
  switch (harmony) {
    case 'Mirror Energy':
      return { bg: 'rgba(155, 111, 246, 0.15)', text: '#B8A0FA', border: 'rgba(155, 111, 246, 0.35)' };
    case 'Harmonious Blend':
      return { bg: 'rgba(34, 197, 94, 0.15)', text: '#22C55E', border: 'rgba(34, 197, 94, 0.35)' };
    case 'Dynamic Tension':
      return { bg: 'rgba(245, 166, 35, 0.15)', text: '#F5A623', border: 'rgba(245, 166, 35, 0.35)' };
    case 'Creative Friction':
      return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.35)' };
  }
}

/* ── Page ──────────────────────────────────────────────────────── */

export default async function PersonalityPage({ params }: PageProps) {
  const { combo } = await params;
  const parsed = parseSunMoonSlug(combo);
  if (!parsed) notFound();

  const content = getSunMoonContent(parsed.sun, parsed.moon);
  const { sunSign, moonSign, soulTagline, elementHarmony, sections, relatableBullets } = content;
  const harmonyStyle = getHarmonyStyle(elementHarmony);

  /* JSON-LD structured data */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${sunSign.name} Sun ${moonSign.name} Moon Personality`,
    description: `In-depth personality analysis for ${sunSign.name} Sun with ${moonSign.name} Moon.`,
    publisher: {
      '@type': 'Organization',
      name: 'Align',
      url: 'https://aligncosmic.com',
    },
    mainEntityOfPage: `https://aligncosmic.com/personality/${combo}`,
  };

  const faqs = [
    { question: `What is a ${sunSign.name} Sun ${moonSign.name} Moon personality like?`, answer: `The ${sunSign.name} Sun ${moonSign.name} Moon combination creates ${elementHarmony.toLowerCase()} energy. ${soulTagline}` },
    { question: `Are ${sunSign.name} Sun ${moonSign.name} Moon people emotional?`, answer: `With a ${moonSign.name} Moon, the emotional world is filtered through ${moonSign.element} energy, while the ${sunSign.name} Sun drives the outer identity through ${sunSign.element} expression.` },
    { question: `What are the strengths of ${sunSign.name} Sun ${moonSign.name} Moon?`, answer: relatableBullets?.slice(0, 3).join(' ') || `This combination blends ${sunSign.name}'s ${sunSign.element} drive with ${moonSign.name}'s ${moonSign.element} emotional depth.` },
  ];

  const breadcrumbs = [
    { name: 'Home', url: 'https://aligncosmic.com' },
    { name: 'Personality', url: 'https://aligncosmic.com/personality' },
    { name: `${sunSign.name} Sun ${moonSign.name} Moon`, url: `https://aligncosmic.com/personality/${combo}` },
  ];

  return (
    <div className="min-h-screen">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FaqSchema faqs={faqs} />
      <BreadcrumbSchema items={breadcrumbs} />

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
          <Link href="/blog" className="text-sm text-text-secondary hover:text-text-primary transition-colors hidden sm:inline">
            Blog
          </Link>
          <Link href="/events" className="text-sm text-text-secondary hover:text-text-primary transition-colors hidden sm:inline">
            Events
          </Link>
          <Link
            href="/personality"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            All Combinations
          </Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ── Breadcrumbs ──────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 pt-2 pb-4">
        <nav className="text-sm text-text-muted" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <Link href="/" className="hover:text-text-secondary transition-colors">
                Home
              </Link>
            </li>
            <li className="text-text-muted">/</li>
            <li>
              <Link href="/personality" className="hover:text-text-secondary transition-colors">
                Personality
              </Link>
            </li>
            <li className="text-text-muted">/</li>
            <li className="text-text-tertiary">
              {sunSign.name} Sun {moonSign.name} Moon
            </li>
          </ol>
        </nav>
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <header className="max-w-4xl mx-auto px-6 pt-8 pb-16 text-center">
        {/* Glyphs */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="relative">
            <div
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center border-2"
              style={{
                borderColor: getElementColor(sunSign.element),
                background: `radial-gradient(circle, ${getElementColor(sunSign.element)}15 0%, transparent 70%)`,
              }}
            >
              <span className="text-5xl sm:text-6xl">{sunSign.glyph}</span>
            </div>
            <span
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium px-3 py-1 rounded-full border whitespace-nowrap"
              style={{
                borderColor: getElementColor(sunSign.element),
                color: getElementColor(sunSign.element),
                backgroundColor: `${getElementColor(sunSign.element)}18`,
              }}
            >
              {sunSign.name} Sun
            </span>
          </div>

          {/* Connector */}
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border"
              style={{
                borderColor: harmonyStyle.border,
                backgroundColor: harmonyStyle.bg,
              }}
            >
              <span className="text-lg sm:text-xl" style={{ color: harmonyStyle.text }}>
                &#10022;
              </span>
            </div>
          </div>

          <div className="relative">
            <div
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center border-2"
              style={{
                borderColor: getElementColor(moonSign.element),
                background: `radial-gradient(circle, ${getElementColor(moonSign.element)}15 0%, transparent 70%)`,
              }}
            >
              <span className="text-5xl sm:text-6xl">{moonSign.glyph}</span>
            </div>
            <span
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium px-3 py-1 rounded-full border whitespace-nowrap"
              style={{
                borderColor: getElementColor(moonSign.element),
                color: getElementColor(moonSign.element),
                backgroundColor: `${getElementColor(moonSign.element)}18`,
              }}
            >
              {moonSign.name} Moon
            </span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-display font-bold text-text-primary leading-tight mb-4">
          {sunSign.name} Sun{' '}
          <span className="bg-gradient-to-r from-[#9B6FF6] to-[#EC4899] bg-clip-text text-transparent">
            {moonSign.name} Moon
          </span>
        </h1>

        <p className="text-text-tertiary max-w-2xl mx-auto text-base sm:text-lg italic mb-6">
          &ldquo;{soulTagline}&rdquo;
        </p>

        {/* Element harmony badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border"
          style={{
            backgroundColor: harmonyStyle.bg,
            color: harmonyStyle.text,
            borderColor: harmonyStyle.border,
          }}
        >
          {elementHarmony}
        </div>
      </header>

      {/* ── Quick facts card ─────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="bg-bg-card border border-border-primary rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-display font-semibold text-text-primary mb-5">
            At a Glance
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Sun Sign</p>
              <p className="text-sm font-semibold text-text-primary">
                {sunSign.glyph} {sunSign.name}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Moon Sign</p>
              <p className="text-sm font-semibold text-text-primary">
                {moonSign.glyph} {moonSign.name}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Sun Element</p>
              <p className="text-sm font-semibold" style={{ color: getElementColor(sunSign.element) }}>
                {sunSign.element.charAt(0).toUpperCase() + sunSign.element.slice(1)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Moon Element</p>
              <p className="text-sm font-semibold" style={{ color: getElementColor(moonSign.element) }}>
                {moonSign.element.charAt(0).toUpperCase() + moonSign.element.slice(1)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Sun Modality</p>
              <p className="text-sm font-semibold text-text-primary">
                {sunSign.modality.charAt(0).toUpperCase() + sunSign.modality.slice(1)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Moon Modality</p>
              <p className="text-sm font-semibold text-text-primary">
                {moonSign.modality.charAt(0).toUpperCase() + moonSign.modality.slice(1)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Sun Ruler</p>
              <p className="text-sm font-semibold text-text-primary">{sunSign.ruler}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Energy Type</p>
              <p className="text-sm font-semibold" style={{ color: harmonyStyle.text }}>
                {elementHarmony}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content sections ─────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-6 pb-16 space-y-12">
        {sections.map((section, idx) => (
          <ContentBlock key={section.title} section={section} index={idx} />
        ))}
      </main>

      {/* ── "You might relate to this if..." ─────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-bg-card border border-border-primary rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">&#10003;</span>
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary">
              You Might Relate to This If...
            </h2>
          </div>
          <ul className="space-y-4">
            {relatableBullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="mt-1.5 w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center text-xs"
                  style={{
                    borderColor: harmonyStyle.border,
                    color: harmonyStyle.text,
                    backgroundColor: harmonyStyle.bg,
                  }}
                >
                  &#10022;
                </span>
                <p className="text-text-secondary leading-relaxed text-[15px]">{bullet}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Sign links ───────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/compatibility/${[parsed.sun, parsed.sun].sort().join('-')}`}
            className="bg-bg-card border border-border-primary rounded-xl px-4 py-2.5 text-sm text-text-secondary hover:text-accent-primary hover:border-accent-primary/30 transition-colors"
          >
            {sunSign.glyph} {sunSign.name} Compatibility
          </Link>
          {parsed.sun !== parsed.moon && (
            <Link
              href={`/compatibility/${[parsed.moon, parsed.moon].sort().join('-')}`}
              className="bg-bg-card border border-border-primary rounded-xl px-4 py-2.5 text-sm text-text-secondary hover:text-accent-primary hover:border-accent-primary/30 transition-colors"
            >
              {moonSign.glyph} {moonSign.name} Compatibility
            </Link>
          )}
          <Link
            href="/personality"
            className="bg-bg-card border border-border-primary rounded-xl px-4 py-2.5 text-sm text-text-secondary hover:text-accent-primary hover:border-accent-primary/30 transition-colors"
          >
            All 144 Combinations
          </Link>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gradient-cosmic rounded-3xl p-8 sm:p-12 border border-accent-muted text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">{sunSign.glyph}</span>
            <span className="text-2xl text-accent-primary">&#9790;</span>
            <span className="text-4xl">{moonSign.glyph}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-4">
            Get Your Full Chart
          </h2>
          <p className="text-text-tertiary max-w-lg mx-auto mb-8">
            This page explores your Sun-Moon combination. Your full birth chart includes
            Rising sign, Venus, Mars, and every planetary placement — each adding depth to who
            you are. Discover the complete picture with Align.
          </p>
          <Link href="/onboarding" className="btn-primary text-base px-10 py-3.5 inline-block">
            Get Your Full Chart
          </Link>
          <p className="text-text-muted text-xs mt-4">
            Free to start. No credit card required.
          </p>
        </div>
      </section>

      {/* ── Related combos ───────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-xl font-display font-semibold text-text-primary mb-6">
          More {sunSign.name} Sun Combinations
        </h2>
        <RelatedCombos currentSun={parsed.sun} currentMoon={parsed.moon} />
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-border-primary py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Align. All rights reserved.
          </span>
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href="/personality" className="hover:text-text-secondary">
              All Personalities
            </Link>
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

/* ── Sub-components ──────────────────────────────────────────── */

function ContentBlock({
  section,
  index,
}: {
  section: PersonalitySection;
  index: number;
}) {
  return (
    <article
      className="scroll-mt-24"
      id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
    >
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

function RelatedCombos({
  currentSun,
  currentMoon,
}: {
  currentSun: ZodiacSign;
  currentMoon: ZodiacSign;
}) {
  const related = getRelatedCombos(currentSun, currentMoon, 6);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {related.map((c) => {
        const content = getSunMoonContent(c.sun, c.moon);
        return (
          <Link
            key={c.combo}
            href={`/personality/${c.combo}`}
            className="bg-bg-card border border-border-primary rounded-xl p-4 text-center hover:border-accent-primary/30 transition-colors group"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">{content.sunSign.glyph}</span>
              <span className="text-text-muted text-xs">&#9790;</span>
              <span className="text-2xl">{content.moonSign.glyph}</span>
            </div>
            <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">
              {content.sunSign.name} Sun {content.moonSign.name} Moon
            </p>
            <p className="text-xs text-text-muted mt-1 italic line-clamp-1">
              {content.soulTagline}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
