export interface DatingPromptOption {
  id: string;
  question: string;
  category: 'astrology' | 'personality' | 'values' | 'fun';
}

export const DATING_PROMPTS: DatingPromptOption[] = [
  {
    id: 'mercury_talk',
    question: 'My Mercury is chatty, which means I\'ll never stop talking about...',
    category: 'astrology',
  },
  {
    id: 'venus_love',
    question: 'My Venus sign says I show love by...',
    category: 'astrology',
  },
  {
    id: 'mars_energy',
    question: 'My Mars energy comes out most when...',
    category: 'astrology',
  },
  {
    id: 'moon_comfort',
    question: 'When my Moon needs comfort, I...',
    category: 'astrology',
  },
  {
    id: 'cosmic_date',
    question: 'My idea of a cosmically aligned date is...',
    category: 'fun',
  },
  {
    id: 'red_flag',
    question: 'The one astrological red flag I can\'t ignore...',
    category: 'fun',
  },
  {
    id: 'retrograde_survival',
    question: 'My Mercury retrograde survival strategy is...',
    category: 'fun',
  },
  {
    id: 'love_language',
    question: 'The love language my chart says I need most is...',
    category: 'personality',
  },
  {
    id: 'deal_maker',
    question: 'What makes me swipe right on the universe\'s plan is...',
    category: 'values',
  },
  {
    id: 'growth_lesson',
    question: 'The biggest lesson Saturn taught me about love is...',
    category: 'values',
  },
  {
    id: 'partner_element',
    question: 'I\'m looking for someone whose element complements mine by...',
    category: 'personality',
  },
  {
    id: 'weird_flex',
    question: 'My most niche astrological flex is...',
    category: 'fun',
  },
];

export const MAX_DATING_PROMPTS = 3;
export const MAX_PROMPT_ANSWER_LENGTH = 300;
