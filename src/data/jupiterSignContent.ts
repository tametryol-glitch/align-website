/* ──────────────────────────────────────────────────────────────
   Jupiter Sign Content
   SEO-rich astrological content for all 12 Jupiter sign pages.
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

export interface JupiterSignContent {
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

export const JUPITER_SYMBOL = '♃';

/* ── Content for each Jupiter sign ────────────────────────────── */

const JUPITER_CONTENT: Record<ZodiacSign, Omit<JupiterSignContent, 'sign'>> = {
  aries: {
    headline: 'Jupiter in Aries: Bold Expansion',
    intro: 'You get lucky by moving first. You apply, ask, pitch and leap before you feel ready, and the doors that open for you are mostly the ones you pushed on.',
    sections: [
      {
        title: 'Growth & Abundance',
        icon: '🌟',
        paragraphs: [
          'You grow through action and initiative. Your greatest opportunities come when you charge ahead without waiting for permission or consensus. You are lucky when you are brave: the more boldly you act, the more doors open.',
          'Your growth philosophy is rooted in self-reliance and pioneering spirit. You believe that you create your own luck through effort, courage, and the willingness to go where others fear to tread. Your own experience keeps confirming it.',
        ],
      },
      {
        title: 'Philosophy & Worldview',
        icon: '🔮',
        paragraphs: [
          'You see life as an adventure meant to be seized. You believe the universe rewards initiative and that obstacles exist to be overcome. You take responsibility for your own results and trust direct experience over secondhand advice.',
          'Warrior traditions, personal empowerment and the heroic journey speak to you. Passive, fatalistic worldviews repel you; you need a belief system that backs action and celebrates courage.',
        ],
      },
    ],
  },
  taurus: {
    headline: 'Jupiter in Taurus: Abundant Prosperity',
    intro: 'Your luck arrives slowly and then stays. You buy the good thing once, keep the skill you spent years on, and wait out the market while others panic, and over time money and comfort tend to build.',
    sections: [
      {
        title: 'Growth & Abundance',
        icon: '🌟',
        paragraphs: [
          'You grow through steady accumulation and appreciation of the physical world. Your greatest opportunities come through investments that grow over time, ventures built on solid foundations, and the patient development of valuable skills and resources.',
          'You have an instinct for value: what is worth buying, when to hold, and how to build slowly. Your prosperity comes from compounding, not windfalls.',
        ],
      },
      {
        title: 'Philosophy & Worldview',
        icon: '🔮',
        paragraphs: [
          'You trust the earth and its rhythms. You believe it provides for people who work with it, and you hold gratitude, sensory pleasure and well-made things sacred.',
          'Earth-based spirituality and traditions that honor the body and natural cycles appeal to you. You find wisdom in simplicity and believe contentment is the highest form of wealth.',
        ],
      },
    ],
  },
  gemini: {
    headline: 'Jupiter in Gemini: Expansive Curiosity',
    intro: 'You get your breaks through people and information. A conversation at a party, a link you sent, a skill you picked up on a whim, and somehow it turns into work, a friend or an offer.',
    sections: [
      {
        title: 'Growth & Abundance',
        icon: '🌟',
        paragraphs: [
          'You grow through information, communication, and social connection. Your greatest opportunities come through networking, learning new skills, and positioning yourself at the intersection of different fields. You are lucky when you are learning and connecting.',
          'Abundance flows to you through versatility and communication. Writing, teaching, speaking, selling, and any activity that involves the exchange of information can be a source of prosperity. Your ability to translate between different audiences is a genuine competitive advantage.',
        ],
      },
      {
        title: 'Philosophy & Worldview',
        icon: '🔮',
        paragraphs: [
          'You stay curious and adaptable, and you treat learning as the point of life. You believe knowledge is the greatest wealth and that a busy mind keeps you well. You collect perspectives instead of claiming a single truth.',
          'You borrow from many traditions and enjoy mixing ideas from different cultures and fields. You may change your whole framework several times in your life, and each version adds something.',
        ],
      },
    ],
  },
  cancer: {
    headline: 'Jupiter in Cancer: Nurturing Abundance',
    intro: 'Your luck lives at home. When your family is steady and your house feels safe, money, work and health tend to line up, and you give so freely to the people you love that it comes back to you multiplied.',
    sections: [
      {
        title: 'Growth & Abundance',
        icon: '🌟',
        paragraphs: [
          'You grow through emotional connection, family bonds, and the creation of safe, nurturing environments. Your greatest opportunities come through real estate, food, family business, or any venture that serves people\'s fundamental need for belonging and security.',
          'Your abundance is intimately connected to your home and family life. When your domestic world is thriving, everything else prospers. Investing in your home, maintaining close family ties, and creating environments of emotional safety are not just personal preferences, they are how you prosper.',
        ],
      },
      {
        title: 'Philosophy & Worldview',
        icon: '🔮',
        paragraphs: [
          'You believe love is the strongest force there is. Caring for others is more than a moral good to you; it feels like a law of life, and what you give emotionally comes back to you multiplied.',
          'Ancestral wisdom, family traditions and spiritual practice at the home and hearth pull you in. You honor the past, trust feeling over theory, and see your family as the place where the divine is most real.',
        ],
      },
    ],
  },
  leo: {
    headline: 'Jupiter in Leo: Radiant Expansion',
    intro: 'You get lucky when you are visible. You say yes to the stage, the pitch and the party, you share what you made without apologising, and your generosity pulls opportunities toward you.',
    sections: [
      {
        title: 'Growth & Abundance',
        icon: '🌟',
        paragraphs: [
          'You grow through creativity, leadership, and generous self-expression. Your greatest opportunities come when you step into the spotlight, share your unique talents, and inspire others with your enthusiasm and warmth. You are lucky when you are being your most authentic, expressive self.',
          'Abundance flows to you through entertainment, children, creative ventures, and leadership positions. Your natural charisma attracts opportunities, and your generosity creates a positive cycle: the more you give, the more returns to you.',
        ],
      },
      {
        title: 'Philosophy & Worldview',
        icon: '🔮',
        paragraphs: [
          'You believe life is meant to be enjoyed, that creativity is a divine gift, and that every person has a light to share. Joy, self-expression and love are your answer to most things.',
          'Spiritual traditions that celebrate the divine spark in every person, and treat creative expression as worship, feel like home. You find God in art, music, performance, and the joyful experience of being alive.',
        ],
      },
    ],
  },
  virgo: {
    headline: 'Jupiter in Virgo: Growth Through Service',
    intro: 'You get ahead by being the person who actually fixes the problem. You keep improving the system, the routine and the craft, and the quiet, careful work you do for others is what eventually pays you back.',
    sections: [
      {
        title: 'Growth & Abundance',
        icon: '🌟',
        paragraphs: [
          'You grow through service, health, and meticulous improvement. Your greatest opportunities come when you focus on being genuinely useful: solving real problems, improving existing systems, and offering practical help that makes a tangible difference in people\'s lives.',
          'Your prosperity comes from dedication, not charm. When you commit fully to your craft and treat the work as something that matters, resources flow in to support what you are building.',
        ],
      },
      {
        title: 'Philosophy & Worldview',
        icon: '🔮',
        paragraphs: [
          'You believe small, consistent efforts compound into extraordinary results, and that life rewards people who serve with humility and precision.',
          'Mindful living, health-based spiritual practice and traditions that find the sacred in the everyday suit you. You find wisdom in routine and satisfaction in work done well.',
        ],
      },
    ],
  },
  libra: {
    headline: 'Jupiter in Libra: Expansion Through Partnership',
    intro: 'Your best breaks come through another person. A partner, a business ally or a fair deal opens doors you cannot open alone, and you do better when you share the load with someone who is truly your equal.',
    sections: [
      {
        title: 'Growth & Abundance',
        icon: '🌟',
        paragraphs: [
          'You grow through collaboration, partnership, and the creation of fair, beautiful systems. Your greatest opportunities come through relationships: business partnerships, marriage and collaborations where your diplomacy creates mutual benefit.',
          'Your luck is tied to committed partnership. You do best when you invest in equal, mutually supportive relationships. Solo ventures can work, but you flourish next to a partner who covers what you lack.',
        ],
      },
      {
        title: 'Philosophy & Worldview',
        icon: '🔮',
        paragraphs: [
          'You believe the universe is fundamentally balanced and that harmony is the natural state of things. You put cooperation ahead of competition and treat beauty as evidence of truth.',
          'Legal philosophy, aesthetic traditions and a spiritual life lived as partnership with the divine appeal to you. You find wisdom in balance and meaning in the pursuit of justice and beauty.',
        ],
      },
    ],
  },
  scorpio: {
    headline: 'Jupiter in Scorpio: Transformative Abundance',
    intro: 'You do your best when things fall apart. While other people back away from a crisis, a secret or a loss, you step in, dig around and come out with something valuable.',
    sections: [
      {
        title: 'Growth & Abundance',
        icon: '🌟',
        paragraphs: [
          'You grow through transformation, shared resources, and the mastery of hidden knowledge. Your greatest opportunities come during times of crisis and change: when others retreat in fear, you advance, finding treasure in the ruins.',
          'Money tends to reach you through shared resources, investments or work that deals with transformation: psychology, surgery, investigation, finance, or managing other people\'s assets. You have an instinct for finding value where others see only darkness.',
        ],
      },
      {
        title: 'Philosophy & Worldview',
        icon: '🔮',
        paragraphs: [
          'You do not look away from life\'s shadow side. You believe that true growth requires confronting uncomfortable truths, that power comes from self-knowledge, and that the deepest wisdom is found in the darkest places.',
          'Esoteric traditions, depth psychology and practices built around death and rebirth pull you in. You find meaning in shadow work and in the alchemical turning of lead into gold.',
        ],
      },
    ],
  },
  sagittarius: {
    headline: 'Jupiter in Sagittarius: Limitless Horizons',
    intro: 'You say yes to the trip, the course and the stranger, and it keeps paying off. Your optimism is huge, opportunities find you from far away, and because you expect good things you take the risks that bring them.',
    sections: [
      {
        title: 'Growth & Abundance',
        icon: '🌟',
        paragraphs: [
          'You grow through adventure, education, and the relentless pursuit of truth. Your greatest opportunities come through travel, higher education, publishing, philosophy, and cross-cultural exchange. The wider your world, the greater your abundance.',
          'You are lucky in ways other people notice. Opportunities seem to find you, often arriving from unexpected directions and foreign sources. Your faith in positive outcomes functions as a self-fulfilling prophecy: because you expect good things, you take the risks that bring them into being.',
        ],
      },
      {
        title: 'Philosophy & Worldview',
        icon: '🔮',
        paragraphs: [
          'You believe life is a grand adventure, that truth exists and is worth chasing, and that every experience, even the painful ones, adds to the soul\'s growth. Your faith in meaning gives you remarkable resilience.',
          'Religions, philosophies, world travel and higher education all pull you in. You are a natural teacher, and people leave your company with a bigger idea of what life can be.',
        ],
      },
    ],
  },
  capricorn: {
    headline: 'Jupiter in Capricorn: Disciplined Growth',
    intro: 'Your luck is the slow kind. You turn up, do the work, keep your word and plan ten years ahead, and the promotions and openings come after people have watched you be reliable long enough.',
    sections: [
      {
        title: 'Growth & Abundance',
        icon: '🌟',
        paragraphs: [
          'You grow through structure, discipline, and institutional achievement. Your greatest opportunities come through established channels: career advancement, strategic investments and the slow building of a professional reputation.',
          'Your abundance is earned rather than gifted. You attract prosperity through competence, reliability, and a track record of excellence. Growth starts slower for you, but what you build has solid foundations and lasts.',
        ],
      },
      {
        title: 'Philosophy & Worldview',
        icon: '🔮',
        paragraphs: [
          'You believe success is built through effort, that character is revealed through adversity, and that the most meaningful achievements are the ones that benefit future generations.',
          'Stoic philosophy, traditional wisdom and spiritual practice built on duty and the long view suit you. You find meaning in responsibility and in patiently mastering your craft.',
        ],
      },
    ],
  },
  aquarius: {
    headline: 'Jupiter in Aquarius: Progressive Expansion',
    intro: 'You get your breaks through groups. You join the project, the movement or the online community nobody else has noticed yet, you share your odd ideas, and the people you gather around you become the source of your luck.',
    sections: [
      {
        title: 'Growth & Abundance',
        icon: '🌟',
        paragraphs: [
          'You grow through innovation, technology, and community action. Your greatest opportunities come through group ventures, humanitarian projects, and fields that are shaping the future: technology, social enterprise and systemic reform.',
          'Your abundance is tied to your network and your ideas. You attract prosperity when you connect with communities that share your vision and when you apply your innovative thinking to real-world problems. Your luck increases as your network grows.',
        ],
      },
      {
        title: 'Philosophy & Worldview',
        icon: '🔮',
        paragraphs: [
          'You are optimistic about human potential. You believe collective action can solve even the most intractable problems and that technology and innovation can free people instead of controlling them.',
          'Futurism, humanitarian philosophy and traditions about collective evolution speak to you. You find meaning in serving humanity.',
        ],
      },
    ],
  },
  pisces: {
    headline: 'Jupiter in Pisces: Boundless Grace',
    intro: 'Your luck shows up when you stop forcing things. You follow a hunch, help someone for nothing and trust a dream or a coincidence, and the right person or opening arrives that no plan would have found.',
    sections: [
      {
        title: 'Growth & Abundance',
        icon: '🌟',
        paragraphs: [
          'You grow through faith, compassion, and creative surrender. Your greatest opportunities come when you trust the flow of life, follow your intuition, and open yourself to possibilities that defy rational planning. Your luck arrives through synchronicity, dreams and moments of grace.',
          'Abundance flows to you through the arts, healing professions, spiritual service, and any work that connects you to the transcendent. Your generosity and compassion create a positive cycle: the more you give from the heart, the more comes back.',
        ],
      },
      {
        title: 'Philosophy & Worldview',
        icon: '🔮',
        paragraphs: [
          'You trust life. You believe the universe is kind, that all beings are connected, and that love holds reality together. This faith gives you a serenity and resilience that others find deeply comforting.',
          'Mystical traditions and contemplative practices that dissolve the ego appeal to you. You find God in the ocean, in music, in dreams, and in the eyes of people who are suffering.',
        ],
      },
    ],
  },
};

/* ── Lookup function ──────────────────────────────────────────── */

export function getJupiterSignContent(sign: ZodiacSign): JupiterSignContent {
  const data = JUPITER_CONTENT[sign];
  return { sign, ...data };
}
