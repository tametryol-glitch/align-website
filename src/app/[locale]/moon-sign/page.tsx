import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { SIGNS, getElementColor, type ZodiacSign } from '@/data/moonSignContent';
import {
  SEO_LOCALES,
  isSeoLocale,
  fill,
  SIGN_NAMES,
  elementDe,
  MOON_CHROME,
  HREFLANG,
  type SeoLocale,
} from '@/data/i18n/seoLocale';

const BASE = 'https://aligncosmic.com';

export function generateStaticParams() {
  return SEO_LOCALES.map((locale) => ({ locale }));
}

type PageProps = { params: Promise<{ locale: string }> };

function languageAlternates(): Record<string, string> {
  const langs: Record<string, string> = { 'x-default': `${BASE}/moon-sign`, en: `${BASE}/moon-sign` };
  for (const l of SEO_LOCALES) langs[HREFLANG[l]] = `${BASE}/${l}/moon-sign`;
  return langs;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isSeoLocale(locale)) return {};
  const c = MOON_CHROME[locale];
  return {
    title: c.metaIndexTitle,
    description: c.metaIndexDescription,
    openGraph: {
      title: `${c.metaIndexTitle} | Align`,
      description: c.metaIndexDescription,
      url: `${BASE}/${locale}/moon-sign`,
      siteName: 'Align',
      type: 'website',
      locale,
    },
    twitter: { card: 'summary_large_image', title: `${c.metaIndexTitle} | Align`, description: c.metaIndexDescription },
    alternates: { canonical: `${BASE}/${locale}/moon-sign`, languages: languageAlternates() },
  };
}

const ELEMENT_GROUPS: { element: 'fire' | 'earth' | 'air' | 'water'; signs: ZodiacSign[] }[] = [
  { element: 'fire', signs: ['aries', 'leo', 'sagittarius'] },
  { element: 'earth', signs: ['taurus', 'virgo', 'capricorn'] },
  { element: 'air', signs: ['gemini', 'libra', 'aquarius'] },
  { element: 'water', signs: ['cancer', 'scorpio', 'pisces'] },
];

const ALL_KEYS: ZodiacSign[] = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];

export default async function LocalizedMoonSignIndexPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isSeoLocale(locale)) notFound();
  const loc = locale as SeoLocale;
  const c = MOON_CHROME[loc];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    inLanguage: HREFLANG[loc],
    name: c.metaIndexTitle,
    description: c.metaIndexDescription,
    publisher: { '@type': 'Organization', name: 'Align', url: BASE },
    mainEntityOfPage: `${BASE}/${loc}/moon-sign`,
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
          <Link href="/zodiac" className="text-sm text-text-secondary hover:text-text-primary transition-colors">{c.zodiacSigns}</Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">{c.getStartedFree}</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pt-2 pb-4">
        <nav className="text-sm text-text-muted" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-text-secondary transition-colors">{c.home}</Link></li>
            <li className="text-text-muted">/</li>
            <li className="text-text-tertiary">{c.moonSigns}</li>
          </ol>
        </nav>
      </div>

      <header className="max-w-5xl mx-auto px-6 pt-8 pb-16 text-center">
        <div className="flex items-center justify-center gap-2 mb-6 text-3xl">
          {ALL_KEYS.map((sk) => (<span key={sk} className="opacity-60">{SIGNS[sk].glyph}</span>))}
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-text-primary leading-tight mb-4">{c.moonSigns}</h1>
        <p className="text-xl sm:text-2xl font-display text-text-secondary mb-2">{c.emotionalBlueprint}</p>
        <p className="text-text-tertiary max-w-2xl mx-auto text-base sm:text-lg">{c.indexIntro}</p>
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-20 space-y-16">
        {ELEMENT_GROUPS.map((group) => {
          const color = getElementColor(group.element);
          return (
            <section key={group.element}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary">{fill(c.elementMoonSigns, { element: elementDe(loc, group.element) })}</h2>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {group.signs.map((signKey) => {
                  const sd = SIGNS[signKey];
                  const name = SIGN_NAMES[loc][signKey];
                  return (
                    <Link key={signKey} href={`/${loc}/moon-sign/${signKey}`} className="bg-bg-card border border-border-primary rounded-2xl p-6 hover:border-accent-primary/30 transition-all group relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1 opacity-50 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: color }} />
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 border" style={{ borderColor: `${color}40`, background: `radial-gradient(circle, ${color}12 0%, transparent 70%)` }}>
                          <span className="text-3xl">{sd.glyph}</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-display font-semibold text-text-primary group-hover:text-accent-primary transition-colors">{fill(c.moonInName, { name })}</h3>
                          <p className="text-xs text-text-muted mb-2">{fill(c.elementMoon, { element: elementDe(loc, sd.element) })}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gradient-cosmic rounded-3xl p-8 sm:p-12 border border-accent-muted text-center">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-4">{c.discoverYourMoonSign}</h2>
          <p className="text-text-tertiary max-w-lg mx-auto mb-8">{c.indexCtaCopy}</p>
          <Link href="/onboarding" className="btn-primary text-base px-10 py-3.5 inline-block">{c.getFullBirthChart}</Link>
          <p className="text-text-muted text-xs mt-4">{c.freeToStart}</p>
        </div>
      </section>

      <footer className="border-t border-border-primary py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-text-muted">&copy; {new Date().getFullYear()} Align. {c.allRightsReserved}</span>
          <div className="flex gap-6 text-sm text-text-muted">
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
