'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import {
  useSubscriptionStore,
  FREE_TRANSIT_EVENTS,
  TRANSIT_GATE_STARTS,
  isTransitGateLive,
} from '@/stores/subscriptionStore';
import Link from 'next/link';
import { ArrowLeft, Lock, Radar as RadarIcon } from 'lucide-react';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import StorylineView from '@/components/transits/StorylineView';
import RadarWheel from '@/components/transits/RadarWheel';
import RadarDetail from '@/components/transits/RadarDetail';
import RadarAreas from '@/components/transits/RadarAreas';
import { groupPeaksIntoStorylines, type TransitStoryline } from '@/lib/transitStorylines';
import {
  type RadarHit,
  type RadarResponse,
  LEVEL_COLORS,
  TIER_STYLE,
  bodyColor,
  fmtDate,
  fmtWhen,
  glyph,
  hitTitle,
} from '@/lib/radar';

type Tab = 'now' | 'upcoming' | 'storylines';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function monthKey(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function TargetGlyphs({ h }: { h: RadarHit }) {
  return (
    <>
      {h.kind === 'midpoint' ? h.target.split('/').map((n) => glyph(n)).join('/') : glyph(h.target)}
    </>
  );
}

// ─── One hit, as a card ─────────────────────────────────────────────────────

function HitCard({
  hit,
  card,
  selected,
  onHover,
  onOpen,
}: {
  hit: RadarHit;
  card: RadarResponse['cards'][string];
  selected: boolean;
  onHover: (id: string | null) => void;
  onOpen: () => void;
}) {
  const col = bodyColor(hit.body);
  const tier = hit.call ? TIER_STYLE[hit.call.tier] : null;
  return (
    <button
      onClick={onOpen}
      onMouseEnter={() => onHover(hit.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(hit.id)}
      onBlur={() => onHover(null)}
      className={`w-full text-left rounded-2xl border bg-bg-card p-4 transition-all hover:scale-[1.005] active:scale-[0.995] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary ${
        selected ? 'border-white/40' : 'border-white/10'
      }`}
      style={{ boxShadow: selected ? `0 0 0 1px ${col}66` : undefined }}
    >
      <div className="flex items-start gap-3">
        <div
          className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl"
          style={{ background: col + '1f', color: col }}
          aria-hidden
        >
          {glyph(hit.body)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-display font-bold text-text-primary leading-snug">
              {hit.milestone || hit.label ? hitTitle(hit) : (
                <>
                  {hit.body} {hit.symbol} <TargetGlyphs h={hit} /> <span className="font-normal text-text-muted">{hit.kind === 'midpoint' ? hit.target : `your ${hit.target}`}</span>
                </>
              )}
            </h3>
            {tier && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color: tier.color, background: tier.color + '22' }}>
                {tier.label}
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-0.5">{card.formula}</p>
          <p className="text-sm text-text-secondary mt-2 line-clamp-2 leading-relaxed">{card.headline}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-[11px] text-text-muted">
            <span style={{ color: col }}>{hit.intensity.level}</span>
            <span>{hit.exact ? `${fmtDate(hit.exact)} · ${fmtWhen(hit.days_to_exact)}` : 'no exact date'}</span>
            {hit.orb != null && <span>{hit.orb.toFixed(2)}&deg; orb</span>}
            {hit.areas[0] && <span>{hit.areas.slice(0, 2).join(' · ')}</span>}
          </div>
        </div>
      </div>
    </button>
  );
}

function LockedRow({ hit }: { hit: RadarHit }) {
  return (
    <Link href="/pricing" className="card flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
      <Lock className="w-5 h-5 text-accent-primary shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">
          {hit.body} {hit.symbol} {hit.kind === 'midpoint' ? hit.target : `your ${hit.target}`}
        </p>
        <p className="text-[11px] text-text-muted mt-0.5">{hit.exact ? fmtDate(hit.exact) : ''}</p>
      </div>
    </Link>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────

export default function TransitsPage() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const hasAccess = useSubscriptionStore((s) => s.hasAccess);
  const subLoading = useSubscriptionStore((s) => s.loading);
  const isFree = !subLoading && !hasAccess('transits_full');
  const gateLive = isTransitGateLive(profile?.created_at);
  const gated = isFree && gateLive;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [radar, setRadar] = useState<RadarResponse | null>(null);
  const [tab, setTab] = useState<Tab>('now');
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<RadarHit | null>(null);
  const [bigOnly, setBigOnly] = useState(false);
  const [areaKey, setAreaKey] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<'natal' | 'progressed'>('natal');

  const [storylines, setStorylines] = useState<TransitStoryline[]>([]);
  const [storylinesLoading, setStorylinesLoading] = useState(false);
  const [storylinesError, setStorylinesError] = useState<string | null>(null);
  const storylinesLoadedRef = useRef(false);
  const nowRef = useRef(new Date());

  const load = useCallback(async () => {
    if (!profile?.birth_date || !profile?.latitude) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.getRadarScan({ birth_data: buildBirthData(profile), days: 180, orb: 1.0, chart_mode: chartMode });
      setRadar(res as RadarResponse);
    } catch (err: any) {
      setError(err?.message || t('readings.transitsPage.errorDefault'));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, chartMode]);

  useEffect(() => {
    load();
  }, [load]);

  // Storylines (12-month arcs) keep their own lazy load, as before.
  useEffect(() => {
    if (tab !== 'storylines' || !profile || subLoading || gated || storylinesLoadedRef.current) return;
    let cancelled = false;
    (async () => {
      setStorylinesLoading(true);
      setStorylinesError(null);
      try {
        const birthData = buildBirthData(profile);
        const now = new Date();
        const end = new Date();
        end.setMonth(end.getMonth() + 12);
        const eventsRes = await api.getTransitEvents({
          birth_data: birthData,
          start_date: now.toISOString().split('T')[0],
          end_date: end.toISOString().split('T')[0],
        });
        if (cancelled) return;
        const raw: any[] = eventsRes?.events || [];
        setStorylines(
          groupPeaksIntoStorylines(
            raw.map((e: any) => ({
              date: e.date,
              transiting_planet: e.transiting_planet,
              natal_planet: e.natal_planet,
              aspect_type: e.aspect_type || e.aspect_name || '',
              orb: e.orb,
              is_retrograde: e.is_retrograde,
              transit_sign: e.transit_sign,
              natal_sign: e.natal_sign,
              intensity: e.intensity,
              category: e.category,
            })),
            nowRef.current,
          ),
        );
        storylinesLoadedRef.current = true;
      } catch (err: any) {
        if (!cancelled) setStorylinesError(err?.message || t('readings.transitsPage.failedToLoadStorylines'));
      } finally {
        if (!cancelled) setStorylinesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, profile, subLoading, gated]);

  const nowHits = radar?.now.hits ?? [];
  const activeId = hoverId ?? pinnedId;
  const pinned = nowHits.find((h) => h.id === pinnedId) ?? null;

  const upcoming = useMemo(() => {
    const list = radar?.upcoming ?? [];
    return bigOnly ? list.filter((h) => h.score >= 10) : list;
  }, [radar, bigOnly]);

  const upcomingByMonth = useMemo(() => {
    const groups: { month: string; items: RadarHit[] }[] = [];
    for (const h of upcoming) {
      const k = monthKey(h.exact);
      const last = groups[groups.length - 1];
      if (last && last.month === k) last.items.push(h);
      else groups.push({ month: k, items: [h] });
    }
    return groups;
  }, [upcoming]);

  // Tapping an area narrows the list to the hits that are driving it.
  const shownHits = useMemo(() => {
    if (!areaKey) return nowHits;
    const ids = new Set(radar?.now.areas?.find((a) => a.key === areaKey)?.hits ?? []);
    return ids.size ? nowHits.filter((h) => ids.has(h.id)) : nowHits;
  }, [nowHits, radar, areaKey]);

  // The boldest read worth putting at the top: the best bold call still ahead (or live).
  const headlineCall = useMemo(() => {
    const all = [...nowHits, ...(radar?.upcoming ?? [])].filter((h) => h.call && h.call.tier === 'bold');
    all.sort((a, b) => b.score - a.score);
    return all[0] ?? null;
  }, [nowHits, radar]);

  if (!profile?.birth_date || !profile?.latitude) {
    return <BirthDataPrompt message={t('readings.birthDataPromptTransits')} />;
  }

  const firstName = (profile.display_name || '').split(' ')[0] || 'Stargazer';

  if (loading || subLoading) {
    return <LoadingCosmic label={t('readings.transitsPage.loadingLabel')} />;
  }

  if (error || !radar) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <p className="text-red-400 text-sm mb-4">{error || t('readings.transitsPage.errorDefault')}</p>
        <button onClick={load} className="btn-primary">
          {t('common.retry')}
        </button>
      </div>
    );
  }

  const v = radar.now.verdict;
  const lvlColor = LEVEL_COLORS[v.level] || '#6B7280';
  const openHit = (h: RadarHit, indexInList: number, locked: boolean) => {
    if (locked) return;
    setDetail(h);
    void indexInList;
  };
  const isLocked = (index: number) => gated && index >= FREE_TRANSIT_EVENTS;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'now', label: t('readings.transitsPage.radarNow', { defaultValue: 'Right now' }) },
    { id: 'upcoming', label: t('readings.transitsPage.radarUpcoming', { defaultValue: 'Coming up' }) },
    { id: 'storylines', label: t('readings.transitsPage.storylines') },
  ];

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" />
        {t('readings.backToReadings')}
      </Link>

      <h1 className="text-2xl font-display font-bold text-text-primary mt-2 flex items-center gap-2">
        <RadarIcon className="w-6 h-6 text-accent-primary" />
        {t('readings.transitsPage.radarTitle', { defaultValue: 'Transit Radar' })}
      </h1>
      <p className="text-text-muted text-sm mb-5 leading-relaxed">
        {t('readings.transitsPage.radarSubtitle', {
          name: firstName,
          defaultValue:
            '{{name}}, this is what the sky is touching in your chart, the exact dates it perfects, and what it can bring. Bold reads, with dates you can check.',
        })}
      </p>

      <div className="flex bg-bg-card rounded-full p-1 mb-6">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition-colors ${
              tab === tb.id ? 'bg-accent-primary text-white shadow-sm' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {tab !== 'storylines' && (
        <div className="mb-5">
          <div className="inline-flex bg-bg-card rounded-full p-1" role="group" aria-label="Which chart to measure against">
            {(['natal', 'progressed'] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setAreaKey(null);
                  setPinnedId(null);
                  setChartMode(m);
                }}
                aria-pressed={chartMode === m}
                className={`py-1.5 px-4 rounded-full text-xs font-medium transition-colors ${
                  chartMode === m ? 'bg-white/15 text-text-primary' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {m === 'natal' ? 'Natal chart' : 'Progressed chart'}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-text-muted mt-2 leading-relaxed">
            {chartMode === 'natal'
              ? 'Transits against the chart you were born with: who you are.'
              : 'Transits against your progressed chart: the you that is forming now, and what is changing in you.'}
          </p>
        </div>
      )}

      {isFree && !gateLive && (
        <div className="card mb-5 border border-accent-muted text-sm text-text-secondary">
          {t('readings.transitsPage.gateHeadsUp', {
            defaultValue:
              'Heads up: from {{date}}, free accounts see one cycle in full. Upgrade to keep every cycle, reading and Storyline.',
            date: TRANSIT_GATE_STARTS.toLocaleDateString('en-GB'),
          })}{' '}
          <Link href="/pricing" className="text-accent-primary font-semibold">
            {t('readings.transitsPage.seePlans', { defaultValue: 'See plans' })}
          </Link>
        </div>
      )}

      {/* ── Storylines ── */}
      {tab === 'storylines' && gated && (
        <div className="card text-center py-12">
          <Lock className="w-7 h-7 text-accent-primary mx-auto mb-3" />
          <h2 className="text-lg font-display font-bold text-text-primary mb-2">
            {t('readings.transitsPage.storylinesLockedTitle', { defaultValue: 'See the next 12 months' })}
          </h2>
          <p className="text-text-muted text-sm mb-5">
            {t('readings.transitsPage.storylinesLockedBody', {
              defaultValue: 'Storylines map every major cycle arc ahead of you, with exact dates.',
            })}
          </p>
          <Link href="/pricing" className="btn-primary inline-flex px-8">
            {t('readings.transitsPage.unlockButton', { defaultValue: 'Unlock all cycles' })}
          </Link>
        </div>
      )}
      {tab === 'storylines' && !gated && (
        <StorylineView storylines={storylines} loading={storylinesLoading} error={storylinesError} now={nowRef.current} />
      )}

      {/* ── Right now ── */}
      {tab === 'now' && (
        <>
          {/* verdict */}
          <div className="rounded-2xl border border-white/10 bg-bg-card p-5 mb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: lvlColor }} />
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: lvlColor }}>
                {v.level === 'QUIET' ? 'A quiet sky' : `${v.level.charAt(0)}${v.level.slice(1).toLowerCase()} sky`}
              </span>
              <span className="text-[11px] text-text-muted ml-auto">{fmtDate(radar.meta.as_of)}</span>
            </div>
            <h2 className="text-lg font-display font-bold text-text-primary leading-snug">{v.headline}</h2>
            <p className="text-sm text-text-secondary mt-1 leading-relaxed">{v.line}</p>
            {v.areas.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="text-[11px] text-text-muted mr-1 self-center">Where the pressure is:</span>
                {v.areas.map((a) => (
                  <span key={a.key} className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-text-secondary">
                    {a.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* wheel */}
          <div className="rounded-2xl border border-white/10 bg-bg-card p-3 mb-5">
            <div className="flex justify-center">
              <RadarWheel
                asc={radar.natal.asc}
                cusps={radar.natal.cusps}
                natal={radar.natal.points}
                sky={radar.sky}
                hits={nowHits}
                selectedId={activeId}
                onSelect={(id) => setPinnedId((p) => (p === id ? null : id))}
              />
            </div>
            <p className="text-[11px] text-text-muted text-center mt-1">
              Outer ring: today&apos;s sky. Inner ring: you. Diamonds: the midpoints being touched. Tap one.
            </p>
            {pinned && (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{hitTitle(pinned)}</p>
                  <p className="text-[11px] text-text-muted truncate">{radar.cards[pinned.card]?.formula}</p>
                </div>
                {isLocked(nowHits.indexOf(pinned)) ? (
                  <Link href="/pricing" className="btn-primary px-4 py-1.5 text-xs shrink-0">Unlock</Link>
                ) : (
                  <button onClick={() => setDetail(pinned)} className="btn-primary px-4 py-1.5 text-xs shrink-0">
                    Read it
                  </button>
                )}
              </div>
            )}
          </div>

          <RadarAreas
            areas={radar.now.areas ?? []}
            activeKey={areaKey}
            onPick={setAreaKey}
            onOpenHit={(id) => {
              const i = nowHits.findIndex((h) => h.id === id);
              if (i >= 0 && !isLocked(i)) setDetail(nowHits[i]);
            }}
          />

          {/* the boldest read */}
          {headlineCall && !gated && headlineCall.call && (
            <button
              onClick={() => setDetail(headlineCall)}
              className="w-full text-left rounded-2xl p-4 mb-5 border"
              style={{ borderColor: TIER_STYLE.bold.color + '66', background: TIER_STYLE.bold.color + '12' }}
            >
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: TIER_STYLE.bold.color }}>
                Your boldest read right now
              </p>
              <p className="text-sm text-text-primary leading-relaxed">{headlineCall.call.text}</p>
              <p className="text-[11px] text-text-muted mt-2">{hitTitle(headlineCall)} &middot; tap for the full reading &rarr;</p>
            </button>
          )}

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              {t('readings.transitsPage.impactingYouNow')}
            </span>
            <span className="text-[11px] text-text-muted">({shownHits.length})</span>
            {areaKey && (
              <button onClick={() => setAreaKey(null)} className="text-[11px] text-accent-primary ml-auto">
                Show all
              </button>
            )}
          </div>

          {nowHits.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-text-muted text-sm">{t('readings.transitsPage.emptyState')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shownHits.map((h, i) =>
                isLocked(i) ? (
                  <LockedRow key={h.id} hit={h} />
                ) : (
                  <HitCard
                    key={h.id}
                    hit={h}
                    card={radar.cards[h.card]}
                    selected={activeId === h.id}
                    onHover={setHoverId}
                    onOpen={() => openHit(h, i, false)}
                  />
                ),
              )}
              {gated && nowHits.length > FREE_TRANSIT_EVENTS && (
                <div className="card text-center py-6">
                  <p className="text-sm font-semibold text-text-primary mb-1">
                    {t('readings.transitsPage.moreCycles', {
                      defaultValue: '{{count}} more cycles are influencing you right now',
                      count: nowHits.length - FREE_TRANSIT_EVENTS,
                    })}
                  </p>
                  <p className="text-xs text-text-muted mb-4">
                    {t('readings.transitsPage.moreCyclesBody', {
                      defaultValue: 'Unlock the full reading, advice and timing for every one.',
                    })}
                  </p>
                  <Link href="/pricing" className="btn-primary inline-flex px-8">
                    {t('readings.transitsPage.unlockButton', { defaultValue: 'Unlock all cycles' })}
                  </Link>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Coming up ── */}
      {tab === 'upcoming' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-text-muted">
              Exact dates for the next {radar.meta.days} days, heaviest first by weight, shown in date order.
            </p>
            <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer shrink-0">
              <input type="checkbox" checked={bigOnly} onChange={(e) => setBigOnly(e.target.checked)} />
              Big moments only
            </label>
          </div>

          {upcomingByMonth.length === 0 && (
            <div className="card text-center py-12">
              <p className="text-text-muted text-sm">Nothing that heavy is coming. Use the quiet.</p>
            </div>
          )}

          {upcomingByMonth.map((g) => (
            <div key={g.month} className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">{g.month}</h3>
              <div className="space-y-2">
                {g.items.map((h) => {
                  const globalIdx = (radar.upcoming ?? []).indexOf(h);
                  const locked = gated && globalIdx >= 2;
                  const col = bodyColor(h.body);
                  const tier = h.call ? TIER_STYLE[h.call.tier] : null;
                  const inner = (
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 w-14 text-center">
                        <p className="text-sm font-bold text-text-primary leading-none">{fmtDate(h.exact).slice(0, 2)}</p>
                        <p className="text-[10px] text-text-muted mt-1">{fmtWhen(h.days_to_exact)}</p>
                      </div>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ background: col + '1f', color: col }}>
                        {glyph(h.body)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-text-primary truncate">
                          {hitTitle(h)}
                          {h.pass && h.pass[1] > 1 && <span className="text-text-muted font-normal"> &middot; pass {h.pass[0]}/{h.pass[1]}</span>}
                        </p>
                        <p className="text-[11px] text-text-muted truncate">
                          {locked ? 'Unlock to read' : radar.cards[h.card]?.formula}
                        </p>
                      </div>
                      {locked ? (
                        <Lock className="w-4 h-4 text-accent-primary shrink-0" />
                      ) : (
                        tier && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0" style={{ color: tier.color, background: tier.color + '22' }}>
                            {tier.label}
                          </span>
                        )
                      )}
                    </div>
                  );
                  return locked ? (
                    <Link key={h.id} href="/pricing" className="block rounded-xl border border-white/10 bg-bg-card px-3 py-2.5 opacity-70 hover:opacity-100">
                      {inner}
                    </Link>
                  ) : (
                    <button
                      key={h.id}
                      onClick={() => setDetail(h)}
                      className="w-full text-left rounded-xl border border-white/10 bg-bg-card px-3 py-2.5 hover:border-white/25 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                    >
                      {inner}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}

      {detail && radar.cards[detail.card] && (
        <RadarDetail
          hit={detail}
          card={radar.cards[detail.card]}
          onClose={() => setDetail(null)}
          asOf={radar.meta.as_of}
          birthData={buildBirthData(profile)}
          chartMode={radar.meta.chart_mode ?? 'natal'}
          canAI={hasAccess('transit_reading')}
        />
      )}
    </div>
  );
}
