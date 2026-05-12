'use client';

import { useState } from 'react';
import { Share2, Check, Link as LinkIcon } from 'lucide-react';

interface ShareButtonProps {
  url?: string;
  title?: string;
  text?: string;
  className?: string;
  variant?: 'icon' | 'button';
}

export default function ShareButton({ url, title, text, className = '', variant = 'icon' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareUrl = url || window.location.href;
    const shareTitle = title || 'Check this out on Align';
    const shareText = text || '';

    // Try native Web Share API first (mobile browsers)
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        return;
      } catch {
        // User cancelled or API failed — fall through to clipboard
      }
    }

    // Fallback: copy link to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Last resort: prompt
      window.prompt('Copy this link:', shareUrl);
    }
  }

  if (variant === 'button') {
    return (
      <button
        onClick={handleShare}
        className={`btn-secondary flex items-center gap-2 text-sm ${className}`}
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
        {copied ? 'Link Copied!' : 'Share'}
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className={`p-2 rounded-lg hover:bg-bg-tertiary transition-colors ${className}`}
      title={copied ? 'Link copied!' : 'Share'}
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : (
        <Share2 className="w-4 h-4 text-text-muted" />
      )}
    </button>
  );
}
