'use client';

import Link from 'next/link';
import { useSubscriptionStore, type TierLevel } from '@/stores/subscriptionStore';
import { Lock } from 'lucide-react';

interface ReadingItem {
  key: string;
  href: string;
  glyph: string;
  tier: TierLevel;
}

const READINGS: ReadingItem[] = [
  { key: 'Transits', href: '/readings/transits', glyph: '♄', tier: 'free' },
  { key: 'Soul Gifts', href: '/readings/soul-gifts', glyph: '💎', tier: 'free' },
  { key: 'Soul Memory', href: '/readings/soul-memory', glyph: '🌀', tier: 'free' },
  { key: 'Compatibility', href: '/readings/compatibility', glyph: '♥', tier: 'premium' },
  { key: 'Starseed', href: '/readings/starseed', glyph: '✦', tier: 'premium' },
  { key: 'Numerology', href: '/readings/numerology', glyph: '#', tier: 'light' },
  { key: 'Human Design', href: '/readings/human-design', glyph: '⬡', tier: 'premium' },
  { key: 'Tarot', href: '/readings/tarot', glyph: '♠', tier: 'premium' },
  { key: 'Financial', href: '/readings/financial', glyph: '$', tier: 'premium' },
  { key: 'Name Analysis', href: '/readings/name-analysis', glyph: 'Aa', tier: 'light' },
  { key: 'Angel Numbers', href: '/readings/angel-numbers', glyph: '111', tier: 'free' },
  { key: 'Moon Phases', href: '/readings/moon-phases', glyph: '🌙', tier: 'light' },
  { key: 'Planetary Hours', href: '/readings/planetary-hours', glyph: '⏰', tier: 'free' },
  { key: 'Cosmic Journal', href: '/readings/cosmic-journal', glyph: '📖', tier: 'free' },
  { key: 'Dream Oracle', href: '/readings/dream-oracle', glyph: '🌙', tier: 'premium' },
  { key: 'Year Ahead', href: '/readings/year-ahead', glyph: '📅', tier: 'premium' },
  { key: 'Galactic Clock', href: '/readings/galactic-clock', glyph: '🕐', tier: 'free' },
  { key: 'Galactic Forecast', href: '/readings/galactic-forecast', glyph: '🌌', tier: 'premium' },
  { key: 'Solar Return', href: '/readings/solar-return', glyph: '☉', tier: 'premium' },
  { key: 'Midpoints', href: '/readings/midpoints', glyph: '⊕', tier: 'premium' },
  { key: 'Firdaria', href: '/readings/firdaria', glyph: '⌛', tier: 'pro' },
  { key: 'Zodiacal Releasing', href: '/readings/zodiacal-releasing', glyph: '♈', tier: 'pro' },
  { key: 'ACG Map', href: '/readings/acg', glyph: '🌍', tier: 'pro' },
  { key: 'Arabic Parts', href: '/readings/arabic-parts', glyph: '✡', tier: 'premium' },
  { key: 'Fixed Stars', href: '/readings/fixed-stars', glyph: '★', tier: 'pro' },
  { key: 'Pathway', href: '/readings/pathway', glyph: '🛤️', tier: 'pro' },
  { key: 'Rectification', href: '/readings/rectification', glyph: '🔧', tier: 'pro' },
];

const TIER_RANK: Record<TierLevel, number> = { free: 0, light: 1, premium: 2, pro: 3 };

export default function ReadingsPage() {
  const { tier } = useSubscriptionStore();

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-text-primary mb-6">Readings</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {READINGS.map((reading) => {
          const locked = TIER_RANK[tier] < TIER_RANK[reading.tier];
          return (
            <Link
              key={reading.key}
              href={locked ? '/pricing' : reading.href}
              className="relative group"
            >
              <div className="reading-card min-h-[120px] flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="text-[32px] leading-none text-accent-secondary">{reading.glyph}</span>
                  {reading.tier !== 'free' && (
                    <span className="bg-gold-muted text-gold-primary text-[10px] font-semibold uppercase px-2 py-0.5 rounded">
                      {reading.tier}
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-primary font-medium mt-3">{reading.key}</p>
              </div>
              {locked && (
                <div className="absolute inset-0 bg-bg-primary/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                  <div className="flex items-center gap-2 text-text-muted">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm font-medium">Upgrade to {reading.tier}</span>
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
