// Cron endpoint — the weekly Cosmic Frequency push. Runs Monday.
//
//   GET /api/cron/cosmic-frequencies  (header Authorization: Bearer <CRON_SECRET>)
//
// For each eligible user: score their week via align-api-v2, resolve the
// winning theme to a verified frequency, and write ONE notification. The
// existing push-v2 DB trigger fans that out to mobile, and /api/push/web
// handles browsers — no new push path is introduced here.
//
// Two gates that will make this look like it "does nothing" at first, both
// deliberate:
//
//   1. Founder allowlist. The whole feature is in founder soak on web and
//      mobile; the cron matches. Widen COSMIC_FREQ_ALLOWLIST to launch.
//   2. Unverified content. Every seed frequency ships verified:false, so
//      getPushEligible returns null and the user is skipped. The response
//      reports these as `skippedUnverified` so the content gap is visible
//      rather than silent.
//
// Notification type is 'transit_alert' — the one type present in every
// version of the notifications_type_check constraint across all ten
// migrations, and already mapped to the `cosmic_alerts` preference column by
// the push trigger. A dedicated type would need SQL and would risk the
// insert failing against whichever constraint is actually live. The
// discriminator lives in data.kind instead.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  getPushEligible,
  getPushSafeText,
  isFrequencyTheme,
} from '@/data/cosmicFrequencies';

export const runtime = 'nodejs'; // needs supabase-js, not edge-compatible
export const dynamic = 'force-dynamic';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://align-api-v2-production.up.railway.app/api/v1';

// Founder soak. Widen (or replace with a tier check) at launch.
const COSMIC_FREQ_ALLOWLIST = new Set<string>(['tametryol@gmail.com']);

/** Monday 00:00 UTC of the current ISO week — the idempotency boundary. */
function startOfWeekUTC(now: Date): Date {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dow = d.getUTCDay(); // 0 = Sunday
  const daysSinceMonday = (dow + 6) % 7;
  d.setUTCDate(d.getUTCDate() - daysSinceMonday);
  return d;
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

interface WeeklyResult {
  signature: { theme: string; detail: string | null; is_health: boolean } | null;
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const weekStart = startOfWeekUTC(now);
  const targetDate = now.toISOString().slice(0, 10);

  let sent = 0;
  let skippedUnverified = 0;
  let skippedAlreadySent = 0;
  let skippedOptedOut = 0;
  let failed = 0;

  try {
    const supabase = getAdminClient();

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, display_name, birth_date, birth_time, birth_location, latitude, longitude, timezone')
      .not('birth_date', 'is', null)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (error) throw error;

    const eligible = (profiles ?? []).filter((p) =>
      COSMIC_FREQ_ALLOWLIST.has((p.email || '').toLowerCase()),
    );

    for (const profile of eligible) {
      try {
        // ── Preferences ──
        const { data: prefRow } = await supabase
          .from('user_cosmic_notification_preferences')
          .select('preferences')
          .eq('user_id', profile.id)
          .maybeSingle();

        const prefs = (prefRow?.preferences ?? {}) as Record<string, any>;
        const block = (prefs.cosmic_frequencies ?? {}) as Record<string, any>;
        if (block.enabled === false) {
          skippedOptedOut++;
          continue;
        }
        const includeHealth = block.include_health !== false;

        // ── Idempotency: one per user per ISO week ──
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', profile.id)
          .eq('type', 'transit_alert')
          .eq('data->>kind', 'cosmic_frequency')
          .gte('created_at', weekStart.toISOString())
          .limit(1);

        if (existing && existing.length > 0) {
          skippedAlreadySent++;
          continue;
        }

        // ── Score the week ──
        const res = await fetch(`${API_BASE}/frequencies/weekly`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            birth_data: {
              name: profile.display_name || 'Friend',
              date: profile.birth_date,
              time: profile.birth_time || '12:00:00',
              location: profile.birth_location || '',
              latitude: profile.latitude,
              longitude: profile.longitude,
              timezone: profile.timezone || 'UTC',
              house_system: 'Whole Sign',
            },
            target_date: targetDate,
            include_health: includeHealth,
          }),
        });

        if (!res.ok) {
          failed++;
          continue;
        }

        const result = (await res.json()) as WeeklyResult;
        const theme = result.signature?.theme;
        if (!theme || !isFrequencyTheme(theme)) {
          failed++;
          continue;
        }

        // ── Content gate: unverified sequences never reach a push ──
        const frequency = getPushEligible(theme, { includeHealth });
        if (!frequency) {
          skippedUnverified++;
          continue;
        }

        // The body carries the theme's pressure string only. The code, the
        // health context and the disclaimer live behind the tap-through.
        const { error: insertError } = await supabase.from('notifications').insert({
          user_id: profile.id,
          type: 'transit_alert',
          title: 'Your frequency for the week',
          body: `Your chart points to ${getPushSafeText(theme)}.`,
          data: {
            kind: 'cosmic_frequency',
            theme,
            frequency_id: frequency.id,
            is_health: result.signature?.is_health ?? false,
            reason: result.signature?.detail ?? null,
            link: '/readings/cosmic-frequencies',
          },
        });

        if (insertError) failed++;
        else sent++;
      } catch {
        failed++;
      }
    }

    return NextResponse.json({
      ok: true,
      weekOf: weekStart.toISOString().slice(0, 10),
      considered: eligible.length,
      sent,
      skippedUnverified,
      skippedAlreadySent,
      skippedOptedOut,
      failed,
      processedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
