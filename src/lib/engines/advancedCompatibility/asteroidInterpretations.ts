// ═══════════════════════════════════════════════════════════════════
// Asteroid Interpretations for Advanced Compatibility
// 18+ asteroid meanings, synastry themes, scoring contributions
// ═══════════════════════════════════════════════════════════════════

export interface AsteroidMeaning {
  name: string;
  keywords: string;
  loveTheme: string;
  darkTheme: string;
  passionWeight: number;
  marriageWeight: number;
  toxicityWeight: number;
}

export const ASTEROID_MEANINGS: Record<string, AsteroidMeaning> = {
  Juno: {
    name: 'Juno',
    keywords: 'commitment, loyalty, marriage contract, partnership expectations',
    loveTheme: 'Juno reveals what you need to feel truly committed. When aspected in synastry, it shows where the relationship naturally formalizes — or where expectations clash painfully.',
    darkTheme: 'Afflicted Juno can indicate possessiveness disguised as loyalty, power imbalances in commitment, or staying in a relationship long past its expiration out of obligation.',
    passionWeight: 0.2,
    marriageWeight: 1.0,
    toxicityWeight: 0.3,
  },
  Vesta: {
    name: 'Vesta',
    keywords: 'devotion, sacred focus, inner flame, self-containment',
    loveTheme: 'Vesta in synastry shows where two people share a sense of sacred purpose. The connection feels like a calling rather than a choice.',
    darkTheme: 'Afflicted Vesta can indicate one person sacrificing their identity for the other, or using devotion as a mechanism of control.',
    passionWeight: 0.3,
    marriageWeight: 0.6,
    toxicityWeight: 0.2,
  },
  Eros: {
    name: 'Eros',
    keywords: 'erotic desire, obsessive attraction, raw passion, creative eros',
    loveTheme: 'Eros contacts in synastry create magnetic, almost compulsive attraction. The desire runs deeper than physical — it touches the soul.',
    darkTheme: 'Afflicted Eros can manifest as sexual obsession, inability to separate desire from love, or using sexuality to manipulate.',
    passionWeight: 1.0,
    marriageWeight: 0.2,
    toxicityWeight: 0.4,
  },
  Psyche: {
    name: 'Psyche',
    keywords: 'soul recognition, emotional depth, psychological intimacy, vulnerability',
    loveTheme: 'Psyche contacts create a sense of being truly known. The other person sees your soul, and the intimacy is both terrifying and beautiful.',
    darkTheme: 'Afflicted Psyche can indicate psychological manipulation through emotional vulnerability, or wounds around being truly seen.',
    passionWeight: 0.5,
    marriageWeight: 0.5,
    toxicityWeight: 0.3,
  },
  Lilith: {
    name: 'Lilith (Black Moon)',
    keywords: 'raw feminine power, taboo desire, shadow sexuality, autonomy',
    loveTheme: 'Lilith contacts in synastry are magnetic and destabilizing. They reveal the parts of desire that polite society tries to suppress.',
    darkTheme: 'Afflicted Lilith can indicate power games around sexuality, shame dynamics, rejection wounds, or the desire to control the other through their own darkness.',
    passionWeight: 0.9,
    marriageWeight: 0.1,
    toxicityWeight: 0.6,
  },
  Ceres: {
    name: 'Ceres',
    keywords: 'nurturing, unconditional love, nourishment, attachment style',
    loveTheme: 'Ceres in synastry shows how two people nurture each other. Strong Ceres contacts create a deeply caring, almost parental quality to the bond.',
    darkTheme: 'Afflicted Ceres can indicate smothering love, using food/care as control, or deep grief and abandonment patterns.',
    passionWeight: 0.1,
    marriageWeight: 0.7,
    toxicityWeight: 0.3,
  },
  Pallas: {
    name: 'Pallas Athena',
    keywords: 'strategic intelligence, creative problem-solving, pattern recognition',
    loveTheme: 'Pallas contacts show where two people think strategically together. The relationship has a quality of intellectual partnership.',
    darkTheme: 'Afflicted Pallas can indicate using intelligence to manipulate, or one partner always trying to "figure out" the other instead of feeling.',
    passionWeight: 0.1,
    marriageWeight: 0.4,
    toxicityWeight: 0.2,
  },
  Chiron: {
    name: 'Chiron',
    keywords: 'wound, healing gift, vulnerability, the place where love hurts',
    loveTheme: 'Chiron contacts are among the most profound in synastry. They show where two people can heal each other — but only by being willing to feel the wound.',
    darkTheme: 'Afflicted Chiron can indicate relationships that re-traumatize rather than heal, or a pattern of choosing partners who mirror your deepest wound.',
    passionWeight: 0.3,
    marriageWeight: 0.5,
    toxicityWeight: 0.5,
  },
  Vertex: {
    name: 'Vertex',
    keywords: 'fated encounters, destiny point, unavoidable meetings',
    loveTheme: 'Vertex contacts feel like destiny. The meeting feels orchestrated by something larger than either person.',
    darkTheme: 'Not all fated connections are healthy. Vertex contacts with malefics can indicate karmically bound but destructive encounters.',
    passionWeight: 0.4,
    marriageWeight: 0.6,
    toxicityWeight: 0.2,
  },
  'Part of Fortune': {
    name: 'Part of Fortune',
    keywords: 'joy, fulfillment, natural abundance, where love flourishes',
    loveTheme: 'When a partner activates your Part of Fortune, being with them makes you feel like the luckiest version of yourself.',
    darkTheme: 'If heavily afflicted, the person may associate their happiness entirely with the relationship, creating unhealthy dependency.',
    passionWeight: 0.2,
    marriageWeight: 0.5,
    toxicityWeight: 0.1,
  },
  Nessus: {
    name: 'Nessus',
    keywords: 'abuse patterns, power abuse, cycles of harm, accountability',
    loveTheme: 'Nessus contacts in synastry illuminate patterns of harm that need conscious awareness. Handled well, they catalyze breaking generational cycles.',
    darkTheme: 'Nessus is associated with abuse dynamics — the abuser-victim cycle. Strong Nessus contacts require extreme self-awareness.',
    passionWeight: 0.3,
    marriageWeight: 0.1,
    toxicityWeight: 1.0,
  },
  Dejanira: {
    name: 'Dejanira',
    keywords: 'victimization patterns, vulnerability to harm, where you give power away',
    loveTheme: 'Dejanira contacts reveal where one person may unconsciously give their power to another. Awareness transforms this into conscious choice.',
    darkTheme: 'Dejanira-Nessus contacts are the classic abuse axis. When present, the relationship requires extraordinary vigilance about power dynamics.',
    passionWeight: 0.1,
    marriageWeight: 0.1,
    toxicityWeight: 0.9,
  },
  Sappho: {
    name: 'Sappho',
    keywords: 'soul-level attraction, artistic love, deep friendship, sensual aesthetics',
    loveTheme: 'Sappho contacts create a bond that transcends conventional categories. The attraction is both intellectual and sensual.',
    darkTheme: 'Can indicate a connection that society does not understand or accept, creating external pressure.',
    passionWeight: 0.7,
    marriageWeight: 0.3,
    toxicityWeight: 0.1,
  },
  Amor: {
    name: 'Amor',
    keywords: 'unconditional love, selfless devotion, love without conditions',
    loveTheme: 'Amor contacts in synastry create a quality of pure, accepting love. The other person feels loved exactly as they are.',
    darkTheme: 'Afflicted Amor can indicate self-sacrificing love that enables harmful behavior, or love that demands nothing because self-worth is absent.',
    passionWeight: 0.2,
    marriageWeight: 0.7,
    toxicityWeight: 0.2,
  },
  Cupido: {
    name: 'Cupido',
    keywords: 'romantic infatuation, the spark of attraction, love at first sight',
    loveTheme: 'Cupido contacts create instant romantic chemistry. The initial spark is undeniable.',
    darkTheme: 'Can indicate attraction that burns bright but cannot sustain — infatuation mistaken for deep love.',
    passionWeight: 0.8,
    marriageWeight: 0.2,
    toxicityWeight: 0.1,
  },
  Sedna: {
    name: 'Sedna',
    keywords: 'betrayal transcendence, deep feminine wounds, transformation through suffering',
    loveTheme: 'Sedna contacts in synastry touch the deepest wounds around betrayal and abandonment. Healing here is profound.',
    darkTheme: 'Afflicted Sedna can indicate patterns of betrayal, victimhood, or relationships where trust is fundamentally broken.',
    passionWeight: 0.2,
    marriageWeight: 0.2,
    toxicityWeight: 0.7,
  },
  Pluto: {
    name: 'Pluto',
    keywords: 'power, transformation, obsession, death-rebirth cycles',
    loveTheme: 'Pluto contacts transform both people permanently. The connection reaches into the deepest unconscious material.',
    darkTheme: 'Pluto can indicate manipulation, power abuse, obsessive control, jealousy that borders on pathological.',
    passionWeight: 0.8,
    marriageWeight: 0.4,
    toxicityWeight: 0.7,
  },
  'North Node': {
    name: 'North Node',
    keywords: 'destiny, soul growth direction, karmic purpose',
    loveTheme: 'North Node contacts feel fated. The relationship serves a purpose beyond personal happiness.',
    darkTheme: 'Can create a feeling of being karmically trapped — unable to leave even when the relationship causes suffering.',
    passionWeight: 0.3,
    marriageWeight: 0.6,
    toxicityWeight: 0.2,
  },
};

// Score contribution from asteroid aspects
export function getAsteroidContribution(
  asteroidName: string,
  aspectType: string,
  orb: number,
  maxOrb: number,
): { passion: number; marriage: number; toxicity: number } {
  const meaning = ASTEROID_MEANINGS[asteroidName];
  if (!meaning) return { passion: 0, marriage: 0, toxicity: 0 };

  const isHard = ['Square', 'Opposition', 'Quincunx'].includes(aspectType);
  const orbWeight = Math.max(0, 1 - (orb / maxOrb));

  const baseMultiplier = isHard ? 0.7 : 1.0;
  const toxicMultiplier = isHard ? 1.3 : 0.5;

  return {
    passion: meaning.passionWeight * orbWeight * baseMultiplier,
    marriage: meaning.marriageWeight * orbWeight * (isHard ? 0.5 : 1.0),
    toxicity: meaning.toxicityWeight * orbWeight * toxicMultiplier,
  };
}

export function getAsteroidInterpretation(
  asteroidName: string,
  partnerPlanet: string,
  aspectType: string,
): string {
  const meaning = ASTEROID_MEANINGS[asteroidName];
  if (!meaning) return '';
  const isHard = ['Square', 'Opposition', 'Quincunx'].includes(aspectType);
  return isHard ? meaning.darkTheme : meaning.loveTheme;
}
