/**
 * @mentions — tagging other Align users inside posts and comments.
 *
 * A mention is stored in the body text as markup:
 *     @[Display Name](user-uuid)
 * so the tagged person survives a display-name change and the text stays a
 * single column. Renderers turn it back into a clickable "@Display Name";
 * the DB trigger (supabase-migration-comment-replies-mentions.sql) reads the
 * same markup to send 'mention' notifications.
 *
 * Mirrors align-app's src/utils/mentions.tsx.
 */

import React from 'react';
import Link from 'next/link';
import { createClient } from './supabase';
import { renderTextWithLinks } from './linkify';

// @[Name](uuid) — the uuid pattern is strict so a stray "@[x](y)" stays text.
const UUID = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';
export const MENTION_RE = new RegExp(`@\\[([^\\]]{1,80})\\]\\((${UUID})\\)`, 'g');

export interface MentionUser {
  id: string;
  displayName: string;
  username?: string | null;
  avatarUrl?: string | null;
}

/** Wrap a user as mention markup ready to splice into the body text. */
export function mentionMarkup(user: MentionUser): string {
  // ] and ) inside a name would break the markup — strip them.
  const safeName = user.displayName.replace(/[\][()]/g, '').trim() || 'User';
  return `@[${safeName}](${user.id})`;
}

/** Every user id tagged in the text, de-duplicated. */
export function extractMentionIds(text: string): string[] {
  const ids = new Set<string>();
  const re = new RegExp(MENTION_RE.source, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) ids.add(m[2]);
  return Array.from(ids);
}

/** Markup → plain "@Display Name" (previews, push bodies, plain-text UI). */
export function stripMentionMarkup(text: string): string {
  if (!text) return text;
  return text.replace(new RegExp(MENTION_RE.source, 'g'), '@$1');
}

/**
 * Render body text with mentions as profile links and URLs as anchors.
 * Plain runs go through the existing linkifier so nothing regresses.
 */
export function renderRichText(text: string): React.ReactNode[] {
  if (!text) return [];
  const nodes: React.ReactNode[] = [];
  const re = new RegExp(MENTION_RE.source, 'g');
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(...renderTextWithLinks(text.slice(last, m.index)));
    nodes.push(
      <Link
        key={`mn-${key++}`}
        href={`/user/${m[2]}`}
        className="font-semibold text-accent-secondary hover:text-accent-primary hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        @{m[1]}
      </Link>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(...renderTextWithLinks(text.slice(last)));
  return nodes;
}

/**
 * Move a truncation point out of the middle of a mention so a folded post
 * never shows half of "@[Name](uuid)".
 */
export function clampCutOutsideMention(text: string, cut: number): number {
  const re = new RegExp(MENTION_RE.source, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    if (cut > start && cut < end) return start;
  }
  return cut;
}

// ── Composer helpers ───────────────────────────────────────────────

/** The "@qu" the caret currently sits in, or null. */
export function getMentionQuery(value: string, caret: number): { query: string; start: number } | null {
  const upToCaret = value.slice(0, caret);
  const at = upToCaret.lastIndexOf('@');
  if (at < 0) return null;
  // Must start a word (start of text or after whitespace)
  if (at > 0 && !/\s/.test(upToCaret[at - 1])) return null;
  const query = upToCaret.slice(at + 1);
  // A finished mention or a line break ends the query
  if (/[\n\]()]/.test(query) || query.length > 40) return null;
  return { query, start: at };
}

/** Replace the in-progress "@query" with full mention markup. */
export function applyMention(
  value: string,
  start: number,
  caret: number,
  user: MentionUser,
): { text: string; caret: number } {
  const markup = mentionMarkup(user) + ' ';
  const text = value.slice(0, start) + markup + value.slice(caret);
  return { text, caret: start + markup.length };
}

// ── Search ─────────────────────────────────────────────────────────

/**
 * Anyone on Align can be tagged — search by display name, username or
 * align code. Kept small and dedicated so per-keystroke lookups stay cheap.
 */
export async function searchMentionUsers(query: string, excludeId?: string): Promise<MentionUser[]> {
  const q = query.trim().replace(/[%,()]/g, '');
  if (q.length < 1) return [];
  const supabase = createClient();
  let req = supabase
    .from('profiles')
    .select('id, display_name, username, avatar_url')
    .or(`display_name.ilike.%${q}%,username.ilike.%${q}%,align_code.ilike.%${q}%`)
    .limit(8);
  if (excludeId) req = req.neq('id', excludeId);

  const { data } = await req;
  return (data || []).map((p: any) => ({
    id: p.id,
    displayName: p.display_name || 'Stargazer',
    username: p.username,
    avatarUrl: p.avatar_url,
  }));
}
