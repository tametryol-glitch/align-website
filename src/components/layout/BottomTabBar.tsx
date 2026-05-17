'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useMessagesStore } from '@/stores/messagesStore';
import { useFriendsStore } from '@/stores/friendsStore';
import {
  Home, Newspaper, Sun, MessageCircle, Menu, X,
  Search, Globe, Compass, Star, Zap, Sparkles,
  Users, Bell, BookOpen, CreditCard, User, Settings,
  Mail,
} from 'lucide-react';

const TABS = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/feed', label: 'Feed', icon: Newspaper },
  { href: '/chart', label: 'Chart', icon: Sun },
  { href: '/messages', label: 'Chat', icon: MessageCircle },
  { href: '#more', label: 'More', icon: Menu },
];

const MORE_ITEMS = [
  { href: '/discover', label: 'Discover', icon: Search },
  { href: '/world-echo', label: 'World Echo', icon: Compass },
  { href: '/cosmic-alerts', label: 'Cosmic Weather', icon: Zap },
  { href: '/readings', label: 'Readings', icon: Sparkles },
  { href: '/friends', label: 'Friends', icon: Users },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/ai', label: 'AI Astrologer', icon: MessageCircle },
  { href: '/courses', label: 'Learn', icon: BookOpen },
  { href: '/pricing', label: 'Pricing', icon: CreditCard },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function BottomTabBar() {
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
              <span className="text-sm font-semibold text-text-primary">Menu</span>
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
                  {profile?.display_name || 'Your Profile'}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {profile?.sun_sign ? `${profile.sun_sign} Sun` : 'View your profile'}
                </p>
              </div>
            </Link>

            <div className="grid grid-cols-3 gap-1 px-4 pb-6">
              {MORE_ITEMS.filter(i => i.href !== '/profile').map(({ href, label, icon: Icon }) => {
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
                    <span className="text-[11px] font-medium text-center leading-tight">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-bg-secondary border-t border-border-primary z-50" role="tablist" aria-label="Main navigation">
        <div className="flex items-center justify-around h-[72px] px-2 pb-safe">
          {TABS.map(({ href, label, icon: Icon }) => {
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
                  aria-label={label}
                  onClick={() => setShowMore(prev => !prev)}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-2 min-w-[56px] transition-colors',
                    active ? 'text-accent-primary' : 'text-text-muted'
                  )}
                >
                  {showMore ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  <span className="text-[11px] font-medium">{showMore ? 'Close' : label}</span>
                </button>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                role="tab"
                aria-selected={active}
                aria-label={label}
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
                <span className="text-[11px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
