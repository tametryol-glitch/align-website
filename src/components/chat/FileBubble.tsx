'use client';

import { File, FileText, FileSpreadsheet, FileArchive, Download } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────

interface FileBubbleProps {
  metadata: {
    url: string;
    filename: string;
    size?: number;
    mime_type?: string;
  } | null | undefined;
  isMine: boolean;
}

// ── Helpers ─────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function getFileIcon(filename: string, mimeType?: string) {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';

  // Document types
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'pages'].includes(ext)) {
    return FileText;
  }
  // Spreadsheet types
  if (['xls', 'xlsx', 'csv', 'numbers', 'ods'].includes(ext)) {
    return FileSpreadsheet;
  }
  // Archive types
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) {
    return FileArchive;
  }
  // Fallback to mime type check
  if (mimeType) {
    if (mimeType.includes('text') || mimeType.includes('pdf') || mimeType.includes('document')) {
      return FileText;
    }
    if (mimeType.includes('spreadsheet') || mimeType.includes('csv')) {
      return FileSpreadsheet;
    }
    if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed')) {
      return FileArchive;
    }
  }

  return File;
}

function truncateFilename(name: string, maxLen: number = 28): string {
  if (name.length <= maxLen) return name;
  const ext = name.includes('.') ? '.' + name.split('.').pop() : '';
  const base = name.slice(0, name.length - ext.length);
  const truncBase = base.slice(0, maxLen - ext.length - 3);
  return `${truncBase}...${ext}`;
}

// ── Component ──────────────────────────────────────────────────────

export function FileBubble({ metadata, isMine }: FileBubbleProps) {
  if (!metadata?.url || !metadata?.filename) return null;

  const { url, filename, size, mime_type } = metadata;
  const IconComponent = getFileIcon(filename, mime_type);
  const textColor = isMine ? 'text-white' : 'text-text-primary';
  const mutedColor = isMine ? 'text-white/60' : 'text-text-muted';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white/10 rounded-lg p-2.5 hover:bg-white/15 transition-colors cursor-pointer min-w-[200px]"
    >
      <div className="flex items-center gap-3">
        {/* File icon */}
        <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
          isMine ? 'bg-white/15' : 'bg-accent-primary/15'
        }`}>
          <IconComponent className={`w-5 h-5 ${isMine ? 'text-white' : 'text-accent-primary'}`} />
        </div>

        {/* File name + size */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${textColor}`}>
            {truncateFilename(filename)}
          </p>
          {size != null && size > 0 && (
            <p className={`text-[10px] ${mutedColor}`}>
              {formatFileSize(size)}
            </p>
          )}
        </div>

        {/* Download icon */}
        <div className="flex-shrink-0">
          <Download className={`w-4 h-4 ${mutedColor}`} />
        </div>
      </div>
    </a>
  );
}
