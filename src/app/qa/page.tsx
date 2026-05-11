'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { HelpCircle, ThumbsUp, MessageCircle, Plus, Clock } from 'lucide-react';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';

interface Question {
  id: string;
  title: string;
  body: string | null;
  tag: string | null;
  upvotes: number;
  answer_count: number;
  user_upvoted: boolean;
  created_at: string;
  author_name: string;
  author_sign: string | null;
}

interface Answer {
  id: string;
  body: string;
  upvotes: number;
  user_upvoted: boolean;
  created_at: string;
  author_name: string;
  author_sign: string | null;
}

const TAGS = ['All', 'Natal Chart', 'Transits', 'Compatibility', 'Houses', 'Aspects', 'Beginners', 'Advanced'];

export default function QAPage() {
  const { user } = useAuthStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState('All');
  const [showAsk, setShowAsk] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);

  // Ask form
  const [askTitle, setAskTitle] = useState('');
  const [askBody, setAskBody] = useState('');
  const [askTag, setAskTag] = useState('Natal Chart');
  const [posting, setPosting] = useState(false);

  // Answer form
  const [answerText, setAnswerText] = useState('');
  const [answering, setAnswering] = useState(false);

  useEffect(() => { loadQuestions(); }, []);

  async function loadQuestions() {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from('qa_questions')
      .select('id, title, body, tag, upvotes, answer_count, created_at, user_id')
      .order('upvotes', { ascending: false })
      .limit(30);

    if (activeTag !== 'All') {
      query = query.eq('tag', activeTag);
    }

    const { data } = await query;
    if (data) {
      const authorIds = Array.from(new Set(data.map(q => q.user_id)));
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, sun_sign')
        .in('id', authorIds);
      const profileMap: Record<string, any> = {};
      profiles?.forEach(p => { profileMap[p.id] = p; });

      // Check user upvotes
      let userUpvotes: Set<string> = new Set();
      if (user) {
        const { data: votes } = await supabase
          .from('qa_votes')
          .select('question_id')
          .eq('user_id', user.id)
          .in('question_id', data.map(q => q.id));
        votes?.forEach(v => userUpvotes.add(v.question_id));
      }

      setQuestions(data.map(q => ({
        ...q,
        author_name: profileMap[q.user_id]?.display_name || 'User',
        author_sign: profileMap[q.user_id]?.sun_sign || null,
        user_upvoted: userUpvotes.has(q.id),
      })));
    }
    setLoading(false);
  }

  async function askQuestion() {
    if (!user || !askTitle.trim()) return;
    setPosting(true);
    const supabase = createClient();
    await supabase.from('qa_questions').insert({
      user_id: user.id,
      title: askTitle.trim(),
      body: askBody.trim() || null,
      tag: askTag,
      upvotes: 0,
      answer_count: 0,
    });
    setAskTitle('');
    setAskBody('');
    setShowAsk(false);
    setPosting(false);
    loadQuestions();
  }

  async function upvoteQuestion(questionId: string) {
    if (!user) return;
    const supabase = createClient();
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    if (question.user_upvoted) {
      await supabase.from('qa_votes').delete().eq('question_id', questionId).eq('user_id', user.id);
      setQuestions(prev => prev.map(q =>
        q.id === questionId ? { ...q, upvotes: q.upvotes - 1, user_upvoted: false } : q
      ));
    } else {
      await supabase.from('qa_votes').insert({ question_id: questionId, user_id: user.id });
      setQuestions(prev => prev.map(q =>
        q.id === questionId ? { ...q, upvotes: q.upvotes + 1, user_upvoted: true } : q
      ));
    }
  }

  async function openQuestion(question: Question) {
    setSelectedQuestion(question);
    setLoadingAnswers(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('qa_answers')
      .select('id, body, upvotes, created_at, user_id')
      .eq('question_id', question.id)
      .order('upvotes', { ascending: false });

    if (data) {
      const authorIds = Array.from(new Set(data.map(a => a.user_id)));
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, sun_sign')
        .in('id', authorIds);
      const profileMap: Record<string, any> = {};
      profiles?.forEach(p => { profileMap[p.id] = p; });

      setAnswers(data.map(a => ({
        ...a,
        author_name: profileMap[a.user_id]?.display_name || 'User',
        author_sign: profileMap[a.user_id]?.sun_sign || null,
        user_upvoted: false,
      })));
    }
    setLoadingAnswers(false);
  }

  async function submitAnswer() {
    if (!user || !selectedQuestion || !answerText.trim()) return;
    setAnswering(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('qa_answers')
      .insert({
        question_id: selectedQuestion.id,
        user_id: user.id,
        body: answerText.trim(),
        upvotes: 0,
      })
      .select()
      .single();

    if (data) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('display_name, sun_sign')
        .eq('id', user.id)
        .single();
      setAnswers(prev => [...prev, {
        ...data,
        author_name: prof?.display_name || 'User',
        author_sign: prof?.sun_sign || null,
        user_upvoted: false,
      }]);
      // Update answer count
      await supabase.from('qa_questions').update({ answer_count: selectedQuestion.answer_count + 1 }).eq('id', selectedQuestion.id);
      setSelectedQuestion(prev => prev ? { ...prev, answer_count: prev.answer_count + 1 } : null);
    }
    setAnswerText('');
    setAnswering(false);
  }

  useEffect(() => { loadQuestions(); }, [activeTag]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-3">
          <HelpCircle className="w-7 h-7 text-accent-primary" />
          Q&A
        </h1>
        {user && (
          <button onClick={() => setShowAsk(!showAsk)} className="btn-primary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Ask
          </button>
        )}
      </div>

      {/* Tags */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-4">
        {TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeTag === tag
                ? 'bg-accent-primary/20 text-accent-primary'
                : 'bg-bg-tertiary text-text-muted hover:text-text-secondary'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Ask form */}
      {showAsk && (
        <div className="card mb-6 space-y-3">
          <input
            type="text"
            value={askTitle}
            onChange={(e) => setAskTitle(e.target.value)}
            placeholder="What's your question?"
            className="input"
            maxLength={200}
          />
          <textarea
            value={askBody}
            onChange={(e) => setAskBody(e.target.value)}
            placeholder="Add more details (optional)..."
            className="input min-h-[80px] resize-none"
          />
          <select value={askTag} onChange={(e) => setAskTag(e.target.value)} className="input">
            {TAGS.filter(t => t !== 'All').map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={askQuestion} disabled={posting || !askTitle.trim()} className="btn-primary text-sm flex-1">
              {posting ? 'Posting...' : 'Post Question'}
            </button>
            <button onClick={() => setShowAsk(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Question detail view */}
      {selectedQuestion ? (
        <div>
          <button onClick={() => setSelectedQuestion(null)} className="text-xs text-accent-primary hover:underline mb-4">
            ← Back to questions
          </button>
          <div className="card mb-4">
            <h2 className="text-lg font-semibold text-text-primary mb-2">{selectedQuestion.title}</h2>
            {selectedQuestion.body && (
              <p className="text-sm text-text-secondary mb-3">{selectedQuestion.body}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span>{selectedQuestion.author_name}</span>
              {selectedQuestion.tag && (
                <span className="px-2 py-0.5 rounded-full bg-accent-muted text-accent-primary">{selectedQuestion.tag}</span>
              )}
              <span>{selectedQuestion.answer_count} answers</span>
            </div>
          </div>

          {/* Answers */}
          {loadingAnswers ? (
            <LoadingCosmic label="Loading answers..." />
          ) : (
            <div className="space-y-3 mb-4">
              {answers.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-6">No answers yet. Be the first!</p>
              ) : (
                answers.map(a => (
                  <div key={a.id} className="card">
                    <p className="text-sm text-text-primary mb-2">{a.body}</p>
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      <span>{a.author_name}</span>
                      {a.author_sign && <span>· {a.author_sign}</span>}
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" /> {a.upvotes}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Submit answer */}
          {user && (
            <div className="card">
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Write your answer..."
                className="input min-h-[80px] resize-none mb-3"
              />
              <button onClick={submitAnswer} disabled={answering || !answerText.trim()} className="btn-primary text-sm w-full">
                {answering ? 'Posting...' : 'Post Answer'}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Questions list */
        loading ? (
          <LoadingCosmic label="Loading questions..." />
        ) : questions.length === 0 ? (
          <div className="card text-center py-12">
            <HelpCircle className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted">No questions yet</p>
            <p className="text-xs text-text-muted mt-1">Be the first to ask!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {questions.map(q => (
              <button
                key={q.id}
                onClick={() => openQuestion(q)}
                className="card w-full text-left hover:border-accent-primary/30 transition-colors"
              >
                <div className="flex gap-3">
                  {/* Vote column */}
                  <div className="flex flex-col items-center gap-0.5 pt-0.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); upvoteQuestion(q.id); }}
                      className={`p-1 rounded ${q.user_upvoted ? 'text-accent-primary' : 'text-text-muted hover:text-accent-primary'}`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <span className={`text-xs font-semibold ${q.user_upvoted ? 'text-accent-primary' : 'text-text-secondary'}`}>
                      {q.upvotes}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-text-primary mb-1">{q.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-text-muted">
                      <span>{q.author_name}</span>
                      {q.author_sign && <span>· {q.author_sign}</span>}
                      {q.tag && (
                        <span className="px-1.5 py-0.5 rounded-full bg-bg-tertiary">{q.tag}</span>
                      )}
                      <span className="flex items-center gap-0.5">
                        <MessageCircle className="w-3 h-3" /> {q.answer_count}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" /> {new Date(q.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )
      )}
    </div>
  );
}
