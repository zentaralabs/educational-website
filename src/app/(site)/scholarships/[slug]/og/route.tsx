import { getPublishedScholarship } from "@/lib/queries/public-scholarships";
import { ogCard } from "@/lib/og-card";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const s = await getPublishedScholarship(slug);
  return ogCard({
    eyebrow: "Scholarship",
    title: s?.name ?? "Scholarships for international students",
  });
}
