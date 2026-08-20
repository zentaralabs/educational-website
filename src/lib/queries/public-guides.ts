import { createPublicClient } from "@/lib/supabase/public";
import type { Database } from "@/lib/supabase/types";

export type PublicGuideListRow = {
  slug: string;
  title: string;
  category: string;
  excerpt: string | null;
  country: { code: string; name: string } | null;
};

export async function listPublishedGuides(opts: {
  category?: string;
  excludeCategory?: string;
} = {}): Promise<PublicGuideListRow[]> {
  const supabase = createPublicClient(["guides:list"]);
  let query = supabase
    .from("guides")
    .select("slug, title, category, excerpt, country:countries(code, name)")
    .eq("status", "published")
    .order("title");

  if (opts.category) query = query.eq("category", opts.category);
  if (opts.excludeCategory) query = query.neq("category", opts.excludeCategory);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as PublicGuideListRow[];
}

export async function listPublishedGuideSlugs(opts: {
  category?: string;
  excludeCategory?: string;
} = {}): Promise<string[]> {
  const rows = await listPublishedGuides(opts);
  return rows.map((r) => r.slug);
}

export type PublicGuideRow = Database["public"]["Tables"]["guides"]["Row"] & {
  country: { code: string; name: string } | null;
  author: { name: string; bio: string | null; credentials: string | null } | null;
  reviewed_by: { name: string } | null;
};

export async function getPublishedGuide(slug: string): Promise<PublicGuideRow | null> {
  const supabase = createPublicClient([`guide:${slug}`, "guides:list"]);
  const { data, error } = await supabase
    .from("guides")
    .select(
      "*, country:countries(code, name), author:authors!author_id(name, bio, credentials), reviewed_by:authors!reviewed_by_id(name)",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  return data as unknown as PublicGuideRow | null;
}

export async function getGuideRelatedContent(guideId: string) {
  const supabase = createPublicClient(["guides:list", "universities:list"]);

  const [relatedGuides, relatedUniversities] = await Promise.all([
    supabase
      .from("guide_related_guides")
      .select("guide:guides!related_guide_id!inner(slug, title, status)")
      .eq("guide_id", guideId)
      .eq("guide.status", "published"),
    supabase
      .from("guide_related_universities")
      .select(
        "university:universities!related_university_id!inner(id, slug, name, status)",
      )
      .eq("guide_id", guideId)
      .eq("university.status", "published"),
  ]);

  if (relatedGuides.error) throw relatedGuides.error;
  if (relatedUniversities.error) throw relatedUniversities.error;

  return {
    guides: (
      (relatedGuides.data ?? []) as unknown as {
        guide: { slug: string; title: string };
      }[]
    ).map((r) => r.guide),
    universities: (
      (relatedUniversities.data ?? []) as unknown as {
        university: { id: string; slug: string; name: string };
      }[]
    ).map((r) => r.university),
  };
}
