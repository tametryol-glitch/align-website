import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { blogPosts } from '@/data/blogContent';

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

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAdmin(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = getAdminClient();

    const posts = blogPosts.map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      category: p.category,
      content: p.content,
      keywords: p.keywords,
      faqs: p.faqs,
      read_time: p.readTime,
      is_published: true,
      published_at: p.publishedAt,
      author_id: user.id,
    }));

    const { data, error } = await admin
      .from('blog_posts')
      .upsert(posts, { onConflict: 'slug', ignoreDuplicates: true })
      .select('slug');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ seeded: data?.length || 0, message: `Seeded ${data?.length || 0} blog posts` });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
