'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { createClient } from '@/lib/supabase';
import { getVisibleChatThemes, type ChatTheme } from '@/data/chatThemes';
import { ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';

export default function ChatThemePage() {
  const { profile, setProfile } = useAuthStore();
  const themes = getVisibleChatThemes();
  const [selected, setSelected] = useState<string>(profile?.chat_theme || 'default');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    const supabase = createClient();
    const value = selected === 'default' ? null : selected;
    await supabase
      .from('profiles')
      .update({ chat_theme: value })
      .eq('id', profile.id);
    setProfile({ ...profile, chat_theme: value });
    setSaving(false);
  }

  function ThemePreview({ theme, active }: { theme: ChatTheme; active: boolean }) {
    const isDefault = theme.id === 'default';
    const bgStyle = isDefault
      ? {}
      : { background: `linear-gradient(135deg, ${theme.background[0]}, ${theme.background[1]})` };

    const ownBubbleStyle = {
      background: `linear-gradient(135deg, ${theme.ownBubble[0]}, ${theme.ownBubble[1]})`,
      color: theme.ownText,
    };

    const otherBubbleStyle = isDefault
      ? {}
      : { backgroundColor: theme.otherBubble, color: theme.otherText };

    return (
      <button
        onClick={() => setSelected(theme.id)}
        className={`relative rounded-xl overflow-hidden border-2 transition-all ${
          active ? 'border-accent-primary ring-2 ring-accent-primary/30' : 'border-border-primary hover:border-border-secondary'
        }`}
      >
        {active && (
          <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-accent-primary flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
        <div
          className={`p-3 h-32 flex flex-col justify-between ${isDefault ? 'bg-bg-secondary' : ''}`}
          style={bgStyle}
        >
          <div className="flex items-start gap-2">
            <div
              className={`px-2.5 py-1 rounded-xl rounded-bl-md text-[10px] max-w-[60%] ${isDefault ? 'bg-bg-tertiary text-text-primary' : ''}`}
              style={otherBubbleStyle}
            >
              Hey there!
            </div>
          </div>
          <div className="flex justify-end">
            <div
              className="px-2.5 py-1 rounded-xl rounded-br-md text-[10px] max-w-[60%]"
              style={ownBubbleStyle}
            >
              Hi, how are you?
            </div>
          </div>
        </div>
        <div className={`px-3 py-2 text-xs font-medium text-center ${isDefault ? 'bg-bg-tertiary text-text-primary' : ''}`}
          style={!isDefault ? { backgroundColor: theme.thumbnail, color: '#FFFFFF' } : {}}
        >
          {theme.label}
        </div>
      </button>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/settings" className="p-1 hover:bg-bg-tertiary rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-text-muted" />
        </Link>
        <h1 className="text-2xl font-display font-bold text-text-primary">Chat Theme</h1>
      </div>

      <p className="text-sm text-text-muted mb-6">
        Choose a theme for your message bubbles and chat background. Your choice syncs across all your devices.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
        {themes.map(theme => (
          <ThemePreview
            key={theme.id}
            theme={theme}
            active={selected === theme.id}
          />
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving || selected === (profile?.chat_theme || 'default')}
        className="btn-primary w-full disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Theme'}
      </button>
    </div>
  );
}
