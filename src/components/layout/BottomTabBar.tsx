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
import { useViewBadge } from '@/hooks/useViewBadge';
import {
  Home, Newspaper, Sun, MessageCircle, Menu, X, User, Settings, Plus,
} from 'lucide-react';
import { NAV_SECTIONS, isActivePath } from './navConfig';

// Six slots: the daily loop (Feed, Home, Chart), Create, Chat (it carries the
// unread badge) and More, which opens the full map grouped by section.
const TABS = [
  { href: '/feed', labelKey: 'components.sidebar.feed', icon: Newspaper },
  { href: '/dashboard', labelKey: 'components.sidebar.home', icon: Home },
  { href: '/chart', labelKey: 'components.sidebar.chart', icon: Sun },
  { href: '/cosmic-video/edit', labelKey: 'components.sidebar.create', icon: Plus },
  { href: '/messages', labelKey: 'components.sidebar.chat', icon: MessageCircle },
  { href: '#more', labelKey: 'components.sidebar.more', icon: Menu },
];

// "More" lights up for any page that is not one of the tabs.
const TAB_HREFS = new Set(TABS.map((t) => t.href));
const MORE_HREFS = [
  ...NAV_SECTIONS.flatMap((s) => s.items.map((i) => i.href)).filter((h) => !TAB_HREFS.has(h)),
  '/profile',
  '/settings',
];

export function BottomTabBar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { profile } = useAuthStore();
  const totalUnread = useMessagesStore((s) => s.totalUnreadMessages);
  const pendingFriendRequests = useFriendsStore((s) => s.pendingRequestCount);
  const newViewers = useViewBadge();
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

  const isMoreActive = MORE_HREFS.some((href) => isActivePath(pathname, href));

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

            <div className="px-4 pb-6 space-y-3">
              {NAV_SECTIONS.map((section) => (
                <div key={section.id} role="group" aria-label={t(section.labelKey, section.defaultLabel)}>
                  <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                    {t(section.labelKey, section.defaultLabel)}
                  </p>
                  <div className="grid grid-cols-3 gap-1">
                    {section.items.map(({ href, labelKey, icon: Icon }) => {
                      const active = isActivePath(pathname, href);
                      const showBadge = href === '/friends' && pendingFriendRequests > 0;
                      return (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setShowMore(false)}
                          aria-current={active ? 'page' : undefined}
                          className={cn(
                            'flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-colors',
                            active
                              ? 'bg-accent-muted text-accent-primary'
                              : 'text-text-tertiary hover:bg-bg-tertiary hover:text-text-primary'
                          )}
                        >
                          <div className="relative">
                            <Icon className="w-5 h-5" />
                            {href === '/messages' && totalUnread > 0 && (
                              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-accent-primary flex items-center justify-center text-[8px] text-white font-bold">
                                {totalUnread > 9 ? '9+' : totalUnread}
                              </span>
                            )}
                            {showBadge && (
                              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-accent-primary flex items-center justify-center text-[8px] text-white font-bold">
                                {pendingFriendRequests > 9 ? '9+' : pendingFriendRequests}
                              </span>
                            )}
                            {href === '/views' && newViewers > 0 && (
                              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[8px] text-white font-bold">
                                {newViewers > 9 ? '9+' : newViewers}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-medium text-center leading-tight">{t(labelKey)}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
              <Link
                href="/settings"
                onClick={() => setShowMore(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-text-tertiary hover:bg-bg-tertiary hover:text-text-primary"
              >
                <Settings className="w-5 h-5" />
                <span className="text-sm font-medium">{t('components.sidebar.settings')}</span>
              </Link>
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

            // Center create button: a filled pill, no label (TikTok-style).
            if (href === '/cosmic-video/edit') {
              return (
                <Link
                  key={href}
                  href={href}
                  role="tab"
                  aria-selected={active}
                  aria-label={t(labelKey, 'Create')}
                  onClick={() => setShowMore(false)}
                  className="flex items-center justify-center px-3 py-2 min-w-[56px]"
                >
                  <span className="flex items-center justify-center w-11 h-8 rounded-[10px] bg-accent-primary text-white">
                    <Plus className="w-5 h-5" strokeWidth={3} />
                  </span>
                </Link>
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
