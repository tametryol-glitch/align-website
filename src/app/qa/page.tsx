'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  Question, QAFilter, QA_CATEGORIES,
  getQuestions, createQuestion,
} from '@/lib/qaService';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import {
  HelpCircle, Plus, MessageSquare, Eye, Bell,
  CheckCircle2, Circle, XCircle, X, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

const FILTERS: { key: QAFilter; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'trending', label: 'Trending' },
  { key: 'unanswered', label: 'Unanswered' },
  { key: 'answered', label: 'Answered' },
  { key: 'my_questions', label: "My Q's" },
  { key: 'my_answers', label: "My A's" },
];

// ═══════════════════════════════════════════════════════════════════
// Question Card
// ═══════════════════════════════════════════════════════════════════

function QuestionCard({ question, onClick }: { question: Question; onClick: () => void }) {
  const statusCfg = STATUS_CONFIG[question.status] || STATUS_CONFIG.open;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-bg-secondary border border-border-primary rounded-xl p-4 hover:border-accent-primary/30 transition-all duration-200 group"
    >
      {/* Badges */}
      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${statusCfg.className}`}>
          {statusCfg.label}
        </span>
        {question.category && (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-accent-primary/10 text-accent-primary">
            {question.category}
          </span>
        )}
        {question.acceptedAnswerId && (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        )}
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-semibold text-text-primary leading-snug mb-1 line-clamp-2 group-hover:text-accent-primary transition-colors">
        {question.title}
      </h3>

      {/* Body preview */}
      {question.body && (
        <p className="text-[13px] text-text-tertiary leading-relaxed mb-3 line-clamp-2">
          {question.body}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-border-primary/50">
        <div className="flex items-center gap-2">
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

        <div className="flex items-center gap-3.5 text-text-muted">
          <span className="flex items-center gap-1 text-[11px]">
            <MessageSquare className="w-3 h-3" /> {question.answerCount}
          </span>
          <span className="flex items-center gap-1 text-[11px]">
            <Eye className="w-3 h-3" /> {question.viewCount}
          </span>
          <span className="flex items-center gap-1 text-[11px]">
            <Bell className="w-3 h-3" /> {question.followCount}
          </span>
        </div>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Create Question Modal
// ═══════════════════════════════════════════════════════════════════

function CreateQuestionModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!title.trim()) { setError('Title is required'); return; }

    setSubmitting(true);
    const result = await createQuestion({
      title: title.trim(),
      body: body.trim() || undefined,
      isAnonymous,
      category,
    });
    setSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Failed to create question');
      return;
    }

    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-bg-primary border border-border-primary rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-primary">
          <h2 className="text-lg font-bold text-text-primary">{t('qa.askQuestion')}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-bg-tertiary transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Form */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question?"
              maxLength={200}
              autoFocus
              className="w-full bg-bg-secondary border border-border-primary rounded-lg px-3.5 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/20 transition-colors"
            />
            <p className="text-[11px] text-text-muted mt-1 text-right">{title.length}/200</p>
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Details (optional)
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Add context or details..."
              maxLength={2000}
              rows={4}
              className="w-full bg-bg-secondary border border-border-primary rounded-lg px-3.5 py-2.5 text-text-primary text-sm placeholder:text-text-muted resize-none focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/20 transition-colors"
            />
            <p className="text-[11px] text-text-muted mt-1 text-right">{body.length}/2000</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {QA_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(category === cat ? undefined : cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    category === cat
                      ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/40'
                      : 'bg-bg-tertiary text-text-muted border border-transparent hover:text-text-secondary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Anonymous toggle */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-text-secondary">Post anonymously</span>
            <button
              onClick={() => setIsAnonymous(!isAnonymous)}
              className="text-accent-primary"
            >
              {isAnonymous ? (
                <ToggleRight className="w-8 h-8" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-text-muted" />
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 py-4 border-t border-border-primary">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border-primary text-text-secondary text-sm font-medium hover:bg-bg-tertiary transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !title.trim()}
            className="flex-1 px-4 py-2.5 rounded-lg bg-accent-primary text-white text-sm font-semibold hover:bg-accent-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? 'Posting...' : 'Post Question'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════════

export default function QAPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<QAFilter>('newest');
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getQuestions(filter);
      setQuestions(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-3">
          <HelpCircle className="w-7 h-7 text-accent-primary" />
          {t('qa.title')}
        </h1>
        {user && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-primary text-white text-sm font-semibold hover:bg-accent-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ask
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f.key
                ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/40'
                : 'bg-bg-tertiary text-text-muted hover:text-text-secondary border border-transparent'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Question list */}
      {loading ? (
        <LoadingCosmic label={t('common.loading')} />
      ) : questions.length === 0 ? (
        <div className="bg-bg-secondary border border-border-primary rounded-xl text-center py-16 px-6">
          <HelpCircle className="w-14 h-14 text-text-muted mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">{t('qa.noQuestions')}</h3>
          <p className="text-sm text-text-muted mb-6">Ask the first question and get cosmic wisdom!</p>
          {user && (
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent-primary text-white text-sm font-semibold hover:bg-accent-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('qa.askQuestion')}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {questions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              onClick={() => router.push(`/qa/${q.id}`)}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateQuestionModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}
    </div>
  );
}
