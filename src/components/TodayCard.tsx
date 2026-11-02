'use client';

// The one answer at the top of the dashboard: what is happening to YOU today,
// what to do, what to avoid, and when. Built from today's real planetary
// positions against the user's natal chart (see lib/todayEngine.ts).

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, X, Clock, ChevronRight, Bell } from 'lucide-react';
import ShareButtonWithCard from '@/components/share/ShareButton';
import TodayShareCard from '@/components/share/TodayShareCard';
import {
  getPermissionStatus,
  isPushSupported,
  needsIosInstallForPush,
  registerPushSubscription,
} from '@/lib/pushService';
import {
  DEFAULT_SEND_HOUR,
  loadDailyBriefPrefs,
  saveDailyBriefPrefs,
} from '@/lib/dailyBriefPrefs';
import {
  buildTodayAnswer,
  computeTodayAspects,
  type BodyPos,
} from '@/lib/todayEngine';
import { calculatePlanetaryHours } from '@/lib/planetaryHours/calc';
import { PLANET_GLYPHS } from '@/lib/planetaryHours/constants';

export interface TodayData {
  transits: BodyPos[];
  natal: BodyPos[];
}

interface Props {
  /** Signed-in member; enables the morning reminder. */
  userId?: string;
  hasBirthData: boolean;
  birthTimeKnown: boolean;
  data: TodayData | null;
  loading: boolean;
  latitude?: number | null;
  longitude?: number | null;
  moonPhase?: { phase: string; emoji: string };
}

// Hours ruled by these planets suit starting, asking and showing up; hours
// ruled by these ask for more care with commitments and conflict.
const BEST_RULERS = ['Jupiter', 'Venus', 'Sun'];
const CAREFUL_RULERS = ['Mars', 'Saturn', 'Pluto'];

function clock(d: Date): string {
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

const REMINDER_HOURS = [6, 7, 8, 9, 10];

function hourLabel(h: number): string {
  const d = new Date();
  d.setHours(h, 0, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: 'numeric' });
}

export function TodayCard({
  userId, hasBirthData, birthTimeKnown, data, loading, latitude, longitude, moonPhase,
}: Props) {
  // Morning reminder. `available` stays false until the table exists, so the
  // control never offers something that cannot be saved.
  const [reminder, setReminder] = useState<{ available: boolean; enabled: boolean; hour: number }>({
    available: false, enabled: false, hour: DEFAULT_SEND_HOUR,
  });
  const [reminderBusy, setReminderBusy] = useState(false);
  const [reminderNote, setReminderNote] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !hasBirthData) return;
    let cancelled = false;
    loadDailyBriefPrefs(userId).then(({ available, prefs }) => {
      if (!cancelled) setReminder({ available, enabled: prefs.enabled, hour: prefs.sendHour });
    });
    return () => { cancelled = true; };
  }, [userId, hasBirthData]);

  async function updateReminder(enabled: boolean, hour: number) {
    if (!userId || reminderBusy) return;
    setReminderBusy(true);
    setReminderNote(null);
    try {
      if (enabled) {
        // A click is the user gesture the browser needs to show its prompt.
        if (needsIosInstallForPush()) {
          setReminderNote('On iPhone, add Align to your Home Screen first, then turn this on.');
        } else if (isPushSupported() && getPermissionStatus() !== 'granted') {
          await registerPushSubscription(userId).catch(() => false);
          if (getPermissionStatus() === 'denied') {
            setReminderNote('Notifications are blocked in your browser settings, so the reminder will only reach you in the app.');
          }
        }
      }
      const ok = await saveDailyBriefPrefs(userId, { enabled, sendHour: hour });
      if (ok) setReminder((r) => ({ ...r, enabled, hour }));
      else setReminderNote('Could not save that. Please try again.');
    } finally {
      setReminderBusy(false);
    }
  }

  const answer = useMemo(() => {
    if (!data) return null;
    return buildTodayAnswer(computeTodayAspects(data.transits, data.natal, birthTimeKnown));
  }, [data, birthTimeKnown]);

  // Next upcoming good hour and next hour to be careful in, from real
  // sunrise/sunset at the saved location. Null when there is no location.
  const hours = useMemo(() => {
    if (latitude == null || longitude == null) return null;
    try {
      const now = new Date();
      const r = calculatePlanetaryHours(now, latitude, longitude, now);
      const upcoming = [...r.dayHours, ...r.nightHours].filter((h) => h.end.getTime() > now.getTime());
      const best = upcoming.find((h) => BEST_RULERS.includes(h.ruler));
      const careful = upcoming.find((h) => CAREFUL_RULERS.includes(h.ruler));
      return { best, careful };
    } catch {
      return null;
    }
  }, [latitude, longitude]);

  const shell = 'rounded-2xl border border-accent-primary/30 p-5';
  const shellStyle = { background: 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(236,72,153,0.10))' };

  if (!hasBirthData) {
    return (
      <div className={shell} style={shellStyle}>
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-secondary mb-1">Today for you</p>
        <p className="text-base font-semibold text-text-primary">Add your birth details to get your daily answer</p>
        <p className="text-sm text-text-secondary mt-1">
          We compare today&apos;s real planet positions with your chart, so the answer is about you.
        </p>
        <Link href="/chart" className="btn-primary inline-block mt-3 px-5 py-2 text-sm">Add birth details</Link>
      </div>
    );
  }

  // Loaded but nothing came back: say so rather than spin forever or invent
  // an answer.
  if (!loading && !answer) {
    return (
      <div className={shell} style={shellStyle}>
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-secondary mb-1">Today for you</p>
        <p className="text-sm text-text-secondary">
          We couldn&apos;t load today&apos;s planet positions. Check your connection and refresh.
        </p>
        <Link href="/your-day" className="text-sm font-medium text-accent-primary hover:underline inline-block mt-2">
          Open your daily brief
        </Link>
      </div>
    );
  }

  if (loading || !answer) {
    return (
      <div className={shell} style={shellStyle} aria-busy="true">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-secondary mb-3">Today for you</p>
        <div className="h-5 w-2/3 rounded bg-white/10 animate-pulse mb-2" />
        <div className="h-4 w-1/2 rounded bg-white/10 animate-pulse mb-4" />
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="h-16 rounded-xl bg-white/10 animate-pulse" />
          <div className="h-16 rounded-xl bg-white/10 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className={shell} style={shellStyle} data-coachmark="daily-brief">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-secondary">Today for you</p>
        {moonPhase && (
          <span className="text-xs text-text-tertiary">{moonPhase.emoji} {moonPhase.phase}</span>
        )}
      </div>

      <h2 className="text-xl font-display font-bold text-text-primary">{answer.headline}</h2>
      <p className="text-sm text-text-secondary mt-0.5">{answer.area}</p>

      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-300 mb-1">
            <Check className="w-3.5 h-3.5" /> Do
          </p>
          <p className="text-sm text-text-primary leading-snug">{answer.doText}</p>
        </div>
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-300 mb-1">
            <X className="w-3.5 h-3.5" /> Avoid
          </p>
          <p className="text-sm text-text-primary leading-snug">{answer.avoidText}</p>
        </div>
      </div>

      {hours && (hours.best || hours.careful) && (
        <div className="mt-3 flex flex-col sm:flex-row gap-x-6 gap-y-1 text-sm text-text-secondary">
          {hours.best && (
            <p className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              Best time: {clock(hours.best.start)}–{clock(hours.best.end)}
              <span className="text-text-muted">{PLANET_GLYPHS[hours.best.ruler]} {hours.best.ruler} hour</span>
            </p>
          )}
          {hours.careful && (
            <p className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-rose-300 shrink-0" />
              Take care: {clock(hours.careful.start)}–{clock(hours.careful.end)}
              <span className="text-text-muted">{PLANET_GLYPHS[hours.careful.ruler]} {hours.careful.ruler} hour</span>
            </p>
          )}
        </div>
      )}

      {/* Habit hooks: share today's answer, and get it every morning. */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <ShareButtonWithCard
          variant="compact"
          label="Share today"
          shareTitle="Today for me on Align"
          shareText={`${answer.headline}. Do: ${answer.doText} Avoid: ${answer.avoidText}`}
          shareUrl="https://www.aligncosmic.com"
          cardElement={
            <TodayShareCard
              headline={answer.headline}
              area={answer.area}
              doText={answer.doText}
              avoidText={answer.avoidText}
              date={new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            />
          }
        />

        {userId && reminder.available && (
          reminder.enabled ? (
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <Bell className="w-3.5 h-3.5 text-accent-primary" />
              <span>Daily reminder at</span>
              <select
                aria-label="Reminder time"
                value={reminder.hour}
                disabled={reminderBusy}
                onChange={(e) => updateReminder(true, Number(e.target.value))}
                className="bg-bg-tertiary border border-border-primary rounded-md px-1.5 py-0.5 text-xs text-text-primary"
              >
                {REMINDER_HOURS.map((h) => (
                  <option key={h} value={h}>{hourLabel(h)}</option>
                ))}
              </select>
              <button
                type="button"
                disabled={reminderBusy}
                onClick={() => updateReminder(false, reminder.hour)}
                className="text-text-muted hover:text-text-primary underline underline-offset-2"
              >
                Turn off
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={reminderBusy}
              onClick={() => updateReminder(true, reminder.hour)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-primary hover:underline"
            >
              <Bell className="w-3.5 h-3.5" /> Remind me each morning
            </button>
          )
        )}
      </div>
      {reminderNote && <p className="mt-2 text-[11px] text-amber-300 leading-snug">{reminderNote}</p>}

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-[11px] text-text-muted leading-snug">
          From today&apos;s real planet positions against your natal chart.
          {!birthTimeKnown && ' Add your birth time to include your Rising and Midheaven.'}
        </p>
        <Link href="/your-day" className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-accent-primary hover:underline">
          Full brief <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
