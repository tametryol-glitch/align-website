import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { provisionNewUser } from '@/lib/postSignupProvisioning';

export const runtime = 'nodejs';

/**
 * POST /api/auth/post-signup
 *
 * Runs referral rewards, onboarding emails and affiliate attribution for a
 * signup that got a session straight away — i.e. email confirmation is off in
 * Supabase, so the user never clicks a link and never passes through
 * /auth/callback, where this work normally happens.
 *
 * Authenticated by the caller's own session cookie; provisioning only ever
 * runs for the user making the request, and only within the first minute of
 * that account existing.
 */
export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set() {},
        remove() {},
      },
    },
  );

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let ref: string | null = null;
  try {
    const body = await request.json();
    if (typeof body?.ref === 'string' && body.ref.trim()) ref = body.ref.trim();
  } catch {
    // No body is fine — provisionNewUser falls back to user_metadata.
  }

  try {
    await provisionNewUser(supabase, data.user, ref);
  } catch (err) {
    // Best-effort: never fail the signup over this.
    console.error('[post-signup] provisioning failed:', err);
  }

  return NextResponse.json({ ok: true });
}
