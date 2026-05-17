'use client';

import { useEffect } from 'react';
import { useGamificationStore } from '@/stores/gamificationStore';

export function BadgeEarnedPopup() {
  const { newBadge, dismissBadgePopup } = useGamificationStore();

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!newBadge) return;
    const timer = setTimeout(dismissBadgePopup, 5000);
    return () => clearTimeout(timer);
  }, [newBadge, dismissBadgePopup]);

  if (!newBadge) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300"
        onClick={dismissBadgePopup}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto bg-bg-card border border-border rounded-2xl p-8 max-w-xs w-full text-center shadow-2xl shadow-purple-500/20 animate-badge-pop"
        >
          {/* Badge icon */}
          <div className="text-6xl mb-4 animate-bounce">
            {newBadge.icon}
          </div>

          {/* Title */}
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
            Badge Earned!
          </p>

          {/* Badge name */}
          <h3 className="text-xl font-display font-bold text-text-primary mb-1">
            {newBadge.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-text-secondary mb-6">
            {newBadge.description}
          </p>

          {/* Dismiss button */}
          <button
            onClick={dismissBadgePopup}
            className="btn-primary w-full py-2.5 text-sm font-semibold"
          >
            Awesome!
          </button>
        </div>
      </div>

      {/* Inline keyframes for the pop-in animation */}
      <style jsx>{`
        @keyframes badge-pop {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          60% {
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-badge-pop {
          animation: badge-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </>
  );
}
