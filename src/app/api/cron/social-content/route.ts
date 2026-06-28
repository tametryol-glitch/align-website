// Cron endpoint — posts one fresh, deterministic piece of content per day for
// each official content account (Align Daily, Cosmic Weather) into the social
// feed. Idempotent: skips an account if it already posted today (UTC).
//
// Authorized with CRON_SECRET, same as /api/cron/send-emails:
//   GET /api/cron/social-content  (header Authorization: Bearer <CRON_SECRET>)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OFFICIAL_ACCOUNTS } from '@/lib/officialAccounts';

export const runtime = 'nodejs'; // needs supabase-js, not edge-compatible
export const dynamic = 'force-dynamic';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

// Curated rotating content pools. Keyed by official account id so we can map a
// pool to each account. Each day picks one item deterministically by day-of-year
// so posts cycle through the pool without repeating day-to-day.

const ALIGN_DAILY_POOL: string[] = [
  'Good morning, stargazers. ☀️ What\'s one small thing you\'re grateful for today?',
  'Reminder: your chart is a map, not a cage. You\'re always free to choose your next step.',
  'Affirmation for today: I trust the timing of my life.',
  'What\'s your rising sign? 👇 Tell us in the comments.',
  'The energy you protect is the energy you keep. Guard your peace today.',
  'Quick check-in: how is your heart doing right now, honestly?',
  'Affirmation: I am allowed to grow at my own pace.',
  'Your Sun sign is your purpose, your Moon is your needs, your Rising is your first impression. Which feels most \"you\"?',
  'Pause. Breathe. The stars aren\'t going anywhere, and neither is your potential.',
  'What intention are you setting for this week? Drop it below. ✨',
  'Affirmation: I release what no longer aligns with me.',
  'Small ritual idea: light a candle and name one thing you\'re ready to let go of.',
  'Which planet rules your day-to-day mood the most? Be honest. 🌙',
  'You don\'t have to have it all figured out. You just have to take the next aligned step.',
  'Affirmation: Abundance flows to me with ease.',
  'Tell us: what first drew you to astrology? We love these stories. 💫',
  'Your sensitivity is not a weakness. It\'s a kind of intelligence.',
  'Mid-week reminder: rest is productive too.',
  'Affirmation: I am exactly where I need to be.',
  'If your week were a tarot card, which one would it be? 🃏',
  'Honor your Moon today: do one thing that genuinely comforts you.',
  'What\'s a lesson the stars (or life) keep teaching you lately?',
  'Affirmation: My intuition is wise and worth trusting.',
  'Close your eyes, take three deep breaths, and let today begin gently.',
];

const COSMIC_WEATHER_POOL: string[] = [
  '🌙 Moon check: notice where your emotions are pulling you today, and follow the thread gently.',
  'Mercury reminder: read it twice before you send it. Miscommunication loves a rushed message.',
  'The Moon is your inner weather. Cloudy days pass. ☁️🌕',
  'Today favors slowing down and finishing what you started. Less starting, more closing.',
  'Cosmic weather: a good day to tidy your space and clear mental clutter alongside it.',
  '🪐 Saturn energy: structure now creates freedom later. Build the boring thing.',
  'Venus vibes today: lead with warmth, soften your edges, choose connection.',
  'Retrograde or not, double-check the details before you commit. 🔍',
  'New Moon energy is for planting seeds. What intention are you setting? 🌑',
  'Full Moon energy is for release and revelation. What\'s coming to light for you? 🌕',
  'Mars is fuel. Channel that restlessness into one focused task today. 🔥',
  'The sky favors honest conversations today. Say the true thing, kindly.',
  'Jupiter reminds you: think bigger than the fear. Expansion lives just past comfort. 🌌',
  'A grounding day. Touch grass, drink water, do the next simple thing. 🌿',
  'Emotional tides feel high right now — let yourself feel without judging the feeling.',
  'Cosmic weather: creativity is favored. Make something imperfect today. 🎨',
  'The Moon shifts signs and so does the mood. Stay flexible. 🌙',
  'Good day for closure: tie up a loose end that\'s been quietly draining you.',
  'Neptune fog can blur boundaries today. Be clear about what\'s yours and what isn\'t. 🌫️',
  'Sun energy spotlights you today — let yourself be seen. ☀️',
  'Pluto whispers transformation. What old version of you is ready to be composted? 🦋',
  'The stars favor rest as much as ambition today. Honor the slower rhythm.',
  'Uranus energy: surprises are likely. Stay open, the detour might be the gift. ⚡',
  'Heavy sky, light heart: let the cosmic weather move through you, not stick to you.',
];

const POOLS: Record<string, string[]> = {
  'b15846d4-48db-42b2-bdfd-04abe3ff15d6': ALIGN_DAILY_POOL, // Align Daily
  '806ba1be-51a2-4c77-9f3a-a5e703310852': COSMIC_WEATHER_POOL, // Cosmic Weather
};

function dayOfYearUTC(d: Date): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  const diff = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - start;
  return Math.floor(diff / 86400000); // 1-based day of year
}

function startOfUTCDay(d: Date): string {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString();
}

export async function GET(request: NextRequest) {
  // Verify cron secret (mirrors /api/cron/send-emails)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const admin = getAdminClient();
    const now = new Date();
    const doy = dayOfYearUTC(now);
    const dayStart = startOfUTCDay(now);

    const results: Array<{ account: string; status: 'posted' | 'skipped' | 'error'; content?: string; reason?: string }> = [];

    for (const account of OFFICIAL_ACCOUNTS) {
      const pool = POOLS[account.id];
      if (!pool || pool.length === 0) {
        results.push({ account: account.name, status: 'error', reason: 'No content pool' });
        continue;
      }

      // Idempotency: skip if this account already posted today (UTC).
      const { count, error: countErr } = await admin
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', account.id)
        .gte('created_at', dayStart);

      if (countErr) {
        results.push({ account: account.name, status: 'error', reason: countErr.message });
        continue;
      }
      if ((count ?? 0) > 0) {
        results.push({ account: account.name, status: 'skipped', reason: 'Already posted today' });
        continue;
      }

      const content = pool[doy % pool.length];

      const { error: insertErr } = await admin.from('posts').insert({
        user_id: account.id,
        type: 'text',
        content,
        image_url: null,
        visibility: 'public',
        chart_data: {},
      });

      if (insertErr) {
        results.push({ account: account.name, status: 'error', reason: insertErr.message });
      } else {
        results.push({ account: account.name, status: 'posted', content });
      }
    }

    const posted = results.filter((r) => r.status === 'posted').length;
    const skipped = results.filter((r) => r.status === 'skipped').length;

    return NextResponse.json({
      ok: true,
      posted,
      skipped,
      dayOfYear: doy,
      results,
      processedAt: now.toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Cron] social-content failed:', message);
    return NextResponse.json({ error: 'Internal error', details: message }, { status: 500 });
  }
}
