import { createPublicClient } from "@/lib/supabase/public";

export async function getHomepageStats() {
  const supabase = createPublicClient(["universities:list", "deadlines:list"]);

  const [universities, deadlines] = await Promise.all([
    supabase
      .from("universities")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("deadlines")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
  ]);

  if (universities.error) throw universities.error;
  if (deadlines.error) throw deadlines.error;

  return {
    universityCount: universities.count ?? 0,
    deadlineCount: deadlines.count ?? 0,
  };
}
