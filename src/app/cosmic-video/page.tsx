'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { buildBirthData } from '@/lib/api';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';
import {
  TEMPLATES,
  MUSIC_TRACKS,
  COLOR_THEMES,
  AR_FILTERS,
  FREE_MONTHLY_VIDEO_LIMIT,
  requestRender,
  getRenderStatus,
  generateScript,
  getMyVideos,
  type TemplateId,
  type TemplateInfo,
  type RenderJob,
  type CosmicVideo,
  type AudioOption,
  type MusicTrack,
  type TextOverlayConfig,
  type ColorThemeOption,
  type ARFilterOption,
} from '@/lib/cosmicVideoService';
import {
  Video, ChevronLeft, Play, Download, Share2,
  Sparkles, Clock, Loader2, AlertCircle, Check,
  Volume2, VolumeX, RefreshCw, Music, Type, Palette, Plus, X, Sliders, Wand2,
} from 'lucide-react';

// -- Zodiac signs for the zodiac_personality template -------------------
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

type View = 'templates' | 'customize' | 'rendering' | 'ready' | 'my-videos';

export default function CosmicVideoPage() {
  const { profile, isAuthenticated } = useAuthStore();

  // -- View state -------------------------------------------------------
  const [view, setView] = useState<View>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfo | null>(null);

  // -- Customization state ----------------------------------------------
  const [audioType, setAudioType] = useState<'none' | 'tts'>('none');
  const [ttsVoice, setTtsVoice] = useState('nova');
  const [generatedScript, setGeneratedScript] = useState('');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [targetSign, setTargetSign] = useState('Aries');
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const [colorTheme, setColorTheme] = useState('default');
  const [durationSeconds, setDurationSeconds] = useState(30);
  const [textOverlays, setTextOverlays] = useState<TextOverlayConfig[]>([]);
  const [arFilter, setArFilter] = useState<string | null>(null);

  // -- Render state -----------------------------------------------------
  const [currentJob, setCurrentJob] = useState<RenderJob | null>(null);
  const [renderError, setRenderError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // -- My Videos state --------------------------------------------------
  const [myVideos, setMyVideos] = useState<CosmicVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);

  // -- Cleanup poll on unmount ------------------------------------------
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // -- Helpers ----------------------------------------------------------

  const buildAstroData = useCallback(() => {
    if (!profile) return {};
    const bd = buildBirthData(profile);
    return {
      sunSign: profile.sun_sign || '',
      moonSign: profile.moon_sign || '',
      risingSign: profile.rising_sign || '',
      displayName: profile.display_name || '',
      planets: [],
      aspects: [],
      ...bd,
    };
  }, [profile]);

  // -- Template selection -----------------------------------------------

  const handleSelectTemplate = useCallback((tmpl: TemplateInfo) => {
    setSelectedTemplate(tmpl);
    setAudioType('none');
    setGeneratedScript('');
    setRenderError('');
    setCurrentJob(null);
    setSelectedMusic(null);
    setMusicVolume(0.3);
    setColorTheme('default');
    setDurationSeconds(tmpl.durationRange[0]);
    setTextOverlays([]);
    setArFilter(null);
    if (tmpl.id === 'zodiac_personality') {
      setTargetSign(profile?.sun_sign || 'Aries');
    }
    setView('customize');
  }, [profile]);

  // -- Script generation ------------------------------------------------

  const handleGenerateScript = useCallback(async () => {
    if (!selectedTemplate) return;
    setIsGeneratingScript(true);
    try {
      const astroData = buildAstroData();
      const script = await generateScript(selectedTemplate.id, astroData);
      setGeneratedScript(script);
      setAudioType('tts');
    } catch (err: any) {
      setRenderError(err?.message || 'Failed to generate script');
    } finally {
      setIsGeneratingScript(false);
    }
  }, [selectedTemplate, buildAstroData]);

  // -- Submit render ----------------------------------------------------

  const handleSubmitRender = useCallback(async () => {
    if (!selectedTemplate) return;
    setIsSubmitting(true);
    setRenderError('');

    try {
      const astroData = buildAstroData();

      const audioOption: AudioOption = audioType === 'tts'
        ? { type: 'tts', tts_voice: ttsVoice, tts_text: generatedScript }
        : { type: 'none' };

      const job = await requestRender({
        template_id: selectedTemplate.id,
        astro_data: astroData,
        audio_option: audioOption,
        customizations: {
          duration_seconds: durationSeconds,
          color_theme: colorTheme,
          target_sign: selectedTemplate.id === 'zodiac_personality' ? targetSign : undefined,
          music_track_id: selectedMusic || undefined,
          music_volume: selectedMusic ? musicVolume : undefined,
          text_overlays: textOverlays.length > 0 ? textOverlays : undefined,
          ar_filter_id: arFilter || undefined,
        },
      });

      setCurrentJob(job);
      setView('rendering');

      // Start polling
      pollRef.current = setInterval(async () => {
        try {
          const updated = await getRenderStatus(job.id);
          setCurrentJob(updated);
          if (updated.status === 'ready' || updated.status === 'failed') {
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = null;
            if (updated.status === 'ready') {
              setView('ready');
            } else {
              setRenderError(updated.error || 'Render failed');
            }
          }
        } catch {
          // keep polling
        }
      }, 3000);
    } catch (err: any) {
      setRenderError(err?.message || 'Failed to start render');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedTemplate, audioType, ttsVoice, generatedScript, targetSign, buildAstroData]);

  // -- Load my videos ---------------------------------------------------

  const handleLoadMyVideos = useCallback(async () => {
    setVideosLoading(true);
    try {
      const videos = await getMyVideos();
      setMyVideos(videos);
    } catch {
      // silent
    } finally {
      setVideosLoading(false);
    }
    setView('my-videos');
  }, []);

  // -- Back navigation --------------------------------------------------

  const handleBack = useCallback(() => {
    if (view === 'customize') {
      setView('templates');
      setSelectedTemplate(null);
    } else if (view === 'rendering' || view === 'ready') {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
      setView('templates');
      setSelectedTemplate(null);
      setCurrentJob(null);
    } else if (view === 'my-videos') {
      setView('templates');
    }
  }, [view]);

  // -- Auth gate --------------------------------------------------------

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <Video className="w-12 h-12 text-accent-primary mx-auto mb-4" />
        <h2 className="text-xl font-display font-bold text-text-primary mb-2">
          Cosmic Video Creator
        </h2>
        <p className="text-text-tertiary text-sm mb-6">
          Sign in to create shareable astrology videos.
        </p>
        <Link href="/auth/login" className="btn-primary inline-flex items-center gap-2 px-8">
          Sign In
        </Link>
      </div>
    );
  }

  // =====================================================================
  // RENDER
  // =====================================================================

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 py-6">
        {view !== 'templates' && (
          <button onClick={handleBack} className="p-2 -ml-2 rounded-xl hover:bg-bg-tertiary text-text-secondary">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold text-text-primary">
            {view === 'templates' && 'Cosmic Video Creator'}
            {view === 'customize' && selectedTemplate?.name}
            {view === 'rendering' && 'Rendering...'}
            {view === 'ready' && 'Video Ready!'}
            {view === 'my-videos' && 'My Videos'}
          </h1>
          {view === 'templates' && (
            <p className="text-text-tertiary text-sm mt-1">
              Create shareable astrology videos ({FREE_MONTHLY_VIDEO_LIMIT} free/month)
            </p>
          )}
        </div>
        {view === 'templates' && (
          <button
            onClick={handleLoadMyVideos}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-bg-card border border-border-primary text-text-secondary hover:bg-bg-tertiary transition-colors"
          >
            My Videos
          </button>
        )}
      </div>

      {/* -- Templates View ---------------------------------------------- */}
      {view === 'templates' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => handleSelectTemplate(tmpl)}
              className="text-left bg-bg-card border border-border-primary rounded-2xl p-5 hover:border-accent-primary/40 transition-all group"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{tmpl.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
                      {tmpl.name}
                    </h3>
                    {tmpl.premium && (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-accent-primary/20 text-accent-primary">
                        Premium
                      </span>
                    )}
                  </div>
                  <p className="text-text-tertiary text-sm mt-1 line-clamp-2">
                    {tmpl.description}
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-text-muted">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{tmpl.durationRange[0]}-{tmpl.durationRange[1]}s</span>
                    {tmpl.requiresPartner && (
                      <>
                        <span className="text-border-primary">|</span>
                        <span>Requires 2 charts</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* -- Customize View ---------------------------------------------- */}
      {view === 'customize' && selectedTemplate && (
        <div className="space-y-6">
          {/* Template summary */}
          <div className="bg-bg-card border border-border-primary rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{selectedTemplate.emoji}</span>
              <div>
                <h3 className="font-semibold text-text-primary">{selectedTemplate.name}</h3>
                <p className="text-text-tertiary text-sm">{selectedTemplate.description}</p>
              </div>
            </div>
            {selectedTemplate.requiresChart && profile && (
              <div className="flex items-center gap-2 text-sm text-text-secondary bg-bg-tertiary rounded-xl px-4 py-2.5">
                <Check className="w-4 h-4 text-green-400" />
                <span>Using chart for {profile.display_name || 'you'}</span>
              </div>
            )}
          </div>

          {/* Zodiac sign picker (zodiac_personality only) */}
          {selectedTemplate.id === 'zodiac_personality' && (
            <div className="bg-bg-card border border-border-primary rounded-2xl p-5">
              <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                Choose a Sign
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {ZODIAC_SIGNS.map((sign) => (
                  <button
                    key={sign}
                    onClick={() => setTargetSign(sign)}
                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                      targetSign === sign
                        ? 'bg-accent-primary text-white'
                        : 'bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary/80'
                    }`}
                  >
                    {sign}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Audio options */}
          <div className="bg-bg-card border border-border-primary rounded-2xl p-5">
            <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Voiceover
            </h4>
            <div className="flex gap-3">
              <button
                onClick={() => setAudioType('none')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                  audioType === 'none'
                    ? 'bg-accent-primary text-white'
                    : 'bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary/80'
                }`}
              >
                <VolumeX className="w-4 h-4" />
                No Voice
              </button>
              <button
                onClick={handleGenerateScript}
                disabled={isGeneratingScript}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                  audioType === 'tts'
                    ? 'bg-accent-primary text-white'
                    : 'bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary/80'
                }`}
              >
                {isGeneratingScript ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
                AI Voice
              </button>
            </div>

            {/* Generated script preview */}
            {generatedScript && (
              <div className="mt-4 bg-bg-tertiary rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Generated Script
                  </span>
                  <button
                    onClick={handleGenerateScript}
                    disabled={isGeneratingScript}
                    className="text-xs text-accent-primary hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isGeneratingScript ? 'animate-spin' : ''}`} />
                    Regenerate
                  </button>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{generatedScript}</p>

                {/* Voice picker */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-text-muted">Voice:</span>
                  {['nova', 'shimmer', 'echo', 'onyx'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setTtsVoice(v)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                        ttsVoice === v
                          ? 'bg-accent-primary/20 text-accent-primary'
                          : 'bg-bg-card text-text-muted hover:text-text-secondary'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Duration slider */}
          <div className="bg-bg-card border border-border-primary rounded-2xl p-5">
            <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              <Sliders className="w-4 h-4 inline mr-2" />
              Duration
            </h4>
            <div className="flex items-center gap-3">
              <span className="text-xs text-text-muted w-6">{selectedTemplate.durationRange[0]}s</span>
              <input
                type="range"
                min={selectedTemplate.durationRange[0]}
                max={selectedTemplate.durationRange[1]}
                step={1}
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(parseInt(e.target.value))}
                className="flex-1 accent-accent-primary h-1.5"
              />
              <span className="text-xs text-text-muted w-6">{selectedTemplate.durationRange[1]}s</span>
              <span className="text-sm font-medium text-accent-primary w-10 text-right">
                {durationSeconds}s
              </span>
            </div>
          </div>

          {/* Color theme */}
          <div className="bg-bg-card border border-border-primary rounded-2xl p-5">
            <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              <Palette className="w-4 h-4 inline mr-2" />
              Color Theme
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {COLOR_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setColorTheme(theme.id)}
                  className={`relative flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl transition-all ${
                    colorTheme === theme.id
                      ? 'ring-2 ring-accent-primary bg-bg-tertiary'
                      : 'hover:bg-bg-tertiary'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${theme.preview[0]} 0%, ${theme.preview[1]} 100%)`,
                    }}
                  />
                  <span className="text-[10px] text-text-muted text-center leading-tight">
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Text overlays */}
          <div className="bg-bg-card border border-border-primary rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                <Type className="w-4 h-4 inline mr-2" />
                Text Overlays
              </h4>
              <button
                onClick={() =>
                  setTextOverlays((prev) => [
                    ...prev,
                    {
                      text: '',
                      start_sec: 0,
                      end_sec: durationSeconds,
                      position: 'bottom',
                      font_size: 36,
                      color: '#FFFFFF',
                      animation: 'fade',
                    },
                  ])
                }
                className="flex items-center gap-1 text-xs text-accent-primary hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Text
              </button>
            </div>

            {textOverlays.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-4">
                Add custom captions, hashtags, or text to your video
              </p>
            ) : (
              <div className="space-y-3">
                {textOverlays.map((overlay, idx) => (
                  <div key={idx} className="bg-bg-tertiary rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={overlay.text}
                        onChange={(e) => {
                          const updated = [...textOverlays];
                          updated[idx] = { ...updated[idx], text: e.target.value };
                          setTextOverlays(updated);
                        }}
                        placeholder="Enter text..."
                        className="flex-1 bg-bg-card border border-border-primary rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-primary"
                      />
                      <button
                        onClick={() => setTextOverlays((prev) => prev.filter((_, i) => i !== idx))}
                        className="p-1.5 text-text-muted hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {/* Position */}
                      {(['top', 'center', 'bottom'] as const).map((pos) => (
                        <button
                          key={pos}
                          onClick={() => {
                            const updated = [...textOverlays];
                            updated[idx] = { ...updated[idx], position: pos };
                            setTextOverlays(updated);
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-medium capitalize ${
                            overlay.position === pos
                              ? 'bg-accent-primary/20 text-accent-primary'
                              : 'bg-bg-card text-text-muted'
                          }`}
                        >
                          {pos}
                        </button>
                      ))}

                      <span className="text-border-primary">|</span>

                      {/* Animation */}
                      {(['fade', 'slide', 'scale', 'typewriter'] as const).map((anim) => (
                        <button
                          key={anim}
                          onClick={() => {
                            const updated = [...textOverlays];
                            updated[idx] = { ...updated[idx], animation: anim };
                            setTextOverlays(updated);
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-medium capitalize ${
                            overlay.animation === anim
                              ? 'bg-accent-primary/20 text-accent-primary'
                              : 'bg-bg-card text-text-muted'
                          }`}
                        >
                          {anim}
                        </button>
                      ))}
                    </div>

                    {/* Timing */}
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <span>Show:</span>
                      <input
                        type="number"
                        min={0}
                        max={durationSeconds}
                        value={overlay.start_sec}
                        onChange={(e) => {
                          const updated = [...textOverlays];
                          updated[idx] = { ...updated[idx], start_sec: parseFloat(e.target.value) || 0 };
                          setTextOverlays(updated);
                        }}
                        className="w-14 bg-bg-card border border-border-primary rounded px-2 py-1 text-text-primary text-xs"
                      />
                      <span>to</span>
                      <input
                        type="number"
                        min={0}
                        max={durationSeconds}
                        value={overlay.end_sec ?? durationSeconds}
                        onChange={(e) => {
                          const updated = [...textOverlays];
                          updated[idx] = { ...updated[idx], end_sec: parseFloat(e.target.value) || durationSeconds };
                          setTextOverlays(updated);
                        }}
                        className="w-14 bg-bg-card border border-border-primary rounded px-2 py-1 text-text-primary text-xs"
                      />
                      <span>sec</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Background music */}
          <div className="bg-bg-card border border-border-primary rounded-2xl p-5">
            <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Background Music
            </h4>

            {/* No music option */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => setSelectedMusic(null)}
                className={`flex items-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                  !selectedMusic
                    ? 'bg-accent-primary text-white'
                    : 'bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary/80'
                }`}
              >
                <VolumeX className="w-4 h-4" />
                None
              </button>
              {MUSIC_TRACKS.map((track) => (
                <button
                  key={track.id}
                  onClick={() => setSelectedMusic(track.id)}
                  className={`flex items-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                    selectedMusic === track.id
                      ? 'bg-accent-primary text-white'
                      : 'bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary/80'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  <div className="text-left min-w-0">
                    <div className="truncate">{track.name}</div>
                    <div className={`text-[10px] ${selectedMusic === track.id ? 'text-white/70' : 'text-text-muted'}`}>
                      {track.mood}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Volume slider */}
            {selectedMusic && (
              <div className="mt-4 flex items-center gap-3">
                <VolumeX className="w-4 h-4 text-text-muted" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                  className="flex-1 accent-accent-primary h-1.5"
                />
                <Volume2 className="w-4 h-4 text-text-muted" />
                <span className="text-xs text-text-muted w-8 text-right">
                  {Math.round(musicVolume * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* AR Filters */}
          <div className="bg-bg-secondary rounded-2xl p-5 border border-border-primary">
            <div className="flex items-center gap-2 mb-3">
              <Wand2 className="w-4 h-4 text-accent-primary" />
              <h3 className="text-sm font-semibold text-text-primary">AR Filters</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setArFilter(null)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-center transition-all ${
                  !arFilter
                    ? 'border-accent-primary bg-accent-primary/10'
                    : 'border-border-primary bg-bg-tertiary hover:border-border-secondary'
                }`}
              >
                <span className="text-lg">🚫</span>
                <span className={`text-xs font-medium ${!arFilter ? 'text-accent-primary' : 'text-text-secondary'}`}>
                  None
                </span>
              </button>
              {AR_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setArFilter(filter.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-center transition-all ${
                    arFilter === filter.id
                      ? 'border-accent-primary bg-accent-primary/10'
                      : 'border-border-primary bg-bg-tertiary hover:border-border-secondary'
                  }`}
                >
                  <span className="text-lg">{filter.emoji}</span>
                  <span className={`text-xs font-medium ${arFilter === filter.id ? 'text-accent-primary' : 'text-text-secondary'}`}>
                    {filter.name}
                  </span>
                  <span className="text-[10px] text-text-muted leading-tight">{filter.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {renderError && (
            <div className="flex items-center gap-2 bg-red-500/10 text-red-400 rounded-xl p-4 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {renderError}
            </div>
          )}

          {/* Render button */}
          <button
            onClick={handleSubmitRender}
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-accent-primary text-white font-semibold text-base hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Create Video
              </>
            )}
          </button>
        </div>
      )}

      {/* -- Rendering View ---------------------------------------------- */}
      {view === 'rendering' && (
        <div className="flex flex-col items-center justify-center py-16">
          <LoadingCosmic label="Rendering your cosmic video..." />

          {currentJob && (
            <div className="mt-8 bg-bg-card border border-border-primary rounded-2xl p-5 w-full max-w-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-text-secondary">Status</span>
                <span className="text-sm font-medium text-accent-primary capitalize">
                  {currentJob.status}
                </span>
              </div>
              {currentJob.estimated_seconds && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Estimated time</span>
                  <span className="text-sm font-medium text-text-primary">
                    ~{currentJob.estimated_seconds}s
                  </span>
                </div>
              )}
              <div className="mt-4 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-primary rounded-full transition-all duration-1000 animate-pulse"
                  style={{
                    width: currentJob.status === 'rendering' ? '60%' : '20%',
                  }}
                />
              </div>
            </div>
          )}

          {renderError && (
            <div className="mt-6 flex items-center gap-2 bg-red-500/10 text-red-400 rounded-xl p-4 text-sm max-w-md w-full">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {renderError}
            </div>
          )}
        </div>
      )}

      {/* -- Ready View -------------------------------------------------- */}
      {view === 'ready' && currentJob && (
        <div className="flex flex-col items-center">
          {/* Video player */}
          {currentJob.video_url ? (
            <div className="w-full max-w-lg rounded-2xl overflow-hidden bg-black mb-6">
              <video
                src={currentJob.video_url}
                controls
                className="w-full aspect-[9/16] max-h-[60vh] object-contain"
                poster={currentJob.thumbnail_url || undefined}
              />
            </div>
          ) : (
            <div className="w-full max-w-lg aspect-[9/16] max-h-[60vh] rounded-2xl bg-bg-card border border-border-primary flex items-center justify-center mb-6">
              <Play className="w-12 h-12 text-text-muted" />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 w-full max-w-lg">
            {currentJob.video_url && (
              <a
                href={currentJob.video_url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-primary text-white font-medium text-sm hover:bg-accent-primary/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            )}
            <button
              onClick={() => {
                if (currentJob.video_url && navigator.share) {
                  navigator.share({ url: currentJob.video_url }).catch(() => {});
                } else if (currentJob.video_url) {
                  navigator.clipboard.writeText(currentJob.video_url);
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-bg-card border border-border-primary text-text-secondary font-medium text-sm hover:bg-bg-tertiary transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>

          {/* Create another */}
          <button
            onClick={handleBack}
            className="mt-6 text-sm text-accent-primary hover:underline"
          >
            Create another video
          </button>
        </div>
      )}

      {/* -- My Videos View ---------------------------------------------- */}
      {view === 'my-videos' && (
        <div>
          {videosLoading ? (
            <LoadingCosmic label="Loading your videos..." />
          ) : myVideos.length === 0 ? (
            <div className="text-center py-16">
              <Video className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <p className="text-text-tertiary text-sm">No videos yet. Create your first one!</p>
              <button
                onClick={() => setView('templates')}
                className="mt-4 px-6 py-2 rounded-xl bg-accent-primary text-white text-sm font-medium hover:bg-accent-primary/90 transition-colors"
              >
                Create Video
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {myVideos.map((vid) => {
                const tmpl = TEMPLATES.find((t) => t.id === vid.template_id);
                return (
                  <div
                    key={vid.id}
                    className="bg-bg-card border border-border-primary rounded-2xl p-4"
                  >
                    {/* Thumbnail / video */}
                    {vid.video_url ? (
                      <div className="rounded-xl overflow-hidden bg-black mb-3">
                        <video
                          src={vid.video_url}
                          poster={vid.thumbnail_url || undefined}
                          className="w-full aspect-video object-cover"
                          preload="metadata"
                        />
                      </div>
                    ) : (
                      <div className="rounded-xl bg-bg-tertiary aspect-video flex items-center justify-center mb-3">
                        {vid.status === 'queued' || vid.status === 'rendering' ? (
                          <Loader2 className="w-6 h-6 text-accent-primary animate-spin" />
                        ) : vid.status === 'failed' ? (
                          <AlertCircle className="w-6 h-6 text-red-400" />
                        ) : (
                          <Video className="w-6 h-6 text-text-muted" />
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {tmpl?.emoji} {tmpl?.name || vid.template_id}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {new Date(vid.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                          vid.status === 'ready'
                            ? 'bg-green-500/10 text-green-400'
                            : vid.status === 'failed'
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-accent-primary/10 text-accent-primary'
                        }`}
                      >
                        {vid.status}
                      </span>
                    </div>

                    {vid.video_url && (
                      <div className="flex gap-2 mt-3">
                        <a
                          href={vid.video_url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center py-2 rounded-lg bg-bg-tertiary text-text-secondary text-xs font-medium hover:bg-bg-tertiary/80 transition-colors"
                        >
                          Download
                        </a>
                        <button
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({ url: vid.video_url! }).catch(() => {});
                            } else {
                              navigator.clipboard.writeText(vid.video_url!);
                            }
                          }}
                          className="flex-1 text-center py-2 rounded-lg bg-bg-tertiary text-text-secondary text-xs font-medium hover:bg-bg-tertiary/80 transition-colors"
                        >
                          Share
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
