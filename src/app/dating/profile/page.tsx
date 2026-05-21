'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import {
  getDatingProfile,
  saveDatingProfile,
  uploadDatingPhoto,
  removeDatingPhoto,
  uploadVoicePrompt,
  uploadVideoIntro,
  toggleDatingEnabled,
} from '@/lib/datingProfileService';
import type { DatingProfile, DatingPromptAnswer } from '@/lib/datingProfileService';
import { DATING_PROMPTS, MAX_DATING_PROMPTS, MAX_PROMPT_ANSWER_LENGTH } from '@/data/datingPrompts';
import Link from 'next/link';
import {
  ArrowLeft, Camera, Plus, X, Mic, MicOff, Video,
  Check, Sparkles, Shield, ChevronDown, GripVertical,
  Heart, Eye, EyeOff,
} from 'lucide-react';

const SIGN_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

export default function DatingProfilePage() {
  const { user, profile: authProfile } = useAuthStore();
  const [datingProfile, setDatingProfile] = useState<DatingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [bio, setBio] = useState('');
  const [prompts, setPrompts] = useState<DatingPromptAnswer[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [ageVisible, setAgeVisible] = useState(true);
  const [showPromptPicker, setShowPromptPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    loadProfile();
  }, [user?.id]);

  async function loadProfile() {
    if (!user?.id) return;
    setLoading(true);
    const data = await getDatingProfile(user.id);
    if (data) {
      setDatingProfile(data);
      setEnabled(data.dating_enabled);
      setBio(data.dating_bio || '');
      setPrompts(data.dating_prompts || []);
      setPhotos(data.photo_urls || []);
      setAgeVisible(data.age_visible);
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!user?.id) return;
    setSaving(true);
    await saveDatingProfile(user.id, {
      dating_bio: bio || undefined,
      dating_prompts: prompts,
      age_visible: ageVisible,
      photo_urls: photos,
    } as any);
    setSaving(false);
  }

  async function handleToggleEnabled() {
    if (!user?.id) return;
    const next = !enabled;
    setEnabled(next);
    await toggleDatingEnabled(user.id, next);
  }

  async function handlePhotoUpload(position: number) {
    if (!user?.id) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploadingPhoto(position);
      const result = await uploadDatingPhoto(user.id, file, position);
      if (result.url) {
        const newPhotos = [...photos];
        if (position < newPhotos.length) {
          newPhotos[position] = result.url;
        } else {
          newPhotos.push(result.url);
        }
        setPhotos(newPhotos);
        await saveDatingProfile(user.id, { photo_urls: newPhotos });
      }
      setUploadingPhoto(null);
    };
    input.click();
  }

  async function handleRemovePhoto(index: number) {
    if (!user?.id) return;
    const url = photos[index];
    const result = await removeDatingPhoto(user.id, url, photos);
    if (result.success) {
      setPhotos((prev) => prev.filter((_, i) => i !== index));
    }
  }

  function addPrompt(promptId: string) {
    const prompt = DATING_PROMPTS.find((p) => p.id === promptId);
    if (!prompt || prompts.length >= MAX_DATING_PROMPTS) return;
    if (prompts.some((p) => p.prompt_id === promptId)) return;
    setPrompts([...prompts, { prompt_id: promptId, question: prompt.question, answer: '' }]);
    setShowPromptPicker(false);
  }

  function updatePromptAnswer(index: number, answer: string) {
    if (answer.length > MAX_PROMPT_ANSWER_LENGTH) return;
    const updated = [...prompts];
    updated[index] = { ...updated[index], answer };
    setPrompts(updated);
  }

  function removePrompt(index: number) {
    setPrompts(prompts.filter((_, i) => i !== index));
  }

  async function startVoiceRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (user?.id) {
          await uploadVoicePrompt(user.id, blob);
          await loadProfile();
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }, 30000);
    } catch {
      // microphone permission denied
    }
  }

  function stopVoiceRecording() {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  async function handleVideoUpload() {
    if (!user?.id) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      await uploadVideoIntro(user.id, file);
      await loadProfile();
    };
    input.click();
  }

  function getAge(): number | null {
    if (!datingProfile?.birth_date) return null;
    const birth = new Date(datingProfile.birth_date);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const age = getAge();
  const availablePrompts = DATING_PROMPTS.filter(
    (p) => !prompts.some((existing) => existing.prompt_id === p.id)
  );

  return (
    <div className="max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dating" className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors">
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </Link>
        <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-2">
          <Heart className="w-6 h-6 text-pink-400" />
          Dating Profile
        </h1>
      </div>

      {/* Enable Dating Toggle */}
      <div className="card p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-text-primary font-medium">Dating Mode</p>
          <p className="text-text-muted text-sm">Make your profile visible in cosmic discovery</p>
        </div>
        <button
          onClick={handleToggleEnabled}
          className={`w-12 h-6 rounded-full transition-colors relative ${
            enabled ? 'bg-accent-primary' : 'bg-bg-tertiary'
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Chart Badge */}
      <div className="card p-4 mb-6">
        <p className="text-text-secondary text-sm mb-2">Your Cosmic Signature</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{SIGN_GLYPHS[datingProfile?.sun_sign || ''] || ''}</span>
            <div>
              <p className="text-text-muted text-xs">Sun</p>
              <p className="text-text-primary text-sm font-medium">{datingProfile?.sun_sign || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{SIGN_GLYPHS[datingProfile?.moon_sign || ''] || ''}</span>
            <div>
              <p className="text-text-muted text-xs">Moon</p>
              <p className="text-text-primary text-sm font-medium">{datingProfile?.moon_sign || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{SIGN_GLYPHS[datingProfile?.rising_sign || ''] || ''}</span>
            <div>
              <p className="text-text-muted text-xs">Rising</p>
              <p className="text-text-primary text-sm font-medium">{datingProfile?.rising_sign || '—'}</p>
            </div>
          </div>
          {age && ageVisible && (
            <div className="ml-auto text-text-secondary text-sm">
              Age {age}
            </div>
          )}
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-text-primary font-medium flex items-center gap-2">
            <Camera className="w-4 h-4 text-accent-primary" />
            Photos
          </p>
          <p className="text-text-muted text-xs">{photos.length}/6</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden relative bg-bg-tertiary border border-border-primary">
              {photos[i] ? (
                <>
                  <img src={photos[i]} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemovePhoto(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-red-500/80 transition-colors"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 text-[10px] bg-accent-primary/80 text-white px-1.5 py-0.5 rounded">
                      Main
                    </span>
                  )}
                </>
              ) : (
                <button
                  onClick={() => handlePhotoUpload(i)}
                  disabled={uploadingPhoto === i}
                  className="w-full h-full flex flex-col items-center justify-center text-text-muted hover:text-accent-primary transition-colors"
                >
                  {uploadingPhoto === i ? (
                    <div className="w-5 h-5 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-6 h-6 mb-1" />
                      <span className="text-xs">Add</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div className="card p-4 mb-6">
        <p className="text-text-primary font-medium mb-2">About Me</p>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 500))}
          placeholder="Tell potential matches about yourself..."
          className="input w-full h-24 resize-none"
          maxLength={500}
        />
        <p className="text-text-muted text-xs text-right mt-1">{bio.length}/500</p>
      </div>

      {/* Prompts */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-text-primary font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-primary" />
            Cosmic Prompts
          </p>
          <p className="text-text-muted text-xs">{prompts.length}/{MAX_DATING_PROMPTS}</p>
        </div>

        <div className="space-y-4">
          {prompts.map((prompt, i) => (
            <div key={prompt.prompt_id} className="bg-bg-tertiary rounded-xl p-3 border border-border-primary">
              <div className="flex items-start justify-between mb-2">
                <p className="text-text-secondary text-sm font-medium flex-1">{prompt.question}</p>
                <button onClick={() => removePrompt(i)} className="text-text-muted hover:text-red-400 ml-2">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={prompt.answer}
                onChange={(e) => updatePromptAnswer(i, e.target.value)}
                placeholder="Your answer..."
                className="w-full bg-transparent text-text-primary text-sm outline-none resize-none h-16"
                maxLength={MAX_PROMPT_ANSWER_LENGTH}
              />
              <p className="text-text-muted text-xs text-right">{prompt.answer.length}/{MAX_PROMPT_ANSWER_LENGTH}</p>
            </div>
          ))}
        </div>

        {prompts.length < MAX_DATING_PROMPTS && (
          <div className="mt-3">
            {showPromptPicker ? (
              <div className="bg-bg-tertiary rounded-xl border border-border-primary max-h-48 overflow-y-auto">
                {availablePrompts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addPrompt(p.id)}
                    className="w-full text-left px-3 py-2.5 text-sm text-text-secondary hover:bg-bg-card hover:text-text-primary transition-colors border-b border-border-primary last:border-0"
                  >
                    {p.question}
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={() => setShowPromptPicker(true)}
                className="flex items-center gap-2 text-accent-primary text-sm hover:text-accent-secondary transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add a prompt
              </button>
            )}
          </div>
        )}
      </div>

      {/* Voice Prompt */}
      <div className="card p-4 mb-6">
        <p className="text-text-primary font-medium mb-2 flex items-center gap-2">
          <Mic className="w-4 h-4 text-accent-primary" />
          Voice Prompt
        </p>
        <p className="text-text-muted text-xs mb-3">Record a 30-second voice intro so matches can hear you</p>
        {datingProfile?.voice_prompt_url ? (
          <div className="flex items-center gap-3">
            <audio src={datingProfile.voice_prompt_url} controls className="flex-1 h-8" />
            <button
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              className="text-sm text-accent-primary hover:text-accent-secondary"
            >
              Re-record
            </button>
          </div>
        ) : (
          <button
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isRecording
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isRecording ? 'Stop Recording' : 'Record Voice Prompt'}
          </button>
        )}
      </div>

      {/* Video Intro */}
      <div className="card p-4 mb-6">
        <p className="text-text-primary font-medium mb-2 flex items-center gap-2">
          <Video className="w-4 h-4 text-accent-primary" />
          Video Intro
        </p>
        <p className="text-text-muted text-xs mb-3">Upload a 15-second video to show your personality</p>
        {datingProfile?.video_intro_url ? (
          <div className="space-y-2">
            <video src={datingProfile.video_intro_url} controls className="w-full max-h-48 rounded-lg" />
            <button onClick={handleVideoUpload} className="text-sm text-accent-primary hover:text-accent-secondary">
              Replace video
            </button>
          </div>
        ) : (
          <button
            onClick={handleVideoUpload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20 transition-colors"
          >
            <Video className="w-4 h-4" />
            Upload Video
          </button>
        )}
      </div>

      {/* Age Visibility */}
      <div className="card p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {ageVisible ? <Eye className="w-4 h-4 text-text-secondary" /> : <EyeOff className="w-4 h-4 text-text-muted" />}
          <span className="text-text-primary text-sm">Show age on profile</span>
        </div>
        <button
          onClick={() => setAgeVisible(!ageVisible)}
          className={`w-10 h-5 rounded-full transition-colors relative ${
            ageVisible ? 'bg-accent-primary' : 'bg-bg-tertiary'
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              ageVisible ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Verification Badge */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-text-primary text-sm">Photo Verification</span>
          </div>
          {datingProfile?.photo_verified ? (
            <span className="flex items-center gap-1 text-green-400 text-sm">
              <Check className="w-4 h-4" /> Verified
            </span>
          ) : (
            <Link href="/dating/verify" className="text-accent-primary text-sm hover:text-accent-secondary">
              Verify now
            </Link>
          )}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-primary w-full py-3 text-sm font-medium flex items-center justify-center gap-2"
      >
        {saving ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  );
}
