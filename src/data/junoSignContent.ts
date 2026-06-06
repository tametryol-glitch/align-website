/* ──────────────────────────────────────────────────────────────
   Juno in Signs Content
   SEO-rich content for Juno through each zodiac sign.
   Partnership style, commitment needs, marriage patterns.
   IMPORTANT: Juno rules Libra in the Align rulership system.
   ────────────────────────────────────────────────────────────── */

import {
  SIGNS,
  ALL_SIGN_KEYS,
  getElementColor,
  type ZodiacSign,
} from './compatibilityContent';

export { SIGNS, ALL_SIGN_KEYS, getElementColor, type ZodiacSign };

export interface JunoSignContent {
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

export const JUNO_SYMBOL = '⚵'; // Juno symbol

const JUNO_CONTENT: Record<ZodiacSign, Omit<JunoSignContent, 'sign'>> = {
  aries: {
    title: 'Juno in Aries',
    subtitle: 'The Independent Partner',
    intro: 'Juno in Aries needs a partnership that honors their fierce independence and matches their passionate intensity. They are drawn to bold, assertive partners who can keep up with their fire without trying to tame it. Marriage for Juno in Aries must feel like an adventure, never a cage.',
    sections: [
      {
        title: 'Partnership Style',
        icon: '💍',
        paragraphs: [
          'Juno in Aries approaches commitment with the same directness they bring to everything else. When they decide you are the one, they move fast and pursue with unmistakable intensity. There is nothing subtle about Juno in Aries in love; they are all in, all fire, and they expect the same level of passion in return.',
          'In a committed partnership, Juno in Aries needs autonomy. They cannot tolerate being told what to do, having their schedule managed, or being expected to ask permission. The ideal partner for this placement gives them room to breathe while maintaining their own strong sense of self. Codependency is the death of a Juno in Aries relationship.',
          'Conflict in their relationships tends to be direct and intense but short-lived. Juno in Aries would rather have a fierce argument and clear the air than let resentment build. Their partner must be someone who can handle emotional honesty without crumbling.',
        ],
      },
      {
        title: 'What They Need in Commitment',
        icon: '🔥',
        paragraphs: [
          'Juno in Aries needs a commitment that grows, evolves, and challenges them. A marriage that settles into comfortable routine will suffocate this placement. They need shared goals, physical chemistry, and a partner who is genuinely their equal, someone who challenges them to be better without trying to change who they are.',
          'They are drawn to partners who have their own ambitions, their own passions, and their own identity. A partner who loses themselves in the relationship will eventually lose Juno in Aries\'s respect. The ideal match is two strong individuals who choose to walk side by side, not a merger where both people disappear.',
        ],
      },
      {
        title: 'Ideal Partner & Marriage Patterns',
        icon: '✨',
        paragraphs: [
          'The ideal partner for Juno in Aries is athletic, ambitious, direct, and unafraid of conflict. They appreciate someone who can match their energy, challenge their ideas, and keep the spark alive through shared adventures and healthy competition.',
          'Marriage patterns with this placement often include early or impulsive commitments, relationships that start with dramatic intensity, and a need for continued courtship even decades into the partnership. Juno in Aries may marry more than once if their first partner cannot sustain the level of passion and independence they require.',
        ],
      },
    ],
    keywords: ['juno in aries', 'juno aries partnership', 'aries juno meaning', 'juno in aries marriage', 'independent partner astrology'],
  },
  taurus: {
    title: 'Juno in Taurus',
    subtitle: 'The Devoted Builder',
    intro: 'Juno in Taurus commits with unwavering loyalty and builds partnerships meant to last lifetimes. They need stability, sensual connection, and a shared vision for material security. Once they commit, they commit completely, and they expect the same steadfast devotion in return.',
    sections: [
      {
        title: 'Partnership Style',
        icon: '💍',
        paragraphs: [
          'Juno in Taurus approaches partnership as a lifelong building project. They are not interested in whirlwind romances that burn out; they want a relationship they can build on, literally and figuratively. Their love language is tangible: shared meals, physical touch, a beautiful home, financial security, and the kind of steady presence that never wavers.',
          'In commitment, Juno in Taurus is the most loyal placement in the zodiac. Once they have decided, they are immovable. This is both their greatest gift and their potential shadow, because they will stay in a relationship long past its expiration date out of sheer stubbornness and attachment to what they have built.',
          'They show love through consistency. Daily rituals, reliable presence, and the steady accumulation of shared experiences matter more to Juno in Taurus than grand gestures. They want a partner they can count on, and they offer the same dependability in return.',
        ],
      },
      {
        title: 'What They Need in Commitment',
        icon: '🔥',
        paragraphs: [
          'Juno in Taurus needs physical and financial security in partnership. They cannot relax into love when the foundation is shaky. A partner who is financially irresponsible, physically unavailable, or emotionally inconsistent will trigger deep anxiety in this placement.',
          'They also need sensual connection. Touch, shared meals, physical presence, and a beautiful shared environment are not luxuries for Juno in Taurus; they are necessities. A long-distance relationship or one that lacks physical intimacy will starve this placement emotionally.',
        ],
      },
      {
        title: 'Ideal Partner & Marriage Patterns',
        icon: '✨',
        paragraphs: [
          'The ideal partner for Juno in Taurus is reliable, sensual, financially grounded, and patient. They appreciate someone who values comfort without being lazy, who enjoys the finer things without being materialistic, and who can commit without drama.',
          'Marriage patterns include long courtships, practical considerations playing a major role in partner selection, and relationships that deepen significantly over time. Juno in Taurus marriages often improve with age, as the shared life they build becomes richer and more beautiful with each passing year.',
        ],
      },
    ],
    keywords: ['juno in taurus', 'juno taurus partnership', 'taurus juno meaning', 'juno in taurus marriage', 'devoted partner astrology'],
  },
  gemini: {
    title: 'Juno in Gemini',
    subtitle: 'The Intellectual Partner',
    intro: 'Juno in Gemini needs a partnership built on mental connection, endless conversation, and the freedom to be curious together. They are drawn to witty, adaptable partners who can keep them intellectually engaged for a lifetime. For Juno in Gemini, if the mind is not stimulated, the heart eventually disengages.',
    sections: [
      {
        title: 'Partnership Style',
        icon: '💍',
        paragraphs: [
          'Juno in Gemini approaches commitment through the mind first. Before they give their heart, they need to know that their partner can hold a conversation, exchange ideas, and keep things intellectually interesting. A beautiful face means nothing if the person behind it cannot engage in stimulating dialogue.',
          'In a committed relationship, Juno in Gemini keeps things light, flexible, and constantly evolving. They need variety within commitment: new topics to discuss, new places to explore together, new sides of their partner to discover. The worst sin in a Juno in Gemini relationship is becoming predictable.',
          'Communication is everything for this placement. They process emotions by talking through them, resolve conflicts by discussing them, and express love through words, texts, notes, and shared jokes. A partner who shuts down, gives the silent treatment, or cannot articulate their feelings will drive Juno in Gemini to distraction.',
        ],
      },
      {
        title: 'What They Need in Commitment',
        icon: '🔥',
        paragraphs: [
          'Juno in Gemini needs intellectual freedom within partnership. They cannot be with someone who is threatened by their curiosity, who limits their social connections, or who demands that all of their mental energy be directed exclusively at the relationship.',
          'They also need a partner who grows and changes. Juno in Gemini is terrified of stagnation, and a partner who stops learning, evolving, or surprising them will eventually lose their interest. The commitment they offer is real, but it is a commitment to grow together, not to stay the same.',
        ],
      },
      {
        title: 'Ideal Partner & Marriage Patterns',
        icon: '✨',
        paragraphs: [
          'The ideal partner for Juno in Gemini is witty, curious, well-read, and socially engaged. They appreciate someone who has their own intellectual interests, their own social circle, and their own opinions, and who can articulate all of these with charm and intelligence.',
          'Marriage patterns may include meeting through work, school, or intellectual pursuits. Juno in Gemini may take longer to commit than other placements because they want to explore their options. Once committed, they keep the relationship alive through constant communication and shared learning adventures.',
        ],
      },
    ],
    keywords: ['juno in gemini', 'juno gemini partnership', 'gemini juno meaning', 'juno in gemini marriage', 'intellectual partner astrology'],
  },
  cancer: {
    title: 'Juno in Cancer',
    subtitle: 'The Nurturing Partner',
    intro: 'Juno in Cancer commits with their whole heart, building a partnership centered on emotional safety, family, and the creation of a true home. They need a partner who can meet their emotional depth and who values the domestic sphere as a sacred space.',
    sections: [
      {
        title: 'Partnership Style',
        icon: '💍',
        paragraphs: [
          'Juno in Cancer pours their soul into partnership. For them, commitment is not a legal contract but an emotional sanctuary, a promise that they will have a safe harbor in the storms of life. They create homes that feel like temples of belonging, and they invest enormous emotional energy in making their partner feel truly held.',
          'In a committed relationship, Juno in Cancer is deeply nurturing, intuitive, and protective. They anticipate their partner\'s needs before they are expressed, remember every detail of their partner\'s history, and create rituals of care that make the relationship feel like a cocoon of love.',
          'The shadow side is clinginess and emotional manipulation. When Juno in Cancer feels insecure, they can use emotional withdrawal, guilt, or the withholding of nurture as weapons. Their partner must be emotionally mature enough to provide reassurance without enabling these patterns.',
        ],
      },
      {
        title: 'What They Need in Commitment',
        icon: '🔥',
        paragraphs: [
          'Juno in Cancer needs emotional security above all. They cannot thrive in relationships where emotional expression is suppressed, where vulnerability is seen as weakness, or where their nurturing instincts are taken for granted. They need a partner who reciprocates their care.',
          'Family is central to this placement. Whether through biological children, chosen family, or community, Juno in Cancer needs to build something familial with their partner. A relationship that remains just a couple, without expanding into a broader family network, will feel incomplete to them.',
        ],
      },
      {
        title: 'Ideal Partner & Marriage Patterns',
        icon: '✨',
        paragraphs: [
          'The ideal partner for Juno in Cancer is emotionally available, family-oriented, domestic, and capable of deep feeling. They appreciate someone who values home cooking over restaurants, cozy nights over nightclubs, and emotional depth over intellectual sparring.',
          'Marriage patterns include forming deep bonds relatively early in life, prioritizing family in all decisions, and creating relationships that center around the home. Juno in Cancer marriages often become stronger through the experience of raising children or caring for aging parents together.',
        ],
      },
    ],
    keywords: ['juno in cancer', 'juno cancer partnership', 'cancer juno meaning', 'juno in cancer marriage', 'nurturing partner astrology'],
  },
  leo: {
    title: 'Juno in Leo',
    subtitle: 'The Romantic Devotee',
    intro: 'Juno in Leo needs a partnership that celebrates both partners, a love that is generous, dramatic, and genuinely special. They commit with grand devotion and expect a relationship that feels like the greatest love story ever told.',
    sections: [
      {
        title: 'Partnership Style',
        icon: '💍',
        paragraphs: [
          'Juno in Leo approaches commitment as an epic romance. They are not interested in quiet, understated partnerships; they want a love that is celebrated, visible, and inspiring to others. Grand gestures, public declarations, and the ongoing courtship of their partner are essential to their commitment style.',
          'In a relationship, Juno in Leo is fiercely loyal, generously affectionate, and deeply proud of their partner. They want a partner they can show off, not superficially, but genuinely. They celebrate their partner\'s achievements, support their ambitions, and invest in making the partnership something that both people can be proud of.',
          'The shadow side is the need for constant validation. Juno in Leo can become demanding when they feel unappreciated, and their flair for drama can transform minor disappointments into epic conflicts. Their partner must be willing to affirm and celebrate them regularly, genuinely and without resentment.',
        ],
      },
      {
        title: 'What They Need in Commitment',
        icon: '🔥',
        paragraphs: [
          'Juno in Leo needs to feel special in their partnership. Not just loved, but adored. Not just included, but celebrated. They need a partner who makes them feel like the most important person in the room and who continues to court them long after the wedding.',
          'They also need creative and romantic stimulation. A relationship that descends into pure logistics, managing schedules, paying bills, splitting chores, without any joy, play, or romance, will slowly kill Juno in Leo\'s spirit. They need fun, creativity, and celebration woven into the fabric of daily partnership.',
        ],
      },
      {
        title: 'Ideal Partner & Marriage Patterns',
        icon: '✨',
        paragraphs: [
          'The ideal partner for Juno in Leo is warm, generous, confident, and romantically expressive. They appreciate someone who has their own light, their own talents, and who is not intimidated by Juno in Leo\'s radiance but adds to it with their own.',
          'Marriage patterns include dramatic proposals, memorable weddings, and relationships that serve as an inspiration to friends and family. Juno in Leo marriages thrive when both partners continue to invest in romance, celebration, and mutual admiration throughout the years.',
        ],
      },
    ],
    keywords: ['juno in leo', 'juno leo partnership', 'leo juno meaning', 'juno in leo marriage', 'romantic devotee astrology'],
  },
  virgo: {
    title: 'Juno in Virgo',
    subtitle: 'The Devoted Servant-Partner',
    intro: 'Juno in Virgo commits through acts of service, devotion to detail, and the daily practice of showing up for their partner. Ruled by Vesta, Virgo brings a sacred quality to partnership; for Juno in Virgo, love is a discipline, a craft, and a devotion that is expressed through consistent, thoughtful action.',
    sections: [
      {
        title: 'Partnership Style',
        icon: '💍',
        paragraphs: [
          'Juno in Virgo shows love through careful attention to their partner\'s needs. They remember how you take your coffee, they notice when you are getting sick before you do, and they quietly handle the logistics of life so that you do not have to. Their love language is service, and they perform it with the devotion that Vesta, Virgo\'s ruler, brings to the sacred flame.',
          'In a committed relationship, Juno in Virgo is practical, dependable, and deeply invested in making things work. They approach partnership as a craft to be perfected, always looking for ways to improve the relationship, to solve problems, to make daily life run more smoothly.',
          'The shadow side is criticism. Juno in Virgo can turn their analytical eye on their partner\'s flaws with devastating precision, and their desire to improve the relationship can come across as constant nitpicking. Their partner needs to understand that this criticism usually comes from love, but also that it needs boundaries.',
        ],
      },
      {
        title: 'What They Need in Commitment',
        icon: '🔥',
        paragraphs: [
          'Juno in Virgo needs a partner who appreciates the small things. Grand gestures mean less to this placement than the daily consistency of showing up, being reliable, and caring about the details. A partner who notices and values their acts of service earns their deepest devotion.',
          'They also need practical partnership. Shared responsibility for household management, financial planning, and the logistics of life is essential. Juno in Virgo cannot respect a partner who refuses to pull their weight in the practical dimension of shared living.',
        ],
      },
      {
        title: 'Ideal Partner & Marriage Patterns',
        icon: '✨',
        paragraphs: [
          'The ideal partner for Juno in Virgo is organized, health-conscious, modest, and willing to engage with the details of daily life. They appreciate someone who takes care of themselves, maintains clean and orderly living spaces, and approaches life with the same thoughtful intentionality.',
          'Marriage patterns include practical approaches to partnership: shared budgets, household systems, and a focus on building a life that works well on every level. Juno in Virgo marriages deepen through the accumulation of thousands of small acts of love and service, building an unshakeable foundation of mutual care.',
        ],
      },
    ],
    keywords: ['juno in virgo', 'juno virgo partnership', 'virgo juno meaning', 'juno in virgo marriage', 'devoted service partner astrology'],
  },
  libra: {
    title: 'Juno in Libra',
    subtitle: 'The Ideal Partner (Juno in Domicile)',
    intro: 'Juno in Libra is in its ruling sign, making this the most naturally partnership-oriented placement in the zodiac. Juno rules Libra, and when the asteroid of commitment occupies its home sign, the desire for balanced, beautiful, and harmonious partnership reaches its purest expression. These individuals are born to partner, and they bring extraordinary grace and intention to the art of commitment.',
    sections: [
      {
        title: 'Partnership Style',
        icon: '💍',
        paragraphs: [
          'Juno in Libra, occupying its own sign, elevates partnership to an art form. These individuals understand instinctively what makes a relationship work: balance, mutual respect, aesthetic harmony, and the willingness to compromise without losing oneself. They approach commitment with the same care an artist brings to a masterwork.',
          'In a committed relationship, Juno in Libra creates an atmosphere of elegance, fairness, and genuine consideration. They listen carefully, share equitably, and invest in making the relationship beautiful in every sense. Their home is harmonious, their social life is graceful, and their partnership is a source of inspiration to those who witness it.',
          'The shadow side is the tendency to prioritize harmony over honesty. Juno in Libra can suppress their own needs, avoid necessary conflicts, and maintain a beautiful facade while resentment builds beneath the surface. Their growth edge is learning that true harmony includes honest disagreement.',
        ],
      },
      {
        title: 'What They Need in Commitment',
        icon: '🔥',
        paragraphs: [
          'Juno in Libra needs absolute equality in partnership. Any imbalance, whether in power, effort, or emotional investment, is intolerable to this placement. They need to know that their partner is as committed to the relationship as they are and that both people are contributing fairly.',
          'They also need beauty and culture in their partnership. Shared aesthetic experiences, mutual appreciation for art, music, and design, and the creation of a beautiful shared life are essential. A relationship that is purely functional, without grace or beauty, will slowly drain Juno in Libra\'s spirit.',
        ],
      },
      {
        title: 'Ideal Partner & Marriage Patterns',
        icon: '✨',
        paragraphs: [
          'The ideal partner for Juno in Libra is refined, fair-minded, socially graceful, and committed to equality. They appreciate someone with good taste, good manners, and good values, someone who understands that partnership is a collaborative art that both people must practice.',
          'Marriage patterns reflect the domicile placement: Juno in Libra often commits with great intentionality and creates partnerships that endure through mutual respect and ongoing investment. They may have high standards that make initial partner selection challenging, but once they commit, they bring extraordinary dedication to making the partnership work beautifully.',
        ],
      },
    ],
    keywords: ['juno in libra', 'juno libra partnership', 'libra juno meaning', 'juno in libra marriage', 'juno domicile libra', 'ideal partner astrology'],
  },
  scorpio: {
    title: 'Juno in Scorpio',
    subtitle: 'The Soul-Bonded Partner',
    intro: 'Juno in Scorpio commits with soul-deep intensity, seeking a partnership that transforms both people at the most fundamental level. They need emotional and sexual depth, absolute honesty, and a partner willing to go to the darkest places together. For Juno in Scorpio, love is not a comfort; it is an initiation.',
    sections: [
      {
        title: 'Partnership Style',
        icon: '💍',
        paragraphs: [
          'Juno in Scorpio approaches commitment as a soul contract. They are not interested in pleasant companionship or convenient arrangement; they want a bond so deep that it transforms both people irrevocably. When Juno in Scorpio commits, they merge emotionally, physically, and spiritually with their partner at a level that other placements can barely imagine.',
          'In a committed relationship, Juno in Scorpio is fiercely loyal, deeply passionate, and intensely protective. They will go to extraordinary lengths for their partner, but they also demand extraordinary loyalty in return. Betrayal is the one sin that Juno in Scorpio cannot forgive, because it violates the sacred trust that is the foundation of everything they build.',
          'The shadow side is possessiveness and control. Juno in Scorpio can become so invested in the relationship that they attempt to control their partner through emotional intensity, jealousy, or manipulation. Learning to love without gripping is this placement\'s most important growth edge.',
        ],
      },
      {
        title: 'What They Need in Commitment',
        icon: '🔥',
        paragraphs: [
          'Juno in Scorpio needs total emotional honesty. Surface conversations, social niceties, and emotional avoidance are intolerable. They need a partner who can go deep, who is willing to be vulnerable, and who does not flinch when the relationship enters difficult emotional territory.',
          'Sexual chemistry is non-negotiable for this placement. The physical dimension of partnership is not recreational for Juno in Scorpio; it is a form of communion. A partnership without passionate physical connection will feel incomplete at the soul level.',
        ],
      },
      {
        title: 'Ideal Partner & Marriage Patterns',
        icon: '✨',
        paragraphs: [
          'The ideal partner for Juno in Scorpio is emotionally courageous, sexually confident, deeply loyal, and unafraid of intensity. They appreciate someone who has done their own psychological work and who approaches the relationship as a vehicle for mutual transformation.',
          'Marriage patterns include intense courtships, deep bonds formed through shared crisis or vulnerability, and relationships that go through dramatic cycles of death and rebirth. Juno in Scorpio marriages that survive the fires of transformation become the strongest bonds in the zodiac.',
        ],
      },
    ],
    keywords: ['juno in scorpio', 'juno scorpio partnership', 'scorpio juno meaning', 'juno in scorpio marriage', 'soul bonded partner astrology'],
  },
  sagittarius: {
    title: 'Juno in Sagittarius',
    subtitle: 'The Adventurous Partner',
    intro: 'Juno in Sagittarius needs a partnership that expands horizons and celebrates freedom. They commit to growth, adventure, and the shared pursuit of meaning, and they need a partner who understands that love and freedom are not opposites but complements.',
    sections: [
      {
        title: 'Partnership Style',
        icon: '💍',
        paragraphs: [
          'Juno in Sagittarius approaches commitment as a grand adventure. They do not want a partner who anchors them to one place but a travel companion for life\'s journey. Their ideal relationship involves shared exploration, whether physical travel, intellectual discovery, or spiritual seeking.',
          'In a committed relationship, Juno in Sagittarius is generous, optimistic, and genuinely fun to be with. They bring humor, enthusiasm, and an infectious sense of possibility to the partnership. Life with Juno in Sagittarius is never boring, because they are always planning the next adventure.',
          'The shadow side is commitment avoidance disguised as love of freedom. Juno in Sagittarius can use the need for space as an excuse to avoid emotional intimacy, and their blunt honesty can wound without intention. Their growth edge is learning to be present, not just entertaining, and to go deep, not just wide.',
        ],
      },
      {
        title: 'What They Need in Commitment',
        icon: '🔥',
        paragraphs: [
          'Juno in Sagittarius needs freedom within partnership. They must be able to travel, learn, explore, and grow without feeling that commitment means confinement. A partner who is possessive, jealous, or emotionally needy will trigger this placement\'s flight instinct.',
          'They also need shared meaning. A partnership that is purely practical or purely emotional will not satisfy Juno in Sagittarius. They need to believe that the relationship serves a higher purpose, that together they are growing toward something meaningful and beautiful.',
        ],
      },
      {
        title: 'Ideal Partner & Marriage Patterns',
        icon: '✨',
        paragraphs: [
          'The ideal partner for Juno in Sagittarius is adventurous, open-minded, philosophically curious, and comfortable with independence. They appreciate someone from a different cultural background, or at least someone who brings a fresh perspective that expands their worldview.',
          'Marriage patterns include later commitments, partners met while traveling or studying, and relationships that prioritize growth and adventure over security and routine. Juno in Sagittarius marriages thrive when both partners continue to learn, explore, and expand together throughout their lives.',
        ],
      },
    ],
    keywords: ['juno in sagittarius', 'juno sagittarius partnership', 'sagittarius juno meaning', 'juno in sagittarius marriage', 'adventurous partner astrology'],
  },
  capricorn: {
    title: 'Juno in Capricorn',
    subtitle: 'The Committed Builder',
    intro: 'Juno in Capricorn takes partnership seriously, approaching commitment as a long-term investment that requires discipline, maturity, and shared ambition. They build marriages designed to last, and they expect both partners to contribute meaningfully to a shared legacy.',
    sections: [
      {
        title: 'Partnership Style',
        icon: '💍',
        paragraphs: [
          'Juno in Capricorn approaches commitment as the most important project of their life. They do not rush into marriage; they evaluate, plan, and commit only when they are confident the partnership has genuine long-term potential. Once they commit, their dedication is rock-solid and unshakeable.',
          'In a committed relationship, Juno in Capricorn is responsible, reliable, and deeply invested in building something that lasts. They take pride in the partnership and work hard to ensure it succeeds. Anniversaries are honored, promises are kept, and the relationship is treated with the same seriousness as a career.',
          'The shadow side is emotional coldness and excessive focus on status. Juno in Capricorn can prioritize how the relationship looks from the outside over how it feels on the inside, and they may struggle to express vulnerability or emotional warmth. Their growth edge is learning that love cannot be managed like a business.',
        ],
      },
      {
        title: 'What They Need in Commitment',
        icon: '🔥',
        paragraphs: [
          'Juno in Capricorn needs respect and admiration from their partner. They need to know that their partner takes them seriously, values their contributions, and respects their ambitions. Dismissiveness or disrespect is intolerable to this placement.',
          'They also need shared goals and a clear vision for the future. Juno in Capricorn is not content with day-to-day companionship; they need to know where the relationship is heading and what they are building together. A partner without ambition or direction will frustrate them deeply.',
        ],
      },
      {
        title: 'Ideal Partner & Marriage Patterns',
        icon: '✨',
        paragraphs: [
          'The ideal partner for Juno in Capricorn is ambitious, mature, responsible, and socially established. They appreciate someone who has achieved something in the world, who carries themselves with dignity, and who approaches life with the same strategic mindset.',
          'Marriage patterns include later commitments, practical considerations influencing partner selection, and relationships that often improve with age. Juno in Capricorn marriages tend to get better over time as shared accomplishments, mutual respect, and deepening trust create an increasingly powerful bond.',
        ],
      },
    ],
    keywords: ['juno in capricorn', 'juno capricorn partnership', 'capricorn juno meaning', 'juno in capricorn marriage', 'committed builder astrology'],
  },
  aquarius: {
    title: 'Juno in Aquarius',
    subtitle: 'The Unconventional Partner',
    intro: 'Juno in Aquarius redefines what commitment looks like, bringing innovation, independence, and humanitarian values to partnership. They need a relationship that honors their individuality, supports their ideals, and refuses to follow traditional scripts about what marriage should be.',
    sections: [
      {
        title: 'Partnership Style',
        icon: '💍',
        paragraphs: [
          'Juno in Aquarius approaches commitment on their own terms. Traditional relationship rules do not apply; they will write their own vows, design their own partnership structure, and refuse to follow any template that does not feel authentic to who they are. What matters is not the form of the commitment but the freedom and authenticity within it.',
          'In a committed relationship, Juno in Aquarius values intellectual connection, shared ideals, and mutual respect for independence. They are the most likely placement to maintain separate friend groups, separate hobbies, and even separate living spaces while being deeply committed to the partnership.',
          'The shadow side is emotional detachment. Juno in Aquarius can intellectualize feelings rather than experiencing them, and their commitment to independence can prevent the vulnerability that deep intimacy requires. Their growth edge is learning that letting someone truly close is not a loss of freedom but an expansion of it.',
        ],
      },
      {
        title: 'What They Need in Commitment',
        icon: '🔥',
        paragraphs: [
          'Juno in Aquarius needs intellectual respect and the freedom to be unconventional. They cannot be with someone who demands conformity, who measures the relationship against social norms, or who expects them to play a traditional role. They need a partner who celebrates their uniqueness.',
          'They also need shared ideals. A partnership that is purely personal, without a connection to something larger, will feel empty to Juno in Aquarius. They need to know that together they are contributing to a better world, whether through activism, community involvement, or creative innovation.',
        ],
      },
      {
        title: 'Ideal Partner & Marriage Patterns',
        icon: '✨',
        paragraphs: [
          'The ideal partner for Juno in Aquarius is independent, intellectually stimulating, socially conscious, and comfortable with unconventional arrangements. They appreciate someone who has their own mission, their own community, and their own vision for the future.',
          'Marriage patterns include unconventional ceremonies, non-traditional partnership structures, and relationships that began as friendships. Juno in Aquarius marriages thrive when both partners maintain their individual identities while sharing a commitment to growth and making a difference in the world.',
        ],
      },
    ],
    keywords: ['juno in aquarius', 'juno aquarius partnership', 'aquarius juno meaning', 'juno in aquarius marriage', 'unconventional partner astrology'],
  },
  pisces: {
    title: 'Juno in Pisces',
    subtitle: 'The Soulmate Seeker',
    intro: 'Juno in Pisces seeks a partnership that transcends the ordinary, yearning for a soulmate connection that feels divinely orchestrated. They commit with boundless compassion and romantic idealism, and they need a partner who can meet them in the realm of dreams, intuition, and unconditional love.',
    sections: [
      {
        title: 'Partnership Style',
        icon: '💍',
        paragraphs: [
          'Juno in Pisces approaches partnership as a spiritual experience. They are not looking for a convenient match or a practical arrangement; they are searching for their other half, the soul they feel they have loved across lifetimes. When they find this connection, they commit with a devotion that borders on the mystical.',
          'In a committed relationship, Juno in Pisces is compassionate, intuitive, and selflessly devoted. They can sense their partner\'s moods without words, and they pour themselves into the relationship with a generosity that can be breathtaking. Their love feels like a safe ocean where their partner can float, supported and held.',
          'The shadow side is martyrdom and loss of self. Juno in Pisces can give so much that they disappear into the relationship, losing their own identity in the process. They may also idealize their partner so completely that they refuse to see red flags, staying in harmful situations because they confuse suffering with spiritual devotion.',
        ],
      },
      {
        title: 'What They Need in Commitment',
        icon: '🔥',
        paragraphs: [
          'Juno in Pisces needs emotional and spiritual depth in partnership. Small talk, surface living, and purely practical arrangements will starve their soul. They need a partner who can dream with them, pray with them, and share the kind of intimate moments that feel sacred.',
          'They also need gentleness. Harshness, criticism, and emotional coldness wound Juno in Pisces deeply. They need a partner who handles their sensitivity with care and who understands that their emotional openness is not weakness but a rare and precious gift.',
        ],
      },
      {
        title: 'Ideal Partner & Marriage Patterns',
        icon: '✨',
        paragraphs: [
          'The ideal partner for Juno in Pisces is empathic, creative, spiritually aware, and gentle. They appreciate someone who values inner life over outer achievement, who can sit in comfortable silence, and who treats the relationship as a sacred space.',
          'Marriage patterns include karmic-feeling connections, meeting through spiritual or creative communities, and relationships that feel fated or destined. Juno in Pisces marriages at their best create a private world of extraordinary beauty and emotional depth that sustains both partners through the challenges of life.',
        ],
      },
    ],
    keywords: ['juno in pisces', 'juno pisces partnership', 'pisces juno meaning', 'juno in pisces marriage', 'soulmate seeker astrology'],
  },
};

export function getJunoSignContent(sign: ZodiacSign): JunoSignContent {
  const content = JUNO_CONTENT[sign];
  return { sign, ...content };
}

export function getAdjacentSigns(sign: ZodiacSign): { prev: ZodiacSign; next: ZodiacSign } {
  const idx = ALL_SIGN_KEYS.indexOf(sign);
  const prev = ALL_SIGN_KEYS[(idx - 1 + 12) % 12];
  const next = ALL_SIGN_KEYS[(idx + 1) % 12];
  return { prev, next };
}
