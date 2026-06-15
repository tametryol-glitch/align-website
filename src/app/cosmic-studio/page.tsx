'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Copy, Check, Wand2, Upload } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { STYLE_LIST, type StyleId } from '@/lib/cosmicStyles';
import { buildCaption, buildHashtags, ALIGN_HANDLE } from '@/lib/cosmicShare';
import { requestRender, getRenderStatus } from '@/lib/cosmicVideoService';

// @remotion/player is client-only — never SSR it.
const CosmicPlayer = dynamic(() => import('@/remotion/studio/CosmicPlayer'), {
  ssr: false,
  loading: () => (
    <div style={{ aspectRatio: '9 / 16', borderRadius: 18 }} className="w-full bg-bg-tertiary animate-pulse" />
  ),
});

// Founder-only soak of the new Cosmic Studio. The existing /cosmic-video stays
// live for everyone; drop this allowlist once Studio is proven.
const STUDIO_ALLOWLIST = new Set<string>(['tametryol@gmail.com']);

export default function CosmicStudioPage() {
  const profile = useAuthStore((s) => s.profile);
  const userEmail = (useAuthStore.getState().user?.email || '').toLowerCase();
  const allowed = STUDIO_ALLOWLIST.has(userEmail);

  const [mode, setMode] = useState<'generate' | 'upload'>('generate');
  const [styleId, setStyleId] = useState<StyleId>('ethereal');
  const [copied, setCopied] = useState(false);
  const [renderState, setRenderState] = useState<'idle' | 'rendering' | 'ready' | 'failed'>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const risingSign = profile?.rising_sign || profile?.sun_sign || 'Sagittarius';
  // Single source of truth for the copy — drives BOTH the preview and the
  // render request, so the final file matches what's previewed.
  const headline = 'The sky is moving in your favour';
  const forecastTitle = 'Moon trine Jupiter';
  const forecastSub = 'a rare window for bold asks';

  async function handleRender() {
    setRenderState('rendering');
    setVideoUrl(null);
    try {
      const job = await requestRender({
        template_id: 'daily_forecast_studio',
        astro_data: {
          sunSign: profile?.sun_sign ?? undefined,
          moonSign: profile?.moon_sign ?? undefined,
          risingSign: profile?.rising_sign ?? undefined,
          displayName: profile?.display_name ?? undefined,
        },
        audio_option: { type: 'none' },
        customizations: {
          duration_seconds: 12,
          style_id: styleId,
          watermark_handle: ALIGN_HANDLE,
          studio_headline: headline,
          studio_forecast_title: forecastTitle,
          studio_forecast_sub: forecastSub,
        },
      });
      // Poll until ready (cap ~2 min)
      for (let i = 0; i < 40; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const s = await getRenderStatus(job.id);
        if (s.status === 'ready' && s.video_url) {
          setVideoUrl(s.video_url);
          setRenderState('ready');
          return;
        }
        if (s.status === 'failed') {
          setRenderState('failed');
          return;
        }
      }
      setRenderState('failed');
    } catch {
      setRenderState('failed');
    }
  }

  const caption = useMemo(
    () =>
      buildCaption({
        content: 'daily_forecast',
        sunSign: profile?.sun_sign ?? undefined,
        moonSign: profile?.moon_sign ?? undefined,
        risingSign: profile?.rising_sign ?? undefined,
      }),
    [profile],
  );
  const hashtags = useMemo(
    () => buildHashtags({ content: 'daily_forecast', sunSign: profile?.sun_sign ?? undefined }),
    [profile],
  );

  const shareBlock = `${caption}\n\n${hashtags.join(' ')}\n\nMade with Align · ${ALIGN_HANDLE}`;

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(shareBlock);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  if (!allowed) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/cosmic-video" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to video creator
        </Link>
        <div className="card text-center py-12">
          <Sparkles className="w-8 h-8 text-accent-primary mx-auto mb-3" />
          <p className="text-text-primary font-medium mb-1">Cosmic Studio is in closed testing</p>
          <p className="text-text-tertiary text-sm">A redesigned video creator with live preview is on the way.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/cosmic-video" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to video creator
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-8 h-8 text-accent-primary" />
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Cosmic Studio</h1>
          <p className="text-text-tertiary text-sm">Live preview · pick a style · post in one tap</p>
        </div>
      </div>

      {/* Mode: generate from your chart, or upload your own video + edit */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('generate')}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium border transition-colors ${mode === 'generate' ? 'border-2 border-accent-primary text-text-primary' : 'border-border-tertiary text-text-muted hover:text-text-secondary'}`}
        >
          Make from your chart
        </button>
        <button
          onClick={() => setMode('upload')}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium border transition-colors ${mode === 'upload' ? 'border-2 border-accent-primary text-text-primary' : 'border-border-tertiary text-text-muted hover:text-text-secondary'}`}
        >
          Upload your own video
        </button>
      </div>

      {mode === 'upload' ? (
        <div className="card text-center py-12">
          <Upload className="w-8 h-8 text-accent-primary mx-auto mb-3" />
          <p className="text-text-primary font-medium mb-1">Upload &amp; edit your own video</p>
          <p className="text-text-tertiary text-sm mb-5 max-w-md mx-auto">
            Import a clip from your device — trim it, add captions, stickers, filters, music, and transitions, then export.
          </p>
          <Link href="/cosmic-video/edit" className="btn-primary inline-flex items-center gap-2">
            <Upload className="w-4 h-4" /> Open the editor
          </Link>
        </div>
      ) : (
      <div className="grid md:grid-cols-[300px_1fr] gap-6 items-start">
        {/* Live preview */}
        <div>
          <CosmicPlayer inputProps={{ styleId, risingSign, headline, forecastTitle, forecastSub }} />
          <p className="text-xs text-text-muted mt-2 text-center">
            Live preview — what you see is what you post
          </p>
        </div>

        {/* Controls */}
        <div className="space-y-5">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-2">What to share</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-3 py-1.5 rounded-full bg-accent-muted text-accent-secondary">Today's forecast</span>
              <span className="text-xs px-3 py-1.5 rounded-full border border-border-secondary text-text-muted">Your chart · soon</span>
              <span className="text-xs px-3 py-1.5 rounded-full border border-border-secondary text-text-muted">A transit · soon</span>
              <span className="text-xs px-3 py-1.5 rounded-full border border-border-secondary text-text-muted">Your sign · soon</span>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-2">Style — a full look, not just a colour</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STYLE_LIST.map((st) => {
                const active = st.id === styleId;
                return (
                  <button
                    key={st.id}
                    onClick={() => setStyleId(st.id)}
                    className={`text-left rounded-lg p-2.5 transition-all ${active ? 'border-2 border-accent-primary' : 'border border-border-tertiary hover:border-border-secondary'}`}
                  >
                    <div className="h-7 rounded mb-2" style={{ background: `linear-gradient(135deg, ${st.bg[0]}, ${st.accent})` }} />
                    <div className="text-sm font-medium text-text-primary">{st.name}</div>
                    <div className="text-[11px] text-text-muted leading-tight mt-0.5">{st.vibe}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-2">Ready-to-post caption</p>
            <div className="card">
              <p className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">{caption}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {hashtags.map((h) => (
                  <span key={h} className="text-xs px-2 py-0.5 rounded-full bg-bg-tertiary text-text-tertiary">{h}</span>
                ))}
              </div>
              <button onClick={copyShare} className="btn-secondary mt-3 inline-flex items-center gap-1.5 text-sm">
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy caption + hashtags'}
              </button>
            </div>
          </div>

          <button
            onClick={handleRender}
            disabled={renderState === 'rendering'}
            className="btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Wand2 className="w-4 h-4" />
            {renderState === 'rendering' ? 'Rendering…' : 'Render & share'}
          </button>
          <p className="text-xs text-text-muted text-center -mt-2">
            Renders in your chosen style with the {ALIGN_HANDLE} watermark.
          </p>

          {renderState === 'rendering' && (
            <p className="text-sm text-text-tertiary text-center">Rendering your video on our servers — this takes ~20–30s.</p>
          )}
          {renderState === 'failed' && (
            <p className="text-sm text-red-400 text-center">Render didn't complete. Please try again.</p>
          )}
          {renderState === 'ready' && videoUrl && (
            <div className="card">
              <video src={videoUrl} controls playsInline className="w-full rounded-lg" style={{ aspectRatio: '9 / 16' }} />
              <a href={videoUrl} download className="btn-secondary mt-3 inline-flex items-center gap-1.5 text-sm">
                <Wand2 className="w-4 h-4" /> Download video
              </a>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
