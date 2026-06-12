import Link from 'next/link';

export interface RelatedLink {
  href: string;
  label: string;
  description?: string;
}

export function RelatedContent({
  title,
  links,
}: {
  title?: string;
  links: RelatedLink[];
}) {
  if (links.length === 0) return null;

  return (
    <section className="max-w-4xl mx-auto px-6 pb-12">
      <h2 className="text-lg font-display font-semibold text-text-primary mb-4">
        {title || 'Explore More'}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-bg-card border border-border-primary rounded-xl p-4 hover:border-accent-primary/30 transition-colors group"
          >
            <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">
              {link.label}
            </p>
            {link.description && (
              <p className="text-xs text-text-muted mt-1">{link.description}</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
