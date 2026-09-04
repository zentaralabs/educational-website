import { createPublicClient } from "@/lib/supabase/public";
import { listPublishedSubjects } from "@/lib/queries/public-subjects";
import { ORIGIN_COUNTRIES, ORIGIN_COUNTRY_SLUGS } from "@/lib/origin-countries";
import { CITY_COSTS } from "@/lib/cities";

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
  visas: { slug: string; code: string; name: string }[];
  scholarships: { slug: string; name: string; scope: string }[];
  blogPosts: { slug: string; title: string }[];
  /** Fields of study, e.g. "Nursing" → /study/nursing. */
  subjects: { slug: string; name: string }[];
  /** Applying-from-<country> hubs, e.g. "Nepal" → /international/nepal. */
  originCountries: { slug: string; name: string }[];
  /** Cost-of-living city pages, e.g. "Melbourne" → /cost-of-living/melbourne. */
  cities: { slug: string; name: string; state: string }[];
};

const EMPTY: SearchResults = {
  universities: [],
  guides: [],
  programs: [],
  visas: [],
  scholarships: [],
  blogPosts: [],
  subjects: [],
  originCountries: [],
  cities: [],
};

// Filler words that carry no signal in a "what do I want to study" query.
// Deliberately does NOT strip domain nouns like "computer" or "nursing".
const STOPWORDS = new Set([
  "i", "a", "an", "the", "to", "of", "for", "in", "on", "at", "by", "as",
  "my", "me", "we", "us", "im", "is", "are", "am", "be", "and", "or", "but",
  "want", "wanna", "wish", "like", "need", "looking", "look", "find", "get",
  "study", "studying", "studies", "learn", "learning", "pursue", "take",
  "apply", "applying", "application", "applications", "admission", "admissions",
  "enrol", "enroll", "join", "start",
  "how", "what", "where", "when", "which", "who", "do", "does", "can", "should",
  "would", "about", "into", "with", "from", "that", "this",
  "university", "universities", "uni", "college", "colleges", "school",
  "course", "courses", "degree", "degrees", "program", "programme", "programs",
  "programmes", "major", "majors", "please", "somewhere", "anywhere",
  // Degree-level words carry no signal on their own and match every
  // "Graduate Certificate / Graduate Diploma" row, drowning out a specific
  // hit like "485 graduate visa". "bachelor"/"master" are kept: they do
  // usefully narrow a program search.
  "graduate", "postgraduate", "undergraduate",
]);

/** Split a natural-language query into the meaningful search tokens. */
function tokenize(q: string): string[] {
  const raw = q
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const kept = raw.filter(
    (t) => !STOPWORDS.has(t) && (t.length >= 3 || /^\d+$/.test(t)),
  );
  // Fall back to the raw words if stopword removal ate everything.
  const tokens = kept.length ? kept : raw;
  return [...new Set(tokens)].slice(0, 6);
}

/** PostgREST `.or()` string: any column ilike any token. */
function orIlike(columns: string[], tokens: string[]): string {
  return tokens
    .flatMap((t) => columns.map((c) => `${c}.ilike.%${t}%`))
    .join(",");
}

/** Score a row by how many distinct tokens appear in its text. */
function score(text: string, tokens: string[]): number {
  const lower = text.toLowerCase();
  return tokens.reduce((n, t) => (lower.includes(t) ? n + 1 : n), 0);
}

export async function searchSite(query: string): Promise<SearchResults> {
  const q = query.trim();
  if (!q) return EMPTY;
  const tokens = tokenize(q);
  if (tokens.length === 0) return EMPTY;

  const supabase = createPublicClient();

  // Subjects are a controlled vocabulary — match any token so "computer
  // science degree" still finds the "Computer Science" subject and, through
  // it, every relevant program.
  const subjectMatches = await supabase
    .from("subjects")
    .select("id, name")
    .or(orIlike(["name"], tokens));
  if (subjectMatches.error) throw subjectMatches.error;
  const subjectIds = (subjectMatches.data ?? []).map((s) => s.id);

  const programFilter = subjectIds.length
    ? `${orIlike(["name"], tokens)},subject_id.in.(${subjectIds.join(",")})`
    : orIlike(["name"], tokens);

  const [universities, guides, programs, visas, scholarships, blogPosts, subjects] =
    await Promise.all([
      supabase
        .from("universities")
        .select("slug, name, city, popular_majors, country:countries!inner(is_launched)")
        .eq("status", "published")
        .eq("country.is_launched", true)
        .or(orIlike(["name", "city"], tokens))
        .limit(40),
      supabase
        .from("guides")
        .select("slug, title, category, excerpt, country:countries(is_launched)")
        .eq("status", "published")
        .neq("category", "comparison")
        .or(orIlike(["title", "excerpt"], tokens))
        .limit(40),
      supabase
        .from("programs")
        .select(
          "id, name, university:universities!inner(slug, name, country:countries!inner(is_launched)), subject:subjects(name)",
        )
        .eq("status", "published")
        .eq("university.country.is_launched", true)
        .or(programFilter)
        .limit(60),
      supabase
        .from("visa_subclasses")
        .select("slug, code, name, short_description")
        .eq("status", "published")
        .or(orIlike(["name", "code", "short_description", "category"], tokens))
        .limit(20),
      supabase
        .from("scholarships")
        .select("slug, name, scope, description, country:countries(is_launched)")
        .eq("status", "published")
        .not("slug", "is", null)
        .or(orIlike(["name", "description"], tokens))
        .limit(20),
      supabase
        .from("blog_posts")
        .select("slug, title, excerpt")
        .eq("status", "published")
        .or(orIlike(["title", "excerpt"], tokens))
        .limit(20),
      // Subjects and universities/programs share the wedge: someone typing
      // "nursing" wants the subject hub as much as any one program.
      listPublishedSubjects(),
    ]);

  for (const r of [universities, guides, programs, visas, scholarships, blogPosts]) {
    if (r.error) throw r.error;
  }

  const uniRows = (universities.data ?? []) as unknown as {
    slug: string;
    name: string;
    city: string | null;
    popular_majors: string[] | null;
  }[];
  const programRows = (programs.data ?? []) as unknown as {
    id: string;
    name: string;
    university: { slug: string; name: string } | null;
    subject: { name: string } | null;
  }[];
  const guideRows = (guides.data ?? []) as unknown as {
    slug: string;
    title: string;
    category: string;
    excerpt: string | null;
    country: { is_launched: boolean } | null;
  }[];
  const visaRows = (visas.data ?? []) as unknown as {
    slug: string;
    code: string;
    name: string;
    short_description: string | null;
  }[];
  const scholarshipRows = (scholarships.data ?? []) as unknown as {
    slug: string;
    name: string;
    scope: string;
    description: string | null;
    country: { is_launched: boolean } | null;
  }[];
  const blogRows = (blogPosts.data ?? []) as unknown as {
    slug: string;
    title: string;
    excerpt: string | null;
  }[];

  const rank = <T>(rows: T[], text: (r: T) => string, limit: number): T[] => {
    const scored = rows
      .map((r) => ({ r, s: score(text(r), tokens) }))
      .filter((x) => x.s > 0);
    const maxScore = scored.reduce((m, x) => Math.max(m, x.s), 0);
    // If some rows match multiple query words, drop the ones that only
    // clipped a single common word (e.g. "science" alone for a "computer
    // science" query).
    const minKeep = maxScore >= 2 ? Math.max(2, maxScore - 1) : 1;
    return scored
      .filter((x) => x.s >= minKeep)
      .sort((a, b) => b.s - a.s)
      .slice(0, limit)
      .map((x) => x.r);
  };

  return {
    universities: rank(
      uniRows,
      (u) => `${u.name} ${u.city ?? ""} ${(u.popular_majors ?? []).join(" ")}`,
      12,
    ).map((u) => ({ slug: u.slug, name: u.name, city: u.city })),
    guides: rank(
      guideRows.filter((g) => !g.country || g.country.is_launched),
      (g) => `${g.title} ${g.excerpt ?? ""}`,
      12,
    ).map((g) => ({ slug: g.slug, title: g.title, category: g.category })),
    programs: rank(
      programRows,
      (p) => `${p.name} ${p.subject?.name ?? ""} ${p.university?.name ?? ""}`,
      20,
    ).map((p) => ({
      id: p.id,
      name: p.name,
      universitySlug: p.university?.slug ?? "",
      universityName: p.university?.name ?? "",
      subjectName: p.subject?.name ?? null,
    })),
    visas: rank(
      visaRows,
      (v) => `${v.name} ${v.code} ${v.short_description ?? ""}`,
      8,
    ).map((v) => ({ slug: v.slug, code: v.code, name: v.name })),
    scholarships: rank(
      scholarshipRows.filter((s) => !s.country || s.country.is_launched),
      (s) => `${s.name} ${s.description ?? ""}`,
      10,
    ).map((s) => ({ slug: s.slug, name: s.name, scope: s.scope })),
    blogPosts: rank(blogRows, (b) => `${b.title} ${b.excerpt ?? ""}`, 8).map(
      (b) => ({ slug: b.slug, title: b.title }),
    ),
    subjects: rank(subjects, (s) => s.name, 8).map((s) => ({
      slug: s.slug,
      name: s.name,
    })),
    // Config-driven, not a DB round trip: filter in memory the same way the
    // DB queries above filter with `ilike`. Named `originCountries`, not
    // `countries`, to keep it distinct from the `countries` DB table used
    // everywhere else in this file for the destination country.
    originCountries: rank(
      ORIGIN_COUNTRY_SLUGS.map((slug) => ORIGIN_COUNTRIES[slug]),
      (c) => `${c.name} ${c.demonym}`,
      8,
    ).map((c) => ({ slug: c.slug, name: c.name })),
    cities: rank(CITY_COSTS, (c) => `${c.name} ${c.state}`, 8).map((c) => ({
      slug: c.slug,
      name: c.name,
      state: c.state,
    })),
  };
}
