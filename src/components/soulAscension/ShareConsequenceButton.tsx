'use client';

/**
 * ShareConsequenceButton — share the consequence of a choice (web).
 */

import type { MissionResolution } from '@/lib/soulAscension/types';

interface Props {
  resolution: MissionResolution;
}

export default function ShareConsequenceButton({ resolution }: Props) {
  const handleShare = async () => {
    const text = [
      `🎭 Soul Ascension — Chapter ${resolution.mission.chapterNumber}`,
      `"${resolution.choice.text}"`,
      '',
      resolution.choice.consequenceText,
      '',
      `Karma: ${resolution.scoresAfter.karma} | Purpose: ${resolution.scoresAfter.purpose} | Shadow: ${resolution.scoresAfter.shadow}`,
      '',
      '#SoulAscension #AlignApp — What would you choose?',
    ].join('\n');

    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="mt-2.5 rounded border border-gold-primary/30 bg-gold-primary/10 px-4 py-1.5 text-xs font-bold text-gold-primary transition hover:bg-gold-primary/20"
    >
      Share This Moment
    </button>
  );
}
