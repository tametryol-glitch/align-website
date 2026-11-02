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
    intro: 'You have a bold streak and a brake pedal that keeps catching. Early on you either charge in too hard or hold back for fear of conflict, and over the years you learn when to move and when to wait.',
    sections: [
      {
        title: 'Life Lessons & Karmic Challenges',
        icon: '📜',
        paragraphs: [
          'You learn that courage is not the absence of fear but the discipline to act wisely in spite of it. You may struggle with assertiveness early in life, either overcompensating with aggression or shrinking from conflict. The way through is the middle path between recklessness and timidity.',
          'You are learning to take initiative without bulldozing others, to lead without dominating, and to compete without losing your integrity. Every time you act from genuine courage rather than ego, you strengthen the habit that will eventually become your greatest asset.',
        ],
      },
      {
        title: 'Discipline & Maturity Path',
        icon: '🏔',
        paragraphs: [
          'You mature when you learn strategic patience. When you were younger you rushed headlong into situations that needed more planning. Over time you pair your boldness with preparation, and you become someone both brave and wise.',
          'What you need is impulse control: not putting your fire out, but mastering its timing. Over the years your initiative gets more targeted, your leadership more effective, and your courage more heroic because it serves something bigger than your ego.',
        ],
      },
    ],
  },
  taurus: {
    headline: 'Saturn in Taurus: Mastering Security',
    intro: 'You worry about money and your own worth more than you admit. Whether you hoard or overspend, the lesson is the same: real security gets built by steady work, not grabbed.',
    sections: [
      {
        title: 'Life Lessons & Karmic Challenges',
        icon: '📜',
        paragraphs: [
          'You learn that true security comes from within. You may experience financial limitations, scarcity, or a deep-seated fear that there is never enough. These challenges are not punishments; they push you to build a sense of self-worth that no circumstance can take from you.',
          'What you are building is a healthy relationship with material resources: neither hoarding them out of fear nor squandering them through carelessness. You are learning that abundance flows when you trust your ability to create value through consistent, disciplined effort.',
        ],
      },
      {
        title: 'Discipline & Maturity Path',
        icon: '🏔',
        paragraphs: [
          'You mature as your money sense and self-reliance get rock solid. Early struggles with money or resources teach you to budget, plan, and build wealth methodically. Over time, that discipline turns early scarcity into steadier abundance.',
          'Later on, your relationship with material security softens. You learn to enjoy what you have without anxiety about losing it, to share generously without fear of depletion, and to find security in your own competence rather than in your bank account.',
        ],
      },
    ],
  },
  gemini: {
    headline: 'Saturn in Gemini: Mastering the Mind',
    intro: 'You think hard before you speak and worry about sounding stupid. That pressure pushes you from skimming a hundred topics to knowing a few of them better than anyone.',
    sections: [
      {
        title: 'Life Lessons & Karmic Challenges',
        icon: '📜',
        paragraphs: [
          'You learn that words carry weight and consequences. You may struggle with communication challenges: difficulty expressing yourself clearly, fear of being misunderstood, or anxiety around intellectual performance. These challenges push you to develop exceptional clarity and precision in your thinking.',
          'The move you are making is from scattered curiosity toward focused mastery. You are learning to think deeply rather than broadly, to speak with authority rather than nervousness, and to use your considerable mental gifts with the discipline and responsibility they deserve.',
        ],
      },
      {
        title: 'Discipline & Maturity Path',
        icon: '🏔',
        paragraphs: [
          'Your mind sharpens with age as you build real intellectual rigor. Early communication anxieties transform into exceptional precision and authority as you learn to master your mental gifts through study, practice, and the patient development of genuine expertise.',
          'With age your thinking gets more structured and sharper. You develop the ability to communicate complex ideas with clarity and impact, and your intellectual contributions carry the weight of someone who has earned their knowledge through disciplined effort.',
        ],
      },
    ],
  },
  cancer: {
    headline: 'Saturn in Cancer: Mastering Emotional Security',
    intro: 'You grew up fast emotionally and learned early to look after yourself. The work now is building your own sense of safety instead of waiting for someone else to supply it.',
    sections: [
      {
        title: 'Life Lessons & Karmic Challenges',
        icon: '📜',
        paragraphs: [
          'You learn that emotional security must be built from the inside out. You may have experienced early life challenges around family, home, or emotional availability: perhaps a cold or absent parent, frequent moves, or a sense that you had to grow up too fast emotionally.',
          'You have to become your own nurturing parent. You are learning to provide for yourself the emotional safety that may not have been consistently available in childhood. This is not about suppressing your feelings; it is about holding your own vulnerability with strength and compassion.',
        ],
      },
      {
        title: 'Discipline & Maturity Path',
        icon: '🏔',
        paragraphs: [
          'You grow up by becoming emotionally self-sufficient and deliberately building your own home and family life. Over time, you transform childhood wounds into extraordinary emotional strength and resilience.',
          'In time you become a pillar of emotional stability for others. Your hard-won wisdom makes you a steady counselor, parent and friend. The security you build is genuine and lasting because it was forged through real experience rather than handed to you.',
        ],
      },
    ],
  },
  leo: {
    headline: 'Saturn in Leo: Mastering Authentic Expression',
    intro: 'You want to be seen and you are scared of being caught wanting it. The work is to create and lead from real confidence, not from the need for applause.',
    sections: [
      {
        title: 'Life Lessons & Karmic Challenges',
        icon: '📜',
        paragraphs: [
          'You learn that true confidence comes from within. You may struggle with self-expression: feeling inhibited, blocked creatively, or painfully self-conscious about seeking attention. Early life may have included experiences that made you feel invisible, unspecial, or ashamed of wanting recognition.',
          'What you are after is self-expression that does not depend on audience approval. You are learning to create for the sake of creation, to lead because it serves others, and to express yourself because your light is genuine, not because you need others to validate your existence.',
        ],
      },
      {
        title: 'Discipline & Maturity Path',
        icon: '🏔',
        paragraphs: [
          'You come into your own as your creative mastery and inner confidence become real. Early creative blocks and self-consciousness give way to powerful, disciplined self-expression as you learn to create from authenticity rather than approval-seeking.',
          'Your creative work gets more authoritative with the years. The confidence you earn is real: it does not inflate from praise or deflate from criticism. You become a creative force whose influence endures because it rests on substance rather than spectacle.',
        ],
      },
    ],
  },
  virgo: {
    headline: 'Saturn in Virgo: Mastering Sacred Craft',
    intro: 'Your inner critic never clocks out. You check things twice, fear getting it wrong, and slowly turn that anxiety into a skill people rely on.',
    sections: [
      {
        title: 'Life Lessons & Karmic Challenges',
        icon: '📜',
        paragraphs: [
          'You learn the difference between healthy perfectionism and paralyzing self-criticism. You may struggle with anxiety, health concerns, or a relentless inner critic that tells you nothing is ever good enough. These challenges sharpen an already considerable analytical gift.',
          'Stop obsessing over perfection for its own sake and work because the craft deserves your best. From the outside the two look the same, but one version drains you and the other builds you.',
        ],
      },
      {
        title: 'Discipline & Maturity Path',
        icon: '🏔',
        paragraphs: [
          'Anxiety turns into expertise as you get older. Early struggles with perfectionism and self-doubt give way to genuine mastery as you learn to channel your analytical gifts into productive, purposeful work rather than corrosive self-criticism.',
          'Eventually you become an authority in your field, someone whose attention to detail and devoted work ethic produces exceptional results. Your precision turns into an advantage instead of a source of suffering.',
        ],
      },
    ],
  },
  libra: {
    headline: 'Saturn in Libra: Mastering Partnership',
    intro: 'You take commitment seriously, sometimes too seriously to jump in. Relationships teach you the difference between keeping the peace and having real balance, and over the years you become someone who builds partnerships that last.',
    sections: [
      {
        title: 'Life Lessons & Karmic Challenges',
        icon: '📜',
        paragraphs: [
          'You learn that real partnership requires discipline, commitment, and the courage to address imbalance. You may experience challenges in relationships: difficulty finding a partner, struggles with fairness, or the painful recognition that keeping the peace is not the same as maintaining genuine harmony.',
          'You are here to learn committed partnership properly, which means building relationships that are structurally sound, based on genuine equality, mutual respect, and the willingness to do the hard work that lasting love requires.',
        ],
      },
      {
        title: 'Discipline & Maturity Path',
        icon: '🏔',
        paragraphs: [
          'You learn what makes a relationship work. Early romantic struggles teach you invaluable lessons about commitment, boundaries, and the difference between codependency and genuine partnership.',
          'People start to look at your relationships as the example. They last because they rest on mutual respect, clear communication, and the hard-won understanding that love is a practice, not just a feeling.',
        ],
      },
    ],
  },
  scorpio: {
    headline: 'Saturn in Scorpio: Mastering Transformation',
    intro: 'You do not trust easily and you do not let go easily. The work is facing your fears and your need for control, and coming out stronger on the other side.',
    sections: [
      {
        title: 'Life Lessons & Karmic Challenges',
        icon: '📜',
        paragraphs: [
          'You learn that emotional intensity is a power that must be handled with responsibility. You may struggle with issues of trust, control, shared resources, or deep psychological patterns that feel impossible to change. These challenges are a crucible that forges emotional resilience.',
          'The job is to master transformation: not to avoid crisis but to develop the emotional discipline to walk through it consciously. You are learning that power does not require control, that trust can coexist with vigilance, and that the darkest experiences can produce the most luminous wisdom.',
        ],
      },
      {
        title: 'Discipline & Maturity Path',
        icon: '🏔',
        paragraphs: [
          'You mature through repeated endings and fresh starts, letting go of what no longer serves you with increasing grace. Early power struggles and trust issues give way to profound emotional mastery as you learn to channel intensity constructively.',
          'You end up with real psychological insight and resilience. Having come through your own endings makes you a powerful healer, therapist or leader, someone who has genuinely walked through fire and come out stronger.',
        ],
      },
    ],
  },
  sagittarius: {
    headline: 'Saturn in Sagittarius: Mastering Belief',
    intro: 'You have had to rebuild what you believe at least once. Faith, meaning and certainty get tested, and what survives becomes a worldview you can actually live on.',
    sections: [
      {
        title: 'Life Lessons & Karmic Challenges',
        icon: '📜',
        paragraphs: [
          'You learn that faith must be earned through genuine inquiry, not adopted as a comfortable escape from reality. You may struggle with questions of meaning, purpose, and belief: experiencing crises of faith, disillusionment with authority figures, or the painful recognition that your inherited worldview needs revision.',
          'The work is to build a philosophy that is both expansive and structurally sound. You are learning to distinguish between blind optimism and genuine faith, between grandiose ambition and meaningful purpose, and between dogmatic certainty and wisdom that has been tested by experience.',
        ],
      },
      {
        title: 'Discipline & Maturity Path',
        icon: '🏔',
        paragraphs: [
          'You mature as your beliefs get tested and what survives turns into wisdom. Early crises of faith give way to a philosophical framework that is deeper, more nuanced, and more resilient than naive optimism could ever be.',
          'Eventually you become a genuine teacher whose insights carry the weight of real experience. Your faith holds precisely because it has been tested and refined by hard years.',
        ],
      },
    ],
  },
  capricorn: {
    headline: 'Saturn in Capricorn: Mastering Authority',
    intro: 'You felt the weight of responsibility early, usually earlier than your friends did. You are here to build something that outlasts you, and you pay for it in patience first.',
    sections: [
      {
        title: 'Life Lessons & Karmic Challenges',
        icon: '📜',
        paragraphs: [
          'You learn that genuine authority is earned through demonstrated competence and ethical conduct. You may feel the weight of responsibility from a young age, experiencing pressure to achieve, to be mature beyond your years, or to shoulder burdens that others avoid.',
          'You are here to lead in a way that is both powerful and ethical. You are learning to use authority wisely, to build institutions that serve rather than oppress, and to accept the loneliness that sometimes accompanies genuine leadership.',
        ],
      },
      {
        title: 'Discipline & Maturity Path',
        icon: '🏔',
        paragraphs: [
          'Your maturity is a lifelong ascent toward genuine mastery. Early life may feel heavy with obligation and delayed gratification, but each year adds to the mountain of achievement you are steadily building. The second half of life tends to pay you back for the first.',
          'Over the decades you become a genuine authority: respected, accomplished, and wise in the way only years of disciplined effort make you. Your legacy is the structures and standards you leave behind.',
        ],
      },
    ],
  },
  aquarius: {
    headline: 'Saturn in Aquarius: Mastering Progress',
    intro: 'You feel like an outsider in groups you care about, and you want to change things without burning them down. The work is building the structure that lets your ideas land.',
    sections: [
      {
        title: 'Life Lessons & Karmic Challenges',
        icon: '📜',
        paragraphs: [
          'You learn that genuine progress requires structure, patience, and the willingness to work within systems even while seeking to reform them. You may struggle with feeling like an outsider, with the tension between conformity and rebellion, or with the challenge of translating visionary ideas into practical reality.',
          'You are becoming a disciplined agent of change. You are learning that revolution without structure creates chaos, that true progress is incremental, and that the most effective reformers are those who understand the systems they seek to change.',
        ],
      },
      {
        title: 'Discipline & Maturity Path',
        icon: '🏔',
        paragraphs: [
          'You mature by turning big ideas into disciplined, practical action. Early experiences of alienation and idealistic frustration give way to a more effective, structured approach to creating the change you want to see.',
          'In time you become a builder of new systems, someone who combines visionary thinking with practical execution to create institutions, technologies or communities that genuinely help people.',
        ],
      },
    ],
  },
  pisces: {
    headline: 'Saturn in Pisces: Mastering Faith',
    intro: 'You soak up other people\'s pain and sometimes vanish into daydreams or escape to cope. The work is giving your sensitivity a spine, with boundaries, routines and practice that turn it into real help.',
    sections: [
      {
        title: 'Life Lessons & Karmic Challenges',
        icon: '📜',
        paragraphs: [
          'You learn that spiritual depth requires discipline, not just sensitivity. You may struggle with boundaries, escapist tendencies, or the overwhelming weight of empathy that absorbs the suffering of the world. These challenges push you to develop practical tools for managing your extraordinary emotional and spiritual gifts.',
          'You need to bring structure to your spiritual life. You are learning to meditate rather than just dream, to serve rather than just sympathize, and to channel your vast compassion into tangible actions that make a real difference rather than dissolving into helpless empathy.',
        ],
      },
      {
        title: 'Discipline & Maturity Path',
        icon: '🏔',
        paragraphs: [
          'You mature as you build a steady spiritual practice and firmer emotional boundaries. Early struggles with escapism, confusion, or emotional overwhelm give way to a grounded, practical spirituality that channels sensitivity into genuine healing.',
          'You grow into a bridge between the spiritual and the practical: a grounded mystic, a disciplined healer, or a compassionate leader who turns transcendent wisdom into everyday kindness and service.',
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
