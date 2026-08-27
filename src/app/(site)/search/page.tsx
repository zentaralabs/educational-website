import Link from "next/link";
import { SearchBar } from "@/components/site/SearchBar";
import { searchSite } from "@/lib/queries/public-search";

export const metadata = {
  title: "Search",
  description:
    "Search universities, programs, guides, visa subclasses, and scholarships.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = q.trim()
    ? await searchSite(q)
    : {
        universities: [],
        guides: [],
        programs: [],
        visas: [],
        scholarships: [],
        blogPosts: [],
      };
  const total =
    results.universities.length +
    results.guides.length +
    results.programs.length +
    results.visas.length +
    results.scholarships.length +
    results.blogPosts.length;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 pt-8 pb-16">
      <h1 className="font-display text-3xl font-semibold text-ink text-balance">
        Search
      </h1>

      <div className="mt-6">
        <SearchBar defaultValue={q} />
      </div>

      {q.trim() && (
        <p className="mt-6 font-body text-sm text-slate">
          {total} result{total === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
        </p>
      )}

      {results.universities.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
            Universities
          </h2>
          <ul className="flex flex-col gap-3">
            {results.universities.map((u) => (
              <li key={u.slug} className="border-b border-ink/10 pb-3">
                <Link
                  href={`/universities/${u.slug}`}
                  className="font-body text-base text-ink hover:underline"
                >
                  {u.name}
                </Link>
                {u.city && (
                  <p className="mt-0.5 text-sm text-slate">{u.city}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {results.programs.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
            Programs
          </h2>
          <ul className="flex flex-col gap-3">
            {results.programs.map((p) => (
              <li key={p.id} className="border-b border-ink/10 pb-3">
                <Link
                  href={`/universities/${p.universitySlug}`}
                  className="font-body text-base text-ink hover:underline"
                >
                  {p.name}
                </Link>
                <p className="mt-0.5 text-sm text-slate">
                  {p.universityName}
                  {p.subjectName && ` · ${p.subjectName}`}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {results.guides.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
            Guides
          </h2>
          <ul className="flex flex-col gap-3">
            {results.guides.map((g) => (
              <li key={g.slug} className="border-b border-ink/10 pb-3">
                <Link
                  href={`/guides/${g.slug}`}
                  className="font-body text-base text-ink hover:underline"
                >
                  {g.title}
                </Link>
                <p className="mt-0.5 text-sm text-slate">{g.category}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {results.visas.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
            Visas
          </h2>
          <ul className="flex flex-col gap-3">
            {results.visas.map((v) => (
              <li key={v.slug} className="border-b border-ink/10 pb-3">
                <Link
                  href={`/visas/${v.slug}`}
                  className="font-body text-base text-ink hover:underline"
                >
                  {v.name}
                </Link>
                <p className="mt-0.5 text-sm text-slate">Subclass {v.code}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {results.scholarships.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
            Scholarships
          </h2>
          <ul className="flex flex-col gap-3">
            {results.scholarships.map((s) => (
              <li key={s.slug} className="border-b border-ink/10 pb-3">
                <Link
                  href={`/scholarships/${s.slug}`}
                  className="font-body text-base text-ink hover:underline"
                >
                  {s.name}
                </Link>
                <p className="mt-0.5 text-sm text-slate">{s.scope}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {results.blogPosts.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
            Blog
          </h2>
          <ul className="flex flex-col gap-3">
            {results.blogPosts.map((b) => (
              <li key={b.slug} className="border-b border-ink/10 pb-3">
                <Link
                  href={`/blog/${b.slug}`}
                  className="font-body text-base text-ink hover:underline"
                >
                  {b.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {q.trim() && total === 0 && (
        <p className="mt-8 font-body text-sm text-slate">
          No results. Try a different search, or browse the{" "}
          <Link href="/deadlines" className="underline">
            deadline calendar
          </Link>{" "}
          or{" "}
          <Link href="/guides" className="underline">
            guides
          </Link>{" "}
          directly.
        </p>
      )}
    </main>
  );
}
