// =============================================================================
// GET /api/connections/suggested?limit=12
// =============================================================================
// People-discovery for the signed-in user. 63.8% of members have zero
// connections and there was previously no surface anywhere that could change
// that.
//
// The underlying SQL function is service_role-only ON PURPOSE: it takes a user
// id as an argument, so exposing it to `authenticated` would let anyone request
// someone else's suggestions and infer their social graph. This route derives
// the id from the session cookie instead — the caller cannot choose it.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(req: NextRequest) {
  try {
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
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const limitParam = parseInt(req.nextUrl.searchParams.get('limit') || '12', 10);
    const limit = Math.min(Math.max(isNaN(limitParam) ? 12 : limitParam, 1), 50);

    const db = getAdminClient();
    const { data, error } = await db.rpc('suggested_connections', {
      p_user_id: user.id,
      p_limit: limit,
    });

    if (error) {
      // Migration not applied yet → empty list rather than a broken page.
      if (/does not exist/i.test(error.message)) {
        return NextResponse.json({ suggestions: [], pending: false });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      suggestions: data || [],
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
