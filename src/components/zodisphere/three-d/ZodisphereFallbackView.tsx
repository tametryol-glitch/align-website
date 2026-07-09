'use client';

/**
 * ZodisphereFallbackView — a calm, branded stand-in shown whenever the 3D globe
 * cannot run (WebGL unavailable, init error, low memory, offline tiles, etc.).
 * It NEVER leaves the user on a blank screen or an endless spinner. Where a
 * retry makes sense the caller passes onRetry; there is always a route back to
 * the classic globe so the feature can't trap the user.
 */

import Link from 'next/link';

export interface ZodisphereFallbackViewProps {
  message?: string;
  onRetry?: () => void;
  /** Where "Use the classic globe" should send the user. */
  classicHref?: string;
}

export default function ZodisphereFallbackView({
  message = 'The 3D globe isn’t available on this device right now.',
  onRetry,
  classicHref = '/zodisphere',
}: ZodisphereFallbackViewProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center rounded-2xl border border-white/10 bg-black/50 backdrop-blur px-6 py-8">
        <div className="text-3xl mb-3" aria-hidden>🌍</div>
        <h2 className="text-white text-base font-semibold mb-2">Globe unavailable</h2>
        <p className="text-white/60 text-[13px] leading-relaxed mb-5">{message}</p>
        <div className="flex flex-col gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full px-4 py-2 rounded-xl text-sm font-medium bg-accent-primary/20 border border-accent-primary text-accent-primary hover:bg-accent-primary/30 transition-colors"
            >
              Try again
            </button>
          )}
          <Link
            href={classicHref}
            className="w-full px-4 py-2 rounded-xl text-sm text-white/80 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            Use the classic globe
          </Link>
        </div>
      </div>
    </div>
  );
}
