import { getPublishedOccupation } from "@/lib/queries/public-occupations";
import { ogCard } from "@/lib/og-card";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const o = await getPublishedOccupation(slug);
  return ogCard({
    eyebrow: o ? `ANZSCO ${o.anzsco_code}` : "Occupation",
    title: o?.name ?? "Skilled occupations in Australia",
  });
}
