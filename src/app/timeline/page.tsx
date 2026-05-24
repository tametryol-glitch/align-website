'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Clock, ArrowLeft, Heart, MessageCircle, Users, Star, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

interface TimelineEvent {
  id: string;
  type: 'friend_added' | 'compatibility_check' | 'message_milestone' | 'cosmic_event' | 'group_joined';
  description: string;
  created_at: string;
  metadata?: Record<string, any>;
}

const EVENT_ICONS: Record<string, { icon: string; color: string }> = {
  friend_added: { icon: '👋', color: '#22c55e' },
  compatibility_check: { icon: '💜', color: '#9B6FF6' },
  message_milestone: { icon: '💬', color: '#3b82f6' },
  cosmic_event: { icon: '✨', color: '#F5A623' },
  group_joined: { icon: '👥', color: '#06b6d4' },
};

export default function TimelinePage() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<p className="text-text-muted text-sm text-center py-12">{t('common.loading')}</p>}>
      <TimelineContent />
    </Suspense>
  );
}

function TimelineContent() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const friendId = searchParams.get('friendId');
  const friendName = searchParams.get('friendName') || 'Friend';

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, [friendId]);

  async function loadTimeline() {
    if (!user?.id || !friendId) {
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from('relationship_timeline')
      .select('*')
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) setEvents(data);
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/friends" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> {t('friends.tabs.friends')}
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Your Journey</h1>
          <p className="text-text-tertiary text-sm">with {friendName}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-text-muted text-sm text-center py-12">{t('common.loading')}</p>
      ) : events.length === 0 ? (
        <div className="card text-center py-16">
          <span className="text-5xl block mb-4">✨</span>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Your story is just beginning</h3>
          <p className="text-sm text-text-muted">
            Milestones with {friendName} will appear here as your cosmic connection grows.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border-primary" />

          <div className="space-y-6">
            {events.map((event) => {
              const { icon, color } = EVENT_ICONS[event.type] || EVENT_ICONS.cosmic_event;
              return (
                <div key={event.id} className="relative flex items-start gap-4 pl-2">
                  {/* Timeline dot */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm z-10 shrink-0"
                    style={{ backgroundColor: `${color}20`, border: `2px solid ${color}` }}
                  >
                    {icon}
                  </div>

                  {/* Content */}
                  <div className="card flex-1 py-3">
                    <p className="text-sm text-text-primary">{event.description}</p>
                    <p className="text-[10px] text-text-muted mt-1">
                      {new Date(event.created_at).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
