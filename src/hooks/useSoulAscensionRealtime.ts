'use client';

/**
 * useSoulAscensionRealtime — Supabase Realtime subscriptions for
 * Soul Ascension social features (web version).
 *
 * Subscribes on mount, cleans up on unmount.
 */

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeCallbacks {
  onRivalMatchChange?: (payload: { new: Record<string, unknown>; old: Record<string, unknown>; eventType: string }) => void;
  onSpectatableRunChange?: (payload: { new: Record<string, unknown>; old: Record<string, unknown>; eventType: string }) => void;
  onSpectatorEvent?: (payload: { new: Record<string, unknown> }) => void;
  onLineageChange?: (payload: { new: Record<string, unknown>; old: Record<string, unknown>; eventType: string }) => void;
  onLineageMemberChange?: (payload: { new: Record<string, unknown>; old: Record<string, unknown>; eventType: string }) => void;
}

export function useSoulAscensionRealtime(
  userId: string | null | undefined,
  callbacks: RealtimeCallbacks,
  enabled: boolean = true,
) {
  const supabase = useMemo(() => createClient(), []);
  const channelsRef = useRef<RealtimeChannel[]>([]);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const cleanup = useCallback(() => {
    for (const ch of channelsRef.current) {
      supabase.removeChannel(ch);
    }
    channelsRef.current = [];
  }, [supabase]);

  useEffect(() => {
    if (!enabled || !userId) return;

    const channels: RealtimeChannel[] = [];

    // Rival Matches (filter to current user as challenger or defender)
    const rivalCh = supabase
      .channel('soul-rival-matches')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'soul_rival_matches', filter: `challenger_id=eq.${userId}` },
        (payload) => {
          callbacksRef.current.onRivalMatchChange?.({
            new: payload.new as Record<string, unknown>,
            old: (payload.old ?? {}) as Record<string, unknown>,
            eventType: payload.eventType,
          });
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'soul_rival_matches', filter: `defender_id=eq.${userId}` },
        (payload) => {
          callbacksRef.current.onRivalMatchChange?.({
            new: payload.new as Record<string, unknown>,
            old: (payload.old ?? {}) as Record<string, unknown>,
            eventType: payload.eventType,
          });
        },
      )
      .subscribe();
    channels.push(rivalCh);

    // Spectatable Runs
    const specRunCh = supabase
      .channel('soul-spectatable-runs')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'soul_spectatable_runs' },
        (payload) => {
          callbacksRef.current.onSpectatableRunChange?.({
            new: payload.new as Record<string, unknown>,
            old: (payload.old ?? {}) as Record<string, unknown>,
            eventType: payload.eventType,
          });
        },
      )
      .subscribe();
    channels.push(specRunCh);

    // Spectator Events (INSERTs only)
    const specEventCh = supabase
      .channel('soul-spectator-events')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'soul_spectator_events' },
        (payload) => {
          callbacksRef.current.onSpectatorEvent?.({
            new: payload.new as Record<string, unknown>,
          });
        },
      )
      .subscribe();
    channels.push(specEventCh);

    // Lineages
    const lineageCh = supabase
      .channel('soul-lineages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'soul_lineages' },
        (payload) => {
          callbacksRef.current.onLineageChange?.({
            new: payload.new as Record<string, unknown>,
            old: (payload.old ?? {}) as Record<string, unknown>,
            eventType: payload.eventType,
          });
        },
      )
      .subscribe();
    channels.push(lineageCh);

    // Lineage Members
    const memberCh = supabase
      .channel('soul-lineage-members')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'soul_lineage_members' },
        (payload) => {
          callbacksRef.current.onLineageMemberChange?.({
            new: payload.new as Record<string, unknown>,
            old: (payload.old ?? {}) as Record<string, unknown>,
            eventType: payload.eventType,
          });
        },
      )
      .subscribe();
    channels.push(memberCh);

    channelsRef.current = channels;

    return cleanup;
  }, [userId, enabled, cleanup, supabase]);

  return { cleanup };
}
