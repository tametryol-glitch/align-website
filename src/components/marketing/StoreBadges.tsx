import { PLAY_STORE_URL } from '@/lib/shareLinks';

/**
 * App store download badges for marketing pages.
 * Only Google Play for now — add the Apple badge here once the iOS
 * App Store listing URL exists.
 */
export function StoreBadges({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Get Align on Google Play"
        className="inline-flex items-center gap-2.5 bg-black border border-white/25 rounded-lg px-4 py-2 hover:border-white/50 transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
          <path fill="#00D7FE" d="M3.6 1.9c-.4.3-.6.8-.6 1.4v17.4c0 .6.2 1.1.6 1.4l.1.1L13.5 12v-.2L3.7 1.8l-.1.1z" />
          <path fill="#FFD500" d="M16.8 15.3 13.5 12v-.2l3.3-3.3.1.1 3.9 2.2c1.1.6 1.1 1.7 0 2.3l-3.9 2.2h-.1z" />
          <path fill="#FF3A44" d="m16.9 15.2-3.4-3.4L3.6 22.1c.4.4 1 .4 1.7 0l11.6-6.9z" />
          <path fill="#00F076" d="M16.9 8.6 5.3 1.9c-.7-.4-1.3-.4-1.7 0l9.9 9.9 3.4-3.2z" />
        </svg>
        <span className="text-left leading-tight">
          <span className="block text-[10px] uppercase tracking-wide text-white/70">Get it on</span>
          <span className="block text-sm font-semibold text-white">Google Play</span>
        </span>
      </a>
    </div>
  );
}
