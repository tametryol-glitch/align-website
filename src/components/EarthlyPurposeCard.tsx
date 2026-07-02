'use client';

/**
 * "Your Earthly Purpose" — dashboard card (web).
 *
 * Fetches the user's natal chart, derives Earth (Sun + 180°), and shows the
 * grounded earthly-purpose reading. Deterministic for now (the same engine the
 * app uses when AI is off); cached in localStorage so it loads instantly.
 * Renders nothing until there's birth data with a Sun, so it never blocks a new
 * user.
 */

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { resolveTimezoneOffset } from '@/lib/timezoneOffset';
import {
  deriveEarthlyPurpose,
  deterministicEarthlyPurpose,
  buildEarthlyPurposeSystemPrompt,
  buildEarthlyPurposeUserPrompt,
} from '@/lib/engines/earthlyPurpose';

const TEASER = 260;

export function EarthlyPurposeCard({ profile }: { profile: any }) {
  const [text, setText] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  const hasBirth = !!(profile?.birth_date && profile?.latitude && profile?.longitude);

  useEffect(() => {
    if (!hasBirth) { setLoading(false); return; }
    let cancelled = false;
    const cacheKey = `hz_ep_web_v4:${profile.birth_date}:${profile.latitude}:${profile.longitude}`;

    (async () => {
      try {
        const cached = typeof window !== 'undefined' ? window.localStorage.getItem(cacheKey) : null;
        if (cached) { if (!cancelled) { setText(cached); setLoading(false); } return; }

        const time = profile.birth_time || '12:00';
        const { offset, label } = resolveTimezoneOffset(profile.timezone, profile.longitude, profile.birth_date, time, profile.latitude);
        const raw = await api.getNatalChart({
          name: '', date: profile.birth_date, time,
          latitude: profile.latitude, longitude: profile.longitude,
          timezone: label, tz_offset: offset, location: profile.birth_location || '',
          house_system: 'Whole Sign',
        });
        const ctx = deriveEarthlyPurpose(raw);
        if (!ctx) { if (!cancelled) setLoading(false); return; }

        // Try the AI reading (paid users); stream it. Free users 429 → fall back.
        let reading = '';
        try {
          const system = buildEarthlyPurposeSystemPrompt(ctx);
          const user = buildEarthlyPurposeUserPrompt(ctx);
          let full = '';
          await new Promise<void>((resolve, reject) => {
            api.streamAIInterpretation(
              { type: 'astrologer_chat', chart_data_text: system, messages: [{ role: 'user', content: user }], language: 'en' },
              (chunk: string) => { full += chunk; if (!cancelled) setText(full); },
              () => resolve(),
            ).catch(reject);
          });
          if (full.trim()) reading = full;
        } catch {
          /* fall through to deterministic */
        }
        if (!reading) reading = deterministicEarthlyPurpose(ctx);
        if (cancelled) return;
        setText(reading);
        try { window.localStorage.setItem(cacheKey, reading); } catch { /* ignore */ }
      } catch {
        /* leave empty → card hides */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [hasBirth, profile?.birth_date, profile?.latitude, profile?.longitude]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!hasBirth) return null;
  if (!loading && !text) return null;

  const isLong = text.length > TEASER;
  const shown = expanded || !isLong ? text : text.slice(0, TEASER).trimEnd() + '…';

  return (
    <div
      className="rounded-2xl p-6 border border-gold-primary/30 mb-4"
      style={{ background: 'linear-gradient(135deg, rgba(245,166,35,0.12), rgba(155,111,246,0.06))' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl text-gold-primary">⊕</span>
        <h3 className="text-lg font-display font-semibold text-text-primary">Your Earthly Purpose</h3>
      </div>
      {loading && !text ? (
        <p className="text-[15px] text-text-secondary">Reading the purpose hidden opposite your Sun…</p>
      ) : (
        <>
          <p className="text-[15px] text-text-secondary leading-relaxed whitespace-pre-line">{shown}</p>
          {isLong && (
            <button onClick={() => setExpanded((v) => !v)} className="mt-2 text-sm font-medium text-accent-secondary hover:text-accent-primary">
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
