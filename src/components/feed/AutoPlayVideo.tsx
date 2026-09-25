'use client';

// Feed video that plays itself when scrolled into view and pauses as soon as
// it scrolls away. It shares the feed's single playing slot with photo-post
// songs (lib/postMusic.ts), so only one thing ever plays: starting a video —
// by scrolling or by pressing play — pauses whatever was playing before.
//
// Sound: tries with sound first. Browsers refuse that until the visitor has
// tapped the page once, so it then plays muted (always allowed) and tries
// with sound again the next time it comes into view. The native controls stay
// for unmuting, seeking and pausing; a manual pause is respected until the
// video leaves the screen.

import { useEffect, useRef } from 'react';
import { claimPlayback, useInViewPlayback } from '@/lib/postMusic';

export function AutoPlayVideo({
  postId,
  src,
  poster,
  className,
  onPlay,
}: {
  postId: string;
  src: string;
  poster?: string;
  className?: string;
  onPlay?: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const owner = `video:${postId}`;
  const active = useInViewPlayback(ref, owner);
  // Pauses/mutes we did ourselves, so they aren't mistaken for the viewer's.
  const selfPausing = useRef(false);
  const autoMuted = useRef(false);
  const userPaused = useRef(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (!active) {
      userPaused.current = false;
      if (!v.paused) { selfPausing.current = true; v.pause(); }
      return;
    }
    if (userPaused.current || !v.paused) return;
    if (autoMuted.current) { v.muted = false; autoMuted.current = false; }
    v.play().catch(() => {
      // Sound blocked until the first tap on the page — play muted instead.
      if (!ref.current || v.muted) return;
      v.muted = true;
      autoMuted.current = true;
      v.play().catch(() => {});
    });
  }, [active]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      controls
      playsInline
      preload="metadata"
      className={className}
      onPlay={() => {
        // Pressed play on a video that isn't the one in focus: it takes over.
        claimPlayback(owner);
        onPlay?.();
      }}
      onPause={() => {
        if (selfPausing.current) { selfPausing.current = false; return; }
        const v = ref.current;
        if (v && !v.ended) userPaused.current = true;
      }}
      onVolumeChange={() => {
        // The viewer turned the sound on themselves — keep it that way.
        if (ref.current && !ref.current.muted) autoMuted.current = false;
      }}
    />
  );
}
