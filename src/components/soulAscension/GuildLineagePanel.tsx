'use client';

/**
 * GuildLineagePanel — Soul Lineage guild info (web).
 */

import {
  type SoulLineage,
  type LineageMember,
  TIER_DISPLAY,
  getLineageTier,
} from '@/lib/soulAscension/guildLineageEngine';

interface Props {
  lineage: SoulLineage | null;
  members: LineageMember[];
  onCreateLineage: () => void;
  onJoinLineage: () => void;
}

export default function GuildLineagePanel({ lineage, members, onCreateLineage, onJoinLineage }: Props) {
  if (!lineage) {
    return (
      <div className="mb-4 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.04] p-4">
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-400">Soul Lineage</span>
        <h4 className="mt-2 text-sm font-bold text-text-primary">Join a Soul Family</h4>
        <p className="mt-1 text-sm leading-6 text-text-secondary">
          Form or join a Soul Lineage — a cooperative guild that shares karma bonuses and grows across lifetimes.
        </p>
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={onCreateLineage} className="flex-1 rounded border border-emerald-400/40 bg-emerald-400/15 py-2.5 text-xs font-bold text-emerald-400 transition hover:bg-emerald-400/25">
            Create Lineage
          </button>
          <button type="button" onClick={onJoinLineage} className="flex-1 rounded border border-gold-primary/30 bg-gold-primary/10 py-2.5 text-xs font-bold text-gold-primary transition hover:bg-gold-primary/20">
            Join with Code
          </button>
        </div>
      </div>
    );
  }

  const tierInfo = TIER_DISPLAY[lineage.tier];
  const { bonuses } = getLineageTier(lineage.lineageScore);

  return (
    <div className="mb-4 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.04] p-4">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-400">Soul Lineage</span>
        <span className="rounded border px-2 py-0.5 text-[10px] font-bold" style={{ borderColor: tierInfo.color, color: tierInfo.color }}>
          {tierInfo.emoji} {tierInfo.label}
        </span>
      </div>
      <h4 className="text-sm font-bold text-text-primary">{lineage.name}</h4>
      <p className="mt-0.5 text-xs italic text-text-secondary">"{lineage.motto}"</p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded bg-white/[0.03] p-2 text-center">
          <p className="text-sm font-extrabold text-text-primary">{lineage.memberCount}/{lineage.maxMembers}</p>
          <p className="text-[9px] text-text-muted">Members</p>
        </div>
        <div className="rounded bg-white/[0.03] p-2 text-center">
          <p className="text-sm font-extrabold text-text-primary">{lineage.lineageScore}</p>
          <p className="text-[9px] text-text-muted">Score</p>
        </div>
        <div className="rounded bg-white/[0.03] p-2 text-center">
          <p className="text-sm font-extrabold text-text-primary">+{bonuses.xpBoostPercent}%</p>
          <p className="text-[9px] text-text-muted">XP Boost</p>
        </div>
      </div>

      <div className="mt-3 space-y-0">
        {members.slice(0, 5).map((m) => (
          <div key={m.userId} className="flex items-center border-t border-white/5 py-1.5">
            <span className="flex-1 text-xs font-semibold text-text-primary">{m.displayName}</span>
            <span className="mr-2 text-[10px] text-text-muted">{m.role}</span>
            <span className="text-[10px] font-bold text-emerald-400">+{m.contribution}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
