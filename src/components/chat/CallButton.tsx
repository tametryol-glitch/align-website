'use client';

import { Phone, Video } from 'lucide-react';

interface CallButtonProps {
  targetUserId: string;
  targetUserName: string;
  targetUserAvatar?: string;
  onCallStart: (callType: 'voice' | 'video') => void;
  disabled?: boolean;
}

export function CallButton({
  onCallStart,
  disabled = false,
}: CallButtonProps) {
  const base =
    'w-8 h-8 rounded-full flex items-center justify-center transition-colors';
  const enabled =
    'bg-bg-tertiary text-text-muted hover:text-accent-primary hover:bg-accent-primary/15';
  const disabledStyle = 'bg-bg-tertiary text-text-muted opacity-40 cursor-not-allowed';

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        title="Voice call"
        disabled={disabled}
        onClick={() => onCallStart('voice')}
        className={`${base} ${disabled ? disabledStyle : enabled}`}
      >
        <Phone className="w-4 h-4" />
      </button>
      <button
        type="button"
        title="Video call"
        disabled={disabled}
        onClick={() => onCallStart('video')}
        className={`${base} ${disabled ? disabledStyle : enabled}`}
      >
        <Video className="w-4 h-4" />
      </button>
    </div>
  );
}
