'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import {
  Plus, Save, Trash2, Eye, EyeOff, ArrowLeft, Loader2, FileText,
  X, ChevronDown, ChevronUp,
} from 'lucide-react';
import Link from 'next/link';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  content: string[];
  keywords: string[];
  faqs: { question: string; answer: string }[];
  read_time: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

type View = 'list' | 'editor';

const CATEGORIES = ['Fundamentals', 'Relationships', 'Transits', 'Planets', 'Divination', 'Numerology', 'General'];

export default function AdminBlogPage() {
  const [view, setView] = useState<View>('list');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
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
      const res = await fetch('/api/admin/blog');
      const data = await res.json();
      if (data.posts) setPosts(data.posts);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (verified) fetchPosts();
  }, [verified, fetchPosts]);

  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-muted text-sm">Verifying admin access...</p>
      </div>
    );
  }

  function startNew() {
    setEditingPost({
      id: '',
      slug: '',
      title: '',
      description: '',
      category: 'General',
      content: [''],
      keywords: [],
      faqs: [],
      read_time: '5 min read',
      is_published: false,
      published_at: null,
      created_at: '',
      updated_at: '',
    });
    setView('editor');
    setMessage('');
  }

  function editPost(post: BlogPost) {
    setEditingPost({ ...post });
    setView('editor');
    setMessage('');
  }

  async function deletePost(id: string) {
    if (!confirm('Delete this post permanently?')) return;
    await fetch(`/api/admin/blog?id=${id}`, { method: 'DELETE' });
    fetchPosts();
  }

  function backToList() {
    setView('list');
    setEditingPost(null);
    setMessage('');
    fetchPosts();
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="border-b border-border-primary bg-bg-secondary">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-text-muted hover:text-text-primary transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-display font-bold text-text-primary flex items-center gap-2">
              <FileText size={20} />
              Blog Manager
            </h1>
          </div>
          {view === 'list' && (
            <button onClick={startNew} className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
              <Plus size={16} /> New Post
            </button>
          )}
          {view === 'editor' && (
            <button onClick={backToList} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              Back to list
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {message && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
            {message}
          </div>
        )}

        {view === 'list' && (
          <PostList
            posts={posts}
            loading={loading}
            onEdit={editPost}
            onDelete={deletePost}
          />
        )}

        {view === 'editor' && editingPost && (
          <PostEditor
            post={editingPost}
            setPost={setEditingPost}
            saving={saving}
            setSaving={setSaving}
            setMessage={setMessage}
            onSaved={backToList}
          />
        )}
      </div>
    </div>
  );
}

/* ── Post List ──────────────────────────────────────────────── */

function PostList({
  posts,
  loading,
  onEdit,
  onDelete,
}: {
  posts: BlogPost[];
  loading: boolean;
  onEdit: (p: BlogPost) => void;
  onDelete: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-accent-primary" size={24} />
      </div>
    );
  }

  const [seeding, setSeeding] = useState(false);

  async function seedPosts() {
    setSeeding(true);
    try {
      const res = await fetch('/api/admin/blog/seed', { method: 'POST' });
      const data = await res.json();
      if (data.error) {
        alert(`Seed error: ${data.error}`);
      } else {
        alert(data.message || 'Posts seeded!');
        window.location.reload();
      }
    } catch (e: any) {
      alert(`Seed error: ${e.message}`);
    }
    setSeeding(false);
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <FileText className="mx-auto mb-4 text-text-muted" size={48} />
        <p className="text-text-secondary mb-2">No blog posts yet</p>
        <p className="text-text-muted text-sm mb-6">Click &quot;New Post&quot; to write your first article, or seed the 10 starter posts.</p>
        <button
          onClick={seedPosts}
          disabled={seeding}
          className="btn-primary text-sm px-6 py-2.5"
        >
          {seeding ? 'Seeding...' : 'Seed 10 Starter Posts'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-text-muted mb-4">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-bg-card border border-border-primary rounded-xl p-5 flex items-center justify-between gap-4 hover:border-accent-primary/20 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {post.is_published ? (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Published
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Draft
                </span>
              )}
              <span className="text-xs text-text-muted">{post.category}</span>
            </div>
            <h3 className="text-base font-semibold text-text-primary truncate">{post.title}</h3>
            <p className="text-sm text-text-muted truncate">/blog/{post.slug}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onEdit(post)}
              className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary border border-border-primary rounded-lg hover:border-accent-primary/30 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(post.id)}
              className="p-1.5 text-text-muted hover:text-red-400 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Post Editor ────────────────────────────────────────────── */

function PostEditor({
  post,
  setPost,
  saving,
  setSaving,
  setMessage,
  onSaved,
}: {
  post: BlogPost;
  setPost: (p: BlogPost) => void;
  saving: boolean;
  setSaving: (s: boolean) => void;
  setMessage: (m: string) => void;
  onSaved: () => void;
}) {
  const [preview, setPreview] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const isNew = !post.id;

  function update(field: string, value: any) {
    setPost({ ...post, [field]: value });
  }

  function autoSlug() {
    const slug = post.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    update('slug', slug);
  }

  function addParagraph() {
    update('content', [...post.content, '']);
  }

  function updateParagraph(index: number, value: string) {
    const updated = [...post.content];
    updated[index] = value;
    update('content', updated);
  }

  function removeParagraph(index: number) {
    if (post.content.length <= 1) return;
    update('content', post.content.filter((_, i) => i !== index));
  }

  function moveParagraph(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= post.content.length) return;
    const updated = [...post.content];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    update('content', updated);
  }

  function addKeyword() {
    const kw = keywordInput.trim().toLowerCase();
    if (kw && !post.keywords.includes(kw)) {
      update('keywords', [...post.keywords, kw]);
    }
    setKeywordInput('');
  }

  function removeKeyword(kw: string) {
    update('keywords', post.keywords.filter((k) => k !== kw));
  }

  function addFaq() {
    update('faqs', [...post.faqs, { question: '', answer: '' }]);
  }

  function updateFaq(index: number, field: 'question' | 'answer', value: string) {
    const updated = [...post.faqs];
    updated[index] = { ...updated[index], [field]: value };
    update('faqs', updated);
  }

  function removeFaq(index: number) {
    update('faqs', post.faqs.filter((_, i) => i !== index));
  }

  function estimateReadTime() {
    const words = post.content.join(' ').split(/\s+/).length;
    const mins = Math.max(1, Math.ceil(words / 200));
    update('read_time', `${mins} min read`);
  }

  async function save(publish?: boolean) {
    if (!post.slug || !post.title) {
      setMessage('Title and slug are required.');
      return;
    }

    setSaving(true);
    const method = isNew ? 'POST' : 'PUT';
    const body = {
      ...post,
      is_published: publish !== undefined ? publish : post.is_published,
    };

    try {
      const res = await fetch('/api/admin/blog', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) {
        setMessage(`Error: ${data.error}`);
        setSaving(false);
        return;
      }
      setMessage(isNew ? 'Post created!' : 'Post saved!');
      setSaving(false);
      onSaved();
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
      setSaving(false);
    }
  }

  if (preview) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display font-bold text-text-primary">Preview</h2>
          <button
            onClick={() => setPreview(false)}
            className="text-sm text-accent-primary hover:underline"
          >
            Back to editor
          </button>
        </div>
        <article className="bg-bg-card border border-border-primary rounded-2xl p-8 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-medium border border-accent-muted text-accent-primary bg-accent-muted/10">
              {post.category}
            </span>
            <span className="text-xs text-text-muted">{post.read_time}</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-text-primary mb-3">{post.title}</h1>
          <p className="text-text-tertiary text-lg mb-8">{post.description}</p>
          <div className="space-y-5">
            {post.content.map((p, i) => (
              <p key={i} className="text-text-secondary leading-relaxed text-[15px]">{p}</p>
            ))}
          </div>
          {post.faqs.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border-primary">
              <h2 className="text-xl font-display font-semibold text-text-primary mb-6">FAQ</h2>
              <div className="space-y-4">
                {post.faqs.map((faq, i) => (
                  <div key={i} className="bg-bg-secondary rounded-xl p-5">
                    <h3 className="font-semibold text-text-primary mb-1">{faq.question}</h3>
                    <p className="text-text-secondary text-sm">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Title & Slug */}
      <div className="bg-bg-card border border-border-primary rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider mb-1.5">Title</label>
          <input
            type="text"
            value={post.title}
            onChange={(e) => update('title', e.target.value)}
            onBlur={() => { if (!post.slug) autoSlug(); }}
            placeholder="Your blog post title"
            className="w-full bg-bg-secondary border border-border-primary rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider mb-1.5">
            URL Slug
            <button onClick={autoSlug} className="ml-2 text-accent-primary hover:underline text-[10px] normal-case tracking-normal">
              auto-generate
            </button>
          </label>
          <div className="flex items-center gap-0">
            <span className="text-sm text-text-muted bg-bg-secondary border border-r-0 border-border-primary rounded-l-lg px-3 py-2.5">/blog/</span>
            <input
              type="text"
              value={post.slug}
              onChange={(e) => update('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="your-post-slug"
              className="flex-1 bg-bg-secondary border border-border-primary rounded-r-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-wider mb-1.5">Description (SEO)</label>
          <textarea
            value={post.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="One-line description for search results..."
            rows={2}
            className="w-full bg-bg-secondary border border-border-primary rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary resize-none"
          />
          <p className="text-xs text-text-muted mt-1">{post.description.length}/160 characters</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-text-muted uppercase tracking-wider mb-1.5">Category</label>
            <select
              value={post.category}
              onChange={(e) => update('category', e.target.value)}
              className="w-full bg-bg-secondary border border-border-primary rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-primary"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-muted uppercase tracking-wider mb-1.5">
              Read Time
              <button onClick={estimateReadTime} className="ml-2 text-accent-primary hover:underline text-[10px] normal-case tracking-normal">
                auto-calculate
              </button>
            </label>
            <input
              type="text"
              value={post.read_time}
              onChange={(e) => update('read_time', e.target.value)}
              className="w-full bg-bg-secondary border border-border-primary rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div className="bg-bg-card border border-border-primary rounded-xl p-6">
        <label className="block text-xs text-text-muted uppercase tracking-wider mb-3">SEO Keywords</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {post.keywords.map((kw) => (
            <span key={kw} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-accent-muted/10 text-accent-primary border border-accent-muted">
              {kw}
              <button onClick={() => removeKeyword(kw)} className="hover:text-red-400"><X size={12} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
            placeholder="Type keyword and press Enter"
            className="flex-1 bg-bg-secondary border border-border-primary rounded-lg px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
          />
          <button onClick={addKeyword} className="px-4 py-2 text-sm border border-border-primary rounded-lg hover:border-accent-primary/30 text-text-secondary hover:text-text-primary transition-colors">
            Add
          </button>
        </div>
      </div>

      {/* Content Paragraphs */}
      <div className="bg-bg-card border border-border-primary rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <label className="text-xs text-text-muted uppercase tracking-wider">Content</label>
          <button onClick={addParagraph} className="text-sm text-accent-primary hover:underline flex items-center gap-1">
            <Plus size={14} /> Add paragraph
          </button>
        </div>
        <div className="space-y-3">
          {post.content.map((paragraph, i) => (
            <div key={i} className="group">
              <div className="flex items-start gap-2">
                <div className="flex flex-col gap-0.5 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => moveParagraph(i, -1)} className="text-text-muted hover:text-text-primary" disabled={i === 0}>
                    <ChevronUp size={14} />
                  </button>
                  <button onClick={() => moveParagraph(i, 1)} className="text-text-muted hover:text-text-primary" disabled={i === post.content.length - 1}>
                    <ChevronDown size={14} />
                  </button>
                </div>
                <div className="flex-1">
                  <textarea
                    value={paragraph}
                    onChange={(e) => updateParagraph(i, e.target.value)}
                    placeholder={`Paragraph ${i + 1}...`}
                    rows={3}
                    className="w-full bg-bg-secondary border border-border-primary rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary resize-y"
                  />
                </div>
                <button
                  onClick={() => removeParagraph(i)}
                  className="pt-2.5 text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={post.content.length <= 1}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-bg-card border border-border-primary rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <label className="text-xs text-text-muted uppercase tracking-wider">FAQs (for Google Rich Snippets)</label>
          <button onClick={addFaq} className="text-sm text-accent-primary hover:underline flex items-center gap-1">
            <Plus size={14} /> Add FAQ
          </button>
        </div>
        {post.faqs.length === 0 && (
          <p className="text-sm text-text-muted">No FAQs yet. Add questions for Google rich snippet eligibility.</p>
        )}
        <div className="space-y-4">
          {post.faqs.map((faq, i) => (
            <div key={i} className="bg-bg-secondary rounded-lg p-4 space-y-2 relative group">
              <button
                onClick={() => removeFaq(i)}
                className="absolute top-3 right-3 text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
              <input
                type="text"
                value={faq.question}
                onChange={(e) => updateFaq(i, 'question', e.target.value)}
                placeholder="Question?"
                className="w-full bg-bg-primary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
              />
              <textarea
                value={faq.answer}
                onChange={(e) => updateFaq(i, 'answer', e.target.value)}
                placeholder="Answer..."
                rows={2}
                className="w-full bg-bg-primary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary resize-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-bg-card border border-border-primary rounded-xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreview(true)}
              className="px-4 py-2 text-sm border border-border-primary rounded-lg hover:border-accent-primary/30 text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
            >
              <Eye size={16} /> Preview
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => save(false)}
              disabled={saving}
              className="px-4 py-2 text-sm border border-border-primary rounded-lg hover:border-accent-primary/30 text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Draft
            </button>
            <button
              onClick={() => save(true)}
              disabled={saving}
              className="btn-primary text-sm px-5 py-2 flex items-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : post.is_published ? <Save size={16} /> : <Eye size={16} />}
              {post.is_published ? 'Save & Publish' : 'Publish'}
            </button>
          </div>
        </div>
        {post.is_published && (
          <div className="mt-4 pt-4 border-t border-border-primary">
            <button
              onClick={() => save(false)}
              className="text-sm text-amber-400 hover:underline flex items-center gap-1"
            >
              <EyeOff size={14} /> Unpublish (revert to draft)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
