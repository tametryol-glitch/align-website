'use client';

import { useEffect, useState } from 'react';

// In-chat Accept / Decline for The Fifth Circle invitation. Talks to the
// public, token-gated /api/circle/respond endpoint (the token is the secret).

export function CircleInviteButtons({ token }: { token: string }) {
  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/circle/respond?token=${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStatus(d.status))
      .catch(() => {});
  }, [token]);

  async function respond(response: 'accept' | 'decline') {
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/circle/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, response }),
      });
      const d = await r.json();
      if (r.ok) setStatus(d.status);
      else setError(d.error || 'Something went wrong.');
    } catch {
      setError('Network error.');
    }
    setBusy(false);
  }

  if (status === 'accepted' || status === 'declined') {
    return (
      <div className="mt-3 text-center">
        <p className="text-sm font-semibold">{status === 'accepted' ? '✅ You accepted' : '❌ You declined'}</p>
        <button
          onClick={() => respond(status === 'accepted' ? 'decline' : 'accept')}
          disabled={busy}
          className="text-[11px] underline opacity-70 mt-1"
        >
          {status === 'accepted' ? 'Change to decline' : 'Change to accept'}
        </button>
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex gap-2">
        <button
          onClick={() => respond('accept')}
          disabled={busy || status === null}
          className="flex-1 py-2.5 rounded-full text-sm font-bold disabled:opacity-60"
          style={{ background: '#d9b36a', color: '#1a1305' }}
        >
          Accept
        </button>
        <button
          onClick={() => respond('decline')}
          disabled={busy || status === null}
          className="flex-1 py-2.5 rounded-full text-sm font-semibold border disabled:opacity-60"
          style={{ borderColor: '#d9b36a' }}
        >
          Decline
        </button>
      </div>
      {error && <p className="text-xs text-red-400 mt-1 text-center">{error}</p>}
    </div>
  );
}
