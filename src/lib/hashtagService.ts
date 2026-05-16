const STORAGE_KEY = 'align_hashtag_index';

interface HashtagEntry {
  tag: string;
  postIds: string[];
  lastUsed: string;
}

export function parseHashtags(text: string): string[] {
  const matches = text.match(/#[a-zA-Z0-9_]+/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map(tag => tag.toLowerCase())));
}

function loadIndex(): HashtagEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveIndex(index: HashtagEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(index));
  } catch {}
}

export function indexPostHashtags(postId: string, content: string): void {
  try {
    const tags = parseHashtags(content);
    if (tags.length === 0) return;

    const index = loadIndex();
    const now = new Date().toISOString();

    for (const tag of tags) {
      const entry = index.find(e => e.tag === tag);
      if (entry) {
        if (!entry.postIds.includes(postId)) {
          entry.postIds.push(postId);
        }
        entry.lastUsed = now;
      } else {
        index.push({ tag, postIds: [postId], lastUsed: now });
      }
    }

    saveIndex(index);
  } catch {}
}

export function getTrendingHashtags(limit: number = 10): { tag: string; count: number }[] {
  try {
    const index = loadIndex();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    return index
      .filter(e => e.lastUsed >= weekAgo)
      .sort((a, b) => b.postIds.length - a.postIds.length)
      .slice(0, limit)
      .map(e => ({ tag: e.tag, count: e.postIds.length }));
  } catch {
    return [];
  }
}

export function getPostIdsByHashtag(tag: string): string[] {
  try {
    const index = loadIndex();
    const normalizedTag = tag.startsWith('#') ? tag.toLowerCase() : `#${tag.toLowerCase()}`;
    const entry = index.find(e => e.tag === normalizedTag);
    return entry?.postIds || [];
  } catch {
    return [];
  }
}
