'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { getReferralStats, getMyReferralLink, type ReferralStats } from '@/lib/referralService';
import { Copy, Check, Share2, Users, Sparkles, Gift } from 'lucide-react';

export default function ReferralCard() {
  const { t } = useTranslation();
  const { user, profile } = useAuthStore();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const alignCode = profile?.align_code;
  const referralLink = alignCode ? getMyReferralLink(alignCode) : '';

  useEffect(() => {
    if (user?.id) {
      getReferralStats(user.id)
        .then(setStats)
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  async function handleCopy() {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt('Copy this link:', referralLink);
    }
  }

  async function handleShare() {
    if (!referralLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on Align',
          text: 'Discover your cosmic blueprint with AI-powered astrology. We both get 5 bonus readings!',
          url: referralLink,
        });
        return;
      } catch {
        // User cancelled — fall through to copy
      }
    }
    handleCopy();
  }

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-bg-tertiary rounded w-1/3 mb-4" />
        <div className="h-4 bg-bg-tertiary rounded w-2/3 mb-3" />
        <div className="h-10 bg-bg-tertiary rounded mb-3" />
        <div className="h-8 bg-bg-tertiary rounded w-1/2" />
      </div>
    );
  }

  return (
    <div className="card border border-accent-primary/20 bg-gradient-to-br from-bg-card via-bg-card to-accent-primary/5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center">
          <Gift className="w-5 h-5 text-accent-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">{t('components.referralCard.title')}</h3>
          <p className="text-xs text-text-muted">You both get 5 bonus readings!</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-bg-tertiary/50 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Users className="w-4 h-4 text-accent-primary" />
            <span className="text-lg font-bold text-text-primary">
              {stats?.totalReferrals || 0}
            </span>
          </div>
          <p className="text-xs text-text-muted">Friends invited</p>
        </div>
        <div className="bg-bg-tertiary/50 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-lg font-bold text-text-primary">
              {stats?.bonusReadings || 0}
            </span>
          </div>
          <p className="text-xs text-text-muted">Bonus readings</p>
        </div>
      </div>

      {/* Referral Link */}
      {alignCode ? (
        <>
          <label className="text-xs font-medium text-text-tertiary mb-1.5 block">
            Your referral link
          </label>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 bg-bg-primary border border-border-primary rounded-lg px-3 py-2.5 text-sm text-text-secondary truncate">
              {referralLink}
            </div>
            <button
              onClick={handleCopy}
              className="p-2.5 rounded-lg bg-accent-primary/10 hover:bg-accent-primary/20 transition-colors"
              title={copied ? t('common.copied') : t('components.referralCard.copyLink')}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-accent-primary" />
              )}
            </button>
          </div>

          {/* Share Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? t('common.copied') : t('components.referralCard.copyLink')}
            </button>
            <button
              onClick={handleShare}
              className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm"
            >
              <Share2 className="w-4 h-4" />
              {t('common.share')}
            </button>
          </div>
        </>
      ) : (
        <p className="text-sm text-text-muted text-center py-3">
          Complete your profile to get a referral link.
        </p>
      )}

      {/* Recent Rewards */}
      {stats && stats.rewards.length > 0 && (
        <div className="mt-5 pt-4 border-t border-border-primary">
          <h4 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">
            Recent Rewards
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {stats.rewards.slice(0, 5).map((reward) => (
              <div
                key={reward.id}
                className="flex items-center justify-between py-2 px-3 bg-bg-tertiary/30 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-sm text-text-secondary">
                    +{reward.reward_amount} bonus readings
                  </span>
                </div>
                <span className="text-xs text-text-muted">
                  {new Date(reward.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
