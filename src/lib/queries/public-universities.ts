import { createPublicClient } from "@/lib/supabase/public";
import type { Database } from "@/lib/supabase/types";

export type PublicUniversityRow = Database["public"]["Tables"]["universities"]["Row"] & {
  country: { code: string; name: string } | null;
  author: { name: string; credentials: string | null } | null;
  reviewed_by: { name: string } | null;
  application_platform: { name: string } | null;
  degree_levels: { name: string }[];
  rankings: {
    id: string;
    rank: number;
    category: string | null;
    year: number;
    source_url: string;
    ranking_body: { name: string } | null;
  }[];
};

export async function listPublishedUniversitySlugs(): Promise<string[]> {
  const supabase = createPublicClient(["universities:list"]);
  const { data, error } = await supabase
    .from("universities")
    .select("slug")
    .eq("status", "published");
  if (error) throw error;
  return (data ?? []).map((r) => r.slug);
}

export async function getPublishedUniversity(
  slug: string,
): Promise<PublicUniversityRow | null> {
  const supabase = createPublicClient([`university:${slug}`, "universities:list"]);

  const { data, error } = await supabase
    .from("universities")
    .select(
      `*,
      country:countries(code, name),
      author:authors!author_id(name, credentials),
      reviewed_by:authors!reviewed_by_id(name),
      application_platform:application_platforms(name),
      degree_levels:university_degree_levels(degree_level:degree_levels(name)),
      rankings(id, rank, category, year, source_url, ranking_body:ranking_bodies(name))`,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const raw = data as unknown as Omit<PublicUniversityRow, "degree_levels"> & {
    degree_levels: { degree_level: { name: string } | null }[];
  };

  return {
    ...raw,
    degree_levels: raw.degree_levels
      .map((d) => d.degree_level)
      .filter((d): d is { name: string } => d !== null),
  };
}

export type ComparisonUniversityRow = {
  id: string;
  slug: string;
  name: string;
  country: { code: string; name: string } | null;
  acceptance_rate: number | null;
  tuition_international: number | null;
  est_cost_of_attendance: number | null;
  student_faculty_ratio: string | null;
  required_tests: string[] | null;
};

export async function getUniversitiesForComparison(
  ids: string[],
): Promise<ComparisonUniversityRow[]> {
  if (ids.length === 0) return [];
  const supabase = createPublicClient(["universities:list"]);
  const { data, error } = await supabase
    .from("universities")
    .select(
      "id, slug, name, country:countries(code, name), acceptance_rate, tuition_international, est_cost_of_attendance, student_faculty_ratio, required_tests",
    )
    .in("id", ids)
    .eq("status", "published");

  if (error) throw error;
  return (data ?? []) as unknown as ComparisonUniversityRow[];
}

export async function getUniversitiesForComparisonBySlugs(
  slugs: string[],
): Promise<ComparisonUniversityRow[]> {
  if (slugs.length === 0) return [];
  const supabase = createPublicClient(["universities:list"]);
  const { data, error } = await supabase
    .from("universities")
    .select(
      "id, slug, name, country:countries(code, name), acceptance_rate, tuition_international, est_cost_of_attendance, student_faculty_ratio, required_tests",
    )
    .in("slug", slugs)
    .eq("status", "published");

  if (error) throw error;
  // Preserve the requested order (`in` doesn't guarantee it) so the picker's
  // selection order is reflected in the table's column order.
  const bySlug = new Map(
    ((data ?? []) as unknown as ComparisonUniversityRow[]).map((u) => [u.slug, u]),
  );
  return slugs.map((s) => bySlug.get(s)).filter((u): u is ComparisonUniversityRow => !!u);
}

export type PublicUniversityOption = { slug: string; name: string; country: string | null };

export async function listPublishedUniversityOptions(): Promise<PublicUniversityOption[]> {
  const supabase = createPublicClient(["universities:list"]);
  const { data, error } = await supabase
    .from("universities")
    .select("slug, name, country:countries(name)")
    .eq("status", "published")
    .order("name");

  if (error) throw error;
  return ((data ?? []) as unknown as { slug: string; name: string; country: { name: string } | null }[]).map(
    (u) => ({ slug: u.slug, name: u.name, country: u.country?.name ?? null }),
  );
}

export type PublicDeadlineForUniversity = {
  id: string;
  deadline_date: string;
  is_rolling: boolean;
  notes: string | null;
  degree_level: { name: string } | null;
  deadline_type: { name: string } | null;
  application_platform: { name: string } | null;
};

export async function getPublishedDeadlinesForUniversity(
  universityId: string,
): Promise<PublicDeadlineForUniversity[]> {
  const supabase = createPublicClient(["deadlines:list"]);
  const { data, error } = await supabase
    .from("deadlines")
    .select(
      "id, deadline_date, is_rolling, notes, degree_level:degree_levels(name), deadline_type:deadline_types(name), application_platform:application_platforms(name)",
    )
    .eq("university_id", universityId)
    .eq("status", "published")
    .order("deadline_date");

  if (error) throw error;
  return (data ?? []) as unknown as PublicDeadlineForUniversity[];
}

export type PublicScholarshipForUniversity = {
  id: string;
  name: string;
  scope: string;
  amount: string | null;
  deadline_date: string | null;
};

export async function getPublishedScholarshipsForUniversity(
  universityId: string,
): Promise<PublicScholarshipForUniversity[]> {
  const supabase = createPublicClient(["scholarships:list"]);
  const { data, error } = await supabase
    .from("scholarship_universities")
    .select(
      "scholarship:scholarships!inner(id, name, scope, amount, deadline_date, status)",
    )
    .eq("university_id", universityId)
    .eq("scholarship.status", "published");

  if (error) throw error;
  return ((data ?? []) as unknown as { scholarship: PublicScholarshipForUniversity }[]).map(
    (r) => r.scholarship,
  );
}
