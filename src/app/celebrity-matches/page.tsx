'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { getZodiacGlyph } from '@/lib/utils';
import {
  Celebrity,
  CelebrityCategory,
  CELEBRITY_CATEGORIES,
  searchCelebrities,
  getTrendingCelebrities,
  getRecentCelebrities,
  getCelebritiesByCategory,
  getFavorites,
} from '@/lib/celebrityService';
import {
  Search,
  X,
  Star,
  TrendingUp,
  Clock,
  Heart,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// ── Gradient palette for placeholder avatars ─────────────────────
const PLACEHOLDER_GRADIENTS = [
  'from-[#9B6FF6] to-[#6C47D9]',
  'from-[#F66FAA] to-[#D94790]',
  'from-[#6FB0F6] to-[#4790D9]',
  'from-[#F6A86F] to-[#D98347]',
  'from-[#6FF6C3] to-[#47D99B]',
];

function gradientForName(name: string): string {
  const idx = name.charCodeAt(0) % PLACEHOLDER_GRADIENTS.length;
  return PLACEHOLDER_GRADIENTS[idx];
}

function astroTease(celeb: Celebrity): string {
  if (celeb.sun_sign) {
    const glyph = getZodiacGlyph(celeb.sun_sign);
    const label = celeb.sun_sign.charAt(0).toUpperCase() + celeb.sun_sign.slice(1);
    return `${glyph} ${label} Sun`;
  }
  return celeb.time_known ? '' : 'Birth time unknown';
}

// ═══════════════════════════════════════════════════════════════════
// Celebrity Card (carousel item)
// ═══════════════════════════════════════════════════════════════════
function CelebCard({ celebrity, onClick }: { celebrity: Celebrity; onClick: () => void }) {
  const tease = astroTease(celebrity);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [celebrity.photo_url]);

  const showImage = !!celebrity.photo_url && !imgFailed;

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-[140px] flex flex-col items-center group cursor-pointer"
    >
      {showImage ? (
        <Image
          src={celebrity.photo_url!}
          alt={celebrity.name}
          width={120}
          height={120}
          className="w-[120px] h-[120px] rounded-xl object-cover bg-bg-secondary group-hover:ring-2 ring-accent-primary/50 transition-all"
          onError={() => setImgFailed(true)}
          unoptimized
        />
      ) : (
        <div className={`w-[120px] h-[120px] rounded-xl bg-gradient-to-br ${gradientForName(celebrity.name)} flex items-center justify-center group-hover:ring-2 ring-accent-primary/50 transition-all`}>
          <span className="text-white text-4xl font-bold">
            {celebrity.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <p className="text-sm font-semibold text-text-primary mt-2 text-center w-[120px] truncate">
        {celebrity.name}
      </p>
      <p className="text-xs text-text-muted text-center w-[120px] truncate">
        {celebrity.profession}
      </p>
      {tease && (
        <p className="text-[11px] text-accent-primary text-center w-[120px] truncate">
          {tease}
        </p>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Search Result Row
// ═══════════════════════════════════════════════════════════════════
function SearchRow({ celebrity, onClick }: { celebrity: Celebrity; onClick: () => void }) {
  const tease = astroTease(celebrity);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [celebrity.photo_url]);

  const showImage = !!celebrity.photo_url && !imgFailed;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 py-3 border-b border-border-primary/30 w-full text-left hover:bg-bg-secondary/30 transition-colors px-1 rounded"
    >
      {showImage ? (
        <Image
          src={celebrity.photo_url!}
          alt={celebrity.name}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          onError={() => setImgFailed(true)}
          unoptimized
        />
      ) : (
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradientForName(celebrity.name)} flex items-center justify-center flex-shrink-0`}>
          <span className="text-white text-xl font-bold">
            {celebrity.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">{celebrity.name}</p>
        <p className="text-xs text-text-muted truncate">
          {celebrity.profession}{tease ? ` • ${tease}` : ''}
        </p>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Carousel Section
// ═══════════════════════════════════════════════════════════════════
function CarouselSection({
  title,
  icon,
  data,
  onCelebClick,
}: {
  title: string;
  icon: React.ReactNode;
  data: Celebrity[];
  onCelebClick: (celeb: Celebrity) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (data.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = dir === 'left' ? -300 : 300;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          {icon}
          {title}
        </h2>
        <div className="flex gap-1">
          <button onClick={() => scroll('left')} className="p-1 text-text-muted hover:text-text-primary transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => scroll('right')} className="p-1 text-text-muted hover:text-text-primary transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
      >
        {data.map((celeb) => (
          <CelebCard
            key={celeb.id}
            celebrity={celeb}
            onClick={() => onCelebClick(celeb)}
          />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════════
export default function CelebrityMatchesPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Data state
  const [trending, setTrending] = useState<Celebrity[]>([]);
  const [recent, setRecent] = useState<Celebrity[]>([]);
  const [favorites, setFavorites] = useState<Celebrity[]>([]);
  const [categoryResults, setCategoryResults] = useState<Celebrity[]>([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Celebrity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Category filter
  const [activeCategory, setActiveCategory] = useState<CelebrityCategory | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // General UI
  const [loading, setLoading] = useState(true);

  // Navigate to celebrity profile
  const goToProfile = useCallback(
    (celeb: Celebrity) => {
      router.push(`/celebrity-matches/${celeb.id}`);
    },
    [router],
  );

  // Initial data load
  const loadData = useCallback(async () => {
    try {
      const [t, r, f] = await Promise.all([
        getTrendingCelebrities(15),
        getRecentCelebrities(15),
        user ? getFavorites() : Promise.resolve([]),
      ]);
      setTrending(t);
      setRecent(r);
      setFavorites(f);
    } catch (err) {
      console.warn('[CelebrityMatches] loadData error', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Debounced search
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);

    if (!text.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const results = await searchCelebrities(text.trim(), 20);
        setSearchResults(results);
      } catch (err) {
        console.warn('[CelebrityMatches] search error', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  }, []);

  // Category filter
  const selectCategory = useCallback(async (cat: CelebrityCategory) => {
    if (activeCategory === cat) {
      setActiveCategory(null);
      setCategoryResults([]);
      return;
    }
    setActiveCategory(cat);
    setCategoryLoading(true);
    try {
      const results = await getCelebritiesByCategory(cat, 30);
      setCategoryResults(results);
    } catch (err) {
      console.warn('[CelebrityMatches] category error', err);
    } finally {
      setCategoryLoading(false);
    }
  }, [activeCategory]);

  const isSearchActive = searchQuery.trim().length > 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-3">
          <Star className="w-7 h-7 text-[#9B6FF6]" />
          Celebrity Matches
        </h1>
        <p className="text-sm text-text-tertiary mt-1">
          Explore celebrity charts, compatibility, and cosmic forecasts
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          placeholder="Search celebrities..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 py-3 bg-bg-secondary border border-border-primary rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary transition-all"
        />
        {searchQuery.length > 0 && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {isSearchActive ? (
        <div className="min-h-[200px]">
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-accent-primary animate-spin" />
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-primary font-semibold">No results</p>
              <p className="text-sm text-text-muted mt-1">Try a different name or spelling</p>
            </div>
          ) : (
            <div className="space-y-0">
              {searchResults.map((celeb) => (
                <SearchRow
                  key={celeb.id}
                  celebrity={celeb}
                  onClick={() => goToProfile(celeb)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Browse Content */
        <>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
            </div>
          ) : (
            <>
              {/* Trending */}
              <CarouselSection
                title="Trending"
                icon={<TrendingUp className="w-5 h-5 text-[#9B6FF6]" />}
                data={trending}
                onCelebClick={goToProfile}
              />

              {/* Recently Added */}
              <CarouselSection
                title="Recently Added"
                icon={<Clock className="w-5 h-5 text-[#9B6FF6]" />}
                data={recent}
                onCelebClick={goToProfile}
              />

              {/* Category Chips */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 className="text-lg font-bold text-text-primary">Browse by Category</h2>
                  {activeCategory && (
                    <button
                      onClick={() => { setActiveCategory(null); setCategoryResults([]); }}
                      className="text-sm text-accent-primary font-semibold hover:underline"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {CELEBRITY_CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.value;
                    return (
                      <button
                        key={cat.value}
                        onClick={() => selectCategory(cat.value)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border transition-all ${
                          isActive
                            ? 'bg-accent-primary/15 border-accent-primary text-accent-primary'
                            : 'bg-bg-secondary border-border-primary text-text-muted hover:text-text-secondary hover:border-text-muted'
                        }`}
                      >
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Category Results */}
                {activeCategory && (
                  <div>
                    {categoryLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-accent-primary animate-spin" />
                      </div>
                    ) : categoryResults.length === 0 ? (
                      <p className="text-sm text-text-muted text-center py-4">
                        No celebrities in this category yet
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {categoryResults.map((celeb) => (
                          <CelebCard
                            key={celeb.id}
                            celebrity={celeb}
                            onClick={() => goToProfile(celeb)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Favorites */}
              {favorites.length > 0 && (
                <CarouselSection
                  title="Your Favorites"
                  icon={<Heart className="w-5 h-5 text-red-400" />}
                  data={favorites}
                  onCelebClick={goToProfile}
                />
              )}

              {/* Empty state */}
              {trending.length === 0 && recent.length === 0 && favorites.length === 0 && !activeCategory && (
                <div className="text-center py-16">
                  <Star className="w-12 h-12 text-text-muted mx-auto mb-3" />
                  <p className="text-text-primary font-semibold text-lg">No celebrities yet</p>
                  <p className="text-sm text-text-muted mt-1">
                    Search for someone or check back soon
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
