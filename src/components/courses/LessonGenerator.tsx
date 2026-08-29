'use client';

import { useState } from 'react';
import { Sparkles, Loader2, AlertTriangle } from 'lucide-react';

/**
 * Spec-to-draft panel for the Learn CMS.
 *
 * You write the spine — the one idea, what to teach in what order, the
 * misconception to attack. The generator writes the slides, drills and
 * objectives against the Align system and the shipped Level 1 lessons, and
 * every draft goes through the validator before it reaches this panel.
 *
 * The draft lands in the editor unsaved. Nothing ships until you press Save.
 */

interface Draft {
  objectives: string[];
  slides: Array<{ title: string; visual: string; content: string }>;
  quiz: Array<{ q: string; choices: string[]; answer: number; explain: string }>;
  attempts?: number;
}

export function LessonGenerator({
  lessonId,
  title,
  keyTerms,
  onApply,
}: {
  lessonId: string;
  title: string;
  keyTerms: string[];
  onApply: (draft: Draft) => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [oneIdea, setOneIdea] = useState('');
  const [teachPoints, setTeachPoints] = useState('');
  const [misconception, setMisconception] = useState('');
  const [drillFocus, setDrillFocus] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [questionCount, setQuestionCount] = useState(6);

  const lines = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean);
  const ready = oneIdea.trim().length > 0 && lines(teachPoints).length > 0;

  async function generate() {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/learn/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_id: lessonId,
          title,
          one_idea: oneIdea,
          teach_points: lines(teachPoints),
          misconception,
          drill_focus: lines(drillFocus),
          key_terms: keyTerms,
          slide_count: slideCount,
          question_count: questionCount,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        const detail = body?.detail;
        setError(
          typeof detail === 'string'
            ? detail
            : detail?.errors
              ? `Draft rejected: ${detail.errors.join(' · ')}`
              : body?.error || 'Generation failed',
        );
        return;
      }
      onApply(body as Draft);
      setOpen(false);
    } catch {
      setError('Could not reach the generator. It may still be running — try again in a moment.');
    } finally {
      setBusy(false);
    }
  }

  const field =
    'w-full bg-bg-primary border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary';

  return (
    <div className="border border-accent-primary/25 bg-accent-primary/[0.04] rounded-lg">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left"
      >
        <Sparkles size={14} className="text-accent-primary" />
        <span className="text-sm font-medium text-text-primary">Draft from a spec</span>
        <span className="text-[11px] text-text-muted ml-auto">
          {open ? 'Hide' : 'You write the spine, it writes the lesson'}
        </span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-3 border-t border-accent-primary/15 pt-3">
          <div>
            <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-1.5">
              The one idea
            </label>
            <input
              type="text"
              value={oneIdea}
              onChange={(e) => setOneIdea(e.target.value)}
              placeholder="What should the learner leave with?"
              className={field}
            />
          </div>

          <div>
            <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-1.5">
              Teach, in this order — one per line
            </label>
            <textarea
              value={teachPoints}
              onChange={(e) => setTeachPoints(e.target.value)}
              rows={4}
              placeholder={'Every sign is one element and one mode\nElement is what fuels it\nMode is when it moves'}
              className={`${field} resize-y`}
            />
          </div>

          <div>
            <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-1.5">
              Misconception to dismantle
            </label>
            <input
              type="text"
              value={misconception}
              onChange={(e) => setMisconception(e.target.value)}
              placeholder="e.g. that Aquarius is a water sign"
              className={field}
            />
          </div>

          <div>
            <label className="block text-[11px] text-text-muted uppercase tracking-wider mb-1.5">
              What the questions should test — one per line
            </label>
            <textarea
              value={drillFocus}
              onChange={(e) => setDrillFocus(e.target.value)}
              rows={3}
              placeholder={'Deriving a sign from element plus mode\nSpotting an empty element in a chart'}
              className={`${field} resize-y`}
            />
          </div>

          <div className="flex gap-3">
            <label className="flex-1 text-[11px] text-text-muted uppercase tracking-wider">
              Slides
              <input
                type="number"
                min={3}
                max={8}
                value={slideCount}
                onChange={(e) => setSlideCount(Number(e.target.value))}
                className={`${field} mt-1.5`}
              />
            </label>
            <label className="flex-1 text-[11px] text-text-muted uppercase tracking-wider">
              Questions
              <input
                type="number"
                min={3}
                max={10}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className={`${field} mt-1.5`}
              />
            </label>
          </div>

          {error && (
            <div className="flex gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/25 rounded-lg px-3 py-2">
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={generate}
            disabled={busy || !ready}
            className="btn-primary w-full py-2 text-sm flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {busy ? 'Drafting — this takes a minute' : 'Generate draft'}
          </button>

          <p className="text-[11px] text-text-muted leading-relaxed">
            The draft replaces the slides, questions and objectives in this editor
            but saves nothing. Read it, edit it, then press Save.
          </p>
        </div>
      )}
    </div>
  );
}
