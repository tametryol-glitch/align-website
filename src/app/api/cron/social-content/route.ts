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
  // ── The Big Three ──
  'Astro 101: your "Big Three" are your Sun (who you are at your core ☀️), Moon (how you feel and what you need 🌙), and Rising (the vibe people meet first ✨). Drop your Big Three below — let\'s see the mix in here.',
  'Your Rising sign (Ascendant) is the "front door" of your chart — your first impression and how you instinctively approach life. Does yours match how people describe you? 👀',
  'Your Moon sign rules your emotional world — what soothes you and what you need to feel safe. 🌙 What\'s one thing that always brings you back to center?',
  // ── Elements ──
  'Every sign has an element. Fire signs — Aries, Leo, Sagittarius — run on instinct, passion, and momentum. 🔥 Got fire placements? Where are you the one who lights the spark?',
  'Earth signs — Taurus, Virgo, Capricorn — build, ground, and turn dreams into real things. 🌍 Earth folks: where are you the "steady one" your people rely on?',
  'Air signs — Gemini, Libra, Aquarius — live in ideas, words, and connection. 💨 Are you more the thinker, the talker, or the connector?',
  'Water signs — Cancer, Scorpio, Pisces — feel everything and read the room before a word is spoken. 🌊 Water people: is your gut usually right?',
  'Fire + Air fuel each other (passion meets ideas); Earth + Water nourish each other (stability meets feeling). Which pairing sounds like your closest relationships?',
  // ── Modalities ──
  'Beyond elements, signs have a modality. Cardinal signs (Aries, Cancer, Libra, Capricorn) START things — they open each season. Are you a natural initiator? 🚀',
  'Fixed signs (Taurus, Leo, Scorpio, Aquarius) SUSTAIN — loyal, determined, gloriously stubborn. Fixed folks: what will you simply not budge on? 😏',
  'Mutable signs (Gemini, Virgo, Sagittarius, Pisces) ADAPT — flexible, curious, always evolving. Mutable people: do you change your mind a lot, or just stay open? 🔀',
  // ── Planets (by function, not rulership) ──
  'Your Sun is your purpose and what lights you up. ☀️ It\'s the "why" behind everything you do. What makes you feel most alive?',
  'Mercury shapes how you think, learn, and communicate. ☿ Fast talker or careful word-chooser? That\'s often Mercury at work.',
  'Venus shows how you love, what you find beautiful, and what you truly value. 💛 What\'s one thing you absolutely need in a relationship?',
  'Mars is your drive, your fight, and how you chase what you want. ⚔️ Are you a slow burn or an instant spark?',
  'Jupiter is growth, luck, and where life keeps saying "yes, expand." 🌌 Where do good things seem to find you easily?',
  'Saturn is the teacher — discipline, limits, and the lessons that grow you up. 🪐 What\'s a hard lesson that ended up shaping who you are?',
  // ── Houses (themes; Align uses Whole Sign) ──
  'Your chart has 12 houses — areas of life. The 1st house is YOU: your body, your style, your approach to the world. What sign sits on your 1st house?',
  'The 4th house is home, roots, and family — your private inner foundation. 🏡 Everything else in your chart is built on it.',
  'The 7th house rules close partnerships — committed relationships and your "one-on-ones." 💞 It hints at who you\'re drawn to.',
  'The 10th house is your career, reputation, and public role — the very top of your chart. ⛰️ What do you most want to be known for?',
  // ── Aspects ──
  'Aspects are the angles between planets. A trine (120°) is easy, flowing talent; a square (90°) is friction that forces you to grow. 😅 Which do you think builds more character?',
  'A conjunction is two planets sitting together, blending their powers; an opposition is a tug-of-war you slowly learn to balance. Both are gifts in disguise.',
  // ── The Moon & phases ──
  'The Moon moves through all 12 signs in ~28 days, shifting the collective mood roughly every 2.5 days. 🌙 Ever feel your energy change for no reason? Often that\'s the Moon.',
  'New Moon 🌑 = fresh start, plant intentions. Full Moon 🌕 = culmination, things come to light. Which phase do you feel the most strongly?',
  // ── Retrogrades / Nodes / Angles ──
  'A "retrograde" is when a planet appears to move backward from Earth — an illusion that invites you to slow down and REview that planet\'s themes. 🔁 Mercury retro? Re-read, re-check, re-think.',
  'Your North Node points to your soul\'s growth edge — the unfamiliar direction you\'re here to grow into. Your South Node is what already comes easy. Growth lives just past your comfort zone. 🧭',
  'The four angles — Ascendant (self), Descendant (others), Midheaven (public life), IC (private roots) — are the skeleton your whole chart hangs on.',
  // ── Reflection / engagement (kept light for variety) ──
  'Your Sun is your purpose, your Moon is your needs, your Rising is your first impression. 🌟 Which of the three feels the most "you"?',
  'Reminder: your chart is a map, not a cage — it shows your wiring, not your fate. You always choose the next step.',
  'What first drew you to astrology? We genuinely love these stories. 💫 Tell us below.',
  'Affirmation: I trust the timing of my life. 🕰️',
  'Quick check-in: how is your heart actually doing today? 💛',
  'What intention are you setting for this week? Drop it below and let the community witness it. ✨',
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

// ── Daily "Earn with Align" promo ───────────────────────────────────────────
// Posted by Align Daily EVERY day in addition to its regular rotation post.
// Every variant must keep: the affiliate apply link, and the full Creator
// Program qualification list (kept in sync with creatorEligibility.ts
// CREATOR_THRESHOLDS: 100 followers, 1,000 lifetime views, 300 views/30d,
// 10 published videos, 30-day account age).
const EARN_ACCOUNT_ID = 'b15846d4-48db-42b2-bdfd-04abe3ff15d6'; // Align Daily
const EARN_MARKER = 'aligncosmic.com/affiliates'; // idempotency marker — present in every variant

const CREATOR_REQS =
  'To qualify for the Creator Program you need: 100+ followers, 1,000+ lifetime video views, 300+ views in the last 30 days, 10+ published videos, and an account that\'s 30+ days old — then apply right from Creator Studio in the app. 🎨';

const EARN_PROMO_POOL: string[] = [
  `💸 Did you know Align pays you to share it? Join the Affiliate Program and earn 20% recurring commission on every subscription you refer — for as long as they stay subscribed. Apply in 2 minutes: https://aligncosmic.com/affiliates\n\n${CREATOR_REQS}`,
  `✨ Turn your love for astrology into income. Align affiliates earn 20% of every subscription they refer, month after month — no follower minimum, anyone can apply: https://aligncosmic.com/affiliates\n\n${CREATOR_REQS}`,
  `🔗 Your link, your income. Share Align and keep 20% of every subscription you bring in — recurring, with monthly payouts. Start here: https://aligncosmic.com/affiliates\n\n${CREATOR_REQS}`,
  `🌟 Two ways to earn with Align: 1) Become an affiliate and get 20% recurring commission on every referral — apply at https://aligncosmic.com/affiliates. 2) Become a creator and earn from your content. ${CREATOR_REQS}`,
  `💰 Already telling your friends about Align? Get paid for it. The Affiliate Program pays 20% recurring commission on every subscription you refer: https://aligncosmic.com/affiliates\n\n${CREATOR_REQS}`,
  `🚀 Astro bloggers, TikTokers, tarot readers, podcast hosts — the Align Affiliate Program was built for you. 20% recurring commission, 30-day tracking, monthly payouts: https://aligncosmic.com/affiliates\n\n${CREATOR_REQS}`,
  `🌙 Love it here? Make it pay. Refer friends to Align and earn 20% of their subscription every single month via the Affiliate Program: https://aligncosmic.com/affiliates\n\n${CREATOR_REQS}`,
];

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

    // Daily "Earn with Align" promo — in addition to the regular rotation.
    // Idempotent by content marker (the affiliate URL) rather than post count,
    // so it neither blocks nor is blocked by the regular daily post.
    {
      const { count, error: countErr } = await admin
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', EARN_ACCOUNT_ID)
        .gte('created_at', dayStart)
        .ilike('content', `%${EARN_MARKER}%`);

      if (countErr) {
        results.push({ account: 'Align Daily (Earn promo)', status: 'error', reason: countErr.message });
      } else if ((count ?? 0) > 0) {
        results.push({ account: 'Align Daily (Earn promo)', status: 'skipped', reason: 'Already posted today' });
      } else {
        const content = EARN_PROMO_POOL[doy % EARN_PROMO_POOL.length];
        const { error: insertErr } = await admin.from('posts').insert({
          user_id: EARN_ACCOUNT_ID,
          type: 'text',
          content,
          image_url: null,
          visibility: 'public',
          chart_data: {},
        });
        if (insertErr) {
          results.push({ account: 'Align Daily (Earn promo)', status: 'error', reason: insertErr.message });
        } else {
          results.push({ account: 'Align Daily (Earn promo)', status: 'posted', content });
        }
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
