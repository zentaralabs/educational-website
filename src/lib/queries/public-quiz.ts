import { createPublicClient } from "@/lib/supabase/public";
import { listCollectionUniversities } from "@/lib/queries/public-collections";
import { listPublishedSubjects } from "@/lib/queries/public-subjects";
import { isRegionalCity } from "@/lib/australia";
import { CITY_COSTS, getCity } from "@/lib/cities";

export type QuizFilters = {
  degreeLevel?: string; // degree_levels.name
  maxBudget?: number; // annual tuition ceiling, AUD
  institutionType?: string; // "public" | "private"
  subject?: string; // subjects.slug
  city?: string; // CITY_COSTS.slug
  ielts?: number; // the student's own IELTS band
  pte?: number; // the student's own PTE Academic score
  scholarship?: boolean; // true = only universities with an automatic scholarship
  regional?: boolean; // true = only regional campuses (migration points)
};

export type QuizMatch = {
  slug: string;
  name: string;
  city: string | null;
  institutionType: string | null;
  acceptanceRate: number | null;
  minTuition: number | null;
  firstYearBudget: number | null;
  whoIsItFor: string | null;
  intakes: string[];
  isRegional: boolean;
  automaticScholarships: { slug: string; name: string; amount: string | null }[];
};

export async function listQuizOptions() {
  const [subjects] = await Promise.all([listPublishedSubjects()]);

  const supabase = createPublicClient(["universities:list"]);
  const { data: degreeRows, error } = await supabase
    .from("degree_levels")
    .select("name")
    .order("id");
  if (error) throw error;

  return {
    degreeLevels: (degreeRows ?? []).map((d) => d.name),
    subjects: subjects.map((s) => ({ slug: s.slug, name: s.name })),
    cities: CITY_COSTS.map((c) => ({ slug: c.slug, name: c.name })),
  };
}

/** University slugs that teach a given subject at a published program. */
async function universitySlugsForSubject(subjectSlug: string): Promise<Set<string>> {
  const supabase = createPublicClient(["programs:list"]);
  const { data, error } = await supabase
    .from("programs")
    .select(
      "university:universities!inner(slug, status, country:countries!inner(is_launched)), subject:subjects!inner(slug)",
    )
    .eq("status", "published")
    .eq("subject.slug", subjectSlug)
    .eq("university.status", "published")
    .eq("university.country.is_launched", true);
  if (error) throw error;
  return new Set(
    ((data ?? []) as unknown as { university: { slug: string } | null }[])
      .map((r) => r.university?.slug)
      .filter((s): s is string => Boolean(s)),
  );
}

/** University slugs offering a given degree level. */
async function universitySlugsForDegree(degreeLevel: string): Promise<Set<string>> {
  const supabase = createPublicClient(["universities:list"]);
  const { data, error } = await supabase
    .from("university_degree_levels")
    .select("university_id, degree_level:degree_levels!inner(name)")
    .eq("degree_level.name", degreeLevel);
  if (error) throw error;
  // university_degree_levels stores ids; resolve to slugs via a second lookup.
  const ids = ((data ?? []) as unknown as { university_id: string }[]).map(
    (r) => r.university_id,
  );
  if (ids.length === 0) return new Set();
  const { data: unis, error: uniErr } = await supabase
    .from("universities")
    .select("slug")
    .in("id", ids);
  if (uniErr) throw uniErr;
  return new Set(
    ((unis ?? []) as unknown as { slug: string }[]).map((u) => u.slug),
  );
}

export async function getQuizMatches(filters: QuizFilters): Promise<QuizMatch[]> {
  const [universities, subjectSlugs, degreeSlugs] = await Promise.all([
    listCollectionUniversities(),
    filters.subject ? universitySlugsForSubject(filters.subject) : null,
    filters.degreeLevel ? universitySlugsForDegree(filters.degreeLevel) : null,
  ]);

  if (subjectSlugs && subjectSlugs.size === 0) return [];
  if (degreeSlugs && degreeSlugs.size === 0) return [];

  const cityName = filters.city ? getCity(filters.city)?.name ?? null : null;

  const matches: QuizMatch[] = universities
    .filter((u) => {
      if (subjectSlugs && !subjectSlugs.has(u.slug)) return false;
      if (degreeSlugs && !degreeSlugs.has(u.slug)) return false;
      if (filters.institutionType && u.institution_type !== filters.institutionType)
        return false;
      if (
        cityName &&
        !(u.city ?? "").toLowerCase().includes(cityName.toLowerCase())
      )
        return false;
      if (filters.regional && !isRegionalCity(u.city)) return false;
      if (filters.scholarship && u.automaticScholarships.length === 0) return false;
      // Budget: unknown tuition isn't excluded (sparse data shouldn't hide a
      // real match), but a known over-budget figure is.
      if (
        filters.maxBudget !== undefined &&
        u.minTuition !== null &&
        u.minTuition > filters.maxBudget
      )
        return false;
      // English: show universities the student's band already clears. Unknown
      // requirement stays in.
      if (
        filters.ielts !== undefined &&
        u.ieltsOverall !== null &&
        u.ieltsOverall > filters.ielts
      )
        return false;
      if (
        filters.pte !== undefined &&
        u.pteOverall !== null &&
        u.pteOverall > filters.pte
      )
        return false;
      return true;
    })
    .map((u) => ({
      slug: u.slug,
      name: u.name,
      city: u.city,
      institutionType: u.institution_type,
      acceptanceRate: u.acceptanceRate,
      minTuition: u.minTuition,
      firstYearBudget: u.firstYearBudget,
      whoIsItFor: u.who_is_it_for,
      intakes: u.intakes,
      isRegional: isRegionalCity(u.city),
      automaticScholarships: u.automaticScholarships,
    }))
    .sort((a, b) => {
      // More realistic acceptance odds first; unknown rate sorts as very open.
      const aRate = a.acceptanceRate ?? 100;
      const bRate = b.acceptanceRate ?? 100;
      return bRate - aRate;
    });

  return matches;
}
