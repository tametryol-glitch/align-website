'use client';

/**
 * BrollTool — add and configure B-roll / overlay clips on a second video track.
 * Each clip plays over the main video as picture-in-picture during its window.
 */

import { useRef } from 'react';
import { useVideoEditorStore, type BrollClip } from '@/stores/videoEditorStore';
import { Film, Trash2, Upload } from 'lucide-react';

export function BrollTool() {
  const fileRef = useRef<HTMLInputElement>(null);
  const brollClips = useVideoEditorStore((s) => s.brollClips);
  const currentTime = useVideoEditorStore((s) => s.currentTime);
  const videoDuration = useVideoEditorStore((s) => s.videoDuration);
  const selectedBrollId = useVideoEditorStore((s) => s.selectedBrollId);
  const addBroll = useVideoEditorStore((s) => s.addBroll);
  const updateBroll = useVideoEditorStore((s) => s.updateBroll);
  const removeBroll = useVideoEditorStore((s) => s.removeBroll);
  const selectBroll = useVideoEditorStore((s) => s.selectBroll);
  const pushHistory = useVideoEditorStore((s) => s.pushHistory);

  const selected = brollClips.find((b) => b.id === selectedBrollId);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|mov|webm|mkv)$/i)) return;
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.muted = true;
    const add = (dur: number) => {
      const clip: BrollClip = {
        id: `broll_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        sourceUrl: url,
        duration: dur,
        sourceStart: 0,
        sourceEnd: Math.min(dur, 5),
        timelineStart: currentTime,
        x: 72, y: 26, scale: 0.42, opacity: 1, rotation: 0,
      };
      addBroll(clip);
      pushHistory();
      v.remove();
    };
    v.onloadedmetadata = () => add(isFinite(v.duration) && v.duration > 0 ? v.duration : 5);
    v.onerror = () => add(5);
    v.src = url;
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.currentTarget.value = ''; }}
      />

      <button
        onClick={() => fileRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent-primary/20 text-accent-primary hover:bg-accent-primary/30 transition-colors text-sm font-medium"
      >
        <Upload className="w-4 h-4" /> Add a B-roll clip
      </button>
      <p className="text-[11px] text-text-muted -mt-2">
        Drops a second clip over your video as picture-in-picture, starting at the playhead.
      </p>

      {brollClips.length > 0 && (
        <div className="space-y-1.5">
          {brollClips.map((b, i) => (
            <button
              key={b.id}
              onClick={() => selectBroll(b.id)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs border ${selectedBrollId === b.id ? 'border-accent-primary bg-accent-primary/10 text-text-primary' : 'border-white/10 bg-white/5 text-text-secondary'}`}
            >
              <Film className="w-3.5 h-3.5 text-accent-secondary" />
              <span className="flex-1 text-left">Overlay {i + 1} · {(b.sourceEnd - b.sourceStart).toFixed(1)}s @ {b.timelineStart.toFixed(1)}s</span>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="space-y-3 border-t border-white/10 pt-3">
          <div>
            <p className="text-xs text-text-muted mb-1.5">Quick position</p>
            <div className="grid grid-cols-3 gap-1.5">
              {([
                ['Top L', { x: 22, y: 22 }], ['Top', { x: 50, y: 22 }], ['Top R', { x: 78, y: 22 }],
                ['Left', { x: 22, y: 50 }], ['Center', { x: 50, y: 50 }], ['Right', { x: 78, y: 50 }],
                ['Bot L', { x: 22, y: 78 }], ['Bottom', { x: 50, y: 78 }], ['Bot R', { x: 78, y: 78 }],
              ] as [string, { x: number; y: number }][]).map(([label, pos]) => (
                <button
                  key={label}
                  onClick={() => { updateBroll(selected.id, pos); pushHistory(); }}
                  className="text-[10px] py-1 rounded-md bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => { updateBroll(selected.id, { x: 50, y: 50, scale: 1 }); pushHistory(); }}
              className="w-full mt-1.5 text-[10px] py-1 rounded-md bg-accent-primary/15 text-accent-primary hover:bg-accent-primary/25 transition-colors"
            >
              Fill frame width
            </button>
          </div>

          <Range label="Starts at (s)" min={0} max={Math.max(0.1, videoDuration)} step={0.1} value={selected.timelineStart}
            onChange={(v) => updateBroll(selected.id, { timelineStart: v })} onCommit={pushHistory} fmt={(v) => v.toFixed(1)} />
          <Range label="Length (s)" min={0.3} max={selected.duration} step={0.1} value={selected.sourceEnd - selected.sourceStart}
            onChange={(v) => updateBroll(selected.id, { sourceEnd: Math.min(selected.duration, selected.sourceStart + v) })} onCommit={pushHistory} fmt={(v) => v.toFixed(1)} />
          <Range label="Size" min={0.15} max={1} step={0.01} value={selected.scale}
            onChange={(v) => updateBroll(selected.id, { scale: v })} onCommit={pushHistory} fmt={(v) => `${Math.round(v * 100)}%`} />
          <Range label="Horizontal" min={0} max={100} step={1} value={selected.x}
            onChange={(v) => updateBroll(selected.id, { x: v })} onCommit={pushHistory} fmt={(v) => `${Math.round(v)}%`} />
          <Range label="Vertical" min={0} max={100} step={1} value={selected.y}
            onChange={(v) => updateBroll(selected.id, { y: v })} onCommit={pushHistory} fmt={(v) => `${Math.round(v)}%`} />
          <Range label="Rotation" min={-180} max={180} step={1} value={selected.rotation ?? 0}
            onChange={(v) => updateBroll(selected.id, { rotation: v })} onCommit={pushHistory} fmt={(v) => `${Math.round(v)}°`} />
          <Range label="Opacity" min={0.1} max={1} step={0.01} value={selected.opacity}
            onChange={(v) => updateBroll(selected.id, { opacity: v })} onCommit={pushHistory} fmt={(v) => `${Math.round(v * 100)}%`} />
          <button
            onClick={() => { removeBroll(selected.id); pushHistory(); }}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove overlay
          </button>
        </div>
      )}
    </div>
  );
}

function Range({ label, min, max, step, value, onChange, onCommit, fmt }: {
  label: string; min: number; max: number; step: number; value: number;
  onChange: (v: number) => void; onCommit: () => void; fmt: (v: number) => string;
}) {
  return (
    <div>
      <label className="flex items-center justify-between text-xs text-text-muted mb-1">
        <span>{label}</span><span className="text-text-secondary">{fmt(value)}</span>
      </label>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        onMouseUp={onCommit}
        className="w-full accent-accent-primary"
      />
    </div>
  );
}
