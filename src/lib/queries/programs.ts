import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContentStatus, Database } from "@/lib/supabase/types";

export type ProgramRow = Database["public"]["Tables"]["programs"]["Row"] & {
  degree_level: { id: number; name: string } | null;
  subject: { id: number; name: string } | null;
};

export async function listProgramsForUniversity(
  supabase: SupabaseClient<Database>,
  universityId: string,
): Promise<ProgramRow[]> {
  const { data, error } = await supabase
    .from("programs")
    .select("*, degree_level:degree_levels(id, name), subject:subjects(id, name)")
    .eq("university_id", universityId)
    .order("name");

  if (error) throw error;
  return (data ?? []) as unknown as ProgramRow[];
}

export async function createProgram(
  supabase: SupabaseClient<Database>,
  input: Pick<
    Database["public"]["Tables"]["programs"]["Insert"],
    | "university_id"
    | "name"
    | "degree_level_id"
    | "subject_id"
    | "duration_years"
    | "tuition_international"
    | "tuition_domestic"
    | "tuition_domestic_is_csp"
    | "currency"
    | "application_url"
    | "admission_requirements"
    | "english_requirements"
    | "source_url"
  >,
): Promise<string> {
  const { data, error } = await supabase
    .from("programs")
    .insert({ ...input, status: "draft" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateProgramStatus(
  supabase: SupabaseClient<Database>,
  id: string,
  status: ContentStatus,
) {
  const { error } = await supabase
    .from("programs")
    .update({
      status,
      ...(status === "published"
        ? { last_verified_at: new Date().toISOString().slice(0, 10) }
        : {}),
    })
    .eq("id", id);
  if (error) throw error;
}
