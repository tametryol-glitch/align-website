'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { getFriends, type FriendProfile } from '@/lib/friendService';
import {
  getMyCosmicMatches,
  triggerCosmicMatchCalculation,
  type CosmicMatch,
} from '@/lib/cosmicMatchService';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { Users, X, ExternalLink, AlertTriangle, Lock, Unlock } from 'lucide-react';

// ── Constants ──

const CATEGORY_TABS = [
  { key: 'overall', label: 'Overall', emoji: '⭐' },
  { key: 'emotional', label: 'Emotional', emoji: '💜' },
  { key: 'passion', label: 'Passion', emoji: '🔥' },
  { key: 'marriage', label: 'Marriage', emoji: '💍' },
  { key: 'karmic', label: 'Karmic', emoji: '✨' },
  { key: 'attraction', label: 'Attraction', emoji: '🤲' },
  { key: 'stability', label: 'Stability', emoji: '🏠' },
  { key: 'mental', label: 'Mental', emoji: '🧠' },
] as const;

type CategoryKey = (typeof CATEGORY_TABS)[number]['key'];

const SIGN_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const TOXICITY_ICONS: Record<string, string> = {
  'Gaslighting Potential': '🌫️',
  'Jealousy & Possessiveness': '🔥',
  'Control Dynamics': '⛓️',
  'Emotional Manipulation': '🎭',
  'Codependency Risk': '🔗',
  'Emotional Volatility': '⚡',
  'Isolation Tendencies': '🏚️',
  'Power Imbalance': '⚖️',
  'Deception & Dishonesty': '🪞',
  'Trauma Bonding Risk': '🖤',
};

// ── Helpers ──

function getScoreColor(score: number): string {
  if (score >= 75) return '#4ADE80';
  if (score >= 55) return '#FACC15';
  if (score >= 35) return '#FB923C';
  return '#F87171';
}

function getScoreForCategory(match: CosmicMatch, cat: CategoryKey): number {
  switch (cat) {
    case 'overall': return match.overall_score ?? 0;
    case 'emotional': return match.emotional_score ?? 0;
    case 'passion': return match.passion_score ?? 0;
    case 'marriage': return match.marriage_score ?? 0;
    case 'karmic': return match.karmic_score ?? 0;
    case 'attraction': return match.attraction_score ?? 0;
    case 'stability': return match.stability_score ?? 0;
    case 'mental': return match.intellectual_score ?? 0;
    default: return 0;
  }
}

// ── Types ──

interface MatchEntry {
  friend: FriendProfile;
  match: CosmicMatch;
}

// ═══════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════

export default function MatchesPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const [entries, setEntries] = useState<MatchEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('overall');
  const [selectedMatch, setSelectedMatch] = useState<MatchEntry | null>(null);
  const [showToxicity, setShowToxicity] = useState(false);

  // ── Load friends + cosmic matches in parallel ──
  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    let friends: FriendProfile[] = [];
    let matches: CosmicMatch[] = [];
    try {
      [friends, matches] = await Promise.all([
        getFriends(),
        getMyCosmicMatches(user.id),
      ]);
    } catch {
      /* best effort */
    }

    // Build lookup: otherId -> CosmicMatch
    const matchMap: Record<string, CosmicMatch> = {};
    for (const m of matches) {
      const otherId = m.user_a_id === user.id ? m.user_b_id : m.user_a_id;
      matchMap[otherId] = m;
    }

    // Pair friends with calculated matches
    const paired: MatchEntry[] = [];
    for (const f of friends) {
      const m = matchMap[f.friend_id];
      if (m && (m.status === 'ready' || m.status === 'stale') && m.overall_score != null) {
        paired.push({ friend: f, match: m });
      }
    }
    setEntries(paired);
    setLoading(false);

    // Auto-trigger for friends without matches
    for (const f of friends) {
      if (!matchMap[f.friend_id]) {
        triggerCosmicMatchCalculation(user.id, f.friend_id).catch(console.error);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    if (authLoading) return;
    if (user) loadData();
    else setLoading(false);
  }, [user, authLoading, loadData]);

  // Sort entries by selected category score descending
  const sortedEntries = useMemo(() => {
    return [...entries].sort(
      (a, b) =>
        getScoreForCategory(b.match, selectedCategory) -
        getScoreForCategory(a.match, selectedCategory),
    );
  }, [entries, selectedCategory]);

  // ── Render ──

  return (
    <div className="max-w-3xl mx-auto" style={{ backgroundColor: '#0A0E1A', minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <Users className="w-7 h-7" style={{ color: '#8B5CF6' }} />
          <div>
            <h1 className="text-2xl font-bold text-white">Cosmic Matches</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Advanced Compatibility Analysis
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          style={{
            backgroundColor: 'rgba(139,92,246,0.15)',
            color: '#8B5CF6',
            border: '1px solid rgba(139,92,246,0.3)',
          }}
        >
          Refresh
        </button>
      </div>

      {/* Category Tabs */}
      <div
        className="flex gap-2 overflow-x-auto pb-3 px-4 mb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {CATEGORY_TABS.map((tab) => {
          const isActive = selectedCategory === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedCategory(tab.key)}
              className="flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0"
              style={{
                backgroundColor: isActive ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isActive ? '#8B5CF6' : 'rgba(61,71,96,1)'}`,
                color: isActive ? '#8B5CF6' : 'rgba(255,255,255,0.5)',
              }}
            >
              <span className="text-sm">{tab.emoji}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Match List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingCosmic label="Loading matches..." />
        </div>
      ) : !user ? (
        <div className="text-center py-16 px-6">
          <p style={{ color: 'rgba(255,255,255,0.45)' }}>Sign in to see your cosmic matches.</p>
        </div>
      ) : sortedEntries.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center py-16 px-8 text-center">
          <span className="text-5xl mb-4">{'🔭'}</span>
          <h3 className="text-xl font-bold text-white mb-2">No matches yet</h3>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: '1.6' }}>
            Add friends to see compatibility scores. Matches are calculated automatically when you
            become friends.
          </p>
          <Link
            href="/friends"
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{
              backgroundColor: 'rgba(139,92,246,0.15)',
              color: '#8B5CF6',
              border: '1px solid rgba(139,92,246,0.3)',
            }}
          >
            Go to Friends
          </Link>
        </div>
      ) : (
        <div className="space-y-3 px-4 pb-24">
          {sortedEntries.map((entry) => (
            <MatchCard
              key={entry.match.id}
              entry={entry}
              category={selectedCategory}
              onSelect={() => {
                setShowToxicity(false);
                setSelectedMatch(entry);
              }}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedMatch && (
        <DetailModal
          entry={selectedMatch}
          showToxicity={showToxicity}
          onToggleToxicity={() => setShowToxicity((v) => !v)}
          onClose={() => {
            setSelectedMatch(null);
            setShowToxicity(false);
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Match Card
// ═══════════════════════════════════════════════════════════════════

function MatchCard({
  entry,
  category,
  onSelect,
}: {
  entry: MatchEntry;
  category: CategoryKey;
  onSelect: () => void;
}) {
  const { friend, match } = entry;
  const score = match.overall_score ?? 0;
  const scoreColor = getScoreColor(score);

  const signLine = [
    friend.sun_sign ? `${SIGN_GLYPHS[friend.sun_sign] || ''} ${friend.sun_sign}` : '',
    friend.moon_sign ? `${SIGN_GLYPHS[friend.moon_sign] || ''} ${friend.moon_sign}` : '',
    friend.rising_sign ? `${SIGN_GLYPHS[friend.rising_sign] || ''} ${friend.rising_sign}` : '',
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <button
      onClick={onSelect}
      className="w-full text-left rounded-2xl overflow-hidden transition-transform hover:scale-[1.01] active:scale-[0.99]"
      style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(139,92,246,0.02))',
        border: '1px solid rgba(61,71,96,0.5)',
      }}
    >
      <div className="p-4">
        {/* Header: avatar + info + score badge */}
        <div className="flex items-center gap-3 mb-3">
          <UserAvatar avatarUrl={friend.avatar_url} displayName={friend.display_name} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm truncate">{friend.display_name}</p>
            {signLine && (
              <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {signLine}
              </p>
            )}
          </div>
          {/* Score Badge */}
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              border: `2px solid ${scoreColor}`,
            }}
          >
            <span className="text-base font-bold" style={{ color: scoreColor }}>
              {score}%
            </span>
          </div>
        </div>

        {/* 4 Mini Score Bars */}
        <div className="space-y-1.5">
          <MiniScoreBar label="Passion" score={match.passion_score ?? 0} />
          <MiniScoreBar label="Marriage" score={match.marriage_score ?? 0} />
          <MiniScoreBar label="Emotional" score={match.emotional_score ?? 0} />
          <MiniScoreBar label="Stability" score={match.stability_score ?? 0} />
        </div>

        {/* Style Label */}
        {match.style_label && (
          <p className="text-xs italic mt-2" style={{ color: '#A78BFA' }}>
            {match.style_label}
          </p>
        )}

        {/* Violence Risk Badge */}
        {(match.violence_risk_score ?? 0) >= 30 && (
          <div
            className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-md text-xs font-semibold"
            style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#EF4444' }}
          >
            <AlertTriangle className="w-3 h-3" />
            Elevated Risk
          </div>
        )}
      </div>
    </button>
  );
}

// ── Mini Score Bar ──

function MiniScoreBar({ label, score }: { label: string; score: number }) {
  const color = getScoreColor(score);
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="text-xs flex-shrink-0"
        style={{ width: 65, color: 'rgba(255,255,255,0.4)' }}
      >
        {label}
      </span>
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.1)' }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold flex-shrink-0" style={{ width: 35, textAlign: 'right', color }}>
        {score}%
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Detail Modal
// ═══════════════════════════════════════════════════════════════════

function DetailModal({
  entry,
  showToxicity,
  onToggleToxicity,
  onClose,
}: {
  entry: MatchEntry;
  showToxicity: boolean;
  onToggleToxicity: () => void;
  onClose: () => void;
}) {
  const { friend, match } = entry;
  const overallScore = match.overall_score ?? 0;
  const overallColor = getScoreColor(overallScore);

  const signLine = [
    friend.sun_sign || '',
    friend.moon_sign ? `• ${friend.moon_sign}` : '',
    friend.rising_sign ? `• ${friend.rising_sign}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const categoryGrid = [
    { label: 'Emotional', score: match.emotional_score ?? 0, emoji: '💜' },
    { label: 'Attraction', score: match.attraction_score ?? 0, emoji: '🤲' },
    { label: 'Passion', score: match.passion_score ?? 0, emoji: '🔥' },
    { label: 'Marriage', score: match.marriage_score ?? 0, emoji: '💍' },
    { label: 'Stability', score: match.stability_score ?? 0, emoji: '🏠' },
    { label: 'Karmic', score: match.karmic_score ?? 0, emoji: '✨' },
    { label: 'Mental', score: match.intellectual_score ?? 0, emoji: '🧠' },
    { label: 'Spiritual', score: match.spiritual_score ?? 0, emoji: '🔮' },
    { label: 'Physical', score: match.physical_score ?? 0, emoji: '💪' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: '#0A0E1A' }}
    >
      {/* Backdrop click area */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal content */}
      <div className="relative flex-1 overflow-y-auto" style={{ zIndex: 1 }}>
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 mb-4 text-sm font-medium transition-colors"
            style={{ color: '#8B5CF6' }}
          >
            <X className="w-4 h-4" />
            Close
          </button>

          {/* Header: Avatar + Name + Signs */}
          <div className="flex items-center gap-3 mb-6">
            <UserAvatar avatarUrl={friend.avatar_url} displayName={friend.display_name} size="xl" />
            <div>
              <h2 className="text-xl font-bold text-white">{friend.display_name}</h2>
              {signLine && (
                <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {signLine}
                </p>
              )}
            </div>
          </div>

          {/* Overall Score Display */}
          <div className="text-center py-6 mb-6">
            <span className="font-extrabold" style={{ fontSize: 64, color: overallColor }}>
              {overallScore}%
            </span>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Overall Compatibility
            </p>
            {match.style_label && (
              <p className="text-base font-semibold italic mt-2" style={{ color: '#A78BFA' }}>
                {match.style_label}
              </p>
            )}
          </div>

          {/* 9-Category Grid */}
          <SectionTitle text="Category Breakdown" />
          <div className="grid grid-cols-3 gap-3 mb-6">
            {categoryGrid.map((cat) => (
              <div
                key={cat.label}
                className="flex flex-col items-center py-3 px-2 rounded-xl"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(61,71,96,0.5)',
                }}
              >
                <span className="text-xl mb-1">{cat.emoji}</span>
                <span className="text-lg font-bold" style={{ color: getScoreColor(cat.score) }}>
                  {cat.score}%
                </span>
                <span className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {cat.label}
                </span>
              </div>
            ))}
          </div>

          {/* Passion Section */}
          {match.passion_score != null && (
            <>
              <SectionTitle text={`🔥 Passion (${match.passion_intensity || ''})`} />
              <DetailCard>
                {(match.passion_indicators || []).slice(0, 5).map((ind, i) => (
                  <p key={i} className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.5' }}>
                    {'•'} {ind.description}
                  </p>
                ))}
              </DetailCard>
            </>
          )}

          {/* Marriage Sub-scores */}
          {match.marriage_score != null && (
            <>
              <SectionTitle text={`💍 Marriage Potential (${match.marriage_level || ''})`} />
              <DetailCard>
                <div className="flex justify-around pt-2 pb-1">
                  <SubScoreItem label="Domestic" score={match.marriage_sub_scores?.domestic ?? 0} />
                  <SubScoreItem label="Loyalty" score={match.marriage_sub_scores?.loyalty ?? 0} />
                  <SubScoreItem label="Growth" score={match.marriage_sub_scores?.growth ?? 0} />
                </div>
              </DetailCard>
            </>
          )}

          {/* Violence/Control Risk */}
          {(match.violence_risk_score ?? 0) > 0 && (
            <>
              <SectionTitle text={'⚠️ Violence/Control Risk'} />
              <DetailCard>
                <div className="flex justify-around pt-2 pb-1">
                  <SubScoreItem label="Control" score={match.violence_sub_scores?.control ?? 0} />
                  <SubScoreItem label="Volatility" score={match.violence_sub_scores?.volatility ?? 0} />
                  <SubScoreItem label="Manipulation" score={match.violence_sub_scores?.manipulation ?? 0} />
                </div>
              </DetailCard>
            </>
          )}

          {/* Toxicity Meter */}
          {(match.toxicity_subcategories || []).length > 0 && (
            <>
              <SectionTitle text={'☠️ Toxicity Meter'} />
              {!showToxicity ? (
                <button
                  onClick={onToggleToxicity}
                  className="w-full rounded-2xl overflow-hidden transition-transform hover:scale-[1.01]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))',
                    border: '1px solid rgba(239,68,68,0.2)',
                  }}
                >
                  <div className="flex flex-col items-center py-6">
                    <Lock className="w-8 h-8 mb-2" style={{ color: '#EF4444' }} />
                    <span className="text-sm font-semibold" style={{ color: '#EF4444' }}>
                      Tap to Reveal Toxicity Analysis
                    </span>
                    <span className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {match.toxicity_subcategories?.length ?? 0} subcategories analyzed
                    </span>
                  </div>
                </button>
              ) : (
                <div
                  className="rounded-2xl p-4 mb-2"
                  style={{
                    backgroundColor: 'rgba(239,68,68,0.05)',
                    border: '1px solid rgba(239,68,68,0.15)',
                  }}
                >
                  {/* Overall toxicity score */}
                  <div className="text-center mb-4">
                    <span
                      className="text-4xl font-extrabold"
                      style={{ color: getScoreColor(100 - (match.toxicity_score ?? 0)) }}
                    >
                      {match.toxicity_score ?? 0}%
                    </span>
                    <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      Toxicity Score
                    </p>
                  </div>

                  {/* Subcategories */}
                  <div className="space-y-3">
                    {(match.toxicity_subcategories || []).map((sub, i) => {
                      const toxColor =
                        (sub.score ?? 0) >= 50
                          ? '#EF4444'
                          : (sub.score ?? 0) >= 30
                            ? '#FB923C'
                            : '#4ADE80';
                      return (
                        <div key={i} className="flex gap-2.5">
                          <span className="text-xl mt-0.5">
                            {TOXICITY_ICONS[sub.name] || '⚠️'}
                          </span>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-semibold text-white">{sub.name}</span>
                              <span className="text-xs font-bold" style={{ color: getScoreColor(100 - (sub.score ?? 0)) }}>
                                {sub.score ?? 0}%
                              </span>
                            </div>
                            <div
                              className="rounded-full overflow-hidden mt-1"
                              style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.1)' }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${sub.score ?? 0}%`, backgroundColor: toxColor }}
                              />
                            </div>
                            {(sub.score ?? 0) >= 20 && sub.interpretation && (
                              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)', lineHeight: '1.4' }}>
                                {sub.interpretation}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Hide button */}
                  <button
                    onClick={onToggleToxicity}
                    className="flex items-center gap-1 mx-auto mt-3 text-xs font-medium"
                    style={{ color: '#EF4444' }}
                  >
                    <Unlock className="w-3 h-3" />
                    Hide Toxicity Analysis
                  </button>
                </div>
              )}
            </>
          )}

          {/* Strengths */}
          {(match.strengths || []).length > 0 && (
            <>
              <SectionTitle text={'✅ Top Strengths'} />
              <DetailCard>
                {match.strengths.map((s, i) => (
                  <p key={i} className="text-sm mb-1" style={{ color: '#4ADE80', lineHeight: '1.5' }}>
                    {'•'} {s}
                  </p>
                ))}
              </DetailCard>
            </>
          )}

          {/* Challenges */}
          {(match.challenges || []).length > 0 && (
            <>
              <SectionTitle text={'⚡ Growth Areas'} />
              <DetailCard>
                {match.challenges.map((c, i) => (
                  <p key={i} className="text-sm mb-1" style={{ color: '#FB923C', lineHeight: '1.5' }}>
                    {'•'} {c}
                  </p>
                ))}
              </DetailCard>
            </>
          )}

          {/* Key Aspects */}
          {(match.key_aspects || []).length > 0 && (
            <>
              <SectionTitle text={`Key Aspects (${match.key_aspects.length})`} />
              <DetailCard>
                {match.key_aspects.slice(0, 10).map((asp, i) => (
                  <div key={i} className="flex items-center gap-2 py-1">
                    <span
                      className="text-xs"
                      style={{ color: asp.supportive ? '#4ADE80' : '#FB923C' }}
                    >
                      {'●'}
                    </span>
                    <span className="flex-1 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {asp.inner} {asp.aspect} {asp.outer}
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {asp.orb.toFixed(1)}{'°'}
                    </span>
                  </div>
                ))}
              </DetailCard>
            </>
          )}

          {/* Open Full Compatibility Reading */}
          <Link
            href="/chart/synastry"
            className="block mt-6 mb-10 rounded-2xl overflow-hidden transition-transform hover:scale-[1.01]"
          >
            <div
              className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-white"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
              }}
            >
              <ExternalLink className="w-4 h-4" />
              Open Full Compatibility Reading
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Shared sub-components
// ═══════════════════════════════════════════════════════════════════

function SectionTitle({ text }: { text: string }) {
  return (
    <h3 className="text-base font-semibold text-white mt-6 mb-3">{text}</h3>
  );
}

function DetailCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(61,71,96,0.5)',
      }}
    >
      {children}
    </div>
  );
}

function SubScoreItem({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xl font-bold" style={{ color: getScoreColor(score) }}>
        {score}%
      </span>
      <span className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
        {label}
      </span>
    </div>
  );
}
