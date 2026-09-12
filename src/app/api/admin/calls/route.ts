// ═══════════════════════════════════════════════════════════════════
// Admin call metering — who is using voice/video, for how long, and
// what it is costing. Plus the levers: kill a live call, cap or block
// an account.
//
// Agora bills per participant-minute, so a connected 1:1 call costs
// two legs. Everything here reports leg-minutes per user (what their
// quota consumes) and participant-minutes in the cost estimate (what
// Agora actually charges for).
//
// Runs on the service key: call_sessions RLS restricts users to their
// own calls, so this is the only path that can see across accounts.
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

async function verifyAdmin(req: NextRequest): Promise<string | null> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return req.cookies.get(name)?.value; },
        set() {},
        remove() {},
      },
    },
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = getAdminClient();
  const { data: profile } = await admin.from('profiles').select('is_admin').eq('id', user.id).single();
  return profile?.is_admin ? user.id : null;
}

// Agora list rates, USD per 1000 participant-minutes. Override via env
// if your contract differs — these are only used for the estimate.
const RATE_AUDIO = Number(process.env.AGORA_RATE_AUDIO ?? 0.99);
const RATE_VIDEO = Number(process.env.AGORA_RATE_VIDEO ?? 3.99);

// GET /api/admin/calls?days=30
export async function GET(req: NextRequest) {
  try {
    const adminId = await verifyAdmin(req);
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const admin = getAdminClient();
    const days = Math.min(365, Math.max(1, Number(req.nextUrl.searchParams.get('days') ?? 30)));
    const since = new Date(Date.now() - days * 86400_000).toISOString();

    // Close out anything abandoned before reporting. Vercel cron can
    // only run this daily; doing it here too means the dashboard is
    // never showing a call as "active" that died hours ago — which is
    // exactly the case we most need to see accurately.
    await admin.rpc('call_sweep_stale', { p_grace_seconds: 120 });

    const [sessionsRes, activeRes, limitsRes, overridesRes] = await Promise.all([
      admin
        .from('call_sessions')
        .select('id, caller_id, receiver_id, call_type, status, started_at, connected_at, ended_at, duration_seconds, end_reason, platform, caller_authenticated, is_group, group_id, peak_participants')
        .gte('started_at', since)
        .order('started_at', { ascending: false })
        .limit(5000),
      admin
        .from('call_sessions')
        .select('id, caller_id, receiver_id, call_type, status, started_at, connected_at, duration_seconds, platform, is_group, peak_participants')
        .in('status', ['ringing', 'active'])
        .order('started_at', { ascending: true }),
      admin.from('call_limits').select('*').order('tier'),
      admin.from('call_user_limits').select('*'),
    ]);

    if (sessionsRes.error) throw sessionsRes.error;

    const sessions = sessionsRes.data ?? [];

    // Roll up per user. Each connected call contributes a leg to both
    // participants — matching how their quota is charged.
    type Row = {
      user_id: string;
      minutes: number;
      video_minutes: number;
      calls: number;
      connected: number;
      longest: number;
      last_at: string | null;
    };
    const byUser = new Map<string, Row>();

    const touch = (uid: string | null, s: (typeof sessions)[number]) => {
      if (!uid) return;
      let r = byUser.get(uid);
      if (!r) {
        r = { user_id: uid, minutes: 0, video_minutes: 0, calls: 0, connected: 0, longest: 0, last_at: null };
        byUser.set(uid, r);
      }
      const mins = Math.ceil((s.duration_seconds ?? 0) / 60);
      r.calls += 1;
      r.minutes += mins;
      if (s.call_type === 'video') r.video_minutes += mins;
      if ((s.duration_seconds ?? 0) > 0) r.connected += 1;
      if ((s.duration_seconds ?? 0) > r.longest) r.longest = s.duration_seconds ?? 0;
      if (!r.last_at || s.started_at > r.last_at) r.last_at = s.started_at;
    };

    let totalLegMinutes = 0;
    let totalParticipantMinutes = 0;
    let estCost = 0;
    let unauthenticated = 0;
    const daily = new Map<string, { day: string; calls: number; minutes: number; cost: number }>();

    for (const s of sessions) {
      touch(s.caller_id, s);
      touch(s.receiver_id, s);

      const mins = Math.ceil((s.duration_seconds ?? 0) / 60);
      // Agora bills a leg per participant, so a group call costs more
      // per minute than a 1:1 of the same length.
      const participantMinutes = mins * (s.peak_participants ?? 2);
      const cost = (participantMinutes * (s.call_type === 'video' ? RATE_VIDEO : RATE_AUDIO)) / 1000;

      totalLegMinutes += mins;
      totalParticipantMinutes += participantMinutes;
      estCost += cost;
      if (s.caller_authenticated === false) unauthenticated += 1;

      const day = s.started_at.slice(0, 10);
      const d = daily.get(day) ?? { day, calls: 0, minutes: 0, cost: 0 };
      d.calls += 1;
      d.minutes += participantMinutes;
      d.cost += cost;
      daily.set(day, d);
    }

    // Attach names. One query for every user that appears, rather than
    // a join per session.
    const userIds = Array.from(byUser.keys());
    const profiles = userIds.length
      ? (await admin
          .from('profiles')
          .select('id, username, display_name, email, subscription_tier')
          .in('id', userIds)).data ?? []
      : [];
    const pMap = new Map(profiles.map((p) => [p.id, p]));

    const overrides = new Map((overridesRes.data ?? []).map((o) => [o.user_id, o]));

    const users = Array.from(byUser.values())
      .map((r) => {
        const p = pMap.get(r.user_id);
        const o = overrides.get(r.user_id);
        return {
          ...r,
          username: p?.username ?? null,
          display_name: p?.display_name ?? null,
          email: p?.email ?? null,
          subscription_tier: p?.subscription_tier ?? null,
          blocked: o?.blocked ?? false,
          override_monthly_minutes: o?.monthly_minutes ?? null,
          override_max_call_seconds: o?.max_call_seconds ?? null,
          note: o?.note ?? null,
        };
      })
      .sort((a, b) => b.minutes - a.minutes);

    return NextResponse.json({
      range_days: days,
      totals: {
        calls: sessions.length,
        connected_calls: sessions.filter((s) => (s.duration_seconds ?? 0) > 0).length,
        leg_minutes: totalLegMinutes,
        participant_minutes: totalParticipantMinutes,
        est_cost_usd: Math.round(estCost * 100) / 100,
        unauthenticated_calls: unauthenticated,
        unique_users: users.length,
      },
      users,
      active: activeRes.data ?? [],
      daily: Array.from(daily.values()).sort((a, b) => a.day.localeCompare(b.day)),
      limits: limitsRes.data ?? [],
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Failed to load call usage' }, { status: 500 });
  }
}

// POST /api/admin/calls — the control levers.
//
//   { action: 'kill',        session_id }
//   { action: 'set_user',    user_id, blocked?, monthly_minutes?, max_call_seconds?, note? }
//   { action: 'set_limits',  tier, monthly_minutes, max_call_seconds, enabled? }
export async function POST(req: NextRequest) {
  try {
    const adminId = await verifyAdmin(req);
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const admin = getAdminClient();
    const body = await req.json();

    if (body.action === 'kill') {
      if (!body.session_id) {
        return NextResponse.json({ error: 'session_id required' }, { status: 400 });
      }
      const { error } = await admin.rpc('call_admin_kill', { p_session_id: body.session_id });
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (body.action === 'set_user') {
      if (!body.user_id) {
        return NextResponse.json({ error: 'user_id required' }, { status: 400 });
      }
      // null is meaningful here — it clears an override back to the
      // tier default — so only omit keys the caller left undefined.
      const patch: Record<string, unknown> = { user_id: body.user_id, updated_at: new Date().toISOString() };
      if (body.blocked !== undefined) patch.blocked = !!body.blocked;
      if (body.monthly_minutes !== undefined) patch.monthly_minutes = body.monthly_minutes;
      if (body.max_call_seconds !== undefined) patch.max_call_seconds = body.max_call_seconds;
      if (body.note !== undefined) patch.note = body.note;

      const { error } = await admin.from('call_user_limits').upsert(patch, { onConflict: 'user_id' });
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (body.action === 'set_limits') {
      if (!body.tier) return NextResponse.json({ error: 'tier required' }, { status: 400 });
      const { error } = await admin.from('call_limits').upsert(
        {
          tier: body.tier,
          monthly_minutes: body.monthly_minutes,
          max_call_seconds: body.max_call_seconds,
          enabled: body.enabled ?? true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'tier' },
      );
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Action failed' }, { status: 500 });
  }
}
