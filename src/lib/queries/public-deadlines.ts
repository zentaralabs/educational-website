import { createPublicClient } from "@/lib/supabase/public";

export type PublicDeadlineRow = {
  id: string;
  deadline_date: string;
  is_rolling: boolean;
  university: { name: string; slug: string } | null;
  deadline_type: { name: string } | null;
  degree_level: { name: string } | null;
  country: { code: string; name: string } | null;
};

export type DeadlineFilters = {
  country?: string;
  degreeLevel?: string;
  type?: string;
};

const PAGE_SIZE = 40;

export async function listPublishedDeadlines(
  filters: DeadlineFilters = {},
  page = 1,
): Promise<{ rows: PublicDeadlineRow[]; totalCount: number; pageSize: number }> {
  const supabase = createPublicClient(["deadlines:list"]);

  let query = supabase
    .from("deadlines")
    .select(
      "id, deadline_date, is_rolling, university:universities!inner(name, slug, country:countries!inner(code, name)), deadline_type:deadline_types!inner(name), degree_level:degree_levels!inner(name)",
      { count: "exact" },
    )
    .eq("status", "published")
    .eq("university.country.is_launched", true)
    .order("deadline_date");

  if (filters.country) {
    query = query.eq("university.country.code", filters.country);
  }
  if (filters.degreeLevel) {
    query = query.eq("degree_level.name", filters.degreeLevel);
  }
  if (filters.type) {
    query = query.eq("deadline_type.name", filters.type);
  }

  const from = (page - 1) * PAGE_SIZE;
  const { data, error, count } = await query.range(from, from + PAGE_SIZE - 1);
  if (error) throw error;

  const rows = ((data ?? []) as unknown as (Omit<PublicDeadlineRow, "country"> & {
    university: { name: string; slug: string; country: { code: string; name: string } | null } | null;
  })[]).map((row) => ({
    ...row,
    country: row.university?.country ?? null,
  }));

  return { rows, totalCount: count ?? 0, pageSize: PAGE_SIZE };
}

/**
 * The next few genuine (non-rolling) deadlines still in the future — for the
 * homepage "upcoming deadlines" strip. Kept separate from listPublishedDeadlines
 * so the homepage doesn't pull the full paginated/filterable set.
 */
export async function listUpcomingDeadlines(limit = 5): Promise<PublicDeadlineRow[]> {
  const supabase = createPublicClient(["deadlines:list"]);
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("deadlines")
    .select(
      "id, deadline_date, is_rolling, university:universities!inner(name, slug, country:countries!inner(code, name)), deadline_type:deadline_types!inner(name), degree_level:degree_levels!inner(name)",
    )
    .eq("status", "published")
    .eq("university.country.is_launched", true)
    .eq("is_rolling", false)
    .gte("deadline_date", today)
    .order("deadline_date")
    .limit(limit);

  if (error) throw error;

  return ((data ?? []) as unknown as (Omit<PublicDeadlineRow, "country"> & {
    university: {
      name: string;
      slug: string;
      country: { code: string; name: string } | null;
    } | null;
  })[]).map((row) => ({ ...row, country: row.university?.country ?? null }));
}

export async function listDeadlineFilterOptions() {
  const supabase = createPublicClient(["deadlines:list"]);
  const [countries, published] = await Promise.all([
    supabase.from("countries").select("code, name").eq("is_launched", true).order("code"),
    // Only surface degree levels and intake types that actually have
    // published, launched-country deadlines — otherwise the dropdowns list
    // dead options (e.g. US-style "Early Decision") that return nothing.
    supabase
      .from("deadlines")
      .select(
        "degree_level:degree_levels!inner(name), deadline_type:deadline_types!inner(name), university:universities!inner(country:countries!inner(is_launched))",
      )
      .eq("status", "published")
      .eq("university.country.is_launched", true),
  ]);

  if (countries.error) throw countries.error;
  if (published.error) throw published.error;

  const rows = (published.data ?? []) as unknown as {
    degree_level: { name: string } | null;
    deadline_type: { name: string } | null;
  }[];

  return {
    countries: countries.data ?? [],
    degreeLevels: [...new Set(rows.map((r) => r.degree_level?.name).filter(Boolean))].sort() as string[],
    deadlineTypes: [...new Set(rows.map((r) => r.deadline_type?.name).filter(Boolean))].sort() as string[],
  };
}
