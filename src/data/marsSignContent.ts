/* ──────────────────────────────────────────────────────────────
   Mars Sign Content
   SEO-rich astrological content for all 12 Mars sign pages.
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

export interface MarsSignContent {
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

export const MARS_SYMBOL = '♂';

/* ── Content for each Mars sign ───────────────────────────────── */

const MARS_CONTENT: Record<ZodiacSign, Omit<MarsSignContent, 'sign'>> = {
  aries: {
    headline: 'Mars in Aries: The Unstoppable Force',
    intro: 'Someone dares you, and you have already said yes. Your drive is immediate, your courage is instinctive, and your energy does not sit still for a meeting. You act, you lead, and you hate losing.',
    sections: [
      {
        title: 'Drive & Ambition',
        icon: '🔥',
        paragraphs: [
          'You act first and strategize later. Your instinct when confronted with a challenge is to charge directly at it, and this primal directness is often your greatest asset. While others are still planning, you have already started. While others are debating options, you have already committed to a path.',
          'Your ambition is fierce but short-cycled. You are brilliant at initiating projects, leading charges, and generating momentum, but maintaining focus on long-term goals requires conscious effort. You excel in environments that demand quick thinking, bold action, and a willingness to take risks.',
          'Competition fuels you. Whether in sports, business, or personal challenges, you perform best when there is something at stake and someone to beat. You are not motivated by abstract goals — you need a tangible target and the adrenaline of real-time performance.',
        ],
      },
      {
        title: 'Anger Style & Conflict',
        icon: '⚔️',
        paragraphs: [
          'Your anger is volcanic: it erupts fast, burns hot and is gone in minutes. You do not hold grudges or plot revenge. When something angers you, you confront it immediately, express your fury with alarming directness, and then move on as if nothing happened.',
          'You actually prefer open conflict to passive-aggressive tension. A clean fight, where both parties say exactly what they mean, feels honest and productive to you. What you cannot tolerate is someone who harbors resentment silently while pretending everything is fine.',
        ],
      },
      {
        title: 'Physical Energy & Sexuality',
        icon: '⚡',
        paragraphs: [
          'Your physical energy is explosive and needs regular outlets. High-intensity exercise, competitive sports, and physically demanding activities keep you balanced. Without sufficient physical outlets, your excess energy converts to irritability, restlessness, and unnecessary conflicts.',
          'In bed you are direct and spontaneous. You are the initiator, bringing intensity and enthusiasm to physical connection. You prefer partners who match your energy and are not afraid of passionate, vigorous expression.',
        ],
      },
    ],
  },
  taurus: {
    headline: 'Mars in Taurus: The Immovable Powerhouse',
    intro: 'You start slowly, and people write you off in week one. Then you are still going in month six, long after the faster starters have quit. You do not charge, you advance like a glacier, and your strength is that you do not give up.',
    sections: [
      {
        title: 'Drive & Ambition',
        icon: '🌿',
        paragraphs: [
          'You pursue goals with methodical, unwavering determination. You set your sights on what you want and work toward it with a patience that would exhaust more impulsive signs. Your results may take longer to materialize, but they are invariably solid, lasting, and worth the wait.',
          'Your ambition is oriented toward tangible, material outcomes. You want security, comfort, and beautiful things, and you are willing to work incredibly hard to acquire them. Abstract goals do not motivate you — you need to see, touch, and feel the fruits of your labor.',
          'You excel in environments that reward persistence over speed. While others burn out or lose interest, you keep going, steady and unshakable, until the job is done to your exacting standards.',
        ],
      },
      {
        title: 'Anger Style & Conflict',
        icon: '⚔️',
        paragraphs: [
          'Your fuse is very long, and the blast at the end of it is one people remember. You tolerate frustration for far longer than most signs, absorbing provocations that would send other people into orbit. But when you finally reach your breaking point, the eruption is seismic and memorable.',
          'You prefer to avoid conflict entirely, resolving tensions through patience and practical compromise. But when pushed beyond your considerable limits, your anger is a force of nature — thunderous, righteous, and impossible to dismiss.',
        ],
      },
      {
        title: 'Physical Energy & Sexuality',
        icon: '⚡',
        paragraphs: [
          'Your physical energy is steady and enduring. You prefer sustained activity over burst exertion — long hikes, weight training, and outdoor labor suit you better than sprint-style workouts. Your body thrives on consistency and responds well to gradual, progressive challenge.',
          'In bed you are sensual and unhurried. You value quality over quantity, preferring extended, deeply physical encounters to quick or impulsive connections. Touch, comfort, and leisurely exploration are your specialties.',
        ],
      },
    ],
  },
  gemini: {
    headline: 'Mars in Gemini: The Strategic Communicator',
    intro: 'You have six tabs open, three projects running and a phone call to return, and you feel most alive like that. Your weapon is your mind: you fight with words, win with wit, and reach your goals through information, contacts and versatility.',
    sections: [
      {
        title: 'Drive & Ambition',
        icon: '💨',
        paragraphs: [
          'You chase several goals at once and thrive on variety. You become restless when focused on a single task for too long, and your ideal work environment allows you to juggle multiple projects, switch between different challenges, and engage your quick mind.',
          'Your ambition is driven by curiosity rather than conquest. You want to know, to learn, to understand, and to communicate. Careers that involve writing, speaking, teaching, selling, or any form of information exchange wake you up.',
          'You excel at pivoting. When a plan stops working, you do not stubbornly persist — you adapt, finding new angles and alternative approaches with impressive speed. This mental flexibility is one of your greatest competitive advantages.',
        ],
      },
      {
        title: 'Anger Style & Conflict',
        icon: '⚔️',
        paragraphs: [
          'You fight with words. Your anger comes out as biting sarcasm and rapid-fire arguments, and you can take an opponent apart in a debate. You win most fights on rhetorical skill alone.',
          'Your anger is more irritable than explosive. You become snappy, scattered, and verbally sharp when frustrated, but you rarely descend into physical aggression or sustained fury. You prefer to talk things out, even if that conversation gets heated.',
        ],
      },
      {
        title: 'Physical Energy & Sexuality',
        icon: '⚡',
        paragraphs: [
          'Your physical energy is nervous and variable. You need activities that engage both mind and body — dance, martial arts, tennis, or any sport that requires strategy and quick reflexes. Pure endurance exercise bores you unless it comes with mental engagement.',
          'In bed you are playful and inventive. Talking is foreplay for you — dirty talk, verbal teasing, and intellectual connection heighten physical experience. You need variety and novelty to stay engaged over time.',
        ],
      },
    ],
  },
  cancer: {
    headline: 'Mars in Cancer: The Protective Warrior',
    intro: 'You will not move for a trophy, but you will drive across the country at midnight for someone you love. Your drive runs on feeling, and you fight for your family, your home and your people. You are strongest defending your own.',
    sections: [
      {
        title: 'Drive & Ambition',
        icon: '🌊',
        paragraphs: [
          'You run on emotional purpose. You are most motivated when your actions protect, nurture, or provide for someone you care about. Working just for yourself feels hollow — you need a personal, emotional reason to push yourself.',
          'Your ambition is oriented toward security and family. You want to build a home, provide for your loved ones, and create an environment where the people you care about can thrive. Financial security is not about luxury — it is about the safety of your family.',
          'You work in emotional cycles, with periods of intense productivity followed by retreats into rest and reflection. Trying to maintain constant output drains you. Your best work happens in focused bursts driven by genuine emotional investment.',
        ],
      },
      {
        title: 'Anger Style & Conflict',
        icon: '⚔️',
        paragraphs: [
          'You express anger sideways. You rarely confront someone head-on with raw fury. Instead, your anger manifests as moodiness, withdrawal, passive-aggressive behavior, or emotional manipulation when you feel threatened.',
          'But when someone you love is threatened, a different person shows up: fierce, primal and surprisingly aggressive. People who have seen you defend your family do not pick that fight twice.',
        ],
      },
      {
        title: 'Physical Energy & Sexuality',
        icon: '⚡',
        paragraphs: [
          'Your physical energy is tied to your emotional state. When emotionally secure, you have surprising stamina and strength. When emotionally depleted, your energy crashes. Water-based activities, swimming, and nurturing physical practices like cooking ground you.',
          'In bed you are tender and emotional. Physical intimacy is inseparable from emotional connection for you. You need to feel emotionally safe before you can fully express yourself physically, and when that safety exists, your passion is profound.',
        ],
      },
    ],
  },
  leo: {
    headline: 'Mars in Leo: The Magnificent Performer',
    intro: 'You do not want to just win, you want the room to see you win. Your drive runs on creative fire and a need to be recognized for what you made. Your ambition is theatrical and your courage is dramatic.',
    sections: [
      {
        title: 'Drive & Ambition',
        icon: '☀️',
        paragraphs: [
          'You pursue goals with theatrical determination and creative flair. You are motivated by recognition, creative expression, and the desire to leave a legacy. You want your work to matter, to be seen, and to inspire others. Anonymous achievement holds no appeal for you.',
          'Your ambition is intimately connected to your identity. You take enormous pride in your work and invest your personal dignity in your accomplishments. This means you give everything your absolute best, but it also means that failure feels like a personal affront.',
          'You excel in leadership roles that allow you to inspire and motivate others. Your natural charisma and enthusiasm are contagious, and teams thrive under your warm, encouraging direction. You lead by making everyone feel like they are part of something magnificent.',
        ],
      },
      {
        title: 'Anger Style & Conflict',
        icon: '⚔️',
        paragraphs: [
          'Your anger roars and nobody misses it. When you are angry, the temperature in the room rises. Your fury is theatrical and commanding — you do not whisper your displeasure, you announce it with the authority of a monarch addressing the court.',
          'Your anger is triggered most powerfully by disrespect. Being dismissed, humiliated, or treated as insignificant ignites your Mars like nothing else. However, once you have expressed your outrage and received an appropriate acknowledgment, you are remarkably generous about forgiving.',
        ],
      },
      {
        title: 'Physical Energy & Sexuality',
        icon: '⚡',
        paragraphs: [
          'Your physical energy is warm, sustained, and impressive. You are drawn to activities that allow you to shine — performance arts, competitive sports, and anything that combines physical exertion with creative expression. You enjoy being watched and admired while in action.',
          'In bed you are generous and a little theatrical. You bring flair and romance to physical connection, and you want your partner to feel like the most desired person in the world. Praise and admiration from your partner fuels your passion intensely.',
        ],
      },
    ],
  },
  virgo: {
    headline: 'Mars in Virgo: The Precision Engine',
    intro: 'You rewrite the checklist, fix the typo nobody else saw and finish the job before the deadline. Your drive is focused and efficient, and it goes into service and careful craft. You do not fight with brute force, you win on preparation and detail.',
    sections: [
      {
        title: 'Drive & Ambition',
        icon: '🌾',
        paragraphs: [
          'You pursue goals through careful planning, steady effort and constant refinement. You break large objectives into manageable components and execute each one with precision. Your approach may lack flash, but it produces consistently excellent results.',
          'You treat your work like a practice, with monk-like focus on whatever you commit to. Half-measures annoy you, and when you do something, you do it properly.',
          'You excel in environments that reward expertise, precision, and continuous improvement. Medicine, engineering, craft, analysis, and any field that demands meticulous attention to detail fits you perfectly.',
        ],
      },
      {
        title: 'Anger Style & Conflict',
        icon: '⚔️',
        paragraphs: [
          'Your anger comes out as sharp criticism and nitpicking, and you can name exactly what is wrong with a person or a plan. You rarely yell. You dissect. Your anger is precise and often delivered in a calm, devastating tone.',
          'You are triggered by incompetence, sloppiness, and wastefulness. When people do not meet your standards or when processes are inefficient, your frustration builds in small increments until it crystallizes into pointed, articulate criticism.',
        ],
      },
      {
        title: 'Physical Energy & Sexuality',
        icon: '⚡',
        paragraphs: [
          'Your physical energy is steady, detailed, and health-conscious. You are drawn to exercise routines that are systematic and progressive — tracking your performance, optimizing your nutrition, and treating your body as a precision instrument that requires proper maintenance.',
          'In bed you are attentive and focused on technique. You study your partner\'s responses with the same analytical care you bring to everything else, learning exactly what works and refining your approach over time. Cleanliness and health are important components of your physical expression.',
        ],
      },
    ],
  },
  libra: {
    headline: 'Mars in Libra: The Diplomatic Strategist',
    intro: 'You will sit through two hours of a dispute to get a deal both sides can live with. Your drive works through partnership and strategy, and your fighting energy goes into negotiation, advocacy and fair outcomes. You fight for balance, and you fight politely.',
    sections: [
      {
        title: 'Drive & Ambition',
        icon: '⚖️',
        paragraphs: [
          'You pursue goals through collaboration and diplomacy. You are most effective when working with others, and you have a gift for assembling teams, brokering agreements, and creating win-win outcomes. Lone-wolf ambition feels unnatural to you.',
          'Unfairness gets you moving. You fight for equality and the rights of others, and law, advocacy, mediation or social justice work tends to pull you in.',
          'Your ambition is oriented toward creating harmony and beauty in the world. You want your work to be aesthetically pleasing, socially beneficial, and fundamentally fair. You struggle to invest your energy in anything that feels unjust or inelegant.',
        ],
      },
      {
        title: 'Anger Style & Conflict',
        icon: '⚔️',
        paragraphs: [
          'Anger is complicated for you. You instinctively suppress confrontational impulses in favor of keeping the peace, which can lead to passive-aggressive behavior, resentment buildup, or explosive outbursts when suppressed anger finally surfaces.',
          'When you do engage in conflict, you fight fair and argue persuasively. You win arguments through logic, charm and an appeal to fairness. Your anger is most righteous when defending someone who is being treated unfairly.',
        ],
      },
      {
        title: 'Physical Energy & Sexuality',
        icon: '⚡',
        paragraphs: [
          'Your physical energy thrives in partnership activities. Couples workouts, dance, tennis, and any activity that involves graceful movement with another person energizes you. Solo exercise can feel unmotivating — you perform best with a companion.',
          'In bed you are romantic and focused on mutual pleasure. You approach physical connection as a collaborative art form, prioritizing your partner\'s experience as much as your own. Beauty, atmosphere, and emotional connection enhance your desire.',
        ],
      },
    ],
  },
  scorpio: {
    headline: 'Mars in Scorpio: The Relentless Transformer',
    intro: 'You decide what you want, say nothing, and quietly work on it for as long as it takes. Your drive is deep, strategic and relentless. You do not compete, you dominate, and you do it through force of will and a sharp read on people, with your energy locked on one target.',
    sections: [
      {
        title: 'Drive & Ambition',
        icon: '🦅',
        paragraphs: [
          'You pursue goals with singular, obsessive focus. When you decide you want something, you commit every fiber of your being to achieving it. Obstacles do not deter you — they merely redirect your approach. You will find a way, no matter how long it takes or how many detours you must navigate.',
          'Your ambition is fueled by emotional intensity and a deep desire for power — not power over others, but the power to shape your own destiny. You are drawn to complex, high-stakes environments where your psychological insight and strategic thinking give you a decisive advantage.',
          'You excel in environments that require investigation, transformation, and depth. Psychology, surgery, detective work, research, finance, and any field that rewards penetrating beneath the surface fits you.',
        ],
      },
      {
        title: 'Anger Style & Conflict',
        icon: '⚔️',
        paragraphs: [
          'Your anger is cold and controlled, and it is far more dangerous than a hot-tempered outburst. When you are truly angry, you become still and quiet, your eyes hardening with an intensity that communicates more than shouting ever could. You do not forget betrayals, and you have the patience to settle scores on your own timeline.',
          'You prefer to fight strategically rather than reactively. You gather information, identify vulnerabilities, and choose your moment carefully. When you do strike, it is with devastating precision. Those who underestimate your anger because of its quiet delivery learn quickly that still waters run deepest.',
        ],
      },
      {
        title: 'Physical Energy & Sexuality',
        icon: '⚡',
        paragraphs: [
          'Your physical energy is intense, sustained, and deeply connected to your emotional state. You are drawn to challenging, transformative physical practices — intense training, martial arts, distance running, or any activity that pushes you past your perceived limits.',
          'In bed your desire is deep and consuming, and it changes people. Physical connection is a gateway to emotional and spiritual merger for you, and you bring a primal intensity to intimacy that is both thrilling and overwhelming.',
        ],
      },
    ],
  },
  sagittarius: {
    headline: 'Mars in Sagittarius: The Boundless Crusader',
    intro: 'You say yes to the trip before checking your calendar, and you are sure it will work out. Your drive runs on faith and adventure, and you go at your goals like an explorer, with an optimism that turns obstacles into stepping stones.',
    sections: [
      {
        title: 'Drive & Ambition',
        icon: '🏹',
        paragraphs: [
          'You pursue goals with big enthusiasm and a sense of purpose. You need your ambitions to mean something — you cannot invest your energy in pursuits that feel pointless or small. You want your work to expand horizons, spread truth, or contribute to human understanding.',
          'Your approach is big-picture and visionary. You are better at setting grand goals than managing the details of execution, and you thrive when you can delegate the minutiae to someone more detail-oriented while you focus on the overarching mission.',
          'You excel in environments that involve travel, education, publishing, philosophy, or cross-cultural exchange. Any work that broadens perspectives and challenges narrow thinking lights you up.',
        ],
      },
      {
        title: 'Anger Style & Conflict',
        icon: '⚔️',
        paragraphs: [
          'Your anger is explosive and short-lived. You flare up dramatically, saying exactly what you think with blunt, unfiltered honesty. Your anger is righteous and principled — you are most triggered by hypocrisy, dishonesty, and willful ignorance.',
          'You fight for ideals rather than personal grievances. Injustice, closed-mindedness, and the suppression of truth provoke your warrior spirit. After the explosion, you cool down quickly and are often surprised by how hurt others are by your blunt words.',
        ],
      },
      {
        title: 'Physical Energy & Sexuality',
        icon: '⚡',
        paragraphs: [
          'Your physical energy is abundant, restless, and needs wide-open spaces. Outdoor activities — hiking, horseback riding, mountain biking, adventure sports — suit you perfectly. You need room to roam and challenges that take you out of your comfort zone.',
          'In bed you are enthusiastic and playful. You approach physical connection with humor, openness, and a genuine sense of fun. You value honesty and directness in sexual communication and are attracted to partners who share your adventurous spirit.',
        ],
      },
    ],
  },
  capricorn: {
    headline: 'Mars in Capricorn: The Master Strategist',
    intro: 'You are already working on the ten-year plan while everyone else celebrates the quarter. You play the long game and you do not waste energy on battles that do not serve it. Every move is calculated, and a setback is just a detour on the way to where you were going anyway.',
    sections: [
      {
        title: 'Drive & Ambition',
        icon: '🏔',
        paragraphs: [
          'You are the strategist in the room. Your ambition is not impulsive or emotional, it is architectural. You see the endpoint clearly, map out every step required to reach it, and then execute with the patience and discipline of a master builder constructing a cathedral.',
          'You are motivated by legacy, achievement, and the respect of people you admire. You want to build something that lasts — a career, a company, a reputation — that stands as evidence of your dedication and competence. You measure success in decades, not days.',
          'You excel in hierarchical environments where hard work and competence are rewarded with advancement. Business, government, military, and institutional leadership roles suit you perfectly. You understand power structures and know how to climb them.',
        ],
      },
      {
        title: 'Anger Style & Conflict',
        icon: '⚔️',
        paragraphs: [
          'Your anger is controlled and authoritative, and it gets immediate respect. You do not waste energy on petty conflicts — when you engage in battle, it is because something genuinely important is at stake, and your measured, strategic response makes your displeasure land with significant weight.',
          'You prefer to win through outperformance rather than confrontation. The best revenge, in your estimation, is massive success. You channel anger into productivity, using frustration as fuel for even greater achievement.',
        ],
      },
      {
        title: 'Physical Energy & Sexuality',
        icon: '⚡',
        paragraphs: [
          'Your physical energy is disciplined, enduring, and goal-oriented. You approach fitness the same way you approach career — with clear objectives, structured programs, and measurable progress. Mountain climbing, long-distance running, and any physically demanding sport that rewards perseverance suits you.',
          'In bed you are more sensual than your reserved exterior suggests. You take your time, you are thorough, and you bring the same dedication to physical pleasure that you bring to everything else. Trust and exclusivity are important to your sexual expression.',
        ],
      },
    ],
  },
  aquarius: {
    headline: 'Mars in Aquarius: The Revolutionary Innovator',
    intro: 'You see a broken system and your first move is to redesign it from scratch. Your drive goes into innovation and a stubborn commitment to progress. You do not fight conventional battles with conventional weapons, you change the playing field, and your energy shows up in unpredictable bursts.',
    sections: [
      {
        title: 'Drive & Ambition',
        icon: '⚡',
        paragraphs: [
          'You pursue goals through unconventional methods and collective action. You are not interested in climbing existing ladders — you want to build entirely new structures. Your ambition is social as much as personal, driven by a genuine desire to improve the systems that shape human life.',
          'You are motivated by intellectual challenge and social impact. Routine work drains you, but give you an impossible problem to solve or a broken system to redesign, and your energy becomes tireless. You thrive in technology, social enterprise, activism, and any field that involves innovation.',
          'You excel when working within groups and communities that share your vision. Your leadership style is collaborative and egalitarian — you inspire through ideas rather than authority, and you genuinely believe that the best solutions emerge from diverse, empowered teams.',
        ],
      },
      {
        title: 'Anger Style & Conflict',
        icon: '⚔️',
        paragraphs: [
          'Your anger is detached and intellectual, which throws more emotional people off. When angry, you become cool, distant, and stubbornly principled. You argue with logic and data, not emotion, and you can maintain your position with an icy calm that infuriates opponents.',
          'You are triggered by injustice, conformity, and the abuse of power. Your anger is most fierce when directed at systems and institutions rather than individuals. You fight for humanity, not just yourself.',
        ],
      },
      {
        title: 'Physical Energy & Sexuality',
        icon: '⚡',
        paragraphs: [
          'Your physical energy comes in unpredictable bursts. You may be sedentary for days, then suddenly possessed by a surge of kinetic energy that demands expression. Team sports, group fitness, and activities with a social or competitive element suit you better than solitary exercise.',
          'In bed you are experimental and cerebral, and you value freedom. You are open to unconventional approaches and prioritize intellectual connection alongside physical chemistry. You need a partner who respects your autonomy and is open to exploring together.',
        ],
      },
    ],
  },
  pisces: {
    headline: 'Mars in Pisces: The Intuitive Warrior',
    intro: 'You wait, and then you move at exactly the right moment, and people wonder how you knew. Your drive goes around obstacles instead of through them. Your strength is not aggression but emotional intelligence, creative vision and a sense of timing.',
    sections: [
      {
        title: 'Drive & Ambition',
        icon: '🌊',
        paragraphs: [
          'You pursue goals through intuition and emotional connection. You are motivated by vision and meaning rather than competition or material reward. Your best work is done when you feel emotionally and spiritually aligned with your purpose.',
          'Your ambition is subtle and often unconscious. You may not set explicit goals the way other Mars signs do, but you are drawn toward your destiny by something deeper than willpower. Your greatest achievements often happen when you surrender control and let your intuition guide your actions.',
          'You excel in creative, healing, and spiritual fields. Music, film, therapy, social work, and any career that allows you to channel emotion into meaningful expression brings out your best.',
        ],
      },
      {
        title: 'Anger Style & Conflict',
        icon: '⚔️',
        paragraphs: [
          'Your anger is hard to see. You absorb frustration rather than expressing it, which can lead to passive-aggressive behavior, self-sabotage, or emotional withdrawal. Direct confrontation is deeply uncomfortable for you, and you will go to great lengths to avoid it.',
          'When you do engage in conflict, you fight with emotional appeal rather than logical argument. You can make an opponent feel guilty, sad, or sympathetic without ever raising your voice. Your weapon is empathy itself, and it is surprisingly effective.',
        ],
      },
      {
        title: 'Physical Energy & Sexuality',
        icon: '⚡',
        paragraphs: [
          'Your physical energy is fluid and heavily influenced by your emotional state. Water activities, dance, yoga, tai chi, and any movement that feels like flowing rather than fighting suits you. You need physical practices that honor your emotional sensitivity rather than overriding it.',
          'In bed you are romantic and intuitive. Physical connection is an act of spiritual union for you, and you bring an almost transcendent quality to intimate moments. You need to feel emotionally safe and spiritually connected to fully express yourself.',
        ],
      },
    ],
  },
};

/* ── Lookup function ──────────────────────────────────────────── */

export function getMarsSignContent(sign: ZodiacSign): MarsSignContent {
  const data = MARS_CONTENT[sign];
  return { sign, ...data };
}
