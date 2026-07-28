/**
 * Drafts — auto-save the multi-track edit to localStorage so nothing is lost on
 * an accidental close/refresh. Keyed by source video so each clip's edit is
 * remembered. (Blob: sources don't survive a full reload — the edit structure
 * restores but freshly-imported media must be re-linked; hosted sources restore
 * fully.)
 */

import type { TimelineState } from './timelineModel';

export interface EditorDraft {
  sourceUrl: string;
  data: TimelineState;
  aspect: { w: number; h: number };
  savedAt: number;
}

const KEY = 'align_mt_draft_v1';

export function saveDraft(d: EditorDraft): void {
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* quota / disabled */ }
}

export function loadDraft(): EditorDraft | null {
  try {
    const s = localStorage.getItem(KEY);
    return s ? (JSON.parse(s) as EditorDraft) : null;
  } catch { return null; }
}

export function clearDraft(): void {
  try { localStorage.removeItem(KEY); } catch { /* noop */ }
}

/** "3 minutes ago" style label. Pass Date.now() from the caller (SSR-safe). */
export function agoLabel(savedAt: number, now: number): string {
  const s = Math.max(0, Math.round((now - savedAt) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}
