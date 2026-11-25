// The Fifth Circle invitation — single source of truth for the chat message
// and the /fifth-circle/[token] landing page. Paragraphs are separate entries
// so both renderings keep clear spacing.

export const CIRCLE_BASE_URL = 'https://www.aligncosmic.com';
export const CIRCLE_EMBLEM_URL = `${CIRCLE_BASE_URL}/fifth-circle/emblem.png`;
export const CIRCLE_LOGO_URL = `${CIRCLE_BASE_URL}/fifth-circle/logo.jpg`;

export type CircleBlock =
  | { kind: 'p'; text: string }
  | { kind: 'h'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'quote'; text: string };

export const CIRCLE_TAGLINE = 'Five Elements. One Consciousness. Infinite Realities.';

export const CIRCLE_BLOCKS: CircleBlock[] = [
  { kind: 'h', text: 'A Private Invitation to Conscious Creation' },
  { kind: 'p', text: 'You have been personally selected and invited to become one of the six founding members of The Fifth Circle, a private society dedicated to the exploration, development and application of conscious creation.' },
  { kind: 'p', text: 'This invitation is not being extended to the general public. Each individual is being carefully selected based on their character, consciousness, integrity, spiritual potential and ability to contribute meaningfully to the collective.' },

  { kind: 'h', text: 'Our Purpose' },
  { kind: 'p', text: 'The Fifth Circle is founded upon the philosophy that imagination, intention, emotion, consciousness and deliberate action are fundamental instruments through which we can influence and shape our personal realities.' },
  { kind: 'p', text: 'Our objective is to explore and apply the principles of manifestation through collective visualization, meditation, subconscious programming, directed intention and the symbolic utilization of the five fundamental elements of existence:' },
  { kind: 'list', items: [
    'Fire — Willpower, passion, transformation and the activation of intention.',
    'Water — Emotion, intuition, receptivity and subconscious alignment.',
    'Air — Thought, imagination, visualization and mental creation.',
    'Earth — Stability, abundance, physical materialization and practical action.',
    'Ether — Consciousness, spiritual connection and the unification of all elements.',
  ] },
  { kind: 'p', text: "Rather than pursuing our individual aspirations in isolation, we will come together to reinforce, encourage and support the realization of one another's intentions." },
  { kind: 'quote', text: "One person's aspiration becomes an intention that the entire circle supports." },

  { kind: 'h', text: 'The Significance of Our Name' },
  { kind: 'p', text: 'The name The Fifth Circle was intentionally selected for its spiritual, elemental and numerological significance.' },
  { kind: 'p', text: 'The Fifth represents Ether, the element that symbolically connects and transcends the four physical elements. The Circle represents continuity, unity, equality and the absence of separation.' },
  { kind: 'p', text: 'Numerologically, The Fifth Circle carries the vibration of 78/15/6, a number associated with harmony, loyalty, responsibility, commitment and belonging.' },
  { kind: 'p', text: 'The circle will consist of exactly six founding members, reinforcing this vibration of unity.' },
  { kind: 'p', text: 'Our manifestation practices will also incorporate the Master Number 22, known in numerology as the Master Builder, symbolizing the transformation of imagination into tangible reality.' },
  { kind: 'p', text: 'Together, these numbers establish our foundational numerological signature of 6–6–22: Unity, Harmony and Creation.' },

  { kind: 'h', text: 'The Six Founding Members' },
  { kind: 'p', text: "Each member will occupy a significant position within the circle, contributing their unique abilities, experiences and consciousness to the collective." },
  { kind: 'p', text: 'The six founding positions are:' },
  { kind: 'list', items: [
    'The Guardian of Fire',
    'The Guardian of Water',
    'The Guardian of Air',
    'The Guardian of Earth',
    'The Guardian of Ether',
    'The Unifier',
  ] },
  { kind: 'p', text: "These positions will be determined through an assessment of each member's natural abilities, personality, astrological composition and spiritual strengths." },
  { kind: 'p', text: "No element is superior to another, and no member's personal aspirations are considered more important than those of another. Each individual represents an essential part of the collective." },

  { kind: 'h', text: 'What We Will Practice' },
  { kind: 'p', text: 'Our gatherings will incorporate a combination of spiritual, psychological, metaphysical and practical techniques, including:' },
  { kind: 'list', items: [
    'Collective manifestation and directed intention.',
    'Guided visualization and creative imagination.',
    'Subconscious reprogramming and hypnotic techniques.',
    'Meditation and emotional alignment.',
    'Elemental meditation and symbolism.',
    'Astrological and numerological timing.',
    'Affirmations and conscious thought direction.',
    'Personal and collective goal setting.',
    'The development of intuitive awareness.',
    'The documentation and evaluation of manifestation outcomes.',
    'Practical actions that support the realization of our intentions.',
  ] },
  { kind: 'p', text: 'Our proposed structure is to meet once a week, with each gathering incorporating a dedicated 22-minute collective manifestation session.' },
  { kind: 'p', text: 'Every member will have the opportunity to present their personal intentions to the circle, whether those intentions concern financial abundance, career advancement, relationships, health and well-being, personal development, opportunities or other meaningful aspirations.' },
  { kind: 'p', text: 'Our intention is not simply to wish for a different reality, but to develop the mental discipline, emotional alignment and behavioral consistency necessary to pursue it.' },

  { kind: 'h', text: 'The Principles of the Circle' },
  { kind: 'p', text: 'Membership within The Fifth Circle requires an understanding and acceptance of the following principles:' },
  { kind: 'p', text: 'I. Confidentiality\nWhat is disclosed within the circle remains within the circle. The personal circumstances, aspirations, experiences and vulnerabilities of every member must be respected and protected.' },
  { kind: 'p', text: 'II. Commitment\nMembers are expected to make a sincere effort to attend gatherings, participate in collective practices and honor their responsibilities to the circle.' },
  { kind: 'p', text: "III. Collective Support\nEvery member must be willing to devote the same sincerity, attention and intention toward another member's aspirations as they would toward their own." },
  { kind: 'p', text: "IV. Integrity\nThe circle will not participate in practices intended to harm, manipulate, control or interfere with another person's freedom of choice." },
  { kind: 'p', text: 'V. Freedom from Competition\nJealousy, envy, unnecessary competition and resentment have no place within the circle. The success of one member should be celebrated by all.' },
  { kind: 'p', text: 'VI. Accountability\nManifestation must be accompanied by personal responsibility, discipline and practical action. Every member is responsible for their own decisions and development.' },
  { kind: 'p', text: 'VII. Respect and Consent\nEvery member retains their individuality, personal beliefs, freedom of thought and the right to decline any practice they are uncomfortable participating in.' },
  { kind: 'p', text: 'VIII. Unity\nDifferences in personality, background, experience or perspective must never overshadow our common purpose. We are individuals working together, not individuals surrendering their independence.' },
  { kind: 'p', text: 'IX. Exclusivity Through Character\nThe distinction of belonging to The Fifth Circle will not be determined by wealth, popularity, social status or influence. It will be determined by integrity, discipline, consciousness and the quality of one\'s contribution.' },

  { kind: 'h', text: 'What Membership Means' },
  { kind: 'p', text: 'Being a founding member means that you are not simply joining an existing organization. You are participating in the establishment of its identity, philosophy, traditions and future.' },
  { kind: 'p', text: 'Together, we will create a private environment where aspirations can be expressed without ridicule, imagination can be exercised without unnecessary limitations, and personal growth can be encouraged without judgment.' },
  { kind: 'p', text: 'We will maintain a record of our intentions, experiences, observations and outcomes, allowing us to evaluate our progress and refine our methods as we develop.' },
  { kind: 'p', text: 'There are no guarantees of predetermined outcomes. Our purpose is to explore, practice, learn and grow together through sincere participation.' },

  { kind: 'h', text: 'Your Invitation' },
  { kind: 'p', text: 'I am extending this invitation to you because I believe you possess qualities that could make you a valuable part of this collective.' },
  { kind: 'p', text: "Before accepting, I ask that you consider whether you are genuinely prepared to commit your time, intention, imagination and attention not only to the development of your own reality, but also to supporting the aspirations of five other individuals." },
  { kind: 'p', text: 'Membership is entirely voluntary. This invitation carries no obligation, and every member remains free to withdraw at any time.' },
  { kind: 'p', text: 'Should you accept, you will become one of the six original founding members of The Fifth Circle.' },
  { kind: 'p', text: 'Together, we will explore the possibilities of consciousness, the creative capacity of imagination and the potential of six individuals united by intention.' },
  { kind: 'p', text: 'We are not coming together merely to discuss manifestation.' },
  { kind: 'p', text: 'We are coming together to practice conscious creation.' },
  { kind: 'p', text: 'Welcome to the possibility of becoming something greater together than we could become in isolation.' },
];

export const CIRCLE_SIGNOFF = [
  'THE FIFTH CIRCLE',
  CIRCLE_TAGLINE,
  'By private invitation only.',
  'Astro Einstein',
  'Founder of The Fifth Circle',
];

export function circleLink(token: string, response?: 'accept' | 'decline'): string {
  const base = `${CIRCLE_BASE_URL}/fifth-circle/${token}`;
  return response ? `${base}?r=${response}` : base;
}

/** Plain-text rendering for the chat bubble — blank line between every paragraph. */
export function circleChatText(token: string): string {
  const parts: string[] = [`THE FIFTH CIRCLE\n${CIRCLE_TAGLINE}`];
  for (const b of CIRCLE_BLOCKS) {
    if (b.kind === 'h') parts.push(`— ${b.text.toUpperCase()} —`);
    else if (b.kind === 'list') parts.push(b.items.map((i) => `• ${i}`).join('\n'));
    else if (b.kind === 'quote') parts.push(`“${b.text}”`);
    else parts.push(b.text);
  }
  parts.push(CIRCLE_SIGNOFF.join('\n'));
  parts.push(
    `— YOUR RESPONSE —\nTap one to answer. I'll be notified personally.\n\n✅ ACCEPT the invitation:\n${circleLink(token, 'accept')}\n\n❌ DECLINE the invitation:\n${circleLink(token, 'decline')}`,
  );
  return parts.join('\n\n');
}
