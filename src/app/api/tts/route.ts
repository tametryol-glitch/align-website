/**
 * POST /api/tts — AI voiceover proxy to the self-hosted Kokoro TTS server.
 *
 * Body: { text, voice?, speed?, format? } → returns the generated audio.
 * Proxies to KOKORO_URL (default http://127.0.0.1:8080), so it works wherever
 * the Next server can reach the TTS sidecar (local dev, or a deployed sidecar
 * via the KOKORO_URL env). Keeps the CPU-bound model off the client and hides
 * the token.
 */

import { NextRequest, NextResponse } from 'next/server';

// .trim() guards against a stray newline/space in the dashboard env value —
// the sidecar compares the bearer token byte-for-byte, so trailing whitespace
// would 401 every call.
const KOKORO_URL = (process.env.KOKORO_URL || 'http://127.0.0.1:8080').trim();
const KOKORO_TOKEN = (process.env.KOKORO_TOKEN || '').trim();
const MAX_CHARS = 1200;

// Legacy callers (and stored records) may still use OpenAI voice names; the
// Kokoro sidecar 400s on those. Map them to Kokoro equivalents. Names already
// in Kokoro form pass through unchanged.
const OPENAI_TO_KOKORO: Record<string, string> = {
  nova: 'af_heart', shimmer: 'af_sky', alloy: 'af_bella', echo: 'am_michael',
  fable: 'bm_fable', onyx: 'am_onyx', coral: 'af_jessica', sage: 'bm_george',
  ash: 'am_adam', ballad: 'bf_emma',
};

export async function POST(req: NextRequest) {
  try {
    const { text, voice, speed, format } = await req.json();
    const clean = (text as string || '').trim();
    if (!clean) return NextResponse.json({ error: 'No text provided.' }, { status: 400 });
    if (clean.length > MAX_CHARS) {
      return NextResponse.json({ error: `Text too long (max ${MAX_CHARS} characters).` }, { status: 400 });
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (KOKORO_TOKEN) headers.Authorization = `Bearer ${KOKORO_TOKEN}`;

    const resp = await fetch(`${KOKORO_URL}/tts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ text: clean, voice: OPENAI_TO_KOKORO[voice] || voice || 'af_heart', speed: speed || 1, format: format || 'mp3' }),
    });

    if (!resp.ok) {
      const msg = await resp.text().catch(() => '');
      return NextResponse.json({ error: `TTS server error (${resp.status}). ${msg.slice(0, 200)}` }, { status: 502 });
    }

    const audio = await resp.arrayBuffer();
    return new NextResponse(audio, {
      status: 200,
      headers: {
        'Content-Type': resp.headers.get('content-type') || 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e: any) {
    // ECONNREFUSED etc. — the sidecar isn't reachable.
    return NextResponse.json({ error: `Voiceover unavailable: ${e?.message || 'TTS server not reachable'}` }, { status: 503 });
  }
}
