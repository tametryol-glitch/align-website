'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Plus } from 'lucide-react';

const CATEGORIES = [
  'Sun Signs', 'Moon Signs', 'Rising Signs', 'Elements',
  'Modalities', 'General', 'Beginners', 'Advanced',
  'Relationships', 'Career',
];

export default function CreateCommunityPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!user || !name.trim()) return;
    setCreating(true);
    setError('');

    try {
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from('communities')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          category,
          is_private: isPrivate,
          owner_id: user.id,
          member_count: 1,
        })
        .select()
        .single();

      if (err) throw err;

      // Auto-join as admin
      if (data) {
        await supabase.from('community_members').insert({
          community_id: data.id,
          user_id: user.id,
          role: 'admin',
        });
        router.push(`/communities/${data.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create community');
    } finally {
      setCreating(false);
    }
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto card text-center py-12">
        <p className="text-text-muted">Please sign in to create a community</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/communities" className="btn-ghost p-2 inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> Communities
      </Link>

      <h1 className="text-2xl font-display font-bold text-text-primary mb-6 flex items-center gap-3">
        <Users className="w-7 h-7 text-accent-primary" />
        Create Community
      </h1>

      <div className="card space-y-5">
        {/* Name */}
        <div>
          <label className="text-sm font-medium text-text-secondary block mb-1.5">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Scorpio Rising Squad"
            className="input"
            maxLength={60}
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-text-secondary block mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this community about?"
            className="input min-h-[100px] resize-none"
            maxLength={500}
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-medium text-text-secondary block mb-1.5">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Privacy */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="private"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="w-4 h-4 rounded border-border-primary bg-bg-tertiary text-accent-primary focus:ring-accent-primary"
          />
          <label htmlFor="private" className="text-sm text-text-secondary">
            Private community (members must be approved)
          </label>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          onClick={handleCreate}
          disabled={!name.trim() || creating}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> {creating ? 'Creating...' : 'Create Community'}
        </button>
      </div>
    </div>
  );
}
