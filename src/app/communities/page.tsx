'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import {
  browseCommunities, getMyCommunities, joinCommunity, leaveCommunity,
  COMMUNITY_CATEGORIES, ZODIAC_EMOJIS,
  type Community, type CommunityCategory,
} from '@/lib/communityService';
import Link from 'next/link';
import { Search, Plus, Users, Lock, Globe, RefreshCw } from 'lucide-react';

export default function CommunitiesPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'discover' | 'mine'>('discover');
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CommunityCategory | null>(null);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [all, mine] = await Promise.all([
        browseCommunities({ category: selectedCategory || undefined, search: search || undefined }),
        user ? getMyCommunities() : Promise.resolve([]),
      ]);
      setAllCommunities(all);
      setMyCommunities(mine);
      setJoinedIds(new Set(mine.map(c => c.id)));
    } catch {}
    setLoading(false);
  }, [user, selectedCategory, search]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleJoin = useCallback(async (communityId: string) => {
    const ok = await joinCommunity(communityId);
    if (ok) {
      setJoinedIds(prev => new Set([...Array.from(prev), communityId]));
      loadData();
    }
  }, [loadData]);

  const handleLeave = useCallback(async (communityId: string) => {
    if (!confirm('Leave this community?')) return;
    const ok = await leaveCommunity(communityId);
    if (ok) {
      setJoinedIds(prev => { const s = new Set(prev); s.delete(communityId); return s; });
      loadData();
    }
  }, [loadData]);

  // Featured = top 4 by members, Trending = next 3
  const featured = useMemo(() =>
    [...allCommunities].sort((a, b) => b.member_count - a.member_count).slice(0, 4),
    [allCommunities],
  );

  const discoverList = useMemo(() =>
    allCommunities.filter(c => !joinedIds.has(c.id)),
    [allCommunities, joinedIds],
  );

  const getCategoryEmoji = (cat: string) =>
    COMMUNITY_CATEGORIES.find(c => c.id === cat)?.emoji || '✨';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">Communities</h1>
              <p className="text-sm text-text-secondary">Find your cosmic tribe</p>
            </div>
          </div>
          <Link
            href="/communities/create"
            className="btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Create
          </Link>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'discover'
              ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
              : 'bg-bg-card text-text-muted border border-border-primary hover:border-border-accent'
          }`}
        >
          🔍 Discover
        </button>
        <button
          onClick={() => setActiveTab('mine')}
          className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'mine'
              ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
              : 'bg-bg-card text-text-muted border border-border-primary hover:border-border-accent'
          }`}
        >
          ⭐ My Communities {myCommunities.length > 0 && `(${myCommunities.length})`}
        </button>
      </div>

      {/* ═══ DISCOVER TAB ═══ */}
      {activeTab === 'discover' && (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search communities..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-bg-card rounded-xl text-sm text-text-primary placeholder:text-text-muted border border-border-primary focus:border-accent-primary/50 focus:outline-none"
            />
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                !selectedCategory
                  ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
                  : 'bg-bg-card text-text-muted border border-border-primary'
              }`}
            >
              All
            </button>
            {COMMUNITY_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
                    : 'bg-bg-card text-text-muted border border-border-primary'
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="card rounded-2xl p-12 text-center">
              <RefreshCw className="w-6 h-6 text-accent-primary animate-spin mx-auto mb-3" />
              <p className="text-text-muted text-sm">Loading communities...</p>
            </div>
          ) : discoverList.length === 0 && myCommunities.length === 0 ? (
            <div className="card rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">🌌</div>
              <h2 className="text-lg font-semibold text-text-primary mb-2">No Communities Yet</h2>
              <p className="text-text-secondary mb-6">Be the first to create a cosmic community!</p>
              <Link
                href="/communities/create"
                className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium"
              >
                <Plus className="w-4 h-4" /> Create Community
              </Link>
            </div>
          ) : (
            <>
              {/* Featured Section */}
              {!search && !selectedCategory && featured.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Featured</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {featured.map(comm => (
                      <CommunityCard
                        key={comm.id}
                        community={comm}
                        joined={joinedIds.has(comm.id)}
                        onJoin={() => handleJoin(comm.id)}
                        onLeave={() => handleLeave(comm.id)}
                        featured
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Communities */}
              <div>
                {!search && !selectedCategory && <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">All Communities</h2>}
                <div className="space-y-3">
                  {(search || selectedCategory ? allCommunities : discoverList).map(comm => (
                    <CommunityCard
                      key={comm.id}
                      community={comm}
                      joined={joinedIds.has(comm.id)}
                      onJoin={() => handleJoin(comm.id)}
                      onLeave={() => handleLeave(comm.id)}
                    />
                  ))}
                  {(search || selectedCategory ? allCommunities : discoverList).length === 0 && (
                    <div className="card rounded-2xl p-8 text-center">
                      <p className="text-text-muted text-sm">
                        {search ? `No communities found for "${search}"` : 'No communities in this category yet.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ═══ MY COMMUNITIES TAB ═══ */}
      {activeTab === 'mine' && (
        <>
          {loading ? (
            <div className="card rounded-2xl p-12 text-center">
              <RefreshCw className="w-6 h-6 text-accent-primary animate-spin mx-auto mb-3" />
              <p className="text-text-muted text-sm">Loading your communities...</p>
            </div>
          ) : myCommunities.length === 0 ? (
            <div className="card rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">🌌</div>
              <h2 className="text-lg font-semibold text-text-primary mb-2">Your Cosmic Circle Awaits</h2>
              <p className="text-text-secondary mb-6">Join or create communities to find your tribe.</p>
              <button
                onClick={() => setActiveTab('discover')}
                className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium"
              >
                Explore Communities
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myCommunities.map(comm => (
                <CommunityCard
                  key={comm.id}
                  community={comm}
                  joined={true}
                  onJoin={() => {}}
                  onLeave={() => handleLeave(comm.id)}
                  showLink
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// COMMUNITY CARD
// ═════════════════════════════════════════════════════════════════════

function CommunityCard({
  community: comm,
  joined,
  onJoin,
  onLeave,
  featured = false,
  showLink = false,
}: {
  community: Community;
  joined: boolean;
  onJoin: () => void;
  onLeave: () => void;
  featured?: boolean;
  showLink?: boolean;
}) {
  const catEmoji = COMMUNITY_CATEGORIES.find(c => c.id === comm.category)?.emoji || '✨';
  const catLabel = COMMUNITY_CATEGORIES.find(c => c.id === comm.category)?.label || comm.category;
  const zodiacEmoji = comm.zodiac_sign ? ZODIAC_EMOJIS[comm.zodiac_sign] || '' : '';

  return (
    <div className={`card rounded-2xl p-4 hover:border-accent-primary/30 transition-colors ${featured ? 'bg-gradient-to-br from-bg-card to-accent-primary/5' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Link href={`/communities/${comm.id}`} className="shrink-0">
          <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center text-2xl">
            {comm.avatar_url ? (
              <img src={comm.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
            ) : (
              zodiacEmoji || catEmoji
            )}
          </div>
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <Link href={`/communities/${comm.id}`}>
            <h3 className="text-text-primary font-semibold truncate hover:text-accent-primary transition-colors">
              {comm.name}
            </h3>
          </Link>
          <p className="text-xs text-text-secondary line-clamp-2 mt-0.5">{comm.description}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-[11px] text-text-muted flex items-center gap-1">
              <Users className="w-3 h-3" /> {comm.member_count} member{comm.member_count !== 1 ? 's' : ''}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-bg-tertiary text-text-muted">
              {catEmoji} {catLabel}
            </span>
            {!comm.is_public && (
              <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
                <Lock className="w-3 h-3" /> Private
              </span>
            )}
            {comm.zodiac_sign && (
              <span className="text-[11px] text-text-muted">{zodiacEmoji} {comm.zodiac_sign}</span>
            )}
          </div>
        </div>

        {/* Join/Leave */}
        <div className="shrink-0">
          {joined ? (
            <button
              onClick={(e) => { e.preventDefault(); onLeave(); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-tertiary text-text-muted hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              Joined
            </button>
          ) : (
            <button
              onClick={(e) => { e.preventDefault(); onJoin(); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-primary/20 text-accent-primary hover:bg-accent-primary/30 transition-colors"
            >
              Join
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
