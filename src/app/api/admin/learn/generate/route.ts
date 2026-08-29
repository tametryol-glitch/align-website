import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

/**
 * Thin proxy to the generator in align-api-v2.
 *
 * The generation itself lives there because that is where the Anthropic key,
 * the cost tracking and the curriculum constants (Align rulership, glossary)
 * already are. This route exists so the admin page can call it with the
 * session it already has, and so the admin check is enforced on both sides
 * rather than trusting the browser.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://align-api-v2-production.up.railway.app/api/v1';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
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

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = getAdminClient();
    const { data: profile } = await admin
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();
    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Admins only' }, { status: 403 });
    }

    const spec = await req.json();

    // Generation runs for a while — a lesson is a lot of reasoning.
    const res = await fetch(`${API_BASE}/learn-authoring/generate-lesson`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(spec),
      signal: AbortSignal.timeout(300_000),
    });

    const body = await res.json().catch(() => ({ error: 'Generator returned no JSON' }));
    return NextResponse.json(body, { status: res.status });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
