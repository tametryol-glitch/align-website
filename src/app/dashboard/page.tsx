'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/stores/authStore';
import { api, buildBirthData } from '@/lib/api';
import { formatDate, getZodiacGlyph, getPlanetGlyph } from '@/lib/utils';
import { createClient } from '@/lib/supabase';
import { getFeed, FeedPost } from '@/lib/feedService';
import { UserAvatar } from '@/components/ui/UserAvatar';
import Link from 'next/link';
import { Bell, ChevronRight, Globe } from 'lucide-react';
import { StreakBadge } from '@/components/ui/StreakBadge';
import { useStreakStore } from '@/stores/streakStore';
import { useTranslation } from 'react-i18next';
import { useWhatsNew } from '@/hooks/useWhatsNew';
import { WhatsNewModal } from '@/components/ui/WhatsNewModal';
import { useGettingStarted } from '@/hooks/useGettingStarted';
import { GettingStartedChecklist } from '@/components/ui/GettingStartedChecklist';
import { PurposeCheckinCard } from '@/components/PurposeCheckinCard';
import { EarthlyPurposeCard } from '@/components/EarthlyPurposeCard';
import { SoulPurposeCard } from '@/components/SoulPurposeCard';
import { TodayCard, type TodayData } from '@/components/TodayCard';
import { useCoachmarks } from '@/hooks/useCoachmarks';
import { CoachmarkOverlay } from '@/components/ui/CoachmarkOverlay';

// ── Astronomical helpers ─────────────────────────────────────────

const MOON_PHASE_TABLE = [
  { name: 'New Moon', emoji: '🌑', max: 1.85 },
  { name: 'Waxing Crescent', emoji: '🌒', max: 7.38 },
  { name: 'First Quarter', emoji: '🌓', max: 9.22 },
  { name: 'Waxing Gibbous', emoji: '🌔', max: 14.77 },
  { name: 'Full Moon', emoji: '🌕', max: 16.61 },
  { name: 'Waning Gibbous', emoji: '🌖', max: 22.15 },
  { name: 'Last Quarter', emoji: '🌗', max: 23.99 },
  { name: 'Waning Crescent', emoji: '🌘', max: 29.53 },
];

function getMoonPhaseFromSynodic(): { phase: string; emoji: string } {
  const now = new Date();
  const synodic = 29.530588853;
  const known_new = new Date('2024-01-11').getTime();
  const diff = (now.getTime() - known_new) / (1000 * 60 * 60 * 24);
  const dayEquiv = ((diff % synodic) + synodic) % synodic;
  const entry = MOON_PHASE_TABLE.find(p => dayEquiv < p.max) || MOON_PHASE_TABLE[7];
  return { phase: entry.name, emoji: entry.emoji };
}

function getMoonPhaseFromLongitudes(sunLon: number, moonLon: number): { phase: string; emoji: string } {
  const elongation = ((moonLon - sunLon) % 360 + 360) % 360;
  const dayEquiv = (elongation / 360) * 29.53058867;
  const entry = MOON_PHASE_TABLE.find(p => dayEquiv < p.max) || MOON_PHASE_TABLE[7];
  return { phase: entry.name, emoji: entry.emoji };
}

const CHALDEAN_GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃', Venus: '♀', Saturn: '♄',
  Vesta: '⚶', Juno: '⚵', Pluto: '♇', Uranus: '♅', Neptune: '♆',
};

function getCurrentSign(): string {
  const month = new Date().getMonth();
  const day = new Date().getDate();
  const signs = [
    'Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini',
    'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius',
  ];
  const cutoffs = [20, 19, 20, 20, 21, 21, 22, 23, 23, 23, 22, 22];
  return day < cutoffs[month] ? signs[month] : signs[(month + 1) % 12];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning ☀️';
  if (hour < 17) return 'Good afternoon 🌤️';
  if (hour < 21) return 'Good evening 🌅';
  return 'Good night 🌙';
}

// ── World Echo teaser pool ──────────────────────────────────────
// Deterministic "today in cosmic history" — rotates daily by day-of-year.
// Used as fallback when the live API scan is unavailable.
const WORLD_ECHO_TEASERS = [
  { year: 1969, event: 'Apollo 11 lands on the Moon — humanity walks among the stars' },
  { year: 1989, event: 'The Berlin Wall falls — a world order reshapes overnight' },
  { year: 1930, event: 'Clyde Tombaugh discovers Pluto at Lowell Observatory' },
  { year: 1945, event: 'The United Nations is founded in San Francisco' },
  { year: 1912, event: 'The Titanic sinks under a moonless April sky' },
  { year: 1953, event: 'Watson and Crick reveal the double helix of DNA' },
  { year: 1961, event: 'Yuri Gagarin becomes the first human in space' },
  { year: 1963, event: 'Martin Luther King Jr. delivers "I Have a Dream"' },
  { year: 1859, event: 'The Carrington Event — the strongest geomagnetic storm in recorded history' },
  { year: 1666, event: 'The Great Fire of London reshapes a city and an era' },
  { year: 1776, event: 'The Declaration of Independence is signed under Cancer season' },
  { year: 1986, event: 'The Chernobyl disaster changes nuclear energy forever' },
  { year: 2001, event: 'Wikipedia launches — the age of collective knowledge begins' },
  { year: 1687, event: 'Newton publishes Principia Mathematica — gravity gets a formula' },
  { year: 1492, event: 'Columbus reaches the New World under a Jupiter-Saturn conjunction' },
  { year: 1789, event: 'The French Revolution erupts — liberty, equality, fraternity' },
  { year: 1815, event: 'Mount Tambora erupts, creating the "Year Without a Summer"' },
  { year: 1905, event: 'Einstein publishes special relativity — spacetime is born' },
  { year: 1947, event: 'The Roswell incident captures the world\'s imagination' },
  { year: 1977, event: 'Voyager 1 launches — carrying Earth\'s golden record into the cosmos' },
  { year: 1969, event: 'Woodstock draws 400,000 — a cultural supernova under Leo season' },
  { year: 2008, event: 'The global financial crisis peaks — Pluto enters Capricorn' },
  { year: 1859, event: 'Darwin publishes On the Origin of Species — evolution goes public' },
  { year: 1928, event: 'Alexander Fleming discovers penicillin by accident' },
  { year: 1903, event: 'The Wright brothers achieve powered flight at Kitty Hawk' },
  { year: 1969, event: 'ARPANET sends its first message — the internet is born' },
  { year: 1610, event: 'Galileo observes Jupiter\'s moons — the heliocentric revolution accelerates' },
  { year: 1994, event: 'Comet Shoemaker-Levy 9 collides with Jupiter — a cosmic spectacle' },
  { year: 2004, event: 'The Indian Ocean tsunami reshapes coastlines and consciousness' },
  { year: 1755, event: 'The Lisbon earthquake shatters Enlightenment optimism' },
  { year: 1543, event: 'Copernicus publishes De Revolutionibus — Earth is no longer the center' },
  { year: 1945, event: 'Trinity test detonates — humanity enters the atomic age' },
  { year: 1889, event: 'The Eiffel Tower opens — engineering meets audacity' },
  { year: 2011, event: 'The Arab Spring spreads across the Middle East under Uranus in Aries' },
  { year: 1804, event: 'Napoleon crowns himself Emperor under a Mars-Jupiter conjunction' },
  { year: 1918, event: 'The Spanish Flu pandemic begins — reshaping the 20th century' },
];

function getWorldEchoTeaser(): { year: number; event: string } {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return WORLD_ECHO_TEASERS[dayOfYear % WORLD_ECHO_TEASERS.length];
}

// ── Types ────────────────────────────────────────────────────────

interface Friend {
  friendship_id: string;
  friend_id: string;
  display_name: string;
  avatar_url: string | null;
  sun_sign: string | null;
  is_online?: boolean;
}

interface TransitPosition {
  name: string;
  sign: string;
  longitude?: number;
  retrograde: boolean;
  degree?: number;
}

// ── Main Component ───────────────────────────────────────────────

export default function DashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const name = profile?.display_name || user?.user_metadata?.name || 'Stargazer';
  const firstName = name.split(' ')[0];
  const sunSign = profile?.sun_sign || getCurrentSign();

  // State
  const [liveTransits, setLiveTransits] = useState<TransitPosition[]>([]);
  // Raw transit + natal positions for the Today card; null until fetched.
  const [todayData, setTodayData] = useState<TodayData | null>(null);
  const [todayLoading, setTodayLoading] = useState(true);
  const [moonSign, setMoonSign] = useState('');
  const [moonPhase, setMoonPhase] = useState(getMoonPhaseFromSynodic());
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [echoTeaser, setEchoTeaser] = useState<{ year: number; event: string } | null>(null);

  const hasBirthData = !!(profile?.birth_date && profile?.latitude);

  // Guidance systems
  const { entry: whatsNewEntry, markSeen: markWhatsNewSeen } = useWhatsNew();
  const gettingStarted = useGettingStarted();
  const coachmarks = useCoachmarks();

  // Load social + feed + streak data when user is available
  useEffect(() => {
    if (!user) return;
    loadSocialData();
    loadFeedPreview();
    useStreakStore.getState().fetchStreak(user.id);
    loadEchoTeaser();
  }, [user]);

  // Load astro data separately — depends on profile being fully loaded
  useEffect(() => {
    if (!user || !profile?.birth_date || !profile?.latitude) return;
    loadAstroData();
  }, [user, profile?.birth_date, profile?.latitude]);

  const loadSocialData = useCallback(async () => {
    if (!user) return;
    const supabase = createClient();

    try {
      // Friends
      const { data: friendships } = await supabase
        .from('friendships')
        .select('id, user_id, friend_id, status')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .limit(8);

      if (friendships && friendships.length > 0) {
        const otherIds = friendships.map(f =>
          f.user_id === user.id ? f.friend_id : f.user_id
        );
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, sun_sign')
          .in('id', otherIds);

        if (profiles) {
          setFriends(friendships.map(f => {
            const otherId = f.user_id === user.id ? f.friend_id : f.user_id;
            const p = profiles.find(pr => pr.id === otherId);
            return {
              friendship_id: f.id,
              friend_id: otherId,
              display_name: p?.display_name || 'Unknown',
              avatar_url: p?.avatar_url || null,
              sun_sign: p?.sun_sign || null,
            };
          }));
        }
      }

      // Pending friend requests
      const { count: pendingCount } = await supabase
        .from('friendships')
        .select('id', { count: 'exact', head: true })
        .eq('friend_id', user.id)
        .eq('status', 'pending');
      setPendingRequests(pendingCount || 0);

      // Unread notifications
      const { count: notifCount } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      setUnreadNotifs(notifCount || 0);

      // Unread messages
      const { count: msgCount } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .neq('sender_id', user.id)
        .eq('is_read', false);
      setUnreadMessages(msgCount || 0);
    } catch {
      // Silent
    }
  }, [user]);

  async function loadFeedPreview() {
    if (!user) return;
    try {
      const posts = await getFeed(user.id);
      setFeedPosts(posts.slice(0, 3));
    } catch {
      // Silent
    }
  }

  async function loadEchoTeaser() {
    try {
      const scan = await api.getWorldEchoToday();
      const hits = scan?.possible_hits_json || [];
      if (hits.length > 0) {
        const top = hits[0];
        setEchoTeaser({
          year: new Date(top.event_date + 'T00:00:00').getFullYear(),
          event: top.title,
        });
        return;
      }
    } catch {
      // Silent — fall through to deterministic teaser
    }
    setEchoTeaser(getWorldEchoTeaser());
  }

  async function loadAstroData() {
    try {
      const currentProfile = useAuthStore.getState().profile;
      if (currentProfile?.birth_date && currentProfile?.latitude) {
        const data = await api.getCurrentTransits(buildBirthData(currentProfile));
        const positions = data?.transit_positions || data?.transits || [];
        if (Array.isArray(positions) && positions.length > 0) {
          const toBody = (p: any) => ({ name: p.name, longitude: p.longitude });
          setTodayData({
            transits: positions.map(toBody),
            natal: (Array.isArray(data?.natal_positions) ? data.natal_positions : []).map(toBody),
          });
          const showPlanets = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Vesta', 'Juno', 'Pluto', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
          const mapped = positions.map((p: any) => ({
            name: p.name,
            sign: p.sign,
            longitude: p.longitude ?? 0,
            retrograde: p.is_retrograde ?? false,
            degree: p.sign_degree ?? 0,
          }));
          const filtered = mapped.filter((t: TransitPosition) => showPlanets.includes(t.name));
          filtered.sort((a: TransitPosition, b: TransitPosition) => showPlanets.indexOf(a.name) - showPlanets.indexOf(b.name));
          setLiveTransits(filtered);

          const sun = mapped.find((t: TransitPosition) => t.name === 'Sun');
          const moon = mapped.find((t: TransitPosition) => t.name === 'Moon');
          if (moon) setMoonSign(moon.sign);
          if (sun && moon && sun.longitude && moon.longitude) {
            setMoonPhase(getMoonPhaseFromLongitudes(sun.longitude, moon.longitude));
          }
        }
      }
    } catch {
      // Silent — synodic fallback already shown
    } finally {
      setTodayLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* ─── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">
            {getGreeting().replace(/☀️|🌤️|🌅|🌙/, '')} {firstName}
          </h1>
          <p className="text-sm text-text-tertiary mt-0.5">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Daily streak badge */}
          <StreakBadge />
          {/* Notification bell */}
          <Link href="/notifications" className="relative p-2">
            <Bell className="w-5 h-5 text-text-muted" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white font-bold px-1">
                {unreadNotifs > 9 ? '9+' : unreadNotifs}
              </span>
            )}
          </Link>
          {/* User avatar */}
          <Link href="/profile">
            <UserAvatar
              avatarUrl={profile?.avatar_url}
              displayName={firstName}
              size="lg"
              className="ring-2 ring-accent-primary"
            />
          </Link>
        </div>
      </div>

      {/* ─── Today for you: the one answer ───────────────── */}
      <TodayCard
        hasBirthData={hasBirthData}
        birthTimeKnown={!!profile?.birth_time}
        data={todayData}
        loading={todayLoading && hasBirthData}
        latitude={profile?.latitude}
        longitude={profile?.longitude}
        moonPhase={moonPhase}
      />

      {/* ─── Getting Started Checklist ───────────────────── */}
      {!gettingStarted.isDismissed && !gettingStarted.isAllDone && (
        <GettingStartedChecklist
          items={gettingStarted.items}
          completedIds={gettingStarted.completedIds}
          completedCount={gettingStarted.completedCount}
          totalCount={gettingStarted.totalCount}
          isAllDone={gettingStarted.isAllDone}
          onDismiss={gettingStarted.dismiss}
          onMarkComplete={gettingStarted.markComplete}
        />
      )}

      {/* Your Earthly Purpose — Earth (opposite the Sun) read on open */}
      {/* Biweekly purpose check-in — renders only when one is due. */}
      <PurposeCheckinCard profile={profile} />

      <EarthlyPurposeCard profile={profile} />

      {/* Your Soul Purpose — North Node (evolutionary direction) read on open */}
      <SoulPurposeCard profile={profile} />

      {/* ─── Share Your Chart Card ──────────────────────────── */}
      {profile?.sun_sign && profile?.moon_sign && profile?.rising_sign && (
        <Link href="/profile#share" className="block">
          <div
            className="rounded-2xl p-4 border border-purple-500/20 flex items-center gap-4 hover:border-purple-500/40 transition-colors"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,31,128,0.12))' }}
          >
            <span className="text-2xl">✦</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-text-primary">Share Your Chart Card</p>
              <p className="text-xs text-text-muted mt-0.5">Show your Big Three + a soul line that hits different</p>
            </div>
            <ChevronRight className="w-4 h-4 text-accent-primary" />
          </div>
        </Link>
      )}

      {/* ─── Soul Age Calculator ──────────────────────────────
          Always FREE — never gate this behind a plan, trial or token check. */}
      <Link href="/soul-age" className="block">
        <div
          className="rounded-2xl p-4 border border-accent-primary/30 relative overflow-hidden hover:border-accent-primary/50 transition-colors"
          style={{ background: 'linear-gradient(135deg, rgba(155,111,246,0.18), rgba(236,72,153,0.10))' }}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl leading-none mt-0.5">∞</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-text-primary">{t('soulAge.title')}</p>
                <span className="text-[9px] font-extrabold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500 text-emerald-950">{t('soulAge.free')}</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">{t('soulAge.subtitle')}</p>
              <span className="inline-flex items-center gap-1 text-accent-primary text-xs font-medium mt-2">{t('soulAge.calculateMine')} <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* ─── World Echo: Today in Cosmic History ─────────────── */}
      {echoTeaser && (
        <Link href="/world-echo" className="block">
          <div
            className="rounded-2xl p-4 border border-emerald-500/20 relative overflow-hidden hover:border-emerald-400/40 transition-colors"
            style={{ background: 'linear-gradient(135deg, #0F2027, #162a35, #1a3a2a)' }}
          >
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-emerald-400/80 text-[10px] font-semibold uppercase tracking-[2px] mb-1.5">
                  {t('home.worldEchoTitle', 'Today in Cosmic History')}
                </p>
                <p className="text-sm text-text-primary leading-relaxed line-clamp-2">
                  {echoTeaser.event}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {echoTeaser.year} — {t('home.worldEchoSimilar', 'under alignments mirroring today\'s sky')}
                </p>
                <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium mt-2">
                  {t('home.worldEchoSeeMore', 'Explore more echoes')} <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* ─── Social Activity ────────────────────────────────── */}
      {(pendingRequests > 0 || friends.length > 0) && (
        <div className="space-y-3">
          {/* Friend requests banner */}
          {pendingRequests > 0 && (
            <Link
              href="/friends"
              className="flex items-center gap-3 bg-accent-primary/10 border border-accent-primary/25 rounded-xl px-4 py-3"
            >
              <span className="text-xl">👤</span>
              <span className="flex-1 text-sm font-semibold text-accent-primary">
                {pendingRequests} friend request{pendingRequests > 1 ? 's' : ''}
              </span>
              <ChevronRight className="w-4 h-4 text-accent-primary" />
            </Link>
          )}

          {/* Friends horizontal scroll */}
          {friends.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-text-primary">Friends</h3>
                <Link href="/friends" className="text-xs text-accent-primary hover:underline">See all</Link>
              </div>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                {friends.map(friend => (
                  <Link
                    key={friend.friendship_id}
                    href={`/user/${friend.friend_id}`}
                    className="flex flex-col items-center gap-1 min-w-[60px]"
                  >
                    <div className="relative">
                      <UserAvatar
                        avatarUrl={friend.avatar_url}
                        displayName={friend.display_name}
                        size="lg"
                      />
                      {/* Online indicator */}
                      <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-bg-primary" />
                    </div>
                    <span className="text-[11px] text-text-muted text-center truncate w-full">
                      {friend.display_name.split(' ')[0]}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Cosmic Feed Preview ────────────────────────────── */}
      {feedPosts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-text-primary">Cosmic Feed</h3>
            <Link href="/feed" className="text-xs text-accent-primary hover:underline">See all</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {feedPosts.map(post => (
              <Link
                key={post.id}
                href="/feed"
                className="min-w-[240px] max-w-[280px] flex-shrink-0 card rounded-xl p-3 hover:border-accent-primary/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/user/${post.userId}`); }}
                    className="cursor-pointer"
                  >
                    <UserAvatar avatarUrl={post.userAvatar} displayName={post.userName} size="xs" />
                  </span>
                  <span className="text-xs font-medium text-text-primary truncate">{post.userName}</span>
                </div>
                {(post.imageUrl || post.videoUrl) && (
                  <div className="relative w-full h-20 mb-2 rounded-lg overflow-hidden bg-white/5">
                    <Image
                      src={post.videoUrl ? (post.posterUrl || '') : post.imageUrl!}
                      alt="Post media"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {post.videoUrl && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-gray-800 ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <p className={`text-xs text-text-secondary ${post.imageUrl || post.videoUrl ? 'line-clamp-2' : 'line-clamp-3'}`}>{post.content}</p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-text-muted">
                  {post.reactions.length > 0 && (
                    <span>{post.reactions[0]?.emoji} {post.reactions[0]?.count}</span>
                  )}
                  {post.commentCount > 0 && <span>💬 {post.commentCount}</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ─── Quick Access Grid ──────────────────────────── */}
      <div data-coachmark="quick-access">
        <h3 className="text-sm font-semibold text-text-primary mb-3">{t('home.quickAccess')}</h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          <QuickAccessButton href="/chart" glyph="☉" label="Natal Chart" />
          <QuickAccessButton href="/readings/transits" glyph="♄" label="Transits" />
          <QuickAccessButton href="/readings/tarot" glyph="♠" label="Tarot" />
          <QuickAccessButton href="/readings/compatibility" glyph="♥" label="Compatibility" />
          <QuickAccessButton href="/readings" glyph="✦" label="All Readings" />
        </div>
      </div>

      {/* ─── Social Grid (6 buttons, 2-col) ─────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Social</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <SocialButton
            href="/messages"
            icon="💬"
            label="Messages"
            gradient="linear-gradient(135deg, #9B6FF6, #7C3AED)"
            textWhite
            badge={unreadMessages}
          />
          <SocialButton
            href="/friends"
            icon="👥"
            label="Friends"
            gradient="linear-gradient(135deg, rgba(74,222,128,0.2), rgba(74,222,128,0.08))"
            badge={pendingRequests}
          />
          <SocialButton
            href="/feed"
            icon="✨"
            label="Cosmic Feed"
            gradient="linear-gradient(135deg, rgba(245,166,35,0.2), rgba(245,166,35,0.08))"
          />
          <SocialButton
            href="/matches"
            icon="💍"
            label="Cosmic Match"
            gradient="linear-gradient(135deg, rgba(236,72,153,0.2), rgba(236,72,153,0.08))"
          />
          <SocialButton
            href="/fragments"
            icon="🔮"
            label="Fragments"
            gradient="linear-gradient(135deg, rgba(124,58,237,0.2), rgba(124,58,237,0.08))"
          />
          <SocialButton
            href="/communities"
            icon="🏛️"
            label="Communities"
            gradient="linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.08))"
          />
        </div>
      </div>

      {/* ─── Sky right now ──────────────────────────────────────
          Collapsed: the Today card already answers "what is happening to me",
          so the raw positions are one tap away rather than three cards deep. */}
      <details className="card rounded-2xl">
        <summary className="cursor-pointer select-none list-none p-4 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-text-primary">Sky right now</span>
          <span className="text-xs text-text-muted">
            {moonPhase.emoji} {moonPhase.phase}{moonSign ? ` · Moon in ${moonSign}` : ''}
          </span>
        </summary>
        <div className="px-4 pb-4 space-y-4">
          {liveTransits.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {liveTransits.map(tr => (
                <div key={tr.name} className="flex items-center gap-2 text-sm">
                  <span className="text-text-muted w-5">{CHALDEAN_GLYPHS[tr.name] || ''}</span>
                  <span className="text-text-secondary font-medium">{tr.name}</span>
                  <span className="text-accent-secondary text-xs italic">in</span>
                  <span className="text-text-secondary">{tr.sign}</span>
                  {tr.retrograde && (
                    <span className="text-red-400 text-xs font-bold">℞</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">
              {hasBirthData ? 'Loading planetary positions...' : 'Add birth data to see live transits'}
            </p>
          )}
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs font-medium text-accent-primary">
            <Link href="/readings/transits" className="hover:underline">Full transit reading →</Link>
            <Link href="/readings/moon-phases" className="hover:underline">Moon phases →</Link>
            <Link href="/readings/planetary-hours" className="hover:underline">Planetary hours →</Link>
            <Link href="/cosmic-alerts" className="hover:underline">Cosmic alerts →</Link>
          </div>
        </div>
      </details>
      {/* ─── Guidance Systems ─────────────────────────────── */}
      <WhatsNewModal
        visible={!!whatsNewEntry}
        entry={whatsNewEntry}
        onDismiss={markWhatsNewSeen}
      />
      <CoachmarkOverlay
        active={coachmarks.active}
        steps={coachmarks.steps}
        currentStep={coachmarks.currentStep}
        currentStepIndex={coachmarks.currentStepIndex}
        onNext={coachmarks.next}
        onSkip={coachmarks.skip}
      />
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────

function QuickAccessButton({ href, glyph, label }: { href: string; glyph: string; label: string }) {
  return (
    <Link
      href={href}
      className="group text-center rounded-xl p-4 border border-accent-muted transition-all hover:border-accent-primary/40"
      style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))' }}
    >
      <span className="text-2xl block mb-1 group-hover:scale-110 transition-transform">{glyph}</span>
      <span className="text-xs text-text-secondary font-medium">{label}</span>
    </Link>
  );
}

function SocialButton({
  href, icon, label, gradient, textWhite, badge,
}: {
  href: string;
  icon: string;
  label: string;
  gradient: string;
  textWhite?: boolean;
  badge?: number;
}) {
  return (
    <Link href={href} className="block">
      <div
        className="relative rounded-xl p-5 border border-accent-muted flex flex-col items-center justify-center gap-1 transition-all hover:border-accent-primary/40 min-h-[100px]"
        style={{ background: gradient }}
      >
        <span className="text-2xl">{icon}</span>
        <span className={`text-[13px] font-medium ${textWhite ? 'text-white' : 'text-text-primary'}`}>
          {label}
        </span>
        {badge && badge > 0 ? (
          <span className="absolute top-2 right-2 min-w-[22px] h-[22px] rounded-full bg-red-500 flex items-center justify-center text-[11px] text-white font-bold px-1.5">
            {badge > 99 ? '99+' : badge}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
