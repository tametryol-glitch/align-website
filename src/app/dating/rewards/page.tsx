'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import {
  getRewardBalance,
  getRewardEvents,
  getAvailablePerks,
  getActivePerks,
  redeemPerk,
} from '@/lib/connectionRewardService';
import type { RewardBalance, RewardEvent, RewardPerk, RewardRedemption } from '@/lib/connectionRewardService';
import { Sparkles, Star, Heart, Users, Gift, Clock, TrendingUp, Zap } from 'lucide-react';

export default function DatingRewardsPage() {
  const { user } = useAuthStore();
  const { tier } = useSubscriptionStore();

  const [balance, setBalance] = useState<RewardBalance | null>(null);
  const [events, setEvents] = useState<RewardEvent[]>([]);
  const [perks, setPerks] = useState<RewardPerk[]>([]);
  const [activePerks, setActivePerks] = useState<RewardRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [activeTab, setActiveTab] = useState<'perks' | 'active' | 'history'>('perks');

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const [bal, evts, prks, active] = await Promise.all([
      getRewardBalance(user.id),
      getRewardEvents(user.id, 20),
      getAvailablePerks(),
      getActivePerks(user.id),
    ]);
    setBalance(bal);
    setEvents(evts);
    setPerks(prks);
    setActivePerks(active);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRedeem = async (perk: RewardPerk) => {
    if (!user?.id || redeeming) return;

    const tierOrder = ['free', 'light', 'premium', 'pro'];
    if (tierOrder.indexOf(tier) < tierOrder.indexOf(perk.min_tier)) {
      alert(`This perk requires ${perk.min_tier.charAt(0).toUpperCase() + perk.min_tier.slice(1)} tier or higher.`);
      return;
    }

    if (!balance || balance.available_points < perk.points_cost) {
      alert(`You need ${perk.points_cost} points but only have ${balance?.available_points ?? 0}.`);
      return;
    }

    if (!confirm(`Spend ${perk.points_cost} points for ${perk.display_name}?`)) return;

    setRedeeming(true);
    const result = await redeemPerk(user.id, perk.perk_type);

    if (result.success) {
      alert(`${perk.display_name} is now active!`);
      await loadData();
    } else {
      const messages: Record<string, string> = {
        insufficient_points: 'Not enough points.',
        max_active_reached: 'You already have this perk active.',
        cooldown_active: 'Please wait before redeeming this again.',
        perk_not_found_or_disabled: 'This perk is currently unavailable.',
      };
      alert(messages[result.reason || ''] || 'Something went wrong.');
    }
    setRedeeming(false);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center" style={{ minHeight: '80vh' }}>
        <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-20" style={{ minHeight: '100vh' }}>
      {/* Nav tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <Link href="/dating" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-gray-400 hover:text-white transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <Star size={14} /> Discover
        </Link>
        <Link href="/dating/likes" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-gray-400 hover:text-white transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <Heart size={14} /> Likes
        </Link>
        <Link href="/dating/matches" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-gray-400 hover:text-white transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <Users size={14} /> Matches
        </Link>
        <Link href="/dating/rewards" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium"
          style={{ backgroundColor: 'rgba(155,111,246,0.15)', color: '#B8A0FA' }}>
          <Gift size={14} /> Rewards
        </Link>
      </div>

      {/* Balance Card */}
      <div className="rounded-2xl p-6 mb-6 text-center border"
        style={{ backgroundColor: 'rgba(155,111,246,0.08)', borderColor: 'rgba(155,111,246,0.2)' }}>
        <p className="text-sm text-gray-400 mb-1">Connection Points</p>
        <p className="text-5xl font-extrabold" style={{ color: '#9B6FF6' }}>
          {balance?.available_points ?? 0}
        </p>
        {(balance?.pending_points ?? 0) > 0 && (
          <p className="text-sm text-yellow-400 mt-1">+{balance?.pending_points} pending</p>
        )}
        <div className="flex justify-center gap-8 mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{balance?.lifetime_points ?? 0}</p>
            <p className="text-xs text-gray-500">Lifetime</p>
          </div>
          <div className="w-px bg-white/10" />
          <div className="text-center">
            <p className="text-lg font-bold text-white">{activePerks.length}</p>
            <p className="text-xs text-gray-500">Active Perks</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <button
          onClick={() => setActiveTab('perks')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            activeTab === 'perks' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Perks
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            activeTab === 'active' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Active ({activePerks.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            activeTab === 'history' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          History
        </button>
      </div>

      {/* Perks Grid */}
      {activeTab === 'perks' && (
        perks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🎁</p>
            <p className="text-lg font-semibold text-white mb-2">No Perks Available Yet</p>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Keep making genuine connections to earn points. Perks will appear here soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {perks.map((perk) => {
              const canAfford = (balance?.available_points ?? 0) >= perk.points_cost;
              const tierOrder = ['free', 'light', 'premium', 'pro'];
              const tierOk = tierOrder.indexOf(tier) >= tierOrder.indexOf(perk.min_tier);

              return (
                <button
                  key={perk.id}
                  onClick={() => handleRedeem(perk)}
                  disabled={redeeming || !canAfford}
                  className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] ${
                    canAfford ? 'opacity-100' : 'opacity-50'
                  }`}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderColor: 'rgba(155,111,246,0.15)',
                  }}
                >
                  <span className="text-2xl">{perk.icon}</span>
                  <p className="text-sm font-semibold text-white mt-2">{perk.display_name}</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{perk.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-sm font-bold" style={{ color: canAfford ? '#9B6FF6' : '#6B7280' }}>
                      {perk.points_cost} pts
                    </span>
                    {!tierOk && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: 'rgba(236,201,75,0.15)', color: '#ECC94B' }}>
                        {perk.min_tier.toUpperCase()}+
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {perk.duration_hours >= 168
                      ? `${Math.round(perk.duration_hours / 24)} days`
                      : perk.duration_hours >= 24
                        ? `${Math.round(perk.duration_hours / 24)} day${perk.duration_hours >= 48 ? 's' : ''}`
                        : `${perk.duration_hours}h`}
                  </p>
                </button>
              );
            })}
          </div>
        )
      )}

      {/* Active Perks */}
      {activeTab === 'active' && (
        activePerks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">✨</p>
            <p className="text-lg font-semibold text-white mb-2">No Active Perks</p>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Redeem points for perks and they will appear here with countdown timers.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activePerks.map((perk) => {
              const expiresAt = perk.expires_at ? new Date(perk.expires_at) : null;
              const hoursLeft = expiresAt
                ? Math.max(0, Math.round((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)))
                : null;

              return (
                <div key={perk.id} className="flex items-center p-4 rounded-xl border-l-4"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderLeftColor: '#38A169' }}>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white capitalize">
                      {perk.metadata?.display_name || perk.redemption_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{perk.points_spent} pts spent</p>
                  </div>
                  <div className="text-right">
                    {hoursLeft !== null ? (
                      <p className={`text-sm font-semibold ${hoursLeft <= 2 ? 'text-red-400' : 'text-green-400'}`}>
                        {hoursLeft > 24 ? `${Math.round(hoursLeft / 24)}d left` : hoursLeft > 0 ? `${hoursLeft}h left` : 'Expiring'}
                      </p>
                    ) : (
                      <p className="text-sm font-semibold text-green-400">Permanent</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* History */}
      {activeTab === 'history' && (
        events.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-lg font-semibold text-white mb-2">No Activity Yet</p>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Start matching and connecting — your reward activity will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {events.map((event) => (
              <div key={event.id} className="flex items-center py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <div className="w-2 h-2 rounded-full mr-3"
                  style={{ backgroundColor: event.points > 0 ? '#38A169' : event.points < 0 ? '#E53E3E' : '#6B7280' }} />
                <div className="flex-1">
                  <p className="text-sm text-gray-300 capitalize">{event.event_type.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-600">{new Date(event.created_at).toLocaleDateString()}</p>
                </div>
                <p className={`text-sm font-bold ${event.points > 0 ? 'text-green-400' : event.points < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                  {event.points > 0 ? '+' : ''}{event.points}
                </p>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
