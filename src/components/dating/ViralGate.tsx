'use client';

import { useState } from 'react';
import { Lock, Share2, Users, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Props ───────────────────────────────────────────────────────────

interface ViralGateProps {
  userId: string;
  matchName: string;
  compatibilityScore: number;
  sunSign: string;
  isUnlocked: boolean;
  onShare: () => void;
  onClose: () => void;
}

// ── Component ───────────────────────────────────────────────────────

export default function ViralGate({
  userId,
  matchName,
  compatibilityScore,
  sunSign,
  isUnlocked,
  onShare,
  onClose,
}: ViralGateProps) {
  const [shared, setShared] = useState(false);

  const referralLink = `https://tametryol-glitch.github.io/align-website/r/${userId}`;

  const handleShare = async () => {
    const shareData = {
      title: 'Align - Cosmic Compatibility',
      text: `Check out my ${compatibilityScore}% compatibility with ${matchName} on Align! Join using my link:`,
      url: referralLink,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        setShared(true);
        onShare();
      } else {
        // Clipboard fallback
        await navigator.clipboard.writeText(`${shareData.text} ${referralLink}`);
        setShared(true);
        onShare();
      }
    } catch {
      // User cancelled or error — try clipboard as last resort
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${referralLink}`);
        setShared(true);
        onShare();
      } catch {
        // Silent fail
      }
    }
  };

  // ── Locked Content Row ────────────────────────────────────────────

  const LockedRow = ({ label }: { label: string }) => (
    <div className="flex items-center justify-between py-3 px-4 bg-white/[0.03] rounded-lg">
      <div className="flex-1 space-y-1.5">
        <div className="h-2 bg-white/[0.08] rounded-full w-[80%]" />
        <div className="h-2 bg-white/[0.08] rounded-full w-[55%]" />
      </div>
      <span className="text-xs text-white/40 ml-4 whitespace-nowrap">{label}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md sm:mx-4 rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Gradient Background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #1A0B3E 0%, #2D1569 50%, #4A1E8F 100%)',
          }}
        />

        {/* Content */}
        <div className="relative px-6 pt-6 pb-10">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Header */}
          <div className="text-center mb-6 mt-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-3">
              <Lock className="w-7 h-7 text-white/80" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">
              Unlock Full Compatibility
            </h2>
            <p className="text-sm text-white/60">
              See the complete cosmic connection with {matchName}
            </p>
          </div>

          {/* Visible Preview Card */}
          <div className="bg-white/[0.08] border border-[#9B6FF6]/30 rounded-2xl p-5 mb-5">
            <div className="text-center mb-4">
              <p className="text-5xl font-bold text-[#9B6FF6]">{compatibilityScore}%</p>
              <p className="text-xs text-white/50 mt-1">Overall Match</p>
            </div>
            <div className="h-px bg-white/10 my-3" />
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">{'☀️'}</span>
              <span className="text-sm font-medium text-white">{sunSign} Sun Sign</span>
            </div>
          </div>

          {/* Locked Sections (blurred) */}
          <div className="space-y-2 mb-6" style={{ filter: 'blur(0px)' }}>
            <LockedRow label="Aspect Analysis" />
            <LockedRow label="House Overlays" />
            <LockedRow label="Element Balance" />
            <LockedRow label="Emotional Dynamics" />
          </div>

          {/* CTA */}
          <div className="text-center">
            {shared ? (
              <div className="flex items-center gap-3 bg-[#9B6FF6]/15 rounded-xl p-4">
                <Sparkles className="w-6 h-6 text-[#9B6FF6] flex-shrink-0" />
                <p className="text-sm text-white text-left">
                  Invite sent! Full compatibility unlocking...
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-white/70 mb-4">
                  Invite a friend to unlock full compatibility
                </p>
                <button
                  onClick={handleShare}
                  className="w-full group relative overflow-hidden rounded-full py-3.5 px-6 font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(90deg, #9B6FF6 0%, #7C4DFF 100%)',
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Share & Unlock
                  </span>
                </button>
                <p className="text-xs text-white/40 mt-3">
                  Your friend gets a free compatibility reading too
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
