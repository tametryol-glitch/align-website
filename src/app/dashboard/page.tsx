'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { api, buildBirthData } from '@/lib/api';
import { formatDate, getZodiacGlyph, getPlanetGlyph } from '@/lib/utils';
import Link from 'next/link';
import { Sparkles, Star, Moon, Compass, TrendingUp, Zap, BookOpen, MessageCircle, Users } from 'lucide-react';

export default function DashboardPage() {
  const { user, profile } = useAuthStore();
  const name = profile?.display_name || user?.user_metadata?.name || 'Stargazer';
  const sunSign = profile?.sun_sign || getCurrentSign();
  const [dailyEnergy, setDailyEnergy] = useState<any>(null);
  const [transits, setTransits] = useState<any[]>([]);

  const hasBirthData = profile?.birth_date && profile?.birth_time && profile?.latitude;

  useEffect(() => {
    if (hasBirthData) {
      loadTransits();
    }
  }, [hasBirthData]);

  async function loadTransits() {
    try {
      const data = await api.getCurrentTransits(buildBirthData(profile!));
      setTransits((data?.transits || data?.aspects || []).slice(0, 5));
    } catch {
      // Fail silently
    }
  }

  const greeting = getGreeting();
  const moonPhase = getMoonPhase();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm text-text-muted">{greeting}</p>
        <h1 className="text-2xl font-display font-bold text-text-primary">
          {name} {profile?.sun_sign && <span className="text-accent-primary">{getZodiacGlyph(profile.sun_sign)}</span>}
        </h1>
        <p className="text-sm text-text-tertiary mt-0.5">{formatDate(new Date())}</p>
      </div>

      {/* Today's Energy Card */}
      <div className="bg-gradient-cosmic rounded-2xl p-6 border border-accent-muted relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 text-[120px] leading-none pointer-events-none">
          {getZodiacGlyph(sunSign)}
        </div>
        <p className="text-accent-tertiary text-xs font-semibold uppercase tracking-widest mb-2">
          Today&apos;s Energy
        </p>
        <h2 className="text-xl font-bold text-text-primary mb-2 flex items-center gap-2">
          <span>☉</span> Sun in {sunSign} {getZodiacGlyph(sunSign)}
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed max-w-lg">
          {getDailyMessage(sunSign)}
        </p>
        <Link href="/readings/transits" className="inline-flex items-center gap-1 text-accent-primary text-sm font-medium mt-4 hover:underline">
          See full forecast →
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card text-center py-4">
          <span className="text-2xl block mb-1">{moonPhase.emoji}</span>
          <p className="text-xs font-medium text-text-primary">{moonPhase.name}</p>
          <p className="text-[10px] text-text-muted">{moonPhase.sign}</p>
        </div>
        <div className="card text-center py-4">
          <span className="text-2xl block mb-1">☿</span>
          <p className="text-xs font-medium text-text-primary">Mercury Rx</p>
          <p className="text-[10px] text-text-muted">Review & reflect</p>
        </div>
        <div className="card text-center py-4">
          <span className="text-2xl block mb-1">{getPlanetaryHourGlyph()}</span>
          <p className="text-xs font-medium text-text-primary">{getPlanetaryHourName()} Hour</p>
          <p className="text-[10px] text-text-muted">Current ruler</p>
        </div>
        <Link href="/cosmic-alerts" className="card text-center py-4 hover:border-accent-primary/30 transition-colors">
          <Zap className="w-6 h-6 text-gold-primary mx-auto mb-1" />
          <p className="text-xs font-medium text-text-primary">Alerts</p>
          <p className="text-[10px] text-text-muted">View transits</p>
        </Link>
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          <QuickCard href="/chart" icon="☉" label="My Chart" color="accent" />
          <QuickCard href="/readings" icon="✦" label="Readings" color="accent" />
          <QuickCard href="/readings/compatibility" icon="♥" label="Compatibility" color="fire" />
          <QuickCard href="/world-echo" icon="🌍" label="World Echo" color="accent" />
          <QuickCard href="/ai" icon="🤖" label="AI Astrologer" color="accent" />
        </div>
      </div>

      {/* Two-column */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Active Transits */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent-primary" /> Active Transits
            </h3>
            <Link href="/readings/transits" className="text-[10px] text-accent-primary hover:underline">View all</Link>
          </div>
          {transits.length > 0 ? (
            <div className="space-y-2.5">
              {transits.map((t: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-text-secondary">{t.transit_planet || t.planet1}</span>
                  <span className="text-accent-secondary text-xs italic px-1.5 py-0.5 rounded bg-accent-muted">
                    {t.aspect || t.type}
                  </span>
                  <span className="text-text-secondary">{t.natal_planet || t.planet2}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              <TransitRow planet1="♀ Venus" aspect="trine" planet2="♃ Jupiter" />
              <TransitRow planet1="♂ Mars" aspect="square" planet2="♄ Saturn" />
              <TransitRow planet1="☿ Mercury" aspect="sextile" planet2="♅ Uranus" />
            </div>
          )}
        </div>

        {/* Explore Features */}
        <div className="card">
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Compass className="w-4 h-4 text-accent-primary" /> Explore
          </h3>
          <div className="space-y-2">
            <ExploreRow href="/readings/soul-gifts" icon="💎" label="Soul Gifts" desc="Your asteroid talents" />
            <ExploreRow href="/readings/soul-memory" icon="🌀" label="Soul Memory" desc="Past life blueprint" />
            <ExploreRow href="/readings/galactic-clock" icon="🌌" label="Galactic Clock" desc="144 cosmic divisions" />
            <ExploreRow href="/celebrity-matches" icon="⭐" label="Celebrity Matches" desc="Famous cosmic twins" />
          </div>
        </div>

        {/* Community */}
        <div className="card">
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-accent-primary" /> Community
          </h3>
          <div className="space-y-2">
            <ExploreRow href="/feed" icon="🌐" label="Cosmic Feed" desc="See what others share" />
            <ExploreRow href="/communities" icon="👥" label="Communities" desc="Join cosmic groups" />
            <ExploreRow href="/polls" icon="📊" label="Polls" desc="Vote & discuss" />
            <ExploreRow href="/discover" icon="🔍" label="Discover" desc="Find new connections" />
          </div>
        </div>

        {/* Learn & Grow */}
        <div className="card">
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent-primary" /> Learn & Grow
          </h3>
          <div className="space-y-2">
            <ExploreRow href="/courses" icon="📖" label="Courses" desc="Structured learning" />
            <ExploreRow href="/cosmic-index" icon="📚" label="Cosmic Index" desc="Astrology reference" />
            <ExploreRow href="/readings/angel-numbers" icon="🔢" label="Angel Numbers" desc="Divine messages" />
            <ExploreRow href="/readings/cosmic-journal" icon="📝" label="Journal" desc="Guided reflections" />
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      {!hasBirthData && (
        <div className="bg-gradient-cosmic rounded-2xl p-6 border border-accent-muted text-center">
          <Sparkles className="w-8 h-8 text-accent-primary mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">Complete Your Cosmic Profile</h3>
          <p className="text-sm text-text-tertiary mb-4 max-w-md mx-auto">
            Add your birth data to unlock personalized readings, transit alerts, and accurate chart calculations.
          </p>
          <Link href="/onboarding" className="btn-primary inline-block">
            Add Birth Data
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────

function QuickCard({ href, icon, label, color }: { href: string; icon: string; label: string; color: string }) {
  return (
    <Link
      href={href}
      className="group text-center rounded-xl p-4 border border-accent-muted transition-all hover:border-accent-primary/40 bg-gradient-cosmic"
    >
      <span className="text-2xl block mb-1 group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-xs text-text-secondary font-medium">{label}</span>
    </Link>
  );
}

function TransitRow({ planet1, aspect, planet2 }: { planet1: string; aspect: string; planet2: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-text-secondary">{planet1}</span>
      <span className="text-accent-secondary text-xs italic px-1.5 py-0.5 rounded bg-accent-muted">{aspect}</span>
      <span className="text-text-secondary">{planet2}</span>
    </div>
  );
}

function ExploreRow({ href, icon, label, desc }: { href: string; icon: string; label: string; desc: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-bg-tertiary transition-colors">
      <span className="text-lg">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-[10px] text-text-muted">{desc}</p>
      </div>
      <span className="text-text-muted text-sm">›</span>
    </Link>
  );
}

// ── Helpers ──────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning ☀️';
  if (hour < 17) return 'Good afternoon 🌤️';
  if (hour < 21) return 'Good evening 🌅';
  return 'Good night 🌙';
}

function getCurrentSign(): string {
  const month = new Date().getMonth();
  const day = new Date().getDate();
  const signs = [
    'Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini',
    'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius',
  ];
  const cutoffs = [20, 19, 20, 20, 21, 21, 22, 23, 23, 23, 22, 22];
  return day < cutoffs[month] ? signs[month] : signs[(month + 1) % 12];
}

function getMoonPhase() {
  // Simplified moon phase calculation
  const now = new Date();
  const synodic = 29.530588853;
  const known_new = new Date('2024-01-11').getTime();
  const diff = (now.getTime() - known_new) / (1000 * 60 * 60 * 24);
  const phase = ((diff % synodic) + synodic) % synodic;

  if (phase < 1.85) return { emoji: '🌑', name: 'New Moon', sign: 'Intentions & beginnings' };
  if (phase < 7.38) return { emoji: '🌒', name: 'Waxing Crescent', sign: 'Growth & hope' };
  if (phase < 11.07) return { emoji: '🌓', name: 'First Quarter', sign: 'Action & decisions' };
  if (phase < 14.76) return { emoji: '🌔', name: 'Waxing Gibbous', sign: 'Refine & prepare' };
  if (phase < 16.61) return { emoji: '🌕', name: 'Full Moon', sign: 'Culmination & release' };
  if (phase < 22.14) return { emoji: '🌖', name: 'Waning Gibbous', sign: 'Gratitude & sharing' };
  if (phase < 25.83) return { emoji: '🌗', name: 'Last Quarter', sign: 'Release & forgive' };
  return { emoji: '🌘', name: 'Waning Crescent', sign: 'Rest & surrender' };
}

function getDailyMessage(sign: string): string {
  const messages: Record<string, string> = {
    Aries: 'Your fiery energy is flowing strong today. Take bold action on projects that excite you, but remember to pause before reacting impulsively.',
    Taurus: 'Grounding energy surrounds you. Focus on building something lasting today — your patience and determination are your superpowers.',
    Gemini: 'Your mind is buzzing with ideas. Share your thoughts with others and embrace curiosity. Connections made today could prove valuable.',
    Cancer: 'Nurture yourself and those you love today. Your intuition is heightened — trust those gut feelings about situations and people.',
    Leo: 'Your creative fire burns bright. Express yourself boldly and let your natural leadership shine. Others are drawn to your warmth.',
    Virgo: 'Details come into focus today. Your analytical mind can solve complex problems — use this energy for practical improvements.',
    Libra: 'Harmony and beauty call to you. Seek balance in relationships and create aesthetically pleasing spaces around you.',
    Scorpio: 'Deep transformation is available today. Dive beneath the surface and explore what truly motivates you. Power comes from self-knowledge.',
    Sagittarius: 'Adventure and expansion beckon. Explore new philosophies, plan a journey, or simply expand your worldview through learning.',
    Capricorn: 'Structure and ambition fuel your day. Take steps toward long-term goals — your discipline and perseverance will be rewarded.',
    Aquarius: 'Innovation sparks fly. Think outside the box and embrace your unique perspective. Community efforts thrive under this energy.',
    Pisces: 'Creativity and compassion flow freely. Trust your artistic impulses and extend kindness to others — the universe returns it tenfold.',
  };
  return messages[sign] || 'Today is a day for intuition and compassion. Trust your inner voice and let your creativity flow freely.';
}

function getPlanetaryHourGlyph(): string {
  const hour = new Date().getHours();
  const day = new Date().getDay();
  // Simplified: cycle through planetary rulers
  const planets = ['☉', '☽', '♂', '☿', '♃', '♀', '♄'];
  const idx = (day * 24 + hour) % 7;
  return planets[idx];
}

function getPlanetaryHourName(): string {
  const hour = new Date().getHours();
  const day = new Date().getDay();
  const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const idx = (day * 24 + hour) % 7;
  return planets[idx];
}
