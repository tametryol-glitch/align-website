'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { MultiTrackComposition } from './MultiTrackComposition';
import { timelineDuration, type TimelineState } from '@/lib/editor/timelineModel';
import { useTimelineStore } from '@/lib/editor/timelineStore';

const FPS = 30;
// Hoisted so it's a stable reference — a fresh style object each render makes
// the Player re-render the whole composition on every playhead tick.
const PLAYER_STYLE: React.CSSProperties = { width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden', background: '#000' };

/**
 * WYSIWYG preview for the multi-track timeline. Renders the positioned
 * TimelineState via @remotion/player — the same composition the server renders,
 * so the preview matches the export. Two-way synced with the timeline playhead:
 * playback moves the playhead; clicking the ruler seeks the player.
 */
export default function MultiTrackPlayer({ timeline, width = 1080, height = 1920 }: { timeline: TimelineState; width?: number; height?: number }) {
  const durationInFrames = Math.max(1, Math.round(Math.max(0.1, timelineDuration(timeline)) * FPS));
  const ref = useRef<PlayerRef>(null);
  const playhead = useTimelineStore((s) => s.playhead);
  const setPlayhead = useTimelineStore((s) => s.setPlayhead);
  // Stable inputProps: only change identity when the timeline itself changes, so
  // playback (which re-renders this component every frame via `playhead`) doesn't
  // hand the Player a new object and force a full composition re-render each tick.
  const inputProps = useMemo(() => ({ timeline }), [timeline]);
  const component = useMemo(() => MultiTrackComposition as unknown as React.ComponentType<Record<string, unknown>>, []);

  // Playback → playhead: follow the player's frame so the timeline indicator moves.
  useEffect(() => {
    const player = ref.current;
    if (!player) return;
    const onFrame = (e: { detail: { frame: number } }) => setPlayhead(e.detail.frame / FPS);
    player.addEventListener('frameupdate', onFrame);
    return () => player.removeEventListener('frameupdate', onFrame);
  }, [setPlayhead]);

  // Playhead → player: when the playhead jumps (ruler click) away from the
  // player's frame, seek. The ~3-frame guard stops a feedback loop with frameupdate.
  useEffect(() => {
    const player = ref.current;
    if (!player) return;
    const target = Math.round(playhead * FPS);
    if (Math.abs(player.getCurrentFrame() - target) > 3) player.seekTo(target);
  }, [playhead]);

  return (
    <Player
      ref={ref}
      component={component}
      inputProps={inputProps as unknown as Record<string, unknown>}
      durationInFrames={durationInFrames}
      fps={FPS}
      compositionWidth={width}
      compositionHeight={height}
      style={PLAYER_STYLE}
      controls
    />
  );
}
