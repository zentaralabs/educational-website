import { createPublicClient } from "@/lib/supabase/public";

/**
 * Whether a program page carries enough of its own content to be worth
 * indexing (and listing in the sitemap). Program pages are otherwise a thin
 * data template over an AI-imported dataset, so we only index the ones that
 * have real sourced prose: either a parsed `curriculum` (the fully-enriched
 * set) or an "About this program" description of at least 100 words. That
 * covers every real sourced degree card from the 2026-08 description pass
 * (a check of the 100-109 word band found it is almost all demand-tier
 * degrees). The genuinely short templated long-tail cards below 100 words
 * (grad cert/diploma one-liners, short honours years, short pathway cards)
 * stay noindex and out of the sitemap, still live for users and internal
 * links, until a later verification wave.
 * See PROJECT_STATUS.md "Description pass" / "Program pages".
 */
export function isProgramIndexable(program: {
  description?: string | null;
  curriculum?: string | null;
}): boolean {
  if (program.curriculum && program.curriculum.trim()) return true;
  const words = (program.description ?? "").trim().split(/\s+/).filter(Boolean);
  return words.length >= 100;
}

export type PublicProgramRow = {
  id: string;
  slug: string;
  name: string;
  duration_years: number | null;
  tuition_international: number | null;
  tuition_domestic: number | null;
  tuition_domestic_is_csp: boolean | null;
  currency: string | null;
  application_url: string | null;
  admission_requirements: string | null;
  english_requirements: string | null;
  ielts_overall: number | null;
  ielts_listening: number | null;
  ielts_reading: number | null;
  ielts_writing: number | null;
  ielts_speaking: number | null;
  pte_overall: number | null;
  pte_listening: number | null;
  pte_reading: number | null;
  pte_writing: number | null;
  pte_speaking: number | null;
  last_verified_at: string | null;
  source_url: string | null;
  degree_level: { name: string } | null;
  subject: { name: string } | null;
};

export async function getPublishedProgramsForUniversity(
  universityId: string,
): Promise<PublicProgramRow[]> {
  const supabase = createPublicClient(["programs:list"]);
  const { data, error } = await supabase
    .from("programs")
    .select(
      "id, slug, name, duration_years, tuition_international, tuition_domestic, tuition_domestic_is_csp, currency, application_url, admission_requirements, english_requirements, ielts_overall, ielts_listening, ielts_reading, ielts_writing, ielts_speaking, pte_overall, pte_listening, pte_reading, pte_writing, pte_speaking, last_verified_at, source_url, degree_level:degree_levels(name), subject:subjects(name)",
    )
    .eq("university_id", universityId)
    .eq("status", "published")
    .order("name");

  if (error) throw error;
  return (data ?? []) as unknown as PublicProgramRow[];
}

export type PublicProgramDetail = PublicProgramRow & {
  description: string | null;
  curriculum: string | null;
  university: {
    id: string;
    slug: string;
    name: string;
    status: string;
    city: string | null;
    apply_url: string | null;
    application_fee: number | null;
    tuition_international: number | null;
    tuition_domestic: number | null;
    tuition_domestic_is_csp: boolean | null;
    currency: string;
    ielts_overall: number | null;
    ielts_listening: number | null;
    ielts_reading: number | null;
    ielts_writing: number | null;
    ielts_speaking: number | null;
    pte_overall: number | null;
    pte_listening: number | null;
    pte_reading: number | null;
    pte_writing: number | null;
    pte_speaking: number | null;
    country: { code: string; name: string } | null;
  } | null;
};

const PROGRAM_DETAIL_SELECT = `id, slug, name, description, curriculum, duration_years, tuition_international, tuition_domestic, tuition_domestic_is_csp, currency, application_url, admission_requirements, english_requirements, ielts_overall, ielts_listening, ielts_reading, ielts_writing, ielts_speaking, pte_overall, pte_listening, pte_reading, pte_writing, pte_speaking, last_verified_at, source_url,
      degree_level:degree_levels(name), subject:subjects(name),
      university:universities!inner(id, slug, name, status, city, apply_url, application_fee, tuition_international, tuition_domestic, tuition_domestic_is_csp, currency, ielts_overall, ielts_listening, ielts_reading, ielts_writing, ielts_speaking, pte_overall, pte_listening, pte_reading, pte_writing, pte_speaking, country:countries!inner(code, name, is_launched))`;

/**
 * Fetches a single published program by its slug + parent university slug,
 * along with the university's fallback fields (tuition/English scores) — a
 * program's own value wins when set, the university default fills in
 * otherwise, same pattern as ProgramsList's per-program fallback.
 */
export async function getPublishedProgramBySlug(
  universitySlug: string,
  programSlug: string,
): Promise<PublicProgramDetail | null> {
  const supabase = createPublicClient(["programs:list", `program:${programSlug}`]);
  const { data, error } = await supabase
    .from("programs")
    .select(PROGRAM_DETAIL_SELECT)
    .eq("slug", programSlug)
    .eq("university.slug", universitySlug)
    .eq("status", "published")
    .eq("university.country.is_launched", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return data as unknown as PublicProgramDetail;
}

/**
 * Resolves a legacy `/programs/{uuid}` URL to its current slug URL. The UUID
 * is the immutable primary key, so this lookup (and the 301 the route issues
 * from it) is permanent — no redirect table needed.
 */
export async function resolveProgramSlugById(
  programId: string,
): Promise<{ universitySlug: string; programSlug: string } | null> {
  const supabase = createPublicClient(["programs:list"]);
  const { data, error } = await supabase
    .from("programs")
    .select("slug, university:universities!inner(slug, status, country:countries!inner(is_launched))")
    .eq("id", programId)
    .eq("status", "published")
    .eq("university.country.is_launched", true)
    .maybeSingle();

  if (error) throw error;
  const row = data as unknown as
    | { slug: string; university: { slug: string; status: string } | null }
    | null;
  if (!row || !row.university || row.university.status !== "published") return null;
  return { universitySlug: row.university.slug, programSlug: row.slug };
}

export type SitemapProgramRow = {
  slug: string;
  updated_at: string | null;
  description: string | null;
  curriculum: string | null;
  university: { slug: string; status: string } | null;
};

/**
 * All published programs at launched universities, with the fields needed to
 * decide indexability (`isProgramIndexable`) and their parent university's
 * slug, for the sitemap. The caller filters to indexable rows. Paginated in
 * pages of 1000 — PostgREST's default response cap, already hit once before
 * by this project's own program count (see PROJECT_STATUS.md Section 13's
 * "1,103 total AU program rows" note).
 */
export async function listPublishedProgramsForSitemap(): Promise<SitemapProgramRow[]> {
  const supabase = createPublicClient(["programs:list"]);
  const pageSize = 1000;
  const rows: SitemapProgramRow[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("programs")
      .select(
        "slug, updated_at, description, curriculum, university:universities!inner(slug, status, country:countries!inner(is_launched))",
      )
      .eq("status", "published")
      .eq("university.status", "published")
      .eq("university.country.is_launched", true)
      .range(from, from + pageSize - 1);

    if (error) throw error;
    rows.push(...((data ?? []) as unknown as SitemapProgramRow[]));
    if (!data || data.length < pageSize) break;
  }

  return rows;
}
