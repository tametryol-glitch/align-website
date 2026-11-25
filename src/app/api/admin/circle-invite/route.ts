// Admin-only: send "The Fifth Circle" invitation as an official account.
// For each recipient: creates a circle_invitations row (private token), then
// posts the emblem image and the invitation text (with Accept / Decline links)
// into their 1:1 chat with the chosen official account.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { isOfficialAccountId } from '@/lib/officialAccounts';
import { getRequestUser } from '@/lib/adminAuth';
import { CIRCLE_EMBLEM_URL, circleChatText } from '@/lib/fifthCircle';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

async function verifyAdmin(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return null;
  const { data } = await getAdminClient().from('profiles').select('is_admin').eq('id', user.id).single();
  return data?.is_admin ? user : null;
}

// GET → current invitation statuses (for the admin panel)
export async function GET(req: NextRequest) {
  try {
    if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const admin = getAdminClient();
    const { data, error } = await admin
      .from('circle_invitations')
      .select('id, user_id, status, sent_at, responded_at, profiles:user_id(display_name)')
      .order('sent_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ invitations: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST { accountId, recipientIds: string[] }
export async function POST(req: NextRequest) {
  try {
    if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const accountId: string = body.accountId;
    const recipientIds: string[] = Array.isArray(body.recipientIds)
      ? Array.from(new Set<string>(body.recipientIds.filter((x: unknown) => typeof x === 'string')))
      : [];
    if (!accountId || !isOfficialAccountId(accountId)) {
      return NextResponse.json({ error: 'Invalid official account' }, { status: 400 });
    }
    if (recipientIds.length === 0 || recipientIds.length > 10) {
      return NextResponse.json({ error: 'Pick 1–10 recipients.' }, { status: 400 });
    }

    const admin = getAdminClient();
    const results: { id: string; ok: boolean; error?: string }[] = [];

    for (const rid of recipientIds) {
      if (isOfficialAccountId(rid)) {
        results.push({ id: rid, ok: false, error: 'Cannot invite an official account' });
        continue;
      }
      // Never double-invite: an existing invitation blocks a second send.
      const { data: existing } = await admin.from('circle_invitations').select('id').eq('user_id', rid).maybeSingle();
      if (existing) {
        results.push({ id: rid, ok: false, error: 'Already invited' });
        continue;
      }

      const token = randomBytes(24).toString('hex');
      const { error: invErr } = await admin.from('circle_invitations').insert({ token, user_id: rid });
      if (invErr) {
        results.push({ id: rid, ok: false, error: invErr.message });
        continue;
      }

      const { data: convoId, error: rpcErr } = await admin.rpc('get_or_create_dm', { p_user1: accountId, p_user2: rid });
      if (rpcErr || !convoId) {
        await admin.from('circle_invitations').delete().eq('token', token);
        results.push({ id: rid, ok: false, error: rpcErr?.message || 'Could not open chat' });
        continue;
      }

      const { error: imgErr } = await admin.from('messages').insert({
        conversation_id: convoId, sender_id: accountId, content: CIRCLE_EMBLEM_URL, type: 'image', metadata: {},
      });
      const { error: txtErr } = await admin.from('messages').insert({
        conversation_id: convoId, sender_id: accountId, content: circleChatText(token), type: 'text', metadata: { circle_invite: token },
      });
      const err = imgErr || txtErr;
      if (err) {
        if (txtErr) await admin.from('circle_invitations').delete().eq('token', token);
        results.push({ id: rid, ok: false, error: err.message });
      } else {
        results.push({ id: rid, ok: true });
      }
    }
    return NextResponse.json({ results, sent: results.filter((r) => r.ok).length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
