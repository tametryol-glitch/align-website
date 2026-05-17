'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
    // Sentry.captureException(error) — uncomment after: npm i @sentry/nextjs
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">🌌</div>
        <h1 className="text-2xl font-display font-bold text-text-primary mb-2">
          Cosmic Glitch
        </h1>
        <p className="text-text-tertiary text-sm mb-6">
          Something went wrong. The stars are realigning — try again.
        </p>
        <button onClick={reset} className="btn-primary">
          Try Again
        </button>
      </div>
    </div>
  );
}
