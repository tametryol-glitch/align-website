'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { Heart, X, Sparkles, Shield, ChevronLeft, ChevronRight, Mic, Video, MoreVertical, Flag, Ban } from 'lucide-react';
import type { DatingCandidate } from '@/lib/datingDiscoveryService';
import { generateCosmicDNA, getCosmicDNAFingerprint } from '@/lib/cosmicDnaEngine';
import type { ChartData } from '@/lib/cosmicDnaEngine';

/** Feature flag for cosmic DNA (web has no featureFlags module) */
const COSMIC_DNA_ENABLED = true;

const SIGN_NAME_TO_INDEX: Record<string, number> = {
  Aries: 0, Taurus: 1, Gemini: 2, Cancer: 3,
  Leo: 4, Virgo: 5, Libra: 6, Scorpio: 7,
  Sagittarius: 8, Capricorn: 9, Aquarius: 10, Pisces: 11,
};

interface DatingProfileCardProps {
  candidate: DatingCandidate;
  onLike: () => void;
  onPass: () => void;
  onRose: () => void;
  onReport?: () => void;
  onBlock?: () => void;
  likesRemaining: number;
  rosesRemaining: number;
  disabled?: boolean;
}

const ZODIAC_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

function getScoreColor(score: number): string {
  if (score >= 75) return '#4ADE80';
  if (score >= 55) return '#FACC15';
  if (score >= 35) return '#FB923C';
  return '#F87171';
}

function getAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function DatingProfileCard({
  candidate,
  onLike,
  onPass,
  onRose,
  onReport,
  onBlock,
  likesRemaining,
  rosesRemaining,
  disabled,
}: DatingProfileCardProps) {
  const { t } = useTranslation();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [safetyMenuOpen, setSafetyMenuOpen] = useState(false);
  const photos = candidate.photo_urls?.length > 0
    ? candidate.photo_urls
    : candidate.avatar_url ? [candidate.avatar_url] : [];

  const score = candidate.compatibility_score ?? 0;

  // Cosmic DNA fingerprint
  const cosmicFingerprint = useMemo(() => {
    if (!COSMIC_DNA_ENABLED || !candidate.sun_sign || SIGN_NAME_TO_INDEX[candidate.sun_sign] === undefined) return null;
    const sun: number = SIGN_NAME_TO_INDEX[candidate.sun_sign];
    const moon: number = (candidate.moon_sign ? SIGN_NAME_TO_INDEX[candidate.moon_sign] : undefined) ?? sun;
    const rising: number = (candidate.rising_sign ? SIGN_NAME_TO_INDEX[candidate.rising_sign] : undefined) ?? sun;
    const chart: ChartData = {
      signs: {
        sun, moon, mercury: sun, venus: sun, mars: sun,
        jupiter: sun, saturn: sun, uranus: sun, neptune: sun,
        pluto: sun, northNode: sun, rising,
      },
      houses: {
        sun: 1, moon: 4, mercury: 3, venus: 7, mars: 1,
        jupiter: 9, saturn: 10, uranus: 11, neptune: 12,
        pluto: 8, northNode: 6, rising: 1,
      },
      aspects: [],
    };
    const dna = generateCosmicDNA(chart);
    return getCosmicDNAFingerprint(dna);
  }, [candidate.sun_sign, candidate.moon_sign, candidate.rising_sign]);

  return (
    <div className="relative w-full max-w-md mx-auto rounded-3xl overflow-hidden" style={{
      background: 'linear-gradient(180deg, #1E2640 0%, #141826 100%)',
      border: '1px solid rgba(155,111,246,0.2)',
    }}>
      {/* Photo section */}
      <div className="relative aspect-[3/4] bg-bg-tertiary">
        {photos.length > 0 ? (
          <Image
            src={photos[photoIndex]}
            alt={candidate.display_name || 'Profile'}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl text-text-muted">
              {ZODIAC_GLYPHS[candidate.sun_sign || ''] || '✨'}
            </span>
          </div>
        )}

        {/* Photo navigation dots */}
        {photos.length > 1 && (
          <div className="absolute top-3 left-0 right-0 flex justify-center gap-1 px-4">
            {photos.map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full flex-1 transition-colors"
                style={{ backgroundColor: i === photoIndex ? '#fff' : 'rgba(255,255,255,0.3)' }}
              />
            ))}
          </div>
        )}

        {/* Photo left/right tap zones */}
        {photos.length > 1 && (
          <>
            <button
              className="absolute left-0 top-0 w-1/3 h-full"
              onClick={() => setPhotoIndex(Math.max(0, photoIndex - 1))}
              aria-label="Previous photo"
            />
            <button
              className="absolute right-0 top-0 w-1/3 h-full"
              onClick={() => setPhotoIndex(Math.min(photos.length - 1, photoIndex + 1))}
              aria-label="Next photo"
            />
          </>
        )}

        {/* Compatibility badge */}
        <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full flex items-center gap-1.5"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
          <Sparkles size={14} style={{ color: getScoreColor(score) }} />
          <span className="text-sm font-semibold" style={{ color: getScoreColor(score) }}>
            {score}%
          </span>
        </div>

        {/* Verified badge */}
        {candidate.photo_verified && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full flex items-center gap-1"
            style={{ backgroundColor: 'rgba(74,222,128,0.2)', backdropFilter: 'blur(8px)' }}>
            <Shield size={12} color="#4ADE80" />
            <span className="text-xs text-green-400">Verified</span>
          </div>
        )}

        {/* Safety menu (report/block) */}
        {(onReport || onBlock) && (
          <div className="absolute left-3 z-20" style={{ top: candidate.photo_verified ? 48 : 12 }}>
            <button
              onClick={() => setSafetyMenuOpen(!safetyMenuOpen)}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
              aria-label="Safety options"
            >
              <MoreVertical size={14} color="#fff" />
            </button>
            {safetyMenuOpen && (
              <div className="absolute top-10 left-0 rounded-xl overflow-hidden" style={{
                backgroundColor: 'rgba(20,24,38,0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(155,111,246,0.2)',
                minWidth: '140px',
              }}>
                {onReport && (
                  <button
                    onClick={() => { setSafetyMenuOpen(false); onReport(); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-white/5 transition-colors"
                    style={{ color: '#FACC15' }}
                  >
                    <Flag size={14} />
                    Report
                  </button>
                )}
                {onBlock && (
                  <button
                    onClick={() => { setSafetyMenuOpen(false); onBlock(); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-white/5 transition-colors"
                    style={{ color: '#F87171' }}
                  >
                    <Ban size={14} />
                    Block
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Media indicators */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          {candidate.voice_prompt_url && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <Mic size={14} color="#B8A0FA" />
            </div>
          )}
          {candidate.video_intro_url && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <Video size={14} color="#B8A0FA" />
            </div>
          )}
        </div>

        {/* Gradient overlay at bottom of photo */}
        <div className="absolute bottom-0 left-0 right-0 h-32"
          style={{ background: 'linear-gradient(transparent, #1E2640)' }} />
      </div>

      {/* Info section */}
      <div className="px-5 pb-5 -mt-8 relative z-10">
        {/* Name & age */}
        <div className="flex items-baseline gap-2 mb-1">
          <h2 className="text-2xl font-bold text-white">
            {candidate.display_name || 'Cosmic Soul'}
          </h2>
          {candidate.birth_date && candidate.age_visible && (
            <span className="text-lg text-text-tertiary">{getAge(candidate.birth_date)}</span>
          )}
        </div>

        {/* Signs */}
        <div className="flex items-center gap-3 mb-2">
          {candidate.sun_sign && (
            <span className="text-sm text-text-secondary">
              {ZODIAC_GLYPHS[candidate.sun_sign]} {candidate.sun_sign}
            </span>
          )}
          {candidate.moon_sign && (
            <span className="text-sm text-text-tertiary">
              ☽ {candidate.moon_sign}
            </span>
          )}
          {candidate.rising_sign && (
            <span className="text-sm text-text-tertiary">
              ↑ {candidate.rising_sign}
            </span>
          )}
        </div>

        {/* Cosmic DNA Fingerprint */}
        {cosmicFingerprint && (
          <div className="mb-3">
            <span className="text-xs px-2 py-0.5 rounded-full" style={{
              backgroundColor: 'rgba(139,92,246,0.12)',
              color: '#C4B5FD',
              border: '1px solid rgba(139,92,246,0.2)',
            }}>
              Cosmic DNA: {cosmicFingerprint}
            </span>
          </div>
        )}

        {/* Intent */}
        {candidate.relationship_primary_intent && (
          <div className="mb-3">
            <span className="text-xs px-2.5 py-1 rounded-full" style={{
              backgroundColor: 'rgba(155,111,246,0.15)',
              color: '#B8A0FA',
            }}>
              {candidate.relationship_primary_intent}
            </span>
          </div>
        )}

        {/* Why You Match tags */}
        {candidate.preference_breakdown && candidate.preference_breakdown.length > 0 && (() => {
          const tags = candidate.preference_breakdown!
            .filter(b => b.alignment === 'strong' || b.alignment === 'moderate')
            .slice(0, 3);
          return tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.map(t => (
                <span key={t.category} className="text-xs px-2 py-0.5 rounded-full" style={{
                  backgroundColor: 'rgba(155,111,246,0.1)',
                  color: '#C4B5FD',
                  border: '1px solid rgba(155,111,246,0.15)',
                }}>
                  ✓ {t.label}
                </span>
              ))}
            </div>
          ) : null;
        })()}

        {/* Bio */}
        {candidate.dating_bio && (
          <p className="text-sm text-text-secondary mb-3 line-clamp-3">
            {candidate.dating_bio}
          </p>
        )}

        {/* Prompts */}
        {candidate.dating_prompts?.length > 0 && (
          <div className="mb-4 space-y-2">
            {candidate.dating_prompts.slice(0, 2).map((p, i) => (
              <div key={i} className="rounded-xl p-3" style={{
                backgroundColor: 'rgba(155,111,246,0.06)',
                border: '1px solid rgba(155,111,246,0.1)',
              }}>
                <p className="text-xs text-accent-secondary mb-1">{p.question}</p>
                <p className="text-sm text-white">{p.answer}</p>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={onPass}
            disabled={disabled}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40"
            style={{
              backgroundColor: 'rgba(248,113,113,0.1)',
              border: '2px solid rgba(248,113,113,0.3)',
            }}
            aria-label={t('components.datingProfileCard.pass')}
          >
            <X size={24} color="#F87171" />
          </button>

          <button
            onClick={onRose}
            disabled={disabled || rosesRemaining <= 0}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40"
            style={{
              backgroundColor: 'rgba(245,166,35,0.1)',
              border: '2px solid rgba(245,166,35,0.3)',
            }}
            aria-label={`${t('components.datingProfileCard.cosmicRose')} (${rosesRemaining})`}
            title={t('components.datingProfileCard.rosesRemaining', { count: rosesRemaining })}
          >
            <span className="text-xl">🌹</span>
          </button>

          <button
            onClick={onLike}
            disabled={disabled || likesRemaining <= 0}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40"
            style={{
              backgroundColor: 'rgba(155,111,246,0.15)',
              border: '2px solid rgba(155,111,246,0.3)',
            }}
            aria-label={t('components.datingProfileCard.likesRemaining', { count: likesRemaining })}
          >
            <Heart size={24} color="#9B6FF6" fill="#9B6FF6" />
          </button>
        </div>

        {/* Remaining likes indicator */}
        <div className="text-center mt-2">
          <span className="text-xs text-text-muted">
            {t('components.datingProfileCard.likesRemaining', { count: likesRemaining })} · {t('components.datingProfileCard.rosesRemaining', { count: rosesRemaining })}
          </span>
        </div>
      </div>
    </div>
  );
}
