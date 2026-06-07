import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getPublishedPosts } from '@/lib/blogService';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Astrology Blog — Learn Astrology, Tarot, Numerology & More',
  description: 'Free astrology guides, tarot insights, numerology deep-dives, and cosmic wisdom. Learn from beginner basics to advanced techniques.',
  keywords: ['astrology blog', 'learn astrology', 'astrology guides', 'tarot blog', 'numerology blog', 'zodiac articles'],
  openGraph: {
    title: 'Astrology Blog | Align',
    description: 'Free astrology guides, tarot insights, numerology deep-dives, and cosmic wisdom.',
    url: 'https://aligncosmic.com/blog',
    siteName: 'Align',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Astrology Blog | Align',
    description: 'Free astrology guides, tarot insights, and cosmic wisdom.',
  },
  alternates: {
    canonical: 'https://aligncosmic.com/blog',
  },
};

export default async function BlogPage() {
  const blogPosts = await getPublishedPosts();
  const categories = Array.from(new Set(blogPosts.map((p) => p.category)));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Align Astrology Blog',
    description: 'Free astrology guides, tarot insights, numerology deep-dives, and cosmic wisdom.',
    url: 'https://aligncosmic.com/blog',
    publisher: {
      '@type': 'Organization',
      name: 'Align',
      url: 'https://aligncosmic.com',
    },
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link
          href="/"
          className="text-xl font-display font-bold text-text-primary flex items-center gap-2"
        >
          <Image src="/logo.png" alt="Align logo" width={32} height={32} className="w-8 h-8 rounded-lg" />
          Align
        </Link>
        <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">
          Get Started Free
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-2 pb-4">
        <nav className="text-sm text-text-muted" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-text-secondary transition-colors">Home</Link></li>
            <li className="text-text-muted">/</li>
            <li className="text-text-tertiary">Blog</li>
          </ol>
        </nav>
      </div>

      <header className="max-w-4xl mx-auto px-6 pt-8 pb-12 text-center">
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-text-primary mb-4">
          Astrology Blog
        </h1>
        <p className="text-text-tertiary max-w-2xl mx-auto text-base sm:text-lg">
          Free guides to astrology, tarot, numerology, and cosmic wisdom. From beginner basics to advanced techniques.
        </p>
      </header>

      <section className="max-w-4xl mx-auto px-6 pb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <span
              key={cat}
              className="px-4 py-2 rounded-full text-sm font-medium border border-border-primary text-text-secondary bg-bg-card"
            >
              {cat}
            </span>
          ))}
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid gap-6">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="bg-bg-card border border-border-primary rounded-2xl p-6 sm:p-8 hover:border-accent-primary/30 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-medium border border-accent-muted text-accent-primary bg-accent-muted/10">
                  {post.category}
                </span>
                <span className="text-xs text-text-muted">{post.read_time}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary group-hover:text-accent-primary transition-colors mb-2">
                {post.title}
              </h2>
              <p className="text-text-secondary text-[15px] leading-relaxed">
                {post.description}
              </p>
              <p className="text-sm text-accent-primary mt-4 font-medium">
                Read article →
              </p>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-border-primary py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Align. All rights reserved.
          </span>
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href="/zodiac" className="hover:text-text-secondary">Zodiac Signs</Link>
            <Link href="/compatibility" className="hover:text-text-secondary">Compatibility</Link>
            <Link href="/personality" className="hover:text-text-secondary">Personality</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
