'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  ArrowLeft, Check, Clock, Bookmark, BookmarkCheck,
  Trash2, RefreshCw, BarChart3,
} from 'lucide-react';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import {
  Poll, getPoll, votePoll, togglePollBookmark, deletePoll,
} from '@/lib/pollService';

// ===================================================================
// Helpers
// ===================================================================

function timeAgo(dateStr: string): string {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function timeRemaining(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return 'Ended';
  const h = Math.floor(ms / 3600000);
  if (h >= 24) return `${Math.floor(h / 24)}d left`;
  if (h >= 1) return `${h}h left`;
  const m = Math.floor(ms / 60000);
  return `${m}m left`;
}

// ===================================================================
// Poll Detail Page
// ===================================================================

export default function PollDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const pollId = params?.id as string;
  const { user } = useAuthStore();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Vote state
  const [voted, setVoted] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | undefined>();
  const [totalVotes, setTotalVotes] = useState(0);
  const [options, setOptions] = useState<Poll['options']>([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [voting, setVoting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!pollId) return;
    try {
      const data = await getPoll(pollId);
      setPoll(data);
      if (data) {
        setVoted(data.hasVoted);
        setSelectedOptionId(data.userVoteOptionId);
        setTotalVotes(data.totalVotes);
        setOptions(data.options);
        setBookmarked(data.isBookmarked);
      }
    } catch (err) {
      console.error('[PollDetail] load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pollId]);

  useEffect(() => { load(); }, [load]);

  const handleVote = useCallback(async (optionId: string) => {
    if (!poll || voted || poll.isExpired || voting) return;
    setVoting(true);

    // Optimistic update
    const newTotal = totalVotes + 1;
    setSelectedOptionId(optionId);
    setVoted(true);
    setTotalVotes(newTotal);
    setOptions(prev => prev.map(o => {
      const newCount = o.id === optionId ? o.voteCount + 1 : o.voteCount;
      return {
        ...o,
        voteCount: newCount,
        percentage: newTotal > 0 ? Math.round((newCount / newTotal) * 100) : 0,
      };
    }));

    const result = await votePoll(poll.id, optionId);
    if (!result.success) {
      // Revert
      setSelectedOptionId(poll.userVoteOptionId);
      setVoted(poll.hasVoted);
      setTotalVotes(poll.totalVotes);
      setOptions(poll.options);
    }
    setVoting(false);
    // Refresh to get accurate counts from server
    load();
  }, [poll, voted, voting, totalVotes, load]);

  const handleBookmark = useCallback(async () => {
    if (!poll) return;
    setBookmarked(!bookmarked);
    await togglePollBookmark(poll.id);
  }, [poll, bookmarked]);

  const handleDelete = useCallback(async () => {
    if (!poll) return;
    setDeleting(true);
    const result = await deletePoll(poll.id);
    if (result.success) {
      router.push('/polls');
    }
    setDeleting(false);
    setShowDeleteConfirm(false);
  }, [poll, router]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <LoadingCosmic label={t('common.loading')} />
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-bg-card border border-border-primary rounded-2xl p-12 text-center">
          <BarChart3 className="w-14 h-14 text-text-muted mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-display font-semibold text-text-primary mb-2">{t('errors.notFound')}</h3>
          <p className="text-sm text-text-muted mb-6">
            {t('errors.notFound')}
          </p>
          <button
            onClick={() => router.push('/polls')}
            className="btn-primary text-sm inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> {t('polls.title')}
          </button>
        </div>
      </div>
    );
  }

  const showResults = voted || poll.isExpired;
  const isOwner = user?.id === poll.authorId;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push('/polls')}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">{t('polls.title')}</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-border-primary hover:border-border-secondary hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          {isOwner && (
            <>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-3 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium"
                  >
                    {deleting ? t('common.loading') : t('common.confirm')}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-2 rounded-xl bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors text-sm"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2.5 rounded-xl border border-border-primary hover:border-red-500/50 hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-all"
                  title="Delete poll"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Poll Card */}
      <div className="bg-bg-card border border-border-primary rounded-2xl p-6">
        {/* Author info */}
        <div className="flex items-center gap-3 mb-4">
          {!poll.isAnonymous && poll.authorAvatar ? (
            <img
              src={poll.authorAvatar}
              alt={poll.authorName}
              className="w-10 h-10 rounded-full object-cover border border-border-primary"
            />
          ) : !poll.isAnonymous ? (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center text-sm font-bold text-white">
              {poll.authorName.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center text-lg">
              ?
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">
              {poll.isAnonymous ? 'Anonymous Poll' : poll.authorName}
            </p>
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span>{timeAgo(poll.createdAt)}</span>
              {poll.expiresAt && (
                <span className={`flex items-center gap-1 ${poll.isExpired ? 'text-text-muted' : 'text-accent-primary'} font-medium`}>
                  <Clock className="w-3 h-3" />
                  {timeRemaining(poll.expiresAt)}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleBookmark}
            className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
            title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            {bookmarked
              ? <BookmarkCheck className="w-5 h-5 text-accent-primary" />
              : <Bookmark className="w-5 h-5 text-text-muted hover:text-accent-primary" />
            }
          </button>
        </div>

        {/* Question */}
        <h2 className="text-xl font-display font-bold text-text-primary mb-5 leading-relaxed">
          {poll.question}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {options.map((opt) => {
            const isSelected = opt.id === selectedOptionId;
            return (
              <button
                key={opt.id}
                onClick={() => handleVote(opt.id)}
                disabled={voted || poll.isExpired}
                className={`
                  w-full relative rounded-xl overflow-hidden text-left transition-all
                  min-h-[52px] border
                  ${isSelected
                    ? 'border-accent-primary'
                    : voted || poll.isExpired
                      ? 'border-border-primary'
                      : 'border-border-primary hover:border-accent-primary/50 hover:bg-bg-tertiary/50 cursor-pointer'
                  }
                  ${voted || poll.isExpired ? 'cursor-default' : ''}
                `}
              >
                {/* Percentage fill bar */}
                {showResults && (
                  <div
                    className={`absolute left-0 top-0 bottom-0 transition-all duration-700 ease-out rounded-xl ${
                      isSelected
                        ? 'bg-gradient-to-r from-accent-primary/30 to-purple-600/20'
                        : 'bg-accent-primary/8'
                    }`}
                    style={{ width: `${opt.percentage}%` }}
                  />
                )}
                <div className="relative flex items-center justify-between px-5 py-3.5">
                  <span className={`text-sm flex items-center gap-2 ${isSelected ? 'text-text-primary font-semibold' : 'text-text-secondary'}`}>
                    {isSelected && <Check className="w-4 h-4 text-accent-primary flex-shrink-0" />}
                    {opt.text}
                  </span>
                  {showResults && (
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <span className={`text-xs font-semibold ${isSelected ? 'text-accent-primary' : 'text-text-muted'}`}>
                        {opt.percentage}%
                      </span>
                      <span className="text-xs text-text-muted">
                        ({opt.voteCount})
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Vote count & metadata */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-border-primary/50">
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-muted font-medium">
              {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
            </span>
            {poll.isAnonymous && (
              <span className="text-xs text-text-muted bg-bg-tertiary px-2 py-0.5 rounded-full">
                Anonymous
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            {poll.visibility !== 'public' && (
              <span className="bg-bg-tertiary px-2 py-0.5 rounded-full capitalize">
                {poll.visibility}
              </span>
            )}
            {poll.pollType === 'single' && (
              <span className="bg-bg-tertiary px-2 py-0.5 rounded-full">
                Single choice
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info section */}
      <div className="mt-4 bg-bg-card border border-border-primary rounded-2xl p-5">
        <h4 className="text-sm font-semibold text-text-secondary mb-3">Poll Details</h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-text-muted">Created</span>
            <p className="text-text-primary font-medium mt-0.5">
              {new Date(poll.createdAt).toLocaleDateString(undefined, {
                month: 'long', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
          {poll.expiresAt && (
            <div>
              <span className="text-text-muted">{poll.isExpired ? 'Ended' : 'Expires'}</span>
              <p className={`font-medium mt-0.5 ${poll.isExpired ? 'text-text-muted' : 'text-accent-primary'}`}>
                {new Date(poll.expiresAt).toLocaleDateString(undefined, {
                  month: 'long', day: 'numeric', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          )}
          <div>
            <span className="text-text-muted">Comments</span>
            <p className="text-text-primary font-medium mt-0.5">
              {poll.allowComments ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          <div>
            <span className="text-text-muted">Visibility</span>
            <p className="text-text-primary font-medium mt-0.5 capitalize">
              {poll.visibility}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
