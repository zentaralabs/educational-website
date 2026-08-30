import { getPublishedUniversity } from "@/lib/queries/public-universities";
import { ogCard } from "@/lib/og-card";

// Stable social-card URL for this profile, referenced by both the page's
// OpenGraph tags and its CollegeOrUniversity `image`.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const university = await getPublishedUniversity(slug);
  return ogCard({
    eyebrow: university?.city?.split(",")[0] ?? "University",
    title: university?.name ?? "Australian universities",
  });
}
