export const HOUSE_MEANINGS: Record<number, {
  arena: string;
  wound: string;
  role: string;
  settingDetail: string;
}> = {
  1: {
    arena: 'identity and the right to exist without disguise',
    wound: 'fear of being seen before the soul feels ready',
    role: 'marked child, chosen face, visible survivor',
    settingDetail: 'a city where every face is watched',
  },
  2: {
    arena: 'self-worth, money, land, voice, and the body',
    wound: 'fear of poverty and being owned by need',
    role: 'keeper of a treasury, maker, farmer, singer, merchant',
    settingDetail: 'markets, orchards, workshops, and locked family vaults',
  },
  3: {
    arena: 'speech, siblings, contracts, rumors, and roads',
    wound: 'fear that truth will exile the messenger',
    role: 'scribe, courier, spy, translator, oath-bearer',
    settingDetail: 'crossroads, archives, coded letters, and border roads',
  },
  4: {
    arena: 'home, ancestry, motherlines, memory, and belonging',
    wound: 'fear of losing the place that proves the soul was loved',
    role: 'heir, keeper of the house, hidden child, ancestral witness',
    settingDetail: 'old houses, kitchens, graves, coastlines, and family altars',
  },
  5: {
    arena: 'love, children, performance, pleasure, and creation',
    wound: 'fear that joy will be punished or taken',
    role: 'artist, royal child, lover, performer, forbidden muse',
    settingDetail: 'theaters, courts, summer fields, and rooms full of applause',
  },
  6: {
    arena: 'service, health, craft, discipline, and daily devotion',
    wound: 'fear of becoming useful but unloved',
    role: 'healer, apprentice, servant, herbalist, keeper of rituals',
    settingDetail: 'temples, infirmaries, workshops, and dawn routines',
  },
  7: {
    arena: 'marriage, vows, open enemies, alliances, and mirrors',
    wound: 'fear of choosing wrong and being bound to it',
    role: 'spouse, negotiator, rival, sworn companion, treaty-maker',
    settingDetail: 'marriage halls, courts, duels, and sealed treaties',
  },
  8: {
    arena: 'secrets, debt, death, taboo, inheritance, and shared power',
    wound: 'fear of betrayal, exposure, and losing control',
    role: 'keeper of forbidden accounts, mourner, occultist, survivor',
    settingDetail: 'crypts, hidden rooms, plague houses, and underworld gates',
  },
  9: {
    arena: 'faith, law, travel, teachers, publishing, and prophecy',
    wound: 'fear that the world is too small for the soul truth',
    role: 'pilgrim, judge, teacher, exile, oracle, sea traveler',
    settingDetail: 'monasteries, ports, high roads, universities, and foreign courts',
  },
  10: {
    arena: 'authority, vocation, reputation, duty, and public consequence',
    wound: 'fear of falling from the height everyone demanded',
    role: 'ruler, general, judge, builder, public healer, disgraced leader',
    settingDetail: 'council chambers, towers, battle plans, and public squares',
  },
  11: {
    arena: 'friends, movements, patrons, future dreams, and collective destiny',
    wound: 'fear of being cast out by the group that once needed the soul',
    role: 'rebel, inventor, patron, organizer, future-sighted friend',
    settingDetail: 'secret societies, observatories, guilds, and uprising streets',
  },
  12: {
    arena: 'exile, dreams, sacrifice, hidden enemies, spirit, and closure',
    wound: 'fear of disappearing where nobody can find the soul',
    role: 'mystic, prisoner, dreamer, cloistered artist, hidden guide',
    settingDetail: 'monasteries, islands, hospitals, dream temples, and sealed rooms',
  },
};

export function houseMeaning(house: number) {
  const safeHouse = Number.isFinite(house) && house >= 1 && house <= 12 ? Math.round(house) : 1;
  return HOUSE_MEANINGS[safeHouse] ?? HOUSE_MEANINGS[1];
}
