'use client';

import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { createClient } from '@/lib/supabase';
import { getRevenueCatInstance } from '@/lib/revenuecat';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '@/i18n';
import { Settings, CreditCard, LogOut, User, Globe, Bell, Shield, ChevronRight, Pencil, Star, Heart, FileText, BookOpen, ShieldCheck, Palette, Trash2, Info, Crown, Users, DollarSign, Flag, Gift } from 'lucide-react';

export default function SettingsPage() {
  const { user, profile, logout } = useAuthStore();
  const { tier } = useSubscriptionStore();
  const { t, i18n } = useTranslation();

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

  async function handleDeleteAccount() {
    try {
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;
      // Delete profile data
      await supabase.from('profiles').delete().eq('id', currentUser.id);
      // Sign out
      await supabase.auth.signOut();
      logout();
      window.location.href = '/';
    } catch (err) {
      console.error('Delete account error:', err);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-text-primary mb-6 flex items-center gap-3">
        <Settings className="w-7 h-7 text-accent-primary" />
        {t('settings.title')}
      </h1>

      {/* Account */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-primary flex items-center gap-2">
            <User className="w-4 h-4" /> {t('settings.account')}
          </h3>
          <Link href="/profile/edit" className="text-xs text-accent-primary flex items-center gap-1 hover:underline">
            <Pencil className="w-3 h-3" /> {t('profile.editProfile')}
          </Link>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-text-tertiary">{t('settings.email')}</span>
            <span className="text-sm text-text-primary">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-text-tertiary">{t('settings.name')}</span>
            <span className="text-sm text-text-primary">
              {profile?.display_name || user?.user_metadata?.name || t('settings.notSet')}
            </span>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="card mb-4">
        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4" /> {t('settings.subscription')}
        </h3>
        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-sm text-text-primary font-medium">
              {t('settings.planLabel', { plan: tier.charAt(0).toUpperCase() + tier.slice(1) })}
            </span>
            <p className="text-xs text-text-muted mt-0.5">
              {tier === 'free' ? t('settings.upgradeHint') : t('settings.managedVia')}
            </p>
          </div>
          {tier !== 'free' ? (
            <button onClick={manageSubscription} className="btn-secondary text-sm">
              {t('settings.manage')}
            </button>
          ) : (
            <Link href="/pricing" className="btn-primary text-sm">
              {t('settings.upgrade')}
            </Link>
          )}
        </div>
      </div>

      {/* Quick links to sub-settings */}
      <div className="card mb-4 divide-y divide-border-primary">
        <Link href="/settings/chat-theme" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors -mx-6 px-6">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <Palette className="w-4 h-4 text-text-muted" /> {t('settings.subPages.chatTheme')}
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/settings/notifications" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors -mx-6 px-6">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <Bell className="w-4 h-4 text-text-muted" /> {t('settings.subPages.notifications')}
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/settings/privacy" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors -mx-6 px-6">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <Shield className="w-4 h-4 text-text-muted" /> {t('settings.subPages.privacy')}
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/settings/astrology" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors -mx-6 px-6">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <Star className="w-4 h-4 text-text-muted" /> {t('settings.subPages.astrologyPreferences')}
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/settings/friends" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors -mx-6 px-6">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <Users className="w-4 h-4 text-text-muted" /> {t('settings.subPages.friends')}
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/settings/referrals" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors -mx-6 px-6">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <Gift className="w-4 h-4 text-accent-primary" /> {t('settings.subPages.referrals')}
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/settings/subscription" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors -mx-6 px-6">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <CreditCard className="w-4 h-4 text-text-muted" /> {t('settings.subPages.subscriptionPlans')}
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/settings/dating-identity" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors -mx-6 px-6">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <Heart className="w-4 h-4 text-text-muted" /> {t('settings.subPages.datingIdentity')}
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/settings/relationship-intent" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors -mx-6 px-6">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <Heart className="w-4 h-4 text-text-muted" /> {t('settings.subPages.relationshipIntent')}
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/settings/connection-preferences" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors -mx-6 px-6">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <Heart className="w-4 h-4 text-text-muted" /> {t('settings.subPages.connectionPreferences')}
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/settings/identity-privacy" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors -mx-6 px-6">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <Shield className="w-4 h-4 text-text-muted" /> {t('settings.subPages.identityPrivacy')}
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/settings/safety" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors -mx-6 px-6">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <ShieldCheck className="w-4 h-4 text-text-muted" /> {t('settings.subPages.safety')}
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/settings/terms" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors -mx-6 px-6">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <FileText className="w-4 h-4 text-text-muted" /> {t('settings.subPages.termsOfService')}
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/settings/community-guidelines" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors -mx-6 px-6">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <BookOpen className="w-4 h-4 text-text-muted" /> {t('settings.subPages.communityGuidelines')}
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
      </div>

      {/* Language */}
      <div className="card mb-4">
        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4" /> {t('settings.language')}
        </h3>
        <select
          className="input"
          value={i18n.language}
          onChange={(e) => changeLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="it">Italiano</option>
          <option value="pt">Português (Brasil)</option>
          <option value="ja">日本語</option>
          <option value="ko">한국어</option>
          <option value="zh">中文</option>
          <option value="ar">العربية</option>
          <option value="hi">हिन्दी</option>
          <option value="tr">Türkçe</option>
          <option value="ru">Русский</option>
          <option value="nl">Nederlands</option>
          <option value="pl">Polski</option>
          <option value="sv">Svenska</option>
          <option value="da">Dansk</option>
          <option value="no">Norsk</option>
          <option value="fi">Suomi</option>
          <option value="th">ไทย</option>
        </select>
      </div>

      {/* Admin */}
      {profile?.is_admin && (
        <div className="card mb-4">
          <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
            <Crown className="w-4 h-4 text-accent-primary" /> {t('settings.admin.title')}
          </h3>
          <div className="divide-y divide-border-primary -mx-6">
            <Link href="/admin" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors px-6">
              <span className="flex items-center gap-3 text-sm text-text-primary">
                <Users className="w-4 h-4 text-text-muted" /> {t('settings.admin.manageUsers')}
              </span>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>
            <Link href="/admin?tab=moderation" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors px-6">
              <span className="flex items-center gap-3 text-sm text-text-primary">
                <Flag className="w-4 h-4 text-text-muted" /> {t('settings.admin.contentModeration')}
              </span>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>
            <Link href="/admin/celebrities" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors px-6">
              <span className="flex items-center gap-3 text-sm text-text-primary">
                <Star className="w-4 h-4 text-text-muted" /> {t('settings.admin.manageCelebrities')}
              </span>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>
            <Link href="/admin/payouts" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors px-6">
              <span className="flex items-center gap-3 text-sm text-text-primary">
                <DollarSign className="w-4 h-4 text-text-muted" /> {t('settings.admin.payoutQueue')}
              </span>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>
          </div>
        </div>
      )}

      {/* About */}
      <div className="card mb-4">
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Info className="w-4 h-4" /> {t('settings.about')}
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">{t('settings.aboutSection.version')}</span>
            <span className="text-sm text-text-muted">2.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">{t('settings.aboutSection.poweredBy')}</span>
            <span className="text-sm text-text-muted">Swiss Ephemeris · Claude AI</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">{t('settings.aboutSection.contact')}</span>
            <a href="mailto:tametryol@gmail.com" className="text-sm text-accent-primary hover:underline">tametryol@gmail.com</a>
          </div>
          <Link href="/founder" className="flex items-center justify-between py-1 group">
            <span className="text-sm text-text-secondary">Meet the Founder</span>
            <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors" />
          </Link>
        </div>
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="w-full card flex items-center gap-3 text-red-400 hover:bg-red-400/5">
        <LogOut className="w-5 h-5" />
        <span className="font-medium">{t('settings.signOut')}</span>
      </button>

      {/* Delete Account */}
      <div className="mt-4">
        <button
          onClick={() => {
            if (confirm(t('settings.deleteConfirm.message'))) {
              if (confirm(t('settings.deleteConfirm.message'))) {
                handleDeleteAccount();
              }
            }
          }}
          className="w-full text-center text-sm text-red-400 hover:text-red-300 py-2"
        >
          {t('settings.deleteAccount')}
        </button>
      </div>
    </div>
  );
}
