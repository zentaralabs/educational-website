import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContentStatus, Database } from "@/lib/supabase/types";

export type UniversityListRow = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  institution_type: string | null;
  acceptance_rate: number | null;
  selectivity_band: string | null;
  status: ContentStatus;
  last_verified_at: string | null;
  country: { code: string; name: string } | null;
  author: { name: string } | null;
};

export async function listUniversities(
  supabase: SupabaseClient<Database>,
): Promise<UniversityListRow[]> {
  const { data, error } = await supabase
    .from("universities")
    .select(
      "id, slug, name, city, institution_type, acceptance_rate, selectivity_band, status, last_verified_at, country:countries(code, name), author:authors!author_id(name)",
    )
    .order("name");

  if (error) throw error;
  return (data ?? []) as unknown as UniversityListRow[];
}

export type UniversityDetailRow =
  Database["public"]["Tables"]["universities"]["Row"] & {
    country: { id: number; code: string; name: string } | null;
    author: { name: string } | null;
  };

export async function getUniversity(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<UniversityDetailRow | null> {
  const { data, error } = await supabase
    .from("universities")
    .select("*, country:countries(id, code, name), author:authors!author_id(name)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as UniversityDetailRow | null;
}

export async function bulkUpdateUniversityStatus(
  supabase: SupabaseClient<Database>,
  ids: string[],
  status: ContentStatus,
) {
  const { error } = await supabase
    .from("universities")
    .update({ status })
    .in("id", ids);

  if (error) throw error;
}

export async function updateUniversity(
  supabase: SupabaseClient<Database>,
  id: string,
  patch: Database["public"]["Tables"]["universities"]["Update"],
) {
  const { error } = await supabase.from("universities").update(patch).eq("id", id);
  if (error) throw error;
}

export async function createUniversity(
  supabase: SupabaseClient<Database>,
  input: Pick<
    Database["public"]["Tables"]["universities"]["Insert"],
    "name" | "slug" | "country_id" | "author_id"
  >,
): Promise<string> {
  const { data, error } = await supabase
    .from("universities")
    .insert({ ...input, status: "draft" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function listCountries(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("countries")
    .select("id, code, name")
    .order("code");
  if (error) throw error;
  return data ?? [];
}
