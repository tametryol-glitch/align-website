'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { getDatingMatches, type DatingMatch } from '@/lib/datingDiscoveryService';
import { getTimingForMatch, type CosmicTimingWindow } from '@/lib/cosmicTimingService';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

const QUALITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  excellent: { color: '#4ADE80', bg: 'rgba(74,222,128,0.08)', label: 'Excellent' },
  good: { color: '#60A5FA', bg: 'rgba(96,165,250,0.08)', label: 'Good' },
  neutral: { color: '#A8B0C0', bg: 'rgba(168,176,192,0.08)', label: 'Neutral' },
  challenging: { color: '#F87171', bg: 'rgba(248,113,113,0.08)', label: 'Challenging' },
};

const PLANET_ICONS: Record<string, string> = {
  Venus: '♀', Mars: '♂', Moon: '☽', Jupiter: '♃',
};

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${s.toLocaleDateString(undefined, opts)} — ${e.toLocaleDateString(undefined, opts)}`;
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}

export default function CosmicTimingPage() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuthStore();
  const [matches, setMatches] = useState<DatingMatch[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [windows, setWindows] = useState<CosmicTimingWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [timingLoading, setTimingLoading] = useState(false);

  const loadMatches = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const m = await getDatingMatches(user.id);
    setMatches(m);
    if (m.length > 0) {
      setSelectedMatchId(m[0].id);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && user) loadMatches();
  }, [authLoading, user, loadMatches]);

  useEffect(() => {
    if (!user?.id || !selectedMatchId) return;
    let cancelled = false;
    setTimingLoading(true);
    getTimingForMatch(user.id, selectedMatchId).then(w => {
      if (!cancelled) {
        setWindows(w);
        setTimingLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [user?.id, selectedMatchId]);

  return (
    <div className="max-w-2xl mx-auto" style={{ minHeight: '100vh' }}>
      <Link href="/dating/matches" className="inline-flex items-center gap-1 text-sm text-accent-primary mb-4">
        <ArrowLeft size={16} /> {t('dating.timing.backToMatches')}
      </Link>

      <div className="text-center mb-6">
        <Sparkles size={28} color="#FACC15" className="mx-auto mb-2" />
        <h1 className="text-2xl font-bold text-white mb-1">{t('dating.timing.title')}</h1>
        <p className="text-sm text-text-tertiary max-w-xs mx-auto">
          {t('dating.timing.subtitle')}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-tertiary mb-3">{t('dating.timing.noMatchHint')}</p>
          <Link href="/dating" className="text-accent-primary text-sm font-medium">
            {t('dating.timing.browsePicks')}
          </Link>
        </div>
      ) : (
        <>
          {/* Match selector */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
            {matches.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMatchId(m.id)}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
                style={{
                  backgroundColor: selectedMatchId === m.id ? 'rgba(155,111,246,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${selectedMatchId === m.id ? 'rgba(155,111,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  color: selectedMatchId === m.id ? '#C4B5FD' : '#A8B0C0',
                }}
              >
                {m.partner_profile?.display_name || 'Match'}
              </button>
            ))}
          </div>

          {/* Timing windows */}
          {timingLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
            </div>
          ) : windows.length === 0 ? (
            <p className="text-center text-text-tertiary py-8">{t('dating.timing.noWindows')}</p>
          ) : (
            <div className="space-y-4">
              {windows.map(w => {
                const cfg = QUALITY_CONFIG[w.quality] || QUALITY_CONFIG.neutral;
                const days = daysUntil(w.startDate);
                return (
                  <div
                    key={w.id}
                    className="rounded-2xl p-5"
                    style={{
                      backgroundColor: cfg.bg,
                      border: `1px solid ${cfg.color}33`,
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl" style={{ color: cfg.color }}>
                          {PLANET_ICONS[w.planet] || '★'}
                        </span>
                        <div>
                          <h3 className="text-white font-semibold">
                            {w.planet} {w.aspect.charAt(0).toUpperCase() + w.aspect.slice(1)}
                          </h3>
                          <p className="text-xs text-text-muted">
                            {formatDateRange(w.startDate, w.endDate)}
                          </p>
                        </div>
                      </div>
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: `${cfg.color}1A`, color: cfg.color }}
                      >
                        {days === 0 ? 'Now' : `In ${days}d`}
                      </span>
                    </div>

                    <p className="text-sm text-text-secondary mb-2">{w.description}</p>

                    <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: `${cfg.color}1A`, color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                      <p className="text-xs text-text-muted flex-1">{w.advice}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
