'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { Search, TrendingUp, Users, Sparkles, Globe, Star, BookOpen, BarChart3, Palette, Image, Film, Heart, Shield } from 'lucide-react';

export default function DiscoverPage() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [newUsers, setNewUsers] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadDiscoverContent();
  }, []);

  async function loadDiscoverContent() {
    const supabase = createClient();

    // Trending posts (most reactions recently)
    const { data: posts } = await supabase
      .from('posts')
      .select('id, content, type, created_at, profile:profiles!posts_user_id_fkey(display_name, avatar_url, sun_sign)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(6);
    if (posts) setTrendingPosts(posts);

    // New users
    const { data: users } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, sun_sign, moon_sign, rising_sign')
      .order('created_at', { ascending: false })
      .limit(10);
    if (users) setNewUsers(users.filter((u: any) => u.id !== user?.id));
  }

  async function handleSearch(query: string) {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, sun_sign')
      .ilike('display_name', `%${query}%`)
      .limit(10);
    setSearchResults(data || []);
    setSearching(false);
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-text-primary mb-6">Discover</h1>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search users by name..."
          className="input pl-12"
        />
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-bg-card border border-border-primary rounded-xl shadow-lg z-30 max-h-60 overflow-y-auto">
            {searchResults.map((u) => (
              <Link
                key={u.id}
                href={`/user/${u.id}`}
                className="flex items-center gap-3 p-3 hover:bg-bg-tertiary transition-colors"
                onClick={() => { setSearchQuery(''); setSearchResults([]); }}
              >
                <div className="w-8 h-8 rounded-full bg-accent-muted flex items-center justify-center text-xs font-bold text-accent-primary">
                  {(u.display_name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{u.display_name}</p>
                  {u.sun_sign && <p className="text-xs text-text-muted">{u.sun_sign}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Feature banners */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <Link href="/world-echo" className="bg-gradient-cosmic rounded-2xl p-5 border border-accent-muted hover:border-accent-primary/40 transition-colors">
          <Globe className="w-6 h-6 text-accent-primary mb-2" />
          <h3 className="text-sm font-semibold text-text-primary">World Echo</h3>
          <p className="text-xs text-text-muted">Historical events matching today&apos;s sky</p>
        </Link>
        <Link href="/readings/compatibility" className="bg-gradient-cosmic rounded-2xl p-5 border border-accent-muted hover:border-accent-primary/40 transition-colors">
          <Sparkles className="w-6 h-6 text-accent-primary mb-2" />
          <h3 className="text-sm font-semibold text-text-primary">Compatibility</h3>
          <p className="text-xs text-text-muted">Check synastry with someone special</p>
        </Link>
        <Link href="/readings/soul-gifts" className="bg-gradient-cosmic rounded-2xl p-5 border border-accent-muted hover:border-accent-primary/40 transition-colors">
          <TrendingUp className="w-6 h-6 text-accent-primary mb-2" />
          <h3 className="text-sm font-semibold text-text-primary">Soul Gifts</h3>
          <p className="text-xs text-text-muted">Discover talents in your asteroid placements</p>
        </Link>
      </div>

      {/* More features */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
        <Link href="/communities" className="card hover:border-accent-primary/30 transition-colors text-center py-4">
          <Users className="w-5 h-5 text-accent-primary mx-auto mb-1.5" />
          <p className="text-xs font-medium text-text-primary">Communities</p>
        </Link>
        <Link href="/celebrity-matches" className="card hover:border-accent-primary/30 transition-colors text-center py-4">
          <Star className="w-5 h-5 text-gold-primary mx-auto mb-1.5" />
          <p className="text-xs font-medium text-text-primary">Celebrity Matches</p>
        </Link>
        <Link href="/cosmic-index" className="card hover:border-accent-primary/30 transition-colors text-center py-4">
          <BookOpen className="w-5 h-5 text-accent-primary mx-auto mb-1.5" />
          <p className="text-xs font-medium text-text-primary">Cosmic Index</p>
        </Link>
        <Link href="/polls" className="card hover:border-accent-primary/30 transition-colors text-center py-4">
          <BarChart3 className="w-5 h-5 text-accent-primary mx-auto mb-1.5" />
          <p className="text-xs font-medium text-text-primary">Polls</p>
        </Link>
        <Link href="/qa" className="card hover:border-accent-primary/30 transition-colors text-center py-4">
          <Search className="w-5 h-5 text-accent-primary mx-auto mb-1.5" />
          <p className="text-xs font-medium text-text-primary">Q&A</p>
        </Link>
        <Link href="/creator-studio" className="card hover:border-accent-primary/30 transition-colors text-center py-4">
          <Sparkles className="w-5 h-5 text-gold-primary mx-auto mb-1.5" />
          <p className="text-xs font-medium text-text-primary">Creator Studio</p>
        </Link>
        <Link href="/gallery" className="card hover:border-accent-primary/30 transition-colors text-center py-4">
          <Image className="w-5 h-5 text-accent-primary mx-auto mb-1.5" />
          <p className="text-xs font-medium text-text-primary">Gallery</p>
        </Link>
        <Link href="/reels" className="card hover:border-accent-primary/30 transition-colors text-center py-4">
          <Film className="w-5 h-5 text-accent-primary mx-auto mb-1.5" />
          <p className="text-xs font-medium text-text-primary">Reels</p>
        </Link>
        <Link href="/matches" className="card hover:border-accent-primary/30 transition-colors text-center py-4">
          <Heart className="w-5 h-5 text-fire mx-auto mb-1.5" />
          <p className="text-xs font-medium text-text-primary">Matches</p>
        </Link>
        <Link href="/group-synastry" className="card hover:border-accent-primary/30 transition-colors text-center py-4">
          <Users className="w-5 h-5 text-gold-primary mx-auto mb-1.5" />
          <p className="text-xs font-medium text-text-primary">Group Synastry</p>
        </Link>
        <Link href="/admin" className="card hover:border-accent-primary/30 transition-colors text-center py-4">
          <Shield className="w-5 h-5 text-red-400 mx-auto mb-1.5" />
          <p className="text-xs font-medium text-text-primary">Admin</p>
        </Link>
        <Link href="/readings/arabic-parts" className="card hover:border-accent-primary/30 transition-colors text-center py-4">
          <Star className="w-5 h-5 text-accent-primary mx-auto mb-1.5" />
          <p className="text-xs font-medium text-text-primary">Arabic Parts</p>
        </Link>
        <Link href="/fragments" className="card hover:border-accent-primary/30 transition-colors text-center py-4">
          <Sparkles className="w-5 h-5 text-accent-primary mx-auto mb-1.5" />
          <p className="text-xs font-medium text-text-primary">Fragments</p>
        </Link>
      </div>

      {/* Cosmic Weather */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
          <span className="text-xl">🌤️</span> Cosmic Weather
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-bg-tertiary">
            <span className="text-2xl block">🌑</span>
            <p className="text-xs text-text-secondary mt-1">Waning Gibbous</p>
            <p className="text-[10px] text-text-muted">Moon in Scorpio</p>
          </div>
          <div className="p-3 rounded-xl bg-bg-tertiary">
            <span className="text-2xl block">☿</span>
            <p className="text-xs text-text-secondary mt-1">Mercury Retrograde</p>
            <p className="text-[10px] text-text-muted">Until May 25</p>
          </div>
          <div className="p-3 rounded-xl bg-bg-tertiary">
            <span className="text-2xl block">♀</span>
            <p className="text-xs text-text-secondary mt-1">Venus Trine Jupiter</p>
            <p className="text-[10px] text-text-muted">Love & abundance</p>
          </div>
          <div className="p-3 rounded-xl bg-bg-tertiary">
            <span className="text-2xl block">♂</span>
            <p className="text-xs text-text-secondary mt-1">Mars Square Saturn</p>
            <p className="text-[10px] text-text-muted">Tension & discipline</p>
          </div>
        </div>
      </div>

      {/* New Users */}
      {newUsers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-accent-primary" /> New in the Community
          </h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {newUsers.map((u) => (
              <Link
                key={u.id}
                href={`/user/${u.id}`}
                className="flex-shrink-0 w-24 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-accent-muted flex items-center justify-center mx-auto mb-1 text-lg font-bold text-accent-primary">
                  {u.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    (u.display_name || '?')[0].toUpperCase()
                  )}
                </div>
                <p className="text-xs text-text-primary font-medium truncate">{u.display_name}</p>
                {u.sun_sign && <p className="text-[10px] text-text-muted">{u.sun_sign}</p>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Trending posts */}
      {trendingPosts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent-primary" /> Trending Posts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {trendingPosts.map((post: any) => {
              const profile = post.profile as any;
              return (
                <Link key={post.id} href="/feed" className="card hover:border-accent-primary/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-accent-muted flex items-center justify-center text-[10px] font-bold text-accent-primary">
                      {(profile?.display_name || '?')[0].toUpperCase()}
                    </div>
                    <span className="text-xs text-text-secondary">{profile?.display_name}</span>
                    {profile?.sun_sign && (
                      <span className="text-[10px] text-text-muted">· {profile.sun_sign}</span>
                    )}
                  </div>
                  <p className="text-sm text-text-primary line-clamp-2">{post.content}</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
