// Public (token-gated) endpoint behind the Fifth Circle Accept / Decline links.
// The token is a 48-char random secret tied to exactly one invitation.
// A response notifies every admin (the founder) via in-app notification + push.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

const TOKEN_RE = /^[a-f0-9]{48}$/;

async function findInvitation(token: string) {
  if (!TOKEN_RE.test(token)) return null;
  const { data } = await getAdminClient()
    .from('circle_invitations')
    .select('id, user_id, status, profiles:user_id(display_name)')
    .eq('token', token)
    .maybeSingle();
  return data as any;
}

export async function GET(req: NextRequest) {
  const inv = await findInvitation(req.nextUrl.searchParams.get('token') || '');
  if (!inv) return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
  return NextResponse.json({ name: inv.profiles?.display_name || '', status: inv.status });
}

export async function POST(req: NextRequest) {
  try {
    const { token, response } = await req.json();
    if (response !== 'accept' && response !== 'decline') {
      return NextResponse.json({ error: 'Invalid response' }, { status: 400 });
    }
    const inv = await findInvitation(String(token || ''));
    if (!inv) return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });

    const status = response === 'accept' ? 'accepted' : 'declined';
    if (inv.status === status) return NextResponse.json({ status });

    const admin = getAdminClient();
    const { error } = await admin
      .from('circle_invitations')
      .update({ status, responded_at: new Date().toISOString() })
      .eq('id', inv.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Personal alert to the founder(s).
    const name = inv.profiles?.display_name || 'A member';
    const { data: admins } = await admin.from('profiles').select('id').eq('is_admin', true);
    for (const a of admins || []) {
      await admin.rpc('create_notification', {
        p_user_id: a.id,
        p_type: 'system',
        p_title: status === 'accepted' ? `✅ ${name} ACCEPTED The Fifth Circle` : `❌ ${name} DECLINED The Fifth Circle`,
        p_body: status === 'accepted'
          ? `${name} accepted their founding-member invitation.`
          : `${name} declined their founding-member invitation.`,
        p_data: { kind: 'circle_response', user_id: inv.user_id, status },
        p_actor_id: inv.user_id,
      });
    }
    return NextResponse.json({ status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
