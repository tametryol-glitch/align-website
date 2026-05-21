'use client';

/**
 * BossEncounterCard — dramatic boss intro card (web).
 */

import type { BossEncounter } from '@/lib/soulAscension/bossEncounterEngine';

interface Props {
  boss: BossEncounter;
  onEngage: () => void;
}

export default function BossEncounterCard({ boss, onEngage }: Props) {
  return (
    <div className="mb-4 overflow-hidden rounded-xl border-2 border-red-400/50 bg-red-400/[0.05]">
      {/* Red warning header */}
      <div className="bg-red-400/20 py-2 text-center">
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-red-400">
          ⚔️ BOSS ENCOUNTER ⚔️
        </span>
      </div>

      <div className="p-5">
        <h3 className="text-center text-lg font-extrabold text-text-primary">{boss.title}</h3>
        <p className="mt-1 text-center text-sm font-bold text-red-400">{boss.name}</p>
        <p className="mx-auto mt-2 max-w-sm text-center text-sm leading-6 text-text-secondary">
          {boss.description}
        </p>

        {/* Dialogue */}
        <div className="mt-4 rounded border-l-[3px] border-red-400 bg-black/40 p-4">
          <p className="text-sm italic leading-6 text-amber-200/80">{boss.dialogue}</p>
        </div>

        {/* Stakes */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-white/35">Stakes</span>
            <span className="text-xs font-bold text-gold-primary">{boss.stakeMultiplier}x Score</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-white/35">Victory</span>
            <span className="text-xs font-semibold text-emerald-400">{boss.victoryReward}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-white/35">Defeat</span>
            <span className="text-xs font-semibold text-red-400">{boss.defeatConsequence}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onEngage}
          className="mt-4 w-full rounded-lg border border-red-400/50 bg-red-400/20 py-3 text-sm font-extrabold tracking-wide text-red-400 transition hover:bg-red-400/30"
        >
          Face Your Challenge
        </button>
      </div>
    </div>
  );
}
