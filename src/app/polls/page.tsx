'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import {
  BarChart3, Plus, X, Check, Clock, Bookmark, BookmarkCheck,
  Trash2, RefreshCw, EyeOff, MessageCircle, ChevronRight,
} from 'lucide-react';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import {
  Poll, PollFilter,
  getPolls, createPoll, votePoll, togglePollBookmark, deletePoll,
} from '@/lib/pollService';
import { useTranslation } from 'react-i18next';

// ===================================================================
// Constants
// ===================================================================

const FILTERS: { key: PollFilter; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'trending', label: 'Trending' },
  { key: 'my_polls', label: 'My Polls' },
  { key: 'voted', label: 'Voted' },
];

const DURATION_OPTIONS = [
  { label: 'No limit', hours: 0 },
  { label: '1 hour', hours: 1 },
  { label: '6 hours', hours: 6 },
  { label: '12 hours', hours: 12 },
  { label: '24 hours', hours: 24 },
  { label: '3 days', hours: 72 },
  { label: '7 days', hours: 168 },
];

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
// PollCard (inline)
// ===================================================================

function PollCard({
  poll,
  onRefresh,
  onNavigate,
  currentUserId,
}: {
  poll: Poll;
  onRefresh: () => void;
  onNavigate: (id: string) => void;
  currentUserId?: string;
}) {
  const [voted, setVoted] = useState(poll.hasVoted);
  const [selectedOptionId, setSelectedOptionId] = useState(poll.userVoteOptionId);
  const [totalVotes, setTotalVotes] = useState(poll.totalVotes);
  const [options, setOptions] = useState(poll.options);
  const [bookmarked, setBookmarked] = useState(poll.isBookmarked);
  const [voting, setVoting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync state when poll prop changes (e.g. after refresh)
  useEffect(() => {
    setVoted(poll.hasVoted);
    setSelectedOptionId(poll.userVoteOptionId);
    setTotalVotes(poll.totalVotes);
    setOptions(poll.options);
    setBookmarked(poll.isBookmarked);
  }, [poll]);

  const showResults = voted || poll.isExpired;
  const isOwner = currentUserId === poll.authorId;

  const handleVote = useCallback(async (optionId: string) => {
    if (voted || poll.isExpired || voting) return;
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
    onRefresh();
  }, [voted, poll, voting, totalVotes, onRefresh]);

  const handleBookmark = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked(!bookmarked);
    await togglePollBookmark(poll.id);
  }, [bookmarked, poll.id]);

  const handleDelete = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(true);
    const result = await deletePoll(poll.id);
    if (result.success) {
      onRefresh();
    }
    setDeleting(false);
    setShowDeleteConfirm(false);
  }, [poll.id, onRefresh]);

  return (
    <div className="bg-bg-card border border-border-primary rounded-2xl p-5 transition-all hover:border-border-secondary">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        {!poll.isAnonymous && poll.authorAvatar ? (
          <Link href={`/user/${poll.authorId}`} onClick={(e) => e.stopPropagation()} className="cursor-pointer">
            <img
              src={poll.authorAvatar}
              alt={poll.authorName}
              className="w-8 h-8 rounded-full object-cover border border-border-primary"
            />
          </Link>
        ) : !poll.isAnonymous ? (
          <Link href={`/user/${poll.authorId}`} onClick={(e) => e.stopPropagation()} className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center text-xs font-bold text-white cursor-pointer">
            {poll.authorName.charAt(0).toUpperCase()}
          </Link>
        ) : null}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">
            {poll.isAnonymous ? 'Anonymous Poll' : poll.authorName}
          </p>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>{timeAgo(poll.createdAt)}</span>
            {poll.expiresAt && (
              <span className={`flex items-center gap-1 ${poll.isExpired ? 'text-text-muted' : 'text-accent-primary'} font-medium`}>
                <Clock className="w-3 h-3" />
                {timeRemaining(poll.expiresAt)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isOwner && (
            <>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-xs font-medium"
                  >
                    {deleting ? '...' : 'Yes'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}
                    className="p-1.5 rounded-lg bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors text-xs"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                  className="p-1.5 rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-red-400 transition-colors"
                  title="Delete poll"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
          <button
            onClick={handleBookmark}
            className="p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors"
            title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            {bookmarked
              ? <BookmarkCheck className="w-4 h-4 text-accent-primary" />
              : <Bookmark className="w-4 h-4 text-text-muted hover:text-accent-primary" />
            }
          </button>
        </div>
      </div>

      {/* Question */}
      <h3 className="text-base font-semibold text-text-primary mb-4 leading-relaxed">
        {poll.question}
      </h3>

      {/* Options */}
      <div className="space-y-2">
        {options.map((opt) => {
          const isSelected = opt.id === selectedOptionId;
          return (
            <button
              key={opt.id}
              onClick={() => handleVote(opt.id)}
              disabled={voted || poll.isExpired}
              className={`
                w-full relative rounded-xl overflow-hidden text-left transition-all
                min-h-[44px] border
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
                  className={`absolute left-0 top-0 bottom-0 transition-all duration-500 ease-out rounded-xl ${
                    isSelected
                      ? 'bg-gradient-to-r from-accent-primary/30 to-purple-600/20'
                      : 'bg-accent-primary/8'
                  }`}
                  style={{ width: `${opt.percentage}%` }}
                />
              )}
              <div className="relative flex items-center justify-between px-4 py-3">
                <span className={`text-sm flex items-center gap-2 ${isSelected ? 'text-text-primary font-semibold' : 'text-text-secondary'}`}>
                  {isSelected && <Check className="w-4 h-4 text-accent-primary flex-shrink-0" />}
                  {opt.text}
                </span>
                {showResults && (
                  <span className={`text-xs font-semibold ml-2 flex-shrink-0 ${isSelected ? 'text-accent-primary' : 'text-text-muted'}`}>
                    {opt.percentage}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-primary/50">
        <span className="text-xs text-text-muted">
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        </span>
        <button
          onClick={() => onNavigate(poll.id)}
          className="text-xs text-text-muted hover:text-accent-primary transition-colors flex items-center gap-1"
        >
          View details <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ===================================================================
// Create Poll Modal
// ===================================================================

function CreatePollModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const { t } = useTranslation();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [durationIdx, setDurationIdx] = useState(4); // 24 hours default
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addOption = () => {
    if (options.length >= 4) return;
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, text: string) => {
    setOptions(options.map((o, i) => i === index ? text : o));
  };

  const handleSubmit = async () => {
    setError(null);
    if (!question.trim()) { setError('Please enter a question'); return; }

    const validOpts = options.filter(o => o.trim());
    if (validOpts.length < 2) { setError('At least 2 options are required'); return; }

    setSubmitting(true);
    const duration = DURATION_OPTIONS[durationIdx];
    const result = await createPoll({
      question: question.trim(),
      options: validOpts.map(o => o.trim()),
      isAnonymous,
      allowComments,
      expiresInHours: duration.hours || undefined,
    });

    setSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Failed to create poll');
      return;
    }

    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-bg-secondary border border-border-primary rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-primary">
          <h2 className="text-lg font-display font-bold text-text-primary">New Poll</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Question */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Question
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask something..."
              maxLength={300}
              rows={3}
              autoFocus
              className="input resize-none"
            />
            <p className="text-right text-xs text-text-muted mt-1">{question.length}/300</p>
          </div>

          {/* Options */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Options
            </label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    maxLength={100}
                    className="input flex-1"
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => removeOption(i)}
                      className="p-2 rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 4 && (
              <button
                onClick={addOption}
                className="mt-2 text-xs font-semibold text-accent-primary hover:text-accent-secondary transition-colors"
              >
                + Add Option
              </button>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Duration
            </label>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((d, i) => (
                <button
                  key={d.label}
                  onClick={() => setDurationIdx(i)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    durationIdx === i
                      ? 'bg-accent-primary/15 border-accent-primary text-accent-primary'
                      : 'bg-bg-card border-border-primary text-text-muted hover:border-border-secondary'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-0">
            <div className="flex items-center justify-between py-3 border-b border-border-primary/50">
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-text-muted" />
                <span className="text-sm text-text-secondary">Anonymous poll</span>
              </div>
              <button
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  isAnonymous ? 'bg-accent-primary' : 'bg-border-secondary'
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  isAnonymous ? 'translate-x-[22px]' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-text-muted" />
                <span className="text-sm text-text-secondary">Allow comments</span>
              </div>
              <button
                onClick={() => setAllowComments(!allowComments)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  allowComments ? 'bg-accent-primary' : 'bg-border-secondary'
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  allowComments ? 'translate-x-[22px]' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={submitting || !question.trim()}
              className={`btn-primary flex-1 text-sm flex items-center justify-center gap-2 ${
                submitting || !question.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                t('polls.createPoll')
              )}
            </button>
            <button onClick={onClose} className="btn-secondary text-sm">
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================================================================
// Main Page
// ===================================================================

export default function PollsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<PollFilter>('newest');
  const [showCreate, setShowCreate] = useState(false);

  const loadPolls = useCallback(async () => {
    try {
      const data = await getPolls(filter);
      setPolls(data);
    } catch (err) {
      console.error('[Polls] load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    loadPolls();
  }, [loadPolls]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadPolls();
  }, [loadPolls]);

  const handleNavigate = useCallback((id: string) => {
    router.push(`/polls/${id}`);
  }, [router]);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-accent-primary" />
          {t('polls.title')}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-border-primary hover:border-border-secondary hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          {user && (
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> {t('polls.createPoll')}
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-all ${
              filter === f.key
                ? 'bg-accent-primary/15 border-accent-primary text-accent-primary'
                : 'bg-bg-card border-border-primary text-text-muted hover:border-border-secondary hover:text-text-secondary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingCosmic label={t('common.loading')} />
      ) : polls.length === 0 ? (
        <div className="bg-bg-card border border-border-primary rounded-2xl p-12 text-center">
          <BarChart3 className="w-14 h-14 text-text-muted mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-display font-semibold text-text-primary mb-2">{t('polls.noPollsYet')}</h3>
          <p className="text-sm text-text-muted mb-6">
            {filter === 'my_polls'
              ? "You haven't created any polls yet."
              : filter === 'voted'
                ? "You haven't voted on any polls yet."
                : 'Create the first poll and get the community talking!'
            }
          </p>
          {user && (
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary text-sm inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> {t('polls.createPoll')}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              onRefresh={loadPolls}
              onNavigate={handleNavigate}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}

      {/* Create Poll Modal */}
      {showCreate && (
        <CreatePollModal
          onClose={() => setShowCreate(false)}
          onCreated={loadPolls}
        />
      )}
    </div>
  );
}
