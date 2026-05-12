'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { Home, Newspaper, Sun, BookOpen, User } from 'lucide-react';

const TABS = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/feed', label: 'Feed', icon: Newspaper },
  { href: '/chart', label: 'Chart', icon: Sun },
  { href: '/readings', label: 'Readings', icon: BookOpen },
  { href: '/profile', label: 'Profile', icon: null },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const { profile } = useAuthStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-bg-secondary border-t border-border-primary z-50" role="tablist" aria-label="Main navigation">
      <div className="flex items-center justify-around h-[72px] px-2 pb-safe">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          const isProfile = href === '/profile';
          return (
            <Link
              key={href}
              href={href}
              role="tab"
              aria-selected={active}
              aria-label={label}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 min-w-[56px] transition-colors',
                active ? 'text-accent-primary' : 'text-text-muted'
              )}
            >
              {isProfile ? (
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center overflow-hidden',
                  active ? 'ring-2 ring-accent-primary' : 'bg-accent-muted'
                )}>
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-3.5 h-3.5" />
                  )}
                </div>
              ) : (
                Icon && <Icon className="w-5 h-5" />
              )}
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
