import type { Metadata } from 'next';
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
  { name: 'Sun', symbol: '\u2609', desc: 'Identity & ego' },
  { name: 'Moon', symbol: '\u263D', desc: 'Emotions & instincts' },
  { name: 'Mercury', symbol: '\u263F', desc: 'Communication & thought' },
  { name: 'Venus', symbol: '\u2640', desc: 'Love & beauty' },
  { name: 'Mars', symbol: '\u2642', desc: 'Drive & ambition' },
  { name: 'Jupiter', symbol: '\u2643', desc: 'Growth & expansion' },
  { name: 'Saturn', symbol: '\u2644', desc: 'Discipline & structure' },
  { name: 'Uranus', symbol: '\u2645', desc: 'Innovation & rebellion' },
  { name: 'Neptune', symbol: '\u2646', desc: 'Dreams & spirituality' },
  { name: 'Pluto', symbol: '\u2647', desc: 'Transformation & power' },
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
                  <Link key={pl.slug} href={`/planets-in-houses/${pl.slug}`} className="bg-bg-card border border-border-primary rounded-xl p-4 hover:border-accent-primary/30 transition-colors group text-center">
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
