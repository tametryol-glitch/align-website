'use client';

import React from 'react';
import { Player } from '@remotion/player';
import { DailyForecastStudio, dailyForecastDefaults, type DailyForecastStudioProps } from './DailyForecastStudio';

const FPS = 30;
const PREVIEW_SECONDS = 10;

/**
 * Live preview surface for Cosmic Studio. Renders the SAME Remotion
 * composition the server will render, so the editor is no longer "blind" —
 * what you see is what you'll post. Currently wired to the Daily Forecast
 * composition; other content types plug in the same way.
 */
export default function CosmicPlayer({ inputProps }: { inputProps: Partial<DailyForecastStudioProps> }) {
  const props: DailyForecastStudioProps = { ...dailyForecastDefaults, ...inputProps };
  return (
    <Player
      component={DailyForecastStudio as unknown as React.ComponentType<Record<string, unknown>>}
      inputProps={props as unknown as Record<string, unknown>}
      durationInFrames={FPS * PREVIEW_SECONDS}
      fps={FPS}
      compositionWidth={1080}
      compositionHeight={1920}
      style={{ width: '100%', borderRadius: 18, overflow: 'hidden' }}
      controls
      loop
      autoPlay
    />
  );
}
