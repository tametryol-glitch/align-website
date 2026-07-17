'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { createClient } from '@/lib/supabase';
import {
  sanitizeSearchInput,
  scoreSearchResult,
  extractHighlight,
  type SearchEntityType,
  type SearchResult,
} from '@/lib/fulltextSearchEngine';
import { Search, X, Users, FileText, Globe, Film } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// ── Types ───────────────────────────────────────────────────────────

type TabFilter = 'all' | 'users' | 'posts' | 'communities' | 'reels';

interface RecentSearch {
  id: string;
  text: string;
  timestamp: number;
}

// ── Tab Config ──────────────────────────────────────────────────────

const TABS: { key: TabFilter; label: string; icon: typeof Search }[] = [
  { key: 'all', label: 'All', icon: Search },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'posts', label: 'Posts', icon: FileText },
  { key: 'communities', label: 'Communities', icon: Globe },
  { key: 'reels', label: 'Reels', icon: Film },
];

// ── Main Search Page ────────────────────────────────────────────────

export default function SearchPage() {
  const { user } = useAuthStore();
  const userId = user?.id || '';

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced search
  const performSearch = useCallback(async (searchText: string, tab: TabFilter) => {
    const sanitized = sanitizeSearchInput(searchText);
    if (!sanitized || sanitized.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    const supabase = createClient();
    const pattern = `%${sanitized}%`;
    const allResults: SearchResult[] = [];

    try {
      // Search Users
      if (tab === 'all' || tab === 'users') {
        const { data: users } = await supabase
          .from('profiles')
          .select('id, display_name, username, avatar_url, bio')
          .or(`display_name.ilike.${pattern},username.ilike.${pattern}`)
          .limit(15);

        if (users) {
          for (const u of users) {
            const score = scoreSearchResult(sanitized, {
              title: u.display_name || u.username || '',
              description: u.bio || '',
            });
            allResults.push({
              id: u.id,
              type: 'users',
              title: u.display_name || u.username || 'Unknown',
              subtitle: u.username ? `@${u.username}` : u.bio?.slice(0, 50) || '',
              avatar_url: u.avatar_url || undefined,
              score,
              highlight: extractHighlight(u.bio || '', sanitized, 60),
            });
          }
        }
      }

      // Search Posts
      if (tab === 'all' || tab === 'posts') {
        const { data: posts } = await supabase
          .from('posts')
          .select('id, content, user_id, created_at')
          .ilike('content', pattern)
          .limit(15);

        if (posts) {
          for (const p of posts) {
            const score = scoreSearchResult(sanitized, {
              title: p.content?.slice(0, 60) || '',
              description: p.content || '',
            });
            allResults.push({
              id: p.id,
              type: 'posts',
              title: p.content?.slice(0, 80) || 'Post',
              subtitle: new Date(p.created_at).toLocaleDateString(),
              score,
              highlight: extractHighlight(p.content || '', sanitized, 80),
            });
          }
        }
      }

      // Search Communities
      if (tab === 'all' || tab === 'communities') {
        const { data: communities } = await supabase
          .from('communities')
          .select('id, name, description, avatar_url, member_count')
          .or(`name.ilike.${pattern},description.ilike.${pattern}`)
          .limit(15);

        if (communities) {
          for (const c of communities) {
            const score = scoreSearchResult(sanitized, {
              title: c.name || '',
              description: c.description || '',
            });
            allResults.push({
              id: c.id,
              type: 'communities',
              title: c.name || 'Community',
              subtitle: c.member_count ? `${c.member_count} members` : c.description?.slice(0, 50) || '',
              avatar_url: c.avatar_url || undefined,
              score,
              highlight: extractHighlight(c.description || '', sanitized, 60),
            });
          }
        }
      }

      // Sort by relevance score descending
      allResults.sort((a, b) => b.score - a.score);
      setResults(allResults);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle text change with debounce
  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(text, activeTab);
    }, 300);
  }, [activeTab, performSearch]);

  // Handle tab change
  const handleTabChange = useCallback((tab: TabFilter) => {
    setActiveTab(tab);
    if (query.trim().length >= 2) {
      performSearch(query, tab);
    }
  }, [query, performSearch]);

  // Add to recent searches
  const addToRecent = useCallback((text: string) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((r) => r.text !== text);
      return [{ id: Date.now().toString(), text, timestamp: Date.now() }, ...filtered].slice(0, 8);
    });
  }, []);

  // Get link for result
  function getResultLink(item: SearchResult): string {
    switch (item.type) {
      case 'users':
        return `/user/${item.id}`;
      case 'posts':
        return `/feed`;
      case 'communities':
        return `/communities/${item.id}`;
      default:
        return '#';
    }
  }

  // Type badge color
  function getTypeBadge(type: SearchEntityType): { label: string; className: string } {
    switch (type) {
      case 'users':
        return { label: 'User', className: 'bg-blue-500/15 text-blue-400' };
      case 'posts':
        return { label: 'Post', className: 'bg-green-500/15 text-green-400' };
      case 'communities':
        return { label: 'Community', className: 'bg-purple-500/15 text-purple-400' };
      case 'reels':
        return { label: 'Reel', className: 'bg-pink-500/15 text-pink-400' };
      default:
        return { label: 'Other', className: 'bg-gray-500/15 text-gray-400' };
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Search Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-text-primary mb-4">Search</h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search the cosmos..."
            className="w-full bg-bg-card border border-border-primary rounded-full pl-12 pr-10 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent-primary transition-colors"
          />
          {query.length > 0 && (
            <button
              onClick={() => { setQuery(''); setResults([]); setHasSearched(false); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tab Filters */}
      <div className="flex gap-2 overflow-x-auto mb-6 scrollbar-hide">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border whitespace-nowrap transition-colors',
                activeTab === tab.key
                  ? 'bg-accent-muted border-accent-primary text-accent-primary'
                  : 'bg-bg-card border-border-primary text-text-muted hover:text-text-primary'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-muted mt-4">Searching the stars...</p>
        </div>
      ) : hasSearched && results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl block mb-4">{'✨'}</span>
          <h2 className="text-lg font-semibold text-text-primary mb-2">No cosmic matches found</h2>
          <p className="text-sm text-text-muted">Try different keywords or check the spelling</p>
        </div>
      ) : !hasSearched ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-6xl block mb-4">{'🔮'}</span>
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            Search for people, posts, and communities
          </h2>
          <p className="text-sm text-text-muted mb-8">
            Discover cosmic connections across the universe
          </p>

          {recentSearches.length > 0 && (
            <div className="w-full max-w-sm text-left">
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-3">
                Recent Searches
              </h3>
              <div className="space-y-1">
                {recentSearches.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { setQuery(r.text); performSearch(r.text, activeTab); }}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-bg-card transition-colors text-left"
                  >
                    <Search className="w-3.5 h-3.5 text-text-muted" />
                    <span className="text-sm text-text-muted">{r.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
          {results.map((item) => {
            const badge = getTypeBadge(item.type);
            return (
              <Link
                key={`${item.type}-${item.id}`}
                href={getResultLink(item)}
                onClick={() => addToRecent(query)}
                className="card flex items-start gap-3 p-4 hover:border-accent-primary/40 transition-colors"
              >
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full bg-accent-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-accent-primary">
                    {item.title[0]?.toUpperCase() || '?'}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-text-primary truncate">{item.title}</p>
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', badge.className)}>
                      {badge.label}
                    </span>
                  </div>
                  {item.subtitle && (
                    <p className="text-xs text-text-muted truncate">{item.subtitle}</p>
                  )}
                  {item.highlight && (
                    <p className="text-xs text-text-tertiary mt-1 italic line-clamp-2">{item.highlight}</p>
                  )}
                </div>

                {/* Score */}
                <div className="flex-shrink-0 bg-accent-muted px-2 py-0.5 rounded text-[10px] font-bold text-accent-primary">
                  {Math.round(item.score * 100)}%
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
