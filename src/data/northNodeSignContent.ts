/* ──────────────────────────────────────────────────────────────
   North Node in Signs Content
   SEO-rich content for North Node through each zodiac sign.
   Soul's purpose, life direction, karmic growth edge.
   ────────────────────────────────────────────────────────────── */

import {
  SIGNS,
  ALL_SIGN_KEYS,
  getElementColor,
  type ZodiacSign,
} from './compatibilityContent';

export { SIGNS, ALL_SIGN_KEYS, getElementColor, type ZodiacSign };

export interface NorthNodeSignContent {
  sign: ZodiacSign;
  title: string;
  subtitle: string;
  intro: string;
  sections: {
    title: string;
    icon: string;
    paragraphs: string[];
  }[];
  keywords: string[];
}

export const NORTH_NODE_SYMBOL = '☊';

const NORTH_NODE_CONTENT: Record<ZodiacSign, Omit<NorthNodeSignContent, 'sign'>> = {
  aries: {
    title: 'North Node in Aries',
    subtitle: 'Learning to Lead',
    intro: 'North Node in Aries calls the soul toward independence, courage, and the willingness to put themselves first. Coming from a South Node in Libra, these individuals must move from people-pleasing and codependency toward authentic self-assertion and the courage to stand alone.',
    sections: [
      {
        title: "Soul's Purpose",
        icon: '🧭',
        paragraphs: [
          'The North Node in Aries represents a soul that has spent many lifetimes perfecting the art of partnership, diplomacy, and keeping the peace. In this lifetime, the evolutionary direction points toward independence, self-assertion, and the courage to act on personal conviction, even when it disrupts the harmony they once maintained so carefully.',
          'The purpose is not to abandon relationship but to bring a strong, authentic self to partnership. North Node in Aries must learn that the greatest gift they can offer anyone is a fully developed individual who knows what they want and is not afraid to go after it.',
          'This is the soul that is learning to say "I" without guilt, to want things without apologizing, and to lead without waiting for consensus. Every act of genuine self-assertion, no matter how small, is a step toward fulfilling this lifetime\'s purpose.',
        ],
      },
      {
        title: 'Karmic Growth Edge',
        icon: '⚡',
        paragraphs: [
          'The karmic growth edge for North Node in Aries is the terrifying leap from "what do you want?" to "this is what I want." Every cell in their being has been trained to consider others first, to seek balance, to avoid conflict. The growth lies in learning that their own desires matter and that pursuing them is not selfish but essential.',
          'This growth edge often manifests through situations that force independence: relationships that end, collaborative projects that require a solo decision, or moments where the only way forward is to act alone and accept the consequences. These situations feel destabilizing but are exactly what the soul needs.',
          'The ultimate lesson is that healthy anger, clear boundaries, and decisive action are expressions of love, not its opposite. When North Node in Aries learns to fight for what matters without losing their capacity for connection, they integrate their karmic growth with their inherited gifts.',
        ],
      },
      {
        title: 'What They Are Learning',
        icon: '📖',
        paragraphs: [
          'North Node in Aries is learning to trust their instincts and act on them before they have time to second-guess. The analysis paralysis of the South Node in Libra, weighing every option, considering every perspective, seeking every opinion, must give way to the Aries impulse to decide and move.',
          'They are learning that conflict is not catastrophic. Disagreement, competition, and even anger can be healthy, clarifying forces that strengthen relationships rather than destroy them. The avoidance of conflict, which once felt like wisdom, is being revealed as a form of self-abandonment.',
        ],
      },
    ],
    keywords: ['north node in aries', 'north node aries purpose', 'aries north node meaning', 'north node in aries astrology', 'soul purpose aries'],
  },
  taurus: {
    title: 'North Node in Taurus',
    subtitle: 'Learning to Ground',
    intro: 'North Node in Taurus calls the soul toward stability, simplicity, and the cultivation of inner peace. Coming from a South Node in Scorpio, these individuals must move from intensity and crisis toward serenity, self-sufficiency, and the quiet joy of a well-tended life.',
    sections: [
      {
        title: "Soul's Purpose",
        icon: '🧭',
        paragraphs: [
          'The North Node in Taurus represents a soul that has spent many lifetimes navigating extremes: emotional intensity, psychological depth, crisis, and transformation. In this lifetime, the evolutionary direction points toward simplicity, peace, and the radical act of being content with what is.',
          'The purpose is to build a life of genuine security, not through controlling others or manipulating circumstances but through patient work, self-reliance, and the cultivation of inner calm. North Node in Taurus is learning that the most powerful thing they can do is relax.',
          'This is the soul that is learning to trust that the ground beneath their feet is solid, that not everything is a crisis, and that sometimes the bravest act is simply to stay, to plant roots, to tend a garden, and to trust that abundance will come.',
        ],
      },
      {
        title: 'Karmic Growth Edge',
        icon: '⚡',
        paragraphs: [
          'The karmic growth edge for North Node in Taurus is the shift from intensity to peace. Every instinct tells them that life must be dramatic, deep, and transformative. The growth lies in discovering that ordinary life, morning routines, shared meals, financial stability, is not a compromise but a destination.',
          'This growth edge manifests through situations that invite them to simplify: opportunities to build wealth steadily rather than through crisis, relationships that offer comfort rather than intensity, and moments where the right choice is to do nothing rather than everything.',
          'The ultimate lesson is that security comes from within. When North Node in Taurus stops seeking transformation and starts building stability, they discover a peace that is far more profound than any crisis-born epiphany.',
        ],
      },
      {
        title: 'What They Are Learning',
        icon: '📖',
        paragraphs: [
          'North Node in Taurus is learning to value simplicity over complexity, peace over drama, and building over destroying. The Scorpio South Node\'s tendency to probe, investigate, and transform must be balanced by the Taurus ability to accept, appreciate, and simply enjoy.',
          'They are learning to trust their own resources rather than relying on others\' energy, money, or emotional support. Self-sufficiency, which once felt limiting, is being revealed as the foundation of genuine freedom.',
        ],
      },
    ],
    keywords: ['north node in taurus', 'north node taurus purpose', 'taurus north node meaning', 'north node in taurus astrology', 'soul purpose taurus'],
  },
  gemini: {
    title: 'North Node in Gemini',
    subtitle: 'Learning to Listen',
    intro: 'North Node in Gemini calls the soul toward curiosity, communication, and the willingness to ask questions instead of dispensing answers. Coming from a South Node in Sagittarius, these individuals must move from dogmatic certainty toward flexible, humble learning.',
    sections: [
      {
        title: "Soul's Purpose",
        icon: '🧭',
        paragraphs: [
          'The North Node in Gemini represents a soul that has spent many lifetimes as the teacher, the preacher, the philosopher with grand answers. In this lifetime, the evolutionary direction points toward becoming the student again, toward asking questions instead of giving lectures, and toward the humility of not knowing.',
          'The purpose is to develop genuine curiosity, the ability to listen without formulating a response, to learn without needing to teach, and to gather information without immediately imposing meaning on it. North Node in Gemini is learning that wisdom begins with admitting what you do not know.',
          'This is the soul that is learning to value details over grand narratives, local experience over universal theories, and many small truths over one big truth. Every genuine question they ask moves them closer to their purpose.',
        ],
      },
      {
        title: 'Karmic Growth Edge',
        icon: '⚡',
        paragraphs: [
          'The karmic growth edge for North Node in Gemini is releasing the need to be right. The Sagittarius South Node gave them confidence in their beliefs, but this confidence has calcified into rigidity. Growth comes through the willingness to say "I don\'t know" and mean it.',
          'This growth edge manifests through situations that challenge their beliefs: encounters with perspectives they cannot assimilate into their existing framework, conversations where listening matters more than speaking, and moments where the most honest response is a question rather than an answer.',
          'The ultimate lesson is that truth is not a destination but a conversation. When North Node in Gemini embraces the Gemini gift of holding multiple perspectives simultaneously, they develop a more nuanced, flexible, and ultimately wiser understanding of the world.',
        ],
      },
      {
        title: 'What They Are Learning',
        icon: '📖',
        paragraphs: [
          'North Node in Gemini is learning to communicate rather than preach, to gather data rather than impose theories, and to engage with their immediate environment rather than always seeking distant horizons.',
          'They are learning that small talk is not superficial, that local community matters as much as global vision, and that the most profound truths often hide in the details they have previously dismissed as unimportant.',
        ],
      },
    ],
    keywords: ['north node in gemini', 'north node gemini purpose', 'gemini north node meaning', 'north node in gemini astrology', 'soul purpose gemini'],
  },
  cancer: {
    title: 'North Node in Cancer',
    subtitle: 'Learning to Nurture',
    intro: 'North Node in Cancer calls the soul toward emotional vulnerability, nurturing, and the creation of genuine intimacy. Coming from a South Node in Capricorn, these individuals must move from achievement-based identity toward the softer power of emotional connection and care.',
    sections: [
      {
        title: "Soul's Purpose",
        icon: '🧭',
        paragraphs: [
          'The North Node in Cancer represents a soul that has spent many lifetimes building empires, climbing hierarchies, and defining themselves through achievement. In this lifetime, the evolutionary direction points toward the heart: family, emotional intimacy, and the courage to be vulnerable.',
          'The purpose is to learn that love, not achievement, is the measure of a life well lived. North Node in Cancer is learning to prioritize people over projects, feelings over facts, and the creation of emotional safety over the accumulation of external success.',
          'This is the soul that is learning to come home, both literally and emotionally. Every time they choose connection over ambition, vulnerability over control, or nurturing over achieving, they align with their deepest purpose.',
        ],
      },
      {
        title: 'Karmic Growth Edge',
        icon: '⚡',
        paragraphs: [
          'The karmic growth edge for North Node in Cancer is allowing themselves to need others. The Capricorn South Node made them fiercely self-sufficient, but this independence has become a prison. Growth comes through admitting that they need love, comfort, and emotional support.',
          'This growth edge manifests through situations that break through their emotional armor: the birth of a child, the death of a parent, a health crisis that makes them dependent on others, or a relationship that demands genuine vulnerability. These moments of forced openness are the gateways to their evolution.',
          'The ultimate lesson is that real strength includes the courage to be soft. When North Node in Cancer allows themselves to feel, to cry, to need, and to nurture, they discover a power far greater than anything they achieved through discipline alone.',
        ],
      },
      {
        title: 'What They Are Learning',
        icon: '📖',
        paragraphs: [
          'North Node in Cancer is learning to define success through the quality of their relationships rather than the size of their resume. They are discovering that a loving home is worth more than a corner office and that emotional intelligence is the most important kind.',
          'They are learning to mother themselves and others, to create belonging, and to trust that vulnerability is not weakness but the doorway to everything they truly desire.',
        ],
      },
    ],
    keywords: ['north node in cancer', 'north node cancer purpose', 'cancer north node meaning', 'north node in cancer astrology', 'soul purpose cancer'],
  },
  leo: {
    title: 'North Node in Leo',
    subtitle: 'Learning to Shine',
    intro: 'North Node in Leo calls the soul toward creative self-expression, joy, and the courage to stand in the spotlight. Coming from a South Node in Aquarius, these individuals must move from hiding in the crowd toward claiming their unique creative identity.',
    sections: [
      {
        title: "Soul's Purpose",
        icon: '🧭',
        paragraphs: [
          'The North Node in Leo represents a soul that has spent many lifetimes serving the group, maintaining objectivity, and submerging their individuality for the collective good. In this lifetime, the evolutionary direction points toward personal creative expression, the courage to be seen, and the discovery of what makes them uniquely special.',
          'The purpose is to develop a strong, expressive, creative identity that is not dependent on group approval. North Node in Leo is learning that they are not just a member of the collective but an individual with unique gifts that deserve to be shared.',
          'This is the soul that is learning to take center stage, to create from the heart, and to accept love and recognition without deflecting it. Every act of genuine creative expression is a step toward fulfilling their purpose.',
        ],
      },
      {
        title: 'Karmic Growth Edge',
        icon: '⚡',
        paragraphs: [
          'The karmic growth edge for North Node in Leo is claiming personal authorship of their life. The Aquarius South Node diffused their identity across the group, making them excellent team players but reluctant soloists. Growth comes through the willingness to say "this is mine," whether that is a creative work, a personal vision, or a declaration of love.',
          'This growth edge manifests through situations that demand personal visibility: leadership roles, creative projects, romantic pursuits, and moments where they must step forward as an individual rather than hide behind a group or an ideal.',
          'The ultimate lesson is that the world needs their unique light. When North Node in Leo stops dimming their brightness for the sake of fitting in and starts shining unapologetically, they fulfill their cosmic contract and inspire others to do the same.',
        ],
      },
      {
        title: 'What They Are Learning',
        icon: '📖',
        paragraphs: [
          'North Node in Leo is learning that personal joy matters, that creative expression is not selfish, and that the unique perspective they bring to the world cannot be replicated by anyone else.',
          'They are learning to receive love, recognition, and applause without guilt, and to trust that their individual contribution to the world is as important as any collective effort.',
        ],
      },
    ],
    keywords: ['north node in leo', 'north node leo purpose', 'leo north node meaning', 'north node in leo astrology', 'soul purpose leo'],
  },
  virgo: {
    title: 'North Node in Virgo',
    subtitle: 'Learning to Serve',
    intro: 'North Node in Virgo calls the soul toward practical service, discernment, and the sacred discipline of daily improvement. Coming from a South Node in Pisces, these individuals must move from mystical escapism toward grounded, devoted action. With Vesta ruling Virgo, this path is one of sacred service.',
    sections: [
      {
        title: "Soul's Purpose",
        icon: '🧭',
        paragraphs: [
          'The North Node in Virgo represents a soul that has spent many lifetimes dissolving boundaries, seeking transcendence, and swimming in the ocean of universal feeling. In this lifetime, with Vesta as Virgo\'s ruler, the evolutionary direction points toward practical devotion: serving through precise, skillful action rather than through spiritual osmosis.',
          'The purpose is to develop discernment, the ability to distinguish helpful from harmful, real from imaginary, and practical from delusional. North Node in Virgo is learning that genuine spiritual service requires practical skills, not just good intentions.',
          'This is the soul that is learning to chop wood and carry water, to find the sacred in daily tasks, and to serve through competence rather than compassion alone. Every practical skill mastered, every system improved, every health practice adopted moves them toward their purpose.',
        ],
      },
      {
        title: 'Karmic Growth Edge',
        icon: '⚡',
        paragraphs: [
          'The karmic growth edge for North Node in Virgo is grounding spiritual insight in practical reality. The Pisces South Node gave them extraordinary intuition and empathy, but these gifts become liabilities when they are not anchored in practical application.',
          'This growth edge manifests through situations that demand precision, accountability, and follow-through: jobs that require attention to detail, health challenges that demand disciplined self-care, and relationships that need practical support rather than just emotional presence.',
          'The ultimate lesson is that service without skill is sentimentality, and compassion without discernment enables dysfunction. When North Node in Virgo combines their inherited empathy with practical competence, they become genuinely effective healers and servants of humanity.',
        ],
      },
      {
        title: 'What They Are Learning',
        icon: '📖',
        paragraphs: [
          'North Node in Virgo is learning to show up consistently, to do the unglamorous daily work that real service requires, and to take responsibility for the practical details of life rather than floating above them.',
          'They are learning that boundaries are not walls but necessary structures that make genuine service possible, and that the most profound spiritual practice is doing ordinary things with extraordinary care.',
        ],
      },
    ],
    keywords: ['north node in virgo', 'north node virgo purpose', 'virgo north node meaning', 'north node in virgo astrology', 'soul purpose virgo'],
  },
  libra: {
    title: 'North Node in Libra',
    subtitle: 'Learning to Partner',
    intro: 'North Node in Libra calls the soul toward partnership, cooperation, and the art of creating harmony without losing authenticity. Coming from a South Node in Aries, these individuals must move from self-reliance toward the vulnerability of genuine interdependence. With Juno ruling Libra, committed partnership is the primary vehicle for growth.',
    sections: [
      {
        title: "Soul's Purpose",
        icon: '🧭',
        paragraphs: [
          'The North Node in Libra represents a soul that has spent many lifetimes as the independent warrior, the solo pioneer, the one who needed no one. In this lifetime, with Juno as Libra\'s ruler, the evolutionary direction points toward committed partnership: learning to share power, consider others, and create something beautiful together.',
          'The purpose is to develop the art of relationship, not as a loss of self but as an expansion of self. North Node in Libra is learning that "we" can be more powerful than "I" and that genuine partnership amplifies rather than diminishes individual strength.',
          'This is the soul that is learning to listen before acting, to consider before deciding, and to value harmony without sacrificing honesty. Every act of genuine cooperation moves them closer to their purpose.',
        ],
      },
      {
        title: 'Karmic Growth Edge',
        icon: '⚡',
        paragraphs: [
          'The karmic growth edge for North Node in Libra is vulnerability within partnership. The Aries South Node made them self-sufficient to a fault, and the idea of needing someone else feels dangerous. Growth comes through allowing interdependence.',
          'This growth edge manifests through partnerships that challenge their independence: romantic relationships that require compromise, business partnerships that demand shared decision-making, and friendships that ask for genuine reciprocity.',
          'The ultimate lesson is that the strongest position is not standing alone but standing together. When North Node in Libra learns to partner without losing themselves, they discover a form of strength that solo warriors can never access.',
        ],
      },
      {
        title: 'What They Are Learning',
        icon: '📖',
        paragraphs: [
          'North Node in Libra is learning that compromise is not weakness, that considering someone else\'s perspective does not diminish their own, and that the beauty of partnership lies in the creative tension between two whole individuals.',
          'They are learning diplomacy, tact, and the art of fair negotiation, skills that once felt like compromising their authenticity but are revealed to be forms of higher intelligence.',
        ],
      },
    ],
    keywords: ['north node in libra', 'north node libra purpose', 'libra north node meaning', 'north node in libra astrology', 'soul purpose libra'],
  },
  scorpio: {
    title: 'North Node in Scorpio',
    subtitle: 'Learning to Transform',
    intro: 'North Node in Scorpio calls the soul toward depth, transformation, and the courage to face the shadow. Coming from a South Node in Taurus, these individuals must move from comfortable security toward the risky, rewarding territory of emotional depth and shared power.',
    sections: [
      {
        title: "Soul's Purpose",
        icon: '🧭',
        paragraphs: [
          'The North Node in Scorpio represents a soul that has spent many lifetimes building security, accumulating resources, and maintaining comfortable stability. In this lifetime, the evolutionary direction points toward the depths: psychological intimacy, shared resources, and the transformative power of letting go.',
          'The purpose is to learn that real security comes not from what you hold onto but from what you are willing to release. North Node in Scorpio is learning to dive deep, to merge with others emotionally and financially, and to trust that destruction is the prerequisite for genuine renewal.',
          'This is the soul that is learning to die metaphorically in order to be reborn: to let go of attachments, to face fears, and to discover that the treasure they seek is hidden in the very darkness they have been avoiding.',
        ],
      },
      {
        title: 'Karmic Growth Edge',
        icon: '⚡',
        paragraphs: [
          'The karmic growth edge for North Node in Scorpio is releasing control over material security. The Taurus South Node made them expert accumulators, but growth comes through sharing, merging, and trusting others with their resources, both material and emotional.',
          'This growth edge manifests through situations that strip away outer security: financial partnerships, deep intimate relationships, loss of possessions, or experiences that force them to rely on something beyond their own resources.',
          'The ultimate lesson is that transformation is the only lasting security. When North Node in Scorpio learns to embrace change rather than resist it, they discover an inner power that no external loss can diminish.',
        ],
      },
      {
        title: 'What They Are Learning',
        icon: '📖',
        paragraphs: [
          'North Node in Scorpio is learning to value depth over comfort, transformation over stability, and shared intimacy over self-sufficiency. They are discovering that the willingness to be vulnerable is the gateway to genuine power.',
          'They are learning that the darkest emotions, grief, rage, fear, and desire, are not threats to be managed but energies to be transmuted into wisdom and healing.',
        ],
      },
    ],
    keywords: ['north node in scorpio', 'north node scorpio purpose', 'scorpio north node meaning', 'north node in scorpio astrology', 'soul purpose scorpio'],
  },
  sagittarius: {
    title: 'North Node in Sagittarius',
    subtitle: 'Learning to Believe',
    intro: 'North Node in Sagittarius calls the soul toward faith, adventure, and the pursuit of higher meaning. Coming from a South Node in Gemini, these individuals must move from information gathering toward wisdom, from data toward truth, and from thinking toward believing.',
    sections: [
      {
        title: "Soul's Purpose",
        icon: '🧭',
        paragraphs: [
          'The North Node in Sagittarius represents a soul that has spent many lifetimes collecting information, analyzing data, and maintaining intellectual flexibility. In this lifetime, the evolutionary direction points toward meaning: developing a philosophy of life, trusting intuitive wisdom over factual knowledge, and daring to believe in something greater than themselves.',
          'The purpose is to transform information into wisdom. North Node in Sagittarius is learning that knowing many facts is not the same as understanding truth, and that at some point, you must stop gathering data and start living by a set of principles.',
          'This is the soul that is learning to leap: to commit to a belief, to follow an adventure, to trust that the universe has a plan. Every act of faith, every journey into the unknown, moves them toward their purpose.',
        ],
      },
      {
        title: 'Karmic Growth Edge',
        icon: '⚡',
        paragraphs: [
          'The karmic growth edge for North Node in Sagittarius is committing to a vision without needing to see every step first. The Gemini South Node wants more data, more perspectives, more analysis. Growth comes through the willingness to decide based on incomplete information and trust that the path will reveal itself.',
          'This growth edge manifests through adventures, both physical and intellectual, that take them far from the familiar. Travel, higher education, cross-cultural experiences, and encounters with radically different worldviews are the catalysts for their evolution.',
          'The ultimate lesson is that truth is not found in facts but in the meaning we make from them. When North Node in Sagittarius develops the courage to synthesize their knowledge into wisdom and live by it, they fulfill their cosmic purpose.',
        ],
      },
      {
        title: 'What They Are Learning',
        icon: '📖',
        paragraphs: [
          'North Node in Sagittarius is learning to see the forest instead of the trees, to value intuition as much as analysis, and to trust that some questions are better answered through experience than through study.',
          'They are learning that a life of meaning requires the courage to commit to beliefs, even imperfect ones, and that the adventure of living by your principles is more valuable than the safety of keeping all options open.',
        ],
      },
    ],
    keywords: ['north node in sagittarius', 'north node sagittarius purpose', 'sagittarius north node meaning', 'north node in sagittarius astrology', 'soul purpose sagittarius'],
  },
  capricorn: {
    title: 'North Node in Capricorn',
    subtitle: 'Learning to Build',
    intro: 'North Node in Capricorn calls the soul toward maturity, responsibility, and the discipline to build something lasting. Coming from a South Node in Cancer, these individuals must move from emotional dependency toward self-authority and the willingness to take on the mantle of leadership.',
    sections: [
      {
        title: "Soul's Purpose",
        icon: '🧭',
        paragraphs: [
          'The North Node in Capricorn represents a soul that has spent many lifetimes in the safety of family, community, and emotional nurturing. In this lifetime, the evolutionary direction points toward the mountain: professional achievement, public responsibility, and the discipline to build structures that serve beyond the personal sphere.',
          'The purpose is to develop authority, the genuine kind that comes from competence, integrity, and the willingness to be accountable for outcomes. North Node in Capricorn is learning to be the adult in the room, the one who makes the hard decisions and accepts the consequences.',
          'This is the soul that is learning to stand up, step out of the familiar comfort zone, and take on challenges that test their character. Every responsibility accepted, every goal achieved through discipline, moves them toward their purpose.',
        ],
      },
      {
        title: 'Karmic Growth Edge',
        icon: '⚡',
        paragraphs: [
          'The karmic growth edge for North Node in Capricorn is releasing emotional dependency and developing self-reliance. The Cancer South Node provided a warm cocoon of belonging, but growth comes through leaving that cocoon and proving themselves in the wider world.',
          'This growth edge manifests through career challenges, leadership opportunities, and situations that require them to prioritize long-term goals over immediate emotional comfort.',
          'The ultimate lesson is that genuine security comes from earned achievement, not from emotional dependency. When North Node in Capricorn embraces the discipline of building a meaningful career and public life, they discover an unshakeable confidence that no external approval can provide.',
        ],
      },
      {
        title: 'What They Are Learning',
        icon: '📖',
        paragraphs: [
          'North Node in Capricorn is learning to set goals and pursue them with discipline, to accept responsibility without resentment, and to measure themselves by their contributions to the world rather than by how loved they feel.',
          'They are learning that emotional comfort, while important, cannot be the primary organizing principle of their life. Some things are worth doing precisely because they are difficult.',
        ],
      },
    ],
    keywords: ['north node in capricorn', 'north node capricorn purpose', 'capricorn north node meaning', 'north node in capricorn astrology', 'soul purpose capricorn'],
  },
  aquarius: {
    title: 'North Node in Aquarius',
    subtitle: 'Learning to Innovate',
    intro: 'North Node in Aquarius calls the soul toward community, innovation, and the courage to be truly original. Coming from a South Node in Leo, these individuals must move from personal glory toward collective service and the willingness to be one voice in a chorus rather than the sole performer.',
    sections: [
      {
        title: "Soul's Purpose",
        icon: '🧭',
        paragraphs: [
          'The North Node in Aquarius represents a soul that has spent many lifetimes in the spotlight, developing charisma, creative power, and personal magnetism. In this lifetime, the evolutionary direction points toward the collective: using their gifts in service of the group, innovating for the common good, and finding fulfillment through contribution rather than recognition.',
          'The purpose is to become a true visionary, someone who uses their creative talents not for personal glory but for the advancement of humanity. North Node in Aquarius is learning that the greatest creativity is collective and that the most powerful innovations serve everyone.',
          'This is the soul that is learning to share the stage, to amplify others\' voices, and to channel their considerable personal power into movements that are bigger than any individual.',
        ],
      },
      {
        title: 'Karmic Growth Edge',
        icon: '⚡',
        paragraphs: [
          'The karmic growth edge for North Node in Aquarius is releasing the need for special recognition. The Leo South Node thrives on applause and personal attention, but growth comes through the willingness to contribute anonymously, to be one among equals.',
          'This growth edge manifests through situations that require teamwork, community engagement, and the subordination of personal ego to collective purpose. Group projects, social movements, and collaborative innovations are the classrooms of their evolution.',
          'The ultimate lesson is that true individuality is not about standing out from the crowd but about being so authentically yourself that you naturally attract your tribe. When North Node in Aquarius stops performing and starts contributing, they find the community they have been searching for all along.',
        ],
      },
      {
        title: 'What They Are Learning',
        icon: '📖',
        paragraphs: [
          'North Node in Aquarius is learning to value the group over the individual, innovation over tradition, and future vision over present gratification. They are discovering that their unique gifts have their greatest impact when directed toward collective progress.',
          'They are learning that friendship, community, and social consciousness are not less important than romance, creativity, and personal expression but are their natural evolution.',
        ],
      },
    ],
    keywords: ['north node in aquarius', 'north node aquarius purpose', 'aquarius north node meaning', 'north node in aquarius astrology', 'soul purpose aquarius'],
  },
  pisces: {
    title: 'North Node in Pisces',
    subtitle: 'Learning to Surrender',
    intro: 'North Node in Pisces calls the soul toward faith, compassion, and the willingness to surrender control to something greater than the rational mind. Coming from a South Node in Virgo, these individuals must move from analytical perfection toward spiritual trust and the beauty of letting go.',
    sections: [
      {
        title: "Soul's Purpose",
        icon: '🧭',
        paragraphs: [
          'The North Node in Pisces represents a soul that has spent many lifetimes perfecting, analyzing, and organizing the material world. In this lifetime, the evolutionary direction points toward the invisible: spiritual faith, creative imagination, and the mystical experience of unity with all life.',
          'The purpose is to learn that not everything can be analyzed, fixed, or improved, that some things must simply be felt, accepted, and surrendered to. North Node in Pisces is learning to trust the process of life without needing to understand or control it.',
          'This is the soul that is learning to let go: of perfectionism, of the need to be useful, of the belief that they must earn their place in the world through service and productivity. Every moment of genuine surrender, of simply being without doing, moves them toward their purpose.',
        ],
      },
      {
        title: 'Karmic Growth Edge',
        icon: '⚡',
        paragraphs: [
          'The karmic growth edge for North Node in Pisces is releasing the need for certainty and control. The Virgo South Node provided a reliable world of facts, systems, and practical competence, but growth comes through stepping into the unknown, trusting intuition over analysis, and embracing mystery.',
          'This growth edge manifests through situations that defy logical explanation: mystical experiences, creative breakthroughs that arise from surrender rather than effort, and moments of profound compassion that dissolve the boundary between self and other.',
          'The ultimate lesson is that the deepest truths are not discovered through analysis but through surrender. When North Node in Pisces learns to let go of the need to understand everything, they open to a dimension of reality that the rational mind cannot access.',
        ],
      },
      {
        title: 'What They Are Learning',
        icon: '📖',
        paragraphs: [
          'North Node in Pisces is learning to trust intuition over data, to value compassion over critique, and to find meaning in mystery rather than demanding clarity. They are discovering that the most profound healing happens not through technique but through love.',
          'They are learning that imperfection is not a problem to be solved but a natural aspect of existence, and that the willingness to be vulnerable, confused, and uncertain is the gateway to genuine spiritual depth.',
        ],
      },
    ],
    keywords: ['north node in pisces', 'north node pisces purpose', 'pisces north node meaning', 'north node in pisces astrology', 'soul purpose pisces'],
  },
};

export function getNorthNodeSignContent(sign: ZodiacSign): NorthNodeSignContent {
  const content = NORTH_NODE_CONTENT[sign];
  return { sign, ...content };
}

export function getAdjacentSigns(sign: ZodiacSign): { prev: ZodiacSign; next: ZodiacSign } {
  const idx = ALL_SIGN_KEYS.indexOf(sign);
  const prev = ALL_SIGN_KEYS[(idx - 1 + 12) % 12];
  const next = ALL_SIGN_KEYS[(idx + 1) % 12];
  return { prev, next };
}
