import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(req: NextRequest) {
  try {
    // Authenticate via cookies (server-side)
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
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin status
    const admin = getAdminClient();
    const { data: profile } = await admin.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Not an admin' }, { status: 403 });
    }

    // Fetch verifications using admin client (bypasses RLS)
    const filter = req.nextUrl.searchParams.get('filter') || 'review';
    let query = admin
      .from('photo_verifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (filter === 'review') {
      query = query.in('status', ['pending', 'needs_review']);
    }

    const { data: verifications, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch profile info for each user
    const userIds = Array.from(new Set((verifications || []).map((v: any) => v.user_id)));
    let profiles: any[] = [];
    if (userIds.length > 0) {
      const { data } = await admin
        .from('profiles')
        .select('id, display_name, photo_urls')
        .in('id', userIds);
      profiles = data || [];
    }

    const profileMap = new Map(profiles.map((p: any) => [p.id, p]));

    const items = (verifications || []).map((v: any) => ({
      ...v,
      user_name: profileMap.get(v.user_id)?.display_name || 'Unknown',
      photo_urls: profileMap.get(v.user_id)?.photo_urls || [],
    }));

    return NextResponse.json({ items });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to load verifications' }, { status: 500 });
  }
}
