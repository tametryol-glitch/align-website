export type NotificationCategory =
  | 'messages'
  | 'social'
  | 'transit-alerts'
  | 'moon-phases'
  | 'planetary-hours';

export interface QuietHours {
  enabled: boolean;
  start: string;
  end: string;
}

const STORAGE_KEY = 'align_notification_prefs';

interface NotificationPrefs {
  quietHours: QuietHours;
  mutedCategories: Record<NotificationCategory, boolean>;
}

const DEFAULT_QUIET_HOURS: QuietHours = { enabled: false, start: '22:00', end: '07:00' };

const DEFAULT_MUTED: Record<NotificationCategory, boolean> = {
  messages: false,
  social: false,
  'transit-alerts': false,
  'moon-phases': false,
  'planetary-hours': false,
};

function loadPrefs(): NotificationPrefs {
  if (typeof window === 'undefined') return { quietHours: DEFAULT_QUIET_HOURS, mutedCategories: DEFAULT_MUTED };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        quietHours: { ...DEFAULT_QUIET_HOURS, ...parsed.quietHours },
        mutedCategories: { ...DEFAULT_MUTED, ...parsed.mutedCategories },
      };
    }
  } catch {}
  return { quietHours: DEFAULT_QUIET_HOURS, mutedCategories: DEFAULT_MUTED };
}

function savePrefs(prefs: NotificationPrefs): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
}

function typeToCategory(notifType: string | undefined): NotificationCategory | null {
  if (!notifType) return null;
  switch (notifType) {
    case 'message':
    case 'group_message':
      return 'messages';
    case 'friend_request':
    case 'follow':
    case 'post_like':
    case 'post_reaction':
    case 'post_comment':
    case 'comment_reply':
      return 'social';
    case 'transit_alert':
    case 'cosmic_alert':
      return 'transit-alerts';
    case 'moon_phase':
    case 'full_moon':
    case 'new_moon':
    case 'eclipse':
      return 'moon-phases';
    case 'planetary_hour':
      return 'planetary-hours';
    default:
      return null;
  }
}

export function isWithinQuietHours(
  nowMinutes: number,
  startStr: string,
  endStr: string,
): boolean {
  const [sH, sM] = startStr.split(':').map(n => parseInt(n, 10) || 0);
  const [eH, eM] = endStr.split(':').map(n => parseInt(n, 10) || 0);
  const start = sH * 60 + sM;
  const end = eH * 60 + eM;
  if (start === end) return false;
  if (start < end) return nowMinutes >= start && nowMinutes < end;
  return nowMinutes >= start || nowMinutes < end;
}

export function shouldAlertForNotification(notifType?: string): boolean {
  const { quietHours, mutedCategories } = loadPrefs();

  if (notifType === 'incoming_call') return true;

  if (quietHours.enabled) {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    if (isWithinQuietHours(nowMinutes, quietHours.start, quietHours.end)) {
      return false;
    }
  }

  const category = typeToCategory(notifType);
  if (category && mutedCategories[category]) return false;

  return true;
}

export function getNotificationPrefs(): NotificationPrefs {
  return loadPrefs();
}

export function setQuietHours(quietHours: QuietHours): void {
  const prefs = loadPrefs();
  prefs.quietHours = quietHours;
  savePrefs(prefs);
}

export function setCategoryMuted(category: NotificationCategory, muted: boolean): void {
  const prefs = loadPrefs();
  prefs.mutedCategories[category] = muted;
  savePrefs(prefs);
}
