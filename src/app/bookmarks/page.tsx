'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { Bookmark, Trash2 } from 'lucide-react';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';

interface BookmarkedPost {
  id: string;
  post_id: string;
  created_at: string;
  post?: {
    id: string;
    content: string;
    type: string;
    created_at: string;
    user_id: string;
    image_url: string | null;
    profile?: {
      display_name: string;
      avatar_url: string | null;
      sun_sign: string | null;
    };
  };
}

export default function BookmarksPage() {
  const { user } = useAuthStore();
  const [bookmarks, setBookmarks] = useState<BookmarkedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadBookmarks();
    else setLoading(false);
  }, [user]);

  async function loadBookmarks() {
    const supabase = createClient();
    const { data } = await supabase
      .from('bookmarks')
      .select('id, post_id, created_at')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      const postIds = data.map(b => b.post_id);
      const { data: posts } = await supabase
        .from('posts')
        .select('id, content, type, created_at, user_id, image_url')
        .in('id', postIds);

      let profiles: Record<string, any> = {};
      if (posts) {
        const userIds = Array.from(new Set(posts.map(p => p.user_id)));
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, sun_sign')
          .in('id', userIds);
        profs?.forEach(p => { profiles[p.id] = p; });
      }

      const postsMap: Record<string, any> = {};
      posts?.forEach(p => { postsMap[p.id] = { ...p, profile: profiles[p.user_id] }; });

      setBookmarks(data.map(b => ({ ...b, post: postsMap[b.post_id] })));
    }
    setLoading(false);
  }

  async function removeBookmark(bookmarkId: string) {
    const supabase = createClient();
    await supabase.from('bookmarks').delete().eq('id', bookmarkId);
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto card text-center py-12">
        <p className="text-text-muted">Please sign in to see bookmarks</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-text-primary mb-6 flex items-center gap-3">
        <Bookmark className="w-7 h-7 text-accent-primary" />
        Bookmarks
      </h1>

      {loading ? (
        <LoadingCosmic label="Loading bookmarks..." />
      ) : bookmarks.length === 0 ? (
        <div className="card text-center py-12">
          <Bookmark className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted mb-1">No bookmarks yet</p>
          <p className="text-xs text-text-muted">Save posts from the feed to read later</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map(b => (
            <div key={b.id} className="card">
              {b.post ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Link href={`/user/${b.post.user_id}`} className="flex items-center gap-2 hover:opacity-80">
                      <div className="w-7 h-7 rounded-full bg-accent-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {b.post.profile?.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={b.post.profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-accent-primary">
                            {(b.post.profile?.display_name || '?')[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors">
                        {b.post.profile?.display_name || 'Unknown'}
                      </span>
                      {b.post.profile?.sun_sign && (
                        <span className="text-[10px] text-text-muted">· {b.post.profile.sun_sign}</span>
                      )}
                    </Link>
                    <button
                      onClick={() => removeBookmark(b.id)}
                      className="p-1.5 text-text-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <Link href={`/user/${b.post.user_id}`} className="block">
                    <p className="text-sm text-text-primary line-clamp-3">{b.post.content}</p>
                    {b.post.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.post.image_url} alt="" className="w-full rounded-lg max-h-[200px] object-cover mt-2" />
                    )}
                  </Link>
                  <p className="text-[10px] text-text-muted mt-2">
                    Saved {new Date(b.created_at).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-text-muted italic">Post no longer available</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
