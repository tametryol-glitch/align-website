/* ──────────────────────────────────────────────────────────────
   Venus Sign Content
   SEO-rich astrological content for all 12 Venus sign pages.
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

export interface VenusSignContent {
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

export const VENUS_SYMBOL = '♀';

/* ── Content for each Venus sign ──────────────────────────────── */

const VENUS_CONTENT: Record<ZodiacSign, Omit<VenusSignContent, 'sign'>> = {
  aries: {
    headline: 'Venus in Aries: Love at Full Speed',
    intro: 'With Venus in Aries, you love like a warrior charging into battle — fiercely, directly, and without hesitation. You are the initiator of romance, the one who makes the first move, and your passion is as unmistakable as a flare in the night sky. Subtlety in love is simply not your style.',
    sections: [
      {
        title: 'Love Language & Attraction Style',
        icon: '💘',
        paragraphs: [
          'Venus in Aries is attracted to confidence, independence, and a spark of challenge. You want someone who can stand toe-to-toe with you, who does not back down easily, and who has their own fire. A partner who is too passive or agreeable quickly bores you — you need friction to feel the heat.',
          'Your love language is action. Grand gestures, spontaneous adventures, and bold declarations of affection are how you express your feelings. You would rather show up at your partner\'s door with surprise concert tickets than write a carefully worded love letter.',
          'The chase excites you enormously. You are most alive during the pursuit, when the outcome is uncertain and the adrenaline is pumping. The challenge for Venus in Aries is maintaining the same intensity once the chase is over and the relationship settles into routine.',
        ],
      },
      {
        title: 'Aesthetic Taste & Values',
        icon: '🎨',
        paragraphs: [
          'Your aesthetic gravitates toward bold, sporty, and statement-making. You prefer red, black, and anything that projects confidence and dynamism. Your style is about impact rather than subtlety — you want to be noticed and you dress accordingly.',
          'You value independence, courage, and authenticity above all else. You have no patience for games, manipulation, or people who hide behind social masks. What you see with Venus in Aries is what you get, and you expect the same transparency from others.',
        ],
      },
      {
        title: 'Relationship Style & Growth',
        icon: '🌱',
        paragraphs: [
          'In committed relationships, Venus in Aries brings passion, spontaneity, and an unwavering willingness to fight for the partnership. You are fiercely protective of your loved ones and will go to extraordinary lengths to defend them.',
          'Your growth area in love is patience. Learning to slow down, to listen before reacting, and to find excitement within stability rather than only in novelty will transform your relationships. The deepest love is not a sprint — it is an endurance race, and your warrior heart has the stamina for it.',
        ],
      },
    ],
  },
  taurus: {
    headline: 'Venus in Taurus: Love as Sacred Sensuality',
    intro: 'Venus is at home in Taurus, making this one of the most naturally romantic and sensually gifted placements in astrology. With Venus in Taurus, you love through the senses — through touch, taste, beauty, and the slow, deliberate building of something that will last forever.',
    sections: [
      {
        title: 'Love Language & Attraction Style',
        icon: '💘',
        paragraphs: [
          'Venus in Taurus is attracted to stability, beauty, and genuine substance. You are drawn to people who are grounded, reliable, and comfortable in their own skin. Physical attraction is important — you respond powerfully to scent, voice, and tactile presence.',
          'Your love language is sensuality and provision. You express love by creating comfort, cooking extraordinary meals, giving thoughtful gifts, and wrapping your partner in physical affection. Every touch is intentional, every gift is carefully chosen, and every meal is made with love.',
          'You take your time falling in love. Unlike Venus in Aries, you are not interested in the thrill of the chase. You want to be sure — sure of your feelings, sure of your partner\'s reliability, and sure that this is worth your profound emotional investment.',
        ],
      },
      {
        title: 'Aesthetic Taste & Values',
        icon: '🎨',
        paragraphs: [
          'Your aesthetic is rich, earthy, and luxurious. You prefer natural materials, warm colors, and quality craftsmanship. Your home is your sanctuary, filled with comfortable furniture, beautiful art, and the aroma of something delicious cooking. You have an innate sense of beauty that others admire.',
          'You value loyalty, consistency, and material security. A partner who is financially reckless or emotionally unpredictable is deeply unsettling to you. You want to build a beautiful, stable life together, brick by brick, and you need a partner who shares that vision.',
        ],
      },
      {
        title: 'Relationship Style & Growth',
        icon: '🌱',
        paragraphs: [
          'In committed relationships, Venus in Taurus is profoundly loyal, sensual, and devoted. You are the partner who remembers anniversaries, maintains traditions, and creates a home that feels like a warm embrace. Your love deepens with time rather than fading.',
          'Your growth area is flexibility. Your attachment to routine and your resistance to change can suffocate relationships that need room to evolve. Learning that security can coexist with growth, and that change does not mean loss, will enrich your love life immeasurably.',
        ],
      },
    ],
  },
  gemini: {
    headline: 'Venus in Gemini: Love Through Words & Wit',
    intro: 'With Venus in Gemini, your heart opens through conversation. You fall in love with minds before bodies, and the quickest way to your heart is through your intellect. Flirting is an art form for you, and the right words at the right moment can be more intoxicating than any physical touch.',
    sections: [
      {
        title: 'Love Language & Attraction Style',
        icon: '💘',
        paragraphs: [
          'Venus in Gemini is attracted to intelligence, humor, and verbal agility. You want a partner who can match your wit, challenge your ideas, and keep you laughing. A beautiful face means nothing if the conversation is dull — you need mental chemistry above all else.',
          'Your love language is communication. Witty texts, long phone conversations, inside jokes, and the ability to talk about absolutely anything for hours are how you both express and receive love. You are the zodiac\'s greatest flirt, not because you are insincere, but because verbal play is your native mode of connection.',
          'Variety in romance excites you. You need a partner who is multifaceted, who can be your intellectual sparring partner one day and your playful companion the next. Predictability in love feels like a slowly tightening noose to your restless heart.',
        ],
      },
      {
        title: 'Aesthetic Taste & Values',
        icon: '🎨',
        paragraphs: [
          'Your aesthetic is trendy, eclectic, and clever. You keep up with cultural currents and enjoy experimenting with different styles. Your space tends to be filled with books, gadgets, and conversation-starting objects. You value things that are interesting over things that are merely expensive.',
          'You value intellectual freedom, social connection, and adaptability. A partner who is controlling, jealous, or intellectually rigid is your nightmare. You need the freedom to explore ideas, maintain diverse friendships, and change your mind without being judged.',
        ],
      },
      {
        title: 'Relationship Style & Growth',
        icon: '🌱',
        paragraphs: [
          'In committed relationships, Venus in Gemini brings humor, curiosity, and perpetual freshness. You are the partner who suggests trying a new restaurant, learning a language together, or debating philosophy in bed. Boredom is impossible when your restless mind keeps reinventing the relationship.',
          'Your growth area is emotional depth. You can intellectualize feelings to avoid actually experiencing them, and your partner may sometimes wish you would stop analyzing your love and simply feel it. Learning to drop from your head into your heart will unlock a dimension of intimacy you have only glimpsed.',
        ],
      },
    ],
  },
  cancer: {
    headline: 'Venus in Cancer: Love as Homecoming',
    intro: 'With Venus in Cancer, love is sanctuary. You love like a warm kitchen on a cold night — nourishing, protective, and deeply comforting. Your affection wraps around your partner like a blanket, and your emotional depth transforms every relationship into something sacred and deeply personal.',
    sections: [
      {
        title: 'Love Language & Attraction Style',
        icon: '💘',
        paragraphs: [
          'Venus in Cancer is attracted to emotional depth, kindness, and a genuine desire for family and home. You are drawn to people who are nurturing, emotionally available, and capable of creating the kind of deep, safe bond that you crave. Surface-level charm leaves you cold.',
          'Your love language is nurturing. You cook for the people you love, create cozy spaces for them, remember their childhood stories, and show up with unwavering emotional support during their darkest moments. Your care is specific, personal, and deeply attentive.',
          'You fall in love with the whole person — their history, their family, their vulnerabilities. You want to know everything about your partner\'s past because understanding where they come from helps you love them more completely.',
        ],
      },
      {
        title: 'Aesthetic Taste & Values',
        icon: '🎨',
        paragraphs: [
          'Your aesthetic is cozy, nostalgic, and deeply personal. You prefer soft colors, family heirlooms, and objects that carry emotional significance. Your home is the physical embodiment of your heart — warm, inviting, and filled with memories.',
          'You value emotional security, family bonds, and domestic harmony above all else. A partner who dismisses the importance of home and family, or who is emotionally unavailable, is fundamentally incompatible with your deepest values.',
        ],
      },
      {
        title: 'Relationship Style & Growth',
        icon: '🌱',
        paragraphs: [
          'In committed relationships, Venus in Cancer is deeply devoted, emotionally intuitive, and naturally oriented toward creating a family — whether that means children, pets, or a chosen family of close friends. You remember every meaningful date, anticipate your partner\'s needs, and create traditions that bind you together.',
          'Your growth area is releasing the need to be needed. Your love can sometimes become smothering or codependent if you define your worth entirely through caretaking. Learning that your partner\'s independence does not threaten your bond is an important evolution.',
        ],
      },
    ],
  },
  leo: {
    headline: 'Venus in Leo: Love as Grand Performance',
    intro: 'With Venus in Leo, you love like the Sun — radiantly, generously, and with an intensity that leaves no room for doubt. You bring theatrical devotion, creative passion, and an irresistible warmth to every romantic encounter. When you love someone, the whole world knows it.',
    sections: [
      {
        title: 'Love Language & Attraction Style',
        icon: '💘',
        paragraphs: [
          'Venus in Leo is attracted to confidence, creativity, and a partner who knows how to make you feel special. You are drawn to people who are bold, expressive, and unafraid to stand out. You want a partner you are genuinely proud to show off — someone who shines as brightly as you do.',
          'Your love language is adoration and grand gestures. You express love through lavish gifts, public displays of affection, and creative expressions of your devotion. A handmade gift, a surprise party, or a heartfelt speech in front of friends is vintage Venus in Leo.',
          'You need to feel like the star of your partner\'s life. This is not narcissism — it is a genuine emotional need for recognition and celebration. A partner who takes you for granted or fails to express their admiration will leave you feeling emotionally starved.',
        ],
      },
      {
        title: 'Aesthetic Taste & Values',
        icon: '🎨',
        paragraphs: [
          'Your aesthetic is dramatic, luxurious, and unapologetically bold. You favor gold accents, rich colors, and statement pieces that command attention. Your personal space is warm, theatrical, and designed for entertaining. You have a gift for creating environments that feel celebratory.',
          'You value loyalty, generosity, and creative self-expression. A partner who is stingy — with money, affection, or compliments — is deeply unappealing. You give abundantly and you need a partner who matches your generosity of spirit.',
        ],
      },
      {
        title: 'Relationship Style & Growth',
        icon: '🌱',
        paragraphs: [
          'In committed relationships, Venus in Leo is passionately devoted, fiercely protective, and endlessly romantic. You keep the spark alive through creative dates, surprise gestures, and an unwavering commitment to making your partner feel celebrated every single day.',
          'Your growth area is sharing the spotlight. True partnership means celebrating your partner\'s achievements as enthusiastically as your own, and being willing to play a supporting role sometimes. The strongest love stories have two stars, not one star and a supporting actor.',
        ],
      },
    ],
  },
  virgo: {
    headline: 'Venus in Virgo: Love Through Devotion & Detail',
    intro: 'With Venus in Virgo, you love with quiet, focused devotion. Your affection manifests not through grand declarations but through a thousand small, precise acts of care. Ruled by Vesta, your love carries the quality of sacred service — you tend to your relationships with the meticulous attention of someone caring for something precious.',
    sections: [
      {
        title: 'Love Language & Attraction Style',
        icon: '💘',
        paragraphs: [
          'Venus in Virgo is attracted to intelligence, competence, and genuine integrity. You are drawn to people who have their life organized, who take care of their health, and who demonstrate reliability through consistent action. Flashy charm without substance repels you.',
          'Your love language is acts of service. You show love by remembering your partner\'s medication schedule, organizing their closet, editing their resume, or noticing the small things they need before they ask. Each act of service is a love letter written in the language of attention.',
          'Ruled by Vesta, your Venus carries devotional intensity. When you commit to someone, you bring the focused, sacred energy of someone tending an eternal flame. Your dedication is quiet but unwavering, and it deepens rather than diminishes over time.',
        ],
      },
      {
        title: 'Aesthetic Taste & Values',
        icon: '🎨',
        paragraphs: [
          'Your aesthetic is clean, refined, and purposeful. You prefer well-designed, functional spaces with a natural color palette. Quality craftsmanship appeals to you more than ostentatious luxury. Your personal style is put-together and understated, with attention to fit, fabric, and detail.',
          'You value health, integrity, and continuous improvement. A partner who is dishonest, chaotic, or unwilling to grow is incompatible with your values. You respect people who are working on themselves and who approach life with conscientiousness and care.',
        ],
      },
      {
        title: 'Relationship Style & Growth',
        icon: '🌱',
        paragraphs: [
          'In committed relationships, Venus in Virgo is reliable, thoughtful, and deeply invested in making the partnership work. You are the partner who schedules couple\'s check-ins, researches the best therapist when needed, and quietly ensures that the practical foundation of the relationship is solid.',
          'Your growth area is accepting imperfection — in yourself, your partner, and your relationship. Your critical eye can become corrosive if you focus too much on what is wrong rather than what is beautiful. Learning to appreciate the perfectly imperfect nature of real love will bring you enormous peace.',
        ],
      },
    ],
  },
  libra: {
    headline: 'Venus in Libra: Love as Living Art',
    intro: 'With Venus in Libra, love is the center of your universe. Ruled by Juno, Venus in this sign brings a deep, principled devotion to partnership. You approach romance as a collaboration — a beautiful, balanced dance between two equals who bring out the best in each other.',
    sections: [
      {
        title: 'Love Language & Attraction Style',
        icon: '💘',
        paragraphs: [
          'Venus in Libra is attracted to beauty, elegance, and social grace. You are drawn to people who are aesthetically pleasing, well-mannered, and culturally refined. Intelligence is essential, but it must be paired with charm and a genuine capacity for partnership.',
          'Your love language is romance itself — candlelit dinners, thoughtful gifts, beautiful settings, and the shared appreciation of art and beauty. Ruled by Juno, your romantic instinct is specifically oriented toward committed, equal partnership rather than casual connection.',
          'You are deeply attracted to fairness and balance. A partner who is domineering, crude, or self-centered is physically repulsive to your refined sensibilities. You want an equal — someone who gives as much as they receive and treats the relationship as a mutual creation.',
        ],
      },
      {
        title: 'Aesthetic Taste & Values',
        icon: '🎨',
        paragraphs: [
          'Your aesthetic is elegant, harmonious, and classically beautiful. You have an innate eye for proportion, color, and design that influences everything from your wardrobe to your home to the way you present yourself. Ugliness — in all its forms — genuinely disturbs you.',
          'You value harmony, justice, and partnership above all. A life without love feels incomplete to you, not because you lack independence, but because you believe that partnership is one of humanity\'s highest callings. Juno\'s influence gives you a sacred view of committed love.',
        ],
      },
      {
        title: 'Relationship Style & Growth',
        icon: '🌱',
        paragraphs: [
          'In committed relationships, Venus in Libra is romantic, fair-minded, and deeply invested in maintaining harmony. You are the partner who plans beautiful dates, mediates conflicts with diplomacy, and ensures that both people feel heard and valued.',
          'Your growth area is authenticity. Your desire for harmony can lead you to suppress your genuine feelings in favor of keeping the peace. Learning that real partnership requires honest expression — even when it creates temporary discord — will deepen your relationships immeasurably.',
        ],
      },
    ],
  },
  scorpio: {
    headline: 'Venus in Scorpio: Love as Transformation',
    intro: 'With Venus in Scorpio, you love with an intensity that burns through pretense and reaches the soul. Your desire is not casual — it is all-consuming, transformative, and unflinching in its demand for total emotional truth. You do not do half-hearted love. You do total immersion or nothing at all.',
    sections: [
      {
        title: 'Love Language & Attraction Style',
        icon: '💘',
        paragraphs: [
          'Venus in Scorpio is attracted to depth, mystery, and psychological complexity. You are drawn to people who have layers, who carry secrets, and who are not afraid of the darker dimensions of human experience. Surface-level beauty means nothing without emotional substance.',
          'Your love language is intimacy — raw, unfiltered, soul-baring intimacy. You express love through deep conversations at three in the morning, through physical connection that transcends the merely physical, and through a loyalty so fierce it borders on the obsessive.',
          'You see love as a crucible for transformation. You want a partnership that changes you, that burns away everything inauthentic, and that forges both partners into stronger, more honest versions of themselves. This is not comfortable love — it is evolutionary love.',
        ],
      },
      {
        title: 'Aesthetic Taste & Values',
        icon: '🎨',
        paragraphs: [
          'Your aesthetic is dark, magnetic, and intensely personal. You are drawn to deep colors, private spaces, and objects that carry emotional charge. Your style is seductive without being obvious — there is always something hidden, something that only the most perceptive observer would notice.',
          'You value loyalty, emotional honesty, and depth above all else. Betrayal is the one thing you cannot forgive, because trust is sacred to you. You would rather hear a devastating truth than a beautiful lie, and you extend the same radical honesty to your partner.',
        ],
      },
      {
        title: 'Relationship Style & Growth',
        icon: '🌱',
        paragraphs: [
          'In committed relationships, Venus in Scorpio is profoundly loyal, intensely passionate, and unwavering in devotion. You create bonds that go to the bone — once you fully commit, you are all in, and your partner will never question the depth of your feelings.',
          'Your growth area is releasing control. Your need to know everything, to manage every emotional variable, can become suffocating for partners who need more autonomy. Learning that trust means allowing your partner freedom without surveillance will transform your relationships.',
        ],
      },
    ],
  },
  sagittarius: {
    headline: 'Venus in Sagittarius: Love as Adventure',
    intro: 'With Venus in Sagittarius, love is the greatest adventure of all. You approach romance with the same enthusiasm you bring to travel, philosophy, and the pursuit of truth. You want a partner who expands your world, challenges your beliefs, and joins you on the endless quest for meaning.',
    sections: [
      {
        title: 'Love Language & Attraction Style',
        icon: '💘',
        paragraphs: [
          'Venus in Sagittarius is attracted to optimism, intelligence, and a spirit of adventure. You are drawn to people from different cultures, backgrounds, or philosophical traditions — anyone who broadens your perspective and makes the world feel bigger. A narrow-minded partner is an instant dealbreaker.',
          'Your love language is shared experience. You express love by planning adventures, introducing your partner to new ideas, and creating memories that span continents and cultures. A backpacking trip together is more romantic to you than a hundred candlelit dinners.',
          'Humor is essential. You need a partner who makes you laugh, who does not take life too seriously, and who can find the joy in any situation. Your ideal romantic connection is part love affair, part philosophical discussion, part comedy show.',
        ],
      },
      {
        title: 'Aesthetic Taste & Values',
        icon: '🎨',
        paragraphs: [
          'Your aesthetic is worldly, eclectic, and colorful. Your space is filled with souvenirs from travels, books from various cultures, and art that tells stories. You dress for comfort and self-expression rather than convention, and your style often reflects multicultural influences.',
          'You value freedom, honesty, and personal growth. A partner who is possessive, dishonest, or stuck in their ways is fundamentally incompatible with your values. You need room to grow, explore, and evolve — and you need a partner who is growing alongside you.',
        ],
      },
      {
        title: 'Relationship Style & Growth',
        icon: '🌱',
        paragraphs: [
          'In committed relationships, Venus in Sagittarius brings joy, optimism, and an infectious enthusiasm for life. You are the partner who keeps the relationship exciting, who always has a plan for the next adventure, and who approaches challenges with humor and faith.',
          'Your growth area is commitment depth. Your love of freedom can make you skittish about the deeper responsibilities of partnership. Learning that commitment does not equal imprisonment — that the deepest freedom can be found within a truly supportive bond — is your path to romantic maturity.',
        ],
      },
    ],
  },
  capricorn: {
    headline: 'Venus in Capricorn: Love Built to Last',
    intro: 'With Venus in Capricorn, love is a serious investment. You approach romance with the same strategic intelligence you bring to your career — carefully, deliberately, and with an eye toward long-term returns. This is not cold-blooded calculation. It is the wisdom of someone who knows that lasting love requires structure, commitment, and real effort.',
    sections: [
      {
        title: 'Love Language & Attraction Style',
        icon: '💘',
        paragraphs: [
          'Venus in Capricorn is attracted to ambition, maturity, and quiet competence. You are drawn to people who have their life together, who know where they are going, and who demonstrate reliability through consistent action rather than empty promises. You respect achievement and discipline in a partner.',
          'Your love language is commitment and provision. You show love by building a secure future together, by showing up reliably day after day, and by making practical investments in the relationship. You may not write poetry, but you will fix the leaky faucet, file the taxes, and plan for retirement.',
          'You take your time choosing a partner because you intend for the choice to be permanent. You are not interested in casual connections or relationships that serve as mere entertainment. When you commit, you commit with the intention of building something that outlasts you.',
        ],
      },
      {
        title: 'Aesthetic Taste & Values',
        icon: '🎨',
        paragraphs: [
          'Your aesthetic is classic, understated, and impeccably crafted. You prefer timeless pieces over trendy items, dark colors, and quality that speaks for itself. Your home is well-organized, professionally decorated, and reflects your status and taste without being ostentatious.',
          'You value ambition, integrity, and long-term thinking. A partner who is lazy, irresponsible, or living only for the moment conflicts with your fundamental values. You need a partner who takes life seriously and contributes equally to building a shared legacy.',
        ],
      },
      {
        title: 'Relationship Style & Growth',
        icon: '🌱',
        paragraphs: [
          'In committed relationships, Venus in Capricorn is rock-solid loyal, quietly romantic, and deeply protective. You are the partner who plans for the future, who provides stability during crisis, and whose love becomes richer and more demonstrative with age — Capricorn Venus relationships often improve dramatically over time.',
          'Your growth area is vulnerability. Your emotional walls can prevent genuine intimacy if you equate vulnerability with weakness. Learning to let your partner see your fears, your softness, and your need for comfort will transform your love life from respectable to extraordinary.',
        ],
      },
    ],
  },
  aquarius: {
    headline: 'Venus in Aquarius: Love Without Borders',
    intro: 'With Venus in Aquarius, you love like nobody else — literally. Your approach to romance is unconventional, intellectually driven, and refreshingly free from traditional expectations. You seek a connection that transcends social norms and creates something genuinely original between two unique individuals.',
    sections: [
      {
        title: 'Love Language & Attraction Style',
        icon: '💘',
        paragraphs: [
          'Venus in Aquarius is attracted to originality, intellect, and a fierce commitment to authenticity. You are drawn to people who think differently, who challenge social conventions, and who are unafraid to be exactly who they are. Conformity is the opposite of attractive to you.',
          'Your love language is intellectual connection and shared ideals. You express love through stimulating conversation, supporting your partner\'s individual growth, and collaborating on projects that make the world better. Your idea of a perfect date involves a deep philosophical discussion or attending a social cause event together.',
          'Freedom within partnership is non-negotiable. You cannot function in a relationship that demands you sacrifice your individuality. You need a partner who respects your autonomy, supports your friendships, and does not try to possess you emotionally.',
        ],
      },
      {
        title: 'Aesthetic Taste & Values',
        icon: '🎨',
        paragraphs: [
          'Your aesthetic is futuristic, eclectic, and deliberately unconventional. You are drawn to avant-garde design, unusual color combinations, and technology. Your space reflects your unique worldview — it is neither traditional nor mainstream, but it is genuinely you.',
          'You value equality, intellectual freedom, and social progress. A partner who is prejudiced, close-minded, or invested in maintaining the status quo is deeply unappealing. You need a relationship that feels progressive and that contributes positively to the larger community.',
        ],
      },
      {
        title: 'Relationship Style & Growth',
        icon: '🌱',
        paragraphs: [
          'In committed relationships, Venus in Aquarius brings friendship, intellectual partnership, and a genuine respect for individuality. You are the partner who encourages personal growth, supports unconventional choices, and never tries to change who your partner fundamentally is.',
          'Your growth area is emotional warmth. Your intellectual approach to love can sometimes feel cold to partners who need more traditional expressions of affection. Learning to pair your brilliant mind with open-hearted tenderness will create the kind of love that is both revolutionary and deeply comforting.',
        ],
      },
    ],
  },
  pisces: {
    headline: 'Venus in Pisces: Love as Transcendence',
    intro: 'Venus is exalted in Pisces, making this arguably the most romantic, compassionate, and spiritually attuned Venus placement in the entire zodiac. With Venus in Pisces, you love without conditions, without boundaries, and without reservation. Your capacity for devotion, sacrifice, and emotional connection is truly extraordinary.',
    sections: [
      {
        title: 'Love Language & Attraction Style',
        icon: '💘',
        paragraphs: [
          'Venus in Pisces is attracted to sensitivity, creativity, and spiritual depth. You are drawn to artists, healers, dreamers, and anyone who carries a certain wistful, soulful quality. Physical appearance matters less to you than the feeling someone evokes — you fall in love with auras, not appearances.',
          'Your love language is emotional and spiritual merger. You express love by dissolving the boundaries between yourself and your partner, by intuiting their needs before they speak, and by offering unconditional acceptance of every aspect of who they are. Your compassion is limitless.',
          'Romance for you is inherently spiritual. You experience love as a transcendent force that connects you to something larger than yourself. Music, poetry, art, and shared moments of quiet beauty are the sacred rituals of your romantic life.',
        ],
      },
      {
        title: 'Aesthetic Taste & Values',
        icon: '🎨',
        paragraphs: [
          'Your aesthetic is dreamy, romantic, and inspired by art and nature. You are drawn to flowing fabrics, sea colors, iridescent textures, and anything that evokes the otherworldly. Your space tends to be atmospheric — candles, music, and an ethereal quality that makes visitors feel they have stepped into a dream.',
          'You value compassion, creativity, and spiritual connection above material success. A partner who is cruel, cynical, or emotionally cold is incompatible with your gentle nature. You need a relationship that nourishes your soul, not just your ego.',
        ],
      },
      {
        title: 'Relationship Style & Growth',
        icon: '🌱',
        paragraphs: [
          'In committed relationships, Venus in Pisces is selflessly devoted, emotionally intuitive, and endlessly forgiving. You are the partner who loves without conditions, who sees the best in your partner even when they cannot see it themselves, and who creates a relationship that feels like coming home to your soul.',
          'Your growth area is boundaries. Your limitless compassion can lead to self-sacrifice, codependency, and staying in relationships that harm you. Learning to love yourself as unconditionally as you love others — and to walk away when love becomes destructive — is essential for your wellbeing.',
        ],
      },
    ],
  },
};

/* ── Lookup function ──────────────────────────────────────────── */

export function getVenusSignContent(sign: ZodiacSign): VenusSignContent {
  const data = VENUS_CONTENT[sign];
  return { sign, ...data };
}
