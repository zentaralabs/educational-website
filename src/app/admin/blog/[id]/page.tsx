import { notFound } from "next/navigation";
import { getBlogPost } from "@/lib/queries/blog-posts";
import { createClient } from "@/lib/supabase/server";
import { BlogPostEditor } from "./BlogPostEditor";

export const dynamic = "force-dynamic";

export default async function BlogPostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const post = await getBlogPost(supabase, id);

  if (!post) notFound();

  return (
    <div className="p-8">
      <BlogPostEditor post={post} />
    </div>
  );
}
