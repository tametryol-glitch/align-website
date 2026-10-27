'use client';

/**
 * Properties panel for the selected timeline clip — the place people expect to
 * tweak volume, speed, text and size without hunting through toolbar sheets.
 * Everything here edits the same clip fields the sheets do; it adds no new model.
 */

import { Film, Music, Type, Smile, Trash2 } from 'lucide-react';
import type { TimelineClip, MediaClip, TextClip, StickerClip } from '@/lib/editor/timelineModel';

const SPEEDS = [0.5, 1, 1.5, 2];

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toFixed(1).padStart(4, '0')}`;
}

function Row({ label, value, children }: { label: string; value?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] text-text-muted mb-1">
        <span>{label}</span>
        {value && <span className="text-text-primary font-medium">{value}</span>}
      </div>
      {children}
    </div>
  );
}

const chip = (active: boolean) =>
  `px-2.5 py-1.5 rounded-md text-[11px] font-medium border transition-colors ${
    active ? 'border-accent-primary bg-accent-primary/15 text-text-primary' : 'border-white/10 bg-white/5 text-text-secondary hover:bg-white/10'
  }`;

export function ClipInspector({ clip, onChange, onSpeed, onDelete, onMore }: {
  clip: TimelineClip;
  onChange: (patch: Partial<TimelineClip>) => void;
  onSpeed: (rate: number) => void;
  onDelete: () => void;
  /** Open the full text editor sheet (animation, position). */
  onMore?: () => void;
}) {
  const media = clip.kind === 'video' || clip.kind === 'audio' ? (clip as MediaClip) : null;
  const text = clip.kind === 'text' ? (clip as TextClip) : null;
  const sticker = clip.kind === 'overlay' ? (clip as StickerClip) : null;

  const Icon = clip.kind === 'audio' ? Music : clip.kind === 'video' ? Film : clip.kind === 'text' ? Type : Smile;
  const title = media
    ? (media.label || (clip.kind === 'audio' ? 'Audio clip' : 'Video clip'))
    : text ? 'Text' : 'Sticker';

  return (
    <div className="rounded-xl border border-white/10 bg-bg-tertiary p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-accent-primary shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">{title}</p>
          <p className="text-[11px] text-text-muted">Starts {fmt(clip.start)} · Length {fmt(clip.duration)}</p>
        </div>
        <button
          onClick={onDelete}
          className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-red-300 bg-red-500/10 hover:bg-red-500/20 transition-colors"
          aria-label="Delete clip"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>

      {media && (
        <>
          <Row label={clip.kind === 'audio' ? 'Volume' : 'Clip sound'} value={(media.volume ?? 1) === 0 ? 'Muted' : `${Math.round((media.volume ?? 1) * 100)}%`}>
            <input
              type="range" min={0} max={2} step={0.05} value={media.volume ?? 1}
              onChange={(e) => onChange({ volume: parseFloat(e.target.value) } as Partial<TimelineClip>)}
              className="w-full accent-accent-primary"
            />
            <div className="flex gap-1.5 mt-1.5">
              {([['Mute', 0], ['50%', 0.5], ['100%', 1], ['150%', 1.5]] as Array<[string, number]>).map(([l, v]) => (
                <button key={l} onClick={() => onChange({ volume: v } as Partial<TimelineClip>)} className={chip((media.volume ?? 1) === v)}>{l}</button>
              ))}
            </div>
          </Row>
          <Row label="Speed" value={`${(media.speed || 1)}×`}>
            <div className="flex gap-1.5">
              {SPEEDS.map((s) => (
                <button key={s} onClick={() => onSpeed(s)} className={chip((media.speed || 1) === s)}>{s}×</button>
              ))}
            </div>
          </Row>
        </>
      )}

      {text && (
        <>
          <Row label="Text">
            <input
              value={text.text} onChange={(e) => onChange({ text: e.target.value } as Partial<TimelineClip>)}
              placeholder="Your text…"
              className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-primary text-sm text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </Row>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-[11px] text-text-muted">
              Color
              <input type="color" value={text.color} onChange={(e) => onChange({ color: e.target.value } as Partial<TimelineClip>)}
                className="w-7 h-7 rounded bg-transparent border border-white/10" />
            </label>
            <label className="flex-1 flex items-center gap-2 text-[11px] text-text-muted">
              Size
              <input type="range" min={24} max={140} step={1} value={text.fontSize}
                onChange={(e) => onChange({ fontSize: parseInt(e.target.value) } as Partial<TimelineClip>)}
                className="flex-1 accent-accent-primary" />
            </label>
          </div>
          {onMore && (
            <button onClick={onMore} className="text-[11px] text-accent-primary hover:underline">More text options (animation, position)</button>
          )}
        </>
      )}

      {sticker && (
        <Row label="Size" value={`${Math.round((sticker.scale ?? 1) * 100)}%`}>
          <input type="range" min={0.3} max={3} step={0.05} value={sticker.scale ?? 1}
            onChange={(e) => onChange({ scale: parseFloat(e.target.value) } as Partial<TimelineClip>)}
            className="w-full accent-accent-primary" />
        </Row>
      )}
    </div>
  );
}

/** Shown when nothing is selected, so the empty space teaches the next step. */
export function InspectorHint() {
  return (
    <div className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center">
      <p className="text-sm text-text-secondary">Click a clip on the timeline to adjust its volume, speed, text and size here.</p>
    </div>
  );
}
