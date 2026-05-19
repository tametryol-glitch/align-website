import type { MajorNodeAspect, NormalizedNodeAspect, PlanetKey } from './types';

export const NODE_ASPECT_PLANET_THEMES: Record<PlanetKey, {
  storyline: string;
  test: string;
  guideOrOpponent: string;
  reward: string;
}> = {
  Ascendant: {
    storyline: 'destiny is written into the face and body of the avatar',
    test: 'being recognized before feeling ready',
    guideOrOpponent: 'a witness who sees through every disguise',
    reward: 'a truer mask',
  },
  Sun: {
    storyline: 'identity, fame, father karma, leadership, and visibility press on the soul path',
    test: 'choosing purpose over applause',
    guideOrOpponent: 'a fallen ruler or father figure',
    reward: 'clean radiance',
  },
  Moon: {
    storyline: 'mother memory, home, dependency, ancestry, and attachment shape the road',
    test: 'leaving the old comfort without abandoning the inner child',
    guideOrOpponent: 'a mother, caretaker, or lost child',
    reward: 'emotional sovereignty',
  },
  Mercury: {
    storyline: 'speech, writing, trade, lies, contracts, and messages become karmic instruments',
    test: 'telling the whole truth when cleverness would be safer',
    guideOrOpponent: 'a messenger with a sealed letter',
    reward: 'language that opens doors',
  },
  Venus: {
    storyline: 'love, romance, beauty, betrayal, art, wealth, and pleasure bind the soul path',
    test: 'choosing value over seduction',
    guideOrOpponent: 'a lover who carries an unfinished vow',
    reward: 'love without bargaining',
  },
  Mars: {
    storyline: 'war, courage, sexuality, competition, anger, and survival sharpen the lifetime',
    test: 'using fire without letting it become cruelty',
    guideOrOpponent: 'a rival, soldier, or dangerous beloved',
    reward: 'brave restraint',
  },
  Jupiter: {
    storyline: 'teachers, faith, law, travel, fortune, and spiritual protection expand the path',
    test: 'trusting wisdom without becoming certain beyond listening',
    guideOrOpponent: 'a teacher from a far road',
    reward: 'blessing that multiplies purpose',
  },
  Saturn: {
    storyline: 'duty, poverty, authority, guilt, restriction, punishment, and mastery test the soul',
    test: 'honoring responsibility without worshiping fear',
    guideOrOpponent: 'an elder, judge, debt collector, or cold ruler',
    reward: 'mastery earned without self-betrayal',
  },
  Uranus: {
    storyline: 'rebellion, exile, genius, invention, revolution, and awakening disrupt the road',
    test: 'freeing the self without abandoning the people who need the bridge',
    guideOrOpponent: 'a strange ally from the future',
    reward: 'liberation that lasts',
  },
  Neptune: {
    storyline: 'dreams, illusion, sacrifice, addiction, deception, and mystical longing veil the path',
    test: 'keeping faith without surrendering discernment',
    guideOrOpponent: 'a dream guide, mystic, or beautiful deceiver',
    reward: 'clear vision',
  },
  Pluto: {
    storyline: 'death, power, trauma, secrets, control, obsession, and rebirth pull the soul underground',
    test: 'entering the underworld without becoming its ruler',
    guideOrOpponent: 'a hidden enemy who knows the old wound',
    reward: 'regeneration without domination',
  },
  Vesta: {
    storyline: 'sacred work, ritual, service, purity, craft, discipline, and devotion guard the mission',
    test: 'protecting the flame without burning the body that carries it',
    guideOrOpponent: 'a priestess, craft master, or keeper of vows',
    reward: 'a sacred craft awakened',
  },
  Juno: {
    storyline: 'marriage karma, contracts, loyalty, betrayal, partnership destiny, and vows return',
    test: 'finishing the vow without imprisoning either soul',
    guideOrOpponent: 'the recurring soul who changes faces',
    reward: 'a healed contract',
  },
  Chiron: {
    storyline: 'pain, rejection, sacred medicine, teacher destiny, and the wound that becomes a doorway define the lifetime',
    test: 'letting the wound teach without letting it rule',
    guideOrOpponent: 'a wounded healer who refuses pity',
    reward: 'medicine made from shame',
  },
  Lilith: {
    storyline: 'exile, taboo, forbidden power, shame, raw instinct, and refusal cut through the path',
    test: 'claiming wild power without turning all intimacy into captivity',
    guideOrOpponent: 'an exiled lover or dangerous liberator',
    reward: 'unowned power',
  },
  'North Node': {
    storyline: 'purpose doubles back on itself and becomes impossible to ignore',
    test: 'answering destiny directly',
    guideOrOpponent: 'a future self',
    reward: 'rapid ascension',
  },
  'South Node': {
    storyline: 'the old life calls loudly and offers the soul its favorite weapon',
    test: 'recognizing mastery without returning to captivity',
    guideOrOpponent: 'a past self',
    reward: 'ancient skill purified',
  },
};

const ASPECT_MODIFIERS: Record<MajorNodeAspect, string> = {
  conjunction: 'fuses directly with the karmic road',
  square: 'pressures the soul through conflict and repeated friction',
  opposition: 'returns through mirrors, enemies, lovers, and polarizing choices',
  trine: 'opens as a gift that can still be misused when it becomes too easy',
};

export function describeNodeAspect(aspect: NormalizedNodeAspect): string {
  const theme = NODE_ASPECT_PLANET_THEMES[aspect.planet];
  return `${aspect.planet} ${aspect.type} ${aspect.node} ${ASPECT_MODIFIERS[aspect.type]}: ${theme.storyline}. The test is ${theme.test}.`;
}

export function aspectWeight(type: MajorNodeAspect): number {
  if (type === 'conjunction') return 4;
  if (type === 'square' || type === 'opposition') return 3;
  return 2;
}
