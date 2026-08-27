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

  // Always filter via a single .or() call (rather than branching between
  // .or() and .ilike()) so both code paths chain the exact same builder
  // methods — mixing them here confuses supabase-js's generic inference
  // and collapses `programs.data`'s element type to `never`.
  const programFilter = subjectIds.length
    ? `name.ilike.${like},subject_id.in.(${subjectIds.join(",")})`
    : `name.ilike.${like}`;

  const programsQuery = supabase
    .from("programs")
    .select(
      "id, name, university:universities!inner(slug, name, country:countries!inner(is_launched)), subject:subjects(name)",
    )
    .eq("status", "published")
    .eq("university.country.is_launched", true)
    .or(programFilter)
    .order("name")
    .limit(20);

  const [universities, guides, programs] = await Promise.all([
    supabase
      .from("universities")
      .select("slug, name, city, country:countries!inner(is_launched)")
      .eq("status", "published")
      .eq("country.is_launched", true)
      .ilike("name", like)
      .order("name")
      .limit(20),
    supabase
      .from("guides")
      .select("slug, title, category, country:countries(is_launched)")
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

  // The hand-written Database type (src/lib/supabase/types.ts) leaves every
  // table's `Relationships` empty, so supabase-js can't infer embedded-select
  // shapes like `university:universities(...)` and types `.data` as `never`.
  // Every other query in this codebase casts through `unknown` for the same
  // reason (see public-programs.ts, public-universities.ts).
  const programRows = (programs.data ?? []) as unknown as {
    id: string;
    name: string;
    university: { slug: string; name: string } | null;
    subject: { name: string } | null;
  }[];

  // Guides are only country-scoped when they carry a country_id — global
  // guides (country: null) are always shown; scoped ones are hidden until
  // that country launches.
  const guideRows = (guides.data ?? []) as unknown as {
    slug: string;
    title: string;
    category: string;
    country: { is_launched: boolean } | null;
  }[];

  return {
    universities: universities.data ?? [],
    guides: guideRows
      .filter((g) => !g.country || g.country.is_launched)
      .map((g) => ({ slug: g.slug, title: g.title, category: g.category })),
    programs: programRows.map((p) => ({
      id: p.id,
      name: p.name,
      universitySlug: p.university?.slug ?? "",
      universityName: p.university?.name ?? "",
      subjectName: p.subject?.name ?? null,
    })),
  };
}
