import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ALL_SIGN_KEYS, SIGNS, getElementColor, getJupiterSignContent, JUPITER_SYMBOL, type ZodiacSign } from '@/data/jupiterSignContent';

export function generateStaticParams() {
  return ALL_SIGN_KEYS.map((sign) => ({ sign }));
}

type PageProps = { params: Promise<{ sign: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sign } = await params;
  if (!ALL_SIGN_KEYS.includes(sign as ZodiacSign)) return {};
  const s = SIGNS[sign as ZodiacSign];
  const title = `Jupiter in ${s.name} — Growth, Luck & Expansion`;
  const description = `Discover what Jupiter in ${s.name} means for your growth, abundance, philosophy, and spiritual expansion. In-depth astrological profile.`;
  return {
    title, description,
    keywords: [`jupiter in ${s.name.toLowerCase()}`, `${s.name.toLowerCase()} jupiter`, 'jupiter sign', `${s.element} jupiter`, 'growth astrology', 'luck astrology'],
    openGraph: { title: `${title} | Align`, description, url: `https://aligncosmic.com/jupiter-in/${sign}`, siteName: 'Align', type: 'article' },
    twitter: { card: 'summary_large_image', title: `${title} | Align`, description },
    alternates: { canonical: `https://aligncosmic.com/jupiter-in/${sign}` },
  };
}

export default async function JupiterSignPage({ params }: PageProps) {
  const { sign } = await params;
  if (!ALL_SIGN_KEYS.includes(sign as ZodiacSign)) notFound();
  const content = getJupiterSignContent(sign as ZodiacSign);
  const s = SIGNS[sign as ZodiacSign];
  const elementColor = getElementColor(s.element);

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Article', headline: content.headline,
    description: content.intro.slice(0, 160),
    publisher: { '@type': 'Organization', name: 'Align', url: 'https://aligncosmic.com' },
    mainEntityOfPage: `https://aligncosmic.com/jupiter-in/${sign}`,
  };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-display font-bold text-text-primary flex items-center gap-2">
          <Image src="/logo.png" alt="Align logo" width={32} height={32} className="w-8 h-8 rounded-lg" />Align
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/jupiter-in" className="text-sm text-text-secondary hover:text-text-primary transition-colors">All Jupiter Signs</Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">Get Started Free</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-2 pb-4">
        <nav className="text-sm text-text-muted" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-text-secondary transition-colors">Home</Link></li>
            <li className="text-text-muted">/</li>
            <li><Link href="/jupiter-in" className="hover:text-text-secondary transition-colors">Jupiter Signs</Link></li>
            <li className="text-text-muted">/</li>
            <li className="text-text-tertiary">Jupiter in {s.name}</li>
          </ol>
        </nav>
      </div>

      <header className="max-w-4xl mx-auto px-6 pt-8 pb-16 text-center">
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center border-2" style={{ borderColor: elementColor, background: `radial-gradient(circle, ${elementColor}15 0%, transparent 70%)` }}>
              <span className="text-6xl sm:text-7xl">{s.glyph}</span>
            </div>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium px-3 py-1 rounded-full border" style={{ borderColor: elementColor, color: elementColor, backgroundColor: `${elementColor}18` }}>
              {JUPITER_SYMBOL} Jupiter
            </span>
          </div>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-text-primary leading-tight mb-4">
          Jupiter in {s.name}<br /><span className="text-2xl sm:text-3xl text-text-secondary font-normal">Your Growth & Expansion</span>
        </h1>
        <div className="flex items-center justify-center gap-4 flex-wrap mt-4">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border" style={{ borderColor: elementColor, color: elementColor, backgroundColor: `${elementColor}18` }}>
            {s.element.charAt(0).toUpperCase() + s.element.slice(1)} Jupiter
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
            { href: `/zodiac/${sign}`, label: 'Sun Sign', text: s.name },
            { href: `/rising-sign/${sign}`, label: 'Rising Sign', text: `${s.name} Rising` },
            { href: `/moon-sign/${sign}`, label: 'Moon Sign', text: `Moon in ${s.name}` },
            { href: `/venus-in/${sign}`, label: 'Venus Sign', text: `Venus in ${s.name}` },
            { href: `/mars-in/${sign}`, label: 'Mars Sign', text: `Mars in ${s.name}` },
            { href: `/compatibility`, label: 'Compatibility', text: `${s.name} Matches` },
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
          <p className="text-text-tertiary max-w-lg mx-auto mb-8">Jupiter reveals your growth and expansion. Discover your complete cosmic blueprint with Align.</p>
          <Link href="/onboarding" className="btn-primary text-base px-10 py-3.5 inline-block">Get Your Full Chart</Link>
          <p className="text-text-muted text-xs mt-4">Free to start. No credit card required.</p>
        </div>
      </section>

      <footer className="border-t border-border-primary py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-text-muted">&copy; {new Date().getFullYear()} Align. All rights reserved.</span>
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href="/jupiter-in" className="hover:text-text-secondary">All Jupiter Signs</Link>
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
