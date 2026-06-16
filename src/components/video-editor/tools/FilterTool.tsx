'use client';

/**
 * FilterTool — grid of filter presets with intensity slider.
 */

import { useVideoEditorStore } from '@/stores/videoEditorStore';
import { FILTER_PRESETS } from '@/lib/videoFilters';
import { useVideoThumbnail } from '../hooks/useVideoThumbnail';

// Warm→cool gradient fallback when the frame can't be grabbed (CORS) — chosen so
// split-tone / warm / cool grades read distinctly even without real footage.
const FALLBACK_GRADIENT = 'linear-gradient(135deg,#ffd9a0 0%,#ff8c69 32%,#7aa0d2 68%,#2b3550 100%)';

export function FilterTool() {
  const activeFilter = useVideoEditorStore((s) => s.activeFilter);
  const filterIntensity = useVideoEditorStore((s) => s.filterIntensity);
  const setActiveFilter = useVideoEditorStore((s) => s.setActiveFilter);
  const setFilterIntensity = useVideoEditorStore((s) => s.setFilterIntensity);
  const pushHistory = useVideoEditorStore((s) => s.pushHistory);
  const sourceVideoUrl = useVideoEditorStore((s) => s.sourceVideoUrl);
  const thumb = useVideoThumbnail(sourceVideoUrl);

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-muted">
        Tap a look to preview it on your video. Baked in during export.
      </p>

      <div className="grid grid-cols-3 gap-2.5">
        {FILTER_PRESETS.map((preset) => {
          const isActive = activeFilter === preset.id;
          const cssFilter = preset.css !== 'none' ? preset.css : undefined;
          return (
            <button
              key={preset.id}
              onClick={() => {
                setActiveFilter(preset.id);
                pushHistory();
              }}
              className={`
                flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors
                ${isActive
                  ? 'bg-accent-primary/20 ring-1 ring-accent-primary'
                  : 'bg-white/5 hover:bg-white/10'}
              `}
            >
              {/* Filtered preview swatch — real frame when available */}
              <div className="w-full aspect-[9/16] max-h-20 rounded-lg overflow-hidden bg-black/40">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumb}
                    alt={preset.name}
                    draggable={false}
                    className="w-full h-full object-cover"
                    style={{ filter: cssFilter }}
                  />
                ) : (
                  <div className="w-full h-full" style={{ background: FALLBACK_GRADIENT, filter: cssFilter }} />
                )}
              </div>
              <span className={`text-[10px] font-medium ${
                isActive ? 'text-accent-primary' : 'text-text-muted'
              }`}>
                {preset.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Intensity slider — only show when a filter is selected */}
      {activeFilter !== 'none' && (
        <div className="space-y-1.5 border-t border-white/10 pt-3">
          <div className="flex items-center justify-between">
            <label className="text-xs text-text-muted">Intensity</label>
            <span className="text-xs text-text-muted font-mono">
              {Math.round(filterIntensity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={filterIntensity}
            onChange={(e) => setFilterIntensity(parseFloat(e.target.value))}
            onMouseUp={() => pushHistory()}
            className="w-full accent-accent-primary"
          />
        </div>
      )}
    </div>
  );
}
