/* ──────────────────────────────────────────────────────────────
   Cosmic Frequencies — health disclaimer acknowledgement.

   The acknowledgement gates first entry to any health-domain
   frequency. It is recorded in two places on purpose:

     * localStorage — authoritative for the UX gate. Always works,
       never blocks the user on a network round-trip.
     * user_cosmic_notification_preferences.preferences (JSONB) —
       the durable, auditable record. Best-effort: a failure here
       must never stop someone reading their own content.

   That table already exists and its `preferences` column is JSONB,
   so this needs no migration. Phase 5's cron reads the same blob.
   ────────────────────────────────────────────────────────────── */

import { createClient } from '@/lib/supabase';

/** The text shown in the blocking modal and in every health footer. */
export const HEALTH_DISCLAIMER =
  'Cosmic Frequencies are a reflective spiritual practice, not medicine. ' +
  'Nothing here is medical advice, diagnosis, or treatment, and no sequence is a ' +
  'prescription or a substitute for professional care. If you are experiencing ' +
  'symptoms, or considering any change to treatment or medication, contact a ' +
  'licensed physician. In an emergency, call your local emergency number.';

/** Bumping this re-prompts everyone — use it only if the wording materially changes. */
export const DISCLAIMER_VERSION = 1;

const ACK_KEY_PREFIX = 'align_cf_health_ack_';

function ackKey(userId: string): string {
  return `${ACK_KEY_PREFIX}${userId}`;
}

export function hasAcknowledged(userId: string | null | undefined): boolean {
  if (!userId || typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(ackKey(userId)) === String(DISCLAIMER_VERSION);
  } catch {
    // Private mode or blocked storage — re-prompt rather than assume consent.
    return false;
  }
}

/**
 * Record the acknowledgement.
 *
 * Reads the existing preferences blob and merges into it. A blind upsert
 * would wipe the user's notification settings, which live in the same column.
 */
export async function acknowledge(userId: string | null | undefined): Promise<void> {
  if (!userId) return;

  try {
    window.localStorage.setItem(ackKey(userId), String(DISCLAIMER_VERSION));
  } catch {
    /* storage unavailable — the DB write below is still attempted */
  }

  try {
    const supabase = createClient();

    const { data } = await supabase
      .from('user_cosmic_notification_preferences')
      .select('preferences')
      .eq('user_id', userId)
      .maybeSingle();

    const existing = (data?.preferences ?? {}) as Record<string, unknown>;
    const existingBlock = (existing.cosmic_frequencies ?? {}) as Record<string, unknown>;

    const merged = {
      ...existing,
      cosmic_frequencies: {
        ...existingBlock,
        health_disclaimer_ack: DISCLAIMER_VERSION,
        health_disclaimer_ack_at: new Date().toISOString(),
      },
    };

    await supabase
      .from('user_cosmic_notification_preferences')
      .upsert(
        { user_id: userId, preferences: merged, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      );
  } catch {
    /* best effort — localStorage already gated the UX */
  }
}
