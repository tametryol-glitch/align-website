'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

// The Astro Einstein rulership system (Whole Sign). Mirrors the mobile
// CUSTOM_SIGN_RULERS — Virgo=Vesta, Libra=Juno, never the conventional rulers.
const ALIGN_RULERS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon', Leo: 'Sun',
  Virgo: 'Vesta', Libra: 'Juno', Scorpio: 'Pluto', Sagittarius: 'Jupiter',
  Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune',
};

export interface QuizItem { q: string; choices: string[]; answer: number; explain?: string }

/** Render lesson body: paragraphs split on blank lines, **bold** inline. */
export function LessonBody({ content }: { content: string }) {
  if (!content) return null;
  return (
    <div className="text-text-secondary text-[15px] leading-relaxed space-y-4">
      {content.split(/\n\n+/).map((para, i) => (
        <p key={i}>{renderInline(para)}</p>
      ))}
    </div>
  );
}

function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="text-text-primary font-semibold">{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  );
}

export function LessonObjectives({ objectives }: { objectives?: string[] }) {
  if (!objectives || objectives.length === 0) return null;
  return (
    <div className="card mb-5">
      <h3 className="text-sm font-semibold text-text-primary mb-2">🎯 What you&apos;ll learn</h3>
      <ul className="list-disc pl-5 space-y-1 text-sm text-text-secondary marker:text-accent-primary">
        {objectives.map((o, i) => <li key={i}>{o}</li>)}
      </ul>
    </div>
  );
}

export function ChartFocusCard({ chartFocus }: { chartFocus?: string | null }) {
  const { profile } = useAuthStore();
  if (!chartFocus) return null;
  const sun = profile?.sun_sign, moon = profile?.moon_sign, rising = profile?.rising_sign;
  const ruler = rising ? ALIGN_RULERS[rising] : null;
  const hasAny = !!(sun || moon || rising);
  return (
    <div className="card mt-5 border-l-4" style={{ borderLeftColor: '#A855F7' }}>
      <h3 className="text-sm font-semibold text-text-primary mb-1">📊 See it in your chart</h3>
      <p className="text-xs text-text-tertiary mb-3 leading-relaxed">{chartFocus}</p>
      {hasAny ? (
        <div className="space-y-1 text-sm text-text-secondary">
          {sun && <p><span className="font-bold text-accent-secondary">Sun</span> &nbsp;{sun}</p>}
          {moon && <p><span className="font-bold text-accent-secondary">Moon</span> &nbsp;{moon}</p>}
          {rising && <p><span className="font-bold text-accent-secondary">Rising</span> &nbsp;{rising}</p>}
          {rising && ruler && (
            <p className="text-xs text-text-secondary mt-2 leading-relaxed">
              In Whole Sign, your entire 1st house is <strong className="text-text-primary">{rising}</strong>, ruled by <strong className="text-text-primary">{ruler}</strong> in the Align system.
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-text-muted italic">Add your birth time and place in your profile to see your own placements here.</p>
      )}
    </div>
  );
}

export function KeyTerms({ terms, glossary }: { terms?: string[]; glossary: Record<string, string> }) {
  const [open, setOpen] = useState<string | null>(null);
  if (!terms || terms.length === 0) return null;
  const labeled = terms.filter((t) => glossary[t]);
  if (labeled.length === 0) return null;
  const label = (k: string) => k.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <div className="card mt-5">
      <h3 className="text-sm font-semibold text-text-primary mb-2">📖 Key terms</h3>
      <div className="flex flex-wrap gap-1.5">
        {labeled.map((tm) => (
          <button key={tm} onClick={() => setOpen(open === tm ? null : tm)}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${open === tm ? 'bg-accent-primary/25' : 'bg-accent-primary/10'}`}
            style={{ color: '#C4A2F7', borderColor: 'rgba(168,85,247,0.25)' }}>
            {label(tm)}
          </button>
        ))}
      </div>
      {open && <p className="text-sm text-text-secondary mt-3 leading-relaxed">{glossary[open]}</p>}
    </div>
  );
}

export function LessonQuiz({ quiz }: { quiz?: QuizItem[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  if (!quiz || quiz.length === 0) return null;
  const done = Object.keys(answers).length === quiz.length;
  const score = quiz.reduce((acc, item, i) => acc + (answers[i] === item.answer ? 1 : 0), 0);
  const pick = (qi: number, ci: number) => {
    if (answers[qi] !== undefined) return;
    setAnswers((a) => ({ ...a, [qi]: ci }));
  };
  return (
    <div className="card mt-5">
      <h3 className="text-sm font-semibold text-text-primary mb-3">🧠 Check your understanding</h3>
      <div className="space-y-5">
        {quiz.map((item, qi) => {
          const chosen = answers[qi];
          const answered = chosen !== undefined;
          return (
            <div key={qi}>
              <p className="text-sm font-medium text-text-primary mb-2">{qi + 1}. {item.q}</p>
              <div className="space-y-1.5">
                {item.choices.map((c, ci) => {
                  const showCorrect = answered && ci === item.answer;
                  const showWrong = answered && chosen === ci && ci !== item.answer;
                  return (
                    <button key={ci} disabled={answered} onClick={() => pick(qi, ci)}
                      className={`w-full text-left text-sm px-3 py-2 rounded-lg border transition-colors ${
                        showCorrect ? 'bg-green-500/15 border-green-500/40 text-text-primary'
                          : showWrong ? 'bg-red-500/12 border-red-500/40 text-text-primary'
                          : 'bg-bg-tertiary border-transparent text-text-secondary hover:border-border-primary'}`}>
                      {showCorrect ? '✓  ' : showWrong ? '✗  ' : ''}{c}
                    </button>
                  );
                })}
              </div>
              {answered && item.explain && <p className="text-xs text-text-muted italic mt-1.5">{item.explain}</p>}
            </div>
          );
        })}
      </div>
      {done && (
        <div className="mt-4 text-center text-sm font-bold text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg py-2.5">
          🏆 Score: {score}/{quiz.length} ({Math.round((score / quiz.length) * 100)}%)
        </div>
      )}
    </div>
  );
}
