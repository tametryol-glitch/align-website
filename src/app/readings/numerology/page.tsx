'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Hash, ArrowLeft, Sparkles, ChevronDown, ChevronUp, Copy, Check, Heart, Calendar, Clover, Share2, Download } from 'lucide-react';
import { PaywallGate } from '@/components/ui/PaywallGate';
import { useAuthStore } from '@/stores/authStore';
import {
  calculateNumerology,
  calculateCompatibility,
  isMasterNumber,
  getNumberCompatibility,
  getLuckyNumbers,
  getDailyNumber,
  getDailyPersonalInteraction,
  NUMBER_MEANINGS,
  type NumerologyResult,
  type NumerologyCoreNumber,
  type CompatibilityResult,
} from '@/lib/numerologyCalc';

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors text-text-muted hover:text-text-primary"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function NumberCircle({ num }: { num: NumerologyCoreNumber }) {
  const master = isMasterNumber(num.value);
  const showDisplay = num.display !== String(num.value);
  return (
    <div className="flex flex-col items-center gap-1.5 w-[85px]">
      <div className={`w-[72px] h-[72px] rounded-full flex flex-col items-center justify-center border-2 ${
        master
          ? 'border-amber-500 bg-gradient-to-b from-amber-500/15 to-amber-500/5'
          : 'border-accent-muted bg-bg-card'
      }`}>
        <span className={`font-bold ${master ? 'text-amber-400' : 'text-accent-secondary'} ${showDisplay ? 'text-lg' : 'text-2xl'}`}>
          {num.display}
        </span>
      </div>
      <span className="text-[11px] text-text-tertiary text-center leading-tight">{num.label}</span>
      {master && (
        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded">
          Master
        </span>
      )}
    </div>
  );
}

function InterpretationCard({ num, defaultOpen = false }: { num: NumerologyCoreNumber; defaultOpen?: boolean }) {
  const [expanded, setExpanded] = useState(defaultOpen);
  const master = isMasterNumber(num.value);
  const meaning = NUMBER_MEANINGS[num.value];

  return (
    <div className="card">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
            master ? 'bg-amber-500/15 text-amber-400' : 'bg-accent-muted text-accent-primary'
          }`}>
            <span className="text-sm font-bold">{num.value}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-text-primary">{num.label}</h4>
            {meaning && <p className="text-xs text-text-muted">{meaning.title}</p>}
          </div>
          <CopyBtn text={num.interpretation} />
          {expanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
        </div>
      </button>
      {expanded && meaning && (
        <div className="mt-3 pt-3 border-t border-border-primary space-y-3 text-sm text-text-secondary leading-relaxed">
          <p>{meaning.personality}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-bg-secondary rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold mb-1">Strengths</p>
              <p className="text-xs text-text-secondary">{meaning.strengths}</p>
            </div>
            <div className="bg-bg-secondary rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wider text-red-400 font-semibold mb-1">Challenges</p>
              <p className="text-xs text-text-secondary">{meaning.challenges}</p>
            </div>
            <div className="bg-bg-secondary rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold mb-1">Career</p>
              <p className="text-xs text-text-secondary">{meaning.career}</p>
            </div>
            <div className="bg-bg-secondary rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wider text-pink-400 font-semibold mb-1">Relationships</p>
              <p className="text-xs text-text-secondary">{meaning.relationships}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function generatePersonalReading(result: NumerologyResult, firstName: string): string {
  const lp = result.life_path;
  const expr = result.expression;
  const soul = result.soul_urge;
  const pers = result.personality;
  const bd = result.birthday_number;
  const isMaster = (v: number) => [11, 22, 33].includes(v);

  let r = '';
  r += `Hey ${firstName} — I just ran your numbers, and I have to tell you, your chart is really something. Certain combinations just jump off the page. Yours is one of those.\n\n`;
  r += `Numerology is not about fortune telling. It is about understanding the blueprint you were born with. Your name and your birth date are not accidents. They carry a vibration, a frequency, and that frequency tells a story about who you are, why you are here, and where you are headed.\n\n`;

  r += `--- LIFE PATH: ${lp.display} ---\n\n`;
  r += `This is the single most important number in your entire chart. It reveals the road you are walking in this lifetime.\n\n`;
  r += `${lp.interpretation}\n\n`;
  if (isMaster(lp.value)) {
    r += `You carry a Master Number on your Life Path. A Master Number means you came into this life with a higher calling — more potential, but also more pressure. That is your ${lp.value} energy.\n\n`;
  }

  r += `--- EXPRESSION: ${expr.display} ---\n\n`;
  r += `Your Expression number comes from your full birth name — every letter carries a numerical vibration.\n\n`;
  r += `${expr.interpretation}\n\n`;

  r += `--- SOUL URGE: ${soul.display} ---\n\n`;
  r += `Your Soul Urge reveals the deepest desire of your heart.\n\n`;
  r += `${soul.interpretation}\n\n`;

  r += `--- PERSONALITY: ${pers.display} ---\n\n`;
  r += `Your Personality number reveals how the world sees you.\n\n`;
  r += `${pers.interpretation}\n\n`;

  r += `--- BIRTHDAY: ${bd.display} ---\n\n`;
  r += `Your Birthday number reveals a special talent you carry.\n\n`;
  r += `${bd.interpretation}\n\n`;

  r += `--- PERSONAL YEAR: ${result.personal_year_display} ---\n\n`;
  r += `${result.personal_year_meaning}\n\n`;

  r += `--- FINAL THOUGHTS ---\n\n`;
  r += `${firstName}, your numbers are not a cage — they are a compass. Come back to this reading when life gets noisy and you need a reminder of the truth underneath all the chaos.\n`;

  const lpM = NUMBER_MEANINGS[lp.value];
  const exprM = NUMBER_MEANINGS[expr.value];
  const soulM = NUMBER_MEANINGS[soul.value];
  if (lpM || exprM || soulM) {
    r += `\n--- QUICK REFERENCE ---\n\n`;
    if (lpM) r += `Life Path ${lp.display} — ${lpM.title}\nStrengths: ${lpM.strengths}\nChallenges: ${lpM.challenges}\nCareer: ${lpM.career}\nRelationships: ${lpM.relationships}\n\n`;
    if (exprM) r += `Expression ${expr.display} — ${exprM.title}\nStrengths: ${exprM.strengths}\nChallenges: ${exprM.challenges}\n\n`;
    if (soulM) r += `Soul Urge ${soul.display} — ${soulM.title}\nStrengths: ${soulM.strengths}\nRelationships: ${soulM.relationships}\n`;
  }

  return r;
}

function ShareCard({ result, name }: { result: NumerologyResult; name: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generated, setGenerated] = useState(false);

  function generate() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 800;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 600, 800);
    grad.addColorStop(0, '#0f0a1e');
    grad.addColorStop(0.5, '#1a1035');
    grad.addColorStop(1, '#0f0a1e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 800);

    // Accent line
    const accentGrad = ctx.createLinearGradient(100, 0, 500, 0);
    accentGrad.addColorStop(0, 'rgba(139,92,246,0)');
    accentGrad.addColorStop(0.5, 'rgba(139,92,246,0.6)');
    accentGrad.addColorStop(1, 'rgba(139,92,246,0)');
    ctx.fillStyle = accentGrad;
    ctx.fillRect(50, 90, 500, 2);

    // Title
    ctx.fillStyle = '#e2e0ff';
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('# Numerology', 300, 55);
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillStyle = '#8b7fad';
    ctx.fillText(name, 300, 80);

    // Number circles
    const nums = [result.life_path, result.expression, result.soul_urge, result.personality, result.birthday_number];
    const startX = 60;
    const gap = 120;
    nums.forEach((n, i) => {
      const cx = startX + i * gap;
      const cy = 160;
      const master = isMasterNumber(n.value);

      ctx.beginPath();
      ctx.arc(cx, cy, 38, 0, Math.PI * 2);
      ctx.strokeStyle = master ? '#f59e0b' : 'rgba(139,92,246,0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (master) {
        ctx.fillStyle = 'rgba(245,158,11,0.1)';
        ctx.fill();
      }

      ctx.fillStyle = master ? '#fbbf24' : '#c4b5fd';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(n.display, cx, cy + 8);

      ctx.fillStyle = '#8b7fad';
      ctx.font = '10px system-ui, sans-serif';
      ctx.fillText(n.label, cx, cy + 52);

      if (master) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 8px system-ui, sans-serif';
        ctx.fillText('MASTER', cx, cy + 65);
      }
    });

    // Personal Year
    ctx.fillStyle = 'rgba(139,92,246,0.1)';
    ctx.beginPath();
    ctx.roundRect(50, 250, 500, 90, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(139,92,246,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#a78bfa';
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PERSONAL YEAR', 300, 275);
    ctx.fillStyle = '#e2e0ff';
    ctx.font = 'bold 32px system-ui, sans-serif';
    ctx.fillText(String(result.personal_year), 300, 320);

    // Interpretations
    let y = 380;
    nums.forEach((n) => {
      const meaning = NUMBER_MEANINGS[n.value];
      if (!meaning) return;
      const master = isMasterNumber(n.value);

      ctx.fillStyle = master ? '#fbbf24' : '#c4b5fd';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${n.label} ${n.display} — ${meaning.title}`, 70, y);

      ctx.fillStyle = '#8b7fad';
      ctx.font = '11px system-ui, sans-serif';
      const short = meaning.personality.slice(0, 80) + '...';
      ctx.fillText(short, 70, y + 18);
      y += 50;
    });

    // Lucky numbers
    const lucky = getLuckyNumbers(result);
    ctx.fillStyle = '#a78bfa';
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LUCKY NUMBERS', 300, y + 15);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText(lucky.join('  ·  '), 300, y + 40);

    // Footer
    ctx.fillStyle = 'rgba(139,92,246,0.15)';
    ctx.fillRect(0, 750, 600, 50);
    ctx.fillStyle = '#6d5f8a';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('aligncosmic.com', 300, 780);

    setGenerated(true);
  }

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `numerology-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <div>
      <canvas ref={canvasRef} className="hidden" />
      {!generated ? (
        <button onClick={generate} className="btn-secondary w-full flex items-center justify-center gap-2">
          <Share2 className="w-4 h-4" /> Generate Share Card
        </button>
      ) : (
        <div className="space-y-3">
          <canvas ref={canvasRef} className="w-full rounded-xl border border-border-primary" style={{ maxWidth: 600 }} />
          <button onClick={download} className="btn-secondary w-full flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Download Image
          </button>
        </div>
      )}
    </div>
  );
}

export default function NumerologyPage() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const [error, setError] = useState('');
  const [showReading, setShowReading] = useState(false);
  const [readingText, setReadingText] = useState('');
  const [readingCopied, setReadingCopied] = useState(false);

  // Compatibility
  const [showCompat, setShowCompat] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerDate, setPartnerDate] = useState('');
  const [compatResult, setCompatResult] = useState<CompatibilityResult | null>(null);
  const [compatError, setCompatError] = useState('');

  const hasProfileData = !!(profile?.display_name && profile?.birth_date);

  useEffect(() => {
    if (hasProfileData) {
      try {
        const r = calculateNumerology(profile!.display_name, profile!.birth_date!);
        setResult(r);
        setName(profile!.display_name);
        setBirthDate(profile!.birth_date!);
      } catch {
        setError('Could not calculate numerology from your profile data.');
      }
    }
  }, [hasProfileData, profile?.display_name, profile?.birth_date]);

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const r = calculateNumerology(name, birthDate);
      setResult(r);
      setShowReading(false);
      setReadingText('');
      setCompatResult(null);
    } catch {
      setError('Invalid input. Please check your name and date.');
    }
  }

  function handleGetReading() {
    if (!result) return;
    const firstName = name.split(' ')[0] || 'friend';
    const text = generatePersonalReading(result, firstName);
    setReadingText(text);
    setShowReading(true);
  }

  function handleCompatibility(e: React.FormEvent) {
    e.preventDefault();
    setCompatError('');
    try {
      const cr = calculateCompatibility(name, birthDate, partnerName, partnerDate);
      setCompatResult(cr);
    } catch {
      setCompatError('Invalid input. Please check the name and date.');
    }
  }

  const coreNumbers = useMemo(() => {
    if (!result) return [];
    return [result.life_path, result.expression, result.soul_urge, result.personality, result.birthday_number];
  }, [result]);

  const compatibility = useMemo(() => result ? getNumberCompatibility(result) : '', [result]);
  const luckyNumbers = useMemo(() => result ? getLuckyNumbers(result) : [], [result]);
  const daily = useMemo(() => getDailyNumber(), []);
  const dailyInteraction = useMemo(
    () => result ? getDailyPersonalInteraction(daily.number, result.personal_year) : '',
    [result, daily.number]
  );

  return (
    <PaywallGate feature="numerology_reading" fallbackTier="light">
      <div className="max-w-3xl mx-auto">
        <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
          <ArrowLeft className="w-4 h-4" /> {t('readings.backToReadings')}
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <Hash className="w-8 h-8 text-accent-primary" />
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">{t('readings.numerologyPage.title')}</h1>
            <p className="text-text-tertiary text-sm">{t('readings.numerologyPage.subtitle')}</p>
          </div>
        </div>

        {/* Form */}
        {!result && (
          <form onSubmit={handleCalculate} className="card space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="input" placeholder="Your full birth name" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Birth Date</label>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
                className="input" required />
            </div>
            <button type="submit" className="btn-primary w-full">Calculate Numerology</button>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </form>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-5">
            {/* Number Grid */}
            <div className="flex flex-wrap justify-center gap-4 py-2">
              {coreNumbers.map((num) => (
                <NumberCircle key={num.label} num={num} />
              ))}
            </div>

            {/* Number Compatibility Insight */}
            {compatibility && (
              <div className="card border-accent-muted/30">
                <p className="text-[10px] uppercase tracking-widest text-accent-secondary font-semibold mb-2">
                  How Your Numbers Interact
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">{compatibility}</p>
              </div>
            )}

            {/* Daily Number */}
            <div className="card bg-gradient-to-r from-accent-primary/5 to-transparent">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-4 h-4 text-accent-primary" />
                <p className="text-[10px] uppercase tracking-widest text-accent-secondary font-semibold">
                  Today&apos;s Universal Number
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-accent-primary">{daily.display}</span>
                <div className="flex-1">
                  <p className="text-sm text-text-secondary">{daily.meaning}</p>
                  {dailyInteraction && (
                    <p className="text-xs text-text-muted mt-1 italic">{dailyInteraction}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Year */}
            <div className="card border-accent-muted bg-gradient-cosmic text-center">
              <div className="flex items-center justify-center gap-2">
                <p className="text-[10px] uppercase tracking-widest text-accent-secondary font-semibold">
                  Personal Year
                </p>
                <CopyBtn text={result.personal_year_meaning} />
              </div>
              <p className="text-4xl font-bold text-text-primary my-2">{result.personal_year}</p>
              {result.personal_year_meaning && (
                <p className="text-sm text-text-secondary leading-relaxed max-w-lg mx-auto">
                  {result.personal_year_meaning}
                </p>
              )}
            </div>

            {/* Lucky Numbers */}
            {luckyNumbers.length > 0 && (
              <div className="card bg-gradient-to-r from-amber-500/5 to-transparent">
                <div className="flex items-center gap-2 mb-3">
                  <Clover className="w-4 h-4 text-amber-400" />
                  <p className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold">
                    Your Lucky Numbers
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  {luckyNumbers.map((n) => (
                    <div key={n} className="w-12 h-12 rounded-full border-2 border-amber-500/30 bg-amber-500/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-amber-400">{n}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-text-muted text-center mt-2">
                  Derived from the harmonic patterns in your core numbers
                </p>
              </div>
            )}

            {/* Interpretations */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-3">Interpretations</h3>
              <div className="space-y-2">
                {coreNumbers.map((num, i) => (
                  <InterpretationCard key={num.label} num={num} defaultOpen={i === 0} />
                ))}
              </div>
            </div>

            {/* Angel Numbers */}
            {result.angel_numbers.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-3">Angel Numbers</h3>
                <div className="space-y-2">
                  {result.angel_numbers.map((angel) => (
                    <div key={angel.number} className="card bg-gradient-to-r from-amber-500/5 to-transparent">
                      <div className="flex items-start gap-3">
                        <span className="text-xl font-bold text-amber-400 min-w-[50px]">{angel.number}</span>
                        <p className="text-sm text-text-secondary leading-relaxed flex-1">{angel.meaning}</p>
                        <CopyBtn text={angel.meaning} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personal Reading Button */}
            <button onClick={handleGetReading} className="btn-primary w-full flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              {showReading ? 'Regenerate Personal Reading' : 'Get Your Personal Reading'}
            </button>

            {/* Personal Reading */}
            {showReading && readingText && (
              <div className="card border-accent-muted bg-gradient-cosmic">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] uppercase tracking-widest text-accent-secondary font-semibold">
                    Personal Reading
                  </p>
                  <button
                    onClick={() => { navigator.clipboard.writeText(readingText); setReadingCopied(true); setTimeout(() => setReadingCopied(false), 2000); }}
                    className="text-xs text-text-muted hover:text-text-primary flex items-center gap-1"
                  >
                    {readingCopied ? <><Check className="w-3 h-3 text-emerald-400" /> Copied</> : <><Copy className="w-3 h-3" /> Copy All</>}
                  </button>
                </div>
                <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                  {readingText}
                </div>
              </div>
            )}

            {/* Share Card */}
            <ShareCard result={result} name={name} />

            {/* Numerology Compatibility */}
            <div>
              <button
                onClick={() => setShowCompat(!showCompat)}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4" />
                {showCompat ? 'Hide Compatibility Check' : 'Check Compatibility With Someone'}
              </button>

              {showCompat && (
                <div className="mt-3 space-y-3">
                  <form onSubmit={handleCompatibility} className="card space-y-3">
                    <p className="text-xs text-text-muted">
                      Enter another person&apos;s name and birth date to see how your numbers align.
                    </p>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">Their Full Name</label>
                      <input type="text" value={partnerName} onChange={(e) => setPartnerName(e.target.value)}
                        className="input" placeholder="Full birth name" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">Their Birth Date</label>
                      <input type="date" value={partnerDate} onChange={(e) => setPartnerDate(e.target.value)}
                        className="input" required />
                    </div>
                    <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                      <Heart className="w-4 h-4" /> Compare Numbers
                    </button>
                    {compatError && <p className="text-red-400 text-sm">{compatError}</p>}
                  </form>

                  {compatResult && (
                    <div className="space-y-3">
                      {/* Score */}
                      <div className="card border-accent-muted bg-gradient-cosmic text-center">
                        <p className="text-[10px] uppercase tracking-widest text-accent-secondary font-semibold mb-1">
                          Compatibility Score
                        </p>
                        <p className="text-5xl font-bold text-text-primary my-2">{compatResult.score}</p>
                        <div className="w-full bg-bg-secondary rounded-full h-2 mb-3">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${compatResult.score}%`,
                              background: compatResult.score >= 80 ? '#10b981' : compatResult.score >= 60 ? '#f59e0b' : '#ef4444',
                            }}
                          />
                        </div>
                        <p className="text-sm text-text-secondary">{compatResult.overall}</p>
                      </div>

                      {/* Side by side numbers */}
                      <div className="card">
                        <div className="grid grid-cols-3 gap-2 text-center mb-4">
                          <div>
                            <p className="text-xs text-text-muted mb-1">{name.split(' ')[0]}</p>
                          </div>
                          <div><p className="text-xs text-text-muted mb-1">vs</p></div>
                          <div>
                            <p className="text-xs text-text-muted mb-1">{partnerName.split(' ')[0]}</p>
                          </div>
                        </div>
                        {(['life_path', 'expression', 'soul_urge'] as const).map((key) => {
                          const n1 = compatResult.person1[key];
                          const n2 = compatResult.person2[key];
                          return (
                            <div key={key} className="grid grid-cols-3 gap-2 text-center py-2 border-t border-border-primary">
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-lg font-bold text-accent-primary">{n1.display}</span>
                              </div>
                              <div>
                                <p className="text-[10px] text-text-muted uppercase">{n1.label}</p>
                              </div>
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-lg font-bold text-pink-400">{n2.display}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Match details */}
                      <div className="card">
                        <h4 className="text-sm font-semibold text-text-primary mb-3">How You Connect</h4>
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="text-xs text-accent-primary font-semibold mb-1">Life Path Connection</p>
                            <p className="text-text-secondary">{compatResult.life_path_match}</p>
                          </div>
                          <div>
                            <p className="text-xs text-blue-400 font-semibold mb-1">Expression Dynamic</p>
                            <p className="text-text-secondary">{compatResult.expression_match}</p>
                          </div>
                          <div>
                            <p className="text-xs text-pink-400 font-semibold mb-1">Soul Connection</p>
                            <p className="text-text-secondary">{compatResult.soul_urge_match}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recalculate */}
            <button onClick={() => { setResult(null); setShowReading(false); setReadingText(''); setCompatResult(null); }}
              className="btn-secondary w-full">
              Calculate for Different Name
            </button>
          </div>
        )}
      </div>
    </PaywallGate>
  );
}
