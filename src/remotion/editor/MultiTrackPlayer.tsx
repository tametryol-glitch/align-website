'use client';

import React from 'react';
import { Player } from '@remotion/player';
import { MultiTrackComposition } from './MultiTrackComposition';
import { timelineDuration, type TimelineState } from '@/lib/editor/timelineModel';

const FPS = 30;

/**
 * WYSIWYG preview for the multi-track timeline. Renders the positioned
 * TimelineState via @remotion/player — the same composition the server renders,
 * so the preview matches the export.
 */
export default function MultiTrackPlayer({ timeline, width = 1080, height = 1920 }: { timeline: TimelineState; width?: number; height?: number }) {
  const durationInFrames = Math.max(1, Math.round(Math.max(0.1, timelineDuration(timeline)) * FPS));
  return (
    <Player
      component={MultiTrackComposition as unknown as React.ComponentType<Record<string, unknown>>}
      inputProps={{ timeline } as unknown as Record<string, unknown>}
      durationInFrames={durationInFrames}
      fps={FPS}
      compositionWidth={width}
      compositionHeight={height}
      style={{ width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden', background: '#000' }}
      controls
    />
  );
}
