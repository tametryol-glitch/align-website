'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { MessageCircle, Send, ArrowLeft, Search } from 'lucide-react';
import { LoadingCosmic } from '@/components/ui/LoadingCosmic';

interface Conversation {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_avatar: string | null;
  participant_sun_sign: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function MessagesPage() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) loadConversations();
    else setLoading(false);
  }, [user]);

  useEffect(() => {
    if (activeConv) loadMessages(activeConv.id);
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time subscription
  useEffect(() => {
    if (!activeConv || !user) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`messages-${activeConv.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages',
        filter: `conversation_id=eq.${activeConv.id}`,
      }, (payload) => {
        const newMsg = payload.new as Message;
        if (newMsg.sender_id !== user.id) {
          setMessages(prev => [...prev, newMsg]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConv, user]);

  async function loadConversations() {
    if (!user) return;
    setLoading(true);
    const supabase = createClient();

    // Get conversations where user is a participant
    const { data: convs } = await supabase
      .from('conversations')
      .select('id, participant1_id, participant2_id, last_message, last_message_at')
      .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false });

    if (convs && convs.length > 0) {
      // Get other participant profiles
      const otherIds = convs.map(c =>
        c.participant1_id === user.id ? c.participant2_id : c.participant1_id
      );
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, sun_sign')
        .in('id', otherIds);

      const profileMap: Record<string, any> = {};
      profiles?.forEach(p => { profileMap[p.id] = p; });

      // Get unread counts
      const { data: unreads } = await supabase
        .from('direct_messages')
        .select('conversation_id')
        .eq('is_read', false)
        .neq('sender_id', user.id);

      const unreadMap: Record<string, number> = {};
      unreads?.forEach(u => {
        unreadMap[u.conversation_id] = (unreadMap[u.conversation_id] || 0) + 1;
      });

      setConversations(convs.map(c => {
        const otherId = c.participant1_id === user.id ? c.participant2_id : c.participant1_id;
        const profile = profileMap[otherId];
        return {
          id: c.id,
          participant_id: otherId,
          participant_name: profile?.display_name || 'Unknown',
          participant_avatar: profile?.avatar_url || null,
          participant_sun_sign: profile?.sun_sign || null,
          last_message: c.last_message,
          last_message_at: c.last_message_at,
          unread_count: unreadMap[c.id] || 0,
        };
      }));
    }
    setLoading(false);
  }

  async function loadMessages(conversationId: string) {
    const supabase = createClient();
    const { data } = await supabase
      .from('direct_messages')
      .select('id, sender_id, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(100);
    setMessages(data || []);

    // Mark as read
    if (user) {
      await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !activeConv || !newMessage.trim()) return;
    setSending(true);

    const supabase = createClient();
    const content = newMessage.trim();
    setNewMessage('');

    // Optimistic update
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      sender_id: user.id,
      content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);

    const { data } = await supabase
      .from('direct_messages')
      .insert({
        conversation_id: activeConv.id,
        sender_id: user.id,
        content,
      })
      .select()
      .single();

    // Update optimistic msg with real data
    if (data) {
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? data : m));
    }

    // Update conversation last message
    await supabase
      .from('conversations')
      .update({ last_message: content, last_message_at: new Date().toISOString() })
      .eq('id', activeConv.id);

    setSending(false);
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto card text-center py-12">
        <p className="text-text-muted">Please sign in to access messages</p>
      </div>
    );
  }

  const filtered = searchQuery
    ? conversations.filter(c => c.participant_name.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-text-primary mb-6 flex items-center gap-3">
        <MessageCircle className="w-7 h-7 text-accent-primary" />
        Messages
      </h1>

      {loading ? (
        <LoadingCosmic label="Loading messages..." />
      ) : (
        <div className="flex gap-4 h-[calc(100vh-240px)] min-h-[400px]">
          {/* Conversation list */}
          <div className={`w-full sm:w-80 flex-shrink-0 flex flex-col border border-border-primary rounded-xl overflow-hidden bg-bg-card ${
            activeConv ? 'hidden sm:flex' : 'flex'
          }`}>
            {/* Search */}
            <div className="p-3 border-b border-border-primary">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="input pl-9 py-2 text-sm"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <MessageCircle className="w-8 h-8 text-text-muted mx-auto mb-2" />
                  <p className="text-sm text-text-muted">No conversations yet</p>
                  <p className="text-xs text-text-muted mt-1">Add friends to start messaging</p>
                </div>
              ) : (
                filtered.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConv(conv)}
                    className={`w-full flex items-center gap-3 p-3 hover:bg-bg-tertiary transition-colors ${
                      activeConv?.id === conv.id ? 'bg-bg-tertiary' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center flex-shrink-0">
                      {conv.participant_avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={conv.participant_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-accent-primary">
                          {conv.participant_name[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-text-primary truncate">{conv.participant_name}</p>
                        {conv.unread_count > 0 && (
                          <span className="w-5 h-5 rounded-full bg-accent-primary flex items-center justify-center text-[10px] text-white font-bold">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      {conv.last_message && (
                        <p className="text-xs text-text-muted truncate">{conv.last_message}</p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className={`flex-1 flex flex-col border border-border-primary rounded-xl overflow-hidden bg-bg-card ${
            activeConv ? 'flex' : 'hidden sm:flex'
          }`}>
            {activeConv ? (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 p-4 border-b border-border-primary">
                  <button onClick={() => setActiveConv(null)} className="sm:hidden p-1">
                    <ArrowLeft className="w-5 h-5 text-text-muted" />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-accent-muted flex items-center justify-center">
                    {activeConv.participant_avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={activeConv.participant_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-accent-primary">
                        {activeConv.participant_name[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{activeConv.participant_name}</p>
                    {activeConv.participant_sun_sign && (
                      <p className="text-[10px] text-text-muted">{activeConv.participant_sun_sign}</p>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.sender_id !== user.id && (
                        <div className="w-7 h-7 rounded-full bg-accent-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {activeConv.participant_avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={activeConv.participant_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold text-accent-primary">
                              {activeConv.participant_name[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                      )}
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                        msg.sender_id === user.id
                          ? 'bg-accent-primary text-white rounded-br-md'
                          : 'bg-bg-tertiary text-text-primary rounded-bl-md'
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${
                          msg.sender_id === user.id ? 'text-white/60' : 'text-text-muted'
                        }`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="p-3 border-t border-border-primary flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="input flex-1 py-2.5"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="btn-primary px-4"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-text-muted mx-auto mb-3" />
                  <p className="text-text-muted">Select a conversation</p>
                  <p className="text-xs text-text-muted mt-1">or add friends to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
