'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { Sparkles, Clock, Eye, ShieldAlert, ArrowRight, Lock } from 'lucide-react';

const CATEGORIES = [
  { key: 'relationship', labelKey: 'divineTiming.categories.relationship', house: 7 },
  { key: 'money', labelKey: 'divineTiming.categories.money', house: 2 },
  { key: 'career', labelKey: 'divineTiming.categories.career', house: 10 },
  { key: 'move', labelKey: 'divineTiming.categories.move', house: 4 },
  { key: 'truth', labelKey: 'divineTiming.categories.truth', house: 7 },
  { key: 'lost_object', labelKey: 'divineTiming.categories.lostObject', house: 2 },
  { key: 'timing', labelKey: 'divineTiming.categories.timing', house: 1 },
];

const VERDICT_COLOR: Record<string, string> = {
  YES: 'text-green-400',
  NO: 'text-red-400',
  DELAYED: 'text-amber-400',
  BLOCKED: 'text-red-400',
  HIDDEN: 'text-purple-300',
  CONDITIONAL: 'text-amber-300',
  'NO CLEAR OUTCOME': 'text-text-tertiary',
  'ASK AGAIN LATER': 'text-text-tertiary',
};

type Phase = 'ask' | 'casting' | 'verdict';

export default function DivineTimingPage() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const [phase, setPhase] = useState<Phase>('ask');
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState<{ key: string; label: string; house: number } | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [narrative, setNarrative] = useState('');
  const [narrating, setNarrating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-detect category/house as the user types (debounced, spec §7).
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (question.trim().length < 6) { setCategory(null); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const det = await api.detectDivineHouse(question);
        setCategory({ key: det.category, label: det.label, house: det.house });
      } catch { /* leave as-is */ }
    }, 500);
  }, [question]);

  async function cast() {
    if (!question.trim()) return;
    setPhase('casting');
    setError('');
    setNarrative('');
    setResult(null);

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const tz_offset = -now.getTimezoneOffset() / 60;

    try {
      const r = await api.askDivineTiming({
        question,
        category: category?.key,
        house: category?.house,
        date, time,
        latitude: profile?.latitude ?? 40.71,
        longitude: profile?.longitude ?? -74.01,
        tz_offset,
      });
      // brief ceremony beat
      setTimeout(() => { setResult(r); setPhase('verdict'); }, 1100);
    } catch (e: any) {
      setError(e?.message || t('divineTiming.castFailed'));
      setPhase('ask');
    }
  }

  async function revealFull() {
    if (!result) return;
    setNarrating(true);
    setNarrative('');
    try {
      await api.streamDivineNarration(
        { judgment: result, question },
        (chunk) => setNarrative((p) => p + chunk),
        () => setNarrating(false),
      );
    } catch (e: any) {
      setNarrative('');
      setNarrating(false);
      setError(t('divineTiming.narrationFailed'));
    }
  }

  function reset() {
    setPhase('ask'); setResult(null); setNarrative(''); setError('');
  }

  const refused = result?.refused;
  const blocked = result?.blocked;
  const locked = result?.locked;

  return (
    <div className="max-w-2xl mx-auto pb-16">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-display font-bold text-text-primary flex items-center justify-center gap-2">
          <Sparkles className="w-7 h-7 text-accent-primary" /> {t('divineTiming.title')}
        </h1>
        <p className="text-sm text-text-tertiary mt-1">{t('divineTiming.subtitle')}</p>
      </div>

      {/* ── ASK ── */}
      {phase === 'ask' && (
        <div className="card space-y-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t('divineTiming.questionPlaceholder')}
            rows={3}
            className="input w-full resize-none"
            maxLength={200}
          />
          <div>
            <p className="text-[11px] uppercase tracking-widest text-text-muted mb-2">{t('divineTiming.questionType')}</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCategory({ key: c.key, label: t(c.labelKey), house: c.house })}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    category?.key === c.key
                      ? 'border-accent-primary text-accent-primary bg-accent-primary/10'
                      : 'border-border-primary text-text-secondary hover:border-accent-primary/40'
                  }`}
                >
                  {t(c.labelKey)}
                </button>
              ))}
            </div>
            {category && (
              <p className="text-[11px] text-text-muted mt-2">
                {t('divineTiming.readingAs')} <span className="text-text-secondary">{category.label}</span> {t('divineTiming.houseSuffix', { house: category.house })}
              </p>
            )}
          </div>
          <button
            onClick={cast}
            disabled={!question.trim()}
            className="btn-primary w-full text-base py-3 flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Sparkles className="w-4 h-4" /> {t('divineTiming.castButton')}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <p className="text-[11px] text-text-muted text-center">
            {t('divineTiming.castHint')}
          </p>
        </div>
      )}

      {/* ── CASTING ── */}
      {phase === 'casting' && (
        <div className="card text-center py-16">
          <div className="animate-pulse">
            <Sparkles className="w-12 h-12 text-accent-primary mx-auto mb-4" />
          </div>
          <LoadingCosmic label={t('divineTiming.castingLabel')} />
        </div>
      )}

      {/* ── VERDICT ── */}
      {phase === 'verdict' && result && (
        <div className="space-y-4">
          {refused ? (
            <div className="card text-center py-10">
              <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto mb-3" />
              <p className="text-text-secondary">{result.message}</p>
            </div>
          ) : blocked ? (
            <div className="card text-center py-10">
              <Clock className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
              <p className="text-text-secondary">{result.message}</p>
            </div>
          ) : (
            <>
              {/* Verdict headline */}
              <div className="card text-center bg-gradient-cosmic border-accent-muted">
                <p className="text-[11px] uppercase tracking-widest text-text-muted mb-1">{t('divineTiming.theVerdict')}</p>
                <p className={`text-4xl font-display font-bold ${VERDICT_COLOR[result.verdict] || 'text-text-primary'}`}>
                  {result.verdict}
                </p>
                <p className="text-sm text-text-tertiary mt-2">{t('divineTiming.confidence', { percent: result.confidence })}</p>
                {result.timing_window && (
                  <p className="text-sm text-accent-primary mt-1">{t('divineTiming.timingWindow', { window: result.timing_window })}</p>
                )}
              </div>

              {/* Main reason (free + premium) */}
              <div className="card">
                <p className="text-sm text-text-secondary leading-relaxed">{result.main_reason}</p>
              </div>

              {/* Premium fields */}
              {!locked ? (
                <>
                  {result.best_time_to_act && (
                    <InfoRow icon={Clock} title={t('divineTiming.bestTimeToAct')}
                      body={result.best_time_to_act.label} />
                  )}
                  {result.hidden_motive && (
                    <InfoRow icon={Eye} title={t('divineTiming.hiddenMotive')} body={result.hidden_motive} />
                  )}
                  {result.best_action && (
                    <InfoRow icon={ArrowRight} title={t('divineTiming.bestAction')} body={result.best_action} />
                  )}
                  {result.what_needs_to_change && (
                    <InfoRow icon={Sparkles} title={t('divineTiming.whatWouldImprove')} body={result.what_needs_to_change} />
                  )}
                  {result.warnings?.length > 0 && (
                    <div className="card border-amber-500/30">
                      <p className="text-[11px] uppercase tracking-widest text-amber-400 mb-2 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" /> {t('divineTiming.warnings')}
                      </p>
                      <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
                        {result.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* Full AI reading */}
                  {!narrative && !narrating && (
                    <button onClick={revealFull} className="btn-secondary w-full">
                      {t('divineTiming.revealFull')}
                    </button>
                  )}
                  {(narrating || narrative) && (
                    <div className="card">
                      <p className="text-[11px] uppercase tracking-widest text-text-muted mb-2">{t('divineTiming.theReading')}</p>
                      {narrative
                        ? <MarkdownText text={narrative} />
                        : <span className="text-text-muted text-sm">{t('divineTiming.readingChart')}</span>}
                    </div>
                  )}
                </>
              ) : (
                <div className="card bg-gradient-cosmic border-accent-muted text-center">
                  <Lock className="w-6 h-6 text-accent-primary mx-auto mb-2" />
                  <p className="text-sm text-text-secondary mb-3">{result.upgrade_message}</p>
                  <a href="/pricing" className="btn-primary inline-block px-8">{t('divineTiming.unlockPremium')}</a>
                </div>
              )}
            </>
          )}

          <button onClick={reset} className="text-sm text-text-tertiary hover:text-text-primary w-full py-2">
            {t('divineTiming.askAnother')}
          </button>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <div className="card flex items-start gap-3">
      <Icon className="w-4 h-4 text-accent-primary flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-[11px] uppercase tracking-widest text-text-muted">{title}</p>
        <p className="text-sm text-text-secondary leading-relaxed mt-0.5">{body}</p>
      </div>
    </div>
  );
}
