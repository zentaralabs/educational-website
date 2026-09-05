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
        pages: [],
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
  const total =
    results.pages.length +
    results.universities.length +
    results.guides.length +
    results.programs.length +
    results.visas.length +
    results.scholarships.length +
    results.blogPosts.length +
    results.subjects.length +
    results.originCountries.length +
    results.cities.length;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 pt-16 pb-16 text-center">
      <h1 className="font-display text-4xl font-semibold text-ink text-balance sm:text-5xl">
        Need help? We&rsquo;re here
      </h1>
      <p className="mt-4 font-body text-lg text-slate text-balance">
        Search Australian universities, programs, visas, scholarships, and
        guides.
      </p>

      <div className="mt-8">
        <SearchBar defaultValue={q} autoFocus variant="pill" />
      </div>

      <div className="text-left">
      {q.trim() && (
        <p className="mt-6 font-body text-sm text-slate">
          {total} result{total === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
        </p>
      )}

      {results.pages.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
            Tools &amp; pages
          </h2>
          <ul className="flex flex-col gap-3">
            {results.pages.map((p) => (
              <li key={p.slug} className="border-b border-ink/10 pb-3">
                <Link
                  href={p.href}
                  className="font-body text-base text-ink hover:underline"
                >
                  {p.name}
                </Link>
                <p className="mt-0.5 text-sm text-slate">{p.description}</p>
              </li>
            ))}
          </ul>
        </section>
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

      {results.subjects.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
            Fields of study
          </h2>
          <ul className="flex flex-col gap-3">
            {results.subjects.map((s) => (
              <li key={s.slug} className="border-b border-ink/10 pb-3">
                <Link
                  href={`/study/${s.slug}`}
                  className="font-body text-base text-ink hover:underline"
                >
                  {s.name}
                </Link>
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

      {results.originCountries.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
            Applying from
          </h2>
          <ul className="flex flex-col gap-3">
            {results.originCountries.map((c) => (
              <li key={c.slug} className="border-b border-ink/10 pb-3">
                <Link
                  href={`/international/${c.slug}`}
                  className="font-body text-base text-ink hover:underline"
                >
                  Study in Australia from {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {results.cities.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-body text-xs font-semibold tracking-wide text-slate uppercase">
            Cost of living
          </h2>
          <ul className="flex flex-col gap-3">
            {results.cities.map((c) => (
              <li key={c.slug} className="border-b border-ink/10 pb-3">
                <Link
                  href={`/cost-of-living/${c.slug}`}
                  className="font-body text-base text-ink hover:underline"
                >
                  {c.name}
                </Link>
                <p className="mt-0.5 text-sm text-slate">{c.state}</p>
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
      </div>
    </main>
  );
}
