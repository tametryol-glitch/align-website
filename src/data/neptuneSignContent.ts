/* ──────────────────────────────────────────────────────────────
   Neptune in Signs Content
   SEO-rich content for Neptune through each zodiac sign.
   Dreams, spirituality, illusions, creative vision, generational.
   ────────────────────────────────────────────────────────────── */

import {
  SIGNS,
  ALL_SIGN_KEYS,
  getElementColor,
  type ZodiacSign,
} from './compatibilityContent';

export { SIGNS, ALL_SIGN_KEYS, getElementColor, type ZodiacSign };

export interface NeptuneSignContent {
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

export const NEPTUNE_SYMBOL = '♆';

const NEPTUNE_CONTENT: Record<ZodiacSign, Omit<NeptuneSignContent, 'sign'>> = {
  aries: {
    title: 'Neptune in Aries',
    subtitle: 'The Visionary Warrior',
    intro: 'Neptune in Aries infuses the warrior archetype with spiritual vision and creative imagination. This generation dreams of heroic quests, channels divine inspiration into bold action, and must learn to distinguish between genuine spiritual courage and the illusion of invincibility.',
    sections: [
      {
        title: 'Dreams & Spirituality',
        icon: '🔮',
        paragraphs: [
          'Neptune in Aries creates a generation that experiences spirituality as a personal crusade. Their relationship with the divine is active, individualistic, and heroic. They dream of being spiritual warriors, channeling cosmic energy into decisive action. Prayer for them is less contemplation and more a battle cry aimed at the heavens.',
          'The creative vision of this placement is pioneering and original. Neptune in Aries artists create work that feels like it is bursting into existence for the first time. They are the ones who start new artistic movements, who create genres that did not exist before, and who approach creativity with the same fierce independence they bring to everything else.',
          'The spiritual danger here is messianic inflation, the belief that they alone are chosen to save the world. Neptune in Aries must learn that genuine spiritual courage includes the humility to serve without needing to be the hero of the story.',
        ],
      },
      {
        title: 'Illusions & Shadow',
        icon: '🌫',
        paragraphs: [
          'The illusions of Neptune in Aries center on identity and independence. This generation can deceive themselves about their own motives, believing they are fighting for a cause when they are really fighting for ego. They may idealize aggression, confusing force with strength, or romanticize the lone warrior path when collaboration would serve them better.',
          'Disillusionment comes when their heroic self-image collides with reality. The crash can be devastating, but it is also the doorway to genuine spiritual maturity. When Neptune in Aries surrenders the need to be special, they discover a deeper, quieter form of courage that does not require an audience.',
        ],
      },
      {
        title: 'Creative Vision',
        icon: '🎨',
        paragraphs: [
          'Neptune in Aries channels creative energy with explosive force. Art under this influence is raw, urgent, and unapologetically individual. These creators do not polish or refine; they unleash. The result can be breathtakingly original or chaotically unformed, and often both at once.',
          'The generational creative legacy of Neptune in Aries is the courage to create without precedent. They give the world permission to make art that has never been made before, to tell stories that have never been told, and to express truths that no one else dares to voice.',
        ],
      },
    ],
    keywords: ['neptune in aries', 'neptune aries generation', 'aries neptune meaning', 'neptune in aries astrology', 'spiritual warrior astrology'],
  },
  taurus: {
    title: 'Neptune in Taurus',
    subtitle: 'The Sacred Materialist',
    intro: 'Neptune in Taurus spiritualizes the material world, finding the divine in nature, beauty, and sensory experience. This generation dreams of earthly paradise, channels creative vision into tangible beauty, and must navigate the illusion that material security can provide spiritual fulfillment.',
    sections: [
      {
        title: 'Dreams & Spirituality',
        icon: '🔮',
        paragraphs: [
          'Neptune in Taurus experiences spirituality through the senses. For this generation, the sacred is not abstract or otherworldly; it lives in the taste of food, the texture of fabric, the sound of music, and the beauty of nature. They understand intuitively that the material world is not the opposite of the spiritual world but its expression.',
          'Their dreams are sensory and concrete. They envision a world of abundant beauty, sustainable luxury, and harmony between humanity and nature. Neptune in Taurus dreams of gardens, not temples, of feasts, not fasts, of heaven on earth rather than heaven after death.',
          'The spiritual gift of this placement is the ability to sacralize daily life. Neptune in Taurus teaches that cooking a meal, tending a garden, or creating something beautiful with your hands can be as profound a spiritual practice as any meditation.',
        ],
      },
      {
        title: 'Illusions & Shadow',
        icon: '🌫',
        paragraphs: [
          'The primary illusion of Neptune in Taurus is that material abundance equals spiritual fulfillment. This generation can confuse financial security with inner peace, or become so attached to physical comfort that they avoid the necessary discomforts of growth. The glamour of luxury can become a spiritual trap.',
          'Disillusionment for Neptune in Taurus often comes through financial loss or the realization that no amount of material beauty can fill a spiritual void. When the bubble bursts, they have the opportunity to discover a deeper, more resilient form of abundance that does not depend on external conditions.',
        ],
      },
      {
        title: 'Creative Vision',
        icon: '🎨',
        paragraphs: [
          'Neptune in Taurus creates art that appeals to the senses. Music, visual art, cuisine, and design flourish under this influence, and the creative output tends to be lush, beautiful, and grounded. These artists create work you can feel in your body, not just understand with your mind.',
          'The generational creative legacy is the elevation of craft. Neptune in Taurus proves that practical creativity, making beautiful objects, growing beautiful food, designing beautiful spaces, is as valid and spiritual as any abstract art form.',
        ],
      },
    ],
    keywords: ['neptune in taurus', 'neptune taurus generation', 'taurus neptune meaning', 'neptune in taurus astrology', 'sacred material astrology'],
  },
  gemini: {
    title: 'Neptune in Gemini',
    subtitle: 'The Mystical Communicator',
    intro: 'Neptune in Gemini dissolves the boundaries between fact and fiction, reason and imagination. This generation dreams in words, channels creative vision through communication, and must navigate a world where the line between truth and illusion is perpetually blurred.',
    sections: [
      {
        title: 'Dreams & Spirituality',
        icon: '🔮',
        paragraphs: [
          'Neptune in Gemini experiences spirituality through language, ideas, and the connections between seemingly unrelated concepts. For this generation, a perfectly constructed sentence can be a prayer, a brilliant conversation can be a mystical experience, and the right words at the right moment can open doorways to transcendence.',
          'Their dreams are verbal and visual simultaneously. They envision worlds of perfect communication, where misunderstanding is impossible and ideas flow freely between minds. Neptune in Gemini dreams of a language that transcends language, a way of knowing that does not require words.',
          'The spiritual gift here is the recognition that consciousness itself is communicative. Neptune in Gemini understands that the universe speaks through signs, synchronicities, and patterns, and they have an uncanny ability to read these cosmic messages.',
        ],
      },
      {
        title: 'Illusions & Shadow',
        icon: '🌫',
        paragraphs: [
          'The central illusion of Neptune in Gemini is confusing eloquence with truth. This generation can be so enchanted by beautiful language that they fail to notice when it is being used to deceive. They may also deceive themselves through rationalization, constructing elegant mental frameworks that justify avoiding emotional or spiritual depth.',
          'Disillusionment comes when words fail, when a situation arises that cannot be talked through, analyzed, or explained away. In the silence that follows, Neptune in Gemini discovers that the deepest truths exist beyond language, in the spaces between words.',
        ],
      },
      {
        title: 'Creative Vision',
        icon: '🎨',
        paragraphs: [
          'Neptune in Gemini produces extraordinary writers, poets, lyricists, and communicators. Their creative output blurs the line between reality and fiction, journalism and poetry, information and art. They create media that simultaneously informs and enchants.',
          'The generational creative legacy is storytelling that changes consciousness. Neptune in Gemini proves that a well-told story can transform how people think, feel, and perceive reality, and that there is magic in the act of communication itself.',
        ],
      },
    ],
    keywords: ['neptune in gemini', 'neptune gemini generation', 'gemini neptune meaning', 'neptune in gemini astrology', 'mystical communication astrology'],
  },
  cancer: {
    title: 'Neptune in Cancer',
    subtitle: 'The Dreaming Nurturer',
    intro: 'Neptune in Cancer sanctifies the home, the mother, and emotional belonging. This generation dreams of perfect families, channels creative vision through nurturing, and must navigate the illusion that returning to an idealized past can heal the wounds of the present.',
    sections: [
      {
        title: 'Dreams & Spirituality',
        icon: '🔮',
        paragraphs: [
          'Neptune in Cancer experiences spirituality through emotional connection, family bonds, and the feeling of belonging. For this generation, home is a temple, motherhood is a mystical calling, and the act of nurturing is a direct expression of divine love. They seek the sacred in the most intimate and domestic spaces of life.',
          'Their dreams are deeply nostalgic. They yearn for a golden age of family unity, community belonging, and emotional safety that may never have actually existed. This longing, when recognized as a spiritual impulse rather than a historical memory, can drive profound creative and nurturing work.',
          'The spiritual gift is emotional depth and empathic sensitivity. Neptune in Cancer feels the suffering of others in their own body and responds with a compassion that asks nothing in return. They are natural healers of the heart.',
        ],
      },
      {
        title: 'Illusions & Shadow',
        icon: '🌫',
        paragraphs: [
          'The primary illusion of Neptune in Cancer is the idealization of the past. This generation can become so enchanted by nostalgic fantasies that they fail to engage with the present. They may idealize their mothers, their childhoods, or their ancestral heritage, refusing to see the shadows that existed alongside the beauty.',
          'Disillusionment comes when the idealized family or homeland fails to match the dream. The pain of this awakening can be devastating, but it opens the door to a more mature form of love, one that embraces people as they are rather than as they are imagined to be.',
        ],
      },
      {
        title: 'Creative Vision',
        icon: '🎨',
        paragraphs: [
          'Neptune in Cancer creates art that feels like home. Music that evokes memory, film that captures the beauty of family life, photography that immortalizes everyday moments of love, these are the creative hallmarks of this placement. The art is intimate, emotional, and deeply resonant.',
          'The generational creative legacy is proving that the personal is universal. Neptune in Cancer shows that stories of home, family, and emotional belonging speak to something deep in every human heart, regardless of culture or circumstance.',
        ],
      },
    ],
    keywords: ['neptune in cancer', 'neptune cancer generation', 'cancer neptune meaning', 'neptune in cancer astrology', 'dreaming nurturer astrology'],
  },
  leo: {
    title: 'Neptune in Leo',
    subtitle: 'The Glamorous Visionary',
    intro: 'Neptune in Leo infuses creative self-expression with divine imagination and cinematic grandeur. This generation dreams in technicolor, channels spiritual vision through performance and spectacle, and must navigate the illusion that fame equals meaning.',
    sections: [
      {
        title: 'Dreams & Spirituality',
        icon: '🔮',
        paragraphs: [
          'Neptune in Leo experiences spirituality through creative expression, romance, and the ecstatic experience of being truly seen. For this generation, the stage is sacred space, applause is a form of communion, and the act of shining one\'s light fully is a spiritual practice. They believe that the divine expresses itself through beauty, joy, and the courage to perform.',
          'Their dreams are grand, cinematic, and deeply personal. They envision themselves as stars in a cosmic drama, and this is not mere ego but a genuine sense that each person\'s life is a work of art with spiritual significance. Neptune in Leo dreams of a world where every person is celebrated for their unique gifts.',
          'The spiritual gift is the ability to inspire. Neptune in Leo radiates a warmth and creative passion that ignites the divine spark in others. They remind people that joy, play, and creative expression are not indulgences but essential aspects of a spiritual life.',
        ],
      },
      {
        title: 'Illusions & Shadow',
        icon: '🌫',
        paragraphs: [
          'The central illusion of Neptune in Leo is that being adored equals being loved. This generation can confuse fame with fulfillment, applause with acceptance, and performing a role with being authentic. The glamour of celebrity can become a spiritual trap that keeps them performing for an audience instead of living their truth.',
          'Disillusionment comes when the spotlight fades or when they realize that the person their audience loves is a character, not their authentic self. This painful moment is the gateway to genuine self-expression, creating and performing from the soul rather than for validation.',
        ],
      },
      {
        title: 'Creative Vision',
        icon: '🎨',
        paragraphs: [
          'Neptune in Leo produces dazzling creative output. Cinema, musical theater, popular music, and romance fiction flourish under this influence. The creative vision is glamorous, romantic, and larger than life, transforming ordinary human experiences into mythic narratives.',
          'The generational creative legacy is the dream factory. Neptune in Leo creates entertainment industries and art forms that provide collective escape, inspiration, and the vicarious experience of being magnificent. At their best, these creations do not distract from reality but illuminate it through the lens of beauty and wonder.',
        ],
      },
    ],
    keywords: ['neptune in leo', 'neptune leo generation', 'leo neptune meaning', 'neptune in leo astrology', 'glamorous visionary astrology'],
  },
  virgo: {
    title: 'Neptune in Virgo',
    subtitle: 'The Healing Perfectionist',
    intro: 'Neptune in Virgo channels spiritual vision into practical healing and service. This generation dreams of a perfected world, brings imagination to the craft of wellness, and must navigate the illusion that enough analysis and effort can eliminate all suffering. With Vesta ruling Virgo, there is a sacred devotion to this healing work.',
    sections: [
      {
        title: 'Dreams & Spirituality',
        icon: '🔮',
        paragraphs: [
          'Neptune in Virgo experiences spirituality through service, healing, and the pursuit of wholeness. For this generation, the sacred is found in the details: the precise herb that heals, the perfect system that eliminates waste, the daily practice that gradually transforms. With Vesta as Virgo\'s ruler, devotion to this practical spirituality takes on a flame-like intensity.',
          'Their dreams are of a healed world. They envision a future where illness is prevented rather than treated, where systems run perfectly, and where every detail of life has been refined to serve human wellbeing. Neptune in Virgo dreams of heaven as an efficiently run sanctuary.',
          'The spiritual gift is the ability to find meaning in humble work. Neptune in Virgo teaches that folding laundry, preparing medicine, and perfecting a craft can be as sacred as any grand spiritual quest, perhaps more so.',
        ],
      },
      {
        title: 'Illusions & Shadow',
        icon: '🌫',
        paragraphs: [
          'The primary illusion of Neptune in Virgo is that perfection is achievable and that imperfection equals failure. This generation can become so focused on fixing what is wrong that they fail to appreciate what is already whole. Anxiety about details, health obsession, and spiritual perfectionism are common shadow expressions.',
          'Disillusionment comes when they realize that no amount of refinement can produce a perfect world. This surrender is paradoxically healing: when Neptune in Virgo stops trying to fix everything, they discover a compassion for imperfection that is itself a form of grace.',
        ],
      },
      {
        title: 'Creative Vision',
        icon: '🎨',
        paragraphs: [
          'Neptune in Virgo creates art that serves a practical purpose. Design that improves daily life, writing that clarifies complex health information, music that literally heals, these are the creative expressions of this placement. Beauty here is functional, and function is beautiful.',
          'The generational creative legacy is the integration of art and health, beauty and utility. Neptune in Virgo proves that the most profound creative acts are often the most practical, that there is deep artistry in a well-designed system and deep healing in a beautifully crafted remedy.',
        ],
      },
    ],
    keywords: ['neptune in virgo', 'neptune virgo generation', 'virgo neptune meaning', 'neptune in virgo astrology', 'healing perfectionist astrology'],
  },
  libra: {
    title: 'Neptune in Libra',
    subtitle: 'The Romantic Idealist',
    intro: 'Neptune in Libra idealizes love, partnership, and social harmony. This generation dreams of perfect relationships, channels creative vision through beauty and balance, and must navigate the illusion that outer harmony can substitute for inner peace. With Juno ruling Libra, the idealization of committed partnership is especially potent.',
    sections: [
      {
        title: 'Dreams & Spirituality',
        icon: '🔮',
        paragraphs: [
          'Neptune in Libra experiences spirituality through beauty, partnership, and the quest for harmony. For this generation, a balanced relationship is a spiritual achievement, a beautiful space is a sanctuary, and the creation of social harmony is a sacred calling. With Juno as Libra\'s ruler, committed partnership becomes the primary vessel for spiritual experience.',
          'Their dreams are of perfect love and a just society. Neptune in Libra envisions a world where relationships are effortlessly harmonious, where beauty is universally accessible, and where justice prevails without conflict. It is a gorgeous dream, and the longing for it drives much of this generation\'s creative and social work.',
          'The spiritual gift is the ability to see beauty everywhere and to create harmony where there was discord. Neptune in Libra brings a grace and aesthetic sensibility to everything it touches, reminding the world that beauty is not superficial but a genuine spiritual force.',
        ],
      },
      {
        title: 'Illusions & Shadow',
        icon: '🌫',
        paragraphs: [
          'The central illusion of Neptune in Libra is that the right relationship will complete them. This generation can pour so much spiritual longing into romantic partnership that they place impossible expectations on their partners. They may also avoid necessary conflict in the name of keeping the peace, allowing resentment to build beneath a polished surface.',
          'Disillusionment comes when the ideal partner turns out to be a real person with flaws, or when maintaining social harmony requires suppressing truth. This painful awakening leads to the discovery that true harmony includes honest conflict and that perfect love embraces imperfect people.',
        ],
      },
      {
        title: 'Creative Vision',
        icon: '🎨',
        paragraphs: [
          'Neptune in Libra produces art of extraordinary beauty and romantic power. Fashion, interior design, love songs, romantic cinema, and social art flourish under this influence. The creative output is elegant, balanced, and deeply appealing to the heart.',
          'The generational creative legacy is the elevation of beauty as a value. Neptune in Libra proves that aesthetic sensitivity is not vanity but a form of spiritual intelligence, and that creating beautiful things is an act of service to the collective soul.',
        ],
      },
    ],
    keywords: ['neptune in libra', 'neptune libra generation', 'libra neptune meaning', 'neptune in libra astrology', 'romantic idealist astrology'],
  },
  scorpio: {
    title: 'Neptune in Scorpio',
    subtitle: 'The Mystical Transformer',
    intro: 'Neptune in Scorpio plunges spiritual vision into the depths of the psyche, sexuality, and the mysteries of death and rebirth. This generation dreams of total transformation, channels creative power through intensity and catharsis, and must navigate the seductive illusion that spiritual highs can be achieved through extremes.',
    sections: [
      {
        title: 'Dreams & Spirituality',
        icon: '🔮',
        paragraphs: [
          'Neptune in Scorpio experiences spirituality as a death-and-rebirth process. For this generation, the sacred is found in the depths: in the darkest night of the soul, in the surrender of ego, in the moment of total vulnerability. They do not seek a comfortable spirituality; they want one that transforms them completely.',
          'Their dreams are of union, dissolution, and rebirth. Neptune in Scorpio yearns for experiences so profound that the boundaries between self and other, life and death, human and divine, completely dissolve. Ecstatic states, shamanic journeys, and transformative rituals resonate deeply with this placement.',
          'The spiritual gift is fearlessness in the face of the unknown. Neptune in Scorpio can go where other placements fear to tread, diving into the unconscious, confronting death, and emerging with wisdom that illuminates the darkest corners of human experience.',
        ],
      },
      {
        title: 'Illusions & Shadow',
        icon: '🌫',
        paragraphs: [
          'The primary illusion of Neptune in Scorpio is that intensity equals depth. This generation can become addicted to extreme experiences, confusing emotional turbulence with spiritual transformation. They may glamorize darkness, romanticize suffering, or use substances and obsessive relationships as shortcuts to transcendence.',
          'Disillusionment comes when the next intense experience fails to produce lasting transformation. The realization that genuine spiritual depth requires patience, discipline, and the willingness to sit with ordinary discomfort is this placement\'s most important awakening.',
        ],
      },
      {
        title: 'Creative Vision',
        icon: '🎨',
        paragraphs: [
          'Neptune in Scorpio produces art that confronts the shadow. Psychological thrillers, dark romance, transformative music, and art that deals explicitly with sex, death, and power flourish under this influence. The creative output is intense, unforgettable, and often disturbing in the best sense.',
          'The generational creative legacy is the insistence that art must go deep. Neptune in Scorpio refuses superficiality and demands that creative work engage with the full range of human experience, including the parts that polite society prefers to ignore.',
        ],
      },
    ],
    keywords: ['neptune in scorpio', 'neptune scorpio generation', 'scorpio neptune meaning', 'neptune in scorpio astrology', 'mystical transformer astrology'],
  },
  sagittarius: {
    title: 'Neptune in Sagittarius',
    subtitle: 'The Spiritual Adventurer',
    intro: 'Neptune in Sagittarius expands spiritual vision to cosmic proportions, infusing the quest for meaning with boundless imagination. This generation dreams of spiritual unity across cultures, channels creative vision through adventure and philosophy, and must navigate the illusion that the next journey or belief system will provide ultimate answers.',
    sections: [
      {
        title: 'Dreams & Spirituality',
        icon: '🔮',
        paragraphs: [
          'Neptune in Sagittarius experiences spirituality as an adventure. For this generation, the sacred is found on the journey: in the temple on the mountainside, in the philosophy of a foreign culture, in the moment of awe when confronting the vastness of existence. They seek God not in buildings but in experiences.',
          'Their dreams are of spiritual freedom and universal truth. Neptune in Sagittarius envisions a world where all spiritual paths are honored, where wisdom flows freely across cultural boundaries, and where the human spirit is free to explore without dogma or limitation.',
          'The spiritual gift is infectious optimism and the ability to find meaning in any experience. Neptune in Sagittarius carries an unshakeable faith that the universe is fundamentally benevolent and that every experience, even the painful ones, serves a higher purpose.',
        ],
      },
      {
        title: 'Illusions & Shadow',
        icon: '🌫',
        paragraphs: [
          'The central illusion of Neptune in Sagittarius is spiritual bypassing through perpetual seeking. This generation can become so enamored with the journey that they never arrive, collecting spiritual experiences like souvenirs without integrating their lessons. They may also fall prey to charismatic gurus who promise easy enlightenment.',
          'Disillusionment comes when the next adventure, the next teacher, or the next belief system fails to deliver the promised revelation. This awakening leads to the discovery that truth is not somewhere out there to be found but something to be lived, right here, right now.',
        ],
      },
      {
        title: 'Creative Vision',
        icon: '🎨',
        paragraphs: [
          'Neptune in Sagittarius produces art that expands horizons. World music, epic cinema, philosophical literature, and art that bridges cultures flourish under this influence. The creative vision is expansive, multicultural, and infused with a sense of cosmic adventure.',
          'The generational creative legacy is the globalization of the imagination. Neptune in Sagittarius proves that the greatest art transcends cultural boundaries and speaks to the universal human longing for meaning, adventure, and connection to something greater than oneself.',
        ],
      },
    ],
    keywords: ['neptune in sagittarius', 'neptune sagittarius generation', 'sagittarius neptune meaning', 'neptune in sagittarius astrology', 'spiritual adventurer astrology'],
  },
  capricorn: {
    title: 'Neptune in Capricorn',
    subtitle: 'The Pragmatic Mystic',
    intro: 'Neptune in Capricorn grounds spiritual vision in practical structures and institutional reform. This generation dreams of building lasting sacred institutions, channels creative vision through disciplined effort, and must navigate the illusion that status and achievement can substitute for genuine spiritual depth.',
    sections: [
      {
        title: 'Dreams & Spirituality',
        icon: '🔮',
        paragraphs: [
          'Neptune in Capricorn experiences spirituality through structure, discipline, and tangible achievement. For this generation, the sacred is found in the cathedral that took centuries to build, in the tradition that has endured for millennia, and in the slow, patient work of creating something that will outlast a single lifetime.',
          'Their dreams are of spiritual accomplishment. Neptune in Capricorn envisions a world where spiritual principles are embedded in the structures of society, where businesses operate with soul, and where institutions serve not just practical but transcendent purposes.',
          'The spiritual gift is the ability to manifest the invisible. Neptune in Capricorn can take the most ethereal spiritual vision and give it concrete form, building temples, organizations, and systems that embody spiritual values in the material world.',
        ],
      },
      {
        title: 'Illusions & Shadow',
        icon: '🌫',
        paragraphs: [
          'The primary illusion of Neptune in Capricorn is that spiritual authority can be earned like a promotion. This generation can confuse external markers of spiritual status, titles, positions, credentials, with genuine spiritual realization. They may also use spiritual language to justify worldly ambition.',
          'Disillusionment comes when the spiritual institution they have built or revered turns out to have feet of clay. When the guru is exposed, the church is corrupted, or the sacred structure crumbles, Neptune in Capricorn discovers that authentic spirituality cannot be institutionalized, only practiced.',
        ],
      },
      {
        title: 'Creative Vision',
        icon: '🎨',
        paragraphs: [
          'Neptune in Capricorn creates art that endures. Architecture, classical music, literary fiction, and art forms that require years of disciplined practice flourish under this influence. The creative output is polished, professional, and built to last.',
          'The generational creative legacy is the insistence that craft matters. Neptune in Capricorn proves that the most transcendent art is often the most disciplined, and that there is something sacred in the patient mastery of a skill.',
        ],
      },
    ],
    keywords: ['neptune in capricorn', 'neptune capricorn generation', 'capricorn neptune meaning', 'neptune in capricorn astrology', 'pragmatic mystic astrology'],
  },
  aquarius: {
    title: 'Neptune in Aquarius',
    subtitle: 'The Collective Dreamer',
    intro: 'Neptune in Aquarius dissolves the boundaries between individual and collective consciousness, channeling spiritual vision through technology, community, and humanitarian ideals. This generation dreams of a connected humanity, channels creative vision through digital media, and must navigate the illusion that technology alone can create utopia.',
    sections: [
      {
        title: 'Dreams & Spirituality',
        icon: '🔮',
        paragraphs: [
          'Neptune in Aquarius experiences spirituality through connection, technology, and collective consciousness. For this generation, the sacred is found in the network: in the moment when a million people share the same emotion, in the technology that connects strangers across continents, and in the dream of a humanity united not by force but by shared vision.',
          'Their dreams are of a spiritually awakened collective. Neptune in Aquarius envisions a world where technology serves consciousness rather than distracting from it, where social networks become tools for genuine connection rather than performance, and where the boundary between individual and collective awareness becomes beautifully transparent.',
          'The spiritual gift is the ability to sense the zeitgeist. Neptune in Aquarius feels the collective unconscious like a living, breathing entity and can channel its currents into creative and social innovation that serves the whole.',
        ],
      },
      {
        title: 'Illusions & Shadow',
        icon: '🌫',
        paragraphs: [
          'The central illusion of Neptune in Aquarius is digital utopianism, the belief that connecting everyone through technology will automatically create a better world. This generation can confuse online community with genuine belonging, virtual connection with real intimacy, and information access with wisdom.',
          'Disillusionment comes when the connected world fails to produce the unity they envisioned. When social media creates division instead of connection, or when technology amplifies humanity\'s worst impulses alongside its best, Neptune in Aquarius must reckon with the uncomfortable truth that tools are neutral; it is consciousness that must change.',
        ],
      },
      {
        title: 'Creative Vision',
        icon: '🎨',
        paragraphs: [
          'Neptune in Aquarius produces art that leverages technology. Digital art, virtual reality experiences, collaborative online creation, and art that blurs the boundary between creator and audience flourish under this influence. The creative vision is innovative, communal, and boundary-dissolving.',
          'The generational creative legacy is proving that technology and soul are not opposites. Neptune in Aquarius creates art and media that use digital tools to access something genuinely transcendent, demonstrating that the medium is less important than the consciousness that flows through it.',
        ],
      },
    ],
    keywords: ['neptune in aquarius', 'neptune aquarius generation', 'aquarius neptune meaning', 'neptune in aquarius astrology', 'collective dreamer astrology'],
  },
  pisces: {
    title: 'Neptune in Pisces',
    subtitle: 'The Transcendent Mystic',
    intro: 'Neptune in its home sign of Pisces amplifies spiritual vision, creative imagination, and empathic sensitivity to their purest expression. This generation dissolves the boundary between self and cosmos, channels divine creativity with effortless grace, and must navigate the powerful undertow of escapism and boundary dissolution.',
    sections: [
      {
        title: 'Dreams & Spirituality',
        icon: '🔮',
        paragraphs: [
          'Neptune is the natural ruler of Pisces, and when it returns to its home sign, the spiritual impulse becomes overwhelming in its beauty and intensity. This placement produces mystics, empaths, and visionaries for whom the boundary between the material and spiritual worlds is nearly transparent. They do not just believe in the divine; they feel it constantly.',
          'Their dreams are of unity, transcendence, and unconditional love. Neptune in Pisces yearns for the dissolution of all separateness, a return to the oceanic feeling of cosmic belonging that precedes and follows individual existence. This longing infuses everything they do with a poignant, otherworldly beauty.',
          'The spiritual gift is direct access to the numinous. Neptune in Pisces experiences grace, beauty, and divine love as everyday realities rather than rare peak experiences. They are natural channels for creative and spiritual energy that seems to flow through them from somewhere beyond the personal.',
        ],
      },
      {
        title: 'Illusions & Shadow',
        icon: '🌫',
        paragraphs: [
          'The illusion of Neptune in Pisces is total: the entire material world can begin to feel like an illusion, making it difficult to engage with practical reality. This generation is vulnerable to escapism in all its forms, from substances to fantasy to spiritual dissociation. The pull toward dissolution is so strong that maintaining healthy boundaries requires conscious, sustained effort.',
          'Disillusionment, paradoxically, comes through too much enchantment. When everything feels meaningful, nothing provides solid ground. The awakening for Neptune in Pisces is learning to be in the world, fully engaged with its imperfect beauty, without losing connection to the transcendent. Grounding the mystical in the practical becomes the essential spiritual discipline.',
        ],
      },
      {
        title: 'Creative Vision',
        icon: '🎨',
        paragraphs: [
          'Neptune in Pisces produces art of extraordinary beauty, depth, and emotional resonance. Music, poetry, film, and visual art that seems to come from another dimension flourish under this influence. The creative output is dreamy, layered, and capable of transporting audiences to altered states of consciousness.',
          'The generational creative legacy is the reminder that art is sacred. Neptune in Pisces creates work that does not merely entertain or provoke but genuinely heals, opens, and transforms. Their art is a portal, and passing through it changes how you see everything.',
        ],
      },
    ],
    keywords: ['neptune in pisces', 'neptune pisces generation', 'pisces neptune meaning', 'neptune in pisces astrology', 'transcendent mystic astrology'],
  },
};

export function getNeptuneSignContent(sign: ZodiacSign): NeptuneSignContent {
  const content = NEPTUNE_CONTENT[sign];
  return { sign, ...content };
}

export function getAdjacentSigns(sign: ZodiacSign): { prev: ZodiacSign; next: ZodiacSign } {
  const idx = ALL_SIGN_KEYS.indexOf(sign);
  const prev = ALL_SIGN_KEYS[(idx - 1 + 12) % 12];
  const next = ALL_SIGN_KEYS[(idx + 1) % 12];
  return { prev, next };
}
