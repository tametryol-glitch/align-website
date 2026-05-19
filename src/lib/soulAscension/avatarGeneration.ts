import { describeNodeAspect } from './aspectMeanings';
import { houseMeaning } from './houses';
import { NODE_AXIS_MEANINGS } from './nodeMeanings';
import { PLANET_GAME_MEANINGS } from './planets';
import { SIGN_TRAITS, signSeed } from './signs';
import type { NormalizedChart, ReincarnationContext, SoulContract, SoulProfile, SoulRelic, ProphecyCard, SoulScar } from './types';

function pick<T>(items: T[], seed: number): T {
  return items[Math.abs(seed) % items.length];
}

function avatarName(chart: NormalizedChart, context?: ReincarnationContext): string {
  const asc = chart.placements.Ascendant.sign;
  const moon = chart.placements.Moon.sign;
  const lifetime = context?.lifetimeIndex ?? 1;
  const first = pick(SIGN_TRAITS[asc].names, signSeed(moon) + lifetime);
  const epithet = pick(['of the Quiet Gate', 'of the Returning Star', 'of the Hidden Vow', 'of the Second Dawn'], signSeed(asc) + lifetime);
  return `${first} ${epithet}`;
}

export function buildAvatarCore(
  chart: NormalizedChart,
  scar: SoulScar,
  contracts: SoulContract[],
  relics: SoulRelic[],
  prophecyCards: ProphecyCard[],
  context?: ReincarnationContext,
): Omit<SoulProfile, 'lifetimeTitle' | 'incarnationReveal' | 'lifetimeSetting' | 'mainConflict' | 'mainPurpose' | 'chapterMissions' | 'possibleEndings' | 'difficultyCurve'> {
  const asc = chart.placements.Ascendant;
  const sun = chart.placements.Sun;
  const moon = chart.placements.Moon;
  const mercury = chart.placements.Mercury;
  const venus = chart.placements.Venus;
  const mars = chart.placements.Mars;
  const vesta = chart.placements.Vesta;
  const south = chart.placements['South Node'];
  const north = chart.placements['North Node'];
  const axis = NODE_AXIS_MEANINGS[south.sign];
  const sunHouse = houseMeaning(sun.house);
  const moonHouse = houseMeaning(moon.house);
  const nodeHouse = houseMeaning(north.house);
  const aspectModifiers = chart.nodeAspects.slice(0, 3).map(describeNodeAspect);
  const inheritedLine = context?.unresolvedScar
    ? ` An older scar follows this incarnation: ${context.unresolvedScar.name}.`
    : '';

  return {
    soulArchetype: pick(axis.archetypes, sun.house + moon.house + (context?.lifetimeIndex ?? 1)),
    avatarName: avatarName(chart, context),
    avatarAppearance: `${SIGN_TRAITS[asc.sign].bodyLanguage}. The world first reads them as someone shaped by ${houseMeaning(asc.house).arena}.${inheritedLine}`,
    emotionalNature: `Inside, the ${moon.sign} Moon carries ${SIGN_TRAITS[moon.sign].woundTone} through the arena of ${moonHouse.arena}.`,
    strengths: [
      axis.oldSuperpower,
      `Sun in ${sun.sign} gives ${SIGN_TRAITS[sun.sign].giftTone}.`,
      `Mercury in ${mercury.sign} makes ${PLANET_GAME_MEANINGS.Mercury.gift} useful in clues, bargains, and dangerous conversations.`,
      `Mars in ${mars.sign} fights through ${SIGN_TRAITS[mars.sign].giftTone}.`,
    ],
    weaknesses: [
      axis.comfortTrap,
      `Moon in ${moon.sign} can retreat into ${SIGN_TRAITS[moon.sign].woundTone}.`,
      `Venus in ${venus.sign} may turn longing into ${PLANET_GAME_MEANINGS.Venus.shadow}.`,
    ],
    hiddenGift: `Vesta in ${vesta.sign} protects a sacred craft: ${SIGN_TRAITS[vesta.sign].giftTone}.`,
    pastLifePattern: axis.oldSuperpower,
    futurePurpose: axis.purposeDoor,
    emotionalWound: `${axis.emotionalWound} In this lifetime it enters through ${moonHouse.wound}.`,
    coreGift: axis.coreGift,
    mainTemptation: axis.mainTemptation,
    mainFear: axis.mainFear,
    relationshipPattern: axis.relationshipPattern,
    careerOrRolePattern: `${axis.careerPattern}. The Sun house pushes the role toward ${sunHouse.role}.`,
    shadowPattern: axis.shadowMisuse,
    missionStyle: `${axis.missionStyle}. The North Node house makes the arena ${nodeHouse.arena}.`,
    soulScar: scar,
    soulContracts: contracts,
    relics,
    prophecyCards,
    nodeAspectStoryModifiers: aspectModifiers.length
      ? aspectModifiers
      : ['No major Node aspects were supplied, so the lifetime leans on the Nodes, luminaries, houses, and safe fallback motifs.'],
  };
}
