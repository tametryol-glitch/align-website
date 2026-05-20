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

export function createChapterMissions(chart: NormalizedChart, contract: SoulContract, scar: SoulScar, lifetimeIndex: number = 1): ChapterMission[] {
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

  // Verb rotation: shift which verbs are used per lifetime so each
  // reincarnation draws from different slots in the expanded pools.
  const cvLen = axis.comfortVerbs.length;
  const svLen = axis.shadowVerbs.length;
  const pvLen = axis.purposeVerbs.length;
  const vo = (lifetimeIndex - 1) % cvLen; // verb offset
  const cv = (i: number) => axis.comfortVerbs[(i + vo) % cvLen];
  const sv = (i: number) => axis.shadowVerbs[(i + vo) % svLen];
  const pv = (i: number) => axis.purposeVerbs[(i + vo) % pvLen];

  const pressure = aspectTheme?.test || `choosing ${pv(0)} when the old road offers ${cv(0)}`;

  // Scene variant: each lifetime picks a different narrative framing
  const sceneVar = (lifetimeIndex - 1) % 3;

  const missions: ChapterMission[] = [
    {
      id: 'chapter-origin-wound',
      chapterNumber: 1,
      title: 'Birth / Origin Wound',
      chapterType: 'origin_wound',
      storyScene: sceneVar === 0
        ? `You are born under a sign the village does not trust. The first years teach your body the old ${south.sign} law: survive by ${cv(0)}. In the walls of this home, ${moonHouse.wound} becomes a language no one admits they speak.`
        : sceneVar === 1
        ? `The first breath burns. You arrive in a world where ${south.sign} children learn early to ${cv(0)} or be forgotten. The walls of ${southHouse.settingDetail} hold ${moonHouse.wound} like a family secret no one speaks aloud.`
        : `Before you can speak, the village marks you. In ${southHouse.settingDetail}, the rule is ancient: ${cv(0)}, and the world will leave you alone. ${moonHouse.wound} runs through every lullaby they sing you.`,
      emotionalSetup: sceneVar === 0
        ? `A guardian offers protection if you accept the role they chose for you. The offer is safe, but it makes the old wound feel like destiny.`
        : sceneVar === 1
        ? `An elder extends a hand, but the price is silence. Accept the old ${south.sign} role, and safety is yours. Refuse, and the wound has no name.`
        : `The first test arrives wrapped in kindness. Someone offers belonging, but only if you become what they already decided you should be.`,
      choices: [
        choice(
          'origin-comfort',
          `Accept the role and quietly ${cv(0)}.`,
          'comfort',
          'You keep safety, but something young inside you goes quiet.',
          'The village rewards your obedience.',
          `The South Node superpower works. You survive, but the pattern begins to repeat.`,
        ),
        choice(
          'origin-shadow',
          `Use what you know to ${sv(0)}.`,
          'shadow',
          'The room fears you, and part of you likes how fast fear obeys.',
          'You gain control before anyone can abandon you.',
          `Power arrives quickly, but the scar deepens around ${scar.name}.`,
        ),
        choice(
          'origin-purpose',
          `Take the harder first step: ${pv(0)}.`,
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
      storyScene: sceneVar === 0
        ? `The old gift awakens when danger enters through ${southHouse.arena}. Your ${south.sign} mastery knows exactly what to do. It feels like returning to a weapon that remembers your hand.`
        : sceneVar === 1
        ? `A crisis erupts in ${southHouse.settingDetail}. Before the mind can think, the body answers. The ${south.sign} gift — ${axis.coreGift} — floods back like a river remembering its oldest channel.`
        : `Something breaks in ${southHouse.settingDetail}, and the old power rises unbidden. ${axis.coreGift} fills your hands like it never left. The question is not whether you can use it, but what it will cost this time.`,
      emotionalSetup: sceneVar === 0
        ? `A stranger needs your help, but helping them will expose the gift you were told to hide.`
        : sceneVar === 1
        ? `A voice calls from the wreckage — someone you do not owe. Using the gift will reveal what you buried. Keeping it hidden means watching them suffer.`
        : `The gift hums in your chest. A life hangs in the balance. But every time you have used this power before, something was taken in return.`,
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
          `Use the gift in service of ${pv(1)}.`,
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
      storyScene: sceneVar === 0
        ? `${contract.recurringSoulName} enters the lifetime as ${contract.currentRole}. Their face is new, but the nervous system recognizes the unfinished vow. They touch the exact place where ${contract.emotionalWound.toLowerCase()}`
        : sceneVar === 1
        ? `A figure arrives wearing the face of ${contract.currentRole}. The name is ${contract.recurringSoulName}, but the soul beneath is older than any name. Your body tightens where it always tightens — the place where ${contract.emotionalWound.toLowerCase()}`
        : `You did not expect ${contract.recurringSoulName}. They step into your life as ${contract.currentRole}, and the room shrinks to the space between you. The unfinished vow presses on the exact nerve where ${contract.emotionalWound.toLowerCase()}`,
      emotionalSetup: sceneVar === 0
        ? `They ask for a choice that love cannot fake. The old pattern offers speed. The purpose path asks for a different kind of honesty.`
        : sceneVar === 1
        ? `The old dance begins before you notice. Their presence calls up a question this soul has dodged for lifetimes: can love exist without the old weapon?`
        : `Every old instinct sharpens. You could handle this the way you always have. But the new road asks you to meet them without armor.`,
      choices: [
        choice(
          'contract-comfort',
          `Keep the bond by doing what has always worked: ${cv(1)}.`,
          'comfort',
          'The bond remains, but the truth narrows.',
          `${contract.recurringSoulName} stays close and less free.`,
          `The contract strains because comfort repeats the old vow.`,
          { relationship: -6 },
        ),
        choice(
          'contract-shadow',
          `Use desire, fear, or silence to ${sv(1)}.`,
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
      storyScene: sceneVar === 0
        ? `The antagonist arrives carrying the distorted form of your own gift. ${aspectTheme ? aspectTheme.storyline : `The world presses on ${axis.shadowMisuse.toLowerCase()}`} The enemy knows the part of you that still believes the old road is home.`
        : sceneVar === 1
        ? `A mirror walks into the room wearing your worst self. ${aspectTheme ? aspectTheme.storyline : `Every temptation toward ${axis.shadowMisuse.toLowerCase()} crystallizes into a single adversary.`} They wield the same power you do — but without restraint.`
        : `The darkness you have been outrunning turns around and faces you. ${aspectTheme ? aspectTheme.storyline : `The pattern of ${axis.shadowMisuse.toLowerCase()} has grown teeth and a voice.`} It says: you and I are the same. The only question is which of you admits it first.`,
      emotionalSetup: sceneVar === 0
        ? `To win quickly, you can become what hurt you. To ascend, you must keep power without becoming its servant.`
        : sceneVar === 1
        ? `The fast victory requires becoming the very thing that wounded you. The slow victory asks you to hold your power and your conscience in the same hand.`
        : `You can feel the old weapon waiting in your blood. One strike and the battle ends. But the cost is becoming the next lifetime's villain.`,
      choices: [
        choice(
          'shadow-comfort',
          `Defeat them with the old method: ${cv(2)}.`,
          'comfort',
          'The body relaxes because it knows this move.',
          'The enemy falls back.',
          `The lifetime survives the scene, but the karmic loop tightens.`,
        ),
        choice(
          'shadow-shadow',
          `Embrace the destructive gift and ${sv(2)}.`,
          'shadow',
          'The victory is intoxicating.',
          'No one doubts your power now.',
          `This is a Shadow Victory seed. Future lifetimes will answer it.`,
          { shadow: 18, karma: -16 },
        ),
        choice(
          'shadow-purpose',
          `Face the trial by ${pv(2)}.`,
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
      storyScene: sceneVar === 0
        ? `At the end of the lifetime, the old road and the new road stand in the same room. The South Node offers its familiar crown. The North Node asks for ${axis.purposeDemand.toLowerCase()} This is the moment the soul came back to try again.`
        : sceneVar === 1
        ? `The lifetime narrows to a single threshold. Behind you, the ${south.sign} road stretches back through every comfort you ever chose. Ahead, the ${north.sign} path demands ${axis.purposeDemand.toLowerCase()} The door will not wait.`
        : `Two voices speak at once. The first is ancient and warm: come home, it says, ${cv(0)} and be safe. The second is quieter and terrifying: ${pv(0)}, and become who you came here to be. The lifetime ends on whichever voice you answer.`,
      emotionalSetup: sceneVar === 0
        ? `The final choice is not about being good. It is about which self gets to reincarnate.`
        : sceneVar === 1
        ? `This is not a test of virtue. It is a test of identity. The soul that walks through the next door is the soul that gets to be born again.`
        : `Everything you chose until now has led here. The question is not whether you are brave. The question is whether you are ready to stop being who you were.`,
      choices: [
        choice(
          'final-comfort',
          `Return to the old road and ${cv(0)}.`,
          'comfort',
          'The old self survives intact.',
          'The ending feels familiar, almost beautiful, and unfinished.',
          `Repeated Karma Ending becomes likely. The soul knows this hallway too well.`,
          { karma: -8, futureLifetimeDifficulty: 2 },
        ),
        choice(
          'final-shadow',
          `Take power through ${sv(0)}.`,
          'shadow',
          'The world bends, and the soul hardens.',
          'You win something the spirit cannot carry cleanly.',
          `Shadow Victory Ending becomes likely. The next birth will be built around consequence.`,
          { shadow: 22, karma: -20, futureLifetimeDifficulty: 3 },
        ),
        choice(
          'final-purpose',
          `Walk the new road: ${pv(1)}.`,
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
