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
import { Globe2, X, Settings, CalendarDays, MessageCircle, Sparkles, Orbit, Lock } from 'lucide-react';
import ZodiGlobe from '@/components/zodisphere/ZodiGlobe';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { getMyAcgLines, type AcgGlobeLine } from '@/lib/zodisphereAcg';
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

      {/* ── Globe ── */}
      <div className="absolute inset-0">
        <ZodiGlobe
          areas={areas}
          onAreaClick={handleAreaClick}
          autoRotate={!selected}
          myPlace={myPlace}
          acgLines={showAcg ? acgLines : []}
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
