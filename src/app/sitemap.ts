import type { MetadataRoute } from 'next';
import { getAllCompatibilityPairs } from '@/data/compatibilityContent';
import { ALL_SIGN_KEYS } from '@/data/zodiacSignContent';
import { getAllSunMoonCombos } from '@/data/sunMoonContent';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://align-web.vercel.app';
  const now = new Date().toISOString();

  const staticRoutes = [
    '/',
    '/auth/login',
    '/auth/signup',
    '/pricing',
    '/courses',
    '/cosmic-index',
    '/compatibility',
  ];

  const readingRoutes = [
    '/readings',
    '/readings/transits',
    '/readings/compatibility',
    '/readings/tarot',
    '/readings/numerology',
    '/readings/angel-numbers',
    '/readings/soul-gifts',
    '/readings/soul-memory',
    '/readings/starseed',
    '/readings/human-design',
    '/readings/financial',
    '/readings/name-analysis',
    '/readings/moon-phases',
    '/readings/planetary-hours',
    '/readings/cosmic-journal',
    '/readings/galactic-clock',
    '/readings/galactic-forecast',
    '/readings/solar-return',
    '/readings/midpoints',
    '/readings/firdaria',
    '/readings/zodiacal-releasing',
    '/readings/acg',
    '/readings/arabic-parts',
    '/readings/fixed-stars',
    '/readings/pathway',
    '/readings/rectification',
    '/readings/year-ahead',
  ];

  const featureRoutes = [
    '/chart',
    '/feed',
    '/communities',
    '/friends',
    '/messages',
    '/matches',
    '/celebrity-matches',
    '/cosmic-alerts',
    '/world-echo',
    '/discover',
    '/ai',
    '/polls',
    '/qa',
    '/fragments',
    '/gallery',
    '/reels',
    '/bookmarks',
    '/group-synastry',
  ];

  /* Zodiac sign profile pages (12 signs) */
  const zodiacRoutes = [
    {
      url: `${base}/zodiac`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    ...ALL_SIGN_KEYS.map((sign) => ({
      url: `${base}/zodiac/${sign}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];

  /* Compatibility pages (78 sign pairs) */
  const compatibilityPairs = getAllCompatibilityPairs();
  const compatibilityRoutes = compatibilityPairs.map((pair) => ({
    url: `${base}/compatibility/${pair.signs}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: route === '/' ? 1.0 : 0.8,
    })),
    ...readingRoutes.map((route) => ({
      url: `${base}${route}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...featureRoutes.map((route) => ({
      url: `${base}${route}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    })),
    ...zodiacRoutes,
    ...compatibilityRoutes,
    /* Personality pages (144 Sun-Moon combos) */
    {
      url: `${base}/personality`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    ...getAllSunMoonCombos().map((c) => ({
      url: `${base}/personality/${c.combo}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
