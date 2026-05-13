'use client';

import { Check } from 'lucide-react';
import type { Message } from '@/lib/messagingService';

// ── Types ──────────────────────────────────────────────────────────

interface PollOption {
  text: string;
  votes: string[];
}

interface PollMetadata {
  question: string;
  options: PollOption[];
}

interface PollBubbleProps {
  message: Message;
  isMine: boolean;
  currentUserId: string;
  onVote: (messageId: string, optionIndex: number) => void;
}

// ── Component ──────────────────────────────────────────────────────

export function PollBubble({ message, isMine, currentUserId, onVote }: PollBubbleProps) {
  const meta = message.metadata as PollMetadata | null | undefined;

  if (!meta?.question || !Array.isArray(meta.options) || meta.options.length === 0) return null;

  const { question, options } = meta;
  const totalVotes = options.reduce((sum, opt) => sum + (opt.votes?.length ?? 0), 0);
  const userVotedIndex = options.findIndex(
    (opt) => opt.votes?.includes(currentUserId)
  );
  const hasVoted = userVotedIndex >= 0;

  const textColor = isMine ? 'text-white' : 'text-text-primary';
  const mutedColor = isMine ? 'text-white/60' : 'text-text-muted';

  return (
    <div className="min-w-[220px] max-w-full">
      {/* Question */}
      <p className={`text-sm font-semibold mb-2.5 ${textColor}`}>{question}</p>

      {/* Options */}
      <div className="flex flex-col gap-1.5">
        {options.map((option, idx) => {
          const voteCount = option.votes?.length ?? 0;
          const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const isUserChoice = idx === userVotedIndex;

          if (hasVoted) {
            // ── Results view ──
            return (
              <div key={idx} className="relative rounded-lg overflow-hidden">
                {/* Background bar */}
                <div
                  className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                    isUserChoice
                      ? isMine ? 'bg-white/25' : 'bg-accent-primary/25'
                      : isMine ? 'bg-white/10' : 'bg-accent-primary/10'
                  }`}
                  style={{ width: `${pct}%` }}
                />
                {/* Content */}
                <div className="relative flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    {isUserChoice && (
                      <Check className={`w-3.5 h-3.5 flex-shrink-0 ${
                        isMine ? 'text-white' : 'text-accent-primary'
                      }`} />
                    )}
                    <span className={`text-xs ${textColor} ${isUserChoice ? 'font-medium' : ''}`}>
                      {option.text}
                    </span>
                  </div>
                  <span className={`text-[10px] font-medium ${mutedColor} ml-2 flex-shrink-0`}>
                    {pct}%
                  </span>
                </div>
              </div>
            );
          }

          // ── Voting view ──
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onVote(message.id, idx)}
              className={`w-full text-left rounded-lg px-3 py-2 text-xs transition-colors border ${
                isMine
                  ? 'border-white/20 hover:bg-white/15 text-white'
                  : 'border-border-primary hover:bg-accent-primary/10 text-text-primary'
              }`}
            >
              {option.text}
            </button>
          );
        })}
      </div>

      {/* Total votes */}
      <p className={`text-[10px] mt-2 ${mutedColor}`}>
        {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
      </p>
    </div>
  );
}
