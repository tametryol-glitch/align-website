// ═══════════════════════════════════════════════════════════════════
// Per-conversation chat wallpaper (web) — mirror of
// align-app/src/services/conversationThemeService.ts. Same table
// (conversation_themes), same RPC (set_conversation_theme), same realtime
// filter, so web and app people in a chat always see the same wallpaper.
// Schema: align-app/supabase-migration-conversation-themes.sql
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from 'react';
import { createClient } from './supabase';
import { validateUpload } from './sanitize';
import { themeFromRow, type ChatTheme } from '@/data/chatThemes';

export interface ConversationThemeRow {
  conversation_id: string;
  theme_id: string;
  custom_url: string | null;
  dim: number;
}

export async function setConversationTheme(
  conversationId: string,
  themeId: string,
  customUrl: string | null = null,
  dim = 25,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await createClient().rpc('set_conversation_theme', {
    p_conversation: conversationId,
    p_theme: themeId,
    p_custom_url: customUrl,
    p_dim: dim,
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Downscale to <=1600px wide JPEG so wallpapers stay light for phones. */
async function downscale(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('encode'))), 'image/jpeg', 0.82),
  );
}

export async function uploadWallpaper(conversationId: string, file: File): Promise<{ url?: string; error?: string }> {
  const vErr = validateUpload(file, 'image');
  if (vErr) return { error: vErr };
  try {
    const blob = await downscale(file);
    const supabase = createClient();
    const path = `chat/${conversationId}/wallpaper-${Date.now()}.jpg`;
    const { error } = await supabase.storage.from('chat-media').upload(path, blob, { contentType: 'image/jpeg' });
    if (error) return { error: 'Could not upload the photo. Please try again.' };
    return { url: supabase.storage.from('chat-media').getPublicUrl(path).data.publicUrl };
  } catch {
    return { error: 'Could not process the photo. Please try again.' };
  }
}

interface Holder {
  id: string | null;
  row: ConversationThemeRow | null;
}

/** Live wallpaper for one conversation, tagged with its id so chats never bleed into each other. */
export function useConversationTheme(conversationId: string | null) {
  const [holder, setHolder] = useState<Holder>({ id: null, row: null });
  const row = holder.id === conversationId ? holder.row : null;

  useEffect(() => {
    if (!conversationId) return;
    let cancelled = false;
    const supabase = createClient();
    setHolder({ id: conversationId, row: null });
    supabase
      .from('conversation_themes')
      .select('conversation_id, theme_id, custom_url, dim')
      .eq('conversation_id', conversationId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setHolder({ id: conversationId, row: (data as ConversationThemeRow | null) ?? null });
      });
    const channel = supabase
      .channel(`conversation_theme_${conversationId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversation_themes', filter: `conversation_id=eq.${conversationId}` },
        (payload: any) => {
          if (payload.eventType === 'DELETE') {
            setHolder({ id: conversationId, row: null });
          } else {
            const r = payload.new as ConversationThemeRow;
            if (r && r.conversation_id === conversationId) setHolder({ id: conversationId, row: r });
          }
        },
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const apply = useCallback(
    async (themeId: string, customUrl: string | null = null, dim = 25) => {
      if (!conversationId) return { ok: false, error: 'No conversation' };
      const res = await setConversationTheme(conversationId, themeId, customUrl, dim);
      if (res.ok) {
        setHolder({
          id: conversationId,
          row: themeId === 'default'
            ? null
            : { conversation_id: conversationId, theme_id: themeId, custom_url: customUrl, dim },
        });
      }
      return res;
    },
    [conversationId],
  );

  const theme: ChatTheme | null = themeFromRow(row);
  return { theme, apply };
}
