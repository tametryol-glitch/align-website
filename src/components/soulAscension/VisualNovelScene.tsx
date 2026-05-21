'use client';

/**
 * VisualNovelScene — full-screen immersive scene manager (web).
 *
 * Orchestrates: title card → story → setup → choices → resolution.
 * Replaces the flat MissionPanel when in VN mode.
 */

import { ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import type {
  ChapterMission,
  MissionResolution,
  SoulAscensionGameState,
} from '@/lib/soulAscension/types';

import { getSceneBackground } from './vnSceneBackgrounds';
import { vnAudio } from './vnAudioManager';
import AnimatedScoreDelta from './AnimatedScoreDelta';
import ReflectionJournal from './ReflectionJournal';
import ShareConsequenceButton from './ShareConsequenceButton';
import ChapterTitleCard from './ChapterTitleCard';
import ChoiceCardStack from './ChoiceCardStack';
import ParticleField from './ParticleField';
import ScoreHUD from './ScoreHUD';
import TypewriterText from './TypewriterText';

type VNPhase =
  | 'title_card'
  | 'story_scene'
  | 'emotional_setup'
  | 'choices'
  | 'resolution';

interface Props {
  mission: ChapterMission;
  state: SoulAscensionGameState;
  onChoose: (choiceId: string) => void;
  onContinue: () => void;
  onExitVN: () => void;
  avatarUrl?: string | null;
  onSaveJournal?: (reflection: string) => void;
}

export default function VisualNovelScene({
  mission,
  state,
  onChoose,
  onContinue,
  onExitVN,
  avatarUrl,
  onSaveJournal,
}: Props) {
  const resolution = state.lastResolution;
  const hasResolution = !!resolution && resolution.mission.id === mission.id;
  const initialPhase: VNPhase = hasResolution ? 'resolution' : 'title_card';
  const [phase, setPhase] = useState<VNPhase>(initialPhase);
  const [textDone, setTextDone] = useState(false);

  const bg = getSceneBackground(mission.chapterType);

  // Unlock audio on first user interaction & start ambient
  useEffect(() => {
    const handleGesture = () => vnAudio.unlock();
    document.addEventListener('click', handleGesture, { once: true });
    document.addEventListener('keydown', handleGesture, { once: true });

    vnAudio.playAmbient(mission.chapterType);
    vnAudio.playSfx('chapter_intro');

    return () => {
      document.removeEventListener('click', handleGesture);
      document.removeEventListener('keydown', handleGesture);
      vnAudio.stopAll();
    };
  }, [mission.chapterType]);

  // Reset when mission changes
  useEffect(() => {
    setPhase(hasResolution ? 'resolution' : 'title_card');
  }, [mission.id]);

  const advancePhase = useCallback(() => {
    switch (phase) {
      case 'title_card':
        setTextDone(false);
        setPhase('story_scene');
        break;
      case 'story_scene':
        vnAudio.playSfx('continue');
        setTextDone(false);
        setPhase('emotional_setup');
        break;
      case 'emotional_setup':
        vnAudio.playSfx('continue');
        setPhase('choices');
        break;
      default:
        break;
    }
  }, [phase]);

  const handleChoose = useCallback(
    (choiceId: string) => {
      vnAudio.playSfx('choice_confirm');
      onChoose(choiceId);
    },
    [onChoose],
  );

  // Jump to resolution when it appears after a choice
  useEffect(() => {
    if (hasResolution && phase === 'choices') {
      setPhase('resolution');
    }
  }, [hasResolution, phase]);

  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-hidden" style={{ background: bg.gradient }}>
      {/* Background image (AI art) */}
      {bg.imageUrl && (
        <img
          src={bg.imageUrl}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Overlay tint (darkens scene for text readability) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundColor: bg.overlayColor ?? '#000',
          opacity: bg.imageUrl ? 0.3 : (bg.overlayOpacity ?? 0.1),
        }}
      />

      {/* Atmospheric particles */}
      <ParticleField style={bg.particles ?? 'dust'} />

      {/* Title card overlay */}
      {phase === 'title_card' && (
        <ChapterTitleCard
          mission={mission}
          totalChapters={state.profile.chapterMissions.length}
          onDismiss={advancePhase}
        />
      )}

      {/* Game UI */}
      {phase !== 'title_card' && (
        <div className="relative flex flex-1 flex-col animate-in fade-in duration-500">
          {/* Score HUD */}
          <ScoreHUD
            scores={state.scores}
            chapterLabel={`CH ${mission.chapterNumber} • ${mission.title.toUpperCase()}`}
          />

          {/* Scene area — portrait + back button */}
          <div className="relative flex-1 p-4">
            <button
              type="button"
              onClick={onExitVN}
              className="relative z-10 inline-flex items-center gap-1.5 rounded-md bg-white/[0.08] px-3 py-1.5 text-xs font-bold text-text-tertiary transition hover:bg-white/[0.14] hover:text-text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Hub
            </button>

            {/* Character portrait */}
            {avatarUrl && (
              <div className="absolute bottom-0 right-4 h-44 w-32 overflow-hidden rounded-lg border border-gold-primary/20 sm:right-8 sm:h-52 sm:w-40">
                <img
                  src={avatarUrl}
                  alt={state.profile.avatarName}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[rgba(6,6,14,0.6)] to-transparent" />
              </div>
            )}
          </div>

          {/* Bottom panel */}
          <div
            className="relative max-h-[65vh] overflow-y-auto"
            style={{
              background: 'linear-gradient(to bottom, rgba(6,6,14,0) 0%, rgba(6,6,14,0.88) 15%, rgba(6,6,14,0.96) 40%)',
            }}
          >
            <div className="px-4 pb-6 pt-8 sm:px-8">
              {phase === 'story_scene' && (
                <div className="mx-auto max-w-2xl">
                  <TypewriterText
                    text={mission.storyScene}
                    textKey={`story-${mission.id}`}
                    speed={36}
                    onComplete={() => setTextDone(true)}
                  />
                  {!textDone && (
                    <p className="mt-2 text-center text-[10px] tracking-wider text-white/20">
                      Click text to skip
                    </p>
                  )}
                  {textDone && (
                    <button
                      type="button"
                      onClick={advancePhase}
                      className="mx-auto mt-4 flex items-center gap-2 rounded-md bg-white/[0.08] px-5 py-2.5 text-sm font-semibold text-teal-100 transition hover:bg-white/[0.14]"
                    >
                      Continue ▸
                    </button>
                  )}
                </div>
              )}

              {phase === 'emotional_setup' && (
                <div className="mx-auto max-w-2xl">
                  <TypewriterText
                    text={mission.emotionalSetup}
                    textKey={`setup-${mission.id}`}
                    speed={34}
                    onComplete={() => setTextDone(true)}
                    className="italic text-teal-100/80"
                  />
                  {textDone && (
                    <button
                      type="button"
                      onClick={advancePhase}
                      className="mx-auto mt-4 flex items-center gap-2 rounded-md bg-white/[0.08] px-5 py-2.5 text-sm font-semibold text-teal-100 transition hover:bg-white/[0.14]"
                    >
                      Make your choice ▸
                    </button>
                  )}
                </div>
              )}

              {phase === 'choices' && (
                <div className="mx-auto max-w-xl">
                  <p className="mb-4 px-4 text-sm italic leading-6 text-teal-100/60 sm:px-6">
                    {mission.emotionalSetup}
                  </p>
                  <ChoiceCardStack
                    choices={mission.choices}
                    onChoose={handleChoose}
                  />
                </div>
              )}

              {phase === 'resolution' && resolution && (
                <ResolutionPanel
                  resolution={resolution}
                  onContinue={onContinue}
                  onSaveJournal={onSaveJournal}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResolutionPanel({
  resolution,
  onContinue,
  onSaveJournal,
}: {
  resolution: MissionResolution;
  onContinue: () => void;
  onSaveJournal?: (reflection: string) => void;
}) {
  // Play unlock SFX when resolution mounts
  useEffect(() => {
    if (resolution.unlockedRelic) vnAudio.playSfx('unlock_relic');
    if (resolution.unlockedProphecy) vnAudio.playSfx('unlock_prophecy');
  }, [resolution]);

  return (
    <div className="mx-auto max-w-2xl animate-in fade-in slide-in-from-bottom-3 duration-600">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gold-primary">
        Consequence
      </p>
      <h3 className="mt-2 text-lg font-bold text-text-primary sm:text-xl">
        {resolution.choice.text}
      </h3>
      <p className="mt-3 text-sm leading-7 text-text-secondary">
        {resolution.choice.consequenceText}
      </p>

      <div className="mt-4">
        <AnimatedScoreDelta before={resolution.scoresBefore} after={resolution.scoresAfter} />
      </div>

      {resolution.unlockedRelic && (
        <div className="mt-3 rounded-md border border-gold-primary/25 bg-gold-primary/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-gold-primary">
            Relic Unlocked
          </p>
          <p className="mt-1 text-sm text-text-secondary">{resolution.unlockedRelic.name}</p>
        </div>
      )}

      {resolution.unlockedProphecy && (
        <div className="mt-3 rounded-md border border-gold-primary/25 bg-gold-primary/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-gold-primary">
            Prophecy Card
          </p>
          <p className="mt-1 text-sm text-text-secondary">{resolution.unlockedProphecy.message}</p>
        </div>
      )}

      <ShareConsequenceButton resolution={resolution} />

      {onSaveJournal && (
        <ReflectionJournal onSave={onSaveJournal} />
      )}

      <button
        type="button"
        onClick={() => { vnAudio.playSfx('continue'); onContinue(); }}
        className="mt-6 min-h-11 w-full rounded-md bg-teal-300 px-5 py-3 text-sm font-bold text-[#07110f] transition hover:bg-teal-200"
      >
        {resolution.continueLabel}
      </button>
    </div>
  );
}
