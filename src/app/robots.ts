import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/settings', '/messages', '/admin', '/api/', '/auth/callback'],
      },
    ],
    sitemap: 'https://align-web.vercel.app/sitemap.xml',
  };
}
