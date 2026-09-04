import { createPublicClient } from "@/lib/supabase/public";

export type PublicOccupationListRow = {
  slug: string;
  name: string;
  anzsco_code: string;
  skill_level: number | null;
  summary: string | null;
  mltssl: boolean;
  stsol: boolean;
  rol: boolean;
  csol: boolean;
  updated_at: string;
};

const LIST_COLUMNS =
  "slug, name, anzsco_code, skill_level, summary, mltssl, stsol, rol, csol, updated_at";

export async function listPublishedOccupations(): Promise<PublicOccupationListRow[]> {
  const supabase = createPublicClient(["occupations:list"]);
  const { data, error } = await supabase
    .from("occupations")
    .select(LIST_COLUMNS)
    .eq("status", "published")
    .order("name");
  if (error) throw error;
  return (data ?? []) as PublicOccupationListRow[];
}

export type PublicOccupationRow = {
  slug: string;
  name: string;
  anzsco_code: string;
  skill_level: number | null;
  assessing_authority: string | null;
  assessing_authority_url: string | null;
  mltssl: boolean;
  stsol: boolean;
  rol: boolean;
  csol: boolean;
  visa_pathway_note: string | null;
  summary: string | null;
  last_verified_at: string | null;
  source_url: string | null;
  updated_at: string;
};

export async function getPublishedOccupation(
  slug: string,
): Promise<PublicOccupationRow | null> {
  const supabase = createPublicClient([`occupation:${slug}`, "occupations:list"]);
  const { data, error } = await supabase
    .from("occupations")
    .select(
      "slug, name, anzsco_code, skill_level, assessing_authority, assessing_authority_url, mltssl, stsol, rol, csol, visa_pathway_note, summary, last_verified_at, source_url, updated_at",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return data as PublicOccupationRow | null;
}

export async function listPublishedOccupationSlugs(): Promise<string[]> {
  const rows = await listPublishedOccupations();
  return rows.map((r) => r.slug);
}

/**
 * slug + updated_at for the sitemap's per-page `lastmod`, restricted to
 * occupations with at least one linked program — the same bar
 * generateMetadata's `robots.index` uses, so the sitemap never advertises a
 * page Google would find noindex.
 */
export async function listPublishedOccupationSlugsForSitemap(): Promise<
  { slug: string; updatedAt: string | null }[]
> {
  const [occupations, linkedSlugs] = await Promise.all([
    listPublishedOccupations(),
    listOccupationSlugsWithPrograms(),
  ]);
  const linked = new Set(linkedSlugs);
  return occupations
    .filter((r) => linked.has(r.slug))
    .map((r) => ({ slug: r.slug, updatedAt: r.updated_at }));
}

/**
 * `program_occupations` has thousands of rows (one per program x linked
 * occupation), well past PostgREST's default 1000-row page cap — a first cut
 * of this query silently returned only the first ~1000 rows and dropped most
 * occupations from the sitemap without erroring. Paginate through all of it,
 * same pattern as listPublishedProgramsForSitemap.
 */
async function listOccupationSlugsWithPrograms(): Promise<string[]> {
  const supabase = createPublicClient(["occupations:list"]);
  const pageSize = 1000;
  const slugs = new Set<string>();

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("program_occupations")
      .select(
        "occupation:occupations!inner(slug, status), program:programs!inner(status, university:universities!inner(status, country:countries!inner(is_launched)))",
      )
      .eq("occupation.status", "published")
      .eq("program.status", "published")
      .eq("program.university.status", "published")
      .eq("program.university.country.is_launched", true)
      .range(from, from + pageSize - 1);

    if (error) throw error;
    for (const row of (data ?? []) as unknown as Array<{ occupation: { slug: string } }>) {
      slugs.add(row.occupation.slug);
    }
    if (!data || data.length < pageSize) break;
  }

  return [...slugs];
}

export type OccupationProgram = {
  relevance: "primary" | "related";
  program: {
    slug: string;
    name: string;
    degree_level: { name: string } | null;
  };
  university: {
    slug: string;
    name: string;
    city: string | null;
  };
};

/**
 * The reverse lookup that makes an occupation page worth indexing: every
 * published program at a published, launched-country university that leads
 * to this occupation. This is the one thing a migration-agent SOL page can't
 * copy without our program database (see memory: occupation-pathway-feature).
 */
export async function getProgramsForOccupation(
  occupationSlug: string,
): Promise<OccupationProgram[]> {
  const supabase = createPublicClient([`occupation-programs:${occupationSlug}`]);
  const { data, error } = await supabase
    .from("program_occupations")
    .select(
      "relevance, program:programs!inner(slug, name, status, degree_level:degree_levels(name), university:universities!inner(slug, name, city, status, country:countries!inner(is_launched))), occupation:occupations!inner(slug, status)",
    )
    .eq("occupation.slug", occupationSlug)
    .eq("occupation.status", "published")
    .eq("program.status", "published")
    .eq("program.university.status", "published")
    .eq("program.university.country.is_launched", true);

  if (error) throw error;
  return ((data ?? []) as unknown as Array<{
    relevance: "primary" | "related";
    program: {
      slug: string;
      name: string;
      degree_level: { name: string } | null;
      university: { slug: string; name: string; city: string | null };
    };
  }>).map((row) => ({
    relevance: row.relevance,
    program: {
      slug: row.program.slug,
      name: row.program.name,
      degree_level: row.program.degree_level,
    },
    university: row.program.university,
  }));
}
