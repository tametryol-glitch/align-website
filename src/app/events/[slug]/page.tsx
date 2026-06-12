import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getAllSeasonalSlugs, getSeasonalPage, seasonalPages } from '@/data/seasonalContent';
import { FaqSchema } from '@/components/seo/FaqSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';

export function generateStaticParams() {
  return getAllSeasonalSlugs().map((slug) => ({ slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeasonalPage(slug);
  if (!page) return {};

  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    openGraph: {
      title: `${page.title} | Align`,
      description: page.description,
      url: `https://aligncosmic.com/events/${slug}`,
      siteName: 'Align',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${page.title} | Align`,
      description: page.description,
    },
    alternates: {
      canonical: `https://aligncosmic.com/events/${slug}`,
    },
  };
}

export default async function SeasonalEventPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getSeasonalPage(slug);
  if (!page) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.title,
    description: page.description,
    publisher: {
      '@type': 'Organization',
      name: 'Align',
      url: 'https://aligncosmic.com',
      logo: { '@type': 'ImageObject', url: 'https://aligncosmic.com/logo.png' },
    },
    mainEntityOfPage: `https://aligncosmic.com/events/${slug}`,
    keywords: page.keywords.join(', '),
  };

  const breadcrumbs = [
    { name: 'Home', url: 'https://aligncosmic.com' },
    { name: 'Events', url: 'https://aligncosmic.com/events' },
    { name: page.title, url: `https://aligncosmic.com/events/${slug}` },
  ];

  const otherEvents = seasonalPages.filter((p) => p.slug !== slug);

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <FaqSchema faqs={page.faqs} />
      <BreadcrumbSchema items={breadcrumbs} />

      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-display font-bold text-text-primary flex items-center gap-2">
          <Image src="/logo.png" alt="Align logo" width={32} height={32} className="w-8 h-8 rounded-lg" />
          Align
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/events" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            All Events
          </Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">Get Started Free</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-2 pb-4">
        <nav className="text-sm text-text-muted" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-text-secondary transition-colors">Home</Link></li>
            <li className="text-text-muted">/</li>
            <li><Link href="/events" className="hover:text-text-secondary transition-colors">Events</Link></li>
            <li className="text-text-muted">/</li>
            <li className="text-text-tertiary truncate max-w-[200px]">{page.title}</li>
          </ol>
        </nav>
      </div>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-12 text-center">
        <span className="text-6xl block mb-6">{page.heroEmoji}</span>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-text-primary leading-tight mb-4">
          {page.title}
        </h1>
        <p className="text-text-tertiary text-lg leading-relaxed max-w-2xl mx-auto">
          {page.intro}
        </p>
      </header>

      <main className="max-w-3xl mx-auto px-6 pb-16 space-y-12">
        {page.sections.map((section) => (
          <article key={section.heading} className="scroll-mt-24" id={section.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary mb-5">
              {section.heading}
            </h2>
            <div className="space-y-4">
              {section.content.map((p, i) => (
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

        {/* FAQ Section */}
        <section className="pt-4">
          <h2 className="text-2xl font-display font-semibold text-text-primary mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {page.faqs.map((faq, i) => (
              <div key={i} className="bg-bg-card border border-border-primary rounded-xl p-6">
                <h3 className="text-base font-semibold text-text-primary mb-2">{faq.question}</h3>
                <p className="text-text-secondary text-[15px] leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="bg-gradient-cosmic rounded-3xl p-8 sm:p-12 border border-accent-muted text-center">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-4">
              See How This Transit Hits Your Chart
            </h2>
            <p className="text-text-tertiary max-w-lg mx-auto mb-8">
              Generic transit forecasts only go so far. Align shows you exactly which houses and planets
              in your natal chart are activated by current transits — personalized, precise, real-time.
            </p>
            <Link href="/onboarding" className="btn-primary text-base px-10 py-3.5 inline-block">
              Get Your Personalized Transit Report
            </Link>
            <p className="text-text-muted text-xs mt-4">Free to start. No credit card required.</p>
          </div>
        </section>

        {/* Other Events */}
        <section>
          <h2 className="text-xl font-display font-semibold text-text-primary mb-6">
            More Cosmic Events
          </h2>
          <div className="grid gap-4">
            {otherEvents.map((event) => (
              <Link
                key={event.slug}
                href={`/events/${event.slug}`}
                className="bg-bg-card border border-border-primary rounded-xl p-5 hover:border-accent-primary/30 transition-colors group flex items-center gap-4"
              >
                <span className="text-2xl">{event.heroEmoji}</span>
                <div>
                  <h3 className="text-base font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-xs text-text-muted mt-1">{event.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border-primary py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-text-muted">&copy; {new Date().getFullYear()} Align. All rights reserved.</span>
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href="/blog" className="hover:text-text-secondary">Blog</Link>
            <Link href="/events" className="hover:text-text-secondary">Events</Link>
            <Link href="/zodiac" className="hover:text-text-secondary">Zodiac</Link>
            <Link href="/settings/terms" className="hover:text-text-secondary">Terms</Link>
            <Link href="/settings/privacy" className="hover:text-text-secondary">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
