/**
 * Q&A Service — Questions, answers, upvotes, follow, accept, bookmark.
 * Ported from mobile qaService.ts to use web supabase client.
 */

import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════

export type QuestionStatus = 'open' | 'answered' | 'closed';
export type QAFilter = 'trending' | 'newest' | 'unanswered' | 'answered' | 'my_questions' | 'my_answers';

export const QA_CATEGORIES = [
  'Natal Chart', 'Transits', 'Compatibility', 'Career',
  'Relationships', 'Spirituality', 'Beginners', 'Advanced', 'General',
] as const;

export type QACategory = (typeof QA_CATEGORIES)[number];

export interface Question {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  title: string;
  body?: string;
  isAnonymous: boolean;
  visibility: string;
  status: QuestionStatus;
  category?: string;
  answerCount: number;
  followCount: number;
  viewCount: number;
  acceptedAnswerId?: string;
  isFollowing: boolean;
  isBookmarked: boolean;
  createdAt: string;
}

export interface Answer {
  id: string;
  questionId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  body: string;
  isAccepted: boolean;
  isExpertAnswer: boolean;
  upvoteCount: number;
  isUpvoted: boolean;
  isDeleted: boolean;
  createdAt: string;
}

export interface CreateQuestionInput {
  title: string;
  body?: string;
  isAnonymous?: boolean;
  visibility?: string;
  category?: string;
}

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════

function getMyId(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

// ═══════════════════════════════════════════════════════════════════
// Create Question
// ═══════════════════════════════════════════════════════════════════

export async function createQuestion(
  input: CreateQuestionInput,
): Promise<{ success: boolean; question?: Question; error?: string }> {
  const myId = getMyId();
  if (!myId) return { success: false, error: 'Not authenticated' };

  if (!input.title.trim()) return { success: false, error: 'Title is required' };
  if (input.title.trim().length < 5) return { success: false, error: 'Title must be at least 5 characters' };

  const supabase = createClient();

  const { data, error } = await supabase
    .from('questions')
    .insert({
      author_id: myId,
      title: input.title.trim(),
      body: input.body?.trim() || null,
      is_anonymous: input.isAnonymous || false,
      visibility: input.visibility || 'public',
      category: input.category || null,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[QAService] createQuestion error:', error.message);
    return { success: false, error: error.message };
  }

  // Auto-follow own question
  try {
    await supabase.from('question_follows').insert({ question_id: data.id, user_id: myId });
  } catch { /* ignore */ }

  const profile = useAuthStore.getState().profile;

  return {
    success: true,
    question: {
      id: data.id,
      authorId: myId,
      authorName: input.isAnonymous ? 'Anonymous' : (profile?.display_name || 'Stargazer'),
      authorAvatar: input.isAnonymous ? undefined : (profile?.avatar_url || undefined),
      title: data.title,
      body: data.body,
      isAnonymous: data.is_anonymous,
      visibility: data.visibility,
      status: 'open',
      category: data.category,
      answerCount: 0,
      followCount: 1,
      viewCount: 0,
      isFollowing: true,
      isBookmarked: false,
      createdAt: data.created_at,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
// Get Questions (with filters)
// ═══════════════════════════════════════════════════════════════════

export async function getQuestions(
  filter: QAFilter = 'newest',
  limit = 30,
): Promise<Question[]> {
  const myId = getMyId();
  const supabase = createClient();

  let query = supabase
    .from('questions')
    .select('*, profiles:author_id ( display_name, avatar_url )')
    .eq('is_deleted', false) as any;

  switch (filter) {
    case 'trending':
      query = query.order('answer_count', { ascending: false });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'unanswered':
      query = query.eq('status', 'open').order('created_at', { ascending: false });
      break;
    case 'answered':
      query = query.in('status', ['answered', 'closed']).order('created_at', { ascending: false });
      break;
    case 'my_questions':
      if (myId) query = query.eq('author_id', myId);
      query = query.order('created_at', { ascending: false });
      break;
    case 'my_answers':
      query = query.order('created_at', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error('[QAService] getQuestions error:', error.message);
    return [];
  }

  const rows = (data || []) as any[];
  const questionIds = rows.map((r: any) => r.id);

  // Batch fetch follows
  const followedSet = new Set<string>();
  if (myId && questionIds.length > 0) {
    const { data: follows } = await supabase
      .from('question_follows')
      .select('question_id')
      .eq('user_id', myId)
      .in('question_id', questionIds);
    (follows || []).forEach((f: any) => followedSet.add(f.question_id));
  }

  // Batch fetch bookmarks
  const bookmarkedSet = new Set<string>();
  if (myId && questionIds.length > 0) {
    const { data: bms } = await supabase
      .from('question_bookmarks')
      .select('question_id')
      .eq('user_id', myId)
      .in('question_id', questionIds);
    (bms || []).forEach((b: any) => bookmarkedSet.add(b.question_id));
  }

  let filteredRows = rows;

  // Filter for 'my_answers' — need to find questions the user answered
  if (filter === 'my_answers' && myId) {
    const { data: myAnswerQIds } = await supabase
      .from('question_answers')
      .select('question_id')
      .eq('author_id', myId);
    const myQIds = new Set((myAnswerQIds || []).map((a: any) => a.question_id));
    filteredRows = rows.filter((r: any) => myQIds.has(r.id));
  }

  return filteredRows.map((r: any) => ({
    id: r.id,
    authorId: r.author_id,
    authorName: r.is_anonymous ? 'Anonymous' : (r.profiles?.display_name || 'Stargazer'),
    authorAvatar: r.is_anonymous ? undefined : (r.profiles?.avatar_url || undefined),
    title: r.title,
    body: r.body,
    isAnonymous: r.is_anonymous,
    visibility: r.visibility,
    status: r.status,
    category: r.category,
    answerCount: r.answer_count || 0,
    followCount: r.follow_count || 0,
    viewCount: r.view_count || 0,
    acceptedAnswerId: r.accepted_answer_id,
    isFollowing: followedSet.has(r.id),
    isBookmarked: bookmarkedSet.has(r.id),
    createdAt: r.created_at,
  }));
}

// ═══════════════════════════════════════════════════════════════════
// Get Single Question
// ═══════════════════════════════════════════════════════════════════

export async function getQuestion(questionId: string): Promise<Question | null> {
  const myId = getMyId();
  const supabase = createClient();

  const { data, error } = await supabase
    .from('questions')
    .select('*, profiles:author_id ( display_name, avatar_url )')
    .eq('id', questionId)
    .single();

  if (error || !data) return null;

  const r = data as any;

  // Increment view count (fire-and-forget)
  supabase
    .from('questions')
    .update({ view_count: (r.view_count || 0) + 1 })
    .eq('id', questionId)
    .then(() => {}, (err: any) => console.warn('[qaService] view_count update failed:', err));

  let isFollowingVal = false;
  let isBookmarkedVal = false;

  if (myId) {
    const [followRes, bmRes] = await Promise.all([
      supabase.from('question_follows').select('id').eq('question_id', questionId).eq('user_id', myId).maybeSingle(),
      supabase.from('question_bookmarks').select('id').eq('question_id', questionId).eq('user_id', myId).maybeSingle(),
    ]);
    isFollowingVal = !!followRes.data;
    isBookmarkedVal = !!bmRes.data;
  }

  return {
    id: r.id,
    authorId: r.author_id,
    authorName: r.is_anonymous ? 'Anonymous' : (r.profiles?.display_name || 'Stargazer'),
    authorAvatar: r.is_anonymous ? undefined : (r.profiles?.avatar_url || undefined),
    title: r.title,
    body: r.body,
    isAnonymous: r.is_anonymous,
    visibility: r.visibility,
    status: r.status,
    category: r.category,
    answerCount: r.answer_count || 0,
    followCount: r.follow_count || 0,
    viewCount: r.view_count || 0,
    acceptedAnswerId: r.accepted_answer_id,
    isFollowing: isFollowingVal,
    isBookmarked: isBookmarkedVal,
    createdAt: r.created_at,
  };
}

// ═══════════════════════════════════════════════════════════════════
// Get Answers
// ═══════════════════════════════════════════════════════════════════

export async function getAnswers(questionId: string): Promise<Answer[]> {
  const myId = getMyId();
  const supabase = createClient();

  const { data, error } = await supabase
    .from('question_answers')
    .select('*, profiles:author_id ( display_name, avatar_url )')
    .eq('question_id', questionId)
    .eq('is_deleted', false)
    .order('is_accepted', { ascending: false })
    .order('upvote_count', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[QAService] getAnswers error:', error.message);
    return [];
  }

  const rows = (data || []) as any[];
  const answerIds = rows.map((r: any) => r.id);

  // Batch fetch upvotes
  const upvotedSet = new Set<string>();
  if (myId && answerIds.length > 0) {
    const { data: upvotes } = await supabase
      .from('answer_upvotes')
      .select('answer_id')
      .eq('user_id', myId)
      .in('answer_id', answerIds);
    (upvotes || []).forEach((u: any) => upvotedSet.add(u.answer_id));
  }

  return rows.map((r: any) => ({
    id: r.id,
    questionId: r.question_id,
    authorId: r.author_id,
    authorName: r.profiles?.display_name || 'Stargazer',
    authorAvatar: r.profiles?.avatar_url || undefined,
    body: r.body,
    isAccepted: r.is_accepted,
    isExpertAnswer: r.is_expert_answer,
    upvoteCount: r.upvote_count || 0,
    isUpvoted: upvotedSet.has(r.id),
    isDeleted: r.is_deleted,
    createdAt: r.created_at,
  }));
}

// ═══════════════════════════════════════════════════════════════════
// Create Answer
// ═══════════════════════════════════════════════════════════════════

export async function createAnswer(
  questionId: string,
  body: string,
): Promise<{ success: boolean; answer?: Answer; error?: string }> {
  const myId = getMyId();
  if (!myId) return { success: false, error: 'Not authenticated' };

  if (!body.trim()) return { success: false, error: 'Answer cannot be empty' };

  const supabase = createClient();

  const { data, error } = await supabase
    .from('question_answers')
    .insert({
      question_id: questionId,
      author_id: myId,
      body: body.trim(),
    })
    .select('*, profiles:author_id ( display_name, avatar_url )')
    .single();

  if (error) {
    console.error('[QAService] createAnswer error:', error.message);
    return { success: false, error: error.message };
  }

  const r = data as any;
  return {
    success: true,
    answer: {
      id: r.id,
      questionId: r.question_id,
      authorId: r.author_id,
      authorName: r.profiles?.display_name || 'Stargazer',
      authorAvatar: r.profiles?.avatar_url || undefined,
      body: r.body,
      isAccepted: false,
      isExpertAnswer: false,
      upvoteCount: 0,
      isUpvoted: false,
      isDeleted: false,
      createdAt: r.created_at,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
// Accept Answer
// ═══════════════════════════════════════════════════════════════════

export async function acceptAnswer(
  answerId: string,
  questionId: string,
): Promise<{ success: boolean; error?: string }> {
  const myId = getMyId();
  if (!myId) return { success: false, error: 'Not authenticated' };

  const supabase = createClient();

  // Verify question ownership
  const { data: q } = await supabase
    .from('questions')
    .select('author_id')
    .eq('id', questionId)
    .single();

  if (!q || q.author_id !== myId) {
    return { success: false, error: 'Only the question author can accept an answer' };
  }

  // Unaccept any previous accepted answer
  await supabase
    .from('question_answers')
    .update({ is_accepted: false })
    .eq('question_id', questionId)
    .eq('is_accepted', true);

  // Accept new answer
  const { error } = await supabase
    .from('question_answers')
    .update({ is_accepted: true })
    .eq('id', answerId);

  if (error) return { success: false, error: error.message };

  // Update question status and accepted_answer_id
  await supabase
    .from('questions')
    .update({ accepted_answer_id: answerId, status: 'answered' })
    .eq('id', questionId);

  return { success: true };
}

// ═══════════════════════════════════════════════════════════════════
// Toggle Upvote Answer
// ═══════════════════════════════════════════════════════════════════

export async function toggleUpvote(answerId: string): Promise<{ upvoted: boolean; newCount: number }> {
  const myId = getMyId();
  if (!myId) return { upvoted: false, newCount: 0 };

  const supabase = createClient();

  const { data: existing } = await supabase
    .from('answer_upvotes')
    .select('id')
    .eq('answer_id', answerId)
    .eq('user_id', myId)
    .maybeSingle();

  if (existing) {
    await supabase.from('answer_upvotes').delete().eq('id', existing.id);
  } else {
    await supabase.from('answer_upvotes').insert({ answer_id: answerId, user_id: myId });
  }

  // Get fresh count
  const { count } = await supabase
    .from('answer_upvotes')
    .select('*', { count: 'exact', head: true })
    .eq('answer_id', answerId);

  return { upvoted: !existing, newCount: count ?? 0 };
}

// ═══════════════════════════════════════════════════════════════════
// Toggle Follow Question
// ═══════════════════════════════════════════════════════════════════

export async function toggleQuestionFollow(questionId: string): Promise<boolean> {
  const myId = getMyId();
  if (!myId) return false;

  const supabase = createClient();

  const { data: existing } = await supabase
    .from('question_follows')
    .select('id')
    .eq('question_id', questionId)
    .eq('user_id', myId)
    .maybeSingle();

  if (existing) {
    await supabase.from('question_follows').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('question_follows').insert({ question_id: questionId, user_id: myId });
    return true;
  }
}

// ═══════════════════════════════════════════════════════════════════
// Toggle Bookmark Question
// ═══════════════════════════════════════════════════════════════════

export async function toggleQuestionBookmark(questionId: string): Promise<boolean> {
  const myId = getMyId();
  if (!myId) return false;

  const supabase = createClient();

  const { data: existing } = await supabase
    .from('question_bookmarks')
    .select('id')
    .eq('question_id', questionId)
    .eq('user_id', myId)
    .maybeSingle();

  if (existing) {
    await supabase.from('question_bookmarks').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('question_bookmarks').insert({ question_id: questionId, user_id: myId });
    return true;
  }
}

// ═══════════════════════════════════════════════════════════════════
// Delete Question (soft)
// ═══════════════════════════════════════════════════════════════════

export async function deleteQuestion(questionId: string): Promise<{ success: boolean; error?: string }> {
  const myId = getMyId();
  if (!myId) return { success: false, error: 'Not authenticated' };

  const supabase = createClient();

  const { error } = await supabase
    .from('questions')
    .update({ is_deleted: true })
    .eq('id', questionId)
    .eq('author_id', myId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ═══════════════════════════════════════════════════════════════════
// Delete Answer (soft)
// ═══════════════════════════════════════════════════════════════════

export async function deleteAnswer(answerId: string): Promise<{ success: boolean; error?: string }> {
  const myId = getMyId();
  if (!myId) return { success: false, error: 'Not authenticated' };

  const supabase = createClient();

  const { error } = await supabase
    .from('question_answers')
    .update({ is_deleted: true, body: 'This answer has been deleted' })
    .eq('id', answerId)
    .eq('author_id', myId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
