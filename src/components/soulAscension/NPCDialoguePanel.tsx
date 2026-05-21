'use client';

/**
 * NPCDialoguePanel — NPC dialogue with relationship + affinity (web).
 */

import type { NPCSoul } from '@/lib/soulAscension/npcSoulEngine';
import { getNPCDialogue } from '@/lib/soulAscension/npcSoulEngine';

const RELATIONSHIP_COLORS: Record<string, string> = {
  ally: '#5EE6A8',
  mentor: '#4ECBD6',
  neutral: '#A8B0C0',
  rival: '#F5A623',
  betrayer: '#E05D5D',
};

const RELATIONSHIP_ICONS: Record<string, string> = {
  ally: '🤝',
  mentor: '🌟',
  neutral: '⚖️',
  rival: '⚡',
  betrayer: '🗡️',
};

interface Props {
  npc: NPCSoul;
}

export default function NPCDialoguePanel({ npc }: Props) {
  const dialogue = getNPCDialogue(npc);
  const relColor = RELATIONSHIP_COLORS[npc.relationship] || RELATIONSHIP_COLORS.neutral;
  const affinityPercent = ((npc.affinity + 100) / 200) * 100;

  return (
    <div className="mb-2 rounded-lg border border-white/10 bg-black/40 p-4">
      {/* Header */}
      <div className="mb-2.5 flex items-center gap-2.5">
        <span className="text-2xl">{RELATIONSHIP_ICONS[npc.relationship] || '⚖️'}</span>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-text-primary">{npc.name}</h4>
          <span className="text-xs font-semibold" style={{ color: relColor }}>{npc.archetype}</span>
        </div>
        <span
          className="rounded border px-2 py-0.5 text-[10px] font-bold"
          style={{ borderColor: relColor, color: relColor }}
        >
          {npc.relationship.charAt(0).toUpperCase() + npc.relationship.slice(1)}
        </span>
      </div>

      {/* Affinity bar */}
      <div className="mb-2.5 flex items-center gap-2">
        <span className="w-10 text-[9px] font-bold text-white/35">Affinity</span>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${affinityPercent}%`,
              backgroundColor: npc.affinity >= 0 ? '#5EE6A8' : '#E05D5D',
            }}
          />
        </div>
        <span
          className="w-8 text-right text-[10px] font-extrabold"
          style={{ color: npc.affinity >= 0 ? '#5EE6A8' : '#E05D5D' }}
        >
          {npc.affinity > 0 ? '+' : ''}{npc.affinity}
        </span>
      </div>

      {/* Dialogue */}
      <div className="rounded border-l-2 border-gold-primary/25 bg-gold-primary/[0.04] p-3">
        <p className="text-sm italic leading-6 text-amber-200/80">"{dialogue}"</p>
      </div>
    </div>
  );
}
