import { getPublishedBlogPost } from "@/lib/queries/public-blog-posts";
import { ogCard } from "@/lib/og-card";

// Stable social-card URL for this post, referenced by both the page's
// OpenGraph tags and its BlogPosting `image`.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug);
  return ogCard({ eyebrow: "Blog", title: post?.title ?? "Study in Australia" });
}
