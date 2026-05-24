'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { getDatingMatches, type DatingMatch } from '@/lib/datingDiscoveryService';
import { generateDateSuggestions, type DateSuggestion } from '@/lib/dateNightService';
import { createClient } from '@/lib/supabase';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const CATEGORY_COLORS: Record<string, string> = {
  adventure: '#F59E0B',
  culture: '#8B5CF6',
  nature: '#10B981',
  food: '#EF4444',
  creative: '#EC4899',
  intimate: '#6366F1',
};

export default function DatePlannerPage() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuthStore();
  const [matches, setMatches] = useState<DatingMatch[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<DateSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMatches = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const m = await getDatingMatches(user.id);
    setMatches(m);
    if (m.length > 0) setSelectedMatchId(m[0].id);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && user) loadMatches();
  }, [authLoading, user, loadMatches]);

  const loadSuggestions = useCallback(async () => {
    if (!user?.id || !selectedMatchId) return;
    const match = matches.find(m => m.id === selectedMatchId);
    if (!match) return;

    const supabase = createClient();
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, sun_sign')
      .in('id', [user.id, match.partner_profile?.id].filter(Boolean));

    if (!profiles || profiles.length < 2) {
      setSuggestions(generateDateSuggestions(null, null, 4));
      return;
    }

    const mySign = profiles.find((p: any) => p.id === user.id)?.sun_sign;
    const partnerSign = profiles.find((p: any) => p.id !== user.id)?.sun_sign;
    setSuggestions(generateDateSuggestions(mySign, partnerSign, 6));
  }, [user?.id, selectedMatchId, matches]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const refresh = () => loadSuggestions();

  return (
    <div className="max-w-2xl mx-auto" style={{ minHeight: '100vh' }}>
      <Link href="/dating/matches" className="inline-flex items-center gap-1 text-sm text-accent-primary mb-4">
        <ArrowLeft size={16} /> {t('dating.datePlanner.backToMatches')}
      </Link>

      <div className="text-center mb-6">
        <span className="text-3xl block mb-2">🌙</span>
        <h1 className="text-2xl font-bold text-white mb-1">{t('dating.datePlanner.title')}</h1>
        <p className="text-sm text-text-tertiary max-w-xs mx-auto">
          {t('dating.datePlanner.subtitle')}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-tertiary mb-3">{t('dating.datePlanner.noMatchHint')}</p>
          <Link href="/dating" className="text-accent-primary text-sm font-medium">{t('dating.datePlanner.browsePicks')}</Link>
        </div>
      ) : (
        <>
          {/* Match selector */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
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

          {/* Refresh */}
          <div className="flex justify-end mb-4">
            <button
              onClick={refresh}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-primary transition-colors"
            >
              <RefreshCw size={14} /> {t('dating.datePlanner.shuffleIdeas')}
            </button>
          </div>

          {/* Suggestions grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {suggestions.map(s => {
              const catColor = CATEGORY_COLORS[s.category] || '#9B6FF6';
              return (
                <div
                  key={s.id}
                  className="rounded-2xl p-5 transition-transform hover:scale-[1.02]"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{s.icon}</span>
                    <span
                      className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${catColor}1A`, color: catColor }}
                    >
                      {s.category}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold mb-1.5">{s.title}</h3>
                  <p className="text-sm text-text-tertiary leading-relaxed">{s.description}</p>
                  {s.elementMatch !== 'mixed' && (
                    <div className="mt-3 flex items-center gap-1.5">
                      <span className="text-xs text-text-muted">
                        {s.elementMatch.charAt(0).toUpperCase() + s.elementMatch.slice(1)} energy
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
