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
    .select("slug, title, category, excerpt, country:countries(code, name, is_launched)")
    .eq("status", "published")
    .order("title");

  if (opts.category) query = query.eq("category", opts.category);
  if (opts.excludeCategory) query = query.neq("category", opts.excludeCategory);

  const { data, error } = await query;
  if (error) throw error;
  // Guides are only country-scoped when they carry a country_id — global
  // guides (country: null) always show; scoped ones are hidden until that
  // country launches.
  const rows = (data ?? []) as unknown as (PublicGuideListRow & {
    country: (PublicGuideListRow["country"] & { is_launched: boolean }) | null;
  })[];
  return rows
    .filter((g) => !g.country || g.country.is_launched)
    .map(({ country, ...g }) => ({
      ...g,
      country: country ? { code: country.code, name: country.name } : null,
    }));
}

/**
 * The most recently added guides, newest first — for the "recent guides"
 * module on the homepage. Same country-launch filtering as
 * listPublishedGuides; `comparison` guides are excluded (they live under
 * /best, not /guides).
 */
export async function listRecentGuides(limit = 4): Promise<PublicGuideListRow[]> {
  const supabase = createPublicClient(["guides:list"]);
  const { data, error } = await supabase
    .from("guides")
    .select("slug, title, category, excerpt, country:countries(code, name, is_launched)")
    .eq("status", "published")
    .neq("category", "comparison")
    .order("created_at", { ascending: false })
    .limit(limit + 4);
  if (error) throw error;
  const rows = (data ?? []) as unknown as (PublicGuideListRow & {
    country: (PublicGuideListRow["country"] & { is_launched: boolean }) | null;
  })[];
  return rows
    .filter((g) => !g.country || g.country.is_launched)
    .slice(0, limit)
    .map(({ country, ...g }) => ({
      ...g,
      country: country ? { code: country.code, name: country.name } : null,
    }));
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
      "*, country:countries(code, name, is_launched), author:authors!author_id(name, bio, credentials), reviewed_by:authors!reviewed_by_id(name)",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as unknown as PublicGuideRow & {
    country: (PublicGuideRow["country"] & { is_launched: boolean }) | null;
  };
  // Country-scoped guides (country_id set) are hidden until that country
  // launches — global guides (country: null) are unaffected.
  if (row.country && !row.country.is_launched) return null;

  return { ...row, country: row.country ? { code: row.country.code, name: row.country.name } : null };
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
        "university:universities!related_university_id!inner(id, slug, name, status, country:countries!inner(is_launched))",
      )
      .eq("guide_id", guideId)
      .eq("university.status", "published")
      .eq("university.country.is_launched", true),
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
