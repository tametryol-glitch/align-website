'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { Compass, ArrowLeft, ChevronDown, ChevronUp, Copy, Share2, Sparkles, Loader2, Info, CalendarSearch } from 'lucide-react';
import { InlineBold } from '@/components/ui/InlineBold';
import { getZodiacGlyph } from '@/lib/utils';
import { PaywallGate } from '@/components/ui/PaywallGate';
import { BirthDataPrompt } from '@/components/ui/BirthDataPrompt';

// ─── Constants ───────────────────────────────────────────────────────────────

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const SIGN_YEARS: Record<string, number> = {
  Aries: 15, Taurus: 8, Gemini: 20, Cancer: 25,
  Leo: 19, Virgo: 20, Libra: 8, Scorpio: 15,
  Sagittarius: 12, Capricorn: 27, Aquarius: 30, Pisces: 12,
};

const TOTAL_YEARS = 129;

const SIGN_COLORS: Record<string, string> = {
  Aries: '#EF4444', Taurus: '#22C55E', Gemini: '#3B82F6', Cancer: '#06B6D4',
  Leo: '#EF4444', Virgo: '#22C55E', Libra: '#3B82F6', Scorpio: '#06B6D4',
  Sagittarius: '#EF4444', Capricorn: '#22C55E', Aquarius: '#3B82F6', Pisces: '#06B6D4',
};

const RULERS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Vesta', Libra: 'Juno', Scorpio: 'Pluto',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune',
};

// ─── Predictive Sign Interpretations for ZR ─────────────────────────────────

const ZR_SIGN_PREDICTIONS: Record<string, string> = {
  Aries: 'A chapter of fierce initiation is unfolding. Expect situations that force you to act decisively — new ventures, confrontations you cannot avoid, and a raw surge of energy that demands you stop waiting and start doing. Someone or something will challenge you directly, and how you respond will define this entire era. Courage is not optional now — it is the entrance fee. A significant first step toward something you have been circling is imminent. Do not overthink it. The window for bold action will not stay open forever.',
  Taurus: 'A period of material consolidation and grounding descends upon your life. Expect financial matters to come into sharper focus — investments, property, income shifts, or a complete reassessment of what you own and what owns you. Relationships deepen into something more tangible; casual connections either become committed or dissolve. Your body will demand attention: health routines, physical pleasures, and the pace at which you move through life all come under review. Something you build or acquire during this period has staying power — choose carefully, because it will be with you for a long time.',
  Gemini: 'Your mind is about to become the main character. Expect an explosion of information, conversations, and decisions that reshape your understanding of your own life. A message, meeting, or piece of knowledge arrives that changes your direction. Contracts, writing projects, and educational pursuits are heavily activated. You may find yourself managing two paths, two relationships, or two identities simultaneously — the duality is not a problem, it is the point. Your adaptability is being tested. Someone younger or a sibling figure may play an unexpectedly pivotal role. Stay sharp — the important signals will come fast and disguised as ordinary moments.',
  Cancer: 'Home, family, and emotional foundations are about to shift beneath you. Expect changes in your living situation, family dynamics, or the emotional architecture of your inner world. A parent, child, or maternal figure becomes central to this chapter. Buried emotions — grief, longing, old wounds from childhood — will surface not to torment you but to finally be resolved. Your need for safety and belonging intensifies, and you will either create the sanctuary you have always wanted or realize that the one you built no longer fits. Trust the ache. It is pointing you toward where you actually belong.',
  Leo: 'The spotlight is turning toward you, and this time it is not leaving. Expect recognition, creative breakthroughs, and situations that put you center-stage whether you planned it or not. A child, romantic interest, or creative project becomes the focal point of this era. Your heart opens wider than it has in years — and with that openness comes both joy and vulnerability. Someone will see the real you, not the performance, and their response will matter deeply. Leadership opportunities arrive, but they require authenticity, not just charisma. What you create during this period carries your soul signature — make it count.',
  Virgo: 'A period of purification, precision, and service-oriented work begins. Expect your daily routines, health practices, and work habits to undergo significant overhaul. Something that has been functioning poorly — a job, a relationship dynamic, your own body — demands that you fix it now, not later. Your analytical gifts sharpen to a razor edge, and you will see exactly what needs to change. A mentor, healer, or service opportunity appears that aligns you with your actual purpose. Perfectionism is your tool and your trap during this time — use it to improve without letting it paralyze you. Small, disciplined actions taken now will compound into something remarkable.',
  Libra: 'Relationships are about to rearrange your life. Expect partnerships — romantic, business, creative, legal — to become the dominant theme. A significant other may enter, deepen, or exit your world in a way that redefines how you understand connection. Contracts, agreements, and legal matters come into focus. You will be confronted with questions of fairness: what you give versus what you receive, what you tolerate versus what you demand. Beauty, art, and aesthetic pursuits are activated. The balance you achieve during this period — or the imbalance you finally correct — sets the tone for everything that follows.',
  Scorpio: 'Something hidden is about to be revealed, and the revelation will change everything. Expect power dynamics to intensify — in relationships, at work, within your own psyche. Secrets come to light. Financial entanglements (debts, inheritances, shared resources) demand attention. An obsession or compulsion reveals itself as either your greatest weakness or your greatest source of power, depending on how you handle it. Sexual and emotional intensity reaches a peak. Someone may betray your trust, or you may discover a truth about yourself that you have been avoiding. This is not a comfortable period — it is a transformative one. What dies now needed to die.',
  Sagittarius: 'Your world is about to get much bigger. Expect opportunities involving travel, education, publishing, or cross-cultural connections that expand your reality beyond its current borders. A teacher, philosophy, or belief system enters your life that permanently alters how you see the world. Legal matters may resolve favorably. Faith — in yourself, in life, in something larger — is being tested and ultimately strengthened. The restlessness you feel is not anxiety; it is your soul recognizing that it has outgrown its current container. Go further than you think is reasonable. The adventure waiting for you is bigger than the plan you made.',
  Capricorn: 'This is the most consequential chapter for your career, public reputation, and long-term ambitions. Expect professional developments that either elevate you to a new level of authority or force you to rebuild your ambitions from the ground up. An authority figure — a boss, parent, or institutional gatekeeper — plays a decisive role. The structures of your life are being stress-tested: what is solid will hold, what is hollow will collapse. This is Saturn territory — nothing is given freely, but what you earn now cannot be taken away. Your patience, discipline, and willingness to sacrifice short-term comfort for long-term legacy determine everything.',
  Aquarius: 'A radical restructuring of your social world, community ties, and future vision is underway. Expect friendships to shift dramatically — some will deepen into lifelong alliances, others will reveal themselves as shallow and fall away. Group dynamics, organizational involvement, and collective causes become central. A sudden insight, invention, or unconventional opportunity appears that has the potential to change your trajectory entirely. Your individuality is both your gift and your challenge: the world needs what only you can offer, but delivering it requires you to stop trying to fit in. The future you envision during this period has a strong chance of actually manifesting.',
  Pisces: 'The veil between your conscious and unconscious mind is dissolving. Expect dreams, synchronicities, and intuitive hits to intensify dramatically. Creative inspiration floods in — music, art, writing, or spiritual practice may become consuming in the best possible way. But confusion and disillusionment are also on the table: something you believed to be true may turn out to be a beautiful illusion. Isolation — chosen or imposed — becomes meaningful during this time. Past lives, karmic patterns, and spiritual lessons come to the surface. The ending of something important is likely, and the grief that follows is the doorway to transcendence. Surrender what you cannot control. The universe is rearranging things in your favor, even when it does not feel that way.',
};

const ZR_PEAK_OVERLAY: Record<string, string> = {
  Aries: 'This is a PEAK period — the fire of initiative reaches maximum intensity. Decisive actions taken now carry amplified consequences. A defining moment of courage or leadership is approaching.',
  Taurus: 'This is a PEAK period — material abundance and relational depth reach their highest potential. Commitments made now have extraordinary staying power. Plant seeds with intention.',
  Gemini: 'This is a PEAK period — communication and intellectual activity reach a crescendo. A pivotal conversation, contract, or piece of information arrives that could not come at any other time.',
  Cancer: 'This is a PEAK period — emotional depth and family connections reach their most potent expression. Healing that was impossible before becomes available now. Open your heart fully.',
  Leo: 'This is a PEAK period — creative power and public visibility peak simultaneously. What you express, create, or perform now has maximum impact. The audience is watching.',
  Virgo: 'This is a PEAK period — your capacity for precision, healing, and meaningful work reaches its zenith. The improvements you make now are permanent. Master the details.',
  Libra: 'This is a PEAK period — partnerships and relational dynamics reach their most significant turning point. The alliance formed or rebalanced now defines this entire chapter.',
  Scorpio: 'This is a PEAK period — transformative power is at maximum intensity. Truths revealed now cannot be unrevealed. The death-rebirth cycle accelerates to its most potent expression.',
  Sagittarius: 'This is a PEAK period — expansion, wisdom, and adventure reach their highest amplitude. The opportunity or insight that arrives now has the power to reshape your entire worldview.',
  Capricorn: 'This is a PEAK period — career authority and public standing reach their most consequential moment. Achievements earned now become permanent pillars of your legacy.',
  Aquarius: 'This is a PEAK period — revolutionary vision and community impact reach their apex. The innovation or collective alignment that crystallizes now can change more than just your life.',
  Pisces: 'This is a PEAK period — spiritual sensitivity and creative transcendence reach their most profound expression. The veil is at its thinnest. What you receive from the unseen world now is genuine.',
};

const ZR_LOOSENING_OVERLAY: Record<string, string> = {
  Aries: 'This is a LOOSENING period — the bonds of structure are relaxing. Expect unpredictability, scattered energy, and events that feel outside your control. Adaptability matters more than force.',
  Taurus: 'This is a LOOSENING period — what felt stable may shift unexpectedly. Financial or relational foundations may wobble. This is not collapse — it is reorganization. Stay flexible.',
  Gemini: 'This is a LOOSENING period — mental clarity gives way to information overload. Plans change rapidly. The story you were telling yourself about your life is being rewritten from an unexpected angle.',
  Cancer: 'This is a LOOSENING period — emotional security feels less certain. Family dynamics may become unpredictable. Old emotional patterns are breaking apart to make room for something more authentic.',
  Leo: 'This is a LOOSENING period — the spotlight shifts or flickers. Creative confidence may waver. This temporary uncertainty is the creative void from which your next genuine expression will emerge.',
  Virgo: 'This is a LOOSENING period — routines break down and details slip. The perfection you were maintaining is no longer sustainable in its current form. Allow the mess — it contains the next evolution.',
  Libra: 'This is a LOOSENING period — relational dynamics become unpredictable. Agreements may need renegotiation. The balance point you thought you found is shifting — a new equilibrium is forming.',
  Scorpio: 'This is a LOOSENING period — control dissolves. Secrets, power dynamics, and hidden agendas become chaotic rather than strategic. Surrender the need to manage everything. Trust the process.',
  Sagittarius: 'This is a LOOSENING period — your direction may feel unclear. Beliefs you held confidently may be questioned. The expansion is still happening, but it is taking a path you did not expect.',
  Capricorn: 'This is a LOOSENING period — structures and career plans may experience unexpected shifts. The ladder you were climbing may be leaning against a different wall. Reassess before rebuilding.',
  Aquarius: 'This is a LOOSENING period — social connections and future plans scatter. The vision you had for your community role is being rearranged. Let the old network dissolve so the right one can form.',
  Pisces: 'This is a LOOSENING period — spiritual clarity gives way to confusion. Dreams and intuitions may be harder to interpret. This fog is temporary — clarity will return, and when it does, it will be deeper than before.',
};

function getZRInterpretation(sign: string, isPeak: boolean, isLoosening: boolean): string {
  let text = ZR_SIGN_PREDICTIONS[sign] || '';
  if (isPeak && ZR_PEAK_OVERLAY[sign]) {
    text += '\n\n' + ZR_PEAK_OVERLAY[sign];
  }
  if (isLoosening && ZR_LOOSENING_OVERLAY[sign]) {
    text += '\n\n' + ZR_LOOSENING_OVERLAY[sign];
  }
  return text;
}

const ZR_SIGN_KEYWORDS: Record<string, string> = {
  Aries: 'bold action and new beginnings', Taurus: 'material consolidation and grounding',
  Gemini: 'pivotal communications and mental expansion', Cancer: 'emotional transformation and family shifts',
  Leo: 'creative visibility and heart-centered leadership', Virgo: 'purification, health, and precise service',
  Libra: 'partnership evolution and relational justice', Scorpio: 'deep transformation and power revelation',
  Sagittarius: 'expansive adventure and philosophical breakthroughs', Capricorn: 'career authority and structural mastery',
  Aquarius: 'revolutionary vision and social restructuring', Pisces: 'spiritual dissolution and transcendent creativity',
};

const ZR_BLENDED_TEMPLATES = [
  (l1: string, l2: string, k1: string, k2: string) =>
    `${l2} now takes the helm within your ${l1} chapter. Where ${l1} sets the stage through ${k1}, ${l2} sharpens the lens toward ${k2}. Events in this sub-period carry both signatures — watch for moments where the broader story advances through distinctly ${l2}-flavored circumstances.`,
  (l1: string, l2: string, k1: string, k2: string) =>
    `Your ${l1} era enters a new gear as ${l2} rises. The overarching current of ${k1} is now expressing itself through ${k2}. This is the window where ${l1}'s long-term narrative moves forward via ${l2}'s specific toolkit — expect tangible shifts in areas you have been watching patiently.`,
  (l1: string, l2: string, k1: string, k2: string) =>
    `Think of ${l1} as the climate and ${l2} as today's weather. The deep themes of ${k1} persist, but daily life now feels like ${k2}. Choices made in this sub-period tend to have outsized impact on how the rest of your ${l1} chapter unfolds.`,
  (l1: string, l2: string, k1: string, k2: string) =>
    `${l2} arrives as a guest in ${l1}'s house, carrying gifts of ${k2}. The ongoing current of ${k1} does not pause — it accelerates, filtered through ${l2}'s lens. Pay attention to the people and openings that appear now; they connect to ${l1}'s bigger story even when they seem unrelated.`,
  (l1: string, l2: string, k1: string, k2: string) =>
    `A turning point within your ${l1} chapter. ${l2} introduces a current of ${k2} into the larger river of ${k1}. This is less a detour and more a deepening — the same life themes, experienced through a different instrument. Let ${l2} show you what ${l1} has been building toward.`,
];

function getBlendedZRInterpretation(l1Sign: string, l2Sign: string): string {
  const k1 = ZR_SIGN_KEYWORDS[l1Sign] || l1Sign;
  const k2 = ZR_SIGN_KEYWORDS[l2Sign] || l2Sign;

  if (l1Sign === l2Sign) {
    return `The ${l1Sign} energy is doubled. The themes of ${k1} reach maximum concentration. This sub-period is the purest expression of your current chapter — expect the defining events of your entire ${l1Sign} era to crystallize now.`;
  }

  const hash = (l1Sign.length * 7 + l2Sign.length * 13) % ZR_BLENDED_TEMPLATES.length;
  return ZR_BLENDED_TEMPLATES[hash](l1Sign, l2Sign, k1, k2);
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface ZRPeriod {
  sign: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  isPeak: boolean;
  isLoosening: boolean;
  level: number;
  subPeriods?: ZRPeriod[];
}

interface NatalPosition {
  name: string;
  longitude: number;
  house: number;
  sign?: string;
  [key: string]: any;
}

interface LevelContext {
  sign: string;
  ruler: string;
  rulerSign: string;
  rulerHouse: number;
  duadSign: string;
  duadHouse: number;
  compSign: string;
  compHouse: number;
  zrHouse: number;
  planetsInHouse: string[];
}

// ─── Calculation Helpers ─────────────────────────────────────────────────────

function addDaysToDate(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setTime(result.getTime() + days * 24 * 60 * 60 * 1000);
  return result;
}

function yearsToDays(years: number): number {
  return years * 365.25;
}

function isPeakSign(signIdx: number, lotSignIdx: number): boolean {
  return (
    signIdx === lotSignIdx ||
    signIdx === (lotSignIdx + 4) % 12 ||
    signIdx === (lotSignIdx + 8) % 12
  );
}

function isLooseningSign(signIdx: number, lotSignIdx: number): boolean {
  const diff = ((signIdx - lotSignIdx) % 12 + 12) % 12;
  return diff === 2 || diff === 5 || diff === 8 || diff === 11;
}

function computeSubPeriods(
  parentSign: string,
  parentStart: Date,
  parentDurationDays: number,
  parentLevel: number,
  lotSignIdx: number,
  now: Date,
): ZRPeriod[] {
  const startSignIdx = SIGNS.indexOf(parentSign);
  const periods: ZRPeriod[] = [];
  let offset = 0;

  for (let i = 0; i < 12; i++) {
    const signIdx = (startSignIdx + i) % 12;
    const sign = SIGNS[signIdx];
    const subDays = (parentDurationDays * SIGN_YEARS[sign]) / TOTAL_YEARS;
    const startDate = addDaysToDate(parentStart, offset);
    const endDate = addDaysToDate(parentStart, offset + subDays);
    const isCurrent = now >= startDate && now < endDate;
    const peak = isPeakSign(signIdx, lotSignIdx);
    const loosening = isLooseningSign(signIdx, lotSignIdx);

    periods.push({ sign, startDate, endDate, isCurrent, isPeak: peak, isLoosening: loosening, level: parentLevel + 1 });
    offset += subDays;
  }

  return periods;
}

function buildL1Periods(lotSignIdx: number, birthDate: Date, now: Date): ZRPeriod[] {
  const periods: ZRPeriod[] = [];
  let currentDate = new Date(birthDate.getTime());

  for (let cycle = 0; cycle < 3; cycle++) {
    for (let i = 0; i < 12; i++) {
      const signIdx = (lotSignIdx + i) % 12;
      const sign = SIGNS[signIdx];
      const years = SIGN_YEARS[sign];
      const durationDays = yearsToDays(years);
      const startDate = new Date(currentDate.getTime());
      const endDate = addDaysToDate(currentDate, durationDays);
      const isCurrent = now >= startDate && now < endDate;
      const peak = isPeakSign(signIdx, lotSignIdx);
      const loosening = isLooseningSign(signIdx, lotSignIdx);

      const subPeriods = computeSubPeriods(sign, startDate, durationDays, 1, lotSignIdx, now);

      subPeriods.forEach((l2) => {
        const l2Days = (l2.endDate.getTime() - l2.startDate.getTime()) / (24 * 60 * 60 * 1000);
        l2.subPeriods = computeSubPeriods(l2.sign, l2.startDate, l2Days, 2, lotSignIdx, now);

        l2.subPeriods.forEach((l3) => {
          const l3Days = (l3.endDate.getTime() - l3.startDate.getTime()) / (24 * 60 * 60 * 1000);
          l3.subPeriods = computeSubPeriods(l3.sign, l3.startDate, l3Days, 3, lotSignIdx, now);
        });
      });

      periods.push({ sign, startDate, endDate, isCurrent, isPeak: peak, isLoosening: loosening, level: 1, subPeriods });
      currentDate = endDate;
      const ageYears = (currentDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      if (ageYears > 120) break;
    }
    const ageYears = (currentDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (ageYears > 120) break;
  }

  return periods;
}

function findCurrentAtLevel(periods: ZRPeriod[]): ZRPeriod | undefined {
  return periods.find((p) => p.isCurrent);
}

// ─── Duad / Compendium Helpers ──────────────────────────────────────────────

function getDuadInfo(longitude: number) {
  const signIdx = Math.floor(longitude / 30) % 12;
  const degInSign = longitude % 30;
  const duadIdx = Math.floor(degInSign / 2.5);
  const duadSignIdx = (signIdx + duadIdx) % 12;
  const duadSign = SIGNS[duadSignIdx];
  const withinDuad = degInSign % 2.5;
  const compIdx = Math.floor(withinDuad / (2.5 / 12));
  const compSignIdx = (duadSignIdx + compIdx) % 12;
  const compSign = SIGNS[compSignIdx];
  return { duadSign, compSign };
}

function buildLevelContext(sign: string, natalPositions: NatalPosition[], houseCusps: number[]): LevelContext {
  const ruler = RULERS[sign] || 'Unknown';
  const rulerPos = natalPositions.find((p) => p.name === ruler);
  const rulerLon = rulerPos?.longitude ?? 0;
  const rulerSign = SIGNS[Math.floor(rulerLon / 30) % 12];
  const rulerHouse = rulerPos?.house ?? 1;
  const { duadSign, compSign } = getDuadInfo(rulerLon);

  const ascSignIdx = Math.floor((houseCusps[0] ?? 0) / 30) % 12;
  const duadHouse = ((SIGNS.indexOf(duadSign) - ascSignIdx + 12) % 12) + 1;
  const compHouse = ((SIGNS.indexOf(compSign) - ascSignIdx + 12) % 12) + 1;

  const zrHouse = ((SIGNS.indexOf(sign) - ascSignIdx + 12) % 12) + 1;
  const planetsInHouse = natalPositions.filter((p) => p.house === zrHouse).map((p) => p.name);

  return { sign, ruler, rulerSign, rulerHouse, duadSign, duadHouse, compSign, compHouse, zrHouse, planetsInHouse };
}

// ─── Format Helpers ──────────────────────────────────────────────────────────

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function fmtDateFull(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getSignColor(sign: string): string {
  return SIGN_COLORS[sign] || '#8B5CF6';
}

// ─── Progress / Lookup / Timeline helpers ──────────────────────────────────

function getZRProgressInfo(period: ZRPeriod) {
  const start = period.startDate.getTime();
  const end = period.endDate.getTime();
  const now = Date.now();
  const totalYears = (end - start) / (365.25 * 24 * 60 * 60 * 1000);
  const elapsedYears = (now - start) / (365.25 * 24 * 60 * 60 * 1000);
  const remainingYears = Math.max(0, (end - now) / (365.25 * 24 * 60 * 60 * 1000));
  const pct = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  return {
    totalYears: Math.round(totalYears * 10) / 10,
    currentYear: Math.min(Math.ceil(elapsedYears), Math.round(totalYears)),
    remainingYears: Math.round(remainingYears * 10) / 10,
    pct,
  };
}

function findZRPeriodForDate(periods: ZRPeriod[], target: Date): { l1?: ZRPeriod; l2?: ZRPeriod; l3?: ZRPeriod; l4?: ZRPeriod } {
  for (const p of periods) {
    if (target >= p.startDate && target < p.endDate) {
      const l2 = p.subPeriods?.find(sp => target >= sp.startDate && target < sp.endDate);
      const l3 = l2?.subPeriods?.find(sp => target >= sp.startDate && target < sp.endDate);
      const l4 = l3?.subPeriods?.find(sp => target >= sp.startDate && target < sp.endDate);
      return { l1: p, l2, l3, l4 };
    }
  }
  return {};
}

function ZRTimelineBar({ periods }: { periods: ZRPeriod[] }) {
  if (!periods.length) return null;
  const now = Date.now();
  const birthTime = periods[0].startDate.getTime();
  const lastRelevantIdx = periods.findIndex(p => {
    const ageAtEnd = (p.endDate.getTime() - birthTime) / (365.25 * 24 * 60 * 60 * 1000);
    return ageAtEnd > 100;
  });
  const displayPeriods = lastRelevantIdx >= 0 ? periods.slice(0, lastRelevantIdx + 1) : periods;

  const totalStart = displayPeriods[0].startDate.getTime();
  const totalEnd = displayPeriods[displayPeriods.length - 1].endDate.getTime();
  const totalSpan = totalEnd - totalStart;
  const nowPct = Math.min(100, Math.max(0, ((now - totalStart) / totalSpan) * 100));

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between text-[10px] text-text-muted mb-1.5">
        <span>{displayPeriods[0].startDate.getFullYear()}</span>
        <span>{displayPeriods[displayPeriods.length - 1].endDate.getFullYear()}</span>
      </div>
      <div className="relative h-8 rounded-full overflow-hidden flex" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
        {displayPeriods.map((p, i) => {
          const pStart = p.startDate.getTime();
          const pEnd = p.endDate.getTime();
          const widthPct = ((pEnd - pStart) / totalSpan) * 100;
          const isPast = pEnd < now;
          const isCurrent = p.isCurrent;
          const color = getSignColor(p.sign);
          return (
            <div
              key={i}
              className="relative h-full flex items-center justify-center group"
              style={{
                width: `${widthPct}%`,
                backgroundColor: isCurrent ? color + '55' : isPast ? color + '20' : color + '15',
                borderRight: i < displayPeriods.length - 1 ? '1px solid rgba(0,0,0,0.3)' : 'none',
              }}
              title={`${p.sign} (${p.startDate.getFullYear()} – ${p.endDate.getFullYear()})`}
            >
              {widthPct > 5 && (
                <span className="text-[9px] font-bold truncate px-0.5" style={{ color: isCurrent ? '#fff' : isPast ? color + '99' : color + '77' }}>
                  {getZodiacGlyph(p.sign)}
                </span>
              )}
            </div>
          );
        })}
        <div
          className="absolute top-0 h-full flex flex-col items-center z-10"
          style={{ left: `${nowPct}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-0.5 h-full bg-white" style={{ boxShadow: '0 0 6px rgba(255,255,255,0.6)' }} />
        </div>
      </div>
      <div className="relative mt-1" style={{ height: '14px' }}>
        <div
          className="absolute text-[9px] font-bold text-white bg-accent-primary px-1.5 py-0.5 rounded whitespace-nowrap"
          style={{ left: `${nowPct}%`, transform: 'translateX(-50%)' }}
        >
          YOU ARE HERE
        </div>
      </div>
    </div>
  );
}

// ─── Copy helper ──────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent-primary transition-colors mt-1"
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
    >
      <Copy className="w-3 h-3" />
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

// ─── Markdown Renderer for AI text ──────────────────────────────────────────

function RenderMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('## ')) {
          return <h2 key={i} className="text-lg font-bold text-gold-primary mt-4 mb-2">{trimmed.replace('## ', '')}</h2>;
        } else if (trimmed.startsWith('### ')) {
          return <h3 key={i} className="text-base font-semibold text-text-primary mt-3 mb-1">{trimmed.replace('### ', '')}</h3>;
        } else if (trimmed.startsWith('---')) {
          return <hr key={i} className="border-border-primary my-3" />;
        } else if (trimmed.startsWith('- ')) {
          return (
            <div key={i} className="flex gap-2 pl-2 mb-1">
              <span className="text-gold-primary">&bull;</span>
              <InlineBold text={trimmed.slice(2)} className="text-text-secondary text-sm leading-relaxed" />
            </div>
          );
        } else if (trimmed.length > 0) {
          return <p key={i} className="text-text-secondary text-sm leading-relaxed mb-1"><InlineBold text={trimmed} /></p>;
        }
        return <div key={i} className="h-2" />;
      })}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ZodiacalReleasingPage() {
  const { profile } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lotType, setLotType] = useState<'fortune' | 'spirit'>('fortune');
  const [chartMode, setChartMode] = useState<'natal' | 'progressed'>('natal');
  const [l1Periods, setL1Periods] = useState<ZRPeriod[]>([]);
  const [lotSign, setLotSign] = useState<string>('');

  const [natalPositions, setNatalPositions] = useState<NatalPosition[]>([]);
  const [houseCusps, setHouseCusps] = useState<number[]>([]);

  const [expandedL1, setExpandedL1] = useState<number | null>(null);
  const [expandedL2, setExpandedL2] = useState<string | null>(null);
  const [expandedL3, setExpandedL3] = useState<string | null>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const [lookupDate, setLookupDate] = useState('');
  const [lookupResult, setLookupResult] = useState<{ l1?: ZRPeriod; l2?: ZRPeriod; l3?: ZRPeriod; l4?: ZRPeriod } | null>(null);

  const firstName = profile?.display_name?.split(' ')[0] || 'Friend';

  const loadData = useCallback(async () => {
    if (!profile?.birth_date || !profile?.latitude) {
      setError('Birth data is required. Please set up your chart first.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const birthData = buildBirthData(profile);
      let lotLon = 0;
      let positions: NatalPosition[] = [];
      let cusps: number[] = [];

      try {
        const natalResponse = await api.getNatalChart(birthData);
        positions = natalResponse.positions || [];
        cusps = natalResponse.house_cusps || natalResponse.cusps || [];

        if (cusps.length === 0) {
          const asc = positions.find((p: any) => p.name === 'Ascendant');
          if (asc) {
            const ascLon = asc.longitude;
            cusps = Array.from({ length: 12 }, (_, i) => (ascLon + i * 30) % 360);
          }
        }

        setNatalPositions(positions);
        setHouseCusps(cusps);

        if (chartMode === 'natal') {
          const lotName = lotType === 'fortune' ? 'Part of Fortune' : 'Part of Spirit';
          const lotPos = positions.find((p: any) => p.name === lotName);
          lotLon = lotPos?.longitude ?? 0;
        }

        if (chartMode === 'progressed') {
          try {
            const now = new Date();
            const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const progressedData = await api.getProgressedChart({
              birth_data: birthData,
              target_date: today,
              progression_type: 'secondary',
            });
            const progPositions = progressedData.positions || [];
            const lotName = lotType === 'fortune' ? 'Part of Fortune' : 'Part of Spirit';
            const progLotPos = progPositions.find((p: any) => p.name === lotName);
            if (progLotPos) lotLon = progLotPos.longitude;
            if (lotLon === 0) {
              const natalLotPos = positions.find((p: any) => p.name === lotName);
              lotLon = natalLotPos?.longitude ?? 0;
            }
          } catch {
            const lotName = lotType === 'fortune' ? 'Part of Fortune' : 'Part of Spirit';
            const lotPos = positions.find((p: any) => p.name === lotName);
            lotLon = lotPos?.longitude ?? 0;
          }
        }
      } catch {}

      // Parse birth date
      const dateStr = profile.birth_date;
      const dateParts = dateStr.split('-');
      let birthYear: number, birthMonth: number, birthDay: number;
      if (dateParts.length === 3) {
        if (parseInt(dateParts[0]) > 31) {
          birthYear = parseInt(dateParts[0]);
          birthMonth = parseInt(dateParts[1]) - 1;
          birthDay = parseInt(dateParts[2]);
        } else {
          birthDay = parseInt(dateParts[0]);
          birthMonth = parseInt(dateParts[1]) - 1;
          birthYear = parseInt(dateParts[2]);
        }
      } else {
        birthYear = new Date().getFullYear() - 30;
        birthMonth = 0;
        birthDay = 1;
      }

      const birthDate = new Date(birthYear, birthMonth, birthDay);
      const startSignIdx = Math.floor(lotLon / 30) % 12;
      const now = new Date();

      const periods = buildL1Periods(startSignIdx, birthDate, now);
      setLotSign(SIGNS[startSignIdx]);
      setL1Periods(periods);

      const currentL1Idx = periods.findIndex((p) => p.isCurrent);
      if (currentL1Idx >= 0) {
        setExpandedL1(currentL1Idx);
        const currentL2Idx = periods[currentL1Idx].subPeriods?.findIndex((p) => p.isCurrent);
        if (currentL2Idx !== undefined && currentL2Idx >= 0) {
          setExpandedL2(`${currentL1Idx}-${currentL2Idx}`);
          const l2Subs = periods[currentL1Idx].subPeriods?.[currentL2Idx]?.subPeriods;
          const currentL3Idx = l2Subs?.findIndex((p) => p.isCurrent);
          if (currentL3Idx !== undefined && currentL3Idx >= 0) {
            setExpandedL3(`${currentL1Idx}-${currentL2Idx}-${currentL3Idx}`);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to calculate Zodiacal Releasing');
    } finally {
      setLoading(false);
    }
  }, [profile, lotType, chartMode]);

  useEffect(() => {
    loadData();
    setExpandedL1(null);
    setExpandedL2(null);
    setExpandedL3(null);
    setAiText('');
  }, [loadData]);

  // Auto-trigger AI reading once data loads
  useEffect(() => {
    if (l1Periods.length === 0 || aiText.length > 0 || aiLoading) return;
    const hasCurrentL1 = l1Periods.some(p => p.isCurrent);
    if (hasCurrentL1) {
      generateReading();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [l1Periods]);

  const handleZRDateLookup = useCallback(() => {
    if (!lookupDate || !l1Periods.length) return;
    const target = new Date(lookupDate);
    const result = findZRPeriodForDate(l1Periods, target);
    setLookupResult(result.l1 ? result : null);
  }, [lookupDate, l1Periods]);

  const progressInfo = useMemo(() => {
    const cp = l1Periods.find(p => p.isCurrent);
    return cp ? getZRProgressInfo(cp) : null;
  }, [l1Periods]);

  // ── Toggle Handlers ──
  const toggleL1 = (idx: number) => {
    setExpandedL1(expandedL1 === idx ? null : idx);
    setExpandedL2(null);
    setExpandedL3(null);
  };
  const toggleL2 = (key: string) => {
    setExpandedL2(expandedL2 === key ? null : key);
    setExpandedL3(null);
  };
  const toggleL3 = (key: string) => {
    setExpandedL3(expandedL3 === key ? null : key);
  };

  // ── AI Reading ──
  const generateReading = useCallback(async () => {
    if (aiLoading) return;
    setAiLoading(true);
    setAiText('');

    const currentL1 = findCurrentAtLevel(l1Periods);
    const currentL2 = currentL1?.subPeriods ? findCurrentAtLevel(currentL1.subPeriods) : undefined;
    const currentL3 = currentL2?.subPeriods ? findCurrentAtLevel(currentL2.subPeriods) : undefined;
    const currentL4 = currentL3?.subPeriods ? findCurrentAtLevel(currentL3.subPeriods) : undefined;

    const formatPeriodInfo = (p: ZRPeriod | undefined, label: string) => {
      if (!p) return `${label}: Not found`;
      const ruler = RULERS[p.sign] || 'Unknown';
      const peak = p.isPeak ? ' (PEAK PERIOD)' : '';
      const loosening = p.isLoosening ? ' (LOOSENING OF THE BOND)' : '';
      return `${label}: ${p.sign} (ruled by ${ruler})${peak}${loosening}\n  From ${fmtDateFull(p.startDate)} to ${fmtDateFull(p.endDate)}`;
    };

    const hasNatalData = natalPositions.length > 0 && houseCusps.length > 0;
    let enhancedContext = '';

    if (hasNatalData) {
      const levels = [
        { period: currentL1, label: 'L1 (Life Chapter)' },
        { period: currentL2, label: 'L2 (Sub-Chapter)' },
        { period: currentL3, label: 'L3 (Micro-Focus)' },
        { period: currentL4, label: 'L4 (Daily Energy)' },
      ];

      enhancedContext = '\n\nDEEPER CHART LAYERS FOR EACH LEVEL:\n';

      for (const { period, label } of levels) {
        if (!period) continue;
        const ctx = buildLevelContext(period.sign, natalPositions, houseCusps);
        enhancedContext += `\n${label} — ${ctx.sign}:
  - House activated: ${ctx.zrHouse}${ctx.planetsInHouse.length > 0 ? ` (contains: ${ctx.planetsInHouse.join(', ')})` : ' (empty house)'}
  - Ruler: ${ctx.ruler} in ${ctx.rulerSign}, house ${ctx.rulerHouse}
  - Deeper layer 1: ${ctx.duadSign} energy (house ${ctx.duadHouse})
  - Deeper layer 2: ${ctx.compSign} energy (house ${ctx.compHouse})`;
      }
    }

    const systemPrompt = `You are a master Hellenistic astrologer specializing in Zodiacal Releasing, the most powerful predictive timing technique from Vettius Valens. You provide deeply personal, insightful readings about the person's current life chapter based on their active zodiacal releasing periods.

You understand the four levels of zodiacal releasing:
- Level 1 (L1): The major life chapter — lasting years.
- Level 2 (L2): The sub-chapter — lasting months to a couple years.
- Level 3 (L3): The micro-period — lasting weeks to months.
- Level 4 (L4): The daily energy — lasting days to weeks.

PEAK periods occur when the releasing sign is the same as the Lot sign or in trine to it.
LOOSENING OF THE BOND occurs when the sign is cadent relative to the Lot sign.

IMPORTANT: Do NOT use the words "duad" or "compendium". Use the person's first name throughout. Make the reading feel like a personal consultation. Around 600-900 words.`;

    const lotLabel = lotType === 'fortune' ? 'Lot of Fortune (career, body, material life)' : 'Lot of Spirit (mind, intellect, actions, authority)';
    const modeLabel = chartMode === 'progressed' ? ' (using Progressed chart positions)' : '';

    const userPrompt = `Please interpret the current Zodiacal Releasing periods for ${firstName}.

Releasing from the ${lotLabel}${modeLabel}, starting in ${lotSign}.

CURRENT ACTIVE PERIODS:
${formatPeriodInfo(currentL1, 'Level 1 (Life Chapter)')}
${formatPeriodInfo(currentL2, 'Level 2 (Sub-Chapter)')}
${formatPeriodInfo(currentL3, 'Level 3 (Micro-Focus)')}
${formatPeriodInfo(currentL4, 'Level 4 (Daily Energy)')}
${enhancedContext}

Please provide a reading that covers:
1. A warm personal greeting to ${firstName}
2. The current life chapter theme (L1)
3. The current sub-theme (L2)
4. The current micro-focus (L3)
5. The current daily energy (L4)
6. Whether any level is in a peak period or loosening of the bond
7. Practical advice
8. An empowering closing`;

    try {
      await api.streamAIInterpretation(
        {
          type: 'zodiacal_releasing',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 4096,
        },
        (chunk) => setAiText((prev) => prev + chunk),
        () => {},
      );
    } catch {
      setAiText(`## Your Current Zodiacal Releasing Phase\n\nHey ${firstName}, here is a snapshot of your current timing periods:\n\n${currentL1 ? `### Life Chapter: ${currentL1.sign}\nYou are in a **${currentL1.sign}** major period${currentL1.isPeak ? ' — this is a **peak period**' : ''}${currentL1.isLoosening ? ' — this is a **loosening of the bond**' : ''}. ${currentL1.sign} is ruled by **${RULERS[currentL1.sign]}**.\n` : ''}\n${currentL2 ? `### Current Focus: ${currentL2.sign}\nYour L2 sub-period is in **${currentL2.sign}**${currentL2.isPeak ? ' (peak)' : ''}${currentL2.isLoosening ? ' (loosening)' : ''}, ruled by **${RULERS[currentL2.sign]}**.\n` : ''}\n---\n\n*For a more detailed AI-powered reading, please check your connection and try again.*`);
    } finally {
      setAiLoading(false);
    }
  }, [l1Periods, lotType, lotSign, firstName, aiLoading, natalPositions, houseCusps, chartMode]);

  // ── Render ──

  if (!profile?.birth_date || !profile?.latitude) {
    return (
      <PaywallGate feature="zodiacal_releasing" fallbackTier="pro">
        <BirthDataPrompt message="Add your birth data to calculate Zodiacal Releasing periods." />
      </PaywallGate>
    );
  }

  if (loading) {
    return (
      <PaywallGate feature="zodiacal_releasing" fallbackTier="pro">
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
          <p className="text-text-tertiary mt-4">Calculating periods...</p>
        </div>
      </PaywallGate>
    );
  }

  if (error) {
    return (
      <PaywallGate feature="zodiacal_releasing" fallbackTier="pro">
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-20">
          <p className="text-red-400 text-center mb-4">{error}</p>
          <button onClick={loadData} className="btn-primary">Retry</button>
        </div>
      </PaywallGate>
    );
  }

  const currentL1 = findCurrentAtLevel(l1Periods);
  const currentL2 = currentL1?.subPeriods ? findCurrentAtLevel(currentL1.subPeriods) : undefined;
  const currentL3 = currentL2?.subPeriods ? findCurrentAtLevel(currentL2.subPeriods) : undefined;
  const currentL4 = currentL3?.subPeriods ? findCurrentAtLevel(currentL3.subPeriods) : undefined;

  const now = new Date();

  return (
    <PaywallGate feature="zodiacal_releasing" fallbackTier="pro">
      <div className="max-w-3xl mx-auto">
        <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Readings
        </Link>

        <h1 className="text-2xl font-display font-bold text-text-primary">
          {chartMode === 'progressed' ? 'Progressed Zodiacal Releasing' : 'Zodiacal Releasing'}
        </h1>
        <p className="text-text-tertiary text-sm mb-4">
          Hellenistic time-lord technique for career and life direction
        </p>

        {/* Lot Type Toggle */}
        <div className="flex bg-bg-secondary rounded-full p-1 mb-2">
          <button
            className={`flex-1 py-2 text-sm text-center rounded-full transition-colors ${lotType === 'fortune' ? 'bg-accent-primary text-white font-semibold' : 'text-text-muted'}`}
            onClick={() => setLotType('fortune')}
          >
            Lot of Fortune
          </button>
          <button
            className={`flex-1 py-2 text-sm text-center rounded-full transition-colors ${lotType === 'spirit' ? 'bg-accent-primary text-white font-semibold' : 'text-text-muted'}`}
            onClick={() => setLotType('spirit')}
          >
            Lot of Spirit
          </button>
        </div>

        {/* Chart Mode Toggle: Natal / Progressed */}
        <div className="flex rounded-full p-1 mb-6" style={{ backgroundColor: 'rgba(180,130,50,0.12)' }}>
          <button
            className={`flex-1 py-2 text-sm text-center rounded-full transition-colors ${chartMode === 'natal' ? 'text-white font-bold' : 'font-medium'}`}
            style={chartMode === 'natal' ? { backgroundColor: '#B8860B', color: '#fff' } : { color: '#B8860B' }}
            onClick={() => setChartMode('natal')}
          >
            Natal
          </button>
          <button
            className={`flex-1 py-2 text-sm text-center rounded-full transition-colors ${chartMode === 'progressed' ? 'text-white font-bold' : 'font-medium'}`}
            style={chartMode === 'progressed' ? { backgroundColor: '#B8860B', color: '#fff' } : { color: '#B8860B' }}
            onClick={() => setChartMode('progressed')}
          >
            Progressed
          </button>
        </div>

        {/* Onboarding Intro */}
        {showIntro && (
          <div className="rounded-xl p-4 border border-accent-primary/20 bg-accent-primary/5 mb-6 relative">
            <button
              onClick={() => setShowIntro(false)}
              className="absolute top-2 right-3 text-text-muted hover:text-text-primary text-lg leading-none"
              aria-label="Dismiss"
            >&times;</button>
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-accent-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-text-primary mb-1">What is Zodiacal Releasing?</p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Zodiacal Releasing is a Hellenistic timing technique from Vettius Valens that divides your life into sign-based chapters. Released from the <strong>Lot of Fortune</strong>, it tracks career, body, and material life. From the <strong>Lot of Spirit</strong>, it tracks mind, intellect, and personal authority. <strong>Peak periods</strong> (signs in trine to your Lot) are your power windows — when life delivers its biggest opportunities. <strong>Loosening of the Bond</strong> (cadent signs) shakes things up and forces adaptation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Visual Timeline */}
        {l1Periods.length > 0 && <ZRTimelineBar periods={l1Periods} />}

        {/* Date Lookup */}
        <div className="rounded-xl p-4 border border-border-primary bg-bg-tertiary mb-6">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CalendarSearch className="w-3.5 h-3.5" />
            Date Lookup
          </p>
          <p className="text-[11px] text-text-muted mb-3">What ZR period were you in on any date?</p>
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={lookupDate}
              onChange={(e) => { setLookupDate(e.target.value); setLookupResult(null); }}
              className="flex-1 text-sm bg-bg-secondary border border-border-primary rounded-lg px-3 py-1.5 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
            />
            <button
              onClick={handleZRDateLookup}
              disabled={!lookupDate}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-accent-primary/20 text-accent-primary hover:bg-accent-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Look Up
            </button>
          </div>
          {lookupResult && lookupResult.l1 && (
            <div className="mt-3 p-3 rounded-lg border border-border-primary bg-bg-secondary">
              <p className="text-xs text-text-muted mb-1">On {fmtDateFull(new Date(lookupDate))}:</p>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ color: getSignColor(lookupResult.l1.sign) }}>{getZodiacGlyph(lookupResult.l1.sign)}</span>
                <span className="text-sm font-semibold text-text-primary">L1: {lookupResult.l1.sign}</span>
                {lookupResult.l1.isPeak && <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">PEAK</span>}
                {lookupResult.l1.isLoosening && <span className="text-[10px] font-bold bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded">LOOSENING</span>}
              </div>
              {lookupResult.l2 && (
                <div className="flex items-center gap-2 mb-1 ml-3">
                  <span style={{ color: getSignColor(lookupResult.l2.sign) }}>{getZodiacGlyph(lookupResult.l2.sign)}</span>
                  <span className="text-xs font-medium text-text-secondary">L2: {lookupResult.l2.sign}</span>
                  {lookupResult.l2.isPeak && <span className="text-[9px] text-yellow-400">&#11088;</span>}
                  {lookupResult.l2.isLoosening && <span className="text-[9px] text-red-400">&#8635;</span>}
                </div>
              )}
              {lookupResult.l3 && (
                <div className="flex items-center gap-2 mb-1 ml-6">
                  <span style={{ color: getSignColor(lookupResult.l3.sign) }}>{getZodiacGlyph(lookupResult.l3.sign)}</span>
                  <span className="text-[11px] font-medium text-text-secondary">L3: {lookupResult.l3.sign}</span>
                </div>
              )}
              {lookupResult.l4 && (
                <div className="flex items-center gap-2 ml-9">
                  <span style={{ color: getSignColor(lookupResult.l4.sign) }}>{getZodiacGlyph(lookupResult.l4.sign)}</span>
                  <span className="text-[11px] font-medium text-text-muted">L4: {lookupResult.l4.sign}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Current Period Highlight Card */}
        {currentL1 && (
          <div className="rounded-2xl p-6 border border-accent-muted mb-6" style={{ background: `linear-gradient(135deg, ${getSignColor(currentL1.sign)}22, rgba(139,92,246,0.03))` }}>
            <div className="inline-block bg-accent-muted rounded px-2 py-0.5 mb-4">
              <span className="text-[10px] font-bold text-accent-secondary tracking-wider uppercase">CURRENT PERIODS</span>
            </div>

            {/* L1 */}
            <div className="flex items-center gap-3">
              <span className="text-4xl" style={{ color: getSignColor(currentL1.sign) }}>{getZodiacGlyph(currentL1.sign)}</span>
              <div className="flex-1">
                <p className="text-lg font-bold text-text-primary">L1: {currentL1.sign}</p>
                <p className="text-xs text-text-tertiary">{fmtDateFull(currentL1.startDate)} &mdash; {fmtDateFull(currentL1.endDate)}</p>
              </div>
              {currentL1.isPeak && <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">PEAK</span>}
              {currentL1.isLoosening && <span className="text-[10px] font-bold bg-red-500/15 text-red-400 px-2 py-0.5 rounded">LOOSENING</span>}
            </div>

            {/* Progress bar */}
            {progressInfo && (
              <div className="mt-3 mb-3">
                <div className="flex items-center justify-between text-[11px] text-text-muted mb-1">
                  <span>Year {progressInfo.currentYear} of {progressInfo.totalYears}</span>
                  <span>{progressInfo.remainingYears} years remaining</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${progressInfo.pct}%`,
                      backgroundColor: getSignColor(currentL1.sign),
                    }}
                  />
                </div>
              </div>
            )}

            <p className="text-sm text-text-secondary leading-relaxed mt-3">{getZRInterpretation(currentL1.sign, currentL1.isPeak, currentL1.isLoosening)}</p>
            <CopyBtn text={getZRInterpretation(currentL1.sign, currentL1.isPeak, currentL1.isLoosening)} />

            {/* L2 */}
            {currentL2 && (
              <div className="mt-3 pt-3 border-t border-border-primary">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" style={{ color: getSignColor(currentL2.sign) }}>{getZodiacGlyph(currentL2.sign)}</span>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-text-secondary">L2: {currentL2.sign}</p>
                    <p className="text-xs text-text-tertiary">{fmtDateFull(currentL2.startDate)} &mdash; {fmtDateFull(currentL2.endDate)}</p>
                  </div>
                  {currentL2.isPeak && <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">PEAK</span>}
                  {currentL2.isLoosening && <span className="text-[10px] font-bold bg-red-500/15 text-red-400 px-2 py-0.5 rounded">LOOSENING</span>}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed mt-2 italic">{getBlendedZRInterpretation(currentL1.sign, currentL2.sign)}</p>
                <CopyBtn text={getBlendedZRInterpretation(currentL1.sign, currentL2.sign)} />
              </div>
            )}

            {/* L3 */}
            {currentL3 && currentL2 && (
              <div className="mt-3 pt-3 border-t border-border-primary">
                <div className="flex items-center gap-3">
                  <span className="text-xl" style={{ color: getSignColor(currentL3.sign) }}>{getZodiacGlyph(currentL3.sign)}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-secondary">L3: {currentL3.sign}</p>
                    <p className="text-xs text-text-tertiary">{fmtDateFull(currentL3.startDate)} &mdash; {fmtDateFull(currentL3.endDate)}</p>
                  </div>
                  {currentL3.isPeak && <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">PEAK</span>}
                  {currentL3.isLoosening && <span className="text-[10px] font-bold bg-red-500/15 text-red-400 px-2 py-0.5 rounded">LOOSENING</span>}
                </div>
                <p className="text-xs text-text-muted leading-relaxed mt-1 italic">{getBlendedZRInterpretation(currentL2.sign, currentL3.sign)}</p>
              </div>
            )}

            {/* L4 */}
            {currentL4 && currentL3 && (
              <div className="mt-3 pt-3 border-t border-border-primary">
                <div className="flex items-center gap-3">
                  <span className="text-lg" style={{ color: getSignColor(currentL4.sign) }}>{getZodiacGlyph(currentL4.sign)}</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-text-tertiary">L4: {currentL4.sign}</p>
                    <p className="text-xs text-text-tertiary">{fmtDateFull(currentL4.startDate)} &mdash; {fmtDateFull(currentL4.endDate)}</p>
                  </div>
                  {currentL4.isPeak && <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">PEAK</span>}
                  {currentL4.isLoosening && <span className="text-[10px] font-bold bg-red-500/15 text-red-400 px-2 py-0.5 rounded">LOOSENING</span>}
                </div>
                <p className="text-xs text-text-muted leading-relaxed mt-1 italic">{getBlendedZRInterpretation(currentL3.sign, currentL4.sign)}</p>
              </div>
            )}

            {/* Inline AI Reading */}
            {(aiLoading || aiText.length > 0) && (
              <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: 'rgba(139,92,246,0.08)', borderColor: 'rgba(139,92,246,0.25)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-accent-primary">
                    {aiLoading && aiText.length === 0 ? 'Channeling your phase reading…' : 'Your Phase Reading'}
                  </span>
                  {aiLoading && aiText.length > 0 && <Loader2 className="w-4 h-4 animate-spin text-accent-primary" />}
                </div>
                {aiText.length > 0 && (
                  <>
                    <RenderMarkdown text={aiText} />
                    <CopyBtn text={aiText} />
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* L1 Timeline */}
        <h3 className="text-lg font-bold text-text-primary mt-6 mb-1">Level 1 Periods</h3>
        <p className="text-xs text-text-muted mb-3">Tap a period to expand sub-periods</p>

        <div className="space-y-2">
          {l1Periods.map((l1, l1Idx) => {
            const isPast = l1.endDate < now && !l1.isCurrent;
            const signColor = getSignColor(l1.sign);
            const isExpanded = expandedL1 === l1Idx;

            const isFuture = !l1.isCurrent && !isPast;

            return (
              <div key={`l1-${l1Idx}`}>
                {/* L1 Card */}
                <button
                  className={`w-full text-left rounded-xl border transition-all ${l1.isCurrent ? 'border-accent-primary/50' : 'border-border-primary'}`}
                  style={{
                    background: l1.isCurrent
                      ? `linear-gradient(90deg, ${signColor}33, ${signColor}11)`
                      : isPast
                      ? 'rgba(255,255,255,0.015)'
                      : `linear-gradient(90deg, ${signColor}12, ${signColor}06)`,
                    borderColor: l1.isCurrent ? undefined : isPast ? 'rgba(255,255,255,0.04)' : undefined,
                    borderLeftWidth: l1.isCurrent ? 3 : isFuture ? 2 : 1,
                    borderLeftColor: l1.isCurrent ? signColor : isFuture ? signColor + '55' : undefined,
                  }}
                  onClick={() => toggleL1(l1Idx)}
                >
                  <div className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl w-8 text-center" style={{ color: l1.isCurrent ? signColor : isPast ? 'rgba(255,255,255,0.3)' : signColor + 'AA' }}>
                        {getZodiacGlyph(l1.sign)}
                      </span>
                      <div className="flex-1">
                        <p className={`text-sm ${l1.isCurrent ? 'text-text-primary font-bold' : isPast ? 'text-text-muted line-through decoration-1' : 'text-text-primary font-medium'}`}>
                          {l1.sign}
                          {isPast && <span className="text-[10px] font-normal no-underline ml-2 text-text-muted">(past)</span>}
                          {isFuture && <span className="text-[10px] font-normal ml-2 text-text-muted">(upcoming)</span>}
                        </p>
                        <p className={`text-xs ${isPast ? 'text-text-muted' : 'text-text-tertiary'}`}>{fmtDate(l1.startDate)} &mdash; {fmtDate(l1.endDate)}</p>
                      </div>
                      {l1.isPeak && <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: signColor + '33', color: signColor }}>&#11088; Peak</span>}
                      {l1.isLoosening && <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">&#8635; Loosening</span>}
                      {l1.isCurrent && <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: signColor }} />}
                      <span className="text-text-muted text-xs ml-1">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                    <p className={`text-xs mt-1 px-1 ${isPast ? 'text-text-muted/60' : 'text-text-muted'} ${isExpanded ? '' : 'line-clamp-2'}`}>
                      {ZR_SIGN_PREDICTIONS[l1.sign] || ''}
                    </p>
                    <CopyBtn text={ZR_SIGN_PREDICTIONS[l1.sign] || ''} />
                  </div>
                </button>

                {/* L2 Sub-periods */}
                {isExpanded && l1.subPeriods && (
                  <div className="ml-4 mt-1 space-y-1">
                    {l1.subPeriods.map((l2, l2Idx) => {
                      const l2Key = `${l1Idx}-${l2Idx}`;
                      const l2Past = l2.endDate < now && !l2.isCurrent;
                      const l2Color = getSignColor(l2.sign);
                      const l2Expanded = expandedL2 === l2Key;

                      return (
                        <div key={`l2-${l2Key}`}>
                          <button
                            className={`w-full text-left rounded-lg border p-2.5 bg-bg-secondary transition-all ${l2.isCurrent ? 'border-accent-primary/50' : 'border-border-primary'} ${l2Past ? 'opacity-50' : ''}`}
                            onClick={() => toggleL2(l2Key)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg w-7 text-center" style={{ color: l2Color }}>{getZodiacGlyph(l2.sign)}</span>
                              <div className="flex-1">
                                <p className={`text-sm ${l2.isCurrent ? 'text-text-primary font-bold' : 'text-text-secondary font-medium'}`}>{l2.sign}</p>
                                <p className="text-[11px] text-text-muted">{fmtDateFull(l2.startDate)} &mdash; {fmtDateFull(l2.endDate)}</p>
                              </div>
                              {l2.isPeak && <span className="text-[10px]" style={{ color: l2Color }}>&#11088;</span>}
                              {l2.isLoosening && <span className="text-[10px] text-red-400">&#8635;</span>}
                              {l2.isCurrent && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l2Color }} />}
                              <span className="text-text-muted text-[10px]">{l2Expanded ? '▲' : '▼'}</span>
                            </div>
                            <p className={`text-xs text-text-muted mt-1 ml-9 ${l2Expanded ? '' : 'line-clamp-2'}`}>
                              {getBlendedZRInterpretation(l1.sign, l2.sign)}
                            </p>
                            <div className="ml-9"><CopyBtn text={getBlendedZRInterpretation(l1.sign, l2.sign)} /></div>
                          </button>

                          {/* L3 Sub-periods */}
                          {l2Expanded && l2.subPeriods && (
                            <div className="ml-5 mt-1 space-y-1">
                              {l2.subPeriods.map((l3, l3Idx) => {
                                const l3Key = `${l1Idx}-${l2Idx}-${l3Idx}`;
                                const l3Past = l3.endDate < now && !l3.isCurrent;
                                const l3Color = getSignColor(l3.sign);
                                const l3Expanded = expandedL3 === l3Key;

                                return (
                                  <div key={`l3-${l3Key}`}>
                                    <button
                                      className={`w-full text-left rounded-md border p-2 bg-bg-tertiary transition-all ${l3.isCurrent ? 'border-accent-primary/50' : 'border-border-primary'} ${l3Past ? 'opacity-50' : ''}`}
                                      onClick={() => toggleL3(l3Key)}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="text-base w-6 text-center" style={{ color: l3Color }}>{getZodiacGlyph(l3.sign)}</span>
                                        <div className="flex-1">
                                          <p className={`text-xs ${l3.isCurrent ? 'text-text-primary font-semibold' : 'text-text-tertiary font-medium'}`}>{l3.sign}</p>
                                          <p className="text-[10px] text-text-muted">{fmtDateFull(l3.startDate)} &mdash; {fmtDateFull(l3.endDate)}</p>
                                        </div>
                                        {l3.isPeak && <span className="text-[10px]" style={{ color: l3Color }}>&#11088;</span>}
                                        {l3.isLoosening && <span className="text-[10px] text-red-400">&#8635;</span>}
                                        {l3.isCurrent && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: l3Color }} />}
                                        <span className="text-text-muted text-[9px]">{l3Expanded ? '▲' : '▼'}</span>
                                      </div>
                                    </button>

                                    {/* L4 Sub-periods */}
                                    {l3Expanded && l3.subPeriods && (
                                      <div className="ml-7 mt-1 space-y-0.5">
                                        {l3.subPeriods.map((l4, l4Idx) => {
                                          const l4Past = l4.endDate < now && !l4.isCurrent;
                                          const l4Color = getSignColor(l4.sign);

                                          return (
                                            <div
                                              key={`l4-${l3Key}-${l4Idx}`}
                                              className={`rounded border p-2 transition-all ${l4.isCurrent ? 'border-accent-primary/50' : 'border-border-primary'} ${l4Past ? 'opacity-50' : ''}`}
                                              style={{ backgroundColor: 'var(--bg-card, rgba(30,30,40,0.5))' }}
                                            >
                                              <div className="flex items-center gap-2">
                                                <span className="text-sm w-5 text-center" style={{ color: l4Color }}>{getZodiacGlyph(l4.sign)}</span>
                                                <div className="flex-1">
                                                  <p className={`text-xs ${l4.isCurrent ? 'text-text-primary font-semibold' : 'text-text-muted'}`}>{l4.sign}</p>
                                                  <p className="text-[10px] text-text-muted">{fmtDateFull(l4.startDate)} &mdash; {fmtDateFull(l4.endDate)}</p>
                                                </div>
                                                {l4.isPeak && <span className="text-[10px]" style={{ color: l4Color }}>&#11088;</span>}
                                                {l4.isLoosening && <span className="text-[10px] text-red-400">&#8635;</span>}
                                                {l4.isCurrent && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: l4Color }} />}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="h-16" />
      </div>
    </PaywallGate>
  );
}
