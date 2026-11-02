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
    intro: 'You text first, you say the word love before anyone else is ready for it, and you ask for the second date while the first is still going. You are the one who makes the move, and nobody you have dated has ever had to guess where they stood. Subtlety in love is not your style.',
    sections: [
      {
        title: 'Love Language & Attraction Style',
        icon: '💘',
        paragraphs: [
          'You are attracted to confidence, independence, and a spark of challenge. You want someone who can stand toe-to-toe with you, who does not back down easily, and who has their own fire. A partner who is too passive or agreeable quickly bores you — you need friction to feel the heat.',
          'Your love language is action. Grand gestures, spontaneous adventures, and bold declarations of affection are how you express your feelings. You would rather show up at your partner\'s door with surprise concert tickets than write a carefully worded love letter.',
          'The chase excites you enormously. You are most alive during the pursuit, when the outcome is uncertain and the adrenaline is pumping. Once the chase is over and the relationship settles into routine, your interest can drop, and keeping the same heat on an ordinary Tuesday takes real effort from you.',
        ],
      },
      {
        title: 'Aesthetic Taste & Values',
        icon: '🎨',
        paragraphs: [
          'Your aesthetic gravitates toward bold, sporty, and statement-making. You prefer red, black, and anything that projects confidence and dynamism. Your style is about impact rather than subtlety — you want to be noticed and you dress accordingly.',
          'You value independence, courage, and authenticity above all else. You have no patience for games, manipulation, or people who hide behind social masks. What people see is what they get, and you expect the same transparency from others.',
        ],
      },
      {
        title: 'Relationship Style & Growth',
        icon: '🌱',
        paragraphs: [
          'Once you are committed, you bring passion, spontaneity and a willingness to fight for the partnership. You are fiercely protective of your loved ones and will go to extraordinary lengths to defend them.',
          'Patience is what you are short on. Slowing down, to listen before reacting, and finding excitement inside stability instead of only in novelty will change how your relationships go. The deepest love is not a sprint, and you have more stamina for the long haul than you give yourself credit for.',
        ],
      },
    ],
  },
  taurus: {
    headline: 'Venus in Taurus: Love as Sacred Sensuality',
    intro: 'You show love with your hands and your kitchen: the dinner cooked properly, the shoulder rub nobody asked for, the good sheets. You fall slowly, through touch, taste and beauty, and you build the relationship the way you would build a house meant to last.',
    sections: [
      {
        title: 'Love Language & Attraction Style',
        icon: '💘',
        paragraphs: [
          'You are attracted to stability, beauty, and genuine substance. You are drawn to people who are grounded, reliable, and comfortable in their own skin. Physical attraction is important — you respond powerfully to scent, voice, and tactile presence.',
          'Your love language is sensuality and provision. You express love by creating comfort, cooking extraordinary meals, giving thoughtful gifts, and wrapping your partner in physical affection. Every touch is intentional, every gift is carefully chosen, and every meal is made with love.',
          'You take your time falling in love. You are not interested in the thrill of the chase. You want to be sure — sure of your feelings, sure of your partner\'s reliability, and sure that this is worth your profound emotional investment.',
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
          'Once you commit, you are loyal to the bone. You are the partner who remembers anniversaries, maintains traditions, and creates a home that feels like a warm embrace. Your love deepens with time rather than fading.',
          'Change is where you dig in. Your attachment to routine can suffocate a relationship that needs room to evolve, and you dig in hardest right when your partner needs you to bend. Security and growth can sit in the same house, and a change is not a loss.',
        ],
      },
    ],
  },
  gemini: {
    headline: 'Venus in Gemini: Love Through Words & Wit',
    intro: 'Your heart opens through conversation. You fall for a mind before a body, and the quickest way in is a good text thread at midnight. Flirting is an art form for you, and the right words at the right moment can be more intoxicating than any physical touch.',
    sections: [
      {
        title: 'Love Language & Attraction Style',
        icon: '💘',
        paragraphs: [
          'You are attracted to intelligence, humor, and verbal agility. You want a partner who can match your wit, challenge your ideas, and keep you laughing. A beautiful face means nothing if the conversation is dull — you need mental chemistry above all else.',
          'Your love language is communication. Witty texts, long phone conversations, inside jokes, and the ability to talk about absolutely anything for hours are how you both express and receive love. You flirt constantly, not because you are insincere, but because verbal play is how you connect.',
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
          'In a committed relationship, you keep things fresh with humor and curiosity. You are the partner who suggests trying a new restaurant, learning a language together, or debating philosophy in bed. Boredom is impossible when your restless mind keeps reinventing the relationship.',
          'You talk about feelings so well that you can avoid having them. Your partner sometimes wishes you would stop analyzing the love and sit in it for ten quiet minutes. Dropping from your head into your chest is the thing that opens real intimacy for you.',
        ],
      },
    ],
  },
  cancer: {
    headline: 'Venus in Cancer: Love as Homecoming',
    intro: 'You bring soup when someone is ill, you remember the name of their childhood dog, and you notice a mood change before they do. Your affection wraps around a partner like a blanket, and every relationship you are in turns personal fast.',
    sections: [
      {
        title: 'Love Language & Attraction Style',
        icon: '💘',
        paragraphs: [
          'You are attracted to emotional depth, kindness, and a genuine desire for family and home. You are drawn to people who are nurturing, emotionally available, and capable of creating the kind of deep, safe bond that you crave. Surface-level charm leaves you cold.',
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
          'Once you are committed, you steer toward building a family — whether that means children, pets, or a chosen family of close friends. You remember every meaningful date, anticipate your partner\'s needs, and create traditions that bind you together.',
          'You need to be needed, and that is where it goes wrong. If your worth rides on caretaking, your love turns smothering, and a partner who does something alone feels like a rejection. Their independence is not a threat to the bond.',
        ],
      },
    ],
  },
  leo: {
    headline: 'Venus in Leo: Love as Grand Performance',
    intro: 'You plan the surprise party, write the toast, and pick the gift that makes the whole room go quiet. You love loudly and warmly, with a flair for the dramatic, and when you love someone the whole world knows it.',
    sections: [
      {
        title: 'Love Language & Attraction Style',
        icon: '💘',
        paragraphs: [
          'You are attracted to confidence, creativity, and a partner who knows how to make you feel special. You are drawn to people who are bold, expressive, and unafraid to stand out. You want a partner you are genuinely proud to show off — someone who shines as brightly as you do.',
          'Your love language is adoration and grand gestures. You express love through lavish gifts, public displays of affection, and creative expressions of your devotion. A handmade gift, a surprise party, or a heartfelt speech in front of friends is classic you.',
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
          'In a committed relationship you stay devoted, protective and romantic. You keep the spark alive through creative dates, surprise gestures, and an unwavering commitment to making your partner feel celebrated every single day.',
          'Sharing the spotlight is the hard part. Real partnership means celebrating your partner\'s achievements as enthusiastically as your own, and being willing to play a supporting role sometimes. The strongest love stories have two stars, not one star and a supporting actor.',
        ],
      },
    ],
  },
  virgo: {
    headline: 'Venus in Virgo: Love Through Devotion & Detail',
    intro: 'You notice that your partner\'s car is overdue for service, that the cough has lasted a week, that the left shoe is coming apart. Your affection arrives as a thousand small, precise acts of care instead of grand declarations, and you tend a relationship the way you would tend something fragile and valuable.',
    sections: [
      {
        title: 'Love Language & Attraction Style',
        icon: '💘',
        paragraphs: [
          'You are attracted to intelligence, competence, and genuine integrity. You are drawn to people who have their life organized, who take care of their health, and who demonstrate reliability through consistent action. Flashy charm without substance repels you.',
          'Your love language is acts of service. You show love by remembering your partner\'s medication schedule, organizing their closet, editing their resume, or noticing the small things they need before they ask. Each act of service is a love letter written in the language of attention.',
          'Once you commit to someone, you show up for them with a steady, focused devotion, the same way every day, and you do not announce it. Your dedication is quiet, it does not waver, and it deepens over the years instead of wearing thin.',
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
          'In a committed relationship you are reliable, thoughtful and invested in making it work. You are the partner who schedules couple\'s check-ins, researches the best therapist when needed, and quietly ensures that the practical foundation of the relationship is solid.',
          'Your critical eye is the thing that eats at you. You spot what is wrong with the evening, the partner and yourself before you spot what is lovely, and the corrections start to sound like disapproval. Real love is a little messy, and you will be happier the day you let a dish stay in the sink.',
        ],
      },
    ],
  },
  libra: {
    headline: 'Venus in Libra: Love as Living Art',
    intro: 'You are happiest when there is someone across the table, and a stretch of being single feels like a missing limb. You treat romance as a collaboration between two equals, and you keep a quiet running tally of whether it is fair.',
    sections: [
      {
        title: 'Love Language & Attraction Style',
        icon: '💘',
        paragraphs: [
          'You are attracted to beauty, elegance, and social grace. You are drawn to people who are aesthetically pleasing, well-mannered, and culturally refined. Intelligence is essential, but it must be paired with charm and a genuine capacity for partnership.',
          'Your love language is romance itself — candlelit dinners, thoughtful gifts, beautiful settings, and the shared appreciation of art and beauty. Your romantic instinct points at committed, equal partnership, and casual connection leaves you restless.',
          'You are deeply attracted to fairness and balance. A partner who is domineering, crude, or self-centered is physically repulsive to your refined sensibilities. You want an equal — someone who gives as much as they receive and treats the relationship as a mutual creation.',
        ],
      },
      {
        title: 'Aesthetic Taste & Values',
        icon: '🎨',
        paragraphs: [
          'Your aesthetic is elegant, harmonious, and classically beautiful. You have an innate eye for proportion, color, and design that influences everything from your wardrobe to your home to the way you present yourself. Ugliness — in all its forms — genuinely disturbs you.',
          'You value harmony, fairness and partnership above all. A life without love feels incomplete to you, not because you lack independence, but because you treat a committed partnership as one of the most serious things a person can do.',
        ],
      },
      {
        title: 'Relationship Style & Growth',
        icon: '🌱',
        paragraphs: [
          'In a committed relationship you stay romantic and fair-minded, and you work hard to keep the peace. You are the partner who plans beautiful dates, mediates conflicts with diplomacy, and ensures that both people feel heard and valued.',
          'You swallow what you really feel to keep the evening smooth, then resent it two weeks later. Saying the honest thing out loud, even when it causes a rough hour, is what makes the partnership real.',
        ],
      },
    ],
  },
  scorpio: {
    headline: 'Venus in Scorpio: Love as Transformation',
    intro: 'You read your date\'s pauses, check what they do not say, and decide within minutes whether they are lying. Your desire is not casual, it is all-consuming, and you demand total emotional truth. You do not do half-hearted love. You go all in or you leave.',
    sections: [
      {
        title: 'Love Language & Attraction Style',
        icon: '💘',
        paragraphs: [
          'You are attracted to depth, mystery, and psychological complexity. You are drawn to people who have layers, who carry secrets, and who are not afraid of the darker dimensions of human experience. Surface-level beauty means nothing without emotional substance.',
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
          'Once you commit, you are loyal and intense, with no wavering. You create bonds that go to the bone — once you fully commit, you are all in, and your partner will never question the depth of your feelings.',
          'Control is your weak spot. You need to know everything and manage every emotional variable, and a partner who needs room feels watched. Trust means giving freedom without checking the phone.',
        ],
      },
    ],
  },
  sagittarius: {
    headline: 'Venus in Sagittarius: Love as Adventure',
    intro: 'You would book the one-way ticket and ask your date to come along before you know their middle name. You bring to romance the same enthusiasm you bring to travel and big arguments about what is true, and you want a partner who expands your world and argues back.',
    sections: [
      {
        title: 'Love Language & Attraction Style',
        icon: '💘',
        paragraphs: [
          'You are attracted to optimism, intelligence, and a spirit of adventure. You are drawn to people from different cultures, backgrounds, or philosophical traditions — anyone who broadens your perspective and makes the world feel bigger. A narrow-minded partner is an instant dealbreaker.',
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
          'In a committed relationship you bring joy and an enthusiasm that catches. You are the partner who keeps the relationship exciting, who always has a plan for the next adventure, and who approaches challenges with humor and faith.',
          'You get skittish when the relationship asks for responsibility instead of fun. Commitment feels like a fence, so you plan a trip right when things deepen. A supportive bond gives you more room to roam, not less, and you only find that out by staying.',
        ],
      },
    ],
  },
  capricorn: {
    headline: 'Venus in Capricorn: Love Built to Last',
    intro: 'You check whether this person pays bills on time, how they treat their mother and what they want in ten years, and you do it before the third date. You approach romance with the same strategy you bring to your career. That is not cold calculation. You know that lasting love takes structure and real effort.',
    sections: [
      {
        title: 'Love Language & Attraction Style',
        icon: '💘',
        paragraphs: [
          'You are attracted to ambition, maturity, and quiet competence. You are drawn to people who have their life together, who know where they are going, and who demonstrate reliability through consistent action rather than empty promises. You respect achievement and discipline in a partner.',
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
          'Once you commit, you are rock-solid loyal, quietly romantic and protective. You plan for the future and hold things steady in a crisis, and you get warmer and more openly affectionate with every passing year, so your relationships tend to improve with age.',
          'You say you are fine when you are not. If you treat vulnerability as weakness, your walls keep out the intimacy you want. Letting your partner see your fear, your softness and your need to be held is what moves your love life from respectable to extraordinary.',
        ],
      },
    ],
  },
  aquarius: {
    headline: 'Venus in Aquarius: Love Without Borders',
    intro: 'You would rather spend a Saturday volunteering or arguing about the future with someone than sit through a traditional candlelit dinner. Your approach to romance is unconventional and free of the usual script, and you want a connection that two people invent for themselves.',
    sections: [
      {
        title: 'Love Language & Attraction Style',
        icon: '💘',
        paragraphs: [
          'You are attracted to originality, intellect, and a fierce commitment to authenticity. You are drawn to people who think differently, who challenge social conventions, and who are unafraid to be exactly who they are. Conformity is the opposite of attractive to you.',
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
          'In a committed relationship you offer friendship, a real partnership of minds and respect for your partner\'s individuality. You are the partner who encourages personal growth, supports unconventional choices, and never tries to change who your partner fundamentally is.',
          'You can make a partner feel like a fascinating study instead of a loved person. Someone who needs a hug and a plain I love you hears an interesting opinion instead. Pair the sharp mind with some open tenderness and the love becomes both original and comforting.',
        ],
      },
    ],
  },
  pisces: {
    headline: 'Venus in Pisces: Love as Transcendence',
    intro: 'You cry at the film, forgive the third lie, and stay on the phone until three in the morning because the other person sounded sad. You love without conditions, without boundaries and without reservation, and your capacity for devotion and sacrifice is far beyond average.',
    sections: [
      {
        title: 'Love Language & Attraction Style',
        icon: '💘',
        paragraphs: [
          'You are attracted to sensitivity, creativity, and spiritual depth. You are drawn to artists, healers, dreamers, and anyone who carries a certain wistful, soulful quality. Physical appearance matters less to you than the feeling someone evokes — you fall in love with auras, not appearances.',
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
          'In a committed relationship you are selfless, intuitive and quick to forgive. You are the partner who loves without conditions, who sees the best in your partner even when they cannot see it themselves, and who creates a relationship that feels like coming home to your soul.',
          'Boundaries are what you lack. Your limitless compassion leads to self-sacrifice and to staying in relationships that harm you long after your friends have said so. Love yourself as unconditionally as you love others, and walk away when love turns destructive.',
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
