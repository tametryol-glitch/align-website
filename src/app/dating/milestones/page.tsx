'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getDatingMatches, type DatingMatch } from '@/lib/datingDiscoveryService';
import {
  getMilestones, addMilestone, getNextMilestone, getMilestoneProgress,
  MILESTONE_CONFIG, type DatingMilestone,
} from '@/lib/milestoneService';
import { ArrowLeft, Plus, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function MilestonesPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const [matches, setMatches] = useState<DatingMatch[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<DatingMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

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
    getMilestones(selectedMatchId).then(setMilestones);
  }, [selectedMatchId]);

  const achievedTypes = milestones.map(m => m.milestone_type);
  const nextMilestone = getNextMilestone(achievedTypes);
  const progress = getMilestoneProgress(achievedTypes);

  const handleAddNext = async () => {
    if (!selectedMatchId || !nextMilestone || adding) return;
    setAdding(true);
    const result = await addMilestone(selectedMatchId, nextMilestone);
    if (result) {
      setMilestones(prev => [...prev, result]);
    }
    setAdding(false);
  };

  const allMilestoneTypes = Object.keys(MILESTONE_CONFIG).filter(t => t !== 'custom');

  return (
    <div className="max-w-2xl mx-auto" style={{ minHeight: '100vh' }}>
      <Link href="/dating/matches" className="inline-flex items-center gap-1 text-sm text-accent-primary mb-4">
        <ArrowLeft size={16} /> Back to Matches
      </Link>

      <div className="text-center mb-6">
        <span className="text-3xl block mb-2">🌟</span>
        <h1 className="text-2xl font-bold text-white mb-1">Relationship Milestones</h1>
        <p className="text-sm text-text-tertiary max-w-xs mx-auto">
          Track your journey together under the stars
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-tertiary mb-3">Match with someone to track milestones.</p>
          <Link href="/dating" className="text-accent-primary text-sm font-medium">Browse Picks</Link>
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

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-text-muted">Journey Progress</span>
              <span className="text-xs font-semibold text-accent-primary">{progress}%</span>
            </div>
            <div className="h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #9B6FF6, #EC4899)',
                }}
              />
            </div>
          </div>

          {/* Milestone timeline */}
          <div className="space-y-3">
            {allMilestoneTypes.map(type => {
              const config = MILESTONE_CONFIG[type];
              const achieved = milestones.find(m => m.milestone_type === type);
              const isNext = type === nextMilestone;

              return (
                <div
                  key={type}
                  className="rounded-2xl p-4 flex items-center gap-4 transition-all"
                  style={{
                    backgroundColor: achieved
                      ? 'rgba(74,222,128,0.06)'
                      : isNext
                        ? 'rgba(155,111,246,0.06)'
                        : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${achieved
                      ? 'rgba(74,222,128,0.2)'
                      : isNext
                        ? 'rgba(155,111,246,0.2)'
                        : 'rgba(255,255,255,0.04)'}`,
                    opacity: achieved || isNext ? 1 : 0.5,
                  }}
                >
                  <span className="text-2xl">{config.icon}</span>
                  <div className="flex-1">
                    <h3 className={`text-sm font-semibold ${achieved ? 'text-green-400' : 'text-white'}`}>
                      {config.label}
                    </h3>
                    <p className="text-xs text-text-muted">{config.description}</p>
                    {achieved && (
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {new Date(achieved.achieved_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {achieved ? (
                    <CheckCircle size={20} color="#4ADE80" />
                  ) : isNext ? (
                    <button
                      onClick={handleAddNext}
                      disabled={adding}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-white"
                      style={{ background: 'linear-gradient(135deg, #9B6FF6, #7C3AED)' }}
                    >
                      <Plus size={12} /> Mark
                    </button>
                  ) : (
                    <div className="w-5 h-5 rounded-full" style={{ border: '2px solid rgba(255,255,255,0.1)' }} />
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
