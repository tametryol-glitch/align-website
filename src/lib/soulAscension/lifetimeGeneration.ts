import { NODE_ASPECT_PLANET_THEMES } from './aspectMeanings';
import { houseMeaning } from './houses';
import { NODE_AXIS_MEANINGS } from './nodeMeanings';
import { createChapterMissions } from './missionGeneration';
import type { NormalizedChart, ReincarnationContext, SoulEnding, SoulProfile } from './types';

function createEndings(): SoulEnding[] {
  return [
    {
      id: 'ending-repeated-karma',
      type: 'Repeated Karma Ending',
      title: 'The Familiar Door',
      description: 'The soul survives by repeating the old pattern. The lifetime closes, but the lesson follows.',
      unlockRule: 'Low purpose score or repeated comfort path choices.',
    },
    {
      id: 'ending-shadow-victory',
      type: 'Shadow Victory Ending',
      title: 'The Crown of Ash',
      description: 'The soul wins power, romance, recognition, or revenge, but the victory creates debt.',
      unlockRule: 'High shadow score and low karma balance.',
    },
    {
      id: 'ending-partial-growth',
      type: 'Partial Growth Ending',
      title: 'The Half-Opened Gate',
      description: 'The soul chooses differently in places, but one vow remains unfinished.',
      unlockRule: 'Mixed paths with moderate purpose score.',
    },
    {
      id: 'ending-purpose',
      type: 'Purpose Fulfilled Ending',
      title: 'The New Road Breathes',
      description: 'The soul chooses the unfamiliar path and exits the lifetime with cleaner karma.',
      unlockRule: 'High purpose score and manageable shadow score.',
    },
    {
      id: 'ending-contract',
      type: 'Soul Contract Healed Ending',
      title: 'The Vow Completed',
      description: 'A recurring soul is released from the unfinished pattern and returns as a blessing.',
      unlockRule: 'Soul contract status healed.',
    },
    {
      id: 'ending-sacrifice',
      type: 'Sacrifice Ending',
      title: 'The Gift Given Back',
      description: 'The soul gives up comfort to protect the purpose field and awakens a rare gift.',
      unlockRule: 'Final risk path with strong relationship or gift mastery.',
    },
    {
      id: 'ending-liberation',
      type: 'Liberation Ending',
      title: 'The Ancient Cycle Breaks',
      description: 'The old survival story loses authority. The next birth begins lighter.',
      unlockRule: 'High karma, purpose, and shadow integration.',
    },
    {
      id: 'ending-mastery',
      type: 'Mastery Ending',
      title: 'The Ascended Lifetime',
      description: 'The soul keeps the old gift, masters its shadow, and fully enters the North Node mission.',
      unlockRule: 'Exceptional purpose, gift mastery, healed scar, and healed contract.',
    },
  ];
}

export function completeLifetimeProfile(
  chart: NormalizedChart,
  avatarCore: Omit<SoulProfile, 'lifetimeTitle' | 'incarnationReveal' | 'lifetimeSetting' | 'mainConflict' | 'mainPurpose' | 'chapterMissions' | 'possibleEndings' | 'difficultyCurve'>,
  context?: ReincarnationContext,
): SoulProfile {
  const south = chart.placements['South Node'];
  const north = chart.placements['North Node'];
  const sun = chart.placements.Sun;
  const moon = chart.placements.Moon;
  const axis = NODE_AXIS_MEANINGS[south.sign];
  const setting = axis.settings[(sun.house + moon.house + (context?.lifetimeIndex ?? 1)) % axis.settings.length];
  const aspect = chart.nodeAspects[0];
  const aspectTheme = aspect ? NODE_ASPECT_PLANET_THEMES[aspect.planet] : null;
  const inherited = context?.unresolvedScar
    ? ` The old scar returns as ${context.unresolvedScar.name.toLowerCase()}, hiding inside the first person who offers safety.`
    : '';
  const contract = avatarCore.soulContracts[0];

  const lifetimeTitle = `The ${axis.northSign} Door`;
  const lifetimeSetting = `${setting}, where ${houseMeaning(north.house).arena} decides who ascends and who repeats.`;
  const incarnationReveal = `You awaken as ${avatarCore.avatarName}, ${avatarCore.soulArchetype.toLowerCase()}, in ${setting}. The old road is familiar, but it is also the cage. The new road frightens you because it asks for the part of you that was never allowed to live.${inherited}`;
  const mainConflict = aspectTheme
    ? `${aspectTheme.storyline}. The enemy remembers what you came here to forget.`
    : `The lifetime is built around ${axis.comfortTrap.toLowerCase()} colliding with ${axis.purposeDemand.toLowerCase()}`;
  const mainPurpose = `Fulfill the ${north.sign} mission: ${axis.purposeDoor}`;
  const chapterMissions = createChapterMissions(chart, contract, avatarCore.soulScar);

  return {
    ...avatarCore,
    lifetimeTitle,
    incarnationReveal,
    lifetimeSetting,
    mainConflict,
    mainPurpose,
    chapterMissions,
    possibleEndings: createEndings(),
    difficultyCurve: [
      'Level 1: Basic Awareness - discover the wound and the old gift.',
      'Level 2: Emotional Choice - choose differently under pressure.',
      'Level 3: Relationship Karma - meet the recurring soul.',
      'Level 4: Shadow Confrontation - face the destructive pattern.',
      'Level 5: Gift Activation - use the chart gift in service of purpose.',
      'Level 6+: Purpose Sacrifice, Soul Leadership, Karmic Liberation, Cosmic Initiation, Ascended Lifetime.',
    ],
  };
}
