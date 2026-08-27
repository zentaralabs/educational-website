import { createPublicClient } from "@/lib/supabase/public";

export type QuizFilters = {
  country?: string; // country code, e.g. "US"
  degreeLevel?: string; // degree_levels.name
  maxBudget?: number; // annual tuition ceiling, USD
  institutionType?: string; // "public" | "private"
};

export type QuizMatch = {
  slug: string;
  name: string;
  country: { code: string; name: string } | null;
  institution_type: string | null;
  acceptance_rate: number | null;
  tuition_international: number | null;
  distinctive_summary: string | null;
  fitsBudget: boolean;
};

export async function listQuizOptions() {
  const supabase = createPublicClient(["universities:list"]);
  const [countries, degreeLevels] = await Promise.all([
    supabase.from("countries").select("code, name").eq("is_launched", true).order("name"),
    supabase.from("degree_levels").select("name").order("id"),
  ]);
  if (countries.error) throw countries.error;
  if (degreeLevels.error) throw degreeLevels.error;
  return {
    countries: countries.data ?? [],
    degreeLevels: (degreeLevels.data ?? []).map((d) => d.name),
  };
}

export async function getQuizMatches(filters: QuizFilters): Promise<QuizMatch[]> {
  const supabase = createPublicClient(["universities:list"]);

  let degreeUniversityIds: string[] | null = null;
  if (filters.degreeLevel) {
    const { data, error } = await supabase
      .from("university_degree_levels")
      .select("university_id, degree_level:degree_levels!inner(name)")
      .eq("degree_level.name", filters.degreeLevel);
    if (error) throw error;
    degreeUniversityIds = (
      (data ?? []) as unknown as { university_id: string }[]
    ).map((r) => r.university_id);
    if (degreeUniversityIds.length === 0) return [];
  }

  let query = supabase
    .from("universities")
    .select(
      "slug, name, institution_type, acceptance_rate, tuition_international, distinctive_summary, country:countries!inner(code, name)",
    )
    .eq("status", "published")
    .eq("country.is_launched", true);

  if (filters.country) query = query.eq("country.code", filters.country);
  if (filters.institutionType) query = query.eq("institution_type", filters.institutionType);
  if (degreeUniversityIds) query = query.in("id", degreeUniversityIds);

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data ?? []) as unknown as Omit<QuizMatch, "fitsBudget">[];

  const scored = rows.map((r) => ({
    ...r,
    // Universities without a listed international tuition figure aren't
    // excluded — sparse data shouldn't hide a real match — but a known
    // over-budget cost does exclude, and known-fitting costs rank first.
    fitsBudget:
      filters.maxBudget === undefined ||
      r.tuition_international === null ||
      r.tuition_international <= filters.maxBudget,
  }));

  return scored
    .filter((r) => r.fitsBudget)
    .sort((a, b) => {
      const aRate = a.acceptance_rate ?? 100;
      const bRate = b.acceptance_rate ?? 100;
      return bRate - aRate; // higher acceptance rate = more realistic shot, surfaced first
    });
}
