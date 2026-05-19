import { NODE_ASPECT_PLANET_THEMES } from './aspectMeanings';
import { houseMeaning } from './houses';
import { NODE_AXIS_MEANINGS } from './nodeMeanings';
import type { ChapterMission, NormalizedChart, ScoreDelta, SoulChoice, SoulContract, SoulScar } from './types';

const BASE_EFFECTS: Record<SoulChoice['path'], ScoreDelta> = {
  comfort: {
    karma: -5,
    purpose: 1,
    shadow: 2,
    relationship: -2,
    giftMastery: 2,
    soulScarIntensity: 4,
    futureLifetimeDifficulty: 1,
    soulXp: 8,
    purposeXp: 1,
  },
  shadow: {
    karma: -12,
    purpose: -5,
    shadow: 15,
    relationship: -8,
    giftMastery: 4,
    soulScarIntensity: 9,
    futureLifetimeDifficulty: 2,
    soulXp: 10,
    shadowIntegration: 1,
  },
  purpose: {
    karma: 8,
    purpose: 14,
    shadow: -3,
    relationship: 6,
    giftMastery: 8,
    soulScarIntensity: -7,
    futureLifetimeDifficulty: -1,
    soulXp: 14,
    purposeXp: 8,
    shadowIntegration: 2,
  },
  neutral: {
    karma: 1,
    purpose: 2,
    shadow: 0,
    relationship: 1,
    giftMastery: 1,
    soulScarIntensity: 0,
    futureLifetimeDifficulty: 0,
    soulXp: 5,
  },
  risk: {
    karma: 3,
    purpose: 9,
    shadow: 4,
    relationship: -1,
    giftMastery: 7,
    soulScarIntensity: -2,
    futureLifetimeDifficulty: 1,
    soulXp: 12,
    purposeXp: 4,
    shadowIntegration: 4,
  },
};

function choice(
  id: string,
  text: string,
  path: SoulChoice['path'],
  emotionalCost: string,
  immediateResult: string,
  consequenceText: string,
  effects?: ScoreDelta,
): SoulChoice {
  return {
    id,
    text,
    path,
    emotionalCost,
    immediateResult,
    consequenceText,
    effects: { ...BASE_EFFECTS[path], ...(effects ?? {}) },
  };
}

export function createChapterMissions(chart: NormalizedChart, contract: SoulContract, scar: SoulScar): ChapterMission[] {
  const south = chart.placements['South Node'];
  const north = chart.placements['North Node'];
  const moon = chart.placements.Moon;
  const mars = chart.placements.Mars;
  const venus = chart.placements.Venus;
  const axis = NODE_AXIS_MEANINGS[south.sign];
  const nodeHouse = houseMeaning(north.house);
  const southHouse = houseMeaning(south.house);
  const moonHouse = houseMeaning(moon.house);
  const aspect = chart.nodeAspects[0];
  const aspectTheme = aspect ? NODE_ASPECT_PLANET_THEMES[aspect.planet] : null;
  const pressure = aspectTheme?.test || `choosing ${axis.purposeVerbs[0]} when the old road offers ${axis.comfortVerbs[0]}`;

  const missions: ChapterMission[] = [
    {
      id: 'chapter-origin-wound',
      chapterNumber: 1,
      title: 'Birth / Origin Wound',
      chapterType: 'origin_wound',
      storyScene: `You are born under a sign the village does not trust. The first years teach your body the old ${south.sign} law: survive by ${axis.comfortVerbs[0]}. In the walls of this home, ${moonHouse.wound} becomes a language no one admits they speak.`,
      emotionalSetup: `A guardian offers protection if you accept the role they chose for you. The offer is safe, but it makes the old wound feel like destiny.`,
      choices: [
        choice(
          'origin-comfort',
          `Accept the role and quietly ${axis.comfortVerbs[0]}.`,
          'comfort',
          'You keep safety, but something young inside you goes quiet.',
          'The village rewards your obedience.',
          `The South Node superpower works. You survive, but the pattern begins to repeat.`,
        ),
        choice(
          'origin-shadow',
          `Use what you know to ${axis.shadowVerbs[0]}.`,
          'shadow',
          'The room fears you, and part of you likes how fast fear obeys.',
          'You gain control before anyone can abandon you.',
          `Power arrives quickly, but the scar deepens around ${scar.name}.`,
        ),
        choice(
          'origin-purpose',
          `Take the harder first step: ${axis.purposeVerbs[0]}.`,
          'purpose',
          'Your body shakes because this is not how you survived before.',
          'No one claps. The air simply becomes clearer.',
          `The North Node path opens a small door in ${nodeHouse.arena}.`,
        ),
        choice(
          'origin-neutral',
          'Watch, listen, and make no vow yet.',
          'neutral',
          'You delay the lesson without betraying it.',
          'The day passes quietly.',
          'The soul gathers information, but the karmic pattern remains waiting.',
        ),
      ],
    },
    {
      id: 'chapter-gift-awakening',
      chapterNumber: 2,
      title: 'First Gift Awakening',
      chapterType: 'gift_awakening',
      storyScene: `The old gift awakens when danger enters through ${southHouse.arena}. Your ${south.sign} mastery knows exactly what to do. It feels like returning to a weapon that remembers your hand.`,
      emotionalSetup: `A stranger needs your help, but helping them will expose the gift you were told to hide.`,
      choices: [
        choice(
          'gift-comfort',
          `Use the gift privately and keep the reward for yourself.`,
          'comfort',
          'No one can betray a power they never see.',
          'You solve the immediate danger.',
          `The gift works, but it stays trapped inside the old identity.`,
        ),
        choice(
          'gift-shadow',
          `Turn the gift into leverage and make the stranger owe you.`,
          'shadow',
          'The old power tastes sharp and useful.',
          'You gain a debt and a reputation.',
          `The gift becomes a chain, and future lifetimes will remember the weight.`,
          { relationship: -5 },
        ),
        choice(
          'gift-purpose',
          `Use the gift in service of ${axis.purposeVerbs[1]}.`,
          'purpose',
          'It feels slower than control and cleaner than fear.',
          'The stranger lives, and the gift changes texture in your hands.',
          `The old superpower is not rejected. It is purified.`,
          { giftMastery: 12 },
        ),
        choice(
          'gift-risk',
          `Reveal the gift before you know who can be trusted.`,
          'risk',
          'The risk is real, and so is the relief.',
          'Rumors begin before sunset.',
          `The soul chooses visibility. It may cost safety, but it breaks secrecy.`,
        ),
      ],
    },
    {
      id: 'chapter-relationship-test',
      chapterNumber: 3,
      title: 'Relationship Test',
      chapterType: 'relationship_test',
      storyScene: `${contract.recurringSoulName} enters the lifetime as ${contract.currentRole}. Their face is new, but the nervous system recognizes the unfinished vow. They touch the exact place where ${contract.emotionalWound.toLowerCase()}`,
      emotionalSetup: `They ask for a choice that love cannot fake. The old pattern offers speed. The purpose path asks for a different kind of honesty.`,
      choices: [
        choice(
          'contract-comfort',
          `Keep the bond by doing what has always worked: ${axis.comfortVerbs[1]}.`,
          'comfort',
          'The bond remains, but the truth narrows.',
          `${contract.recurringSoulName} stays close and less free.`,
          `The contract strains because comfort repeats the old vow.`,
          { relationship: -6 },
        ),
        choice(
          'contract-shadow',
          `Use desire, fear, or silence to ${axis.shadowVerbs[1]}.`,
          'shadow',
          'You win the moment and lose trust beneath it.',
          `${contract.recurringSoulName} gives in, but something sacred closes.`,
          `The contract darkens. This soul may return in a harder role.`,
          { relationship: -15 },
        ),
        choice(
          'contract-purpose',
          contract.purposeChoice,
          'purpose',
          'Your chest hurts because this is love without the old weapon.',
          `${contract.recurringSoulName} sees the real choice, even if they cannot answer yet.`,
          `A strand of the contract heals.`,
          { relationship: 16, giftMastery: 4 },
        ),
        choice(
          'contract-risk',
          'Tell the truth before you know whether the bond can survive it.',
          'risk',
          'There is no performance left to hide behind.',
          'The relationship changes immediately.',
          `Risk exposes the vow. Whether it heals depends on what you do next.`,
          { relationship: 4 },
        ),
      ],
    },
    {
      id: 'chapter-shadow-confrontation',
      chapterNumber: 4,
      title: 'Shadow Confrontation',
      chapterType: 'shadow_confrontation',
      storyScene: `The antagonist arrives carrying the distorted form of your own gift. ${aspectTheme ? aspectTheme.storyline : `The world presses on ${axis.shadowMisuse.toLowerCase()}`} The enemy knows the part of you that still believes the old road is home.`,
      emotionalSetup: `To win quickly, you can become what hurt you. To ascend, you must keep power without becoming its servant.`,
      choices: [
        choice(
          'shadow-comfort',
          `Defeat them with the old method: ${axis.comfortVerbs[2]}.`,
          'comfort',
          'The body relaxes because it knows this move.',
          'The enemy falls back.',
          `The lifetime survives the scene, but the karmic loop tightens.`,
        ),
        choice(
          'shadow-shadow',
          `Embrace the destructive gift and ${axis.shadowVerbs[2]}.`,
          'shadow',
          'The victory is intoxicating.',
          'No one doubts your power now.',
          `This is a Shadow Victory seed. Future lifetimes will answer it.`,
          { shadow: 18, karma: -16 },
        ),
        choice(
          'shadow-purpose',
          `Face the trial by ${axis.purposeVerbs[2]}.`,
          'purpose',
          'The choice feels like losing until the room changes.',
          'The enemy no longer controls the shape of the story.',
          `Purpose begins to master the shadow instead of denying it.`,
          { shadowIntegration: 7, purpose: 16 },
        ),
        choice(
          'shadow-neutral',
          'Withdraw from the fight and protect the innocent first.',
          'neutral',
          'You do not win, but you do not become the wound either.',
          'The conflict pauses.',
          'A neutral choice preserves life but leaves the shadow waiting.',
        ),
      ],
    },
    {
      id: 'chapter-purpose-choice',
      chapterNumber: 5,
      title: 'Final Karmic Decision',
      chapterType: 'purpose_choice',
      storyScene: `At the end of the lifetime, the old road and the new road stand in the same room. The South Node offers its familiar crown. The North Node asks for ${axis.purposeDemand.toLowerCase()} This is the moment the soul came back to try again.`,
      emotionalSetup: `The final choice is not about being good. It is about which self gets to reincarnate.`,
      choices: [
        choice(
          'final-comfort',
          `Return to the old road and ${axis.comfortVerbs[0]}.`,
          'comfort',
          'The old self survives intact.',
          'The ending feels familiar, almost beautiful, and unfinished.',
          `Repeated Karma Ending becomes likely. The soul knows this hallway too well.`,
          { karma: -8, futureLifetimeDifficulty: 2 },
        ),
        choice(
          'final-shadow',
          `Take power through ${axis.shadowVerbs[0]}.`,
          'shadow',
          'The world bends, and the soul hardens.',
          'You win something the spirit cannot carry cleanly.',
          `Shadow Victory Ending becomes likely. The next birth will be built around consequence.`,
          { shadow: 22, karma: -20, futureLifetimeDifficulty: 3 },
        ),
        choice(
          'final-purpose',
          `Walk the new road: ${axis.purposeVerbs[1]}.`,
          'purpose',
          'The fear does not vanish. You move with it anyway.',
          'The lifetime releases a sound like a held breath leaving the body.',
          `Purpose Fulfilled Ending becomes possible. The soul reincarnates higher.`,
          { purpose: 22, karma: 15, giftMastery: 12, relationship: 8, soulScarIntensity: -12 },
        ),
        choice(
          'final-risk',
          `Choose the sacrifice that protects ${nodeHouse.arena}.`,
          'risk',
          'No one can tell whether this is loss or liberation yet.',
          'The story breaks open.',
          `Sacrifice or Liberation Ending becomes possible depending on what your prior choices built.`,
          { purpose: 14, karma: 7, shadowIntegration: 8, relationship: 4 },
        ),
      ],
    },
  ];

  return missions.map((mission) => {
    if (aspectTheme && (aspect?.planet === 'Mars' || mars.sign === south.sign) && mission.chapterNumber === 4) {
      return {
        ...mission,
        emotionalSetup: `${mission.emotionalSetup} Mars adds heat: anger, danger, courage, and the temptation to call force destiny.`,
      };
    }
    if (aspectTheme && (aspect?.planet === 'Venus' || venus.sign === south.sign) && mission.chapterNumber === 3) {
      return {
        ...mission,
        emotionalSetup: `${mission.emotionalSetup} Venus makes the test sweeter and more dangerous: love, value, beauty, money, or betrayal is the hook.`,
      };
    }
    if (mission.chapterNumber === 5 && aspectTheme) {
      return {
        ...mission,
        emotionalSetup: `${mission.emotionalSetup} The final pressure is ${pressure}.`,
      };
    }
    return mission;
  });
}
