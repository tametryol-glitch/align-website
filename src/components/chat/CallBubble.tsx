'use client';

// A `call` message: written by call_log_start / call_log_update. The same row
// the mobile app renders (align-app/src/components/chat/CallBubble.tsx), so
// both sides of a call read identical history. Keep the wording in step.

interface CallBubbleProps {
  metadata: Record<string, any>;
  createdAt: string;
  isMine: boolean;
}

// A ring nobody finished (the caller's device died mid-ring) never gets its
// "missed" write, so a stale 'ringing' row is shown as missed instead of
// ringing forever.
const RING_TIMEOUT_MS = 45_000;

function fmtDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
}

export function CallBubble({ metadata, createdAt, isMine }: CallBubbleProps) {
  const video = metadata?.call_type === 'video';
  let status: string = metadata?.status || 'ringing';
  if (status === 'ringing' && Date.now() - new Date(createdAt).getTime() > RING_TIMEOUT_MS) {
    status = 'missed';
  }
  const noun = video ? 'video call' : 'voice call';
  const cap = noun.charAt(0).toUpperCase() + noun.slice(1);

  let title: string;
  let detail = '';
  switch (status) {
    case 'ringing':
      title = isMine ? `Calling… (${noun})` : `Incoming ${noun}`;
      break;
    case 'accepted':
      title = cap;
      detail = 'In progress';
      break;
    case 'ended':
      title = cap;
      detail = fmtDuration(Number(metadata?.duration_seconds) || 0);
      break;
    case 'declined':
      title = isMine ? `${cap} declined` : `Declined ${noun}`;
      break;
    default: // missed
      title = isMine ? `No answer (${noun})` : `Missed ${noun}`;
  }
  const missedForMe = !isMine && (status === 'missed' || status === 'declined');

  return (
    <div className="flex items-center gap-2.5 min-w-[170px] py-0.5">
      <span className="text-xl leading-none" aria-hidden>{video ? '📹' : '📞'}</span>
      <div className="min-w-0">
        <p className={`text-sm font-medium truncate ${missedForMe ? 'text-red-400' : ''}`}>{title}</p>
        {detail && <p className="text-[11px] opacity-70">{detail}</p>}
      </div>
    </div>
  );
}
