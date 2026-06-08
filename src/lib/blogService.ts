import { createClient } from '@supabase/supabase-js';
import { blogPosts as staticPosts, type BlogPost as StaticBlogPost } from '@/data/blogContent';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  content: string[];
  keywords: string[];
  faqs: { question: string; answer: string }[];
  read_time: string;
  published_at: string | null;
  updated_at: string;
}

function getPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function staticToPost(s: StaticBlogPost): BlogPost {
  return {
    slug: s.slug,
    title: s.title,
    description: s.description,
    category: s.category,
    content: s.content,
    keywords: s.keywords,
    faqs: s.faqs,
    read_time: s.readTime,
    published_at: s.publishedAt,
    updated_at: s.updatedAt,
  };
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  try {
    const client = getPublicClient();
    if (!client) return staticPosts.map(staticToPost);

    const { data, error } = await client
      .from('blog_posts')
      .select('slug, title, description, category, content, keywords, faqs, read_time, published_at, updated_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return staticPosts.map(staticToPost);
    }
    return data as BlogPost[];
  } catch {
    return staticPosts.map(staticToPost);
  }
}

export async function getPublishedPost(slug: string): Promise<BlogPost | null> {
  try {
    const client = getPublicClient();
    if (!client) {
      const s = staticPosts.find((p) => p.slug === slug);
      return s ? staticToPost(s) : null;
    }

    const { data, error } = await client
      .from('blog_posts')
      .select('slug, title, description, category, content, keywords, faqs, read_time, published_at, updated_at')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error || !data) {
      const s = staticPosts.find((p) => p.slug === slug);
      return s ? staticToPost(s) : null;
    }
    return data as BlogPost;
  } catch {
    const s = staticPosts.find((p) => p.slug === slug);
    return s ? staticToPost(s) : null;
  }
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  try {
    const client = getPublicClient();
    if (!client) return staticPosts.map((p) => p.slug);

    const { data, error } = await client
      .from('blog_posts')
      .select('slug')
      .eq('is_published', true);

    if (error || !data || data.length === 0) {
      return staticPosts.map((p) => p.slug);
    }
    return data.map((p) => p.slug);
  } catch {
    return staticPosts.map((p) => p.slug);
  }
}
