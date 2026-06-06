/* ──────────────────────────────────────────────────────────────
   South Node in Signs Content
   SEO-rich content for South Node through each zodiac sign.
   Past life gifts, comfort zone, what they're releasing.
   ────────────────────────────────────────────────────────────── */

import {
  SIGNS,
  ALL_SIGN_KEYS,
  getElementColor,
  type ZodiacSign,
} from './compatibilityContent';

export { SIGNS, ALL_SIGN_KEYS, getElementColor, type ZodiacSign };

export interface SouthNodeSignContent {
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

export const SOUTH_NODE_SYMBOL = '☋';

const SOUTH_NODE_CONTENT: Record<ZodiacSign, Omit<SouthNodeSignContent, 'sign'>> = {
  aries: {
    title: 'South Node in Aries',
    subtitle: 'The Past Life Warrior',
    intro: 'South Node in Aries arrives in this lifetime with the accumulated gifts of many lives spent as a warrior, pioneer, and independent leader. They carry innate courage and decisiveness, but must now learn to balance these gifts with partnership and cooperation through their North Node in Libra.',
    sections: [
      {
        title: 'Past Life Gifts',
        icon: '🏛',
        paragraphs: [
          'South Node in Aries brings extraordinary innate gifts of courage, independence, and decisive action. These individuals arrive in this lifetime already knowing how to lead, how to fight for what they believe in, and how to forge ahead when others hesitate. These are not skills they need to develop; they are the inheritance of many lifetimes of pioneering experience.',
          'Their instinctive response to any challenge is immediate action. While others deliberate, South Node in Aries has already made a decision and started moving. This speed and confidence served them well in past incarnations, making them natural warriors, leaders, and trailblazers.',
          'They possess an innate physical courage that goes beyond mere bravery. South Node in Aries has faced danger in many forms across lifetimes, and their body remembers. They are comfortable with risk, conflict, and the adrenaline of crisis in ways that can seem almost superhuman to those around them.',
        ],
      },
      {
        title: 'The Comfort Zone',
        icon: '🛋',
        paragraphs: [
          'The comfort zone of South Node in Aries is independence and self-reliance. When under stress, they default to going it alone, making unilateral decisions, and refusing to consult or collaborate. This feels natural and safe, but it keeps them trapped in patterns that no longer serve their evolution.',
          'They are most comfortable in competition, crisis, and situations that require quick, decisive individual action. Group projects, collaborative decision-making, and situations that require patience and consensus feel frustrating and unnatural. The temptation to bulldoze through with sheer force of will is constant.',
          'Their comfort zone also includes anger as a primary emotional response. South Node in Aries processes most emotions through the filter of anger because anger feels empowering while other emotions feel vulnerable. Learning to access sadness, fear, and tenderness without converting them to anger is part of their evolutionary journey.',
        ],
      },
      {
        title: 'What They Are Releasing',
        icon: '🍂',
        paragraphs: [
          'South Node in Aries is releasing the belief that they must do everything alone. The warrior identity that served them in past lives has become a limitation in this one. They are learning to release the reflexive need to be first, to win, and to prove their strength through individual achievement.',
          'They are also releasing the pattern of creating conflict to feel alive. South Node in Aries can unconsciously provoke confrontation because peace feels boring and vulnerability feels dangerous. The evolutionary task is to discover that real courage includes the willingness to be soft, to compromise, and to let someone else take the lead.',
        ],
      },
    ],
    keywords: ['south node in aries', 'south node aries past life', 'aries south node meaning', 'south node in aries astrology', 'past life warrior astrology'],
  },
  taurus: {
    title: 'South Node in Taurus',
    subtitle: 'The Past Life Builder',
    intro: 'South Node in Taurus arrives with innate gifts of material mastery, sensual appreciation, and the ability to create lasting stability. They carry deep knowledge of the physical world, but must now learn to embrace the transformative depths of their North Node in Scorpio.',
    sections: [
      {
        title: 'Past Life Gifts',
        icon: '🏛',
        paragraphs: [
          'South Node in Taurus brings extraordinary innate gifts around material security, physical comfort, and the patient accumulation of resources. These individuals arrive knowing how to build wealth, create beauty, and establish the kind of stable, comfortable life that others spend decades striving toward.',
          'Their relationship with the physical world is masterful. They instinctively know how to cook, garden, manage money, and create beautiful spaces. These are not learned skills but deep cellular memories from lifetimes spent mastering the material realm.',
          'They possess a natural steadiness and reliability that makes them anchors in any community. South Node in Taurus is the person you can always count on, the one who shows up consistently, follows through on commitments, and maintains their composure when others are falling apart.',
        ],
      },
      {
        title: 'The Comfort Zone',
        icon: '🛋',
        paragraphs: [
          'The comfort zone of South Node in Taurus is routine, stability, and material security. When stressed, they retreat into familiar patterns: comfort eating, excessive sleeping, compulsive shopping, or clinging to possessions and routines that provide a sense of safety.',
          'They are most comfortable when everything is predictable and controlled. Change, uncertainty, and emotional intensity feel threatening because they disrupt the carefully constructed stability that South Node in Taurus has built. The resistance to change can become so strong that it prevents necessary growth.',
          'Their comfort zone also includes self-sufficiency. South Node in Taurus has learned over many lifetimes to rely on their own resources, and the idea of merging finances, sharing possessions, or depending on another person\'s resources feels deeply uncomfortable.',
        ],
      },
      {
        title: 'What They Are Releasing',
        icon: '🍂',
        paragraphs: [
          'South Node in Taurus is releasing the belief that security comes from accumulation. The material mastery that served them in past lives must now give way to the Scorpio North Node\'s lessons of depth, transformation, and shared resources. They are learning that what you hold too tightly eventually strangles you.',
          'They are also releasing the resistance to change. South Node in Taurus can cling to situations, relationships, and possessions long past their expiration date because letting go feels like dying. The evolutionary task is to discover that releasing what no longer serves them creates space for something far more valuable to enter.',
        ],
      },
    ],
    keywords: ['south node in taurus', 'south node taurus past life', 'taurus south node meaning', 'south node in taurus astrology', 'past life builder astrology'],
  },
  gemini: {
    title: 'South Node in Gemini',
    subtitle: 'The Past Life Scholar',
    intro: 'South Node in Gemini arrives with innate gifts of communication, intellectual agility, and the ability to connect diverse ideas and people. They carry vast accumulated knowledge, but must now learn to synthesize it into wisdom through their North Node in Sagittarius.',
    sections: [
      {
        title: 'Past Life Gifts',
        icon: '🏛',
        paragraphs: [
          'South Node in Gemini brings extraordinary innate gifts of communication, learning, and intellectual versatility. These individuals arrive in this lifetime with a mind that learns quickly, communicates effortlessly, and makes connections between ideas that others miss entirely.',
          'Their verbal and written abilities are often remarkable from an early age. South Node in Gemini may have spoken early, read voraciously, or demonstrated an uncanny ability to absorb and synthesize information. These gifts are not cultivated; they are remembered.',
          'They are natural networkers and connectors, possessing an instinctive ability to bridge different worlds, translate between different perspectives, and make everyone feel heard and understood. Social intelligence comes as naturally to them as breathing.',
        ],
      },
      {
        title: 'The Comfort Zone',
        icon: '🛋',
        paragraphs: [
          'The comfort zone of South Node in Gemini is information gathering and analysis. When stressed, they retreat into learning mode: reading, researching, analyzing, and discussing, anything to avoid the terrifying act of committing to a single truth or direction.',
          'They are most comfortable keeping their options open, maintaining flexibility, and avoiding the commitment that comes with declaring a definitive position. The phrase "on the other hand" is their refuge, because as long as there is another perspective to consider, they do not have to choose.',
          'Their comfort zone also includes superficiality disguised as breadth. South Node in Gemini can skim the surface of a hundred topics rather than diving deep into one, because depth requires the kind of singular commitment that feels constraining to their multi-faceted nature.',
        ],
      },
      {
        title: 'What They Are Releasing',
        icon: '🍂',
        paragraphs: [
          'South Node in Gemini is releasing the belief that more information equals more wisdom. The intellectual agility that served them in past lives must now give way to the Sagittarius North Node\'s call for meaning, faith, and the courage to commit to a vision.',
          'They are also releasing the habit of talking their way out of difficult situations rather than feeling their way through them. South Node in Gemini can use words as shields, maintaining a running commentary that prevents genuine emotional engagement. Learning to be silent, to not know, and to feel rather than think is their evolutionary task.',
        ],
      },
    ],
    keywords: ['south node in gemini', 'south node gemini past life', 'gemini south node meaning', 'south node in gemini astrology', 'past life scholar astrology'],
  },
  cancer: {
    title: 'South Node in Cancer',
    subtitle: 'The Past Life Nurturer',
    intro: 'South Node in Cancer arrives with innate gifts of emotional intelligence, nurturing ability, and the power to create deep belonging. They carry ancient wisdom about family and feeling, but must now learn to balance these gifts with the discipline and ambition of their North Node in Capricorn.',
    sections: [
      {
        title: 'Past Life Gifts',
        icon: '🏛',
        paragraphs: [
          'South Node in Cancer brings extraordinary innate gifts of emotional attunement, nurturing, and the creation of family bonds. These individuals arrive in this lifetime already knowing how to comfort, protect, and create environments where people feel safe and loved.',
          'Their emotional intelligence is remarkable. South Node in Cancer can read a room in seconds, sense unspoken feelings, and respond to emotional needs before they are articulated. This is not learned empathy; it is the accumulated emotional wisdom of many lifetimes.',
          'They are natural homemakers and community builders, possessing an instinctive ability to create belonging wherever they go. Whether it is a physical home, a workplace, or a casual gathering, South Node in Cancer transforms spaces into sanctuaries.',
        ],
      },
      {
        title: 'The Comfort Zone',
        icon: '🛋',
        paragraphs: [
          'The comfort zone of South Node in Cancer is emotional dependency and the familiar warmth of family and home. When stressed, they retreat to their shell: hiding at home, seeking comfort from family, or regressing to childhood patterns of seeking care.',
          'They are most comfortable in the role of caretaker, the one who nurtures others, manages the emotional climate, and prioritizes everyone else\'s needs above their own. This role feels safe because it is so deeply practiced, but it keeps them from developing their own authority and public identity.',
          'Their comfort zone includes using emotional vulnerability as a way to avoid responsibility. South Node in Cancer can unconsciously use their sensitivity as a reason not to step into challenging roles, framing avoidance as self-care.',
        ],
      },
      {
        title: 'What They Are Releasing',
        icon: '🍂',
        paragraphs: [
          'South Node in Cancer is releasing the belief that emotional safety is the most important thing in life. The nurturing gifts that served them in past lives must now be balanced with the Capricorn North Node\'s call for discipline, achievement, and public responsibility.',
          'They are releasing the pattern of defining themselves through their relationships and family roles. South Node in Cancer must learn that they are more than someone\'s mother, partner, or caretaker, that they have a public mission and a professional contribution to make that extends beyond the domestic sphere.',
        ],
      },
    ],
    keywords: ['south node in cancer', 'south node cancer past life', 'cancer south node meaning', 'south node in cancer astrology', 'past life nurturer astrology'],
  },
  leo: {
    title: 'South Node in Leo',
    subtitle: 'The Past Life Performer',
    intro: 'South Node in Leo arrives with innate gifts of charisma, creative power, and the ability to command attention. They carry deep knowledge of self-expression and leadership, but must now learn to channel these gifts toward collective service through their North Node in Aquarius.',
    sections: [
      {
        title: 'Past Life Gifts',
        icon: '🏛',
        paragraphs: [
          'South Node in Leo brings extraordinary innate gifts of charisma, creative expression, and natural leadership. These individuals arrive in this lifetime with a magnetic presence that draws attention effortlessly. They know how to perform, inspire, and lead without any training.',
          'Their creative abilities are often evident from childhood. South Node in Leo may have been the class performer, the natural entertainer, or the child who organized every game and directed every play. This creative confidence is not developed; it is remembered from lifetimes of artistic and leadership experience.',
          'They possess a natural warmth and generosity that makes people feel special in their presence. South Node in Leo has perfected the art of making individuals feel seen, celebrated, and valued, a gift that naturally attracts followers and admirers.',
        ],
      },
      {
        title: 'The Comfort Zone',
        icon: '🛋',
        paragraphs: [
          'The comfort zone of South Node in Leo is center stage. When stressed, they default to seeking attention, recognition, and validation from others. Being the star feels natural and safe, while being one among equals feels diminishing.',
          'They are most comfortable when they are being admired, praised, or celebrated. The spotlight is their natural habitat, and stepping out of it, even to share it with others, triggers deep discomfort. They may unconsciously dominate conversations, commandeer group projects, or redirect attention to themselves.',
          'Their comfort zone includes drama as a way of maintaining relevance. South Node in Leo can create emotional spectacles, not maliciously, but because intensity and attention feel like home. Ordinary, quiet contribution feels like death to the ego.',
        ],
      },
      {
        title: 'What They Are Releasing',
        icon: '🍂',
        paragraphs: [
          'South Node in Leo is releasing the belief that their worth depends on being special. The personal charisma that served them in past lives must now give way to the Aquarius North Node\'s call for collective contribution, innovation, and genuine equality.',
          'They are releasing the need for personal recognition and learning to find fulfillment in contributing to something larger than themselves. The evolutionary task is to discover that the most powerful form of creativity is the kind that empowers others rather than spotlighting the self.',
        ],
      },
    ],
    keywords: ['south node in leo', 'south node leo past life', 'leo south node meaning', 'south node in leo astrology', 'past life performer astrology'],
  },
  virgo: {
    title: 'South Node in Virgo',
    subtitle: 'The Past Life Healer',
    intro: 'South Node in Virgo arrives with innate gifts of analysis, practical healing, and devotion to service. With Vesta ruling Virgo, they carry a deep devotional quality from past lives. They must now balance these gifts with the faith and surrender of their North Node in Pisces.',
    sections: [
      {
        title: 'Past Life Gifts',
        icon: '🏛',
        paragraphs: [
          'South Node in Virgo brings extraordinary innate gifts of analysis, practical competence, and healing ability. With Vesta as Virgo\'s ruler, these individuals arrive with a deeply devotional approach to work and service that feels less like a personality trait and more like a sacred calling.',
          'Their attention to detail is remarkable. South Node in Virgo notices what others miss, finds solutions in the smallest details, and possesses an instinctive ability to improve any system, process, or environment. This precision is not taught; it is the accumulated practice of many lifetimes of devoted service.',
          'They are natural healers who understand the body, nutrition, and health with intuitive accuracy. South Node in Virgo often has an innate knowledge of herbs, remedies, and healing practices that seems to come from nowhere but actually comes from deep past-life experience.',
        ],
      },
      {
        title: 'The Comfort Zone',
        icon: '🛋',
        paragraphs: [
          'The comfort zone of South Node in Virgo is control through analysis and improvement. When stressed, they retreat into fixing mode: organizing, cleaning, list-making, and criticizing, anything to impose order on a chaotic-feeling world.',
          'They are most comfortable when everything is under control, when the system works perfectly, and when every detail has been attended to. Mystery, ambiguity, and situations that cannot be analyzed or improved feel deeply threatening to their sense of safety.',
          'Their comfort zone includes self-criticism as a form of motivation. South Node in Virgo drives themselves through harsh internal evaluation, believing that self-improvement requires self-punishment. This pattern, once useful for developing competence, now prevents self-acceptance.',
        ],
      },
      {
        title: 'What They Are Releasing',
        icon: '🍂',
        paragraphs: [
          'South Node in Virgo is releasing the belief that perfection is possible and that their value depends on being useful. The analytical gifts that served them in past lives must now give way to the Pisces North Node\'s call for faith, surrender, and trust in forces beyond rational comprehension.',
          'They are releasing the habit of using busy-ness and productivity as shields against feeling. South Node in Virgo can fill every moment with tasks and improvements, leaving no space for the messy, mysterious, uncontrollable aspects of spiritual life. Learning to sit still, to not know, and to trust the process is their evolutionary task.',
        ],
      },
    ],
    keywords: ['south node in virgo', 'south node virgo past life', 'virgo south node meaning', 'south node in virgo astrology', 'past life healer astrology'],
  },
  libra: {
    title: 'South Node in Libra',
    subtitle: 'The Past Life Diplomat',
    intro: 'South Node in Libra arrives with innate gifts of diplomacy, relational intelligence, and the ability to create harmony in any situation. With Juno ruling Libra, partnership mastery is deeply encoded. They must now balance these gifts with the independent courage of their North Node in Aries.',
    sections: [
      {
        title: 'Past Life Gifts',
        icon: '🏛',
        paragraphs: [
          'South Node in Libra brings extraordinary innate gifts of partnership, negotiation, and social grace. With Juno as Libra\'s ruler, these individuals arrive with a deep, instinctive understanding of committed relationship dynamics that goes far beyond social skill into genuine relational wisdom.',
          'Their ability to read social situations and navigate interpersonal dynamics is remarkable. South Node in Libra knows how to charm, mediate, compromise, and create consensus without any formal training. These are skills refined over many lifetimes of partnership and diplomatic experience.',
          'They possess a natural aesthetic sensibility and a deep appreciation for beauty, balance, and harmony. South Node in Libra creates beautiful environments, maintains graceful relationships, and brings an effortless elegance to everything they touch.',
        ],
      },
      {
        title: 'The Comfort Zone',
        icon: '🛋',
        paragraphs: [
          'The comfort zone of South Node in Libra is people-pleasing and the avoidance of conflict. When stressed, they default to saying what others want to hear, suppressing their own opinions, and maintaining surface harmony at the expense of their authentic needs.',
          'They are most comfortable in partnership, so much so that being alone can feel existentially threatening. South Node in Libra may jump from relationship to relationship or stay in unhealthy partnerships because the alternative, solitude and self-reliance, feels unbearable.',
          'Their comfort zone includes indecision disguised as fairness. South Node in Libra can see every side of every issue, which once made them brilliant diplomats but now prevents them from taking decisive action on their own behalf.',
        ],
      },
      {
        title: 'What They Are Releasing',
        icon: '🍂',
        paragraphs: [
          'South Node in Libra is releasing the belief that their worth depends on being in a relationship and being liked. The partnership skills that served them in past lives must now give way to the Aries North Node\'s call for independence, self-assertion, and the courage to be disliked.',
          'They are releasing the pattern of defining themselves through others\' eyes and learning to look in their own mirror. The evolutionary task is to discover that the most important relationship in their life is the one with themselves, and that this relationship requires honesty, not diplomacy.',
        ],
      },
    ],
    keywords: ['south node in libra', 'south node libra past life', 'libra south node meaning', 'south node in libra astrology', 'past life diplomat astrology'],
  },
  scorpio: {
    title: 'South Node in Scorpio',
    subtitle: 'The Past Life Transformer',
    intro: 'South Node in Scorpio arrives with innate gifts of psychological depth, transformative power, and the ability to navigate the darkest aspects of human experience. They carry wisdom from the underworld, but must now learn to build stable peace through their North Node in Taurus.',
    sections: [
      {
        title: 'Past Life Gifts',
        icon: '🏛',
        paragraphs: [
          'South Node in Scorpio brings extraordinary innate gifts of psychological insight, emotional intensity, and the ability to transform through crisis. These individuals arrive in this lifetime with a deep understanding of power, death, and the hidden forces that drive human behavior.',
          'Their ability to see through deception is uncanny. South Node in Scorpio reads people with X-ray precision, sensing motives, detecting lies, and perceiving the shadow beneath every polished surface. This penetrating insight was essential in past lives but can become isolating in this one.',
          'They possess a natural comfort with the taboo, the dark, and the intense. While others shy away from topics like death, sex, money, and power, South Node in Scorpio navigates these territories with the confidence of someone who has traversed them many times before.',
        ],
      },
      {
        title: 'The Comfort Zone',
        icon: '🛋',
        paragraphs: [
          'The comfort zone of South Node in Scorpio is intensity and crisis. When stressed, they default to creating or seeking dramatic situations: power struggles, emotional confrontations, and experiences that demand total engagement. Peace feels suspicious; calm feels like the prelude to disaster.',
          'They are most comfortable when they are in control, when they know everyone\'s secrets, and when they hold the psychological leverage in any interaction. Vulnerability, trust, and the surrender of control feel life-threatening because past-life experience has taught them that letting your guard down can be fatal.',
          'Their comfort zone includes using emotional intensity as a form of connection. South Node in Scorpio can confuse drama with intimacy, crisis with depth, and obsession with love.',
        ],
      },
      {
        title: 'What They Are Releasing',
        icon: '🍂',
        paragraphs: [
          'South Node in Scorpio is releasing the addiction to intensity and transformation. The psychological depth that served them in past lives must now give way to the Taurus North Node\'s call for simplicity, stability, and the quiet joy of a peaceful life.',
          'They are releasing the belief that they must control everything to be safe. South Node in Scorpio must learn that genuine security comes not from knowing everyone\'s secrets but from building a life so stable and grounded that no crisis can topple it. The evolutionary task is to trust, to relax, and to let life be simple.',
        ],
      },
    ],
    keywords: ['south node in scorpio', 'south node scorpio past life', 'scorpio south node meaning', 'south node in scorpio astrology', 'past life transformer astrology'],
  },
  sagittarius: {
    title: 'South Node in Sagittarius',
    subtitle: 'The Past Life Philosopher',
    intro: 'South Node in Sagittarius arrives with innate gifts of wisdom, faith, and the ability to see the big picture. They carry the confidence of many lifetimes of teaching and philosophical exploration, but must now learn the humility and curiosity of their North Node in Gemini.',
    sections: [
      {
        title: 'Past Life Gifts',
        icon: '🏛',
        paragraphs: [
          'South Node in Sagittarius brings extraordinary innate gifts of vision, faith, and philosophical understanding. These individuals arrive in this lifetime with a natural ability to see patterns, meaning, and purpose in experiences that others find random or meaningless.',
          'Their teaching abilities are often remarkable. South Node in Sagittarius can explain complex concepts with infectious enthusiasm and inspire others to see possibilities they had not imagined. This is not academic ability; it is the accumulated wisdom of many lifetimes of teaching, preaching, and philosophical exploration.',
          'They possess a natural optimism and an unshakeable faith that things will work out. This confidence is not naive; it is the earned trust of a soul that has navigated many lifetimes of adventure and emerged with its spirit intact.',
        ],
      },
      {
        title: 'The Comfort Zone',
        icon: '🛋',
        paragraphs: [
          'The comfort zone of South Node in Sagittarius is big-picture thinking and the avoidance of details. When stressed, they retreat into philosophy, generalization, and the search for the next big idea, anything to avoid the tedious but necessary work of paying attention to what is right in front of them.',
          'They are most comfortable pontificating, teaching, and dispensing wisdom. The role of expert feels natural and safe, while the role of student feels diminishing. Asking questions rather than giving answers requires a humility that does not come naturally.',
          'Their comfort zone includes using optimism as a form of denial. South Node in Sagittarius can "look on the bright side" so automatically that they fail to acknowledge genuine problems that need practical attention.',
        ],
      },
      {
        title: 'What They Are Releasing',
        icon: '🍂',
        paragraphs: [
          'South Node in Sagittarius is releasing the need to have all the answers. The philosophical confidence that served them in past lives must now give way to the Gemini North Node\'s call for curiosity, humility, and the willingness to learn from everyone they meet.',
          'They are releasing the habit of prioritizing the grand vision over the small details. South Node in Sagittarius must learn that wisdom without practical application is just intellectual entertainment, and that the most profound truths often hide in the mundane details they have been ignoring.',
        ],
      },
    ],
    keywords: ['south node in sagittarius', 'south node sagittarius past life', 'sagittarius south node meaning', 'south node in sagittarius astrology', 'past life philosopher astrology'],
  },
  capricorn: {
    title: 'South Node in Capricorn',
    subtitle: 'The Past Life Authority',
    intro: 'South Node in Capricorn arrives with innate gifts of discipline, ambition, and the ability to build enduring structures. They carry the earned authority of many lifetimes of leadership and achievement, but must now learn to balance these gifts with the emotional warmth of their North Node in Cancer.',
    sections: [
      {
        title: 'Past Life Gifts',
        icon: '🏛',
        paragraphs: [
          'South Node in Capricorn brings extraordinary innate gifts of discipline, organizational ability, and the capacity for sustained achievement. These individuals arrive in this lifetime with an instinctive understanding of hierarchy, authority, and the patience required to build something lasting.',
          'Their work ethic is remarkable. South Node in Capricorn can apply themselves to difficult, long-term projects with a focus and determination that others find both inspiring and intimidating. This is not mere ambition; it is the practiced discipline of a soul that has climbed many mountains.',
          'They possess a natural authority that commands respect without demanding it. South Node in Capricorn carries themselves with a dignity and seriousness that makes others naturally look to them for leadership and guidance.',
        ],
      },
      {
        title: 'The Comfort Zone',
        icon: '🛋',
        paragraphs: [
          'The comfort zone of South Node in Capricorn is work and achievement. When stressed, they retreat into their career, their to-do list, or their ambitions, anything to avoid the messy, unpredictable realm of emotions and intimate relationships.',
          'They are most comfortable in positions of authority and control. Structure, hierarchy, and clear expectations feel safe, while emotional vulnerability, domestic life, and the unstructured world of feeling feel threatening and chaotic.',
          'Their comfort zone includes using busyness as a shield. South Node in Capricorn can fill every moment with productive activity, leaving no space for the emotional needs that are quietly starving beneath the surface of their impressive achievements.',
        ],
      },
      {
        title: 'What They Are Releasing',
        icon: '🍂',
        paragraphs: [
          'South Node in Capricorn is releasing the belief that they are what they achieve. The professional competence that served them in past lives must now give way to the Cancer North Node\'s call for emotional openness, nurturing, and the discovery that love matters more than status.',
          'They are releasing the pattern of emotional suppression in service of productivity. South Node in Capricorn must learn that feelings are not inefficiencies to be managed but essential information about what their soul actually needs. The evolutionary task is to come down from the mountain and come home.',
        ],
      },
    ],
    keywords: ['south node in capricorn', 'south node capricorn past life', 'capricorn south node meaning', 'south node in capricorn astrology', 'past life authority astrology'],
  },
  aquarius: {
    title: 'South Node in Aquarius',
    subtitle: 'The Past Life Visionary',
    intro: 'South Node in Aquarius arrives with innate gifts of social awareness, innovative thinking, and the ability to see the future before it arrives. They carry the perspective of many lifetimes of collective service, but must now learn to shine individually through their North Node in Leo.',
    sections: [
      {
        title: 'Past Life Gifts',
        icon: '🏛',
        paragraphs: [
          'South Node in Aquarius brings extraordinary innate gifts of social intelligence, innovative thinking, and the ability to work effectively within groups. These individuals arrive with a natural understanding of how communities function, how change happens at the collective level, and how individual contributions create systemic impact.',
          'Their ability to think outside the box is remarkable. South Node in Aquarius naturally sees solutions that others cannot imagine, approaches problems from unconventional angles, and possesses an intuitive grasp of technology, systems thinking, and social dynamics.',
          'They are natural egalitarians who treat everyone with the same respect, regardless of status or background. This is not politeness; it is the deeply held conviction of a soul that has spent many lifetimes working for collective liberation and social justice.',
        ],
      },
      {
        title: 'The Comfort Zone',
        icon: '🛋',
        paragraphs: [
          'The comfort zone of South Node in Aquarius is the group. When stressed, they lose themselves in collective activities, social causes, or intellectual pursuits, anything to avoid the vulnerability of individual creative expression and personal emotional exposure.',
          'They are most comfortable being one among many, a contributor to the group rather than a star. Personal attention, romantic spotlight, and situations that demand they express their unique individuality feel uncomfortable and even threatening.',
          'Their comfort zone includes emotional detachment disguised as objectivity. South Node in Aquarius can observe feelings from a distance rather than experiencing them, maintaining an intellectual understanding of emotion that substitutes for genuine emotional engagement.',
        ],
      },
      {
        title: 'What They Are Releasing',
        icon: '🍂',
        paragraphs: [
          'South Node in Aquarius is releasing the habit of hiding in the collective. The group orientation that served them in past lives must now give way to the Leo North Node\'s call for individual creative expression, personal courage, and the willingness to be seen as unique and special.',
          'They are releasing the pattern of prioritizing the collective over the personal. South Node in Aquarius must learn that their individual creative expression is not selfish but essential, and that the collective actually benefits most when each member shines with their unique light.',
        ],
      },
    ],
    keywords: ['south node in aquarius', 'south node aquarius past life', 'aquarius south node meaning', 'south node in aquarius astrology', 'past life visionary astrology'],
  },
  pisces: {
    title: 'South Node in Pisces',
    subtitle: 'The Past Life Mystic',
    intro: 'South Node in Pisces arrives with innate gifts of spiritual sensitivity, creative imagination, and the ability to dissolve into universal compassion. They carry the wisdom of many mystical lifetimes, but must now learn to ground these gifts in practical service through their North Node in Virgo.',
    sections: [
      {
        title: 'Past Life Gifts',
        icon: '🏛',
        paragraphs: [
          'South Node in Pisces brings extraordinary innate gifts of spiritual awareness, empathic sensitivity, and creative imagination. These individuals arrive in this lifetime with a direct connection to the divine that most people spend decades trying to develop.',
          'Their intuitive abilities are remarkable. South Node in Pisces often possesses psychic sensitivity, prophetic dreams, and an ability to sense the emotional and spiritual atmosphere of any environment. This is not learned ability; it is the accumulated spiritual practice of many mystical lifetimes.',
          'They possess a natural compassion that extends to all living beings. South Node in Pisces feels the suffering of the world in their own body and responds with a gentleness and understanding that can be genuinely healing to those in their presence.',
        ],
      },
      {
        title: 'The Comfort Zone',
        icon: '🛋',
        paragraphs: [
          'The comfort zone of South Node in Pisces is dissolution and escape. When stressed, they retreat into fantasy, sleep, substances, or spiritual practice, anything to avoid the harsh demands of material reality and the disciplined focus that practical life requires.',
          'They are most comfortable in formless, unstructured environments where they can flow freely between imagination and reality. Deadlines, systems, routines, and practical demands feel oppressive and spiritually deadening.',
          'Their comfort zone includes using compassion as an excuse for poor boundaries. South Node in Pisces can take on everyone else\'s pain, enabling dysfunction in the name of unconditional love, because setting limits feels unspiritual and hard-hearted.',
        ],
      },
      {
        title: 'What They Are Releasing',
        icon: '🍂',
        paragraphs: [
          'South Node in Pisces is releasing the addiction to transcendence. The spiritual gifts that served them in past lives must now be grounded through the Virgo North Node\'s call for practical service, discernment, and the sacred discipline of daily life. With Vesta ruling Virgo, the path forward is devoted, practical action.',
          'They are releasing the pattern of escaping reality rather than engaging with it. South Node in Pisces must learn that the body, the daily schedule, and the material world are not obstacles to spiritual growth but its instruments. The evolutionary task is to bring heaven down to earth through disciplined, practical, sacred service.',
        ],
      },
    ],
    keywords: ['south node in pisces', 'south node pisces past life', 'pisces south node meaning', 'south node in pisces astrology', 'past life mystic astrology'],
  },
};

export function getSouthNodeSignContent(sign: ZodiacSign): SouthNodeSignContent {
  const content = SOUTH_NODE_CONTENT[sign];
  return { sign, ...content };
}

export function getAdjacentSigns(sign: ZodiacSign): { prev: ZodiacSign; next: ZodiacSign } {
  const idx = ALL_SIGN_KEYS.indexOf(sign);
  const prev = ALL_SIGN_KEYS[(idx - 1 + 12) % 12];
  const next = ALL_SIGN_KEYS[(idx + 1) % 12];
  return { prev, next };
}
