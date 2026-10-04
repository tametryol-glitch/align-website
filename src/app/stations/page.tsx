'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { Orbit, Lock, ArrowLeft, Bell, Check, Target } from 'lucide-react';

// ── Types (shape of /stations/* responses) ───────────────────────────
interface WatchItem {
  cycle_id: string;
  body: string;
  status: 'retrograde' | 'pre_shadow' | 'post_shadow' | 'upcoming';
  shadow_start: string;
  retro_station: string;
  direct_station: string;
  shadow_end: string;
  day_of_retrograde: number | null;
  retrograde_days: number;
  next_pass: { target: string; n: number; date: string } | null;
  house: number | null;
  ruled_houses: { sign: string; house: number }[];
  station_hits: { label: string; orb: number; station: string }[];
  push_eligible: boolean;
}

interface Section { key: string; title: string; text: string }
interface Reading {
  headline: string;
  teaser: string;
  sections: Section[];
  predictions: { text: string; window_start: string; window_end: string }[];
  do: string | null;
  avoid: string | null;
  timeline?: { label: string; date: string | null }[];
}
interface AlertSummary {
  id: string;
  body: string;
  type: string;
  headline: string;
  teaser: string;
  fires_on: string;
  read_at: string | null;
  locked: boolean;
}
interface AlertDetail extends AlertSummary {
  reading: Reading;
  predictions: { id: string; text: string; window_start: string; window_end: string; outcome: string | null }[];
  locked_note?: string;
  locked_sections?: string[];
  locked_predictions?: number;
  locked_has_do_avoid?: boolean;
}

const STATUS_LABEL: Record<WatchItem['status'], string> = {
  retrograde: 'Retrograde now',
  pre_shadow: 'Shadow ahead',
  post_shadow: 'Shadow clearing',
  upcoming: 'Coming up',
};
const STATUS_STYLE: Record<WatchItem['status'], string> = {
  retrograde: 'border-red-400/50 text-red-300 bg-red-400/10',
  pre_shadow: 'border-amber-400/50 text-amber-300 bg-amber-400/10',
  post_shadow: 'border-sky-400/50 text-sky-300 bg-sky-400/10',
  upcoming: 'border-border-primary text-text-tertiary',
};
const BODIES = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Juno', 'Vesta', 'Chiron'];

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function isoToDdMm(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
}

// ── Page ─────────────────────────────────────────────────────────────
function StationsInner() {
  const router = useRouter();
  const params = useSearchParams();
  const alertId = params.get('alert');

  const [tab, setTab] = useState<'watch' | 'alerts' | 'settings'>('watch');
  const [watch, setWatch] = useState<{ items: WatchItem[]; paid: boolean; needs_birth_data: boolean; has_birth_time?: boolean } | null>(null);
  const [alerts, setAlerts] = useState<AlertSummary[]>([]);
  const [detail, setDetail] = useState<AlertDetail | null>(null);
  const [score, setScore] = useState<{ answered: number; confirmed: number; partly: number; rate: number | null } | null>(null);
  const [prefs, setPrefs] = useState<{ enabled: boolean; bodies: string[]; push_mode: 'tight' | 'all' | 'off' } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [w, a, s, p] = await Promise.all([
        api.stationsWatch(),
        api.stationsAlerts(),
        api.stationsScorecard().catch(() => null),
        api.stationsPrefs().catch(() => null),
      ]);
      setWatch(w);
      setAlerts(a.alerts || []);
      setScore(s);
      setPrefs(p);
    } catch (e: any) {
      setError(e?.message || 'Could not load your station alerts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!alertId) { setDetail(null); return; }
    let live = true;
    api.stationsAlert(alertId).then((d: AlertDetail) => { if (live) setDetail(d); })
      .catch((e: any) => { if (live) setError(e?.message || 'Could not open that alert.'); });
    return () => { live = false; };
  }, [alertId]);

  async function answer(predictionId: string, outcome: 'yes' | 'partly' | 'no') {
    try {
      await api.stationsOutcome(predictionId, outcome);
      setDetail((d) => d && ({ ...d, predictions: d.predictions.map((p) => p.id === predictionId ? { ...p, outcome } : p) }));
      api.stationsScorecard().then(setScore).catch(() => {});
    } catch (e: any) {
      setError(e?.message || 'Could not save that.');
    }
  }

  async function savePrefs(patch: Partial<NonNullable<typeof prefs>>) {
    if (!prefs) return;
    const next = { ...prefs, ...patch };
    setPrefs(next);
    try { await api.stationsSavePrefs(patch); } catch (e: any) { setError(e?.message || 'Could not save settings.'); }
  }

  const today = new Date().toISOString().slice(0, 10);

  // ── Alert detail view ──
  if (alertId) {
    return (
      <div className="max-w-2xl mx-auto pb-16">
        <button onClick={() => router.push('/stations')} className="text-sm text-text-tertiary hover:text-text-primary flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> All station alerts
        </button>
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        {!detail ? <LoadingCosmic label="Opening your reading" /> : (
          <div className="space-y-4">
            <div className="card bg-gradient-cosmic border-accent-muted">
              <p className="text-[11px] uppercase tracking-widest text-text-muted mb-1">{detail.body} · {isoToDdMm(detail.fires_on)}</p>
              <h1 className="text-2xl font-display font-bold text-text-primary">{detail.headline}</h1>
            </div>

            {detail.reading.sections.map((s) => (
              <div key={s.key} className="card">
                <p className="text-[11px] uppercase tracking-widest text-text-muted mb-1">{s.title}</p>
                <p className="text-text-secondary leading-relaxed">{s.text}</p>
              </div>
            ))}

            {detail.locked ? (
              <>
                {detail.reading.predictions.length > 0 && (
                  <div className="card space-y-3">
                    <p className="text-[11px] uppercase tracking-widest text-text-muted">What it could produce</p>
                    {detail.reading.predictions.map((p, i) => (
                      <div key={i} className="border-l-2 border-accent-primary/50 pl-3">
                        <p className="text-text-primary leading-relaxed">{p.text}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="card text-center py-6">
                  <Lock className="w-7 h-7 text-accent-primary mx-auto mb-2" />
                  <p className="text-text-primary font-semibold mb-2">Still locked in your reading</p>
                  <ul className="text-sm text-text-tertiary space-y-1 mb-4">
                    {(detail.locked_sections || []).map((t) => <li key={t}>{t}</li>)}
                    {(detail.locked_predictions || 0) > 0 && (
                      <li>{detail.locked_predictions} more prediction{detail.locked_predictions === 1 ? '' : 's'}</li>
                    )}
                    {detail.locked_has_do_avoid && <li>What to do and what to avoid</li>}
                  </ul>
                  <Link href="/pricing" className="btn-primary inline-block px-6 py-2">See plans</Link>
                </div>
              </>
            ) : (
              <>
                {detail.predictions.length > 0 && (
                  <div className="card space-y-4">
                    <p className="text-[11px] uppercase tracking-widest text-text-muted">What it could produce</p>
                    {detail.predictions.map((p) => {
                      const ended = p.window_end <= today;
                      return (
                        <div key={p.id} className="border-l-2 border-accent-primary/50 pl-3">
                          <p className="text-text-primary leading-relaxed">{p.text}</p>
                          {p.outcome ? (
                            <p className="text-xs text-text-muted mt-2 flex items-center gap-1"><Check className="w-3 h-3" /> You marked this: {p.outcome === 'yes' ? 'it happened' : p.outcome === 'partly' ? 'partly' : 'it did not'}</p>
                          ) : ended ? (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-text-muted">Did this happen?</span>
                              {(['yes', 'partly', 'no'] as const).map((o) => (
                                <button key={o} onClick={() => answer(p.id, o)}
                                  className="text-xs px-3 py-1 rounded-full border border-border-primary text-text-secondary hover:border-accent-primary/60">
                                  {o === 'yes' ? 'Yes' : o === 'partly' ? 'Partly' : 'No'}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-text-muted mt-2">Window closes {isoToDdMm(p.window_end)}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {(detail.reading.do || detail.reading.avoid) && (
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="card"><p className="text-[11px] uppercase tracking-widest text-green-400 mb-1">Do</p><p className="text-text-secondary">{detail.reading.do}</p></div>
                    <div className="card"><p className="text-[11px] uppercase tracking-widest text-red-400 mb-1">Avoid</p><p className="text-text-secondary">{detail.reading.avoid}</p></div>
                  </div>
                )}
              </>
            )}

            {detail.reading.timeline && (
              <div className="card">
                <p className="text-[11px] uppercase tracking-widest text-text-muted mb-2">The timeline</p>
                <ul className="space-y-1 text-sm">
                  {detail.reading.timeline.filter((t) => t.date).map((t) => (
                    <li key={t.label} className="flex justify-between text-text-secondary"><span>{t.label}</span><span className="text-text-primary">{t.date}</span></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Main view ──
  return (
    <div className="max-w-2xl mx-auto pb-16">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-display font-bold text-text-primary flex items-center justify-center gap-2">
          <Orbit className="w-7 h-7 text-accent-primary" /> Station Alerts
        </h1>
        <p className="text-sm text-text-tertiary mt-1">When your planets turn, and what it does to your chart.</p>
      </div>

      <div className="flex gap-2 justify-center mb-5">
        {([['watch', 'Watch'], ['alerts', 'Alerts'], ['settings', 'Settings']] as const).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`text-sm px-4 py-1.5 rounded-full border ${tab === k ? 'border-accent-primary text-accent-primary bg-accent-primary/10' : 'border-border-primary text-text-secondary'}`}>
            {label}
          </button>
        ))}
      </div>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      {loading && <LoadingCosmic label="Reading the sky against your chart" />}

      {!loading && watch?.needs_birth_data && (
        <div className="card text-center py-8">
          <p className="text-text-secondary mb-3">Add your birth date and place so we can match every turn to your chart.</p>
          <Link href="/settings" className="btn-primary inline-block px-6 py-2">Add birth details</Link>
        </div>
      )}

      {!loading && watch && !watch.needs_birth_data && tab === 'watch' && (
        <div className="space-y-3">
          {watch.has_birth_time === false && (
            <p className="text-xs text-amber-300 text-center">Without a birth time we cannot place houses. Add it for the full reading.</p>
          )}
          {score && score.answered > 0 && (
            <p className="text-xs text-text-tertiary text-center">
              You have confirmed {score.confirmed} of {score.answered} predictions{score.partly ? ` (${score.partly} partly)` : ''}.
            </p>
          )}
          {watch.items.length === 0 && <p className="text-center text-text-tertiary">Nothing is turning in the next few months.</p>}
          {watch.items.map((it) => (
            <div key={it.cycle_id} className="card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-lg font-display font-bold text-text-primary">{it.body}</p>
                <span className={`text-[11px] px-2 py-0.5 rounded-full border ${STATUS_STYLE[it.status]}`}>
                  {it.status === 'retrograde' && it.day_of_retrograde ? `Day ${it.day_of_retrograde} of ${it.retrograde_days}` : STATUS_LABEL[it.status]}
                </span>
              </div>
              {it.house && <p className="text-sm text-text-secondary">Turns in your {ordinal(it.house)} house{it.ruled_houses[0] ? ` · rules your ${ordinal(it.ruled_houses[0].house)}` : ''}</p>}
              <div className="grid grid-cols-3 gap-2 text-center text-xs mt-3">
                <div><p className="text-text-muted">Turns retrograde</p><p className="text-text-primary">{it.retro_station}</p></div>
                <div><p className="text-text-muted">Turns direct</p><p className="text-text-primary">{it.direct_station}</p></div>
                <div><p className="text-text-muted">Shadow ends</p><p className="text-text-primary">{it.shadow_end}</p></div>
              </div>
              {it.station_hits[0] && (
                <p className="text-xs text-accent-primary mt-3 flex items-center gap-1"><Target className="w-3 h-3" /> Lands {it.station_hits[0].orb.toFixed(2)}° from your natal {it.station_hits[0].label}</p>
              )}
              {it.next_pass && (
                <p className="text-xs text-text-tertiary mt-1">Next pass over your {it.next_pass.target}: {it.next_pass.date}</p>
              )}
              {!watch.paid && it.status !== 'upcoming' && (
                <p className="text-[11px] text-text-muted mt-2 flex items-center gap-1"><Lock className="w-3 h-3" /> Upgrade to see exactly what it hits in your chart.</p>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'alerts' && (
        <div className="space-y-2">
          {alerts.length === 0 && <p className="text-center text-text-tertiary">No alerts yet. You will get one when a planet you follow is about to turn.</p>}
          {alerts.map((a) => (
            <button key={a.id} onClick={() => router.push(`/stations?alert=${a.id}`)}
              className="card w-full text-left hover:border-accent-primary/50 transition-colors">
              <p className="text-[11px] uppercase tracking-widest text-text-muted">{isoToDdMm(a.fires_on)}{!a.read_at ? ' · new' : ''}</p>
              <p className="text-text-primary font-semibold">{a.headline}</p>
              <p className="text-sm text-text-tertiary">{a.teaser}</p>
            </button>
          ))}
        </div>
      )}

      {!loading && tab === 'settings' && prefs && (
        <div className="space-y-4">
          <div className="card">
            <p className="text-[11px] uppercase tracking-widest text-text-muted mb-2 flex items-center gap-1"><Bell className="w-3 h-3" /> Notifications</p>
            {([
              ['tight', 'Only the big ones', 'A turn lands within 1° of something in your chart, or touches your chart ruler.'],
              ['all', 'Every alert', 'Heads-ups, stations and releases for the planets you follow.'],
              ['off', 'None', 'You can still read everything here.'],
            ] as const).map(([k, label, desc]) => (
              <label key={k} className="flex items-start gap-3 py-2 cursor-pointer">
                <input type="radio" checked={prefs.push_mode === k} onChange={() => savePrefs({ push_mode: k })} className="mt-1" />
                <span><span className="text-text-primary text-sm">{label}</span><br /><span className="text-xs text-text-tertiary">{desc}</span></span>
              </label>
            ))}
          </div>
          <div className="card">
            <p className="text-[11px] uppercase tracking-widest text-text-muted mb-2">Planets you follow</p>
            <div className="flex flex-wrap gap-2">
              {BODIES.map((b) => {
                const on = prefs.bodies.includes(b);
                return (
                  <button key={b} onClick={() => savePrefs({ bodies: on ? prefs.bodies.filter((x) => x !== b) : [...prefs.bodies, b] })}
                    className={`text-xs px-3 py-1.5 rounded-full border ${on ? 'border-accent-primary text-accent-primary bg-accent-primary/10' : 'border-border-primary text-text-tertiary'}`}>
                    {b}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StationsPage() {
  return (
    <Suspense fallback={<LoadingCosmic label="Loading" />}>
      <StationsInner />
    </Suspense>
  );
}
