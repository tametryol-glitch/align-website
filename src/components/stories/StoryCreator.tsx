'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Image as ImageIcon, Type, Globe, Users, Loader2, AlertCircle, Music2, Wand2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  createStory, readVideoDuration,
  STORY_BACKGROUNDS, STORY_MAX_CHARS, STORY_MAX_VIDEO_SECONDS,
  type StoryVisibility,
} from '@/lib/storyService';
import { MusicPicker } from '@/components/music/MusicPicker';
import { ImageEditor } from '@/components/imageEditor/ImageEditor';
import type { AttachedMusic } from '@/lib/postMusic';

type Mode = 'media' | 'text';

export function StoryCreator({
  userId,
  onClose,
  onPosted,
}: {
  userId: string;
  onClose: () => void;
  onPosted: () => void;
}) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('media');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [videoSeconds, setVideoSeconds] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [caption, setCaption] = useState('');
  const [bg, setBg] = useState<string>(STORY_BACKGROUNDS[0]);
  const [visibility, setVisibility] = useState<StoryVisibility>('public');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Optional song (music library) and the photo editor.
  const [music, setMusic] = useState<AttachedMusic | null>(null);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [editing, setEditing] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement>(null);

  const isVideo = !!file && file.type.startsWith('video/');

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !posting && !editing && !showMusicPicker) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, posting, editing, showMusicPicker]);

  // Let the creator hear the song on the preview (quiet while a picker or
  // the editor is open — they play it themselves).
  useEffect(() => {
    const a = previewAudioRef.current;
    if (!a || !music) return;
    if (editing || showMusicPicker) { a.pause(); return; }
    a.currentTime = music.startSec;
    a.play().catch(() => {});
  }, [music, editing, showMusicPicker]);

  async function pickFile(f: File | undefined) {
    setError(null);
    if (!f) return;
    if (!f.type.startsWith('image/') && !f.type.startsWith('video/')) {
      setError(t('stories.errors.type', 'Choose a photo or a video'));
      return;
    }
    let seconds: number | null = null;
    if (f.type.startsWith('video/')) {
      try {
        seconds = await readVideoDuration(f);
      } catch (e: any) {
        console.warn('[Stories] video read failed:', e?.message);
        setError(t('stories.errors.readVideo', 'This video could not be read'));
        return;
      }
      if (seconds > STORY_MAX_VIDEO_SECONDS + 0.5) {
        setError(t('stories.errors.tooLong', 'Videos can be up to {{max}} seconds — this one is {{len}}s', {
          max: STORY_MAX_VIDEO_SECONDS, len: Math.round(seconds),
        }));
        return;
      }
    }
    setFile(f);
    setVideoSeconds(seconds);
    setPreviewUrl(URL.createObjectURL(f));
  }

  function clearFile() {
    setFile(null);
    setVideoSeconds(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  // createStory's own checks carry a code; upload-policy messages (shared
  // sanitize module, not translated) pass through; anything else gets the
  // generic message.
  function postErrorText(e: any): string {
    switch (e?.code) {
      case 'upload': return e.message;
      case 'textTooLong': return t('stories.errors.textTooLong', 'Keep it under {{max}} characters', { max: STORY_MAX_CHARS });
      case 'empty': return t('stories.errors.empty', 'Write something first');
      case 'noFile': return t('stories.errors.type', 'Choose a photo or a video');
      case 'imageType': return t('stories.errors.imageType', 'Use a JPG, PNG, GIF or WebP image');
      case 'videoLength': return t('stories.errors.readVideo', 'This video could not be read');
      case 'videoTooLong': return t('stories.errors.videoMax', 'Videos can be up to {{max}} seconds', { max: STORY_MAX_VIDEO_SECONDS });
    }
    console.warn('[Stories] post failed:', e?.message);
    return t('stories.errors.post', 'Could not post your story. Try again.');
  }

  const canPost = !posting && (mode === 'text' ? text.trim().length > 0 : !!file);

  async function post() {
    if (!canPost) return;
    setPosting(true);
    setError(null);
    try {
      await createStory({
        userId,
        type: mode === 'text' ? 'text' : isVideo ? 'video' : 'image',
        content: mode === 'text' ? text : caption,
        file: mode === 'media' ? file : null,
        backgroundColor: mode === 'text' ? bg : null,
        durationSeconds: isVideo ? videoSeconds : null,
        visibility,
        music,
      });
      onPosted();
    } catch (e: any) {
      setError(postErrorText(e));
      setPosting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4" onClick={() => !posting && onClose()}>
      <div
        className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl border border-border-primary bg-bg-secondary p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">{t('stories.create.title', 'New story')}</h2>
          <button onClick={onClose} disabled={posting} className="p-1.5 rounded-full hover:bg-bg-tertiary text-text-muted" aria-label={t('common.close', 'Close')}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {([
            { id: 'media', icon: ImageIcon, label: t('stories.create.media', 'Photo / Video') },
            { id: 'text', icon: Type, label: t('stories.create.text', 'Text') },
          ] as const).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => { setMode(id); setError(null); }}
              disabled={posting}
              className={cn(
                'flex items-center justify-center gap-2 py-2 rounded-xl text-sm border transition-colors',
                mode === id
                  ? 'border-accent-primary bg-accent-primary/15 text-text-primary'
                  : 'border-border-primary bg-bg-tertiary text-text-secondary hover:text-text-primary',
              )}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="mx-auto mb-4 w-full max-w-[240px] aspect-[9/16] rounded-xl overflow-hidden bg-black relative">
          {mode === 'text' ? (
            <div className="w-full h-full flex items-center justify-center p-4" style={{ backgroundColor: bg }}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, STORY_MAX_CHARS))}
                placeholder={t('stories.create.textPlaceholder', 'Type something…')}
                disabled={posting}
                className="w-full h-full bg-transparent resize-none text-center text-white text-lg font-semibold placeholder-white/60 focus:outline-none flex items-center"
                style={{ paddingTop: '40%' }}
              />
            </div>
          ) : previewUrl ? (
            <>
              {isVideo ? (
                <video src={previewUrl} className="w-full h-full object-contain" autoPlay muted loop playsInline />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="" className="w-full h-full object-contain" />
              )}
              {!posting && (
                <button onClick={clearFile} className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white" aria-label={t('stories.create.remove', 'Remove')}>
                  <X className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => inputRef.current?.click()}
              className="w-full h-full flex flex-col items-center justify-center gap-2 text-text-muted hover:text-text-primary bg-bg-tertiary"
            >
              <ImageIcon className="w-8 h-8" />
              <span className="text-sm">{t('stories.create.choose', 'Choose a photo or video')}</span>
              <span className="text-[11px] text-text-tertiary">{t('stories.create.videoLimit', 'Videos up to {{max}}s', { max: STORY_MAX_VIDEO_SECONDS })}</span>
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
        </div>

        {/* Edit photo + music */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {mode === 'media' && file && !isVideo && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              disabled={posting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border-primary bg-bg-tertiary text-xs text-text-secondary hover:text-text-primary"
            >
              <Wand2 className="w-3.5 h-3.5" /> {t('stories.create.edit', 'Edit photo')}
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowMusicPicker(true)}
            disabled={posting}
            className={cn(
              'flex items-center gap-1.5 max-w-[60%] px-3 py-1.5 rounded-full border text-xs',
              music ? 'border-accent-primary bg-accent-primary/15 text-text-primary' : 'border-border-primary bg-bg-tertiary text-text-secondary hover:text-text-primary',
            )}
          >
            <Music2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{music ? music.title : t('stories.create.addMusic', 'Add music')}</span>
          </button>
          {music && !posting && (
            <button type="button" onClick={() => setMusic(null)} className="p-1 text-text-muted hover:text-text-primary" aria-label={t('music.picker.remove', 'No music')}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {music && isVideo && (
          <p className="-mt-2 mb-3 text-center text-[11px] text-text-tertiary">
            {t('stories.create.musicMutesVideo', "The video's own sound is muted while your song plays")}
          </p>
        )}

        {mode === 'text' ? (
          <div className="flex items-center justify-center gap-2 mb-4">
            {STORY_BACKGROUNDS.map((c) => (
              <button
                key={c}
                onClick={() => setBg(c)}
                disabled={posting}
                aria-label={c}
                className={cn('w-7 h-7 rounded-full border-2 transition-transform', bg === c ? 'border-white scale-110' : 'border-transparent')}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        ) : (
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, STORY_MAX_CHARS))}
            placeholder={t('stories.create.caption', 'Add a caption (optional)')}
            disabled={posting}
            className="w-full mb-4 px-3 py-2 rounded-xl bg-bg-tertiary border border-border-primary text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary"
          />
        )}

        {/* Visibility */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {([
            { id: 'public', icon: Globe, label: t('stories.create.public', 'Public') },
            { id: 'friends', icon: Users, label: t('stories.create.friends', 'Friends only') },
          ] as const).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setVisibility(id)}
              disabled={posting}
              className={cn(
                'flex items-center justify-center gap-2 py-2 rounded-xl text-xs border transition-colors',
                visibility === id
                  ? 'border-accent-primary bg-accent-primary/15 text-text-primary'
                  : 'border-border-primary bg-bg-tertiary text-text-secondary hover:text-text-primary',
              )}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-start gap-2 mb-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-px" /> <span>{error}</span>
          </div>
        )}

        <button
          onClick={post}
          disabled={!canPost}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-accent text-white text-sm font-semibold disabled:opacity-50"
        >
          {posting && <Loader2 className="w-4 h-4 animate-spin" />}
          {posting
            ? (mode === 'media' ? t('stories.create.uploading', 'Uploading…') : t('stories.create.posting', 'Posting…'))
            : t('stories.create.post', 'Share to story')}
        </button>
        <p className="mt-2 text-center text-[11px] text-text-tertiary">{t('stories.create.expires', 'Disappears after 24 hours')}</p>
      </div>
      {music && <audio ref={previewAudioRef} src={music.url} loop />}
      {showMusicPicker && (
        <div onClick={(e) => e.stopPropagation()}>
          <MusicPicker value={music} onChange={setMusic} onClose={() => setShowMusicPicker(false)} />
        </div>
      )}
      {editing && file && (
        <div onClick={(e) => e.stopPropagation()}>
          <ImageEditor
            file={file}
            music={music}
            onMusicChange={setMusic}
            onCancel={() => setEditing(false)}
            onDone={(edited) => {
              if (edited !== file) {
                setFile(edited);
                setPreviewUrl(URL.createObjectURL(edited));
              }
              setEditing(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
