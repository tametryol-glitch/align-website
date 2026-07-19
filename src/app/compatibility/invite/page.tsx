'use client';

/**
 * Compatibility Invite Page — the viral loop landing page.
 *
 * Flow: User A shares a link like /compatibility/invite?from=USER_ID
 * → Friend B lands here → enters their birth data → sees compatibility result
 * → gets prompted to create an account to save it.
 */

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { CompatibilityCard } from '@/components/share';
import { getCompatSoulLine } from '@/lib/soulLines';
import Link from 'next/link';

const ZODIAC_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

interface CompatResult {
  overall: number;
  emotional: number;
  intellectual: number;
  passion: number;
  stability: number;
  fromName: string;
  fromSign: string;
  toSign: string;
}

export default function CompatibilityInviteWrapper() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0618' }}><p className="text-text-muted">{t('common.loading')}</p></div>}>
      <CompatibilityInvitePage />
    </Suspense>
  );
}

function CompatibilityInvitePage() {
  const { t } = useTranslation();
  const params = useSearchParams();
  const fromId = params.get('from');
  const fromName = params.get('name') || t('compatInvite.yourFriend');
  const fromSign = params.get('sign') || '';

  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [timezone, setTimezone] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompatResult | null>(null);
  const [yourSign, setYourSign] = useState('');
  const [error, setError] = useState('');

  async function handleCheck() {
    if (!birthDate) {
      setError(t('compatInvite.errorNoBirthDate'));
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Get their natal chart to find sun sign
      const chartData = await api.getNatalChart({
        birth_date: birthDate,
        birth_time: birthTime || '12:00',
        latitude: latitude ?? 0,
        longitude: longitude ?? 0,
        timezone: timezone || 'UTC',
        house_system: 'Whole Sign',
      });

      const planets = chartData?.planets || [];
      const sun = planets.find((p: any) => p.name === 'Sun');
      const sign = sun?.sign || 'Unknown';
      setYourSign(sign);

      // Generate a score based on element compatibility
      const score = generateElementScore(fromSign, sign);
      setResult({
        overall: score.overall,
        emotional: score.emotional,
        intellectual: score.intellectual,
        passion: score.passion,
        stability: score.stability,
        fromName,
        fromSign,
        toSign: sign,
      });
    } catch (err: any) {
      setError(t('compatInvite.errorCalc'));
    } finally {
      setLoading(false);
    }
  }

  // Simple element-based scoring for the invite flow
  function generateElementScore(sign1: string, sign2: string): { overall: number; emotional: number; intellectual: number; passion: number; stability: number } {
    const elements: Record<string, string> = {
      Aries: 'fire', Taurus: 'earth', Gemini: 'air', Cancer: 'water',
      Leo: 'fire', Virgo: 'earth', Libra: 'air', Scorpio: 'water',
      Sagittarius: 'fire', Capricorn: 'earth', Aquarius: 'air', Pisces: 'water',
    };
    const e1 = elements[sign1] || 'fire';
    const e2 = elements[sign2] || 'fire';
    const pair = [e1, e2].sort().join('-');
    const base: Record<string, number> = {
      'fire-fire': 78, 'air-fire': 82, 'earth-water': 80, 'air-air': 76,
      'water-water': 84, 'earth-earth': 75, 'earth-fire': 58, 'air-water': 62,
      'fire-water': 65, 'air-earth': 60,
    };
    const b = base[pair] ?? 70;
    // Add some variance based on sign names
    const v = ((sign1.charCodeAt(0) + sign2.charCodeAt(0)) % 15) - 7;
    const clamp = (n: number) => Math.max(35, Math.min(98, n));
    return {
      overall: clamp(b + v),
      emotional: clamp(b + v + ((sign1.charCodeAt(1) || 0) % 10) - 5),
      intellectual: clamp(b + v - ((sign2.charCodeAt(1) || 0) % 8) + 3),
      passion: clamp(b + v + ((sign1.charCodeAt(2) || 0) % 12) - 6),
      stability: clamp(b + v - ((sign2.charCodeAt(2) || 0) % 10) + 4),
    };
  }

  if (result) {
    const soulLine = getCompatSoulLine(result.fromSign, result.toSign);
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
        style={{ background: 'linear-gradient(160deg, #0a0618 0%, #110d2b 40%, #1a1040 70%, #0a0618 100%)' }}
      >
        <div className="mb-6 transform hover:scale-[1.02] transition-transform duration-300">
          <CompatibilityCard
            user1Name={result.fromName}
            user1Sign={result.fromSign}
            user2Name={t('compatInvite.you')}
            user2Sign={result.toSign}
            percentage={result.overall}
            aspect="story"
          />
        </div>

        <div className="text-center max-w-sm">
          <p className="text-sm italic text-purple-300/70 mb-4">&ldquo;{soulLine}&rdquo;</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{t('compatInvite.emotional')}</p>
              <p className="text-lg font-bold text-text-primary">{result.emotional}%</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{t('compatInvite.passion')}</p>
              <p className="text-lg font-bold text-text-primary">{result.passion}%</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{t('compatInvite.intellectual')}</p>
              <p className="text-lg font-bold text-text-primary">{result.intellectual}%</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{t('compatInvite.stability')}</p>
              <p className="text-lg font-bold text-text-primary">{result.stability}%</p>
            </div>
          </div>

          <Link
            href="/onboarding"
            className="block w-full py-3.5 rounded-xl bg-accent-primary text-white font-semibold text-center hover:bg-accent-primary/90 transition-colors mb-3"
          >
            {t('compatInvite.getFullChart')}
          </Link>
          <Link href="/auth" className="text-sm text-text-muted hover:text-text-primary transition-colors">
            {t('compatInvite.haveAccount')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(160deg, #0a0618 0%, #110d2b 40%, #1a1040 70%, #0a0618 100%)' }}
    >
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-accent-primary uppercase tracking-[0.2em] mb-2">✦ ALIGN ✦</p>
          <h1 className="text-2xl font-bold text-text-primary mb-2">{t('compatInvite.title')}</h1>
          {fromName && fromSign && (
            <p className="text-sm text-text-muted">
              {t('compatInvite.inviteWithSign', { name: fromName, glyph: ZODIAC_GLYPHS[fromSign] || '', sign: fromSign })}
            </p>
          )}
          {fromName && !fromSign && (
            <p className="text-sm text-text-muted">{t('compatInvite.inviteNoSign', { name: fromName })}</p>
          )}
        </div>

        {/* Birth date input */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">{t('compatInvite.birthDateLabel')}</label>
            <input
              type="date"
              min="1900-01-01"
              max={new Date().toISOString().split('T')[0]}
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="input w-full text-center"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">{t('compatInvite.birthTimeLabel')}</label>
            <input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className="input w-full text-center"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            onClick={handleCheck}
            disabled={loading || !birthDate}
            className="w-full py-3.5 rounded-xl bg-accent-primary text-white font-semibold hover:bg-accent-primary/90 transition-colors disabled:opacity-40"
          >
            {loading ? t('compatInvite.calculating') : t('compatInvite.seeCompatibility')}
          </button>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          {t('compatInvite.poweredBy')}
        </p>
      </div>
    </div>
  );
}
