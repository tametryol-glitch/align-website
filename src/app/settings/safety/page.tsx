'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Star, X } from 'lucide-react';

interface PrivacySettings {
  hideAge: boolean;
  hideExactLocation: boolean;
  hideLastActive: boolean;
  hideFullBirthChart: boolean;
  incognitoMode: boolean;
  showOnlineStatus: boolean;
  minimumTrustLevel: number;
  blockUnverified: boolean;
}

interface BlockedUser {
  user_id: string;
  display_name: string;
  blocked_at: string;
}

interface Report {
  id: string;
  category: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

const DEFAULT_PRIVACY: PrivacySettings = {
  hideAge: false,
  hideExactLocation: false,
  hideLastActive: false,
  hideFullBirthChart: false,
  incognitoMode: false,
  showOnlineStatus: true,
  minimumTrustLevel: 1,
  blockUnverified: false,
};

const TRUST_LEVELS = [
  { level: 1, name: 'New' },
  { level: 2, name: 'Verified' },
  { level: 3, name: 'Trusted' },
  { level: 4, name: 'Established' },
  { level: 5, name: 'Elder' },
];

const TOGGLE_FIELDS: Array<{
  key: keyof PrivacySettings;
  label: string;
  description: string;
}> = [
  { key: 'hideAge', label: 'Hide Age', description: 'Show your zodiac sign instead of age' },
  { key: 'hideExactLocation', label: 'Hide Location', description: 'Show "nearby" instead of exact distance' },
  { key: 'hideLastActive', label: 'Hide Last Active', description: 'Others won\'t see when you were last online' },
  { key: 'hideFullBirthChart', label: 'Hide Full Birth Chart', description: 'Only show Sun, Moon, and Rising signs' },
  { key: 'incognitoMode', label: 'Incognito Mode', description: 'Don\'t appear in discovery feeds' },
  { key: 'showOnlineStatus', label: 'Show Online Status', description: 'Let others see when you are active' },
];

function getStatusStyle(status: string): { bg: string; text: string; label: string } {
  switch (status) {
    case 'pending': return { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', label: 'Pending' };
    case 'reviewed': return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6', label: 'Reviewed' };
    case 'resolved': return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', label: 'Resolved' };
    default: return { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', label: 'Pending' };
  }
}

export default function SafetyPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [privacy, setPrivacy] = useState<PrivacySettings>(DEFAULT_PRIVACY);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [trustScore, setTrustScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadSafetyData();
  }, [user]);

  async function loadSafetyData() {
    if (!user?.id) return;
    const supabase = createClient();

    // Load privacy settings
    const { data: privacyData } = await supabase
      .from('privacy_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (privacyData) {
      setPrivacy({
        hideAge: privacyData.hide_age ?? false,
        hideExactLocation: privacyData.hide_exact_location ?? false,
        hideLastActive: privacyData.hide_last_active ?? false,
        hideFullBirthChart: privacyData.hide_full_birth_chart ?? false,
        incognitoMode: privacyData.incognito_mode ?? false,
        showOnlineStatus: privacyData.show_online_status ?? true,
        minimumTrustLevel: privacyData.minimum_trust_level ?? 1,
        blockUnverified: privacyData.block_unverified ?? false,
      });
    }

    // Load blocked users
    const { data: blocked } = await supabase
      .from('blocked_users')
      .select('user_id, display_name, blocked_at')
      .eq('blocker_id', user.id);
    if (blocked) setBlockedUsers(blocked);

    // Load reports
    const { data: reportData } = await supabase
      .from('reports')
      .select('id, category, description, status, created_at')
      .eq('reporter_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    if (reportData) setReports(reportData);

    // Calculate trust score (simplified)
    let score = 40; // base
    if (user.email_confirmed_at) score += 15;
    if (user.user_metadata?.avatar_url) score += 10;
    if ((blocked?.length || 0) === 0) score += 10;
    if ((reportData?.length || 0) === 0) score += 15;
    score += 10; // active user bonus
    setTrustScore(Math.min(100, score));

    setLoading(false);
  }

  async function updatePrivacy(key: keyof PrivacySettings, value: boolean | number) {
    if (!user?.id) return;
    const updated = { ...privacy, [key]: value };
    setPrivacy(updated);

    const supabase = createClient();
    await supabase
      .from('privacy_settings')
      .upsert({
        user_id: user.id,
        hide_age: updated.hideAge,
        hide_exact_location: updated.hideExactLocation,
        hide_last_active: updated.hideLastActive,
        hide_full_birth_chart: updated.hideFullBirthChart,
        incognito_mode: updated.incognitoMode,
        show_online_status: updated.showOnlineStatus,
        minimum_trust_level: updated.minimumTrustLevel,
        block_unverified: updated.blockUnverified,
      }, { onConflict: 'user_id' });
  }

  async function unblockUser(userId: string) {
    if (!user?.id) return;
    const supabase = createClient();
    await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_id', user.id)
      .eq('user_id', userId);
    setBlockedUsers(prev => prev.filter(u => u.user_id !== userId));
  }

  const levelName = TRUST_LEVELS.find(l => l.level === Math.ceil(trustScore / 20))?.name || 'New';

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/settings" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> {t('common.settings')}
      </Link>

      <h1 className="text-2xl font-display font-bold text-text-primary mb-6 flex items-center gap-3">
        <ShieldCheck className="w-7 h-7 text-accent-primary" />
        {t('settings.safety.title')}
      </h1>

      {/* Trust Score */}
      <div className="card mb-5 text-center py-6">
        <div className="relative w-32 h-32 mx-auto mb-3">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(155,111,246,0.15)" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="50" fill="none"
              stroke="#9B6FF6" strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(trustScore / 100) * 314} 314`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-accent-primary">{trustScore}</span>
            <span className="text-[10px] text-text-muted">/ 100</span>
          </div>
        </div>
        <p className="text-sm font-semibold text-gold-primary">{levelName}</p>
        <p className="text-xs text-text-muted">Cosmic Alignment Score</p>
      </div>

      {/* Privacy Controls */}
      <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Privacy Controls</h2>
      <div className="card mb-5 divide-y divide-border-primary">
        {TOGGLE_FIELDS.map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between py-3.5 px-1">
            <div className="flex-1 mr-4">
              <p className="text-sm font-medium text-text-primary">{label}</p>
              <p className="text-xs text-text-muted mt-0.5">{description}</p>
            </div>
            <button
              onClick={() => updatePrivacy(key, !privacy[key])}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                privacy[key] ? 'bg-accent-primary' : 'bg-bg-tertiary'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${
                privacy[key] ? 'left-[22px]' : 'left-0.5'
              }`} />
            </button>
          </div>
        ))}
      </div>

      {/* Trust Filters */}
      <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Trust Filters</h2>
      <div className="card mb-5">
        <div className="py-3.5 px-1 border-b border-border-primary">
          <p className="text-sm font-medium text-text-primary mb-2">Minimum Trust Level to Message You</p>
          <div className="flex gap-2">
            {TRUST_LEVELS.map(({ level }) => (
              <button
                key={level}
                onClick={() => updatePrivacy('minimumTrustLevel', level)}
                className={`w-10 h-10 rounded-full text-sm font-bold transition-colors ${
                  privacy.minimumTrustLevel === level
                    ? 'bg-accent-primary text-white'
                    : 'bg-bg-tertiary text-text-muted border border-border-primary'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="text-xs text-text-tertiary mt-2">
            Level {privacy.minimumTrustLevel}: {TRUST_LEVELS.find(l => l.level === privacy.minimumTrustLevel)?.name}
          </p>
        </div>
        <div className="flex items-center justify-between py-3.5 px-1">
          <div className="flex-1 mr-4">
            <p className="text-sm font-medium text-text-primary">Block Unverified Users</p>
            <p className="text-xs text-text-muted mt-0.5">Only verified users can contact you</p>
          </div>
          <button
            onClick={() => updatePrivacy('blockUnverified', !privacy.blockUnverified)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              privacy.blockUnverified ? 'bg-accent-primary' : 'bg-bg-tertiary'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${
              privacy.blockUnverified ? 'left-[22px]' : 'left-0.5'
            }`} />
          </button>
        </div>
      </div>

      {/* Blocked Users */}
      <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Blocked Users</h2>
      <div className="card mb-5">
        {blockedUsers.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-2xl block mb-2">✨</span>
            <p className="text-sm text-text-muted">No blocked users</p>
          </div>
        ) : (
          <div className="divide-y divide-border-primary">
            {blockedUsers.map((blocked) => (
              <div key={blocked.user_id} className="flex items-center justify-between py-3 px-1">
                <div>
                  <p className="text-sm text-text-primary">{blocked.display_name}</p>
                  <p className="text-[10px] text-text-muted">
                    Blocked {new Date(blocked.blocked_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => unblockUser(blocked.user_id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 transition-colors"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Reports */}
      <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">My Reports</h2>
      <div className="card mb-5">
        {reports.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-2xl block mb-2">📋</span>
            <p className="text-sm text-text-muted">No reports submitted</p>
          </div>
        ) : (
          <div className="divide-y divide-border-primary">
            {reports.map((report) => {
              const style = getStatusStyle(report.status);
              return (
                <div key={report.id} className="flex items-center justify-between py-3 px-1">
                  <div className="flex-1 mr-3">
                    <p className="text-sm text-text-primary font-medium capitalize">
                      {report.category.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{report.description}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      {new Date(report.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-md"
                    style={{ backgroundColor: style.bg, color: style.text }}
                  >
                    {style.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
