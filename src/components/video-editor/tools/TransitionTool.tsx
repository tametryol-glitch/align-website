'use client';

/**
 * TransitionTool — add transition effects at specific time points.
 */

import { useVideoEditorStore, type Transition } from '@/stores/videoEditorStore';
import { TRANSITION_TYPES } from '@/lib/videoTransitions';
import { Plus, Trash2 } from 'lucide-react';

export function TransitionTool() {
  const transitions = useVideoEditorStore((s) => s.transitions);
  const currentTime = useVideoEditorStore((s) => s.currentTime);
  const addTransition = useVideoEditorStore((s) => s.addTransition);
  const removeTransition = useVideoEditorStore((s) => s.removeTransition);
  const pushHistory = useVideoEditorStore((s) => s.pushHistory);

  const handleAdd = (type: Transition['type']) => {
    const def = TRANSITION_TYPES.find((t) => t.id === type);
    const id = `trans_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    addTransition({
      id,
      atTime: currentTime,
      type,
      durationMs: def?.defaultDurationMs || 600,
    });
    pushHistory();
  };

  const handleRemove = (id: string) => {
    removeTransition(id);
    pushHistory();
  };

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}:${s.toFixed(1).padStart(4, '0')}`;
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-muted">
        Add a transition effect at the current playhead position.
      </p>

      {/* Transition type picker */}
      <div className="grid grid-cols-3 gap-2">
        {TRANSITION_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => handleAdd(t.id as Transition['type'])}
            className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <span className="text-xl">{t.emoji}</span>
            <span className="text-[10px] text-text-muted font-medium">{t.name}</span>
          </button>
        ))}
      </div>

      {/* Active transitions list */}
      {transitions.length > 0 && (
        <div className="space-y-1.5 border-t border-white/10 pt-3">
          <p className="text-xs text-text-muted">
            Active transitions ({transitions.length})
          </p>
          {transitions
            .sort((a, b) => a.atTime - b.atTime)
            .map((t) => {
              const def = TRANSITION_TYPES.find((d) => d.id === t.type);
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{def?.emoji}</span>
                    <div>
                      <p className="text-xs text-text-secondary">{def?.name}</p>
                      <p className="text-[10px] text-text-muted font-mono">
                        at {formatTime(t.atTime)} ({t.durationMs}ms)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(t.id)}
                    className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
