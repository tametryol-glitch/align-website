'use client';

// ═══════════════════════════════════════════════════════════════════
// Cosmic Match Share Modal (web) — double opt-in "share to feed" prompt
// Shown when a user clicks a 'cosmic_match_share_invite' notification.
// The public post is only created once BOTH matched users opt in.
// ═══════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { optInCosmicMatchShare } from '@/lib/cosmicMatchService';

interface Props {
  matchId: string;
  partnerName?: string;
  score?: number;
  onClose: () => void;
}

type Phase = 'prompt' | 'submitting' | 'waiting' | 'published' | 'error';

export function CosmicMatchShareModal({ matchId, partnerName, score, onClose }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('prompt');
  const [errorMsg, setErrorMsg] = useState('');
  const partner = partnerName || 'your match';

  async function handleShare() {
    setPhase('submitting');
    const res = await optInCosmicMatchShare(matchId);
    if (!res.success) {
      setErrorMsg(
        res.error === 'not_eligible'
          ? 'This match is no longer eligible to share.'
          : 'Something went wrong. Please try again.',
      );
      setPhase('error');
      return;
    }
    setPhase(res.published ? 'published' : 'waiting');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl bg-bg-secondary border border-accent-primary/40 p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-4xl mb-2">✨</div>

        {(phase === 'prompt' || phase === 'submitting') && (
          <>
            <h3 className="text-lg font-extrabold text-text-primary mb-2">A rare cosmic match!</h3>
            <p className="text-sm text-text-secondary mb-2 leading-relaxed">
              You and {partner}{typeof score === 'number' ? ` scored ${score}%` : ' are a rare match'}. Share it to the feed?
            </p>
            <p className="text-xs text-text-muted mb-4 leading-snug">
              It only posts if {partner} also taps Share. Your challenges and any sensitive
              scores are never shown — only the positives.
            </p>
            <button
              onClick={handleShare}
              disabled={phase === 'submitting'}
              className="w-full py-3 rounded-lg bg-accent-primary text-white font-bold disabled:opacity-60"
            >
              {phase === 'submitting' ? 'Sharing…' : '💫 Share to feed'}
            </button>
            <button onClick={onClose} className="w-full py-3 mt-1 text-text-muted font-semibold text-sm">
              Not now
            </button>
          </>
        )}

        {phase === 'waiting' && (
          <>
            <h3 className="text-lg font-extrabold text-text-primary mb-2">You're in! 🤞</h3>
            <p className="text-sm text-text-secondary mb-4 leading-relaxed">
              We'll post your match once {partner} shares too. You'll both get a notification when it's live.
            </p>
            <button onClick={onClose} className="w-full py-3 rounded-lg bg-accent-primary text-white font-bold">
              Got it
            </button>
          </>
        )}

        {phase === 'published' && (
          <>
            <h3 className="text-lg font-extrabold text-text-primary mb-2">You're both on the feed! 💫</h3>
            <p className="text-sm text-text-secondary mb-4">Your cosmic match is now live for everyone to see.</p>
            <button
              onClick={() => { onClose(); router.push('/feed'); }}
              className="w-full py-3 rounded-lg bg-accent-primary text-white font-bold"
            >
              View feed
            </button>
            <button onClick={onClose} className="w-full py-3 mt-1 text-text-muted font-semibold text-sm">
              Close
            </button>
          </>
        )}

        {phase === 'error' && (
          <>
            <h3 className="text-lg font-extrabold text-text-primary mb-2">Hmm.</h3>
            <p className="text-sm text-text-secondary mb-4">{errorMsg}</p>
            <button onClick={onClose} className="w-full py-3 rounded-lg bg-accent-primary text-white font-bold">
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
