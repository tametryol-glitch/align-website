'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { ArrowLeft, UserPlus, UserCheck, MessageCircle } from 'lucide-react';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { getZodiacGlyph } from '@/lib/utils';

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState<'none' | 'pending' | 'friends'>('none');
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      setProfile(data);

      // Check friend status
      if (user && userId !== user.id) {
        const { data: friendship } = await supabase
          .from('friendships')
          .select('status')
          .or(`and(user_id.eq.${user.id},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${user.id})`)
          .maybeSingle();
        if (friendship) {
          setFriendStatus(friendship.status === 'accepted' ? 'friends' : 'pending');
        }
      }
      setLoading(false);
    }
    if (userId) load();
  }, [userId, user]);

  async function sendFriendRequest() {
    if (!user) return;
    setSendingRequest(true);
    try {
      const supabase = createClient();
      await supabase.from('friendships').insert({
        user_id: user.id,
        friend_id: userId,
        status: 'pending',
      });
      setFriendStatus('pending');
    } catch {
      // Handle silently
    } finally {
      setSendingRequest(false);
    }
  }

  if (loading) return <div className="max-w-3xl mx-auto"><LoadingCosmic label="Loading profile..." /></div>;
  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto card text-center py-12">
        <p className="text-text-muted">User not found</p>
        <Link href="/discover" className="btn-secondary mt-4 inline-block">Back to Discover</Link>
      </div>
    );
  }

  const isOwn = user?.id === userId;

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/discover" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {/* Profile header */}
      <div className="relative mb-6">
        {/* Cover photo */}
        <div className="h-[140px] sm:h-[180px] rounded-t-2xl overflow-hidden">
          {profile.cover_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.cover_photo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1E1440] via-[#2D1B69] to-[#1A1035]" />
          )}
        </div>
        <div className="card rounded-t-none -mt-12 pt-16 text-center">
          {/* Avatar */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[100px] sm:top-[140px]">
            <div className="w-20 h-20 rounded-full border-4 border-bg-card bg-accent-muted flex items-center justify-center overflow-hidden text-2xl font-bold text-accent-primary">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                (profile.display_name || '?')[0].toUpperCase()
              )}
            </div>
          </div>
        <h1 className="text-xl font-display font-bold text-text-primary">{profile.display_name}</h1>
        {profile.bio && <p className="text-sm text-text-tertiary mt-1">{profile.bio}</p>}

        {/* Sign badges */}
        <div className="flex items-center justify-center gap-3 mt-4">
          {profile.sun_sign && (
            <span className="px-3 py-1 rounded-full bg-fire/10 text-fire text-xs font-medium">
              {getZodiacGlyph(profile.sun_sign)} {profile.sun_sign}
            </span>
          )}
          {profile.moon_sign && (
            <span className="px-3 py-1 rounded-full bg-water/10 text-water text-xs font-medium">
              {getZodiacGlyph(profile.moon_sign)} {profile.moon_sign}
            </span>
          )}
          {profile.rising_sign && (
            <span className="px-3 py-1 rounded-full bg-air/10 text-air text-xs font-medium">
              {getZodiacGlyph(profile.rising_sign)} {profile.rising_sign}
            </span>
          )}
        </div>

        {/* Actions */}
        {!isOwn && (
          <div className="flex items-center justify-center gap-3 mt-4">
            {friendStatus === 'none' && (
              <button onClick={sendFriendRequest} disabled={sendingRequest} className="btn-primary text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> {sendingRequest ? 'Sending...' : 'Add Friend'}
              </button>
            )}
            {friendStatus === 'pending' && (
              <span className="btn-secondary text-sm flex items-center gap-2 cursor-default">
                <UserCheck className="w-4 h-4" /> Request Sent
              </span>
            )}
            {friendStatus === 'friends' && (
              <span className="btn-secondary text-sm flex items-center gap-2 cursor-default">
                <UserCheck className="w-4 h-4" /> Friends
              </span>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
