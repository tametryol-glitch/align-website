import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  ALL_SIGN_KEYS,
  SIGNS,
  getElementColor,
  MOON_SYMBOL,
  type ZodiacSign,
} from '@/data/moonSignContent';
import {
  SEO_LOCALES,
  isSeoLocale,
  fill,
  SIGN_NAMES,
  elementDe,
  MODALITY_NAMES,
  MOON_CHROME,
  HREFLANG,
  type SeoLocale,
} from '@/data/i18n/seoLocale';
import { getLocalizedMoonContent } from '@/data/i18n/moonSignContentLocalized';

const BASE = 'https://aligncosmic.com';

export function generateStaticParams() {
  return SEO_LOCALES.flatMap((locale) =>
    ALL_SIGN_KEYS.map((sign) => ({ locale, sign })),
  );
}

type PageProps = { params: Promise<{ locale: string; sign: string }> };

/** hreflang alternates: every language variant + English default. */
function languageAlternates(sign: string): Record<string, string> {
  const langs: Record<string, string> = { 'x-default': `${BASE}/moon-sign/${sign}`, en: `${BASE}/moon-sign/${sign}` };
  for (const l of SEO_LOCALES) langs[HREFLANG[l]] = `${BASE}/${l}/moon-sign/${sign}`;
  return langs;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, sign } = await params;
  if (!isSeoLocale(locale) || !ALL_SIGN_KEYS.includes(sign as ZodiacSign)) return {};

  const c = MOON_CHROME[locale];
  const name = SIGN_NAMES[locale][sign as ZodiacSign];
  const glyph = SIGNS[sign as ZodiacSign].glyph;
  const title = fill(c.metaTitle, { name });
  const description = fill(c.metaDescription, { name, glyph });

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Align`,
      description,
      url: `${BASE}/${locale}/moon-sign/${sign}`,
      siteName: 'Align',
      type: 'article',
      locale,
    },
    twitter: { card: 'summary_large_image', title: `${title} | Align`, description },
    alternates: {
      canonical: `${BASE}/${locale}/moon-sign/${sign}`,
      languages: languageAlternates(sign),
    },
  };
}

export default async function LocalizedMoonSignPage({ params }: PageProps) {
  const { locale, sign } = await params;
  if (!isSeoLocale(locale) || !ALL_SIGN_KEYS.includes(sign as ZodiacSign)) notFound();

  const loc = locale as SeoLocale;
  const signKey = sign as ZodiacSign;
  const content = getLocalizedMoonContent(loc, signKey);
  if (!content) notFound();

  const c = MOON_CHROME[loc];
  const s = SIGNS[signKey];
  const name = SIGN_NAMES[loc][signKey];
  const elementColor = getElementColor(s.element);
  const modalityName = MODALITY_NAMES[loc][s.modality];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    inLanguage: HREFLANG[loc],
    headline: content.headline,
    description: content.intro.slice(0, 160),
    publisher: { '@type': 'Organization', name: 'Align', url: BASE },
    mainEntityOfPage: `${BASE}/${loc}/moon-sign/${signKey}`,
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
          <Link href={`/${loc}/moon-sign`} className="text-sm text-text-secondary hover:text-text-primary transition-colors">{c.allMoonSigns}</Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">{c.getStartedFree}</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-2 pb-4">
        <nav className="text-sm text-text-muted" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-text-secondary transition-colors">{c.home}</Link></li>
            <li className="text-text-muted">/</li>
            <li><Link href={`/${loc}/moon-sign`} className="hover:text-text-secondary transition-colors">{c.moonSigns}</Link></li>
            <li className="text-text-muted">/</li>
            <li className="text-text-tertiary">{fill(c.moonInName, { name })}</li>
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
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium px-3 py-1 rounded-full border"
              style={{ borderColor: elementColor, color: elementColor, backgroundColor: `${elementColor}18` }}
            >
              {MOON_SYMBOL} {c.moonLabel}
            </span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-display font-bold text-text-primary leading-tight mb-4">
          {fill(c.moonInName, { name })}
          <br />
          <span className="text-2xl sm:text-3xl text-text-secondary font-normal">{c.detailSubhead}</span>
        </h1>

        <div className="flex items-center justify-center gap-4 flex-wrap mt-4">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border" style={{ borderColor: elementColor, color: elementColor, backgroundColor: `${elementColor}18` }}>
            {fill(c.elementMoon, { element: elementDe(loc, s.element) })}
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-border-primary text-text-secondary bg-bg-card">
            {fill(c.modalityQuality, { modality: modalityName })}
          </span>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="bg-bg-card border border-border-primary rounded-2xl p-6 sm:p-8">
          <p className="text-text-secondary leading-relaxed text-[15px]">{content.intro}</p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-6 pb-16 space-y-12">
        {content.sections.map((section, si) => (
          <article key={si} className="scroll-mt-24">
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
        <h2 className="text-xl font-display font-semibold text-text-primary mb-6">{fill(c.explorePlacements, { name })}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href={`/zodiac/${signKey}`} className="bg-bg-card border border-border-primary rounded-xl p-4 text-center hover:border-accent-primary/30 transition-colors group">
            <p className="text-xs text-text-muted mb-1">{c.sunSign}</p>
            <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">{name}</p>
          </Link>
          <Link href={`/rising-sign/${signKey}`} className="bg-bg-card border border-border-primary rounded-xl p-4 text-center hover:border-accent-primary/30 transition-colors group">
            <p className="text-xs text-text-muted mb-1">{c.risingSign}</p>
            <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">{fill(c.nameRising, { name })}</p>
          </Link>
          <Link href={`/venus-in/${signKey}`} className="bg-bg-card border border-border-primary rounded-xl p-4 text-center hover:border-accent-primary/30 transition-colors group">
            <p className="text-xs text-text-muted mb-1">{c.venusSign}</p>
            <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">{fill(c.venusInName, { name })}</p>
          </Link>
          <Link href={`/mars-in/${signKey}`} className="bg-bg-card border border-border-primary rounded-xl p-4 text-center hover:border-accent-primary/30 transition-colors group">
            <p className="text-xs text-text-muted mb-1">{c.marsSign}</p>
            <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">{fill(c.marsInName, { name })}</p>
          </Link>
          <Link href={`/mercury-in/${signKey}`} className="bg-bg-card border border-border-primary rounded-xl p-4 text-center hover:border-accent-primary/30 transition-colors group">
            <p className="text-xs text-text-muted mb-1">{c.mercurySign}</p>
            <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">{fill(c.mercuryInName, { name })}</p>
          </Link>
          <Link href="/compatibility" className="bg-bg-card border border-border-primary rounded-xl p-4 text-center hover:border-accent-primary/30 transition-colors group">
            <p className="text-xs text-text-muted mb-1">{c.compatibility}</p>
            <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">{fill(c.nameMatches, { name })}</p>
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gradient-cosmic rounded-3xl p-8 sm:p-12 border border-accent-muted text-center">
          <span className="text-5xl block mb-4">{s.glyph}</span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-4">{c.getYourFullChart}</h2>
          <p className="text-text-tertiary max-w-lg mx-auto mb-8">{c.detailCtaCopy}</p>
          <Link href="/onboarding" className="btn-primary text-base px-10 py-3.5 inline-block">{c.getYourFullChart}</Link>
          <p className="text-text-muted text-xs mt-4">{c.freeToStart}</p>
        </div>
      </section>

      <footer className="border-t border-border-primary py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-text-muted">&copy; {new Date().getFullYear()} Align. {c.allRightsReserved}</span>
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href={`/${loc}/moon-sign`} className="hover:text-text-secondary">{c.allMoonSigns}</Link>
            <Link href="/zodiac" className="hover:text-text-secondary">{c.zodiacSigns}</Link>
            <Link href="/compatibility" className="hover:text-text-secondary">{c.compatibility}</Link>
            <Link href="/settings/terms" className="hover:text-text-secondary">{c.terms}</Link>
            <Link href="/settings/privacy" className="hover:text-text-secondary">{c.privacy}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
