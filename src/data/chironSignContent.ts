/* ──────────────────────────────────────────────────────────────
   Chiron in Signs Content
   SEO-rich content for Chiron through each zodiac sign.
   Core wound, healing journey, becoming the healer.
   ────────────────────────────────────────────────────────────── */

import {
  SIGNS,
  ALL_SIGN_KEYS,
  getElementColor,
  type ZodiacSign,
} from './compatibilityContent';

export { SIGNS, ALL_SIGN_KEYS, getElementColor, type ZodiacSign };

export interface ChironSignContent {
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

export const CHIRON_SYMBOL = '⚷';

const CHIRON_CONTENT: Record<ZodiacSign, Omit<ChironSignContent, 'sign'>> = {
  aries: {
    title: 'Chiron in Aries',
    subtitle: 'The Wound of Identity',
    intro: 'Chiron in Aries carries a core wound around the right to exist, to take up space, and to assert one\'s identity without apology. The healing journey transforms this wound into the gift of helping others find their courage and claim their place in the world.',
    sections: [
      {
        title: 'The Core Wound',
        icon: '💔',
        paragraphs: [
          'Chiron in Aries carries a wound at the most fundamental level of selfhood: the feeling that their very existence is somehow wrong, unwelcome, or not enough. They may have experienced early messages that being bold, assertive, or self-directed was unacceptable. The result is a deep-seated uncertainty about their right to take up space.',
          'This wound often manifests as difficulty with anger. Chiron in Aries may either suppress their anger completely, turning it inward as depression or self-doubt, or express it explosively because they have never learned to use it constructively. Healthy aggression, the kind that sets boundaries and pursues goals, feels fraught with danger.',
          'At the root of this wound is the question: "Am I allowed to be who I am?" The pain of not knowing the answer drives many of the compensatory behaviors that Chiron in Aries develops: either shrinking into invisibility or overcompensating with aggressive self-assertion that pushes people away.',
        ],
      },
      {
        title: 'The Healing Journey',
        icon: '🌿',
        paragraphs: [
          'Healing for Chiron in Aries begins with the radical acceptance that they have a right to exist, to want things, and to take action on their own behalf. This sounds simple, but for someone whose deepest wound is around identity itself, claiming the right to be is an act of profound courage.',
          'The healing process often involves learning to use anger as a constructive force. When Chiron in Aries discovers that anger is not inherently destructive but can be a signal of violated boundaries and unmet needs, they unlock an enormous reservoir of personal power that has been dammed up by the wound.',
          'Physical expression is often key to healing this placement. Martial arts, competitive sports, dance, and any practice that requires assertive, embodied action can help Chiron in Aries reconnect with the primal energy they have been afraid to access.',
        ],
      },
      {
        title: 'Becoming the Healer',
        icon: '✨',
        paragraphs: [
          'The gift of Chiron in Aries is the ability to help others find their courage. Because they know intimately what it feels like to doubt their right to exist, they can recognize that wound in others with extraordinary precision and hold space for healing with genuine empathy.',
          'As healers, Chiron in Aries people excel at empowerment work. They help others find their voice, claim their space, and take action on their own behalf. They are the coaches, the self-defense instructors, the therapists who specialize in helping people recover their personal power after trauma.',
        ],
      },
    ],
    keywords: ['chiron in aries', 'chiron aries wound', 'aries chiron healing', 'chiron in aries astrology', 'identity wound astrology'],
  },
  taurus: {
    title: 'Chiron in Taurus',
    subtitle: 'The Wound of Worth',
    intro: 'Chiron in Taurus carries a core wound around self-worth, material security, and the belief that they deserve abundance. The healing journey transforms this wound into the gift of helping others discover their inherent value and build genuine security from within.',
    sections: [
      {
        title: 'The Core Wound',
        icon: '💔',
        paragraphs: [
          'Chiron in Taurus carries a wound around value, both personal worth and material security. These individuals often grow up feeling that they are not enough, that they do not deserve comfort, beauty, or abundance. There may have been early experiences of poverty, deprivation, or messages that wanting nice things makes you shallow or greedy.',
          'This wound manifests as an uneasy relationship with money and resources. Chiron in Taurus may either hoard compulsively out of fear that there will never be enough, or they may sabotage their own financial security because they unconsciously believe they do not deserve it. Either way, material stability feels precarious, no matter how much they have.',
          'At a deeper level, this is a wound of embodiment. Chiron in Taurus may feel uncomfortable in their own body, disconnected from physical pleasure, or unable to relax into the simple joy of being alive in a physical form. The body, which should be a source of comfort, becomes another place where they feel inadequate.',
        ],
      },
      {
        title: 'The Healing Journey',
        icon: '🌿',
        paragraphs: [
          'Healing for Chiron in Taurus begins with the recognition that their value is inherent, not earned. No amount of money, beauty, or material achievement can prove their worth, because worth is not something that can be proved. It simply is. Arriving at this understanding is the heart of the healing journey.',
          'The healing process often involves developing a healthy relationship with the body and the senses. Massage, yoga, cooking, gardening, and any practice that reconnects them with physical pleasure without guilt can be deeply transformative. Learning to receive, which Chiron in Taurus often finds unbearably vulnerable, is an essential part of healing.',
          'Financial healing, learning to earn, save, spend, and share money without anxiety or shame, is also a significant part of the journey. When Chiron in Taurus makes peace with material reality, they discover an unshakeable inner security that no external circumstance can threaten.',
        ],
      },
      {
        title: 'Becoming the Healer',
        icon: '✨',
        paragraphs: [
          'The gift of Chiron in Taurus is the ability to help others discover their inherent worth. Because they have spent their own lives wrestling with questions of value, they can see clearly when someone else is undervaluing themselves and guide them toward a deeper understanding of their own preciousness.',
          'As healers, Chiron in Taurus people excel at work that bridges the physical and spiritual. They are the body workers, the financial counselors, the garden therapists, and the nutritionists who help people develop a loving, healthy relationship with the material world.',
        ],
      },
    ],
    keywords: ['chiron in taurus', 'chiron taurus wound', 'taurus chiron healing', 'chiron in taurus astrology', 'self-worth wound astrology'],
  },
  gemini: {
    title: 'Chiron in Gemini',
    subtitle: 'The Wound of Communication',
    intro: 'Chiron in Gemini carries a core wound around communication, intelligence, and the fear of not being heard or understood. The healing journey transforms this wound into the gift of bridging communication gaps and helping others find their voice.',
    sections: [
      {
        title: 'The Core Wound',
        icon: '💔',
        paragraphs: [
          'Chiron in Gemini carries a wound around the mind and communication. These individuals often feel that their intelligence is not valued, that they cannot express themselves clearly, or that no matter how they try to communicate, they are misunderstood. Early experiences may have included speech difficulties, learning disabilities, or being told they were stupid or talked too much.',
          'This wound manifests as anxiety around communication. Chiron in Gemini may overthink every word, fear public speaking, or avoid intellectual discussions because they secretly believe they are not smart enough. Alternatively, they may overcompensate by talking compulsively, never pausing for silence because silence feels like intellectual failure.',
          'At the deepest level, this is a wound of connection. Communication is how we bridge the gap between separate selves, and when that bridge feels broken, the resulting isolation can be profoundly painful. Chiron in Gemini fears being trapped in their own mind, unable to reach others.',
        ],
      },
      {
        title: 'The Healing Journey',
        icon: '🌿',
        paragraphs: [
          'Healing for Chiron in Gemini begins with the acceptance that perfect communication is impossible and that being misunderstood is a universal human experience, not a personal failing. When they stop demanding perfection from their words, they discover that imperfect communication can still carry real meaning and create genuine connection.',
          'The healing process often involves finding alternative forms of expression. Writing, art, music, or any medium that allows them to communicate without the pressure of real-time conversation can be deeply healing. Many Chiron in Gemini people discover that their most powerful communication happens through creative rather than verbal channels.',
          'Learning to listen is also essential. Chiron in Gemini can become so focused on their own communication anxiety that they forget to listen, and the discovery that true connection comes from receiving as much as from transmitting is often a breakthrough moment in their healing.',
        ],
      },
      {
        title: 'Becoming the Healer',
        icon: '✨',
        paragraphs: [
          'The gift of Chiron in Gemini is the ability to help others communicate. Because they know the pain of being misunderstood, they become extraordinary translators, mediators, and teachers, people who can bridge communication gaps with empathy and skill.',
          'As healers, Chiron in Gemini people excel at language therapy, writing coaching, mediation, and any work that helps people express what they truly mean. They are the ones who can hear what someone is trying to say beneath their clumsy words and reflect it back with clarity.',
        ],
      },
    ],
    keywords: ['chiron in gemini', 'chiron gemini wound', 'gemini chiron healing', 'chiron in gemini astrology', 'communication wound astrology'],
  },
  cancer: {
    title: 'Chiron in Cancer',
    subtitle: 'The Wound of Belonging',
    intro: 'Chiron in Cancer carries a core wound around family, emotional safety, and the fear of never truly belonging. The healing journey transforms this wound into the gift of creating sanctuary for others and nurturing the displaced and motherless.',
    sections: [
      {
        title: 'The Core Wound',
        icon: '💔',
        paragraphs: [
          'Chiron in Cancer carries perhaps the most tender wound in the zodiac: the feeling of not having a true home, a safe family, or a place where they are unconditionally loved. Early life may have included absent parents, family dysfunction, emotional neglect, or the feeling of being the family member who never quite fit in.',
          'This wound manifests as a deep hunger for belonging that is never quite satisfied. Chiron in Cancer may create beautiful homes, nurture others devotedly, and build family-like communities, yet still feel a secret emptiness, as though the love they give never returns in the form they need. The mother wound, whether from the actual mother or the archetype, is central.',
          'At the deepest level, this is a wound of emotional abandonment. The inner child of Chiron in Cancer is waiting to be held, and no amount of adult achievement can quiet that child until the wound is directly addressed and healed.',
        ],
      },
      {
        title: 'The Healing Journey',
        icon: '🌿',
        paragraphs: [
          'Healing for Chiron in Cancer begins with re-parenting the self. Since the original nurturing was insufficient, the adult must learn to provide the safety, warmth, and unconditional acceptance that the child never received. This is not a metaphor; it is a daily practice of self-care, emotional honesty, and gentle self-compassion.',
          'The healing process often involves grieving. Chiron in Cancer must mourn the family they needed but did not have, the mother they deserved but did not get, the childhood they wished for but never experienced. This grief, when fully felt, releases decades of stored pain and makes room for genuine healing.',
          'Creating a home that feels truly safe and a chosen family that offers genuine belonging is both the healing practice and its outcome. When Chiron in Cancer builds their own sanctuary, the wound transforms into a wellspring of nurturing power.',
        ],
      },
      {
        title: 'Becoming the Healer',
        icon: '✨',
        paragraphs: [
          'The gift of Chiron in Cancer is the ability to create belonging for others. Because they know what it feels like to be homeless in the deepest sense, they can recognize that ache in others and offer a quality of nurturing that comes from genuine understanding.',
          'As healers, Chiron in Cancer people excel at family therapy, foster care, community building, and any work that creates safe emotional spaces for those who have been displaced, neglected, or unloved. They become the mothers and fathers of the world\'s orphans, literal and metaphorical.',
        ],
      },
    ],
    keywords: ['chiron in cancer', 'chiron cancer wound', 'cancer chiron healing', 'chiron in cancer astrology', 'belonging wound astrology'],
  },
  leo: {
    title: 'Chiron in Leo',
    subtitle: 'The Wound of Recognition',
    intro: 'Chiron in Leo carries a core wound around visibility, creative expression, and the fear that their authentic self is not worthy of love and celebration. The healing journey transforms this wound into the gift of helping others shine and celebrating the creative spark in every person.',
    sections: [
      {
        title: 'The Core Wound',
        icon: '💔',
        paragraphs: [
          'Chiron in Leo carries a wound around the right to shine. These individuals often received messages early in life that being visible, proud, or creatively expressive was dangerous, inappropriate, or unwelcome. They may have been told not to show off, been overshadowed by a sibling, or experienced the humiliation of being mocked when they tried to perform or create.',
          'This wound manifests as a painful relationship with attention. Chiron in Leo may desperately want to be seen and celebrated while simultaneously fearing visibility. Stage fright, creative blocks, and the inability to accept compliments are common symptoms. They may dim their light to avoid the pain of potential rejection.',
          'At the deepest level, this is a wound of the heart. Chiron in Leo fears that their authentic, creative, joyful self is somehow wrong or unlovable. The result is a performance of ordinariness that betrays their true nature, or an overcompensating demand for attention that pushes people away.',
        ],
      },
      {
        title: 'The Healing Journey',
        icon: '🌿',
        paragraphs: [
          'Healing for Chiron in Leo begins with small, safe acts of creative expression. Creating without an audience, playing without stakes, and expressing joy without worrying about judgment are the first steps. The inner child needs to rediscover the pure pleasure of creative play before they can handle the spotlight.',
          'The healing process involves learning to separate self-worth from external validation. When Chiron in Leo can create for the joy of creating, shine for the love of shining, and express themselves without needing applause, the wound transforms into genuine, unshakeable confidence.',
          'Finding a supportive community that celebrates authentic expression is crucial. Chiron in Leo heals in environments where they can practice being seen without the risk of humiliation, where their creativity is welcomed rather than judged.',
        ],
      },
      {
        title: 'Becoming the Healer',
        icon: '✨',
        paragraphs: [
          'The gift of Chiron in Leo is the ability to help others find their creative voice and the courage to be seen. Because they know the pain of suppressed self-expression, they can create environments where others feel safe to shine.',
          'As healers, Chiron in Leo people excel at art therapy, creative coaching, children\'s education, and any work that helps people recover their joy, playfulness, and creative confidence. They become the champions of others\' greatness, the ones who see the star in everyone and help it emerge.',
        ],
      },
    ],
    keywords: ['chiron in leo', 'chiron leo wound', 'leo chiron healing', 'chiron in leo astrology', 'recognition wound astrology'],
  },
  virgo: {
    title: 'Chiron in Virgo',
    subtitle: 'The Wound of Imperfection',
    intro: 'Chiron in Virgo carries a core wound around being flawed, inadequate, or never good enough. With Vesta ruling Virgo, there is a sacred dimension to this wound; the devotion to perfection becomes a spiritual crisis when perfection proves unattainable. The healing journey transforms this wound into the gift of compassionate, practical healing.',
    sections: [
      {
        title: 'The Core Wound',
        icon: '💔',
        paragraphs: [
          'Chiron in Virgo carries a wound around imperfection. These individuals often feel that they are fundamentally flawed, that no amount of effort can make them good enough, and that any mistake proves their unworthiness. With Vesta as Virgo\'s ruler, this wound has a sacred quality: they feel that they have failed not just practically but devotionally, as though their imperfection is a spiritual failing.',
          'This wound manifests as relentless self-criticism, anxiety about health and bodily imperfection, and a compulsive need to fix things in themselves and their environment. Chiron in Virgo may develop hypochondria, eating disorders, or obsessive-compulsive tendencies as they try to achieve the impossible standard of flawlessness.',
          'At the deepest level, this is a wound of unworthiness expressed through the body and daily life. The belief that they are broken and need fixing drives an exhausting cycle of self-improvement that never arrives at the destination of "good enough."',
        ],
      },
      {
        title: 'The Healing Journey',
        icon: '🌿',
        paragraphs: [
          'Healing for Chiron in Virgo begins with the revolutionary acceptance that imperfection is not a flaw but a feature of being human. This acceptance does not come easily to a placement that is wired for improvement, but it is the only door through which genuine healing can enter.',
          'The healing process involves redirecting the analytical mind from self-criticism toward self-compassion. When Chiron in Virgo applies their remarkable attention to detail to understanding and nurturing themselves, rather than cataloging their deficiencies, the wound begins to transform.',
          'Developing a healthy relationship with the body, one based on listening and cooperation rather than control and punishment, is essential. When the body becomes an ally rather than an enemy, Chiron in Virgo discovers a grounded, practical form of wholeness that does not require perfection.',
        ],
      },
      {
        title: 'Becoming the Healer',
        icon: '✨',
        paragraphs: [
          'The gift of Chiron in Virgo is an extraordinary ability to heal others through practical, precise, and compassionate service. Because they have spent their lives studying imperfection, they understand health, systems, and the body at a level of detail that makes them exceptional healers.',
          'As healers, Chiron in Virgo people excel at holistic health, herbalism, nutrition, bodywork, and any modality that addresses the whole person through careful, practical attention. They are the healers who notice the detail everyone else missed, and that precision, born from their own wound, is their greatest gift.',
        ],
      },
    ],
    keywords: ['chiron in virgo', 'chiron virgo wound', 'virgo chiron healing', 'chiron in virgo astrology', 'imperfection wound astrology'],
  },
  libra: {
    title: 'Chiron in Libra',
    subtitle: 'The Wound of Relationship',
    intro: 'Chiron in Libra carries a core wound around relationships, fairness, and the fear that they are unlovable or incapable of true partnership. With Juno ruling Libra, this wound cuts to the heart of committed partnership. The healing journey transforms this wound into the gift of creating genuine equality and beauty in relationships.',
    sections: [
      {
        title: 'The Core Wound',
        icon: '💔',
        paragraphs: [
          'Chiron in Libra carries a wound around partnership and the ability to be loved. These individuals often feel that they are fundamentally unlovable, that they will always be abandoned, or that they must sacrifice themselves completely to deserve love. With Juno ruling Libra, this wound is specifically about committed partnership, the belief that they are incapable of sustaining the kind of deep, balanced love they crave.',
          'This wound manifests as relationship codependency, people-pleasing, or the opposite: avoiding intimate relationships entirely because the risk of rejection feels unbearable. Chiron in Libra may attract partners who are unavailable, abusive, or unequal, unconsciously recreating the wound in hopes of finally healing it.',
          'At the deepest level, this is a wound of self-abandonment. In the pursuit of partnership, Chiron in Libra may abandon their own needs, opinions, and identity so completely that they lose themselves. The tragedy is that the very thing they do to secure love, self-erasure, is the thing that makes genuine love impossible.',
        ],
      },
      {
        title: 'The Healing Journey',
        icon: '🌿',
        paragraphs: [
          'Healing for Chiron in Libra begins with the development of a loving relationship with the self. Before they can achieve the balanced partnership they desire, they must learn that they are complete on their own, that their worth does not depend on having a partner, and that being alone is not the same as being unlovable.',
          'The healing process involves learning to set boundaries within relationships. Chiron in Libra must practice saying no, expressing disagreement, and maintaining their identity within partnership. Each act of self-assertion within a loving relationship is a step toward healing.',
          'Finding beauty in solitude and developing personal interests that are not shared with a partner helps Chiron in Libra build the inner strength that genuine partnership requires. When they stop seeking completion in another person, they become capable of the kind of balanced, equal love they have always desired.',
        ],
      },
      {
        title: 'Becoming the Healer',
        icon: '✨',
        paragraphs: [
          'The gift of Chiron in Libra is the ability to help others create healthier, more balanced relationships. Because they have experienced the full spectrum of relational pain, they understand the dynamics of partnership with extraordinary nuance and can guide others toward genuine equality and mutual respect.',
          'As healers, Chiron in Libra people excel at couples counseling, mediation, social work, and any practice that helps people navigate the complex terrain of intimate relationship. They are the ones who can see clearly what each person needs to give and receive for the partnership to thrive.',
        ],
      },
    ],
    keywords: ['chiron in libra', 'chiron libra wound', 'libra chiron healing', 'chiron in libra astrology', 'relationship wound astrology'],
  },
  scorpio: {
    title: 'Chiron in Scorpio',
    subtitle: 'The Wound of Trust',
    intro: 'Chiron in Scorpio carries a core wound around trust, betrayal, and the fear of vulnerability. The healing journey transforms this wound into the gift of extraordinary depth, psychological insight, and the ability to guide others through their darkest moments.',
    sections: [
      {
        title: 'The Core Wound',
        icon: '💔',
        paragraphs: [
          'Chiron in Scorpio carries a wound around trust and the safety of being vulnerable. These individuals may have experienced betrayal, abuse, or the violation of their most intimate boundaries early in life. The result is a deep conviction that letting anyone see their true self is dangerous, that vulnerability equals destruction.',
          'This wound manifests as emotional armor. Chiron in Scorpio builds walls of intensity, secrecy, or control to protect the wounded core. They may use psychological insight as a weapon, keeping others at a distance by analyzing them before they can be analyzed. Intimacy feels like a threat, even as they desperately crave it.',
          'At the deepest level, this is a wound of power and powerlessness. Chiron in Scorpio has experienced what it feels like to have their power stripped away, and the terror of that helplessness drives everything: the need for control, the difficulty trusting, and the paradoxical pull toward the very intensity that originally wounded them.',
        ],
      },
      {
        title: 'The Healing Journey',
        icon: '🌿',
        paragraphs: [
          'Healing for Chiron in Scorpio begins with the slow, terrifying process of learning to trust again. This cannot be rushed. Each small act of vulnerability, each moment of allowing someone to see behind the armor, is a victory. The healing happens in inches, not miles, but each inch is profound.',
          'The healing process often involves facing the original trauma directly, in therapy, in ceremony, or in the quiet depths of personal reflection. Chiron in Scorpio must go back to the place where the wound was inflicted and reclaim the power that was taken from them. This is not easy, but no other placement is better equipped for the descent.',
          'Learning to use their intense emotional energy for healing rather than self-protection is the breakthrough. When Chiron in Scorpio discovers that their depth, their intensity, and their unflinching honesty are gifts rather than defenses, they transform into healers of extraordinary power.',
        ],
      },
      {
        title: 'Becoming the Healer',
        icon: '✨',
        paragraphs: [
          'The gift of Chiron in Scorpio is the ability to hold space for the unbearable. Because they know what it feels like to be destroyed and rebuilt, they can sit with others in their darkest moments without flinching, offering a quality of presence that is literally life-saving.',
          'As healers, Chiron in Scorpio people excel at trauma therapy, hospice work, crisis counseling, and any modality that requires the courage to face death, loss, and the shadow. They are the healers who go where no one else will go, and their presence in those dark places is a light.',
        ],
      },
    ],
    keywords: ['chiron in scorpio', 'chiron scorpio wound', 'scorpio chiron healing', 'chiron in scorpio astrology', 'trust wound astrology'],
  },
  sagittarius: {
    title: 'Chiron in Sagittarius',
    subtitle: 'The Wound of Meaning',
    intro: 'Chiron in Sagittarius carries a core wound around meaning, faith, and the fear that life has no purpose. The healing journey transforms this wound into the gift of helping others find their own meaning and reclaim their faith in life.',
    sections: [
      {
        title: 'The Core Wound',
        icon: '💔',
        paragraphs: [
          'Chiron in Sagittarius carries a wound around meaning, purpose, and the faith that life makes sense. These individuals may have experienced a shattering of faith, whether through religious disillusionment, cultural displacement, or existential crisis. The result is a nagging emptiness, a sense that meaning exists for others but not for them.',
          'This wound manifests as restless seeking. Chiron in Sagittarius may travel the world, study every philosophy, try every spiritual practice, searching for the belief system that will finally fill the void. Each new horizon promises meaning and eventually disappoints, reinforcing the wound.',
          'At the deepest level, this is a wound of cosmic abandonment, the feeling that God, the universe, or fate has forgotten them. The optimism that Sagittarius typically embodies feels forced or fragile, as though their faith is built on sand rather than bedrock.',
        ],
      },
      {
        title: 'The Healing Journey',
        icon: '🌿',
        paragraphs: [
          'Healing for Chiron in Sagittarius begins with the acceptance that meaning is not something found "out there" but something created through engagement with life. When they stop seeking the perfect philosophy and start living their own truth, the wound begins to close.',
          'The healing process involves making peace with uncertainty. Chiron in Sagittarius must learn that not having all the answers is not a spiritual failure but a natural aspect of being human. Faith that includes doubt is stronger than faith that demands certainty.',
          'Teaching what they are still learning is paradoxically healing for this placement. When Chiron in Sagittarius shares their wisdom, imperfect as it may be, they often discover that the act of teaching is itself the meaning they have been seeking.',
        ],
      },
      {
        title: 'Becoming the Healer',
        icon: '✨',
        paragraphs: [
          'The gift of Chiron in Sagittarius is the ability to help others find meaning in suffering and hope in despair. Because they have traversed the desert of meaninglessness, they can guide others through it with the empathy of someone who truly understands the journey.',
          'As healers, Chiron in Sagittarius people excel at philosophical counseling, pastoral care, cross-cultural healing, and any work that helps people rebuild their faith after it has been shattered. They are the wounded prophets who speak with authority because their words are forged in genuine experience.',
        ],
      },
    ],
    keywords: ['chiron in sagittarius', 'chiron sagittarius wound', 'sagittarius chiron healing', 'chiron in sagittarius astrology', 'meaning wound astrology'],
  },
  capricorn: {
    title: 'Chiron in Capricorn',
    subtitle: 'The Wound of Authority',
    intro: 'Chiron in Capricorn carries a core wound around achievement, authority, and the fear that no amount of success will ever make them worthy of respect. The healing journey transforms this wound into the gift of wise, compassionate leadership.',
    sections: [
      {
        title: 'The Core Wound',
        icon: '💔',
        paragraphs: [
          'Chiron in Capricorn carries a wound around authority, achievement, and the feeling of never being successful enough. These individuals may have experienced a harsh or absent father, early responsibilities that robbed them of childhood, or an environment where love was conditional on performance.',
          'This wound manifests as a relentless drive to achieve that never brings satisfaction. Chiron in Capricorn may climb to the top of their field and still feel like a fraud, earn every credential and still feel unqualified, and receive every accolade and still feel that they have not done enough. Imposter syndrome is almost universal with this placement.',
          'At the deepest level, this is a wound of the father, both the personal father and the archetype of authority. Chiron in Capricorn feels that they must earn love through achievement, and the impossible standard they set for themselves ensures they can never rest.',
        ],
      },
      {
        title: 'The Healing Journey',
        icon: '🌿',
        paragraphs: [
          'Healing for Chiron in Capricorn begins with the separation of self-worth from achievement. They must learn that they are lovable and worthy not because of what they have accomplished but simply because they exist. This is revolutionary for a placement that has built their entire identity on performance.',
          'The healing process involves learning to rest, to fail, and to be vulnerable without losing their sense of self. Chiron in Capricorn must discover that falling down does not make them worthless and that asking for help does not make them weak. The discipline they apply to work must be redirected toward self-compassion.',
          'Redefining success in terms of inner fulfillment rather than external markers is essential. When Chiron in Capricorn measures their life by the depth of their relationships, the quality of their rest, and the authenticity of their self-expression rather than by titles and bank accounts, the wound transforms into genuine authority.',
        ],
      },
      {
        title: 'Becoming the Healer',
        icon: '✨',
        paragraphs: [
          'The gift of Chiron in Capricorn is wise, compassionate authority. Because they have experienced the emptiness of achievement without meaning, they can guide others toward a healthier relationship with ambition, success, and the proper use of power.',
          'As healers, Chiron in Capricorn people excel at executive coaching, organizational consulting, mentoring, and any work that helps people develop genuine authority without sacrificing their humanity. They are the elders who lead by example, showing that true power includes vulnerability.',
        ],
      },
    ],
    keywords: ['chiron in capricorn', 'chiron capricorn wound', 'capricorn chiron healing', 'chiron in capricorn astrology', 'authority wound astrology'],
  },
  aquarius: {
    title: 'Chiron in Aquarius',
    subtitle: 'The Wound of Belonging',
    intro: 'Chiron in Aquarius carries a core wound around social belonging, feeling like an outsider, and the pain of being different. The healing journey transforms this wound into the gift of helping others embrace their uniqueness and find community where they are accepted as they are.',
    sections: [
      {
        title: 'The Core Wound',
        icon: '💔',
        paragraphs: [
          'Chiron in Aquarius carries a wound around social belonging and the pain of being different. These individuals often feel like perpetual outsiders, unable to fit into any group, too weird for the mainstream and too mainstream for the fringe. The feeling of being an alien in human society runs deep.',
          'This wound manifests as a complicated relationship with groups and community. Chiron in Aquarius may either avoid group involvement entirely, protecting themselves from the pain of exclusion, or throw themselves into social causes while maintaining emotional distance from the people around them.',
          'At the deepest level, this is a wound of disconnection from the collective. Chiron in Aquarius feels that something fundamental about who they are makes genuine belonging impossible. The irony is that the very qualities that make them feel alienated, their originality, their vision, their refusal to conform, are the qualities the world needs most.',
        ],
      },
      {
        title: 'The Healing Journey',
        icon: '🌿',
        paragraphs: [
          'Healing for Chiron in Aquarius begins with the acceptance that their differences are not defects but gifts. When they stop trying to fit in and start celebrating what makes them unique, they naturally attract the community that has been waiting for them all along.',
          'The healing process involves finding their tribe, the small group of fellow outsiders who understand and celebrate their uniqueness. Chiron in Aquarius heals not by becoming more normal but by finding the people for whom their kind of different is exactly right.',
          'Learning to balance individuality with genuine emotional connection is essential. Chiron in Aquarius must discover that belonging does not require conformity and that vulnerability within community is not a weakness but the door to the connection they crave.',
        ],
      },
      {
        title: 'Becoming the Healer',
        icon: '✨',
        paragraphs: [
          'The gift of Chiron in Aquarius is the ability to help others embrace their uniqueness and find communities where they belong. Because they know the pain of exclusion, they can create spaces where difference is celebrated and where even the most unusual people feel welcome.',
          'As healers, Chiron in Aquarius people excel at community building, group therapy, social innovation, and any work that helps people transform the pain of alienation into the power of authentic belonging. They are the bridge builders who connect isolated individuals to their tribe.',
        ],
      },
    ],
    keywords: ['chiron in aquarius', 'chiron aquarius wound', 'aquarius chiron healing', 'chiron in aquarius astrology', 'outsider wound astrology'],
  },
  pisces: {
    title: 'Chiron in Pisces',
    subtitle: 'The Wound of Separation',
    intro: 'Chiron in Pisces carries the most cosmic wound in the zodiac: the pain of separation from the divine, the ache of being a spiritual being trapped in a material world. The healing journey transforms this wound into the gift of transcendent compassion and the ability to help others reconnect with the sacred.',
    sections: [
      {
        title: 'The Core Wound',
        icon: '💔',
        paragraphs: [
          'Chiron in Pisces carries a wound of cosmic homesickness, the feeling of being separated from the divine, from unity, from the oceanic belonging that the soul remembers but the personality cannot access. These individuals feel too much, see too much, and absorb the suffering of the world as though it were their own.',
          'This wound manifests as overwhelming sensitivity, boundary dissolution, and the temptation to escape. Chiron in Pisces may turn to substances, fantasy, spiritual bypass, or dissociation to manage the pain of being so permeable in a harsh world. They feel everything, and the inability to filter means that suffering is their constant companion.',
          'At the deepest level, this is the wound of incarnation itself, the pain of being a boundless soul in a bounded body. Chiron in Pisces remembers, at a cellular level, the unity that existed before birth, and the grief of losing that unity colors their entire earthly experience.',
        ],
      },
      {
        title: 'The Healing Journey',
        icon: '🌿',
        paragraphs: [
          'Healing for Chiron in Pisces begins with developing healthy boundaries while maintaining their extraordinary sensitivity. They must learn that they can be permeable without being destroyed, that empathy does not require absorbing others\' pain, and that it is possible to stay connected to the divine while fully inhabiting the human body.',
          'The healing process involves finding spiritual practices that ground transcendence in daily life. Meditation, art, music, time in nature, and service to others can all provide the connection to the sacred that Chiron in Pisces craves without the dangers of escapism.',
          'Learning to transform personal suffering into universal compassion is the breakthrough. When Chiron in Pisces stops trying to escape pain and starts using it as fuel for compassionate service, they discover that their sensitivity is not a curse but the most powerful healing gift in the zodiac.',
        ],
      },
      {
        title: 'Becoming the Healer',
        icon: '✨',
        paragraphs: [
          'The gift of Chiron in Pisces is the ability to heal through pure presence and compassion. Because they have experienced the full depth of human and cosmic suffering, they can hold space for anyone\'s pain with a quality of understanding that transcends words.',
          'As healers, Chiron in Pisces people excel at energy healing, spiritual counseling, addiction recovery work, and any modality that addresses the soul. They are the healers who heal not through technique but through the quality of their being, their presence alone is medicine.',
        ],
      },
    ],
    keywords: ['chiron in pisces', 'chiron pisces wound', 'pisces chiron healing', 'chiron in pisces astrology', 'separation wound astrology'],
  },
};

export function getChironSignContent(sign: ZodiacSign): ChironSignContent {
  const content = CHIRON_CONTENT[sign];
  return { sign, ...content };
}

export function getAdjacentSigns(sign: ZodiacSign): { prev: ZodiacSign; next: ZodiacSign } {
  const idx = ALL_SIGN_KEYS.indexOf(sign);
  const prev = ALL_SIGN_KEYS[(idx - 1 + 12) % 12];
  const next = ALL_SIGN_KEYS[(idx + 1) % 12];
  return { prev, next };
}
