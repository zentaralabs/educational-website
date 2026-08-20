import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export async function listCountries(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.from("countries").select("*").order("code");
  if (error) throw error;
  return data ?? [];
}

export async function addCountry(
  supabase: SupabaseClient<Database>,
  code: string,
  name: string,
) {
  const { data, error } = await supabase
    .from("countries")
    .insert({ code, name })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCountry(supabase: SupabaseClient<Database>, id: number) {
  const { error } = await supabase.from("countries").delete().eq("id", id);
  if (error) throw error;
}

export async function listDegreeLevels(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.from("degree_levels").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function addDegreeLevel(supabase: SupabaseClient<Database>, name: string) {
  const { data, error } = await supabase
    .from("degree_levels")
    .insert({ name })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDegreeLevel(supabase: SupabaseClient<Database>, id: number) {
  const { error } = await supabase.from("degree_levels").delete().eq("id", id);
  if (error) throw error;
}

export async function listDeadlineTypes(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.from("deadline_types").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function addDeadlineType(supabase: SupabaseClient<Database>, name: string) {
  const { data, error } = await supabase
    .from("deadline_types")
    .insert({ name })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDeadlineType(supabase: SupabaseClient<Database>, id: number) {
  const { error } = await supabase.from("deadline_types").delete().eq("id", id);
  if (error) throw error;
}

export type ApplicationPlatformRow = {
  id: number;
  name: string;
  country_id: number | null;
  country: { code: string; name: string } | null;
};

export async function listApplicationPlatforms(
  supabase: SupabaseClient<Database>,
): Promise<ApplicationPlatformRow[]> {
  const { data, error } = await supabase
    .from("application_platforms")
    .select("*, country:countries(code, name)")
    .order("name");
  if (error) throw error;
  return (data ?? []) as unknown as ApplicationPlatformRow[];
}

export async function addApplicationPlatform(
  supabase: SupabaseClient<Database>,
  name: string,
  countryId: number | null,
) {
  const { data, error } = await supabase
    .from("application_platforms")
    .insert({ name, country_id: countryId })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteApplicationPlatform(
  supabase: SupabaseClient<Database>,
  id: number,
) {
  const { error } = await supabase.from("application_platforms").delete().eq("id", id);
  if (error) throw error;
}
