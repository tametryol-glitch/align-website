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
    intro: 'With Jupiter in Aries, your path to growth, abundance, and opportunity runs through courage and initiative. You attract luck by being the first to act, the boldest to lead, and the most willing to take risks. The universe rewards your daring.',
    sections: [
      {
        title: 'Growth & Abundance',
        icon: '🌟',
        paragraphs: [
          'Jupiter in Aries expands through action and initiative. Your greatest opportunities come when you charge ahead without waiting for permission or consensus. You are lucky when you are brave — the more boldly you act, the more the universe conspires to support you.',
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
    intro: 'With Jupiter in Taurus, your path to growth and abundance flows through patience, sensuality, and the art of building lasting value. You attract luck through persistence, appreciation of beauty, and a deep trust in the natural timing of things.',
    sections: [
      {
        title: 'Growth & Abundance',
        icon: '🌟',
        paragraphs: [
          'Jupiter in Taurus expands through steady accumulation and appreciation of the physical world. Your greatest opportunities come through investments that grow over time, ventures built on solid foundations, and the patient development of valuable skills and resources.',
          'Financial abundance comes naturally to this placement. You have an instinct for value — knowing what is worth investing in, when to hold, and how to grow wealth steadily over time. Your prosperity is not about windfalls but about compound growth.',
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
    intro: 'With Jupiter in Gemini, your path to growth and abundance flows through learning, communication, and the endless exchange of ideas. You attract luck by staying curious, building networks, and positioning yourself as a bridge between different worlds of knowledge.',
    sections: [
      {
        title: 'Growth & Abundance',
        icon: '🌟',
        paragraphs: [
          'Jupiter in Gemini expands through information, communication, and social connection. Your greatest opportunities come through networking, learning new skills, and positioning yourself at the intersection of different fields. You are lucky when you are learning and connecting.',
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
    intro: 'Jupiter is exalted in Cancer, making this one of the most fortunate placements in the zodiac. With Jupiter in Cancer, abundance flows through family, home, and emotional generosity. Your luck is tied to your capacity to nurture, and the universe rewards your care with extraordinary blessings.',
    sections: [
      {
        title: 'Growth & Abundance',
        icon: '🌟',
        paragraphs: [
          'Jupiter in Cancer expands through emotional connection, family bonds, and the creation of safe, nurturing environments. Your greatest opportunities come through real estate, food, family business, or any venture that serves people\'s fundamental need for belonging and security.',
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
    intro: 'With Jupiter in Leo, your path to growth and abundance flows through creative self-expression, generous leadership, and the courage to shine unapologetically. You attract luck by being authentically yourself, sharing your gifts, and treating life as a magnificent creative performance.',
    sections: [
      {
        title: 'Growth & Abundance',
        icon: '🌟',
        paragraphs: [
          'Jupiter in Leo expands through creativity, leadership, and generous self-expression. Your greatest opportunities come when you step into the spotlight, share your unique talents, and inspire others with your enthusiasm and warmth. You are lucky when you are being your most authentic, expressive self.',
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
    intro: 'With Jupiter in Virgo, your path to growth and abundance flows through service, craftsmanship, and the devotion to making things better. Ruled by Vesta, this placement channels Jupiter\'s expansive energy into sacred work — the kind of focused, purposeful effort that transforms ordinary labor into meaningful contribution.',
    sections: [
      {
        title: 'Growth & Abundance',
        icon: '🌟',
        paragraphs: [
          'Jupiter in Virgo expands through service, health, and meticulous improvement. Your greatest opportunities come when you focus on being genuinely useful — solving real problems, improving existing systems, and offering practical help that makes a tangible difference in people\'s lives.',
          'Ruled by Vesta, your abundance has a devotional quality. You attract prosperity not through luck or charm but through the sacred dedication you bring to your craft. When you commit fully to your work, treating it as a form of worship, resources flow to support your mission.',
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
    intro: 'With Jupiter in Libra, your path to growth and abundance flows through partnership, justice, and the art of creating harmony. Ruled by Juno, this placement channels Jupiter\'s expansive energy into committed relationships and the pursuit of fairness, making your most fortunate opportunities inherently relational.',
    sections: [
      {
        title: 'Growth & Abundance',
        icon: '🌟',
        paragraphs: [
          'Jupiter in Libra expands through collaboration, partnership, and the creation of fair, beautiful systems. Your greatest opportunities come through relationships — business partnerships, marriage, and collaborative ventures where your diplomatic gifts create mutual benefit.',
          'Ruled by Juno, your abundance is specifically tied to committed partnership. You attract luck and prosperity when you invest in equal, mutually supportive relationships. Solo ventures may succeed, but you truly flourish when working in tandem with a partner who complements your strengths.',
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
    intro: 'With Jupiter in Scorpio, your path to growth and abundance flows through transformation, depth, and the willingness to explore what others fear. You attract luck by going deeper, facing shadows, and trusting the regenerative power of crisis and change.',
    sections: [
      {
        title: 'Growth & Abundance',
        icon: '🌟',
        paragraphs: [
          'Jupiter in Scorpio expands through transformation, shared resources, and the mastery of hidden knowledge. Your greatest opportunities come during times of crisis and change — when others retreat in fear, you advance, finding treasure in the ruins.',
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
    intro: 'Jupiter is at home in Sagittarius, making this one of the most naturally fortunate and expansive placements in the zodiac. With Jupiter in Sagittarius, your luck is enormous, your optimism is infectious, and your capacity for growth seems genuinely limitless. The universe opens doors for you that others do not even know exist.',
    sections: [
      {
        title: 'Growth & Abundance',
        icon: '🌟',
        paragraphs: [
          'Jupiter in Sagittarius expands through adventure, education, and the relentless pursuit of truth. Your greatest opportunities come through travel, higher education, publishing, philosophy, and cross-cultural exchange. The wider your world, the greater your abundance.',
          'Your natural luck is extraordinary with this placement. Opportunities seem to find you, often arriving from unexpected directions and foreign sources. Your faith in positive outcomes functions as a self-fulfilling prophecy — because you expect good things, you take the risks that bring them into being.',
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
    intro: 'With Jupiter in Capricorn, your path to growth and abundance flows through discipline, strategic planning, and the patient building of structures that endure. Your luck is not flashy — it is the steady, reliable kind that rewards hard work, integrity, and long-term thinking.',
    sections: [
      {
        title: 'Growth & Abundance',
        icon: '🌟',
        paragraphs: [
          'Jupiter in Capricorn expands through structure, discipline, and institutional achievement. Your greatest opportunities come through established channels — traditional career advancement, strategic investments, and the methodical building of professional reputation.',
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
    intro: 'With Jupiter in Aquarius, your path to growth and abundance flows through innovation, community, and the courage to think differently. You attract luck by championing progressive ideas, building networks of like-minded visionaries, and refusing to accept the status quo.',
    sections: [
      {
        title: 'Growth & Abundance',
        icon: '🌟',
        paragraphs: [
          'Jupiter in Aquarius expands through innovation, technology, and community action. Your greatest opportunities come through group ventures, humanitarian projects, and fields that are shaping the future — technology, social enterprise, and systemic reform.',
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
    intro: 'Jupiter is at home in Pisces, making this one of the most spiritually gifted and naturally fortunate placements in the zodiac. With Jupiter in Pisces, your abundance flows through faith, compassion, and a connection to the transcendent that channels blessings into your life in mysterious and often magical ways.',
    sections: [
      {
        title: 'Growth & Abundance',
        icon: '🌟',
        paragraphs: [
          'Jupiter in Pisces expands through faith, compassion, and creative surrender. Your greatest opportunities come when you trust the flow of life, follow your intuition, and open yourself to possibilities that defy rational planning. Your luck is mystical — it arrives through synchronicity, dreams, and moments of grace.',
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
