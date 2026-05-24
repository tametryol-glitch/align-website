'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import {
  Palette, TrendingUp, DollarSign, Users, BarChart3,
  Star, FileText, Eye, Heart, MessageCircle
} from 'lucide-react';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { useTranslation } from 'react-i18next';

interface CreatorStats {
  total_posts: number;
  total_reactions: number;
  total_views: number;
  total_followers: number;
  total_earnings: number;
  posts_this_month: number;
}

export default function CreatorStudioPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (user) checkCreatorStatus();
    else setLoading(false);
  }, [user]);

  async function checkCreatorStatus() {
    const supabase = createClient();
    const { data: creatorProfile } = await supabase
      .from('creator_profiles')
      .select('*')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (creatorProfile) {
      setIsCreator(true);
      // Load stats
      const { data: posts } = await supabase
        .from('posts')
        .select('id, created_at')
        .eq('user_id', user!.id)
        .eq('is_deleted', false);

      const { count: reactions } = await supabase
        .from('reactions')
        .select('id', { count: 'exact' })
        .in('post_id', (posts || []).map(p => p.id));

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      setStats({
        total_posts: posts?.length || 0,
        total_reactions: reactions || 0,
        total_views: 0, // Would come from analytics
        total_followers: creatorProfile.follower_count || 0,
        total_earnings: creatorProfile.total_earnings || 0,
        posts_this_month: (posts || []).filter(p => p.created_at >= monthStart).length,
      });
    }
    setLoading(false);
  }

  async function applyAsCreator() {
    if (!user) return;
    setApplying(true);
    const supabase = createClient();
    await supabase.from('creator_profiles').insert({
      user_id: user.id,
      status: 'pending',
      follower_count: 0,
      total_earnings: 0,
    });
    setApplying(false);
    setIsCreator(true);
    setStats({
      total_posts: 0,
      total_reactions: 0,
      total_views: 0,
      total_followers: 0,
      total_earnings: 0,
      posts_this_month: 0,
    });
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto card text-center py-12">
        <p className="text-text-muted">Please sign in to access Creator Studio</p>
      </div>
    );
  }

  if (loading) return <div className="max-w-3xl mx-auto"><LoadingCosmic label="Loading studio..." /></div>;

  // Not a creator yet — show application
  if (!isCreator) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center py-12">
          <Palette className="w-16 h-16 text-accent-primary mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-text-primary mb-3">{t('creatorStudio.title')}</h1>
          <p className="text-sm text-text-tertiary mb-6 max-w-md mx-auto">
            Become an Align Creator to share your astrological insights, build a following, and earn from your content.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left max-w-lg mx-auto">
            <div className="p-3 rounded-xl bg-bg-tertiary">
              <Star className="w-5 h-5 text-gold-primary mb-1" />
              <p className="text-xs text-text-primary font-medium">Share Readings</p>
              <p className="text-[10px] text-text-muted">Post interpretations & insights</p>
            </div>
            <div className="p-3 rounded-xl bg-bg-tertiary">
              <Users className="w-5 h-5 text-accent-primary mb-1" />
              <p className="text-xs text-text-primary font-medium">Build Community</p>
              <p className="text-[10px] text-text-muted">Gain followers & influence</p>
            </div>
            <div className="p-3 rounded-xl bg-bg-tertiary">
              <DollarSign className="w-5 h-5 text-green-400 mb-1" />
              <p className="text-xs text-text-primary font-medium">Earn Revenue</p>
              <p className="text-[10px] text-text-muted">Monetize your expertise</p>
            </div>
          </div>
          <button
            onClick={applyAsCreator}
            disabled={applying}
            className="btn-primary px-8"
          >
            {applying ? 'Applying...' : 'Apply as Creator'}
          </button>
        </div>
      </div>
    );
  }

  // Creator dashboard
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-text-primary mb-6 flex items-center gap-3">
        <Palette className="w-7 h-7 text-accent-primary" />
        {t('creatorStudio.title')}
      </h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard icon={FileText} label="Posts" value={stats?.total_posts || 0} />
        <StatCard icon={Heart} label="Reactions" value={stats?.total_reactions || 0} />
        <StatCard icon={Eye} label="Views" value={stats?.total_views || 0} />
        <StatCard icon={Users} label="Followers" value={stats?.total_followers || 0} />
        <StatCard icon={DollarSign} label="Earnings" value={`$${(stats?.total_earnings || 0).toFixed(2)}`} />
        <StatCard icon={BarChart3} label="This Month" value={stats?.posts_this_month || 0} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/feed" className="card hover:border-accent-primary/30 transition-colors flex items-center gap-3">
          <FileText className="w-5 h-5 text-accent-primary" />
          <div>
            <p className="text-sm font-medium text-text-primary">Create Post</p>
            <p className="text-[10px] text-text-muted">Share insights with the community</p>
          </div>
        </Link>
        <Link href="/polls" className="card hover:border-accent-primary/30 transition-colors flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-accent-primary" />
          <div>
            <p className="text-sm font-medium text-text-primary">Create Poll</p>
            <p className="text-[10px] text-text-muted">Engage with polls & questions</p>
          </div>
        </Link>
        <Link href="/communities" className="card hover:border-accent-primary/30 transition-colors flex items-center gap-3">
          <Users className="w-5 h-5 text-accent-primary" />
          <div>
            <p className="text-sm font-medium text-text-primary">My Communities</p>
            <p className="text-[10px] text-text-muted">Manage your groups</p>
          </div>
        </Link>
        <Link href="/readings" className="card hover:border-accent-primary/30 transition-colors flex items-center gap-3">
          <Star className="w-5 h-5 text-gold-primary" />
          <div>
            <p className="text-sm font-medium text-text-primary">Share a Reading</p>
            <p className="text-[10px] text-text-muted">Post chart interpretations</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="card text-center py-4">
      <Icon className="w-5 h-5 text-accent-primary mx-auto mb-1.5" />
      <p className="text-lg font-bold text-text-primary">{value}</p>
      <p className="text-[10px] text-text-muted">{label}</p>
    </div>
  );
}
