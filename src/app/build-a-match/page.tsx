'use client';

/**
 * BUILD-A-MATCH (web) — "Build your type. Let Align find them."
 *
 * Web twin of align-app/src/app/social/build-a-match.tsx. Same RPCs, same
 * placement index, same compatibility engine — so a build produces identical
 * results on both platforms.
 *
 * See align-app/BUILD_A_MATCH_DISCOVERY.md.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { createClient } from '@/lib/supabase';
import { isBuildAMatchEnabled } from '@/config/featureFlags';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { SIGNS, SIGN_EMOJIS, PLANET_EMOJIS } from '@/lib/cosmicIndexService';
import {
  countMatches, getDiscoverySections, getRelaxationOptions,
  getMyBuilds, saveBuild, deleteBuild, hasOrientationPreferences,
} from '@/lib/buildAMatch/buildAMatchService';
import {
  toCriteria, formatPoolCount, computeBuildRarity, requiresBirthTime,
} from '@/lib/buildAMatch/buildFitEngine';
import type {
  Priority, SearchMode, BuildCriterion, SavedBuild,
  DiscoverySection, PoolCount, RelaxationOption, BuildMatchResult,
  PreferenceMode,
} from '@/lib/buildAMatch/types';

const ESSENTIAL_BODIES = ['Moon', 'Venus', 'Mars', 'Mercury', 'Juno', 'Sun'];
const EXPANDED_BODIES = [
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'Ascendant', 'MC', 'North Node', 'South Node',
  'Chiron', 'Vesta', 'Pallas', 'Lilith', 'Eros', 'Psyche', 'Ceres',
];

const PRIORITIES: Array<{ key: Priority; label: string }> = [
  { key: 'must', label: 'MUST HAVE' },
  { key: 'preferred', label: 'PREFERRED' },
  { key: 'any', label: 'ANY' },
  { key: 'avoid', label: 'AVOID' },
];

const SEARCH_MODES: Array<{ key: SearchMode; label: string; hint: string }> = [
  { key: 'exact', label: 'EXACT BUILD', hint: 'Every must-have is required' },
  { key: 'close', label: 'CLOSE BUILD', hint: 'Allows one miss, ranked by fit' },
  { key: 'cosmic', label: 'COSMIC BUILD', hint: 'Your picks guide it; compatibility widens it' },
];

type Tab = 'build' | 'discovery' | 'saved';
interface Selection { sign: string | null; priority: Priority }

export default function BuildAMatchPage() {
  const { user } = useAuthStore();
  const enabled = isBuildAMatchEnabled(user?.email);

  const [tab, setTab] = useState<Tab>('build');
  const [booting, setBooting] = useState(true);
  const [myPlacements, setMyPlacements] = useState<Array<{ planet_name: string; sign_name: string }>>([]);
  const [indexed, setIndexed] = useState(false);

  const [selections, setSelections] = useState<Record<string, Selection>>({});
  const [showDeeper, setShowDeeper] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>('exact');
  const [datingOnly, setDatingOnly] = useState(false);
  /** 'strict' also drops explicit dealbreaker clashes. Orientation is
   *  filtered in BOTH modes — it is never a toggle. */
  const [preferenceMode, setPreferenceMode] = useState<PreferenceMode>('soft');
  const [myPrefsIncomplete, setMyPrefsIncomplete] = useState(false);

  const [pool, setPool] = useState<PoolCount | null>(null);
  const [poolLoading, setPoolLoading] = useState(false);
  const poolSeq = useRef(0);

  const [relaxation, setRelaxation] = useState<RelaxationOption[]>([]);
  const [sections, setSections] = useState<DiscoverySection[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [builds, setBuilds] = useState<SavedBuild[]>([]);
  const [saveName, setSaveName] = useState('');
  const [saving, setSaving] = useState(false);

  const criteria: BuildCriterion[] = useMemo(() => toCriteria(selections), [selections]);
  const criteriaCount = criteria.length;

  const mySignFor = useCallback(
    (body: string) => myPlacements.find(p => p.planet_name === body)?.sign_name ?? null,
    [myPlacements],
  );
  // Cannot be inferred from the presence of an Ascendant row — the indexer
  // substitutes noon when birth_time is NULL, so an Ascendant is ALWAYS
  // indexed. The profile column is the only honest source (§38).
  const [viewerBirthTimeUnknown, setViewerBirthTimeUnknown] = useState(false);

  // ─── Boot: read the caller's own indexed chart ───
  useEffect(() => {
    if (!enabled || !user?.id) { setBooting(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const [{ data }, { data: profileRow }] = await Promise.all([
          supabase
            .from('planet_placement_index')
            .select('planet_name, sign_name')
            .eq('user_id', user.id),
          supabase
            .from('profiles')
            .select('birth_time')
            .eq('id', user.id)
            .single(),
        ]);
        const prefsSet = await hasOrientationPreferences(user.id);
        if (!cancelled) {
          setMyPlacements(data || []);
          setIndexed((data || []).length > 0);
          setViewerBirthTimeUnknown(!profileRow?.birth_time);
          setMyPrefsIncomplete(!prefsSet);
        }
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => { cancelled = true; };
  }, [enabled, user?.id]);

  // ─── Live pool: debounced, cancel-on-newer (§7) ───
  useEffect(() => {
    if (!indexed) return;
    const seq = ++poolSeq.current;
    setPoolLoading(true);
    const timer = setTimeout(async () => {
      const result = await countMatches(criteria, searchMode, datingOnly, preferenceMode);
      if (seq === poolSeq.current) { setPool(result); setPoolLoading(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [criteria, searchMode, datingOnly, preferenceMode, indexed]);

  useEffect(() => {
    if (!pool || pool.count > 0 || criteriaCount === 0) { setRelaxation([]); return; }
    let cancelled = false;
    getRelaxationOptions(criteria, datingOnly, preferenceMode).then(o => { if (!cancelled) setRelaxation(o); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool?.count, criteriaCount, datingOnly, preferenceMode]);

  useEffect(() => {
    if (tab === 'saved' && user?.id) getMyBuilds(user.id).then(setBuilds);
  }, [tab, user?.id]);

  // ─── Actions ───
  const setSign = (body: string, sign: string | null) =>
    setSelections(prev => ({ ...prev, [body]: { ...(prev[body] || { priority: 'must' as Priority }), sign } }));

  const setPriority = (body: string, priority: Priority) =>
    setSelections(prev => ({ ...prev, [body]: { ...(prev[body] || { sign: null }), priority } }));

  async function runSearch() {
    if (!user?.id) return;
    setTab('discovery');
    setSearching(true);
    setSearchError(null);
    setSearched(true);
    try {
      setSections(await getDiscoverySections({
        userId: user.id, criteria, searchMode, datingOnly, preferenceMode,
      }));
    } catch {
      setSearchError('Search failed. Try again.');
      setSections([]);
    } finally {
      setSearching(false);
    }
  }

  async function handleSave() {
    if (!user?.id || criteriaCount === 0) return;
    setSaving(true);
    const saved = await saveBuild({
      userId: user.id, name: saveName || 'My Build', criteria, searchMode, datingOnly,
    });
    setSaving(false);
    if (saved) { setSaveName(''); setBuilds(await getMyBuilds(user.id)); }
  }

  function applyBuild(b: SavedBuild) {
    const next: Record<string, Selection> = {};
    for (const c of b.criteria) next[c.body] = { sign: c.sign, priority: c.priority };
    setSelections(next);
    setSearchMode(b.search_mode);
    setDatingOnly(b.dating_only);
    setTab('build');
  }

  // ─── Gates ───
  if (!enabled) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-display font-bold text-text-primary">Build-A-Match isn&apos;t available yet</h1>
        <p className="text-text-tertiary text-sm mt-2">It&apos;s still in closed testing. Check back soon.</p>
      </div>
    );
  }
  if (booting) return <LoadingCosmic label="Reading your chart…" />;
  if (!indexed) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-3">🜛</p>
        <h1 className="text-xl font-display font-bold text-text-primary">We need your chart first</h1>
        <p className="text-text-tertiary text-sm mt-2">
          Add your birth date and place, then open Cosmic Index once to index your chart.
        </p>
        <Link href="/profile/edit" className="btn-primary inline-block mt-6 text-sm">Add my birth details</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-display font-bold text-text-primary tracking-wide">BUILD-A-MATCH</h1>
        <p className="text-accent-primary text-sm font-medium mt-1">Build your type. Let Align find them.</p>
      </header>

      <nav className="flex border-b border-border-primary mb-6" role="tablist">
        {(['build', 'discovery', 'saved'] as Tab[]).map(k => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`flex-1 py-3 text-xs font-bold tracking-wide transition border-b-2 ${
              tab === k
                ? 'border-accent-primary text-accent-primary'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            {k.toUpperCase()}
          </button>
        ))}
      </nav>

      {/* ══════════ BUILD ══════════ */}
      {tab === 'build' && (
        <div className="space-y-6">
          {/* YOU (§4) */}
          <section>
            <h2 className="text-[11px] font-bold tracking-widest text-text-secondary mb-2">YOU</h2>
            <div className="card p-4 space-y-1">
              {ESSENTIAL_BODIES.map(body => (
                <div key={body} className="flex justify-between text-sm">
                  <span className="text-text-muted">{PLANET_EMOJIS[body] || '•'} {body}</span>
                  <span className="text-text-primary font-medium">
                    {mySignFor(body) ? `${SIGN_EMOJIS[mySignFor(body)!] || ''} ${mySignFor(body)}` : '—'}
                  </span>
                </div>
              ))}
              {viewerBirthTimeUnknown && (
                <p className="text-xs text-text-muted pt-2 leading-relaxed">
                  ⓘ Your birth time is unknown, so Ascendant and MC searches are turned off — they
                  cannot be calculated reliably without it.
                </p>
              )}
            </div>
          </section>

          {/* BUILD YOUR MATCH */}
          <section>
            <h2 className="text-[11px] font-bold tracking-widest text-text-secondary mb-1">BUILD YOUR MATCH</h2>
            <p className="text-sm text-text-tertiary mb-3">
              Pick only what matters to you. Everything you leave on ANY stays wide open.
            </p>

            <div className="space-y-3">
              {(showDeeper ? [...ESSENTIAL_BODIES, ...EXPANDED_BODIES] : ESSENTIAL_BODIES).map(body => {
                const sel = selections[body] || { sign: null, priority: 'any' as Priority };
                const disabled = requiresBirthTime(body) && viewerBirthTimeUnknown;
                return (
                  <div key={body} className={`card p-4 ${disabled ? 'opacity-55' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-text-primary font-semibold text-sm">
                        {PLANET_EMOJIS[body] || '•'} Their {body}
                      </span>
                      {mySignFor(body) && (
                        <span className="text-xs text-text-muted">you: {mySignFor(body)}</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {PRIORITIES.map(p => (
                        <button
                          key={p.key}
                          disabled={disabled}
                          onClick={() => setPriority(body, p.key)}
                          aria-pressed={sel.priority === p.key}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide border transition ${
                            sel.priority === p.key
                              ? 'border-accent-primary text-accent-primary bg-accent-primary/15'
                              : 'border-border-primary text-text-muted hover:text-text-secondary'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    {sel.priority !== 'any' ? (
                      <div className="flex flex-wrap gap-1.5">
                        {SIGNS.map(sign => (
                          <button
                            key={sign}
                            disabled={disabled}
                            onClick={() => setSign(body, sel.sign === sign ? null : sign)}
                            aria-pressed={sel.sign === sign}
                            className={`px-2.5 py-1.5 rounded-lg text-xs border transition ${
                              sel.sign === sign
                                ? 'border-accent-primary bg-accent-primary/15 text-text-primary font-semibold'
                                : 'border-border-primary text-text-muted hover:text-text-secondary'
                            }`}
                          >
                            {SIGN_EMOJIS[sign]} {sign}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-text-muted">
                        Not filtering on {body}. This keeps your pool as wide as possible.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowDeeper(v => !v)}
              className="w-full mt-3 py-3 rounded-xl border border-dashed border-border-primary text-accent-primary text-xs font-bold tracking-wide hover:bg-bg-secondary transition"
            >
              {showDeeper ? 'SHOW LESS' : `GO DEEPER — ${EXPANDED_BODIES.length} more points`}
            </button>
          </section>

          {/* SEARCH MODE (§13) */}
          <section>
            <h2 className="text-[11px] font-bold tracking-widest text-text-secondary mb-2">SEARCH MODE</h2>
            <div className="space-y-2">
              {SEARCH_MODES.map(m => (
                <button
                  key={m.key}
                  onClick={() => setSearchMode(m.key)}
                  aria-pressed={searchMode === m.key}
                  className={`w-full card p-4 text-left flex items-center gap-3 transition ${
                    searchMode === m.key ? 'border-accent-primary' : ''
                  }`}
                >
                  <span className="flex-1">
                    <span className="block text-sm font-bold tracking-wide text-text-primary">{m.label}</span>
                    <span className="block text-xs text-text-muted mt-0.5">{m.hint}</span>
                  </span>
                  <span className={searchMode === m.key ? 'text-accent-primary' : 'text-text-muted'}>
                    {searchMode === m.key ? '●' : '○'}
                  </span>
                </button>
              ))}
            </div>

          </section>

          {/* WHO CAN MATCH YOU (§37) */}
          <section>
            <h2 className="text-[11px] font-bold tracking-widest text-text-secondary mb-2">
              WHO CAN MATCH YOU
            </h2>

            <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-4 flex gap-3">
              <span aria-hidden="true">🔒</span>
              <div>
                <p className="text-sm font-bold text-emerald-300">Orientation is always respected</p>
                <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                  Only people whose gender you&apos;re interested in — and who are interested in
                  yours — are ever searched. This is not a filter you can turn off.
                </p>
              </div>
            </div>

            {myPrefsIncomplete && (
              <Link
                href="/profile/edit"
                className="block rounded-xl border border-orange-500/35 bg-orange-500/10 p-4 mt-2 text-xs text-orange-300 leading-relaxed"
              >
                ⓘ You haven&apos;t set your gender and who you&apos;re interested in, so nobody can be
                filtered out for you yet. Tap to set them.
              </Link>
            )}

            <label className="card p-4 mt-2 flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferenceMode === 'strict'}
                onChange={e => setPreferenceMode(e.target.checked ? 'strict' : 'soft')}
                className="w-4 h-4 accent-[var(--accent-primary,#9B6FF6)]"
              />
              <span>
                <span className="block text-sm text-text-primary font-medium">Hide preference clashes</span>
                <span className="block text-xs text-text-muted">
                  Drops people who explicitly want the opposite thing — monogamous vs polyamorous,
                  wants children vs doesn&apos;t. Everything else still just ranks.
                </span>
              </span>
            </label>

            <label className="card p-4 mt-2 flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={datingOnly}
                onChange={e => setDatingOnly(e.target.checked)}
                className="w-4 h-4 accent-[var(--accent-primary,#9B6FF6)]"
              />
              <span>
                <span className="block text-sm text-text-primary font-medium">Dating-eligible members only</span>
                <span className="block text-xs text-text-muted">
                  Also requires dating to be switched on, and skips people you&apos;ve already
                  passed on or matched with.
                </span>
              </span>
            </label>
          </section>

          {/* LIVE POOL (§7) */}
          <section className="card p-5 text-center border-accent-primary">
            <p className="text-[11px] font-bold tracking-widest text-text-secondary">AVAILABLE MATCHES</p>
            <p className="text-4xl font-extrabold text-accent-primary my-1">
              {pool ? formatPoolCount(pool.count, pool.minPool) : '—'}
            </p>
            <p className="text-xs text-text-muted">
              {pool
                ? `from ${pool.eligiblePool.toLocaleString()} eligible members with an indexed chart`
                : 'counting…'}
              {poolLoading && pool ? ' · updating' : ''}
            </p>
            {pool && criteriaCount > 0 && pool.eligiblePool > 0 && (() => {
              const rarity = computeBuildRarity(pool.count, pool.eligiblePool);
              return (
                <p className="text-xs text-accent-secondary font-medium mt-2">
                  {rarity.label}
                  {rarity.percent !== null && pool.count > 0
                    ? ` — about ${rarity.percent}% of eligible members`
                    : ''}
                </p>
              );
            })()}
          </section>

          {/* ZERO-RESULT RECOVERY (§14) */}
          {pool && pool.count === 0 && criteriaCount > 0 && (
            <section className="rounded-xl border border-red-500/35 bg-red-500/10 p-4">
              <h3 className="text-sm font-bold tracking-wide text-red-300">YOUR BUILD IS EXTREMELY RARE</h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Nobody currently indexed matches all of it. Here is what is narrowing it most —
                measured against real members, not guessed.
              </p>
              <div className="space-y-3 mt-3">
                {relaxation.map(opt => (
                  <div key={opt.body}>
                    <p className="text-sm text-text-primary font-medium">
                      Removing {opt.sign} {opt.body} → {pool.count} to {opt.poolIfRelaxed}
                    </p>
                    <div className="flex gap-2 mt-1.5">
                      <button
                        onClick={() => setSelections(prev => ({ ...prev, [opt.body]: { sign: null, priority: 'any' } }))}
                        className="px-3 py-1.5 rounded-full border border-accent-primary text-accent-primary text-[11px] font-bold"
                      >
                        RELAX THIS
                      </button>
                      <button
                        onClick={() => setSelections(prev => ({
                          ...prev,
                          [opt.body]: { sign: prev[opt.body]?.sign ?? null, priority: 'preferred' },
                        }))}
                        className="px-3 py-1.5 rounded-full border border-accent-primary text-accent-primary text-[11px] font-bold"
                      >
                        MAKE PREFERRED
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setSearchMode('close')}
                className="w-full mt-4 py-2 rounded-full border border-accent-primary text-accent-primary text-[11px] font-bold"
              >
                SHOW CLOSE MATCHES
              </button>
            </section>
          )}

          <button
            onClick={runSearch}
            disabled={criteriaCount === 0}
            className="btn-primary w-full py-4 text-sm font-bold tracking-wide disabled:opacity-45"
          >
            {criteriaCount === 0 ? 'CHOOSE A PLACEMENT TO BEGIN' : 'DISCOVER MY MATCHES'}
          </button>

          {/* SAVE (§26) */}
          <section>
            <h2 className="text-[11px] font-bold tracking-widest text-text-secondary mb-2">SAVE THIS BUILD</h2>
            <div className="flex gap-2">
              <input
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                maxLength={60}
                placeholder="Name it — My Usual Type, Marriage Material…"
                aria-label="Build name"
                className="flex-1 bg-bg-card border border-border-primary rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-accent-primary transition"
              />
              <button
                onClick={handleSave}
                disabled={saving || criteriaCount === 0}
                className="btn-primary px-6 text-sm disabled:opacity-45"
              >
                {saving ? '…' : 'SAVE'}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ══════════ DISCOVERY ══════════ */}
      {tab === 'discovery' && (
        <div>
          {searching ? (
            <LoadingCosmic label="Searching your Align universe…" />
          ) : searchError ? (
            <div className="card p-8 text-center">
              <p className="text-text-primary font-semibold">Something went wrong</p>
              <p className="text-text-tertiary text-sm mt-1">{searchError}</p>
              <button onClick={runSearch} className="btn-primary mt-4 text-sm">Try again</button>
            </div>
          ) : !searched ? (
            <div className="card p-8 text-center">
              <p className="text-3xl mb-2">🜚</p>
              <p className="text-text-primary font-semibold">Build something first</p>
              <p className="text-text-tertiary text-sm mt-1">
                Choose the placements you want, then hit Discover My Matches.
              </p>
              <button onClick={() => setTab('build')} className="btn-primary mt-4 text-sm">Go to Build</button>
            </div>
          ) : sections.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-text-primary font-semibold">No one matches this build yet</p>
              <p className="text-text-tertiary text-sm mt-1 leading-relaxed">
                These are real members only — we will never invent profiles to fill the screen.
                Try Close Build, or relax a must-have.
              </p>
              <button onClick={() => setTab('build')} className="btn-primary mt-4 text-sm">Adjust my build</button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="card p-5 border-accent-primary">
                <h2 className="text-accent-primary font-extrabold tracking-wide">YOUR BUILD EXISTS</h2>
                <p className="text-sm text-text-muted mt-1">
                  You selected {criteriaCount} placement{criteriaCount === 1 ? '' : 's'}.
                  {pool ? ` ${pool.eligiblePool.toLocaleString()} eligible members were searched.` : ''}
                </p>
              </div>

              {sections.map(section => (
                <section key={section.key}>
                  <h2 className="text-lg font-display font-bold text-text-primary">{section.title}</h2>
                  <p className="text-xs text-text-muted mb-3">{section.subtitle}</p>
                  <div className="space-y-3">
                    {section.results.map(r => <MatchCard key={`${section.key}-${r.userId}`} r={r} />)}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════ SAVED ══════════ */}
      {tab === 'saved' && (
        <div className="space-y-3">
          {builds.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-3xl mb-2">🜔</p>
              <p className="text-text-primary font-semibold">No saved builds yet</p>
              <p className="text-text-tertiary text-sm mt-1">Build something on the Build tab and name it.</p>
            </div>
          ) : builds.map(b => (
            <div key={b.id} className="card p-4">
              <div className="flex items-center justify-between">
                <span className="text-text-primary font-bold">{b.name}</span>
                <span className="text-[11px] text-text-muted">v{b.version} · {b.search_mode}</span>
              </div>
              <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
                {b.criteria.length === 0
                  ? 'No criteria'
                  : b.criteria.map(c =>
                      `${c.sign} ${c.body}${c.priority === 'must' ? '!' : c.priority === 'avoid' ? '✕' : ''}`,
                    ).join('  ·  ')}
              </p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => applyBuild(b)} className="px-4 py-1.5 rounded-full border border-border-primary text-text-secondary text-[11px] font-bold">
                  LOAD
                </button>
                <button
                  onClick={async () => {
                    if (!user?.id) return;
                    await deleteBuild(user.id, b.id);
                    setBuilds(await getMyBuilds(user.id));
                  }}
                  className="px-4 py-1.5 rounded-full border border-red-500/60 text-red-300 text-[11px] font-bold"
                >
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * The two scores stay separate (§11) and every result carries its real
 * per-criterion outcome (§45).
 */
function MatchCard({ r }: { r: BuildMatchResult }) {
  const matched = r.outcomes.filter(o => o.matched);
  const missed = r.outcomes.filter(o => !o.matched);

  const tags: Array<{ label: string; cls: string }> = [];
  if (r.isMutualBuild) tags.push({ label: '★ Mutual Build', cls: 'border-amber-400 text-amber-400' });
  if (r.hasPreferenceConflict) tags.push({ label: '⚠ Preference clash', cls: 'border-orange-400 text-orange-400' });
  if (r.isPerfectBuild) tags.push({ label: '✦ Perfect Build', cls: 'border-accent-primary text-accent-primary' });
  if (r.isWildCard) tags.push({ label: '↯ Wild Card', cls: 'border-pink-400 text-pink-400' });
  if (!r.isPerfectBuild && r.isCloseBuild) tags.push({ label: '◐ Close Build', cls: 'border-blue-400 text-blue-400' });

  return (
    <Link href={`/user/${r.userId}`} className="card p-4 block hover:border-accent-primary transition">
      <div className="flex items-center gap-3">
        <UserAvatar displayName={r.displayName} avatarUrl={r.avatarUrl} size="lg" />
        <div className="min-w-0">
          <p className="text-text-primary font-bold truncate">{r.displayName}</p>
          <p className="text-xs text-text-muted truncate">
            {[r.sunSign && `☉ ${r.sunSign}`, r.moonSign && `☽ ${r.moonSign}`, r.risingSign && `↑ ${r.risingSign}`]
              .filter(Boolean).join('  ·  ') || 'Chart indexed'}
          </p>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {tags.map(t => (
            <span key={t.label} className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${t.cls}`}>
              {t.label}
            </span>
          ))}
        </div>
      )}

      {/* Three scores, deliberately separate — never blended (§11) */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div>
          <p className="text-xl font-extrabold text-accent-primary">{r.buildFit}%</p>
          <p className="text-[10px] font-bold tracking-wide text-text-secondary">BUILD MATCH</p>
        </div>
        <div className="border-l border-border-primary pl-3">
          <p className={`text-xl font-extrabold ${r.cosmicCompatibility !== null ? 'text-blue-400' : 'text-text-muted'}`}>
            {r.cosmicCompatibility !== null ? `${r.cosmicCompatibility}%` : '—'}
          </p>
          <p className="text-[10px] font-bold tracking-wide text-text-secondary">COSMIC</p>
        </div>
        <div className="border-l border-border-primary pl-3">
          <p className={`text-xl font-extrabold ${r.preferenceMatch !== null ? 'text-emerald-400' : 'text-text-muted'}`}>
            {r.preferenceMatch !== null ? `${r.preferenceMatch}%` : '—'}
          </p>
          <p className="text-[10px] font-bold tracking-wide text-text-secondary">PREFERENCES</p>
        </div>
      </div>

      <p className="text-[11px] text-text-muted mt-2">
        Build = what you asked for · Cosmic ={' '}
        {r.compatibilityBand
          ? r.compatibilityBand.toLowerCase()
          : 'not enough chart data to score honestly'}
      </p>

      {r.preferenceBreakdown && r.preferenceBreakdown.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {r.preferenceBreakdown
            .filter(b => b.alignment === 'strong' || b.alignment === 'conflict')
            .slice(0, 4)
            .map(b => (
              <span
                key={b.category}
                className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  b.alignment === 'conflict'
                    ? 'bg-orange-500/15 text-orange-300'
                    : 'bg-emerald-500/12 text-emerald-300'
                }`}
              >
                {b.alignment === 'conflict' ? '✕' : '✓'} {b.label}
              </span>
            ))}
        </div>
      )}

      {r.outcomes.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border-primary">
          <p className="text-[10px] font-bold tracking-wide text-text-secondary mb-1.5">
            WHY THEY MATCH YOUR BUILD
          </p>
          {matched.map(o => (
            <p key={`m-${o.body}`} className="text-[13px] text-emerald-400 leading-relaxed">
              ✓ {o.priority === 'avoid' ? `No ${o.sign} ${o.body}` : `${o.sign} ${o.body}`}
            </p>
          ))}
          {missed.map(o => (
            <p key={`x-${o.body}`} className="text-[13px] text-text-muted leading-relaxed">
              ✕ {o.priority === 'avoid' ? `Has ${o.sign} ${o.body}` : `${o.sign} ${o.body}`}
              {o.actualSign && o.priority !== 'avoid' ? ` · they have ${o.actualSign}` : ''}
            </p>
          ))}
        </div>
      )}

      {!r.birthTimeKnown && (
        <p className="text-[11px] text-text-muted italic mt-3">
          ⓘ Their birth time is unknown — Ascendant, MC and house placements are not reliable for them.
        </p>
      )}

      {r.isWildCard && (
        <p className="text-center text-xs font-semibold text-pink-300 mt-3 py-2 rounded-lg bg-pink-500/10">
          Not what you built — but worth discovering.
        </p>
      )}
    </Link>
  );
}
