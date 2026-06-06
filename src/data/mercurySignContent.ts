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
    intro: 'With Mercury in Aries, your mind is a lightning bolt — fast, direct, and impossible to ignore. You think in real time, speak before filtering, and arrive at conclusions while others are still formulating the question. Your communication style is bold, decisive, and refreshingly honest.',
    sections: [
      {
        title: 'Communication Style',
        icon: '🗣',
        paragraphs: [
          'Mercury in Aries communicates with speed and directness that can be either exhilarating or overwhelming. You get to the point immediately, often interrupting or finishing other people\'s sentences because your mind has already leapt ahead. Diplomacy takes conscious effort for you — your default is raw, unfiltered truth.',
          'You are a compelling speaker who energizes audiences with your enthusiasm and conviction. Your words carry the weight of action — when you say something, people know you mean it and that you are prepared to back it up. Wishy-washy language genuinely irritates you.',
          'Written communication is often shorter and more direct for Mercury in Aries than for other placements. You prefer bullet points to paragraphs, action items to abstract discussions, and brevity to elaboration.',
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
          'Mercury in Aries argues with passionate directness. You charge into debates headfirst, making your position known immediately and defending it with fierce conviction. You are a formidable opponent because you think on your feet, respond instantly, and never back down out of politeness.',
          'Your debate weakness is impatience. You may dismiss nuanced counterarguments because they take too long to articulate, or steamroll quieter voices in your rush to establish your point. Learning to listen as actively as you speak would make you nearly unbeatable.',
        ],
      },
    ],
  },
  taurus: {
    headline: 'Mercury in Taurus: The Deliberate Communicator',
    intro: 'With Mercury in Taurus, your mind is a vault — slow to open, carefully organized, and filled with deeply considered conclusions. You think before you speak, weigh your words with intention, and communicate with a grounded authority that makes everything you say sound like established fact.',
    sections: [
      {
        title: 'Communication Style',
        icon: '🗣',
        paragraphs: [
          'Mercury in Taurus communicates with measured deliberation. You choose your words carefully, speak at a comfortable pace, and refuse to be rushed into hasty statements. Your voice tends to be pleasant and soothing, and people find your unhurried communication style reassuring.',
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
          'Mercury in Taurus argues with stubborn persistence and practical common sense. You do not get swept up in emotional arguments or theoretical abstractions. You stick to facts, repeat your position with unwavering calm, and wear down opponents through sheer determination.',
          'Your debate strength is unshakeable composure. You never lose your cool in an argument, and your steady, practical perspective is difficult to counter with purely emotional appeals. Your weakness is inflexibility — you can be so committed to your position that you miss valid alternative viewpoints.',
        ],
      },
    ],
  },
  gemini: {
    headline: 'Mercury in Gemini: The Brilliant Connector',
    intro: 'Mercury is at home in Gemini, making this one of the most mentally gifted placements in astrology. With Mercury in Gemini, your mind is a hyperconnected network — processing multiple streams of information simultaneously, making unexpected connections, and communicating with a speed and versatility that few can match.',
    sections: [
      {
        title: 'Communication Style',
        icon: '🗣',
        paragraphs: [
          'Mercury in Gemini communicates with extraordinary versatility and speed. You can adjust your communication style to match any audience, switching between formal and casual, technical and accessible, serious and humorous with effortless grace. You are the zodiac\'s ultimate communicator.',
          'Your verbal agility makes you a natural storyteller, teacher, and entertainer. You can explain complex concepts in simple terms, weave engaging narratives from ordinary events, and keep any conversation lively with your quick wit and broad knowledge.',
          'You communicate across multiple channels simultaneously — texting while talking, reading while listening, processing multiple conversations in parallel. Others may see this as distraction, but for you it is simply how your mind operates at its natural speed.',
        ],
      },
      {
        title: 'Thinking Patterns & Learning Style',
        icon: '🧠',
        paragraphs: [
          'Your mind is an information processing machine. You absorb data voraciously, make rapid connections between disparate ideas, and synthesize information from multiple sources faster than any other Mercury placement. Your intelligence is lateral rather than linear — you see connections that others miss.',
          'You learn through exploration and variety. Studying one subject exclusively bores you — you need to jump between topics, follow tangential threads, and approach knowledge as a web rather than a ladder. Cross-disciplinary thinking is your superpower.',
        ],
      },
      {
        title: 'How You Argue',
        icon: '⚔️',
        paragraphs: [
          'Mercury in Gemini argues with dazzling rhetorical skill. You can argue any side of any debate with equal conviction, shifting positions with a speed that can be disorienting for opponents. You genuinely enjoy the intellectual exercise of debate, sometimes caring more about the quality of the argument than the truth of the conclusion.',
          'Your debate strength is intellectual agility. You can counter any argument immediately, find flaws in any position, and redirect the conversation whenever the terrain becomes unfavorable. Your weakness is that your flexibility can undermine your credibility — people may suspect you do not truly believe anything.',
        ],
      },
    ],
  },
  cancer: {
    headline: 'Mercury in Cancer: The Intuitive Listener',
    intro: 'With Mercury in Cancer, your mind is shaped by feeling. You think in images, memories, and emotional associations rather than purely logical sequences. Your communication carries emotional intelligence that makes people feel genuinely heard and understood in a way that transcends words.',
    sections: [
      {
        title: 'Communication Style',
        icon: '🗣',
        paragraphs: [
          'Mercury in Cancer communicates with emotional depth and intuitive accuracy. You read between the lines effortlessly, hearing not just what someone says but what they feel. Your responses are attuned to emotional nuance in a way that makes people feel deeply understood.',
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
          'Mercury in Cancer argues with emotional appeal and personal testimony. You are less interested in winning on logical points than in making your opponent feel what you feel. You share personal stories, appeal to empathy, and frame arguments in terms of their emotional impact.',
          'Your debate strength is emotional authenticity. When you speak from the heart, your sincerity is palpable and very difficult to counter with cold logic. Your weakness is sensitivity to attack — harsh words or dismissive responses can shut you down entirely.',
        ],
      },
    ],
  },
  leo: {
    headline: 'Mercury in Leo: The Commanding Voice',
    intro: 'With Mercury in Leo, your mind burns bright and your words command attention. You think with creative flair, speak with natural authority, and communicate in a way that is both entertaining and persuasive. When you talk, people listen — not because you demand it, but because your expression is genuinely compelling.',
    sections: [
      {
        title: 'Communication Style',
        icon: '🗣',
        paragraphs: [
          'Mercury in Leo communicates with dramatic flair and natural charisma. Your speech has a performative quality — you are a natural storyteller who turns ordinary anecdotes into compelling narratives. You have a gift for making people feel like they are part of something important and exciting.',
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
          'Mercury in Leo argues with authoritative conviction and theatrical delivery. You present your position as established truth, backing it up with confident assertions and compelling narratives. Your arguments are designed to inspire agreement rather than merely prove a point.',
          'Your debate strength is commanding presence. You dominate conversations through sheer force of personality, and your confidence can be genuinely persuasive. Your weakness is dismissing challenges to your ideas as personal insults, which can prevent you from considering valid criticism.',
        ],
      },
    ],
  },
  virgo: {
    headline: 'Mercury in Virgo: The Analytical Mind',
    intro: 'Mercury is exalted in Virgo, giving this placement extraordinary analytical power, precision, and intellectual discipline. With Mercury in Virgo, your mind is a high-resolution scanner — nothing escapes your attention, no detail is too small, and every piece of information is filed, categorized, and available for recall at a moment\'s notice.',
    sections: [
      {
        title: 'Communication Style',
        icon: '🗣',
        paragraphs: [
          'Mercury in Virgo communicates with precision, clarity, and a dedication to accuracy that sets it apart. You choose your words with the care of a surgeon selecting instruments — every word serves a purpose, and unnecessary embellishment is stripped away in favor of clean, effective expression.',
          'You are an excellent editor, proofreader, and technical communicator. You notice grammatical errors, logical inconsistencies, and factual inaccuracies that others miss entirely. Your written communication is typically polished, organized, and impeccably structured.',
          'Ruled by Vesta, your Mercury carries a devotional quality in its pursuit of truth and accuracy. You approach communication as a sacred responsibility — saying something incorrect or misleading feels genuinely wrong to you, and you will go to great lengths to verify your facts.',
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
          'Mercury in Virgo argues with meticulous precision and devastating attention to detail. You win debates by identifying the specific logical flaw in your opponent\'s argument, the factual error in their claim, or the inconsistency between their stated position and their actions.',
          'Your debate strength is intellectual rigor. Your arguments are thoroughly researched, logically sound, and nearly impossible to counter with hand-waving or emotional appeals. Your weakness is appearing overly critical or pedantic — sometimes the forest matters more than the trees.',
        ],
      },
    ],
  },
  libra: {
    headline: 'Mercury in Libra: The Fair-Minded Diplomat',
    intro: 'With Mercury in Libra, your mind naturally seeks balance, fairness, and the elegant midpoint between opposing views. Ruled by Juno, your intellectual gifts are oriented toward partnership, negotiation, and the art of finding common ground. You think in terms of relationship and reciprocity.',
    sections: [
      {
        title: 'Communication Style',
        icon: '🗣',
        paragraphs: [
          'Mercury in Libra communicates with grace, diplomacy, and an innate sense of social harmony. You have a gift for saying difficult things in ways that are easy to hear, and for framing criticism as constructive feedback. Your words are chosen as much for their aesthetic quality as their informational content.',
          'You are a natural mediator, able to present both sides of any argument with equal fairness and find compromise solutions that satisfy everyone. Ruled by Juno, your communication style prioritizes committed partnership and mutual respect — you speak to connect, not to dominate.',
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
          'Mercury in Libra argues with fairness, charm, and persuasive logic. You present both sides of an issue before making your case, which gives your eventual position enormous credibility. You are the sign most likely to win an argument by being so reasonable that opposition feels unreasonable.',
          'Your debate strength is balance and charm. You disarm opponents with fairness and win allies with graciousness. Your weakness is that your desire to be fair can prevent you from taking a strong position when one is genuinely needed.',
        ],
      },
    ],
  },
  scorpio: {
    headline: 'Mercury in Scorpio: The Penetrating Investigator',
    intro: 'With Mercury in Scorpio, your mind is a detective — probing, suspicious, and relentlessly driven toward the hidden truth beneath every surface. You think in psychological depths, communicate with strategic precision, and have an uncanny ability to see through lies, evasions, and social masks.',
    sections: [
      {
        title: 'Communication Style',
        icon: '🗣',
        paragraphs: [
          'Mercury in Scorpio communicates with intensity and strategic intention. You say exactly what you mean to say — no more, no less. Your words are carefully measured, and you reveal information only when it serves your purpose. This gives your communication a powerful, almost hypnotic quality.',
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
          'Mercury in Scorpio argues with psychological insight and strategic precision. You identify your opponent\'s emotional vulnerabilities, unspoken assumptions, and logical blind spots with unsettling accuracy. Your arguments often target the person as much as the position.',
          'Your debate strength is penetrating insight. You can dismantle an opponent\'s argument by exposing its hidden motivations or unconscious biases. Your weakness is a tendency toward manipulation — using your psychological gifts to win through intimidation rather than persuasion.',
        ],
      },
    ],
  },
  sagittarius: {
    headline: 'Mercury in Sagittarius: The Big-Picture Philosopher',
    intro: 'With Mercury in Sagittarius, your mind is an explorer charting vast intellectual territories. You think in grand concepts, communicate with infectious enthusiasm, and are perpetually searching for the overarching truth that connects all the individual dots. Your intellect is broad, optimistic, and always reaching for the horizon.',
    sections: [
      {
        title: 'Communication Style',
        icon: '🗣',
        paragraphs: [
          'Mercury in Sagittarius communicates with expansive enthusiasm and philosophical depth. You are the person who turns a simple question into an hour-long discussion about the meaning of life. Your speech is peppered with references to diverse cultures, philosophical traditions, and personal adventures.',
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
          'Mercury in Sagittarius argues with moral conviction and philosophical breadth. You frame debates in terms of principles, values, and universal truths. Your arguments appeal to the big picture, and you can be genuinely inspiring when defending a cause you believe in.',
          'Your debate strength is visionary perspective. You elevate discussions beyond petty details to matters of genuine significance, and your optimism can convert skeptics through sheer enthusiasm. Your weakness is glossing over inconvenient details and assuming your perspective is universally valid.',
        ],
      },
    ],
  },
  capricorn: {
    headline: 'Mercury in Capricorn: The Strategic Architect',
    intro: 'With Mercury in Capricorn, your mind is a fortress — structured, disciplined, and built for long-term thinking. You think in systems, plan in decades, and communicate with an authority that comes from thorough preparation and genuine expertise. Your intellect is practical, strategic, and impressively organized.',
    sections: [
      {
        title: 'Communication Style',
        icon: '🗣',
        paragraphs: [
          'Mercury in Capricorn communicates with authority, economy, and purposeful intent. You do not speak unless you have something worth saying, and when you do speak, your words carry the weight of careful consideration. You are not interested in idle chatter — every communication serves a strategic purpose.',
          'You excel at formal, professional communication. Reports, presentations, and structured arguments are your natural format. Your written work is thorough, well-organized, and free of unnecessary embellishment. You respect your audience enough to be clear and direct.',
          'Your dry, understated humor is a secret weapon. People who mistake your seriousness for humorlessness are surprised by the wit that emerges when you are comfortable. Capricorn Mercury humor is intelligent, observational, and perfectly timed.',
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
          'Mercury in Capricorn argues with measured authority and practical evidence. You present well-structured cases backed by real-world examples and established precedent. Your arguments are designed to withstand scrutiny, and you prepare for counterarguments in advance.',
          'Your debate strength is credibility. You have done your homework, you know your subject, and your quiet confidence communicates competence that is difficult to challenge. Your weakness is rigidity — you may dismiss unconventional ideas simply because they do not fit established frameworks.',
        ],
      },
    ],
  },
  aquarius: {
    headline: 'Mercury in Aquarius: The Visionary Iconoclast',
    intro: 'With Mercury in Aquarius, your mind operates on a frequency that most people cannot even detect. You think in patterns, systems, and futuristic possibilities that are decades ahead of conventional wisdom. Your intellect is original, progressive, and stubbornly independent of popular opinion.',
    sections: [
      {
        title: 'Communication Style',
        icon: '🗣',
        paragraphs: [
          'Mercury in Aquarius communicates with intellectual independence and visionary clarity. You say what you think regardless of social pressure, and your ideas are often too progressive or unconventional for mainstream audiences. You would rather be accurate than popular.',
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
          'Mercury in Aquarius argues with logical detachment and progressive conviction. You present your position as the rational, forward-thinking alternative to outdated conventional wisdom. Your arguments are intellectual rather than emotional, and you can maintain your stance with icy calm in the face of heated opposition.',
          'Your debate strength is original thinking. You approach problems from angles that no one else has considered, and your unconventional solutions often prove superior to traditional approaches. Your weakness is intellectual arrogance — you may dismiss opposing views as simply behind the times.',
        ],
      },
    ],
  },
  pisces: {
    headline: 'Mercury in Pisces: The Poetic Intuitive',
    intro: 'With Mercury in Pisces, your mind is an ocean of intuition, imagination, and emotional resonance. You think in images, metaphors, and feelings rather than linear logic. Your communication is poetic, empathic, and capable of expressing truths that rational language cannot capture.',
    sections: [
      {
        title: 'Communication Style',
        icon: '🗣',
        paragraphs: [
          'Mercury in Pisces communicates through feeling, metaphor, and artistic expression. Your words carry emotional resonance that moves people on a level deeper than rational persuasion. You are a natural poet, musician, or artist because you express what others feel but cannot articulate.',
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
          'Mercury in Pisces argues with emotional appeal, moral vision, and an almost mystical ability to sense the truth beneath the surface of any debate. You may not have the sharpest logical arguments, but your empathic insight often cuts to the heart of what is really being discussed.',
          'Your debate strength is intuitive accuracy. You often sense the right answer before you can explain why, and your emotional intelligence reveals dimensions of a problem that purely logical thinkers miss. Your weakness is vagueness — your insights can be difficult to articulate in the crisp, precise terms that formal debate requires.',
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
