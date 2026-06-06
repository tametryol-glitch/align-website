/* ──────────────────────────────────────────────────────────────
   Planets in Houses Content
   120 placements: 10 planets x 12 houses.
   ────────────────────────────────────────────────────────────── */

export interface PlanetHousePlacement {
  planet: string;
  house: number;
  slug: string;
  symbol: string;
  title: string;
  intro: string;
  sections: { heading: string; body: string }[];
  keywords: string[];
}

interface PlanetMeta {
  name: string;
  symbol: string;
  domain: string;
}

const PLANETS: PlanetMeta[] = [
  { name: 'Sun', symbol: '☉', domain: 'identity, ego, and life purpose' },
  { name: 'Moon', symbol: '☽', domain: 'emotions, instincts, and inner needs' },
  { name: 'Mercury', symbol: '☿', domain: 'communication, thought, and learning' },
  { name: 'Venus', symbol: '♀', domain: 'love, beauty, and values' },
  { name: 'Mars', symbol: '♂', domain: 'drive, ambition, and desire' },
  { name: 'Jupiter', symbol: '♃', domain: 'growth, luck, and expansion' },
  { name: 'Saturn', symbol: '♄', domain: 'discipline, structure, and karma' },
  { name: 'Uranus', symbol: '♅', domain: 'innovation, rebellion, and awakening' },
  { name: 'Neptune', symbol: '♆', domain: 'dreams, spirituality, and illusion' },
  { name: 'Pluto', symbol: '♇', domain: 'transformation, power, and rebirth' },
];

const HOUSE_THEMES: { area: string; lifeArea: string }[] = [
  { area: 'self, identity, and personal appearance', lifeArea: 'Self-Identity' },
  { area: 'finances, possessions, and self-worth', lifeArea: 'Resources' },
  { area: 'communication, siblings, and local environment', lifeArea: 'Communication' },
  { area: 'home, family, roots, and emotional foundations', lifeArea: 'Home & Family' },
  { area: 'creativity, romance, children, and self-expression', lifeArea: 'Creativity & Romance' },
  { area: 'health, daily routines, work, and service', lifeArea: 'Health & Work' },
  { area: 'partnerships, marriage, and one-on-one relationships', lifeArea: 'Partnerships' },
  { area: 'transformation, shared resources, and deep intimacy', lifeArea: 'Transformation' },
  { area: 'higher education, travel, philosophy, and beliefs', lifeArea: 'Higher Learning' },
  { area: 'career, public reputation, and life direction', lifeArea: 'Career & Legacy' },
  { area: 'friendships, community, hopes, and social causes', lifeArea: 'Community & Ideals' },
  { area: 'spirituality, the unconscious, and hidden realms', lifeArea: 'Spirituality' },
];

function ordinal(n: number): string {
  const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };
  return `${n}${suffixes[n] || 'th'}`;
}

/* ── Content generation ─────────────────────────────────────────── */

const PLANET_HOUSE_CONTENT: Record<string, { intro: string; sections: { heading: string; body: string }[] }> = {
  // Sun
  'sun-in-1st-house': {
    intro: 'The Sun in the 1st house creates a person whose identity radiates outward with unmistakable force. You are here to be seen, to lead, and to express your authentic self without apology. Your vitality and sense of purpose are immediately apparent to everyone you meet.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'With the Sun illuminating your house of self, you possess a natural charisma and strong sense of identity that draws others to you. People often look to you for leadership, and you have the ability to inspire confidence simply by being present. Your physical vitality tends to be robust, and you project an aura of warmth and self-assurance. You instinctively understand who you are, and this self-knowledge becomes your greatest asset in navigating life.' },
      { heading: 'Challenges & Growth', body: 'The challenge of this placement is learning to balance your powerful sense of self with genuine awareness of others. You may come across as self-centered without intending to, or you might dominate conversations and situations simply because your presence is so strong. Growing into this placement means recognizing that true leadership involves lifting others up, not just shining your own light. When you channel your considerable vitality into service and authentic self-expression rather than ego gratification, you become magnetic in the most positive sense.' },
      { heading: 'Integration', body: 'At its highest expression, Sun in the 1st house creates individuals who embody their life purpose visibly and courageously. You become a living example of authenticity, showing others that it is possible to be fully yourself. Your journey involves learning that your identity is not threatened by acknowledging the brilliance of others, and that your light shines brightest when it illuminates the path for everyone around you.' },
    ],
  },
  'sun-in-2nd-house': {
    intro: 'The Sun in the 2nd house anchors your identity in the realm of values, resources, and self-worth. You find your purpose through building something tangible and lasting, and your sense of self is deeply connected to what you own, earn, and value.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'This placement gives you an innate understanding of value, both material and personal. You have a talent for generating wealth and accumulating resources because your vital energy naturally flows toward financial and material security. You understand intuitively that money is a form of energy, and you know how to direct it. Your self-worth is intimately tied to your ability to provide, and you take great pride in the quality of what you produce and possess.' },
      { heading: 'Challenges & Growth', body: 'The primary challenge here is confusing net worth with self-worth. When financial setbacks occur, you may feel as though your very identity is threatened. Learning to separate who you are from what you have is essential growth work for this placement. You may also struggle with possessiveness in relationships, holding on too tightly to people and things. The deeper lesson involves discovering that your truest values are internal and cannot be lost or taken away, no matter what happens in the material world.' },
    ],
  },
  'sun-in-3rd-house': {
    intro: 'The Sun in the 3rd house lights up your mind and your ability to communicate. You are here to learn, to share ideas, and to connect people through the power of words and thought.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your identity is woven into how you think and communicate. You are naturally articulate, curious, and versatile, with an ability to make complex ideas accessible to others. Writing, teaching, speaking, and any form of information exchange energizes you. Your relationship with siblings and neighbors often plays a significant role in shaping who you are, and your local environment feels like an extension of your personality.' },
      { heading: 'Challenges & Growth', body: 'The challenge is depth versus breadth. You may scatter your considerable mental energy across too many interests, becoming a perpetual beginner who never masters anything. Gossip or superficial chatter can become a trap if you do not direct your communicative gifts toward meaningful expression. Learning to listen as deeply as you speak and to sit with a single subject long enough to develop true expertise transforms this placement from clever to wise.' },
    ],
  },
  'sun-in-4th-house': {
    intro: 'The Sun in the 4th house roots your identity in home, family, and emotional foundations. You carry an ancestral flame, and your life purpose is deeply intertwined with creating security and belonging.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Home is your kingdom, and family is your domain. You have a profound need to create a space that reflects who you are, and you often become the emotional center of your family system. This placement frequently indicates a strong connection to one parent, often the father or a dominant parental figure, whose influence shapes your sense of self in lasting ways. You possess remarkable emotional resilience and the ability to nurture others through creating environments of safety and warmth.' },
      { heading: 'Challenges & Growth', body: 'The danger lies in making your home your entire world, avoiding the public sphere where your light is also needed. Unresolved family patterns can keep you trapped in dynamics that no longer serve you, and you may unconsciously recreate childhood environments in adult life. The growth path involves honoring your roots while building your own foundation, one that reflects your evolved values rather than inherited ones. Your later years often bring the greatest fulfillment as you finally create the home and family life that truly represents who you have become.' },
    ],
  },
  'sun-in-5th-house': {
    intro: 'The Sun in the 5th house is one of its most joyful placements. You are here to create, to play, to love, and to express the unique spark that only you carry. Life is your stage.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Creativity flows through you like sunlight through a prism, breaking into brilliant colors that delight everyone around you. You have a natural talent for performance, romance, and any form of artistic expression. Children and the childlike spirit invigorate you. Romance is not just a part of life for you but a vital expression of your identity, and you approach love with dramatic flair and genuine warmth. You bring joy wherever you go because you understand instinctively that life is meant to be celebrated.' },
      { heading: 'Challenges & Growth', body: 'The shadow side can manifest as drama addiction, an excessive need for applause, or treating life as a performance rather than an authentic experience. You may struggle with gambling tendencies, taking creative risks that are more reckless than courageous, or treating romantic partners as audiences rather than equals. Maturity for this placement means learning that the deepest creativity emerges from vulnerability, and that genuine self-expression requires the courage to be imperfect and still show up.' },
    ],
  },
  'sun-in-6th-house': {
    intro: 'The Sun in the 6th house channels your identity through service, health, and the daily rituals that structure your life. You find meaning in the details, and your purpose unfolds through devotion to your craft and care for your body.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You are someone who finds deep satisfaction in doing things well. Your work ethic is extraordinary, and you often define yourself through your job, your daily habits, and your commitment to self-improvement. Health consciousness comes naturally, and you intuitively understand the mind-body connection. You excel in service-oriented roles where your meticulous attention to detail can improve systems, heal bodies, or refine processes. Your dedication to excellence inspires everyone who works alongside you.' },
      { heading: 'Challenges & Growth', body: 'Perfectionism is your constant companion and your greatest obstacle. You may work yourself into exhaustion, developing stress-related health issues because you cannot rest until everything is exactly right. Learning that imperfection is human and that your worth is not determined by your productivity is essential. The evolved expression of this placement involves serving others from a place of wholeness rather than obligation, and understanding that self-care is not selfish but necessary for sustained service.' },
    ],
  },
  'sun-in-7th-house': {
    intro: 'The Sun in the 7th house places your identity firmly in the mirror of relationships. You discover who you are through partnership, and your life purpose unfolds most fully when you are connected to another person.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Partnership is not merely important to you; it is essential to your sense of self. You have remarkable diplomatic skills, an innate understanding of fairness, and the ability to see situations from perspectives other than your own. You are drawn to strong, charismatic partners who reflect qualities you are developing within yourself. Marriage and committed relationships tend to be defining chapters of your life story, and you often achieve your greatest accomplishments through collaboration rather than solo effort.' },
      { heading: 'Challenges & Growth', body: 'The fundamental challenge is losing yourself in others. You may become so focused on your partner that you neglect your own identity, or you might project qualities onto others that actually belong to you. Codependency is a genuine risk, as is staying in relationships that have run their course simply because you cannot imagine yourself alone. The growth path involves developing a strong internal sense of self that does not depend on external validation from a partner, so that you enter relationships from wholeness rather than need.' },
    ],
  },
  'sun-in-8th-house': {
    intro: 'The Sun in the 8th house draws your identity into the depths. You are here to transform, to probe beneath surfaces, and to discover the power that lives in life\'s most intense experiences.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You possess an extraordinary ability to see what others cannot or will not see. Psychology, research, healing, and anything involving shared resources or deep intimacy comes naturally to you. You understand power dynamics intuitively and have a talent for navigating complex financial arrangements, inheritances, and investments. Crisis does not frighten you; it energizes you. You are at your best when life demands everything you have, because intensity is where you truly come alive.' },
      { heading: 'Challenges & Growth', body: 'The shadow of this placement involves control issues, obsessive tendencies, and a fascination with darkness that can become consuming. You may struggle with trust, keeping secrets as a form of power, or manipulating situations to maintain emotional control. Jealousy and possessiveness in intimate relationships can be intense. The transformative journey requires learning to surrender control, to trust the process of death and rebirth that defines your life, and to use your penetrating awareness for healing rather than manipulation.' },
    ],
  },
  'sun-in-9th-house': {
    intro: 'The Sun in the 9th house sends your identity soaring toward distant horizons. You are here to seek truth, to expand beyond the boundaries of your origin, and to share the wisdom you gather on your journey.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You are a natural philosopher, teacher, and adventurer. Travel, higher education, and exposure to different cultures are not luxuries for you but necessities for your soul\'s development. Your optimism and faith in life\'s larger meaning inspire others to think bigger and reach further. You may be drawn to publishing, teaching, law, or any field that allows you to broadcast ideas across wide audiences. Your enthusiasm for learning never diminishes, and you approach life with a sense of wonder that keeps you perpetually young in spirit.' },
      { heading: 'Challenges & Growth', body: 'The danger lies in becoming a perpetual seeker who never settles long enough to integrate what has been learned. Intellectual arrogance, moralizing, and imposing your beliefs on others are shadow expressions. You may also romanticize foreign cultures while devaluing your own roots. Maturity for this placement means learning that the deepest truths are often found in ordinary moments, not just on mountaintops, and that wisdom means living your philosophy rather than just preaching it.' },
    ],
  },
  'sun-in-10th-house': {
    intro: 'The Sun in the 10th house elevates your identity to the most visible position in the chart. You are here to achieve, to build a legacy, and to serve as a public figure whose authority inspires others.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Career and public standing are central to your sense of self. You possess natural authority and ambition, with an instinctive understanding of how to climb hierarchies and earn respect. People naturally look to you for leadership in professional settings, and you have the discipline and strategic thinking to reach the highest levels of your chosen field. Your reputation matters deeply to you, and you work hard to ensure that your public image reflects your true character.' },
      { heading: 'Challenges & Growth', body: 'The risk is becoming so consumed by career ambition that you sacrifice personal relationships, health, and inner peace on the altar of success. You may define yourself entirely by your title or achievements, leaving you vulnerable to existential crisis when career setbacks occur. The evolved expression means building a career that serves not just your ego but the larger community, and remembering that the most enduring legacies are built on character, not credentials.' },
    ],
  },
  'sun-in-11th-house': {
    intro: 'The Sun in the 11th house places your identity within the collective. You are here to envision the future, to build communities, and to channel your personal light into causes larger than yourself.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Friendship and community are where you shine. You have a gift for bringing diverse people together around shared ideals, and your social circle tends to be eclectic, progressive, and intellectually stimulating. You are drawn to humanitarian causes and social innovation, and you find your purpose through contributing to movements that advance collective well-being. Your vision for what is possible in the future inspires others to think beyond current limitations.' },
      { heading: 'Challenges & Growth', body: 'The challenge is maintaining individual identity within the group. You may lose yourself in causes, organizations, or social circles, neglecting your own needs for the sake of the collective. You might also become so focused on future ideals that you fail to appreciate the present moment. Emotional intimacy can be difficult because you are more comfortable in group settings than in one-on-one vulnerability. Growth means learning that serving the collective starts with honoring your own authentic self.' },
    ],
  },
  'sun-in-12th-house': {
    intro: 'The Sun in the 12th house places your identity in the most mysterious and spiritual region of the chart. You are here to dissolve ego boundaries, serve from behind the scenes, and connect with the divine.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You possess an extraordinary capacity for compassion, spiritual insight, and creative imagination. The unseen world is as real to you as the physical one, and you may have psychic abilities, vivid dreams, or an intuitive understanding of the human condition that borders on the mystical. You work best behind the scenes, in hospitals, monasteries, creative studios, or any environment where the ordinary rules of ego do not apply. Your empathy is boundless, and you have a gift for helping others through their darkest moments.' },
      { heading: 'Challenges & Growth', body: 'This is one of the most challenging Sun placements because the 12th house naturally dissolves everything the Sun represents: ego, identity, and personal will. You may struggle with low self-esteem, escapism through substances or fantasy, or a persistent feeling that you do not belong in the world. Boundaries are difficult because your psychic permeability makes it hard to distinguish your feelings from those of others. The spiritual path for this placement involves learning that dissolution of ego is not destruction but transcendence, and that you can serve the divine while still honoring your human needs.' },
    ],
  },

  // Moon
  'moon-in-1st-house': {
    intro: 'The Moon in the 1st house makes your emotions visible to the world. Your feelings are written across your face, and your instinctive reactions define how others perceive you.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You are extraordinarily empathic and responsive to your environment. People find you approachable because your emotional transparency creates instant intimacy. You have a nurturing presence that makes others feel safe, and your instincts about people and situations are remarkably accurate. Your appearance may change frequently, reflecting your emotional state, and you have a natural connection to the feminine principle regardless of your gender. Your capacity to feel deeply is both your superpower and your vulnerability.' },
      { heading: 'Challenges & Growth', body: 'Emotional volatility is the primary challenge. Your moods shift visibly and rapidly, which can confuse others and make professional settings difficult. You may be overly reactive, taking everything personally, or you might use emotional displays to manipulate situations. Learning to create a stable inner foundation while honoring your emotional sensitivity is the central task. When you develop emotional intelligence rather than just emotional intensity, you become a powerful force for healing and connection.' },
    ],
  },
  'moon-in-2nd-house': {
    intro: 'The Moon in the 2nd house ties your emotional security to material stability. Your feelings fluctuate with your financial situation, and comfort is a deeply emotional need.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You have an instinctive understanding of value and a natural talent for creating financial security. Material comfort is not a superficial desire but a genuine emotional need; you cannot relax or feel safe until your basic resources are secured. You may have talent in food, real estate, or any industry that provides nourishment and shelter. Your relationship with money is deeply personal, often reflecting patterns inherited from your mother or family lineage.' },
      { heading: 'Challenges & Growth', body: 'Emotional spending and financial anxiety can create a feast-or-famine cycle. When you feel insecure emotionally, you may overspend to comfort yourself, or conversely, hoard resources out of fear. Your self-worth fluctuates with your bank balance, creating unnecessary suffering. The growth path involves learning that emotional security comes from within, not from any amount of money or possessions, and developing a relationship with abundance that is grounded rather than anxious.' },
    ],
  },
  'moon-in-3rd-house': {
    intro: 'The Moon in the 3rd house fills your mind with emotional intelligence. You think with your feelings and feel with your thoughts, creating a unique blend of heart and intellect.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your communication style is emotionally rich and deeply engaging. You have an innate ability to read between the lines, sensing what people mean beneath what they say. Writing, especially personal or autobiographical writing, comes naturally because you process your emotions through words. Your relationship with siblings carries strong emotional currents, and your early learning environment significantly shaped your emotional patterns. You have a gift for making emotional concepts intellectually accessible.' },
      { heading: 'Challenges & Growth', body: 'Your thinking can be clouded by emotional bias, making objectivity difficult. You may gossip as a way of processing feelings, or become emotionally attached to ideas in ways that prevent you from updating your beliefs when presented with new information. Anxiety and restless thinking can keep you up at night. The challenge is developing mental clarity without suppressing your emotional intelligence, learning to use both faculties in harmony rather than allowing one to overwhelm the other.' },
    ],
  },
  'moon-in-4th-house': {
    intro: 'The Moon in the 4th house is in its natural home, creating a person for whom family, ancestry, and emotional roots are the foundation of everything. Your inner world is rich, deep, and profoundly connected to where you come from.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'This is one of the strongest Moon placements. Your emotional intelligence is profound, your intuition is highly developed, and your ability to create nurturing spaces is exceptional. Home is your sanctuary, and you invest tremendous emotional energy into making it beautiful and safe. You carry ancestral wisdom in your bones and may feel a deep connection to your family history and cultural heritage. Your memory, especially emotional memory, is extraordinary, and you never forget how someone made you feel.' },
      { heading: 'Challenges & Growth', body: 'Clinging to the past and to family patterns that no longer serve you is the core challenge. You may idealize childhood or, conversely, be trapped in unresolved childhood wounds that color every adult relationship. Leaving home, either literally or emotionally, can feel like a betrayal. Learning to honor your roots while building your own foundation, and to nurture without suffocating, is the essential developmental task. When you find the balance, you become an anchor of emotional stability for everyone in your life.' },
    ],
  },
  'moon-in-5th-house': {
    intro: 'The Moon in the 5th house infuses creativity and romance with deep emotional currents. You need creative self-expression the way others need food and water.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your emotional life is dramatic, colorful, and deeply creative. You process feelings through art, performance, play, and romance, and you bring an emotional authenticity to creative work that touches others profoundly. Your relationship with children, whether your own or others, is a significant source of emotional fulfillment. Romance and falling in love are not casual for you but deeply emotional experiences that feel like matters of life and death. You have a natural ability to create joy and to find emotional nourishment in beauty.' },
      { heading: 'Challenges & Growth', body: 'Drama can become a way of life, with emotional highs and lows that exhaust both you and those around you. You may seek constant romantic excitement because stable love does not produce the emotional intensity you crave. Creative blocks can trigger emotional crises, and you may rely on external validation through applause or admiration rather than finding satisfaction in the creative process itself. Growth involves learning to create from emotional depth rather than emotional need, and to find security in steady love rather than only in passionate beginnings.' },
    ],
  },
  'moon-in-6th-house': {
    intro: 'The Moon in the 6th house channels emotional energy into service, health, and daily routines. You nurture through practical care, and your emotional state directly impacts your physical well-being.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You are a natural healer whose emotional sensitivity translates into practical care for others. Your daily routines are emotional rituals that ground you, and disruptions to your schedule can be deeply unsettling. You have an instinctive understanding of the mind-body connection and may be drawn to holistic health, nutrition, or healing arts. At work, you create emotionally supportive environments and are often the person colleagues turn to when they need comfort or practical help with personal problems.' },
      { heading: 'Challenges & Growth', body: 'Your body absorbs emotional stress directly, manifesting anxiety through digestive issues, headaches, or chronic tension. You may become a compulsive helper, neglecting your own needs while serving everyone else. Hypochondria or health anxiety can develop when emotional issues go unaddressed. The growth path involves learning to care for yourself with the same devotion you offer others, and recognizing that your body is communicating emotional truths that deserve attention rather than suppression.' },
    ],
  },
  'moon-in-7th-house': {
    intro: 'The Moon in the 7th house draws your deepest emotional needs into the realm of partnership. You crave emotional security through relationship, and your feelings are profoundly shaped by your closest connections.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You have an extraordinary capacity for emotional intimacy and partnership. Your ability to attune to a partner\'s feelings creates bonds of remarkable depth, and you often know what your loved one needs before they ask. You are a natural mediator, able to sense the emotional currents in any interaction and guide conversations toward resolution. Marriage and committed partnership are central to your emotional well-being, and you thrive when you have a stable, emotionally available partner who mirrors your depth of feeling.' },
      { heading: 'Challenges & Growth', body: 'Emotional dependency is the core challenge. You may feel incomplete without a partner, rushing into relationships to fill an internal void. You can lose your emotional center by absorbing your partner\'s moods, and your own feelings may become difficult to distinguish from theirs. The tendency to project your emotional needs onto partners rather than owning them creates repeated disappointments. Growth involves developing emotional self-sufficiency so that partnership enriches your life rather than defines it.' },
    ],
  },
  'moon-in-8th-house': {
    intro: 'The Moon in the 8th house plunges your emotional life into the depths. You feel everything intensely, and your emotional landscape is marked by profound transformations that strip away everything that is not authentic.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your emotional depth is extraordinary. You have an instinctive understanding of the hidden dimensions of human experience, including death, sexuality, power, and the unconscious. You are a natural therapist, detective, or healer because you can sense what lies beneath the surface of any situation. Emotional intimacy for you means total exposure, nothing held back. Your ability to sit with darkness and to accompany others through their most painful experiences without flinching is a rare and precious gift.' },
      { heading: 'Challenges & Growth', body: 'Emotional extremes can make daily life exhausting. You may cycle between intense emotional merging and complete withdrawal, unable to find a middle ground. Trust issues run deep, often rooted in early experiences of betrayal or loss that left lasting emotional scars. Jealousy, possessiveness, and emotional manipulation can sabotage the very intimacy you crave. The transformative journey involves learning to feel deeply without being consumed, to trust without guarantees, and to use your emotional intensity for healing rather than control.' },
    ],
  },
  'moon-in-9th-house': {
    intro: 'The Moon in the 9th house gives your emotional life a philosophical and adventurous quality. You find emotional comfort in meaning, travel, and the expansion of understanding.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You are emotionally nourished by learning, travel, and exposure to different cultures and philosophies. Your feelings have a broadly optimistic quality, and you process emotions through a framework of meaning and purpose. Foreign lands may feel more like home than your birthplace, and you might form your deepest emotional bonds with people from different backgrounds. Your emotional generosity and faith in life\'s goodness inspire others to think bigger and more expansively about their own possibilities.' },
      { heading: 'Challenges & Growth', body: 'The challenge is emotional restlessness and a tendency to flee difficult feelings by seeking the next adventure, philosophy, or spiritual practice. You may intellectualize emotions rather than feeling them, wrapping pain in philosophical abstractions to avoid confronting it directly. The growth path involves learning that emotional depth is found not only in far-flung explorations but also in the intimate, sometimes uncomfortable territory of your own inner world.' },
    ],
  },
  'moon-in-10th-house': {
    intro: 'The Moon in the 10th house brings your emotional life into public view. Your feelings are connected to your career and reputation, and you need to feel emotionally fulfilled through your professional life.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your career is an emotional calling, not just a job. You need to feel emotionally connected to your work, and you thrive in professions that involve nurturing, caring for others, or serving the public. You have an instinctive understanding of public sentiment and may be naturally skilled at marketing, public relations, or any field that requires emotional intelligence in a professional context. Your professional reputation is deeply personal to you, and you take criticism of your work as personally as criticism of your character.' },
      { heading: 'Challenges & Growth', body: 'Emotional vulnerability in the professional sphere can be both your strength and your Achilles heel. You may take workplace conflicts home, inability to separate your emotional life from your career causing stress in both domains. Public criticism can feel devastating, and career setbacks may trigger deep emotional crises. The growth path involves building professional resilience while maintaining the emotional authenticity that makes your work meaningful.' },
    ],
  },
  'moon-in-11th-house': {
    intro: 'The Moon in the 11th house places your emotional needs within the context of community, friendship, and collective ideals. You find emotional security through belonging to groups and working toward shared visions.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Friendship is not casual for you but deeply emotional. You form bonds within groups that carry the same intensity others reserve for family. Your emotional sensitivity makes you attuned to group dynamics, and you naturally gravitate toward communities that share your values and ideals. You have a gift for creating emotional connections within organizations, making workplaces and social groups feel more like families. Your hopes and wishes for the future carry strong emotional charge, motivating you to work tirelessly for causes you believe in.' },
      { heading: 'Challenges & Growth', body: 'You may lose your individual emotional identity within the group, conforming to collective moods rather than honoring your own feelings. Friend-dependency can become as problematic as romantic codependency, with your emotional stability resting on the approval of your social circle. The challenge is maintaining your emotional center while remaining open to collective connection, and learning that belonging does not require the sacrifice of your individual emotional truth.' },
    ],
  },
  'moon-in-12th-house': {
    intro: 'The Moon in the 12th house creates an intensely private emotional life. Your feelings run deep beneath the surface, and much of your emotional processing happens in solitude, dreams, and the vast spaces of the unconscious.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your emotional sensitivity borders on the psychic. You absorb the feelings of others like a sponge, and you have access to emotional depths that most people never reach. Dreams are vivid and often prophetic, and you may receive emotional guidance from sources that defy rational explanation. You have a natural compassion for the suffering of others and may be drawn to work in hospitals, prisons, ashrams, or any institution that serves the marginalized. Your capacity for unconditional love, when healthy, is truly extraordinary.' },
      { heading: 'Challenges & Growth', body: 'Emotional overwhelm is a constant risk. You may not know where your feelings end and others begin, leading to confusion, exhaustion, and a tendency toward escapism through sleep, substances, or fantasy. Unexplained sadness, vague fears, and a persistent sense of emotional homelessness can haunt you. The spiritual path for this placement involves learning to create healthy emotional boundaries while maintaining your extraordinary sensitivity, and discovering that solitude is your sanctuary rather than your prison.' },
    ],
  },

  // Mercury
  'mercury-in-1st-house': {
    intro: 'Mercury in the 1st house makes communication your defining characteristic. You are perceived as intelligent, articulate, and eternally curious, and your identity is closely tied to your mental abilities.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You think on your feet and communicate with a quickness that impresses everyone around you. Your mind is always active, processing information and generating ideas at remarkable speed. You are naturally witty, adaptable, and youthful in both appearance and energy. First impressions are shaped by your verbal intelligence, and people remember you for what you said and how cleverly you said it. You excel in any situation that requires quick thinking, verbal agility, or the ability to process multiple streams of information simultaneously.' },
      { heading: 'Challenges & Growth', body: 'Mental restlessness and difficulty committing to a single identity or path are the primary challenges. You may reinvent yourself so frequently that others find you unreliable or hard to pin down. Nervousness, anxiety, and overthinking can undermine your considerable gifts. The growth path involves learning to slow down enough to develop depth alongside your natural breadth, and to use your remarkable communication skills to express authenticity rather than to perform cleverness.' },
    ],
  },
  'mercury-in-2nd-house': {
    intro: 'Mercury in the 2nd house connects your intellect to the world of values and resources. You think about money, and you can make money through thinking.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You have a practical, resourceful mind that naturally gravitates toward financial planning, business strategy, and the assessment of value. Your communication style is deliberate and grounded, and people trust your judgment because you think before you speak. You may earn your living through writing, teaching, speaking, or any field that monetizes intellectual ability. Your ideas have practical applications, and you have a talent for translating abstract concepts into concrete, valuable outcomes.' },
      { heading: 'Challenges & Growth', body: 'Your thinking can become overly fixated on material concerns, reducing everything to its financial value and missing the richness of experiences that cannot be monetized. Mental rigidity about money, either hoarding mentality or anxiety about security, can limit your intellectual freedom. Growth involves expanding your definition of value to include the intangible and learning that your mind is your greatest resource, not the bank account it generates.' },
    ],
  },
  'mercury-in-3rd-house': {
    intro: 'Mercury in the 3rd house is in its natural domicile, creating a mind of exceptional agility, curiosity, and communicative power. You are a born communicator.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your mind is a high-speed processor, absorbing and transmitting information with extraordinary efficiency. You are the natural messenger, the connector, the person who always knows the latest news and shares it with engaging style. Writing, journalism, teaching, marketing, and all forms of media communication are natural domains for you. Your relationship with siblings and neighbors tends to be mentally stimulating, and your local environment is full of interesting connections and conversations.' },
      { heading: 'Challenges & Growth', body: 'Information overload and mental scattered-ness are real risks. You may know a little about everything but not enough about anything, and your conversations may skip between topics so rapidly that depth is sacrificed. The challenge is learning to distinguish signal from noise, to develop sustained attention, and to use your remarkable communicative gifts to share ideas that truly matter rather than simply filling the air with words.' },
    ],
  },
  'mercury-in-4th-house': {
    intro: 'Mercury in the 4th house turns your home into a library and your family conversations into formative intellectual experiences. Your thinking is shaped by your roots.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You think about home, family, and emotional security with great intellectual clarity. Your home is likely filled with books, and your family conversations shaped your intellectual development profoundly. You have a talent for real estate, interior design, genealogy, or any field that requires thinking about domestic spaces and family systems. Your memory, particularly for family stories and childhood experiences, is sharp and detailed. You may work from home or create a home office that becomes your intellectual sanctuary.' },
      { heading: 'Challenges & Growth', body: 'Your thinking may be overly influenced by family opinions and childhood conditioning, making it difficult to form independent intellectual perspectives. You might ruminate on family problems or replay childhood conversations endlessly. The growth challenge involves developing your own intellectual voice distinct from your family narrative while honoring the mental foundation your upbringing provided.' },
    ],
  },
  'mercury-in-5th-house': {
    intro: 'Mercury in the 5th house makes creativity a mental process and romance an intellectual adventure. You think playfully and express ideas with dramatic flair.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your mind is inherently creative, and you approach intellectual challenges with the enthusiasm of play. You are a natural storyteller, able to transform ideas into compelling narratives that entertain and educate. Communication with children comes naturally, and you may excel as a teacher, children\'s author, or in any role that requires making learning fun. Romantic attraction begins in the mind for you, and intellectual stimulation is a prerequisite for any lasting relationship. You have a gift for creative writing, comedy, and performing arts.' },
      { heading: 'Challenges & Growth', body: 'You may intellectualize romance, overthinking relationships instead of feeling them. Creative projects might remain as brilliant ideas that never reach completion because the excitement of conception fades before the discipline of execution kicks in. The growth path involves learning to follow through on your creative visions and to allow your heart, not just your mind, to guide your romantic choices.' },
    ],
  },
  'mercury-in-6th-house': {
    intro: 'Mercury in the 6th house creates a mind perfectly suited for analysis, problem-solving, and the refinement of daily systems. You think in terms of efficiency and improvement.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your analytical mind excels at breaking complex problems into manageable parts and developing systematic solutions. You are detail-oriented without losing sight of practical outcomes, and your communication style is precise, helpful, and informative. Health-related fields, editing, data analysis, project management, and quality control all suit your intellectual temperament. You have a natural ability to improve any system you encounter, spotting inefficiencies that others overlook and devising elegant solutions.' },
      { heading: 'Challenges & Growth', body: 'Overthinking, worry, and analysis paralysis are your mental traps. You may become so focused on finding flaws that you cannot appreciate what is working well. Critical thinking can become critical speaking, with your precise observations landing as unwelcome criticism. The growth path involves learning to direct your analytical gifts toward constructive improvement rather than fault-finding, and to allow some areas of life to be messy and imperfect without triggering mental distress.' },
    ],
  },
  'mercury-in-7th-house': {
    intro: 'Mercury in the 7th house makes communication the foundation of your relationships. You need a partner who can match your mental agility and engage in meaningful dialogue.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You are a natural negotiator, mediator, and relationship communicator. You process your experiences through dialogue, and your relationships thrive when there is open, honest, and intellectually stimulating conversation. You are drawn to partners who are intelligent and articulate, and you may form your most significant relationships through intellectual connection. Legal communication, counseling, and partnership-based business ventures are natural domains for your skills.' },
      { heading: 'Challenges & Growth', body: 'You may intellectualize relationship problems rather than feeling through them, or use clever arguments to win disputes rather than seeking genuine understanding. Indecisiveness in partnerships can be paralyzing, as you see every side of every issue and struggle to commit to a position. Growth involves learning that some relationship truths cannot be reasoned through but must be felt, and that genuine communication includes listening at least as much as speaking.' },
    ],
  },
  'mercury-in-8th-house': {
    intro: 'Mercury in the 8th house gives you a mind that naturally penetrates beneath surfaces. You think about what others avoid: death, sex, power, and the hidden forces that shape human behavior.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your mental penetration is extraordinary. You are a natural researcher, investigator, and depth psychologist, able to detect patterns and motivations that remain invisible to others. You communicate with intensity and precision about taboo subjects, making the unspeakable speakable. Financial analysis, particularly involving taxes, inheritances, debt, and shared resources, comes naturally. You have a talent for strategic thinking and can navigate complex power dynamics with intellectual clarity.' },
      { heading: 'Challenges & Growth', body: 'Obsessive thinking, paranoia, and mental fixation on worst-case scenarios are the shadow expressions. You may use information as a weapon, hoarding secrets or using knowledge to manipulate. Trust issues can make open communication difficult, and you may test others mentally before revealing your own thoughts. Growth involves learning to use your penetrating intellect for healing and truth-seeking rather than control, and to share your insights generously rather than strategically.' },
    ],
  },
  'mercury-in-9th-house': {
    intro: 'Mercury in the 9th house expands your mind to its widest horizons. You think in terms of big ideas, universal truths, and philosophical frameworks that give life meaning.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your mind is naturally philosophical, seeking to understand the broadest possible context for any piece of information. You excel in higher education, publishing, international communication, and any field that requires thinking across cultural and intellectual boundaries. Foreign languages may come easily, and you are drawn to ideas from traditions other than your own. Your communication style is enthusiastic and inspiring, and you have a gift for making complex philosophical concepts accessible and exciting.' },
      { heading: 'Challenges & Growth', body: 'You may become preachy or dogmatic, so attached to your philosophical framework that you dismiss perspectives that do not fit. Detail-oriented work can feel suffocating, and you may overlook important specifics in your rush toward the big picture. Growth involves developing the patience to attend to details without losing your visionary perspective, and learning that true wisdom includes the humility to say you do not know.' },
    ],
  },
  'mercury-in-10th-house': {
    intro: 'Mercury in the 10th house ties your communication skills directly to your career and public reputation. You are known for your ideas, and your professional success depends on how effectively you share them.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your career is likely centered on communication in some form: writing, speaking, teaching, media, technology, or management. You have a natural authority when communicating in professional settings, and your ideas carry weight in your industry. You think strategically about your career path and can articulate your professional vision with clarity and conviction. Networking comes naturally, and you advance through the quality of your ideas and your ability to communicate them persuasively.' },
      { heading: 'Challenges & Growth', body: 'You may become overly calculating in your communication, saying what will advance your career rather than what you truly think. The pressure to maintain your professional reputation can stifle intellectual honesty. Growth involves learning to communicate with both strategic awareness and genuine authenticity, and to use your public platform for ideas that serve the greater good rather than just your personal advancement.' },
    ],
  },
  'mercury-in-11th-house': {
    intro: 'Mercury in the 11th house connects your thinking to the collective mind. You are an ideas person whose intellectual gifts are amplified through group collaboration and social networks.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You think most brilliantly in group settings, where the cross-pollination of ideas sparks your intellectual creativity. You are drawn to progressive, future-oriented thinking and may be involved in technology, social media, or any field that connects minds across distances. Your friendships are intellectually stimulating, and you choose companions based on mental compatibility. You have a gift for understanding social trends and communicating ideas that resonate with collective needs and aspirations.' },
      { heading: 'Challenges & Growth', body: 'Conforming your thinking to group opinion is the subtle trap. You may sacrifice independent thought for social acceptance, or become so focused on being intellectually progressive that you dismiss traditional wisdom prematurely. Growth involves maintaining your unique intellectual perspective while remaining open to collective intelligence, and learning that the most valuable contribution you can make to any group is your authentic, unfiltered thinking.' },
    ],
  },
  'mercury-in-12th-house': {
    intro: 'Mercury in the 12th house creates a mind that operates beneath the surface of ordinary consciousness. Your thinking is intuitive, imaginative, and connected to the collective unconscious.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your mind has access to realms that rational thinking cannot reach. You think in images, symbols, and dreams, and your intuitive insights often prove more accurate than logical analysis. You have a natural gift for poetry, music, spirituality, and any form of expression that transcends literal meaning. Your compassion allows you to understand and communicate about suffering with extraordinary sensitivity. Working behind the scenes, in solitude, or in institutional settings allows your unique mental gifts to flourish.' },
      { heading: 'Challenges & Growth', body: 'Mental confusion, difficulty expressing your thoughts clearly, and a tendency toward escapist thinking are significant challenges. You may struggle to organize your ideas or to articulate what you know intuitively in ways others can understand. Secret anxieties and unspoken fears can circulate endlessly in your mind. Growth involves developing practices that bridge your intuitive intelligence and rational expression, such as journaling, meditation, or creative writing, so that the wisdom you access can be shared with the world.' },
    ],
  },

  // Venus
  'venus-in-1st-house': {
    intro: 'Venus in the 1st house blesses you with natural charm, physical beauty, and an instinctive desire to create harmony in every interaction. You attract people and opportunities with effortless grace.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You radiate beauty and social grace in a way that is immediately apparent to everyone who meets you. Your physical appearance tends to be attractive or at least pleasing, and you have an innate sense of style and aesthetics. People are drawn to you because you create an atmosphere of harmony and pleasure simply by being present. You are a natural diplomat, able to smooth over conflicts and make everyone feel valued. The arts, fashion, beauty, and any field that values aesthetic sensibility are natural domains for your considerable talents.' },
      { heading: 'Challenges & Growth', body: 'The danger of this lovely placement is relying too heavily on charm and appearance rather than developing substance. You may avoid conflict at all costs, becoming a people-pleaser who sacrifices authenticity for approval. Vanity and superficiality can develop if you receive too much validation for your looks and not enough for your character. Growth involves learning that true beauty comes from within and that the most attractive quality you possess is the courage to be genuinely yourself, even when that is not universally pleasing.' },
    ],
  },
  'venus-in-2nd-house': {
    intro: 'Venus in the 2nd house is beautifully placed, connecting love and beauty with the tangible world of resources and values. You have refined taste and a talent for creating material comfort.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You have a natural eye for quality and a talent for attracting financial abundance. Your relationship with money is harmonious, and you tend to accumulate beautiful possessions that bring genuine pleasure. You value comfort, luxury, and sensory pleasure, not from greed but from a genuine appreciation for the finer things in life. Your financial instincts are sound, and you may earn well through arts, beauty, hospitality, or any industry that caters to pleasure and aesthetics.' },
      { heading: 'Challenges & Growth', body: 'Material attachment and defining your worth through possessions are the primary risks. You may stay in unfulfilling relationships because they provide financial security, or you might use shopping and luxury as substitutes for genuine emotional connection. Growth involves developing a relationship with beauty and abundance that is appreciative rather than possessive, and learning that the most valuable things in life cannot be bought.' },
    ],
  },
  'venus-in-3rd-house': {
    intro: 'Venus in the 3rd house sweetens your communication style and brings beauty to your intellectual pursuits. You attract through words and connect through ideas shared with grace.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your communication style is naturally elegant, diplomatic, and charming. You have a gift for saying the right thing at the right time, and your words carry a musical quality that makes them memorable. You may be drawn to poetry, lyric writing, or any form of communication that combines beauty with meaning. Your relationships with siblings and neighbors tend to be harmonious, and your local social life is active and enjoyable. You attract romantic interest through your intelligence and verbal wit.' },
      { heading: 'Challenges & Growth', body: 'You may use verbal charm to manipulate rather than connect, or avoid saying difficult truths because you want every conversation to be pleasant. Superficial social connections can substitute for deep intimacy. Growth involves learning to communicate with both beauty and honesty, and to use your gift for language to express truths that matter rather than just pleasantries that charm.' },
    ],
  },
  'venus-in-4th-house': {
    intro: 'Venus in the 4th house creates a deep need for a beautiful, harmonious home life. Your capacity for love is rooted in domestic warmth and emotional security.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your home is your masterpiece. You have an instinctive ability to create beautiful, comfortable spaces that make everyone who enters feel welcome and loved. Family relationships are central to your happiness, and you approach domestic life with genuine love and aesthetic care. You may have inherited artistic talent or a love of beauty from your family lineage. Real estate, interior design, and any home-based creative work suit you well. Your later years tend to be especially blessed, as the home and family life you have cultivated bears its sweetest fruit.' },
      { heading: 'Challenges & Growth', body: 'You may become so focused on creating a perfect home that you avoid engaging with the outside world, or you might tolerate unhealthy family dynamics because you value peace over truth. Nostalgia can prevent you from moving forward. Growth involves creating a home that reflects your evolved values rather than an idealized version of the past, and learning that true domestic harmony includes room for honest disagreement.' },
    ],
  },
  'venus-in-5th-house': {
    intro: 'Venus in the 5th house is one of the most joyful placements in astrology. Love, creativity, and pleasure flow abundantly, and your life is enriched by romance and artistic expression.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You are a natural romantic and artist. Love and creativity are not separate pursuits but a single, flowing expression of your most authentic self. You attract romantic attention easily and approach love with warmth, generosity, and a flair for the dramatic. Children bring you immense joy, and you have a gift for nurturing their creative expression. Your artistic talents may manifest in visual arts, music, theater, or any medium that allows you to channel your love of beauty into creative form. You understand intuitively that joy is a form of worship.' },
      { heading: 'Challenges & Growth', body: 'The ease with which you attract love can lead to serial romancing, where the thrill of new love becomes addictive and commitment feels like a loss of freedom. You may be self-indulgent, prioritizing pleasure over responsibility. Growth involves learning that the deepest pleasures come not from the excitement of new romance but from the richness of love that has been tended over time, and that creative discipline enhances rather than diminishes artistic joy.' },
    ],
  },
  'venus-in-6th-house': {
    intro: 'Venus in the 6th house brings grace to your daily routines and harmony to your working relationships. You find beauty in service and love through practical care.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You bring an aesthetic sensibility to everything you do, from organizing your workspace to preparing meals to structuring your daily routines. Your work environment must be beautiful and harmonious for you to function at your best. You are a gracious colleague who smooths workplace tensions and creates pleasant professional relationships. Health and wellness routines that involve beauty, such as skincare, yoga, or mindful cooking, bring you deep satisfaction. You show love through acts of service, and your care is always given with elegance and attention to detail.' },
      { heading: 'Challenges & Growth', body: 'You may settle for relationships that are practical rather than passionate, choosing partners who are useful over those who ignite your heart. Obsessing over physical imperfections or spending excessive energy on appearance-related health routines can become unhealthy. Growth involves recognizing that service given from love is beautiful, but service given from obligation eventually breeds resentment, and that your daily life deserves both beauty and genuine passion.' },
    ],
  },
  'venus-in-7th-house': {
    intro: 'Venus in the 7th house is one of the strongest placements for love and partnership. You are a natural partner, and your relationships are characterized by beauty, fairness, and genuine devotion.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Partnership is your art form. You have an extraordinary ability to create harmonious, beautiful, and mutually enriching relationships. You are drawn to partners who are attractive, refined, and socially graceful, and you bring these same qualities to every relationship you enter. Marriage and committed partnership tend to be especially blessed, and you often attract partners who mirror your best qualities. Your diplomatic skills are exceptional, and you may excel in counseling, mediation, law, or any field that involves bridging differences between people.' },
      { heading: 'Challenges & Growth', body: 'You may be so focused on partnership that you lose your individual identity, or you might avoid confrontation to such a degree that important issues never get addressed. Idealizing partners and then becoming disillusioned when they prove human is a recurring pattern. Growth involves learning that the most beautiful relationship is one that holds space for both harmony and honest truth, and that your capacity for love is enhanced rather than diminished by maintaining a strong individual identity.' },
    ],
  },
  'venus-in-8th-house': {
    intro: 'Venus in the 8th house transforms love into an act of profound vulnerability and power. Your experience of beauty and connection reaches into the deepest dimensions of intimacy.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You experience love with extraordinary intensity and depth. Surface-level connections do not satisfy you; you crave total emotional and physical merging with your partner. You have a magnetic quality that draws others into deep intimacy, and your capacity for transformative love is remarkable. You may benefit from inheritances, joint finances, or partnerships that involve shared resources. Your aesthetic sensibility is drawn to the dark, the mysterious, and the psychologically complex, and you find beauty in places others are afraid to look.' },
      { heading: 'Challenges & Growth', body: 'Possessiveness, jealousy, and power struggles in relationships are significant risks. You may confuse intensity with love, staying in toxic dynamics because the emotional charge feels like passion. Financial entanglements in relationships can create unhealthy dependency. Growth involves learning that true intimacy requires trust rather than control, and that the most transformative love is the kind that empowers both partners rather than binding them through emotional debt.' },
    ],
  },
  'venus-in-9th-house': {
    intro: 'Venus in the 9th house broadens your experience of love and beauty to global proportions. You are attracted to foreign cultures, philosophical minds, and partners who expand your worldview.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Love takes you on journeys, both literal and intellectual. You may fall in love with someone from a different culture, meet your partner while traveling, or find that your most meaningful relationships involve a crossing of cultural or philosophical boundaries. You have a deep appreciation for diverse forms of beauty and may be drawn to art, music, and aesthetics from traditions far from your own. Higher education and teaching bring you joy, and you find genuine beauty in ideas, philosophies, and spiritual traditions that expand your understanding of love itself.' },
      { heading: 'Challenges & Growth', body: 'Romanticizing foreign cultures while devaluing your own can lead to superficial tourism of the heart. You may be perpetually searching for the perfect ideal of love, moving from one philosophical framework to another without settling into committed practice. Growth involves discovering that the deepest love is not always found in distant horizons but sometimes in the everyday beauty of committed, rooted relationship.' },
    ],
  },
  'venus-in-10th-house': {
    intro: 'Venus in the 10th house elevates your charm and aesthetic sensibility to the public sphere. Your career is connected to beauty, harmony, or the arts, and your professional reputation benefits from your natural grace.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You are professionally charming, and your career benefits enormously from your social skills and aesthetic sense. You may work in art, fashion, entertainment, diplomacy, luxury brands, or any industry where beauty and social grace create value. Your public image is attractive, and you tend to be well-liked by colleagues and superiors. Romantic relationships may involve people you meet through professional settings, and your partner may contribute positively to your career or public standing.' },
      { heading: 'Challenges & Growth', body: 'Using charm to advance professionally rather than developing genuine competence is the subtle trap. You may choose a career based on its social prestige rather than your genuine passion, or stay in a loveless relationship because it enhances your professional image. Growth involves pursuing professional beauty alongside professional substance, and ensuring that your public persona reflects your authentic values rather than a carefully curated image.' },
    ],
  },
  'venus-in-11th-house': {
    intro: 'Venus in the 11th house brings love and beauty into your social life and collective aspirations. You attract friends easily and find love within communities aligned with your ideals.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your social life is rich, harmonious, and often glamorous. You attract friends from diverse backgrounds and create social circles characterized by mutual appreciation and shared aesthetic values. Group activities bring you pleasure, and you may meet romantic partners through friends, social organizations, or collective endeavors. You have a gift for beautifying community spaces and bringing harmony to group dynamics. Your hopes and dreams for the future are infused with a love of beauty and a desire for a more harmonious world.' },
      { heading: 'Challenges & Growth', body: 'You may prioritize social popularity over authentic connection, or lose yourself in group dynamics that look beautiful but lack depth. Romantic relationships that begin in social settings may struggle when they move into private intimacy. Growth involves learning to maintain your individual values within collective settings and to seek friends who appreciate your authentic self rather than just your social charm.' },
    ],
  },
  'venus-in-12th-house': {
    intro: 'Venus in the 12th house creates a love nature of extraordinary depth and compassion that often operates beneath the surface of conscious awareness. Your love is boundless, selfless, and deeply spiritual.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You love with a selflessness and compassion that borders on the divine. Your aesthetic sensitivity is profound, and you are deeply moved by music, art, and beauty in forms that others might overlook. You may find your deepest connections in solitude, through meditation, or in service to those who are suffering. Secret loves, past-life connections, and relationships that defy rational understanding are characteristic of this placement. Your capacity for unconditional love, when healthy, is one of the most beautiful gifts in the entire natal chart.' },
      { heading: 'Challenges & Growth', body: 'Secret relationships, unrequited love, and a tendency to martyr yourself in the name of love are significant risks. You may love people who are unavailable, addicted, or incapable of reciprocating your devotion. Confusion about what you want in love can lead to passivity or self-sacrifice. Growth involves learning to direct your extraordinary capacity for love toward yourself as well as others, and to seek relationships that honor your depth rather than exploit your selflessness.' },
    ],
  },

  // Mars
  'mars-in-1st-house': {
    intro: 'Mars in the 1st house gives you a warrior\'s presence. You are bold, competitive, and physically energetic, with a drive to assert yourself that is immediately apparent to everyone you meet.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You are a natural leader and initiator, with physical energy and courage that set you apart. Your body tends to be strong and athletic, and you approach life as a series of challenges to be conquered. You have an almost primal directness that some find refreshing and others find intimidating. When you walk into a room, people pay attention. Your competitive drive, when channeled constructively, gives you the ability to push through obstacles that would stop others cold. You are at your best when you have something to fight for.' },
      { heading: 'Challenges & Growth', body: 'Aggression, impulsiveness, and a tendency to create conflict wherever you go are the shadow expressions. You may have a short temper, rush into situations without thinking, or alienate people with your bluntness. Physical accidents and injuries are more common because you push your body to its limits. Growth involves learning to channel your considerable Mars energy into constructive action, to fight for things that matter rather than picking every battle, and to develop patience alongside your formidable courage.' },
    ],
  },
  'mars-in-2nd-house': {
    intro: 'Mars in the 2nd house drives you to fight for financial security and material independence. You earn your money through action, and your self-worth is connected to your ability to provide.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You are a powerful earner, willing to work hard and fight fiercely for financial independence. Your approach to money is active and entrepreneurial, and you are not content to wait for opportunities but go out and create them. You have strong opinions about what things are worth, and you defend your values with passion. Physical strength and practical skills may be key assets in your earning capacity, and you take pride in being able to support yourself entirely through your own effort.' },
      { heading: 'Challenges & Growth', body: 'Impulsive spending, financial aggression, and fights over money and possessions are common challenges. You may take excessive financial risks or become combative when your resources are threatened. Learning to manage your money with strategy rather than impulse, and to detach your self-worth from your bank balance, are essential growth tasks.' },
    ],
  },
  'mars-in-3rd-house': {
    intro: 'Mars in the 3rd house sharpens your mind and your tongue. You communicate with force, argue with skill, and think with combative precision.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your mind is quick, sharp, and competitive. You excel in debate, investigative reporting, legal argumentation, and any form of communication that requires mental combativeness. You say what others only think, and your directness cuts through ambiguity. Your writing has punch and urgency, and you can mobilize people through the power of your words. Sibling relationships may be competitive but stimulating, and your local environment is a place of constant mental engagement.' },
      { heading: 'Challenges & Growth', body: 'Verbal aggression, road rage, arguments with neighbors and siblings, and a sharp tongue that wounds before you realize the damage are all risks. You may create enemies through careless words or approach every conversation as a debate to be won. Growth involves learning that your mental power is most effective when combined with diplomacy, and that winning every argument is less satisfying than being understood.' },
    ],
  },
  'mars-in-4th-house': {
    intro: 'Mars in the 4th house brings warrior energy into your home and family life. Your domestic environment is energetic, passionate, and sometimes volatile.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You bring tremendous energy to creating and defending your home. DIY projects, renovations, and physical improvements to your living space are natural expressions of this placement. You fiercely protect your family and will fight anyone who threatens your domestic security. Your parents, particularly your father, may have been a strong and possibly dominant influence. You have enormous reserves of emotional courage and can draw on deep inner strength when life challenges your sense of security.' },
      { heading: 'Challenges & Growth', body: 'Domestic conflict, an angry or volatile home atmosphere, and difficulty finding peace in your private life are significant challenges. Unresolved anger toward family members, especially parents, can sabotage your adult relationships. You may bring work stress home or turn your home into a battleground. Growth involves learning to create a peaceful domestic environment while still honoring your need for physical activity and emotional intensity within your private space.' },
    ],
  },
  'mars-in-5th-house': {
    intro: 'Mars in the 5th house fuels your creative fire and your romantic passion. You pursue pleasure, self-expression, and love with bold, competitive energy.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your creative drive is powerful and action-oriented. You do not just dream about artistic projects; you make them happen with physical energy and determination. Romance is an arena of passionate pursuit, and you love the thrill of the chase. You may be drawn to competitive sports, extreme activities, or any form of recreation that gets your adrenaline pumping. Your relationship with children is energetic and active, and you encourage boldness and courage in the young people you influence.' },
      { heading: 'Challenges & Growth', body: 'Romantic aggression, gambling, and reckless risk-taking in pursuit of thrills are the shadow side. You may confuse intensity with love, pursue partners who resist you because the challenge excites you, or burn through creative projects without developing the discipline to refine them. Growth involves learning that creative mastery requires patience alongside passion, and that the most fulfilling romance is built on mutual respect rather than competitive conquest.' },
    ],
  },
  'mars-in-6th-house': {
    intro: 'Mars in the 6th house channels your drive into work, health, and service. You are a tireless worker who approaches daily tasks with military precision and formidable energy.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your work ethic is extraordinary. You approach your job with the intensity of a soldier on a mission, and you can outwork virtually anyone when you are motivated. Physical exercise is essential to your well-being, and you may excel in fitness, athletics, medicine, or any field that combines physical effort with service. You are the person who gets things done, the one colleagues rely on when deadlines are tight and the work is hard. Your energy for solving practical problems is tireless and focused.' },
      { heading: 'Challenges & Growth', body: 'Workaholism, workplace conflicts, and stress-related health issues are significant risks. You may drive yourself to exhaustion or create adversarial relationships with colleagues through your competitive intensity. Inflammation, fevers, and acute injuries are common health manifestations. Growth involves learning that sustainable productivity requires rest, and that being a team player sometimes means tempering your individual drive for the sake of collective harmony.' },
    ],
  },
  'mars-in-7th-house': {
    intro: 'Mars in the 7th house brings passion and conflict into your partnerships. You are attracted to strong, assertive partners, and your relationships are characterized by dynamic, sometimes volatile, energy.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You are attracted to partners who are strong, independent, and willing to challenge you. Your relationships are passionate and dynamic, and you bring tremendous energy and commitment to partnership. You may be drawn to partners in military, athletics, law enforcement, or any field that embodies Mars qualities. Your competitive nature can actually strengthen relationships when both partners channel it into mutual growth rather than power struggles. You fight for your relationships with the same ferocity you bring to everything else.' },
      { heading: 'Challenges & Growth', body: 'Relationship conflict, angry partners, and marriages that feel like battlegrounds are the classic challenges. You may project your own aggression onto partners, attracting domineering or even abusive people, or you might be the dominant one who bulldozes your partner\'s needs. Growth involves learning that partnership requires cooperation and compromise alongside passion, and that the strongest relationships are those where both people feel empowered rather than conquered.' },
    ],
  },
  'mars-in-8th-house': {
    intro: 'Mars in the 8th house is an intensely powerful placement that gives you extraordinary drive in matters of transformation, shared resources, and deep intimacy.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You have enormous reserves of power and the courage to confront life\'s most intense experiences head-on. Sexual energy is strong and transformative, and intimate connections carry a life-changing intensity. You excel in financial dealings involving other people\'s money, including investments, taxes, insurance, and inheritance. Your will to survive is remarkable, and you can regenerate from crises that would permanently break others. Research, investigation, surgery, and any field that requires fearless engagement with depth and danger suit your temperament.' },
      { heading: 'Challenges & Growth', body: 'Power struggles, sexual aggression, and conflicts over shared resources are significant risks. You may use sex as a weapon or become obsessed with control in intimate relationships. Vindictiveness and the desire for revenge when betrayed can be consuming. Growth involves learning to use your extraordinary power for healing rather than domination, and to approach intimate vulnerability as an act of courage rather than weakness.' },
    ],
  },
  'mars-in-9th-house': {
    intro: 'Mars in the 9th house gives you the passion of a crusader and the energy of an explorer. You fight for your beliefs and pursue knowledge with warrior-like intensity.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You are a passionate advocate for your beliefs, with the courage to defend your convictions against all opposition. Travel and adventure energize you, and you may be drawn to extreme sports, wilderness exploration, or journeys to challenging destinations. Higher education and intellectual pursuit are not passive activities for you but active conquests. You have the energy and courage to fight for justice, religious freedom, or philosophical truth, and you inspire others with your passionate commitment to meaningful causes.' },
      { heading: 'Challenges & Growth', body: 'Religious fanaticism, intellectual aggression, and a tendency to impose your beliefs on others through force rather than persuasion are the shadow expressions. You may pick fights over philosophical differences or become so attached to your worldview that you cannot tolerate dissent. Growth involves learning that true conviction does not require aggression, and that the strongest beliefs are those that can withstand questioning without needing to be defended with anger.' },
    ],
  },
  'mars-in-10th-house': {
    intro: 'Mars in the 10th house is one of the most ambitious placements in astrology. You are driven to achieve, to lead, and to make your mark on the world through decisive, courageous action.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your career ambition is relentless. You are willing to fight your way to the top, and you have the energy, courage, and competitive drive to succeed in even the most demanding fields. You are a natural executive, military leader, surgeon, athlete, or entrepreneur: someone who thrives under pressure and performs best when the stakes are highest. Your professional reputation is built on action and achievement rather than charm or networking. When you set a career goal, nothing stops you from reaching it.' },
      { heading: 'Challenges & Growth', body: 'Career ruthlessness, burnout from overwork, and public conflicts with authority figures are significant risks. You may make enemies on your way up, or sacrifice personal relationships on the altar of professional ambition. Growth involves learning that true leadership includes the ability to collaborate and to uplift others, and that the most enduring career success is built on respect rather than fear.' },
    ],
  },
  'mars-in-11th-house': {
    intro: 'Mars in the 11th house channels your warrior energy into social causes, group leadership, and the fight for a better future. You are an activist at heart.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You bring tremendous energy and leadership to groups, organizations, and social causes. You are the person who mobilizes the community, who organizes the protest, who turns collective ideals into collective action. Your friendships tend to be dynamic and sometimes competitive, and you attract friends who share your passion for change. You have a talent for leadership within organizations and may take on roles that require courage, initiative, and the willingness to challenge the status quo.' },
      { heading: 'Challenges & Growth', body: 'Conflicts within groups, aggressive pursuit of social causes that alienates potential allies, and friendship fallouts over competitive dynamics are common challenges. You may become a bully within your social circle or use group settings as arenas for personal aggression. Growth involves learning to lead collaboratively rather than combatively, and to channel your social passion into inclusive rather than divisive action.' },
    ],
  },
  'mars-in-12th-house': {
    intro: 'Mars in the 12th house is a complex placement that hides your drive and aggression beneath the surface. Your warrior energy operates in the unconscious, in dreams, and in the spiritual realm.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You have a hidden strength that surprises others when it emerges. Your ability to work behind the scenes, in institutions, or in solitary pursuits is considerable. You may be drawn to martial arts, swimming, dance, or other physical disciplines that combine action with spiritual awareness. You have the courage to face your own unconscious demons, and your inner battles, when won, produce remarkable spiritual strength. You may work effectively in hospitals, prisons, or retreat settings where your hidden warrior serves those in vulnerable situations.' },
      { heading: 'Challenges & Growth', body: 'Suppressed anger, passive-aggressive behavior, and self-sabotage are the primary shadows. You may turn your aggression inward, manifesting as depression, self-destructive behavior, or psychosomatic illness. Secret enemies or hidden conflicts that you cannot directly address create chronic stress. Growth involves learning to acknowledge and express your anger in healthy, conscious ways rather than allowing it to operate covertly from the unconscious, and to use your considerable hidden power for spiritual service rather than self-punishment.' },
    ],
  },

  // Jupiter
  'jupiter-in-1st-house': {
    intro: 'Jupiter in the 1st house bestows optimism, generosity, and expansive energy upon your personality. You are naturally fortunate, and your enthusiasm for life is infectious.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your presence is warm, generous, and expansive. People feel better when you are around because you radiate optimism and faith in life\'s possibilities. You tend to be physically robust, and your natural confidence opens doors that remain closed to others. You are a natural teacher and guide, and people instinctively trust your vision. Luck seems to follow you, not because of magic but because your positive energy attracts positive outcomes. Your philosophical outlook on life helps you bounce back from setbacks that would discourage others.' },
      { heading: 'Challenges & Growth', body: 'Over-indulgence, arrogance, and a tendency to overcommit are the shadow side. You may promise more than you can deliver, take on too many projects, or gain weight due to a love of excess. Growth involves learning that more is not always better, and that the greatest expansion sometimes comes from going deeper rather than wider.' },
    ],
  },
  'jupiter-in-2nd-house': {
    intro: 'Jupiter in the 2nd house expands your financial potential and your sense of abundance. You attract wealth naturally and have a generous relationship with money.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Financial abundance tends to flow toward you throughout life, and you have a natural talent for generating income through multiple sources. Your values are expansive and generous, and you believe deeply in sharing your resources. You may earn well through education, publishing, law, or international business. Your relationship with money is fundamentally optimistic, and this faith in abundance often becomes a self-fulfilling prophecy.' },
      { heading: 'Challenges & Growth', body: 'Financial extravagance, wastefulness, and a belief that money will always appear when needed can lead to poor financial management. You may overvalue material possessions or measure your growth by your income. Growth involves learning to be as disciplined with your abundant resources as you are generous, and to develop financial wisdom alongside financial faith.' },
    ],
  },
  'jupiter-in-3rd-house': {
    intro: 'Jupiter in the 3rd house expands your mind and your communication to grand proportions. You think big, speak broadly, and learn with insatiable curiosity.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your mind is naturally optimistic and philosophically oriented. You excel in teaching, writing, and any form of communication that transmits knowledge and inspiration. Your curiosity is boundless, and you approach learning with enthusiasm that never fades. Relationships with siblings tend to be positive and growth-oriented, and your local community benefits from your generous sharing of ideas and information. You make an excellent teacher because your enthusiasm for subjects is contagious.' },
      { heading: 'Challenges & Growth', body: 'Scattered attention, exaggeration, and a tendency to promise more intellectual output than you can deliver are common challenges. You may start many books without finishing them or share opinions with authority on subjects you have only superficially studied. Growth involves developing intellectual rigor alongside your natural enthusiasm and learning that depth of knowledge is more valuable than breadth of opinion.' },
    ],
  },
  'jupiter-in-4th-house': {
    intro: 'Jupiter in the 4th house blesses your home and family life with abundance, warmth, and generosity. Your domestic environment tends to be spacious, comfortable, and welcoming.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your home is your temple, and you need space, both physical and emotional, in your domestic environment. You may own large properties, live in expansive homes, or create an atmosphere of generous hospitality that makes everyone feel welcome. Family relationships tend to be positive, and you may benefit from family wealth or inherited property. Your later years are often your best, as the domestic foundation you build over a lifetime becomes increasingly rich and rewarding.' },
      { heading: 'Challenges & Growth', body: 'Domestic overexpansion, taking on too large a mortgage, or creating a home that is more impressive than intimate are potential pitfalls. You may idealize family life to the point of ignoring genuine problems. Growth involves learning that a truly abundant home is one rich in love and connection, not just in square footage and material comfort.' },
    ],
  },
  'jupiter-in-5th-house': {
    intro: 'Jupiter in the 5th house amplifies creative joy, romantic abundance, and the spirit of play. Life feels like a generous adventure, and your capacity for pleasure is expansive.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Creative abundance flows through you effortlessly. You are naturally lucky in love and may have many romantic opportunities throughout life. Children bring you great joy, and you may have a larger-than-average family or play an important mentoring role in young people\'s lives. Your creative projects tend to be ambitious and successful, and you approach artistic expression with the confidence and vision of someone who trusts the creative process. Entertainment, performance, and any field that combines joy with self-expression suit you perfectly.' },
      { heading: 'Challenges & Growth', body: 'Excessive indulgence in pleasure, gambling, and serial romancing are the shadow expressions. You may have so many creative ideas that none reach completion, or pursue romantic experiences for quantity rather than quality. Growth involves channeling your abundant creative energy into a few projects that receive your full devotion and learning that the deepest romance is the one you commit to fully.' },
    ],
  },
  'jupiter-in-6th-house': {
    intro: 'Jupiter in the 6th house expands your capacity for service and brings optimism to your daily routines. Work is meaningful, and your health benefits from a positive attitude.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your approach to work is enthusiastic and growth-oriented, and you may advance rapidly in your career through a combination of skill and good fortune. You bring philosophical perspective to daily routines, finding meaning in the mundane. Your health tends to be robust, benefiting from Jupiter\'s protective influence, though you must guard against weight gain. You attract good working relationships and may work in healthcare, education, or any service field that allows you to help others while growing professionally.' },
      { heading: 'Challenges & Growth', body: 'Weight gain, lazy work habits, and an overly optimistic assessment of health risks are common challenges. You may take on more work than you can handle or believe yourself immune to the physical consequences of overindulgence. Growth involves developing disciplined daily habits that support your naturally expansive energy and taking practical steps to maintain the health that Jupiter generously provides.' },
    ],
  },
  'jupiter-in-7th-house': {
    intro: 'Jupiter in the 7th house brings expansion, growth, and good fortune through partnerships. Your relationships are characterized by generosity, optimism, and mutual enrichment.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You attract partners who are generous, wise, and growth-oriented, and your relationships tend to expand your world in meaningful ways. Marriage and committed partnership bring you luck and abundance, and you may marry someone from a different culture, educational background, or philosophical tradition. You are a generous partner who believes in the best in others, and this faith often brings out qualities your partners did not know they possessed. Legal partnerships and business collaborations tend to be fortunate.' },
      { heading: 'Challenges & Growth', body: 'Over-idealization of partners, expecting too much from relationships, and attracting partners who are grandiose but unreliable are common pitfalls. Multiple marriages or serial relationships may result from a tendency to believe that the next partner will be even better. Growth involves learning to appreciate the growth potential in your current relationship rather than constantly seeking more expansive horizons.' },
    ],
  },
  'jupiter-in-8th-house': {
    intro: 'Jupiter in the 8th house brings growth and abundance through transformation, shared resources, and deep psychological exploration. You benefit from others\' resources and from facing life\'s profound mysteries.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'This placement often indicates financial benefit through inheritance, marriage, investments, or joint ventures. You have a naturally philosophical approach to life\'s deepest themes, including death, sex, and power, which gives you the ability to guide others through transformative experiences. Your psychological insight is expansive, and you may be drawn to counseling, depth psychology, or spiritual healing. You approach transformation with faith rather than fear, and this attitude helps you emerge from every crisis stronger and wiser.' },
      { heading: 'Challenges & Growth', body: 'Over-reliance on others\' resources, excessive risk-taking in investments, and using philosophical frameworks to avoid the raw emotional reality of transformation are potential pitfalls. You may be drawn to extreme experiences in the belief that they are spiritually growth-oriented when they are actually dangerous. Growth involves learning to distinguish genuine transformation from mere intensity and to manage shared resources with wisdom rather than just optimism.' },
    ],
  },
  'jupiter-in-9th-house': {
    intro: 'Jupiter in the 9th house is in its natural home, creating a person of expansive vision, profound faith, and an insatiable hunger for meaning and adventure.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You are a natural philosopher, teacher, and explorer with a faith in life\'s meaning that sustains you through any challenge. Higher education, publishing, law, religion, and international affairs are all natural domains for your abundant energy. Travel expands your world in ways that transform you permanently, and you have a gift for bridging cultures and perspectives. Your optimism and philosophical depth make you a natural mentor, and people seek your guidance because your vision of life\'s possibilities is genuinely inspiring.' },
      { heading: 'Challenges & Growth', body: 'Dogmatism, self-righteousness, and a tendency to preach rather than practice are the shadows of this abundant placement. You may believe your worldview is the only valid one, or scatter your energy across too many philosophical pursuits without grounding any of them in practical application. Growth involves developing the humility to learn from others and the discipline to live your philosophy rather than just profess it.' },
    ],
  },
  'jupiter-in-10th-house': {
    intro: 'Jupiter in the 10th house elevates your career potential to its highest expression. You are destined for public success, and your professional life is characterized by growth, recognition, and fortunate opportunities.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You are naturally suited for positions of authority, leadership, and public influence. Your career tends to involve growth and expansion, and you may reach levels of professional success that exceed your original ambitions. You attract mentors and supporters in professional settings, and your reputation is characterized by integrity, generosity, and vision. Careers in law, education, government, publishing, or international business are especially favorable. Your professional optimism inspires confidence in others.' },
      { heading: 'Challenges & Growth', body: 'Career grandiosity, overextending your professional reach, and hubris at the height of success are the primary risks. You may promise results you cannot deliver or take on leadership roles before you are ready. Growth involves learning that sustainable career success is built on competence and character rather than ambition and luck, and that genuine leadership means serving others rather than simply occupying a position of power.' },
    ],
  },
  'jupiter-in-11th-house': {
    intro: 'Jupiter in the 11th house expands your social world and amplifies your ability to make your dreams come true. Friendships, communities, and collective visions are your greatest sources of growth.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your social circle is large, diverse, and filled with generous, growth-oriented people. You attract friends who support your dreams and help you expand your vision of what is possible. Group activities, organizations, and social causes bring you good fortune and personal growth. You have a gift for inspiring others toward collective action and for turning shared dreams into tangible reality. Your hopes for the future are expansive and genuinely optimistic, and this faith in better possibilities helps manifest them.' },
      { heading: 'Challenges & Growth', body: 'Social overextension, spreading yourself too thin across too many groups and causes, and losing your individual identity within collective enthusiasm are the challenges. You may attract fair-weather friends who benefit from your generosity without reciprocating. Growth involves discerning which communities truly align with your values and investing your social energy wisely rather than scattering it across every cause that captures your enthusiasm.' },
    ],
  },
  'jupiter-in-12th-house': {
    intro: 'Jupiter in the 12th house is a guardian angel placement, offering protection, spiritual abundance, and profound inner wisdom that operates largely behind the scenes.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You have an extraordinary connection to the spiritual dimension and a faith that sustains you even in life\'s darkest moments. This placement often provides a sense of divine protection, a feeling that something larger is watching over you. Your compassion is boundless, and you may be drawn to work in hospitals, spiritual communities, or any setting that serves the most vulnerable. Your inner life is rich beyond measure, and solitude brings you genuine joy and spiritual renewal. Dreams, meditation, and creative imagination are powerful channels for the abundance this placement provides.' },
      { heading: 'Challenges & Growth', body: 'Spiritual bypassing, using faith to avoid dealing with practical realities, and excessive retreat from the world are the main risks. You may be so comfortable in the inner world that you neglect the outer, or so focused on spiritual growth that you avoid the mundane responsibilities that ground spiritual development in real life. Growth involves bringing your considerable inner wisdom into the world through practical service, and learning that true spiritual abundance includes the willingness to engage fully with the messy, imperfect realities of human life.' },
    ],
  },

  // Saturn
  'saturn-in-1st-house': {
    intro: 'Saturn in the 1st house gives you a serious, mature demeanor and a strong sense of personal responsibility. You may have felt old beyond your years as a child, but you age gracefully, growing lighter as you grow older.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You project an aura of authority, competence, and reliability that earns respect in any setting. Your self-discipline is remarkable, and you approach life with a seriousness of purpose that produces real, lasting achievement. People trust you because your word is your bond. You are naturally suited for leadership roles that require patience, perseverance, and the ability to take responsibility for difficult decisions. As you mature, you develop a quiet confidence that is more impressive than any superficial charisma.' },
      { heading: 'Challenges & Growth', body: 'Self-criticism, a heavy sense of burden, and difficulty expressing yourself freely are the core challenges. You may have experienced early limitations, whether physical, emotional, or circumstantial, that made you feel restricted or inadequate. Depression and a tendency to deny yourself pleasure can create an unnecessarily austere life. Growth involves learning that you have already earned the right to enjoy your life, and that the discipline that defines you is a gift rather than a sentence. Your reward comes in the second half of life, when the structures you have built begin to pay dividends of genuine satisfaction and earned wisdom.' },
    ],
  },
  'saturn-in-2nd-house': {
    intro: 'Saturn in the 2nd house creates a relationship with money and self-worth that begins with scarcity and, through hard work and discipline, evolves into genuine abundance.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You understand the value of money because you have earned every penny through effort and discipline. Financial responsibility comes naturally, and you are excellent at budgeting, saving, and building long-term financial security. You do not waste resources, and your conservative approach to money eventually creates substantial wealth. Your sense of self-worth, though slow to develop, becomes unshakeable once established because it is built on genuine accomplishment rather than external validation.' },
      { heading: 'Challenges & Growth', body: 'Financial anxiety, feelings of scarcity even when objectively comfortable, and measuring your worth by your net worth are persistent challenges. You may deprive yourself of simple pleasures out of fear that resources will run out. Growth involves learning to enjoy the abundance you have created and to recognize that your worth is inherent, not earned through financial accumulation.' },
    ],
  },
  'saturn-in-3rd-house': {
    intro: 'Saturn in the 3rd house creates a disciplined, structured mind that may develop slowly but ultimately achieves remarkable intellectual depth and communicative authority.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your thinking is methodical, thorough, and deeply serious. You may not be the quickest thinker in the room, but you are often the most accurate and the most prepared. You have an ability to master complex subjects through sustained study, and your communication style carries weight because people know you have done your homework. Academic achievement, technical writing, and any field that requires meticulous intellectual work suit your mental temperament. You say little, but what you say matters.' },
      { heading: 'Challenges & Growth', body: 'Learning difficulties in childhood, communication anxiety, and a fear of being thought unintelligent can create lasting insecurity about your mental abilities. You may avoid speaking up in groups or struggle with writer\'s block. Sibling relationships may carry karmic weight. Growth involves trusting your intellectual depth and recognizing that your careful, thorough way of thinking is a strength, not a limitation. Your ideas gain authority with age.' },
    ],
  },
  'saturn-in-4th-house': {
    intro: 'Saturn in the 4th house often indicates a challenging start in life related to home and family, but the reward is the creation of a rock-solid emotional foundation through your own sustained effort.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You are building the family and home that you may not have had growing up. Your determination to create security for yourself and your loved ones is powerful, and the domestic structure you eventually create is solid, enduring, and deeply meaningful. You understand the value of emotional stability because you had to earn it. Your relationship with your parents, particularly your father or the more authoritative parent, carries significant karmic lessons that shape your character profoundly.' },
      { heading: 'Challenges & Growth', body: 'Emotional coldness, difficulty expressing vulnerability at home, and a tendency to recreate restrictive childhood patterns in adult domestic life are the core challenges. You may postpone buying a home, starting a family, or putting down roots because the responsibility feels overwhelming. Growth involves healing your relationship with your origins and building a home that is warm and loving as well as structurally sound.' },
    ],
  },
  'saturn-in-5th-house': {
    intro: 'Saturn in the 5th house creates a serious approach to creativity, romance, and self-expression. Joy and play may not come easily, but when they do, they carry a depth that lighter placements never reach.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your creativity is disciplined and masterful. You may not produce art quickly, but what you create has lasting value because you apply the same rigorous standards to creative work that Saturn demands in every area. Romance tends to involve older or more mature partners, and when you commit, it is with a seriousness that produces enduring love. Your relationship with children is marked by responsibility and genuine care. Creative pursuits that require discipline, such as architecture, classical music, or literary fiction, suit your temperament beautifully.' },
      { heading: 'Challenges & Growth', body: 'Inhibited self-expression, fear of being seen, romantic disappointments, and difficulty having fun are common struggles. You may have felt creativity was impractical or that joy was not deserved. Growth involves giving yourself permission to play, to create without perfection, and to open your heart to love without demanding guarantees. The reward for this work is a creative and romantic life of extraordinary depth and meaning.' },
    ],
  },
  'saturn-in-6th-house': {
    intro: 'Saturn in the 6th house creates a masterful worker whose dedication to duty and health consciousness becomes a source of quiet authority and lasting achievement.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your work ethic is beyond reproach. You take your responsibilities seriously, maintain high standards, and produce work of consistent quality over long periods. You understand that mastery comes from discipline, and you are willing to put in the years of patient effort that excellence requires. Health consciousness is pronounced, and you may develop a deeply disciplined approach to nutrition, exercise, and preventive care that serves you well in later life. Your colleagues respect you as someone who does the work without complaint or shortcuts.' },
      { heading: 'Challenges & Growth', body: 'Chronic health conditions, work anxiety, and a tendency to be overly harsh on yourself about productivity are significant challenges. You may work yourself into illness or become so rigid about health routines that they create more stress than they relieve. Growth involves learning to balance discipline with gentleness, and to recognize that your health and your work both benefit from occasional rest, flexibility, and self-compassion.' },
    ],
  },
  'saturn-in-7th-house': {
    intro: 'Saturn in the 7th house creates a serious, responsible approach to partnership that may delay marriage but ultimately produces relationships of remarkable depth and durability.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'When you commit, you commit fully. Your approach to partnership is mature, responsible, and deeply loyal. You are drawn to partners who are older, more established, or who embody the qualities of wisdom and stability. Marriage may come later in life, but when it does, it tends to be built on genuine compatibility and mutual respect rather than fleeting attraction. You take your vows seriously, and your partnerships improve with time as you invest patient effort in building a lasting foundation.' },
      { heading: 'Challenges & Growth', body: 'Fear of commitment, choosing partners who are emotionally unavailable, and relationships that feel more like duty than love are the core challenges. You may attract partners who limit you or create an atmosphere of heaviness rather than joy in your closest relationships. Growth involves learning that lasting partnership does not require suffering, and that the most responsible thing you can do for your relationship is to bring genuine warmth and pleasure alongside your dependable commitment.' },
    ],
  },
  'saturn-in-8th-house': {
    intro: 'Saturn in the 8th house confronts you with life\'s deepest themes: death, transformation, shared resources, and the nature of power. These are your karmic testing grounds.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You approach life\'s most intense experiences with a seriousness and discipline that others lack. Financial dealings involving shared resources, investments, inheritance, and debt are areas where your patience and caution eventually produce mastery. You do not fear death; you have a matter-of-fact relationship with mortality that gives you the courage to confront what others avoid. Your capacity for psychological depth and emotional endurance is extraordinary, and you have the ability to sit with darkness until it transforms into wisdom.' },
      { heading: 'Challenges & Growth', body: 'Financial fears, sexual repression, and difficulty surrendering control in intimate situations are significant challenges. You may struggle with trust, keeping such tight control over shared resources that partnership feels like a business arrangement. The fear of vulnerability can prevent the very transformation that this placement demands. Growth involves learning to surrender control, to trust others with your resources and your heart, and to allow the natural cycles of death and rebirth to flow through your life without resistance.' },
    ],
  },
  'saturn-in-9th-house': {
    intro: 'Saturn in the 9th house brings discipline and structure to your beliefs, philosophy, and pursuit of higher knowledge. Your faith is tested but ultimately becomes unshakeable.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your philosophical and spiritual development follows a rigorous path. You are not content with easy answers or borrowed beliefs; you need to test every idea against your own experience before accepting it. Higher education may be challenging but ultimately deeply rewarding, and you may earn advanced degrees later in life. Your relationship with truth is serious and disciplined, and you develop a personal philosophy that has been tested by time and experience. Teaching, law, and academic work suit your structured approach to knowledge.' },
      { heading: 'Challenges & Growth', body: 'Doubt, cynicism, and a tendency to dismiss spiritual or philosophical ideas that cannot be proven are the shadow expressions. You may limit your worldview to what is safe and proven, missing the expansive possibilities that faith and imagination can provide. Growth involves learning to hold space for mystery alongside your need for certainty and to trust that some truths reveal themselves only to those willing to believe before they can prove.' },
    ],
  },
  'saturn-in-10th-house': {
    intro: 'Saturn in the 10th house is one of the most powerful career placements in astrology. You are destined for positions of authority and responsibility, though the climb to the top requires extraordinary patience and effort.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You are built for leadership. Your professional ambition is disciplined, strategic, and patient, and you are willing to put in the years of hard work that genuine authority requires. You understand hierarchy, responsibility, and the weight of decisions that affect others. Your career tends to build slowly but steadily, with each achievement adding a solid brick to your professional foundation. Management, government, law, engineering, and any field that rewards long-term dedication and structural thinking suit your temperament.' },
      { heading: 'Challenges & Growth', body: 'Career setbacks, conflicts with authority figures, and the fear of public failure are karmic tests. You may become so identified with your professional role that you lose touch with your personal identity, or you might be so cautious about your reputation that you avoid the risks necessary for genuine advancement. Growth involves building a career that reflects your authentic values rather than just your ambition, and remembering that even the most successful career is only one dimension of a full life.' },
    ],
  },
  'saturn-in-11th-house': {
    intro: 'Saturn in the 11th house brings structure, responsibility, and sometimes loneliness to your social life and your relationship with collective ideals. Meaningful friendships are few but deeply enduring.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your friendships are serious, committed, and built to last. You prefer a small circle of trusted companions over a large network of acquaintances. You bring discipline and organizational skill to group efforts, and you may take on leadership roles in organizations that require patient, methodical work. Your hopes for the future are realistic rather than dreamy, and you have the discipline to work toward your goals over long periods. Community service and structured volunteering are natural expressions of your social responsibility.' },
      { heading: 'Challenges & Growth', body: 'Social isolation, difficulty fitting into groups, and a tendency to feel like an outsider are common struggles. You may fear rejection so intensely that you avoid social situations altogether, or you might take on excessive responsibility within organizations because you feel your value depends on your usefulness. Growth involves learning that you belong not because of what you contribute but because of who you are, and that vulnerability in friendship is a strength, not a weakness.' },
    ],
  },
  'saturn-in-12th-house': {
    intro: 'Saturn in the 12th house is a deeply karmic placement that asks you to confront your fears, dissolve your defenses, and find strength in surrender and spiritual discipline.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your spiritual life is serious and disciplined, and you may develop a profound meditation practice, spiritual discipline, or contemplative approach that gives your life deep meaning. You have the endurance to face your own unconscious fears and to work through psychological material that others avoid. Institutional work, whether in hospitals, prisons, or monastic settings, may provide a structured framework for your spiritual development. Your capacity for solitude is a genuine strength, and you find peace in withdrawal that others cannot imagine.' },
      { heading: 'Challenges & Growth', body: 'Irrational fears, chronic anxiety, secret guilt, and a sense of carrying invisible burdens are the heaviest challenges of this placement. You may feel punished by life without understanding why, or carry shame from past lives or early childhood experiences that cannot be consciously remembered. Growth involves bringing these hidden fears into the light of conscious awareness, ideally through therapy, spiritual practice, or structured self-reflection, and discovering that the walls you have built for protection are the very structures that imprison you.' },
    ],
  },

  // Uranus
  'uranus-in-1st-house': {
    intro: 'Uranus in the 1st house marks you as an original, a nonconformist whose very presence disrupts the status quo. You are here to be different, and trying to fit in only makes you miserable.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You are a walking disruption in the best possible sense. Your appearance, your manner, your ideas, everything about you signals that you are not here to follow the crowd. You have a genius for seeing solutions that others miss because you approach every problem from an unconventional angle. Your independence is fierce, and your personal freedom is non-negotiable. You attract attention not by seeking it but simply by being authentically yourself, which in your case means being startlingly original.' },
      { heading: 'Challenges & Growth', body: 'Instability, rebelliousness for its own sake, and difficulty maintaining consistent relationships and routines are real challenges. You may change your appearance, your name, your life direction so frequently that others cannot keep up. Learning to channel your revolutionary energy into sustained innovation rather than mere disruption is the growth task, along with recognizing that some structures exist for good reason and that true freedom includes the freedom to commit.' },
    ],
  },
  'uranus-in-2nd-house': {
    intro: 'Uranus in the 2nd house creates an unconventional relationship with money and values. Your financial life may be marked by sudden changes, and your sense of self-worth follows a unique path.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You earn money in unconventional ways and may be drawn to technology, freelancing, or industries that did not exist a decade ago. Your relationship with possessions is detached and forward-looking; you value experiences and innovation over accumulation. You may develop innovative financial strategies or find unique ways to generate value that others have not considered. Your personal values are progressive and independent of social convention.' },
      { heading: 'Challenges & Growth', body: 'Financial instability, sudden losses and gains, and a tendency to undervalue financial security are significant risks. Your income may fluctuate wildly, and you may resist traditional employment because it feels confining. Growth involves finding a balance between financial freedom and financial stability, recognizing that some degree of material security actually supports rather than restricts your independence.' },
    ],
  },
  'uranus-in-3rd-house': {
    intro: 'Uranus in the 3rd house gives you a brilliant, unconventional mind that thinks in flashes of insight rather than logical sequences. Your ideas are ahead of their time.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your mind operates like lightning, making connections and generating insights that seem to come from nowhere. You are a natural innovator in communication, technology, and education. Your learning style is nonlinear, and traditional educational settings may have felt restrictive. You communicate in ways that surprise and provoke, and your ideas have the power to change how people think. You may be drawn to writing, media, technology, or any field that allows you to transmit revolutionary ideas.' },
      { heading: 'Challenges & Growth', body: 'Mental restlessness, erratic communication patterns, and difficulty following through on ideas are the challenges. Your thinking may be so unconventional that others cannot follow your logic. Growth involves developing the patience to communicate your brilliant insights in ways that others can actually understand and use, and to persist with ideas long enough for them to make a tangible impact.' },
    ],
  },
  'uranus-in-4th-house': {
    intro: 'Uranus in the 4th house disrupts traditional notions of home and family. Your domestic life is unconventional, and your path to emotional security involves redefining what home means to you.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You may have grown up in an unusual family environment, and your concept of home is anything but traditional. You bring innovation to domestic life, perhaps through unusual living arrangements, cutting-edge home technology, or a nomadic lifestyle that redefines the concept of roots. Your family dynamics are progressive, and you may create a chosen family that feels more like home than your family of origin. Your emotional resilience is built on adaptability rather than stability.' },
      { heading: 'Challenges & Growth', body: 'Domestic instability, frequent moves, and difficulty putting down roots are persistent challenges. You may rebel against family obligations or create such an unconventional home life that your need for emotional security goes unmet. Growth involves finding a way to honor both your need for freedom and your need for belonging, creating a home that is both innovative and emotionally nurturing.' },
    ],
  },
  'uranus-in-5th-house': {
    intro: 'Uranus in the 5th house electrifies your creative expression and your love life. Romance is exciting and unpredictable, and your creativity pushes boundaries in ways that surprise even you.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your creative expression is genuinely original, breaking rules and setting trends that others eventually follow. You are attracted to unconventional romantic partners and relationships that defy traditional expectations. Your approach to fun, play, and pleasure is inventive and sometimes shocking, and you bring a spark of innovation to everything you create. Children born under this influence may be exceptionally independent or gifted in technology and science.' },
      { heading: 'Challenges & Growth', body: 'Romantic instability, commitment phobia in love, and creative restlessness that prevents any project from reaching completion are the main challenges. You may confuse excitement with love, abandoning relationships once the initial electric charge fades. Growth involves learning that genuine freedom in love includes the freedom to go deep with one person, and that creative innovation is most powerful when combined with the discipline to finish what you start.' },
    ],
  },
  'uranus-in-6th-house': {
    intro: 'Uranus in the 6th house revolutionizes your approach to work, health, and daily routines. You need freedom in your workday and may pioneer new approaches to wellness.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You thrive in work environments that offer flexibility, autonomy, and the freedom to innovate. Traditional nine-to-five employment may feel suffocating, and you may create your own unconventional career path through freelancing, technology, or revolutionary approaches to existing industries. Your health practices may be alternative or cutting-edge, and you have an intuitive understanding of the connection between mental freedom and physical well-being.' },
      { heading: 'Challenges & Growth', body: 'Job instability, sudden changes in employment, and erratic health habits are the main risks. You may rebel against any routine, including the healthy ones your body needs. Growth involves finding work that satisfies your need for independence while providing enough structure to be sustainable, and developing health practices that are innovative but also consistent enough to provide real benefit.' },
    ],
  },
  'uranus-in-7th-house': {
    intro: 'Uranus in the 7th house brings excitement, instability, and revolutionary potential to your closest partnerships. You attract unusual partners and your relationships follow unconventional paths.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your partnerships are never boring. You attract partners who are independent, unconventional, or brilliant, and your relationships push both of you to grow beyond traditional limitations. You may pioneer new forms of partnership that do not conform to societal expectations, and your openness to experimentation in relationships can lead to genuinely innovative ways of being together. You value equality and intellectual freedom in partnership above all else.' },
      { heading: 'Challenges & Growth', body: 'Sudden breakups, fear of commitment, and choosing partners primarily for their shock value are the shadow expressions. Your relationships may be exciting but exhausting, with constant change preventing the development of deep roots. Growth involves learning that true freedom in partnership means being free to be fully known by another person, which requires the very stability and consistency that Uranus tends to resist.' },
    ],
  },
  'uranus-in-8th-house': {
    intro: 'Uranus in the 8th house brings sudden, unexpected transformations to your life. Financial upheavals, intense spiritual awakenings, and unconventional approaches to intimacy characterize this powerful placement.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You have an extraordinary ability to reinvent yourself, emerging from crises as a completely transformed person. Your approach to intimacy is unconventional and progressive, and you may explore dimensions of sexuality and emotional vulnerability that others consider taboo. Financial windfalls through unusual channels, including technology, innovation, or unexpected inheritances, are possible. Your psychological insight is intuitive and revolutionary, cutting through convention to reach the raw truth.' },
      { heading: 'Challenges & Growth', body: 'Financial shocks, sudden losses, and the destabilizing effect of constant transformation are significant challenges. You may create crises unconsciously because the intensity of transformation feels more alive than stability. Growth involves learning to flow with unexpected change rather than either seeking it compulsively or resisting it fearfully, and to bring your revolutionary insight to intimate relationships without destabilizing the trust that deep connection requires.' },
    ],
  },
  'uranus-in-9th-house': {
    intro: 'Uranus in the 9th house creates a revolutionary thinker whose philosophical and spiritual ideas challenge convention and push the boundaries of understanding.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your worldview is progressive, original, and independent of established belief systems. You may develop revolutionary philosophical or spiritual ideas, or you might pursue higher education in unconventional fields. Travel to unexpected destinations opens your mind in ways that traditional education cannot, and you have a gift for synthesizing ideas from radically different traditions into something entirely new. You are a natural teacher of unconventional wisdom, challenging students to think beyond established frameworks.' },
      { heading: 'Challenges & Growth', body: 'Rejecting all traditional wisdom, spiritual restlessness, and an inability to commit to any philosophical framework long enough to benefit from its depth are the challenges. You may bounce between belief systems seeking novelty rather than truth. Growth involves learning that the most revolutionary ideas often emerge from deep engagement with existing traditions, and that true intellectual freedom includes the freedom to learn from the past as well as to transcend it.' },
    ],
  },
  'uranus-in-10th-house': {
    intro: 'Uranus in the 10th house creates a career path that defies convention. You are destined for professional work that is innovative, disruptive, and entirely your own.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your career is unique, unconventional, and likely involves technology, innovation, or social change. You are not suited for traditional corporate hierarchies; you need professional autonomy and the freedom to pursue your work in your own way. Sudden career changes and unexpected professional breakthroughs characterize your path. You may become known for disrupting your industry, creating new paradigms, or using your professional platform to advocate for radical social change.' },
      { heading: 'Challenges & Growth', body: 'Career instability, sudden job changes, and difficulty maintaining professional relationships with authority figures are the primary risks. Your need for professional freedom may make sustained career building difficult. Growth involves finding a career that channels your revolutionary energy productively and developing enough professional consistency to turn your innovative vision into lasting achievement.' },
    ],
  },
  'uranus-in-11th-house': {
    intro: 'Uranus in the 11th house is in its natural home, amplifying your visionary thinking, your commitment to social change, and your ability to connect with like-minded revolutionaries.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You are a natural social innovator, drawn to communities and causes that are progressive, unconventional, and forward-looking. Your friendships tend to be eclectic and intellectually stimulating, and you may form your most important connections through technology, activism, or shared interest in social change. You have a gift for seeing the future and for inspiring others to work toward it. Group dynamics benefit from your unique perspective, and you often serve as the catalyst for collective innovation.' },
      { heading: 'Challenges & Growth', body: 'Social alienation, valuing group identity over individual relationships, and an idealism so extreme that practical progress becomes impossible are the shadows. You may cycle through friend groups rapidly or maintain such emotional distance in social settings that genuine intimacy never develops. Growth involves learning that lasting social change requires sustained commitment to specific communities and that true friendship demands the vulnerability of being known, not just admired for your ideas.' },
    ],
  },
  'uranus-in-12th-house': {
    intro: 'Uranus in the 12th house operates in the hidden depths of your psyche, generating sudden spiritual insights, unconventional dreams, and a deep impulse to liberate yourself from unconscious limitations.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your unconscious mind is a source of revolutionary insight. You may experience sudden spiritual awakenings, vivid prophetic dreams, or intuitive flashes that seem to come from beyond ordinary consciousness. You are drawn to unconventional spiritual practices and may develop a unique approach to meditation, healing, or psychological self-exploration. Your capacity for liberating yourself and others from unconscious patterns is remarkable, and you may work effectively as a therapist, healer, or spiritual guide who approaches inner work from a radically innovative perspective.' },
      { heading: 'Challenges & Growth', body: 'Sudden anxiety, irrational fears, and the destabilizing effect of unconscious eruptions are the main challenges. You may feel periodically overwhelmed by inner experiences that you cannot explain or control. Growth involves developing a spiritual practice that provides a container for your intense inner experiences and learning to trust the revolutionary impulses that arise from your unconscious without being destabilized by them.' },
    ],
  },

  // Neptune
  'neptune-in-1st-house': {
    intro: 'Neptune in the 1st house dissolves the boundaries of your identity, creating a personality that is fluid, empathic, and deeply attuned to the subtle energies around you. You are a chameleon of consciousness.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You possess an ethereal quality that fascinates others. People project their fantasies onto you because your identity is permeable enough to reflect their desires. You have extraordinary empathic abilities, sensing moods and energies that others cannot perceive. Your imagination is vivid and boundless, making you naturally gifted in the arts, especially music, film, photography, and dance. You have a spiritual presence that draws people seeking guidance, healing, or simply the comfort of being near someone who seems to understand the invisible dimensions of life.' },
      { heading: 'Challenges & Growth', body: 'Identity confusion, a tendency to absorb others\' emotions, and difficulty knowing who you truly are beneath all the projections are fundamental challenges. Escapism through substances, fantasy, or chronic avoidance of reality can undermine your considerable gifts. Growth involves developing a solid sense of self while maintaining your spiritual sensitivity, learning to set boundaries without losing your empathic gifts, and channeling your imagination into creative expression rather than escapist fantasy.' },
    ],
  },
  'neptune-in-2nd-house': {
    intro: 'Neptune in the 2nd house creates a dreamy, idealistic relationship with money and possessions. Material boundaries are fuzzy, and your values are deeply spiritual rather than practical.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You have a gift for attracting resources through creative, spiritual, or compassionate work. Your relationship with money is guided by faith rather than calculation, and you may find that resources appear when you need them in almost miraculous ways. You value beauty, art, and spiritual experience over material accumulation, and you may earn your living through music, art, healing, or charitable work. Your generosity is genuine and often inspiring to others.' },
      { heading: 'Challenges & Growth', body: 'Financial confusion, being deceived in financial matters, and a tendency to let money slip through your fingers are real risks. You may be too trusting in business dealings or fail to maintain basic financial records. Growth involves developing practical financial skills while maintaining your spiritual relationship with abundance, learning that being grounded about money does not diminish your spiritual values.' },
    ],
  },
  'neptune-in-3rd-house': {
    intro: 'Neptune in the 3rd house creates a mind that thinks in images, symbols, and feelings rather than linear logic. Your communication has a poetic, sometimes mystical quality.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your mind is a channel for creative and spiritual inspiration. You think in metaphors and images, and your communication has an artistic quality that can move people deeply. Poetry, songwriting, and any form of creative writing come naturally because you access a level of imagination that most people only glimpse in dreams. Your intuition about people and situations is remarkably accurate, though it may come to you in the form of feelings or images rather than logical conclusions.' },
      { heading: 'Challenges & Growth', body: 'Mental confusion, difficulty with factual accuracy, and a tendency toward deception or self-deception in communication are significant challenges. You may struggle with learning disabilities or find that your mind wanders when confronted with dry, factual material. Growth involves developing mental discipline alongside your imaginative gifts and learning to communicate your intuitive insights in ways that are both beautiful and clear.' },
    ],
  },
  'neptune-in-4th-house': {
    intro: 'Neptune in the 4th house dissolves the boundaries of home and family, creating a domestic life that is either profoundly spiritual or confusingly chaotic, and often both.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your home is a sanctuary, a place where the ordinary world falls away and something more magical takes its place. You may create a domestic environment of extraordinary beauty and spiritual peace, or you might live near water, which calms your sensitive soul. Your connection to your family lineage has mystical dimensions, and you may feel the presence of ancestors or carry psychic impressions from your family history. Your capacity to create emotional sanctuary for others is a genuine gift.' },
      { heading: 'Challenges & Growth', body: 'Family secrets, idealization or confusion about your origins, and a tendency to escape into domestic fantasy rather than dealing with household realities are the challenges. A parent may have struggled with addiction or mental health issues, creating an atmosphere of emotional confusion in your childhood home. Growth involves seeing your family clearly while still loving them compassionately, and creating a home that is both spiritually nourishing and practically functional.' },
    ],
  },
  'neptune-in-5th-house': {
    intro: 'Neptune in the 5th house infuses your creative life and your romances with a dreamy, idealistic quality. You are a visionary artist and a hopeless romantic whose imagination transforms everything it touches.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your creativity is channeled from a source beyond ordinary consciousness. You have access to inspiration that feels divinely guided, and your artistic work carries an emotional and spiritual depth that resonates with audiences on a soul level. Music, film, dance, and visual arts are particularly favored. Romance for you is a spiritual experience, and you fall in love with an idealism and devotion that is both beautiful and overwhelming. Your relationship with children is intuitive and deeply compassionate.' },
      { heading: 'Challenges & Growth', body: 'Romantic delusion, idealizing partners, and confusing creative fantasy with reality are significant risks. You may fall in love with your imagination of someone rather than the actual person, leading to inevitable disillusionment. Creative projects may remain unfinished because the vision in your mind is always more perfect than any earthly execution. Growth involves learning to love real people in their imperfect beauty and to bring your creative visions into tangible form, accepting that earthly art is always an approximation of the divine.' },
    ],
  },
  'neptune-in-6th-house': {
    intro: 'Neptune in the 6th house brings spiritual sensitivity to your daily life, health, and work. You are drawn to healing, compassionate service, and work that serves a higher purpose.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You have an intuitive understanding of healing that goes beyond conventional medicine. You may be drawn to holistic health, energy work, or any approach that addresses the spiritual dimensions of physical well-being. Your work is most fulfilling when it involves service, compassion, or creative expression. You have a gift for creating peaceful, healing work environments and for sensing when colleagues need support before they ask for it.' },
      { heading: 'Challenges & Growth', body: 'Mysterious health issues, sensitivity to medications and substances, and difficulty maintaining productive work routines are common challenges. You may be drawn to martyrdom in your work, sacrificing your own needs for others to the point of exhaustion. Growth involves developing practical health routines that support your sensitive constitution and finding work that balances your need for spiritual meaning with the practical requirements of daily life.' },
    ],
  },
  'neptune-in-7th-house': {
    intro: 'Neptune in the 7th house creates a deeply romantic, idealistic approach to partnership. You dream of perfect love, and your relationships are characterized by spiritual connection, sacrifice, and sometimes beautiful illusion.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your capacity for romantic devotion is extraordinary. You see the divine in your partner and bring a spiritual quality to your relationships that elevates love beyond the mundane. You are naturally compassionate in partnership, willing to forgive, to sacrifice, and to see the best in your beloved. You may be drawn to partners who are artistic, spiritual, or in some way otherworldly. When this placement is expressed at its highest, you and your partner create a relationship that is genuinely sacred.' },
      { heading: 'Challenges & Growth', body: 'Idealization, deception in relationships, and attracting partners who are addicted, unavailable, or in need of rescue are the core challenges. You may fall in love with potential rather than reality, staying in relationships long after they have become unhealthy because you keep seeing the beautiful illusion rather than the painful truth. Growth involves learning to love with open eyes, to maintain your romantic idealism while also accepting your partner as a real, imperfect human being.' },
    ],
  },
  'neptune-in-8th-house': {
    intro: 'Neptune in the 8th house dissolves boundaries in the most intimate dimensions of life. Shared resources, sexuality, and transformation are all colored by spiritual longing and psychic sensitivity.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your experience of intimacy is deeply spiritual. Physical and emotional merging with a partner can feel like a mystical experience, and you have access to dimensions of shared consciousness that most people never experience. You may have psychic abilities that emerge most strongly during times of crisis or transformation. Your relationship with death and the afterlife is characterized by faith rather than fear, and you may serve as a comforting presence for others during their darkest moments.' },
      { heading: 'Challenges & Growth', body: 'Financial confusion in shared resources, boundary dissolution in intimate relationships, and a tendency to use substances or fantasy to escape the intensity of your emotional life are significant risks. You may be deceived in financial partnerships or lose resources through unclear agreements. Growth involves bringing practical awareness to shared financial matters while maintaining your spiritual approach to intimacy, and learning to set boundaries even in the most sacred relationships.' },
    ],
  },
  'neptune-in-9th-house': {
    intro: 'Neptune in the 9th house infuses your search for meaning with spiritual longing and mystical vision. Your faith is deep, your imagination is boundless, and your quest for truth takes you into the realm of the divine.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You are a natural mystic, spiritual seeker, or visionary philosopher. Your relationship with the divine is personal and profound, and you may experience genuine spiritual insights that guide your life in meaningful ways. Travel to sacred sites, immersion in spiritual traditions, and the study of mystical philosophies all nourish your soul. You have a gift for teaching spiritual truths in ways that inspire others without imposing dogma, and your faith in life\'s ultimate meaning is a source of comfort and inspiration for everyone around you.' },
      { heading: 'Challenges & Growth', body: 'Spiritual delusion, falling for false gurus, and using spiritual beliefs to avoid engaging with practical reality are the shadow expressions. You may be susceptible to cults, conspiracy theories, or belief systems that promise transcendence but deliver confusion. Growth involves developing spiritual discernment, testing your beliefs against lived experience, and building a faith that is grounded in genuine wisdom rather than wishful thinking.' },
    ],
  },
  'neptune-in-10th-house': {
    intro: 'Neptune in the 10th house creates a career path guided by inspiration, compassion, and creative vision. Your public image has an ethereal quality, and your professional calling is connected to serving the collective dream.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your career is guided by inspiration rather than ambition, and you may find success in the arts, healing professions, spiritual leadership, or any field that serves the collective imagination. Your public image has a charismatic, slightly mysterious quality that draws people to you. You may become a symbol or icon in your field, representing ideals and dreams that resonate with the collective unconscious. Your professional life is most fulfilling when it involves creative expression, compassionate service, or spiritual guidance.' },
      { heading: 'Challenges & Growth', body: 'Career confusion, a tendency to drift without clear professional direction, and the risk of scandal or deception in public life are significant challenges. You may have difficulty defining your career path or maintaining consistent professional effort. Growth involves finding a career that channels your creative and spiritual gifts into tangible form, and developing enough professional discipline to turn your inspired vision into sustained achievement.' },
    ],
  },
  'neptune-in-11th-house': {
    intro: 'Neptune in the 11th house brings spiritual idealism to your friendships and social aspirations. You dream of a better world and attract friends who share your compassionate vision.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your social ideals are deeply compassionate, and you are drawn to communities and causes that serve the highest good. You attract friends who share your spiritual values, and your social circle may include artists, healers, and spiritual seekers. Your hopes for the future are infused with a genuine desire to reduce suffering and increase beauty in the world. You have a gift for creating community spaces that feel sacred and for inspiring collective action toward compassionate goals.' },
      { heading: 'Challenges & Growth', body: 'Idealizing friends, being deceived in social settings, and losing yourself in group fantasy are the main risks. You may attract friends who take advantage of your compassion, or become involved in organizations that promise utopian outcomes but deliver confusion and disillusionment. Growth involves developing social discernment while maintaining your beautiful idealism, and learning that genuine friendship requires honesty alongside compassion.' },
    ],
  },
  'neptune-in-12th-house': {
    intro: 'Neptune in the 12th house is in its natural home, creating an extraordinarily sensitive, psychic, and spiritually gifted soul whose inner world is vast, luminous, and deeply connected to the divine.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your spiritual gifts are extraordinary. You have natural access to dimensions of consciousness that others can only reach through years of dedicated practice. Your dreams are vivid, often prophetic, and your intuition borders on the clairvoyant. You have a capacity for unconditional love and compassion that is genuinely inspiring, and your presence alone can have a healing effect on others. Creative work that emerges from your inner world, particularly music, poetry, and visual art, carries a transcendent quality that touches souls.' },
      { heading: 'Challenges & Growth', body: 'Psychic overwhelm, addiction, escapism, and a tendency to dissolve into the collective unconscious rather than maintaining a functional identity are the deepest challenges. You may feel the suffering of the world so intensely that you seek relief through substances, sleep, or withdrawal from reality. Growth involves developing strong spiritual practices and practical boundaries that allow you to function in the world while honoring your extraordinary sensitivity, and learning that your spiritual gifts are meant to be shared, not hidden.' },
    ],
  },

  // Pluto
  'pluto-in-1st-house': {
    intro: 'Pluto in the 1st house gives you an intensity of presence that is impossible to ignore. You are here to transform yourself and, through your personal evolution, to transform the world around you.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your presence is magnetic and powerful. People sense your depth immediately, and you have an ability to see through pretense that can be both unsettling and liberating for those around you. You have undergone, or will undergo, profound personal transformations that fundamentally change who you are. Your willpower is extraordinary, and when you commit to a course of action, nothing can stop you. You have the courage to face the darkest aspects of human nature, starting with your own, and to emerge from each encounter stronger and wiser.' },
      { heading: 'Challenges & Growth', body: 'Power struggles, intimidating others, and a tendency to approach every interaction as a test of dominance are the shadow expressions. You may unconsciously create crises because transformation feels more real to you than stability. Learning to use your considerable power gently and constructively, to transform yourself without forcing transformation on others, and to trust that you can be powerful without being controlling is the essential growth work for this placement.' },
    ],
  },
  'pluto-in-2nd-house': {
    intro: 'Pluto in the 2nd house transforms your relationship with money, possessions, and self-worth through intense cycles of gain and loss that ultimately reveal what is truly valuable.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You have a powerful drive to build financial resources and a talent for regenerating wealth from nothing. Your relationship with money involves transformation, and you may experience dramatic financial changes that teach you profound lessons about the nature of value. You have an instinctive understanding of power dynamics in financial dealings and can be a formidable negotiator. Your self-worth, once established through the fire of personal transformation, becomes unshakeable.' },
      { heading: 'Challenges & Growth', body: 'Obsessive attachment to money, using financial power to control others, and defining your worth through your ability to accumulate resources are significant risks. You may experience devastating financial losses that force you to confront your relationship with material security. Growth involves learning that true power comes not from what you own but from who you are, and that the most valuable possessions are those that cannot be taken away.' },
    ],
  },
  'pluto-in-3rd-house': {
    intro: 'Pluto in the 3rd house gives you a mind of penetrating depth and transformative power. Your words can heal or destroy, and your intellectual journey involves confronting truths that others prefer to leave hidden.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your mind is a scalpel, cutting through superficiality to reach the truth beneath. You are a natural researcher, investigator, and depth psychologist whose intellectual gifts are focused on uncovering what is hidden. Your communication carries power; your words can change how people think and feel at the deepest level. You may be drawn to investigative journalism, psychology, detective work, or any field that requires the ability to discover and articulate hidden truths.' },
      { heading: 'Challenges & Growth', body: 'Obsessive thinking, using words as weapons, and an inability to let go of perceived intellectual slights are the challenges. Your relationship with siblings or neighbors may involve intense power dynamics. Growth involves learning to use your penetrating mind for healing and truth-seeking rather than for intellectual domination, and to communicate your powerful insights with enough compassion that others can actually receive them.' },
    ],
  },
  'pluto-in-4th-house': {
    intro: 'Pluto in the 4th house places transformation at the very root of your being. Your family dynamics are intense, your emotional foundations undergo seismic shifts, and your relationship with home carries the weight of ancestral karma.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your emotional depth is extraordinary. You have the ability to transform your family lineage, breaking destructive patterns that may have persisted for generations. Your home is a place of emotional intensity and transformation, and you create domestic environments that feel profoundly deep rather than merely comfortable. You have an instinctive understanding of family psychology and the hidden dynamics that shape family systems. Your emotional resilience is forged in the crucible of intense domestic experiences.' },
      { heading: 'Challenges & Growth', body: 'Power struggles within the family, childhood trauma, and a tendency to recreate intense or destructive family patterns in adult life are significant challenges. A parent may have been dominating, manipulative, or emotionally overwhelming. Growth involves confronting your family history with courage and compassion, transforming inherited pain into wisdom, and creating a home that is powerful in its love rather than in its intensity.' },
    ],
  },
  'pluto-in-5th-house': {
    intro: 'Pluto in the 5th house brings transformative intensity to creativity, romance, and self-expression. Your creative work emerges from the depths, and your love affairs change you fundamentally.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your creative expression is raw, powerful, and deeply transformative. You create art that touches people at the level of their soul, probing themes of death, rebirth, sexuality, and the shadow that others are afraid to explore. Romance for you is a transformative experience; you do not fall in love lightly, and your intimate relationships change you at the deepest level. You have a magnetic quality that draws admirers, and your self-expression carries an intensity that cannot be faked or imitated.' },
      { heading: 'Challenges & Growth', body: 'Obsessive love affairs, power struggles in creative partnerships, and a tendency to approach romance as a battleground for emotional dominance are the shadows. You may confuse sexual intensity with love, or use creative talent to manipulate and control. Growth involves channeling your transformative creative power into work that heals rather than wounds, and approaching love as mutual transformation rather than conquest.' },
    ],
  },
  'pluto-in-6th-house': {
    intro: 'Pluto in the 6th house transforms your relationship with work, health, and daily routines through intense experiences that reveal the power hidden in ordinary life.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You are a powerful healer and a transformative force in any workplace. Your approach to health and work involves going beneath the surface to address root causes rather than symptoms. You may be drawn to alternative healing, depth psychology, surgery, or any field that involves penetrating to the core of physical or organizational problems. Your work ethic, when focused, is relentless, and you can transform any system or organization you commit to improving.' },
      { heading: 'Challenges & Growth', body: 'Power struggles with coworkers, health crises that force fundamental lifestyle changes, and obsessive work habits are the challenges. You may use illness or overwork as unconscious strategies for maintaining control. Growth involves learning to serve without needing to dominate, to heal yourself before trying to heal others, and to approach daily life with the same transformative intensity you bring to crises.' },
    ],
  },
  'pluto-in-7th-house': {
    intro: 'Pluto in the 7th house brings transformative power into your closest partnerships. Your relationships are intense, deeply committed, and marked by profound psychological evolution.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your partnerships are arenas for profound personal transformation. You attract partners who challenge you to confront your deepest fears, and your relationships strip away everything that is not authentic. You have an extraordinary capacity for intimate connection, and when you find a partner who can match your depth, the bond you create is transformative for both of you. Your understanding of power dynamics in relationships gives you the ability to navigate conflict with psychological sophistication.' },
      { heading: 'Challenges & Growth', body: 'Power struggles, controlling or being controlled in relationships, and attracting partners who are manipulative or emotionally intense to the point of toxicity are the core challenges. You may project your own power onto partners, giving them authority over you and then resenting them for wielding it. Growth involves reclaiming your personal power while remaining genuinely vulnerable in partnership, and learning that the deepest transformations come not from controlling others but from transforming yourself.' },
    ],
  },
  'pluto-in-8th-house': {
    intro: 'Pluto in the 8th house is in its natural home, amplifying all themes of transformation, shared resources, death, and rebirth to their maximum intensity. This is one of the most powerful placements in the entire chart.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You have an almost supernatural ability to regenerate from crisis. No matter how devastating the loss, you find the strength to rebuild, and each cycle of destruction and renewal makes you more powerful and more wise. Your psychological insight is penetrating, and you understand the hidden motivations and power dynamics that drive human behavior. Financial dealings involving shared resources, inheritances, and investments carry transformative potential. Your capacity for intimate connection reaches depths that most people can only imagine.' },
      { heading: 'Challenges & Growth', body: 'Obsession with power, fear of vulnerability, and a tendency to create or invite crisis because transformation is the only state in which you feel fully alive are the most intense challenges. Jealousy, revenge, and emotional manipulation can poison your most intimate relationships. Growth involves learning that true power lies in the willingness to be completely vulnerable, and that the deepest transformation comes not from controlling the darkness but from bringing it into the light with compassion and courage.' },
    ],
  },
  'pluto-in-9th-house': {
    intro: 'Pluto in the 9th house transforms your beliefs, your worldview, and your understanding of truth through intense experiences that shatter old assumptions and reveal deeper realities.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'Your search for truth is relentless and transformative. You are not content with surface-level understanding; you need to penetrate to the deepest possible truth about the nature of reality, meaning, and purpose. Travel, education, and exposure to different cultures and philosophies serve as catalysts for profound personal transformation. You have the ability to transform others through teaching, and your philosophical insights carry the power to change lives. You approach spirituality and religion with an intensity that demands authentic experience rather than mere belief.' },
      { heading: 'Challenges & Growth', body: 'Fanaticism, using philosophical or spiritual authority to control others, and an inability to tolerate worldviews that differ from your own are the shadow expressions. You may experience devastating crises of faith that strip away everything you believed, forcing you to rebuild your worldview from the ground up. Growth involves developing the wisdom to hold strong convictions while remaining open to the possibility that truth is larger than any single perspective can contain.' },
    ],
  },
  'pluto-in-10th-house': {
    intro: 'Pluto in the 10th house creates a destiny of power, transformation, and profound impact on the world. Your career and public life are marked by intense ambition and the ability to reshape the structures around you.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You are destined for positions of significant power and influence. Your ambition is not merely personal but transformative; you seek to change the very structures and systems within which you work. You have an instinctive understanding of organizational power dynamics and the ability to navigate complex hierarchies with strategic brilliance. Your career may involve periods of dramatic rise, and your professional impact leaves a lasting mark on your field. You are a leader who transforms not just your own life but the institutions and communities you serve.' },
      { heading: 'Challenges & Growth', body: 'Power corruption, ruthless ambition, and public scandals involving the misuse of authority are the most serious risks. You may become so identified with your professional power that you lose touch with your humanity, or you might attract powerful enemies who seek to destroy your reputation. Growth involves using your considerable professional power in service of genuine transformation rather than personal aggrandizement, and maintaining your integrity even when power offers you the temptation to compromise your values.' },
    ],
  },
  'pluto-in-11th-house': {
    intro: 'Pluto in the 11th house brings transformative power to your social life, your friendships, and your relationship with collective movements and ideals.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You have the ability to transform groups, organizations, and social movements from within. Your friendships are intense and transformative, and you attract companions who share your passion for deep change. You are drawn to causes that address fundamental power imbalances in society, and you have the strategic brilliance and emotional intensity to create genuine social transformation. Your vision for the future is not just optimistic but radical, and you have the power to inspire others to fight for a fundamentally different world.' },
      { heading: 'Challenges & Growth', body: 'Power struggles within groups, manipulating social dynamics for personal gain, and attracting or becoming involved with extremist organizations are significant risks. You may use friendship as a vehicle for power rather than genuine connection. Growth involves learning to empower others rather than controlling them, and to pursue social transformation through collaboration rather than domination.' },
    ],
  },
  'pluto-in-12th-house': {
    intro: 'Pluto in the 12th house is an intensely karmic placement that plunges your transformative power into the deepest recesses of the unconscious. Your greatest battles and your most profound victories occur in the invisible world within.',
    sections: [
      { heading: 'Life Areas & Gifts', body: 'You have extraordinary access to the collective unconscious and the transformative power that lies within the hidden dimensions of psyche and spirit. Your capacity for psychological and spiritual transformation is immense, and you may serve as a healer, therapist, or spiritual guide who helps others confront and integrate their deepest shadows. Your dreams are intense and often revelatory, providing access to wisdom that cannot be reached through ordinary consciousness. Your ability to face the darkness within yourself and emerge transformed is one of the most powerful gifts in the entire zodiac.' },
      { heading: 'Challenges & Growth', body: 'Unconscious power dynamics, hidden enemies, and the terrifying experience of ego dissolution are the most intense challenges. You may feel haunted by unnamed fears or compulsions that seem to come from beyond your personal history. Periods of isolation, either chosen or forced, serve as crucibles for your deepest transformations. Growth involves bringing your hidden power into the light of consciousness, using your extraordinary depth for healing rather than self-destruction, and trusting that the death of who you were is always the birth of who you are becoming.' },
    ],
  },
};

/* ── Build all 120 placements ────────────────────────────────────── */

function buildAllPlacements(): PlanetHousePlacement[] {
  const placements: PlanetHousePlacement[] = [];

  for (const planet of PLANETS) {
    for (let house = 1; house <= 12; house++) {
      const slug = `${planet.name.toLowerCase()}-in-${ordinal(house)}-house`;
      const content = PLANET_HOUSE_CONTENT[slug];

      if (!content) continue;

      placements.push({
        planet: planet.name,
        house,
        slug,
        symbol: planet.symbol,
        title: `${planet.name} in the ${ordinal(house)} House`,
        intro: content.intro,
        sections: content.sections,
        keywords: [
          `${planet.name.toLowerCase()} in ${ordinal(house)} house`,
          `${planet.name.toLowerCase()} ${ordinal(house)} house`,
          `${planet.name.toLowerCase()} in house ${house}`,
          `${planet.name.toLowerCase()} placement`,
          'natal chart',
          'birth chart',
          'astrology houses',
          planet.domain,
          HOUSE_THEMES[house - 1].area,
        ],
      });
    }
  }

  return placements;
}

export const ALL_PLANET_HOUSE_PLACEMENTS = buildAllPlacements();

export function getPlacement(slug: string): PlanetHousePlacement | undefined {
  return ALL_PLANET_HOUSE_PLACEMENTS.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return ALL_PLANET_HOUSE_PLACEMENTS.map((p) => p.slug);
}

export function getPlacementsForPlanet(planetName: string): PlanetHousePlacement[] {
  return ALL_PLANET_HOUSE_PLACEMENTS.filter((p) => p.planet === planetName);
}

export { PLANETS, HOUSE_THEMES };
