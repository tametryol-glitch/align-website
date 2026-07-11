'use client';

/**
 * Zodisphere -- the Align community globe (web).
 *
 * Shows ONLY aggregated, banded (k>=10) community activity by country and
 * city. No user's exact location exists anywhere in this feature; every
 * light is a place centroid. Visibility is opt-in and HIDDEN by default —
 * exploring the globe never makes you discoverable.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Globe2, X, Settings, CalendarDays, MessageCircle, Sparkles, Orbit, Lock, GitMerge, Plus, Pause, Play, Box } from 'lucide-react';
import ZodiGlobe from '@/components/zodisphere/ZodiGlobe';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { isZodisphere3dEnabled } from '@/config/featureFlags';
import { getMyAcgLines, type AcgGlobeLine } from '@/lib/zodisphereAcg';
import {
  getMyChartBodies, buildMidpointLines, probeMidpoints,
  ASTEROID_CATALOG_NAMES, bodyInfoOf,
  type ChartData, type MidpointLine, type ProbeHit,
} from '@/lib/zodisphereMidpoints';

const MAX_MIDPOINTS = 8;
import {
  getPublicAreaStats,
  getAreaFeed,
  getAreaEvents,
  getAreaMembers,
  getMyPrefs,
  getArea,
  createZodispherePost,
  reportZodispherePost,
  muteUserOnMap,
  bandLabel,
  type AreaStat,
  type ZodispherePost,
  type ZodisphereEvent,
  type ZodisphereReportCategory,
  type AreaMember,
} from '@/lib/zodisphereService';
import { getGlobalSky, getSkyOverPlace, signGlyph, type SkyReading } from '@/lib/zodisphereSky';

const INTRO_SEEN_KEY = 'zodisphere_intro_seen_v1';

export default function ZodispherePage() {
  const [areas, setAreas] = useState<AreaStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [spinPaused, setSpinPaused] = useState(false); // user can stop the globe spinning
  const [showIntro, setShowIntro] = useState(false);
  const [selected, setSelected] = useState<AreaStat | null>(null);
  const [feed, setFeed] = useState<ZodispherePost[]>([]);
  const [events, setEvents] = useState<ZodisphereEvent[]>([]);
  const [panelLoading, setPanelLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [postingDraft, setPostingDraft] = useState(false);
  const [draftMsg, setDraftMsg] = useState<string | null>(null);
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [members, setMembers] = useState<AreaMember[]>([]);
  // The signed-in user's own chosen, discoverable place (their "you are here").
  const [myPlace, setMyPlace] = useState<{ lat: number; lng: number; name: string } | null>(null);

  // ── Astrocartography (premium): the user's natal planetary lines on the globe ──
  const { profile } = useAuthStore();
  const { hasAccess } = useSubscriptionStore();
  const acgUnlocked = hasAccess('acg');
  const [showAcg, setShowAcg] = useState(false);
  const [acgLines, setAcgLines] = useState<AcgGlobeLine[]>([]);
  const [acgLoading, setAcgLoading] = useState(false);

  const toggleAcg = useCallback(async () => {
    if (!acgUnlocked) return;
    if (showAcg) { setShowAcg(false); return; }
    setShowAcg(true);
    if (acgLines.length === 0) {
      setAcgLoading(true);
      try {
        setAcgLines(await getMyAcgLines(profile));
      } finally {
        setAcgLoading(false);
      }
    }
  }, [acgUnlocked, showAcg, acgLines.length, profile]);

  // ── Midpoints (premium): tappable midpoint astrocartography ──
  const midpointsUnlocked = hasAccess('midpoints');
  const [showMidpoints, setShowMidpoints] = useState(false);
  const [chart, setChart] = useState<ChartData | null>(null);
  const [chartTried, setChartTried] = useState(false);
  const [activePairs, setActivePairs] = useState<Array<{ a: string; b: string }>>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickA, setPickA] = useState<string>('');
  const [loadedExtras, setLoadedExtras] = useState<string[]>([]);
  const [loadingBody, setLoadingBody] = useState(false);
  const [probePoint, setProbePoint] = useState<{ lat: number; lng: number } | null>(null);
  const [probeHits, setProbeHits] = useState<ProbeHit[]>([]);

  const toggleMidpoints = useCallback(async () => {
    if (!midpointsUnlocked) return;
    if (showMidpoints) { setShowMidpoints(false); setProbeHits([]); setProbePoint(null); return; }
    setShowMidpoints(true);
    if (!chart && !chartTried) {
      setChartTried(true);
      setChart(await getMyChartBodies(profile));
    }
  }, [midpointsUnlocked, showMidpoints, chart, chartTried, profile]);

  const lonOf = useCallback(
    (name: string) => chart?.bodies.find((b) => b.name === name)?.longitude,
    [chart]
  );

  // All lines for the active pairs (flattened).
  const midpointLines = useMemo<MidpointLine[]>(() => {
    if (!chart) return [];
    const out: MidpointLine[] = [];
    for (const pair of activePairs) {
      const la = lonOf(pair.a); const lb = lonOf(pair.b);
      if (la == null || lb == null) continue;
      out.push(...buildMidpointLines(pair.a, pair.b, la, lb, chart.birthDate));
    }
    return out;
  }, [chart, activePairs, lonOf]);

  const addPair = useCallback((a: string, b: string) => {
    if (a === b) return;
    setActivePairs((prev) => {
      if (prev.length >= MAX_MIDPOINTS) return prev;
      if (prev.some((p) => (p.a === a && p.b === b) || (p.a === b && p.b === a))) return prev;
      return [...prev, { a, b }];
    });
    setPickA(''); setPickerOpen(false);
  }, []);

  // Ensure a body's position is loaded (lazily fetching a searched catalog
  // asteroid); returns false if the backend couldn't compute it.
  const ensureLoaded = useCallback(async (name: string): Promise<boolean> => {
    if (chart?.bodies.some((b) => b.name === name)) return true;
    setLoadingBody(true);
    try {
      const next = Array.from(new Set([...loadedExtras, name]));
      const fresh = await getMyChartBodies(profile, next);
      if (fresh && fresh.bodies.some((b) => b.name === name)) {
        setChart(fresh);
        setLoadedExtras(next);
        return true;
      }
      return false;
    } finally {
      setLoadingBody(false);
    }
  }, [chart, loadedExtras, profile]);

  const pickFirst = useCallback(async (name: string) => {
    if (await ensureLoaded(name)) setPickA(name);
  }, [ensureLoaded]);

  const pickSecond = useCallback(async (name: string) => {
    if (await ensureLoaded(name)) addPair(pickA, name);
  }, [ensureLoaded, addPair, pickA]);

  const handleProbe = useCallback((lat: number, lng: number) => {
    if (!showMidpoints) return;
    setProbePoint({ lat, lng });
    setProbeHits(probeMidpoints(lat, lng, midpointLines));
  }, [showMidpoints, midpointLines]);

  // Live sky — global strip (always visible) + per-place reading when an area is open.
  const globalSky = useMemo(() => getGlobalSky(), []);
  const placeSky = useMemo<SkyReading | null>(
    () => (selected ? getSkyOverPlace(selected.center_lat, selected.center_lng) : null),
    [selected]
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem(INTRO_SEEN_KEY)) {
      setShowIntro(true);
    }
    getPublicAreaStats()
      .then(setAreas)
      .finally(() => setLoading(false));

    // Load the signed-in user's own place so we can show them on the map.
    (async () => {
      const prefs = await getMyPrefs();
      if (prefs?.discoverable_on_map && prefs.area_id && prefs.visibility_mode !== 'hidden') {
        const area = await getArea(prefs.area_id);
        if (area) setMyPlace({ lat: area.center_lat, lng: area.center_lng, name: area.display_name });
      }
    })();
  }, []);

  const dismissIntro = useCallback(() => {
    localStorage.setItem(INTRO_SEEN_KEY, '1');
    setShowIntro(false);
  }, []);

  const handleAreaClick = useCallback(async (area: AreaStat) => {
    setSelected(area);
    setPanelLoading(true);
    setDraft('');
    setDraftMsg(null);
    try {
      const [f, e, m] = await Promise.all([
        getAreaFeed(area.area_id, 15),
        getAreaEvents(area.area_id),
        getAreaMembers(area.area_id),
      ]);
      setFeed(f);
      setEvents(e);
      setMembers(m);
    } finally {
      setPanelLoading(false);
    }
  }, []);

  const handleReport = useCallback(async (p: ZodispherePost, category: ZodisphereReportCategory) => {
    const res = await reportZodispherePost(p, category);
    setReportingId(null);
    setDraftMsg(res.success ? 'Report submitted — our team will review it.' : res.error ?? 'Report failed.');
  }, []);

  const handleMute = useCallback(async (p: ZodispherePost) => {
    const res = await muteUserOnMap(p.user_id);
    if (res.success && selected) {
      setFeed(await getAreaFeed(selected.area_id, 15));
      setDraftMsg('Muted — you will no longer see this member’s posts on the Zodisphere.');
    }
  }, [selected]);

  const submitDraft = useCallback(async () => {
    if (!selected || !draft.trim()) return;
    setPostingDraft(true);
    setDraftMsg(null);
    try {
      const res = await createZodispherePost({
        areaId: selected.area_id,
        contentType: 'text',
        body: draft.trim(),
      });
      if (res.success) {
        setDraft('');
        setDraftMsg('Shared to the Zodisphere.');
        setFeed(await getAreaFeed(selected.area_id, 15));
      } else {
        setDraftMsg(res.error ?? 'Could not post.');
      }
    } finally {
      setPostingDraft(false);
    }
  }, [selected, draft]);

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 30% 20%, #131a38 0%, #0a0e1a 55%, #06080f 100%)',
      }}
    >
      {/* ── Header ── */}
      <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <Globe2 className="w-6 h-6 text-accent-primary" />
          <div>
            <h1 className="text-lg font-semibold text-white leading-tight">The Zodisphere</h1>
            <p className="text-[11px] text-white/50">
              The Align community across the living Earth — no exact locations, ever.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Switch to the 3D Cesium globe (only for accounts with 3D access). */}
          {isZodisphere3dEnabled(profile?.email) && (
            <Link
              href="/zodisphere/globe3d"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm border bg-fuchsia-500/15 border-fuchsia-400/40 text-fuchsia-100 hover:bg-fuchsia-500/25 transition-colors"
              title="Switch to the 3D Earth"
            >
              <Box className="w-4 h-4" />
              <span className="hidden sm:inline">3D globe</span>
            </Link>
          )}
          {/* Pause / resume the globe spin (free, always available) */}
          <button
            onClick={() => setSpinPaused((v) => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-colors ${
              spinPaused
                ? 'bg-accent-primary/20 border-accent-primary text-accent-primary'
                : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
            }`}
            title={spinPaused ? 'Resume the globe spinning' : 'Stop the globe spinning'}
            aria-pressed={spinPaused}
          >
            {spinPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span className="hidden sm:inline">{spinPaused ? 'Spin' : 'Pause'}</span>
          </button>
          {/* Astrocartography toggle (premium) */}
          {acgUnlocked ? (
            <button
              onClick={toggleAcg}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-colors ${
                showAcg
                  ? 'bg-accent-primary/20 border-accent-primary text-accent-primary'
                  : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
              }`}
              title="Show your natal astrocartography lines"
            >
              <Orbit className="w-4 h-4" />
              {acgLoading ? 'Charting…' : 'My astro lines'}
            </button>
          ) : (
            <Link
              href="/pricing"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              title="Astrocartography is a premium feature"
            >
              <Lock className="w-3.5 h-3.5" />
              Astro lines
            </Link>
          )}
          {/* Midpoints toggle (premium) */}
          {midpointsUnlocked ? (
            <button
              onClick={toggleMidpoints}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-colors ${
                showMidpoints
                  ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-200'
                  : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
              }`}
              title="Tappable midpoint astrocartography"
            >
              <GitMerge className="w-4 h-4" />
              Midpoints
            </button>
          ) : (
            <Link
              href="/pricing"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              title="Midpoints is a premium feature"
            >
              <Lock className="w-3.5 h-3.5" />
              Midpoints
            </Link>
          )}
          <Link
            href="/zodisphere/settings"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/80 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">My visibility</span>
          </Link>
        </div>
      </header>

      {/* ── Astrocartography: needs birth data ── */}
      {showAcg && !acgLoading && acgLines.length === 0 && (
        <div className="absolute top-20 right-5 z-10 max-w-[220px] bg-black/50 backdrop-blur border border-white/10 rounded-xl p-3">
          <p className="text-[11px] text-white/70">
            Add your birth date, time, and place in your profile to see your astrocartography lines.
          </p>
        </div>
      )}

      {/* ── Astrocartography legend ── */}
      {showAcg && acgLines.length > 0 && (
        <div className="absolute top-20 right-5 z-10 max-w-[220px] bg-black/50 backdrop-blur border border-white/10 rounded-xl p-3 pointer-events-none">
          <p className="text-[11px] text-white/70 leading-relaxed">
            <Orbit className="w-3.5 h-3.5 inline mr-1 text-accent-primary" />
            Your <strong className="text-white">astrocartography</strong> — where each planet was rising (ASC), setting (DSC), or overhead (MC/IC) at your birth. Standing on a line amplifies that planet in your life.
          </p>
        </div>
      )}

      {/* ── Midpoint control panel ── */}
      {showMidpoints && (
        <div className="absolute top-20 left-5 z-20 w-[260px] max-w-[calc(100vw-40px)] bg-black/55 backdrop-blur border border-fuchsia-400/25 rounded-2xl p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <GitMerge className="w-4 h-4 text-fuchsia-300" />
            <h2 className="text-sm font-semibold text-white">Midpoints</h2>
          </div>
          {chart && chart.bodies.length === 0 && (
            <p className="text-[11px] text-white/60">Add your birth date, time, and place in your profile to use midpoints.</p>
          )}
          {chart && chart.bodies.length > 0 && (
            <>
              <p className="text-[11px] text-white/60 mb-2">
                Pick two placements. Then <strong className="text-white">tap the globe</strong> to read the midpoint lines you&apos;re near.
              </p>

              {/* Active pairs */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {activePairs.map((p) => (
                  <span key={`${p.a}|${p.b}`} className="flex items-center gap-1 text-[11px] bg-fuchsia-500/15 border border-fuchsia-400/30 text-fuchsia-100 rounded-full pl-2 pr-1 py-0.5">
                    {p.a}/{p.b}
                    <button onClick={() => setActivePairs((prev) => prev.filter((q) => !(q.a === p.a && q.b === p.b)))} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {activePairs.length === 0 && <span className="text-[11px] text-white/40">No midpoints yet.</span>}
              </div>

              {/* Picker */}
              {activePairs.length < MAX_MIDPOINTS && (
                pickerOpen ? (
                  <div className="space-y-1.5">
                    {!pickA ? (
                      <BodyGrid
                        loaded={chart.bodies.map((b) => b.name)}
                        onPick={pickFirst}
                        label="First placement"
                        loading={loadingBody}
                      />
                    ) : (
                      <BodyGrid
                        loaded={chart.bodies.map((b) => b.name).filter((n) => n !== pickA)}
                        onPick={pickSecond}
                        label={`${pickA} / … choose second`}
                        loading={loadingBody}
                        exclude={pickA}
                      />
                    )}
                    <button onClick={() => { setPickerOpen(false); setPickA(''); }} className="text-[11px] text-white/50 hover:text-white">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setPickerOpen(true)} className="flex items-center gap-1 text-[12px] text-fuchsia-200 bg-fuchsia-500/10 border border-fuchsia-400/25 rounded-lg px-2.5 py-1.5 hover:bg-fuchsia-500/20">
                    <Plus className="w-3.5 h-3.5" /> Add a midpoint
                  </button>
                )
              )}
              {activePairs.length >= MAX_MIDPOINTS && <p className="text-[10px] text-white/40">Max {MAX_MIDPOINTS} lines. Remove one to add another.</p>}
            </>
          )}
        </div>
      )}

      {/* ── Tap-probe result card ── */}
      {showMidpoints && probePoint && (
        <div className="absolute bottom-24 inset-x-0 z-20 flex justify-center px-4">
          <div className="w-full max-w-md bg-bg-card/95 backdrop-blur border border-fuchsia-400/30 rounded-2xl p-4 max-h-[45vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-semibold text-fuchsia-200">
                {probeHits.length ? 'Midpoint lines here' : 'No midpoint lines within range'}
              </h3>
              <button onClick={() => { setProbePoint(null); setProbeHits([]); }} className="text-text-muted hover:text-text-primary">
                <X className="w-4 h-4" />
              </button>
            </div>
            {probeHits.length === 0 ? (
              <p className="text-xs text-text-muted">Tap closer to a dashed line, or add more midpoints to explore.</p>
            ) : (
              <ul className="space-y-3">
                {probeHits.map((h) => (
                  <li key={`${h.line.key}-${h.line.lineType}`}>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: h.line.color }} />
                      <span className="text-sm font-medium text-text-primary">{h.line.bodyA}/{h.line.bodyB} {h.line.lineType}</span>
                      <span className="text-[10px] text-text-muted">{h.distanceDeg.toFixed(1)}° off</span>
                    </div>
                    <p className="text-[12px] text-text-secondary leading-relaxed mt-1"
                      dangerouslySetInnerHTML={{ __html: h.meaning.replace(/\*\*(.+?)\*\*/g, '<strong class="text-text-primary">$1</strong>') }} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ── Globe ── */}
      <div className="absolute inset-0">
        <ZodiGlobe
          areas={areas}
          onAreaClick={handleAreaClick}
          autoRotate={!selected && !probePoint && !spinPaused}
          focus={selected && !showMidpoints ? { lat: selected.center_lat, lng: selected.center_lng } : null}
          myPlace={myPlace}
          acgLines={showAcg && !showMidpoints ? acgLines : []}
          midpointLines={showMidpoints ? midpointLines : []}
          onProbe={handleProbe}
          probePoint={showMidpoints ? probePoint : null}
        />
      </div>

      {/* ── "You're on the map" confirmation (only when opted in) ── */}
      {myPlace && (
        <div className="absolute top-24 inset-x-0 z-10 flex justify-center px-4 pointer-events-none">
          <div className="flex items-center gap-2 bg-teal-400/10 border border-teal-400/40 rounded-full px-4 py-1.5 text-teal-200 text-[13px]">
            <span>📍</span>
            You&apos;re on the map in <strong>{myPlace.name}</strong> — others here can find you.
          </div>
        </div>
      )}

      {/* ── Live cosmic-weather strip (always valuable, needs no community) ── */}
      <div className="absolute bottom-6 inset-x-0 z-10 flex justify-center px-4 pointer-events-none">
        <div className="flex items-center gap-4 bg-black/40 backdrop-blur border border-white/10 rounded-full px-5 py-2.5 text-white">
          <span className="text-[13px]">
            <span className="text-amber-300">{'☉'}</span> Sun in{' '}
            <strong>{signGlyph(globalSky.sun.sign)} {globalSky.sun.sign}</strong>
          </span>
          <span className="w-px h-4 bg-white/15" />
          <span className="text-[13px]">
            <span className="mr-0.5">{globalSky.moon.emoji}</span>{' '}
            {globalSky.moon.phase} · <strong>{globalSky.moon.illumination}%</strong> lit ·{' '}
            {signGlyph(globalSky.moon.sign)} {globalSky.moon.sign}
          </span>
          {!loading && areas.length === 0 && (
            <>
              <span className="w-px h-4 bg-white/15" />
              <span className="text-[12px] text-white/60">
                <Sparkles className="w-3.5 h-3.5 inline mr-1 text-accent-primary" />
                Be the first to light up your city
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Area panel ── */}
      {selected && (
        <aside className="absolute top-0 right-0 bottom-0 z-30 w-full sm:w-[380px] bg-bg-card/95 backdrop-blur border-l border-border-primary flex flex-col">
          <div className="flex items-start justify-between p-4 border-b border-border-primary">
            <div>
              <h2 className="text-base font-semibold text-text-primary">{selected.display_name}</h2>
              <p className="text-xs text-accent-primary mt-0.5">{bandLabel(selected.member_band)}</p>
              <div className="flex gap-3 mt-1 text-[11px] text-text-muted">
                {selected.post_band && <span>{selected.post_band} posts</span>}
                {selected.event_band && <span>{selected.event_band} events</span>}
                {selected.creator_band && <span>{selected.creator_band} creators</span>}
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-bg-tertiary text-text-muted hover:text-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {panelLoading && <p className="text-sm text-text-muted">Reading the local sky…</p>}

            {!panelLoading && (
              <>
                {/* Sky over this place — live, needs no community. The local
                    planetary hour makes it specific to HERE. */}
                {placeSky && (
                  <section className="rounded-xl p-3 border border-white/10"
                    style={{ background: 'linear-gradient(135deg, rgba(155,111,246,0.14), rgba(20,22,58,0.4))' }}>
                    <h3 className="text-[11px] uppercase tracking-wider text-text-muted mb-2">
                      The sky over {selected.display_name.split(',')[0]} right now
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-text-primary flex-wrap">
                      <span className="text-amber-300">{'☉'} {signGlyph(placeSky.sun.sign)} {placeSky.sun.sign}</span>
                      <span className="text-text-muted">·</span>
                      <span>{placeSky.moon.emoji} {placeSky.moon.phase} {placeSky.moon.illumination}%</span>
                    </div>
                    {placeSky.hour && (
                      <div className="mt-2 flex items-start gap-2">
                        <span className="text-lg leading-none" style={{ color: placeSky.hour.color }}>{placeSky.hour.glyph}</span>
                        <p className="text-[12px] text-text-secondary">
                          <span className="text-text-primary font-medium">{placeSky.hour.planet} hour</span> here —
                          <span className="italic"> {placeSky.hour.essence}</span>.
                          <span className="text-text-muted"> {placeSky.hour.keywords}.</span>
                        </p>
                      </div>
                    )}
                  </section>
                )}

                {/* Composer — post is linked to the PLACE, never the author's position */}
                <section className="bg-bg-secondary rounded-xl p-3">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={`What’s happening under the ${selected.display_name.split(',')[0]} sky?`}
                    maxLength={2000}
                    rows={2}
                    className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none resize-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-text-muted">
                      Linked to {selected.display_name} — never to your location.
                    </p>
                    <button
                      onClick={submitDraft}
                      disabled={postingDraft || !draft.trim()}
                      className="btn-primary px-4 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40"
                    >
                      {postingDraft ? 'Posting…' : 'Post'}
                    </button>
                  </div>
                  {draftMsg && <p className="text-[11px] text-accent-primary mt-1.5">{draftMsg}</p>}
                </section>

                {/* Members discoverable here (opt-in only) */}
                {members.length > 0 && (
                  <section>
                    <h3 className="text-sm font-medium text-text-primary mb-2">
                      Members here ({members.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {members.map((m) => (
                        <Link
                          key={m.user_id}
                          href={`/user/${m.user_id}`}
                          className="flex items-center gap-2 bg-bg-secondary rounded-full pl-1 pr-3 py-1 hover:bg-bg-tertiary"
                        >
                          <span className="w-6 h-6 rounded-full bg-accent-primary/25 flex items-center justify-center text-[11px] text-accent-primary overflow-hidden">
                            {m.avatar_url
                              ? <img src={m.avatar_url} alt="" className="w-full h-full object-cover" />
                              : (m.display_name?.[0]?.toUpperCase() ?? '★')}
                          </span>
                          <span className="text-xs text-text-secondary">{m.display_name ?? 'Align member'}</span>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* Events */}
                <section>
                  <h3 className="flex items-center gap-1.5 text-sm font-medium text-text-primary mb-2">
                    <CalendarDays className="w-4 h-4 text-accent-primary" /> Events
                  </h3>
                  {events.length === 0 ? (
                    <p className="text-xs text-text-muted">No events here yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {events.map((e) => (
                        <li key={e.id} className="bg-bg-secondary rounded-xl p-3">
                          <p className="text-sm text-text-primary font-medium">{e.title}</p>
                          <p className="text-[11px] text-text-muted mt-0.5">
                            {e.event_type} · {e.online_or_physical === 'online' ? 'Online' : 'In person'}
                            {e.online_or_physical === 'physical' && !e.has_venue ? '' : ''}
                            {e.start_time ? ` · ${new Date(e.start_time).toLocaleDateString()}` : ''}
                          </p>
                          {e.online_or_physical === 'physical' && (
                            <p className="text-[11px] text-accent-primary mt-1">
                              Venue revealed after registration
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* Posts */}
                <section>
                  <h3 className="flex items-center gap-1.5 text-sm font-medium text-text-primary mb-2">
                    <MessageCircle className="w-4 h-4 text-accent-primary" /> Voices from here
                  </h3>
                  {feed.length === 0 ? (
                    <p className="text-xs text-text-muted">No Zodisphere posts from this area yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {feed.map((p) => (
                        <li key={p.id} className="bg-bg-secondary rounded-xl p-3">
                          <p className="text-sm text-text-primary whitespace-pre-wrap line-clamp-4">{p.body}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-[11px] text-text-muted">
                              {new Date(p.created_at).toLocaleString()}
                            </p>
                            <div className="flex gap-2 text-[11px]">
                              <button
                                onClick={() => setReportingId(reportingId === p.id ? null : p.id)}
                                className="text-text-muted hover:text-red-400"
                              >
                                Report
                              </button>
                              <button onClick={() => handleMute(p)} className="text-text-muted hover:text-text-primary">
                                Mute
                              </button>
                            </div>
                          </div>
                          {reportingId === p.id && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              <button
                                onClick={() => handleReport(p, 'location_doxxing')}
                                className="text-[10px] px-2 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20"
                              >
                                Shares someone’s location
                              </button>
                              <button
                                onClick={() => handleReport(p, 'location_harassment')}
                                className="text-[10px] px-2 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20"
                              >
                                Stalking / harassment
                              </button>
                              <button
                                onClick={() => handleReport(p, 'inappropriate_content')}
                                className="text-[10px] px-2 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20"
                              >
                                Inappropriate content
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </>
            )}
          </div>
        </aside>
      )}

      {/* ── First-run privacy explainer (required disclosure) ── */}
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-bg-card border border-border-primary rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-2 mb-3">
              <Globe2 className="w-6 h-6 text-accent-primary" />
              <h2 className="text-lg font-semibold text-text-primary">Welcome to the Zodisphere</h2>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              The Zodisphere lets you explore the global Align community through countries, regions,
              cities, posts, events, and astrology.
            </p>
            <ul className="text-sm text-text-secondary mt-3 space-y-1.5">
              <li>• Align <strong className="text-text-primary">never shows your exact location</strong> — lights on the globe are cities, not people.</li>
              <li>• Community counts appear only as ranges, and only where 10+ members have opted in.</li>
              <li>• Your geographic visibility is <strong className="text-text-primary">off unless you turn it on</strong>, and you can turn it off or remove it at any time.</li>
            </ul>
            <button onClick={dismissIntro} className="w-full btn-primary py-2.5 rounded-xl text-sm font-medium mt-5">
              Explore the Zodisphere
            </button>
            <Link
              href="/zodisphere/settings"
              onClick={dismissIntro}
              className="block text-center text-xs text-accent-primary mt-3 hover:underline"
            >
              Or put your city on the map →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Body picker grid: loaded bodies + searchable full asteroid catalog ─────
function BodyGrid({
  loaded, onPick, label, loading, exclude,
}: {
  loaded: string[];
  onPick: (b: string) => void;
  label: string;
  loading?: boolean;
  exclude?: string;
}) {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();

  const loadedSet = new Set(loaded);
  // Catalog asteroids not already loaded — the "other ones" you can search for.
  const catalogExtra = ASTEROID_CATALOG_NAMES.filter(
    (n) => !loadedSet.has(n) && n !== exclude,
  );

  const match = (n: string) => !query || n.toLowerCase().includes(query);
  const shownLoaded = loaded.filter(match);
  const shownCatalog = catalogExtra.filter(match).slice(0, query ? 40 : 12);

  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">{label}</p>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search a planet, asteroid, or point…"
        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white placeholder:text-white/40 outline-none mb-1.5"
      />
      <div className="flex flex-wrap gap-1 max-h-44 overflow-y-auto">
        {shownLoaded.map((name) => (
          <button
            key={name}
            disabled={loading}
            onClick={() => onPick(name)}
            className="flex items-center gap-1 text-[11px] text-white/85 bg-white/5 border border-white/10 rounded-lg px-2 py-1 hover:bg-white/15 disabled:opacity-40"
          >
            <span className="w-2 h-2 rounded-full" style={{ background: bodyInfoOf(name).color }} />
            {name}
          </button>
        ))}
        {shownCatalog.map((name) => (
          <button
            key={name}
            disabled={loading}
            onClick={() => onPick(name)}
            title="Load this asteroid"
            className="flex items-center gap-1 text-[11px] text-white/50 bg-transparent border border-dashed border-white/15 rounded-lg px-2 py-1 hover:bg-white/10 hover:text-white/80 disabled:opacity-40"
          >
            <Plus className="w-2.5 h-2.5" />
            {name}
          </button>
        ))}
        {shownLoaded.length === 0 && shownCatalog.length === 0 && (
          <span className="text-[11px] text-white/40">No match.</span>
        )}
      </div>
      {loading && <p className="text-[10px] text-fuchsia-200/70 mt-1">Loading position…</p>}
    </div>
  );
}
