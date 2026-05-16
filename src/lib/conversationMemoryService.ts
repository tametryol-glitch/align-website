import { createClient } from '@/lib/supabase';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ConversationSession {
  id: string;
  user_id: string;
  messages: ConversationMessage[];
  topic_summary: string;
  placements_discussed: string[];
  systems_used: string[];
  created_at: string;
  updated_at: string;
}

export interface ConversationDigest {
  promptText: string;
  recentTopics: string[];
  sessionCount: number;
}

const STORAGE_KEY = 'align_ai_conversations';
const MAX_SESSIONS_STORED = 20;
const MAX_MESSAGES_PER_SESSION = 50;
const MAX_DIGEST_SESSIONS = 5;

function readLocalSessions(): ConversationSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ConversationSession[];
  } catch {
    return [];
  }
}

function writeLocalSessions(sessions: ConversationSession[]): void {
  if (typeof window === 'undefined') return;
  try {
    const trimmed = sessions.slice(-MAX_SESSIONS_STORED);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {}
}

async function syncSessionToSupabase(session: ConversationSession): Promise<void> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      id: session.id,
      user_id: user.id,
      messages: session.messages,
      topic_summary: session.topic_summary,
      placements_discussed: session.placements_discussed,
      systems_used: session.systems_used,
      updated_at: new Date().toISOString(),
    };

    await supabase
      .from('ai_conversation_sessions')
      .upsert(payload, { onConflict: 'id' });
  } catch {}
}

async function loadSessionsFromSupabase(): Promise<ConversationSession[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('ai_conversation_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(MAX_SESSIONS_STORED);

    if (error || !data) return [];
    return data as ConversationSession[];
  } catch {
    return [];
  }
}

function extractTopicSummary(messages: ConversationMessage[]): string {
  const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);
  if (userMessages.length === 0) return 'General chart discussion';

  const first = userMessages[0].slice(0, 80);
  if (userMessages.length === 1) return first;
  const last = userMessages[userMessages.length - 1].slice(0, 80);
  return `${first} → ${last}`;
}

function extractPlacementsDiscussed(messages: ConversationMessage[]): string[] {
  const placements = new Set<string>();
  const pattern = /\b(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto|Chiron|North Node|South Node|Ascendant|MC)\s+in\s+(Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)/gi;

  for (const msg of messages.filter(m => m.role === 'assistant')) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(msg.content)) !== null) {
      placements.add(`${match[1]} in ${match[2]}`);
    }
  }

  return Array.from(placements);
}

function extractSystemsUsed(messages: ConversationMessage[]): string[] {
  const systems = new Set<string>();
  const keywords: Record<string, string> = {
    'progressed': 'Progressed Chart',
    'solar return': 'Solar Return',
    'lunar return': 'Lunar Return',
    'synastry': 'Synastry',
    'composite': 'Composite',
    'numerology': 'Numerology',
    'human design': 'Human Design',
    'starseed': 'Starseed',
    'firdaria': 'Firdaria',
    'zodiacal releasing': 'Zodiacal Releasing',
    'transit': 'Transits',
    'financial': 'Financial Astrology',
  };

  for (const msg of messages.filter(m => m.role === 'assistant')) {
    const lower = msg.content.toLowerCase();
    for (const [kw, label] of Object.entries(keywords)) {
      if (lower.includes(kw)) systems.add(label);
    }
  }

  return Array.from(systems);
}

export function createSession(userId: string): ConversationSession {
  return {
    id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    user_id: userId,
    messages: [],
    topic_summary: '',
    placements_discussed: [],
    systems_used: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function saveSession(session: ConversationSession): Promise<void> {
  session.topic_summary = extractTopicSummary(session.messages);
  session.placements_discussed = extractPlacementsDiscussed(session.messages);
  session.systems_used = extractSystemsUsed(session.messages);
  session.updated_at = new Date().toISOString();

  if (session.messages.length > MAX_MESSAGES_PER_SESSION) {
    session.messages = session.messages.slice(-MAX_MESSAGES_PER_SESSION);
  }

  const existing = readLocalSessions();
  const idx = existing.findIndex(s => s.id === session.id);
  if (idx >= 0) {
    existing[idx] = session;
  } else {
    existing.push(session);
  }
  writeLocalSessions(existing);

  syncSessionToSupabase(session).catch(() => {});
}

export async function loadSessions(): Promise<ConversationSession[]> {
  const local = readLocalSessions();

  try {
    const remote = await loadSessionsFromSupabase();
    if (remote.length > 0) {
      const localIds = new Set(local.map(s => s.id));
      for (const r of remote) {
        if (!localIds.has(r.id)) {
          local.push(r);
        }
      }
      local.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }
  } catch {}

  return local.slice(0, MAX_SESSIONS_STORED);
}

export async function getRecentSession(): Promise<ConversationSession | null> {
  const sessions = readLocalSessions();
  if (sessions.length === 0) return null;

  const latest = sessions[sessions.length - 1];
  const ageMs = Date.now() - new Date(latest.updated_at).getTime();
  const TWO_HOURS = 2 * 60 * 60 * 1000;

  if (ageMs < TWO_HOURS && latest.messages.length > 0) {
    return latest;
  }

  return null;
}

export async function buildConversationMemoryDigest(): Promise<ConversationDigest> {
  const sessions = readLocalSessions();

  if (sessions.length === 0) {
    return { promptText: '', recentTopics: [], sessionCount: 0 };
  }

  const recentSessions = sessions.slice(-MAX_DIGEST_SESSIONS);
  const recentTopics = recentSessions
    .filter(s => s.topic_summary)
    .map(s => s.topic_summary);

  const lines: string[] = [];
  lines.push(`=== CONVERSATION MEMORY (${sessions.length} previous sessions) ===`);
  lines.push(`This user has chatted with you ${sessions.length} time(s) before. Here is what you discussed:`);
  lines.push('');

  for (const session of recentSessions) {
    const date = new Date(session.created_at).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
    });
    const msgCount = session.messages.length;
    lines.push(`Session (${date}, ${msgCount} messages): ${session.topic_summary}`);

    if (session.placements_discussed.length > 0) {
      lines.push(`  Placements covered: ${session.placements_discussed.join(', ')}`);
    }
    if (session.systems_used.length > 0) {
      lines.push(`  Systems used: ${session.systems_used.join(', ')}`);
    }
  }

  const allPlacements = new Set<string>();
  for (const s of sessions) {
    for (const p of s.placements_discussed) allPlacements.add(p);
  }

  if (allPlacements.size > 0) {
    lines.push('');
    lines.push(`Placements you have ALREADY explained across all sessions: ${Array.from(allPlacements).join(', ')}`);
    lines.push('IMPORTANT: Do NOT re-explain these placements from scratch. If the user asks about one, add NEW depth, a different angle, or connect it to their current question. Never repeat yourself.');
  }

  lines.push('');
  lines.push('Use this memory naturally — reference past conversations when relevant ("As we discussed last time..." or "Building on what I told you about your Moon..."). This makes the user feel genuinely known.');

  return {
    promptText: lines.join('\n'),
    recentTopics,
    sessionCount: sessions.length,
  };
}

export async function clearAllConversations(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('ai_conversation_sessions')
        .delete()
        .eq('user_id', user.id);
    }
  } catch {}
}
