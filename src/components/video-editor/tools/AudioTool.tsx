'use client';

/**
 * AudioTool — volume controls for original video audio and background music.
 */

import { useVideoEditorStore } from '@/stores/videoEditorStore';
import { Volume2, VolumeX, Music } from 'lucide-react';

export function AudioTool() {
  const originalAudioVolume = useVideoEditorStore((s) => s.originalAudioVolume);
  const musicVolume = useVideoEditorStore((s) => s.musicVolume);
  const musicTrackUrl = useVideoEditorStore((s) => s.musicTrackUrl);
  const setOriginalAudioVolume = useVideoEditorStore((s) => s.setOriginalAudioVolume);
  const setMusicVolume = useVideoEditorStore((s) => s.setMusicVolume);
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

      {/* Music volume */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-text-muted" />
          <span className="text-sm text-text-secondary">Background Music</span>
          <span className="ml-auto text-xs text-text-muted font-mono">
            {Math.round(musicVolume * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={musicVolume}
          onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
          onMouseUp={() => pushHistory()}
          className="w-full accent-accent-primary"
        />
        {!musicTrackUrl && (
          <p className="text-xs text-text-muted">
            No background music added. Music from the original render will be included if present.
          </p>
        )}
      </div>
    </div>
  );
}
