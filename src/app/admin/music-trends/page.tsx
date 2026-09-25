'use client';

// Music Trends — which library songs people put on their photo posts and
// stories, and which are going viral.
//
// • Uses = a post or story published with the song (logged by DB triggers).
// • Listeners / plays = people who heard it in the feed or a story.
// • Change = uses this period vs the period before it.
//
// Data: admin_music_trends() + admin_music_daily() in
// supabase-migration-multi-image-music.sql (both check is_admin server-side).

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Flame, TrendingUp, Music2, X } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { createClient } from '@/lib/supabase';
import { KpiChart, type KpiPoint } from '@/components/admin/KpiChart';
import { AccessDenied, Loading, Card, Stat, StatGrid, MigrationNotice, fmt } from '../analytics/_shared';

type Range = 7 | 30 | 90 | 0;

interface TrendRow {
  track_id: string;
  name: string;
  category: string | null;
  mood: string | null;
  is_active: boolean;
  uses: number;
  uses_prev: number;
  post_uses: number;
  story_uses: number;
  creators: number;
  listeners: number;
  plays: number;
  uses_all_time: number;
  first_used_at: string | null;
  last_used_at: string | null;
}

interface DayRow { day: string; uses: number; plays: number; listeners: number }

const MIGRATION = 'supabase-migration-multi-image-music.sql';

/** DD-MM-YYYY */
function dmy(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return d && m && y ? `${d}-${m}-${y}` : iso;
}

/** % change, or null when there's nothing to compare against. */
function growth(now: number, prev: number): number | null {
  if (!prev) return now > 0 ? null : 0;
  return Math.round(((now - prev) / prev) * 100);
}

type Badge = 'viral' | 'rising' | 'new' | null;

function badgeFor(r: TrendRow, range: Range): Badge {
  if (range === 0 || r.uses === 0) return null;
  if (r.uses >= 5 && r.uses >= r.uses_prev * 2) return 'viral';
  if (r.uses_prev === 0 && r.uses > 0) return 'new';
  const g = growth(r.uses, r.uses_prev);
  if (g != null && g >= 50) return 'rising';
  return null;
}

function BadgeChip({ b }: { b: Badge }) {
  if (!b) return null;
  const cls = {
    viral: 'bg-orange-500/15 text-orange-400',
    rising: 'bg-emerald-500/15 text-emerald-400',
    new: 'bg-sky-500/15 text-sky-400',
  }[b];
  const label = { viral: '🔥 Viral', rising: '📈 Rising', new: '✨ New' }[b];
  return <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${cls}`}>{label}</span>;
}

function isMissingFn(msg: string | undefined): boolean {
  return !!msg && /does not exist|could not find the function|schema cache/i.test(msg);
}

export default function MusicTrendsPage() {
  const { profile } = useAuthStore();
  const [verified, setVerified] = useState<boolean | null>(null);
  const [range, setRange] = useState<Range>(7);
  const [rows, setRows] = useState<TrendRow[] | null>(null);
  const [daily, setDaily] = useState<DayRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<TrendRow | null>(null);
  const [trackDaily, setTrackDaily] = useState<DayRow[] | null>(null);

  useEffect(() => {
    (async () => {
      if (!profile) return;
      if (!profile.is_admin) { setVerified(false); return; }
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setVerified(false); return; }
      const { data: row } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
      setVerified(!!row?.is_admin);
    })();
  }, [profile]);

  const chartDays = range === 0 ? 90 : Math.max(range, 14);

  const load = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    const supabase = createClient();
    const [trends, days] = await Promise.all([
      supabase.rpc('admin_music_trends', { p_days: range }),
      supabase.rpc('admin_music_daily', { p_track_id: null, p_days: chartDays }),
    ]);
    const err = trends.error || days.error;
    if (err) {
      if (isMissingFn(err.message)) setMissing(true);
      else setError(err.message);
      setRows([]);
    } else {
      setMissing(false);
      setRows(((trends.data as any[]) || []).map((r) => ({
        ...r,
        uses: Number(r.uses), uses_prev: Number(r.uses_prev), post_uses: Number(r.post_uses),
        story_uses: Number(r.story_uses), creators: Number(r.creators), listeners: Number(r.listeners),
        plays: Number(r.plays), uses_all_time: Number(r.uses_all_time),
      })));
      setDaily(((days.data as any[]) || []).map((d) => ({
        day: d.day, uses: Number(d.uses), plays: Number(d.plays), listeners: Number(d.listeners),
      })));
    }
    setRefreshing(false);
  }, [range, chartDays]);

  useEffect(() => { if (verified) load(); }, [verified, load]);

  // Per-song chart when a row is opened.
  useEffect(() => {
    if (!selected) { setTrackDaily(null); return; }
    let cancelled = false;
    setTrackDaily(null);
    createClient()
      .rpc('admin_music_daily', { p_track_id: selected.track_id, p_days: chartDays })
      .then(({ data }) => {
        if (cancelled) return;
        setTrackDaily(((data as any[]) || []).map((d) => ({
          day: d.day, uses: Number(d.uses), plays: Number(d.plays), listeners: Number(d.listeners),
        })));
      });
    return () => { cancelled = true; };
  }, [selected, chartDays]);

  const ranked = useMemo(() => {
    if (!rows) return [];
    const key = range === 0 ? 'uses_all_time' : 'uses';
    return [...rows].sort((a, b) =>
      (b[key] - a[key]) || (b.listeners - a.listeners) || (b.plays - a.plays) || a.name.localeCompare(b.name));
  }, [rows, range]);

  const totals = useMemo(() => {
    const r = rows || [];
    const sum = (k: keyof TrendRow) => r.reduce((a, x) => a + (Number(x[k]) || 0), 0);
    return {
      uses: range === 0 ? sum('uses_all_time') : sum('uses'),
      prev: sum('uses_prev'),
      posts: sum('post_uses'),
      stories: sum('story_uses'),
      plays: sum('plays'),
      songsUsed: r.filter((x) => (range === 0 ? x.uses_all_time : x.uses) > 0).length,
      viral: r.filter((x) => badgeFor(x, range) === 'viral').length,
    };
  }, [rows, range]);

  if (verified === false) return <AccessDenied />;
  if (verified === null || rows === null) return <Loading />;

  const usesPts: KpiPoint[] = daily.map((d) => ({ date: d.day, value: d.uses }));
  const playsPts: KpiPoint[] = daily.map((d) => ({ date: d.day, value: d.plays }));
  const listenersPts: KpiPoint[] = daily.map((d) => ({ date: d.day, value: d.listeners }));
  const top = ranked[0];
  const rangeLabel = range === 0 ? 'all time' : `last ${range} days`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 rounded-lg hover:bg-bg-tertiary text-text-muted"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-xl font-bold text-text-primary flex items-center gap-2"><Music2 className="w-5 h-5 text-accent-primary" /> Music Trends</h1>
            <p className="text-xs text-text-muted">Songs from the music library used on photo posts and stories · {rangeLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-bg-tertiary p-0.5">
            {([7, 30, 90, 0] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium ${range === r ? 'bg-bg-card text-text-primary shadow-sm' : 'text-text-muted'}`}
              >
                {r === 0 ? 'All' : `${r}d`}
              </button>
            ))}
          </div>
          <button onClick={load} disabled={refreshing} className="p-2 rounded-lg hover:bg-bg-tertiary text-text-muted" aria-label="Refresh">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <Link href="/admin/audio" className="px-3 py-1.5 rounded-lg border border-border-primary text-xs text-text-secondary hover:text-text-primary">Audio Library</Link>
        </div>
      </div>

      {missing && <MigrationNotice file={MIGRATION} />}
      {error && <p className="text-sm text-red-400">{error}</p>}

      <StatGrid>
        <Stat label="Uses" value={fmt(totals.uses)} sub={range === 0 ? 'posts + stories' : `${growth(totals.uses, totals.prev) ?? '—'}% vs previous ${range}d`} tone="accent" />
        <Stat label="Posts / stories" value={`${fmt(totals.posts)} / ${fmt(totals.stories)}`} sub={range === 0 ? 'in the selected window' : rangeLabel} />
        <Stat label="Songs in use" value={fmt(totals.songsUsed)} sub={`of ${fmt(rows.length)} in the library`} />
        <Stat label="Top song" value={top && (range === 0 ? top.uses_all_time : top.uses) > 0 ? top.name : '—'} sub={totals.viral ? `${totals.viral} viral right now` : 'no viral songs yet'} tone={totals.viral ? 'warn' : 'default'} />
      </StatGrid>

      <div className="grid md:grid-cols-3 gap-3">
        <KpiChart title="Songs used per day" valueLabel="total" value={fmt(usesPts.reduce((a, p) => a + p.value, 0))} points={usesPts} />
        <KpiChart title="Plays per day" valueLabel="total" value={fmt(playsPts.reduce((a, p) => a + p.value, 0))} points={playsPts} />
        <KpiChart title="Listeners per day" valueLabel="average" points={listenersPts} />
      </div>

      <Card title="Song leaderboard" hint={`Ranked by uses (${rangeLabel}). 🔥 Viral = 5+ uses and at least double the previous period. Tap a song for its daily chart.`}>
        {ranked.length === 0 ? (
          <p className="text-sm text-text-muted py-6 text-center">No songs in the library yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-4">
            <table className="w-full text-sm min-w-[860px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-text-muted border-b border-border-primary">
                  <th className="px-4 py-2 w-10">#</th>
                  <th className="px-2 py-2">Song</th>
                  <th className="px-2 py-2 text-right">Uses</th>
                  {range !== 0 && <th className="px-2 py-2 text-right">Change</th>}
                  <th className="px-2 py-2 text-right">Posts</th>
                  <th className="px-2 py-2 text-right">Stories</th>
                  <th className="px-2 py-2 text-right">Creators</th>
                  <th className="px-2 py-2 text-right">Listeners</th>
                  <th className="px-2 py-2 text-right">Plays</th>
                  <th className="px-2 py-2 text-right">All-time</th>
                  <th className="px-4 py-2 text-right">Last used</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((r, i) => {
                  const g = growth(r.uses, r.uses_prev);
                  const b = badgeFor(r, range);
                  return (
                    <tr
                      key={r.track_id}
                      onClick={() => setSelected(r)}
                      className="border-b border-border-primary/50 hover:bg-bg-tertiary cursor-pointer"
                    >
                      <td className="px-4 py-2 text-text-muted tabular-nums">{i + 1}</td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-text-primary">{r.name}</span>
                          <BadgeChip b={b} />
                          {!r.is_active && <span className="text-[10px] text-text-muted">(hidden)</span>}
                        </div>
                        <div className="text-[11px] text-text-muted">{[r.category, r.mood].filter(Boolean).join(' · ') || '—'}</div>
                      </td>
                      <td className="px-2 py-2 text-right font-semibold tabular-nums">{fmt(range === 0 ? r.uses_all_time : r.uses)}</td>
                      {range !== 0 && (
                        <td className={`px-2 py-2 text-right tabular-nums ${g == null ? 'text-sky-400' : g > 0 ? 'text-emerald-400' : g < 0 ? 'text-red-400' : 'text-text-muted'}`}>
                          {g == null ? 'new' : `${g > 0 ? '+' : ''}${g}%`}
                        </td>
                      )}
                      <td className="px-2 py-2 text-right tabular-nums">{fmt(r.post_uses)}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{fmt(r.story_uses)}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{fmt(r.creators)}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{fmt(r.listeners)}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{fmt(r.plays)}</td>
                      <td className="px-2 py-2 text-right tabular-nums text-text-muted">{fmt(r.uses_all_time)}</td>
                      <td className="px-4 py-2 text-right text-text-muted whitespace-nowrap">{dmy(r.last_used_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-2xl rounded-2xl border border-border-primary bg-bg-secondary p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  {badgeFor(selected, range) === 'viral' ? <Flame className="w-5 h-5 text-orange-400" /> : <TrendingUp className="w-5 h-5 text-accent-primary" />}
                  {selected.name}
                </h2>
                <p className="text-xs text-text-muted">
                  {[selected.category, selected.mood].filter(Boolean).join(' · ') || '—'} · first used {dmy(selected.first_used_at)} · last used {dmy(selected.last_used_at)}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 text-text-muted hover:text-text-primary" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <StatGrid>
              <Stat label={`Uses (${range === 0 ? 'all' : `${range}d`})`} value={fmt(range === 0 ? selected.uses_all_time : selected.uses)} tone="accent" />
              <Stat label="Creators" value={fmt(selected.creators)} />
              <Stat label="Listeners" value={fmt(selected.listeners)} />
              <Stat label="Plays" value={fmt(selected.plays)} />
            </StatGrid>
            {trackDaily === null ? (
              <Loading />
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                <KpiChart title="Uses per day" valueLabel="total" value={fmt(trackDaily.reduce((a, d) => a + d.uses, 0))} points={trackDaily.map((d) => ({ date: d.day, value: d.uses }))} />
                <KpiChart title="Plays per day" valueLabel="total" value={fmt(trackDaily.reduce((a, d) => a + d.plays, 0))} points={trackDaily.map((d) => ({ date: d.day, value: d.plays }))} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
