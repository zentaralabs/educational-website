import { createPublicClient } from "@/lib/supabase/public";

export type SubjectSummary = {
  slug: string;
  name: string;
  programCount: number;
  universityCount: number;
  minTuition: number | null;
};

type ProgRow = {
  id: string;
  name: string;
  tuition_international: number | null;
  currency: string | null;
  duration_years: number | null;
  ielts_overall: number | null;
  degree_level: { name: string } | null;
  subject: { id: number; slug: string | null; name: string } | null;
  university: {
    slug: string;
    name: string;
    city: string | null;
    status: string;
    ielts_overall: number | null;
    country: { is_launched: boolean } | null;
  } | null;
};

const PROG_SELECT =
  "id, name, tuition_international, currency, duration_years, ielts_overall, " +
  "degree_level:degree_levels(name), " +
  "subject:subjects!inner(id, slug, name), " +
  "university:universities!inner(slug, name, city, status, ielts_overall, country:countries!inner(is_launched))";

/** All subjects that have at least one published program in a launched country. */
export async function listPublishedSubjects(): Promise<SubjectSummary[]> {
  const supabase = createPublicClient(["programs:list"]);
  const { data, error } = await supabase
    .from("programs")
    .select(PROG_SELECT)
    .eq("status", "published")
    .eq("university.status", "published")
    .eq("university.country.is_launched", true);
  if (error) throw error;

  const rows = (data ?? []) as unknown as ProgRow[];
  const bySubject = new Map<
    string,
    { name: string; unis: Set<string>; fees: number[]; count: number }
  >();
  for (const p of rows) {
    if (!p.subject?.slug) continue;
    const entry = bySubject.get(p.subject.slug) ?? {
      name: p.subject.name,
      unis: new Set<string>(),
      fees: [],
      count: 0,
    };
    entry.count += 1;
    if (p.university?.slug) entry.unis.add(p.university.slug);
    if (typeof p.tuition_international === "number" && p.tuition_international > 0)
      entry.fees.push(p.tuition_international);
    bySubject.set(p.subject.slug, entry);
  }

  return [...bySubject.entries()]
    .map(([slug, e]) => ({
      slug,
      name: e.name,
      programCount: e.count,
      universityCount: e.unis.size,
      minTuition: e.fees.length ? Math.min(...e.fees) : null,
    }))
    // Skip subjects too thin to make a useful landing page (Economics,
    // Mathematics, Physics currently have almost no program rows).
    .filter((s) => s.programCount >= 6)
    .sort((a, b) => b.programCount - a.programCount);
}

export type SubjectProgram = {
  id: string;
  name: string;
  degreeLevel: string | null;
  durationYears: number | null;
  tuition: number | null;
  currency: string;
  /** Program's own IELTS overall minimum, falling back to the university's
   * institutional minimum when the program row doesn't set one. */
  ielts: number | null;
  universitySlug: string;
  universityName: string;
  universityCity: string | null;
};

export type SubjectDetail = {
  slug: string;
  name: string;
  programs: SubjectProgram[];
  universities: { slug: string; name: string; city: string | null }[];
  minTuition: number | null;
  maxTuition: number | null;
  medianTuition: number | null;
};

export async function getSubjectBySlug(slug: string): Promise<SubjectDetail | null> {
  const supabase = createPublicClient([`subject:${slug}`, "programs:list"]);
  const { data, error } = await supabase
    .from("programs")
    .select(PROG_SELECT)
    .eq("status", "published")
    .eq("university.status", "published")
    .eq("university.country.is_launched", true)
    .eq("subject.slug", slug);
  if (error) throw error;

  const rows = (data ?? []) as unknown as ProgRow[];
  if (rows.length === 0) return null;

  const programs: SubjectProgram[] = rows
    .map((p) => ({
      id: p.id,
      name: p.name,
      degreeLevel: p.degree_level?.name ?? null,
      durationYears: p.duration_years,
      tuition: p.tuition_international,
      currency: p.currency ?? "AUD",
      ielts: p.ielts_overall ?? p.university?.ielts_overall ?? null,
      universitySlug: p.university?.slug ?? "",
      universityName: p.university?.name ?? "",
      universityCity: p.university?.city ?? null,
    }))
    .sort((a, b) => {
      if (a.tuition == null) return 1;
      if (b.tuition == null) return -1;
      return a.tuition - b.tuition;
    });

  const fees = programs
    .map((p) => p.tuition)
    .filter((n): n is number => typeof n === "number" && n > 0)
    .sort((a, b) => a - b);

  const uniMap = new Map<string, { slug: string; name: string; city: string | null }>();
  for (const p of programs) {
    if (p.universitySlug && !uniMap.has(p.universitySlug))
      uniMap.set(p.universitySlug, {
        slug: p.universitySlug,
        name: p.universityName,
        city: p.universityCity,
      });
  }

  return {
    slug,
    name: rows[0].subject!.name,
    programs,
    universities: [...uniMap.values()].sort((a, b) => a.name.localeCompare(b.name)),
    minTuition: fees[0] ?? null,
    maxTuition: fees[fees.length - 1] ?? null,
    medianTuition: fees.length ? fees[Math.floor(fees.length / 2)] : null,
  };
}
