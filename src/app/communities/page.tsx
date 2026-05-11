'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { Users, Plus, Search, Globe, Lock } from 'lucide-react';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';

interface Community {
  id: string;
  name: string;
  description: string | null;
  category: string;
  member_count: number;
  is_private: boolean;
  icon_url: string | null;
  created_at: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  'Sun Signs': '☉',
  'Moon Signs': '☽',
  'Rising Signs': '⬆',
  'Elements': '🔥',
  'Modalities': '⚡',
  'General': '✨',
  'Beginners': '📚',
  'Advanced': '🔮',
  'Relationships': '💕',
  'Career': '💼',
};

export default function CommunitiesPage() {
  const { user } = useAuthStore();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [myCommunities, setMyCommunities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadCommunities();
  }, [user]);

  async function loadCommunities() {
    setLoading(true);
    const supabase = createClient();

    const { data } = await supabase
      .from('communities')
      .select('*')
      .order('member_count', { ascending: false });

    if (data) setCommunities(data);

    // Load user's joined communities
    if (user) {
      const { data: memberships } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', user.id);
      if (memberships) {
        setMyCommunities(memberships.map(m => m.community_id));
      }
    }
    setLoading(false);
  }

  async function joinCommunity(communityId: string) {
    if (!user) return;
    const supabase = createClient();
    await supabase.from('community_members').insert({
      community_id: communityId,
      user_id: user.id,
      role: 'member',
    });
    setMyCommunities(prev => [...prev, communityId]);
    // Update local count
    setCommunities(prev => prev.map(c =>
      c.id === communityId ? { ...c, member_count: c.member_count + 1 } : c
    ));
  }

  async function leaveCommunity(communityId: string) {
    if (!user) return;
    const supabase = createClient();
    await supabase.from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', user.id);
    setMyCommunities(prev => prev.filter(id => id !== communityId));
    setCommunities(prev => prev.map(c =>
      c.id === communityId ? { ...c, member_count: Math.max(0, c.member_count - 1) } : c
    ));
  }

  const categories = ['all', ...Array.from(new Set(communities.map(c => c.category).filter(Boolean)))];

  const filtered = communities.filter(c => {
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const joined = filtered.filter(c => myCommunities.includes(c.id));
  const notJoined = filtered.filter(c => !myCommunities.includes(c.id));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-3">
          <Users className="w-7 h-7 text-accent-primary" />
          Communities
        </h1>
        <Link href="/communities/create" className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search communities..."
          className="input pl-10"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              categoryFilter === cat
                ? 'bg-accent-primary/20 text-accent-primary'
                : 'bg-bg-tertiary text-text-muted hover:text-text-secondary'
            }`}
          >
            {cat === 'all' ? '✨ All' : `${CATEGORY_ICONS[cat] || '🌟'} ${cat}`}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingCosmic label="Loading communities..." />
      ) : (
        <>
          {/* My Communities */}
          {joined.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                My Communities ({joined.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {joined.map(community => (
                  <CommunityCard
                    key={community.id}
                    community={community}
                    isJoined={true}
                    onLeave={() => leaveCommunity(community.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Discover */}
          <div>
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              {joined.length > 0 ? 'Discover More' : 'All Communities'} ({notJoined.length})
            </h2>
            {notJoined.length === 0 ? (
              <div className="card text-center py-10">
                <Globe className="w-10 h-10 text-text-muted mx-auto mb-3" />
                <p className="text-text-muted">No communities found</p>
                <p className="text-xs text-text-muted mt-1">Try a different search or create your own!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {notJoined.map(community => (
                  <CommunityCard
                    key={community.id}
                    community={community}
                    isJoined={false}
                    onJoin={() => joinCommunity(community.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function CommunityCard({ community, isJoined, onJoin, onLeave }: {
  community: Community;
  isJoined: boolean;
  onJoin?: () => void;
  onLeave?: () => void;
}) {
  return (
    <div className="card hover:border-accent-primary/30 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-accent-muted flex items-center justify-center flex-shrink-0 text-xl">
          {CATEGORY_ICONS[community.category] || '✨'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Link href={`/communities/${community.id}`} className="text-sm font-semibold text-text-primary hover:text-accent-primary truncate">
              {community.name}
            </Link>
            {community.is_private && <Lock className="w-3 h-3 text-text-muted" />}
          </div>
          {community.description && (
            <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{community.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-text-muted flex items-center gap-1">
              <Users className="w-3 h-3" /> {community.member_count} members
            </span>
            {isJoined ? (
              <button onClick={onLeave} className="text-[10px] text-red-400 hover:text-red-300">
                Leave
              </button>
            ) : (
              <button onClick={onJoin} className="text-[10px] text-accent-primary font-medium hover:underline">
                Join
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
