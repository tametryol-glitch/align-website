'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Star, Sparkles, RotateCcw, Eye, Check, Copy } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useAstrologySettings } from '@/stores/astrologySettingsStore';
import { api, buildBirthData } from '@/lib/api';
import { drawCards as drawLocalCards, type DrawnCard } from '@/lib/tarotDeck';
import ReactMarkdown from 'react-markdown';
import ShareButton from '@/components/ui/ShareButton';

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

  return `You are ${userName}'s personal tarot reader and astrologer inside the Align app. You have access to their full natal chart AND their current secondary progressed chart below.

CRITICAL RULERSHIP SYSTEM — You MUST use these custom rulerships:
- Virgo is ruled by VESTA (NOT Mercury)
- Libra is ruled by JUNO (NOT Venus)
All other traditional/modern rulerships remain standard.

${chartContext}

=== TAROT SPREAD ===
${cardDescriptions}
${question ? '\nUser\'s Question: "' + question + '"' : '\nNo specific question — give a general life reading.'}

=== YOUR INSTRUCTIONS ===

You are not a generic fortune teller. You are ${userName}'s personal guide who can see their ACTUAL birth chart AND their progressed chart. This is what makes you different from every tarot reading they have ever gotten.

RULES — FOLLOW THESE EXACTLY:

1. **BE DIRECT.** ${question ? userName + ' asked "' + question + '" — ANSWER IT. Do not dance around it. Give them a clear, honest, specific answer within the first 2-3 sentences of each card section. Then explain why the card + their chart supports that answer.' : 'Give ' + userName + ' clear, actionable guidance. Not vague platitudes — real direction based on what you see in their cards AND chart.'}

2. **CONNECT EVERY CARD TO THEIR ACTUAL CHART.** For each card, you MUST reference at least one specific placement from their natal or progressed chart. Example: "The Empress in your Present position connects directly to your progressed Venus at X° Y — this is activating your Nth house of Z right now, which means..."

3. **USE THE PROGRESSED CHART.** The progressed chart shows where ${userName} is RIGHT NOW in their soul's evolution. Connect the tarot cards to active progressed aspects and sign changes. This is the "when" and "why now" layer that makes the reading feel uncanny.

4. **NEVER BE VAGUE.** No "you may be feeling" or "something could be shifting." Be specific: "Your progressed Moon just entered X — you ARE feeling Y, and this card confirms it."

5. **MAKE THEM FEEL SEEN.** Name the specific tension, desire, or fear that the card + chart combination reveals. Be the reader who says what they have been thinking but could not put into words.

6. **REVERSED CARDS = SHADOW WORK.** When a card is reversed, connect it to a natal aspect or house placement that shows the root of the block. Be compassionate but unflinching.

7. **THE VERDICT MUST BE ACTIONABLE.** End with a clear "what to do now" section. Not "trust the process" — give them specific timing (from progressed aspects), specific actions, and specific things to watch for.

FORMAT:
- Use markdown headers (## for main title, ### for each card position)
- Address ${userName} by name naturally
- Keep the tone warm but direct — like a wise friend who also happens to be an expert astrologer
- The total reading should be thorough and substantial — do not rush through cards
- End with a ### The Verdict section that synthesizes everything into direct guidance`;
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
      await api.streamAIInterpretation(
        {
          chart_data_text: systemPrompt,
          messages: [
            { role: 'user', content: 'Read my tarot spread now. Be direct and connect everything to my chart.' },
          ],
          type: 'tarot_personal_reading',
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
    <div className="max-w-3xl mx-auto">
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
  );
}
