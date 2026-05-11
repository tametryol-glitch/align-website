'use client';

import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useAstrologySettings } from '@/stores/astrologySettingsStore';
import { createClient } from '@/lib/supabase';
import { getRevenueCatInstance } from '@/lib/revenuecat';
import { getZodiacGlyph } from '@/lib/utils';
import Link from 'next/link';

const HD_TYPE_EMOJI: Record<string, string> = {
  Generator: '⚙️', 'Manifesting Generator': '🔥',
  Projector: '👁️', Manifestor: '⚡', Reflector: '🌙',
};

function SettingRow({ label, value, href, destructive, onClick }: {
  label: string;
  value?: string;
  href?: string;
  destructive?: boolean;
  onClick?: () => void;
}) {
  const inner = (
    <div className="flex items-center px-6 py-3.5 border-b border-border-primary last:border-b-0 hover:bg-bg-card-hover transition-colors cursor-pointer">
      <span className={`flex-1 text-base ${destructive ? 'text-red-400' : 'text-text-primary'}`}>
        {label}
      </span>
      {value && <span className="text-sm text-text-muted mr-2">{value}</span>}
      <span className="text-xl text-text-muted">›</span>
    </div>
  );

  if (onClick) {
    return <button className="w-full text-left" onClick={onClick}>{inner}</button>;
  }
  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      {title && (
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-1">
          {title}
        </p>
      )}
      <div className="bg-bg-card border border-border-primary rounded-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}

const HOUSE_SYSTEM_LABELS: Record<string, string> = {
  placidus: 'Placidus', whole_sign: 'Whole Sign', koch: 'Koch',
  campanus: 'Campanus', regiomontanus: 'Regiomontanus',
  equal: 'Equal', porphyry: 'Porphyry', alcabitius: 'Alcabitius',
};

const JARGON_LABELS: Record<string, string> = {
  beginner: 'Beginner', standard: 'Standard', advanced: 'Advanced',
};

export default function ProfilePage() {
  const { user, profile, logout } = useAuthStore();
  const { tier } = useSubscriptionStore();
  const { houseSystem, jargonMode } = useAstrologySettings();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    logout();
    window.location.href = '/auth/login';
  }

  async function manageSubscription() {
    const purchases = getRevenueCatInstance();
    if (!purchases) return;
    try {
      const info = await purchases.getCustomerInfo();
      const managementUrl = info.managementURL;
      if (managementUrl) {
        window.open(managementUrl, '_blank');
      } else {
        window.location.href = '/pricing';
      }
    } catch {
      window.location.href = '/pricing';
    }
  }

  const displayName = profile?.display_name || user?.user_metadata?.name || 'Stargazer';
  const email = user?.email || 'Not signed in';
  const initial = (email)[0].toUpperCase();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-text-primary mb-6">Settings</h1>

      {/* User card with cover photo */}
      <div className="mb-6">
        {/* Cover photo banner */}
        <Link href="/profile/edit" className="block">
          <div className="h-[140px] sm:h-[180px] rounded-t-2xl overflow-hidden">
            {profile?.cover_photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.cover_photo_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1E1440] via-[#2D1B69] to-[#1A1035]" />
            )}
          </div>
        </Link>
        {/* Avatar + info card */}
        <div className="card rounded-t-none text-center">
          {/* Avatar centered, pulled up to overlap cover */}
          <div className="flex justify-center -mt-12 mb-3">
            <Link href="/profile/edit">
              <div className="w-20 h-20 rounded-full border-4 border-bg-card bg-accent-muted flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-accent-primary">{initial}</span>
                )}
              </div>
            </Link>
          </div>
          <p className="text-lg font-semibold text-text-primary">{displayName}</p>
          <p className="text-sm text-text-tertiary truncate">{email}</p>

          {/* Astrology sign badges */}
          {(profile?.sun_sign || profile?.moon_sign || profile?.rising_sign || profile?.starseed || profile?.human_design_type) && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              {profile?.sun_sign && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-bg-tertiary border border-border-primary text-xs font-semibold text-text-secondary">
                  {getZodiacGlyph(profile.sun_sign)} {profile.sun_sign}
                </span>
              )}
              {profile?.moon_sign && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-bg-tertiary border border-border-primary text-xs font-semibold text-text-secondary">
                  {getZodiacGlyph(profile.moon_sign)} {profile.moon_sign}
                </span>
              )}
              {profile?.rising_sign && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-bg-tertiary border border-border-primary text-xs font-semibold text-text-secondary">
                  {getZodiacGlyph(profile.rising_sign)} {profile.rising_sign}
                </span>
              )}
              {profile?.starseed && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-bg-tertiary border border-border-primary text-xs font-semibold text-text-secondary">
                  ✨ {profile.starseed}
                </span>
              )}
              {profile?.human_design_type && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-bg-tertiary border border-border-primary text-xs font-semibold text-text-secondary">
                  {HD_TYPE_EMOJI[profile.human_design_type] || '✴️'} {profile.human_design_type}
                </span>
              )}
            </div>
          )}

          <Link href="/profile/edit" className="text-xs text-accent-primary mt-3 inline-block hover:underline">
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Subscription card */}
      <div className="bg-gradient-cosmic border border-accent-muted rounded-2xl p-6 mb-6">
        <p className="text-lg font-semibold text-text-primary mb-1">
          {tier === 'free' ? 'Free Plan' : `${tier.charAt(0).toUpperCase() + tier.slice(1)} Membership`}
        </p>
        {tier === 'free' ? (
          <>
            <p className="text-sm text-text-tertiary mb-4">Upgrade for more features</p>
            <Link href="/pricing" className="btn-primary inline-block text-sm py-3 px-8 text-center">
              Subscribe
            </Link>
          </>
        ) : (
          <>
            <p className="text-2xl font-bold text-gold-primary mb-4">
              {tier === 'light' ? '$9' : tier === 'premium' ? '$19' : '$29'}/mo
            </p>
            <button onClick={manageSubscription} className="btn-primary text-sm py-3 px-8">
              Manage Subscription
            </button>
          </>
        )}
      </div>

      {/* Preferences */}
      <SettingSection title="Preferences">
        <SettingRow label="Language" value="English" href="/settings" />
        <SettingRow label="Jargon Mode" value={JARGON_LABELS[jargonMode] || 'Standard'} href="/settings/astrology" />
        <SettingRow label="House System" value={HOUSE_SYSTEM_LABELS[houseSystem] || 'Whole Sign'} href="/settings/astrology" />
        <SettingRow label="Notifications" href="/settings" />
      </SettingSection>

      {/* About */}
      <SettingSection title="About">
        <SettingRow label="About Align" href="/about" />
        <SettingRow label="Privacy Policy" href="/privacy" />
        <SettingRow label="Terms of Service" href="/terms" />
        <SettingRow label="Restore Purchases" onClick={manageSubscription} />
      </SettingSection>

      {/* Logout */}
      <SettingSection title="">
        <SettingRow label="Sign Out" destructive onClick={handleLogout} />
      </SettingSection>
    </div>
  );
}
