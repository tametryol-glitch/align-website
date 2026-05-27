'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
import {
  getRelationshipProfile,
  saveRelationshipProfile,
  type RelationshipProfile,
  type FieldVisibility,
  DEFAULT_IDENTITY_PRIVACY,
  GENDER_IDENTITY_OPTIONS,
  SEXUAL_ORIENTATION_OPTIONS,
  INTERESTED_IN_OPTIONS,
  PRIMARY_INTENT_OPTIONS,
  SECONDARY_INTENT_OPTIONS,
  RELATIONSHIP_STYLE_OPTIONS,
  DEALBREAKER_OPTIONS,
  CONNECTION_TYPE_OPTIONS,
  ENERGETIC_PACE_OPTIONS,
  SPIRITUAL_OPENNESS_OPTIONS,
} from '@/lib/relationshipProfileService';
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

const PREF_FIELDS: { label: string; field: string; options: readonly string[]; multi: boolean; privacy?: string }[] = [
  { label: 'Gender Identity', field: 'gender_identity', options: GENDER_IDENTITY_OPTIONS, multi: false },
  { label: 'Sexual Orientation', field: 'sexual_orientation', options: SEXUAL_ORIENTATION_OPTIONS, multi: true, privacy: 'sexual_orientation' },
  { label: 'Interested In', field: 'interested_in_genders', options: INTERESTED_IN_OPTIONS, multi: true, privacy: 'interested_in_genders' },
  { label: 'Primary Intent', field: 'relationship_primary_intent', options: PRIMARY_INTENT_OPTIONS, multi: false, privacy: 'relationship_primary_intent' },
  { label: 'Secondary Intents', field: 'relationship_secondary_intents', options: SECONDARY_INTENT_OPTIONS, multi: true },
  { label: 'Relationship Style', field: 'relationship_style', options: RELATIONSHIP_STYLE_OPTIONS, multi: false, privacy: 'relationship_style' },
  { label: 'Dealbreakers', field: 'relationship_preferences', options: DEALBREAKER_OPTIONS, multi: true },
  { label: 'Connection Type', field: 'connection_type_wanted', options: CONNECTION_TYPE_OPTIONS, multi: false, privacy: 'connection_type_wanted' },
  { label: 'Energetic Pace', field: 'energetic_pace', options: ENERGETIC_PACE_OPTIONS, multi: false, privacy: 'energetic_pace' },
  { label: 'Spiritual Openness', field: 'spiritual_openness', options: SPIRITUAL_OPENNESS_OPTIONS, multi: false, privacy: 'spiritual_openness' },
];

export default function DatingProfilePage() {
  const { t } = useTranslation();
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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceUploading, setVoiceUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [relProfile, setRelProfile] = useState<Partial<RelationshipProfile>>({});
  const [prefsExpanded, setPrefsExpanded] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [privacySettings, setPrivacySettings] = useState<Record<string, FieldVisibility>>({ ...DEFAULT_IDENTITY_PRIVACY });

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
    const relData = await getRelationshipProfile(user.id);
    if (relData) {
      setRelProfile(relData);
      setPrivacySettings(relData.identity_privacy_settings || { ...DEFAULT_IDENTITY_PRIVACY });
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!user?.id) return;
    setSaving(true);
    setSaveMessage(null);
    const result = await saveDatingProfile(user.id, {
      dating_bio: bio,
      dating_prompts: prompts,
      age_visible: ageVisible,
      photo_urls: photos,
    });
    setSaving(false);
    if (result.success) {
      setSaveMessage({ type: 'success', text: 'Profile saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } else {
      setSaveMessage({ type: 'error', text: result.error || 'Failed to save profile.' });
    }
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
      setUploadError(null);
      const result = await uploadDatingPhoto(user.id, file, position);
      if (result.url) {
        const newPhotos = [...photos];
        if (position < newPhotos.length) {
          newPhotos[position] = result.url;
        } else {
          newPhotos.push(result.url);
        }
        setPhotos(newPhotos);
        const saveResult = await saveDatingProfile(user.id, { photo_urls: newPhotos });
        if (!saveResult.success) {
          setUploadError('Photo uploaded but failed to save to profile. Please try saving again.');
        }
      } else {
        setUploadError(result.error || 'Failed to upload photo. Please try again.');
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
    setVoiceError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setVoiceError('Your browser does not support audio recording. Please use Chrome or Safari.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (user?.id) {
          setVoiceUploading(true);
          const result = await uploadVoicePrompt(user.id, blob);
          if (result.url) {
            await loadProfile();
          } else {
            setVoiceError(result.error || 'Failed to upload voice prompt.');
          }
          setVoiceUploading(false);
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
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        setVoiceError('Microphone access denied. Please allow microphone permission in your browser settings.');
      } else {
        setVoiceError(err?.message || 'Failed to start recording.');
      }
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

  function updatePref(field: string, value: any) {
    setRelProfile(prev => ({ ...prev, [field]: value }));
  }

  function toggleMultiPref(field: string, value: string) {
    setRelProfile(prev => {
      const current = ((prev as any)[field] as string[] | null) || [];
      return { ...prev, [field]: current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value] };
    });
  }

  function cyclePrivacy(field: string) {
    setPrivacySettings(prev => {
      const current = prev[field] || 'show_on_profile';
      const next: FieldVisibility = current === 'show_on_profile' ? 'match_only' : current === 'match_only' ? 'hidden' : 'show_on_profile';
      return { ...prev, [field]: next };
    });
  }

  function renderPrivacyToggle(field: string) {
    const level = privacySettings[field] || DEFAULT_IDENTITY_PRIVACY[field] || 'show_on_profile';
    return (
      <button onClick={() => cyclePrivacy(field)} className={`flex items-center gap-1 text-xs transition-colors ${
        level === 'show_on_profile' ? 'text-green-400' : level === 'match_only' ? 'text-yellow-400' : 'text-red-400/60'
      }`}>
        {level === 'show_on_profile' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        {level === 'show_on_profile' ? 'Visible' : level === 'match_only' ? 'Match only' : 'Hidden'}
      </button>
    );
  }

  async function handleSavePrefs() {
    if (!user?.id) return;
    setSavingPrefs(true);
    setSaveMessage(null);
    const result = await saveRelationshipProfile(user.id, {
      ...relProfile,
      identity_privacy_settings: privacySettings,
    });
    setSavingPrefs(false);
    if (result.success) {
      setSaveMessage({ type: 'success', text: 'Preferences saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } else {
      setSaveMessage({ type: 'error', text: result.error || 'Failed to save preferences.' });
    }
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
          {t('dating.profile.title')}
        </h1>
      </div>

      {/* Enable Dating Toggle */}
      <div className="card p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-text-primary font-medium">{t('dating.profile.datingMode')}</p>
          <p className="text-text-muted text-sm">{t('dating.profile.datingModeHint')}</p>
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
        <p className="text-text-secondary text-sm mb-2">{t('dating.profile.cosmicSignature')}</p>
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
            {t('dating.profile.photos')}
          </p>
          <p className="text-text-muted text-xs">{photos.length}/6</p>
        </div>
        {uploadError && (
          <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {uploadError}
          </div>
        )}
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
        <p className="text-text-primary font-medium mb-2">{t('dating.profile.aboutMe')}</p>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 500))}
          placeholder={t('dating.profile.aboutMePlaceholder')}
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
            {t('dating.profile.cosmicPrompts')}
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
                placeholder={t('dating.profile.promptAnswerPlaceholder')}
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
                {t('dating.profile.addPrompt')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Voice Prompt */}
      <div className="card p-4 mb-6">
        <p className="text-text-primary font-medium mb-2 flex items-center gap-2">
          <Mic className="w-4 h-4 text-accent-primary" />
          {t('dating.profile.voicePrompt')}
        </p>
        <p className="text-text-muted text-xs mb-3">{t('dating.profile.voicePromptHint')}</p>
        {voiceError && (
          <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {voiceError}
          </div>
        )}
        {voiceUploading && (
          <div className="mb-3 flex items-center gap-2 text-text-muted text-xs">
            <div className="w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
            {t('dating.profile.uploadingVoice')}
          </div>
        )}
        {datingProfile?.voice_prompt_url ? (
          <div className="flex items-center gap-3">
            <audio src={datingProfile.voice_prompt_url} controls className="flex-1 h-8" />
            <button
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              className="text-sm text-accent-primary hover:text-accent-secondary"
            >
              {t('dating.profile.reRecord')}
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
            {isRecording ? t('dating.profile.stopRecording') : t('dating.profile.recordVoicePrompt')}
          </button>
        )}
      </div>

      {/* Video Intro */}
      <div className="card p-4 mb-6">
        <p className="text-text-primary font-medium mb-2 flex items-center gap-2">
          <Video className="w-4 h-4 text-accent-primary" />
          {t('dating.profile.videoIntro')}
        </p>
        <p className="text-text-muted text-xs mb-3">{t('dating.profile.videoIntroHint')}</p>
        {datingProfile?.video_intro_url ? (
          <div className="space-y-2">
            <video src={datingProfile.video_intro_url} controls className="w-full max-h-48 rounded-lg" />
            <button onClick={handleVideoUpload} className="text-sm text-accent-primary hover:text-accent-secondary">
              {t('dating.profile.replaceVideo')}
            </button>
          </div>
        ) : (
          <button
            onClick={handleVideoUpload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20 transition-colors"
          >
            <Video className="w-4 h-4" />
            {t('dating.profile.uploadVideo')}
          </button>
        )}
      </div>

      {/* Age Visibility */}
      <div className="card p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {ageVisible ? <Eye className="w-4 h-4 text-text-secondary" /> : <EyeOff className="w-4 h-4 text-text-muted" />}
          <span className="text-text-primary text-sm">{t('dating.profile.showAge')}</span>
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
            <span className="text-text-primary text-sm">{t('dating.profile.photoVerification')}</span>
          </div>
          {datingProfile?.photo_verified ? (
            <span className="flex items-center gap-1 text-green-400 text-sm">
              <Check className="w-4 h-4" /> {t('dating.profile.verified')}
            </span>
          ) : (
            <Link href="/dating/verify" className="text-accent-primary text-sm hover:text-accent-secondary">
              {t('dating.profile.verifyNow')}
            </Link>
          )}
        </div>
      </div>

      {/* Dating Preferences */}
      <div className="card mb-6 overflow-hidden">
        <button
          onClick={() => setPrefsExpanded(!prefsExpanded)}
          className="w-full flex items-center justify-between p-4"
        >
          <span className="text-text-primary font-medium flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-400" />
            {t('dating.profile.datingPreferences')}
          </span>
          <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-200 ${prefsExpanded ? 'rotate-180' : ''}`} />
        </button>

        {prefsExpanded && (
          <div className="px-4 pb-4 space-y-5 border-t border-border-primary pt-4">
            <p className="text-text-muted text-xs">
              These preferences power your compatibility matching. Tap the eye icon to control who sees each field.
            </p>

            {PREF_FIELDS.map(({ label, field, options, multi, privacy }) => (
              <div key={field}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-text-secondary text-sm font-medium">{label}</p>
                  {privacy && renderPrivacyToggle(privacy)}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {options.map(opt => {
                    const selected = multi
                      ? (((relProfile as any)[field] as string[] | null) || []).includes(opt)
                      : (relProfile as any)[field] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => multi ? toggleMultiPref(field, opt) : updatePref(field, opt)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          selected
                            ? 'bg-accent-primary text-white'
                            : 'bg-bg-tertiary text-text-secondary border border-border-primary hover:border-accent-primary/40'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              onClick={handleSavePrefs}
              disabled={savingPrefs}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-white bg-accent-primary hover:bg-accent-secondary transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {savingPrefs ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {savingPrefs ? t('common.loading') : t('dating.profile.savePreferences')}
            </button>
          </div>
        )}
      </div>

      {/* Save Feedback */}
      {saveMessage && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
          saveMessage.type === 'success'
            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {saveMessage.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {saveMessage.text}
        </div>
      )}

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
        {saving ? t('dating.profile.saving') : t('dating.profile.saveProfile')}
      </button>
    </div>
  );
}
