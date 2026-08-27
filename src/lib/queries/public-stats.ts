import { createPublicClient } from "@/lib/supabase/public";

export async function getHomepageStats() {
  const supabase = createPublicClient(["universities:list", "deadlines:list"]);

  const [universities, deadlines] = await Promise.all([
    supabase
      .from("universities")
      .select("id, country:countries!inner(is_launched)", { count: "exact", head: true })
      .eq("status", "published")
      .eq("country.is_launched", true),
    supabase
      .from("deadlines")
      .select("id, university:universities!inner(country:countries!inner(is_launched))", {
        count: "exact",
        head: true,
      })
      .eq("status", "published")
      .eq("university.country.is_launched", true),
  ]);

  if (universities.error) throw universities.error;
  if (deadlines.error) throw deadlines.error;

  return {
    universityCount: universities.count ?? 0,
    deadlineCount: deadlines.count ?? 0,
  };
}
