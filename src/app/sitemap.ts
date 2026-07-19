import type { MetadataRoute } from 'next';
import { getAllCompatibilityPairs } from '@/data/compatibilityContent';
import { ALL_SIGN_KEYS } from '@/data/zodiacSignContent';
import { getAllSunMoonCombos } from '@/data/sunMoonContent';
import { getAllSlugs as getAllHouseSlugs } from '@/data/planetsInHousesContent';
import { getAllSynastrySlug } from '@/data/synastryContent';
import { getAllBlogSlugs } from '@/data/blogContent';
import { getAllSeasonalSlugs } from '@/data/seasonalContent';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://aligncosmic.com';
  const now = new Date().toISOString();

  const staticRoutes = [
    '/',
    '/birth-chart-calculator',
    '/hidden-zodiac',
    '/auth/login',
    '/auth/signup',
    '/pricing',
    '/courses',
    '/cosmic-index',
    '/compatibility',
    '/blog',
    '/founder',
    '/affiliates',
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

  /* Planet-in-sign pages (12 signs each) */
  const planetRoutes = [
    'mars-in', 'venus-in', 'mercury-in', 'moon-sign', 'rising-sign',
    'jupiter-in', 'saturn-in', 'uranus-in', 'neptune-in', 'pluto-in',
    'juno-in', 'vesta-in', 'chiron-in', 'north-node-in', 'south-node-in',
  ];
  const planetPages = planetRoutes.flatMap((route) => [
    { url: `${base}/${route}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 },
    ...ALL_SIGN_KEYS.map((sign) => ({
      url: `${base}/${route}/${sign}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]);

  /* Planets in Houses (120 placements) */
  const houseSlugs = getAllHouseSlugs();
  const housePages = [
    { url: `${base}/planets-in-houses`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 },
    ...houseSlugs.map((slug) => ({
      url: `${base}/planets-in-houses/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];

  /* Synastry Aspects (35 aspects) */
  const synastrySlugs = getAllSynastrySlug();
  const synastryPages = [
    { url: `${base}/synastry-aspects`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 },
    ...synastrySlugs.map((slug) => ({
      url: `${base}/synastry-aspects/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];

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
    ...planetPages,
    ...housePages,
    ...synastryPages,
    /* Blog posts */
    ...getAllBlogSlugs().map((slug) => ({
      url: `${base}/blog/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    /* Seasonal / trending events */
    {
      url: `${base}/events`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    ...getAllSeasonalSlugs().map((slug) => ({
      url: `${base}/events/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
