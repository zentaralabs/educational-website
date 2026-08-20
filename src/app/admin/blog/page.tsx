import Link from "next/link";
import { listBlogPosts } from "@/lib/queries/blog-posts";
import { createClient } from "@/lib/supabase/server";
import { BlogPostsTable } from "./BlogPostsTable";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const supabase = await createClient();
  const posts = await listBlogPosts(supabase);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Blog</h1>
        <Link
          href="/admin/blog/new"
          className="rounded-md bg-ink px-3 py-1.5 font-body text-sm font-medium text-paper transition-opacity duration-150 hover:opacity-90"
        >
          New post
        </Link>
      </div>

      <BlogPostsTable posts={posts} />
    </div>
  );
}
