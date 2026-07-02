/**
 * Purpose Points (web) — a deterministic list of 10 specific things an Earth
 * (earthly purpose) or North Node (soul purpose) placement could point to.
 * Shared by both purpose engines so the "10 things" list is anchored to the
 * reader's real houses/signs/rulers even when the AI reading is unavailable.
 */

export const HOUSE_THEME: Record<number, string> = {
  1: 'your identity and how you show up in the world',
  2: 'money, values, and self-worth',
  3: 'communication, learning, and your day-to-day world',
  4: 'home, family, and emotional roots',
  5: 'creativity, romance, and self-expression',
  6: 'work, health, and daily routines',
  7: 'partnership and one-to-one relationships',
  8: 'intimacy, shared resources, and deep transformation',
  9: 'travel, higher learning, and belief',
  10: 'career, reputation, and public legacy',
  11: 'community, friendships, and long-term hopes',
  12: 'solitude, spirituality, and the inner world',
};

export const SIGN_FOCUS: Record<string, string> = {
  Aries: 'courage and initiative',
  Taurus: 'patience and building lasting value',
  Gemini: 'ideas, words, and connection',
  Cancer: 'care, nurture, and emotional safety',
  Leo: 'creative self-expression and leadership',
  Virgo: 'craft, service, and refinement',
  Libra: 'harmony, fairness, and partnership',
  Scorpio: 'depth, intensity, and transformation',
  Sagittarius: 'meaning, freedom, and exploration',
  Capricorn: 'discipline, mastery, and legacy',
  Aquarius: 'innovation, community, and vision',
  Pisces: 'compassion, imagination, and spirit',
};

/** The header shown above the list, per reading type. */
export function purposePointsHeader(kind: 'earthly' | 'soul'): string {
  return kind === 'soul' ? 'What your soul is here to grow toward:' : 'What this could point to:';
}

/**
 * Build exactly 10 specific points from a placement. Anchored to the real
 * houses/signs/rulers where available, padded with type-appropriate items so
 * the list is always complete.
 */
export function buildPurposePoints(p: any, kind: 'earthly' | 'soul'): string[] {
  const rc = p?.rulerChain || {};
  const soul = kind === 'soul';
  const h = (n?: number | null) => (n && HOUSE_THEME[n]) ? HOUSE_THEME[n] : null;
  const s = (sign?: string | null) => (sign && SIGN_FOCUS[sign]) ? SIGN_FOCUS[sign] : null;

  const candidates = [
    h(p?.primaryHouse) && `${soul ? 'Growing into' : 'Building your life around'} ${h(p.primaryHouse)}`,
    s(p?.position?.sign) && `${soul ? 'Developing the ' : 'Expressing your '}${s(p.position.sign)}`,
    h(p?.duad?.activatedHouse) && `${soul ? 'Being drawn to stretch into' : 'A recurring pull toward'} ${h(p.duad.activatedHouse)}`,
    h(p?.compendium?.activatedHouse) && `${soul ? 'Doing your deepest growth through' : 'Transformative work involving'} ${h(p.compendium.activatedHouse)}`,
    s(rc.mainRuler?.position?.sign) && `Leaning into ${s(rc.mainRuler.position.sign)}`,
    h(rc.mainRuler?.house) && `Putting your energy into ${h(rc.mainRuler.house)}`,
    s(rc.duadRuler?.position?.sign) && `Cultivating ${s(rc.duadRuler.position.sign)}`,
    h(rc.duadRuler?.house) && `Showing up in ${h(rc.duadRuler.house)}`,
    s(rc.compendiumRuler?.position?.sign) && `Owning ${s(rc.compendiumRuler.position.sign)}`,
    h(rc.compendiumRuler?.house) && `Making your mark in ${h(rc.compendiumRuler.house)}`,
  ].filter(Boolean) as string[];

  const fillersEarthly = [
    'A vocation that puts these strengths to work every day',
    'A body of work you build patiently over years, not overnight',
    'Turning a personal struggle into something you help others with',
    'Choosing settings and people that support this direction, not distract from it',
    'A tangible contribution people can point to and remember you by',
  ];
  const fillersSoul = [
    'Stepping into situations that feel unfamiliar but strangely right',
    'Outgrowing an old comfort zone that no longer fits who you are becoming',
    'Learning to receive support instead of carrying everything alone',
    "Trusting a quiet inner pull over other people's expectations",
    'A kind of relationship or experience your soul keeps seeking out',
  ];

  return candidates.concat(soul ? fillersSoul : fillersEarthly).slice(0, 10);
}
