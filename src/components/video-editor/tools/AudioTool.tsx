'use client';

/**
 * AudioTool — volume controls for original video audio.
 * Background music picker is marked as coming soon until
 * the music library + playback engine are built.
 */

import { useVideoEditorStore } from '@/stores/videoEditorStore';
import { Volume2, VolumeX, Music } from 'lucide-react';

export function AudioTool() {
  const originalAudioVolume = useVideoEditorStore((s) => s.originalAudioVolume);
  const setOriginalAudioVolume = useVideoEditorStore((s) => s.setOriginalAudioVolume);
  const pushHistory = useVideoEditorStore((s) => s.pushHistory);

  return (
    <div className="space-y-5">
      {/* Original audio volume */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {originalAudioVolume > 0 ? (
            <Volume2 className="w-4 h-4 text-text-muted" />
          ) : (
            <VolumeX className="w-4 h-4 text-text-muted" />
          )}
          <span className="text-sm text-text-secondary">Video Audio</span>
          <span className="ml-auto text-xs text-text-muted font-mono">
            {Math.round(originalAudioVolume * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={originalAudioVolume}
          onChange={(e) => setOriginalAudioVolume(parseFloat(e.target.value))}
          onMouseUp={() => pushHistory()}
          className="w-full accent-accent-primary"
        />
        <div className="flex justify-between">
          <button
            onClick={() => { setOriginalAudioVolume(0); pushHistory(); }}
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            Mute
          </button>
          <button
            onClick={() => { setOriginalAudioVolume(1); pushHistory(); }}
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            Full
          </button>
        </div>
      </div>

      {/* Background music — coming soon */}
      <div className="space-y-2 opacity-60">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-text-muted" />
          <span className="text-sm text-text-secondary">Background Music</span>
          <span className="ml-auto text-[10px] text-accent-primary font-medium px-1.5 py-0.5 rounded-full bg-accent-primary/10">
            Coming Soon
          </span>
        </div>
        <p className="text-xs text-text-muted">
          Browse and add royalty-free music tracks to your video. This feature is being built.
        </p>
      </div>
    </div>
  );
}
