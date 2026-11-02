/* ──────────────────────────────────────────────────────────────
   Mercury Sign Content
   SEO-rich astrological content for all 12 Mercury sign pages.
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

export interface MercurySignContent {
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

export const MERCURY_SYMBOL = '☿';

/* ── Content for each Mercury sign ────────────────────────────── */

const MERCURY_CONTENT: Record<ZodiacSign, Omit<MercurySignContent, 'sign'>> = {
  aries: {
    headline: 'Mercury in Aries: The Direct Thinker',
    intro: 'You answer before the question is finished. You think in real time, speak before filtering, and reach conclusions while others are still formulating the question. People get a bold, decisive and honest version of you, with no rehearsal.',
    sections: [
      {
        title: 'Communication Style',
        icon: '🗣',
        paragraphs: [
          'You communicate with a speed and directness that can be either exhilarating or overwhelming. You get to the point immediately, often interrupting or finishing other people\'s sentences because your mind has already leapt ahead. Diplomacy takes conscious effort for you — your default is raw, unfiltered truth.',
          'You are a compelling speaker who energizes audiences with your enthusiasm and conviction. Your words carry the weight of action — when you say something, people know you mean it and that you are prepared to back it up. Wishy-washy language genuinely irritates you.',
          'Your written messages are short and direct. You prefer bullet points to paragraphs, action items to abstract discussions, and brevity to elaboration.',
        ],
      },
      {
        title: 'Thinking Patterns & Learning Style',
        icon: '🧠',
        paragraphs: [
          'Your mind works in rapid bursts of insight. You are an intuitive rather than analytical thinker, arriving at conclusions through instinct rather than methodical analysis. This makes you an excellent starter of ideas but sometimes a poor finisher — your attention moves on before the details are worked out.',
          'You learn best through active engagement. Reading a textbook puts you to sleep, but participating in a debate, solving a hands-on problem, or competing in an academic context lights you up. Your mind needs the stimulation of challenge and competition to function at its best.',
        ],
      },
      {
        title: 'How You Argue',
        icon: '⚔️',
        paragraphs: [
          'You argue with passionate directness. You charge into debates headfirst, making your position known immediately and defending it with fierce conviction. You are a formidable opponent because you think on your feet, respond instantly, and never back down out of politeness.',
          'Impatience is what loses you the point. You wave away a nuanced counterargument because it takes too long to say, and you steamroll quieter voices on the way to your own. If you listened as hard as you talk, you would be nearly unbeatable.',
        ],
      },
    ],
  },
  taurus: {
    headline: 'Mercury in Taurus: The Deliberate Communicator',
    intro: 'You go quiet in the meeting, say one sentence at the end, and it settles the matter. You think before you speak, weigh your words, and talk with a grounded authority that makes everything you say sound like established fact.',
    sections: [
      {
        title: 'Communication Style',
        icon: '🗣',
        paragraphs: [
          'You communicate with measured deliberation. You choose your words carefully, speak at a comfortable pace, and refuse to be rushed into hasty statements. Your voice tends to be pleasant and soothing, and people find your unhurried communication style reassuring.',
          'You prefer concrete, practical language over abstract theories. You communicate best when you can use examples, analogies rooted in physical experience, and plain language that everyone can understand. Academic jargon and unnecessary complexity irritate you.',
          'Once you have formed an opinion, you express it with quiet, immovable conviction. Changing your mind is a slow process that requires compelling, tangible evidence. This gives your positions enormous weight — people know that your conclusions are thoroughly considered.',
        ],
      },
      {
        title: 'Thinking Patterns & Learning Style',
        icon: '🧠',
        paragraphs: [
          'Your mind works methodically, building understanding layer by layer. You process information slowly but retain it permanently. While faster thinkers may grasp concepts quickly and forget them just as fast, you absorb knowledge into your bones.',
          'You learn best through hands-on experience and sensory engagement. Touching materials, walking through a space, or physically practicing a skill embeds knowledge far more effectively for you than reading about it. Your mind is grounded in the body.',
        ],
      },
      {
        title: 'How You Argue',
        icon: '⚔️',
        paragraphs: [
          'You argue with stubborn persistence and practical common sense. You do not get swept up in emotional arguments or theoretical abstractions. You stick to facts, repeat your position with unwavering calm, and wear down opponents through sheer determination.',
          'You never lose your cool in an argument, and your steady, practical stance is hard to beat with emotional appeals. The price is inflexibility: you can be so committed to your position that you miss a valid alternative.',
        ],
      },
    ],
  },
  gemini: {
    headline: 'Mercury in Gemini: The Brilliant Connector',
    intro: 'You have a podcast on, a text open, a half-read article and a new idea about all three. Your mind runs several streams of information at once, makes unexpected connections, and you talk with a speed and versatility that few people can match.',
    sections: [
      {
        title: 'Communication Style',
        icon: '🗣',
        paragraphs: [
          'You communicate with extraordinary versatility and speed. You can adjust your communication style to match any audience, switching between formal and casual, technical and accessible, serious and humorous with ease. You can talk to anyone.',
          'Your verbal agility makes you a natural storyteller, teacher, and entertainer. You can explain complex concepts in simple terms, weave engaging narratives from ordinary events, and keep any conversation lively with your quick wit and broad knowledge.',
          'You communicate across multiple channels simultaneously — texting while talking, reading while listening, processing multiple conversations in parallel. Others may see this as distraction, but for you it is simply how your mind operates at its natural speed.',
        ],
      },
      {
        title: 'Thinking Patterns & Learning Style',
        icon: '🧠',
        paragraphs: [
          'Your mind is an information processing machine. You absorb data voraciously, make rapid connections between disparate ideas, and synthesize information from multiple sources faster than most people. Your intelligence is lateral rather than linear — you see connections that others miss.',
          'You learn through exploration and variety. Studying one subject exclusively bores you — you need to jump between topics, follow tangential threads, and approach knowledge as a web rather than a ladder. Cross-disciplinary thinking is your superpower.',
        ],
      },
      {
        title: 'How You Argue',
        icon: '⚔️',
        paragraphs: [
          'You argue with dazzling rhetorical skill. You can argue any side of any debate with equal conviction, shifting positions with a speed that can be disorienting for opponents. You genuinely enjoy the intellectual exercise of debate, sometimes caring more about the quality of the argument than the truth of the conclusion.',
          'You can counter any argument on the spot, find the flaw in any position and steer the conversation away when the ground turns bad. The cost is credibility: people start to suspect you do not truly believe anything.',
        ],
      },
    ],
  },
  cancer: {
    headline: 'Mercury in Cancer: The Intuitive Listener',
    intro: 'You remember the song that was playing in the car the night something was said. Your mind runs on feeling, in images, memories and emotional associations rather than logical sequences, and people feel heard by you in a way that goes beyond the words.',
    sections: [
      {
        title: 'Communication Style',
        icon: '🗣',
        paragraphs: [
          'You communicate with emotional depth and intuitive accuracy. You read between the lines effortlessly, hearing not just what someone says but what they feel. Your responses are attuned to emotional nuance in a way that makes people feel deeply understood.',
          'You prefer intimate, one-on-one conversations to group debates or public speaking. Your communication is most powerful in private settings where trust has been established. In these contexts, your ability to express emotional truths is unmatched.',
          'Your words carry emotional weight. When you express your feelings, there is a vulnerability and sincerity that moves people profoundly. You may struggle to articulate your thoughts in formal or impersonal contexts, but in matters of the heart, your expression is eloquent.',
        ],
      },
      {
        title: 'Thinking Patterns & Learning Style',
        icon: '🧠',
        paragraphs: [
          'Your mind is associative and memory-rich. You learn by connecting new information to personal experience and emotional context. A history lesson comes alive when you can feel what the people involved must have experienced. Abstract concepts need emotional grounding to make sense to you.',
          'You have an exceptional memory, particularly for emotional events and interpersonal dynamics. You remember how things made you feel with photographic clarity, even decades later. This emotional memory informs your thinking and decision-making in ways that are sometimes invisible to more rational types.',
        ],
      },
      {
        title: 'How You Argue',
        icon: '⚔️',
        paragraphs: [
          'You argue with emotional appeal and personal testimony. You are less interested in winning on logical points than in making your opponent feel what you feel. You share personal stories, appeal to empathy, and frame arguments in terms of their emotional impact.',
          'When you speak from the heart, your sincerity is hard to counter with cold logic. But a harsh word or a dismissive reply can shut you down completely, and then you lose the argument you were winning.',
        ],
      },
    ],
  },
  leo: {
    headline: 'Mercury in Leo: The Commanding Voice',
    intro: 'You tell a story at dinner and the table goes quiet. You think with creative flair, speak with natural authority, and you are entertaining and persuasive at once. When you talk, people listen, and not because you demand it.',
    sections: [
      {
        title: 'Communication Style',
        icon: '🗣',
        paragraphs: [
          'You communicate with dramatic flair and natural charisma. Your speech has a performative quality — you are a natural storyteller who turns ordinary anecdotes into compelling narratives. You have a gift for making people feel like they are part of something important and exciting.',
          'You speak with conviction and warmth that makes your ideas feel not just interesting but vital. Your communication style is generous — you encourage others, celebrate their ideas, and create an atmosphere of enthusiasm that makes collaboration genuinely enjoyable.',
          'You prefer to be the main speaker in any exchange. Not because you do not value others\' input, but because your mind is most active when you are expressing, and you genuinely believe your perspective adds value. You need an audience, even if that audience is one person.',
        ],
      },
      {
        title: 'Thinking Patterns & Learning Style',
        icon: '🧠',
        paragraphs: [
          'Your mind thinks in big pictures and grand narratives. You are drawn to ideas that are bold, visionary, and personally meaningful. Details bore you unless they serve a larger creative or strategic purpose. You think best when you are inspired.',
          'You learn through creative engagement and performance. Teaching others what you have learned, presenting ideas dramatically, or creating projects that showcase your understanding embeds knowledge more effectively than passive study. You need to own your learning in a personal way.',
        ],
      },
      {
        title: 'How You Argue',
        icon: '⚔️',
        paragraphs: [
          'You argue with authority and a theatrical delivery. You present your position as established truth, backing it up with confident assertions and compelling narratives. Your arguments are designed to inspire agreement rather than merely prove a point.',
          'You dominate a conversation through presence alone, and your confidence persuades. What trips you is hearing a challenge to your idea as a personal insult, which keeps you from taking in criticism that is valid.',
        ],
      },
    ],
  },
  virgo: {
    headline: 'Mercury in Virgo: The Analytical Mind',
    intro: 'You spot the wrong figure in the spreadsheet from across the room. Nothing escapes your attention, no detail is too small, and every piece of information is filed, categorized and ready when you need it.',
    sections: [
      {
        title: 'Communication Style',
        icon: '🗣',
        paragraphs: [
          'You communicate with precision and clarity and a dedication to accuracy. You choose your words with the care of a surgeon selecting instruments — every word serves a purpose, and unnecessary embellishment is stripped away in favor of clean, effective expression.',
          'You are an excellent editor, proofreader, and technical communicator. You notice grammatical errors, logical inconsistencies, and factual inaccuracies that others miss entirely. Your written communication is typically polished, organized, and impeccably structured.',
          'You treat getting it right as a duty. Saying something incorrect or misleading feels wrong to you, and you will check three sources before you send the email.',
        ],
      },
      {
        title: 'Thinking Patterns & Learning Style',
        icon: '🧠',
        paragraphs: [
          'Your mind works with systematic, step-by-step logic. You break complex problems into component parts, analyze each element carefully, and rebuild your understanding from the ground up. This methodical approach means you truly understand the subjects you study rather than merely memorizing them.',
          'You learn through analysis, note-taking, and systematic review. Creating outlines, categorizing information, and testing your understanding through practical application are your most effective study methods. You retain information best when it is organized and contextualized.',
        ],
      },
      {
        title: 'How You Argue',
        icon: '⚔️',
        paragraphs: [
          'You argue with meticulous precision and a devastating eye for detail. You win debates by identifying the specific logical flaw in your opponent\'s argument, the factual error in their claim, or the inconsistency between their stated position and their actions.',
          'Your arguments are researched and logically sound, and hand-waving does not get past you. The risk is that you sound critical or pedantic, and sometimes the forest matters more than the trees.',
        ],
      },
    ],
  },
  libra: {
    headline: 'Mercury in Libra: The Fair-Minded Diplomat',
    intro: 'Someone describes a conflict and you instinctively ask what the other person would say. You look for balance and the fair middle between opposing views, and you are good at negotiation and finding common ground. You think in terms of relationship and give-and-take.',
    sections: [
      {
        title: 'Communication Style',
        icon: '🗣',
        paragraphs: [
          'You communicate with grace and diplomacy and a feel for social harmony. You have a gift for saying difficult things in ways that are easy to hear, and for framing criticism as constructive feedback. Your words are chosen as much for their aesthetic quality as their informational content.',
          'You are a natural mediator, able to present both sides of any argument with equal fairness and find compromise solutions that satisfy everyone. You speak to connect, not to dominate.',
          'Indecisiveness is your communication challenge. You can see validity in every perspective, which makes choosing a definitive position genuinely difficult. You may equivocate, hedge, or defer to others\' opinions rather than commit to your own.',
        ],
      },
      {
        title: 'Thinking Patterns & Learning Style',
        icon: '🧠',
        paragraphs: [
          'Your mind thinks comparatively, constantly weighing options, perspectives, and possibilities against each other. You understand concepts best when you can see them from multiple angles, and you are naturally drawn to subjects that involve ethics, aesthetics, and interpersonal dynamics.',
          'You learn best through dialogue and collaboration. Studying alone is less effective for you than discussing ideas with others. Hearing different perspectives helps you refine your own thinking, and the give-and-take of intellectual exchange is where your mind does its best work.',
        ],
      },
      {
        title: 'How You Argue',
        icon: '⚔️',
        paragraphs: [
          'You argue with fairness, charm and persuasive logic. You present both sides of an issue before making your case, which gives your eventual position enormous credibility. You often win an argument by being so reasonable that opposing it feels unreasonable.',
          'You disarm opponents with fairness and win allies with graciousness. Where it backfires is when a moment calls for a hard position and your wish to be fair keeps you from taking one.',
        ],
      },
    ],
  },
  scorpio: {
    headline: 'Mercury in Scorpio: The Penetrating Investigator',
    intro: 'You know someone is lying before they finish the sentence. You probe, you suspect, and you will not stop until you reach the truth under the surface. You think in psychological depths, speak with strategic precision, and see through evasions and social masks.',
    sections: [
      {
        title: 'Communication Style',
        icon: '🗣',
        paragraphs: [
          'You communicate with intensity and strategic intention. You say exactly what you mean to say — no more, no less. Your words are carefully measured, and you reveal information only when it serves your purpose. This gives your communication a powerful, almost hypnotic quality.',
          'You are an exceptional listener who processes not just words but subtext, body language, and emotional undercurrents. People often feel exposed around you, sensing that you can see through their social masks. This perceptiveness makes you an extraordinary psychologist, investigator, or counselor.',
          'You prefer depth to breadth in communication. Small talk bores you, and you quickly steer conversations toward subjects of genuine psychological or emotional significance. You want to know what people really think and feel, not what they think they should say.',
        ],
      },
      {
        title: 'Thinking Patterns & Learning Style',
        icon: '🧠',
        paragraphs: [
          'Your mind works by penetrating beneath surface appearances to find hidden patterns, motivations, and truths. You are a natural researcher who will pursue a line of investigation until every mystery is solved and every question answered. Your intellectual tenacity is formidable.',
          'You learn through deep immersion rather than broad survey. You would rather know one subject with total mastery than have superficial knowledge of many. Your learning style involves research, investigation, and the unraveling of complexity.',
        ],
      },
      {
        title: 'How You Argue',
        icon: '⚔️',
        paragraphs: [
          'You argue with psychological insight and strategic precision. You identify your opponent\'s emotional vulnerabilities, unspoken assumptions, and logical blind spots with unsettling accuracy. Your arguments often target the person as much as the position.',
          'You can dismantle an argument by exposing the motive underneath it. The dark side is manipulation: you can use what you see in people to win through intimidation instead of persuasion.',
        ],
      },
    ],
  },
  sagittarius: {
    headline: 'Mercury in Sagittarius: The Big-Picture Philosopher',
    intro: 'You start with a question about dinner and end up on the meaning of life. You think in grand concepts, talk with enthusiasm that catches, and keep searching for the one idea that connects all the dots. Your mind is broad and optimistic, always reaching for the horizon.',
    sections: [
      {
        title: 'Communication Style',
        icon: '🗣',
        paragraphs: [
          'You communicate with big enthusiasm and philosophical depth. You are the person who turns a simple question into an hour-long discussion about the meaning of life. Your speech is peppered with references to diverse cultures, philosophical traditions, and personal adventures.',
          'You are brutally honest in your communication — sometimes more honest than the situation requires. You say what you think, even when diplomacy would be wiser, because you believe truth is always better than comfortable lies. This bluntness is refreshing to some and devastating to others.',
          'Humor is central to your communication style. You have a gift for finding the absurd in any situation and expressing it in a way that makes people think while they laugh. Your wit is philosophical rather than sarcastic — you illuminate rather than wound.',
        ],
      },
      {
        title: 'Thinking Patterns & Learning Style',
        icon: '🧠',
        paragraphs: [
          'Your mind thinks in patterns, paradigms, and big pictures. You are less interested in individual facts than in the theories that organize them. You see the forest rather than the trees, and you are drawn to subjects that offer sweeping, unifying explanations of how the world works.',
          'You learn through exploration, cross-cultural exposure, and philosophical inquiry. Travel, reading widely, and engaging with perspectives radically different from your own are your primary learning tools. Formal education can feel constraining unless it allows intellectual freedom.',
        ],
      },
      {
        title: 'How You Argue',
        icon: '⚔️',
        paragraphs: [
          'You argue with moral conviction and philosophical breadth. You frame debates in terms of principles, values, and universal truths. Your arguments appeal to the big picture, and you can be genuinely inspiring when defending a cause you believe in.',
          'You lift a discussion out of petty details and into what actually matters, and your optimism converts skeptics. You also skip the inconvenient details and assume that what is true for you is true for everyone.',
        ],
      },
    ],
  },
  capricorn: {
    headline: 'Mercury in Capricorn: The Strategic Architect',
    intro: 'You walk into the meeting with the numbers, the contingency plan and the answer to the question nobody has asked yet. You think in systems, plan in decades, and speak with an authority that comes from preparation and real expertise.',
    sections: [
      {
        title: 'Communication Style',
        icon: '🗣',
        paragraphs: [
          'You communicate with authority and economy. You do not speak unless you have something worth saying, and when you do speak, your words carry the weight of careful consideration. You are not interested in idle chatter — every communication serves a strategic purpose.',
          'You excel at formal, professional communication. Reports, presentations, and structured arguments are your natural format. Your written work is thorough, well-organized, and free of unnecessary embellishment. You respect your audience enough to be clear and direct.',
          'Your dry, understated humor is a secret weapon. People who mistake your seriousness for humorlessness are surprised by the wit that emerges when you are comfortable. Your humor is observational and perfectly timed.',
        ],
      },
      {
        title: 'Thinking Patterns & Learning Style',
        icon: '🧠',
        paragraphs: [
          'Your mind thinks hierarchically and structurally. You naturally organize information into systems, categories, and chains of command. You understand complex organizations, power structures, and long-term strategic planning intuitively.',
          'You learn through structured study, mentorship, and practical application. You respect tradition and expertise, preferring to learn from established authorities rather than reinventing the wheel. Your learning is cumulative — you build knowledge systematically, with each new piece adding to a solid foundation.',
        ],
      },
      {
        title: 'How You Argue',
        icon: '⚔️',
        paragraphs: [
          'You argue with measured authority and practical evidence. You present well-structured cases backed by real-world examples and established precedent. Your arguments are designed to withstand scrutiny, and you prepare for counterarguments in advance.',
          'You have done your homework, you know your subject, and your quiet confidence reads as competence that is hard to challenge. Where you go wrong is rigidity, and you can dismiss an unconventional idea just because it does not fit the frameworks you know.',
        ],
      },
    ],
  },
  aquarius: {
    headline: 'Mercury in Aquarius: The Visionary Iconoclast',
    intro: 'You said it two years ago and everyone thought you were odd, and now it is in the news. You think in patterns, systems and future possibilities that sit well ahead of conventional wisdom, and you are stubbornly independent of popular opinion.',
    sections: [
      {
        title: 'Communication Style',
        icon: '🗣',
        paragraphs: [
          'You communicate with intellectual independence and clarity. You say what you think regardless of social pressure, and your ideas are often too progressive or unconventional for mainstream audiences. You would rather be accurate than popular.',
          'You are drawn to communication technologies, social media, and any medium that allows ideas to reach wide audiences quickly. Your communication style is more comfortable with groups and networks than with intimate one-on-one exchanges.',
          'Your language tends toward the conceptual and systemic. You speak in terms of trends, patterns, and collective dynamics rather than personal anecdotes or emotional appeals. This can make you seem detached, but your intellectual passion is genuine and often inspiring.',
        ],
      },
      {
        title: 'Thinking Patterns & Learning Style',
        icon: '🧠',
        paragraphs: [
          'Your mind thinks in networks, systems, and emergent patterns. You see connections between seemingly unrelated phenomena and can predict trends before they become visible to others. Your thinking is non-linear, jumping between ideas in ways that eventually reveal brilliant insights.',
          'You learn through experimentation, cross-pollination of ideas, and exposure to diverse perspectives. Traditional educational structures can feel constraining — you learn best when you are free to follow your curiosity wherever it leads, even if that means an unconventional path.',
        ],
      },
      {
        title: 'How You Argue',
        icon: '⚔️',
        paragraphs: [
          'You argue with logical detachment and progressive conviction. You present your position as the rational, forward-thinking alternative to outdated conventional wisdom. Your arguments are intellectual rather than emotional, and you can maintain your stance with icy calm in the face of heated opposition.',
          'You come at problems from angles nobody else considered, and your unconventional answers often beat the traditional ones. Your trap is arrogance: you write off an opposing view as simply behind the times.',
        ],
      },
    ],
  },
  pisces: {
    headline: 'Mercury in Pisces: The Poetic Intuitive',
    intro: 'You cannot explain how you know, but you do, and you are usually right. You think in images, metaphors and feelings instead of linear logic. What you say is poetic and empathic, and it reaches truths that plain rational language misses.',
    sections: [
      {
        title: 'Communication Style',
        icon: '🗣',
        paragraphs: [
          'You communicate through feeling, metaphor and artistic expression. Your words carry emotional resonance that moves people on a level deeper than rational persuasion. You are a natural poet, musician, or artist because you express what others feel but cannot articulate.',
          'You often struggle with precise, technical communication because your mind does not naturally think in discrete categories. Your ideas emerge as impressions, images, and feelings that must be translated into words — and something is always lost in translation.',
          'Your listening skills are extraordinary. You hear not just words but the emotions, fears, and unspoken desires beneath them. People feel deeply understood in your presence, and you have a gift for saying exactly the right thing at the right moment to comfort or inspire.',
        ],
      },
      {
        title: 'Thinking Patterns & Learning Style',
        icon: '🧠',
        paragraphs: [
          'Your mind thinks associatively and symbolically. You connect ideas through feeling-tone and imagery rather than logical sequence. This gives you extraordinary creative and spiritual insight, but it can make structured, linear thinking effortful.',
          'You learn through immersion, imagination, and emotional engagement. Reading fiction, watching films, listening to music, and absorbing information through atmosphere and mood are more effective for you than memorization or systematic study.',
        ],
      },
      {
        title: 'How You Argue',
        icon: '⚔️',
        paragraphs: [
          'You argue with emotional appeal, moral vision and a knack for sensing the truth beneath any debate. You may not have the sharpest logical arguments, but your empathic insight often cuts to the heart of what is really being discussed.',
          'You often sense the right answer before you can explain why, and you see sides of a problem that purely logical thinkers miss. What hurts you is vagueness, because formal debate wants crisp terms and your insights arrive as impressions.',
        ],
      },
    ],
  },
};

/* ── Lookup function ──────────────────────────────────────────── */

export function getMercurySignContent(sign: ZodiacSign): MercurySignContent {
  const data = MERCURY_CONTENT[sign];
  return { sign, ...data };
}
