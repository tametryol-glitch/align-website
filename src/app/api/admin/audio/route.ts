/**
 * /api/admin/audio — admin-managed video-editor audio library.
 *
 *  GET    → list all tracks (active + inactive) for the admin panel
 *  POST   → multipart/form-data { file, name, mood, kind } → uploads the audio
 *           file into the public `cosmic-videos` bucket (music/ or sfx/ prefix)
 *           and inserts an audio_tracks row. Returns the created track.
 *  PATCH  → JSON { id, is_active?, name?, mood?, sort_order? } → update a row.
 *  DELETE → JSON { id } → remove the row and its stored file.
 *
 * Admin is verified server-side (profiles.is_admin) exactly like the blog API.
 * Uploads use the service role, which bypasses storage RLS.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { randomUUID } from 'crypto';
import { isValidCategory } from '@/lib/audioCategories';

const BUCKET = 'cosmic-videos';
const MAX_BYTES = 20 * 1024 * 1024; // 20 MB
const ALLOWED = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/webm'];

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

function getAuthClient(req: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return req.cookies.get(name)?.value; },
        set() {},
        remove() {},
      },
    },
  );
}

async function verifyAdmin(req: NextRequest) {
  const supabase = getAuthClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = getAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) return null;
  return user;
}

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAdmin(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = getAdminClient();
    const { data, error } = await admin
      .from('audio_tracks')
      .select('*')
      .order('kind', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ tracks: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to list tracks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAdmin(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const form = await req.formData();
    const file = form.get('file');
    const name = (form.get('name') as string || '').trim();
    const mood = (form.get('mood') as string || '').trim();
    const category = (form.get('category') as string || '').trim();
    const kind = (form.get('kind') as string || 'music').trim();
    const durationSeconds = parseFloat(form.get('durationSeconds') as string) || 0;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: 'A track name is required.' }, { status: 400 });
    }
    if (kind !== 'music' && kind !== 'sfx') {
      return NextResponse.json({ error: 'kind must be "music" or "sfx".' }, { status: 400 });
    }
    if (!isValidCategory(category)) {
      return NextResponse.json({ error: 'Unknown category.' }, { status: 400 });
    }
    if (file.type && !ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported audio type. Use MP3, WAV, M4A/AAC, or OGG.' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Audio file is too large (max 20 MB).' }, { status: 400 });
    }

    const ext = (file.name.split('.').pop() || 'mp3').toLowerCase().replace(/[^a-z0-9]/g, '') || 'mp3';
    const prefix = kind === 'sfx' ? 'sfx' : 'music';
    const path = `${prefix}/${Date.now()}-${randomUUID()}.${ext}`;

    const admin = getAdminClient();
    const bytes = Buffer.from(await file.arrayBuffer());

    const { error: uploadErr } = await admin.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: file.type || 'audio/mpeg', upsert: false });

    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    }

    // Place new tracks after existing ones of the same kind.
    const { data: maxRow } = await admin
      .from('audio_tracks')
      .select('sort_order')
      .eq('kind', kind)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextOrder = (maxRow?.sort_order ?? 0) + 1;

    const { data: track, error: insertErr } = await admin
      .from('audio_tracks')
      .insert({
        name,
        mood,
        category,
        kind,
        storage_path: path,
        duration_seconds: durationSeconds,
        sort_order: nextOrder,
        is_active: true,
      })
      .select()
      .single();

    if (insertErr) {
      // Roll back the orphaned upload so we don't leave a dangling file.
      await admin.storage.from(BUCKET).remove([path]);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ track });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await verifyAdmin(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { id, ...rest } = body || {};
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const patch: Record<string, unknown> = {};
    if (typeof rest.is_active === 'boolean') patch.is_active = rest.is_active;
    if (typeof rest.name === 'string') patch.name = rest.name.trim();
    if (typeof rest.mood === 'string') patch.mood = rest.mood.trim();
    if (typeof rest.category === 'string') {
      if (!isValidCategory(rest.category.trim())) {
        return NextResponse.json({ error: 'Unknown category.' }, { status: 400 });
      }
      patch.category = rest.category.trim();
    }
    if (typeof rest.sort_order === 'number') patch.sort_order = rest.sort_order;
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data, error } = await admin
      .from('audio_tracks')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ track: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await verifyAdmin(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const admin = getAdminClient();
    const { data: row } = await admin
      .from('audio_tracks')
      .select('storage_path')
      .eq('id', id)
      .single();

    const { error } = await admin.from('audio_tracks').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Best-effort file cleanup (don't fail the request if the object is gone).
    if (row?.storage_path) {
      await admin.storage.from(BUCKET).remove([row.storage_path]);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Delete failed' }, { status: 500 });
  }
}
