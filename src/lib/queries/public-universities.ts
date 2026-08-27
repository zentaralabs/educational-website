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

export async function getUniversityRedirect(oldSlug: string): Promise<string | null> {
  const supabase = createPublicClient(["universities:list"]);
  const { data, error } = await supabase
    .from("university_redirects")
    .select("new_slug")
    .eq("old_slug", oldSlug)
    .maybeSingle();
  if (error) throw error;
  return data?.new_slug ?? null;
}

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
  tuition_domestic: number | null;
  /** True when the tuition figure was filled in from the university's
   * cheapest published program rather than a university-level fact —
   * university-level tuition is often unset since real figures live on
   * individual programs (see PROJECT_STATUS.md Section 13). */
  tuition_international_from_programs?: boolean;
  tuition_domestic_from_programs?: boolean;
  currency: string;
  required_tests: string[] | null;
  required_tests_from_programs?: boolean;
};

const COMPARISON_SELECT =
  "id, slug, name, country:countries(code, name), acceptance_rate, tuition_international, tuition_domestic, currency, required_tests";

/** Matches standardized test names inside free-text admission/English
 * requirement strings, e.g. "IELTS 6.5 (no band below 6.0) or equivalent". */
const TEST_NAME_PATTERN = /\b(IELTS|TOEFL|PTE|Duolingo(?: English Test)?|SAT|ACT)\b/gi;

function extractTestNames(text: string | null | undefined): string[] {
  if (!text) return [];
  const matches = text.match(TEST_NAME_PATTERN) ?? [];
  return matches.map((m) => (m.toUpperCase().startsWith("DUOLINGO") ? "Duolingo" : m.toUpperCase()));
}

/**
 * Fills null university-level tuition and required-test facts from the
 * university's own published programs — university-level tuition_domestic
 * is unset for every university in the dataset (tracked per-program
 * instead), and required_tests is hand-filled for only a handful of
 * universities while most English-test requirements live in each
 * program's free-text english_requirements field. Without these
 * fallbacks the comparison table shows "—" for most schools despite the
 * real data existing one level down.
 */
async function fillProgramFallbacks(
  rows: ComparisonUniversityRow[],
): Promise<ComparisonUniversityRow[]> {
  const needsFallback = rows.filter(
    (r) =>
      r.tuition_international === null ||
      r.tuition_domestic === null ||
      !r.required_tests?.length,
  );
  if (needsFallback.length === 0) return rows;

  const supabase = createPublicClient(["programs:list"]);
  const { data, error } = await supabase
    .from("programs")
    .select("university_id, tuition_international, tuition_domestic, ielts_overall, pte_overall, english_requirements")
    .in(
      "university_id",
      needsFallback.map((r) => r.id),
    )
    .eq("status", "published");
  if (error) throw error;

  const byUni = new Map<
    string,
    { intl: number | null; dom: number | null; tests: Set<string> }
  >();
  for (const p of (data ?? []) as {
    university_id: string;
    tuition_international: number | null;
    tuition_domestic: number | null;
    ielts_overall: number | null;
    pte_overall: number | null;
    english_requirements: string | null;
  }[]) {
    const cur = byUni.get(p.university_id) ?? { intl: null, dom: null, tests: new Set<string>() };
    if (p.tuition_international != null && (cur.intl === null || p.tuition_international < cur.intl)) {
      cur.intl = p.tuition_international;
    }
    if (p.tuition_domestic != null && (cur.dom === null || p.tuition_domestic < cur.dom)) {
      cur.dom = p.tuition_domestic;
    }
    if (p.ielts_overall != null) cur.tests.add("IELTS");
    if (p.pte_overall != null) cur.tests.add("PTE");
    for (const test of extractTestNames(p.english_requirements)) cur.tests.add(test);
    byUni.set(p.university_id, cur);
  }

  return rows.map((r) => {
    const fallback = byUni.get(r.id);
    if (!fallback) return r;
    const fallbackTests = [...fallback.tests];
    return {
      ...r,
      tuition_international: r.tuition_international ?? fallback.intl,
      tuition_domestic: r.tuition_domestic ?? fallback.dom,
      tuition_international_from_programs: r.tuition_international === null && fallback.intl !== null,
      tuition_domestic_from_programs: r.tuition_domestic === null && fallback.dom !== null,
      required_tests: r.required_tests?.length ? r.required_tests : (fallbackTests.length ? fallbackTests : null),
      required_tests_from_programs: !r.required_tests?.length && fallbackTests.length > 0,
    };
  });
}

export async function getUniversitiesForComparison(
  ids: string[],
): Promise<ComparisonUniversityRow[]> {
  if (ids.length === 0) return [];
  const supabase = createPublicClient(["universities:list"]);
  const { data, error } = await supabase
    .from("universities")
    .select(COMPARISON_SELECT)
    .in("id", ids)
    .eq("status", "published");

  if (error) throw error;
  return fillProgramFallbacks((data ?? []) as unknown as ComparisonUniversityRow[]);
}

export async function getUniversitiesForComparisonBySlugs(
  slugs: string[],
): Promise<ComparisonUniversityRow[]> {
  if (slugs.length === 0) return [];
  const supabase = createPublicClient(["universities:list"]);
  const { data, error } = await supabase
    .from("universities")
    .select(COMPARISON_SELECT)
    .in("slug", slugs)
    .eq("status", "published");

  if (error) throw error;
  const filled = await fillProgramFallbacks(
    (data ?? []) as unknown as ComparisonUniversityRow[],
  );
  // Preserve the requested order (`in` doesn't guarantee it) so the picker's
  // selection order is reflected in the table's column order.
  const bySlug = new Map(filled.map((u) => [u.slug, u]));
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
