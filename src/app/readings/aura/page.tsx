'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { ArrowLeft, Mic, MicOff, Camera, Video, Sparkles, Image as ImageIcon, ChevronDown, ChevronUp, Share2, Copy, Check, Download, Trash2, MessageCircle, Send } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import { PaywallGate } from '@/components/ui/PaywallGate';
import type {
  AuraColorName, AuraColorScore, AuraInput, AuraReadingResult, AuraReadingSection,
  MoodOption, LifeAreaOption, AuraJournalEntry, ChakraReading, AuraPrivacySettings,
  AuraScanMode, PictureScanResult, VoiceScanResult, VideoScanResult,
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

type ScanStep = 'mode' | 'photo' | 'voice' | 'video' | 'mood' | 'lifeArea' | 'generating' | 'reading';
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
  const [step, setStep] = useState<ScanStep>('mode');
  const [scanMode, setScanMode] = useState<AuraScanMode>('picture');
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [selectedLifeArea, setSelectedLifeArea] = useState<LifeAreaOption | null>(null);

  // Picture scan state
  const [photoData, setPhotoData] = useState<string | null>(null); // base64 or object URL
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Voice scan state
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [voiceTranscribing, setVoiceTranscribing] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [typedFeeling, setTypedFeeling] = useState('');
  const [voiceDone, setVoiceDone] = useState(false);
  const [voiceEmotionalTone, setVoiceEmotionalTone] = useState<string>('calm');
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Video scan state
  const [videoRecording, setVideoRecording] = useState(false);
  const [videoSeconds, setVideoSeconds] = useState(0);
  const [videoDone, setVideoDone] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const videoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const videoStreamRef = useRef<MediaStream | null>(null);

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

  // ── Cleanup media streams on unmount ──
  useEffect(() => {
    return () => {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
      if (videoTimerRef.current) clearInterval(videoTimerRef.current);
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

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

  // ── Scan mode handlers ──
  function handleModeSelect(mode: AuraScanMode) {
    setScanMode(mode);
    if (mode === 'picture' || mode === 'deep') setStep('photo');
    else if (mode === 'voice') setStep('voice');
    else if (mode === 'video') setStep('video');
  }

  function handleAfterScanInput() {
    setStep('mood');
  }

  // ── Photo handlers ──
  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoData(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handlePhotoRetake() {
    setPhotoData(null);
    setPhotoFile(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
  }

  function handlePhotoContinue() {
    if (scanMode === 'deep') setStep('voice');
    else handleAfterScanInput();
  }

  // ── Voice handlers ──
  async function handleStartVoiceRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        // Simulate voice analysis from the recording
        const duration = voiceSeconds;
        const tones: string[] = ['calm', 'pressured', 'excited', 'sad', 'hesitant', 'confident', 'soft'];
        const detectedTone = tones[Math.floor(Math.random() * tones.length)];
        setVoiceEmotionalTone(detectedTone);
        setVoiceTranscribing(false);
        setVoiceDone(true);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setVoiceRecording(true);
      setVoiceSeconds(0);
      setVoiceDone(false);
      voiceTimerRef.current = setInterval(() => {
        setVoiceSeconds(prev => {
          if (prev >= 60) {
            handleStopVoiceRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.warn('[AuraMirror] Mic access denied:', err);
      setMicPermissionDenied(true);
    }
  }

  function handleStopVoiceRecording() {
    if (voiceTimerRef.current) {
      clearInterval(voiceTimerRef.current);
      voiceTimerRef.current = null;
    }
    setVoiceRecording(false);
    setVoiceTranscribing(true);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }

  function handleCancelVoiceRecording() {
    if (voiceTimerRef.current) {
      clearInterval(voiceTimerRef.current);
      voiceTimerRef.current = null;
    }
    setVoiceRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }

  function handleSubmitTypedFeeling() {
    if (typedFeeling.trim()) {
      setVoiceTranscript(typedFeeling.trim());
      setVoiceEmotionalTone('calm');
      setVoiceDone(true);
    }
    handleAfterScanInput();
  }

  function handleVoiceContinue() {
    if (scanMode === 'deep') handleAfterScanInput();
    else handleAfterScanInput();
  }

  // ── Video handlers ──
  async function handleStartVideoRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      const recorder = new MediaRecorder(stream);
      videoChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) videoChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        setVideoPreviewUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
        videoStreamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
        setVideoDone(true);
      };
      videoRecorderRef.current = recorder;
      recorder.start();
      setVideoRecording(true);
      setVideoSeconds(0);
      setVideoDone(false);
      setVideoPreviewUrl(null);
      videoTimerRef.current = setInterval(() => {
        setVideoSeconds(prev => {
          if (prev >= 15) {
            handleStopVideoRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.warn('[AuraMirror] Camera access denied:', err);
      setCameraPermissionDenied(true);
    }
  }

  function handleStopVideoRecording() {
    if (videoTimerRef.current) {
      clearInterval(videoTimerRef.current);
      videoTimerRef.current = null;
    }
    setVideoRecording(false);
    if (videoRecorderRef.current && videoRecorderRef.current.state !== 'inactive') {
      videoRecorderRef.current.stop();
    }
  }

  function handleVideoRetake() {
    setVideoDone(false);
    setVideoPreviewUrl(null);
    setVideoSeconds(0);
  }

  // ── Build placeholder scan results ──
  function buildPlaceholderPictureScan(): PictureScanResult | undefined {
    if (!photoData) return undefined;
    const seed = photoData.length + Date.now();
    const pr = (o: number) => { const x = Math.sin(seed + o) * 10000; return x - Math.floor(x); };
    const tension = 0.3 + pr(1) * 0.4;
    const energy = 0.3 + pr(2) * 0.4;
    const exprs: PictureScanResult['emotionalExpression'][] = ['calm', 'neutral', 'bright', 'soft', 'tense', 'tired', 'intense', 'guarded'];
    let suggested: PictureScanResult['suggestedAuraInfluence'] = 'green';
    if (energy > 0.6 && tension < 0.4) suggested = 'gold';
    else if (tension > 0.6) suggested = 'gray';
    else if (energy < 0.3) suggested = 'blue';
    return {
      scanConfidence: 0.6, visibleTensionScore: tension, visibleEnergyScore: energy,
      emotionalExpression: exprs[Math.floor(pr(3) * exprs.length)],
      lightingQuality: 'fair', photoUsable: true, suggestedAuraInfluence: suggested,
    };
  }

  function buildPlaceholderVoiceScan(): VoiceScanResult | undefined {
    if (!voiceDone && !typedFeeling.trim()) return undefined;
    const transcript = voiceTranscript || typedFeeling.trim();
    return {
      scanDuration: voiceSeconds || 0,
      scanConfidence: transcript ? 0.6 : 0.3,
      toneScore: 0.5,
      paceScore: 0.5,
      pauseFrequency: 0.5,
      intensityScore: 0.3,
      emotionalTone: (voiceEmotionalTone as VoiceScanResult['emotionalTone']) || 'calm',
      suggestedAuraInfluence: 'blue',
      transcribedText: transcript || undefined,
    };
  }

  function buildPlaceholderVideoScan(): VideoScanResult | undefined {
    if (!videoDone) return undefined;
    return {
      scanDuration: videoSeconds || 10,
      scanConfidence: 0.5,
      movementScore: 0.4,
      expressionStability: 0.6,
      visibleFatigue: 0.3,
      emotionalSteadiness: 0.5,
      suggestedAuraInfluence: 'green',
    };
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

      // Build scan results from collected data
      const pictureScan = buildPlaceholderPictureScan();
      const voiceScan = buildPlaceholderVoiceScan();
      const videoScan = buildPlaceholderVideoScan();

      const input: AuraInput = {
        mode: scanMode,
        pictureScan,
        voiceScan,
        videoScan,
        mood: selectedMood,
        lifeArea: selectedLifeArea || undefined,
        astroContext: hasAstro ? astroCtx : undefined,
        numerologyContext: hasNum ? numCtx : undefined,
        dataSources: {
          picture_used: !!photoData || !!videoDone,
          video_used: !!videoDone,
          voice_used: !!voiceDone || !!typedFeeling.trim(),
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
    setStep('mode');
    setScanMode('picture');
    setReading(null);
    setForecast(null);
    setStreamingText('');
    setChatMessages([]);
    setChatInput('');
    setChatStreaming(false);
    setChatExpanded(false);
    setChatQuestionsUsed(0);
    // Reset scan data
    setPhotoData(null);
    setPhotoFile(null);
    setVoiceRecording(false);
    setVoiceSeconds(0);
    setVoiceTranscribing(false);
    setVoiceTranscript('');
    setTypedFeeling('');
    setVoiceDone(false);
    setMicPermissionDenied(false);
    setVideoRecording(false);
    setVideoSeconds(0);
    setVideoDone(false);
    setVideoPreviewUrl(null);
    setCameraPermissionDenied(false);
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(t => t.stop());
      videoStreamRef.current = null;
    }
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
          {/* MODE SELECT */}
          {step === 'mode' && (
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-1 text-center">
                {t('readings.auraPage.chooseYourScan', 'Choose Your Scan')}
              </h2>
              <p className="text-xs text-text-muted mb-6 text-center">
                {t('readings.auraPage.scanModeHint', 'Each mode reads your energy in a different way')}
              </p>

              <div className="space-y-3">
                {/* Picture Scan */}
                <button
                  onClick={() => handleModeSelect('picture')}
                  className="w-full group"
                >
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-purple-500/[0.02] border border-purple-500/20 hover:border-purple-500/40 transition-all hover:scale-[1.01]">
                    <span className="text-3xl">📸</span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-text-primary">{t('readings.auraPage.pictureScanTitle', 'Picture Aura Scan')}</p>
                      <p className="text-xs text-text-muted">{t('readings.auraPage.pictureScanDesc', 'Take a selfie or upload a photo')}</p>
                    </div>
                  </div>
                </button>

                {/* Voice Scan */}
                <button
                  onClick={() => handleModeSelect('voice')}
                  className="w-full group"
                >
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-blue-500/[0.02] border border-blue-500/20 hover:border-blue-500/40 transition-all hover:scale-[1.01]">
                    <span className="text-3xl">🎙</span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-text-primary">{t('readings.auraPage.voiceScanTitle', 'Voice Aura Scan')}</p>
                      <p className="text-xs text-text-muted">{t('readings.auraPage.voiceScanDesc', 'Tell Align what you are feeling right now')}</p>
                    </div>
                  </div>
                </button>

                {/* Video Scan */}
                <button
                  onClick={() => handleModeSelect('video')}
                  className="w-full group"
                >
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 to-pink-500/[0.02] border border-pink-500/20 hover:border-pink-500/40 transition-all hover:scale-[1.01]">
                    <span className="text-3xl">🎥</span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-text-primary">{t('readings.auraPage.videoScanTitle', 'Live Video Scan')}</p>
                      <p className="text-xs text-text-muted">{t('readings.auraPage.videoScanDesc', '15-second video of your energy')}</p>
                    </div>
                  </div>
                </button>

                {/* Deep Reading */}
                <button
                  onClick={() => handleModeSelect('deep')}
                  className="w-full group"
                >
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-500/[0.02] border border-amber-500/20 hover:border-amber-500/40 transition-all hover:scale-[1.01]">
                    <span className="text-3xl">🔮</span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-text-primary">{t('readings.auraPage.deepReadingTitle', 'Deep Aura Reading')}</p>
                      <p className="text-xs text-text-muted">{t('readings.auraPage.deepReadingDesc', 'Photo + voice + mood + astrology combined')}</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Quick mood-only */}
              <button
                onClick={() => { setScanMode('picture'); setStep('mood'); }}
                className="w-full text-center mt-4 py-3"
              >
                <span className="text-xs text-text-muted hover:text-text-secondary transition-colors">
                  {t('readings.auraPage.quickScan', 'Quick scan — mood + astrology only')}
                </span>
              </button>

              <p className="text-[10px] text-text-muted text-center mt-4 italic">{AURA_DISCLAIMER}</p>
            </div>
          )}

          {/* PHOTO STEP */}
          {step === 'photo' && (
            <div>
              <div className="rounded-2xl bg-gradient-to-b from-purple-500/10 to-transparent p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-1 text-center">
                  {scanMode === 'deep'
                    ? t('readings.auraPage.photoStepDeep', 'Step 1: Photo')
                    : t('readings.auraPage.photoStepTitle', 'Take Your Photo')}
                </h2>
                <p className="text-xs text-text-muted mb-6 text-center">
                  {t('readings.auraPage.photoStepDesc', 'Look into the camera. Let Align read the energy in your expression.')}
                </p>

                {photoData ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <img
                        src={photoData}
                        alt="Your photo"
                        className="w-40 h-40 rounded-full object-cover border-[3px] border-purple-500 shadow-lg shadow-purple-500/20"
                      />
                      <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(155,111,246,0.2)]" />
                    </div>
                    <button onClick={handlePhotoRetake} className="text-xs text-text-muted underline">
                      {t('readings.auraPage.retake', 'Retake')}
                    </button>
                    <button onClick={handlePhotoContinue} className="btn-primary w-full max-w-xs">
                      {t('readings.auraPage.continue', 'Continue')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Camera capture (mobile-friendly) */}
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handlePhotoSelect}
                      className="hidden"
                      id="aura-camera-input"
                    />
                    <label
                      htmlFor="aura-camera-input"
                      className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <Camera className="w-5 h-5" />
                      {t('readings.auraPage.takeSelfie', 'Take Selfie')}
                    </label>

                    {/* File upload fallback */}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                      id="aura-upload-input"
                    />
                    <label
                      htmlFor="aura-upload-input"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-purple-500/30 text-purple-400 font-semibold text-sm cursor-pointer hover:bg-purple-500/5 transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" />
                      {t('readings.auraPage.uploadPhoto', 'Upload Photo')}
                    </label>

                    <button
                      onClick={() => scanMode === 'deep' ? setStep('voice') : handleAfterScanInput()}
                      className="w-full text-center py-2"
                    >
                      <span className="text-xs text-text-muted hover:text-text-secondary">
                        {t('readings.auraPage.skipPhoto', 'Skip photo')}
                      </span>
                    </button>
                  </div>
                )}
              </div>
              <button onClick={() => setStep('mode')} className="btn-secondary w-full mt-4">
                {t('common.back', 'Back')}
              </button>
            </div>
          )}

          {/* VOICE STEP */}
          {step === 'voice' && (
            <div>
              <div className="rounded-2xl bg-gradient-to-b from-blue-500/10 to-transparent p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-1 text-center">
                  {scanMode === 'deep'
                    ? t('readings.auraPage.voiceStepDeep', 'Step 2: Voice')
                    : t('readings.auraPage.voiceStepTitle', 'Voice Aura Scan')}
                </h2>
                <p className="text-xs text-text-muted mb-6 text-center">
                  {t('readings.auraPage.voiceStepDesc', 'Tell Align what you are feeling right now. Speak naturally for 10-60 seconds.')}
                </p>

                {voiceTranscribing ? (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse">
                      <Mic className="w-8 h-8 text-blue-400" />
                    </div>
                    <p className="text-sm font-medium text-text-primary">{t('readings.auraPage.analyzingVoice', 'Analyzing your voice...')}</p>
                  </div>
                ) : voiceRecording ? (
                  <div className="flex flex-col items-center gap-4 py-4">
                    {/* Recording animation */}
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center animate-pulse">
                        <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse" />
                        </div>
                      </div>
                      {/* Pulsing rings */}
                      <div className="absolute inset-0 rounded-full border-2 border-red-500/30 animate-ping" style={{ animationDuration: '1.5s' }} />
                      <div className="absolute -inset-2 rounded-full border border-red-500/15 animate-ping" style={{ animationDuration: '2s' }} />
                    </div>
                    <p className="text-3xl font-extrabold text-text-primary tabular-nums">{voiceSeconds}s</p>
                    <p className="text-sm font-medium text-text-primary">{t('readings.auraPage.listening', 'Listening...')}</p>
                    <p className="text-xs text-text-muted italic">{t('readings.auraPage.speakNaturally', 'Speak naturally about how you feel')}</p>
                    <div className="flex gap-3 w-full max-w-xs">
                      <button
                        onClick={handleStopVoiceRecording}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-colors"
                      >
                        <MicOff className="w-4 h-4" />
                        {t('readings.auraPage.stopRecording', 'Stop')}
                      </button>
                      <button
                        onClick={handleCancelVoiceRecording}
                        className="py-3 px-4 text-xs text-text-muted hover:text-text-secondary"
                      >
                        {t('common.cancel', 'Cancel')}
                      </button>
                    </div>
                  </div>
                ) : voiceDone ? (
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-6 h-6 text-green-400" />
                    </div>
                    <p className="text-base font-bold text-green-400">{t('readings.auraPage.voiceCaptured', 'Voice captured')}</p>
                    {voiceTranscript && (
                      <p className="text-xs text-text-secondary italic text-center max-w-sm line-clamp-3">
                        &ldquo;{voiceTranscript}&rdquo;
                      </p>
                    )}
                    <p className="text-xs text-text-muted">
                      {t('readings.auraPage.detectedTone', 'Detected tone:')} {voiceEmotionalTone}
                    </p>
                    <button onClick={handleVoiceContinue} className="btn-primary w-full max-w-xs">
                      {t('readings.auraPage.continue', 'Continue')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {micPermissionDenied ? (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
                          <MicOff className="w-6 h-6 text-amber-400" />
                        </div>
                        <p className="text-sm text-amber-400 font-medium mb-2">
                          {t('readings.auraPage.micDenied', 'Microphone access not available')}
                        </p>
                        <p className="text-xs text-text-muted mb-4">
                          {t('readings.auraPage.micDeniedHint', 'You can type what you are feeling instead')}
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={handleStartVoiceRecording}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-sm hover:opacity-90 transition-opacity"
                      >
                        <Mic className="w-5 h-5" />
                        {t('readings.auraPage.startRecording', 'Start Recording')}
                      </button>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-border-primary" />
                      <span className="text-xs text-text-muted">{t('readings.auraPage.orType', 'or type it')}</span>
                      <div className="flex-1 h-px bg-border-primary" />
                    </div>

                    <textarea
                      value={typedFeeling}
                      onChange={e => setTypedFeeling(e.target.value)}
                      placeholder={t('readings.auraPage.typeFeelingPlaceholder', "Type what you're feeling...")}
                      maxLength={500}
                      className="w-full min-h-[80px] px-4 py-3 rounded-xl bg-bg-secondary border border-border-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                    />

                    {typedFeeling.trim().length > 0 && (
                      <button onClick={handleSubmitTypedFeeling} className="btn-primary w-full">
                        {t('readings.auraPage.continue', 'Continue')}
                      </button>
                    )}

                    <button onClick={handleAfterScanInput} className="w-full text-center py-2">
                      <span className="text-xs text-text-muted hover:text-text-secondary">
                        {t('readings.auraPage.skipVoice', 'Skip voice scan')}
                      </span>
                    </button>
                  </div>
                )}
              </div>
              <button onClick={() => scanMode === 'deep' ? setStep('photo') : setStep('mode')} className="btn-secondary w-full mt-4">
                {t('common.back', 'Back')}
              </button>
            </div>
          )}

          {/* VIDEO STEP */}
          {step === 'video' && (
            <div>
              <div className="rounded-2xl bg-gradient-to-b from-pink-500/10 to-transparent p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-1 text-center">
                  {t('readings.auraPage.videoStepTitle', 'Live Video Scan')}
                </h2>
                <p className="text-xs text-text-muted mb-6 text-center">
                  {t('readings.auraPage.videoStepDesc', 'Look into the camera. Breathe normally. Record 15 seconds.')}
                </p>

                {cameraPermissionDenied ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
                      <Video className="w-6 h-6 text-amber-400" />
                    </div>
                    <p className="text-sm text-amber-400 font-medium mb-2">
                      {t('readings.auraPage.cameraDenied', 'Camera access not available')}
                    </p>
                    <p className="text-xs text-text-muted mb-4">
                      {t('readings.auraPage.cameraDeniedHint', 'Enable camera permissions in your browser settings to use video scan')}
                    </p>
                    <button onClick={handleAfterScanInput} className="btn-primary">
                      {t('readings.auraPage.continueWithoutVideo', 'Continue without video')}
                    </button>
                  </div>
                ) : videoDone && videoPreviewUrl ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-6 h-6 text-green-400" />
                    </div>
                    <p className="text-base font-bold text-green-400">{t('readings.auraPage.videoCaptured', 'Video captured')}</p>
                    <video
                      src={videoPreviewUrl}
                      className="w-full max-w-sm rounded-xl border border-border-primary"
                      controls
                    />
                    <div className="flex gap-3 w-full max-w-xs">
                      <button onClick={handleVideoRetake} className="btn-secondary flex-1">
                        {t('readings.auraPage.recordAgain', 'Record again')}
                      </button>
                      <button onClick={handleAfterScanInput} className="btn-primary flex-1">
                        {t('readings.auraPage.continue', 'Continue')}
                      </button>
                    </div>
                  </div>
                ) : videoRecording ? (
                  <div className="flex flex-col items-center gap-4">
                    {/* Live webcam preview */}
                    <div className="relative w-full max-w-sm">
                      <video
                        ref={videoRef}
                        className="w-full rounded-xl border-2 border-pink-500/40 shadow-lg shadow-pink-500/10"
                        muted
                        playsInline
                      />
                      {/* Countdown overlay */}
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-white font-bold text-sm tabular-nums">{15 - videoSeconds}s</span>
                      </div>
                      {/* Progress bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30 rounded-b-xl overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-1000"
                          style={{ width: `${(videoSeconds / 15) * 100}%` }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleStopVideoRecording}
                      className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-colors"
                    >
                      {t('readings.auraPage.stopVideo', 'Stop Recording')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={handleStartVideoRecording}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-pink-600 to-pink-700 text-white font-bold text-sm hover:opacity-90 transition-opacity"
                    >
                      <Video className="w-5 h-5" />
                      {t('readings.auraPage.recordVideo', 'Record Video')}
                    </button>
                    <button onClick={handleAfterScanInput} className="w-full text-center py-2">
                      <span className="text-xs text-text-muted hover:text-text-secondary">
                        {t('readings.auraPage.skipVideo', 'Skip video scan')}
                      </span>
                    </button>
                  </div>
                )}
              </div>
              <button onClick={() => setStep('mode')} className="btn-secondary w-full mt-4">
                {t('common.back', 'Back')}
              </button>
            </div>
          )}

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
              {/* Scan data summary */}
              {(photoData || voiceDone || videoDone) && (
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {photoData && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      📸 {t('readings.auraPage.photoAdded', 'Photo added')}
                    </span>
                  )}
                  {voiceDone && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      🎙 {t('readings.auraPage.voiceAdded', 'Voice added')}
                    </span>
                  )}
                  {videoDone && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                      🎥 {t('readings.auraPage.videoAdded', 'Video added')}
                    </span>
                  )}
                </div>
              )}
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
              {/* Animated orbs */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-2 rounded-full border-2 border-blue-500/40 animate-ping" style={{ animationDuration: '2.5s' }} />
                <div className="absolute inset-4 rounded-full border-2 border-pink-500/50 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-6 rounded-full bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-pink-500/20 animate-pulse" />
              </div>
              <p className="text-text-primary font-medium mb-2">{t('readings.auraPage.generating', 'Reading your energy field...')}</p>
              <p className="text-xs text-text-muted mb-4">
                {(photoData || voiceDone || videoDone)
                  ? t('readings.auraPage.generatingWithScan', 'Analyzing your scan data with cosmic alignments...')
                  : t('readings.auraPage.generatingMoodOnly', 'Connecting your mood with current cosmic weather...')}
              </p>
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
