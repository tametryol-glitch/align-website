'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Heart, Share2, MessageCircle, Play, ChevronUp, ChevronDown } from 'lucide-react';

const CATEGORIES = ['All', 'Astrology', 'Relationships', 'Manifestation', 'Predictions', 'Daily Vibes'] as const;
type Category = (typeof CATEGORIES)[number];

interface ReelProfile {
  display_name: string;
  avatar_url: string | null;
  sun_sign: string | null;
}

interface Reel {
  id: string;
  user_id: string;
  video_url: string;
  caption: string | null;
  likes_count: number;
  views_count: number;
  category: string;
  created_at: string;
  profile: ReelProfile;
}

export default function ReelsPage() {
  const { user } = useAuthStore();
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchReels();
  }, [activeCategory]);

  async function fetchReels() {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from('reels')
      .select('*, profile:profiles(display_name, avatar_url, sun_sign)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (activeCategory !== 'All') {
      query = query.eq('category', activeCategory);
    }

    const { data, error } = await query;
    if (!error && data) {
      setReels(data as Reel[]);
      setCurrentIndex(0);
    }
    setLoading(false);
  }

  function handleLike(reelId: string) {
    setLikedReels((prev) => {
      const next = new Set(prev);
      if (next.has(reelId)) next.delete(reelId);
      else next.add(reelId);
      return next;
    });
  }

  function goNext() {
    if (currentIndex < reels.length - 1) setCurrentIndex(currentIndex + 1);
  }

  function goPrev() {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }

  const currentReel = reels[currentIndex];

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Play className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Reels</h1>
          <p className="text-text-tertiary text-sm">Short cosmic videos</p>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat
                ? 'bg-accent-primary text-white'
                : 'bg-bg-tertiary text-text-muted hover:text-text-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Reel Viewer */}
      {loading ? (
        <div className="text-center py-12 text-text-muted">Loading reels...</div>
      ) : reels.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-text-tertiary">No reels found in this category.</p>
        </div>
      ) : currentReel ? (
        <div className="relative">
          {/* Reel Card */}
          <div className="card overflow-hidden">
            {/* Video Thumbnail/Placeholder */}
            <div className="relative aspect-[9/16] max-h-[70vh] bg-bg-tertiary rounded-xl flex items-center justify-center mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
              <p className="absolute bottom-4 left-4 right-4 text-text-muted text-xs text-center">
                Video playback — tap to play
              </p>
            </div>

            {/* Reel Info */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-bg-tertiary overflow-hidden flex-shrink-0">
                {currentReel.profile.avatar_url ? (
                  <img
                    src={currentReel.profile.avatar_url}
                    alt={currentReel.profile.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted text-sm font-bold">
                    {currentReel.profile.display_name?.[0] || '?'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary text-sm truncate">
                    {currentReel.profile.display_name}
                  </span>
                  {currentReel.profile.sun_sign && (
                    <span className="text-xs text-accent-primary">{currentReel.profile.sun_sign}</span>
                  )}
                </div>
                {currentReel.caption && (
                  <p className="text-text-secondary text-sm mt-1 line-clamp-2">{currentReel.caption}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border-primary">
              <button
                onClick={() => handleLike(currentReel.id)}
                className="flex items-center gap-2 text-sm transition-colors"
              >
                <Heart
                  className={`w-5 h-5 ${
                    likedReels.has(currentReel.id)
                      ? 'fill-red-500 text-red-500'
                      : 'text-text-muted'
                  }`}
                />
                <span className="text-text-muted">
                  {currentReel.likes_count + (likedReels.has(currentReel.id) ? 1 : 0)}
                </span>
              </button>
              <button className="flex items-center gap-2 text-sm text-text-muted">
                <MessageCircle className="w-5 h-5" />
                <span>0</span>
              </button>
              <button className="flex items-center gap-2 text-sm text-text-muted">
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
              <span className="ml-auto text-xs text-text-tertiary">
                {currentReel.views_count.toLocaleString()} views
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="p-3 rounded-full bg-bg-tertiary text-text-muted disabled:opacity-30 hover:text-text-primary transition-colors"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <span className="flex items-center text-xs text-text-tertiary">
              {currentIndex + 1} / {reels.length}
            </span>
            <button
              onClick={goNext}
              disabled={currentIndex === reels.length - 1}
              className="p-3 rounded-full bg-bg-tertiary text-text-muted disabled:opacity-30 hover:text-text-primary transition-colors"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
