import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  ALL_SIGN_KEYS,
  getZodiacSignProfile,
  getAdjacentSigns,
  getElementColor,
  type ZodiacSign,
} from '@/data/zodiacSignContent';

/* ── Static params (12 signs) ────────────────────────────────── */

export function generateStaticParams() {
  return ALL_SIGN_KEYS.map((sign) => ({ sign }));
}

/* ── Metadata ─────────────────────────────────────────────────── */

type PageProps = { params: Promise<{ sign: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sign } = await params;
  if (!ALL_SIGN_KEYS.includes(sign as ZodiacSign)) return {};

  const profile = getZodiacSignProfile(sign as ZodiacSign);
  const title = `${profile.name} Zodiac Sign — Personality, Love, Career & Compatibility`;
  const description = `Everything you need to know about ${profile.name} (${profile.glyph} ${profile.dates}). Deep personality profile, love style, career strengths, compatibility, shadow work, and famous ${profile.name} people. Ruled by ${profile.ruler}, ${profile.element} element.`;

  return {
    title,
    description,
    keywords: [
      `${profile.name.toLowerCase()} zodiac`,
      `${profile.name.toLowerCase()} personality`,
      `${profile.name.toLowerCase()} traits`,
      `${profile.name.toLowerCase()} compatibility`,
      `${profile.name.toLowerCase()} love`,
      `${profile.name.toLowerCase()} career`,
      `${profile.name.toLowerCase()} sign`,
      `${profile.name.toLowerCase()} horoscope`,
      `${profile.element} sign`,
      'zodiac signs',
      'astrology',
      'sun sign',
    ],
    openGraph: {
      title: `${title} | Align`,
      description,
      url: `https://aligncosmic.com/zodiac/${sign}`,
      siteName: 'Align',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Align`,
      description,
    },
    alternates: {
      canonical: `https://aligncosmic.com/zodiac/${sign}`,
    },
  };
}

/* ── Page ──────────────────────────────────────────────────────── */

export default async function ZodiacSignPage({ params }: PageProps) {
  const { sign } = await params;
  if (!ALL_SIGN_KEYS.includes(sign as ZodiacSign)) notFound();

  const profile = getZodiacSignProfile(sign as ZodiacSign);
  const { prev, next } = getAdjacentSigns(sign as ZodiacSign);
  const prevProfile = getZodiacSignProfile(prev);
  const nextProfile = getZodiacSignProfile(next);
  const elementColor = getElementColor(profile.element);

  /* JSON-LD structured data */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${profile.name} Zodiac Sign — Personality, Love, Career & Compatibility`,
    description: `Complete ${profile.name} zodiac sign profile. Personality traits, love style, career guidance, compatibility, and growth.`,
    publisher: {
      '@type': 'Organization',
      name: 'Align',
      url: 'https://aligncosmic.com',
    },
    mainEntityOfPage: `https://aligncosmic.com/zodiac/${sign}`,
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
            href="/zodiac"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            All Signs
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
            <li>
              <Link href="/" className="hover:text-text-secondary transition-colors">
                Home
              </Link>
            </li>
            <li className="text-text-muted">/</li>
            <li>
              <Link href="/zodiac" className="hover:text-text-secondary transition-colors">
                Zodiac
              </Link>
            </li>
            <li className="text-text-muted">/</li>
            <li className="text-text-tertiary">{profile.name}</li>
          </ol>
        </nav>
      </div>

      {/* ── Hero ───────────────────────────────────────────── */}
      <header className="max-w-4xl mx-auto px-6 pt-8 pb-16 text-center">
        {/* Glyph */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <div
              className="w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center border-2"
              style={{
                borderColor: elementColor,
                background: `radial-gradient(circle, ${elementColor}15 0%, transparent 70%)`,
              }}
            >
              <span className="text-6xl sm:text-7xl">{profile.glyph}</span>
            </div>
            <span
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium px-3 py-1 rounded-full border"
              style={{
                borderColor: elementColor,
                color: elementColor,
                backgroundColor: `${elementColor}18`,
              }}
            >
              {profile.element.charAt(0).toUpperCase() + profile.element.slice(1)}
            </span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-display font-bold text-text-primary leading-tight mb-4">
          {profile.name}
          <br />
          <span className="text-2xl sm:text-3xl text-text-secondary font-normal">
            {profile.dates}
          </span>
        </h1>

        <div className="flex items-center justify-center gap-4 flex-wrap mt-4">
          <span
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border"
            style={{
              borderColor: elementColor,
              color: elementColor,
              backgroundColor: `${elementColor}18`,
            }}
          >
            {profile.element.charAt(0).toUpperCase() + profile.element.slice(1)} Sign
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-border-primary text-text-secondary bg-bg-card">
            {profile.modality.charAt(0).toUpperCase() + profile.modality.slice(1)} Quality
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-border-primary text-text-secondary bg-bg-card">
            Ruled by {profile.ruler}
          </span>
        </div>
      </header>

      {/* ── Quick facts card ───────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="bg-bg-card border border-border-primary rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-display font-semibold text-text-primary mb-5">
            At a Glance
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Element</p>
              <p className="text-sm font-semibold" style={{ color: elementColor }}>
                {profile.element.charAt(0).toUpperCase() + profile.element.slice(1)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Modality</p>
              <p className="text-sm font-semibold text-text-primary">
                {profile.modality.charAt(0).toUpperCase() + profile.modality.slice(1)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Ruling Planet</p>
              <p className="text-sm font-semibold text-text-primary">{profile.ruler}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Dates</p>
              <p className="text-sm font-semibold text-text-primary">{profile.dates}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Best Match</p>
              <p className="text-sm font-semibold text-accent-primary">
                {getZodiacSignProfile(profile.bestMatches[0]).name}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Strengths</p>
              <p className="text-sm font-semibold text-text-primary">{profile.strengths.length} Key Gifts</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Personality traits pills ───────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <h2 className="text-xl font-display font-semibold text-text-primary mb-5">
          Core Personality Traits
        </h2>
        <div className="flex flex-wrap gap-2">
          {profile.personalityTraits.map((trait) => (
            <span
              key={trait}
              className="px-4 py-2 rounded-full text-sm font-medium border"
              style={{
                borderColor: `${elementColor}40`,
                color: elementColor,
                backgroundColor: `${elementColor}12`,
              }}
            >
              {trait.charAt(0).toUpperCase() + trait.slice(1)}
            </span>
          ))}
        </div>
      </section>

      {/* ── Element description ────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div
          className="rounded-2xl p-6 sm:p-8 border"
          style={{
            borderColor: `${elementColor}30`,
            background: `linear-gradient(135deg, ${elementColor}08 0%, transparent 100%)`,
          }}
        >
          <h2 className="text-lg font-display font-semibold text-text-primary mb-3">
            {profile.element.charAt(0).toUpperCase() + profile.element.slice(1)} Element
          </h2>
          <p className="text-text-secondary leading-relaxed text-[15px]">
            {profile.elementDescription}
          </p>
        </div>
      </section>

      {/* ── Content sections ───────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-6 pb-16 space-y-12">
        {profile.sections.map((section) => (
          <ContentSection key={section.title} section={section} />
        ))}

        {/* ── Strengths & Weaknesses ─────────────────────── */}
        <article className="scroll-mt-24" id="strengths-weaknesses">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">💪</span>
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary">
              Strengths & Weaknesses
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-bg-card border border-border-primary rounded-xl p-5">
              <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">
                Strengths
              </h3>
              <ul className="space-y-2">
                {profile.strengths.map((s) => (
                  <li key={s} className="text-text-secondary text-[15px] flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">+</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-bg-card border border-border-primary rounded-xl p-5">
              <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3">
                Growth Areas
              </h3>
              <ul className="space-y-2">
                {profile.weaknesses.map((w) => (
                  <li key={w} className="text-text-secondary text-[15px] flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">-</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-10 flex items-center gap-4">
            <div className="flex-1 h-px bg-border-primary" />
            <span className="text-text-muted text-xs">&#10022;</span>
            <div className="flex-1 h-px bg-border-primary" />
          </div>
        </article>

        {/* ── Love Style ─────────────────────────────────── */}
        <article className="scroll-mt-24" id="love-style">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">💘</span>
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary">
              {profile.name} in Love
            </h2>
          </div>
          <div className="space-y-4">
            {profile.loveStyle.map((p, i) => (
              <p key={i} className="text-text-secondary leading-relaxed text-[15px]">
                {p}
              </p>
            ))}
          </div>
          <div className="mt-10 flex items-center gap-4">
            <div className="flex-1 h-px bg-border-primary" />
            <span className="text-text-muted text-xs">&#10022;</span>
            <div className="flex-1 h-px bg-border-primary" />
          </div>
        </article>

        {/* ── Career Strengths ───────────────────────────── */}
        <article className="scroll-mt-24" id="career">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">💼</span>
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary">
              {profile.name} Career Strengths
            </h2>
          </div>
          <div className="space-y-4">
            {profile.careerStrengths.map((p, i) => (
              <p key={i} className="text-text-secondary leading-relaxed text-[15px]">
                {p}
              </p>
            ))}
          </div>
          <div className="mt-10 flex items-center gap-4">
            <div className="flex-1 h-px bg-border-primary" />
            <span className="text-text-muted text-xs">&#10022;</span>
            <div className="flex-1 h-px bg-border-primary" />
          </div>
        </article>

        {/* ── Shadow Side ────────────────────────────────── */}
        <article className="scroll-mt-24" id="shadow">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">🌑</span>
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary">
              The {profile.name} Shadow
            </h2>
          </div>
          <p className="text-text-secondary leading-relaxed text-[15px]">
            {profile.shadowSide}
          </p>
          <div className="mt-10 flex items-center gap-4">
            <div className="flex-1 h-px bg-border-primary" />
            <span className="text-text-muted text-xs">&#10022;</span>
            <div className="flex-1 h-px bg-border-primary" />
          </div>
        </article>

        {/* ── Life Purpose ───────────────────────────────── */}
        <article className="scroll-mt-24" id="life-purpose">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">🌟</span>
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary">
              Soul Lesson & Life Purpose
            </h2>
          </div>
          <p className="text-text-secondary leading-relaxed text-[15px]">
            {profile.lifePurpose}
          </p>
          <div className="mt-10 flex items-center gap-4">
            <div className="flex-1 h-px bg-border-primary" />
            <span className="text-text-muted text-xs">&#10022;</span>
            <div className="flex-1 h-px bg-border-primary" />
          </div>
        </article>

        {/* ── Famous People ──────────────────────────────── */}
        <article className="scroll-mt-24" id="famous-people">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">🌟</span>
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary">
              Famous {profile.name} People
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.famousPeople.map((person) => (
              <span
                key={person}
                className="px-4 py-2 rounded-full text-sm font-medium bg-bg-card border border-border-primary text-text-secondary"
              >
                {person}
              </span>
            ))}
          </div>
          <div className="mt-10 flex items-center gap-4">
            <div className="flex-1 h-px bg-border-primary" />
            <span className="text-text-muted text-xs">&#10022;</span>
            <div className="flex-1 h-px bg-border-primary" />
          </div>
        </article>

        {/* ── Compatibility quick links ──────────────────── */}
        <article className="scroll-mt-24" id="compatibility">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">💫</span>
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary">
              {profile.name} Compatibility
            </h2>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">
              Best Matches
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {profile.bestMatches.map((matchSign) => {
                const match = getZodiacSignProfile(matchSign);
                const slug = [sign, matchSign].sort().join('-');
                return (
                  <Link
                    key={matchSign}
                    href={`/compatibility/${slug}`}
                    className="bg-bg-card border border-border-primary rounded-xl p-4 text-center hover:border-emerald-400/30 transition-colors group"
                  >
                    <span className="text-3xl block mb-2">{match.glyph}</span>
                    <p className="text-sm font-medium text-text-primary group-hover:text-emerald-400 transition-colors">
                      {match.name}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">
              Challenging Matches
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {profile.challengingMatches.map((matchSign) => {
                const match = getZodiacSignProfile(matchSign);
                const slug = [sign, matchSign].sort().join('-');
                return (
                  <Link
                    key={matchSign}
                    href={`/compatibility/${slug}`}
                    className="bg-bg-card border border-border-primary rounded-xl p-4 text-center hover:border-amber-400/30 transition-colors group"
                  >
                    <span className="text-3xl block mb-2">{match.glyph}</span>
                    <p className="text-sm font-medium text-text-primary group-hover:text-amber-400 transition-colors">
                      {match.name}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          <p className="text-text-muted text-sm mt-6">
            View the full{' '}
            <Link href="/compatibility" className="text-accent-primary hover:underline">
              compatibility guide
            </Link>{' '}
            for all 78 sign pairings.
          </p>
        </article>
      </main>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gradient-cosmic rounded-3xl p-8 sm:p-12 border border-accent-muted text-center">
          <span className="text-5xl block mb-4">{profile.glyph}</span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-4">
            Get Your Full {profile.name} Chart
          </h2>
          <p className="text-text-tertiary max-w-lg mx-auto mb-8">
            This page covers your Sun sign. But your Moon, Rising, Venus, Mars, and all planetary
            placements create a much richer picture. Discover your complete cosmic blueprint with
            Align.
          </p>
          <Link href="/onboarding" className="btn-primary text-base px-10 py-3.5 inline-block">
            Get Your Full {profile.name} Chart
          </Link>
          <p className="text-text-muted text-xs mt-4">
            Free to start. No credit card required.
          </p>
        </div>
      </section>

      {/* ── Previous / Next navigation ─────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-xl font-display font-semibold text-text-primary mb-6">
          Explore More Signs
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Link
            href={`/zodiac/${prev}`}
            className="bg-bg-card border border-border-primary rounded-xl p-5 text-center hover:border-accent-primary/30 transition-colors group"
          >
            <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Previous Sign</p>
            <span className="text-3xl block mb-2">{prevProfile.glyph}</span>
            <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">
              {prevProfile.name}
            </p>
          </Link>
          <Link
            href={`/zodiac/${next}`}
            className="bg-bg-card border border-border-primary rounded-xl p-5 text-center hover:border-accent-primary/30 transition-colors group"
          >
            <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Next Sign</p>
            <span className="text-3xl block mb-2">{nextProfile.glyph}</span>
            <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">
              {nextProfile.name}
            </p>
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-border-primary py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Align. All rights reserved.
          </span>
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href="/zodiac" className="hover:text-text-secondary">
              All Zodiac Signs
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

/* ── Sub-components ─────────────────────────────────────────── */

function ContentSection({
  section,
}: {
  section: { title: string; icon: string; paragraphs: string[] };
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
