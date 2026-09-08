import { NextRequest } from 'next/server';

/**
 * POST /api/guide-agent — proxy to the in-app guide on align-api-v2.
 *
 * Same shape as /api/rectification-agent: keeps the browser off Railway
 * directly so upstream CORS config can't break the widget.
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

  const upstream = await fetch(`${UPSTREAM}/guide/chat`, {
    method: 'POST',
    headers,
    body,
  });

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => '');
    return new Response(text || JSON.stringify({ detail: 'Guide unavailable' }), {
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
