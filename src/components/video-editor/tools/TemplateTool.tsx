'use client';

/**
 * TemplateTool — one-tap "looks" that apply a coordinated filter + music +
 * captioned title style. Everything stays editable after applying.
 */

import { useState } from 'react';
import { VIDEO_TEMPLATES, applyTemplate, type VideoTemplate } from '@/lib/videoTemplates';
import { Check } from 'lucide-react';

export function TemplateTool() {
  const [applied, setApplied] = useState<string | null>(null);

  const apply = (t: VideoTemplate) => {
    applyTemplate(t);
    setApplied(t.id);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-text-muted">
        One tap sets a coordinated look — filter, music, and a captioned title.
        Tweak anything afterward.
      </p>

      <div className="grid grid-cols-1 gap-2">
        {VIDEO_TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => apply(t)}
            className="text-left rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors p-3 flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-lg shrink-0 border border-white/10" style={{ background: t.accent }} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-text-primary">{t.name}</div>
              <div className="text-[11px] text-text-muted truncate">{t.description}</div>
            </div>
            {applied === t.id && (
              <span className="flex items-center gap-1 text-[10px] text-accent-primary shrink-0">
                <Check className="w-3.5 h-3.5" /> Applied
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
