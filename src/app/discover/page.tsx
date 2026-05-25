'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { getSuggestedFriends, type SuggestedUser } from '@/lib/discoveryService';
import Link from 'next/link';
import { Search, ChevronRight, Shield } from 'lucide-react';
import { sanitizeSearchInput } from '@/lib/sanitize';
import { useTranslation } from 'react-i18next';

// ── Helpers ──────────────────────────────────────────────────────────

function getMoonPhaseInfo() {
  const synodic = 29.530588853;
  const known_new = new Date('2024-01-11').getTime();
  const diff = (Date.now() - known_new) / (1000 * 60 * 60 * 24);
  const phase = ((diff % synodic) + synodic) % synodic;
  if (phase < 1.85) return { emoji: '🌑', name: 'New Moon', nameKey: 'discover.moonPhases.newMoon', sign: getMoonSign(phase) };
  if (phase < 7.38) return { emoji: '🌒', name: 'Waxing Crescent', nameKey: 'discover.moonPhases.waxingCrescent', sign: getMoonSign(phase) };
  if (phase < 11.07) return { emoji: '🌓', name: 'First Quarter', nameKey: 'discover.moonPhases.firstQuarter', sign: getMoonSign(phase) };
  if (phase < 14.76) return { emoji: '🌔', name: 'Waxing Gibbous', nameKey: 'discover.moonPhases.waxingGibbous', sign: getMoonSign(phase) };
  if (phase < 16.61) return { emoji: '🌕', name: 'Full Moon', nameKey: 'discover.moonPhases.fullMoon', sign: getMoonSign(phase) };
  if (phase < 22.14) return { emoji: '🌖', name: 'Waning Gibbous', nameKey: 'discover.moonPhases.waningGibbous', sign: getMoonSign(phase) };
  if (phase < 25.83) return { emoji: '🌗', name: 'Last Quarter', nameKey: 'discover.moonPhases.lastQuarter', sign: getMoonSign(phase) };
  return { emoji: '🌘', name: 'Waning Crescent', nameKey: 'discover.moonPhases.waningCrescent', sign: getMoonSign(phase) };
}

function getMoonSign(phase: number): string {
  const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const idx = Math.floor((phase / 29.530588853) * 12) % 12;
  return signs[idx];
}

function getCurrentSunSign(): string {
  const m = new Date().getMonth(), d = new Date().getDate();
  const signs = ['Capricorn','Aquarius','Pisces','Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius'];
  const cutoffs = [20,19,20,20,21,21,22,23,23,23,22,22];
  return d < cutoffs[m] ? signs[m] : signs[(m + 1) % 12];
}

function timeAgo(dateStr: string): string {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getUpcomingCosmicEvents(): { emoji: string; title: string; date: string; sign: string }[] {
  const events: { emoji: string; title: string; date: string; sign: string }[] = [];
  const synodic = 29.530588853;
  const known_new = new Date('2024-01-11').getTime();
  const now = Date.now();
  const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

  // Find next 4 moon phases
  for (let dayOffset = 0; dayOffset <= 35; dayOffset++) {
    const checkTime = now + dayOffset * 86400000;
    const diff = (checkTime - known_new) / 86400000;
    const phase = ((diff % synodic) + synodic) % synodic;
    const prevPhase = (((diff - 1) % synodic) + synodic) % synodic;
    const moonSign = signs[Math.floor((phase / synodic) * 12) % 12];
    const dateStr = new Date(checkTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

    if (prevPhase > phase) { events.push({ emoji: '🌑', title: 'New Moon', date: dateStr, sign: moonSign }); }
    else if (prevPhase < 7.38 && phase >= 7.38) { events.push({ emoji: '🌓', title: 'First Quarter', date: dateStr, sign: moonSign }); }
    else if (prevPhase < 14.76 && phase >= 14.76) { events.push({ emoji: '🌕', title: 'Full Moon', date: dateStr, sign: moonSign }); }
    else if (prevPhase < 22.14 && phase >= 22.14) { events.push({ emoji: '🌗', title: 'Last Quarter', date: dateStr, sign: moonSign }); }

    if (events.length >= 4) break;
  }
  return events;
}

const SIGN_GLYPHS: Record<string, string> = {
  Aries:'♈', Taurus:'♉', Gemini:'♊', Cancer:'♋', Leo:'♌', Virgo:'♍',
  Libra:'♎', Scorpio:'♏', Sagittarius:'♐', Capricorn:'♑', Aquarius:'♒', Pisces:'♓',
};

// ── Feature Banners (matches mobile exactly) ────────────────────────

const FEATURE_BANNERS = [
  { href: '/reels', emoji: '🎬', title: 'Reels', sub: 'Watch and share short videos', gradient: 'from-[#E11D48] to-[#9333EA]' },
  { href: '/celebrity-matches', emoji: '⭐', title: 'Celebrity Matches', sub: 'Check your compatibility with famous people', gradient: 'from-[#F59E0B] to-[#D97706]' },
  { href: '/cosmic-index', emoji: '🪐', title: 'Cosmic Index', sub: 'Find people by planet, sign, house & degree', gradient: 'from-[#6366F1] to-[#4338CA]' },
  { href: '/polls', emoji: '📊', title: 'Polls', sub: 'Vote and create community polls', gradient: 'from-[#10B981] to-[#059669]' },
  { href: '/qa', emoji: '❓', title: 'Q&A', sub: 'Ask questions and share cosmic wisdom', gradient: 'from-[#F97316] to-[#EA580C]' },
];

// ── Popular Readings ────────────────────────────────────────────────

const POPULAR_READINGS = [
  { key: 'aiAstrologer', title: 'AI Astrologer', emoji: '✦', description: 'Chat with your personal AI astrologer', href: '/ai', gradient: 'from-[#6D28D9] to-[#4C1D95]' },
  { key: 'fullNatal', title: 'Full Natal Reading', emoji: '🌟', description: 'Deep dive into your complete birth chart', href: '/chart', gradient: 'from-[#6D28D9] to-[#4C1D95]' },
  { key: 'transit', title: 'Current Transits', emoji: '🪐', description: 'What the planets are doing to your chart', href: '/readings/transits', gradient: 'from-[#2563EB] to-[#1E40AF]' },
  { key: 'solarReturn', title: 'Solar Return', emoji: '☀️', description: 'Your birthday chart — themes for the year', href: '/chart/solar-return', gradient: 'from-[#D97706] to-[#92400E]' },
  { key: 'lunarReturn', title: 'Lunar Return', emoji: '🌙', description: 'Your monthly emotional forecast', href: '/chart/lunar-return', gradient: 'from-[#D97706] to-[#92400E]' },
  { key: 'progressed', title: 'Progressed Chart', emoji: '🔮', description: 'How your chart has evolved over your lifetime', href: '/chart/progressed', gradient: 'from-[#D97706] to-[#92400E]' },
  { key: 'synastry', title: 'Synastry', emoji: '💞', description: 'Compare your chart with someone special', href: '/chart/synastry', gradient: 'from-[#EC4899] to-[#BE185D]' },
  { key: 'composite', title: 'Composite Chart', emoji: '🔗', description: 'The chart of your relationship itself', href: '/chart/composite', gradient: 'from-[#EC4899] to-[#BE185D]' },
];

// ── Featured Hashtags ───────────────────────────────────────────────

const FEATURED_HASHTAGS = [
  '#SaturnReturn', '#MercuryRetrograde', '#FullMoon', '#NewMoon',
  '#SynastrySunday', '#TransitTuesday', '#BigThree', '#AstroMemes',
  '#PlutoGeneration', '#NorthNode', '#Chiron', '#LunarEclipse',
  '#VenusReturn', '#12thHouse', '#CosmicWeather', '#BirthChart',
];

// ── Post type labels ────────────────────────────────────────────────

const POST_TYPE_LABELS: Record<string, { emoji: string; label: string }> = {
  text: { emoji: '💬', label: 'Post' },
  chart_share: { emoji: '🔭', label: 'Chart' },
  reading_share: { emoji: '✨', label: 'Reading' },
  photo: { emoji: '📷', label: 'Photo' },
  video: { emoji: '🎬', label: 'Video' },
  transit_alert: { emoji: '🪐', label: 'Transit' },
  compatibility_result: { emoji: '💕', label: 'Compatibility' },
};

// ── Page ─────────────────────────────────────────────────────────────

export default function DiscoverPage() {
  const { t } = useTranslation();
  const { user, profile } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [newUsers, setNewUsers] = useState<any[]>([]);
  const [suggestedFriends, setSuggestedFriends] = useState<SuggestedUser[]>([]);
  const [searching, setSearching] = useState(false);

  const moon = getMoonPhaseInfo();
  const sunSign = getCurrentSunSign();
  const cosmicEvents = getUpcomingCosmicEvents();

  useEffect(() => {
    loadDiscoverContent();
    if (user?.id) {
      getSuggestedFriends(user.id, 8).then(setSuggestedFriends);
    }
  }, [user?.id]);

  async function loadDiscoverContent() {
    const supabase = createClient();

    const [postsRes, communitiesRes, usersRes] = await Promise.all([
      supabase
        .from('posts')
        .select('id, content, type, created_at, user_id, profile:profiles!posts_user_id_fkey(display_name, avatar_url, sun_sign)')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('communities')
        .select('id, name, description, category, member_count')
        .eq('is_deleted', false)
        .order('member_count', { ascending: false })
        .limit(8),
      supabase
        .from('profiles')
        .select('id, display_name, avatar_url, sun_sign')
        .order('created_at', { ascending: false })
        .limit(12),
    ]);

    if (postsRes.data) setTrendingPosts(postsRes.data);
    if (communitiesRes.data) setCommunities(communitiesRes.data);
    if (usersRes.data) setNewUsers(usersRes.data.filter((u: any) => u.id !== user?.id));
  }

  async function handleSearch(query: string) {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, sun_sign, moon_sign')
      .ilike('display_name', `%${sanitizeSearchInput(query)}%`)
      .limit(10);
    setSearchResults(data || []);
    setSearching(false);
  }

  const COMMUNITY_EMOJIS: Record<string, string> = {
    general: '🌍', astrology: '🔭', zodiac: '♈', tarot: '🃏', spirituality: '🕊️',
    relationships: '💕', career: '💼', health: '🌿', memes: '😂', learning: '📚',
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <h1 className="text-3xl font-display font-bold text-text-primary mb-6">{t('discover.title')}</h1>

      {/* Search */}
      <div className="relative mb-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search users, topics..."
          className="input pl-12"
        />
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-bg-card border border-border-primary rounded-xl shadow-lg z-30 max-h-72 overflow-y-auto">
            {searchResults.map((u) => (
              <Link
                key={u.id}
                href={`/user/${u.id}`}
                className="flex items-center gap-3 p-3 hover:bg-bg-tertiary transition-colors"
                onClick={() => { setSearchQuery(''); setSearchResults([]); }}
              >
                <div className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {u.avatar_url ? (
                    <Image src={u.avatar_url} alt="User avatar" width={40} height={40} className="w-full h-full rounded-full object-cover" unoptimized />
                  ) : (
                    <span className="text-sm font-bold text-accent-primary">{(u.display_name || '?')[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{u.display_name}</p>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    {u.sun_sign && <span>{SIGN_GLYPHS[u.sun_sign] || ''} {u.sun_sign}</span>}
                    {u.moon_sign && <span>· 🌙 {u.moon_sign}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Feature Banners (5 gradient cards matching mobile) ── */}
      <div className="space-y-3 mb-8">
        {FEATURE_BANNERS.map((b) => (
          <Link
            key={b.href}
            href={b.href}
            className={`flex items-center gap-4 rounded-2xl p-5 bg-gradient-to-r ${b.gradient} hover:opacity-90 transition-opacity`}
          >
            <span className="text-3xl">{b.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-white">{b.title}</p>
              <p className="text-sm text-white/80">{b.sub}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/60 flex-shrink-0" />
          </Link>
        ))}
      </div>

      {/* ── Cosmic Weather Banner ── */}
      <div className="rounded-2xl p-5 mb-8" style={{ background: 'linear-gradient(135deg, #1E1440, #2D1B69, #1A1035)' }}>
        <div className="flex items-center gap-4">
          <span className="text-5xl">{moon.emoji}</span>
          <div>
            <p className="text-lg font-bold text-white">Cosmic Weather</p>
            <p className="text-sm text-white/80">{t(moon.nameKey)} in {moon.sign}</p>
            <p className="text-xs text-white/50 mt-1">Sun in {sunSign} · {SIGN_GLYPHS[sunSign]} Season</p>
          </div>
        </div>
      </div>

      {/* ── Popular Readings (horizontal scroll) ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
          <span className="text-xl">🔥</span> Popular Readings
        </h2>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {POPULAR_READINGS.map((r) => (
            <Link
              key={r.key}
              href={r.href}
              className={`flex-shrink-0 w-40 rounded-2xl p-4 bg-gradient-to-br ${r.gradient} hover:opacity-90 transition-opacity`}
            >
              <span className="text-3xl block mb-2">{r.emoji}</span>
              <p className="text-sm font-bold text-white">{r.title}</p>
              <p className="text-[11px] text-white/70 mt-1 line-clamp-2">{r.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Upcoming Cosmic Events ── */}
      {cosmicEvents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
            <span className="text-xl">🌌</span> Upcoming Cosmic Events
          </h2>
          <div className="space-y-2">
            {cosmicEvents.map((evt, i) => (
              <div key={i} className="card flex items-center gap-4 !py-3 !px-4">
                <span className="text-3xl">{evt.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">
                    {evt.emoji} {evt.title} in {evt.sign}
                  </p>
                  <p className="text-xs text-text-muted">{evt.date} · {evt.sign}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Cosmic Alerts Banner ── */}
      <Link
        href="/cosmic-alerts"
        className="flex items-center gap-4 rounded-2xl p-5 mb-8 hover:opacity-90 transition-opacity"
        style={{ background: 'linear-gradient(135deg, #6D28D9, #4C1D95)' }}
      >
        <span className="text-3xl">🔔</span>
        <div className="flex-1">
          <p className="text-base font-bold text-white">Cosmic Alerts</p>
          <p className="text-sm text-white/80">Personalized transit notifications for your chart</p>
        </div>
        <ChevronRight className="w-5 h-5 text-white/60 flex-shrink-0" />
      </Link>

      {/* ── Trending Posts ── */}
      {trendingPosts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
            <span className="text-xl">📈</span> Trending Posts
          </h2>
          <div className="space-y-3">
            {trendingPosts.map((post: any) => {
              const p = post.profile as any;
              const typeInfo = POST_TYPE_LABELS[post.type] || POST_TYPE_LABELS.text;
              return (
                <Link key={post.id} href="/feed" className="card block hover:border-accent-primary/30 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-accent-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {p?.avatar_url ? (
                        <Image src={p.avatar_url} alt="User avatar" width={36} height={36} className="w-full h-full rounded-full object-cover" unoptimized />
                      ) : (
                        <span className="text-xs font-bold text-accent-primary">{(p?.display_name || '?')[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-text-primary truncate">{p?.display_name}</span>
                        <span className="text-[10px] text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded">
                          {typeInfo.emoji} {typeInfo.label}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted">{timeAgo(post.created_at)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-3">{post.content}</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Popular Communities (horizontal scroll) ── */}
      {communities.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
            <span className="text-xl">🏛️</span> Popular Communities
          </h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {communities.map((c: any) => (
              <Link
                key={c.id}
                href={`/communities/${c.id}`}
                className="flex-shrink-0 w-40 card hover:border-accent-primary/30 transition-colors"
              >
                <span className="text-2xl block mb-2">{COMMUNITY_EMOJIS[c.category] || '🌍'}</span>
                <p className="text-sm font-semibold text-text-primary truncate">{c.name}</p>
                <p className="text-xs text-accent-primary font-medium">{c.member_count || 0} members</p>
                {c.description && (
                  <p className="text-[11px] text-text-muted mt-1 line-clamp-2">{c.description}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Suggested For You (zodiac compatibility) ── */}
      {suggestedFriends.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
            <span className="text-xl">💫</span> Suggested For You
          </h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {suggestedFriends.map((u) => (
              <Link
                key={u.id}
                href={`/user/${u.id}`}
                className="flex-shrink-0 w-28 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-accent-muted flex items-center justify-center mx-auto mb-1.5 text-base font-bold text-accent-primary overflow-hidden">
                  {u.avatar_url ? (
                    <Image src={u.avatar_url} alt="User avatar" width={56} height={56} className="w-full h-full rounded-full object-cover" unoptimized />
                  ) : (
                    (u.display_name || '?')[0].toUpperCase()
                  )}
                </div>
                <p className="text-xs text-text-primary font-medium truncate">{u.display_name}</p>
                <p className="text-[10px] text-accent-primary truncate">{u.reason}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── New on Align (horizontal scroll) ── */}
      {newUsers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
            <span className="text-xl">👋</span> New on Align
          </h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {newUsers.map((u) => (
              <Link
                key={u.id}
                href={`/user/${u.id}`}
                className="flex-shrink-0 w-24 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-accent-muted flex items-center justify-center mx-auto mb-1.5 text-base font-bold text-accent-primary overflow-hidden">
                  {u.avatar_url ? (
                    <Image src={u.avatar_url} alt="User avatar" width={56} height={56} className="w-full h-full rounded-full object-cover" unoptimized />
                  ) : (
                    (u.display_name || '?')[0].toUpperCase()
                  )}
                </div>
                <p className="text-xs text-text-primary font-medium truncate">{u.display_name}</p>
                {u.sun_sign && (
                  <p className="text-[10px] text-text-muted">{SIGN_GLYPHS[u.sun_sign] || ''} {u.sun_sign}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Trending Topics (hashtag chips) ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
          <span className="text-xl">#️⃣</span> Trending Topics
        </h2>
        <div className="flex flex-wrap gap-2">
          {FEATURED_HASHTAGS.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 rounded-full bg-bg-card border border-border-primary text-xs text-text-secondary hover:border-accent-primary/40 hover:text-accent-primary transition-colors cursor-default"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ── Admin (only if admin) ── */}
      {profile?.is_admin && (
        <Link href="/admin" className="card flex items-center gap-3 mb-8 hover:border-red-400/30 transition-colors">
          <Shield className="w-5 h-5 text-red-400" />
          <span className="text-sm font-medium text-text-primary">{t('settings.admin.title')}</span>
          <ChevronRight className="w-4 h-4 text-text-muted ml-auto" />
        </Link>
      )}
    </div>
  );
}
