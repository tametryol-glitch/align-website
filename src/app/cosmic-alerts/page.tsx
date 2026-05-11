'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { api, buildBirthData } from '@/lib/api';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { Zap, Calendar, AlertTriangle, Star, Moon, Sun } from 'lucide-react';

interface TransitEvent {
  date: string;
  transiting_planet: string;
  natal_planet: string;
  aspect_name: string;
  orb: number;
  is_retrograde: boolean;
  transit_sign: string;
  natal_sign: string;
}

const INTENSITY_COLORS: Record<string, string> = {
  high: 'text-red-400 bg-red-400/10',
  medium: 'text-gold-primary bg-gold-primary/10',
  low: 'text-green-400 bg-green-400/10',
};

const TYPE_ICONS: Record<string, any> = {
  conjunction: Sun,
  opposition: AlertTriangle,
  trine: Star,
  square: Zap,
  sextile: Moon,
};

export default function CosmicAlertsPage() {
  const { profile, isLoading: authLoading } = useAuthStore();
  const [events, setEvents] = useState<TransitEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasBirthData = profile?.birth_date && profile?.birth_time && profile?.latitude;

  useEffect(() => {
    if (authLoading) return; // Wait for auth/profile to finish loading
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
      setEvents(data?.events || data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load cosmic alerts');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-display font-bold text-text-primary mb-6 flex items-center gap-3">
          <Zap className="w-7 h-7 text-accent-primary" />
          Cosmic Alerts
        </h1>
        <LoadingCosmic label="Loading cosmic alerts..." />
      </div>
    );
  }

  if (!hasBirthData) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-display font-bold text-text-primary mb-6 flex items-center gap-3">
          <Zap className="w-7 h-7 text-accent-primary" />
          Cosmic Alerts
        </h1>
        <BirthDataPrompt message="We need your birth data to calculate upcoming transit alerts for your chart." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-text-primary mb-2 flex items-center gap-3">
        <Zap className="w-7 h-7 text-accent-primary" />
        Cosmic Alerts
      </h1>
      <p className="text-sm text-text-tertiary mb-6">
        Upcoming transits hitting your natal chart in the next 30 days
      </p>

      {loading ? (
        <LoadingCosmic label="Scanning the sky..." />
      ) : error ? (
        <div className="card text-center py-8">
          <AlertTriangle className="w-8 h-8 text-gold-primary mx-auto mb-3" />
          <p className="text-sm text-text-muted">{error}</p>
          <button onClick={loadAlerts} className="btn-secondary text-sm mt-4">Retry</button>
        </div>
      ) : events.length === 0 ? (
        <div className="card text-center py-10">
          <Star className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">No major transits in the next 30 days</p>
          <p className="text-xs text-text-muted mt-1">Check back later as the sky shifts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event, i) => {
            const orbIntensity = event.orb < 1 ? 'high' : event.orb < 3 ? 'medium' : 'low';
            const Icon = TYPE_ICONS[event.aspect_name?.toLowerCase()] || Zap;
            const eventDate = new Date(event.date + 'T00:00:00');
            return (
              <div key={i} className="card">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${INTENSITY_COLORS[orbIntensity]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-text-primary">
                        {event.transiting_planet} {event.aspect_name} {event.natal_planet}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${INTENSITY_COLORS[orbIntensity]}`}>
                        {event.orb.toFixed(1)}° orb
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mb-2">
                      {event.transiting_planet} in {event.transit_sign} {event.aspect_name.toLowerCase()} natal {event.natal_planet} in {event.natal_sign}
                      {event.is_retrograde ? ' (retrograde)' : ''}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {isNaN(eventDate.getTime()) ? event.date : eventDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
