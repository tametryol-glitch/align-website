// Post-signup provisioning — referral rewards, onboarding emails, affiliate
// attribution.
//
// This used to live only in /auth/callback, which runs when a user clicks the
// emailed confirmation link (or returns from Google OAuth). With email
// confirmation switched off in Supabase (mailer_autoconfirm), an email signup
// gets a session immediately and never passes through that callback — so the
// same work has to be callable from /api/auth/post-signup too.

import type { SupabaseClient } from '@supabase/supabase-js';
import { scheduleOnboardingEmails } from './emailService';

const AFFILIATE_ATTRIBUTION_URL =
  'https://align-api-v2-production.up.railway.app/api/v1/affiliates/attribute-signup';

type ProvisionUser = {
  id: string;
  email?: string | null;
  created_at?: string;
  user_metadata?: Record<string, unknown> | null;
};

/**
 * Runs the best-effort work that follows a successful signup. Never throws —
 * none of this is allowed to block the user getting into the app.
 *
 * @param supabase  Server client carrying the new user's session.
 * @param user      The freshly signed-up user.
 * @param refCode   Referral/affiliate code from the URL, if any. Falls back to
 *                  the code stored in user_metadata at signup.
 */
export async function provisionNewUser(
  supabase: SupabaseClient,
  user: ProvisionUser | null | undefined,
  refCode?: string | null,
): Promise<void> {
  if (!user) return;

  const code =
    refCode || (user.user_metadata?.referral_code as string | undefined) || null;
  let peerReferralProcessed = false;

  if (code) {
    try {
      // Look up referrer by align_code
      const { data: referrer } = await supabase
        .from('profiles')
        .select('id, bonus_readings, total_referrals')
        .eq('align_code', code)
        .single();

      if (referrer && referrer.id !== user.id) {
        peerReferralProcessed = true;

        // Create reward row
        await supabase
          .from('referral_rewards')
          .insert({
            referrer_id: referrer.id,
            referred_id: user.id,
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
          .eq('id', user.id)
          .single();

        await supabase
          .from('profiles')
          .update({
            bonus_readings: ((newProfile?.bonus_readings as number) || 0) + 5,
          })
          .eq('id', user.id);
      }
    } catch (e) {
      // Referral processing is best-effort — don't block auth
      console.error('Referral processing error:', e);
    }
  }

  // Schedule onboarding emails for new signups (fire-and-forget)
  const isNewUser =
    !!user.created_at && Date.now() - new Date(user.created_at).getTime() < 60_000;
  if (!isNewUser) return;

  const { data: emailProfile } = await supabase
    .from('profiles')
    .select('display_name, sun_sign')
    .eq('id', user.id)
    .single();

  const name =
    emailProfile?.display_name ||
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split('@')[0] ||
    'Stargazer';
  const sunSign = (emailProfile?.sun_sign as string) || 'Cosmic Soul';
  const email = user.email;

  if (email) {
    scheduleOnboardingEmails(user.id, email, name, sunSign).catch((err) =>
      console.error('[Post-signup] Email scheduling error:', err),
    );
  }

  // Affiliate signup attribution (fire-and-forget)
  // If the code wasn't matched as a peer referral, try it as an affiliate code.
  // The backend deduplicates, so this is safe even if the code is invalid.
  if (!peerReferralProcessed && code) {
    fetch(AFFILIATE_ATTRIBUTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        affiliate_code: code,
        user_id: user.id,
        source: 'web',
      }),
    }).catch((err) => console.error('[Post-signup] Affiliate attribution error:', err));
  }
}
