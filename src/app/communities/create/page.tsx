'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  createCommunity, COMMUNITY_CATEGORIES, ZODIAC_OPTIONS, ZODIAC_EMOJIS,
  type CommunityCategory,
} from '@/lib/communityService';
import { uploadCommunityBanner, uploadCommunityAvatar, updateCommunityBanner, updateCommunityAvatar } from '@/lib/communityService';
import Link from 'next/link';
import { ArrowLeft, Globe, Lock, RefreshCw, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const RULE_PRESETS = [
  { label: '🤝 Be Kind & Respectful', text: 'Be respectful and kind to all members\nNo harassment, bullying, or personal attacks\nKeep discussions constructive and positive' },
  { label: '🔮 Astrology Safe Space', text: 'All astrological perspectives are welcome\nNo shaming based on zodiac placements\nShare knowledge generously and patiently' },
  { label: '💬 Discussion Focused', text: 'Stay on topic for this community\nProvide sources when sharing astrological claims\nNo spam or self-promotion without permission' },
];

const ZODIAC_CATEGORIES: CommunityCategory[] = ['sun_sign', 'moon_sign', 'rising_sign'];

const SUGGESTED_NAMES: Record<string, string[]> = {
  Aries: ['Aries Fire Starters', 'Ram\'s Arena', 'Aries Warriors'],
  Taurus: ['Taurus Garden', 'Bull\'s Sanctuary', 'Taurus Comfort Zone'],
  Gemini: ['Gemini Twins Hub', 'Mercury Minds', 'Gemini Exchange'],
  Cancer: ['Cancer Moon Circle', 'Crab\'s Cove', 'Cancer Nurturers'],
  Leo: ['Leo\'s Stage', 'Lion Heart Circle', 'Leo Luminaries'],
  Virgo: ['Virgo Collective', 'Mercury\'s Workshop', 'Virgo Healers'],
  Libra: ['Libra Harmony Hub', 'Venus Lounge', 'Libra Diplomats'],
  Scorpio: ['Scorpio Depths', 'Pluto\'s Circle', 'Scorpio Mystics'],
  Sagittarius: ['Sagittarius Explorers', 'Archer\'s Path', 'Sag Seekers'],
  Capricorn: ['Capricorn Summit', 'Saturn Return Survivors', 'Cap Climbers'],
  Aquarius: ['Aquarius Collective', 'Uranus Rebels', 'Aquarius Visionaries'],
  Pisces: ['Pisces Dream Circle', 'Neptune\'s Pool', 'Pisces Empaths'],
};

export default function CreateCommunityPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CommunityCategory | null>(null);
  const [zodiacSign, setZodiacSign] = useState<string | null>(null);
  const [rules, setRules] = useState('');
  const [welcomeMsg, setWelcomeMsg] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const showZodiac = category && ZODIAC_CATEGORIES.includes(category);
  const suggestions = zodiacSign ? SUGGESTED_NAMES[zodiacSign] || [] : [];

  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCreate = async () => {
    if (!name.trim() || name.trim().length < 3) {
      setError('Community name must be at least 3 characters');
      return;
    }
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    if (!category) {
      setError('Please select a category');
      return;
    }

    setError('');
    setCreating(true);

    const result = await createCommunity({
      name: name.trim(),
      description: description.trim(),
      category,
      zodiac_sign: showZodiac ? zodiacSign : null,
      rules: rules.trim() || null,
      is_public: isPublic,
      welcome_message: welcomeMsg.trim() || null,
    });

    if (result.success && result.community) {
      // Upload images if selected
      if (bannerFile) {
        const bannerUrl = await uploadCommunityBanner(result.community.id, bannerFile);
        if (bannerUrl) await updateCommunityBanner(result.community.id, bannerUrl);
      }
      if (avatarFile) {
        const avatarUrl = await uploadCommunityAvatar(result.community.id, avatarFile);
        if (avatarUrl) await updateCommunityAvatar(result.community.id, avatarUrl);
      }
      setShowSuccess(true);
      setTimeout(() => {
        router.push(`/communities/${result.community!.id}`);
      }, 1200);
    } else {
      setError(result.error || 'Failed to create community');
    }
    setCreating(false);
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <p className="text-text-muted mb-4">Please log in to create a community.</p>
        <Link href="/auth/login" className="text-accent-primary hover:underline">Log in</Link>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center animate-fadeIn">
        <div className="text-6xl mb-4">✨</div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Community Created!</h2>
        <p className="text-sm text-text-secondary">Taking you there now...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/communities" className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-text-primary">{t('communities.empty.createButton')}</h1>
      </div>

      {/* Live Preview */}
      <div className="card rounded-2xl overflow-hidden border-accent-primary/20 bg-accent-primary/5">
        <p className="text-[10px] text-text-muted uppercase tracking-wider px-4 pt-4 mb-2">Preview</p>
        {/* Banner preview strip */}
        <div className="relative w-full h-24 bg-accent-primary/10 flex items-center justify-center overflow-hidden">
          {bannerPreview ? (
            <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white/20 text-xs">No banner</span>
          )}
        </div>
        <div className="flex items-end gap-3 px-4 pb-4 -mt-6">
          {/* Avatar preview */}
          <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-bg-primary bg-accent-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              zodiacSign ? ZODIAC_EMOJIS[zodiacSign] || '✨' :
              category ? COMMUNITY_CATEGORIES.find(c => c.id === category)?.emoji || '✨' : '✨'
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary">{name || 'Community Name'}</p>
            <p className="text-xs text-text-muted line-clamp-1">{description || 'Description...'}</p>
            <div className="flex items-center gap-2 mt-1">
              {category && (
                <span className="text-[10px] text-text-muted">
                  {COMMUNITY_CATEGORIES.find(c => c.id === category)?.emoji} {COMMUNITY_CATEGORIES.find(c => c.id === category)?.label}
                </span>
              )}
              <span className="text-[10px] text-text-muted">{isPublic ? `🌍 ${t('common.public')}` : `🔒 ${t('common.private')}`}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Image */}
      <div className="card rounded-2xl p-4 space-y-2">
        <label className="text-sm font-medium text-text-secondary">Community Banner</label>
        <div
          className="relative w-full h-40 rounded-xl overflow-hidden border-2 border-dashed border-white/20 hover:border-accent-primary/50 transition-colors cursor-pointer group"
          onClick={() => document.getElementById('banner-upload')?.click()}
        >
          {bannerPreview ? (
            <>
              <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-medium">Change Banner</span>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setBannerFile(null); setBannerPreview(null); }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
              >✕</button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white/40 group-hover:text-white/60 transition-colors">
              <span className="text-3xl mb-2">🖼️</span>
              <span className="text-sm">Click to upload a banner image</span>
              <span className="text-xs text-white/30 mt-1">Recommended: 1200×400px</span>
            </div>
          )}
          <input
            id="banner-upload"
            type="file"
            accept="image/*"
            onChange={handleBannerSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Community Avatar */}
      <div className="card rounded-2xl p-4 space-y-2">
        <label className="text-sm font-medium text-text-secondary">Community Avatar</label>
        <div className="flex items-center gap-4">
          <div
            className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-white/20 hover:border-accent-primary/50 transition-colors cursor-pointer group flex-shrink-0"
            onClick={() => document.getElementById('avatar-upload')?.click()}
          >
            {avatarPreview ? (
              <>
                <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs">Change</span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-white/40 group-hover:text-white/60 transition-colors">
                <span className="text-2xl">📷</span>
              </div>
            )}
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              className="hidden"
            />
          </div>
          <div className="text-sm text-text-secondary">
            <p>Upload a community avatar</p>
            <p className="text-xs text-white/30">Square image, min 200×200px</p>
          </div>
        </div>
      </div>

      {/* Name */}
      <div className="card rounded-2xl p-4 space-y-3">
        <label className="text-sm font-semibold text-text-primary">Community Name *</label>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g., Aries Fire Starters"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={50}
            className="w-full px-4 py-2.5 bg-bg-tertiary rounded-xl text-sm text-text-primary placeholder:text-text-muted border border-border-primary focus:border-accent-primary/50 focus:outline-none"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-muted">{name.length}/50</span>
        </div>

        {/* Suggested names */}
        {suggestions.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <span className="text-[11px] text-text-muted">Suggestions:</span>
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => setName(s)}
                className="text-[11px] text-accent-primary hover:underline"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="card rounded-2xl p-4 space-y-3">
        <label className="text-sm font-semibold text-text-primary">Description *</label>
        <div className="relative">
          <textarea
            placeholder="What is this community about?"
            value={description}
            onChange={e => setDescription(e.target.value)}
            maxLength={300}
            rows={3}
            className="w-full px-4 py-2.5 bg-bg-tertiary rounded-xl text-sm text-text-primary placeholder:text-text-muted border border-border-primary focus:border-accent-primary/50 focus:outline-none resize-none"
          />
          <span className="absolute right-3 bottom-3 text-[10px] text-text-muted">{description.length}/300</span>
        </div>
      </div>

      {/* Category */}
      <div className="card rounded-2xl p-4 space-y-3">
        <label className="text-sm font-semibold text-text-primary">Category *</label>
        <div className="grid grid-cols-2 gap-2">
          {COMMUNITY_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setCategory(cat.id); if (!ZODIAC_CATEGORIES.includes(cat.id)) setZodiacSign(null); }}
              className={`p-3 rounded-xl text-sm text-left transition-all ${
                category === cat.id
                  ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
                  : 'bg-bg-tertiary text-text-muted border border-border-primary hover:border-border-accent'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Zodiac Picker */}
      {showZodiac && (
        <div className="card rounded-2xl p-4 space-y-3">
          <label className="text-sm font-semibold text-text-primary">Zodiac Sign</label>
          <div className="grid grid-cols-4 gap-2">
            {ZODIAC_OPTIONS.map(sign => (
              <button
                key={sign}
                onClick={() => setZodiacSign(zodiacSign === sign ? null : sign)}
                className={`p-2 rounded-xl text-center transition-all ${
                  zodiacSign === sign
                    ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
                    : 'bg-bg-tertiary text-text-muted border border-border-primary'
                }`}
              >
                <div className="text-lg">{ZODIAC_EMOJIS[sign]}</div>
                <div className="text-[10px] mt-0.5">{sign}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Rules */}
      <div className="card rounded-2xl p-4 space-y-3">
        <label className="text-sm font-semibold text-text-primary">Community Rules</label>
        <div className="flex gap-2 flex-wrap">
          {RULE_PRESETS.map(preset => (
            <button
              key={preset.label}
              onClick={() => setRules(preset.text)}
              className="text-[11px] px-3 py-1.5 rounded-full bg-bg-tertiary text-text-muted border border-border-primary hover:border-accent-primary/30"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <textarea
            placeholder="Set rules for your community..."
            value={rules}
            onChange={e => setRules(e.target.value)}
            maxLength={500}
            rows={4}
            className="w-full px-4 py-2.5 bg-bg-tertiary rounded-xl text-sm text-text-primary placeholder:text-text-muted border border-border-primary focus:border-accent-primary/50 focus:outline-none resize-none"
          />
          <span className="absolute right-3 bottom-3 text-[10px] text-text-muted">{rules.length}/500</span>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="card rounded-2xl p-4 space-y-3">
        <label className="text-sm font-semibold text-text-primary">Welcome Message</label>
        <p className="text-xs text-text-muted">Shown to new members when they join</p>
        <div className="relative">
          <textarea
            placeholder="Welcome to our community! We're glad you're here..."
            value={welcomeMsg}
            onChange={e => setWelcomeMsg(e.target.value)}
            maxLength={300}
            rows={3}
            className="w-full px-4 py-2.5 bg-bg-tertiary rounded-xl text-sm text-text-primary placeholder:text-text-muted border border-border-primary focus:border-accent-primary/50 focus:outline-none resize-none"
          />
          <span className="absolute right-3 bottom-3 text-[10px] text-text-muted">{welcomeMsg.length}/300</span>
        </div>
      </div>

      {/* Visibility */}
      <div className="card rounded-2xl p-4">
        <label className="text-sm font-semibold text-text-primary mb-3 block">Visibility</label>
        <div className="flex gap-3">
          <button
            onClick={() => setIsPublic(true)}
            className={`flex-1 p-4 rounded-xl border text-left transition-all ${
              isPublic
                ? 'border-accent-primary/30 bg-accent-primary/10'
                : 'border-border-primary bg-bg-tertiary'
            }`}
          >
            <Globe className={`w-5 h-5 mb-2 ${isPublic ? 'text-accent-primary' : 'text-text-muted'}`} />
            <p className="text-sm font-medium text-text-primary">{t('common.public')}</p>
            <p className="text-xs text-text-muted mt-0.5">Anyone can find and join</p>
          </button>
          <button
            onClick={() => setIsPublic(false)}
            className={`flex-1 p-4 rounded-xl border text-left transition-all ${
              !isPublic
                ? 'border-accent-primary/30 bg-accent-primary/10'
                : 'border-border-primary bg-bg-tertiary'
            }`}
          >
            <Lock className={`w-5 h-5 mb-2 ${!isPublic ? 'text-accent-primary' : 'text-text-muted'}`} />
            <p className="text-sm font-medium text-text-primary">{t('common.private')}</p>
            <p className="text-xs text-text-muted mt-0.5">Invite or approval required</p>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Create Button */}
      <button
        onClick={handleCreate}
        disabled={creating || !name.trim() || !description.trim() || !category}
        className="w-full py-3 rounded-xl font-medium bg-accent-primary text-white hover:bg-accent-primary/80 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
      >
        {creating ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" /> Creating...
          </>
        ) : (
          <>
            <Check className="w-4 h-4" /> {t('communities.empty.createButton')}
          </>
        )}
      </button>
    </div>
  );
}
