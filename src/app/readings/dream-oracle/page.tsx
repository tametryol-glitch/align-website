'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, Trash2, ChevronRight, Sparkles, MessageCircle } from 'lucide-react';
import { DREAM_TYPES, DREAM_EMOTIONS, PRIVACY_OPTIONS, DREAM_SYMBOLS, searchSymbols, getSymbol } from '@/lib/dreamDictionary';
import type { DreamSymbolEntry, DreamPrivacy } from '@/lib/dreamDictionary';
import { createDream, listDreams, searchDreams, deleteDream, computeDreamPatterns } from '@/lib/dreamService';
import type { DreamEntry, DreamFilter, DreamPatterns, DreamInterpretation, DreamAstrologyContext } from '@/lib/dreamService';
import { generateDreamInterpretation } from '@/lib/dreamInterpretationEngine';
import { buildDreamAstrologyContext } from '@/lib/dreamAstrologyConnector';

type Tab = 'record' | 'journal' | 'dictionary' | 'patterns';

const TABS: { key: Tab; label: string; glyph: string }[] = [
  { key: 'record', label: 'Record', glyph: '✍️' },
  { key: 'journal', label: 'Journal', glyph: '📖' },
  { key: 'dictionary', label: 'Symbols', glyph: '🔮' },
  { key: 'patterns', label: 'Patterns', glyph: '📊' },
];

export default function DreamOraclePage() {
  const [activeTab, setActiveTab] = useState<Tab>('record');

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href="/readings" className="text-accent-primary hover:text-accent-secondary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 text-center">
          <span className="text-3xl">🌙</span>
          <h1 className="text-2xl font-display font-bold text-text-primary">Dream Oracle</h1>
        </div>
        <div className="w-5" />
      </div>
      <p className="text-text-muted text-sm text-center mb-4 px-4">
        Decode your dreams through symbols, emotions, astrology, and the hidden language of your subconscious.
      </p>

      {/* Tab Bar */}
      <div className="flex bg-bg-secondary rounded-xl p-1 mb-4">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex flex-col items-center py-2 rounded-lg transition-colors text-sm ${
              activeTab === tab.key
                ? 'bg-bg-tertiary text-text-primary font-semibold'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            <span className="text-base">{tab.glyph}</span>
            <span className="text-xs mt-0.5">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'record' && <RecordDreamTab />}
      {activeTab === 'journal' && <DreamJournalTab />}
      {activeTab === 'dictionary' && <DreamDictionaryTab />}
      {activeTab === 'patterns' && <DreamPatternsTab />}
    </div>
  );
}

/* ================================================================
   Record Dream Tab
   ================================================================ */

function RecordDreamTab() {
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [people, setPeople] = useState('');
  const [places, setPlaces] = useState('');
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [symbolSearch, setSymbolSearch] = useState('');
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);
  const [dreamType, setDreamType] = useState('normal');
  const [intensity, setIntensity] = useState(5);
  const [privacy, setPrivacy] = useState<DreamPrivacy>('private');
  const [saving, setSaving] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [interpretation, setInterpretation] = useState<DreamInterpretation | null>(null);
  const [astrologyCtx, setAstrologyCtx] = useState<DreamAstrologyContext | null>(null);
  const [savedEntry, setSavedEntry] = useState<DreamEntry | null>(null);

  const toggleEmotion = (key: string) => {
    setSelectedEmotions(prev => prev.includes(key) ? prev.filter(e => e !== key) : [...prev, key].slice(0, 5));
  };
  const toggleSymbol = (key: string) => {
    setSelectedSymbols(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key].slice(0, 10));
  };
  const filteredSymbols = searchSymbols(symbolSearch);

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setSaving(true);
    try {
      const astro = await buildDreamAstrologyContext();
      setAstrologyCtx(astro);

      const interp = generateDreamInterpretation({
        description,
        emotions: selectedEmotions,
        people: people.split(',').map(p => p.trim()).filter(Boolean),
        places: places.split(',').map(p => p.trim()).filter(Boolean),
        symbols: selectedSymbols,
        dreamType,
        intensityScore: intensity,
      }, astro);
      setInterpretation(interp);

      const { entry, error } = await createDream({
        title: title.trim() || undefined,
        description,
        emotions: selectedEmotions,
        people: people.split(',').map(p => p.trim()).filter(Boolean),
        places: places.split(',').map(p => p.trim()).filter(Boolean),
        symbols: selectedSymbols,
        dreamType,
        intensityScore: intensity,
        privacy,
        interpretationJson: interp,
        astrologyContextJson: astro,
      });

      if (!error) {
        setSavedEntry(entry || null);
        setShowResult(true);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleNewDream = () => {
    setShowResult(false);
    setInterpretation(null);
    setAstrologyCtx(null);
    setSavedEntry(null);
    setDescription('');
    setTitle('');
    setSelectedEmotions([]);
    setPeople('');
    setPlaces('');
    setSelectedSymbols([]);
    setDreamType('normal');
    setIntensity(5);
    setPrivacy('private');
  };

  if (showResult && interpretation) {
    return <InterpretationView interpretation={interpretation} astrology={astrologyCtx} entry={savedEntry} onBack={handleNewDream} />;
  }

  return (
    <div className="space-y-5 pb-16">
      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">Dream Title (optional)</label>
        <input
          className="input w-full"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Auto-generated if left blank"
          maxLength={100}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">Describe Your Dream *</label>
        <textarea
          className="input w-full min-h-[160px] resize-y"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Close your eyes and describe everything you remember..."
          maxLength={5000}
        />
        <p className="text-xs text-text-muted text-right mt-1">{description.length}/5000</p>
      </div>

      {/* Emotions */}
      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-2">Main Emotions (up to 5)</label>
        <div className="flex flex-wrap gap-2">
          {DREAM_EMOTIONS.map(emo => (
            <button
              key={emo.key}
              onClick={() => toggleEmotion(emo.key)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs transition-colors ${
                selectedEmotions.includes(emo.key)
                  ? 'border-accent-primary bg-accent-primary/15 text-accent-tertiary font-semibold'
                  : 'border-border-primary bg-bg-secondary text-text-muted hover:text-text-secondary'
              }`}
            >
              <span>{emo.glyph}</span>
              <span>{emo.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* People */}
      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">People in the Dream</label>
        <input className="input w-full" value={people} onChange={e => setPeople(e.target.value)} placeholder="e.g. Mother, ex-partner, stranger, friend" />
        <p className="text-xs text-text-muted mt-1">Separate with commas</p>
      </div>

      {/* Places */}
      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">Places in the Dream</label>
        <input className="input w-full" value={places} onChange={e => setPlaces(e.target.value)} placeholder="e.g. childhood home, ocean, dark forest" />
        <p className="text-xs text-text-muted mt-1">Separate with commas</p>
      </div>

      {/* Symbols */}
      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-2">Symbols / Objects</label>
        <button
          onClick={() => setShowSymbolPicker(!showSymbolPicker)}
          className="input w-full text-left text-text-muted"
        >
          {selectedSymbols.length > 0
            ? `${selectedSymbols.length} selected — tap to ${showSymbolPicker ? 'hide' : 'change'}`
            : 'Click to select dream symbols'}
        </button>
        {selectedSymbols.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedSymbols.map(key => {
              const sym = getSymbol(key);
              return (
                <button key={key} onClick={() => toggleSymbol(key)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-accent-primary bg-accent-primary/15 text-accent-tertiary text-xs font-semibold"
                >
                  <span>{sym?.glyph || '✦'}</span>
                  <span>{sym?.name || key}</span>
                  <span className="text-accent-primary ml-1">✕</span>
                </button>
              );
            })}
          </div>
        )}
        {showSymbolPicker && (
          <div className="mt-2 border border-border-primary rounded-xl bg-bg-secondary overflow-hidden max-h-64">
            <input
              className="w-full px-3 py-2 bg-transparent text-text-primary text-sm border-b border-border-primary outline-none placeholder:text-text-muted"
              value={symbolSearch}
              onChange={e => setSymbolSearch(e.target.value)}
              placeholder="Search symbols..."
            />
            <div className="max-h-48 overflow-y-auto">
              {filteredSymbols.map(sym => (
                <button
                  key={sym.key}
                  onClick={() => toggleSymbol(sym.key)}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 text-left border-b border-border-primary/50 hover:bg-bg-tertiary transition-colors ${
                    selectedSymbols.includes(sym.key) ? 'bg-accent-primary/10' : ''
                  }`}
                >
                  <span className="text-xl">{sym.glyph}</span>
                  <span className="text-sm text-text-primary flex-1">{sym.name}</span>
                  {selectedSymbols.includes(sym.key) && <span className="text-accent-primary">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dream Type */}
      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-2">Dream Type</label>
        <div className="flex flex-wrap gap-2">
          {DREAM_TYPES.map(dt => (
            <button
              key={dt.key}
              onClick={() => setDreamType(dt.key)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs transition-colors ${
                dreamType === dt.key
                  ? 'border-accent-primary bg-accent-primary/15 text-accent-tertiary font-semibold'
                  : 'border-border-primary bg-bg-secondary text-text-muted hover:text-text-secondary'
              }`}
            >
              <span>{dt.glyph}</span>
              <span>{dt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Intensity */}
      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-2">Dream Intensity: {intensity}/10</label>
        <div className="flex gap-1.5">
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <button
              key={n}
              onClick={() => setIntensity(n)}
              className={`w-8 h-8 rounded-full text-xs font-semibold transition-colors ${
                intensity >= n
                  ? 'bg-accent-primary/20 border border-accent-primary text-accent-primary'
                  : 'bg-bg-secondary border border-border-primary text-text-muted'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Privacy */}
      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-2">Privacy</label>
        <div className="flex flex-wrap gap-2">
          {PRIVACY_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setPrivacy(opt.key as DreamPrivacy)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs transition-colors ${
                privacy === opt.key
                  ? 'border-accent-primary bg-accent-primary/15 text-accent-tertiary font-semibold'
                  : 'border-border-primary bg-bg-secondary text-text-muted hover:text-text-secondary'
              }`}
            >
              <span>{opt.glyph}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={saving || !description.trim()}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50"
      >
        {saving ? (
          <span className="animate-spin text-lg">✦</span>
        ) : (
          <>🌙 Interpret My Dream</>
        )}
      </button>
    </div>
  );
}

/* ================================================================
   Interpretation View
   ================================================================ */

function InterpretationView({ interpretation, astrology, entry, onBack }: {
  interpretation: DreamInterpretation;
  astrology: DreamAstrologyContext | null;
  entry: DreamEntry | null;
  onBack: () => void;
}) {
  const sections: { title: string; glyph: string; content: string }[] = [
    { title: 'Surface Story', glyph: '📖', content: interpretation.surfaceStory },
    { title: 'Emotional Meaning', glyph: '💜', content: interpretation.emotionalMeaning },
    { title: 'Hidden Message', glyph: '🔮', content: interpretation.hiddenMessage },
    { title: 'Shadow Message', glyph: '🌑', content: interpretation.shadowMessage },
    { title: 'Spiritual Meaning', glyph: '🙏', content: interpretation.spiritualMeaning },
    { title: 'Psychological Meaning', glyph: '🧠', content: interpretation.psychologicalMeaning },
    { title: 'Astrological Connection', glyph: '⭐', content: interpretation.astrologicalConnection },
    { title: 'Why You Dreamed This Now', glyph: '⏰', content: interpretation.whyNow },
    { title: 'What To Watch For', glyph: '👁️', content: interpretation.watchFor },
    { title: 'What To Do Next', glyph: '✨', content: interpretation.whatToDo },
  ];

  return (
    <div className="space-y-4 pb-16">
      {/* Header */}
      <div className="card text-center py-6 bg-gradient-to-b from-accent-primary/15 to-transparent">
        <p className="text-2xl font-display font-bold text-text-primary">🌙 Your Dream Interpretation</p>
        {entry && <p className="text-sm text-text-muted mt-1">{entry.title}</p>}
      </div>

      {/* Main Symbols */}
      {interpretation.mainSymbols.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-3">🔑 Main Symbols</h3>
          <div className="space-y-3">
            {interpretation.mainSymbols.map((sym, i) => (
              <div key={i} className="border-b border-border-primary/50 pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-semibold text-accent-secondary">{sym.symbol}</p>
                <p className="text-sm text-text-secondary mt-1 leading-relaxed">{sym.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sections */}
      {sections.map((sec, i) => (
        <div key={i} className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-2">{sec.glyph} {sec.title}</h3>
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{sec.content}</p>
        </div>
      ))}

      {/* Reflection Questions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-primary mb-3">💭 Reflection Questions</h3>
        <div className="space-y-3">
          {interpretation.reflectionQuestions.map((q, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-sm font-semibold text-accent-primary min-w-[20px]">{i + 1}</span>
              <p className="text-sm text-text-secondary leading-relaxed">{q}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ask About This Dream */}
      <Link href="/ai" className="btn-primary w-full flex items-center justify-center gap-2 py-3">
        <MessageCircle className="w-4 h-4" />
        Ask About This Dream
      </Link>

      {/* Visualize (coming soon) */}
      <button disabled className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border-primary bg-bg-secondary text-text-muted opacity-60 cursor-not-allowed">
        🎨 Visualize My Dream
        <span className="bg-gold-muted text-gold-primary text-[9px] font-bold uppercase px-2 py-0.5 rounded">COMING SOON</span>
      </button>

      {/* Share Cards (coming soon) */}
      <div className="flex flex-wrap gap-2">
        {['Symbol Card', 'Message Card', 'Astro Timing', 'Dream Art', 'Quote Card'].map((label, i) => (
          <div key={i} className="px-3 py-2 rounded-lg border border-border-primary bg-bg-secondary opacity-50 text-center">
            <p className="text-[10px] text-text-muted">{label}</p>
            <p className="text-[8px] text-gold-primary mt-0.5">Soon</p>
          </div>
        ))}
      </div>

      {/* New Dream */}
      <button onClick={onBack} className="btn-secondary w-full py-3">
        ✍️ Record Another Dream
      </button>
    </div>
  );
}

/* ================================================================
   Dream Journal Tab
   ================================================================ */

function DreamJournalTab() {
  const [entries, setEntries] = useState<DreamEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DreamEntry | null>(null);

  const load = useCallback(async () => {
    const filter: DreamFilter = {};
    if (searchQuery.trim()) filter.query = searchQuery.trim();
    if (filterType) filter.dreamType = filterType;

    const res = filter.query || filter.dreamType
      ? await searchDreams(filter)
      : await listDreams();
    setEntries(res.entries);
  }, [searchQuery, filterType]);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this dream? This cannot be undone.')) return;
    await deleteDream(id);
    await load();
    if (selectedEntry?.id === id) setSelectedEntry(null);
  };

  if (selectedEntry?.interpretationJson) {
    return (
      <InterpretationView
        interpretation={selectedEntry.interpretationJson}
        astrology={selectedEntry.astrologyContextJson}
        entry={selectedEntry}
        onBack={() => setSelectedEntry(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="animate-spin text-2xl text-accent-primary">✦</span>
        <p className="text-sm text-text-muted mt-3">Loading dream journal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            className="input w-full pl-9"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search dreams..."
            onKeyDown={e => e.key === 'Enter' && load()}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-border-primary bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterType(undefined)}
            className={`shrink-0 px-3 py-1.5 rounded-full border text-xs transition-colors ${
              !filterType ? 'border-accent-primary bg-accent-primary/15 text-accent-tertiary font-semibold' : 'border-border-primary text-text-muted'
            }`}
          >
            All
          </button>
          {DREAM_TYPES.slice(0, 8).map(dt => (
            <button
              key={dt.key}
              onClick={() => setFilterType(filterType === dt.key ? undefined : dt.key)}
              className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs transition-colors ${
                filterType === dt.key ? 'border-accent-primary bg-accent-primary/15 text-accent-tertiary font-semibold' : 'border-border-primary text-text-muted'
              }`}
            >
              <span>{dt.glyph}</span>
              <span>{dt.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Cards */}
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="text-5xl mb-4">🌙</span>
          <p className="text-lg font-semibold text-text-primary">No dreams yet</p>
          <p className="text-sm text-text-muted mt-1 text-center max-w-xs">Record your first dream to begin building your journal.</p>
        </div>
      ) : (
        <div className="space-y-3 pb-8">
          {entries.map(item => (
            <div
              key={item.id}
              className="reading-card cursor-pointer group"
              onClick={() => setSelectedEntry(item)}
            >
              <div className="flex items-start justify-between mb-1">
                <h4 className="text-base font-semibold text-text-primary truncate flex-1">{item.title}</h4>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-xs text-text-muted">
                    {new Date(item.dreamedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(item.id); }}
                    className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-text-muted line-clamp-2 mb-2">{item.description}</p>
              <div className="flex flex-wrap items-center gap-1.5">
                {item.emotions.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-accent-primary/10 text-accent-secondary text-[11px]">
                    {DREAM_EMOTIONS.find(e => e.key === item.emotions[0])?.glyph} {item.emotions[0]}
                  </span>
                )}
                {item.symbols.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-accent-primary/10 text-accent-secondary text-[11px]">
                    {getSymbol(item.symbols[0])?.glyph || '✦'} {getSymbol(item.symbols[0])?.name || item.symbols[0]}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full bg-accent-primary/10 text-accent-secondary text-[11px]">
                  {DREAM_TYPES.find(t => t.key === item.dreamType)?.glyph} {item.dreamType}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  item.intensityScore >= 7 ? 'bg-red-500/20 text-red-400'
                  : item.intensityScore >= 4 ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-green-500/20 text-green-400'
                }`}>
                  {item.intensityScore}/10
                </span>
                <span className="text-sm">{PRIVACY_OPTIONS.find(p => p.key === item.privacy)?.glyph}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   Dream Dictionary Tab
   ================================================================ */

function DreamDictionaryTab() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<DreamSymbolEntry | null>(null);
  const results = searchSymbols(search);

  if (selected) {
    return (
      <div className="space-y-4 pb-8">
        <button onClick={() => setSelected(null)} className="text-sm text-accent-primary hover:text-accent-secondary transition-colors">
          ‹ Back to symbols
        </button>
        <div className="text-center">
          <span className="text-6xl">{selected.glyph}</span>
          <h2 className="text-2xl font-display font-bold text-text-primary mt-2">{selected.name}</h2>
        </div>
        {[
          { title: 'General Meaning', body: selected.general },
          { title: 'Psychological Meaning', body: selected.psychological },
          { title: 'Spiritual Meaning', body: selected.spiritual },
          { title: 'Astrological Meaning', body: selected.astrological },
          { title: 'Shadow Meaning', body: selected.shadow },
          { title: 'Reflection Question', body: selected.reflection },
        ].map((sec, i) => (
          <div key={i} className="card">
            <h3 className="text-base font-semibold text-text-primary mb-2">{sec.title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{sec.body}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input
        className="input w-full"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search symbols..."
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-8">
        {results.map(sym => (
          <button
            key={sym.key}
            onClick={() => setSelected(sym)}
            className="reading-card flex flex-col items-center justify-center min-h-[90px] hover:border-accent-primary/30 transition-colors"
          >
            <span className="text-3xl mb-1">{sym.glyph}</span>
            <span className="text-sm text-text-primary font-medium">{sym.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   Dream Patterns Tab
   ================================================================ */

function DreamPatternsTab() {
  const [patterns, setPatterns] = useState<DreamPatterns | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { entries } = await listDreams(500);
      setPatterns(computeDreamPatterns(entries));
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="animate-spin text-2xl text-accent-primary">✦</span>
      </div>
    );
  }

  if (!patterns || patterns.totalDreams === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <span className="text-5xl mb-4">📊</span>
        <p className="text-lg font-semibold text-text-primary">No patterns yet</p>
        <p className="text-sm text-text-muted mt-1 text-center max-w-xs">Record at least 3 dreams to begin seeing patterns in your dream life.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-16">
      {/* Overview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-primary mb-3">📊 Overview</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Total Dreams', value: patterns.totalDreams },
            { label: 'Avg Intensity', value: patterns.avgIntensity.toFixed(1) },
            { label: 'Nightmares', value: patterns.nightmareCount },
            { label: 'Lucid Dreams', value: patterns.lucidCount },
            { label: 'Prophetic', value: patterns.propheticCount },
          ].map((stat, i) => (
            <div key={i} className="bg-bg-tertiary rounded-lg px-4 py-2 text-center min-w-[80px]">
              <p className="text-lg font-bold text-accent-primary">{stat.value}</p>
              <p className="text-[10px] text-text-muted mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Symbols */}
      {patterns.topSymbols.length > 0 && (
        <PatternSection title="🔑 Most Recurring Symbols" items={patterns.topSymbols.slice(0, 8).map(s => ({
          label: `${getSymbol(s.symbol)?.glyph || '✦'} ${getSymbol(s.symbol)?.name || s.symbol}`,
          count: s.count,
          total: patterns.totalDreams,
        }))} />
      )}

      {/* Top Emotions */}
      {patterns.topEmotions.length > 0 && (
        <PatternSection title="💜 Most Recurring Emotions" items={patterns.topEmotions.slice(0, 8).map(e => ({
          label: `${DREAM_EMOTIONS.find(em => em.key === e.emotion)?.glyph || '🫧'} ${e.emotion}`,
          count: e.count,
          total: patterns.totalDreams,
        }))} />
      )}

      {/* Top People */}
      {patterns.topPeople.length > 0 && (
        <PatternSection title="👥 Most Recurring People" items={patterns.topPeople.slice(0, 6).map(p => ({
          label: `🧑 ${p.person}`,
          count: p.count,
          total: patterns.totalDreams,
        }))} />
      )}

      {/* Dream Types */}
      {patterns.topTypes.length > 0 && (
        <PatternSection title="💤 Dream Types" items={patterns.topTypes.map(t => ({
          label: `${DREAM_TYPES.find(dt => dt.key === t.type)?.glyph || '💤'} ${t.type}`,
          count: t.count,
          total: patterns.totalDreams,
        }))} />
      )}

      {/* Coming soon */}
      <div className="card">
        <h3 className="text-base font-semibold text-text-primary mb-2">🌕 Dreams by Moon Phase</h3>
        <p className="text-sm text-text-muted italic">Moon phase pattern tracking will activate once you have 10+ dreams with astrology data connected.</p>
      </div>
      <div className="card">
        <h3 className="text-base font-semibold text-text-primary mb-2">⭐ Dreams by Transit</h3>
        <p className="text-sm text-text-muted italic">Transit correlation will reveal which planetary aspects activate your most vivid or prophetic dreams.</p>
      </div>
    </div>
  );
}

function PatternSection({ title, items }: { title: string; items: { label: string; count: number; total: number }[] }) {
  return (
    <div className="card">
      <h3 className="text-base font-semibold text-text-primary mb-3">{title}</h3>
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-sm text-text-secondary w-32 truncate">{item.label}</span>
            <div className="flex-1 h-2 bg-bg-tertiary rounded-full overflow-hidden">
              <div
                className="h-2 bg-accent-primary rounded-full transition-all"
                style={{ width: `${Math.min(100, (item.count / item.total) * 100)}%` }}
              />
            </div>
            <span className="text-xs text-text-muted min-w-[24px] text-right">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
