'use client';

/**
 * ChoiceCardStack — animated choice cards for the web Visual Novel.
 * Cards slide up with staggered delay. Selected card highlights, others dim.
 */

import { useCallback, useEffect, useState } from 'react';
import type { ChoicePath, SoulChoice } from '@/lib/soulAscension/types';
import { vnAudio } from './vnAudioManager';

interface Props {
  choices: SoulChoice[];
  onChoose: (choiceId: string) => void;
  disabled?: boolean;
}

const PATH_COLORS: Record<ChoicePath, string> = {
  comfort: '#F5A623',
  shadow: '#E05D5D',
  purpose: '#5EE6A8',
  neutral: '#A8B0C0',
  risk: '#4ECBD6',
};

const PATH_LABELS: Record<ChoicePath, string> = {
  comfort: 'COMFORT',
  shadow: 'SHADOW',
  purpose: 'PURPOSE',
  neutral: 'NEUTRAL',
  risk: 'RISK',
};

export default function ChoiceCardStack({ choices, onChoose, disabled }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  // Trigger stagger animation
  useEffect(() => {
    setSelectedId(null);
    setVisible(false);
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, [choices]);

  const handleChoose = useCallback(
    (choiceId: string) => {
      if (selectedId || disabled) return;
      vnAudio.playSfx('choice_select');
      setSelectedId(choiceId);
      setTimeout(() => onChoose(choiceId), 500);
    },
    [selectedId, disabled, onChoose],
  );

  return (
    <div className="space-y-3 px-4 pb-4 sm:px-6">
      {choices.map((choice, index) => {
        const isSelected = selectedId === choice.id;
        const isDimmed = selectedId !== null && !isSelected;
        const color = PATH_COLORS[choice.path];

        return (
          <button
            key={choice.id}
            type="button"
            disabled={!!selectedId || disabled}
            onClick={() => handleChoose(choice.id)}
            className={[
              'group flex w-full overflow-hidden rounded-lg border text-left transition-all duration-300',
              isSelected
                ? 'scale-[1.02] border-opacity-80 shadow-lg'
                : isDimmed
                ? 'translate-y-1 opacity-25'
                : 'hover:-translate-y-0.5 hover:shadow-md',
              visible
                ? 'translate-y-0 opacity-100'
                : 'translate-y-10 opacity-0',
            ].join(' ')}
            style={{
              transitionDelay: visible ? `${index * 100}ms` : '0ms',
              borderColor: isSelected ? color : 'rgba(255,255,255,0.1)',
              backgroundColor: isSelected
                ? `${color}18`
                : 'rgba(10,10,20,0.85)',
            }}
          >
            <span
              className="w-1.5 shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="flex-1 p-4">
              <span
                className="block text-[10px] font-black uppercase tracking-[0.15em]"
                style={{ color }}
              >
                {PATH_LABELS[choice.path]}
              </span>
              <span className="mt-1.5 block text-sm font-semibold leading-6 text-text-primary sm:text-base">
                {choice.text}
              </span>
              <span className="mt-1 block text-xs italic leading-5 text-text-muted">
                {choice.emotionalCost}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
