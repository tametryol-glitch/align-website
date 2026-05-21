'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getDatingMatches, type DatingMatch } from '@/lib/datingDiscoveryService';
import { getCoachInsight, getCoachHistory, type CoachInsight } from '@/lib/datingCoachService';
import { ArrowLeft, Sparkles, Send } from 'lucide-react';
import Link from 'next/link';

export default function RelationshipCoachPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const [matches, setMatches] = useState<DatingMatch[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [history, setHistory] = useState<CoachInsight[]>([]);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

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

  useEffect(() => {
    if (!selectedMatchId) return;
    getCoachHistory(selectedMatchId).then(setHistory);
  }, [selectedMatchId]);

  const handleAsk = async () => {
    if (!user?.id || !selectedMatchId || generating) return;
    setGenerating(true);
    const insight = await getCoachInsight(user.id, selectedMatchId, topic || undefined);
    if (insight) {
      setHistory(prev => [...prev, insight]);
    }
    setTopic('');
    setGenerating(false);
  };

  return (
    <div className="max-w-2xl mx-auto" style={{ minHeight: '100vh' }}>
      <Link href="/dating/matches" className="inline-flex items-center gap-1 text-sm text-accent-primary mb-4">
        <ArrowLeft size={16} /> Back to Matches
      </Link>

      <div className="text-center mb-6">
        <Sparkles size={28} color="#EC4899" className="mx-auto mb-2" />
        <h1 className="text-2xl font-bold text-white mb-1">Relationship Coach</h1>
        <p className="text-sm text-text-tertiary max-w-xs mx-auto">
          AI-powered insights based on your astrological dynamics
        </p>
        <p className="text-xs text-text-muted mt-1">Premium feature</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-tertiary mb-3">Match with someone to get coaching insights.</p>
          <Link href="/dating" className="text-accent-primary text-sm font-medium">Browse Picks</Link>
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
                  backgroundColor: selectedMatchId === m.id ? 'rgba(236,72,153,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${selectedMatchId === m.id ? 'rgba(236,72,153,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  color: selectedMatchId === m.id ? '#F9A8D4' : '#A8B0C0',
                }}
              >
                {m.partner_profile?.display_name || 'Match'}
              </button>
            ))}
          </div>

          {/* Ask a question */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Ask about communication, conflict, intimacy..."
              className="flex-1 px-4 py-3 rounded-2xl text-sm text-white placeholder-text-muted outline-none"
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onKeyDown={e => e.key === 'Enter' && handleAsk()}
            />
            <button
              onClick={handleAsk}
              disabled={generating}
              className="px-4 py-3 rounded-2xl text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)' }}
            >
              {generating ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>

          {/* Insight history */}
          <div className="space-y-4">
            {history.length === 0 && !generating && (
              <p className="text-center text-text-muted text-sm py-8">
                Ask your first question or tap Send for a general insight.
              </p>
            )}
            {[...history].reverse().map((insight, i) => (
              <div
                key={i}
                className="rounded-2xl p-5"
                style={{
                  backgroundColor: 'rgba(236,72,153,0.04)',
                  border: '1px solid rgba(236,72,153,0.15)',
                }}
              >
                {insight.topic !== 'general' && (
                  <p className="text-xs text-pink-400 font-medium mb-2">{insight.topic}</p>
                )}
                <p className="text-sm text-text-secondary leading-relaxed">{insight.insight}</p>
                <div className="flex items-center justify-between mt-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <span className="text-[10px] text-text-muted">
                    {insight.source === 'ai' ? 'AI Insight' : 'Template'}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    {new Date(insight.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
