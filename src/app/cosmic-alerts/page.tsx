'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { api, buildBirthData } from '@/lib/api';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import {
  enrichTransitEvents, CATEGORY_CONFIG, getImportanceLabel, getImportanceColor, timeRelativeLabel,
  type CosmicAlert, type AlertStatus,
} from '@/lib/cosmicAlertService';
import {
  Zap, Calendar, Clock, Star, X, Settings, Lightbulb,
  ArrowRight, AlertTriangle, ChevronDown,
} from 'lucide-react';

// ─── Filter tabs ────────────────────────────────────────────────────

type FilterTab = 'all' | 'active' | 'upcoming';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'upcoming', label: 'Upcoming' },
];

// ─── Importance dots ────────────────────────────────────────────────

function ImportanceDots({ score }: { score: number }) {
  const filled = Math.min(5, Math.ceil(score / 2));
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`inline-block w-1.5 h-1.5 rounded-full ${
            i < filled ? '' : 'bg-gray-700'
          }`}
          style={i < filled ? { backgroundColor: getImportanceColor(score) } : undefined}
        />
      ))}
    </div>
  );
}

// ─── Importance bar color class ─────────────────────────────────────

function importanceBarClass(score: number): string {
  if (score >= 9) return 'bg-red-500';
  if (score >= 7) return 'bg-amber-500';
  if (score >= 5) return 'bg-blue-500';
  return 'bg-gray-600';
}

// ─── Format date nicely ─────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });
  } catch {
    return iso;
  }
}

// ─── Detail Modal ───────────────────────────────────────────────────

function AlertDetailModal({
  alert,
  onClose,
}: {
  alert: CosmicAlert;
  onClose: () => void;
}) {
  const cat = CATEGORY_CONFIG[alert.category] || CATEGORY_CONFIG.general;
  const m = alert.metadata || {} as Record<string, any>;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 my-8 rounded-2xl overflow-hidden bg-bg-primary border border-white/10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Gradient hero header */}
        <div className={`bg-gradient-to-b ${cat.gradient} px-6 py-10 text-center`}>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cat.bgColor} ${cat.color} mb-3`}>
            <span>{cat.emoji}</span> {cat.label}
          </span>
          <h2 className="text-xl font-display font-bold text-white mb-3">{alert.title}</h2>
          <div className="flex items-center justify-center gap-2">
            <ImportanceDots score={alert.importance_score ?? 5} />
            <span className="text-white/70 text-xs font-semibold">
              {getImportanceLabel(alert.importance_score ?? 5)}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Timing Window */}
          <div>
            <h3 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent-primary" /> Timing Window
            </h3>
            <div className="card grid grid-cols-3 divide-x divide-white/10 text-center py-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Start</p>
                <p className="text-xs font-semibold text-text-secondary">{formatDate(alert.start_time ?? '')}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Peak</p>
                <p className="text-xs font-bold text-accent-primary">{formatDate(alert.peak_time ?? '')}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">End</p>
                <p className="text-xs font-semibold text-text-secondary">{formatDate(alert.end_time ?? '')}</p>
              </div>
            </div>
          </div>

          {/* Full Interpretation */}
          {(alert.long_body || alert.short_body) && (
            <div>
              <h3 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-accent-primary" /> Full Interpretation
              </h3>
              <div className="card">
                <p className="text-sm text-text-secondary leading-relaxed">
                  {alert.long_body || alert.short_body}
                </p>
              </div>
            </div>
          )}

          {/* Astrological Details */}
          {(m.transit_planet || m.natal_point || m.aspect_type) && (
            <div>
              <h3 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent-primary" /> Astrological Details
              </h3>
              <div className="card space-y-2">
                {m.transit_planet && (
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Transit</span>
                    <span className="text-text-primary font-semibold">{m.transit_planet} in {m.transit_sign || '?'}</span>
                  </div>
                )}
                {m.natal_point && (
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Natal</span>
                    <span className="text-text-primary font-semibold">{m.natal_point} in {m.natal_sign || '?'}</span>
                  </div>
                )}
                {m.aspect_type && (
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Aspect</span>
                    <span className="text-text-primary font-semibold">{m.aspect_type} (orb: {(m.orb ?? 0).toFixed(1)}°)</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Retrograde</span>
                  <span className="text-text-primary font-semibold">{alert.is_retrograde ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Advice */}
          {alert.action_advice && (
            <div>
              <h3 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" /> Action Advice
              </h3>
              <div className="card border-amber-500/20 bg-amber-500/5">
                <p className="text-sm text-amber-300/90 leading-relaxed">{alert.action_advice}</p>
              </div>
            </div>
          )}

          {/* View Full Transits button */}
          <Link
            href="/readings/transits"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-accent-primary/20 text-accent-primary font-bold text-sm hover:bg-accent-primary/30 transition-colors"
          >
            View Full Transits <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Alert Card ─────────────────────────────────────────────────────

function AlertCard({
  alert,
  onClick,
}: {
  alert: CosmicAlert;
  onClick: () => void;
}) {
  const cat = CATEGORY_CONFIG[alert.category] || CATEGORY_CONFIG.general;
  const score = alert.importance_score ?? 5;
  const isActive = alert.status === 'active';

  return (
    <button
      onClick={onClick}
      className="w-full text-left card flex overflow-hidden hover:border-white/20 transition-colors group"
    >
      {/* Left importance bar */}
      <div className={`w-1 flex-shrink-0 ${importanceBarClass(score)}`} />

      <div className="flex-1 p-4 min-w-0">
        {/* Top row: category badge + time + retrograde */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cat.bgColor} ${cat.color}`}>
              <span>{cat.emoji}</span> {cat.label}
            </span>
            {alert.is_retrograde && (
              <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">&#8478;</span>
            )}
          </div>
          <span className="text-[11px] text-text-muted flex-shrink-0">
            {timeRelativeLabel(alert.peak_time ?? '')}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-text-primary mb-1 group-hover:text-white transition-colors">
          {alert.title}
        </h3>

        {/* Short body */}
        <p className="text-xs text-text-secondary line-clamp-2 mb-2">
          {alert.short_body}
        </p>

        {/* Bottom row: importance dots + active badge */}
        <div className="flex items-center justify-between">
          <ImportanceDots score={score} />
          {isActive && (
            <span className="text-[9px] font-extrabold tracking-wide text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
              ACTIVE
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════════════════════════════════

export default function CosmicAlertsPage() {
  const { profile, isLoading: authLoading } = useAuthStore();
  const [alerts, setAlerts] = useState<CosmicAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [selectedAlert, setSelectedAlert] = useState<CosmicAlert | null>(null);

  const hasBirthData = profile?.birth_date && profile?.birth_time && profile?.latitude;

  useEffect(() => {
    if (authLoading) return;
    if (hasBirthData) loadAlerts();
    else setLoading(false);
  }, [hasBirthData, authLoading]);

  async function loadAlerts() {
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      const data = await api.getTransitEvents({
        birth_data: buildBirthData(profile!),
        start_date: now.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      });
      const raw = data?.events || data || [];
      setAlerts(enrichTransitEvents(raw));
    } catch (err: any) {
      setError(err.message || 'Failed to load cosmic alerts');
    } finally {
      setLoading(false);
    }
  }

  // ── Filtered list ──
  const filtered = useMemo(() => {
    if (filter === 'active') return alerts.filter(a => a.status === 'active');
    if (filter === 'upcoming') return alerts.filter(a => a.status === 'upcoming');
    return alerts;
  }, [alerts, filter]);

  // ── Loading state ──
  if (authLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Header />
        <LoadingCosmic label="Scanning the cosmos..." />
      </div>
    );
  }

  // ── No birth data ──
  if (!hasBirthData) {
    return (
      <div className="max-w-3xl mx-auto">
        <Header />
        <BirthDataPrompt message="We need your birth data to calculate personalized cosmic alerts for your chart." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Header />

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-5">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              filter === tab.key
                ? 'bg-accent-primary/20 border-accent-primary text-accent-primary'
                : 'bg-bg-tertiary border-white/10 text-text-muted hover:text-text-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error ? (
        <div className="card text-center py-8">
          <AlertTriangle className="w-8 h-8 text-gold-primary mx-auto mb-3" />
          <p className="text-sm text-text-muted">{error}</p>
          <button onClick={loadAlerts} className="btn-secondary text-sm mt-4">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        /* Empty state */
        <div className="card text-center py-12">
          <Star className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-40" />
          <p className="text-text-secondary font-semibold mb-1">No major transits detected</p>
          <p className="text-xs text-text-muted">
            {filter !== 'all'
              ? `No ${filter} alerts right now. Try switching to "All".`
              : 'The cosmos is quiet for your chart. Check back as the sky shifts.'}
          </p>
        </div>
      ) : (
        /* Alert cards */
        <div className="space-y-3">
          {filtered.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onClick={() => setSelectedAlert(alert)}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}
    </div>
  );
}

// ─── Header sub-component ───────────────────────────────────────────

function Header() {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-2">
          <Zap className="w-6 h-6 text-accent-primary" />
          Cosmic Weather
        </h1>
        <p className="text-sm text-text-tertiary mt-0.5">Your personalized cosmic forecast</p>
      </div>
      <Link
        href="/settings/cosmic-alerts"
        className="w-9 h-9 flex items-center justify-center rounded-full bg-bg-tertiary border border-white/10 text-text-muted hover:text-text-primary transition-colors"
      >
        <Settings className="w-4 h-4" />
      </Link>
    </div>
  );
}
