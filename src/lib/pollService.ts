/**
 * Poll Service -- Create, vote, discover polls.
 * Ported from mobile pollService.ts for web.
 */

import { createClient } from './supabase';
import { useAuthStore } from '@/stores/authStore';

// ===================================================================
// Types
// ===================================================================

export type PollType = 'single' | 'multiple';
export type PollVisibility = 'public' | 'friends' | 'group';
export type PollFilter = 'trending' | 'newest' | 'my_polls' | 'voted';

export interface PollOption {
  id: string;
  text: string;
  order: number;
  voteCount: number;
  percentage: number;
}

export interface Poll {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  question: string;
  pollType: PollType;
  visibility: PollVisibility;
  isAnonymous: boolean;
  allowComments: boolean;
  communityId?: string;
  expiresAt?: string;
  totalVotes: number;
  options: PollOption[];
  userVoteOptionId?: string;
  hasVoted: boolean;
  isExpired: boolean;
  isBookmarked: boolean;
  createdAt: string;
}

export interface CreatePollInput {
  question: string;
  options: string[];          // 2-4 option texts
  pollType?: PollType;
  visibility?: PollVisibility;
  isAnonymous?: boolean;
  allowComments?: boolean;
  communityId?: string;
  expiresInHours?: number;    // undefined = never expires
}

// ===================================================================
// Helpers
// ===================================================================

function getMyId(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

function computePercentages(options: any[], totalVotes: number): PollOption[] {
  return options.map((o: any) => ({
    id: o.id,
    text: o.option_text,
    order: o.option_order,
    voteCount: o.vote_count || 0,
    percentage: totalVotes > 0 ? Math.round(((o.vote_count || 0) / totalVotes) * 100) : 0,
  }));
}

function isExpired(expiresAt?: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}

// ===================================================================
// Create Poll
// ===================================================================

export async function createPoll(
  input: CreatePollInput,
): Promise<{ success: boolean; poll?: Poll; error?: string }> {
  const myId = getMyId();
  if (!myId) return { success: false, error: 'Not authenticated' };

  // Validate
  if (!input.question.trim()) return { success: false, error: 'Question is required' };
  if (input.options.length < 2) return { success: false, error: 'At least 2 options required' };
  if (input.options.length > 4) return { success: false, error: 'Maximum 4 options allowed' };

  const emptyOpts = input.options.filter(o => !o.trim());
  if (emptyOpts.length > 0) return { success: false, error: 'All options must have text' };

  // Calculate expires_at
  const expiresAt = input.expiresInHours
    ? new Date(Date.now() + input.expiresInHours * 60 * 60 * 1000).toISOString()
    : null;

  const supabase = createClient();

  // Insert poll
  const { data: pollData, error: pollError } = await supabase
    .from('polls')
    .insert({
      author_id: myId,
      question: input.question.trim(),
      poll_type: input.pollType || 'single',
      visibility: input.visibility || 'public',
      is_anonymous: input.isAnonymous || false,
      allow_comments: input.allowComments !== false,
      community_id: input.communityId || null,
      expires_at: expiresAt,
    })
    .select('*')
    .single();

  if (pollError) {
    console.error('[PollService] createPoll error:', pollError.message);
    return { success: false, error: pollError.message };
  }

  // Insert options
  const optionInserts = input.options.map((text, i) => ({
    poll_id: pollData.id,
    option_text: text.trim(),
    option_order: i,
  }));

  const { data: optionsData, error: optError } = await supabase
    .from('poll_options')
    .insert(optionInserts)
    .select('*');

  if (optError) {
    console.error('[PollService] insert options error:', optError.message);
    await supabase.from('polls').delete().eq('id', pollData.id);
    return { success: false, error: optError.message };
  }

  const profile = useAuthStore.getState().profile;

  return {
    success: true,
    poll: {
      id: pollData.id,
      authorId: myId,
      authorName: profile?.display_name || 'Stargazer',
      authorAvatar: profile?.avatar_url || undefined,
      question: pollData.question,
      pollType: pollData.poll_type,
      visibility: pollData.visibility,
      isAnonymous: pollData.is_anonymous,
      allowComments: pollData.allow_comments,
      communityId: pollData.community_id,
      expiresAt: pollData.expires_at,
      totalVotes: 0,
      options: computePercentages(optionsData || [], 0),
      hasVoted: false,
      isExpired: false,
      isBookmarked: false,
      createdAt: pollData.created_at,
    },
  };
}

// ===================================================================
// Vote on Poll
// ===================================================================

export async function votePoll(
  pollId: string,
  optionId: string,
): Promise<{ success: boolean; error?: string }> {
  const myId = getMyId();
  if (!myId) return { success: false, error: 'Not authenticated' };

  const supabase = createClient();

  const { error } = await supabase
    .from('poll_votes')
    .insert({ poll_id: pollId, option_id: optionId, user_id: myId });

  if (error) {
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      return { success: false, error: 'You have already voted on this poll' };
    }
    console.error('[PollService] vote error:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ===================================================================
// Get Polls (with filters)
// ===================================================================

export async function getPolls(
  filter: PollFilter = 'newest',
  limit = 20,
): Promise<Poll[]> {
  const myId = getMyId();
  const supabase = createClient();

  let query = supabase
    .from('polls')
    .select(`
      *,
      profiles:author_id ( display_name, avatar_url ),
      poll_options ( id, option_text, option_order, vote_count )
    `)
    .eq('is_deleted', false) as any;

  // Filters
  switch (filter) {
    case 'trending':
      query = query.order('total_votes', { ascending: false });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'my_polls':
      if (myId) query = query.eq('author_id', myId);
      query = query.order('created_at', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error('[PollService] getPolls error:', error.message);
    return [];
  }

  const rows = (data || []) as any[];

  // Batch fetch user's votes
  const pollIds = rows.map((r: any) => r.id);
  const userVotes = new Map<string, string>();

  if (myId && pollIds.length > 0) {
    const { data: votes } = await supabase
      .from('poll_votes')
      .select('poll_id, option_id')
      .eq('user_id', myId)
      .in('poll_id', pollIds);

    (votes || []).forEach((v: any) => userVotes.set(v.poll_id, v.option_id));
  }

  // Batch fetch bookmarks
  const bookmarkedSet = new Set<string>();
  if (myId && pollIds.length > 0) {
    const { data: bookmarks } = await supabase
      .from('poll_bookmarks')
      .select('poll_id')
      .eq('user_id', myId)
      .in('poll_id', pollIds);

    (bookmarks || []).forEach((b: any) => bookmarkedSet.add(b.poll_id));
  }

  // If filter is 'voted', only show polls the user voted on
  let filteredRows = rows;
  if (filter === 'voted') {
    filteredRows = rows.filter((r: any) => userVotes.has(r.id));
  }

  return filteredRows.map((r: any) => {
    const options = (r.poll_options || []).sort((a: any, b: any) => a.option_order - b.option_order);
    return {
      id: r.id,
      authorId: r.author_id,
      authorName: r.profiles?.display_name || 'Stargazer',
      authorAvatar: r.profiles?.avatar_url || undefined,
      question: r.question,
      pollType: r.poll_type,
      visibility: r.visibility,
      isAnonymous: r.is_anonymous,
      allowComments: r.allow_comments,
      communityId: r.community_id,
      expiresAt: r.expires_at,
      totalVotes: r.total_votes || 0,
      options: computePercentages(options, r.total_votes || 0),
      userVoteOptionId: userVotes.get(r.id),
      hasVoted: userVotes.has(r.id),
      isExpired: isExpired(r.expires_at),
      isBookmarked: bookmarkedSet.has(r.id),
      createdAt: r.created_at,
    };
  });
}

// ===================================================================
// Get Single Poll
// ===================================================================

export async function getPoll(pollId: string): Promise<Poll | null> {
  const myId = getMyId();
  const supabase = createClient();

  const { data, error } = await supabase
    .from('polls')
    .select(`
      *,
      profiles:author_id ( display_name, avatar_url ),
      poll_options ( id, option_text, option_order, vote_count )
    `)
    .eq('id', pollId)
    .single();

  if (error || !data) return null;

  const r = data as any;
  const options = (r.poll_options || []).sort((a: any, b: any) => a.option_order - b.option_order);

  // Check user's vote
  let userVoteOptionId: string | undefined;
  if (myId) {
    const { data: vote } = await supabase
      .from('poll_votes')
      .select('option_id')
      .eq('poll_id', pollId)
      .eq('user_id', myId)
      .maybeSingle();

    userVoteOptionId = vote?.option_id;
  }

  // Check bookmark
  let isBookmarkedVal = false;
  if (myId) {
    const { data: bm } = await supabase
      .from('poll_bookmarks')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', myId)
      .maybeSingle();

    isBookmarkedVal = !!bm;
  }

  return {
    id: r.id,
    authorId: r.author_id,
    authorName: r.profiles?.display_name || 'Stargazer',
    authorAvatar: r.profiles?.avatar_url || undefined,
    question: r.question,
    pollType: r.poll_type,
    visibility: r.visibility,
    isAnonymous: r.is_anonymous,
    allowComments: r.allow_comments,
    communityId: r.community_id,
    expiresAt: r.expires_at,
    totalVotes: r.total_votes || 0,
    options: computePercentages(options, r.total_votes || 0),
    userVoteOptionId,
    hasVoted: !!userVoteOptionId,
    isExpired: isExpired(r.expires_at),
    isBookmarked: isBookmarkedVal,
    createdAt: r.created_at,
  };
}

// ===================================================================
// Bookmark Poll
// ===================================================================

export async function togglePollBookmark(pollId: string): Promise<boolean> {
  const myId = getMyId();
  if (!myId) return false;

  const supabase = createClient();

  const { data: existing } = await supabase
    .from('poll_bookmarks')
    .select('id')
    .eq('poll_id', pollId)
    .eq('user_id', myId)
    .maybeSingle();

  if (existing) {
    await supabase.from('poll_bookmarks').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('poll_bookmarks').insert({ poll_id: pollId, user_id: myId });
    return true;
  }
}

// ===================================================================
// Delete Poll (soft)
// ===================================================================

export async function deletePoll(pollId: string): Promise<{ success: boolean; error?: string }> {
  const myId = getMyId();
  if (!myId) return { success: false, error: 'Not authenticated' };

  const supabase = createClient();

  const { error } = await supabase
    .from('polls')
    .update({ is_deleted: true })
    .eq('id', pollId)
    .eq('author_id', myId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
