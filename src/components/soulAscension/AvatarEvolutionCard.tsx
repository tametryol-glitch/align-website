'use client';

/**
 * AvatarEvolutionCard — avatar evolution status (web).
 */

import { useMemo } from 'react';
import {
  calculateEvolution,
  TIER_DISPLAY,
  type AvatarEvolutionState,
} from '@/lib/soulAscension/avatarEvolutionEngine';
import type { ChoicePath, ScoreState } from '@/lib/soulAscension/types';

const RARITY_COLORS: Record<string, string> = {
  common: '#A8B0C0',
  rare: '#4ECBD6',
  epic: '#9B59B6',
  legendary: '#F0C15C',
};

interface Props {
  ascensionLevel: number;
  lifetimeIndex: number;
  scores: ScoreState;
  dominantPath: ChoicePath;
  bossVictories: number;
  scarHealed: boolean;
  avatarUrl: string | null;
}

export default function AvatarEvolutionCard({
  ascensionLevel,
  lifetimeIndex,
  scores,
  dominantPath,
  bossVictories,
  scarHealed,
  avatarUrl,
}: Props) {
  const evolution = useMemo(
    () => calculateEvolution(ascensionLevel, lifetimeIndex, scores, dominantPath, bossVictories, scarHealed),
    [ascensionLevel, lifetimeIndex, scores, dominantPath, bossVictories, scarHealed],
  );

  const tierInfo = TIER_DISPLAY[evolution.tier];

  return (
    <div className="mb-4 rounded-lg border border-gold-primary/20 bg-black/40 p-5 text-center">
      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-gold-primary">Avatar Evolution</span>

      {/* Avatar with aura ring */}
      <div className="mx-auto my-4 flex h-36 w-36 items-center justify-center rounded-full border-[3px] p-1" style={{ borderColor: evolution.auraColor, opacity: evolution.auraIntensity / 100 + 0.3 }}>
        {avatarUrl ? (
          <img src={avatarUrl} alt="Soul Avatar" className="h-32 w-32 rounded-full object-cover" />
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white/5">
            <span className="text-5xl">{tierInfo.emoji}</span>
          </div>
        )}
      </div>

      {/* Tier badge */}
      <span className="inline-flex items-center gap-1.5 rounded border px-3 py-1" style={{ borderColor: tierInfo.color }}>
        <span>{tierInfo.emoji}</span>
        <span className="text-sm font-bold" style={{ color: tierInfo.color }}>{tierInfo.label}</span>
      </span>
      <p className="mt-1 text-xs text-text-muted">{tierInfo.description}</p>

      {/* Stats */}
      <div className="mx-auto mt-4 grid max-w-xs grid-cols-4 gap-2">
        <div className="rounded bg-white/[0.03] p-2">
          <p className="text-[9px] font-bold text-text-muted">Aura</p>
          <p className="text-sm font-extrabold" style={{ color: evolution.auraColor }}>{evolution.auraIntensity}%</p>
        </div>
        <div className="rounded bg-white/[0.03] p-2">
          <p className="text-[9px] font-bold text-text-muted">Crown</p>
          <p className="text-sm font-extrabold text-gold-primary">Lv {evolution.crownLevel}</p>
        </div>
        <div className="rounded bg-white/[0.03] p-2">
          <p className="text-[9px] font-bold text-text-muted">Scar</p>
          <p className="text-sm font-extrabold" style={{ color: evolution.scarVisibility === 0 ? '#5EE6A8' : '#E05D5D' }}>
            {evolution.scarVisibility === 0 ? 'Healed' : `${evolution.scarVisibility}%`}
          </p>
        </div>
        <div className="rounded bg-white/[0.03] p-2">
          <p className="text-[9px] font-bold text-text-muted">Wisdom</p>
          <p className="text-sm font-extrabold text-cyan-400">{evolution.wisdomMarks}</p>
        </div>
      </div>

      {/* Evolution score */}
      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
        <span className="text-xs font-bold text-text-secondary">Evolution Score</span>
        <span className="text-lg font-extrabold text-gold-primary">{evolution.evolutionScore}</span>
      </div>

      {/* Accessories */}
      {evolution.accessories.length > 0 && (
        <div className="mt-3 text-left">
          <p className="text-xs font-bold text-text-secondary">Earned Accessories</p>
          {evolution.accessories.map((acc) => (
            <div key={acc.id} className="mt-1 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: RARITY_COLORS[acc.rarity] }} />
              <span className="flex-1 text-xs text-text-primary">{acc.name}</span>
              <span className="text-[9px] font-bold uppercase" style={{ color: RARITY_COLORS[acc.rarity] }}>{acc.rarity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
