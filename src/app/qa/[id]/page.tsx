'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  Question, Answer,
  getQuestion, getAnswers, createAnswer,
  acceptAnswer, toggleUpvote, toggleQuestionFollow,
  toggleQuestionBookmark, deleteQuestion, deleteAnswer,
} from '@/lib/qaService';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import {
  ArrowLeft, Bell, BellOff, Bookmark, BookmarkCheck,
  Trash2, ChevronUp, Check, Eye, Star, Send, Loader2,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════

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

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-blue-500/15 text-blue-400' },
  answered: { label: 'Answered', className: 'bg-emerald-500/15 text-emerald-400' },
  closed: { label: 'Closed', className: 'bg-zinc-500/15 text-zinc-400' },
};

// ═══════════════════════════════════════════════════════════════════
// Answer Item
// ═══════════════════════════════════════════════════════════════════

function AnswerItem({
  answer, isQuestionOwner, currentUserId,
  onAccept, onUpvote, onDelete,
}: {
  answer: Answer;
  isQuestionOwner: boolean;
  currentUserId: string;
  onAccept: (answerId: string) => void;
  onUpvote: (answerId: string) => void;
  onDelete: (answerId: string) => void;
}) {
  const isOwnAnswer = answer.authorId === currentUserId;

  return (
    <div
      className={`bg-bg-secondary rounded-xl p-4 border transition-colors ${
        answer.isAccepted
          ? 'border-emerald-500/40 bg-emerald-500/5'
          : 'border-border-primary'
      }`}
    >
      {/* Accepted badge */}
      {answer.isAccepted && (
        <div className="flex items-center gap-1.5 mb-3">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400">Accepted Answer</span>
        </div>
      )}

      {/* Author row */}
      <div className="flex items-center gap-2 mb-3">
        <UserAvatar
          displayName={answer.authorName}
          avatarUrl={answer.authorAvatar}
          size="xs"
        />
        <span className="text-[13px] font-semibold text-text-primary">{answer.authorName}</span>
        <span className="text-text-muted text-[10px]">*</span>
        <span className="text-[11px] text-text-muted">{timeAgo(answer.createdAt)}</span>
        {answer.isExpertAnswer && (
          <span className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-amber-400">
            <Star className="w-3 h-3" /> Expert
          </span>
        )}
      </div>

      {/* Body */}
      <p className="text-sm text-text-secondary leading-relaxed mb-3 whitespace-pre-wrap">
        {answer.body}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Upvote */}
        <button
          onClick={() => onUpvote(answer.id)}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            answer.isUpvoted
              ? 'text-accent-primary'
              : 'text-text-muted hover:text-accent-primary'
          }`}
        >
          <ChevronUp className={`w-4 h-4 ${answer.isUpvoted ? 'fill-accent-primary/20' : ''}`} />
          {answer.upvoteCount}
        </button>

        {/* Accept (question owner only, not already accepted) */}
        {isQuestionOwner && !answer.isAccepted && (
          <button
            onClick={() => onAccept(answer.id)}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <Check className="w-3.5 h-3.5" /> Accept
          </button>
        )}

        {/* Delete (answer author only) */}
        {isOwnAnswer && (
          <button
            onClick={() => onDelete(answer.id)}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-red-400 transition-colors ml-auto"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════════

export default function QuestionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const questionId = params.id as string;
  const userId = useAuthStore((s) => s.user)?.id || '';

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ── Load data ───
  const load = useCallback(async () => {
    if (!questionId) return;
    try {
      const [q, a] = await Promise.all([getQuestion(questionId), getAnswers(questionId)]);
      setQuestion(q);
      setAnswers(a);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  useEffect(() => { load(); }, [load]);

  // ── Submit answer ───
  const handleSubmitAnswer = useCallback(async () => {
    if (!answerText.trim() || !questionId) return;
    setSubmittingAnswer(true);
    const result = await createAnswer(questionId, answerText.trim());
    setSubmittingAnswer(false);

    if (result.success) {
      setAnswerText('');
      load();
    }
  }, [answerText, questionId, load]);

  // ── Accept answer ───
  const handleAccept = useCallback(async (answerId: string) => {
    if (!questionId) return;
    const result = await acceptAnswer(answerId, questionId);
    if (result.success) load();
  }, [questionId, load]);

  // ── Upvote ───
  const handleUpvote = useCallback(async (answerId: string) => {
    const result = await toggleUpvote(answerId);
    setAnswers((prev) =>
      prev.map((a) =>
        a.id === answerId
          ? { ...a, isUpvoted: result.upvoted, upvoteCount: result.newCount }
          : a
      )
    );
  }, []);

  // ── Delete answer ───
  const handleDeleteAnswer = useCallback(async (answerId: string) => {
    if (deleteConfirm !== answerId) {
      setDeleteConfirm(answerId);
      return;
    }
    await deleteAnswer(answerId);
    setDeleteConfirm(null);
    load();
  }, [deleteConfirm, load]);

  // ── Follow / Bookmark ───
  const handleFollow = useCallback(async () => {
    if (!questionId) return;
    const isNow = await toggleQuestionFollow(questionId);
    setQuestion((prev) =>
      prev
        ? { ...prev, isFollowing: isNow, followCount: prev.followCount + (isNow ? 1 : -1) }
        : prev
    );
  }, [questionId]);

  const handleBookmark = useCallback(async () => {
    if (!questionId) return;
    const isNow = await toggleQuestionBookmark(questionId);
    setQuestion((prev) => (prev ? { ...prev, isBookmarked: isNow } : prev));
  }, [questionId]);

  // ── Delete question ───
  const handleDeleteQuestion = useCallback(async () => {
    if (!questionId) return;
    if (deleteConfirm !== 'question') {
      setDeleteConfirm('question');
      return;
    }
    await deleteQuestion(questionId);
    router.push('/qa');
  }, [questionId, deleteConfirm, router]);

  // ── Loading ───
  if (loading) {
    return <LoadingCosmic label="Loading question..." />;
  }

  // ── Not found ───
  if (!question) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-text-muted mb-4">Question not found</p>
        <button
          onClick={() => router.push('/qa')}
          className="text-accent-primary hover:underline text-sm"
        >
          Back to Q&A
        </button>
      </div>
    );
  }

  const isOwner = question.authorId === userId;
  const statusCfg = STATUS_CONFIG[question.status] || STATUS_CONFIG.open;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.push('/qa')}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-accent-primary transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Q&A
      </button>

      {/* Question section */}
      <div className="bg-bg-secondary border border-border-primary rounded-xl p-5 mb-4">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`px-2.5 py-1 rounded text-xs font-semibold ${statusCfg.className}`}>
            {statusCfg.label}
          </span>
          {question.category && (
            <span className="px-2.5 py-1 rounded text-xs font-medium bg-accent-primary/10 text-accent-primary">
              {question.category}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-text-primary leading-snug mb-3">
          {question.title}
        </h1>

        {/* Body */}
        {question.body && (
          <p className="text-[15px] text-text-secondary leading-relaxed mb-4 whitespace-pre-wrap">
            {question.body}
          </p>
        )}

        {/* Author meta */}
        <div className="flex items-center gap-2 mb-4">
          {!question.isAnonymous && (
            <UserAvatar
              displayName={question.authorName}
              avatarUrl={question.authorAvatar}
              size="xs"
            />
          )}
          <span className="text-xs text-text-secondary">
            {question.isAnonymous ? 'Anonymous' : question.authorName}
          </span>
          <span className="text-text-muted text-[10px]">*</span>
          <span className="text-[11px] text-text-muted">{timeAgo(question.createdAt)}</span>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between pt-3 border-t border-border-primary/50">
          <div className="flex items-center gap-3">
            {/* Follow */}
            <button
              onClick={handleFollow}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                question.isFollowing
                  ? 'bg-accent-primary/15 text-accent-primary'
                  : 'bg-bg-tertiary text-text-muted hover:text-text-secondary'
              }`}
            >
              {question.isFollowing ? (
                <Bell className="w-3.5 h-3.5" />
              ) : (
                <BellOff className="w-3.5 h-3.5" />
              )}
              {question.isFollowing ? 'Following' : 'Follow'} ({question.followCount})
            </button>

            {/* Bookmark */}
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                question.isBookmarked
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'bg-bg-tertiary text-text-muted hover:text-text-secondary'
              }`}
            >
              {question.isBookmarked ? (
                <BookmarkCheck className="w-3.5 h-3.5" />
              ) : (
                <Bookmark className="w-3.5 h-3.5" />
              )}
              {question.isBookmarked ? 'Saved' : 'Save'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* View count */}
            <span className="flex items-center gap-1 text-[11px] text-text-muted">
              <Eye className="w-3.5 h-3.5" /> {question.viewCount} views
            </span>

            {/* Delete (owner only) */}
            {isOwner && (
              <button
                onClick={handleDeleteQuestion}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  deleteConfirm === 'question'
                    ? 'text-red-400 font-semibold'
                    : 'text-text-muted hover:text-red-400'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deleteConfirm === 'question' ? 'Confirm?' : 'Delete'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Answers header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-text-primary">
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>
      </div>

      {/* Answers list */}
      {answers.length === 0 ? (
        <div className="bg-bg-secondary border border-border-primary rounded-xl text-center py-12 mb-4">
          <p className="text-2xl mb-2">💭</p>
          <p className="text-sm text-text-muted">No answers yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-2.5 mb-4">
          {answers.map((a) => (
            <AnswerItem
              key={a.id}
              answer={a}
              isQuestionOwner={isOwner}
              currentUserId={userId}
              onAccept={handleAccept}
              onUpvote={handleUpvote}
              onDelete={handleDeleteAnswer}
            />
          ))}
        </div>
      )}

      {/* Answer composer */}
      {userId ? (
        <div className="bg-bg-secondary border border-border-primary rounded-xl p-4 mb-8">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Your Answer</h3>
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Write your answer..."
            maxLength={2000}
            rows={4}
            className="w-full bg-bg-primary border border-border-primary rounded-lg px-3.5 py-2.5 text-text-primary text-sm placeholder:text-text-muted resize-none focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/20 transition-colors mb-3"
          />
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-text-muted">{answerText.length}/2000</p>
            <button
              onClick={handleSubmitAnswer}
              disabled={!answerText.trim() || submittingAnswer}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-accent-primary text-white text-sm font-semibold hover:bg-accent-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submittingAnswer ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {submittingAnswer ? 'Posting...' : 'Post Answer'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-bg-secondary border border-border-primary rounded-xl text-center py-6 mb-8">
          <p className="text-sm text-text-muted">Sign in to post an answer</p>
        </div>
      )}
    </div>
  );
}
