'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase';

const PROMPTS = [
  'What patterns keep repeating in your life right now?',
  'What is your intuition telling you that your mind resists?',
  'If the current transit were a teacher, what lesson would it be offering?',
  'What are you holding onto that no longer serves your highest good?',
  'Describe a synchronicity you noticed recently.',
  'What does your soul need most right now?',
  'If you could send a message to your past self, what would it be?',
  'What is growing in you that scares you?',
  'Write about a dream that felt significant.',
  'What are you grateful for in this cosmic moment?',
  'How has your understanding of yourself shifted this month?',
  'What boundary needs to be set or released?',
];

interface JournalEntry {
  id: string;
  prompt: string;
  content: string;
  created_at: string;
}

export default function CosmicJournalPage() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [journalText, setJournalText] = useState('');
  const [saving, setSaving] = useState(false);
  const [showEntries, setShowEntries] = useState(false);

  useEffect(() => {
    setCurrentPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
    if (user) loadEntries();
  }, [user]);

  async function loadEntries() {
    const supabase = createClient();
    const { data } = await supabase
      .from('cosmic_journal_entries')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setEntries(data as JournalEntry[]);
  }

  async function saveEntry() {
    if (!journalText.trim() || !user) return;
    setSaving(true);
    try {
      const supabase = createClient();
      await supabase.from('cosmic_journal_entries').insert({
        user_id: user.id,
        prompt: currentPrompt,
        content: journalText,
      });
      setJournalText('');
      setCurrentPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
      await loadEntries();
    } catch {
      // Silently handle — table might not exist yet
    } finally {
      setSaving(false);
    }
  }

  function newPrompt() {
    setCurrentPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to Readings
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Cosmic Journal</h1>
          <p className="text-text-tertiary text-sm">Reflect on your cosmic journey with guided prompts</p>
        </div>
      </div>

      {/* Current prompt */}
      <div className="bg-gradient-cosmic rounded-2xl p-6 border border-accent-muted mb-6">
        <p className="text-accent-tertiary text-xs font-medium uppercase tracking-widest mb-2">
          Today&apos;s Prompt
        </p>
        <p className="text-lg text-text-primary font-display italic leading-relaxed">
          &ldquo;{currentPrompt}&rdquo;
        </p>
        <button onClick={newPrompt} className="text-xs text-accent-primary mt-3 hover:text-accent-secondary transition-colors">
          Get a different prompt →
        </button>
      </div>

      {/* Writing area */}
      <div className="card mb-6">
        <textarea
          value={journalText}
          onChange={(e) => setJournalText(e.target.value)}
          placeholder="Write your thoughts here..."
          className="w-full bg-transparent text-text-primary placeholder:text-text-muted resize-none focus:outline-none min-h-[200px] text-sm leading-relaxed"
        />
        <div className="flex items-center justify-between pt-3 border-t border-border-primary">
          <span className="text-xs text-text-muted">
            {journalText.length} characters
          </span>
          <button
            onClick={saveEntry}
            disabled={!journalText.trim() || saving}
            className="btn-primary text-sm px-4 py-2"
          >
            {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </div>

      {/* Past entries */}
      <div>
        <button
          onClick={() => setShowEntries(!showEntries)}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors mb-3"
        >
          {showEntries ? 'Hide' : 'Show'} past entries ({entries.length})
        </button>

        {showEntries && entries.length > 0 && (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="card">
                <p className="text-xs text-accent-primary italic mb-2">&ldquo;{entry.prompt}&rdquo;</p>
                <p className="text-sm text-text-secondary leading-relaxed">{entry.content}</p>
                <p className="text-xs text-text-muted mt-2">
                  {new Date(entry.created_at).toLocaleDateString(undefined, {
                    weekday: 'short', month: 'short', day: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
