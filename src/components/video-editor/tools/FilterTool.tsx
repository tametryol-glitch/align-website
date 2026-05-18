'use client';

/**
 * FilterTool — grid of filter presets with intensity slider.
 */

import { useVideoEditorStore } from '@/stores/videoEditorStore';
import { FILTER_PRESETS } from '@/lib/videoFilters';

export function FilterTool() {
  const activeFilter = useVideoEditorStore((s) => s.activeFilter);
  const filterIntensity = useVideoEditorStore((s) => s.filterIntensity);
  const setActiveFilter = useVideoEditorStore((s) => s.setActiveFilter);
  const setFilterIntensity = useVideoEditorStore((s) => s.setFilterIntensity);
  const pushHistory = useVideoEditorStore((s) => s.pushHistory);

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-muted">
        Tap a filter to preview it on the video. Applied during export.
      </p>

      <div className="grid grid-cols-4 gap-2">
        {FILTER_PRESETS.map((preset) => {
          const isActive = activeFilter === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => {
                setActiveFilter(preset.id);
                pushHistory();
              }}
              className={`
                flex flex-col items-center gap-1 p-2 rounded-xl transition-colors
                ${isActive
                  ? 'bg-accent-primary/20 ring-1 ring-accent-primary'
                  : 'bg-white/5 hover:bg-white/10'}
              `}
            >
              {/* Filter preview swatch */}
              <div
                className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500"
                style={{
                  filter: preset.css !== 'none' ? preset.css : undefined,
                }}
              />
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
