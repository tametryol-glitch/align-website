'use client';

import { ExternalLink } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────

interface LinkPreviewProps {
  url: string;
  preview: {
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
    favicon?: string;
  } | null;
  isMine: boolean;
}

// ── Component ──────────────────────────────────────────────────────

export function LinkPreview({ url, preview, isMine }: LinkPreviewProps) {
  if (!preview) return null;

  const { title, description, image, siteName, favicon } = preview;

  // Don't render if there's nothing meaningful to show
  if (!title && !description && !image) return null;

  const cardBg = isMine ? 'bg-white/5' : 'bg-black/5';
  const borderColor = isMine ? 'border-white/10' : 'border-border-primary';
  const textColor = isMine ? 'text-white' : 'text-text-primary';
  const mutedColor = isMine ? 'text-white/50' : 'text-text-muted';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block max-w-[280px] rounded-lg overflow-hidden border ${borderColor} ${cardBg} mt-1.5 hover:opacity-90 transition-opacity`}
    >
      {/* Preview image */}
      {image && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={title ?? 'Link preview'}
            className="w-full max-h-32 object-cover"
            loading="lazy"
          />
        </>
      )}

      {/* Content area */}
      <div className="px-2.5 py-2 relative">
        {/* External link icon */}
        <ExternalLink className={`absolute top-2 right-2 w-3 h-3 ${mutedColor}`} />

        {/* Title */}
        {title && (
          <p className={`text-xs font-semibold ${textColor} truncate pr-5`}>
            {title}
          </p>
        )}

        {/* Description (2-line clamp) */}
        {description && (
          <p className={`text-[10px] ${mutedColor} mt-0.5 line-clamp-2`}>
            {description}
          </p>
        )}

        {/* Site info */}
        {(siteName || favicon) && (
          <div className="flex items-center gap-1.5 mt-1.5">
            {favicon && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={favicon}
                  alt=""
                  className="w-3 h-3 rounded-sm"
                  loading="lazy"
                />
              </>
            )}
            {siteName && (
              <span className={`text-[10px] ${mutedColor}`}>{siteName}</span>
            )}
          </div>
        )}
      </div>
    </a>
  );
}
