import type { Metadata } from 'next';
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
    openGraph: { title: `${title} | Align`, description, url: `https://aligncosmic.com/planets-in-houses/${slug}`, siteName: 'Align', type: 'article' },
    twitter: { card: 'summary_large_image', title: `${title} | Align`, description },
    alternates: { canonical: `https://aligncosmic.com/planets-in-houses/${slug}` },
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
    mainEntityOfPage: `https://aligncosmic.com/planets-in-houses/${slug}`,
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
