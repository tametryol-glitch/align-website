'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface DatingCallOverlayProps {
  partnerName: string;
  compatibilityScore: number | null;
  partnerSunSign: string | null;
  timerMinutes?: number;
  visible: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function DatingCallOverlay({
  partnerName,
  compatibilityScore,
  partnerSunSign,
  timerMinutes = 15,
  visible,
}: DatingCallOverlayProps) {
  const [secondsLeft, setSecondsLeft] = useState(timerMinutes * 60);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setSecondsLeft(timerMinutes * 60);
    setDismissed(false);
  }, [visible, timerMinutes]);

  useEffect(() => {
    if (!visible || dismissed) return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [visible, dismissed]);

  if (!visible || dismissed) return null;

  const pct = compatibilityScore != null ? Math.round(compatibilityScore) : null;
  const isLow = secondsLeft < 60;

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2"
      style={{ pointerEvents: 'auto' }}
    >
      <div
        className="rounded-2xl px-5 py-3 flex items-center gap-4 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, rgba(20,24,38,0.95), rgba(30,36,58,0.95))',
          border: '1px solid rgba(155,111,246,0.3)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Compatibility badge */}
        {pct != null && (
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} color="#FACC15" />
            <span className="text-sm font-bold" style={{ color: pct >= 70 ? '#4ADE80' : pct >= 50 ? '#FACC15' : '#F87171' }}>
              {pct}%
            </span>
          </div>
        )}

        {/* Partner info */}
        <div className="text-center">
          <p className="text-xs text-text-muted">{partnerName}</p>
          {partnerSunSign && (
            <p className="text-[10px] text-text-muted opacity-60">{partnerSunSign}</p>
          )}
        </div>

        {/* Timer */}
        {timerMinutes > 0 && (
          <div className="flex items-center gap-1.5">
            <span
              className="text-sm font-mono font-semibold"
              style={{ color: isLow ? '#F87171' : '#A8B0C0' }}
            >
              {formatTime(secondsLeft)}
            </span>
          </div>
        )}

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          className="text-text-muted hover:text-white text-xs ml-1"
        >
          ×
        </button>
      </div>
    </div>
  );
}
