'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_MAP: Record<AvatarSize, { container: string; text: string; px: number }> = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]', px: 24 },
  sm: { container: 'w-8 h-8', text: 'text-xs', px: 32 },
  md: { container: 'w-10 h-10', text: 'text-sm', px: 40 },
  lg: { container: 'w-12 h-12', text: 'text-base', px: 48 },
  xl: { container: 'w-16 h-16', text: 'text-lg', px: 64 },
};

interface UserAvatarProps {
  avatarUrl?: string | null;
  displayName?: string;
  size?: AvatarSize;
  className?: string;
}

export function UserAvatar({ avatarUrl, displayName, size = 'md', className }: UserAvatarProps) {
  const { container, text, px } = SIZE_MAP[size];
  const initial = (displayName || '?')[0].toUpperCase();

  return (
    <div className={cn('rounded-full bg-accent-muted flex items-center justify-center flex-shrink-0 overflow-hidden', container, className)}>
      {avatarUrl ? (
        <Image src={avatarUrl} alt={displayName || 'User avatar'} width={px} height={px} className="w-full h-full rounded-full object-cover" unoptimized />
      ) : (
        <span className={cn('font-bold text-accent-primary', text)}>{initial}</span>
      )}
    </div>
  );
}
