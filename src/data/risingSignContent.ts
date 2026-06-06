/* ──────────────────────────────────────────────────────────────
   Rising Sign (Ascendant) Content
   SEO-rich astrological content for all 12 rising sign pages.
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

export interface RisingSignContent {
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

export const RISING_SYMBOL = 'ASC';

/* ── Content for each rising sign ─────────────────────────────── */

const RISING_CONTENT: Record<ZodiacSign, Omit<RisingSignContent, 'sign'>> = {
  aries: {
    headline: 'Aries Rising: The Trailblazer\'s First Impression',
    intro: 'With Aries rising, you enter every room like a spark hitting dry kindling. Your ascendant is ruled by Mars, giving you an unmistakable air of confidence, directness, and physical vitality. People sense your courage before you even speak. You approach life headfirst, and your first impression is one of boldness, independence, and restless energy.',
    sections: [
      {
        title: 'First Impressions & Appearance',
        icon: '👁',
        paragraphs: [
          'Aries rising people tend to have sharp, angular features and an athletic build. There is often something striking about the forehead or brow area. Your movements are quick and decisive — you walk fast, gesture expressively, and rarely stand still for long. People frequently describe you as looking younger than your age.',
          'Your first impression is one of directness and courage. You do not beat around the bush, and people immediately sense that you are someone who takes initiative. In social settings, you are often the one who breaks the ice, introduces yourself first, or suggests the next activity.',
          'There is a competitive edge to your presence that others find either invigorating or intimidating. Even when you are relaxed, there is a coiled energy about you that suggests you are ready to spring into action at any moment.',
        ],
      },
      {
        title: 'Life Approach & Personal Style',
        icon: '🔥',
        paragraphs: [
          'Your rising sign determines how you navigate the world, and Aries rising navigates by charging forward. You approach challenges as opportunities to prove yourself, and you rarely wait for permission before taking action. This pioneering spirit means you are often the first in your friend group to try new things.',
          'Independence is not just a preference for you — it is a core need. You chafe under micromanagement and thrive when given autonomy. Your personal style tends toward bold, athletic, or statement-making choices. You are drawn to red, black, and anything that makes you stand out.',
          'The shadow side of Aries rising is a tendency to be perceived as aggressive or self-centered, even when your intentions are good. Learning to temper your directness with patience and tact is a lifelong growth area, but your authenticity is ultimately one of your greatest gifts.',
        ],
      },
      {
        title: 'How Others Experience You',
        icon: '🤝',
        paragraphs: [
          'People often assume Aries rising individuals are more confident than they actually feel inside. Your ascendant creates a mask of fearlessness that can be both a blessing and a burden. Others look to you for leadership and expect you to take charge, even in situations where you feel uncertain.',
          'In relationships, your Aries rising makes you an exciting and dynamic partner who brings spontaneity and passion. However, people may need time to discover the more vulnerable, emotional layers beneath your bold exterior. Your rising sign is the door, not the whole house.',
        ],
      },
    ],
  },
  taurus: {
    headline: 'Taurus Rising: The Grounded Presence',
    intro: 'With Taurus rising, you radiate calm, sensual stability. Ruled by Venus, your ascendant gives you an earthy magnetism and an aura of reliability that puts people at ease. You move through the world with deliberate grace, and your first impression is one of warmth, strength, and quiet confidence.',
    sections: [
      {
        title: 'First Impressions & Appearance',
        icon: '👁',
        paragraphs: [
          'Taurus rising often bestows a strong, solid build with beautiful features — particularly around the neck and throat. Your face tends toward pleasant, symmetrical proportions, and many Taurus rising people have notably attractive voices. There is a lushness to your appearance that draws people in.',
          'You project an image of dependability and calm. People sense that you are grounded and trustworthy within moments of meeting you. Your presence is soothing rather than electric — you are the person others gravitate toward when they need to feel safe.',
          'Your personal style leans toward quality over quantity. You prefer well-made, comfortable clothing in rich textures and earthy tones. There is often something about your appearance that signals an appreciation for beauty and material comfort.',
        ],
      },
      {
        title: 'Life Approach & Personal Style',
        icon: '🌿',
        paragraphs: [
          'Taurus rising approaches life methodically and sensibly. You build your world piece by piece, prioritizing security and comfort. Rushing is not in your vocabulary — you prefer to do things properly the first time rather than scramble to fix mistakes later.',
          'Your Venus-ruled ascendant gives you a refined aesthetic sensibility. You are drawn to beautiful environments, good food, art, and music. Your home is your sanctuary, and you invest considerable energy into making it a place of comfort and beauty.',
          'The growth edge for Taurus rising is flexibility. You can become so attached to your routines and comfort zones that you resist necessary changes. Learning to trust that stability can coexist with evolution is an important part of your journey.',
        ],
      },
      {
        title: 'How Others Experience You',
        icon: '🤝',
        paragraphs: [
          'People experience Taurus rising as a rock — someone reliable, patient, and pleasantly unhurried. You make others feel comfortable and cared for, often through tangible gestures like cooking a meal, offering a warm hug, or creating a cozy atmosphere.',
          'In relationships, your Taurus rising makes you a devoted and sensual partner. People know where they stand with you, and your consistency is deeply reassuring. However, your stubbornness can sometimes frustrate partners who need more spontaneity or faster adaptation to change.',
        ],
      },
    ],
  },
  gemini: {
    headline: 'Gemini Rising: The Quick-Witted Conversationalist',
    intro: 'With Gemini rising, you sparkle with intellectual curiosity and verbal agility. Ruled by Mercury, your ascendant gives you the gift of communication and a restless, youthful energy that keeps people endlessly engaged. You approach every new encounter as an opportunity to learn something fascinating.',
    sections: [
      {
        title: 'First Impressions & Appearance',
        icon: '👁',
        paragraphs: [
          'Gemini rising people often have youthful, animated faces with expressive eyes and quick smiles. Your hands are particularly active when you speak, and your body language is constantly shifting. You tend to look younger than your years, carrying a Peter Pan quality throughout life.',
          'Your first impression is one of intelligence, wit, and approachability. People immediately sense that you are someone they can talk to about anything. You have a way of making everyone feel interesting, because you are genuinely curious about what makes people tick.',
          'There is often a duality to your appearance — you might dress very differently depending on your mood or the context, and people who know you in different settings may see distinctly different sides of you.',
        ],
      },
      {
        title: 'Life Approach & Personal Style',
        icon: '💨',
        paragraphs: [
          'Gemini rising approaches life as a perpetual student. You collect information, experiences, and connections with voracious appetite. Boredom is your greatest enemy, and you structure your life to ensure there is always something new to learn, someone interesting to talk to, or a fresh perspective to explore.',
          'Your personal style is eclectic and trend-aware. You keep up with what is current and enjoy experimenting with different looks. Books, gadgets, and anything that facilitates communication and learning tend to fill your space.',
          'The challenge for Gemini rising is depth. You can scatter your energy across so many interests that nothing gets fully developed. Learning to commit to a few priorities without feeling trapped is key to your growth.',
        ],
      },
      {
        title: 'How Others Experience You',
        icon: '🤝',
        paragraphs: [
          'People experience Gemini rising as entertaining, knowledgeable, and refreshingly open-minded. You are the life of the dinner party, the person who always has an interesting story or a clever observation. Your social ease makes networking effortless.',
          'In relationships, your Gemini rising brings mental stimulation and variety. Partners are rarely bored with you, but they may sometimes wish for more emotional depth or consistency. The key is finding someone who values your mind as much as you do.',
        ],
      },
    ],
  },
  cancer: {
    headline: 'Cancer Rising: The Nurturing Guardian',
    intro: 'With Cancer rising, you emanate a soft, protective warmth that draws people in like a safe harbor. Ruled by the Moon, your ascendant shifts with your emotional tides, giving you a changeable exterior that conceals remarkable inner strength. People sense your empathy before you say a word.',
    sections: [
      {
        title: 'First Impressions & Appearance',
        icon: '👁',
        paragraphs: [
          'Cancer rising often gives a round, gentle face with large, expressive eyes that seem to absorb everything. Your features tend to be soft and approachable, and there is frequently something maternal or paternal about your presence, regardless of gender. Your body language is protective — crossed arms, leaning in toward people you trust.',
          'Your first impression is one of warmth, sensitivity, and emotional intelligence. People instinctively want to confide in you, sensing that you will listen without judgment. You have an almost psychic ability to read the emotional temperature of a room the moment you enter.',
          'Your appearance may fluctuate with your moods more than other rising signs. When you feel secure, you glow with nurturing warmth. When you feel threatened, you visibly withdraw, pulling your energy inward like a crab retreating into its shell.',
        ],
      },
      {
        title: 'Life Approach & Personal Style',
        icon: '🌊',
        paragraphs: [
          'Cancer rising navigates life through emotional intuition. You make decisions based on how things feel rather than purely logical analysis, and this instinct rarely leads you astray. Home, family, and emotional security are your primary concerns, and you build your life around creating a safe nest for yourself and those you love.',
          'Your personal style tends toward comfortable, cozy, and nostalgic. You are drawn to soft fabrics, silver jewelry, and colors that evoke the ocean or moonlight. Your home is filled with mementos, family photos, and objects that carry emotional significance.',
          'The growth area for Cancer rising is learning to step outside your comfort zone without feeling existentially threatened. Your protective instincts can become limiting if you never allow yourself to be vulnerable in unfamiliar territory.',
        ],
      },
      {
        title: 'How Others Experience You',
        icon: '🤝',
        paragraphs: [
          'People experience Cancer rising as deeply caring and emotionally perceptive. You are the friend who remembers birthdays, notices when someone is upset, and shows up with soup when someone is sick. Your emotional generosity is genuine and deeply valued by those in your inner circle.',
          'In relationships, your Cancer rising makes you a devoted, nurturing partner who creates deep emotional bonds. Partners feel genuinely cared for and protected. The challenge is ensuring your caretaking does not become smothering, and that you allow your partner to take care of you in return.',
        ],
      },
    ],
  },
  leo: {
    headline: 'Leo Rising: The Radiant Showstopper',
    intro: 'With Leo rising, you command attention simply by existing. Ruled by the Sun, your ascendant gives you a luminous presence, natural charisma, and an unmistakable sense of personal dignity. You walk into a room and the energy shifts — people notice you, and you were born to be noticed.',
    sections: [
      {
        title: 'First Impressions & Appearance',
        icon: '👁',
        paragraphs: [
          'Leo rising often bestows a regal bearing and a mane-like quality to the hair — thick, dramatic, or styled with intention. Your posture tends to be upright and proud, and there is a warmth in your smile that feels like sunshine. Your eyes often have a sparkle that suggests you know something delightful.',
          'Your first impression is magnetic and confident. People are drawn to your warmth, your generosity of spirit, and your ability to make others feel special. There is a theatrical quality to your presence — even casual conversations feel like events when Leo rising is holding court.',
          'You dress to impress, gravitating toward bold colors, gold accents, and statement pieces. Your personal style communicates that you take yourself seriously and expect others to do the same. Even in casual settings, you look put together.',
        ],
      },
      {
        title: 'Life Approach & Personal Style',
        icon: '☀️',
        paragraphs: [
          'Leo rising approaches life as a creative performance. You want to leave your mark, to be remembered, and to bring joy to those around you. Your natural leadership is not aggressive — it is more like the Sun, which does not force the planets to orbit it but draws them in through sheer gravitational pull.',
          'Generosity is central to your identity. You give lavishly of your time, attention, and resources, and you expect loyalty and appreciation in return. Your home tends to be a gathering place — you love hosting and creating experiences for the people you care about.',
          'The growth edge for Leo rising is learning that you do not need external validation to be worthy. When your sense of self depends entirely on how others perceive you, you become vulnerable to flattery and devastated by criticism.',
        ],
      },
      {
        title: 'How Others Experience You',
        icon: '🤝',
        paragraphs: [
          'People experience Leo rising as warm, confident, and genuinely interested in making everyone around them feel valued. You have a gift for lifting spirits and creating celebratory energy in any gathering. Your natural authority means people often defer to you without being asked.',
          'In relationships, Leo rising brings passion, devotion, and grand romantic gestures. Partners feel adored and cherished. The challenge is ensuring the relationship does not become one-sided — Leo rising needs to be equally willing to step out of the spotlight and celebrate their partner.',
        ],
      },
    ],
  },
  virgo: {
    headline: 'Virgo Rising: The Thoughtful Observer',
    intro: 'With Virgo rising, you present a composed, intelligent, and quietly capable exterior. Ruled by Vesta, your ascendant gives you a meticulous attention to detail, a service-oriented nature, and an understated elegance that reveals itself in the precision of everything you do.',
    sections: [
      {
        title: 'First Impressions & Appearance',
        icon: '👁',
        paragraphs: [
          'Virgo rising often gives clean, well-proportioned features with an overall neat, put-together appearance. Your eyes are observant and analytical, scanning details that others miss. Your build tends toward slim and compact, and your posture reflects a quiet, self-contained composure.',
          'Your first impression is one of intelligence, competence, and modesty. People sense that you have your life organized and that you pay attention to the small things that make a big difference. You may come across as reserved at first, but this is careful observation, not coldness.',
          'Your personal style is refined and practical. You prefer well-fitting, quality garments in muted, sophisticated tones. Cleanliness and grooming are important to you — you notice when something is out of place, and you take care to present yourself thoughtfully.',
        ],
      },
      {
        title: 'Life Approach & Personal Style',
        icon: '🌾',
        paragraphs: [
          'Virgo rising approaches life as a series of systems to be improved. You are constantly analyzing, refining, and optimizing everything from your daily routine to your relationships. This is not neurotic perfectionism — it is a genuine devotion to excellence and service.',
          'Ruled by Vesta, the asteroid of sacred dedication, your rising sign carries an almost devotional quality. You approach your work, your health, and your commitments with the focused intensity of someone tending a sacred flame. When you commit to something, you give it your absolute best.',
          'The growth area for Virgo rising is learning to accept imperfection — in yourself, in others, and in life. Your analytical mind can become a source of anxiety when you cannot control every variable, and relaxing your standards occasionally is essential for your wellbeing.',
        ],
      },
      {
        title: 'How Others Experience You',
        icon: '🤝',
        paragraphs: [
          'People experience Virgo rising as reliable, thoughtful, and genuinely helpful. You are the person who notices when someone needs assistance and offers it quietly, without fanfare. Your competence inspires trust, and people rely on you to handle details and solve problems.',
          'In relationships, Virgo rising shows love through acts of service and attention to detail. Partners feel cared for in practical, tangible ways. The challenge is allowing yourself to receive help as easily as you give it, and trusting that your partner does not need you to be flawless.',
        ],
      },
    ],
  },
  libra: {
    headline: 'Libra Rising: The Graceful Diplomat',
    intro: 'With Libra rising, you enter the world wrapped in charm, elegance, and an instinctive sense of social harmony. Ruled by Juno, the asteroid of committed partnership, your ascendant gives you a natural grace, a beautiful aesthetic sensibility, and an almost magnetic pull toward creating balance in every interaction.',
    sections: [
      {
        title: 'First Impressions & Appearance',
        icon: '👁',
        paragraphs: [
          'Libra rising is often considered one of the most physically attractive ascendant placements. You tend to have symmetrical, pleasing features with an overall sense of proportion and balance. Your smile is your secret weapon — it is warm, inviting, and genuinely disarming.',
          'Your first impression is one of elegance, sociability, and refinement. People immediately feel comfortable around you because you have an innate talent for putting others at ease. You instinctively mirror the energy of the person you are talking to, creating an effortless rapport.',
          'Your personal style is polished and aesthetically considered. You have a natural eye for color, proportion, and beauty, and your appearance reflects this. You tend toward classic, harmonious looks rather than anything too jarring or extreme.',
        ],
      },
      {
        title: 'Life Approach & Personal Style',
        icon: '⚖️',
        paragraphs: [
          'Libra rising approaches life through the lens of relationship and balance. You define yourself in part through your connections with others, and you are always seeking the midpoint between competing perspectives. This diplomatic instinct makes you a natural mediator and peacekeeper.',
          'Ruled by Juno, the asteroid of sacred partnership, your ascendant carries a deep drive toward meaningful, committed relationships. You are not interested in superficial connections — you seek partnerships that are truly equal, mutually respectful, and built to last.',
          'The growth area for Libra rising is learning to tolerate conflict and make decisions without excessive deliberation. Your desire for harmony can lead to people-pleasing or avoidance of necessary confrontations. True balance sometimes requires the courage to rock the boat.',
        ],
      },
      {
        title: 'How Others Experience You',
        icon: '🤝',
        paragraphs: [
          'People experience Libra rising as charming, fair-minded, and socially graceful. You are the person everyone wants at their dinner party because you make conversation flow and ensure no one feels left out. Your social intelligence is a genuine gift that creates harmony wherever you go.',
          'In relationships, Libra rising brings romance, partnership, and a deep commitment to fairness. Partners feel valued and seen. The challenge is ensuring that your desire for peace does not lead you to suppress your own needs — a balanced relationship requires honest expression from both sides.',
        ],
      },
    ],
  },
  scorpio: {
    headline: 'Scorpio Rising: The Magnetic Enigma',
    intro: 'With Scorpio rising, you radiate intensity, mystery, and a penetrating depth that both fascinates and intimidates. Ruled by Pluto, your ascendant gives you transformative power, psychological insight, and an aura of quiet authority that commands respect without demanding it.',
    sections: [
      {
        title: 'First Impressions & Appearance',
        icon: '👁',
        paragraphs: [
          'Scorpio rising is known for piercing, magnetic eyes that seem to see through people. Your gaze is intense and unwavering, and it can make others feel simultaneously drawn in and exposed. Your features tend toward strong and angular, with an overall aura of power that transcends physical appearance.',
          'Your first impression is one of depth, mystery, and quiet control. People sense that you are observing far more than you reveal, and this creates an almost irresistible intrigue. You rarely need to speak loudly to command attention — your presence alone fills the space.',
          'Your personal style tends toward dark colors, clean lines, and an understated intensity. You prefer quality and impact over quantity, and there is often something about your appearance that suggests hidden depths — like an iceberg where only the tip is visible.',
        ],
      },
      {
        title: 'Life Approach & Personal Style',
        icon: '🦅',
        paragraphs: [
          'Scorpio rising approaches life as a continuous process of transformation. You are not interested in surface-level existence — you want to understand the hidden mechanisms, the psychology, the power dynamics beneath every situation. This gives you a strategic mind that is several moves ahead of most people.',
          'Trust is everything to you. You reveal yourself slowly and selectively, testing people before allowing them into your inner world. Once someone earns your trust, however, your loyalty is absolute and your willingness to go to bat for them is extraordinary.',
          'The growth edge for Scorpio rising is learning to release control and trust the process. Your need to manage every outcome can become exhausting and isolating. True power includes the strength to be vulnerable and the wisdom to accept what you cannot change.',
        ],
      },
      {
        title: 'How Others Experience You',
        icon: '🤝',
        paragraphs: [
          'People experience Scorpio rising as fascinating, intense, and impossible to read. You may be perceived as intimidating even when you are feeling friendly, simply because your energy is so concentrated. Those who take the time to earn your trust discover a fiercely loyal, deeply emotional, and profoundly insightful person.',
          'In relationships, Scorpio rising brings passion, depth, and total commitment. Partners experience a bond that is transformative and all-encompassing. The challenge is balancing your need for emotional intensity with your partner\'s need for lightness and space.',
        ],
      },
    ],
  },
  sagittarius: {
    headline: 'Sagittarius Rising: The Eternal Explorer',
    intro: 'With Sagittarius rising, you burst into the world with infectious optimism, boundless enthusiasm, and an insatiable hunger for adventure. Ruled by Jupiter, your ascendant gives you expansive energy, philosophical depth, and a larger-than-life presence that makes everything feel like a grand adventure.',
    sections: [
      {
        title: 'First Impressions & Appearance',
        icon: '👁',
        paragraphs: [
          'Sagittarius rising often gives a tall, athletic build with open, expressive features and a wide, genuine smile. Your body language is expansive — you gesture broadly, laugh loudly, and take up space unapologetically. There is something about your energy that feels free and untamed.',
          'Your first impression is one of warmth, humor, and intellectual curiosity. People immediately sense your openness and your genuine interest in the world around you. You make friends easily because you approach everyone with the assumption that they have something interesting to teach you.',
          'Your personal style is casual, adventurous, and often multicultural. You collect pieces from your travels and experiences, creating a look that tells a story. Comfort is important — you need to be able to move freely in whatever you wear.',
        ],
      },
      {
        title: 'Life Approach & Personal Style',
        icon: '🏹',
        paragraphs: [
          'Sagittarius rising approaches life as an endless horizon to be explored. You are driven by meaning, truth, and the desire to understand the big picture. Whether through travel, education, philosophy, or spirituality, you are always seeking to expand your understanding of life.',
          'Your Jupiter-ruled ascendant gives you natural luck and an ability to land on your feet. You take risks that would terrify other people, and somehow things tend to work out for you. This is not recklessness — it is a deep faith in the fundamental goodness of the universe.',
          'The growth area for Sagittarius rising is follow-through. Your enthusiasm for new horizons can mean you abandon projects, relationships, or commitments when they become routine. Learning to find the adventure within commitment is your path to maturity.',
        ],
      },
      {
        title: 'How Others Experience You',
        icon: '🤝',
        paragraphs: [
          'People experience Sagittarius rising as inspiring, honest, and hilariously entertaining. You are the friend who convinces everyone to take the road trip, try the exotic food, or consider a perspective they have never imagined. Your optimism is genuinely contagious.',
          'In relationships, Sagittarius rising brings adventure, growth, and intellectual companionship. Partners feel like they are on a journey together. The challenge is ensuring that your need for freedom does not translate into emotional unavailability or a fear of settling down.',
        ],
      },
    ],
  },
  capricorn: {
    headline: 'Capricorn Rising: The Ambitious Strategist',
    intro: 'With Capricorn rising, you project an image of maturity, competence, and quiet authority that belies your years. Ruled by Saturn, your ascendant gives you a disciplined exterior, a dry wit, and an unwavering determination that earns respect in every arena you enter.',
    sections: [
      {
        title: 'First Impressions & Appearance',
        icon: '👁',
        paragraphs: [
          'Capricorn rising often gives a lean, angular bone structure with serious, watchful eyes. You tend to look older than your years when young and younger when older — a classic Saturnian reversal. Your posture is upright and controlled, and your overall bearing communicates authority and self-discipline.',
          'Your first impression is one of competence, reserve, and quiet ambition. People sense that you are someone who takes life seriously and has clear goals. You may come across as unapproachable at first, but this is simply your natural caution rather than unfriendliness.',
          'Your personal style is classic, professional, and understated. You prefer dark, structured clothing and quality accessories. Your appearance communicates that you are someone to be taken seriously — you dress for the position you want, not the one you have.',
        ],
      },
      {
        title: 'Life Approach & Personal Style',
        icon: '🏔',
        paragraphs: [
          'Capricorn rising approaches life as a mountain to be climbed — methodically, persistently, and with clear-eyed awareness of the obstacles ahead. You set long-term goals and work toward them with a patience and discipline that most people cannot sustain. For you, the journey is as important as the destination.',
          'Saturn rules your ascendant, giving you a strong sense of duty, responsibility, and structure. You feel most comfortable when there are clear rules, expectations, and hierarchies. This does not make you rigid — it makes you effective. You understand that freedom without structure is chaos.',
          'The growth area for Capricorn rising is learning to relax and enjoy the present moment without worrying about the future. Your planning mind can become a source of anxiety when you focus too much on what could go wrong. Allowing yourself pleasure and play is essential for your wellbeing.',
        ],
      },
      {
        title: 'How Others Experience You',
        icon: '🤝',
        paragraphs: [
          'People experience Capricorn rising as reliable, wise, and quietly commanding. You are the person others turn to for practical advice and steady leadership. Your dry humor surprises people who initially mistake your seriousness for humorlessness — the Capricorn wit is one of the zodiac\'s best-kept secrets.',
          'In relationships, Capricorn rising brings stability, loyalty, and a deep commitment to building something lasting. Partners feel secure and protected. The challenge is letting your emotional walls down enough to allow true intimacy — vulnerability does not diminish your strength.',
        ],
      },
    ],
  },
  aquarius: {
    headline: 'Aquarius Rising: The Visionary Original',
    intro: 'With Aquarius rising, you arrive in the world as a breath of fresh air — unconventional, intellectually electric, and impossible to categorize. Ruled by Uranus, your ascendant gives you a futuristic outlook, humanitarian instincts, and a unique personal style that refuses to follow anyone else\'s script.',
    sections: [
      {
        title: 'First Impressions & Appearance',
        icon: '👁',
        paragraphs: [
          'Aquarius rising often gives a distinctive, unusual appearance that is difficult to pin down. There is frequently something striking about your look — perhaps an unusual fashion sense, a memorable facial feature, or an energy that simply feels different. Your eyes have a faraway quality, as though you are tuned into a frequency others cannot hear.',
          'Your first impression is one of originality, intelligence, and friendly detachment. People sense that you march to your own drum and that you are genuinely uninterested in conformity. This can be both appealing and slightly alienating, depending on the audience.',
          'Your personal style is eclectic, experimental, and often ahead of its time. You are drawn to unusual colors, asymmetric designs, and anything that disrupts expectations. Technology and futuristic aesthetics often play a role in your personal brand.',
        ],
      },
      {
        title: 'Life Approach & Personal Style',
        icon: '⚡',
        paragraphs: [
          'Aquarius rising approaches life as a social experiment. You are interested in how systems work, how communities function, and how humanity can evolve. Your perspective is broad and future-oriented, and you often see possibilities that others will not recognize for years.',
          'Your Uranus-ruled ascendant gives you a rebellious streak that is less about defiance and more about authenticity. You cannot pretend to be something you are not, and you are deeply uncomfortable with social pressure to conform. Your independence is not selfish — it is principled.',
          'The growth area for Aquarius rising is emotional connection. Your comfort with ideas and abstractions can sometimes come at the expense of intimate, heart-to-heart relating. Learning to drop from your head into your heart is key to deepening your relationships.',
        ],
      },
      {
        title: 'How Others Experience You',
        icon: '🤝',
        paragraphs: [
          'People experience Aquarius rising as fascinating, eccentric, and refreshingly honest. You are the friend who introduces everyone to new ideas, challenges assumptions, and refuses to participate in groupthink. Your social circle is usually diverse and unconventional.',
          'In relationships, Aquarius rising brings intellectual partnership, freedom, and a truly egalitarian dynamic. Partners feel respected as individuals. The challenge is ensuring that your need for independence does not create emotional distance — love requires presence, not just principles.',
        ],
      },
    ],
  },
  pisces: {
    headline: 'Pisces Rising: The Intuitive Dreamer',
    intro: 'With Pisces rising, you move through the world like water — fluid, empathic, and deeply attuned to the invisible currents that most people cannot sense. Ruled by Neptune, your ascendant gives you a dreamlike quality, artistic sensitivity, and a compassion so vast it sometimes overwhelms you.',
    sections: [
      {
        title: 'First Impressions & Appearance',
        icon: '👁',
        paragraphs: [
          'Pisces rising often gives soft, dreamy features with large, soulful eyes that seem to hold oceans of feeling. Your gaze is gentle and slightly unfocused, as though you are seeing beyond the physical world. Your build tends to be fluid and graceful, and your movements have an almost otherworldly quality.',
          'Your first impression is one of gentleness, sensitivity, and mystery. People feel an immediate emotional connection with you, sensing that you understand their feelings on a level that defies explanation. You absorb the energy of your environment like a sponge, which is both a gift and a vulnerability.',
          'Your personal style is romantic, fluid, and often inspired by art, music, or fantasy. You are drawn to flowing fabrics, ocean colors, and anything that feels ethereal or otherworldly. Your appearance may shift dramatically depending on your mood and the company you keep.',
        ],
      },
      {
        title: 'Life Approach & Personal Style',
        icon: '🌊',
        paragraphs: [
          'Pisces rising approaches life through intuition and feeling rather than logic and planning. You navigate by sensing the current beneath the surface, trusting your instincts even when you cannot articulate why. This makes you remarkably perceptive but sometimes difficult for more rational types to understand.',
          'Your Neptune-ruled ascendant gives you a rich inner world of imagination, creativity, and spiritual sensitivity. You are drawn to art, music, healing, and anything that connects you to the transcendent. The mundane details of everyday life can feel burdensome to you.',
          'The growth area for Pisces rising is boundaries. Your empathy and openness can leave you vulnerable to energy vampires, codependent relationships, and escapist tendencies. Learning to protect your energy without closing your heart is your lifelong practice.',
        ],
      },
      {
        title: 'How Others Experience You',
        icon: '🤝',
        paragraphs: [
          'People experience Pisces rising as compassionate, artistic, and deeply intuitive. You are the friend who always knows when something is wrong, who creates beauty wherever you go, and who offers unconditional acceptance. Your emotional generosity is a rare and precious gift.',
          'In relationships, Pisces rising brings soul-level connection, romantic idealism, and a depth of empathy that makes partners feel truly seen. The challenge is maintaining your own identity within the relationship — you can lose yourself in your partner\'s needs and forget your own.',
        ],
      },
    ],
  },
};

/* ── Lookup function ──────────────────────────────────────────── */

export function getRisingSignContent(sign: ZodiacSign): RisingSignContent {
  const data = RISING_CONTENT[sign];
  return { sign, ...data };
}
