'use client';

/**
 * ToolBar — horizontal strip of tool icons between the preview
 * and the timeline. Tapping an icon opens the corresponding tool panel.
 */

import { useVideoEditorStore, type ActiveTool } from '@/stores/videoEditorStore';
import {
  Scissors, Type, Smile, Music, Palette, SlidersHorizontal, Sparkles,
} from 'lucide-react';

const TOOLS: { id: ActiveTool; icon: React.ElementType; label: string }[] = [
  { id: 'trim', icon: Scissors, label: 'Trim' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'sticker', icon: Smile, label: 'Sticker' },
  { id: 'audio', icon: Music, label: 'Audio' },
  { id: 'filter', icon: Palette, label: 'Filter' },
  { id: 'adjust', icon: SlidersHorizontal, label: 'Adjust' },
  { id: 'transition', icon: Sparkles, label: 'Effects' },
];

export function ToolBar() {
  const activeTool = useVideoEditorStore((s) => s.activeTool);
  const setActiveTool = useVideoEditorStore((s) => s.setActiveTool);

  const handleClick = (id: ActiveTool) => {
    setActiveTool(activeTool === id ? 'none' : id);
  };

  return (
    <div className="flex items-center justify-center gap-1 px-3 py-2 border-t border-white/10 bg-black/30 shrink-0 overflow-x-auto">
      {TOOLS.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;

        return (
          <button
            key={tool.id}
            onClick={() => handleClick(tool.id)}
            className={`
              flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[56px]
              ${isActive
                ? 'bg-accent-primary/20 text-accent-primary'
                : 'text-text-muted hover:bg-white/5 hover:text-text-secondary'
              }
            `}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{tool.label}</span>
          </button>
        );
      })}
    </div>
  );
}
