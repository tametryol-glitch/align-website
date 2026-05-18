'use client';

/**
 * AdjustTool — manual video adjustments: brightness, contrast,
 * saturation, warmth. All controls are -100 to +100 sliders
 * (mapped to -1..+1 in the store).
 */

import { useVideoEditorStore } from '@/stores/videoEditorStore';
import { Sun, Contrast, Droplets, Thermometer, RotateCcw } from 'lucide-react';

interface AdjustSliderProps {
  icon: React.ElementType;
  label: string;
  value: number;
  onChange: (v: number) => void;
  onCommit: () => void;
}

function AdjustSlider({ icon: Icon, label, value, onChange, onCommit }: AdjustSliderProps) {
  const displayVal = Math.round(value * 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-text-muted" />
        <span className="text-xs text-text-secondary">{label}</span>
        <span className="ml-auto text-xs text-text-muted font-mono w-10 text-right">
          {displayVal > 0 ? '+' : ''}{displayVal}
        </span>
      </div>
      <input
        type="range"
        min={-1}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        onMouseUp={onCommit}
        onTouchEnd={onCommit}
        className="w-full accent-accent-primary"
      />
    </div>
  );
}

export function AdjustTool() {
  const adjustBrightness = useVideoEditorStore((s) => s.adjustBrightness);
  const adjustContrast = useVideoEditorStore((s) => s.adjustContrast);
  const adjustSaturation = useVideoEditorStore((s) => s.adjustSaturation);
  const adjustWarmth = useVideoEditorStore((s) => s.adjustWarmth);
  const setAdjustBrightness = useVideoEditorStore((s) => s.setAdjustBrightness);
  const setAdjustContrast = useVideoEditorStore((s) => s.setAdjustContrast);
  const setAdjustSaturation = useVideoEditorStore((s) => s.setAdjustSaturation);
  const setAdjustWarmth = useVideoEditorStore((s) => s.setAdjustWarmth);
  const pushHistory = useVideoEditorStore((s) => s.pushHistory);

  const hasChanges =
    Math.abs(adjustBrightness) > 0.01 ||
    Math.abs(adjustContrast) > 0.01 ||
    Math.abs(adjustSaturation) > 0.01 ||
    Math.abs(adjustWarmth) > 0.01;

  const handleReset = () => {
    setAdjustBrightness(0);
    setAdjustContrast(0);
    setAdjustSaturation(0);
    setAdjustWarmth(0);
    pushHistory();
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-muted">
        Fine-tune the look of your video. Changes preview live and apply on export.
      </p>

      <div className="space-y-3">
        <AdjustSlider
          icon={Sun}
          label="Brightness"
          value={adjustBrightness}
          onChange={setAdjustBrightness}
          onCommit={pushHistory}
        />
        <AdjustSlider
          icon={Contrast}
          label="Contrast"
          value={adjustContrast}
          onChange={setAdjustContrast}
          onCommit={pushHistory}
        />
        <AdjustSlider
          icon={Droplets}
          label="Saturation"
          value={adjustSaturation}
          onChange={setAdjustSaturation}
          onCommit={pushHistory}
        />
        <AdjustSlider
          icon={Thermometer}
          label="Warmth"
          value={adjustWarmth}
          onChange={setAdjustWarmth}
          onCommit={pushHistory}
        />
      </div>

      {hasChanges && (
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset all
        </button>
      )}
    </div>
  );
}
