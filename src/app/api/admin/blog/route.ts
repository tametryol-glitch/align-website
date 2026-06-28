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

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAdmin(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = getAdminClient();
    const { data, error } = await admin
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ posts: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAdmin(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const admin = getAdminClient();

    const post = {
      slug: body.slug,
      title: body.title,
      description: body.description || '',
      category: body.category || 'General',
      content: body.content || [],
      keywords: body.keywords || [],
      faqs: body.faqs || [],
      read_time: body.read_time || '5 min read',
      cover_image_url: body.cover_image_url || null,
      is_published: body.is_published || false,
      published_at: body.is_published ? new Date().toISOString() : null,
      author_id: user.id,
    };

    let { data, error } = await admin
      .from('blog_posts')
      .insert(post)
      .select()
      .single();

    // Graceful fallback if the cover_image_url migration hasn't run yet:
    // retry without it so saving still works (just without the image).
    if (error && /cover_image_url/.test(error.message || '')) {
      const { cover_image_url, ...rest } = post;
      ({ data, error } = await admin.from('blog_posts').insert(rest).select().single());
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ post: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await verifyAdmin(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'Missing post id' }, { status: 400 });

    const admin = getAdminClient();

    const updates: Record<string, any> = {};
    if (body.slug !== undefined) updates.slug = body.slug;
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.category !== undefined) updates.category = body.category;
    if (body.content !== undefined) updates.content = body.content;
    if (body.keywords !== undefined) updates.keywords = body.keywords;
    if (body.faqs !== undefined) updates.faqs = body.faqs;
    if (body.read_time !== undefined) updates.read_time = body.read_time;
    if (body.cover_image_url !== undefined) updates.cover_image_url = body.cover_image_url;
    if (body.is_published !== undefined) {
      updates.is_published = body.is_published;
      if (body.is_published) {
        const { data: existing } = await admin
          .from('blog_posts')
          .select('published_at')
          .eq('id', body.id)
          .single();
        if (!existing?.published_at) {
          updates.published_at = new Date().toISOString();
        }
      }
    }

    let { data, error } = await admin
      .from('blog_posts')
      .update(updates)
      .eq('id', body.id)
      .select()
      .single();

    // Graceful fallback if the cover_image_url migration hasn't run yet.
    if (error && /cover_image_url/.test(error.message || '')) {
      const { cover_image_url, ...rest } = updates;
      ({ data, error } = await admin.from('blog_posts').update(rest).eq('id', body.id).select().single());
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ post: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await verifyAdmin(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing post id' }, { status: 400 });

    const admin = getAdminClient();
    const { error } = await admin.from('blog_posts').delete().eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
