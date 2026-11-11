// Cron endpoint — the Birthday Tribe. Runs hourly and, for every member
// whose birthday is today OR already passed earlier this month, publishes ONE
// birthday post (belated for the past ones) from Align Daily with:
//   * their profile picture snapshot (the feed card shows a soft placeholder if none)
//   * a short solar-return based note for the year ahead
// then notifies the celebrant and their friends/followers so everyone can wish them.
// Wishes are normal post_comments (see supabase-migration-birthdays.sql).
//
// Idempotent: unique index (subject_id, year) on type='birthday' posts, plus a read
// check. One post per run (hourly) keeps the feed from being flooded.
//
//   GET /api/cron/birthdays  (header Authorization: Bearer <CRON_SECRET>)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OFFICIAL_ACCOUNTS, isOfficialAccountId } from '@/lib/officialAccounts';
import { resolveTimezoneOffset } from '@/lib/timezoneOffset';
import { buildBirthdayAdvice, birthdayPostText, firstName } from '@/lib/birthdayAdvice';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const maxDuration = 300;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://align-api-v2-production.up.railway.app/api/v1';
const ALIGN_DAILY = OFFICIAL_ACCOUNTS.find((a) => a.handle === 'align_daily')!;
/**
 * ONE birthday post per run, and the cron runs hourly, so birthdays are spread
 * across the day (max 24/day) instead of landing in the feed all at once. Anyone
 * not posted yet is picked up by a later run (today's birthdays first), never dropped.
 */
const MAX_PER_RUN = 1;

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) },
  });
}

async function solarReturnPlanets(p: any, year: number): Promise<any[] | null> {
  // Houses need a birth place; without one we fall back to the generic note.
  if (typeof p.latitude !== 'number' || typeof p.longitude !== 'number') return null;
  try {
    const { offset, label } = resolveTimezoneOffset(p.timezone, p.longitude, p.birth_date, p.birth_time, p.latitude);
    const res = await fetch(`${API_BASE}/returns/solar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        birth_data: {
          name: p.display_name || '',
          date: p.birth_date,
          time: p.birth_time || '12:00',
          latitude: p.latitude,
          longitude: p.longitude,
          timezone: label,
          tz_offset: offset,
          location: p.birth_location || '',
          house_system: 'Whole Sign',
        },
        year,
        house_system: 'Whole Sign',
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.positions || json.planets || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const admin = getAdminClient();
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;
    const day = now.getUTCDate();

    // 1. Members whose birthday is this month and not later than today.
    const due: any[] = [];
    for (let from = 0; from < 100000; from += 1000) {
      const { data, error } = await admin
        .from('profiles')
        .select('id, display_name, avatar_url, birth_date, birth_time, birth_location, latitude, longitude, timezone')
        .not('birth_date', 'is', null)
        .order('id')
        .range(from, from + 999);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      for (const p of data || []) {
        if (isOfficialAccountId(p.id)) continue;
        const m = String(p.birth_date).split('-');
        if (m.length < 3 || Number(m[1]) !== month || Number(m[2]) > day) continue;
        due.push({ ...p, bMonth: month, bDay: Number(m[2]) });
      }
      if (!data || data.length < 1000) break;
    }

    // 2. Already posted this year?
    const { data: existing, error: exErr } = await admin
      .from('posts')
      .select('chart_data')
      .eq('type', 'birthday')
      .eq('chart_data->>year', String(year));
    if (exErr) return NextResponse.json({ error: exErr.message }, { status: 500 });
    const done = new Set((existing || []).map((r: any) => r.chart_data?.subject_id));

    // Today's birthdays first, then newest belated ones.
    const todo = due.filter((p) => !done.has(p.id)).sort((a, b) => b.bDay - a.bDay);
    const batch = todo.slice(0, MAX_PER_RUN);

    let posted = 0;
    const failed: string[] = [];
    for (const p of batch) {
      const belated = p.bDay < day;
      const planets = await solarReturnPlanets(p, year);
      const advice = buildBirthdayAdvice(planets);
      const name = p.display_name || 'Friend';
      const birthdayDate = `${year}-${String(month).padStart(2, '0')}-${String(p.bDay).padStart(2, '0')}`;

      const { data: post, error: insErr } = await admin
        .from('posts')
        .insert({
          user_id: ALIGN_DAILY.id,
          type: 'birthday',
          content: birthdayPostText(name, belated, advice),
          image_url: null,
          visibility: 'public',
          chart_data: {
            subject_id: p.id,
            year,
            birthday_date: birthdayDate,
            belated,
            name,
            avatar_url: p.avatar_url || null,
            ...advice,
          },
        })
        .select('id')
        .single();
      if (insErr || !post) {
        // 23505 = another run got there first; anything else is worth reporting.
        if (insErr?.code !== '23505') failed.push(`${p.id}: ${insErr?.message}`);
        continue;
      }
      posted++;

      const title = belated
        ? `🎉 Belated happy birthday, ${firstName(name)}!`
        : `🎂 Happy birthday, ${firstName(name)}!`;
      // The celebrant.
      await admin.from('notifications').insert({
        user_id: p.id,
        type: 'announcement',
        title,
        body: 'Your Align tribe is celebrating you. Open the app to see your birthday card and your year ahead.',
        data: { post_id: post.id, kind: 'birthday_self' },
        actor_id: ALIGN_DAILY.id,
      });
      // Friends + followers: "send them a wish".
      await admin.rpc('fan_out_to_audience', {
        p_author: p.id,
        p_audience: 'followers_friends',
        p_type: 'announcement',
        p_title: belated ? `🎉 It was ${firstName(name)}'s birthday this month` : `🎂 It's ${firstName(name)}'s birthday today`,
        p_body: 'Tap to send them a birthday wish.',
        p_data: { post_id: post.id, kind: 'birthday_wish_prompt' },
        p_pref: 'followed_posts',
        p_dedupe_key: 'post_id',
        p_dedupe_value: post.id,
      });
    }

    return NextResponse.json({
      ok: true,
      due: due.length,
      alreadyPosted: due.length - todo.length,
      posted,
      remaining: todo.length - batch.length,
      failed,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'birthdays failed' }, { status: 500 });
  }
}
