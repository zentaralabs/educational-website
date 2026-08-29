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

export async function getDatasetStats() {
  const supabase = createPublicClient([
    "universities:list",
    "deadlines:list",
    "scholarships:list",
    "visa_subclasses:list",
  ]);

  const [universities, deadlines, scholarships, visas] =
    await Promise.all([
      supabase
        .from("universities")
        .select("id, country:countries!inner(is_launched)", {
          count: "exact",
          head: true,
        })
        .eq("status", "published")
        .eq("country.is_launched", true),
      supabase
        .from("deadlines")
        .select(
          "id, university:universities!inner(country:countries!inner(is_launched))",
          { count: "exact", head: true },
        )
        .eq("status", "published")
        .eq("university.country.is_launched", true),
      supabase
        .from("scholarships")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("visa_subclasses")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
    ]);

  for (const r of [universities, deadlines, scholarships, visas]) {
    if (r.error) throw r.error;
  }

  return {
    universityCount: universities.count ?? 0,
    deadlineCount: deadlines.count ?? 0,
    scholarshipCount: scholarships.count ?? 0,
    visaCount: visas.count ?? 0,
  };
}
