import { createClient } from '@/lib/supabase';

const STORAGE_KEY = 'align_bookmarked_posts';

function readLocal(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function writeLocal(ids: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {}
}

export async function getBookmarkedIds(): Promise<Set<string>> {
  return readLocal();
}

export async function bookmarkPost(postId: string): Promise<void> {
  const ids = readLocal();
  ids.add(postId);
  writeLocal(ids);
}

export async function unbookmarkPost(postId: string): Promise<void> {
  const ids = readLocal();
  ids.delete(postId);
  writeLocal(ids);
}

export async function isBookmarked(postId: string): Promise<boolean> {
  return readLocal().has(postId);
}

export async function toggleBookmark(postId: string): Promise<boolean> {
  const ids = readLocal();
  if (ids.has(postId)) {
    ids.delete(postId);
    writeLocal(ids);
    return false;
  } else {
    ids.add(postId);
    writeLocal(ids);
    return true;
  }
}
