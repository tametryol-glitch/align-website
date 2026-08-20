/* ──────────────────────────────────────────────────────────────
   Shared renderer for every cosmic-body SEO page.

   makeBodySignPage('ceres-in')  -> /ceres-in/[sign]
   makeBodyIndexPage('ceres-in') -> /ceres-in

   The per-route files under src/app are thin re-exports of these,
   so all 65 bodies share one layout and one set of fixes.
   ────────────────────────────────────────────────────────────── */

import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  ALL_SIGN_KEYS,
  SIGNS,
  getElementColor,
  getBodySignContent,
  getBodyEssence,
  KIND_LABEL,
  type ZodiacSign,
} from '@/data/cosmicBodies/types';
import { getBodyBySlug } from '@/data/cosmicBodies';

const BASE = 'https://aligncosmic.com';

type SignPageProps = { params: Promise<{ sign: string }> };

function isSign(v: string): v is ZodiacSign {
  return (ALL_SIGN_KEYS as string[]).includes(v);
}

function Nav({ slug, name }: { slug: string; name: string }) {
  return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
      <Link href="/" className="text-xl font-display font-bold text-text-primary flex items-center gap-2">
        <Image src="/logo.png" alt="Align logo" width={32} height={32} className="w-8 h-8 rounded-lg" />Align
      </Link>
      <div className="flex items-center gap-3">
        <Link href={`/${slug}`} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
          All {name} Signs
        </Link>
        <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">Get Started Free</Link>
      </div>
    </nav>
  );
}

function Footer({ slug, name }: { slug: string; name: string }) {
  return (
    <footer className="border-t border-border-primary py-8 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-sm text-text-muted">&copy; {new Date().getFullYear()} Align. All rights reserved.</span>
        <div className="flex gap-6 text-sm text-text-muted flex-wrap justify-center">
          <Link href={`/${slug}`} className="hover:text-text-secondary">All {name} Signs</Link>
          <Link href="/cosmic-index" className="hover:text-text-secondary">Cosmic Index</Link>
          <Link href="/zodiac" className="hover:text-text-secondary">Zodiac Signs</Link>
          <Link href="/settings/terms" className="hover:text-text-secondary">Terms</Link>
          <Link href="/settings/privacy" className="hover:text-text-secondary">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}

/* ── /{slug}/[sign] ─────────────────────────────────────────────── */

export function makeBodySignPage(slug: string) {
  function generateStaticParams() {
    return ALL_SIGN_KEYS.map((sign) => ({ sign }));
  }

  async function generateMetadata({ params }: SignPageProps): Promise<Metadata> {
    const { sign } = await params;
    const body = getBodyBySlug(slug);
    if (!body || !isSign(sign)) return {};
    const s = SIGNS[sign];
    const title = `${body.name} in ${s.name} — ${body.headline}`;
    const description = `What ${body.name} in ${s.name} (${s.glyph}) means in your birth chart: ${body.domain}. Full astrological breakdown of the gift, the shadow and the work.`;
    const url = `${BASE}/${slug}/${sign}`;
    return {
      title,
      description,
      keywords: getBodySignContent(body, sign).keywords,
      openGraph: { title: `${title} | Align`, description, url, siteName: 'Align', type: 'article' },
      twitter: { card: 'summary_large_image', title: `${title} | Align`, description },
      alternates: { canonical: url },
    };
  }

  async function Page({ params }: SignPageProps) {
    const { sign } = await params;
    const body = getBodyBySlug(slug);
    if (!body || !isSign(sign)) notFound();

    const content = getBodySignContent(body, sign);
    const s = SIGNS[sign];
    const elementColor = getElementColor(s.element);

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: content.title,
      description: content.intro.slice(0, 160),
      publisher: { '@type': 'Organization', name: 'Align', url: BASE },
      mainEntityOfPage: `${BASE}/${slug}/${sign}`,
    };

    return (
      <div className="min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Nav slug={slug} name={body.name} />

        <div className="max-w-4xl mx-auto px-6 pt-2 pb-4">
          <nav className="text-sm text-text-muted" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 flex-wrap">
              <li><Link href="/" className="hover:text-text-secondary transition-colors">Home</Link></li>
              <li className="text-text-muted">/</li>
              <li><Link href={`/${slug}`} className="hover:text-text-secondary transition-colors">{body.name} Signs</Link></li>
              <li className="text-text-muted">/</li>
              <li className="text-text-tertiary">{content.title}</li>
            </ol>
          </nav>
        </div>

        <header className="max-w-4xl mx-auto px-6 pt-8 pb-16 text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div
                className="w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center border-2"
                style={{ borderColor: elementColor, background: `radial-gradient(circle, ${elementColor}15 0%, transparent 70%)` }}
              >
                <span className="text-6xl sm:text-7xl">{s.glyph}</span>
              </div>
              <span
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium px-3 py-1 rounded-full border whitespace-nowrap"
                style={{ borderColor: elementColor, color: elementColor, backgroundColor: `${elementColor}18` }}
              >
                {body.glyph} {body.name}
              </span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-bold text-text-primary leading-tight mb-4">
            {content.title}
            <br />
            <span className="text-2xl sm:text-3xl text-text-secondary font-normal">{content.subtitle}</span>
          </h1>
          <div className="flex items-center justify-center gap-3 flex-wrap mt-4">
            <span
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border"
              style={{ borderColor: elementColor, color: elementColor, backgroundColor: `${elementColor}18` }}
            >
              {s.element.charAt(0).toUpperCase() + s.element.slice(1)} &middot; {s.modality.charAt(0).toUpperCase() + s.modality.slice(1)}
            </span>
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-border-primary text-text-secondary bg-bg-card">
              Ruled by {s.ruler}
            </span>
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-border-primary text-text-secondary bg-bg-card">
              {KIND_LABEL[body.kind]}
            </span>
          </div>
        </header>

        <section className="max-w-4xl mx-auto px-6 pb-12">
          <div className="bg-bg-card border border-border-primary rounded-2xl p-6 sm:p-8">
            <p className="text-text-secondary leading-relaxed text-[15px]">{content.intro}</p>
          </div>
        </section>

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

        <section className="max-w-4xl mx-auto px-6 pb-12">
          <h2 className="text-xl font-display font-semibold text-text-primary mb-6">Explore {s.name} Placements</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { href: `/zodiac/${sign}`, label: 'Sun Sign', text: s.name },
              { href: `/rising-sign/${sign}`, label: 'Rising Sign', text: `${s.name} Rising` },
              { href: `/moon-sign/${sign}`, label: 'Moon Sign', text: `Moon in ${s.name}` },
              { href: `/venus-in/${sign}`, label: 'Venus Sign', text: `Venus in ${s.name}` },
              { href: `/mars-in/${sign}`, label: 'Mars Sign', text: `Mars in ${s.name}` },
              { href: '/compatibility', label: 'Compatibility', text: `${s.name} Matches` },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="bg-bg-card border border-border-primary rounded-xl p-4 text-center hover:border-accent-primary/30 transition-colors group"
              >
                <p className="text-xs text-text-muted mb-1">{link.label}</p>
                <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">{link.text}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 pb-12">
          <h2 className="text-xl font-display font-semibold text-text-primary mb-6">{body.name} Through the Zodiac</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {ALL_SIGN_KEYS.filter((k) => k !== sign).map((k) => (
              <Link
                key={k}
                href={`/${slug}/${k}`}
                className="bg-bg-card border border-border-primary rounded-xl p-3 text-center hover:border-accent-primary/30 transition-colors group"
              >
                <span className="text-lg block mb-1">{SIGNS[k].glyph}</span>
                <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">
                  {body.name} in {SIGNS[k].name}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 pb-20">
          <div className="bg-gradient-cosmic rounded-3xl p-8 sm:p-12 border border-accent-muted text-center">
            <span className="text-5xl block mb-4">{s.glyph}</span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-4">Find {body.name} in Your Own Chart</h2>
            <p className="text-text-tertiary max-w-lg mx-auto mb-8">
              {body.name} is only one point. Align calculates your full chart with Swiss Ephemeris precision &mdash; every planet, angle and asteroid, read together.
            </p>
            <Link href="/onboarding" className="btn-primary text-base px-10 py-3.5 inline-block">Get Your Full Chart</Link>
            <p className="text-text-muted text-xs mt-4">Free to start. No credit card required.</p>
          </div>
        </section>

        <Footer slug={slug} name={body.name} />
      </div>
    );
  }

  return { generateStaticParams, generateMetadata, Page };
}

/* ── /{slug} index ──────────────────────────────────────────────── */

export function makeBodyIndexPage(slug: string) {
  async function generateMetadata(): Promise<Metadata> {
    const body = getBodyBySlug(slug);
    if (!body) return {};
    const title = `${body.name} in Astrology — ${body.headline}`;
    const description = `${body.name} in the birth chart governs ${body.domain}. Read ${body.name} through all twelve zodiac signs.`;
    const url = `${BASE}/${slug}`;
    return {
      title,
      description,
      keywords: [`${body.name.toLowerCase()} astrology`, `${body.name.toLowerCase()} in astrology`, `${body.name.toLowerCase()} natal chart`, `${body.name.toLowerCase()} meaning`],
      openGraph: { title: `${title} | Align`, description, url, siteName: 'Align', type: 'website' },
      twitter: { card: 'summary_large_image', title: `${title} | Align`, description },
      alternates: { canonical: url },
    };
  }

  function Page() {
    const body = getBodyBySlug(slug);
    if (!body) notFound();

    return (
      <div className="min-h-screen">
        <Nav slug={slug} name={body.name} />

        <header className="max-w-4xl mx-auto px-6 pt-10 pb-12 text-center">
          <span className="text-5xl block mb-4">{body.glyph}</span>
          <p className="text-xs uppercase tracking-widest text-text-muted mb-3">{KIND_LABEL[body.kind]}</p>
          <h1 className="text-3xl sm:text-5xl font-display font-bold text-text-primary leading-tight mb-4">
            {body.name} in Astrology
            <br />
            <span className="text-2xl sm:text-3xl text-text-secondary font-normal">{body.tagline}</span>
          </h1>
          <p className="text-text-tertiary max-w-2xl mx-auto">{body.headline}</p>
        </header>

        <section className="max-w-4xl mx-auto px-6 pb-12 space-y-6">
          <div className="bg-bg-card border border-border-primary rounded-2xl p-6 sm:p-8">
            <p className="text-text-secondary leading-relaxed text-[15px]">{getBodyEssence(body)}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-bg-card border border-border-primary rounded-2xl p-6">
              <h2 className="text-lg font-display font-semibold text-text-primary mb-3">The Gift</h2>
              <p className="text-text-secondary leading-relaxed text-[15px]">{body.gift}</p>
            </div>
            <div className="bg-bg-card border border-border-primary rounded-2xl p-6">
              <h2 className="text-lg font-display font-semibold text-text-primary mb-3">The Shadow</h2>
              <p className="text-text-secondary leading-relaxed text-[15px]">{body.shadow}</p>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 pb-16">
          <h2 className="text-xl font-display font-semibold text-text-primary mb-6">{body.name} Through the Twelve Signs</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {ALL_SIGN_KEYS.map((k) => (
              <Link
                key={k}
                href={`/${slug}/${k}`}
                className="bg-bg-card border border-border-primary rounded-xl p-4 text-center hover:border-accent-primary/30 transition-colors group"
              >
                <span className="text-2xl block mb-1">{SIGNS[k].glyph}</span>
                <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">
                  {body.name} in {SIGNS[k].name}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 pb-20">
          <div className="bg-gradient-cosmic rounded-3xl p-8 sm:p-12 border border-accent-muted text-center">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-4">Where Is {body.name} in Your Chart?</h2>
            <p className="text-text-tertiary max-w-lg mx-auto mb-8">
              Calculate your full birth chart free &mdash; every planet, angle and asteroid, with interpretations that actually say something.
            </p>
            <Link href="/onboarding" className="btn-primary text-base px-10 py-3.5 inline-block">Get Your Full Chart</Link>
          </div>
        </section>

        <Footer slug={slug} name={body.name} />
      </div>
    );
  }

  return { generateMetadata, Page };
}
