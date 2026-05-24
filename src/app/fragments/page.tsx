'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { getFriends, type FriendProfile } from '@/lib/friendService';
import {
  getMyFragments, addFragment, removeFragment, getCachedCalculation,
  MAX_FRAGMENTS, type Fragment, type FragmentCalculation,
} from '@/lib/fragmentService';
import Link from 'next/link';
import {
  Sparkles, Plus, X, Search, ChevronDown, ChevronUp,
  Trash2, Users, Star, RefreshCw,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// ── Types ───────────────────────────────────────────────────────────

interface FragmentWithCalc extends Fragment {
  calc: FragmentCalculation | null;
  calcLoading: boolean;
}

interface SoulFragmentResult {
  friendId: string;
  displayName: string;
  avatarUrl: string | null;
  sunSign: string | null;
  totalScore: number;
  fragmentType: string;
  typeGlyph: string;
  typeColor: string;
  components: {
    mirror: number;
    opposite: number;
    karmic: number;
    missingPiece: number;
    woundGift: number;
    hiddenResonance: number;
    activation: number;
  };
  headline: string;
  summary: string;
}

// ── Soul Fragment Engine (deterministic, client-side) ────────────────

const SIGN_ORDER = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

const FRAGMENT_TYPES: Record<string, { label: string; glyph: string; color: string }> = {
  Mirror:   { label: 'Mirror Fragment',   glyph: '🪞', color: '#8B5CF6' },
  Opposite: { label: 'Polarity Fragment', glyph: '☯️', color: '#06B6D4' },
  Karmic:   { label: 'Karmic Fragment',   glyph: '🔮', color: '#F59E0B' },
  Gift:     { label: 'Gift Fragment',     glyph: '🎁', color: '#10B981' },
  Shadow:   { label: 'Shadow Fragment',   glyph: '🌑', color: '#6B7280' },
  Destiny:  { label: 'Destiny Fragment',  glyph: '⭐', color: '#EC4899' },
};

function signIndex(sign: string | null | undefined): number {
  if (!sign) return -1;
  return SIGN_ORDER.findIndex(s => s.toLowerCase() === sign.toLowerCase());
}

function computeSoulFragment(
  userSun: string | null, userMoon: string | null, userRising: string | null,
  friendSun: string | null, friendMoon: string | null, friendRising: string | null,
  friendId: string,
): SoulFragmentResult & { friendId: string } {
  const uS = signIndex(userSun), uM = signIndex(userMoon), uR = signIndex(userRising);
  const fS = signIndex(friendSun), fM = signIndex(friendMoon), fR = signIndex(friendRising);

  // Seed from friendId for deterministic variation
  let seed = 0;
  for (let i = 0; i < friendId.length; i++) seed = ((seed << 5) - seed + friendId.charCodeAt(i)) | 0;
  const seedVar = (offset: number) => (Math.abs(seed + offset * 7919) % 30) - 15;

  // Mirror: same-sign resonance
  let mirror = 30 + seedVar(1);
  if (uS >= 0 && fS >= 0 && uS === fS) mirror += 35;
  if (uM >= 0 && fM >= 0 && uM === fM) mirror += 25;
  if (uR >= 0 && fR >= 0 && uR === fR) mirror += 20;

  // Opposite: 180° polarity
  let opposite = 25 + seedVar(2);
  if (uS >= 0 && fS >= 0 && Math.abs(uS - fS) === 6) opposite += 35;
  if (uM >= 0 && fM >= 0 && Math.abs(uM - fM) === 6) opposite += 25;

  // Karmic: square/inconjunct tension
  let karmic = 20 + seedVar(3);
  if (uS >= 0 && fS >= 0) {
    const diff = Math.abs(uS - fS);
    if (diff === 3 || diff === 9) karmic += 30;
    if (diff === 5 || diff === 7) karmic += 20;
  }

  // Missing piece: trine harmony
  let missingPiece = 25 + seedVar(4);
  if (uS >= 0 && fS >= 0) {
    const diff = Math.abs(uS - fS);
    if (diff === 4 || diff === 8) missingPiece += 35;
  }
  if (uM >= 0 && fR >= 0 && uM === fR) missingPiece += 15;

  // Wound/Gift: Chiron-like patterns
  let woundGift = 20 + seedVar(5);
  if (uM >= 0 && fS >= 0 && Math.abs(uM - fS) === 6) woundGift += 30;
  if (uR >= 0 && fM >= 0 && uR === fM) woundGift += 20;

  // Hidden resonance
  let hiddenResonance = 15 + seedVar(6);
  if (uR >= 0 && fR >= 0 && uR === fR) hiddenResonance += 40;
  if (uM >= 0 && fM >= 0) {
    const diff = Math.abs(uM - fM);
    if (diff === 2 || diff === 10) hiddenResonance += 25;
  }

  // Activation
  let activation = 20 + seedVar(7);
  if (uS >= 0 && fR >= 0 && uS === fR) activation += 30;
  if (uR >= 0 && fS >= 0 && uR === fS) activation += 30;

  // Clamp all 0-100
  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
  const components = {
    mirror: clamp(mirror),
    opposite: clamp(opposite),
    karmic: clamp(karmic),
    missingPiece: clamp(missingPiece),
    woundGift: clamp(woundGift),
    hiddenResonance: clamp(hiddenResonance),
    activation: clamp(activation),
  };

  const totalScore = Math.round(
    components.mirror * 0.2 + components.opposite * 0.15 +
    components.karmic * 0.15 + components.missingPiece * 0.15 +
    components.woundGift * 0.1 + components.hiddenResonance * 0.1 +
    components.activation * 0.15
  );

  // Determine primary type
  const scores = [
    { type: 'Mirror', score: components.mirror },
    { type: 'Opposite', score: components.opposite },
    { type: 'Karmic', score: components.karmic },
    { type: 'Gift', score: components.missingPiece },
    { type: 'Shadow', score: components.woundGift },
    { type: 'Destiny', score: components.activation },
  ];
  scores.sort((a, b) => b.score - a.score);
  const primary = scores[0].type;
  const ft = FRAGMENT_TYPES[primary];

  const tier = totalScore >= 85 ? 'Major Soul Fragment' :
               totalScore >= 70 ? 'Strong Fragment' :
               totalScore >= 55 ? 'Moderate Echo' : 'Subtle Echo';

  return {
    friendId,
    displayName: '',
    avatarUrl: null,
    sunSign: friendSun,
    totalScore,
    fragmentType: primary,
    typeGlyph: ft.glyph,
    typeColor: ft.color,
    components,
    headline: `${ft.label} — ${tier}`,
    summary: totalScore >= 70
      ? 'A deep soul-level resonance that transcends ordinary connection.'
      : totalScore >= 55
      ? 'A meaningful resonance that carries lessons and gifts.'
      : 'A subtle energetic echo worth exploring.',
  };
}

// ── Cycle Config ────────────────────────────────────────────────────

const CYCLE_CONFIG: Record<string, { glyph: string; color: string; label: string }> = {
  growth:         { glyph: '🌱', color: '#22c55e', label: 'Growth' },
  challenge:      { glyph: '⚡', color: '#ef4444', label: 'Challenge' },
  harmony:        { glyph: '💜', color: '#9B6FF6', label: 'Harmony' },
  transformation: { glyph: '🔥', color: '#f59e0b', label: 'Transformation' },
  separation:     { glyph: '🌊', color: '#3b82f6', label: 'Separation' },
  reunion:        { glyph: '✨', color: '#F5A623', label: 'Reunion' },
  deepening:      { glyph: '🌙', color: '#8b5cf6', label: 'Deepening' },
  testing:        { glyph: '🛡️', color: '#6b7280', label: 'Testing' },
};

// ── Score Helpers ────────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 75) return '#22c55e';
  if (score >= 50) return '#F5A623';
  return '#ef4444';
}

// ── Component Scores Config ─────────────────────────────────────────

const SOUL_SCORE_LABELS = [
  { key: 'mirror',          label: 'Mirror',       color: '#8B5CF6' },
  { key: 'opposite',        label: 'Polarity',     color: '#06B6D4' },
  { key: 'karmic',          label: 'Karmic',       color: '#F59E0B' },
  { key: 'missingPiece',    label: 'Missing Piece', color: '#10B981' },
  { key: 'woundGift',       label: 'Wound/Gift',   color: '#EF4444' },
  { key: 'hiddenResonance', label: 'Hidden',       color: '#EC4899' },
  { key: 'activation',      label: 'Activation',   color: '#3B82F6' },
] as const;

// ═════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════

export default function FragmentsPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'fragments' | 'soul'>('fragments');
  const [fragments, setFragments] = useState<FragmentWithCalc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  // Soul fragments state
  const [soulResults, setSoulResults] = useState<SoulFragmentResult[]>([]);
  const [soulLoading, setSoulLoading] = useState(false);
  const [expandedSoul, setExpandedSoul] = useState<string | null>(null);

  // ── Load Fragments ──
  const loadFragments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const frags = await getMyFragments();
      const withCalcs: FragmentWithCalc[] = frags.map(f => ({
        ...f, calc: null, calcLoading: true,
      }));
      setFragments(withCalcs);

      // Load cached calculations in parallel
      const calcs = await Promise.all(
        frags.map(f => getCachedCalculation(f.id))
      );
      setFragments(prev => prev.map((f, i) => ({
        ...f, calc: calcs[i], calcLoading: false,
      })));
    } catch {
      // silently handle
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadFragments(); }, [loadFragments]);

  // ── Load Soul Fragments ──
  const loadSoulFragments = useCallback(async () => {
    if (!user) return;
    setSoulLoading(true);
    try {
      const supabase = createClient();
      // Get user profile
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('sun_sign, moon_sign, rising_sign')
        .eq('id', user.id)
        .single();

      if (!myProfile) { setSoulLoading(false); return; }

      // Get friends
      const friends = await getFriends();
      if (friends.length === 0) { setSoulLoading(false); return; }

      // Compute soul fragments for each friend
      const results: SoulFragmentResult[] = friends
        .map(friend => {
          const result = computeSoulFragment(
            myProfile.sun_sign, myProfile.moon_sign, myProfile.rising_sign,
            friend.sun_sign, friend.moon_sign, friend.rising_sign,
            friend.friend_id,
          );
          return {
            ...result,
            friendId: friend.friend_id,
            displayName: friend.display_name,
            avatarUrl: friend.avatar_url,
            sunSign: friend.sun_sign,
          };
        })
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 20);

      setSoulResults(results);
    } catch {
      // silently handle
    }
    setSoulLoading(false);
  }, [user]);

  useEffect(() => {
    if (activeTab === 'soul' && soulResults.length === 0) loadSoulFragments();
  }, [activeTab, soulResults.length, loadSoulFragments]);

  // ── Add Fragment ──
  const handleAdd = useCallback(async (friendId: string) => {
    const result = await addFragment(friendId);
    if (result.success) {
      setShowPicker(false);
      loadFragments();
    } else {
      alert(result.error || 'Failed to add fragment');
    }
  }, [loadFragments]);

  // ── Remove Fragment ──
  const handleRemove = useCallback(async (fragmentId: string, name: string) => {
    if (!confirm(`Remove ${name || 'this person'} from your Fragments?`)) return;
    setRemoving(fragmentId);
    const result = await removeFragment(fragmentId);
    if (result.success) {
      setFragments(prev => prev.filter(f => f.id !== fragmentId));
    }
    setRemoving(null);
  }, []);

  // ── Existing fragment user IDs (for picker exclusion) ──
  const fragmentUserIds = useMemo(
    () => new Set(fragments.map(f => f.fragment_user_id)),
    [fragments],
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">{t('fragments.title')}</h1>
              <p className="text-sm text-text-secondary">{t('fragments.subtitle')}</p>
            </div>
          </div>
          <span className="text-xs font-medium text-text-muted bg-bg-tertiary px-3 py-1 rounded-full border border-border-primary">
            {fragments.length}/{MAX_FRAGMENTS} slots
          </span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('fragments')}
          className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'fragments'
              ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
              : 'bg-bg-card text-text-muted border border-border-primary hover:border-border-accent'
          }`}
        >
          🔮 Fragments
        </button>
        <button
          onClick={() => setActiveTab('soul')}
          className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'soul'
              ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
              : 'bg-bg-card text-text-muted border border-border-primary hover:border-border-accent'
          }`}
        >
          ✦ Soul Fragments
        </button>
      </div>

      {/* ═══ FRAGMENTS TAB ═══ */}
      {activeTab === 'fragments' && (
        <>
          {loading ? (
            <div className="card rounded-2xl p-12 text-center">
              <RefreshCw className="w-6 h-6 text-accent-primary animate-spin mx-auto mb-3" />
              <p className="text-text-muted text-sm">{t('common.loading')}</p>
            </div>
          ) : fragments.length === 0 ? (
            <div className="card rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">🔮</div>
              <h2 className="text-lg font-semibold text-text-primary mb-2">No Fragments Yet</h2>
              <p className="text-text-secondary mb-6 max-w-sm mx-auto">
                Fragments are the people who matter most. Add a friend to unlock
                living relationship intelligence — composite charts, transit tracking,
                and cycle-aware guidance.
              </p>
              <button
                onClick={() => setShowPicker(true)}
                className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Fragment
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {fragments.map(frag => {
                const cycle = frag.calc?.current_cycle
                  ? CYCLE_CONFIG[frag.calc.current_cycle.toLowerCase()]
                  : null;
                const score = frag.calc?.overall_score;

                return (
                  <div key={frag.id} className="card rounded-2xl p-4 hover:border-accent-primary/30 transition-colors group">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <Link href={`/fragments/${frag.id}`} className="shrink-0">
                        <div className="w-14 h-14 rounded-full bg-accent-primary/10 flex items-center justify-center overflow-hidden">
                          {frag.avatar_url ? (
                            <img src={frag.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-lg font-bold text-accent-primary">
                              {(frag.display_name || '?')[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                      </Link>

                      {/* Info */}
                      <Link href={`/fragments/${frag.id}`} className="flex-1 min-w-0">
                        <h3 className="text-text-primary font-semibold truncate">
                          {frag.display_name || 'Unknown'}
                        </h3>
                        <p className="text-xs text-text-muted truncate">
                          {[frag.sun_sign, frag.moon_sign, frag.rising_sign].filter(Boolean).join(' · ') || 'Birth data pending'}
                        </p>

                        {/* Cycle badge */}
                        {frag.calcLoading ? (
                          <div className="flex items-center gap-2 mt-1.5">
                            <RefreshCw className="w-3 h-3 text-accent-primary animate-spin" />
                            <span className="text-xs text-text-muted">Analyzing...</span>
                          </div>
                        ) : cycle ? (
                          <div className="flex items-center gap-2 mt-1.5">
                            <span
                              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: cycle.color + '22', color: cycle.color }}
                            >
                              {cycle.glyph} {cycle.label}
                            </span>
                            {frag.calc?.cycle_intensity != null && frag.calc.cycle_intensity > 0 && (
                              <div className="flex-1 h-1 bg-bg-tertiary rounded-full overflow-hidden max-w-[80px]">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${frag.calc.cycle_intensity}%`, backgroundColor: cycle.color }}
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-text-muted mt-1.5">Tap to view details</p>
                        )}
                      </Link>

                      {/* Score */}
                      {score != null && (
                        <div className="text-center shrink-0">
                          <p className="text-xl font-bold" style={{ color: getScoreColor(score) }}>
                            {Math.round(score)}
                          </p>
                          <p className="text-[10px] text-text-muted">match</p>
                        </div>
                      )}

                      {/* Remove */}
                      <button
                        onClick={(e) => { e.preventDefault(); handleRemove(frag.id, frag.display_name || ''); }}
                        disabled={removing === frag.id}
                        className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                        title="Remove Fragment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Cycle summary */}
                    {frag.calc?.cycle_summary && (
                      <p className="text-xs text-text-secondary mt-3 line-clamp-2 pl-[72px]">
                        {frag.calc.cycle_summary}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Add more button */}
              {fragments.length < MAX_FRAGMENTS && (
                <button
                  onClick={() => setShowPicker(true)}
                  className="w-full card rounded-2xl p-4 border-dashed flex items-center justify-center gap-2 text-text-muted hover:text-accent-primary hover:border-accent-primary/30 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Add Fragment ({fragments.length}/{MAX_FRAGMENTS})</span>
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* ═══ SOUL FRAGMENTS TAB ═══ */}
      {activeTab === 'soul' && (
        <>
          {soulLoading ? (
            <div className="card rounded-2xl p-12 text-center">
              <RefreshCw className="w-6 h-6 text-accent-primary animate-spin mx-auto mb-3" />
              <p className="text-text-muted text-sm">Analyzing soul resonance...</p>
            </div>
          ) : soulResults.length === 0 ? (
            <div className="card rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">✦</div>
              <h2 className="text-lg font-semibold text-text-primary mb-2">No Soul Fragments Yet</h2>
              <p className="text-text-secondary mb-6 max-w-sm mx-auto">
                Add friends and make sure they've completed their birth chart to see who
                resonates with you most deeply.
              </p>
              <Link
                href="/friends"
                className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium"
              >
                <Users className="w-4 h-4" />
                Browse Friends
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {soulResults.map((sr, index) => {
                const isExpanded = expandedSoul === sr.friendId;
                return (
                  <div
                    key={sr.friendId}
                    className={`card rounded-2xl p-4 transition-colors cursor-pointer ${
                      isExpanded ? 'border-accent-primary/40' : 'hover:border-border-accent'
                    }`}
                    onClick={() => setExpandedSoul(isExpanded ? null : sr.friendId)}
                  >
                    {/* Preview Row */}
                    <div className="flex items-center gap-3">
                      {/* Rank */}
                      <div className="w-7 h-7 rounded-full bg-bg-tertiary flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-text-secondary">{index + 1}</span>
                      </div>

                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-accent-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                        {sr.avatarUrl ? (
                          <img src={sr.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-accent-primary">
                            {(sr.displayName || '?')[0].toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-text-primary font-semibold truncate text-sm">
                          {sr.displayName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: sr.typeColor + '22', color: sr.typeColor }}
                          >
                            {sr.typeGlyph} {FRAGMENT_TYPES[sr.fragmentType]?.label || sr.fragmentType}
                          </span>
                          {sr.sunSign && (
                            <span className="text-[11px] text-text-muted">{sr.sunSign}</span>
                          )}
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-center shrink-0">
                        <p className="text-xl font-bold" style={{ color: getScoreColor(sr.totalScore) }}>
                          {sr.totalScore}
                        </p>
                        <p className="text-[10px] text-text-muted">score</p>
                      </div>

                      {/* Expand icon */}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-text-muted shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
                      )}
                    </div>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-border-primary space-y-4">
                        <p className="text-sm font-semibold text-gold-primary">{sr.headline}</p>
                        <p className="text-sm text-text-secondary">{sr.summary}</p>

                        {/* Score breakdown bars */}
                        <div>
                          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                            Resonance Breakdown
                          </p>
                          <div className="space-y-2">
                            {SOUL_SCORE_LABELS.map(({ key, label, color }) => {
                              const val = sr.components[key as keyof typeof sr.components] ?? 0;
                              return (
                                <div key={key} className="flex items-center gap-3">
                                  <span className="text-xs text-text-tertiary w-24">{label}</span>
                                  <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full transition-all"
                                      style={{ width: `${val}%`, backgroundColor: color }}
                                    />
                                  </div>
                                  <span className="text-xs text-text-muted w-8 text-right">{val}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <p className="text-center text-[11px] text-text-muted">Tap to collapse</p>
                      </div>
                    )}

                    {!isExpanded && (
                      <p className="text-center text-[11px] text-text-muted mt-2">Tap to explore</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ═══ FRIEND PICKER MODAL ═══ */}
      {showPicker && (
        <FriendPickerModal
          excludeIds={fragmentUserIds}
          onAdd={handleAdd}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// FRIEND PICKER MODAL
// ═════════════════════════════════════════════════════════════════════

function FriendPickerModal({
  excludeIds,
  onAdd,
  onClose,
}: {
  excludeIds: Set<string>;
  onAdd: (friendId: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const all = await getFriends();
      setFriends(all);
      setLoading(false);
    })();
  }, []);

  const available = useMemo(() => {
    return friends
      .filter(f => !excludeIds.has(f.friend_id))
      .filter(f => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          f.display_name.toLowerCase().includes(q) ||
          f.sun_sign?.toLowerCase().includes(q) ||
          f.username?.toLowerCase().includes(q)
        );
      });
  }, [friends, excludeIds, search]);

  const handleSelect = async (friendId: string) => {
    setAdding(friendId);
    await onAdd(friendId);
    setAdding(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-secondary rounded-2xl border border-border-primary w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-primary">
          <h2 className="text-lg font-bold text-text-primary">Add Fragment</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-bg-tertiary">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 pb-2">
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search friends..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-bg-tertiary rounded-xl text-sm text-text-primary placeholder:text-text-muted border border-border-primary focus:border-accent-primary/50 focus:outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-2">
          {loading ? (
            <p className="text-center text-text-muted text-sm py-8">Loading friends...</p>
          ) : available.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-muted text-sm">
                {friends.length === 0
                  ? 'No friends yet. Add friends first!'
                  : search
                  ? 'No matching friends found.'
                  : 'All friends are already Fragments!'}
              </p>
            </div>
          ) : (
            available.map(friend => (
              <button
                key={friend.friend_id}
                onClick={() => handleSelect(friend.friend_id)}
                disabled={adding === friend.friend_id}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-bg-card border border-border-primary hover:border-accent-primary/40 transition-colors text-left disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-accent-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                  {friend.avatar_url ? (
                    <img src={friend.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-accent-primary">
                      {friend.display_name[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{friend.display_name}</p>
                  <p className="text-xs text-text-muted truncate">
                    {[friend.sun_sign, friend.moon_sign, friend.rising_sign].filter(Boolean).join(' · ') || 'No sign data'}
                  </p>
                </div>
                {adding === friend.friend_id ? (
                  <RefreshCw className="w-4 h-4 text-accent-primary animate-spin shrink-0" />
                ) : (
                  <Plus className="w-4 h-4 text-accent-primary shrink-0" />
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
