import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/feed', '/settings', '/messages', '/admin', '/api/', '/auth/callback'],
      },
    ],
    sitemap: 'https://aligncosmic.com/sitemap.xml',
  };
}
