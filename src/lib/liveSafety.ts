// ═══════════════════════════════════════════════════════════════════
// Live safety — reporting, blocking, and host moderation.
//
// Reports go into the existing public.reports table that the admin
// moderation queue already reads, and blocking goes through the existing
// block_user() RPC. Neither is live-specific on purpose: a separate live
// report queue would be a second inbox nobody checks, and a live-only
// block list would leave someone blocked in chat but still able to
// message you.
//
// Both stores require reporting and blocking before user-generated live
// video can be opened beyond a single trusted host, which is what makes
// this the gate on loosening the founder-only RLS policy.
// ═══════════════════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase';

/**
 * Report reasons shown to a viewer, mapped onto the category values the
 * reports table already receives from mobile. New vocabulary here would
 * risk a CHECK constraint and would not group with existing reports in
 * the queue.
 */
export type LiveReportReason =
  | 'inappropriate_content'
  | 'harassment'
  | 'underage'
  | 'spam_scam';

export const LIVE_REPORT_REASONS: { value: LiveReportReason; label: string }[] = [
  { value: 'inappropriate_content', label: 'Nudity, violence or graphic content' },
  { value: 'harassment', label: 'Harassment, hate or threats' },
  { value: 'underage', label: 'Involves a minor' },
  { value: 'spam_scam', label: 'Spam or a scam' },
];

async function currentUserId(): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/**
 * Report a live stream.
 *
 * The session id goes in the description rather than a dedicated column
 * because reports is shared across every content type — the same shape
 * the Zodisphere reporter uses.
 */
export async function reportLiveStream(opts: {
  sessionId: string;
  hostId: string;
  title?: string;
  reason: LiveReportReason;
  detail?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const reporterId = await currentUserId();
  if (!reporterId) return { ok: false, error: 'Sign in to report.' };
  if (reporterId === opts.hostId) return { ok: false, error: 'You cannot report your own stream.' };

  const supabase = createClient();
  const { error } = await supabase.from('reports').insert({
    report_id: crypto.randomUUID(),
    reporter_id: reporterId,
    reported_user_id: opts.hostId,
    category: opts.reason,
    description: [
      `Live stream ${opts.sessionId}`,
      opts.title ? `titled "${opts.title}"` : null,
      opts.detail ? `— ${opts.detail}` : null,
    ]
      .filter(Boolean)
      .join(' '),
    evidence: [],
    status: 'pending',
    created_at: new Date().toISOString(),
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Report a single chat message. */
export async function reportLiveMessage(opts: {
  sessionId: string;
  messageId: string;
  senderId: string;
  body: string;
  reason: LiveReportReason;
}): Promise<{ ok: boolean; error?: string }> {
  const reporterId = await currentUserId();
  if (!reporterId) return { ok: false, error: 'Sign in to report.' };

  const supabase = createClient();
  const { error } = await supabase.from('reports').insert({
    report_id: crypto.randomUUID(),
    reporter_id: reporterId,
    reported_user_id: opts.senderId,
    category: opts.reason,
    // The text is quoted because a hidden or deleted message would
    // otherwise leave a moderator with nothing to judge.
    description: `Live chat in ${opts.sessionId}: "${opts.body.slice(0, 300)}" (message ${opts.messageId})`,
    evidence: [],
    status: 'pending',
    created_at: new Date().toISOString(),
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Block a user. Reuses the product-wide block, so blocking a host from a
 * stream also stops them messaging you — which is what someone blocking
 * from a live stream actually wants.
 */
export async function blockLiveUser(userId: string): Promise<{ ok: boolean; error?: string }> {
  const me = await currentUserId();
  if (!me) return { ok: false, error: 'Sign in first.' };
  if (me === userId) return { ok: false, error: 'You cannot block yourself.' };

  const supabase = createClient();
  const { error } = await supabase.rpc('block_user', {
    p_blocker: me,
    p_blocked: userId,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ── Host moderation ────────────────────────────────────────────────

/** Hide a chat message. Host-only, enforced by RLS. */
export async function hideLiveMessage(messageId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from('live_messages')
    .update({ is_hidden: true })
    .eq('id', messageId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Remove someone from this stream: bans them, closes their attendance
 * row, and hides everything they already said. Scoped to the one
 * session — it is not a product-wide block.
 */
export async function ejectFromLive(
  sessionId: string,
  userId: string,
  reason?: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.rpc('live_eject', {
    p_session_id: sessionId,
    p_user_id: userId,
    p_reason: reason ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
