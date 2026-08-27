import { createPublicClient } from "@/lib/supabase/public";

export type PublicScholarshipListRow = {
  slug: string;
  name: string;
  scope: string;
  amount: string | null;
  study_level: string | null;
  separate_application: boolean | null;
  deadline_date: string | null;
  country: { code: string; name: string } | null;
  universities: { slug: string; name: string }[];
};

type RawRow = Omit<PublicScholarshipListRow, "country" | "universities"> & {
  country: { code: string; name: string; is_launched: boolean } | null;
  scholarship_universities: {
    university: { slug: string; name: string; status: string } | null;
  }[];
};

const SELECT =
  "slug, name, scope, amount, study_level, separate_application, deadline_date, " +
  "country:countries(code, name, is_launched), " +
  "scholarship_universities(university:universities(slug, name, status))";

function mapRow(r: RawRow): PublicScholarshipListRow {
  return {
    slug: r.slug,
    name: r.name,
    scope: r.scope,
    amount: r.amount,
    study_level: r.study_level,
    separate_application: r.separate_application,
    deadline_date: r.deadline_date,
    country: r.country
      ? { code: r.country.code, name: r.country.name }
      : null,
    universities: (r.scholarship_universities ?? [])
      .map((su) => su.university)
      .filter((u): u is { slug: string; name: string; status: string } =>
        Boolean(u && u.status === "published"),
      )
      .map((u) => ({ slug: u.slug, name: u.name })),
  };
}

// A scholarship is publicly visible if it's published and either country-agnostic
// or tied to a launched country (national/external), matching how guides gate.
function isVisible(r: RawRow): boolean {
  return !r.country || r.country.is_launched;
}

export async function listPublishedScholarships(opts: {
  scope?: string;
  studyLevel?: string;
  universitySlug?: string;
} = {}): Promise<PublicScholarshipListRow[]> {
  const supabase = createPublicClient(["scholarships:list"]);
  let query = supabase
    .from("scholarships")
    .select(SELECT)
    .eq("status", "published")
    .order("scope")
    .order("name");

  if (opts.scope) query = query.eq("scope", opts.scope);
  if (opts.studyLevel) query = query.eq("study_level", opts.studyLevel);

  const { data, error } = await query;
  if (error) throw error;

  let rows = ((data ?? []) as unknown as RawRow[]).filter(isVisible).map(mapRow);
  if (opts.universitySlug) {
    rows = rows.filter((r) =>
      r.universities.some((u) => u.slug === opts.universitySlug),
    );
  }
  return rows;
}

export async function listPublishedScholarshipSlugs(): Promise<string[]> {
  const rows = await listPublishedScholarships();
  return rows.map((r) => r.slug);
}

export type PublicScholarshipDetail = PublicScholarshipListRow & {
  eligibility: string | null;
  description: string | null;
  external_url: string | null;
  source_url: string | null;
  last_verified_at: string | null;
};

export async function getPublishedScholarship(
  slug: string,
): Promise<PublicScholarshipDetail | null> {
  const supabase = createPublicClient([`scholarship:${slug}`, "scholarships:list"]);
  const { data, error } = await supabase
    .from("scholarships")
    .select(
      SELECT +
        ", eligibility, description, external_url, source_url, last_verified_at",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const raw = data as unknown as RawRow & {
    eligibility: string | null;
    description: string | null;
    external_url: string | null;
    source_url: string | null;
    last_verified_at: string | null;
  };
  if (!isVisible(raw)) return null;

  return {
    ...mapRow(raw),
    eligibility: raw.eligibility,
    description: raw.description,
    external_url: raw.external_url,
    source_url: raw.source_url,
    last_verified_at: raw.last_verified_at,
  };
}

/** Distinct study-level values across published, visible scholarships. */
export async function listScholarshipStudyLevels(): Promise<string[]> {
  const rows = await listPublishedScholarships();
  return [...new Set(rows.map((r) => r.study_level).filter((l): l is string => !!l))].sort();
}
