/* ──────────────────────────────────────────────────────────────
   Saturn Sign Content
   SEO-rich astrological content for all 12 Saturn sign pages.
   ────────────────────────────────────────────────────────────── */

import {
  SIGNS,
  ALL_SIGN_KEYS,
  getElementColor,
  type ZodiacSign,
} from './compatibilityContent';

export { SIGNS, ALL_SIGN_KEYS, getElementColor };
export type { ZodiacSign };

/* ── Content type ─────────────────────────────────────────────── */

export interface SaturnSignContent {
  sign: ZodiacSign;
  headline: string;
  intro: string;
  sections: {
    title: string;
    icon: string;
    paragraphs: string[];
  }[];
}

/* ── Planet symbol ────────────────────────────────────────────── */

export const SATURN_SYMBOL = '♄';

/* ── Content for each Saturn sign ─────────────────────────────── */

const SATURN_CONTENT: Record<ZodiacSign, Omit<SaturnSignContent, 'sign'>> = {
  aries: {
    headline: 'Saturn in Aries: Mastering Courage',
    intro: 'With Saturn in Aries, your life lessons center on the responsible use of initiative, the discipline of true courage, and learning that real strength includes restraint. Saturn asks you to master the Aries impulse — not to suppress it, but to channel it wisely.',
    sections: [
      {
        title: 'Life Lessons & Karmic Challenges',
        icon: '📜',
        paragraphs: [
          'Saturn in Aries teaches you that courage is not the absence of fear but the discipline to act wisely in spite of it. You may struggle with assertiveness early in life — either overcompensating with aggression or shrinking from conflict. Your karmic task is to find the middle path between recklessness and timidity.',
          'You are learning to take initiative without bulldozing others, to lead without dominating, and to compete without losing your integrity. Every time you act from genuine courage rather than ego, you strengthen the Saturn structure that will eventually become your greatest asset.',
        ],
      },
      {
        title: 'Discipline & Maturity Path',
        icon: '🏔',
        paragraphs: [
          'Your maturity arrives through the development of strategic patience. Young Saturn in Aries often rushes headlong into situations that require more planning. Over time, you learn to combine Aries boldness with Saturnian preparation, becoming a formidable force that is both brave and wise.',
          'The discipline Saturn demands of you is impulse control — not the suppression of your fire, but the mastery of its timing. As you mature, your initiative becomes more targeted, your leadership more effective, and your courage more genuinely heroic because it serves something greater than your ego.',
        ],
      },
    ],
  },
  taurus: {
    headline: 'Saturn in Taurus: Mastering Security',
    intro: 'With Saturn in Taurus, your life lessons center on your relationship with material security, self-worth, and the distinction between what you need and what you merely want. Saturn asks you to build genuine, lasting security through discipline and self-reliance.',
    sections: [
      {
        title: 'Life Lessons & Karmic Challenges',
        icon: '📜',
        paragraphs: [
          'Saturn in Taurus teaches you that true security comes from within. You may experience financial limitations, scarcity, or a deep-seated fear that there is never enough. These challenges are not punishments — they are Saturn\'s way of teaching you to build an unshakeable sense of self-worth that no external circumstance can diminish.',
          'Your karmic task is to develop a healthy relationship with material resources — neither hoarding them out of fear nor squandering them through carelessness. You are learning that abundance flows when you trust your ability to create value through consistent, disciplined effort.',
        ],
      },
      {
        title: 'Discipline & Maturity Path',
        icon: '🏔',
        paragraphs: [
          'Your maturity arrives through financial wisdom and the development of rock-solid self-reliance. Early struggles with money or resources teach you to budget, plan, and build wealth methodically. Over time, your Saturnian discipline transforms initial scarcity into enduring abundance.',
          'As you mature, your relationship with material security deepens. You learn to enjoy what you have without anxiety about losing it, to share generously without fear of depletion, and to find security in your own competence rather than in your bank account.',
        ],
      },
    ],
  },
  gemini: {
    headline: 'Saturn in Gemini: Mastering the Mind',
    intro: 'With Saturn in Gemini, your life lessons center on disciplined thinking, responsible communication, and the development of intellectual depth alongside your natural breadth. Saturn asks you to go beyond surface curiosity and develop genuine expertise.',
    sections: [
      {
        title: 'Life Lessons & Karmic Challenges',
        icon: '📜',
        paragraphs: [
          'Saturn in Gemini teaches you that words carry weight and consequences. You may struggle with communication challenges — difficulty expressing yourself clearly, fear of being misunderstood, or anxiety around intellectual performance. These challenges push you to develop exceptional clarity and precision in your thinking.',
          'Your karmic task is to move beyond scattered curiosity toward focused mastery. You are learning to think deeply rather than broadly, to speak with authority rather than nervousness, and to use your considerable mental gifts with the discipline and responsibility they deserve.',
        ],
      },
      {
        title: 'Discipline & Maturity Path',
        icon: '🏔',
        paragraphs: [
          'Your maturity arrives through the development of intellectual rigor. Early communication anxieties transform into exceptional precision and authority as you learn to master your mental gifts through study, practice, and the patient development of genuine expertise.',
          'As you mature, your thinking becomes increasingly structured and powerful. You develop the ability to communicate complex ideas with clarity and impact, and your intellectual contributions carry the weight of someone who has earned their knowledge through disciplined effort.',
        ],
      },
    ],
  },
  cancer: {
    headline: 'Saturn in Cancer: Mastering Emotional Security',
    intro: 'With Saturn in Cancer, your life lessons center on emotional independence, the responsible management of your deep feelings, and learning to create your own inner sanctuary rather than depending on others for emotional safety.',
    sections: [
      {
        title: 'Life Lessons & Karmic Challenges',
        icon: '📜',
        paragraphs: [
          'Saturn in Cancer teaches you that emotional security must be built from the inside out. You may have experienced early life challenges around family, home, or emotional availability — perhaps a cold or absent parent, frequent moves, or a sense that you had to grow up too fast emotionally.',
          'Your karmic task is to become your own nurturing parent. You are learning to provide for yourself the emotional safety that may not have been consistently available in childhood. This is not about suppressing your feelings — it is about developing the emotional maturity to hold your own vulnerability with strength and compassion.',
        ],
      },
      {
        title: 'Discipline & Maturity Path',
        icon: '🏔',
        paragraphs: [
          'Your maturity arrives through the development of emotional self-sufficiency and the conscious creation of home and family life. Over time, you transform childhood wounds into extraordinary emotional strength and resilience.',
          'As you mature, you become a pillar of emotional stability for others. Your hard-won emotional wisdom makes you an exceptional counselor, parent, and friend. The security you build is genuine and lasting because it was forged through real experience rather than inherited through easy circumstances.',
        ],
      },
    ],
  },
  leo: {
    headline: 'Saturn in Leo: Mastering Authentic Expression',
    intro: 'With Saturn in Leo, your life lessons center on authentic self-expression, the responsible use of creative power, and learning to shine without needing constant external validation. Saturn asks you to develop genuine confidence rather than performing it.',
    sections: [
      {
        title: 'Life Lessons & Karmic Challenges',
        icon: '📜',
        paragraphs: [
          'Saturn in Leo teaches you that true confidence comes from within. You may struggle with self-expression — feeling inhibited, blocked creatively, or painfully self-conscious about seeking attention. Early life may have included experiences that made you feel invisible, unspecial, or ashamed of wanting recognition.',
          'Your karmic task is to develop authentic self-expression that does not depend on audience approval. You are learning to create for the sake of creation, to lead because it serves others, and to express yourself because your light is genuine — not because you need others to validate your existence.',
        ],
      },
      {
        title: 'Discipline & Maturity Path',
        icon: '🏔',
        paragraphs: [
          'Your maturity arrives through the development of genuine creative mastery and internal confidence. Early creative blocks and self-consciousness give way to powerful, disciplined self-expression as you learn to create from authenticity rather than approval-seeking.',
          'As you mature, your creative output becomes increasingly impressive and authoritative. Your Saturn-tested confidence is real — it does not inflate from praise or deflate from criticism. You become a creative force whose influence endures because it is grounded in substance rather than spectacle.',
        ],
      },
    ],
  },
  virgo: {
    headline: 'Saturn in Virgo: Mastering Sacred Craft',
    intro: 'With Saturn in Virgo, your life lessons center on perfectionism, service, and the devotional quality of disciplined work. Ruled by Vesta, this Saturn placement asks you to transform anxious attention to detail into sacred craftsmanship.',
    sections: [
      {
        title: 'Life Lessons & Karmic Challenges',
        icon: '📜',
        paragraphs: [
          'Saturn in Virgo teaches you the difference between healthy perfectionism and paralyzing self-criticism. You may struggle with anxiety, health concerns, or a relentless inner critic that tells you nothing is ever good enough. These challenges are Saturn\'s way of refining your already considerable analytical gifts.',
          'Ruled by Vesta, your karmic task has a devotional dimension. You are learning to approach your work as sacred practice — not obsessing over perfection for its own sake, but dedicating yourself to excellence because your craft deserves the best you can offer. The difference is subtle but transformative.',
        ],
      },
      {
        title: 'Discipline & Maturity Path',
        icon: '🏔',
        paragraphs: [
          'Your maturity arrives through the transformation of anxiety into expertise. Early struggles with perfectionism and self-doubt give way to genuine mastery as you learn to channel your analytical gifts into productive, purposeful work rather than corrosive self-criticism.',
          'As you mature, you become an authority in your field — someone whose attention to detail and devotional work ethic produces results of exceptional quality. Your Saturn-disciplined Virgo precision becomes a competitive advantage rather than a source of suffering.',
        ],
      },
    ],
  },
  libra: {
    headline: 'Saturn in Libra: Mastering Partnership',
    intro: 'Saturn is exalted in Libra, making this one of Saturn\'s most powerful and constructive placements. With Saturn in Libra, your life lessons center on committed partnership, justice, and the discipline required to maintain genuine equality. Ruled by Juno, this placement takes the work of partnership with sacred seriousness.',
    sections: [
      {
        title: 'Life Lessons & Karmic Challenges',
        icon: '📜',
        paragraphs: [
          'Saturn in Libra teaches you that real partnership requires discipline, commitment, and the courage to address imbalance. You may experience challenges in relationships — difficulty finding a partner, struggles with fairness, or the painful recognition that keeping the peace is not the same as maintaining genuine harmony.',
          'Ruled by Juno and exalted in this sign, your karmic task is to master the art of committed partnership. You are learning to build relationships that are structurally sound — based on genuine equality, mutual respect, and the willingness to do the hard work that lasting love requires.',
        ],
      },
      {
        title: 'Discipline & Maturity Path',
        icon: '🏔',
        paragraphs: [
          'Your maturity arrives through the development of relationship wisdom. Early romantic struggles teach you invaluable lessons about commitment, boundaries, and the difference between codependency and genuine partnership.',
          'As you mature, you become a model of healthy, committed partnership. Your relationships are built to last because they are founded on mutual respect, clear communication, and the Saturn-tested understanding that love is a practice, not just a feeling.',
        ],
      },
    ],
  },
  scorpio: {
    headline: 'Saturn in Scorpio: Mastering Transformation',
    intro: 'With Saturn in Scorpio, your life lessons center on emotional power, the responsible handling of intensity, and the discipline required to transform your deepest fears into your greatest strengths. Saturn asks you to face your shadows with courage and emerge transformed.',
    sections: [
      {
        title: 'Life Lessons & Karmic Challenges',
        icon: '📜',
        paragraphs: [
          'Saturn in Scorpio teaches you that emotional intensity is a power that must be handled with responsibility. You may struggle with issues of trust, control, shared resources, or deep psychological patterns that feel impossible to change. These challenges are Saturn\'s crucible, forging emotional resilience from raw material.',
          'Your karmic task is to master transformation — not to avoid crisis but to develop the emotional discipline to walk through it consciously. You are learning that power does not require control, that trust can coexist with vigilance, and that the darkest experiences can produce the most luminous wisdom.',
        ],
      },
      {
        title: 'Discipline & Maturity Path',
        icon: '🏔',
        paragraphs: [
          'Your maturity arrives through repeated cycles of death and rebirth — letting go of what no longer serves you with increasing grace and wisdom. Early power struggles and trust issues give way to profound emotional mastery as you learn to channel intensity constructively.',
          'As you mature, you develop extraordinary psychological insight and emotional resilience. Your Saturn-tested understanding of transformation makes you a powerful healer, therapist, or leader who has genuinely walked through fire and emerged stronger.',
        ],
      },
    ],
  },
  sagittarius: {
    headline: 'Saturn in Sagittarius: Mastering Belief',
    intro: 'With Saturn in Sagittarius, your life lessons center on the responsible use of faith, the discipline of genuine philosophical inquiry, and learning to build a worldview that withstands real-world testing.',
    sections: [
      {
        title: 'Life Lessons & Karmic Challenges',
        icon: '📜',
        paragraphs: [
          'Saturn in Sagittarius teaches you that faith must be earned through genuine inquiry, not adopted as a comfortable escape from reality. You may struggle with questions of meaning, purpose, and belief — experiencing crises of faith, disillusionment with authority figures, or the painful recognition that your inherited worldview needs revision.',
          'Your karmic task is to build a philosophy that is both expansive and structurally sound. You are learning to distinguish between blind optimism and genuine faith, between grandiose ambition and meaningful purpose, and between dogmatic certainty and wisdom that has been tested by experience.',
        ],
      },
      {
        title: 'Discipline & Maturity Path',
        icon: '🏔',
        paragraphs: [
          'Your maturity arrives through the development of genuine, tested wisdom. Early crises of faith give way to a philosophical framework that is deeper, more nuanced, and more resilient than naive optimism could ever be.',
          'As you mature, you become a genuine teacher and wisdom figure whose philosophical insights carry the weight of real experience. Your faith is unshakeable precisely because it has been tested and refined through Saturn\'s demanding curriculum.',
        ],
      },
    ],
  },
  capricorn: {
    headline: 'Saturn in Capricorn: Mastering Authority',
    intro: 'Saturn is at home in Capricorn, making this one of the most powerful and naturally expressed Saturn placements. With Saturn in Capricorn, your life lessons center on authority, responsibility, and the patient building of structures that endure beyond a single lifetime. You are here to build something that lasts.',
    sections: [
      {
        title: 'Life Lessons & Karmic Challenges',
        icon: '📜',
        paragraphs: [
          'Saturn in Capricorn teaches you that genuine authority is earned through demonstrated competence and ethical conduct. You may feel the weight of responsibility from a young age, experiencing pressure to achieve, to be mature beyond your years, or to shoulder burdens that others avoid.',
          'Your karmic task is to develop leadership that is both powerful and ethical. You are learning to use authority wisely, to build institutions that serve rather than oppress, and to accept the loneliness that sometimes accompanies genuine leadership.',
        ],
      },
      {
        title: 'Discipline & Maturity Path',
        icon: '🏔',
        paragraphs: [
          'Your maturity is a lifelong ascent toward genuine mastery. Early life may feel heavy with obligation and delayed gratification, but each year adds to the mountain of achievement you are steadily building. Saturn rewards you handsomely in the second half of life.',
          'As you mature, you become a genuine authority — respected, accomplished, and possessed of a wisdom that comes only from decades of disciplined effort. Your legacy is the structures, institutions, and standards of excellence you leave behind.',
        ],
      },
    ],
  },
  aquarius: {
    headline: 'Saturn in Aquarius: Mastering Progress',
    intro: 'Saturn is at home in Aquarius, giving this placement a powerful combination of visionary thinking and practical discipline. With Saturn in Aquarius, your life lessons center on social responsibility, the structured implementation of progressive ideas, and learning to balance individuality with community obligation.',
    sections: [
      {
        title: 'Life Lessons & Karmic Challenges',
        icon: '📜',
        paragraphs: [
          'Saturn in Aquarius teaches you that genuine progress requires structure, patience, and the willingness to work within systems even while seeking to reform them. You may struggle with feeling like an outsider, with the tension between conformity and rebellion, or with the challenge of translating visionary ideas into practical reality.',
          'Your karmic task is to become a disciplined agent of change. You are learning that revolution without structure creates chaos, that true progress is incremental, and that the most effective reformers are those who understand the systems they seek to change.',
        ],
      },
      {
        title: 'Discipline & Maturity Path',
        icon: '🏔',
        paragraphs: [
          'Your maturity arrives through the development of disciplined, practical progressivism. Early experiences of alienation and idealistic frustration give way to a more effective, structured approach to creating the change you want to see.',
          'As you mature, you become a builder of new systems — someone who combines visionary thinking with practical execution to create institutions, technologies, or communities that genuinely serve human progress.',
        ],
      },
    ],
  },
  pisces: {
    headline: 'Saturn in Pisces: Mastering Faith',
    intro: 'With Saturn in Pisces, your life lessons center on the discipline of faith, the responsible use of spiritual sensitivity, and learning to maintain boundaries while remaining compassionate. Saturn asks you to ground your vast spiritual and emotional gifts in practical reality.',
    sections: [
      {
        title: 'Life Lessons & Karmic Challenges',
        icon: '📜',
        paragraphs: [
          'Saturn in Pisces teaches you that spiritual depth requires discipline, not just sensitivity. You may struggle with boundaries, escapist tendencies, or the overwhelming weight of empathy that absorbs the suffering of the world. These challenges push you to develop practical tools for managing your extraordinary emotional and spiritual gifts.',
          'Your karmic task is to bring structure to your spiritual life. You are learning to meditate rather than just dream, to serve rather than just sympathize, and to channel your vast compassion into tangible actions that make a real difference rather than dissolving into helpless empathy.',
        ],
      },
      {
        title: 'Discipline & Maturity Path',
        icon: '🏔',
        paragraphs: [
          'Your maturity arrives through the development of disciplined spiritual practice and healthy emotional boundaries. Early struggles with escapism, confusion, or emotional overwhelm give way to a grounded, practical spirituality that channels sensitivity into genuine healing.',
          'As you mature, you become a powerful bridge between the spiritual and the practical — a grounded mystic, a disciplined healer, or a compassionate leader who translates transcendent wisdom into everyday kindness and service.',
        ],
      },
    ],
  },
};

/* ── Lookup function ──────────────────────────────────────────── */

export function getSaturnSignContent(sign: ZodiacSign): SaturnSignContent {
  const data = SATURN_CONTENT[sign];
  return { sign, ...data };
}
