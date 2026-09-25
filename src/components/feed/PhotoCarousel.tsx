'use client';

// Photo post media: one photo, or a swipeable carousel of up to 10, with an
// optional song under the whole post (TikTok photo mode). The <audio> belongs
// to the post, not to a slide, so the song keeps playing without a break
// while the viewer swipes from photo to photo.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Music2, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  claimPlayback, releasePlayback, useActiveOwner, useFeedMuted, setFeedMuted, recordMusicListen,
  type AttachedMusic,
} from '@/lib/postMusic';

export function PhotoCarousel({
  postId,
  images,
  music,
}: {
  postId: string;
  images: string[];
  music?: AttachedMusic;
}) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const muted = useFeedMuted();
  const activeOwner = useActiveOwner();
  const owner = `post:${postId}`;
  const isActive = activeOwner === owner;
  const many = images.length > 1;

  // Which slide is showing — from the native scroll-snap position.
  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || !el.clientWidth) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setIndex(Math.max(0, Math.min(images.length - 1, i)));
  }, [images.length]);

  const go = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(images.length - 1, index + dir));
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
  };

  // Claim the feed's single music slot while this post is mostly on screen.
  useEffect(() => {
    if (!music || !rootRef.current) return;
    const el = rootRef.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) claimPlayback(owner);
        else releasePlayback(owner);
      },
      { threshold: [0, 0.6, 1] },
    );
    io.observe(el);
    return () => { io.disconnect(); releasePlayback(owner); };
  }, [music, owner]);

  // Play / pause the one song for this post.
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !music) return;
    if (isActive && !muted && document.visibilityState === 'visible') {
      if (a.currentTime < music.startSec) a.currentTime = music.startSec;
      a.play()
        .then(() => recordMusicListen(owner, music.trackId))
        // Autoplay refused (no interaction with the page yet) — show muted.
        .catch(() => setFeedMuted(true, false));
    } else {
      a.pause();
    }
  }, [isActive, muted, music, owner]);

  // Pause when the tab is hidden, resume when it comes back.
  useEffect(() => {
    if (!music) return;
    const onVis = () => {
      const a = audioRef.current;
      if (!a) return;
      if (document.visibilityState !== 'visible') a.pause();
      else if (isActive && !muted) a.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [music, isActive, muted]);

  // Loop back to the chosen start point rather than 0:00.
  const onEnded = () => {
    const a = audioRef.current;
    if (!a || !music) return;
    a.currentTime = music.startSec;
    if (isActive && !muted) a.play().catch(() => {});
  };

  const toggleSound = () => {
    if (muted) {
      claimPlayback(owner);
      // Start inside the tap itself — iOS Safari only allows sound that way.
      const a = audioRef.current;
      if (a && music) {
        if (a.currentTime < music.startSec) a.currentTime = music.startSec;
        a.play().catch(() => {});
      }
    }
    setFeedMuted(!muted);
  };

  return (
    <div ref={rootRef} className="relative rounded-xl overflow-hidden bg-black/40 group">
      <div
        ref={scrollerRef}
        onScroll={many ? onScroll : undefined}
        className={cn('flex', many && 'overflow-x-auto snap-x snap-mandatory scrollbar-hide')}
        style={many ? { scrollbarWidth: 'none' } : undefined}
      >
        {images.map((src, i) => (
          <div key={`${i}-${src}`} className="w-full shrink-0 snap-center flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              loading={i === 0 ? 'eager' : 'lazy'}
              draggable={false}
              className={cn('w-full object-cover', many ? 'aspect-[4/5] max-h-[520px]' : 'max-h-[400px]')}
            />
          </div>
        ))}
      </div>

      {many && (
        <>
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[11px] font-semibold">
            {index + 1}/{images.length}
          </span>
          {index > 0 && (
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={t('feed.carousel.prev', 'Previous photo')}
              className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/55 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {index < images.length - 1 && (
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={t('feed.carousel.next', 'Next photo')}
              className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/55 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <span key={i} className={cn('h-1.5 rounded-full transition-all', i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/50')} />
            ))}
          </div>
        </>
      )}

      {music && (
        <>
          <audio ref={audioRef} src={music.url} preload="none" onEnded={onEnded} />
          <button
            type="button"
            onClick={toggleSound}
            className={cn(
              'absolute left-2 flex items-center gap-1.5 max-w-[70%] pl-2 pr-2.5 py-1 rounded-full bg-black/60 text-white text-[11px] font-medium backdrop-blur-sm',
              many ? 'bottom-6' : 'bottom-2',
            )}
            aria-label={muted ? t('music.unmute', 'Turn sound on') : t('music.mute', 'Turn sound off')}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5 shrink-0" /> : <Volume2 className="w-3.5 h-3.5 shrink-0" />}
            <Music2 className={cn('w-3 h-3 shrink-0', isActive && !muted && 'animate-spin')} style={{ animationDuration: '3s' }} />
            <span className="truncate">{music.title || t('music.song', 'Song')}</span>
          </button>
        </>
      )}
    </div>
  );
}
