'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { getZodiacGlyph, getPlanetGlyph } from '@/lib/utils';
import {
  Celebrity,
  CelebrityChartData,
  CelebrityCompatibility,
  CelebrityForecast,
  TurningPoint,
  CompatAspect,
  getCelebrityById,
  getCelebrityChart,
  calculateCelebrityCompatibility,
  getCelebrityForecast,
  toggleFavorite,
  isFavorite,
} from '@/lib/celebrityService';
import {
  generateMagneticPresence,
  generatePublicImage,
  generateEmotionalStyle,
  generateRelationshipStyle,
  generateAmbitionStyle,
} from '@/lib/celebrityInterpretations';
import {
  ArrowLeft,
  Heart,
  Share2,
  Loader2,
  Sun,
  Moon,
  ArrowUp,
  Sparkles,
  BarChart3,
  Compass,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Flame,
  Crown,
  Waves,
  Rocket,
} from 'lucide-react';

type TabKey = 'overview' | 'chart' | 'compatibility' | 'forecast';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'overview', label: 'Overview', icon: <Sparkles className="w-4 h-4" /> },
  { key: 'chart', label: 'Chart', icon: <BarChart3 className="w-4 h-4" /> },
  { key: 'compatibility', label: 'Compatibility', icon: <Compass className="w-4 h-4" /> },
  { key: 'forecast', label: "What's Up Next", icon: <Calendar className="w-4 h-4" /> },
];

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀',
  Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '♅',
  Neptune: '♆', Pluto: '♇', 'North Node': '☊',
  'South Node': '☋', Chiron: '⚷',
};

function lonToSign(lon: number): string {
  const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  return signs[Math.floor(((lon % 360) + 360) % 360 / 30)];
}

function lonToDeg(lon: number): string {
  const deg = Math.floor(((lon % 360) + 360) % 360 % 30);
  const min = Math.floor((((lon % 360) + 360) % 360 % 30 - deg) * 60);
  return `${deg}°${min > 0 ? `${min}'` : ''}`;
}

function scoreColor(score: number, inverted = false): string {
  if (inverted) {
    if (score >= 75) return 'text-red-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-emerald-400';
  }
  if (score >= 75) return 'text-emerald-400';
  if (score >= 50) return 'text-yellow-400';
  return 'text-red-400';
}

function scoreBgColor(score: number, inverted = false): string {
  if (inverted) {
    if (score >= 75) return 'bg-red-400';
    if (score >= 50) return 'bg-yellow-400';
    return 'bg-emerald-400';
  }
  if (score >= 75) return 'bg-emerald-400';
  if (score >= 50) return 'bg-yellow-400';
  return 'bg-red-400';
}

function confidenceLabel(conf: string): { text: string; color: string; icon: React.ReactNode } {
  switch (conf) {
    case 'verified': return { text: 'Verified birth time', color: 'text-emerald-400', icon: <CheckCircle className="w-3.5 h-3.5" /> };
    case 'reported': return { text: 'Reported birth time', color: 'text-yellow-400', icon: <AlertTriangle className="w-3.5 h-3.5" /> };
    default: return { text: 'Birth time unknown', color: 'text-text-muted', icon: <Info className="w-3.5 h-3.5" /> };
  }
}

function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    music: 'Music', film_tv: 'Film / TV', sports: 'Sports', politics: 'Politics',
    influencers: 'Influencers', legends: 'Legends', business: 'Business',
    fashion: 'Fashion', comedy: 'Comedy', science: 'Science', other: 'Other',
  };
  return map[cat] ?? cat;
}

function aspectSymbol(type: string): string {
  const map: Record<string, string> = {
    conjunction: '☌', Conjunction: '☌',
    sextile: '⚹', Sextile: '⚹',
    square: '□', Square: '□',
    trine: '△', Trine: '△',
    opposition: '☍', Opposition: '☍',
    quincunx: '⚻', Quincunx: '⚻',
  };
  return map[type] ?? type;
}

// Placeholder gradient
const PLACEHOLDER_GRADIENTS = [
  'from-[#9B6FF6] to-[#6C47D9]',
  'from-[#F66FAA] to-[#D94790]',
  'from-[#6FB0F6] to-[#4790D9]',
  'from-[#F6A86F] to-[#D98347]',
  'from-[#6FF6C3] to-[#47D99B]',
];

function gradientForName(name: string): string {
  const idx = name.charCodeAt(0) % PLACEHOLDER_GRADIENTS.length;
  return PLACEHOLDER_GRADIENTS[idx];
}

// ═══════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════

export default function CelebrityProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const id = params.id as string;

  const [celebrity, setCelebrity] = useState<Celebrity | null>(null);
  const [celebChart, setCelebChart] = useState<CelebrityChartData | null>(null);
  const [compatData, setCompatData] = useState<CelebrityCompatibility | null>(null);
  const [forecast, setForecast] = useState<CelebrityForecast | null>(null);

  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [compatLoading, setCompatLoading] = useState(false);
  const [forecastLoading, setForecastLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // --- Data loading ---

  const loadCelebrity = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const celeb = await getCelebrityById(id);
      if (!celeb) { setError('Celebrity not found.'); return; }
      setCelebrity(celeb);
      if (user) {
        const fav = await isFavorite(celeb.id);
        setFavorited(fav);
      }
    } catch (e: any) {
      setError(e.message ?? 'Failed to load celebrity.');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  const loadChart = useCallback(async () => {
    if (!celebrity) return;
    try {
      setChartLoading(true);
      const chart = await getCelebrityChart(celebrity);
      setCelebChart(chart);
    } catch (e) {
      console.error('[CelebProfile] chart error', e);
    } finally {
      setChartLoading(false);
    }
  }, [celebrity]);

  const loadForecast = useCallback(async () => {
    if (!celebrity || !celebChart || forecast) return;
    try {
      setForecastLoading(true);
      const fc = await getCelebrityForecast(celebrity, celebChart);
      setForecast(fc);
    } catch (e) {
      console.error('[CelebProfile] forecast error', e);
    } finally {
      setForecastLoading(false);
    }
  }, [celebrity, celebChart, forecast]);

  useEffect(() => { loadCelebrity(); }, [loadCelebrity]);
  useEffect(() => { if (celebrity) loadChart(); }, [celebrity, loadChart]);
  useEffect(() => { if (activeTab === 'forecast') loadForecast(); }, [activeTab, loadForecast]);

  // --- Actions ---

  const handleToggleFavorite = async () => {
    if (!celebrity || !user) return;
    const nowFav = await toggleFavorite(celebrity.id);
    setFavorited(nowFav);
  };

  const handleShare = async () => {
    if (!celebrity) return;
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {}
  };

  const handleCalculateCompat = async () => {
    if (!celebrity || !celebChart) return;
    try {
      setCompatLoading(true);
      const result = await calculateCelebrityCompatibility(celebrity, celebChart);
      setCompatData(result);
    } catch (e) {
      console.error('[CelebProfile] compat error', e);
    } finally {
      setCompatLoading(false);
    }
  };

  // --- Loading / Error states ---

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-accent-primary animate-spin mx-auto" />
          <p className="text-text-muted text-sm mt-3">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !celebrity) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-red-400 mb-4">{error ?? 'Something went wrong.'}</p>
        <button onClick={loadCelebrity} className="px-6 py-2 bg-accent-primary rounded-lg text-white font-medium hover:bg-accent-primary/80 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const conf = confidenceLabel(celebrity.source_confidence);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back + Actions */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={handleToggleFavorite}
              className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
              title={favorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-5 h-5 ${favorited ? 'fill-red-400 text-red-400' : 'text-text-muted'}`} />
            </button>
          )}
          <button
            onClick={handleShare}
            className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
            title="Copy link"
          >
            <Share2 className="w-5 h-5 text-text-muted" />
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center mb-6">
        {celebrity.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={celebrity.photo_url}
            alt={celebrity.name}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-[3px] border-[#9B6FF6] mb-4"
          />
        ) : (
          <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br ${gradientForName(celebrity.name)} flex items-center justify-center mb-4`}>
            <span className="text-white text-5xl font-bold">{celebrity.name.charAt(0)}</span>
          </div>
        )}
        <h1 className="text-2xl font-display font-bold text-text-primary text-center">{celebrity.name}</h1>
        <p className="text-sm text-text-secondary mt-1">{celebrity.profession}</p>
        <span className="inline-block mt-2 px-3 py-1 bg-[#9B6FF6]/10 border border-[#9B6FF6]/30 rounded-full text-xs text-[#9B6FF6] font-semibold">
          {categoryLabel(celebrity.category)}
        </span>
        {celebrity.birth_date && (
          <p className="text-xs text-text-muted mt-2 text-center">
            {celebrity.birth_date}{celebrity.birth_time ? ` at ${celebrity.birth_time}` : ''}
            {celebrity.birth_place ? ` • ${celebrity.birth_place}` : ''}
          </p>
        )}
        <p className={`text-xs mt-1 flex items-center gap-1 ${conf.color}`}>
          {conf.icon} {conf.text}
        </p>
      </div>

      {/* Big 3 */}
      <div className="flex justify-center gap-4 mb-6">
        {celebrity.sun_sign && (
          <div className="flex flex-col items-center bg-bg-secondary border border-border-primary rounded-xl px-5 py-3 min-w-[90px]">
            <Sun className="w-4 h-4 text-yellow-400 mb-1" />
            <span className="text-[10px] text-text-muted">Sun</span>
            <span className="text-sm font-semibold text-[#9B6FF6]">{celebrity.sun_sign}</span>
          </div>
        )}
        {celebrity.moon_sign && (
          <div className="flex flex-col items-center bg-bg-secondary border border-border-primary rounded-xl px-5 py-3 min-w-[90px]">
            <Moon className="w-4 h-4 text-blue-300 mb-1" />
            <span className="text-[10px] text-text-muted">Moon</span>
            <span className="text-sm font-semibold text-[#9B6FF6]">{celebrity.moon_sign}</span>
          </div>
        )}
        {celebrity.time_known && celebrity.rising_sign && (
          <div className="flex flex-col items-center bg-bg-secondary border border-border-primary rounded-xl px-5 py-3 min-w-[90px]">
            <ArrowUp className="w-4 h-4 text-accent-primary mb-1" />
            <span className="text-[10px] text-text-muted">Rising</span>
            <span className="text-sm font-semibold text-[#9B6FF6]">{celebrity.rising_sign}</span>
          </div>
        )}
      </div>

      {/* Tab Selector */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-[#9B6FF6] text-white'
                : 'bg-bg-secondary text-text-muted hover:text-text-secondary'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <OverviewTab chart={celebChart} celebrity={celebrity} loading={chartLoading} />
        )}
        {activeTab === 'chart' && (
          <ChartTab chart={celebChart} celebrity={celebrity} loading={chartLoading} />
        )}
        {activeTab === 'compatibility' && (
          <CompatibilityTab
            data={compatData}
            loading={compatLoading}
            onCalculate={handleCalculateCompat}
            hasChart={!!celebChart}
            hasUser={!!user}
          />
        )}
        {activeTab === 'forecast' && (
          <ForecastTab data={forecast} loading={forecastLoading} />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Interpretation Card
// ═══════════════════════════════════════════════════════════════════
function InterpretationCard({ title, icon, text }: { title: string; icon: React.ReactNode; text: string }) {
  const paragraphs = text.split('\n\n').filter(Boolean);
  return (
    <div className="bg-bg-secondary border border-border-primary rounded-xl p-5 mb-4">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-base font-bold text-text-primary">{title}</h3>
      </div>
      {paragraphs.map((p, i) => (
        <p key={i} className={`text-sm text-text-secondary leading-relaxed ${i < paragraphs.length - 1 ? 'mb-3' : ''}`}>
          {p}
        </p>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════════
function OverviewTab({ chart, celebrity, loading }: { chart: CelebrityChartData | null; celebrity: Celebrity; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-accent-primary animate-spin" />
      </div>
    );
  }
  if (!chart) return <p className="text-sm text-text-muted text-center py-8">Chart data unavailable.</p>;

  const planets = chart.planets.slice(0, 5);
  const sig = chart.chart_signature;
  const interpInput = {
    name: celebrity.name,
    planets: chart.planets,
    aspects: chart.aspects,
    signature: sig || undefined,
    ascendant: chart.ascendant,
    midheaven: chart.midheaven,
  };

  return (
    <div className="space-y-4">
      {chart.summary_cache && (
        <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
          <h3 className="text-base font-bold text-text-primary mb-2">Chart Summary</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{chart.summary_cache}</p>
        </div>
      )}

      <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
        <h3 className="text-base font-bold text-text-primary mb-3">Strongest Placements</h3>
        {planets.map((p, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-border-primary/30 last:border-0">
            <span className="text-sm text-text-primary">
              {PLANET_SYMBOLS[p.name] ?? ''} {p.name}
            </span>
            <span className="text-sm text-[#9B6FF6]">
              {lonToSign(p.longitude)} {lonToDeg(p.longitude)}
              {p.retrograde ? ' ℮' : ''}
            </span>
          </div>
        ))}
      </div>

      <InterpretationCard
        title="What Makes Them Magnetic"
        icon={<Sparkles className="w-5 h-5 text-yellow-400" />}
        text={generateMagneticPresence(interpInput)}
      />
      <InterpretationCard
        title="Public Image & Style"
        icon={<Crown className="w-5 h-5 text-[#9B6FF6]" />}
        text={generatePublicImage(interpInput)}
      />
      <InterpretationCard
        title="Emotional Style"
        icon={<Waves className="w-5 h-5 text-blue-400" />}
        text={generateEmotionalStyle(interpInput)}
      />
      <InterpretationCard
        title="Relationship Style"
        icon={<Flame className="w-5 h-5 text-red-400" />}
        text={generateRelationshipStyle(interpInput)}
      />
      <InterpretationCard
        title="Ambition Style"
        icon={<Rocket className="w-5 h-5 text-emerald-400" />}
        text={generateAmbitionStyle(interpInput)}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CHART TAB
// ═══════════════════════════════════════════════════════════════════
function ChartTab({ chart, celebrity, loading }: { chart: CelebrityChartData | null; celebrity: Celebrity; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-accent-primary animate-spin" />
      </div>
    );
  }
  if (!chart) return <p className="text-sm text-text-muted text-center py-8">Chart data unavailable.</p>;

  return (
    <div className="space-y-4">
      {!celebrity.time_known && (
        <div className="bg-yellow-400/5 border border-yellow-400/30 rounded-xl p-4">
          <p className="text-sm text-yellow-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            Birth time unknown -- house positions and rising sign unavailable.
          </p>
        </div>
      )}

      {/* Planetary Positions */}
      <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
        <h3 className="text-base font-bold text-text-primary mb-3">Planetary Positions</h3>
        {chart.planets.map((p, i) => (
          <div key={i} className="flex justify-between items-center py-2.5 border-b border-border-primary/30 last:border-0">
            <div className="flex items-center gap-2">
              <span className="text-[#9B6FF6] w-6 text-center text-lg">{PLANET_SYMBOLS[p.name] ?? ''}</span>
              <span className="text-sm text-text-primary">{p.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#9B6FF6]">{lonToSign(p.longitude)} {lonToDeg(p.longitude)}</span>
              {celebrity.time_known && p.house !== undefined && (
                <span className="text-xs text-text-muted">H{p.house}</span>
              )}
              {p.retrograde && <span className="text-xs text-yellow-400 font-bold">{'℮'}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Aspects */}
      {chart.aspects.length > 0 && (
        <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
          <h3 className="text-base font-bold text-text-primary mb-3">Aspects</h3>
          {chart.aspects.map((a, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-border-primary/30 last:border-0">
              <span className="text-sm text-text-primary">{a.planet1} {aspectSymbol(a.type)} {a.planet2}</span>
              <span className="text-xs text-text-muted">{a.orb?.toFixed(1)}{'°'}</span>
            </div>
          ))}
        </div>
      )}

      {/* House Cusps */}
      {celebrity.time_known && chart.houses.length > 0 && (
        <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
          <h3 className="text-base font-bold text-text-primary mb-3">House Cusps</h3>
          {chart.houses.map((h, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-border-primary/30 last:border-0">
              <span className="text-sm text-text-primary">House {h.house}</span>
              <span className="text-sm text-[#9B6FF6]">{lonToSign(h.longitude)} {lonToDeg(h.longitude)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// COMPATIBILITY TAB
// ═══════════════════════════════════════════════════════════════════
function CompatibilityTab({
  data, loading, onCalculate, hasChart, hasUser,
}: { data: CelebrityCompatibility | null; loading: boolean; onCalculate: () => void; hasChart: boolean; hasUser: boolean }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
        <p className="text-sm text-text-muted mt-3">Calculating your cosmic connection...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-sm text-text-secondary text-center mb-6 max-w-md">
          See how your chart connects with this celebrity.
        </p>
        <button
          onClick={onCalculate}
          disabled={!hasChart || !hasUser}
          className={`px-8 py-3 rounded-xl text-white font-semibold transition-all ${
            hasChart && hasUser
              ? 'bg-gradient-to-r from-[#9B6FF6] to-[#6C47D9] hover:opacity-90'
              : 'bg-bg-tertiary text-text-muted cursor-not-allowed'
          }`}
        >
          Calculate Compatibility
        </button>
        {!hasUser && <p className="text-xs text-text-muted mt-3">Sign in to calculate compatibility.</p>}
        {hasUser && !hasChart && <p className="text-xs text-text-muted mt-3">Chart data must load first.</p>}
      </div>
    );
  }

  const scores: { label: string; value: number; inverted?: boolean }[] = [
    { label: 'Attraction', value: data.attraction_score },
    { label: 'Emotional Resonance', value: data.emotional_score },
    { label: 'Romantic Potential', value: data.romantic_score },
    { label: 'Sexual Chemistry', value: data.sexual_chemistry_score },
    { label: 'Friendship', value: data.friendship_score },
    { label: 'Long-Term', value: data.long_term_score },
    { label: 'Conflict Risk', value: data.conflict_risk_score, inverted: true },
    { label: 'Karmic Intensity', value: data.karmic_intensity_score, inverted: true },
  ];

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <div className="flex justify-center mb-4">
        <div className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center bg-bg-secondary ${
          data.overall_score >= 75 ? 'border-emerald-400' : data.overall_score >= 50 ? 'border-yellow-400' : 'border-red-400'
        }`}>
          <span className={`text-3xl font-bold ${scoreColor(data.overall_score)}`}>{data.overall_score}</span>
          <span className="text-xs text-text-muted">Overall</span>
        </div>
      </div>

      {/* Score Bars */}
      <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
        {scores.map((s, i) => (
          <div key={i} className="flex items-center gap-3 mb-3 last:mb-0">
            <span className="text-xs text-text-secondary w-[130px] flex-shrink-0">{s.label}</span>
            <div className="flex-1 h-2 bg-bg-tertiary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${scoreBgColor(s.value, s.inverted)}`}
                style={{ width: `${s.value}%` }}
              />
            </div>
            <span className={`text-xs font-bold w-8 text-right ${scoreColor(s.value, s.inverted)}`}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* Best Aspects */}
      {data.best_aspects.length > 0 && (
        <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
          <h3 className="text-base font-bold text-text-primary mb-3">Best Aspects</h3>
          {data.best_aspects.map((a, i) => (
            <div key={i} className="mb-3 pb-3 border-b border-border-primary/30 last:border-0 last:mb-0 last:pb-0">
              <p className="text-sm font-semibold text-[#9B6FF6] mb-1">{a.planet1} {a.aspect} {a.planet2}</p>
              <p className="text-xs text-text-secondary">{a.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Hardest Aspects */}
      {data.hardest_aspects.length > 0 && (
        <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
          <h3 className="text-base font-bold text-yellow-400 mb-3">Hardest Aspects</h3>
          {data.hardest_aspects.map((a, i) => (
            <div key={i} className="mb-3 pb-3 border-b border-border-primary/30 last:border-0 last:mb-0 last:pb-0">
              <p className="text-sm font-semibold text-[#9B6FF6] mb-1">{a.planet1} {a.aspect} {a.planet2}</p>
              <p className="text-xs text-text-secondary">{a.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Relationship Feel */}
      {data.relationship_feel && (
        <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
          <h3 className="text-base font-bold text-text-primary mb-2">How This Would Feel</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{data.relationship_feel}</p>
        </div>
      )}

      {/* Summary */}
      {data.summary && (
        <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
          <h3 className="text-base font-bold text-text-primary mb-2">Summary</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{data.summary}</p>
        </div>
      )}

      {data.partial_data && (
        <div className="bg-yellow-400/5 border border-yellow-400/30 rounded-xl p-4">
          <p className="text-sm text-yellow-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            Some birth data is missing. Results may be less precise.
          </p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// FORECAST TAB
// ═══════════════════════════════════════════════════════════════════
function ForecastTab({ data, loading }: { data: CelebrityForecast | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
        <p className="text-sm text-text-muted mt-3">Reading the transits...</p>
      </div>
    );
  }

  if (!data) return <p className="text-sm text-text-muted text-center py-8">Forecast data unavailable.</p>;

  const categoryForecasts: { title: string; text: string }[] = [
    { title: 'Love & Relationships', text: data.love_text },
    { title: 'Career & Public Life', text: data.career_text },
    { title: 'Money & Opportunity', text: data.money_text },
    { title: 'Image & Reputation', text: data.image_text },
    { title: 'Inner Life', text: data.inner_life_text },
  ];

  function intensityBadge(intensity: string) {
    const colors = intensity === 'high'
      ? 'bg-red-400/20 text-red-400'
      : intensity === 'medium'
      ? 'bg-yellow-400/20 text-yellow-400'
      : 'bg-text-muted/20 text-text-muted';
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${colors}`}>
        {intensity}
      </span>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
        <h3 className="text-base font-bold text-text-primary mb-2">Right Now</h3>
        <p className="text-sm text-text-secondary leading-relaxed">{data.now_summary}</p>
      </div>

      <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
        <h3 className="text-base font-bold text-text-primary mb-2">Next 30 Days</h3>
        <p className="text-sm text-text-secondary leading-relaxed">{data.next_30_days}</p>
      </div>

      <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
        <h3 className="text-base font-bold text-text-primary mb-2">Next 3 Months</h3>
        <p className="text-sm text-text-secondary leading-relaxed">{data.next_3_months}</p>
      </div>

      {data.major_turning_points.length > 0 && (
        <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
          <h3 className="text-base font-bold text-text-primary mb-3">Major Turning Points</h3>
          {data.major_turning_points.map((tp, i) => (
            <div key={i} className="mb-4 pb-4 border-b border-border-primary/30 last:border-0 last:mb-0 last:pb-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-text-primary">{tp.title}</span>
                {intensityBadge(tp.intensity)}
              </div>
              <p className="text-xs text-text-muted mb-1">{tp.date_range}</p>
              <p className="text-sm text-text-secondary leading-relaxed">{tp.description}</p>
            </div>
          ))}
        </div>
      )}

      <div className="h-px bg-border-primary my-2" />

      {categoryForecasts.map((cf, i) =>
        cf.text ? (
          <div key={i} className="bg-bg-secondary border border-border-primary rounded-xl p-5">
            <h3 className="text-base font-bold text-text-primary mb-2">{cf.title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{cf.text}</p>
          </div>
        ) : null
      )}

      {data.partial_data && (
        <div className="bg-yellow-400/5 border border-yellow-400/30 rounded-xl p-4">
          <p className="text-sm text-yellow-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            Birth time is unverified. Forecasts related to houses and angles may be approximate.
          </p>
        </div>
      )}
    </div>
  );
}
