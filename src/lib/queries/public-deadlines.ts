import type { DeadlineDateKind } from "@/lib/deadline-status";
import { createPublicClient } from "@/lib/supabase/public";

export type PublicDeadlineRow = {
  id: string;
  deadline_date: string;
  is_rolling: boolean;
  date_kind: DeadlineDateKind;
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
      "id, deadline_date, is_rolling, date_kind, university:universities!inner(name, slug, country:countries!inner(code, name)), deadline_type:deadline_types!inner(name), degree_level:degree_levels!inner(name)",
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
 * The next few genuine deadlines still in the future — for the homepage
 * "upcoming deadlines" strip. Kept separate from listPublishedDeadlines so
 * the homepage doesn't pull the full paginated/filterable set.
 *
 * Restricted to university-published closing dates. The strip is labelled
 * "closing soon", which is only true of a date the university actually set;
 * our own recommended apply-by guidance would put four identical anchor
 * dates on the homepage and call them deadlines.
 */
export async function listUpcomingDeadlines(limit = 5): Promise<PublicDeadlineRow[]> {
  const supabase = createPublicClient(["deadlines:list"]);
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("deadlines")
    .select(
      "id, deadline_date, is_rolling, date_kind, university:universities!inner(name, slug, country:countries!inner(code, name)), deadline_type:deadline_types!inner(name), degree_level:degree_levels!inner(name)",
    )
    .eq("status", "published")
    .eq("university.country.is_launched", true)
    .eq("date_kind", "closing_date")
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

export type IntakeDeadlineRow = {
  id: string;
  deadline_date: string;
  is_rolling: boolean;
  date_kind: DeadlineDateKind;
  notes: string | null;
  last_verified_at: string | null;
  source_url: string | null;
  university: { name: string; slug: string } | null;
  deadline_type: { name: string } | null;
  degree_level: { name: string } | null;
};

/**
 * Every published deadline row for a set of intake types (e.g. ["Semester 1"]
 * for the February intake), across all launched-country universities, with
 * the notes / verification fields the per-intake hub tables need. Unpaginated
 * on purpose: the hub renders one master table of the whole set, grouped by
 * university. ~110 rows at present, well under the PostgREST default cap.
 */
export async function listIntakeDeadlines(
  intakeTypes: string[],
): Promise<IntakeDeadlineRow[]> {
  const supabase = createPublicClient(["deadlines:list"]);

  const { data, error } = await supabase
    .from("deadlines")
    .select(
      "id, deadline_date, is_rolling, date_kind, notes, last_verified_at, source_url, university:universities!inner(name, slug, country:countries!inner(is_launched)), deadline_type:deadline_types!inner(name), degree_level:degree_levels!inner(name)",
    )
    .eq("status", "published")
    .eq("university.country.is_launched", true)
    .in("deadline_type.name", intakeTypes)
    .order("deadline_date");

  if (error) throw error;

  return ((data ?? []) as unknown as IntakeDeadlineRow[]).map((row) => ({
    id: row.id,
    deadline_date: row.deadline_date,
    is_rolling: row.is_rolling,
    date_kind: row.date_kind,
    notes: row.notes,
    last_verified_at: row.last_verified_at,
    source_url: row.source_url,
    university: row.university
      ? { name: row.university.name, slug: row.university.slug }
      : null,
    deadline_type: row.deadline_type,
    degree_level: row.degree_level,
  }));
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
