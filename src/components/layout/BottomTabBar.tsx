'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useMessagesStore } from '@/stores/messagesStore';
import { useFriendsStore } from '@/stores/friendsStore';
import {
  Home, Newspaper, Sun, MessageCircle, Menu, X,
  Search, Globe, Compass, Star, Zap, Sparkles,
  Users, Bell, BookOpen, CreditCard, User, Settings,
  Mail, Video, Heart, MessagesSquare,
} from 'lucide-react';

const TABS = [
  { href: '/dashboard', labelKey: 'components.sidebar.home', icon: Home },
  { href: '/feed', labelKey: 'components.sidebar.feed', icon: Newspaper },
  { href: '/chart', labelKey: 'components.sidebar.chart', icon: Sun },
  { href: '/messages', labelKey: 'components.sidebar.chat', icon: MessageCircle },
  { href: '/dating', labelKey: 'components.sidebar.dating', icon: Heart },
  { href: '#more', labelKey: 'components.sidebar.more', icon: Menu },
];

const MORE_ITEMS = [
  { href: '/discover', labelKey: 'components.sidebar.discover', icon: Search },
  { href: '/world-echo', labelKey: 'components.sidebar.worldEcho', icon: Compass },
  { href: '/cosmic-alerts', labelKey: 'components.sidebar.cosmicWeather', icon: Zap },
  { href: '/readings', labelKey: 'components.sidebar.readings', icon: Sparkles },
  { href: '/cosmic-video', labelKey: 'components.sidebar.videoCreator', icon: Video },
  { href: '/communities', labelKey: 'components.sidebar.communities', icon: MessagesSquare },
  { href: '/friends', labelKey: 'components.sidebar.friends', icon: Users },
  { href: '/notifications', labelKey: 'components.sidebar.notifications', icon: Bell },
  { href: '/ai', labelKey: 'components.sidebar.aiAstrologer', icon: MessageCircle },
  { href: '/courses', labelKey: 'components.sidebar.learn', icon: BookOpen },
  { href: '/pricing', labelKey: 'components.sidebar.pricing', icon: CreditCard },
  { href: '/profile', labelKey: 'components.sidebar.profile', icon: User },
  { href: '/settings', labelKey: 'components.sidebar.settings', icon: Settings },
];

export function BottomTabBar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { profile } = useAuthStore();
  const totalUnread = useMessagesStore((s) => s.totalUnreadMessages);
  const pendingFriendRequests = useFriendsStore((s) => s.pendingRequestCount);
  const [showMore, setShowMore] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShowMore(false);
  }, [pathname]);

  useEffect(() => {
    if (!showMore) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMore]);

  const isMoreActive = MORE_ITEMS.some(
    item => pathname === item.href || pathname.startsWith(item.href + '/')
  );

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            ref={menuRef}
            className="absolute bottom-[72px] left-0 right-0 bg-bg-secondary border-t border-border-primary rounded-t-2xl max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-200"
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <span className="text-sm font-semibold text-text-primary">{t('components.sidebar.menu')}</span>
              <button onClick={() => setShowMore(false)} className="p-1 text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User card */}
            <Link
              href="/profile"
              onClick={() => setShowMore(false)}
              className="flex items-center gap-3 mx-4 mb-3 p-3 rounded-xl bg-bg-tertiary"
            >
              <div className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                {profile?.avatar_url ? (
                  <Image src={profile.avatar_url} alt="User avatar" width={40} height={40} className="w-full h-full rounded-full object-cover" unoptimized />
                ) : (
                  <User className="w-5 h-5 text-text-muted" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {profile?.display_name || t('components.sidebar.yourProfile')}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {profile?.sun_sign ? `${profile.sun_sign} ${t('planets.sun')}` : t('components.sidebar.viewProfile')}
                </p>
              </div>
            </Link>

            <div className="grid grid-cols-3 gap-1 px-4 pb-6">
              {MORE_ITEMS.filter(i => i.href !== '/profile').map(({ href, labelKey, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + '/');
                const showBadge = href === '/friends' && pendingFriendRequests > 0;
                const showNotifBadge = href === '/notifications';
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setShowMore(false)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-colors',
                      active
                        ? 'bg-accent-muted text-accent-primary'
                        : 'text-text-tertiary hover:bg-bg-tertiary hover:text-text-primary'
                    )}
                  >
                    <div className="relative">
                      <Icon className="w-5 h-5" />
                      {showBadge && pendingFriendRequests > 0 && (
                        <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-accent-primary flex items-center justify-center text-[8px] text-white font-bold">
                          {pendingFriendRequests > 9 ? '9+' : pendingFriendRequests}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-center leading-tight">{t(labelKey)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-bg-secondary border-t border-border-primary z-50" role="tablist" aria-label="Main navigation">
        <div className="flex items-center justify-around h-[72px] px-2 pb-safe overflow-x-auto scrollbar-hide">
          {TABS.map(({ href, labelKey, icon: Icon }) => {
            const isMore = href === '#more';
            const active = isMore
              ? isMoreActive || showMore
              : pathname === href || pathname.startsWith(href + '/');

            if (isMore) {
              return (
                <button
                  key={href}
                  role="tab"
                  aria-selected={active}
                  aria-label={t(labelKey)}
                  onClick={() => setShowMore(prev => !prev)}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-2 min-w-[56px] transition-colors',
                    active ? 'text-accent-primary' : 'text-text-muted'
                  )}
                >
                  {showMore ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  <span className="text-[11px] font-medium">{showMore ? t('components.sidebar.close') : t(labelKey)}</span>
                </button>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                role="tab"
                aria-selected={active}
                aria-label={t(labelKey)}
                onClick={() => setShowMore(false)}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 min-w-[56px] transition-colors',
                  active ? 'text-accent-primary' : 'text-text-muted'
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {href === '/messages' && totalUnread > 0 && (
                    <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-accent-primary flex items-center justify-center text-[8px] text-white font-bold">
                      {totalUnread > 9 ? '9+' : totalUnread}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium">{t(labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
