'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useMessagesStore } from '@/stores/messagesStore';
import { useFriendsStore } from '@/stores/friendsStore';
import {
  Home, Star, BookOpen, MessageCircle, User,
  CreditCard, Settings, Sparkles, Globe, Compass, Search,
  Users, Bell, Mail, Zap, Video, Heart, MessagesSquare,
  Bookmark, BarChart3, Palette, Orbit,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', labelKey: 'components.sidebar.home', icon: Home },
  { href: '/discover', labelKey: 'components.sidebar.discover', icon: Search },
  { href: '/search', labelKey: 'components.sidebar.search', icon: Search },
  { href: '/feed', labelKey: 'components.sidebar.cosmicFeed', icon: Globe, coachmark: 'nav-feed' },
  { href: '/world-echo', labelKey: 'components.sidebar.worldEcho', icon: Compass },
  { href: '/global-intelligence', labelKey: 'Global Intelligence', icon: Globe },
  { href: '/zodisphere', labelKey: 'The Zodisphere', icon: Orbit },
  { href: '/chart', labelKey: 'components.sidebar.chart', icon: Star, coachmark: 'nav-chart' },
  { href: '/cosmic-alerts', labelKey: 'components.sidebar.cosmicWeather', icon: Zap },
  { href: '/readings', labelKey: 'components.sidebar.readings', icon: Sparkles, coachmark: 'nav-readings' },
  { href: '/cosmic-video', labelKey: 'components.sidebar.videoCreator', icon: Video },
  { href: '/polls', labelKey: 'components.sidebar.polls', icon: BarChart3 },
  { href: '/communities', labelKey: 'components.sidebar.communities', icon: MessagesSquare },
  { href: '/friends', labelKey: 'components.sidebar.friends', icon: Users },
  { href: '/dating', labelKey: 'components.sidebar.dating', icon: Heart },
  { href: '/messages', labelKey: 'components.sidebar.messages', icon: Mail },
  { href: '/bookmarks', labelKey: 'components.sidebar.bookmarks', icon: Bookmark },
  { href: '/notifications', labelKey: 'components.sidebar.notifications', icon: Bell },
  { href: '/ai', labelKey: 'components.sidebar.aiAstrologer', icon: MessageCircle, coachmark: 'nav-ai-astrologer' },
  { href: '/courses', labelKey: 'components.sidebar.learn', icon: BookOpen, coachmark: 'nav-courses' },
  { href: '/creator-studio', labelKey: 'components.sidebar.creatorStudio', icon: Palette },
  { href: '/pricing', labelKey: 'components.sidebar.pricing', icon: CreditCard },
];

export function Sidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { profile } = useAuthStore();
  const totalUnread = useMessagesStore((s) => s.totalUnreadMessages);
  const pendingFriendRequests = useFriendsStore((s) => s.pendingRequestCount);

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-bg-secondary border-r border-border-primary flex-col z-40">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Align logo" width={40} height={40} className="w-10 h-10 rounded-xl" />
          <span className="text-xl font-display font-bold text-text-primary">Align</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-hide">
        {NAV_ITEMS.map(({ href, labelKey, icon: Icon, coachmark }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          const showBadge = href === '/messages' && totalUnread > 0;
          const showFriendBadge = href === '/friends' && pendingFriendRequests > 0;
          return (
            <Link
              key={href}
              href={href}
              {...(coachmark ? { 'data-coachmark': coachmark } : {})}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-accent-muted text-accent-primary'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1">{t(labelKey)}</span>
              {showBadge && (
                <span className="px-1.5 py-0.5 rounded-full bg-accent-primary text-white text-[10px] font-bold min-w-[18px] text-center">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
              {showFriendBadge && (
                <span className="px-1.5 py-0.5 rounded-full bg-accent-primary text-white text-[10px] font-bold min-w-[18px] text-center">
                  {pendingFriendRequests > 99 ? '99+' : pendingFriendRequests}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-6 space-y-1 border-t border-border-primary pt-4">
        {/* Profile link with user avatar */}
        <Link
          href="/profile"
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
            pathname === '/profile'
              ? 'bg-accent-muted text-accent-primary'
              : 'text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary'
          )}
        >
          <div className="w-5 h-5 rounded-full bg-accent-muted flex items-center justify-center overflow-hidden flex-shrink-0">
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt="User avatar" width={20} height={20} className="w-full h-full rounded-full object-cover" unoptimized />
            ) : (
              <User className="w-3.5 h-3.5" />
            )}
          </div>
          {profile?.display_name || t('components.sidebar.profile')}
        </Link>
        {/* Settings link */}
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
            pathname === '/settings'
              ? 'bg-accent-muted text-accent-primary'
              : 'text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary'
          )}
        >
          <Settings className="w-5 h-5" />
          {t('components.sidebar.settings')}
        </Link>
      </div>
    </aside>
  );
}
