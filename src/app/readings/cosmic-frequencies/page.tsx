'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChevronDown, Search, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import {
  COSMIC_FREQUENCIES,
  ENTRAINMENT_SESSIONS,
  FREQUENCY_DOMAINS,
  PRACTICE_NOTES,
  PRACTICE_STEPS,
  getAlphabetical,
  getFrequenciesByDomain,
  groupByLetter,
  requiresDisclaimer,
  searchFrequencies,
  type CosmicFrequency,
  type FrequencyDomain,
} from '@/data/cosmicFrequencies';
import {
  HEALTH_DISCLAIMER,
  acknowledge,
  hasAcknowledged,
} from '@/lib/cosmicFrequencies/disclaimer';
import { HealthDisclaimerModal } from '@/components/cosmicFrequencies/HealthDisclaimerModal';
import { FrequencyDetailModal } from '@/components/cosmicFrequencies/FrequencyDetailModal';
import { WeeklyFrequencyCard } from '@/components/cosmicFrequencies/WeeklyFrequencyCard';
import { SessionPlayer } from '@/components/cosmicFrequencies/SessionPlayer';

const DOMAIN_META: Record<FrequencyDomain, { label: string; glyph: string }> = {
  health: { label: 'Health', glyph: '⚕' },
  money: { label: 'Money', glyph: '◆' },
  love: { label: 'Love', glyph: '♥' },
  career: { label: 'Career', glyph: '▲' },
  protection: { label: 'Protection', glyph: '⛨' },
  spiritual: { label: 'Spiritual', glyph: '✦' },
};

export default function CosmicFrequenciesPage() {
  const { t } = useTranslation();
  const userId = useAuthStore((s) => s.user?.id) ?? null;

  const [domain, setDomain] = useState<FrequencyDomain | 'all'>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<CosmicFrequency | null>(null);
  const [pendingGated, setPendingGated] = useState<CosmicFrequency | null>(null);
  const [howToOpen, setHowToOpen] = useState(true);

  const visible = useMemo(() => {
    let base =
      query.trim().length > 0
        ? searchFrequencies(query)
        : domain === 'all'
          ? COSMIC_FREQUENCIES
          : getFrequenciesByDomain(domain);

    if (query.trim().length > 0 && domain !== 'all') {
      base = base.filter((f) => f.domain === domain);
    }
    return getAlphabetical(base);
  }, [domain, query]);

  const groups = useMemo(() => groupByLetter(visible), [visible]);

  /** Health frequencies open only after the disclaimer has been acknowledged. */
  const openFrequency = (freq: CosmicFrequency) => {
    if (requiresDisclaimer(freq) && !hasAcknowledged(userId)) {
      setPendingGated(freq);
      return;
    }
    setSelected(freq);
  };

  const handleAccept = async () => {
    const freq = pendingGated;
    setPendingGated(null);
    await acknowledge(userId);
    if (freq) setSelected(freq);
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <Link
        href="/readings"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('common.back', 'Back')}
      </Link>

      <h1 className="text-3xl font-display font-bold text-text-primary mb-2">
        {t('cosmicFrequencies.title', 'Cosmic Frequencies')}
      </h1>
      <p className="text-sm text-text-secondary max-w-2xl mb-6">
        {t(
          'cosmicFrequencies.intro',
          'Numeric sequences to hold alongside a specific intention. Browse the library, or work with the one your chart is pointing at this week.',
        )}
      </p>

      {/* How to use — open by default. Someone landing on a wall of numbers
          needs the method before the catalog is worth anything. */}
      <div className="rounded-xl border border-border-primary bg-white/5 mb-6 overflow-hidden">
        <button
          onClick={() => setHowToOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
          aria-expanded={howToOpen}
        >
          <span className="text-sm font-semibold text-text-primary">
            {t('cosmicFrequencies.howToUse', 'How to work with it')}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-text-muted transition-transform ${howToOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {howToOpen && (
          <div className="px-4 pb-4">
            <ol className="space-y-3 mb-4">
              {PRACTICE_STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-primary/20 text-accent-primary text-[11px] font-semibold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{step.title}</p>
                    <p className="text-xs leading-relaxed text-text-muted mt-0.5">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <ul className="space-y-1.5">
              {PRACTICE_NOTES.map((note) => (
                <li key={note} className="text-xs leading-relaxed text-text-muted flex gap-2">
                  <span aria-hidden className="text-accent-primary">·</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex gap-3 p-4 rounded-xl border border-border-primary bg-white/5 mb-6">
        <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed text-text-muted">
          {t('cosmicFrequencies.disclaimer.body', HEALTH_DISCLAIMER)}
        </p>
      </div>

      <WeeklyFrequencyCard onOpen={openFrequency} />

      {/* Entrainment sessions. A different content type from the codex --
          long-form audio with no numeric code and nothing for the theme
          scorer to match - so it sits above the library rather than in it. */}
      {ENTRAINMENT_SESSIONS.map((session) => (
        <SessionPlayer key={session.id} session={session} />
      ))}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(
            'cosmicFrequencies.searchPlaceholder',
            'Search by intention or by number',
          )}
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-border-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors"
        />
      </div>

      {/* Domain filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        <button
          onClick={() => setDomain('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            domain === 'all'
              ? 'bg-accent-primary text-white'
              : 'bg-white/5 text-text-muted hover:bg-white/10'
          }`}
        >
          {t('cosmicFrequencies.domain.all', 'All')}
        </button>
        {FREQUENCY_DOMAINS.map((d) => (
          <button
            key={d}
            onClick={() => setDomain(d)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              domain === d
                ? 'bg-accent-primary text-white'
                : 'bg-white/5 text-text-muted hover:bg-white/10'
            }`}
          >
            <span className="mr-1.5" aria-hidden>{DOMAIN_META[d].glyph}</span>
            {t(`cosmicFrequencies.domain.${d}`, DOMAIN_META[d].label)}
          </button>
        ))}
      </div>

      {/* A-Z jump index */}
      {groups.length > 1 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {groups.map((g) => (
            <a
              key={g.letter}
              href={`#cf-letter-${g.letter}`}
              className="w-7 h-7 rounded-md bg-white/5 hover:bg-white/10 text-xs font-semibold text-text-muted hover:text-text-primary flex items-center justify-center transition-colors"
            >
              {g.letter}
            </a>
          ))}
        </div>
      )}

      <p className="text-xs text-text-muted mb-3">
        {t('cosmicFrequencies.count', {
          count: visible.length,
          defaultValue: '{{count}} sequences',
        })}
      </p>

      {/* Codex */}
      {visible.length === 0 ? (
        <p className="text-sm text-text-muted py-8 text-center">
          {t('cosmicFrequencies.noResults', 'Nothing matches that yet.')}
        </p>
      ) : (
        <div className="rounded-xl border border-border-primary overflow-hidden">
          {groups.map((group) => (
            <div key={group.letter}>
              <div
                id={`cf-letter-${group.letter}`}
                className="px-4 py-1.5 bg-white/[0.07] text-xs font-bold text-text-muted sticky top-0 scroll-mt-4"
              >
                {group.letter}
              </div>
              {group.items.map((freq) => (
                <button
                  key={freq.id}
                  onClick={() => openFrequency(freq)}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 border-t border-border-primary/40 hover:bg-white/5 transition-colors"
                >
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-text-primary truncate">
                        {freq.title}
                      </span>
                      {requiresDisclaimer(freq) && (
                        <ShieldAlert className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      )}
                    </span>
                    <span className="block text-[11px] text-text-muted truncate">
                      <span aria-hidden>{DOMAIN_META[freq.domain].glyph}</span>{' '}
                      {t(
                        `cosmicFrequencies.domain.${freq.domain}`,
                        DOMAIN_META[freq.domain].label,
                      )}
                    </span>
                  </span>
                  <span className="font-mono text-sm text-accent-primary tracking-wide flex-shrink-0">
                    {freq.code}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      <FrequencyDetailModal frequency={selected} onClose={() => setSelected(null)} />

      <HealthDisclaimerModal
        visible={pendingGated !== null}
        onAccept={handleAccept}
        onCancel={() => setPendingGated(null)}
      />
    </div>
  );
}
