import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, ExperienceSubmissionStatus } from "@/lib/supabase/types";

export type ExperienceSubmissionRow =
  Database["public"]["Tables"]["experience_submissions"]["Row"];

export type NewExperienceSubmission = {
  page_path: string;
  page_label?: string | null;
  is_anonymous: boolean;
  contributor_name?: string | null;
  contact_email?: string | null;
  portal_step?: string | null;
  surprised_notes: string;
  timeline_notes?: string | null;
  consent: boolean;
};

/** Public write — used from the reader-facing form. RLS requires consent = true and status = 'pending'. */
export async function submitExperience(
  supabase: SupabaseClient<Database>,
  input: NewExperienceSubmission,
) {
  const { error } = await supabase.from("experience_submissions").insert({
    ...input,
    status: "pending",
  });
  if (error) throw error;
}

/** Staff-only read — RLS restricts this table to is_staff(). */
export async function listExperienceSubmissions(
  supabase: SupabaseClient<Database>,
): Promise<ExperienceSubmissionRow[]> {
  const { data, error } = await supabase
    .from("experience_submissions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Admin-only write — RLS restricts this to is_staff_admin(). */
export async function setExperienceSubmissionStatus(
  supabase: SupabaseClient<Database>,
  id: string,
  status: ExperienceSubmissionStatus,
  adminNotes?: string | null,
) {
  const { error } = await supabase
    .from("experience_submissions")
    .update({ status, admin_notes: adminNotes ?? null })
    .eq("id", id);
  if (error) throw error;
}
