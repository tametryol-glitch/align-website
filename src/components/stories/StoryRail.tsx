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
import { Plus, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { getStoryRail, STORY_BACKGROUNDS, type Story, type StoryGroup } from '@/lib/storyService';
import { StoryCreator } from './StoryCreator';
import { StoryViewer } from './StoryViewer';

function BubbleAvatar({ url, name }: { url: string | null; name: string | null }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className="w-full h-full rounded-full object-cover" />
  ) : (
    <div className="w-full h-full rounded-full bg-accent-primary/30 flex items-center justify-center text-sm font-semibold text-text-primary">
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );
}

/** What the card shows: the author's newest frame. */
function StoryPreview({ story }: { story: Story }) {
  if (story.type === 'image' && story.media_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={story.media_url} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />;
  }
  if (story.type === 'video') {
    return story.thumbnail_url ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={story.thumbnail_url} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
    ) : story.media_url ? (
      // Stories posted before posters existed: let the browser pull one frame.
      <video src={`${story.media_url}#t=0.1`} preload="metadata" muted playsInline className="absolute inset-0 w-full h-full object-cover" />
    ) : null;
  }
  return (
    <div
      className="absolute inset-0 flex items-center justify-center p-2"
      style={{ backgroundColor: story.background_color || STORY_BACKGROUNDS[0] }}
    >
      <p className="text-white text-[11px] font-semibold leading-snug text-center line-clamp-5 break-words">{story.content}</p>
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

  const ringClass = (g: StoryGroup) =>
    g.all_seen && g.user_id !== myId
      ? 'bg-border-primary'
      : 'bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600';

  const newest = (g: StoryGroup) => g.stories[g.stories.length - 1];

  // Portrait card: the newest frame fills it, the author's avatar sits in a
  // ring (gradient = something unseen) in the corner, name along the bottom.
  // A render helper, not a component: defined in here it would remount (and
  // reload its image) on every rail update.
  function renderCard({ g, label, onClick, ariaLabel }: { g: StoryGroup; label: string; onClick: () => void; ariaLabel: string }) {
    const latest = newest(g);
    return (
      <button
        onClick={onClick}
        className="relative w-[92px] h-[148px] rounded-xl overflow-hidden bg-bg-tertiary border border-border-primary hover:brightness-110 transition"
        aria-label={ariaLabel}
      >
        <StoryPreview story={latest} />
        {latest.type === 'video' && (
          <Play className="absolute top-2 right-2 w-3.5 h-3.5 text-white drop-shadow" fill="currentColor" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/75 to-transparent" />
        <div className={cn('absolute top-1.5 left-1.5 w-9 h-9 rounded-full p-[2px]', ringClass(g))}>
          <div className="w-full h-full rounded-full p-[1.5px] bg-bg-primary">
            <BubbleAvatar url={g.avatar_url} name={g.display_name} />
          </div>
        </div>
        <span className={cn(
          'absolute inset-x-1.5 bottom-1.5 text-[11px] font-semibold text-left truncate',
          g.all_seen && g.user_id !== myId ? 'text-white/70' : 'text-white',
        )}>
          {label}
        </span>
      </button>
    );
  }

  return (
    <>
      <div className="mb-4 -mx-1">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-1 pb-1" role="list" aria-label={t('stories.rail', 'Stories')}>
          {/* Your story: your newest frame, or a create card when you have none */}
          <div className="shrink-0 relative" role="listitem">
            {mine ? (
              renderCard({
                g: mine,
                label: t('stories.yourStory', 'Your story'),
                onClick: () => openGroup(mine),
                ariaLabel: t('stories.viewYours', 'View your story'),
              })
            ) : (
              <button
                onClick={() => setCreatorOpen(true)}
                className="relative w-[92px] h-[148px] rounded-xl overflow-hidden bg-bg-tertiary border border-border-primary hover:brightness-110 transition flex flex-col"
                aria-label={t('stories.add', 'Add to your story')}
              >
                <div className="h-[98px] w-full overflow-hidden">
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-accent-primary/30 flex items-center justify-center text-2xl font-semibold text-text-primary">
                      {(profile?.display_name || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="flex-1 flex items-end justify-center pb-2 text-[11px] font-semibold text-text-primary">
                  {t('stories.yourStory', 'Your story')}
                </span>
              </button>
            )}
            <button
              onClick={() => setCreatorOpen(true)}
              className={cn(
                'absolute w-7 h-7 rounded-full bg-accent-primary border-2 border-bg-primary flex items-center justify-center hover:scale-110 transition-transform',
                mine ? 'top-1.5 right-1.5' : 'left-1/2 -translate-x-1/2 top-[84px]',
              )}
              aria-label={t('stories.add', 'Add to your story')}
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>

          {others.map((g) => (
            <div key={g.user_id} className="shrink-0" role="listitem">
              {renderCard({
                g: g,
                label: g.display_name || t('stories.someone', 'Someone'),
                onClick: () => openGroup(g),
                ariaLabel: t('stories.viewOf', 'View story from {{name}}', { name: g.display_name || '' }),
              })}
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
