import { NextRequest } from 'next/server';

export const runtime = 'edge';

const UPSTREAM = process.env.NEXT_PUBLIC_API_URL || 'https://align-api-v2-production.up.railway.app/api/v1';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authHeader) headers['Authorization'] = authHeader;

  const body = await req.text();

  const upstream = await fetch(`${UPSTREAM}/ai/interpret`, {
    method: 'POST',
    headers,
    body,
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') || 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
