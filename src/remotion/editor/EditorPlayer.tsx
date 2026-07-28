'use client';

import React from 'react';
import { Player } from '@remotion/player';
import { UserVideoEdit } from './UserVideoEdit';
import { editSpecDurationSeconds, type VideoEditSpec } from '@/lib/videoEditSpec';

const FPS = 30;

/**
 * WYSIWYG preview for the video editor. Renders the exact same UserVideoEdit
 * composition align-video-renderer renders on the server, so the editor's
 * "Preview" mode shows precisely what will be posted. Fed the live edit spec
 * from the store via storeToEditSpec().
 */
export default function EditorPlayer({ spec }: { spec: VideoEditSpec }) {
  const durationInFrames = Math.max(1, Math.round(editSpecDurationSeconds(spec) * FPS));
  return (
    <Player
      component={UserVideoEdit as unknown as React.ComponentType<Record<string, unknown>>}
      inputProps={{ customizations: { editSpec: spec } } as unknown as Record<string, unknown>}
      durationInFrames={durationInFrames}
      fps={FPS}
      compositionWidth={1080}
      compositionHeight={1920}
      style={{ width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden' }}
      controls
      loop
    />
  );
}
