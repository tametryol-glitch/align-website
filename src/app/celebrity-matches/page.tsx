'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { Star, Sparkles, Users } from 'lucide-react';
import { getZodiacGlyph } from '@/lib/utils';

interface CelebrityMatch {
  id: string;
  name: string;
  category: string;
  sun_sign: string;
  moon_sign: string | null;
  rising_sign: string | null;
  match_score: number;
  shared_placements: string[];
  image_url: string | null;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  'Music': '🎵',
  'Film': '🎬',
  'Sports': '⚽',
  'Science': '🔬',
  'Politics': '🏛️',
  'Art': '🎨',
  'Literature': '📚',
  'Business': '💼',
  'History': '📜',
};

export default function CelebrityMatchesPage() {
  const { user, profile } = useAuthStore();
  const [matches, setMatches] = useState<CelebrityMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const hasBirthData = profile?.birth_date && profile?.sun_sign;

  useEffect(() => {
    if (hasBirthData) loadMatches();
    else setLoading(false);
  }, [hasBirthData]);

  async function loadMatches() {
    setLoading(true);
    const supabase = createClient();

    // Query celebrities that share placements with user
    const { data } = await supabase
      .from('celebrity_charts')
      .select('id, name, category, sun_sign, moon_sign, rising_sign, image_url')
      .limit(50);

    if (data && profile) {
      // Score matches locally
      const scored: CelebrityMatch[] = data.map((celeb: any) => {
        const shared: string[] = [];
        let score = 0;

        if (celeb.sun_sign?.toLowerCase() === profile.sun_sign?.toLowerCase()) {
          shared.push(`Sun in ${celeb.sun_sign}`);
          score += 30;
        }
        if (celeb.moon_sign && celeb.moon_sign.toLowerCase() === profile.moon_sign?.toLowerCase()) {
          shared.push(`Moon in ${celeb.moon_sign}`);
          score += 25;
        }
        if (celeb.rising_sign && celeb.rising_sign.toLowerCase() === profile.rising_sign?.toLowerCase()) {
          shared.push(`Rising in ${celeb.rising_sign}`);
          score += 25;
        }

        // Element match bonus
        const getElement = (sign: string) => {
          const fire = ['aries', 'leo', 'sagittarius'];
          const earth = ['taurus', 'virgo', 'capricorn'];
          const air = ['gemini', 'libra', 'aquarius'];
          const water = ['cancer', 'scorpio', 'pisces'];
          const s = sign.toLowerCase();
          if (fire.includes(s)) return 'fire';
          if (earth.includes(s)) return 'earth';
          if (air.includes(s)) return 'air';
          if (water.includes(s)) return 'water';
          return '';
        };

        if (profile.sun_sign && celeb.sun_sign &&
          getElement(profile.sun_sign) === getElement(celeb.sun_sign) && !shared.includes(`Sun in ${celeb.sun_sign}`)) {
          score += 10;
          shared.push(`Same element (${getElement(celeb.sun_sign)})`);
        }

        return {
          ...celeb,
          match_score: Math.min(score, 100),
          shared_placements: shared,
        };
      })
        .filter((m: CelebrityMatch) => m.match_score > 0)
        .sort((a: CelebrityMatch, b: CelebrityMatch) => b.match_score - a.match_score);

      setMatches(scored);
    }
    setLoading(false);
  }

  if (!hasBirthData) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-display font-bold text-text-primary mb-6 flex items-center gap-3">
          <Star className="w-7 h-7 text-gold-primary" />
          Celebrity Matches
        </h1>
        <BirthDataPrompt message="Add your birth data to find celebrities who share your cosmic placements." />
      </div>
    );
  }

  const categories = ['all', ...Array.from(new Set(matches.map(m => m.category).filter(Boolean)))];
  const filtered = filter === 'all' ? matches : matches.filter(m => m.category === filter);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-text-primary mb-2 flex items-center gap-3">
        <Star className="w-7 h-7 text-gold-primary" />
        Celebrity Matches
      </h1>
      <p className="text-sm text-text-tertiary mb-6">
        Famous people who share your cosmic blueprint
      </p>

      {loading ? (
        <LoadingCosmic label="Finding your cosmic twins..." />
      ) : matches.length === 0 ? (
        <div className="card text-center py-10">
          <Users className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">No celebrity matches found yet</p>
          <p className="text-xs text-text-muted mt-1">Our database is growing — check back soon!</p>
        </div>
      ) : (
        <>
          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  filter === cat
                    ? 'bg-accent-primary/20 text-accent-primary'
                    : 'bg-bg-tertiary text-text-muted hover:text-text-secondary'
                }`}
              >
                {cat === 'all' ? '✨ All' : `${CATEGORY_EMOJIS[cat] || '🌟'} ${cat}`}
              </button>
            ))}
          </div>

          {/* Matches grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(match => (
              <div key={match.id} className="card hover:border-gold-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gold-primary/10 flex items-center justify-center flex-shrink-0">
                    {match.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={match.image_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <Star className="w-6 h-6 text-gold-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{match.name}</p>
                    <p className="text-[10px] text-text-muted">
                      {CATEGORY_EMOJIS[match.category] || ''} {match.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gold-primary">{match.match_score}%</p>
                    <p className="text-[10px] text-text-muted">match</p>
                  </div>
                </div>

                {/* Signs */}
                <div className="flex items-center gap-2 mb-2">
                  {match.sun_sign && (
                    <span className="px-2 py-0.5 rounded-full bg-fire/10 text-fire text-[10px] font-medium">
                      {getZodiacGlyph(match.sun_sign)} {match.sun_sign}
                    </span>
                  )}
                  {match.moon_sign && (
                    <span className="px-2 py-0.5 rounded-full bg-water/10 text-water text-[10px] font-medium">
                      {getZodiacGlyph(match.moon_sign)} {match.moon_sign}
                    </span>
                  )}
                  {match.rising_sign && (
                    <span className="px-2 py-0.5 rounded-full bg-air/10 text-air text-[10px] font-medium">
                      {getZodiacGlyph(match.rising_sign)} {match.rising_sign}
                    </span>
                  )}
                </div>

                {/* Shared placements */}
                {match.shared_placements.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {match.shared_placements.map((p, i) => (
                      <span key={i} className="flex items-center gap-1 text-[10px] text-accent-primary">
                        <Sparkles className="w-2.5 h-2.5" /> {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
