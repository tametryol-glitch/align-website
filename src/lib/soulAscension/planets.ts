import type { PlanetKey } from './types';

export const PLANET_GAME_MEANINGS: Record<PlanetKey, {
  domain: string;
  missionUse: string;
  gift: string;
  shadow: string;
}> = {
  Ascendant: {
    domain: 'avatar body, instinctive style, first impression',
    missionUse: 'sets how the world first reacts to the soul',
    gift: 'presence',
    shadow: 'mask',
  },
  Sun: {
    domain: 'heroic identity, vitality, father themes, visibility',
    missionUse: 'creates leadership tests, fame pressure, and ego consequence',
    gift: 'radiance',
    shadow: 'pride',
  },
  Moon: {
    domain: 'emotional wound, mother themes, family memory, attachment',
    missionUse: 'creates childhood imprint, dependency tests, and home wounds',
    gift: 'emotional knowing',
    shadow: 'regression',
  },
  Mercury: {
    domain: 'thinking, speech, clues, contracts, riddles, trade',
    missionUse: 'creates dialogue choices, letters, lies, puzzles, and messengers',
    gift: 'clever language',
    shadow: 'weaponized words',
  },
  Venus: {
    domain: 'love, charm, beauty, value, money, pleasure, art',
    missionUse: 'creates lovers, temptation, wealth, betrayal, and aesthetic gifts',
    gift: 'magnetism',
    shadow: 'seduction without truth',
  },
  Mars: {
    domain: 'courage, anger, combat, sexuality, survival, stamina',
    missionUse: 'creates conflict, rivalry, danger, and the fight response',
    gift: 'bravery',
    shadow: 'violence',
  },
  Jupiter: {
    domain: 'teachers, faith, luck, law, travel, wisdom, blessing',
    missionUse: 'creates mentors, openings, reward multipliers, and spiritual protection',
    gift: 'trust in the larger road',
    shadow: 'excess and certainty',
  },
  Saturn: {
    domain: 'debt, fear, delay, guilt, duty, authority, mastery',
    missionUse: 'creates restriction, consequence, discipline, and karmic law',
    gift: 'mastery',
    shadow: 'cold punishment',
  },
  Uranus: {
    domain: 'rebellion, genius, exile, invention, sudden awakening',
    missionUse: 'creates shocks, revolutions, strange allies, and freedom missions',
    gift: 'liberation',
    shadow: 'rupture without care',
  },
  Neptune: {
    domain: 'dreams, mysticism, illusion, sacrifice, addiction, mystery',
    missionUse: 'creates visions, deception, longing, trance, and spiritual fog',
    gift: 'vision',
    shadow: 'escape',
  },
  Pluto: {
    domain: 'power, trauma, death, secrets, control, rebirth',
    missionUse: 'creates underworld chapters, hidden enemies, obsession, and transformation',
    gift: 'regeneration',
    shadow: 'domination',
  },
  Vesta: {
    domain: 'sacred work, devotion, ritual, craft, discipline, duty',
    missionUse: 'creates service vows and the gift the soul must protect',
    gift: 'devotion',
    shadow: 'purity used as a cage',
  },
  Juno: {
    domain: 'soul contracts, marriage karma, loyalty, betrayal, vows',
    missionUse: 'creates recurring souls, partnership tests, and unfinished promises',
    gift: 'chosen loyalty',
    shadow: 'binding the wrong vow',
  },
  Chiron: {
    domain: 'sacred wound, shame, rejection, healing, medicine',
    missionUse: 'creates the wound that becomes the medicine',
    gift: 'medicine from pain',
    shadow: 'identity built around the wound',
  },
  Lilith: {
    domain: 'exile, taboo, forbidden power, shame, wild instinct',
    missionUse: 'creates raw desire, refusal, taboo, and the part that cannot be owned',
    gift: 'untamed truth',
    shadow: 'burning every bridge to stay free',
  },
  'North Node': {
    domain: 'future purpose, ascension requirement, growth path',
    missionUse: 'creates the unfamiliar door that raises the soul',
    gift: 'destiny in practice',
    shadow: 'avoidance',
  },
  'South Node': {
    domain: 'old talent, old life pattern, survival style, comfort trap',
    missionUse: 'creates fast rewards, old weapons, and karmic loops',
    gift: 'ancient mastery',
    shadow: 'living inside the old victory',
  },
};

export const PLANET_ALIASES: Record<PlanetKey, string[]> = {
  Ascendant: ['Ascendant', 'ASC', 'Rising'],
  Sun: ['Sun'],
  Moon: ['Moon'],
  Mercury: ['Mercury'],
  Venus: ['Venus'],
  Mars: ['Mars'],
  Jupiter: ['Jupiter'],
  Saturn: ['Saturn'],
  Uranus: ['Uranus'],
  Neptune: ['Neptune'],
  Pluto: ['Pluto'],
  Vesta: ['Vesta'],
  Juno: ['Juno'],
  Chiron: ['Chiron'],
  Lilith: ['Lilith', 'Black Moon Lilith', 'Mean Lilith', 'Dark Moon Lilith'],
  'North Node': ['North Node', 'True Node', 'Rahu', 'Node'],
  'South Node': ['South Node', 'Ketu'],
};

export const CORE_PLANETS: PlanetKey[] = [
  'Ascendant',
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
  'Vesta',
  'Juno',
  'Chiron',
  'Lilith',
  'North Node',
  'South Node',
];
