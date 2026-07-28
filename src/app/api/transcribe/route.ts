import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/transcribe — word-level transcription for auto-captions.
 *
 * FREE BY DEFAULT: tries the self-hosted Whisper sidecar (WHISPER_URL, default
 * http://127.0.0.1:8081) first — no OpenAI credits. Only if the sidecar is
 * unreachable does it fall back to the paid OpenAI Whisper API (when
 * OPENAI_API_KEY is set), preserving the old behaviour as a safety net.
 *
 * Cost guardrails apply to the OpenAI fallback only (local is free):
 *  - TRANSCRIBE_MAX_MB / TRANSCRIBE_MAX_SECONDS / TRANSCRIBE_DAILY_LIMIT
 *
 * Body: multipart/form-data with `file` (audio), optional `durationSec`, `language`.
 * Returns: { words: [{ word, start, end }], text, engine: 'local' | 'openai' }.
 */

const WHISPER_URL = process.env.WHISPER_URL || 'http://127.0.0.1:8081';
const WHISPER_TOKEN = process.env.WHISPER_TOKEN || '';
const MAX_MB = Number(process.env.TRANSCRIBE_MAX_MB ?? 12);
const MAX_SECONDS = Number(process.env.TRANSCRIBE_MAX_SECONDS ?? 300);
const DAILY_LIMIT = Number(process.env.TRANSCRIBE_DAILY_LIMIT ?? 50);

// Best-effort per-user daily counter. Per-instance in memory, so it's a soft
// brake on serverless (not a hard guarantee); the size/duration caps are the
// hard cost ceilings. For a strict guarantee, back this with a DB table.
const usage = new Map<string, { day: string; count: number }>();

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function getUserId(): Promise<string | null> {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set() {},
          remove() {},
        },
      },
    );
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

/** Returns false if the user is over their daily limit (and counts this call). */
function withinDailyLimit(uid: string): boolean {
  const day = today();
  const e = usage.get(uid);
  if (!e || e.day !== day) {
    usage.set(uid, { day, count: 1 });
    if (usage.size > 50_000) {
      usage.forEach((v, k) => { if (v.day !== day) usage.delete(k); });
    }
    return true;
  }
  if (e.count >= DAILY_LIMIT) return false;
  e.count++;
  return true;
}

export async function POST(request: NextRequest) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
  }

  // ── 1. Free path: self-hosted Whisper sidecar (no credits) ──────────────
  try {
    const local = new FormData();
    local.append('file', file, (file as File).name || 'audio.mp3');
    const r = await fetch(`${WHISPER_URL}/transcribe`, {
      method: 'POST', body: local, signal: AbortSignal.timeout(120_000),
      headers: WHISPER_TOKEN ? { Authorization: `Bearer ${WHISPER_TOKEN}` } : undefined,
    });
    if (r.ok) {
      const data = await r.json();
      return NextResponse.json({ words: data.words ?? [], text: data.text ?? '', engine: 'local' });
    }
  } catch {
    // sidecar unreachable → fall through to the paid fallback
  }

  // ── 2. Paid fallback: OpenAI Whisper (only if configured) ───────────────
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: 'Auto-captions unavailable: start the local Whisper sidecar (WHISPER_URL) or set OPENAI_API_KEY.' },
      { status: 503 },
    );
  }

  if (file.size > MAX_MB * 1024 * 1024) {
    return NextResponse.json(
      { error: `Audio is too large to caption (max ${MAX_MB}MB). Trim the video and try again.` },
      { status: 413 },
    );
  }

  const durationRaw = form.get('durationSec');
  const durationSec = typeof durationRaw === 'string' ? parseFloat(durationRaw) : NaN;
  if (Number.isFinite(durationSec) && durationSec > MAX_SECONDS) {
    return NextResponse.json(
      { error: `Video is too long for auto-captions (max ${Math.round(MAX_SECONDS / 60)} min). Trim it and try again.` },
      { status: 413 },
    );
  }

  // Per-user daily cap (soft, best-effort).
  const uid = await getUserId();
  if (uid && !withinDailyLimit(uid)) {
    return NextResponse.json(
      { error: `Daily caption limit reached (${DAILY_LIMIT}/day). Try again tomorrow.` },
      { status: 429 },
    );
  }

  const oa = new FormData();
  oa.append('file', file, 'audio.wav');
  oa.append('model', 'whisper-1');
  oa.append('response_format', 'verbose_json');
  oa.append('timestamp_granularities[]', 'word');
  const language = form.get('language');
  if (typeof language === 'string' && language) oa.append('language', language);

  try {
    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: oa,
      signal: AbortSignal.timeout(55_000),
    });

    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
      return NextResponse.json({ error: 'Transcription failed', detail }, { status: 502 });
    }

    const data = await res.json();
    const words = Array.isArray(data.words)
      ? data.words.map((w: { word: string; start: number; end: number }) => ({
          word: w.word,
          start: w.start,
          end: w.end,
        }))
      : [];
    return NextResponse.json({ words, text: data.text ?? '' });
  } catch (e) {
    return NextResponse.json(
      { error: 'Transcription request failed', detail: e instanceof Error ? e.message : 'unknown' },
      { status: 502 },
    );
  }
}
