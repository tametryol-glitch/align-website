// Admin-gated API for sending direct chat messages AS one of the official
// branded accounts (Align Daily / Cosmic Weather), so the founder doesn't have
// to message members from their personal account.
//
// Goes through the service-role client because messages_insert RLS requires
// auth.uid() = sender_id. The existing DB triggers (conversation meta, push
// notification via notify_new_message) fire on the insert as for any message.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OFFICIAL_ACCOUNTS, isOfficialAccountId } from '@/lib/officialAccounts';
import { getRequestUser } from '@/lib/adminAuth';

const MAX_RECIPIENTS = 25;
const MAX_LENGTH = 2000;

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

async function verifyAdmin(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return null;
  const admin = getAdminClient();
  const { data: profile } = await admin.from('profiles').select('is_admin').eq('id', user.id).single();
  return profile?.is_admin ? user : null;
}

// GET ?q=name — find members to message.
export async function GET(req: NextRequest) {
  try {
    if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const q = (req.nextUrl.searchParams.get('q') || '').replace(/[%_,()\\]/g, ' ').trim();
    if (q.length < 2) return NextResponse.json({ users: [] });

    const { data, error } = await getAdminClient()
      .from('profiles')
      .select('id, display_name, username, avatar_url')
      .or(`display_name.ilike.%${q}%,username.ilike.%${q}%`)
      .limit(15);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const officialIds = new Set<string>(OFFICIAL_ACCOUNTS.map((a) => a.id));
    return NextResponse.json({ users: (data || []).filter((u) => !officialIds.has(u.id)) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST { accountId, recipientIds: string[], content }
export async function POST(req: NextRequest) {
  try {
    if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const accountId: string = body.accountId;
    const content: string = (body.content || '').trim();
    const recipientIds: string[] = Array.isArray(body.recipientIds)
      ? Array.from(new Set<string>(body.recipientIds.filter((x: unknown) => typeof x === 'string')))
      : [];

    if (!accountId || !isOfficialAccountId(accountId)) {
      return NextResponse.json({ error: 'Invalid official account' }, { status: 400 });
    }
    if (!content) return NextResponse.json({ error: 'Write a message first.' }, { status: 400 });
    if (content.length > MAX_LENGTH) {
      return NextResponse.json({ error: `Message too long (max ${MAX_LENGTH} characters).` }, { status: 400 });
    }
    if (recipientIds.length === 0) return NextResponse.json({ error: 'Pick at least one recipient.' }, { status: 400 });
    if (recipientIds.length > MAX_RECIPIENTS) {
      return NextResponse.json({ error: `Max ${MAX_RECIPIENTS} recipients at once.` }, { status: 400 });
    }

    const admin = getAdminClient();
    const results: { id: string; ok: boolean; error?: string }[] = [];

    for (const rid of recipientIds) {
      if (isOfficialAccountId(rid)) {
        results.push({ id: rid, ok: false, error: 'Cannot message an official account' });
        continue;
      }
      const { data: convoId, error: rpcErr } = await admin.rpc('get_or_create_dm', {
        p_user1: accountId,
        p_user2: rid,
      });
      if (rpcErr || !convoId) {
        results.push({ id: rid, ok: false, error: rpcErr?.message || 'Could not open chat' });
        continue;
      }
      const { error: insErr } = await admin.from('messages').insert({
        conversation_id: convoId,
        sender_id: accountId,
        content,
        type: 'text',
        metadata: {},
      });
      results.push(insErr ? { id: rid, ok: false, error: insErr.message } : { id: rid, ok: true });
    }

    return NextResponse.json({ results, sent: results.filter((r) => r.ok).length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
