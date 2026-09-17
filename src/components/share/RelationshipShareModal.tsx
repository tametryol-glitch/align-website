'use client';

// ═══════════════════════════════════════════════════════════════════
// RelationshipShareModal — share a synastry or composite result.
//
// On Align: send to a friend (DM, chart_share message) or post to the
// Cosmic Feed (chart_share post). Off Align: native share sheet / copied
// public link (aligncosmic.com/share, no login needed) or a PNG download.
// Every destination carries the same RelationshipSnapshot, so web and
// mobile render it identically.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react';
import { X, Share2, Copy, Check, Download, Send, Users, Globe, Loader2, ChevronLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { getFriends, getOrCreateConversation, sendMessage } from '@/lib/messagingService';
import { createPost } from '@/lib/feedService';
import { shareCard, copyShareLink, downloadCardAsImage } from '@/lib/shareCardUtils';
import {
  type RelationshipSnapshot,
  relationshipShareUrl,
  relationshipShareTitle,
  relationshipShareText,
} from '@/lib/relationshipShare';
import RelationshipShareCard from './RelationshipShareCard';

type Friend = { id: string; display_name: string; avatar_url: string | null; sun_sign: string | null };

interface Props {
  snapshot: RelationshipSnapshot;
  open: boolean;
  onClose: () => void;
}

export default function RelationshipShareModal({ snapshot, open, onClose }: Props) {
  const { user, profile } = useAuthStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<'menu' | 'friends'>('menu');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [friends, setFriends] = useState<Friend[] | null>(null);
  const [query, setQuery] = useState('');
  const [sentTo, setSentTo] = useState<Record<string, 'sending' | 'sent' | 'error'>>({});
  const [visibility, setVisibility] = useState<'friends' | 'public'>('friends');
  const [posting, setPosting] = useState<'idle' | 'posting' | 'posted' | 'error'>('idle');

  const url = relationshipShareUrl(snapshot);
  const title = relationshipShareTitle(snapshot);

  useEffect(() => {
    if (!open) {
      setView('menu');
      setQuery('');
      setSentTo({});
      setPosting('idle');
    }
  }, [open]);

  useEffect(() => {
    if (view === 'friends' && friends === null) getFriends().then(setFriends);
  }, [view, friends]);

  if (!open) return null;

  const metadata = {
    chartType: snapshot.kind,
    shareType: snapshot.kind,
    relationship: snapshot,
    shareUrl: url,
    sharedByUserId: user?.id,
    sharedByName: profile?.display_name || 'Someone',
  };

  async function handleSend(friend: Friend) {
    if (sentTo[friend.id] === 'sending' || sentTo[friend.id] === 'sent') return;
    setSentTo((m) => ({ ...m, [friend.id]: 'sending' }));
    const convoId = await getOrCreateConversation(friend.id);
    const result = convoId
      ? await sendMessage(convoId, title, 'chart_share', metadata)
      : { success: false };
    setSentTo((m) => ({ ...m, [friend.id]: result.success ? 'sent' : 'error' }));
  }

  async function handlePost() {
    if (!user?.id || posting === 'posting' || posting === 'posted') return;
    setPosting('posting');
    try {
      await createPost({
        userId: user.id,
        type: 'chart_share',
        content: title,
        visibility,
        chartData: { chartType: snapshot.kind, relationship: snapshot, shareUrl: url },
      });
      setPosting('posted');
    } catch {
      setPosting('error');
    }
  }

  async function handleCopy() {
    if (await copyShareLink(url)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      // Clipboard blocked (permissions / insecure context) — let them copy by hand.
      window.prompt('Copy this link:', url);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    await downloadCardAsImage(cardRef);
    setDownloading(false);
  }

  const q = query.trim().toLowerCase();
  const shownFriends = (friends || []).filter((f) => !q || (f.display_name || '').toLowerCase().includes(q));

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-bg-secondary border border-border-primary p-5"
          role="dialog"
          aria-label="Share result"
        >
          <div className="flex items-center justify-between mb-4">
            {view === 'friends' ? (
              <button onClick={() => setView('menu')} className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <h2 className="text-base font-semibold text-text-primary">Share</h2>
            )}
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10" aria-label="Close">
              <X className="w-5 h-5 text-text-muted" />
            </button>
          </div>

          {view === 'menu' ? (
            <>
              <div ref={cardRef} className="mx-auto w-full max-w-[360px] rounded-3xl overflow-hidden">
                <RelationshipShareCard snapshot={snapshot} />
              </div>

              <p className="text-[11px] text-text-muted text-center mt-3">
                Shares first names, scores and signs only — never anyone&apos;s birth details.
              </p>

              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mt-5 mb-2">On Align</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setView('friends')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-bg-tertiary hover:bg-white/10 transition-colors text-left"
                >
                  <Send className="w-5 h-5 text-accent-primary" />
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-text-primary">Send to a friend</span>
                    <span className="block text-xs text-text-muted">Share privately in Messages</span>
                  </span>
                </button>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-tertiary">
                  {visibility === 'friends' ? <Users className="w-5 h-5 text-green-400" /> : <Globe className="w-5 h-5 text-green-400" />}
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-text-primary">Post to Cosmic Feed</span>
                    <button
                      onClick={() => setVisibility((v) => (v === 'friends' ? 'public' : 'friends'))}
                      disabled={posting === 'posted'}
                      className="text-xs text-accent-secondary hover:underline"
                    >
                      {visibility === 'friends' ? 'Friends only' : 'Public'} · change
                    </button>
                  </span>
                  <button
                    onClick={handlePost}
                    disabled={posting === 'posting' || posting === 'posted' || !user}
                    className="btn-primary text-xs px-3 py-1.5 disabled:opacity-60"
                  >
                    {posting === 'posting' ? <Loader2 className="w-4 h-4 animate-spin" />
                      : posting === 'posted' ? 'Posted ✓'
                      : posting === 'error' ? 'Retry' : 'Post'}
                  </button>
                </div>
              </div>

              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mt-5 mb-2">Anywhere else</h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => shareCard(title, relationshipShareText(snapshot), url)}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-bg-tertiary hover:bg-white/10 transition-colors"
                >
                  <Share2 className="w-5 h-5 text-text-primary" />
                  <span className="text-xs text-text-secondary">Share</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-bg-tertiary hover:bg-white/10 transition-colors"
                >
                  {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-text-primary" />}
                  <span className="text-xs text-text-secondary">{copied ? 'Copied' : 'Copy link'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-bg-tertiary hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 text-text-primary" />}
                  <span className="text-xs text-text-secondary">Image</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search friends"
                className="input mb-3"
                autoFocus
              />
              {friends === null ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-text-muted" /></div>
              ) : shownFriends.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-8">
                  {friends.length === 0 ? 'Add friends on Align to send them results.' : 'No friends match that search.'}
                </p>
              ) : (
                <div className="divide-y divide-border-primary">
                  {shownFriends.map((f) => {
                    const state = sentTo[f.id];
                    return (
                      <div key={f.id} className="flex items-center gap-3 py-2.5">
                        <UserAvatar avatarUrl={f.avatar_url} displayName={f.display_name} size="sm" />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm text-text-primary truncate">{f.display_name}</span>
                          {f.sun_sign && <span className="block text-xs text-text-muted">{f.sun_sign} Sun</span>}
                        </span>
                        <button
                          onClick={() => handleSend(f)}
                          disabled={state === 'sending' || state === 'sent'}
                          className={state === 'sent' ? 'text-xs text-green-400 px-3 py-1.5' : 'btn-primary text-xs px-3 py-1.5 disabled:opacity-60'}
                        >
                          {state === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" />
                            : state === 'sent' ? 'Sent ✓'
                            : state === 'error' ? 'Retry' : 'Send'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
