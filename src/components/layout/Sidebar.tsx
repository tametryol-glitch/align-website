'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home, Star, BookOpen, MessageCircle, User,
  CreditCard, Settings, Sparkles, Globe, Compass, Search,
  Users, Bell, Mail,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/discover', label: 'Discover', icon: Search },
  { href: '/feed', label: 'Cosmic Feed', icon: Globe },
  { href: '/world-echo', label: 'World Echo', icon: Compass },
  { href: '/chart', label: 'My Chart', icon: Star },
  { href: '/readings', label: 'Readings', icon: Sparkles },
  { href: '/friends', label: 'Friends', icon: Users },
  { href: '/messages', label: 'Messages', icon: Mail },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/ai', label: 'AI Astrologer', icon: MessageCircle },
  { href: '/courses', label: 'Learn', icon: BookOpen },
  { href: '/pricing', label: 'Pricing', icon: CreditCard },
];

const BOTTOM_ITEMS = [
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-bg-secondary border-r border-border-primary flex-col z-40">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-display font-bold text-text-primary">Align</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-hide">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-accent-muted text-accent-primary'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary'
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-6 space-y-1 border-t border-border-primary pt-4">
        {BOTTOM_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-accent-muted text-accent-primary'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary'
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
