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

type ProgramEditableFields =
  | "name"
  | "degree_level_id"
  | "subject_id"
  | "duration_years"
  | "tuition_international"
  | "tuition_domestic"
  | "tuition_domestic_is_csp"
  | "currency"
  | "application_url"
  | "description"
  | "curriculum"
  | "admission_requirements"
  | "english_requirements"
  | "ielts_overall"
  | "ielts_listening"
  | "ielts_reading"
  | "ielts_writing"
  | "ielts_speaking"
  | "pte_overall"
  | "pte_listening"
  | "pte_reading"
  | "pte_writing"
  | "pte_speaking"
  | "source_url";

// House style: no em dashes in anything that renders on the public site.
// `curriculum` is exempt: its " — " is a field delimiter parsed out by
// parseCurriculumLine(), never shown.
const NO_EM_DASH_FIELDS = [
  "name",
  "description",
  "admission_requirements",
  "english_requirements",
] as const;

function assertNoEmDashes(record: Record<string, unknown>) {
  for (const field of NO_EM_DASH_FIELDS) {
    const value = record[field];
    if (typeof value === "string" && value.includes("—")) {
      throw new Error(`Remove em dashes from "${field}" before saving (house style).`);
    }
  }
}

export async function createProgram(
  supabase: SupabaseClient<Database>,
  input: Pick<
    Database["public"]["Tables"]["programs"]["Insert"],
    "university_id" | ProgramEditableFields
  >,
): Promise<string> {
  assertNoEmDashes(input);
  const { data, error } = await supabase
    .from("programs")
    .insert({ ...input, status: "draft" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateProgram(
  supabase: SupabaseClient<Database>,
  id: string,
  patch: Pick<Database["public"]["Tables"]["programs"]["Update"], ProgramEditableFields>,
) {
  assertNoEmDashes(patch);
  const { error } = await supabase.from("programs").update(patch).eq("id", id);
  if (error) throw error;
}

export async function updateProgramStatus(
  supabase: SupabaseClient<Database>,
  id: string,
  status: ContentStatus,
) {
  // A published program must have an "About this program" description. The
  // bulk import left ~500 rows with an empty description published, which
  // rendered as a blank section and forced a site-wide noindex on all
  // program pages. Block that class of regression at the write path.
  if (status === "published") {
    const { data, error: fetchError } = await supabase
      .from("programs")
      .select("description")
      .eq("id", id)
      .single();
    if (fetchError) throw fetchError;
    if (!data.description || !data.description.trim()) {
      throw new Error(
        "Add an About this program description before publishing (empty program pages are noindexed).",
      );
    }
  }

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
