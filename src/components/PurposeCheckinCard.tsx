'use client';

/**
 * Purpose Check-In — the biweekly conversation (web).
 *
 * Renders NOTHING unless a check-in is actually due, so the dashboard is never
 * cluttered by a reminder nobody asked for. When it is due it raises exactly one
 * purpose point, quotes the reader's own words from last time, and gives them an
 * honest way out.
 *
 * The one interaction rule worth protecting: confirming costs one specific
 * follow-up question. If "I've been on this" dismissed the card, readers would
 * learn the magic word within three cycles and the feature would look healthy in
 * the metrics while being dead.
 *
 * @see lib/engines/purposeCheckin.ts for the selection and state rules.
 */

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { resolveTimezoneOffset } from '@/lib/timezoneOffset';
import { deriveEarthlyPurpose } from '@/lib/engines/earthlyPurpose';
import { deriveSoulPurpose } from '@/lib/engines/soulPurpose';
import { buildPurposePoints, reconcilePurposePoints, type PurposePoint } from '@/lib/engines/purposePoints';
import {
  chartVersion,
  composeOpener,
  inferRegister,
  isDue,
  nextTrack,
  selectNextPoint,
  type CheckinOpener,
  type CheckinOutcome,
  type PurposeKind,
  type Register,
  type TimeConfidence,
} from '@/lib/engines/purposeCheckin';
import {
  applyOpenerVoice,
  buildOpenerVoicePrompt,
  parseOpenerVoice,
} from '@/lib/engines/purposeCheckinVoice';
import {
  loadPointStates,
  loadPrefs,
  openCheckin,
  recordResponse,
  saveTimeConfidence,
  syncPointStates,
} from '@/lib/purposeCheckinService';

type Phase = 'idle' | 'asking' | 'following-up' | 'time-question' | 'done';

/** Cache the purpose cards already wrote, so the bot quotes the same wording. */
function cachedReading(kind: PurposeKind, profile: any): string | null {
  if (typeof window === 'undefined') return null;
  const prefix = kind === 'earthly' ? 'hz_ep_web_v5' : 'hz_sp_web_v4';
  try {
    return window.localStorage.getItem(`${prefix}:${profile.birth_date}:${profile.latitude}:${profile.longitude}`);
  } catch {
    return null;
  }
}

/**
 * What to assume before we have asked. A recorded time is treated as
 * approximate rather than exact — it only nudges house points down, and
 * over-trusting an unverified time is the more expensive mistake.
 */
function resolveConfidence(profile: any): TimeConfidence {
  if (profile?.time_confidence) return profile.time_confidence as TimeConfidence;
  if (!profile?.birth_time || profile?.birth_time_unknown) return 'unknown';
  return 'approximate';
}

export function PurposeCheckinCard({ profile }: { profile: any }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [opener, setOpener] = useState<CheckinOpener | null>(null);
  const [kind, setKind] = useState<PurposeKind>('earthly');
  const [checkinId, setCheckinId] = useState<string | null>(null);
  const [register, setRegister] = useState<Register>('collaborative');
  const [subject, setSubject] = useState<PurposePoint | null>(null);
  const [chosenKey, setChosenKey] = useState<string | null>(null);
  const [firstEver, setFirstEver] = useState(false);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const userId = profile?.id as string | undefined;
  const hasBirth = !!(profile?.birth_date && profile?.latitude && profile?.longitude);

  useEffect(() => {
    if (!userId || !hasBirth) return;
    let cancelled = false;

    (async () => {
      try {
        const prefs = await loadPrefs(userId);
        if (!isDue(prefs, new Date())) return;

        const track = nextTrack(prefs.lastKind);
        const time = profile.birth_time || '12:00';
        const { offset, label } = resolveTimezoneOffset(
          profile.timezone, profile.longitude, profile.birth_date, time, profile.latitude,
        );
        const raw = await api.getNatalChart({
          name: '', date: profile.birth_date, time,
          latitude: profile.latitude, longitude: profile.longitude,
          timezone: label, tz_offset: offset, location: profile.birth_location || '',
          house_system: 'Whole Sign',
        });

        const ctx = track === 'earthly' ? deriveEarthlyPurpose(raw) : deriveSoulPurpose(raw);
        if (!ctx || cancelled) return;

        // Prefer the wording the reader actually saw on their purpose card.
        const canonical = buildPurposePoints(ctx.placement, track);
        const cached = cachedReading(track, profile);
        const points = cached ? reconcilePurposePoints(cached, track, canonical).points : canonical;

        const version = chartVersion({
          birthDate: profile.birth_date,
          birthTime: profile.birth_time,
          latitude: profile.latitude,
          longitude: profile.longitude,
        });
        const states = await syncPointStates(userId, track, points, version);
        if (cancelled) return;

        const selection = selectNextPoint({
          points,
          states,
          timeConfidence: resolveConfidence(profile),
          now: new Date(),
          cadenceDays: prefs.cadenceDays,
        });
        if (!selection || cancelled) return;

        const reg = prefs.register ?? inferRegister({
          sun: profile.sun_sign, moon: profile.moon_sign, ascendant: profile.rising_sign,
        });
        const id = await openCheckin(userId, track, selection.point.key);
        // Without a check-in row nothing would be remembered — better to stay
        // silent than to hold a conversation we cannot save.
        if (!id || cancelled) return;

        setFirstEver(prefs.lastKind === null);
        setKind(track);
        setRegister(reg);
        setCheckinId(id);
        setSubject(selection.point);
        const lastNote = selection.state?.userNote ?? null;
        const isFirstEver = prefs.lastKind === null;
        const built = composeOpener({ register: reg, selection, lastNote, isFirstEver });
        setOpener(built);
        setPhase('asking');

        // Warm the wording afterwards. The deterministic opener is already on
        // screen, so latency costs nothing and a failure simply leaves it there.
        try {
          const { system, user } = buildOpenerVoicePrompt({
            register: reg,
            kind: track,
            pointText: built.point.text,
            lastNote,
            isFirstEver,
            followingUp: selection.state?.status === 'live' || selection.state?.status === 'lived',
          });
          let full = '';
          await new Promise<void>((resolve, reject) => {
            api.streamAIInterpretation(
              { type: 'astrologer_chat', chart_data_text: system, messages: [{ role: 'user', content: user }], language: 'en' },
              (chunk: string) => { full += chunk; },
              () => resolve(),
            ).catch(reject);
          });
          if (cancelled) return;
          setOpener((prev) => (prev ? applyOpenerVoice(prev, parseOpenerVoice(full), lastNote) : prev));
        } catch {
          /* the deterministic opener stands */
        }
      } catch {
        /* a failed check-in stays invisible rather than showing a broken card */
      }
    })();

    return () => { cancelled = true; };
  }, [userId, hasBirth, profile]);

  const save = useCallback(async (outcome: CheckinOutcome, message: string | null) => {
    if (!userId || !checkinId || !subject) return;
    setSaving(true);
    setError('');
    const ok = await recordResponse({
      userId, checkinId, kind,
      ledPointKey: opener?.point.key ?? subject.key,
      chosenPointKey: chosenKey,
      outcome, message, register,
    });
    setSaving(false);
    if (!ok) { setError('That did not save — mind trying once more?'); return; }

    // Asked on the first check-in even when the point is not time-sensitive:
    // an unverified time demotes house points, so gating the question on one
    // appearing would mean it rarely gets asked and they stay demoted forever.
    const needsTimeQuestion = !profile?.time_confidence && (subject.timeSensitive || firstEver);
    setPhase(needsTimeQuestion ? 'time-question' : 'done');
  }, [userId, checkinId, subject, kind, opener, chosenKey, register, profile, firstEver]);

  const answerTime = useCallback(async (value: TimeConfidence) => {
    if (userId) await saveTimeConfidence(userId, value);
    setPhase('done');
  }, [userId]);

  if (!hasBirth || phase === 'idle' || !opener || !subject) return null;

  return (
    <div
      className="rounded-2xl p-6 border border-gold-primary/30 mb-4"
      style={{ background: 'linear-gradient(135deg, rgba(155,111,246,0.12), rgba(245,166,35,0.06))' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl text-gold-primary">✦</span>
        <h3 className="text-lg font-display font-semibold text-text-primary">
          {kind === 'soul' ? 'Your soul purpose — checking in' : 'Your earthly purpose — checking in'}
        </h3>
      </div>

      {phase === 'asking' && (
        <>
          {opener.recall && (
            <p className="text-[15px] text-text-secondary italic mb-3">{opener.recall}</p>
          )}
          <p className="text-[15px] text-text-secondary leading-relaxed mb-3">{opener.lead}</p>
          <p className="text-[15px] text-text-primary leading-relaxed font-medium mb-4">{subject.text}</p>

          <div className="flex flex-wrap gap-2 mb-3">
            {opener.replies.map((r) => (
              <button
                key={r.outcome}
                disabled={saving}
                onClick={() => (r.outcome === 'confirmed' ? setPhase('following-up') : save(r.outcome, null))}
                className="px-4 py-2 rounded-full text-sm font-medium border border-gold-primary/40 text-text-primary hover:bg-gold-primary/10 disabled:opacity-50"
              >
                {r.label}
              </button>
            ))}
          </div>

          {opener.alternatives.length > 0 && (
            <div className="pt-3 border-t border-gold-primary/20">
              <p className="text-xs text-text-secondary mb-2">Or is one of these the live one?</p>
              <div className="flex flex-col gap-2">
                {opener.alternatives.map((alt) => (
                  <button
                    key={alt.key}
                    disabled={saving}
                    onClick={() => { setSubject(alt); setChosenKey(alt.key); setPhase('following-up'); }}
                    className="text-left text-sm text-text-secondary hover:text-text-primary"
                  >
                    → {alt.text}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {phase === 'following-up' && (
        <>
          <p className="text-[15px] text-text-primary leading-relaxed font-medium mb-2">{subject.text}</p>
          <p className="text-[15px] text-text-secondary leading-relaxed mb-3">
            Good. What did that actually look like — the real version, not the tidy one?
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="A sentence is plenty."
            className="w-full rounded-xl p-3 text-[15px] bg-black/20 border border-gold-primary/30 text-text-primary placeholder:text-text-secondary/60"
          />
          <div className="flex gap-2 mt-3">
            <button
              disabled={saving || !note.trim()}
              onClick={() => save('confirmed', note)}
              className="px-4 py-2 rounded-full text-sm font-medium bg-gold-primary/20 border border-gold-primary/40 text-text-primary hover:bg-gold-primary/30 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'That is it'}
            </button>
            <button
              disabled={saving}
              onClick={() => save('confirmed', null)}
              className="px-4 py-2 rounded-full text-sm text-text-secondary hover:text-text-primary disabled:opacity-50"
            >
              Skip
            </button>
          </div>
        </>
      )}

      {phase === 'time-question' && (
        <>
          <p className="text-[15px] text-text-secondary leading-relaxed mb-3">
            One thing that would sharpen this — is your birth time exact, or the family-story version?
            No wrong answer; it just changes which parts I lean on.
          </p>
          <div className="flex flex-wrap gap-2">
            {([
              ['exact', 'Exact — from a record'],
              ['approximate', 'Roughly — I was told'],
              ['unknown', "I don't know it"],
            ] as [TimeConfidence, string][]).map(([value, label]) => (
              <button
                key={value}
                onClick={() => answerTime(value)}
                className="px-4 py-2 rounded-full text-sm font-medium border border-gold-primary/40 text-text-primary hover:bg-gold-primary/10"
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      {phase === 'done' && (
        <p className="text-[15px] text-text-secondary leading-relaxed">
          Noted — I will pick this back up in a couple of weeks. These are not one-and-done; they are the
          things worth returning to.
        </p>
      )}

      {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
    </div>
  );
}
