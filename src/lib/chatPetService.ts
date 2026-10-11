// ═══════════════════════════════════════════════════════════════════
// Chat Pet service (web) — mirror of align-app/src/services/chatPetService.ts
//
// Same table (chat_pets), same RPCs (pet_action, pet_rename), same realtime channels
// (postgres_changes on chat_pets + broadcast/presence on chat_pet_live_<conversationId>),
// so a web person and an app person share ONE pet. Keep the channel name, event name
// ('pet') and payload ({ kind, by }) identical to the app.
//
// Schema: align-app/supabase-migration-chat-pets*.sql
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from './supabase';
import type { PetRow } from './petTraits';

export type PetActionKind = 'feed' | 'play' | 'pet';
export type PetLiveKind = 'poke' | 'stroke' | 'pet' | 'feed' | 'play' | 'sleep' | 'wake';
export interface PetLiveEvent {
  kind: PetLiveKind;
  by: string;
}

interface Holder {
  id: string | null;
  row: PetRow | null;
  loaded: boolean;
}

/**
 * Live pet row for one DM. State is tagged with the conversation it belongs to, so
 * switching chats can never show the previous pair's pet, not even for a frame.
 */
export function useChatPet(conversationId: string | null) {
  const supabase = useMemo(() => createClient(), []);
  const [holder, setHolder] = useState<Holder>({ id: null, row: null, loaded: false });
  const mine = holder.id === conversationId;
  const pet = mine ? holder.row : null;
  const loaded = mine && holder.loaded;

  useEffect(() => {
    if (!conversationId) return;
    let cancelled = false;
    setHolder({ id: conversationId, row: null, loaded: false });
    supabase
      .from('chat_pets')
      .select('*')
      .eq('conversation_id', conversationId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        setHolder({ id: conversationId, row: error ? null : ((data as PetRow | null) ?? null), loaded: true });
      });
    const channel = supabase
      .channel(`chat_pet_${conversationId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_pets', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const row = payload.new as PetRow & { conversation_id?: string };
          if (row && row.conversation_id === conversationId) {
            setHolder({ id: conversationId, row, loaded: true });
          }
        },
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  const act = useCallback(
    async (action: PetActionKind): Promise<PetRow | null> => {
      if (!conversationId) return null;
      const { data, error } = await supabase.rpc('pet_action', { p_conversation: conversationId, p_action: action });
      if (error || !data) return null;
      const row = data as PetRow;
      setHolder({ id: conversationId, row, loaded: true });
      return row;
    },
    [conversationId, supabase],
  );

  const rename = useCallback(
    async (name: string): Promise<boolean> => {
      if (!conversationId) return false;
      const { error } = await supabase.rpc('pet_rename', { p_conversation: conversationId, p_name: name });
      if (error) return false;
      const clean = name.trim().slice(0, 20);
      setHolder((prev) =>
        prev.id === conversationId && prev.row ? { ...prev, row: { ...prev.row, name: clean || null } } : prev,
      );
      return true;
    },
    [conversationId, supabase],
  );

  return { pet, loaded, act, rename };
}

/**
 * Ephemeral two-person channel for one pet: broadcasts what each person does so the
 * other sees it instantly (web <-> app), and tracks presence for "Jo is here now".
 */
export function usePetLive(conversationId: string, myId: string, onEvent: (e: PetLiveEvent) => void) {
  const supabase = useMemo(() => createClient(), []);
  const chRef = useRef<RealtimeChannel | null>(null);
  const cb = useRef(onEvent);
  cb.current = onEvent;
  const [partnerHere, setPartnerHere] = useState(false);

  useEffect(() => {
    const ch = supabase.channel(`chat_pet_live_${conversationId}`, {
      config: { broadcast: { self: false }, presence: { key: myId } },
    });
    ch.on('broadcast', { event: 'pet' }, ({ payload }) => {
      const e = payload as PetLiveEvent;
      if (e && e.by && e.by !== myId) cb.current(e);
    })
      .on('presence', { event: 'sync' }, () => {
        const keys = Object.keys(ch.presenceState());
        setPartnerHere(keys.some((k) => k !== myId));
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') ch.track({ at: Date.now() });
      });
    chRef.current = ch;
    return () => {
      chRef.current = null;
      setPartnerHere(false);
      supabase.removeChannel(ch);
    };
  }, [conversationId, myId, supabase]);

  const send = useCallback(
    (kind: PetLiveKind) => {
      const payload: PetLiveEvent = { kind, by: myId };
      chRef.current?.send({ type: 'broadcast', event: 'pet', payload });
    },
    [myId],
  );

  return { partnerHere, send };
}
