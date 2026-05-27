'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { CoachmarkStep } from '@/data/coachmarkTours';

interface CoachmarkOverlayProps {
  active: boolean;
  steps: CoachmarkStep[];
  currentStep: CoachmarkStep | null;
  currentStepIndex: number;
  onNext: () => void;
  onSkip: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function CoachmarkOverlay({
  active,
  steps,
  currentStep,
  currentStepIndex,
  onNext,
  onSkip,
}: CoachmarkOverlayProps) {
  const { t } = useTranslation();
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const measureTarget = useCallback(() => {
    if (!currentStep) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(currentStep.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
      // Scroll into view if needed
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!active || !currentStep) return;
    // Small delay to allow DOM to settle
    const timer = setTimeout(measureTarget, 100);
    return () => clearTimeout(timer);
  }, [active, currentStep, measureTarget]);

  useEffect(() => {
    if (!active) return;
    const handleResize = () => measureTarget();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [active, measureTarget]);

  // Keyboard navigation
  useEffect(() => {
    if (!active) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip();
      if (e.key === 'Enter' || e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [active, onNext, onSkip]);

  if (!mounted || !active || !currentStep) return null;

  const padding = 8;
  const spotlightRect = targetRect
    ? {
        top: targetRect.top - padding,
        left: targetRect.left - padding,
        width: targetRect.width + padding * 2,
        height: targetRect.height + padding * 2,
      }
    : null;

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (!spotlightRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const gap = 16;
    const tooltipWidth = 320;
    const pos = currentStep.position;

    if (pos === 'bottom') {
      return {
        position: 'absolute',
        top: spotlightRect.top + spotlightRect.height + gap,
        left: Math.max(16, Math.min(spotlightRect.left + spotlightRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16)),
        width: tooltipWidth,
      };
    }
    if (pos === 'top') {
      return {
        position: 'absolute',
        top: spotlightRect.top - gap - 160,
        left: Math.max(16, Math.min(spotlightRect.left + spotlightRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16)),
        width: tooltipWidth,
      };
    }
    if (pos === 'right') {
      return {
        position: 'absolute',
        top: spotlightRect.top + spotlightRect.height / 2 - 60,
        left: spotlightRect.left + spotlightRect.width + gap,
        width: tooltipWidth,
      };
    }
    // left
    return {
      position: 'absolute',
      top: spotlightRect.top + spotlightRect.height / 2 - 60,
      left: spotlightRect.left - tooltipWidth - gap,
      width: tooltipWidth,
    };
  };

  // Arrow direction (points toward the target)
  const getArrowClass = () => {
    if (!spotlightRect) return '';
    const pos = currentStep.position;
    if (pos === 'bottom') return 'coachmark-arrow-up';
    if (pos === 'top') return 'coachmark-arrow-down';
    if (pos === 'right') return 'coachmark-arrow-left';
    return 'coachmark-arrow-right';
  };

  const overlay = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999]"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Backdrop with spotlight cutout */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      >
        <defs>
          <mask id="coachmark-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlightRect && (
              <rect
                x={spotlightRect.left}
                y={spotlightRect.top}
                width={spotlightRect.width}
                height={spotlightRect.height}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.7)"
          mask="url(#coachmark-mask)"
        />
      </svg>

      {/* Spotlight glow ring */}
      {spotlightRect && (
        <div
          className="absolute rounded-xl pointer-events-none"
          style={{
            top: spotlightRect.top - 2,
            left: spotlightRect.left - 2,
            width: spotlightRect.width + 4,
            height: spotlightRect.height + 4,
            boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.6), 0 0 20px rgba(139, 92, 246, 0.3)',
          }}
        />
      )}

      {/* Click blocker (dismiss on click outside) */}
      <div className="absolute inset-0" onClick={onSkip} />

      {/* Tooltip */}
      <div
        className="animate-fadeIn"
        style={getTooltipStyle()}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`relative rounded-xl p-4 border border-purple-500/40 shadow-2xl ${getArrowClass()}`}
          style={{
            background: 'linear-gradient(135deg, #2D1B69, #1E1145)',
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.2)',
          }}
        >
          {/* Step title */}
          <h4 className="text-sm font-bold text-white mb-1.5">
            {t(currentStep.titleKey)}
          </h4>
          <p className="text-xs text-purple-200/80 leading-relaxed mb-4">
            {t(currentStep.descriptionKey)}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-muted">
              {currentStepIndex + 1} {t('coachmarks.of', 'of')} {steps.length}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={onSkip}
                className="text-xs text-text-muted hover:text-text-primary transition-colors"
              >
                {t('coachmarks.skip', 'Skip tour')}
              </button>
              <button
                onClick={onNext}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                }}
              >
                {currentStepIndex < steps.length - 1
                  ? t('coachmarks.next', 'Next')
                  : t('coachmarks.finish', 'Finish')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inline styles for arrows */}
      <style>{`
        .coachmark-arrow-up::before {
          content: '';
          position: absolute;
          top: -6px;
          left: 50%;
          transform: translateX(-50%);
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-bottom: 6px solid #2D1B69;
        }
        .coachmark-arrow-down::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #1E1145;
        }
        .coachmark-arrow-left::before {
          content: '';
          position: absolute;
          left: -6px;
          top: 24px;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          border-right: 6px solid #2D1B69;
        }
        .coachmark-arrow-right::after {
          content: '';
          position: absolute;
          right: -6px;
          top: 24px;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          border-left: 6px solid #1E1145;
        }
      `}</style>
    </div>
  );

  return createPortal(overlay, document.body);
}
