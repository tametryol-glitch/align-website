'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { DollarSign, ArrowLeft, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, AlertTriangle, TrendingUp, Shield, Clock, Sparkles } from 'lucide-react';
import { PaywallGate } from '@/components/ui/PaywallGate';

// ─── Constants ───────────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FULL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const SIGN_RULERS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Vesta', Libra: 'Juno', Scorpio: 'Pluto',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune',
};

const FINANCIAL_HOUSES = [
  { house: 2, title: '2nd House', subtitle: 'Personal Income & Values', icon: '$', gradientClass: 'from-amber-500/10 to-amber-500/[0.02]' },
  { house: 8, title: '8th House', subtitle: 'Shared Resources & Transformation', icon: '♇', gradientClass: 'from-purple-500/10 to-purple-500/[0.02]' },
  { house: 10, title: '10th House', subtitle: 'Career & Public Standing', icon: '☆', gradientClass: 'from-blue-500/10 to-blue-500/[0.02]' },
  { house: 11, title: '11th House', subtitle: 'Gains & Networks', icon: '★', gradientClass: 'from-emerald-500/10 to-emerald-500/[0.02]' },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface NatalPlanet {
  name: string; longitude: number; sign: string; degree: number;
  house: number; is_retrograde?: boolean; retrograde?: boolean;
}
interface HouseCusp { house: number; sign: string; degree: number; longitude: number; }
interface NatalChart { planets: NatalPlanet[]; aspects: any[]; houses: HouseCusp[]; ascendant: number; midheaven: number; }
interface HouseData { house: number; sign: string; ruler: string; planets: NatalPlanet[]; cuspDegree: number; }
interface MonthlyForecast { month: string; year: number; monthIndex: number; rating: 'favorable' | 'mixed' | 'challenging'; score: number; keyTransit: string; outlook: string; }
interface TimingWindow { category: string; months: string[]; icon: string; }
interface FinancialReport {
  overallRating: string; overallScore: number; summary: string;
  houses: HouseData[]; strengths: string[]; challenges: string[];
  monthlyForecasts: MonthlyForecast[]; timingWindows: TimingWindow[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatDeg(deg: number): string {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${d}°${m}'`;
}

function getHouseData(chart: NatalChart, houseNum: number): HouseData {
  const cusp = chart.houses.find(h => h.house === houseNum);
  const sign = cusp?.sign || 'Aries';
  const ruler = SIGN_RULERS[sign] || 'Unknown';
  const planetsInHouse = chart.planets.filter(p => p.house === houseNum && p.name !== 'Ascendant' && p.name !== 'MC');
  return { house: houseNum, sign, ruler, planets: planetsInHouse, cuspDegree: cusp?.degree || 0 };
}

function calculatePartOfFortune(chart: NatalChart): { sign: string; degree: number; house: number } {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const backendPof = chart.planets.find(p => p.name === 'Part of Fortune');
  if (backendPof && typeof backendPof.longitude === 'number') {
    const lon = ((backendPof.longitude % 360) + 360) % 360;
    return { sign: signs[Math.floor(lon / 30) % 12], degree: Math.round((lon % 30) * 100) / 100, house: backendPof.house || 1 };
  }
  const sun = chart.planets.find(p => p.name === 'Sun');
  const moon = chart.planets.find(p => p.name === 'Moon');
  if (!sun || !moon) return { sign: 'Aries', degree: 0, house: 1 };
  const isDayChart = (sun.house || 1) >= 7;
  const pof = isDayChart
    ? (chart.ascendant + moon.longitude - sun.longitude + 720) % 360
    : (chart.ascendant + sun.longitude - moon.longitude + 720) % 360;
  const signIndex = Math.floor(pof / 30) % 12;
  let house = 1;
  for (let i = 0; i < 12; i++) {
    const start = chart.houses[i].longitude;
    const end = chart.houses[(i + 1) % 12].longitude;
    if (start <= end) { if (pof >= start && pof < end) { house = i + 1; break; } }
    else { if (pof >= start || pof < end) { house = i + 1; break; } }
  }
  return { sign: signs[signIndex], degree: Math.round((pof % 30) * 100) / 100, house };
}

function getJupiterTheme(sign: string): string {
  const themes: Record<string, string> = {
    Aries: 'bold initiative and entrepreneurial drive', Taurus: 'steady accumulation and tangible assets',
    Gemini: 'diversified income streams', Cancer: 'real estate and family wealth',
    Leo: 'creative ventures and generous leadership', Virgo: 'meticulous planning and service-based income',
    Libra: 'partnerships and aesthetic industries', Scorpio: 'investments and strategic power moves',
    Sagittarius: 'international ventures', Capricorn: 'structured growth and corporate achievement',
    Aquarius: 'technology and innovation', Pisces: 'intuitive investments and creative income',
  };
  return themes[sign] || 'expanding opportunity';
}

function getHouseTheme(house: number): string {
  const themes: Record<number, string> = {
    1: 'personal initiative', 2: 'earned income', 3: 'communication skills', 4: 'property and roots',
    5: 'creative ventures', 6: 'daily work and service', 7: 'partnerships', 8: 'shared resources',
    9: 'higher learning', 10: 'career achievement', 11: 'community and networks', 12: 'behind-the-scenes work',
  };
  return themes[house] || 'life experience';
}

// Outlook pools
const FAVORABLE_OUTLOOKS = [
  'Money moves easily this month. Offers and replies come without you chasing them.',
  'A strong month for financial decisions. Instincts about money land sharper than usual.',
  'Ask for money this month. Raises, rates and new clients all get a yes more easily than usual.',
  'Momentum is real this month: the quote you send and the question you ask get answered faster than usual.',
  'Money conversations tilt in your favor. Ask for the thing you have been quietly hoping for.',
  'A generous month. The right yes arrives; the wrong yes loses its shine.',
  'Resources come easier than usual. Notice the channel — it is likely to open again later.',
  'A green-light month for the financial move that has been queued up for weeks.',
];
const MIXED_OUTLOOKS = [
  'A month of balancing — some opportunities arrive alongside decisions that require careful thought.',
  'Some offers this month are good and some are traps, and they look alike. Focus on what you can control.',
  'There is potential here, but it requires patience. Not every door that opens is meant for you right now.',
  'Financial matters need both intuition and logic this month. Take your time with big decisions.',
  'The math looks different depending on the angle. Run it twice before you commit.',
  'A month for due diligence over instinct. The opportunities that survive scrutiny are the real ones.',
  'Trade-offs sharpen. Saying yes to one thing means postponing another — choose on purpose.',
  'Neutral skies. Money moves forward if you push, stays put if you don\'t. Either is fine.',
];
const CHALLENGING_OUTLOOKS = [
  'Cash is tighter this month. Pay the boring bills first and skip any risk.',
  'A bill or a price rise you ignored shows up, and it teaches you which cost to cut for good.',
  'Tighten the ship this month. Conservative moves serve you better than bold ones.',
  'A month for reflection rather than action. Review, reorganize, and prepare for better windows ahead.',
  'Defensive posture pays. The best offense this month is an audit of what is already working.',
  'Bills, renegotiations and small reckonings land this month. Handle them early; they compound if ignored.',
  'Money feels tight even when it isn\'t. The pressure is asking you to reprice your time.',
  'A holding month. Protect what you have built; the expansion window is not this one.',
];

let outlookCounters: Record<string, number> = { fav: 0, mix: 0, chal: 0 };

function getMonthOutlook(rating: string): string {
  if (rating === 'favorable') { const idx = outlookCounters.fav % FAVORABLE_OUTLOOKS.length; outlookCounters.fav++; return FAVORABLE_OUTLOOKS[idx]; }
  if (rating === 'mixed') { const idx = outlookCounters.mix % MIXED_OUTLOOKS.length; outlookCounters.mix++; return MIXED_OUTLOOKS[idx]; }
  const idx = outlookCounters.chal % CHALLENGING_OUTLOOKS.length; outlookCounters.chal++; return CHALLENGING_OUTLOOKS[idx];
}

function analyzeFinancialChart(chart: NatalChart, startMonth: number, startYear: number): FinancialReport {
  outlookCounters = { fav: 0, mix: 0, chal: 0 };
  const houses = FINANCIAL_HOUSES.map(fh => getHouseData(chart, fh.house));
  const pof = calculatePartOfFortune(chart);

  // Strengths
  const strengths: string[] = [];
  const jupiter = chart.planets.find(p => p.name === 'Jupiter');
  const venus = chart.planets.find(p => p.name === 'Venus');
  if (jupiter) {
    if ([2, 8, 10, 11].includes(jupiter.house)) strengths.push(`Jupiter in your ${ordinal(jupiter.house)} house brings natural abundance to your ${jupiter.house === 2 ? 'personal finances' : jupiter.house === 8 ? 'shared resources' : jupiter.house === 10 ? 'career' : 'income from networks'}.`);
    strengths.push(`Jupiter in ${jupiter.sign} expands your financial vision through ${getJupiterTheme(jupiter.sign)}.`);
  }
  if (venus && [2, 8, 10, 11].includes(venus.house)) strengths.push(`Venus in your ${ordinal(venus.house)} house attracts resources naturally.`);
  if ([2, 8, 10, 11].includes(pof.house)) strengths.push(`Your Part of Fortune in ${pof.sign} (${ordinal(pof.house)} house) is where money reaches you with the least effort, so test your pitches and requests there first.`);
  else strengths.push(`Part of Fortune in ${pof.sign} (${ordinal(pof.house)} house) supports your material success through ${getHouseTheme(pof.house)}.`);
  const beneficsInMoney = chart.planets.filter(p => ['Jupiter', 'Venus'].includes(p.name) && [2, 8].includes(p.house));
  if (beneficsInMoney.length > 0) strengths.push(`Having ${beneficsInMoney.map(p => p.name).join(' and ')} in your money houses means money tends to reach you through other people's goodwill, though it also leaves quickly.`);
  const h2Ruler = SIGN_RULERS[houses[0].sign];
  const h2RulerPlanet = chart.planets.find(p => p.name === h2Ruler);
  if (h2RulerPlanet && !(h2RulerPlanet.retrograde || h2RulerPlanet.is_retrograde)) strengths.push(`Your 2nd house ruler (${h2Ruler} in ${h2RulerPlanet.sign}) is direct, suggesting steady earning momentum.`);

  // Challenges
  const challenges: string[] = [];
  const saturn = chart.planets.find(p => p.name === 'Saturn');
  const mars = chart.planets.find(p => p.name === 'Mars');
  const pluto = chart.planets.find(p => p.name === 'Pluto');
  if (saturn && [2, 8].includes(saturn.house)) challenges.push(`Saturn in your ${ordinal(saturn.house)} house can create slow but steady financial growth — patience is required.`);
  if (saturn) {
    const saturnAspects = chart.aspects.filter((a: any) => (a.planet1 === 'Saturn' || a.planet2 === 'Saturn') && (a.type === 'square' || a.type === 'opposition'));
    if (saturnAspects.length > 0) challenges.push(`Saturn's hard aspects suggest areas where financial discipline is being tested.`);
  }
  if (mars && [2, 8].includes(mars.house)) challenges.push(`Mars in your ${ordinal(mars.house)} house can lead to impulsive spending: put a 24-hour wait on any purchase you make while angry.`);
  if (pluto && [2, 8].includes(pluto.house)) challenges.push(`Pluto in your ${ordinal(pluto.house)} house brings intense transformation around resources.`);
  const retroInMoney = chart.planets.filter(p => (p.retrograde || p.is_retrograde) && [2, 8, 10, 11].includes(p.house) && p.name !== 'Ascendant' && p.name !== 'MC');
  if (retroInMoney.length > 0) challenges.push(`${retroInMoney.map(p => p.name).join(' and ')} retrograde in your money houses suggests reviewing past financial decisions.`);
  if (h2RulerPlanet && (h2RulerPlanet.retrograde || h2RulerPlanet.is_retrograde)) challenges.push(`Your 2nd house ruler (${h2Ruler}) is retrograde — income may come through revisiting old opportunities.`);

  // Monthly Forecasts
  const monthlyForecasts: MonthlyForecast[] = [];
  for (let i = 0; i < 12; i++) {
    const mIdx = (startMonth + i) % 12;
    const yr = startYear + Math.floor((startMonth + i) / 12);
    monthlyForecasts.push(generateMonthlyForecast(chart, mIdx, yr));
  }

  // Overall
  const avgScore = monthlyForecasts.reduce((s, f) => s + f.score, 0) / monthlyForecasts.length;
  const overallScore = Math.round(avgScore);
  const overallRating = overallScore >= 75 ? 'Excellent' : overallScore >= 62 ? 'Strong' : overallScore >= 48 ? 'Moderate' : overallScore >= 35 ? 'Cautious' : 'Challenging';
  const summary = getOverallSummary(overallRating, chart);

  // Timing Windows
  const timingWindows: TimingWindow[] = [];
  const investMonths = monthlyForecasts.filter(f => f.score >= 65).map(f => `${f.month} ${f.year}`);
  const negotiationMonths = monthlyForecasts.filter(f => f.score >= 58).map(f => `${f.month} ${f.year}`);
  const savingsMonths = monthlyForecasts.filter(f => f.score >= 40 && f.score < 58).map(f => `${f.month} ${f.year}`);
  const cautionMonths = monthlyForecasts.filter(f => f.score < 40).map(f => `${f.month} ${f.year}`);
  if (investMonths.length) timingWindows.push({ category: 'Best for Investments', months: investMonths.slice(0, 4), icon: '↗' });
  if (negotiationMonths.length) timingWindows.push({ category: 'Best for Deals & Negotiations', months: negotiationMonths.slice(0, 4), icon: '⚖' });
  if (savingsMonths.length) timingWindows.push({ category: 'Best for Savings & Consolidation', months: savingsMonths.slice(0, 4), icon: '⛅' });
  if (cautionMonths.length) timingWindows.push({ category: 'Months to Be Cautious', months: cautionMonths.slice(0, 4), icon: '⚠' });

  return { overallRating, overallScore, summary, houses: houses, strengths: strengths.slice(0, 6), challenges: challenges.slice(0, 5), monthlyForecasts, timingWindows };
}

function generateMonthlyForecast(chart: NatalChart, monthIndex: number, year: number): MonthlyForecast {
  let ofs = 0, pfs = 0;
  type AspectHit = { transit: string; target: string; aspect: string; orb: number };
  let tightest: AspectHit | null = null;
  const consider = (hit: AspectHit) => { if (!tightest || hit.orb < tightest.orb) tightest = hit; };

  const jupiter = chart.planets.find(p => p.name === 'Jupiter');
  const h2Cusp = chart.houses.find(h => h.house === 2);
  const h8Cusp = chart.houses.find(h => h.house === 8);

  const monthDate = new Date(year, monthIndex, 15);
  const j2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const daysSince = (monthDate.getTime() - j2000.getTime()) / 86400000;

  const jupiterTransitLon = ((25.253 + 0.0831 * daysSince) % 360 + 360) % 360;
  const saturnTransitLon = ((40.396 + 0.0335 * daysSince) % 360 + 360) % 360;
  const venusTransitLon = ((241.565 + 1.209 * daysSince) % 360 + 360) % 360;

  if (h2Cusp) {
    const diff2 = Math.abs(jupiterTransitLon - h2Cusp.longitude);
    const n2 = diff2 > 180 ? 360 - diff2 : diff2;
    if (n2 < 10) { ofs += 25; consider({ transit: 'Jupiter', target: '2nd house cusp', aspect: 'conjunct', orb: n2 }); }
    if (Math.abs(n2 - 120) < 10) { ofs += 20; consider({ transit: 'Jupiter', target: '2nd house cusp', aspect: 'trine', orb: Math.abs(n2 - 120) }); }
    if (Math.abs(n2 - 60) < 10) { ofs += 18; consider({ transit: 'Jupiter', target: '2nd house cusp', aspect: 'sextile', orb: Math.abs(n2 - 60) }); }
  }
  if (h8Cusp) {
    const diff8 = Math.abs(jupiterTransitLon - h8Cusp.longitude);
    const n8 = diff8 > 180 ? 360 - diff8 : diff8;
    if (n8 < 10) { ofs += 22; consider({ transit: 'Jupiter', target: '8th house cusp', aspect: 'conjunct', orb: n8 }); }
    if (Math.abs(n8 - 120) < 10) { ofs += 18; consider({ transit: 'Jupiter', target: '8th house cusp', aspect: 'trine', orb: Math.abs(n8 - 120) }); }
  }
  if (jupiter) {
    const vj = Math.abs(venusTransitLon - jupiter.longitude);
    const vjn = vj > 180 ? 360 - vj : vj;
    if (vjn < 8) { ofs += 15; consider({ transit: 'Venus', target: 'natal Jupiter', aspect: 'conjunct', orb: vjn }); }
    if (Math.abs(vjn - 120) < 8) { ofs += 12; consider({ transit: 'Venus', target: 'natal Jupiter', aspect: 'trine', orb: Math.abs(vjn - 120) }); }
  }
  if (h2Cusp) {
    const sd2 = Math.abs(saturnTransitLon - h2Cusp.longitude);
    const sn2 = sd2 > 180 ? 360 - sd2 : sd2;
    if (sn2 < 8) { pfs += 20; consider({ transit: 'Saturn', target: '2nd house cusp', aspect: 'conjunct', orb: sn2 }); }
    if (Math.abs(sn2 - 90) < 8) { pfs += 18; consider({ transit: 'Saturn', target: '2nd house cusp', aspect: 'square', orb: Math.abs(sn2 - 90) }); }
  }
  if (jupiter) {
    const jReturn = Math.abs(jupiterTransitLon - jupiter.longitude);
    const jrn = jReturn > 180 ? 360 - jReturn : jReturn;
    if (jrn < 5) { ofs += 20; consider({ transit: 'Jupiter', target: 'natal Jupiter', aspect: 'return', orb: jrn }); }
  }
  const seed = (monthIndex * 7 + year * 13) % 100;
  const totalOfs = 30 + (seed % 25) + ofs;
  const totalPfs = 15 + ((seed * 3) % 20) + pfs;
  const score = Math.max(15, Math.min(92, 50 + totalOfs - totalPfs));
  const rating: MonthlyForecast['rating'] = score >= 62 ? 'favorable' : score >= 40 ? 'mixed' : 'challenging';
  const best = tightest as AspectHit | null;
  const keyTransit = best
    ? (best.aspect === 'return' ? `${best.transit} return` : `${best.transit} ${best.aspect} ${best.target}`)
    : `Jupiter in ${['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'][Math.floor(jupiterTransitLon / 30) % 12]}`;
  return { month: MONTHS[monthIndex], year, monthIndex, rating, score: Math.round(score), keyTransit, outlook: getMonthOutlook(rating) };
}

function getOverallSummary(rating: string, chart: NatalChart): string {
  const jupiter = chart.planets.find(p => p.name === 'Jupiter');
  switch (rating) {
    case 'Excellent': return `Money is likely to come to you more easily than to most people you know. With ${jupiter ? jupiter.sign + ' Jupiter' : 'favorable planetary alignments'} behind your money houses, this is the time to ask for the raise, raise your rates or put savings to work, and the cost is that easy money makes you careless, so set a rule for how much you spend.`;
    case 'Strong': return 'The next months favor you if you act on them. Your chart supports steady earning, and upcoming transits make clients, bosses and lenders easier to persuade, so ask for the thing you have been putting off.';
    case 'Moderate': return 'No windfall and no disaster is coming. Money moves only when you push: one raise request, one cancelled subscription, one invoice chased.';
    case 'Cautious': return 'The coming months are for holding cash. You will be tempted by one big purchase or one big pitch; wait a week, read the terms twice and keep three months of costs untouched.';
    default: return 'Money is tight enough to hurt for now. Cut the two largest avoidable costs, say no to lending, and put any income you control toward the debt with the highest rate first.';
  }
}

function generateFallbackReading(firstName: string, rpt: FinancialReport, pof: { sign: string; degree: number; house: number }): string {
  const h2 = rpt.houses[0], h8 = rpt.houses[1], h10 = rpt.houses[2];

  const EARNING_STYLE: Record<string, string> = {
    Aries: `you earn best when you lead, initiate, and move fast. Waiting for someone to hand you an opportunity is not your style — you create your own. Your financial energy is entrepreneurial, competitive, and impatient. The money follows when you are first, when you are bold, and when you trust your instinct over the spreadsheet.`,
    Taurus: `you earn through patience, quality, and things that hold their value. Quick money schemes drain you. Your financial power comes from building something solid — brick by brick, dollar by dollar — until one day people look up and realize you own the foundation everything else is built on. Luxury, beauty, and tangible assets are your wealth language.`,
    Gemini: `your money comes through your mind, your words, and your ability to connect ideas and people. You thrive in roles where you communicate, sell, teach, or translate complexity into simplicity. Multiple income streams suit you better than one steady paycheck — your mind needs variety, and your wallet follows your curiosity.`,
    Cancer: `you earn through nurturing, providing, and creating emotional safety. Real estate, food, hospitality, family business, caregiving — anything that involves making people feel at home or taken care of. Your relationship with money is deeply emotional. When you feel secure, you spend wisely. When you feel threatened, you either hoard or emotionally spend. Know the difference.`,
    Leo: `your earning power is tied directly to your self-expression and visibility. You earn more when people see you, when you perform, create, or lead from the front. The moment you shrink or play small, the money slows down. Financial success for you requires being seen and appreciated — and there is nothing wrong with that. Your light is literally your revenue stream.`,
    Virgo: `you earn through skill, precision, and being genuinely useful. You are not the person who sells snake oil — you are the person who solves actual problems with practical solutions. Health, analytics, service, editing, systems optimization — anything that rewards careful attention to detail. Your financial discipline is your superpower, but do not let perfectionism prevent you from pricing yourself at what you are actually worth.`,
    Libra: `your earning comes through relationships, aesthetics, and the ability to create harmony. Partnerships, beauty industries, law, design, diplomacy — anything that involves balancing competing interests or making things beautiful. Your financial blind spot is conflict avoidance — you sometimes accept less than you deserve because negotiation feels confrontational. It is not. It is fairness. And fairness is literally your sign.`,
    Scorpio: `you earn through depth, research, transformation, and understanding what others want to hide. Psychology, investigation, finance, insurance, anything involving crisis management or taboo topics. Your financial instinct is razor sharp — you see through surface presentations and understand the real value of things. But your relationship with money can be all-or-nothing. Learn to exist in the middle.`,
    Sagittarius: `you earn through vision, teaching, publishing, travel, and expanding horizons. Your money follows your belief — when you believe in what you are doing, abundance flows. When you do not, no amount of hustle will compensate. International markets, education, philosophy, adventure industries — anywhere that rewards big-picture thinking and infectious optimism.`,
    Capricorn: `you are built for long-term financial success. Your earning power increases with age and experience — you are literally designed to peak later in life, so do not panic if your twenties and thirties feel financially frustrating. Management, government, institutions, anything with structure and hierarchy. Your patience with compound growth — both financial and professional — is your greatest asset.`,
    Aquarius: `you earn through innovation, technology, and doing things differently than everyone else. The conventional career path will bore you and underpay you. Your financial sweet spot is where originality meets utility — creating something that did not exist before but that everyone suddenly needs. Startups, tech, social enterprises, humanitarian work that pays. Your unconventional approach IS the product.`,
    Pisces: `your earning power comes through intuition, creativity, healing, and spiritual connection. Music, film, therapy, charity work, anything that operates in the world of feeling rather than fact. Your relationship with money is complicated — you either idealize it or feel guilty about wanting it. Here is the truth: money is a tool. Having enough of it allows you to help more people. Let go of the guilt.`,
  };

  const SHARED_RESOURCES: Record<string, string> = {
    Aries: `you prefer to control shared finances rather than defer to a partner. Joint accounts can feel like a loss of independence. Be direct about money in relationships — your natural instinct is right, but delivery matters.`,
    Taurus: `you are naturally conservative with shared resources. You prefer to accumulate and hold rather than risk. Inheritance, insurance, and long-term investments work well for you.`,
    Gemini: `you need open communication about shared finances. Secrets around money create anxiety. You handle debt and taxes best when you understand every detail.`,
    Cancer: `shared financial security is deeply emotional for you. Family money, inheritance, and property are significant themes. You may inherit more than just money — family financial patterns, good or bad, tend to repeat.`,
    Leo: `you are generous with shared resources but need recognition for your contributions. Financial power dynamics in relationships can become a sensitive issue.`,
    Virgo: `you manage shared finances with precision and a detailed eye. You are the one who reads the fine print, tracks every transaction, and catches the billing errors nobody else notices.`,
    Libra: `fairness in shared finances is non-negotiable for you. You need everything to feel equitable, and financial imbalances in relationships create deep resentment over time.`,
    Scorpio: `you notice what is hidden in a deal: the fee in the small print, the partner who goes quiet about their debts. You can smell a bad deal from a mile away, and the cost is walking away from good ones because you assumed the worst.`,
    Sagittarius: `you tend to be optimistic about shared finances — sometimes too optimistic. You trust that things will work out, which can be both a strength and a vulnerability.`,
    Capricorn: `you approach shared resources with discipline and long-term thinking. Retirement planning, structured investments, and building generational wealth come naturally.`,
    Aquarius: `you want shared finances to serve a larger purpose. You are more willing to invest in ideas, causes, or unconventional ventures than in traditional savings.`,
    Pisces: `boundaries around shared finances can be blurry. You may give too much, loan money you cannot afford to lose, or merge finances before establishing clear agreements. Protect yourself.`,
  };

  let reading = `## ${firstName}, Your Financial Blueprint\n\n`;
  reading += `Here are the money habits your chart points at, the ones you already half-know and avoid looking at. They explain why you earn the way you earn, spend the way you spend, and sometimes get in your own financial way.\n\n`;

  reading += `### How You Naturally Earn\n\n`;
  reading += `With **${h2.sign}** on your 2nd house cusp, ${EARNING_STYLE[h2.sign] || `you have a distinctive approach to earning shaped by ${h2.sign} energy.`}\n\n`;
  if (h2.planets.length > 0) {
    reading += `Having **${h2.planets.map(p => p.name).join(' and ')}** in your 2nd house puts a clear mark on how you earn, for better and for worse. `;
    h2.planets.forEach(p => {
      if (p.name === 'Jupiter') reading += `Jupiter here means money tends to arrive through other people's trust: a client who refers three more, a boss who raises you before you ask. The cost is that you spend at the same speed and say yes to loans, favors and big plans you should have priced first. `;
      else if (p.name === 'Saturn') reading += `Saturn here means you are underpaid early and your first decade of work feels unfairly hard. Then you hold a position or a savings pile that your faster peers do not. The cost is that you distrust spending on yourself even when you can afford it. `;
      else if (p.name === 'Venus') reading += `Venus here means you earn from how people feel around you: clients who like you, a product that looks good, a partner who shares the bills. The cost is that you discount your price for people you like and avoid chasing late payments. `;
      else if (p.name === 'Mars') reading += `Mars here means you hustle, and you ask for the raise instead of waiting for it. The cost is impulse spending when you are angry and a habit of burning through a good month in a week. `;
      else if (p.name === 'Pluto') reading += `Pluto here means your money story has at least one collapse in it, a business, an inheritance, a debt, and you rebuild larger afterwards. The cost is that you either control every cent or avoid looking at it, with little in between. `;
      else if (p.name === 'Moon') reading += `The Moon here means your income follows your mood. In a good week you invoice, pitch and ask; in a bad one you let things slide for ten days. Set up automatic payments for the months you will not feel like it. `;
      else if (p.name === 'Sun') reading += `The Sun here means pride is tied to how you earn. You turn down well-paid work that embarrasses you and stay too long in badly paid work you are proud of. Decide the number you need, then judge each job against it. `;
      else if (p.name === 'Mercury') reading += `Mercury here means you read the contract, spot the odd line on a bill and catch the error in the quote. The cost is that you over-analyze and sit on a good deal for a week while someone else signs. `;
      else if (p.name === 'Uranus') reading += `Uranus here means income arrives in lumps: a big invoice, then nothing for six weeks. Side projects and tech pay you better than a salary, and a salary feels like a cage. Keep three months of costs in cash for the empty weeks. `;
      else if (p.name === 'Neptune') reading += `Neptune here means you undercharge, forget to invoice and lose track of what left your account. Write the price down before you talk to the client, and read your statement on the first of every month. `;
    });
    reading += `\n\n`;
  }

  reading += `### How You Handle Other People's Money\n\n`;
  reading += `Your 8th house in **${h8.sign}**: ${SHARED_RESOURCES[h8.sign] || `you have a distinctive approach to shared finances, investments, and financial partnerships.`}\n\n`;

  reading += `### Your Career and Financial Reputation\n\n`;
  reading += `**${h10.sign}** on your Midheaven is the first impression your colleagues and clients form of your work, and your career success comes through ${EARNING_STYLE[h10.sign]?.split('.')[0]?.toLowerCase() || 'leveraging the unique qualities of ' + h10.sign}.\n\n`;

  reading += `### What Is Working For You\n\n`;
  rpt.strengths.forEach(s => { reading += `- ${s}\n`; });
  reading += `\nThese are not aspirational — these are active strengths in your chart right now. Lean into them harder.\n\n`;

  reading += `### What Could Trip You Up\n\n`;
  rpt.challenges.forEach(c => { reading += `- ${c}\n`; });
  reading += `\nThese are not weaknesses — they are blind spots. The difference is that blind spots only stay dangerous if you refuse to look at them.\n\n`;

  reading += `### Your Prosperity Point\n\n`;
  reading += `${firstName}, your Part of Fortune sits at ${formatDeg(pof.degree)} **${pof.sign}** in your **${ordinal(pof.house)} house**. Look at where help has turned up for you without being asked: it is usually through ${getHouseTheme(pof.house)}. That is where you get paid for the least effort, so go there first, and notice that you undervalue it because it comes easily.\n\n`;

  reading += `### When to Move and When to Wait\n\n`;
  const best = rpt.monthlyForecasts.filter(f => f.rating === 'favorable').slice(0, 3);
  const cautious = rpt.monthlyForecasts.filter(f => f.rating === 'challenging').slice(0, 2);
  if (best.length) reading += `**Your strongest financial windows:** ${best.map(f => `**${f.month} ${f.year}**`).join(', ')}. These are the months to negotiate raises, launch ventures, make investments, and take calculated financial risks. Book the raise conversation and the pitch for these dates now, before the month fills up.\n\n`;
  if (cautious.length) reading += `**Exercise caution during:** ${cautious.map(f => `**${f.month} ${f.year}**`).join(', ')}. In these months you check the numbers twice, put off the big purchase and read every line before you sign. Do not sign major contracts or make irreversible financial decisions unless you have thoroughly done your homework.\n\n`;

  reading += `### The Verdict\n\n`;
  if (rpt.overallScore >= 75) {
    reading += `${firstName}, your financial chart is genuinely strong. The combination of your ${h2.sign} earning instincts, your ${h10.sign} career energy, and your Part of Fortune in the ${ordinal(pof.house)} house makes money easier for you than for most people. You gain more by choosing the one kind of work that fits than by working longer hours. The strongest months above are when your prices and pitches land best, so put your biggest requests there.\n`;
  } else if (rpt.overallScore >= 50) {
    reading += `${firstName}, your chart has solid financial potential that rewards strategic action and patience. You will not drift into money; you will build it, one deliberate decision at a time. Work in your ${h2.sign} earning style, use the dates above, and stop comparing your income to friends who earn in a completely different way.\n`;
  } else {
    reading += `${firstName}, I want to be honest: money takes more deliberate effort for you than for some. Quick routes, like get-rich schemes, copying a friend's side hustle or waiting for a windfall, cost you more than they pay. Work in your ${h2.sign} earning style, push hard in the favorable months and hold cash in the challenging ones.\n`;
  }
  return reading;
}

// ─── Render helpers ──────────────────────────────────────────────────────────

function RenderMarkdown({ text }: { text: string }) {
  return <>{text.split('\n').map((line, i) => {
    const t = line.trim();
    if (!t) return <div key={i} className="h-2" />;
    if (t === '---') return <hr key={i} className="border-border-primary my-4" />;
    if (t.startsWith('## ')) return <h2 key={i} className="text-amber-400 font-bold text-lg mt-4 mb-2">{t.slice(3)}</h2>;
    if (t.startsWith('### ')) return <h3 key={i} className="text-text-primary font-semibold mt-3 mb-1">{t.slice(4)}</h3>;
    if (t.startsWith('- ')) return <p key={i} className="text-text-secondary text-sm leading-relaxed mb-1 pl-3"><span className="text-amber-400 mr-2">&bull;</span><InlineBold text={t.slice(2)} /></p>;
    return <p key={i} className="text-text-secondary text-sm leading-relaxed mb-1"><InlineBold text={t} /></p>;
  })}</>;
}

function InlineBold({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return <>{parts.map((p, i) => p.startsWith('**') && p.endsWith('**') ? <strong key={i} className="font-bold text-text-primary">{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>)}</>;
}

function ScoreGauge({ score, rating }: { score: number; rating: string }) {
  const color = rating === 'Excellent' ? '#10B981' : rating === 'Strong' ? '#34D399' : rating === 'Moderate' ? '#F59E0B' : rating === 'Cautious' ? '#F97316' : '#EF4444';
  const circumference = 2 * Math.PI * 45;
  const dashOffset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center py-3">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset} className="transition-all duration-700" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold" style={{ color }}>{score}</span>
          <span className="text-xs text-text-muted">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-bold uppercase tracking-widest mt-2" style={{ color }}>{rating}</span>
    </div>
  );
}

function MonthRatingColor(rating: string): string {
  return rating === 'favorable' ? '#10B981' : rating === 'mixed' ? '#F59E0B' : '#EF4444';
}

const ZODIAC_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

function calculateDailyFinancialScore(
  dayDate: Date,
  ascSign: string,
): { score: number; insight: string; bestFor: string; moonSign: string } {
  const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const dayOfYear = Math.floor((dayDate.getTime() - new Date(dayDate.getFullYear(), 0, 0).getTime()) / 86400000);
  const moonSignIndex = Math.floor((dayOfYear * 13.2) / 30) % 12;
  const moonSign = signs[moonSignIndex];
  const ascIdx = signs.indexOf(ascSign);
  const secondHouseSign = signs[(ascIdx + 1) % 12];
  const eighthHouseSign = signs[(ascIdx + 7) % 12];
  const tenthHouseSign = signs[(ascIdx + 9) % 12];
  const eleventhHouseSign = signs[(ascIdx + 10) % 12];
  let score = 5;
  if (moonSign === secondHouseSign) score += 2;
  if (moonSign === eighthHouseSign) score += 1.5;
  if (moonSign === tenthHouseSign) score += 1.5;
  if (moonSign === eleventhHouseSign) score += 1;
  if (moonSign === signs[(ascIdx + 11) % 12]) score -= 1;
  if (moonSign === signs[(ascIdx + 5) % 12]) score -= 0.5;
  const dow = dayDate.getDay();
  if (dow === 2 || dow === 4) score += 0.5;
  if (dow === 5) score += 0.3;
  if (dow === 0 || dow === 6) score -= 0.5;
  const dayHash = (dayOfYear * 7 + dayDate.getMonth() * 13) % 20;
  score += (dayHash - 10) * 0.15;
  score = Math.max(1, Math.min(10, Math.round(score * 10) / 10));
  let insight = '';
  let bestFor = '';
  if (score >= 7.5) {
    insight = `Moon in ${moonSign} today: a good day to ask, sign or buy the thing you have already researched.`;
    bestFor = 'Negotiations, investments, pricing decisions';
  } else if (score >= 6) {
    insight = `Good financial flow with Moon in ${moonSign}. Steady progress available.`;
    bestFor = 'Invoicing, follow-ups, business planning';
  } else if (score >= 4.5) {
    insight = `Moon in ${moonSign} today: fine for small purchases, but wait on anything you cannot cancel.`;
    bestFor = 'Research, budgeting, minor purchases';
  } else {
    insight = `Quieter financial period with Moon in ${moonSign}. Better for review than action.`;
    bestFor = 'Saving, reviewing expenses, holding off on big moves';
  }
  return { score, insight, bestFor, moonSign };
}

function getDailyScoreColor(score: number): string {
  if (score >= 7) return '#22C55E';
  if (score >= 4.5) return '#F59E0B';
  return '#EF4444';
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function FinancialPage() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const now = new Date();
  const [startMonth, setStartMonth] = useState(now.getMonth());
  const [startYear, setStartYear] = useState(now.getFullYear());
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showJargon, setShowJargon] = useState(false);
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAi, setShowAi] = useState(false);

  const firstName = (profile?.display_name || '').split(' ')[0] || 'Stargazer';

  const toggleMonth = (index: number) => {
    setExpandedDay(null);
    setExpandedMonth(expandedMonth === index ? null : index);
  };

  const dailyData = useMemo(() => {
    if (expandedMonth === null || !report) return [];
    const forecast = report.monthlyForecasts[expandedMonth];
    if (!forecast) return [];
    const year = forecast.year;
    const month = forecast.monthIndex;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
    const ascSign = report.houses[0]
      ? signs[(signs.indexOf(report.houses[0].sign) + 11) % 12]
      : 'Aries';
    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const result = calculateDailyFinancialScore(date, ascSign);
      days.push({ date, day: d, weekday: date.toLocaleDateString('en', { weekday: 'short' }), ...result });
    }
    return days;
  }, [expandedMonth, report]);

  const adjustMonth = (delta: number) => {
    let m = startMonth + delta;
    let y = startYear;
    if (m > 11) { m = 0; y += 1; }
    if (m < 0) { m = 11; y -= 1; }
    setStartMonth(m);
    setStartYear(y);
  };

  const generateReport = useCallback(async () => {
    if (!profile?.birth_date || !profile?.latitude) {
      setError('Please add your birth data in your profile first.');
      return;
    }
    setLoading(true);
    setError('');
    setReport(null);
    setShowAi(false);
    setAiText('');
    try {
      const chartData = await api.getNatalChart(buildBirthData(profile));
      const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
      const planets: NatalPlanet[] = (chartData.planets || chartData.positions || []).map((p: any) => ({
        name: p.name, longitude: p.longitude || 0,
        sign: p.sign || signs[Math.floor((p.longitude || 0) / 30) % 12],
        degree: p.degree || (p.longitude || 0) % 30,
        house: p.house || 1,
        is_retrograde: p.is_retrograde || false,
        retrograde: p.is_retrograde || p.retrograde || false,
      }));
      const ascP = planets.find(p => p.name === 'Ascendant');
      const ascLon = ascP ? ascP.longitude : 0;
      const houseData = chartData.houses || [];
      let houses: HouseCusp[];
      if (houseData.length >= 12) {
        houses = houseData.map((h: any) => ({ house: h.house, sign: h.sign, degree: h.degree || 0, longitude: h.longitude || 0 }));
      } else {
        const ascIdx = Math.floor(ascLon / 30);
        houses = Array.from({ length: 12 }, (_, i) => ({
          house: i + 1, sign: signs[(ascIdx + i) % 12], degree: 0, longitude: ((ascIdx + i) * 30) % 360,
        }));
      }
      const chart: NatalChart = { planets, aspects: chartData.aspects || [], houses, ascendant: ascLon, midheaven: 0 };
      const result = analyzeFinancialChart(chart, startMonth, startYear);
      setReport(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate financial report');
    } finally {
      setLoading(false);
    }
  }, [profile, startMonth, startYear]);

  const requestAiReading = useCallback(async () => {
    if (!report) return;
    setAiLoading(true);
    setShowAi(true);
    setAiText('');
    try {
      const chartData = await api.getNatalChart(buildBirthData(profile!));
      const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
      const planets: NatalPlanet[] = (chartData.planets || chartData.positions || []).map((p: any) => ({
        name: p.name, longitude: p.longitude || 0,
        sign: p.sign || signs[Math.floor((p.longitude || 0) / 30) % 12],
        degree: p.degree || (p.longitude || 0) % 30, house: p.house || 1,
        retrograde: p.is_retrograde || p.retrograde || false,
      }));
      const ascP = planets.find(p => p.name === 'Ascendant');
      const ascLon = ascP ? ascP.longitude : 0;
      const houseData = chartData.houses || [];
      let houses: HouseCusp[];
      if (houseData.length >= 12) houses = houseData.map((h: any) => ({ house: h.house, sign: h.sign, degree: h.degree || 0, longitude: h.longitude || 0 }));
      else { const ascIdx = Math.floor(ascLon / 30); houses = Array.from({ length: 12 }, (_, i) => ({ house: i + 1, sign: signs[(ascIdx + i) % 12], degree: 0, longitude: ((ascIdx + i) * 30) % 360 })); }
      const chart: NatalChart = { planets, aspects: chartData.aspects || [], houses, ascendant: ascLon, midheaven: 0 };
      const pof = calculatePartOfFortune(chart);
      const h2 = getHouseData(chart, 2), h8 = getHouseData(chart, 8), h10 = getHouseData(chart, 10), h11 = getHouseData(chart, 11);
      const planetPositions = planets.filter(p => p.name !== 'Ascendant' && p.name !== 'MC').map(p => `${p.name}: ${formatDeg(p.degree)} ${p.sign} (House ${p.house})${p.retrograde ? ' R' : ''}`).join('\n');
      const houseCusps = houses.map(h => `House ${h.house}: ${formatDeg(h.degree)} ${h.sign}`).join('\n');

      const systemPrompt = `You are an expert financial astrologer providing a personal financial reading for ${firstName}. You combine traditional financial astrology techniques with modern transit analysis. Use the person's first name naturally throughout. Give specific timing recommendations when possible. Structure the reading with clear sections using markdown headers (##). The reading should feel premium and personally tailored — not generic. Include both opportunities and cautions. End with an empowering summary. Write like a sharp, wise friend who sees their potential clearly — conversational, direct, occasionally blunt. Avoid generic astrology filler. Every sentence should feel like it was written specifically for THIS person's chart.`;

      const monthStr = FULL_MONTHS[startMonth];
      const endMonthIdx = (startMonth + 11) % 12;
      const endYear = startYear + (startMonth + 11 >= 12 ? 1 : 0);

      const userPrompt = `Generate a detailed, personal financial astrology reading for ${firstName}.

IMPORTANT: Use ONLY the natal chart data provided below. Do NOT guess or assume planet placements. If a planet is listed as being in a specific sign, that is correct — trust the data exactly as given.

NATAL CHART DATA (Whole Sign Houses):
${planetPositions}

HOUSE CUSPS:
${houseCusps}

KEY FINANCIAL HOUSES:
- 2nd House (Income): ${h2.sign} on cusp, ruled by ${h2.ruler}${h2.planets.length ? ', planets: ' + h2.planets.map(p => p.name).join(', ') : ''}
- 8th House (Shared Resources): ${h8.sign} on cusp, ruled by ${h8.ruler}${h8.planets.length ? ', planets: ' + h8.planets.map(p => p.name).join(', ') : ''}
- 10th House (Career): ${h10.sign} on cusp, ruled by ${h10.ruler}${h10.planets.length ? ', planets: ' + h10.planets.map(p => p.name).join(', ') : ''}
- 11th House (Gains): ${h11.sign} on cusp, ruled by ${h11.ruler}${h11.planets.length ? ', planets: ' + h11.planets.map(p => p.name).join(', ') : ''}

Part of Fortune: ${formatDeg(pof.degree)} ${pof.sign} (House ${pof.house})

FINANCIAL CLIMATE SCORE: ${report.overallScore}/100 (${report.overallRating})

KEY STRENGTHS IDENTIFIED:
${report.strengths.map(s => '- ' + s).join('\n')}

KEY CHALLENGES IDENTIFIED:
${report.challenges.map(c => '- ' + c).join('\n')}

ANALYSIS PERIOD: ${monthStr} ${startYear} through ${FULL_MONTHS[endMonthIdx]} ${endYear}

Please provide:
1. A personal greeting and overview of their financial astrology profile
2. Their natural earning style based on 2nd house — be SPECIFIC about what industries, roles, and approaches suit them. Not "shaped by Virgo qualities" but "you earn through skill, precision, and solving real problems"
3. How they handle shared resources (8th house) — debts, investments, partner money
4. Career and money potential (10th house)
5. Their biggest financial superpower from the chart
6. Specific timing windows for the next 12 months — when to invest, negotiate, save, or be cautious
7. What to watch out for — their financial blind spots, stated directly
8. An empowering closing that feels earned, not generic

TONE: Write like a sharp financial advisor who also reads charts. Conversational, direct, occasionally blunt. Use "you" and "your" naturally. Avoid filler phrases like "shaped by the qualities of" — be specific about what those qualities actually mean for their wallet. If they have 7 planets in their 2nd house, that is extraordinary and should be treated as such. If Saturn is restricting their money house, say what that actually feels like in daily life. Make it around 800-1200 words.`;

      try {
        await api.streamAIInterpretation(
          { type: 'financial', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], max_tokens: 4096 },
          (chunk: string) => setAiText(prev => prev + chunk),
          () => {},
        );
      } catch {
        const fallback = generateFallbackReading(firstName, report, pof);
        setAiText(fallback);
      }
    } catch {
      const pof = { sign: 'Aries', degree: 0, house: 1 };
      const fallback = generateFallbackReading(firstName, report, pof);
      setAiText(fallback);
    } finally {
      setAiLoading(false);
    }
  }, [profile, report, firstName]);

  return (
    <PaywallGate feature="financial">
      <div className="max-w-3xl mx-auto">
        <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Readings
        </Link>

        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-display font-bold text-text-primary">Financial Outlook</h1>
          <p className="text-text-tertiary text-sm mt-1">
            {firstName}, discover what the stars reveal about your financial landscape and the best timing for money moves.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="card mb-4">
          <p className="text-xs text-text-muted uppercase tracking-wider text-center mb-2">Analysis Period</p>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => adjustMonth(-1)} className="w-9 h-9 rounded-full bg-bg-tertiary flex items-center justify-center hover:bg-bg-secondary transition-colors">
              <ChevronLeft className="w-4 h-4 text-accent-primary" />
            </button>
            <div className="text-center">
              <p className="font-semibold text-text-primary">{FULL_MONTHS[startMonth]} {startYear}</p>
              <p className="text-xs text-text-muted">to {FULL_MONTHS[(startMonth + 11) % 12]} {startYear + (startMonth + 11 >= 12 ? 1 : 0)}</p>
            </div>
            <button onClick={() => adjustMonth(1)} className="w-9 h-9 rounded-full bg-bg-tertiary flex items-center justify-center hover:bg-bg-secondary transition-colors">
              <ChevronRight className="w-4 h-4 text-accent-primary" />
            </button>
          </div>
        </div>

        {/* Generate Button */}
        <button onClick={generateReport} disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 mb-6">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Analyzing...
            </span>
          ) : report ? 'Regenerate Report' : '✨ Generate Financial Report'}
        </button>

        {/* Error */}
        {error && (
          <div className="card text-center mb-4">
            <p className="text-red-400 text-sm mb-2">{error}</p>
            <button onClick={generateReport} className="text-accent-primary text-sm">Tap to retry</button>
          </div>
        )}

        {/* Report Content */}
        {report && !loading && (
          <div className="space-y-4">

            {/* 1. Financial Climate Summary */}
            <div className="card bg-gradient-to-br from-purple-500/15 via-amber-500/5 to-purple-500/5 text-center">
              <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Financial Climate</p>
              <ScoreGauge score={report.overallScore} rating={report.overallRating} />
              <p className="text-text-secondary text-sm leading-relaxed mt-2">{report.summary}</p>
            </div>

            {/* 2. Key Financial Houses */}
            <h3 className="text-lg font-bold text-text-primary mt-6 mb-2">&#x2302; Key Financial Houses</h3>
            <button onClick={() => setShowJargon(!showJargon)} className="text-xs text-accent-secondary mb-3 block ml-auto">
              {showJargon ? 'Hide astrology details' : 'Show astrology details'}
            </button>

            {FINANCIAL_HOUSES.map((fh, index) => {
              const hData = report.houses[index];
              if (!hData) return null;
              return (
                <div key={fh.house} className={`card bg-gradient-to-br ${fh.gradientClass} mb-2`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl text-amber-400">{fh.icon}</span>
                    <div>
                      <h4 className="font-semibold text-text-primary">{fh.title}</h4>
                      <p className="text-xs text-text-muted">{fh.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex gap-6 mb-2">
                    <div><p className="text-xs text-text-muted uppercase">Sign</p><p className="text-text-primary font-semibold text-sm">{hData.sign}</p></div>
                    <div><p className="text-xs text-text-muted uppercase">Ruler</p><p className="text-text-primary font-semibold text-sm">{hData.ruler}</p></div>
                    {showJargon && <div><p className="text-xs text-text-muted uppercase">Cusp</p><p className="text-text-primary font-semibold text-sm">{formatDeg(hData.cuspDegree)}</p></div>}
                  </div>
                  {hData.planets.length > 0 ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs text-text-muted">Natal Planets:</span>
                      {hData.planets.map(p => (
                        <span key={p.name} className="bg-accent-muted rounded-full px-2 py-0.5 text-xs text-accent-secondary font-semibold">
                          {p.name}{(p.retrograde || p.is_retrograde) ? ' R' : ''}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted italic">No natal planets — activated by its ruler, {hData.ruler}</p>
                  )}
                </div>
              );
            })}

            {/* 3. Strengths */}
            <h3 className="text-lg font-bold text-text-primary mt-6 mb-2">&#x2605; Financial Strengths</h3>
            <div className="card border-l-[3px] border-l-emerald-500">
              {report.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <p className="text-sm text-text-secondary leading-relaxed">{s}</p>
                </div>
              ))}
            </div>

            {/* 4. Challenges */}
            <h3 className="text-lg font-bold text-text-primary mt-6 mb-2">&#x26A0; Financial Challenges</h3>
            <div className="card border-l-[3px] border-l-red-500">
              {report.challenges.map((c, i) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <p className="text-sm text-text-secondary leading-relaxed">{c}</p>
                </div>
              ))}
            </div>

            {/* 5. Monthly Forecast */}
            <h3 className="text-lg font-bold text-text-primary mt-6 mb-1">&#x2630; Monthly Forecast</h3>
            <p className="text-xs text-text-muted mb-3">Tap any month to see daily financial forecasts</p>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {report.monthlyForecasts.map((item, index) => {
                const ratingColor = MonthRatingColor(item.rating);
                const isExpanded = expandedMonth === index;
                return (
                  <button
                    key={`${item.month}-${item.year}`}
                    onClick={() => toggleMonth(index)}
                    className={`shrink-0 rounded-xl border transition-all text-left ${isExpanded ? 'border-purple-500 w-52' : 'border-border-primary hover:border-border-primary/60 w-40'}`}
                    style={{ background: `linear-gradient(180deg, ${item.rating === 'favorable' ? 'rgba(16,185,129,0.12)' : item.rating === 'mixed' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)'}, rgba(26,31,54,0.95))` }}
                  >
                    <div className="p-3">
                      <div className="w-10 h-1 rounded-full mb-2" style={{ backgroundColor: ratingColor }} />
                      <p className="font-semibold text-text-primary text-sm">{item.month}</p>
                      <p className="text-xs text-text-muted">{item.year}</p>
                      <p className="text-2xl font-extrabold mt-1" style={{ color: ratingColor }}>{item.score}</p>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: ratingColor }}>
                        {item.rating === 'favorable' ? 'Favorable' : item.rating === 'mixed' ? 'Mixed' : 'Cautious'}
                      </p>
                      <hr className="border-border-primary my-2" />
                      <p className="text-xs text-accent-secondary line-clamp-2">{item.keyTransit}</p>
                      <p className={`text-xs text-text-tertiary leading-[18px] mt-1 ${isExpanded ? '' : 'line-clamp-4'}`}>{item.outlook}</p>
                      {isExpanded ? (
                        <p className="text-xs text-purple-400 mt-2 font-semibold">▼ Daily Breakdown</p>
                      ) : (
                        <p className="text-[10px] text-text-muted mt-2 italic">Tap for daily view</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Daily Breakdown */}
            {expandedMonth !== null && dailyData.length > 0 && report.monthlyForecasts[expandedMonth] && (
              <div className="card mt-3">
                <h4 className="text-sm font-bold text-text-primary mb-3">
                  {FULL_MONTHS[report.monthlyForecasts[expandedMonth].monthIndex]} {report.monthlyForecasts[expandedMonth].year} — Daily Forecast
                </h4>
                <div className="max-h-[400px] overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                  {dailyData.map((day, idx) => {
                    const scoreColor = getDailyScoreColor(day.score);
                    const isToday = day.date.getDate() === now.getDate() && day.date.getMonth() === now.getMonth() && day.date.getFullYear() === now.getFullYear();
                    const isDayExpanded = expandedDay === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setExpandedDay(isDayExpanded ? null : idx)}
                        className={`w-full text-left rounded-lg p-2.5 transition-all ${isToday ? 'ring-1 ring-purple-500/50 bg-purple-500/5' : ''} ${isDayExpanded ? 'bg-bg-tertiary' : 'hover:bg-bg-secondary'}`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Day number + weekday */}
                          <div className="w-10 text-center shrink-0">
                            <p className={`text-sm font-bold ${isToday ? 'text-purple-400' : 'text-text-primary'}`}>{day.day}</p>
                            <p className="text-[10px] text-text-muted">{day.weekday}</p>
                          </div>
                          {/* Score bar */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 rounded-full bg-bg-primary overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{ width: `${(day.score / 10) * 100}%`, backgroundColor: scoreColor }} />
                              </div>
                              <span className="text-xs font-bold w-7 text-right" style={{ color: scoreColor }}>
                                {day.score.toFixed(1)}
                              </span>
                            </div>
                          </div>
                          {/* Brief label */}
                          {!isDayExpanded && (
                            <span className="text-[11px] text-text-muted w-12 text-right shrink-0">
                              {day.score >= 7 ? 'Strong' : day.score >= 4.5 ? 'Steady' : 'Quiet'}
                            </span>
                          )}
                        </div>
                        {/* Expanded details */}
                        {isDayExpanded && (
                          <div className="mt-2 pl-[52px]">
                            <p className="text-xs text-text-secondary leading-relaxed">{day.insight}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs bg-purple-500/15 text-purple-300 rounded-full px-2 py-0.5">
                                {ZODIAC_GLYPHS[day.moonSign] || ''} Moon in {day.moonSign}
                              </span>
                            </div>
                            <p className="text-[11px] text-text-muted mt-2 font-semibold">Best for:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {day.bestFor.split(', ').filter(Boolean).map((tag, ti) => (
                                <span key={ti} className="text-[10px] bg-amber-500/10 text-amber-400 rounded-full px-2 py-0.5">{tag}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. Timing Windows */}
            <h3 className="text-lg font-bold text-text-primary mt-6 mb-2">✨ Best Timing Windows</h3>
            <div className="card bg-gradient-to-br from-amber-500/10 to-amber-500/[0.02]">
              {report.timingWindows.map((tw, i) => (
                <div key={i} className={`py-2 ${i < report.timingWindows.length - 1 ? 'border-b border-amber-500/15 pb-3 mb-2' : ''}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{tw.icon}</span>
                    <span className="text-sm font-semibold text-amber-400">{tw.category}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tw.months.map((m, j) => (
                      <span key={j} className={`text-xs font-semibold px-2 py-1 rounded ${tw.category.includes('Cautious') ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 7. AI Financial Reading Button */}
            <button
              onClick={requestAiReading}
              disabled={aiLoading}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
            >
              {aiLoading ? (
                <span className="animate-spin w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {showAi ? 'Regenerate Financial Reading' : 'Get Your Personal Financial Reading'}
                </>
              )}
            </button>

            {/* 8. AI Reading Content */}
            {showAi && (
              <div className="card bg-gradient-to-br from-amber-500/5 via-purple-500/5 to-amber-500/[0.02] mt-3">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-amber-500/20">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-semibold text-amber-400">Your Personal Financial Reading</span>
                </div>
                {aiText ? (
                  <RenderMarkdown text={aiText} />
                ) : (
                  <div className="flex items-center justify-center gap-2 py-6">
                    <span className="animate-spin w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full" />
                    <span className="text-text-muted text-sm">Reading your financial stars...</span>
                  </div>
                )}
                {aiLoading && aiText.length > 0 && <span className="text-accent-primary text-base">&block;</span>}
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 mb-4 p-3 rounded-xl bg-bg-tertiary/50">
          <p className="text-xs text-text-muted text-center">
            &#x26A0; This report is for entertainment and educational purposes only.
            Not financial advice. Always consult a qualified financial advisor before making investment decisions.
          </p>
        </div>
      </div>
    </PaywallGate>
  );
}
