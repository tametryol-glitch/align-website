// Cron endpoint — posts the next Align feature-promo video as Align Daily, one
// every ~4 days, in a fixed order. The cron runs daily; it only posts when the
// last Align Daily video is at least MIN_GAP_HOURS old, and it picks the first
// queue item whose video has not been posted yet, so it is idempotent and
// stops by itself when the queue is empty.
//
// Videos live in the public post-media bucket under <accountId>/promo/<key>.mp4
// with a matching .jpg poster. Plan + captions: video-post-plan.md.
//
// Authorized with CRON_SECRET, same as /api/cron/social-content:
//   GET /api/cron/social-video  (header Authorization: Bearer <CRON_SECRET>)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs'; // needs supabase-js, not edge-compatible
export const dynamic = 'force-dynamic';

const ALIGN_DAILY_ID = 'b15846d4-48db-42b2-bdfd-04abe3ff15d6';
// 84h (3.5 days) so a daily cron lands on every 4th day without drifting.
const MIN_GAP_HOURS = 84;

// Posted in this order. #1 (Cosmic Feed) was published by hand on 05-10-2026.
const QUEUE: { key: string; caption: string }[] = [
  { key: 'ai-astrologer', caption: 'Ask your chart anything. The AI Astrologer reads YOUR actual placements, not a generic horoscope. ✨ What\'s the one question you\'d ask first?' },
  { key: 'starseed-origin', caption: 'Starseed Origin maps the fixed stars woven into your chart and shows where your soul\'s story may have started. 🌌 Ready to see your fingerprint?' },
  { key: 'zodisphere', caption: 'Zodisphere is a living globe of the Align community. Spin it, explore it, find where your cosmic people are. 🌍 Where on Earth do you feel most at home?' },
  { key: 'dream-oracle', caption: 'Dreams are messages, and Dream Oracle reads yours against your birth chart. Describe the dream, pick the emotions, and see what your subconscious was showing you, and what it\'s asking you to face. 🔮 What\'s the dream you can\'t shake?' },
  { key: 'build-a-match', caption: 'Build-A-Match: pick the placements you want in a partner and find the people who actually carry them. 💞 Which placement is your non-negotiable?' },
  { key: 'divine-timing', caption: 'Divine Timing: ask a question and get an answer from the sky itself, plus the Galactic Clock for when to act. ⏳ What\'s the decision you\'ve been holding?' },
  { key: 'world-echo', caption: 'World Echo links what\'s happening in the world to what\'s happening in your chart. 🌐 Notice how big headlines land personally? That\'s the echo.' },
  { key: 'hidden-zodiac', caption: 'Hidden Zodiac goes beneath your sign into the finer divisions of the sky most charts never show. 🔎 Which layer surprised you most?' },
  { key: 'rectification', caption: 'Not sure of your birth time? Guided Rectification helps you pin it down from your own life events. 🕰️ Your Rising depends on it, so it\'s worth getting right.' },
  { key: 'fragments', caption: 'Cosmic Fragments: bite-size pieces of your chart\'s story you can read, save, and share. 💫 Which fragment felt most like you?' },
  { key: 'aura', caption: 'Tell Align how you feel right now and it reads your aura: your outer color, your inner color, and a 72-hour forecast. 🌈 What color is yours?' },
  { key: 'global-intelligence', caption: 'Global Intelligence tracks the sky against every country\'s own birth chart. 🌍 Look up yours and see what it says, then tell us what you found.' },
  { key: 'gifts-rewards', caption: 'Send gifts, earn rewards, and show up for the people who light up your feed. 🎁 Who deserves a gift today?' },
  { key: 'affiliate-program', caption: 'Love Align? Share it and get rewarded. The Affiliate Program gives you your own code and tracks every signup. 💛 Open Earn in the app to start.' },
  { key: 'creator-program', caption: 'Creators, this one is for you. The Creator Program rewards the content you make about the cosmos. 🎥 Open Earn to see how it works.' },
  { key: 'affiliate-dashboard', caption: 'Track every referral, payout and click in your Affiliate Dashboard. 📈 Your numbers, in one place.' },
];

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(request: NextRequest) {
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

    const { data: posted, error } = await admin
      .from('posts')
      .select('video_url, created_at')
      .eq('user_id', ALIGN_DAILY_ID)
      .eq('type', 'video')
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const last = posted?.[0]?.created_at ? new Date(posted[0].created_at).getTime() : 0;
    const hoursSince = (Date.now() - last) / 3_600_000;
    if (last && hoursSince < MIN_GAP_HOURS) {
      return NextResponse.json({ posted: false, reason: 'too-soon', hoursSince: Math.round(hoursSince) });
    }

    const urls = (posted || []).map((p) => p.video_url || '');
    const next = QUEUE.find((q) => !urls.some((u) => u.includes(`/promo/${q.key}.mp4`)));
    if (!next) return NextResponse.json({ posted: false, reason: 'queue-empty' });

    const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-media/${ALIGN_DAILY_ID}/promo/${next.key}`;
    const { data, error: insErr } = await admin
      .from('posts')
      .insert({
        user_id: ALIGN_DAILY_ID,
        type: 'video',
        content: next.caption,
        video_url: `${base}.mp4`,
        poster_url: `${base}.jpg`,
        image_url: null,
        visibility: 'public',
        chart_data: {},
      })
      .select('id')
      .single();
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

    return NextResponse.json({ posted: true, key: next.key, id: data.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
