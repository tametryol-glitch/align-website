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
          'You grow through action and initiative. Your greatest opportunities come when you charge ahead without waiting for permission or consensus. You are lucky when you are brave — the more boldly you act, the more the universe conspires to support you.',
          'Your growth philosophy is rooted in self-reliance and pioneering spirit. You believe that you create your own luck through effort, courage, and the willingness to go where others fear to tread. This conviction is not just philosophical — it is consistently confirmed by your experience.',
        ],
      },
      {
        title: 'Philosophy & Worldview',
        icon: '🔮',
        paragraphs: [
          'Your worldview is optimistic, individualistic, and action-oriented. You believe that the universe rewards initiative and that obstacles exist to be overcome. Your philosophy emphasizes personal responsibility, direct experience over secondhand knowledge, and the idea that life is an adventure meant to be seized.',
          'You are drawn to philosophies and spiritual traditions that emphasize personal empowerment, warrior traditions, and the heroic journey. Passive, fatalistic worldviews repel you — you need a philosophy that validates action and celebrates courage.',
        ],
      },
    ],
  },
  taurus: {
    headline: 'Jupiter in Taurus: Abundant Prosperity',
    intro: 'Your luck arrives slowly and then stays. You buy the good thing once, keep the skill you spent years on, and wait out the market while others panic, and over time the money and comfort pile up.',
    sections: [
      {
        title: 'Growth & Abundance',
        icon: '🌟',
        paragraphs: [
          'You grow through steady accumulation and appreciation of the physical world. Your greatest opportunities come through investments that grow over time, ventures built on solid foundations, and the patient development of valuable skills and resources.',
          'Money comes naturally to you. You have an instinct for value — knowing what is worth investing in, when to hold, and how to grow wealth steadily over time. Your prosperity is not about windfalls but about compound growth.',
        ],
      },
      {
        title: 'Philosophy & Worldview',
        icon: '🔮',
        paragraphs: [
          'Your worldview is grounded, abundant, and deeply connected to the natural world. You believe that the earth provides generously for those who work with its rhythms. Your philosophy emphasizes gratitude, sensory pleasure, and the sacred value of material creation.',
          'You are drawn to earth-based spirituality, philosophies of abundance, and traditions that honor the physical body and natural cycles. You find wisdom in simplicity and believe that contentment is the highest form of wealth.',
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
          'Your worldview is curious, adaptable, and fundamentally oriented toward learning. You believe that knowledge is the greatest form of wealth and that staying mentally active is the key to a fulfilling life. Your philosophy embraces multiple perspectives rather than claiming a single truth.',
          'You are drawn to diverse philosophical traditions, enjoying the cross-pollination of ideas from different cultures and disciplines. You may change your philosophical framework several times in your life, and each iteration enriches your understanding.',
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
          'Your abundance is intimately connected to your home and family life. When your domestic world is thriving, everything else prospers. Investing in your home, maintaining close family ties, and creating environments of emotional safety are not just personal preferences — they are prosperity strategies.',
        ],
      },
      {
        title: 'Philosophy & Worldview',
        icon: '🔮',
        paragraphs: [
          'Your worldview is nurturing, family-centered, and rooted in the belief that love is the most powerful force in the universe. You believe that caring for others is not just a moral good but a cosmic law — what you give emotionally returns to you multiplied.',
          'You are drawn to ancestral wisdom, family traditions, and spiritual practices rooted in the home and hearth. Your philosophy honors the past, values emotional intelligence, and sees the family unit as a microcosm of divine love.',
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
          'Abundance flows to you through entertainment, children, creative ventures, and leadership positions. Your natural charisma attracts opportunities, and your generosity creates a positive cycle — the more you give, the more returns to you.',
        ],
      },
      {
        title: 'Philosophy & Worldview',
        icon: '🔮',
        paragraphs: [
          'Your worldview is optimistic, creative, and celebratory. You believe that life is meant to be enjoyed, that creativity is a divine gift, and that every person has a unique light to share with the world. Your philosophy emphasizes joy, self-expression, and the transformative power of love.',
          'You are drawn to spiritual traditions that celebrate the divine spark in every individual and that encourage creative expression as a form of worship. You find God in art, music, performance, and the joyful experience of being alive.',
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
          'You grow through service, health, and meticulous improvement. Your greatest opportunities come when you focus on being genuinely useful — solving real problems, improving existing systems, and offering practical help that makes a tangible difference in people\'s lives.',
          'Your prosperity comes from dedication, not charm. When you commit fully to your craft and treat the work as something that matters, resources flow in to support what you are building.',
        ],
      },
      {
        title: 'Philosophy & Worldview',
        icon: '🔮',
        paragraphs: [
          'Your worldview is practical, health-conscious, and oriented toward continuous improvement. You believe that small, consistent efforts compound into extraordinary results, and that the universe rewards those who serve with humility and precision.',
          'You are drawn to philosophies of mindful living, health-based spiritual practices, and traditions that honor the sacred in the everyday. You find wisdom in routine, growth in self-improvement, and abundance in the satisfaction of work well done.',
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
          'You grow through collaboration, partnership, and the creation of fair, beautiful systems. Your greatest opportunities come through relationships — business partnerships, marriage, and collaborative ventures where your diplomatic gifts create mutual benefit.',
          'Your luck is tied to committed partnership. You do best when you invest in equal, mutually supportive relationships. Solo ventures can work, but you flourish next to a partner who covers what you lack.',
        ],
      },
      {
        title: 'Philosophy & Worldview',
        icon: '🔮',
        paragraphs: [
          'Your worldview is relational, justice-oriented, and deeply committed to fairness. You believe that the universe is fundamentally balanced and that harmony is the natural state of things. Your philosophy emphasizes cooperation over competition and beauty as evidence of truth.',
          'You are drawn to legal philosophy, aesthetic traditions, and spiritual practices that emphasize partnership with the divine. You find wisdom in balance, growth through relationship, and meaning in the pursuit of justice and beauty.',
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
          'You grow through transformation, shared resources, and the mastery of hidden knowledge. Your greatest opportunities come during times of crisis and change — when others retreat in fear, you advance, finding treasure in the ruins.',
          'Financial abundance often comes through inheritance, investments, shared resources, or fields that deal with transformation — psychology, surgery, investigation, finance, or the management of other people\'s assets. You have an instinct for finding value where others see only darkness.',
        ],
      },
      {
        title: 'Philosophy & Worldview',
        icon: '🔮',
        paragraphs: [
          'Your worldview is depth-oriented, transformative, and unflinching in its acceptance of life\'s shadow side. You believe that true growth requires confronting uncomfortable truths, that power comes from self-knowledge, and that the deepest wisdom is found in the darkest places.',
          'You are drawn to esoteric traditions, depth psychology, and spiritual practices that emphasize death and rebirth. You find meaning in transformation, growth through shadow work, and the alchemical process of turning lead into gold.',
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
          'Your natural luck is extraordinary. Opportunities seem to find you, often arriving from unexpected directions and foreign sources. Your faith in positive outcomes functions as a self-fulfilling prophecy — because you expect good things, you take the risks that bring them into being.',
        ],
      },
      {
        title: 'Philosophy & Worldview',
        icon: '🔮',
        paragraphs: [
          'Your worldview is expansive, optimistic, and genuinely philosophical. You believe that life is a grand adventure, that truth exists and is worth pursuing, and that every experience — even painful ones — contributes to the soul\'s evolution. Your faith in meaning gives you remarkable resilience.',
          'You are drawn to diverse religious and philosophical traditions, world travel, and the pursuit of higher education. You are a natural teacher and philosopher, capable of inspiring others with your vision of what life can be.',
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
          'You grow through structure, discipline, and institutional achievement. Your greatest opportunities come through established channels — traditional career advancement, strategic investments, and the methodical building of professional reputation.',
          'Your abundance is earned rather than gifted. You attract prosperity through competence, reliability, and a track record of excellence. This may mean slower initial growth, but the empire you build has unshakeable foundations and extraordinary longevity.',
        ],
      },
      {
        title: 'Philosophy & Worldview',
        icon: '🔮',
        paragraphs: [
          'Your worldview is pragmatic, responsible, and focused on legacy. You believe that success is built through effort, that character is revealed through adversity, and that the most meaningful achievements are those that benefit future generations.',
          'You are drawn to stoic philosophy, traditional wisdom, and spiritual practices that emphasize duty, discipline, and the long view. You find meaning in responsibility and growth through the patient mastery of your chosen craft.',
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
          'You grow through innovation, technology, and community action. Your greatest opportunities come through group ventures, humanitarian projects, and fields that are shaping the future — technology, social enterprise, and systemic reform.',
          'Your abundance is tied to your network and your ideas. You attract prosperity when you connect with communities that share your vision and when you apply your innovative thinking to real-world problems. Your luck increases as your network grows.',
        ],
      },
      {
        title: 'Philosophy & Worldview',
        icon: '🔮',
        paragraphs: [
          'Your worldview is progressive, humanitarian, and fundamentally optimistic about human potential. You believe that collective action can solve even the most intractable problems and that technology and innovation are forces for liberation rather than control.',
          'You are drawn to futurism, humanitarian philosophy, and spiritual traditions that emphasize universal consciousness and collective evolution. You find meaning in service to humanity and growth through the expansion of social consciousness.',
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
          'You grow through faith, compassion, and creative surrender. Your greatest opportunities come when you trust the flow of life, follow your intuition, and open yourself to possibilities that defy rational planning. Your luck is mystical — it arrives through synchronicity, dreams, and moments of grace.',
          'Abundance flows to you through the arts, healing professions, spiritual service, and any work that connects you to the transcendent. Your generosity and compassion create a positive karmic cycle — the more you give from the heart, the more the universe provides.',
        ],
      },
      {
        title: 'Philosophy & Worldview',
        icon: '🔮',
        paragraphs: [
          'Your worldview is mystical, compassionate, and fundamentally trusting. You believe that the universe is benevolent, that all beings are connected, and that love is the fundamental force that holds reality together. This faith gives you a serenity and resilience that others find deeply comforting.',
          'You are drawn to mystical traditions, contemplative practices, and philosophies that emphasize unity, compassion, and the dissolution of ego. You find God in the ocean, in music, in dreams, and in the eyes of those who are suffering.',
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
