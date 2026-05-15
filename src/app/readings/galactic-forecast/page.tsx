'use client';

import { useState, useMemo, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { PaywallGate } from '@/components/ui/PaywallGate';
import {
  getDayLord,
  getHourLord,
  getMinuteLord,
  getPulseLord,
  getCustomCycleDay,
  RULER_FULL_MEANINGS,
  getBestUseTags,
} from '@/lib/galacticClock';
import type { RulerName } from '@/lib/galacticClock';

// ── Forecast Type Options ──

type ForecastType = 'General' | 'Money' | 'Love' | 'Career' | 'Spiritual Work' | 'Children' | 'Healing';

const FORECAST_TYPES: Array<{ key: ForecastType; label: string }> = [
  { key: 'General', label: 'General' },
  { key: 'Money', label: 'Money' },
  { key: 'Love', label: 'Love' },
  { key: 'Career', label: 'Career' },
  { key: 'Spiritual Work', label: 'Spiritual' },
  { key: 'Children', label: 'Children' },
  { key: 'Healing', label: 'Healing' },
];

// ── Horizon Options ──

const HORIZON_OPTIONS: Array<{ hours: number; label: string }> = [
  { hours: 3, label: '3h' },
  { hours: 6, label: '6h' },
  { hours: 12, label: '12h' },
  { hours: 24, label: '24h' },
];

// ── Forecast Type Config (ruler affinities) ──

const FORECAST_TYPE_RULERS: Record<ForecastType, RulerName[]> = {
  General: ['Sun', 'Jupiter', 'Venus'],
  Money: ['Jupiter', 'Venus', 'Saturn', 'Mercury'],
  Love: ['Venus', 'Moon', 'Juno'],
  Career: ['Saturn', 'Sun', 'Jupiter', 'Mars'],
  'Spiritual Work': ['Neptune', 'Moon', 'Jupiter', 'Pluto'],
  Children: ['Moon', 'Jupiter', 'Venus'],
  Healing: ['Moon', 'Neptune', 'Pluto', 'Vesta'],
};

// ── Scoring & Window Engine ──

const STRONG_THRESHOLD = 6.5;
const MIXED_THRESHOLD = 4.0;

interface ForecastMoment {
  timestamp: Date;
  score: number;
  hourLord: RulerName;
  minuteLord: RulerName;
  pulseLord: RulerName;
  dayLord: RulerName;
  cycleDay: string;
  summary: string;
  bestThingToDo: string;
  bestThingToAvoid: string;
  supportiveTags: string[];
  cautionTags: string[];
}

interface ForecastWindow {
  startTime: Date;
  endTime: Date;
  peakTime: Date;
  peakScore: number;
  label: string;
  durationMinutes: number;
  summary: string;
  bestThingToDo: string;
  bestThingToAvoid: string;
  supportiveTags: string[];
  cautionTags: string[];
  galacticSignatureAtPeak: {
    cycleDay: string;
    dayLord: string;
    hourLord: string;
    minuteLord: string;
    pulseLord: string;
  };
}

interface CurrentWindowStatus {
  status: 'strong' | 'mixed' | 'weak';
  label: string;
  score: number;
  activeWindow: ForecastWindow | null;
}

interface NotificationCandidate {
  title: string;
  body: string;
  triggerTime: Date;
  urgency: 'low' | 'medium' | 'high';
}

interface ForecastResult {
  currentStatus: CurrentWindowStatus;
  nextBestWindow: ForecastWindow | null;
  allWindows: ForecastWindow[];
  notifications: NotificationCandidate[];
}

function scoreMoment(date: Date, focusType: ForecastType): ForecastMoment {
  const dayLord = getDayLord(date);
  const hourLord = getHourLord(date);
  const minuteLord = getMinuteLord(date);
  const pulseLord = getPulseLord(date);
  const cycleDay = getCustomCycleDay(date);

  const favorableRulers = FORECAST_TYPE_RULERS[focusType] || FORECAST_TYPE_RULERS.General;

  // Score based on ruler alignment with focus type
  let score = 3.0; // baseline

  // Hour lord has highest weight (3.0 max)
  if (favorableRulers.includes(hourLord.ruler)) score += 3.0;
  else if (['Sun', 'Jupiter'].includes(hourLord.ruler)) score += 1.0;

  // Minute lord has medium weight (2.0 max)
  if (favorableRulers.includes(minuteLord.ruler)) score += 2.0;
  else if (['Sun', 'Jupiter', 'Venus'].includes(minuteLord.ruler)) score += 0.5;

  // Day lord has background influence (1.0 max)
  if (favorableRulers.includes(dayLord.ruler)) score += 1.0;

  // Pulse lord adds spark (0.5 max)
  if (favorableRulers.includes(pulseLord.ruler)) score += 0.5;

  // Thematic coherence bonus: same ruler in multiple levels
  if (hourLord.ruler === minuteLord.ruler) score += 0.5;
  if (hourLord.ruler === dayLord.ruler) score += 0.3;

  score = Math.min(10, Math.max(0, score));

  const hourMeaning = RULER_FULL_MEANINGS[hourLord.ruler];
  const minuteMeaning = RULER_FULL_MEANINGS[minuteLord.ruler];

  const supportiveTags = getBestUseTags(hourLord.ruler, minuteLord.ruler);

  // Caution tags from ruler that conflicts with the focus
  const cautionRulers: RulerName[] = ({
    General: ['Pluto'],
    Money: ['Neptune', 'Pluto'],
    Love: ['Saturn', 'Uranus'],
    Career: ['Neptune', 'Moon'],
    'Spiritual Work': ['Mars', 'Saturn'],
    Children: ['Saturn', 'Pluto'],
    Healing: ['Mars', 'Saturn'],
  } as Record<string, RulerName[]>)[focusType] || ['Pluto'];

  const cautionTags: string[] = [];
  if (cautionRulers.includes(hourLord.ruler)) {
    cautionTags.push(RULER_FULL_MEANINGS[hourLord.ruler].caution.split('.')[0].replace('Avoid ', ''));
  }

  const summary = `${hourMeaning.expression.charAt(0).toUpperCase() + hourMeaning.expression.slice(1)} energy meets ${minuteMeaning.keywords[0]} — ${hourMeaning.use.replace('Good for ', '').split(',').slice(0, 2).join(' and').trim()}.`;
  const bestThingToDo = hourMeaning.use.replace('Good for ', '');
  const bestThingToAvoid = hourMeaning.caution;

  return {
    timestamp: date,
    score,
    hourLord: hourLord.ruler,
    minuteLord: minuteLord.ruler,
    pulseLord: pulseLord.ruler,
    dayLord: dayLord.ruler,
    cycleDay: cycleDay.name,
    summary,
    bestThingToDo,
    bestThingToAvoid,
    supportiveTags,
    cautionTags,
  };
}

function forecastWindows(focusType: ForecastType, horizonHours: number): ForecastResult {
  const now = new Date();
  const scanIntervalMs = 5 * 60 * 1000; // 5 minutes
  const horizonMs = horizonHours * 60 * 60 * 1000;
  const endTime = new Date(now.getTime() + horizonMs);

  // Scan all moments
  const moments: ForecastMoment[] = [];
  let t = new Date(now.getTime());
  while (t.getTime() <= endTime.getTime()) {
    moments.push(scoreMoment(new Date(t), focusType));
    t = new Date(t.getTime() + scanIntervalMs);
  }

  // Group consecutive high-scoring moments into windows
  const windows: ForecastWindow[] = [];
  let windowMoments: ForecastMoment[] = [];

  for (const m of moments) {
    if (m.score >= MIXED_THRESHOLD) {
      windowMoments.push(m);
    } else {
      if (windowMoments.length >= 2) {
        windows.push(buildWindow(windowMoments, focusType));
      }
      windowMoments = [];
    }
  }
  if (windowMoments.length >= 2) {
    windows.push(buildWindow(windowMoments, focusType));
  }

  // Current status
  const currentMoment = moments[0];
  const currentStatus: CurrentWindowStatus = {
    status: currentMoment.score >= STRONG_THRESHOLD ? 'strong'
      : currentMoment.score >= MIXED_THRESHOLD ? 'mixed' : 'weak',
    label: currentMoment.score >= STRONG_THRESHOLD
      ? `Strong ${focusType} window active now`
      : currentMoment.score >= MIXED_THRESHOLD
      ? `Mixed timing for ${focusType.toLowerCase()}`
      : `Quiet period for ${focusType.toLowerCase()}`,
    score: currentMoment.score,
    activeWindow: windows.find(w => now >= w.startTime && now <= w.endTime) || null,
  };

  // Next best window
  const futureWindows = windows.filter(w => w.endTime > now);
  const nextBestWindow = futureWindows.length > 0
    ? futureWindows.reduce((best, w) => w.peakScore > best.peakScore ? w : best, futureWindows[0])
    : null;

  // Notifications
  const notifications: NotificationCandidate[] = [];
  for (const w of futureWindows.slice(0, 3)) {
    if (w.startTime > now) {
      notifications.push({
        title: `${w.label} window opening`,
        body: `Peak score ${w.peakScore.toFixed(1)}/10 at ${formatTime(w.peakTime)}. ${w.bestThingToDo.split(',')[0].trim()}.`,
        triggerTime: new Date(w.startTime.getTime() - 10 * 60 * 1000), // 10 min before
        urgency: w.peakScore >= STRONG_THRESHOLD ? 'high' : w.peakScore >= MIXED_THRESHOLD ? 'medium' : 'low',
      });
    }
  }

  return {
    currentStatus,
    nextBestWindow,
    allWindows: futureWindows,
    notifications,
  };
}

function buildWindow(moments: ForecastMoment[], focusType: ForecastType): ForecastWindow {
  const peak = moments.reduce((best, m) => m.score > best.score ? m : best, moments[0]);
  const startTime = moments[0].timestamp;
  const endTime = moments[moments.length - 1].timestamp;
  const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

  const label = peak.score >= STRONG_THRESHOLD ? 'Strong Window' : 'Mixed Window';

  return {
    startTime,
    endTime,
    peakTime: peak.timestamp,
    peakScore: peak.score,
    label,
    durationMinutes,
    summary: peak.summary,
    bestThingToDo: peak.bestThingToDo,
    bestThingToAvoid: peak.bestThingToAvoid,
    supportiveTags: peak.supportiveTags,
    cautionTags: peak.cautionTags,
    galacticSignatureAtPeak: {
      cycleDay: peak.cycleDay,
      dayLord: peak.dayLord,
      hourLord: peak.hourLord,
      minuteLord: peak.minuteLord,
      pulseLord: peak.pulseLord,
    },
  };
}

// ── Formatting Helpers ──

function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

function formatTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

function getStatusColor(status: 'strong' | 'mixed' | 'weak'): string {
  switch (status) {
    case 'strong': return '#F5A623';
    case 'mixed': return '#9B6FF6';
    case 'weak': return '#6b7280';
  }
}

function getStrengthColor(score: number): string {
  if (score >= STRONG_THRESHOLD) return '#F5A623';
  if (score >= MIXED_THRESHOLD) return '#9B6FF6';
  return '#6b7280';
}

// ── Copy Button ──

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
      title={copied ? 'Copied!' : 'Copy'}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-text-muted" />}
    </button>
  );
}

// ── Main Component ──

export default function GalacticForecastPage() {
  const { profile } = useAuthStore();
  const [forecastType, setForecastType] = useState<ForecastType>('General');
  const [horizonHours, setHorizonHours] = useState(12);
  const [expandedWindowIndex, setExpandedWindowIndex] = useState<number | null>(null);

  if (!profile?.birth_date || !profile?.latitude) {
    return (
      <PaywallGate feature="galactic_forecast">
        <BirthDataPrompt message="Add your birth data to see your personalized timing forecast." />
      </PaywallGate>
    );
  }

  // Compute forecast using useMemo — recomputes when type or horizon changes
  const forecast = useMemo<ForecastResult | null>(() => {
    try {
      return forecastWindows(forecastType, horizonHours);
    } catch (e) {
      console.warn('Forecast error:', e);
      return null;
    }
  }, [forecastType, horizonHours]);

  const handleToggleExpand = useCallback((index: number) => {
    setExpandedWindowIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <PaywallGate feature="galactic_forecast">
    <div className="max-w-3xl mx-auto">
      <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to Readings
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-text-primary">Galactic Forecast</h1>
      </div>

      {/* Forecast Type Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {FORECAST_TYPES.map((ft) => {
          const isActive = ft.key === forecastType;
          return (
            <button
              key={ft.key}
              onClick={() => setForecastType(ft.key)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
                isActive
                  ? 'bg-accent-primary/20 border-accent-primary text-accent-primary'
                  : 'bg-bg-tertiary border-border-primary text-text-tertiary hover:border-accent-primary/40'
              }`}
            >
              {ft.label}
            </button>
          );
        })}
      </div>

      {/* Horizon Selector */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs text-text-muted mr-1">Horizon:</span>
        {HORIZON_OPTIONS.map((opt) => {
          const isActive = opt.hours === horizonHours;
          return (
            <button
              key={opt.hours}
              onClick={() => setHorizonHours(opt.hours)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-accent-primary/20 text-accent-primary'
                  : 'bg-bg-tertiary text-text-tertiary'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Loading / Empty State */}
      {!forecast ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-t-accent-primary border-r-transparent border-b-transparent border-l-transparent animate-spin mb-4" />
          <p className="text-text-muted text-sm">Computing forecast...</p>
        </div>
      ) : (
        <>
          {/* Current Status Card */}
          <CurrentStatusCard status={forecast.currentStatus} />

          {/* Next Best Window Card */}
          {forecast.nextBestWindow && (
            <NextBestWindowCard forecastWin={forecast.nextBestWindow} />
          )}

          {/* Upcoming Windows Timeline */}
          {forecast.allWindows.length > 0 ? (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Upcoming Windows</h3>
              {forecast.allWindows.map((forecastWin, index) => (
                <WindowTimelineItem
                  key={index}
                  forecastWin={forecastWin}
                  isExpanded={expandedWindowIndex === index}
                  onToggle={() => handleToggleExpand(index)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-tertiary text-sm">
                No strong windows detected in the next {horizonHours} hours.
              </p>
              <p className="text-text-muted text-xs mt-2">
                Try a different forecast type or extend the horizon.
              </p>
            </div>
          )}

          {/* Notification Preview */}
          {forecast.notifications.length > 0 && (
            <NotificationPreview notifications={forecast.notifications} />
          )}
        </>
      )}
    </div>
    </PaywallGate>
  );
}

// ── Current Status Card ──

function CurrentStatusCard({ status }: { status: CurrentWindowStatus }) {
  const color = getStatusColor(status.status);
  const statusEmoji = status.status === 'strong' ? '⭐' : status.status === 'mixed' ? '⚡' : '⏸';
  const statusLabel = status.status === 'strong'
    ? 'Strong Window'
    : status.status === 'mixed'
      ? 'Mixed Timing'
      : 'Quiet Period';

  return (
    <div
      className="rounded-2xl border overflow-hidden mb-4"
      style={{ borderColor: `${color}66` }}
    >
      <div
        className="p-5"
        style={{ background: `linear-gradient(135deg, ${color}1F, ${color}08)` }}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: `${color}33`, color }}
          >
            {statusEmoji} {statusLabel}
          </span>
          {status.score > 0 && (
            <span className="text-lg font-bold" style={{ color }}>
              {status.score.toFixed(1)}/10
            </span>
          )}
        </div>
        <h3 className="text-sm font-semibold text-text-primary mb-1">{status.label}</h3>
        {status.activeWindow && (
          <p className="text-xs text-text-tertiary">
            Ends at {formatTime(status.activeWindow.endTime)}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Next Best Window Card ──

function NextBestWindowCard({ forecastWin }: { forecastWin: ForecastWindow }) {
  const strengthColor = getStrengthColor(forecastWin.peakScore);
  const goldColor = '#F5A623';

  return (
    <div
      className="rounded-2xl border overflow-hidden mb-6"
      style={{ borderColor: `${goldColor}66` }}
    >
      <div
        className="p-5"
        style={{ background: `linear-gradient(135deg, ${goldColor}26, ${goldColor}08)` }}
      >
        <h3 className="text-base font-bold mb-1" style={{ color: goldColor }}>
          Next {forecastWin.label}
        </h3>

        <p className="text-xl font-bold text-text-primary mb-2">
          {formatTimeRange(forecastWin.startTime, forecastWin.endTime)}
        </p>

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-tertiary">
            Peak at {formatTime(forecastWin.peakTime)}
          </span>
          <span className="text-base font-bold" style={{ color: strengthColor }}>
            {forecastWin.peakScore.toFixed(1)}
          </span>
        </div>

        {/* Strength bar */}
        <div className="h-1.5 bg-white/[0.08] rounded-full mb-4 overflow-hidden">
          <div
            className="h-1.5 rounded-full transition-all"
            style={{
              width: `${Math.min((forecastWin.peakScore / 10) * 100, 100)}%`,
              backgroundColor: strengthColor,
            }}
          />
        </div>

        <p className="text-text-secondary text-sm mb-4">{forecastWin.bestThingToDo}</p>

        {/* Supportive Tags */}
        {forecastWin.supportiveTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {forecastWin.supportiveTags.slice(0, 4).map((tag, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-full text-[10px] font-medium"
                style={{ backgroundColor: `${goldColor}1F`, color: goldColor }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Galactic Signature at Peak */}
        <p className="text-[10px] text-text-muted mt-1">
          {forecastWin.galacticSignatureAtPeak.cycleDay}{'•'}{' '}
          {forecastWin.galacticSignatureAtPeak.hourLord} Hour {'•'}{' '}
          {forecastWin.galacticSignatureAtPeak.minuteLord} Minute
        </p>
      </div>
    </div>
  );
}

// ── Window Timeline Item ──

function WindowTimelineItem({
  forecastWin,
  isExpanded,
  onToggle,
}: {
  forecastWin: ForecastWindow;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const strengthColor = getStrengthColor(forecastWin.peakScore);

  return (
    <button
      onClick={onToggle}
      className="w-full text-left rounded-2xl border bg-bg-card p-4 mb-2 transition-all"
      style={{ borderColor: `${strengthColor}4D` }}
    >
      <div className="flex items-stretch gap-3">
        {/* Time column */}
        <div className="w-14 flex flex-col items-center justify-center">
          <span className="text-[11px] font-semibold text-text-secondary">{formatTime(forecastWin.startTime)}</span>
          <span className="text-[10px] text-text-muted">{'│'}</span>
          <span className="text-[11px] text-text-tertiary">{formatTime(forecastWin.endTime)}</span>
        </div>

        {/* Strength bar */}
        <div className="w-1.5 py-0.5">
          <div className="h-full w-1.5 rounded-full relative" style={{ backgroundColor: `${strengthColor}4D` }}>
            <div
              className="absolute bottom-0 w-1.5 rounded-full"
              style={{
                height: `${Math.min((forecastWin.peakScore / 10) * 100, 100)}%`,
                backgroundColor: `${strengthColor}99`,
              }}
            />
          </div>
        </div>

        {/* Content column */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold" style={{ color: strengthColor }}>{forecastWin.label}</span>
            <span className="text-sm font-bold" style={{ color: strengthColor }}>{forecastWin.peakScore.toFixed(1)}</span>
          </div>
          <p className={`text-xs text-text-tertiary mb-1 ${isExpanded ? '' : 'line-clamp-2'}`}>
            {forecastWin.summary}
          </p>
          <span className="text-[10px] text-text-muted">{forecastWin.durationMinutes} min</span>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-border-primary">
          <div className="mb-3">
            <h4 className="text-[11px] font-semibold text-text-muted mb-1 mt-2">Best Thing To Do</h4>
            <p className="text-xs text-text-secondary">{forecastWin.bestThingToDo}</p>
          </div>

          <div className="mb-3">
            <h4 className="text-[11px] font-semibold text-text-muted mb-1">Best Thing To Avoid</h4>
            <p className="text-xs text-text-secondary">{forecastWin.bestThingToAvoid}</p>
          </div>

          <CopyBtn text={`Best Thing To Do: ${forecastWin.bestThingToDo}\n\nBest Thing To Avoid: ${forecastWin.bestThingToAvoid}`} />

          {forecastWin.supportiveTags.length > 0 && (
            <div className="mt-3">
              <h4 className="text-[11px] font-semibold text-text-muted mb-1">Supportive</h4>
              <div className="flex flex-wrap gap-1">
                {forecastWin.supportiveTags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {forecastWin.cautionTags.length > 0 && (
            <div className="mt-3">
              <h4 className="text-[11px] font-semibold text-text-muted mb-1">Caution</h4>
              <div className="flex flex-wrap gap-1">
                {forecastWin.cautionTags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-[10px] text-text-muted mt-3 text-center">
            {forecastWin.galacticSignatureAtPeak.cycleDay} {'•'}{' '}
            {forecastWin.galacticSignatureAtPeak.dayLord} Day {'•'}{' '}
            {forecastWin.galacticSignatureAtPeak.hourLord} Hour {'•'}{' '}
            {forecastWin.galacticSignatureAtPeak.minuteLord} Min {'•'}{' '}
            {forecastWin.galacticSignatureAtPeak.pulseLord} Pulse
          </p>
        </div>
      )}
    </button>
  );
}

// ── Notification Preview ──

function NotificationPreview({ notifications }: { notifications: NotificationCandidate[] }) {
  const shown = notifications.slice(0, 3);

  const urgencyColor = (urgency: string) =>
    urgency === 'high' ? '#F5A623' : urgency === 'medium' ? '#9B6FF6' : '#6b7280';

  return (
    <div className="mt-4 mb-8">
      <h3 className="text-sm font-semibold text-text-primary mb-3">Upcoming Notifications</h3>
      {shown.map((notif, i) => {
        const color = urgencyColor(notif.urgency);
        return (
          <div
            key={i}
            className="rounded-xl border bg-bg-card p-3 mb-2"
            style={{ borderColor: `${color}4D` }}
          >
            <div className="flex items-start gap-2">
              <span
                className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-text-primary mb-0.5">{notif.title}</h4>
                <p className="text-[11px] text-text-tertiary mb-1">{notif.body}</p>
                <span className="text-[10px] text-text-muted">
                  Fires at {formatTime(notif.triggerTime)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
