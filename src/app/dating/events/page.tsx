'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import {
  getUpcomingEvents, getMyEvents, registerForEvent, cancelRegistration,
  EVENT_TYPE_CONFIG, type DatingEvent,
} from '@/lib/datingEventsService';
import { ArrowLeft, Calendar, Users, CheckCircle } from 'lucide-react';
import Link from 'next/link';

type Tab = 'upcoming' | 'my_events';

function formatEventTime(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const dateStr = s.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = `${s.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} – ${e.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
  return `${dateStr}, ${timeStr}`;
}

export default function DatingEventsPage() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuthStore();
  const [tab, setTab] = useState<Tab>('upcoming');
  const [upcoming, setUpcoming] = useState<DatingEvent[]>([]);
  const [myEvents, setMyEvents] = useState<DatingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const [u, m] = await Promise.all([
      getUpcomingEvents(user.id),
      getMyEvents(user.id),
    ]);
    setUpcoming(u);
    setMyEvents(m);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && user) loadEvents();
  }, [authLoading, user, loadEvents]);

  const handleRegister = async (eventId: string) => {
    if (!user?.id) return;
    setActioningId(eventId);
    const result = await registerForEvent(user.id, eventId);
    if (result.success) {
      await loadEvents();
    }
    setActioningId(null);
  };

  const handleCancel = async (eventId: string) => {
    if (!user?.id) return;
    setActioningId(eventId);
    await cancelRegistration(user.id, eventId);
    await loadEvents();
    setActioningId(null);
  };

  const events = tab === 'upcoming' ? upcoming : myEvents;

  return (
    <div className="max-w-2xl mx-auto" style={{ minHeight: '100vh' }}>
      <Link href="/dating" className="inline-flex items-center gap-1 text-sm text-accent-primary mb-4">
        <ArrowLeft size={16} /> {t('dating.events.backToDating')}
      </Link>

      <div className="text-center mb-6">
        <Calendar size={28} color="#8B5CF6" className="mx-auto mb-2" />
        <h1 className="text-2xl font-bold text-white mb-1">{t('dating.events.title')}</h1>
        <p className="text-sm text-text-tertiary max-w-xs mx-auto">
          {t('dating.events.subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['upcoming', 'my_events'] as const).map(tabKey => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{
              backgroundColor: tab === tabKey ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
              color: tab === tabKey ? '#C4B5FD' : '#A8B0C0',
              border: `1px solid ${tab === tabKey ? 'rgba(139,92,246,0.3)' : 'transparent'}`,
            }}
          >
            {tabKey === 'upcoming' ? t('dating.events.tabs.upcoming') : t('dating.events.tabs.myEvents')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-tertiary text-sm">
            {tab === 'upcoming' ? t('dating.events.noUpcoming') : t('dating.events.noRegistered')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map(event => {
            const typeCfg = EVENT_TYPE_CONFIG[event.event_type] || EVENT_TYPE_CONFIG.custom;
            const isActive = event.status === 'active';
            return (
              <div
                key={event.id}
                className="rounded-2xl p-5 transition-all"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isActive ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{typeCfg.icon}</span>
                    <div>
                      <h3 className="text-white font-semibold">{event.title}</h3>
                      <span
                        className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${typeCfg.color}1A`, color: typeCfg.color }}
                      >
                        {typeCfg.label}
                      </span>
                    </div>
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                      LIVE
                    </span>
                  )}
                </div>

                {event.description && (
                  <p className="text-sm text-text-tertiary mb-3">{event.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-text-muted mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {formatEventTime(event.starts_at, event.ends_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    Max {event.max_participants}
                  </span>
                </div>

                {event.element_filter && (
                  <span
                    className="inline-block text-xs px-2.5 py-1 rounded-full mb-3 font-medium"
                    style={{
                      backgroundColor: 'rgba(245,158,11,0.1)',
                      color: '#F59E0B',
                    }}
                  >
                    {event.element_filter.charAt(0).toUpperCase() + event.element_filter.slice(1)} signs only
                  </span>
                )}

                {event.is_registered ? (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm text-green-400">
                      <CheckCircle size={16} /> {t('dating.events.registered')}
                    </span>
                    <button
                      onClick={() => handleCancel(event.id)}
                      disabled={actioningId === event.id}
                      className="text-xs text-text-muted hover:text-red-400 transition-colors"
                    >
                      {t('dating.events.cancelRegistration')}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleRegister(event.id)}
                    disabled={actioningId === event.id}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                    style={{ background: `linear-gradient(135deg, ${typeCfg.color}, #7C3AED)` }}
                  >
                    {actioningId === event.id ? t('dating.events.registering') : t('dating.events.register')}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
