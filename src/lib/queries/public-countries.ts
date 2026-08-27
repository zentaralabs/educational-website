import { createPublicClient } from "@/lib/supabase/public";

export type PublicCountry = { code: string; name: string };

/**
 * Only countries with real fact-checked depth are surfaced publicly — the
 * site is being brought up one country at a time, starting with Australia
 * (see PROJECT_STATUS.md's 2026-08-27 country-sweep note). `is_launched`
 * gates this everywhere the public site lists/filters by country.
 */
export async function listPublicCountries(): Promise<PublicCountry[]> {
  const supabase = createPublicClient(["countries:list"]);
  const { data, error } = await supabase
    .from("countries")
    .select("code, name")
    .eq("is_launched", true)
    .order("name");
  if (error) throw error;
  return data ?? [];
}
