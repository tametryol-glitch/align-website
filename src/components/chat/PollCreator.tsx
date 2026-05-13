'use client';

import { useState, useCallback } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────

interface PollCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePoll: (question: string, options: string[]) => void;
}

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

// ── Component ──────────────────────────────────────────────────────

export function PollCreator({ isOpen, onClose, onCreatePoll }: PollCreatorProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);

  // ── Validation ──

  const canCreate =
    question.trim().length > 0 &&
    options.length >= MIN_OPTIONS &&
    options.every(o => o.trim().length > 0);

  // ── Option handlers ──

  const updateOption = useCallback((index: number, value: string) => {
    setOptions(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const addOption = useCallback(() => {
    setOptions(prev => {
      if (prev.length >= MAX_OPTIONS) return prev;
      return [...prev, ''];
    });
  }, []);

  const removeOption = useCallback((index: number) => {
    setOptions(prev => {
      if (prev.length <= MIN_OPTIONS) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // ── Submit ──

  function handleCreate() {
    if (!canCreate) return;
    const trimmedOptions = options.filter(o => o.trim()).map(o => o.trim());
    onCreatePoll(question.trim(), trimmedOptions);
    // Reset state
    setQuestion('');
    setOptions(['', '']);
    onClose();
  }

  // ── Cancel ──

  function handleClose() {
    setQuestion('');
    setOptions(['', '']);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={handleClose}
    >
      <div
        className="bg-bg-card border border-border-primary rounded-2xl shadow-2xl w-full max-w-md mx-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between p-4 border-b border-border-primary">
          <h2 className="text-lg font-display font-bold text-text-primary">
            Create Poll
          </h2>
          <button
            onClick={handleClose}
            className="p-1 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Question input */}
          <div>
            <label className="text-xs text-text-muted font-medium uppercase tracking-wider block mb-1.5">
              Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question..."
              className="input py-2.5 text-sm w-full"
              autoFocus
            />
          </div>

          {/* Options */}
          <div>
            <label className="text-xs text-text-muted font-medium uppercase tracking-wider block mb-1.5">
              Options
            </label>
            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="input py-2 text-sm flex-1"
                  />
                  {options.length > MIN_OPTIONS && (
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                      title="Remove option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add option button */}
            {options.length < MAX_OPTIONS && (
              <button
                type="button"
                onClick={addOption}
                className="flex items-center gap-2 mt-2 px-3 py-2 text-sm text-accent-primary
                  hover:bg-accent-primary/10 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add option
              </button>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex gap-3 p-4 border-t border-border-primary">
          <button
            onClick={handleClose}
            className="btn-ghost flex-1 py-2.5"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!canCreate}
            className="btn-primary flex-1 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create Poll
          </button>
        </div>
      </div>
    </div>
  );
}
