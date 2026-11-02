// Client side of the opt-in daily "Today for you" reminder. The row lives in
// daily_brief_prefs (supabase-migration-daily-brief.sql) and is read by the
// hourly /api/cron/daily-brief job.

import { createClient } from '@/lib/supabase';

export interface DailyBriefPrefs {
  enabled: boolean;
  sendHour: number;
}

export const DEFAULT_SEND_HOUR = 8;

/**
 * `available` is false when the table does not exist yet (the migration has
 * not been run) or cannot be read, so the UI can stay hidden instead of
 * offering a reminder that cannot be saved.
 */
export async function loadDailyBriefPrefs(
  userId: string,
): Promise<{ available: boolean; prefs: DailyBriefPrefs }> {
  const off: DailyBriefPrefs = { enabled: false, sendHour: DEFAULT_SEND_HOUR };
  try {
    const { data, error } = await createClient()
      .from('daily_brief_prefs')
      .select('enabled, send_hour')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) return { available: false, prefs: off };
    if (!data) return { available: true, prefs: off };
    return { available: true, prefs: { enabled: !!data.enabled, sendHour: Number(data.send_hour) } };
  } catch {
    return { available: false, prefs: off };
  }
}

export async function saveDailyBriefPrefs(userId: string, prefs: DailyBriefPrefs): Promise<boolean> {
  try {
    // The zone is refreshed on every save, so travelling or a move is picked
    // up the next time the member touches the setting.
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const { error } = await createClient()
      .from('daily_brief_prefs')
      .upsert(
        {
          user_id: userId,
          enabled: prefs.enabled,
          send_hour: prefs.sendHour,
          timezone,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );
    return !error;
  } catch {
    return false;
  }
}
