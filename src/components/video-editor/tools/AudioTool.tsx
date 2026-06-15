'use client';

/**
 * AudioTool — volume controls for original video audio.
 * Background music picker is marked as coming soon until
 * the music library + playback engine are built.
 */

import { useVideoEditorStore } from '@/stores/videoEditorStore';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { MUSIC_TRACKS, trackUrl, trackByUrl } from '@/lib/musicLibrary';

export function AudioTool() {
  const originalAudioVolume = useVideoEditorStore((s) => s.originalAudioVolume);
  const setOriginalAudioVolume = useVideoEditorStore((s) => s.setOriginalAudioVolume);
  const musicTrackUrl = useVideoEditorStore((s) => s.musicTrackUrl);
  const setMusicTrackUrl = useVideoEditorStore((s) => s.setMusicTrackUrl);
  const musicVolume = useVideoEditorStore((s) => s.musicVolume);
  const setMusicVolume = useVideoEditorStore((s) => s.setMusicVolume);
  const pushHistory = useVideoEditorStore((s) => s.pushHistory);
  const activeTrack = trackByUrl(musicTrackUrl);

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

      {/* Background music */}
      <div className="space-y-2 border-t border-white/10 pt-4">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-text-muted" />
          <span className="text-sm text-text-secondary">Background Music</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => { setMusicTrackUrl(null); pushHistory(); }}
            className={`px-2.5 py-2 rounded-md text-xs text-left border ${!musicTrackUrl ? 'border-accent-primary bg-accent-primary/10 text-text-primary' : 'border-white/10 bg-white/5 text-text-secondary hover:bg-white/10'}`}
          >
            None
          </button>
          {MUSIC_TRACKS.map((t) => {
            const active = activeTrack?.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { setMusicTrackUrl(trackUrl(t)); pushHistory(); }}
                className={`px-2.5 py-2 rounded-md text-xs text-left border ${active ? 'border-accent-primary bg-accent-primary/10 text-text-primary' : 'border-white/10 bg-white/5 text-text-secondary hover:bg-white/10'}`}
              >
                <span className="block font-medium truncate">{t.name}</span>
                <span className="block text-[10px] text-text-muted">{t.mood}</span>
              </button>
            );
          })}
        </div>

        {musicTrackUrl && (
          <div className="pt-1">
            <div className="flex items-center justify-between text-xs text-text-muted mb-1">
              <span>Music volume</span>
              <span className="font-mono">{Math.round(musicVolume * 100)}%</span>
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
          </div>
        )}
        <p className="text-[10px] text-text-muted">Royalty-free tracks. Plays under your video and mixes into the export.</p>
      </div>
    </div>
  );
}
