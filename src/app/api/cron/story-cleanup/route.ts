// =============================================================================
// GET /api/cron/story-cleanup
// =============================================================================
// Stories vanish from every client at expires_at (RLS hides them), but their
// photos and videos stayed in the story-media bucket forever. This deletes the
// media of expired stories, then the rows themselves (views and reactions
// cascade). DM story replies keep working: they carry their own
// story_expires_at and show "Story no longer available" once it has passed.
//
// A 10-minute grace keeps a video from disappearing under someone who opened
// it seconds before it expired.
//
// Rows are only deleted once their media removal succeeded, so a storage
// hiccup is retried on the next run instead of leaving an orphaned file.
//
// Auth: same CRON_SECRET Bearer pattern as the other cron routes.
// =============================================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUCKET = 'story-media';
const GRACE_MS = 10 * 60 * 1000;
const BATCH = 500;          // rows per run; the hourly schedule catches up
const REMOVE_CHUNK = 100;   // storage.remove() paths per request

/** Object path inside the bucket from a public URL, or null if it isn't one. */
// Not exported: a route file may only export route handlers and config.
function storyPathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = `/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  const path = url.slice(i + marker.length).split('?')[0];
  return path ? decodeURIComponent(path) : null;
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY' }, { status: 500 });
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });
  const cutoff = new Date(Date.now() - GRACE_MS).toISOString();

  const { data: expired, error } = await admin
    .from('stories')
    .select('id, media_url, thumbnail_url')
    .lt('expires_at', cutoff)
    .order('expires_at', { ascending: true })
    .limit(BATCH);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!expired || expired.length === 0) {
    return NextResponse.json({ ok: true, stories: 0, files: 0 });
  }

  const deletable: string[] = [];
  let files = 0;
  const failures: string[] = [];

  // Text stories have no media and can go straight away.
  // A video story has two files: the video and its rail poster.
  const withMedia: { id: string; paths: string[] }[] = [];
  for (const s of expired) {
    const paths = [storyPathFromUrl(s.media_url), storyPathFromUrl(s.thumbnail_url)]
      .filter((x): x is string => !!x);
    if (paths.length) withMedia.push({ id: s.id, paths });
    else deletable.push(s.id);
  }

  for (let i = 0; i < withMedia.length; i += REMOVE_CHUNK / 2) {
    const chunk = withMedia.slice(i, i + REMOVE_CHUNK / 2);
    const paths = chunk.flatMap((c) => c.paths);
    const { error: rmErr } = await admin.storage.from(BUCKET).remove(paths);
    if (rmErr) {
      failures.push(rmErr.message);
      continue; // keep these rows; retried next run
    }
    files += paths.length;
    deletable.push(...chunk.map((c) => c.id));
  }

  // Chunked: 500 UUIDs in one ?id=in.(...) filter would overflow the URL.
  let stories = 0;
  for (let i = 0; i < deletable.length; i += REMOVE_CHUNK) {
    const ids = deletable.slice(i, i + REMOVE_CHUNK);
    const { error: delErr, count } = await admin
      .from('stories')
      .delete({ count: 'exact' })
      .in('id', ids);
    if (delErr) return NextResponse.json({ error: delErr.message, stories, files }, { status: 500 });
    stories += count ?? ids.length;
  }

  return NextResponse.json({ ok: failures.length === 0, stories, files, failures });
}
