'use client';

import { useState, useMemo } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { ArrowLeft, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { PaywallGate } from '@/components/ui/PaywallGate';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

interface ArabicPart {
  name: string;
  sign: string;
  degree: number;
  house: number;
  longitude: number;
  formula: string;
  meaning: string;
}

// Arabic Parts formulas matching AstroEinstein desktop exactly
// [name, ref, body1, body2, nightReverse, formula_desc, meaning]
const ARABIC_PARTS_FORMULAS: Array<[string, string, string, string, boolean, string, string]> = [
  ['Part of Fortune',    'Ascendant', 'Moon',    'Sun',     true,  'ASC + Moon - Sun (day) / ASC + Sun - Moon (night)', 'Material prosperity, worldly success, and where joy flows naturally'],
  ['Part of Spirit',     'Ascendant', 'Sun',     'Moon',    true,  'ASC + Sun - Moon (day) / ASC + Moon - Sun (night)', 'Spiritual purpose, conscious intention, and soul direction'],
  ['Part of Eros (Love)','Ascendant', 'Venus',   'Sun',     true,  'ASC + Venus - Sun', 'Romantic attraction, love style, and what draws love to you'],
  ['Part of Necessity',  'Ascendant', 'Mercury', 'Moon',    true,  'ASC + Mercury - Moon', 'Obligations, necessities, and what must be done'],
  ['Part of Courage',    'Ascendant', 'Mars',    'Moon',    true,  'ASC + Mars - Moon', 'Bravery, willpower, and fighting spirit'],
  ['Part of Victory',    'Ascendant', 'Jupiter', 'Moon',    true,  'ASC + Jupiter - Moon', 'Success, triumph, and overcoming obstacles'],
  ['Part of Nemesis',    'Ascendant', 'Saturn',  'Moon',    true,  'ASC + Saturn - Moon', 'Karmic reckoning, hidden enemies, and the undoing'],
  ['Part of Marriage (F)','Ascendant','Saturn',  'Venus',   false, 'ASC + Saturn - Venus', 'Marriage timing and commitment (feminine)'],
  ['Part of Marriage (M)','Ascendant','Venus',   'Saturn',  false, 'ASC + Venus - Saturn', 'Marriage timing and commitment (masculine)'],
  ['Part of Children',   'Ascendant', 'Jupiter', 'Saturn',  false, 'ASC + Jupiter - Saturn', 'Fertility, children, and creative offspring'],
  ['Part of Father',     'Ascendant', 'Sun',     'Saturn',  false, 'ASC + Sun - Saturn', 'Relationship with father and paternal influence'],
  ['Part of Mother',     'Ascendant', 'Moon',    'Venus',   false, 'ASC + Moon - Venus', 'Relationship with mother and maternal influence'],
  ['Part of Siblings',   'Ascendant', 'Saturn',  'Jupiter', false, 'ASC + Saturn - Jupiter', 'Siblings and family bonds'],
  ['Part of Friends',    'Ascendant', 'Moon',    'Mercury', false, 'ASC + Moon - Mercury', 'Friendships, social networks, and allies'],
  ['Part of Career',     'Ascendant', 'Saturn',  'Sun',     false, 'ASC + Saturn - Sun', 'Career direction and professional calling'],
  ['Part of Commerce',   'Ascendant', 'Mercury', 'Sun',     false, 'ASC + Mercury - Sun', 'Business acumen, trade, and commercial success'],
  ['Part of Death',      'Ascendant', 'Saturn',  'Moon',    true,  'ASC + Saturn - Moon', 'Transformation, endings, and life transitions'],
  ['Part of Illness',    'Ascendant', 'Saturn',  'Mars',    false, 'ASC + Saturn - Mars', 'Health vulnerabilities and illness patterns'],
  ['Part of Passion',    'Ascendant', 'Mars',    'Sun',     false, 'ASC + Mars - Sun', 'Sexual desire, passion, and raw drive'],
  ['Part of Desire',     'Ascendant', 'Venus',   'Mars',    false, 'ASC + Venus - Mars', 'Deep desires and what you crave'],
  ['Part of Faith',      'Ascendant', 'Moon',    'Mercury', true,  'ASC + Moon - Mercury', 'Spiritual beliefs, faith, and devotion'],
  ['Part of Intelligence','Ascendant','Mercury', 'Moon',    false, 'ASC + Mercury - Moon', 'Mental acuity and intellectual gifts'],
  ['Part of Honor',      'Ascendant', 'Sun',     'Jupiter', false, 'ASC + Sun - Jupiter', 'Public honor, respect, and recognition'],
  ['Part of Increase',   'Ascendant', 'Jupiter', 'Sun',     false, 'ASC + Jupiter - Sun', 'Abundance, growth, and expansion'],
  ['Part of Travel',     'Ascendant', 'Saturn',  'Mercury', false, 'ASC + Saturn - Mercury', 'Long-distance travel and foreign connections'],
  ['Part of Catastrophe','Ascendant', 'Saturn',  'Sun',     true,  'ASC + Saturn - Sun', 'Crisis points and major life disruptions'],
  ['Part of Inheritance','Ascendant', 'Saturn',  'Moon',    false, 'ASC + Saturn - Moon', 'Inherited wealth, legacy, and family resources'],
  ['Part of Mastery',    'Ascendant', 'Mars',    'Saturn',  false, 'ASC + Mars - Saturn', 'Skill mastery, discipline, and craft'],
  ['Part of Attraction', 'Ascendant', 'Venus',   'Moon',    false, 'ASC + Venus - Moon', 'What attracts others to you'],
  ['Part of Sexuality',  'Ascendant', 'Venus',   'Sun',     false, 'ASC + Venus - Sun', 'Sexual magnetism and erotic nature'],
];

const KEY_PARTS = ['Part of Fortune', 'Part of Spirit', 'Part of Eros (Love)', 'Part of Marriage (F)', 'Part of Marriage (M)'];

// Interpretations per sign
const SIGN_INTERP: Record<string, Record<string, string>> = {
  'Part of Fortune': {
    Aries: 'Fortune comes through bold initiative, pioneering action, and being first.',
    Taurus: 'Fortune comes through patience, tangible assets, and building lasting value.',
    Gemini: 'Fortune comes through communication, versatility, and intellectual connections.',
    Cancer: 'Fortune comes through nurturing, emotional intelligence, and creating safety.',
    Leo: 'Fortune comes through creative self-expression, leadership, and being seen.',
    Virgo: 'Fortune comes through service, precision, and practical expertise.',
    Libra: 'Fortune comes through partnerships, diplomacy, and creating beauty.',
    Scorpio: 'Fortune comes through transformation, research, and managing shared resources.',
    Sagittarius: 'Fortune comes through expansion, travel, teaching, and philosophical vision.',
    Capricorn: 'Fortune comes through discipline, structure, and long-term strategy.',
    Aquarius: 'Fortune comes through innovation, community, and humanitarian vision.',
    Pisces: 'Fortune comes through intuition, compassion, and spiritual connection.',
  },
  'Part of Spirit': {
    Aries: 'Your spirit is activated through courageous action and independent initiative.',
    Taurus: 'Your spirit is activated through grounding in nature and cultivating peace.',
    Gemini: 'Your spirit is activated through learning, communicating truth, and connecting ideas.',
    Cancer: 'Your spirit is activated through emotional depth and honoring your roots.',
    Leo: 'Your spirit is activated through creative expression and generous self-giving.',
    Virgo: 'Your spirit is activated through sacred service and devotion to craft.',
    Libra: 'Your spirit is activated through relationship harmony and justice.',
    Scorpio: 'Your spirit is activated through transformation and fearless truth-seeking.',
    Sagittarius: 'Your spirit is activated through philosophical exploration and expanded consciousness.',
    Capricorn: 'Your spirit is activated through mastery, discipline, and building lasting structures.',
    Aquarius: 'Your spirit is activated through liberation, innovation, and service to humanity.',
    Pisces: 'Your spirit is activated through mystical experience and universal compassion.',
  },
  'Part of Eros (Love)': {
    Aries: 'Love ignites through passion, pursuit, and bold romantic gestures.',
    Taurus: 'Love grows through sensuality, loyalty, and physical affection.',
    Gemini: 'Love sparks through intellectual connection and witty conversation.',
    Cancer: 'Love deepens through emotional vulnerability and nurturing.',
    Leo: 'Love blazes through dramatic gestures and heartfelt generosity.',
    Virgo: 'Love manifests through devoted acts of service and thoughtful attention.',
    Libra: 'Love blossoms through beauty, romance, and harmonious partnership.',
    Scorpio: 'Love transforms through intensity, depth, and soul-merging.',
    Sagittarius: 'Love adventures through freedom, exploration, and shared philosophy.',
    Capricorn: 'Love endures through commitment, ambition, and building together.',
    Aquarius: 'Love liberates through friendship, individuality, and shared ideals.',
    Pisces: 'Love transcends through spiritual connection and unconditional acceptance.',
  },
  'Part of Career': {
    Aries: 'Career thrives through leadership and initiative.',
    Taurus: 'Career thrives through steady building and finance.',
    Gemini: 'Career thrives through communication and media.',
    Cancer: 'Career thrives through nurturing and care industries.',
    Leo: 'Career thrives through creative expression and performance.',
    Virgo: 'Career thrives through analysis, health, and service.',
    Libra: 'Career thrives through partnership, law, and art.',
    Scorpio: 'Career thrives through research, psychology, and transformation.',
    Sagittarius: 'Career thrives through education, travel, and publishing.',
    Capricorn: 'Career thrives through management, structure, and tradition.',
    Aquarius: 'Career thrives through technology and innovation.',
    Pisces: 'Career thrives through healing, art, and spiritual work.',
  },
};

// House interpretations (generic)
const HOUSE_INTERP: Record<number, string> = {
  1: 'Activates through personal identity and self-expression.',
  2: 'Activates through finances, values, and material security.',
  3: 'Activates through communication, learning, and local connections.',
  4: 'Activates through home, family, and emotional roots.',
  5: 'Activates through creativity, romance, and self-expression.',
  6: 'Activates through service, health, and daily routines.',
  7: 'Activates through partnerships and one-on-one relationships.',
  8: 'Activates through shared resources, transformation, and depth.',
  9: 'Activates through education, travel, and philosophical expansion.',
  10: 'Activates through career, reputation, and public achievement.',
  11: 'Activates through community, networks, and future vision.',
  12: 'Activates through spirituality, solitude, and the unconscious.',
};

function getLon(planets: any[], name: string): number | null {
  const p = planets.find((pl: any) => (pl.name || pl.planet) === name);
  return p ? (p.longitude ?? null) : null;
}

function getHouseForLon(lon: number, ascLon: number): number {
  const ascSignIdx = Math.floor(ascLon / 30) % 12;
  const lonSignIdx = Math.floor(lon / 30) % 12;
  return ((lonSignIdx - ascSignIdx + 12) % 12) + 1;
}

export default function ArabicPartsPage() {
  const { profile } = useAuthStore();
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedPart, setExpandedPart] = useState<string | null>(null);

  // Calculate Arabic Parts from chart data
  // ALL hooks must be above the early return to satisfy React rules-of-hooks
  const arabicParts: ArabicPart[] = useMemo(() => {
    if (!chartData) return [];
    const planets = chartData?.planets || chartData?.positions || [];
    if (planets.length === 0) return [];

    const ascLon = getLon(planets, 'Ascendant') ?? getLon(planets, 'ASC');
    if (ascLon === null) return [];

    // Day/night: Sun in houses 7-12 = day chart
    const sunLon = getLon(planets, 'Sun');
    const sunHouse = sunLon !== null ? getHouseForLon(sunLon, ascLon) : 1;
    const isDayChart = sunHouse >= 7;

    const parts: ArabicPart[] = [];
    for (const [name, refName, body1Name, body2Name, nightReverse, formula, meaning] of ARABIC_PARTS_FORMULAS) {
      const mcLon = getLon(planets, 'MC') ?? getLon(planets, 'Midheaven');
      const ref = refName === 'MC' ? mcLon : ascLon;
      let b1 = getLon(planets, body1Name);
      let b2 = getLon(planets, body2Name);
      if (ref === null || b1 === null || b2 === null) continue;

      if (nightReverse && !isDayChart) {
        const temp = b1;
        b1 = b2;
        b2 = temp;
      }
      const lon = ((ref + b1 - b2) % 360 + 360) % 360;
      const signIdx = Math.floor(lon / 30) % 12;
      const degInSign = lon % 30;
      const house = getHouseForLon(lon, ascLon);

      parts.push({ name, sign: SIGNS[signIdx], degree: degInSign, house, longitude: lon, formula, meaning });
    }
    return parts;
  }, [chartData]);

  // Pattern analysis
  const patterns = useMemo(() => {
    if (arabicParts.length === 0) return null;
    const signCounts: Record<string, number> = {};
    const houseCounts: Record<number, number> = {};
    for (const p of arabicParts) {
      signCounts[p.sign] = (signCounts[p.sign] || 0) + 1;
      houseCounts[p.house] = (houseCounts[p.house] || 0) + 1;
    }
    const topSign = Object.entries(signCounts).sort((a, b) => b[1] - a[1])[0];
    const topHouse = Object.entries(houseCounts).sort((a, b) => b[1] - a[1])[0];
    return { topSign, topHouse };
  }, [arabicParts]);

  const keyParts = arabicParts.filter(p => KEY_PARTS.includes(p.name));
  const otherParts = arabicParts.filter(p => !KEY_PARTS.includes(p.name));

  if (!profile?.birth_date || !profile?.latitude) {
    return <PaywallGate feature="arabic_parts" fallbackTier="pro"><BirthDataPrompt message="Add your birth data to calculate your Arabic Parts (Lots)." /></PaywallGate>;
  }

  async function getReading() {
    setLoading(true);
    setError('');
    try {
      const data = await api.getNatalChart(buildBirthData(profile!));
      setChartData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load chart');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PaywallGate feature="arabic_parts" fallbackTier="pro">
    <div className="max-w-3xl mx-auto">
      <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to Readings
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <Star className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Arabic Parts</h1>
          <p className="text-text-tertiary text-sm">29 ancient lots calculated from your birth chart</p>
        </div>
      </div>

      {!chartData && !loading && (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-4">✡</span>
          <p className="text-text-tertiary mb-2">
            Arabic Parts (Lots) are ancient mathematical points that reveal hidden dimensions of your destiny.
            Each one is calculated from the relationship between your Ascendant and two planetary bodies.
          </p>
          <p className="text-text-muted text-xs mb-6">
            29 lots with day/night reversal for precise calculation
          </p>
          <button onClick={getReading} disabled={loading} className="btn-primary">
            Calculate My Arabic Parts
          </button>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>
      )}

      {loading && <LoadingCosmic label="Calculating 29 Arabic Parts..." />}

      {arabicParts.length > 0 && (
        <div className="space-y-5">
          {/* Day/Night indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
            <span>{(() => { const planets = chartData?.planets || chartData?.positions || []; const ascLon = getLon(planets, 'Ascendant') ?? getLon(planets, 'ASC') ?? 0; const sunLon = getLon(planets, 'Sun') ?? 0; const sunHouse = getHouseForLon(sunLon, ascLon); return sunHouse >= 7 ? '☀️ Day Chart' : '🌙 Night Chart'; })()}</span>
            <span className="text-text-muted/50">|</span>
            <span>{arabicParts.length} parts calculated</span>
          </div>

          {/* Pattern highlights */}
          {patterns && (
            <div className="card bg-gradient-cosmic border-accent-muted">
              <h3 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                <span className="text-lg">📊</span> Patterns
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {patterns.topSign && (
                  <div className="text-center p-3 bg-bg-tertiary rounded-xl">
                    <p className="text-xs text-text-muted">Most Active Sign</p>
                    <p className="text-sm font-semibold text-text-primary">{patterns.topSign[0]}</p>
                    <p className="text-[10px] text-accent-primary">{patterns.topSign[1]} parts</p>
                  </div>
                )}
                {patterns.topHouse && (
                  <div className="text-center p-3 bg-bg-tertiary rounded-xl">
                    <p className="text-xs text-text-muted">Most Active House</p>
                    <p className="text-sm font-semibold text-text-primary">House {patterns.topHouse[0]}</p>
                    <p className="text-[10px] text-accent-primary">{patterns.topHouse[1]} parts</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Key Parts */}
          {keyParts.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <span className="text-lg">🔑</span> Key Parts
              </h3>
              <div className="space-y-2">
                {keyParts.map((part) => (
                  <PartCard key={part.name} part={part} expanded={expandedPart === part.name} onToggle={() => setExpandedPart(expandedPart === part.name ? null : part.name)} isKey />
                ))}
              </div>
            </div>
          )}

          {/* Other Parts */}
          {otherParts.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <span className="text-lg">✨</span> All Parts ({otherParts.length})
              </h3>
              <div className="space-y-2">
                {otherParts.map((part) => (
                  <PartCard key={part.name} part={part} expanded={expandedPart === part.name} onToggle={() => setExpandedPart(expandedPart === part.name ? null : part.name)} />
                ))}
              </div>
            </div>
          )}

          <button onClick={() => { setChartData(null); setExpandedPart(null); }} className="btn-secondary w-full">
            Recalculate
          </button>
        </div>
      )}
    </div>
    </PaywallGate>
  );
}

function PartCard({ part, expanded, onToggle, isKey }: { part: ArabicPart; expanded: boolean; onToggle: () => void; isKey?: boolean }) {
  const signInterp = SIGN_INTERP[part.name]?.[part.sign];
  const houseInterp = HOUSE_INTERP[part.house];

  return (
    <div className={`border rounded-xl overflow-hidden ${isKey ? 'border-accent-muted bg-accent-muted/5' : 'border-border-primary'}`}>
      <button onClick={onToggle} className="w-full p-3 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isKey && <span className="text-[9px] font-bold text-accent-primary bg-accent-muted px-1.5 py-0.5 rounded">KEY</span>}
            <span className="text-sm font-medium text-text-primary">{part.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-accent-primary font-medium">
              {part.degree.toFixed(1)}° {part.sign}
            </span>
            <span className="text-[10px] text-text-muted">H{part.house}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5 text-text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-text-muted" />}
          </div>
        </div>
        <p className="text-[11px] text-text-muted mt-0.5">{part.meaning}</p>
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-border-primary space-y-2 animate-in fade-in duration-300">
          {signInterp && (
            <div>
              <p className="text-[10px] uppercase text-text-muted font-semibold mb-0.5">In {part.sign}</p>
              <p className="text-xs text-text-secondary">{signInterp}</p>
            </div>
          )}
          {houseInterp && (
            <div>
              <p className="text-[10px] uppercase text-text-muted font-semibold mb-0.5">House {part.house}</p>
              <p className="text-xs text-text-secondary">{houseInterp}</p>
            </div>
          )}
          <div className="bg-bg-tertiary rounded-lg p-2">
            <p className="text-[10px] uppercase text-text-muted font-semibold mb-0.5">Formula</p>
            <p className="text-xs text-text-tertiary font-mono">{part.formula}</p>
          </div>
        </div>
      )}
    </div>
  );
}
