'use client';

/**
 * Create Reel (Web) — record in the browser or upload a file, then publish.
 *
 * Mirrors the mobile create-reel screen: caption, category, tags, visibility
 * and optional astrology metadata, with the same free-tier monthly cap.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import {
  REEL_CATEGORIES,
  createReel,
  uploadReelVideo,
  getMonthlyReelCount,
  isPaidSubscriber,
  MAX_VIDEO_SIZE,
  type ReelCategory,
  type ReelVisibility,
  type AstrologyMetadata,
} from '@/lib/reelsService';
import { useVideoRecorder } from '@/hooks/useVideoRecorder';
import {
  Upload, Video as VideoIcon, X, Loader2, ArrowLeft, Circle, Square, Globe, Users, Lock, Scissors,
} from 'lucide-react';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const FREE_MONTHLY_REEL_LIMIT = 10;
const MAX_RECORD_SECONDS = 60;

export default function CreateReelPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(0);
  // Set when a clip is already hosted (the raw upload before editing, or the
  // finished render coming back). Publish then skips re-uploading it.
  const [hostedUrl, setHostedUrl] = useState<string | null>(null);
  const [openingEditor, setOpeningEditor] = useState(false);
  const editedHandledRef = useRef(false);

  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<ReelCategory>('personal');
  const [tagsText, setTagsText] = useState('');
  const [visibility, setVisibility] = useState<ReelVisibility>('public');
  const [allowDownload, setAllowDownload] = useState(true);

  const [showAstroTags, setShowAstroTags] = useState(false);
  const [astroSign, setAstroSign] = useState<string | null>(null);
  const [astroTopic, setAstroTopic] = useState('');

  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [atFreeLimit, setAtFreeLimit] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Revoke the object URL when the clip changes or the page unmounts.
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const acceptClip = useCallback((f: File) => {
    setPreviewUrl((old) => { if (old?.startsWith('blob:')) URL.revokeObjectURL(old); return URL.createObjectURL(f); });
    setFile(f);
    setHostedUrl(null);
    setDurationSeconds(0);
    setError(null);
  }, []);

  const {
    canRecord, recording, elapsed, error: recorderError,
    liveVideoRef, start: startRecording, stop: stopRecording,
  } = useVideoRecorder({ maxSeconds: MAX_RECORD_SECONDS, onClip: acceptClip });

  // Returning from the editor: /reels/create?editedVideoUrl=<url> adopts the
  // finished render as the reel's video. window.location (not useSearchParams)
  // keeps this page statically buildable — matching the feed page.
  useEffect(() => {
    if (editedHandledRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const url = params.get('editedVideoUrl');
    if (!url) return;
    editedHandledRef.current = true;
    setHostedUrl(url);
    setPreviewUrl(url);
    setFile(null);
    const d = Number(params.get('durationSeconds'));
    if (Number.isFinite(d) && d > 0) setDurationSeconds(d);
    window.history.replaceState({}, '', '/reels/create');
  }, []);

  /**
   * Hand the clip to the browser editor. It reads ?url=, so the file has to be
   * hosted first; the editor posts the finished render back here.
   */
  const handleEdit = useCallback(async () => {
    if (openingEditor) return;
    setOpeningEditor(true);
    setError(null);
    try {
      // A hosted clip (e.g. re-editing a render) needs no re-upload.
      let url = hostedUrl;
      if (!url) {
        if (!file) { setOpeningEditor(false); return; }
        const res = await uploadReelVideo(file);
        if (!res.url) {
          setError(res.error || t('reels.create.errorOpenEditor'));
          setOpeningEditor(false);
          return;
        }
        url = res.url;
      }
      router.push(`/cosmic-video/edit?url=${encodeURIComponent(url)}&returnTo=reel`);
    } catch (err: any) {
      setError(err?.message || t('reels.create.errorOpenEditor'));
      setOpeningEditor(false);
    }
  }, [openingEditor, hostedUrl, file, router, t]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('video/')) { setError(t('reels.create.errorNotVideo')); return; }
    if (f.size > MAX_VIDEO_SIZE) { setError(t('reels.create.errorTooLarge')); return; }
    acceptClip(f);
  };

  const clearClip = () => {
    setPreviewUrl((old) => { if (old?.startsWith('blob:')) URL.revokeObjectURL(old); return null; });
    setFile(null);
    setHostedUrl(null);
    setDurationSeconds(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── Publish ───
  const handlePublish = async () => {
    if (publishing || (!file && !hostedUrl)) return;
    setError(null);
    setPublishing(true);

    try {
      // Same free-tier cap the mobile app applies.
      const paid = await isPaidSubscriber();
      if (!paid) {
        const count = await getMonthlyReelCount();
        if (count >= FREE_MONTHLY_REEL_LIMIT) {
          setAtFreeLimit(true);
          setPublishing(false);
          return;
        }
      }

      // An editor render (or an already-hosted clip) is reused as-is.
      let url = hostedUrl;
      if (!url && file) {
        const res = await uploadReelVideo(file);
        url = res.url ?? null;
        if (!url) {
          setError(res.error || t('reels.create.errorUploadFailed'));
          setPublishing(false);
          return;
        }
      }
      if (!url) {
        setError(t('reels.create.errorNoVideo'));
        setPublishing(false);
        return;
      }

      const tags = tagsText
        .split(/[,#\s]+/)
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0 && t.length < 30)
        .slice(0, 10);

      let astrology_metadata: AstrologyMetadata | null = null;
      if (showAstroTags && (astroSign || astroTopic)) {
        astrology_metadata = {};
        if (astroSign) astrology_metadata.zodiac_sign = astroSign;
        if (astroTopic) astrology_metadata.topic = astroTopic;
      }

      const result = await createReel({
        video_url: url,
        caption: caption.trim(),
        duration_seconds: Math.round(durationSeconds),
        category: showAstroTags && astrology_metadata ? 'astrology' : category,
        tags,
        visibility,
        astrology_metadata,
        allow_download: allowDownload,
      });

      if (result.success) {
        router.push('/reels');
      } else {
        setError(result.error || t('reels.create.errorPublishFailed'));
        setPublishing(false);
      }
    } catch (err: any) {
      setError(err?.message || t('reels.create.errorGeneric'));
      setPublishing(false);
    }
  };

  // ─── Render ───

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex flex-col items-center justify-center gap-4 px-6">
        <h1 className="text-white text-xl font-bold">{t('reels.create.signInTitle')}</h1>
        <Link href="/login" className="px-6 py-2.5 bg-[#9B6FF6] text-white text-sm font-semibold rounded-full">
          {t('reels.create.signIn')}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a14] pb-24">
      <div className="max-w-[560px] mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <Link href="/reels" className="flex items-center gap-1.5 text-[#9B6FF6] text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> {t('reels.create.cancel')}
          </Link>
          <h1 className="text-white text-lg font-bold">{t('reels.create.title')}</h1>
          <span className="w-14" />
        </div>

        {(error || recorderError) && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            {error || recorderError}
          </div>
        )}

        {atFreeLimit && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-[#9B6FF6]/10 border border-[#9B6FF6]/30 text-white/80 text-sm">
            {t('reels.create.freeLimitReached', { count: FREE_MONTHLY_REEL_LIMIT })}{' '}
            <Link href="/pricing" className="text-[#9B6FF6] font-semibold underline">{t('reels.create.upgrade')}</Link>{' '}
            {t('reels.create.toPostUnlimited')}
          </div>
        )}

        {/* ─── Video ─── */}
        <h2 className="text-white text-sm font-bold mb-2">{t('reels.create.videoHeading')}</h2>

        {previewUrl ? (
          <div className="relative rounded-xl overflow-hidden bg-black border border-white/10">
            <video
              src={previewUrl}
              className="w-full max-h-[420px] object-contain bg-black"
              controls
              playsInline
              onLoadedMetadata={(e) => {
                const d = e.currentTarget.duration;
                if (Number.isFinite(d) && d > 0) setDurationSeconds(d);
              }}
            />
            <button
              onClick={clearClip}
              aria-label={t('reels.create.removeVideo')}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
            {durationSeconds > 0 && (
              <span className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 text-white text-[11px]">
                {durationSeconds.toFixed(1)}s
              </span>
            )}
            {hostedUrl && !file ? (
              <span className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-[11px] font-semibold">
                ✨ {t('reels.create.edited')}
              </span>
            ) : (
              /* Trim, filter, caption and text before posting. */
              <button
                onClick={handleEdit}
                disabled={openingEditor}
                className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#9B6FF6] text-white text-[11px] font-semibold disabled:opacity-60"
              >
                {openingEditor
                  ? (<><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t('reels.create.opening')}</>)
                  : (<><Scissors className="w-3.5 h-3.5" /> {t('reels.create.edit')}</>)}
              </button>
            )}
          </div>
        ) : recording ? (
          <div className="relative rounded-xl overflow-hidden bg-black border border-red-500/50">
            <video ref={liveVideoRef} className="w-full max-h-[420px] object-contain bg-black" muted playsInline />
            <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded bg-black/70">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white text-[11px] font-semibold">
                {elapsed}s / {MAX_RECORD_SECONDS}s
              </span>
            </div>
            <button
              onClick={stopRecording}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500 text-white text-sm font-bold"
            >
              <Square className="w-4 h-4" /> {t('reels.create.stop')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {canRecord && (
              <button
                onClick={startRecording}
                className="flex flex-col items-center justify-center gap-2 py-7 rounded-xl bg-white/5 border border-white/10 hover:border-[#9B6FF6]/50 transition"
              >
                <Circle className="w-7 h-7 text-[#9B6FF6]" />
                <span className="text-white/80 text-sm font-semibold">{t('reels.create.record')}</span>
              </button>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-2 py-7 rounded-xl bg-white/5 border border-white/10 hover:border-[#9B6FF6]/50 transition ${canRecord ? '' : 'col-span-2'}`}
            >
              <Upload className="w-7 h-7 text-[#9B6FF6]" />
              <span className="text-white/80 text-sm font-semibold">{t('reels.create.uploadVideo')}</span>
            </button>
          </div>
        )}

        {/* On phones this opens the camera or library; on desktop, the file browser. */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {!previewUrl && !recording && (
          <p className="text-white/40 text-xs mt-2">
            {t('reels.create.videoHint')}{!canRecord && ` ${t('reels.create.recordingUnsupported')}`}
          </p>
        )}

        {/* ─── Caption ─── */}
        <h2 className="text-white text-sm font-bold mt-6 mb-2">{t('reels.create.caption')}</h2>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder={t('reels.create.captionPlaceholder')}
          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white text-sm placeholder-white/30 outline-none focus:border-[#9B6FF6]/60 resize-none"
        />
        <p className="text-white/40 text-[11px] text-right mt-1">{caption.length}/500</p>

        {/* ─── Category ─── */}
        <h2 className="text-white text-sm font-bold mt-4 mb-2">{t('reels.create.category')}</h2>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {REEL_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition ${
                category === cat.value
                  ? 'bg-[#9B6FF6]/20 border-[#9B6FF6] text-[#9B6FF6] font-bold'
                  : 'bg-white/5 border-white/10 text-white/60'
              }`}
            >
              <span>{cat.emoji}</span>{cat.label}
            </button>
          ))}
        </div>

        {/* ─── Tags ─── */}
        <h2 className="text-white text-sm font-bold mt-4 mb-2">{t('reels.create.tags')}</h2>
        <input
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          maxLength={200}
          placeholder={t('reels.create.tagsPlaceholder')}
          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white text-sm placeholder-white/30 outline-none focus:border-[#9B6FF6]/60"
        />
        <p className="text-white/40 text-[11px] mt-1">{t('reels.create.tagsHint')}</p>

        {/* ─── Visibility ─── */}
        <h2 className="text-white text-sm font-bold mt-4 mb-2">{t('reels.create.visibility')}</h2>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'public', label: t('reels.create.visibilityPublic'), Icon: Globe },
            { value: 'friends', label: t('reels.create.visibilityFriends'), Icon: Users },
            { value: 'private', label: t('reels.create.visibilityPrivate'), Icon: Lock },
          ] as const).map((v) => (
            <button
              key={v.value}
              onClick={() => setVisibility(v.value)}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm transition ${
                visibility === v.value
                  ? 'bg-[#9B6FF6]/20 border-[#9B6FF6] text-[#9B6FF6] font-bold'
                  : 'bg-white/5 border-white/10 text-white/60'
              }`}
            >
              <v.Icon className="w-4 h-4" />{v.label}
            </button>
          ))}
        </div>

        {/* ─── Downloads ─── */}
        <h2 className="text-white text-sm font-bold mt-4 mb-2">{t('reels.create.downloads')}</h2>
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={allowDownload}
            onChange={(e) => setAllowDownload(e.target.checked)}
            className="w-4 h-4 mt-0.5 accent-[#9B6FF6]"
          />
          <span>
            <span className="block text-white text-sm">{t('reels.create.allowDownload')}</span>
            <span className="block text-white/40 text-[11px] mt-0.5">
              {t('reels.create.allowDownloadHint')}
            </span>
          </span>
        </label>

        {/* ─── Optional astrology tags ─── */}
        <button
          onClick={() => setShowAstroTags(!showAstroTags)}
          className="mt-5 pt-4 border-t border-white/10 w-full text-left text-[#C4A5FF] text-[13px] font-semibold"
        >
          {showAstroTags ? t('reels.create.hideAstroTags') : t('reels.create.addAstroTags')}
        </button>

        {showAstroTags && (
          <div className="mt-3 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-white/40 text-[11px] mb-3">
              {t('reels.create.astroHint')}
            </p>
            <p className="text-white/60 text-xs font-semibold mb-2">{t('reels.create.zodiacSign')}</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {ZODIAC_SIGNS.map((sign) => (
                <button
                  key={sign}
                  onClick={() => setAstroSign(astroSign === sign ? null : sign)}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-full border text-[11px] transition ${
                    astroSign === sign
                      ? 'bg-[#9B6FF6]/25 border-[#9B6FF6] text-[#9B6FF6] font-bold'
                      : 'bg-white/5 border-white/10 text-white/50'
                  }`}
                >
                  {sign}
                </button>
              ))}
            </div>
            <p className="text-white/60 text-xs font-semibold mt-3 mb-2">{t('reels.create.topic')}</p>
            <input
              value={astroTopic}
              onChange={(e) => setAstroTopic(e.target.value)}
              maxLength={100}
              placeholder={t('reels.create.topicPlaceholder')}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:border-[#9B6FF6]/60"
            />
          </div>
        )}

        {/* ─── Publish ─── */}
        <button
          onClick={handlePublish}
          disabled={(!file && !hostedUrl) || publishing}
          className="w-full mt-7 py-3.5 rounded-xl bg-[#9B6FF6] text-white text-base font-bold disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {publishing ? (<><Loader2 className="w-5 h-5 animate-spin" /> {t('reels.create.publishing')}</>) : (<><VideoIcon className="w-5 h-5" /> {t('reels.create.publishReel')}</>)}
        </button>
      </div>
    </div>
  );
}
