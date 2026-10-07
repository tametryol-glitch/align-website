'use client';

// ═══════════════════════════════════════════════════════════════════
// Chat Bubble Head — Messenger-style floating avatar on every page.
// When someone messages you, their avatar pops up with an unread badge and
// a short preview. Click to open the thread, drag to move (snaps to a side),
// ✕ to dismiss. Hidden while you're already looking at that conversation.
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useMessagesStore } from '@/stores/messagesStore';
import { subscribeToConversations } from '@/lib/messagingService';
import { createClient } from '@/lib/supabase';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface Bubble {
  conversationId: string;
  name: string;
  avatar: string | null;
  preview: string;
  count: number;
}

const SIZE = 56;
const EDGE = 12;
const PILL_MS = 5000;
const AUTO_DISMISS_MS = 120_000;

function previewFor(msg: any): string {
  switch (msg.type) {
    case 'image': return '📷 Photo';
    case 'video': case 'video_note': return '🎥 Video';
    case 'voice_note': return '🎤 Voice message';
    case 'file': return '📎 File';
    case 'location': return '📍 Location';
    case 'contact': return '👤 Contact';
    case 'poll': return '📊 Poll';
    case 'chart_share': return '☉ Shared a chart';
    default: return (msg.content || 'New message').toString().slice(0, 120);
  }
}

export function ChatBubbleHead() {
  const userId = useAuthStore((s) => s.user?.id);
  const router = useRouter();
  const [bubble, setBubble] = useState<Bubble | null>(null);
  const [showPill, setShowPill] = useState(true);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ startX: number; startY: number; originX: number; originY: number; moved: boolean } | null>(null);

  // Place the bubble on first show: right edge, ~35% down.
  useEffect(() => {
    if (bubble && !pos) setPos({ x: window.innerWidth - SIZE - EDGE, y: Math.round(window.innerHeight * 0.35) });
  }, [bubble, pos]);

  // ── Listen for incoming messages app-wide ──
  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    const sub = subscribeToConversations(async (payload: any) => {
      if (payload?.table !== 'messages') return;
      const msg = payload.new;
      if (!msg?.conversation_id || msg.sender_id === userId || msg.is_deleted) return;
      if (msg.type === 'system' || msg.type === 'call') return;

      // Already looking at this thread? No bubble.
      const onMessages = window.location.pathname.startsWith('/messages');
      if (onMessages && useMessagesStore.getState().activeConversationId === msg.conversation_id && !document.hidden) return;

      // Respect muted conversations.
      const { data: part } = await supabase
        .from('conversation_participants')
        .select('is_muted')
        .eq('conversation_id', msg.conversation_id)
        .eq('user_id', userId)
        .maybeSingle();
      if (part?.is_muted) return;

      const { data: sender } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', msg.sender_id)
        .maybeSingle();

      setBubble((prev) => ({
        conversationId: msg.conversation_id,
        name: sender?.display_name || 'New message',
        avatar: sender?.avatar_url || null,
        preview: previewFor(msg),
        count: prev && prev.conversationId === msg.conversation_id ? prev.count + 1 : 1,
      }));
    });
    return () => sub.unsubscribe();
  }, [userId]);

  // Opening that conversation any other way clears its bubble.
  useEffect(() => {
    return useMessagesStore.subscribe((state) => {
      setBubble((prev) => (prev && state.activeConversationId === prev.conversationId && window.location.pathname.startsWith('/messages') ? null : prev));
    });
  }, []);

  // Pill + auto-dismiss clocks restart on every new message.
  useEffect(() => {
    if (!bubble) return;
    setShowPill(true);
    const pill = setTimeout(() => setShowPill(false), PILL_MS);
    const gone = setTimeout(() => setBubble(null), AUTO_DISMISS_MS);
    return () => { clearTimeout(pill); clearTimeout(gone); };
  }, [bubble?.conversationId, bubble?.count, bubble?.preview]);

  const open = useCallback(() => {
    if (!bubble) return;
    const id = bubble.conversationId;
    setBubble(null);
    router.push(`/messages?conversation=${id}`);
  }, [bubble, router]);

  // ── Drag (pointer events: mouse + touch) ──
  const onPointerDown = (e: React.PointerEvent) => {
    if (!pos) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, startY: e.clientY, originX: pos.x, originY: pos.y, moved: false };
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) + Math.abs(dy) > 6) d.moved = true;
    if (d.moved) setPos({ x: d.originX + dx, y: d.originY + dy });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (!d || !pos) return;
    if (!d.moved) { open(); return; }
    const w = window.innerWidth;
    const h = window.innerHeight;
    // Dropped on the ✕ target at the bottom centre → dismiss.
    if (e.clientY > h - 130 && Math.abs(e.clientX - w / 2) < 60) { setBubble(null); return; }
    setPos({
      x: pos.x + SIZE / 2 >= w / 2 ? w - SIZE - EDGE : EDGE,
      y: Math.min(Math.max(pos.y, 70), h - 150),
    });
  };

  if (!userId || !bubble || !pos) return null;

  const onRight = pos.x + SIZE / 2 >= (typeof window !== 'undefined' ? window.innerWidth / 2 : 0);

  return (
    <>
      {dragging && (
        <div className="fixed z-[69] bottom-16 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-black/70 flex items-center justify-center pointer-events-none">
          <X className="w-6 h-6 text-white" />
        </div>
      )}
      <div
        className="fixed z-[70] touch-none select-none"
        style={{
          left: 0, top: 0, width: SIZE, height: SIZE,
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          transition: dragging ? 'none' : 'transform 0.25s cubic-bezier(.2,.8,.2,1)',
        }}
      >
        <button
          type="button"
          aria-label={`${bubble.count} new message${bubble.count === 1 ? '' : 's'} from ${bubble.name}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => { drag.current = null; setDragging(false); }}
          className="relative w-full h-full rounded-full border-2 border-accent-primary bg-bg-card shadow-xl shadow-black/40 flex items-center justify-center cursor-grab active:cursor-grabbing"
        >
          <UserAvatar avatarUrl={bubble.avatar} displayName={bubble.name} size="lg" />
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center border-2 border-bg-primary">
            {bubble.count > 9 ? '9+' : bubble.count}
          </span>
        </button>
        {showPill && !dragging && (
          <div
            className={`absolute top-1 w-52 rounded-2xl border border-border-primary bg-bg-card px-3 py-2 shadow-xl pointer-events-none ${onRight ? 'right-[64px]' : 'left-[64px]'}`}
          >
            <p className="text-xs font-semibold text-text-primary truncate">{bubble.name}</p>
            <p className="text-xs text-text-muted line-clamp-2">{bubble.preview}</p>
          </div>
        )}
      </div>
    </>
  );
}
