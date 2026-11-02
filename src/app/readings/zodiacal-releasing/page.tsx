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
  Aries: 'You start things in this chapter, and you start them before you feel ready. Within the first couple of years you quit, confront or launch the thing you have been circling, and it costs you something: a friendship, a routine, your reputation for being easygoing. You get short with people who move slowly, win arguments you should have dropped and regret about half of them. Spend the speed on one project you can actually finish.',
  Taurus: 'Money and your body take most of your attention. You add up what you own, notice what you pay for and never use, and finally buy or refuse the big thing: a home, a car, a raise, a debt payoff. Relationships get one test, which is whether you will still be there in two years. What you build now stays. The cost is that you dig in, stay in a job or a bed too long because leaving is a hassle, and call it loyalty.',
  Gemini: 'Your phone, inbox and conversations run your days. You juggle two plans, two jobs or two people, and say yes to both until one of them calls you on it. One message or contract that looks like small talk sends you somewhere you did not plan to go. You learn fast and finish little, so the cost is a pile of half-read books and unanswered messages. Pick one thing to complete every quarter.',
  Cancer: 'Home gets loud. You move, renovate, take someone in or end up back near family, and a parent or a child becomes the person your schedule bends around. Old childhood feelings come up at the dinner table over small things, a tone of voice or a comment about food, and you react harder than the moment deserves. You stop pretending the house you grew up in did not shape you. The cost is whole weekends spent managing other people\'s moods and calling it care.',
  Leo: 'People start looking at you: at work, online, at a party where you had no plan to speak. You get asked to lead, perform or front something, and the pull is to do it perfectly instead of honestly. A child, a lover or a project of yours becomes the center of your week, and you pour in more time and money than you admit. You get seen for what you made. The cost is that you sulk when praise goes to someone else and you hate being corrected in front of people.',
  Virgo: 'Your routines fall apart and you rebuild them. A health problem you ignored, a job that eats your evenings or a household system that never worked gets fixed because you can no longer put it off. You notice every flaw in other people\'s work and say it out loud, which costs you goodwill at work or a friend. Small habits started now still hold in ten years. The cost is that you work longer than anyone asked and still feel behind.',
  Libra: 'One partner decides the shape of your life: a marriage, a business partner, a cofounder or an opponent in a lawsuit. You find out how much you give compared with what you get, and by the time you say it you are tired from keeping the peace. You choose what to wear and what to say by who is in the room, then wonder who you are when you are alone. You can end up with a deal that is actually fair. The cost is the months you spend dodging one conversation, hoping the other person starts it.',
  Scorpio: 'Something you kept private comes out, a debt, a secret, a lover or your own motive, and you handle it badly the first time. Money tied to other people, such as loans, joint accounts, an inheritance or tax, takes over your attention. You test people, check phones, go quiet to see who notices, and lose some who would have stayed if you had simply asked. You finally cut what was draining you. The cost is a year or two in which you trust almost nobody.',
  Sagittarius: 'You leave your usual circle. A trip, a course, a move abroad or a new belief pulls you out of your routine, and something you were certain of gets argued down by someone you meet. You say yes to the big plan and skip the small print, so visas, fees and contracts catch you. Your life ends up wider than you planned. The cost is a pile of promises to people at home that you make while excited and break while bored.',
  Capricorn: 'Work and standing are the main story, and nobody hands you anything. A boss, a parent or an institution decides whether you move up, and you are judged on what you finish, not on what you promise. You turn down invitations and sleep less to hit a target, and some people stop asking. You come out with a title, an income or a reputation that lasts for decades. The cost is waking up one day with the career built and no one to tell.',
  Aquarius: 'Your friend list gets rearranged. You join a group, a team or an online community, and within a year two or three old friends drop away because they stopped fitting what you want. An idea you cannot put down, a piece of tech, a cause or an odd side project, takes hours from your week. You say you need space right as someone gets close. You end up with a circle that shares your goals. The cost is being the person who is always at the meeting and never at the birthday.',
  Pisces: 'Your sleep, your dreams and your energy get strange. You need more time alone, you lose hours to music, a screen or a drink, and you cannot always say where the day went. Someone you believed in turns out to be less than you thought, and what you learn from that is worth the disappointment. You make something, a song, a photograph, a practice, that you cannot explain. The cost is a stretch of dodging bills, calls and decisions because you cannot face them.',
};

const ZR_PEAK_OVERLAY: Record<string, string> = {
  Aries: 'This is a PEAK period: your decisions land hard. What you start or say now is what people remember in ten years, so pick the fight or the launch that is worth that.',
  Taurus: 'This is a PEAK period: money and commitments stick. What you sign, buy or promise now is still yours, or still owed, a decade on, so read the paperwork twice.',
  Gemini: 'This is a PEAK period: one conversation, contract or message does more than the rest of the year combined. Reply fast; the one you leave on read is the one that mattered.',
  Cancer: 'This is a PEAK period: a family conversation you have avoided becomes possible, and it goes better than your fear says. Make the call or take the visit this year, not next.',
  Leo: 'This is a PEAK period: what you make or perform is seen by more people than ever. Post it, show it or say it in public now, and accept that the first reaction will sting.',
  Virgo: 'This is a PEAK period: the habits you set now last for years. Fix the health, money or work system you have been patching, and do not wait for a free week to start.',
  Libra: 'This is a PEAK period: one partnership gets settled for years: signed, ended or rebalanced. Say what you want from it out loud before the other person says it for you.',
  Scorpio: 'This is a PEAK period: a truth comes out and cannot be put back. Say the difficult thing yourself, first, instead of waiting to be found out.',
  Sagittarius: 'This is a PEAK period: the trip, course or idea you say yes to now changes what you believe about your life. Book it before you talk yourself out of it.',
  Capricorn: 'This is a PEAK period: your work is judged on the record you have built. A promotion, a title or a public failure is on the table, and it depends on what you finished, not what you planned.',
  Aquarius: 'This is a PEAK period: your group or your idea reaches people you do not know. Go public with it, and expect a few old friends to be less excited than strangers.',
  Pisces: 'This is a PEAK period: your intuition is loud and your boundaries are thin. Write the dream down, make the thing, and do not lend money or make promises to anyone in the same week.',
};

const ZR_LOOSENING_OVERLAY: Record<string, string> = {
  Aries: 'This is a LOOSENING period: your drive misfires. Plans stall, you snap at the wrong person and projects start and stop. Do the small, finishable jobs and leave the big launch for later.',
  Taurus: 'This is a LOOSENING period: money or a relationship you counted on wobbles. A bill, a job worry or a partner cooling off makes you grip harder, which makes it worse. Cut one expense and ask one honest question.',
  Gemini: 'This is a LOOSENING period: your inbox, calendar and plans multiply and break. You double-book, lose a message that mattered and change your story mid-sentence. Write down every commitment.',
  Cancer: 'This is a LOOSENING period: home feels less safe. A family member is unpredictable and old feelings come out sideways. Keep one routine at home that never changes.',
  Leo: 'This is a LOOSENING period: the praise dips and you take it personally. You hold back from posting, pitching or performing. Do it anyway at a smaller scale, and stop checking the numbers.',
  Virgo: 'This is a LOOSENING period: routines slip and details get missed. You are late with something you are usually early on. Lower the standard on the unimportant tasks so the important ones get done.',
  Libra: 'This is a LOOSENING period: an agreement needs renegotiating, and a partner says the thing they have held back. Read the terms again and ask for what you want, not for peace.',
  Scorpio: 'This is a LOOSENING period: you cannot control who knows what. A secret or a plan leaks and you want to punish someone. Do not send the message you write at midnight.',
  Sagittarius: 'This is a LOOSENING period: your sense of direction goes. A belief you held gets questioned, a trip falls through or a plan moves. Keep the commitments you already made and delay the big new one.',
  Capricorn: 'This is a LOOSENING period: your career plan moves under you. A boss changes, a role vanishes or the ladder you were climbing turns out to lean on the wrong wall. Update your CV and check your savings before you decide.',
  Aquarius: 'This is a LOOSENING period: your circle scatters. Group chats go quiet and a plan with friends falls through. Reach out to two people one-to-one instead of waiting for the group.',
  Pisces: 'This is a LOOSENING period: you cannot tell what is real. Dreams are muddy, a person is not who they said they were and you drift. Sleep, eat, and make no major decision until it clears.',
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
  Aries: 'starting things fast and picking fights', Taurus: 'money, property and your body',
  Gemini: 'messages, deals and juggling two plans', Cancer: 'home, family and old feelings',
  Leo: 'being seen and making things', Virgo: 'fixing routines, health and work',
  Libra: 'partners, contracts and fairness', Scorpio: 'secrets, shared money and trust',
  Sagittarius: 'travel, study and big beliefs', Capricorn: 'work, rank and reputation',
  Aquarius: 'friends, groups and odd ideas', Pisces: 'sleep, solitude and escape',
};

const ZR_BLENDED_TEMPLATES = [
  (l1: string, l2: string, k1: string, k2: string) =>
    `For this sub-period, ${l2} matters more than ${l1} day to day. The background is still ${k1}, but what you actually deal with is ${k2}. Look back over the last few months: the thing that keeps coming up is the ${l2} part, and you keep tripping over it until you handle it.`,
  (l1: string, l2: string, k1: string, k2: string) =>
    `Your ${l1} chapter has a ${l2} stretch inside it. The main plot of ${k1} keeps going, and a side plot of ${k2} takes your evenings and your attention. The cost is that the ${l1} business you were doing slows down while you chase this one.`,
  (l1: string, l2: string, k1: string, k2: string) =>
    `Think of ${l1} as the climate and ${l2} as today's weather. ${k1} is the long-term subject, and ${k2} is what you argue about, pay for or lose sleep over this week. What you decide in this sub-period sets the course for the rest of your ${l1} chapter, so do not leave it to mood.`,
  (l1: string, l2: string, k1: string, k2: string) =>
    `${l2} arrives inside your ${l1} chapter and brings ${k2} with it. The story of ${k1} keeps moving, and the person or offer that shows up now ties back to it even when it looks unrelated. Say yes to the one that costs you something real, and no to the one that only flatters you.`,
  (l1: string, l2: string, k1: string, k2: string) =>
    `A turn inside your ${l1} chapter. ${k2} cuts into the longer story of ${k1}, and you feel pulled between the two. Same life, different priority: what you have been building under ${l1} gets tested by ${l2} before it is allowed to finish.`,
];

function getBlendedZRInterpretation(l1Sign: string, l2Sign: string): string {
  const k1 = ZR_SIGN_KEYWORDS[l1Sign] || l1Sign;
  const k2 = ZR_SIGN_KEYWORDS[l2Sign] || l2Sign;

  if (l1Sign === l2Sign) {
    return `Your ${l1Sign} chapter and sub-period are the same sign, so ${k1} fills almost every week with no relief from anything else. What you decide in this stretch is the clearest version of what the whole ${l1Sign} chapter is about, and you will not get to blame circumstances.`;
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
