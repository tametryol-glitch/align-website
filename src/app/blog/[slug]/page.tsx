import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPublishedPost, getPublishedPosts, getAllPublishedSlugs } from '@/lib/blogService';
import { FaqSchema } from '@/components/seo/FaqSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: `${post.title} | Align`,
      description: post.description,
      url: `https://aligncosmic.com/blog/${slug}`,
      siteName: 'Align',
      type: 'article',
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at,
      authors: ['Align'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | Align`,
      description: post.description,
    },
    alternates: {
      canonical: `https://aligncosmic.com/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { '@type': 'Organization', name: 'Align', url: 'https://aligncosmic.com' },
    publisher: {
      '@type': 'Organization',
      name: 'Align',
      url: 'https://aligncosmic.com',
      logo: { '@type': 'ImageObject', url: 'https://aligncosmic.com/logo.png' },
    },
    mainEntityOfPage: `https://aligncosmic.com/blog/${slug}`,
    keywords: post.keywords.join(', '),
  };

  const breadcrumbs = [
    { name: 'Home', url: 'https://aligncosmic.com' },
    { name: 'Blog', url: 'https://aligncosmic.com/blog' },
    { name: post.title, url: `https://aligncosmic.com/blog/${slug}` },
  ];

  const allPosts = await getPublishedPosts();
  const relatedPosts = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FaqSchema faqs={post.faqs} />
      <BreadcrumbSchema items={breadcrumbs} />

      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link
          href="/"
          className="text-xl font-display font-bold text-text-primary flex items-center gap-2"
        >
          <Image src="/logo.png" alt="Align logo" width={32} height={32} className="w-8 h-8 rounded-lg" />
          Align
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/blog" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            All Articles
          </Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">
            Get Started Free
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-2 pb-4">
        <nav className="text-sm text-text-muted" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-text-secondary transition-colors">Home</Link></li>
            <li className="text-text-muted">/</li>
            <li><Link href="/blog" className="hover:text-text-secondary transition-colors">Blog</Link></li>
            <li className="text-text-muted">/</li>
            <li className="text-text-tertiary truncate max-w-[200px]">{post.title}</li>
          </ol>
        </nav>
      </div>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-medium border border-accent-muted text-accent-primary bg-accent-muted/10">
            {post.category}
          </span>
          <span className="text-xs text-text-muted">{post.read_time}</span>
          <span className="text-xs text-text-muted">Updated {post.updated_at?.slice(0, 10)}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-text-primary leading-tight mb-4">
          {post.title}
        </h1>
        <p className="text-text-tertiary text-lg leading-relaxed">
          {post.description}
        </p>
      </header>

      <main className="max-w-3xl mx-auto px-6 pb-16">
        <article className="space-y-6">
          {post.content.map((paragraph, i) => (
            <p key={i} className="text-text-secondary leading-relaxed text-[15px]">
              {paragraph}
            </p>
          ))}
        </article>

        {/* FAQ Section */}
        <section className="mt-16 pt-12 border-t border-border-primary">
          <h2 className="text-2xl font-display font-semibold text-text-primary mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {post.faqs.map((faq, i) => (
              <div key={i} className="bg-bg-card border border-border-primary rounded-xl p-6">
                <h3 className="text-base font-semibold text-text-primary mb-2">
                  {faq.question}
                </h3>
                <p className="text-text-secondary text-[15px] leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16">
          <div className="bg-gradient-cosmic rounded-3xl p-8 sm:p-12 border border-accent-muted text-center">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-4">
              Experience It In Your Chart
            </h2>
            <p className="text-text-tertiary max-w-lg mx-auto mb-8">
              Everything in this article comes alive when you see it in your own natal chart.
              Align gives you 26+ AI-powered readings based on your exact birth data.
            </p>
            <Link href="/onboarding" className="btn-primary text-base px-10 py-3.5 inline-block">
              Get Your Free Chart
            </Link>
            <p className="text-text-muted text-xs mt-4">
              Free to start. No credit card required.
            </p>
          </div>
        </section>

        {/* Related Posts */}
        <section className="mt-16">
          <h2 className="text-xl font-display font-semibold text-text-primary mb-6">
            Keep Reading
          </h2>
          <div className="grid gap-4">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="bg-bg-card border border-border-primary rounded-xl p-5 hover:border-accent-primary/30 transition-colors group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-accent-primary font-medium">{related.category}</span>
                  <span className="text-xs text-text-muted">{related.read_time}</span>
                </div>
                <h3 className="text-base font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
                  {related.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border-primary py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Align. All rights reserved.
          </span>
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href="/blog" className="hover:text-text-secondary">Blog</Link>
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
