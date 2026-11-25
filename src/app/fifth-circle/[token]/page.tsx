'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { CIRCLE_BLOCKS, CIRCLE_SIGNOFF } from '@/lib/fifthCircle';

type Status = 'pending' | 'accepted' | 'declined';

const GOLD = '#d9b36a';
const CREAM = '#f3ead2';

export default function FifthCirclePage() {
  const { token } = useParams<{ token: string }>();
  const search = useSearchParams();
  const preselect = search.get('r'); // 'accept' | 'decline' from the chat link (never auto-submits)
  const [name, setName] = useState('');
  const [status, setStatus] = useState<Status | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/circle/respond?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        if (!r.ok) { setNotFound(true); return; }
        const d = await r.json();
        setName(d.name || '');
        setStatus(d.status);
      })
      .catch(() => setNotFound(true));
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
      if (!r.ok) setError(d.error || 'Something went wrong. Please try again.');
      else setStatus(d.status);
    } catch {
      setError('Network error. Please try again.');
    }
    setBusy(false);
  }

  const first = name.split(' ')[0];

  return (
    <div style={{ minHeight: '100vh', background: '#030617', color: CREAM }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px 80px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/fifth-circle/logo.jpg" alt="The Fifth Circle" style={{ width: '100%', borderRadius: 12 }} />

        {notFound ? (
          <p style={{ textAlign: 'center', marginTop: 48, opacity: 0.8 }}>This invitation link is not valid.</p>
        ) : (
          <>
            <p style={{ textAlign: 'center', letterSpacing: 4, fontSize: 12, color: GOLD, margin: '28px 0 8px' }}>
              BY PRIVATE INVITATION ONLY
            </p>
            {first && (
              <p style={{ textAlign: 'center', fontSize: 22, margin: '0 0 28px', fontFamily: 'Georgia, serif' }}>
                {first}, you have been invited.
              </p>
            )}

            <div style={{ fontFamily: 'Georgia, serif', fontSize: 17, lineHeight: 1.75 }}>
              {CIRCLE_BLOCKS.map((b, i) => {
                if (b.kind === 'h')
                  return (
                    <h2 key={i} style={{ color: GOLD, fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', margin: '44px 0 14px', textAlign: 'center' }}>
                      {b.text}
                    </h2>
                  );
                if (b.kind === 'list')
                  return (
                    <ul key={i} style={{ margin: '0 0 22px', paddingLeft: 22 }}>
                      {b.items.map((it) => (
                        <li key={it} style={{ marginBottom: 8 }}>{it}</li>
                      ))}
                    </ul>
                  );
                if (b.kind === 'quote')
                  return (
                    <blockquote key={i} style={{ margin: '26px 0', padding: '4px 0 4px 18px', borderLeft: `2px solid ${GOLD}`, fontStyle: 'italic', color: GOLD }}>
                      {b.text}
                    </blockquote>
                  );
                const [head, ...rest] = b.text.split('\n');
                return (
                  <p key={i} style={{ margin: '0 0 22px' }}>
                    {rest.length ? (<><strong style={{ color: GOLD }}>{head}</strong><br />{rest.join('\n')}</>) : head}
                  </p>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', margin: '48px 0 40px', fontFamily: 'Georgia, serif' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fifth-circle/emblem.jpg" alt="" style={{ width: 150, height: 150, borderRadius: '50%', marginBottom: 20 }} />
              {CIRCLE_SIGNOFF.map((l, i) => (
                <div key={l} style={{ color: i === 0 || i === 3 ? GOLD : CREAM, letterSpacing: i === 0 ? 4 : 0, fontStyle: i === 1 || i === 2 ? 'italic' : 'normal', marginBottom: 4 }}>{l}</div>
              ))}
            </div>

            <div style={{ border: `1px solid ${GOLD}55`, borderRadius: 16, padding: 24, textAlign: 'center', background: '#0a1030' }}>
              {status === 'pending' || status === null ? (
                <>
                  <p style={{ margin: '0 0 6px', fontSize: 18, fontFamily: 'Georgia, serif' }}>Your response</p>
                  <p style={{ margin: '0 0 20px', fontSize: 14, opacity: 0.75 }}>
                    {preselect === 'accept' ? 'Tap Accept to confirm your place as a founding member.' : preselect === 'decline' ? 'Tap Decline to confirm you are passing on this invitation.' : 'Membership is entirely voluntary.'}
                  </p>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => respond('accept')}
                      disabled={busy || status === null}
                      style={{ padding: '14px 32px', borderRadius: 999, border: 'none', background: GOLD, color: '#1a1305', fontWeight: 700, fontSize: 16, opacity: preselect === 'decline' ? 0.6 : 1 }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => respond('decline')}
                      disabled={busy || status === null}
                      style={{ padding: '14px 32px', borderRadius: 999, border: `1px solid ${GOLD}`, background: 'transparent', color: CREAM, fontWeight: 600, fontSize: 16, opacity: preselect === 'accept' ? 0.6 : 1 }}
                    >
                      Decline
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ margin: '0 0 8px', fontSize: 20, fontFamily: 'Georgia, serif', color: GOLD }}>
                    {status === 'accepted' ? 'You have accepted.' : 'You have declined.'}
                  </p>
                  <p style={{ margin: '0 0 16px', fontSize: 15, opacity: 0.85 }}>
                    {status === 'accepted'
                      ? 'Welcome to The Fifth Circle. The founder has been notified and will be in touch with next steps.'
                      : 'Thank you for considering it. The founder has been notified. No obligation, ever.'}
                  </p>
                  <button
                    onClick={() => respond(status === 'accepted' ? 'decline' : 'accept')}
                    disabled={busy}
                    style={{ background: 'none', border: 'none', color: CREAM, opacity: 0.6, textDecoration: 'underline', fontSize: 13 }}
                  >
                    {status === 'accepted' ? 'Changed your mind? Decline instead' : 'Changed your mind? Accept instead'}
                  </button>
                </>
              )}
              {error && <p style={{ color: '#ff8a8a', marginTop: 12, fontSize: 14 }}>{error}</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
