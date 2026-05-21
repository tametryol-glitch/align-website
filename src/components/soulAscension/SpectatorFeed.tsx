'use client';

/**
 * SpectatorFeed — live feed of spectatable runs (web).
 */

import type { SpectatableRun, SpectatorEvent } from '@/lib/soulAscension/spectatorModeEngine';
import { formatSpectatorEvent, SPECTATOR_REACTIONS } from '@/lib/soulAscension/spectatorModeEngine';

interface Props {
  runs: SpectatableRun[];
  watchingEvents: SpectatorEvent[];
  watchingRun: SpectatableRun | null;
  onWatch: (runId: string) => void;
  onStopWatching: () => void;
  onReact: (emoji: string) => void;
}

export default function SpectatorFeed({ runs, watchingEvents, watchingRun, onWatch, onStopWatching, onReact }: Props) {
  if (watchingRun) {
    return (
      <div className="mb-4 rounded-lg border border-red-400/25 bg-black/50 p-4">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
          <h4 className="flex-1 text-sm font-bold text-text-primary">Watching {watchingRun.displayName}</h4>
          <button type="button" onClick={onStopWatching} className="text-xs font-bold text-red-400">Stop</button>
        </div>
        <p className="mb-3 text-xs text-text-muted">
          {watchingRun.lifetimeTitle} — Chapter {watchingRun.currentChapter}/{watchingRun.totalChapters}
        </p>

        <div className="mb-3 max-h-48 space-y-1 overflow-y-auto">
          {watchingEvents.map((event) => (
            <div key={event.id} className="flex gap-2 border-b border-white/[0.03] py-1">
              <span className="w-12 shrink-0 text-[9px] text-text-muted">
                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-xs text-text-secondary">{formatSpectatorEvent(event, watchingRun.displayName)}</span>
            </div>
          ))}
          {watchingEvents.length === 0 && (
            <p className="py-4 text-center text-xs text-text-muted">Waiting for events...</p>
          )}
        </div>

        <div className="flex justify-center gap-2">
          {SPECTATOR_REACTIONS.map((r) => (
            <button key={r.emoji} type="button" onClick={() => onReact(r.emoji)} className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-lg transition hover:bg-white/10">
              {r.emoji}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-lg border border-white/10 bg-black/30 p-4">
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-text-tertiary">Spectator Mode</span>
      <h4 className="mt-1 text-sm font-bold text-text-primary">Watch Live Runs</h4>
      {runs.length === 0 ? (
        <p className="mt-4 text-center text-xs text-text-muted">No live runs available right now.</p>
      ) : (
        <div className="mt-3 space-y-1.5">
          {runs.map((run) => (
            <button key={run.id} type="button" onClick={() => onWatch(run.id)} className="flex w-full items-center rounded bg-white/[0.03] p-2.5 text-left transition hover:bg-white/[0.06]">
              <div className="flex-1">
                <p className="text-xs font-semibold text-text-primary">{run.displayName}</p>
                <p className="text-[10px] text-text-muted">{run.soulType} — Lvl {run.ascensionLevel}</p>
              </div>
              <span className="mr-1.5 text-[10px] text-text-secondary">{run.spectatorCount} watching</span>
              {run.isLive && <span className="h-1.5 w-1.5 rounded-full bg-red-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
