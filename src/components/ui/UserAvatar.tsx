'use client';

import { cn } from '@/lib/utils';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_MAP: Record<AvatarSize, { container: string; text: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]' },
  sm: { container: 'w-8 h-8', text: 'text-xs' },
  md: { container: 'w-10 h-10', text: 'text-sm' },
  lg: { container: 'w-12 h-12', text: 'text-base' },
  xl: { container: 'w-16 h-16', text: 'text-lg' },
};

interface UserAvatarProps {
  avatarUrl?: string | null;
  displayName?: string;
  size?: AvatarSize;
  className?: string;
}

export function UserAvatar({ avatarUrl, displayName, size = 'md', className }: UserAvatarProps) {
  const { container, text } = SIZE_MAP[size];
  const initial = (displayName || '?')[0].toUpperCase();

  return (
    <div className={cn('rounded-full bg-accent-muted flex items-center justify-center flex-shrink-0 overflow-hidden', container, className)}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
      ) : (
        <span className={cn('font-bold text-accent-primary', text)}>{initial}</span>
      )}
    </div>
  );
}
