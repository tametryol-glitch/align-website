// Admin-gated API for publishing posts as the branded official content
// accounts into the social feed. All inserts/deletes go through the
// service-role client (which bypasses RLS) since the posts table's
// posts_insert policy requires auth.uid() = user_id.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { OFFICIAL_ACCOUNTS, isOfficialAccountId } from '@/lib/officialAccounts';

const OFFICIAL_IDS = OFFICIAL_ACCOUNTS.map((a) => a.id);

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

function getAuthClient(req: NextRequest) {
  return createServerClient(
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
}

async function verifyAdmin(req: NextRequest) {
  const supabase = getAuthClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = getAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) return null;
  return user;
}

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAdmin(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = getAdminClient();
    const { data, error } = await admin
      .from('posts')
      .select('id, user_id, content, image_url, created_at')
      .in('user_id', OFFICIAL_IDS)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ posts: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAdmin(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const accountId: string = body.accountId;
    const content: string = (body.content || '').trim();
    const imageUrl: string | null = body.imageUrl || null;

    if (!accountId || !isOfficialAccountId(accountId)) {
      return NextResponse.json({ error: 'Invalid official account' }, { status: 400 });
    }
    if (!content && !imageUrl) {
      return NextResponse.json({ error: 'Add some text or an image to publish.' }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data, error } = await admin
      .from('posts')
      .insert({
        user_id: accountId,
        type: imageUrl ? 'photo' : 'text',
        content: content || '',
        image_url: imageUrl || null,
        visibility: 'public',
        chart_data: {},
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ post: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await verifyAdmin(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing post id' }, { status: 400 });

    const admin = getAdminClient();

    // Only allow deleting posts that belong to an official account.
    const { data: existing, error: lookupErr } = await admin
      .from('posts')
      .select('user_id')
      .eq('id', id)
      .single();

    if (lookupErr) return NextResponse.json({ error: lookupErr.message }, { status: 500 });
    if (!existing || !isOfficialAccountId(existing.user_id)) {
      return NextResponse.json({ error: 'Not an official account post' }, { status: 403 });
    }

    const { error } = await admin.from('posts').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
