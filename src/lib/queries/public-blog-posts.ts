import { createPublicClient } from "@/lib/supabase/public";

export type PublicBlogPostListRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  tags: string[] | null;
  published_at: string | null;
  word_count: number | null;
  author: { name: string } | null;
};

const LIST_SELECT =
  "slug, title, excerpt, tags, published_at, word_count, author:authors!author_id(name)";

const PAGE_SIZE = 12;

/**
 * One page of published posts, newest first. Paginated (never fetches the
 * whole table) — same shape as listPublishedDeadlines.
 */
export async function listPublishedBlogPosts(
  opts: { tag?: string; page?: number } = {},
): Promise<{ rows: PublicBlogPostListRow[]; totalCount: number; pageSize: number }> {
  const supabase = createPublicClient(["blog_posts:list"]);
  const page = Math.max(1, opts.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;

  // Count first (HEAD, no rows), so a page past the end returns empty
  // rather than a PostgREST "range not satisfiable" error.
  let countQuery = supabase
    .from("blog_posts")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");
  if (opts.tag) countQuery = countQuery.contains("tags", [opts.tag]);
  const { count, error: countError } = await countQuery;
  if (countError) throw countError;
  const totalCount = count ?? 0;

  if (from >= totalCount) {
    return { rows: [], totalCount, pageSize: PAGE_SIZE };
  }

  let rowsQuery = supabase
    .from("blog_posts")
    .select(LIST_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (opts.tag) rowsQuery = rowsQuery.contains("tags", [opts.tag]);
  const { data, error } = await rowsQuery.range(from, from + PAGE_SIZE - 1);
  if (error) throw error;

  return {
    rows: (data ?? []) as unknown as PublicBlogPostListRow[],
    totalCount,
    pageSize: PAGE_SIZE,
  };
}

/** A few recent posts for the "more from the blog" footer on article pages. */
export async function listRecentBlogPosts(
  limit = 4,
  excludeSlug?: string,
): Promise<PublicBlogPostListRow[]> {
  const supabase = createPublicClient(["blog_posts:list"]);
  let query = supabase
    .from("blog_posts")
    .select(LIST_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(excludeSlug ? limit + 1 : limit);

  if (excludeSlug) query = query.neq("slug", excludeSlug);

  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as unknown as PublicBlogPostListRow[]).slice(0, limit);
}

/**
 * Distinct tags across all published posts, for the /blog filter pills.
 * Reads only the `tags` column. If this ever gets heavy, replace with a
 * `select distinct unnest(tags)` Postgres function.
 */
export async function listPublishedBlogTags(): Promise<string[]> {
  const supabase = createPublicClient(["blog_posts:list"]);
  const { data, error } = await supabase
    .from("blog_posts")
    .select("tags")
    .eq("status", "published");
  if (error) throw error;

  const tags = new Set<string>();
  for (const r of (data ?? []) as { tags: string[] | null }[]) {
    for (const t of r.tags ?? []) tags.add(t);
  }
  return [...tags].sort();
}

/** Recent post slugs for generateStaticParams (the rest render on-demand via ISR). */
export async function listRecentBlogPostSlugs(limit = 60): Promise<string[]> {
  const supabase = createPublicClient(["blog_posts:list"]);
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data ?? []) as { slug: string }[]).map((r) => r.slug);
}

/** Every published post slug — for the sitemap, which needs all URLs. */
export async function listAllBlogPostSlugs(): Promise<string[]> {
  const supabase = createPublicClient(["blog_posts:list"]);
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("status", "published");
  if (error) throw error;
  return ((data ?? []) as { slug: string }[]).map((r) => r.slug);
}

/** slug + updated_at for the sitemap's per-page `lastmod`. */
export async function listAllBlogPostSlugsForSitemap(): Promise<
  { slug: string; updatedAt: string | null }[]
> {
  const supabase = createPublicClient(["blog_posts:list"]);
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("status", "published");
  if (error) throw error;
  return ((data ?? []) as { slug: string; updated_at: string | null }[]).map(
    (r) => ({ slug: r.slug, updatedAt: r.updated_at }),
  );
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
  word_count: number | null;
  author: { name: string; bio: string | null; credentials: string | null } | null;
  reviewed_by: { name: string } | null;
};

export type BlogFeedItem = {
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
  author: { name: string } | null;
};

/** Every published post, newest first, for the RSS feed. */
export async function listBlogPostsForFeed(): Promise<BlogFeedItem[]> {
  const supabase = createPublicClient(["blog_posts:list"]);
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, published_at, author:authors!author_id(name)")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as BlogFeedItem[];
}

export async function getPublishedBlogPost(slug: string): Promise<PublicBlogPostRow | null> {
  const supabase = createPublicClient([`blog_post:${slug}`, "blog_posts:list"]);
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "slug, title, content, excerpt, tags, published_at, last_verified_at, source_urls, word_count, author:authors!author_id(name, bio, credentials), reviewed_by:authors!reviewed_by_id(name)",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  return data as unknown as PublicBlogPostRow | null;
}
