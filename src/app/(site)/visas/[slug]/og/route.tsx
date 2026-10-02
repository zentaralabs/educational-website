import { getPublishedVisa } from "@/lib/queries/public-visas";
import { ogCard } from "@/lib/og-card";

// Stable social-card URL for this visa page, referenced by the page's
// OpenGraph tags and its Article `image`.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const visa = await getPublishedVisa(slug);
  return ogCard({
    eyebrow: visa ? `Subclass ${visa.code} visa` : "Visa",
    title: visa?.name ?? "Australian visas for students and graduates",
  });
}
