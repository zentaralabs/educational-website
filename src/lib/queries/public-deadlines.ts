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

export async function listPublishedDeadlines(
  filters: DeadlineFilters = {},
): Promise<PublicDeadlineRow[]> {
  const supabase = createPublicClient(["deadlines:list"]);

  let query = supabase
    .from("deadlines")
    .select(
      "id, deadline_date, is_rolling, university:universities!inner(name, slug, country:countries!inner(code, name)), deadline_type:deadline_types(name), degree_level:degree_levels(name)",
    )
    .eq("status", "published")
    .order("deadline_date");

  if (filters.country) {
    query = query.eq("university.country.code", filters.country);
  }

  const { data, error } = await query;
  if (error) throw error;

  let rows = ((data ?? []) as unknown as (Omit<PublicDeadlineRow, "country"> & {
    university: { name: string; slug: string; country: { code: string; name: string } | null } | null;
    degree_level: { name: string } | null;
    deadline_type: { name: string } | null;
  })[]).map((row) => ({
    ...row,
    country: row.university?.country ?? null,
  }));

  if (filters.degreeLevel) {
    rows = rows.filter((r) => r.degree_level?.name === filters.degreeLevel);
  }
  if (filters.type) {
    rows = rows.filter((r) => r.deadline_type?.name === filters.type);
  }

  return rows;
}

export async function listDeadlineFilterOptions() {
  const supabase = createPublicClient(["deadlines:list"]);
  const [countries, degreeLevels, deadlineTypes] = await Promise.all([
    supabase.from("countries").select("code, name").order("code"),
    supabase.from("degree_levels").select("name").order("name"),
    supabase.from("deadline_types").select("name").order("name"),
  ]);

  if (countries.error) throw countries.error;
  if (degreeLevels.error) throw degreeLevels.error;
  if (deadlineTypes.error) throw deadlineTypes.error;

  return {
    countries: countries.data ?? [],
    degreeLevels: (degreeLevels.data ?? []).map((d) => d.name),
    deadlineTypes: (deadlineTypes.data ?? []).map((d) => d.name),
  };
}
