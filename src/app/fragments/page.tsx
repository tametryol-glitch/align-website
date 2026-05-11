'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { Sparkles, Plus, Star, TrendingUp, Clock } from 'lucide-react';

interface Fragment {
  id: string;
  user_id: string;
  fragment_user_id: string;
  display_name: string;
  sun_sign: string | null;
  moon_sign: string | null;
  rising_sign: string | null;
  compatibility_score: number;
  active_cycle: string;
  reach_out_rating: number;
  last_calculated: string;
  created_at: string;
}

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 7)}w ago`;
}

function getScoreColor(score: number): string {
  if (score > 70) return 'text-green-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-red-400';
}

function getScoreBarColor(score: number): string {
  if (score > 70) return 'bg-green-400';
  if (score >= 40) return 'bg-yellow-400';
  return 'bg-red-400';
}

function getCycleBadgeColor(cycle: string): string {
  switch (cycle.toLowerCase()) {
    case 'growth':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'challenge':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'harmony':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'transformation':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    default:
      return 'bg-accent-primary/20 text-accent-primary border-accent-primary/30';
  }
}

export default function FragmentsPage() {
  const { user } = useAuthStore();
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadFragments();
  }, [user]);

  async function loadFragments() {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from('fragments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setFragments(data);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-secondary">Loading fragments...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">Fragments</h1>
              <p className="text-sm text-text-secondary">Your relationship intelligence dashboard</p>
            </div>
          </div>
          <span className="text-xs font-medium text-text-muted bg-bg-tertiary px-3 py-1 rounded-full border border-border-primary">
            {fragments.length}/20 slots used
          </span>
        </div>
      </div>

      {/* Fragments List */}
      {fragments.length === 0 ? (
        <div className="card rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">&#10024;</div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">No Fragments Yet</h2>
          <p className="text-text-secondary mb-6">Add people to track cosmic relationship cycles</p>
          <Link
            href="/friends"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium"
          >
            <Plus className="w-4 h-4" />
            Add from Friends
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {fragments.map((fragment) => (
            <Link
              key={fragment.id}
              href={`/fragments/${fragment.id}`}
              className="card rounded-2xl p-4 block hover:border-accent-primary/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-accent-primary">
                    {fragment.display_name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-text-primary font-semibold truncate">
                      {fragment.display_name}
                    </h3>
                    {fragment.sun_sign && (
                      <span className="text-xs text-text-tertiary">{fragment.sun_sign}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Compatibility Score */}
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getScoreBarColor(fragment.compatibility_score)}`}
                          style={{ width: `${fragment.compatibility_score}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${getScoreColor(fragment.compatibility_score)}`}>
                        {fragment.compatibility_score}%
                      </span>
                    </div>

                    {/* Active Cycle Badge */}
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getCycleBadgeColor(fragment.active_cycle)}`}>
                      {fragment.active_cycle}
                    </span>

                    {/* Reach-out Rating */}
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < fragment.reach_out_rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-text-muted'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Last Calculated */}
                    {fragment.last_calculated && (
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <Clock className="w-3 h-3" />
                        {getRelativeTime(fragment.last_calculated)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow indicator */}
                <TrendingUp className="w-4 h-4 text-text-muted flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Add Fragment Button */}
      {fragments.length > 0 && fragments.length < 20 && (
        <div className="flex justify-center pt-2">
          <Link
            href="/friends"
            className="btn-secondary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Fragment
          </Link>
        </div>
      )}
    </div>
  );
}
