import fs from 'fs';
import path from 'path';

const APP_DIR = path.join(process.cwd(), 'src', 'app');

// ─── Planet-in-sign configs ────────────────────────────────────────
const PLANETS = [
  // Pattern 1: headline field (no subtitle/keywords)
  { route: 'saturn-in', planet: 'Saturn', dataFile: 'saturnSignContent', func: 'getSaturnSignContent', symbol: 'SATURN_SYMBOL', headlineField: 'headline', seoTitle: 'Saturn Signs — Discipline, Structure & Life Lessons', subtitle: 'Your Discipline & Life Lessons', domain: 'Your Saturn sign reveals your greatest challenges, karmic lessons, and the areas where you must develop discipline.', domainShort: 'your discipline and karmic lessons', ctaText: 'Your Saturn sign shapes your discipline and life lessons. Align calculates your complete natal chart with AI-powered interpretations.' },
  // Pattern 2: title/subtitle/keywords fields
  { route: 'uranus-in', planet: 'Uranus', dataFile: 'uranusSignContent', func: 'getUranusSignContent', symbol: 'URANUS_SYMBOL', headlineField: 'title', seoTitle: 'Uranus Signs — Innovation, Rebellion & Awakening', subtitle: null, domain: 'Your Uranus sign reveals how you innovate, rebel, and experience sudden breakthroughs and awakening.', domainShort: 'your innovation and awakening', ctaText: 'Your Uranus sign shapes your rebellion and breakthroughs. Align calculates your complete natal chart with AI-powered interpretations.' },
  { route: 'neptune-in', planet: 'Neptune', dataFile: 'neptuneSignContent', func: 'getNeptuneSignContent', symbol: 'NEPTUNE_SYMBOL', headlineField: 'title', seoTitle: 'Neptune Signs — Dreams, Spirituality & Imagination', subtitle: null, domain: 'Your Neptune sign reveals how you dream, access intuition, and experience the divine and imaginative realms.', domainShort: 'your dreams and spirituality', ctaText: 'Your Neptune sign shapes your spirituality and imagination. Align calculates your complete natal chart with AI-powered interpretations.' },
  { route: 'pluto-in', planet: 'Pluto', dataFile: 'plutoSignContent', func: 'getPlutoSignContent', symbol: 'PLUTO_SYMBOL', headlineField: 'title', seoTitle: 'Pluto Signs — Transformation, Power & Rebirth', subtitle: null, domain: 'Your Pluto sign reveals your generational transformation style, deepest power, and how you experience rebirth.', domainShort: 'your transformation and power', ctaText: 'Your Pluto sign shapes your transformation and rebirth. Align calculates your complete natal chart with AI-powered interpretations.' },
  { route: 'juno-in', planet: 'Juno', dataFile: 'junoSignContent', func: 'getJunoSignContent', symbol: 'JUNO_SYMBOL', headlineField: 'title', seoTitle: 'Juno Signs — Commitment, Partnership & Marriage', subtitle: null, domain: 'Your Juno sign reveals what you need in a committed partnership and your ideal marriage dynamics.', domainShort: 'your commitment and partnership needs', ctaText: 'Your Juno sign shapes your partnership ideals. Align calculates your complete natal chart with AI-powered interpretations.' },
  { route: 'vesta-in', planet: 'Vesta', dataFile: 'vestaSignContent', func: 'getVestaSignContent', symbol: 'VESTA_SYMBOL', headlineField: 'title', seoTitle: 'Vesta Signs — Devotion, Sacred Work & Focus', subtitle: null, domain: 'Your Vesta sign reveals your sacred devotion, how you focus your energy, and what you consider holy work.', domainShort: 'your devotion and sacred focus', ctaText: 'Your Vesta sign shapes your devotion and focus. Align calculates your complete natal chart with AI-powered interpretations.' },
  { route: 'chiron-in', planet: 'Chiron', dataFile: 'chironSignContent', func: 'getChironSignContent', symbol: 'CHIRON_SYMBOL', headlineField: 'title', seoTitle: 'Chiron Signs — Healing, Wounds & Wisdom', subtitle: null, domain: 'Your Chiron sign reveals your deepest wound, your path to healing, and the wisdom you share from that journey.', domainShort: 'your healing and wisdom', ctaText: 'Your Chiron sign reveals your healing journey. Align calculates your complete natal chart with AI-powered interpretations.' },
  { route: 'north-node-in', planet: 'North Node', dataFile: 'northNodeSignContent', func: 'getNorthNodeSignContent', symbol: 'NORTH_NODE_SYMBOL', headlineField: 'title', seoTitle: 'North Node Signs — Destiny, Growth & Life Path', subtitle: null, domain: "Your North Node reveals your soul's purpose, destiny path, and the qualities you're meant to develop in this lifetime.", domainShort: 'your destiny and life path', ctaText: "Your North Node reveals your soul's purpose. Align calculates your complete natal chart with AI-powered interpretations." },
  { route: 'south-node-in', planet: 'South Node', dataFile: 'southNodeSignContent', func: 'getSouthNodeSignContent', symbol: 'SOUTH_NODE_SYMBOL', headlineField: 'title', seoTitle: 'South Node Signs — Past Lives, Comfort Zone & Release', subtitle: null, domain: 'Your South Node reveals your past-life gifts, natural comfort zone, and what you need to release for growth.', domainShort: 'your past-life gifts and release', ctaText: 'Your South Node reveals your past-life patterns. Align calculates your complete natal chart with AI-powered interpretations.' },
];

function camelCase(s) {
  return s.replace(/-./g, x => x[1].toUpperCase());
}

function pascalCase(s) {
  const c = camelCase(s);
  return c.charAt(0).toUpperCase() + c.slice(1);
}

function funcName(planet) {
  return planet.replace(/\s+/g, '');
}

// ─── Generate planet-in-sign index page ────────────────────────────
function genIndexPage(p) {
  const planetClean = funcName(p.planet);
  return `import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ALL_SIGN_KEYS, SIGNS, getElementColor, type ZodiacSign } from '@/data/${p.dataFile}';

export const metadata: Metadata = {
  title: '${p.seoTitle}',
  description: 'Explore all 12 ${p.planet} signs with in-depth guides on ${p.domainShort}.',
  keywords: ['${p.planet.toLowerCase()} sign', '${p.planet.toLowerCase()} signs', '${p.planet.toLowerCase()} in astrology', '${p.planet.toLowerCase()} sign meaning'],
  openGraph: { title: '${p.seoTitle} | Align', description: 'In-depth guides for every ${p.planet} sign.', url: 'https://aligncosmic.com/${p.route}', siteName: 'Align', type: 'website' },
  twitter: { card: 'summary_large_image', title: '${p.seoTitle} | Align', description: 'Explore all 12 ${p.planet} signs.' },
  alternates: { canonical: 'https://aligncosmic.com/${p.route}' },
};

const ELEMENT_GROUPS: { element: 'fire' | 'earth' | 'air' | 'water'; label: string; signs: ZodiacSign[] }[] = [
  { element: 'fire', label: 'Fire ${p.planet} Signs', signs: ['aries', 'leo', 'sagittarius'] },
  { element: 'earth', label: 'Earth ${p.planet} Signs', signs: ['taurus', 'virgo', 'capricorn'] },
  { element: 'air', label: 'Air ${p.planet} Signs', signs: ['gemini', 'libra', 'aquarius'] },
  { element: 'water', label: 'Water ${p.planet} Signs', signs: ['cancer', 'scorpio', 'pisces'] },
];

export default function ${planetClean}IndexPage() {
  const jsonLd = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: '${p.seoTitle}', description: 'Complete guide to all 12 ${p.planet} signs.', publisher: { '@type': 'Organization', name: 'Align', url: 'https://aligncosmic.com' }, mainEntityOfPage: 'https://aligncosmic.com/${p.route}' };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-display font-bold text-text-primary flex items-center gap-2"><Image src="/logo.png" alt="Align logo" width={32} height={32} className="w-8 h-8 rounded-lg" />Align</Link>
        <div className="flex items-center gap-3">
          <Link href="/zodiac" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Zodiac Signs</Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">Get Started Free</Link>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto px-6 pt-2 pb-4">
        <nav className="text-sm text-text-muted" aria-label="Breadcrumb"><ol className="flex items-center gap-1.5"><li><Link href="/" className="hover:text-text-secondary transition-colors">Home</Link></li><li className="text-text-muted">/</li><li className="text-text-tertiary">${p.planet} Signs</li></ol></nav>
      </div>
      <header className="max-w-5xl mx-auto px-6 pt-8 pb-16 text-center">
        <div className="flex items-center justify-center gap-2 mb-6 text-3xl">{ALL_SIGN_KEYS.map((sk) => (<span key={sk} className="opacity-60">{SIGNS[sk].glyph}</span>))}</div>
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-text-primary leading-tight mb-4">${p.planet} Signs</h1>
        <p className="text-xl sm:text-2xl font-display text-text-secondary mb-2">${p.subtitle || p.seoTitle.split(' — ')[1]}</p>
        <p className="text-text-tertiary max-w-2xl mx-auto text-base sm:text-lg">${p.domain}</p>
      </header>
      <main className="max-w-5xl mx-auto px-6 pb-20 space-y-16">
        {ELEMENT_GROUPS.map((group) => {
          const color = getElementColor(group.element);
          return (
            <section key={group.element}>
              <div className="flex items-center gap-3 mb-6"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} /><h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary">{group.label}</h2></div>
              <div className="grid sm:grid-cols-3 gap-4">
                {group.signs.map((signKey) => {
                  const sd = SIGNS[signKey];
                  return (
                    <Link key={signKey} href={\`/${p.route}/\${signKey}\`} className="bg-bg-card border border-border-primary rounded-2xl p-6 hover:border-accent-primary/30 transition-all group relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1 opacity-50 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: color }} />
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 border" style={{ borderColor: \`\${color}40\`, background: \`radial-gradient(circle, \${color}12 0%, transparent 70%)\` }}><span className="text-3xl">{sd.glyph}</span></div>
                        <div className="min-w-0"><h3 className="text-lg font-display font-semibold text-text-primary group-hover:text-accent-primary transition-colors">${p.planet} in {sd.name}</h3><p className="text-xs text-text-muted mb-2">{sd.element.charAt(0).toUpperCase() + sd.element.slice(1)} ${p.planet}</p></div>
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
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-4">Discover Your ${p.planet} Sign</h2>
          <p className="text-text-tertiary max-w-lg mx-auto mb-8">${p.ctaText}</p>
          <Link href="/onboarding" className="btn-primary text-base px-10 py-3.5 inline-block">Get Your Full Birth Chart</Link>
          <p className="text-text-muted text-xs mt-4">Free to start. No credit card required.</p>
        </div>
      </section>
      <footer className="border-t border-border-primary py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-text-muted">&copy; {new Date().getFullYear()} Align. All rights reserved.</span>
          <div className="flex gap-6 text-sm text-text-muted"><Link href="/zodiac" className="hover:text-text-secondary">Zodiac Signs</Link><Link href="/compatibility" className="hover:text-text-secondary">Compatibility</Link><Link href="/settings/terms" className="hover:text-text-secondary">Terms</Link><Link href="/settings/privacy" className="hover:text-text-secondary">Privacy</Link></div>
        </div>
      </footer>
    </div>
  );
}
`;
}

// ─── Generate planet-in-sign detail page ───────────────────────────
function genDetailPage(p) {
  const planetClean = funcName(p.planet);
  const headlineRef = p.headlineField === 'headline' ? 'content.headline' : 'content.title';
  const subtitleJsx = p.headlineField === 'title'
    ? '{content.subtitle}'
    : `Your ${p.subtitle ? p.subtitle.replace('Your ', '') : p.seoTitle.split(' — ')[1]}`;

  return `import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ALL_SIGN_KEYS, SIGNS, getElementColor, ${p.func}, ${p.symbol}, type ZodiacSign } from '@/data/${p.dataFile}';

export function generateStaticParams() {
  return ALL_SIGN_KEYS.map((sign) => ({ sign }));
}

type PageProps = { params: Promise<{ sign: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sign } = await params;
  if (!ALL_SIGN_KEYS.includes(sign as ZodiacSign)) return {};
  const s = SIGNS[sign as ZodiacSign];
  const title = \`${p.planet} in \${s.name} — ${p.seoTitle.split(' — ')[1]}\`;
  const description = \`Discover what ${p.planet} in \${s.name} (\${s.glyph}) means for ${p.domainShort}. In-depth astrological profile.\`;
  return {
    title, description,
    keywords: [\`${p.planet.toLowerCase()} in \${s.name.toLowerCase()}\`, \`\${s.name.toLowerCase()} ${p.planet.toLowerCase()}\`, '${p.planet.toLowerCase()} sign', \`\${s.element} ${p.planet.toLowerCase()}\`],
    openGraph: { title: \`\${title} | Align\`, description, url: \`https://aligncosmic.com/${p.route}/\${sign}\`, siteName: 'Align', type: 'article' },
    twitter: { card: 'summary_large_image', title: \`\${title} | Align\`, description },
    alternates: { canonical: \`https://aligncosmic.com/${p.route}/\${sign}\` },
  };
}

export default async function ${planetClean}SignPage({ params }: PageProps) {
  const { sign } = await params;
  if (!ALL_SIGN_KEYS.includes(sign as ZodiacSign)) notFound();
  const content = ${p.func}(sign as ZodiacSign);
  const s = SIGNS[sign as ZodiacSign];
  const elementColor = getElementColor(s.element);

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Article', headline: ${headlineRef},
    description: content.intro.slice(0, 160),
    publisher: { '@type': 'Organization', name: 'Align', url: 'https://aligncosmic.com' },
    mainEntityOfPage: \`https://aligncosmic.com/${p.route}/\${sign}\`,
  };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-display font-bold text-text-primary flex items-center gap-2">
          <Image src="/logo.png" alt="Align logo" width={32} height={32} className="w-8 h-8 rounded-lg" />Align
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/${p.route}" className="text-sm text-text-secondary hover:text-text-primary transition-colors">All ${p.planet} Signs</Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">Get Started Free</Link>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-6 pt-2 pb-4">
        <nav className="text-sm text-text-muted" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-text-secondary transition-colors">Home</Link></li>
            <li className="text-text-muted">/</li>
            <li><Link href="/${p.route}" className="hover:text-text-secondary transition-colors">${p.planet} Signs</Link></li>
            <li className="text-text-muted">/</li>
            <li className="text-text-tertiary">${p.planet} in {s.name}</li>
          </ol>
        </nav>
      </div>
      <header className="max-w-4xl mx-auto px-6 pt-8 pb-16 text-center">
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center border-2" style={{ borderColor: elementColor, background: \`radial-gradient(circle, \${elementColor}15 0%, transparent 70%)\` }}>
              <span className="text-6xl sm:text-7xl">{s.glyph}</span>
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium px-3 py-1 rounded-full border" style={{ borderColor: elementColor, color: elementColor, backgroundColor: \`\${elementColor}18\` }}>
              {${p.symbol}} ${p.planet}
            </span>
          </div>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-text-primary leading-tight mb-4">
          ${p.planet} in {s.name}<br /><span className="text-2xl sm:text-3xl text-text-secondary font-normal">${subtitleJsx}</span>
        </h1>
        <div className="flex items-center justify-center gap-4 flex-wrap mt-4">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border" style={{ borderColor: elementColor, color: elementColor, backgroundColor: \`\${elementColor}18\` }}>
            {s.element.charAt(0).toUpperCase() + s.element.slice(1)} ${p.planet}
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-border-primary text-text-secondary bg-bg-card">
            Ruled by {s.ruler}
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
              {section.paragraphs.map((p, i) => (<p key={i} className="text-text-secondary leading-relaxed text-[15px]">{p}</p>))}
            </div>
            <div className="mt-10 flex items-center gap-4"><div className="flex-1 h-px bg-border-primary" /><span className="text-text-muted text-xs">&#10022;</span><div className="flex-1 h-px bg-border-primary" /></div>
          </article>
        ))}
      </main>
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <h2 className="text-xl font-display font-semibold text-text-primary mb-6">Explore {s.name} Placements</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: \`/zodiac/\${sign}\`, label: 'Sun Sign', text: s.name },
            { href: \`/rising-sign/\${sign}\`, label: 'Rising Sign', text: \`\${s.name} Rising\` },
            { href: \`/moon-sign/\${sign}\`, label: 'Moon Sign', text: \`Moon in \${s.name}\` },
            { href: \`/venus-in/\${sign}\`, label: 'Venus Sign', text: \`Venus in \${s.name}\` },
            { href: \`/mars-in/\${sign}\`, label: 'Mars Sign', text: \`Mars in \${s.name}\` },
            { href: \`/compatibility\`, label: 'Compatibility', text: \`\${s.name} Matches\` },
          ].map((link) => (
            <Link key={link.href} href={link.href} className="bg-bg-card border border-border-primary rounded-xl p-4 text-center hover:border-accent-primary/30 transition-colors group">
              <p className="text-xs text-text-muted mb-1">{link.label}</p>
              <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">{link.text}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gradient-cosmic rounded-3xl p-8 sm:p-12 border border-accent-muted text-center">
          <span className="text-5xl block mb-4">{s.glyph}</span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-4">Get Your Full Chart</h2>
          <p className="text-text-tertiary max-w-lg mx-auto mb-8">${p.planet} reveals ${p.domainShort}. Discover your complete cosmic blueprint with Align.</p>
          <Link href="/onboarding" className="btn-primary text-base px-10 py-3.5 inline-block">Get Your Full Chart</Link>
          <p className="text-text-muted text-xs mt-4">Free to start. No credit card required.</p>
        </div>
      </section>
      <footer className="border-t border-border-primary py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-text-muted">&copy; {new Date().getFullYear()} Align. All rights reserved.</span>
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href="/${p.route}" className="hover:text-text-secondary">All ${p.planet} Signs</Link>
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
`;
}

// ─── Generate planets-in-houses index ──────────────────────────────
function genHousesIndex() {
  return `import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getPlacementsForPlanet } from '@/data/planetsInHousesContent';

export const metadata: Metadata = {
  title: 'Planets in Houses — Where Energy Manifests in Your Chart',
  description: 'Explore all 120 planet-in-house placements. Learn how each planet expresses itself through the 12 astrological houses.',
  keywords: ['planets in houses', 'planet house placement', 'natal chart houses', 'astrology houses', 'planets in 1st house'],
  openGraph: { title: 'Planets in Houses | Align', description: 'Complete guide to all 120 planet-in-house placements.', url: 'https://aligncosmic.com/planets-in-houses', siteName: 'Align', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Planets in Houses | Align', description: 'Complete guide to 120 planet-house placements.' },
  alternates: { canonical: 'https://aligncosmic.com/planets-in-houses' },
};

const PLANETS_LIST = [
  { name: 'Sun', symbol: '\\u2609', desc: 'Identity & ego' },
  { name: 'Moon', symbol: '\\u263D', desc: 'Emotions & instincts' },
  { name: 'Mercury', symbol: '\\u263F', desc: 'Communication & thought' },
  { name: 'Venus', symbol: '\\u2640', desc: 'Love & beauty' },
  { name: 'Mars', symbol: '\\u2642', desc: 'Drive & ambition' },
  { name: 'Jupiter', symbol: '\\u2643', desc: 'Growth & expansion' },
  { name: 'Saturn', symbol: '\\u2644', desc: 'Discipline & structure' },
  { name: 'Uranus', symbol: '\\u2645', desc: 'Innovation & rebellion' },
  { name: 'Neptune', symbol: '\\u2646', desc: 'Dreams & spirituality' },
  { name: 'Pluto', symbol: '\\u2647', desc: 'Transformation & power' },
];

function ordinal(n: number) {
  const s: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };
  return n + (s[n] || 'th');
}

export default function PlanetsInHousesIndex() {
  const jsonLd = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Planets in Houses', description: 'Complete guide to all 120 planet-in-house placements.', publisher: { '@type': 'Organization', name: 'Align', url: 'https://aligncosmic.com' }, mainEntityOfPage: 'https://aligncosmic.com/planets-in-houses' };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-display font-bold text-text-primary flex items-center gap-2"><Image src="/logo.png" alt="Align logo" width={32} height={32} className="w-8 h-8 rounded-lg" />Align</Link>
        <div className="flex items-center gap-3">
          <Link href="/zodiac" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Zodiac Signs</Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">Get Started Free</Link>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto px-6 pt-2 pb-4">
        <nav className="text-sm text-text-muted" aria-label="Breadcrumb"><ol className="flex items-center gap-1.5"><li><Link href="/" className="hover:text-text-secondary transition-colors">Home</Link></li><li className="text-text-muted">/</li><li className="text-text-tertiary">Planets in Houses</li></ol></nav>
      </div>
      <header className="max-w-5xl mx-auto px-6 pt-8 pb-16 text-center">
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-text-primary leading-tight mb-4">Planets in Houses</h1>
        <p className="text-xl sm:text-2xl font-display text-text-secondary mb-2">Where Energy Manifests in Your Chart</p>
        <p className="text-text-tertiary max-w-2xl mx-auto text-base sm:text-lg">The house a planet occupies shows the life area where that planet&apos;s energy is most active. Explore all 120 placements.</p>
      </header>
      <main className="max-w-5xl mx-auto px-6 pb-20 space-y-16">
        {PLANETS_LIST.map((planet) => {
          const placements = getPlacementsForPlanet(planet.name);
          return (
            <section key={planet.name}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{planet.symbol}</span>
                <div><h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary">{planet.name} in the Houses</h2><p className="text-sm text-text-muted">{planet.desc}</p></div>
              </div>
              <div className="grid sm:grid-cols-3 md:grid-cols-4 gap-3">
                {placements.map((pl) => (
                  <Link key={pl.slug} href={\`/planets-in-houses/\${pl.slug}\`} className="bg-bg-card border border-border-primary rounded-xl p-4 hover:border-accent-primary/30 transition-colors group text-center">
                    <p className="text-2xl mb-1">{planet.symbol}</p>
                    <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">{ordinal(pl.house)} House</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </main>
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gradient-cosmic rounded-3xl p-8 sm:p-12 border border-accent-muted text-center">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-4">See Your Planet Placements</h2>
          <p className="text-text-tertiary max-w-lg mx-auto mb-8">Discover which houses your planets occupy and what it means for your life path.</p>
          <Link href="/onboarding" className="btn-primary text-base px-10 py-3.5 inline-block">Get Your Full Birth Chart</Link>
          <p className="text-text-muted text-xs mt-4">Free to start. No credit card required.</p>
        </div>
      </section>
      <footer className="border-t border-border-primary py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-text-muted">&copy; {new Date().getFullYear()} Align. All rights reserved.</span>
          <div className="flex gap-6 text-sm text-text-muted"><Link href="/zodiac" className="hover:text-text-secondary">Zodiac Signs</Link><Link href="/compatibility" className="hover:text-text-secondary">Compatibility</Link><Link href="/settings/terms" className="hover:text-text-secondary">Terms</Link><Link href="/settings/privacy" className="hover:text-text-secondary">Privacy</Link></div>
        </div>
      </footer>
    </div>
  );
}
`;
}

// ─── Generate planets-in-houses detail ─────────────────────────────
function genHousesDetail() {
  return `import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPlacement, getAllSlugs } from '@/data/planetsInHousesContent';

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const p = getPlacement(slug);
  if (!p) return {};
  const title = p.title;
  const description = p.intro.slice(0, 160);
  return {
    title, description,
    keywords: p.keywords,
    openGraph: { title: \`\${title} | Align\`, description, url: \`https://aligncosmic.com/planets-in-houses/\${slug}\`, siteName: 'Align', type: 'article' },
    twitter: { card: 'summary_large_image', title: \`\${title} | Align\`, description },
    alternates: { canonical: \`https://aligncosmic.com/planets-in-houses/\${slug}\` },
  };
}

export default async function PlacementPage({ params }: PageProps) {
  const { slug } = await params;
  const placement = getPlacement(slug);
  if (!placement) notFound();

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Article', headline: placement.title,
    description: placement.intro.slice(0, 160),
    publisher: { '@type': 'Organization', name: 'Align', url: 'https://aligncosmic.com' },
    mainEntityOfPage: \`https://aligncosmic.com/planets-in-houses/\${slug}\`,
  };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-display font-bold text-text-primary flex items-center gap-2">
          <Image src="/logo.png" alt="Align logo" width={32} height={32} className="w-8 h-8 rounded-lg" />Align
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/planets-in-houses" className="text-sm text-text-secondary hover:text-text-primary transition-colors">All Placements</Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">Get Started Free</Link>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-6 pt-2 pb-4">
        <nav className="text-sm text-text-muted" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-text-secondary transition-colors">Home</Link></li>
            <li className="text-text-muted">/</li>
            <li><Link href="/planets-in-houses" className="hover:text-text-secondary transition-colors">Planets in Houses</Link></li>
            <li className="text-text-muted">/</li>
            <li className="text-text-tertiary">{placement.title}</li>
          </ol>
        </nav>
      </div>
      <header className="max-w-4xl mx-auto px-6 pt-8 pb-16 text-center">
        <div className="flex items-center justify-center mb-8">
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center border-2 border-accent-primary/30" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }}>
            <span className="text-6xl sm:text-7xl">{placement.symbol}</span>
          </div>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-text-primary leading-tight mb-4">{placement.title}</h1>
      </header>
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="bg-bg-card border border-border-primary rounded-2xl p-6 sm:p-8">
          <p className="text-text-secondary leading-relaxed text-[15px]">{placement.intro}</p>
        </div>
      </section>
      <main className="max-w-4xl mx-auto px-6 pb-16 space-y-12">
        {placement.sections.map((section) => (
          <article key={section.heading} className="scroll-mt-24" id={section.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary mb-5">{section.heading}</h2>
            <p className="text-text-secondary leading-relaxed text-[15px]">{section.body}</p>
            <div className="mt-10 flex items-center gap-4"><div className="flex-1 h-px bg-border-primary" /><span className="text-text-muted text-xs">&#10022;</span><div className="flex-1 h-px bg-border-primary" /></div>
          </article>
        ))}
      </main>
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gradient-cosmic rounded-3xl p-8 sm:p-12 border border-accent-muted text-center">
          <span className="text-5xl block mb-4">{placement.symbol}</span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-4">Get Your Full Chart</h2>
          <p className="text-text-tertiary max-w-lg mx-auto mb-8">Discover which houses your planets occupy and what it means for your life.</p>
          <Link href="/onboarding" className="btn-primary text-base px-10 py-3.5 inline-block">Get Your Full Chart</Link>
          <p className="text-text-muted text-xs mt-4">Free to start. No credit card required.</p>
        </div>
      </section>
      <footer className="border-t border-border-primary py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-text-muted">&copy; {new Date().getFullYear()} Align. All rights reserved.</span>
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href="/planets-in-houses" className="hover:text-text-secondary">All Placements</Link>
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
`;
}

// ─── Generate synastry index ───────────────────────────────────────
function genSynastryIndex() {
  return `import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ALL_SYNASTRY_ASPECTS } from '@/data/synastryContent';

export const metadata: Metadata = {
  title: 'Synastry Aspects — Relationship Astrology Guide',
  description: 'Explore 35 key synastry aspects between planets. Understand the cosmic chemistry in your relationships.',
  keywords: ['synastry aspects', 'relationship astrology', 'synastry chart', 'compatibility aspects', 'planet aspects synastry'],
  openGraph: { title: 'Synastry Aspects | Align', description: 'Complete guide to 35 synastry aspects.', url: 'https://aligncosmic.com/synastry-aspects', siteName: 'Align', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Synastry Aspects | Align', description: 'Complete guide to 35 synastry aspects.' },
  alternates: { canonical: 'https://aligncosmic.com/synastry-aspects' },
};

const PAIRS = [
  { p1: 'Sun', p2: 'Moon', label: 'Sun-Moon Aspects' },
  { p1: 'Sun', p2: 'Venus', label: 'Sun-Venus Aspects' },
  { p1: 'Sun', p2: 'Mars', label: 'Sun-Mars Aspects' },
  { p1: 'Moon', p2: 'Venus', label: 'Moon-Venus Aspects' },
  { p1: 'Moon', p2: 'Mars', label: 'Moon-Mars Aspects' },
  { p1: 'Venus', p2: 'Mars', label: 'Venus-Mars Aspects' },
  { p1: 'Venus', p2: 'Jupiter', label: 'Venus-Jupiter Aspects' },
];

const ASPECT_ORDER = ['conjunct', 'sextile', 'square', 'trine', 'opposition'];
const ASPECT_SYMBOLS: Record<string, string> = { conjunct: '\\u260C', sextile: '\\u26B9', square: '\\u25A1', trine: '\\u25B3', opposition: '\\u260D' };

export default function SynastryIndex() {
  const jsonLd = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Synastry Aspects', description: 'Complete guide to 35 synastry aspects in relationship astrology.', publisher: { '@type': 'Organization', name: 'Align', url: 'https://aligncosmic.com' }, mainEntityOfPage: 'https://aligncosmic.com/synastry-aspects' };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-display font-bold text-text-primary flex items-center gap-2"><Image src="/logo.png" alt="Align logo" width={32} height={32} className="w-8 h-8 rounded-lg" />Align</Link>
        <div className="flex items-center gap-3">
          <Link href="/compatibility" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Compatibility</Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">Get Started Free</Link>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto px-6 pt-2 pb-4">
        <nav className="text-sm text-text-muted" aria-label="Breadcrumb"><ol className="flex items-center gap-1.5"><li><Link href="/" className="hover:text-text-secondary transition-colors">Home</Link></li><li className="text-text-muted">/</li><li className="text-text-tertiary">Synastry Aspects</li></ol></nav>
      </div>
      <header className="max-w-5xl mx-auto px-6 pt-8 pb-16 text-center">
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-text-primary leading-tight mb-4">Synastry Aspects</h1>
        <p className="text-xl sm:text-2xl font-display text-text-secondary mb-2">The Cosmic Chemistry Between You</p>
        <p className="text-text-tertiary max-w-2xl mx-auto text-base sm:text-lg">Synastry compares two birth charts to reveal the energetic connections between partners. Explore the most important planet-to-planet aspects.</p>
      </header>
      <main className="max-w-5xl mx-auto px-6 pb-20 space-y-16">
        {PAIRS.map((pair) => (
          <section key={pair.label}>
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary mb-6">{pair.label}</h2>
            <div className="grid sm:grid-cols-5 gap-3">
              {ASPECT_ORDER.map((asp) => {
                const slug = \`\${pair.p1.toLowerCase()}-\${asp}-\${pair.p2.toLowerCase()}\`;
                return (
                  <Link key={slug} href={\`/synastry-aspects/\${slug}\`} className="bg-bg-card border border-border-primary rounded-xl p-4 text-center hover:border-accent-primary/30 transition-colors group">
                    <p className="text-2xl mb-1">{ASPECT_SYMBOLS[asp]}</p>
                    <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors capitalize">{asp}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </main>
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gradient-cosmic rounded-3xl p-8 sm:p-12 border border-accent-muted text-center">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-4">Check Your Synastry</h2>
          <p className="text-text-tertiary max-w-lg mx-auto mb-8">Compare your birth chart with a partner to see your synastry aspects and compatibility score.</p>
          <Link href="/onboarding" className="btn-primary text-base px-10 py-3.5 inline-block">Get Your Full Birth Chart</Link>
          <p className="text-text-muted text-xs mt-4">Free to start. No credit card required.</p>
        </div>
      </section>
      <footer className="border-t border-border-primary py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-text-muted">&copy; {new Date().getFullYear()} Align. All rights reserved.</span>
          <div className="flex gap-6 text-sm text-text-muted"><Link href="/zodiac" className="hover:text-text-secondary">Zodiac Signs</Link><Link href="/compatibility" className="hover:text-text-secondary">Compatibility</Link><Link href="/settings/terms" className="hover:text-text-secondary">Terms</Link><Link href="/settings/privacy" className="hover:text-text-secondary">Privacy</Link></div>
        </div>
      </footer>
    </div>
  );
}
`;
}

// ─── Generate synastry detail ──────────────────────────────────────
function genSynastryDetail() {
  return `import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getSynastryAspect, getAllSynastrySlug } from '@/data/synastryContent';

export function generateStaticParams() {
  return getAllSynastrySlug().map((slug) => ({ slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const a = getSynastryAspect(slug);
  if (!a) return {};
  const title = a.title;
  const description = a.intro.slice(0, 160);
  return {
    title, description,
    keywords: a.keywords,
    openGraph: { title: \`\${title} | Align\`, description, url: \`https://aligncosmic.com/synastry-aspects/\${slug}\`, siteName: 'Align', type: 'article' },
    twitter: { card: 'summary_large_image', title: \`\${title} | Align\`, description },
    alternates: { canonical: \`https://aligncosmic.com/synastry-aspects/\${slug}\` },
  };
}

export default async function SynastryAspectPage({ params }: PageProps) {
  const { slug } = await params;
  const aspect = getSynastryAspect(slug);
  if (!aspect) notFound();

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Article', headline: aspect.title,
    description: aspect.intro.slice(0, 160),
    publisher: { '@type': 'Organization', name: 'Align', url: 'https://aligncosmic.com' },
    mainEntityOfPage: \`https://aligncosmic.com/synastry-aspects/\${slug}\`,
  };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-display font-bold text-text-primary flex items-center gap-2">
          <Image src="/logo.png" alt="Align logo" width={32} height={32} className="w-8 h-8 rounded-lg" />Align
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/synastry-aspects" className="text-sm text-text-secondary hover:text-text-primary transition-colors">All Synastry Aspects</Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">Get Started Free</Link>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-6 pt-2 pb-4">
        <nav className="text-sm text-text-muted" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-text-secondary transition-colors">Home</Link></li>
            <li className="text-text-muted">/</li>
            <li><Link href="/synastry-aspects" className="hover:text-text-secondary transition-colors">Synastry Aspects</Link></li>
            <li className="text-text-muted">/</li>
            <li className="text-text-tertiary">{aspect.title}</li>
          </ol>
        </nav>
      </div>
      <header className="max-w-4xl mx-auto px-6 pt-8 pb-16 text-center">
        <div className="flex items-center justify-center mb-8">
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center border-2 border-accent-primary/30" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }}>
            <span className="text-6xl sm:text-7xl">{aspect.aspectSymbol}</span>
          </div>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-text-primary leading-tight mb-4">{aspect.title}</h1>
        <div className="flex items-center justify-center gap-4 flex-wrap mt-4">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-accent-primary/30 text-accent-primary bg-accent-primary/10">
            {aspect.planet1} {aspect.aspectSymbol} {aspect.planet2}
          </span>
        </div>
      </header>
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="bg-bg-card border border-border-primary rounded-2xl p-6 sm:p-8">
          <p className="text-text-secondary leading-relaxed text-[15px]">{aspect.intro}</p>
        </div>
      </section>
      <main className="max-w-4xl mx-auto px-6 pb-16 space-y-12">
        {aspect.sections.map((section) => (
          <article key={section.heading} className="scroll-mt-24" id={section.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary mb-5">{section.heading}</h2>
            <p className="text-text-secondary leading-relaxed text-[15px]">{section.body}</p>
            <div className="mt-10 flex items-center gap-4"><div className="flex-1 h-px bg-border-primary" /><span className="text-text-muted text-xs">&#10022;</span><div className="flex-1 h-px bg-border-primary" /></div>
          </article>
        ))}
      </main>
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gradient-cosmic rounded-3xl p-8 sm:p-12 border border-accent-muted text-center">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-4">Check Your Synastry</h2>
          <p className="text-text-tertiary max-w-lg mx-auto mb-8">Compare your chart with a partner and discover your unique synastry aspects.</p>
          <Link href="/onboarding" className="btn-primary text-base px-10 py-3.5 inline-block">Get Your Full Chart</Link>
          <p className="text-text-muted text-xs mt-4">Free to start. No credit card required.</p>
        </div>
      </section>
      <footer className="border-t border-border-primary py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-text-muted">&copy; {new Date().getFullYear()} Align. All rights reserved.</span>
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href="/synastry-aspects" className="hover:text-text-secondary">All Synastry Aspects</Link>
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
`;
}

// ─── MAIN: Write all files ─────────────────────────────────────────
let created = 0;

for (const p of PLANETS) {
  const dir = path.join(APP_DIR, p.route);
  const signDir = path.join(dir, '[sign]');
  fs.mkdirSync(dir, { recursive: true });
  fs.mkdirSync(signDir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'page.tsx'), genIndexPage(p), 'utf8');
  fs.writeFileSync(path.join(signDir, 'page.tsx'), genDetailPage(p), 'utf8');
  created += 2;
  console.log(`Created ${p.route}/page.tsx + [sign]/page.tsx`);
}

// planets-in-houses
const housesDir = path.join(APP_DIR, 'planets-in-houses');
const housesSlugDir = path.join(housesDir, '[slug]');
fs.mkdirSync(housesDir, { recursive: true });
fs.mkdirSync(housesSlugDir, { recursive: true });
fs.writeFileSync(path.join(housesDir, 'page.tsx'), genHousesIndex(), 'utf8');
fs.writeFileSync(path.join(housesSlugDir, 'page.tsx'), genHousesDetail(), 'utf8');
created += 2;
console.log('Created planets-in-houses/page.tsx + [slug]/page.tsx');

// synastry-aspects
const synDir = path.join(APP_DIR, 'synastry-aspects');
const synSlugDir = path.join(synDir, '[slug]');
fs.mkdirSync(synDir, { recursive: true });
fs.mkdirSync(synSlugDir, { recursive: true });
fs.writeFileSync(path.join(synDir, 'page.tsx'), genSynastryIndex(), 'utf8');
fs.writeFileSync(path.join(synSlugDir, 'page.tsx'), genSynastryDetail(), 'utf8');
created += 2;
console.log('Created synastry-aspects/page.tsx + [slug]/page.tsx');

console.log(`\nDone! Created ${created} files total.`);
