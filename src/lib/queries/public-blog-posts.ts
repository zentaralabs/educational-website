import { createPublicClient } from "@/lib/supabase/public";

export type PublicBlogPostListRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  tags: string[] | null;
  published_at: string | null;
};

export async function listPublishedBlogPosts(opts: { tag?: string } = {}): Promise<
  PublicBlogPostListRow[]
> {
  const supabase = createPublicClient(["blog_posts:list"]);
  let query = supabase
    .from("blog_posts")
    .select("slug, title, excerpt, tags, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (opts.tag) query = query.contains("tags", [opts.tag]);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/** Distinct tags across all published posts, for the /blog filter UI. */
export async function listPublishedBlogTags(): Promise<string[]> {
  const rows = await listPublishedBlogPosts();
  const tags = new Set<string>();
  for (const r of rows) for (const t of r.tags ?? []) tags.add(t);
  return [...tags].sort();
}

export async function listPublishedBlogPostSlugs(): Promise<string[]> {
  const rows = await listPublishedBlogPosts();
  return rows.map((r) => r.slug);
}

export type PublicBlogPostRow = {
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  tags: string[] | null;
  published_at: string | null;
  last_verified_at: string | null;
  source_urls: string[] | null;
  author: { name: string; bio: string | null; credentials: string | null } | null;
  reviewed_by: { name: string } | null;
};

export async function getPublishedBlogPost(slug: string): Promise<PublicBlogPostRow | null> {
  const supabase = createPublicClient([`blog_post:${slug}`, "blog_posts:list"]);
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "slug, title, content, excerpt, tags, published_at, last_verified_at, source_urls, author:authors!author_id(name, bio, credentials), reviewed_by:authors!reviewed_by_id(name)",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  return data as unknown as PublicBlogPostRow | null;
}
