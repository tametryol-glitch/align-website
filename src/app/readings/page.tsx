'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useSubscriptionStore, type TierLevel } from '@/stores/subscriptionStore';
import { useAuthStore } from '@/stores/authStore';
import { Lock, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ReadingItem {
  key: string;
  href: string;
  glyph: string;
  tier: TierLevel;
}

const READINGS: ReadingItem[] = [
  { key: 'Aura Mirror', href: '/readings/aura', glyph: '🪞', tier: 'free' },
  { key: 'Soul Ascension', href: '/readings/soul-ascension', glyph: 'SA', tier: 'starter' },
  { key: 'Transits', href: '/readings/transits', glyph: '♄', tier: 'free' },
  { key: 'Soul Gifts', href: '/readings/soul-gifts', glyph: '💎', tier: 'starter' },
  { key: 'Soul Memory', href: '/readings/soul-memory', glyph: '🌀', tier: 'starter' },
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
  { key: 'Cosmic Journal', href: '/readings/cosmic-journal', glyph: '📖', tier: 'starter' },
  { key: 'Dream Oracle', href: '/readings/dream-oracle', glyph: '🔮', tier: 'premium' },
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
  { key: 'Chart Adjuster', href: '/readings/chart-adjuster', glyph: '☉', tier: 'starter' },
];

const READING_I18N_KEYS: Record<string, string> = {
  'Aura Mirror': 'readings.auraMirror',
  'Soul Ascension': 'readings.soulAscension',
  'Transits': 'readings.transits',
  'Soul Gifts': 'readings.soulGifts',
  'Soul Memory': 'readings.soulMemory',
  'Compatibility': 'readings.compatibility',
  'Starseed': 'readings.starseed',
  'Numerology': 'readings.numerology',
  'Human Design': 'readings.humanDesign',
  'Tarot': 'readings.tarot',
  'Financial': 'readings.financial',
  'Name Analysis': 'readings.nameAnalysis',
  'Angel Numbers': 'readings.angelNumbers',
  'Moon Phases': 'readings.moonPhases',
  'Planetary Hours': 'readings.planetaryHours',
  'Cosmic Journal': 'readings.cosmicJournal',
  'Dream Oracle': 'readings.dreamOracle',
  'Year Ahead': 'readings.yearAhead',
  'Galactic Clock': 'readings.galacticClock',
  'Galactic Forecast': 'readings.galacticForecast',
  'Solar Return': 'readings.solarReturn',
  'Midpoints': 'readings.midpoints',
  'Firdaria': 'readings.firdaria',
  'Zodiacal Releasing': 'readings.zodiacalReleasing',
  'ACG Map': 'readings.acg',
  'Arabic Parts': 'readings.arabicParts',
  'Fixed Stars': 'readings.fixedStars',
  'Pathway': 'readings.pathway',
  'Rectification': 'readings.rectification',
  'Chart Adjuster': 'readings.chartAdjuster',
};

const TIER_RANK: Record<TierLevel, number> = { free: 0, starter: 1, light: 2, premium: 3, pro: 4 };

const READINGS_BY_KEY = Object.fromEntries(READINGS.map((r) => [r.key, r]));

const FIRE_SIGNS = ['Aries', 'Leo', 'Sagittarius'];
const EARTH_SIGNS = ['Taurus', 'Virgo', 'Capricorn'];
const AIR_SIGNS = ['Gemini', 'Libra', 'Aquarius'];
const WATER_SIGNS = ['Cancer', 'Scorpio', 'Pisces'];

const DAY_ROTATION: [string, string][] = [
  ['Aura Mirror', 'Transits'],
  ['Moon Phases', 'Cosmic Journal'],
  ['Soul Gifts', 'Numerology'],
  ['Planetary Hours', 'Soul Ascension'],
  ['Dream Oracle', 'Year Ahead'],
];

const SIGN_PICKS: Record<string, string[]> = {
  fire: ['Compatibility', 'Tarot', 'Financial'],
  earth: ['Numerology', 'Financial', 'Moon Phases'],
  air: ['Name Analysis', 'Human Design', 'Starseed'],
  water: ['Dream Oracle', 'Soul Memory', 'Compatibility'],
};

const REC_WHY_KEYS: Record<string, string> = {
  'Aura Mirror': 'readings.rec.whyAuraMirror',
  'Transits': 'readings.rec.whyTransits',
  'Moon Phases': 'readings.rec.whyMoonPhases',
  'Cosmic Journal': 'readings.rec.whyCosmicJournal',
  'Soul Gifts': 'readings.rec.whySoulGifts',
  'Numerology': 'readings.rec.whyNumerology',
  'Planetary Hours': 'readings.rec.whyPlanetaryHours',
  'Soul Ascension': 'readings.rec.whySoulAscension',
  'Dream Oracle': 'readings.rec.whyDreamOracle',
  'Year Ahead': 'readings.rec.whyYearAhead',
  'Compatibility': 'readings.rec.whyCompatibility',
  'Tarot': 'readings.rec.whyTarot',
  'Financial': 'readings.rec.whyFinancial',
  'Name Analysis': 'readings.rec.whyNameAnalysis',
  'Human Design': 'readings.rec.whyHumanDesign',
  'Starseed': 'readings.rec.whyStarseed',
  'Soul Memory': 'readings.rec.whySoulMemory',
};

const REC_WHY_FALLBACKS: Record<string, string> = {
  'Aura Mirror': 'Your aura snapshot refreshes every day',
  'Transits': 'Active transits are hitting your chart today',
  'Moon Phases': 'Current lunar energy shapes your mood',
  'Cosmic Journal': 'Reflection deepens self-awareness',
  'Soul Gifts': 'Discover hidden talents encoded in your chart',
  'Numerology': 'Your personal year number guides decisions',
  'Planetary Hours': "Today's planetary timing can boost results",
  'Soul Ascension': 'Track your spiritual growth arc',
  'Dream Oracle': 'Your subconscious holds answers',
  'Year Ahead': 'Plan around upcoming cosmic shifts',
  'Compatibility': 'See how you connect with others',
  'Tarot': 'Draw clarity from the cosmic deck',
  'Financial': 'Align money moves with the stars',
  'Name Analysis': 'Your name vibration reveals hidden patterns',
  'Human Design': 'Understand your energetic blueprint',
  'Starseed': 'Explore your cosmic origin story',
  'Soul Memory': 'Past-life echoes shape your present path',
};

function getElement(sign: string): string {
  if (FIRE_SIGNS.includes(sign)) return 'fire';
  if (EARTH_SIGNS.includes(sign)) return 'earth';
  if (AIR_SIGNS.includes(sign)) return 'air';
  if (WATER_SIGNS.includes(sign)) return 'water';
  return 'fire';
}

function getRecommendations(sunSign: string | null | undefined): string[] {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  const bucket = dayOfYear % 10;
  const rotationIdx = Math.floor(bucket / 2);
  const [first, second] = DAY_ROTATION[rotationIdx];

  if (!sunSign) {
    return ['Aura Mirror', 'Transits', 'Cosmic Journal'];
  }

  const element = getElement(sunSign);
  const signPicks = SIGN_PICKS[element];

  // Pick a sign-based reading that doesn't duplicate the day rotation picks
  let thirdPick = signPicks.find((k) => k !== first && k !== second) ?? signPicks[0];

  return [first, second, thirdPick];
}

export default function ReadingsPage() {
  const { t } = useTranslation();
  const { tier } = useSubscriptionStore();
  const profile = useAuthStore((s) => s.profile);

  const recommendations = useMemo(
    () => getRecommendations(profile?.sun_sign),
    [profile?.sun_sign],
  );

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-text-primary mb-6">{t('readings.title')}</h1>

      {/* Recommended for You */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-accent-primary" />
          <h2 className="text-lg font-display font-semibold text-text-primary">
            {t('readings.rec.title', 'Recommended for You')}
          </h2>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1">
          {recommendations.map((key) => {
            const reading = READINGS_BY_KEY[key];
            if (!reading) return null;
            const locked = TIER_RANK[tier] < TIER_RANK[reading.tier];
            const whyKey = REC_WHY_KEYS[key];
            const whyFallback = REC_WHY_FALLBACKS[key] ?? '';

            return (
              <Link
                key={reading.key}
                href={locked ? '/pricing' : reading.href}
                className="relative group flex-1 min-w-[160px] max-w-[260px]"
              >
                <div className="rounded-2xl p-5 min-h-[150px] flex flex-col justify-between border border-accent-primary/20 bg-gradient-to-br from-accent-primary/10 via-transparent to-accent-secondary/5 transition-all hover:border-accent-primary/40 hover:shadow-lg hover:shadow-accent-primary/5">
                  <div className="flex items-start justify-between">
                    <span className="text-[36px] leading-none">{reading.glyph}</span>
                    {reading.tier !== 'free' && (
                      <span className="bg-gold-muted text-gold-primary text-[10px] font-semibold uppercase px-2 py-0.5 rounded">
                        {reading.tier}
                      </span>
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-text-primary font-semibold">
                      {READING_I18N_KEYS[reading.key] ? t(READING_I18N_KEYS[reading.key]) : reading.key}
                    </p>
                    <p className="text-xs text-text-muted mt-1 line-clamp-2">
                      {whyKey ? t(whyKey, whyFallback) : whyFallback}
                    </p>
                  </div>
                </div>
                {locked && (
                  <div className="absolute inset-0 bg-bg-primary/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                    <div className="flex items-center gap-2 text-text-muted">
                      <Lock className="w-4 h-4" />
                      <span className="text-sm font-medium">{t('readings.upgradeToTier', { tier: reading.tier })}</span>
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* All Readings */}
      <h2 className="text-lg font-display font-semibold text-text-primary mb-4">
        {t('readings.rec.allReadings', 'All Readings')}
      </h2>

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
                <p className="text-sm text-text-primary font-medium mt-3">{READING_I18N_KEYS[reading.key] ? t(READING_I18N_KEYS[reading.key]) : reading.key}</p>
              </div>
              {locked && (
                <div className="absolute inset-0 bg-bg-primary/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                  <div className="flex items-center gap-2 text-text-muted">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('readings.upgradeToTier', { tier: reading.tier })}</span>
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
