'use client';

/**
 * VideoExportButton — export game moments as cards / stories / reels (web).
 *
 * Uses html2canvas to capture a DOM element as an image for the "card"
 * format. Falls back to text-only sharing for story/reel formats.
 */

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import {
  EXPORT_TEMPLATES,
  generateShareCaption,
  type ExportFormat,
  type ShareableMoment,
} from '@/lib/soulAscension/videoExportEngine';

interface Props {
  moment: ShareableMoment;
  /** Optional ref to a DOM element to capture as an image */
  captureRef?: React.RefObject<HTMLElement | null>;
}

export default function VideoExportButton({ moment, captureRef }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setExporting(true);
    const caption = generateShareCaption(moment);
    const template = EXPORT_TEMPLATES[format];

    try {
      // For card format with a capture ref, use html2canvas to generate image
      if (captureRef?.current && format === 'card') {
        const canvas = await html2canvas(captureRef.current, {
          backgroundColor: '#090A12',
          scale: 2, // High-res capture
          useCORS: true,
          width: template.width / 2, // Scale down for screen, canvas scale handles DPI
        });

        // Convert to blob
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), 'image/png', 0.95),
        );

        if (blob) {
          // Try Web Share API with file (if supported)
          if (navigator.share && navigator.canShare?.({
            files: [new File([blob], 'soul-ascension-card.png', { type: 'image/png' })],
          })) {
            const file = new File([blob], 'soul-ascension-card.png', { type: 'image/png' });
            await navigator.share({
              title: `${moment.title} — Soul Ascension`,
              text: caption,
              files: [file],
            });
          } else {
            // Fallback: download the image + copy caption
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'soul-ascension-card.png';
            a.click();
            URL.revokeObjectURL(url);

            await navigator.clipboard.writeText(caption).catch(() => {});
          }
        } else {
          // Canvas conversion failed, share text
          await shareTextFallback(caption, moment.title);
        }
      } else {
        // Non-card format or no capture ref — share text
        await shareTextFallback(caption, moment.title);
      }
    } catch {
      // Ultimate fallback
      await shareTextFallback(caption, moment.title);
    } finally {
      setExporting(false);
      setExpanded(false);
    }
  };

  async function shareTextFallback(caption: string, title: string) {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${title} — Soul Ascension`, text: caption });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(caption);
      } catch {}
    }
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        disabled={exporting}
        className="mt-2 w-full rounded border border-gold-primary/25 bg-gold-primary/10 py-2.5 text-xs font-bold text-gold-primary transition hover:bg-gold-primary/20 disabled:opacity-50"
      >
        {exporting ? '⏳ Exporting...' : '📱 Export for Social'}
      </button>
    );
  }

  return (
    <div className="mt-2 rounded-lg border border-gold-primary/25 bg-black/60 p-4">
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gold-primary">Export Format</span>
      <div className="mt-2 space-y-1.5">
        {(['card', 'story', 'reel'] as ExportFormat[]).map((format) => {
          const tpl = EXPORT_TEMPLATES[format];
          return (
            <button
              key={format}
              type="button"
              onClick={() => handleExport(format)}
              className="flex w-full items-center justify-between rounded border border-white/8 bg-white/[0.03] p-3 transition hover:bg-white/[0.06]"
            >
              <span className="text-sm font-semibold text-text-primary">{tpl.name}</span>
              <span className="text-xs text-text-muted">{tpl.aspectRatio}{tpl.durationSec > 0 ? ` · ${tpl.durationSec}s` : ''}</span>
            </button>
          );
        })}
      </div>
      <button type="button" onClick={() => setExpanded(false)} className="mt-2 w-full py-2 text-xs text-text-muted">
        Cancel
      </button>
    </div>
  );
}
