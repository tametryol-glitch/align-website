'use client';

// ═══════════════════════════════════════════════════════════════════
// Stories rail — top of the feed. "Your story" first, then authors with
// something unseen (gradient ring), then fully-seen authors (muted ring).
// Order comes from get_story_rail(); this only renders it.
//
// Deep link: /feed?story=<id> opens the viewer on that frame (used by the
// 'story_reaction' notification, which always points at your own story).
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { getStoryRail, type StoryGroup } from '@/lib/storyService';
import { StoryCreator } from './StoryCreator';
import { StoryViewer } from './StoryViewer';

function BubbleAvatar({ url, name }: { url: string | null; name: string | null }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className="w-full h-full rounded-full object-cover" />
  ) : (
    <div className="w-full h-full rounded-full bg-accent-primary/30 flex items-center justify-center text-lg font-semibold text-text-primary">
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );
}

export function StoryRail() {
  const { t } = useTranslation();
  const { user, profile } = useAuthStore();
  const myId = user?.id || '';
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [viewer, setViewer] = useState<{ group: number; story: number; groups: StoryGroup[] } | null>(null);
  const deepLinkHandledRef = useRef(false);

  const load = useCallback(async () => {
    if (!myId) return;
    try {
      setGroups(await getStoryRail());
    } catch {
      // A failed rail must never take the feed down with it.
    } finally {
      setLoaded(true);
    }
  }, [myId]);

  useEffect(() => { load(); }, [load]);

  // Notification deep link: /feed?story=<id>.
  useEffect(() => {
    if (!loaded || deepLinkHandledRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const storyId = params.get('story');
    if (!storyId) return;
    deepLinkHandledRef.current = true;
    for (let g = 0; g < groups.length; g++) {
      const s = groups[g].stories.findIndex((x) => x.id === storyId);
      if (s !== -1) { setViewer({ group: g, story: s, groups }); break; }
    }
    // Drop only our param; an expired story just leaves you on the feed.
    params.delete('story');
    const qs = params.toString();
    window.history.replaceState({}, '', `/feed${qs ? `?${qs}` : ''}`);
  }, [loaded, groups]);

  if (!myId) return null;

  const mine = groups.find((g) => g.user_id === myId) || null;
  const others = groups.filter((g) => g.user_id !== myId);

  function openGroup(g: StoryGroup) {
    const index = groups.indexOf(g);
    if (index === -1) return;
    // Resume at the first unseen frame, like everyone expects.
    const firstUnseen = g.user_id === myId ? 0 : g.stories.findIndex((s) => !s.seen);
    setViewer({ group: index, story: firstUnseen === -1 ? 0 : firstUnseen, groups });
  }

  const ringClass = (g: StoryGroup | null) =>
    !g ? 'bg-border-primary' : g.all_seen && g.user_id !== myId
      ? 'bg-border-primary'
      : 'bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600';

  return (
    <>
      <div className="mb-4 -mx-1">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide px-1 pb-1" role="list" aria-label={t('stories.rail', 'Stories')}>
          {/* Your story */}
          <div className="shrink-0 w-[68px] flex flex-col items-center" role="listitem">
            <div className="relative">
              <button
                onClick={() => (mine ? openGroup(mine) : setCreatorOpen(true))}
                className={cn('w-16 h-16 rounded-full p-[2px]', mine ? ringClass(mine) : 'bg-transparent')}
                aria-label={mine ? t('stories.viewYours', 'View your story') : t('stories.add', 'Add to your story')}
              >
                <div className="w-full h-full rounded-full p-[2px] bg-bg-primary">
                  <BubbleAvatar url={profile?.avatar_url || null} name={profile?.display_name || null} />
                </div>
              </button>
              <button
                onClick={() => setCreatorOpen(true)}
                className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-accent-primary border-2 border-bg-primary flex items-center justify-center hover:scale-110 transition-transform"
                aria-label={t('stories.add', 'Add to your story')}
              >
                <Plus className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <span className="mt-1 text-[11px] text-text-secondary truncate w-full text-center">{t('stories.yourStory', 'Your story')}</span>
          </div>

          {others.map((g) => (
            <div key={g.user_id} className="shrink-0 w-[68px] flex flex-col items-center" role="listitem">
              <button
                onClick={() => openGroup(g)}
                className={cn('w-16 h-16 rounded-full p-[2px]', ringClass(g))}
                aria-label={t('stories.viewOf', 'View story from {{name}}', { name: g.display_name || '' })}
              >
                <div className="w-full h-full rounded-full p-[2px] bg-bg-primary">
                  <BubbleAvatar url={g.avatar_url} name={g.display_name} />
                </div>
              </button>
              <span className={cn('mt-1 text-[11px] truncate w-full text-center', g.all_seen ? 'text-text-muted' : 'text-text-primary')}>
                {g.display_name || t('stories.someone', 'Someone')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {creatorOpen && (
        <StoryCreator
          userId={myId}
          onClose={() => setCreatorOpen(false)}
          onPosted={() => { setCreatorOpen(false); load(); }}
        />
      )}

      {viewer && (
        <StoryViewer
          groups={viewer.groups}
          startGroup={viewer.group}
          startStory={viewer.story}
          myId={myId}
          onClose={() => setViewer(null)}
          onChanged={load}
        />
      )}
    </>
  );
}
