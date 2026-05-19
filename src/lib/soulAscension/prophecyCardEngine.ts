import { NODE_ASPECT_PLANET_THEMES } from './aspectMeanings';
import { NODE_AXIS_MEANINGS } from './nodeMeanings';
import type { NormalizedChart, ProphecyCard } from './types';

export function createProphecyCards(chart: NormalizedChart): ProphecyCard[] {
  const axis = NODE_AXIS_MEANINGS[chart.placements['South Node'].sign];
  const aspect = chart.nodeAspects[0];
  const aspectTheme = aspect ? NODE_ASPECT_PLANET_THEMES[aspect.planet] : null;
  const message = aspectTheme
    ? `The person you fear is carrying your forgotten ${aspectTheme.reward}.`
    : axis.prophecy;

  return [{
    id: `prophecy-${axis.southSign.toLowerCase()}-${aspect?.planet?.toLowerCase().replace(/\s+/g, '-') || 'node'}`,
    title: `The ${axis.northSign} Door`,
    message,
    trigger: aspect ? `${aspect.planet} ${aspect.type} ${aspect.node}` : `${axis.southSign} South Node`,
    unlocked: false,
  }];
}

export function maybeUnlockProphecy(cards: ProphecyCard[], chapterNumber: number, path: string): ProphecyCard | undefined {
  if (chapterNumber !== 1 && path !== 'risk') return undefined;
  const card = cards.find((item) => !item.unlocked);
  if (!card) return undefined;
  card.unlocked = true;
  return { ...card };
}
