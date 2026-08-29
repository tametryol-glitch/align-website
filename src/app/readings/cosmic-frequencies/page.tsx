'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, Copy, Search, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import {
  COSMIC_FREQUENCIES,
  FREQUENCY_DOMAINS,
  FREQUENCY_THEMES,
  getFrequenciesByDomain,
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
import { WeeklyFrequencyCard } from '@/components/cosmicFrequencies/WeeklyFrequencyCard';

const DOMAIN_META: Record<FrequencyDomain, { label: string; glyph: string }> = {
  health: { label: 'Health', glyph: '⚕' },
  money: { label: 'Money', glyph: '◆' },
  love: { label: 'Love', glyph: '♥' },
  career: { label: 'Career', glyph: '▲' },
  protection: { label: 'Protection', glyph: '⛨' },
  spiritual: { label: 'Spiritual', glyph: '✦' },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
      title={copied ? 'Copied' : 'Copy'}
      aria-label={copied ? 'Copied' : 'Copy frequency'}
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : (
        <Copy className="w-4 h-4 text-text-muted" />
      )}
    </button>
  );
}

export default function CosmicFrequenciesPage() {
  const { t } = useTranslation();
  const userId = useAuthStore((s) => s.user?.id) ?? null;

  const [domain, setDomain] = useState<FrequencyDomain | 'all'>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<CosmicFrequency | null>(null);
  const [pendingGated, setPendingGated] = useState<CosmicFrequency | null>(null);

  const visible = useMemo(() => {
    const base =
      query.trim().length > 0
        ? searchFrequencies(query)
        : domain === 'all'
          ? COSMIC_FREQUENCIES
          : getFrequenciesByDomain(domain);

    if (query.trim().length > 0 && domain !== 'all') {
      return base.filter((f) => f.domain === domain);
    }
    return base;
  }, [domain, query]);

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

      {/* Section-level notice. The blocking acknowledgement is separate and
          fires on first entry to any health frequency. */}
      <div className="flex gap-3 p-4 rounded-xl border border-border-primary bg-white/5 mb-6">
        <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed text-text-muted">
          {t('cosmicFrequencies.disclaimer.body', HEALTH_DISCLAIMER)}
        </p>
      </div>

      {/* This week's frequency — routed through openFrequency so the health
          gate applies here exactly as it does in the grid. */}
      <WeeklyFrequencyCard onOpen={openFrequency} />

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
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
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

      {/* Grid */}
      {visible.length === 0 ? (
        <p className="text-sm text-text-muted py-8 text-center">
          {t('cosmicFrequencies.noResults', 'Nothing matches that yet.')}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((freq) => (
            <button
              key={freq.id}
              onClick={() => openFrequency(freq)}
              className="text-left p-4 rounded-xl border border-border-primary bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-muted">
                  <span className="mr-1" aria-hidden>{DOMAIN_META[freq.domain].glyph}</span>
                  {t(`cosmicFrequencies.domain.${freq.domain}`, DOMAIN_META[freq.domain].label)}
                </span>
                {requiresDisclaimer(freq) && (
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" aria-label="Requires acknowledgement" />
                )}
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">{freq.title}</h3>
              <p className="font-mono text-base text-accent-primary tracking-wide">{freq.code}</p>
            </button>
          ))}
        </div>
      )}

      {/* Detail */}
      {selected && (
        <div className="mt-8 p-5 rounded-2xl border border-border-primary bg-white/5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-xs text-text-muted mb-1">
                <span className="mr-1" aria-hidden>{DOMAIN_META[selected.domain].glyph}</span>
                {t(
                  `cosmicFrequencies.domain.${selected.domain}`,
                  DOMAIN_META[selected.domain].label,
                )}
              </p>
              <h2 className="text-xl font-display font-bold text-text-primary">
                {selected.title}
              </h2>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              {t('common.close', 'Close')}
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <p className="font-mono text-2xl text-accent-primary tracking-wider">
              {selected.code}
            </p>
            <CopyButton text={selected.code} />
          </div>

          <p className="text-sm leading-relaxed text-text-secondary mb-4">{selected.intent}</p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {selected.themes.map((th) => (
              <span
                key={th}
                className="px-2 py-1 rounded-md text-[11px] bg-white/5 text-text-muted"
              >
                {FREQUENCY_THEMES[th].label}
              </span>
            ))}
          </div>

          {/* Persistent footer on every gated frequency — not a buried link. */}
          {requiresDisclaimer(selected) && (
            <div className="flex gap-2 pt-3 border-t border-border-primary">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-text-muted">
                {t('cosmicFrequencies.disclaimer.body', HEALTH_DISCLAIMER)}
              </p>
            </div>
          )}
        </div>
      )}

      <HealthDisclaimerModal
        visible={pendingGated !== null}
        onAccept={handleAccept}
        onCancel={() => setPendingGated(null)}
      />
    </div>
  );
}
