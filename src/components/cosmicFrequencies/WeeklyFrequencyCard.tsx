'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import {
  FREQUENCY_THEMES,
  getFrequenciesByTheme,
  isFrequencyTheme,
  requiresDisclaimer,
  type CosmicFrequency,
  type FrequencyTheme,
} from '@/data/cosmicFrequencies';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://align-api-v2-production.up.railway.app/api/v1';

interface WeeklySignature {
  theme: string;
  detail: string | null;
  is_health: boolean;
}

interface Props {
  /** Opens the frequency in the page's detail panel, applying the health gate. */
  onOpen: (freq: CosmicFrequency) => void;
}

/**
 * "This week's frequency" — the strongest theme from the user's own chart.
 *
 * Resolution here uses getFrequenciesByTheme, NOT getPushEligible. The
 * `verified` flag gates PUSH only; the library is browsable in-app either
 * way, and gating this card on it would leave it permanently empty while
 * content is still being sourced.
 */
export function WeeklyFrequencyCard({ onOpen }: Props) {
  const { t } = useTranslation();
  const profile = useAuthStore((s) => s.profile);
  const [signature, setSignature] = useState<WeeklySignature | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'nochart' | 'error'>('loading');

  useEffect(() => {
    let alive = true;

    if (!profile?.birth_date || profile.latitude == null || profile.longitude == null) {
      setState('nochart');
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/frequencies/weekly`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            birth_data: {
              name: profile.display_name || 'Friend',
              date: profile.birth_date,
              time: profile.birth_time || '12:00:00',
              location: profile.birth_location || '',
              latitude: profile.latitude,
              longitude: profile.longitude,
              timezone: profile.timezone || 'UTC',
              house_system: 'Whole Sign',
            },
          }),
        });
        if (!res.ok) throw new Error('request failed');
        const data = await res.json();
        if (!alive) return;
        setSignature(data.signature ?? null);
        setState('ready');
      } catch {
        if (alive) setState('error');
      }
    })();

    return () => { alive = false; };
  }, [profile]);

  if (state === 'nochart') {
    return (
      <div className="p-4 rounded-xl border border-border-primary bg-white/5 mb-6">
        <p className="text-sm text-text-muted">
          {t(
            'cosmicFrequencies.needsBirthData',
            'Add your birth date, time and place to see the frequency your chart points at this week.',
          )}
        </p>
      </div>
    );
  }

  if (state === 'loading') {
    return (
      <div className="p-4 rounded-xl border border-border-primary bg-white/5 mb-6">
        <div className="h-4 w-40 rounded bg-white/10 animate-pulse mb-2" />
        <div className="h-6 w-56 rounded bg-white/10 animate-pulse" />
      </div>
    );
  }

  if (state === 'error' || !signature || !isFrequencyTheme(signature.theme)) {
    return null; // A quiet week or an unreachable API — the library still stands alone.
  }

  const theme = signature.theme as FrequencyTheme;
  const meta = FREQUENCY_THEMES[theme];
  const freq = getFrequenciesByTheme(theme)[0];
  if (!freq) return null;

  return (
    <div
      className="p-5 rounded-2xl border mb-6"
      style={{
        borderColor: 'rgba(139,92,246,0.45)',
        background: 'linear-gradient(135deg, rgba(139,92,246,0.16), rgba(236,72,153,0.10))',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-accent-primary" />
        <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          {t('cosmicFrequencies.thisWeek', 'THIS WEEK')}
        </span>
      </div>

      <p className="text-sm text-text-secondary mb-3">
        {/* The pressure text itself still comes from the English dataset —
            it is translated with the content pass, not here. */}
        {t('cosmicFrequencies.pointsTo', {
          pressure: meta.pressure,
          defaultValue: 'Your chart points to {{pressure}}.',
        })}
        {signature.detail ? (
          <span className="text-text-muted"> ({signature.detail})</span>
        ) : null}
      </p>

      <button
        onClick={() => onOpen(freq)}
        className="text-left w-full p-3 rounded-xl bg-black/20 hover:bg-black/30 transition-colors"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-text-primary">{freq.title}</span>
          {requiresDisclaimer(freq) && (
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          )}
        </div>
        <p className="font-mono text-xl text-accent-primary tracking-wider">{freq.code}</p>
      </button>
    </div>
  );
}
