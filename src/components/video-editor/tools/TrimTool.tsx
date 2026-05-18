'use client';

/**
 * TrimTool — set trim start/end with input fields and quick buttons.
 */

import { useVideoEditorStore } from '@/stores/videoEditorStore';

export function TrimTool() {
  const trimStart = useVideoEditorStore((s) => s.trimStart);
  const trimEnd = useVideoEditorStore((s) => s.trimEnd);
  const videoDuration = useVideoEditorStore((s) => s.videoDuration);
  const currentTime = useVideoEditorStore((s) => s.currentTime);
  const setTrimStart = useVideoEditorStore((s) => s.setTrimStart);
  const setTrimEnd = useVideoEditorStore((s) => s.setTrimEnd);
  const pushHistory = useVideoEditorStore((s) => s.pushHistory);

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = (t % 60).toFixed(1);
    return `${m}:${s.padStart(4, '0')}`;
  };

  const handleSetStart = () => {
    setTrimStart(currentTime);
    pushHistory();
  };

  const handleSetEnd = () => {
    setTrimEnd(currentTime);
    pushHistory();
  };

  const handleReset = () => {
    setTrimStart(0);
    setTrimEnd(videoDuration);
    pushHistory();
  };

  return (
    <div className="space-y-4">
      {/* Duration info */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-muted">Trimmed duration</span>
        <span className="text-text-primary font-mono">
          {formatTime(trimEnd - trimStart)}
        </span>
      </div>

      {/* Start / End controls */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-text-muted block mb-1">Start</label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-text-secondary bg-white/5 px-2 py-1 rounded-md flex-1 text-center">
              {formatTime(trimStart)}
            </span>
            <button
              onClick={handleSetStart}
              className="text-xs px-2 py-1 rounded-md bg-accent-primary/20 text-accent-primary hover:bg-accent-primary/30 transition-colors"
              title="Set to current playhead position"
            >
              Set
            </button>
          </div>
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">End</label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-text-secondary bg-white/5 px-2 py-1 rounded-md flex-1 text-center">
              {formatTime(trimEnd)}
            </span>
            <button
              onClick={handleSetEnd}
              className="text-xs px-2 py-1 rounded-md bg-accent-primary/20 text-accent-primary hover:bg-accent-primary/30 transition-colors"
              title="Set to current playhead position"
            >
              Set
            </button>
          </div>
        </div>
      </div>

      {/* Range slider */}
      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={videoDuration}
          step={0.1}
          value={trimStart}
          onChange={(e) => { setTrimStart(parseFloat(e.target.value)); }}
          onMouseUp={() => pushHistory()}
          className="w-full accent-accent-primary"
        />
        <input
          type="range"
          min={0}
          max={videoDuration}
          step={0.1}
          value={trimEnd}
          onChange={(e) => { setTrimEnd(parseFloat(e.target.value)); }}
          onMouseUp={() => pushHistory()}
          className="w-full accent-accent-primary"
        />
      </div>

      {/* Reset */}
      <button
        onClick={handleReset}
        className="text-xs text-text-muted hover:text-text-secondary transition-colors"
      >
        Reset to full duration
      </button>

      <p className="text-xs text-text-muted">
        Tip: You can also drag the trim handles on the timeline, or use the "Set" buttons to snap to the current playhead.
      </p>
    </div>
  );
}
