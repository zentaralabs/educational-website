import { getPublishedGuide } from "@/lib/queries/public-guides";
import { ogCard } from "@/lib/og-card";

// Stable social-card URL for this guide, referenced by both the page's
// OpenGraph tags and its Article `image`.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const guide = await getPublishedGuide(slug);
  return ogCard({
    eyebrow: "Guide",
    title: guide?.title ?? "Studying in Australia",
  });
}
