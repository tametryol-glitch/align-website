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

// ── Editing with names instead of markup ───────────────────────────────────
// The text box shows "@Display Name"; the value underneath keeps the full
// "@[Display Name](user-uuid)" markup so the tag (and its notification)
// survives. These map edits made to the shown text back onto the markup.

interface MentionSeg { raw: string; disp: string; mention: boolean }

function mentionSegments(value: string): MentionSeg[] {
  const segs: MentionSeg[] = [];
  const re = new RegExp(MENTION_RE.source, 'g');
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(value)) !== null) {
    if (m.index > last) { const t = value.slice(last, m.index); segs.push({ raw: t, disp: t, mention: false }); }
    segs.push({ raw: m[0], disp: `@${m[1]}`, mention: true });
    last = m.index + m[0].length;
  }
  if (last < value.length) { const t = value.slice(last); segs.push({ raw: t, disp: t, mention: false }); }
  return segs;
}

/** What the text box shows for a stored value. */
export function mentionDisplayText(value: string): string {
  return mentionSegments(value).map((s) => s.disp).join('');
}

/** Position in the shown text → position in the stored value. */
export function mentionDisplayToValuePos(value: string, pos: number): number {
  let d = 0;
  let r = 0;
  for (const s of mentionSegments(value)) {
    const de = d + s.disp.length;
    if (pos <= de) {
      if (!s.mention) return r + (pos - d);
      return pos === d ? r : r + s.raw.length;
    }
    d = de;
    r += s.raw.length;
  }
  return r;
}

/** Position in the stored value → position in the shown text. */
export function mentionValueToDisplayPos(value: string, pos: number): number {
  let d = 0;
  let r = 0;
  for (const s of mentionSegments(value)) {
    const re = r + s.raw.length;
    if (pos <= re) {
      if (!s.mention) return d + (pos - r);
      return pos === r ? d : d + s.disp.length;
    }
    d += s.disp.length;
    r = re;
  }
  return d;
}

/** True when the shown text has a tag starting at `pos` (its "@"). */
export function isMentionAt(value: string, pos: number): boolean {
  let d = 0;
  for (const s of mentionSegments(value)) {
    if (s.mention && d === pos) return true;
    d += s.disp.length;
  }
  return false;
}

/**
 * Apply an edit made to the shown text back onto the stored value.
 * Deleting into a tag removes the whole tag; typing inside a tag turns it
 * back into plain text (the tag no longer matches the person).
 */
export function applyMentionDisplayEdit(value: string, nextDisplay: string): string {
  let segs = mentionSegments(value);
  const prev = segs.map((s) => s.disp).join('');
  if (prev === nextDisplay) return value;

  let p = 0;
  const max = Math.min(prev.length, nextDisplay.length);
  while (p < max && prev[p] === nextDisplay[p]) p++;
  let sfx = 0;
  while (sfx < max - p && prev[prev.length - 1 - sfx] === nextDisplay[nextDisplay.length - 1 - sfx]) sfx++;
  let a = p;
  let b = prev.length - sfx;
  const ins = nextDisplay.slice(p, nextDisplay.length - sfx);

  // Typing inside a tag: it stops being a tag.
  if (a === b) {
    let d = 0;
    segs = segs.map((s) => {
      const hit = s.mention && a > d && a < d + s.disp.length;
      d += s.disp.length;
      return hit ? { raw: s.disp, disp: s.disp, mention: false } : s;
    });
  }
  // Deleting any part of a tag deletes all of it.
  let d = 0;
  for (const s of segs) {
    const ds = d;
    const de = d + s.disp.length;
    if (s.mention && a < de && b > ds) { a = Math.min(a, ds); b = Math.max(b, de); }
    d = de;
  }
  const base = segs.map((s) => s.raw).join('');
  const toRaw = (pos: number) => {
    let dd = 0;
    let rr = 0;
    for (const s of segs) {
      const de = dd + s.disp.length;
      if (pos <= de) {
        if (!s.mention) return rr + (pos - dd);
        return pos === dd ? rr : rr + s.raw.length;
      }
      dd = de;
      rr += s.raw.length;
    }
    return rr;
  };
  return base.slice(0, toRaw(a)) + ins + base.slice(toRaw(b));
}
