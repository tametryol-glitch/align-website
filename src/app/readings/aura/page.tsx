'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { ArrowLeft, Mic, MicOff, Camera, ChevronDown, ChevronUp, Share2, Copy, Check, Download, Trash2, MessageCircle, Send } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { PaywallGate } from '@/components/ui/PaywallGate';
import type {
  AuraColorName, AuraColorScore, AuraInput, AuraReadingResult, AuraReadingSection,
  MoodOption, LifeAreaOption, AuraJournalEntry, ChakraReading, AuraPrivacySettings,
} from '@/types/aura';
import { AURA_COLORS, MOOD_OPTIONS, LIFE_AREA_OPTIONS, CHAKRA_DEFS, AURA_DISCLAIMER } from '@/lib/auraColors';
import { calculateAuraScores, getAuraTriad, getChakraFocus, calculateScanConfidence } from '@/lib/auraColorEngine';
import { generateTemplateReading, streamAuraReading, parseAISections } from '@/lib/auraInterpretationEngine';
import { saveAuraJournalEntry, getAuraJournalEntries, deleteAuraJournalEntry, getDailyScansUsed, getMaxDailyScans } from '@/lib/auraJournalService';
import { getAuraAstroContext, getAuraNumerologyContext } from '@/lib/auraAstroContextService';
import { generateAuraForecast } from '@/lib/auraForecastEngine';
import { analyzeAuraPatterns } from '@/lib/auraPatternService';
import AuraShareCard from '@/components/share/AuraShareCard';
import { downloadCardAsImage } from '@/lib/shareCardUtils';
import { copyShareLink as copyShareLinkUtil } from '@/lib/shareLinks';
import { api } from '@/lib/api';

// ── Scan Steps ──────────────────────────────────────────────────────

type ScanStep = 'mode' | 'mood' | 'lifeArea' | 'generating' | 'reading';
type ActiveTab = 'scan' | 'reading' | 'journal';
type ChatMessage = { role: 'user' | 'assistant'; content: string };

// ── Main Component ──────────────────────────────────────────────────

export default function AuraMirrorPage() {
  const { t } = useTranslation();
  const { user, profile } = useAuthStore();
  const { tier } = useSubscriptionStore();

  // Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('scan');

  // Scan flow
  const [step, setStep] = useState<ScanStep>('mood');
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [selectedLifeArea, setSelectedLifeArea] = useState<LifeAreaOption | null>(null);

  // Reading state
  const [reading, setReading] = useState<AuraReadingResult | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [generating, setGenerating] = useState(false);

  // Journal state
  const [journalEntries, setJournalEntries] = useState<AuraJournalEntry[]>([]);
  const [journalLoading, setJournalLoading] = useState(false);

  // Forecast state
  const [forecast, setForecast] = useState<any>(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastExpanded, setForecastExpanded] = useState(false);

  // Pattern state
  const [patterns, setPatterns] = useState<any>(null);
  const [patternsLoading, setPatternsLoading] = useState(false);
  const [showPatterns, setShowPatterns] = useState(false);

  // Expanded sections
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0, 1, 2]));

  // Share state
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Chat follow-up state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatStreaming, setChatStreaming] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [chatQuestionsUsed, setChatQuestionsUsed] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const FREE_CHAT_LIMIT = 3;
  const chatLimitReached = tier === 'free' && chatQuestionsUsed >= FREE_CHAT_LIMIT;

  // ── Load journal entries ──
  useEffect(() => {
    if (!user) return;
    loadJournal();
  }, [user]);

  async function loadJournal() {
    setJournalLoading(true);
    try {
      const entries = await getAuraJournalEntries(50, 0);
      setJournalEntries(entries);
    } catch {}
    setJournalLoading(false);
  }

  // ── Generate reading ──
  async function handleGenerate() {
    if (!selectedMood) return;
    setStep('generating');
    setGenerating(true);
    setStreamingText('');

    try {
      // Build input
      const astroCtx = getAuraAstroContext();
      const numCtx = getAuraNumerologyContext();
      const hasAstro = astroCtx.hasChartData;
      const hasNum = !!numCtx.lifePathNumber;

      const input: AuraInput = {
        mode: 'picture',
        mood: selectedMood,
        lifeArea: selectedLifeArea || undefined,
        astroContext: hasAstro ? astroCtx : undefined,
        numerologyContext: hasNum ? numCtx : undefined,
        dataSources: {
          picture_used: false,
          video_used: false,
          voice_used: false,
          mood_used: true,
          life_area_used: !!selectedLifeArea,
          astrology_used: hasAstro,
          numerology_used: hasNum,
          journal_history_used: false,
        },
      };

      // Calculate colors
      const scores = calculateAuraScores(input);
      const triad = getAuraTriad(scores);
      const chakra = getChakraFocus(triad.outerAura, triad.innerAura, triad.emotionalCore);
      const confidence = calculateScanConfidence(input);

      // Generate template reading (always, for structured fields)
      const templateReading = generateTemplateReading(
        input, triad.outerAura, triad.innerAura, triad.emotionalCore, chakra, confidence,
      );

      // Try to stream AI reading for richer sections
      let fullText = '';
      let aiSections: AuraReadingSection[] = [];
      try {
        await streamAuraReading(
          input, triad.outerAura, triad.innerAura, triad.emotionalCore, chakra,
          (chunk: string) => {
            fullText += chunk;
            setStreamingText(prev => prev + chunk);
          },
          () => {},
          () => {},
        );
        if (fullText) {
          aiSections = parseAISections(fullText);
        }
      } catch {}

      const readingResult: AuraReadingResult = {
        id: `aura-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...templateReading,
        sections: aiSections.length > 0 ? aiSections : templateReading.sections,
      };

      setReading(readingResult);
      setStep('reading');
      setActiveTab('reading');

      // Save to journal
      try {
        const defaultPrivacy: AuraPrivacySettings = {
          saveScans: true,
          savePhotos: false,
          saveVoiceRecordings: false,
          saveInterpretationsOnly: false,
          showAuraBadgeInDating: false,
          allowAuraSharing: false,
          auraHistoryPrivate: true,
          datingAuraVisibility: 'private_only',
        };
        await saveAuraJournalEntry(readingResult, defaultPrivacy);
        loadJournal();
      } catch {}

      // Load forecast (pro only)
      if (tier === 'pro') {
        setForecastLoading(true);
        try {
          const fc = generateAuraForecast(triad.outerAura.color, triad.innerAura.color, triad.emotionalCore.color);
          setForecast(fc);
        } catch {}
        setForecastLoading(false);
      }
    } catch (err) {
      console.error('[AuraMirror] generation error:', err);
      setStep('mood');
    }
    setGenerating(false);
  }

  // ── Load patterns ──
  async function loadPatterns() {
    if (patterns) { setShowPatterns(!showPatterns); return; }
    setPatternsLoading(true);
    try {
      const p = await analyzeAuraPatterns(50);
      setPatterns(p);
      setShowPatterns(true);
    } catch {}
    setPatternsLoading(false);
  }

  // ── Delete journal entry ──
  async function handleDeleteEntry(id: string) {
    await deleteAuraJournalEntry(id);
    setJournalEntries(prev => prev.filter(e => e.id !== id));
  }

  // ── Reset scan ──
  function resetScan() {
    setSelectedMood(null);
    setSelectedLifeArea(null);
    setStep('mood');
    setReading(null);
    setForecast(null);
    setStreamingText('');
    setChatMessages([]);
    setChatInput('');
    setChatStreaming(false);
    setChatExpanded(false);
    setChatQuestionsUsed(0);
  }

  // ── Toggle section ──
  function toggleSection(idx: number) {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }

  // ── Share aura card ──
  async function handleShareCard() {
    if (!shareCardRef.current || shareLoading) return;
    setShareLoading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) { setShareLoading(false); return; }
        const file = new File([blob], 'align-aura-reading.png', { type: 'image/png' });
        if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({
              title: 'My Aura Reading',
              text: 'Check out my aura reading on Align!',
              files: [file],
            });
          } catch {
            // User cancelled — fall through to download
          }
        } else {
          // Fallback: download the image
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'align-aura-reading.png';
          a.click();
          URL.revokeObjectURL(url);
        }
        setShareLoading(false);
      }, 'image/png');
    } catch {
      // html2canvas failed — try basic download fallback
      await downloadCardAsImage(shareCardRef);
      setShareLoading(false);
    }
  }

  function handleCopyShareLink() {
    const url = copyShareLinkUtil({ type: 'chart', meta: { title: 'My Aura Reading' } });
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  // ── Chat follow-up ──
  async function handleSendChat(message?: string) {
    const text = (message || chatInput).trim();
    if (!text || chatStreaming || !reading || chatLimitReached) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatStreaming(true);
    setChatQuestionsUsed(prev => prev + 1);

    // Build context from reading data
    const readingContext = [
      `Outer Aura: ${reading.outerAura.color} (${reading.outerAura.hex})`,
      `Inner Aura: ${reading.innerAura.color} (${reading.innerAura.hex})`,
      `Emotional Core: ${reading.emotionalCore.color} (${reading.emotionalCore.hex})`,
      reading.chakraFocus ? `Chakra Focus: ${reading.chakraFocus.label} (${reading.chakraFocus.status})` : '',
      reading.mood ? `Current Mood: ${reading.mood}` : '',
      reading.lifeArea ? `Life Area Focus: ${reading.lifeArea}` : '',
      `Scan Confidence: ${Math.round(reading.scanConfidence * 100)}%`,
      '',
      'Reading Sections:',
      ...reading.sections.map(s => `[${s.title}]: ${s.content.slice(0, 300)}`),
    ].filter(Boolean).join('\n');

    // Build recent chat history (last 5 exchanges)
    const recentHistory = [...chatMessages, userMsg]
      .slice(-10)
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const systemPrompt = `You are the Aura Mirror follow-up assistant inside the Align astrology app. The user has just received their aura reading and wants to understand it better.

RULES:
- Answer based on their specific reading data provided in the context
- Be direct, personal, and insightful
- Keep answers to 2-4 sentences
- Reference their specific colors, chakra, mood, and life area
- Do NOT give medical or psychological diagnoses
- Speak in second person ("your aura", "your energy")`;

    const context = `${systemPrompt}\n\n--- AURA READING DATA ---\n${readingContext}\n\n--- CONVERSATION HISTORY ---\n${recentHistory}\n\n--- USER QUESTION ---\n${text}`;

    // Add empty assistant message to stream into
    setChatMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      await api.streamAIInterpretation(
        {
          prompt: `Answer this question about the user's aura reading: "${text}"`,
          context,
          language: 'en',
        },
        (chunk: string) => {
          setChatMessages(prev => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
              updated[updated.length - 1] = { ...lastMsg, content: lastMsg.content + chunk };
            }
            return updated;
          });
        },
        () => {
          setChatStreaming(false);
          // Scroll to bottom
          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        },
      );
    } catch (err) {
      console.error('[AuraChat] stream error:', err);
      setChatMessages(prev => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.content) {
          updated[updated.length - 1] = { ...lastMsg, content: t('readings.auraPage.chatError', 'Sorry, I couldn\'t process your question. Please try again.') };
        }
        return updated;
      });
      setChatStreaming(false);
    }
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto card text-center py-12">
        <p className="text-text-muted">{t('readings.signInRequired', 'Sign in to access Aura Mirror')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/readings" className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors">
          <ArrowLeft className="w-5 h-5 text-text-muted" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">🪞 {t('readings.auraPage.title', 'Aura Mirror')}</h1>
          <p className="text-xs text-text-muted">{t('readings.auraPage.subtitle', 'Discover your energy field through mood, astrology & intuition')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-bg-tertiary rounded-xl p-1">
        {(['scan', 'reading', 'journal'] as ActiveTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-accent-primary text-white'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {tab === 'scan' ? t('readings.auraPage.scan', 'Scan') :
             tab === 'reading' ? t('readings.auraPage.reading', 'Reading') :
             t('readings.auraPage.journal', 'Journal')}
          </button>
        ))}
      </div>

      {/* ═══════════════ SCAN TAB ═══════════════ */}
      {activeTab === 'scan' && (
        <div className="card p-6">
          {/* MOOD SELECT */}
          {step === 'mood' && (
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-1">
                {t('readings.auraPage.howFeeling', 'How are you feeling right now?')}
              </h2>
              <p className="text-xs text-text-muted mb-4">{t('readings.auraPage.moodHint', 'Select the mood closest to your current state')}</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {MOOD_OPTIONS.map(m => (
                  <button
                    key={m.key}
                    onClick={() => {
                      setSelectedMood(m.key);
                      setStep('lifeArea');
                    }}
                    className={`p-3 rounded-xl border text-center transition-all hover:scale-[1.02] ${
                      selectedMood === m.key
                        ? 'border-accent-primary bg-accent-primary/15'
                        : 'border-border-primary bg-bg-secondary hover:border-accent-primary/50'
                    }`}
                  >
                    <span className="text-lg">{m.emoji}</span>
                    <p className="text-xs text-text-secondary mt-1">{m.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* LIFE AREA SELECT */}
          {step === 'lifeArea' && (
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-1">
                {t('readings.auraPage.lifeArea', 'What area of life is on your mind?')}
              </h2>
              <p className="text-xs text-text-muted mb-4">{t('readings.auraPage.lifeAreaHint', 'Optional — adds depth to your reading')}</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {LIFE_AREA_OPTIONS.map(la => (
                  <button
                    key={la.key}
                    onClick={() => {
                      setSelectedLifeArea(la.key);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all hover:scale-[1.02] ${
                      selectedLifeArea === la.key
                        ? 'border-accent-primary bg-accent-primary/15'
                        : 'border-border-primary bg-bg-secondary hover:border-accent-primary/50'
                    }`}
                  >
                    <span className="text-lg">{la.emoji}</span>
                    <p className="text-xs text-text-secondary mt-1">{la.label}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep('mood')} className="btn-secondary flex-1">
                  {t('common.back', 'Back')}
                </button>
                <button onClick={() => { setSelectedLifeArea(null); handleGenerate(); }} className="btn-secondary flex-1">
                  {t('readings.auraPage.skip', 'Skip')}
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!selectedLifeArea}
                  className="btn-primary flex-1 disabled:opacity-40"
                >
                  {t('readings.auraPage.generateReading', 'Generate Reading')}
                </button>
              </div>
            </div>
          )}

          {/* GENERATING */}
          {step === 'generating' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 animate-pulse" />
              <p className="text-text-primary font-medium mb-2">{t('readings.auraPage.generating', 'Reading your energy field...')}</p>
              {streamingText && (
                <p className="text-xs text-text-muted max-w-md mx-auto line-clamp-3 mt-3 italic">{streamingText.slice(-200)}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ READING TAB ═══════════════ */}
      {activeTab === 'reading' && (
        <div>
          {!reading ? (
            <div className="card p-8 text-center">
              <p className="text-text-muted mb-4">{t('readings.auraPage.noReading', 'No reading yet. Start a scan to see your aura.')}</p>
              <button onClick={() => { resetScan(); setActiveTab('scan'); }} className="btn-primary">
                {t('readings.auraPage.startScan', 'Start Scan')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Aura Triad Display */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-text-primary">{t('readings.auraPage.yourAura', 'Your Aura')}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">{Math.round(reading.scanConfidence * 100)}% {t('readings.auraPage.confidence', 'confidence')}</span>
                    <button onClick={() => { resetScan(); setActiveTab('scan'); }} className="text-xs text-accent-primary hover:underline">
                      {t('readings.auraPage.newScan', 'New scan')}
                    </button>
                  </div>
                </div>

                {/* Orb Display */}
                <div className="flex justify-center gap-6 mb-6">
                  {[
                    { label: t('readings.auraPage.outer', 'Outer'), color: reading.outerAura },
                    { label: t('readings.auraPage.inner', 'Inner'), color: reading.innerAura },
                    { label: t('readings.auraPage.core', 'Core'), color: reading.emotionalCore },
                  ].map(orb => (
                    <div key={orb.label} className="text-center">
                      <div
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-2 shadow-lg"
                        style={{
                          background: `radial-gradient(circle at 30% 30%, ${AURA_COLORS[orb.color.color]?.hexGlow || orb.color.hex}, ${orb.color.hex})`,
                          boxShadow: `0 0 20px ${orb.color.hex}40`,
                        }}
                      />
                      <p className="text-xs text-text-muted">{orb.label}</p>
                      <p className="text-sm font-medium text-text-primary capitalize">{orb.color.color}</p>
                    </div>
                  ))}
                </div>

                {/* Chakra Badge */}
                {reading.chakraFocus && (
                  <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-bg-secondary mx-auto w-fit">
                    <span className="text-sm">
                      {reading.chakraFocus.label}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      reading.chakraFocus.status === 'overactive' ? 'bg-red-500/20 text-red-400' :
                      reading.chakraFocus.status === 'blocked' ? 'bg-gray-500/20 text-gray-400' :
                      reading.chakraFocus.status === 'open' ? 'bg-green-500/20 text-green-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {reading.chakraFocus.status}
                    </span>
                  </div>
                )}

                {/* Share buttons */}
                <div className="flex items-center justify-center gap-3 mt-5 pt-4 border-t border-border-primary">
                  <button
                    onClick={handleShareCard}
                    disabled={shareLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #9B6FF6, #7C3AED)' }}
                  >
                    <Share2 className="w-4 h-4" />
                    {shareLoading ? t('common.loading', 'Sharing...') : t('common.share', 'Share')}
                  </button>
                  <button
                    onClick={handleCopyShareLink}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] bg-bg-secondary border border-border-primary text-text-primary"
                  >
                    {linkCopied ? (
                      <>
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-green-400">{t('common.copied', 'Copied!')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        {t('components.referralCard.copyLink', 'Copy Link')}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Reading Sections */}
              <div className="card p-6">
                <h3 className="text-base font-semibold text-text-primary mb-4">{t('readings.auraPage.readingSections', 'Your Reading')}</h3>
                <div className="space-y-2">
                  {reading.sections.map((section, idx) => (
                    <div key={idx} className="border border-border-primary rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleSection(idx)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-bg-secondary transition-colors"
                      >
                        <span className="text-sm font-medium text-text-primary">{section.title}</span>
                        {expandedSections.has(idx) ? (
                          <ChevronUp className="w-4 h-4 text-text-muted" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-text-muted" />
                        )}
                      </button>
                      {expandedSections.has(idx) && (
                        <div className="px-4 pb-4">
                          <p className="text-sm text-text-secondary whitespace-pre-wrap">{section.content}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 72-Hour Forecast (Pro) */}
              {tier === 'pro' && (
                <div className="card p-6">
                  <button
                    onClick={() => setForecastExpanded(!forecastExpanded)}
                    className="w-full flex items-center justify-between"
                  >
                    <h3 className="text-base font-semibold text-text-primary">
                      🔮 {t('readings.auraPage.forecast', '72-Hour Aura Forecast')}
                    </h3>
                    {forecastExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                  </button>
                  {forecastExpanded && (
                    <div className="mt-4">
                      {forecastLoading ? (
                        <p className="text-xs text-text-muted text-center py-4">{t('common.loading', 'Loading...')}</p>
                      ) : forecast ? (
                        <div className="space-y-3">
                          {/* Shift direction */}
                          <div className="flex items-center gap-2 bg-bg-secondary rounded-lg p-3">
                            <span className="text-sm text-text-muted">{t('readings.auraPage.shiftDirection', 'Shift:')}</span>
                            <span className="text-sm font-medium text-text-primary capitalize">{forecast.shiftDirection}</span>
                          </div>
                          {/* Forecast windows */}
                          {forecast.windows?.map((w: any, i: number) => (
                            <div key={i} className="border border-border-primary rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-text-primary">{w.label}</span>
                                <span className="text-xs text-text-muted">{w.intensity}</span>
                              </div>
                              <p className="text-xs text-text-secondary">{w.prediction}</p>
                            </div>
                          ))}
                          {/* Narrative */}
                          {forecast.narrative && (
                            <p className="text-xs text-text-secondary italic border-l-2 border-accent-primary pl-3">{forecast.narrative}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-text-muted text-center py-4">{t('readings.auraPage.noForecast', 'Generate a reading to see your forecast')}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Ask About Your Reading ── */}
              <div className="card overflow-hidden">
                <button
                  onClick={() => setChatExpanded(!chatExpanded)}
                  className="w-full flex items-center justify-between px-6 py-4"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-accent-primary" />
                    <h3 className="text-base font-semibold text-text-primary">
                      {t('readings.auraPage.chatTitle', 'Ask About Your Reading')}
                    </h3>
                  </div>
                  {chatExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                </button>

                {chatExpanded && (
                  <div className="px-6 pb-6">
                    {/* Chat messages area */}
                    {chatMessages.length > 0 && (
                      <div className="max-h-[300px] overflow-y-auto mb-4 space-y-3 scrollbar-thin">
                        {chatMessages.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                              msg.role === 'user'
                                ? 'bg-accent-primary text-white rounded-br-md'
                                : 'bg-bg-secondary text-text-primary rounded-bl-md'
                            }`}>
                              {msg.content || (
                                <span className="inline-flex gap-1">
                                  <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                  <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                    )}

                    {/* Quick question chips */}
                    {chatMessages.length === 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {[
                          { label: t('readings.auraPage.chipWhyColor', `Why is my outer aura ${reading.outerAura.color}?`), value: `Why is my outer aura ${reading.outerAura.color}?` },
                          { label: t('readings.auraPage.chipWhatToDo', 'What should I do with this energy?'), value: 'What should I do with this energy?' },
                          ...(reading.lifeArea ? [{ label: t('readings.auraPage.chipLifeArea', `How does this affect my ${reading.lifeArea}?`), value: `How does this affect my ${reading.lifeArea}?` }] : []),
                          ...(reading.chakraFocus ? [{ label: t('readings.auraPage.chipChakra', `Tell me more about my ${reading.chakraFocus.label}`), value: `Tell me more about my ${reading.chakraFocus.label}` }] : []),
                        ].map((chip, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendChat(chip.value)}
                            disabled={chatStreaming || chatLimitReached}
                            className="px-3 py-1.5 rounded-full text-xs font-medium border border-accent-primary/30 text-accent-primary bg-accent-primary/5 hover:bg-accent-primary/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Free tier limit notice */}
                    {tier === 'free' && (
                      <p className="text-[10px] text-text-muted mb-3">
                        {chatLimitReached
                          ? t('readings.auraPage.chatLimitReached', 'Free follow-up limit reached. Upgrade for unlimited questions.')
                          : t('readings.auraPage.chatLimitInfo', `${FREE_CHAT_LIMIT - chatQuestionsUsed} of ${FREE_CHAT_LIMIT} free follow-ups remaining`)}
                      </p>
                    )}

                    {/* Input area */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                        placeholder={t('readings.auraPage.chatPlaceholder', 'Ask about your reading...')}
                        disabled={chatStreaming || chatLimitReached}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors disabled:opacity-50"
                      />
                      <button
                        onClick={() => handleSendChat()}
                        disabled={!chatInput.trim() || chatStreaming || chatLimitReached}
                        className="p-2.5 rounded-xl bg-accent-primary text-white hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Off-screen AuraShareCard for html2canvas capture */}
              <div style={{ position: 'absolute', left: -9999, top: 0, pointerEvents: 'none' }} aria-hidden>
                <AuraShareCard
                  ref={shareCardRef}
                  outerAura={reading.outerAura}
                  innerAura={reading.innerAura}
                  emotionalCore={reading.emotionalCore}
                  chakraLabel={reading.chakraFocus?.label || ''}
                  scanConfidence={reading.scanConfidence}
                  date={new Date(reading.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                />
              </div>

              {/* Disclaimer */}
              <p className="text-[10px] text-text-muted text-center px-4">{AURA_DISCLAIMER}</p>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ JOURNAL TAB ═══════════════ */}
      {activeTab === 'journal' && (
        <div className="space-y-4">
          {/* Pattern Insights (Pro) */}
          {tier === 'pro' && (
            <div className="card p-6">
              <button onClick={loadPatterns} className="w-full flex items-center justify-between">
                <h3 className="text-base font-semibold text-text-primary">
                  📊 {t('readings.auraPage.patterns', 'Pattern Insights')}
                </h3>
                {showPatterns ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
              </button>
              {patternsLoading && (
                <p className="text-xs text-text-muted text-center py-4 mt-2">{t('common.loading', 'Loading...')}</p>
              )}
              {showPatterns && patterns && (
                <div className="mt-4 space-y-3">
                  {/* Top colors bar */}
                  {patterns.topColors && patterns.topColors.length > 0 && (
                    <div className="flex gap-2">
                      {patterns.topColors.slice(0, 5).map((c: any) => (
                        <div key={c.color} className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: AURA_COLORS[c.color as AuraColorName]?.hex || '#888' }} />
                          <span className="text-xs text-text-muted capitalize">{c.color} ({c.count})</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Insight cards */}
                  {patterns.insights?.map((insight: any, i: number) => (
                    <div key={i} className="border border-border-primary rounded-lg p-3">
                      <p className="text-sm font-medium text-text-primary">{insight.icon} {insight.title}</p>
                      <p className="text-xs text-text-secondary mt-1">{insight.description}</p>
                    </div>
                  ))}
                  {(!patterns.insights || patterns.insights.length === 0) && (
                    <p className="text-xs text-text-muted text-center py-4">{t('readings.auraPage.needMoreScans', 'Need at least 3 scans for pattern insights')}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Journal Entries */}
          <div className="card p-6">
            <h3 className="text-base font-semibold text-text-primary mb-4">
              {t('readings.auraPage.recentScans', 'Recent Scans')}
            </h3>
            {journalLoading ? (
              <LoadingCosmic label={t('common.loading', 'Loading...')} />
            ) : journalEntries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-muted text-sm">{t('readings.auraPage.noEntries', 'No aura scans yet.')}</p>
                <button onClick={() => { resetScan(); setActiveTab('scan'); }} className="btn-primary mt-3 text-sm">
                  {t('readings.auraPage.firstScan', 'Start your first scan')}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {journalEntries.map(entry => (
                  <div key={entry.id} className="flex items-center gap-3 p-3 rounded-xl bg-bg-secondary hover:bg-bg-tertiary transition-colors group">
                    {/* Color dots */}
                    <div className="flex -space-x-1">
                      {[entry.outerAuraColor, entry.innerAuraColor, entry.emotionalCoreColor].filter(Boolean).map((c, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-full border-2 border-bg-secondary"
                          style={{ backgroundColor: AURA_COLORS[c as AuraColorName]?.hex || '#888' }}
                        />
                      ))}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary capitalize">
                        {entry.outerAuraColor} / {entry.innerAuraColor} / {entry.emotionalCoreColor}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        {new Date(entry.scanDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        {entry.mood && ` · ${entry.mood}`}
                        {entry.chakraFocus && ` · ${entry.chakraFocus}`}
                      </p>
                    </div>
                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
