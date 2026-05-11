'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { Bell, UserPlus, Heart, MessageCircle, Star, Check, CheckCheck } from 'lucide-react';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  data: any;
  is_read: boolean;
  created_at: string;
  actor_id: string | null;
  actor_profile?: {
    display_name: string;
    avatar_url: string | null;
  };
}

const NOTIFICATION_ICONS: Record<string, any> = {
  friend_request: UserPlus,
  friend_accepted: UserPlus,
  reaction: Heart,
  comment: MessageCircle,
  mention: Star,
  cosmic_alert: Star,
};

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  async function loadNotifications() {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data && data.length > 0) {
      // Load actor profiles
      const actorIds = Array.from(new Set(data.filter(n => n.actor_id).map(n => n.actor_id)));
      let actorProfiles: Record<string, any> = {};

      if (actorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', actorIds);
        if (profiles) {
          profiles.forEach((p: any) => { actorProfiles[p.id] = p; });
        }
      }

      setNotifications(data.map(n => ({
        ...n,
        actor_profile: n.actor_id ? actorProfiles[n.actor_id] : undefined,
      })));
    } else {
      setNotifications([]);
    }
    setLoading(false);
  }

  async function markAllRead() {
    if (!user) return;
    const supabase = createClient();
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  async function markOneRead(id: string) {
    const supabase = createClient();
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  }

  function getNotificationLink(n: Notification): string {
    switch (n.type) {
      case 'friend_request':
      case 'friend_accepted':
        return n.actor_id ? `/user/${n.actor_id}` : '/friends';
      case 'reaction':
      case 'comment':
      case 'mention':
        return '/feed';
      case 'cosmic_alert':
        return '/readings';
      default:
        return '#';
    }
  }

  function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto card text-center py-12">
        <p className="text-text-muted">Please sign in to see notifications</p>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-3">
          <Bell className="w-7 h-7 text-accent-primary" />
          Notifications
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-accent-primary/20 text-accent-primary text-xs font-medium">
              {unreadCount}
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-ghost text-sm flex items-center gap-1.5 text-accent-primary">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <LoadingCosmic label="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <div className="card text-center py-12">
          <Bell className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted mb-1">No notifications yet</p>
          <p className="text-xs text-text-muted">
            Friend requests, reactions, and cosmic alerts will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map(n => {
            const Icon = NOTIFICATION_ICONS[n.type] || Bell;
            const link = getNotificationLink(n);
            return (
              <Link
                key={n.id}
                href={link}
                onClick={() => !n.is_read && markOneRead(n.id)}
                className={`flex items-start gap-3 p-4 rounded-xl transition-colors ${
                  n.is_read
                    ? 'bg-bg-card hover:bg-bg-card-hover'
                    : 'bg-accent-primary/5 border border-accent-primary/20 hover:bg-accent-primary/10'
                }`}
              >
                {/* Avatar or icon */}
                <div className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center flex-shrink-0">
                  {n.actor_profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={n.actor_profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <Icon className="w-5 h-5 text-accent-primary" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.is_read ? 'text-text-secondary' : 'text-text-primary font-medium'}`}>
                    {n.title}
                  </p>
                  {n.body && (
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{n.body}</p>
                  )}
                  <p className="text-[10px] text-text-muted mt-1">{timeAgo(n.created_at)}</p>
                </div>

                {!n.is_read && (
                  <div className="w-2 h-2 rounded-full bg-accent-primary flex-shrink-0 mt-2" />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
