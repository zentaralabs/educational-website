import { createPublicClient } from "@/lib/supabase/public";

export type PublicCountry = { code: string; name: string };

export async function listPublicCountries(): Promise<PublicCountry[]> {
  const supabase = createPublicClient(["countries:list"]);
  const { data, error } = await supabase
    .from("countries")
    .select("code, name")
    .order("name");
  if (error) throw error;
  return data ?? [];
}
