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
    intro: 'Mars is at home in Aries, making this the most powerful and naturally expressed Mars placement in the zodiac. With Mars in Aries, your drive is immediate, your courage is instinctive, and your energy is a force of nature that refuses to be contained. You were born to act, to lead, and to win.',
    sections: [
      {
        title: 'Drive & Ambition',
        icon: '🔥',
        paragraphs: [
          'Mars in Aries acts first and strategizes later. Your instinct when confronted with a challenge is to charge directly at it, and this primal directness is often your greatest asset. While others are still planning, you have already started. While others are debating options, you have already committed to a path.',
          'Your ambition is fierce but short-cycled. You are brilliant at initiating projects, leading charges, and generating momentum, but maintaining focus on long-term goals requires conscious effort. You excel in environments that demand quick thinking, bold action, and a willingness to take risks.',
          'Competition fuels you. Whether in sports, business, or personal challenges, you perform best when there is something at stake and someone to beat. You are not motivated by abstract goals — you need a tangible target and the adrenaline of real-time performance.',
        ],
      },
      {
        title: 'Anger Style & Conflict',
        icon: '⚔️',
        paragraphs: [
          'Mars in Aries has a volcanic anger style — it erupts fast, burns hot, and dissipates quickly. You do not hold grudges or plot revenge. When something angers you, you confront it immediately, express your fury with alarming directness, and then move on as if nothing happened.',
          'You actually prefer open conflict to passive-aggressive tension. A clean fight, where both parties say exactly what they mean, feels honest and productive to you. What you cannot tolerate is someone who harbors resentment silently while pretending everything is fine.',
        ],
      },
      {
        title: 'Physical Energy & Sexuality',
        icon: '⚡',
        paragraphs: [
          'Your physical energy is explosive and needs regular outlets. High-intensity exercise, competitive sports, and physically demanding activities keep your Mars energy balanced. Without sufficient physical outlets, your excess energy converts to irritability, restlessness, and unnecessary conflicts.',
          'Sexually, Mars in Aries is passionate, direct, and spontaneous. You are the initiator, bringing intensity and enthusiasm to physical connection. You prefer partners who match your energy and are not afraid of passionate, vigorous expression.',
        ],
      },
    ],
  },
  taurus: {
    headline: 'Mars in Taurus: The Immovable Powerhouse',
    intro: 'With Mars in Taurus, your drive is slow-burning but absolutely relentless. You do not charge into battle — you advance like a glacier, unstoppable and inevitable. Your strength is endurance, and your power lies in the simple fact that you will never, ever give up.',
    sections: [
      {
        title: 'Drive & Ambition',
        icon: '🌿',
        paragraphs: [
          'Mars in Taurus pursues goals with methodical, unwavering determination. You set your sights on what you want and work toward it with a patience that would exhaust more impulsive signs. Your results may take longer to materialize, but they are invariably solid, lasting, and worth the wait.',
          'Your ambition is oriented toward tangible, material outcomes. You want security, comfort, and beautiful things, and you are willing to work incredibly hard to acquire them. Abstract goals do not motivate you — you need to see, touch, and feel the fruits of your labor.',
          'You excel in environments that reward persistence over speed. While others burn out or lose interest, you keep going, steady and unshakable, until the job is done to your exacting standards.',
        ],
      },
      {
        title: 'Anger Style & Conflict',
        icon: '⚔️',
        paragraphs: [
          'Mars in Taurus has a slow-fuse anger that is legendary in its intensity when finally ignited. You tolerate frustration for far longer than most signs, absorbing provocations that would send an Aries into orbit. But when you finally reach your breaking point, the eruption is seismic and memorable.',
          'You prefer to avoid conflict entirely, resolving tensions through patience and practical compromise. But when pushed beyond your considerable limits, your anger is a force of nature — thunderous, righteous, and impossible to dismiss.',
        ],
      },
      {
        title: 'Physical Energy & Sexuality',
        icon: '⚡',
        paragraphs: [
          'Your physical energy is steady and enduring. You prefer sustained activity over burst exertion — long hikes, weight training, and outdoor labor suit you better than sprint-style workouts. Your body thrives on consistency and responds well to gradual, progressive challenge.',
          'Sexually, Mars in Taurus is deeply sensual and physically oriented. You value quality over quantity, preferring extended, deeply physical encounters to quick or impulsive connections. Touch, comfort, and leisurely exploration are your specialties.',
        ],
      },
    ],
  },
  gemini: {
    headline: 'Mars in Gemini: The Strategic Communicator',
    intro: 'With Mars in Gemini, your drive expresses itself through intellect, communication, and mental agility. Your weapon is your mind, and your battlefield is the world of ideas. You fight with words, win with wit, and pursue your goals through information, networking, and strategic versatility.',
    sections: [
      {
        title: 'Drive & Ambition',
        icon: '💨',
        paragraphs: [
          'Mars in Gemini pursues multiple goals simultaneously, thriving on variety and mental stimulation. You become restless when focused on a single task for too long, and your ideal work environment allows you to juggle multiple projects, switch between different challenges, and engage your quick mind.',
          'Your ambition is driven by curiosity rather than conquest. You want to know, to learn, to understand, and to communicate. Careers that involve writing, speaking, teaching, selling, or any form of information exchange ignite your Mars energy.',
          'You excel at pivoting. When a plan stops working, you do not stubbornly persist — you adapt, finding new angles and alternative approaches with impressive speed. This mental flexibility is one of your greatest competitive advantages.',
        ],
      },
      {
        title: 'Anger Style & Conflict',
        icon: '⚔️',
        paragraphs: [
          'Mars in Gemini fights with words. Your anger manifests as biting sarcasm, rapid-fire arguments, and a verbal dexterity that can demolish opponents in debate. You are the sign most likely to win fights through sheer rhetorical skill.',
          'Your anger is more irritable than explosive. You become snappy, scattered, and verbally sharp when frustrated, but you rarely descend into physical aggression or sustained fury. You prefer to talk things out, even if that conversation gets heated.',
        ],
      },
      {
        title: 'Physical Energy & Sexuality',
        icon: '⚡',
        paragraphs: [
          'Your physical energy is nervous and variable. You need activities that engage both mind and body — dance, martial arts, tennis, or any sport that requires strategy and quick reflexes. Pure endurance exercise bores you unless it comes with mental engagement.',
          'Sexually, Mars in Gemini is playful, verbal, and inventive. Communication is foreplay for you — dirty talk, verbal teasing, and intellectual connection heighten physical experience. You need variety and novelty to stay engaged over time.',
        ],
      },
    ],
  },
  cancer: {
    headline: 'Mars in Cancer: The Protective Warrior',
    intro: 'With Mars in Cancer, your drive is emotionally powered and fiercely protective. You are not motivated by personal glory or competitive achievement — you fight for your family, your home, and the people you love. Your strength is the primal power of someone defending their own.',
    sections: [
      {
        title: 'Drive & Ambition',
        icon: '🌊',
        paragraphs: [
          'Mars in Cancer channels its energy through emotional purpose. You are most motivated when your actions protect, nurture, or provide for someone you care about. Working just for yourself feels hollow — you need a personal, emotional reason to push yourself.',
          'Your ambition is oriented toward security and family. You want to build a home, provide for your loved ones, and create an environment where the people you care about can thrive. Financial security is not about luxury — it is about the safety of your family.',
          'You work in emotional cycles, with periods of intense productivity followed by retreats into rest and reflection. Trying to maintain constant output drains you. Your best work happens in focused bursts driven by genuine emotional investment.',
        ],
      },
      {
        title: 'Anger Style & Conflict',
        icon: '⚔️',
        paragraphs: [
          'Mars in Cancer expresses anger indirectly and protectively. You rarely confront someone head-on with raw fury. Instead, your anger manifests as moodiness, withdrawal, passive-aggressive behavior, or emotional manipulation when you feel threatened.',
          'However, when someone you love is threatened, a different Mars emerges — one that is fierce, primal, and surprisingly aggressive. The Cancer Mars that is defending family is one of the most formidable forces in the zodiac.',
        ],
      },
      {
        title: 'Physical Energy & Sexuality',
        icon: '⚡',
        paragraphs: [
          'Your physical energy is tied to your emotional state. When emotionally secure, you have surprising stamina and strength. When emotionally depleted, your energy crashes. Water-based activities, swimming, and nurturing physical practices like cooking ground you.',
          'Sexually, Mars in Cancer is deeply emotional, tender, and intensely bonded. Physical intimacy is inseparable from emotional connection for you. You need to feel emotionally safe before you can fully express yourself physically, and when that safety exists, your passion is profound.',
        ],
      },
    ],
  },
  leo: {
    headline: 'Mars in Leo: The Magnificent Performer',
    intro: 'With Mars in Leo, your drive is powered by creative fire and a burning need to be recognized for your brilliance. You do not merely want to succeed — you want to succeed spectacularly, leaving an impression that outlasts the moment. Your ambition is theatrical, your courage is dramatic, and your energy is pure gold.',
    sections: [
      {
        title: 'Drive & Ambition',
        icon: '☀️',
        paragraphs: [
          'Mars in Leo pursues goals with theatrical determination and creative flair. You are motivated by recognition, creative expression, and the desire to leave a legacy. You want your work to matter, to be seen, and to inspire others. Anonymous achievement holds no appeal for you.',
          'Your ambition is intimately connected to your identity. You take enormous pride in your work and invest your personal dignity in your accomplishments. This means you give everything your absolute best, but it also means that failure feels like a personal affront.',
          'You excel in leadership roles that allow you to inspire and motivate others. Your natural charisma and enthusiasm are contagious, and teams thrive under your warm, encouraging direction. You lead by making everyone feel like they are part of something magnificent.',
        ],
      },
      {
        title: 'Anger Style & Conflict',
        icon: '⚔️',
        paragraphs: [
          'Mars in Leo has a dramatic, roaring anger that is impossible to ignore. When you are angry, the temperature in the room rises. Your fury is theatrical and commanding — you do not whisper your displeasure, you announce it with the authority of a monarch addressing the court.',
          'Your anger is triggered most powerfully by disrespect. Being dismissed, humiliated, or treated as insignificant ignites your Mars like nothing else. However, once you have expressed your outrage and received an appropriate acknowledgment, you are remarkably generous about forgiving.',
        ],
      },
      {
        title: 'Physical Energy & Sexuality',
        icon: '⚡',
        paragraphs: [
          'Your physical energy is warm, sustained, and impressive. You are drawn to activities that allow you to shine — performance arts, competitive sports, and anything that combines physical exertion with creative expression. You enjoy being watched and admired while in action.',
          'Sexually, Mars in Leo is passionate, generous, and performative. You bring flair and romance to physical connection, and you want your partner to feel like the most desired person in the world. Praise and admiration from your partner fuels your passion intensely.',
        ],
      },
    ],
  },
  virgo: {
    headline: 'Mars in Virgo: The Precision Engine',
    intro: 'With Mars in Virgo, your drive is focused, methodical, and devastatingly efficient. Ruled by Vesta, this Mars placement channels aggressive energy into devoted service and meticulous craftsmanship. You do not fight with brute force — you win through preparation, precision, and an attention to detail that borders on the surgical.',
    sections: [
      {
        title: 'Drive & Ambition',
        icon: '🌾',
        paragraphs: [
          'Mars in Virgo pursues goals through careful planning, systematic effort, and relentless refinement. You break large objectives into manageable components and execute each one with precision. Your approach may lack flash, but it produces consistently excellent results.',
          'Ruled by Vesta, your Mars energy carries a devotional quality. You approach your work as sacred practice, bringing a monk-like focus and dedication to whatever you commit to. Half-measures are not in your vocabulary — when you do something, you do it properly.',
          'You excel in environments that reward expertise, precision, and continuous improvement. Medicine, engineering, craft, analysis, and any field that demands meticulous attention to detail activates your Mars energy perfectly.',
        ],
      },
      {
        title: 'Anger Style & Conflict',
        icon: '⚔️',
        paragraphs: [
          'Mars in Virgo expresses anger through sharp criticism, irritable nitpicking, and a surgical ability to identify exactly what is wrong with a person or situation. You rarely yell — you dissect. Your anger is precise and often delivered in a calm, devastating tone.',
          'You are triggered by incompetence, sloppiness, and wastefulness. When people do not meet your standards or when processes are inefficient, your frustration builds in small increments until it crystallizes into pointed, articulate criticism.',
        ],
      },
      {
        title: 'Physical Energy & Sexuality',
        icon: '⚡',
        paragraphs: [
          'Your physical energy is steady, detailed, and health-conscious. You are drawn to exercise routines that are systematic and progressive — tracking your performance, optimizing your nutrition, and treating your body as a precision instrument that requires proper maintenance.',
          'Sexually, Mars in Virgo is attentive, skilled, and focused on technique. You study your partner\'s responses with the same analytical care you bring to everything else, learning exactly what works and refining your approach over time. Cleanliness and health are important components of your physical expression.',
        ],
      },
    ],
  },
  libra: {
    headline: 'Mars in Libra: The Diplomatic Strategist',
    intro: 'With Mars in Libra, your drive is expressed through partnership, strategy, and the pursuit of justice. Ruled by Juno, this Mars placement channels combative energy into the art of negotiation, advocacy, and creating fair outcomes. You fight for balance — and you fight beautifully.',
    sections: [
      {
        title: 'Drive & Ambition',
        icon: '⚖️',
        paragraphs: [
          'Mars in Libra pursues goals through collaboration, diplomacy, and strategic partnership. You are most effective when working with others, and you have a gift for assembling teams, brokering agreements, and creating win-win outcomes. Lone-wolf ambition feels unnatural to you.',
          'Ruled by Juno, your Mars energy is particularly activated in matters of partnership and justice. You are driven to fight for fairness, equality, and the rights of others. Many Mars in Libra individuals are drawn to law, advocacy, mediation, or social justice work.',
          'Your ambition is oriented toward creating harmony and beauty in the world. You want your work to be aesthetically pleasing, socially beneficial, and fundamentally fair. You struggle to invest your energy in anything that feels unjust or inelegant.',
        ],
      },
      {
        title: 'Anger Style & Conflict',
        icon: '⚔️',
        paragraphs: [
          'Mars in Libra has a complicated relationship with anger. You instinctively suppress confrontational impulses in favor of keeping the peace, which can lead to passive-aggressive behavior, resentment buildup, or explosive outbursts when suppressed anger finally surfaces.',
          'When you do engage in conflict, you fight fair and argue persuasively. You are the sign most likely to win an argument through logic, charm, and an appeal to justice. Your anger is most righteous when defending someone who is being treated unfairly.',
        ],
      },
      {
        title: 'Physical Energy & Sexuality',
        icon: '⚡',
        paragraphs: [
          'Your physical energy thrives in partnership activities. Couples workouts, dance, tennis, and any activity that involves graceful movement with another person energizes you. Solo exercise can feel unmotivating — you perform best with a companion.',
          'Sexually, Mars in Libra is romantic, attentive, and focused on mutual pleasure. You approach physical connection as a collaborative art form, prioritizing your partner\'s experience as much as your own. Beauty, atmosphere, and emotional connection enhance your desire.',
        ],
      },
    ],
  },
  scorpio: {
    headline: 'Mars in Scorpio: The Relentless Transformer',
    intro: 'Mars in Scorpio is one of the most powerful placements in the zodiac. Your drive is deep, strategic, and absolutely relentless. You do not compete — you dominate. Not through aggression, but through sheer force of will, psychological acuity, and an ability to focus your energy with laser-like intensity on whatever you desire.',
    sections: [
      {
        title: 'Drive & Ambition',
        icon: '🦅',
        paragraphs: [
          'Mars in Scorpio pursues goals with singular, obsessive focus. When you decide you want something, you commit every fiber of your being to achieving it. Obstacles do not deter you — they merely redirect your approach. You will find a way, no matter how long it takes or how many detours you must navigate.',
          'Your ambition is fueled by emotional intensity and a deep desire for power — not power over others, but the power to shape your own destiny. You are drawn to complex, high-stakes environments where your psychological insight and strategic thinking give you a decisive advantage.',
          'You excel in environments that require investigation, transformation, and depth. Psychology, surgery, detective work, research, finance, and any field that rewards penetrating beneath the surface activates your formidable Mars energy.',
        ],
      },
      {
        title: 'Anger Style & Conflict',
        icon: '⚔️',
        paragraphs: [
          'Mars in Scorpio has a cold, controlled anger that is far more dangerous than any hot-tempered outburst. When you are truly angry, you become still and quiet, your eyes hardening with an intensity that communicates more than shouting ever could. You do not forget betrayals, and you have the patience to settle scores on your own timeline.',
          'You prefer to fight strategically rather than reactively. You gather information, identify vulnerabilities, and choose your moment carefully. When you do strike, it is with devastating precision. Those who underestimate your anger because of its quiet delivery learn quickly that still waters run deepest.',
        ],
      },
      {
        title: 'Physical Energy & Sexuality',
        icon: '⚡',
        paragraphs: [
          'Your physical energy is intense, sustained, and deeply connected to your emotional state. You are drawn to challenging, transformative physical practices — intense training, martial arts, distance running, or any activity that pushes you past your perceived limits.',
          'Sexually, Mars in Scorpio is legendary in the zodiac. Your desire is deep, consuming, and transformative. Physical connection is a gateway to emotional and spiritual merger for you, and you bring a primal intensity to intimacy that is both thrilling and overwhelming.',
        ],
      },
    ],
  },
  sagittarius: {
    headline: 'Mars in Sagittarius: The Boundless Crusader',
    intro: 'With Mars in Sagittarius, your drive is fueled by faith, adventure, and the unshakeable conviction that the best is always yet to come. You pursue your goals with the enthusiasm of an explorer discovering new continents, powered by an optimism that transforms obstacles into stepping stones.',
    sections: [
      {
        title: 'Drive & Ambition',
        icon: '🏹',
        paragraphs: [
          'Mars in Sagittarius pursues goals with expansive enthusiasm and philosophical purpose. You need your ambitions to mean something — you cannot invest your energy in pursuits that feel pointless or small. You want your work to expand horizons, spread truth, or contribute to human understanding.',
          'Your approach is big-picture and visionary. You are better at setting grand goals than managing the details of execution, and you thrive when you can delegate the minutiae to someone more detail-oriented while you focus on the overarching mission.',
          'You excel in environments that involve travel, education, publishing, philosophy, or cross-cultural exchange. Any work that broadens perspectives and challenges narrow thinking ignites your Sagittarian fire.',
        ],
      },
      {
        title: 'Anger Style & Conflict',
        icon: '⚔️',
        paragraphs: [
          'Mars in Sagittarius has an explosive but short-lived anger. You flare up dramatically, saying exactly what you think with blunt, unfiltered honesty. Your anger is righteous and principled — you are most triggered by hypocrisy, dishonesty, and willful ignorance.',
          'You fight for ideals rather than personal grievances. Injustice, closed-mindedness, and the suppression of truth provoke your warrior spirit. After the explosion, you cool down quickly and are often surprised by how hurt others are by your blunt words.',
        ],
      },
      {
        title: 'Physical Energy & Sexuality',
        icon: '⚡',
        paragraphs: [
          'Your physical energy is abundant, restless, and needs wide-open spaces. Outdoor activities — hiking, horseback riding, mountain biking, adventure sports — suit your Mars energy perfectly. You need room to roam and challenges that take you out of your comfort zone.',
          'Sexually, Mars in Sagittarius is enthusiastic, adventurous, and playful. You approach physical connection with humor, openness, and a genuine sense of fun. You value honesty and directness in sexual communication and are attracted to partners who share your adventurous spirit.',
        ],
      },
    ],
  },
  capricorn: {
    headline: 'Mars in Capricorn: The Master Strategist',
    intro: 'Mars is exalted in Capricorn, giving this placement extraordinary discipline, strategic brilliance, and an unwavering determination that builds empires. With Mars in Capricorn, you play the long game. You do not waste energy on battles that do not serve your ultimate objectives. Every move is calculated, every effort is purposeful, and every setback is merely a detour on the road to inevitable success.',
    sections: [
      {
        title: 'Drive & Ambition',
        icon: '🏔',
        paragraphs: [
          'Mars in Capricorn is the zodiac\'s supreme strategist. Your ambition is not impulsive or emotional — it is architectural. You see the endpoint clearly, map out every step required to reach it, and then execute with the patience and discipline of a master builder constructing a cathedral.',
          'You are motivated by legacy, achievement, and the respect of people you admire. You want to build something that lasts — a career, a company, a reputation — that stands as evidence of your dedication and competence. You measure success in decades, not days.',
          'You excel in hierarchical environments where hard work and competence are rewarded with advancement. Business, government, military, and institutional leadership roles suit your Mars energy perfectly. You understand power structures and know how to climb them.',
        ],
      },
      {
        title: 'Anger Style & Conflict',
        icon: '⚔️',
        paragraphs: [
          'Mars in Capricorn has a controlled, authoritative anger that commands immediate respect. You do not waste energy on petty conflicts — when you engage in battle, it is because something genuinely important is at stake, and your measured, strategic response makes your displeasure land with significant weight.',
          'You prefer to win through outperformance rather than confrontation. The best revenge, in your estimation, is massive success. You channel anger into productivity, using frustration as fuel for even greater achievement.',
        ],
      },
      {
        title: 'Physical Energy & Sexuality',
        icon: '⚡',
        paragraphs: [
          'Your physical energy is disciplined, enduring, and goal-oriented. You approach fitness the same way you approach career — with clear objectives, structured programs, and measurable progress. Mountain climbing, long-distance running, and any physically demanding sport that rewards perseverance suits you.',
          'Sexually, Mars in Capricorn is controlled, skillful, and surprisingly sensual beneath the reserved exterior. You take your time, you are thorough, and you bring the same dedication to physical pleasure that you bring to everything else. Trust and exclusivity are important to your sexual expression.',
        ],
      },
    ],
  },
  aquarius: {
    headline: 'Mars in Aquarius: The Revolutionary Innovator',
    intro: 'With Mars in Aquarius, your drive is channeled through innovation, social consciousness, and a fierce commitment to progress. You do not fight conventional battles with conventional weapons — you disrupt, innovate, and reimagine the playing field entirely. Your energy is electric, unpredictable, and oriented toward the future.',
    sections: [
      {
        title: 'Drive & Ambition',
        icon: '⚡',
        paragraphs: [
          'Mars in Aquarius pursues goals through unconventional methods and collective action. You are not interested in climbing existing ladders — you want to build entirely new structures. Your ambition is social as much as personal, driven by a genuine desire to improve the systems that shape human life.',
          'You are motivated by intellectual challenge and social impact. Routine work drains you, but give you an impossible problem to solve or a broken system to redesign, and your energy becomes tireless. You thrive in technology, social enterprise, activism, and any field that involves innovation.',
          'You excel when working within groups and communities that share your vision. Your leadership style is collaborative and egalitarian — you inspire through ideas rather than authority, and you genuinely believe that the best solutions emerge from diverse, empowered teams.',
        ],
      },
      {
        title: 'Anger Style & Conflict',
        icon: '⚔️',
        paragraphs: [
          'Mars in Aquarius has a detached, intellectual anger that can be disorienting for more emotionally expressive types. When angry, you become cool, distant, and stubbornly principled. You argue with logic and data, not emotion, and you can maintain your position with an icy calm that infuriates opponents.',
          'You are triggered by injustice, conformity, and the abuse of power. Your anger is most fierce when directed at systems and institutions rather than individuals. You fight for humanity, not just yourself.',
        ],
      },
      {
        title: 'Physical Energy & Sexuality',
        icon: '⚡',
        paragraphs: [
          'Your physical energy comes in unpredictable bursts. You may be sedentary for days, then suddenly possessed by a surge of kinetic energy that demands expression. Team sports, group fitness, and activities with a social or competitive element suit your Mars energy better than solitary exercise.',
          'Sexually, Mars in Aquarius is experimental, cerebral, and values freedom. You are open to unconventional approaches and prioritize intellectual connection alongside physical chemistry. You need a partner who respects your autonomy and is open to exploring together.',
        ],
      },
    ],
  },
  pisces: {
    headline: 'Mars in Pisces: The Intuitive Warrior',
    intro: 'With Mars in Pisces, your drive flows like water — adapting, dissolving obstacles, and finding paths of least resistance rather than charging through walls. Your strength is not conventional aggression but emotional intelligence, creative vision, and an almost psychic ability to sense the right moment to act.',
    sections: [
      {
        title: 'Drive & Ambition',
        icon: '🌊',
        paragraphs: [
          'Mars in Pisces pursues goals through intuition, inspiration, and emotional connection. You are motivated by vision and meaning rather than competition or material reward. Your best work is done when you feel emotionally and spiritually aligned with your purpose.',
          'Your ambition is subtle and often unconscious. You may not set explicit goals the way other Mars signs do, but you are drawn toward your destiny by something deeper than willpower. Your greatest achievements often happen when you surrender control and let your intuition guide your actions.',
          'You excel in creative, healing, and spiritual fields. Music, film, therapy, social work, and any career that allows you to channel emotion into meaningful expression activates your Mars energy in its highest form.',
        ],
      },
      {
        title: 'Anger Style & Conflict',
        icon: '⚔️',
        paragraphs: [
          'Mars in Pisces has the most elusive anger style in the zodiac. You absorb frustration rather than expressing it, which can lead to passive-aggressive behavior, self-sabotage, or emotional withdrawal. Direct confrontation is deeply uncomfortable for you, and you will go to great lengths to avoid it.',
          'When you do engage in conflict, you fight with emotional appeal rather than logical argument. You can make an opponent feel guilty, sad, or sympathetic without ever raising your voice. Your weapon is empathy itself, and it is surprisingly effective.',
        ],
      },
      {
        title: 'Physical Energy & Sexuality',
        icon: '⚡',
        paragraphs: [
          'Your physical energy is fluid and heavily influenced by your emotional state. Water activities, dance, yoga, tai chi, and any movement that feels like flowing rather than fighting suits your Mars energy. You need physical practices that honor your emotional sensitivity rather than overriding it.',
          'Sexually, Mars in Pisces is deeply romantic, emotionally connected, and intuitively responsive. Physical connection is an act of spiritual union for you, and you bring an almost transcendent quality to intimate moments. You need to feel emotionally safe and spiritually connected to fully express yourself.',
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
