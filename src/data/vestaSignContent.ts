/* ──────────────────────────────────────────────────────────────
   Vesta in Signs Content
   SEO-rich content for Vesta through each zodiac sign.
   Sacred devotion, spiritual focus, service style.
   IMPORTANT: Vesta rules Virgo in the Align rulership system.
   ────────────────────────────────────────────────────────────── */

import {
  SIGNS,
  ALL_SIGN_KEYS,
  getElementColor,
  type ZodiacSign,
} from './compatibilityContent';

export { SIGNS, ALL_SIGN_KEYS, getElementColor, type ZodiacSign };

export interface VestaSignContent {
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

export const VESTA_SYMBOL = '🜨'; // Vesta

const VESTA_CONTENT: Record<ZodiacSign, Omit<VestaSignContent, 'sign'>> = {
  aries: {
    title: 'Vesta in Aries',
    subtitle: 'The Sacred Warrior',
    intro: 'Vesta in Aries devotes themselves with fierce, pioneering intensity to causes they believe in. Their sacred flame burns with the fire of action, independence, and courageous initiative. They serve by being the first to step forward, the one who lights the way for others.',
    sections: [
      {
        title: 'Sacred Devotion',
        icon: '🕯',
        paragraphs: [
          'Vesta in Aries channels the sacred flame through action and initiative. For these individuals, devotion is not a quiet, contemplative affair. It is a blazing, active commitment that demands full-body engagement. They pray with their muscles, worship through competition, and find the divine in the moment of decisive action.',
          'Their devotion is intensely personal. Vesta in Aries does not serve by committee or consensus; they serve by taking individual action when no one else will. They are the ones who run toward the burning building, who start the organization that nobody else was brave enough to start, who devote themselves to causes that require genuine courage.',
          'The shadow of this placement is burnout through over-commitment to action. Vesta in Aries can devote themselves so completely to their mission that they forget to eat, sleep, or tend to their own wellbeing. Learning to sustain the flame without consuming themselves is their essential discipline.',
        ],
      },
      {
        title: 'Spiritual Focus',
        icon: '🔥',
        paragraphs: [
          'The spiritual focus of Vesta in Aries is the development of courage as a spiritual practice. They understand intuitively that the path to the divine requires bravery, that spiritual growth demands the willingness to face fears, challenge comfortable beliefs, and step into the unknown.',
          'Their meditation is movement. Running, martial arts, dance, physical labor: these are the practices that connect Vesta in Aries to the sacred. Sitting still in contemplation may feel impossible, but focused physical activity can produce states of transcendent clarity and divine connection.',
        ],
      },
      {
        title: 'Service Style',
        icon: '🤲',
        paragraphs: [
          'Vesta in Aries serves through bold, decisive action. They are the volunteers who show up first, the activists who lead the march, the healers who specialize in crisis intervention. Their service is most powerful in situations that require immediate, courageous response.',
          'Their approach to service can be intense and demanding. They expect the same level of commitment from those they serve alongside, and they have little patience for bureaucracy or half-measures. The evolved expression of Vesta in Aries learns to serve with intensity while making space for others who move at a different pace.',
        ],
      },
    ],
    keywords: ['vesta in aries', 'vesta aries meaning', 'aries vesta astrology', 'sacred warrior astrology', 'vesta devotion aries'],
  },
  taurus: {
    title: 'Vesta in Taurus',
    subtitle: 'The Sacred Steward',
    intro: 'Vesta in Taurus devotes themselves to the sacred care of physical resources, natural beauty, and earthly abundance. Their devotion is steady, sensual, and grounded in the belief that tending the material world is itself a spiritual practice.',
    sections: [
      {
        title: 'Sacred Devotion',
        icon: '🕯',
        paragraphs: [
          'Vesta in Taurus channels the sacred flame through the stewardship of the physical world. For these individuals, devotion takes the form of careful tending: growing food, maintaining beautiful spaces, managing resources wisely, and creating environments of comfort and safety. They find God in the garden, in the kitchen, in the patient work of building something beautiful with their hands.',
          'Their devotion is steady and unwavering. Once Vesta in Taurus commits to a cause, a practice, or a path of service, they do not waver. Their dedication has the quality of deep roots: invisible, patient, and virtually impossible to uproot. This consistency is both their greatest strength and their potential limitation.',
          'The shadow of this placement is rigidity in devotion. Vesta in Taurus can become so attached to their way of serving that they resist necessary change, clinging to traditions and methods that have outlived their usefulness. Flexibility in service is their growth edge.',
        ],
      },
      {
        title: 'Spiritual Focus',
        icon: '🔥',
        paragraphs: [
          'The spiritual focus of Vesta in Taurus is the sacredness of the body and the earth. They understand that the physical world is not an obstacle to spiritual growth but its vehicle. Caring for the body, tending the earth, and creating beauty are acts of worship for this placement.',
          'Their spiritual practice is deeply sensory. Cooking, gardening, crafting, and spending time in nature are the rituals that connect Vesta in Taurus to the divine. They are the ones who understand that a meal prepared with love can be as sacred as any sacrament.',
        ],
      },
      {
        title: 'Service Style',
        icon: '🤲',
        paragraphs: [
          'Vesta in Taurus serves through the provision of material comfort and security. They are the volunteers who bring food, the organizers who create beautiful fundraising events, the quiet supporters who ensure that practical needs are met. Their service is not flashy but absolutely essential.',
          'Their approach to service is patient and thorough. They do not rush through tasks or settle for sloppy results. Vesta in Taurus brings craft and care to every act of service, understanding that the quality of the giving matters as much as the gift itself.',
        ],
      },
    ],
    keywords: ['vesta in taurus', 'vesta taurus meaning', 'taurus vesta astrology', 'sacred steward astrology', 'vesta devotion taurus'],
  },
  gemini: {
    title: 'Vesta in Gemini',
    subtitle: 'The Sacred Communicator',
    intro: 'Vesta in Gemini devotes themselves to the spread of knowledge, ideas, and connection through communication. Their sacred flame burns through words, teaching, and the relentless pursuit of understanding. They serve by bridging gaps in comprehension and making wisdom accessible.',
    sections: [
      {
        title: 'Sacred Devotion',
        icon: '🕯',
        paragraphs: [
          'Vesta in Gemini channels the sacred flame through language and intellectual connection. For these individuals, sharing knowledge is an act of devotion. They feel called to teach, write, explain, and translate complex ideas into accessible wisdom. Every conversation has the potential to be a sacred exchange.',
          'Their devotion is to understanding itself. Vesta in Gemini is devoted to the idea that ignorance is the root of suffering and that the free flow of information can heal the world. They are tireless in their pursuit of knowledge and equally tireless in their desire to share what they learn.',
          'The shadow of this placement is scattered devotion. Vesta in Gemini can spread their sacred fire across so many topics and projects that no single flame burns brightly enough to create real change. Learning to focus their communicative gifts is their essential discipline.',
        ],
      },
      {
        title: 'Spiritual Focus',
        icon: '🔥',
        paragraphs: [
          'The spiritual focus of Vesta in Gemini is the power of the word. They understand that language shapes reality, that naming something changes our relationship to it, and that the right words at the right moment can transform consciousness. Their spiritual practice centers on mindful communication.',
          'Study, writing, teaching, and meaningful conversation are their spiritual disciplines. Vesta in Gemini may keep journals, maintain blogs, or create podcasts as forms of devotional practice. The act of articulating truth, in any medium, connects them to the sacred.',
        ],
      },
      {
        title: 'Service Style',
        icon: '🤲',
        paragraphs: [
          'Vesta in Gemini serves through education, communication, and the sharing of information. They are natural teachers, writers, mentors, and information architects who devote themselves to making knowledge accessible to all.',
          'Their service style is versatile and adaptive. They can switch topics, audiences, and methods with ease, meeting people where they are and translating wisdom into language that the listener can receive. Their greatest gift in service is the ability to make the complex simple without making it simplistic.',
        ],
      },
    ],
    keywords: ['vesta in gemini', 'vesta gemini meaning', 'gemini vesta astrology', 'sacred communicator astrology', 'vesta devotion gemini'],
  },
  cancer: {
    title: 'Vesta in Cancer',
    subtitle: 'The Sacred Nurturer',
    intro: 'Vesta in Cancer devotes themselves to the creation of emotional safety, family bonds, and the sacred art of nurturing. Their devotion is maternal, protective, and deeply rooted in the belief that love, properly held, can heal any wound.',
    sections: [
      {
        title: 'Sacred Devotion',
        icon: '🕯',
        paragraphs: [
          'Vesta in Cancer channels the sacred flame through nurturing, emotional care, and the creation of safe spaces. For these individuals, the home is the temple, the kitchen is the altar, and the act of feeding, holding, and comforting others is a direct expression of divine love. They devote themselves to creating environments where people feel safe enough to be vulnerable.',
          'Their devotion is fierce and protective. Vesta in Cancer guards their loved ones with the intensity of a mother bear, and they will sacrifice their own comfort, ambition, and even health to ensure that those in their care are safe and nurtured. This selfless devotion is both their gift and their burden.',
          'The shadow of this placement is martyrdom in the name of love. Vesta in Cancer can become so devoted to nurturing others that they neglect their own needs, eventually burning out or becoming resentful. Learning to receive care as well as give it is their essential growth.',
        ],
      },
      {
        title: 'Spiritual Focus',
        icon: '🔥',
        paragraphs: [
          'The spiritual focus of Vesta in Cancer is the sacredness of emotional life. They understand that feelings are not obstacles to spiritual growth but its very substance. Processing emotions, holding space for grief, celebrating joy, and creating environments of emotional safety are their forms of worship.',
          'Their spiritual practice revolves around home, family, and ancestral connection. Cooking family recipes, maintaining family traditions, and honoring the memory of those who came before are the rituals that connect Vesta in Cancer to the sacred. The family altar, literal or metaphorical, is their place of power.',
        ],
      },
      {
        title: 'Service Style',
        icon: '🤲',
        paragraphs: [
          'Vesta in Cancer serves through emotional care and the creation of community. They are the volunteers who run the soup kitchen, the counselors who hold space for grief, the community builders who create belonging where there was isolation.',
          'Their service is personal and deeply felt. They do not serve from a distance or through systems; they serve face-to-face, heart-to-heart. The warmth of their presence is itself a form of healing, and their ability to make anyone feel welcome is a genuine spiritual gift.',
        ],
      },
    ],
    keywords: ['vesta in cancer', 'vesta cancer meaning', 'cancer vesta astrology', 'sacred nurturer astrology', 'vesta devotion cancer'],
  },
  leo: {
    title: 'Vesta in Leo',
    subtitle: 'The Sacred Creator',
    intro: 'Vesta in Leo devotes themselves to creative expression, joy, and the celebration of the human spirit. Their sacred flame burns through art, performance, and the generous sharing of their creative gifts. They serve by inspiring others to find and express their own inner light.',
    sections: [
      {
        title: 'Sacred Devotion',
        icon: '🕯',
        paragraphs: [
          'Vesta in Leo channels the sacred flame through creative expression and the celebration of life. For these individuals, creating art, performing, and sharing joy are not hobbies but sacred callings. They believe that the divine speaks through beauty, play, and the courageous act of putting your heart\'s truth into the world.',
          'Their devotion is dramatic and visible. Vesta in Leo does not hide their light; they place it on the highest pedestal and tend it with pride. Their creative practice has a ritualistic quality, an opening night feels like a ceremony, a finished painting feels like a prayer, a moment of shared laughter feels like communion.',
          'The shadow of this placement is devotion to applause rather than to the creative work itself. Vesta in Leo can become so attached to the response their creative expression receives that they begin creating for the audience rather than from the soul. Reconnecting with the intrinsic joy of creation is their essential discipline.',
        ],
      },
      {
        title: 'Spiritual Focus',
        icon: '🔥',
        paragraphs: [
          'The spiritual focus of Vesta in Leo is the sacred power of joy and self-expression. They understand that joy is not frivolous but a profound spiritual force, that laughter heals, that play connects, and that the courage to express oneself authentically is a form of prayer.',
          'Their spiritual practice is creative. Painting, singing, dancing, performing, writing, and any form of artistic expression serve as their connection to the divine. Vesta in Leo finds God in the spotlight, in the moment when audience and performer merge into a single experience of beauty.',
        ],
      },
      {
        title: 'Service Style',
        icon: '🤲',
        paragraphs: [
          'Vesta in Leo serves through inspiration, entertainment, and the sharing of creative gifts. They are the art teachers, the community theater directors, the children\'s entertainers, and the artists who create work that lifts the collective spirit.',
          'Their service style is generous and warm. They give of themselves freely, sharing their talent, their energy, and their enthusiasm with anyone who needs a reminder that life is beautiful. Their greatest service is permission: by shining brightly, they give others permission to shine too.',
        ],
      },
    ],
    keywords: ['vesta in leo', 'vesta leo meaning', 'leo vesta astrology', 'sacred creator astrology', 'vesta devotion leo'],
  },
  virgo: {
    title: 'Vesta in Virgo',
    subtitle: 'The Sacred Flame Keeper (Vesta in Domicile)',
    intro: 'Vesta in Virgo is in its ruling sign, creating the most naturally devoted and service-oriented placement in the zodiac. As the ruler of Virgo, Vesta here expresses its fullest power: meticulous devotion, sacred service, and the ability to find the divine in the smallest details of daily life.',
    sections: [
      {
        title: 'Sacred Devotion',
        icon: '🕯',
        paragraphs: [
          'Vesta in Virgo, occupying its home sign, represents the purest expression of sacred devotion. These individuals are born flame keepers who tend the fire of their calling with extraordinary precision and unwavering commitment. Every detail matters, every task is performed with reverence, and the distinction between work and worship dissolves completely.',
          'Their devotion is expressed through perfecting their craft, refining their service, and maintaining the systems that support life. Vesta in Virgo does not need grand stages or public recognition; the quiet satisfaction of doing something well, of serving with precision and care, is its own reward. The sweeping of a floor, when done with full attention, becomes a sacred act.',
          'The shadow of this placement is perfectionism that prevents action. Vesta in Virgo can become so devoted to getting things right that they never complete anything, or they hold themselves to standards so impossibly high that they exist in a constant state of self-criticism. Learning that good enough is sometimes sacred enough is their essential lesson.',
        ],
      },
      {
        title: 'Spiritual Focus',
        icon: '🔥',
        paragraphs: [
          'The spiritual focus of Vesta in Virgo in domicile is the sacredness of daily practice. They understand that enlightenment is not a single moment of transcendence but the accumulation of thousands of mindful, devoted, perfectly executed moments. Chopping vegetables, sorting files, cleaning a wound, organizing a schedule: these are their sutras.',
          'Their spiritual practice is ritualized and routine-based. They thrive on daily disciplines: morning rituals, health practices, cleaning routines, and work schedules that are followed with monastic devotion. The consistency of practice is itself the prayer.',
        ],
      },
      {
        title: 'Service Style',
        icon: '🤲',
        paragraphs: [
          'Vesta in Virgo serves through meticulous, practical care. They are the healers, the herbalists, the organizers, the editors, and the systems designers who make the world work better through devoted attention to detail. Their service is often invisible but absolutely essential.',
          'In domicile, Vesta in Virgo\'s service reaches its highest expression: genuine selflessness combined with extraordinary competence. They do not serve for recognition or reward but because service is their nature. The world functions better because of these quiet devotees, and their contribution, though often unsung, is immeasurable.',
        ],
      },
    ],
    keywords: ['vesta in virgo', 'vesta virgo meaning', 'virgo vesta astrology', 'vesta domicile virgo', 'sacred flame keeper astrology', 'vesta devotion virgo'],
  },
  libra: {
    title: 'Vesta in Libra',
    subtitle: 'The Sacred Harmonizer',
    intro: 'Vesta in Libra devotes themselves to creating harmony, beauty, and justice in all relationships. With Juno as Libra\'s ruler, there is a natural interplay between devoted service and committed partnership. Vesta in Libra serves the sacred through the art of balance and the creation of peaceful coexistence.',
    sections: [
      {
        title: 'Sacred Devotion',
        icon: '🕯',
        paragraphs: [
          'Vesta in Libra channels the sacred flame through the creation of harmony, beauty, and relational balance. For these individuals, devotion is expressed through the careful tending of relationships, the creation of beautiful environments, and the patient work of building bridges between people who disagree. Every act of peacemaking is an act of worship.',
          'Their devotion is elegant and measured. Vesta in Libra does not rush to serve; they carefully consider the most balanced, fair, and beautiful way to offer their gifts. Quality and aesthetics matter in their service; how something is done is as important as what is done.',
          'The shadow of this placement is sacrificing truth for harmony. Vesta in Libra can become so devoted to keeping the peace that they suppress their own needs and opinions, creating a surface tranquility that masks deep discontent. Learning to serve authentically, even when it creates temporary disharmony, is their growth edge.',
        ],
      },
      {
        title: 'Spiritual Focus',
        icon: '🔥',
        paragraphs: [
          'The spiritual focus of Vesta in Libra is the sacredness of relationship and beauty. They understand that genuine connection between people is a spiritual achievement, that beauty is a form of truth, and that the creation of harmony in a chaotic world is sacred work.',
          'Their spiritual practice involves aesthetics, partnership, and the cultivation of peace. Art appreciation, couples rituals, meditation on beauty, and the mindful practice of fairness and balance are the disciplines that connect Vesta in Libra to the divine.',
        ],
      },
      {
        title: 'Service Style',
        icon: '🤲',
        paragraphs: [
          'Vesta in Libra serves through mediation, design, counseling, and the creation of beautiful, harmonious environments. They are the relationship counselors, the interior designers, the diplomats, and the event planners who bring grace and balance to every situation.',
          'Their service style is collaborative and inclusive. They excel at bringing people together, finding common ground, and creating spaces where everyone feels valued and heard. Their greatest gift in service is the ability to see all sides of a situation and find solutions that honor everyone involved.',
        ],
      },
    ],
    keywords: ['vesta in libra', 'vesta libra meaning', 'libra vesta astrology', 'sacred harmonizer astrology', 'vesta devotion libra'],
  },
  scorpio: {
    title: 'Vesta in Scorpio',
    subtitle: 'The Sacred Alchemist',
    intro: 'Vesta in Scorpio devotes themselves to the deepest forms of transformation, healing, and psychological truth. Their sacred flame burns in the underworld, illuminating what others fear to face. They serve by going into the darkness and bringing back medicine for the collective soul.',
    sections: [
      {
        title: 'Sacred Devotion',
        icon: '🕯',
        paragraphs: [
          'Vesta in Scorpio channels the sacred flame through psychological depth, transformative healing, and unflinching truth-telling. For these individuals, devotion means going where angels fear to tread. They are devoted to truth at any cost, and they understand that genuine healing requires the courage to face the shadow.',
          'Their devotion is intense and all-consuming. When Vesta in Scorpio commits to a cause, a healing path, or a transformative practice, they do so with complete surrender. Half-measures are impossible; they either burn with total commitment or they do not engage at all.',
          'The shadow of this placement is obsessive devotion that becomes destructive. Vesta in Scorpio can become so consumed by their quest for truth or transformation that they lose perspective, alienate allies, and burn bridges. Learning to hold intensity without being consumed by it is their essential discipline.',
        ],
      },
      {
        title: 'Spiritual Focus',
        icon: '🔥',
        paragraphs: [
          'The spiritual focus of Vesta in Scorpio is the sacred power of death and rebirth. They understand that genuine transformation requires the death of the old self, that healing happens in the wound, and that the darkest night of the soul is the gateway to the brightest dawn.',
          'Their spiritual practice is alchemical: transforming pain into wisdom, fear into courage, and shadow into light. Psychotherapy, shamanic work, deep meditation, and any practice that involves confronting the unconscious are the rituals that connect Vesta in Scorpio to the sacred.',
        ],
      },
      {
        title: 'Service Style',
        icon: '🤲',
        paragraphs: [
          'Vesta in Scorpio serves through deep healing work, crisis intervention, and truth-telling. They are the therapists, the hospice workers, the investigators, and the shamans who work at the boundary between life and death, light and shadow.',
          'Their service is not comfortable, but it is profoundly needed. They hold space for the experiences that other people cannot face: grief, trauma, betrayal, mortality. Their presence in these moments is itself healing, because they are not afraid to sit with the darkness.',
        ],
      },
    ],
    keywords: ['vesta in scorpio', 'vesta scorpio meaning', 'scorpio vesta astrology', 'sacred alchemist astrology', 'vesta devotion scorpio'],
  },
  sagittarius: {
    title: 'Vesta in Sagittarius',
    subtitle: 'The Sacred Seeker',
    intro: 'Vesta in Sagittarius devotes themselves to the pursuit of truth, wisdom, and the expansion of consciousness. Their sacred flame burns with the fire of exploration, philosophy, and the conviction that meaning exists even in the most chaotic universe.',
    sections: [
      {
        title: 'Sacred Devotion',
        icon: '🕯',
        paragraphs: [
          'Vesta in Sagittarius channels the sacred flame through the relentless pursuit of truth and meaning. For these individuals, devotion is inseparable from exploration. They are devoted to the journey of understanding, and their faith burns brightest when they are pushing beyond the boundaries of what they know.',
          'Their devotion is expansive and generous. Vesta in Sagittarius does not hoard wisdom; they share it freely, teach enthusiastically, and inspire others to embark on their own quests for meaning. Their devotion to truth makes them natural teachers, writers, and spiritual guides.',
          'The shadow of this placement is zealotry. Vesta in Sagittarius can become so devoted to their particular truth that they become preachy, judgmental, or dismissive of perspectives that differ from their own. Learning to hold truth with open hands rather than clenched fists is their essential discipline.',
        ],
      },
      {
        title: 'Spiritual Focus',
        icon: '🔥',
        paragraphs: [
          'The spiritual focus of Vesta in Sagittarius is the sacred quest itself. They understand that the search for meaning is itself meaningful, that the journey toward truth transforms the seeker, and that faith is not the absence of doubt but the courage to seek despite it.',
          'Their spiritual practice is adventurous: pilgrimage, sacred travel, cross-cultural spiritual exploration, and the study of diverse philosophical traditions. Vesta in Sagittarius finds the divine in the unfamiliar, and their faith deepens with every new horizon they encounter.',
        ],
      },
      {
        title: 'Service Style',
        icon: '🤲',
        paragraphs: [
          'Vesta in Sagittarius serves through teaching, publishing, mentoring, and the sharing of wisdom across cultural boundaries. They are the professors, the travel guides, the missionaries of meaning who bring enlightenment to wherever they go.',
          'Their service style is enthusiastic and inspiring. They light fires in others, awakening curiosity and the hunger for deeper understanding. Their greatest gift in service is the ability to make wisdom feel exciting and accessible rather than dry and exclusive.',
        ],
      },
    ],
    keywords: ['vesta in sagittarius', 'vesta sagittarius meaning', 'sagittarius vesta astrology', 'sacred seeker astrology', 'vesta devotion sagittarius'],
  },
  capricorn: {
    title: 'Vesta in Capricorn',
    subtitle: 'The Sacred Builder',
    intro: 'Vesta in Capricorn devotes themselves to building lasting structures that serve the long-term good. Their sacred flame burns with the steady intensity of ambition directed toward meaningful purpose. They serve through disciplined effort, institutional building, and the patient creation of legacy.',
    sections: [
      {
        title: 'Sacred Devotion',
        icon: '🕯',
        paragraphs: [
          'Vesta in Capricorn channels the sacred flame through discipline, responsibility, and the construction of enduring institutions. For these individuals, devotion is expressed through sustained effort over time. They do not burn brightly and burn out; they burn steadily for decades, tending the flame of their purpose with the patience of a master craftsperson.',
          'Their devotion is serious and purposeful. Vesta in Capricorn does not engage in service for emotional satisfaction or spiritual highs; they serve because work must be done, because structures must be maintained, and because someone must accept the responsibility of keeping civilization functioning.',
          'The shadow of this placement is workaholism disguised as devotion. Vesta in Capricorn can become so identified with their work that they lose touch with joy, play, and the softer dimensions of devotion. Learning that rest and pleasure are also sacred is their growth edge.',
        ],
      },
      {
        title: 'Spiritual Focus',
        icon: '🔥',
        paragraphs: [
          'The spiritual focus of Vesta in Capricorn is the sacredness of responsibility and mastery. They understand that accepting responsibility is a spiritual act, that the patient mastery of a craft is a form of worship, and that building something that outlasts your life is a way of touching eternity.',
          'Their spiritual practice is disciplined and structured. Regular routines, professional development, and the patient accumulation of expertise are the rituals that connect Vesta in Capricorn to the sacred. They find God in the mountain they are climbing, in the summit they may or may not reach.',
        ],
      },
      {
        title: 'Service Style',
        icon: '🤲',
        paragraphs: [
          'Vesta in Capricorn serves through institution-building, mentoring, and the creation of systems that function well over long periods. They are the administrators, the organizers, the behind-the-scenes leaders who keep organizations running and communities organized.',
          'Their service style is reliable and professional. They may lack the warmth of water sign service or the excitement of fire sign service, but their contribution is foundational. Without the steady, disciplined service of Vesta in Capricorn, most institutions would collapse.',
        ],
      },
    ],
    keywords: ['vesta in capricorn', 'vesta capricorn meaning', 'capricorn vesta astrology', 'sacred builder astrology', 'vesta devotion capricorn'],
  },
  aquarius: {
    title: 'Vesta in Aquarius',
    subtitle: 'The Sacred Visionary',
    intro: 'Vesta in Aquarius devotes themselves to humanitarian causes, social innovation, and the creation of a more equitable future. Their sacred flame burns for the collective, illuminating new possibilities for human community and technological progress in service of the common good.',
    sections: [
      {
        title: 'Sacred Devotion',
        icon: '🕯',
        paragraphs: [
          'Vesta in Aquarius channels the sacred flame through social innovation and humanitarian service. For these individuals, devotion means working for the betterment of the collective, not just individuals. They are devoted to ideas, movements, and technologies that have the potential to improve life for everyone, not just the privileged few.',
          'Their devotion is intellectual and communal. Vesta in Aquarius does not serve through personal attention but through systemic change. They build networks, create platforms, and develop technologies that empower communities. Their sacred fire burns in the server room as much as in the sanctuary.',
          'The shadow of this placement is emotional detachment in the name of service. Vesta in Aquarius can become so focused on humanity in the abstract that they neglect the actual humans in their immediate circle. Learning to combine systemic thinking with personal warmth is their essential discipline.',
        ],
      },
      {
        title: 'Spiritual Focus',
        icon: '🔥',
        paragraphs: [
          'The spiritual focus of Vesta in Aquarius is the sacredness of community and collective consciousness. They understand that individual awakening, without collective evolution, is incomplete. Their spiritual practice involves group work, community building, and the use of technology as a tool for consciousness expansion.',
          'Their spiritual practice is innovative and unorthodox. Online meditation groups, technology-facilitated spiritual communities, and new models for collective awakening are the rituals that resonate with Vesta in Aquarius. They are the ones who find sacred space in unconventional places.',
        ],
      },
      {
        title: 'Service Style',
        icon: '🤲',
        paragraphs: [
          'Vesta in Aquarius serves through social innovation, technology, and community organizing. They are the nonprofit founders, the open-source developers, the activists, and the social entrepreneurs who build systems that empower communities.',
          'Their service style is collaborative and egalitarian. They do not serve from above but alongside. Their greatest gift is the ability to see how individual contributions can be organized into collective power, creating movements and systems that are greater than the sum of their parts.',
        ],
      },
    ],
    keywords: ['vesta in aquarius', 'vesta aquarius meaning', 'aquarius vesta astrology', 'sacred visionary astrology', 'vesta devotion aquarius'],
  },
  pisces: {
    title: 'Vesta in Pisces',
    subtitle: 'The Sacred Mystic',
    intro: 'Vesta in Pisces devotes themselves to spiritual union, compassionate service, and the dissolution of the boundary between self and divine. Their sacred flame burns with the soft, infinite light of unconditional love, illuminating the path from suffering to transcendence.',
    sections: [
      {
        title: 'Sacred Devotion',
        icon: '🕯',
        paragraphs: [
          'Vesta in Pisces channels the sacred flame through mystical devotion, compassionate service, and the surrender of ego to something infinite. For these individuals, devotion is not a choice but a state of being. They are devoted to the divine in all its forms, and their service flows naturally from a sense of oneness with all life.',
          'Their devotion is selfless and often invisible. Vesta in Pisces serves quietly, anonymously, and without expectation of recognition. They are the anonymous donors, the silent prayers, the hands that reach out in the dark without any need to be identified. Their service is its own reward because it dissolves the illusion of separateness.',
          'The shadow of this placement is martyrdom and victimhood. Vesta in Pisces can become so devoted to others that they erase themselves, or they can use devotion as a way to avoid the difficult work of establishing their own identity and boundaries. Learning that healthy service requires a strong sense of self is their essential lesson.',
        ],
      },
      {
        title: 'Spiritual Focus',
        icon: '🔥',
        paragraphs: [
          'The spiritual focus of Vesta in Pisces is direct union with the divine. They do not seek God through concepts, structures, or doctrines but through direct, felt experience of transcendence. Meditation, prayer, chanting, and contemplative practices that quiet the mind and open the heart are their primary spiritual tools.',
          'Their spiritual practice is intuitive and often formless. They may not follow any established tradition but instead allow their practice to emerge organically from their inner guidance. Vesta in Pisces is the placement most likely to develop a completely original and deeply personal spiritual path.',
        ],
      },
      {
        title: 'Service Style',
        icon: '🤲',
        paragraphs: [
          'Vesta in Pisces serves through compassion, healing, and the holding of sacred space. They are the chaplains, the energy healers, the grief counselors, and the artists whose work heals without explanation. Their presence alone can be a form of service.',
          'Their service style is intuitive and empathic. They sense what is needed before it is articulated and respond with a gentleness that disarms defenses and opens hearts. Their greatest gift is the ability to see the divine in everyone, especially those whom the world has forgotten or discarded.',
        ],
      },
    ],
    keywords: ['vesta in pisces', 'vesta pisces meaning', 'pisces vesta astrology', 'sacred mystic astrology', 'vesta devotion pisces'],
  },
};

export function getVestaSignContent(sign: ZodiacSign): VestaSignContent {
  const content = VESTA_CONTENT[sign];
  return { sign, ...content };
}

export function getAdjacentSigns(sign: ZodiacSign): { prev: ZodiacSign; next: ZodiacSign } {
  const idx = ALL_SIGN_KEYS.indexOf(sign);
  const prev = ALL_SIGN_KEYS[(idx - 1 + 12) % 12];
  const next = ALL_SIGN_KEYS[(idx + 1) % 12];
  return { prev, next };
}
