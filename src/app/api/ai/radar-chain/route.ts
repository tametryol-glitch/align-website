import { NextRequest } from 'next/server';

export const runtime = 'edge';

const UPSTREAM = process.env.NEXT_PUBLIC_API_URL || 'https://align-api-v2-production.up.railway.app/api/v1';

// Streams the Transit Radar's house-ruler chain reading from the API (same pass-through as /api/ai/interpret).
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authHeader) headers['Authorization'] = authHeader;

  const upstream = await fetch(`${UPSTREAM}/radar/chain-reading`, {
    method: 'POST',
    headers,
    body: await req.text(),
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') || 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
