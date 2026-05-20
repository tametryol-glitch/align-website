'use client';

/**
 * TypewriterText — character-by-character text reveal for the web VN.
 * Click to skip to the end. Fires `onComplete` when fully visible.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
  textKey?: string;
}

export default function TypewriterText({
  text,
  speed = 38,
  onComplete,
  className = '',
  textKey,
}: Props) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completeFiredRef = useRef(false);

  // Reset on text/key change
  useEffect(() => {
    setVisibleCount(0);
    setFinished(false);
    completeFiredRef.current = false;
  }, [text, textKey]);

  // Typewriter tick
  useEffect(() => {
    if (finished || !text) return;
    const interval = Math.max(12, Math.round(1000 / speed));
    timerRef.current = setInterval(() => {
      setVisibleCount((prev) => {
        const next = prev + 1;
        if (next >= text.length) {
          if (timerRef.current) clearInterval(timerRef.current);
          return text.length;
        }
        return next;
      });
    }, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text, speed, finished]);

  // Fire onComplete once
  useEffect(() => {
    if (visibleCount >= text.length && text.length > 0 && !completeFiredRef.current) {
      completeFiredRef.current = true;
      setFinished(true);
      onComplete?.();
    }
  }, [visibleCount, text, onComplete]);

  const skipToEnd = useCallback(() => {
    if (finished) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setVisibleCount(text.length);
  }, [finished, text]);

  const displayed = text.slice(0, visibleCount);
  const hidden = text.slice(visibleCount);

  return (
    <div
      className={`relative cursor-pointer select-none animate-in fade-in duration-500 ${className}`}
      onClick={skipToEnd}
    >
      <p className="text-base leading-7 text-text-primary sm:text-lg sm:leading-8">
        {displayed}
        <span className="invisible">{hidden}</span>
      </p>
      {!finished && (
        <span className="absolute bottom-0 right-0 inline-block h-5 w-0.5 animate-pulse rounded-sm bg-gold-primary" />
      )}
    </div>
  );
}
