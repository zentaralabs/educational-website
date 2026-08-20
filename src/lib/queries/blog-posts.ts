import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContentStatus, Database } from "@/lib/supabase/types";

export type BlogPostListRow = {
  id: string;
  slug: string;
  title: string;
  status: ContentStatus;
  published_at: string | null;
  author: { name: string } | null;
};

export async function listBlogPosts(
  supabase: SupabaseClient<Database>,
): Promise<BlogPostListRow[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title, status, published_at, author:authors!author_id(name)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as BlogPostListRow[];
}

export type BlogPostDetailRow = Database["public"]["Tables"]["blog_posts"]["Row"] & {
  author: { name: string } | null;
};

export async function getBlogPost(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<BlogPostDetailRow | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, author:authors!author_id(name)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as BlogPostDetailRow | null;
}

export async function createBlogPost(
  supabase: SupabaseClient<Database>,
  input: Pick<
    Database["public"]["Tables"]["blog_posts"]["Insert"],
    "title" | "slug" | "author_id"
  >,
): Promise<string> {
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({ ...input, content: "", status: "draft" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateBlogPost(
  supabase: SupabaseClient<Database>,
  id: string,
  patch: Database["public"]["Tables"]["blog_posts"]["Update"],
) {
  const { error } = await supabase.from("blog_posts").update(patch).eq("id", id);
  if (error) throw error;
}
