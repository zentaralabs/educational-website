import { createPublicClient } from "@/lib/supabase/public";

export type SearchResults = {
  universities: { slug: string; name: string; city: string | null }[];
  guides: { slug: string; title: string; category: string }[];
};

// Scholarships aren't included — there's no public scholarship detail page
// to link a result to yet (they're only shown embedded on university
// profiles). Add them here once that page exists.
export async function searchSite(query: string): Promise<SearchResults> {
  const q = query.trim();
  if (!q) return { universities: [], guides: [] };

  const supabase = createPublicClient();
  const like = `%${q}%`;

  const [universities, guides] = await Promise.all([
    supabase
      .from("universities")
      .select("slug, name, city")
      .eq("status", "published")
      .ilike("name", like)
      .order("name")
      .limit(20),
    supabase
      .from("guides")
      .select("slug, title, category")
      .eq("status", "published")
      .neq("category", "comparison")
      .ilike("title", like)
      .order("title")
      .limit(20),
  ]);

  if (universities.error) throw universities.error;
  if (guides.error) throw guides.error;

  return {
    universities: universities.data ?? [],
    guides: guides.data ?? [],
  };
}
