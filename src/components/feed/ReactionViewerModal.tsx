'use client';

// ═══════════════════════════════════════════════════════════════════
// ReactionViewerModal — "who reacted" viewer for a feed post.
//
// Mirrors align-app/src/components/ui/ReactionViewerModal.tsx: an
// "All" tab plus one tab per emoji that has reactions, each row
// linking to that user's profile.
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/ui/UserAvatar';
import {
  getReactorsForPost,
  REACTION_OPTIONS,
  type ReactionEmoji,
  type ReactionUser,
  type PostReaction,
} from '@/lib/feedService';
import { X, Loader2 } from 'lucide-react';

interface ReactionViewerModalProps {
  postId: string;
  reactions: PostReaction[];
  onClose: () => void;
}

export default function ReactionViewerModal({ postId, reactions, onClose }: ReactionViewerModalProps) {
  const [activeTab, setActiveTab] = useState<ReactionEmoji | 'all'>('all');
  const [reactors, setReactors] = useState<ReactionUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReactorsForPost(postId, activeTab === 'all' ? undefined : activeTab);
      setReactors(data);
    } catch {
      setReactors([]);
    } finally {
      setLoading(false);
    }
  }, [postId, activeTab]);

  useEffect(() => { load(); }, [load]);

  // Escape closes, matching the rest of the web modals.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const total = reactions.reduce((sum, r) => sum + r.count, 0);

  const tabs: Array<{ key: ReactionEmoji | 'all'; label: string; count: number }> = [
    { key: 'all', label: 'All', count: total },
    ...reactions
      .filter(r => r.count > 0)
      .sort((a, b) => b.count - a.count)
      .map(r => ({ key: r.emoji, label: r.emoji, count: r.count })),
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[80vh] flex flex-col rounded-2xl bg-bg-secondary border border-border-primary overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary">
          <h3 className="font-semibold text-text-primary">
            {total} {total === 1 ? 'reaction' : 'reactions'}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-full text-text-secondary hover:bg-bg-tertiary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emoji tabs */}
        <div className="flex gap-1.5 px-4 py-2 overflow-x-auto border-b border-border-primary">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              title={tab.key === 'all'
                ? 'All reactions'
                : REACTION_OPTIONS.find(o => o.emoji === tab.key)?.label}
              className={cn(
                'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border whitespace-nowrap transition-colors',
                activeTab === tab.key
                  ? 'border-accent-primary bg-accent-muted text-accent-primary'
                  : 'border-border-primary bg-bg-tertiary text-text-secondary hover:border-accent-primary/50'
              )}
            >
              <span>{tab.label}</span>
              <span className="font-medium">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Reactor list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-text-secondary" />
            </div>
          ) : reactors.length === 0 ? (
            <p className="text-center text-sm text-text-secondary py-10">No reactions yet</p>
          ) : (
            reactors.map(r => (
              <Link
                key={`${r.userId}-${r.emoji}`}
                href={`/user/${r.userId}`}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-bg-tertiary transition-colors"
              >
                <UserAvatar displayName={r.displayName} avatarUrl={r.avatarUrl} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{r.displayName}</p>
                  {r.sunSign ? (
                    <p className="text-xs text-text-secondary truncate">{r.sunSign}</p>
                  ) : null}
                </div>
                <span className="text-lg">{r.emoji}</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
