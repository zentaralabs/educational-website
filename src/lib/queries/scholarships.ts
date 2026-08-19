import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContentStatus, Database } from "@/lib/supabase/types";

export type ScholarshipListRow = Database["public"]["Tables"]["scholarships"]["Row"] & {
  scholarship_universities: { university_id: string }[];
};

export async function listScholarships(
  supabase: SupabaseClient<Database>,
): Promise<ScholarshipListRow[]> {
  const { data, error } = await supabase
    .from("scholarships")
    .select("*, scholarship_universities(university_id)")
    .order("name");

  if (error) throw error;
  return (data ?? []) as unknown as ScholarshipListRow[];
}

export type ScholarshipDetailRow =
  Database["public"]["Tables"]["scholarships"]["Row"] & {
    scholarship_universities: { university_id: string }[];
  };

export async function getScholarship(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<ScholarshipDetailRow | null> {
  const { data, error } = await supabase
    .from("scholarships")
    .select("*, scholarship_universities(university_id)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as ScholarshipDetailRow | null;
}

export async function updateScholarship(
  supabase: SupabaseClient<Database>,
  id: string,
  patch: Database["public"]["Tables"]["scholarships"]["Update"],
) {
  const { error } = await supabase.from("scholarships").update(patch).eq("id", id);
  if (error) throw error;
}

export async function syncScholarshipUniversities(
  supabase: SupabaseClient<Database>,
  scholarshipId: string,
  universityIds: string[],
) {
  const { error: deleteError } = await supabase
    .from("scholarship_universities")
    .delete()
    .eq("scholarship_id", scholarshipId);
  if (deleteError) throw deleteError;

  if (universityIds.length === 0) return;

  const { error: insertError } = await supabase
    .from("scholarship_universities")
    .insert(universityIds.map((university_id) => ({ scholarship_id: scholarshipId, university_id })));
  if (insertError) throw insertError;
}

export async function bulkUpdateScholarshipStatus(
  supabase: SupabaseClient<Database>,
  ids: string[],
  status: ContentStatus,
) {
  const { error } = await supabase.from("scholarships").update({ status }).in("id", ids);
  if (error) throw error;
}
