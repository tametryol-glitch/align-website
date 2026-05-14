'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Star, Sparkles, RotateCcw, Eye, Check, Copy, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useAstrologySettings } from '@/stores/astrologySettingsStore';
import { api, buildBirthData } from '@/lib/api';
import { drawCards as drawLocalCards, type DrawnCard } from '@/lib/tarotDeck';
import ReactMarkdown from 'react-markdown';
import ShareButton from '@/components/ui/ShareButton';
import { PaywallGate } from '@/components/ui/PaywallGate';

type SpreadType = 'single' | 'three_card' | 'celtic_cross' | 'relationship' | 'career';

interface SpreadOption {
  key: SpreadType;
  label: string;
  icon: string;
  cardCount: number;
}

const SPREAD_OPTIONS: SpreadOption[] = [
  { key: 'single', label: 'Single Card', icon: '♠', cardCount: 1 },
  { key: 'three_card', label: 'Three Card', icon: '♣', cardCount: 3 },
  { key: 'celtic_cross', label: 'Celtic Cross', icon: '✚', cardCount: 10 },
  { key: 'relationship', label: 'Relationship', icon: '♥', cardCount: 5 },
  { key: 'career', label: 'Career', icon: '♦', cardCount: 5 },
];

const THREE_CARD_LABELS = ['Past', 'Present', 'Future'];
const CELTIC_CROSS_LABELS = [
  'Present', 'Challenge', 'Foundation', 'Recent Past',
  'Crown', 'Near Future', 'Self', 'Environment',
  'Hopes/Fears', 'Outcome',
];
const RELATIONSHIP_LABELS = ['You', 'Partner', 'Connection', 'Challenge', 'Potential'];
const CAREER_LABELS = ['Current', 'Obstacle', 'Hidden Factor', 'Advice', 'Outcome'];

function getPositionLabels(spread: SpreadType): string[] {
  switch (spread) {
    case 'single': return ['Focus'];
    case 'three_card': return THREE_CARD_LABELS;
    case 'celtic_cross': return CELTIC_CROSS_LABELS;
    case 'relationship': return RELATIONSHIP_LABELS;
    case 'career': return CAREER_LABELS;
    default: return [];
  }
}

interface TarotResult {
  spread_type: SpreadType;
  cards: DrawnCard[];
  question?: string;
}

// ── Build chart context for AI prompt ──
function buildChartContext(profile: any, natalData: any, progressedData: any, houseSystem?: string): string {
  const name = profile?.display_name || 'User';
  const parts: string[] = [];

  const houseSystemMap: Record<string, string> = {
    'placidus': 'Placidus', 'whole_sign': 'Whole Sign', 'koch': 'Koch',
    'campanus': 'Campanus', 'regiomontanus': 'Regiomontanus',
    'equal': 'Equal House', 'porphyry': 'Porphyry', 'alcabitius': 'Alcabitius',
  };
  const hsDisplay = houseSystemMap[houseSystem || 'whole_sign'] || 'Whole Sign';

  parts.push(`HOUSE SYSTEM: ${hsDisplay}`);
  parts.push('');

  if (profile?.birth_date) {
    parts.push('=== BIRTH DATA ===');
    parts.push(`Name: ${name}`);
    parts.push(`Birth Date: ${profile.birth_date}`);
    if (profile.birth_time) parts.push(`Birth Time: ${profile.birth_time}`);
    if (profile.birth_location) parts.push(`Birth Location: ${profile.birth_location}`);
    parts.push('');
  }

  if (natalData) {
    const planets = natalData.planets || natalData.positions || [];
    if (planets.length > 0) {
      parts.push('=== NATAL CHART ===');
      for (const p of planets) {
        const pName = p.name || p.planet || 'Unknown';
        const sign = p.sign || '';
        const deg = p.sign_degree != null ? `${p.sign_degree.toFixed(1)}°` : '';
        const house = p.house ? `House ${p.house}` : '';
        const rx = p.is_retrograde ? ' (Rx)' : '';
        parts.push(`${pName}: ${deg} ${sign} ${house}${rx}`.trim());
      }
      parts.push('');
    }

    const aspects = natalData.aspects || [];
    if (aspects.length > 0) {
      parts.push('=== NATAL ASPECTS ===');
      for (const a of aspects) {
        const p1 = a.planet1 || a.body1 || '';
        const p2 = a.planet2 || a.body2 || '';
        const asp = a.aspect || a.type || '';
        const orb = a.orb != null ? `(${a.orb.toFixed(1)}° orb)` : '';
        parts.push(`${p1} ${asp} ${p2} ${orb}`.trim());
      }
      parts.push('');
    }

    const houses = natalData.houses || [];
    if (houses.length > 0) {
      parts.push('=== HOUSES ===');
      for (const h of houses) {
        parts.push(`House ${h.house || h.number || ''}: ${h.sign || ''}`);
      }
      parts.push('');
    }
  }

  if (progressedData) {
    const pPlanets = progressedData.planets || progressedData.positions || [];
    if (pPlanets.length > 0) {
      parts.push('=== PROGRESSED CHART (Secondary Progressions — current) ===');
      for (const p of pPlanets) {
        const pName = p.name || p.planet || 'Unknown';
        const sign = p.sign || '';
        const deg = p.sign_degree != null ? `${p.sign_degree.toFixed(1)}°` : '';
        const house = p.house ? `House ${p.house}` : '';
        const rx = p.is_retrograde ? ' (Rx)' : '';
        parts.push(`${pName}: ${deg} ${sign} ${house}${rx}`.trim());
      }
      parts.push('');
    }

    const pAspects = progressedData.aspects || [];
    if (pAspects.length > 0) {
      parts.push('=== PROGRESSED ASPECTS ===');
      for (const a of pAspects) {
        const p1 = a.planet1 || a.body1 || '';
        const p2 = a.planet2 || a.body2 || '';
        const asp = a.aspect || a.type || '';
        const orb = a.orb != null ? `(${a.orb.toFixed(1)}° orb)` : '';
        parts.push(`${p1} ${asp} ${p2} ${orb}`.trim());
      }
      parts.push('');
    }
  }

  return parts.join('\n');
}

function buildTarotSystemPrompt(cards: DrawnCard[], question: string | undefined, userName: string, chartContext: string): string {
  const cardDescriptions = cards.map(c => {
    const kw = c.keywords?.join(', ') || '';
    return `- **${c.position}**: ${c.name}${c.reversed ? ' (REVERSED)' : ''} [${c.arcana === 'major' ? 'Major Arcana' : c.suit + ' — Minor Arcana'}] — Keywords: ${kw}${c.imagery ? ' — Imagery: ' + c.imagery : ''}`;
  }).join('\n');

  return `You are ${userName}'s personal tarot reader inside the Align app. You are a deeply intuitive guide — warm, wise, and perceptive. You feel things about people that you shouldn't be able to know.

HIDDEN CONTEXT — FOR YOUR EYES ONLY (the user must NEVER see this):
You have access to ${userName}'s full natal chart AND their current secondary progressed chart below. Use this data to make your reading eerily accurate and personally specific. But NEVER mention the chart, astrology terms, degrees, signs, houses, aspects, transits, progressions, or any technical language. The user should feel like you just *know* them — not that you're reading a chart.

Custom rulership system (use internally only):
- Virgo is ruled by VESTA (NOT Mercury)
- Libra is ruled by JUNO (NOT Venus)

${chartContext}

=== TAROT SPREAD ===
${cardDescriptions}
${question ? '\nUser\'s Question: "' + question + '"' : '\nNo specific question — give a general life reading.'}

=== YOUR INSTRUCTIONS ===

You are not an astrologer giving a chart reading. You are an intuitive reader who happens to have psychic-level insight into ${userName}'s life patterns, timing, and inner world. The chart data is your secret weapon — it tells you WHAT to say, but the WAY you say it must sound like pure intuition, not astrology.

RULES — FOLLOW THESE EXACTLY:

1. **BE DIRECT.** ${question ? userName + ' asked "' + question + '" — ANSWER IT clearly in the first 2-3 sentences. No dancing around it. Then go deeper into what each card reveals.' : 'Give ' + userName + ' clear, real guidance — not fortune-cookie platitudes.'}

2. **TRANSLATE, DON'T EXPOSE.** You know from the chart that ${userName} has specific placements and patterns. TRANSLATE that knowledge into human, emotional language. Instead of "your Saturn in Virgo in the 2nd house," say "you've always carried this deep need to prove your worth through hard work — almost like security is something you have to earn, never something you can just trust." Same insight, zero jargon.

3. **USE THE PROGRESSED CHART INVISIBLY.** The progressed chart tells you what phase ${userName} is in RIGHT NOW. Use it to nail the timing — "something shifted for you recently" or "you're entering a chapter where..." — but NEVER say "progressed Moon" or "secondary progressions." It should feel like you just sense where they are in life.

4. **NEVER BE VAGUE.** No "you may be feeling" or "something could be shifting." Be specific and confident: "You've been holding onto something that stopped serving you a while ago — and you know exactly what it is." The chart data gives you the specificity. Use it.

5. **MAKE THEM FEEL SEEN.** This is the most important rule. Name the exact tension, desire, fear, or secret hope that the cards and their energy reveal. Be the reader who says out loud what they've been thinking privately. Make them feel like someone finally understands what they're going through.

6. **REVERSED CARDS = GENTLE TRUTH.** When a card is reversed, speak to the block or resistance with compassion. Don't lecture — illuminate. Help them see what they might be avoiding and why, in a way that feels supportive, not clinical.

7. **THE VERDICT MUST BE ACTIONABLE.** End with clear guidance: what to do, what to let go of, what to watch for, and a sense of timing ("in the coming weeks" or "before the end of this season"). Ground it in real steps they can take.

ABSOLUTELY FORBIDDEN — never use any of these:
- Degree symbols (°), sign names used technically (e.g., "your Scorpio stellium"), house numbers
- "Natal," "progressed," "transit," "aspect," "conjunction," "opposition," "square," "trine," "sextile"
- "Chart," "placement," "ruling planet," "house of," "activated," "aspecting"
- Any language that sounds like an astrology textbook

INSTEAD, use language like:
- "I sense that..." / "There's something about you that..."
- "You've always been someone who..." / "Deep down, you know that..."
- "Right now, you're in a season of..." / "Something is shifting for you..."
- "The cards are showing me..." / "What's coming through strongly is..."

FORMAT:
- Use markdown headers (## for main title, ### for each card position)
- Address ${userName} by name naturally, like a friend
- Keep the tone warm, grounded, and intimate — like a wise friend who sees right through you
- The reading should be thorough and substantial — don't rush
- End with a ### The Verdict section that pulls it all together into clear, loving guidance`;
}

// ── UI Components ──

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
      title={copied ? 'Copied!' : 'Copy'}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-text-muted" />}
    </button>
  );
}

function CardBack({ index, onClick }: { index: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full group cursor-pointer">
      <div
        className="relative rounded-xl overflow-hidden min-h-[180px] bg-gradient-to-br from-[#1a103a] via-[#2d1b69] to-[#1a103a] border border-accent-primary/30 flex items-center justify-center transition-all duration-300 hover:scale-[1.02] hover:border-accent-primary/50 hover:shadow-lg hover:shadow-accent-primary/10"
        style={{ animationDelay: `${index * 150}ms` }}
      >
        <div className="absolute inset-2 border border-accent-primary/15 rounded-lg" />
        <span className="text-4xl text-accent-primary/60 group-hover:text-accent-primary/80 transition-colors">{'✦'}</span>
      </div>
      <p className="text-[11px] text-text-muted text-center mt-1.5 group-hover:text-text-tertiary transition-colors">Tap to reveal</p>
    </button>
  );
}

function RevealedCard({ card }: { card: DrawnCard }) {
  const borderColor = card.reversed ? 'border-red-500/20' : 'border-accent-primary/20';
  const bgGradient = card.reversed
    ? 'from-red-500/10 to-red-500/[0.02]'
    : 'from-accent-primary/10 to-accent-primary/[0.02]';

  return (
    <div className={`rounded-xl border ${borderColor} bg-gradient-to-b ${bgGradient} p-4 min-h-[180px] flex flex-col items-center justify-center gap-1.5 animate-in fade-in zoom-in-95 duration-300`}>
      <h3 className="font-display font-semibold text-text-primary text-center text-sm">{card.name}</h3>
      {card.reversed && (
        <span className="text-[10px] uppercase font-semibold tracking-wider text-red-400 bg-red-500/15 px-2 py-0.5 rounded">Reversed</span>
      )}
      <span className="text-[11px] text-text-muted">{card.arcana === 'major' ? 'Major Arcana' : `${card.suit} • Minor Arcana`}</span>
      {card.imagery && (
        <p className="text-xs text-text-secondary italic text-center mt-1 leading-relaxed px-1">{card.imagery}</p>
      )}
      {card.keywords && card.keywords.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1 mt-1.5">
          {card.keywords.map((kw) => (
            <span key={kw} className="text-[10px] bg-accent-primary/10 text-accent-primary/80 px-1.5 py-0.5 rounded-full">{kw}</span>
          ))}
        </div>
      )}
      <CopyButton text={`${card.name}${card.reversed ? ' (Reversed)' : ''} — ${card.arcana}${card.imagery ? '\n\n' + card.imagery : ''}${card.keywords?.length ? '\nKeywords: ' + card.keywords.join(', ') : ''}`} />
    </div>
  );
}

// ── Main Page Component ──

export default function TarotPage() {
  const { profile } = useAuthStore();
  const { hasAccess } = useSubscriptionStore();
  const { houseSystem } = useAstrologySettings();
  const [spreadType, setSpreadType] = useState<SpreadType>('three_card');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TarotResult | null>(null);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [allRevealed, setAllRevealed] = useState(false);
  const [error, setError] = useState('');
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [copied, setCopied] = useState(false);

  // Chart data for AI readings
  const [natalData, setNatalData] = useState<any>(null);
  const [progressedData, setProgressedData] = useState<any>(null);
  const aiTextRef = useRef('');

  const selectedSpread = SPREAD_OPTIONS.find((s) => s.key === spreadType)!;
  const positionLabels = getPositionLabels(spreadType);

  // Load natal + progressed chart on mount
  useEffect(() => {
    if (profile?.birth_date && profile?.latitude) {
      const birthData = buildBirthData(profile);
      if (!natalData) {
        api.getNatalChart(birthData).then(setNatalData).catch(() => {});
      }
      if (!progressedData) {
        api.getProgressedChart(birthData).then(setProgressedData).catch(() => {});
      }
    }
  }, [profile?.birth_date, profile?.latitude]);

  async function drawCards() {
    setLoading(true);
    setError('');
    setResult(null);
    setRevealed(new Set());
    setAllRevealed(false);
    setShowAi(false);
    setAiText('');
    aiTextRef.current = '';

    await new Promise((r) => setTimeout(r, 1200));

    const labels = getPositionLabels(spreadType);
    const drawn = drawLocalCards(spreadType, labels);
    setResult({
      spread_type: spreadType,
      cards: drawn,
      question: question.trim() || undefined,
    });
    setLoading(false);
  }

  function revealCard(index: number) {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.add(index);
      if (result && next.size === result.cards.length) {
        setAllRevealed(true);
      }
      return next;
    });
  }

  function revealAll() {
    if (!result) return;
    const all = new Set(result.cards.map((_, i) => i));
    setRevealed(all);
    setAllRevealed(true);
  }

  const requestAI = useCallback(async () => {
    if (!result) return;
    setAiLoading(true);
    setShowAi(true);
    setAiText('');
    setError('');
    aiTextRef.current = '';

    const fullName = profile?.display_name || '';
    const userName = fullName.split(' ')[0] || 'you';
    const chartContext = buildChartContext(profile, natalData, progressedData, houseSystem);
    const systemPrompt = buildTarotSystemPrompt(result.cards, result.question, userName, chartContext);

    try {
      const cardSummary = result.cards.map(c => `${c.position}: ${c.name}${c.reversed ? ' (R)' : ''}`).join(' | ');
      await api.streamAIInterpretation(
        {
          chart_data_text: chartContext + '\n\n[Tarot: ' + cardSummary + ' | Q: ' + (result.question || 'general') + ' | t:' + Date.now() + ']',
          messages: [
            { role: 'user', content: systemPrompt + '\n\nRead my tarot spread now. Be direct and connect everything to my chart.' },
          ],
          type: 'astrologer_chat',
          chart_context: true,
        },
        (chunk) => {
          aiTextRef.current += chunk;
          setAiText(aiTextRef.current);
        },
        () => {
          setAiLoading(false);
        }
      );
    } catch (err: any) {
      setAiLoading(false);
      setError(err.message || 'Failed to generate reading. Please try again.');
    }
  }, [result, profile, natalData, progressedData, houseSystem]);

  function resetReading() {
    setResult(null);
    setRevealed(new Set());
    setAllRevealed(false);
    setShowAi(false);
    setAiText('');
    aiTextRef.current = '';
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-accent-primary/30 border-t-accent-primary animate-spin" />
          <span className="absolute inset-0 flex items-center justify-center text-2xl">{'✦'}</span>
        </div>
        <p className="text-text-tertiary text-sm animate-pulse">Shuffling the Cosmic Deck...</p>
      </div>
    );
  }

  return (
    <PaywallGate feature="tarot">
    <div className="max-w-3xl mx-auto">
      <Link href="/readings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to Readings
      </Link>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Star className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">{'♠'} Tarot Reading</h1>
          <p className="text-text-tertiary text-sm">Receive guidance from the arcana</p>
        </div>
      </div>

      {/* Spread Selection */}
      {!result && (
        <div className="card space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-3">Choose Your Spread</label>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {SPREAD_OPTIONS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSpreadType(s.key)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 p-3 rounded-xl border transition-all min-w-[100px] ${
                    spreadType === s.key
                      ? 'border-accent-primary bg-gradient-to-b from-accent-primary/20 to-accent-primary/5 text-accent-primary shadow-lg shadow-accent-primary/10'
                      : 'border-border-primary text-text-tertiary hover:border-border-secondary bg-bg-card'
                  }`}
                >
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-xs font-medium">{s.label}</span>
                  <span className="text-[10px] text-text-muted">{s.cardCount} {s.cardCount === 1 ? 'card' : 'cards'}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Your Question (Optional)</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="input min-h-[80px] resize-none"
              placeholder="What guidance do you seek?"
              rows={3}
            />
          </div>

          <button onClick={drawCards} disabled={loading} className="btn-primary w-full text-base py-3">
            {'✦'} Draw {selectedSpread.label}
          </button>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {result.question && (
            <div className="card">
              <p className="text-[11px] uppercase tracking-wider text-text-muted font-medium mb-1">Your Question</p>
              <p className="text-text-secondary italic">{result.question}</p>
            </div>
          )}

          <div className={`grid gap-3 ${
            spreadType === 'single' ? 'grid-cols-1 max-w-[250px] mx-auto' :
            spreadType === 'three_card' ? 'grid-cols-3' :
            'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
          }`}>
            {result.cards.map((card, i) => (
              <div key={i}>
                <p className="text-[10px] uppercase tracking-[1.5px] text-accent-primary/70 text-center mb-1.5 font-medium">
                  {positionLabels[i] || card.position}
                </p>
                {revealed.has(i) ? (
                  <RevealedCard card={card} />
                ) : (
                  <CardBack index={i} onClick={() => revealCard(i)} />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            {!allRevealed && (
              <button onClick={revealAll} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                Reveal All Cards
              </button>
            )}
            <button onClick={resetReading} className="btn-secondary flex-1 flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" />
              New Reading
            </button>
          </div>

          {allRevealed && (
            <button
              onClick={requestAI}
              disabled={aiLoading}
              className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {showAi ? 'Regenerate Personal Reading' : 'Get Your Personal Reading'}
            </button>
          )}

          {showAi && (
            <div className="card overflow-hidden p-0">
              <div className="bg-gradient-to-b from-accent-primary/10 to-accent-primary/[0.02] p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-accent-primary flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Personal Tarot Reading
                  </p>
                  {aiText && !aiLoading && (
                    <div className="flex items-center gap-1">
                      <CopyButton text={aiText} />
                      <ShareButton text={aiText} title="My Tarot Reading - Align" variant="icon" />
                    </div>
                  )}
                </div>
                {aiText ? (
                  <div className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-h2:text-lg prose-h3:text-base prose-p:text-text-secondary prose-p:leading-relaxed prose-strong:text-text-primary">
                    <ReactMarkdown>{aiText}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-text-tertiary animate-pulse">Channeling your chart and cards...</p>
                )}
                {aiLoading && (
                  <span className="text-accent-primary text-base animate-pulse">{'█'}</span>
                )}
                {aiText && !aiLoading && (
                  <button
                    onClick={() => {
                      const shareText = `My Tarot Reading from Align\n\n${aiText}`;
                      if (navigator.share) {
                        navigator.share({ title: 'My Tarot Reading', text: shareText }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(shareText);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }
                    }}
                    className="mt-4 w-full py-3 rounded-xl bg-[#2D1B69] border border-accent-primary/30 text-white font-medium text-sm hover:bg-[#3A2580] transition-colors flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <><Check className="w-4 h-4 text-green-400" /> Copied!</>
                    ) : (
                      <>{'🌌'} Share Reading</>
                    )}
                  </button>
                )}
                {error && (
                  <p className="text-red-400 text-sm mt-3">{error}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </PaywallGate>
  );
}
