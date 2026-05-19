'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  DoorOpen,
  RefreshCcw,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

import { api, buildBirthData } from '@/lib/api';
import {
  chooseMissionOption,
  continueAfterMission,
  createSoulAscensionGame,
  createSoulAscensionStorage,
  reincarnateFromReview,
  type ChapterMission,
  type ChoicePath,
  type ScoreState,
  type SoulAscensionChartInput,
  type SoulAscensionGameState,
} from '@/lib/soulAscension';
import { useAuthStore } from '@/stores/authStore';

type GameTab = 'home' | 'avatar' | 'lifetime' | 'mission' | 'review' | 'codex';

const SOUL_ASCENSION_ASTEROIDS = ['Vesta', 'Juno', 'Lilith'];
const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

const TABS: Array<{ key: GameTab; label: string }> = [
  { key: 'home', label: 'Home' },
  { key: 'avatar', label: 'Avatar' },
  { key: 'lifetime', label: 'Lifetime' },
  { key: 'mission', label: 'Mission' },
  { key: 'review', label: 'Review' },
  { key: 'codex', label: 'Codex' },
];

function lonToSign(lon: number): string {
  return SIGNS[Math.floor((((lon % 360) + 360) % 360) / 30) % 12];
}

function chartInputFromResponse(res: any): SoulAscensionChartInput {
  const placements = (Array.isArray(res?.positions) ? res.positions : res?.planets || []).map((p: any) => {
    const lon = Number(p.longitude ?? 0);
    return {
      name: p.name || p.planet,
      sign: p.sign || lonToSign(lon),
      house: Number(p.house || 1),
      degree: Math.round((((lon % 30) + 30) % 30) * 100) / 100,
      longitude: Math.round((((lon % 360) + 360) % 360) * 100) / 100,
      retrograde: !!p.is_retrograde || !!p.retrograde,
    };
  });

  return {
    placements,
    aspects: Array.isArray(res?.aspects) ? res.aspects : [],
    houses: Array.isArray(res?.house_cusps)
      ? res.house_cusps.map((lon: number, i: number) => ({
          house: i + 1,
          longitude: lon,
          sign: lonToSign(lon),
          degree: Math.round((((lon % 30) + 30) % 30) * 100) / 100,
        }))
      : [],
  };
}

const localStorageAdapter = {
  async getItem(key: string) {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  },
  async removeItem(key: string) {
    if (typeof window !== 'undefined') window.localStorage.removeItem(key);
  },
};

const storage = createSoulAscensionStorage(localStorageAdapter);

export default function SoulAscensionWebGame() {
  const { profile, isLoading } = useAuthStore();
  const [chartInput, setChartInput] = useState<SoulAscensionChartInput | null>(null);
  const [chartLoading, setChartLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [state, setState] = useState<SoulAscensionGameState | null>(null);
  const [activeTab, setActiveTab] = useState<GameTab>('home');
  const [hydrating, setHydrating] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const canUseProfileChart = !!profile?.birth_date && profile.latitude != null && profile.longitude != null && !!profile.timezone;

  const loadChart = useCallback(async () => {
    setChartLoading(true);
    setNotice(null);

    if (isLoading) return;

    if (!canUseProfileChart || !profile) {
      setChartInput(null);
      setNotice('Demo mode is active. Complete your profile birth data to generate your own soul run.');
      setChartLoading(false);
      return;
    }

    try {
      const chartData = await api.getNatalChart({
        ...buildBirthData(profile),
        extra_asteroids: SOUL_ASCENSION_ASTEROIDS,
      });
      const input = chartInputFromResponse(chartData);
      setChartInput(input.placements?.length ? input : null);
      if (!input.placements?.length) {
        setNotice('Demo mode is active because the chart endpoint returned no placements.');
      }
    } catch (err: any) {
      setChartInput(null);
      setNotice(err?.message ? `Demo mode is active. Chart load failed: ${err.message}` : 'Demo mode is active because the chart could not be loaded.');
    } finally {
      setChartLoading(false);
    }
  }, [canUseProfileChart, isLoading, profile]);

  useEffect(() => {
    loadChart();
  }, [loadChart]);

  const freshState = useMemo(() => createSoulAscensionGame(chartInput), [chartInput]);

  useEffect(() => {
    let cancelled = false;
    setHydrating(true);
    storage.load(freshState.chart.signature)
      .then((saved) => {
        if (cancelled) return;
        setState(saved ?? freshState);
        setActiveTab(saved?.phase === 'review' ? 'review' : 'home');
      })
      .catch(() => {
        if (!cancelled) setState(freshState);
      })
      .finally(() => {
        if (!cancelled) setHydrating(false);
      });
    return () => {
      cancelled = true;
    };
  }, [freshState]);

  useEffect(() => {
    if (!state || hydrating) return;
    storage.save(state).catch(() => {});
  }, [hydrating, state]);

  useEffect(() => {
    if (!state || hydrating) return;
    if (state.profile.avatarImageUrl) {
      setAvatarUrl(state.profile.avatarImageUrl);
      return;
    }
    let cancelled = false;
    setAvatarLoading(true);
    api.generateSoulAvatar(
      state.profile.avatarAppearance,
      state.profile.soulArchetype,
      state.chart.placements.Sun?.sign || '',
    ).then((url) => {
      if (cancelled) return;
      setAvatarUrl(url);
      setState((prev) => {
        if (!prev) return prev;
        return { ...prev, profile: { ...prev.profile, avatarImageUrl: url } };
      });
    }).catch(() => {}).finally(() => {
      if (!cancelled) setAvatarLoading(false);
    });
    return () => { cancelled = true; };
  }, [state?.profile.avatarAppearance, hydrating]);

  const choose = (choiceId: string) => {
    setState((current) => current ? chooseMissionOption(current, choiceId) : current);
  };

  const continueMission = () => {
    setState((current) => current ? continueAfterMission(current) : current);
    if (state && state.currentChapterIndex + 1 >= state.profile.chapterMissions.length) {
      setActiveTab('review');
    }
  };

  const resetRun = () => {
    storage.clear(freshState.chart.signature).catch(() => {});
    setState(freshState);
    setActiveTab('home');
  };

  const reincarnate = () => {
    setState((current) => current ? reincarnateFromReview(current) : current);
    setActiveTab('home');
  };

  if (chartLoading || hydrating || !state) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <div className="relative mb-5 h-16 w-16">
          <div className="absolute inset-0 rounded-full border border-teal-300/30 animate-ping" />
          <div className="absolute inset-0 rounded-full border-2 border-t-gold-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-4 rounded-full bg-teal-300/20" />
        </div>
        <h1 className="font-display text-2xl font-bold text-text-primary">Opening the reincarnation gate</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-text-muted">
          Building a playable soul from Nodes, luminaries, houses, aspects, and safe fallbacks.
        </p>
      </div>
    );
  }

  const mission = state.profile.chapterMissions[state.currentChapterIndex];
  const canReview = !!state.soulReview;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <Link href="/readings" className="mb-5 inline-flex items-center gap-2 text-sm text-text-muted transition hover:text-text-primary">
        <ArrowLeft className="h-4 w-4" />
        Back to Readings
      </Link>

      <section className="mb-5 overflow-hidden rounded-lg border border-teal-300/20 bg-[#071012]/85 shadow-2xl shadow-black/30">
        <div className="grid gap-6 p-5 md:grid-cols-[1.3fr_0.7fr] md:p-8">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-gold-primary">Soul Ascension</p>
            <h1 className="font-display text-4xl font-bold leading-tight text-text-primary md:text-5xl">
              Play through your past lives.
            </h1>
            <p className="mt-3 text-base leading-7 text-teal-100/80">
              Fulfill your purpose. Reincarnate higher.
            </p>
            {notice && (
              <div className="mt-5 rounded-md border border-teal-300/25 bg-teal-300/10 px-4 py-3 text-sm leading-6 text-teal-50/85">
                {notice}
              </div>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
            <Metric label="Soul Level" value={String(state.ascensionLevel)} detail={`Lifetime ${state.lifetimeIndex}`} />
            <Metric label="Karma" value={String(state.scores.karma)} detail={state.scores.karma >= 0 ? 'cleaning' : 'debt rising'} />
            <Metric label="Shadow" value={String(state.scores.shadow)} detail="integration pressure" danger={state.scores.shadow > 50} />
          </div>
        </div>
      </section>

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const disabled = tab.key === 'review' && !canReview;
          return (
            <button
              key={tab.key}
              type="button"
              disabled={disabled}
              onClick={() => setActiveTab(tab.key)}
              className={[
                'rounded-md border px-3 py-2 text-sm font-semibold transition',
                activeTab === tab.key
                  ? 'border-teal-300/50 bg-teal-300/15 text-teal-50'
                  : 'border-white/10 bg-white/[0.04] text-text-tertiary hover:border-white/20 hover:text-text-primary',
                disabled ? 'cursor-not-allowed opacity-40' : '',
              ].join(' ')}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'home' && (
        <HomePanel state={state} onContinue={() => setActiveTab(state.soulReview ? 'review' : 'mission')} onPortal={() => setActiveTab(canReview ? 'review' : 'lifetime')} onReset={resetRun} onReload={loadChart} />
      )}
      {activeTab === 'avatar' && <AvatarPanel state={state} avatarUrl={avatarUrl} avatarLoading={avatarLoading} />}
      {activeTab === 'lifetime' && <LifetimePanel state={state} />}
      {activeTab === 'mission' && mission && <MissionPanel mission={mission} state={state} onChoose={choose} onContinue={continueMission} />}
      {activeTab === 'review' && <ReviewPanel state={state} onReincarnate={reincarnate} />}
      {activeTab === 'codex' && <CodexPanel state={state} />}
    </main>
  );
}

function HomePanel({
  state,
  onContinue,
  onPortal,
  onReset,
  onReload,
}: {
  state: SoulAscensionGameState;
  onContinue: () => void;
  onPortal: () => void;
  onReset: () => void;
  onReload: () => void;
}) {
  const mission = state.profile.chapterMissions[state.currentChapterIndex];
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <section className="rounded-lg border border-gold-primary/20 bg-black/30 p-5 md:p-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-gold-primary">Current Lifetime</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-text-primary">{state.profile.lifetimeTitle}</h2>
        <p className="mt-3 text-sm leading-7 text-text-secondary">{state.profile.incarnationReveal}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={onContinue} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-teal-300 px-5 py-3 text-sm font-bold text-[#07110f] transition hover:bg-teal-200">
            <Sparkles className="h-4 w-4" />
            {state.soulReview ? 'View Soul Review' : 'Continue Mission'}
          </button>
          <button type="button" onClick={onPortal} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-gold-primary/40 bg-gold-muted px-5 py-3 text-sm font-bold text-gold-primary transition hover:border-gold-primary/70">
            <DoorOpen className="h-4 w-4" />
            Reincarnation Portal
          </button>
        </div>
      </section>

      <aside className="space-y-4">
        <ScoreBars scores={state.scores} />
        <Panel title="Purpose Path" body={state.profile.futurePurpose} />
        <Panel title="Daily Soul Mission" body={`Choose one ${state.profile.soulContracts[0].contractType.toLowerCase()} moment without using the old weapon: ${state.profile.mainTemptation}.`} />
        <Panel title="Next Chapter" body={mission ? `${mission.chapterNumber}. ${mission.title}` : 'This lifetime is ready for Soul Review.'} />
        <div className="flex gap-2">
          <button type="button" onClick={onReload} className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs font-semibold text-text-tertiary hover:text-text-primary">
            <RefreshCcw className="h-3.5 w-3.5" />
            Reload Chart
          </button>
          <button type="button" onClick={onReset} className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs font-semibold text-text-tertiary hover:text-text-primary">
            <RotateCcw className="h-3.5 w-3.5" />
            Restart
          </button>
        </div>
      </aside>
    </div>
  );
}

function AvatarPanel({ state, avatarUrl, avatarLoading }: { state: SoulAscensionGameState; avatarUrl: string | null; avatarLoading: boolean }) {
  const p = state.profile;
  return (
    <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-lg border border-gold-primary/20 bg-black/30 p-5 md:p-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-gold-primary">Soul Avatar</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-text-primary">{p.avatarName}</h2>
        {avatarLoading && !avatarUrl ? (
          <div className="my-4 flex aspect-square w-full items-center justify-center rounded-lg bg-white/[0.05]">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-t-gold-primary border-r-transparent border-b-transparent border-l-transparent" />
              <p className="text-sm text-text-muted">Manifesting your soul&apos;s form...</p>
            </div>
          </div>
        ) : avatarUrl ? (
          <img src={avatarUrl} alt={p.avatarName} className="my-4 w-full rounded-lg object-cover" />
        ) : null}
        <p className="mt-3 text-sm leading-7 text-text-secondary">{p.avatarAppearance}</p>
      </section>
      <InfoGrid items={[
        ['Archetype', p.soulArchetype],
        ['Emotional Nature', p.emotionalNature],
        ['Main Wound', p.emotionalWound],
        ['Main Gift', p.coreGift],
        ['Main Fear', p.mainFear],
        ['Main Temptation', p.mainTemptation],
        ['South Node Pattern', p.pastLifePattern],
        ['North Node Purpose', p.futurePurpose],
        ['Soul Scar', `${p.soulScar.name}: ${p.soulScar.shadowPhrase}`],
        ['Soul Contract Theme', p.soulContracts[0].lesson],
      ]} />
      <ListPanel title="Strengths" items={p.strengths} />
      <ListPanel title="Weaknesses" items={p.weaknesses} />
    </div>
  );
}

function LifetimePanel({ state }: { state: SoulAscensionGameState }) {
  const p = state.profile;
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <section className="rounded-lg border border-gold-primary/20 bg-black/30 p-5 md:p-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-gold-primary">Past-Life Story Map</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-text-primary">{p.lifetimeTitle}</h2>
        <p className="mt-3 text-sm leading-7 text-text-secondary">{p.lifetimeSetting}</p>
        <div className="mt-5">
          <InfoGrid items={[
            ['Main Conflict', p.mainConflict],
            ['Key Relationship', `${p.soulContracts[0].recurringSoulName} as ${p.soulContracts[0].currentRole}`],
            ['Main Purpose', p.mainPurpose],
            ['Current Soul Scar', `${p.soulScar.name} (${p.soulScar.status})`],
            ['Main Contract', p.soulContracts[0].purposeChoice],
          ]} compact />
        </div>
      </section>
      <aside className="space-y-3">
        {p.chapterMissions.map((chapter, index) => (
          <div
            key={chapter.id}
            className={[
              'flex items-center gap-3 rounded-lg border p-4',
              index === state.currentChapterIndex
                ? 'border-teal-300/45 bg-teal-300/10'
                : 'border-white/10 bg-white/[0.04]',
            ].join(' ')}
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal-300 text-sm font-black text-[#07110f]">{chapter.chapterNumber}</span>
            <div>
              <p className="text-sm font-bold text-text-primary">{chapter.title}</p>
              <p className="text-xs text-text-muted">{index < state.currentChapterIndex ? 'Completed' : index === state.currentChapterIndex ? 'Current' : 'Locked ahead'}</p>
            </div>
          </div>
        ))}
      </aside>
      <ListPanel title="Node Aspect Story Modifiers" items={p.nodeAspectStoryModifiers} wide />
    </div>
  );
}

function MissionPanel({
  mission,
  state,
  onChoose,
  onContinue,
}: {
  mission: ChapterMission;
  state: SoulAscensionGameState;
  onChoose: (choiceId: string) => void;
  onContinue: () => void;
}) {
  const resolution = state.lastResolution;
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <section className="rounded-lg border border-gold-primary/20 bg-black/30 p-5 md:p-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-gold-primary">Chapter {mission.chapterNumber} of {state.profile.chapterMissions.length}</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-text-primary">{mission.title}</h2>
        <p className="mt-3 text-sm leading-7 text-text-secondary">{mission.storyScene}</p>
        <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-teal-100/80">Emotional Setup</p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{mission.emotionalSetup}</p>
        </div>
      </section>

      <aside>
        {resolution ? (
          <div className="rounded-lg border border-teal-300/35 bg-teal-300/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-100">Consequence</p>
            <h3 className="mt-2 text-lg font-bold text-text-primary">{resolution.choice.text}</h3>
            <p className="mt-3 text-sm leading-6 text-text-secondary">{resolution.choice.consequenceText}</p>
            <p className="mt-4 text-xs font-bold text-teal-100">{deltaText(resolution.scoresAfter)}</p>
            {resolution.unlockedRelic && <UnlockLine label="Relic unlocked" value={resolution.unlockedRelic.name} />}
            {resolution.unlockedProphecy && <UnlockLine label="Prophecy card" value={resolution.unlockedProphecy.message} />}
            <button type="button" onClick={onContinue} className="mt-5 min-h-11 w-full rounded-md bg-teal-300 px-4 py-3 text-sm font-bold text-[#07110f] transition hover:bg-teal-200">
              {resolution.continueLabel}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {mission.choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => onChoose(choice.id)}
                className="group flex w-full overflow-hidden rounded-lg border border-white/10 bg-white/[0.055] text-left transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.08]"
              >
                <span className="w-1.5 shrink-0" style={{ backgroundColor: pathColor(choice.path) }} />
                <span className="p-4">
                  <span className="block text-sm font-bold leading-6 text-text-primary">{choice.text}</span>
                  <span className="mt-1 block text-xs leading-5 text-text-muted">{choice.emotionalCost}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}

function ReviewPanel({ state, onReincarnate }: { state: SoulAscensionGameState; onReincarnate: () => void }) {
  const review = state.soulReview;
  if (!review) {
    return <EmptyPanel title="Soul Review locked" body="Finish the final karmic decision to open the Soul Review." />;
  }
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <section className="rounded-lg border border-gold-primary/20 bg-black/30 p-5 md:p-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-gold-primary">Soul Review</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-text-primary">{review.ending.title}</h2>
        <p className="mt-3 text-sm leading-7 text-text-secondary">{review.ending.description}</p>
        <div className="mt-5">
          <InfoGrid items={[
            ['Ending Type', review.ending.type],
            ['Ascension Gained', `+${review.ascensionLevelGained}`],
            ['Contract Result', review.contractResult],
            ['Soul Scar Result', review.scarResult],
            ['Gift Awakened', review.giftAwakened],
            ['Next Lifetime Preview', review.nextLifetimePreview],
          ]} compact />
        </div>
        <button type="button" onClick={onReincarnate} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-teal-300 px-5 py-3 text-sm font-bold text-[#07110f] transition hover:bg-teal-200">
          <DoorOpen className="h-4 w-4" />
          Reincarnate Higher
        </button>
      </section>
      <aside className="space-y-4">
        <ListPanel title="What the Soul Learned" items={review.learned} />
        <ListPanel title="What Repeated" items={review.repeated} />
        <ListPanel title="What Remains" items={review.unresolved} />
      </aside>
    </div>
  );
}

function CodexPanel({ state }: { state: SoulAscensionGameState }) {
  const codex = state.codex;
  const relics = [...codex.soulRelics, ...state.profile.relics.filter((relic) => relic.unlocked)];
  const prophecies = [...codex.prophecyCards, ...state.profile.prophecyCards.filter((card) => card.unlocked)];
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-lg border border-gold-primary/20 bg-black/30 p-5 md:p-6 lg:col-span-2">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-gold-primary">Soul Codex Library</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-text-primary">Unlocked Memory</h2>
        <p className="mt-3 text-sm leading-7 text-text-secondary">
          Past lives, lessons, scars, gifts, contracts, relics, prophecy cards, and fragments are stored here as the reincarnation loop expands.
        </p>
      </section>
      <ListPanel title="Past Lives" items={codex.pastLives.length ? codex.pastLives : [state.profile.lifetimeTitle]} />
      <ListPanel title="Soul Lessons" items={codex.soulLessons.length ? codex.soulLessons : ['Complete a lifetime to record the first review.']} />
      <ListPanel title="Karmic Patterns" items={codex.karmicPatterns.length ? codex.karmicPatterns : [state.profile.pastLifePattern]} />
      <ListPanel title="Soul Scars" items={[...codex.soulScars, state.profile.soulScar].map((scar) => `${scar.name}: ${scar.status}`)} />
      <ListPanel title="Gifts" items={codex.gifts.length ? codex.gifts : [state.profile.coreGift, state.profile.hiddenGift]} />
      <ListPanel title="Relationship Contracts" items={[...codex.relationshipContracts, ...state.profile.soulContracts].map((contract) => `${contract.recurringSoulName}: ${contract.status}`)} />
      <ListPanel title="Soul Relics" items={relics.length ? relics.map((relic) => `${relic.name}: ${relic.memory}`) : ['No relic unlocked yet.']} />
      <ListPanel title="Prophecy Cards" items={prophecies.length ? prophecies.map((card) => card.message) : ['No prophecy card unlocked yet.']} />
    </div>
  );
}

function Metric({ label, value, detail, danger = false }: { label: string; value: string; detail: string; danger?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${danger ? 'border-red-300/35 bg-red-300/10' : 'border-teal-300/15 bg-white/[0.045]'}`}>
      <p className="text-xs font-bold uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-1 text-3xl font-black text-text-primary">{value}</p>
      <p className="mt-1 text-xs text-text-muted">{detail}</p>
    </div>
  );
}

function ScoreBars({ scores }: { scores: ScoreState }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
      <ScoreBar label="Purpose" value={scores.purpose} color="#5EE6A8" />
      <ScoreBar label="Shadow" value={scores.shadow} color="#E05D5D" />
      <ScoreBar label="Gift" value={scores.giftMastery} color="#4ECBD6" />
      <ScoreBar label="Scar" value={scores.soulScarIntensity} color="#F5A623" />
    </div>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-bold text-text-secondary">{label}</span>
        <span className="text-text-muted">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full" style={{ width: `${Math.max(4, Math.min(100, value))}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function Panel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
      <h3 className="text-base font-bold text-text-primary">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{body}</p>
    </div>
  );
}

function ListPanel({ title, items, wide = false }: { title: string; items: string[]; wide?: boolean }) {
  return (
    <div className={`rounded-lg border border-white/10 bg-white/[0.045] p-5 ${wide ? 'lg:col-span-2' : ''}`}>
      <h3 className="text-base font-bold text-text-primary">{title}</h3>
      <div className="mt-3 space-y-2">
        {items.map((item, index) => (
          <p key={`${title}-${index}`} className="text-sm leading-6 text-text-secondary">{item}</p>
        ))}
      </div>
    </div>
  );
}

function InfoGrid({ items, compact = false }: { items: Array<[string, string]>; compact?: boolean }) {
  return (
    <div className={`grid gap-3 ${compact ? '' : 'lg:grid-cols-2'}`}>
      {items.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-gold-primary">{label}</p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{value}</p>
        </div>
      ))}
    </div>
  );
}

function UnlockLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3 rounded-md border border-gold-primary/25 bg-gold-muted p-3">
      <p className="text-xs font-black uppercase tracking-wide text-gold-primary">{label}</p>
      <p className="mt-1 text-sm leading-6 text-text-secondary">{value}</p>
    </div>
  );
}

function EmptyPanel({ title, body }: { title: string; body: string }) {
  return (
    <section className="mx-auto max-w-2xl rounded-lg border border-white/10 bg-white/[0.045] p-8 text-center">
      <BookOpen className="mx-auto mb-4 h-8 w-8 text-text-muted" />
      <h2 className="font-display text-2xl font-bold text-text-primary">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-text-muted">{body}</p>
    </section>
  );
}

function pathColor(path: ChoicePath): string {
  if (path === 'purpose') return '#5EE6A8';
  if (path === 'shadow') return '#E05D5D';
  if (path === 'comfort') return '#F5A623';
  if (path === 'risk') return '#4ECBD6';
  return '#A8B0C0';
}

function deltaText(scores: ScoreState): string {
  return `Karma ${scores.karma} | Purpose ${scores.purpose} | Shadow ${scores.shadow} | Gift ${scores.giftMastery}`;
}
