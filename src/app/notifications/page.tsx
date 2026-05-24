'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { Bell, UserPlus, Heart, MessageCircle, Star, Check, CheckCheck, Zap, Megaphone, Filter } from 'lucide-react';
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

interface NotificationGroup {
  id: string;
  type: string;
  notifications: Notification[];
  latestAt: string;
  isRead: boolean;
}

type TabFilter = 'all' | 'social' | 'cosmic' | 'system';

const TYPE_CATEGORIES: Record<string, 'social' | 'cosmic' | 'system'> = {
  friend_request: 'social',
  friend_accepted: 'social',
  reaction: 'social',
  like: 'social',
  comment: 'social',
  mention: 'social',
  message: 'social',
  new_message: 'social',
  follow: 'social',
  story_reaction: 'social',
  cosmic_alert: 'cosmic',
  transit: 'cosmic',
  transit_alert: 'cosmic',
  moon_phase: 'cosmic',
  retrograde: 'cosmic',
  eclipse: 'cosmic',
  cosmic_match_ready: 'cosmic',
  system: 'system',
  announcement: 'system',
  account: 'system',
  subscription: 'system',
};

const NOTIFICATION_ICONS: Record<string, any> = {
  friend_request: UserPlus,
  friend_accepted: UserPlus,
  reaction: Heart,
  like: Heart,
  comment: MessageCircle,
  mention: Star,
  message: MessageCircle,
  new_message: MessageCircle,
  follow: UserPlus,
  story_reaction: Heart,
  cosmic_alert: Zap,
  transit: Zap,
  transit_alert: Zap,
  moon_phase: Star,
  retrograde: Zap,
  eclipse: Star,
  cosmic_match_ready: Star,
  system: Bell,
  announcement: Megaphone,
  account: Bell,
  subscription: Bell,
};

const TABS: { key: TabFilter; labelKey: string }[] = [
  { key: 'all', labelKey: 'notifications.filters.all' },
  { key: 'social', labelKey: 'notifications.filters.social' },
  { key: 'cosmic', labelKey: 'notifications.filters.cosmic' },
  { key: 'system', labelKey: 'notifications.filters.system' },
];

const EMPTY_STATES: Record<TabFilter, { icon: any; titleKey: string; subtitleKey: string }> = {
  all: {
    icon: Bell,
    titleKey: 'notifications.empty.all',
    subtitleKey: 'notifications.empty.allHint',
  },
  social: {
    icon: Heart,
    titleKey: 'notifications.empty.social',
    subtitleKey: 'notifications.empty.socialHint',
  },
  cosmic: {
    icon: Zap,
    titleKey: 'notifications.empty.cosmic',
    subtitleKey: 'notifications.empty.cosmicHint',
  },
  system: {
    icon: Megaphone,
    titleKey: 'notifications.empty.system',
    subtitleKey: 'notifications.empty.systemHint',
  },
};

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

function groupNotifications(notifications: Notification[]): NotificationGroup[] {
  const groups: NotificationGroup[] = [];
  const used = new Set<string>();

  for (let i = 0; i < notifications.length; i++) {
    if (used.has(notifications[i].id)) continue;

    const current = notifications[i];
    const targetId = current.data?.post_id || current.data?.target_id;

    if (!targetId) {
      groups.push({
        id: current.id,
        type: current.type,
        notifications: [current],
        latestAt: current.created_at,
        isRead: current.is_read,
      });
      used.add(current.id);
      continue;
    }

    const grouped: Notification[] = [current];
    used.add(current.id);
    const currentTime = new Date(current.created_at).getTime();

    for (let j = i + 1; j < notifications.length; j++) {
      if (used.has(notifications[j].id)) continue;
      const candidate = notifications[j];
      if (candidate.type !== current.type) continue;

      const candidateTarget = candidate.data?.post_id || candidate.data?.target_id;
      if (candidateTarget !== targetId) continue;

      const candidateTime = new Date(candidate.created_at).getTime();
      if (Math.abs(currentTime - candidateTime) > 3600000) continue;

      grouped.push(candidate);
      used.add(candidate.id);
    }

    groups.push({
      id: current.id,
      type: current.type,
      notifications: grouped,
      latestAt: current.created_at,
      isRead: grouped.every(n => n.is_read),
    });
  }

  return groups;
}

function getGroupTitle(group: NotificationGroup): string {
  if (group.notifications.length === 1) {
    return group.notifications[0].title;
  }

  const actors = group.notifications
    .map(n => n.actor_profile?.display_name)
    .filter(Boolean);
  const uniqueActors = Array.from(new Set(actors));

  if (group.type === 'reaction') {
    if (uniqueActors.length === 1) {
      return `${uniqueActors[0]} reacted to your post`;
    }
    if (uniqueActors.length === 2) {
      return `${uniqueActors[0]} and ${uniqueActors[1]} reacted to your post`;
    }
    return `${uniqueActors[0]}, ${uniqueActors[1]}, and ${uniqueActors.length - 2} others reacted to your post`;
  }

  if (group.type === 'comment') {
    return `${group.notifications.length} new comments on your post`;
  }

  if (uniqueActors.length <= 2) {
    return `${uniqueActors.join(' and ')} — ${group.notifications[0].title}`;
  }
  return `${uniqueActors[0]}, ${uniqueActors[1]}, and ${uniqueActors.length - 2} others`;
}

function getNotificationLink(n: Notification): string {
  switch (n.type) {
    case 'friend_request':
    case 'friend_accepted':
      return n.actor_id ? `/user/${n.actor_id}` : '/friends';
    case 'follow':
      return n.actor_id ? `/user/${n.actor_id}` : '/friends';
    case 'reaction':
    case 'like':
    case 'comment':
    case 'mention':
    case 'story_reaction':
      return '/feed';
    case 'message':
    case 'new_message':
      return n.data?.conversation_id ? `/messages/${n.data.conversation_id}` : '/messages';
    case 'cosmic_alert':
    case 'transit':
    case 'transit_alert':
    case 'moon_phase':
    case 'retrograde':
    case 'eclipse':
      return '/readings';
    case 'cosmic_match_ready':
      return n.data?.match_id ? `/compatibility/${n.data.match_id}` : '/compatibility';
    case 'system':
      return '/dashboard';
    case 'announcement':
      return '/settings';
    case 'account':
    case 'subscription':
      return '/settings/account';
    default:
      return '/dashboard';
  }
}

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (data && data.length > 0) {
      const actorIds = Array.from(new Set(
        data
          .map(n => n.actor_id || n.data?.from_user_id || n.data?.sender_id || n.data?.user_id)
          .filter(Boolean)
      ));
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

      setNotifications(data.map(n => {
        const resolvedActorId = n.actor_id || n.data?.from_user_id || n.data?.sender_id || n.data?.user_id;
        return {
          ...n,
          actor_id: resolvedActorId || n.actor_id,
          actor_profile: resolvedActorId ? actorProfiles[resolvedActorId] : undefined,
        };
      }));
    } else {
      setNotifications([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) loadNotifications();
  }, [user, loadNotifications]);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const newNotification = payload.new as Notification;

          if (newNotification.actor_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, display_name, avatar_url')
              .eq('id', newNotification.actor_id)
              .single();
            if (profile) {
              newNotification.actor_profile = profile;
            }
          }

          setNotifications(prev => [newNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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

  async function markGroupRead(group: NotificationGroup) {
    const supabase = createClient();
    const ids = group.notifications.filter(n => !n.is_read).map(n => n.id);
    if (ids.length === 0) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', ids);
    setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, is_read: true } : n));
  }

  function toggleGroupExpand(groupId: string) {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto card text-center py-12">
        <p className="text-text-muted">{t('auth.signInToAccess')}</p>
      </div>
    );
  }

  const filteredNotifications = activeTab === 'all'
    ? notifications
    : notifications.filter(n => TYPE_CATEGORIES[n.type] === activeTab);

  const groups = groupNotifications(filteredNotifications);
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const emptyState = EMPTY_STATES[activeTab];
  const EmptyIcon = emptyState.icon;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-3">
          <Bell className="w-7 h-7 text-accent-primary" />
          {t('notifications.title')}
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-accent-primary/20 text-accent-primary text-xs font-medium">
              {unreadCount}
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-ghost text-sm flex items-center gap-1.5 text-accent-primary">
            <CheckCheck className="w-4 h-4" /> {t('notifications.markAllRead')}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-accent-primary/20 text-accent-primary'
                : 'bg-bg-tertiary text-text-muted hover:text-text-secondary'
            }`}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingCosmic label={t('common.loading')} />
      ) : groups.length === 0 ? (
        <div className="card text-center py-12">
          <EmptyIcon className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted mb-1">{t(emptyState.titleKey)}</p>
          <p className="text-xs text-text-muted">{t(emptyState.subtitleKey)}</p>
        </div>
      ) : (
        <div className="space-y-1">
          {groups.map(group => {
            const isSingle = group.notifications.length === 1;
            const isExpanded = expandedGroups.has(group.id);
            const firstNotification = group.notifications[0];
            const Icon = NOTIFICATION_ICONS[group.type] || Bell;

            if (isSingle) {
              const n = firstNotification;
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
                  <div className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center flex-shrink-0">
                    {n.actor_profile?.avatar_url ? (
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
            }

            return (
              <div key={group.id} className="rounded-xl overflow-hidden">
                <button
                  onClick={() => {
                    toggleGroupExpand(group.id);
                    if (!group.isRead) markGroupRead(group);
                  }}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl transition-colors text-left ${
                    group.isRead
                      ? 'bg-bg-card hover:bg-bg-card-hover'
                      : 'bg-accent-primary/5 border border-accent-primary/20 hover:bg-accent-primary/10'
                  }`}
                >
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center">
                      {firstNotification.actor_profile?.avatar_url ? (
                        <img src={firstNotification.actor_profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <Icon className="w-5 h-5 text-accent-primary" />
                      )}
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent-primary text-white text-[10px] font-bold flex items-center justify-center">
                      +{group.notifications.length - 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${group.isRead ? 'text-text-secondary' : 'text-text-primary font-medium'}`}>
                      {getGroupTitle(group)}
                    </p>
                    <p className="text-[10px] text-text-muted mt-1">
                      {timeAgo(group.latestAt)} · {group.notifications.length} notifications
                    </p>
                  </div>
                  {!group.isRead && (
                    <div className="w-2 h-2 rounded-full bg-accent-primary flex-shrink-0 mt-2" />
                  )}
                </button>

                {isExpanded && (
                  <div className="ml-6 border-l border-border-primary pl-4 mt-1 space-y-1">
                    {group.notifications.map(n => {
                      const link = getNotificationLink(n);
                      return (
                        <Link
                          key={n.id}
                          href={link}
                          className="flex items-start gap-3 p-3 rounded-lg transition-colors bg-bg-card hover:bg-bg-card-hover"
                        >
                          <div className="w-8 h-8 rounded-full bg-accent-muted flex items-center justify-center flex-shrink-0">
                            {n.actor_profile?.avatar_url ? (
                              <img src={n.actor_profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <Icon className="w-4 h-4 text-accent-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-text-secondary">{n.title}</p>
                            {n.body && (
                              <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">{n.body}</p>
                            )}
                            <p className="text-[10px] text-text-muted mt-0.5">{timeAgo(n.created_at)}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
