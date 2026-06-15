'use client';

/**
 * ToolPanel — bottom sheet that renders the currently active tool.
 * Animates in from the bottom when a tool is selected.
 */

import { useVideoEditorStore } from '@/stores/videoEditorStore';
import { TemplateTool } from './TemplateTool';
import { TrimTool } from './TrimTool';
import { TextTool } from './TextTool';
import { StickerTool } from './StickerTool';
import { AudioTool } from './AudioTool';
import { FilterTool } from './FilterTool';
import { AdjustTool } from './AdjustTool';
import { TransitionTool } from './TransitionTool';
import { BrollTool } from './BrollTool';
import { ExportTool } from './ExportTool';
import { X } from 'lucide-react';

export function ToolPanel() {
  const activeTool = useVideoEditorStore((s) => s.activeTool);
  const setActiveTool = useVideoEditorStore((s) => s.setActiveTool);

  if (activeTool === 'none') return null;

  const TOOL_TITLES: Record<string, string> = {
    template: 'Templates',
    trim: 'Trim',
    text: 'Text Overlay',
    sticker: 'Stickers',
    audio: 'Audio',
    filter: 'Filters',
    adjust: 'Adjust',
    transition: 'Transitions',
    broll: 'B-roll / overlay',
    export: 'Export Video',
  };

  return (
    <div className="border-t border-white/10 bg-black/60 backdrop-blur-md shrink-0 max-h-[45vh] overflow-y-auto animate-slideUp">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 sticky top-0 bg-black/60 backdrop-blur-md z-10">
        <span className="text-sm font-medium text-text-primary">
          {TOOL_TITLES[activeTool] || 'Tool'}
        </span>
        <button
          onClick={() => setActiveTool('none')}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors text-text-muted"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tool content */}
      <div className="p-4">
        {activeTool === 'template' && <TemplateTool />}
        {activeTool === 'trim' && <TrimTool />}
        {activeTool === 'text' && <TextTool />}
        {activeTool === 'sticker' && <StickerTool />}
        {activeTool === 'audio' && <AudioTool />}
        {activeTool === 'filter' && <FilterTool />}
        {activeTool === 'adjust' && <AdjustTool />}
        {activeTool === 'transition' && <TransitionTool />}
        {activeTool === 'broll' && <BrollTool />}
        {activeTool === 'export' && <ExportTool />}
      </div>
    </div>
  );
}
