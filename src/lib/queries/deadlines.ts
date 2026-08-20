import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContentStatus, Database } from "@/lib/supabase/types";

export type DeadlineListRow = {
  id: string;
  deadline_date: string;
  is_rolling: boolean;
  status: ContentStatus;
  last_verified_at: string | null;
  university: { id: string; name: string; slug: string } | null;
  degree_level: { id: number; name: string } | null;
  deadline_type: { id: number; name: string } | null;
  application_platform: { id: number; name: string } | null;
};

export async function listDeadlines(
  supabase: SupabaseClient<Database>,
): Promise<DeadlineListRow[]> {
  const { data, error } = await supabase
    .from("deadlines")
    .select(
      "id, deadline_date, is_rolling, status, last_verified_at, university:universities(id, name, slug), degree_level:degree_levels(id, name), deadline_type:deadline_types(id, name), application_platform:application_platforms(id, name)",
    )
    .order("deadline_date");

  if (error) throw error;
  return (data ?? []) as unknown as DeadlineListRow[];
}

export async function updateDeadlineDate(
  supabase: SupabaseClient<Database>,
  id: string,
  deadline_date: string,
) {
  const { error } = await supabase
    .from("deadlines")
    .update({ deadline_date })
    .eq("id", id);
  if (error) throw error;
}

export async function bulkUpdateDeadlines(
  supabase: SupabaseClient<Database>,
  ids: string[],
  patch: Database["public"]["Tables"]["deadlines"]["Update"],
) {
  const { error } = await supabase.from("deadlines").update(patch).in("id", ids);
  if (error) throw error;
}

export async function createDeadline(
  supabase: SupabaseClient<Database>,
  input: Pick<
    Database["public"]["Tables"]["deadlines"]["Insert"],
    | "university_id"
    | "degree_level_id"
    | "deadline_type_id"
    | "deadline_date"
    | "application_platform_id"
    | "is_rolling"
  >,
): Promise<string> {
  const { data, error } = await supabase
    .from("deadlines")
    .insert({ ...input, status: "draft" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function insertDeadlines(
  supabase: SupabaseClient<Database>,
  rows: Database["public"]["Tables"]["deadlines"]["Insert"][],
) {
  if (rows.length === 0) return;
  const { error } = await supabase.from("deadlines").insert(rows);
  if (error) throw error;
}

export async function listDeadlineLookups(supabase: SupabaseClient<Database>) {
  const [degreeLevels, deadlineTypes, applicationPlatforms, universities] =
    await Promise.all([
      supabase.from("degree_levels").select("id, name").order("id"),
      supabase.from("deadline_types").select("id, name").order("id"),
      supabase.from("application_platforms").select("id, name").order("id"),
      supabase.from("universities").select("id, name, slug").order("name"),
    ]);

  if (degreeLevels.error) throw degreeLevels.error;
  if (deadlineTypes.error) throw deadlineTypes.error;
  if (applicationPlatforms.error) throw applicationPlatforms.error;
  if (universities.error) throw universities.error;

  return {
    degreeLevels: degreeLevels.data ?? [],
    deadlineTypes: deadlineTypes.data ?? [],
    applicationPlatforms: applicationPlatforms.data ?? [],
    universities: universities.data ?? [],
  };
}
