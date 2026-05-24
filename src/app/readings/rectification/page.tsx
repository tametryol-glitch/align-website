'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { ArrowLeft, Wrench, Copy, Check, ChevronUp, ChevronDown } from 'lucide-react';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';
import { PaywallGate } from '@/components/ui/PaywallGate';
import {
  type BodyCodeAnswers,
  type BodyCodeMatchResult,
  buildBodyCodeMatchResult,
  scoreBodyCodeCandidate,
} from '@/lib/engines/bodyCodeRectification';

// ─── Types ──────────────────────────────────────────────────────────────────

interface LifeEvent {
  type: string;
  date: string;
  description: string;
}

interface QuestionOption {
  label: string;
  value: string;
}

interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
}

interface Module {
  id: string;
  title: string;
  questions: Question[];
}

interface RectificationResult {
  best_time: string;
  confidence_score: number;
  confidence_label: string;
  confidence_range: string;
  event_match_score: number;
  natal_structure_score: number;
  internal_pattern_score: number;
  external_expression_score: number;
  explanation: string;
  alternatives: { time: string; score: number; asc_sign: string }[];
  top_alternatives?: { time: string; score: number; asc_sign: string }[];
  phase_breakdown?: {
    event_score?: number;
    structure_score?: number;
    duad_score?: number;
    compendium_score?: number;
  };
  chart: {
    planets: any[];
    aspects: any[];
    house_cusps: number[];
    ascendant_degree: number;
  };
  rising_sign: string;
  rising_degree: number;
  key_signatures: {
    asc_sign: string;
    asc_ruler: string;
    moon_sign: string;
    moon_house: number;
    mc_sign: string;
    deeper_pattern: string;
    expressed_pattern: string;
  };
}

// ─── CopyButton ─────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary mt-1 shrink-0"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ─── Markdown Renderer ──────────────────────────────────────────────────────

function RenderMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('## ')) {
          return <h2 key={i} className="text-lg font-display font-bold text-amber-400 mt-6 mb-2">{trimmed.replace('## ', '')}</h2>;
        }
        if (trimmed.startsWith('### ')) {
          return <h3 key={i} className="text-base font-semibold text-text-primary mt-4 mb-1">{trimmed.replace('### ', '')}</h3>;
        }
        if (trimmed.startsWith('---')) {
          return <hr key={i} className="border-border-primary my-4" />;
        }
        if (trimmed.startsWith('- ')) {
          return (
            <div key={i} className="flex gap-2 pl-2 mb-1">
              <span className="text-amber-400">&bull;</span>
              <span className="text-text-secondary text-sm flex-1"><InlineFormat text={trimmed.slice(2)} /></span>
            </div>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          const match = trimmed.match(/^(\d+)\.\s(.*)/);
          return (
            <div key={i} className="flex gap-2 pl-2 mb-1">
              <span className="text-amber-400 w-5">{match ? match[1] + '.' : ''}</span>
              <span className="text-text-secondary text-sm flex-1"><InlineFormat text={match ? match[2] : trimmed} /></span>
            </div>
          );
        }
        if (trimmed.length > 0) {
          return <p key={i} className="text-text-secondary text-sm leading-relaxed mb-1"><InlineFormat text={trimmed} /></p>;
        }
        return <div key={i} className="h-2" />;
      })}
    </>
  );
}

function InlineFormat({ text }: { text: string }) {
  const parts: (string | JSX.Element)[] = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(<strong key={match.index} className="font-semibold text-text-primary">{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return <>{parts}</>;
}

// ─── Questionnaire Data ─────────────────────────────────────────────────────

const LIFE_EVENT_TYPES = [
  'Marriage', 'Divorce', 'Childbirth', 'Parent Loss', 'Major Relocation',
  'Surgery/Illness', 'Career Breakthrough', 'Business Launch', 'Financial Loss',
  'Spiritual Awakening', 'Public Recognition', 'Major Accident',
];

const TIME_PRESETS = [
  { label: 'Morning (6AM-12PM)', earliest: '06:00 AM', latest: '12:00 PM' },
  { label: 'Afternoon (12PM-6PM)', earliest: '12:00 PM', latest: '06:00 PM' },
  { label: 'Evening (6PM-12AM)', earliest: '06:00 PM', latest: '12:00 AM' },
  { label: 'Night (12AM-6AM)', earliest: '12:00 AM', latest: '06:00 AM' },
  { label: 'Entire Day', earliest: '12:00 AM', latest: '11:59 PM' },
];

const HOURS = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

const MODULES: Module[] = [
  {
    id: 'body_code',
    title: 'Ascendant Body-Code',
    questions: [
      {
        id: 'bc_sex',
        text: 'Were you born male or female?',
        options: [
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' },
        ],
      },
      {
        id: 'bc_expression',
        text: 'Throughout your life, has your natural body expression, movement, and mannerism felt more masculine, feminine, or mixed?',
        options: [
          { label: 'Masculine', value: 'masculine' },
          { label: 'Feminine', value: 'feminine' },
          { label: 'Mixed / both', value: 'mixed' },
        ],
      },
    ],
  },
  {
    id: 'birth_confidence',
    title: 'Birth Time Confidence',
    questions: [
      {
        id: 'bc_1',
        text: 'How was your birth time recorded?',
        options: [
          { label: 'From a birth certificate with exact time', value: 'certificate_exact' },
          { label: 'From a birth certificate with rounded time', value: 'certificate_rounded' },
          { label: 'A family member remembers', value: 'family_memory' },
          { label: 'I was told an approximate time', value: 'approximate' },
          { label: 'I have no idea', value: 'unknown' },
        ],
      },
      {
        id: 'bc_2',
        text: 'How confident are you in your recorded birth time?',
        options: [
          { label: 'Very confident, within minutes', value: 'very_confident' },
          { label: 'Somewhat confident, within an hour', value: 'somewhat' },
          { label: 'Not very confident, could be off by hours', value: 'not_confident' },
          { label: 'No recorded time at all', value: 'no_time' },
        ],
      },
    ],
  },
  {
    id: 'core_identity',
    title: 'Core Identity',
    questions: [
      {
        id: 'ci_1',
        text: 'When people meet you for the first time, they usually see you as...',
        options: [
          { label: 'Bold, energetic, a natural leader', value: 'fire_cardinal' },
          { label: 'Calm, grounded, reliable', value: 'earth_fixed' },
          { label: 'Curious, talkative, quick-witted', value: 'air_mutable' },
          { label: 'Sensitive, intuitive, emotionally deep', value: 'water_cardinal' },
          { label: 'Charismatic, dramatic, warm', value: 'fire_fixed' },
          { label: 'Analytical, detail-oriented, practical', value: 'earth_mutable' },
          { label: 'Charming, diplomatic, balanced', value: 'air_cardinal' },
          { label: 'Mysterious, intense, magnetic', value: 'water_fixed' },
          { label: 'Adventurous, philosophical, free-spirited', value: 'fire_mutable' },
          { label: 'Reserved, ambitious, authoritative', value: 'earth_cardinal' },
          { label: 'Eccentric, independent, humanitarian', value: 'air_fixed' },
          { label: 'Dreamy, compassionate, artistic', value: 'water_mutable' },
        ],
      },
      {
        id: 'ci_2',
        text: 'Your body type and physical energy are best described as...',
        options: [
          { label: 'Athletic, muscular, high energy', value: 'mars_type' },
          { label: 'Sturdy, solid, enduring stamina', value: 'saturn_type' },
          { label: 'Slim, agile, restless energy', value: 'mercury_type' },
          { label: 'Soft, rounded, nurturing presence', value: 'moon_type' },
          { label: 'Striking, regal, commanding presence', value: 'sun_type' },
          { label: 'Graceful, attractive, harmonious features', value: 'venus_type' },
          { label: 'Tall, expansive, larger than life', value: 'jupiter_type' },
        ],
      },
    ],
  },
  {
    id: 'physical_presence',
    title: 'Physical Presence',
    questions: [
      {
        id: 'pp_1',
        text: 'How would you describe your natural resting expression?',
        options: [
          { label: 'Intense, piercing eyes', value: 'scorpio_asc' },
          { label: 'Open, friendly, approachable', value: 'sagittarius_asc' },
          { label: 'Serious, composed, dignified', value: 'capricorn_asc' },
          { label: 'Warm, radiant, attention-drawing', value: 'leo_asc' },
          { label: 'Gentle, soft, dreamy', value: 'pisces_asc' },
          { label: 'Alert, youthful, animated', value: 'gemini_asc' },
          { label: 'Calm, serene, beautiful', value: 'taurus_asc' },
          { label: 'Nurturing, round-faced, welcoming', value: 'cancer_asc' },
          { label: 'Sharp, precise, refined', value: 'virgo_asc' },
          { label: 'Balanced, symmetrical, elegant', value: 'libra_asc' },
          { label: 'Bold, athletic, direct gaze', value: 'aries_asc' },
          { label: 'Unique, angular, unconventional', value: 'aquarius_asc' },
        ],
      },
      {
        id: 'pp_2',
        text: 'How do you typically enter a room?',
        options: [
          { label: 'I charge in confidently', value: 'cardinal_fire' },
          { label: 'I slip in quietly and observe', value: 'mutable_water' },
          { label: 'I walk in steadily and find my spot', value: 'fixed_earth' },
          { label: 'I float in and start conversations', value: 'mutable_air' },
          { label: 'I make an entrance people notice', value: 'fixed_fire' },
          { label: 'I arrive precisely and settle in methodically', value: 'mutable_earth' },
        ],
      },
    ],
  },
  {
    id: 'emotional_nature',
    title: 'Emotional Nature',
    questions: [
      {
        id: 'en_1',
        text: 'When you feel deeply hurt, your first instinct is to...',
        options: [
          { label: 'Fight back or get angry', value: 'fire_moon' },
          { label: 'Withdraw and process alone', value: 'water_moon' },
          { label: 'Talk it through rationally', value: 'air_moon' },
          { label: 'Ground yourself with routine or comfort', value: 'earth_moon' },
        ],
      },
      {
        id: 'en_2',
        text: 'Your emotional needs are best met when...',
        options: [
          { label: 'I feel admired and seen', value: 'moon_leo' },
          { label: 'I feel safe and cared for at home', value: 'moon_cancer' },
          { label: 'I have intellectual stimulation', value: 'moon_gemini' },
          { label: 'I have structure and achievement', value: 'moon_capricorn' },
          { label: 'I have freedom and adventure', value: 'moon_sagittarius' },
          { label: 'I have deep, transformative connections', value: 'moon_scorpio' },
          { label: 'I have beauty and harmony', value: 'moon_libra' },
          { label: 'I can serve and be useful', value: 'moon_virgo' },
          { label: 'I can be independent and unique', value: 'moon_aquarius' },
          { label: 'I can escape into creativity or spirituality', value: 'moon_pisces' },
          { label: 'I have physical activity and excitement', value: 'moon_aries' },
          { label: 'I have material comfort and stability', value: 'moon_taurus' },
        ],
      },
      {
        id: 'en_3',
        text: 'How quickly do your moods change?',
        options: [
          { label: 'Very fast - I can go from happy to angry in seconds', value: 'cardinal_moon' },
          { label: 'Slowly - I hold onto feelings for a long time', value: 'fixed_moon' },
          { label: 'It depends on the situation, I adapt', value: 'mutable_moon' },
        ],
      },
    ],
  },
  {
    id: 'mother_pattern',
    title: 'Mother/Caregiver Pattern',
    questions: [
      {
        id: 'mp_1',
        text: 'Your relationship with your mother (or primary caregiver) was most like...',
        options: [
          { label: 'Warm and nurturing, she was very present', value: 'cancer_4h' },
          { label: 'Structured and disciplined, she had high standards', value: 'capricorn_4h' },
          { label: 'Emotionally complex, sometimes overwhelming', value: 'scorpio_4h' },
          { label: 'Distant or absent, I felt on my own', value: 'aquarius_4h' },
          { label: 'Fun and social, but not always stable', value: 'gemini_4h' },
          { label: 'Protective, but sometimes smothering', value: 'taurus_4h' },
          { label: 'Dramatic, she was the center of the family', value: 'leo_4h' },
          { label: 'Serving, sacrificing, always helping others', value: 'virgo_4h' },
          { label: 'Spiritual, dreamy, or dealing with substance issues', value: 'pisces_4h' },
        ],
      },
      {
        id: 'mp_2',
        text: 'Home life growing up was...',
        options: [
          { label: 'Stable and comfortable', value: 'earth_4h' },
          { label: 'Chaotic and unpredictable', value: 'mutable_4h' },
          { label: 'Emotionally intense', value: 'water_4h' },
          { label: 'Achievement-focused', value: 'cardinal_4h' },
          { label: 'We moved frequently', value: 'mutable_ic' },
        ],
      },
    ],
  },
  {
    id: 'father_pattern',
    title: 'Father/Authority Pattern',
    questions: [
      {
        id: 'fp_1',
        text: 'Your father (or authority figure) was most like...',
        options: [
          { label: 'Authoritative, respected, strong leader', value: 'saturn_10h' },
          { label: 'Creative, dramatic, sometimes self-centered', value: 'sun_10h' },
          { label: 'Intellectual, communicative, full of ideas', value: 'mercury_10h' },
          { label: 'Absent, distant, or unconventional', value: 'uranus_10h' },
          { label: 'Generous, philosophical, larger than life', value: 'jupiter_10h' },
          { label: 'Intense, controlling, or secretive', value: 'pluto_10h' },
          { label: 'Gentle, artistic, or struggled with boundaries', value: 'neptune_10h' },
          { label: 'Warrior-type, physical, competitive', value: 'mars_10h' },
        ],
      },
      {
        id: 'fp_2',
        text: 'Your relationship with authority in general is...',
        options: [
          { label: 'I respect hierarchy and work within it', value: 'saturn_strong' },
          { label: 'I rebel against authority', value: 'uranus_strong' },
          { label: 'I naturally become the authority', value: 'sun_strong' },
          { label: 'I avoid confrontation with authority', value: 'neptune_strong' },
          { label: 'I strategically navigate power dynamics', value: 'pluto_strong' },
        ],
      },
    ],
  },
  {
    id: 'relationship_history',
    title: 'Relationship History',
    questions: [
      {
        id: 'rh_1',
        text: 'In romantic relationships, you tend to be...',
        options: [
          { label: 'Passionate and all-or-nothing', value: 'scorpio_7h' },
          { label: 'Devoted and loyal, seeking stability', value: 'taurus_7h' },
          { label: 'Independent, needing lots of space', value: 'aquarius_7h' },
          { label: 'Nurturing, wanting to care for my partner', value: 'cancer_7h' },
          { label: 'Adventurous, wanting shared experiences', value: 'sagittarius_7h' },
          { label: 'Communicative, needing mental connection', value: 'gemini_7h' },
          { label: 'Harmonious, wanting beauty and balance', value: 'libra_7h' },
          { label: 'Ambitious, seeking a power couple dynamic', value: 'capricorn_7h' },
        ],
      },
      {
        id: 'rh_2',
        text: 'Partners are usually attracted to you because of your...',
        options: [
          { label: 'Intensity and depth', value: 'pluto_dsc' },
          { label: 'Warmth and generosity', value: 'sun_dsc' },
          { label: 'Intelligence and wit', value: 'mercury_dsc' },
          { label: 'Beauty and charm', value: 'venus_dsc' },
          { label: 'Strength and drive', value: 'mars_dsc' },
          { label: 'Stability and reliability', value: 'saturn_dsc' },
          { label: 'Uniqueness and originality', value: 'uranus_dsc' },
        ],
      },
    ],
  },
  {
    id: 'money_pattern',
    title: 'Money Pattern',
    questions: [
      {
        id: 'mo_1',
        text: 'Your natural relationship with money is...',
        options: [
          { label: 'I earn well and spend generously', value: 'jupiter_2h' },
          { label: 'I save carefully and value security', value: 'saturn_2h' },
          { label: 'Money comes and goes in waves', value: 'neptune_2h' },
          { label: 'I earn through creativity and self-expression', value: 'sun_2h' },
          { label: 'Money comes through partnerships or others', value: 'venus_2h' },
          { label: 'I hustle and diversify income streams', value: 'mercury_2h' },
          { label: 'I transform my finances dramatically over time', value: 'pluto_2h' },
          { label: 'Income is unpredictable or unconventional', value: 'uranus_2h' },
        ],
      },
      {
        id: 'mo_2',
        text: 'Your biggest financial challenge tends to be...',
        options: [
          { label: 'Overspending or overindulging', value: 'jupiter_challenge' },
          { label: 'Fear of scarcity, hoarding', value: 'saturn_challenge' },
          { label: 'Impulsive purchases', value: 'mars_challenge' },
          { label: 'Giving too much away', value: 'neptune_challenge' },
          { label: 'Power struggles around shared resources', value: 'pluto_challenge' },
          { label: 'Inconsistent income', value: 'uranus_challenge' },
        ],
      },
    ],
  },
  {
    id: 'career_role',
    title: 'Career/Public Role',
    questions: [
      {
        id: 'cr_1',
        text: 'In your career, you are most fulfilled when...',
        options: [
          { label: 'Leading and making decisions', value: 'aries_mc' },
          { label: 'Building something lasting and stable', value: 'taurus_mc' },
          { label: 'Communicating, writing, or teaching', value: 'gemini_mc' },
          { label: 'Nurturing or caring for others', value: 'cancer_mc' },
          { label: 'Being creative and recognized', value: 'leo_mc' },
          { label: 'Analyzing, improving, perfecting systems', value: 'virgo_mc' },
          { label: 'Mediating, creating harmony, design', value: 'libra_mc' },
          { label: 'Investigating, researching, transforming', value: 'scorpio_mc' },
          { label: 'Exploring, traveling, teaching philosophy', value: 'sagittarius_mc' },
          { label: 'Achieving status and building legacy', value: 'capricorn_mc' },
          { label: 'Innovating and disrupting norms', value: 'aquarius_mc' },
          { label: 'Creating art, healing, or spiritual work', value: 'pisces_mc' },
        ],
      },
      {
        id: 'cr_2',
        text: 'People in your professional life see you as...',
        options: [
          { label: 'The boss or natural leader', value: 'mc_cardinal' },
          { label: 'The reliable expert', value: 'mc_fixed' },
          { label: 'The adaptable problem solver', value: 'mc_mutable' },
        ],
      },
    ],
  },
  {
    id: 'life_events',
    title: 'Major Life Events',
    questions: [],
  },
];

// ─── Date Helpers ───────────────────────────────────────────────────────────

function formatDateInput(text: string): string {
  const digits = text.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return digits.slice(0, 2) + '-' + digits.slice(2);
  return digits.slice(0, 2) + '-' + digits.slice(2, 4) + '-' + digits.slice(4, 8);
}

function toISODate(ddmmyyyy: string): string {
  const parts = ddmmyyyy.split('-');
  if (parts.length === 3 && parts[0].length <= 2) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return ddmmyyyy;
}

const formatDegree = (deg: number): string => `${deg.toFixed(1)}°`;

// ─── Main Component ─────────────────────────────────────────────────────────

export default function RectificationPage() {
  const { profile } = useAuthStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Wizard state
  const [step, setStep] = useState(0); // 0=intro, 1=time window, 2=questionnaire, 3=processing, 4=results
  const [currentModule, setCurrentModule] = useState(0);

  // Time window
  const [earliestHour, setEarliestHour] = useState('12');
  const [earliestMinute, setEarliestMinute] = useState('00');
  const [earliestPeriod, setEarliestPeriod] = useState<'AM' | 'PM'>('PM');
  const [latestHour, setLatestHour] = useState('11');
  const [latestMinute, setLatestMinute] = useState('59');
  const [latestPeriod, setLatestPeriod] = useState<'AM' | 'PM'>('PM');

  // Questionnaire answers
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Life events
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([
    { type: '', date: '', description: '' },
    { type: '', date: '', description: '' },
    { type: '', date: '', description: '' },
  ]);

  // Processing
  const [processingPhase, setProcessingPhase] = useState(0);
  const [phasesComplete, setPhasesComplete] = useState<boolean[]>([false, false, false]);

  // Results
  const [result, setResult] = useState<RectificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Adaptive filtering
  const [candidates, setCandidates] = useState<any[] | null>(null);
  const [skippedQuestions, setSkippedQuestions] = useState<Set<string>>(new Set());
  const [narrowingMessage, setNarrowingMessage] = useState<string | null>(null);

  // AI Reading
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAi, setShowAi] = useState(false);

  if (!profile?.birth_date || !profile?.latitude) {
    return (
      <PaywallGate feature="rectification" fallbackTier="pro">
        <BirthDataPrompt message="Add your birth data to start birth time rectification." />
      </PaywallGate>
    );
  }

  // ─── Auto-save/load progress ──────────────────────────────────────────────

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rectification_progress');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.answers) setAnswers(data.answers);
        if (data.lifeEvents?.length > 0) setLifeEvents(data.lifeEvents);
        if (data.currentModule) setCurrentModule(data.currentModule);
        if (data.earliestHour) setEarliestHour(data.earliestHour);
        if (data.earliestMinute) setEarliestMinute(data.earliestMinute);
        if (data.earliestPeriod) setEarliestPeriod(data.earliestPeriod);
        if (data.latestHour) setLatestHour(data.latestHour);
        if (data.latestMinute) setLatestMinute(data.latestMinute);
        if (data.latestPeriod) setLatestPeriod(data.latestPeriod);
        if (data.step && data.step <= 2) setStep(data.step);
        if (data.candidates) setCandidates(data.candidates);
        if (data.skippedQuestions) setSkippedQuestions(new Set(data.skippedQuestions));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (Object.keys(answers).length > 0 || lifeEvents.some(e => e.type)) {
      try {
        localStorage.setItem('rectification_progress', JSON.stringify({
          answers, lifeEvents, currentModule, step: Math.min(step, 2),
          earliestHour, earliestMinute, earliestPeriod,
          latestHour, latestMinute, latestPeriod,
          candidates,
          skippedQuestions: Array.from(skippedQuestions),
        }));
      } catch {}
    }
  }, [answers, lifeEvents, currentModule, step, earliestHour, earliestMinute, earliestPeriod, latestHour, latestMinute, latestPeriod, candidates, skippedQuestions]);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const animateStep = (nextStep: number) => {
    setStep(nextStep);
    scrollToTop();
  };

  const formatTime = (h: string, m: string, p: string) => `${h}:${m} ${p}`;

  const parseTimeString = (t: string): [string, string, string] => {
    const parts = t.split(' ');
    const [h, m] = parts[0].split(':');
    return [h, m, parts[1]];
  };

  const applyPreset = (preset: typeof TIME_PRESETS[0]) => {
    const [eH, eM, eP] = parseTimeString(preset.earliest);
    const [lH, lM, lP] = parseTimeString(preset.latest);
    setEarliestHour(eH);
    setEarliestMinute(eM);
    setEarliestPeriod(eP as 'AM' | 'PM');
    setLatestHour(lH);
    setLatestMinute(lM);
    setLatestPeriod(lP as 'AM' | 'PM');
  };

  const setAnswer = async (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));

    try {
      const latestAnswers = { ...answers, [questionId]: value };
      const bodyCodeContext: BodyCodeAnswers = {};
      if (latestAnswers['bc_sex'] === 'male' || latestAnswers['bc_sex'] === 'female') {
        bodyCodeContext.birthSex = latestAnswers['bc_sex'] as 'male' | 'female';
      }
      if (latestAnswers['bc_expression']) {
        bodyCodeContext.bodyExpression = latestAnswers['bc_expression'] as 'masculine' | 'feminine' | 'mixed';
      }

      const payload = {
        birth_data: buildBirthData(profile!),
        time_window: {
          earliest: formatTime(earliestHour, earliestMinute, earliestPeriod),
          latest: formatTime(latestHour, latestMinute, latestPeriod),
        },
        question_id: questionId,
        answer_value: value,
        current_candidates: candidates,
        body_code_answers: bodyCodeContext,
      };

      const data = await api.adaptiveFilter(payload);

      if (data) {
        setCandidates(data.remaining_candidates);
        setSkippedQuestions(new Set(data.skip_questions || []));

        if (data.eliminated_count > 0) {
          setNarrowingMessage(
            `Narrowed to ${data.total_remaining} candidate time${data.total_remaining !== 1 ? 's' : ''}`
          );
        } else if (candidates === null) {
          setNarrowingMessage(
            `${data.total_remaining} candidate time${data.total_remaining !== 1 ? 's' : ''} generated`
          );
        } else {
          setNarrowingMessage(null);
        }

        // Auto-clear message after 3s
        setTimeout(() => setNarrowingMessage(null), 3000);
      }
    } catch {
      // Silently continue if adaptive filter fails
    }
  };

  const updateLifeEvent = (index: number, field: keyof LifeEvent, value: string) => {
    setLifeEvents(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addLifeEvent = () => {
    setLifeEvents(prev => [...prev, { type: '', date: '', description: '' }]);
  };

  const removeLifeEvent = (index: number) => {
    if (lifeEvents.length <= 3) return;
    setLifeEvents(prev => prev.filter((_, i) => i !== index));
  };

  const canProceedFromQuestionnaire = (): boolean => {
    if (MODULES[currentModule]?.id === 'life_events') {
      const validEvents = lifeEvents.filter(e => e.type && e.date);
      return validEvents.length >= 3;
    }
    const mod = MODULES[currentModule];
    const visibleQs = mod.questions.filter(q => !skippedQuestions.has(q.id));
    return visibleQs.every(q => answers[q.id]);
  };

  // ─── Processing ───────────────────────────────────────────────────────────

  const startProcessing = async () => {
    animateStep(3);
    setProcessingPhase(0);
    setPhasesComplete([false, false, false]);
    setError(null);

    try {
      const convertedEvents = lifeEvents
        .filter(e => e.type && e.date)
        .map(e => ({ ...e, date: toISODate(e.date) }));

      const retryBodyCode: BodyCodeAnswers = {};
      if (answers['bc_sex'] === 'male' || answers['bc_sex'] === 'female') {
        retryBodyCode.birthSex = answers['bc_sex'] as 'male' | 'female';
      }
      if (answers['bc_expression']) {
        retryBodyCode.bodyExpression = answers['bc_expression'] as 'masculine' | 'feminine' | 'mixed';
      }

      const payload = {
        birth_data: buildBirthData(profile!),
        time_window: {
          earliest: formatTime(earliestHour, earliestMinute, earliestPeriod),
          latest: formatTime(latestHour, latestMinute, latestPeriod),
        },
        questionnaire_answers: answers,
        life_events: convertedEvents,
        body_code_answers: retryBodyCode,
      };

      // Simulate phase progression
      setProcessingPhase(0);
      await new Promise(r => setTimeout(r, 1200));
      setPhasesComplete(prev => { const n = [...prev]; n[0] = true; return n; });
      setProcessingPhase(1);
      await new Promise(r => setTimeout(r, 1200));
      setPhasesComplete(prev => { const n = [...prev]; n[1] = true; return n; });
      setProcessingPhase(2);

      const data = await api.analyzeRectification(payload);

      setPhasesComplete([true, true, true]);
      await new Promise(r => setTimeout(r, 600));

      setResult(data);
      animateStep(4);
    } catch (err: any) {
      setError(err.message || 'Birth time rectification requires the Align server. This feature will be available when the server is online.');
      animateStep(4);
    }
  };

  // ─── AI Reading ───────────────────────────────────────────────────────────

  const requestAIReading = useCallback(async () => {
    if (!result) return;
    setAiLoading(true);
    setShowAi(true);
    setAiText('');

    const firstName = (profile?.display_name || '').split(' ')[0] || 'you';
    const prompt = `You are an elite astrologer giving a personal birth time rectification analysis for ${firstName}.

Their rectified birth time is ${result.best_time} with ${result.rising_sign} rising at ${formatDegree(result.rising_degree || 0)}.
Confidence: ${result.confidence_label}

Key signatures:
- Ascendant: ${result.key_signatures?.asc_sign || 'unknown'}
- Moon: ${result.key_signatures?.moon_sign || 'unknown'} House ${result.key_signatures?.moon_house || '?'}
- MC: ${result.key_signatures?.mc_sign || 'unknown'}
- Deeper Pattern: ${result.key_signatures?.deeper_pattern || 'unknown'}
- Expressed Pattern: ${result.key_signatures?.expressed_pattern || 'unknown'}

Phase breakdown:
- Event Match: ${result.phase_breakdown?.event_score?.toFixed(1) || '?'}/100
- Natal Structure: ${result.phase_breakdown?.structure_score?.toFixed(1) || '?'}/100
- Internal Pattern: ${result.phase_breakdown?.duad_score?.toFixed(1) || '?'}/100
- External Expression: ${result.phase_breakdown?.compendium_score?.toFixed(1) || '?'}/100

IMPORTANT RULERSHIP: Vesta rules Virgo, Juno rules Libra. Use these when discussing rulers.

Give ${firstName} a deeply personal, conversational reading about what this rectified chart reveals about them. Cover:
1. What their rising sign and degree says about how the world sees them
2. How the Moon placement shapes their emotional world
3. What the MC reveals about their career and public path
4. The hidden layers that make them who they are beneath the surface
5. Why this specific birth time fits their life story

Be warm, direct, and specific. Use ${firstName}'s name. No astrology jargon — speak as if explaining to someone who wants to understand themselves, not study a chart. Do NOT use the words "duad" or "compendium" — weave those layers naturally.`;

    try {
      await api.streamAIInterpretation(
        {
          type: 'rectification',
          messages: [
            { role: 'system', content: 'You are a master astrologer specializing in birth time rectification. Give deeply personal, insightful readings.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 2000,
        },
        (chunk) => setAiText(prev => prev + chunk),
        () => {},
      );
    } catch {
      setAiText(
        `## Your Rectified Chart, ${firstName}\n\n` +
        `Based on the analysis, your most likely birth time is **${result.best_time}**, giving you **${result.rising_sign} rising** at ${formatDegree(result.rising_degree || 0)}.\n\n` +
        `This rising sign shapes how the world first experiences you — it's the energy you walk into every room with, the first impression that precedes everything else about you.\n\n` +
        `Your Moon in ${result.key_signatures?.moon_sign || 'its sign'} reveals your emotional core — the part of you that only the people closest to you get to see. This is where you process life, where you retreat when the world gets too loud.\n\n` +
        `With ${result.key_signatures?.mc_sign || 'your MC sign'} at the top of your chart, your public path and career direction carry that energy — it's what you're building toward, what people eventually know you for.\n\n` +
        `The deeper layers of your chart suggest that beneath what's visible, there's a more complex story — one that involves ${result.key_signatures?.deeper_pattern || 'hidden patterns'} driving your inner world, and ${result.key_signatures?.expressed_pattern || 'expressed patterns'} shaping how that inner world manifests in your daily life.\n\n` +
        `This birth time was selected because it best aligns with your life experiences, personality, and the patterns that have shaped your journey so far.`
      );
    } finally {
      setAiLoading(false);
    }
  }, [result, profile]);

  // ─── Render: Time Wheel ───────────────────────────────────────────────────

  const renderTimeWheel = (
    hour: string, setHour: (v: string) => void,
    minute: string, setMinute: (v: string) => void,
    period: 'AM' | 'PM', setPeriod: (v: 'AM' | 'PM') => void,
    label: string,
  ) => (
    <div className="mb-6">
      <p className="text-sm font-medium text-text-secondary mb-3">{label}</p>
      <div className="flex items-center gap-2 justify-center">
        {/* Hour */}
        <div className="flex flex-col items-center gap-1">
          <button
            className="text-text-muted hover:text-text-primary p-1"
            onClick={() => {
              const idx = HOURS.indexOf(hour);
              setHour(HOURS[(idx + 1) % 12]);
            }}
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <div className="w-12 h-10 flex items-center justify-center bg-bg-tertiary rounded-lg">
            <span className="text-lg font-mono text-text-primary">{hour}</span>
          </div>
          <button
            className="text-text-muted hover:text-text-primary p-1"
            onClick={() => {
              const idx = HOURS.indexOf(hour);
              setHour(HOURS[(idx - 1 + 12) % 12]);
            }}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <span className="text-xl font-bold text-text-muted">:</span>

        {/* Minute */}
        <div className="flex flex-col items-center gap-1">
          <button
            className="text-text-muted hover:text-text-primary p-1"
            onClick={() => {
              const idx = MINUTES.indexOf(minute);
              setMinute(MINUTES[(idx + 1) % 60]);
            }}
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <div className="w-12 h-10 flex items-center justify-center bg-bg-tertiary rounded-lg">
            <span className="text-lg font-mono text-text-primary">{minute}</span>
          </div>
          <button
            className="text-text-muted hover:text-text-primary p-1"
            onClick={() => {
              const idx = MINUTES.indexOf(minute);
              setMinute(MINUTES[(idx - 1 + 60) % 60]);
            }}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* AM/PM */}
        <div className="flex flex-col gap-1 ml-2">
          <button
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              period === 'AM'
                ? 'bg-accent-primary text-white'
                : 'bg-bg-tertiary text-text-muted hover:text-text-primary'
            }`}
            onClick={() => setPeriod('AM')}
          >
            AM
          </button>
          <button
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              period === 'PM'
                ? 'bg-accent-primary text-white'
                : 'bg-bg-tertiary text-text-muted hover:text-text-primary'
            }`}
            onClick={() => setPeriod('PM')}
          >
            PM
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Render: Score Bar ────────────────────────────────────────────────────

  const renderScoreBar = (label: string, score: number) => (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-text-secondary">{label}</span>
        <span className="text-sm font-medium text-text-primary">{Math.round(score)}/100</span>
      </div>
      <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent-primary to-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );

  // ─── Render: Wizard Dots ──────────────────────────────────────────────────

  const renderWizardDots = () => (
    <div className="flex justify-center items-center gap-2 py-4">
      {[0, 1, 2, 3, 4].map(i => (
        <div
          key={i}
          className={`h-2 rounded transition-all ${
            step === i ? 'w-6 bg-accent-primary' :
            step > i ? 'w-2 bg-accent-secondary' :
            'w-2 bg-bg-tertiary'
          }`}
        />
      ))}
    </div>
  );

  // ─── Step 0: Introduction ─────────────────────────────────────────────────

  const renderIntroduction = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center">
        <h1 className="text-2xl font-display font-bold text-text-primary mt-4">{'✦'} Birth Time Rectification</h1>
        <p className="text-text-tertiary mt-1">Discover your most likely birth time</p>
      </div>

      <div className="card">
        <h3 className="font-semibold text-text-primary mb-3">What is Birth Time Rectification?</h3>
        <p className="text-sm text-text-secondary mb-4">
          Rectification is the process of determining your most accurate birth time using
          a combination of life event analysis, personality assessment, and astrological pattern matching.
        </p>

        <div className="space-y-3">
          {[
            { num: '1', label: 'Body-Code Filter', desc: 'Your birth sex and body expression are used to narrow candidate times using the Ascendant\'s hidden layers.' },
            { num: '2', label: 'Event Matching', desc: 'Your major life events are tested against candidate birth charts to find the best match.' },
            { num: '3', label: 'Natal Structure Fit', desc: 'Your personality traits and physical characteristics are compared to chart indicators.' },
            { num: '4', label: 'Precision Sweep', desc: 'Deeper chart layers are analyzed for the final precision calibration.' },
          ].map(phase => (
            <div key={phase.num} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-accent-primary/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-accent-primary">{phase.num}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{phase.label}</p>
                <p className="text-xs text-text-muted">{phase.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card border-amber-500/20 bg-amber-500/5">
        <p className="text-sm text-text-secondary">
          {'⚠️'} This provides a ranked estimate of your most likely birth time, not a guaranteed exact time.
          The accuracy depends on the quality of information you provide.
        </p>
      </div>

      <button
        onClick={() => animateStep(1)}
        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
      >
        Begin Rectification
      </button>
    </div>
  );

  // ─── Step 1: Time Window ──────────────────────────────────────────────────

  const renderTimeWindow = () => (
    <div className="space-y-6 animate-fadeIn">
      <button onClick={() => animateStep(0)} className="text-sm text-accent-secondary hover:text-accent-primary">
        {'←'} Back
      </button>

      <div>
        <h2 className="text-xl font-display font-bold text-text-primary mb-1">What do you know about your birth time?</h2>
        <p className="text-sm text-text-tertiary">Set the earliest and latest possible times for your birth.</p>
      </div>

      {renderTimeWheel(
        earliestHour, setEarliestHour,
        earliestMinute, setEarliestMinute,
        earliestPeriod, setEarliestPeriod,
        'Earliest Possible Time',
      )}

      {renderTimeWheel(
        latestHour, setLatestHour,
        latestMinute, setLatestMinute,
        latestPeriod, setLatestPeriod,
        'Latest Possible Time',
      )}

      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Quick Presets</p>
        <div className="flex flex-wrap gap-2">
          {TIME_PRESETS.map(preset => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              className="px-3 py-1.5 rounded-full text-xs bg-bg-tertiary text-text-secondary hover:bg-accent-primary/20 hover:text-accent-primary transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {profile && (
        <div className="card bg-bg-tertiary/50">
          <p className="text-xs text-text-muted mb-1">Using your birth data:</p>
          <p className="text-sm text-text-secondary">
            {profile.birth_date} {'•'} {profile.birth_location || `${profile.latitude}, ${profile.longitude}`}
          </p>
        </div>
      )}

      <button
        onClick={() => { setCurrentModule(0); animateStep(2); }}
        className="w-full bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
      >
        Next
      </button>
    </div>
  );

  // ─── Step 2: Questionnaire ────────────────────────────────────────────────

  const renderProgressBar = () => {
    const progress = ((currentModule + 1) / MODULES.length) * 100;
    return (
      <div className="mb-4">
        <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-text-muted mt-1">Module {currentModule + 1} of {MODULES.length}</p>
      </div>
    );
  };

  const renderQuestionCard = (question: Question) => (
    <div key={question.id} className="mb-6">
      <p className="text-sm font-medium text-text-primary mb-3">{question.text}</p>
      <div className="space-y-2">
        {question.options.map(option => {
          const isSelected = answers[question.id] === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setAnswer(question.id, option.value)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                isSelected
                  ? 'bg-accent-primary/20 border border-accent-primary text-text-primary'
                  : 'bg-bg-tertiary border border-transparent text-text-secondary hover:border-border-primary'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderLifeEventsModule = () => {
    const validCount = lifeEvents.filter(e => e.type && e.date).length;

    return (
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          Please add at least 3 significant life events with their dates.
          The more events you add, the more accurate the rectification.
        </p>

        {lifeEvents.map((event, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-text-primary">Event {index + 1}</span>
              {lifeEvents.length > 3 && (
                <button onClick={() => removeLifeEvent(index)} className="text-text-muted hover:text-red-400 text-sm">
                  {'✕'}
                </button>
              )}
            </div>

            {/* Event Type */}
            <p className="text-xs text-text-muted mb-2">Event Type</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {LIFE_EVENT_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => updateLifeEvent(index, 'type', type)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                    event.type === type
                      ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary'
                      : 'bg-bg-tertiary text-text-muted hover:text-text-secondary border border-transparent'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Date */}
            <p className="text-xs text-text-muted mb-1">Date (DD-MM-YYYY)</p>
            <input
              type="text"
              value={event.date}
              onChange={(e) => updateLifeEvent(index, 'date', formatDateInput(e.target.value))}
              placeholder="20-06-2015"
              maxLength={10}
              className="input text-sm mb-3"
            />

            {/* Description */}
            <p className="text-xs text-text-muted mb-1">Brief Description (optional)</p>
            <textarea
              value={event.description}
              onChange={(e) => updateLifeEvent(index, 'description', e.target.value)}
              placeholder="What happened..."
              rows={2}
              className="input text-sm resize-none"
            />
          </div>
        ))}

        <button onClick={addLifeEvent} className="btn-ghost text-sm w-full">
          + Add Another Event
        </button>

        {validCount < 3 && (
          <p className="text-amber-400 text-sm text-center">
            {'⚠️'} Please add at least {3 - validCount} more event{3 - validCount > 1 ? 's' : ''} with type and date.
          </p>
        )}
      </div>
    );
  };

  const renderNarrowingIndicator = () => {
    const count = candidates ? candidates.length : null;
    if (count === null) return null;

    return (
      <div className="mb-4 space-y-2">
        <div className="inline-block bg-accent-primary/15 rounded-full px-3 py-1">
          <span className="text-xs font-medium text-accent-primary">
            {count} candidate time{count !== 1 ? 's' : ''} remaining
          </span>
        </div>

        {narrowingMessage && (
          <div className="bg-accent-primary/10 rounded-lg px-3 py-2 animate-fadeIn">
            <p className="text-xs text-accent-secondary">{narrowingMessage}</p>
          </div>
        )}

        {count <= 5 && count > 0 && (
          <div className="bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-lg px-3 py-2">
            <p className="text-xs text-accent-primary">
              {'✦'} We&apos;re getting close -- just a few more questions to pinpoint your exact time
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderQuestionnaire = () => {
    const mod = MODULES[currentModule];
    const isLifeEvents = MODULES[currentModule]?.id === 'life_events';

    const visibleQuestions = mod.questions.filter(q => !skippedQuestions.has(q.id));
    const allSkipped = !isLifeEvents && mod.questions.length > 0 && visibleQuestions.length === 0;

    return (
      <div className="space-y-4 animate-fadeIn">
        <button
          onClick={() => {
            if (currentModule > 0) {
              setCurrentModule(currentModule - 1);
              scrollToTop();
            } else {
              animateStep(1);
            }
          }}
          className="text-sm text-accent-secondary hover:text-accent-primary"
        >
          {'←'} {currentModule > 0 ? 'Previous Module' : 'Back'}
        </button>

        {renderProgressBar()}
        {renderNarrowingIndicator()}

        <h2 className="text-xl font-display font-bold text-text-primary">{mod.title}</h2>

        {allSkipped ? (
          <div className="card border-emerald-500/20 bg-emerald-500/5">
            <p className="text-sm text-text-secondary">
              {'✓'} This section has been resolved by your previous answers.
              All remaining candidates agree on these traits.
            </p>
          </div>
        ) : isLifeEvents ? renderLifeEventsModule() : (
          visibleQuestions.map(q => renderQuestionCard(q))
        )}

        <div className="flex gap-3 mt-6">
          {currentModule > 0 && (
            <button
              onClick={() => { setCurrentModule(currentModule - 1); scrollToTop(); }}
              className="btn-secondary flex-1"
            >
              Previous Module
            </button>
          )}
          {currentModule < MODULES.length - 1 ? (
            <button
              onClick={() => { setCurrentModule(currentModule + 1); scrollToTop(); }}
              disabled={!canProceedFromQuestionnaire()}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              Next Module
            </button>
          ) : (
            <button
              onClick={startProcessing}
              disabled={!canProceedFromQuestionnaire()}
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Analyze My Birth Time
            </button>
          )}
        </div>
      </div>
    );
  };

  // ─── Step 3: Processing ───────────────────────────────────────────────────

  const renderProcessing = () => {
    const phases = [
      'Matching life events to candidate charts...',
      'Refining natal structure fit...',
      'Precision sweep with deeper chart layers...',
    ];

    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-5xl animate-spin mb-6">{'✦'}</div>

        <h2 className="text-xl font-display font-bold text-text-primary mb-8">
          Analyzing your birth time across 3 phases...
        </h2>

        <div className="space-y-4 w-full max-w-md">
          {phases.map((phase, i) => (
            <div key={i} className="flex items-center gap-3 animate-fadeIn" style={{ animationDelay: `${i * 0.8}s` }}>
              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                {phasesComplete[i] ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <span className="text-emerald-400 text-xs">{'✓'}</span>
                  </div>
                ) : processingPhase === i ? (
                  <div className="text-accent-primary animate-spin text-sm">{'✦'}</div>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-bg-tertiary" />
                )}
              </div>
              <span className={`text-sm ${
                phasesComplete[i] ? 'text-emerald-400' :
                processingPhase === i ? 'text-text-primary' :
                'text-text-muted'
              }`}>
                {phase}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ─── Step 4: Results ──────────────────────────────────────────────────────

  const renderResults = () => {
    if (error) {
      return (
        <div className="space-y-4 animate-fadeIn">
          <button onClick={() => animateStep(2)} className="text-sm text-accent-secondary hover:text-accent-primary">
            {'←'} Back to Questionnaire
          </button>
          <div className="card text-center py-8">
            <span className="text-4xl block mb-4">{'⚠️'}</span>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Server Required</h3>
            <p className="text-sm text-text-secondary mb-6">{error}</p>
            <button
              onClick={async () => {
                setError(null);
                startProcessing();
              }}
              className="btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (!result) return null;

    const confidenceColor = (result.confidence_score ?? 0) >= 75
      ? 'text-emerald-400'
      : (result.confidence_score ?? 0) >= 50
        ? 'text-amber-400'
        : 'text-red-400';

    const confidenceBorderColor = (result.confidence_score ?? 0) >= 75
      ? 'border-emerald-400'
      : (result.confidence_score ?? 0) >= 50
        ? 'border-amber-400'
        : 'border-red-400';

    const gaugeColor = (result.confidence_score ?? 0) >= 75
      ? 'from-emerald-500 to-emerald-400'
      : (result.confidence_score ?? 0) >= 50
        ? 'from-amber-500 to-amber-400'
        : 'from-red-500 to-red-400';

    return (
      <div className="space-y-4 animate-fadeIn">
        <Link href="/readings" className="text-sm text-accent-secondary hover:text-accent-primary">
          {'←'} Back to Readings
        </Link>

        <h2 className="text-xl font-display font-bold text-text-primary">Your Rectified Birth Time</h2>

        {/* Main Result */}
        <div className="bg-gradient-to-br from-amber-500/15 to-amber-500/[0.03] rounded-2xl p-8 border border-amber-500/20 text-center">
          <p className="text-xs text-amber-400 font-medium uppercase tracking-widest mb-2">Most Likely Birth Time</p>
          <h2 className="text-4xl font-display font-bold text-text-primary mb-3">{result.best_time}</h2>

          <div className={`inline-block border ${confidenceBorderColor} rounded-full px-4 py-1`}>
            <span className={`text-sm font-medium ${confidenceColor}`}>
              {result.confidence_label} {result.confidence_range}
            </span>
          </div>
        </div>

        {/* Confidence Score */}
        <div className="card text-center">
          <h3 className="font-semibold text-text-primary mb-4">Confidence Score</h3>
          <div className="relative w-32 h-32 mx-auto mb-2">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-bg-tertiary" />
              <circle
                cx="64" cy="64" r="56" strokeWidth="8" fill="none"
                className="text-accent-primary"
                strokeLinecap="round"
                strokeDasharray={`${(result.confidence_score ?? 0) / 100 * 2 * Math.PI * 56} ${2 * Math.PI * 56}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${confidenceColor}`}>{result.confidence_score ?? 0}</span>
              <span className="text-xs text-text-muted">/ 100</span>
            </div>
          </div>
        </div>

        {/* Phase Breakdown */}
        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4">Phase Breakdown</h3>
          {renderScoreBar('Event Match', result.event_match_score ?? result.phase_breakdown?.event_score ?? 0)}
          {renderScoreBar('Natal Structure', result.natal_structure_score ?? result.phase_breakdown?.structure_score ?? 0)}
          {renderScoreBar('Internal Pattern', result.internal_pattern_score ?? result.phase_breakdown?.duad_score ?? 0)}
          {renderScoreBar('External Expression', result.external_expression_score ?? result.phase_breakdown?.compendium_score ?? 0)}
        </div>

        {/* Why This Time */}
        <div className="card">
          <h3 className="font-semibold text-text-primary mb-2">Why This Time</h3>
          <p className="text-sm text-text-secondary">{result.explanation || 'Analysis complete. See the chart and scores above for details.'}</p>
        </div>

        {/* Alternative Times */}
        {(result.alternatives?.length > 0 || result.top_alternatives?.length) && (
          <div className="card">
            <h3 className="font-semibold text-text-primary mb-3">Alternative Times</h3>
            {(result.alternatives || result.top_alternatives || []).map((alt: any, i: number) => (
              <div key={i} className="mb-3 last:mb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-text-primary">{alt.time || 'N/A'}</span>
                  <span className="text-sm text-text-secondary">{Math.round(alt.score ?? 0)}/100</span>
                </div>
                <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full bg-purple-500/60 rounded-full transition-all"
                    style={{ width: `${Math.min(alt.score ?? 0, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-text-muted">Ascendant: {alt.asc_sign || alt.reason || 'N/A'}</p>
              </div>
            ))}
          </div>
        )}

        {/* Rising Sign */}
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/[0.03] rounded-2xl p-6 border border-accent-muted text-center">
          <p className="text-xs text-accent-secondary font-medium uppercase tracking-widest mb-2">Your Ascendant</p>
          <h3 className="text-2xl font-display font-bold text-text-primary">
            {result.rising_sign || 'Unknown'} {formatDegree(result.rising_degree ?? 0)}
          </h3>
        </div>

        {/* Key Signatures */}
        {result.key_signatures && (
          <div className="card">
            <h3 className="font-semibold text-text-primary mb-3">Key Signatures</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-bg-tertiary rounded-xl">
                <p className="text-xs text-text-muted mb-0.5">Ascendant</p>
                <p className="text-sm text-text-primary font-medium">
                  {result.key_signatures.asc_sign} <span className="text-text-muted font-normal">(ruler: {result.key_signatures.asc_ruler})</span>
                </p>
              </div>
              <div className="p-3 bg-bg-tertiary rounded-xl">
                <p className="text-xs text-text-muted mb-0.5">Moon</p>
                <p className="text-sm text-text-primary font-medium">
                  {result.key_signatures.moon_sign} <span className="text-text-muted font-normal">in House {result.key_signatures.moon_house}</span>
                </p>
              </div>
              <div className="p-3 bg-bg-tertiary rounded-xl">
                <p className="text-xs text-text-muted mb-0.5">Midheaven</p>
                <p className="text-sm text-text-primary font-medium">{result.key_signatures.mc_sign}</p>
              </div>
              <div className="p-3 bg-bg-tertiary rounded-xl">
                <p className="text-xs text-text-muted mb-0.5">Deeper Pattern</p>
                <p className="text-sm text-text-primary font-medium">{result.key_signatures.deeper_pattern}</p>
              </div>
              <div className="p-3 bg-bg-tertiary rounded-xl col-span-2">
                <p className="text-xs text-text-muted mb-0.5">Expressed Pattern</p>
                <p className="text-sm text-text-primary font-medium">{result.key_signatures.expressed_pattern}</p>
              </div>
            </div>
          </div>
        )}

        {/* Ascendant Body-Code Match */}
        {(() => {
          const bcAnswers: BodyCodeAnswers = {};
          if (answers['bc_sex'] === 'male' || answers['bc_sex'] === 'female') {
            bcAnswers.birthSex = answers['bc_sex'] as 'male' | 'female';
          }
          if (answers['bc_expression']) {
            bcAnswers.bodyExpression = answers['bc_expression'] as 'masculine' | 'feminine' | 'mixed';
          }
          const bcResult = buildBodyCodeMatchResult(
            result.rising_degree != null ? result.chart?.ascendant_degree ?? result.rising_degree : undefined,
            result.rising_sign || result.key_signatures?.asc_sign,
            bcAnswers,
          );
          if (!bcResult) return null;
          return (
            <div className="card">
              <h3 className="font-semibold text-text-primary mb-3">Ascendant Body-Code Match</h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-bg-tertiary rounded-xl text-center">
                  <p className="text-xs text-text-muted mb-0.5">Rising Sign</p>
                  <p className="text-sm text-text-primary font-medium">{bcResult.risingSign}</p>
                </div>
                <div className="p-3 bg-bg-tertiary rounded-xl text-center">
                  <p className="text-xs text-text-muted mb-0.5">Rising Duad</p>
                  <p className="text-sm text-text-primary font-medium">{bcResult.risingDuad}</p>
                  <p className="text-xs text-text-muted">{bcResult.duadPolarity}</p>
                </div>
                <div className="p-3 bg-bg-tertiary rounded-xl text-center">
                  <p className="text-xs text-text-muted mb-0.5">Rising Compendium</p>
                  <p className="text-sm text-text-primary font-medium">{bcResult.risingCompendium}</p>
                  <p className="text-xs text-text-muted">{bcResult.compendiumPolarity}</p>
                </div>
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    bcResult.compendiumMatchesBirthSex === true ? 'text-emerald-400' :
                    bcResult.compendiumMatchesBirthSex === false ? 'text-red-400' :
                    'text-text-muted'
                  }`}>
                    {bcResult.compendiumMatchesBirthSex === true ? '✓ Match' :
                     bcResult.compendiumMatchesBirthSex === false ? '✗ Mismatch' :
                     'Not provided'}
                  </span>
                  <span className="text-sm text-text-secondary">Compendium / Birth Sex</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    bcResult.duadMatchesBodyExpression === true ? 'text-emerald-400' :
                    bcResult.duadMatchesBodyExpression === false ? 'text-red-400' :
                    'text-text-muted'
                  }`}>
                    {bcResult.duadMatchesBodyExpression === true ? '✓ Match' :
                     bcResult.duadMatchesBodyExpression === false ? '✗ Mismatch' :
                     'Not provided'}
                  </span>
                  <span className="text-sm text-text-secondary">Duad / Body Expression</span>
                </div>
              </div>
              <p className="text-sm text-text-secondary">{bcResult.explanation}</p>
            </div>
          );
        })()}

        {/* AI Deep Analysis */}
        {!showAi ? (
          <button
            onClick={requestAIReading}
            className="w-full bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            {'✨'} AI Deep Analysis
          </button>
        ) : (
          <div className="card">
            <h3 className="font-semibold text-text-primary mb-3">{'✨'} AI Deep Analysis</h3>
            {aiText ? (
              <>
                <RenderMarkdown text={aiText} />
                <CopyButton text={aiText} />
              </>
            ) : (
              <p className="text-sm text-text-muted animate-pulse">Generating deep analysis...</p>
            )}
            {aiLoading && (
              <div className="flex justify-center mt-3">
                <span className="text-accent-primary animate-spin">{'✦'}</span>
              </div>
            )}
          </div>
        )}

        {/* Save Button - not applicable on web since profile updates go through settings */}
        <div className="h-8" />
      </div>
    );
  };

  // ─── Main Render ──────────────────────────────────────────────────────────

  return (
    <PaywallGate feature="rectification" fallbackTier="pro">
      <div className="max-w-3xl mx-auto" ref={scrollRef}>
        {step !== 3 && step !== 4 && (
          <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Readings
          </Link>
        )}
        {step !== 3 && step !== 4 && (
          <div className="flex items-center gap-3 mb-6">
            <Wrench className="w-8 h-8 text-accent-primary" />
            <div>
              <h1 className="text-2xl font-display font-bold text-text-primary">Birth Time Rectification</h1>
              <p className="text-text-tertiary text-sm">Refine your birth time using major life events</p>
            </div>
          </div>
        )}

        {step !== 3 && renderWizardDots()}
        {step === 0 && renderIntroduction()}
        {step === 1 && renderTimeWindow()}
        {step === 2 && renderQuestionnaire()}
        {step === 3 && renderProcessing()}
        {step === 4 && renderResults()}
      </div>
    </PaywallGate>
  );
}
