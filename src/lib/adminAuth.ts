// =============================================================================
// Admin auth for /api/admin/* — works for BOTH the web admin and the mobile app.
// =============================================================================
// • Web: the normal Supabase auth cookie (createServerClient → getUser).
// • App: `Authorization: Bearer <supabase access token>` — the app has no
//   cookies, so it sends its session token and we verify it with the auth
//   server before trusting it.
// Either way the member must have profiles.is_admin = true.
// =============================================================================

import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

/** The signed-in user's id (cookie or Bearer), or null. Does NOT check admin. */
export async function getRequestUserId(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('authorization');
  if (auth?.toLowerCase().startsWith('bearer ')) {
    const token = auth.slice(7).trim();
    if (!token) return null;
    const { data, error } = await getServiceClient().auth.getUser(token);
    return error || !data.user ? null : data.user.id;
  }
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
  return user?.id ?? null;
}

/** The admin's user id, or null if the caller is not a signed-in admin. */
export async function getAdminUserId(req: NextRequest): Promise<string | null> {
  const userId = await getRequestUserId(req);
  if (!userId) return null;
  const { data: profile } = await getServiceClient()
    .from('profiles').select('is_admin').eq('id', userId).single();
  return profile?.is_admin ? userId : null;
}

export async function verifyAdmin(req: NextRequest): Promise<boolean> {
  return !!(await getAdminUserId(req));
}
