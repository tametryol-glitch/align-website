'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useGettingStarted } from '@/hooks/useGettingStarted';
import { useAuthStore } from '@/stores/authStore';
import { generateDailyCard, type CosmicCard, type UserCosmicProfile } from '@/lib/dailyCosmicCardEngine';
import { AURA_COLORS, SIGN_RULERS, PLANET_AURA_COLORS } from '@/lib/auraColors';
import type { AuraColorName } from '@/types/aura';
import {
  Sparkles,
  Sun,
  Moon,
  Heart,
  Briefcase,
  TrendingUp,
  Zap,
  Clock,
  ChevronRight,
  ScanEye,
  BookOpen,
  Users,
  ArrowLeft,
} from 'lucide-react';

// ── Astronomical helpers (same approach as dashboard) ─────────────

const SYNODIC = 29.53058770576;
const REF_NEW = new Date('2024-01-11T11:57:00Z').getTime();

const MOON_PHASE_TABLE = [
  { name: 'New Moon', emoji: '\u{1F311}', max: 1.85, meaning: 'A time for new beginnings and setting intentions.' },
  { name: 'Waxing Crescent', emoji: '\u{1F312}', max: 7.38, meaning: 'Nurture your intentions and build momentum.' },
  { name: 'First Quarter', emoji: '\u{1F313}', max: 9.22, meaning: 'Take decisive action on your goals.' },
  { name: 'Waxing Gibbous', emoji: '\u{1F314}', max: 14.77, meaning: 'Refine your approach and stay committed.' },
  { name: 'Full Moon', emoji: '\u{1F315}', max: 16.61, meaning: 'Culmination and clarity illuminate your path.' },
  { name: 'Waning Gibbous', emoji: '\u{1F316}', max: 22.15, meaning: 'Share wisdom and express gratitude.' },
  { name: 'Last Quarter', emoji: '\u{1F317}', max: 23.99, meaning: 'Release what no longer serves you.' },
  { name: 'Waning Crescent', emoji: '\u{1F318}', max: 29.53, meaning: 'Rest, reflect, and prepare for renewal.' },
];

const ZODIAC_SIGNS = [
  'Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini',
  'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius',
];
const ZODIAC_CUTOFFS = [20, 19, 20, 20, 21, 21, 22, 23, 23, 23, 22, 22];
const ZODIAC_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

// 12 zodiac signs in ecliptic longitude order (Aries=0)
const ECLIPTIC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

function getZodiacSign(month: number, day: number): string {
  return day < ZODIAC_CUTOFFS[month] ? ZODIAC_SIGNS[month] : ZODIAC_SIGNS[(month + 1) % 12];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

function getMoonData(now: Date) {
  const age = (((now.getTime() - REF_NEW) / 86400000) % SYNODIC + SYNODIC) % SYNODIC;
  const illum = Math.round((1 - Math.cos(2 * Math.PI * age / SYNODIC)) / 2 * 100);
  const entry = MOON_PHASE_TABLE.find(p => age < p.max) || MOON_PHASE_TABLE[7];

  // Approximate moon sign from age: moon traverses ~12.2 deg/day
  // Full cycle in ~27.3 days (sidereal), approximate sign from synodic age
  const siderealAge = age * (27.3217 / SYNODIC); // rough conversion
  const moonLonApprox = (siderealAge / 27.3217) * 360;
  const signIndex = Math.floor((moonLonApprox % 360) / 30);
  const moonSign = ECLIPTIC_SIGNS[signIndex] || 'Aries';

  return {
    phase: entry.name,
    emoji: entry.emoji,
    meaning: entry.meaning,
    illumination: illum,
    moonSign,
  };
}

function getEnergyColor(sunSign: string): { colorName: AuraColorName; color: typeof AURA_COLORS[AuraColorName] } {
  const ruler = SIGN_RULERS[sunSign] || 'Sun';
  const colorName = PLANET_AURA_COLORS[ruler] || 'gold';
  return { colorName, color: AURA_COLORS[colorName] };
}

function getWeatherColor(value: number): string {
  if (value >= 7) return '#48BB78'; // green
  if (value >= 4) return '#ECC94B'; // yellow
  return '#E53E3E'; // red
}

// ── Main Component ───────────────────────────────────────────────

export default function YourDayPage() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const { markComplete } = useGettingStarted();
  useEffect(() => { markComplete('read_horoscope'); }, [markComplete]);

  const [now] = useState(() => new Date());

  const firstName = profile?.display_name?.split(' ')[0] || 'Stargazer';
  const sunSign = profile?.sun_sign || getZodiacSign(now.getMonth(), now.getDate());

  // Current zodiac season
  const currentSeason = getZodiacSign(now.getMonth(), now.getDate());
  const seasonGlyph = ZODIAC_GLYPHS[currentSeason] || '';

  // Generate cosmic card
  const cosmicCard: CosmicCard = useMemo(() => {
    const cosmicProfile: UserCosmicProfile = {
      sun_sign: sunSign,
      moon_sign: profile?.moon_sign || undefined,
      rising_sign: profile?.rising_sign || undefined,
      birth_date: profile?.birth_date || undefined,
      birth_time: profile?.birth_time || undefined,
    };
    return generateDailyCard(now, cosmicProfile);
  }, [sunSign, profile?.moon_sign, profile?.rising_sign, profile?.birth_date, profile?.birth_time, now]);

  // Moon data
  const moonData = useMemo(() => getMoonData(now), [now]);

  // Energy color
  const { colorName: energyColorName, color: energyColor } = useMemo(() => getEnergyColor(sunSign), [sunSign]);

  // Format date
  const formattedDate = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Cosmic weather dimensions
  const weatherDimensions = [
    { key: 'overall', label: t('yourDay.overall', 'Overall'), value: cosmicCard.cosmicWeather.overall, icon: Sun },
    { key: 'love', label: t('yourDay.love', 'Love'), value: cosmicCard.cosmicWeather.love, icon: Heart },
    { key: 'career', label: t('yourDay.career', 'Career'), value: cosmicCard.cosmicWeather.career, icon: Briefcase },
    { key: 'growth', label: t('yourDay.growth', 'Growth'), value: cosmicCard.cosmicWeather.growth, icon: TrendingUp },
  ];

  // Quick actions
  const quickActions = [
    { href: '/readings/aura', label: t('yourDay.startAuraScan', 'Start Aura Scan'), icon: ScanEye },
    { href: '/readings/transits', label: t('yourDay.viewTransits', 'View Transits'), icon: Sparkles },
    { href: '/readings/cosmic-journal', label: t('yourDay.openJournal', 'Open Journal'), icon: BookOpen },
    { href: '/readings/compatibility', label: t('yourDay.checkCompatibility', 'Check Compatibility'), icon: Users },
  ];

  return (
    <div className="max-w-2xl mx-auto pb-20 space-y-6">

      {/* ─── Back Navigation ─────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Link href="/dashboard" className="p-2 -ml-2 text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-sm text-text-muted">{t('yourDay.title', 'Your Day')}</span>
      </div>

      {/* ═══════════════════════════════════════════════════
          Section 1: Greeting + Date
          ═══════════════════════════════════════════════════ */}
      <section>
        <h1 className="text-3xl font-display font-bold text-text-primary">
          {t('yourDay.greeting', getGreeting())}, {firstName}
        </h1>
        <p className="text-text-secondary mt-1">{formattedDate}</p>
        <p className="text-text-muted text-sm mt-0.5">
          {seasonGlyph} {currentSeason} {t('yourDay.season', 'Season')}
        </p>
      </section>

      {/* ═══════════════════════════════════════════════════
          Section 2: Cosmic Card of the Day
          ═══════════════════════════════════════════════════ */}
      <section
        className="rounded-2xl p-6 border border-white/10 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${cosmicCard.theme.gradient[0]}, ${cosmicCard.theme.gradient[1]})`,
        }}
      >
        <div className="relative z-10">
          <p className="text-white/60 text-[10px] font-semibold uppercase tracking-[2px] mb-2">
            {t('yourDay.cosmicCardLabel', 'Cosmic Card of the Day')}
          </p>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{cosmicCard.emoji}</span>
            <h2 className="text-2xl font-bold text-white">{cosmicCard.title}</h2>
          </div>
          <p className="text-white/85 text-sm leading-relaxed mb-5">
            {cosmicCard.message}
          </p>

          {/* Challenge callout */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/10">
            <div className="flex items-center gap-2 mb-1.5">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span className="text-white text-xs font-semibold uppercase tracking-wider">
                {t('yourDay.dailyChallenge', 'Daily Challenge')}
              </span>
            </div>
            <p className="text-white/90 text-sm">{cosmicCard.challenge}</p>
          </div>

          {/* Affirmation */}
          <p className="text-white/70 text-sm italic text-center">
            &ldquo;{cosmicCard.affirmation}&rdquo;
          </p>
        </div>

        {/* Decorative background glow */}
        <div
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-20 blur-3xl"
          style={{ background: cosmicCard.theme.accentColor }}
        />
      </section>

      {/* ═══════════════════════════════════════════════════
          Section 3: Cosmic Weather Dashboard
          ═══════════════════════════════════════════════════ */}
      <section className="card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-primary" />
            {t('yourDay.cosmicWeather', 'Cosmic Weather')}
          </h3>
          <span className="text-xs text-accent-primary font-medium px-2 py-1 rounded-full bg-accent-primary/10">
            {cosmicCard.cosmicWeather.label}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-5">
          {weatherDimensions.map(dim => {
            const Icon = dim.icon;
            const color = getWeatherColor(dim.value);
            const pct = (dim.value / 10) * 100;
            return (
              <div key={dim.key} className="flex flex-col items-center gap-2">
                {/* Circular gauge */}
                <div className="relative w-16 h-16">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle
                      cx="18" cy="18" r="15.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-bg-tertiary"
                    />
                    <circle
                      cx="18" cy="18" r="15.5"
                      fill="none"
                      stroke={color}
                      strokeWidth="3"
                      strokeDasharray={`${pct} ${100 - pct}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-text-primary">{dim.value}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Icon className="w-3 h-3 text-text-muted" />
                  <span className="text-[11px] text-text-muted font-medium">{dim.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Power Hours */}
        <div className="flex items-center gap-2 pt-3 border-t border-border-primary">
          <Clock className="w-4 h-4 text-text-muted flex-shrink-0" />
          <span className="text-xs text-text-muted">{t('yourDay.powerHours', 'Power Hours')}:</span>
          <div className="flex gap-2 flex-wrap">
            {cosmicCard.power_hours.map(h => (
              <span key={h} className="text-xs font-medium text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded-full">
                {h}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          Section 4: Moon Phase
          ═══════════════════════════════════════════════════ */}
      <Link href="/readings/moon-phases" className="block">
        <section className="card rounded-2xl p-5 hover:border-accent-primary/30 transition-colors">
          <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Moon className="w-4 h-4 text-accent-primary" />
            {t('yourDay.moonPhase', 'Moon Phase')}
          </h3>
          <div className="flex items-center gap-5">
            <span className="text-6xl">{moonData.emoji}</span>
            <div className="flex-1">
              <p className="text-lg font-semibold text-text-primary">{moonData.phase}</p>
              <p className="text-sm text-text-secondary mt-0.5">
                {moonData.illumination}% {t('yourDay.illumination', 'illumination')}
              </p>
              <p className="text-sm text-text-muted mt-0.5">
                {ZODIAC_GLYPHS[moonData.moonSign] || ''} {t('yourDay.moonIn', 'Moon in')} {moonData.moonSign}
              </p>
              <p className="text-xs text-text-muted mt-2 italic leading-relaxed">
                {moonData.meaning}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
          </div>
        </section>
      </Link>

      {/* ═══════════════════════════════════════════════════
          Section 5: Your Energy Today
          ═══════════════════════════════════════════════════ */}
      <section className="card rounded-2xl p-5">
        <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent-primary" />
          {t('yourDay.yourEnergy', 'Your Energy Today')}
        </h3>
        <div className="flex items-center gap-5">
          {/* Aura orb */}
          <div className="relative flex-shrink-0">
            <div
              className="w-20 h-20 rounded-full"
              style={{
                background: `radial-gradient(circle at 40% 40%, ${energyColor.hexGlow}, ${energyColor.hex})`,
                boxShadow: `0 0 30px ${energyColor.hex}50, 0 0 60px ${energyColor.hex}25`,
              }}
            />
            <div
              className="absolute inset-0 w-20 h-20 rounded-full animate-pulse opacity-30"
              style={{
                background: `radial-gradient(circle, ${energyColor.hexGlow}, transparent 70%)`,
              }}
            />
          </div>
          <div className="flex-1">
            <p className="text-sm text-text-secondary leading-relaxed">
              {t('yourDay.energyLeans', 'Your energy today leans toward')}{' '}
              <span className="font-semibold" style={{ color: energyColor.hex }}>
                {energyColor.label}
              </span>
            </p>
            <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
              {energyColor.meaning}
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          Section 6: Quick Actions
          ═══════════════════════════════════════════════════ */}
      <section>
        <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-primary" />
          {t('yourDay.quickActions', 'Quick Actions')}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href} className="block">
                <div className="card rounded-xl p-4 hover:border-accent-primary/30 transition-all flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-accent-primary" />
                  </div>
                  <span className="text-sm font-medium text-text-primary">{action.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── Lucky Element Footer ────────────────────────── */}
      <div className="text-center py-4">
        <p className="text-xs text-text-muted">{cosmicCard.luckyElement}</p>
      </div>
    </div>
  );
}
