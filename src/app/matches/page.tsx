'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { Users, Heart, Flame, Star, Sparkles, Shield, Brain, Moon } from 'lucide-react';

const CATEGORIES = [
  { key: 'overall', label: 'Overall', icon: Users },
  { key: 'emotional', label: 'Emotional', icon: Heart },
  { key: 'passion', label: 'Passion', icon: Flame },
  { key: 'marriage', label: 'Marriage', icon: Star },
  { key: 'karmic', label: 'Karmic', icon: Moon },
  { key: 'attraction', label: 'Attraction', icon: Sparkles },
  { key: 'stability', label: 'Stability', icon: Shield },
  { key: 'mental', label: 'Mental', icon: Brain },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]['key'];

interface MatchProfile {
  display_name: string;
  avatar_url: string | null;
  sun_sign: string | null;
}

interface CosmicMatch {
  id: string;
  user_id: string;
  matched_user_id: string;
  overall_score: number;
  emotional_score: number;
  passion_score: number;
  karmic_score: number;
  attraction_score: number;
  stability_score: number;
  intellectual_score: number;
  calculated_at: string;
  matched_profile: MatchProfile;
}

function getScoreColor(score: number): 'green' | 'gold' | 'accent' | 'red' {
  if (score > 75) return 'green';
  if (score > 55) return 'gold';
  if (score > 35) return 'accent';
  return 'red';
}

function getScoreForCategory(match: CosmicMatch, category: CategoryKey): number {
  switch (category) {
    case 'overall': return match.overall_score;
    case 'emotional': return match.emotional_score;
    case 'passion': return match.passion_score;
    case 'marriage': return Math.round((match.stability_score + match.emotional_score) / 2);
    case 'karmic': return match.karmic_score;
    case 'attraction': return match.attraction_score;
    case 'stability': return match.stability_score;
    case 'mental': return match.intellectual_score;
    default: return match.overall_score;
  }
}

export default function MatchesPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const [matches, setMatches] = useState<CosmicMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('overall');

  useEffect(() => {
    if (authLoading) return;
    if (user) fetchMatches();
    else setLoading(false);
  }, [user, authLoading]);

  async function fetchMatches() {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('cosmic_matches')
      .select('*, matched_profile:profiles!cosmic_matches_matched_user_id_fkey(display_name, avatar_url, sun_sign)')
      .eq('user_id', user!.id)
      .order('overall_score', { ascending: false });

    if (!error && data) setMatches(data as CosmicMatch[]);
    setLoading(false);
  }

  const sorted = [...matches].sort(
    (a, b) => getScoreForCategory(b, activeCategory) - getScoreForCategory(a, activeCategory)
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Cosmic Matches</h1>
          <p className="text-text-tertiary text-sm">Compatibility scores with your connections</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat.key
                  ? 'bg-accent-primary text-white'
                  : 'bg-bg-tertiary text-text-muted hover:text-text-primary'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Match List */}
      {loading ? (
        <LoadingCosmic label="Loading matches..." />
      ) : !user ? (
        <div className="card text-center py-12">
          <p className="text-text-tertiary">Sign in to see your cosmic matches.</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-text-tertiary">No matches yet. Connect with others to see your cosmic compatibility.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((match) => {
            const score = getScoreForCategory(match, activeCategory);
            const color = getScoreColor(score);
            return (
              <div key={match.id} className="card flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-bg-tertiary overflow-hidden flex-shrink-0">
                  {match.matched_profile.avatar_url ? (
                    <img
                      src={match.matched_profile.avatar_url}
                      alt={match.matched_profile.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted font-bold">
                      {match.matched_profile.display_name?.[0] || '?'}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-text-primary text-sm truncate">
                      {match.matched_profile.display_name}
                    </span>
                    {match.matched_profile.sun_sign && (
                      <span className="text-xs text-accent-primary">{match.matched_profile.sun_sign}</span>
                    )}
                  </div>
                  <ScoreBar value={score} color={color} size="sm" showValue={false} />
                </div>

                {/* Score */}
                <div className={`text-lg font-bold ${
                  score > 75 ? 'text-emerald-400' :
                  score > 55 ? 'text-yellow-400' :
                  score > 35 ? 'text-orange-400' :
                  'text-red-400'
                }`}>
                  {Math.round(score)}%
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
