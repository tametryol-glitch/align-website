'use client';

import { cn } from '@/lib/utils';

interface Props {
  value: number;       // 0-100
  label?: string;
  color?: 'accent' | 'gold' | 'green' | 'red';
  showValue?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const colorMap = {
  accent: 'bg-gradient-accent',
  gold: 'bg-gradient-to-r from-gold-primary to-gold-secondary',
  green: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
  red: 'bg-gradient-to-r from-red-500 to-red-400',
};

export function ScoreBar({ value, label, color = 'accent', showValue = true, size = 'md', className }: Props) {
  const clamped = Math.min(100, Math.max(0, value));
  const h = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1">
          {label && <span className="text-xs text-text-tertiary">{label}</span>}
          {showValue && <span className="text-xs text-text-muted font-medium">{Math.round(clamped)}%</span>}
        </div>
      )}
      <div className={cn(h, 'w-full bg-bg-tertiary rounded-full overflow-hidden')}>
        <div
          className={cn(h, 'rounded-full transition-all duration-700', colorMap[color])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
