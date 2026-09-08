import { NextRequest } from 'next/server';

/**
 * POST /api/rectification-agent — proxy to the conversational birth-time
 * rectification agent on align-api-v2.
 *
 * Mirrors /api/ai/interpret: the browser never talks to Railway directly, so
 * this works regardless of how CORS_ORIGINS is configured upstream.
 *
 * Runs on nodejs (not edge) because a single turn can include a full
 * rectification sweep (~11s) on top of the model call.
 */
export const runtime = 'nodejs';
export const maxDuration = 60;

const UPSTREAM =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://align-api-v2-production.up.railway.app/api/v1';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authHeader) headers['Authorization'] = authHeader;

  const body = await req.text();

  const upstream = await fetch(`${UPSTREAM}/rectification/agent/chat`, {
    method: 'POST',
    headers,
    body,
  });

  // Pass non-streaming errors (402 paywall, 5xx) straight through so the
  // client can show the real message instead of an empty stream.
  if (!upstream.ok) {
    const text = await upstream.text().catch(() => '');
    return new Response(text || JSON.stringify({ detail: 'Agent unavailable' }), {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') || 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
}
