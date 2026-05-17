'use client';

import { useState, useRef, type ReactNode } from 'react';
import { X, Share2, Copy, Download, Check } from 'lucide-react';
import { shareCard, copyShareLink, downloadCardAsImage } from '@/lib/shareCardUtils';

// ── Props ──

interface ShareCardModalProps {
  /** The rendered card element (BigThreeCard or CompatibilityCard) */
  children: ReactNode;
  /** Title for the Web Share API */
  shareTitle: string;
  /** Text for the Web Share API */
  shareText: string;
  /** URL to share */
  shareUrl: string;
  /** Whether the modal is open */
  open: boolean;
  /** Close handler */
  onClose: () => void;
}

// ── Modal ──

function ShareCardModal({
  children,
  shareTitle,
  shareText,
  shareUrl,
  open,
  onClose,
}: ShareCardModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  async function handleShare() {
    await shareCard(shareTitle, shareText, shareUrl);
  }

  async function handleCopyLink() {
    const ok = await copyShareLink(shareUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    await downloadCardAsImage(cardRef);
    setDownloading(false);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="relative max-w-[400px] w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Card wrapper (ref for html2canvas capture) */}
          <div ref={cardRef} className="mx-auto w-fit rounded-3xl overflow-hidden shadow-2xl">
            {children}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #9B6FF6, #7C3AED)',
              }}
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#FFFFFF',
              }}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#FFFFFF',
              }}
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Saving...' : 'Download'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Trigger Button ──

export interface ShareButtonTriggerProps {
  /** The rendered card element */
  cardElement: ReactNode;
  shareTitle: string;
  shareText: string;
  shareUrl: string;
  /** Button label (defaults to "Share") */
  label?: string;
  /** Visual variant */
  variant?: 'icon' | 'button' | 'compact';
  className?: string;
}

export default function ShareButtonWithCard({
  cardElement,
  shareTitle,
  shareText,
  shareUrl,
  label = 'Share',
  variant = 'icon',
  className = '',
}: ShareButtonTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === 'icon' ? (
        <button
          onClick={() => setOpen(true)}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${className}`}
          title="Share card"
        >
          <Share2 className="w-4 h-4 text-text-muted hover:text-accent-primary transition-colors" />
        </button>
      ) : variant === 'compact' ? (
        <button
          onClick={() => setOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] ${className}`}
          style={{
            backgroundColor: 'rgba(155,111,246,0.12)',
            color: '#9B6FF6',
            border: '1px solid rgba(155,111,246,0.25)',
          }}
        >
          <Share2 className="w-3.5 h-3.5" />
          {label}
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] ${className}`}
          style={{
            background: 'linear-gradient(135deg, #9B6FF6, #7C3AED)',
          }}
        >
          <Share2 className="w-4 h-4" />
          {label}
        </button>
      )}

      <ShareCardModal
        open={open}
        onClose={() => setOpen(false)}
        shareTitle={shareTitle}
        shareText={shareText}
        shareUrl={shareUrl}
      >
        {cardElement}
      </ShareCardModal>
    </>
  );
}
