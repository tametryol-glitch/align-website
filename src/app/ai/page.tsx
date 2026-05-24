'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { api, buildBirthData } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useAstrologySettings } from '@/stores/astrologySettingsStore';
import { buildChartContext, buildSuggestedQuestions, type ChartContext } from '@/lib/aiChartContext';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Send, Sparkles, Mic, MicOff, Volume2, VolumeX, Square, Settings, X, Play } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import {
  voiceService,
  setVoiceAuthToken,
  prepareSpeechText,
  VOICE_OPTIONS,
  VOICE_SAMPLE_TEXT,
  DEFAULT_VOICE,
  type TTSVoice,
} from '@/lib/voiceService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const FALLBACK_PROMPTS = [
  'What do my current transits mean for my career?',
  'Explain my Sun-Moon combination',
  'What are my biggest strengths based on my chart?',
  'Tell me about my Venus placement in relationships',
  'What does my Rising sign say about how others see me?',
];

let msgIdCounter = 0;
function genMsgId() {
  return `msg_${Date.now()}_${++msgIdCounter}`;
}

/** Build a chart_data_text system prompt from whatever chart data we have */
function buildChartDataText(profile: any, chartData: any, houseSystem?: string): string {
  const name = profile?.display_name || 'User';
  const parts: string[] = [];

  // Map store key to display name
  const houseSystemMap: Record<string, string> = {
    'placidus': 'Placidus',
    'whole_sign': 'Whole Sign',
    'koch': 'Koch',
    'campanus': 'Campanus',
    'regiomontanus': 'Regiomontanus',
    'equal': 'Equal House',
    'porphyry': 'Porphyry',
    'alcabitius': 'Alcabitius',
  };
  const hsDisplay = houseSystemMap[houseSystem || 'whole_sign'] || 'Whole Sign';

  parts.push(`You are ${name}'s personal AI astrologer inside the Align app.`);
  parts.push('');
  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  parts.push(`TODAY'S DATE: ${todayStr}. All references to "now", "currently", "this week", "this month", "this year" must be grounded in this date. Never reference past years as if they are the present.`);
  parts.push('');
  parts.push('CRITICAL RULERSHIP SYSTEM — You MUST use these custom rulerships:');
  parts.push('- Virgo is ruled by VESTA (NOT Mercury)');
  parts.push('- Libra is ruled by JUNO (NOT Venus)');
  parts.push('All other traditional/modern rulerships remain standard.');
  parts.push('');
  parts.push(`HOUSE SYSTEM: ${hsDisplay} (no unequal house cusps — each sign = one whole house).`);
  parts.push('');
  parts.push('RULES:');
  parts.push(`- Use ${name}'s name naturally.`);
  parts.push(`- Reference ${name}'s actual chart data provided below. Never generic astrology.`);
  parts.push('- Be specific: exact planet positions, signs, houses, aspects, and dates.');
  parts.push('- If you don\'t have enough data, say so honestly.');
  parts.push('');

  if (profile?.birth_date) {
    parts.push('=== BIRTH DATA ===');
    parts.push(`Name: ${name}`);
    parts.push(`Birth Date: ${profile.birth_date}`);
    if (profile.birth_time) parts.push(`Birth Time: ${profile.birth_time}`);
    if (profile.birth_location) parts.push(`Birth Location: ${profile.birth_location}`);
    parts.push('');
  }

  if (chartData) {
    const planets = chartData.planets || chartData.positions || [];
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

    const aspects = chartData.aspects || [];
    if (aspects.length > 0) {
      parts.push('=== ASPECTS ===');
      for (const a of aspects) {
        const p1 = a.planet1 || a.body1 || '';
        const p2 = a.planet2 || a.body2 || '';
        const asp = a.aspect || a.type || '';
        const orb = a.orb != null ? `(${a.orb.toFixed(1)}° orb)` : '';
        parts.push(`${p1} ${asp} ${p2} ${orb}`.trim());
      }
      parts.push('');
    }

    const houses = chartData.houses || [];
    if (houses.length > 0) {
      parts.push('=== HOUSES ===');
      for (const h of houses) {
        const num = h.house || h.number || '';
        const sign = h.sign || '';
        parts.push(`House ${num}: ${sign}`);
      }
      parts.push('');
    }
  }

  return parts.join('\n');
}

export default function AIAstrologerPage() {
  const { t } = useTranslation();
  const { profile, session } = useAuthStore();
  const { houseSystem } = useAstrologySettings();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState<any>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartCtx, setChartCtx] = useState<ChartContext | null>(null);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(FALLBACK_PROMPTS);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice state
  const [voiceMode, setVoiceMode] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<TTSVoice>(DEFAULT_VOICE);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [previewingVoice, setPreviewingVoice] = useState<TTSVoice | null>(null);

  // Ref to track the latest assistant message for auto-speak
  const lastAssistantIdRef = useRef<string | null>(null);

  // Load saved voice preference and sync auth token
  useEffect(() => {
    const saved = voiceService.getSavedVoice();
    setSelectedVoice(saved);
  }, []);

  useEffect(() => {
    setVoiceAuthToken(session?.access_token || null);
  }, [session?.access_token]);

  // Load natal chart once on mount if user has birth data,
  // then build the chart context for personalized prompts
  useEffect(() => {
    if (profile?.birth_date && profile?.latitude && !chartData && !chartLoading) {
      setChartLoading(true);
      api.getNatalChart(buildBirthData(profile))
        .then((data) => {
          setChartData(data);
          // Build chart context from the fetched data
          buildChartContext(profile, data).then((ctx) => {
            setChartCtx(ctx);
            if (ctx.loaded) {
              setSuggestedPrompts(buildSuggestedQuestions(ctx));
            }
          });
        })
        .catch(() => {
          // Even if API fails, try building context from profile-level data
          buildChartContext(profile).then((ctx) => {
            setChartCtx(ctx);
            if (ctx.loaded) {
              setSuggestedPrompts(buildSuggestedQuestions(ctx));
            }
          });
        })
        .finally(() => setChartLoading(false));
    } else if (profile && !profile.birth_date && !chartCtx) {
      // No birth data — mark context as not loaded
      setChartCtx({ contextText: '', sunSign: null, sunHouse: null, moonSign: null, moonHouse: null, risingSign: null, venusSign: null, venusHouse: null, marsSign: null, marsHouse: null, placements: [], loaded: false });
    }
  }, [profile?.birth_date, profile?.latitude]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Voice: Speak a message ───
  const handleSpeak = useCallback(async (msgId: string, text: string) => {
    if (isSpeaking && speakingMsgId === msgId) {
      await voiceService.stopPlayback();
      setIsSpeaking(false);
      setSpeakingMsgId(null);
      return;
    }

    const speakText = prepareSpeechText(text);

    try {
      setIsSpeaking(true);
      setSpeakingMsgId(msgId);
      await voiceService.speak(speakText, selectedVoice, () => {
        setIsSpeaking(false);
        setSpeakingMsgId(null);
      });
    } catch (err: any) {
      console.error('[AIAstrologer] TTS error:', err?.message || err);
      setError('Voice unavailable. Check your connection and try again.');
      setIsSpeaking(false);
      setSpeakingMsgId(null);
    }
  }, [isSpeaking, speakingMsgId, selectedVoice]);

  // ─── Voice: Start recording ───
  const handleStartRecording = useCallback(async () => {
    try {
      setIsRecording(true);
      await voiceService.startRecording();
    } catch (err) {
      console.error('[AIAstrologer] Record start error:', err);
      setIsRecording(false);
      setError('Microphone access denied. Please allow microphone permissions.');
    }
  }, []);

  // ─── Voice: Stop recording & transcribe ───
  const handleStopRecording = useCallback(async () => {
    setIsRecording(false);
    setIsTranscribing(true);

    try {
      const text = await voiceService.stopRecordingAndTranscribe();
      if (text && text.trim()) {
        handleSendDirect(text.trim());
      }
    } catch (err) {
      console.error('[AIAstrologer] Transcription error:', err);
      setError('Failed to transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  // ─── Voice: Cancel recording ───
  const handleCancelRecording = useCallback(() => {
    voiceService.cancelRecording();
    setIsRecording(false);
  }, []);

  // Direct send function (used by STT and suggested prompts)
  function handleSendDirect(text: string) {
    if (!text || streaming) return;
    performSend(text);
  }

  async function handleSend(prompt?: string) {
    const text = prompt || input.trim();
    if (!text || streaming) return;
    setInput('');
    performSend(text);
  }

  async function performSend(text: string) {
    setError('');
    const userMessage: Message = { id: genMsgId(), role: 'user', content: text };
    const assistantMessage: Message = { id: genMsgId(), role: 'assistant', content: '' };
    lastAssistantIdRef.current = assistantMessage.id;

    const allMessages = [...messages, userMessage];
    setMessages([...allMessages, assistantMessage]);
    setStreaming(true);

    try {
      const apiMessages = allMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      let fullText = '';

      await api.streamAIInterpretation(
        {
          chart_data_text: buildChartDataText(profile, chartData, houseSystem),
          messages: apiMessages,
          type: 'astrologer_chat',
          chart_context: true,
        },
        (chunk) => {
          fullText += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === 'assistant') {
              last.content = fullText;
            }
            return [...updated];
          });
        },
        () => {
          setStreaming(false);
          // Auto-speak when voice mode is on
          if (voiceMode && fullText && lastAssistantIdRef.current === assistantMessage.id) {
            const speakText = prepareSpeechText(fullText);
            setIsSpeaking(true);
            setSpeakingMsgId(assistantMessage.id);
            voiceService.speak(speakText, selectedVoice, () => {
              setIsSpeaking(false);
              setSpeakingMsgId(null);
            }).catch(() => {
              setIsSpeaking(false);
              setSpeakingMsgId(null);
            });
          }
        }
      );
    } catch (err: any) {
      setStreaming(false);
      setError(err.message);
      setMessages((prev) => prev.slice(0, -1));
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Voice picker: select and save voice
  function selectVoice(voice: TTSVoice) {
    setSelectedVoice(voice);
    voiceService.saveVoice(voice);
  }

  // Voice picker: preview a voice
  async function previewVoice(voiceId: TTSVoice) {
    if (previewingVoice === voiceId) {
      await voiceService.stopPlayback();
      setPreviewingVoice(null);
      return;
    }
    try {
      setPreviewingVoice(voiceId);
      await voiceService.speak(VOICE_SAMPLE_TEXT, voiceId, () => {
        setPreviewingVoice(null);
      });
    } catch (err) {
      console.error('[VoicePicker] preview error:', err);
      setPreviewingVoice(null);
    }
  }

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-display font-bold text-text-primary">AI Astrologer</h1>
          <p className="text-text-tertiary text-xs">Personalized interpretations powered by AI</p>
        </div>

        {/* Voice controls in header */}
        <div className="flex items-center gap-2">
          {/* Voice mode toggle */}
          <button
            onClick={() => {
              const newMode = !voiceMode;
              setVoiceMode(newMode);
              if (!newMode && isSpeaking) {
                voiceService.stopPlayback();
                setIsSpeaking(false);
                setSpeakingMsgId(null);
              }
            }}
            className={`p-2 rounded-lg transition-all ${
              voiceMode
                ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/40'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-card border border-transparent'
            }`}
            title={voiceMode ? 'Voice mode ON' : 'Voice mode OFF'}
          >
            {voiceMode ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Voice picker button (only when voice mode is on) */}
          {voiceMode && (
            <button
              onClick={() => setShowVoicePicker(true)}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card transition-colors"
              title="Choose voice"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chart context indicator */}
      {chartCtx?.loaded && (
        <div className="flex items-center justify-center mb-2 flex-shrink-0">
          <span className="inline-flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1 text-xs text-text-muted">
            <span role="img" aria-label="planet">&#x1FA90;</span>
            Your chart is loaded
          </span>
        </div>
      )}
      {chartLoading && (
        <div className="flex items-center justify-center mb-2 flex-shrink-0">
          <span className="inline-flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1 text-xs text-text-muted">
            <div className="w-3 h-3 border-2 border-accent-primary/40 border-t-accent-primary rounded-full animate-spin" />
            Loading your chart...
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <MessageCircle className="w-12 h-12 text-accent-muted mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-text-primary mb-2">Ask anything about your chart</h2>
            <p className="text-text-tertiary text-sm mb-8 max-w-md mx-auto">
              {chartCtx?.loaded
                ? 'Your natal chart is loaded. Ask personalized questions about your placements, transits, and cosmic patterns.'
                : 'Get AI-powered interpretations of your natal positions, transits, and cosmic patterns.'}
              {voiceMode && ' Voice mode is on — responses will be spoken aloud.'}
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="text-xs text-text-tertiary px-3 py-2 rounded-lg border border-border-primary hover:border-accent-primary hover:text-accent-primary transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isCurrentlySpeaking = isSpeaking && speakingMsgId === msg.id;
          return (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-start gap-2 max-w-[85%]">
                {/* Speaking orb / avatar for assistant */}
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 mt-1">
                    {isCurrentlySpeaking ? (
                      <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center speaking-orb">
                        <Volume2 className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center">
                        <span className="text-white text-xs">✦</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-accent-primary text-white'
                        : `bg-bg-card border ${isCurrentlySpeaking ? 'border-accent-primary/50 shadow-sm shadow-accent-primary/20' : 'border-border-primary'}`
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{msg.content || '...'}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>

                  {/* Speaker button on assistant messages */}
                  {msg.role === 'assistant' && msg.content && (
                    <button
                      onClick={() => handleSpeak(msg.id, msg.content)}
                      className={`self-start flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all ${
                        isCurrentlySpeaking
                          ? 'text-accent-primary bg-accent-primary/10'
                          : 'text-text-muted hover:text-text-primary hover:bg-bg-card'
                      }`}
                    >
                      {isCurrentlySpeaking ? (
                        <>
                          <Square className="w-3 h-3" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Recording overlay */}
      {isRecording && (
        <div className="absolute inset-0 bg-bg-primary/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-2xl">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
              <div className="w-12 h-12 rounded-full bg-red-500/40 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-red-500" />
              </div>
            </div>
          </div>
          <p className="text-text-primary text-lg font-medium mb-2">Listening...</p>
          <p className="text-text-muted text-sm mb-6">Tap stop when finished speaking</p>
          <div className="flex items-center gap-4">
            <button
              onClick={handleStopRecording}
              className="px-6 py-3 bg-accent-primary text-white rounded-full font-medium hover:bg-accent-primary/90 transition-colors"
            >
              Stop & Transcribe
            </button>
            <button
              onClick={handleCancelRecording}
              className="px-4 py-3 text-text-muted hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Transcribing indicator */}
      {isTranscribing && (
        <div className="flex items-center gap-2 px-4 py-2 mb-2 bg-accent-primary/10 border border-accent-primary/20 rounded-lg">
          <div className="w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-accent-primary">Transcribing your message...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg mb-2">{error}</p>
      )}

      {/* Suggested question chips above input (shown when messages exist) */}
      {messages.length > 0 && !streaming && chartCtx?.loaded && (
        <div className="flex-shrink-0 overflow-x-auto pb-2 -mb-1">
          <div className="flex gap-1.5 min-w-max">
            {suggestedPrompts.slice(0, 4).map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="text-[11px] text-text-muted whitespace-nowrap px-2.5 py-1 rounded-full border border-border-primary hover:border-accent-primary/50 hover:text-accent-primary transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 border-t border-border-primary pt-4">
        <div className="flex items-end gap-3">
          {/* Mic button (voice mode) */}
          {voiceMode && !isRecording && (
            <button
              onClick={handleStartRecording}
              disabled={streaming || isTranscribing}
              className={`p-3 rounded-xl flex-shrink-0 transition-all ${
                streaming || isTranscribing
                  ? 'bg-bg-card text-text-muted cursor-not-allowed'
                  : 'bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 border border-accent-primary/30'
              }`}
              title="Hold to speak"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={voiceMode ? 'Type or tap mic...' : 'Ask about your chart...'}
            rows={1}
            disabled={isRecording}
            className="input resize-none min-h-[44px] max-h-32"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || streaming}
            className="btn-primary px-4 py-3 flex-shrink-0"
          >
            {streaming ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Voice Picker Modal */}
      {showVoicePicker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              voiceService.stopPlayback();
              setPreviewingVoice(null);
              setShowVoicePicker(false);
            }}
          />

          {/* Modal content */}
          <div className="relative w-full sm:max-w-md bg-bg-primary border border-border-primary rounded-t-2xl sm:rounded-2xl max-h-[75vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-primary flex-shrink-0">
              <h3 className="text-lg font-semibold text-text-primary">Choose Voice</h3>
              <button
                onClick={() => {
                  voiceService.stopPlayback();
                  setPreviewingVoice(null);
                  setShowVoicePicker(false);
                }}
                className="p-1 text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Voice list */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
              {VOICE_OPTIONS.map((voice) => {
                const isSelected = selectedVoice === voice.id;
                const isPreviewing = previewingVoice === voice.id;
                return (
                  <div
                    key={voice.id}
                    onClick={() => selectVoice(voice.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-accent-primary/10 border border-accent-primary/30'
                        : 'hover:bg-bg-card border border-transparent'
                    }`}
                  >
                    {/* Selected indicator */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'border-accent-primary bg-accent-primary' : 'border-border-primary'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {/* Voice info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isSelected ? 'text-accent-primary' : 'text-text-primary'}`}>
                        {voice.name}
                      </p>
                      <p className="text-xs text-text-muted">{voice.description}</p>
                    </div>

                    {/* Preview button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        previewVoice(voice.id);
                      }}
                      className={`p-2 rounded-lg flex-shrink-0 transition-all ${
                        isPreviewing
                          ? 'bg-accent-primary text-white'
                          : 'bg-bg-card text-text-muted hover:text-text-primary'
                      }`}
                    >
                      {isPreviewing ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border-primary flex-shrink-0">
              <p className="text-xs text-text-muted text-center">
                Selected: <span className="text-accent-primary font-medium">{VOICE_OPTIONS.find(v => v.id === selectedVoice)?.name}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Speaking orb animation CSS */}
      <style jsx global>{`
        .speaking-orb {
          animation: speakPulse 1.5s ease-in-out infinite;
        }
        @keyframes speakPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(155, 111, 246, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(155, 111, 246, 0); }
        }
      `}</style>
    </div>
  );
}
