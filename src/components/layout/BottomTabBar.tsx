'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/dashboard', label: 'Home', glyph: '⌂' },
  { href: '/feed', label: 'Feed', glyph: '🌐' },
  { href: '/chart', label: 'Chart', glyph: '☉' },
  { href: '/readings', label: 'Readings', glyph: '✦' },
  { href: '/profile', label: 'Profile', glyph: '☺' },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-bg-secondary border-t border-border-primary z-50">
      <div className="flex items-center justify-around h-[72px] px-2 pb-safe">
        {TABS.map(({ href, label, glyph }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 min-w-[56px] transition-colors',
                active ? 'text-accent-primary' : 'text-text-muted'
              )}
            >
              <span className="text-xl leading-none">{glyph}</span>
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
