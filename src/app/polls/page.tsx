'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { BarChart3, Plus, CheckCircle } from 'lucide-react';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';

interface PollOption {
  id: string;
  text: string;
  vote_count: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  total_votes: number;
  created_at: string;
  expires_at: string | null;
  creator_name: string;
  user_voted_option: string | null;
}

export default function PollsPage() {
  const { user } = useAuthStore();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '']);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadPolls();
  }, [user]);

  async function loadPolls() {
    setLoading(true);
    const supabase = createClient();

    const { data: pollsData } = await supabase
      .from('polls')
      .select('id, question, created_at, expires_at, user_id')
      .order('created_at', { ascending: false })
      .limit(20);

    if (pollsData) {
      // Load options, votes, and creators
      const pollIds = pollsData.map(p => p.id);
      const creatorIds = Array.from(new Set(pollsData.map(p => p.user_id)));

      const [optionsRes, votesRes, creatorsRes] = await Promise.all([
        supabase.from('poll_options').select('*').in('poll_id', pollIds),
        user ? supabase.from('poll_votes').select('poll_id, option_id').eq('user_id', user.id).in('poll_id', pollIds) : { data: [] },
        supabase.from('profiles').select('id, display_name').in('id', creatorIds),
      ]);

      const creatorMap: Record<string, string> = {};
      creatorsRes.data?.forEach((c: any) => { creatorMap[c.id] = c.display_name; });

      const userVotes: Record<string, string> = {};
      (votesRes.data || []).forEach((v: any) => { userVotes[v.poll_id] = v.option_id; });

      const optionsByPoll: Record<string, PollOption[]> = {};
      (optionsRes.data || []).forEach((o: any) => {
        if (!optionsByPoll[o.poll_id]) optionsByPoll[o.poll_id] = [];
        optionsByPoll[o.poll_id].push({ id: o.id, text: o.text, vote_count: o.vote_count || 0 });
      });

      setPolls(pollsData.map(p => ({
        id: p.id,
        question: p.question,
        options: optionsByPoll[p.id] || [],
        total_votes: (optionsByPoll[p.id] || []).reduce((sum, o) => sum + o.vote_count, 0),
        created_at: p.created_at,
        expires_at: p.expires_at,
        creator_name: creatorMap[p.user_id] || 'Unknown',
        user_voted_option: userVotes[p.id] || null,
      })));
    }
    setLoading(false);
  }

  async function vote(pollId: string, optionId: string) {
    if (!user) return;
    const supabase = createClient();

    await supabase.from('poll_votes').insert({
      poll_id: pollId,
      option_id: optionId,
      user_id: user.id,
    });

    // Increment vote count
    await supabase.rpc('increment_poll_vote', { option_id_input: optionId });

    // Update local state
    setPolls(prev => prev.map(p => {
      if (p.id !== pollId) return p;
      return {
        ...p,
        user_voted_option: optionId,
        total_votes: p.total_votes + 1,
        options: p.options.map(o =>
          o.id === optionId ? { ...o, vote_count: o.vote_count + 1 } : o
        ),
      };
    }));
  }

  async function createPoll() {
    if (!user || !newQuestion.trim() || newOptions.filter(o => o.trim()).length < 2) return;
    setCreating(true);
    const supabase = createClient();

    const { data: poll } = await supabase
      .from('polls')
      .insert({
        question: newQuestion.trim(),
        user_id: user.id,
      })
      .select()
      .single();

    if (poll) {
      const options = newOptions.filter(o => o.trim()).map(text => ({
        poll_id: poll.id,
        text: text.trim(),
        vote_count: 0,
      }));
      await supabase.from('poll_options').insert(options);
    }

    setNewQuestion('');
    setNewOptions(['', '']);
    setShowCreate(false);
    setCreating(false);
    loadPolls();
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-accent-primary" />
          Polls
        </h1>
        {user && (
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Poll
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="card mb-6 space-y-4">
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Ask a question..."
            className="input"
            maxLength={200}
          />
          {newOptions.map((opt, i) => (
            <input
              key={i}
              type="text"
              value={opt}
              onChange={(e) => {
                const updated = [...newOptions];
                updated[i] = e.target.value;
                setNewOptions(updated);
              }}
              placeholder={`Option ${i + 1}`}
              className="input"
            />
          ))}
          {newOptions.length < 6 && (
            <button
              onClick={() => setNewOptions([...newOptions, ''])}
              className="text-xs text-accent-primary hover:underline"
            >
              + Add option
            </button>
          )}
          <div className="flex gap-2">
            <button onClick={createPoll} disabled={creating} className="btn-primary text-sm flex-1">
              {creating ? 'Creating...' : 'Create Poll'}
            </button>
            <button onClick={() => setShowCreate(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingCosmic label="Loading polls..." />
      ) : polls.length === 0 ? (
        <div className="card text-center py-12">
          <BarChart3 className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">No polls yet</p>
          <p className="text-xs text-text-muted mt-1">Create one and ask the community!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map(poll => {
            const hasVoted = !!poll.user_voted_option;
            return (
              <div key={poll.id} className="card">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-text-muted">{poll.creator_name}</span>
                  <span className="text-[10px] text-text-muted">· {new Date(poll.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-3">{poll.question}</h3>

                <div className="space-y-2">
                  {poll.options.map(option => {
                    const pct = poll.total_votes > 0 ? Math.round((option.vote_count / poll.total_votes) * 100) : 0;
                    const isSelected = poll.user_voted_option === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => !hasVoted && vote(poll.id, option.id)}
                        disabled={hasVoted}
                        className={`w-full relative rounded-xl p-3 text-left transition-colors border ${
                          isSelected
                            ? 'border-accent-primary bg-accent-primary/5'
                            : hasVoted
                              ? 'border-border-primary bg-bg-tertiary'
                              : 'border-border-primary hover:border-accent-primary/50 hover:bg-bg-tertiary'
                        }`}
                      >
                        {hasVoted && (
                          <div
                            className="absolute left-0 top-0 bottom-0 rounded-xl bg-accent-primary/10 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        )}
                        <div className="relative flex items-center justify-between">
                          <span className="text-sm text-text-primary flex items-center gap-2">
                            {isSelected && <CheckCircle className="w-4 h-4 text-accent-primary" />}
                            {option.text}
                          </span>
                          {hasVoted && (
                            <span className="text-xs text-text-muted font-medium">{pct}%</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="text-[10px] text-text-muted mt-2">{poll.total_votes} votes</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
