import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

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

/* ── GET: all courses with their lessons ─────────────────────── */
export async function GET(req: NextRequest) {
  try {
    const user = await verifyAdmin(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = getAdminClient();
    const { data, error } = await admin
      .from('learn_courses')
      .select('*, learn_lessons(*)')
      .order('level_order', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Sort each course's lessons by sort_order for a stable editor view.
    const courses = (data || []).map((c: any) => ({
      ...c,
      learn_lessons: (c.learn_lessons || []).slice().sort(
        (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
      ),
    }));

    return NextResponse.json({ courses });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/* ── POST: create a course, or a lesson (?type=lesson) ───────── */
export async function POST(req: NextRequest) {
  try {
    const user = await verifyAdmin(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const body = await req.json();
    const admin = getAdminClient();

    if (type === 'lesson') {
      // Upsert a lesson (POST = create/replace by id).
      if (!body.id || !body.course_id) {
        return NextResponse.json({ error: 'Lesson id and course_id are required' }, { status: 400 });
      }
      const lesson = {
        id: body.id,
        course_id: body.course_id,
        title: body.title || '',
        duration_minutes: body.duration_minutes ?? null,
        content: body.content ?? '',
        objectives: body.objectives || [],
        key_terms: body.key_terms || [],
        chart_focus: body.chart_focus ?? null,
        quiz: body.quiz || [],
        image_url: body.image_url ?? null,
        sort_order: body.sort_order ?? 0,
      };
      const { data, error } = await admin
        .from('learn_lessons')
        .upsert(lesson, { onConflict: 'id' })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ lesson: data });
    }

    // Create a course.
    if (!body.id) return NextResponse.json({ error: 'Course id is required' }, { status: 400 });
    const course = {
      id: body.id,
      title: body.title || '',
      description: body.description ?? '',
      level: body.level ?? null,
      level_order: body.level_order ?? 0,
      level_label: body.level_label ?? null,
      is_free: body.is_free ?? false,
      image_emoji: body.image_emoji ?? null,
      image_url: body.image_url ?? null,
      prerequisite_id: body.prerequisite_id || null,
      sort_order: body.sort_order ?? 0,
    };
    const { data, error } = await admin
      .from('learn_courses')
      .insert(course)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ course: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/* ── PUT: update a course, or upsert a lesson (?type=lesson) ──── */
export async function PUT(req: NextRequest) {
  try {
    const user = await verifyAdmin(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const body = await req.json();
    const admin = getAdminClient();

    if (type === 'lesson') {
      if (!body.id || !body.course_id) {
        return NextResponse.json({ error: 'Lesson id and course_id are required' }, { status: 400 });
      }
      const lesson = {
        id: body.id,
        course_id: body.course_id,
        title: body.title || '',
        duration_minutes: body.duration_minutes ?? null,
        content: body.content ?? '',
        objectives: body.objectives || [],
        key_terms: body.key_terms || [],
        chart_focus: body.chart_focus ?? null,
        quiz: body.quiz || [],
        image_url: body.image_url ?? null,
        sort_order: body.sort_order ?? 0,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await admin
        .from('learn_lessons')
        .upsert(lesson, { onConflict: 'id' })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ lesson: data });
    }

    if (!body.id) return NextResponse.json({ error: 'Missing course id' }, { status: 400 });

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.level !== undefined) updates.level = body.level;
    if (body.level_order !== undefined) updates.level_order = body.level_order;
    if (body.level_label !== undefined) updates.level_label = body.level_label;
    if (body.is_free !== undefined) updates.is_free = body.is_free;
    if (body.image_emoji !== undefined) updates.image_emoji = body.image_emoji;
    if (body.image_url !== undefined) updates.image_url = body.image_url;
    if (body.prerequisite_id !== undefined) updates.prerequisite_id = body.prerequisite_id || null;
    if (body.sort_order !== undefined) updates.sort_order = body.sort_order;

    const { data, error } = await admin
      .from('learn_courses')
      .update(updates)
      .eq('id', body.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ course: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/* ── DELETE: a course (?id=) or a lesson (?type=lesson&id=) ───── */
export async function DELETE(req: NextRequest) {
  try {
    const user = await verifyAdmin(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const admin = getAdminClient();

    if (type === 'lesson') {
      const { error } = await admin.from('learn_lessons').delete().eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    // Deleting a course also removes its lessons (FK), but delete explicitly to be safe.
    await admin.from('learn_lessons').delete().eq('course_id', id);
    const { error } = await admin.from('learn_courses').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
