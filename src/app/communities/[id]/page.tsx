'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { ArrowLeft, Users, MessageCircle, Settings, UserPlus } from 'lucide-react';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';

interface CommunityDetail {
  id: string;
  name: string;
  description: string | null;
  category: string;
  member_count: number;
  is_private: boolean;
  created_at: string;
  owner_id: string;
}

interface CommunityPost {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile?: {
    display_name: string;
    avatar_url: string | null;
    sun_sign: string | null;
  };
}

export default function CommunityDetailPage() {
  const params = useParams();
  const communityId = params.id as string;
  const { user } = useAuthStore();
  const [community, setCommunity] = useState<CommunityDetail | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (communityId) loadCommunity();
  }, [communityId, user]);

  async function loadCommunity() {
    setLoading(true);
    const supabase = createClient();

    // Load community
    const { data: comm } = await supabase
      .from('communities')
      .select('*')
      .eq('id', communityId)
      .single();
    if (comm) setCommunity(comm);

    // Check membership
    if (user) {
      const { data: membership } = await supabase
        .from('community_members')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .maybeSingle();
      setIsMember(!!membership);
    }

    // Load posts
    const { data: postsData } = await supabase
      .from('community_posts')
      .select('id, content, created_at, user_id')
      .eq('community_id', communityId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (postsData && postsData.length > 0) {
      const userIds = Array.from(new Set(postsData.map(p => p.user_id)));
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, sun_sign')
        .in('id', userIds);

      const profileMap: Record<string, any> = {};
      profiles?.forEach(p => { profileMap[p.id] = p; });

      setPosts(postsData.map(p => ({ ...p, profile: profileMap[p.user_id] })));
    }

    // Load members (first 20)
    const { data: membersData } = await supabase
      .from('community_members')
      .select('user_id')
      .eq('community_id', communityId)
      .limit(20);

    if (membersData && membersData.length > 0) {
      const memberIds = membersData.map(m => m.user_id);
      const { data: memberProfiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, sun_sign')
        .in('id', memberIds);
      setMembers(memberProfiles || []);
    }

    setLoading(false);
  }

  async function handleJoin() {
    if (!user) return;
    const supabase = createClient();
    await supabase.from('community_members').insert({
      community_id: communityId,
      user_id: user.id,
      role: 'member',
    });
    setIsMember(true);
  }

  async function submitPost() {
    if (!user || !newPost.trim()) return;
    setPosting(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('community_posts')
      .insert({
        community_id: communityId,
        user_id: user.id,
        content: newPost.trim(),
      })
      .select()
      .single();
    if (data) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, sun_sign')
        .eq('id', user.id)
        .single();
      setPosts(prev => [{ ...data, profile }, ...prev]);
    }
    setNewPost('');
    setPosting(false);
  }

  if (loading) return <div className="max-w-3xl mx-auto"><LoadingCosmic label="Loading community..." /></div>;

  if (!community) {
    return (
      <div className="max-w-3xl mx-auto card text-center py-12">
        <p className="text-text-muted">Community not found</p>
        <Link href="/communities" className="btn-secondary mt-4 inline-block">Back to Communities</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/communities" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> Communities
      </Link>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-xl font-display font-bold text-text-primary">{community.name}</h1>
            {community.description && (
              <p className="text-sm text-text-tertiary mt-1">{community.description}</p>
            )}
          </div>
          {!isMember ? (
            <button onClick={handleJoin} className="btn-primary text-sm flex items-center gap-1.5">
              <UserPlus className="w-4 h-4" /> Join
            </button>
          ) : (
            <span className="px-3 py-1.5 rounded-full bg-accent-primary/10 text-accent-primary text-xs font-medium">
              Member
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {community.member_count} members</span>
          <span>{community.category}</span>
        </div>
      </div>

      {/* Members */}
      {members.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Members</h3>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {members.map(m => (
              <Link key={m.id} href={`/user/${m.id}`} className="flex-shrink-0 text-center w-16">
                <div className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center mx-auto mb-1">
                  {m.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-accent-primary">{(m.display_name || '?')[0].toUpperCase()}</span>
                  )}
                </div>
                <p className="text-[10px] text-text-muted truncate">{m.display_name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* New post */}
      {isMember && (
        <div className="card mb-4">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share something with the community..."
            className="input min-h-[80px] resize-none mb-3"
          />
          <div className="flex justify-end">
            <button
              onClick={submitPost}
              disabled={!newPost.trim() || posting}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-3">
        {posts.length === 0 ? (
          <div className="card text-center py-8">
            <MessageCircle className="w-8 h-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-muted">No posts yet. Be the first!</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="card">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-accent-muted flex items-center justify-center">
                  {post.profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-accent-primary">
                      {(post.profile?.display_name || '?')[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium text-text-primary">{post.profile?.display_name}</span>
                {post.profile?.sun_sign && (
                  <span className="text-[10px] text-text-muted">· {post.profile.sun_sign}</span>
                )}
                <span className="text-[10px] text-text-muted ml-auto">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-text-secondary">{post.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
