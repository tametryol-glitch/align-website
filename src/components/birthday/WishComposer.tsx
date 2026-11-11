'use client';

// One-tap birthday wishes + a custom message. A wish is a normal comment on the
// birthday post (a DB trigger notifies the celebrant).

import { useState } from 'react';
import { addComment } from '@/lib/feedService';

const QUICK = [
  'Happy birthday! 🎂 Wishing you an amazing year ahead!',
  'Happy birthday! 🎉 So glad you are part of our tribe 💛',
  'Many cosmic blessings on your birthday! ✨🌟',
  'Happy birthday! May this solar return bring you everything you are dreaming of 🌙',
];
const BELATED = [
  'Belated happy birthday! 🎂 Hope your month has been amazing!',
  'Belated happy birthday! 🎉 So glad you are part of our tribe 💛',
  'Belated cosmic blessings on your birthday! ✨🌟',
  'Belated happy birthday! May your solar return year be magical 🌙',
];

export function WishComposer({
  postId, userId, name, belated, alreadyWished, onSent,
}: {
  postId: string; userId: string; name: string; belated?: boolean; alreadyWished?: boolean; onSent?: () => void;
}) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(!!alreadyWished);
  const [err, setErr] = useState('');
  const first = (name || '').trim().split(/\s+/)[0] || 'them';

  async function send(msg: string) {
    const body = msg.trim();
    if (!body || sending) return;
    setSending(true);
    setErr('');
    try {
      await addComment(postId, userId, body);
      setSent(true);
      setText('');
      onSent?.();
    } catch (e: any) {
      setErr('Could not send your wish. Please try again.');
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <p className="text-sm font-semibold text-center py-2" style={{ color: '#f9a8d4' }}>
        💛 Your wish to {first} was sent. Thank you for being part of the tribe!
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {(belated ? BELATED : QUICK).map((q) => (
          <button
            key={q}
            disabled={sending}
            onClick={() => send(q)}
            className="text-xs px-3 py-1.5 rounded-full bg-accent-muted text-accent-primary hover:opacity-80 text-left"
          >
            {q}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send(text); }}
          maxLength={500}
          placeholder={`Write your own wish for ${first}...`}
          className="flex-1 min-w-0 text-sm px-3 py-2 rounded-xl bg-bg-tertiary border border-border-primary outline-none focus:border-accent-primary"
        />
        <button
          disabled={sending || !text.trim()}
          onClick={() => send(text)}
          className="px-4 py-2 rounded-xl bg-gradient-accent text-white text-sm font-semibold disabled:opacity-50"
        >
          Send
        </button>
      </div>
      {err && <p className="text-xs text-red-400 mt-1">{err}</p>}
    </div>
  );
}
