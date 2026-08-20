import { createPublicClient } from "@/lib/supabase/public";

export type SearchResults = {
  universities: { slug: string; name: string; city: string | null }[];
  guides: { slug: string; title: string; category: string }[];
  programs: {
    id: string;
    name: string;
    universitySlug: string;
    universityName: string;
    subjectName: string | null;
  }[];
};

// Scholarships aren't included — there's no public scholarship detail page
// to link a result to yet (they're only shown embedded on university
// profiles). Add them here once that page exists.
export async function searchSite(query: string): Promise<SearchResults> {
  const q = query.trim();
  if (!q) return { universities: [], guides: [], programs: [] };

  const supabase = createPublicClient();
  const like = `%${q}%`;

  // Subject search is exact-ish (ilike against the controlled vocabulary),
  // so a query like "computer science" matches the subjects row directly —
  // this is what lets programs surface even when the program's own name
  // is something like "Master of Computer Science" rather than a literal
  // match on "computer science" alone (which it also would, via the OR below).
  const subjectMatches = await supabase
    .from("subjects")
    .select("id")
    .ilike("name", like);

  if (subjectMatches.error) throw subjectMatches.error;
  const subjectIds = subjectMatches.data?.map((s) => s.id) ?? [];

  let programsQuery = supabase
    .from("programs")
    .select(
      "id, name, university:universities(slug, name), subject:subjects(name)",
    )
    .eq("status", "published")
    .order("name")
    .limit(20);

  programsQuery = subjectIds.length
    ? programsQuery.or(
        `name.ilike.${like},subject_id.in.(${subjectIds.join(",")})`,
      )
    : programsQuery.ilike("name", like);

  const [universities, guides, programs] = await Promise.all([
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
    programsQuery,
  ]);

  if (universities.error) throw universities.error;
  if (guides.error) throw guides.error;
  if (programs.error) throw programs.error;

  return {
    universities: universities.data ?? [],
    guides: guides.data ?? [],
    programs: (programs.data ?? []).map((p) => {
      // Supabase types these embedded relations as arrays even for a
      // to-one join; university_id/subject_id are both NOT NULL-ish here
      // (subject_id is nullable in schema, university_id isn't), so guard
      // defensively rather than assume shape.
      const university = Array.isArray(p.university)
        ? p.university[0]
        : p.university;
      const subject = Array.isArray(p.subject) ? p.subject[0] : p.subject;
      return {
        id: p.id,
        name: p.name,
        universitySlug: university?.slug ?? "",
        universityName: university?.name ?? "",
        subjectName: subject?.name ?? null,
      };
    }),
  };
}
