'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useMessagesStore } from '@/stores/messagesStore';
import { useFriendsStore } from '@/stores/friendsStore';
import { useViewBadge } from '@/hooks/useViewBadge';
import { User, Settings, Plus } from 'lucide-react';
import { NAV_SECTIONS, isActivePath } from './navConfig';

export function Sidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { profile } = useAuthStore();
  const totalUnread = useMessagesStore((s) => s.totalUnreadMessages);
  const pendingFriendRequests = useFriendsStore((s) => s.pendingRequestCount);
  const newViewers = useViewBadge();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-bg-secondary border-r border-border-primary flex-col z-40">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Align logo" width={40} height={40} className="w-10 h-10 rounded-xl" />
          <span className="text-xl font-display font-bold text-text-primary">Align</span>
        </Link>
      </div>

      {/* One-click create: opens the video editor (import or drop a clip). */}
      <div className="px-3 pb-3">
        <Link
          href="/cosmic-video/edit"
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-accent-primary text-white hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          {t('components.sidebar.create', 'Create')}
        </Link>
      </div>

      <nav aria-label="Main navigation" className="flex-1 px-3 overflow-y-auto scrollbar-hide">
        {NAV_SECTIONS.map((section) => (
          <div key={section.id} className="mb-3" role="group" aria-label={t(section.labelKey, section.defaultLabel)}>
            <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              {t(section.labelKey, section.defaultLabel)}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ href, labelKey, icon: Icon, coachmark }) => {
                const active = isActivePath(pathname, href);
                const showBadge = href === '/messages' && totalUnread > 0;
                const showFriendBadge = href === '/friends' && pendingFriendRequests > 0;
                const showViewsBadge = href === '/views' && newViewers > 0;
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    {...(coachmark ? { 'data-coachmark': coachmark } : {})}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
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
                    {showViewsBadge && (
                      <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold min-w-[18px] text-center">
                        {newViewers > 98 ? '99+' : newViewers}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
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
