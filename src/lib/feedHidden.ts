// "Hide this post" and "Mute" for the feed. Stored on this device only (no
// server table yet), which is enough to stop a post or person from coming
// back on the same browser. Blocking is separate and server-side.

const KEY = 'align_feed_hidden_v1';
// Keeps the list from growing without bound; the oldest entries fall off.
const MAX_ENTRIES = 500;

export interface HiddenState {
  posts: Set<string>;
  users: Set<string>;
}

export function loadHidden(): HiddenState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw);
      return {
        posts: new Set<string>(Array.isArray(d?.posts) ? d.posts.map(String) : []),
        users: new Set<string>(Array.isArray(d?.users) ? d.users.map(String) : []),
      };
    }
  } catch {
    // Storage unavailable or corrupt: nothing hidden.
  }
  return { posts: new Set(), users: new Set() };
}

function save(state: HiddenState): void {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        posts: Array.from(state.posts).slice(-MAX_ENTRIES),
        users: Array.from(state.users).slice(-MAX_ENTRIES),
      }),
    );
  } catch {
    // Quota or private mode: the hide still applies for this visit.
  }
}

export function hidePost(state: HiddenState, postId: string): HiddenState {
  const next = { posts: new Set(state.posts).add(postId), users: state.users };
  save(next);
  return next;
}

export function muteUser(state: HiddenState, userId: string): HiddenState {
  const next = { posts: state.posts, users: new Set(state.users).add(userId) };
  save(next);
  return next;
}
