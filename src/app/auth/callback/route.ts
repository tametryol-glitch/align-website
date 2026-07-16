import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { scheduleOnboardingEmails } from '@/lib/emailService';

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
      // Process referral if a ref code was passed through
      const refCode = referralCode || data.user?.user_metadata?.referral_code;
      let peerReferralProcessed = false;

      if (refCode && data.user) {
        try {
          // Look up referrer by align_code
          const { data: referrer } = await supabase
            .from('profiles')
            .select('id, bonus_readings, total_referrals')
            .eq('align_code', refCode)
            .single();

          if (referrer && referrer.id !== data.user.id) {
            peerReferralProcessed = true;

            // Create reward row
            await supabase
              .from('referral_rewards')
              .insert({
                referrer_id: referrer.id,
                referred_id: data.user.id,
                reward_type: 'bonus_readings',
                reward_amount: 5,
              });

            // Increment referrer stats
            await supabase
              .from('profiles')
              .update({
                bonus_readings: (referrer.bonus_readings || 0) + 5,
                total_referrals: (referrer.total_referrals || 0) + 1,
              })
              .eq('id', referrer.id);

            // Increment new user bonus_readings
            const { data: newProfile } = await supabase
              .from('profiles')
              .select('bonus_readings')
              .eq('id', data.user.id)
              .single();

            await supabase
              .from('profiles')
              .update({
                bonus_readings: ((newProfile?.bonus_readings as number) || 0) + 5,
              })
              .eq('id', data.user.id);
          }
        } catch (e) {
          // Referral processing is best-effort — don't block auth
          console.error('Referral processing error:', e);
        }
      }
      // Schedule onboarding emails for new signups (fire-and-forget)
      if (data.user) {
        const user = data.user;
        const isNewUser =
          user.created_at &&
          Date.now() - new Date(user.created_at).getTime() < 60_000;

        if (isNewUser) {
          const { data: emailProfile } = await supabase
            .from('profiles')
            .select('display_name, sun_sign')
            .eq('id', user.id)
            .single();

          const name =
            emailProfile?.display_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            'Stargazer';
          const sunSign = (emailProfile?.sun_sign as string) || 'Cosmic Soul';
          const email = user.email;

          if (email) {
            scheduleOnboardingEmails(user.id, email, name, sunSign).catch(
              (err) => console.error('[Auth Callback] Email scheduling error:', err),
            );
          }

          // Affiliate signup attribution (fire-and-forget)
          // If refCode wasn't matched as a peer referral, try it as an affiliate code.
          // The backend deduplicates, so this is safe even if the code is invalid.
          if (!peerReferralProcessed && refCode) {
            fetch(
              'https://align-api-v2-production.up.railway.app/api/v1/affiliates/attribute-signup',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  affiliate_code: refCode,
                  user_id: user.id,
                  source: 'web',
                }),
              },
            ).catch((err) =>
              console.error('[Auth Callback] Affiliate attribution error:', err),
            );
          }
        }
      }

      return response;
    }
  }

  return NextResponse.redirect(`${origin}/auth/login`);
}
