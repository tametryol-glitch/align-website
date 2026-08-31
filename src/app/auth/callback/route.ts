import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { provisionNewUser } from '@/lib/postSignupProvisioning';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const referralCode = requestUrl.searchParams.get('ref');
  const origin = requestUrl.origin;

  if (code) {
    const response = NextResponse.redirect(`${origin}/feed`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            response.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Referral rewards, onboarding emails and affiliate attribution.
      // Shared with /api/auth/post-signup, which covers email signups that
      // never pass through this callback (email confirmation switched off).
      await provisionNewUser(supabase, data.user, referralCode);

      return response;
    }
  }

  return NextResponse.redirect(`${origin}/auth/login`);
}
