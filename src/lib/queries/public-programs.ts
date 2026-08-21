import { createPublicClient } from "@/lib/supabase/public";

export type PublicProgramRow = {
  id: string;
  name: string;
  duration_years: number | null;
  tuition_international: number | null;
  tuition_domestic: number | null;
  tuition_domestic_is_csp: boolean | null;
  currency: string | null;
  application_url: string | null;
  admission_requirements: string | null;
  english_requirements: string | null;
  last_verified_at: string | null;
  source_url: string | null;
  degree_level: { name: string } | null;
  subject: { name: string } | null;
};

export async function getPublishedProgramsForUniversity(
  universityId: string,
): Promise<PublicProgramRow[]> {
  const supabase = createPublicClient(["programs:list"]);
  const { data, error } = await supabase
    .from("programs")
    .select(
      "id, name, duration_years, tuition_international, tuition_domestic, tuition_domestic_is_csp, currency, application_url, admission_requirements, english_requirements, last_verified_at, source_url, degree_level:degree_levels(name), subject:subjects(name)",
    )
    .eq("university_id", universityId)
    .eq("status", "published")
    .order("name");

  if (error) throw error;
  return (data ?? []) as unknown as PublicProgramRow[];
}
