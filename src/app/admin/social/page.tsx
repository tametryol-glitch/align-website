'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import {
  ArrowLeft, Loader2, Megaphone, Trash2, Send, X, Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';
import { OFFICIAL_ACCOUNTS } from '@/lib/officialAccounts';

interface OfficialPost {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

function accountName(id: string): string {
  return OFFICIAL_ACCOUNTS.find((a) => a.id === id)?.name || 'Official';
}

export default function AdminSocialPage() {
  const [verified, setVerified] = useState(false);
  const [posts, setPosts] = useState<OfficialPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Composer state
  const [accountId, setAccountId] = useState<string>(OFFICIAL_ACCOUNTS[0].id);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState('');

  // Admin verification
  useEffect(() => {
    async function verify() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
      if (data?.is_admin) setVerified(true);
    }
    verify();
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/social');
      const data = await res.json();
      if (data.posts) setPosts(data.posts);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (verified) fetchPosts();
  }, [verified, fetchPosts]);

  async function handleImageUpload(file: File) {
    setUploading(true);
    setMessage('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/blog/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.error) {
        setMessage(`Image upload failed: ${data.error}`);
      } else {
        setImageUrl(data.url);
      }
    } catch (e: any) {
      setMessage(`Image upload failed: ${e.message}`);
    }
    setUploading(false);
  }

  async function publish() {
    if (!content.trim() && !imageUrl) {
      setMessage('Add some text or an image to publish.');
      return;
    }
    setPublishing(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, content: content.trim(), imageUrl }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage(`Error: ${data.error}`);
      } else {
        setMessage(`Published as ${accountName(accountId)}!`);
        setContent('');
        setImageUrl(null);
        fetchPosts();
      }
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    }
    setPublishing(false);
  }

  async function deletePost(id: string) {
    if (!confirm('Delete this official post permanently?')) return;
    await fetch(`/api/admin/social?id=${id}`, { method: 'DELETE' });
    fetchPosts();
  }

  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-muted text-sm">Verifying admin access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="border-b border-border-primary bg-bg-secondary">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/admin" className="text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-display font-bold text-text-primary flex items-center gap-2">
            <Megaphone size={20} />
            Official Posts
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {message && (
          <div className="px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
            {message}
          </div>
        )}

        {/* Composer */}
        <div className="bg-bg-card border border-border-primary rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-xs text-text-muted uppercase tracking-wider mb-2">Post as</label>
            <div className="flex flex-wrap gap-2">
              {OFFICIAL_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => setAccountId(acc.id)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    accountId === acc.id
                      ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                      : 'border-border-primary text-text-secondary hover:bg-bg-tertiary'
                  }`}
                >
                  {acc.name}
                  <span className="text-text-muted ml-1.5 text-xs">@{acc.handle}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-text-muted uppercase tracking-wider mb-1.5">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write something for the feed..."
              rows={4}
              className="w-full bg-bg-secondary border border-border-primary rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary resize-y"
            />
          </div>

          {/* Optional image */}
          <div>
            <label className="block text-xs text-text-muted uppercase tracking-wider mb-2">Image (optional)</label>
            {imageUrl ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Post preview"
                  className="max-h-64 rounded-lg border border-border-primary object-cover"
                />
                <button
                  onClick={() => setImageUrl(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-red-500/80 transition-colors"
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-border-primary rounded-lg cursor-pointer hover:border-accent-primary/40 transition-colors text-text-muted">
                {uploading ? (
                  <>
                    <Loader2 size={22} className="animate-spin" />
                    <span className="text-sm">Uploading…</span>
                  </>
                ) : (
                  <>
                    <ImageIcon size={22} />
                    <span className="text-sm">Click to upload an image</span>
                    <span className="text-xs">JPG, PNG, WEBP or GIF · up to 8 MB</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ''; }}
                />
              </label>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={publish}
              disabled={publishing || uploading || (!content.trim() && !imageUrl)}
              className="btn-primary text-sm px-5 py-2 flex items-center gap-2 disabled:opacity-50"
            >
              {publishing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Publish
            </button>
          </div>
        </div>

        {/* Recent posts */}
        <div>
          <h2 className="text-sm font-semibold text-text-primary mb-3">Recent official posts</h2>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-accent-primary" size={24} />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-bg-card border border-border-primary rounded-xl">
              <Megaphone className="mx-auto mb-3 text-text-muted" size={40} />
              <p className="text-text-secondary">No official posts yet</p>
              <p className="text-text-muted text-sm mt-1">Publish your first one above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-bg-card border border-border-primary rounded-xl p-4 flex items-start gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent-muted/10 text-accent-primary border border-accent-muted">
                        {accountName(post.user_id)}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        {new Date(post.created_at).toLocaleString()}
                      </span>
                    </div>
                    {post.content && (
                      <p className="text-sm text-text-secondary whitespace-pre-wrap break-words">{post.content}</p>
                    )}
                    {post.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.image_url}
                        alt=""
                        className="mt-2 max-h-40 rounded-lg border border-border-primary object-cover"
                      />
                    )}
                  </div>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="p-1.5 text-text-muted hover:text-red-400 transition-colors flex-shrink-0"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
