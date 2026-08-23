'use client';

/**
 * /b/[code] — a shared Build-A-Match build.
 *
 * "MY BUILD-A-MATCH — Moon Pisces, Venus Scorpio. How close are you?"
 *
 * ─── Why this page is public ───────────────────────────────────────
 * It is the growth surface: someone shares their type, a stranger opens
 * it and finds out whether they match. Gating it behind login would
 * defeat the entire purpose of the share.
 *
 * It is safe to be public because the build travels IN the URL. There is
 * no database read, no user id, and nothing private in the payload — only
 * bodies, signs and priorities. See buildShareCode.ts.
 *
 * ─── Two audiences ─────────────────────────────────────────────────
 * Signed in  → we have their indexed chart, so we can answer the question
 *              honestly: here is how close YOU are.
 * Signed out → they see the build and an invitation to find out.
 */

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { createClient } from '@/lib/supabase';
import {
  decodeBuild, describeBuild, scoreAgainstSharedBuild,
} from '@/lib/buildAMatch/buildShareCode';
import { SIGN_EMOJIS, PLANET_EMOJIS } from '@/lib/cosmicIndexService';

export default function SharedBuildPage() {
  const params = useParams();
  const code = (params?.code as string) || '';
  const { user, isLoading } = useAuthStore();

  // Untrusted input: decodeBuild returns [] for anything malformed rather
  // than throwing into the render.
  const criteria = useMemo(() => decodeBuild(code), [code]);

  const [myPlacements, setMyPlacements] = useState<Record<string, string> | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!user?.id || criteria.length === 0) return;
    let cancelled = false;
    setChecking(true);
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('planet_placement_index')
          .select('planet_name, sign_name')
          .eq('user_id', user.id);
        if (cancelled) return;
        const map: Record<string, string> = {};
        for (const row of data || []) map[row.planet_name] = row.sign_name;
        setMyPlacements(map);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, criteria.length]);

  const result = useMemo(
    () => (myPlacements ? scoreAgainstSharedBuild(criteria, myPlacements) : null),
    [criteria, myPlacements],
  );

  // ─── A link that decodes to nothing ───
  if (criteria.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-3">✧</p>
        <h1 className="text-xl font-display font-bold text-text-primary">
          This build link isn&apos;t readable
        </h1>
        <p className="text-text-tertiary text-sm mt-2">
          It may have been cut short when it was copied. Ask for the full link.
        </p>
        <Link href="/build-a-match" className="btn-primary inline-block mt-6 text-sm">
          Build your own
        </Link>
      </div>
    );
  }

  const positive = criteria.filter(c => c.priority !== 'avoid');
  const avoided = criteria.filter(c => c.priority === 'avoid');

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <header className="text-center mb-8">
        <p className="text-[11px] font-bold tracking-widest text-text-secondary">
          MY BUILD-A-MATCH
        </p>
        <h1 className="text-2xl font-display font-bold text-text-primary mt-1">
          {describeBuild(criteria)}
        </h1>
        <p className="text-accent-primary text-sm font-medium mt-2">How close are you?</p>
      </header>

      {/* The build itself — signs only, nothing private */}
      <section className="card p-5 mb-6">
        <div className="space-y-2">
          {positive.map(c => {
            const hit = result?.hit.some(h => h.body === c.body && h.sign === c.sign);
            return (
              <div key={`${c.body}-${c.sign}`} className="flex items-center justify-between">
                <span className="text-text-primary text-sm">
                  {PLANET_EMOJIS[c.body] || '•'} {c.body}
                  {c.priority === 'must' && (
                    <span className="text-[10px] font-bold text-accent-primary ml-2">MUST</span>
                  )}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-text-secondary text-sm">
                    {SIGN_EMOJIS[c.sign] || ''} {c.sign}
                  </span>
                  {result && (
                    <span className={hit ? 'text-emerald-400' : 'text-text-muted'}>
                      {hit ? '✓' : '✕'}
                    </span>
                  )}
                </span>
              </div>
            );
          })}

          {avoided.length > 0 && (
            <div className="pt-2 mt-2 border-t border-border-primary">
              {avoided.map(c => (
                <div key={`avoid-${c.body}`} className="flex items-center justify-between">
                  <span className="text-text-muted text-sm">
                    Not {c.sign} {c.body}
                  </span>
                  {result && (
                    <span className={
                      result.hit.some(h => h.body === c.body) ? 'text-emerald-400' : 'text-text-muted'
                    }>
                      {result.hit.some(h => h.body === c.body) ? '✓' : '✕'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── The answer, for someone we can actually answer for ─── */}
      {isLoading || checking ? (
        <div className="card p-6 text-center">
          <p className="text-text-muted text-sm">Checking your chart…</p>
        </div>
      ) : result ? (
        <section className="card p-6 text-center border-accent-primary">
          <p className="text-5xl font-extrabold text-accent-primary">{result.percent}%</p>
          <p className="text-[11px] font-bold tracking-widest text-text-secondary mt-1">
            OF THIS BUILD
          </p>
          <p className="text-sm text-text-muted mt-3 leading-relaxed">
            {result.percent === 100
              ? 'You are exactly what they described.'
              : result.percent >= 60
                ? `You match ${result.hit.length} of ${criteria.length}. Close.`
                : result.percent > 0
                  ? `You match ${result.hit.length} of ${criteria.length}. Not their type on paper — which is not the same as not their match.`
                  : 'Nothing here matches. Your charts may still say otherwise.'}
          </p>
          <Link href="/build-a-match" className="btn-primary inline-block mt-5 text-sm">
            Build your own
          </Link>
        </section>
      ) : user ? (
        // Signed in but nothing indexed yet.
        <section className="card p-6 text-center">
          <p className="text-text-primary font-semibold">We don&apos;t have your chart yet</p>
          <p className="text-text-tertiary text-sm mt-1 leading-relaxed">
            Add your birth details and we can tell you exactly how close you are.
          </p>
          <Link href="/profile/edit" className="btn-primary inline-block mt-4 text-sm">
            Add my birth details
          </Link>
        </section>
      ) : (
        <section className="card p-6 text-center">
          <p className="text-text-primary font-semibold">Find out how close you are</p>
          <p className="text-text-tertiary text-sm mt-1 leading-relaxed">
            Align works out where your chart lands against theirs — and shows you the people
            who actually match what you want.
          </p>
          <Link href="/auth/signup" className="btn-primary inline-block mt-4 text-sm">
            Check my chart
          </Link>
          <p className="text-[11px] text-text-muted mt-3">
            Nothing about the person who shared this is revealed here — only what they said
            they want.
          </p>
        </section>
      )}
    </div>
  );
}
