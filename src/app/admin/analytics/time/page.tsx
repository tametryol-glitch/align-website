'use client';

// Time in app — how long each member spends on Align, to the second.
//
// • Look up any member by username → today / week / month / all-time, daily,
//   weekly and monthly history, and the sections they stay in longest.
// • Leaderboard of your most engaged members (click a row to drill in).
// • Demographics: time by age, gender, plan, sun sign, country and platform.
//
// Time is only counted while the app is in the foreground (web: tab visible and
// the visitor active in the last 3 minutes, or a video playing), and is only
// credited to verified logged-in members.

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { createClient } from '@/lib/supabase';
import { ArrowLeft, RefreshCw, Search, X, Crown } from 'lucide-react';
import {
  AnalyticsTabs, AccessDenied, Loading, Card, Stat, StatGrid, Table, MigrationNotice, fmt,
} from '../_shared';

// ── Types ────────────────────────────────────────────────────────────────────

type Range = 7 | 30 | 90 | 0;
interface Bucket { label: string; ms: number; users: number }
interface Overview {
  total_ms?: number; members?: number; avg_ms?: number; median_ms?: number;
  sections?: { section: string; ms: number; users: number }[];
  platforms?: Bucket[];
  daily?: { day: string; ms: number; users: number }[];
  age?: Bucket[]; gender?: Bucket[]; tier?: Bucket[]; sun_sign?: Bucket[]; country?: Bucket[];
}
interface LeaderRow {
  user_id: string; username: string | null; display_name: string | null; avatar_url: string | null;
  tier: string | null; total_ms: number; active_days: number; top_section: string | null;
  top_platform: string | null; last_day: string | null;
}
interface Member {
  id: string; username: string | null; display_name: string | null; avatar_url: string | null;
  created_at?: string | null; birth_date?: string | null; gender?: string | null; gender_identity?: string | null;
  sun_sign?: string | null; moon_sign?: string | null; rising_sign?: string | null;
  subscription_tier?: string | null; is_subscribed?: boolean | null;
}
interface MemberTime {
  today_ms?: number; yesterday_ms?: number; last7_ms?: number; last30_ms?: number; last90_ms?: number;
  this_week_ms?: number; this_month_ms?: number; total_ms?: number; active_days?: number;
  first_day?: string | null; last_day?: string | null; last_seen_at?: string | null;
  sessions_30d?: number; country?: string | null;
  daily?: { day: string; ms: number }[];
  weekly?: { week: string; ms: number; days: number }[];
  monthly?: { month: string; ms: number; days: number }[];
  sections_all?: { section: string; ms: number; days: number }[];
  sections_30d?: { section: string; ms: number; days: number }[];
  platforms?: { label: string; ms: number }[];
}

// ── Formatting ───────────────────────────────────────────────────────────────

/** 9h 03m 15s — always to the second. */
function hms(ms: number | null | undefined): string {
  if (ms == null) return '—';
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  if (h > 0) return `${h.toLocaleString()}h ${pad(m)}m ${pad(s)}s`;
  if (m > 0) return `${m}m ${pad(s)}s`;
  return `${s}s`;
}

/** DD-MM-YYYY */
function ddmmyyyy(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return d && m && y ? `${d}-${m}-${y}` : iso;
}

function ago(iso: string | null | undefined): string {
  if (!iso) return '—';
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const SECTION_NAMES: Record<string, string> = {
  home: 'Home', feed: 'Cosmic Feed', reels: 'Reels', chat: 'Chat', messages: 'Messages',
  ai: 'AI Astrologer', 'placement-pages': 'Placement pages', 'user-profile': 'Member profiles',
  user: 'Member profiles', profile: 'Own profile', chart: 'Birth chart', other: 'Other',
  'world-echo': 'World Echo', zodisphere: 'Zodisphere', 'build-a-match': 'Build-A-Match',
};

function sectionName(key: string | null | undefined): string {
  if (!key) return '—';
  if (SECTION_NAMES[key]) return SECTION_NAMES[key];
  const words = (s: string) => s.split('-').map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w)).join(' ');
  return key.split('/').map(words).join(' › ');
}

function countryName(cc: string | null | undefined): string {
  if (!cc || cc === 'ZZ') return 'Unknown';
  try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(cc) || cc; } catch { return cc; }
}

function ageBand(birth: string | null | undefined): string {
  if (!birth) return 'Not set';
  const b = new Date(birth);
  if (isNaN(b.getTime())) return 'Not set';
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) a--;
  return `${a}`;
}

const PLATFORM: Record<string, string> = { web: 'Web', ios: 'iPhone', android: 'Android' };

// ── Pieces ───────────────────────────────────────────────────────────────────

function Avatar({ url, name, size = 28 }: { url: string | null | undefined; name: string; size?: number }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" width={size} height={size} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />
  ) : (
    <span
      className="rounded-full bg-accent-primary/20 text-accent-primary flex items-center justify-center text-[11px] font-bold flex-shrink-0"
      style={{ width: size, height: size }}
    >
      {(name || '?').slice(0, 1).toUpperCase()}
    </span>
  );
}

/** One-series bar chart. Hover a bar for the exact time. */
function Bars({ points, height = 120 }: { points: { key: string; label: string; ms: number; sub?: string }[]; height?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  if (!points.length) return <p className="text-xs text-text-muted py-6 text-center">No time recorded yet.</p>;
  const max = Math.max(...points.map((p) => p.ms), 1);
  const h = hover != null ? points[hover] : null;
  return (
    <div>
      <div className="h-5 text-[11px] text-text-muted tabular-nums">
        {h ? <><span className="text-text-primary font-semibold">{hms(h.ms)}</span> · {h.label}{h.sub ? ` · ${h.sub}` : ''}</> : 'Hover a bar for the exact time'}
      </div>
      <div className="flex items-end gap-[2px] border-b border-border-primary" style={{ height }} onMouseLeave={() => setHover(null)}>
        {points.map((p, i) => (
          <div
            key={p.key}
            className="flex-1 h-full flex items-end cursor-default"
            onMouseEnter={() => setHover(i)}
            title={`${p.label}: ${hms(p.ms)}`}
          >
            <div
              className={`w-full rounded-t-[4px] transition-colors ${hover === i ? 'bg-accent-primary' : 'bg-accent-primary/60'}`}
              style={{ height: p.ms > 0 ? `${Math.max(2, (p.ms / max) * 100)}%` : 0 }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-text-muted mt-1">
        <span>{points[0].label}</span>
        <span>{points[points.length - 1].label}</span>
      </div>
    </div>
  );
}

/** Horizontal bar with the time to the second and members / share. */
function TimeRow({ label, ms, max, right }: { label: React.ReactNode; ms: number; max: number; right?: string }) {
  const w = max > 0 ? Math.max(2, Math.round((ms / max) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs gap-2">
        <span className="text-text-primary truncate min-w-0">{label}</span>
        <span className="text-text-primary tabular-nums flex-shrink-0">
          {hms(ms)}{right && <span className="text-text-muted ml-1.5">{right}</span>}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-bg-primary overflow-hidden">
        <div className="h-full bg-accent-primary/70 rounded-full" style={{ width: `${w}%` }} />
      </div>
    </div>
  );
}

function Breakdown({ title, hint, rows, labelFor }: { title: string; hint?: string; rows?: Bucket[]; labelFor?: (l: string) => string }) {
  const list = rows || [];
  const max = Math.max(...list.map((r) => r.ms), 0);
  return (
    <Card title={title} hint={hint}>
      {list.length ? (
        <div className="space-y-2.5">
          {list.map((r) => (
            <TimeRow
              key={r.label}
              label={labelFor ? labelFor(r.label) : r.label}
              ms={r.ms}
              max={max}
              right={`${fmt(r.users)} · avg ${hms(r.users ? r.ms / r.users : 0)}`}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-text-muted py-4 text-center">No time recorded yet.</p>
      )}
    </Card>
  );
}

// ── Member drill-down ────────────────────────────────────────────────────────

function MemberPanel({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [data, setData] = useState<{ profile?: Member; time?: MemberTime; error?: string; needsMigration?: string } | null>(null);
  const [scope, setScope] = useState<'30d' | 'all'>('30d');

  useEffect(() => {
    setData(null);
    fetch(`/api/admin/analytics/time?user=${userId}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ error: 'Could not load this member.' }));
  }, [userId]);

  if (!data) return <Card><Loading /></Card>;
  if (data.needsMigration) return <MigrationNotice file={data.needsMigration} />;
  if (data.error || !data.profile) return <Card><p className="text-xs text-red-400">{data.error || 'Member not found.'}</p></Card>;

  const p = data.profile;
  const t = data.time || {};
  const name = p.display_name || p.username || 'Member';
  const avgPerDay = t.active_days ? (t.total_ms || 0) / t.active_days : 0;

  // Last 60 days, gaps filled with zero so the rhythm is honest.
  const byDay = new Map((t.daily || []).map((d) => [d.day, d.ms]));
  const daily = Array.from({ length: 60 }, (_, i) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - (59 - i));
    const key = d.toISOString().slice(0, 10);
    return { key, label: ddmmyyyy(key), ms: byDay.get(key) || 0 };
  });
  const weekly = (t.weekly || []).map((w) => ({ key: w.week, label: `Week of ${ddmmyyyy(w.week)}`, ms: w.ms, sub: `${w.days} active day${w.days === 1 ? '' : 's'}` }));
  const monthly = (t.monthly || []).map((m) => ({
    key: m.month,
    label: new Date(m.month + 'T00:00:00Z').toLocaleDateString('en', { month: 'short', year: 'numeric', timeZone: 'UTC' }),
    ms: m.ms,
    sub: `${m.days} active day${m.days === 1 ? '' : 's'}`,
  }));
  const sections = (scope === '30d' ? t.sections_30d : t.sections_all) || [];
  const secMax = Math.max(...sections.map((s) => s.ms), 0);
  const secTotal = sections.reduce((a, s) => a + s.ms, 0);
  const gender = p.gender_identity || p.gender;

  return (
    <div className="rounded-xl border border-accent-primary/40 bg-bg-secondary p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar url={p.avatar_url} name={name} size={44} />
          <div className="min-w-0">
            <div className="text-base font-bold text-text-primary truncate">{name}</div>
            <div className="text-xs text-text-muted truncate">
              {p.username ? `@${p.username}` : 'no username'} · {p.subscription_tier || (p.is_subscribed ? 'paid' : 'free')}
              {' · '}age {ageBand(p.birth_date)}{gender ? ` · ${gender}` : ''}
              {p.sun_sign ? ` · ${p.sun_sign} sun` : ''} · {countryName(t.country)}
            </div>
            <div className="text-[11px] text-text-muted">
              Member since {ddmmyyyy(p.created_at)} · last seen {ago(t.last_seen_at)} · {fmt(t.sessions_30d)} sessions in 30 days
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg border border-border-primary text-text-muted hover:text-text-primary" aria-label="Close">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <StatGrid>
        <Stat label="Today" value={hms(t.today_ms)} tone="accent" />
        <Stat label="Yesterday" value={hms(t.yesterday_ms)} />
        <Stat label="This week" value={hms(t.this_week_ms)} sub="since Monday" />
        <Stat label="This month" value={hms(t.this_month_ms)} />
        <Stat label="Last 7 days" value={hms(t.last7_ms)} />
        <Stat label="Last 30 days" value={hms(t.last30_ms)} />
        <Stat label="Last 90 days" value={hms(t.last90_ms)} />
        <Stat label="All time" value={hms(t.total_ms)} tone="good" sub={`since ${ddmmyyyy(t.first_day)}`} />
        <Stat label="Active days" value={fmt(t.active_days)} />
        <Stat label="Avg per active day" value={hms(avgPerDay)} />
        <Stat label="Last active day" value={ddmmyyyy(t.last_day)} />
        <Stat label="Platforms" value={(t.platforms || []).map((x) => PLATFORM[x.label] || x.label).join(' · ') || '—'} />
      </StatGrid>

      <Card title="Daily — last 60 days" hint="UTC days. Hover a bar for the exact time.">
        <Bars points={daily} />
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Weekly — last 12 weeks" hint="Weeks start Monday.">
          <Bars points={weekly} height={100} />
        </Card>
        <Card title="Monthly — all time">
          <Bars points={monthly} height={100} />
        </Card>
      </div>

      <Card title="Where they spend their time" hint="Sections ranked by time. Share = part of their total in this window.">
        <div className="flex gap-1 mb-3">
          {(['30d', 'all'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium ${scope === s ? 'bg-accent-primary/15 text-accent-primary border border-accent-primary/30' : 'text-text-muted border border-border-primary'}`}
            >
              {s === '30d' ? 'Last 30 days' : 'All time'}
            </button>
          ))}
        </div>
        {sections.length ? (
          <div className="space-y-2.5">
            {sections.map((s) => (
              <TimeRow
                key={s.section}
                label={sectionName(s.section)}
                ms={s.ms}
                max={secMax}
                right={`${secTotal ? Math.round((s.ms / secTotal) * 100) : 0}% · ${s.days}d`}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-muted py-4 text-center">No time recorded in this window.</p>
        )}
      </Card>
    </div>
  );
}

// ── Member lookup ────────────────────────────────────────────────────────────

function MemberSearch({ onPick }: { onPick: (id: string) => void }) {
  const [q, setQ] = useState('');
  const [matches, setMatches] = useState<Member[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const term = q.trim();
    if (term.replace(/^@/, '').length < 2) { setMatches([]); return; }
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/admin/analytics/time?q=${encodeURIComponent(term)}`);
        const j = await r.json();
        setMatches(j.matches || []);
        setOpen(true);
      } catch { /* keep previous */ }
    }, 250);
  }, [q]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-border-primary bg-bg-secondary px-3 py-2.5">
        <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => matches.length && setOpen(true)}
          onKeyDown={(e) => { if (e.key === 'Enter' && matches[0]) { onPick(matches[0].id); setOpen(false); } }}
          placeholder="Look up a member by username or name…"
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none min-w-0"
        />
      </div>
      {open && matches.length > 0 && (
        <div className="absolute z-20 left-0 right-0 mt-1 rounded-xl border border-border-primary bg-bg-secondary shadow-xl overflow-hidden">
          {matches.map((m) => (
            <button
              key={m.id}
              onClick={() => { onPick(m.id); setOpen(false); setQ(m.username ? `@${m.username}` : m.display_name || ''); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-bg-primary"
            >
              <Avatar url={m.avatar_url} name={m.display_name || m.username || '?'} />
              <span className="text-sm text-text-primary truncate">{m.display_name || m.username}</span>
              {m.username && <span className="text-xs text-text-muted truncate">@{m.username}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TimeInAppPage() {
  const { profile } = useAuthStore();
  const [verified, setVerified] = useState(false);
  const [range, setRange] = useState<Range>(30);
  const [data, setData] = useState<{ overview?: Overview; leaderboard?: LeaderRow[]; needsMigration?: string; error?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!profile?.is_admin) return;
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: row } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
      if (row?.is_admin) setVerified(true);
    })();
  }, [profile]);

  const load = useCallback(async (r: Range) => {
    try {
      const res = await fetch(`/api/admin/analytics/time?range=${r}`);
      if (res.ok) setData(await res.json());
    } catch { /* keep previous */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!verified) return;
    setLoading(true);
    load(range);
  }, [verified, range, load]);

  const pick = (id: string) => {
    setSelected(id);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!profile?.is_admin) return <AccessDenied />;
  if (!verified) return <Loading />;

  const o = data?.overview || {};
  const lb = data?.leaderboard || [];
  const rangeLabel = range === 0 ? 'all time' : `last ${range} days`;
  const secList = (o.sections || []).slice(0, 20);
  const secMax = Math.max(...secList.map((s) => s.ms), 0);

  const byDay = new Map((o.daily || []).map((d) => [d.day, d]));
  const days = range === 0 ? (o.daily || []).length : range;
  const daily = range === 0
    ? (o.daily || []).map((d) => ({ key: d.day, label: ddmmyyyy(d.day), ms: d.ms, sub: `${d.users} members` }))
    : Array.from({ length: days }, (_, i) => {
        const d = new Date();
        d.setUTCDate(d.getUTCDate() - (days - 1 - i));
        const key = d.toISOString().slice(0, 10);
        const row = byDay.get(key);
        return { key, label: ddmmyyyy(key), ms: row?.ms || 0, sub: `${row?.users || 0} members` };
      });

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-6">
      <div className="space-y-3">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary">
          <ArrowLeft className="w-3.5 h-3.5" /> Admin
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Time in app</h1>
            <p className="text-xs text-text-muted mt-0.5 max-w-2xl">
              Exactly how long each member spends on Align, to the second: web and app, per section.
              Only counts while the app is open and in use, and only for verified logged-in members.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {([7, 30, 90, 0] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  range === r
                    ? 'bg-accent-primary/15 text-accent-primary border border-accent-primary/30'
                    : 'text-text-muted border border-border-primary hover:text-text-primary'
                }`}
              >
                {r === 0 ? 'All' : `${r}d`}
              </button>
            ))}
            <button
              onClick={async () => { setRefreshing(true); await load(range); setRefreshing(false); }}
              className="p-1.5 rounded-lg border border-border-primary text-text-muted hover:text-text-primary transition-colors"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        <AnalyticsTabs />
      </div>

      <MemberSearch onPick={pick} />
      {selected && <MemberPanel userId={selected} onClose={() => setSelected(null)} />}

      {loading ? (
        <Loading />
      ) : data?.needsMigration ? (
        <MigrationNotice file={data.needsMigration} />
      ) : (
        <>
          {data?.error && <p className="text-xs text-red-400">{data.error}</p>}

          <StatGrid>
            <Stat label={`Total time · ${rangeLabel}`} value={hms(o.total_ms)} tone="accent" />
            <Stat label="Members with time" value={fmt(o.members)} />
            <Stat label="Average per member" value={hms(o.avg_ms)} />
            <Stat label="Median member" value={hms(o.median_ms)} sub="half spend more, half less" />
          </StatGrid>

          <Card title={`Total time per day · ${rangeLabel}`} hint="All members combined. UTC days.">
            <Bars points={daily} />
          </Card>

          <Card title={`Top members · ${rangeLabel}`} hint="Your most engaged members. Click a row for their full history.">
            <Table
              headers={['#', 'Member', 'Time', 'Active days', 'Avg / day', 'Favourite section', 'Mostly on', 'Plan', 'Last active']}
              empty="No time recorded yet. It starts counting as soon as the migration is live."
              rows={lb.map((r, i) => [
                <span key="r" className="text-text-muted inline-flex items-center gap-1">
                  {i < 3 && <Crown className="w-3 h-3 text-amber-400" />}{i + 1}
                </span>,
                <button key="m" onClick={() => pick(r.user_id)} className="flex items-center gap-2 text-left hover:text-accent-primary">
                  <Avatar url={r.avatar_url} name={r.display_name || r.username || '?'} size={22} />
                  <span className="truncate max-w-[160px]">{r.display_name || r.username || 'Member'}</span>
                  {r.username && <span className="text-text-muted truncate max-w-[120px]">@{r.username}</span>}
                </button>,
                <span key="t" className="font-semibold">{hms(r.total_ms)}</span>,
                fmt(r.active_days),
                hms(r.active_days ? r.total_ms / r.active_days : 0),
                sectionName(r.top_section),
                PLATFORM[r.top_platform || ''] || r.top_platform || '—',
                r.tier || '—',
                ddmmyyyy(r.last_day),
              ])}
            />
          </Card>

          <Card title={`Sections · ${rangeLabel}`} hint="Where members spend their time, all members combined. Right: members who used it · average per member.">
            {secList.length ? (
              <div className="space-y-2.5">
                {secList.map((s) => (
                  <TimeRow
                    key={s.section}
                    label={sectionName(s.section)}
                    ms={s.ms}
                    max={secMax}
                    right={`${fmt(s.users)} · avg ${hms(s.users ? s.ms / s.users : 0)}`}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted py-4 text-center">No time recorded yet.</p>
            )}
          </Card>

          <div>
            <h2 className="text-sm font-bold text-text-primary mb-1">Who is spending time</h2>
            <p className="text-[11px] text-text-muted mb-3">
              Total time per group · members in the group · average per member ({rangeLabel}).
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <Breakdown title="Age" rows={o.age} />
              <Breakdown title="Gender" rows={o.gender} />
              <Breakdown title="Plan" rows={o.tier} />
              <Breakdown title="Platform" rows={o.platforms} labelFor={(l) => PLATFORM[l] || l} />
              <Breakdown title="Sun sign" rows={o.sun_sign} />
              <Breakdown title="Country" hint="From the member's most recent session." rows={o.country} labelFor={countryName} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
