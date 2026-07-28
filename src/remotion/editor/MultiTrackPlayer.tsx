'use client';

import React, { useRef, useEffect } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { MultiTrackComposition } from './MultiTrackComposition';
import { timelineDuration, type TimelineState } from '@/lib/editor/timelineModel';

const FPS = 30;

/**
 * WYSIWYG preview for the multi-track timeline. Renders the positioned
 * TimelineState via @remotion/player — the same composition the server will
 * render in Phase 4, so the preview matches the export.
 */
export default function MultiTrackPlayer({ timeline }: { timeline: TimelineState }) {
  const durationInFrames = Math.max(1, Math.round(Math.max(0.1, timelineDuration(timeline)) * FPS));
  const ref = useRef<PlayerRef>(null);
  // Branch-only test hook so the preview can be seeked from the console.
  useEffect(() => { (window as unknown as { __player?: PlayerRef | null }).__player = ref.current; });
  return (
    <Player
      ref={ref}
      component={MultiTrackComposition as unknown as React.ComponentType<Record<string, unknown>>}
      inputProps={{ timeline } as unknown as Record<string, unknown>}
      durationInFrames={durationInFrames}
      fps={FPS}
      compositionWidth={1080}
      compositionHeight={1920}
      style={{ width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden', background: '#000' }}
      controls
    />
  );
}
