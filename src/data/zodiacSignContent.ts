/* ──────────────────────────────────────────────────────────────
   Zodiac Sign Profile Content
   Comprehensive, SEO-rich astrological content for all 12
   Sun sign profile pages.
   ────────────────────────────────────────────────────────────── */

import {
  type ZodiacSign,
  type Element,
  type Modality,
  SIGNS,
  ALL_SIGN_KEYS,
  getElementColor,
} from './compatibilityContent';

export { ALL_SIGN_KEYS, SIGNS, getElementColor };
export type { ZodiacSign, Element, Modality };

/* ── Extended sign profile type ──────────────────────────────── */

export interface ZodiacSignProfile {
  sign: ZodiacSign;
  name: string;
  glyph: string;
  element: Element;
  modality: Modality;
  ruler: string;
  dates: string;
  personalityTraits: string[];
  strengths: string[];
  weaknesses: string[];
  loveStyle: string[];
  careerStrengths: string[];
  famousPeople: string[];
  bestMatches: ZodiacSign[];
  challengingMatches: ZodiacSign[];
  shadowSide: string;
  lifePurpose: string;
  elementDescription: string;
  sections: {
    title: string;
    icon: string;
    paragraphs: string[];
  }[];
}

/* ── Full content for each sign ──────────────────────────────── */

const SIGN_PROFILES: Record<ZodiacSign, Omit<ZodiacSignProfile, 'sign' | 'name' | 'glyph' | 'element' | 'modality' | 'ruler' | 'dates'>> = {
  aries: {
    personalityTraits: ['bold', 'passionate', 'competitive', 'direct', 'courageous', 'energetic', 'pioneering', 'spontaneous', 'confident', 'independent'],
    strengths: ['Natural leadership ability', 'Fearless initiative', 'Infectious enthusiasm', 'Honest and straightforward', 'Resilient under pressure', 'Quick decision-making'],
    weaknesses: ['Impatient with slower processes', 'Can be confrontational', 'Difficulty finishing what they start', 'Prone to burnout from overextension'],
    loveStyle: [
      'Aries falls in love fast and hard. They are the zodiac\'s initiators, and in romance this translates to bold pursuits, dramatic gestures, and an unmistakable intensity that sweeps their partners off their feet. When an Aries is interested, you will know it immediately.',
      'In a committed relationship, Aries needs a partner who can match their fire without trying to contain it. They crave excitement, spontaneity, and a healthy dose of playful competition. The worst thing for an Aries in love is boredom.',
      'Their love language tends toward physical affection and acts of devotion. An Aries will fight for you, show up for you, and champion your dreams with the same ferocity they bring to their own ambitions.',
    ],
    careerStrengths: [
      'Aries thrives in environments that reward initiative, speed, and courage. They are natural entrepreneurs, trailblazers, and team leaders who excel when they can set the pace. Careers in business, athletics, emergency services, and pioneering fields all suit the Aries temperament.',
      'Their greatest professional asset is their ability to take action when others hesitate. Aries doesn\'t need permission to lead, and their confidence inspires teams to follow. They perform best with autonomy and clear goals, and they struggle in rigid hierarchies that stifle their independence.',
    ],
    famousPeople: ['Lady Gaga', 'Robert Downey Jr.', 'Mariah Carey', 'Chance the Rapper', 'Emma Watson', 'Leonardo da Vinci'],
    bestMatches: ['leo', 'sagittarius', 'aquarius'],
    challengingMatches: ['cancer', 'capricorn', 'virgo'],
    shadowSide: 'The Aries shadow emerges as recklessness and selfishness. When operating from their lower expression, Aries can become so focused on their own desires that they bulldoze through other people\'s feelings. Their impatience can morph into aggression, and their confidence can curdle into arrogance. The challenge for Aries is learning that true strength includes the courage to slow down, listen, and consider the impact of their actions on others.',
    lifePurpose: 'Aries is here to learn that courage and compassion are not opposites. Their soul lesson involves channeling their fierce warrior energy in service of something greater than personal glory. The evolved Aries becomes a champion for others, using their boldness to defend, inspire, and blaze trails that everyone can follow.',
    elementDescription: 'As a fire sign, Aries embodies the spark of creation itself. Fire energy is active, transformative, and impossible to ignore. It gives Aries their characteristic warmth, their drive, and their need to express themselves fully. Like a flame, Aries illuminates and warms everything they touch, but without awareness, they can also burn.',
    sections: [
      {
        title: 'Personality Overview',
        icon: '🔥',
        paragraphs: [
          'Aries is the first sign of the zodiac, and they carry all the energy of a new beginning. Ruled by Mars, the planet of action and desire, Aries approaches life as a series of challenges to be conquered. They are the initiators, the ones who charge ahead while others are still deliberating. This cardinal fire energy makes them natural leaders who inspire through sheer force of will.',
          'At their core, Aries is driven by an almost primal need to prove themselves. Not because they doubt their worth, but because testing their limits is how they feel most alive. They are at their best when they are breaking new ground, whether that means starting a business, mastering a skill, or defending someone who cannot defend themselves.',
          'Aries possess a disarming honesty that can be both refreshing and confronting. They say what they mean and mean what they say, and they have little patience for passive-aggressive behavior or hidden agendas. What you see with Aries is what you get, and there is a deep integrity in that directness.',
          'There is also a childlike quality to Aries that persists throughout their lives. They maintain a sense of wonder, a willingness to try things for the first time, and an enthusiasm that makes them genuinely exciting to be around. Even in their 80s, an Aries retains that spark of youthful energy that defines their sign.',
        ],
      },
      {
        title: 'In Love & Relationships',
        icon: '💕',
        paragraphs: [
          'When Aries falls in love, it is an all-consuming experience. They pursue their partners with the same intensity they bring to everything else in life, and the early stages of an Aries romance are often exhilarating. Grand gestures, surprise adventures, and an almost overwhelming level of attention are par for the course.',
          'Aries needs a partner who is their equal, not their subordinate. They are attracted to strength, independence, and confidence. A partner who can stand their ground during disagreements while maintaining mutual respect earns Aries\' deepest admiration. They have no interest in someone who simply agrees with everything they say.',
          'The challenge in Aries relationships is sustaining momentum past the initial spark. Aries thrives on novelty and can become restless if a relationship falls into too predictable a routine. The mature Aries learns to find excitement within commitment, discovering that true intimacy requires the courage to be vulnerable.',
          'Physically, Aries is passionate and direct. They express love through action, touch, and shared adventures. Date nights with Aries are rarely boring, and they bring a playful competitive energy even to romance.',
        ],
      },
      {
        title: 'Career & Purpose',
        icon: '🚀',
        paragraphs: [
          'Aries was born to lead, and they are at their professional best when they can set the vision and drive toward it with minimal interference. Traditional nine-to-five environments rarely contain their energy for long. They need roles that offer autonomy, challenge, and visible results.',
          'Entrepreneurship is a natural fit for Aries. Their willingness to take risks, combined with their ability to execute quickly, makes them formidable founders and innovators. They are the ones who turn ideas into reality while others are still writing business plans.',
          'In team environments, Aries excels as the person who kicks projects into motion. They are the crisis leaders, the ones you want in charge when things need to happen fast. Their decisiveness and confidence under pressure are genuine assets in high-stakes situations.',
          'The career pitfall for Aries is burning bridges through impatience or stepping on toes in their rush to achieve. The wisest Aries learns that sustainable success requires building alliances, not just winning battles.',
        ],
      },
      {
        title: 'Strengths & Gifts',
        icon: '✨',
        paragraphs: [
          'Aries brings an irreplaceable energy to every room they enter. Their greatest gift is the ability to initiate, to take the first step when everyone else is frozen by uncertainty. In a world that often rewards caution, Aries reminds us that nothing changes without someone brave enough to act first.',
          'Their courage is not limited to physical bravery. Aries shows moral courage by speaking uncomfortable truths, standing up for underdogs, and refusing to pretend things are fine when they are not. This honesty, while sometimes blunt, is a rare and valuable quality.',
          'Aries also possesses a remarkable capacity for resilience. They bounce back from failures that would permanently discourage other signs. Each setback is processed quickly and converted into fuel for the next attempt. This resilience is infectious and makes Aries an inspiring presence in the lives of those around them.',
        ],
      },
      {
        title: 'Shadow & Growth',
        icon: '🌑',
        paragraphs: [
          'Every sign has its shadow, and for Aries, it lives in the territory of selfishness and recklessness. When Aries is operating unconsciously, their drive to win can override their empathy. They may push forward with their plans without stopping to consider the cost to others.',
          'Anger is Aries\' primary shadow emotion. As a Mars-ruled sign, they experience anger more intensely and more frequently than most. The immature Aries expresses this as aggression, impulsivity, or a hair-trigger temper. The growth path involves learning to channel anger constructively, recognizing it as useful information rather than an excuse for destructive behavior.',
          'The deepest growth opportunity for Aries involves developing patience and emotional intelligence. Learning to sit with discomfort, to listen before reacting, and to consider the long game rather than just the immediate victory represents the evolution from warrior to wise leader.',
          'Aries grows most when they encounter situations that cannot be solved by force alone. Relationships that require compromise, projects that demand sustained effort over years, and challenges that test their emotional depth rather than their physical courage all serve as catalysts for Aries\' evolution.',
        ],
      },
      {
        title: 'Compatibility Quick Guide',
        icon: '💫',
        paragraphs: [
          'Aries finds their easiest connections with fellow fire signs Leo and Sagittarius. These relationships are fueled by mutual enthusiasm, shared energy levels, and an instinctive understanding of each other\'s need for independence and adventure. With Leo, there is a regal power couple energy. With Sagittarius, there is boundless exploration and philosophical spark.',
          'Air signs, particularly Aquarius and Gemini, offer Aries stimulating intellectual companionship. Aquarius matches Aries\' independence and brings a visionary quality that fascinates the Ram. Gemini keeps Aries mentally engaged with their quick wit and versatility.',
          'The more challenging matches for Aries tend to be with Cancer and Capricorn. Cancer\'s emotional depth and need for security can feel like a cage to freedom-loving Aries, while Capricorn\'s measured approach to life can frustrate the Ram\'s desire for immediate action. These pairings can work beautifully with maturity but require genuine effort from both sides.',
        ],
      },
    ],
  },

  taurus: {
    personalityTraits: ['steadfast', 'sensual', 'loyal', 'patient', 'grounded', 'artistic', 'determined', 'reliable', 'pleasure-seeking', 'practical'],
    strengths: ['Unwavering dependability', 'Exceptional patience', 'Strong aesthetic sense', 'Financial acumen', 'Deep loyalty', 'Calming presence'],
    weaknesses: ['Stubborn resistance to change', 'Possessiveness in relationships', 'Tendency toward overindulgence', 'Slow to forgive', 'Materialistic tendencies'],
    loveStyle: [
      'Taurus does not rush into love. They build it slowly, brick by brick, testing the foundation at every stage. When a Taurus finally commits, they are in it for life. Their love is expressed through tangible acts: cooking a meal, creating a beautiful home, holding you close in comfortable silence.',
      'Physical touch is essential for Taurus. They experience love through their senses, and intimacy for them is as much about the quality of the sheets, the scent of their partner\'s skin, and the taste of a shared meal as it is about emotional connection.',
      'Taurus needs security and consistency in love. They are not interested in dramatic on-again, off-again dynamics. They want a partner who shows up reliably, who values building something lasting, and who can appreciate the quiet beauty of a life well-shared.',
    ],
    careerStrengths: [
      'Taurus excels in careers that combine creativity with tangible results. They are the master builders of the zodiac, capable of taking a vision and grounding it into physical reality. Finance, real estate, culinary arts, agriculture, music, and design all align with Taurus energy.',
      'Their greatest professional strength is endurance. While other signs may chase the next shiny opportunity, Taurus plants themselves and grows deep roots. They build wealth steadily, develop expertise through patient practice, and create businesses or careers that stand the test of time.',
    ],
    famousPeople: ['Adele', 'Dwayne Johnson', 'Queen Elizabeth II', 'David Beckham', 'Lizzo', 'William Shakespeare'],
    bestMatches: ['virgo', 'capricorn', 'cancer'],
    challengingMatches: ['aquarius', 'leo', 'sagittarius'],
    shadowSide: 'The Taurus shadow manifests as stubbornness that becomes immovability. When threatened or insecure, Taurus can become possessive, controlling, and resistant to any change, even change that would benefit them. Their love of comfort can slide into laziness and overindulgence, and their natural patience can calcify into passive resistance that frustrates everyone around them.',
    lifePurpose: 'Taurus is here to learn that true security comes from within, not from material accumulation. Their soul lesson involves discovering that change is not the enemy of stability but its natural partner. The evolved Taurus builds lasting value while remaining flexible enough to grow, understanding that the most beautiful things in life cannot be owned.',
    elementDescription: 'As an earth sign, Taurus is deeply connected to the physical world. Earth energy is stabilizing, productive, and sensory. It gives Taurus their groundedness, their appreciation for beauty, and their ability to create tangible results from abstract ideas. Like fertile soil, Taurus nurtures and sustains whatever is planted in their care.',
    sections: [
      {
        title: 'Personality Overview',
        icon: '🌿',
        paragraphs: [
          'Taurus is the zodiac\'s anchor. Ruled by Venus, the planet of love and beauty, Taurus moves through life with a deliberate grace that is both calming and commanding. They are not in a hurry, and their refusal to be rushed is not laziness but a deep understanding that good things take time to grow.',
          'At their core, Taurus is motivated by a desire for security and beauty. They want to build a life that is both stable and aesthetically pleasing, and they are willing to put in the sustained effort required to achieve it. This is the sign that plants an orchard knowing they will wait years for fruit.',
          'Taurus possesses an extraordinary capacity for presence. While other signs are racing toward the next goal, Taurus is fully inhabiting the current moment. They notice textures, flavors, sounds, and colors that others rush past. This sensory awareness gives them a rich inner life and a genuine talent for appreciating what they already have.',
          'There is a quiet power to Taurus that should never be underestimated. They may not be the loudest voice in the room, but their determination is legendary. Once a Taurus decides on a course of action, very little in this world can change their mind. This fixity can be their greatest strength or their most frustrating quality, depending on whether they are holding onto the right things.',
        ],
      },
      {
        title: 'In Love & Relationships',
        icon: '💕',
        paragraphs: [
          'Love for Taurus is not an abstract concept. It is something they can touch, taste, and build. They express devotion through physical affection, shared meals, and creating a home that feels like a sanctuary. A Taurus partner will remember your favorite comfort food, invest in quality bedding, and make your shared space feel like a refuge from the world.',
          'Taurus is deeply loyal and expects the same in return. They are not interested in casual connections or keeping their options open. Once committed, they give their whole heart and become fiercely protective of the relationship. Betrayal is the one thing a Taurus struggles to forgive.',
          'The challenge in loving a Taurus is their resistance to change. They can become set in their routines and resistant to the natural evolution that relationships require. A partner who needs constant novelty or who pushes Taurus to change too quickly will meet the legendary Bull stubbornness.',
          'Physical intimacy is central to Taurus relationships. They are among the most sensual signs in the zodiac, and they approach physical connection with the same patience and attention to quality that they bring to everything else. Rushed or mechanical intimacy holds no appeal for them.',
        ],
      },
      {
        title: 'Career & Purpose',
        icon: '🏗️',
        paragraphs: [
          'Taurus approaches their career with the same patience and determination they bring to everything else. They are not interested in get-rich-quick schemes or volatile industries. They build their professional lives methodically, developing expertise over years and decades.',
          'Careers that engage the senses are ideal for Taurus. Chefs, musicians, designers, architects, winemakers, and artisans of all kinds often have strong Taurus placements. They have a natural eye for beauty and a commitment to quality that elevates their work above the merely competent.',
          'Financial security is a primary motivator for Taurus in their career. They are naturally skilled with money, understanding intuitively that wealth is built through consistent effort and smart decisions rather than dramatic gambles. Many of the zodiac\'s most successful long-term investors are Taurus.',
          'The professional pitfall for Taurus is staying in a comfortable but unfulfilling position for too long. Their love of security can keep them in roles they have outgrown, and their resistance to change can prevent them from taking the career leaps that would serve their growth.',
        ],
      },
      {
        title: 'Strengths & Gifts',
        icon: '✨',
        paragraphs: [
          'Taurus brings stability and beauty to a chaotic world. Their greatest gift is the ability to create lasting value, whether that means building a business, a home, a relationship, or a work of art. In a culture addicted to speed and disposability, Taurus reminds us of the beauty of permanence.',
          'Their patience is a genuine superpower. Taurus can sustain effort over timelines that would exhaust other signs. They understand compound growth, whether in investments, relationships, or personal development, and they have the discipline to keep showing up day after day.',
          'Taurus also has a remarkable ability to create comfort and safety for others. Their calm presence is grounding, and people naturally feel more secure in their company. In times of crisis, Taurus becomes the rock that others anchor to.',
        ],
      },
      {
        title: 'Shadow & Growth',
        icon: '🌑',
        paragraphs: [
          'The Taurus shadow lives in rigidity and attachment. When operating from their lower nature, Taurus can become so attached to their routines, possessions, and comfort zone that they resist any form of growth. This resistance can manifest as passive-aggressive behavior, emotional stonewalling, or a refusal to engage with problems that require flexibility.',
          'Possessiveness is another shadow territory for Taurus. They can treat relationships and even people as things to be owned rather than connections to be nurtured. The insecure Taurus tightens their grip when what they need to do is open their hands.',
          'The growth path for Taurus involves developing comfort with impermanence. Learning that change does not equal loss, that releasing attachment can actually deepen connection, and that the most valuable things in life cannot be possessed are all part of the Taurus evolution.',
          'Taurus grows most when life forces them to let go. Whether through a career change, a relationship ending, or a material loss, these experiences teach Taurus that their true worth is not tied to what they have but to who they are.',
        ],
      },
      {
        title: 'Compatibility Quick Guide',
        icon: '💫',
        paragraphs: [
          'Taurus finds their most harmonious connections with fellow earth signs Virgo and Capricorn. These relationships are built on shared values of reliability, practical goals, and a mutual appreciation for building something real. With Virgo, there is a beautiful partnership of service and devotion. With Capricorn, there is a power couple energy grounded in shared ambition.',
          'Water signs, particularly Cancer and Pisces, offer Taurus the emotional depth they secretly crave. Cancer matches Taurus\' desire for domestic security and shares their nurturing nature. Pisces brings a dreamy romanticism that softens Taurus\' practical edges and opens them to the intangible.',
          'The more challenging matches for Taurus tend to be with Aquarius and Leo. Aquarius\' need for constant change and unconventionality can unsettle the Bull, while Leo\'s dramatic flair and need for attention can feel exhausting to comfort-loving Taurus. These pairings require significant compromise but can produce powerful growth when both signs commit.',
        ],
      },
    ],
  },

  gemini: {
    personalityTraits: ['curious', 'witty', 'adaptable', 'social', 'intellectual', 'versatile', 'communicative', 'playful', 'quick-minded', 'restless'],
    strengths: ['Exceptional communication skills', 'Rapid learning ability', 'Social intelligence', 'Versatility and adaptability', 'Wit and humor', 'Intellectual curiosity'],
    weaknesses: ['Difficulty committing to one path', 'Inconsistency in follow-through', 'Tendency toward superficiality', 'Nervous energy and anxiety', 'Can be perceived as two-faced'],
    loveStyle: [
      'Gemini falls in love with the mind first. They need a partner who can match their intellectual velocity, someone who can debate philosophy at breakfast, swap puns at dinner, and still surprise them with a perspective they have never considered.',
      'Variety is essential in a Gemini relationship. They need a partner who understands that loving a Gemini means loving multiple versions of them. The Gemini who is bubbly and social on Friday might be introspective and bookish on Sunday, and both are equally real.',
      'Communication is Gemini\'s love language in the most literal sense. They process love through conversation, and a relationship without deep, stimulating dialogue feels hollow to them. The partner who texts Gemini an interesting article is speaking directly to their heart.',
    ],
    careerStrengths: [
      'Gemini thrives in careers that reward communication, adaptability, and intellectual agility. Journalism, writing, teaching, marketing, sales, technology, and media all play to their strengths. They excel in fast-paced environments where no two days are the same.',
      'Their greatest professional asset is their ability to synthesize information quickly and communicate it clearly. Gemini can translate complex ideas into accessible language, making them invaluable as educators, presenters, and content creators. They often manage multiple projects or even careers simultaneously.',
    ],
    famousPeople: ['Angelina Jolie', 'Kanye West', 'Marilyn Monroe', 'Morgan Freeman', 'Natalie Portman', 'Prince'],
    bestMatches: ['libra', 'aquarius', 'aries'],
    challengingMatches: ['pisces', 'virgo', 'scorpio'],
    shadowSide: 'The Gemini shadow manifests as dishonesty and inconsistency. When operating from their lower expression, Gemini can become manipulative with words, telling different people different stories to serve their needs. Their adaptability becomes a lack of identity, and their curiosity becomes a scattered inability to commit to anything or anyone deeply enough to create lasting meaning.',
    lifePurpose: 'Gemini is here to learn that depth and breadth are not mutually exclusive. Their soul lesson involves discovering that true knowledge comes not just from gathering information but from integrating it into wisdom. The evolved Gemini becomes the teacher, the storyteller, the bridge between worlds, using their gift for communication to connect people and ideas that would otherwise remain isolated.',
    elementDescription: 'As an air sign, Gemini thrives in the world of ideas, communication, and social connection. Air energy is intellectual, mobile, and connective. It gives Gemini their quick mind, their gift for language, and their need for constant mental stimulation. Like the wind, Gemini circulates ideas and energy, keeping everything around them fresh and in motion.',
    sections: [
      {
        title: 'Personality Overview',
        icon: '🌬️',
        paragraphs: [
          'Gemini is the zodiac\'s storyteller, the eternal student, and the social connector. Ruled by Mercury, the planet of communication and intellect, Gemini processes the world through language and ideas. They are the ones who read three books simultaneously, maintain conversations across a dozen group chats, and still find time to pick up a new hobby.',
          'The symbol of the Twins reflects Gemini\'s essential duality, not a split personality but a multifaceted nature that allows them to see every situation from multiple angles. This ability to hold contradictions without needing to resolve them is one of Gemini\'s most sophisticated qualities, even if it confuses more black-and-white thinkers.',
          'At their core, Gemini is driven by an insatiable curiosity about the world. They want to understand how things work, why people do what they do, and what happens next. This mental restlessness can be exhausting for the Gemini themselves, but it also makes them some of the most interesting and knowledgeable people you will ever meet.',
          'Gemini\'s social intelligence is remarkable. They can read a room instantly, adjust their communication style to connect with anyone, and make people feel genuinely heard. This is not manipulation but a genuine skill born from their deep interest in human nature and their Mercury-given gift for language.',
        ],
      },
      {
        title: 'In Love & Relationships',
        icon: '💕',
        paragraphs: [
          'The mind is Gemini\'s primary erogenous zone. They fall in love with intelligence, humor, and the ability to surprise them intellectually. A partner who can introduce Gemini to a new idea, challenge their thinking, or make them laugh with clever wordplay has a direct path to their heart.',
          'Gemini needs freedom within relationships. They are not designed for the kind of love that merges two people into one. They need space to maintain their friendships, pursue their interests, and be alone with their thoughts. A partner who tries to isolate or possess a Gemini will lose them.',
          'One of Gemini\'s greatest relationship strengths is their ability to keep things lighthearted and fun. They bring play, humor, and spontaneity to love, and they can defuse tension with a well-timed joke or a surprising change of plans. Life with a Gemini partner is rarely boring.',
          'The relationship challenge for Gemini is emotional depth. They can sometimes intellectualize their feelings rather than actually feeling them, and their partner may struggle to get past the entertaining surface to the more vulnerable layers beneath. The Gemini who learns to sit with difficult emotions becomes a truly extraordinary partner.',
        ],
      },
      {
        title: 'Career & Purpose',
        icon: '📚',
        paragraphs: [
          'Gemini is the zodiac\'s polymath. They often have multiple professional interests and may maintain side projects, freelance work, or entirely separate career tracks throughout their lives. What looks like inability to commit is actually their natural way of keeping their mind engaged.',
          'Communication-based careers are where Gemini shines brightest. Writing, podcasting, journalism, social media, public relations, teaching, and sales all leverage their Mercury gifts. They have an innate ability to make complex information accessible and engaging.',
          'Gemini also excels in technology and digital innovation. Their quick minds and comfort with rapid change make them natural fits for the tech industry, where adaptability is a survival skill and the ability to learn fast is more valuable than deep specialization.',
          'The career trap for Gemini is spreading themselves too thin. Their diverse interests can lead to a resume that looks scattered rather than versatile. The most successful Geminis learn to create a unifying narrative around their varied experiences or find careers that naturally encompass multiple skills.',
        ],
      },
      {
        title: 'Strengths & Gifts',
        icon: '✨',
        paragraphs: [
          'Gemini\'s greatest gift is the ability to connect, whether that means connecting ideas, connecting people, or connecting the dots that others miss. They are the zodiac\'s translators, capable of bridging different worlds, cultures, and perspectives through their facility with language.',
          'Their adaptability is a genuine superpower. In a world that changes constantly, Gemini\'s ability to pivot, learn quickly, and remain curious rather than fearful in the face of the unknown is an invaluable quality. They model flexibility for the more rigid signs.',
          'Gemini also brings levity and perspective to heavy situations. Their ability to find humor, to reframe problems, and to remind others that there are always multiple ways to look at things serves as a social balm. Gemini energy keeps groups from taking themselves too seriously.',
        ],
      },
      {
        title: 'Shadow & Growth',
        icon: '🌑',
        paragraphs: [
          'The Gemini shadow lives in superficiality and evasion. When operating unconsciously, Gemini can use their verbal skills to deflect, manipulate, or avoid accountability. They can talk their way out of anything, including the honest self-reflection that growth requires.',
          'Anxiety is Gemini\'s most common shadow emotion. Their busy minds can spiral into overthinking, and without practices that ground them in their bodies, they can live entirely in their heads, disconnected from their feelings and physical needs.',
          'The growth path for Gemini involves developing depth. Learning to stay with one idea, one project, one person, or one feeling long enough to truly know it represents the evolution from information collector to genuine wisdom keeper.',
          'Gemini grows most when they commit to something fully. Whether it is a creative project that takes years, a relationship that requires emotional vulnerability, or a discipline that demands mastery rather than surface familiarity, depth is the territory where Gemini finds their greatest transformation.',
        ],
      },
      {
        title: 'Compatibility Quick Guide',
        icon: '💫',
        paragraphs: [
          'Gemini finds their most natural connections with fellow air signs Libra and Aquarius. These relationships thrive on intellectual rapport, social synergy, and mutual respect for independence. With Libra, there is elegant conversation and shared aesthetic appreciation. With Aquarius, there is a meeting of inventive minds that can feel like finding a kindred spirit.',
          'Fire signs, particularly Aries and Leo, bring excitement and passion to Gemini\'s world. Aries matches Gemini\'s pace and adds a boldness that Gemini finds thrilling. Leo brings warmth, generosity, and a theatrical flair that keeps Gemini entertained and emotionally engaged.',
          'The more challenging matches for Gemini tend to be with Pisces and Virgo. Pisces\' emotional intensity can overwhelm Gemini\'s airy nature, while Virgo approaches life with a precision and seriousness that can feel limiting to Gemini\'s free-flowing mind. These pairings work best when both signs appreciate what the other teaches them.',
        ],
      },
    ],
  },

  cancer: {
    personalityTraits: ['nurturing', 'intuitive', 'protective', 'emotional', 'devoted', 'empathetic', 'tenacious', 'imaginative', 'sentimental', 'perceptive'],
    strengths: ['Deep emotional intelligence', 'Fierce protectiveness of loved ones', 'Powerful intuition', 'Creating home and belonging', 'Unwavering loyalty', 'Ability to nurture growth in others'],
    weaknesses: ['Moodiness and emotional volatility', 'Tendency to cling to the past', 'Passive-aggressive communication', 'Difficulty setting boundaries', 'Taking things too personally'],
    loveStyle: [
      'Cancer loves with their entire being. When they open their heart to you, they are offering not just affection but a safe harbor, a place where you are unconditionally accepted and deeply known. Cancer remembers every detail about their partner because they genuinely care about the full picture of who you are.',
      'Home is where the Cancer heart lives. They create spaces that feel like emotional sanctuaries, and they express love through nourishment, whether that means a home-cooked meal, a carefully chosen gift, or simply holding space for their partner\'s feelings without judgment.',
      'Cancer needs emotional reciprocity in love. They give generously but can become resentful if the care flows only in one direction. A partner who recognizes Cancer\'s needs and nurtures them in return will unlock a devotion that is unmatched in the zodiac.',
    ],
    careerStrengths: [
      'Cancer excels in careers that allow them to care for, protect, or nurture others. Healthcare, education, social work, counseling, real estate, hospitality, and culinary arts all align with Cancer\'s natural gifts. They create environments where people feel safe and supported.',
      'Their emotional intelligence is a professional superpower. Cancer reads the room intuitively, understands unspoken dynamics, and knows how to create the conditions for others to thrive. They are exceptional managers not because they are commanding but because they genuinely care about the people they lead.',
    ],
    famousPeople: ['Selena Gomez', 'Tom Hanks', 'Meryl Streep', 'Ariana Grande', 'Robin Williams', 'Frida Kahlo'],
    bestMatches: ['scorpio', 'pisces', 'taurus'],
    challengingMatches: ['aries', 'libra', 'aquarius'],
    shadowSide: 'The Cancer shadow manifests as emotional manipulation and smothering. When insecure, Cancer can use guilt, mood swings, and passive-aggressive behavior to control the people around them. Their protectiveness can become suffocating, and their attachment to the past can prevent them from growing into the future. The hurt Cancer retreats into their shell and punishes through silence.',
    lifePurpose: 'Cancer is here to learn that true nurturing includes the courage to let go. Their soul lesson involves discovering that emotional strength is not about building walls but about maintaining an open heart even in the face of pain. The evolved Cancer becomes the great mother or father of their community, creating spaces of belonging without requiring people to stay forever.',
    elementDescription: 'As a water sign, Cancer moves through the world through feeling. Water energy is emotional, intuitive, and deeply connected to the subconscious. It gives Cancer their remarkable empathy, their psychic sensitivity, and their ability to create emotional bonds that feel ancient. Like the ocean tides ruled by their governing Moon, Cancer\'s emotional landscape is constantly shifting.',
    sections: [
      {
        title: 'Personality Overview',
        icon: '🌊',
        paragraphs: [
          'Cancer is the zodiac\'s emotional anchor. Ruled by the Moon, Cancer experiences life through a rich and ever-shifting inner landscape that gives them access to depths of feeling that other signs can only imagine. They are the empaths, the caretakers, and the keepers of memory and tradition.',
          'Do not mistake Cancer\'s sensitivity for weakness. This is a cardinal sign, and beneath that soft exterior lies a tenacity that rivals any sign in the zodiac. The Crab does not let go once it has committed, and Cancer\'s determination to protect what they love is formidable.',
          'Cancer possesses an almost psychic ability to read the emotional undercurrents in any situation. They know when something is wrong before anyone speaks, and they can sense the mood of a room the moment they walk in. This intuition is not mystical but rather an extraordinarily developed emotional intelligence.',
          'Home is Cancer\'s kingdom, but home is not just a place. For Cancer, home is a feeling, and they carry it with them. They create a sense of belonging wherever they go, whether that means turning a rental apartment into a sanctuary or making a stranger feel like family.',
        ],
      },
      {
        title: 'In Love & Relationships',
        icon: '💕',
        paragraphs: [
          'When Cancer falls in love, they fall completely. They do not hold back, and they do not play games. Their love is a full immersion experience that offers their partner warmth, security, and a level of emotional attunement that is truly rare.',
          'Cancer is the partner who notices when you are upset before you have said a word. They remember the stories you told them months ago, keep your favorite snacks stocked, and create a home life that feels like a warm embrace. Their love language is acts of care that demonstrate how deeply they have been paying attention.',
          'The vulnerability of Cancer in love is both their greatest strength and their greatest risk. They love with an openness that can be devastating when betrayed. Trust, once broken with Cancer, is extraordinarily difficult to rebuild. They forgive eventually, but they never forget.',
          'Cancer needs a partner who can hold emotional space for them. They spend so much energy caring for others that they need someone who asks about their feelings, validates their experiences, and recognizes that the person who nurtures everyone else also needs to be nurtured.',
        ],
      },
      {
        title: 'Career & Purpose',
        icon: '🏠',
        paragraphs: [
          'Cancer\'s professional gifts revolve around their ability to create safety, nourishment, and belonging. They are the managers who remember every team member\'s birthday, the therapists who hold space for profound healing, and the teachers who make every student feel seen.',
          'Careers connected to home, family, food, and emotional wellbeing align naturally with Cancer energy. Real estate, interior design, culinary arts, pediatrics, family law, and hospitality all allow Cancer to express their caring nature professionally.',
          'Cancer also has surprising business acumen. Their emotional intelligence translates into strong customer intuition, and their tenacity makes them persistent entrepreneurs. They often build businesses around creating comfort or solving problems for families and communities.',
          'The career challenge for Cancer is managing the emotional toll of caring professions. They absorb others\' pain readily and can burn out if they do not develop strong boundaries between their professional caring role and their own emotional needs.',
        ],
      },
      {
        title: 'Strengths & Gifts',
        icon: '✨',
        paragraphs: [
          'Cancer\'s greatest gift is the ability to create emotional safety. In a world that often feels harsh and indifferent, Cancer holds space for vulnerability, grief, joy, and every feeling in between. They remind us that it is not just acceptable but essential to feel deeply.',
          'Their loyalty is legendary. When Cancer loves you, they love you through everything. They show up during illness, celebrate your victories without jealousy, and maintain friendships across decades. Cancer relationships feel like being part of a family that chose you.',
          'Cancer also brings a powerful creative imagination to everything they touch. Their rich inner world feeds artistic expression, innovative problem-solving, and a capacity for empathy that allows them to create stories, spaces, and experiences that resonate deeply with others.',
        ],
      },
      {
        title: 'Shadow & Growth',
        icon: '🌑',
        paragraphs: [
          'The Cancer shadow lives in emotional manipulation and martyrdom. When operating from their lower nature, Cancer can use their emotional intelligence as a weapon, wielding guilt, mood swings, and withdrawal as tools of control. They may give endlessly but keep a running tally of what is owed in return.',
          'Cancer\'s attachment to the past can become a significant impediment to growth. They can cling to outdated relationships, childhood wounds, and nostalgic idealizations that prevent them from engaging with the present. Learning to honor the past without being imprisoned by it is central to Cancer\'s evolution.',
          'Codependency is a real risk for Cancer. Their desire to be needed can lead them into relationships where they sacrifice their own wellbeing to maintain a caretaking role. The growth edge for Cancer is learning that being needed is not the same as being loved.',
          'Cancer grows most when they learn to mother themselves with the same devotion they give to others. Developing self-care practices, setting healthy boundaries, and allowing others to be strong without feeling threatened are all part of the Cancer maturation process.',
        ],
      },
      {
        title: 'Compatibility Quick Guide',
        icon: '💫',
        paragraphs: [
          'Cancer finds their deepest connections with fellow water signs Scorpio and Pisces. These relationships operate on an almost psychic level of emotional understanding. With Scorpio, there is an intensity and loyalty that makes both signs feel truly safe. With Pisces, there is a dreamy, tender connection that nourishes both souls.',
          'Earth signs, particularly Taurus and Virgo, provide the stability and reliability that Cancer craves. Taurus shares Cancer\'s love of domestic comfort and physical affection. Virgo\'s acts of service speak directly to Cancer\'s love language, and their practical nature grounds Cancer\'s emotional tides.',
          'The more challenging matches for Cancer tend to be with Aries and Aquarius. Aries\' directness can feel abrasive to sensitive Cancer, while Aquarius\' emotional detachment can leave Cancer feeling lonely even in a relationship. These pairings require both partners to stretch significantly beyond their comfort zones.',
        ],
      },
    ],
  },

  leo: {
    personalityTraits: ['charismatic', 'generous', 'dramatic', 'warm', 'creative', 'confident', 'loyal', 'proud', 'entertaining', 'magnetic'],
    strengths: ['Natural charisma and leadership', 'Extraordinary generosity', 'Creative self-expression', 'Ability to inspire others', 'Fierce loyalty to loved ones', 'Warmth that makes everyone feel special'],
    weaknesses: ['Need for constant validation', 'Difficulty sharing the spotlight', 'Pride that prevents asking for help', 'Can be domineering', 'Dramatic reactions to minor slights'],
    loveStyle: [
      'Leo loves grandly and generously. When a Leo is in love, they make their partner feel like the most important person in the world. They lavish attention, plan romantic surprises, and announce their love to anyone who will listen. Being loved by a Leo is a full cinematic experience.',
      'Leo needs to be admired and appreciated in return. They are not high-maintenance so much as they are deeply invested in feeling valued. A partner who offers genuine compliments, celebrates Leo\'s achievements, and makes them feel like a priority will earn Leo\'s unwavering devotion.',
      'Physically affectionate and romantically expressive, Leo brings theatrical warmth to their relationships. They enjoy public displays of affection, grand gestures, and creating a love story that others envy. For Leo, love should be an adventure worth telling stories about.',
    ],
    careerStrengths: [
      'Leo thrives in careers that place them at the center of attention or allow them to inspire and lead. Entertainment, the arts, management, politics, education, luxury brands, and any field that rewards charisma and vision are natural fits for Leo energy.',
      'Their greatest professional strength is their ability to inspire loyalty and enthusiasm in others. Leo leads not through fear but through magnetism. People follow Leo because being in their orbit feels exciting and meaningful. They create cultures of excellence and celebration wherever they work.',
    ],
    famousPeople: ['Barack Obama', 'Jennifer Lopez', 'Mick Jagger', 'Madonna', 'Daniel Radcliffe', 'Coco Chanel'],
    bestMatches: ['sagittarius', 'aries', 'libra'],
    challengingMatches: ['taurus', 'scorpio', 'capricorn'],
    shadowSide: 'The Leo shadow manifests as narcissism and a desperate need for external validation. When operating from their lower nature, Leo can become tyrannical, demanding attention and loyalty while offering little genuine reciprocity. Their pride can prevent them from admitting mistakes, and their need to be special can manifest as jealousy of others\' success. The wounded Leo compensates for inner insecurity by becoming louder, more controlling, and more demanding.',
    lifePurpose: 'Leo is here to learn that true radiance comes from the heart, not the ego. Their soul lesson involves discovering that the deepest form of self-expression is generosity, that real leadership serves others, and that they do not need applause to know their own worth. The evolved Leo becomes the benevolent ruler, shining not for their own glory but to illuminate the brilliance in everyone around them.',
    elementDescription: 'As a fire sign, Leo embodies the sustained warmth of the Sun itself. Fire energy is expressive, creative, and life-giving. It gives Leo their characteristic warmth, their creative power, and their need to be seen and celebrated. Like the Sun that rules them, Leo\'s fire is generous and constant, offering light and energy to everything in their solar system.',
    sections: [
      {
        title: 'Personality Overview',
        icon: '☀️',
        paragraphs: [
          'Leo is the zodiac\'s star. Ruled by the Sun, the center of our solar system, Leo naturally gravitates toward the center of every room, every group, and every story. This is not vanity but an expression of their essential nature. Just as the Sun does not apologize for shining, Leo does not apologize for being magnificent.',
          'At their core, Leo is driven by a need to create and to be recognized for their creation. Whether they are performing on stage, leading a team, decorating a home, or telling a joke at dinner, Leo is always creating an experience. They have a gift for turning ordinary moments into memorable ones.',
          'Leo\'s warmth is their most powerful quality. When a Leo turns their full attention on you, you feel like the most important person in the world. This is not a performance but a genuine expression of their generous heart. Leo has an unlimited supply of warmth and praise for the people they love.',
          'There is a royal quality to Leo that goes beyond mere confidence. They carry themselves with a dignity and self-assurance that inspires respect. Even in casual settings, Leo has a presence that elevates the atmosphere. They set the emotional temperature of every space they enter.',
        ],
      },
      {
        title: 'In Love & Relationships',
        icon: '💕',
        paragraphs: [
          'Being loved by Leo is one of the great experiences of the zodiac. They pour warmth, attention, and generosity into their relationships with an enthusiasm that can feel almost overwhelming in the best possible way. Leo wants their partner to feel cherished, celebrated, and proud to be with them.',
          'Leo\'s love is performative in the most genuine sense. They want to show the world how they feel about their partner. Public displays of affection, social media declarations, surprise parties, and elaborate date nights are all part of the Leo love experience. They believe love should be celebrated loudly and proudly.',
          'The challenge in loving a Leo is managing their need for attention and validation. A Leo whose partner forgets to compliment them, takes them for granted, or fails to acknowledge their efforts will wither. Leo needs feedback, and when they do not get it, they can become sulky, dramatic, or attention-seeking.',
          'Loyalty is non-negotiable for Leo in love. They give their whole heart and expect the same level of devotion in return. A Leo who feels betrayed or taken for granted can shut down their generosity entirely, replacing their usual warmth with a cold pride that is remarkably difficult to penetrate.',
        ],
      },
      {
        title: 'Career & Purpose',
        icon: '👑',
        paragraphs: [
          'Leo is designed for leadership, creativity, and roles that place them in the spotlight. They are not just comfortable with visibility but energized by it. The performing arts, entertainment, luxury brands, education, politics, and executive management all leverage Leo\'s natural magnetism.',
          'In leadership roles, Leo creates cultures of celebration and excellence. They are generous with praise, creative with solutions, and inspiring in their vision. People work harder for a Leo boss not because they fear consequences but because Leo\'s enthusiasm is genuinely contagious.',
          'Leo also has strong entrepreneurial energy. Their confidence, combined with their creative vision and their ability to attract loyal teams, makes them effective founders. They build brands that carry their personality, and their natural sense of drama helps them market effectively.',
          'The career pitfall for Leo is becoming too focused on recognition and not enough on substance. The wisest Leos learn that lasting success comes from mastery, not just charisma, and that the most respected leaders are those who uplift others rather than demanding to be uplifted.',
        ],
      },
      {
        title: 'Strengths & Gifts',
        icon: '✨',
        paragraphs: [
          'Leo\'s greatest gift is the ability to make people feel seen, valued, and alive. Their warmth is not a social strategy but a genuine outpouring of their generous spirit. In a world that can feel cold and transactional, Leo reminds us of the power of wholehearted enthusiasm and genuine celebration.',
          'Their creative courage is another remarkable strength. Leo is willing to put themselves out there, to risk failure in front of an audience, to express themselves fully even when it might invite criticism. This creative bravery inspires others to take their own expressive risks.',
          'Leo also brings a quality of nobility and generosity to their communities. They are often the ones organizing celebrations, rallying support for friends in need, and creating spaces where everyone feels special. Leo at their best is the benevolent ruler who uses their influence to elevate everyone around them.',
        ],
      },
      {
        title: 'Shadow & Growth',
        icon: '🌑',
        paragraphs: [
          'The Leo shadow lives in the gap between their need for validation and their actual self-worth. When operating from their lower nature, Leo can become an attention addict, requiring constant praise and becoming hostile when it is not forthcoming. Their generosity may come with strings attached: admire me, acknowledge me, make me feel special.',
          'Pride is Leo\'s most persistent shadow. Their unwillingness to appear vulnerable, to admit mistakes, or to ask for help can create walls between them and genuine intimacy. The Leo who cannot say "I was wrong" or "I need you" will struggle to maintain deep relationships.',
          'The growth path for Leo involves discovering that their light does not dim when others shine. Learning to celebrate others\' success without jealousy, to find self-worth that does not depend on external applause, and to lead with humility rather than dominance represents the evolution from ego to heart.',
          'Leo grows most when they experience genuine humility. Moments that strip away the performance and require raw vulnerability, whether through creative failure, personal loss, or a relationship that demands authentic rather than performative love, are the crucibles that forge Leo into their highest expression.',
        ],
      },
      {
        title: 'Compatibility Quick Guide',
        icon: '💫',
        paragraphs: [
          'Leo finds their most exciting connections with fellow fire signs Sagittarius and Aries. These relationships are filled with adventure, passion, and mutual respect for each other\'s independence and ambition. With Sagittarius, there is a spirit of boundless adventure. With Aries, there is a dynamic power couple energy that turns heads.',
          'Air signs, particularly Libra and Gemini, offer Leo the social stimulation and intellectual engagement they crave. Libra shares Leo\'s love of beauty and partnership, creating a glamorous and harmonious couple. Gemini keeps Leo entertained with their quick wit and ever-changing interests.',
          'The more challenging matches for Leo tend to be with Taurus and Scorpio. Taurus\' stubborn refusal to be impressed can frustrate attention-seeking Leo, while Scorpio\'s intensity and need for control creates a dramatic power struggle. These pairings produce either magnificent chemistry or spectacular clashes.',
        ],
      },
    ],
  },

  virgo: {
    personalityTraits: ['analytical', 'helpful', 'modest', 'precise', 'devoted', 'observant', 'methodical', 'health-conscious', 'practical', 'perfectionist'],
    strengths: ['Extraordinary attention to detail', 'Genuine desire to be of service', 'Analytical problem-solving', 'Reliability and consistency', 'Health and wellness awareness', 'Ability to improve any system'],
    weaknesses: ['Chronic over-criticism of self and others', 'Anxiety and overthinking', 'Difficulty accepting imperfection', 'Can be overly controlling about routines', 'Tendency to worry excessively'],
    loveStyle: [
      'Virgo shows love through action, not words. They are the partner who fixes your leaky faucet, organizes your closet, and remembers to schedule your dentist appointment. Their love language is acts of service, and they notice what you need before you even know you need it.',
      'Virgo\'s love is quiet and steady rather than dramatic. They will not sweep you off your feet with grand declarations, but they will show up consistently, pay attention to the details, and work tirelessly to make the relationship better. Virgo love is the kind that deepens with time rather than fading.',
      'A Virgo needs a partner who appreciates their particular brand of devotion. Their acts of service can be mistaken for criticism, and their desire to help can be perceived as controlling. The partner who understands that Virgo\'s suggestions come from love, not judgment, will find in them an extraordinarily caring companion.',
    ],
    careerStrengths: [
      'Virgo excels in careers that reward precision, analysis, and a genuine desire to be useful. Healthcare, research, editing, data analysis, accounting, nutrition, project management, and quality assurance all align with Virgo\'s meticulous nature.',
      'Their greatest professional asset is their ability to see what is broken and fix it. Virgo has an eye for inefficiency, an intolerance for sloppy work, and the patience to refine systems until they function beautifully. They are the unsung heroes who make organizations actually work.',
    ],
    famousPeople: ['Beyonce', 'Keanu Reeves', 'Zendaya', 'Michael Jackson', 'Mother Teresa', 'Freddie Mercury'],
    bestMatches: ['taurus', 'capricorn', 'cancer'],
    challengingMatches: ['sagittarius', 'gemini', 'aquarius'],
    shadowSide: 'The Virgo shadow manifests as paralyzing perfectionism and chronic criticism. When operating from their lower expression, Virgo becomes the nag, the nitpicker, the person who can find a flaw in paradise. Their standards become so impossibly high that no one, including themselves, can ever meet them. Their helpful nature curdles into controlling behavior, and their analytical mind spirals into anxious rumination.',
    lifePurpose: 'Virgo is here to learn that perfection is found in the process, not the product. Their soul lesson involves discovering that being of service does not require being indispensable, that wholeness includes the broken parts, and that the most sacred act of service is accepting themselves and others exactly as they are. The evolved Virgo becomes the healer who understands that fixing is less powerful than holding space.',
    elementDescription: 'As an earth sign, Virgo is deeply practical and connected to the material world. Earth energy is grounding, productive, and detail-oriented. It gives Virgo their methodical approach, their connection to health and the body, and their ability to turn chaos into order. Like cultivated soil that has been carefully tended, Virgo\'s earth energy produces refined and nourishing results.',
    sections: [
      {
        title: 'Personality Overview',
        icon: '🌾',
        paragraphs: [
          'Virgo is the zodiac\'s alchemist, quietly turning chaos into order, potential into excellence, and raw materials into refined beauty. Ruled by Vesta, Virgo carries a sacred devotion to craft and service that runs deeper than mere perfectionism. Vesta\'s flame burns with quiet focus — and Virgo channels that flame into everything they touch.',
          'At their core, Virgo is driven by a deep desire to be useful. This is not about people-pleasing or seeking approval but about a genuine calling to improve, to heal, and to serve. Virgo finds meaning in making things work better, whether that thing is a spreadsheet, a recipe, a body, or a relationship.',
          'The modesty of Virgo is often misunderstood. They are not lacking in confidence so much as they are acutely aware of how much more there is to learn and improve. This awareness drives them to keep refining, keep studying, and keep getting better. It is not insecurity but intellectual honesty.',
          'Virgo\'s observational powers are extraordinary. They notice the details that everyone else misses: the slight change in your tone of voice, the typo on page 47, the ingredient that would make this dish perfect. This attention to detail, when directed constructively, makes them invaluable in any setting.',
        ],
      },
      {
        title: 'In Love & Relationships',
        icon: '💕',
        paragraphs: [
          'Virgo\'s love language is acts of service, and understanding this is the key to appreciating their unique brand of devotion. They will not write you poetry, but they will reorganize your kitchen for maximum efficiency. They will not make dramatic declarations, but they will research the best doctor in the city when you mention a health concern.',
          'In relationships, Virgo is quietly observant and deeply attentive. They study their partner, learning their habits, preferences, and needs. This knowledge is then applied in countless small acts of care that, taken together, represent a profound and sustained love.',
          'The challenge in loving a Virgo is their critical nature. Their desire to improve can extend to their partner, and unsolicited feedback about your diet, wardrobe, or habits can feel like judgment rather than love. Virgo must learn that their partner needs to feel accepted, not optimized.',
          'Once a Virgo is truly committed, their loyalty is profound. They are not flashy or dramatic in their devotion, but they are consistent, reliable, and genuinely invested in the health and growth of the relationship. Virgo love is a slow burn that warms you for life.',
        ],
      },
      {
        title: 'Career & Purpose',
        icon: '🔬',
        paragraphs: [
          'Virgo approaches their career with the same meticulous attention they bring to every area of life. They are the ones who actually read the fine print, who triple-check their work, and who notice the systemic issues that others overlook. This makes them indispensable in detail-oriented roles.',
          'Healthcare, in all its forms, is a natural Virgo domain. Their interest in the body, their desire to heal, and their analytical approach to problem-solving make them exceptional doctors, nurses, nutritionists, therapists, and wellness practitioners.',
          'Virgo also excels in roles that require editorial judgment and quality control. Editors, researchers, data analysts, accountants, and quality assurance professionals with Virgo placements often rise to the top of their fields. Their eye for imperfection is a genuine professional asset.',
          'The career trap for Virgo is getting stuck in a supporting role when they have the capability to lead. Their modesty and preference for working behind the scenes can prevent them from claiming the recognition and advancement they deserve. The wisest Virgos learn to advocate for themselves as effectively as they advocate for others.',
        ],
      },
      {
        title: 'Strengths & Gifts',
        icon: '✨',
        paragraphs: [
          'Virgo\'s greatest gift is the ability to improve everything they touch. They see potential where others see problems, and they have the patience and skill to bring that potential to fruition. In a world that often settles for good enough, Virgo pushes for excellence.',
          'Their service orientation is genuine and deeply impactful. Virgo does not help for recognition or reward but because they feel called to make things better. This selfless dedication to improvement makes them invaluable friends, partners, and colleagues.',
          'Virgo also brings a rare intellectual honesty to every situation. They are willing to examine things critically, including their own beliefs and behaviors, and they value truth over comfort. In an age of spin and superficiality, Virgo\'s commitment to getting things right is profoundly valuable.',
        ],
      },
      {
        title: 'Shadow & Growth',
        icon: '🌑',
        paragraphs: [
          'The Virgo shadow lives in perfectionism and self-criticism. When operating from their lower nature, Virgo\'s high standards become impossible benchmarks that guarantee perpetual disappointment. Nothing is ever good enough, no one is ever doing it right, and the Virgo themselves is the harshest target of their own criticism.',
          'Anxiety is Virgo\'s most common emotional challenge. Their analytical mind, when turned inward, can create spirals of worry about health, finances, performance, and relationships. Without grounding practices, Virgo can live in a constant state of low-grade stress that undermines the very health they value so highly.',
          'The growth path for Virgo involves learning to embrace imperfection. Discovering that a flawed but completed project is more valuable than a perfect but unfinished one, that people grow through acceptance rather than criticism, and that their own worth is not dependent on their productivity represents the Virgo evolution.',
          'Virgo grows most when they learn to receive. A sign so focused on service can struggle to accept help, compliments, or gifts. Learning that receiving is not weakness but an act of trust and connection is a profound growth edge for Virgo.',
        ],
      },
      {
        title: 'Compatibility Quick Guide',
        icon: '💫',
        paragraphs: [
          'Virgo finds their most grounded connections with fellow earth signs Taurus and Capricorn. These relationships are built on mutual respect for reliability, shared practical values, and a combined work ethic that can move mountains. With Taurus, there is a sensual and devoted partnership. With Capricorn, there is a driven and respectful alliance of equals.',
          'Water signs, particularly Cancer and Scorpio, offer Virgo the emotional depth they secretly desire. Cancer\'s nurturing nature creates a safe space for Virgo to relax their guard. Scorpio\'s depth and intensity fascinates Virgo and draws out their more passionate, less analytical side.',
          'The more challenging matches for Virgo tend to be with Sagittarius and Gemini. Sagittarius\' loose relationship with details and routines can feel chaotic to organized Virgo, while Gemini\'s restless energy can seem unfocused and uncommitted to Virgo\'s devoted nature. These pairings work best when both signs learn to appreciate rather than critique their differences.',
        ],
      },
    ],
  },

  libra: {
    personalityTraits: ['harmonious', 'charming', 'diplomatic', 'romantic', 'fair-minded', 'aesthetic', 'social', 'graceful', 'idealistic', 'partnership-oriented'],
    strengths: ['Natural diplomatic ability', 'Strong aesthetic sense', 'Ability to see all perspectives', 'Social grace and charm', 'Commitment to fairness', 'Gift for creating harmony'],
    weaknesses: ['Chronic indecisiveness', 'Conflict avoidance at all costs', 'Tendency to lose themselves in relationships', 'Can be superficial or people-pleasing', 'Passive-aggressive when upset'],
    loveStyle: [
      'Libra is the sign of partnership itself, and they approach love as an art form. They create relationships that are aesthetically beautiful, intellectually stimulating, and emotionally harmonious. Dating a Libra means candlelit dinners, curated playlists, and conversations that flow like wine.',
      'Libra needs a partner who values partnership as much as they do. They are not complete without connection, and they invest deeply in creating a relationship that feels balanced, fair, and mutually enriching. They are the sign most likely to consider their partner\'s feelings before making any decision.',
      'Romance for Libra is not separate from daily life but woven through it. They maintain the courtship long after the relationship is established, planning thoughtful dates, remembering anniversaries, and ensuring that the relationship never loses its sense of beauty and intention.',
    ],
    careerStrengths: [
      'Libra excels in careers that combine aesthetics with interpersonal skill. Law, diplomacy, design, art curation, fashion, public relations, counseling, and mediation all play to Libra\'s natural strengths. They thrive in collaborative environments where beauty and harmony are valued.',
      'Their greatest professional asset is their ability to see every side of a situation and find the solution that satisfies the most people. This makes them exceptional negotiators, mediators, and team leaders. Libra builds consensus where others create division.',
    ],
    famousPeople: ['Kim Kardashian', 'John Lennon', 'Serena Williams', 'Will Smith', 'Gwen Stefani', 'Mahatma Gandhi'],
    bestMatches: ['gemini', 'aquarius', 'leo'],
    challengingMatches: ['cancer', 'capricorn', 'aries'],
    shadowSide: 'The Libra shadow manifests as codependency and inauthenticity. When operating from their lower nature, Libra becomes so focused on maintaining harmony that they sacrifice their own needs, opinions, and identity. They tell people what they want to hear, avoid necessary confrontations, and build relationships on a foundation of performance rather than authenticity. Their quest for balance can become a paralysis of indecision.',
    lifePurpose: 'Libra is here to learn that true harmony includes dissonance. Their soul lesson involves discovering that peace built on suppression is not real peace, that fairness sometimes requires taking a side, and that the most beautiful relationships are those that can hold conflict without breaking. The evolved Libra becomes the artist of relationship, creating partnerships that are honest, beautiful, and genuinely equal.',
    elementDescription: 'As an air sign, Libra moves through the world through intellect, communication, and social connection. Air energy is relational, idealistic, and aesthetically attuned. It gives Libra their social grace, their sense of justice, and their ability to connect disparate perspectives into harmonious wholes. Like a gentle breeze, Libra\'s air energy creates pleasant conditions for everyone around them.',
    sections: [
      {
        title: 'Personality Overview',
        icon: '⚖️',
        paragraphs: [
          'Libra is the zodiac\'s diplomat, the artist of relationship, and the keeper of beauty. Ruled by Juno, the asteroid of partnership and sacred union, Libra moves through the world seeking balance, harmony, and genuine connection. They are the ones who notice when a room is beautifully decorated, when a conversation is becoming unfair, or when someone is being left out.',
          'At their core, Libra is motivated by a desire for justice and beauty. These are not separate drives but two expressions of the same impulse. For Libra, a beautiful world is a fair world, and a fair world is a beautiful one. Their quest for balance extends from their personal relationships to their vision of society.',
          'Libra possesses an almost supernatural social intelligence. They can walk into any gathering and within minutes identify the dynamics, the alliances, and the tensions. They use this awareness not to manipulate but to create conditions where everyone feels included and valued.',
          'The charm of Libra is genuine, not strategic. They are naturally gracious, attentive, and interested in others. People feel better in Libra\'s company because Libra genuinely wants them to. This is not people-pleasing but a real gift for making the world around them more pleasant.',
        ],
      },
      {
        title: 'In Love & Relationships',
        icon: '💕',
        paragraphs: [
          'Love is Libra\'s native territory. They approach relationships with the same attention to beauty and balance that an artist brings to their canvas. Every aspect of the partnership is considered: the aesthetic, the intellectual compatibility, the emotional reciprocity, and the social harmony the couple creates together.',
          'Libra is the sign most likely to remember your anniversary, plan the perfect date, and keep the romance alive years into a relationship. They believe love should remain beautiful throughout its lifetime, and they are willing to put in the work to ensure it does.',
          'The challenge in Libra\'s love life is their tendency toward codependency. They can lose themselves in their partner, bending their own desires, opinions, and identity to maintain harmony. The healthy Libra learns that a great partnership requires two complete individuals, not two halves.',
          'Conflict is Libra\'s greatest relationship struggle. They will go to extraordinary lengths to avoid disagreements, which can result in suppressed resentment that eventually erupts. Learning to address issues directly, even when it temporarily disrupts harmony, is essential for Libra\'s relationship health.',
        ],
      },
      {
        title: 'Career & Purpose',
        icon: '🎨',
        paragraphs: [
          'Libra\'s professional gifts center on their ability to create harmony, beauty, and fairness. They are natural mediators, designers, and diplomats who bring grace and balance to every professional environment they enter.',
          'Careers in law, particularly mediation and negotiation, are ideal for Libra. Their ability to understand multiple perspectives, combined with their genuine desire for fairness, makes them exceptional at finding solutions that all parties can accept. Justice is not abstract for Libra but personal.',
          'The creative arts are another natural Libra domain. Fashion, interior design, graphic design, art curation, and music all allow Libra to express their Juno-given sense of harmony and beauty. They have an eye for balance and proportion that elevates their creative work.',
          'The career challenge for Libra is making decisions independently. Their desire to consider every angle can result in analysis paralysis, and their tendency to seek consensus can slow down processes that require decisive leadership. The most effective Libra professionals learn to trust their own judgment and act.',
        ],
      },
      {
        title: 'Strengths & Gifts',
        icon: '✨',
        paragraphs: [
          'Libra\'s greatest gift is the ability to create harmony without sacrificing substance. They can find the middle ground in seemingly irreconcilable conflicts, create beauty in unexpected places, and make people feel valued and heard even in tense situations.',
          'Their commitment to fairness is genuine and tireless. Libra will fight for justice with the same persistence that Aries brings to battle, though Libra\'s weapons are persuasion, charm, and logical argument rather than aggression. They advocate for balance not because it is easy but because they believe it matters.',
          'Libra also brings an elevated aesthetic awareness to the world. They improve the visual and social quality of every environment they inhabit. Their attention to beauty is not superficial but an expression of their deep belief that environment shapes experience and that everyone deserves to be surrounded by beauty.',
        ],
      },
      {
        title: 'Shadow & Growth',
        icon: '🌑',
        paragraphs: [
          'The Libra shadow lives in inauthenticity and avoidance. When operating from their lower nature, Libra becomes a mirror reflecting whatever the other person wants to see rather than showing their true face. They may agree with contradictory positions depending on their audience, and their charm can become a mask that hides genuine feelings.',
          'Indecisiveness is Libra\'s most visible shadow. Their ability to see every side of a question can become a trap where no decision feels right because every option has both merits and drawbacks. The paralyzed Libra can spend so long weighing options that the window for action closes entirely.',
          'The growth path for Libra involves learning to tolerate discomfort. Discovering that conflict is sometimes necessary for genuine harmony, that expressing an unpopular opinion is more respectful than faking agreement, and that they can survive being disliked represents the Libra evolution.',
          'Libra grows most when they learn to be alone. A sign so oriented toward partnership can struggle with solitude, but it is in solitude that Libra discovers who they really are, separate from who they become in the mirror of relationship. This self-knowledge is the foundation of the balanced partnerships they truly seek.',
        ],
      },
      {
        title: 'Compatibility Quick Guide',
        icon: '💫',
        paragraphs: [
          'Libra finds their most stimulating connections with fellow air signs Gemini and Aquarius. These relationships thrive on intellectual rapport, social synergy, and shared ideals. With Gemini, there is endless fascinating conversation and mutual curiosity. With Aquarius, there is a shared vision for a more beautiful and just world.',
          'Fire signs, particularly Leo and Sagittarius, bring warmth and confidence to Libra\'s world. Leo matches Libra\'s love of beauty and social engagement, creating a glamorous and affectionate partnership. Sagittarius brings adventure, honesty, and philosophical depth that broadens Libra\'s perspective.',
          'The more challenging matches for Libra tend to be with Cancer and Capricorn. Cancer\'s emotional intensity can feel overwhelming to harmony-seeking Libra, while Capricorn\'s pragmatic approach to life can seem cold or unromantic. These pairings require both partners to develop new emotional languages.',
        ],
      },
    ],
  },

  scorpio: {
    personalityTraits: ['intense', 'perceptive', 'transformative', 'loyal', 'magnetic', 'strategic', 'passionate', 'resilient', 'private', 'fearless'],
    strengths: ['Extraordinary emotional depth', 'Penetrating insight into human nature', 'Unwavering loyalty once trust is earned', 'Capacity for profound transformation', 'Strategic intelligence', 'Resilience through crises'],
    weaknesses: ['Jealousy and possessiveness', 'Difficulty trusting and letting go', 'Tendency toward manipulation', 'Holding grudges for years', 'All-or-nothing thinking'],
    loveStyle: [
      'Scorpio loves with a depth and intensity that most people have never experienced. When a Scorpio commits to you, they are offering access to their deepest self, and they expect the same radical vulnerability in return. Surface-level connections hold no interest for them.',
      'For Scorpio, love is a transformative experience. They do not just want a partner; they want someone who will go to the emotional depths with them, who will face their shadows together, and who will emerge changed by the experience. Scorpio relationships are alchemical.',
      'Trust is the foundation of Scorpio love, and it is earned slowly through consistent honesty. Once betrayed, a Scorpio may forgive intellectually but they rarely forget. Their sting is legendary because their investment in the relationship was total, and the pain of betrayal is proportional to the depth of their devotion.',
    ],
    careerStrengths: [
      'Scorpio excels in careers that require deep investigation, psychological insight, or the ability to manage crisis and transformation. Psychology, investigative journalism, surgery, research science, criminal justice, finance, and strategic consulting all leverage Scorpio\'s penetrating intellect.',
      'Their greatest professional strength is their ability to see beneath the surface. Scorpio detects hidden motives, identifies systemic problems, and understands power dynamics that others miss. This makes them exceptional strategists, diagnosticians, and crisis managers.',
    ],
    famousPeople: ['Leonardo DiCaprio', 'Drake', 'Julia Roberts', 'Bill Gates', 'Katy Perry', 'Marie Curie'],
    bestMatches: ['cancer', 'pisces', 'virgo'],
    challengingMatches: ['leo', 'aquarius', 'gemini'],
    shadowSide: 'The Scorpio shadow manifests as manipulation and destructive control. When operating from their lower nature, Scorpio uses their penetrating insight as a weapon, exploiting others\' vulnerabilities for power. Their fear of betrayal becomes a self-fulfilling prophecy as they test, provoke, and control their relationships until they push people away. The wounded Scorpio becomes the destroyer, tearing down what they cannot possess.',
    lifePurpose: 'Scorpio is here to learn that power and vulnerability are not opposites. Their soul lesson involves discovering that true transformation requires surrender, that the deepest form of control is the ability to let go, and that the most intimate bonds are built not through possession but through mutual trust. The evolved Scorpio becomes the healer who uses their knowledge of darkness to guide others through their own transformations.',
    elementDescription: 'As a water sign, Scorpio dwells in the deepest emotional waters of the zodiac. Water energy is emotional, intuitive, and transformative. It gives Scorpio their psychological depth, their emotional intensity, and their ability to regenerate from experiences that would break other signs. Like underground rivers that carve caverns through solid rock, Scorpio\'s water energy is patient, persistent, and immensely powerful.',
    sections: [
      {
        title: 'Personality Overview',
        icon: '🦂',
        paragraphs: [
          'Scorpio is the zodiac\'s most misunderstood sign. Ruled by Pluto, the planet of transformation and the underworld, Scorpio lives in the territory of depth, power, and emotional truth. They are the psychologists, the detectives, and the alchemists of the zodiac, always seeking to understand what lies beneath the surface.',
          'At their core, Scorpio is driven by a need for authenticity and emotional truth. They have zero tolerance for pretense, superficiality, or performative emotions. Scorpio can detect a lie from across the room, and they would rather face an uncomfortable truth than live comfortably within a deception.',
          'The intensity of Scorpio is not a choice but a fundamental aspect of their nature. They experience emotions with a depth and power that can be overwhelming, both for them and for the people around them. This intensity is the source of both their greatest strength and their greatest struggle.',
          'Scorpio possesses a magnetic quality that draws people in despite, or perhaps because of, their air of mystery. There is something about Scorpio\'s depth, their quiet power, and their unwillingness to play social games that makes them fascinating to others. They do not seek attention, but they command it.',
        ],
      },
      {
        title: 'In Love & Relationships',
        icon: '💕',
        paragraphs: [
          'Love for Scorpio is not a casual affair. They approach relationships with the same intensity they bring to everything else, seeking a connection that goes beyond companionship to something that feels like soul-to-soul fusion. Half-hearted love holds no interest for them.',
          'Scorpio\'s ideal relationship is one where both partners are willing to be completely transparent. They want to know your deepest fears, your most private thoughts, and the parts of yourself you show no one else. In return, they offer access to their own emotional depths, which is a rare and precious gift.',
          'The physical dimension of love is profoundly important to Scorpio. They experience intimacy as an emotional and even spiritual act, and they approach it with an intensity and presence that can be transformative. For Scorpio, physical connection is another language for speaking truths that words cannot capture.',
          'The challenge in Scorpio relationships is managing their intense emotional needs. Their jealousy, their testing behaviors, and their fear of betrayal can create dynamics that push partners away. The mature Scorpio learns to trust without testing, to love without possessing, and to be vulnerable without building defenses.',
        ],
      },
      {
        title: 'Career & Purpose',
        icon: '🔍',
        paragraphs: [
          'Scorpio\'s professional gifts center on their ability to penetrate beneath the surface and navigate complexity. They are the ones you call when you need someone to uncover the truth, manage a crisis, or transform a failing system.',
          'Careers that involve investigation, analysis, and depth work are natural for Scorpio. Psychology, psychiatry, forensic science, investigative journalism, research, surgery, and criminal justice all leverage Scorpio\'s penetrating intellect and comfort with the darker aspects of human experience.',
          'Scorpio also excels in finance and strategic roles. Their ability to read people, anticipate moves, and maintain composure under pressure makes them formidable investors, negotiators, and business strategists. They understand power dynamics intuitively.',
          'The career pitfall for Scorpio is becoming so absorbed in their work that they isolate themselves. Their intensity and tendency toward secrecy can create professional environments where colleagues feel excluded or intimidated. The wisest Scorpios learn that transparency and collaboration do not diminish their power but amplify it.',
        ],
      },
      {
        title: 'Strengths & Gifts',
        icon: '✨',
        paragraphs: [
          'Scorpio\'s greatest gift is the ability to transform. They understand on a cellular level that growth requires death, that new beginnings require endings, and that the most beautiful things are forged in the hottest fires. This understanding allows them to guide themselves and others through the most challenging transitions.',
          'Their loyalty, once earned, is absolute. Scorpio does not love lightly, and when they commit to a person, a cause, or a mission, they bring their full power to bear. Having a Scorpio as an ally means having someone who will go to war for you without a moment\'s hesitation.',
          'Scorpio also brings a rare honesty to the world. In a culture that prizes comfort and positivity, Scorpio dares to speak the uncomfortable truths that others avoid. This can be confronting, but it is also deeply liberating for those who are ready to hear it.',
        ],
      },
      {
        title: 'Shadow & Growth',
        icon: '🌑',
        paragraphs: [
          'The Scorpio shadow lives in the misuse of power. When operating from their lower nature, Scorpio\'s ability to read people becomes manipulation, their loyalty becomes possessiveness, and their emotional depth becomes a weapon. They may use secrets as leverage, silence as punishment, and their understanding of human weakness as a means of control.',
          'Grudge-holding is a significant Scorpio shadow. Their exceptional memory, combined with their intensity of feeling, means that injuries can fester for years. The Scorpio who cannot forgive becomes poisoned by their own venom, replaying old wounds until they contaminate present relationships.',
          'The growth path for Scorpio involves learning to surrender. Discovering that vulnerability is not weakness, that trust is worth the risk of betrayal, and that the most profound power is the power to let go represents the Scorpio evolution. The scorpion must become the phoenix.',
          'Scorpio grows most through crisis. While no one welcomes suffering, Scorpio has a unique ability to find meaning and growth in experiences that devastate other signs. Each crisis is an invitation to die to an old version of themselves and be reborn into something more integrated and powerful.',
        ],
      },
      {
        title: 'Compatibility Quick Guide',
        icon: '💫',
        paragraphs: [
          'Scorpio finds their deepest connections with fellow water signs Cancer and Pisces. These relationships operate on an intuitive, emotional wavelength that Scorpio craves. With Cancer, there is a fierce mutual protectiveness and emotional depth. With Pisces, there is a spiritual and creative connection that transcends the ordinary.',
          'Earth signs, particularly Virgo and Capricorn, offer Scorpio the stability and groundedness that balances their emotional intensity. Virgo\'s analytical nature complements Scorpio\'s investigative mind. Capricorn matches Scorpio\'s ambition and shares their respect for power and strategy.',
          'The more challenging matches for Scorpio tend to be with Leo and Aquarius. Leo\'s need for attention can trigger Scorpio\'s jealousy, while Aquarius\' emotional detachment feels like rejection to depth-seeking Scorpio. These pairings require tremendous maturity from both signs but can produce extraordinary transformation when they work.',
        ],
      },
    ],
  },

  sagittarius: {
    personalityTraits: ['adventurous', 'optimistic', 'philosophical', 'free-spirited', 'honest', 'enthusiastic', 'expansive', 'humorous', 'worldly', 'independent'],
    strengths: ['Boundless optimism and enthusiasm', 'Philosophical depth and wisdom', 'Infectious sense of humor', 'Openness to diverse cultures and ideas', 'Natural teaching ability', 'Courageous exploration of the unknown'],
    weaknesses: ['Blunt to the point of tactlessness', 'Difficulty with commitment and follow-through', 'Restlessness and impatience with routine', 'Tendency to overpromise and underdeliver', 'Can be preachy or self-righteous'],
    loveStyle: [
      'Sagittarius approaches love as an adventure. They want a partner who is a fellow explorer, someone who is as excited about discovering new places, ideas, and experiences as they are. The ideal Sagittarius relationship feels like having a best friend you are also wildly attracted to.',
      'Freedom is non-negotiable for Sagittarius in love. They need space to be themselves, to pursue their interests, and to maintain their independence within the relationship. A partner who tries to clip Sagittarius\' wings will find that the Archer simply flies away.',
      'Sagittarius brings humor, honesty, and optimism to their relationships. They are the partner who makes you laugh until you cry, who tells you the truth even when it is uncomfortable, and who genuinely believes that together you can handle anything life throws at you.',
    ],
    careerStrengths: [
      'Sagittarius thrives in careers that combine intellectual stimulation with freedom and variety. Higher education, travel, publishing, philosophy, outdoor recreation, international business, and entrepreneurship all align with Sagittarius\' need for expansion and meaning.',
      'Their greatest professional strength is their ability to inspire through vision and enthusiasm. Sagittarius sees possibilities where others see limitations, and their optimism is genuinely contagious. They are natural motivators, teachers, and thought leaders.',
    ],
    famousPeople: ['Taylor Swift', 'Brad Pitt', 'Billie Eilish', 'Jay-Z', 'Scarlett Johansson', 'Walt Disney'],
    bestMatches: ['aries', 'leo', 'libra'],
    challengingMatches: ['virgo', 'pisces', 'taurus'],
    shadowSide: 'The Sagittarius shadow manifests as reckless irresponsibility and a fundamental unwillingness to be pinned down. When operating from their lower nature, Sagittarius uses their love of freedom as an excuse to avoid commitment, responsibility, and the harder aspects of adult life. Their honesty becomes tactlessness, their optimism becomes denial, and their philosophical nature becomes self-righteous preaching.',
    lifePurpose: 'Sagittarius is here to learn that true freedom includes responsibility. Their soul lesson involves discovering that the deepest adventures are found not just in new territories but in the unexplored depths of commitment, intimacy, and staying present when things get difficult. The evolved Sagittarius becomes the sage who has learned that wisdom comes not from accumulating experiences but from extracting meaning from them.',
    elementDescription: 'As a fire sign, Sagittarius embodies the expansive, illuminating quality of flame. Fire energy is enthusiastic, visionary, and action-oriented. It gives Sagittarius their boundless optimism, their philosophical courage, and their need to constantly expand their horizons. Like a bonfire that draws people together and lights up the darkness, Sagittarius\' fire warms, inspires, and guides.',
    sections: [
      {
        title: 'Personality Overview',
        icon: '🏹',
        paragraphs: [
          'Sagittarius is the zodiac\'s philosopher, adventurer, and eternal optimist. Ruled by Jupiter, the planet of expansion and wisdom, Sagittarius approaches life as a grand expedition, always seeking the next horizon, the bigger truth, and the deeper meaning. They are the ones who book a one-way ticket, enroll in a philosophy course on a whim, or change careers because they had an epiphany during a hike.',
          'At their core, Sagittarius is driven by a hunger for meaning. They are not content with the how of things; they need the why. This philosophical orientation gives them a depth that their playful exterior often disguises. Behind the jokes and the adventures is a mind that grapples seriously with life\'s biggest questions.',
          'Sagittarius\' optimism is one of their most defining and most valuable qualities. They genuinely believe that things will work out, that people are fundamentally good, and that the universe is organized around growth rather than suffering. This optimism is not naive but hard-won, maintained in the face of experience rather than in ignorance of it.',
          'There is a restless energy to Sagittarius that keeps them perpetually in motion, whether physically, intellectually, or spiritually. Routine feels like a cage to them, and they need regular infusions of novelty, travel, and new learning to feel fully alive. This restlessness can be both their greatest gift and their most significant challenge.',
        ],
      },
      {
        title: 'In Love & Relationships',
        icon: '💕',
        paragraphs: [
          'Sagittarius in love is a paradox: they are the most commitment-averse sign in the zodiac and yet, when they find the right person, they commit with surprising depth. The key is that Sagittarius needs a relationship that feels like freedom, not confinement.',
          'The ideal Sagittarius relationship is a partnership of adventurers. They want someone who will travel the world with them, debate philosophy at three in the morning, try the weird restaurant, and say yes to spontaneous road trips. Shared experiences are the glue that bonds Sagittarius to their partner.',
          'Honesty is Sagittarius\' love language, for better or worse. They will always tell their partner the truth, even when it stings. This radical honesty can be refreshing in a world full of white lies and unspoken resentments, but it can also be brutal. Learning to deliver truth with compassion is a lifelong lesson for Sagittarius.',
          'The relationship challenge for Sagittarius is staying present when the excitement fades. They can be prone to the grass-is-greener mentality, wondering what else might be out there even when they have something wonderful. The mature Sagittarius learns that the greatest adventure is depth, not distance.',
        ],
      },
      {
        title: 'Career & Purpose',
        icon: '🌍',
        paragraphs: [
          'Sagittarius thrives in careers that offer intellectual stimulation, freedom, and the opportunity to make a meaningful impact. They are natural teachers, writers, travelers, and entrepreneurs who need work that feeds their mind and their soul, not just their bank account.',
          'Higher education and publishing are classic Sagittarius domains. Their love of learning, combined with their gift for communicating big ideas in accessible ways, makes them inspiring professors, authors, journalists, and content creators. They translate wisdom into stories that change perspectives.',
          'International work of any kind suits Sagittarius. Import/export, diplomacy, travel writing, cultural consulting, and international development all allow them to exercise their love of different cultures and their ability to bridge diverse perspectives.',
          'The career pitfall for Sagittarius is their tendency to leap before they look. Their optimism can lead them to overcommit, overpromise, and take on ventures without adequate planning. The most successful Sagittarians learn to pair their vision with execution and their enthusiasm with follow-through.',
        ],
      },
      {
        title: 'Strengths & Gifts',
        icon: '✨',
        paragraphs: [
          'Sagittarius\' greatest gift is the ability to see possibility in every situation. While others focus on obstacles, Sagittarius is already imagining solutions. This optimistic vision is not empty positivity but a genuine ability to perceive pathways that others miss.',
          'Their humor is a genuine force for good. Sagittarius can find the comedy in even the darkest situations, and their laughter is medicine for everyone around them. They use humor not to avoid reality but to make it more bearable, and their ability to lighten heavy moments is a rare and precious gift.',
          'Sagittarius also brings a global perspective to every conversation. Their natural curiosity about other cultures, beliefs, and ways of life makes them genuinely open-minded. In an increasingly polarized world, Sagittarius\' ability to appreciate diversity and find common ground across differences is invaluable.',
        ],
      },
      {
        title: 'Shadow & Growth',
        icon: '🌑',
        paragraphs: [
          'The Sagittarius shadow lives in irresponsibility and avoidance. When operating from their lower nature, Sagittarius uses their love of freedom to evade the parts of life that require sustained effort, emotional depth, or accountability. They may ghost when things get heavy, make promises they have no intention of keeping, or hide behind humor to avoid genuine vulnerability.',
          'Tactlessness is another Sagittarius shadow. Their commitment to honesty can become a blunt instrument that wounds without healing. The immature Sagittarius confuses cruelty with truth and values being right over being kind.',
          'The growth path for Sagittarius involves learning that depth is its own adventure. Discovering that staying in one place, one relationship, or one pursuit long enough to truly master it is as exciting as constant novelty represents the Sagittarius evolution from wanderer to sage.',
          'Sagittarius grows most when life forces them to be present. Moments that require sustained attention, whether that is a partner in crisis, a project that takes years, or a personal challenge that cannot be outrun, are the experiences that deepen Sagittarius into their fullest expression.',
        ],
      },
      {
        title: 'Compatibility Quick Guide',
        icon: '💫',
        paragraphs: [
          'Sagittarius finds their most exciting connections with fellow fire signs Aries and Leo. These relationships are fueled by shared enthusiasm, mutual respect for independence, and a combined zest for life that is unmatched. With Aries, there is a spirit of bold adventure. With Leo, there is a warm, generous, and endlessly entertaining partnership.',
          'Air signs, particularly Libra and Aquarius, offer Sagittarius the intellectual stimulation and social freedom they crave. Libra brings beauty, diplomacy, and sophisticated conversation. Aquarius matches Sagittarius\' independence and shares their vision of a better world.',
          'The more challenging matches for Sagittarius tend to be with Virgo and Pisces. Virgo\'s attention to detail and need for structure can feel suffocating to free-spirited Sagittarius, while Pisces\' emotional sensitivity can be overwhelming. These pairings work best when both signs respect what the other brings to the table.',
        ],
      },
    ],
  },

  capricorn: {
    personalityTraits: ['ambitious', 'disciplined', 'responsible', 'strategic', 'dry-witted', 'patient', 'traditional', 'authoritative', 'pragmatic', 'resilient'],
    strengths: ['Exceptional discipline and work ethic', 'Strategic long-term thinking', 'Natural authority and leadership', 'Understated dry humor', 'Financial intelligence', 'Resilience through adversity'],
    weaknesses: ['Emotional guardedness and coldness', 'Workaholic tendencies', 'Can be rigid and controlling', 'Tendency toward pessimism', 'Status-consciousness'],
    loveStyle: [
      'Capricorn approaches love with the same strategic thinking they bring to their career. They are not interested in flings or relationships without potential. When Capricorn chooses a partner, they are choosing someone they can build a future with, and they invest accordingly.',
      'Capricorn\'s love is demonstrated through action and commitment, not flowery words. They show up, they provide, they plan for the future, and they build a shared life with the same patience and determination they apply to their professional ambitions. Their love is a structure designed to last.',
      'The emotional side of Capricorn love takes time to reveal itself. Behind their composed exterior is a deeply caring heart that expresses itself through quiet acts of devotion. The partner who is patient enough to wait for Capricorn to open up will discover a warmth and tenderness that their public persona never reveals.',
    ],
    careerStrengths: [
      'Capricorn is the zodiac\'s executive. They thrive in positions of authority and responsibility, and they have the discipline, strategic thinking, and work ethic to climb to the top of virtually any field. Business, finance, law, government, engineering, and architecture all reward Capricorn\'s strengths.',
      'Their greatest professional asset is their ability to think and plan long-term. While other signs chase quarterly results, Capricorn builds five-year strategies and has the patience to execute them. They understand that lasting success is built slowly, and they are willing to put in the years of effort required.',
    ],
    famousPeople: ['Michelle Obama', 'LeBron James', 'Dolly Parton', 'Denzel Washington', 'Kate Middleton', 'Martin Luther King Jr.'],
    bestMatches: ['taurus', 'virgo', 'pisces'],
    challengingMatches: ['aries', 'libra', 'leo'],
    shadowSide: 'The Capricorn shadow manifests as cold ambition and emotional repression. When operating from their lower nature, Capricorn sacrifices relationships, health, and joy on the altar of achievement. They can become calculating, status-obsessed, and emotionally unavailable. Their discipline becomes rigidity, their authority becomes authoritarianism, and their pragmatism becomes a cynicism that drains the color from life.',
    lifePurpose: 'Capricorn is here to learn that true authority comes from authenticity, not from titles or achievements. Their soul lesson involves discovering that vulnerability is a form of strength, that success without fulfillment is hollow, and that the structures they build must serve human flourishing, not just ambition. The evolved Capricorn becomes the wise elder who uses their worldly power to create conditions for others to thrive.',
    elementDescription: 'As an earth sign, Capricorn is the most structurally oriented of the zodiac. Earth energy is practical, ambitious, and concerned with tangible achievement. It gives Capricorn their extraordinary discipline, their respect for tradition, and their ability to build institutions and legacies that endure. Like mountain bedrock, Capricorn\'s earth energy is foundational, enduring, and immovable once set.',
    sections: [
      {
        title: 'Personality Overview',
        icon: '🏔️',
        paragraphs: [
          'Capricorn is the zodiac\'s master builder. Ruled by Saturn, the planet of structure, discipline, and time, Capricorn approaches life as a long-term project to be executed with precision and persistence. They are the ones who set ten-year goals, work toward them methodically, and actually achieve them.',
          'At their core, Capricorn is driven by a desire for mastery and respect. They want to be recognized not for flash or charisma but for genuine competence and achievement. This is the sign that earns respect the hard way, through years of dedicated effort and consistent excellence.',
          'The dry wit of Capricorn is one of their most underrated qualities. Behind their serious exterior is a sharp, sardonic humor that catches people off guard. Capricorn\'s jokes land precisely because you do not expect them, and their comedic timing is impeccable.',
          'Capricorn possesses a quiet resilience that is truly remarkable. They have often overcome significant hardships, particularly in youth, and these experiences have forged a toughness and self-reliance that serves them throughout life. Capricorn knows how to endure, how to wait, and how to rebuild from nothing.',
        ],
      },
      {
        title: 'In Love & Relationships',
        icon: '💕',
        paragraphs: [
          'Capricorn in love is a revelation to those who only know their professional exterior. Behind the composed, ambitious public persona is a deeply loyal and surprisingly tender partner who expresses love through commitment, provision, and quiet acts of devotion.',
          'Capricorn takes relationships as seriously as they take their career. They are not interested in casual connections or relationships without long-term potential. When they invest in a partnership, they invest fully, planning a shared future with the same strategic thinking they apply to their professional goals.',
          'The challenge in loving a Capricorn is patience. They open up slowly, and their emotional expression is subtle rather than dramatic. A partner who needs constant verbal reassurance may struggle with Capricorn\'s show-don\'t-tell approach to love. Understanding that Capricorn expresses love through responsibility, planning, and showing up consistently is key.',
          'Physical affection with Capricorn often improves over time as trust deepens. The early stages may feel reserved, but as they relax their guard, a surprisingly passionate and sensual nature emerges. Capricorn love, like Capricorn wine, gets better with age.',
        ],
      },
      {
        title: 'Career & Purpose',
        icon: '🏛️',
        paragraphs: [
          'Capricorn is the zodiac\'s natural CEO. They thrive in environments that reward discipline, strategy, and long-term thinking. Business, finance, law, government, architecture, and engineering all leverage their strongest qualities.',
          'Their career trajectory is typically one of steady, methodical ascent. Capricorn is not looking for shortcuts or overnight success. They understand that the most enduring achievements are built on foundations of competence, reputation, and sustained effort.',
          'Leadership comes naturally to Capricorn, though their style is authoritative rather than charismatic. They lead by example, set high standards, and command respect through their own work ethic and competence. People follow Capricorn because they trust their judgment and admire their dedication.',
          'The career trap for Capricorn is defining themselves entirely by their work. Their discipline and ambition can become workaholism, and their focus on achievement can crowd out the relationships, experiences, and creative pursuits that make life meaningful beyond the office.',
        ],
      },
      {
        title: 'Strengths & Gifts',
        icon: '✨',
        paragraphs: [
          'Capricorn\'s greatest gift is the ability to build things that last. In a culture of disposability and short attention spans, Capricorn reminds us that the most valuable things are built slowly, maintained carefully, and designed to endure. They are the architects of legacy.',
          'Their discipline is extraordinary and genuinely inspiring. Capricorn can maintain focus and effort over timelines that would defeat less determined signs. They understand delayed gratification not just intellectually but viscerally, and this understanding gives them a genuine competitive advantage in every area of life.',
          'Capricorn also brings a grounding wisdom to every group they join. Their pragmatism and strategic thinking keep projects on track, expectations realistic, and resources well-managed. They are the adults in the room when the room needs one.',
        ],
      },
      {
        title: 'Shadow & Growth',
        icon: '🌑',
        paragraphs: [
          'The Capricorn shadow lives in emotional repression and status obsession. When operating from their lower nature, Capricorn can become so focused on achievement that they sacrifice everything else on the altar of success, including their health, their relationships, and their capacity for joy.',
          'Pessimism is a real risk for Capricorn. Their realistic assessment of challenges can shade into a habitual negativity that drains the energy from themselves and everyone around them. The Capricorn who expects the worst may protect themselves from disappointment but also blocks themselves from hope and spontaneity.',
          'The growth path for Capricorn involves learning that vulnerability is not failure. Discovering that asking for help is not weakness, that showing emotions is not unprofessional, and that a life measured only by achievements is ultimately hollow represents the Capricorn evolution.',
          'Capricorn grows most when they allow themselves to play. Learning to be silly, to waste time pleasurably, to pursue activities with no productive outcome, and to express joy openly represents a revolutionary act for this serious sign. The Capricorn who learns to laugh freely becomes truly formidable.',
        ],
      },
      {
        title: 'Compatibility Quick Guide',
        icon: '💫',
        paragraphs: [
          'Capricorn finds their most grounded connections with fellow earth signs Taurus and Virgo. These relationships are built on shared values of reliability, practical achievement, and a combined work ethic that produces remarkable results. With Taurus, there is sensual comfort and shared ambition. With Virgo, there is mutual respect for excellence and a devotion to continuous improvement.',
          'Water signs, particularly Pisces and Scorpio, offer Capricorn the emotional depth they need but rarely seek on their own. Pisces softens Capricorn\'s hard edges and opens them to imagination, spirituality, and unconditional acceptance. Scorpio matches Capricorn\'s intensity and strategic mind, creating a power partnership of exceptional depth.',
          'The more challenging matches for Capricorn tend to be with Aries and Libra. Aries\' impulsive nature can feel reckless to methodical Capricorn, while Libra\'s indecisiveness and social focus can seem frivolous. These pairings work best when both signs appreciate the discipline the other brings to different domains.',
        ],
      },
    ],
  },

  aquarius: {
    personalityTraits: ['visionary', 'independent', 'humanitarian', 'unconventional', 'intellectual', 'innovative', 'detached', 'progressive', 'rebellious', 'original'],
    strengths: ['Visionary thinking and innovation', 'Genuine concern for humanity', 'Intellectual independence', 'Ability to see the future', 'Unconventional problem-solving', 'Commitment to social justice'],
    weaknesses: ['Emotional detachment and aloofness', 'Stubbornness disguised as principle', 'Difficulty with intimate relationships', 'Can be contrarian for its own sake', 'Tendency to intellectualize feelings'],
    loveStyle: [
      'Aquarius approaches love as an intellectual and spiritual partnership. They need a partner who is first and foremost a friend, someone who shares their values, stimulates their mind, and respects their fierce independence. The typical romantic playbook holds little appeal for them.',
      'Freedom is essential for Aquarius in love. Not freedom to pursue others, but freedom to remain themselves. They need space to think, to pursue their causes and interests, and to exist as a complete individual within the relationship. A partner who tries to merge with Aquarius or demand constant togetherness will trigger their withdrawal.',
      'When Aquarius loves, they love the totality of a person, quirks, unconventional qualities, and all. They are attracted to originality and authenticity, and they offer a kind of acceptance that is remarkably liberating. Being loved by Aquarius means being free to be exactly who you are.',
    ],
    careerStrengths: [
      'Aquarius thrives in careers that allow them to innovate, challenge the status quo, and contribute to the greater good. Technology, social activism, science, humanitarian work, psychology, and any field that benefits from original thinking aligns with Aquarius energy.',
      'Their greatest professional strength is their ability to see solutions that no one else can imagine. Aquarius thinks outside conventional frameworks, and their innovations often seem impractical until they prove to be ahead of their time. They are the disruptors who reshape industries and paradigms.',
    ],
    famousPeople: ['Oprah Winfrey', 'Harry Styles', 'Shakira', 'Cristiano Ronaldo', 'Ellen DeGeneres', 'Abraham Lincoln'],
    bestMatches: ['gemini', 'libra', 'sagittarius'],
    challengingMatches: ['taurus', 'scorpio', 'cancer'],
    shadowSide: 'The Aquarius shadow manifests as cold detachment and intellectual superiority. When operating from their lower nature, Aquarius can become so committed to their ideals that they lose touch with individual human beings. Their independence becomes isolation, their unconventionality becomes contrarianism, and their humanitarian concern becomes abstract and impersonal. The shadow Aquarius cares about humanity but cannot be bothered with individual humans.',
    lifePurpose: 'Aquarius is here to learn that true revolution starts with the heart. Their soul lesson involves discovering that the future they envision must include emotional intelligence, that connection to individuals is as important as connection to ideals, and that their uniqueness is not diminished by intimacy. The evolved Aquarius becomes the visionary who changes the world by first learning to be fully present with the person in front of them.',
    elementDescription: 'As an air sign, Aquarius inhabits the realm of ideas, innovation, and collective consciousness. Air energy is intellectual, communicative, and future-oriented. It gives Aquarius their visionary thinking, their social awareness, and their ability to detach from personal concerns to see the bigger picture. Like the upper atmosphere where weather patterns form, Aquarius\' air energy shapes the collective climate of ideas.',
    sections: [
      {
        title: 'Personality Overview',
        icon: '⚡',
        paragraphs: [
          'Aquarius is the zodiac\'s revolutionary. Ruled by Uranus, the planet of disruption and innovation, Aquarius sees the world not as it is but as it could be. They are the inventors, the activists, the eccentrics, and the visionaries who push humanity toward its next evolution.',
          'At their core, Aquarius is driven by a genuine desire to make the world better. This is not abstract idealism but a lived commitment to progress, equality, and innovation. Aquarius will challenge any tradition that has outlived its usefulness and champion any idea that serves the collective good.',
          'The independence of Aquarius is legendary and non-negotiable. They have an almost allergic reaction to conformity, and they will instinctively move against any force that tries to limit their freedom or dictate their identity. This can make them rebels, but it also makes them pioneers.',
          'There is a paradox at the heart of Aquarius: they are deeply committed to humanity but can struggle with individual human relationships. They may organize a charity event for thousands while forgetting to call their mother. This is not hypocrisy but a genuine tension between their love of the collective and their discomfort with personal intimacy.',
        ],
      },
      {
        title: 'In Love & Relationships',
        icon: '💕',
        paragraphs: [
          'Love for Aquarius begins with the mind. They need a partner who can challenge their thinking, share their values, and engage in the kind of deep, wide-ranging conversation that Aquarius craves. Physical attraction is important but secondary to intellectual and ideological compatibility.',
          'Aquarius\' ideal relationship is a partnership of equals who maintain their individual identities. They are attracted to people who have their own passions, their own social circles, and their own inner world. Aquarius is not looking for their other half but for a fellow whole person.',
          'The emotional challenge in Aquarius relationships is their tendency to intellectualize rather than feel. They can analyze their emotions with impressive clarity while remaining disconnected from the actual experience of those emotions. A partner who can gently draw Aquarius into their feelings without making them feel trapped does them a great service.',
          'Aquarius brings a refreshing lack of jealousy and possessiveness to their relationships. They genuinely want their partner to have their own life, friends, and interests. This trust and respect for independence, when reciprocated, creates a uniquely healthy relationship dynamic.',
        ],
      },
      {
        title: 'Career & Purpose',
        icon: '🔮',
        paragraphs: [
          'Aquarius thrives in careers that place them at the forefront of innovation and social change. Technology, scientific research, social activism, psychology, non-profit leadership, and any field that rewards original thinking and challenges conventional wisdom are natural Aquarius domains.',
          'Their ability to think differently is their greatest professional asset. Aquarius sees solutions that exist outside established frameworks, and their innovations often anticipate trends that others will not recognize for years. They are the early adopters, the disruptors, and the paradigm shifters.',
          'Aquarius also excels in humanitarian and community-oriented roles. Their genuine concern for the collective, combined with their organizational skills and their ability to rally people around a cause, makes them effective advocates, community organizers, and social entrepreneurs.',
          'The career challenge for Aquarius is collaboration. Their conviction in their own vision can make them difficult team players, and their tendency to dismiss conventional approaches can alienate colleagues who have valuable practical experience. The most effective Aquarians learn to balance innovation with inclusivity.',
        ],
      },
      {
        title: 'Strengths & Gifts',
        icon: '✨',
        paragraphs: [
          'Aquarius\' greatest gift is the ability to envision a better future. While others are bound by what is, Aquarius is already living in what could be. This visionary quality has driven every major social and technological advancement in human history, and it continues to push the boundaries of possibility.',
          'Their intellectual courage is remarkable. Aquarius is willing to think the unthinkable, to challenge sacred cows, and to stand alone in their convictions when necessary. This willingness to be an outlier, to risk social disapproval in service of truth, is a rare and valuable form of bravery.',
          'Aquarius also brings a genuine egalitarianism to every space they inhabit. They treat everyone with the same respect regardless of status, and they instinctively notice and challenge power imbalances. Their commitment to fairness is not performative but deeply embedded in their worldview.',
        ],
      },
      {
        title: 'Shadow & Growth',
        icon: '🌑',
        paragraphs: [
          'The Aquarius shadow lives in detachment and intellectual arrogance. When operating from their lower nature, Aquarius can become cold, dismissive, and so committed to their ideas that they lose touch with human feeling. They may mistake emotional distance for objectivity and treat people as abstractions rather than individuals.',
          'Contrarianism is another Aquarius shadow. Their instinct to challenge convention can become reflexive opposition, where they disagree not because they have a better idea but simply because they cannot stand to agree with the mainstream. This can make them exhausting and isolating to be around.',
          'The growth path for Aquarius involves learning that emotional connection is not a limitation. Discovering that vulnerability deepens rather than diminishes their vision, that individual relationships are as important as collective causes, and that the most revolutionary act is sometimes simply being present with another human being represents the Aquarius evolution.',
          'Aquarius grows most when they allow themselves to need someone. A sign so committed to independence can struggle with the interdependence that real intimacy requires. The Aquarius who learns to lean on others without losing themselves becomes a truly integrated visionary.',
        ],
      },
      {
        title: 'Compatibility Quick Guide',
        icon: '💫',
        paragraphs: [
          'Aquarius finds their most stimulating connections with fellow air signs Gemini and Libra. These relationships thrive on intellectual rapport, social engagement, and mutual respect for independence. With Gemini, there is a rapid-fire exchange of ideas and a shared love of novelty. With Libra, there is a harmonious partnership of idealists who balance each other beautifully.',
          'Fire signs, particularly Sagittarius and Aries, bring warmth and action to Aquarius\' world. Sagittarius matches Aquarius\' independence and shares their love of big ideas and social consciousness. Aries brings a bold energy that energizes Aquarius and helps them turn their visions into reality.',
          'The more challenging matches for Aquarius tend to be with Taurus and Scorpio. Taurus\' attachment to routine and material comfort can feel stifling to change-oriented Aquarius, while Scorpio\'s emotional intensity and demand for deep intimacy can overwhelm the Water Bearer. These pairings require significant bridging of fundamentally different approaches to life.',
        ],
      },
    ],
  },

  pisces: {
    personalityTraits: ['empathic', 'imaginative', 'spiritual', 'compassionate', 'dreamy', 'intuitive', 'artistic', 'gentle', 'selfless', 'mystical'],
    strengths: ['Boundless compassion and empathy', 'Profound creative imagination', 'Spiritual depth and wisdom', 'Ability to heal through presence', 'Intuitive understanding of others', 'Capacity for unconditional love'],
    weaknesses: ['Difficulty with boundaries', 'Tendency toward escapism', 'Can be overly self-sacrificing', 'Impressionable and easily influenced', 'Avoidance of harsh realities'],
    loveStyle: [
      'Pisces loves without limits or conditions. When they fall for someone, they merge emotionally and spiritually, offering a depth of devotion that is both beautiful and overwhelming. Being loved by a Pisces is like being wrapped in a warm ocean current that carries you somewhere you did not know existed.',
      'Romance for Pisces is a spiritual experience. They see their partner through an idealized lens that can be enchanting but also unrealistic. The challenge is maintaining that romantic vision while accepting the very human imperfections that every real relationship contains.',
      'Pisces needs a partner who can provide both emotional depth and practical grounding. They bring the poetry, the intuition, and the unconditional acceptance. In return, they need someone who helps them stay connected to reality, who protects their sensitive nature without exploiting it, and who values their inner world as much as the outer one.',
    ],
    careerStrengths: [
      'Pisces thrives in careers that allow them to channel their creativity, compassion, and spiritual depth. The arts, music, film, healing professions, counseling, spiritual guidance, marine biology, and any role that serves the vulnerable align with Pisces\' gifts.',
      'Their greatest professional strength is their imagination. Pisces sees possibilities that exist beyond the logical and the practical, and they have the ability to create art, experiences, and solutions that touch people on a soul level. Their work has an intangible quality that transcends mere technique.',
    ],
    famousPeople: ['Rihanna', 'Albert Einstein', 'Steve Jobs', 'Kurt Cobain', 'Lupita Nyong\'o', 'Michelangelo'],
    bestMatches: ['cancer', 'scorpio', 'capricorn'],
    challengingMatches: ['gemini', 'sagittarius', 'virgo'],
    shadowSide: 'The Pisces shadow manifests as escapism and victimhood. When operating from their lower nature, Pisces uses their rich inner world as a hiding place from the challenges of external reality. They may turn to substances, fantasy, codependent relationships, or spiritual bypassing to avoid facing their problems. Their compassion can become self-sacrificing martyrdom, and their sensitivity can become a justification for refusing to develop emotional resilience.',
    lifePurpose: 'Pisces is here to learn that compassion must include self-compassion. Their soul lesson involves discovering that spiritual transcendence is not about escaping the material world but about bringing spiritual awareness into everyday life. The evolved Pisces becomes the artist-healer who channels the divine through their human experience, creating beauty and meaning without losing themselves in the process.',
    elementDescription: 'As a water sign, Pisces inhabits the deepest and most expansive waters of the zodiac. Water energy is emotional, intuitive, and spiritually attuned. It gives Pisces their extraordinary empathy, their psychic sensitivity, and their ability to dissolve boundaries between self and other. Like the ocean that connects all continents, Pisces\' water energy reminds us that all life is fundamentally interconnected.',
    sections: [
      {
        title: 'Personality Overview',
        icon: '🌊',
        paragraphs: [
          'Pisces is the zodiac\'s mystic, the artist, and the healer. Ruled by Neptune, the planet of dreams, imagination, and spiritual transcendence, Pisces moves through the world with one foot in ordinary reality and one foot in the unseen. They are the most intuitive, creative, and emotionally permeable sign in the zodiac.',
          'At their core, Pisces is driven by a desire for connection that transcends the ordinary. They seek experiences, relationships, and forms of expression that touch the soul. This is the sign of the poet, the musician, the mystic, and the compassionate healer who understands suffering because they feel it as their own.',
          'The sensitivity of Pisces is both their greatest gift and their most significant challenge. They absorb the emotions of everyone around them, often without knowing it, and they can struggle to distinguish between their own feelings and those they have absorbed from others. This emotional porosity gives them their extraordinary empathy but also makes the world an overwhelming place.',
          'There is an ethereal quality to Pisces that sets them apart from the more grounded signs. They seem to inhabit a slightly different dimension, and their gaze often seems to be focused on something just beyond the visible. This otherworldly quality is not affectation but a genuine expression of their deep connection to the imaginal realm.',
        ],
      },
      {
        title: 'In Love & Relationships',
        icon: '💕',
        paragraphs: [
          'Pisces in love is a transcendent experience. They love with a totality and tenderness that can make their partner feel like the most important person in the universe. Pisces does not just love you; they see you, feel you, and accept you at the deepest level of your being.',
          'The romantic nature of Pisces is genuine and deeply felt. They are the sign most likely to write love letters, create art inspired by their partner, and express devotion in ways that feel almost otherworldly in their sincerity. For Pisces, love is not a transaction but a spiritual practice.',
          'The challenge in Pisces relationships is their tendency toward idealization and self-sacrifice. They can project their romantic fantasies onto their partner, then feel devastated when reality does not match the dream. They can also give so much of themselves that they lose their own identity in the relationship.',
          'A Pisces in a healthy relationship is one of the most devoted, intuitive, and loving partners in the zodiac. They anticipate their partner\'s emotional needs, create an atmosphere of unconditional acceptance, and bring a depth of feeling that makes every moment together feel meaningful.',
        ],
      },
      {
        title: 'Career & Purpose',
        icon: '🎭',
        paragraphs: [
          'Pisces\' professional gifts are centered on creativity, healing, and service. They excel in roles that allow them to channel their rich inner world into forms that benefit others, whether through art, music, therapeutic practice, or spiritual guidance.',
          'The arts are Pisces\' most natural professional domain. Music, film, photography, dance, writing, and visual art all provide channels for their extraordinary imagination. Pisces artists create work that resonates on an emotional and spiritual level, often achieving a quality of beauty that transcends technique.',
          'Healing professions also align beautifully with Pisces energy. Their natural empathy and intuitive understanding of suffering make them gifted therapists, counselors, nurses, and alternative healing practitioners. They create therapeutic spaces where people feel truly seen and held.',
          'The career challenge for Pisces is self-promotion and boundaries. Their selfless nature can lead them to undervalue their work, accept less compensation than they deserve, or give away their energy until they are depleted. The most successful Pisces learn to protect their gifts with practical boundaries while still remaining open to the flow of inspiration.',
        ],
      },
      {
        title: 'Strengths & Gifts',
        icon: '✨',
        paragraphs: [
          'Pisces\' greatest gift is unconditional compassion. They understand suffering not as an abstract concept but as a lived experience, and their empathy allows them to hold space for others\' pain without judgment or the need to fix. In a world that often responds to suffering with platitudes, Pisces offers genuine presence.',
          'Their creative imagination is a force of nature. Pisces sees beauty, pattern, and meaning where others see only chaos. They dream in vivid color, create art that seems channeled from somewhere beyond the personal, and access creative states that other signs can only achieve through years of practice.',
          'Pisces also brings a spiritual awareness to the world that serves as a necessary counterbalance to materialism and cynicism. They remind us that life contains dimensions beyond the measurable, that mystery is a valid response to existence, and that the invisible world of feeling, meaning, and connection is as real as anything we can touch.',
        ],
      },
      {
        title: 'Shadow & Growth',
        icon: '🌑',
        paragraphs: [
          'The Pisces shadow lives in escapism and victimhood. When operating from their lower nature, Pisces uses their rich inner world as a refuge from a reality they find too harsh. This escape can take many forms: substance use, excessive fantasy, codependent relationships, or spiritual bypassing that uses spiritual concepts to avoid dealing with practical problems.',
          'Boundary issues are central to the Pisces shadow. Their natural porosity means they can lose themselves in other people\'s emotions, problems, and even identities. The Pisces who has not developed clear boundaries becomes a sponge for the world\'s suffering, ultimately drowning in feelings that are not even their own.',
          'The growth path for Pisces involves learning to ground their spiritual nature in practical reality. Discovering that boundaries are not barriers but bridges, that self-care is not selfishness, and that their gifts are most powerful when they have a stable foundation beneath them represents the Pisces evolution.',
          'Pisces grows most when they learn to be present in their body and in the material world. Practices that connect them to physical reality, whether through exercise, nature, cooking, or simply paying their bills on time, provide the grounding that allows their spiritual and creative gifts to flow without overwhelming them.',
        ],
      },
      {
        title: 'Compatibility Quick Guide',
        icon: '💫',
        paragraphs: [
          'Pisces finds their deepest connections with fellow water signs Cancer and Scorpio. These relationships operate on an intuitive, emotional wavelength that feels like coming home. With Cancer, there is a tender, nurturing bond built on mutual emotional understanding. With Scorpio, there is an intense, transformative connection that explores the deepest waters of the psyche.',
          'Earth signs, particularly Capricorn and Taurus, offer Pisces the grounding and stability they need to thrive. Capricorn provides structure, protection, and practical support that allows Pisces to dream safely. Taurus shares Pisces\' love of beauty and sensory pleasure, creating a relationship rich in comfort and aesthetic appreciation.',
          'The more challenging matches for Pisces tend to be with Gemini and Sagittarius. Gemini\'s intellectual approach to emotions can feel dismissive to sensitive Pisces, while Sagittarius\' bluntness and need for constant movement can overwhelm Pisces\' gentle nature. These pairings can work beautifully when both signs develop patience and appreciation for radically different ways of experiencing the world.',
        ],
      },
    ],
  },
};

/* ── Public API ───────────────────────────────────────────────── */

export function getZodiacSignProfile(sign: ZodiacSign): ZodiacSignProfile {
  const base = SIGNS[sign];
  const profile = SIGN_PROFILES[sign];

  return {
    sign,
    name: base.name,
    glyph: base.glyph,
    element: base.element,
    modality: base.modality,
    ruler: base.ruler,
    dates: base.dates,
    ...profile,
  };
}

export function getAllZodiacProfiles(): ZodiacSignProfile[] {
  return ALL_SIGN_KEYS.map(getZodiacSignProfile);
}

/** Get the previous and next sign in zodiac order */
export function getAdjacentSigns(sign: ZodiacSign): { prev: ZodiacSign; next: ZodiacSign } {
  const idx = ALL_SIGN_KEYS.indexOf(sign);
  const prev = ALL_SIGN_KEYS[(idx - 1 + 12) % 12];
  const next = ALL_SIGN_KEYS[(idx + 1) % 12];
  return { prev, next };
}

/** Brief description for index cards */
export function getSignBriefDescription(sign: ZodiacSign): string {
  const descriptions: Record<ZodiacSign, string> = {
    aries: 'The fearless pioneer who charges ahead with bold confidence and infectious enthusiasm.',
    taurus: 'The steadfast builder who creates lasting beauty through patience and unwavering devotion.',
    gemini: 'The brilliant communicator whose quick mind and curiosity keep the world endlessly fascinating.',
    cancer: 'The intuitive nurturer who creates emotional sanctuaries and loves with their whole heart.',
    leo: 'The radiant leader whose warmth, generosity, and creative spirit light up every room.',
    virgo: 'The devoted healer who improves everything they touch with precision and quiet care.',
    libra: 'The graceful diplomat who creates harmony, beauty, and genuine connection wherever they go.',
    scorpio: 'The magnetic transformer who seeks truth at the deepest levels and loves with fierce intensity.',
    sagittarius: 'The philosophical adventurer whose optimism and humor make every day an expedition.',
    capricorn: 'The master builder who turns ambition into achievement through discipline and strategic patience.',
    aquarius: 'The visionary rebel who sees the future and works tirelessly to make it a reality.',
    pisces: 'The compassionate mystic whose boundless imagination and empathy heal the world around them.',
  };
  return descriptions[sign];
}
