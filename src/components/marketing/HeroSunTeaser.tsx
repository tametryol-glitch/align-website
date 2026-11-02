'use client';

// "See your Sun sign now" — value before the account wall. A date alone is
// enough for a Sun sign, so this gives a real answer in two taps and then
// asks for the time and place (which unlock Moon and Rising) inside signup.

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export const PREFILL_BIRTH_DATE_KEY = 'align_prefill_birth_date';

const SIGNS = ['Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius'];
const CUTOFFS = [20, 19, 20, 20, 21, 21, 22, 23, 23, 23, 22, 22];
const GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

/** Sun sign from the written date. Parts are read off the string because
 *  `new Date('1992-03-20')` is UTC midnight and flips cusp days back a day
 *  in the Americas. `cusp` is true within a day of a sign change, where the
 *  exact time and place decide the answer. */
function sunFromDate(value: string): { sign: string; cusp: boolean } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  const day = Number(m[3]);
  if (year < 1900 || year > new Date().getFullYear() || month < 0 || month > 11 || day < 1 || day > 31) return null;
  const cutoff = CUTOFFS[month];
  const sign = day < cutoff ? SIGNS[month] : SIGNS[(month + 1) % 12];
  return { sign, cusp: Math.abs(day - cutoff) <= 1 };
}

export function HeroSunTeaser() {
  const { t } = useTranslation();
  const [date, setDate] = useState('');
  const sun = sunFromDate(date);

  function rememberDate() {
    try {
      localStorage.setItem(PREFILL_BIRTH_DATE_KEY, date);
    } catch {
      // Private mode: they just type it again in onboarding.
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-md rounded-2xl border border-border-primary bg-bg-card/60 p-5 text-left backdrop-blur">
      <label htmlFor="hero-birth-date" className="block text-sm font-medium text-text-secondary mb-2">
        {t('landing.sunTeaser.label', 'Enter your birth date to see your Sun sign')}
      </label>
      <input
        id="hero-birth-date"
        type="date"
        value={date}
        min="1900-01-01"
        max={new Date().toISOString().slice(0, 10)}
        onChange={(e) => setDate(e.target.value)}
        className="input w-full"
      />

      {sun && (
        <div className="mt-4 text-center">
          <p className="text-4xl mb-1">{GLYPHS[sun.sign]}</p>
          <p className="text-xl font-display font-bold text-text-primary">{sun.sign} Sun</p>
          <p className="text-sm text-text-secondary mt-2 leading-relaxed">
            {t('onboarding.sunSoul.' + sun.sign)}
          </p>
          {sun.cusp && (
            <p className="text-xs text-gold-primary mt-2">
              {t(
                'landing.sunTeaser.cusp',
                'You were born close to a sign change, so your exact time and place decide this one.',
              )}
            </p>
          )}
          <Link
            href="/auth/signup"
            onClick={rememberDate}
            className="btn-primary mt-4 inline-block px-6 py-2.5"
          >
            {t('landing.sunTeaser.cta', 'Unlock my Moon & Rising — free')}
          </Link>
        </div>
      )}
    </div>
  );
}
