'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useAstrologySettings } from '@/stores/astrologySettingsStore';
import { api } from '@/lib/api';
import { initRevenueCat, tierFromEntitlements, resetRevenueCat } from '@/lib/revenuecat';
import { backfillProfileSigns } from '@/lib/profileSigns';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setSession, setProfile, setLoading } = useAuthStore();
  const { setTier, setLoading: setSubLoading } = useSubscriptionStore();
  const { hydrate: hydrateAstroSettings } = useAstrologySettings();

  useEffect(() => {
    // Hydrate astrology preferences from localStorage immediately
    hydrateAstroSettings();

    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.access_token) {
        api.setToken(session.access_token);
      }
      if (session?.user) {
        loadProfile(session.user.id);
        syncSubscription(session.user.id);
      } else {
        setSubLoading(false);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.access_token) {
        api.setToken(session.access_token);
      } else {
        api.setToken(null);
        resetRevenueCat();
        setTier('free');
        setProfile(null);
      }
      if (session?.user) {
        loadProfile(session.user.id);
        syncSubscription(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSession, setProfile, setLoading, setTier, setSubLoading, hydrateAstroSettings]);

  async function loadProfile(userId: string) {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, username, email, avatar_url, cover_photo_url, bio, sun_sign, moon_sign, rising_sign, starseed, human_design_type, birth_date, birth_time, birth_location, latitude, longitude, timezone, align_code, created_at, is_subscribed, is_admin, chat_theme')
        .eq('id', userId)
        .single();

      if (data) {
        setProfile(data);

        // Back-fill Sun / Moon / Rising if they were never stored. Nothing in
        // the app ever wrote these columns, so accounts show no zodiac chips
        // on their profile until they are populated once from the chart.
        // Fire-and-forget: the profile is already rendered by then.
        backfillProfileSigns(data)
          .then((written) => {
            if (written) setProfile({ ...data, ...written });
          })
          .catch(() => {});
      }
    } catch (err) {
      console.warn('[AuthProvider] Could not load profile:', err);
    }
  }

  async function syncSubscription(userId: string) {
    try {
      const purchases = initRevenueCat(userId);
      const customerInfo = await purchases.getCustomerInfo();
      const tier = tierFromEntitlements(customerInfo.entitlements.active);
      setTier(tier);
    } catch (err) {
      console.warn('[RevenueCat] Could not sync subscription:', err);
      setTier('free');
    } finally {
      setSubLoading(false);
    }
  }

  return <>{children}</>;
}
