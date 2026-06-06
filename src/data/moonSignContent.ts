/* ──────────────────────────────────────────────────────────────
   Moon Sign Content
   SEO-rich astrological content for all 12 Moon sign pages.
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

export interface MoonSignContent {
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

export const MOON_SYMBOL = '☽';

/* ── Content for each Moon sign ───────────────────────────────── */

const MOON_CONTENT: Record<ZodiacSign, Omit<MoonSignContent, 'sign'>> = {
  aries: {
    headline: 'Moon in Aries: The Fierce Heart',
    intro: 'With your Moon in Aries, your emotional world is a furnace of passion, immediacy, and raw honesty. You feel everything at full volume and express it just as fast. Your emotional reactions are swift, fiery, and surprisingly transparent — what you feel, everyone knows.',
    sections: [
      {
        title: 'Emotional Nature & Inner World',
        icon: '🔥',
        paragraphs: [
          'Moon in Aries processes emotions through action. When you feel something deeply, your instinct is not to sit with it but to do something about it. Sadness becomes determination. Anger becomes fuel. Joy becomes spontaneous adventure. You metabolize feelings at lightning speed, which means you rarely hold grudges — you flare up hot and cool down just as fast.',
          'Your inner world is restless and pioneering. You need emotional stimulation the way others need emotional security. Stagnation is your worst nightmare, and you thrive when your emotional life feels dynamic and forward-moving. Routine emotional landscapes bore you deeply.',
          'There is a childlike purity to your emotional expression. You say what you feel without filtering, and you expect others to do the same. Passive-aggressive behavior genuinely confuses you, because you cannot imagine choosing to hide what you feel when expressing it is so much simpler.',
        ],
      },
      {
        title: 'What You Need in Love',
        icon: '💕',
        paragraphs: [
          'Moon in Aries needs a partner who can handle intensity without flinching. You need someone who matches your energy, engages in honest conflict without taking it personally, and respects your fierce independence. A partner who tries to domesticate your fire will only get burned.',
          'You crave excitement and spontaneity in your emotional bonds. Predictability feels like emotional death to you. The partner who surprises you, challenges you, and keeps you on your toes earns your deepest devotion. You need to feel like the relationship is an adventure, not a sentence.',
          'Physical affection is essential. You process emotions through your body, and touch is how you both give and receive emotional comfort. A partner who is physically distant or emotionally withholding will leave you feeling starved.',
        ],
      },
      {
        title: 'Processing Feelings & Self-Care',
        icon: '🧘',
        paragraphs: [
          'You process feelings through physical activity. Running, competitive sports, martial arts, or any form of intense movement helps you metabolize emotional energy. When you are stuck in your feelings, getting your body moving is the fastest path to clarity.',
          'Your emotional self-care needs include freedom, autonomy, and the space to act on your impulses without judgment. You also benefit from learning to sit with discomfort rather than immediately charging toward a solution — some emotions need to be felt, not fixed.',
        ],
      },
    ],
  },
  taurus: {
    headline: 'Moon in Taurus: The Steady Anchor',
    intro: 'With your Moon in Taurus, your emotional world is a garden — lush, abundant, and deeply rooted. The Moon is exalted in Taurus, meaning this placement provides exceptional emotional stability, sensual depth, and a capacity for contentment that others envy. You feel most yourself when your senses are satisfied and your world feels secure.',
    sections: [
      {
        title: 'Emotional Nature & Inner World',
        icon: '🌿',
        paragraphs: [
          'Moon in Taurus processes emotions slowly and thoroughly. You do not react impulsively — you let feelings settle, like sediment in still water, until you can see them clearly. This deliberate processing gives you remarkable emotional resilience. Where others are tossed by every emotional wave, you remain grounded.',
          'Your inner world is sensory and present. You experience emotions through taste, touch, sound, and smell as much as through thought. A beautiful piece of music can move you to tears. The scent of your partner\'s skin can make you feel completely at home. You are emotionally embodied in a way that few other placements achieve.',
          'Security is the foundation of your emotional wellbeing. You need to know that the ground beneath your feet is solid before you can relax into vulnerability. Financial stability, a comfortable home, and reliable relationships are not luxuries for you — they are emotional necessities.',
        ],
      },
      {
        title: 'What You Need in Love',
        icon: '💕',
        paragraphs: [
          'Moon in Taurus needs a partner who is consistent, physically affectionate, and committed to building a beautiful life together. You are not interested in dramatic on-again-off-again dynamics. You want a love that deepens over time, like wine aging in oak.',
          'Touch is your primary emotional language. You need regular physical connection — holding hands, back rubs, cooking together, sleeping intertwined. A partner who is physically distant, no matter how verbally affectionate, will leave your emotional cup empty.',
          'You show love through creating comfort and abundance for your partner. Cooking their favorite meal, maintaining a beautiful home, providing financial security — these are your love letters. You need a partner who recognizes and values these tangible expressions of devotion.',
        ],
      },
      {
        title: 'Processing Feelings & Self-Care',
        icon: '🧘',
        paragraphs: [
          'You process feelings through sensory grounding. A warm bath, a gourmet meal, time in nature, or listening to music in a comfortable space — these are your emotional medicine. When stressed, your instinct is to retreat to your physical sanctuary and restore through pleasure.',
          'Your emotional self-care needs include stability, routine, and beauty. Disruption to your daily rhythms can be genuinely destabilizing. Building a life that consistently nourishes your senses is not indulgence — it is essential maintenance for your emotional health.',
        ],
      },
    ],
  },
  gemini: {
    headline: 'Moon in Gemini: The Restless Mind',
    intro: 'With your Moon in Gemini, your emotional world is a library — vast, interconnected, and constantly being reorganized. You process feelings through language, analysis, and conversation. Emotions that others experience as gut sensations or heart pangs, you experience as streams of thought that need to be articulated before they can be understood.',
    sections: [
      {
        title: 'Emotional Nature & Inner World',
        icon: '💨',
        paragraphs: [
          'Moon in Gemini processes emotions intellectually. When something moves you, your first impulse is to name it, analyze it, and talk about it. This can make you seem emotionally detached to more instinctive types, but in truth, you feel deeply — you simply process through your mind rather than your body.',
          'Your inner world is a constant dialogue. You may literally talk to yourself, journal extensively, or need to verbalize your feelings to someone else before you can understand them. Unspoken emotions build up like pressure for you — you need to express them through words to release them.',
          'Emotional variety is essential for your wellbeing. You become genuinely anxious when your emotional landscape feels monotonous. You need intellectual stimulation, new perspectives, and engaging conversations to feel emotionally alive.',
        ],
      },
      {
        title: 'What You Need in Love',
        icon: '💕',
        paragraphs: [
          'Moon in Gemini needs a partner who can engage your mind as deeply as your heart. Intellectual compatibility is not a bonus for you — it is the foundation. You need someone you can talk to endlessly, who introduces you to new ideas, and who treats conversations as a form of intimacy.',
          'You need emotional variety within your relationship. A partner who can surprise you, change plans spontaneously, and approach problems from unexpected angles keeps your emotional world feeling fresh and alive. Routine and predictability in love feel suffocating.',
          'Communication is your love language. You need a partner who texts back thoughtfully, engages in long late-night conversations, and values verbal expression of feelings. Emotional silence or the expectation that you should just know what they are feeling leaves you anxious.',
        ],
      },
      {
        title: 'Processing Feelings & Self-Care',
        icon: '🧘',
        paragraphs: [
          'You process feelings through talking, writing, and information gathering. Journaling, therapy, or simply venting to a trusted friend helps you make sense of your emotional world. Reading about other people\'s experiences with similar feelings can also be profoundly validating.',
          'Your emotional self-care needs include mental stimulation, social connection, and variety. When stressed, you benefit from changing your environment, learning something new, or engaging in light social interaction rather than isolating. Movement that engages the mind — like walking in a new neighborhood — is particularly healing.',
        ],
      },
    ],
  },
  cancer: {
    headline: 'Moon in Cancer: The Deep Well',
    intro: 'With your Moon in Cancer, your emotional world is an ocean — vast, tidal, and impossibly deep. The Moon rules Cancer, making this its most powerful and natural placement. Your emotional intuition is extraordinary, your capacity for nurturing is boundless, and your need for emotional security runs deeper than most people can fathom.',
    sections: [
      {
        title: 'Emotional Nature & Inner World',
        icon: '🌊',
        paragraphs: [
          'Moon in Cancer feels everything with extraordinary depth and sensitivity. You are an emotional sponge, absorbing the moods and feelings of everyone around you. This empathy is your greatest gift, but it can also be overwhelming when you cannot distinguish your feelings from the emotional residue you have absorbed from others.',
          'Your inner world is rich with memory, nostalgia, and emotional associations. A song, a scent, or a particular quality of light can transport you instantly to a moment from years ago, complete with all the feelings you experienced then. Your emotional memory is essentially photographic.',
          'Security and belonging are the pillars of your emotional wellbeing. You need to feel that you have a home — not just a physical space, but a network of people who love you unconditionally. Without this foundation, you feel adrift and anxious in ways that are difficult to articulate.',
        ],
      },
      {
        title: 'What You Need in Love',
        icon: '💕',
        paragraphs: [
          'Moon in Cancer needs a partner who provides unwavering emotional safety. You need to know that your vulnerability will never be used against you, that your moods will be met with patience, and that the bond between you is genuinely unbreakable. Trust is everything.',
          'You show love through nurturing — cooking, caring, creating emotional sanctuaries — and you need a partner who both accepts and reciprocates this care. A relationship where you are always the caretaker and never the one being cared for will eventually deplete you.',
          'Family and domestic life are central to your romantic vision. Whether or not you want children, you need a partner who values creating a home together. Shared domestic rituals — cooking Sunday dinner, tending the garden, curling up on the couch — are your love language.',
        ],
      },
      {
        title: 'Processing Feelings & Self-Care',
        icon: '🧘',
        paragraphs: [
          'You process feelings through nurturing activities and retreat. When overwhelmed, you need to withdraw to your shell — a safe, comfortable space where you can feel your feelings without judgment. Cooking, baths, and spending time near water are profoundly soothing for you.',
          'Your emotional self-care requires regular solitude to process and recharge. You also benefit from creative outlets that allow you to channel your vast emotional energy — cooking, gardening, art, writing, or any form of creation that transforms feeling into something tangible and beautiful.',
        ],
      },
    ],
  },
  leo: {
    headline: 'Moon in Leo: The Generous Heart',
    intro: 'With your Moon in Leo, your emotional world is a stage — bright, dramatic, and deeply invested in being witnessed. You feel with theatrical intensity and express with creative flair. Your emotional needs center on recognition, appreciation, and the freedom to express your authentic self without apology.',
    sections: [
      {
        title: 'Emotional Nature & Inner World',
        icon: '☀️',
        paragraphs: [
          'Moon in Leo experiences emotions in vivid, cinematic color. Your feelings are never tepid — your joy is radiant, your hurt is devastating, and your love is epic. You process emotions through expression, and you need an audience who appreciates the full spectrum of what you feel.',
          'Your inner world runs on validation and creative self-expression. You need to feel seen, admired, and valued for who you truly are — not for what you do or what you provide, but for the unique light you bring to the world. When this need is met, you are the most generous, warm-hearted person in any room.',
          'Pride is both your strength and vulnerability. You carry yourself with dignity and expect to be treated with respect. When humiliated or dismissed, the wound cuts deep because your sense of self is intimately connected to how others perceive you.',
        ],
      },
      {
        title: 'What You Need in Love',
        icon: '💕',
        paragraphs: [
          'Moon in Leo needs a partner who adores you — genuinely, vocally, and consistently. You thrive on compliments, romantic gestures, and a partner who makes you feel like the most special person in their world. This is not vanity — it is a legitimate emotional need for recognition.',
          'You bring enormous generosity and warmth to your relationships, and you need a partner who matches this energy. You pour your heart into making your loved ones feel celebrated, and a partner who takes this for granted will eventually dim your light.',
          'Creative partnership matters deeply. You need a lover who supports your self-expression, celebrates your wins, and creates space for your playful, dramatic side. A relationship that makes you feel small or ordinary is one you cannot sustain.',
        ],
      },
      {
        title: 'Processing Feelings & Self-Care',
        icon: '🧘',
        paragraphs: [
          'You process feelings through creative expression and performance. When emotions overwhelm you, channeling them into art, music, dance, or any form of creative output transforms raw feeling into something beautiful and meaningful.',
          'Your emotional self-care needs include recognition, play, and luxury. Treating yourself to something special — a beautiful outfit, a fancy dinner, a creative project — reminds you of your own worth. You also benefit from spending time with people who genuinely appreciate and celebrate you.',
        ],
      },
    ],
  },
  virgo: {
    headline: 'Moon in Virgo: The Devoted Healer',
    intro: 'With your Moon in Virgo, your emotional world is a carefully tended sanctuary — organized, purposeful, and devoted to improvement. Ruled by Vesta, your emotional nature carries a sacred quality of service and precision. You process feelings through analysis and channel your care into practical action.',
    sections: [
      {
        title: 'Emotional Nature & Inner World',
        icon: '🌾',
        paragraphs: [
          'Moon in Virgo processes emotions through careful analysis. When something moves you, your instinct is to understand why, to categorize the feeling, and to determine what useful action it points toward. This analytical approach to emotions is not cold — it is how you make sense of an inner world that feels more manageable when organized.',
          'Your inner world is a workshop of self-improvement. You are constantly refining your habits, your health, your routines, and your relationships. Ruled by Vesta, your emotional life has a devotional quality — you approach your commitments with the focused intensity of someone tending a sacred flame.',
          'Anxiety is the shadow companion of your meticulous nature. Your awareness of imperfection can tip into worry when you feel unable to fix what troubles you. Learning to accept that some things are beyond your control is an ongoing emotional practice.',
        ],
      },
      {
        title: 'What You Need in Love',
        icon: '💕',
        paragraphs: [
          'Moon in Virgo needs a partner who notices and appreciates the small things you do. You show love through acts of service — remembering their coffee order, organizing their schedule, noticing when they need a break before they do. A partner who overlooks these gestures feels devastatingly ungrateful.',
          'You need order, reliability, and health-consciousness in your emotional partnerships. Chaos and instability are genuinely distressing to you. A partner who maintains their own wellbeing and contributes to a well-organized shared life earns your deepest respect.',
          'Patience with your analytical nature is essential. You may need to process feelings verbally, examining them from every angle before arriving at a conclusion. A partner who can hold space for this process without rushing you or dismissing it is invaluable.',
        ],
      },
      {
        title: 'Processing Feelings & Self-Care',
        icon: '🧘',
        paragraphs: [
          'You process feelings through routine, organization, and useful activity. When emotionally overwhelmed, cleaning, meal-prepping, list-making, or working on a productive project grounds you. The act of creating order in your external world soothes the disorder in your internal one.',
          'Your emotional self-care requires healthy routines, clean eating, and mindful practices. You are deeply sensitive to your physical environment and your body, so maintaining health and order is not optional — it is the foundation of your emotional stability.',
        ],
      },
    ],
  },
  libra: {
    headline: 'Moon in Libra: The Harmony Seeker',
    intro: 'With your Moon in Libra, your emotional world is an art gallery — curated for beauty, balance, and elegant harmony. Ruled by Juno, your emotional nature is fundamentally relational. You understand yourself most clearly through your connections with others, and you crave partnerships that are equal, beautiful, and just.',
    sections: [
      {
        title: 'Emotional Nature & Inner World',
        icon: '⚖️',
        paragraphs: [
          'Moon in Libra processes emotions through the lens of relationship and fairness. When something disturbs your equilibrium, your instinct is to restore balance — through conversation, compromise, or creating beauty in your environment. You are emotionally allergic to conflict and will go to considerable lengths to maintain harmony.',
          'Your inner world craves aesthetic order. Ugly environments, harsh words, and social discord genuinely affect your emotional state. Ruled by Juno, your emotional wellbeing is deeply tied to the health of your committed relationships — when your partnerships are thriving, you thrive.',
          'The shadow of Moon in Libra is emotional inauthenticity. Your desire to please and maintain harmony can lead you to suppress your true feelings, agree when you disagree, and accommodate when you should assert. Learning to honor your own emotional truth is essential.',
        ],
      },
      {
        title: 'What You Need in Love',
        icon: '💕',
        paragraphs: [
          'Moon in Libra needs a partner who is genuinely committed to equality and mutual respect. You cannot function in relationships where there is a clear power imbalance. You need to feel that your opinions, needs, and contributions are valued as much as your partner\'s.',
          'Romance and beauty are emotional necessities, not luxuries. You need a partner who maintains the aesthetics of the relationship — who plans dates, keeps the house beautiful, and treats the partnership as something worth investing in artistically and emotionally.',
          'Intellectual and social compatibility are crucial. You need a partner you can proudly introduce to your friends, who engages in stimulating conversation, and who shares your appreciation for culture, beauty, and social grace.',
        ],
      },
      {
        title: 'Processing Feelings & Self-Care',
        icon: '🧘',
        paragraphs: [
          'You process feelings through conversation, aesthetic creation, and social interaction. Talking things through with a trusted confidante helps you find emotional clarity. Creating beauty — rearranging your space, curating an outfit, making art — restores your inner balance.',
          'Your emotional self-care needs include beauty, partnership, and social harmony. When stressed, you benefit from visiting a gallery, listening to beautiful music, or spending time with people who are emotionally balanced and socially graceful. Isolation and conflict are particularly draining for you.',
        ],
      },
    ],
  },
  scorpio: {
    headline: 'Moon in Scorpio: The Emotional Alchemist',
    intro: 'With your Moon in Scorpio, your emotional world is a volcano — immensely powerful, partially hidden, and capable of total transformation. This is one of the most intense Moon placements in astrology. You feel with soul-shaking depth, and your emotional experiences fundamentally change you every time.',
    sections: [
      {
        title: 'Emotional Nature & Inner World',
        icon: '🦅',
        paragraphs: [
          'Moon in Scorpio experiences emotions with a depth and intensity that most people cannot fathom. Where others feel ripples, you feel tidal waves. Your emotional processing is total — when you go through something, you go all the way through it, emerging transformed on the other side.',
          'Your inner world is a labyrinth of hidden feelings, psychological insight, and powerful intuition. You see beneath the surface of every interaction, detecting motives and dynamics that others miss entirely. This gives you extraordinary emotional intelligence, but it also means you can never fully relax — you are always processing.',
          'Trust is the central theme of your emotional life. You have been hurt deeply enough to build formidable emotional walls, and anyone who wants to reach your core must prove their loyalty repeatedly. But when you do trust, your devotion is absolute and your emotional bonds are unbreakable.',
        ],
      },
      {
        title: 'What You Need in Love',
        icon: '💕',
        paragraphs: [
          'Moon in Scorpio needs a partner who can handle emotional intensity without retreating. You need total honesty, unwavering loyalty, and a willingness to go deep — emotionally, psychologically, and physically. Surface-level relationships feel pointless to you.',
          'You need a partner who is not afraid of your darkness. You carry shadows, and you need someone who can hold space for the full spectrum of your emotional experience without trying to fix you or lighten the mood. Emotional depth is your love language.',
          'Privacy and exclusivity are essential. You need to feel that your emotional bond is sacred and protected. A partner who shares intimate details with others, maintains ambiguous boundaries, or keeps you guessing about their commitment triggers your deepest insecurities.',
        ],
      },
      {
        title: 'Processing Feelings & Self-Care',
        icon: '🧘',
        paragraphs: [
          'You process feelings through depth, solitude, and transformation. When emotionally activated, you need time alone to descend into your feelings, sit with them, and emerge on the other side. Journaling, therapy, and emotional purging practices are invaluable tools for you.',
          'Your emotional self-care requires privacy, intensity, and outlets for transformation. Activities like deep meditation, power-based exercise, psychological study, or creative works that channel dark emotions into art help you metabolize your immense emotional energy.',
        ],
      },
    ],
  },
  sagittarius: {
    headline: 'Moon in Sagittarius: The Eternal Optimist',
    intro: 'With your Moon in Sagittarius, your emotional world is an open road stretching toward the horizon. You process feelings through philosophy, adventure, and an unshakeable faith that everything happens for a reason. Your emotional resilience comes from your ability to find meaning in every experience.',
    sections: [
      {
        title: 'Emotional Nature & Inner World',
        icon: '🏹',
        paragraphs: [
          'Moon in Sagittarius processes emotions through meaning-making. When something painful happens, your instinct is to zoom out, find the lesson, and reframe the experience as part of a larger journey. This philosophical approach gives you remarkable emotional resilience, though it can sometimes prevent you from fully sitting with difficult feelings.',
          'Your inner world is expansive and optimistic. You genuinely believe that life is fundamentally good and that every setback is setting you up for something better. This is not naivete — it is a deep emotional philosophy that sustains you through genuine hardship.',
          'Freedom is your core emotional need. You become emotionally claustrophobic when you feel trapped — by circumstances, by relationships, or by your own negative thoughts. You need room to roam, both physically and mentally, to maintain your emotional equilibrium.',
        ],
      },
      {
        title: 'What You Need in Love',
        icon: '💕',
        paragraphs: [
          'Moon in Sagittarius needs a partner who shares your love of adventure and growth. You need someone who is excited about the future, open to new experiences, and willing to explore life alongside you. A partner who clings to routine and resists change will suffocate you.',
          'Honesty is paramount. You would rather hear a painful truth than a comfortable lie, and you expect the same radical honesty from your partner. You can forgive almost anything except dishonesty — deception feels like a fundamental betrayal of your trust.',
          'You need a partner who respects your independence without taking it personally. Your need for space is not a reflection of your feelings for them — it is a non-negotiable emotional requirement. A partner who is secure enough to give you freedom earns your devoted return.',
        ],
      },
      {
        title: 'Processing Feelings & Self-Care',
        icon: '🧘',
        paragraphs: [
          'You process feelings through movement, travel, and philosophical exploration. When emotionally overwhelmed, getting out of your usual environment — even a long drive or a hike in nature — helps you reset. Reading philosophy, attending lectures, or discussing big ideas with friends also provides emotional relief.',
          'Your emotional self-care needs include freedom, adventure, and laughter. You recover fastest when you are laughing, learning, or exploring. Avoid isolating yourself when down — your optimism is social fuel, and you recharge through positive, expansive interactions.',
        ],
      },
    ],
  },
  capricorn: {
    headline: 'Moon in Capricorn: The Quiet Fortress',
    intro: 'With your Moon in Capricorn, your emotional world is a mountain — solid, enduring, and reaching toward something greater. Ruled by Saturn, your emotional nature is disciplined, private, and deeply invested in building a life that stands the test of time. You feel deeply but express sparingly.',
    sections: [
      {
        title: 'Emotional Nature & Inner World',
        icon: '🏔',
        paragraphs: [
          'Moon in Capricorn processes emotions through the filter of practicality and responsibility. When something moves you, your instinct is to assess what can be done about it rather than simply dwelling in the feeling. You show love through action and achievement rather than emotional display.',
          'Your inner world is more sensitive than anyone suspects. Behind your composed exterior, you carry a deep well of feeling that you share only with those who have earned your absolute trust. The Capricorn Moon learns early that vulnerability can be exploited, and you protect yourself accordingly.',
          'Achievement and emotional security are deeply intertwined for you. You feel emotionally stable when your career is progressing, your finances are solid, and you are meeting your responsibilities. External success is not superficial for you — it genuinely supports your emotional wellbeing.',
        ],
      },
      {
        title: 'What You Need in Love',
        icon: '💕',
        paragraphs: [
          'Moon in Capricorn needs a partner who is emotionally mature, reliable, and committed to building a lasting partnership. You are not interested in casual flings or dramatic entanglements. You want a love that is practical, enduring, and built on mutual respect.',
          'You need a partner who respects your boundaries and does not push you to be more emotionally expressive than you are comfortable being. You reveal yourself slowly, and a partner who has the patience to wait for the walls to come down will discover an extraordinarily loyal and devoted person.',
          'Shared goals and ambitions are important. You need a partner who is equally driven and responsible, someone who contributes equally to building a secure life together. You deeply respect competence and self-discipline in a partner.',
        ],
      },
      {
        title: 'Processing Feelings & Self-Care',
        icon: '🧘',
        paragraphs: [
          'You process feelings through work, structure, and solitary reflection. When emotionally overwhelmed, throwing yourself into productive activity helps you regain a sense of control. Planning, organizing, and tackling tangible problems grounds you when emotions feel unmanageable.',
          'Your emotional self-care needs include solitude, accomplishment, and quiet quality time with trusted people. You recharge through meaningful work and find comfort in tradition, ritual, and the predictable rhythms of a well-ordered life.',
        ],
      },
    ],
  },
  aquarius: {
    headline: 'Moon in Aquarius: The Compassionate Rebel',
    intro: 'With your Moon in Aquarius, your emotional world operates on a different frequency than most. Ruled by Uranus, your emotional nature is unconventional, intellectually oriented, and deeply humanitarian. You care about humanity intensely while sometimes struggling with the intimacy of one-on-one emotional bonds.',
    sections: [
      {
        title: 'Emotional Nature & Inner World',
        icon: '⚡',
        paragraphs: [
          'Moon in Aquarius processes emotions through intellectual understanding and detachment. When something moves you, your first step is to analyze why, to understand the pattern, and to contextualize it within a broader framework. This gives you remarkable emotional clarity but can frustrate partners who want a purely emotional response.',
          'Your inner world is a visionary landscape of ideas, ideals, and humanitarian concern. You feel most emotionally connected when you are working toward social change, engaging with your community, or exploring unconventional ways of living. Your emotions are fundamentally linked to your sense of purpose.',
          'Independence is not just a preference — it is an emotional survival mechanism. You need significant space within relationships to maintain your sense of self. Emotional demands that feel controlling or possessive trigger your flight instinct more than almost anything else.',
        ],
      },
      {
        title: 'What You Need in Love',
        icon: '💕',
        paragraphs: [
          'Moon in Aquarius needs a partner who is intellectually stimulating, emotionally self-sufficient, and open to unconventional relationship structures. You do not conform to traditional romantic scripts, and you need a partner who values authenticity over convention.',
          'Friendship is the foundation of your romantic bonds. You need to genuinely like and respect your partner as a person, independent of romantic chemistry. The strongest Aquarius Moon relationships are those built on shared intellectual interests, mutual respect, and genuine friendship.',
          'You need a partner who does not interpret your need for space as rejection. Your emotional rhythm includes periods of closeness and periods of retreat, and a partner who can ride these waves without anxiety earns your lasting devotion.',
        ],
      },
      {
        title: 'Processing Feelings & Self-Care',
        icon: '🧘',
        paragraphs: [
          'You process feelings through intellectual analysis, social engagement, and humanitarian action. When emotionally overwhelmed, engaging with a cause you care about, having a philosophical conversation, or working on a creative project helps you regain equilibrium.',
          'Your emotional self-care needs include intellectual stimulation, community connection, and freedom. You recover fastest when you feel that your life has purpose and that your uniqueness is valued rather than questioned. Avoid partners and environments that try to make you normal.',
        ],
      },
    ],
  },
  pisces: {
    headline: 'Moon in Pisces: The Boundless Empath',
    intro: 'With your Moon in Pisces, your emotional world has no boundaries — it flows outward, absorbing the feelings of everyone around you, merging with the collective unconscious, and experiencing the full spectrum of human emotion as though it were your own. This is one of the most emotionally sensitive placements in astrology.',
    sections: [
      {
        title: 'Emotional Nature & Inner World',
        icon: '🌊',
        paragraphs: [
          'Moon in Pisces feels everything — not just your own emotions, but the emotions of everyone in the room, the sadness in a news story, the longing in a piece of music. Your empathic sensitivity is extraordinary, making you an emotional channel for energies that others cannot even perceive.',
          'Your inner world is a vast ocean of imagination, spiritual sensitivity, and creative potential. You dream vividly, intuit deeply, and experience reality as more fluid and interconnected than most people can conceive. The boundary between your feelings and the feelings of others is genuinely porous.',
          'The challenge of Moon in Pisces is emotional overwhelm. Without strong boundaries, you can become flooded by the pain of the world, leading to escapist tendencies — retreating into fantasy, sleep, or substances to numb the intensity of what you feel.',
        ],
      },
      {
        title: 'What You Need in Love',
        icon: '💕',
        paragraphs: [
          'Moon in Pisces needs a partner who is emotionally gentle, spiritually aware, and willing to meet you in the depths. You need a love that feels transcendent — a soul connection that goes beyond the physical and intellectual into something sacred.',
          'You need a partner who protects your sensitivity without exploiting it. Your empathy makes you vulnerable to emotional manipulation, and you need someone whose intentions are as pure as your own. A partner who grounds you without dismissing your emotional depth is ideal.',
          'Creative and spiritual connection matters deeply. You need a partner who appreciates art, music, nature, and the mystical dimensions of life. A relationship that is purely practical, without poetry or magic, cannot sustain your spirit.',
        ],
      },
      {
        title: 'Processing Feelings & Self-Care',
        icon: '🧘',
        paragraphs: [
          'You process feelings through creative expression, spiritual practice, and solitary retreat. When emotionally overwhelmed, creating art, listening to music, meditating, or spending time near water helps you release the emotional energy you have absorbed from others.',
          'Your emotional self-care requires strong boundaries, regular solitude, and creative outlets. You must learn to distinguish your feelings from those you have absorbed, and to protect your energy in environments that are emotionally intense. Sleep and dreamtime are essential for your emotional processing.',
        ],
      },
    ],
  },
};

/* ── Lookup function ──────────────────────────────────────────── */

export function getMoonSignContent(sign: ZodiacSign): MoonSignContent {
  const data = MOON_CONTENT[sign];
  return { sign, ...data };
}
