import { NODE_AXIS_MEANINGS } from './nodeMeanings';
import type { NormalizedChart, SoulRelic } from './types';

export function createSoulRelics(chart: NormalizedChart): SoulRelic[] {
  const axis = NODE_AXIS_MEANINGS[chart.placements['South Node'].sign];
  return [{
    id: `relic-${axis.relicName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: axis.relicName,
    memory: axis.relicMemory,
    benefit: `When unlocked, this relic gives +6 gift mastery on Purpose Path choices tied to ${axis.northSign}.`,
    unlocked: false,
  }];
}

export function maybeUnlockRelic(relics: SoulRelic[], chapterNumber: number, path: string): SoulRelic | undefined {
  if (chapterNumber < 2 || path === 'shadow') return undefined;
  const relic = relics.find((item) => !item.unlocked);
  if (!relic) return undefined;
  relic.unlocked = true;
  return { ...relic };
}
