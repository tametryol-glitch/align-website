'use client';

import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { createClient } from '@/lib/supabase';
import { getRevenueCatInstance } from '@/lib/revenuecat';
import Link from 'next/link';
import { Settings, CreditCard, LogOut, User, Globe, Bell, Shield, ChevronRight, Pencil, Star, Zap, Heart, FileText, BookOpen, ShieldCheck, Palette, Trash2, Info, Crown, Users, DollarSign, Flag } from 'lucide-react';

export default function SettingsPage() {
  const { user, profile, logout } = useAuthStore();
  const { tier } = useSubscriptionStore();

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
        Settings
      </h1>

      {/* Account */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-primary flex items-center gap-2">
            <User className="w-4 h-4" /> Account
          </h3>
          <Link href="/profile/edit" className="text-xs text-accent-primary flex items-center gap-1 hover:underline">
            <Pencil className="w-3 h-3" /> Edit Profile
          </Link>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-text-tertiary">Email</span>
            <span className="text-sm text-text-primary">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-text-tertiary">Name</span>
            <span className="text-sm text-text-primary">
              {profile?.display_name || user?.user_metadata?.name || 'Not set'}
            </span>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="card mb-4">
        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4" /> Subscription
        </h3>
        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-sm text-text-primary font-medium">
              {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
            </span>
            <p className="text-xs text-text-muted mt-0.5">
              {tier === 'free' ? 'Upgrade for more features' : 'Managed via RevenueCat'}
            </p>
          </div>
          {tier !== 'free' ? (
            <button onClick={manageSubscription} className="btn-secondary text-sm">
              Manage
            </button>
          ) : (
            <Link href="/pricing" className="btn-primary text-sm">
              Upgrade
            </Link>
          )}
        </div>
      </div>

      {/* Quick links to sub-settings */}
      <div className="card mb-4 divide-y divide-border-primary">
        <Link href="/settings/chat-theme" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors -mx-6 px-6">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <Palette className="w-4 h-4 text-text-muted" /> Chat Theme
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/settings/notifications" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors -mx-6 px-6">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <Bell className="w-4 h-4 text-text-muted" /> Notifications
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/settings/privacy" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors -mx-6 px-6">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <Shield className="w-4 h-4 text-text-muted" /> Privacy
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/settings/astrology" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors -mx-6 px-6">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <Star className="w-4 h-4 text-text-muted" /> Astrology Preferences
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/settings/cosmic-alerts" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors -mx-6 px-6">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <Zap className="w-4 h-4 text-text-muted" /> Cosmic Alert Preferences
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/settings/dating-identity" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors -mx-6 px-6">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <Heart className="w-4 h-4 text-text-muted" /> Dating Identity
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/settings/relationship-intent" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors -mx-6 px-6">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <Heart className="w-4 h-4 text-text-muted" /> Relationship Intent
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/settings/connection-preferences" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors -mx-6 px-6">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <Heart className="w-4 h-4 text-text-muted" /> Connection Preferences
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/settings/identity-privacy" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors -mx-6 px-6">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <Shield className="w-4 h-4 text-text-muted" /> Identity Privacy
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/settings/safety" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors -mx-6 px-6">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <ShieldCheck className="w-4 h-4 text-text-muted" /> Safety
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/settings/terms" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors -mx-6 px-6">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <FileText className="w-4 h-4 text-text-muted" /> Terms of Service
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
        <Link href="/settings/community-guidelines" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors -mx-6 px-6">
          <span className="flex items-center gap-3 text-sm text-text-primary">
            <BookOpen className="w-4 h-4 text-text-muted" /> Community Guidelines
          </span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </Link>
      </div>

      {/* Language */}
      <div className="card mb-4">
        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4" /> Language
        </h3>
        <select className="input">
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="it">Italiano</option>
          <option value="pt">Português</option>
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
            <Crown className="w-4 h-4 text-accent-primary" /> Admin
          </h3>
          <div className="divide-y divide-border-primary -mx-6">
            <Link href="/admin" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors px-6">
              <span className="flex items-center gap-3 text-sm text-text-primary">
                <Users className="w-4 h-4 text-text-muted" /> Manage User Accounts
              </span>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>
            <Link href="/admin?tab=moderation" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors px-6">
              <span className="flex items-center gap-3 text-sm text-text-primary">
                <Flag className="w-4 h-4 text-text-muted" /> Content Moderation
              </span>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>
            <Link href="/admin/celebrities" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors px-6">
              <span className="flex items-center gap-3 text-sm text-text-primary">
                <Star className="w-4 h-4 text-text-muted" /> Manage Celebrities
              </span>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>
            <Link href="/admin/payouts" className="flex items-center justify-between py-3.5 hover:bg-bg-tertiary transition-colors px-6">
              <span className="flex items-center gap-3 text-sm text-text-primary">
                <DollarSign className="w-4 h-4 text-text-muted" /> Payout Queue
              </span>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </Link>
          </div>
        </div>
      )}

      {/* About */}
      <div className="card mb-4">
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Info className="w-4 h-4" /> About
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Version</span>
            <span className="text-sm text-text-muted">2.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Powered by</span>
            <span className="text-sm text-text-muted">Swiss Ephemeris · Claude AI</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Contact</span>
            <a href="mailto:tametryol@gmail.com" className="text-sm text-accent-primary hover:underline">tametryol@gmail.com</a>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="w-full card flex items-center gap-3 text-red-400 hover:bg-red-400/5">
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Sign Out</span>
      </button>

      {/* Delete Account */}
      <div className="mt-4">
        <button
          onClick={() => {
            if (confirm('Are you sure you want to delete your account? This will permanently remove all your data including posts, messages, charts, and readings. This action cannot be undone.')) {
              if (confirm('This is your last chance. Are you absolutely sure you want to delete your account forever?')) {
                handleDeleteAccount();
              }
            }
          }}
          className="w-full text-center text-sm text-red-400 hover:text-red-300 py-2"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
