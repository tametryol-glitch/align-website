'use client';

// Your Day: the progressed radar's ten hottest life areas told as one story,
// written as if the member were reading their own day before it happens.
// Free members read the opening and the first chapters; the rest is locked
// SERVER SIDE (the locked text is never in the response).

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, Clock, Lock, Sparkles } from 'lucide-react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { DEFAULT_SEND_HOUR, loadDailyBriefPrefs, saveDailyBriefPrefs } from '@/lib/dailyBriefPrefs';
import { getPermissionStatus, isPushSupported, needsIosInstallForPush, registerPushSubscription } from '@/lib/pushService';

interface Chapter { title: string; when: string | null; locked: boolean; body: string | null; because: string | null; areas: string[] }
interface DayStory {
  date: string; headline: string; opening: string; chapters: Chapter[];
  watch_for: string | null; closing: string | null; paid: boolean; tier: string;
  areas: { key: string; label: string; ratio: number; level: string; count: number }[];
  locked: { chapters: number; words: number; has_watch_for: boolean };
  feedback: string | null; local_date: string;
}

const DAY_CACHE = new Map<string, DayStory>();

function levelColor(l: string): string {
  return l === 'Very hot' ? '#f43f5e' : l === 'Hot' ? '#fb923c' : l === 'Warm' ? '#fbbf24' : '#64748b';
}

export default function YourDayPage() {
  const { profile, user } = useAuthStore();
  const [story, setStory] = useState<DayStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fb, setFb] = useState<string | null>(null);
  const [remind, setRemind] = useState<{ available: boolean; enabled: boolean }>({ available: false, enabled: false });
  const [note, setNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile?.birth_date || !profile?.latitude) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      const local = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in the member's own zone
      const key = `${profile.id}|${local}|${profile.birth_date}`;
      let res = DAY_CACHE.get(key);
      if (!res) {
        res = (await api.getDayStory({ birth_data: buildBirthData(profile), timezone: tz, date: local })) as DayStory;
        DAY_CACHE.set(key, res);
      }
      setStory(res);
      setFb(res.feedback);
    } catch (e: any) {
      setError(e?.message || 'Could not write your day right now.');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!user?.id) return;
    loadDailyBriefPrefs(user.id).then(({ available, prefs }) => setRemind({ available, enabled: prefs.enabled }));
  }, [user?.id]);

  async function turnOnMorning() {
    if (!user?.id) return;
    setNote(null);
    if (needsIosInstallForPush()) { setNote('On iPhone, add Align to your Home Screen first, then turn this on.'); return; }
    if (isPushSupported() && getPermissionStatus() !== 'granted') {
      await registerPushSubscription(user.id).catch(() => false);
      if (getPermissionStatus() === 'denied') setNote('Notifications are blocked in your browser settings, so it will only reach you in the app.');
    }
    const ok = await saveDailyBriefPrefs(user.id, { enabled: true, sendHour: DEFAULT_SEND_HOUR });
    if (ok) setRemind((r) => ({ ...r, enabled: true }));
    else setNote('Could not save that. Please try again.');
  }

  async function rate(r: 'happened' | 'partly' | 'didnt') {
    if (!story) return;
    setFb(r);
    api.dayStoryFeedback(story.local_date, r).catch(() => undefined);
  }

  function lockedTap() {
    if (story) api.dayStoryPaywall(story.local_date).catch(() => undefined);
  }

  if (!profile?.birth_date || !profile?.latitude) {
    return (<div className="max-w-2xl mx-auto px-4 py-8"><BirthDataPrompt /></div>);
  }
  if (loading) {
    return (<div className="max-w-2xl mx-auto px-4 py-16"><LoadingCosmic /></div>);
  }
  if (error || !story) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-text-secondary mb-4">{error || 'Your day is not ready yet.'}</p>
        <button onClick={load} className="btn-primary px-6 py-2">Try again</button>
      </div>
    );
  }

  const paid = story.paid;
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-secondary flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Your day &middot; {story.date}
        </p>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mt-1 leading-tight">{story.headline}</h1>
        <p className="text-base text-text-secondary mt-3 leading-relaxed">{story.opening}</p>
      </header>

      <div className="space-y-4">
        {story.chapters.map((c, i) => (
          <section key={i} className="card" style={c.locked ? { opacity: 0.95 } : undefined}>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-semibold text-text-primary">{c.title}</h2>
              {c.when && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-text-secondary">
                  <Clock className="w-3 h-3" /> {c.when}
                </span>
              )}
            </div>
            {c.locked ? (
              <Link href="/pricing" onClick={lockedTap} className="block mt-2 group">
                <p className="text-sm text-text-muted blur-[5px] select-none leading-relaxed" aria-hidden>
                  What happens here is already in motion, and the part you have been avoiding is the part that decides how this chapter of your day ends.
                </p>
                <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-primary group-hover:underline">
                  <Lock className="w-3.5 h-3.5" /> Keep reading your day
                </span>
              </Link>
            ) : (
              <>
                <p className="text-[15px] text-text-secondary mt-2 leading-relaxed">{c.body}</p>
                {c.because && <p className="text-[11px] text-text-muted mt-2">Why: {c.because}</p>}
              </>
            )}
          </section>
        ))}
      </div>

      {paid ? (
        <>
          {story.watch_for && (
            <div className="card border border-accent-primary/30">
              <p className="text-xs font-bold uppercase tracking-wider text-accent-secondary mb-1">Watch for this today</p>
              <p className="text-[15px] text-text-primary leading-relaxed">{story.watch_for}</p>
            </div>
          )}
          {story.closing && <p className="text-[15px] text-text-secondary leading-relaxed italic">{story.closing}</p>}
        </>
      ) : (
        <Link
          href="/pricing"
          onClick={lockedTap}
          className="block rounded-2xl p-5 border border-accent-primary/40"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.22), rgba(236,72,153,0.14))' }}
        >
          <p className="text-base font-semibold text-text-primary">
            {story.locked.chapters} more {story.locked.chapters === 1 ? 'moment' : 'moments'} of your day{story.locked.has_watch_for ? ', the one thing to watch for, and how to carry it' : ''} are waiting.
          </p>
          <p className="text-sm text-text-secondary mt-1">
            You have read the first part. The rest is about {story.locked.words} words written only for you, today.
          </p>
          <span className="btn-primary inline-block mt-3 px-6 py-2 text-sm">Unlock the rest of your day</span>
        </Link>
      )}

      {story.areas.length > 0 && (
        <details className="card">
          <summary className="cursor-pointer text-sm font-semibold text-text-primary">What is driving today</summary>
          <ul className="mt-3 space-y-2">
            {story.areas.map((a) => (
              <li key={a.key} className="flex items-center gap-3 text-sm">
                <span className="w-44 shrink-0 text-text-secondary truncate">{a.label}</span>
                <span className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <span className="block h-full rounded-full" style={{ width: `${Math.min(100, (a.ratio / 2.5) * 100)}%`, background: levelColor(a.level) }} />
                </span>
                <span className="w-10 text-right text-text-muted">{a.ratio.toFixed(1)}&times;</span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-text-muted mt-3">1&times; is an ordinary day for your chart. Read from your progressed chart: the you that is forming now.</p>
        </details>
      )}

      <div className="card">
        <p className="text-sm font-semibold text-text-primary mb-2">How is today landing?</p>
        <div className="flex gap-2 flex-wrap">
          {([['happened', 'It happened'], ['partly', 'Partly'], ['didnt', "Didn't"]] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => rate(k)}
              className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${fb === k ? 'bg-accent-primary text-white border-accent-primary' : 'border-border-primary text-text-secondary hover:text-text-primary'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-text-muted mt-2">Your answers teach us which patterns are working for you.</p>
      </div>

      {remind.available && !remind.enabled && (
        <button onClick={turnOnMorning} className="w-full card flex items-center gap-3 text-left hover:border-accent-primary/50 transition-colors">
          <Bell className="w-5 h-5 text-accent-primary shrink-0" />
          <span>
            <span className="block text-sm font-semibold text-text-primary">Read your day before it starts</span>
            <span className="block text-xs text-text-secondary">Get it every morning, in your own time zone.</span>
          </span>
        </button>
      )}
      {note && <p className="text-[11px] text-amber-300">{note}</p>}
    </div>
  );
}
